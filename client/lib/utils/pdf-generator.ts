import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

export function generateTopicPlanPDF(
  plan: PlanEntry[],
  planByDate: Map<string, PlanEntry[]>,
  weekStart: string,
  subjects: Subject[],
  topics: Topic[],
  studentId: string,
  options: { download?: boolean; print?: boolean } = { download: true, print: false }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Haftalık Konu Planı', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  
  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  doc.text(dateRange, margin, yPos);
  yPos += 10;

  doc.setDrawColor(220);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(`Toplam Çalışma Süresi: ${totalHours} saat ${totalMins} dakika`, margin, yPos);
  yPos += 6;
  doc.text(`Toplam Konu Sayısı: ${plan.length}`, margin, yPos);
  yPos += 10;

  DAYS.forEach((day) => {
    const date = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(date) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    if (entries.length === 0) return;

    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFillColor(245, 245, 250);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`${day.label} - ${date}`, margin + 2, yPos);

    const dayTotal = entries.reduce((sum, e) => sum + e.allocated, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${dayTotal} dk`, pageWidth - margin - 15, yPos);
    yPos += 8;

    const tableData = entries.map((p) => {
      const sub = subjects.find((s) => s.id === p.subjectId);
      const top = topics.find((t) => t.id === p.topicId);
      const total = top?.avgMinutes || 0;
      const pct = total > 0 ? Math.round(((total - p.remainingAfter) / total) * 100) : 0;

      return [
        `${p.start} - ${p.end}`,
        `${sub?.name || ''}${sub?.category ? ` (${sub.category})` : ''}`,
        top?.name || '',
        `${p.allocated} dk`,
        `%${pct}`,
      ];
    });

    (doc as any).autoTable({
      startY: yPos,
      head: [['Saat', 'Ders', 'Konu', 'Süre', 'İlerleme']],
      body: tableData,
      theme: 'plain',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [100, 100, 100],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2,
      },
      bodyStyles: {
        textColor: [40, 40, 40],
        fontSize: 8,
        cellPadding: 2,
        lineColor: [230, 230, 230],
        lineWidth: 0.1,
      },
      alternateRowStyles: {
        fillColor: [252, 252, 254],
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 70 },
        3: { cellWidth: 20, halign: 'right' },
        4: { cellWidth: 18, halign: 'right' },
      },
      margin: { left: margin, right: margin },
      didDrawPage: function (data: any) {
        yPos = data.cursor.y + 5;
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  });

  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = margin;
  }

  yPos += 5;
  doc.setDrawColor(220);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    `Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}`,
    margin,
    yPos
  );
  doc.text('Rehber360 - Öğrenci Rehberlik Sistemi', pageWidth - margin - 50, yPos);

  const fileName = `Haftalik_Konu_Plani_${weekStart}.pdf`;
  
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
