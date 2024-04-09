"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffirmationDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const bot_constants_1 = require("../configs/bot.constants");
class Affirmation extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.promptFeedback.bind(this),
        ]));
    }
    promptFeedback(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'Affirmation dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { entities } = step.options;
            if (entities && entities.length > 0 && entities[0].type == 'yes') {
                const number = Math.floor((Math.random() * 1000) % bot_constants_1.REPLY_TEXTS.CONVERSATION_END.ASK_ME_MORE.length);
                yield step.context.sendActivity(bot_constants_1.REPLY_TEXTS.CONVERSATION_END.ASK_ME_MORE[number]);
            }
            else {
                const number = Math.floor((Math.random() * 1000) % bot_constants_1.REPLY_TEXTS.CONVERSATION_END.NO_MORE_QUESTIONS.length);
                yield step.context.sendActivity(bot_constants_1.REPLY_TEXTS.CONVERSATION_END.NO_MORE_QUESTIONS[number]);
                if (step.context.activity.channelId == 'slack') {
                    yield step.context.sendActivity({
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
                    yield helper_functions_1.sendRichCardWithoutFeedback(step.context, 'Rate your overall expereince (1 being the lowest and 5 being the highest)', [{ display: '1', value: 'feedback_1' }, { display: '2', value: 'feedback_2' }, { display: '3', value: 'feedback_3' }, { display: '4', value: 'feedback_4' }, { display: '5', value: 'feedback_5' }]);
                }
            }
            return yield step.cancelAllDialogs();
        });
    }
    run(turnContext, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(turnContext);
            const results = yield dialogContext.continueDialog();
            if (results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
}
exports.AffirmationDialog = Affirmation;
//# sourceMappingURL=affirmation.dialog.js.map