import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  DialogSet,
  DialogTurnStatus
} from 'botbuilder-dialogs';
import logger from '../models/logger';
import { sendRichCardWithoutFeedback, send } from '../utilities/helper.functions';

import { BotLoggerMiddleware } from '../middleware/chat-logger';

const FEEDBACK_REPLY1 =
  'Thank you for your valuable feedback. \n\nI am continuously learning to assist you better. :)';
class Feedback extends ComponentDialog {
  constructor(dialogId: string) {
    super(dialogId);
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.firstDialog.bind(this)]));
  }

  async firstDialog(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'Feedback dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    let feedback = step.context.activity.text;
    feedback = feedback.replace('feedback_', '');
    const queryParams = await BotLoggerMiddleware.queryProfile.get(step.context);
    if (feedback.includes('negative')) {
      queryParams.feedback = 'negative';
      await send(step.context, FEEDBACK_REPLY1);
    } else {
      if ([3, 4, 5].includes(parseInt(feedback))) {
        queryParams.feedback = 'positive';
        await send(step.context, FEEDBACK_REPLY1);
      } else {
        await sendRichCardWithoutFeedback(step.context, 'What went wrong?', [
          { display: 'Incomplete', value: 'feedback_negative_Incomplete' },
          { display: 'Inaccurate', value: 'feedback_negative_Inaccurate' },
          { display: 'Unanswered Questions', value: 'feedback_negative_Unanswered_Questions' }
        ]);
      }
    }
    await BotLoggerMiddleware.queryProfile.set(step.context, queryParams);
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

export { Feedback as FeedbackDialog };
