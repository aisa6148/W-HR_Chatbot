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
exports.UnknownDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const bot_constants_1 = require("../configs/bot.constants");
const logger_1 = __importDefault(require("../models/logger"));
const chat_logger_1 = require("../middleware/chat-logger");
const helper_functions_1 = require("../utilities/helper.functions");
const bot_controller_1 = require("../controllers/bot.controller");
class Unknown extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.promptHRResponse.bind(this),
            this.handlePromptHRResponseReply.bind(this),
        ]));
    }
    promptHRResponse(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'unknown dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
            userData['unanswered'] = true;
            userData['unansweredQuestion'] = step.context.activity.text;
            yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(step.context, userData);
            yield bot_controller_1.conversationState.saveChanges(step.context);
            yield helper_functions_1.sendWithoutFeedback(step.context, 'Sorry, I am not aware of this as of now.');
            yield helper_functions_1.sendRichCardWithoutFeedback(step.context, 'Feel free to write to gtshrops@email.wal-mart.com for any assistance. For now, I can assist you with:', bot_constants_1.GREETING_BUTTONS);
            yield helper_functions_1.sendRichCardWithoutFeedback(step.context, '', bot_constants_1.SHOW_MORE);
            return step.endDialog();
            // return await step.prompt(
            // 	BOT_DIALOG_NAMES.TEXT_PROMPT,
            // 	card(
            // 		'Do you want me to check with the HR regarding this and get back to you? (Feel free to write to gtshrops@email.wal-mart.com for any assistance.)',
            // 		[
            // 			{ display: 'Yes, let me know ASAP!', value: 'Yes' },
            // 			{ display: "Nop, I'm good", value: 'No' },
            // 		],
            // 	),
            // );
        });
    }
    handlePromptHRResponseReply(step) {
        return __awaiter(this, void 0, void 0, function* () {
            step.context.sendActivity('Heres what you said' + step.context.activity.text);
            return step.endDialog();
        });
    }
}
exports.UnknownDialog = Unknown;
//# sourceMappingURL=unknown.dialog.js.map