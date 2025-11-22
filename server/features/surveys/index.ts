import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { bulkOperationsRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import * as templatesRoutes from './routes/modules/templates.routes.js';
import * as questionsRoutes from './routes/modules/questions.routes.js';
import * as distributionsRoutes from './routes/modules/distributions.routes.js';
import * as responsesRoutes from './routes/modules/responses.routes.js';
import * as analyticsRoutes from './routes/modules/analytics.routes.js';
import aiAnalysisRoutes from './routes/ai-analysis.routes.js';

const router = Router();

router.get("/survey-templates", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), templatesRoutes.getSurveyTemplates);
router.get("/survey-templates/:id", simpleRateLimit(300, 15 * 60 * 1000), templatesRoutes.getSurveyTemplateById);
router.post("/survey-templates", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(30, 15 * 60 * 1000), templatesRoutes.createSurveyTemplate);
router.put("/survey-templates/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(30, 15 * 60 * 1000), templatesRoutes.updateSurveyTemplateHandler);
router.delete("/survey-templates/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(20, 15 * 60 * 1000), templatesRoutes.deleteSurveyTemplateHandler);
router.post("/survey-templates/reset", requireSecureAuth, requireRoleSecure(['admin']), simpleRateLimit(10, 15 * 60 * 1000), templatesRoutes.resetSurveyTemplatesToDefaults);

router.get("/survey-questions/:templateId", simpleRateLimit(300, 15 * 60 * 1000), questionsRoutes.getQuestionsByTemplateId);
router.post("/survey-questions", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(50, 15 * 60 * 1000), questionsRoutes.createSurveyQuestion);
router.put("/survey-questions/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(50, 15 * 60 * 1000), questionsRoutes.updateSurveyQuestionHandler);
router.delete("/survey-questions/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(30, 15 * 60 * 1000), questionsRoutes.deleteSurveyQuestionHandler);
router.delete("/survey-questions/template/:templateId", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(20, 15 * 60 * 1000), questionsRoutes.deleteQuestionsByTemplateHandler);

router.get("/survey-distributions", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributions);
router.get("/survey-distributions/:id", requireSecureAuth, simpleRateLimit(200, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributionById);
router.get("/survey-distributions/link/:publicLink", simpleRateLimit(300, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributionByPublicLink);
router.post("/survey-distributions", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(30, 15 * 60 * 1000), distributionsRoutes.createSurveyDistribution);
router.put("/survey-distributions/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(30, 15 * 60 * 1000), distributionsRoutes.updateSurveyDistributionHandler);
router.delete("/survey-distributions/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(20, 15 * 60 * 1000), distributionsRoutes.deleteSurveyDistributionHandler);

router.get("/survey-responses", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), responsesRoutes.getSurveyResponses);
router.post("/survey-responses", simpleRateLimit(100, 15 * 60 * 1000), responsesRoutes.createSurveyResponse);
router.put("/survey-responses/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(50, 15 * 60 * 1000), responsesRoutes.updateSurveyResponseHandler);
router.delete("/survey-responses/:id", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), simpleRateLimit(30, 15 * 60 * 1000), responsesRoutes.deleteSurveyResponseHandler);
router.post("/survey-responses/import/:distributionId", requireSecureAuth, requireRoleSecure(['admin', 'counselor']), bulkOperationsRateLimiter, responsesRoutes.uploadMiddleware, responsesRoutes.importExcelResponsesHandler);

router.get("/survey-analytics/:distributionId", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getSurveyAnalytics);
router.get("/survey-analytics/:distributionId/question/:questionId", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getSurveyQuestionAnalytics);
router.get("/survey-statistics/:distributionId", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getDistributionStatistics);

router.use("/ai-analysis", requireSecureAuth, requireRoleSecure(['admin', 'counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), aiAnalysisRoutes);

export default router;
