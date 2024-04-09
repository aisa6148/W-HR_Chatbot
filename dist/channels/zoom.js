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
exports.sendZoomNotification = exports.getActivity = exports.sendActivity = exports.sendChat = exports.sendButtons = exports.getZoomToken = exports.formatText = exports.isIDCUser = exports.getZoomAccountDetailsFromEmail = void 0;
const config_1 = __importDefault(require("../configs/config"));
const logger_1 = __importDefault(require("../models/logger"));
const associate_services_1 = require("../services/associate.services");
const logger_2 = require("../models/logger");
const axios = require('axios');
const secret = config_1.default.zoom.directLineSecret;
exports.getZoomAccountDetailsFromEmail = (emailId) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = process.env.JWT_Token;
    return yield axios({
        url: config_1.default.zoom.zoomAccountDetailsUrl + emailId,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        },
    })
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = response.data;
            logger_1.default.log('zoom account details retrieved successfully');
            return result;
        });
    })
        .catch(function (error) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.error({ location: 'getZoomAccountDetails', error: error });
        });
    });
});
exports.isIDCUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    const user = yield associate_services_1.getUserDetails(email);
    result = (user ? true : false);
    return result;
});
exports.formatText = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    // for links:-
    msg = msg.replace(/\[(.*?)\]\((.*?)\)/, '$1 : $2');
    // for extra spaces :-
    msg = msg.replace(/\n\n/g, '\n');
    msg = msg.replace(/\*/g, '');
    const len = msg.length;
    if (msg[len - 1] === '\n')
        msg = msg.substr(0, len - 1);
    return msg;
});
exports.getZoomToken = (toJid, accountId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios({
        url: config_1.default.zoom.getZoomTokenUrl,
        method: 'post',
        headers: {
            // @ts-ignore
            Authorization: 'Basic' + Buffer.from(process.env.ZOOM_DEVELOPMENT_CLIENT_ID + ':' + process.env.ZOOM_DEVELOPMENT_CLIENT_SECRET).toString('base64')
        }
    })
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = response.data.access_token;
            return accessToken;
            // await sendChat(accessToken, toJid, accountId, msg);
        });
    })
        .catch(function (error) {
        logger_1.default.error({ location: 'getZoomToken', error: error });
    });
});
exports.sendButtons = (accessToken, toJid, accountId, buttons) => __awaiter(void 0, void 0, void 0, function* () {
    const items = [];
    for (const button of buttons) {
        const item = {
            'text': '',
            'value': '',
            'style': 'Default'
        };
        item.text = button.title;
        item.value = button.value;
        items.push(item);
    }
    const body = {
        'robot_jid': process.env.ZOOM_DEVELOPMENT_BOT_JID,
        'to_jid': toJid,
        'account_id': accountId,
        'content': {
            'body': [{
                    'type': 'actions',
                    'items': items
                }]
        }
    };
    axios({
        url: config_1.default.zoom.sendMessageUrl,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        },
        data: body
    })
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log('Buttons successfully sent');
        });
    })
        .catch(function (error) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.error({ location: 'sendButtons', error: error });
        });
    });
});
exports.sendChat = (accessToken, toJid, accountId, text) => __awaiter(void 0, void 0, void 0, function* () {
    const msg = yield exports.formatText(text);
    const body = {
        'robot_jid': process.env.ZOOM_DEVELOPMENT_BOT_JID,
        'to_jid': toJid,
        'account_id': accountId,
        'content': {
            'body': [{
                    'type': 'message',
                    'text': msg
                }]
        }
    };
    return yield axios({
        url: config_1.default.zoom.sendMessageUrl,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        },
        data: body
    })
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.log('message successfully sent');
        });
    })
        .catch(function (error) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.error({ location: 'sendChat', error: error });
        });
    });
});
exports.sendActivity = (data, name, message, toJid, accountId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const convId = data.conversationId;
    logger_1.default.log({ location: 'send Activity,conv', msg: convId });
    const body = {
        'locale': 'en-EN',
        'type': 'message',
        'from': {
            'id': email,
            'name': name,
        },
        'text': message
    };
    axios({
        method: 'post',
        url: config_1.default.zoom.directlineConversationUrl + convId + '/activities',
        headers: {
            'Content-type': 'application/json',
            Authorization: 'Bearer ' + secret
        },
        data: body
    })
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function* () {
            const watermark = response.data.id.split('|')[1];
            yield exports.getActivity(convId, toJid, accountId, watermark);
        });
    })
        .catch(function (error) {
        logger_1.default.error({ location: 'sendActivity', error: error });
    });
});
exports.getActivity = (convId, toJid, accountId, watermark) => __awaiter(void 0, void 0, void 0, function* () {
    axios({
        method: 'get',
        url: config_1.default.zoom.directlineConversationUrl + convId + '/activities' + '?watermark=' + watermark,
        headers: {
            'Content-type': 'application/json',
            Authorization: 'Bearer ' + secret
        },
    })
        .then(function (response) {
        return __awaiter(this, void 0, void 0, function* () {
            const activities = response.data.activities;
            logger_1.default.log({ location: 'getActivity, activities:', msg: activities });
            const watermark = response.data.watermark;
            const zoomToken = yield exports.getZoomToken(toJid, accountId);
            for (let i = 0; i < activities.length; i++) {
                if (activities[i].type === 'message') {
                    if (typeof activities[i].text !== 'undefined')
                        yield exports.sendChat(zoomToken, toJid, accountId, activities[i].text);
                    if (typeof activities[i].attachments !== 'undefined') {
                        const attachmentText = activities[i].attachments[0].content.text;
                        if (typeof attachmentText !== 'undefined')
                            yield exports.sendChat(zoomToken, toJid, accountId, attachmentText);
                        const buttons = activities[i].attachments[0].content.buttons;
                        yield exports.sendButtons(zoomToken, toJid, accountId, buttons);
                    }
                    logger_1.default.log({ location: 'getActivity', msg: activities[i].text });
                }
            }
        });
    })
        .catch(function (error) {
        logger_1.default.error({ location: 'getActivity', error: error });
    });
});
exports.sendZoomNotification = function (email, messages, createdBy, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountDetails = yield exports.getZoomAccountDetailsFromEmail(email);
            const toJid = accountDetails.jid;
            const accountId = accountDetails.account_id;
            const accessToken = yield exports.getZoomToken(toJid, accountId);
            for (const message of messages) {
                if (message.text) {
                    yield exports.sendChat(accessToken, toJid, accountId, message.text);
                }
                if (message.buttons) {
                    const zoomButtons = message.buttons.map((button) => {
                        const zoomButton = {
                            'title': button.display,
                            'value': button.value
                        };
                        return zoomButton;
                    });
                    exports.sendButtons(accessToken, toJid, accountId, zoomButtons);
                }
            }
            logger_2.logNotifications(email, true, createdBy, jobId);
        }
        catch (error) {
            logger_1.default.log({ location: 'sendZoomNotification', error: error });
            logger_2.logNotifications(email, false, createdBy, jobId);
        }
    });
};
//# sourceMappingURL=zoom.js.map