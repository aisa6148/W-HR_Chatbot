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
exports.xhrRequest = void 0;
const request_1 = __importDefault(require("request"));
const xml2js_1 = require("xml2js");
const logger_1 = __importDefault(require("../models/logger"));
exports.xhrRequest = function (url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            request_1.default({
                url: url,
                qs: options,
                json: true
            }, (error, response, body) => {
                if (error) {
                    logger_1.default.error({ location: 'xhrRequest request error 1', error: error });
                    reject(error);
                }
                else {
                    try {
                        if (!isJSON(body)) {
                            xml2js_1.parseString(body, function (err, result) {
                                if (err) {
                                    logger_1.default.error({ location: 'xhrRequest XLS to JSON 2', error: err });
                                    reject(err);
                                }
                                else {
                                    resolve(result);
                                }
                            });
                        }
                        else {
                            resolve(body);
                        }
                    }
                    catch (err) {
                        logger_1.default.error({ location: 'xhrRequest XLS to JSON 3', error: err });
                        reject(err);
                    }
                }
            });
        });
    });
};
const isJSON = function (json) {
    try {
        JSON.parse(json);
    }
    catch (error) {
        return false;
    }
    return true;
};
//# sourceMappingURL=xhr.adapter.js.map