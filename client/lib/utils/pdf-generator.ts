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

// Color scheme for different exam types
const categoryColors: Record<string, { header: [number, number, number]; light: [number, number, number] }> = {
  'TYT': { header: [59, 130, 246], light: [219, 234, 254] },      // Blue
  'AYT': { header: [168, 85, 247], light: [243, 232, 255] },      // Purple
  'YDT': { header: [249, 115, 22], light: [255, 237, 213] },      // Orange
  'default': { header: [100, 116, 139], light: [241, 245, 249] }  // Slate
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
  const margin = 15;
  let yPos = margin;

  // ===== HEADER SECTION (Colorful Banner) =====
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('📚 Haftalık Konu Planı', margin + 2, 12);

  // Subtitle with student name
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(219, 234, 254);
  const displayName = studentName ? `Öğrenci: ${studentName}` : `Öğrenci ID: ${studentId}`;
  doc.text(displayName, margin + 2, 20);

  yPos = 42;

  // ===== INFO SECTION =====
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  // Info cards
  const infoItems = [
    `📅 ${dateRange}`,
    `⏱️ Toplam: ${totalHours}s ${totalMins}dk`,
    `📖 ${plan.length} Konu`
  ];

  let infoX = margin;
  for (const item of infoItems) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(item, infoX, yPos);
    infoX += 65;
  }

  yPos += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // ===== DAILY SECTIONS =====
  DAYS.forEach((day) => {
    const date = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(date) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    if (entries.length === 0) return;

    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Day header with colored background
    const dayTotal = entries.reduce((sum, e) => sum + e.allocated, 0);
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 6, pageWidth - 2 * margin, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`${day.label} • ${date}`, margin + 3, yPos + 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(219, 234, 254);
    doc.text(`${dayTotal} dakika`, pageWidth - margin - 20, yPos + 1);

    yPos += 10;

    // Create table data with color coding
    const tableData = entries.map((p) => {
      const sub = subjects.find((s) => s.id === p.subjectId);
      const top = topics.find((t) => t.id === p.topicId);
      const total = top?.avgMinutes || 0;
      const pct = total > 0 ? Math.round(((total - p.remainingAfter) / total) * 100) : 0;

      // Get category color
      const cat = sub?.category || 'default';
      const colors = categoryColors[cat] || categoryColors['default'];

      return [
        `${p.start}-${p.end}`,
        `${sub?.name || ''}${sub?.category ? ` (${sub.category})` : ''}`,
        top?.name || '',
        `${p.allocated} dk`,
        `%${pct}`,
      ];
    });

    // Table with colored headers based on category
    const tableConfig: any = {
      startY: yPos,
      head: [['Saat', 'Ders', 'Konu', 'Süre', 'İlerleme']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 3,
      },
      bodyStyles: {
        textColor: [40, 40, 40],
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: [219, 234, 254],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 70 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
      didDrawPage: function (data: any) {
        yPos = data.cursor.y + 5;
      },
    };

    autoTable(doc, tableConfig);
    yPos = (doc.lastAutoTable?.finalY || yPos) + 8;
  });

  // ===== FOOTER SECTION =====
  if (yPos > pageHeight - 20) {
    doc.addPage();
    yPos = margin;
  }

  yPos = pageHeight - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 4;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Oluşturulma: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`,
    margin,
    yPos
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text('Rehber360 - Öğrenci Rehberlik Sistemi', pageWidth - margin - 60, yPos);

  const fileName = `Haftalik_Konu_Plani_${weekStart}_${studentName?.replace(/\s+/g, '_') || studentId}.pdf`;
  
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
