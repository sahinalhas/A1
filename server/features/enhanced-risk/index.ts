import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import enhancedRiskRoutes from './routes/enhanced-risk.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.use('/', simpleRateLimit(100, 15 * 60 * 1000), enhancedRiskRoutes);

export default router;
