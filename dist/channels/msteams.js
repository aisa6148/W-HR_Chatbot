"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = exports.getUserInfo = void 0;
const logger_1 = __importDefault(require("../models/logger"));
const botbuilder_1 = require("botbuilder");
exports.getUserInfo = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        let members;
        try {
            // member = await TeamsInfo.getMember(context, context.activity.from.id);
            members = yield botbuilder_1.TeamsInfo.getMembers(context);
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
                logger_1.default.log('Member not found.');
                return;
            }
            else {
                logger_1.default.log(e);
                throw e;
            }
        }
    });
};
exports.getUserByEmail = function (context, email) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.debug({ location: 'msteams getUserByEmail', email: email });
        let member;
        try {
            member = yield botbuilder_1.TeamsInfo.getMembers(context);
        }
        catch (e) {
            if (e.code === 'MemberNotFoundInConversation') {
                logger_1.default.log('Member not found.');
                return;
            }
            else {
                logger_1.default.log(e);
                throw e;
            }
        }
        logger_1.default.log(member);
        return yield member[0];
    });
};
//# sourceMappingURL=msteams.js.map