import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';

export interface PlanEntry {
  date: string;
  start: string;
  end: string;
  subjectId: string;
  topicId: string;
  allocated: number;
  remainingAfter: number;
  targetQuestionCount?: number;
}

interface Subject {
  id: string;
  name: string;
  category?: string;
}

interface Topic {
  id: string;
  name: string;
  avgMinutes?: number;
}

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 8,
    fontFamily: 'Roboto',
    fontSize: 7,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 4,
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 0,
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 4,
    borderRadius: 2,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  studentName: {
    fontSize: 8,
    fontWeight: 700,
    color: '#1e293b',
  },
  dateRange: {
    fontSize: 7,
    color: '#475569',
    fontWeight: 500,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 3,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 3,
    borderRadius: 2,
    alignItems: 'center',
  },
  statBoxSecondary: {
    backgroundColor: '#8b5cf6',
  },
  statBoxTertiary: {
    backgroundColor: '#06b6d4',
  },
  statValue: {
    fontSize: 8,
    fontWeight: 700,
    color: 'white',
    marginBottom: 0,
  },
  statLabel: {
    fontSize: 5,
    color: 'white',
    opacity: 0.95,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'column',
    gap: 2,
    marginBottom: 4,
    flex: 1,
  },
  dayCard: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 2,
    padding: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingBottom: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  dayTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#1e293b',
  },
  dayDate: {
    fontSize: 6,
    color: '#475569',
    fontWeight: 500,
  },
  emptyDay: {
    fontSize: 6,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 2,
  },
  table: {
    marginTop: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8eef7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 1,
    paddingHorizontal: 1,
  },
  tableCell: {
    fontSize: 5,
    color: '#334155',
  },
  tableCellHeader: {
    fontSize: 5,
    fontWeight: 700,
    color: '#1e293b',
  },
  colTime: {
    width: '10%',
  },
  colSubject: {
    width: '16%',
  },
  colTopic: {
    width: '42%',
  },
  colTotal: {
    width: '8%',
    textAlign: 'center',
  },
  colSolved: {
    width: '8%',
    textAlign: 'center',
  },
  colCorrect: {
    width: '8%',
    textAlign: 'center',
  },
  colRemaining: {
    width: '8%',
    textAlign: 'center',
  },
  footer: {
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
  },
  notesSection: {
    marginBottom: 3,
  },
  notesTitle: {
    fontSize: 6,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 1,
  },
  noteLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    borderStyle: 'dashed',
    height: 4,
    marginBottom: 1,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
    gap: 4,
  },
  signatureItem: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: 5,
    color: '#64748b',
    marginBottom: 1,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: '#475569',
    width: '100%',
  },
  branding: {
    fontSize: 5,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 2,
  },
});

const DAYS = [
  { value: 1, label: 'Pazartesi' },
  { value: 2, label: 'Salı' },
  { value: 3, label: 'Çarşamba' },
  { value: 4, label: 'Perşembe' },
  { value: 5, label: 'Cuma' },
  { value: 6, label: 'Cumartesi' },
  { value: 7, label: 'Pazar' },
];

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function dateFromWeekStartLocal(weekStartISO: string, day: number): string {
  const d = new Date(weekStartISO + 'T00:00:00');
  const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
  return result.toISOString().slice(0, 10);
}

