"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociateSurveyUserDetailsColumnsType = exports.AssociateSurveyUserDetailsColumns = exports.AssociateSurveyResponsesColumnsType = exports.AssociateSurveyResponsesColumns = exports.AssociateSurveyQuestionsColumnsType = exports.AssociateSurveyQuestionsColumns = void 0;
const tedious_1 = require("tedious");
exports.AssociateSurveyQuestionsColumns = {
    surveyId: 'surveyId',
    questionId: 'questionId',
    question: 'question',
    buttons: 'buttons',
    questionOrder: 'questionOrder',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
};
exports.AssociateSurveyQuestionsColumnsType = {
    [exports.AssociateSurveyQuestionsColumns.surveyId]: tedious_1.TYPES.VarChar,
    [exports.AssociateSurveyQuestionsColumns.questionId]: tedious_1.TYPES.VarChar,
    [exports.AssociateSurveyQuestionsColumns.question]: tedious_1.TYPES.VarChar,
    [exports.AssociateSurveyQuestionsColumns.buttons]: tedious_1.TYPES.VarChar,
    [exports.AssociateSurveyQuestionsColumns.questionOrder]: tedious_1.TYPES.Int,
    [exports.AssociateSurveyQuestionsColumns.createdAt]: tedious_1.TYPES.VarChar,
    [exports.AssociateSurveyQuestionsColumns.updatedAt]: tedious_1.TYPES.DateTime,
};
exports.AssociateSurveyResponsesColumns = {
    surveyId: 'surveyId',
    questionId: 'questionId',
    USER_GTSID: 'USER_GTSID',
    response: 'response',
    MANAGER_GTSID: 'MANAGER_GTSID',
    DIRECTOR_GTSID: 'DIRECTOR_GTSID',
    PILLARLEAD_GTSID: 'PILLARLEAD_GTSID',
    BOWLEADER_GTSID: 'BOWLEADER_GTSID',
    createdAt: 'createdAt',
    MANAGER_NAME: 'MANAGER_NAME',
    DIRECTOR_NAME: 'DIRECTOR_NAME',
    PILLARLEAD_NAME: 'PILLARLEAD_NAME',
    BOWLEADER_NAME: 'BOWLEADER_NAME',
    TEAM: 'TEAM',
    IN_LEVEL: 'IN_LEVEL',
};
exports.AssociateSurveyResponsesColumnsType = {
    surveyId: tedious_1.TYPES.VarChar,
    questionId: tedious_1.TYPES.VarChar,
    USER_GTSID: tedious_1.TYPES.VarChar,
    response: tedious_1.TYPES.VarChar,
    MANAGER_GTSID: tedious_1.TYPES.VarChar,
    DIRECTOR_GTSID: tedious_1.TYPES.VarChar,
    PILLARLEAD_GTSID: tedious_1.TYPES.VarChar,
    BOWLEADER_GTSID: tedious_1.TYPES.VarChar,
    createdAt: tedious_1.TYPES.DateTime,
    MANAGER_NAME: tedious_1.TYPES.VarChar,
    DIRECTOR_NAME: tedious_1.TYPES.VarChar,
    PILLARLEAD_NAME: tedious_1.TYPES.VarChar,
    BOWLEADER_NAME: tedious_1.TYPES.VarChar,
    TEAM: tedious_1.TYPES.VarChar,
    IN_LEVEL: tedious_1.TYPES.VarChar,
};
exports.AssociateSurveyUserDetailsColumns = {
    surveyId: 'surveyId',
    USER_GTSID: 'USER_GTSID',
    emailId: 'emailId',
};
exports.AssociateSurveyUserDetailsColumnsType = {
    surveyId: tedious_1.TYPES.VarChar,
    USER_GTSID: tedious_1.TYPES.VarChar,
    emailId: tedious_1.TYPES.VarChar,
};
//# sourceMappingURL=associateSurvey.model.js.map