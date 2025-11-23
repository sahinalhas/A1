import html2pdf from 'html2pdf.js';

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
        <tr>
          <td class="time-cell">${p.start.substring(0, 5)}</td>
          <td>${sub?.name || '-'}</td>
          <td>${top?.name || '-'}</td>
          <td class="duration-cell">${p.allocated}dk</td>
          <td class="progress-cell">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${pct}%; background: ${progressColor};"></div>
              <span class="progress-text">${pct}%</span>
            </div>
          </td>
        </tr>
      `;
    });

    daysHTML += `
      <div class="day-section">
        <div class="day-header" style="background: ${headerColor};">
          <div class="day-info">
            <h3>${day.label}</h3>
            <p>${date}</p>
          </div>
          <div class="day-duration">${dayTotal} dakika</div>
        </div>
        <div class="day-content" style="background: ${bgColor};">
          <table>
            <thead>
              <tr>
                <th style="width: 12%;">Saat</th>
                <th style="width: 22%;">Ders</th>
                <th style="width: 38%;">Konu</th>
                <th style="width: 12%;">Süre</th>
                <th style="width: 16%;">İlerleme</th>
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
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Haftalık Konu Planı</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
          background: #f8f9fa;
          color: #2d3748;
          line-height: 1.5;
        }
        .container {
          background: white;
          padding: 32px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 28px;
          border-radius: 10px;
          margin-bottom: 28px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }
        .header h1 {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .header p {
          font-size: 13px;
          opacity: 0.95;
          margin-bottom: 16px;
        }
        .header-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .info-item {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          padding: 10px;
          border-radius: 6px;
          font-size: 11px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .info-item strong {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .day-section {
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .day-header {
          color: white;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        .day-info h3 {
          font-size: 15px;
          margin-bottom: 3px;
        }
        .day-info p {
          font-size: 11px;
          opacity: 0.9;
        }
        .day-duration {
          font-size: 13px;
          opacity: 0.95;
        }
        .day-content {
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead tr {
          background: rgba(0, 0, 0, 0.03);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        th {
          padding: 10px 12px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        tbody tr {
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
        tbody tr:hover {
          background: rgba(0, 0, 0, 0.01);
        }
        td {
          padding: 10px 12px;
          font-size: 12px;
          color: #2d3748;
        }
        .time-cell {
          font-weight: 600;
          color: #667eea;
        }
        .duration-cell {
          text-align: center;
          font-weight: 500;
        }
        .progress-cell {
          padding: 8px 12px;
        }
        .progress-bar {
          background: #e2e8f0;
          border-radius: 4px;
          height: 22px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .progress-text {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 700;
          color: #2d3748;
          z-index: 1;
        }
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 10px;
          color: #718096;
        }
        .footer p {
          margin-bottom: 4px;
        }
        .footer strong {
          color: #4a5568;
        }
        @page {
          margin: 0;
          size: A4;
        }
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          .container {
            padding: 16px;
            background: white;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 Haftalık Konu Planı</h1>
          <p>${studentName ? `Öğrenci: ${studentName}` : `Öğrenci ID: ${studentId}`}</p>
          <div class="header-info">
            <div class="info-item">
              <strong>📅 Dönem</strong>
              ${dateRange}
            </div>
            <div class="info-item">
              <strong>⏱️ Toplam Süre</strong>
              ${totalHours}s ${totalMins}dk
            </div>
            <div class="info-item">
              <strong>📖 Toplam Konular</strong>
              ${plan.length} konu
            </div>
          </div>
        </div>
        <div class="content">
          ${daysHTML}
        </div>
        <div class="footer">
          <p><strong>Oluşturulma:</strong> ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</p>
          <p>Rehber360 - Öğrenci Rehberlik Sistemi</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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
  try {
    const html = generateHTML(plan, planByDate, weekStart, subjects, topics, studentId, studentName);
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.display = 'none';
    document.body.appendChild(element);

    const fileName = `Haftalik_Konu_Plani_${weekStart}_${studentName?.replace(/[^a-zA-Z0-9]/g, '_') || studentId}.pdf`;

    const opt = {
      margin: 5,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    };

    if (options.print) {
      html2pdf()
        .set(opt as any)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          const printWindow = window.open(pdf.output('bloburi'), '_blank');
          if (printWindow) {
            setTimeout(() => {
              printWindow.print();
            }, 100);
          }
          document.body.removeChild(element);
        });
    } else if (options.download) {
      html2pdf()
        .set(opt as any)
        .from(element)
        .save()
        .then(() => {
          document.body.removeChild(element);
        });
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
