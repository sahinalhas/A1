import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as documentsRoutes from './routes/documents.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.get("/:studentId", simpleRateLimit(200, 15 * 60 * 1000), documentsRoutes.getDocuments);
router.post("/", simpleRateLimit(50, 15 * 60 * 1000), documentsRoutes.saveDocumentHandler);
router.delete("/:id", simpleRateLimit(20, 15 * 60 * 1000), documentsRoutes.deleteDocumentHandler);

export default router;
