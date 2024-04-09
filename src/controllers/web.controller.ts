import { Request, Response, NextFunction } from 'express';
import uuid from 'uuid';
import config from '../configs/config';
import logger from '../models/logger';
import {
  getConversationId,
  validateToken
} from '../utilities/helper.functions';
import createError from 'http-errors';

// Main iframe which contains title bar and the iframe for sign in and bot
export const frame = function (req: Request, res: Response, next: NextFunction) {
  res.render('frame');
};

// Pretty page to apply the bot
export const index = function (req: Request, res: Response, next: NextFunction) {
  res.render('index');
};

// Renders the sign in frame which can navigate to SSO page
export const login = function (req: Request, res: Response, next: NextFunction) {
  logger.debug({
    location: '/login endpoint index',
    message: 'request for login with cookie',
    cookie: req.cookies
  });
  // Check if the user has a token and name
  if (
    req.cookies[config.defaultmodel.botName + 'token'] &&
    req.cookies[config.defaultmodel.botName + 'userName']
  ) {
    res.redirect('/direct');
  } else {
    res.redirect(
      config.signinoptions.location + '/login/' + config.signinoptions.botname
    );
    // res.render('login', { location: config.signinoptions.location, bot: config.signinoptions.botname });
  }
};

// Check Configs
// export const configlist = function (req: Request, res: Response, next: NextFunction) {
//     res.send(require("../configs/config"));
// };

// Renders the bot with bot model
export const direct = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let model = JSON.parse(JSON.stringify(config.defaultmodel));
  let token: any = undefined;
  let userName = undefined;
  logger.debug({ location: '/direct', cookie: req.cookies, query: req.query });
  try {
    // Check if the user has a token and user name
    if (
      (req.cookies[model.botName + 'token'] &&
        req.cookies[model.botName + 'userName']) ||
      (req.query.token && req.query.name)
    ) {
      if (
        req.cookies[model.botName + 'token'] &&
        req.cookies[model.botName + 'userName']
      ) {
        token = req.cookies[model.botName + 'token'];
        userName = req.cookies[model.botName + 'userName'];
        // to avoid overwriting
      } else if (req.query.token && req.query.name) {
        // @ts-ignore
        token = decodeURIComponent(encodeURIComponent(req.query.token as string));
        userName = decodeURIComponent(encodeURIComponent(req.query.name as string));
        res.cookie(model.botName + 'token', token, {
          maxAge: 3600000,
          httpOnly: true,
          secure: true
        });
        res.cookie(model.botName + 'userName', userName, {
          maxAge: 3600000,
          httpOnly: true,
          secure: true
        });
      }
      // Validate if the token is right
      const status = await validateToken(token);

      if (status == 'success') {
        if (req.cookies[model.botName + 'convo']) {
          model.conversationId = req.cookies[model.botName + 'convo'];
          model.userId = req.cookies[model.botName + 'userid'];
          model = setTokenValues(model, token, userName);
          res.render('direct', {
            model: model,
            token: true,
            title: 'Ask ME Bot',
            query: req.query.query
          });
        } else {
          const conversationID = await getConversationId();
          model.userId = uuid()
            .replace(/[-]/g, '')
            .substring(0, 11);
          model.conversationId = conversationID.conversationId;
          model = setTokenValues(model, token, userName);
          res.cookie(model.botName + 'convo', model.conversationId, {
            maxAge: 3600000,
            httpOnly: true,
            secure: true
          });
          res.cookie(model.botName + 'userid', model.userId, {
            maxAge: 3600000,
            httpOnly: true,
            secure: true
          });
          res.render('direct', {
            model: model,
            token: true,
            title: 'Ask ME Bot',
            query: req.query.query
          });
        }
      } else {
        logger.error({ location: 'direct status not success', status });
        throw new Error('Invalid Token');
      }
    } else {
      res.clearCookie(model.botName + 'token');
      res.clearCookie(model.botName + 'userName');
      res.redirect('/login');
    }
  } catch (error) {
    logger.error({ location: '/direct ', error: 'Internal Server Error:\n' + error });
    res.clearCookie(model.botName + 'token');
    res.clearCookie(model.botName + 'userName');
    res.sendStatus(500);
    next();
  }
};

/**
 *
 * @param {Object} model
 * @param {String} token
 * @param {String} name
 */
function setTokenValues(model: any, token: string, name: string) {
  if (token) {
    model.token = token;
  }
  if (name) {
    model.userName = name;
  }
  return model;
}
