import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PlanEntry {
  date: string;
  start: string;
  end: string;
  subjectId: string;
  topicId: string;
  allocated: number;
  remainingAfter: number;
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

// Soft color palette - zarif ve şık minimal
const softColors = {
  primary: [107, 114, 128],
  light: [243, 244, 246],
  accent: [126, 130, 148],
  text: [55, 65, 81],
  border: [229, 231, 235],
};

export function generateTopicPlanPDF(
  plan: PlanEntry[],
  planByDate: Map<string, PlanEntry[]>,
  weekStart: string,
  subjects: Subject[],
  topics: Topic[],
  studentId: string,
  studentName?: string,
  options: { download?: boolean; print?: boolean } = { download: true, print: false }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as jsPDF & { lastAutoTable?: { finalY: number } };

  const DAYS = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
    { value: 7, label: 'Pazar' },
  ];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  let yPos = margin;

  // ===== COMPACT HEADER =====
  doc.setFillColor(100, 116, 139);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setFontSize(14);
  doc.setFont('courier', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Haftalik Konu Plani', margin, 6);

  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setTextColor(220, 224, 235);
  const displayName = studentName ? `Ogrenci: ${studentName}` : `Ogrenci ID: ${studentId}`;
  doc.text(displayName, margin, 12);

  yPos = 25;

  // ===== COMPACT INFO =====
  doc.setTextColor(55, 65, 81);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);

  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  doc.text(`Donem: ${dateRange}  |  Toplam: ${totalHours}s ${totalMins}dk  |  Konular: ${plan.length}`, margin, yPos);
  
  yPos += 4;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 3;

  // ===== COMPACT DAILY SECTIONS =====
  const allEntries: Array<{day: string; date: string; entry: PlanEntry}> = [];
  
  DAYS.forEach((day) => {
    const date = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(date) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));
    
    entries.forEach(entry => {
      allEntries.push({ day: day.label, date, entry });
    });
  });

  // Build compact table with all entries
  const tableData = allEntries.map((item) => {
    const sub = subjects.find((s) => s.id === item.entry.subjectId);
    const top = topics.find((t) => t.id === item.entry.topicId);
    const total = top?.avgMinutes || 0;
    const pct = total > 0 ? Math.round(((total - item.entry.remainingAfter) / total) * 100) : 0;
    
    return [
      item.day.substring(0, 3),
      item.date.substring(5),
      item.entry.start.substring(0, 5),
      sub?.name || '',
      top?.name || '',
      `${item.entry.allocated}dk`,
      `%${pct}`,
    ];
  });

  // Single compact table
  const tableConfig: any = {
    startY: yPos,
    head: [['Gun', 'Tarih', 'Saat', 'Ders', 'Konu', 'Sure', 'Ilerleme']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [100, 116, 139],
      textColor: [255, 255, 255],
      fontSize: 7,
      font: 'courier',
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.5,
      lineColor: [229, 231, 235],
      lineWidth: 0.3,
    },
    bodyStyles: {
      textColor: [55, 65, 81],
      fontSize: 6,
      font: 'courier',
      cellPadding: 1,
      lineColor: [241, 245, 249],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold', textColor: [100, 116, 139], halign: 'center' },
      1: { cellWidth: 14, halign: 'center' },
      2: { cellWidth: 13, halign: 'center' },
      3: { cellWidth: 28 },
      4: { cellWidth: 50 },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139] },
    },
    margin: { left: margin, right: margin, top: 0, bottom: 12 },
    didDrawPage: function (data: any) {
      yPos = data.cursor.y;
    },
  };

  autoTable(doc, tableConfig);
  yPos = (doc.lastAutoTable?.finalY || yPos) + 2;

  // ===== COMPACT FOOTER =====
  doc.setFontSize(6);
  doc.setTextColor(126, 130, 148);
  doc.setFont('courier', 'normal');
  
  const footerY = pageHeight - 5;
  doc.text(
    `Olusturulma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR').substring(0, 5)}`,
    margin,
    footerY
  );
  
  doc.setFont('courier', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Rehber360 - Ogrenci Rehberlik Sistemi', pageWidth - margin - 35, footerY);

  const fileName = `Haftalik_Konu_Plani_${weekStart}_${studentName?.replace(/[^a-zA-Z0-9]/g, '_') || studentId}.pdf`;
  
  if (options.print) {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      };
    }
  } else if (options.download) {
    doc.save(fileName);
  }
  
  return doc;
}

function dateFromWeekStartLocal(weekStartISO: string, day: number) {
  const d = new Date(weekStartISO + 'T00:00:00');
  const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
  return result.toISOString().slice(0, 10);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
