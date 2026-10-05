import React from 'react';
import { SubscriptionTier } from '../types';

interface LockedFeatureBadgeProps {
  tier: SubscriptionTier;
  showLockIcon?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

// User directive: All padlocks (cadenas) must disappear completely
export const LockedFeatureBadge: React.FC<LockedFeatureBadgeProps> = () => {
  return null;
};
