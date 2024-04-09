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
import logger from '../models/logger';
import { card } from '../utilities/helper.functions';
import {
	STATE_PROPERTY_NAMES,
	BOT_DIALOG_NAMES,
	BYOD_AD_SERVICE_NOW,
} from '../configs/bot.constants';
import { conversationState } from '../controllers/bot.controller';
import { getGTSID } from '../services/associate.services';
import { OptionValidationPrompt } from '../utilities/optionValidationPrompt';

const USER_TO_MODIFY = 'userToModify';
const BUSINESS_JUSTIFICATION = 'businessJustification';
const GROUP_NAME = 'AW-HO-O365-BYOD';

class BYODServiceNowRaiseRequest extends ComponentDialog {
	private static byodSericeNowData: StatePropertyAccessor;
	constructor(dialogId: string) {
		super(dialogId);
		if (!BYODServiceNowRaiseRequest.byodSericeNowData)
			BYODServiceNowRaiseRequest.byodSericeNowData = conversationState.createProperty(
				STATE_PROPERTY_NAMES.BYOD_SERVICE_NOW_NEW_REQUEST,
			);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		this.addDialog(
			new WaterfallDialog(dialogId, [
				this.askUserToModify.bind(this),
				this.askBusinessJustification.bind(this),
				this.callServiceNowAPI.bind(this),
			]),
		);
		// this.addDialog(new WaterfallDialog(BOT_DIALOG_NAMES.HR_MART_APPLY, [
		//     this.hrMartApply.bind(this)
		// ]));
		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(new DateTimePrompt(BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT));
		this.addDialog(new OptionValidationPrompt(BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
	}
	async askUserToModify(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askUserToModify dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await BYODServiceNowRaiseRequest.byodSericeNowData.get(step.context, {});
		await BYODServiceNowRaiseRequest.byodSericeNowData.set(step.context, properties);
		return await step.prompt(
			BOT_DIALOG_NAMES.TEXT_PROMPT,
			card(
				BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_DIALOG.USER_TO_MODIFY.PROMPT,
				BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_DIALOG.USER_TO_MODIFY.BUTTONS,
			),
		);
	}

	async askBusinessJustification(
		step: WaterfallStepContext<any>,
	): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'askBusinessJustification dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const userName = await getGTSID(step.result);
		if (userName) {
			const properties = await BYODServiceNowRaiseRequest.byodSericeNowData.get(
				step.context,
				{},
			);
			properties[USER_TO_MODIFY] = step.result;
			await BYODServiceNowRaiseRequest.byodSericeNowData.set(step.context, properties);
			return await step.prompt(
				BOT_DIALOG_NAMES.TEXT_PROMPT,
				card(
					BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_DIALOG.BUSINESS_JUSTIFICATION.PROMPT,
					BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_DIALOG.BUSINESS_JUSTIFICATION.BUTTONS,
				),
			);
		} else {
			await step.cancelAllDialogs();
			return await step.prompt(
				BOT_DIALOG_NAMES.TEXT_PROMPT,
				card(
					BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_RESTART_DIALOG.RAISE_REQUEST.PROMPT,
					BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_RESTART_DIALOG.RAISE_REQUEST.BUTTONS,
				),
			);
		}
	}

	async callServiceNowAPI(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'callServiceNowAPI dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await BYODServiceNowRaiseRequest.byodSericeNowData.get(step.context, {});
		properties[BUSINESS_JUSTIFICATION] = step.result;
		properties['groupToAddOrRemove'] = GROUP_NAME;
		await BYODServiceNowRaiseRequest.byodSericeNowData.set(step.context, properties);
		return await step.endDialog();
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

export { BYODServiceNowRaiseRequest as BYODServiceNowRaiseReqDialog };
