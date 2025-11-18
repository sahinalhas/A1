import jsPDF from 'jspdf';
import type { CounselingSession, CounselingOutcome } from '../types';
import { calculateSessionDuration } from './sessionHelpers';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

interface ReportOptions {
 includeSessions?: boolean;
 includeOutcomes?: boolean;
 title?: string;
 dateRange?: {
 start: Date;
 end: Date;
 };
}

interface ExtendedOutcome extends CounselingOutcome {
 session?: CounselingSession;
}

export function generateSessionsPDF(
 sessions: CounselingSession[],
 outcomes: ExtendedOutcome[] = [],
 options: ReportOptions = {}
) {
 const {
 includeSessions = true,
 includeOutcomes = true,
 title = 'Görüşme Raporu',
 dateRange
 } = options;

 const doc = new jsPDF();
 const pageWidth = doc.internal.pageSize.getWidth();
 const pageHeight = doc.internal.pageSize.getHeight();
 const margin = 15;
 const contentWidth = pageWidth - (2 * margin);
 let yPosition = margin;

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(18);
 doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
 yPosition += 10;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(10);
 const reportDate = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: tr });
 doc.text(`Rapor Tarihi: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
 yPosition += 5;

 if (dateRange) {
 const dateRangeText = `Dönem: ${format(dateRange.start, 'dd MMM yyyy', { locale: tr })} - ${format(dateRange.end, 'dd MMM yyyy', { locale: tr })}`;
 doc.text(dateRangeText, pageWidth / 2, yPosition, { align: 'center' });
 yPosition += 5;
 }

 yPosition += 10;
 doc.setLineWidth(0.5);
 doc.line(margin, yPosition, pageWidth - margin, yPosition);
 yPosition += 10;

 if (includeSessions && sessions.length > 0) {
 yPosition = addSessionsSummary(doc, sessions, margin, yPosition, pageWidth, pageHeight);
 yPosition += 10;

 for (let i = 0; i < sessions.length; i++) {
 const session = sessions[i];
 
 if (yPosition > pageHeight - 60) {
 doc.addPage();
 yPosition = margin;
 }

 yPosition = addSessionDetails(doc, session, outcomes, margin, yPosition, contentWidth);
 
 if (i < sessions.length - 1) {
 yPosition += 5;
 doc.setLineWidth(0.2);
 doc.line(margin, yPosition, pageWidth - margin, yPosition);
 yPosition += 5;
 }
 }
 }

 if (includeOutcomes && outcomes.length > 0 && !includeSessions) {
 yPosition = addOutcomesSummary(doc, outcomes, margin, yPosition, pageWidth, pageHeight);
 }

 const fileName = `Gorusme_Raporu_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
 doc.save(fileName);

 return {
 success: true,
 fileName,
 sessionCount: sessions.length,
 outcomeCount: outcomes.length
 };
}

function addSessionsSummary(
 doc: jsPDF,
 sessions: CounselingSession[],
 margin: number,
 yPos: number,
 pageWidth: number,
 pageHeight: number
): number {
 let yPosition = yPos;

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(14);
 doc.text('Özet Bilgiler', margin, yPosition);
 yPosition += 8;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(10);

 const completedCount = sessions.filter(s => s.completed).length;
 const activeCount = sessions.length - completedCount;
 const individualCount = sessions.filter(s => s.sessionType === 'individual').length;
 const groupCount = sessions.filter(s => s.sessionType === 'group').length;

 const summaryData = [
 `Toplam Görüşme: ${sessions.length}`,
 `Tamamlanan: ${completedCount}`,
 `Devam Eden: ${activeCount}`,
 `Bireysel: ${individualCount}`,
 `Grup: ${groupCount}`
 ];

 summaryData.forEach(text => {
 doc.text(`• ${text}`, margin + 5, yPosition);
 yPosition += 6;
 });

 return yPosition;
}

