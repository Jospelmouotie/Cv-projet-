import React from 'react';
import { DecorativeLayer, ArcConcentricConfig, FooterBarConfig, FooterColumnItem } from '../types';
import { MapPin, Phone, Mail, Clock, Globe, Briefcase, Award, CheckCircle2 } from 'lucide-react';

interface DecorativeLayerRendererProps {
  layers?: DecorativeLayer[];
  zone?: 'header' | 'sidebar' | 'page-footer' | 'page-top' | 'floating' | 'background';
  primaryAccent: string;
  secondaryAccent?: string;
  className?: string;
  defaultContactData?: {
    email?: string;
    telephone?: string;
    adresse?: string;
    dispo?: string;
    siteWeb?: string;
  };
}

export const DecorativeLayerRenderer: React.FC<DecorativeLayerRendererProps> = ({
  layers = [],
  zone,
  primaryAccent,
  secondaryAccent = '#38BDF8',
  className = '',
  defaultContactData
}) => {
  if (!layers || layers.length === 0) return null;

  const filteredLayers = zone ? layers.filter(l => l.zone === zone) : layers;
  if (filteredLayers.length === 0) return null;

  return (
    <div className={`decorative-layers-container pointer-events-none ${className}`}>
      {filteredLayers.map((layer, index) => {
        const layerKey = layer.id || `dec-layer-${index}`;
        const zIndex = layer.zIndex ?? 0;
        const opacity = layer.opacity ?? 1;
        const colors = (layer.colors && layer.colors.length > 0)
          ? layer.colors
          : [primaryAccent, secondaryAccent, '#BAE6FD', '#E0F2FE'];

        // Render Arc Concentric
        if (layer.shape === 'arc-concentric') {
          const config: ArcConcentricConfig = typeof layer.value === 'object' ? layer.value : {};
          const ringsCount = config.rings || 3;
          const radius = config.radius || 120;
          const align = config.position?.align || 'top-left';

          let alignClass = 'top-0 left-0';
          let svgTransform = '';
          if (align === 'top-right') {
            alignClass = 'top-0 right-0';
            svgTransform = 'scale(-1, 1)';
          } else if (align === 'bottom-left') {
            alignClass = 'bottom-0 left-0';
            svgTransform = 'scale(1, -1)';
          } else if (align === 'bottom-right') {
            alignClass = 'bottom-0 right-0';
            svgTransform = 'scale(-1, -1)';
          }

          // Generate concentric arc radiuses proportionally
          const radii: number[] = [];
          for (let r = ringsCount; r >= 1; r--) {
            radii.push(Math.round((radius * r) / ringsCount));
          }

          return (
            <div
              key={layerKey}
              className={`absolute ${alignClass} pointer-events-none overflow-hidden`}
              style={{
                width: `${radius}px`,
                height: `${radius}px`,
                zIndex,
                opacity,
                transform: svgTransform
              }}
            >
              <svg className="w-full h-full" viewBox={`0 0 ${radius} ${radius}`} fill="none" preserveAspectRatio="none">
                {radii.map((rad, rIdx) => {
                  const ringColor = colors[rIdx % colors.length] || primaryAccent;
                  const ringOpacity = 0.95 - rIdx * 0.08;
                  return (
                    <path
                      key={`arc-${rIdx}`}
                      d={`M0,0 L0,${rad} A${rad},${rad} 0 0,0 ${rad},0 Z`}
                      fill={ringColor}
                      opacity={Math.max(0.2, ringOpacity)}
                    />
                  );
                })}
              </svg>
            </div>
          );
        }

        // Render Arc Contour (4 variants: simple, double, pointillé, dégradé)
        if (layer.shape === 'arc-contour') {
          const variant = layer.variant || (typeof layer.value === 'object' ? layer.value.variant : 'simple') || 'simple';
          const radius = layer.size?.width ? Number(layer.size.width) : 140;
          const strokeCol = colors[0] || primaryAccent;
          const secondaryCol = colors[1] || secondaryAccent;
          const gradId = `arc-grad-${layerKey}`;
          const align = (typeof layer.value === 'object' && layer.value.align) ? layer.value.align : 'top-left';

          let alignClass = 'top-0 left-0';
          let svgTransform = '';
          if (align === 'top-right') {
            alignClass = 'top-0 right-0';
            svgTransform = 'scale(-1, 1)';
          } else if (align === 'bottom-left') {
            alignClass = 'bottom-0 left-0';
            svgTransform = 'scale(1, -1)';
          } else if (align === 'bottom-right') {
            alignClass = 'bottom-0 right-0';
            svgTransform = 'scale(-1, -1)';
          }

          return (
            <div
              key={layerKey}
              className={`absolute ${alignClass} pointer-events-none overflow-hidden`}
              style={{
                width: `${radius}px`,
                height: `${radius}px`,
                zIndex,
                opacity,
                transform: svgTransform
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={strokeCol} />
                    <stop offset="100%" stopColor={secondaryCol} />
                  </linearGradient>
                </defs>

                {variant === 'simple' && (
                  <path
                    d="M 0,90 A 90,90 0 0,0 90,0"
                    stroke={strokeCol}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}

                {variant === 'double' && (
                  <>
                    <path
                      d="M 0,90 A 90,90 0 0,0 90,0"
                      stroke={strokeCol}
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 0,76 A 76,76 0 0,0 76,0"
                      stroke={secondaryCol}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.85"
                    />
                  </>
                )}

                {variant === 'pointille' && (
                  <path
                    d="M 0,88 A 88,88 0 0,0 88,0"
                    stroke={strokeCol}
                    strokeWidth="3"
                    strokeDasharray="5 7"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}

                {variant === 'degrade' && (
                  <>
                    <path
                      d="M 0,92 A 92,92 0 0,0 92,0"
                      stroke={`url(#${gradId})`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="8" cy="8" r="4" fill={strokeCol} opacity="0.6" />
                  </>
                )}
              </svg>
            </div>
          );
        }

        // Render Wave
        if (layer.shape === 'wave' || layer.shape === 'blob') {
          const isTop = layer.zone === 'header' || layer.zone === 'page-top';
          const waveColor1 = colors[0] || primaryAccent;
          const waveColor2 = colors[1] || secondaryAccent;

          return (
            <div
              key={layerKey}
              className={`absolute left-0 right-0 w-full pointer-events-none overflow-hidden ${isTop ? 'top-0' : 'bottom-0'}`}
              style={{ height: layer.size?.height || '45px', zIndex, opacity }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 600 80"
                fill="none"
                preserveAspectRatio="none"
                style={!isTop ? { transform: 'scale(1, -1)' } : undefined}
              >
                <path
                  d="M0,0 L600,0 L600,45 C450,75 350,15 200,55 C100,75 50,40 0,60 Z"
                  fill={waveColor1}
                  opacity="0.9"
                />
                <path
                  d="M0,0 L600,0 L600,25 C480,50 360,10 240,40 C120,60 60,30 0,35 Z"
                  fill={waveColor2}
                  opacity="0.75"
                />
              </svg>
            </div>
          );
        }

        // Render Hexagon Lattice
        if (layer.shape === 'hexagon-lattice') {
          const hexColor = colors[0] || primaryAccent;
          const hexAccent = colors[1] || secondaryAccent;
          return (
            <div
              key={layerKey}
              className="absolute top-0 right-0 pointer-events-none overflow-hidden"
              style={{ width: layer.size?.width || '120px', height: layer.size?.height || '70px', zIndex, opacity }}
            >
              <svg className="w-full h-full" viewBox="0 0 120 70" fill="none">
                <polygon points="20,5 35,14 35,31 20,40 5,31 5,14" stroke={hexColor} strokeWidth="1.5" fill={hexColor} fillOpacity="0.08" />
                <polygon points="50,5 65,14 65,31 50,40 35,31 35,14" stroke={hexAccent} strokeWidth="1.5" fill={hexAccent} fillOpacity="0.15" />
                <polygon points="80,5 95,14 95,31 80,40 65,31 65,14" stroke={hexColor} strokeWidth="1.5" fill={hexColor} fillOpacity="0.08" />
                <polygon points="35,27 50,36 50,53 35,62 20,53 20,36" stroke={hexColor} strokeWidth="1.5" fill={hexColor} fillOpacity="0.1" />
                <polygon points="65,27 80,36 80,53 65,62 50,53 50,36" stroke={hexAccent} strokeWidth="1.5" fill={hexAccent} fillOpacity="0.2" />
                <polygon points="95,27 110,36 110,53 95,62 80,53 80,36" stroke={hexColor} strokeWidth="1.5" fill={hexColor} fillOpacity="0.05" />
              </svg>
            </div>
          );
        }

        // Render Diagonal Band
        if (layer.shape === 'diagonal-band') {
          const bandColor1 = colors[0] || primaryAccent;
          const bandColor2 = colors[1] || secondaryAccent;
          const isFooter = layer.zone === 'page-footer';

          return (
            <div
              key={layerKey}
              className={`absolute w-full pointer-events-none overflow-hidden ${isFooter ? 'bottom-0 left-0' : 'top-0 right-0'}`}
              style={{ height: layer.size?.height || '35px', zIndex, opacity }}
            >
              <svg className="w-full h-full" viewBox="0 0 500 50" fill="none" preserveAspectRatio="none">
                {isFooter ? (
                  <>
                    <polygon points="0,50 500,0 500,50 0,50" fill={bandColor1} opacity="0.95" />
                    <polygon points="0,50 350,15 500,50 0,50" fill={bandColor2} opacity="0.75" />
                  </>
                ) : (
                  <>
                    <polygon points="0,0 500,0 500,50 150,0" fill={bandColor1} opacity="0.95" />
                    <polygon points="200,0 500,0 500,30" fill={bandColor2} opacity="0.7" />
                  </>
                )}
              </svg>
            </div>
          );
        }

        // Render Generic Clip-Path
        if (layer.shape === 'clip-path') {
          const clipPathVal = typeof layer.value === 'string' ? layer.value : 'polygon(0 0, 100% 0, 100% 100%, 0 85%)';
          const bgGrad = colors.length > 1
            ? `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
            : colors[0] || primaryAccent;

          return (
            <div
              key={layerKey}
              className="absolute pointer-events-none"
              style={{
                clipPath: clipPathVal,
                background: bgGrad,
                width: layer.size?.width || '100%',
                height: layer.size?.height || '40px',
                top: layer.position?.y !== undefined ? `${layer.position.y}%` : (layer.zone === 'page-footer' ? undefined : '0'),
                bottom: layer.zone === 'page-footer' ? '0' : undefined,
                left: layer.position?.x !== undefined ? `${layer.position.x}%` : '0',
                zIndex,
                opacity
              }}
            />
          );
        }

        // Render Custom SVG-Path
        if (layer.shape === 'svg-path') {
          const pathD = typeof layer.value === 'string' ? layer.value : '';
          const fillColor = colors[0] || primaryAccent;

          return (
            <div
              key={layerKey}
              className="absolute pointer-events-none"
              style={{
                width: layer.size?.width || '100px',
                height: layer.size?.height || '100px',
                top: layer.position?.y !== undefined ? `${layer.position.y}%` : '0',
                left: layer.position?.x !== undefined ? `${layer.position.x}%` : '0',
                zIndex,
                opacity
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
                <path d={pathD} fill={fillColor} />
              </svg>
            </div>
          );
        }

        // Render Page Footer Bar (4 Columns or custom)
        if (layer.shape === 'page-footer-bar') {
          const config: FooterBarConfig = typeof layer.value === 'object' ? layer.value : {};
          const barBg = config.backgroundColor || colors[0] || primaryAccent;
          const barText = config.textColor || '#FFFFFF';
          const labelColor = config.labelColor || colors[1] || secondaryAccent || '#38BDF8';

          const defaultCols: FooterColumnItem[] = [
            { id: 'loc', label: 'Localisation', value: defaultContactData?.adresse || 'Douala, Yassa – Cameroun', icon: 'map-pin' },
            { id: 'tel', label: 'Téléphone', value: defaultContactData?.telephone || '+237 6 98 95 83 57', icon: 'phone' },
            { id: 'email', label: 'Email', value: defaultContactData?.email || 'john.doe@email.com', icon: 'mail' },
            { id: 'dispo', label: 'Disponibilité', value: defaultContactData?.dispo || 'Immédiate', icon: 'clock' }
          ];

          const columns = config.columns && config.columns.length > 0 ? config.columns : defaultCols;

          const getColIcon = (iconName?: string) => {
            switch (iconName) {
              case 'map-pin':
                return <MapPin className="w-2.5 h-2.5" />;
              case 'phone':
                return <Phone className="w-2.5 h-2.5" />;
              case 'mail':
                return <Mail className="w-2.5 h-2.5" />;
              case 'clock':
                return <Clock className="w-2.5 h-2.5" />;
              case 'globe':
                return <Globe className="w-2.5 h-2.5" />;
              case 'briefcase':
                return <Briefcase className="w-2.5 h-2.5" />;
              case 'award':
                return <Award className="w-2.5 h-2.5" />;
              default:
                return <CheckCircle2 className="w-2.5 h-2.5" />;
            }
          };

          return (
            <div
              key={layerKey}
              className="w-full mt-auto py-2 px-3 text-white text-center shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xs shadow-md select-none text-[9.5px] pointer-events-auto"
              style={{ backgroundColor: barBg, color: barText, zIndex, opacity }}
            >
              {columns.map((col, cIdx) => (
                <div key={col.id || `layer-${layerKey}-col-${cIdx}`} className="flex flex-col items-center justify-center px-1">
                  <div className="flex items-center gap-1 font-extrabold uppercase tracking-wider text-[8.5px] opacity-90" style={{ color: labelColor }}>
                    {getColIcon(col.icon)}
                    <span>{col.label}</span>
                  </div>
                  <span className="font-semibold truncate max-w-full leading-tight opacity-95">
                    {col.value}
                  </span>
                </div>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
