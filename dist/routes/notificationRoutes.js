"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const associate_services_1 = require("../services/associate.services");
class NotificationRoutes {
    constructor() {
        this.notificationRouter = express_1.Router();
        this.initializePaths();
    }
    initializePaths() {
        this.notificationRouter.post('/message-notification', notification_controller_1.notifyMessage);
        this.notificationRouter.post('/birthday-notify', notification_controller_1.notifyBirthday);
        this.notificationRouter.post('/work-anniversary-notify', notification_controller_1.notifyWorkAnniversary);
        this.notificationRouter.get('/notify-status', associate_services_1.notificationStatus);
        this.notificationRouter.get('/notify-slack-channel', notification_controller_1.notifySlackChannel);
        this.notificationRouter.post('/start-notification', notification_controller_1.startNotifications);
    }
}
exports.default = new NotificationRoutes().notificationRouter;
//# sourceMappingURL=notificationRoutes.js.map