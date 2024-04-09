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
exports.Bot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const bot_constants_1 = require("../configs/bot.constants");
const luisHandler_dialog_1 = require("../bot-dialogs/luisHandler.dialog");
const luisMap_dialog_1 = require("../bot-dialogs/luisMap.dialog");
const bot_controller_1 = require("../controllers/bot.controller");
const feedback_dialog_1 = require("./feedback.dialog");
const chat_logger_1 = require("../middleware/chat-logger");
const helper_functions_1 = require("../utilities/helper.functions");
class Bot {
    constructor() {
        Bot.context = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.POLICY_CONTEXT_USER);
        this.dialogState = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.DIALOG_STATE_PROPERTY);
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new luisHandler_dialog_1.LuisHandlerDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_DIALOG));
        this.dialogs.add(new luisMap_dialog_1.LuisMapDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_MAP_DIALOG));
        this.dialogs.add(new feedback_dialog_1.FeedbackDialog(bot_constants_1.BOT_DIALOG_NAMES.FEEDBACK_HANDLER_DIALOG));
    }
    onTurn(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                const text = turnContext.activity.text;
                const dialogContext = yield this.dialogs.createContext(turnContext);
                if (!dialogContext.context.responded) {
                    if (text.toLocaleLowerCase() === bot_constants_1.REPLY_TEXTS.QUIT) {
                        yield turnContext.sendActivity(bot_constants_1.REPLY_TEXTS.PROCESS_DISCARDED);
                        yield dialogContext.cancelAllDialogs();
                    }
                    else {
                        yield dialogContext.continueDialog();
                    }
                }
                if (!dialogContext.context.responded) {
                    if (text.match(/^#[0-9a-zA-Z_#]+$/)) {
                        const split = text.trim().split('#');
                        if (split.length < 3) {
                            yield dialogContext.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_DIALOG);
                        }
                        else {
                            yield Bot.context.set(turnContext, split[1]);
                            const intent = split[2];
                            const entities = [];
                            if (split.length > 3) {
                                entities.push({
                                    entity: split[3],
                                    type: split[3],
                                    score: 1,
                                });
                            }
                            yield dialogContext.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_MAP_DIALOG, {
                                intent,
                                entities,
                            });
                        }
                    }
                    else if (text.match(/^feedback_[0-9a-zA-Z_]+$/)) {
                        yield dialogContext.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.FEEDBACK_HANDLER_DIALOG);
                    }
                    else {
                        yield dialogContext.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_DIALOG);
                    }
                }
                if (!dialogContext.context.responded) {
                    logger_1.default.log({
                        location: 'unknown dialog',
                        message: dialogContext.context.activity.text,
                    }, dialogContext.context.activity);
                    const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(dialogContext.context);
                    userData['unanswered'] = true;
                    userData['unansweredQuestion'] = dialogContext.context.activity.text;
                    yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(dialogContext.context, userData);
                    yield bot_controller_1.conversationState.saveChanges(dialogContext.context);
                    yield helper_functions_1.sendWithoutFeedback(dialogContext.context, 'Sorry, I am not aware of this.');
                    yield helper_functions_1.sendRichCardWithoutFeedback(dialogContext.context, 'For now, I can assist you with:', bot_constants_1.GREETING_BUTTONS);
                    yield helper_functions_1.sendRichCardWithoutFeedback(dialogContext.context, '', bot_constants_1.SHOW_MORE);
                    yield dialogContext.cancelAllDialogs();
                }
                logger_1.default.debug({ message: text }, turnContext.activity);
            }
            yield bot_controller_1.conversationState.saveChanges(turnContext);
        });
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.dialog.js.map