"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const docuClient = require('documentdb').DocumentClient;
const uriFact = require('documentdb').UriFactory;
const config_1 = __importDefault(require("../configs/config"));
const DataBase = function (endpoint, primaryKey) {
    this.client = new docuClient(endpoint, { masterKey: primaryKey });
};
DataBase.prototype.insertDocument = function (database, collection, document) {
    const _this = this;
    const databaseUrl = 'dbs/' + database.id;
    const collectionUrl = databaseUrl + '/colls/' + collection.id;
    return new Promise((resolve, reject) => {
        _this.client.createDocument(collectionUrl, document, (err, created) => {
            if (err)
                reject(err);
            else
                resolve(created);
        });
    });
};
DataBase.prototype.queryCollection = function (databaseId, collectionId, query) {
    // Fetch the user document
    const collectionUrl = uriFact.createDocumentCollectionUri(databaseId.id, collectionId.id);
    const _this = this;
    return new Promise((resolve, reject) => {
        _this.client
            .queryDocuments(collectionUrl, query, { enableCrossPartitionQuery: true })
            .toArray((err, results) => {
            // console.log(err,results);
            if (err)
                reject(err);
            else
                resolve(results);
        });
    });
};
module.exports = new DataBase(config_1.default.database.endpoint, process.env.COSMOS_DATABASE_MASTERKEY);
//# sourceMappingURL=database.js.map