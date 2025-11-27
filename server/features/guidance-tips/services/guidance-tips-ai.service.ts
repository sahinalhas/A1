import { AIProviderService } from '../../../services/ai-provider.service.js';
import { logger } from '../../../utils/logger.js';
import type { GeneratedTipContent, GuidanceTipCategory, GuidanceTipImportance } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';

export class GuidanceTipsAIService {
  private aiService: AIProviderService;

  constructor() {
    this.aiService = AIProviderService.getInstance();
  }

  async generateRandomTip(): Promise<GeneratedTipContent | null> {
    try {
      const randomCategory = this.getRandomCategory();
      const categoryInfo = GUIDANCE_TIP_CATEGORIES.find(c => c.value === randomCategory);

      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: `Sen 20 yıllık deneyime sahip uzman bir rehber öğretmen ve eğitimcisin. Türkiye'deki okullarda çalışan rehber öğretmenlere mesleki gelişimleri için kısa, pratik ve değerli bilgiler sunuyorsun.

Görevin: Rehber öğretmenlere günlük işlerinde faydalı olacak rastgele bir profesyonel ipucu veya bilgi üretmek.

Bilgi üretirken şu konulardan herhangi birini seçebilirsin:
- Öğrenci görüşme teknikleri
- Veli iletişimi
- Kriz müdahalesi
- Kariyer danışmanlığı
- Psikolojik destek yöntemleri
- Sınıf içi rehberlik
- Ergen psikolojisi
- Motivasyon teknikleri
- Akademik başarı desteği
- Sosyal-duygusal gelişim
- Özel eğitim yaklaşımları
- Mesleki etik
- Zaman yönetimi
- Stres yönetimi

Cevabını her zaman Türkçe ver.
JSON formatında yanıt ver: {"title": "string", "content": "string", "importance": "NORMAL|YUKSEK|KRITIK"}`
          },
          {
            role: 'user',
            content: `"${categoryInfo?.label || 'Genel Rehberlik'}" kategorisinde rehber öğretmenler için kısa ve öz bir profesyonel bilgi/ipucu oluştur.

Kurallar:
1. Başlık kısa ve çarpıcı olmalı (maksimum 60 karakter)
2. İçerik 100-200 kelime arasında olmalı
3. Pratik ve hemen uygulanabilir bilgi olmalı
4. Bilimsel veya deneyime dayalı olmalı
5. Türk eğitim sistemine uygun olmalı

JSON formatında yanıt ver:
{
  "title": "Kısa başlık",
  "content": "Detaylı açıklama ve pratik öneriler",
  "importance": "NORMAL"
}`
          }
        ],
        temperature: 0.9,
        format: 'json'
      });

      const parsed = this.parseAIResponse(response, randomCategory);
      
      if (parsed) {
        logger.info(`AI generated guidance tip: ${parsed.title}`, 'GuidanceTipsAI');
        return parsed;
      }

      logger.warn('AI response parsing failed', 'GuidanceTipsAI');
      return null;
    } catch (error) {
      logger.error('Failed to generate guidance tip from AI', 'GuidanceTipsAI', error);
      return null;
    }
  }

  private parseAIResponse(response: string, category: GuidanceTipCategory): GeneratedTipContent | null {
    try {
      let jsonStr = response;
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.title || !parsed.content) {
        return null;
      }

      const importance = ['DUSUK', 'NORMAL', 'YUKSEK', 'KRITIK'].includes(parsed.importance) 
        ? parsed.importance as GuidanceTipImportance
        : 'NORMAL';

      return {
        title: String(parsed.title).slice(0, 200),
        content: String(parsed.content),
        category,
        importance
      };
    } catch (error) {
      logger.error('Failed to parse AI response', 'GuidanceTipsAI', error);
      return null;
    }
  }

  private getRandomCategory(): GuidanceTipCategory {
    const categories: GuidanceTipCategory[] = [
      'PSIKOLOJIK_DANISMANLIK',
      'KARIYER_REHBERLIGI',
      'OGRENCI_ILETISIMI',
      'VELI_GORUSMESI',
      'KRIZ_YONETIMI',
      'MOTIVASYON',
      'SINIF_YONETIMI',
      'TEKNIK_BILGI',
      'GENEL'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  }
}

export const guidanceTipsAIService = new GuidanceTipsAIService();
