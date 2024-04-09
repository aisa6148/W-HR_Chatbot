import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
  DialogSet,
  DialogTurnStatus,
  TextPrompt
} from 'botbuilder-dialogs';
import * as util from 'util';
import logger from '../../models/logger';
import { sendRichCard, card, send } from '../../utilities/helper.functions';
import {
  STATE_PROPERTY_NAMES,
  BOT_DIALOG_NAMES,
  LEAVE_MANAGEMENT
} from '../../configs/bot.constants';
import { conversationState } from '../../controllers/bot.controller';
import { BotLoggerMiddleware } from '../../middleware/chat-logger';
import { IUser } from '../../channels/channel-handler';
import { getGTSID } from '../../services/associate.services';
import {
  GetIndividiualEmployeesInfo,
  GetManagerPendingApprovals,
  AmsEmpLeaveCancelApply
} from '../../services/hrmart.services';
import { OptionValidationPrompt } from '../../utilities/optionValidationPrompt';

const REQUEST_ID = 'requestId';
const REQUEST_ID_BUTTON_VALUE = 'Req Id: ';
const SELECTED_REQUEST_ID = 'selectedRequestId';
const CANCEL_REASON = 'cancelReason';
const SUCCESS = 'Success';
const YES = 'yes';

class LeaveCancel extends ComponentDialog {
  private static leaveCancelData: StatePropertyAccessor;
  constructor(dialogId: string) {
    super(dialogId);
    if (!LeaveCancel.leaveCancelData)
      LeaveCancel.leaveCancelData = conversationState.createProperty(
        STATE_PROPERTY_NAMES.LEAVE_CANCEL_DATA
      );
    // validate what was passed in
    if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
    this.addDialog(
      new WaterfallDialog(dialogId, [
        this.listOfPendingLeaves.bind(this),
        this.cancelReason.bind(this),
        this.cancelConfirmation.bind(this),
        this.callHrMartAPI.bind(this)
      ])
    );
    this.addDialog(
      new WaterfallDialog(BOT_DIALOG_NAMES.HR_MART_CANCEL, [this.hrmartCancel.bind(this)])
    );

    this.addDialog(new OptionValidationPrompt(BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
    this.addDialog(new TextPrompt(BOT_DIALOG_NAMES.TEXT_PROMPT));
  }

  async listOfPendingLeaves(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'listOfPendingLeaves dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    // get user's GTS Id
    const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
    const email = user.email;
    const gtsid = await getGTSID(email);
    if (!(gtsid && gtsid.gts)) {
      await send(
        step.context,
        LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART
      );
      return await step.endDialog();
    }
    const employeeDetails = await GetIndividiualEmployeesInfo(gtsid.gts);
    const managerGtsId = employeeDetails.Manager;
    logger.debug(managerGtsId);
    const managerPendingApprovals = await GetManagerPendingApprovals(managerGtsId);
    logger.debug(managerPendingApprovals);
    const properties = await LeaveCancel.leaveCancelData.get(step.context, {});
    properties[REQUEST_ID] = [];
    if (managerPendingApprovals === null) {
      await send(
        step.context,
        LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.NO_PENDING_LEAVES
      );
      return await step.endDialog();
    } else {
      const leaveList = [];
      if (managerPendingApprovals.find(r => r.AssociateID === gtsid.gts)) {
        await send(
          step.context,
          LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.CANCEL_INTRO
        );
      }
      for (const req of managerPendingApprovals) {
        if (req.AssociateID === gtsid.gts) {
          leaveList.push(req);
          properties[REQUEST_ID].push(req.RequestID);
          await LeaveCancel.leaveCancelData.set(step.context, properties);
          await sendRichCard(
            step.context,
            util.format(
              LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.PENDING_LEAVES,
              // @ts-ignore
              LEAVE_MANAGEMENT.LEAVE_TYPES[req.LeaveType],
              req.LeaveFrom,
              req.LeaveTo,
              req.RequestedOn,
              req.NoOfDays,
              req.LeaveReason,
              req.Status
            ),
            [{ display: REQUEST_ID_BUTTON_VALUE + req.RequestID, value: req.RequestID }]
          );
        }
      }
      if (leaveList.length > 0) {
        return await step.prompt(
          BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
          card(
            LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.PROMPT,
            LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.BUTTONS
          ),
          properties[REQUEST_ID]
        );
      } else {
        await send(
          step.context,
          LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LIST_OF_PENDING_LEAVES.NO_PENDING_LEAVES
        );
        return await step.endDialog();
      }
    }
  }

  async cancelReason(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'cancelReason dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    const properties = await LeaveCancel.leaveCancelData.get(step.context, {});
    properties[SELECTED_REQUEST_ID] = step.result;
    await LeaveCancel.leaveCancelData.set(step.context, properties);
    return await step.prompt(
      BOT_DIALOG_NAMES.TEXT_PROMPT,
      card(
        LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_REASON.PROMPT,
        LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_REASON.BUTTONS
      )
    );
  }

  async cancelConfirmation(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'cancelConfirmation dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    const properties = await LeaveCancel.leaveCancelData.get(step.context, {});
    properties[CANCEL_REASON] = step.result;
    await LeaveCancel.leaveCancelData.set(step.context, properties);
    return await step.prompt(
      BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT,
      card(
        util.format(
          LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_CONFIRMATION.PROMPT,
          properties[SELECTED_REQUEST_ID],
          properties[CANCEL_REASON]
        ),
        LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_CONFIRMATION.BUTTONS
      ),
      LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.CANCEL_CONFIRMATION.OPTIONS
    );
  }

  async callHrMartAPI(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'callHrMartAPI dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    if (step.result.toLowerCase() === YES) {
      return await step.replaceDialog(BOT_DIALOG_NAMES.HR_MART_CANCEL);
    } else {
      return await step.cancelAllDialogs();
    }
  }

  async hrmartCancel(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
    logger.log(
      {
        location: 'hrmartCancel dialog',
        message: step.context.activity.text
      },
      step.context.activity
    );
    const properties = await LeaveCancel.leaveCancelData.get(step.context, {});
    const status = await AmsEmpLeaveCancelApply(
      properties[SELECTED_REQUEST_ID],
      properties[CANCEL_REASON]
    );
    if (status === SUCCESS) {
      await send(
        step.context,
        LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LEAVE_HR_MART_CANCEL.SUCCESS_MESSAGE
      );
      await sendRichCard(
        step.context,
        LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LEAVE_HR_MART_CANCEL.ADDITIONAL_OPTION_PROMPT,
        LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_BUTTONS
      );
    } else {
      await send(
        step.context,
        util.format(
          LEAVE_MANAGEMENT.LEAVE_CANCEL_DIALOG.LEAVE_HR_MART_CANCEL.ERROR_FROM_API,
          status
        )
      );
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

export { LeaveCancel as LeaveCancelDialog };
