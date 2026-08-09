import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { sanitizeDomColorsForCanvas, replaceOklchInString } from './colorUtils';

export interface ExportResult {
  success: boolean;
  message?: string;
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

  // Sanitize any modern oklch CSS colors in DOM before rendering
  const restoreColors = sanitizeDomColorsForCanvas(element);

  // Attempt 1: html-to-image with skipFonts: true
  try {
    const dataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: true,
      backgroundColor: '#ffffff',
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

          // Verify that image is not blank (check pixel non-whiteness sample)
          const sampleData = ctx.getImageData(0, 0, Math.min(200, canvas.width), Math.min(200, canvas.height)).data;
          let isBlank = true;
          for (let i = 0; i < sampleData.length; i += 4) {
            // If alpha > 0 and RGB is not pure white (255, 255, 255)
            if (sampleData[i+3] > 0 && (sampleData[i] < 250 || sampleData[i+1] < 250 || sampleData[i+2] < 250)) {
              isBlank = false;
              break;
            }
          }

          if (!isBlank) {
            restoreColors();
            return canvas;
          }
        }
      }
    }
  } catch (err) {
    console.warn('html-to-image failed or produced empty canvas, falling back to html2canvas:', err);
  }

  // Attempt 2: html2canvas fallback with CORS & clone sanitization
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      ignoreElements: (el) => el.classList.contains('print:hidden'),
      onclone: (clonedDoc, clonedEl) => {
        // Sanitize oklch from all <style> elements in cloned document
        if (clonedDoc) {
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
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
                    if (rule.style && rule.cssText && rule.cssText.includes('oklch')) {
                      for (let i = 0; i < rule.style.length; i++) {
                        const prop = rule.style[i];
                        const val = rule.style.getPropertyValue(prop);
                        if (val && val.includes('oklch')) {
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
          clonedEl.style.margin = '0';
          clonedEl.style.position = 'relative';
          clonedEl.style.opacity = '1';
          clonedEl.style.visibility = 'visible';
          sanitizeDomColorsForCanvas(clonedEl);
        }
      }
    });
    restoreColors();
    return canvas;
  } catch (err) {
    restoreColors();
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
 * Export CV as high-definition PDF with selectable text layer for ATS compatibility
 */
export async function exportCVToPDF(elementId: string, filename: string): Promise<ExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    return { success: false, message: `Élément avec l'ID ${elementId} introuvable.` };
  }

  try {
    const canvas = await captureElementToCanvas(element);
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Standard A4 portrait dimensions in mm (210 x 297)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Draw primary visual canvas page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Additional pages if CV content overflows single A4 page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    // Extract text nodes from DOM to add a invisible/transparent selectable text layer for ATS engines
    try {
      const textNodes: string[] = [];
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!node.textContent || node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (parent && parent.classList.contains('print:hidden')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      while (walker.nextNode()) {
        const text = walker.currentNode.textContent?.trim();
        if (text && text.length > 0) textNodes.push(text);
      }

      // Append text content as transparent/selectable layer at bottom or page coordinates
      if (textNodes.length > 0) {
        pdf.setTextColor(255, 255, 255); // White or hidden
        pdf.setFontSize(1); // Micro size text overlay for ATS indexers
        const fullText = textNodes.join(' ');
        pdf.text(fullText.slice(0, 4000), 10, pdfHeight - 2, { maxWidth: pdfWidth - 20 });
      }
    } catch {
      // Non-critical text overlay failure fallback
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'CV_Professionnel';
    pdf.save(`${cleanFilename}.pdf`);

    return { success: true, message: 'CV PDF HD exporté avec succès !' };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      message: `Erreur lors de l'exportation PDF : ${error?.message || 'Erreur inconnue'}`
    };
  }
}
