import fetch from 'node-fetch';
import config from '../configs/config';
import logger from '../models/logger';
import { IBotLoggerResourceResponse } from '../middleware/chat-logger';
import {
  CardAction,
  CardFactory,
  ActivityTypes,
  ActionTypes,
  Attachment,
  Activity,
  TurnContext
} from 'botbuilder';
import { IButton, IMessage } from '../types/Message';
import { BotAdapter } from '../controllers/bot.controller';
import { MicrosoftAppCredentials } from 'botframework-connector';

/**
 * @description Method to get the current conversationID
 * @argument void
 */
export const getConversationId = async () => {
  try {
    const res = await fetch(config.directLineRequest.url, config.directLineRequest);
    return res.json();
  } catch (error) {
    logger.error({ location: 'helperfunctions getConversationId', error: error });
  }
};

export const validateToken = async function (token: string) {
  const options = {
    method: 'post',
    body: JSON.stringify({ token: token }),
    headers: {
      'api-key': config.signinoptions.apikey,
      'Content-Type': 'application/json',
      botid: config.signinoptions.botname
    }
  };
  try {
    const res = await fetch(config.signinoptions.location + '/api/verifytoken', options);
    const body = await res.json();
    return body.status;
  } catch (error) {
    logger.error({ location: 'helperfunctions validateToken', error: error, token: token });
    return 'failure';
  }
};

export const send = async (context: TurnContext, text: string): Promise<void> => {
  try {
    if (context.activity.channelId === 'slack') text = santitizeString(text);
    const responseResource: IBotLoggerResourceResponse = await context.sendActivity(text);
    const event = context.activity;
    event.type = 'event';
    event.name = 'feedback';
    event.value = { messageID: responseResource.documentID, elementID: responseResource.id };
    await context.sendActivity(event);
  } catch (error) {
    logger.error({ location: 'helperfunctions send', error: error });
  }
};

export const sendWithoutFeedback = async (context: TurnContext, text: string): Promise<void> => {
  try {
    if (context.activity.channelId === 'slack') text = santitizeString(text);
    await context.sendActivity(text);
  } catch (error) {
    logger.error({ location: 'helperfunctions sendWithoutFeedback', error: error });
  }
};

export const sendWithouthFeedbackAndWithDefaultFormatting = async (context: TurnContext, text: string): Promise<void> => {
  try {
    await context.sendActivity(text);
  } catch (error) {
    logger.error({ location: 'sendWithouthFeedbackAndWithDefaultFormatting', error: error });
  }
};


export const sendRichCard = async (context: TurnContext, text: string, options: IButton[]) => {
  try {
    if (context.activity.channelId === 'slack') text = santitizeString(text);
    const message = card(text, options, context.activity.channelId == 'msteams' ? ActionTypes.MessageBack : ActionTypes.PostBack);
    const responseResource: IBotLoggerResourceResponse = await context.sendActivity(message);
    const activity = context.activity;
    activity.type = 'event';
    activity.name = 'feedback';
    activity.value = { messageID: responseResource.documentID, elementID: responseResource.id };
    await context.sendActivity(activity);
  } catch (error) {
    logger.error({ location: 'helperfunctions sendRichCard', error: error });
  }
};

export const sendRichCardWithoutFeedback = async (
  context: TurnContext,
  text: string,
  options: IButton[]
) => {
  try {
    if (context.activity.channelId == 'slack') text = santitizeString(text);
    const activity = card(text, options, context.activity.channelId == 'msteams' ? ActionTypes.MessageBack : ActionTypes.PostBack);
    await context.sendActivity(activity);
  } catch (error) {
    logger.error({ location: 'helperfunctions sendRichCardWithoutFeedback', error: error });
  }
};