function formatDateTurkish(date: Date): string {
  const day = date.getDate();
  const month = TURKISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

interface WeeklyPlanDocumentProps {
  plan: PlanEntry[];
  planByDate: Map<string, PlanEntry[]>;
  weekStart: string;
  subjects: Subject[];
  topics: Topic[];
  studentId: string;
  studentName?: string;
}

const WeeklyPlanDocument: React.FC<WeeklyPlanDocumentProps> = ({
  plan,
  planByDate,
  weekStart,
  subjects,
  topics,
  studentName,
  studentId,
}) => {
  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRange = `${formatDateTurkish(startDate)} - ${formatDateTurkish(endDate)}`;
  const shortDateRange = `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;

  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const totalQuestions = plan.reduce((sum, p) => sum + (p.targetQuestionCount || 0), 0);

  const renderDaySection = (day: { value: number; label: string }) => {
    const dateISO = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(dateISO) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    return (
      <View key={day.value} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{day.label}</Text>
          <Text style={styles.dayDate}>{formatDateTurkish(new Date(dateISO))}</Text>
        </View>

        {entries.length === 0 ? (
          <Text style={styles.emptyDay}>Planlanmış çalışma bulunmuyor</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, styles.colTime]}>SAAT</Text>
              <Text style={[styles.tableCellHeader, styles.colSubject]}>DERS</Text>
              <Text style={[styles.tableCellHeader, styles.colTopic]}>KONU</Text>
              <Text style={[styles.tableCellHeader, styles.colTotal]}>TOPLAM</Text>
              <Text style={[styles.tableCellHeader, styles.colSolved]}>ÇÖZÜLEN</Text>
              <Text style={[styles.tableCellHeader, styles.colCorrect]}>DOĞRU</Text>
            </View>
            {entries.map((entry, idx) => {
              const subject = subjects.find((s) => s.id === entry.subjectId);
              const topic = topics.find((t) => t.id === entry.topicId);
              
              return (
                <View key={`${entry.topicId}-${idx}`} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colTime]}>{entry.start}-{entry.end}</Text>
                  <Text style={[styles.tableCell, styles.colSubject]}>
                    {subject?.name || ''}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTopic]}>
                    {topic?.name || ''}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>
                    {entry.targetQuestionCount || '-'}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSolved]}>-</Text>
                  <Text style={[styles.tableCell, styles.colCorrect]}>-</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>HAFTALIK ÇALIŞMA PLANI</Text>
            <Text style={styles.subtitle}>Kişiselleştirilmiş Öğrenme Programı</Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{studentName || studentId}</Text>
            <Text style={styles.dateRange}>{dateRange}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalHours}sa {totalMins}dk</Text>
              <Text style={styles.statLabel}>TOPLAM SÜRE</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxSecondary]}>
              <Text style={styles.statValue}>{plan.length}</Text>
              <Text style={styles.statLabel}>ETÜT SAYISI</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxTertiary]}>
              <Text style={styles.statValue}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>HEDEF SORU</Text>
            </View>
          </View>

          <View style={styles.daysGrid}>
            {DAYS.map(renderDaySection)}
          </View>

          <View style={styles.footer}>
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>NOTLAR:</Text>
              <View style={styles.noteLine} />
              <View style={styles.noteLine} />
            </View>

            <View style={styles.signatureRow}>
              <View style={styles.signatureItem}>
                <Text style={styles.signatureLabel}>Öğrenci İmzası</Text>
                <View style={styles.signatureLine} />
              </View>
              <View style={styles.signatureItem}>
                <Text style={styles.signatureLabel}>Veli İmzası</Text>
                <View style={styles.signatureLine} />
              </View>
            </View>

            <Text style={styles.branding}>Rehber360 • {shortDateRange}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function generateTopicPlanPDF(
  plan: PlanEntry[],
  planByDate: Map<string, PlanEntry[]>,
  weekStart: string,
  subjects: Subject[],
  topics: Topic[],
  studentId: string,
  studentName?: string,
  options: { download?: boolean; print?: boolean } = { download: true, print: false }
) {
  const blob = await pdf(
    <WeeklyPlanDocument
      plan={plan}
      planByDate={planByDate}
      weekStart={weekStart}
      subjects={subjects}
      topics={topics}
      studentId={studentId}
      studentName={studentName}
    />
  ).toBlob();

  const fileName = `Haftalik_Calisma_Plani_${weekStart}_${studentName || studentId}.pdf`;

  if (options.print) {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  } else if (options.download) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return blob;
}