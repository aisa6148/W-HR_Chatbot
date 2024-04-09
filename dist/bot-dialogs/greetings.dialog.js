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
exports.GreetingsDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const bot_constants_1 = require("../configs/bot.constants");
const chat_logger_1 = require("../middleware/chat-logger");
const bot_controller_1 = require("../controllers/bot.controller");
const WEBCHAT = 'webchat';
const SLACK = 'slack';
const config_1 = __importDefault(require("../configs/config"));
class Greetings extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        if (!Greetings.firstTime)
            Greetings.firstTime = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.FIRST_TIME_GREETING);
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.greeting.bind(this)]));
    }
    greeting(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'Greeting dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const firstTime = yield Greetings.firstTime.get(step.context, true);
            if (firstTime) {
                yield Greetings.firstTime.set(step.context, false);
                // await conversationState.saveChanges(step.context, true);
                if (step.context.activity.channelId === SLACK) {
                    yield helper_functions_1.sendWithouthFeedbackAndWithDefaultFormatting(step.context, `_Your privacy is important to us. For Privacy policy, please click <${config_1.default.privacyLink}|here>_`);
                }
                const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
                const name = user.userName || user.step.context.activity.from.name || '';
                yield helper_functions_1.sendWithoutFeedback(step.context, 'Hey ' + name + bot_constants_1.REPLY_TEXTS.FIRST_INTRO_TEXT);
            }
            else {
                const number = Math.floor((Math.random() * 1000) % bot_constants_1.REPLY_TEXTS.GREETINGS.length);
                yield helper_functions_1.sendWithoutFeedback(step.context, bot_constants_1.REPLY_TEXTS.GREETINGS[number]);
            }
            yield helper_functions_1.sendRichCard(step.context, 'I can assist you with:', bot_constants_1.GREETING_BUTTONS);
            yield helper_functions_1.sendRichCard(step.context, '', bot_constants_1.SHOW_MORE);
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
exports.GreetingsDialog = Greetings;
//# sourceMappingURL=greetings.dialog.js.map