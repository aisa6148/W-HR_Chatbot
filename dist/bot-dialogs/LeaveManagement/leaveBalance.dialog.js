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
exports.LeaveBalanceDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../../models/logger"));
const util = __importStar(require("util"));
const bot_constants_1 = require("../../configs/bot.constants");
const chat_logger_1 = require("../../middleware/chat-logger");
const associate_services_1 = require("../../services/associate.services");
const hrmart_services_1 = require("../../services/hrmart.services");
const AL = 'AL';
const SL = 'SL';
const FL = 'FL';
class LeaveBalance extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.leaveBalanceList.bind(this)]));
    }
    leaveBalanceList(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'LeaveBalance dialog',
                message: step.context.activity.text
            }, step.context.activity);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const email = user.email;
            const gtsid = yield associate_services_1.getGTSID(email);
            if (!(gtsid && gtsid.gts)) {
                yield step.context.sendActivity(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.cancelAllDialogs();
            }
            const balanceList = yield hrmart_services_1.GetEmpLeaveBalance(gtsid.gts);
            if (!balanceList) {
                yield step.context.sendActivity(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.cancelAllDialogs();
            }
            let message = bot_constants_1.LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LIST_OF_LEAVES;
            for (const element of balanceList) {
                switch (element.LeaveName) {
                    case AL:
                        message =
                            message +
                                util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LEAVE_BALANCE_TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_TYPES.AL, element.Leavebalance);
                        break;
                    case SL:
                        message =
                            message +
                                util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LEAVE_BALANCE_TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_TYPES.SL, element.Leavebalance);
                        break;
                    case FL:
                        message =
                            message +
                                util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LEAVE_BALANCE_TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_TYPES.FL, element.Leavebalance);
                        break;
                }
            }
            yield step.context.sendActivity(message);
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
exports.LeaveBalanceDialog = LeaveBalance;
//# sourceMappingURL=leaveBalance.dialog.js.map