import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportCVToImage(elementId: string, filename: string, format: 'png' | 'jpeg' = 'png'): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution image rendering
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    const imgData = canvas.toDataURL(mimeType, format === 'jpeg' ? 0.95 : 1.0);

    const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'CV_Professionnel';
    
    // Trigger browser download
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${cleanFilename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error(`Error generating ${format.toUpperCase()} image:`, error);
    return false;
  }
}

export async function exportCVToPDF(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // 1. Temporarily apply high-DPI scaling class or inline styles for crisp render
    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp 2.5x retina rendering
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 2. A4 Dimensions in mm (210 x 297)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Subsequent pages if CV overflows A4 height
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save PDF
    const cleanFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_') || 'CV_Professionnel';
    pdf.save(`${cleanFilename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
