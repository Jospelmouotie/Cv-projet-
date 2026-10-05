import React from 'react';

export interface BackgroundConfig {
  backgroundType?: 'solid' | 'gradient' | 'pattern' | 'image';
  colorSolid?: string;
  opacity?: number;
  colorStart?: string;
  colorEnd?: string;
  patternName?: string;
  imageUrl?: string;
  fallbackColor?: string;
}

/**
 * Converts a hex color string and alpha opacity (0 to 1 or 0 to 100) into an rgba string.
 */
export function hexToRgba(hex?: string, alpha: number = 1): string {
  if (!hex || hex === 'transparent') return 'transparent';
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return hex;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Calculates luminance to determine if background is dark or light.
 */
export function getLuminance(hex?: string): number {
  if (!hex || hex === 'transparent') return 1;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return 1;
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Returns React.CSSProperties for solid color, gradient, pattern, or image backgrounds.
 */
export function getBackgroundStyle(config: BackgroundConfig): React.CSSProperties {
  const pattern = config.patternName;
  const isPatternActive = (config.backgroundType === 'pattern' || (pattern && pattern !== 'none' && pattern !== 'standard'));
  const type = isPatternActive ? 'pattern' : (config.backgroundType || 'solid');
  const rawSolid = config.colorSolid || config.fallbackColor;

  if (type === 'solid' && (!rawSolid || rawSolid === 'transparent')) {
    return {
      backgroundColor: 'transparent'
    };
  }

  const solidColor = rawSolid || '#FFFFFF';

  // Normalize opacity to range 0..1
  let op = config.opacity ?? 1;
  if (op > 1) op = op / 100;
  if (op < 0) op = 0;
  if (op > 1) op = 1;

  const solidRgba = hexToRgba(solidColor, op);

  if (type === 'gradient') {
    const startRgba = hexToRgba(config.colorStart || '#3B82F6', op);
    const endRgba = hexToRgba(config.colorEnd || '#1E3A8A', op);
    return {
      backgroundImage: `linear-gradient(135deg, ${startRgba}, ${endRgba})`,
      backgroundColor: 'transparent'
    };
  }

  if (type === 'pattern' && pattern && pattern !== 'none') {
    const patternName = pattern.toLowerCase();
    const isDark = getLuminance(solidColor) < 0.45;
    const baseStrokeHex = isDark ? '#FFFFFF' : '#000000';
    const strokeAlpha = isDark ? Math.min(0.35, op * 0.3) : Math.min(0.2, op * 0.2);
    const strokeColor = encodeURIComponent(hexToRgba(baseStrokeHex, strokeAlpha));

    let svgPattern = '';

    if (patternName === 'dots' || patternName === 'points') {
      svgPattern = `data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='${strokeColor}'/%3E%3C/svg%3E`;
    } else if (patternName === 'stripes' || patternName === 'lines' || patternName === 'rayures') {
      svgPattern = `data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='16' x2='16' y2='0' stroke='${strokeColor}' stroke-width='1.5'/%3E%3C/svg%3E`;
    } else if (patternName === 'grid' || patternName === 'grille') {
      svgPattern = `data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 16 0 L 0 0 0 16' fill='none' stroke='${strokeColor}' stroke-width='1'/%3E%3C/svg%3E`;
    } else if (patternName === 'waves' || patternName === 'vagues') {
      svgPattern = `data:image/svg+xml,%3Csvg width='32' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 0 8 Q 8 0, 16 8 T 32 8' fill='none' stroke='${strokeColor}' stroke-width='1.5'/%3E%3C/svg%3E`;
    } else if (patternName === 'hexagons' || patternName === 'hexagones') {
      svgPattern = `data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 0 L24 6 L24 18 L12 24 L0 18 L0 6 Z' fill='none' stroke='${strokeColor}' stroke-width='1'/%3E%3C/svg%3E`;
    } else if (patternName === 'diagonal' || patternName === 'diagonale') {
      svgPattern = `data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='0' x2='12' y2='12' stroke='${strokeColor}' stroke-width='1.5'/%3E%3C/svg%3E`;
    } else {
      // mesh / default
      svgPattern = `data:image/svg+xml,%3Csvg width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='8,0 16,8 8,16 0,8' fill='none' stroke='${strokeColor}' stroke-width='1'/%3E%3C/svg%3E`;
    }

    return {
      backgroundColor: solidRgba,
      backgroundImage: `url("${svgPattern}")`,
      backgroundRepeat: 'repeat'
    };
  }

  if (type === 'image' && config.imageUrl) {
    return {
      backgroundImage: `url("${config.imageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: solidRgba
    };
  }

  // Solid color default
  return {
    backgroundColor: solidRgba
  };
}
