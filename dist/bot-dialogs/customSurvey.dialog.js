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
exports.CustomSurveyDialog = void 0;
const bot_controller_1 = require("../controllers/bot.controller");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const bot_constants_1 = require("../configs/bot.constants");
const chat_logger_1 = require("../middleware/chat-logger");
const optionValidationPrompt_1 = require("../utilities/optionValidationPrompt");
const associate_services_1 = require("../services/associate.services");
const associateSurvey_service_1 = require("../services/associateSurvey.service");
// @ts-ignore
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = require("uuid");
const QUESTIONS_LIST = 'quesionsList';
const GTS_ID = 'gtsId';
const RESPONSE = 'response';
const V4_ID = 'v4_id';
const EMAIL = 'email';
class CustomSurvey extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!CustomSurvey.customSurveyData)
            CustomSurvey.customSurveyData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.CUSTOM_SURVEY_DATA);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [this.checkIfSurveyGiven.bind(this)]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.SURVEY_QUESTION, [this.queryQuestion.bind(this)]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.SURVEY_QUESTION_LOOP, [
            this.queryQuestionListAndLoop.bind(this),
            this.saveResponses.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.CONFIRM_SUBMIT, [
            this.confirmDialog.bind(this),
            this.writeInDB.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
        this.addDialog(new optionValidationPrompt_1.OptionValidationPrompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT));
    }
    checkIfSurveyGiven(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'checkIfSurveyGiven dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { entities } = step.options;
            // gtsid
            const user = yield chat_logger_1.BotLoggerMiddleware.userProfile.get(step.context);
            const properties = yield CustomSurvey.customSurveyData.get(step.context, {});
            const email = user.email;
            const gtsid = yield associate_services_1.getGTSID(email);
            if (!(gtsid && gtsid.gts)) {
                yield step.context.sendActivity(bot_constants_1.LEAVE_MANAGEMENT.LEAVE_MANAGEMENT_DIALOG.UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART);
                return yield step.cancelAllDialogs();
            }
            properties[GTS_ID] = gtsid.gts;
            properties[V4_ID] = uuid_1.v4();
            properties[EMAIL] = email;
            properties[RESPONSE] = [];
            yield CustomSurvey.customSurveyData.set(step.context, properties);
            const userSurveyResponded = yield associateSurvey_service_1.getUserDetailsFromSurveyUserDetailsDB(gtsid.gts, entities[0].type);
            const hasUserTakenSurvey = userSurveyResponded ? true : false;
            if (hasUserTakenSurvey) {
                yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.ALREADY_RECORDED);
            }
            else {
                const initialIndex = 0;
                const properties = yield CustomSurvey.customSurveyData.get(step.context, {});
                properties[QUESTIONS_LIST] = yield associateSurvey_service_1.getSurveyById(entities[0].type);
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.SURVEY_QUESTION, { initialIndex });
            }
            return yield step.cancelAllDialogs();
        });
    }
    queryQuestion(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'queryQuestion dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield CustomSurvey.customSurveyData.get(step.context, {});
            const { initialIndex } = step.options;
            const question = properties[QUESTIONS_LIST][initialIndex];
            const index = properties[QUESTIONS_LIST].indexOf(question);
            const params = { question, index };
            if (question)
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.SURVEY_QUESTION_LOOP, params);
            else {
                if (properties[QUESTIONS_LIST].length === initialIndex) {
                    try {
                        yield associateSurvey_service_1.recordAssociateSurveyUserDetails(properties[GTS_ID], properties[EMAIL], properties[QUESTIONS_LIST][0].surveyId);
                    }
                    catch (error) {
                        yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
                        return yield step.cancelAllDialogs();
                    }
                    yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.END_MESSAGE);
                    return yield step.cancelAllDialogs();
                }
                yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
                return yield step.cancelAllDialogs();
            }
        });
    }
    queryQuestionListAndLoop(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'queryQuestionListAndLoop dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const { question, index } = step.options;
            if (question.buttons) {
                const questionButtons = question.buttons.split(', ');
                const buttons = [];
                const buttonValueForValidation = [];
                questionButtons.forEach(button => {
                    buttons.push({
                        display: button,
                        value: button + '#' + question.questionId,
                    });
                    buttonValueForValidation.push(button + '#' + question.questionId);
                });
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, yield helper_functions_1.card(question.question, buttons), buttonValueForValidation);
            }
            else {
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, question.question);
            }
        });
    }
    saveResponses(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'saveResponses dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield CustomSurvey.customSurveyData.get(step.context, {});
            const { question, index } = step.options;
            const initialIndex = index + 1;
            if (step.result) {
                properties[RESPONSE].push({
                    surveyId: question.surveyId,
                    questionId: question.questionId,
                    USER_GTSID: properties[GTS_ID],
                    response: step.result.split('#')[0],
                });
                yield CustomSurvey.customSurveyData.set(step.context, properties);
                try {
                    yield associateSurvey_service_1.recordUserSurveyResopnse(properties[V4_ID], question.surveyId, { questionId: question.questionId, response: step.result.split('#')[0] }, properties[GTS_ID]);
                }
                catch (error) {
                    yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
                    return yield step.cancelAllDialogs();
                }
                return yield step.beginDialog(bot_constants_1.BOT_DIALOG_NAMES.SURVEY_QUESTION, { initialIndex });
            }
            else {
                return yield step.endDialog();
            }
        });
    }
    confirmDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'confirmDialog dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield CustomSurvey.customSurveyData.get(step.context, {});
            if (properties[RESPONSE].length > 0) {
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.OPTION_VALIDATE_PROMPT, yield helper_functions_1.card(bot_constants_1.CUSTOM_SURVEY.SUBMIT.TEXT, bot_constants_1.CUSTOM_SURVEY.SUBMIT.BUTTONS), bot_constants_1.CUSTOM_SURVEY.SUBMIT.OPTIONS);
            }
        });
    }
    writeInDB(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'writeInDB dialog',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield CustomSurvey.customSurveyData.get(step.context, {});
            if (step.result === 'yes') {
                const surveyId = properties[RESPONSE][0].surveyId;
                const USER_GTSID = properties[RESPONSE][0].USER_GTSID;
                if (!lodash_1.default.every(properties[RESPONSE], 
                // @ts-ignore
                response => response.surveyId === surveyId && response.USER_GTSID === USER_GTSID)) {
                    yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
                    return yield step.cancelAllDialogs();
                }
                const answers = properties[RESPONSE].map((response) => ({
                    questionId: response.questionId,
                    response: response.response,
                }));
                try {
                    yield associateSurvey_service_1.recordUserSurveyResopnse(uuid_1.v4(), surveyId, answers, USER_GTSID);
                }
                catch (error) {
                    yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.RESPONSE_RECORDED_ERROR);
                    return yield step.cancelAllDialogs();
                }
                yield helper_functions_1.send(step.context, bot_constants_1.CUSTOM_SURVEY.RESPONSE_RECORDED);
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
exports.CustomSurveyDialog = CustomSurvey;
//# sourceMappingURL=customSurvey.dialog.js.map