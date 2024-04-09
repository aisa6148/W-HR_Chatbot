import config from '../configs/config';
import request from 'request';
import { IUser } from './channel-handler';
import logger from '../models/logger';
import { getUserDetails } from '../services/associate.services';
import { Request, Response, NextFunction } from 'express';
import { IMessage } from '../types/Message';
import { logNotifications } from '../models/logger';
const axios = require('axios');
const secret = config.zoom.directLineSecret;

export const getZoomAccountDetailsFromEmail = async (emailId: string) => {

    const accessToken = process.env.JWT_Token;
    return await axios({
        url: config.zoom.zoomAccountDetailsUrl + emailId,
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        },
    })
        .then(async function (response: any) {
            const result = response.data;
            logger.log('zoom account details retrieved successfully');
            return result;
        })
        .catch(async function (error: any) {
            logger.error({ location: 'getZoomAccountDetails', error: error });
        });

};

export const isIDCUser = async (email: string) => {
    let result;
    const user = await getUserDetails(email);
    result = (user ? true : false);
    return result;
};


export const formatText = async (msg: string) => {
    // for links:-
    msg = msg.replace(/\[(.*?)\]\((.*?)\)/, '$1 : $2');
    // for extra spaces :-
    msg = msg.replace(/\n\n/g, '\n');
    msg = msg.replace(/\*/g, '');
    const len = msg.length;
    if (msg[len - 1] === '\n')
        msg = msg.substr(0, len - 1);
    return msg;
};





export const getZoomToken = async (toJid: any, accountId: any) => {
    return await axios({
        url: config.zoom.getZoomTokenUrl,
        method: 'post',
        headers: {
            // @ts-ignore
            Authorization: 'Basic' + Buffer.from(process.env.ZOOM_DEVELOPMENT_CLIENT_ID + ':' + process.env.ZOOM_DEVELOPMENT_CLIENT_SECRET).toString('base64')
        }
    })
        .then(async function (response: any) {
            const accessToken = response.data.access_token;
            return accessToken;
            // await sendChat(accessToken, toJid, accountId, msg);
        })
        .catch(function (error: any) {
            logger.error({ location: 'getZoomToken', error: error });
        });
};


export const sendButtons = async (accessToken: any, toJid: any, accountId: any, buttons: any) => {

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
        url: config.zoom.sendMessageUrl,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        },
        data: body
    })
        .then(async function (response: any) {
            logger.log('Buttons successfully sent');
        })
        .catch(async function (error: any) {
            logger.error({ location: 'sendButtons', error: error });
        });
};



export const sendChat = async (accessToken: any, toJid: any, accountId: any, text: string) => {
    const msg = await formatText(text);
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
    return await axios({
        url: config.zoom.sendMessageUrl,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken
        },
        data: body
    })
        .then(async function (response: any) {
            logger.log('message successfully sent');
        })
        .catch(async function (error: any) {
            logger.error({ location: 'sendChat', error: error });
        });
};



export const sendActivity = async (data: any, name: string, message: string, toJid: any, accountId: any, email: any) => {
    const convId = data.conversationId;
    logger.log({ location: 'send Activity,conv', msg: convId });
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
        url: config.zoom.directlineConversationUrl + convId + '/activities',
        headers: {
            'Content-type': 'application/json',
            Authorization: 'Bearer ' + secret
        },
        data: body
    })
        .then(async function (response: any) {
            const watermark = response.data.id.split('|')[1];
            await getActivity(convId, toJid, accountId, watermark);
        })
        .catch(function (error: any) {
            logger.error({ location: 'sendActivity', error: error });
        });

};


export const getActivity = async (convId: string, toJid: any, accountId: any, watermark: any) => {
    axios({
        method: 'get',
        url: config.zoom.directlineConversationUrl + convId + '/activities' + '?watermark=' + watermark,
        headers: {
            'Content-type': 'application/json',
            Authorization: 'Bearer ' + secret
        },
    })
        .then(async function (response: any) {
            const activities = response.data.activities;
            logger.log({ location: 'getActivity, activities:', msg: activities });
            const watermark = response.data.watermark;
            const zoomToken = await getZoomToken(toJid, accountId);
            for (let i = 0; i < activities.length; i++) {
                if (activities[i].type === 'message') {
                    if (typeof activities[i].text !== 'undefined')
                        await sendChat(zoomToken, toJid, accountId, activities[i].text);
                    if (typeof activities[i].attachments !== 'undefined') {
                        const attachmentText = activities[i].attachments[0].content.text;
                        if (typeof attachmentText !== 'undefined')
                            await sendChat(zoomToken, toJid, accountId, attachmentText);
                        const buttons = activities[i].attachments[0].content.buttons;
                        await sendButtons(zoomToken, toJid, accountId, buttons);
                    }
                    logger.log({ location: 'getActivity', msg: activities[i].text });
                }
            }

        })
        .catch(function (error: any) {
            logger.error({ location: 'getActivity', error: error });
        });
};

export const sendZoomNotification = async function (email: string, messages: IMessage[], createdBy: string, jobId: string) {
    try {
        const accountDetails = await getZoomAccountDetailsFromEmail(email);
        const toJid = accountDetails.jid;
        const accountId = accountDetails.account_id;
        const accessToken = await getZoomToken(toJid, accountId);
        for (const message of messages) {
            if (message.text) {
                await sendChat(accessToken, toJid, accountId, message.text);
            }
            if (message.buttons) {
                const zoomButtons = message.buttons.map((button: { display: any; value: any; }) => {
                    const zoomButton = {
                        'title': button.display,
                        'value': button.value
                    };
                    return zoomButton;
                });
                sendButtons(accessToken, toJid, accountId, zoomButtons);
            }
        }
        logNotifications(email, true, createdBy, jobId);

    }
    catch (error) {
        logger.log({ location: 'sendZoomNotification', error: error });
        logNotifications(email, false, createdBy, jobId);
    }
};