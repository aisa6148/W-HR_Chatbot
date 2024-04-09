import { Request } from 'tedious';

import logger from './logger';
import { getTediousAdapter, TediousDatabaseAdapter } from '../utilities/TediousDatabaseAdapter';

const tediousAdapter: TediousDatabaseAdapter = getTediousAdapter();

export const queryAssociateDB = async function (query: string) {
	try {
		const connection = await tediousAdapter._getConnection();

		return new Promise((resolve, reject) => {
			const dbRequest = new Request(query, async function (error, rowCount, rows) {
				if (error) {
					logger.error({
						location: 'queryAssociateDB return from request',
						error,
					});
					reject(error);
				} else if (rows) {
					connection.release();
					resolve(rows);
				}
			});
			connection.execSql(dbRequest);
		});
	} catch (e) {
		logger.error({ location: 'queryAssociateDB error', e });
		return [];
	}
};
