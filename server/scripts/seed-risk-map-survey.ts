import getDatabase from '../lib/database.js';
import { DEFAULT_RISK_FACTORS } from '../../shared/data/default-risk-factors.js';

async function seedRiskMapSurvey() {
  const db = getDatabase();
  
  const templateId = 'sinif-risk-haritasi-2025';
  
  console.log('🌱 Sınıf Risk Haritası anketi ekleniyor...');
  
  try {
    const existingTemplate = db.prepare('SELECT id FROM survey_templates WHERE id = ?').get(templateId);
    
    if (existingTemplate) {
      console.log('⚠️  Anket zaten mevcut, siliniyor...');
      db.prepare('DELETE FROM survey_questions WHERE templateId = ?').run(templateId);
      db.prepare('DELETE FROM survey_templates WHERE id = ?').run(templateId);
    }
    
    const insertTemplate = db.prepare(`
      INSERT INTO survey_templates (
        id, title, description, targetAudience, tags, createdBy, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    insertTemplate.run(
      templateId,
      'Sınıf Risk Haritası',
      'Öğrencilerin risk faktörlerini değerlendirmek için kullanılan kapsamlı risk haritası anketi. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      'STUDENT',
      JSON.stringify(['Risk Değerlendirme', 'Rehberlik', 'MEB', 'Öğrenci Takip', 'Koruma']),
      'Sistem'
    );
    
    console.log('✅ Anket şablonu oluşturuldu');
    
    const insertQuestion = db.prepare(`
      INSERT INTO survey_questions (
        id, templateId, questionText, questionType, required, orderIndex, options, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    let orderIndex = 0;
    
    DEFAULT_RISK_FACTORS.forEach((category) => {
      category.items.forEach((item) => {
        const questionId = `risk-${templateId}-q${orderIndex + 1}`;
        
        insertQuestion.run(
          questionId,
          templateId,
          item,
          'YES_NO',
          0,
          orderIndex,
          JSON.stringify(['Evet', 'Hayır'])
        );
        
        orderIndex++;
      });
    });
    
    console.log(`✅ ${orderIndex} risk faktörü sorusu eklendi`);
    console.log('🎉 Sınıf Risk Haritası anketi başarıyla eklendi!');
    console.log('\nAnket Detayları:');
    console.log(`  - Anket ID: ${templateId}`);
    console.log(`  - Toplam Soru: ${orderIndex}`);
    console.log(`  - Kategoriler: ${DEFAULT_RISK_FACTORS.length}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  }
}

seedRiskMapSurvey()
  .then(() => {
    console.log('\n✨ İşlem tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Kritik hata:', error);
    process.exit(1);
  });
