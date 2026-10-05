import React, { useEffect, useState, useRef } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 2400 }) => {
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setIsClosing(true);
        setTimeout(() => {
          setIsMounted(false);
          if (onFinishRef.current) onFinishRef.current();
        }, 400);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center select-none p-6 transition-opacity duration-400 ease-in-out ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
          <div className="flex flex-col items-center space-y-6 max-w-xs text-center">
            {/* CV ICON PROGRESSIVELY FILLING WITH SOLID BLACK */}
            <div className="relative w-28 h-36 flex items-center justify-center">
              <svg
                className="w-full h-full drop-shadow-sm"
                viewBox="0 0 80 106"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <clipPath id="cv-fill-progress">
                    <rect
                      x="0"
                      y={106 - (106 * progress) / 100}
                      width="80"
                      height={(106 * progress) / 100}
                    />
                  </clipPath>
                </defs>

                {/* 1. Base Outline & Skeleton (White / Light border) */}
                <rect
                  x="2"
                  y="2"
                  width="76"
                  height="102"
                  rx="6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="opacity-20"
                />
                {/* Photo / Avatar Box */}
                <rect
                  x="10"
                  y="12"
                  width="20"
                  height="20"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-25"
                />
                {/* Header Lines */}
                <rect x="36" y="14" width="34" height="4" rx="2" fill="currentColor" className="opacity-25" />
                <rect x="36" y="21" width="24" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
                <rect x="36" y="27" width="18" height="3" rx="1.5" fill="currentColor" className="opacity-20" />

                {/* Body Content Lines */}
                <rect x="10" y="42" width="60" height="3" rx="1.5" fill="currentColor" className="opacity-25" />
                <rect x="10" y="50" width="50" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
                <rect x="10" y="58" width="56" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
                <rect x="10" y="66" width="42" height="3" rx="1.5" fill="currentColor" className="opacity-20" />

                <rect x="10" y="78" width="60" height="3" rx="1.5" fill="currentColor" className="opacity-25" />
                <rect x="10" y="86" width="48" height="3" rx="1.5" fill="currentColor" className="opacity-20" />
                <rect x="10" y="94" width="36" height="3" rx="1.5" fill="currentColor" className="opacity-20" />

                {/* 2. Filled Version (Progressive Solid Black Fill) */}
                <g clipPath="url(#cv-fill-progress)">
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
                  {/* Inverted White inner details on solid fill */}
                  <rect
                    x="10"
                    y="12"
                    width="20"
                    height="20"
                    rx="4"
                    fill="none"
                    stroke={progress > 30 ? (document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF') : 'transparent'}
                    strokeWidth="2"
                  />
                  <rect x="36" y="14" width="34" height="4" rx="2" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} />
                  <rect x="36" y="21" width="24" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.9" />
                  <rect x="36" y="27" width="18" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.8" />

                  <rect x="10" y="42" width="60" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} />
                  <rect x="10" y="50" width="50" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.9" />
                  <rect x="10" y="58" width="56" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.9" />
                  <rect x="10" y="66" width="42" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.8" />

                  <rect x="10" y="78" width="60" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} />
                  <rect x="10" y="86" width="48" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.9" />
                  <rect x="10" y="94" width="36" height="3" rx="1.5" fill={document.documentElement.classList.contains('dark') ? '#000000' : '#FFFFFF'} opacity="0.8" />
                </g>
              </svg>
            </div>

            {/* Typography & Minimalist Progress */}
            <div className="space-y-2">
              <h1 className="text-base font-black tracking-widest uppercase text-black dark:text-white">
                MYCV BUILDER
              </h1>
              
              <div className="w-24 h-0.5 mx-auto bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-black dark:bg-white transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs font-mono font-bold text-black/50 dark:text-white/50">
                {progress}%
              </p>
            </div>
          </div>
    </div>
  );
};