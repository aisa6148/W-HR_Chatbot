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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TediousQuery = exports.TediousTransactionAdapter = exports.TediousDatabaseAdapter = exports.getTediousAdapter = void 0;
const ConnectionPool = require("tedious-connection-pool");
const tedious_1 = require("tedious");
const dbConfig_1 = require("../configs/dbConfig");
let tediousAdapters;
function getTediousAdapter() {
    if (!tediousAdapters) {
        tediousAdapters = new TediousDatabaseAdapter(dbConfig_1.HRDB_POOL_CONF, dbConfig_1.HRDB_CONNECTION_CONF);
    }
    return tediousAdapters;
}
exports.getTediousAdapter = getTediousAdapter;
class TediousDatabaseAdapter {
    constructor(poolConf, dbConf) {
        this.pool = new ConnectionPool(poolConf, dbConf);
        this.pool.on('error', function (error) {
            console.error({ location: 'hrdata sql db connect on error', error });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pool) {
                this.pool.drain();
            }
        });
    }
    runSelectQuery(tediousQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getConnection().then(connection => {
                return new Promise((resolve, reject) => {
                    const dbrequest = new tedious_1.Request(tediousQuery.getQueryString(), function (err, rowCount, rows) {
                        try {
                            connection.release();
                        }
                        catch (e) { }
                        if (err)
                            reject(err);
                        else if (rowCount > 0) {
                            const result = [];
                            rows.forEach(row => {
                                const val = {};
                                row.forEach(function (column) {
                                    if (column.metadata)
                                        val[column.metadata.colName] = column.value;
                                });
                                result.push(val);
                            });
                            resolve(result);
                        }
                        else
                            resolve([]);
                    });
                    const qv = tediousQuery.getQueryValues();
                    for (const col in qv) {
                        if (col && qv[col].type)
                            dbrequest.addParameter(col, qv[col].type, qv[col].value);
                    }
                    connection.execSql(dbrequest);
                });
            });
        });
    }
    newTransaction() {
        const transactionAdapter = new TediousTransactionAdapter(this);
        return transactionAdapter;
    }
    _getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.acquire((error, connection) => {
                if (error)
                    reject(error);
                resolve(connection);
            });
        });
    }
}
exports.TediousDatabaseAdapter = TediousDatabaseAdapter;
class TediousTransactionAdapter {
    constructor(adatper) {
        this.queries = [];
        this._executed = false;
        this._parentAdapter = adatper;
    }
    pushQuery(tediousQuery) {
        if (this._executed) {
            throw new Error('Execution Started');
        }
        this.queries.push(tediousQuery);
    }
    isExecuted() {
        return this._executed;
    }
    beginTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this._parentAdapter._getConnection();
            return new Promise((resolve, reject) => {
                connection.beginTransaction(error => {
                    if (error)
                        reject(error);
                    else
                        resolve(connection);
                });
            });
        });
    }
    executeStatement(tediousQuery, connection) {
        return new Promise((resolve, reject) => {
            const dbrequest = new tedious_1.Request(tediousQuery.getQueryString(), function (err, rowCount, rows) {
                if (err)
                    reject(err);
                resolve();
            });
            const qv = tediousQuery.getQueryValues();
            for (const col in qv) {
                if (col && qv[col].type)
                    dbrequest.addParameter(col, qv[col].type, qv[col].value);
            }
            connection.execSql(dbrequest);
        });
    }
    completeTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.commitTransaction(error => {
                if (error)
                    reject(error);
                else
                    resolve(true);
            });
        });
    }
    abortTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.rollbackTransaction(error => {
                if (error)
                    reject(error);
                else
                    resolve(true);
            });
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._executed) {
                throw new Error('Already Executed');
            }
            this._executed = true;
            if (!this.queries.length)
                return;
            const connection = yield this.beginTransaction();
            try {
                for (const query of this.queries) {
                    yield this.executeStatement(query, connection);
                }
                yield this.completeTransaction(connection);
            }
            catch (error) {
                console.log(error);
                yield this.abortTransaction(connection);
                throw new Error('Failed transaction');
            }
            finally {
                try {
                    connection.release();
                }
                catch (e) { }
            }
        });
    }
}
exports.TediousTransactionAdapter = TediousTransactionAdapter;
class TediousQuery {
    constructor(queryString, queryValues, enforceStrictEscape = true) {
        this._queryString = queryString;
        this._queryValues = queryValues;
    }
    getQueryString() {
        return this._queryString;
    }
    getQueryValues() {
        return this._queryValues;
    }
}
exports.TediousQuery = TediousQuery;
//# sourceMappingURL=TediousDatabaseAdapter.js.map