import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const dayColors: Record<number, string> = {
  1: '#E8F4FD',
  2: '#FDE8F3',
  3: '#E8FDE8',
  4: '#FDF3E8',
  5: '#F0E8FD',
  6: '#FDE8F3',
  7: '#FDE8E8',
};

const dayHeaderColors: Record<number, string> = {
  1: '#64B4DC',
  2: '#FF8AAA',
  3: '#82DC96',
  4: '#FFC864',
  5: '#9680FF',
  6: '#DC82DC',
  7: '#FF8080',
};

function generateHTML(
  plan: PlanEntry[],
  planByDate: Map<string, PlanEntry[]>,
  weekStart: string,
  subjects: Subject[],
  topics: Topic[],
  studentId: string,
  studentName?: string
): string {
  const DAYS = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
    { value: 7, label: 'Pazar' },
  ];

  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  let daysHTML = '';

  DAYS.forEach((day) => {
    const date = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(date) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    if (entries.length === 0) return;

    const dayTotal = entries.reduce((sum, e) => sum + e.allocated, 0);
    const bgColor = dayColors[day.value];
    const headerColor = dayHeaderColors[day.value];

    let tableRows = '';
    entries.forEach((p) => {
      const sub = subjects.find((s) => s.id === p.subjectId);
      const top = topics.find((t) => t.id === p.topicId);
      const total = top?.avgMinutes || 0;
      const pct = total > 0 ? Math.round(((total - p.remainingAfter) / total) * 100) : 0;
      const progressColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

      tableRows += `
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.04);">
          <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #667eea;">${p.start.substring(0, 5)}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #2d3748;">${sub?.name || '-'}</td>
          <td style="padding: 10px 12px; font-size: 12px; color: #2d3748;">${top?.name || '-'}</td>
          <td style="padding: 10px 12px; font-size: 12px; text-align: center; font-weight: 500; color: #2d3748;">${p.allocated}dk</td>
          <td style="padding: 8px 12px; font-size: 12px;">
            <div style="background: #e2e8f0; border-radius: 4px; height: 22px; position: relative; overflow: hidden; display: flex; align-items: center;">
              <div style="width: ${pct}%; height: 100%; background: ${progressColor}; transition: width 0.3s ease;"></div>
              <span style="position: absolute; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: 700; color: #2d3748; z-index: 1;">${pct}%</span>
            </div>
          </td>
        </tr>
      `;
    });

    daysHTML += `
      <div style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); page-break-inside: avoid;">
        <div style="background: ${headerColor}; color: white; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 600;">
          <div>
            <h3 style="font-size: 15px; margin: 0; padding: 0; margin-bottom: 3px;">${day.label}</h3>
            <p style="font-size: 11px; opacity: 0.9; margin: 0; padding: 0;">${date}</p>
          </div>
          <div style="font-size: 13px; opacity: 0.95;">${dayTotal} dakika</div>
        </div>
        <div style="background: ${bgColor}; padding: 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.08);">
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; width: 12%;">Saat</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; width: 22%;">Ders</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; width: 38%;">Konu</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; width: 12%;">Süre</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; width: 16%;">İlerleme</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  return `
    <div style="background: white; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; color: #2d3748; line-height: 1.5;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 28px; border-radius: 10px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);">
        <h1 style="font-size: 26px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.5px;">📚 Haftalık Konu Planı</h1>
        <p style="font-size: 13px; opacity: 0.95; margin: 0 0 16px 0;">${studentName ? `Öğrenci: ${studentName}` : `Öğrenci ID: ${studentId}`}</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <div style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid rgba(255, 255, 255, 0.2);">
            <strong style="display: block; font-size: 12px; margin-bottom: 4px; font-weight: 600;">📅 Dönem</strong>
            ${dateRange}
          </div>
          <div style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid rgba(255, 255, 255, 0.2);">
            <strong style="display: block; font-size: 12px; margin-bottom: 4px; font-weight: 600;">⏱️ Toplam Süre</strong>
            ${totalHours}s ${totalMins}dk
          </div>
          <div style="background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(10px); padding: 10px; border-radius: 6px; font-size: 11px; border: 1px solid rgba(255, 255, 255, 0.2);">
            <strong style="display: block; font-size: 12px; margin-bottom: 4px; font-weight: 600;">📖 Toplam Konular</strong>
            ${plan.length} konu
          </div>
        </div>
      </div>
      <div>
        ${daysHTML}
      </div>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #718096;">
        <p style="margin: 0 0 4px 0;"><strong style="color: #4a5568;">Oluşturulma:</strong> ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</p>
        <p style="margin: 0;">Rehber360 - Öğrenci Rehberlik Sistemi</p>
      </div>
    </div>
  `;
}

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
  try {
    const htmlContent = generateHTML(plan, planByDate, weekStart, subjects, topics, studentId, studentName);
    const fileName = `Haftalik_Konu_Plani_${weekStart}_${studentName?.replace(/[^a-zA-Z0-9]/g, '_') || studentId}.pdf`;

    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.display = 'block';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '-10000';
    container.style.visibility = 'hidden';
    container.style.width = '210mm';
    container.style.height = 'auto';
    container.style.padding = '0';
    container.style.margin = '0';
    document.body.appendChild(container);

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPos = 5;

    // Add pages
    pdf.addImage(imgData, 'JPEG', 5, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 5;

    while (yPos > pageHeight) {
      pdf.addPage();
      yPos -= pageHeight;
      pdf.addImage(imgData, 'JPEG', 5, yPos - (imgHeight + 5), imgWidth, imgHeight);
      yPos += 5;
    }

    // Clean up
    document.body.removeChild(container);

    // Download or print
    if (options.download) {
      pdf.save(fileName);
    } else if (options.print) {
      const printWindow = window.open(pdf.output('bloburi'), '_blank');
      if (printWindow) {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  } catch (error) {
    console.error('PDF oluşturulurken hata:', error);
  }
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
