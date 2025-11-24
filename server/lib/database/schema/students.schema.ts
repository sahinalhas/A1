import type Database from 'better-sqlite3';

export function createStudentsTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      birthDate TEXT,
      address TEXT,
      class TEXT,
      studentNumber TEXT,
      enrollmentDate TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      avatar TEXT,
      parentContact TEXT,
      notes TEXT,
      gender TEXT CHECK (gender IN ('K', 'E')) DEFAULT 'K',
      risk TEXT CHECK (risk IN ('Düşük', 'Orta', 'Yüksek')) DEFAULT 'Düşük',
      primaryLearningStyle TEXT,
      englishScore INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Migration: Add studentNumber column if it doesn't exist
  try {
    db.exec(`ALTER TABLE students ADD COLUMN studentNumber TEXT;`);
  } catch (err: any) {
    // Column already exists, ignore error
    if (!err.message?.includes('duplicate column')) {
      console.warn('Warning adding studentNumber column:', err.message);
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS student_documents (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      dataUrl TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      reason TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
