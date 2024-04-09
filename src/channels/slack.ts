import config from '../configs/config';
import request from 'request';
import { IUser } from './channel-handler';
import logger from '../models/logger';

export interface ISlackUser extends IUser {
  userName: string;
  userID: string;
  firstName: string;
  lastName: string;
  email: string;
  body: Object;
}
export const getUserInfo = async function (user: { id: string; name: string }): Promise<ISlackUser> {
  return new Promise((resolve: (value?: ISlackUser) => void, reject: (reason?: any) => void) => {
    const http_details = JSON.parse(JSON.stringify(config.slackRequest));
    const id = user.id;
    http_details.qs.user = id.split(':')[0];
    request(http_details, function (error: any, response: request.Response, body: any) {
      if (error) {
        logger.error({ location: 'slack getUserInfo request', error: error, user: user });
        reject(error);
      } else {
        logger.debug({ location: 'slack getUserInfo successful request ', body: body, user: user });
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
        } catch (error) {
          logger.error({
            location: 'slack getUserInfo parse returned body',
            error: error,
            user: user
          });
          reject(error);
        }
      }
    });
  });
};

export const getUserByEmail = async function (email: string): Promise<{ id: string; name: string }> {
  logger.debug({ location: 'slack getUserByEmail', email: email });
  return new Promise((resolve, reject) => {
    const queryParams = {
      token: config.slackRequest.qs.token,
      email: email
    };
    request(
      {
        method: 'GET',
        url: 'https://slack.com/api/users.lookupByEmail',
        qs: queryParams,
        json: true
      },
      async (error: any, response: request.Response, body: any) => {
        if (error) {
          logger.error({ location: 'slack getUserByEmail', error: error });
          reject(error);
        } else {
          try {
            if (body.ok === false) {
              logger.info({ location: 'slack find user by email false ', error, email, body });
              if (body.error === 'ratelimited') {
                await sleep(61000);
                const userIdAndName = await getUserByEmail(email);
                resolve(userIdAndName);
              } else {
                logger.error({
                  location: 'slack find user by email unknown false reason',
                  error,
                  email
                });
                reject(undefined);
              }
            } else {
              const data = {
                id: body.user.id + ':' + body.user['team_id'],
                name: body.user.name
              };
              logger.debug({ location: 'slack getUserByEmail', data: data });
              resolve(data);
            }
          } catch (error) {
            logger.error({ location: 'slack find user by email caught error', error, email });
            reject(undefined);
          }
        }
      }
    );
  });
};

const sleep = async (timeout: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, timeout);
  });
};
