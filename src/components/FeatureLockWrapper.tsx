import React from 'react';
import { SubscriptionTier } from '../types';
import { LockedFeatureBadge } from './LockedFeatureBadge';
import { Sparkles, Lock } from 'lucide-react';

interface FeatureLockWrapperProps {
  isLocked?: boolean;
  requiredTier?: SubscriptionTier;
  onLockedClick?: () => void;
  children: React.ReactNode;
  showBadge?: boolean;
  badgePosition?: 'top-right' | 'inline';
  className?: string;
}

export const FeatureLockWrapper: React.FC<FeatureLockWrapperProps> = ({
  isLocked = false,
  requiredTier = 'classique',
  onLockedClick,
  children,
  showBadge = false,
  badgePosition = 'top-right',
  className = ''
}) => {
  if (!isLocked) {
    return (
      <div className={`relative ${className}`}>
        {children}
        {showBadge && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <LockedFeatureBadge tier={requiredTier} />
          </div>
        )}
      </div>
    );
  }

  const handleIntercept = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLockedClick) {
      onLockedClick();
    }
  };

  return (
    <div
      onClick={handleIntercept}
      className={`relative group cursor-pointer select-none ${className}`}
    >
      {/* Blurred / Dimmed children */}
      <div className="opacity-70 pointer-events-none filter blur-[0.2px] transition-opacity group-hover:opacity-50">
        {children}
      </div>

      {/* Modern Black & White Action Pill with Padlock */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/40 rounded-xl flex items-center justify-center p-2 z-20 backdrop-blur-[0.5px]">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-black shadow-md border border-neutral-800 dark:border-neutral-200">
          <Lock className="w-3.5 h-3.5 text-purple-400 dark:text-purple-600 shrink-0" />
          <span>{requiredTier === 'premium' ? 'Pack Premium' : 'Pack Classique'}</span>
        </div>
      </div>
    </div>
  );
};
