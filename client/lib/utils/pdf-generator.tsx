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
    padding: 12,
    fontFamily: 'Roboto',
    fontSize: 8,
    backgroundColor: 'white',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 0,
    shadow: 'none',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 4,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 4,
    borderRadius: 0,
    marginBottom: 6,
  },
  studentName: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e293b',
  },
  dateRange: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 600,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 3,
    alignItems: 'center',
  },
  statBoxSecondary: {
    backgroundColor: '#f1f5f9',
  },
  statBoxTertiary: {
    backgroundColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 6,
    color: '#475569',
    opacity: 1,
  },
  daysGrid: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 4,
  },
  dayCard: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 0,
    padding: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  dayTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1e293b',
  },
  dayDate: {
    fontSize: 7,
    color: '#475569',
    fontWeight: 600,
  },
  emptyDay: {
    fontSize: 7,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 4,
  },
  table: {
    marginTop: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  tableCell: {
    fontSize: 6.5,
    color: '#334155',
  },
  tableCellHeader: {
    fontSize: 6.5,
    fontWeight: 700,
    color: '#1e293b',
  },
  colTime: {
    width: '12%',
  },
  colSubject: {
    width: '18%',
  },
  colTopic: {
    width: '38%',
  },
  colTarget: {
    width: '8%',
    textAlign: 'center',
  },
  colSolved: {
    width: '12%',
    textAlign: 'center',
  },
  colCorrect: {
    width: '12%',
    textAlign: 'center',
  },
  footer: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
  },
  notesSection: {
    marginBottom: 4,
  },
  notesTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 2,
  },
  noteLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    borderStyle: 'dashed',
    height: 8,
    marginBottom: 2,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  signatureItem: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 6,
    color: '#64748b',
    marginBottom: 2,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: '#475569',
    width: '100%',
  },
  branding: {
    fontSize: 6,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
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

function dateFromWeekStartLocal(weekStartISO: string, day: number): string {
  const d = new Date(weekStartISO + 'T00:00:00');
  const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
  return result.toISOString().slice(0, 10);
}

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS_TR[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateShort(date: Date): string {
  const day = date.getDate();
  const month = MONTHS_TR[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
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
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
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
          <Text style={styles.dayDate}>{formatDate(new Date(dateISO))}</Text>
        </View>

        {entries.length === 0 ? (
          <Text style={styles.emptyDay}>Planlanmış çalışma bulunmuyor</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, styles.colTime]}>SAAT</Text>
              <Text style={[styles.tableCellHeader, styles.colSubject]}>DERS</Text>
              <Text style={[styles.tableCellHeader, styles.colTopic]}>KONU</Text>
              <Text style={[styles.tableCellHeader, styles.colTarget]}>TOPLAM</Text>
              <Text style={[styles.tableCellHeader, styles.colSolved]}>ÇÖZÜLEN</Text>
              <Text style={[styles.tableCellHeader, styles.colCorrect]}>DOĞRU</Text>
            </View>
            {entries.map((entry, idx) => {
              const subject = subjects.find((s) => s.id === entry.subjectId);
              const topic = topics.find((t) => t.id === entry.topicId);
              const dayTotal = entries.reduce((sum, e) => sum + (e.targetQuestionCount || 0), 0);
              
              return (
                <View key={`${entry.topicId}-${idx}`} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colTime]}>{entry.start}-{entry.end}</Text>
                  <Text style={[styles.tableCell, styles.colSubject]}>
                    {subject?.name?.substring(0, 10) || ''}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTopic]}>
                    {topic?.name?.substring(0, 18) || ''}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTarget]}>
                    {dayTotal > 0 ? dayTotal : '-'}
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
              <Text style={styles.notesTitle}>HAFTALIK DEĞERLENDİRME VE NOTLAR:</Text>
              <View style={styles.noteLine} />
              <View style={styles.noteLine} />
              <View style={styles.noteLine} />
            </View>

            <View style={styles.signatureRow}>
              <View style={styles.signatureItem}>
                <Text style={styles.signatureLabel}>Öğrenci İmzası</Text>
                <View style={styles.signatureLine} />
              </View>
              <View style={styles.signatureItem}>
                <Text style={styles.signatureLabel}>Veli / Rehber Öğretmen İmzası</Text>
                <View style={styles.signatureLine} />
              </View>
            </View>

            <Text style={styles.branding}>Rehber360 • Akıllı Çalışma Sistemi • {shortDateRange}</Text>
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