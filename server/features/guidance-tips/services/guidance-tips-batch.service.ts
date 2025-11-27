import { guidanceTipsAIService } from './guidance-tips-ai.service.js';
import { guidanceTipsRepository } from '../repository/guidance-tips.repository.js';
import type { GuidanceTip, GuidanceTipCategory } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';
import { logger } from '../../../utils/logger.js';

interface UserBatchCache {
  userId: string;
  tips: GuidanceTip[];
  currentIndex: number;
  batchCreatedAt: number;
  enabledCategories: GuidanceTipCategory[] | undefined;
}

/**
 * Batch caching service for guidance tips
 * Generates 54 tips in advance and serves them one by one
 * When batch runs out, automatically generates a new batch
 * This minimizes API calls and provides smooth user experience
 */
class GuidanceTipsBatchService {
  private batchCache = new Map<string, UserBatchCache>();
  private readonly BATCH_SIZE = 54;
  private readonly MAX_BATCH_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get next tip from user's batch cache
   * Automatically generates new batch if needed
   */
  async getNextTip(userId: string, enabledCategories: GuidanceTipCategory[] | undefined): Promise<GuidanceTip | null> {
    try {
      // Get or create batch cache for user
      let cache = this.batchCache.get(userId);
      
      // Check if batch is expired or doesn't exist
      if (!cache || this.isBatchExpired(cache) || cache.tips.length === 0) {
        logger.info(`Generating new batch of ${this.BATCH_SIZE} tips for user ${userId}`, 'GuidanceTipsBatch');
        await this.generateNewBatch(userId, enabledCategories);
        cache = this.batchCache.get(userId)!;
      }

      // Get current tip from batch
      const currentTip = cache.tips[cache.currentIndex];
      
      if (!currentTip) {
        logger.warn(`No tip found at index ${cache.currentIndex} for user ${userId}`, 'GuidanceTipsBatch');
        return null;
      }

      // Mark tip as viewed
      guidanceTipsRepository.markTipAsViewed(currentTip.id, userId);

      // Move to next tip
      cache.currentIndex++;

      // If we've reached the end, mark for regeneration on next call
      if (cache.currentIndex >= cache.tips.length) {
        logger.info(`Batch exhausted for user ${userId}, will regenerate on next request`, 'GuidanceTipsBatch');
      }

      return currentTip;
    } catch (error) {
      logger.error('Failed to get next tip from batch', 'GuidanceTipsBatch', error);
      return null;
    }
  }

  /**
   * Generate a new batch of tips for user
   * Creates BATCH_SIZE tips based on user's enabled categories
   */
  private async generateNewBatch(userId: string, enabledCategories: GuidanceTipCategory[] | undefined): Promise<void> {
    try {
      const tips: GuidanceTip[] = [];
      const categoriesToUse = enabledCategories && enabledCategories.length > 0
        ? enabledCategories
        : GUIDANCE_TIP_CATEGORIES.map(c => c.value);

      // Generate tips, cycling through categories to ensure variety
      for (let i = 0; i < this.BATCH_SIZE; i++) {
        // Pick category (cycle through enabled categories for balance)
        const categoryIndex = i % categoriesToUse.length;
        const category = categoriesToUse[categoryIndex];

        try {
          const generatedContent = await guidanceTipsAIService.generateRandomTip(category);
          if (generatedContent) {
            const tip = guidanceTipsRepository.createTip(generatedContent);
            tips.push(tip);
            logger.debug(`Generated tip ${i + 1}/${this.BATCH_SIZE}: ${tip.title} [${category}]`, 'GuidanceTipsBatch');
          }
        } catch (error) {
          logger.warn(`Failed to generate tip ${i + 1}/${this.BATCH_SIZE} for category ${category}`, 'GuidanceTipsBatch', error);
          // Continue with next tip instead of failing entire batch
        }
      }

      if (tips.length === 0) {
        logger.error('Failed to generate any tips in batch', 'GuidanceTipsBatch');
        return;
      }

      // Shuffle tips for randomness
      const shuffledTips = this.shuffleArray(tips);

      // Store batch in cache
      this.batchCache.set(userId, {
        userId,
        tips: shuffledTips,
        currentIndex: 0,
        batchCreatedAt: Date.now(),
        enabledCategories
      });

      logger.info(`Batch cache created for user ${userId}: ${shuffledTips.length} tips`, 'GuidanceTipsBatch');
    } catch (error) {
      logger.error('Failed to generate new batch', 'GuidanceTipsBatch', error);
    }
  }

  /**
   * Check if batch has expired
   */
  private isBatchExpired(cache: UserBatchCache): boolean {
    const age = Date.now() - cache.batchCreatedAt;
    return age > this.MAX_BATCH_AGE_MS;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Clear cache for a user (useful for testing)
   */
  clearUserCache(userId: string): void {
    this.batchCache.delete(userId);
    logger.info(`Cache cleared for user ${userId}`, 'GuidanceTipsBatch');
  }

  /**
   * Get batch stats
   */
  getBatchStats(userId: string) {
    const cache = this.batchCache.get(userId);
    if (!cache) {
      return null;
    }

    return {
      userId,
      totalTipsInBatch: cache.tips.length,
      currentIndex: cache.currentIndex,
      tipsRemaining: Math.max(0, cache.tips.length - cache.currentIndex),
      batchCreatedAt: new Date(cache.batchCreatedAt).toISOString(),
      isExpired: this.isBatchExpired(cache)
    };
  }
}

export const guidanceTipsBatchService = new GuidanceTipsBatchService();
