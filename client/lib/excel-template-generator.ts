import * as XLSX from 'xlsx';
import { SurveyTemplate, SurveyQuestion, ExcelTemplateConfig } from './survey-types';
import { Student } from './storage';

export interface ExcelTemplateOptions {
  survey: SurveyTemplate;
  questions: SurveyQuestion[];
  students: Student[];
  config: ExcelTemplateConfig;
  distributionTitle?: string;
}

export function generateExcelTemplate({
  survey,
  questions,
  students,
  config,
  distributionTitle
}: ExcelTemplateOptions): string {
  const workbook = XLSX.utils.book_new();

  if (config.responseFormat === 'single_sheet') {
    generateSingleSheetTemplate(workbook, survey, questions, students, config, distributionTitle);
  } else {
    generateMultiSheetTemplate(workbook, survey, questions, students, config, distributionTitle);
  }

  // Convert to base64
  try {
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: true,
      codepage: 65001
    });
    const uint8Array = new Uint8Array(excelBuffer);
    let binaryString = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binaryString);
  } catch (excelError) {
    console.error('Error generating Excel file:', excelError);
    throw new Error('Excel dosyası oluşturulurken hata oluştu');
  }
}

function generateSingleSheetTemplate(
  workbook: XLSX.WorkBook,
  survey: SurveyTemplate,
  questions: SurveyQuestion[],
  students: Student[],
  config: ExcelTemplateConfig,
  distributionTitle?: string
) {
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  
  let currentRow = 0;
  
  // Header information
  if (config.includeInstructions) {
    const headerData = [
      [`ANKET: ${distributionTitle || survey.title}`],
      [`Açıklama: ${survey.description || ''}`],
      [`Tahmini Süre: ${survey.estimatedDuration || 0} dakika`],
      [`MEB Uyumlu: ${survey.mebCompliant ? 'Evet' : 'Hayır'}`],
      [''],
      ['DOLDURMA TALİMATLARI:'],
      ['1. Her satır bir öğrenci için ayrılmıştır'],
      ['2. Öğrenci bilgilerini doğru girdiğinizden emin olun'],
      ['3. Soruları öğrenci başına tek tek cevaplayın'],
      ['4. Zorunlu sorular (*) işaretiyle belirtilmiştir'],
      ['5. Dosyayı değiştirdikten sonra kaydedin ve sisteme yükleyin'],
      [''],
    ];
    
    headerData.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: `A${currentRow + 1}` });
      currentRow++;
    });
  }
  
  // Column headers
  const headers = [];
  
  if (config.includeStudentInfo) {
    headers.push('Öğrenci No', 'Ad', 'Soyad', 'Sınıf', 'Cinsiyet');
  }
  
  if (config.customHeaders?.length) {
    headers.push(...config.customHeaders);
  }
  
  // Add question headers
  questions.forEach((question, index) => {
    const questionHeader = `${index + 1}. ${question.questionText}${question.required ? ' *' : ''}`;
    headers.push(questionHeader);
    
    // Add note about question type and options
    if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
      headers.push(`${index + 1}_SEÇENEKLER: [${question.options.join(' | ')}]`);
    } else if (question.questionType === 'LIKERT') {
      headers.push(`${index + 1}_ÖLÇEK: [1=Kesinlikle Katılmıyorum, 2=Katılmıyorum, 3=Kararsızım, 4=Katılıyorum, 5=Kesinlikle Katılıyorum]`);
    } else if (question.questionType === 'RATING') {
      headers.push(`${index + 1}_PUANLAMA: [1-10 arası puan verin]`);
    } else if (question.questionType === 'YES_NO') {
      headers.push(`${index + 1}_CEVAP: [Evet | Hayır]`);
    }
  });
  
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: `A${currentRow + 1}` });
  currentRow++;
  
  // Student rows
  students.forEach((student) => {
    const studentRow = [];
    
    if (config.includeStudentInfo) {
      studentRow.push(
        student.id,
        student.name,
        student.surname,
        student.class,
        student.gender
      );
    }
    
    if (config.customHeaders?.length) {
      studentRow.push(...Array(config.customHeaders.length).fill(''));
    }
    
    // Add empty cells for each question
    questions.forEach((question) => {
      studentRow.push(''); // Main answer cell
      
      // Add helper cell for complex question types
      if (['MULTIPLE_CHOICE', 'LIKERT', 'RATING', 'YES_NO'].includes(question.questionType)) {
        studentRow.push(''); // Helper/validation cell
      }
    });
    
    XLSX.utils.sheet_add_aoa(worksheet, [studentRow], { origin: `A${currentRow + 1}` });
    currentRow++;
  });
  
  // Add data validation for certain question types
  if (config.includeValidation) {
    addDataValidation(worksheet, questions, students.length, config);
  }
  
  // Set column widths
  const columnWidths = headers.map((header, index) => {
    if (index < 5 && config.includeStudentInfo) {
      return { wch: 15 }; // Student info columns
    }
    return { wch: Math.min(Math.max(header.length, 10), 50) }; // Question columns
  });
  
  worksheet['!cols'] = columnWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Anket Yanıtları');
}

