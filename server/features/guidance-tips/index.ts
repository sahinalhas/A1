import { Router } from 'express';
import guidanceTipsRoutes from './routes/guidance-tips.routes.js';

const router = Router();

router.use('/', guidanceTipsRoutes);

export default router;

export { startGuidanceTipsScheduler, stopGuidanceTipsScheduler } from './services/guidance-tips-scheduler.service.js';
export { guidanceTipsService } from './services/guidance-tips.service.js';
