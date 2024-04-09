const { TurnContext, StatePropertyAccessor } = require('botbuilder');
const {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  DialogSet,
  DialogTurnStatus
} = require('botbuilder-dialogs');
const { BOT_DIALOG_NAMES } = require('../configs/bot.constants');
const logger = require('../models/logger');
const { UnknownDialog } = require('../bot-dialogs/unknown.dialog');
const { GreetingsDialog } = require('../bot-dialogs/greetings.dialog');

class Redirect extends ComponentDialog {
  constructor(dialogId: string) {
    super(dialogId);

    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.redirect.bind(this)]));
    this.addDialog(new UnknownDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG));
    this.addDialog(new GreetingsDialog(BOT_DIALOG_NAMES.GREETINGS_DIALOG));
  }

  async redirect(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    const { dialogId, entities } = step.options;
    logger.log({ location: 'redirect dialog', dialogId, entities }, step.context.activity);
    if (!dialogId || !this.findDialog(dialogId)) {
      return await step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
    }
    return await step.replaceDialog(dialogId, { entities });
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

export { Redirect as RedirectDialog };
