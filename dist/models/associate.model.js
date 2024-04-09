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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAssociateDB = void 0;
const tedious_1 = require("tedious");
const logger_1 = __importDefault(require("./logger"));
const TediousDatabaseAdapter_1 = require("../utilities/TediousDatabaseAdapter");
const tediousAdapter = TediousDatabaseAdapter_1.getTediousAdapter();
exports.queryAssociateDB = function (query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield tediousAdapter._getConnection();
            return new Promise((resolve, reject) => {
                const dbRequest = new tedious_1.Request(query, function (error, rowCount, rows) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            logger_1.default.error({
                                location: 'queryAssociateDB return from request',
                                error,
                            });
                            reject(error);
                        }
                        else if (rows) {
                            connection.release();
                            resolve(rows);
                        }
                    });
                });
                connection.execSql(dbRequest);
            });
        }
        catch (e) {
            logger_1.default.error({ location: 'queryAssociateDB error', e });
            return [];
        }
    });
};
//# sourceMappingURL=associate.model.js.map