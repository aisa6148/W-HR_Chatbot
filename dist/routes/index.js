"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bot_controller_1 = require("../controllers/bot.controller");
const web_controller_1 = require("../controllers/web.controller");
const healthCheck_controller_1 = __importDefault(require("../controllers/healthCheck.controller"));
const http_errors_1 = __importDefault(require("http-errors"));
class RootRouter {
    constructor() {
        this.router = express_1.Router();
        this.initializePaths();
    }
    initializePaths() {
        this.router.get('/', web_controller_1.index);
        this.router.get('/login', web_controller_1.login);
        this.router.get('/direct', web_controller_1.direct);
        this.router.get('/frame', web_controller_1.frame);
        this.router.post('/api/messages', bot_controller_1.botHandler);
        this.router.get('/api/failure/test', function (req, res, next) {
            const error = new Error('failure test');
            next(new http_errors_1.default.InternalServerError(JSON.stringify(error)));
        });
        this.router.get('/api/basicHealthCheck', function (req, res, next) {
            res.sendStatus(200);
        });
        this.router.get('/api/healthCheck', healthCheck_controller_1.default.getHealth);
    }
}
exports.default = new RootRouter().router;
//# sourceMappingURL=index.js.map