import { TurnContext, StatePropertyAccessor } from 'botbuilder';
import { ComponentDialog, WaterfallDialog, WaterfallStepContext, DialogTurnResult, DialogSet, DialogTurnStatus } from 'botbuilder-dialogs';
import logger from '../models/logger';
import { sendRichCardWithoutFeedback } from '../utilities/helper.functions';

import { REPLY_TEXTS } from '../configs/bot.constants';
class Affirmation extends ComponentDialog {

    constructor(dialogId: string) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId) throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new WaterfallDialog(dialogId, [
            this.promptFeedback.bind(this),
        ]));
    }

    async promptFeedback(step: WaterfallStepContext<any>): Promise<DialogTurnResult<any>> {
        logger.log({
            location: 'Affirmation dialog',
            message: step.context.activity.text,
        }, step.context.activity);
        const { entities } = step.options;
        if (entities && entities.length > 0 && entities[0].type == 'yes') {
            const number = Math.floor((Math.random() * 1000) % REPLY_TEXTS.CONVERSATION_END.ASK_ME_MORE.length);
            await step.context.sendActivity(REPLY_TEXTS.CONVERSATION_END.ASK_ME_MORE[number]);
        } else {
            const number = Math.floor((Math.random() * 1000) % REPLY_TEXTS.CONVERSATION_END.NO_MORE_QUESTIONS.length);
            await step.context.sendActivity(REPLY_TEXTS.CONVERSATION_END.NO_MORE_QUESTIONS[number]);
            if (step.context.activity.channelId == 'slack') {
                await step.context.sendActivity({
                    channelData: {
                        'attachments': [
                            {
                                'text': 'Rate your overall expereince (1 being the lowest and 5 being the highest)',
                                'fallback': 'I am unable to give you the feedback message',
                                'callback_id': 'feedback',
                                'color': '#3AA3E3',
                                'attachment_type': 'default',
                                'actions': [
                                    {
                                        'name': 'feedback',
                                        'text': '1',
                                        'type': 'button',
                                        'style': 'danger',
                                        'value': 'feedback_1'
                                    },
                                    {
                                        'name': 'feedback',
                                        'text': '2',
                                        'type': 'button',
                                        'style': 'danger',
                                        'value': 'feedback_2'
                                    },
                                    {
                                        'name': 'feedback',
                                        'text': '3',
                                        'type': 'button',
                                        'value': 'feedback_3'
                                    },
                                    {
                                        'name': 'feedback',
                                        'text': '4',
                                        'type': 'button',
                                        'style': 'primary',
                                        'value': 'feedback_4'
                                    },
                                    {
                                        'name': 'feedback',
                                        'text': '5',
                                        'type': 'button',
                                        'style': 'primary',
                                        'value': 'feedback_5'
                                    }
                                ]
                            }
                        ]
                    }
                });
            }
            else {
                await sendRichCardWithoutFeedback(step.context, 'Rate your overall expereince (1 being the lowest and 5 being the highest)', [{ display: '1', value: 'feedback_1' }, { display: '2', value: 'feedback_2' }, { display: '3', value: 'feedback_3' }, { display: '4', value: 'feedback_4' }, { display: '5', value: 'feedback_5' }]);
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

export { Affirmation as AffirmationDialog };
