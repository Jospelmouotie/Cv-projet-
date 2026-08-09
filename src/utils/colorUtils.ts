/**
 * Utility functions for color calculations, WCAG contrast ratios,
 * theme shade generation, and converting modern CSS colors (oklch) to standard RGB
 */

export interface ColorShades {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContrast: string; // #ffffff or #0f172a
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryContrast: string;
  border: string;
  contrastRatioOnWhite: number;
  isAccessibleOnWhite: boolean; // WCAG AA >= 4.5:1
}

/**
 * Converts any CSS color string (oklch, hsl, hex, name, etc.) to standard rgb()/rgba() string using Canvas context
 */
export function cssColorToRgbString(cssColor: string): string {
  if (!cssColor || cssColor === 'transparent' || cssColor === 'inherit') return cssColor;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return cssColor;
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    if (a === 0) return 'transparent';
    if (a < 255) return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return cssColor;
  }
}

/**
 * Replaces any oklch(...) occurrences within a string (e.g. style declarations, box-shadows, css rules)
 */
export function replaceOklchInString(str: string): string {
  if (!str || typeof str !== 'string' || !str.includes('oklch')) return str;
  return str.replace(/oklch\([^)]+\)/gi, (match) => cssColorToRgbString(match));
}

/**
 * Parses Hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 37, g: 99, b: 235 }; // fallback #2563eb
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Converts RGB to Hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates WCAG 2.1 relative luminance
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates WCAG contrast ratio between two hex colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

/**
 * Determines text color (#ffffff or #0f172a) based on background contrast
 */
export function getContrastText(bgHex: string): string {
  const lum = getLuminance(bgHex);
  return lum > 0.4 ? '#0f172a' : '#ffffff';
}

/**
 * Mixes two colors together
 */
export function mixColors(hex1: string, hex2: string, weight: number): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    rgb1.r * w + rgb2.r * (1 - w),
    rgb1.g * w + rgb2.g * (1 - w),
    rgb1.b * w + rgb2.b * (1 - w)
  );
}

/**
 * Generates structured shades for primary and optional secondary accent colors
 */
export function getAccentShades(primaryHex: string, secondaryHex?: string): ColorShades {
  const cleanPrimary = primaryHex && primaryHex.startsWith('#') ? primaryHex : '#2563eb';
  const cleanSecondary = secondaryHex && secondaryHex.startsWith('#') ? secondaryHex : mixColors(cleanPrimary, '#f59e0b', 0.6);

  const primaryLight = mixColors(cleanPrimary, '#ffffff', 0.12);
  const primaryDark = mixColors(cleanPrimary, '#000000', 0.7);
  const primaryContrast = getContrastText(cleanPrimary);

  const secondaryLight = mixColors(cleanSecondary, '#ffffff', 0.15);
  const secondaryDark = mixColors(cleanSecondary, '#000000', 0.75);
  const secondaryContrast = getContrastText(cleanSecondary);

  const border = mixColors(cleanPrimary, '#e2e8f0', 0.3);
  const contrastRatioOnWhite = getContrastRatio(cleanPrimary, '#ffffff');

  return {
    primary: cleanPrimary,
    primaryLight,
    primaryDark,
    primaryContrast,
    secondary: cleanSecondary,
    secondaryLight,
    secondaryDark,
    secondaryContrast,
    border,
    contrastRatioOnWhite,
    isAccessibleOnWhite: contrastRatioOnWhite >= 3.0,
  };
}

const COLOR_PROPS = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'fill',
  'stroke',
  'boxShadow',
  'textDecorationColor'
] as const;

/**
 * Replaces modern CSS colors (oklch, etc.) in a DOM tree with computed RGB colors
 * to prevent html2canvas parsing crashes.
 */
export function sanitizeDomColorsForCanvas(element: HTMLElement): () => void {
  const originalStyles: Array<{ el: HTMLElement; style: string }> = [];

  const processNode = (node: HTMLElement) => {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
    try {
      const computed = window.getComputedStyle(node);
      let modified = false;

      COLOR_PROPS.forEach((prop) => {
        const val = computed[prop as any];
        if (val && typeof val === 'string' && val.includes('oklch')) {
          if (!modified) {
            originalStyles.push({ el: node, style: node.getAttribute('style') || '' });
            modified = true;
          }
          (node.style as any)[prop] = replaceOklchInString(val);
        }
      });
    } catch {
      // Ignore non-styleable elements
    }

    Array.from(node.children).forEach(child => processNode(child as HTMLElement));
  };

  processNode(element);

  // Return a restore cleanup function
  return () => {
    originalStyles.forEach(({ el, style }) => {
      if (style) {
        el.setAttribute('style', style);
      } else {
        el.removeAttribute('style');
      }
    });
  };
}
