import { AIProviderService } from '../../../services/ai-provider.service.js';
import { logger } from '../../../utils/logger.js';
import type { GeneratedTipContent, GuidanceTipCategory, GuidanceTipImportance } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';

const GUIDANCE_TOPICS = [
  'Öğrenciyle güven ilişkisi kurma teknikleri',
  'Aktif dinleme becerileri',
  'Empatik yaklaşım yöntemleri',
  'Kariyer danışmanlığında Holland modeli',
  'Öğrenci motivasyonunu artırma stratejileri',
  'Veli görüşmelerinde etkili iletişim',
  'Kriz anında müdahale protokolleri',
  'Zorbalık vakalarıyla başa çıkma',
  'Sınav kaygısı ile mücadele yöntemleri',
  'Özgüven geliştirme çalışmaları',
  'Sosyal beceri eğitimi teknikleri',
  'Çatışma çözme becerileri',
  'Grup rehberliği etkinlikleri',
  'Bireysel görüşme teknikleri',
  'MEB rehberlik programı uygulama',
  'Öğrenci tanıma teknikleri',
  'Risk altındaki öğrencileri belirleme',
  'Akademik başarısızlık nedenleri analizi',
  'Aile içi sorunlara yaklaşım',
  'Öğrenme güçlüklerine müdahale',
  'Dikkat eksikliği olan öğrencilerle çalışma',
  'Üstün yetenekli öğrencilere rehberlik',
  'Kaynaştırma öğrencileriyle çalışma',
  'Ergenlikteki değişimleri anlama',
  'Dijital bağımlılık ile mücadele',
  'Sosyal medya kullanımı rehberliği',
  'Stres yönetimi teknikleri',
  'Zaman yönetimi becerileri',
  'Hedef belirleme çalışmaları',
  'Öz-değerlendirme uygulamaları'
];

export class GuidanceTipsAIService {
  private aiService: AIProviderService;

  constructor() {
    this.aiService = AIProviderService.getInstance();
  }

  async generateRandomTip(): Promise<GeneratedTipContent | null> {
    try {
      const randomTopic = GUIDANCE_TOPICS[Math.floor(Math.random() * GUIDANCE_TOPICS.length)];
      const randomCategory = this.getRandomCategory();

      const prompt = this.buildPrompt(randomTopic, randomCategory);

      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: `Sen deneyimli bir rehber öğretmen eğitmenisin. Türkiye'deki okul rehberlik servisleri için profesyonel bilgiler üretiyorsun. 
Cevaplarını her zaman Türkçe ver. Pratik, uygulanabilir ve güncel bilgiler sun.
JSON formatında yanıt ver: {"title": "string", "content": "string", "importance": "NORMAL|YUKSEK|KRITIK"}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        format: 'json'
      });

      const parsed = this.parseAIResponse(response, randomCategory);
      
      if (parsed) {
        logger.info(`Generated guidance tip: ${parsed.title}`, 'GuidanceTipsAI');
        return parsed;
      }

      logger.warn('AI response parsing failed, using fallback tip', 'GuidanceTipsAI');
      return this.getFallbackTip();
    } catch (error) {
      logger.error('Failed to generate guidance tip, using fallback', 'GuidanceTipsAI', error);
      return this.getFallbackTip();
    }
  }

  private buildPrompt(topic: string, category: GuidanceTipCategory): string {
    const categoryInfo = GUIDANCE_TIP_CATEGORIES.find(c => c.value === category);
    
    return `"${topic}" konusunda rehber öğretmenler için kısa ve öz bir bilgi/ipucu oluştur.

Kategori: ${categoryInfo?.label || 'Genel'}

Kurallar:
1. Başlık maksimum 60 karakter olmalı
2. İçerik 150-300 kelime arasında olmalı
3. Pratik ve hemen uygulanabilir bilgi olmalı
4. Türk eğitim sistemine uygun olmalı
5. Bilimsel kaynaklara dayalı olmalı

JSON formatında yanıt ver:
{
  "title": "Kısa ve çarpıcı başlık",
  "content": "Detaylı açıklama ve uygulama önerileri",
  "importance": "NORMAL" // veya "YUKSEK" veya "KRITIK"
}`;
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

  private getFallbackTip(): GeneratedTipContent {
    const fallbackTips: GeneratedTipContent[] = [
      {
        title: 'Aktif Dinleme: Öğrenciyi Gerçekten Anlayın',
        content: 'Aktif dinleme, öğrenciyle güven ilişkisi kurmanın temel taşıdır. Görüşme sırasında göz teması kurun, öğrencinin sözünü kesmeyin ve söylediklerini kendi kelimelerinizle özetleyerek anladığınızı gösterin. "Yani sen... hissediyorsun" gibi yansıtma cümleleri kullanın. Bu teknik, öğrencinin kendini değerli hissetmesini sağlar.',
        category: 'PSIKOLOJIK_DANISMANLIK',
        importance: 'YUKSEK'
      },
      {
        title: 'Sınav Kaygısı ile Mücadelede 4-7-8 Nefes Tekniği',
        content: 'Öğrencilerinize sınav öncesi kaygıyı azaltmak için 4-7-8 nefes tekniğini öğretin: 4 saniye burundan nefes alın, 7 saniye tutun, 8 saniye ağızdan yavaşça verin. Bu teknik parasempatik sinir sistemini aktive ederek sakinleşmeyi sağlar. Sınav öncesi 3-4 kez tekrarlanması yeterlidir.',
        category: 'MOTIVASYON',
        importance: 'NORMAL'
      },
      {
        title: 'Veli Görüşmesinde İlk 3 Dakika Kuralı',
        content: 'Veli görüşmelerinde ilk 3 dakika kritik önem taşır. Bu sürede veliyi sıcak bir şekilde karşılayın, görüşmenin amacını net olarak belirtin ve olumlu bir gözlemle başlayın. "Ahmet matematik dersinde çok güzel sorular soruyor" gibi pozitif bir başlangıç, görüşmenin tonunu belirler ve velinin savunmaya geçmesini engeller.',
        category: 'VELI_GORUSMESI',
        importance: 'NORMAL'
      }
    ];

    return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
  }
}

export const guidanceTipsAIService = new GuidanceTipsAIService();
