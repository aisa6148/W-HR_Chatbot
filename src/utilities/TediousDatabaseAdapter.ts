import ConnectionPool = require('tedious-connection-pool');
import { Request as DBRequest, ConnectionConfig, TediousType } from 'tedious';

import { HRDB_CONNECTION_CONF, HRDB_POOL_CONF } from '../configs/dbConfig';

let tediousAdapters: TediousDatabaseAdapter;

export function getTediousAdapter() {
	if (!tediousAdapters) {
		tediousAdapters = new TediousDatabaseAdapter(HRDB_POOL_CONF, HRDB_CONNECTION_CONF);
	}
	return tediousAdapters;
}

export class TediousDatabaseAdapter {
	connection: ConnectionPool.PooledConnection;
	pool: ConnectionPool;
	constructor(poolConf: ConnectionPool.PoolConfig, dbConf: ConnectionConfig) {
		this.pool = new ConnectionPool(poolConf, dbConf);

		this.pool.on('error', function (error) {
			console.error({ location: 'hrdata sql db connect on error', error });
		});
	}

	async close() {
		if (this.pool) {
			this.pool.drain();
		}
	}

	async runSelectQuery(tediousQuery: TediousQuery) {
		return this._getConnection().then(connection => {
			return new Promise((resolve, reject) => {
				const dbrequest = new DBRequest(
					tediousQuery.getQueryString(),
					function (err, rowCount, rows) {
						try {
							connection.release();
						} catch (e) {}
						if (err) reject(err);
						else if (rowCount > 0) {
							const result: {
								[x: string]: any;
							} = [];
							rows.forEach(row => {
								const val: {
									[x: string]: any;
								} = {};
								row.forEach(function (column: {
									metadata: { colName: string | number };
									value: any;
								}) {
									if (column.metadata)
										val[column.metadata.colName] = column.value;
								});
								result.push(val);
							});
							resolve(result);
						} else resolve([]);
					},
				);
				const qv = tediousQuery.getQueryValues();
				for (const col in qv) {
					if (col && qv[col].type)
						dbrequest.addParameter(col, qv[col].type, qv[col].value);
				}
				connection.execSql(dbrequest);
			});
		});
	}

	newTransaction() {
		const transactionAdapter = new TediousTransactionAdapter(this);
		return transactionAdapter;
	}

	_getConnection(): Promise<ConnectionPool.PooledConnection> {
		return new Promise((resolve, reject) => {
			this.pool.acquire((error, connection) => {
				if (error) reject(error);
				resolve(connection);
			});
		});
	}
}

export class TediousTransactionAdapter {
	queries: TediousQuery[] = [];
	_parentAdapter: TediousDatabaseAdapter;
	_executed: boolean = false;

	constructor(adatper: TediousDatabaseAdapter) {
		this._parentAdapter = adatper;
	}

	pushQuery(tediousQuery: TediousQuery) {
		if (this._executed) {
			throw new Error('Execution Started');
		}
		this.queries.push(tediousQuery);
	}

	isExecuted() {
		return this._executed;
	}

	async beginTransaction(): Promise<ConnectionPool.PooledConnection> {
		const connection = await this._parentAdapter._getConnection();
		return new Promise((resolve, reject) => {
			connection.beginTransaction(error => {
				if (error) reject(error);
				else resolve(connection);
			});
		});
	}
	executeStatement(tediousQuery: TediousQuery, connection: ConnectionPool.PooledConnection) {
		return new Promise<void>((resolve, reject) => {
			const dbrequest = new DBRequest(
				tediousQuery.getQueryString(),
				function (err, rowCount, rows) {
					if (err) reject(err);
					resolve();
				},
			);
			const qv = tediousQuery.getQueryValues();
			for (const col in qv) {
				if (col && qv[col].type) dbrequest.addParameter(col, qv[col].type, qv[col].value);
			}
			connection.execSql(dbrequest);
		});
	}
	completeTransaction(connection: ConnectionPool.PooledConnection) {
		return new Promise((resolve, reject) => {
			connection.commitTransaction(error => {
				if (error) reject(error);
				else resolve(true);
			});
		});
	}
	abortTransaction(connection: ConnectionPool.PooledConnection) {
		return new Promise((resolve, reject) => {
			connection.rollbackTransaction(error => {
				if (error) reject(error);
				else resolve(true);
			});
		});
	}

	async execute() {
		if (this._executed) {
			throw new Error('Already Executed');
		}
		this._executed = true;

		if (!this.queries.length) return;
		const connection = await this.beginTransaction();
		try {
			for (const query of this.queries) {
				await this.executeStatement(query, connection);
			}
			await this.completeTransaction(connection);
		} catch (error) {
			console.log(error);
			await this.abortTransaction(connection);
			throw new Error('Failed transaction');
		} finally {
			try {
				connection.release();
			} catch (e) {}
		}
	}
}

export class TediousQuery {
	private _queryString: string;
	private _queryValues: ITediousQueryValues;

	constructor(
		queryString: string,
		queryValues?: ITediousQueryValues,
		enforceStrictEscape: boolean = true,
	) {
		this._queryString = queryString;
		this._queryValues = queryValues;
	}

	getQueryString(): string {
		return this._queryString;
	}
	getQueryValues(): ITediousQueryValues {
		return this._queryValues;
	}
}

export interface ITediousQueryValues {
	[x: string]: {
		value: string;
		type: TediousType;
	};
}
