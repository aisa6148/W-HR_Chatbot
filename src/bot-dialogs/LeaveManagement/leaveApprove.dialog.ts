import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
	ComponentDialog,
	WaterfallDialog,
	WaterfallStepContext,
	DialogTurnResult,
	DialogSet,
	DialogTurnStatus,
	TextPrompt,
} from 'botbuilder-dialogs';
import * as util from 'util';
import moment from 'moment';
import logger from '../../models/logger';
import { card, send, sendWithoutFeedback, sendRichCard, sendRichCardWithoutFeedback } from '../../utilities/helper.functions';
import {
	STATE_PROPERTY_NAMES,
	BOT_DIALOG_NAMES,
	LEAVE_MANAGEMENT,
	GREETING_BUTTONS,
	SHOW_MORE
} from '../../configs/bot.constants';
import { conversationState } from '../../controllers/bot.controller';
import { BotLoggerMiddleware } from '../../middleware/chat-logger';
import { IUser } from '../../channels/channel-handler';
import { getGTSID } from '../../services/associate.services';
import {
	GetManagerPendingApprovals,
	GetManagerCancelPendingApprovals,
	AmsEmpLeaveApprove,
} from '../../services/hrmart.services';

import { OptionValidationPrompt } from '../../utilities/optionValidationPrompt';

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

class LeaveApprove extends ComponentDialog {
	private static leaveApproveData: StatePropertyAccessor;
	constructor(dialogId: string) {
		super(dialogId);
		if (!LeaveApprove.leaveApproveData)
			LeaveApprove.leaveApproveData = conversationState.createProperty(
				STATE_PROPERTY_NAMES.LEAVE_APPROVE_DATA,
			);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter. dialogId is required');
		this.addDialog(new WaterfallDialog(dialogId, [
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

		this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, [
			this.getManagerApprovalsList.bind(this),
        ]));

        this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION, [
			this.summaryAndApproveAllApproveIndividuallyOption.bind(this),
			this.approveAllApproveIndividuallyRedirect.bind(this)
		]));

