import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { sanitizeDomColorsForCanvas, replaceOklchInString } from './colorUtils';
import { exportCVToDocx } from './docxExport';
import { detectPaidFeaturesInCV } from './paidUsageDetector';
import { isPaymentActive } from './adminPaidMatrix';

export interface ExportResult {
  success: boolean;
  message?: string;
}

/**
 * Escapes special HTML characters to prevent XSS vulnerabilities in exported/rendered DOM strings
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes HTML characters and converts line breaks to <br/>
 */
export function escapeHtmlWithBreaks(str: string | undefined | null): string {
  if (!str) return '';
  return escapeHtml(str).replace(/\r?\n/g, '<br/>');
}

/**
 * Validates and sanitizes CSS color values to avoid CSS injection
 */
export function sanitizeColor(color: string | undefined | null, fallback: string = '#2563eb'): string {
  if (!color || typeof color !== 'string') return fallback;
  if (/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color) || /^rgba?\([^)]+\)$/.test(color) || /^[a-zA-C]+$/.test(color)) {
    return color;
  }
  return fallback;
}

/**
 * Ensures all web fonts are loaded before DOM capture
 */
async function waitForFontsLoaded(): Promise<void> {
  try {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  } catch {
    // Proceed if document.fonts API is not supported
  }
}

/**
 * Capture DOM element to Canvas using html-to-image with html2canvas fallback
 */
async function captureElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForFontsLoaded();

  const isPageSheet = element.classList.contains('cv-page-sheet') || Boolean(element.getAttribute('data-page-index')) || element.offsetHeight >= 1000;

  // Create an offscreen A4 container fixed at standard 794px width (A4 ratio at 96 DPI)
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '794px';
  offscreenContainer.style.minWidth = '794px';
  offscreenContainer.style.maxWidth = '794px';
  if (isPageSheet) {
    offscreenContainer.style.minHeight = '1122px';
    offscreenContainer.style.overflow = 'visible';
  } else {
    offscreenContainer.style.minHeight = '1122px';
  }
  offscreenContainer.style.zIndex = '-9999';
  offscreenContainer.style.backgroundColor = '#ffffff';
  offscreenContainer.style.display = 'block';
  offscreenContainer.style.visibility = 'visible';
  offscreenContainer.style.opacity = '1';
  offscreenContainer.style.boxSizing = 'border-box';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('hidden');

  const computedDisp = window.getComputedStyle(element).display;
  const isFlex = isPageSheet || computedDisp === 'flex' || element.classList.contains('flex');

  // CRITICAL: Preserve flex column layout for page sheets so flex-1 children stretch to full 1122px height!
  if (isFlex) {
    clone.style.setProperty('display', 'flex', 'important');
    clone.style.setProperty('flex-direction', 'column', 'important');
    if (element.classList.contains('justify-start') || element.style.justifyContent === 'flex-start') {
      clone.style.setProperty('justify-content', 'flex-start', 'important');
    } else if (element.classList.contains('justify-between') || element.style.justifyContent === 'space-between') {
      clone.style.setProperty('justify-content', 'space-between', 'important');
    }
  } else {
    clone.style.setProperty('display', 'block', 'important');
  }

  clone.style.setProperty('visibility', 'visible', 'important');
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  if (isPageSheet) {
    clone.style.minHeight = '1122px';
    clone.style.overflow = 'visible';
  }
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.opacity = '1';
  clone.style.margin = '0';
  clone.style.boxSizing = 'border-box';

  // Preserve and guarantee clean bottom padding so content has breathing room
  const existingPaddingBottom = parseInt(clone.style.paddingBottom || window.getComputedStyle(element).paddingBottom || '0', 10) || 40;
  clone.style.paddingBottom = `${Math.max(46, existingPaddingBottom)}px`;

  // Ensure all descendants hidden by responsive classes (e.g. mobile hidden) are visible for export
  clone.querySelectorAll<HTMLElement>('.hidden').forEach((el) => {
    if (!el.classList.contains('print:hidden')) {
      el.classList.remove('hidden');
      el.style.setProperty('display', 'block', 'important');
    }
  });

  // Strip any scale transforms from descendant elements (such as canvas zoom)
  clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (el.style && el.style.transform && el.style.transform.includes('scale')) {
      el.style.transform = 'none';
    }
  });

  // Ensure flex children and column containers stretch to full height on page sheets
  if (isPageSheet) {
    clone.querySelectorAll<HTMLElement>('.flex-1').forEach((el) => {
      el.style.flex = '1 1 0%';
      el.style.minHeight = '0px';
    });
    clone.querySelectorAll<HTMLElement>('.h-full, .shrink-0, .flex-1').forEach((el) => {
      if (el.parentElement?.classList.contains('flex-row') || el.parentElement?.style.flexDirection === 'row') {
        el.style.alignSelf = 'stretch';
        el.style.height = '100%';
      }
    });
  }

  // Strip interactive elements, action toolbars, watermarks and print-hidden elements from export clone
  const hiddenElements = clone.querySelectorAll('.print\\:hidden, [data-interactive="true"], [data-watermark="true"], .watermark-overlay');
  hiddenElements.forEach((el) => el.remove());

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  const targetEl = clone;

  // Small delay to let offscreen fonts and DOM layout calculate
  await new Promise((r) => setTimeout(r, 80));

  // Sanitize any modern oklch CSS colors in DOM before rendering
  const restoreColors = sanitizeDomColorsForCanvas(targetEl);

  const scrollH = targetEl.scrollHeight;
  const offsetH = targetEl.offsetHeight;
  const naturalHeight = Math.max(scrollH, offsetH);

  // Dedicated bottom safety margin requested by the user:
  // "met une toute petite marge en dessous pour éviter que les textes ne soit coupé"
  const bottomExtraSafetyPx = 16;
  const targetHeight = isPageSheet && naturalHeight <= 1122
    ? 1122
    : Math.max(1122, naturalHeight + bottomExtraSafetyPx);

  try {
    // Attempt 1: html-to-image with skipFonts: true and style override
    try {
      const dataUrl = await toPng(targetEl, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: targetHeight,
        style: {
          transform: 'none',
          transformOrigin: 'top left',
          width: '794px',
          minWidth: '794px',
          maxWidth: '794px',
          height: `${targetHeight}px`,
          minHeight: `${targetHeight}px`,
          overflow: 'visible',
          ...(isFlex ? { display: 'flex', flexDirection: 'column' } : {})
        },
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
            return false;
          }
          return true;
        }
      });

      if (dataUrl && dataUrl.length > 200) {
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        if (img.width > 0 && img.height > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Verify that image is not blank by sampling broadly across the page (not just top margin)
            const sampleY = Math.min(Math.floor(canvas.height * 0.25), canvas.height - 100);
            const sampleH = Math.min(300, Math.max(10, canvas.height - sampleY));
            const sampleW = Math.min(400, canvas.width);
            const sampleData = ctx.getImageData(0, Math.max(0, sampleY), sampleW, sampleH).data;
            let isBlank = true;
            for (let i = 0; i < sampleData.length; i += 4) {
              if (sampleData[i + 3] > 0 && (sampleData[i] < 248 || sampleData[i + 1] < 248 || sampleData[i + 2] < 248)) {
                isBlank = false;
                break;
              }
            }

            if (!isBlank) {
              restoreColors();
              if (document.body.contains(offscreenContainer)) {
                document.body.removeChild(offscreenContainer);
              }
              return canvas;
            }
          }
        }
      }
    } catch (err) {
      console.warn('html-to-image failed or produced empty canvas, falling back to html2canvas:', err);
    }

    // Attempt 2: html2canvas fallback with CORS & clone sanitization
    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: targetHeight,
      ignoreElements: (el) => el.classList.contains('print:hidden'),
      onclone: (clonedDoc, clonedEl) => {
        // Sanitize oklch/oklab from all <style> elements in cloned document
        if (clonedDoc) {
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleTag) => {
            if (styleTag.textContent && /oklch|oklab|lab|lch|color\(/i.test(styleTag.textContent)) {
              styleTag.textContent = replaceOklchInString(styleTag.textContent);
            }
          });

          // Sanitize CSS rules in document stylesheets
          try {
            Array.from(clonedDoc.styleSheets).forEach((sheet) => {
              try {
                const rules = sheet.cssRules || (sheet as any).rules;
                if (rules) {
                  Array.from(rules).forEach((rule: any) => {
                    if (rule.style && rule.cssText && /oklch|oklab|lab|lch|color\(/i.test(rule.cssText)) {
                      for (let i = 0; i < rule.style.length; i++) {
                        const prop = rule.style[i];
                        const val = rule.style.getPropertyValue(prop);
                        if (val && /oklch|oklab|lab|lch|color\(/i.test(val)) {
                          rule.style.setProperty(prop, replaceOklchInString(val));
                        }
                      }
                    }
                  });
                }
              } catch {
                // Ignore cross-origin stylesheet restrictions
              }
            });
          } catch {
            // Ignore
          }
        }

        if (clonedEl instanceof HTMLElement) {
          clonedEl.style.transform = 'none';
          clonedEl.style.transformOrigin = 'top left';
          clonedEl.style.width = '794px';
          clonedEl.style.minWidth = '794px';
          clonedEl.style.maxWidth = '794px';
          clonedEl.style.height = `${targetHeight}px`;
          clonedEl.style.minHeight = `${targetHeight}px`;
          clonedEl.style.overflow = 'visible';
          if (isFlex) {
            clonedEl.style.display = 'flex';
            clonedEl.style.flexDirection = 'column';
          }
          clonedEl.style.margin = '0';
          clonedEl.style.position = 'relative';
          clonedEl.style.opacity = '1';
          clonedEl.style.visibility = 'visible';
          sanitizeDomColorsForCanvas(clonedEl);
        }
      }
    });
    restoreColors();
    if (document.body.contains(offscreenContainer)) {
      document.body.removeChild(offscreenContainer);
    }
    return canvas;
  } catch (err) {
    restoreColors();
    if (document.body.contains(offscreenContainer)) {
      document.body.removeChild(offscreenContainer);
    }
    throw err;
  }
}

