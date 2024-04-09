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
const config_1 = __importDefault(require("../configs/config"));
const logger_1 = __importDefault(require("../models/logger"));
const associate_model_1 = require("../models/associate.model");
const node_fetch_1 = __importDefault(require("node-fetch"));
const db = config_1.default.associateTableName;
const hrmart = config_1.default.hrmart;
const xhr_adapter_1 = require("../utilities/xhr.adapter");
const documentClient = require('documentdb').DocumentClient;
class HealthCheck {
}
HealthCheck.getHealth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let isCosmosDatabaseUp = false;
    let isLuisServiceUp = true;
    let serverStatus = false;
    let isAssociateDatabaseUp = true;
    let isHrMartServiceUp = true;
    // Check for cosmos DB:-
    try {
        const CosmosDbClient = new documentClient(config_1.default.database.endpoint, {
            masterKey: process.env.COSMOS_DATABASE_MASTERKEY
        });
        isCosmosDatabaseUp = (CosmosDbClient.requestAgent.options.keepAlive === true);
    }
    catch (_a) {
        logger_1.default.error('error getting cosmos database health');
    }
    // Check for Luis service:-
    try {
        const res = yield node_fetch_1.default(config_1.default.luis + 'q=' + encodeURIComponent('Hi'), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        isLuisServiceUp = false;
        logger_1.default.error('error getting luis health');
    }
    // Check for Associate DB :-
    try {
        const email = config_1.default.healthCheck.email;
        const query = 'select EMP_ID from ' + db + " WHERE '" +
            email.toLowerCase().trim() +
            "' IN (SELECT value FROM STRING_SPLIT(PROXY_ADDRESSES, ','));";
        const rows = yield associate_model_1.queryAssociateDB(query);
        isAssociateDatabaseUp = true;
    }
    catch (error) {
        isAssociateDatabaseUp = false;
        logger_1.default.error('error checking associate database health', error);
    }
    // check for HR MART:-
    try {
        const Empid = config_1.default.healthCheck.gtsId;
        const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetIndividiualEmployeesInfo';
        const options = {
            AppID: config_1.default.hrmartAppID,
            Username: config_1.default.hrmartUserName,
            Password: hrmart.INDIVIDUALEMPLOYEESINFO,
            Empid: Empid,
        };
        const res = yield xhr_adapter_1.xhrRequest(url, options);
        isHrMartServiceUp = true;
    }
    catch (error) {
        isHrMartServiceUp = false;
        logger_1.default.error('error getting hr mart health', error);
    }
    serverStatus = [
        isCosmosDatabaseUp,
        isLuisServiceUp,
        isAssociateDatabaseUp,
        isHrMartServiceUp
    ].reduce((v, a) => a && v);
    res.json({
        status: serverStatus,
        'serverStartTime': new Date(new Date().getTime() - process.uptime() * 1000),
        'dependencies': {
            'chatlogs-database': isCosmosDatabaseUp,
            'microsoftLuisService': isLuisServiceUp,
            'idc-associate-database': isAssociateDatabaseUp,
            'HR-Mart Service': isHrMartServiceUp
        },
        'azureDevops-debug-counter': 1,
    });
});
exports.default = HealthCheck;
//# sourceMappingURL=healthCheck.controller.js.map