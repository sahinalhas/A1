import { Router, type Request, type Response } from 'express';
import { guidanceTipsService } from '../services/guidance-tips.service.js';
import { triggerManualGeneration } from '../services/guidance-tips-scheduler.service.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';
import { logger } from '../../../utils/logger.js';

const router = Router();

router.get('/next', async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { userId?: string }).userId || 'anonymous';
    const tip = await guidanceTipsService.getNextTipForUser(userId);
    
    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'No tips available'
      });
    }

    res.json({
      success: true,
      data: tip
    });
  } catch (error) {
    logger.error('Failed to get next tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tip'
    });
  }
});

router.get('/latest', async (_req: Request, res: Response) => {
  try {
    const tip = guidanceTipsService.getLatestTip();
    
    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'No tips available'
      });
    }

    res.json({
      success: true,
      data: tip
    });
  } catch (error) {
    logger.error('Failed to get latest tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tip'
    });
  }
});

router.get('/all', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    
    let tips;
    if (category) {
      tips = guidanceTipsService.getTipsByCategory(category, limit);
    } else {
      tips = guidanceTipsService.getAllTips(limit);
    }

    res.json({
      success: true,
      data: tips,
      count: tips.length
    });
  } catch (error) {
    logger.error('Failed to get all tips', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tips'
    });
  }
});

router.get('/categories', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GUIDANCE_TIP_CATEGORIES
  });
});

router.get('/stats', (_req: Request, res: Response) => {
  try {
    const count = guidanceTipsService.getTipCount();
    
    res.json({
      success: true,
      data: {
        totalTips: count,
        categories: GUIDANCE_TIP_CATEGORIES.length
      }
    });
  } catch (error) {
    logger.error('Failed to get tip stats', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

router.post('/dismiss/:tipId', async (req: Request, res: Response) => {
  try {
    const { tipId } = req.params;
    const userId = (req as unknown as { userId?: string }).userId || 'anonymous';
    
    guidanceTipsService.dismissTip(tipId, userId);
    
    res.json({
      success: true,
      message: 'Tip dismissed'
    });
  } catch (error) {
    logger.error('Failed to dismiss tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss tip'
    });
  }
});

router.post('/rate/:tipId', async (req: Request, res: Response) => {
  try {
    const { tipId } = req.params;
    const { rating } = req.body;
    const userId = (req as unknown as { userId?: string }).userId || 'anonymous';
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    guidanceTipsService.rateTip(tipId, userId, rating);
    
    res.json({
      success: true,
      message: 'Tip rated'
    });
  } catch (error) {
    logger.error('Failed to rate tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rate tip'
    });
  }
});

router.post('/generate', async (_req: Request, res: Response) => {
  try {
    await triggerManualGeneration();
    
    res.json({
      success: true,
      message: 'Tip generation triggered'
    });
  } catch (error) {
    logger.error('Failed to trigger generation', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger generation'
    });
  }
});

export default router;
