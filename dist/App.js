"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const path = __importStar(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bodyparser = __importStar(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("./configs/config"));
const hrBridgeRoutes_1 = __importDefault(require("./routes/hrBridgeRoutes"));
const zoomRoutes_1 = __importDefault(require("./routes/zoomRoutes"));
class App {
    constructor() {
        this.app = express_1.default();
        this.setAppProperties();
        this.mountRoutes();
    }
    setAppProperties() {
        this.app.set('view engine', 'hbs');
        this.app.set('views', path.join(__dirname, '../views'));
        let env = process.env.NODE_ENV;
        if (!env)
            env = 'dev';
        env = env.toLowerCase();
        this.app.use(morgan_1.default(env));
        this.app.use(bodyparser.json());
        this.app.use(bodyparser.urlencoded({ extended: false }));
        this.app.use(cookie_parser_1.default());
        this.app.use(express_1.default.static(path.join(__dirname, 'public')));
    }
    mountRoutes() {
        this.app.use('/', index_1.default);
        this.app.use('/notify', this.apiKeyCheck, notificationRoutes_1.default);
        this.app.use('/hitAny', this.apiKeyCheck, hrBridgeRoutes_1.default);
        this.app.use('/zoom', zoomRoutes_1.default);
    }
    apiKeyCheck(req, res, next) {
        const key = req.headers['api-key'];
        if (key === config_1.default.notifyKey) {
            console.log('Key accepted');
            next();
        }
        else {
            console.error({
                location: 'apiKeyCheck function',
                message: 'invalid key',
                key
            });
            res.send('Invalid Key').status(401);
        }
    }
}
exports.default = new App().app;
//# sourceMappingURL=App.js.map