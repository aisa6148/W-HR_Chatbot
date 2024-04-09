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
exports.FeedbackDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const chat_logger_1 = require("../middleware/chat-logger");
const FEEDBACK_REPLY1 = 'Thank you for your valuable feedback. \n\nI am continuously learning to assist you better. :)';
class Feedback extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.firstDialog.bind(this)]));
    }
    firstDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'Feedback dialog',
                message: step.context.activity.text
            }, step.context.activity);
            let feedback = step.context.activity.text;
            feedback = feedback.replace('feedback_', '');
            const queryParams = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
            if (feedback.includes('negative')) {
                queryParams.feedback = 'negative';
                yield helper_functions_1.send(step.context, FEEDBACK_REPLY1);
            }
            else {
                if ([3, 4, 5].includes(parseInt(feedback))) {
                    queryParams.feedback = 'positive';
                    yield helper_functions_1.send(step.context, FEEDBACK_REPLY1);
                }
                else {
                    yield helper_functions_1.sendRichCardWithoutFeedback(step.context, 'What went wrong?', [
                        { display: 'Incomplete', value: 'feedback_negative_Incomplete' },
                        { display: 'Inaccurate', value: 'feedback_negative_Inaccurate' },
                        { display: 'Unanswered Questions', value: 'feedback_negative_Unanswered_Questions' }
                    ]);
                }
            }
            yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(step.context, queryParams);
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
exports.FeedbackDialog = Feedback;
//# sourceMappingURL=feedback.dialog.js.map