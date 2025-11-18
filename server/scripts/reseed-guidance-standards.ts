import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createGuidanceStandardsTables, seedGuidanceStandards } from '../lib/database/schema/guidance-standards.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const rootDir = path.join(__dirname, '../..');
  const dbPath = path.join(rootDir, 'data', 'database.db');
  
  console.log(`📂 Opening database: ${dbPath}`);
  const db = new Database(dbPath);
  
  console.log('🗑️  Dropping existing guidance tables...');
  try {
    db.prepare('DROP TABLE IF EXISTS guidance_items').run();
    db.prepare('DROP TABLE IF EXISTS guidance_categories').run();
  } catch (error) {
    console.log('   Error dropping tables:', error);
  }
  
  console.log('📝 Creating guidance tables...');
  createGuidanceStandardsTables(db);
  
  console.log('✨ Seeding with new guidance standards...');
  seedGuidanceStandards(db);
  
  const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM guidance_categories').get() as { count: number };
  const itemsCount = db.prepare('SELECT COUNT(*) as count FROM guidance_items').get() as { count: number };
  
  console.log(`✅ Reseed complete!`);
  console.log(`   Categories: ${categoriesCount.count}`);
  console.log(`   Items: ${itemsCount.count}`);
  
  db.close();
}

main().catch(console.error);
