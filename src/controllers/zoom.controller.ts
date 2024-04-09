import { Request, Response, NextFunction } from 'express';
import uuid from 'uuid';
import config from '../configs/config';
import logger from '../models/logger';
import {
    getConversationId,
    validateToken
} from '../utilities/helper.functions';
import createError from 'http-errors';
import request from 'request';

export const authorize = function (req: Request, res: Response, next: NextFunction) {
    logger.log('autorization start');
    res.redirect('https://zoom.us/launch/chat?jid=robot_' + process.env.ZOOM_DEVELOPMENT_BOT_JID);
};

export const verify_zoom = function (req: Request, res: Response, next: NextFunction) {
    logger.log('verification start');
    res.send(process.env.ZOOM_BOT_VERIFICATION_TOKEN);
};

export const deauthorize = function (req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization === process.env.ZOOM_BOT_VERIFICATION_TOKEN) {
        res.status(200);
        res.send();
        request({
            url: 'https://api.zoom.us/oauth/data/compliance',
            method: 'POST',
            json: true,
            body: {
                'client_id': req.body.payload.client_id,
                'user_id': req.body.payload.user_id,
                'account_id': req.body.payload.account_id,
                'deauthorization_event_received': req.body.payload,
                'compliance_completed': true
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(process.env.ZOOM_DEVELOPMENT_CLIENT_ID + ':' + process.env.ZOOM_DEVELOPMENT_CLIENT_SECRET).toString('base64'),
                'cache-control': 'no-cache'
            }
        }, (error, httpResponse, body) => {
            if (error) {
                console.error(error);
            } else {
                console.log(body);
            }
        });
    } else {
        res.status(401);
        res.send('Unauthorized request to Chatbot for Zoom.');
    }
};

export const support = function (req: Request, res: Response, next: NextFunction) {
    res.send('Please write to ' + config.botTeamEmail + 'for support.');
};

export const privacy = function (req: Request, res: Response, next: NextFunction) {
    res.send('Your privacy is important to us. Information collected will be used on a need-to-know basis and for official purposes only.');
};

export const terms = function (req: Request, res: Response, next: NextFunction) {
    res.send('Chat information collected will be used on a need-to-know basis and for official purposes only.');
};

export const documentation = function (req: Request, res: Response, next: NextFunction) {
    res.send('Type in "hi" to begin!');
};