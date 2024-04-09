import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  DialogSet,
  DialogTurnStatus
} from 'botbuilder-dialogs';
import logger from '../../models/logger';
import * as util from 'util';
import { LEAVE_MANAGEMENT } from '../../configs/bot.constants';
import { BotLoggerMiddleware } from '../../middleware/chat-logger';
import { getGTSID } from '../../services/associate.services';
import { GetEmpLeaveBalance } from '../../services/hrmart.services';
import { IUser } from '../../channels/channel-handler';

const AL = 'AL';
const SL = 'SL';
const FL = 'FL';

class LeaveBalance extends ComponentDialog {
  constructor(dialogId: string) {
    super(dialogId);
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(new WaterfallDialog(dialogId, [this.leaveBalanceList.bind(this)]));
  }

  async leaveBalanceList(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'LeaveBalance dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
    const email = user.email;
    const gtsid = await getGTSID(email);
    if (!(gtsid && gtsid.gts)) {
      await step.context.sendActivity(
        LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART
      );
      return await step.cancelAllDialogs();
    }
    const balanceList = await GetEmpLeaveBalance(gtsid.gts);
    if (!balanceList) {
      await step.context.sendActivity(
        LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART
      );
      return await step.cancelAllDialogs();
    }
    let message = LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LIST_OF_LEAVES;
    for (const element of balanceList) {
      switch (element.LeaveName) {
        case AL:
          message =
            message +
            util.format(
              LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LEAVE_BALANCE_TEXT,
              LEAVE_MANAGEMENT.LEAVE_TYPES.AL,
              element.Leavebalance
            );
          break;
        case SL:
          message =
            message +
            util.format(
              LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LEAVE_BALANCE_TEXT,
              LEAVE_MANAGEMENT.LEAVE_TYPES.SL,
              element.Leavebalance
            );
          break;
        case FL:
          message =
            message +
            util.format(
              LEAVE_MANAGEMENT.LEAVE_BALANCE_DIALOG.LEAVE_BALANCE_TEXT,
              LEAVE_MANAGEMENT.LEAVE_TYPES.FL,
              element.Leavebalance
            );
          break;
      }
    }
    await step.context.sendActivity(message);
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

export { LeaveBalance as LeaveBalanceDialog };
