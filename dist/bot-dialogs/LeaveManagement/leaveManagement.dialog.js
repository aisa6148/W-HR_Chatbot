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
exports.LeaveManagementDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../../models/logger"));
const util = __importStar(require("util"));
const helper_functions_1 = require("../../utilities/helper.functions");
const bot_constants_1 = require("../../configs/bot.constants");
const chat_logger_1 = require("../../middleware/chat-logger");
const associate_services_1 = require("../../services/associate.services");
const mailer_services_1 = __importDefault(require("../../services/mailer.services"));
const config_1 = __importDefault(require("../../configs/config"));
class LeaveManagement extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.LeaveManagement.bind(this)]));
    }
    LeaveManagement(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'LeaveManagement dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const email = user.email;
            const gtsid = yield associate_services_1.getGTSID(email);
            if (gtsid && gtsid.gts) {
                const checkIfManager = (yield associate_services_1.isManager(gtsid.gts)) > 0 ? true : false;
                if (checkIfManager && config_1.default.enableLeaveApproval) {
                    yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_OPTIONS_FOR_MANAGER_TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG
                        .LEAVE_MANAGEMENT_FOR_MANAGER_OPTIONS_BUTTONS);
                }
                else {
                    yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_OPTIONS_TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_OPTIONS_BUTTONS);
                }
            }
            else {
                yield step.context.sendActivity(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                yield mailer_services_1.default.mailOnUndefinedGTSID(email, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.USER_UNAVAILABLE_EMAIL_TO_DEV, email));
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
exports.LeaveManagementDialog = LeaveManagement;
//# sourceMappingURL=leaveManagement.dialog.js.map