import { Router } from 'express';
import {
  notifyMessage,
  notifyBirthday,
  notifyWorkAnniversary,
  notifySlackChannel,
  startNotifications
} from '../controllers/notification.controller';
import { notificationStatus } from '../services/associate.services';

class NotificationRoutes {
  public notificationRouter: Router;
  constructor() {
    this.notificationRouter = Router();
    this.initializePaths();
  }
  private initializePaths(): void {
    this.notificationRouter.post('/message-notification', notifyMessage);
    this.notificationRouter.post('/birthday-notify', notifyBirthday);
    this.notificationRouter.post('/work-anniversary-notify', notifyWorkAnniversary);
    this.notificationRouter.get('/notify-status', notificationStatus);
    this.notificationRouter.get('/notify-slack-channel', notifySlackChannel);
    this.notificationRouter.post('/start-notification', startNotifications);
  }
}

export default new NotificationRoutes().notificationRouter;
