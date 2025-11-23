import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TİP TANIMLARI ---
export interface PlanEntry {
  date: string;
  start: string;
  end: string;
  subjectId: string;
  topicId: string;
  allocated: number;
  remainingAfter: number;
  targetQuestionCount?: number;
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

// --- RENK PALETİ (Zarif & Kurumsal) ---
const COLORS = {
  primary: [26, 35, 126],    // Lacivert (Başlıklar)
  secondary: [232, 234, 246], // Çok açık mavi/gri (Satır arka planı)
  accent: [255, 111, 0],     // Turuncu (Vurgular)
  text: [33, 33, 33],        // Koyu Gri (Metin)
  lightText: [117, 117, 117],// Açık Gri (İkincil metin)
  line: [224, 224, 224]      // İnce çizgiler
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

  // --- ÖNEMLİ: TÜRKÇE KARAKTER DESTEĞİ ---
  // jsPDF varsayılan fontları Türkçe karakterleri (ş, ğ, İ) desteklemez.
  // Projenizde bir .ttf dosyası (örn: Roboto-Regular.ttf) varsa, onu Base64'e çevirip
  // buraya eklemelisiniz. Yoksa standart font kullanılır ve karakterler bozuk çıkar.
  
  // Örnek kullanım (Eğer font dosyanız varsa bu satırları açın):
  // doc.addFileToVFS("Roboto-Regular.ttf", "BASE64_STRING_BURAYA");
  // doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  // doc.setFont("Roboto");
  
  // Font dosyası yoksa varsayılan ile devam ediyoruz (Türkçe karakterler bozuk çıkabilir)
  // Bu sorunu çözmek için fontunuzu yüklediğinizden emin olun.
  doc.setFont("helvetica"); 

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const colGap = 8;
  const colWidth = (pageWidth - (margin * 2) - colGap) / 2; // Sayfayı ikiye böl

  // --- BAŞLIK ALANI (HEADER) ---
  let yPos = margin;

  // Üst Çizgi
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  // Başlık Metinleri
  doc.setFontSize(18);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFont(doc.getFont().fontName, 'bold');
  doc.text('HAFTALIK ÇALIŞMA PLANI', margin, yPos);

  // Tarih ve İsim (Sağ Taraf)
  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  doc.setFontSize(10);
  doc.setFont(doc.getFont().fontName, 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(studentName || studentId, pageWidth - margin, yPos - 1, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
  doc.text(dateRange, pageWidth - margin, yPos + 3, { align: 'right' });

  yPos += 8;

  // Özet İstatistikler (Mini Bar)
  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const totalQuestions = plan.reduce((sum, p) => sum + (p.targetQuestionCount || 0), 0);

  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 8, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  const statsText = `Toplam Süre: ${totalHours}sa ${totalMins}dk    |    Etüt Sayısı: ${plan.length}    |    Hedef Soru: ${totalQuestions}`;
  doc.text(statsText, pageWidth / 2, yPos + 5, { align: 'center' });

  yPos += 12;

  // --- İKİ SÜTUNLU DÜZEN MANTIĞI ---
  const leftColX = margin;
  const rightColX = margin + colWidth + colGap;
  
  let leftY = yPos;
  let rightY = yPos;

  const DAYS = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
    { value: 7, label: 'Pazar' },
  ];

  DAYS.forEach((day) => {
    const dateISO = dateFromWeekStartLocal(weekStart, day.value);
    const entries = (planByDate.get(dateISO) || []).slice().sort((a, b) => a.start.localeCompare(b.start));

    // Eğer o gün ders yoksa ve yer darlığı varsa atla, ama şıklık için "Boş Gün" yazılabilir.
    // Şimdilik sadece dolu günleri veya isimlerini basalım.
    
    // Hangi sütuna yazacağız? (Pzt-Çar: Sol, Per-Paz: Sağ)
    // Dengeli dağılım için ilk 4 gün sol, son 3 gün sağ (Perşembe duruma göre değişebilir)
    const isLeftColumn = day.value <= 3; // İlk 3 gün kesin sol
    const currentX = isLeftColumn ? leftColX : rightColX;
    let currentY = isLeftColumn ? leftY : rightY;

    // Gün Başlığı
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFont(doc.getFont().fontName, 'bold');
    
    // Altı çizgili gün başlığı
    doc.text(`${day.label}`, currentX, currentY + 4);
    
    // Tarih (Küçük gri)
    doc.setFontSize(8);
    doc.setFont(doc.getFont().fontName, 'normal');
    doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
    doc.text(formatDate(new Date(dateISO)), currentX + colWidth, currentY + 4, { align: 'right' });

    doc.setDrawColor(COLORS.line[0], COLORS.line[1], COLORS.line[2]);
    doc.line(currentX, currentY + 6, currentX + colWidth, currentY + 6);
    
    currentY += 8;

    if (entries.length > 0) {
      // Tablo Verisi
      const tableData = entries.map((p) => {
        const sub = subjects.find((s) => s.id === p.subjectId);
        const top = topics.find((t) => t.id === p.topicId);
        return [
          p.start,
          sub?.name?.substring(0, 12) || '', // Yer kazanmak için kırp
          top?.name?.substring(0, 20) || '', // Yer kazanmak için kırp
          p.targetQuestionCount || '-',
          '', // Çözülen
          ''  // D/Y
        ];
      });

      autoTable(doc, {
        startY: currentY,
        margin: { left: currentX },
        tableWidth: colWidth,
        head: [['Saat', 'Ders', 'Konu', 'Hdf', 'Çz', 'D/Y']],
        body: tableData,
        theme: 'plain', // Minimalist tema
        styles: {
          fontSize: 7, // Küçük font (Sığması için kritik)
          cellPadding: 1.5,
          overflow: 'ellipsize',
          textColor: COLORS.text as [number, number, number],
          lineWidth: 0, // Çizgisiz
        },
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: COLORS.primary as [number, number, number],
          fontStyle: 'bold',
          lineWidth: 0,
        },
        columnStyles: {
          0: { cellWidth: 10, fontStyle: 'bold' }, // Saat
          1: { cellWidth: 18 }, // Ders
          2: { cellWidth: 'auto' }, // Konu
          3: { cellWidth: 8, halign: 'center' }, // Hedef
          4: { cellWidth: 8, halign: 'center' }, // Çözülen
          5: { cellWidth: 10, halign: 'center' }, // D/Y
        },
        didDrawPage: () => {}, // Sayfa atlamayı engellemek için kontrol gerekebilir
      });

      // Sonraki pozisyonu güncelle
      currentY = (doc as any).lastAutoTable.finalY + 6;
    } else {
      // Boş gün mesajı
      doc.setFontSize(7);
      doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
      doc.text("- Planlanmış çalışma yok -", currentX, currentY + 2);
      currentY += 8;
    }

    // Pozisyonları kaydet
    if (isLeftColumn) {
      leftY = currentY;
    } else {
      rightY = currentY;
    }
  });

  // --- NOTLAR & İMZA (Sayfanın Altına) ---
  // En alt pozisyonu bul (Sol ve sağ sütunun en uzunu)
  let footerStart = Math.max(leftY, rightY);
  
  // Eğer sayfa sonuna çok yaklaştıysa yeni sayfa açma riskine karşı kontrol
  if (footerStart > pageHeight - 35) {
     // Çok doluysa not alanını küçült veya sıkıştır
  } else {
     footerStart = Math.max(footerStart, pageHeight - 40); // En azından sayfa altına sabitle
  }

  // Ayırıcı çizgi
  doc.setDrawColor(COLORS.line[0], COLORS.line[1], COLORS.line[2]);
  doc.line(margin, footerStart, pageWidth - margin, footerStart);

  // Not Alanı
  doc.setFontSize(8);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("HAFTALIK NOTLAR / EKSİKLER:", margin, footerStart + 5);
  
  // Not kutusu çizgileri (Noktalı)
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerStart + 12, pageWidth - margin, footerStart + 12);
  doc.line(margin, footerStart + 19, pageWidth - margin, footerStart + 19);

  // İmza Alanı
  const signatureY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
  
  doc.text("Öğrenci İmzası", margin, signatureY);
  doc.text("Veli / Rehber Öğretmen İmzası", pageWidth - margin, signatureY, { align: 'right' });
  
  doc.setDrawColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.line(margin, signatureY - 2, margin + 30, signatureY - 2); // Sol imza çizgi
  doc.line(pageWidth - margin - 40, signatureY - 2, pageWidth - margin, signatureY - 2); // Sağ imza çizgi

  // Branding
  doc.text("Rehber360 • Akıllı Çalışma Sistemi", pageWidth / 2, signatureY, { align: 'center' });

  // Çıktı Alma
  const fileName = `Program_${weekStart}.pdf`;
  if (options.print) {
    doc.autoPrint();
    const blob = doc.output('blob');
    window.open(URL.createObjectURL(blob), '_blank');
  } else if (options.download) {
    doc.save(fileName);
  }

  return doc;
}

// --- YARDIMCI FONKSİYONLAR ---
function dateFromWeekStartLocal(weekStartISO: string, day: number) {
  const d = new Date(weekStartISO + 'T00:00:00');
  const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
  return result.toISOString().slice(0, 10);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}
