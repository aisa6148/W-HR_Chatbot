import {
	ComponentDialog,
	WaterfallDialog,
	TextPrompt,
	WaterfallStepContext,
	DialogTurnResult,
} from 'botbuilder-dialogs';
import { BOT_DIALOG_NAMES, GREETING_BUTTONS, SHOW_MORE } from '../configs/bot.constants';
import logger from '../models/logger';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import {
	sendWithoutFeedback,
	sendRichCardWithoutFeedback,
	card,
} from '../utilities/helper.functions';
import { conversationState } from '../controllers/bot.controller';
class Unknown extends ComponentDialog {
	constructor(dialogId: string) {
		super(dialogId);

		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');

		this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
		this.addDialog(
			new WaterfallDialog(dialogId, [
				this.promptHRResponse.bind(this),
				this.handlePromptHRResponseReply.bind(this),
			]),
		);
	}

	async promptHRResponse(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
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

		await sendWithoutFeedback(step.context, 'Sorry, I am not aware of this as of now.');
		await sendRichCardWithoutFeedback(
			step.context,
			'Feel free to write to gtshrops@email.wal-mart.com for any assistance. For now, I can assist you with:',
			GREETING_BUTTONS,
		);
		await sendRichCardWithoutFeedback(step.context, '', SHOW_MORE);
		return step.endDialog();
		// return await step.prompt(
		// 	BOT_DIALOG_NAMES.TEXT_PROMPT,
		// 	card(
		// 		'Do you want me to check with the HR regarding this and get back to you? (Feel free to write to gtshrops@email.wal-mart.com for any assistance.)',
		// 		[
		// 			{ display: 'Yes, let me know ASAP!', value: 'Yes' },
		// 			{ display: "Nop, I'm good", value: 'No' },
		// 		],
		// 	),
		// );
	}

	async handlePromptHRResponseReply(
		step: WaterfallStepContext<any>,
	): Promise<DialogTurnResult<any>> {
		step.context.sendActivity('Heres what you said' + step.context.activity.text);
		return step.endDialog();
	}
}

export { Unknown as UnknownDialog };
