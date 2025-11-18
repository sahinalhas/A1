import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import behaviorRoutes from './routes/behavior.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.use('/', behaviorRoutes);

export default router;
