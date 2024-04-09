import { TYPES } from 'tedious';

export const AssociateSurveyQuestionsColumns = {
	surveyId: 'surveyId',
	questionId: 'questionId',
	question: 'question',
	buttons: 'buttons',
	questionOrder: 'questionOrder',
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
};

export const AssociateSurveyQuestionsColumnsType = {
	[AssociateSurveyQuestionsColumns.surveyId]: TYPES.VarChar,
	[AssociateSurveyQuestionsColumns.questionId]: TYPES.VarChar,
	[AssociateSurveyQuestionsColumns.question]: TYPES.VarChar,
	[AssociateSurveyQuestionsColumns.buttons]: TYPES.VarChar,
	[AssociateSurveyQuestionsColumns.questionOrder]: TYPES.Int,
	[AssociateSurveyQuestionsColumns.createdAt]: TYPES.VarChar,
	[AssociateSurveyQuestionsColumns.updatedAt]: TYPES.DateTime,
};

export const AssociateSurveyResponsesColumns = {
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


export const AssociateSurveyResponsesColumnsType = {
	surveyId: TYPES.VarChar,
	questionId: TYPES.VarChar,
	USER_GTSID: TYPES.VarChar,
	response: TYPES.VarChar,
	MANAGER_GTSID: TYPES.VarChar,
	DIRECTOR_GTSID: TYPES.VarChar,
	PILLARLEAD_GTSID: TYPES.VarChar,
	BOWLEADER_GTSID: TYPES.VarChar,
	createdAt: TYPES.DateTime,
	MANAGER_NAME: TYPES.VarChar,
	DIRECTOR_NAME: TYPES.VarChar,
	PILLARLEAD_NAME: TYPES.VarChar,
	BOWLEADER_NAME: TYPES.VarChar,
	TEAM: TYPES.VarChar,
	IN_LEVEL: TYPES.VarChar,
};


export const AssociateSurveyUserDetailsColumns = {
	surveyId: 'surveyId',
	USER_GTSID: 'USER_GTSID',
	emailId: 'emailId',
};

export const AssociateSurveyUserDetailsColumnsType = {
	surveyId: TYPES.VarChar,
	USER_GTSID: TYPES.VarChar,
	emailId: TYPES.VarChar,
};