/**
 * Export CV as PNG or JPEG image
 */
export async function exportCVToImage(
  elementId: string,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
): Promise<ExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, message: `Élément avec l'ID ${elementId} introuvable.` };
  }

  try {
    const canvas = await captureElementToCanvas(element);
    if (!canvas || !canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0 || isNaN(canvas.width) || isNaN(canvas.height)) {
      return { success: false, message: "Impossible de capturer les dimensions du CV pour l'image." };
    }

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    const imgData = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.95 : 1.0);

    const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'CV_Professionnel';

    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${cleanFilename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, message: `Image ${format.toUpperCase()} exportée avec succès !` };
  } catch (error: any) {
    console.error(`Error generating ${format.toUpperCase()} image:`, error);
    return {
      success: false,
      message: `Erreur lors de la génération de l'image : ${error?.message || 'Problème de rendu'}`
    };
  }
}

/**
 * Export CV as high-definition PDF with exact multi-page preservation
 */
export async function exportCVToPDF(
  elementId: string,
  filename: string,
  isTwoPagesMode: boolean = false,
  cv?: any
): Promise<ExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, message: `Élément avec l'ID ${elementId} introuvable.` };
  }

  // Check if payment is active and if CV has paid features without payment
  if (isPaymentActive() && cv) {
    const userTier = cv.subscriptionTier || 'freemium';
    const userRole = cv.role || 'USER';
    const isExempt = userRole === 'ADMIN' || userTier === 'premium' || userTier === 'classique' || userTier === 'decouverte';
    
    if (!isExempt) {
      const detectedPaidFeatures = detectPaidFeaturesInCV(cv, userTier);
      if (detectedPaidFeatures.length > 0 && cv.statutPaiement !== 'PAYE') {
        return {
          success: false,
          message: `Ce CV contient ${detectedPaidFeatures.length} fonctionnalité(s) payante(s) : ${detectedPaidFeatures.map(f => f.name).join(', ')}. Veuillez payer pour débloquer l'export PDF.`
        };
      }
    }
  }

  try {
    // Standard A4 portrait dimensions in mm (210 x 297)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const safePdfWidth = 210;
    const safePdfHeight = 297;
    // User instruction: "met une toute petite marge en dessous pour éviter que les textes ne soit coupé"
    // Dedicated bottom margin (4mm) ensures text is never flush with the paper bottom cut-line
    const bottomMarginMm = 4;
    const renderPdfHeight = safePdfHeight - bottomMarginMm; // 293mm

    // Check if the DOM has multiple discrete page sheets (.cv-page-sheet)
    const rawPageSheets = Array.from(element.querySelectorAll<HTMLElement>('.cv-page-sheet'));

    // Filter page sheets:
    // If the DOM has multiple discrete sheets rendered (e.g. Page 1 & Page 2 detected automatically or explicitly),
    // include Page 2 whenever it contains real section content or when 2-pages mode is enabled.
    const pageSheets = rawPageSheets.filter((sheet, index) => {
      if (index === 0) return true;
      const hasSections = sheet.querySelectorAll('.cv-preview-section, [data-section-id], .droppable-zone').length > 0;
      const text = (sheet.innerText || sheet.textContent || '').replace(/Mon CV|Page 2|moncvgratuit\.com/gi, '').trim();
      return hasSections || text.length > 20 || isTwoPagesMode;
    });

    if (pageSheets.length > 1) {
      // CASE 1: MULTIPLE DISCRETE SHEETS (e.g. Sheet 1 & Sheet 2 rendered explicitly)
      for (let i = 0; i < pageSheets.length; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.setPage(i + 1);

        // Pre-fill page with clean white background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, safePdfWidth, safePdfHeight, 'F');

        const sheetCanvas = await captureElementToCanvas(pageSheets[i]);
        if (sheetCanvas && sheetCanvas.width > 0 && sheetCanvas.height > 0) {
          const sheetImg = sheetCanvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(sheetImg, 'JPEG', 0, 0, safePdfWidth, renderPdfHeight, undefined, 'FAST');
        }
      }
    } else {
      // CASE 2: SINGLE CONTINUOUS CONTAINER OR 1 SHEET
      // Target the first page sheet if present, or the root container
      const targetElement = pageSheets.length === 1 ? pageSheets[0] : element;
      const canvas = await captureElementToCanvas(targetElement);

      if (!canvas || !canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0 || isNaN(canvas.width) || isNaN(canvas.height)) {
        return { success: false, message: "Impossible de mesurer les dimensions du CV pour l'exportation PDF." };
      }

      // Height of 1 A4 page in canvas pixel units (A4 ratio is 297 / 210 = 1.4142857)
      const a4SliceHeight = Math.round(canvas.width * (297 / 210));

      // Automatically detect page count (1, 2 or 3 pages) based on canvas height or explicit mode
      const detectedPages = isTwoPagesMode 
        ? Math.max(2, Math.min(3, Math.ceil((canvas.height - 30) / a4SliceHeight)))
        : (canvas.height > a4SliceHeight * 1.08 ? Math.min(3, Math.ceil((canvas.height - 30) / a4SliceHeight)) : 1);

      if (detectedPages === 1) {
        // Fits cleanly onto 1 single A4 page
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, safePdfWidth, safePdfHeight, 'F');

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        pdf.addImage(imgData, 'JPEG', 0, 0, safePdfWidth, renderPdfHeight, undefined, 'FAST');
      } else {
        // Multi-page detected (2 or 3 pages): slice across exact A4 pages without truncating
        const totalPages = detectedPages;

        for (let p = 0; p < totalPages; p++) {
          if (p > 0) {
            pdf.addPage('a4', 'portrait');
          }
          pdf.setPage(p + 1);

          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, safePdfWidth, safePdfHeight, 'F');

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = a4SliceHeight;
          const pageCtx = pageCanvas.getContext('2d');

          if (pageCtx) {
            // Fill background with clean white
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

            const sourceY = p * a4SliceHeight;
            const remainingHeight = canvas.height - sourceY;
            const sliceHeight = Math.min(a4SliceHeight, Math.max(0, remainingHeight));

            if (sliceHeight > 0) {
              pageCtx.drawImage(
                canvas,
                0, sourceY, canvas.width, sliceHeight,
                0, 0, pageCanvas.width, sliceHeight
              );
            }

            const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(pageImgData, 'JPEG', 0, 0, safePdfWidth, renderPdfHeight, undefined, 'FAST');
          }
        }
      }
    }

    const totalExportedPages = pdf.getNumberOfPages();
    // Add discreet footer mention on all exported PDF pages as requested
    for (let p = 1; p <= totalExportedPages; p++) {
      pdf.setPage(p);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(130, 140, 150);
      pdf.text("Fait avec MyCVBuilder", safePdfWidth / 2, safePdfHeight - 1.5, { align: "center" });
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'CV_Professionnel';
    pdf.save(`${cleanFilename}.pdf`);

    return {
      success: true,
      message: totalExportedPages > 1
        ? `CV PDF HD exporté avec succès (${totalExportedPages} pages conformes à l'aperçu) !`
        : 'CV PDF HD exporté avec succès (1 page) !'
    };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      message: `Erreur lors de l'exportation PDF : ${error?.message || 'Erreur inconnue'}`
    };
  }
}

