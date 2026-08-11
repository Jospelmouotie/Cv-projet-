import { CV, Section, ProfilContenu, ExperienceItem, FormationItem, CompetenceItem } from '../types';
import { CVDocument, CVPage, CVElement, CVSettings } from '../types/document';

const PAGE_WIDTH = 794; // A4 width at 96 DPI
const PAGE_HEIGHT = 1123; // A4 height at 96 DPI
const MARGIN = 24;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;

function estimateSectionElementHeight(sec: Section): number {
  if (!sec || !sec.contenu) return 60;

  if (sec.type === 'profil') {
    const pData = sec.contenu as ProfilContenu;
    const resume = pData.resume || '';
    if (!resume) return 50;
    const lines = Math.ceil(resume.length / 55);
    return Math.max(60, 40 + lines * 18);
  }

  if (sec.type === 'experience') {
    const items = Array.isArray(sec.contenu) ? (sec.contenu as ExperienceItem[]) : [];
    if (items.length === 0) return 50;
    let total = 35;
    for (const item of items) {
      total += 36;
      const desc = item.description || '';
      if (desc) {
        const descLines = desc.split('\n').reduce((acc, line) => acc + Math.ceil((line.length || 1) / 48), 0);
        total += descLines * 16;
      }
      total += 12;
    }
    return Math.max(60, total);
  }

  if (sec.type === 'formation') {
    const items = Array.isArray(sec.contenu) ? (sec.contenu as FormationItem[]) : [];
    if (items.length === 0) return 50;
    let total = 35;
    for (const item of items) {
      total += 42;
      if (item.description) {
        total += 20;
      }
    }
    return Math.max(60, total);
  }

  if (sec.type === 'competences') {
    const items = Array.isArray(sec.contenu) ? (sec.contenu as CompetenceItem[]) : [];
    if (items.length === 0) return 50;
    const rows = Math.ceil(items.length / 3);
    return Math.max(60, 35 + rows * 28);
  }

  if (sec.type === 'langues' || (sec.type as string) === 'interets') {
    const items = Array.isArray(sec.contenu) ? sec.contenu : [];
    return Math.max(50, 35 + items.length * 20);
  }

  const str = typeof sec.contenu === 'string' ? sec.contenu : JSON.stringify(sec.contenu);
  return Math.max(60, 35 + Math.ceil(str.length / 40) * 16);
}

