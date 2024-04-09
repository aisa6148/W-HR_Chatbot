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
exports.getIntent = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = __importDefault(require("../models/logger"));
exports.getIntent = (url, text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield node_fetch_1.default(url + 'q=' + encodeURIComponent(text), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const body = yield res.json();
        return body;
    }
    catch (error) {
        logger_1.default.error({ error, location: 'luis.services' });
        return undefined;
    }
});
//# sourceMappingURL=luis.service.js.map