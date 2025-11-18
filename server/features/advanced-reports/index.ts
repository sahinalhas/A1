/**
 * Advanced Reports Feature
 * Gelişmiş Raporlama Modülü
 */

import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import advancedReportsRouter from './routes/advanced-reports.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.use('/', advancedReportsRouter);

export default router;