function addSessionDetails(
 doc: jsPDF,
 session: CounselingSession,
 outcomes: ExtendedOutcome[],
 margin: number,
 yPos: number,
 contentWidth: number
): number {
 let yPosition = yPos;

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(12);
 doc.text(session.topic, margin, yPosition);
 yPosition += 7;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(9);

 const sessionDate = format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: tr });
 const duration = calculateSessionDuration(session.entryTime, session.exitTime || '');
 
 const studentNames = session.sessionType === 'individual'
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim() || '-'
 : session.students?.map(s => `${s.name} ${s.surname}`).join(', ') || session.groupName || '-';

 let participantInfo = '';
 if (session.participantType ==="veli" && session.parentName) {
 participantInfo = `${session.parentName} (${session.parentRelationship || 'Veli'})`;
 } else if (session.participantType ==="öğretmen" && session.teacherName) {
 participantInfo = `${session.teacherName}${session.teacherBranch ? ` - ${session.teacherBranch}` : ''}`;
 } else if (session.participantType ==="diğer" && session.otherParticipantDescription) {
 participantInfo = session.otherParticipantDescription;
 }

 const details = [
 { label: 'Tarih', value: sessionDate },
 { label: 'Saat', value: `${session.entryTime}${session.exitTime ? ` - ${session.exitTime}` : ''}` },
 { label: 'Öğrenci(ler)', value: studentNames },
 { label: 'Sınıf', value: session.sessionType === 'individual' ? session.student?.className || '-' : '-' },
 { label: 'Görüşme Tipi', value: session.sessionType === 'individual' ? 'Bireysel' : 'Grup' },
 { label: 'Katılımcı', value: session.participantType || 'öğrenci' },
 ];

 if (participantInfo) {
 details.push({ label: 'Katılımcı Bilgisi', value: participantInfo });
 }

 details.push(
 { label: 'Görüşme Şekli', value: session.sessionMode },
 { label: 'Konum', value: session.sessionLocation },
 { label: 'Süre', value: duration ? `${duration} dakika` : '-' },
 { label: 'Durum', value: session.completed ? 'Tamamlandı' : 'Devam Ediyor' }
 );

 details.forEach(detail => {
 const text = `${detail.label}: ${detail.value}`;
 const lines = doc.splitTextToSize(text, contentWidth);
 lines.forEach((line: string) => {
 doc.text(line, margin + 3, yPosition);
 yPosition += 5;
 });
 });

 if (session.detailedNotes || session.sessionDetails) {
 yPosition += 2;
 doc.setFont('helvetica', 'bold');
 doc.text('Notlar:', margin + 3, yPosition);
 yPosition += 5;
 
 doc.setFont('helvetica', 'normal');
 const notes = session.detailedNotes || session.sessionDetails || '';
 const noteLines = doc.splitTextToSize(notes, contentWidth - 6);
 noteLines.forEach((line: string) => {
 doc.text(line, margin + 6, yPosition);
 yPosition += 5;
 });
 }

 const sessionOutcome = outcomes.find(o => o.sessionId === session.id);
 if (sessionOutcome) {
 yPosition += 3;
 yPosition = addOutcomeToSession(doc, sessionOutcome, margin + 3, yPosition, contentWidth - 6);
 }

 return yPosition;
}

function addOutcomeToSession(
 doc: jsPDF,
 outcome: ExtendedOutcome,
 margin: number,
 yPos: number,
 contentWidth: number
): number {
 let yPosition = yPos;

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(10);
 doc.text('Görüşme Sonucu:', margin, yPosition);
 yPosition += 6;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(9);

 if (outcome.effectivenessRating) {
 doc.text(`Etkinlik: ${outcome.effectivenessRating}/5 `, margin + 3, yPosition);
 yPosition += 5;
 }

 const outcomeFields = [
 { label: 'İlerleme Notları', value: outcome.progressNotes },
 { label: 'Ulaşılan Hedefler', value: outcome.goalsAchieved },
 { label: 'Sonraki Adımlar', value: outcome.nextSteps },
 { label: 'Öneriler', value: outcome.recommendations }
 ];

 outcomeFields.forEach(field => {
 if (field.value) {
 doc.setFont('helvetica', 'bold');
 doc.text(`${field.label}:`, margin + 3, yPosition);
 yPosition += 5;
 
 doc.setFont('helvetica', 'normal');
 const lines = doc.splitTextToSize(field.value, contentWidth - 6);
 lines.forEach((line: string) => {
 doc.text(line, margin + 6, yPosition);
 yPosition += 5;
 });
 }
 });

 if (outcome.followUpRequired) {
 doc.setFont('helvetica', 'bold');
 const followUpText = outcome.followUpDate
 ? `Takip Gerekli: ${format(new Date(outcome.followUpDate), 'dd MMM yyyy', { locale: tr })}`
 : 'Takip Gerekli';
 doc.text(followUpText, margin + 3, yPosition);
 yPosition += 5;
 }

 return yPosition;
}

