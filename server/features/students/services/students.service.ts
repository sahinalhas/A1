import * as repository from '../repository/students.repository.js';
import type { Student, AcademicRecord, Progress } from '../types/students.types.js';

type StudentInput = Record<string, unknown>;

function normalizeGender(value: unknown): 'K' | 'E' | undefined {
  if (!value) return undefined;
  const str = String(value).toUpperCase();
  if (str === 'K' || str === 'E' || str === 'KADIN' || str === 'ERKEK') {
    return str === 'ERKEK' ? 'E' : str === 'KADIN' ? 'K' : str as 'K' | 'E';
  }
  return undefined;
}

function normalizeRisk(value: unknown): 'Düşük' | 'Orta' | 'Yüksek' | undefined {
  if (!value) return undefined;
  const str = String(value).toLowerCase();
  const riskMap: Record<string, 'Düşük' | 'Orta' | 'Yüksek'> = {
    'düşük': 'Düşük',
    'dusuk': 'Düşük',
    'low': 'Düşük',
    'orta': 'Orta',
    'medium': 'Orta',
    'yüksek': 'Yüksek',
    'yuksek': 'Yüksek',
    'high': 'Yüksek'
  };
  return riskMap[str];
}

function normalizeStatus(value: unknown): 'active' | 'inactive' | 'graduated' {
  if (!value) return 'active';
  const str = String(value).toLowerCase();
  const statusMap: Record<string, 'active' | 'inactive' | 'graduated'> = {
    'active': 'active',
    'aktif': 'active',
    'inactive': 'inactive',
    'pasif': 'inactive',
    'graduated': 'graduated',
    'mezun': 'graduated'
  };
  return statusMap[str] || 'active';
}

export function normalizeStudentData(student: StudentInput): Student {
  const normalized: Student = {
    id: student.id ? String(student.id).trim() : '',
    name: student.name ? String(student.name).trim() : '',
    surname: student.surname ? String(student.surname).trim() : '',
    email: student.email ? String(student.email).trim() : undefined,
    phone: student.phone ? String(student.phone).trim() : undefined,
    birthDate: (student.birthDate as string | undefined) || undefined,
    address: student.address ? String(student.address).trim() : undefined,
    class: student.class ? String(student.class).trim() : undefined,
    enrollmentDate: (student.enrollmentDate as string | undefined) || new Date().toISOString().split('T')[0],
    status: normalizeStatus(student.status),
    avatar: (student.avatar as string | undefined) || undefined,
    parentContact: student.parentContact ? String(student.parentContact).trim() : undefined,
    notes: student.notes ? String(student.notes).trim() : undefined,
    gender: normalizeGender(student.gender),
    risk: normalizeRisk(student.risk),
  };
  
  return normalized;
}

export function validateStudent(student: unknown): { valid: boolean; error?: string } {
  if (!student || typeof student !== 'object') {
    return { valid: false, error: "Geçersiz öğrenci verisi" };
  }
  
  const studentObj = student as Record<string, unknown>;
  
  if (!studentObj.id || typeof studentObj.id !== 'string' || studentObj.id.trim().length === 0) {
    return { valid: false, error: "Öğrenci ID zorunludur" };
  }
  
  if (!studentObj.name || typeof studentObj.name !== 'string' || studentObj.name.trim().length === 0) {
    return { valid: false, error: "Öğrenci adı zorunludur" };
  }
  
  if (!studentObj.surname || typeof studentObj.surname !== 'string' || studentObj.surname.trim().length === 0) {
    return { valid: false, error: "Öğrenci soyadı zorunludur" };
  }
  
  return { valid: true };
}

export function validateAcademic(academic: unknown): { valid: boolean; error?: string } {
  if (!academic || typeof academic !== 'object') {
    return { valid: false, error: "Geçersiz akademik kayıt verisi" };
  }
  
  const academicObj = academic as Record<string, unknown>;
  
  if (!academicObj.studentId || !academicObj.semester || academicObj.year === undefined) {
    return { valid: false, error: "studentId, semester ve year alanları zorunludur" };
  }
  
  return { valid: true };
}

export function getAllStudents(): Student[] {
  return repository.loadStudents();
}

export function createOrUpdateStudent(student: unknown): void {
  const validation = validateStudent(student);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const normalizedStudent = normalizeStudentData(student as StudentInput);
  repository.saveStudent(normalizedStudent);
}

export function bulkSaveStudents(students: unknown[]): void {
  if (!Array.isArray(students)) {
    throw new Error('Expected array of students');
  }
  
  const invalidIndices: number[] = [];
  for (let i = 0; i < students.length; i++) {
    const validation = validateStudent(students[i]);
    if (!validation.valid) {
      invalidIndices.push(i);
    }
  }
  
  if (invalidIndices.length > 0) {
    throw new Error(`Geçersiz öğrenci verileri (indeksler: ${invalidIndices.join(', ')})`);
  }
  
  const normalizedStudents = students.map(student => normalizeStudentData(student as StudentInput));
  repository.saveStudents(normalizedStudents);
}

export function removeStudent(id: string, confirmationName?: string): { studentName: string } {
  const students = repository.loadStudents();
  const student = students.find(s => s.id === id);
  
  if (!student) {
    throw new Error("Öğrenci bulunamadı");
  }
  
  if (confirmationName) {
    const expectedName = `${student.name} ${student.surname}`.trim();
    const sanitizedConfirmationName = (confirmationName || '').trim();
    
    if (sanitizedConfirmationName !== expectedName) {
      throw new Error("Silme işlemini onaylamak için öğrencinin tam adını doğru yazmalısınız");
    }
  }
  
  repository.deleteStudent(id);
  return { studentName: `${student.name} ${student.surname}` };
}

export function getStudentAcademics(studentId: string): AcademicRecord[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  return repository.getAcademicsByStudent(studentId);
}

export function createAcademic(academic: unknown): void {
  const validation = validateAcademic(academic);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const academicObj = academic as Record<string, unknown>;
  
  const sanitizedAcademic: AcademicRecord = {
    studentId: academicObj.studentId as string,
    semester: academicObj.semester as string,
    gpa: academicObj.gpa !== undefined && academicObj.gpa !== null ? Number(academicObj.gpa) : undefined,
    year: Number(academicObj.year),
    exams: (academicObj.exams as AcademicRecord['exams']) || [],
    notes: (academicObj.notes as string | undefined) || undefined
  };
  
  repository.addAcademic(sanitizedAcademic);
}

export function getStudentProgress(studentId: string): Progress[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  repository.ensureProgressForStudent(studentId);
  return repository.getProgressByStudent(studentId);
}
