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
exports.fetchLuisMap = void 0;
const redis_js_1 = require("../models/redis.js");
const luisMapDB_1 = require("../models/luisMapDB");
const logger_1 = __importDefault(require("../models/logger"));
const redisStore = new redis_js_1.Redis();
exports.fetchLuisMap = (intent) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.debug({ location: 'fetchLuisMap', intent: intent });
    return new Promise(function (resolve, reject) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fetchedData = yield redisStore.get(intent);
                if (fetchedData == undefined) {
                    logger_1.default.debug({ location: 'fetchLuisMap', intent: intent, message: 'fetch from db' });
                    const data = yield luisMapDB_1.fetchLuisMapFromDB(intent);
                    if (data) {
                        redisStore.set(intent, JSON.stringify(data), 'EX', 3600);
                        resolve(data);
                    }
                    else {
                        logger_1.default.log({ location: 'fetchLuisMap', intent: intent, message: 'no data found' });
                        resolve(undefined);
                    }
                }
                else {
                    logger_1.default.debug({ location: 'fetchLuisMap', intent: intent, message: 'fetch from redis' });
                    resolve(JSON.parse(fetchedData));
                }
            }
            catch (error) {
                logger_1.default.error({ location: 'fetchLuisMap', error: error });
                reject(error);
            }
        });
    });
});
//# sourceMappingURL=luisMapDB.functions.js.map