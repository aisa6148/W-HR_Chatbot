import { BotFrameworkAdapter, ConversationState, UserState, TurnContext } from 'botbuilder';
import { Request, Response } from 'express';
import { ActivityTypes, ContactRelationUpdateActionTypes } from 'botbuilder-core';
import { BlobStorage } from 'botbuilder-azure';
import { Bot } from '../bot/bot.dialog';
import { BotLoggerMiddleware } from '../middleware/chat-logger';
import logger from '../models/logger';
import config from '../configs/config';
import { send, sendRichCard } from '../utilities/helper.functions';
import { GREETING_BUTTONS, REPLY_TEXTS, SHOW_MORE } from '../configs/bot.constants';
import { getZoomAccountDetailsFromEmail, isIDCUser, getZoomToken, sendChat, sendActivity } from '../channels/zoom';
import { ConversationList } from 'botframework-connector/lib/teams/models/mappers';
import { Redis } from '../models/redis';
const redisStore = new Redis();

const zoomUserIdToDirectLineMap = new Map();
const zoomUsersInMemory: string[] = [];
const secret = config.zoom.directLineSecret;
const axios = require('axios');

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Catch-all for errors.
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  // This check writes out errors to console log .vs. app insights.
  logger.error({ location: 'onTurnError', error }, context.activity);
  // Send a message to the user
  await context.sendActivity(`Oops. Something went wrong!`);
  // Clear out state
  await conversationState.delete(context);
};

// Default container name
// const DEFAULT_BOT_CONTAINER = 'whr-dev-context-data';
// Get service configuration
const blobStorage = new BlobStorage({
  containerName: process.env.BLOB_CONTEXT_BLOB_CONTAINER,
  storageAccountOrConnectionString:
    'DefaultEndpointsProtocol=https;AccountName=' +
    config.azureLogStorage.account.name +
    ';AccountKey=' +
    config.azureLogStorage.account.key +
    ';EndpointSuffix=core.windows.net'
});

// Replace memory storage
// const memoryStorage = new MemoryStorage();
export const conversationState = new ConversationState(blobStorage);
export const userState = new UserState(blobStorage);
const botLogger = BotLoggerMiddleware.getInstance(conversationState, userState, adapter);

adapter.use(botLogger);
// Create the main dialog.
const bot = new Bot();
// const firstrun = new FirstRun(conversationState, userState);

// Listen for incoming activities and route them to your bot main dialog.
const botHandler = async function (req: Request, res: Response) {

  if (typeof req.body.payload !== 'undefined') {

    const payload = req.body.payload;
    // console.log('payload', payload);
    let name = '';
    if (typeof payload.name !== 'undefined')
      name = payload.name;
    if (typeof payload.userName !== 'undefined')
      name = payload.userName;
    let message = '';
    if (typeof payload.cmd !== 'undefined')
      message = payload.cmd;
    if (typeof payload.actionItem !== 'undefined')
      message = payload.actionItem.value;
    const toJid = payload.toJid;
    const accountId = payload.accountId;
    const userId = payload.userId;

    const accountDetails = await getZoomAccountDetailsFromEmail(userId);
    const email = accountDetails.email;
    logger.log({ 'location': 'after retreiving zoom account', email: email });



    // sendImage(toJid, accountId, message);

    // Start a conversation:-
    const isIdcUser = await isIDCUser(email);
    if (isIdcUser) {
      const fetchedData = await redisStore.get(userId);
      if (fetchedData == undefined) {
        logger.log('not present in memory');
        axios({
          method: 'post',
          url: config.zoom.directlineConversationUrl,
          headers: {
            'Content-type': 'application/json',
            Authorization: 'Bearer ' + secret
          }
        })
          .then(async function (response: any) {
            redisStore.set(userId, JSON.stringify(response.data.conversationId), 'EX', 3600);
            await sendActivity(response.data, name, message, toJid, accountId, email);
          })
          .catch(function (error: any) {
            logger.error({ location: 'zoom Start New Conversation', error: error });
          });
      }
      else {
        const convId = await JSON.parse(fetchedData);
        await sendActivity({ 'conversationId': convId }, name, message, toJid, accountId, email);
      }
    }
    else {
      const zoomToken = await getZoomToken(toJid, accountId);
      const msg = 'This bot is only for IDC Associates :) ';
      await sendChat(zoomToken, toJid, accountId, msg);
    }


  }

  adapter.processActivity(req, res, async (context: TurnContext) => {
    // route to main dialog.
    // enable user check only for messages and not events

    if (context.activity.type == ActivityTypes.Message) {
      logger.log(context.activity.text);
      //     Uncomment to control user access
      //     let user = await userState.get(context);
      //     let email = user[STATE_PROPERTY_NAMES.CURRENT_USER].email;
      //     let allowed = await userAccessController.verifyUser(email);
      //     if (allowed) {
      //         await bot.onTurn(context);
      //     } else {
      //         await context.sendActivity("You do not have access to this bot");
      //     }
      // } else {
      await bot.onTurn(context);
      logger.debug(
        { location: 'bot.controller', message: context.activity.text },
        context.activity
      );
    } else if (context.activity.type === ActivityTypes.Event) {
      logger.log('inside else');
      // if (context.activity.channelId === 'webchat' || context.activity.channelId === 'emulator') {
      //   const user = await BotLoggerMiddleware.userProfile.get(context);
      //   const name = user.userName || user.step.context.activity.from.name || '';
      //   await context.sendActivity(
      //     'Hey ' + name + REPLY_TEXTS.FIRST_INTRO_TEXT,
      //   );
      //   await sendRichCard(context, 'I can assist you with:', GREETING_BUTTONS);
      //   await sendRichCard(context, '', SHOW_MORE);
      // }
      logger.debug(
        {
          location: 'bot.controller',
          eventName: context.activity.name,
          eventValue: context.activity.value
        },
        context.activity
      );
    }
  });
};

export { botHandler };
export { adapter as BotAdapter };
