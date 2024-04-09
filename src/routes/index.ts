import { Router } from 'express';
import { botHandler } from '../controllers/bot.controller';
import { direct, login, index, frame } from '../controllers/web.controller';
import HealthCheck from '../controllers/healthCheck.controller';
import createError from 'http-errors';

class RootRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.initializePaths();
  }
  private initializePaths(): void {
    this.router.get('/', index);
    this.router.get('/login', login);
    this.router.get('/direct', direct);
    this.router.get('/frame', frame);
    this.router.post('/api/messages', botHandler);
    this.router.get('/api/failure/test', function (req, res, next) {
      const error = new Error('failure test');
      next(new createError.InternalServerError(JSON.stringify(error)));
    });
    this.router.get('/api/basicHealthCheck', function (req, res, next) {
      res.sendStatus(200);
    });
    this.router.get('/api/healthCheck', HealthCheck.getHealth);
  }
}

export default new RootRouter().router;
