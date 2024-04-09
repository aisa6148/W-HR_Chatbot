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
exports.getUserInfo = void 0;
const config_1 = __importDefault(require("../configs/config"));
const request_1 = __importDefault(require("request"));
const logger_1 = __importDefault(require("../models/logger"));
exports.getUserInfo = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            logger_1.default.debug({ location: 'webchat getuserinfo', user: user });
            if (user.token) {
                const http_details = {
                    method: 'post',
                    url: config_1.default.signinoptions.location + '/api/user',
                    form: { token: user.token },
                    headers: {
                        'api-key': config_1.default.signinoptions.apikey,
                        'Content-Type': 'application/json',
                        botid: config_1.default.signinoptions.botname
                    },
                    json: true
                };
                request_1.default(http_details, function (error, response, body) {
                    if (error || body.status == 'failure') {
                        logger_1.default.error({
                            location: 'webchat getUserInfo request',
                            error: error,
                            user: user,
                            body: body
                        });
                        reject(error);
                    }
                    else {
                        logger_1.default.debug({
                            location: 'webchat getUserInfo successful request ',
                            body: body,
                            user: user
                        });
                        resolve({
                            firstName: body.FirstName,
                            lastName: body.LastName,
                            userName: body.FullName,
                            email: body.Email,
                            userID: body.UserID,
                            countryCode: body.CountryCode,
                            body: body
                        });
                    }
                });
            }
            else {
                logger_1.default.error({
                    location: 'webchat getuserinfo',
                    user: user,
                    error: 'User Does not have token on webchat'
                });
                reject({ error: 'no token on webachat channel' });
            }
        });
    });
};
//# sourceMappingURL=webchat.js.map