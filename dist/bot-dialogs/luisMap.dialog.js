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
exports.LuisMapDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const bot_constants_1 = require("../configs/bot.constants");
const logger_1 = __importDefault(require("../models/logger"));
const chat_logger_1 = require("../middleware/chat-logger");
const unknown_dialog_1 = require("./unknown.dialog");
const helper_functions_1 = require("../utilities/helper.functions");
const bot_dialog_1 = require("../bot/bot.dialog");
const luisMapDB_functions_1 = require("../utilities/luisMapDB.functions");
const redirect_dialog_1 = require("../bot/redirect.dialog");
const GENERAL = 'General';
class LuisMap extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.start.bind(this)]));
        this.addDialog(new redirect_dialog_1.RedirectDialog(bot_constants_1.BOT_DIALOG_NAMES.REDIRECT_DIALOG));
        this.addDialog(new unknown_dialog_1.UnknownDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG));
    }
    start(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const { intent, entities } = step.options;
            const mappedDialog = yield luisMapDB_functions_1.fetchLuisMap(intent);
            logger_1.default.log({
                location: 'luisMap start',
                intent,
                entities
            }, step.context.activity);
            if (mappedDialog) {
                switch (mappedDialog.type) {
                    case 'DirectDialog':
                        return yield this.directDialogFunction(step, mappedDialog);
                    case 'ContextDialog':
                        return yield this.contextDialogFunction(step, mappedDialog);
                    case 'RedirectDialog':
                        return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.REDIRECT_DIALOG, {
                            dialogId: mappedDialog.value,
                            entities
                        });
                    case 'EntityDialog':
                        return this.entityDialogFunction(step, mappedDialog);
                    default:
                        const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
                        userData['unanswered'] = true;
                        yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(step.context, userData);
                        // mailer.send(session);
                        return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
                }
            }
            else {
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
            }
            return yield step.cancelAllDialogs();
        });
    }
    directDialogFunction(step, mappedDialog) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = mappedDialog.messages;
            yield helper_functions_1.deliverMessages(step.context, messages);
            return yield step.cancelAllDialogs();
        });
    }
    contextDialogFunction(step, mappedDialog) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = yield bot_dialog_1.Bot.context.get(step.context);
            if (!mappedDialog.contexts[context]) {
                context = GENERAL;
            }
            else if (mappedDialog.contexts[context]) {
                const messages = mappedDialog.contexts[context].messages;
                yield helper_functions_1.deliverMessages(step.context, messages);
                return yield step.cancelAllDialogs();
            }
            else {
                // Suggest change of context or rephrase of question logic
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
            }
            return yield step.cancelAllDialogs();
        });
    }
    entityDialogFunction(step, mappedDialog) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entities } = step.options;
            let context = yield bot_dialog_1.Bot.context.get(step.context);
            let entity = GENERAL;
            if (!mappedDialog.contexts[context]) {
                context = GENERAL;
            }
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].type != context && entity == GENERAL) {
                    if (mappedDialog.contexts[context] && mappedDialog.contexts[context][entities[i].type]) {
                        entity = entities[i].type;
                    }
                }
            }
            logger_1.default.log({ location: 'luis-handler.js switch case EntityDialog', entity }, step.context.activity);
            if (mappedDialog.contexts[context] && mappedDialog.contexts[context][entity]) {
                const messages = mappedDialog.contexts[context][entity]
                    .messages;
                yield helper_functions_1.deliverMessages(step.context, messages);
                return yield step.cancelAllDialogs();
            }
            else {
                // Suggest change of context or rephrase of question logic
                const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
                userData['unanswered'] = true;
                yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(step.context, userData);
                // mailer.send(session);
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
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
exports.LuisMapDialog = LuisMap;
//# sourceMappingURL=luisMap.dialog.js.map