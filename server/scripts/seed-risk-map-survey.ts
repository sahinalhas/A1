import getDatabase from '../lib/database.js';

const riskFactors = [
  { category: 'Aile Eğitim Durumu', items: [
    'Anne en fazla ilkokul mezunu',
    'Baba en fazla ilkokul mezunu'
  ]},
  { category: 'Kardeş Durumu', items: [
    'Tek çocuk olan',
    '5 ve üstü kardeşi olan'
  ]},
  { category: 'Aile Yapısı', items: [
    'Anne ve babası ayrı yaşayan',
    'Anne ve babası boşanmış olan',
    'Yalnızca annesi ile yaşayan',
    'Yalnızca babası ile yaşayan',
    'Annesi hayatta olmayan',
    'Babası hayatta olmayan',
    'Anne ve babası hayatta olmayan',
    'Şehit Çocuğu'
  ]},
  { category: 'Bakım ve Yerleşim', items: [
    'Yalnızca büyükanne/büyükbabasıyla yaşayan',
    'Yalnızca diğer akrabalarıyla yaşayan',
    'Koruyucu aile gözetiminde olan',
    'Sevgi Evlerinde kalan',
    'Sosyal Hizmetler Çocuk Esirgeme Kurumunda kalan'
  ]},
  { category: 'Ailede Sağlık Sorunları', items: [
    'Ailesinde süreğen hastalığı olan',
    'Ailesinde ruhsal hastalığı olan',
    'Ailesinde bağımlı bireyler bulunan (alkol/madde)'
  ]},
  { category: 'Aile Hukuki ve Sosyal Durumu', items: [
    'Ailesinde cezai hükmü bulunan',
    'Ailesi mevsimlik işçi olan',
    'Aile içi şiddete maruz kalan'
  ]},
  { category: 'Öğrenci Özel Durumları', items: [
    'Özel yetenekli tanısı olan',
    'Yetersizlik alanında özel eğitim raporu olan'
  ]},
  { category: 'Öğrenci Sağlık Durumu', items: [
    'Süreğen hastalığı olan',
    'Ruhsal hastalığı olan'
  ]},
  { category: 'Yasal Tedbirler', items: [
    'Danışmanlık tedbir kararı olan',
    'Eğitim tedbir kararı olan'
  ]},
  { category: 'Sosyo-Ekonomik ve Akademik Durum', items: [
    'Maddi sıkıntı yaşayan',
    'Sürekli devamsız olan',
    'Bir işte çalışan',
    'Akademik başarısı düşük',
    'Riskli akran grubuna dahil olan'
  ]},
  { category: 'Diğer', items: [
    'Diğer (açıklama gerektirir)'
  ]}
];

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
    
    riskFactors.forEach((category) => {
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
    console.log(`  - Kategoriler: ${riskFactors.length}`);
    
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
