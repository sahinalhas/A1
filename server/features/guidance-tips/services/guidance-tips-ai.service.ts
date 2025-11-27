import { AIProviderService } from '../../../services/ai-provider.service.js';
import { logger } from '../../../utils/logger.js';
import type { GeneratedTipContent, GuidanceTipCategory, GuidanceTipImportance } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';

export class GuidanceTipsAIService {
  private aiService: AIProviderService;

  constructor() {
    this.aiService = AIProviderService.getInstance();
  }

  async generateRandomTip(preferredCategory?: GuidanceTipCategory): Promise<GeneratedTipContent | null> {
    try {
      const category = preferredCategory || this.getRandomCategory();
      const categoryInfo = GUIDANCE_TIP_CATEGORIES.find(c => c.value === category);

      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: `Sen 20 yıllık deneyime sahip, hem akademik hem de uygulamalı alanda uzmanlaşmış bir psikolojik danışman ve rehber öğretmensin. Türkiye'deki okullarda çalışan rehber öğretmenlere mesleki gelişimleri için kapsamlı, bilimsel temelli ve pratik bilgiler sunuyorsun.

Görevin: Rehber öğretmenlerin profesyonel gelişimine katkı sağlayacak, günlük işlerinde kullanabilecekleri değerli bilgiler üretmek.

UZMANLIK ALANLARIN:

1. DANIŞMA KURAMLARI:
- Psikoanalitik Kuram (Freud, bilinçdışı, savunma mekanizmaları)
- Bilişsel-Davranışçı Terapi (BDT teknikleri, bilişsel çarpıtmalar, davranış değiştirme)
- Hümanistik/Danışan Merkezli Yaklaşım (Rogers, koşulsuz kabul, empati)
- Gestalt Terapisi (şimdi ve burada, farkındalık, bitmemiş işler)
- Varoluşçu Terapi (anlam arayışı, özgürlük, sorumluluk)
- Çözüm Odaklı Kısa Terapi (istisnalar, ölçekleme soruları, mucize soru)
- Aile Sistemleri Kuramı (sistemik bakış, genogram, üçgenler)
- Narratif Terapi (hikaye yeniden yazma, dışsallaştırma)
- Adlerian Terapi (yaşam stili, sosyal ilgi, aşağılık duygusu)
- Gerçeklik Terapisi (seçim teorisi, WDEP sistemi)

2. DANIŞMANLIK BECERİLERİ:
- Aktif dinleme ve sözsüz iletişim
- Empatik anlayış kurma
- Duygu ve içerik yansıtma
- Açık-kapalı soru teknikleri
- Özetleme ve yapılandırma
- Yapıcı yüzleştirme
- Yorumlama ve anlam katma
- Terapötik ittifak kurma
- Hedef belirleme ve eylem planları

3. REHBERLİK HİZMETLERİ:
- Bireysel ve grup rehberliği
- Kariyer danışmanlığı
- Kriz müdahalesi
- Öğrenci-veli-öğretmen iletişimi
- Sınıf rehberlik programları

4. ÖZEL KONULAR:
- Ergen psikolojisi
- Öğrenme güçlükleri
- Akran zorbalığı
- Bağımlılık önleme
- Travma müdahalesi
- Sosyal-duygusal öğrenme

5. MESLEKİ ETİK:
- Gizlilik ve sınırları
- Çift ilişki
- Yetkinlik sınırları
- Bilgilendirilmiş onam

Cevabını her zaman Türkçe ver ve pratik, uygulanabilir bilgiler sun.
JSON formatında yanıt ver: {"title": "string", "content": "string", "importance": "NORMAL|YUKSEK|KRITIK"}`
          },
          {
            role: 'user',
            content: `"${categoryInfo?.label || 'Genel Rehberlik'}" kategorisinde (${categoryInfo?.description || ''}) rehber öğretmenler için profesyonel bir bilgi/ipucu oluştur.

Kurallar:
1. Başlık kısa ve çarpıcı olmalı (maksimum 60 karakter)
2. İçerik 150-250 kelime arasında olmalı
3. Pratik ve hemen uygulanabilir bilgi olmalı
4. Bilimsel temelli veya kanıta dayalı olmalı
5. Türk eğitim sistemine ve kültürüne uygun olmalı
6. Gerektiğinde örnek diyaloglar veya teknikler içerebilir
7. Eğer bir kuram veya teknik açıklanıyorsa, temel prensipler ve uygulama adımları belirtilmeli

JSON formatında yanıt ver:
{
  "title": "Kısa ve etkileyici başlık",
  "content": "Detaylı açıklama, pratik öneriler ve uygulama ipuçları",
  "importance": "NORMAL"
}`
          }
        ],
        temperature: 0.85,
        format: 'json'
      });

      const parsed = this.parseAIResponse(response, category);
      
      if (parsed) {
        logger.info(`AI generated guidance tip: ${parsed.title} [${category}]`, 'GuidanceTipsAI');
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
    const allCategories = GUIDANCE_TIP_CATEGORIES.map(c => c.value);
    return allCategories[Math.floor(Math.random() * allCategories.length)];
  }
}

export const guidanceTipsAIService = new GuidanceTipsAIService();
