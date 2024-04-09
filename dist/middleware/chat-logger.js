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
exports.QUERY_PARAMS = exports.BotLoggerMiddleware = void 0;
const botbuilder_1 = require("botbuilder");
const uuid = __importStar(require("uuid"));
const logger_1 = __importDefault(require("../models/logger"));
const chatlogger_1 = __importDefault(require("../models/bot-logger/chatlogger"));
const channel_handler_1 = require("../channels/channel-handler");
const config_1 = __importDefault(require("../configs/config"));
const bot_constants_1 = require("../configs/bot.constants");
const CURRENT_USER = bot_constants_1.STATE_PROPERTY_NAMES.CURRENT_USER || 'current-user';
const CURRENT_USER_CONVERSATION = bot_constants_1.STATE_PROPERTY_NAMES.CURRENT_USER_CONVERSATION || 'current-user-conversation';
const PROFILE_CONVERSATION_START = bot_constants_1.STATE_PROPERTY_NAMES.PROFILE_CONVERSATION_START || 'profile-conversation-start';
const PROFILE_CONVERSATION_LAST = bot_constants_1.STATE_PROPERTY_NAMES.PROFILE_CONVERSATION_LAST || 'profile-conversation-last';
const QUERY_PARAMS = bot_constants_1.STATE_PROPERTY_NAMES.QUERY_PARAMS || 'query-profile';
exports.QUERY_PARAMS = QUERY_PARAMS;
class BotLoggerMiddleware {
    constructor(conversationState, userState, adapter) {
        this.chatLogger = new chatlogger_1.default(config_1.default.cosmosOptions.host, config_1.default.cosmosOptions.masterKey, config_1.default.botID, config_1.default.botName, config_1.default.env === 'PROD' ? 'PROD' : 'DEV');
        this.adapter = adapter;
        this.conversationState = conversationState;
        this.userState = userState;
        this.conversationRegister = conversationState.createProperty(CURRENT_USER_CONVERSATION);
        this.startTimeStamp = conversationState.createProperty(PROFILE_CONVERSATION_START);
        this.endTimeStamp = conversationState.createProperty(PROFILE_CONVERSATION_LAST);
        this.sendActivitiesHandler = this.sendActivitiesHandler.bind(this);
        this.updateQueryProfile = this.updateQueryProfile.bind(this);
        if (!BotLoggerMiddleware.userProfile)
            BotLoggerMiddleware.userProfile = userState.createProperty(CURRENT_USER);
        if (!BotLoggerMiddleware.queryProfile)
            BotLoggerMiddleware.queryProfile = conversationState.createProperty(QUERY_PARAMS);
    }
    static getInstance(conversationState, userState, adapter) {
        if (this.botLoggerMiddleware) {
            return this.botLoggerMiddleware;
        }
        else {
            this.botLoggerMiddleware = new BotLoggerMiddleware(conversationState, userState, adapter);
            return this.botLoggerMiddleware;
        }
    }
    onTurn(turnContext, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (turnContext.activity.type === botbuilder_1.ActivityTypes.Message) {
                // Register User
                try {
                    const user = yield BotLoggerMiddleware.userProfile.get(turnContext, undefined);
                    if (user != undefined) {
                        // if logic will always execute faster than else and else requires branch instruction
                    }
                    else {
                        yield this.updateUserDetails(turnContext);
                    }
                }
                catch (error) {
                    error && logger_1.default.error({ location: 'onTurn Register User', error });
                }
                // Register Conversation
                try {
                    const conversation = yield this.conversationRegister.get(turnContext, undefined);
                    if (conversation !== undefined && conversation !== false) {
                        // if logic will always execute faster than else and else requires branch instruction
                        this.endTimeStamp.set(turnContext, new Date().valueOf());
                    }
                    else {
                        yield this.conversationRegister.set(turnContext, true);
                        this.updateConversationDetails(turnContext);
                    }
                }
                catch (error) {
                    logger_1.default.error({ location: 'onTurn Register Conversation', error });
                }
                // Handle Outgoing Messages
                turnContext.onSendActivities(this.sendActivitiesHandler);
                // Handle Incoming Messages
                this.updateUserMessageDocument(turnContext);
            }
            else if (turnContext.activity.type === botbuilder_1.ActivityTypes.Event) {
                if (turnContext.activity.name === 'updateFeedback') {
                    this.chatLogger.updateFeedback(turnContext.activity.value.messageID, turnContext.activity.value.feedback, (error) => __awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            error &&
                                logger_1.default.error({
                                    location: 'Update Feedback in bot.ts',
                                    error: error,
                                });
                        }
                        else {
                            const confirmFeedback = {
                                type: botbuilder_1.ActivityTypes.Event,
                                name: 'feedbackConfirm',
                                value: {
                                    messageID: turnContext.activity.value.messageID,
                                    elementID: turnContext.activity.value.elementID,
                                    feedback: turnContext.activity.value.feedback,
                                },
                            };
                            yield turnContext.sendActivity(confirmFeedback);
                            logger_1.default.debug({
                                location: 'Confirming feedback update bot.js',
                                event: confirmFeedback,
                            });
                        }
                    }));
                }
            }
            yield next();
        });
    }
    updateUserDetails(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const toWrite = yield channel_handler_1.getUserInfo(turnContext);
            logger_1.default.debug({ location: 'updateUserDetails', toWrite });
            this.chatLogger.saveUserDocument(toWrite, (error) => {
                if (error)
                    logger_1.default.error({ location: 'chat-logger.ts updateUserDetails', error });
            });
            yield BotLoggerMiddleware.userProfile.set(turnContext, toWrite);
            yield this.userState.saveChanges(turnContext);
        });
    }
    updateConversationDetails(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const time = new Date().valueOf();
            this.startTimeStamp.set(turnContext, time);
            this.endTimeStamp.set(turnContext, time);
            const user = yield BotLoggerMiddleware.userProfile.get(turnContext, {
                userID: 'default-user',
                email: 'unknown@walmart.com',
                userName: 'default-user',
            });
            const toWrite = {
                conversationID: turnContext.activity.conversation.id,
                timestamp: new Date().valueOf(),
                userID: user.userID,
                channel: turnContext.activity.channelId,
            };
            logger_1.default.debug({ location: 'updateConversationDetails', toWrite });
            this.chatLogger.saveConversationDocument(toWrite, (error) => {
                if (error)
                    logger_1.default.error({ location: 'chat-logger.ts updateConversationDetails', error });
            });
            const interval = setInterval((activity) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const ctx = botbuilder_1.TurnContext.getConversationReference(activity);
                    this.adapter.continueConversation(ctx, (tctx) => __awaiter(this, void 0, void 0, function* () {
                        const lastMessage = yield this.endTimeStamp.get(tctx);
                        let diff = Date.now() - lastMessage;
                        diff /= 60000;
                        if (diff > config_1.default.checkChatDuration) {
                            const start = yield this.startTimeStamp.get(tctx);
                            const toWrite = {
                                startTimestamp: start,
                                endTimestamp: lastMessage,
                                abandon: start === lastMessage ? true : false,
                                conversationID: tctx.activity.conversation.id,
                            };
                            logger_1.default.debug({
                                location: 'updateConversationDetails setInterval',
                                toWrite,
                            });
                            this.chatLogger.saveUsageDocument(toWrite, (error) => {
                                if (error)
                                    logger_1.default.error({
                                        location: 'chat-logger.ts updateConversationDetails setinterval',
                                        error,
                                    });
                            });
                            yield this.conversationRegister.set(tctx, false);
                            yield this.conversationState.saveChanges(tctx, true);
                            clearInterval(interval);
                        }
                    }));
                }
                catch (error) {
                    error &&
                        logger_1.default.error({ location: 'updateConversationDetails setInterval', error });
                }
            }), config_1.default.checkChatActiveInterval, turnContext.activity);
        });
    }
    updateUserMessageDocument(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageID = uuid.v4();
            const toWrite = {
                from: 'User',
                message: turnContext.activity.text,
                messageType: 'String',
                timestamp: new Date().valueOf(),
                messageID,
                conversationID: turnContext.activity.conversation.id,
            };
            BotLoggerMiddleware.queryProfile.set(turnContext, {
                userQuestion: turnContext.activity.text,
                messageID,
            });
            logger_1.default.debug({ location: 'updateUserMessageDocument', toWrite });
            try {
                yield this.chatLogger.saveMessageDocument(toWrite);
            }
            catch (error) {
                error && logger_1.default.error({ location: 'updateUserMessageDocument saveMessagedoc', error });
            }
        });
    }
    updateQueryProfile(turnContext, property) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield BotLoggerMiddleware.queryProfile.get(turnContext, {});
                data[property.key] = property.value;
                yield BotLoggerMiddleware.queryProfile.set(turnContext, data);
                return;
            }
            catch (error) {
                error && logger_1.default.error({ location: 'Update Query Profile', error: error });
                return error;
            }
        });
    }
    sendActivitiesHandler(turnContext, activities, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userMessage = yield BotLoggerMiddleware.queryProfile.get(turnContext, {});
            let docID;
            for (const activity of activities) {
                if (activity.type === botbuilder_1.ActivityTypes.Message) {
                    let toWrite = Object.assign(Object.assign({}, userMessage), { message: activity.text, conversationID: turnContext.activity.conversation.id, messageType: 'String', timeStamp: new Date().valueOf(), from: 'bot', customData: {
                            context: userMessage.outerLuisIntent,
                            outerLuisIntent: userMessage.outerLuisIntent,
                            outerLuisScore: userMessage.outerLuisScore,
                            unanswered: userMessage['unanswered']
                        } });
                    if (activity.attachments && activity.attachments.length > 0) {
                        toWrite = Object.assign(Object.assign({}, toWrite), { messageType: 'RichData', card: activity.attachments[0] });
                        if (!toWrite.message) {
                            toWrite.message = activity.attachments[0].content.text;
                        }
                    }
                    logger_1.default.debug({ location: 'sendActivitiesHandler', toWrite });
                    try {
                        docID = yield this.chatLogger.saveMessageDocument(toWrite);
                    }
                    catch (error) {
                        error &&
                            logger_1.default.error({ location: 'sendActivitiedHandler saveMessagedoc', error });
                    }
                }
            }
            try {
                const resourceResponse = yield next();
                resourceResponse[0].documentID = docID;
                return resourceResponse;
            }
            catch (error) {
                logger_1.default.error({ location: 'chat-logger.ts sendactivities handler', error });
            }
        });
    }
}
exports.BotLoggerMiddleware = BotLoggerMiddleware;
//# sourceMappingURL=chat-logger.js.map