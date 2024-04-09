import request from 'request';
import { parseString } from 'xml2js';
import logger from '../models/logger';

export const xhrRequest = async function(
  url: string,
  options: { [index: string]: any }
): Promise<any> {
  return new Promise((resolve, reject) => {
    request(
      {
        url: url,
        qs: options,
        json: true
      },
      (error: any, response, body: string) => {
        if (error) {
          logger.error({ location: 'xhrRequest request error 1', error: error });
          reject(error);
        } else {
          try {
            if (!isJSON(body)) {
              parseString(body, function(err: Error, result: any) {
                if (err) {
                  logger.error({ location: 'xhrRequest XLS to JSON 2', error: err });
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            } else {
              resolve(body);
            }
          } catch (err) {
            logger.error({ location: 'xhrRequest XLS to JSON 3', error: err });
            reject(err);
          }
        }
      }
    );
  });
};

const isJSON = function(json: string): boolean {
  try {
    JSON.parse(json);
  } catch (error) {
    return false;
  }
  return true;
};
