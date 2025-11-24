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
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    borderTopWidth: 3,
    borderTopColor: '#1a237e',
    paddingTop: 15,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a237e',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  studentName: {
    fontSize: 10,
    color: '#212121',
  },
  dateRange: {
    fontSize: 8,
    color: '#757575',
    marginTop: 2,
  },
  statsBox: {
    backgroundColor: '#e8eaf6',
    padding: 8,
    borderRadius: 4,
    marginTop: 15,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 8,
    color: '#212121',
    textAlign: 'center',
  },
  columnsContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  column: {
    flex: 1,
  },
  daySection: {
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  dayContentColumn: {
    flex: 2.5,
  },
  dayNotesColumn: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1a237e',
  },
  dayDate: {
    fontSize: 8,
    color: '#757575',
  },
  emptyDay: {
    fontSize: 7,
    color: '#9e9e9e',
    fontStyle: 'italic',
    marginTop: 4,
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  tableCell: {
    fontSize: 7,
    color: '#212121',
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 700,
    color: '#1a237e',
  },
  colTime: {
    width: '20%',
  },
  colSubject: {
    width: '28%',
  },
  colTopic: {
    width: '32%',
  },
  colTarget: {
    width: '10%',
    textAlign: 'center',
  },
  colSolved: {
    width: '10%',
    textAlign: 'center',
  },
  notesArea: {
    fontSize: 7,
    color: '#757575',
    marginTop: 2,
  },
  notesLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    borderStyle: 'dashed',
    height: 10,
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginBottom: 15,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: '#1a237e',
    marginBottom: 4,
  },
  noteLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderStyle: 'dashed',
    height: 15,
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
    fontSize: 7,
    color: '#757575',
    marginBottom: 2,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#212121',
    width: '80%',
  },
  branding: {
    fontSize: 7,
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 15,
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

function formatDate(date: Date): string {
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
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

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
      <View key={day.value} style={styles.daySection}>
        <View style={styles.dayContentColumn}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayTitle}>{day.label}</Text>
            <Text style={styles.dayDate}>{formatDate(new Date(dateISO))}</Text>
          </View>

          {entries.length === 0 ? (
            <Text style={styles.emptyDay}>- Planlanmış çalışma yok -</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, styles.colTime]}>Saat</Text>
                <Text style={[styles.tableCellHeader, styles.colSubject]}>Ders</Text>
                <Text style={[styles.tableCellHeader, styles.colTopic]}>Konu</Text>
                <Text style={[styles.tableCellHeader, styles.colTarget]}>Hdf</Text>
                <Text style={[styles.tableCellHeader, styles.colSolved]}>Çz</Text>
              </View>
              {entries.map((entry, idx) => {
                const subject = subjects.find((s) => s.id === entry.subjectId);
                const topic = topics.find((t) => t.id === entry.topicId);
                
                return (
                  <View key={`${entry.topicId}-${idx}`} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colTime]}>{entry.start}</Text>
                    <Text style={[styles.tableCell, styles.colSubject]}>
                      {subject?.name?.substring(0, 12) || ''}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTopic]}>
                      {topic?.name?.substring(0, 20) || ''}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTarget]}>
                      {entry.targetQuestionCount || '-'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colSolved]}>-</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.dayNotesColumn}>
          <Text style={styles.notesArea}>Notlar:</Text>
          <View style={styles.notesLine} />
          <View style={styles.notesLine} />
          <View style={styles.notesLine} />
          {entries.length > 3 && (
            <>
              <View style={styles.notesLine} />
              <View style={styles.notesLine} />
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>HAFTALIK ÇALIŞMA PLANI</Text>
            <View style={styles.headerRight}>
              <Text style={styles.studentName}>{studentName || studentId}</Text>
              <Text style={styles.dateRange}>{dateRange}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsBox}>
          <Text style={styles.statsText}>
            Toplam Süre: {totalHours}sa {totalMins}dk | Etüt Sayısı: {plan.length} | Hedef Soru: {totalQuestions}
          </Text>
        </View>

        <View style={styles.columnsContainer}>
          {DAYS.map(renderDaySection)}
        </View>

        <View style={styles.footer}>
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>HAFTALIK NOTLAR / EKSİKLER:</Text>
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

          <Text style={styles.branding}>Rehber360 • Akıllı Çalışma Sistemi</Text>
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

  const fileName = `Haftalik_Calisma_Plani_${weekStart}.pdf`;

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
