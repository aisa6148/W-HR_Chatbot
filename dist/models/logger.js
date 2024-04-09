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
exports.logNotificationJobs = exports.logNotifications = void 0;
const cron_1 = require("cron");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const winston_1 = require("winston");
require("winston-azure-blob-transport");
const TIME_ZONE = 'Asia/Kolkata';
const database = require('../utilities/database');
// const debug = _debug("abl:index");
// debug("index loaded");
/**
 * winston uses npm log levels by default. Below is the list in order of priority
 * More info: https://github.com/winstonjs/winston#logging-levels
 *
 * NPM Log Levels
 * error: 0,
 * warn: 1,
 * info: 2,
 * verbose: 3,
 * debug: 4,
 * silly: 5
 */
const LOG_LEVEL_LIST = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
class AppLogger {
    constructor(config) {
        this.configuration = config;
        new cron_1.CronJob('0 0 0 * * *', this.setLogger, undefined, true, TIME_ZONE, this, true);
    }
    setLogger() {
        const blobName = this.configuration.applicationName +
            ': ' +
            moment_timezone_1.default(new Date())
                .tz(TIME_ZONE)
                .format('YYYY-MM-DD') +
            '.log';
        const _config = Object.assign(Object.assign({}, this.configuration), { blobName });
        this.logger = new winston_1.Logger({
            transports: [
                // @todo console.log when running in local.
                // @todo delete blob log files after retention period of 7 days.
                new winston_1.transports.Console({ level: _config.level }),
                new winston_1.transports.AzureBlob(_config)
            ]
        });
    }
    static setErrorStack(logObject) {
        let errorStack;
        for (const property in logObject) {
            if (logObject[property] instanceof Error) {
                errorStack = logObject[property].stack;
            }
        }
        if (errorStack) {
            logObject.errorStack = errorStack;
        }
    }
    static init(config) {
        AppLogger.instance = new AppLogger(config);
    }
    static setSessionData(data, activity) {
        if (activity && activity.conversation) {
            data.conversationId = activity.conversation.id;
            data.channel = activity.channelId;
            data.text = activity.text;
        }
    }
    static log(level, logObject, activity) {
        if (LOG_LEVEL_LIST.indexOf(level) === -1) {
            return;
        }
        if (!AppLogger.instance) {
            throw new Error('init() not called! init() should be called at start of application.');
        }
        try {
            AppLogger.setErrorStack(logObject);
            if (activity)
                AppLogger.setSessionData(logObject, activity);
            const _logObject = { logObject };
            // debug({ level, _logObject });
            AppLogger.instance.logger[level](JSON.stringify(_logObject));
        }
        catch (error) {
            // Suppress the error as we do not want application to break incase of logging failure
            console.error('Logging failure');
            throw error;
        }
    }
}
exports.logNotifications = function (email, isSuccessful, createdBy, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeStamp = new Date();
        const result = { 'email': email, 'isSuccessful': isSuccessful, 'createdBy': createdBy, 'notifyId': jobId, 'timeStamp': timeStamp };
        try {
            yield database.insertDocument({ id: process.env.DATABASE_NAME }, { id: 'NotificationLogs' }, result);
        }
        catch (e) {
            console.error('error');
        }
    });
};
exports.logNotificationJobs = function (NotificationJob) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield database.insertDocument({ id: process.env.DATABASE_NAME }, { id: 'NotificationJobs' }, NotificationJob);
        }
        catch (e) {
            console.error('error');
        }
    });
};
exports.default = {
    init: (config) => {
        AppLogger.init(config);
    },
    error: (logObject, activity) => {
        AppLogger.log('error', logObject, activity);
    },
    warn: (logObject, activity) => {
        AppLogger.log('warn', logObject, activity);
    },
    log: (logObject, activity) => {
        AppLogger.log('info', logObject, activity);
    },
    info: (logObject, activity) => {
        AppLogger.log('info', logObject, activity);
    },
    verbose: (logObject, activity) => {
        AppLogger.log('verbose', logObject, activity);
    },
    debug: (logObject, activity) => {
        // Log debug messages into blob only for dev instance
        if (process.env.NODE_ENV === 'DEV') {
            AppLogger.log('debug', logObject, activity);
        }
        else {
            const data = { logObject };
            console.log(data, activity);
        }
    },
    silly: (logObject, activity) => {
        AppLogger.log('silly', logObject, activity);
    }
};
//# sourceMappingURL=logger.js.map