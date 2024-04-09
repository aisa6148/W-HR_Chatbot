import { ConversationState, StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  DialogSet,
  DialogTurnStatus
} from 'botbuilder-dialogs';
import logger from '../models/logger';
import {
  sendRichCardWithoutFeedback,
  sendWithoutFeedback,
  sendRichCard
} from '../utilities/helper.functions';

import { REPLY_TEXTS, STATE_PROPERTY_NAMES } from '../configs/bot.constants';
import { BotLoggerMiddleware } from '../middleware/chat-logger';

class Sample extends ComponentDialog {
  constructor(dialogId: string) {
    super(dialogId);
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.firstDialog.bind(this)]));
  }

  async firstDialog(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'Sample dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    const { entities } = step.options;
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

export { Sample as SampleDialog };
