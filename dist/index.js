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
const appInsights = require('applicationinsights');
require('source-map-support').install();
const port = process.env.PORT || 3000;
const config_1 = __importDefault(require("./configs/config"));
const logger_1 = __importDefault(require("./models/logger"));
appInsights
    .setup(process.env.APP_INSIGHTS_KEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setUseDiskRetryCaching(true);
appInsights.start();
function initApp() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.default.init(config_1.default.azureLogStorage);
            const app = require('./App').default;
            app.listen(port, (error) => {
                if (error) {
                    throw error;
                }
                return console.log(`server is listening on ${port}`);
            });
        }
        catch (error) {
            console.error(error);
        }
    });
}
initApp();
//# sourceMappingURL=index.js.map