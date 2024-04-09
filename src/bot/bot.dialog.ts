import { ActivityTypes, TurnContext, StatePropertyAccessor } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
import logger from '../models/logger';
import { STATE_PROPERTY_NAMES, BOT_DIALOG_NAMES, REPLY_TEXTS, GREETING_BUTTONS, SHOW_MORE } from '../configs/bot.constants';
import { LuisHandlerDialog } from '../bot-dialogs/luisHandler.dialog';
import { LuisMapDialog } from '../bot-dialogs/luisMap.dialog';
import { conversationState } from '../controllers/bot.controller';
import { FeedbackDialog } from './feedback.dialog';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import { sendWithoutFeedback, sendRichCardWithoutFeedback } from '../utilities/helper.functions';

class Bot {
	private dialogState: StatePropertyAccessor;
	private dialogs: DialogSet;
	public static context: StatePropertyAccessor;
	constructor() {
		Bot.context = conversationState.createProperty(STATE_PROPERTY_NAMES.POLICY_CONTEXT_USER);
		this.dialogState = conversationState.createProperty(STATE_PROPERTY_NAMES.DIALOG_STATE_PROPERTY);
		this.dialogs = new DialogSet(this.dialogState);
		this.dialogs.add(new LuisHandlerDialog(BOT_DIALOG_NAMES.LUIS_HANDLER_DIALOG));
		this.dialogs.add(new LuisMapDialog(BOT_DIALOG_NAMES.LUIS_MAP_DIALOG));
		this.dialogs.add(new FeedbackDialog(BOT_DIALOG_NAMES.FEEDBACK_HANDLER_DIALOG));
	}

	public async onTurn(turnContext: TurnContext) {
		if (turnContext.activity.type === ActivityTypes.Message) {
			const text = turnContext.activity.text;
			const dialogContext = await this.dialogs.createContext(turnContext);
			if (!dialogContext.context.responded) {
				if (text.toLocaleLowerCase() === REPLY_TEXTS.QUIT) {
					await turnContext.sendActivity(REPLY_TEXTS.PROCESS_DISCARDED);
					await dialogContext.cancelAllDialogs();
				} else {
					await dialogContext.continueDialog();
				}
			}
			if (!dialogContext.context.responded) {
				if (text.match(/^#[0-9a-zA-Z_#]+$/)) {
					const split = text.trim().split('#');
					if (split.length < 3) {
						await dialogContext.beginDialog(BOT_DIALOG_NAMES.LUIS_HANDLER_DIALOG);
					} else {
						await Bot.context.set(turnContext, split[1]);
						const intent = split[2];
						const entities = [];
						if (split.length > 3) {
							entities.push({
								entity: split[3],
								type: split[3],
								score: 1,
							});
						}
						await dialogContext.beginDialog(BOT_DIALOG_NAMES.LUIS_MAP_DIALOG, {
							intent,
							entities,
						});
					}
				} else if (text.match(/^feedback_[0-9a-zA-Z_]+$/)) {
					await dialogContext.beginDialog(BOT_DIALOG_NAMES.FEEDBACK_HANDLER_DIALOG);
				} else {
					await dialogContext.beginDialog(BOT_DIALOG_NAMES.LUIS_HANDLER_DIALOG);
				}
			}
			if (!dialogContext.context.responded) {
				logger.log(
					{
						location: 'unknown dialog',
						message: dialogContext.context.activity.text,
					},
					dialogContext.context.activity,
				);
				const userData = await BotLoggerMiddleware.queryProfile.get(dialogContext.context);
				userData['unanswered'] = true;
				userData['unansweredQuestion'] = dialogContext.context.activity.text;
				await BotLoggerMiddleware.queryProfile.set(dialogContext.context, userData);
				await conversationState.saveChanges(dialogContext.context);

				await sendWithoutFeedback(dialogContext.context, 'Sorry, I am not aware of this.');
				await sendRichCardWithoutFeedback(
					dialogContext.context,
					'For now, I can assist you with:', GREETING_BUTTONS,
				);
				await sendRichCardWithoutFeedback(dialogContext.context, '', SHOW_MORE);
				await dialogContext.cancelAllDialogs();
			}
			logger.debug({ message: text }, turnContext.activity);
		}

		await conversationState.saveChanges(turnContext);
	}
}
export { Bot };
