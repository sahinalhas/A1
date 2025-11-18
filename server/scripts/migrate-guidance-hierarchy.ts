import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../..', 'data', 'database.db');

console.log('🔄 Migrating guidance category hierarchy...');
console.log(`📁 Database path: ${dbPath}`);

const db = new Database(dbPath);

try {
  const categories = db.prepare(`
    SELECT id, title, parent_id, level 
    FROM guidance_categories 
    WHERE id IN ('ind-d-dm', 'ind-d-dmv', 'ind-d-dmo')
  `).all();

  console.log('\n📊 Current state:');
  console.log(categories);

  if (categories.length === 0) {
    console.log('⚠️  Categories not found in database. Skipping migration.');
    db.close();
    process.exit(0);
  }

  const transaction = db.transaction(() => {
    const updateStmt = db.prepare(`
      UPDATE guidance_categories 
      SET parent_id = ?, level = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    updateStmt.run('ind-d-dm', 3, 'ind-d-dmv');
    console.log('✅ Updated ind-d-dmv: parent_id = ind-d-dm, level = 3');

    updateStmt.run('ind-d-dm', 3, 'ind-d-dmo');
    console.log('✅ Updated ind-d-dmo: parent_id = ind-d-dm, level = 3');
  });

  transaction();

  const updatedCategories = db.prepare(`
    SELECT id, title, parent_id, level 
    FROM guidance_categories 
    WHERE id IN ('ind-d-dm', 'ind-d-dmv', 'ind-d-dmo')
  `).all();

  console.log('\n📊 Updated state:');
  console.log(updatedCategories);

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
