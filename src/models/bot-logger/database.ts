/**
 * @author Jatin Mohan
 * @version 0.1
 */

const documentClient = require('documentdb').DocumentClient;
const uriFactory = require('documentdb').UriFactory;

/**
 * @description class to support database CRUD operations
 */
class Database {
    private client: any;
    constructor(url: string, key: string) {
        this.client = new documentClient(url, { 'masterKey': key });
    }

    /**
     *
     * @param {*} databaseId
     */
    connectDB(databaseId: { id: string }) {
        const databaseUrl = uriFactory.createDatabaseUri(databaseId.id);
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.client.readDatabase(databaseUrl, (err: Error, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * @desc Method to fetch the collection Object
     * @param {String} databaseId
     * @param {String} collectionId
     */
    getCollection(databaseId: { id: string }, collectionId: { id: string }) {
        const collectionUrl = uriFactory.createDocumentCollectionUri(databaseId.id, collectionId.id);
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.client.readCollection(collectionUrl, (err: Error, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     *
     * @param {*} databaseId
     * @param {*} collectionId
     * @param {*} document
     */
    docCreate(databaseId: { id: string }, collectionId: { id: string }, document: any) {
        const collectionUrl = uriFactory.createDocumentCollectionUri(databaseId.id, collectionId.id);
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.client.createDocument(collectionUrl, document, (err: Error, created: any) => {
                if (err) reject(err);
                else resolve(created);
            });
        });
    }

    /**
     *
     * @param {*} databaseId
     * @param {*} collectionId
     * @param {*} query
     */
    queryCollection(databaseId: { id: string }, collectionId: { id: string }, query: string) {
        // Fetch the user document
        const collectionUrl = uriFactory.createDocumentCollectionUri(databaseId.id, collectionId.id);
        const _this = this;
        return new Promise((resolve, reject) => {
            _this.client.queryDocuments(
                collectionUrl,
                query
            ).toArray(((err: Error, results: any) => {
                if (err) reject(err);
                else resolve(results);
            }));
        });

    }

    /**
     * @author Madhav Khaddar
     * @desc Method to replace the document
     * @param {*} databaseId
     * @param {*} collectionId
     * @param {*} document
     */
    updateDocument(databaseId: { id: string }, collectionId: { id: string }, document: any) {
        const _this = this;
        const documentUrl = uriFactory.createDocumentUri(databaseId.id, collectionId.id, document.id);
        return new Promise((resolve, reject) => {
            _this.client.replaceDocument(documentUrl, document, (err: Error, result: any) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
}

module.exports = Database;