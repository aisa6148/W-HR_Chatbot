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
exports.direct = exports.login = exports.index = exports.frame = void 0;
const uuid_1 = __importDefault(require("uuid"));
const config_1 = __importDefault(require("../configs/config"));
const logger_1 = __importDefault(require("../models/logger"));
const helper_functions_1 = require("../utilities/helper.functions");
// Main iframe which contains title bar and the iframe for sign in and bot
exports.frame = function (req, res, next) {
    res.render('frame');
};
// Pretty page to apply the bot
exports.index = function (req, res, next) {
    res.render('index');
};
// Renders the sign in frame which can navigate to SSO page
exports.login = function (req, res, next) {
    logger_1.default.debug({
        location: '/login endpoint index',
        message: 'request for login with cookie',
        cookie: req.cookies
    });
    // Check if the user has a token and name
    if (req.cookies[config_1.default.defaultmodel.botName + 'token'] &&
        req.cookies[config_1.default.defaultmodel.botName + 'userName']) {
        res.redirect('/direct');
    }
    else {
        res.redirect(config_1.default.signinoptions.location + '/login/' + config_1.default.signinoptions.botname);
        // res.render('login', { location: config.signinoptions.location, bot: config.signinoptions.botname });
    }
};
// Check Configs
// export const configlist = function (req: Request, res: Response, next: NextFunction) {
//     res.send(require("../configs/config"));
// };
// Renders the bot with bot model
exports.direct = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let model = JSON.parse(JSON.stringify(config_1.default.defaultmodel));
        let token = undefined;
        let userName = undefined;
        logger_1.default.debug({ location: '/direct', cookie: req.cookies, query: req.query });
        try {
            // Check if the user has a token and user name
            if ((req.cookies[model.botName + 'token'] &&
                req.cookies[model.botName + 'userName']) ||
                (req.query.token && req.query.name)) {
                if (req.cookies[model.botName + 'token'] &&
                    req.cookies[model.botName + 'userName']) {
                    token = req.cookies[model.botName + 'token'];
                    userName = req.cookies[model.botName + 'userName'];
                    // to avoid overwriting
                }
                else if (req.query.token && req.query.name) {
                    // @ts-ignore
                    token = decodeURIComponent(encodeURIComponent(req.query.token));
                    userName = decodeURIComponent(encodeURIComponent(req.query.name));
                    res.cookie(model.botName + 'token', token, {
                        maxAge: 3600000,
                        httpOnly: true,
                        secure: true
                    });
                    res.cookie(model.botName + 'userName', userName, {
                        maxAge: 3600000,
                        httpOnly: true,
                        secure: true
                    });
                }
                // Validate if the token is right
                const status = yield helper_functions_1.validateToken(token);
                if (status == 'success') {
                    if (req.cookies[model.botName + 'convo']) {
                        model.conversationId = req.cookies[model.botName + 'convo'];
                        model.userId = req.cookies[model.botName + 'userid'];
                        model = setTokenValues(model, token, userName);
                        res.render('direct', {
                            model: model,
                            token: true,
                            title: 'Ask ME Bot',
                            query: req.query.query
                        });
                    }
                    else {
                        const conversationID = yield helper_functions_1.getConversationId();
                        model.userId = uuid_1.default()
                            .replace(/[-]/g, '')
                            .substring(0, 11);
                        model.conversationId = conversationID.conversationId;
                        model = setTokenValues(model, token, userName);
                        res.cookie(model.botName + 'convo', model.conversationId, {
                            maxAge: 3600000,
                            httpOnly: true,
                            secure: true
                        });
                        res.cookie(model.botName + 'userid', model.userId, {
                            maxAge: 3600000,
                            httpOnly: true,
                            secure: true
                        });
                        res.render('direct', {
                            model: model,
                            token: true,
                            title: 'Ask ME Bot',
                            query: req.query.query
                        });
                    }
                }
                else {
                    logger_1.default.error({ location: 'direct status not success', status });
                    throw new Error('Invalid Token');
                }
            }
            else {
                res.clearCookie(model.botName + 'token');
                res.clearCookie(model.botName + 'userName');
                res.redirect('/login');
            }
        }
        catch (error) {
            logger_1.default.error({ location: '/direct ', error: 'Internal Server Error:\n' + error });
            res.clearCookie(model.botName + 'token');
            res.clearCookie(model.botName + 'userName');
            res.sendStatus(500);
            next();
        }
    });
};
/**
 *
 * @param {Object} model
 * @param {String} token
 * @param {String} name
 */
function setTokenValues(model, token, name) {
    if (token) {
        model.token = token;
    }
    if (name) {
        model.userName = name;
    }
    return model;
}
//# sourceMappingURL=web.controller.js.map