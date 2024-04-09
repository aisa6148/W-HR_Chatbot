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
exports.notifySlackChannel = exports.notifyWorkAnniversary = exports.notifyBirthday = exports.startNotifications = exports.notifyMessage = void 0;
const logger_1 = __importDefault(require("../models/logger"));
const config_1 = __importDefault(require("../configs/config"));
const zoom_1 = require("../channels/zoom");
const associate_services_1 = require("../services/associate.services");
const http_errors_1 = __importDefault(require("http-errors"));
const slack = __importStar(require("../channels/slack"));
const facebook = __importStar(require("../channels/facebook"));
const mailer_services_1 = __importDefault(require("../services/mailer.services"));
const helper_functions_1 = require("../utilities/helper.functions");
const bot_constants_1 = require("../configs/bot.constants");
const associate_services_2 = require("../services/associate.services");
const logger_2 = require("../models/logger");
const moment = require('moment');
const axios = require('axios');
const { QueueServiceClient } = require('@azure/storage-queue');
const connectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING;
const queueName = process.env.STORAGE_QUEUE_NAME;
function channelNotification(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = body['message'];
        const channel = body['channel'];
        const createdBy = body['createdBy'];
        const jobId = body['jobId'];
        for (let i = 0; i < body['emails'].length; i++) {
            const email = body['emails'][i];
            if (channel === 'slack') {
                try {
                    const user = yield slack.getUserByEmail(email);
                    const address = {
                        from: user,
                        recipient: {
                            id: config_1.default.slackBotId,
                            name: config_1.default.slackBotName,
                        },
                        channelId: 'slack',
                        serviceUrl: 'https://slack.botframework.com/',
                    };
                    yield helper_functions_1.notifySlackUser(address, messages);
                    logger_2.logNotifications(email, true, createdBy, jobId);
                }
                catch (error) {
                    logger_1.default.error({ location: '/api/notify fetch slack', error: error });
                    logger_2.logNotifications(email, false, createdBy, jobId);
                }
            }
            else if (channel === 'zoom') {
                try {
                    zoom_1.sendZoomNotification(email, messages, createdBy, jobId);
                }
                catch (error) {
                    logger_1.default.error({ location: '/api/notify zoom', error: error });
                }
            }
            else if (channel === 'facebook') {
                try {
                    const user = yield facebook.getUserByEmail(email);
                    const address = {
                        from: user,
                        recipient: {
                            id: config_1.default.facebookBotId,
                            name: config_1.default.facebookBotName,
                        },
                        channelId: 'facebook',
                        serviceUrl: 'https://facebook.botframework.com',
                    };
                    yield helper_functions_1.notifyUser(address, messages);
                }
                catch (error) {
                    logger_1.default.error({ location: '/api/notify fetch facebook', error: error });
                }
            }
            else {
                try {
                    let emailText = '';
                    for (const message of messages) {
                        if (!message.buttons) {
                            emailText = emailText + message.text + '\n\n';
                        }
                    }
                    const emailHtml = emailText
                        .replace(/\n/g, '<br/>') // Replace each \n with <br/>
                        .replace(/_([^_]*)_/g, '<i>$1</i>'); // Replace each pair of _ with <i> </i> pair.
                    yield mailer_services_1.default.sendAnswer(email, `${emailHtml}<br/><br/>Best Regards,<br/>Ask ME`);
                }
                catch (error) {
                    logger_1.default.error({ location: '/api/notify fetch webchat', error: error });
                }
            }
        }
    });
}
exports.notifyMessage = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.debug({
                location: '/api/message-notification endpoint',
                body: req.body,
                notifyKey: config_1.default.notifyKey,
            });
            channelNotification(req.body);
            res.send('Completed');
        }
        catch (error) {
            logger_1.default.error({ location: '/api/message-notification endpoint', error });
            next(new http_errors_1.default.InternalServerError('Internal server error'));
        }
    });
};
exports.startNotifications = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.log({ location: 'startNotifications', body: req.body.notificationId });
            yield logger_2.logNotificationJobs(req.body);
            sendAllNotifications();
            res.send('Notifications Started');
        }
        catch (error) {
            logger_1.default.error({ location: '/api/start-notifications endpoint', error });
            next(new http_errors_1.default.InternalServerError('Internal server error'));
        }
    });
};
exports.notifyBirthday = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.log({ location: '/api/birthdayNotify endpoint', body: req.body });
            res.send('Started Birthday Notification').status(200);
            const birthdayGroup = yield associate_services_1.birthdayNotificationBody();
            for (const associateInfo of birthdayGroup) {
                const message = [
                    {
                        image: config_1.default.linktogif,
                    },
                    {
                        text: 'Hi ' +
                            associateInfo['name'] +
                            ',\n\nHappy birthday!🎂\n\nHere’s wishing you prosperity and great success in the year ahead! \n\nHope you have an amazing day! Stay blessed! 🎉\n\nAnd if you need any assitance, I am at your service 🧞. Click on the following to get started:',
                    },
                    {
                        buttons: bot_constants_1.GREETING_BUTTONS_NOTIFICATIONS,
                    }
                ];
                const body = {
                    emails: associateInfo['emails'],
                    message: message,
                    channel: associateInfo['channel'],
                    createdBy: 'FunctionApp',
                    jobId: ''
                };
                yield channelNotification(body);
                const teamEmail = [];
                for (const member of associateInfo['team']) {
                    teamEmail.push(member.email);
                }
                let apostrophe = '';
                if (typeof associateInfo['name'] === 'string') {
                    if (associateInfo['name'].endsWith('s')) {
                        apostrophe = "'";
                    }
                    else {
                        apostrophe = "'s";
                    }
                }
                const teamMessage = [
                    {
                        text: 'Hey! It’s ' +
                            associateInfo['name'] +
                            apostrophe +
                            ' birthday today. Don’t forget to celebrate a fellow associate’s special day 🎉',
                    },
                ];
                const teamBody = {
                    emails: teamEmail,
                    message: teamMessage,
                    channel: associateInfo['channel'],
                    createdBy: 'Function App',
                    jobId: ''
                };
                yield channelNotification(teamBody);
            }
        }
        catch (error) {
            logger_1.default.error({ location: '/api/birthday-notify endpoint', error });
            next(new http_errors_1.default.InternalServerError('Internal server error'));
        }
    });
};
exports.notifyWorkAnniversary = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.send('Started Work Anniversary Notification').status(200);
            logger_1.default.log({ location: '/notify/workAnniversaryNotify endpoint', body: req.body });
            const associatesWithWorkAnniversary = (yield associate_services_2.getAssociatesWithWorkAnniversaryDate(Date.now())) || [];
            for (const associate of associatesWithWorkAnniversary) {
                try {
                    const years = moment(Date.now()).year() - moment(associate.hireDate).year();
                    const yearText = years > 1 ? 'years' : 'year';
                    const message = [
                        {
                            image: config_1.default.imgWorkAnniversary,
                        },
                        {
                            text: 'If you need any assistance, I am at your service 🧞. Click on the following to get started:',
                        },
                        {
                            buttons: bot_constants_1.GREETING_BUTTONS_NOTIFICATIONS,
                        }
                    ];
                    const teamBody = {
                        emails: [associate.email],
                        message: message,
                        channel: 'slack',
                        createdBy: 'Function App',
                        jobId: ''
                    };
                    yield channelNotification(teamBody);
                }
                catch (error) {
                    logger_1.default.error({
                        location: '/api/work-anniversary-notify endpoint associate loop',
                        error,
                    });
                }
            }
        }
        catch (error) {
            logger_1.default.error({ location: '/api/work-anniversary-notify endpoint', error });
            next(new http_errors_1.default.InternalServerError('Internal server error'));
        }
    });
};
exports.notifySlackChannel = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = config_1.default.slackChannelUrl;
            axios.get(url)
                .then(function (response) {
                logger_1.default.log('successfully messaged slack channel');
                res.end();
            })
                .catch(function (error) {
                logger_1.default.error({ location: '/api/notify-slack-channel endpoint', error });
                res.end();
            });
        }
        catch (error) {
            logger_1.default.error({ location: '/api/work-anniversary-notify endpoint', error });
            next(new http_errors_1.default.InternalServerError('Internal server error'));
        }
    });
};
function sendAllNotifications() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
            const queueClient = queueServiceClient.getQueueClient(queueName);
            let properties = yield queueClient.getProperties();
            logger_1.default.log({ location: 'sendAllNotifications', propertiesApproximateMessagesCount: properties.approximateMessagesCount });
            while (properties.approximateMessagesCount > 0) {
                const response = yield queueClient.receiveMessages();
                if (response.receivedMessageItems.length === 1) {
                    const receivedMessageItem = response.receivedMessageItems[0];
                    const messageBody = JSON.parse(receivedMessageItem.messageText);
                    logger_1.default.log({ location: 'deleting message with body:', body: messageBody, propertiesApproximateMessagesCount: properties.approximateMessagesCount });
                    // sendNotification
                    yield channelNotification(messageBody);
                    logger_1.default.log('notification for batch sent');
                    const deleteMessageResponse = yield queueClient.deleteMessage(receivedMessageItem.messageId, receivedMessageItem.popReceipt);
                }
                properties = yield queueClient.getProperties();
            }
            logger_1.default.log({ location: 'sendAllNotifications', message: 'Notifications finished' });
        }
        catch (error) {
            logger_1.default.error({ location: 'sendAllNotifications', error });
        }
    });
}
//# sourceMappingURL=notification.controller.js.map