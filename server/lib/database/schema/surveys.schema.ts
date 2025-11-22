import type Database from 'better-sqlite3';
import { DEFAULT_SURVEY_TEMPLATES } from '../../../../shared/data/default-risk-map-survey.js';
import { v4 as uuidv4 } from 'uuid';

export function createSurveysTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      isActive BOOLEAN DEFAULT TRUE,
      createdBy TEXT,
      tags TEXT,
      targetAudience TEXT DEFAULT 'STUDENT',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_questions (
      id TEXT PRIMARY KEY,
      templateId TEXT NOT NULL,
      questionText TEXT NOT NULL,
      questionType TEXT NOT NULL,
      required BOOLEAN DEFAULT FALSE,
      orderIndex INTEGER NOT NULL,
      options TEXT,
      validation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (templateId) REFERENCES survey_templates (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_distributions (
      id TEXT PRIMARY KEY,
      templateId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      targetClasses TEXT,
      targetStudents TEXT,
      distributionType TEXT NOT NULL,
      excelTemplate TEXT,
      publicLink TEXT,
      startDate TEXT,
      endDate TEXT,
      allowAnonymous BOOLEAN DEFAULT FALSE,
      maxResponses INTEGER,
      status TEXT DEFAULT 'DRAFT',
      createdBy TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (templateId) REFERENCES survey_templates (id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY,
      distributionId TEXT NOT NULL,
      studentId TEXT,
      studentInfo TEXT,
      responseData TEXT NOT NULL,
      submissionType TEXT NOT NULL,
      isComplete BOOLEAN DEFAULT FALSE,
      submittedAt DATETIME,
      ipAddress TEXT,
      userAgent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (distributionId) REFERENCES survey_distributions (id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      type TEXT NOT NULL,
      questions TEXT NOT NULL,
      responses TEXT,
      completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students (id) ON DELETE CASCADE
    );
  `);
}

export function seedSurveysDefaultTemplates(db: Database.Database): void {
  const templatesCount = db.prepare('SELECT COUNT(*) as count FROM survey_templates').get() as { count: number };
  
  if (templatesCount.count > 0) {
    return;
  }

  const insertTemplate = db.prepare(`
    INSERT INTO survey_templates (id, title, description, isActive, createdBy, tags, targetAudience, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO survey_questions (id, templateId, questionText, questionType, required, orderIndex, options, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const seedTransaction = db.transaction(() => {
    for (const surveyTemplate of DEFAULT_SURVEY_TEMPLATES) {
      insertTemplate.run(
        surveyTemplate.template.id,
        surveyTemplate.template.title,
        surveyTemplate.template.description,
        surveyTemplate.template.isActive ? 1 : 0,
        surveyTemplate.template.createdBy,
        JSON.stringify(surveyTemplate.template.tags),
        surveyTemplate.template.targetAudience
      );

      surveyTemplate.questions.forEach((question, index) => {
        insertQuestion.run(
          uuidv4(),
          surveyTemplate.template.id,
          question.questionText,
          question.questionType,
          question.required ? 1 : 0,
          index,
          question.options ? JSON.stringify(question.options) : null
        );
      });
    }
  });

  seedTransaction();
  
  console.log(`✅ Varsayılan anketler yüklendi: ${DEFAULT_SURVEY_TEMPLATES.length} anket`);
}
