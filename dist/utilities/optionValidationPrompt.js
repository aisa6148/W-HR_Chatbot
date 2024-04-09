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
exports.OptionValidationPrompt = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const bot_constants_1 = require("../configs/bot.constants");
class OptionValidationPrompt extends botbuilder_dialogs_1.TextPrompt {
    constructor(dialogId) {
        super(dialogId, (prompt) => __awaiter(this, void 0, void 0, function* () {
            if (!prompt.recognized.succeeded) {
                yield prompt.context.sendActivity(bot_constants_1.REPLY_TEXTS.VALIDATE_BUTTONS);
                return false;
            }
            else {
                try {
                    const value = prompt.recognized.value;
                    const options = prompt.options.choices;
                    if (options) {
                        if (options.includes(value)) {
                            return true;
                        }
                        else {
                            yield prompt.context.sendActivity(bot_constants_1.REPLY_TEXTS.VALIDATE_BUTTONS);
                            return false;
                        }
                    }
                }
                catch (error) {
                    logger_1.default.error({
                        location: 'OptionValidationPrompt prompt',
                        error: error
                    });
                }
            }
        }));
    }
}
exports.OptionValidationPrompt = OptionValidationPrompt;
//# sourceMappingURL=optionValidationPrompt.js.map