function addOutcomesSummary(
 doc: jsPDF,
 outcomes: ExtendedOutcome[],
 margin: number,
 yPos: number,
 pageWidth: number,
 pageHeight: number
): number {
 let yPosition = yPos;

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(14);
 doc.text('Görüşme Sonuçları Özeti', margin, yPosition);
 yPosition += 8;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(10);

 const withRating = outcomes.filter(o => o.effectivenessRating).length;
 const followUpRequired = outcomes.filter(o => o.followUpRequired).length;
 const avgRating = withRating > 0 
 ? (outcomes.reduce((sum, o) => sum + (o.effectivenessRating || 0), 0) / withRating).toFixed(1)
 : 'N/A';

 const summaryData = [
 `Toplam Sonuç: ${outcomes.length}`,
 `Değerlendirilen: ${withRating}`,
 `Ortalama Etkinlik: ${avgRating}/5`,
 `Takip Gerekli: ${followUpRequired}`
 ];

 summaryData.forEach(text => {
 doc.text(`• ${text}`, margin + 5, yPosition);
 yPosition += 6;
 });

 return yPosition;
}

export function generateOutcomesPDF(outcomes: ExtendedOutcome[], options: ReportOptions = {}) {
 const { title = 'Görüşme Sonuçları Raporu' } = options;
 
 const doc = new jsPDF();
 const pageWidth = doc.internal.pageSize.getWidth();
 const pageHeight = doc.internal.pageSize.getHeight();
 const margin = 15;
 const contentWidth = pageWidth - (2 * margin);
 let yPosition = margin;

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(18);
 doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
 yPosition += 10;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(10);
 const reportDate = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: tr });
 doc.text(`Rapor Tarihi: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
 yPosition += 15;

 yPosition = addOutcomesSummary(doc, outcomes, margin, yPosition, pageWidth, pageHeight);
 yPosition += 10;

 doc.setLineWidth(0.5);
 doc.line(margin, yPosition, pageWidth - margin, yPosition);
 yPosition += 10;

 for (let i = 0; i < outcomes.length; i++) {
 const outcome = outcomes[i];
 
 if (yPosition > pageHeight - 80) {
 doc.addPage();
 yPosition = margin;
 }

 doc.setFont('helvetica', 'bold');
 doc.setFontSize(12);
 const outcomeTitle = outcome.session 
 ? `Sonuç #${i + 1}: ${outcome.session.topic}`
 : `Sonuç #${i + 1}`;
 doc.text(outcomeTitle, margin, yPosition);
 yPosition += 7;

 doc.setFont('helvetica', 'normal');
 doc.setFontSize(9);

 if (outcome.session) {
 const sessionDate = format(new Date(outcome.session.sessionDate), 'dd MMMM yyyy', { locale: tr });
 doc.text(`Tarih: ${sessionDate}`, margin + 3, yPosition);
 yPosition += 5;
 }

 if (outcome.effectivenessRating) {
 doc.text(`Etkinlik Puanı: ${outcome.effectivenessRating}/5 `, margin + 3, yPosition);
 yPosition += 5;
 }

 const outcomeFields = [
 { label: 'İlerleme Notları', value: outcome.progressNotes },
 { label: 'Ulaşılan Hedefler', value: outcome.goalsAchieved },
 { label: 'Sonraki Adımlar', value: outcome.nextSteps },
 { label: 'Öneriler', value: outcome.recommendations }
 ];

 outcomeFields.forEach(field => {
 if (field.value) {
 yPosition += 2;
 doc.setFont('helvetica', 'bold');
 doc.text(`${field.label}:`, margin + 3, yPosition);
 yPosition += 5;
 
 doc.setFont('helvetica', 'normal');
 const lines = doc.splitTextToSize(field.value, contentWidth - 6);
 lines.forEach((line: string) => {
 if (yPosition > pageHeight - 20) {
 doc.addPage();
 yPosition = margin;
 }
 doc.text(line, margin + 6, yPosition);
 yPosition += 5;
 });
 }
 });

 if (outcome.followUpRequired) {
 yPosition += 2;
 doc.setFont('helvetica', 'bold');
 const followUpText = outcome.followUpDate
 ? `Takip Gerekli: ${format(new Date(outcome.followUpDate), 'dd MMM yyyy', { locale: tr })}`
 : 'Takip Gerekli';
 doc.text(followUpText, margin + 3, yPosition);
 yPosition += 5;
 }

 if (i < outcomes.length - 1) {
 yPosition += 5;
 doc.setLineWidth(0.2);
 doc.line(margin, yPosition, pageWidth - margin, yPosition);
 yPosition += 5;
 }
 }

 const fileName = `Gorusme_Sonuclari_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
 doc.save(fileName);

 return {
 success: true,
 fileName,
 outcomeCount: outcomes.length
 };
}

export function generateComprehensiveReport(
 sessions: CounselingSession[],
 outcomes: ExtendedOutcome[]
) {
 return generateSessionsPDF(sessions, outcomes, {
 includeSessions: true,
 includeOutcomes: true,
 title: 'Kapsamlı Görüşme ve Sonuç Raporu'
 });
}
