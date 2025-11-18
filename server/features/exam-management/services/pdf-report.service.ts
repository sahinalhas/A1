import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import { getDatabase } from '../../../lib/database/connection.js';
import type { ExamSession } from '../../../../shared/types/exam-management.types.js';

export interface ReportData {
  session?: ExamSession;
  students?: Array<{ id: string; name: string }>;
  statistics?: any;
  recommendations?: any;
}

export function generateSessionReport(sessionId: string): ReportData | null {
  try {
    const session = examSessionsRepo.getExamSessionById(sessionId);
    if (!session) {
      return null;
    }

    const results = examResultsRepo.getExamResultsBySession(sessionId);
    const db = getDatabase();
    
    const students = db.prepare(`
      SELECT DISTINCT s.id, s.name
      FROM students s
      INNER JOIN exam_session_results esr ON s.id = esr.student_id
      WHERE esr.session_id = ?
    `).all(sessionId) as Array<{ id: string; name: string }>;

    const subjects = examTypesRepo.getSubjectsByExamType(session.exam_type_id);
    
    const statistics = {
      total_students: new Set(results.map(r => r.student_id)).size,
      total_results: results.length,
      avg_net: results.length > 0 
        ? results.reduce((sum, r) => sum + r.net_score, 0) / results.length 
        : 0,
      subject_breakdown: subjects.map(subject => {
        const subjectResults = results.filter(r => r.subject_id === subject.id);
        return {
          subject_name: subject.subject_name,
          avg_net: subjectResults.length > 0
            ? subjectResults.reduce((sum, r) => sum + r.net_score, 0) / subjectResults.length
            : 0,
          count: subjectResults.length
        };
      })
    };

    return {
      session,
      students,
      statistics
    };
  } catch (error) {
    console.error('Error generating session report:', error);
    return null;
  }
}

export function generateStudentReport(studentId: string, examTypeId?: string): ReportData | null {
  try {
    const db = getDatabase();
    const student = db.prepare('SELECT id, name FROM students WHERE id = ?').get(studentId) as { id: string; name: string } | undefined;
    
    if (!student) {
      return null;
    }

    const results = examResultsRepo.getExamResultsByStudent(studentId);
    const filteredResults = examTypeId 
      ? results.filter(r => r.exam_type_id === examTypeId)
      : results;

    const sessions = [...new Set(filteredResults.map(r => r.session_id))];
    const sessionData = sessions.map(sessionId => {
      const session = examSessionsRepo.getExamSessionById(sessionId);
      const sessionResults = filteredResults.filter(r => r.session_id === sessionId);
      return {
        session,
        total_net: sessionResults.reduce((sum, r) => sum + r.net_score, 0),
        results: sessionResults
      };
    });

    return {
      students: [student],
      statistics: {
        total_exams: sessions.length,
        avg_net: filteredResults.length > 0
          ? filteredResults.reduce((sum, r) => sum + r.net_score, 0) / filteredResults.length
          : 0,
        session_data: sessionData
      }
    };
  } catch (error) {
    console.error('Error generating student report:', error);
    return null;
  }
}

export function exportReportAsJSON(reportData: ReportData): string {
  return JSON.stringify(reportData, null, 2);
}

// ============================================================================
// Advanced PDF Report Generation
// ============================================================================

import type { PDFReportConfig, StudentDetailedReport } from '../../../../shared/types/exam-management.types.js';
import jsPDF from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

