import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import * as attendanceRoutes from './routes/attendance.routes.js';

const router = Router();

router.use(requireSecureAuth);

router.get("/", requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), attendanceRoutes.getAllAttendance);
router.get("/:studentId", simpleRateLimit(200, 15 * 60 * 1000), attendanceRoutes.getAttendanceByStudent);
router.post("/", requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), attendanceRoutes.saveAttendance);

export default router;
