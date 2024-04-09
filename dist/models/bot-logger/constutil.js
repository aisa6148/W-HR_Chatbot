"use strict";
/**
 * @author Madhav
 * @desc Enums Utility File
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../configs/config"));
const constUtil = {};
module.exports = constUtil;
constUtil.schemasEnum = {
    UsageSchema: 'Usage',
    User: 'User',
    ConversationDetails: 'ConversationDetails',
    Message: 'Message',
};
constUtil.database = {
    DEV: {
        id: config_1.default.chatlogdbDev,
    },
    PROD: {
        id: config_1.default.chatlogdb,
    },
};
constUtil.collection = {
    User: {
        id: 'COLL_USER',
    },
    Message: {
        id: 'COLL_MSG',
    },
    ConversationDetails: {
        id: 'COLL_CONV_DETAILS',
    },
    Usage: {
        id: 'COLL_USAGE',
    },
};
/**
 *
 * @param {String} text
 * @desc To check if the given schemaName is correct of not
 */
constUtil.checkSchemaName = function (text) {
    Object.keys(this.schemasEnum).forEach(key => {
        if (this.schemasEnum[key] == text) {
            return true;
        }
    });
    return false;
};
//# sourceMappingURL=constutil.js.map