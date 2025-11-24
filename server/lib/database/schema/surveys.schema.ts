import type Database from 'better-sqlite3';
import { DEFAULT_SURVEY_TEMPLATES } from '../../../../shared/data/default-risk-map-survey.js';
import { DEFAULT_SURVEY_TEMPLATES_LIFE_WINDOW } from '../../../../shared/data/default-life-window-survey.js';
import { DEFAULT_SURVEY_TEMPLATES_EXAM_ANXIETY } from '../../../../shared/data/default-exam-anxiety-survey.js';
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
  const checkTemplate = db.prepare('SELECT id FROM survey_templates WHERE id = ?');
  
  const upsertTemplate = db.prepare(`
    INSERT INTO survey_templates (id, title, description, isActive, createdBy, tags, targetAudience, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      isActive = excluded.isActive,
      tags = excluded.tags,
      targetAudience = excluded.targetAudience,
      updated_at = datetime('now')
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO survey_questions (id, templateId, questionText, questionType, required, orderIndex, options, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      questionText = excluded.questionText,
      questionType = excluded.questionType,
      required = excluded.required,
      orderIndex = excluded.orderIndex,
      options = excluded.options
  `);

  let seededCount = 0;
  
  const allSurveyTemplates = [
    ...DEFAULT_SURVEY_TEMPLATES,
    ...DEFAULT_SURVEY_TEMPLATES_LIFE_WINDOW,
    ...DEFAULT_SURVEY_TEMPLATES_EXAM_ANXIETY
  ];
  
  const seedTransaction = db.transaction(() => {
    for (const surveyTemplate of allSurveyTemplates) {
      const templateExists = checkTemplate.get(surveyTemplate.template.id);
      
      upsertTemplate.run(
        surveyTemplate.template.id,
        surveyTemplate.template.title,
        surveyTemplate.template.description,
        surveyTemplate.template.isActive ? 1 : 0,
        surveyTemplate.template.createdBy,
        JSON.stringify(surveyTemplate.template.tags),
        surveyTemplate.template.targetAudience
      );

      if (!templateExists) {
        seededCount++;
      }

      surveyTemplate.questions.forEach((question, index) => {
        const questionId = question.id || `${surveyTemplate.template.id}-q-${index}`;
        
        insertQuestion.run(
          questionId,
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
  
  if (seededCount > 0) {
    console.log(`✅ Varsayılan anketler yüklendi: ${seededCount} yeni anket`);
  }
}
