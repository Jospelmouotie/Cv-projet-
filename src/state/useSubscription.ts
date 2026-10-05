import { useMemo, useCallback } from 'react';
import { User, SubscriptionTier, FeatureKey } from '../types';
import {
  ENFORCE_PAYMENT_GATES,
  PLANS_CONFIG,
  isFeatureAllowed,
  isTemplateAllowed,
  isStudioTabAllowed,
  getRequiredTierForFeature,
  getRequiredTierForTemplate,
  getRequiredTierForStudioTab
} from '../utils/subscriptionGates';

export interface UseSubscriptionOptions {
  user?: User | null;
  enforce?: boolean;
}

export function useSubscription(options?: UseSubscriptionOptions) {
  const user = options?.user;
  const enforce = options?.enforce ?? ENFORCE_PAYMENT_GATES;

  const currentTier: SubscriptionTier = useMemo(() => {
    if (user?.role === 'ADMIN' || user?.subscriptionTier === 'premium') return 'premium';
    return user?.subscriptionTier || 'freemium';
  }, [user]);

  const plan = useMemo(() => {
    return PLANS_CONFIG[currentTier];
  }, [currentTier]);

  const checkFeature = useCallback(
    (feature: FeatureKey): boolean => {
      return isFeatureAllowed(currentTier, feature, enforce);
    },
    [currentTier, enforce]
  );

  const checkTemplate = useCallback(
    (templateId: string): boolean => {
      return isTemplateAllowed(currentTier, templateId, enforce);
    },
    [currentTier, enforce]
  );

  const checkStudioTab = useCallback(
    (tabId: string): boolean => {
      return isStudioTabAllowed(currentTier, tabId, enforce);
    },
    [currentTier, enforce]
  );

  return {
    currentTier,
    plan,
    plans: PLANS_CONFIG,
    isEnforced: enforce,
    checkFeature,
    checkTemplate,
    checkStudioTab,
    getRequiredTierForFeature,
    getRequiredTierForTemplate,
    getRequiredTierForStudioTab
  };
}
