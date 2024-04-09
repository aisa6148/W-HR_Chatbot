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
import {
    sendRichCard,
    send
} from '../../utilities/helper.functions';
import { conversationState } from '../../controllers/bot.controller';
import { STATE_PROPERTY_NAMES, LEAVE_MANAGEMENT } from '../../configs/bot.constants';
import { BotLoggerMiddleware } from '../../middleware/chat-logger';
import { IUser } from '../../channels/channel-handler';
import * as util from 'util';
import moment from 'moment';
import { getGTSID } from '../../services/associate.services';
import {
    GetManagerPendingApprovals,
    GetManagerCancelPendingApprovals
} from '../../services/hrmart.services';

const MANAGER_GTSID = 'ManagerGtsId';
const APPROVE_LIST = 'approvalList';
const NAME = 'Name';
const LEAVE_FROM = 'LeaveFrom';
const LEAVE_TO = 'LeaveTo';
const LEAVE_REASON = 'LeaveReason';

class UpcomingTeamLeaves extends ComponentDialog {
    private static leaveApproveData: StatePropertyAccessor;

    constructor(dialogId: string) {
        super(dialogId);
        if (!UpcomingTeamLeaves.leaveApproveData)
            UpcomingTeamLeaves.leaveApproveData = conversationState.createProperty(
                STATE_PROPERTY_NAMES.LEAVE_APPROVE_DATA,
            );
        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new WaterfallDialog(dialogId, [this.upcomingLeaveSummary.bind(this)]));
    }

    async upcomingLeaveSummary(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
        logger.log(
            {
                location: 'upcomingLeaveSummary dialog',
                message: step.context.activity.text,
            },
            step.context.activity,
        );
        const user: IUser = await BotLoggerMiddleware.userProfile.get(step.context);
        const properties = await UpcomingTeamLeaves.leaveApproveData.get(step.context, {});
        const email = user.email;
        const gtsid = await getGTSID(email);
        properties[MANAGER_GTSID] = gtsid.gts;
        if (!(gtsid && gtsid.gts)) {
            await send(
                step.context,
                LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
            );
            return await step.endDialog();
        }
        const managerPendingApprovals = await GetManagerPendingApprovals(gtsid.gts);
        const managerCancelPendingApprovals = await GetManagerCancelPendingApprovals(gtsid.gts);
        if (managerPendingApprovals) {
            properties[APPROVE_LIST] = managerPendingApprovals.concat(
                managerCancelPendingApprovals,
            );
        } else properties[APPROVE_LIST] = managerCancelPendingApprovals;
        properties[APPROVE_LIST] = await properties[APPROVE_LIST].filter(function (obj: any) {
            return obj.ErrorFlag === '0';
        });
        let message = LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.LIST;
        let count = 0;
        if (properties[APPROVE_LIST]) {
            for (const request of properties[APPROVE_LIST]) {
                if (moment().isSameOrBefore(moment(request[LEAVE_TO], 'D-MMM-YYYY'))) {
                    message =
                        message +
                        util.format(
                            LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.MESSAGE,
                            request[NAME],
                            request[LEAVE_FROM],
                            request[LEAVE_TO],
                            request[LEAVE_REASON],
                        );
                    count++;
                }
            }
            await send(
                step.context,
                util.format(
                    LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.TOTAL,
                    message,
                    count,
                ),
            );
            await sendRichCard(step.context, LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.PROMPT, LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.UPCOMING_LEAVES.BUTTONS_WITH_HASH);
            return await step.endDialog();
        } else {
            await send(
                step.context,
                LEAVE_MANAGEMENT.LEAVE_APPROVE_DIALOG.LEAVE_APPROVE_OPTION.NO_PENDING_APPROVALS,
            );
            return await step.endDialog();
        }
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

export { UpcomingTeamLeaves as UpcomingTeamLeavesDialog };
