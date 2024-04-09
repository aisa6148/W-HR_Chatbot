import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  DialogSet,
  DialogTurnStatus
} from 'botbuilder-dialogs';
import { BOT_DIALOG_NAMES } from '../configs/bot.constants';
import logger from '../models/logger';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import { UnknownDialog } from './unknown.dialog';
import { deliverMessages } from '../utilities/helper.functions';
import { Bot } from '../bot/bot.dialog';
import { fetchLuisMap } from '../utilities/luisMapDB.functions';
import { ILuisMapData } from '../types/luisMap';
import { IMessage } from '../types/Message';
import { RedirectDialog } from '../bot/redirect.dialog';
const GENERAL = 'General';
class LuisMap extends ComponentDialog {
  constructor(dialogId: string) {
    super(dialogId);
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.start.bind(this)]));
    this.addDialog(new RedirectDialog(BOT_DIALOG_NAMES.REDIRECT_DIALOG));
    this.addDialog(new UnknownDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG));
  }

  async start(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    const { intent, entities } = step.options;
    const mappedDialog: ILuisMapData = await fetchLuisMap(intent);
    logger.log(
      {
        location: 'luisMap start',
        intent,
        entities
      },
      step.context.activity
    );
    if (mappedDialog) {
      switch (mappedDialog.type) {
        case 'DirectDialog':
          return await this.directDialogFunction(step, mappedDialog);
        case 'ContextDialog':
          return await this.contextDialogFunction(step, mappedDialog);
        case 'RedirectDialog':
          return await step.replaceDialog(BOT_DIALOG_NAMES.REDIRECT_DIALOG, {
            dialogId: mappedDialog.value,
            entities
          });
        case 'EntityDialog':
          return this.entityDialogFunction(step, mappedDialog);
        default:
          const userData = await BotLoggerMiddleware.queryProfile.get(step.context);
          userData['unanswered'] = true;
          await BotLoggerMiddleware.queryProfile.set(step.context, userData);
          // mailer.send(session);
          return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
      }
    } else {
      return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
    }
    return await step.cancelAllDialogs();
  }

  async directDialogFunction(step: WaterfallStepContext<any>, mappedDialog: ILuisMapData) {
    const messages = mappedDialog.messages;
    await deliverMessages(step.context, messages);
    return await step.cancelAllDialogs();
  }
  async contextDialogFunction(step: WaterfallStepContext<any>, mappedDialog: ILuisMapData) {
    let context = await Bot.context.get(step.context);
    if (!mappedDialog.contexts[context]) {
      context = GENERAL;
    } else if (mappedDialog.contexts[context]) {
      const messages = mappedDialog.contexts[context].messages;
      await deliverMessages(step.context, messages as IMessage[]);
      return await step.cancelAllDialogs();
    } else {
      // Suggest change of context or rephrase of question logic
      return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
    }
    return await step.cancelAllDialogs();
  }
  async entityDialogFunction(step: WaterfallStepContext<any>, mappedDialog: ILuisMapData) {
    const { entities } = step.options;
    let context = await Bot.context.get(step.context);
    let entity = GENERAL;
    if (!mappedDialog.contexts[context]) {
      context = GENERAL;
    }
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].type != context && entity == GENERAL) {
        if (mappedDialog.contexts[context] && mappedDialog.contexts[context][entities[i].type]) {
          entity = entities[i].type;
        }
      }
    }
    logger.log(
      { location: 'luis-handler.js switch case EntityDialog', entity },
      step.context.activity
    );
    if (mappedDialog.contexts[context] && mappedDialog.contexts[context][entity]) {
      const messages = (mappedDialog.contexts[context][entity] as { messages: IMessage[] })
      .messages;
      await deliverMessages(step.context, messages);
      return await step.cancelAllDialogs();
    } else {
      // Suggest change of context or rephrase of question logic
      const userData = await BotLoggerMiddleware.queryProfile.get(step.context);
      userData['unanswered'] = true;
      await BotLoggerMiddleware.queryProfile.set(step.context, userData);
      // mailer.send(session);
      return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
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

export { LuisMap as LuisMapDialog };
