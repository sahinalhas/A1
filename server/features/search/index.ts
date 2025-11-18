import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as searchRoutes from './routes/search.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.get('/global', simpleRateLimit(100, 15 * 60 * 1000), searchRoutes.globalSearch);

export default router;