export function generateStudentDetailedReport(studentId: string, examTypeId: string, config?: Partial<PDFReportConfig>): StudentDetailedReport {
  const db = getDatabase();
  
  const student = db.prepare(`
    SELECT id, fullName, class FROM students WHERE id = ?
  `).get(studentId) as any;
  
  if (!student) {
    throw new Error('Student not found');
  }
  
  const summary = db.prepare(`
    SELECT 
      COUNT(DISTINCT s.id) as total_exams,
      AVG(r.net_score) as avg_performance,
      MAX(r.net_score) as best_performance
    FROM exam_sessions s
    INNER JOIN exam_session_results r ON s.id = r.session_id
    WHERE r.student_id = ? AND s.exam_type_id = ?
  `).get(studentId, examTypeId) as any;
  
  const subjectPerformance = db.prepare(`
    SELECT 
      sub.subject_name,
      AVG(r.net_score) as avg_net,
      COUNT(r.id) as exams_count
    FROM exam_session_results r
    INNER JOIN exam_subjects sub ON r.subject_id = sub.id
    INNER JOIN exam_sessions s ON r.session_id = s.id
    WHERE r.student_id = ? AND s.exam_type_id = ?
    GROUP BY sub.id
  `).all(studentId, examTypeId) as any[];
  
  const goals = db.prepare(`
    SELECT 
      g.id as goal_id,
      s.subject_name,
      g.target_net,
      g.current_net,
      g.status,
      g.deadline
    FROM student_exam_goals g
    LEFT JOIN exam_subjects s ON g.subject_id = s.id
    WHERE g.student_id = ? AND g.exam_type_id = ?
  `).all(studentId, examTypeId) as any[];
  
  const benchmarks = db.prepare(`
    SELECT 
      es.name as session_name,
      es.exam_date,
      b.total_net as student_score,
      b.class_avg,
      b.percentile,
      b.rank
    FROM exam_benchmarks b
    INNER JOIN exam_sessions es ON b.session_id = es.id
    WHERE b.student_id = ?
    ORDER BY es.exam_date DESC
    LIMIT 10
  `).all(studentId) as any[];
  
  const timeAnalysis = db.prepare(`
    SELECT * FROM exam_time_analysis 
    WHERE student_id = ? AND exam_type_id = ?
  `).get(studentId, examTypeId) as any;
  
  const prediction = db.prepare(`
    SELECT * FROM exam_predictions 
    WHERE student_id = ? AND exam_type_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(studentId, examTypeId) as any;
  
  const report: StudentDetailedReport = {
    student_info: {
      id: student.id,
      name: student.fullName,
      class: student.class || 'N/A'
    },
    summary: {
      total_exams: summary?.total_exams || 0,
      avg_performance: summary?.avg_performance || 0,
      best_performance: summary?.best_performance || 0,
      improvement_rate: 0
    },
    performance_by_subject: subjectPerformance.map(sp => ({
      subject_name: sp.subject_name,
      avg_net: sp.avg_net,
      trend: 'stable',
      strength_level: sp.avg_net < 5 ? 'weak' : sp.avg_net > 15 ? 'strong' : 'moderate',
      exams_count: sp.exams_count
    })),
    goal_progress: goals.map(g => ({
      goal_id: g.goal_id,
      subject_name: g.subject_name,
      target_net: g.target_net,
      current_net: g.current_net,
      progress_percentage: (g.current_net / g.target_net) * 100,
      status: g.status,
      deadline: g.deadline
    })),
    benchmark_data: benchmarks.map(b => ({
      session_name: b.session_name,
      exam_date: b.exam_date,
      student_score: b.student_score,
      class_avg: b.class_avg,
      percentile: b.percentile,
      rank: b.rank
    })),
    time_analysis: {
      total_exams: timeAnalysis?.total_exams || 0,
      avg_interval_days: timeAnalysis?.avg_days_between_exams || 0,
      study_frequency: timeAnalysis?.study_frequency || 'medium',
      consistency_score: 0,
      recommended_pattern: timeAnalysis ? `${timeAnalysis.optimal_interval_days} gün arayla` : 'N/A'
    },
    predictions: {
      predicted_performance: prediction?.predicted_net || 0,
      confidence: prediction?.confidence_level || 0,
      risk_level: prediction?.risk_level || 'medium',
      success_probability: prediction?.success_probability || 0,
      key_insights: []
    },
    recommendations: [
      'Zayıf konulara odaklanın',
      'Düzenli deneme çözmeye devam edin',
      'Hatalarınızı analiz edin'
    ],
    generated_at: new Date().toISOString()
  };
  
  return report;
}

export function generatePDF(report: StudentDetailedReport): Buffer {
  const doc = new jsPDF();
  
  doc.setFont('helvetica');
  
  doc.setFontSize(20);
  doc.text('Ogrenci Sinav Raporu', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Ogrenci: ${report.student_info.name}`, 20, 40);
  doc.text(`Sinif: ${report.student_info.class}`, 20, 50);
  
  doc.setFontSize(14);
  doc.text('Ozet', 20, 70);
  doc.setFontSize(10);
  doc.text(`Toplam Sinav: ${report.summary.total_exams}`, 20, 80);
  doc.text(`Ortalama Performans: ${report.summary.avg_performance.toFixed(2)}`, 20, 90);
  doc.text(`En Iyi Performans: ${report.summary.best_performance.toFixed(2)}`, 20, 100);
  
  doc.setFontSize(14);
  doc.text('Ders Bazli Performans', 20, 120);
  doc.setFontSize(10);
  let yPos = 130;
  
  for (const subject of report.performance_by_subject) {
    doc.text(`${subject.subject_name}: ${subject.avg_net.toFixed(2)} (${subject.strength_level})`, 20, yPos);
    yPos += 10;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  }
  
  if (report.goal_progress.length > 0) {
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Hedefler', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    for (const goal of report.goal_progress) {
      doc.text(
        `${goal.subject_name || 'Genel'}: ${goal.current_net}/${goal.target_net} (%${goal.progress_percentage.toFixed(0)})`,
        20,
        yPos
      );
      yPos += 10;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    }
  }
  
  yPos += 10;
  doc.setFontSize(14);
  doc.text('Oneriler', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);
  
  for (const rec of report.recommendations) {
    doc.text(`- ${rec}`, 20, yPos);
    yPos += 10;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  }
  
  doc.setFontSize(8);
  doc.text(`Olusturulma Tarihi: ${new Date(report.generated_at).toLocaleDateString('tr-TR')}`, 20, 285);
  
  return Buffer.from(doc.output('arraybuffer'));
}

export function savePDFReport(report: StudentDetailedReport, filename: string): string {
  const pdfBuffer = generatePDF(report);
  
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, pdfBuffer);
  
  return filepath;
}
