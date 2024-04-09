"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zoom_controller_1 = require("../controllers/zoom.controller");
class ZoomRoutes {
    constructor() {
        this.zoomRouter = express_1.Router();
        this.initializePaths();
    }
    initializePaths() {
        this.zoomRouter.get('/authorize', zoom_controller_1.authorize);
        this.zoomRouter.get('/zoomverify/verifyzoom.html', zoom_controller_1.verify_zoom);
        this.zoomRouter.post('/deauthorize', zoom_controller_1.deauthorize);
        this.zoomRouter.get('/support', zoom_controller_1.support);
        this.zoomRouter.get('/privacy', zoom_controller_1.privacy);
        this.zoomRouter.get('/terms', zoom_controller_1.terms);
        this.zoomRouter.get('/documentation', zoom_controller_1.documentation);
    }
}
exports.default = new ZoomRoutes().zoomRouter;
//# sourceMappingURL=zoomRoutes.js.map