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
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#4f46e5',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
  },
  section: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 10,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: 700,
    width: 120,
    color: '#374151',
  },
  value: {
    fontSize: 9,
    flex: 1,
    color: '#1f2937',
  },
  notesBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginTop: 8,
    borderRadius: 4,
    minHeight: 60,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
  },
  ratingBox: {
    backgroundColor: '#eff6ff',
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: 4,
    fontSize: 8,
    borderRadius: 2,
    marginRight: 4,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Görüşme Bilgileri Formu</Text>
          <Text style={styles.subtitle}>
            Oluşturma Tarihi: {generatedDate}
          </Text>
        </View>

        {/* Temel Bilgiler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görüşme Özeti</Text>
          {schoolName && (
            <View style={styles.row}>
              <Text style={styles.label}>Okul:</Text>
              <Text style={styles.value}>{schoolName}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Öğrenci:</Text>
            <Text style={styles.value}>{studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tarih:</Text>
            <Text style={styles.value}>{sessionDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Saat:</Text>
            <Text style={styles.value}>
              {session.entryTime} - {formData.exitTime || '-'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Türü:</Text>
            <Text style={styles.value}>
              {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
            </Text>
          </View>
          {topicFullPath && (
            <View style={styles.row}>
              <Text style={styles.label}>Konu:</Text>
              <Text style={styles.value}>{topicFullPath}</Text>
            </View>
          )}
        </View>

        {/* Davranış ve Durum Değerlendirmesi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Davranış ve Durum Değerlendirmesi</Text>
          
          <View style={styles.ratingBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Duygusal Durum:</Text>
              <Text style={styles.value}>
                {emotionalStateLabels[formData.emotionalState as string] || '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fiziksel Durum:</Text>
              <Text style={styles.value}>
                {physicalStateLabels[formData.physicalState as string] || '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>İletişim Kalitesi:</Text>
              <Text style={styles.value}>
                {communicationLabels[formData.communicationQuality as string] || '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>İşbirliği Düzeyi:</Text>
              <Text style={styles.value}>{formData.cooperationLevel}/5</Text>
            </View>
          </View>
        </View>

        {/* Detaylı Notlar */}
        {formData.detailedNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Görüşme Notları</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{formData.detailedNotes}</Text>
            </View>
          </View>
        )}

        {/* Yapılacaklar */}
        {formData.actionItems && formData.actionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yapılacaklar ({formData.actionItems.length})</Text>
            {formData.actionItems.map((item, idx) => (
              <View key={idx} style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>Madde {idx + 1}:</Text>
                  <Text style={styles.value}>{item.description || '-'}</Text>
                </View>
                {item.assignedTo && (
                  <View style={{ marginLeft: 120, marginTop: 2 }}>
                    <Text style={{ fontSize: 8, color: '#666' }}>
                      Atanan: {item.assignedTo}
                      {item.dueDate && ` • Tarih: ${item.dueDate}`}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Takip Planı */}
        {formData.followUpNeeded && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Takip Planı</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Takip Tarihi:</Text>
              <Text style={styles.value}>
                {formData.followUpDate ? format(new Date(formData.followUpDate), 'dd MMMM yyyy', { locale: tr }) : '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Takip Saati:</Text>
              <Text style={styles.value}>{formData.followUpTime || '-'}</Text>
            </View>
            {formData.followUpPlan && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{formData.followUpPlan}</Text>
              </View>
            )}
          </View>
        )}
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
