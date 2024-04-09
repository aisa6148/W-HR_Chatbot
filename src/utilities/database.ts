const docuClient = require('documentdb').DocumentClient;
const uriFact = require('documentdb').UriFactory;
import config from '../configs/config';

const DataBase: any = function (endpoint: string, primaryKey: string) {
    this.client = new docuClient(endpoint, { masterKey: primaryKey });
};


DataBase.prototype.insertDocument = function (database: { id: string; }, collection: { id: string; }, document: any) {
    const _this = this;
    const databaseUrl = 'dbs/' + database.id;
    const collectionUrl = databaseUrl + '/colls/' + collection.id;
    return new Promise((resolve, reject) => {
        _this.client.createDocument(collectionUrl, document, (err: any, created: unknown) => {
            if (err) reject(err);
            else resolve(created);
        });
    });
};


DataBase.prototype.queryCollection = function (databaseId: { id: string }, collectionId: { id: string }, query: string) {
    // Fetch the user document
    const collectionUrl = uriFact.createDocumentCollectionUri(databaseId.id, collectionId.id);
    const _this = this;
    return new Promise((resolve, reject) => {
        _this.client
            .queryDocuments(collectionUrl, query, { enableCrossPartitionQuery: true })
            .toArray((err: any, results: any) => {
                // console.log(err,results);
                if (err) reject(err);
                else resolve(results);
            });
    });
};

module.exports = new DataBase(
    config.database.endpoint,
    process.env.COSMOS_DATABASE_MASTERKEY
);
