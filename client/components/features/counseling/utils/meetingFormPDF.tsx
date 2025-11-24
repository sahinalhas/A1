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
import type { CounselingSession } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { SESSION_MODE_LABELS, SESSION_LOCATION_LABELS } from '@shared/constants/common.constants';

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
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10,
    color: '#000',
  },
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  halfColumn: {
    flex: 1,
    flexDirection: 'row',
  },
  label: {
    fontSize: 9,
    fontWeight: 700,
    marginRight: 4,
  },
  value: {
    fontSize: 9,
    flex: 1,
  },
  fullRow: {
    marginBottom: 6,
  },
  detailsBox: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    marginTop: 10,
  },
  detailsTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
});

interface MeetingFormPDFProps {
  session: CounselingSession;
  sessionNumber?: number;
  topicFullPath?: string;
  schoolName?: string;
}

const MeetingFormDocument: React.FC<MeetingFormPDFProps> = ({ session, sessionNumber, topicFullPath, schoolName }) => {
  const student = session.student;
  const sessionDate = session.sessionDate ? format(new Date(session.sessionDate), 'dd/MM/yyyy', { locale: tr }) : '';
  const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: tr });

  // Öğrenci bilgileri
  const studentName = student ? `${student.name || ''} ${student.surname || ''}`.trim() : '-';
  const studentNumber = '-';
  const tcNo = '-';
  const genderMap: { [key: string]: string } = { 'K': 'Kız', 'E': 'Erkek' };
  const gender = (student as any)?.gender ? genderMap[(student as any).gender] : '-';
  const citizenship = '-';
  const grade = student?.className || student?.class || '-';
  const school = schoolName || '-';
  const averageScore = '-';
  const absentDays = '-';
  const familyStatus = '-';
  const healthInfo = '-';
  const specialEducation = '-';
  
  // Görüşme bilgileri
  const sessionTime = session.entryTime || '-';
  const sessionLocation = SESSION_LOCATION_LABELS[session.sessionLocation] || session.sessionLocation || '-';
  const counselingArea = topicFullPath || session.topic || '-';
  const teacherName = session.teacherName || '';
  const parentName = session.parentName || '';
  
  // Detaylı notlar
  const sessionDetails = session.detailedNotes || session.sessionDetails || '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Başlık ve Tarih */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Öğrenci Bilgileri Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öğrenci Bilgileri</Text>
          
          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Öğrencinin Adı Soyadı:</Text>
              <Text style={styles.value}>{studentName}</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Cinsiyeti:</Text>
              <Text style={styles.value}>{gender}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>T.C. Kimlik Nu:</Text>
              <Text style={styles.value}>{tcNo}</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Uyruğu:</Text>
              <Text style={styles.value}>{citizenship}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Kademe:</Text>
              <Text style={styles.value}>Ortaokul</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Öğrenci Numarası:</Text>
              <Text style={styles.value}>{studentNumber}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Okulu:</Text>
              <Text style={styles.value}>{school}</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Yıl Sonu Başarı:</Text>
              <Text style={styles.value}>{averageScore}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Sınıfı:</Text>
              <Text style={styles.value}>{grade}</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Devamsızlık Gün Sayısı:</Text>
              <Text style={styles.value}>{absentDays}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Aile Bilgisi:</Text>
              <Text style={styles.value}>{familyStatus}</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Dönem:</Text>
              <Text style={styles.value}>{new Date().getFullYear()}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Sağlık Bilgisi:</Text>
              <Text style={styles.value}>{healthInfo}</Text>
            </View>
            <View style={styles.halfColumn}>
              <Text style={styles.label}>Özel Eğitim Bilgisi:</Text>
              <Text style={styles.value}>{specialEducation}</Text>
            </View>
          </View>
        </View>

        {/* Görüşme Bilgileri Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görüşme Bilgileri</Text>
          
          <View style={styles.fullRow}>
            <Text style={styles.label}>
              Görüşme Tarihi ve Saati: <Text style={styles.value}>{sessionDate} - {sessionTime}</Text>
            </Text>
          </View>

          <View style={styles.fullRow}>
            <Text style={styles.label}>
              Görüşme Yeri: <Text style={styles.value}>{sessionLocation}</Text>
            </Text>
          </View>

          <View style={styles.fullRow}>
            <Text style={styles.label}>
              Rehberlik Alanı: <Text style={styles.value}>{counselingArea}</Text>
            </Text>
          </View>

          <View style={styles.fullRow}>
            <Text style={styles.label}>
              Oturum Sayısı: <Text style={styles.value}>{sessionNumber || 0}</Text>
            </Text>
          </View>

          {teacherName && (
            <View style={styles.fullRow}>
              <Text style={styles.label}>
                Öğretmen Adı: <Text style={styles.value}>{teacherName}</Text>
              </Text>
            </View>
          )}

          {parentName && (
            <View style={styles.fullRow}>
              <Text style={styles.label}>
                Veli Adı: <Text style={styles.value}>{parentName}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Görüşme Ayrıntıları */}
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Görüşme Ayrıntıları</Text>
          <Text style={styles.detailsText}>{sessionDetails}</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generateMeetingFormPDF(
  session: CounselingSession,
  sessionNumber?: number,
  topicFullPath?: string,
  schoolName?: string
) {
  const blob = await pdf(
    <MeetingFormDocument session={session} sessionNumber={sessionNumber} topicFullPath={topicFullPath} schoolName={schoolName} />
  ).toBlob();

  const studentName = session.student 
    ? `${session.student.name || ''}_${session.student.surname || ''}`.trim().replace(/\s+/g, '_')
    : 'Ogrenci';
    
  const dateStr = format(new Date(session.sessionDate || new Date()), 'yyyyMMdd');
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
