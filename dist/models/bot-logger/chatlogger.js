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
const logger_1 = __importDefault(require("../logger"));
/**
 * @author Madhav
 * @author Jatin Mohan
 * @version 0.1
 */
// const validate = require('schema-validator');
// const SchemaDefinition = require('./schemas/schema');
const constutil = require('./constutil');
const database = require('./database');
/**
 * @description
 * This class provides methods to connect the database and
 * create documents for telemetry purpose.
 */
class ChatLogger {
    /**
     *
     * @param {String} url of database
     * @param {String} key Read/Write key of database
     * @param {String} botID Unique ID to identify the bot
     * @param {String} env Should be either 'DEV' or 'PROD'
     */
    constructor(url, key, botID, botName, env = 'DEV') {
        const _this = this;
        _this.botID = botID;
        _this.botName = botName;
        _this.databaseName = constutil.database[env];
        _this.database = new database(url, key);
        _this.database
            .connectDB(constutil.database[env])
            .then(() => _this.database.getCollection(constutil.database[env], constutil.collection['User']))
            .then(() => _this.database.getCollection(constutil.database[env], constutil.collection['Usage']))
            .then(() => _this.database.getCollection(constutil.database[env], constutil.collection['ConversationDetails']))
            .then(() => _this.database.getCollection(constutil.database[env], constutil.collection['Message']))
            .catch((error) => logger_1.default.error({ location: 'ChatLogger ctor', error }));
    }
    /**
     * Writes data related to a particular message
     * @param {Object} metadata Json object containing the particular message Data
     * @param {String} metadata.from
     * @param {String} metadata.message
     * @param {String} metadata.messageType
     * @param {String} metadata.conversationID
     * @param {Number} [metadata.timestamp]
     * @param {String} [metadata.userQuestion]
     * @param {JSON} [metadata.card]
     * @param {String} [metadata.luisIntent]
     * @param {Number} [metadata.luisScore]
     * @param {Number} [metadata.qnaScore]
     * @param {JSON} [metadata.qnaResponse]
     * @param {String} [metadata.feedback]
     * @param {JSON} [metadata.customData]
     */
    saveMessageDocument(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const document = {
                botID: this.botID,
                conversationID: metadata.conversationID,
                from: metadata.from,
                timeStamp: metadata.timestamp || new Date().valueOf(),
                message: metadata.message,
                messageType: metadata.messageType,
                card: metadata.messageType == 'RichData' ? metadata.card : undefined
            };
            if (metadata.messageID)
                document.messageID = metadata.messageID;
            if (metadata.userQuestion)
                document.userQuestion = metadata.userQuestion;
            if (metadata.luisIntent)
                document.luisIntent = metadata.luisIntent;
            if (metadata.luisScore)
                document.luisScore = metadata.luisScore;
            if (metadata.qnaScore)
                document.qnaScore = metadata.qnaScore;
            if (metadata.qnaResponse)
                document.qnaResponse = metadata.qnaResponse;
            if (metadata.feedback)
                document.feedback = metadata.feedback;
            if (metadata.customData)
                document.customData = metadata.customData;
            // const verify = new validate(SchemaDefinition.COLL_MSG);
            // let check = verify.check(document);
            // if (check._error) {
            //     return callback(check);
            // } else {
            try {
                const result = yield this.database.docCreate(this.databaseName, constutil.collection['Message'], document);
                return result.id;
            }
            catch (e) {
                throw e;
            }
            // }
        });
    }
    /**
     * Writes the user data onto the User Collection
     * @param {Object} metadata Json object containing the user Data
     * @param {string} metadata.userID
     * @param {string} metadata.userName
     * @param {string} metadata.email
     * @param {string} metadata.countryCode
     * @param {JSON} [metadata.customData]
     * @param {function(err)} callback executes after completion, contains error as the parameter to callback
     */
    saveUserDocument(metadata, callback) {
        this.queryUser(metadata.userID)
            .then((res) => {
            if (res.length > 0) {
                callback();
            }
            else {
                const document = {
                    userID: metadata.userID || 'default-user',
                    userName: metadata.userName || 'default-name',
                    email: metadata.email,
                    countryCode: metadata.countryCode,
                    botID: this.botID
                };
                if (metadata.customData) {
                    document.customData = metadata.customData;
                }
                // const verify = new validate(SchemaDefinition.COLL_USER);
                // let check = verify.check(document);
                // if (check._error) {
                //     return callback(check);
                // } else {
                // Fetch the user document
                this.database
                    .docCreate(this.databaseName, constutil.collection['User'], document)
                    .catch((err) => {
                    callback(err);
                });
            }
            // }
        })
            .catch((err) => callback(err));
    }
    /**
     * returns the documents with the userID
     * @param {string} userID
     */
    queryUser(userID) {
        if (!userID || userID == '') {
            userID = 'default-user';
        }
        const query = "SELECT * FROM r WHERE r.userID='" + userID + "' and r.botID='" + this.botID + "'";
        return this.database.queryCollection(this.databaseName, constutil.collection['User'], query);
    }
    /**
     * returns the documents with the conversationID
     * @param {string} conversationID
     */
    queryConversation(conversationID) {
        const query = "SELECT * FROM r WHERE r.conversationID='" +
            conversationID +
            "' and r.botID='" +
            this.botID +
            "'";
        return this.database.queryCollection(this.databaseName, constutil.collection['ConversationDetails'], query);
    }
    /**
     * saves the particular session usage of the bot
     * @param {Object} metadata Json object containing a particular bot usage Data
     * @param {Number} metadata.startTimestamp
     * @param {boolean} metadata.abandon
     * @param {Number} metadata.endTimestamp
     * @param {String} [metadata.conversationID]
     * @param {function(err)} callback executes after completion, contains error as the parameter to callback
     */
    saveUsageDocument(metadata, callback) {
        const document = {
            conversationID: metadata.conversationID,
            startTimeStamp: metadata.startTimestamp,
            endTimeStamp: metadata.endTimestamp,
            botID: this.botID,
            abandon: metadata.abandon || false
        };
        // let verify = new validate(SchemaDefinition.COLL_USER);
        // let check = verify.check(document);
        // if (check._error) {
        //     return callback(check);
        // } else {
        this.database
            .docCreate(this.databaseName, constutil.collection['Usage'], document)
            .catch((err) => {
            callback(err);
        });
        // }
    }
    /**
     * Saves data related to a particular conversation
     * @param {Object} metadata Json object containing conversation related data
     * @param {string} metadata.userID
     * @param {string} metadata.conversationID
     * @param {string} metadata.channel
     * @param {Number} [metadata.timestamp]
     * @param {JSON} [metadata.customData]
     * @param {function(err)} callback executes after completion, contains error as the parameter to callback
     */
    saveConversationDocument(metadata, callback) {
        this.queryConversation(metadata.conversationID)
            .then((res) => {
            if (res.length > 0) {
                callback();
            }
            else {
                const document = {
                    conversationID: metadata.conversationID,
                    userID: metadata.userID,
                    botID: this.botID,
                    botName: this.botName,
                    channel: metadata.channel,
                    timeStamp: metadata.timestamp || new Date().valueOf()
                };
                if (metadata.customData) {
                    document.customData = metadata.customData;
                }
                // const verify = new validate(SchemaDefinition.COLL_USER);
                // let check = verify.check(document);
                // if (check._error) {
                //     return callback(check);
                // } else {
                this.database
                    .docCreate(this.databaseName, constutil.collection['ConversationDetails'], document)
                    .catch((err) => {
                    callback(err);
                });
                // }
            }
        })
            .catch((err) => callback(err));
    }
    /**
     * Function to update feedback of a message
     * @param {String} id ID of the message returned after calling saveMessageDocument
     * @param {String} feedback POSITIVE OR NEGATIVE
     * @param {function(err)} callback executes after completion, contains error as the parameter to callback
     */
    updateFeedback(id, feedback, callback) {
        const query = "SELECT * FROM c WHERE c.id='" + id + "'";
        this.database
            .queryCollection(this.databaseName, constutil.collection.Message, query)
            .then((result) => {
            if (result.length == 1) {
                const document = result[0];
                document.feedback = feedback;
                this.database
                    .updateDocument(this.databaseName, constutil.collection.Message, document)
                    .catch((err) => callback(err));
            }
            else {
                callback('No Message Found with id=' + id);
            }
        })
            .catch((err) => callback(err));
    }
}
exports.default = ChatLogger;
//# sourceMappingURL=chatlogger.js.map