function santitizeString(text: string): string {
  text = text.replace(/\[(.*?)\]\((.*?)\)/, '<$2|$1>');
  text = text.replace(/&#160;/g, ' ');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&amp;/g, '&');
  return text;
}

export const card = (
  text: string,
  buttons: IButton[],
  cardType?: ActionTypes
): Partial<Activity> => {
  const reply: Partial<Activity> = { type: ActivityTypes.Message };
  const cardAction: CardAction[] = [];
  buttons.forEach(button => {
    cardAction.push({
      type: cardType || ActionTypes.PostBack,
      title: button.display,
      value: button.value,
      text: button.value
    });
  });
  const card: Attachment = CardFactory.heroCard('', undefined, cardAction, { text });
  reply.attachments = [card];
  return reply;
};

export const deliverMessages = async (context: TurnContext, messages: IMessage[]) => {
  for (const message of messages) {
    if (message.feedback) {
      if (message.buttons) {
        await sendRichCard(context, message.text, message.buttons);
      } else {
        await send(context, message.text);
      }
    } else {
      if (message.buttons) {
        await sendRichCardWithoutFeedback(context, message.text, message.buttons);
      } else {
        await sendWithoutFeedback(context, message.text);
      }
    }
  }
};

export const notifyUser = async (address: Partial<Activity>, messages: IMessage[]) => {
  try {
    MicrosoftAppCredentials.trustServiceUrl(address.serviceUrl);
    for (const message of messages) {
      if (message.text) {
        await BotAdapter.createConversation(
          TurnContext.getConversationReference(address),
          async (turnContext: TurnContext) => {
            await turnContext.sendActivity(message.text);
          }
        );
      }
      else if (message.image) {
        await BotAdapter.createConversation(
          TurnContext.getConversationReference(address),
          async (turnContext: TurnContext) => {
            await turnContext.sendActivity({
              channelData: {
                attachments: [
                  {
                    text: '',
                    fallback: 'Ask ME notification',
                    callback_id: 'birthday',
                    attachment_type: 'default',
                    image_url: message.image
                  }
                ]
              }
            });
          }
        );
      }
      else if (message.buttons) {
        const msgButtons: (string | CardAction)[] = [];
        for (const button of message.buttons) {
          const obj = {
            type: 'postBack',
            title: button.display,
            value: button.value
          };
          msgButtons.push(obj);
        }
        await BotAdapter.createConversation(
          TurnContext.getConversationReference(address),
          async (turnContext: TurnContext) => {
            await turnContext.sendActivity({
              attachments: [
                CardFactory.heroCard('', [{ url: '' }], msgButtons, { text: message.text })
              ]
            });
          }
        );
      } else {
        throw new Error('Format Error');
      }
    }
    return 'Notified';
  } catch (error) {
    logger.error({ location: 'helperfunctions notifyUser', error: error });
    throw error;
  }
};

export const notifySlackUser = async (address: Partial<Activity>, messages: IMessage[]) => {
  try {
    MicrosoftAppCredentials.trustServiceUrl(address.serviceUrl);
    const ref = TurnContext.getConversationReference(address);
    ref.conversation = {
      isGroup: false,
      id: ref.bot.id + ':' + ref.user.id.split(':')[0],
      conversationType: 'slack',
      tenantId: '',
      name: ''
    };
    for (const message of messages) {
      if (address.channelId === 'slack' && message.text) {
        message.text = message.text.replace(/\[(.*?)\]\((.*?)\)/, '<$2|$1>');
        message.text = message.text.replace(/&#160;/g, ' ');
        message.text = message.text.replace(/&#39;/g, "'");
      }
      if (message.text) {
        await BotAdapter.createConversation(ref,
          async (t1) => {
            const ref2 = TurnContext.getConversationReference(t1.activity);
            await t1.adapter.continueConversation(ref2, async (t2) => {
              await t2.sendActivity(message.text);
            });
          });
      }
      else if (message.image) {
        await BotAdapter.createConversation(ref,
          async (t1) => {
            const ref2 = TurnContext.getConversationReference(t1.activity);
            await t1.adapter.continueConversation(ref2, async (t2) => {
              await t2.sendActivity({
                channelData: {
                  attachments: [
                    {
                      text: '',
                      fallback: 'Ask ME notification',
                      callback_id: 'birthday',
                      attachment_type: 'default',
                      image_url: message.image
                    }
                  ]
                }
              });
            });
          });
      }
      else if (message.buttons) {
        const msgButtons: (string | CardAction)[] = [];
        for (const button of message.buttons) {
          const obj = {
            type: 'postBack',
            title: button.display,
            value: button.value
          };
          msgButtons.push(obj);
        }
        await BotAdapter.createConversation(ref,
          async (t1) => {
            const ref2 = TurnContext.getConversationReference(t1.activity);
            await t1.adapter.continueConversation(ref2, async (t2) => {
              await t2.sendActivity({
                attachments: [
                  CardFactory.heroCard('', [{ url: '' }], msgButtons, { text: message.text })
                ]
              });
            });
          });
      } else {
        throw new Error('Format Error');
      }
    }
    return 'Notified';
  } catch (error) {
    logger.error({ location: 'helperfunctions notifyUser', error: error });
    throw error;
  }
};
