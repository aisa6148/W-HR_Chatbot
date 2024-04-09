import express, { NextFunction, Request, Response } from 'express';
import rootRouter from './routes/index';
import notificationRoutes from './routes/notificationRoutes';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import * as bodyparser from 'body-parser';
import logger from 'morgan';
import config from './configs/config';
import hrBridgeRoutes from './routes/hrBridgeRoutes';
import zoomRoutes from './routes/zoomRoutes';
class App {
  public app: any;
  constructor() {
    this.app = express();
    this.setAppProperties();
    this.mountRoutes();
  }
  private setAppProperties(): void {
    this.app.set('view engine', 'hbs');
    this.app.set('views', path.join(__dirname, '../views'));
    let env = process.env.NODE_ENV;
    if (!env) env = 'dev';
    env = env.toLowerCase();
    this.app.use(logger(env));
    this.app.use(bodyparser.json());
    this.app.use(bodyparser.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private mountRoutes(): void {
    this.app.use('/', rootRouter);
    this.app.use('/notify', this.apiKeyCheck, notificationRoutes);
    this.app.use('/hitAny', this.apiKeyCheck, hrBridgeRoutes);
    this.app.use('/zoom', zoomRoutes);
  }

  private apiKeyCheck(req: Request, res: Response, next: NextFunction): void {
    const key = req.headers['api-key'];
    if (key === config.notifyKey) {
      console.log('Key accepted');
      next();
    } else {
      console.error({
        location: 'apiKeyCheck function',
        message: 'invalid key',
        key
      });
      res.send('Invalid Key').status(401);
    }
  }
}

export default new App().app;
