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
exports.notificationStatus = exports.getAssociatesWithWorkAnniversaryDate = exports.getAssociatesNeighbors = exports.getAssociatesWithBirthDate = exports.getShortId = exports.isManager = exports.identifyUser = exports.getGTSID = exports.getUserDetails = exports.birthdayNotificationBody = void 0;
const associate_model_1 = require("../models/associate.model");
const logger_1 = __importDefault(require("../models/logger"));
const config_1 = __importDefault(require("../configs/config"));
const moment = require('moment');
const db = config_1.default.associateTableName;
const database = require('../utilities/database');
/**
 * Method to collect associate information where birth_date == today
 */
exports.birthdayNotificationBody = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const queryParams = [];
        const birthdayAssociates = yield exports.getAssociatesWithBirthDate(Date.now());
        for (const { email, name, managerId, empId } of birthdayAssociates) {
            const neighbors = yield exports.getAssociatesNeighbors(empId, managerId);
            queryParams.push({
                emails: [email],
                name,
                team: neighbors,
                channel: 'slack'
            });
        }
        return queryParams;
    });
};
exports.getUserDetails = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = 'select EMP_ID,TEAM,HRBP from ' + db + " WHERE PROXY_ADDRESSES LIKE '%" +
                email.toLowerCase().trim() +
                "%';";
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                const data = {
                    gts: rows[0][0].value,
                    team: rows[0][1].value,
                    hrbp: rows[0][2].value
                };
                logger_1.default.debug({ location: 'getuserdetails', email: email, data: data });
                return data;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'getUserDetails error', e, email });
        }
    });
};
exports.getGTSID = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = 'select EMP_ID from ' + db + " WHERE '" +
                email.toLowerCase().trim() +
                "' IN (SELECT value FROM STRING_SPLIT(PROXY_ADDRESSES, ','));";
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                const data = {
                    gts: rows[0][0].value
                };
                logger_1.default.debug({ location: 'getGTSID', email: email, data: data });
                return data;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'getGTSID error', e, email });
        }
    });
};
exports.identifyUser = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = 'select USER_ID,FULL_NAME,EMAIL from ' + db + " WHERE '" +
                email.toLowerCase().trim() +
                "' IN (SELECT value FROM STRING_SPLIT(PROXY_ADDRESSES, ','));";
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                const data = {
                    userID: rows[0][0].value,
                    userName: rows[0][1].value,
                    email: rows[0][2].value
                };
                logger_1.default.debug({ location: 'identifyuser', email: email, data: data });
                return data;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'identifyuser error', error: e, email: email });
        }
    });
};
exports.isManager = function (gtsid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = 'SELECT COUNT (*) FROM ' + db + " WHERE MANAGER_ID = '" + gtsid + "';";
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                const count = rows[0][0].value;
                logger_1.default.debug({ location: 'isManager', gtsid: gtsid, count: count });
                return count;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'isManager error', error: e, gtsid: gtsid });
        }
    });
};
// validate short-id
exports.getShortId = function (sid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = 'select EMP_ID from ' + db + ' WHERE USER_ID =' + sid.toLowerCase().trim();
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                const data = {
                    gts: rows[0][0].value
                };
                logger_1.default.debug({ location: 'getShortId', email: sid, data: data });
                return data;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'getShortId error', e, sid });
        }
    });
};
// get birthday associates
exports.getAssociatesWithBirthDate = function (date) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const today = moment(date).format('DD-MMM');
            const query = 'SELECT EMAIL, FULL_NAME, TEAM, MANAGER_ID, EMP_ID FROM ' +
                db +
                " WHERE BIRTH_DATE='" +
                today +
                "';";
            const birthdayAssociates = [];
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                for (const row of rows) {
                    birthdayAssociates.push({
                        email: row[0].value,
                        name: row[1].value,
                        team: row[2].value,
                        managerId: row[3].value,
                        empId: row[4].value
                    });
                }
                logger_1.default.debug({ location: 'getAssociatesWithBirthDate', birthdayAssociates });
                return birthdayAssociates;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'getAssociatesWithBirthDate return from request', e });
        }
    });
};
// get birthday associate's team
exports.getAssociatesNeighbors = function (empId, managerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = 'SELECT EMAIL, FULL_NAME, EMP_ID FROM ' +
                db +
                " WHERE \
            EMP_ID = '" +
                managerId +
                "' \
            OR MANAGER_ID = '" +
                managerId +
                "' \
            OR MANAGER_ID = '" +
                empId +
                "';";
            const associatesNeighbors = [];
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                for (const row of rows) {
                    if (row[2].value !== empId) {
                        associatesNeighbors.push({
                            email: row[0].value,
                            name: row[1].value
                        });
                    }
                }
                logger_1.default.debug({ location: 'getAssociatesWithBirthDate', associatesNeighbors });
                return associatesNeighbors;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({ location: 'getAssociatesNeighbors return from request', e });
        }
    });
};
// get work anniversary associates
exports.getAssociatesWithWorkAnniversaryDate = function (date) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const today = moment(date).format('DD-MMM');
            const query = 'SELECT EMAIL, FULL_NAME, HIRE_DATE FROM ' + db + " WHERE JOIN_DATE LIKE '" + today + "-%';";
            const workAnniversaryAssociates = [];
            const rows = yield associate_model_1.queryAssociateDB(query);
            if (rows) {
                for (const row of rows) {
                    workAnniversaryAssociates.push({
                        email: row[0].value,
                        name: row[1].value,
                        hireDate: row[2].value
                    });
                }
                logger_1.default.debug({ location: 'getAssociatesWithBirthDate', workAnniversaryAssociates });
                return workAnniversaryAssociates;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            logger_1.default.error({
                location: 'getAssociatesWithWorkAnniversaryDate return from request',
                e
            });
        }
    });
};
exports.notificationStatus = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.body.id;
            const query = "SELECT * FROM c where c.notifyId='" + id + "'";
            const result = yield database.queryCollection({ id: process.env.DATABASE_NAME }, { id: 'NotificationLogs' }, query);
            const failedMails = [];
            result.map((element) => {
                if (element.isSuccessful === false) {
                    failedMails.push(element);
                }
            });
            res.send({ 'length': result.length, 'failedMails': failedMails });
        }
        catch (e) {
            logger_1.default.error(e);
            res.end();
        }
    });
};
//# sourceMappingURL=associate.services.js.map