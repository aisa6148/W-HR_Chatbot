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
import logger from '../models/logger';
import { sendWithoutFeedback, sendRichCard, card, send } from '../utilities/helper.functions';
import {
	STATE_PROPERTY_NAMES,
	BOT_DIALOG_NAMES,
	ELIGIBILITY_DIALOG,
} from '../configs/bot.constants';
import { IEntities } from '../types/luis';
import { conversationState } from '../controllers/bot.controller';

const PARTICULARDAY = 'particularDay';
const NUMBER = 'number';
const TIME_PERIOD = 'time_period';
const CONTINUOUS = 'continuous';
const EXTENDED = 'extended';
const ADHOC = 'adHoc';
const FTE = 'fte';
const YES = 'Yes';
const NO = 'No';
const SENTENCE1 = 'You can work from home';
const SENTENCE2 =
	", all you really need to do is report this to your Manager (You needn't apply on HR Mart!).";
const SENTENCE3 = 'You can avail wfh for ';
const SENTENCE4 = "I'm sorry, but the policy is applicable only to full time associates! :(";

class Eligibility extends ComponentDialog {
	private static wfhEligibilityData: StatePropertyAccessor;
	constructor(dialogId: string) {
		super(dialogId);
		if (!Eligibility.wfhEligibilityData)
			Eligibility.wfhEligibilityData = conversationState.createProperty(
				STATE_PROPERTY_NAMES.WFH_ELIGIBILITY_DATA,
			);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		this.addDialog(
			new WaterfallDialog(dialogId, [
				this.eligibility0.bind(this),
				this.eligibility1.bind(this),
			]),
		);
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.ELIGIBILITY_FTE_DIALOG, [
				this.fteDialog0.bind(this),
				this.fteDialog1.bind(this),
			]),
		);
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.ELIGIBILITY_ADHOC, [this.adhoc.bind(this)]),
		);
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS, [
				this.continuous1.bind(this),
				this.continuous2.bind(this),
			]),
		);
		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
	}

	async eligibility0(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		const { entities } = step.options;
		logger.log(
			{
				location: 'Eligibility dialog[0]',
				message: step.context.activity.text,
				entities,
			},
			step.context.activity,
		);
		const properties: { [index: string]: any } = {};
		for (const entity of entities as IEntities[]) {
			properties[entity.type] = true;
		}
		const previousProperties = await Eligibility.wfhEligibilityData.get(step.context, {});
		properties[FTE] = previousProperties[FTE] ? previousProperties[FTE] : properties[FTE];
		await Eligibility.wfhEligibilityData.set(step.context, properties);
		if (!properties[FTE]) {
			return await step.prompt(
				BOT_DIALOG_NAMES.TEXT_PROMPT,
				card('Are you a Full Time Associate?', [
					{
						display: YES,
						value: YES,
					},
					{
						display: NO,
						value: NO,
					},
				]),
			);
		} else {
			return await step.next();
		}
	}

	async eligibility1(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'Eligibility dialog[1]',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await Eligibility.wfhEligibilityData.get(step.context, {});
		if (step.result === YES || properties[FTE]) {
			properties[FTE] = true;
			if (properties[PARTICULARDAY]) {
				await sendWithoutFeedback(step.context, SENTENCE1 + SENTENCE2);
			} else if (properties[TIME_PERIOD]) {
				return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_ADHOC);
			}
			// else if (properties[ADHOC]) {
			//     return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_SHORT_DURATION);
			// } else if (properties[EXTENDED]) {
			//     return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_LONG_DURATION);
			// }
			else {
				await sendRichCard(
					step.context,
					'Do you want to work from home for a short duration or an extended period?',
					[
						{ display: 'Short Duration', value: '#WFH#short_duration' },
						{ display: 'Extended Period', value: '#WFH#extended_period' },
					],
				);
			}
		} else if (step.result === NO) {
			await sendWithoutFeedback(step.context, SENTENCE4);
		}
		return await step.cancelAllDialogs();
	}

	async adhoc(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'ADHOC dialog[0]',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await Eligibility.wfhEligibilityData.get(step.context, {});
		switch (properties[TIME_PERIOD]) {
			case 'day':
			case 'days':
				if (properties[NUMBER] <= 10) {
					send(
						step.context,
						SENTENCE3 + properties[NUMBER] + ' ' + properties[TIME_PERIOD] + SENTENCE2,
					);
					return await step.cancelAllDialogs();
				} else if (properties[NUMBER] > 10) {
					if (properties[CONTINUOUS]) {
						sendRichCard(
							step.context,
							'You will have to apply for the Extended Flexible Work Option provided you meet the following criteria',
							[
								{
									display: 'Eligibility Criteria',
									value: 'extended_wfh_eligibility_criteria',
								},
							],
						);
						return await step.cancelAllDialogs();
					} else {
						return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS);
					}
				} else {
					send(
						step.context,
						"All that you really need to do is report this to your Manager (You needn't apply on HR Mart!).",
					);
					return await step.cancelAllDialogs();
				}
				break;
			case 'week':
			case 'weeks':
				if (properties[NUMBER] <= 2) {
					send(
						step.context,
						SENTENCE3 + properties[NUMBER] + ' ' + properties[TIME_PERIOD] + SENTENCE2,
					);
					return await step.cancelAllDialogs();
				} else if (properties[NUMBER] > 2) {
					if (properties[CONTINUOUS]) {
						sendRichCard(
							step.context,
							ELIGIBILITY_DIALOG.TEXT,
							ELIGIBILITY_DIALOG.BUTTONS,
						);
						return await step.cancelAllDialogs();
					} else {
						return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS);
					}
				} else {
					send(
						step.context,
						"All that you really need to do is report this to your Manager (You needn't apply on HR Mart!).",
					);
					return await step.cancelAllDialogs();
				}
				break;
			case 'month':
			case 'year':
			case 'months':
				if (properties[CONTINUOUS]) {
					sendRichCard(step.context, ELIGIBILITY_DIALOG.TEXT, ELIGIBILITY_DIALOG.BUTTONS);
					return await step.cancelAllDialogs();
				} else {
					return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS);
				}
				break;

			default:
				send(
					step.context,
					'I seem to have run out of answers to your question :( Please contact gtshrops@email.wal-mart.com for more information',
				);
				return await step.cancelAllDialogs();
		}
	}

	async continuous1(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'Continous dialog[0]',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		return await step.prompt(
			BOT_DIALOG_NAMES.TEXT_PROMPT,
			'Do you wish to avail these for a continuous period of more than 2 weeks?',
		);
	}
	async continuous2(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'Continous dialog[1]',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		if (step.result === YES) {
			sendRichCard(step.context, ELIGIBILITY_DIALOG.TEXT, ELIGIBILITY_DIALOG.BUTTONS);
			return await step.cancelAllDialogs();
		} else {
			const properties = await Eligibility.wfhEligibilityData.get(step.context, {});
			send(
				step.context,
				SENTENCE3 + properties[NUMBER] + ' ' + properties[TIME_PERIOD] + SENTENCE2,
			);
			return await step.cancelAllDialogs();
		}
	}
	async fteDialog0(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'FTE dialog[0]',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		return await step.prompt(
			BOT_DIALOG_NAMES.TEXT_PROMPT,
			card('Are you a Full Time Associate?', [
				{
					display: YES,
					value: YES,
				},
				{
					display: NO,
					value: NO,
				},
			]),
		);
	}

	async fteDialog1(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'FTE dialog[1]',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		if (step.result === YES) {
			return await step.endDialog(YES);
		} else if (step.result == NO) {
			return await step.endDialog(NO);
		} else {
			return await step.cancelAllDialogs();
		}
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

export { Eligibility as EligibilityDialog };
