import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
	ComponentDialog,
	WaterfallDialog,
	WaterfallStepContext,
	DialogTurnResult,
	DialogSet,
	DialogTurnStatus,
	TextPrompt,
	DateTimePrompt,
} from 'botbuilder-dialogs';
import moment = require('moment');
import * as util from 'util';
import logger from '../../models/logger';
import { sendRichCard, card, send, sendWithoutFeedback } from '../../utilities/helper.functions';
import {
	STATE_PROPERTY_NAMES,
	BOT_DIALOG_NAMES,
	LEAVE_MANAGEMENT,
} from '../../configs/bot.constants';
import { conversationState } from '../../controllers/bot.controller';
import { BotLoggerMiddleware } from '../../middleware/chat-logger';
import { IUser } from '../../channels/channel-handler';
import { getGTSID } from '../../services/associate.services';
import { GetEmpLeaveBalance, AmsEmpLeaveApply } from '../../services/hrmart.services';
import { OptionValidationPrompt } from '../../utilities/optionValidationPrompt';

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

class LeaveApply extends ComponentDialog {
	private static hrMartLeaveData: StatePropertyAccessor;
	constructor(dialogId: string) {
		super(dialogId);
		if (!LeaveApply.hrMartLeaveData)
			LeaveApply.hrMartLeaveData = conversationState.createProperty(
				STATE_PROPERTY_NAMES.LEAVE_APPLY_HR_MART_DATA,
			);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		this.addDialog(
			new WaterfallDialog(dialogId, [
				this.askLeaveType.bind(this),
				this.askLeaveFromDate.bind(this),
				this.askLeaveFromPeriod.bind(this),
				this.askLeaveToDate.bind(this),
				this.askLeaveToPeriod.bind(this),
				this.askLeaveReason.bind(this),
				this.callHRMartAPI.bind(this),
			]),
		);
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.HR_MART_APPLY, [this.hrMartApply.bind(this)]),
		);
		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(new DateTimePrompt(BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT));
		this.addDialog(new OptionValidationPrompt(BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
	}

	async askLeaveType(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askLeaveType dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		return await step.prompt(
			BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
			card(
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TYPE.PROMPT,
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TYPE.BUTTONS,
			),
			LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TYPE.OPTIONS,
		);
	}

	async askLeaveFromDate(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askLeaveFromDate dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApply.hrMartLeaveData.get(step.context, {});
		properties[LEAVE_TYPE] = step.result;
		await LeaveApply.hrMartLeaveData.set(step.context, properties);
		const TYPE = properties[LEAVE_TYPE] === SL ? SICK_LEAVE : ANNUAL_LEAVE;
		return await step.prompt(
			BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT,
			card(
				util.format(LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_DATE.PROMPT, TYPE),
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_DATE.BUTTONS,
			),
		);
	}

	async askLeaveFromPeriod(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askLeaveFromPeriod dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApply.hrMartLeaveData.get(step.context, {});
		properties[LEAVE_FROM_DATE] =
			moment(step.result[0].value).format(DATE_FORMAT) + '-' + moment().format(YEAR);
		await LeaveApply.hrMartLeaveData.set(step.context, properties);
		return await step.prompt(
			BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
			card(
				util.format(
					LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_PERIOD.PROMPT,
					properties[LEAVE_FROM_DATE],
				),
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_PERIOD.BUTTONS,
			),
			LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_FROM_PERIOD.OPTIONS,
		);
	}

	async askLeaveToDate(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askLeaveToDate dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApply.hrMartLeaveData.get(step.context, {});
		properties[LEAVE_FROM_PERIOD] = step.result;
		await LeaveApply.hrMartLeaveData.set(step.context, properties);
		return await step.prompt(
			BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT,
			card(
				util.format(LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_DATE.PROMPT),
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_DATE.BUTTONS,
			),
		);
	}

	async askLeaveToPeriod(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askLeaveToPeriod dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApply.hrMartLeaveData.get(step.context, {});
		properties[LEAVE_TO_DATE] =
			moment(step.result[0].value).format(DATE_FORMAT) + '-' + moment().format(YEAR);
		await LeaveApply.hrMartLeaveData.set(step.context, properties);
		if (moment(properties[LEAVE_FROM_DATE]).isAfter(moment(properties[LEAVE_TO_DATE]))) {
			await sendRichCard(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_DATE.IF_FROM_DATE_AFTER_TO_DATE,
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS,
			);
			return await step.cancelAllDialogs();
		} else if (properties[LEAVE_FROM_DATE] === properties[LEAVE_TO_DATE]) {
			properties[LEAVE_TO_PERIOD] = properties[LEAVE_FROM_PERIOD];
			await send(
				step.context,
				util.format(
					LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.SEND,
					properties[LEAVE_TO_DATE],
				),
			);
			return await step.next();
		} else {
			return await step.prompt(
				BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
				card(
					util.format(
						LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.PROMPT,
						properties[LEAVE_TO_DATE],
					),
					LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.BUTTONS,
				),
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_TO_PERIOD.OPTIONS,
			);
		}
	}

	async askLeaveReason(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askLeaveReason dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApply.hrMartLeaveData.get(step.context, {});
		if (properties[LEAVE_TO_PERIOD] === undefined) {
			properties[LEAVE_TO_PERIOD] = step.result;
			await LeaveApply.hrMartLeaveData.set(step.context, properties);
		}
		return await step.prompt(
			BOT_DIALOG_NAMES.TEXT_PROMPT,
			card(
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_REASON.PROMPT,
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_REASON.BUTTONS,
			),
		);
	}

	async callHRMartAPI(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'callHRMartAPI dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await LeaveApply.hrMartLeaveData.get(step.context, {});
		properties[LEAVE_REASON] = step.result;
		await LeaveApply.hrMartLeaveData.set(step.context, properties);
		return await step.replaceDialog(BOT_DIALOG_NAMES.HR_MART_APPLY);
	}

	async hrMartApply(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'hrMartApply dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
		const email = user.email;
		let currentBalance;
		const gtsid = await getGTSID(email);
		if (!(gtsid && gtsid.gts)) {
			await send(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
			);
			return await step.cancelAllDialogs();
		}
		const balanceList = await GetEmpLeaveBalance(gtsid.gts);
		if (!balanceList) {
			// unnecessary send without feedback
			await send(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
			);
			return await step.cancelAllDialogs();
		}

		const properties: any = await LeaveApply.hrMartLeaveData.get(step.context, {});
		let appliedDays = 0;
		if (properties[LEAVE_TYPE] === SL) currentBalance = balanceList[1].Leavebalance;
		if (properties[LEAVE_TYPE] === AL) currentBalance = balanceList[0].Leavebalance;
		logger.debug({ location: 'hrMartApply', currentBalance });

		if (properties[LEAVE_FROM_PERIOD] === FH)
			appliedDays = appliedDays + 0.5;
		if (properties[LEAVE_FROM_DATE] != properties[LEAVE_TO_DATE]) {
			if (properties[LEAVE_TO_DATE] === SH || properties[LEAVE_TO_DATE] === FH)
				appliedDays = appliedDays + 0.5;
		}
		if (properties[LEAVE_FROM_PERIOD] === FD) appliedDays = appliedDays + 1;
		if (properties[LEAVE_TO_PERIOD] === FD) appliedDays = appliedDays + 1;
		const fromDate = moment(properties[LEAVE_FROM_DATE], DATE_FORMAT);
		const toDate = moment(properties[LEAVE_TO_DATE], DATE_FORMAT);
		const datediff = toDate.diff(fromDate, 'days');
		appliedDays = appliedDays + datediff - 1;
		const balanceAfterApply = currentBalance - appliedDays;
		if (balanceAfterApply <= 0) {
			await sendRichCard(
				step.context,
				LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.LEAVES_EXHAUSTED,
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS,
			);
			return await step.endDialog();
		} else {
			const status = await AmsEmpLeaveApply(
				gtsid.gts,
				properties[LEAVE_TYPE],
				properties[LEAVE_FROM_DATE],
				properties[LEAVE_FROM_PERIOD],
				properties[LEAVE_TO_DATE],
				properties[LEAVE_TO_PERIOD],
				properties[LEAVE_REASON],
				gtsid.gts,
				'E',
				'',
				'',
			);
			if (status === SUCCESS) {
				await sendWithoutFeedback(
					step.context,
					util.format(
						LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.SUCCESS_MESSAGE,
						// @ts-ignore
						LEAVE_MANAGEMENT.LEAVE_TYPES[properties[LEAVE_TYPE]],
						properties[LEAVE_FROM_DATE],
						properties[LEAVE_TO_DATE],
					),
				);
				await sendRichCard(
					step.context,
					LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY
						.ADDITIONAL_OPTION_PROMPT,
					LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS,
				);
			} else {
				await send(
					step.context,
					util.format(
						LEAVE_MANAGEMENT.LEAVE_APPLY_DIALOG.LEAVE_HR_MART_APPLY.ERROR_FROM_API,
						status,
					),
				);
			}
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

export { LeaveApply as LeaveApplyDialog };
