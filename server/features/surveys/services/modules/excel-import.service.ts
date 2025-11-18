import XLSX from 'xlsx';
import * as distributionsRepo from '../../repository/distributions.repository.js';
import * as questionsRepo from '../../repository/questions.repository.js';
import * as responsesRepo from '../../repository/responses.repository.js';
import { SurveyResponse, SurveyQuestion } from '../../types/surveys.types.js';
import { sanitizeExcelData } from '../../../../utils/validators/sanitization.js';

export interface ExcelImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ExcelImportError[];
  importedResponses: Partial<SurveyResponse>[];
}

export interface ExcelImportError {
  row: number;
  studentId?: string;
  studentName?: string;
  error: string;
}

export async function importSurveyResponsesFromExcel(
  distributionId: string,
  fileBuffer: Buffer
): Promise<ExcelImportResult> {
  const errors: ExcelImportError[] = [];
  const validResponses: Partial<SurveyResponse>[] = [];
  let data: unknown[] = [];

  try {
    // Validate distribution exists
    const distribution = distributionsRepo.getSurveyDistribution(distributionId);
    if (!distribution) {
      throw new Error('Anket dağıtımı bulunamadı');
    }

    // Get questions for this distribution
    const questions = questionsRepo.getQuestionsByTemplate(distribution.templateId);
    if (!questions || questions.length === 0) {
      throw new Error('Anket soruları bulunamadı');
    }

    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

    // Find header row (skip instructions if present)
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (row && row.length > 0) {
        // Check if this row contains the student info header
        const firstCell = String(row[0] || '').trim();
        if (firstCell === 'Öğrenci No' || firstCell.includes('Öğrenci No')) {
          headerRowIndex = i;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Excel dosyasında başlık satırı bulunamadı. "Öğrenci No" içeren bir satır olmalıdır.');
    }

    if (headerRowIndex >= rawData.length - 1) {
      throw new Error('Excel dosyasında veri satırı bulunamadı');
    }

    const headers = rawData[headerRowIndex] as string[];
    const dataRows = rawData.slice(headerRowIndex + 1);

    // Build question map from headers
    const questionMap = buildQuestionMap(headers, questions);

    // First pass: validate all rows and collect valid responses
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex] as any[];
      const excelRow = headerRowIndex + rowIndex + 2;

      if (!row || row.length === 0 || !row[0]) {
        continue; // Skip empty rows
      }

      try {
        const responseData = parseResponseRow(row, headers, questionMap, questions);
        
        if (!responseData.studentInfo || !responseData.studentInfo.number) {
          errors.push({
            row: excelRow,
            error: 'Öğrenci numarası bulunamadı'
          });
          continue;
        }

        // Validate required questions
        const missingRequired = validateRequiredQuestions(responseData.responseData, questions);
        if (missingRequired.length > 0) {
          errors.push({
            row: excelRow,
            studentId: responseData.studentInfo.number,
            studentName: responseData.studentInfo.name,
            error: `Zorunlu sorular eksik: ${missingRequired.join(', ')}`
          });
          continue;
        }

        // Sanitize all data before saving
        const sanitizedStudentInfo = sanitizeExcelData(responseData.studentInfo);
        const sanitizedResponseData = sanitizeExcelData(responseData.responseData);

        // Prepare response for bulk save
        const response: Partial<SurveyResponse> = {
          id: `response_${distributionId}_${responseData.studentInfo.number}_${Date.now()}_${rowIndex}`,
          distributionId,
          studentId: responseData.studentInfo.number,
          studentInfo: sanitizedStudentInfo as any,
          responseData: sanitizedResponseData as any,
          submittedAt: new Date().toISOString(),
          submissionType: 'EXCEL_IMPORT',
          isComplete: true,
        };

        validResponses.push(response);

      } catch (rowError: any) {
        errors.push({
          row: excelRow,
          error: rowError.message || 'Satır işlenirken hata oluştu'
        });
      }
    }

    // Second pass: save all valid responses in a single transaction
    if (validResponses.length > 0) {
      try {
        responsesRepo.bulkSaveSurveyResponses(validResponses);
      } catch (saveError: any) {
        throw new Error(`Yanıtlar kaydedilirken hata oluştu: ${saveError.message}`);
      }
    }

    return {
      success: errors.length === 0,
      totalRows: dataRows.length,
      successCount: validResponses.length,
      errorCount: errors.length,
      errors,
      importedResponses: validResponses
    };

  } catch (error: any) {
    console.error('Error importing survey responses from Excel:', error);
    throw new Error(`Excel yükleme hatası: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function buildQuestionMap(headers: string[], questions: SurveyQuestion[]): Map<number, SurveyQuestion> {
  const questionMap = new Map<number, SurveyQuestion>();

  headers.forEach((header, colIndex) => {
    if (typeof header === 'string' && header.match(/^\d+\./)) {
      const questionMatch = header.match(/^(\d+)\./);
      if (questionMatch) {
        const questionNumber = parseInt(questionMatch[1]);
        const question = questions[questionNumber - 1];
        if (question) {
          questionMap.set(colIndex, question);
        }
      }
    }
  });

  return questionMap;
}

function parseResponseRow(
  row: unknown[],
  headers: string[],
  questionMap: Map<number, SurveyQuestion>,
  questions: SurveyQuestion[]
): { studentInfo: any; responseData: Record<string, any> } {
  const studentInfo: any = {};
  const responseData: Record<string, any> = {};

  headers.forEach((header, colIndex) => {
    const value = row[colIndex];
    if (!value && value !== 0) return;

    const headerStr = String(header);

    // Parse student info
    if (headerStr === 'Öğrenci No') {
      studentInfo.number = String(value).trim();
    } else if (headerStr === 'Ad') {
      studentInfo.firstName = String(value).trim();
    } else if (headerStr === 'Soyad') {
      studentInfo.lastName = String(value).trim();
    } else if (headerStr === 'Sınıf') {
      studentInfo.class = String(value).trim();
    } else if (headerStr === 'Cinsiyet') {
      studentInfo.gender = String(value).trim();
    }

    // Parse question responses
    const question = questionMap.get(colIndex);
    if (question) {
      responseData[question.id] = parseQuestionResponse(value, question);
    }
  });

  // Combine first and last name
  if (studentInfo.firstName && studentInfo.lastName) {
    studentInfo.name = `${studentInfo.firstName} ${studentInfo.lastName}`;
  } else if (studentInfo.firstName) {
    studentInfo.name = studentInfo.firstName;
  }

  return { studentInfo, responseData };
}

function parseQuestionResponse(value: any, question: SurveyQuestion): any {
  if (!value && value !== 0) return null;

  const strValue = String(value).trim();

  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
    case 'DROPDOWN':
      // Validate option exists
      if (question.options && !question.options.includes(strValue)) {
        throw new Error(`Geçersiz seçenek: "${strValue}" - İzin verilen: ${question.options.join(', ')}`);
      }
      return strValue;

    case 'YES_NO':
      const normalized = strValue.toLowerCase();
      if (normalized === 'evet' || normalized === 'yes' || normalized === 'e') {
        return 'evet';
      } else if (normalized === 'hayır' || normalized === 'hayir' || normalized === 'no' || normalized === 'h') {
        return 'hayir';
      }
      throw new Error(`Geçersiz evet/hayır cevabı: "${strValue}"`);

    case 'LIKERT':
      const likertValue = parseInt(strValue);
      if (isNaN(likertValue) || likertValue < 1 || likertValue > 5) {
        throw new Error(`Likert değeri 1-5 arasında olmalı: "${strValue}"`);
      }
      return `${likertValue} - ${getLikertLabel(likertValue)}`;

    case 'RATING':
      const ratingValue = parseInt(strValue);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
        throw new Error(`Puanlama değeri 1-10 arasında olmalı: "${strValue}"`);
      }
      return String(ratingValue);

    case 'OPEN_ENDED':
    default:
      return strValue;
  }
}

function getLikertLabel(value: number): string {
  const labels: Record<number, string> = {
    1: 'Kesinlikle Katılmıyorum',
    2: 'Katılmıyorum',
    3: 'Kararsızım',
    4: 'Katılıyorum',
    5: 'Kesinlikle Katılıyorum'
  };
  return labels[value] || '';
}

function validateRequiredQuestions(
  responseData: Record<string, any>,
  questions: SurveyQuestion[]
): string[] {
  const missing: string[] = [];

  questions.forEach((question, index) => {
    if (question.required) {
      const answer = responseData[question.id];
      if (!answer && answer !== 0) {
        missing.push(`Soru ${index + 1}`);
      }
    }
  });

  return missing;
}
