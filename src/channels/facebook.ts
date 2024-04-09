import config from '../configs/config';
import request from 'request';
import { IUser } from './channel-handler';
import logger from '../models/logger';

export interface IFacebookUser extends IUser {
  userName: string;
  userID: string;
  email: string;
  body: Object;
}
export const getUserInfo = async function(user: {
  id: string;
  name: string;
}): Promise<IFacebookUser> {
  return new Promise((resolve: (value?: IFacebookUser) => void, reject: (reason?: any) => void) => {
    const http_details = JSON.parse(JSON.stringify(config.facebookRequest));
    http_details.url += user.id;
    request(http_details, function(error: any, response: request.Response, body: any) {
      if (error) {
        logger.error({ location: 'facebook getUserInfo request', error: error, user: user });
        reject(error);
      } else {
        logger.debug({
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
        } catch (error) {
          logger.error({
            location: 'facebook getUserInfo parse returned body',
            error: error,
            user: user
          });
          reject(error);
        }
      }
    });
  });
};

export const getUserByEmail = async function(email: string): Promise<{ id: string; name: string }> {
  logger.debug({ location: 'facebook getUserByEmail', email: email });
  return new Promise((resolve, reject) => {
    const queryParams = {
      access_token: config.facebookRequest.qs.access_token,
      fields: 'id,name'
    };
    request(
      {
        method: 'GET',
        url: 'https://graph.facebook.com/v2.6/' + email,
        qs: queryParams,
        json: true
      },
      (error: any, response: request.Response, body: any) => {
        if (error) {
          logger.error({ location: 'facebook getUserByEmail', error: error });
          reject(error);
        } else {
          const data = {
            id: body.id,
            name: body.name
          };
          logger.debug({ location: 'facebook getUserByEmail', data: data });
          resolve(data);
        }
      }
    );
  });
};
