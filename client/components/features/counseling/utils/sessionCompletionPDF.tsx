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
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    marginTop: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    minHeight: 25,
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    justifyContent: 'center',
  },
  tableCellNoBorder: {
    flex: 1,
    padding: 5,
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: 700,
  },
  value: {
    fontSize: 9,
    fontWeight: 400,
    marginTop: 2,
  },
  meetingInfo: {
    marginTop: 20,
  },
  meetingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  meetingLabel: {
    fontSize: 9,
    fontWeight: 700,
    width: 180,
  },
  meetingValue: {
    fontSize: 9,
    fontWeight: 400,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    textDecoration: 'underline',
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
  const sessionDate = format(new Date(session.sessionDate), 'dd/MM/yyyy', { locale: tr });
  
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

  // Öğrenci bilgilerini PDF'deki gibi düzenle
  const studentInfoRows = [
    [
      { label: 'Öğrencinin Adı Soyadı:', value: studentName },
      { label: 'Cinsiyeti:', value: session.student?.gender === 'female' ? 'Kız' : session.student?.gender === 'male' ? 'Erkek' : '' }
    ],
    [
      { label: 'T.C. Kimlik Nu:', value: session.student?.tcIdentityNumber || '' },
      { label: 'Uyruğu:', value: 'T.C.' }
    ],
    [
      { label: 'Kademe:', value: session.student?.educationLevel || '' },
      { label: 'Öğrenci Numarası:', value: session.student?.studentNumber || '' }
    ],
    [
      { label: 'Okulu:', value: schoolName || '' },
      { label: 'Yıl Sonu Başarı:', value: session.student?.yearEndSuccess || '' }
    ],
    [
      { label: 'Sınıfı:', value: session.student?.className || '' },
      { label: 'Devamsızlık Gün Sayısı:', value: session.student?.absenceDays || '' }
    ],
    [
      { label: 'Aile Bilgisi :', value: session.student?.familyInfo || '' },
      { label: 'Dönem:', value: session.student?.term || '' }
    ],
    [
      { label: 'Sağlık Bilgisi :', value: session.student?.healthInfo || 'Sürekli hastalığı yok' },
      { label: 'Özel Eğitim Bilgisi:', value: session.student?.specialEducationInfo || 'Yok' }
    ]
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Başlık */}
        <Text style={styles.title}>GÖRÜŞME BİLGİLERİ FORMU</Text>
        <Text style={[styles.title, { fontSize: 12, fontWeight: 400, textTransform: 'none' }]}>
          Rehberlik Hizmetleri
        </Text>

        {/* Öğrenci Bilgileri Tablosu */}
        <View style={styles.table}>
          {studentInfoRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <View 
                  key={cellIndex} 
                  style={cellIndex === row.length - 1 ? styles.tableCellNoBorder : styles.tableCell}
                >
                  <Text style={styles.label}>{cell.label}</Text>
                  <Text style={styles.value}>{cell.value}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Görüşme Bilgileri */}
        <View style={styles.meetingInfo}>
          <View style={styles.meetingRow}>
            <Text style={styles.meetingLabel}>Görüşme Tarihi ve Saati :</Text>
            <Text style={styles.meetingValue}>
              {sessionDate} - {session.entryTime}
            </Text>
          </View>

          <View style={styles.meetingRow}>
            <Text style={styles.meetingLabel}>Görüşme Yeri :</Text>
            <Text style={styles.meetingValue}>Rehberlik Servisi</Text>
          </View>

          {topicFullPath && (
            <View style={styles.meetingRow}>
              <Text style={styles.meetingLabel}>Rehberlik Alanı :</Text>
              <Text style={styles.meetingValue}>{topicFullPath}</Text>
            </View>
          )}

          <View style={styles.meetingRow}>
            <Text style={styles.meetingLabel}>Oturum Sayısı :</Text>
            <Text style={styles.meetingValue}>0</Text>
          </View>

          <View style={styles.meetingRow}>
            <Text style={styles.meetingLabel}>Öğretmen Adı :</Text>
            <Text style={styles.meetingValue}></Text>
          </View>
        </View>

        {/* Görüşme Detayları */}
        <Text style={styles.sectionTitle}>Görüşme Detayları</Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.label}>Duygusal Durum:</Text>
              <Text style={styles.value}>{emotionalStateLabels[formData.emotionalState as string] || '-'}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text style={styles.label}>Fiziksel Durum:</Text>
              <Text style={styles.value}>{physicalStateLabels[formData.physicalState as string] || '-'}</Text>
            </View>
            <View style={styles.tableCellNoBorder}>
              <Text style={styles.label}>İletişim Kalitesi:</Text>
              <Text style={styles.value}>{communicationLabels[formData.communicationQuality as string] || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text style={styles.label}>İşbirliği Düzeyi:</Text>
              <Text style={styles.value}>{formData.cooperationLevel}/5</Text>
            </View>
            <View style={styles.tableCellNoBorder}>
              <Text style={styles.label}>Görüşme Süresi:</Text>
              <Text style={styles.value}>{session.entryTime} - {formData.exitTime || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Görüşme Ayrıntıları */}
        {formData.detailedNotes && (
          <>
            <Text style={styles.sectionTitle}>Görüşme Ayrıntıları</Text>
            <View style={[styles.tableRow, { minHeight: 100 }]}>
              <View style={styles.tableCellNoBorder}>
                <Text style={styles.value}>{formData.detailedNotes}</Text>
              </View>
            </View>
          </>
        )}

        {/* Yapılacaklar */}
        {formData.actionItems && formData.actionItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Yapılacaklar</Text>
            <View style={styles.table}>
              {formData.actionItems.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCellNoBorder}>
                    <Text style={styles.value}>{index + 1}. {item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Takip Planı */}
        {formData.followUpNeeded && (
          <>
            <Text style={styles.sectionTitle}>Takip Planı</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.label}>Takip Tarihi:</Text>
                  <Text style={styles.value}>
                    {formData.followUpDate ? format(new Date(formData.followUpDate), 'dd/MM/yyyy', { locale: tr }) : '-'}
                  </Text>
                </View>
                <View style={styles.tableCellNoBorder}>
                  <Text style={styles.label}>Takip Saati:</Text>
                  <Text style={styles.value}>{formData.followUpTime || '-'}</Text>
                </View>
              </View>
              {formData.followUpPlan && (
                <View style={styles.tableRow}>
                  <View style={styles.tableCellNoBorder}>
                    <Text style={styles.value}>{formData.followUpPlan}</Text>
                  </View>
                </View>
              )}
            </View>
          </>
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
  const fileName = `Gorusme_Bilgileri_Formu_${studentName}_${dateStr}.pdf`;

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