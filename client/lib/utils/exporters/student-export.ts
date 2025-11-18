import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Student } from '@/lib/storage';

export function exportToCSV(students: Student[], filename: string = 'ogrenciler.csv') {
  const headers = ['Numara', 'Ad', 'Soyad', 'Sınıf', 'Cinsiyet', 'Risk Seviyesi'];
  const rows = students.map((s) => [
    s.id,
    s.name,
    s.surname,
    s.class,
    s.gender === 'E' ? 'Erkek' : 'Kız',
    s.risk || 'Düşük',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(students: Student[], filename: string = 'ogrenciler.pdf') {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Öğrenci Listesi', 14, 15);

  doc.setFontSize(10);
  doc.text(`Toplam: ${students.length} öğrenci`, 14, 22);
  doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 27);

  const tableData = students.map((s) => [
    s.id,
    s.name,
    s.surname,
    s.class || '',
    s.gender === 'E' ? 'Erkek' : 'Kız',
    s.risk || 'Düşük',
  ]);

  autoTable(doc, {
    head: [['No', 'Ad', 'Soyad', 'Sınıf', 'Cinsiyet', 'Risk']],
    body: tableData,
    startY: 32,
    styles: {
      font: 'helvetica',
      fontSize: 9,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 32 },
  });

  doc.save(filename);
}

export function exportToExcel(students: Student[], filename: string = 'ogrenciler.xlsx') {
  import('xlsx').then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map((s) => ({
        'Öğrenci No': s.id,
        Ad: s.name,
        Soyad: s.surname,
        Sınıf: s.class,
        Cinsiyet: s.gender === 'E' ? 'Erkek' : 'Kız',
        'Risk Seviyesi': s.risk || 'Düşük',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Öğrenciler');

    XLSX.writeFile(workbook, filename);
  });
}
