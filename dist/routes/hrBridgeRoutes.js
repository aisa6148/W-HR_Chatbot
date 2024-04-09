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
const express_1 = require("express");
class HRBridgeRoutes {
    constructor() {
        this.hrBridgeRouter = express_1.Router();
        this.initializePaths();
    }
    initializePaths() {
        this.hrBridgeRouter.post('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { body, url, method, headers } = req.body;
            try {
                const response = yield fetch(url, {
                    method: method,
                    headers: headers,
                    body: JSON.stringify(body)
                });
                const c = response;
                try {
                    res.json({ response: c, json: yield response.json() });
                }
                catch (error) {
                    res.json({ response: c });
                }
            }
            catch (error) {
                res.send(error).status(500);
            }
        }));
    }
}
exports.default = new HRBridgeRoutes().hrBridgeRouter;
//# sourceMappingURL=hrBridgeRoutes.js.map