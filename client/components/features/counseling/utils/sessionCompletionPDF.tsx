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
import type { CounselingSession, CompleteSessionFormValues } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

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
    padding: 35,
    fontFamily: 'Roboto',
    fontSize: 9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'right',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#d1d5db',
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  column: {
    flex: 1,
    marginRight: 15,
    flexDirection: 'row',
  },
  lastColumn: {
    flex: 1,
    flexDirection: 'row',
  },
  label: {
    fontSize: 8,
    fontWeight: 700,
    color: '#374151',
    width: 100,
  },
  value: {
    fontSize: 9,
    flex: 1,
    color: '#1f2937',
  },
  fullRow: {
    marginBottom: 8,
    flexDirection: 'row',
  },
  fullRowLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#374151',
    width: 100,
  },
  fullRowValue: {
    fontSize: 9,
    flex: 1,
    color: '#1f2937',
  },
  notesBox: {
    backgroundColor: '#f9fafb',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    padding: 10,
    marginTop: 8,
    minHeight: 50,
  },
  notesText: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: '#374151',
  },
  evaluationBox: {
    backgroundColor: '#fafafa',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    padding: 10,
    marginTop: 8,
  },
  evaluationRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

interface SessionCompletionPDFProps {
  session: CounselingSession;
  formData: CompleteSessionFormValues;
  topicFullPath?: string;
  schoolName?: string;
}

const SessionCompletionDocument: React.FC<SessionCompletionPDFProps> = ({
  session,
  formData,
  topicFullPath,
  schoolName,
}) => {
  const sessionDate = format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: tr });
  const generatedDate = format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr });

  const studentName = session.sessionType === 'individual'
    ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim()
    : session.groupName || 'Grup Görüşmesi';

  const emotionalStateLabels: { [key: string]: string } = {
    'sakin': 'Sakin',
    'kaygılı': 'Kaygılı',
    'üzgün': 'Üzgün',
    'sinirli': 'Sinirli',
    'mutlu': 'Mutlu',
    'karışık': 'Karışık',
    'diğer': 'Diğer',
  };

  const physicalStateLabels: { [key: string]: string } = {
    'normal': 'Normal',
    'yorgun': 'Yorgun',
    'enerjik': 'Enerjik',
    'huzursuz': 'Huzursuz',
    'hasta': 'Hasta',
  };

  const communicationLabels: { [key: string]: string } = {
    'açık': 'Açık',
    'çekingen': 'Çekingen',
    'dirençli': 'Dirençli',
    'sınırlı': 'Sınırlı',
  };

  const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: tr });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Görüşme Bilgileri Formu</Text>
            <Text style={styles.subtitle}>Rehberlik Hizmetleri</Text>
          </View>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Öğrenci Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öğrenci Bilgileri</Text>
          
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Öğrencinin Adı Soyadı:</Text>
              <Text style={styles.value}>{studentName}</Text>
            </View>
            <View style={styles.lastColumn}>
              <Text style={styles.label}>Türü:</Text>
              <Text style={styles.value}>{session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}</Text>
            </View>
          </View>

          {schoolName && (
            <View style={styles.fullRow}>
              <Text style={styles.fullRowLabel}>Okul:</Text>
              <Text style={styles.fullRowValue}>{schoolName}</Text>
            </View>
          )}
        </View>

        {/* Görüşme Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görüşme Bilgileri</Text>
          
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Görüşme Tarihi:</Text>
              <Text style={styles.value}>{sessionDate}</Text>
            </View>
            <View style={styles.lastColumn}>
              <Text style={styles.label}>Görüşme Saati:</Text>
              <Text style={styles.value}>{session.entryTime} - {formData.exitTime || '-'}</Text>
            </View>
          </View>

          {topicFullPath && (
            <View style={styles.fullRow}>
              <Text style={styles.fullRowLabel}>Rehberlik Alanı:</Text>
              <Text style={styles.fullRowValue}>{topicFullPath}</Text>
            </View>
          )}

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <Text style={styles.label}>Duygusal Durum:</Text>
              <Text style={styles.value}>{emotionalStateLabels[formData.emotionalState as string] || '-'}</Text>
            </View>
            <View style={styles.lastColumn}>
              <Text style={styles.label}>Fiziksel Durum:</Text>
              <Text style={styles.value}>{physicalStateLabels[formData.physicalState as string] || '-'}</Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <Text style={styles.label}>İletişim Kalitesi:</Text>
              <Text style={styles.value}>{communicationLabels[formData.communicationQuality as string] || '-'}</Text>
            </View>
            <View style={styles.lastColumn}>
              <Text style={styles.label}>İşbirliği Düzeyi:</Text>
              <Text style={styles.value}>{formData.cooperationLevel}/5</Text>
            </View>
          </View>
        </View>

        {/* Görüşme Ayrıntıları */}
        {formData.detailedNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Görüşme Ayrıntıları</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{formData.detailedNotes}</Text>
            </View>
          </View>
        )}

        {/* Yapılacaklar */}
        {formData.actionItems && formData.actionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yapılacaklar</Text>
            {formData.actionItems.map((item, idx) => (
              <View key={idx} style={styles.fullRow}>
                <Text style={styles.fullRowLabel}>{idx + 1}. Madde:</Text>
                <Text style={styles.fullRowValue}>{item.description || '-'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Takip Planı */}
        {formData.followUpNeeded && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Takip Planı</Text>
            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <Text style={styles.label}>Takip Tarihi:</Text>
                <Text style={styles.value}>
                  {formData.followUpDate ? format(new Date(formData.followUpDate), 'dd/MM/yyyy', { locale: tr }) : '-'}
                </Text>
              </View>
              <View style={styles.lastColumn}>
                <Text style={styles.label}>Takip Saati:</Text>
                <Text style={styles.value}>{formData.followUpTime || '-'}</Text>
              </View>
            </View>
            {formData.followUpPlan && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{formData.followUpPlan}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Rehber360 • Rehberlik Bilgi Yönetim Sistemi • Otomatik Oluşturulmuş</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateSessionCompletionPDF(
  session: CounselingSession,
  formData?: Partial<CompleteSessionFormValues>,
  topicFullPath?: string,
  schoolName?: string
) {
  const defaultFormData: CompleteSessionFormValues = {
    topic: '',
    exitTime: new Date().toTimeString().slice(0, 5),
    detailedNotes: '',
    actionItems: [],
    followUpNeeded: false,
    cooperationLevel: 3,
    emotionalState: 'sakin',
    physicalState: 'normal',
    communicationQuality: 'açık',
    followUpDate: undefined,
    followUpTime: undefined,
  };
  
  const finalFormData = { ...defaultFormData, ...formData } as CompleteSessionFormValues;
  
  const blob = await pdf(
    <SessionCompletionDocument session={session} formData={finalFormData} topicFullPath={topicFullPath} schoolName={schoolName} />
  ).toBlob();

  const studentName = session.student
    ? `${session.student.name || ''}_${session.student.surname || ''}`.trim().replace(/\s+/g, '_')
    : 'Ogrenci';

  const dateStr = format(new Date(session.sessionDate || new Date()), 'yyyyMMdd_HHmm');
  const fileName = `Gorusme_Tamamlama_${studentName}_${dateStr}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  return {
    success: true,
    fileName,
  };
}
