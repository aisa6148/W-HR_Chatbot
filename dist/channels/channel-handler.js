"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = void 0;
const slack = __importStar(require("./slack"));
const facebook = __importStar(require("./facebook"));
const webchat = __importStar(require("./webchat"));
const msteams = __importStar(require("./msteams"));
const associate_services_1 = require("../services/associate.services");
const DEFAULT_USER = 'default-user';
const DEFAULT_EMAIL = 'unknown@walmart.com';
exports.getUserInfo = function (context) {
    return __awaiter(this, void 0, void 0, function* () {
        const activity = context.activity;
        const channel = (activity.channelId === 'directline' ? 'zoom' : activity.channelId);
        let userID = DEFAULT_USER;
        let email = DEFAULT_EMAIL;
        let userName = DEFAULT_USER;
        if (activity.from.id)
            userID = activity.from.id;
        if (activity.from.name)
            userName = activity.from.name;
        let user;
        switch (channel) {
            case 'slack':
                user = yield slack.getUserInfo({
                    id: activity.from.id,
                    name: activity.from.name
                });
                break;
            case 'facebook':
                user = yield facebook.getUserInfo({
                    id: activity.from.id,
                    name: activity.from.name
                });
                break;
            case 'webchat':
                const from = activity.from;
                user = yield webchat.getUserInfo({
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
                user = yield msteams.getUserInfo(context);
                break;
            default:
                user = {
                    userID: DEFAULT_USER,
                    email: DEFAULT_EMAIL,
                    userName: DEFAULT_USER
                };
        }
        if (user.email) {
            user = yield associate_services_1.identifyUser(user.email);
        }
        if (user) {
            if (user.userID)
                userID = user.userID;
            if (user.email)
                email = user.email;
            if (user.userName)
                userName = user.userName;
        }
        const split = email.split('@');
        if (split.length > 0) {
            userID = split[0];
        }
        return { userID, email, userName };
    });
};
//# sourceMappingURL=channel-handler.js.map