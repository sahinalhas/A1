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
    padding: 20,
    fontFamily: 'Roboto',
    fontSize: 9,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    borderBottomWidth: 3,
    borderBottomColor: '#4f46e5',
    paddingBottom: 12,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10,
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
  },
  dateRange: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 600,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statBoxSecondary: {
    backgroundColor: '#7c3aed',
  },
  statBoxTertiary: {
    backgroundColor: '#06b6d4',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  dayCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dayTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e293b',
  },
  dayDate: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 600,
  },
  emptyDay: {
    fontSize: 9,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 700,
    color: '#1e293b',
  },
  colTime: {
    width: '18%',
  },
  colSubject: {
    width: '20%',
  },
  colTopic: {
    width: '38%',
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
  footer: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  notesSection: {
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 6,
  },
  noteLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderStyle: 'dashed',
    height: 12,
    marginBottom: 4,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureItem: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#475569',
    width: '100%',
  },
  branding: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 12,
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
              <Text style={[styles.tableCellHeader, styles.colTotal]}>HEDEF</Text>
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

  // Günleri iki sütuna böl - daha dengeli dağılım
  const leftColumnDays = DAYS.slice(0, 4); // Pazartesi - Perşembe
  const rightColumnDays = DAYS.slice(4);   // Cuma - Pazar

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

          {/* İki sütunlu düzen */}
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              {leftColumnDays.map(renderDaySection)}
            </View>
            <View style={styles.column}>
              {rightColumnDays.map(renderDaySection)}
            </View>
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
): Promise<Blob> {
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

export default WeeklyPlanDocument;