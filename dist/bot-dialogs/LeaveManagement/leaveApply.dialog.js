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
exports.LeaveApplyDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const moment = require("moment");
const util = __importStar(require("util"));
const logger_1 = __importDefault(require("../../models/logger"));
const helper_functions_1 = require("../../utilities/helper.functions");
const bot_constants_1 = require("../../configs/bot.constants");
const bot_controller_1 = require("../../controllers/bot.controller");
const chat_logger_1 = require("../../middleware/chat-logger");
const associate_services_1 = require("../../services/associate.services");
const hrmart_services_1 = require("../../services/hrmart.services");
const optionValidationPrompt_1 = require("../../utilities/optionValidationPrompt");
const LEAVE_TYPE = 'leaveType';
const LEAVE_FROM_DATE = 'leaveFromDate';
const LEAVE_FROM_PERIOD = 'leaveFromPeriod';
const LEAVE_TO_DATE = 'leaveToDate';
const LEAVE_TO_PERIOD = 'leaveToPeriod';
const LEAVE_REASON = 'leaveReason';
const SL = 'SL';
const AL = 'AL';
const SICK_LEAVE = 'Sick/Casual Leave';
const ANNUAL_LEAVE = 'Annual Leave';
const FD = 'FD';
const SH = 'SH';
const FH = 'FH';
const SUCCESS = 'Success';
const DATE_FORMAT = 'DD-MMM';
const YEAR = 'YYYY';
class LeaveApply extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!LeaveApply.hrMartLeaveData)
            LeaveApply.hrMartLeaveData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.LEAVE_APPLY_HR_MART_DATA);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.askLeaveType.bind(this),
            this.askLeaveFromDate.bind(this),
            this.askLeaveFromPeriod.bind(this),
            this.askLeaveToDate.bind(this),
            this.askLeaveToPeriod.bind(this),
            this.askLeaveReason.bind(this),
            this.callHRMartAPI.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_APPLY, [this.hrMartApply.bind(this)]));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.DateTimePrompt(bot_constants_1.BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT));
        this.addDialog(new optionValidationPrompt_1.OptionValidationPrompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
    }
    askLeaveType(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askLeaveType dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TYPE.PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TYPE.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TYPE.OPTIONS);
        });
    }
    askLeaveFromDate(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askLeaveFromDate dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            properties[LEAVE_TYPE] = step.result;
            yield LeaveApply.hrMartLeaveData.set(step.context, properties);
            const TYPE = properties[LEAVE_TYPE] === SL ? SICK_LEAVE : ANNUAL_LEAVE;
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT, helper_functions_1.card(util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_DATE.PROMPT, TYPE), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_DATE.BUTTONS));
        });
    }
    askLeaveFromPeriod(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askLeaveFromPeriod dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            properties[LEAVE_FROM_DATE] =
                moment(step.result[0].value).format(DATE_FORMAT) + '-' + moment().format(YEAR);
            yield LeaveApply.hrMartLeaveData.set(step.context, properties);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card(util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_PERIOD.PROMPT, properties[LEAVE_FROM_DATE]), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_PERIOD.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_PERIOD.OPTIONS);
        });
    }
    askLeaveToDate(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askLeaveToDate dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            properties[LEAVE_FROM_PERIOD] = step.result;
            yield LeaveApply.hrMartLeaveData.set(step.context, properties);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT, helper_functions_1.card(util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_DATE.PROMPT), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_DATE.BUTTONS));
        });
    }
    askLeaveToPeriod(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askLeaveToPeriod dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            properties[LEAVE_TO_DATE] =
                moment(step.result[0].value).format(DATE_FORMAT) + '-' + moment().format(YEAR);
            yield LeaveApply.hrMartLeaveData.set(step.context, properties);
            if (moment(properties[LEAVE_FROM_DATE]).isAfter(moment(properties[LEAVE_TO_DATE]))) {
                yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_DATE.IF_FROM_DATE_AFTER_TO_DATE, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS);
                return yield step.cancelAllDialogs();
            }
            else if (properties[LEAVE_FROM_DATE] === properties[LEAVE_TO_DATE]) {
                properties[LEAVE_TO_PERIOD] = properties[LEAVE_FROM_PERIOD];
                yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.SEND, properties[LEAVE_TO_DATE]));
                return yield step.next();
            }
            else {
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card(util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.PROMPT, properties[LEAVE_TO_DATE]), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.OPTIONS);
            }
        });
    }
    askLeaveReason(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askLeaveReason dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            if (properties[LEAVE_TO_PERIOD] === undefined) {
                properties[LEAVE_TO_PERIOD] = step.result;
                yield LeaveApply.hrMartLeaveData.set(step.context, properties);
            }
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_REASON.PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_REASON.BUTTONS));
        });
    }
    callHRMartAPI(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'callHRMartAPI dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            properties[LEAVE_REASON] = step.result;
            yield LeaveApply.hrMartLeaveData.set(step.context, properties);
            return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_APPLY);
        });
    }
    hrMartApply(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'hrMartApply dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const email = user.email;
            let currentBalance;
            const gtsid = yield associate_services_1.getGTSID(email);
            if (!(gtsid && gtsid.gts)) {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.cancelAllDialogs();
            }
            const balanceList = yield hrmart_services_1.GetEmpLeaveBalance(gtsid.gts);
            if (!balanceList) {
                // unnecessary send without feedback
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.cancelAllDialogs();
            }
            const properties = yield LeaveApply.hrMartLeaveData.get(step.context, {});
            let appliedDays = 0;
            if (properties[LEAVE_TYPE] === SL)
                currentBalance = balanceList[1].Leavebalance;
            if (properties[LEAVE_TYPE] === AL)
                currentBalance = balanceList[0].Leavebalance;
            logger_1.default.debug({ location: 'hrMartApply', currentBalance });
            if (properties[LEAVE_FROM_PERIOD] === FH)
                appliedDays = appliedDays + 0.5;
            if (properties[LEAVE_FROM_DATE] != properties[LEAVE_TO_DATE]) {
                if (properties[LEAVE_TO_DATE] === SH || properties[LEAVE_TO_DATE] === FH)
                    appliedDays = appliedDays + 0.5;
            }
            if (properties[LEAVE_FROM_PERIOD] === FD)
                appliedDays = appliedDays + 1;
            if (properties[LEAVE_TO_PERIOD] === FD)
                appliedDays = appliedDays + 1;
            const fromDate = moment(properties[LEAVE_FROM_DATE], DATE_FORMAT);
            const toDate = moment(properties[LEAVE_TO_DATE], DATE_FORMAT);
            const datediff = toDate.diff(fromDate, 'days');
            appliedDays = appliedDays + datediff - 1;
            const balanceAfterApply = currentBalance - appliedDays;
            if (balanceAfterApply <= 0) {
                yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.LEAVES_EXHAUSTED, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS);
                return yield step.endDialog();
            }
            else {
                const status = yield hrmart_services_1.AmsEmpLeaveApply(gtsid.gts, properties[LEAVE_TYPE], properties[LEAVE_FROM_DATE], properties[LEAVE_FROM_PERIOD], properties[LEAVE_TO_DATE], properties[LEAVE_TO_PERIOD], properties[LEAVE_REASON], gtsid.gts, 'E', '', '');
                if (status === SUCCESS) {
                    yield helper_functions_1.sendWithoutFeedback(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.SUCCESS_MESSAGE, 
                    // @ts-ignore
                    bot_constants_1.LEAVE_MANAGEMENT.LEAVE_TYPES[properties[LEAVE_TYPE]], properties[LEAVE_FROM_DATE], properties[LEAVE_TO_DATE]));
                    yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY
                        .ADDITIONAL_OPTION_PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS);
                }
                else {
                    yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.ERROR_FROM_API, status));
                }
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
exports.LeaveApplyDialog = LeaveApply;
//# sourceMappingURL=leaveApply.dialog.js.map