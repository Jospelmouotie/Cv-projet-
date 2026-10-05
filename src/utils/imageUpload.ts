/**
 * Image processing & compression utility for mobile and desktop uploads.
 * Ensures uploaded photos from phone gallery/camera fit smoothly in memory/localStorage.
 */
interface ImageUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxDimension?: number;
  quality?: number;
}

export async function processUploadedImage(
  file: File,
  optionsOrMaxDimension: number | ImageUploadOptions = 800,
  fallbackQuality: number = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).'));
    }

    let maxDim = 800;
    let quality = fallbackQuality;

    if (typeof optionsOrMaxDimension === 'number') {
      maxDim = optionsOrMaxDimension;
    } else if (typeof optionsOrMaxDimension === 'object') {
      maxDim = optionsOrMaxDimension.maxDimension || optionsOrMaxDimension.maxWidth || optionsOrMaxDimension.maxHeight || 800;
      if (optionsOrMaxDimension.quality !== undefined) {
        quality = optionsOrMaxDimension.quality;
      }
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur lors de la lecture de l'image."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Impossible de charger l'image."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight data URL (JPEG for photos, PNG if transparent)
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
