import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';
import type { CV, Section, ExperienceItem, FormationItem, CompetenceItem, LangueItem } from '../types.js';

/**
 * Constructs the docx Document object from a CV data model.
 */
export function buildDocxDocument(cv: CV): Document {
  const profilSection = cv.sections.find((s) => s.type === 'profil');
  const profilContenu = profilSection?.contenu || {};

  const nomComplet = profilContenu.nomComplet || 'Mon Nom';
  const titrePro = profilContenu.titreProfessionnel || '';
  const email = profilContenu.email || '';
  const telephone = profilContenu.telephone || '';
  const adresse = profilContenu.adresse || '';
  const resume = profilContenu.resume || '';
  const linkedin = profilContenu.linkedin || '';
  const siteWeb = profilContenu.siteWeb || '';

  const accentHex = (cv.couleurAccent || '#2563EB').replace('#', '');

  const docChildren: (Paragraph | Table)[] = [];

  // Header: Full Name
  docChildren.push(
    new Paragraph({
      text: nomComplet,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );

  // Headline
  if (titrePro) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titrePro,
            bold: true,
            size: 26,
            color: accentHex
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 }
      })
    );
  }

  // Contact line
  const contactParts = [email, telephone, adresse, linkedin, siteWeb].filter(Boolean);
  if (contactParts.length > 0) {
    docChildren.push(
      new Paragraph({
        text: contactParts.join('  •  '),
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
  }

  // Summary
  if (resume) {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFIL',
            bold: true,
            size: 22,
            color: accentHex
          })
        ],
        spacing: { before: 200, after: 100 }
      })
    );
    docChildren.push(
      new Paragraph({
        text: resume,
        spacing: { after: 200 }
      })
    );
  }

  // Sections
  for (const sec of cv.sections) {
    if (sec.type === 'profil' || sec.visible === false) continue;

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (sec.titre || sec.type).toUpperCase(),
            bold: true,
            size: 22,
            color: accentHex
          })
        ],
        spacing: { before: 200, after: 100 }
      })
    );

    if (sec.type === 'experience' || (sec.type as string) === 'experiences') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as ExperienceItem[]) : [];
      for (const it of items) {
        const dateStr = `${it.dateDebut || ''} - ${it.actuel ? 'Présent' : it.dateFin || ''}`;
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: it.poste || '', bold: true }),
              new TextRun({ text: ` | ${it.entreprise || ''} (${it.ville || ''})` }),
              new TextRun({ text: `   ${dateStr}`, italics: true })
            ],
            spacing: { after: 60 }
          })
        );
        if (it.description) {
          docChildren.push(
            new Paragraph({
              text: it.description,
              spacing: { after: 60 }
            })
          );
        }
        if (Array.isArray((it as any).taches)) {
          for (const task of (it as any).taches) {
            docChildren.push(
              new Paragraph({
                text: task,
                bullet: { level: 0 },
                spacing: { after: 40 }
              })
            );
          }
        }
      }
    } else if (sec.type === 'formation' || (sec.type as string) === 'formations') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as FormationItem[]) : [];
      for (const it of items) {
        const dateStr = `${it.dateDebut || ''} - ${it.actuel ? 'Présent' : it.dateFin || ''}`;
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: it.diplome || '', bold: true }),
              new TextRun({ text: ` | ${it.etablissement || ''} (${it.ville || ''})` }),
              new TextRun({ text: `   ${dateStr}`, italics: true })
            ],
            spacing: { after: 60 }
          })
        );
        if (it.description) {
          docChildren.push(
            new Paragraph({
              text: it.description,
              spacing: { after: 60 }
            })
          );
        }
      }
    } else if (sec.type === 'competences') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as CompetenceItem[]) : [];
      const skillNames = items.map((c) => c.nom + (c.niveau ? ` (${c.niveau}/10)` : '')).join(', ');
      docChildren.push(
        new Paragraph({
          text: skillNames,
          spacing: { after: 100 }
        })
      );
    } else if (sec.type === 'langues') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as LangueItem[]) : [];
      const langNames = items.map((l) => `${l.langue} (${l.niveau})`).join(', ');
      docChildren.push(
        new Paragraph({
          text: langNames,
          spacing: { after: 100 }
        })
      );
    } else if (sec.type === 'interets') {
      const items = Array.isArray(sec.contenu) ? (sec.contenu as any[]) : [];
      const names = items.map((i) => i.nom).filter(Boolean).join(', ');
      docChildren.push(
        new Paragraph({
          text: names,
          spacing: { after: 100 }
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 900,
              right: 900
            }
          }
        },
        children: docChildren
      }
    ]
  });
}

/**
 * Generates and downloads a clean, professional Microsoft Word (.docx) document
 * preserving exact semantic structure (headings, dates, organizations, bullet points, skills).
 */
export async function exportCVToDocx(cv: CV): Promise<boolean> {
  try {
    const doc = buildDocxDocument(cv);
    const blob = await Packer.toBlob(doc);
    const profilContenu = cv.sections.find((s) => s.type === 'profil')?.contenu || {};
    const nomComplet = profilContenu.nomComplet || 'Mon Nom';
    const fileName = `${(nomComplet || 'CV').replace(/\s+/g, '_')}_CV.docx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return false;
  }
}
