import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  subject?: string;
  grade?: string;
  docType?: 'cours' | 'interrogation' | 'devoir' | 'examen' | 'fiche';
  content: string; // Plain text or markdown-like content
  elementId?: string; // Optional DOM element ID to render
}

export const generateDocumentPdf = async (options: PdfExportOptions): Promise<void> => {
  const {
    title,
    subtitle = '',
    subject = 'Général',
    grade = 'Toutes classes',
    docType = 'cours',
    content,
    elementId,
  } = options;

  // If elementId exists, attempt html2canvas capture first
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      try {
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        const cleanFileName = (title || 'Document').replace(/[^a-zA-Z0-9àâéèêëîïôûùç-]/g, '_');
        pdf.save(`${cleanFileName}_IvoireDuc.pdf`);
        return;
      } catch (err) {
        console.warn('html2canvas failed, falling back to formatted text PDF export', err);
      }
    }
  }

  // Pure jsPDF text exporter with official Ivory Coast MENA academic styling
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Header background bar (Emerald theme)
  doc.setFillColor(6, 95, 70); // #065f46 Emerald 800
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Top header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RÉPUBLIQUE DE CÔTE D\'IVOIRE — MENA', margin, 11);
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Ministère de l\'Éducation Nationale et de l\'Alphabétisation | IVOIREDUC PRO', margin, 17);

  // Type badge in header
  const typeLabelMap: Record<string, string> = {
    cours: 'COURS EXPLICATIF',
    interrogation: 'INTERROGATION ÉCRITE (15 MIN)',
    devoir: 'DEVOIR DE SYNTHÈSE (45 MIN)',
    examen: 'EXAMEN BLANC OFFICIEL',
    fiche: 'FICHE DE RÉVISION',
  };
  const badgeText = typeLabelMap[docType] || 'DOCUMENT D\'ÉTUDE';
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  const badgeWidth = doc.getTextWidth(badgeText) + 6;
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.roundedRect(pageWidth - margin - badgeWidth, 8, badgeWidth, 8, 2, 2, 'F');
  doc.setTextColor(0, 0, 0);
  doc.text(badgeText, pageWidth - margin - badgeWidth + 3, 13.5);

  cursorY = 32;

  // Metadata Box (Subject, Grade, Date)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, cursorY, contentWidth, 18, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.setFont('Helvetica', 'bold');
  doc.text(`Matière : `, margin + 4, cursorY + 7);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${subject}`, margin + 22, cursorY + 7);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Niveau / Classe : `, margin + 70, cursorY + 7);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${grade}`, margin + 102, cursorY + 7);

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFont('Helvetica', 'bold');
  doc.text(`Date : `, margin + 135, cursorY + 7);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${dateStr}`, margin + 147, cursorY + 7);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Plateforme pédagogique conforme aux programmes officiels de Côte d'Ivoire.`, margin + 4, cursorY + 14);

  cursorY += 26;

  // Main Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate 900
  const splitTitle = doc.splitTextToSize(title, contentWidth);
  doc.text(splitTitle, margin, cursorY);
  cursorY += splitTitle.length * 7;

  if (subtitle) {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const splitSub = doc.splitTextToSize(subtitle, contentWidth);
    doc.text(splitSub, margin, cursorY);
    cursorY += splitSub.length * 5 + 3;
  }

  // Decorative line
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.8);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // Process text lines
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  // Normalize Markdown headers/bolding for PDF rendering
  const cleanContent = content
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/###\s?/g, '')
    .replace(/##\s?/g, '')
    .replace(/#\s?/g, '');

  const lines = cleanContent.split('\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      cursorY += 4;
      return;
    }

    // Check for page overflow
    if (cursorY > pageHeight - 20) {
      doc.addPage();
      cursorY = margin + 5;

      // Small page header
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`${title} — ${subject} (${grade})`, margin, cursorY);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
      cursorY += 8;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
    }

    // Section header styling detection
    if (
      trimmed.startsWith('I.') ||
      trimmed.startsWith('II.') ||
      trimmed.startsWith('III.') ||
      trimmed.startsWith('IV.') ||
      trimmed.startsWith('EXERCICE') ||
      trimmed.startsWith('SUJET') ||
      trimmed.startsWith('PARTIE')
    ) {
      cursorY += 3;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(6, 95, 70); // Emerald 800
      const wrapped = doc.splitTextToSize(trimmed, contentWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 5.5 + 2;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
    } else {
      const wrapped = doc.splitTextToSize(trimmed, contentWidth);
      doc.text(wrapped, margin, cursorY);
      cursorY += wrapped.length * 5 + 1;
    }
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text(`IvoireDuc Pro — Document généré le ${dateStr}`, margin, pageHeight - 6);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - margin - 15, pageHeight - 6);
  }

  const fileSlug = (title || 'Document_IvoireDuc').replace(/[^a-zA-Z0-9àâéèêëîïôûùç-]/g, '_');
  doc.save(`${fileSlug}.pdf`);
};
