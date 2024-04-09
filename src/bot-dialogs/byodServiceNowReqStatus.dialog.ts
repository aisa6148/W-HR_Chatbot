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
import logger from '../models/logger';
import { sendRichCard, card, send, sendWithoutFeedback } from '../utilities/helper.functions';
import {
	STATE_PROPERTY_NAMES,
	BOT_DIALOG_NAMES,
	LEAVE_MANAGEMENT,
	BYOD_AD_SERVICE_NOW,
} from '../configs/bot.constants';
import { conversationState } from '../controllers/bot.controller';
import { OptionValidationPrompt } from '../utilities/optionValidationPrompt';

const REQUEST_ID = 'requestId';

class BYODServiceNowReqStatus extends ComponentDialog {
	private static byodSericeNowData: StatePropertyAccessor;
	constructor(dialogId: string) {
		super(dialogId);
		if (!BYODServiceNowReqStatus.byodSericeNowData)
			BYODServiceNowReqStatus.byodSericeNowData = conversationState.createProperty(
				STATE_PROPERTY_NAMES.BYOD_SERVICE_NOW_REQUEST_STATUS,
			);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		this.addDialog(
			new WaterfallDialog(dialogId, [
				this.askRequestId.bind(this),
				this.callServiceNowAPI.bind(this),
			]),
		);
		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(new DateTimePrompt(BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT));
		this.addDialog(new OptionValidationPrompt(BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
	}

	async askRequestId(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askServiceRequestID dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await BYODServiceNowReqStatus.byodSericeNowData.get(step.context, {});
		await BYODServiceNowReqStatus.byodSericeNowData.set(step.context, properties);
		return await step.prompt(
			BOT_DIALOG_NAMES.TEXT_PROMPT,
			card(
				BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_STATUS_DIALOG.REQUEST_ID.PROMPT,
				BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_STATUS_DIALOG.REQUEST_ID.BUTTONS,
			),
		);
	}
	async callServiceNowAPI(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'callServiceNowAPI dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await BYODServiceNowReqStatus.byodSericeNowData.get(step.context, {});
		properties[REQUEST_ID] = step.result;
		await BYODServiceNowReqStatus.byodSericeNowData.set(step.context, properties);
		return await step.replaceDialog(BOT_DIALOG_NAMES.BYOD_SERVICE_NOW_REQUEST_STATUS);
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

export { BYODServiceNowReqStatus as BYODServiceNowReqStatusDialog };
