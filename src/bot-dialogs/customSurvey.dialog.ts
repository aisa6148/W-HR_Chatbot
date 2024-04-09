import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import { conversationState } from '../controllers/bot.controller';
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
import { card, send } from '../utilities/helper.functions';
import {
	STATE_PROPERTY_NAMES,
	BOT_DIALOG_NAMES,
	LEAVE_MANAGEMENT,
	CUSTOM_SURVEY,
} from '../configs/bot.constants';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import { OptionValidationPrompt } from '../utilities/optionValidationPrompt';
import { getGTSID } from '../services/associate.services';
import { IUser } from '../channels/channel-handler';
import {
	getUserSurveyResponses,
	getSurveyById,
	recordUserSurveyResopnse,
	recordAssociateSurveyUserDetails,
	getUserDetailsFromSurveyUserDetailsDB
} from '../services/associateSurvey.service';
// @ts-ignore
import _ from 'lodash';
import { v4 } from 'uuid';

const QUESTIONS_LIST = 'quesionsList';
const GTS_ID = 'gtsId';
const RESPONSE = 'response';
const V4_ID = 'v4_id';
const EMAIL = 'email';
class CustomSurvey extends ComponentDialog {
	private static customSurveyData: StatePropertyAccessor;
	constructor(dialogId: string) {
		super(dialogId);
		if (!CustomSurvey.customSurveyData)
			CustomSurvey.customSurveyData = conversationState.createProperty(
				STATE_PROPERTY_NAMES.CUSTOM_SURVEY_DATA,
			);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		this.addDialog(new WaterfallDialog(dialogId, [this.checkIfSurveyGiven.bind(this)]));
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.SURVEY_QUESTION, [this.queryQuestion.bind(this)]),
		);
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.SURVEY_QUESTION_LOOP, [
				this.queryQuestionListAndLoop.bind(this),
				this.saveResponses.bind(this),
			]),
		);
		this.addDialog(
			new WaterfallDialog(BOT_DIALOG_NAMES.CONFIRM_SUBMIT, [
				this.confirmDialog.bind(this),
				this.writeInDB.bind(this),
			]),
		);
		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(new OptionValidationPrompt(BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
	}

	async checkIfSurveyGiven(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'checkIfSurveyGiven dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const { entities } = step.options;
		// gtsid
		const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
		const properties = await CustomSurvey.customSurveyData.get(step.context, {});
		const email = user.email;
		const gtsid = await getGTSID(email);
		if (!(gtsid && gtsid.gts)) {
			await step.context.sendActivity(
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
			);
			return await step.cancelAllDialogs();
		}
		properties[GTS_ID] = gtsid.gts;
		properties[V4_ID] = v4();
		properties[EMAIL] = email;
		properties[RESPONSE] = [];
		await CustomSurvey.customSurveyData.set(step.context, properties);
		const userSurveyResponded: { [index: string]: any } = await getUserDetailsFromSurveyUserDetailsDB(
			gtsid.gts,
			entities[0].type,
		);
		const hasUserTakenSurvey = userSurveyResponded ? true : false;
		if (hasUserTakenSurvey) {
			await send(step.context, CUSTOM_SURVEY.ALREADY_RECORDED);
		} else {
			const initialIndex = 0;
			const properties = await CustomSurvey.customSurveyData.get(step.context, {});
			properties[QUESTIONS_LIST] = await getSurveyById(entities[0].type);
			return await step.beginDialog(BOT_DIALOG_NAMES.SURVEY_QUESTION, { initialIndex });
		}
		return await step.cancelAllDialogs();
	}

	async queryQuestion(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'queryQuestion dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await CustomSurvey.customSurveyData.get(step.context, {});
		const { initialIndex } = step.options;

		const question = properties[QUESTIONS_LIST][initialIndex];
		const index = properties[QUESTIONS_LIST].indexOf(question);
		const params = { question, index };
		if (question) return await step.beginDialog(BOT_DIALOG_NAMES.SURVEY_QUESTION_LOOP, params);
		else {
			if (properties[QUESTIONS_LIST].length === initialIndex) {
				try {
					await recordAssociateSurveyUserDetails(properties[GTS_ID], properties[EMAIL], properties[QUESTIONS_LIST][0].surveyId);
				} catch (error) {
					await send(step.context, CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
					return await step.cancelAllDialogs();
				}
				await send(step.context, CUSTOM_SURVEY.END_MESSAGE);
				return await step.cancelAllDialogs();
			}
			await send(step.context, CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
			return await step.cancelAllDialogs();
		}
	}

	async queryQuestionListAndLoop(
		step: WaterfallStepContext<any>,
	): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'queryQuestionListAndLoop dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const { question, index } = step.options;
		if (question.buttons) {
      const questionButtons: string[] = question.buttons.split(', ');
			const buttons: any[]  =  [];
      const buttonValueForValidation: string[] = [];
			questionButtons.forEach(button => {
				buttons.push({
					display: button,
					value: button + '#' + question.questionId,
				});
        buttonValueForValidation.push(button + '#' + question.questionId);
			});
			return await step.prompt(
				BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
				await card(question.question, buttons),
				buttonValueForValidation
			);
		} else {
			return await step.prompt(BOT_DIALOG_NAMES.TEXT_PROMPT, question.question);
		}
	}

	async saveResponses(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'saveResponses dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await CustomSurvey.customSurveyData.get(step.context, {});
		const { question, index } = step.options;
		const initialIndex = index + 1;
		if (step.result) {
			properties[RESPONSE].push({
				surveyId: question.surveyId,
				questionId: question.questionId,
				USER_GTSID: properties[GTS_ID],
				response: step.result.split('#')[0],
			});
			await CustomSurvey.customSurveyData.set(step.context, properties);
			try {
				await recordUserSurveyResopnse(properties[V4_ID], question.surveyId, {questionId: question.questionId, response: step.result.split('#')[0]}, properties[GTS_ID]);
			} catch (error) {
				await send(step.context, CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
				return await step.cancelAllDialogs();
			}
			return await step.beginDialog(BOT_DIALOG_NAMES.SURVEY_QUESTION, { initialIndex });
		} else {
			return await step.endDialog();
		}
	}

	async confirmDialog(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'confirmDialog dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await CustomSurvey.customSurveyData.get(step.context, {});
		if (properties[RESPONSE].length > 0) {
			return await step.prompt(
				BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
				await card(CUSTOM_SURVEY.SUBMIT.TEXT, CUSTOM_SURVEY.SUBMIT.BUTTONS),
				CUSTOM_SURVEY.SUBMIT.OPTIONS,
			);
		}
	}

	async writeInDB(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'writeInDB dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const properties = await CustomSurvey.customSurveyData.get(step.context, {});
		if (step.result === 'yes') {
			const surveyId = properties[RESPONSE][0].surveyId;
			const USER_GTSID = properties[RESPONSE][0].USER_GTSID;
			if (
				!_.every(
					properties[RESPONSE],
					// @ts-ignore
					response =>
						response.surveyId === surveyId && response.USER_GTSID === USER_GTSID,
				)
			) {
				await send(step.context, CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
				return await step.cancelAllDialogs();
			}

			const answers = properties[RESPONSE].map(
				(response: {
					surveyId: string;
					questionId: string;
					USER_GTSID: string;
					response: string;
				}) => ({
					questionId: response.questionId,
					response: response.response,
				}),
			);
			try {
				await recordUserSurveyResopnse(v4(), surveyId, answers, USER_GTSID);
			} catch (error) {
				await send(step.context, CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
				return await step.cancelAllDialogs();
			}
			await send(step.context, CUSTOM_SURVEY.RESPONSE_RECORDED);
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

export { CustomSurvey as CustomSurveyDialog };
