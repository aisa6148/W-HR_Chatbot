"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLuisMapFromDB = void 0;
const documentdb_1 = __importDefault(require("documentdb"));
const logger_1 = __importDefault(require("./logger"));
const config_1 = __importDefault(require("../configs/config"));
const documentClient = documentdb_1.default.DocumentClient;
const uriFactory = documentdb_1.default.UriFactory;
const databaseConfig = config_1.default.database;
const client = new documentClient(databaseConfig.endpoint, { 'masterKey': databaseConfig.primaryKey });
exports.fetchLuisMapFromDB = function (intent) {
    logger_1.default.debug({ location: 'luismapdb', intent: intent });
    return new Promise((resolve, reject) => {
        const collectionUrl = uriFactory.createDocumentCollectionUri(databaseConfig.database.id, databaseConfig.collections['LuisMap'].id);
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id=@id',
            parameters: [{ name: '@id', value: intent }],
            EnableCrossPartitionQuery: true
        };
        const options = {
            enableCrossPartitionQuery: true
        };
        client.queryDocuments(collectionUrl, querySpec, options).toArray((error, results) => {
            if (error) {
                logger_1.default.error({ location: 'luismapdb return from queryDocuments', error: error });
                reject(error);
            }
            else {
                logger_1.default.debug({ location: 'luismapdb return from db', value: results });
                if (results.length > 0) {
                    resolve(results[0]);
                }
                else {
                    resolve(undefined);
                }
            }
        });
    });
};
//# sourceMappingURL=luisMapDB.js.map