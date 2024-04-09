"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveCancelDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const util = __importStar(require("util"));
const logger_1 = __importDefault(require("../../models/logger"));
const helper_functions_1 = require("../../utilities/helper.functions");
const bot_constants_1 = require("../../configs/bot.constants");
const bot_controller_1 = require("../../controllers/bot.controller");
const chat_logger_1 = require("../../middleware/chat-logger");
const associate_services_1 = require("../../services/associate.services");
const hrmart_services_1 = require("../../services/hrmart.services");
const optionValidationPrompt_1 = require("../../utilities/optionValidationPrompt");
const REQUEST_ID = 'requestId';
const REQUEST_ID_BUTTON_VALUE = 'Req Id: ';
const SELECTED_REQUEST_ID = 'selectedRequestId';
const CANCEL_REASON = 'cancelReason';
const SUCCESS = 'Success';
const YES = 'yes';
class LeaveCancel extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!LeaveCancel.leaveCancelData)
            LeaveCancel.leaveCancelData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.LEAVE_CANCEL_DATA);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.listOfPendingLeaves.bind(this),
            this.cancelReason.bind(this),
            this.cancelConfirmation.bind(this),
            this.callHrMartAPI.bind(this)
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_CANCEL, [this.hrmartCancel.bind(this)]));
        this.addDialog(new optionValidationPrompt_1.OptionValidationPrompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
    }
    listOfPendingLeaves(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'listOfPendingLeaves dialog',
                message: step.context.activity.text
            }, step.context.activity);
            // get user's GTS Id
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const email = user.email;
            const gtsid = yield associate_services_1.getGTSID(email);
            if (!(gtsid && gtsid.gts)) {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.endDialog();
            }
            const employeeDetails = yield hrmart_services_1.GetIndividiualEmployeesInfo(gtsid.gts);
            const managerGtsId = employeeDetails.Manager;
            logger_1.default.debug(managerGtsId);
            const managerPendingApprovals = yield hrmart_services_1.GetManagerPendingApprovals(managerGtsId);
            logger_1.default.debug(managerPendingApprovals);
            const properties = yield LeaveCancel.leaveCancelData.get(step.context, {});
            properties[REQUEST_ID] = [];
            if (managerPendingApprovals === null) {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.NO_PENDING_LEAVES);
                return yield step.endDialog();
            }
            else {
                const leaveList = [];
                if (managerPendingApprovals.find(r => r.AssociateID === gtsid.gts)) {
                    yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.CANCEL_INTRO);
                }
                for (const req of managerPendingApprovals) {
                    if (req.AssociateID === gtsid.gts) {
                        leaveList.push(req);
                        properties[REQUEST_ID].push(req.RequestID);
                        yield LeaveCancel.leaveCancelData.set(step.context, properties);
                        yield helper_functions_1.sendRichCard(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.PENDING_LEAVES, 
                        // @ts-ignore
                        bot_constants_1.LEAVE_MANAGEMENT.LEAVE_TYPES[req.LeaveType], req.LeaveFrom, req.LeaveTo, req.RequestedOn, req.NoOfDays, req.LeaveReason, req.Status), [{ display: REQUEST_ID_BUTTON_VALUE + req.RequestID, value: req.RequestID }]);
                    }
                }
                if (leaveList.length > 0) {
                    return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.BUTTONS), properties[REQUEST_ID]);
                }
                else {
                    yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.NO_PENDING_LEAVES);
                    return yield step.endDialog();
                }
            }
        });
    }
    cancelReason(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'cancelReason dialog',
                message: step.context.activity.text
            }, step.context.activity);
            const properties = yield LeaveCancel.leaveCancelData.get(step.context, {});
            properties[SELECTED_REQUEST_ID] = step.result;
            yield LeaveCancel.leaveCancelData.set(step.context, properties);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_REASON.PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_REASON.BUTTONS));
        });
    }
    cancelConfirmation(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'cancelConfirmation dialog',
                message: step.context.activity.text
            }, step.context.activity);
            const properties = yield LeaveCancel.leaveCancelData.get(step.context, {});
            properties[CANCEL_REASON] = step.result;
            yield LeaveCancel.leaveCancelData.set(step.context, properties);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card(util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_CONFIRMATION.PROMPT, properties[SELECTED_REQUEST_ID], properties[CANCEL_REASON]), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_CONFIRMATION.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_CONFIRMATION.OPTIONS);
        });
    }
    callHrMartAPI(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'callHrMartAPI dialog',
                message: step.context.activity.text
            }, step.context.activity);
            if (step.result.toLowerCase() === YES) {
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_CANCEL);
            }
            else {
                return yield step.cancelAllDialogs();
            }
        });
    }
    hrmartCancel(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'hrmartCancel dialog',
                message: step.context.activity.text
            }, step.context.activity);
            const properties = yield LeaveCancel.leaveCancelData.get(step.context, {});
            const status = yield hrmart_services_1.AmsEmpLeaveCancelApply(properties[SELECTED_REQUEST_ID], properties[CANCEL_REASON]);
            if (status === SUCCESS) {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LEAVE_HR_MART_CANCEL.SUCCESS_MESSAGE);
                yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LEAVE_HR_MART_CANCEL.ADDITIONAL_OPTION_PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS);
            }
            else {
                yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LEAVE_HR_MART_CANCEL.ERROR_FROM_API, status));
            }
            return yield step.cancelAllDialogs();
        });
    }
    run(turnContext, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(turnContext);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
}
exports.LeaveCancelDialog = LeaveCancel;
//# sourceMappingURL=leaveCancel.dialog.js.map