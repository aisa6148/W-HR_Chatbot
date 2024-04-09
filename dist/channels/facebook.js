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
            const http_details = JSON.parse(JSON.stringify(config_1.default.facebookRequest));
            http_details.url += user.id;
            request_1.default(http_details, function (error, response, body) {
                if (error) {
                    logger_1.default.error({ location: 'facebook getUserInfo request', error: error, user: user });
                    reject(error);
                }
                else {
                    logger_1.default.debug({
                        location: 'facebook getUserInfo successful request ',
                        body: body,
                        user: user
                    });
                    try {
                        body = JSON.parse(body);
                        resolve({
                            userName: body.name,
                            userID: body.id,
                            email: body.email,
                            body: body
                        });
                    }
                    catch (error) {
                        logger_1.default.error({
                            location: 'facebook getUserInfo parse returned body',
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
        logger_1.default.debug({ location: 'facebook getUserByEmail', email: email });
        return new Promise((resolve, reject) => {
            const queryParams = {
                access_token: config_1.default.facebookRequest.qs.access_token,
                fields: 'id,name'
            };
            request_1.default({
                method: 'GET',
                url: 'https://graph.facebook.com/v2.6/' + email,
                qs: queryParams,
                json: true
            }, (error, response, body) => {
                if (error) {
                    logger_1.default.error({ location: 'facebook getUserByEmail', error: error });
                    reject(error);
                }
                else {
                    const data = {
                        id: body.id,
                        name: body.name
                    };
                    logger_1.default.debug({ location: 'facebook getUserByEmail', data: data });
                    resolve(data);
                }
            });
        });
    });
};
//# sourceMappingURL=facebook.js.map