export function convertLegacyCVToDocument(cv: CV): CVDocument {
  const isTwoColumn = cv.nombreColonnes === 2;
  const sidebarWidthPct = cv.largeurColonneGauche || 32;
  const sidebarWidthPx = Math.round((USABLE_WIDTH * sidebarWidthPct) / 100);
  const mainWidthPx = USABLE_WIDTH - sidebarWidthPx - 16;

  const sidebarX = cv.positionSidebar === 'droite' ? MARGIN + mainWidthPx + 16 : MARGIN;
  const mainX = cv.positionSidebar === 'droite' ? MARGIN : MARGIN + sidebarWidthPx + 16;

  let currentYLeft = MARGIN;
  let currentYMain = MARGIN;
  let currentYSingle = MARGIN;

  const pagesMap: Record<number, CVElement[]> = { 1: [] };

  const addElementToPage = (element: CVElement, pageNum: number) => {
    if (!pagesMap[pageNum]) {
      pagesMap[pageNum] = [];
    }
    pagesMap[pageNum].push(element);
  };

  // 1. HEADER ELEMENT
  const profilSec = cv.sections.find(s => s.type === 'profil');
  const profilData: ProfilContenu = profilSec?.contenu || {
    nomComplet: cv.titre || 'Mon Nom',
    titreProfessionnel: 'Mon Titre Professionnel',
    email: '',
    telephone: '',
    adresse: '',
    resume: ''
  };

  const headerHeight = cv.styleEnTete === 'banner' || cv.styleEnTete === 'arch' ? 110 : 90;
  const headerElement: CVElement = {
    id: 'header-banner-element',
    type: 'section',
    x: MARGIN,
    y: MARGIN,
    width: USABLE_WIDTH,
    height: headerHeight,
    zIndex: 10,
    locked: false,
    visible: true,
    style: {
      backgroundColor: cv.couleurAccent || '#2563EB',
      color: '#FFFFFF',
      borderRadius: cv.rayonBordure || 8,
      padding: 16
    },
    content: {
      title: profilData.nomComplet || cv.titre,
      subtitle: profilData.titreProfessionnel,
      photoUrl: cv.photoUrl,
      showPhoto: cv.afficherPhoto,
      headerStyle: cv.styleEnTete || 'banner',
      email: profilData.email,
      phone: profilData.telephone,
      location: profilData.adresse
    },
    metadata: {
      isHeader: true
    }
  };

  addElementToPage(headerElement, 1);

  if (isTwoColumn) {
    currentYLeft += headerHeight + 16;
    currentYMain += headerHeight + 16;
  } else {
    currentYSingle += headerHeight + 16;
  }

  // 2. CONVERT SECTIONS TO ELEMENTS
  let zIndexCounter = 20;

  cv.sections.forEach((sec) => {
    if (sec.type === 'profil' && !sec.contenu?.resume) {
      // Handled in header
      return;
    }

    const estSidebar = isTwoColumn && (sec.colonne === 'gauche' || (sec.colonne !== 'droite' && sec.colonne !== 'principale' && cv.positionSidebar === 'gauche'));
    const xPos = isTwoColumn ? (estSidebar ? sidebarX : mainX) : MARGIN;
    const elemWidth = isTwoColumn ? (estSidebar ? sidebarWidthPx : mainWidthPx) : USABLE_WIDTH;

    let elemY = isTwoColumn ? (estSidebar ? currentYLeft : currentYMain) : currentYSingle;
    const height = estimateSectionElementHeight(sec);

    // Dynamic Multi-Page Loop
    let targetPageNum = 1;
    let adjustedY = elemY;
    const maxPageHeight = PAGE_HEIGHT - MARGIN - 40;

    while (adjustedY + Math.min(height, 200) > maxPageHeight) {
      targetPageNum++;
      adjustedY -= (PAGE_HEIGHT - MARGIN * 2);
      if (adjustedY < MARGIN + 20) {
        adjustedY = MARGIN + 20;
      }
    }

    const sectionElement: CVElement = {
      id: `elem-section-${sec.id}`,
      type: 'section',
      x: xPos,
      y: adjustedY,
      width: elemWidth,
      height: height,
      zIndex: zIndexCounter++,
      locked: false,
      visible: sec.visible !== false,
      style: {
        fontSize: cv.taillePoliceValeur || 10,
        fontFamily: cv.police || 'Inter',
        color: cv.couleurTexte || '#1E293B'
      },
      content: {
        section: sec,
        accentColor: cv.couleurAccent || '#2563EB',
        secondaryAccentColor: cv.couleurAccentSecondaire || '#93C5FD',
        headerStyle: cv.styleEnTeteSection || 'underline',
        skillsDisplayMode: cv.styleCompetences || 'badges'
      },
      metadata: {
        sectionId: sec.id,
        sectionType: sec.type,
        column: sec.colonne || (estSidebar ? 'gauche' : 'principale')
      }
    };

    addElementToPage(sectionElement, targetPageNum);

    // Increment Y position for next section
    if (isTwoColumn) {
      if (estSidebar) currentYLeft += height + 16;
      else currentYMain += height + 16;
    } else {
      currentYSingle += height + 16;
    }
  });

  // Construct Pages array
  const pages: CVPage[] = Object.keys(pagesMap).map((pNumStr) => {
    const pNum = parseInt(pNumStr, 10);
    return {
      id: `page-${pNum}`,
      pageNumber: pNum,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      margins: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      background: cv.couleurFond || '#FFFFFF',
      elements: pagesMap[pNum]
    };
  });

  const settings: CVSettings = {
    format: 'A4',
    unit: 'px',
    orientation: 'portrait',
    autoPagination: true,
    gridSnap: true,
    gridSize: 10,
    showGuides: true,
    showRulers: true
  };

  return {
    id: cv.id,
    version: 2,
    title: cv.titre,
    language: cv.langue || 'fr',
    metadata: {
      createdAt: cv.createdAt || new Date().toISOString(),
      updatedAt: cv.updatedAt || new Date().toISOString(),
      authorId: cv.utilisateurId,
      templateId: cv.templateId
    },
    settings,
    theme: {
      primaryColor: cv.couleurAccent || '#2563EB',
      secondaryColor: cv.couleurAccentSecondaire,
      backgroundColor: cv.couleurFond,
      sidebarBackgroundColor: cv.couleurFondSidebar,
      textColor: cv.couleurTexte,
      headingColor: cv.couleurTitreSection,
      headerStyle: cv.styleEnTete,
      sectionHeaderStyle: cv.styleEnTeteSection,
      skillsDisplayMode: cv.styleCompetences,
      borderRadiusVal: cv.rayonBordure
    },
    pages,
    legacyData: cv
  };
}

