import getDatabase from '../lib/database.js';

function migrateWeeklySlots() {
  const db = getDatabase();
  
  try {
    console.log('🔄 Starting weekly_slots table migration...');
    
    // Check if old table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='weekly_slots'
    `).get();
    
    if (!tableExists) {
      console.log('✅ No existing weekly_slots table, nothing to migrate');
      return;
    }
    
    // Check if new schema already exists (has 'day' column)
    const hasNewSchema = db.prepare(`
      PRAGMA table_info(weekly_slots)
    `).all().some((col: any) => col.name === 'day');
    
    if (hasNewSchema) {
      console.log('✅ weekly_slots table already has new schema');
      return;
    }
    
    console.log('🔄 Backing up existing data...');
    
    // Create backup table
    db.exec(`
      CREATE TABLE IF NOT EXISTS weekly_slots_backup AS 
      SELECT * FROM weekly_slots
    `);
    
    console.log('🔄 Dropping old table...');
    db.exec('DROP TABLE IF EXISTS weekly_slots');
    
    console.log('🔄 Creating new table with correct schema...');
    db.exec(`
      CREATE TABLE weekly_slots (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        subjectId TEXT NOT NULL,
        day INTEGER NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
        FOREIGN KEY (subjectId) REFERENCES subjects (id) ON DELETE CASCADE
      )
    `);
    
    console.log('🔄 Migrating data from backup...');
    
    // Try to migrate data if backup has compatible columns
    try {
      db.exec(`
        INSERT INTO weekly_slots (id, studentId, subjectId, day, startTime, endTime, created_at)
        SELECT 
          id, 
          studentId, 
          subjectId, 
          dayOfWeek as day, 
          startTime, 
          startTime as endTime, 
          created_at
        FROM weekly_slots_backup
      `);
      console.log('✅ Data migrated successfully');
    } catch (error) {
      console.log('⚠️  Could not migrate old data (table structure too different)');
    }
    
    console.log('🔄 Cleaning up backup table...');
    db.exec('DROP TABLE IF EXISTS weekly_slots_backup');
    
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Try to restore from backup if it exists
    try {
      db.exec('DROP TABLE IF EXISTS weekly_slots');
      db.exec('ALTER TABLE weekly_slots_backup RENAME TO weekly_slots');
      console.log('✅ Restored from backup');
    } catch (restoreError) {
      console.error('❌ Could not restore from backup:', restoreError);
    }
  }
}

migrateWeeklySlots();
