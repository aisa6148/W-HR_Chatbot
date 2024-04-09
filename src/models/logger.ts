import { CronJob } from 'cron';
import moment from 'moment-timezone';
import { Logger, transports, LoggerInstance } from 'winston';
import 'winston-azure-blob-transport';
import { Activity } from 'botbuilder';
import { IMessage } from '../types/Message';
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

export interface IBlobStorageConfiguration {
  account: {
    name: string;
    key: string;
  };
  applicationName: string;
  containerName: string;
  level: string;
}

interface IBlobStorageConfigurationInternal extends IBlobStorageConfiguration {
  blobName: string;
}

interface INotificationJob {
  notifyId: String;
  lotSize: Number;
  notificationMsg: IMessage[];
  timestamp: Date;
}
class AppLogger {
  private configuration: IBlobStorageConfiguration;
  private static instance: AppLogger;
  public logger: LoggerInstance;

  private constructor(config: IBlobStorageConfiguration) {
    this.configuration = config;
    new CronJob('0 0 0 * * *', this.setLogger, undefined, true, TIME_ZONE, this, true);
  }
  private setLogger() {
    const blobName =
      this.configuration.applicationName +
      ': ' +
      moment(new Date())
        .tz(TIME_ZONE)
        .format('YYYY-MM-DD') +
      '.log';
    const _config = { ...this.configuration, blobName } as IBlobStorageConfigurationInternal;
    this.logger = new Logger({
      transports: [
        // @todo console.log when running in local.
        // @todo delete blob log files after retention period of 7 days.
        new transports.Console({ level: _config.level }),
        new (transports as any).AzureBlob(_config)
      ]
    });
  }

  private static setErrorStack(logObject: any) {
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

  public static init(config: IBlobStorageConfiguration) {
    AppLogger.instance = new AppLogger(config);
  }
  private static setSessionData(data: any, activity: Activity) {
    if (activity && activity.conversation) {
      data.conversationId = activity.conversation.id;
      data.channel = activity.channelId;
      data.text = activity.text;
    }
  }
  public static log(level: string, logObject: any, activity?: Activity) {
    if (LOG_LEVEL_LIST.indexOf(level) === -1) {
      return;
    }
    if (!AppLogger.instance) {
      throw new Error('init() not called! init() should be called at start of application.');
    }
    try {
      AppLogger.setErrorStack(logObject);
      if (activity) AppLogger.setSessionData(logObject, activity);
      const _logObject = { logObject };
      // debug({ level, _logObject });
      (AppLogger.instance.logger as any)[level](JSON.stringify(_logObject));
    } catch (error) {
      // Suppress the error as we do not want application to break incase of logging failure
      console.error('Logging failure');
      throw error;
    }
  }
}


export const logNotifications = async function (
  email: String,
  isSuccessful: Boolean,
  createdBy: string,
  jobId: string
) {
  const timeStamp = new Date();

  const result = { 'email': email, 'isSuccessful': isSuccessful, 'createdBy': createdBy, 'notifyId': jobId, 'timeStamp': timeStamp };
  try {
    await database.insertDocument({ id: process.env.DATABASE_NAME }, { id: 'NotificationLogs' }, result);
  } catch (e) {
    console.error('error');
  }

};

export const logNotificationJobs = async function (
  NotificationJob: INotificationJob
) {
  try {
    await database.insertDocument({ id: process.env.DATABASE_NAME }, { id: 'NotificationJobs' }, NotificationJob);
  } catch (e) {
    console.error('error');
  }

};

export default {
  init: (config: IBlobStorageConfiguration) => {
    AppLogger.init(config);
  },
  error: (logObject: any, activity?: Activity) => {
    AppLogger.log('error', logObject, activity);
  },
  warn: (logObject: any, activity?: Activity) => {
    AppLogger.log('warn', logObject, activity);
  },
  log: (logObject: any, activity?: Activity) => {
    AppLogger.log('info', logObject, activity);
  },
  info: (logObject: any, activity?: Activity) => {
    AppLogger.log('info', logObject, activity);
  },
  verbose: (logObject: any, activity?: Activity) => {
    AppLogger.log('verbose', logObject, activity);
  },
  debug: (logObject: any, activity?: Activity) => {
    // Log debug messages into blob only for dev instance
    if (process.env.NODE_ENV === 'DEV') {
      AppLogger.log('debug', logObject, activity);
    } else {
      const data = { logObject };
      console.log(data, activity);
    }
  },
  silly: (logObject: any, activity?: Activity) => {
    AppLogger.log('silly', logObject, activity);
  }
};
