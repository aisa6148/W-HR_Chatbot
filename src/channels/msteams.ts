import config from '../configs/config';
import request from 'request';
import { IUser } from './channel-handler';
import logger from '../models/logger';
import { Activity, TurnContext, TeamsInfo } from 'botbuilder';
import { PagedMembersResult } from 'botframework-connector/lib/connectorApi/models/mappers';

export interface IMSTeamsUser extends IUser {
    userName: string;
    userID: string;
    email: string;
    body: Object;
}
export const getUserInfo = async function (context: TurnContext) {
    let members;
    try {
        // member = await TeamsInfo.getMember(context, context.activity.from.id);
        members = await TeamsInfo.getMembers(context);
        let searchedMember;
        for (const member of members) {
            if (context.activity.from.id === member.id) {
                searchedMember = member;
            }
        }
        const userObj = {
            userID: searchedMember.userPrincipalName.split('@')[0],
            userName: searchedMember.name,
            email: searchedMember.email || searchedMember.userPrincipalName
        };
        return userObj;
    }
    catch (e) {
        if (e.code === 'MemberNotFoundInConversation') {
            logger.log('Member not found.');
            return;
        } else {
            logger.log(e);
            throw e;
        }
    }
};

export const getUserByEmail = async function (context: TurnContext, email: string): Promise<{ id: string; name: string }> {
    logger.debug({ location: 'msteams getUserByEmail', email: email });
    let member;
    try {
        member = await TeamsInfo.getMembers(context);
    } catch (e) {
        if (e.code === 'MemberNotFoundInConversation') {
            logger.log('Member not found.');
            return;
        } else {
            logger.log(e);
            throw e;
        }
    }
    logger.log(member);
    return await member[0];
};
