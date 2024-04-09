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
exports.HRDataDialogDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const chat_logger_1 = require("../middleware/chat-logger");
const hrmart_functions_1 = require("../utilities/hrmart.functions");
const associate_services_1 = require("../services/associate.services");
const UNFORTUNATELY_NO_DETAILS = "Unfortunately I couldn't find your details. Looks like you are new to me :( , please reach out to your manager or email info@hr-mart.com for more info";
class HRDataDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.firstDialog.bind(this)]));
    }
    firstDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entities } = step.options;
            logger_1.default.log({
                location: 'HRDataDialog dialog',
                message: step.context.activity.text,
                entities
            }, step.context.activity);
            const results = {};
            entities.forEach(element => {
                results[entities[0].type] = entities[0].type;
            });
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const email = user.email;
            if (!email) {
                yield helper_functions_1.send(step.context, UNFORTUNATELY_NO_DETAILS);
                return yield step.cancelAllDialogs();
            }
            else {
                let messageSent = false;
                if (results.team) {
                    const details = yield hrmart_functions_1.fetchTeam(email);
                    messageSent = true;
                    if (details) {
                        yield helper_functions_1.send(step.context, 'You belong to ' + details.team);
                    }
                    else {
                        yield helper_functions_1.send(step.context, UNFORTUNATELY_NO_DETAILS);
                    }
                }
                if (results.hrbp) {
                    const details = yield hrmart_functions_1.fetchHRBP(email);
                    messageSent = true;
                    if (details) {
                        yield helper_functions_1.send(step.context, 'Your HRBP is ' + details.name);
                    }
                    else {
                        yield helper_functions_1.send(step.context, UNFORTUNATELY_NO_DETAILS);
                    }
                }
                if (results.gts) {
                    const gtsid = yield associate_services_1.getGTSID(email);
                    messageSent = true;
                    if (gtsid && gtsid.gts) {
                        yield helper_functions_1.send(step.context, 'Your GTS ID is ' + gtsid.gts);
                    }
                    else {
                        yield helper_functions_1.send(step.context, UNFORTUNATELY_NO_DETAILS);
                    }
                }
                if (results.manager) {
                    const details = yield hrmart_functions_1.fetchManager(email);
                    messageSent = true;
                    if (details) {
                        yield helper_functions_1.send(step.context, 'Your Manager is ' + details.name);
                    }
                    else {
                        yield helper_functions_1.send(step.context, UNFORTUNATELY_NO_DETAILS);
                    }
                }
                if (!messageSent) {
                    yield helper_functions_1.send(step.context, 'Hey What exactly are you looking for!. For now I can help you with your HRBP, Manager, Team, GTSID details.');
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
exports.HRDataDialogDialog = HRDataDialog;
//# sourceMappingURL=hrdata.dialog.js.map