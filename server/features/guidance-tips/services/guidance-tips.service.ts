import { guidanceTipsRepository } from '../repository/guidance-tips.repository.js';
import { guidanceTipsAIService } from './guidance-tips-ai.service.js';
import { logger } from '../../../utils/logger.js';
import type { GuidanceTip, GuidanceTipCategory, UserCategoryPreferences } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';

class GuidanceTipsService {
  async generateNewTip(category?: GuidanceTipCategory): Promise<GuidanceTip | null> {
    try {
      const generatedContent = await guidanceTipsAIService.generateRandomTip(category);
      
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

  getUserPreferences(userId: string): UserCategoryPreferences | null {
    return guidanceTipsRepository.getUserPreferences(userId);
  }

  saveUserPreferences(userId: string, categories: GuidanceTipCategory[]): UserCategoryPreferences {
    return guidanceTipsRepository.saveUserPreferences(userId, categories);
  }

  getDefaultCategories(): GuidanceTipCategory[] {
    return GUIDANCE_TIP_CATEGORIES.map(c => c.value);
  }

  async getNextTipForUser(userId: string): Promise<GuidanceTip | null> {
    try {
      const preferences = guidanceTipsRepository.getUserPreferences(userId);
      const enabledCategories = preferences?.enabledCategories;
      
      let tip = guidanceTipsRepository.getRandomUnseenTipWithPreferences(userId, enabledCategories);
      
      if (!tip) {
        const totalTips = guidanceTipsRepository.getTipCount();
        
        if (totalTips < 5) {
          const randomCategory = enabledCategories && enabledCategories.length > 0
            ? enabledCategories[Math.floor(Math.random() * enabledCategories.length)]
            : undefined;
          tip = await this.generateNewTip(randomCategory);
        } else {
          tip = guidanceTipsRepository.getLatestTip();
        }
      }

      if (tip) {
        guidanceTipsRepository.markTipAsViewed(tip.id, userId);
      }

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

  cleanupOldTips(daysOld: number = 90): number {
    const deleted = guidanceTipsRepository.deleteOldTips(daysOld);
    if (deleted > 0) {
      logger.info(`Cleaned up ${deleted} old tips`, 'GuidanceTipsService');
    }
    return deleted;
  }
}

export const guidanceTipsService = new GuidanceTipsService();
