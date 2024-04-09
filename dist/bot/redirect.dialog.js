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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectDialog = void 0;
const { TurnContext, StatePropertyAccessor } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, WaterfallStepContext, DialogTurnResult, DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { BOT_DIALOG_NAMES } = require('../configs/bot.constants');
const logger = require('../models/logger');
const { UnknownDialog } = require('../bot-dialogs/unknown.dialog');
const { GreetingsDialog } = require('../bot-dialogs/greetings.dialog');
class Redirect extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new WaterfallDialog(dialogId, [this.redirect.bind(this)]));
        this.addDialog(new UnknownDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG));
        this.addDialog(new GreetingsDialog(BOT_DIALOG_NAMES.GREETINGS_DIALOG));
    }
    redirect(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dialogId, entities } = step.options;
            logger.log({ location: 'redirect dialog', dialogId, entities }, step.context.activity);
            if (!dialogId || !this.findDialog(dialogId)) {
                return yield step.replaceDialog(BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
            }
            return yield step.replaceDialog(dialogId, { entities });
        });
    }
    run(turnContext, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(turnContext);
            const results = yield dialogContext.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
}
exports.RedirectDialog = Redirect;
//# sourceMappingURL=redirect.dialog.js.map