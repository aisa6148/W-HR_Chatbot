"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.LuisHandlerDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const bot_constants_1 = require("../configs/bot.constants");
const util = __importStar(require("util"));
const luis_service_1 = require("../services/luis.service");
const config_1 = __importDefault(require("../configs/config"));
const logger_1 = __importDefault(require("../models/logger"));
const chat_logger_1 = require("../middleware/chat-logger");
const unknown_dialog_1 = require("./unknown.dialog");
const helper_functions_1 = require("../utilities/helper.functions");
const bot_dialog_1 = require("../bot/bot.dialog");
const luisMap_dialog_1 = require("./luisMap.dialog");
const bot_controller_1 = require("../controllers/bot.controller");
const helper_functions_2 = require("../utilities/helper.functions");
class LuisHandler extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.dialogId = dialogId;
        this.dialogData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.LUIS_HANDLER_DIALOG_STATE);
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.start.bind(this)]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG, [
            this.collectResult.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
        this.addDialog(new luisMap_dialog_1.LuisMapDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_MAP_DIALOG));
        this.addDialog(new unknown_dialog_1.UnknownDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_RELOCATION_WATERFALL_DIALOG, [
            this.relocationConfusionStep0.bind(this),
            this.relocationConfusionStep1.bind(this),
        ]));
    }
    start(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const outerIntent = yield luis_service_1.getIntent(config_1.default.luis, step.context.activity.text);
            let { intent } = outerIntent.topScoringIntent;
            const { score } = outerIntent.topScoringIntent;
            intent = intent.replace('l_', '');
            logger_1.default.log({
                location: 'luishandler start',
                message: step.context.activity.text,
                intent: intent,
                score: score,
            }, step.context.activity);
            const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            userData['outerLuisIntent'] = intent;
            userData['outerLuisScore'] = score;
            yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(step.context, userData);
            yield bot_controller_1.conversationState.saveChanges(step.context);
            const directPolicies = [
                'General',
                'Leave',
                'HigherEducation',
                'Associate_Referral',
                'RewardsAndRecognition',
                'Gym_Guidelines',
                'ShiftAllowance',
                'OpenDoor',
                'MobileAndInternet',
                'Gratuity',
                'DressCode',
                'BackgroundChecks',
                'UnreportedAbsenteeism',
                'Discrimination',
                'IJP',
                'AlcoholDrug',
                'Information',
                'SafetyAndHealth',
                'Volunteer',
                'AssociateAssistance',
                'ViolenceFree',
                'NPS',
                'RSU',
                'BYOD',
                'MIP',
                'Talent_Mart',
                'Tax_and_Payroll',
                'Tax_and_Payroll_Investment_Dec',
                'Tax_and_Payroll_CTC',
                'Tax_and_Payroll_Medical',
                'Tax_and_Payroll_IPSF',
                'Tax_and_Payroll_Flexi_Benefit',
                'Tax_and_Payroll_Form_16',
                'Tax_and_Payroll_80C',
                'Tax_and_Payroll_Housing_Loan',
                'Tax_and_Payroll_HRA',
                'Tax_and_Payroll_PPF_PF_VPF',
                'Tax_and_Payroll_LTA',
                'HR_Mart_Module',
                'Creche',
                'Outpatient',
                'GoalSetting',
                'AnnualHealthReimbursement',
                'COVID_Reimbursement',
                'IT',
                'E_Learning',
                'MESite',
                'HealthAndWellness',
                'Onboarding',
                'insurance_new',
                'FWO'
            ];
            const relocationPolicies = ['UniversityRelocation', 'Relocation', 'Travel'];
            // @ts-ignore
            if (score <= config_1.default.innerLuisScore) {
                logger_1.default.log({
                    location: 'unknown dialog',
                    message: step.context.activity.text,
                }, step.context.activity);
                const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
                userData['unanswered'] = true;
                userData['unansweredQuestion'] = step.context.activity.text;
                yield chat_logger_1.BotLoggerMiddleware.queryProfile.set(step.context, userData);
                yield bot_controller_1.conversationState.saveChanges(step.context);
                const emailContent = util.format(bot_constants_1.MAILER.UNANSWERED.CONTENT, step.context.activity.text, config_1.default.dashboard.link, user.userID, step.context.activity.conversation.id, user.email);
                yield helper_functions_2.sendWithoutFeedback(step.context, 'Sorry, I am not aware of this.');
                yield helper_functions_2.sendRichCardWithoutFeedback(step.context, 'For now, I can assist you with:', bot_constants_1.GREETING_BUTTONS);
                yield helper_functions_2.sendRichCard(step.context, '', bot_constants_1.SHOW_MORE);
                // await Mail.sendMail(
                // 	config.emailOptionsTo,
                // 	user.email,
                // 	MAILER.UNANSWERED.SUBJECT,
                // 	emailContent,
                // );
                yield this.dialogData.delete(step.context);
                yield step.cancelAllDialogs();
            }
            else if (directPolicies.includes(intent)) {
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG, {
                    intent,
                    score,
                });
            }
            else if (relocationPolicies.includes(intent)) {
                if (score >= 0.6) {
                    this.dialogData.set(step.context, { intent, score });
                    return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_RELOCATION_WATERFALL_DIALOG);
                }
                else {
                    return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG, {
                        intent,
                        score,
                    });
                }
            }
            else {
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
            }
            return yield step.endDialog();
        });
    }
    relocationConfusionStep0(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = yield bot_dialog_1.Bot.context.get(step.context, undefined);
            logger_1.default.log({ location: 'RelocationConfusion[0] dialog', context: context }, step.context.activity);
            const dialogData = yield this.dialogData.get(step.context, {});
            if (context == undefined ||
                (context != 'Relocation' && context != 'UniversityRelocation' && context != 'Travel')) {
                yield this.dialogData.set(step.context, Object.assign(Object.assign({}, dialogData), { text: step.context.activity.text }));
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card('I have found the following policies to be the closest to your question. Please click to help me understand', [
                    { display: 'Relocation', value: 'relocation' },
                    { display: 'University Relocation', value: 'university relocation' },
                    { display: 'Travel', value: 'travel' },
                ]));
            }
            else {
                const score = dialogData.score || 1;
                yield this.dialogData.delete(step.context);
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG, {
                    intent: context,
                    score,
                });
            }
        });
    }
    relocationConfusionStep1(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = step.context.activity.text;
            logger_1.default.log({ location: 'RelocationConfusion[1] dialog' }, step.context.activity);
            const contextMap = {
                relocation: 'Relocation',
                'university relocation': 'UniversityRelocation',
                travel: 'Travel',
            };
            if (['relocation', 'university relocation', 'travel'].includes(text.toLocaleLowerCase())) {
                const dialogData = yield this.dialogData.get(step.context);
                yield this.dialogData.delete(step.context);
                step.context.activity.text = dialogData.text;
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG, {
                    intent: contextMap[text.toLocaleLowerCase()],
                    score: 1,
                });
            }
            else {
                yield this.dialogData.delete(step.context);
                yield step.cancelAllDialogs();
                return yield step.replaceDialog(this.dialogId);
            }
        });
    }
    collectResult(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const { intent: outerIntent, score: outerScore } = step.options;
            // @ts-ignore
            const luisUrl = config_1.default.outerluis[outerIntent];
            if (!luisUrl || !luisUrl.LuisEndpoint || !outerScore) {
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
            }
            if (outerScore >= config_1.default.outerLuisScore) {
                yield bot_dialog_1.Bot.context.set(step.context, outerIntent);
            }
            const { topScoringIntent, entities } = yield luis_service_1.getIntent(luisUrl.LuisEndpoint, step.context.activity.text);
            const { intent, score } = topScoringIntent;
            if (!intent || !score) {
                return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.UNKNOWN_WATERFALL_DIALOG);
            }
            const userData = yield chat_logger_1.BotLoggerMiddleware.queryProfile.get(step.context);
            userData['luisIntent'] = intent;
            userData['luisScore'] = score;
            userData['luisEntities'] = entities;
            return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.LUIS_MAP_DIALOG, {
                intent,
                score,
                entities,
            });
        });
    }
    run(turnContext, accessor) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
            dialogSet.add(this);
            const dialogContext = yield dialogSet.createContext(turnContext);
            const results = yield dialogContext.continueDialog();
            if (results && results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                yield dialogContext.beginDialog(this.id);
            }
        });
    }
}
exports.LuisHandlerDialog = LuisHandler;
//# sourceMappingURL=luisHandler.dialog.js.map