function generateMultiSheetTemplate(
  workbook: XLSX.WorkBook,
  survey: SurveyTemplate,
  questions: SurveyQuestion[],
  students: Student[],
  config: ExcelTemplateConfig,
  distributionTitle?: string
) {
  // Instructions sheet
  if (config.includeInstructions) {
    const instructionsSheet = XLSX.utils.aoa_to_sheet([
      [`ANKET: ${distributionTitle || survey.title}`],
      [`Açıklama: ${survey.description || ''}`],
      [`Tahmini Süre: ${survey.estimatedDuration || 0} dakika`],
      [`MEB Uyumlu: ${survey.mebCompliant ? 'Evet' : 'Hayır'}`],
      [''],
      ['DOLDURMA TALİMATLARI:'],
      [''],
      ['1. GENEL BİLGİLER:'],
      ['   - Bu anket Excel şablonu otomatik olarak oluşturulmuştur'],
      ['   - Her öğrenci için ayrı bir satır bulunmaktadır'],
      ['   - Zorunlu sorular (*) işaretiyle belirtilmiştir'],
      [''],
      ['2. NASIL DOLDURULUR:'],
      ['   a) Öğrenci bilgilerini kontrol edin'],
      ['   b) Her soru için uygun yanıtı ilgili hücreye yazın'],
      ['   c) Çoktan seçmeli sorularda verilen seçeneklerden birini yazın'],
      ['   d) Likert ölçeği sorularda 1-5 arası puan verin'],
      ['   e) Açık uçlu sorularda serbestçe yazabilirsiniz'],
      [''],
      ['3. DOSYA YÖNETİMİ:'],
      ['   - Dosyayı düzenledikten sonra kaydetmeyi unutmayın'],
      ['   - Sisteme yüklemek için orijinal dosya formatını koruyun'],
      ['   - Sütun başlıklarını değiştirmeyin'],
      [''],
      ['4. TEKNIK DESTEK:'],
      ['   - Sorun yaşarsanız rehber öğretmeninize başvurun'],
      ['   - Dosya formatı hakkında bilgi için yöneticiye ulaşın'],
    ]);
    
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Talimatlar');
  }
  
  // Main response sheet
  generateSingleSheetTemplate(workbook, survey, questions, students, config, distributionTitle);
  
  // Question details sheet
  const questionDetailsSheet = XLSX.utils.aoa_to_sheet([]);
  let row = 0;
  
  XLSX.utils.sheet_add_aoa(questionDetailsSheet, [['SORU DETAYLARI']], { origin: `A${row + 1}` });
  row += 2;
  
  questions.forEach((question, index) => {
    const questionData = [
      [`Soru ${index + 1}:`],
      [question.questionText],
      [`Tür: ${getQuestionTypeLabel(question.questionType)}`],
      [`Zorunlu: ${question.required ? 'Evet' : 'Hayır'}`],
    ];
    
    if (question.options && question.options.length > 0) {
      questionData.push(['Seçenekler:']);
      question.options.forEach((option, optIndex) => {
        questionData.push([`  ${optIndex + 1}. ${option}`]);
      });
    }
    
    if (question.validation) {
      questionData.push(['Doğrulama Kuralları:']);
      if (question.validation.minLength) {
        questionData.push([`  Min. karakter: ${question.validation.minLength}`]);
      }
      if (question.validation.maxLength) {
        questionData.push([`  Max. karakter: ${question.validation.maxLength}`]);
      }
      if (question.validation.minValue) {
        questionData.push([`  Min. değer: ${question.validation.minValue}`]);
      }
      if (question.validation.maxValue) {
        questionData.push([`  Max. değer: ${question.validation.maxValue}`]);
      }
    }
    
    questionData.push(['']); // Empty row separator
    
    questionData.forEach((rowData) => {
      XLSX.utils.sheet_add_aoa(questionDetailsSheet, [rowData], { origin: `A${row + 1}` });
      row++;
    });
  });
  
  XLSX.utils.book_append_sheet(workbook, questionDetailsSheet, 'Soru Detayları');
}

