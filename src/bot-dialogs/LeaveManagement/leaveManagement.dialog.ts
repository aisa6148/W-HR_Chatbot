import { StatePropertyAccessor, TurnContext } from 'botbuilder';
import {
	ComponentDialog,
	WaterfallDialog,
	WaterfallStepContext,
	DialogTurnResult,
	DialogSet,
	DialogTurnStatus,
} from 'botbuilder-dialogs';
import logger from '../../models/logger';
import * as util from 'util';
import { sendRichCard } from '../../utilities/helper.functions';
import { LEAVE_MANAGEMENT } from '../../configs/bot.constants';
import { BotLoggerMiddleware } from '../../middleware/chat-logger';
import { getGTSID, isManager } from '../../services/associate.services';
import mailerServices from '../../services/mailer.services';
import config from '../../configs/config';

class LeaveManagement extends ComponentDialog {
	constructor(dialogId: string) {
		super(dialogId);
		// validate what was passed in
		if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
		this.addDialog(new WaterfallDialog(dialogId, [this.LeaveManagement.bind(this)]));
	}

	async LeaveManagement(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
		logger.log(
			{
				location: 'LeaveManagement dialog',
				message: step.context.activity.text,
			},
			step.context.activity,
		);

		const user = await BotLoggerMiddleware.userProfile.get(step.context);
		const email = user.email;
		const gtsid = await getGTSID(email);
		if (gtsid && gtsid.gts) {
			const checkIfManager = (await isManager(gtsid.gts)) > 0 ? true : false;
			if (checkIfManager && config.enableLeaveApproval ) {
				await sendRichCard(
					step.context,
					LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_OPTIONS_FOR_MANAGER_TEXT,
					LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG
						.LEAVE_MANAGEMENT_FOR_MANAGER_OPTIONS_BUTTONS,
				);
			}
			else {
				await sendRichCard(
					step.context,
					LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_OPTIONS_TEXT,
					LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.LEAVE_MANAGEMENT_OPTIONS_BUTTONS,
				);
			}
		} else {
			await step.context.sendActivity(
				LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART,
			);
			await mailerServices.mailOnUndefinedGTSID(
				email,
				util.format(
					LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.USER_UNAVAILABLE_EMAIL_TO_DEV,
					email,
				),
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

export { LeaveManagement as LeaveManagementDialog };
