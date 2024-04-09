import { Router } from 'express';

class HRBridgeRoutes {
  public hrBridgeRouter: Router;
  constructor() {
    this.hrBridgeRouter = Router();
    this.initializePaths();
  }
  private initializePaths(): void {
    this.hrBridgeRouter.post('/', async (req, res) => {
      const { body, url, method, headers } = req.body;
      try {
        const response = await fetch(url, {
          method: method,
          headers: headers,
          body: JSON.stringify(body)
        });
        const c = response;
        try {
          res.json({ response: c, json: await response.json() });
        } catch (error) {
          res.json({ response: c });
        }
      } catch (error) {
        res.send(error).status(500);
      }
    });
  }
}

export default new HRBridgeRoutes().hrBridgeRouter;
