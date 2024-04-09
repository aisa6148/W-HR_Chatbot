import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
	ComponentDialog,
	WaterfallDialog,
	TextPrompt,
	WaterfallStepContext,
	DialogTurnResult,
	DialogSet,
	DialogTurnStatus,
} from 'botbuilder-dialogs';
import {
	BOT_DIALOG_NAMES,
	STATE_PROPERTY_NAMES,
	MAILER,
	GREETING_BUTTONS,
	SHOW_MORE
} from '../configs/bot.constants';
import * as util from 'util';
import { getIntent } from '../services/luis.service';
import config from '../configs/config';
import logger from '../models/logger';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import { UnknownDialog } from './unknown.dialog';
import { card } from '../utilities/helper.functions';
import { Bot } from '../bot/bot.dialog';
import { LuisMapDialog } from './luisMap.dialog';
import { conversationState } from '../controllers/bot.controller';
import Mail from '../services/mailer.services';
import { sendWithoutFeedback, sendRichCardWithoutFeedback, sendRichCard } from '../utilities/helper.functions';

class LuisHandler extends ComponentDialog {
	private dialogData: StatePropertyAccessor;
	private dialogId: string;
	constructor(dialogId: string) {
		super(dialogId);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');

		this.dialogId = dialogId;
		this.dialogData = conversationState.createProperty(
			STATE_PROPERTY_NAMES.LUIS_HANDLER_DIALOG_STATE,
		);
		this.addDialog(new WaterfallDialog(dialogId, [this.start.bind(this)]));
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG, [
				this.collectResult.bind(this),
			]),
		);
		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(new LuisMapDialog(BOT_DIALOG_NAMES.LUIS_MAP_DIALOG));
		this.addDialog(new UnknownDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG));
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.LUIS_HANDLER_RELOCATION_WATERFALL_DIALOG, [
				this.relocationConfusionStep0.bind(this),
				this.relocationConfusionStep1.bind(this),
			]),
		);
	}

	async start(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		const outerIntent = await getIntent(config.luis, step.context.activity.text);
		let { intent } = outerIntent.topScoringIntent;
		const { score } = outerIntent.topScoringIntent;
		intent = intent.replace('l_', '');
		logger.log(
			{
				location: 'luishandler start',
				message: step.context.activity.text,
				intent: intent,
				score: score,
			},
			step.context.activity,
		);

		const userData = await BotLoggerMiddleware.queryProfile.get(step.context);
		const user = await BotLoggerMiddleware.userProfile.get(step.context);
		userData['outerLuisIntent'] = intent;
		userData['outerLuisScore'] = score;
		await BotLoggerMiddleware.queryProfile.set(step.context, userData);
		await conversationState.saveChanges(step.context);

		const directPolicies = [
			'General',
			'Leave',
			'HigherEducation',
			'Associate_Referral',
			'RewardsAndRecognition',
			'Gym_Guidelines',
			'ShiftAllowance',
			'OpenDoor',
			'MobileAndInternet',
			'Gratuity',
			'DressCode',
			'BackgroundChecks',
			'UnreportedAbsenteeism',
			'Discrimination',
			'IJP',
			'AlcoholDrug',
			'Information',
			'SafetyAndHealth',
			'Volunteer',
			'AssociateAssistance',
			'ViolenceFree',
			'NPS',
			'RSU',
			'BYOD',
			'MIP',
			'Talent_Mart',
			'Tax_and_Payroll',
			'Tax_and_Payroll_Investment_Dec',
			'Tax_and_Payroll_CTC',
			'Tax_and_Payroll_Medical',
			'Tax_and_Payroll_IPSF',
			'Tax_and_Payroll_Flexi_Benefit',
			'Tax_and_Payroll_Form_16',
			'Tax_and_Payroll_80C',
			'Tax_and_Payroll_Housing_Loan',
			'Tax_and_Payroll_HRA',
			'Tax_and_Payroll_PPF_PF_VPF',
			'Tax_and_Payroll_LTA',
			'HR_Mart_Module',
			'Creche',
			'Outpatient',
			'GoalSetting',
			'AnnualHealthReimbursement',
			'COVID_Reimbursement',
			'IT',
			'E_Learning',
			'MESite',
			'HealthAndWellness',
			'Onboarding',
			'insurance_new',
			'FWO'
		];
		const relocationPolicies = ['UniversityRelocation', 'Relocation', 'Travel'];
		// @ts-ignore
		if (score <= config.innerLuisScore) {
			logger.log(
				{
					location: 'unknown dialog',
					message: step.context.activity.text,
				},
				step.context.activity,
			);

			const userData = await BotLoggerMiddleware.queryProfile.get(step.context);
			userData['unanswered'] = true;
			userData['unansweredQuestion'] = step.context.activity.text;
			await BotLoggerMiddleware.queryProfile.set(step.context, userData);
			await conversationState.saveChanges(step.context);
			const emailContent = util.format(
				MAILER.UNANSWERED.CONTENT,
				step.context.activity.text,
				config.dashboard.link,
				user.userID,
				step.context.activity.conversation.id,
				user.email,
			);

			await sendWithoutFeedback(step.context, 'Sorry, I am not aware of this.');
			await sendRichCardWithoutFeedback(
				step.context,
				'For now, I can assist you with:',
				GREETING_BUTTONS,
			);
			await sendRichCard(step.context, '', SHOW_MORE);
			// await Mail.sendMail(
			// 	config.emailOptionsTo,
			// 	user.email,
			// 	MAILER.UNANSWERED.SUBJECT,
			// 	emailContent,
			// );
			await this.dialogData.delete(step.context);
			await step.cancelAllDialogs();
		} else if (directPolicies.includes(intent)) {
			return await step.replaceDialog(
				BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG,
				{
					intent,
					score,
				},
			);
		} else if (relocationPolicies.includes(intent)) {
			if (score >= 0.6) {
				this.dialogData.set(step.context, { intent, score });
				return await step.replaceDialog(
					BOT_DIALOG_NAMES.LUIS_HANDLER_RELOCATION_WATERFALL_DIALOG,
				);
			} else {
				return await step.replaceDialog(
					BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG,
					{
						intent,
						score,
					},
				);
			}
		} else {
			return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
		}
		return await step.endDialog();
	}

	async relocationConfusionStep0(
		step: WaterfallStepContext<any>,
	): Promise<DialogTurnResult<any>> {
		const context = await Bot.context.get(step.context, undefined);
		logger.log(
			{ location: 'RelocationConfusion[0] dialog', context: context },
			step.context.activity,
		);
		const dialogData = await this.dialogData.get(step.context, {});
		if (
			context == undefined ||
			(context != 'Relocation' && context != 'UniversityRelocation' && context != 'Travel')
		) {
			await this.dialogData.set(step.context, {
				...dialogData,
				text: step.context.activity.text,
			});
			return await step.prompt(
				BOT_DIALOG_NAMES.TEXT_PROMPT,
				card(
					'I have found the following policies to be the closest to your question. Please click to help me understand',
					[
						{ display: 'Relocation', value: 'relocation' },
						{ display: 'University Relocation', value: 'university relocation' },
						{ display: 'Travel', value: 'travel' },
					],
				),
			);
		} else {
			const score = dialogData.score || 1;
			await this.dialogData.delete(step.context);
			return await step.replaceDialog(
				BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG,
				{
					intent: context,
					score,
				},
			);
		}
	}

	async relocationConfusionStep1(
		step: WaterfallStepContext<any>,
	): Promise<DialogTurnResult<any>> {
		const text = step.context.activity.text;
		logger.log({ location: 'RelocationConfusion[1] dialog' }, step.context.activity);
		const contextMap: { [index: string]: string } = {
			relocation: 'Relocation',
			'university relocation': 'UniversityRelocation',
			travel: 'Travel',
		};
		if (['relocation', 'university relocation', 'travel'].includes(text.toLocaleLowerCase())) {
			const dialogData = await this.dialogData.get(step.context);
			await this.dialogData.delete(step.context);
			step.context.activity.text = dialogData.text;
			return await step.replaceDialog(
				BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG,
				{
					intent: contextMap[text.toLocaleLowerCase()],
					score: 1,
				},
			);
		} else {
			await this.dialogData.delete(step.context);
			await step.cancelAllDialogs();
			return await step.replaceDialog(this.dialogId);
		}
	}

	async collectResult(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		const { intent: outerIntent, score: outerScore } = step.options;
		// @ts-ignore
		const luisUrl = config.outerluis[outerIntent];
		if (!luisUrl || !luisUrl.LuisEndpoint || !outerScore) {
			return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
		}
		if (outerScore >= config.outerLuisScore) {
			await Bot.context.set(step.context, outerIntent);
		}
		const { topScoringIntent, entities } = await getIntent(
			luisUrl.LuisEndpoint,
			step.context.activity.text,
		);
		const { intent, score } = topScoringIntent;
		if (!intent || !score) {
			return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
		}
		const userData = await BotLoggerMiddleware.queryProfile.get(step.context);
		userData['luisIntent'] = intent;
		userData['luisScore'] = score;
		userData['luisEntities'] = entities;
		return await step.replaceDialog(BOT_DIALOG_NAMES.LUIS_MAP_DIALOG, {
			intent,
			score,
			entities,
		});
	}

	async run(turnContext: TurnContext, accessor: StatePropertyAccessor) {
		const dialogSet = new DialogSet(accessor);
		dialogSet.add(this);

		const dialogContext = await dialogSet.createContext(turnContext);
		const results = await dialogContext.continueDialog();
		if (results && results.status === DialogTurnStatus.empty) {
			await dialogContext.beginDialog(this.id);
		}
	}
}

export { LuisHandler as LuisHandlerDialog };
