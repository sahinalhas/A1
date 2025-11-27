import { guidanceTipsRepository } from '../repository/guidance-tips.repository.js';
import { guidanceTipsAIService } from './guidance-tips-ai.service.js';
import { guidanceTipsBatchService } from './guidance-tips-batch.service.js';
import type { GuidanceTip, GuidanceTipCategory, UserCategoryPreferences } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';
import { logger } from '../../../utils/logger.js';

class GuidanceTipsService {
  async generateNewTip(preferredCategory?: GuidanceTipCategory): Promise<GuidanceTip | null> {
    try {
      const generatedContent = await guidanceTipsAIService.generateRandomTip(preferredCategory);
      
      if (!generatedContent) {
        logger.warn('AI failed to generate tip content', 'GuidanceTipsService');
        return null;
      }

      const tip = guidanceTipsRepository.createTip(generatedContent);
      logger.info(`New guidance tip created: ${tip.id}`, 'GuidanceTipsService');
      
      return tip;
    } catch (error) {
      logger.error('Failed to generate new tip', 'GuidanceTipsService', error);
      return null;
    }
  }

  async generateBatchOfTips(userId: string, enabledCategories: GuidanceTipCategory[] | undefined): Promise<void> {
    await guidanceTipsBatchService.getNextTip(userId, enabledCategories);
  }

  getUserPreferences(userId: string): UserCategoryPreferences | null {
    return guidanceTipsRepository.getUserPreferences(userId);
  }

  saveUserPreferences(userId: string, categories: GuidanceTipCategory[]): UserCategoryPreferences {
    return guidanceTipsRepository.saveUserPreferences(userId, categories);
  }

  getDefaultCategories(): GuidanceTipCategory[] {
    return GUIDANCE_TIP_CATEGORIES.map(c => c.value);
  }

  async getNextTipForUser(userId: string, forceNew: boolean = false): Promise<GuidanceTip | null> {
    try {
      const preferences = guidanceTipsRepository.getUserPreferences(userId);
      const enabledCategories = preferences?.enabledCategories;
      
      // If forceNew is true, regenerate entire batch
      if (forceNew) {
        logger.info(`Force regenerating batch for user ${userId}`, 'GuidanceTipsService');
        guidanceTipsBatchService.clearUserCache(userId);
      }
      
      // Use batch service to get next tip
      // Batch service handles: generating new batch if needed, serving tips one by one
      const tip = await guidanceTipsBatchService.getNextTip(userId, enabledCategories);
      
      return tip;
    } catch (error) {
      logger.error('Failed to get next tip for user', 'GuidanceTipsService', error);
      return null;
    }
  }

  getLatestTip(): GuidanceTip | null {
    return guidanceTipsRepository.getLatestTip();
  }

  getAllTips(limit: number = 50): GuidanceTip[] {
    return guidanceTipsRepository.getAllActiveTips(limit);
  }

  getTipsByCategory(category: string, limit: number = 20): GuidanceTip[] {
    return guidanceTipsRepository.getTipsByCategory(category, limit);
  }

  dismissTip(tipId: string, userId: string): void {
    guidanceTipsRepository.dismissTip(tipId, userId);
    logger.info(`Tip ${tipId} dismissed by user ${userId}`, 'GuidanceTipsService');
  }

  rateTip(tipId: string, userId: string, rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    guidanceTipsRepository.rateTip(tipId, userId, rating);
    logger.info(`Tip ${tipId} rated ${rating} by user ${userId}`, 'GuidanceTipsService');
  }

  getTipCount(): number {
    return guidanceTipsRepository.getTipCount();
  }

  resetUserViews(userId: string): void {
    guidanceTipsRepository.resetUserViews(userId);
    logger.info(`View history reset for user ${userId}`, 'GuidanceTipsService');
  }
}

export const guidanceTipsService = new GuidanceTipsService();