function addDataValidation(
  worksheet: XLSX.WorkSheet,
  questions: SurveyQuestion[],
  studentCount: number,
  config: ExcelTemplateConfig
) {
  const studentInfoCols = config.includeStudentInfo ? 5 : 0;
  const customHeaderCols = config.customHeaders?.length || 0;
  let questionCol = studentInfoCols + customHeaderCols;
  
  questions.forEach((question) => {
    const startRow = config.includeInstructions ? 14 : 2; // Adjust based on header rows
    const endRow = startRow + studentCount - 1;
    const colLetter = XLSX.utils.encode_col(questionCol);
    const range = `${colLetter}${startRow}:${colLetter}${endRow}`;
    
    if (question.questionType === 'YES_NO') {
      // Add dropdown validation for Yes/No questions
      if (!worksheet['!dataValidation']) worksheet['!dataValidation'] = [];
      worksheet['!dataValidation'].push({
        type: 'list',
        allowBlank: !question.required,
        formula1: '"Evet,Hayır"',
        ranges: [range]
      });
    } else if (question.questionType === 'MULTIPLE_CHOICE' && question.options) {
      // Add dropdown validation for multiple choice
      if (!worksheet['!dataValidation']) worksheet['!dataValidation'] = [];
      worksheet['!dataValidation'].push({
        type: 'list',
        allowBlank: !question.required,
        formula1: `"${question.options.join(',')}"`,
        ranges: [range]
      });
    } else if (question.questionType === 'LIKERT') {
      // Add number validation for Likert scale (1-5)
      if (!worksheet['!dataValidation']) worksheet['!dataValidation'] = [];
      worksheet['!dataValidation'].push({
        type: 'whole',
        operator: 'between',
        allowBlank: !question.required,
        formula1: '1',
        formula2: '5',
        ranges: [range]
      });
    } else if (question.questionType === 'RATING') {
      // Add number validation for rating (1-10)
      if (!worksheet['!dataValidation']) worksheet['!dataValidation'] = [];
      worksheet['!dataValidation'].push({
        type: 'whole',
        operator: 'between',
        allowBlank: !question.required,
        formula1: '1',
        formula2: '10',
        ranges: [range]
      });
    }
    
    questionCol++;
    
    // Skip helper columns for complex question types
    if (['MULTIPLE_CHOICE', 'LIKERT', 'RATING', 'YES_NO'].includes(question.questionType)) {
      questionCol++;
    }
  });
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MULTIPLE_CHOICE: 'Çoktan Seçmeli',
    OPEN_ENDED: 'Açık Uçlu',
    LIKERT: 'Likert Ölçeği',
    YES_NO: 'Evet/Hayır',
    RATING: 'Puanlama',
    DROPDOWN: 'Açılır Liste',
  };
  return labels[type] || type;
}

export function parseExcelResponses(base64Data: string): any[] {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Read Excel file
    const workbook = XLSX.read(bytes, { type: 'array', codepage: 65001 });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    // Parse the response data
    const responses: unknown[] = [];
    
    // Find the header row (after instructions if present)
    let headerRowIndex = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any[];
      if (row && row[0] && typeof row[0] === 'string' && row[0].includes('Öğrenci No')) {
        headerRowIndex = i;
        break;
      }
    }
    
    const headers = data[headerRowIndex] as string[];
    const dataRows = data.slice(headerRowIndex + 1);
    
    dataRows.forEach((row: unknown, index) => {
      const typedRow = row as any[];
      if (!typedRow || typedRow.length === 0) return;
      
      const response: any = {
        studentInfo: {},
        answers: {}
      };
      
      headers.forEach((header, colIndex) => {
        const value = typedRow[colIndex];
        if (!value) return;
        
        if (header === 'Öğrenci No') response.studentInfo.id = value;
        else if (header === 'Ad') response.studentInfo.name = value;
        else if (header === 'Soyad') response.studentInfo.surname = value;
        else if (header === 'Sınıf') response.studentInfo.class = value;
        else if (header === 'Cinsiyet') response.studentInfo.gender = value;
        else if (header.match(/^\d+\./)) {
          // This is a question
          const questionMatch = header.match(/^(\d+)\./);
          if (questionMatch) {
            const questionNumber = questionMatch[1];
            response.answers[`question_${questionNumber}`] = value;
          }
        }
      });
      
      if (Object.keys(response.answers).length > 0) {
        responses.push(response);
      }
    });
    
    return responses;
  } catch (error) {
    console.error('Error parsing Excel responses:', error);
    throw new Error('Excel dosyası ayrıştırılamadı');
  }
}