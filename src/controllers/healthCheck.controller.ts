import * as https from 'https';
import { Request, Response, NextFunction } from 'express';
import config from '../configs/config';
import logger from '../models/logger';
import { getShortId } from '../services/associate.services';
import { queryAssociateDB } from '../models/associate.model';
import { parse as urlParse } from 'url';
import fetch, { RequestInit } from 'node-fetch';
import { GetIndividiualEmployeesInfo } from '../services/hrmart.services';
const db = config.associateTableName;
const hrmart = config.hrmart;
import { xhrRequest } from '../utilities/xhr.adapter';
const documentClient = require('documentdb').DocumentClient;
class HealthCheck {
    public static getHealth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        let isCosmosDatabaseUp = false;
        let isLuisServiceUp = true;
        let serverStatus = false;
        let isAssociateDatabaseUp = true;
        let isHrMartServiceUp = true;
        // Check for cosmos DB:-
        try {
            const CosmosDbClient = new documentClient(config.database.endpoint, {
                masterKey: process.env.COSMOS_DATABASE_MASTERKEY
            });
            isCosmosDatabaseUp = (CosmosDbClient.requestAgent.options.keepAlive === true);
        }
        catch {
            logger.error('error getting cosmos database health');
        }
        // Check for Luis service:-
        try {
            const res = await fetch(config.luis + 'q=' + encodeURIComponent('Hi'), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (error) {
            isLuisServiceUp = false;
            logger.error('error getting luis health');
        }

        // Check for Associate DB :-
        try {

            const email = config.healthCheck.email;
            const query =
                'select EMP_ID from ' + db + " WHERE '" +
                email.toLowerCase().trim() +
                "' IN (SELECT value FROM STRING_SPLIT(PROXY_ADDRESSES, ','));";
            const rows: any = await queryAssociateDB(query);
            isAssociateDatabaseUp = true;
        } catch (error) {
            isAssociateDatabaseUp = false;
            logger.error('error checking associate database health', error);

        }

        // check for HR MART:-
        try {
            const Empid = config.healthCheck.gtsId;
            const url = 'https://www.hr-mart.com/services/FHRChatbotservice.asmx/GetIndividiualEmployeesInfo';
            const options = {
                AppID: config.hrmartAppID,
                Username: config.hrmartUserName,
                Password: hrmart.INDIVIDUALEMPLOYEESINFO,
                Empid: Empid,
            };
            const res = await xhrRequest(url, options);
            isHrMartServiceUp = true;

        }
        catch (error) {
            isHrMartServiceUp = false;
            logger.error('error getting hr mart health', error);
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

    }

}

export default HealthCheck;