		this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.LEAVE_APPROVE_OPTION, [
			this.approveLeaves.bind(this),
			this.callhrMartApprove.bind(this)
		]));

		this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, [
			this.hrMartApprove.bind(this)
		]));

		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.LEAVE_APPROVE_ALL, [
				this.leaveApprovalAll.bind(this),
			]),
		);

		this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.REJECT_LEAVE_REMARKS, [
			this.askToAddRemark.bind(this),
			this.ifYesEnterRemark.bind(this),
			this.saveRemark.bind(this),
		]));

		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(new OptionValidationPrompt(BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
	}
	async leaveApproveOptions(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'leaveApproveOptions dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		await sendWithoutFeedback(
			step.context,
			LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.PROMPT,
		);
		return await step.prompt(
			BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
			card('', LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.BUTTONS),
			LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.OPTIONS,
		);
	}

	async callSelectedOptionDialog(
		step: WaterfallStepContext<any>,
	): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'callSelectedOptionDialog dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		const email = user.email;
		const gtsid = await getGTSID(email);
		properties[MANAGER_GTSID] = gtsid.gts;
		if (!(gtsid && gtsid.gts)) {
			await send(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
			);
			return await step.endDialog();
		}
		const managerPendingApprovals = await GetManagerPendingApprovals(gtsid.gts);
		const managerCancelPendingApprovals = await GetManagerCancelPendingApprovals(gtsid.gts);
		if (managerPendingApprovals) {
			properties[APPROVE_LIST] = managerPendingApprovals.concat(
				managerCancelPendingApprovals,
			);
		} else properties[APPROVE_LIST] = managerCancelPendingApprovals;
		properties[APPROVE_LIST] = await properties[APPROVE_LIST].filter(function (obj: any) {
			return obj.ErrorFlag === '0';
		});
		await LeaveApprove.leaveApproveData.set(step.context, properties);
		if (step.result === UPCOMING_LEAVE) {
			return await step.beginDialog(
				BOT_DIALOG_NAMES.UPCOMING_LEAVE_SUMMARY_AND_APPROVAL_LIST,
			);
		} else if (step.result === APPROVE_REJECT_LEAVE) {
			return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION);
		} else {
			return await step.endDialog();
		}
	}

	async upcomingLeaveSummary(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'upcomingLeaveSummary dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		let message = LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.LIST;
		let count = 0;
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		if (properties[APPROVE_LIST]) {
			for (const request of properties[APPROVE_LIST]) {
				if (moment().isSameOrBefore(moment(request[LEAVE_TO], 'D-MMM-YYYY'))) {
					message =
						message +
						util.format(
							LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.MESSAGE,
							request[NAME],
							request[LEAVE_FROM],
							request[LEAVE_TO],
							request[LEAVE_REASON],
						);
					count++;
				}
			}
			await send(
				step.context,
				util.format(
					LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.TOTAL,
					message,
					count,
				),
			);
			return await step.prompt(
				BOT_DIALOG_NAMES.TEXT_PROMPT,
				card(
					LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.PROMPT,
					LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.BUTTONS,
				),
			);
		} else {
			await send(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.NO_PENDING_APPROVALS,
			);
			return await step.endDialog();
		}
	}

	async askIfManagerWouldLikeToApprove(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'askIfManagerWouldLikeToApprove dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		if (step.result === APPROVE_REJECT_LEAVE) {
			const initialIndex = 1;
			return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION);
		} else {
			return await step.endDialog();
		}
	}

	async summaryAndApproveAllApproveIndividuallyOption(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'summaryAndApproveAllApproveIndividuallyOption dialog',
				message: step.context.activity.text
			},
			step.context.activity
		);
		const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		const email = user.email;
		const gtsid = await getGTSID(email);
		properties[MANAGER_GTSID] = gtsid.gts;
		if (!(gtsid && gtsid.gts)) {
			await send(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
			);
			return await step.endDialog();
		}
		const managerPendingApprovals = await GetManagerPendingApprovals(gtsid.gts);
		const managerCancelPendingApprovals = await GetManagerCancelPendingApprovals(gtsid.gts);
		if (managerPendingApprovals) {
			properties[APPROVE_LIST] = managerPendingApprovals.concat(
				managerCancelPendingApprovals,
			);
		} else properties[APPROVE_LIST] = managerCancelPendingApprovals;
		properties[APPROVE_LIST] = await properties[APPROVE_LIST].filter(function (obj: any) {
			return obj.ErrorFlag === '0';
		});
		await LeaveApprove.leaveApproveData.set(step.context, properties);
		let message = '*List of all leaves:*\n\n';
		let count = 0;
		for (const request of properties[APPROVE_LIST]) {
			message =
				message +
				util.format(
					LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.MESSAGE,
					request[NAME],
					request[LEAVE_FROM],
					request[LEAVE_TO],
					request[LEAVE_REASON],
				);
			count++;
		}
		await send(
			step.context,
			util.format(LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.TOTAL, message, count)
		);
		return await step.prompt(
			BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
			card(
				LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVAL_INDIVIDUAL_OR_ALL.TEXT,
				LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVAL_INDIVIDUAL_OR_ALL.BUTTONS,
			),
			LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVAL_INDIVIDUAL_OR_ALL.OPTIONS_TO_VALIDATE
		);
	}

	async approveAllApproveIndividuallyRedirect(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'recordOptions',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		if (step.result === 'ApproveIndividually') {
			const initialIndex = 0;
			return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, { initialIndex });
		} else if (step.result === APPROVE_ALL) {
			return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVE_ALL);
		} else {
			await send(step.context, "Invalid selection, click on Leave Management below to start again or say 'Hi' to begin a new conversation.");
			await sendRichCard(step.context, '', LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS);
		}
		return await step.cancelAllDialogs();
	}

	async getManagerApprovalsList(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'getManagerApprovalsList dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		const { initialIndex } = step.options;

		const request = properties[APPROVE_LIST][initialIndex];
		const index = properties[APPROVE_LIST].indexOf(request);
		const params = { request, index };
		if (request) return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVE_OPTION, params);
		else {
			await send(step.context, LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.NO_MORE_LEAVES_TO_VIEW);
			await sendRichCardWithoutFeedback(step.context, '', GREETING_BUTTONS);
			await sendRichCard(step.context, '', SHOW_MORE);
			return await step.endDialog();
		}
	}

	async approveLeaves(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'approveLeaves dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		const { request, index } = step.options;
		const optionsWithRequestId: string[] = [];
		const buttonsWithRequestId = JSON.parse(JSON.stringify(LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.BUTTONS));
		const newOptionsObject = JSON.parse(JSON.stringify(LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.OPTIONS));
		for (const button of buttonsWithRequestId) {
			if (button.value.includes(HASH)) {
				button.value = button.value.concat(JSON.stringify(request));
			}
		}
		for (let option of newOptionsObject) {
			if (option.includes(HASH)) {
				option = option.concat(JSON.stringify(request));
				optionsWithRequestId.push(option);
			} else {
				optionsWithRequestId.push(option);
			}
		}
		return await step.prompt(
			BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
			await card(util.format(LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.TEXT, request.Name, request.LeaveFrom, request.LeaveTo, request.LeaveReason, request.NoOfDays), buttonsWithRequestId),
			optionsWithRequestId
		);
	}

	async callhrMartApprove(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'hrMartApprove dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
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
				properties[FINAL_APPROVE_DATA].Remarks = LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.APPROVE;
				await LeaveApprove.leaveApproveData.set(step.context, properties);
				return await step.beginDialog(BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, { request, initialIndex });
			} else if (step.result.includes(CONTAINS_R)) {
				properties[FINAL_APPROVE_DATA].Remarks = LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE.REJECTED;
				await LeaveApprove.leaveApproveData.set(step.context, properties);
				return await step.beginDialog(BOT_DIALOG_NAMES.REJECT_LEAVE_REMARKS, { request, initialIndex });
			}
		} else if (step.result === NEXT) {
			return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, { request, initialIndex });
		} else {
			return await step.endDialog();
		}
	}

	async askToAddRemark(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'askToAddRemark dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		return await step.prompt(
			BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
			await card(LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK.TEXT, LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK.BUTTONS),
			LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK.OPTIONS
		);
	}

	async ifYesEnterRemark(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'ifYesEnterRemark dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		const { request, index } = step.options;
		if (step.result.toLowerCase() === YES) {
			return await step.prompt(
				BOT_DIALOG_NAMES.TEXT_PROMPT,
				LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.REJECT_LEAVE_REMARK_IF_YES.TEXT
			);
		} else if (step.result.toLowerCase() === NO) {
			return await step.beginDialog(BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, step.options);
		} else {
			return await step.endDialog();
		}
	}

	async saveRemark(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'saveRemark dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		const { request, index } = step.options;
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		properties[FINAL_APPROVE_DATA].Remarks = properties[FINAL_APPROVE_DATA].Remarks.concat(step.result);
		await LeaveApprove.leaveApproveData.set(step.context, properties);
		return await step.beginDialog(BOT_DIALOG_NAMES.HR_MART_LEAVE_APPROVE, step.options);
	}

	async hrMartApprove(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log({
			location: 'hrMartApprove dialog',
			message: step.context.activity.text,
		}, step.context.activity);
		const { request, initialIndex } = step.options;
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		try {
			const status = await AmsEmpLeaveApprove(properties[FINAL_APPROVE_DATA].RequestId, properties[FINAL_APPROVE_DATA].Status, properties[FINAL_APPROVE_DATA].FutureCreditStatus, properties[FINAL_APPROVE_DATA].AuthorizedStatus, properties[FINAL_APPROVE_DATA].Remarks, properties[FINAL_APPROVE_DATA].AppBy);
			if (status === SUCCESS) {
				// @ts-ignore
				await sendWithoutFeedback(step.context, util.format(LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_HR_MART_APPROVE.SUCCESS_MESSAGE, properties[FINAL_APPROVE_DATA].Name, properties[FINAL_APPROVE_DATA].LeaveFrom, properties[FINAL_APPROVE_DATA].LeaveTo, LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_HR_MART_APPROVE[properties[FINAL_APPROVE_DATA].Status]));
			} else {
				await send(step.context, util.format(LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.ERROR_FROM_API, JSON.stringify(status)));
			}
			return await step.beginDialog(BOT_DIALOG_NAMES.LEAVE_APPROVAL_LIST, { initialIndex });
		} catch (err) {
			logger.error({ location: 'hrMartApprove', error: err });
		}
	}

	async leaveApprovalAll(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'leaveApproveAll dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApprove.leaveApproveData.get(step.context, {});
		try {
			if (properties[APPROVE_LIST].length > 0) {
				// @ts-ignore
				for (const element of properties[APPROVE_LIST]) {
					const status = await AmsEmpLeaveApprove(
					element['RequestID'],
					'A',
					element['FutureCredit'],
					true,
					'Approved.',
					properties[MANAGER_GTSID]
				);
				if (status === SUCCESS) {
					await send(
						step.context,
						util.format(
							LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_HR_MART_APPROVE
								.SUCCESS_MESSAGE,
							element.Name,
							element.LeaveFrom,
							element.LeaveTo,
							'Approved!'
						),
					);
				} else {
					await send(
						step.context,
						util.format(
							LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.ERROR_FROM_API,
							JSON.stringify(status),
						),
					);
				}
			}
			await sendWithoutFeedback(step.context, LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.MESSAGE_AFTER_APPROVE_ALL);
			await sendRichCardWithoutFeedback(step.context, '', GREETING_BUTTONS);
			await sendRichCard(step.context, '', SHOW_MORE);
		} else {
			await send(
				step.context, 'No leaves to be viewed.'
			);
		}
		return await step.cancelAllDialogs();
	} catch (err) {
		logger.error({ location: 'leaveApproveAll', error: err });
	}
		return await step.cancelAllDialogs();
	}

async run(turnContext: TurnContext, accessor: StatePropertyAccessor) {
	const dialogSet = new DialogSet(accessor);
	dialogSet.add(this);
	const dialogContext = await dialogSet.createContext(turnContext);
	const results = await dialogContext.continueDialog();
	if (results.status === DialogTurnStatus.empty) {
		await dialogContext.beginDialog(this.id);
	}
}
}

export { LeaveApprove as LeaveApproveDialog };
