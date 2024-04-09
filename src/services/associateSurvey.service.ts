import { HRDB_TABLES } from '../configs/dbConfig';
import { AssociateSurveyResponsesColumnsType, AssociateSurveyUserDetailsColumnsType } from '../models/associateSurvey.model';
import {
	getTediousAdapter,
	TediousDatabaseAdapter,
	TediousQuery,
} from '../utilities/TediousDatabaseAdapter';

import * as _ from 'lodash';

const tediousAdapter: TediousDatabaseAdapter = getTediousAdapter();

export const getSurveyList = async function (): Promise<any> {
	const query = new TediousQuery(
		`SELECT DISTINCT surveyId from ${HRDB_TABLES.ASSOCIATE_SURVEY_QUESTIONS};`,
	);
	const result = await tediousAdapter.runSelectQuery(query);
	return result;
};

export const getSurveyById = async function (surveyId: string) {
	const queryUrl = `SELECT surveyId, questionId, question, buttons, questionOrder, createdAt, updatedAt
        FROM ${HRDB_TABLES.ASSOCIATE_SURVEY_QUESTIONS} WHERE surveyId=@SURVEYID;`;
	const queryValues = {
		SURVEYID: { value: surveyId, type: AssociateSurveyResponsesColumnsType.surveyId },
	};

	const tediousQuery = new TediousQuery(queryUrl, queryValues);
	const result = await tediousAdapter.runSelectQuery(tediousQuery);
	return result;
};

export const getUserSurveyResponses = async function (gtsId: string, surveyId: string) {
	const queryUrl = `SELECT surveyId, questionId, USER_GTSID, response, createdAt
        FROM ${HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES
		} WHERE surveyId=@SURVEYID AND USER_GTSID=$@GTSID;`;
	const queryValues = {
		SURVEYID: { value: surveyId, type: AssociateSurveyResponsesColumnsType.surveyId },
		GTSID: { value: gtsId, type: AssociateSurveyResponsesColumnsType.USER_GTSID },
	};

	const tediousQuery = new TediousQuery(queryUrl, queryValues);
	const result = await tediousAdapter.runSelectQuery(tediousQuery);
	return result;
};

export const recordAllUserSurveyResopnses = async function (
	gtsId: string,
	surveyId: string,
	results: {
		questionId: string;
		response: string;
	}[],
	v4Id: string,
) {
	if (!results || !results.length) {
		throw 'invalid result set';
	}
	const queryUrl = `INSERT INTO ${HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES}
	    (surveyId, questionId, USER_GTSID, response)
	    VALUES(@SURVEYID, @QUESTIONID, @GTSID, @RESPONSE);`;
	const queryValues = {
		SURVEYID: { value: surveyId, type: AssociateSurveyResponsesColumnsType.surveyId },
		QUESTIONID: { value: '', type: AssociateSurveyResponsesColumnsType.questionId },
		GTSID: { value: gtsId, type: AssociateSurveyResponsesColumnsType.USER_GTSID },
		RESPONSE: { value: '', type: AssociateSurveyResponsesColumnsType.response },
	};

	const transaction = tediousAdapter.newTransaction();
	for (const res of results) {
		const qv = _.cloneDeep(queryValues);
		qv.QUESTIONID.value = res.questionId;
		qv.RESPONSE.value = res.response;
		const tediousQuery = new TediousQuery(queryUrl, qv);
		transaction.pushQuery(tediousQuery);
	}

	await transaction.execute();

	updateUserSurveyResponseLeadersInfo(gtsId, surveyId, v4Id);

	return true;
};

