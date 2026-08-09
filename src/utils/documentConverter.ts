import { CV, Section, ProfilContenu } from '../types';
import { CVDocument, CVPage, CVElement, CVSettings } from '../types/document';

const PAGE_WIDTH = 794; // A4 width at 96 DPI
const PAGE_HEIGHT = 1123; // A4 height at 96 DPI
const MARGIN = 24;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function convertLegacyCVToDocument(cv: CV): CVDocument {
  const isTwoColumn = cv.nombreColonnes === 2;
  const sidebarWidthPct = cv.largeurColonneGauche || 32;
  const sidebarWidthPx = Math.round((USABLE_WIDTH * sidebarWidthPct) / 100);
  const mainWidthPx = USABLE_WIDTH - sidebarWidthPx - 16;

  const sidebarX = cv.positionSidebar === 'droite' ? MARGIN + mainWidthPx + 16 : MARGIN;
  const mainX = cv.positionSidebar === 'droite' ? MARGIN : MARGIN + sidebarWidthPx + 16;

  let currentPageNumber = 1;
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
    let pageNum = 1;

    // Check overflow to Page 2
    if (elemY > PAGE_HEIGHT - MARGIN - 120) {
      pageNum = 2;
      elemY = MARGIN + 20;
    }

    const sectionElement: CVElement = {
      id: `elem-section-${sec.id}`,
      type: 'section',
      x: xPos,
      y: elemY,
      width: elemWidth,
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

    addElementToPage(sectionElement, pageNum);

    // Increment Y position
    const estimatedHeight = Math.max(80, (JSON.stringify(sec.contenu).length / 5));
    if (isTwoColumn) {
      if (estSidebar) currentYLeft += estimatedHeight + 16;
      else currentYMain += estimatedHeight + 16;
    } else {
      currentYSingle += estimatedHeight + 16;
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
  if (doc.legacyData) {
    // Preserve existing legacy references while syncing updated settings/theme
    return {
      ...doc.legacyData,
      titre: doc.title || doc.legacyData.titre,
      couleurAccent: doc.theme.primaryColor || doc.legacyData.couleurAccent,
      couleurAccentSecondaire: doc.theme.secondaryColor || doc.legacyData.couleurAccentSecondaire,
      couleurFond: doc.theme.backgroundColor || doc.legacyData.couleurFond,
      couleurTexte: doc.theme.textColor || doc.legacyData.couleurTexte,
      styleEnTete: doc.theme.headerStyle || doc.legacyData.styleEnTete,
      styleEnTeteSection: doc.theme.sectionHeaderStyle || doc.legacyData.styleEnTeteSection,
      updatedAt: new Date().toISOString()
    };
  }

  // Fallback fallback constructor if legacyData wasn't present
  return {
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
}
