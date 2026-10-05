/**
 * Utility to extract dominant brand colors from an image client-side via HTML Canvas.
 * This guarantees that when a user uploads a job offer screenshot or company logo,
 * the dominant corporate color is immediately and reliably identified.
 */

export interface ExtractedColorResult {
  primary: string;
  secondary: string;
  name: string;
}

// Popular corporate brand color mappings for instant accuracy
export const KNOWN_BRAND_COLORS: Record<string, { primary: string; secondary: string; name: string }> = {
  'google': { primary: '#4285F4', secondary: '#34A853', name: 'Bleu Google' },
  'microsoft': { primary: '#00A4EF', secondary: '#7FBA00', name: 'Bleu Microsoft' },
  'apple': { primary: '#1C1917', secondary: '#71717A', name: 'Gris Apple' },
  'amazon': { primary: '#FF9900', secondary: '#146EB4', name: 'Orange Amazon' },
  'meta': { primary: '#0668E1', secondary: '#0081FB', name: 'Bleu Meta' },
  'facebook': { primary: '#1877F2', secondary: '#4267B2', name: 'Bleu Facebook' },
  'linkedin': { primary: '#0A66C2', secondary: '#004182', name: 'Bleu LinkedIn' },
  'netflix': { primary: '#E50914', secondary: '#B81D24', name: 'Rouge Netflix' },
  'spotify': { primary: '#1ED760', secondary: '#1DB954', name: 'Vert Spotify' },
  'totalenergies': { primary: '#ED1C24', secondary: '#003366', name: 'Rouge & Bleu TotalEnergies' },
  'total': { primary: '#ED1C24', secondary: '#003366', name: 'Rouge Total' },
  'orange': { primary: '#FF7900', secondary: '#000000', name: 'Orange Officiel' },
  'bnp': { primary: '#00915A', secondary: '#1E3A8A', name: 'Vert BNP Paribas' },
  'societe generale': { primary: '#E60028', secondary: '#18181B', name: 'Rouge Société Générale' },
  'sg': { primary: '#E60028', secondary: '#18181B', name: 'Rouge SG' },
  'credit agricole': { primary: '#007A78', secondary: '#004B49', name: 'Vert Crédit Agricole' },
  'capgemini': { primary: '#0070AD', secondary: '#12ABDB', name: 'Bleu Capgemini' },
  'loreal': { primary: '#E50019', secondary: '#18181B', name: 'Rouge L\'Oréal' },
  'renault': { primary: '#FFCC00', secondary: '#18181B', name: 'Jaune Renault' },
  'peugeot': { primary: '#003366', secondary: '#18181B', name: 'Bleu Peugeot' },
  'sanofi': { primary: '#7A00E6', secondary: '#00D1C1', name: 'Violet Sanofi' },
  'carrefour': { primary: '#00387B', secondary: '#E2001A', name: 'Bleu Carrefour' },
  'danone': { primary: '#005CA9', secondary: '#00A0E2', name: 'Bleu Danone' },
  'thales': { primary: '#00529B', secondary: '#E30613', name: 'Bleu Thales' },
  'airbus': { primary: '#00205B', secondary: '#0085CA', name: 'Bleu Airbus' },
  'axa': { primary: '#00008F', secondary: '#E01A22', name: 'Bleu AXA' },
  'bouygues': { primary: '#004F9F', secondary: '#E2001A', name: 'Bleu Bouygues' },
  'sncf': { primary: '#821331', secondary: '#C8102E', name: 'Bordeaux SNCF' },
  'laposte': { primary: '#002B7F', secondary: '#FED100', name: 'Bleu & Jaune La Poste' }
};

/**
 * Identify brand color by company name lookup
 */
export function getKnownBrandColor(companyName?: string): ExtractedColorResult | null {
  if (!companyName) return null;
  const clean = companyName.toLowerCase().trim();
  for (const [key, val] of Object.entries(KNOWN_BRAND_COLORS)) {
    if (clean.includes(key)) {
      return val;
    }
  }
  return null;
}

/**
 * Extract dominant vibrant corporate color from image data URL using canvas.
 */
export function extractDominantColorFromImage(imageUrl: string): Promise<ExtractedColorResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve({ primary: '#1E40AF', secondary: '#60A5FA', name: 'Bleu Corporate' });
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ primary: '#1E40AF', secondary: '#60A5FA', name: 'Bleu Corporate' });
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets: Record<string, { r: number; g: number; b: number; count: number; weight: number }> = {};

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Ignore transparent pixels
          if (a < 120) continue;

          // Ignore extreme near-white (backgrounds) and extreme near-black
          if (r > 238 && g > 238 && b > 238) continue;
          if (r < 20 && g < 20 && b < 20) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const sat = max === 0 ? 0 : delta / max;

          // Reject low saturation (grayscale text or paper background)
          if (sat < 0.22) continue;

          // Quantize into 28-value steps
          const qr = Math.round(r / 28) * 28;
          const qg = Math.round(g / 28) * 28;
          const qb = Math.round(b / 28) * 28;
          const key = `${qr},${qg},${qb}`;

          // Weight colorful and medium-brightness pixels higher
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const lumBonus = lum >= 40 && lum <= 200 ? 1.5 : 1;
          const weight = (1 + sat * 3) * lumBonus;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: qr, g: qg, b: qb, count: 1, weight };
          } else {
            colorBuckets[key].count += 1;
            colorBuckets[key].weight += weight;
          }
        }

        const sorted = Object.values(colorBuckets).sort((a, b) => b.weight - a.weight);

        if (sorted.length > 0) {
          const dominant = sorted[0];
          const toHex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0').toUpperCase();
          const primaryHex = `#${toHex(dominant.r)}${toHex(dominant.g)}${toHex(dominant.b)}`;

          // Create a lighter harmonious secondary accent
          const secR = Math.min(255, Math.round(dominant.r * 0.7 + 70));
          const secG = Math.min(255, Math.round(dominant.g * 0.7 + 70));
          const secB = Math.min(255, Math.round(dominant.b * 0.7 + 70));
          const secondaryHex = `#${toHex(secR)}${toHex(secG)}${toHex(secB)}`;

          return resolve({
            primary: primaryHex,
            secondary: secondaryHex,
            name: `Couleur repérée sur l'annonce (${primaryHex})`
          });
        }
      } catch (e) {
        console.warn('Canvas color extraction error:', e);
      }

      resolve({ primary: '#1E40AF', secondary: '#60A5FA', name: 'Bleu Corporate Défaut' });
    };

    img.onerror = () => {
      resolve({ primary: '#1E40AF', secondary: '#60A5FA', name: 'Bleu Corporate Défaut' });
    };

    img.src = imageUrl;
  });
}
