import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import autoReportsRoutes from './routes/auto-reports.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.use('/', simpleRateLimit(20, 15 * 60 * 1000), autoReportsRoutes);

export default router;
