import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import mebbisTransferRoutes from './routes/mebbis-transfer.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.use('/', mebbisTransferRoutes);

export default router;
