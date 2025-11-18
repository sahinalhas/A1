
/**
 * AI Context Router Service
 * Kullanım senaryosuna göre en uygun AI provider ve model seçer
 */

import { AIProviderService, type AIProvider, type AIProviderConfig } from './ai-provider.service.js';

export type AITaskType = 
  | 'chat'              // Genel sohbet
  | 'analysis'          // Derin analiz
  | 'summary'           // Özet çıkarma
  | 'structured'        // JSON çıktı
  | 'creative'          // Yaratıcı içerik
  | 'fast-response'     // Hızlı yanıt
  | 'bulk-processing';  // Toplu işleme

export interface AITaskContext {
  taskType: AITaskType;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  expectedResponseTime?: 'instant' | 'fast' | 'normal' | 'slow';
  costSensitive?: boolean;
  requiresAccuracy?: boolean;
}

/**
 * Task-based routing strategy
 */
export class AIContextRouter {
  private static taskModelMap: Record<AITaskType, {
    preferredProvider: AIProvider;
    model: string;
    fallback?: { provider: AIProvider; model: string };
    temperature: number;
  }> = {
    'chat': {
      preferredProvider: 'gemini',
      model: 'gemini-2.0-flash',
      fallback: { provider: 'ollama', model: 'llama3.2:3b' },
      temperature: 0.7
    },
    'analysis': {
      preferredProvider: 'gemini',
      model: 'gemini-2.5-pro',
      fallback: { provider: 'openai', model: 'gpt-4o' },
      temperature: 0.2
    },
    'summary': {
      preferredProvider: 'gemini',
      model: 'gemini-2.5-flash',
      temperature: 0.3
    },
    'structured': {
      preferredProvider: 'gemini',
      model: 'gemini-2.5-flash',
      temperature: 0.1
    },
    'creative': {
      preferredProvider: 'openai',
      model: 'gpt-4o',
      fallback: { provider: 'gemini', model: 'gemini-2.5-pro' },
      temperature: 0.9
    },
    'fast-response': {
      preferredProvider: 'gemini',
      model: 'gemini-2.0-flash-exp',
      fallback: { provider: 'ollama', model: 'llama3.2:3b' },
      temperature: 0.5
    },
    'bulk-processing': {
      preferredProvider: 'ollama',
      model: 'llama3.2:3b',
      temperature: 0.3
    }
  };

  /**
   * Görev tipine göre en uygun provider ve modeli seç
   */
  static async getOptimalConfig(context: AITaskContext): Promise<Partial<AIProviderConfig>> {
    const taskConfig = this.taskModelMap[context.taskType];
    
    // Kullanıcı tercihini al
    const userProvider = AIProviderService.getInstance().getProvider();
    
    // Eğer kullanıcı provider'ı mevcutsa ve task için uygunsa, onu kullan
    if (await this.isProviderAvailable(userProvider)) {
      return {
        provider: userProvider,
        temperature: taskConfig.temperature
      };
    }
    
    // Yoksa task-specific provider'a geç
    if (await this.isProviderAvailable(taskConfig.preferredProvider)) {
      return {
        provider: taskConfig.preferredProvider,
        model: taskConfig.model,
        temperature: taskConfig.temperature
      };
    }
    
    // Fallback varsa onu kullan
    if (taskConfig.fallback && await this.isProviderAvailable(taskConfig.fallback.provider)) {
      return {
        provider: taskConfig.fallback.provider,
        model: taskConfig.fallback.model,
        temperature: taskConfig.temperature
      };
    }
    
    // Son çare: ollama
    return {
      provider: 'ollama',
      model: 'llama3.2:3b',
      temperature: taskConfig.temperature
    };
  }
  
  private static async isProviderAvailable(provider: AIProvider): Promise<boolean> {
    try {
      const tempService = AIProviderService.getInstance({ provider, model: 'test' });
      return await tempService.isAvailable();
    } catch {
      return false;
    }
  }
  
  /**
   * Cost estimation (USD)
   */
  static estimateCost(taskType: AITaskType, tokenCount: number): number {
    const costs: Record<AIProvider, number> = {
      'gemini': 0,           // Free tier
      'openai': 0.0001,      // ~$0.10 per 1M tokens
      'ollama': 0            // Local, free
    };
    
    const config = this.taskModelMap[taskType];
    return costs[config.preferredProvider] * tokenCount;
  }
}
