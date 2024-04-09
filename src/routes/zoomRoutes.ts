import { Router } from 'express';
import { authorize, verify_zoom, deauthorize, support, privacy, terms, documentation } from '../controllers/zoom.controller';

class ZoomRoutes {
    public zoomRouter: Router;
    constructor() {
        this.zoomRouter = Router();
        this.initializePaths();
    }
    private initializePaths(): void {
        this.zoomRouter.get('/authorize', authorize);
        this.zoomRouter.get('/zoomverify/verifyzoom.html', verify_zoom);
        this.zoomRouter.post('/deauthorize', deauthorize);
        this.zoomRouter.get('/support', support);
        this.zoomRouter.get('/privacy', privacy);
        this.zoomRouter.get('/terms', terms);
        this.zoomRouter.get('/documentation', documentation);
    }
}

export default new ZoomRoutes().zoomRouter;