export function convertDocumentToLegacyCV(doc: CVDocument): CV {
  const baseCV: CV = doc.legacyData || {
    id: doc.id,
    utilisateurId: doc.metadata.authorId || 'u-demo-1',
    titre: doc.title,
    templateId: doc.metadata.templateId || 'moderne-1',
    langue: doc.language,
    couleurAccent: doc.theme.primaryColor || '#2563EB',
    couleurAccentSecondaire: doc.theme.secondaryColor,
    couleurFond: doc.theme.backgroundColor,
    police: 'Inter',
    sections: [],
    statutPaiement: 'PAYE',
    createdAt: doc.metadata.createdAt,
    updatedAt: doc.metadata.updatedAt
  };

  // Extract all elements across all pages
  const allElements: CVElement[] = [];
  doc.pages.forEach((page) => {
    page.elements.forEach((elem) => {
      allElements.push(elem);
    });
  });

  // 1. Sync Header Element edits back to Profil & CV top-level fields
  const headerElem = allElements.find((e) => e.metadata?.isHeader || e.id === 'header-banner-element');
  let photoUrl = baseCV.photoUrl;
  let afficherPhoto = baseCV.afficherPhoto;

  if (headerElem && typeof headerElem.content === 'object') {
    const hc = headerElem.content;
    if (hc.photoUrl !== undefined) photoUrl = hc.photoUrl;
    if (hc.showPhoto !== undefined) afficherPhoto = hc.showPhoto;
  }

  // 2. Sync Sections back from canvas section elements
  const updatedSections: Section[] = [...baseCV.sections];

  allElements.forEach((elem) => {
    if (elem.type === 'section' && elem.content?.section) {
      const canvasSec: Section = elem.content.section;
      const existingIdx = updatedSections.findIndex((s) => s.id === canvasSec.id);

      // Detect column placement from canvas X coordinate
      let column: 'gauche' | 'principale' | 'droite' = canvasSec.colonne || 'principale';
      if (elem.x < PAGE_WIDTH / 2) {
        column = 'gauche';
      } else {
        column = 'principale';
      }

      const updatedSec: Section = {
        ...canvasSec,
        colonne: column,
        visible: elem.visible !== false
      };

      if (existingIdx >= 0) {
        updatedSections[existingIdx] = updatedSec;
      } else {
        updatedSections.push(updatedSec);
      }
    }
  });

  return {
    ...baseCV,
    titre: doc.title || baseCV.titre,
    couleurAccent: doc.theme.primaryColor || baseCV.couleurAccent,
    couleurAccentSecondaire: doc.theme.secondaryColor || baseCV.couleurAccentSecondaire,
    couleurFond: doc.theme.backgroundColor || baseCV.couleurFond,
    couleurTexte: doc.theme.textColor || baseCV.couleurTexte,
    styleEnTete: doc.theme.headerStyle || baseCV.styleEnTete,
    styleEnTeteSection: doc.theme.sectionHeaderStyle || baseCV.styleEnTeteSection,
    photoUrl,
    afficherPhoto,
    sections: updatedSections,
    updatedAt: new Date().toISOString()
  };
}
