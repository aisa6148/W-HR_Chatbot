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
exports.Redis = void 0;
const logger_1 = __importDefault(require("../models/logger"));
const redis_1 = __importDefault(require("redis"));
const bluebird_1 = __importDefault(require("bluebird"));
const config_1 = __importDefault(require("../configs/config"));
const redisConfig = config_1.default.redis;
class Redis {
    constructor() {
        bluebird_1.default.promisifyAll(redis_1.default.RedisClient.prototype);
        bluebird_1.default.promisifyAll(redis_1.default.Multi.prototype);
        this.client = redis_1.default.createClient(6380, redisConfig.tls.servername, redisConfig);
        this.client.on('error', function (error) {
            logger_1.default.error({ location: 'redis initialization', error: error });
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.client.get(key, (error, reply) => error ? reject(error) : resolve(reply));
            });
        });
    }
    set(key, value, mode, duration) {
        return this.client.set(key, value, mode, duration);
    }
}
exports.Redis = Redis;
//# sourceMappingURL=redis.js.map