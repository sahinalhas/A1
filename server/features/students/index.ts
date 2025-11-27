import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { bulkOperationsRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateBody, validateParams } from '../../middleware/zod-validation.middleware.js';
import * as studentsRoutes from './routes/students.routes.js';
import * as unifiedProfileRoutes from './routes/unified-profile.routes.js';
import {
  StudentSchema,
  BulkStudentSaveSchema,
  StudentIdParamSchema,
  AcademicRecordSchema,
  StudentDeletionBodySchema,
} from '../../../shared/validation/students.validation.js';

const router = Router();

router.use(requireSecureAuth);

router.get("/", requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), studentsRoutes.getStudents);
router.post("/", requireRoleSecure(['counselor']), validateBody(StudentSchema), simpleRateLimit(50, 15 * 60 * 1000), studentsRoutes.saveStudentHandler);
router.post("/bulk", requireRoleSecure(['counselor']), validateBody(BulkStudentSaveSchema), bulkOperationsRateLimiter, studentsRoutes.saveStudentsHandler);
router.delete("/:id", requireRoleSecure(['counselor']), validateParams(StudentIdParamSchema), validateBody(StudentDeletionBodySchema), simpleRateLimit(20, 15 * 60 * 1000), studentsRoutes.deleteStudentHandler);
router.get("/:id/academics", simpleRateLimit(200, 15 * 60 * 1000), studentsRoutes.getStudentAcademics);
router.post("/academics", requireRoleSecure(['counselor', 'teacher']), validateBody(AcademicRecordSchema), simpleRateLimit(50, 15 * 60 * 1000), studentsRoutes.addStudentAcademic);
router.get("/:id/progress", simpleRateLimit(200, 15 * 60 * 1000), studentsRoutes.getStudentProgress);

router.get("/:id/unified-profile", validateParams(StudentIdParamSchema), simpleRateLimit(100, 15 * 60 * 1000), unifiedProfileRoutes.getUnifiedProfile);
router.post("/:id/initialize-profiles", requireRoleSecure(['counselor']), validateParams(StudentIdParamSchema), simpleRateLimit(20, 15 * 60 * 1000), unifiedProfileRoutes.initializeProfiles);
router.post("/:id/recalculate-scores", requireRoleSecure(['counselor']), validateParams(StudentIdParamSchema), simpleRateLimit(50, 15 * 60 * 1000), unifiedProfileRoutes.recalculateScores);
router.get("/:id/quality-report", validateParams(StudentIdParamSchema), simpleRateLimit(100, 15 * 60 * 1000), unifiedProfileRoutes.getQualityReport);

export default router;
