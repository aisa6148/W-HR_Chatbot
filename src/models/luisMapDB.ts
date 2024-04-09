import documentDB, { QueryError } from 'documentdb';
import logger from './logger';
import config from '../configs/config';
const documentClient = documentDB.DocumentClient;
const uriFactory = documentDB.UriFactory;
const databaseConfig = config.database;
const client = new documentClient(databaseConfig.endpoint, { 'masterKey': databaseConfig.primaryKey });

export const fetchLuisMapFromDB = function (intent: string): Promise<any> {
    logger.debug({ location: 'luismapdb', intent: intent });
    return new Promise((resolve, reject) => {
        const collectionUrl = uriFactory.createDocumentCollectionUri(databaseConfig.database.id, databaseConfig.collections['LuisMap'].id);
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id=@id',
            parameters: [{ name: '@id', value: intent }],
            EnableCrossPartitionQuery: true
        };
        const options = { // Query options
            enableCrossPartitionQuery: true
        };
        client.queryDocuments(
            collectionUrl,
            querySpec,
            options
        ).toArray((error: QueryError, results: any[]) => {
            if (error) {
                logger.error({ location: 'luismapdb return from queryDocuments', error: error });
                reject(error);
            }
            else {
                logger.debug({ location: 'luismapdb return from db', value: results });
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(undefined);
                }
            }
        });
    });
};