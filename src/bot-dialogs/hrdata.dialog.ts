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
import { send } from '../utilities/helper.functions';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import { IEntities } from '../types/luis';
import { fetchTeam, fetchHRBP, fetchManager } from '../utilities/hrmart.functions';
import { getGTSID } from '../services/associate.services';
const UNFORTUNATELY_NO_DETAILS =
  "Unfortunately I couldn't find your details. Looks like you are new to me :( , please reach out to your manager or email info@hr-mart.com for more info";

class HRDataDialog extends ComponentDialog {
  constructor(dialogId: string) {
    super(dialogId);
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.firstDialog.bind(this)]));
  }

  async firstDialog(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    const { entities } = step.options;
    logger.log(
      {
        location: 'HRDataDialog dialog',
        message: step.context.activity.text,
        entities
      },
      step.context.activity
    );
    const results: { [index: string]: string } = {};
    (entities as IEntities[]).forEach(element => {
      results[entities[0].type] = entities[0].type;
    });
    const user = await BotLoggerMiddleware.userProfile.get(step.context);
    const email = user.email;
    if (!email) {
      await send(step.context, UNFORTUNATELY_NO_DETAILS);
      return await step.cancelAllDialogs();
    } else {
      let messageSent = false;
      if (results.team) {
        const details = await fetchTeam(email);
        messageSent = true;
        if (details) {
          await send(step.context, 'You belong to ' + details.team);
        } else {
          await send(step.context, UNFORTUNATELY_NO_DETAILS);
        }
      }
      if (results.hrbp) {
        const details = await fetchHRBP(email);
        messageSent = true;
        if (details) {
          await send(step.context, 'Your HRBP is ' + details.name);
        } else {
          await send(step.context, UNFORTUNATELY_NO_DETAILS);
        }
      }
      if (results.gts) {
        const gtsid = await getGTSID(email);
        messageSent = true;
        if (gtsid && gtsid.gts) {
          await send(step.context, 'Your GTS ID is ' + gtsid.gts);
        } else {
          await send(step.context, UNFORTUNATELY_NO_DETAILS);
        }
      }
      if (results.manager) {
        const details = await fetchManager(email);
        messageSent = true;
        if (details) {
          await send(step.context, 'Your Manager is ' + details.name);
        } else {
          await send(step.context, UNFORTUNATELY_NO_DETAILS);
        }
      }
      if (!messageSent) {
        await send(
          step.context,
          'Hey What exactly are you looking for!. For now I can help you with your HRBP, Manager, Team, GTSID details.'
        );
      }
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

export { HRDataDialog as HRDataDialogDialog };
