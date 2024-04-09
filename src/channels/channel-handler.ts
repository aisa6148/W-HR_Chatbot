import * as slack from './slack';
import * as facebook from './facebook';
import * as webchat from './webchat';
import * as msteams from './msteams';
import { Activity, ChannelAccount, TurnContext } from 'botbuilder';
import { identifyUser } from '../services/associate.services';
export interface IUser {
  userID: string;
  email: string;
  userName: string;
}
const DEFAULT_USER = 'default-user';
const DEFAULT_EMAIL = 'unknown@walmart.com';

export interface WebchatFromActivity extends ChannelAccount {
  token?: string;
}
export const getUserInfo = async function (context: TurnContext): Promise<IUser> {
  const activity = context.activity;
  const channel = (activity.channelId === 'directline' ? 'zoom' : activity.channelId);
  let userID = DEFAULT_USER;
  let email = DEFAULT_EMAIL;
  let userName = DEFAULT_USER;
  if (activity.from.id) userID = activity.from.id;
  if (activity.from.name) userName = activity.from.name;
  let user: IUser;
  switch (channel) {
    case 'slack':
      user = await slack.getUserInfo({
        id: activity.from.id,
        name: activity.from.name
      });
      break;
    case 'facebook':
      user = await facebook.getUserInfo({
        id: activity.from.id,
        name: activity.from.name
      });
      break;
    case 'webchat':
      const from: WebchatFromActivity = activity.from;
      user = await webchat.getUserInfo({
        id: from.id,
        name: from.name,
        token: from.token
      });
      break;
    case 'zoom':
      user = {
        userID: DEFAULT_USER,
        email: activity.from.id,
        userName: activity.from.name

      };
      break;
    case 'msteams':
      user = await msteams.getUserInfo(context);
      break;
    default:
      user = {
        userID: DEFAULT_USER,
        email: DEFAULT_EMAIL,
        userName: DEFAULT_USER
      };
  }
  if (user.email) {
    user = await identifyUser(user.email);
  }
  if (user) {
    if (user.userID) userID = user.userID;
    if (user.email) email = user.email;
    if (user.userName) userName = user.userName;
  }
  const split = email.split('@');
  if (split.length > 0) {
    userID = split[0];
  }
  return { userID, email, userName };
};
