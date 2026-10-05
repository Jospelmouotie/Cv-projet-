import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  badgeText?: string;
  animated?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'sm',
  showText = false,
  className = '',
  badgeText,
  animated = false,
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', px: 24, text: 'text-xs', sub: 'text-[9px]' },
    sm: { box: 'w-8 h-8', px: 32, text: 'text-sm', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10', px: 40, text: 'text-base', sub: 'text-xs' },
    lg: { box: 'w-12 h-12', px: 48, text: 'text-lg', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', px: 64, text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern App Icon SVG */}
      <div 
        className={`relative shrink-0 ${currentSize.box} ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Background Gradient */}
            <linearGradient id="moncv-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Document Gradient */}
            <linearGradient id="moncv-sheet" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>

            {/* Fold Corner Gradient */}
            <linearGradient id="moncv-fold" x1="28" y1="8" x2="36" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#BFDBFE" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>

            {/* Accent Cyan Gradient */}
            <linearGradient id="moncv-cyan" x1="16" y1="20" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Golden Star Gradient */}
            <linearGradient id="moncv-star" x1="30" y1="30" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Subtle inner highlight */}
            <linearGradient id="moncv-border" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Squircle App Container */}
          <rect
            x="1.5"
            y="1.5"
            width="45"
            height="45"
            rx="12"
            fill="url(#moncv-bg)"
            stroke="url(#moncv-border)"
            strokeWidth="1.5"
          />

          {/* Top gloss specular highlight */}
          <path
            d="M 4 14 C 4 7 7 4 14 4 L 34 4 C 41 4 44 7 44 14 C 36 12 12 12 4 14 Z"
            fill="#FFFFFF"
            fillOpacity="0.15"
          />

          {/* CV Document Body with Folded Top-Right Corner */}
          <path
            d="M 12 12 C 12 10 13.5 8.5 15.5 8.5 L 27.5 8.5 L 35.5 16.5 L 35.5 35.5 C 35.5 37.5 34 39 32 39 L 15.5 39 C 13.5 39 12 37.5 12 35.5 Z"
            fill="url(#moncv-sheet)"
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
          />

          {/* Folded Corner Triangle */}
          <path
            d="M 27.5 8.5 L 27.5 14.5 C 27.5 15.5 28.5 16.5 29.5 16.5 L 35.5 16.5 Z"
            fill="url(#moncv-fold)"
          />

          {/* CV Header Accent Ribbon */}
          <rect x="15" y="12" width="10" height="2.5" rx="1.25" fill="#2563EB" />

          {/* Profile Circle Thumbnail inside CV */}
          <circle cx="18" cy="19.5" r="2.5" fill="#3B82F6" />

          {/* Candidate Name & Title lines */}
          <rect x="22" y="18" width="10" height="1.5" rx="0.75" fill="#1E293B" />
          <rect x="22" y="20.5" width="7" height="1.2" rx="0.6" fill="#64748B" />

          {/* CV Section Line 1 (Experience) */}
          <rect x="15" y="24" width="17" height="1.5" rx="0.75" fill="#3B82F6" />
          <rect x="15" y="27" width="13" height="1.2" rx="0.6" fill="#94A3B8" />

          {/* CV Section Line 2 (Skills Pill Badges) */}
          <rect x="15" y="30.5" width="6" height="2" rx="1" fill="url(#moncv-cyan)" />
          <rect x="22" y="30.5" width="6" height="2" rx="1" fill="#CBD5E1" />

          {/* AI Intelligence Spark / Diamond Badge on bottom-right */}
          <g transform="translate(27, 27)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))">
            <circle cx="9" cy="9" r="8" fill="#1E1B4B" stroke="#60A5FA" strokeWidth="1" />
            <path
              d="M 9 3.5 L 10.3 7.2 C 10.6 8 11.2 8.6 12 8.9 L 15.7 10.2 L 12 11.5 C 11.2 11.8 10.6 12.4 10.3 13.2 L 9 16.9 L 7.7 13.2 C 7.4 12.4 6.8 11.8 6 11.5 L 2.3 10.2 L 6 8.9 C 6.8 8.6 7.4 8 7.7 7.2 Z"
              fill="url(#moncv-star)"
            />
          </g>
        </svg>
      </div>

      {/* Brand Text if requested */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-neutral-900 dark:text-white ${currentSize.text}`}>
              MonCV
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              PRO
            </span>
          </div>
          {badgeText && (
            <span className={`font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest mt-0.5 ${currentSize.sub}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AppLogo;
