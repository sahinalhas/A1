import { randomUUID } from 'node:crypto';
import getDatabase from '../../../lib/database.js';
import type { DailyInsight, StudentDailyStatus, ProactiveAlert } from '../../../../shared/types/daily-insights.types.js';

const db = getDatabase();

// ==================== DAILY INSIGHTS ====================

export function createDailyInsight(insight: Omit<DailyInsight, 'id' | 'generatedAt'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO daily_insights (
      id, insightDate, reportType, summary,
      totalStudents, highRiskCount, mediumRiskCount, criticalAlertsCount, newAlertsCount,
      keyFindings, priorityActions, suggestedMeetings,
      aiInsights, trendAnalysis, generatedBy
    ) VALUES (
      COALESCE((SELECT id FROM daily_insights WHERE insightDate = ? AND reportType = ?), ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  
  stmt.run(
    insight.insightDate,
    insight.reportType,
    id,
    insight.insightDate,
    insight.reportType,
    insight.summary,
    insight.totalStudents,
    insight.highRiskCount,
    insight.mediumRiskCount,
    insight.criticalAlertsCount,
    insight.newAlertsCount,
    insight.keyFindings || null,
    insight.priorityActions || null,
    insight.suggestedMeetings || null,
    insight.aiInsights || null,
    insight.trendAnalysis || null,
    insight.generatedBy
  );
  
  return id;
}

export function getDailyInsightByDate(date: string, reportType: 'GÜNLÜK' | 'HAFTALIK' | 'AYLIK' = 'GÜNLÜK'): DailyInsight | null {
  const stmt = db.prepare(`
    SELECT * FROM daily_insights
    WHERE insightDate = ? AND reportType = ?
    ORDER BY generatedAt DESC
    LIMIT 1
  `);
  
  return stmt.get(date, reportType) as DailyInsight | null;
}

export function getLatestDailyInsights(limit: number = 7): DailyInsight[] {
  const stmt = db.prepare(`
    SELECT * FROM daily_insights
    WHERE reportType = 'GÜNLÜK'
    ORDER BY insightDate DESC
    LIMIT ?
  `);
  
  return stmt.all(limit) as DailyInsight[];
}

// ==================== STUDENT DAILY STATUS ====================

export function createStudentDailyStatus(status: Omit<StudentDailyStatus, 'id' | 'created_at'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO student_daily_status (
      id, studentId, statusDate, overallStatus, statusNotes,
      academicChange, behaviorChange, attendanceChange,
      needsAttention, hasNewAlert, hasCriticalAlert, detectedPatterns
    ) VALUES (
      COALESCE((SELECT id FROM student_daily_status WHERE studentId = ? AND statusDate = ?), ?),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);
  
  stmt.run(
    status.studentId,
    status.statusDate,
    id,
    status.studentId,
    status.statusDate,
    status.overallStatus,
    status.statusNotes || null,
    status.academicChange || null,
    status.behaviorChange || null,
    status.attendanceChange || null,
    status.needsAttention,
    status.hasNewAlert,
    status.hasCriticalAlert,
    status.detectedPatterns || null
  );
  
  return id;
}

export function getStudentDailyStatus(studentId: string, date: string): StudentDailyStatus | null {
  const stmt = db.prepare(`
    SELECT * FROM student_daily_status
    WHERE studentId = ? AND statusDate = ?
  `);
  
  return stmt.get(studentId, date) as StudentDailyStatus | null;
}

export function getStudentsNeedingAttention(date: string): StudentDailyStatus[] {
  const stmt = db.prepare(`
    SELECT * FROM student_daily_status
    WHERE statusDate = ? AND needsAttention = 1
    ORDER BY hasCriticalAlert DESC, overallStatus DESC
  `);
  
  return stmt.all(date) as StudentDailyStatus[];
}

export function getStudentStatusHistory(studentId: string, days: number = 30): StudentDailyStatus[] {
  const stmt = db.prepare(`
    SELECT * FROM student_daily_status
    WHERE studentId = ? AND statusDate >= date('now', '-' || ? || ' days')
    ORDER BY statusDate DESC
  `);
  
  return stmt.all(studentId, days) as StudentDailyStatus[];
}

// ==================== PROACTIVE ALERTS ====================

export function createProactiveAlert(alert: Omit<ProactiveAlert, 'id' | 'detectedAt'>): string {
  const id = randomUUID();
  
  const stmt = db.prepare(`
    INSERT INTO proactive_alerts (
      id, studentId, alertCategory, severity, title, description,
      evidence, recommendation, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    alert.studentId || null,
    alert.alertCategory,
    alert.severity,
    alert.title,
    alert.description,
    alert.evidence || null,
    alert.recommendation || null,
    alert.status || 'YENİ'
  );
  
  return id;
}

export function getProactiveAlerts(filters: {
  status?: string;
  severity?: string;
  studentId?: string;
  limit?: number;
}): ProactiveAlert[] {
  let query = 'SELECT * FROM proactive_alerts WHERE 1=1';
  const params: (string | number)[] = [];
  
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters.severity) {
    query += ' AND severity = ?';
    params.push(filters.severity);
  }
  
  if (filters.studentId) {
    query += ' AND studentId = ?';
    params.push(filters.studentId);
  }
  
  query += ' ORDER BY detectedAt DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as ProactiveAlert[];
}

export function updateProactiveAlertStatus(
  id: string, 
  status: ProactiveAlert['status'],
  actionTaken?: string
): void {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE proactive_alerts
    SET status = ?,
        actionTaken = ?,
        acknowledgedAt = CASE WHEN status = 'GÖRÜLDÜ' THEN ? ELSE acknowledgedAt END,
        resolvedAt = CASE WHEN status IN ('ÇÖZÜLDÜ', 'GÖRMEZDEN_GELİNDİ') THEN ? ELSE resolvedAt END
    WHERE id = ?
  `);
  
  stmt.run(status, actionTaken || null, now, now, id);
}

export function assignProactiveAlert(id: string, assignedTo: string): void {
  const stmt = db.prepare(`
    UPDATE proactive_alerts
    SET assignedTo = ?,
        status = CASE WHEN status = 'YENİ' THEN 'AKSIYONA_ALINDI' ELSE status END
    WHERE id = ?
  `);
  
  stmt.run(assignedTo, id);
}

// ==================== ANALYTICS ====================

export function getDailyInsightsStats(date: string): {
  totalAlerts: number;
  criticalAlerts: number;
  studentsNeedingAttention: number;
  positiveUpdates: number;
} {
  const alerts = db.prepare(`
    SELECT 
      COUNT(*) as totalAlerts,
      SUM(CASE WHEN severity = 'KRİTİK' THEN 1 ELSE 0 END) as criticalAlerts,
      SUM(CASE WHEN alertCategory = 'POZİTİF_GELİŞİM' THEN 1 ELSE 0 END) as positiveUpdates
    FROM proactive_alerts
    WHERE date(detectedAt) = ?
  `).get(date) as { totalAlerts: number; criticalAlerts: number; positiveUpdates: number } | undefined;
  
  const students = db.prepare(`
    SELECT COUNT(*) as count
    FROM student_daily_status
    WHERE statusDate = ? AND needsAttention = 1
  `).get(date) as { count: number } | undefined;
  
  return {
    totalAlerts: alerts?.totalAlerts || 0,
    criticalAlerts: alerts?.criticalAlerts || 0,
    studentsNeedingAttention: students?.count || 0,
    positiveUpdates: alerts?.positiveUpdates || 0
  };
}
