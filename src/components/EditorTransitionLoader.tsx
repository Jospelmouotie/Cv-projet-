import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface EditorTransitionLoaderProps {
  message?: string;
  langue?: Language;
}

export const EditorTransitionLoader: React.FC<EditorTransitionLoaderProps> = ({
  message,
  langue = 'fr'
}) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const defaultText = 
    langue === 'en' ? 'Preparing your CV editor...' :
    langue === 'ar' ? 'جاري إعداد محرر السيرة الذاتية...' :
    'Préparation de votre éditeur de CV...';

  return (
    <div className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none text-black dark:text-white animate-fadeIn">
      {/* MINIMALIST MONOCHROME CV ICON PROGRESSIVELY FILLING */}
      <div className="relative w-20 h-28 flex items-center justify-center mb-6">
        <svg
          className="w-full h-full"
          viewBox="0 0 80 106"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="transition-fill-progress">
              <rect
                x="0"
                y={106 - (106 * Math.min(100, progress)) / 100}
                width="80"
                height={(106 * Math.min(100, progress)) / 100}
              />
            </clipPath>
          </defs>

          {/* 1. Base Outline */}
          <rect
            x="2"
            y="2"
            width="76"
            height="102"
            rx="6"
            stroke="currentColor"
            strokeWidth="2.5"
            className="opacity-25"
          />
          <rect x="10" y="12" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2" className="opacity-25" />
          <rect x="36" y="14" width="34" height="4" rx="2" fill="currentColor" className="opacity-25" />
          <rect x="36" y="21" width="24" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
          <rect x="36" y="27" width="18" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
          <rect x="10" y="42" width="60" height="3" rx="1.5" fill="currentColor" className="opacity-25" />
          <rect x="10" y="50" width="50" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
          <rect x="10" y="58" width="56" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
          <rect x="10" y="70" width="60" height="3" rx="1.5" fill="currentColor" className="opacity-25" />
          <rect x="10" y="78" width="48" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
          <rect x="10" y="86" width="36" height="3" rx="1.5" fill="currentColor" className="opacity-20" />

          {/* 2. Solid Black Fill */}
          <g clipPath="url(#transition-fill-progress)">
            <rect
              x="2"
              y="2"
              width="76"
              height="102"
              rx="6"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <rect x="36" y="14" width="34" height="4" rx="2" fill="white" className="dark:fill-black" />
            <rect x="36" y="21" width="24" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="36" y="27" width="18" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="10" y="42" width="60" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="10" y="50" width="50" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="10" y="58" width="56" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="10" y="70" width="60" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="10" y="78" width="48" height="3" rx="1.5" fill="white" className="dark:fill-black" />
            <rect x="10" y="86" width="36" height="3" rx="1.5" fill="white" className="dark:fill-black" />
          </g>
        </svg>
      </div>

      <div className="max-w-xs space-y-2">
        <h3 className="text-sm font-bold tracking-tight text-black dark:text-white">
          {message || defaultText}
        </h3>
        
        <div className="w-24 h-0.5 mx-auto bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-150"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