export const recordUserSurveyResopnse = async function (
	v4Id: string,
	surveyId: string,
	result: {
		questionId: string;
		response: string;
	},
	gtsId: string,
) {
	if (!result) {
		throw 'invalid result set';
	}
	const queryUrl = `INSERT INTO ${HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES}
	    (surveyId, questionId, USER_GTSID, response)
	    VALUES(@SURVEYID, @QUESTIONID, @GTSID, @RESPONSE);`;
	const queryValues = {
		SURVEYID: { value: surveyId, type: AssociateSurveyResponsesColumnsType.surveyId },
		QUESTIONID: { value: '', type: AssociateSurveyResponsesColumnsType.questionId },
		GTSID: { value: v4Id, type: AssociateSurveyResponsesColumnsType.USER_GTSID },
		RESPONSE: { value: '', type: AssociateSurveyResponsesColumnsType.response },
	};

	const transaction = tediousAdapter.newTransaction();
	const qv = _.cloneDeep(queryValues);
	qv.QUESTIONID.value = result.questionId;
	qv.RESPONSE.value = result.response;
	const tediousQuery = new TediousQuery(queryUrl, qv);
	transaction.pushQuery(tediousQuery);
	await transaction.execute();

	updateUserSurveyResponseLeadersInfo(gtsId, surveyId, v4Id);

	return true;
};



export const recordAssociateSurveyUserDetails = async function (
	gtsId: string,
	emailId: string,
	surveyId: string,
) {
	if (!emailId) {
		throw 'emailId not present';
	}
	const queryUrl = `INSERT INTO ${HRDB_TABLES.ASSOCIATE_SURVEY_USER_DETAILS}
	    (surveyId, USER_GTSID, emailId)
	    VALUES(@SURVEYID,@GTSID, @EMAILID);`;
	const queryValues = {
		SURVEYID: { value: surveyId, type: AssociateSurveyUserDetailsColumnsType.surveyId },
		GTSID: { value: gtsId, type: AssociateSurveyUserDetailsColumnsType.USER_GTSID },
		EMAILID: { value: emailId, type: AssociateSurveyUserDetailsColumnsType.emailId },
	};

	const transaction = tediousAdapter.newTransaction();
	const tediousQuery = new TediousQuery(queryUrl, queryValues);
	transaction.pushQuery(tediousQuery);

	await transaction.execute();

	return true;
};

export const getUserDetailsFromSurveyUserDetailsDB = async function (gtsId: string, surveyId: string) {
	const queryUrl = `SELECT SURVEYID, USER_GTSID, EMAILID
		FROM ${HRDB_TABLES.ASSOCIATE_SURVEY_USER_DETAILS} WHERE USER_GTSID=@GTSID AND SURVEYID=@SURVEYID;`;
	const queryValues = {
		GTSID: { value: gtsId, type: AssociateSurveyUserDetailsColumnsType.USER_GTSID },
		SURVEYID: { value: surveyId, type: AssociateSurveyUserDetailsColumnsType.surveyId },
	};
	const tediousQuery = new TediousQuery(queryUrl, queryValues);
	const result = await tediousAdapter.runSelectQuery(tediousQuery);
	return (
		result &&
		(result as [
			{
				SURVEYID: string;
				GTSID: string;
				EMAILID: string;
			},
		])[0]
	);
};

