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
exports.BotAdapter = exports.botHandler = exports.userState = exports.conversationState = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_core_1 = require("botbuilder-core");
const botbuilder_azure_1 = require("botbuilder-azure");
const bot_dialog_1 = require("../bot/bot.dialog");
const chat_logger_1 = require("../middleware/chat-logger");
const logger_1 = __importDefault(require("../models/logger"));
const config_1 = __importDefault(require("../configs/config"));
const zoom_1 = require("../channels/zoom");
const redis_1 = require("../models/redis");
const redisStore = new redis_1.Redis();
const zoomUserIdToDirectLineMap = new Map();
const zoomUsersInMemory = [];
const secret = config_1.default.zoom.directLineSecret;
const axios = require('axios');
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
exports.BotAdapter = adapter;
// Catch-all for errors.
adapter.onTurnError = (context, error) => __awaiter(void 0, void 0, void 0, function* () {
    // This check writes out errors to console log .vs. app insights.
    logger_1.default.error({ location: 'onTurnError', error }, context.activity);
    // Send a message to the user
    yield context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    yield exports.conversationState.delete(context);
});
// Default container name
// const DEFAULT_BOT_CONTAINER = 'whr-dev-context-data';
// Get service configuration
const blobStorage = new botbuilder_azure_1.BlobStorage({
    containerName: process.env.BLOB_CONTEXT_BLOB_CONTAINER,
    storageAccountOrConnectionString: 'DefaultEndpointsProtocol=https;AccountName=' +
        config_1.default.azureLogStorage.account.name +
        ';AccountKey=' +
        config_1.default.azureLogStorage.account.key +
        ';EndpointSuffix=core.windows.net'
});
// Replace memory storage
// const memoryStorage = new MemoryStorage();
exports.conversationState = new botbuilder_1.ConversationState(blobStorage);
exports.userState = new botbuilder_1.UserState(blobStorage);
const botLogger = chat_logger_1.BotLoggerMiddleware.getInstance(exports.conversationState, exports.userState, adapter);
adapter.use(botLogger);
// Create the main dialog.
const bot = new bot_dialog_1.Bot();
// const firstrun = new FirstRun(conversationState, userState);
// Listen for incoming activities and route them to your bot main dialog.
const botHandler = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof req.body.payload !== 'undefined') {
            const payload = req.body.payload;
            // console.log('payload', payload);
            let name = '';
            if (typeof payload.name !== 'undefined')
                name = payload.name;
            if (typeof payload.userName !== 'undefined')
                name = payload.userName;
            let message = '';
            if (typeof payload.cmd !== 'undefined')
                message = payload.cmd;
            if (typeof payload.actionItem !== 'undefined')
                message = payload.actionItem.value;
            const toJid = payload.toJid;
            const accountId = payload.accountId;
            const userId = payload.userId;
            const accountDetails = yield zoom_1.getZoomAccountDetailsFromEmail(userId);
            const email = accountDetails.email;
            logger_1.default.log({ 'location': 'after retreiving zoom account', email: email });
            // sendImage(toJid, accountId, message);
            // Start a conversation:-
            const isIdcUser = yield zoom_1.isIDCUser(email);
            if (isIdcUser) {
                const fetchedData = yield redisStore.get(userId);
                if (fetchedData == undefined) {
                    logger_1.default.log('not present in memory');
                    axios({
                        method: 'post',
                        url: config_1.default.zoom.directlineConversationUrl,
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: 'Bearer ' + secret
                        }
                    })
                        .then(function (response) {
                        return __awaiter(this, void 0, void 0, function* () {
                            redisStore.set(userId, JSON.stringify(response.data.conversationId), 'EX', 3600);
                            yield zoom_1.sendActivity(response.data, name, message, toJid, accountId, email);
                        });
                    })
                        .catch(function (error) {
                        logger_1.default.error({ location: 'zoom Start New Conversation', error: error });
                    });
                }
                else {
                    const convId = yield JSON.parse(fetchedData);
                    yield zoom_1.sendActivity({ 'conversationId': convId }, name, message, toJid, accountId, email);
                }
            }
            else {
                const zoomToken = yield zoom_1.getZoomToken(toJid, accountId);
                const msg = 'This bot is only for IDC Associates :) ';
                yield zoom_1.sendChat(zoomToken, toJid, accountId, msg);
            }
        }
        adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
            // route to main dialog.
            // enable user check only for messages and not events
            if (context.activity.type == botbuilder_core_1.ActivityTypes.Message) {
                logger_1.default.log(context.activity.text);
                //     Uncomment to control user access
                //     let user = await userState.get(context);
                //     let email = user[STATE_PROPERTY_NAMES.CURRENT_USER].email;
                //     let allowed = await userAccessController.verifyUser(email);
                //     if (allowed) {
                //         await bot.onTurn(context);
                //     } else {
                //         await context.sendActivity("You do not have access to this bot");
                //     }
                // } else {
                yield bot.onTurn(context);
                logger_1.default.debug({ location: 'bot.controller', message: context.activity.text }, context.activity);
            }
            else if (context.activity.type === botbuilder_core_1.ActivityTypes.Event) {
                logger_1.default.log('inside else');
                // if (context.activity.channelId === 'webchat' || context.activity.channelId === 'emulator') {
                //   const user = await BotLoggerMiddleware.userProfile.get(context);
                //   const name = user.userName || user.step.context.activity.from.name || '';
                //   await context.sendActivity(
                //     'Hey ' + name + REPLY_TEXTS.FIRST_INTRO_TEXT,
                //   );
                //   await sendRichCard(context, 'I can assist you with:', GREETING_BUTTONS);
                //   await sendRichCard(context, '', SHOW_MORE);
                // }
                logger_1.default.debug({
                    location: 'bot.controller',
                    eventName: context.activity.name,
                    eventValue: context.activity.value
                }, context.activity);
            }
        }));
    });
};
exports.botHandler = botHandler;
//# sourceMappingURL=bot.controller.js.map