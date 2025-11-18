/**
 * App Settings Service
 * Uygulama ayarlarını yönetir
 */

import getDatabase from '../lib/database.js';
import { logger } from '../utils/logger.js';
import {
  AppSettingsSchema,
  type AppSettings,
  type AIProviderConfig,
  safeJsonParse,
  validateWithSchema,
} from '../schemas/app-settings.schema.js';

export class AppSettingsService {
  private static getDefaultSettings(): AppSettings {
    return {
      aiProvider: {
        provider: process.env.GEMINI_API_KEY ? 'gemini' : 'ollama',
        model: process.env.GEMINI_API_KEY ? 'gemini-2.5-flash' : 'llama3.2:3b',
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      }
    };
  }

  static getSettings(): AppSettings {
    const db = getDatabase();
    
    try {
      const row = db.prepare('SELECT settings FROM app_settings WHERE id = 1').get() as { settings: string } | undefined;
      
      if (!row) {
        const defaults = this.getDefaultSettings();
        this.saveSettings(defaults);
        return defaults;
      }
      
      return safeJsonParse(
        AppSettingsSchema,
        row.settings,
        this.getDefaultSettings(),
        'app_settings'
      );
    } catch (error) {
      logger.error('Failed to get app settings', 'AppSettingsService', error);
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings: AppSettings): void {
    const db = getDatabase();
    
    try {
      // Validate settings before saving
      const validatedSettings = validateWithSchema(
        AppSettingsSchema,
        settings,
        'app_settings'
      );
      
      const settingsJson = JSON.stringify(validatedSettings);
      
      db.prepare(`
        INSERT INTO app_settings (id, settings, updated_at)
        VALUES (1, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          settings = excluded.settings,
          updated_at = CURRENT_TIMESTAMP
      `).run(settingsJson);
    } catch (error) {
      logger.error('Failed to save app settings', 'AppSettingsService', error);
      throw new Error('Failed to save settings');
    }
  }

  static getAIProvider(): AIProviderConfig | undefined {
    const settings = this.getSettings();
    let result = settings.aiProvider || this.getDefaultSettings().aiProvider;
    
    // Check if saved provider requires an API key that's missing
    if (result?.provider === 'gemini') {
      const hasGeminiKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
      if (!hasGeminiKey) {
        console.warn('⚠️ Gemini provider selected but API key not configured, falling back to Ollama');
        result.provider = 'ollama';
        result.model = 'llama3.2:3b';
        this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
      }
    }
    
    if (result?.provider === 'openai') {
      const hasOpenAIKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
      if (!hasOpenAIKey) {
        console.warn('⚠️ OpenAI provider selected but API key not configured, falling back to Ollama');
        result.provider = 'ollama';
        result.model = 'llama3.2:3b';
        this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
      }
    }
    
    // Auto-migrate deprecated Gemini models to current version
    if (result?.model === 'gemini-1.5-flash' || result?.model === 'gemini-1.5-pro') {
      console.log('🔄 Auto-migrating deprecated Gemini model:', result.model, '→ gemini-2.5-flash');
      result.model = 'gemini-2.5-flash';
      this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
    }
    
    // Auto-migrate deprecated Ollama 'llama3' to 'llama3.2:3b'
    if (result?.provider === 'ollama' && result?.model === 'llama3') {
      console.log('🔄 Auto-migrating deprecated Ollama model:', result.model, '→ llama3.2:3b');
      result.model = 'llama3.2:3b';
      this.saveAIProvider(result.provider, result.model, result.ollamaBaseUrl);
    }
    
    return result;
  }

  static saveAIProvider(provider: string, model: string, ollamaBaseUrl?: string): void {
    const settings = this.getSettings();
    
    const aiProviderConfig: AIProviderConfig = {
      provider: provider as 'openai' | 'ollama' | 'gemini',
      model,
      ...(ollamaBaseUrl && { ollamaBaseUrl })
    };
    
    settings.aiProvider = aiProviderConfig;
    this.saveSettings(settings);
  }
}
