import config from '../configs/config';
import request from 'request';
import { IUser } from './channel-handler';
import logger from '../models/logger';
export interface IWebchatUser extends IUser {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  userID: string;
  countryCode: any;
  body: Object;
}

export const getUserInfo = async function(user: {
  id: string;
  name: string;
  token: string;
}): Promise<IWebchatUser> {
  return new Promise((resolve: (value?: IWebchatUser) => void, reject: (reason?: any) => void) => {
    logger.debug({ location: 'webchat getuserinfo', user: user });
    if (user.token) {
      const http_details = {
        method: 'post',
        url: config.signinoptions.location + '/api/user',
        form: { token: user.token },
        headers: {
          'api-key': config.signinoptions.apikey,
          'Content-Type': 'application/json',
          botid: config.signinoptions.botname
        },
        json: true
      };
      request(http_details, function(error: any, response: request.Response, body: any) {
        if (error || body.status == 'failure') {
          logger.error({
            location: 'webchat getUserInfo request',
            error: error,
            user: user,
            body: body
          });
          reject(error);
        } else {
          logger.debug({
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
    } else {
      logger.error({
        location: 'webchat getuserinfo',
        user: user,
        error: 'User Does not have token on webchat'
      });
      reject({ error: 'no token on webachat channel' });
    }
  });
};
