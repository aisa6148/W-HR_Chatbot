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
exports.BYODServiceNowReqStatusDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const bot_constants_1 = require("../configs/bot.constants");
const bot_controller_1 = require("../controllers/bot.controller");
const optionValidationPrompt_1 = require("../utilities/optionValidationPrompt");
const REQUEST_ID = 'requestId';
class BYODServiceNowReqStatus extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!BYODServiceNowReqStatus.byodSericeNowData)
            BYODServiceNowReqStatus.byodSericeNowData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.BYOD_SERVICE_NOW_REQUEST_STATUS);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.askRequestId.bind(this),
            this.callServiceNowAPI.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
        this.addDialog(new botbuilder_dialogs_1.DateTimePrompt(bot_constants_1.BOT_DIALOG_NAMES.DATE_VALIDATE_PROMPT));
        this.addDialog(new optionValidationPrompt_1.OptionValidationPrompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
    }
    askRequestId(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'askServiceRequestID dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield BYODServiceNowReqStatus.byodSericeNowData.get(step.context, {});
            yield BYODServiceNowReqStatus.byodSericeNowData.set(step.context, properties);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card(bot_constants_1.BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_STATUS_DIALOG.REQUEST_ID.PROMPT, bot_constants_1.BYOD_AD_SERVICE_NOW.BYOD_SERVICE_NOW_STATUS_DIALOG.REQUEST_ID.BUTTONS));
        });
    }
    callServiceNowAPI(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'callServiceNowAPI dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield BYODServiceNowReqStatus.byodSericeNowData.get(step.context, {});
            properties[REQUEST_ID] = step.result;
            yield BYODServiceNowReqStatus.byodSericeNowData.set(step.context, properties);
            return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.BYOD_SERVICE_NOW_REQUEST_STATUS);
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
exports.BYODServiceNowReqStatusDialog = BYODServiceNowReqStatus;
//# sourceMappingURL=byodServiceNowReqStatus.dialog.js.map