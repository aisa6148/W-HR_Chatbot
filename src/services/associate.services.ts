import {
  IBirthdayAssociate,
  IBirthdayNeighbors,
  IWorkAnniversaryNotification,
  IBirthdayNotification
} from '../types/Notification';
import { queryAssociateDB } from '../models/associate.model';
import logger from '../models/logger';
import config from '../configs/config';
const moment = require('moment');
const db = config.associateTableName;
import { Request, Response, NextFunction } from 'express';
const database = require('../utilities/database');
/**
 * Method to collect associate information where birth_date == today
 */
export const birthdayNotificationBody = async function () {
  const queryParams: IBirthdayNotification[] = [];
  const birthdayAssociates: any = await getAssociatesWithBirthDate(Date.now());
  for (const { email, name, managerId, empId } of birthdayAssociates) {
    const neighbors = await getAssociatesNeighbors(empId, managerId);
    queryParams.push({
      emails: [email],
      name,
      team: neighbors,
      channel: 'slack'
    });
  }
  return queryParams;
};

export const getUserDetails = async function (email: string) {
  try {
    const query =
      'select EMP_ID,TEAM,HRBP from ' + db + " WHERE PROXY_ADDRESSES LIKE '%" +
      email.toLowerCase().trim() +
      "%';";
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      const data = {
        gts: rows[0][0].value,
        team: rows[0][1].value,
        hrbp: rows[0][2].value
      };
      logger.debug({ location: 'getuserdetails', email: email, data: data });
      return data;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'getUserDetails error', e, email });
  }
};

export const getGTSID = async function (email: string): Promise<{ gts: string }> {
  try {
    const query =
      'select EMP_ID from ' + db + " WHERE '" +
      email.toLowerCase().trim() +
      "' IN (SELECT value FROM STRING_SPLIT(PROXY_ADDRESSES, ','));";
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      const data = {
        gts: rows[0][0].value
      };
      logger.debug({ location: 'getGTSID', email: email, data: data });
      return data;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'getGTSID error', e, email });
  }
};

export const identifyUser = async function (
  email: string
): Promise<{
  userID: string;
  userName: string;
  email: string;
}> {
  try {
    const query =
      'select USER_ID,FULL_NAME,EMAIL from ' + db + " WHERE '" +
      email.toLowerCase().trim() +
      "' IN (SELECT value FROM STRING_SPLIT(PROXY_ADDRESSES, ','));";
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      const data = {
        userID: rows[0][0].value,
        userName: rows[0][1].value,
        email: rows[0][2].value
      };
      logger.debug({ location: 'identifyuser', email: email, data: data });
      return data;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'identifyuser error', error: e, email: email });
  }
};

export const isManager = async function (gtsid: string): Promise<number> {
  try {
    const query = 'SELECT COUNT (*) FROM ' + db + " WHERE MANAGER_ID = '" + gtsid + "';";
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      const count = rows[0][0].value;
      logger.debug({ location: 'isManager', gtsid: gtsid, count: count });
      return count;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'isManager error', error: e, gtsid: gtsid });
  }
};

// validate short-id
export const getShortId = async function (sid: string): Promise<{ gts: string }> {
  try {
    const query = 'select EMP_ID from ' + db + ' WHERE USER_ID =' + sid.toLowerCase().trim();
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      const data = {
        gts: rows[0][0].value
      };
      logger.debug({ location: 'getShortId', email: sid, data: data });
      return data;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'getShortId error', e, sid });
  }
};

// get birthday associates
export const getAssociatesWithBirthDate = async function (date: number) {
  try {
    const today = moment(date).format('DD-MMM');
    const query =
      'SELECT EMAIL, FULL_NAME, TEAM, MANAGER_ID, EMP_ID FROM ' +
      db +
      " WHERE BIRTH_DATE='" +
      today +
      "';";
    const birthdayAssociates: IBirthdayAssociate[] = [];
    const rows: any = await queryAssociateDB(query);
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
      logger.debug({ location: 'getAssociatesWithBirthDate', birthdayAssociates });
      return birthdayAssociates;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'getAssociatesWithBirthDate return from request', e });
  }
};

// get birthday associate's team
export const getAssociatesNeighbors = async function (empId: string, managerId: string) {
  try {
    const query =
      'SELECT EMAIL, FULL_NAME, EMP_ID FROM ' +
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
    const associatesNeighbors: IBirthdayNeighbors[] = [];
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      for (const row of rows) {
        if (row[2].value !== empId) {
          associatesNeighbors.push({
            email: row[0].value,
            name: row[1].value
          });
        }
      }
      logger.debug({ location: 'getAssociatesWithBirthDate', associatesNeighbors });
      return associatesNeighbors;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({ location: 'getAssociatesNeighbors return from request', e });
  }
};

// get work anniversary associates
export const getAssociatesWithWorkAnniversaryDate = async function (date: number) {
  try {
    const today = moment(date).format('DD-MMM');
    const query =
      'SELECT EMAIL, FULL_NAME, HIRE_DATE FROM ' + db + " WHERE JOIN_DATE LIKE '" + today + "-%';";
    const workAnniversaryAssociates: IWorkAnniversaryNotification[] = [];
    const rows: any = await queryAssociateDB(query);
    if (rows) {
      for (const row of rows) {
        workAnniversaryAssociates.push({
          email: row[0].value,
          name: row[1].value,
          hireDate: row[2].value
        });
      }
      logger.debug({ location: 'getAssociatesWithBirthDate', workAnniversaryAssociates });
      return workAnniversaryAssociates;
    } else {
      return undefined;
    }
  } catch (e) {
    logger.error({
      location: 'getAssociatesWithWorkAnniversaryDate return from request',
      e
    });
  }
};




export const notificationStatus = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const id: string = req.body.id;
    const query = "SELECT * FROM c where c.notifyId='" + id + "'";
    const result = await database.queryCollection({ id: process.env.DATABASE_NAME }, { id: 'NotificationLogs' }, query);
    const failedMails: any[] = [];
    result.map((element: any) => {
      if (element.isSuccessful === false) {
        failedMails.push(element);
      }
    });
    res.send({ 'length': result.length, 'failedMails': failedMails });
  }
  catch (e) {
    logger.error(e);
    res.end();
  }
};