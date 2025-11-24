const { v4: uuidv4 } = require('uuid');
const db = require('better-sqlite3')('./data/database.db');

const distId = uuidv4();
const publicLink = uuidv4();

try {
  db.prepare(`
    INSERT INTO survey_distributions (
      id, templateId, title, description, targetClasses, targetStudents,
      distributionType, excelTemplate, publicLink, startDate, endDate,
      allowAnonymous, maxResponses, status, createdBy
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    distId,
    'coklu-zeka-2025',
    'Test Dağıtımı',
    'Test için oluşturuldu',
    JSON.stringify(['6B']),
    JSON.stringify([]),
    'ONLINE_LINK',
    null,
    publicLink,
    null,
    null,
    1,
    null,
    'ACTIVE',
    'System'
  );

  console.log('✅ Distribution created!');
  console.log(`\n📱 PUBLIC LINK TO TEST:`);
  console.log(`${publicLink}`);
  
} catch(e) {
  console.error('❌ Error:', e.message);
}

db.close();