/**
 * Multi-format Export: Microsoft Word (.doc) formatted document
 */
export async function exportCVToWord(cv: any, filename: string): Promise<ExportResult> {
  try {
    // Attempt native DOCX export first
    try {
      const docxSuccess = await exportCVToDocx(cv);
      if (docxSuccess) {
        return {
          success: true,
          message: 'CV exporté au format Word (.docx) avec succès !'
        };
      }
    } catch (docxErr) {
      console.warn('DOCX binary export fallback to HTML format:', docxErr);
    }

    const profilSec = cv.sections?.find((s: any) => s.type === 'profil');
    const profil = profilSec?.contenu || {};
    const cleanFilename = (filename || cv.titreCV || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');

    let bodyHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b; max-width: 800px; margin: auto;">
        <div style="border-bottom: 2px solid ${cv.couleurAccent || '#2563eb'}; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24pt; color: ${cv.couleurAccent || '#2563eb'}; text-transform: uppercase;">
            ${profil.nomComplet || cv.titre || 'Curriculum Vitae'}
          </h1>
          <h2 style="margin: 4px 0; font-size: 14pt; color: #475569; font-weight: normal;">
            ${profil.titreProfessionnel || ''}
          </h2>
          <p style="margin: 6px 0 0 0; font-size: 10pt; color: #64748b;">
            ${[profil.email, profil.telephone, profil.adresse, profil.siteWeb].filter(Boolean).join(' • ')}
          </p>
        </div>
    `;

    if (profil.resume) {
      bodyHtml += `
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 12pt; text-transform: uppercase; color: ${cv.couleurAccent || '#2563eb'}; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
            Profil Professionnel
          </h3>
          <p style="font-size: 10pt; margin: 0;">${profil.resume}</p>
        </div>
      `;
    }

    const otherSections = (cv.sections || []).filter((s: any) => s.type !== 'profil' && s.visible !== false);
    for (const sec of otherSections) {
      bodyHtml += `
        <div style="margin-bottom: 18px;">
          <h3 style="font-size: 12pt; text-transform: uppercase; color: ${cv.couleurAccent || '#2563eb'}; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px;">
            ${sec.titre}
          </h3>
      `;

      if (sec.type === 'experience' && Array.isArray(sec.contenu)) {
        for (const item of sec.contenu) {
          bodyHtml += `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 10.5pt;">${item.poste || ''} ${item.employeur ? '— ' + item.employeur : ''}</div>
              <div style="font-size: 9pt; color: #64748b;">${item.ville ? item.ville + ' | ' : ''}${item.dateDebut || ''} - ${item.enPoste ? 'Présent' : item.dateFin || ''}</div>
              ${item.description ? `<p style="font-size: 9.5pt; margin: 4px 0 0 0;">${item.description.replace(/\n/g, '<br/>')}</p>` : ''}
            </div>
          `;
        }
      } else if (sec.type === 'formation' && Array.isArray(sec.contenu)) {
        for (const item of sec.contenu) {
          bodyHtml += `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 10.5pt;">${item.diplome || ''} ${item.etablissement ? '— ' + item.etablissement : ''}</div>
              <div style="font-size: 9pt; color: #64748b;">${item.ville ? item.ville + ' | ' : ''}${item.dateDebut || ''} - ${item.dateFin || ''}</div>
              ${item.description ? `<p style="font-size: 9.5pt; margin: 4px 0 0 0;">${item.description.replace(/\n/g, '<br/>')}</p>` : ''}
            </div>
          `;
        }
      } else if (sec.type === 'competences' && Array.isArray(sec.contenu)) {
        bodyHtml += `<p style="font-size: 10pt; margin: 0;">${sec.contenu.map((c: any) => c.nom + (c.niveau ? ` (${c.niveau})` : '')).join(', ')}</p>`;
      } else if (sec.type === 'langues' && Array.isArray(sec.contenu)) {
        bodyHtml += `<p style="font-size: 10pt; margin: 0;">${sec.contenu.map((l: any) => l.langue + (l.niveau ? ` : ${l.niveau}` : '')).join(' • ')}</p>`;
      } else if (sec.type === 'personnalisee') {
        bodyHtml += `<p style="font-size: 10pt; margin: 0;">${(sec.contenu?.texteLibre || '').replace(/\n/g, '<br/>')}</p>`;
      }

      bodyHtml += `</div>`;
    }

    bodyHtml += `</div>`;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${cleanFilename}</title>
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanFilename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Document Word (.doc) exporté avec succès !' };
  } catch (err: any) {
    console.error('Word export error', err);
    return { success: false, message: `Erreur d'export Word : ${err?.message || 'Erreur'}` };
  }
}

/**
 * Multi-format Export: JSON Data export for ATS / Backup
 */
export async function exportCVToJSON(cv: any, filename: string): Promise<ExportResult> {
  try {
    const cleanFilename = (filename || cv.titreCV || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');
    const jsonStr = JSON.stringify(cv, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanFilename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Données CV (JSON) exportées avec succès !' };
  } catch (err: any) {
    return { success: false, message: `Erreur d'export JSON : ${err?.message || 'Erreur'}` };
  }
}

/**
 * Multi-format Export: Plain Text export
 */
export async function exportCVToPlainText(cv: any, filename: string): Promise<ExportResult> {
  try {
    const cleanFilename = (filename || cv.titreCV || 'CV_Professionnel').replace(/[^a-zA-Z0-9_-]/g, '_');
    const profilSec = cv.sections?.find((s: any) => s.type === 'profil');
    const profil = profilSec?.contenu || {};

    let text = `${(profil.nomComplet || cv.titre || 'CURRICULUM VITAE').toUpperCase()}\n`;
    if (profil.titreProfessionnel) text += `${profil.titreProfessionnel}\n`;
    text += `Email: ${profil.email || ''} | Tel: ${profil.telephone || ''} | Ville: ${profil.adresse || ''}\n`;
    text += `${'='.repeat(60)}\n\n`;

    if (profil.resume) {
      text += `PROFIL PROFESSIONNEL\n${'-'.repeat(30)}\n${profil.resume}\n\n`;
    }

    const otherSections = (cv.sections || []).filter((s: any) => s.type !== 'profil' && s.visible !== false);
    for (const sec of otherSections) {
      text += `${sec.titre.toUpperCase()}\n${'-'.repeat(30)}\n`;
      if (sec.type === 'experience' && Array.isArray(sec.contenu)) {
        for (const it of sec.contenu) {
          text += `* ${it.poste || ''} - ${it.employeur || ''} (${it.dateDebut || ''} - ${it.enPoste ? 'Présent' : it.dateFin || ''})\n`;
          if (it.description) text += `  ${it.description.replace(/\n/g, '\n  ')}\n`;
        }
      } else if (sec.type === 'formation' && Array.isArray(sec.contenu)) {
        for (const it of sec.contenu) {
          text += `* ${it.diplome || ''} - ${it.etablissement || ''} (${it.dateDebut || ''} - ${it.dateFin || ''})\n`;
          if (it.description) text += `  ${it.description}\n`;
        }
      } else if (sec.type === 'competences' && Array.isArray(sec.contenu)) {
        text += sec.contenu.map((c: any) => c.nom).join(', ') + '\n';
      } else if (sec.type === 'langues' && Array.isArray(sec.contenu)) {
        text += sec.contenu.map((l: any) => `${l.langue} (${l.niveau || ''})`).join(' | ') + '\n';
      } else if (sec.type === 'personnalisee') {
        text += `${sec.contenu?.texteLibre || ''}\n`;
      }
      text += '\n';
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanFilename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Texte Brut (.txt) exporté avec succès !' };
  } catch (err: any) {
    return { success: false, message: `Erreur d'export texte : ${err?.message || 'Erreur'}` };
  }
}

/**
 * Helper to build an offscreen letter DOM element with exact layout and vector SVG accents
 */
export function createOffscreenLetterElement(letter: any): HTMLElement {
  const container = document.createElement('div');
  container.className = 'letter-a4-sheet-export';
  container.style.width = '794px';
  container.style.minHeight = '1122px';
  container.style.padding = '55px 65px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = letter.police || 'Arial, Helvetica, sans-serif';
  container.style.fontSize = `${letter.taillePolice || 11}pt`;
  container.style.lineHeight = '1.6';
  container.style.boxSizing = 'border-box';
  container.style.position = 'relative';

  const accentColor = sanitizeColor(letter.couleurAccent, '#2563eb');
  const expediteur = letter.expediteur || {};

  const expNom = escapeHtml(expediteur.nomComplet || letter.signature || '');
  const expTitre = escapeHtml(expediteur.titreProfessionnel);
  const expAdresse = escapeHtml(expediteur.adresse);
  const expTel = escapeHtml(expediteur.telephone);
  const expEmail = escapeHtml(expediteur.email);

  const destEntreprise = escapeHtml(letter.entreprise || 'Entreprise');
  const destNom = escapeHtml(letter.destinataire || 'Direction des Ressources Humaines');
  const villeDate = escapeHtml(letter.villeDate);
  const objet = escapeHtml(letter.objet || 'Candidature');

  const salutation = escapeHtml(letter.formulePolitesseEntree || 'Madame, Monsieur,');
  const accroche = escapeHtmlWithBreaks(letter.paragrapheAccroche);
  const valeur = escapeHtmlWithBreaks(letter.paragrapheValeurAjoutee);
  const adequation = escapeHtmlWithBreaks(letter.paragrapheAdequationEntreprise);
  const conclusion = escapeHtmlWithBreaks(letter.paragrapheConclusion);
  const valediction = escapeHtml(letter.formulePolitesseSortie || "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.");
  const signature = escapeHtml(letter.signature || expediteur.nomComplet || '');

  container.innerHTML = `
    <!-- Top Accent Bar (SVG ensures color is NEVER stripped by printers or html-to-image) -->
    <div style="margin-bottom: 24px;">
      <svg width="80" height="6" viewBox="0 0 80 6" style="display: block;">
        <rect width="80" height="6" rx="3" fill="${accentColor}" />
      </svg>
    </div>

    <!-- Header Grid -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 24px;">
      <div style="font-size: 9.5pt; color: #475569; line-height: 1.45;">
        <div style="font-size: 11.5pt; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${expNom}</div>
        ${expTitre ? `<div style="font-weight: 600; color: #334155; margin-bottom: 3px;">${expTitre}</div>` : ''}
        ${expAdresse ? `<div>${expAdresse}</div>` : ''}
        <div>${expTel} ${expEmail ? '• ' + expEmail : ''}</div>
      </div>
      <div style="text-align: right; font-size: 9.5pt; line-height: 1.45;">
        <div style="font-size: 11.5pt; font-weight: 800; color: ${accentColor};">${destEntreprise}</div>
        <div style="font-weight: 600; color: #334155;">${destNom}</div>
        <div style="color: #64748b; font-style: italic; margin-top: 6px;">${villeDate}</div>
      </div>
    </div>

    <!-- Objet Box with colored left border -->
    <div style="margin: 20px 0; padding: 12px 16px; background-color: #f8fafc; border-left: 5px solid ${accentColor}; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; border-radius: 6px; font-weight: 800; font-size: 10.5pt; color: #0f172a;">
      <span style="text-transform: uppercase; font-size: 8.5pt; color: #64748b; letter-spacing: 0.05em; margin-right: 8px;">OBJET :</span>${objet}
    </div>

    <!-- Salutation -->
    <div style="font-weight: 700; margin-bottom: 14px; color: #0f172a;">
      ${salutation}
    </div>

    <!-- Body Paragraphs -->
    ${accroche ? `<div style="margin-bottom: 14px; text-align: justify; line-height: 1.6; color: #1e293b;">${accroche}</div>` : ''}
    ${valeur ? `<div style="margin-bottom: 14px; text-align: justify; line-height: 1.6; color: #1e293b;">${valeur}</div>` : ''}
    ${adequation ? `<div style="margin-bottom: 14px; text-align: justify; line-height: 1.6; color: #1e293b;">${adequation}</div>` : ''}
    ${conclusion ? `<div style="margin-bottom: 14px; text-align: justify; line-height: 1.6; color: #1e293b;">${conclusion}</div>` : ''}

    <!-- Valediction -->
    <div style="margin-top: 20px; margin-bottom: 26px; font-weight: 500; color: #1e293b;">
      ${valediction}
    </div>

    <!-- Signature Block with SVG accent line -->
    <div style="margin-top: 30px; display: flex; flex-direction: column; align-items: flex-end;">
      <div style="font-weight: 800; color: #0f172a; font-size: 10.5pt;">${signature}</div>
      <svg width="100" height="3" viewBox="0 0 100 3" style="display: block; margin-top: 6px;">
        <rect width="100" height="3" rx="1.5" fill="${accentColor}" />
      </svg>
    </div>
  `;

  return container;
}

/**
 * Multi-format Export: Export Cover Letter as high-definition PDF
 * Supports either an elementId (like 'letter-a4-sheet') OR a letter data object directly!
 */
export async function exportLetterToPDF(
  target: string | any,
  filename?: string
): Promise<ExportResult> {
  const isTargetObject = target && typeof target === 'object' && !target.nodeType;
  const letter = isTargetObject ? target : null;
  const rawFilename = filename || (letter ? letter.titre : '') || (typeof target === 'string' ? target : 'Lettre_de_Motivation');
  const cleanFilename = (rawFilename || 'Lettre_de_Motivation').replace(/[^a-zA-Z0-9_\-]/g, '_');

  let tempContainer: HTMLElement | null = null;
  let elementToCapture: HTMLElement | null = null;

  if (isTargetObject) {
    elementToCapture = createOffscreenLetterElement(letter);
    tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.zIndex = '-999';
    tempContainer.appendChild(elementToCapture);
    document.body.appendChild(tempContainer);
  } else if (typeof target === 'string') {
    const el = document.getElementById(target);
    if (el) {
      elementToCapture = el;
    }
  } else if (target instanceof HTMLElement) {
    elementToCapture = target;
  }

  if (!elementToCapture) {
    return {
      success: false,
      message: "Impossible de préparer la lettre pour l'exportation PDF."
    };
  }

  try {
    const canvas = await captureElementToCanvas(elementToCapture);
    if (!canvas) {
      return {
        success: false,
        message: "Échec de capture visuelle de la lettre."
      };
    }

    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight));

    pdf.save(`${cleanFilename}.pdf`);

    return {
      success: true,
      message: 'Lettre de motivation exportée en PDF HD avec succès !'
    };
  } catch (err: any) {
    console.error('Error exporting letter to PDF:', err);
    return {
      success: false,
      message: `Erreur lors de l'export PDF : ${err?.message || 'Erreur'}`
    };
  } finally {
    if (tempContainer && document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

/**
 * Multi-format Export: Export Cover Letter as Word Document (.doc / .docx compatible)
 */
export async function exportLetterToWord(
  letter: any,
  filename: string
): Promise<ExportResult> {
  try {
    const cleanFilename = (filename || letter.titre || 'Lettre_de_Motivation').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const accentColor = sanitizeColor(letter.couleurAccent, '#2563eb');
    const fontFamily = escapeHtml(letter.police) || 'Calibri, Arial, sans-serif';
    const fontSize = Number(letter.taillePolice) || 11;

    const expNom = escapeHtml(letter.expediteur?.nomComplet || letter.signature || '');
    const expTitre = escapeHtml(letter.expediteur?.titreProfessionnel);
    const expAdresse = escapeHtml(letter.expediteur?.adresse);
    const expTel = escapeHtml(letter.expediteur?.telephone);
    const expEmail = escapeHtml(letter.expediteur?.email);

    const destEntreprise = escapeHtml(letter.entreprise || 'Entreprise');
    const destNom = escapeHtml(letter.destinataire || 'Direction des Ressources Humaines');
    const villeDate = escapeHtml(letter.villeDate);
    const objet = escapeHtml(letter.objet || 'Candidature');

    const salutation = escapeHtml(letter.formulePolitesseEntree || 'Madame, Monsieur,');
    const accroche = escapeHtmlWithBreaks(letter.paragrapheAccroche);
    const valeur = escapeHtmlWithBreaks(letter.paragrapheValeurAjoutee);
    const adequation = escapeHtmlWithBreaks(letter.paragrapheAdequationEntreprise);
    const conclusion = escapeHtmlWithBreaks(letter.paragrapheConclusion);
    const valediction = escapeHtml(letter.formulePolitesseSortie || "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.");
    const signature = escapeHtml(letter.signature || letter.expediteur?.nomComplet || '');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${cleanFilename}</title>
        <style>
          @page { size: A4 portrait; margin: 20mm; }
          body { 
            font-family: ${fontFamily}; 
            font-size: ${fontSize}pt; 
            line-height: 1.5; 
            color: #1e293b;
            margin: 0;
            padding: 0;
          }
          .accent-bar {
            height: 4px;
            width: 80px;
            background-color: ${accentColor};
            margin-bottom: 20px;
          }
          table.header-table {
            width: 100%;
            border-collapse: collapse;
            border: none;
            margin-bottom: 25px;
          }
          table.header-table td {
            vertical-align: top;
            border: none;
            padding: 0;
          }
          .sender-block {
            font-size: 10pt;
            color: #475569;
          }
          .sender-name {
            font-size: 11.5pt;
            font-weight: bold;
            color: #0f172a;
          }
          .recipient-block {
            text-align: right;
            font-size: 10pt;
          }
          .recipient-company {
            font-size: 11.5pt;
            font-weight: bold;
            color: #0f172a;
          }
          .date-block {
            color: #64748b;
            font-style: italic;
            margin-top: 6px;
          }
          .objet-box {
            margin: 20px 0;
            padding: 10px 14px;
            background-color: #f1f5f9;
            border-left: 4px solid ${accentColor};
            font-weight: bold;
            font-size: 11pt;
            color: #0f172a;
          }
          .salutation {
            font-weight: bold;
            margin-bottom: 14px;
            color: #0f172a;
          }
          p.paragraph {
            margin: 0 0 14px 0;
            text-align: justify;
            line-height: 1.6;
          }
          .valediction {
            margin-top: 18px;
            margin-bottom: 30px;
          }
          .signature-block {
            margin-top: 25px;
            text-align: right;
            font-weight: bold;
            font-size: 11pt;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="accent-bar" style="background-color: ${accentColor}; width: 80px; height: 5px; margin-bottom: 20px;"></div>
        
        <table class="header-table">
          <tr>
            <td class="sender-block" style="width: 55%;">
              <div class="sender-name">${expNom}</div>
              ${expTitre ? `<div>${expTitre}</div>` : ''}
              ${expAdresse ? `<div>${expAdresse}</div>` : ''}
              <div>${expTel} ${expEmail ? '• ' + expEmail : ''}</div>
            </td>
            <td class="recipient-block" style="width: 45%; text-align: right;">
              <div class="recipient-company">${destEntreprise}</div>
              <div>${destNom}</div>
              <div class="date-block">${villeDate}</div>
            </td>
          </tr>
        </table>

        <div class="objet-box" style="background-color: #f8fafc; border-left: 4px solid ${accentColor}; padding: 10px; margin-bottom: 20px;">
          <strong>OBJET : </strong>${objet}
        </div>

        <div class="salutation">${salutation}</div>

        ${accroche ? `<p class="paragraph">${accroche}</p>` : ''}
        ${valeur ? `<p class="paragraph">${valeur}</p>` : ''}
        ${adequation ? `<p class="paragraph">${adequation}</p>` : ''}
        ${conclusion ? `<p class="paragraph">${conclusion}</p>` : ''}

        <div class="valediction">${valediction}</div>

        <div class="signature-block" style="text-align: right; margin-top: 30px;">
          <div>${signature}</div>
          <div style="display: inline-block; width: 100px; height: 2px; background-color: ${accentColor}; margin-top: 4px;"></div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanFilename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Lettre exportée au format Word (.doc) avec succès !' };
  } catch (err: any) {
    console.error('Word export error for letter:', err);
    return { success: false, message: `Erreur d'export Word : ${err?.message || 'Erreur'}` };
  }
}

/**
 * Multi-format Export: Export Cover Letter as Plain Text
 */
export async function exportLetterToPlainText(
  letter: any,
  filename: string
): Promise<ExportResult> {
  try {
    const cleanFilename = (filename || letter.titre || 'Lettre_de_Motivation').replace(/[^a-zA-Z0-9_\-]/g, '_');
    
    let text = `${letter.expediteur?.nomComplet || ''}\n`;
    if (letter.expediteur?.titreProfessionnel) text += `${letter.expediteur.titreProfessionnel}\n`;
    if (letter.expediteur?.adresse) text += `${letter.expediteur.adresse}\n`;
    text += `${letter.expediteur?.telephone || ''} | ${letter.expediteur?.email || ''}\n\n`;

    text += `À l'attention de : ${letter.destinataire || 'Direction des Ressources Humaines'}\n`;
    text += `${letter.entreprise || ''}\n`;
    if (letter.villeDate) text += `${letter.villeDate}\n`;
    text += `\n${'='.repeat(60)}\n`;
    text += `OBJET : ${(letter.objet || 'CANDIDATURE').toUpperCase()}\n`;
    text += `${'='.repeat(60)}\n\n`;

    text += `${letter.formulePolitesseEntree || 'Madame, Monsieur,'}\n\n`;

    if (letter.paragrapheAccroche) {
      text += `${letter.paragrapheAccroche}\n\n`;
    }
    if (letter.paragrapheValeurAjoutee) {
      text += `${letter.paragrapheValeurAjoutee}\n\n`;
    }
    if (letter.paragrapheAdequationEntreprise) {
      text += `${letter.paragrapheAdequationEntreprise}\n\n`;
    }
    if (letter.paragrapheConclusion) {
      text += `${letter.paragrapheConclusion}\n\n`;
    }

    text += `${letter.formulePolitesseSortie || 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.'}\n\n`;
    text += `${letter.signature || letter.expediteur?.nomComplet || ''}\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanFilename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Texte Brut (.txt) exporté avec succès !' };
  } catch (err: any) {
    return { success: false, message: `Erreur d'export texte : ${err?.message || 'Erreur'}` };
  }
}

/**
 * Triggers clean native browser printing with strict color preservation for cover letters
 */
export function printLetterDocument(letter: any): void {
  const accentColor = sanitizeColor(letter.couleurAccent, '#2563eb');
  const fontFamily = escapeHtml(letter.police) || 'Arial, Helvetica, sans-serif';
  const fontSize = Number(letter.taillePolice) || 11;
  const expediteur = letter.expediteur || {};

  const docTitre = escapeHtml(letter.titre || 'Lettre de Motivation');

  const expNom = escapeHtml(expediteur.nomComplet || letter.signature || '');
  const expTitre = escapeHtml(expediteur.titreProfessionnel);
  const expAdresse = escapeHtml(expediteur.adresse);
  const expTel = escapeHtml(expediteur.telephone);
  const expEmail = escapeHtml(expediteur.email);

  const destEntreprise = escapeHtml(letter.entreprise || 'Entreprise');
  const destNom = escapeHtml(letter.destinataire || 'Direction des Ressources Humaines');
  const villeDate = escapeHtml(letter.villeDate);
  const objet = escapeHtml(letter.objet || 'Candidature');

  const salutation = escapeHtml(letter.formulePolitesseEntree || 'Madame, Monsieur,');
  const accroche = escapeHtmlWithBreaks(letter.paragrapheAccroche);
  const valeur = escapeHtmlWithBreaks(letter.paragrapheValeurAjoutee);
  const adequation = escapeHtmlWithBreaks(letter.paragrapheAdequationEntreprise);
  const conclusion = escapeHtmlWithBreaks(letter.paragrapheConclusion);
  const valediction = escapeHtml(letter.formulePolitesseSortie || "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.");
  const signature = escapeHtml(letter.signature || expediteur.nomComplet || '');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${docTitre}</title>
    <style>
      @page {
        size: A4 portrait;
        margin: 18mm 20mm;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: ${fontFamily};
        font-size: ${fontSize}pt;
        line-height: 1.6;
        color: #0f172a;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .accent-bar {
        margin-bottom: 24px;
      }
      .header-grid {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 24px;
      }
      .sender-block {
        font-size: 9.5pt;
        color: #475569;
        line-height: 1.45;
      }
      .sender-name {
        font-size: 11pt;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 2px;
      }
      .sender-title {
        font-weight: 600;
        color: #334155;
        margin-bottom: 4px;
      }
      .recipient-block {
        text-align: right;
        font-size: 9.5pt;
        line-height: 1.45;
      }
      .recipient-company {
        font-size: 11pt;
        font-weight: 800;
        color: ${accentColor} !important;
      }
      .recipient-dest {
        font-weight: 500;
        color: #334155;
      }
      .date-block {
        color: #64748b;
        font-style: italic;
        margin-top: 6px;
      }
      .objet-box {
        margin: 22px 0;
        padding: 10px 14px;
        background-color: #f8fafc !important;
        border-left: 5px solid ${accentColor} !important;
        border-top: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        border-radius: 6px;
        font-weight: 800;
        font-size: 10.5pt;
        color: #0f172a;
        box-shadow: inset 0 0 0 1000px #f8fafc !important;
      }
      .objet-label {
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 8.5pt;
        color: #64748b;
        margin-right: 8px;
      }
      .salutation {
        font-weight: 700;
        margin-bottom: 14px;
        color: #0f172a;
      }
      .paragraph {
        margin-bottom: 14px;
        text-align: justify;
        line-height: 1.6;
        color: #1e293b;
      }
      .valediction {
        margin-top: 20px;
        margin-bottom: 26px;
        font-weight: 500;
        color: #1e293b;
      }
      .signature-block {
        margin-top: 30px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .signature-name {
        font-weight: 800;
        color: #0f172a;
        font-size: 10.5pt;
      }
    </style>
  </head>
  <body>
    <!-- Top accent bar using SVG vector to preserve color -->
    <div class="accent-bar">
      <svg width="80" height="6" viewBox="0 0 80 6" style="display:block;">
        <rect width="80" height="6" rx="3" fill="${accentColor}" />
      </svg>
    </div>

    <div class="header-grid">
      <div class="sender-block">
        <div class="sender-name">${expNom}</div>
        ${expTitre ? `<div class="sender-title">${expTitre}</div>` : ''}
        ${expAdresse ? `<div>${expAdresse}</div>` : ''}
        <div>${expTel} ${expEmail ? '• ' + expEmail : ''}</div>
      </div>
      <div class="recipient-block">
        <div class="recipient-company">${destEntreprise}</div>
        <div class="recipient-dest">${destNom}</div>
        <div class="date-block">${villeDate}</div>
      </div>
    </div>

    <div class="objet-box">
      <span class="objet-label">Objet :</span>${objet}
    </div>

    <div class="salutation">${salutation}</div>

    ${accroche ? `<div class="paragraph">${accroche}</div>` : ''}
    ${valeur ? `<div class="paragraph">${valeur}</div>` : ''}
    ${adequation ? `<div class="paragraph">${adequation}</div>` : ''}
    ${conclusion ? `<div class="paragraph">${conclusion}</div>` : ''}

    <div class="valediction">${valediction}</div>

    <div class="signature-block">
      <div class="signature-name">${signature}</div>
      <!-- Underline using SVG vector to guarantee color preservation -->
      <svg width="100" height="3" viewBox="0 0 100 3" style="display:block; margin-top: 6px;">
        <rect width="100" height="3" rx="1.5" fill="${accentColor}" />
      </svg>
    </div>
  </body>
</html>`;

  // Try popup window first
  let printWin: Window | null = null;
  let tempIframe: HTMLIFrameElement | null = null;

  try {
    printWin = window.open('', '_blank');
  } catch {}

  if (printWin && printWin.document) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    setTimeout(() => {
      printWin?.focus();
      printWin?.print();
    }, 250);
  } else {
    // Hidden iframe fallback (100% resilient against popup blockers in iframes)
    tempIframe = document.createElement('iframe');
    tempIframe.style.position = 'fixed';
    tempIframe.style.right = '0';
    tempIframe.style.bottom = '0';
    tempIframe.style.width = '0';
    tempIframe.style.height = '0';
    tempIframe.style.border = '0';
    document.body.appendChild(tempIframe);

    const doc = tempIframe.contentDocument || tempIframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        tempIframe?.contentWindow?.focus();
        tempIframe?.contentWindow?.print();
        setTimeout(() => {
          if (tempIframe && document.body.contains(tempIframe)) {
            document.body.removeChild(tempIframe);
          }
        }, 3000);
      }, 300);
    } else {
      window.print();
    }
  }
}

/**
 * Triggers clean native browser printing with multi-page A4 precision and anti-overlapping layout
 */
export function printCV(elementId: string = 'cv-preview-container'): void {
  try {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView();
    }
  } catch {
    // Ignore error
  }
  window.print();
}