const updateUserSurveyResponseLeadersInfo = async function (gtsId: string, surveyId: string, v4Id: string) {
	const hiererchy = await getUserManagerhierarchy(gtsId);
	const userDetails = await getUserDetailsFromAssociateDB(gtsId);
	const queryUrl = `UPDATE ${HRDB_TABLES.ASSOCIATE_SURVEY_RESPONSES} SET
	    MANAGER_GTSID=@MANAGER_GTSID, DIRECTOR_GTSID=@DIRECTOR_GTSID, PILLARLEAD_GTSID=@PILLARLEAD_GTSID, BOWLEADER_GTSID=@BOWLEADER_GTSID,
	    MANAGER_NAME=@MANAGER_NAME, DIRECTOR_NAME=@DIRECTOR_NAME, PILLARLEAD_NAME=@PILLARLEAD_NAME, BOWLEADER_NAME=@BOWLEADER_NAME,
		TEAM=@TEAM, IN_LEVEL=@IN_LEVEL
	    WHERE surveyId=@SURVEYID AND USER_GTSID=@GTSID;`;
	const queryValues = {
		SURVEYID: { value: surveyId, type: AssociateSurveyResponsesColumnsType.surveyId },
		GTSID: { value: v4Id, type: AssociateSurveyResponsesColumnsType.USER_GTSID },
		MANAGER_GTSID: {
			value: hiererchy[0].MANAGER_ID,
			type: AssociateSurveyResponsesColumnsType.MANAGER_GTSID,
		},
		DIRECTOR_GTSID: {
			value: hiererchy[1].MANAGER_ID,
			type: AssociateSurveyResponsesColumnsType.DIRECTOR_GTSID,
		},
		PILLARLEAD_GTSID: {
			value: hiererchy[2].MANAGER_ID,
			type: AssociateSurveyResponsesColumnsType.PILLARLEAD_GTSID,
		},
		BOWLEADER_GTSID: {
			value: hiererchy[3].MANAGER_ID,
			type: AssociateSurveyResponsesColumnsType.BOWLEADER_GTSID,
		},
		MANAGER_NAME: {
			value: hiererchy[0].MANAGER_NAME,
			type: AssociateSurveyResponsesColumnsType.MANAGER_NAME,
		},
		DIRECTOR_NAME: {
			value: hiererchy[1].MANAGER_NAME,
			type: AssociateSurveyResponsesColumnsType.DIRECTOR_NAME,
		},
		PILLARLEAD_NAME: {
			value: hiererchy[2].MANAGER_NAME,
			type: AssociateSurveyResponsesColumnsType.PILLARLEAD_NAME,
		},
		BOWLEADER_NAME: {
			value: hiererchy[3].MANAGER_NAME,
			type: AssociateSurveyResponsesColumnsType.BOWLEADER_NAME,
		},
		TEAM: {
			value: userDetails.TEAM,
			type: AssociateSurveyResponsesColumnsType.TEAM,
		},
		IN_LEVEL: {
			value: userDetails.IN_LEVEL,
			type: AssociateSurveyResponsesColumnsType.IN_LEVEL,
		},
	};

	const tediousQuery = new TediousQuery(queryUrl, queryValues);

	const transaction = tediousAdapter.newTransaction();
	transaction.pushQuery(tediousQuery);

	const result = await transaction.execute();
	return result;
};

export const getUserManagerhierarchy = async function (gtsId: string, level: number = 4) {
	let i = 0,
		idtoGet = gtsId;
	const hiererchy: any[] = [];
	while (i < level) {
		try {
			const mgr = await getUserManager(idtoGet);
			if (!mgr || !mgr.MANAGER_ID) {
				break;
			}
			hiererchy.push(mgr);
			idtoGet = (mgr as any)['MANAGER_ID'];
		} catch (e) {
			console.error(e);
			break;
		}
		++i;
	}

	const H = _.slice(_.concat(hiererchy, _.fill(Array(level), {})), 0, level);
	return H;
};

export const getUserManager = async function (gtsId: string) {
	const queryUrl = `SELECT MANAGER_ID, MANAGER_NAME
		FROM ${HRDB_TABLES.ASSOCIATE_DATA_V2} WHERE EMP_ID=@GTSID AND IS_ACTIVE=1;`;
	const queryValues = {
		GTSID: { value: gtsId, type: AssociateSurveyResponsesColumnsType.USER_GTSID },
	};
	const tediousQuery = new TediousQuery(queryUrl, queryValues);
	const result = await tediousAdapter.runSelectQuery(tediousQuery);
	return (
		result &&
		(result as [
			{
				MANAGER_ID: string;
				MANAGER_NAME: string;
			},
		])[0]
	);
};

export const getUserDetailsFromAssociateDB = async function (gtsId: string) {
	const queryUrl = `SELECT TEAM, LEVEL as IN_LEVEL
		FROM ${HRDB_TABLES.ASSOCIATE_DATA_V2} WHERE EMP_ID=@GTSID AND IS_ACTIVE=1;`;
	const queryValues = {
		GTSID: { value: gtsId, type: AssociateSurveyResponsesColumnsType.USER_GTSID },
	};
	const tediousQuery = new TediousQuery(queryUrl, queryValues);
	const result = await tediousAdapter.runSelectQuery(tediousQuery);
	return (
		result &&
		(result as [
			{
				TEAM: string;
				IN_LEVEL: string;
			},
		])[0]
	);
};

function hash(val: string) {
	return `CONVERT(varchar, HASHBYTES('md5', ${val}), 2)`;
}
