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
exports.UpcomingTeamLeavesDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../../models/logger"));
const helper_functions_1 = require("../../utilities/helper.functions");
const bot_controller_1 = require("../../controllers/bot.controller");
const bot_constants_1 = require("../../configs/bot.constants");
const chat_logger_1 = require("../../middleware/chat-logger");
const util = __importStar(require("util"));
const moment_1 = __importDefault(require("moment"));
const associate_services_1 = require("../../services/associate.services");
const hrmart_services_1 = require("../../services/hrmart.services");
const MANAGER_GTSID = 'ManagerGtsId';
const APPROVE_LIST = 'approvalList';
const NAME = 'Name';
const LEAVE_FROM = 'LeaveFrom';
const LEAVE_TO = 'LeaveTo';
const LEAVE_REASON = 'LeaveReason';
class UpcomingTeamLeaves extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!UpcomingTeamLeaves.leaveApproveData)
            UpcomingTeamLeaves.leaveApproveData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.LEAVE_APPROVE_DATA);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.upcomingLeaveSummary.bind(this)]));
    }
    upcomingLeaveSummary(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'upcomingLeaveSummary dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const properties = yield UpcomingTeamLeaves.leaveApproveData.get(step.context, {});
            const email = user.email;
            const gtsid = yield associate_services_1.getGTSID(email);
            properties[MANAGER_GTSID] = gtsid.gts;
            if (!(gtsid && gtsid.gts)) {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.endDialog();
            }
            const managerPendingApprovals = yield hrmart_services_1.GetManagerPendingApprovals(gtsid.gts);
            const managerCancelPendingApprovals = yield hrmart_services_1.GetManagerCancelPendingApprovals(gtsid.gts);
            if (managerPendingApprovals) {
                properties[APPROVE_LIST] = managerPendingApprovals.concat(managerCancelPendingApprovals);
            }
            else
                properties[APPROVE_LIST] = managerCancelPendingApprovals;
            properties[APPROVE_LIST] = yield properties[APPROVE_LIST].filter(function (obj) {
                return obj.ErrorFlag === '0';
            });
            let message = bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.LIST;
            let count = 0;
            if (properties[APPROVE_LIST]) {
                for (const request of properties[APPROVE_LIST]) {
                    if (moment_1.default().isSameOrBefore(moment_1.default(request[LEAVE_TO], 'D-MMM-YYYY'))) {
                        message =
                            message +
                                util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.MESSAGE, request[NAME], request[LEAVE_FROM], request[LEAVE_TO], request[LEAVE_REASON]);
                        count++;
                    }
                }
                yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.TOTAL, message, count));
                yield helper_functions_1.sendRichCard(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.BUTTONS_WITH_HASH);
                return yield step.endDialog();
            }
            else {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.NO_PENDING_APPROVALS);
                return yield step.endDialog();
            }
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
exports.UpcomingTeamLeavesDialog = UpcomingTeamLeaves;
//# sourceMappingURL=upcomingTeamLeaves.dialog.js.map