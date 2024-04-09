"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentation = exports.terms = exports.privacy = exports.support = exports.deauthorize = exports.verify_zoom = exports.authorize = void 0;
const config_1 = __importDefault(require("../configs/config"));
const logger_1 = __importDefault(require("../models/logger"));
const request_1 = __importDefault(require("request"));
exports.authorize = function (req, res, next) {
    logger_1.default.log('autorization start');
    res.redirect('https://zoom.us/launch/chat?jid=robot_' + process.env.ZOOM_DEVELOPMENT_BOT_JID);
};
exports.verify_zoom = function (req, res, next) {
    logger_1.default.log('verification start');
    res.send(process.env.ZOOM_BOT_VERIFICATION_TOKEN);
};
exports.deauthorize = function (req, res, next) {
    if (req.headers.authorization === process.env.ZOOM_BOT_VERIFICATION_TOKEN) {
        res.status(200);
        res.send();
        request_1.default({
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
            }
            else {
                console.log(body);
            }
        });
    }
    else {
        res.status(401);
        res.send('Unauthorized request to Chatbot for Zoom.');
    }
};
exports.support = function (req, res, next) {
    res.send('Please write to ' + config_1.default.botTeamEmail + 'for support.');
};
exports.privacy = function (req, res, next) {
    res.send('Your privacy is important to us. Information collected will be used on a need-to-know basis and for official purposes only.');
};
exports.terms = function (req, res, next) {
    res.send('Chat information collected will be used on a need-to-know basis and for official purposes only.');
};
exports.documentation = function (req, res, next) {
    res.send('Type in "hi" to begin!');
};
//# sourceMappingURL=zoom.controller.js.map