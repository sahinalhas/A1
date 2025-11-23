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

// Pastel renk paleti - her gün için canlı soft renkler
const dayColors: Record<number, { header: [number, number, number]; light: [number, number, number]; dark: [number, number, number] }> = {
  1: { header: [100, 180, 220], light: [230, 245, 255], dark: [70, 130, 180] },      // Pastel Mavi (Pazartesi)
  2: { header: [255, 140, 170], light: [255, 235, 245], dark: [220, 80, 130] },      // Pastel Pembe (Salı)
  3: { header: [130, 220, 150], light: [235, 255, 240], dark: [60, 170, 100] },      // Pastel Yeşil (Çarşamba)
  4: { header: [255, 200, 100], light: [255, 245, 210], dark: [220, 140, 40] },      // Pastel Turuncu (Perşembe)
  5: { header: [150, 180, 255], light: [240, 245, 255], dark: [80, 120, 220] },      // Pastel Lila (Cuma)
  6: { header: [220, 160, 220], light: [250, 235, 250], dark: [180, 100, 180] },     // Pastel Mor (Cumartesi)
  7: { header: [255, 160, 160], light: [255, 240, 240], dark: [220, 80, 80] },       // Pastel Kırmızı (Pazar)
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
    { value: 1, label: 'Pazartesi', shortLabel: 'Paz' },
    { value: 2, label: 'Salı', shortLabel: 'Sal' },
    { value: 3, label: 'Carsamba', shortLabel: 'Car' },
    { value: 4, label: 'Persembe', shortLabel: 'Per' },
    { value: 5, label: 'Cuma', shortLabel: 'Cum' },
    { value: 6, label: 'Cumartesi', shortLabel: 'Cum' },
    { value: 7, label: 'Pazar', shortLabel: 'Paz' },
  ];

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let yPos = margin;
  let isFirstPage = true;

  // ===== FIRST PAGE HEADER =====
  const addHeader = () => {
    if (!isFirstPage) return;

    const headerColors = dayColors[1].header;
    doc.setFillColor(headerColors[0], headerColors[1], headerColors[2]);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFontSize(16);
    doc.setFont('courier', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Haftalik Konu Plani', margin, 8);

    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.setTextColor(240, 255, 255);
    const displayName = studentName ? `Ogrenci: ${studentName}` : `Ogrenci ID: ${studentId}`;
    doc.text(displayName, margin, 15);

    const startDate = new Date(weekStart + 'T00:00:00');
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;

    doc.setFontSize(8);
    doc.text(`Donem: ${dateRange}  |  Toplam: ${totalHours}s ${totalMins}dk  |  Konular: ${plan.length}`, margin, 22);

    yPos = 32;
    isFirstPage = false;
  };

  addHeader();

  // ===== DAILY SECTIONS =====
  DAYS.forEach((day, index) => {
    const date = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(date) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    if (entries.length === 0) return;

    const dayColor = dayColors[day.value];
    const dayTotal = entries.reduce((sum, e) => sum + e.allocated, 0);

    // Add new page if needed
    if (yPos > pageHeight - 45) {
      doc.addPage();
      yPos = margin;
    }

    // Day section header - pastel background
    doc.setFillColor(dayColor.light[0], dayColor.light[1], dayColor.light[2]);
    doc.rect(margin - 1, yPos - 4, pageWidth - 2 * margin + 2, 10, 'F');

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(dayColor.dark[0], dayColor.dark[1], dayColor.dark[2]);
    doc.text(`${day.label} • ${date}`, margin + 1.5, yPos + 1.5);

    doc.setFontSize(9);
    doc.text(`${dayTotal} dakika`, pageWidth - margin - 15, yPos + 1.5);

    yPos += 11;

    // Create table data
    const tableData = entries.map((p) => {
      const sub = subjects.find((s) => s.id === p.subjectId);
      const top = topics.find((t) => t.id === p.topicId);
      const total = top?.avgMinutes || 0;
      const pct = total > 0 ? Math.round(((total - p.remainingAfter) / total) * 100) : 0;

      return [
        p.start.substring(0, 5),
        sub?.name || '',
        top?.name || '',
        `${p.allocated}dk`,
        `%${pct}`,
      ];
    });

    // Day-specific table with colored header
    const tableConfig: any = {
      startY: yPos,
      head: [['Saat', 'Ders', 'Konu', 'Sure', 'Ilerleme']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [dayColor.header[0], dayColor.header[1], dayColor.header[2]],
        textColor: [255, 255, 255],
        fontSize: 8,
        font: 'courier',
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.4,
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        fontSize: 7,
        font: 'courier',
        cellPadding: 1.5,
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [dayColor.light[0], dayColor.light[1], dayColor.light[2]],
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold', textColor: dayColor.dark, halign: 'center' },
        1: { cellWidth: 32 },
        2: { cellWidth: 65 },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 16, halign: 'center', fontStyle: 'bold', textColor: dayColor.dark },
      },
      margin: { left: margin, right: margin, top: 0, bottom: 8 },
      didDrawPage: function (data: any) {
        yPos = data.cursor.y;
      },
    };

    autoTable(doc, tableConfig);
    yPos = (doc.lastAutoTable?.finalY || yPos) + 6;
  });

  // ===== FOOTER =====
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.setFont('courier', 'normal');

    const footerY = pageHeight - 4;
    doc.text(
      `Olusturulma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR').substring(0, 5)}`,
      margin,
      footerY
    );

    doc.setFont('courier', 'bold');
    doc.setTextColor(120, 120, 120);
    doc.text(`Sayfa ${i}/${pageCount}`, pageWidth - margin - 15, footerY);

    doc.setTextColor(100, 140, 200);
    doc.text('Rehber360 - Ogrenci Rehberlik Sistemi', pageWidth - margin - 50, footerY);
  }

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
