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
exports.EligibilityDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
const bot_constants_1 = require("../configs/bot.constants");
const bot_controller_1 = require("../controllers/bot.controller");
const PARTICULARDAY = 'particularDay';
const NUMBER = 'number';
const TIME_PERIOD = 'time_period';
const CONTINUOUS = 'continuous';
const EXTENDED = 'extended';
const ADHOC = 'adHoc';
const FTE = 'fte';
const YES = 'Yes';
const NO = 'No';
const SENTENCE1 = 'You can work from home';
const SENTENCE2 = ", all you really need to do is report this to your Manager (You needn't apply on HR Mart!).";
const SENTENCE3 = 'You can avail wfh for ';
const SENTENCE4 = "I'm sorry, but the policy is applicable only to full time associates! :(";
class Eligibility extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
        if (!Eligibility.wfhEligibilityData)
            Eligibility.wfhEligibilityData = bot_controller_1.conversationState.createProperty(bot_constants_1.STATE_PROPERTY_NAMES.WFH_ELIGIBILITY_DATA);
        // validate what was passed in
        if (!dialogId)
            throw new Error('Missing parameter.  dialogId is required');
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(dialogId, [
            this.eligibility0.bind(this),
            this.eligibility1.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_FTE_DIALOG, [
            this.fteDialog0.bind(this),
            this.fteDialog1.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_ADHOC, [this.adhoc.bind(this)]));
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS, [
            this.continuous1.bind(this),
            this.continuous2.bind(this),
        ]));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT));
    }
    eligibility0(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const { entities } = step.options;
            logger_1.default.log({
                location: 'Eligibility dialog[0]',
                message: step.context.activity.text,
                entities,
            }, step.context.activity);
            const properties = {};
            for (const entity of entities) {
                properties[entity.type] = true;
            }
            const previousProperties = yield Eligibility.wfhEligibilityData.get(step.context, {});
            properties[FTE] = previousProperties[FTE] ? previousProperties[FTE] : properties[FTE];
            yield Eligibility.wfhEligibilityData.set(step.context, properties);
            if (!properties[FTE]) {
                return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card('Are you a Full Time Associate?', [
                    {
                        display: YES,
                        value: YES,
                    },
                    {
                        display: NO,
                        value: NO,
                    },
                ]));
            }
            else {
                return yield step.next();
            }
        });
    }
    eligibility1(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'Eligibility dialog[1]',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield Eligibility.wfhEligibilityData.get(step.context, {});
            if (step.result === YES || properties[FTE]) {
                properties[FTE] = true;
                if (properties[PARTICULARDAY]) {
                    yield helper_functions_1.sendWithoutFeedback(step.context, SENTENCE1 + SENTENCE2);
                }
                else if (properties[TIME_PERIOD]) {
                    return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_ADHOC);
                }
                // else if (properties[ADHOC]) {
                //     return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_SHORT_DURATION);
                // } else if (properties[EXTENDED]) {
                //     return await step.replaceDialog(BOT_DIALOG_NAMES.ELIGIBILITY_LONG_DURATION);
                // }
                else {
                    yield helper_functions_1.sendRichCard(step.context, 'Do you want to work from home for a short duration or an extended period?', [
                        { display: 'Short Duration', value: '#WFH#short_duration' },
                        { display: 'Extended Period', value: '#WFH#extended_period' },
                    ]);
                }
            }
            else if (step.result === NO) {
                yield helper_functions_1.sendWithoutFeedback(step.context, SENTENCE4);
            }
            return yield step.cancelAllDialogs();
        });
    }
    adhoc(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'ADHOC dialog[0]',
                message: step.context.activity.text,
            }, step.context.activity);
            const properties = yield Eligibility.wfhEligibilityData.get(step.context, {});
            switch (properties[TIME_PERIOD]) {
                case 'day':
                case 'days':
                    if (properties[NUMBER] <= 10) {
                        helper_functions_1.send(step.context, SENTENCE3 + properties[NUMBER] + ' ' + properties[TIME_PERIOD] + SENTENCE2);
                        return yield step.cancelAllDialogs();
                    }
                    else if (properties[NUMBER] > 10) {
                        if (properties[CONTINUOUS]) {
                            helper_functions_1.sendRichCard(step.context, 'You will have to apply for the Extended Flexible Work Option provided you meet the following criteria', [
                                {
                                    display: 'Eligibility Criteria',
                                    value: 'extended_wfh_eligibility_criteria',
                                },
                            ]);
                            return yield step.cancelAllDialogs();
                        }
                        else {
                            return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS);
                        }
                    }
                    else {
                        helper_functions_1.send(step.context, "All that you really need to do is report this to your Manager (You needn't apply on HR Mart!).");
                        return yield step.cancelAllDialogs();
                    }
                    break;
                case 'week':
                case 'weeks':
                    if (properties[NUMBER] <= 2) {
                        helper_functions_1.send(step.context, SENTENCE3 + properties[NUMBER] + ' ' + properties[TIME_PERIOD] + SENTENCE2);
                        return yield step.cancelAllDialogs();
                    }
                    else if (properties[NUMBER] > 2) {
                        if (properties[CONTINUOUS]) {
                            helper_functions_1.sendRichCard(step.context, bot_constants_1.ELIGIBILITY_DIALOG.TEXT, bot_constants_1.ELIGIBILITY_DIALOG.BUTTONS);
                            return yield step.cancelAllDialogs();
                        }
                        else {
                            return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS);
                        }
                    }
                    else {
                        helper_functions_1.send(step.context, "All that you really need to do is report this to your Manager (You needn't apply on HR Mart!).");
                        return yield step.cancelAllDialogs();
                    }
                    break;
                case 'month':
                case 'year':
                case 'months':
                    if (properties[CONTINUOUS]) {
                        helper_functions_1.sendRichCard(step.context, bot_constants_1.ELIGIBILITY_DIALOG.TEXT, bot_constants_1.ELIGIBILITY_DIALOG.BUTTONS);
                        return yield step.cancelAllDialogs();
                    }
                    else {
                        return yield step.replaceDialog(bot_constants_1.BOT_DIALOG_NAMES.ELIGIBILITY_CONTINUOUS);
                    }
                    break;
                default:
                    helper_functions_1.send(step.context, 'I seem to have run out of answers to your question :( Please contact gtshrops@email.wal-mart.com for more information');
                    return yield step.cancelAllDialogs();
            }
        });
    }
    continuous1(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'Continous dialog[0]',
                message: step.context.activity.text,
            }, step.context.activity);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, 'Do you wish to avail these for a continuous period of more than 2 weeks?');
        });
    }
    continuous2(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'Continous dialog[1]',
                message: step.context.activity.text,
            }, step.context.activity);
            if (step.result === YES) {
                helper_functions_1.sendRichCard(step.context, bot_constants_1.ELIGIBILITY_DIALOG.TEXT, bot_constants_1.ELIGIBILITY_DIALOG.BUTTONS);
                return yield step.cancelAllDialogs();
            }
            else {
                const properties = yield Eligibility.wfhEligibilityData.get(step.context, {});
                helper_functions_1.send(step.context, SENTENCE3 + properties[NUMBER] + ' ' + properties[TIME_PERIOD] + SENTENCE2);
                return yield step.cancelAllDialogs();
            }
        });
    }
    fteDialog0(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'FTE dialog[0]',
                message: step.context.activity.text,
            }, step.context.activity);
            return yield step.prompt(bot_constants_1.BOT_DIALOG_NAMES.TEXT_PROMPT, helper_functions_1.card('Are you a Full Time Associate?', [
                {
                    display: YES,
                    value: YES,
                },
                {
                    display: NO,
                    value: NO,
                },
            ]));
        });
    }
    fteDialog1(step) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log({
                location: 'FTE dialog[1]',
                message: step.context.activity.text,
            }, step.context.activity);
            if (step.result === YES) {
                return yield step.endDialog(YES);
            }
            else if (step.result == NO) {
                return yield step.endDialog(NO);
            }
            else {
                return yield step.cancelAllDialogs();
            }
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
exports.EligibilityDialog = Eligibility;
//# sourceMappingURL=eligibility.dialog.js.map