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
exports.notifySlackUser = exports.notifyUser = exports.deliverMessages = exports.card = exports.sendRichCardWithoutFeedback = exports.sendRichCard = exports.sendWithouthFeedbackAndWithDefaultFormatting = exports.sendWithoutFeedback = exports.send = exports.validateToken = exports.getConversationId = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("../configs/config"));
const logger_1 = __importDefault(require("../models/logger"));
const botbuilder_1 = require("botbuilder");
const bot_controller_1 = require("../controllers/bot.controller");
const botframework_connector_1 = require("botframework-connector");
/**
 * @description Method to get the current conversationID
 * @argument void
 */
exports.getConversationId = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield node_fetch_1.default(config_1.default.directLineRequest.url, config_1.default.directLineRequest);
        return res.json();
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions getConversationId', error: error });
    }
});
exports.validateToken = function (token) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            method: 'post',
            body: JSON.stringify({ token: token }),
            headers: {
                'api-key': config_1.default.signinoptions.apikey,
                'Content-Type': 'application/json',
                botid: config_1.default.signinoptions.botname
            }
        };
        try {
            const res = yield node_fetch_1.default(config_1.default.signinoptions.location + '/api/verifytoken', options);
            const body = yield res.json();
            return body.status;
        }
        catch (error) {
            logger_1.default.error({ location: 'helperfunctions validateToken', error: error, token: token });
            return 'failure';
        }
    });
};
exports.send = (context, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (context.activity.channelId === 'slack')
            text = santitizeString(text);
        const responseResource = yield context.sendActivity(text);
        const event = context.activity;
        event.type = 'event';
        event.name = 'feedback';
        event.value = { messageID: responseResource.documentID, elementID: responseResource.id };
        yield context.sendActivity(event);
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions send', error: error });
    }
});
exports.sendWithoutFeedback = (context, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (context.activity.channelId === 'slack')
            text = santitizeString(text);
        yield context.sendActivity(text);
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions sendWithoutFeedback', error: error });
    }
});
exports.sendWithouthFeedbackAndWithDefaultFormatting = (context, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield context.sendActivity(text);
    }
    catch (error) {
        logger_1.default.error({ location: 'sendWithouthFeedbackAndWithDefaultFormatting', error: error });
    }
});
exports.sendRichCard = (context, text, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (context.activity.channelId === 'slack')
            text = santitizeString(text);
        const message = exports.card(text, options, context.activity.channelId == 'msteams' ? botbuilder_1.ActionTypes.MessageBack : botbuilder_1.ActionTypes.PostBack);
        const responseResource = yield context.sendActivity(message);
        const activity = context.activity;
        activity.type = 'event';
        activity.name = 'feedback';
        activity.value = { messageID: responseResource.documentID, elementID: responseResource.id };
        yield context.sendActivity(activity);
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions sendRichCard', error: error });
    }
});
exports.sendRichCardWithoutFeedback = (context, text, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (context.activity.channelId == 'slack')
            text = santitizeString(text);
        const activity = exports.card(text, options, context.activity.channelId == 'msteams' ? botbuilder_1.ActionTypes.MessageBack : botbuilder_1.ActionTypes.PostBack);
        yield context.sendActivity(activity);
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions sendRichCardWithoutFeedback', error: error });
    }
});
function santitizeString(text) {
    text = text.replace(/\[(.*?)\]\((.*?)\)/, '<$2|$1>');
    text = text.replace(/&#160;/g, ' ');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&apos;/g, "'");
    text = text.replace(/&amp;/g, '&');
    return text;
}
exports.card = (text, buttons, cardType) => {
    const reply = { type: botbuilder_1.ActivityTypes.Message };
    const cardAction = [];
    buttons.forEach(button => {
        cardAction.push({
            type: cardType || botbuilder_1.ActionTypes.PostBack,
            title: button.display,
            value: button.value,
            text: button.value
        });
    });
    const card = botbuilder_1.CardFactory.heroCard('', undefined, cardAction, { text });
    reply.attachments = [card];
    return reply;
};
exports.deliverMessages = (context, messages) => __awaiter(void 0, void 0, void 0, function* () {
    for (const message of messages) {
        if (message.feedback) {
            if (message.buttons) {
                yield exports.sendRichCard(context, message.text, message.buttons);
            }
            else {
                yield exports.send(context, message.text);
            }
        }
        else {
            if (message.buttons) {
                yield exports.sendRichCardWithoutFeedback(context, message.text, message.buttons);
            }
            else {
                yield exports.sendWithoutFeedback(context, message.text);
            }
        }
    }
});
exports.notifyUser = (address, messages) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        botframework_connector_1.MicrosoftAppCredentials.trustServiceUrl(address.serviceUrl);
        for (const message of messages) {
            if (message.text) {
                yield bot_controller_1.BotAdapter.createConversation(botbuilder_1.TurnContext.getConversationReference(address), (turnContext) => __awaiter(void 0, void 0, void 0, function* () {
                    yield turnContext.sendActivity(message.text);
                }));
            }
            else if (message.image) {
                yield bot_controller_1.BotAdapter.createConversation(botbuilder_1.TurnContext.getConversationReference(address), (turnContext) => __awaiter(void 0, void 0, void 0, function* () {
                    yield turnContext.sendActivity({
                        channelData: {
                            attachments: [
                                {
                                    text: '',
                                    fallback: 'Ask ME notification',
                                    callback_id: 'birthday',
                                    attachment_type: 'default',
                                    image_url: message.image
                                }
                            ]
                        }
                    });
                }));
            }
            else if (message.buttons) {
                const msgButtons = [];
                for (const button of message.buttons) {
                    const obj = {
                        type: 'postBack',
                        title: button.display,
                        value: button.value
                    };
                    msgButtons.push(obj);
                }
                yield bot_controller_1.BotAdapter.createConversation(botbuilder_1.TurnContext.getConversationReference(address), (turnContext) => __awaiter(void 0, void 0, void 0, function* () {
                    yield turnContext.sendActivity({
                        attachments: [
                            botbuilder_1.CardFactory.heroCard('', [{ url: '' }], msgButtons, { text: message.text })
                        ]
                    });
                }));
            }
            else {
                throw new Error('Format Error');
            }
        }
        return 'Notified';
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions notifyUser', error: error });
        throw error;
    }
});
exports.notifySlackUser = (address, messages) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        botframework_connector_1.MicrosoftAppCredentials.trustServiceUrl(address.serviceUrl);
        const ref = botbuilder_1.TurnContext.getConversationReference(address);
        ref.conversation = {
            isGroup: false,
            id: ref.bot.id + ':' + ref.user.id.split(':')[0],
            conversationType: 'slack',
            tenantId: '',
            name: ''
        };
        for (const message of messages) {
            if (address.channelId === 'slack' && message.text) {
                message.text = message.text.replace(/\[(.*?)\]\((.*?)\)/, '<$2|$1>');
                message.text = message.text.replace(/&#160;/g, ' ');
                message.text = message.text.replace(/&#39;/g, "'");
            }
            if (message.text) {
                yield bot_controller_1.BotAdapter.createConversation(ref, (t1) => __awaiter(void 0, void 0, void 0, function* () {
                    const ref2 = botbuilder_1.TurnContext.getConversationReference(t1.activity);
                    yield t1.adapter.continueConversation(ref2, (t2) => __awaiter(void 0, void 0, void 0, function* () {
                        yield t2.sendActivity(message.text);
                    }));
                }));
            }
            else if (message.image) {
                yield bot_controller_1.BotAdapter.createConversation(ref, (t1) => __awaiter(void 0, void 0, void 0, function* () {
                    const ref2 = botbuilder_1.TurnContext.getConversationReference(t1.activity);
                    yield t1.adapter.continueConversation(ref2, (t2) => __awaiter(void 0, void 0, void 0, function* () {
                        yield t2.sendActivity({
                            channelData: {
                                attachments: [
                                    {
                                        text: '',
                                        fallback: 'Ask ME notification',
                                        callback_id: 'birthday',
                                        attachment_type: 'default',
                                        image_url: message.image
                                    }
                                ]
                            }
                        });
                    }));
                }));
            }
            else if (message.buttons) {
                const msgButtons = [];
                for (const button of message.buttons) {
                    const obj = {
                        type: 'postBack',
                        title: button.display,
                        value: button.value
                    };
                    msgButtons.push(obj);
                }
                yield bot_controller_1.BotAdapter.createConversation(ref, (t1) => __awaiter(void 0, void 0, void 0, function* () {
                    const ref2 = botbuilder_1.TurnContext.getConversationReference(t1.activity);
                    yield t1.adapter.continueConversation(ref2, (t2) => __awaiter(void 0, void 0, void 0, function* () {
                        yield t2.sendActivity({
                            attachments: [
                                botbuilder_1.CardFactory.heroCard('', [{ url: '' }], msgButtons, { text: message.text })
                            ]
                        });
                    }));
                }));
            }
            else {
                throw new Error('Format Error');
            }
        }
        return 'Notified';
    }
    catch (error) {
        logger_1.default.error({ location: 'helperfunctions notifyUser', error: error });
        throw error;
    }
});
//# sourceMappingURL=helper.functions.js.map