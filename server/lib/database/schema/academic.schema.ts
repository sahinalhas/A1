import type Database from 'better-sqlite3';

export function createAcademicTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT NOT NULL,
      semester TEXT NOT NULL,
      gpa REAL,
      year INTEGER,
      exams TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS interventions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Planlandı', 'Devam', 'Tamamlandı')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      color TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      difficulty TEXT,
      estimatedHours INTEGER DEFAULT 1,
      avgMinutes INTEGER,
      "order" INTEGER,
      energyLevel TEXT,
      difficultyScore INTEGER,
      priority INTEGER,
      deadline TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subjectId) REFERENCES subjects (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      remaining INTEGER DEFAULT 0,
      lastStudied DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE,
      UNIQUE(studentId, topicId)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS academic_goals (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      targetScore REAL,
      currentScore REAL,
      examType TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      startTime DATETIME NOT NULL,
      endTime DATETIME,
      duration INTEGER,
      notes TEXT,
      efficiency REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS study_assignments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      topicId TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      examType TEXT NOT NULL CHECK (examType IN ('LGS', 'YKS', 'TYT', 'AYT', 'YDT', 'DENEME', 'KONU_TARAMA', 'DİĞER')),
      examName TEXT NOT NULL,
      examDate TEXT NOT NULL,
      examProvider TEXT,
      totalScore REAL,
      percentileRank REAL,
      turkishScore REAL,
      mathScore REAL,
      scienceScore REAL,
      socialScore REAL,
      foreignLanguageScore REAL,
      englishScore REAL,
      religionScore REAL,
      physicalEducationScore REAL,
      turkishNet REAL,
      mathNet REAL,
      scienceNet REAL,
      socialNet REAL,
      foreignLanguageNet REAL,
      totalNet REAL,
      correctAnswers INTEGER,
      wrongAnswers INTEGER,
      emptyAnswers INTEGER,
      totalQuestions INTEGER,
      subjectBreakdown TEXT,
      topicAnalysis TEXT,
      strengthAreas TEXT,
      weaknessAreas TEXT,
      improvementSuggestions TEXT,
      comparedToGoal TEXT,
      comparedToPrevious TEXT,
      comparedToClassAverage REAL,
      schoolRank INTEGER,
      classRank INTEGER,
      isOfficial BOOLEAN DEFAULT FALSE,
      certificateUrl TEXT,
      answerKeyUrl TEXT,
      detailedReportUrl TEXT,
      goalsMet BOOLEAN DEFAULT FALSE,
      parentNotified BOOLEAN DEFAULT FALSE,
      counselorNotes TEXT,
      actionPlan TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS behavior_incidents (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      incidentDate TEXT NOT NULL,
      incidentTime TEXT NOT NULL,
      location TEXT NOT NULL,
      behaviorType TEXT NOT NULL,
      behaviorCategory TEXT NOT NULL,
      description TEXT NOT NULL,
      antecedent TEXT,
      consequence TEXT,
      duration INTEGER,
      intensity TEXT,
      frequency TEXT,
      witnessedBy TEXT,
      othersInvolved TEXT,
      interventionUsed TEXT,
      interventionEffectiveness TEXT,
      parentNotified BOOLEAN DEFAULT FALSE,
      parentNotificationMethod TEXT,
      parentResponse TEXT,
      followUpRequired BOOLEAN DEFAULT FALSE,
      followUpDate TEXT,
      followUpNotes TEXT,
      adminNotified BOOLEAN DEFAULT FALSE,
      consequenceGiven TEXT,
      supportProvided TEXT,
      triggerAnalysis TEXT,
      patternNotes TEXT,
      positiveAlternative TEXT,
      status TEXT NOT NULL DEFAULT 'Açık',
      recordedBy TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}
