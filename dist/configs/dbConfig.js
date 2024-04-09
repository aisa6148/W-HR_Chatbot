"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRDB_TABLES = exports.HRDB_CONNECTION_CONF = exports.HRDB_POOL_CONF = void 0;
exports.HRDB_POOL_CONF = {
    min: 2,
    max: 4,
    log: false,
};
exports.HRDB_CONNECTION_CONF = {
    userName: process.env.HRDB_USERNAME,
    password: process.env.HRDB_PASSWORD,
    server: process.env.HRDB_SERVER,
    options: {
        database: process.env.HRDB_OPTIONS_DATABASE,
        encrypt: true,
        requestTimeout: 0,
        rowCollectionOnRequestCompletion: true,
    },
};
exports.HRDB_TABLES = {
    ASSOCIATE_DATA: 'ASSOCIATEDATA',
    ASSOCIATE_DATA_V2: 'ASSOCIATEDATA_V2',
    ASSOCIATE_SURVEY_QUESTIONS: '[askme-associate-survey-questions]',
    ASSOCIATE_SURVEY_RESPONSES: '[askme-associate-survey-responses]',
    ASSOCIATE_SURVEY_USER_DETAILS: '[askme-associate-survey-user-details]'
};
//# sourceMappingURL=dbConfig.js.map