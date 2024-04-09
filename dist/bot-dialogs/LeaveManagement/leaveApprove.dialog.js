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
exports.LeaveApproveDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const util = __importStar(require("util"));
const moment_1 = __importDefault(require("moment"));
const logger_1 = __importDefault(require("../../models/logger"));
const helper_functions_1 = require("../../utilities/helper.functions");
const bot_constants_1 = require("../../configs/bot.constants");
const bot_controller_1 = require("../../controllers/bot.controller");
const chat_logger_1 = require("../../middleware/chat-logger");
const associate_services_1 = require("../../services/associate.services");
const hrmart_services_1 = require("../../services/hrmart.services");
const optionValidationPrompt_1 = require("../../utilities/optionValidationPrompt");
const APPROVE_LIST = 'approvalList';
const UPCOMING_LEAVE = 'UpcomingLeaves';
const APPROVE_REJECT_LEAVE = 'ApproveRejectLeaves';
const MANAGER_GTSID = 'ManagerGtsId';
const FINAL_APPROVE_DATA = 'finalHRMartApprovalData';
const APPROVE_ALL = 'ApproveAll';
const NAME = 'Name';
const LEAVE_FROM = 'LeaveFrom';
const LEAVE_TO = 'LeaveTo';
const LEAVE_REASON = 'LeaveReason';
const SUCCESS = 'Success';
const HASH = '#';
const CONTAINS_A = '#A#';
const CONTAINS_R = '#R#';
const NEXT = 'Next';
const YES = 'yes';
const NO = 'no';
const INDEX = 'index';
class LeaveApprove extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!LeaveApprove.leaveApproveData)
            LeaveApprove.leaveApproveData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.LEAVE_APPROVE_DATA);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter. dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            // // to add upcomming leave option under leave approval
            // this.leaveApproveOptions.bind(this),
            // this.callSelectedOptionDialog.bind(this)
            this.summaryAndApproveAllApproveIndividuallyOption.bind(this),
            this.approveAllApproveIndividuallyRedirect.bind(this)
        ]));
        // // to add upcomming leave option under leave approval
        // this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.UPCOMING_LEAVE_SUMMARY_AND_APPROVAL_LIST, [
        // 	this.upcomingLeaveSummary.bind(this),
        // 	this.askIfManagerWouldLikeToApprove.bind(this)
        // ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, [
            this.getManagerApprovalsList.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION, [
            this.summaryAndApproveAllApproveIndividuallyOption.bind(this),
            this.approveAllApproveIndividuallyRedirect.bind(this)
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVE_OPTION, [
            this.approveLeaves.bind(this),
            this.callhrMartApprove.bind(this)
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, [
            this.hrMartApprove.bind(this)
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVE_ALL, [
            this.leaveApprovalAll.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.REJECT_LEAVE_REMARKS, [
            this.askToAddRemark.bind(this),
            this.ifYesEnterRemark.bind(this),
            this.saveRemark.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
        this.addDialog(new optionValidationPrompt_1.OptionValidationPrompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
    }
    leaveApproveOptions(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'leaveApproveOptions dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            yield helper_functions_1.sendWithoutFeedback(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.PROMPT);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card('', bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.OPTIONS);
        });
    }
    callSelectedOptionDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'callSelectedOptionDialog dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
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
            yield LeaveApprove.leaveApproveData.set(step.context, properties);
            if (step.result === UPCOMING_LEAVE) {
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.UPCOMING_LEAVE_SUMMARY_AND_APPROVAL_LIST);
            }
            else if (step.result === APPROVE_REJECT_LEAVE) {
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION);
            }
            else {
                return yield step.endDialog();
            }
        });
    }
    upcomingLeaveSummary(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'upcomingLeaveSummary dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            let message = bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.LIST;
            let count = 0;
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
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
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.BUTTONS));
            }
            else {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.NO_PENDING_APPROVALS);
                return yield step.endDialog();
            }
        });
    }
    askIfManagerWouldLikeToApprove(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askIfManagerWouldLikeToApprove dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            if (step.result === APPROVE_REJECT_LEAVE) {
                const initialIndex = 1;
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION);
            }
            else {
                return yield step.endDialog();
            }
        });
    }
    summaryAndApproveAllApproveIndividuallyOption(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'summaryAndApproveAllApproveIndividuallyOption dialog',
                message: step.context.activity.text
            }, step.context.activity);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
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
            yield LeaveApprove.leaveApproveData.set(step.context, properties);
            let message = '*List of all leaves:*\n\n';
            let count = 0;
            for (const request of properties[APPROVE_LIST]) {
                message =
                    message +
                        util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.MESSAGE, request[NAME], request[LEAVE_FROM], request[LEAVE_TO], request[LEAVE_REASON]);
                count++;
            }
            yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.TOTAL, message, count));
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVAL_INDIVIDUAL_OR_ALL.TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVAL_INDIVIDUAL_OR_ALL.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVAL_INDIVIDUAL_OR_ALL.OPTIONS_TO_VALIDATE);
        });
    }
    approveAllApproveIndividuallyRedirect(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'recordOptions',
                message: step.context.activity.text,
            }, step.context.activity);
            if (step.result === 'ApproveIndividually') {
                const initialIndex = 0;
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, { initialIndex });
            }
            else if (step.result === APPROVE_ALL) {
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVE_ALL);
            }
            else {
                yield helper_functions_1.send(step.context, "Invalid selection, click on Leave Management below to start again or say 'Hi' to begin a new conversation.");
                yield helper_functions_1.sendRichCard(step.context, '', bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS);
            }
            return yield step.cancelAllDialogs();
        });
    }
    getManagerApprovalsList(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'getManagerApprovalsList dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
            const { initialIndex } = step.options;
            const request = properties[APPROVE_LIST][initialIndex];
            const index = properties[APPROVE_LIST].indexOf(request);
            const params = { request, index };
            if (request)
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVE_OPTION, params);
            else {
                yield helper_functions_1.send(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.NO_MORE_LEAVES_TO_VIEW);
                yield helper_functions_1.sendRichCardWithoutFeedback(step.context, '', bot_constants_1.GREETING_BUTTONS);
                yield helper_functions_1.sendRichCard(step.context, '', bot_constants_1.SHOW_MORE);
                return yield step.endDialog();
            }
        });
    }
    approveLeaves(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'approveLeaves dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { request, index } = step.options;
            const optionsWithRequestId = [];
            const buttonsWithRequestId = JSON.parse(JSON.stringify(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.BUTTONS));
            const newOptionsObject = JSON.parse(JSON.stringify(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.OPTIONS));
            for (const button of buttonsWithRequestId) {
                if (button.value.includes(HASH)) {
                    button.value = button.value.concat(JSON.stringify(request));
                }
            }
            for (let option of newOptionsObject) {
                if (option.includes(HASH)) {
                    option = option.concat(JSON.stringify(request));
                    optionsWithRequestId.push(option);
                }
                else {
                    optionsWithRequestId.push(option);
                }
            }
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, yield helper_functions_1.card(util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.TEXT, request.Name, request.LeaveFrom, request.LeaveTo, request.LeaveReason, request.NoOfDays), buttonsWithRequestId), optionsWithRequestId);
        });
    }
    callhrMartApprove(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'hrMartApprove dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
            const { request, index } = step.options;
            const initialIndex = index + 1;
            if (step.result.includes(CONTAINS_A) || step.result.includes(CONTAINS_R)) {
                const appRequest = step.result.split(HASH);
                const req = JSON.parse(appRequest[2]);
                properties[FINAL_APPROVE_DATA] = {
                    RequestId: req.RequestID,
                    Name: req.Name,
                    LeaveFrom: req.LeaveFrom,
                    LeaveTo: req.LeaveTo,
                    Status: appRequest[1],
                    FutureCreditStatus: req.FutureCredit,
                    AuthorizedStatus: true,
                    Remarks: '',
                    AppBy: properties[MANAGER_GTSID]
                };
                if (step.result.includes(CONTAINS_A)) {
                    properties[FINAL_APPROVE_DATA].Remarks = bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.APPROVE;
                    yield LeaveApprove.leaveApproveData.set(step.context, properties);
                    return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, { request, initialIndex });
                }
                else if (step.result.includes(CONTAINS_R)) {
                    properties[FINAL_APPROVE_DATA].Remarks = bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.REJECTED;
                    yield LeaveApprove.leaveApproveData.set(step.context, properties);
                    return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.REJECT_LEAVE_REMARKS, { request, initialIndex });
                }
            }
            else if (step.result === NEXT) {
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, { request, initialIndex });
            }
            else {
                return yield step.endDialog();
            }
        });
    }
    askToAddRemark(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askToAddRemark dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, yield helper_functions_1.card(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK.TEXT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK.BUTTONS), bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK.OPTIONS);
        });
    }
    ifYesEnterRemark(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'ifYesEnterRemark dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { request, index } = step.options;
            if (step.result.toLowerCase() === YES) {
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK_IF_YES.TEXT);
            }
            else if (step.result.toLowerCase() === NO) {
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, step.options);
            }
            else {
                return yield step.endDialog();
            }
        });
    }
    saveRemark(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'saveRemark dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { request, index } = step.options;
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
            properties[FINAL_APPROVE_DATA].Remarks = properties[FINAL_APPROVE_DATA].Remarks.concat(step.result);
            yield LeaveApprove.leaveApproveData.set(step.context, properties);
            return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, step.options);
        });
    }
    hrMartApprove(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'hrMartApprove dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { request, initialIndex } = step.options;
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
            try {
                const status = yield hrmart_services_1.AmsEmpLeaveApprove(properties[FINAL_APPROVE_DATA].RequestId, properties[FINAL_APPROVE_DATA].Status, properties[FINAL_APPROVE_DATA].FutureCreditStatus, properties[FINAL_APPROVE_DATA].AuthorizedStatus, properties[FINAL_APPROVE_DATA].Remarks, properties[FINAL_APPROVE_DATA].AppBy);
                if (status === SUCCESS) {
                    // @ts-ignore
                    yield helper_functions_1.sendWithoutFeedback(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_HR_MART_APPROVE.SUCCESS_MESSAGE, properties[FINAL_APPROVE_DATA].Name, properties[FINAL_APPROVE_DATA].LeaveFrom, properties[FINAL_APPROVE_DATA].LeaveTo, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_HR_MART_APPROVE[properties[FINAL_APPROVE_DATA].Status]));
                }
                else {
                    yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.ERROR_FROM_API, JSON.stringify(status)));
                }
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, { initialIndex });
            }
            catch (err) {
                logger_1.default.error({ location: 'hrMartApprove', error: err });
            }
        });
    }
    leaveApprovalAll(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'leaveApproveAll dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield LeaveApprove.leaveApproveData.get(step.context, {});
            try {
                if (properties[APPROVE_LIST].length > 0) {
                    // @ts-ignore
                    for (const element of properties[APPROVE_LIST]) {
                        const status = yield hrmart_services_1.AmsEmpLeaveApprove(element['RequestID'], 'A', element['FutureCredit'], true, 'Approved.', properties[MANAGER_GTSID]);
                        if (status === SUCCESS) {
                            yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_HR_MART_APPROVE
                                .SUCCESS_MESSAGE, element.Name, element.LeaveFrom, element.LeaveTo, 'Approved!'));
                        }
                        else {
                            yield helper_functions_1.send(step.context, util.format(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.ERROR_FROM_API, JSON.stringify(status)));
                        }
                    }
                    yield helper_functions_1.sendWithoutFeedback(step.context, bot_constants_1.LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.MESSAGE_AFTER_APPROVE_ALL);
                    yield helper_functions_1.sendRichCardWithoutFeedback(step.context, '', bot_constants_1.GREETING_BUTTONS);
                    yield helper_functions_1.sendRichCard(step.context, '', bot_constants_1.SHOW_MORE);
                }
                else {
                    yield helper_functions_1.send(step.context, 'No leaves to be viewed.');
                }
                return yield step.cancelAllDialogs();
            }
            catch (err) {
                logger_1.default.error({ location: 'leaveApproveAll', error: err });
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
exports.LeaveApproveDialog = LeaveApprove;
//# sourceMappingURL=leaveApprove.dialog.js.map