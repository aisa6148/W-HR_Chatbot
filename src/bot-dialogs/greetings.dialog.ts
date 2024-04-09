import { ConversationState, StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
	ComponentDialog,
	WaterfallDialog,
	WaterfallStepContext,
	DialogTurnResult,
	DialogSet,
	DialogTurnStatus,
} from 'botbuilder-dialogs';
import logger from '../models/logger';
import { sendWithoutFeedback, sendRichCard, sendWithouthFeedbackAndWithDefaultFormatting } from '../utilities/helper.functions';
import { REPLY_TEXTS, STATE_PROPERTY_NAMES, GREETING_BUTTONS, SHOW_MORE } from '../configs/bot.constants';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import { conversationState } from '../controllers/bot.controller';
const WEBCHAT = 'webchat';
const SLACK = 'slack';
import config from '../configs/config';

class Greetings extends ComponentDialog {
	private static firstTime: StatePropertyAccessor;
	public conversationState: ConversationState;
	constructor(dialogId: string) {
		super(dialogId);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		if (!Greetings.firstTime)
			Greetings.firstTime = conversationState.createProperty(
				STATE_PROPERTY_NAMES.FIRST_TIME_GREETING,
			);
		this.addDialog(new WaterfallDialog(dialogId, [this.greeting.bind(this)]));
	}
	async greeting(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'Greeting dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);
		const firstTime = await Greetings.firstTime.get(step.context, true);
		if (firstTime) {
			await Greetings.firstTime.set(step.context, false);
			// await conversationState.saveChanges(step.context, true);
			if (step.context.activity.channelId === SLACK) {
				await sendWithouthFeedbackAndWithDefaultFormatting(
					step.context,
					`_Your privacy is important to us. For Privacy policy, please click <${config.privacyLink}|here>_`,
				);
			}
			const user = await BotLoggerMiddleware.userProfile.get(step.context);
			const name = user.userName || user.step.context.activity.from.name || '';
			await sendWithoutFeedback(
				step.context,
				'Hey ' + name + REPLY_TEXTS.FIRST_INTRO_TEXT
			);
		} else {
			const number = Math.floor((Math.random() * 1000) % REPLY_TEXTS.GREETINGS.length);
			await sendWithoutFeedback(step.context, REPLY_TEXTS.GREETINGS[number]);
		}
		await sendRichCard(step.context, 'I can assist you with:', GREETING_BUTTONS);
		await sendRichCard(step.context, '', SHOW_MORE);
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

export { Greetings as GreetingsDialog };
