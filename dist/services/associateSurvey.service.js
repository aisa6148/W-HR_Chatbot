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
exports.getUserDetailsFromAssociateDB = exports.getUserManager = exports.getUserManagerhierarchy = exports.getUserDetailsFromSurveyUserDetailsDB = exports.recordAssociateSurveyUserDetails = exports.recordUserSurveyResopnse = exports.recordAllUserSurveyResopnses = exports.getUserSurveyResponses = exports.getSurveyById = exports.getSurveyList = void 0;
const dbConfig_1 = require("../configs/dbConfig");
const associateSurvey_model_1 = require("../models/associateSurvey.model");
const TediousDatabaseAdapter_1 = require("../utilities/TediousDatabaseAdapter");
const _ = __importStar(require("lodash"));
const tediousAdapter = TediousDatabaseAdapter_1.getTediousAdapter();
exports.getSurveyList = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const query = new TediousDatabaseAdapter_1.TediousQuery(`SELECT DISTINCT surveyId from ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_QUESTIONS};`);
        const result = yield tediousAdapter.runSelectQuery(query);
        return result;
    });
};
exports.getSurveyById = function (surveyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryUrl = `SELECT surveyId, questionId, question, buttons, questionOrder, createdAt, updatedAt
        FROM ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_QUESTIONS} WHERE surveyId=@SURVEYID;`;
        const queryValues = {
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.surveyId },
        };
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        const result = yield tediousAdapter.runSelectQuery(tediousQuery);
        return result;
    });
};
exports.getUserSurveyResponses = function (gtsId, surveyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryUrl = `SELECT surveyId, questionId, USER_GTSID, response, createdAt
        FROM ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES} WHERE surveyId=@SURVEYID AND USER_GTSID=$@GTSID;`;
        const queryValues = {
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.surveyId },
            GTSID: { value: gtsId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.USER_GTSID },
        };
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        const result = yield tediousAdapter.runSelectQuery(tediousQuery);
        return result;
    });
};
exports.recordAllUserSurveyResopnses = function (gtsId, surveyId, results, v4Id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!results || !results.length) {
            throw 'invalid result set';
        }
        const queryUrl = `INSERT INTO ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES}
	    (surveyId, questionId, USER_GTSID, response)
	    VALUES(@SURVEYID, @QUESTIONID, @GTSID, @RESPONSE);`;
        const queryValues = {
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.surveyId },
            QUESTIONID: { value: '', type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.questionId },
            GTSID: { value: gtsId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.USER_GTSID },
            RESPONSE: { value: '', type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.response },
        };
        const transaction = tediousAdapter.newTransaction();
        for (const res of results) {
            const qv = _.cloneDeep(queryValues);
            qv.QUESTIONID.value = res.questionId;
            qv.RESPONSE.value = res.response;
            const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, qv);
            transaction.pushQuery(tediousQuery);
        }
        yield transaction.execute();
        updateUserSurveyResponseLeadersInfo(gtsId, surveyId, v4Id);
        return true;
    });
};
exports.recordUserSurveyResopnse = function (v4Id, surveyId, result, gtsId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!result) {
            throw 'invalid result set';
        }
        const queryUrl = `INSERT INTO ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES}
	    (surveyId, questionId, USER_GTSID, response)
	    VALUES(@SURVEYID, @QUESTIONID, @GTSID, @RESPONSE);`;
        const queryValues = {
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.surveyId },
            QUESTIONID: { value: '', type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.questionId },
            GTSID: { value: v4Id, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.USER_GTSID },
            RESPONSE: { value: '', type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.response },
        };
        const transaction = tediousAdapter.newTransaction();
        const qv = _.cloneDeep(queryValues);
        qv.QUESTIONID.value = result.questionId;
        qv.RESPONSE.value = result.response;
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, qv);
        transaction.pushQuery(tediousQuery);
        yield transaction.execute();
        updateUserSurveyResponseLeadersInfo(gtsId, surveyId, v4Id);
        return true;
    });
};
exports.recordAssociateSurveyUserDetails = function (gtsId, emailId, surveyId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!emailId) {
            throw 'emailId not present';
        }
        const queryUrl = `INSERT INTO ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_USER_DETAILS}
	    (surveyId, USER_GTSID, emailId)
	    VALUES(@SURVEYID,@GTSID, @EMAILID);`;
        const queryValues = {
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyUserDetailsColumnsType.surveyId },
            GTSID: { value: gtsId, type: associateSurvey_model_1.AssociateSurveyUserDetailsColumnsType.USER_GTSID },
            EMAILID: { value: emailId, type: associateSurvey_model_1.AssociateSurveyUserDetailsColumnsType.emailId },
        };
        const transaction = tediousAdapter.newTransaction();
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        transaction.pushQuery(tediousQuery);
        yield transaction.execute();
        return true;
    });
};
exports.getUserDetailsFromSurveyUserDetailsDB = function (gtsId, surveyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryUrl = `SELECT SURVEYID, USER_GTSID, EMAILID
		FROM ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_USER_DETAILS} WHERE USER_GTSID=@GTSID AND SURVEYID=@SURVEYID;`;
        const queryValues = {
            GTSID: { value: gtsId, type: associateSurvey_model_1.AssociateSurveyUserDetailsColumnsType.USER_GTSID },
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyUserDetailsColumnsType.surveyId },
        };
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        const result = yield tediousAdapter.runSelectQuery(tediousQuery);
        return (result &&
            result[0]);
    });
};
const updateUserSurveyResponseLeadersInfo = function (gtsId, surveyId, v4Id) {
    return __awaiter(this, void 0, void 0, function* () {
        const hiererchy = yield exports.getUserManagerhierarchy(gtsId);
        const userDetails = yield exports.getUserDetailsFromAssociateDB(gtsId);
        const queryUrl = `UPDATE ${dbConfig_1.HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES} SET
	    MANAGER_GTSID=@MANAGER_GTSID, DIRECTOR_GTSID=@DIRECTOR_GTSID, PILLARLEAD_GTSID=@PILLARLEAD_GTSID, BOWLEADER_GTSID=@BOWLEADER_GTSID,
	    MANAGER_NAME=@MANAGER_NAME, DIRECTOR_NAME=@DIRECTOR_NAME, PILLARLEAD_NAME=@PILLARLEAD_NAME, BOWLEADER_NAME=@BOWLEADER_NAME,
		TEAM=@TEAM, IN_LEVEL=@IN_LEVEL
	    WHERE surveyId=@SURVEYID AND USER_GTSID=@GTSID;`;
        const queryValues = {
            SURVEYID: { value: surveyId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.surveyId },
            GTSID: { value: v4Id, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.USER_GTSID },
            MANAGER_GTSID: {
                value: hiererchy[0].MANAGER_ID,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.MANAGER_GTSID,
            },
            DIRECTOR_GTSID: {
                value: hiererchy[1].MANAGER_ID,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.DIRECTOR_GTSID,
            },
            PILLARLEAD_GTSID: {
                value: hiererchy[2].MANAGER_ID,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.PILLARLEAD_GTSID,
            },
            BOWLEADER_GTSID: {
                value: hiererchy[3].MANAGER_ID,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.BOWLEADER_GTSID,
            },
            MANAGER_NAME: {
                value: hiererchy[0].MANAGER_NAME,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.MANAGER_NAME,
            },
            DIRECTOR_NAME: {
                value: hiererchy[1].MANAGER_NAME,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.DIRECTOR_NAME,
            },
            PILLARLEAD_NAME: {
                value: hiererchy[2].MANAGER_NAME,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.PILLARLEAD_NAME,
            },
            BOWLEADER_NAME: {
                value: hiererchy[3].MANAGER_NAME,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.BOWLEADER_NAME,
            },
            TEAM: {
                value: userDetails.TEAM,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.TEAM,
            },
            IN_LEVEL: {
                value: userDetails.IN_LEVEL,
                type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.IN_LEVEL,
            },
        };
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        const transaction = tediousAdapter.newTransaction();
        transaction.pushQuery(tediousQuery);
        const result = yield transaction.execute();
        return result;
    });
};
exports.getUserManagerhierarchy = function (gtsId, level = 4) {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 0, idtoGet = gtsId;
        const hiererchy = [];
        while (i < level) {
            try {
                const mgr = yield exports.getUserManager(idtoGet);
                if (!mgr || !mgr.MANAGER_ID) {
                    break;
                }
                hiererchy.push(mgr);
                idtoGet = mgr['MANAGER_ID'];
            }
            catch (e) {
                console.error(e);
                break;
            }
            ++i;
        }
        const H = _.slice(_.concat(hiererchy, _.fill(Array(level), {})), 0, level);
        return H;
    });
};
exports.getUserManager = function (gtsId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryUrl = `SELECT MANAGER_ID, MANAGER_NAME
		FROM ${dbConfig_1.HRDB_TABLES.ASSOCIATE_DATA_V2} WHERE EMP_ID=@GTSID AND IS_ACTIVE=1;`;
        const queryValues = {
            GTSID: { value: gtsId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.USER_GTSID },
        };
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        const result = yield tediousAdapter.runSelectQuery(tediousQuery);
        return (result &&
            result[0]);
    });
};
exports.getUserDetailsFromAssociateDB = function (gtsId) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryUrl = `SELECT TEAM, LEVEL as IN_LEVEL
		FROM ${dbConfig_1.HRDB_TABLES.ASSOCIATE_DATA_V2} WHERE EMP_ID=@GTSID AND IS_ACTIVE=1;`;
        const queryValues = {
            GTSID: { value: gtsId, type: associateSurvey_model_1.AssociateSurveyResponsesColumnsType.USER_GTSID },
        };
        const tediousQuery = new TediousDatabaseAdapter_1.TediousQuery(queryUrl, queryValues);
        const result = yield tediousAdapter.runSelectQuery(tediousQuery);
        return (result &&
            result[0]);
    });
};
function hash(val) {
    return `CONVERT(varchar, HASHBYTES('md5', ${val}), 2)`;
}
//# sourceMappingURL=associateSurvey.service.js.map