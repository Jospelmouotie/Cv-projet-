import { jsPDF } from 'jspdf';
import { CV, Section, ExperienceItem, FormationItem, CompetenceItem, LangueItem } from '../types';

/**
 * Native Vector PDF Generator for MyCVbuilder.
 * Produces 100% genuine vector PDF documents without rasterization,
 * ensuring razor-sharp typography, native ATS machine-readability,
 * and precise multi-page page breaks.
 */

// Hex color to RGB tuple
function hexToRgb(hex: string): [number, number, number] {
  let clean = (hex || '#000000').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [30, 30, 30];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function generateVectorPDF(cv: CV): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN_X = 14;
  const MARGIN_TOP = 14;
  const MARGIN_BOTTOM = 16;
  const USABLE_WIDTH = PAGE_WIDTH - (MARGIN_X * 2);

  const primaryRgb = hexToRgb(cv.couleurAccent || '#2563EB');
  const secondaryRgb = hexToRgb(cv.couleurAccentSecondaire || '#0D9488');
  const textDark: [number, number, number] = [24, 24, 27];
  const textMuted: [number, number, number] = [100, 116, 139];
  const textLight: [number, number, number] = [255, 255, 255];

  let currentY = MARGIN_TOP;
  let currentPage = 1;

  function checkPageBreak(neededHeight: number): void {
    if (currentY + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage('a4', 'portrait');
      currentPage++;
      currentY = MARGIN_TOP;
    }
  }

  const sections = cv.sections || [];
  const profilSec = sections.find(s => s.type === 'profil');
  const profil = profilSec?.contenu || {};

  const nomComplet = profil.nomComplet || cv.titre || 'Candidat';
  const titrePro = profil.titreProfessionnel || '';
  const email = profil.email || '';
  const telephone = profil.telephone || '';
  const adresse = profil.adresse || '';
  const siteWeb = profil.siteWeb || '';
  const linkedin = profil.linkedin || '';
  const resume = profil.resume || '';

  // 1. DRAW HEADER
  const isTwoTone = cv.styleEnTete === 'two-tone-split' || cv.styleEnTete === 'baxter-diagonal' || cv.styleEnTete === 'two-tone-stripe';
  const isBanner = cv.styleEnTete === 'banner' || cv.styleEnTete === 'card';
  const isDarkHeader = isTwoTone || isBanner || cv.couleurFondProfil;

  if (isDarkHeader) {
    const headerH = 38;
    pdf.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.rect(0, 0, PAGE_WIDTH, headerH, 'F');

    if (cv.couleurAccentSecondaire) {
      pdf.setFillColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
      pdf.rect(0, headerH - 3, PAGE_WIDTH, 3, 'F');
    }

    // Name in White
    pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(nomComplet, MARGIN_X, 15);

    // Title in soft accent/white
    if (titrePro) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(240, 245, 255);
      pdf.text(titrePro.toUpperCase(), MARGIN_X, 22);
    }

    // Contacts row
    const contactParts = [email, telephone, adresse, siteWeb, linkedin].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.setFontSize(8.5);
      pdf.setTextColor(220, 230, 245);
      const contactLine = contactParts.join('  •  ');
      pdf.text(contactLine, MARGIN_X, 30);
    }

    currentY = headerH + 8;
  } else {
    // Minimalist Clean Header
    pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.text(nomComplet, MARGIN_X, currentY + 6);
    currentY += 8;

    if (titrePro) {
      pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(titrePro.toUpperCase(), MARGIN_X, currentY + 4);
      currentY += 6;
    }

    // Contacts row
    const contactParts = [email, telephone, adresse, siteWeb, linkedin].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
      const contactLine = contactParts.join('  •  ');
      pdf.text(contactLine, MARGIN_X, currentY + 4);
      currentY += 6;
    }

    // Accent line
    pdf.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setLineWidth(0.8);
    pdf.line(MARGIN_X, currentY + 2, PAGE_WIDTH - MARGIN_X, currentY + 2);
    currentY += 7;
  }

  // 2. PROFILE SUMMARY
  if (resume) {
    checkPageBreak(25);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9.5);
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    const resumeLines = pdf.splitTextToSize(resume, USABLE_WIDTH);
    pdf.text(resumeLines, MARGIN_X, currentY + 4);
    currentY += (resumeLines.length * 4.5) + 6;
  }

  // 3. SECTION RENDERER
  function renderSectionHeader(title: string): void {
    checkPageBreak(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11.5);
    pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.text(title.toUpperCase(), MARGIN_X, currentY + 4);

    // Decorative underline
    pdf.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN_X, currentY + 6, MARGIN_X + 45, currentY + 6);

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN_X + 46, currentY + 6, PAGE_WIDTH - MARGIN_X, currentY + 6);

    currentY += 10;
  }

  // Iterate over remaining sections (experiences, formations, competences, etc.)
  const bodySections = sections.filter(s => s.type !== 'profil' && s.visible !== false);

  for (const sec of bodySections) {
    renderSectionHeader(sec.titre || sec.type);

    if (sec.type === 'experience' || (sec.type as string) === 'experiences') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as ExperienceItem[]) : [];
      for (const exp of items) {
        checkPageBreak(20);
        // Role and Dates
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(exp.poste || '', MARGIN_X, currentY + 3);

        const dateStr = `${exp.dateDebut || ''} - ${exp.actuel ? 'Présent' : (exp.dateFin || '')}`;
        if (dateStr.trim() !== '-') {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
          pdf.text(dateStr, PAGE_WIDTH - MARGIN_X, currentY + 3, { align: 'right' });
        }
        currentY += 5;

        // Company & City
        const companyStr = [exp.entreprise, exp.ville].filter(Boolean).join(' • ');
        if (companyStr) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9.5);
          pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
          pdf.text(companyStr, MARGIN_X, currentY + 2);
          currentY += 4.5;
        }

        // Description
        if (exp.description) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
          const descLines = pdf.splitTextToSize(exp.description, USABLE_WIDTH - 2);
          checkPageBreak(descLines.length * 4);
          pdf.text(descLines, MARGIN_X, currentY + 3);
          currentY += (descLines.length * 4) + 2;
        }

        // Bullet tasks
        if (Array.isArray((exp as any).taches) && (exp as any).taches.length > 0) {
          for (const task of (exp as any).taches) {
            if (typeof task === 'string' && task.trim()) {
              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(8.5);
              pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
              const taskLines = pdf.splitTextToSize(`• ${task}`, USABLE_WIDTH - 6);
              checkPageBreak(taskLines.length * 3.8);
              pdf.text(taskLines, MARGIN_X + 4, currentY + 2.5);
              currentY += (taskLines.length * 3.8) + 1;
            }
          }
        }
        currentY += 3;
      }
    } else if (sec.type === 'formation' || (sec.type as string) === 'formations') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as FormationItem[]) : [];
      for (const form of items) {
        checkPageBreak(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(form.diplome || '', MARGIN_X, currentY + 3);

        const dateStr = `${form.dateDebut || ''} - ${form.actuel ? 'Présent' : (form.dateFin || '')}`;
        if (dateStr.trim() !== '-') {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
          pdf.text(dateStr, PAGE_WIDTH - MARGIN_X, currentY + 3, { align: 'right' });
        }
        currentY += 4.5;

        const schoolStr = [form.etablissement, form.ville].filter(Boolean).join(' • ');
        if (schoolStr) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
          pdf.text(schoolStr, MARGIN_X, currentY + 2);
          currentY += 4;
        }

        if (form.description) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8.5);
          pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
          const formDescLines = pdf.splitTextToSize(form.description, USABLE_WIDTH);
          checkPageBreak(formDescLines.length * 3.8);
          pdf.text(formDescLines, MARGIN_X, currentY + 2.5);
          currentY += (formDescLines.length * 3.8) + 2;
        }
        currentY += 2;
      }
    } else if (sec.type === 'competences') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as CompetenceItem[]) : [];
      checkPageBreak(Math.ceil(items.length / 2) * 6);

      const colWidth = USABLE_WIDTH / 2;
      let colIdx = 0;
      let startRowY = currentY;

      for (let i = 0; i < items.length; i++) {
        const comp = items[i];
        const itemX = MARGIN_X + (colIdx * colWidth);
        const itemY = startRowY + 3;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(`• ${comp.nom}`, itemX, itemY);

        // Optional Level Bar
        if (typeof comp.niveau === 'number' && comp.niveau > 0) {
          const barW = 28;
          const barH = 2.2;
          const barX = itemX + colWidth - barW - 6;
          pdf.setFillColor(226, 232, 240);
          pdf.roundedRect(barX, itemY - 2.2, barW, barH, 1, 1, 'F');
          const fillW = (Math.min(10, comp.niveau) / 10) * barW;
          pdf.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
          pdf.roundedRect(barX, itemY - 2.2, fillW, barH, 1, 1, 'F');
        }

        if (colIdx === 1 || i === items.length - 1) {
          startRowY += 5.5;
          colIdx = 0;
        } else {
          colIdx = 1;
        }
      }
      currentY = startRowY + 3;
    } else if (sec.type === 'langues') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as LangueItem[]) : [];
      checkPageBreak(items.length * 5);
      for (const langItem of items) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        const langText = `• ${langItem.langue || ''} : `;
        pdf.text(langText, MARGIN_X, currentY + 3);

        const w = pdf.getTextWidth(langText);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        pdf.text(langItem.niveau || '', MARGIN_X + w, currentY + 3);
        currentY += 4.8;
      }
      currentY += 2;
    } else if (sec.type === 'interets') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as any[]) : [];
      const names = items.map(it => it.nom || it.titre || '').filter(Boolean);
      if (names.length > 0) {
        checkPageBreak(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        const interestStr = names.join('  •  ');
        const lines = pdf.splitTextToSize(interestStr, USABLE_WIDTH);
        pdf.text(lines, MARGIN_X, currentY + 3);
        currentY += (lines.length * 4) + 4;
      }
    }
  }

  // Footer page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(160, 174, 192);
    pdf.text(`Page ${p} / ${totalPages}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 8, { align: 'right' });
  }

  return pdf;
}
