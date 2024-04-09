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
exports.getUserByEmail = exports.getUserInfo = void 0;
const config_1 = __importDefault(require("../configs/config"));
const request_1 = __importDefault(require("request"));
const logger_1 = __importDefault(require("../models/logger"));
exports.getUserInfo = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const http_details = JSON.parse(JSON.stringify(config_1.default.slackRequest));
            const id = user.id;
            http_details.qs.user = id.split(':')[0];
            request_1.default(http_details, function (error, response, body) {
                if (error) {
                    logger_1.default.error({ location: 'slack getUserInfo request', error: error, user: user });
                    reject(error);
                }
                else {
                    logger_1.default.debug({ location: 'slack getUserInfo successful request ', body: body, user: user });
                    try {
                        body = JSON.parse(body);
                        resolve({
                            userName: body.user.profile.real_name,
                            userID: body.user.profile.display_name,
                            firstName: body.user.profile.first_name,
                            lastName: body.user.profile.last_name,
                            email: body.user.profile.email,
                            body: body
                        });
                    }
                    catch (error) {
                        logger_1.default.error({
                            location: 'slack getUserInfo parse returned body',
                            error: error,
                            user: user
                        });
                        reject(error);
                    }
                }
            });
        });
    });
};
exports.getUserByEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.debug({ location: 'slack getUserByEmail', email: email });
        return new Promise((resolve, reject) => {
            const queryParams = {
                token: config_1.default.slackRequest.qs.token,
                email: email
            };
            request_1.default({
                method: 'GET',
                url: 'https://slack.com/api/users.lookupByEmail',
                qs: queryParams,
                json: true
            }, (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    logger_1.default.error({ location: 'slack getUserByEmail', error: error });
                    reject(error);
                }
                else {
                    try {
                        if (body.ok === false) {
                            logger_1.default.info({ location: 'slack find user by email false ', error, email, body });
                            if (body.error === 'ratelimited') {
                                yield sleep(61000);
                                const userIdAndName = yield exports.getUserByEmail(email);
                                resolve(userIdAndName);
                            }
                            else {
                                logger_1.default.error({
                                    location: 'slack find user by email unknown false reason',
                                    error,
                                    email
                                });
                                reject(undefined);
                            }
                        }
                        else {
                            const data = {
                                id: body.user.id + ':' + body.user['team_id'],
                                name: body.user.name
                            };
                            logger_1.default.debug({ location: 'slack getUserByEmail', data: data });
                            resolve(data);
                        }
                    }
                    catch (error) {
                        logger_1.default.error({ location: 'slack find user by email caught error', error, email });
                        reject(undefined);
                    }
                }
            }));
        });
    });
};
const sleep = (timeout) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, timeout);
    });
});
//# sourceMappingURL=slack.js.map