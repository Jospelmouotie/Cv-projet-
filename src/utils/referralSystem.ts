export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalClicks: number;
  totalSignups: number;
  rewardTier: 'none' | '1_export' | '1_month_premium' | '3_months_premium';
  unlockedHdExports: number;
  premiumMonthsGranted: number;
  referralsList: Array<{
    id: string;
    emailMasked: string;
    date: string;
    status: 'registered' | 'active';
  }>;
}

const REFERRAL_STORAGE_KEY = 'cv_builder_referral_data';
const PENDING_REF_KEY = 'cv_builder_pending_referral';

/**
 * Generates or retrieves the unique referral code for the current user
 */
export function getUserReferralCode(userId?: string | null): string {
  if (typeof window === 'undefined') return 'REF-GUEST';

  const uid = userId || 'demo-user';
  let stored = localStorage.getItem(`cv_ref_code_${uid}`);
  if (!stored) {
    // Generate a deterministic or clean alphanumeric 6-character code
    const hash = Math.abs(
      uid.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(36).toUpperCase().padStart(6, 'X').slice(0, 6);
    stored = `REF-${hash}`;
    localStorage.setItem(`cv_ref_code_${uid}`, stored);
  }
  return stored;
}

/**
 * Returns complete referral stats and rewards
 */
export function getReferralStats(userId?: string | null): ReferralStats {
  const code = getUserReferralCode(userId);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://moncvgratuit.com';
  const referralLink = `${origin}/?ref=${code}`;

  if (typeof window === 'undefined') {
    return {
      referralCode: code,
      referralLink,
      totalClicks: 0,
      totalSignups: 0,
      rewardTier: 'none',
      unlockedHdExports: 0,
      premiumMonthsGranted: 0,
      referralsList: []
    };
  }

  try {
    const raw = localStorage.getItem(`${REFERRAL_STORAGE_KEY}_${code}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        referralCode: code,
        referralLink
      };
    }
  } catch {}

  return {
    referralCode: code,
    referralLink,
    totalClicks: 0,
    totalSignups: 0,
    rewardTier: 'none',
    unlockedHdExports: 0,
    premiumMonthsGranted: 0,
    referralsList: []
  };
}

/**
 * Saves updated referral stats
 */
export function saveReferralStats(stats: ReferralStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${REFERRAL_STORAGE_KEY}_${stats.referralCode}`, JSON.stringify(stats));
  } catch (e) {
    console.warn('Error saving referral stats:', e);
  }
}

/**
 * Captures referral query parameter (?ref=...) on app load
 */
export function captureReferralFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.startsWith('REF-')) {
      localStorage.setItem(PENDING_REF_KEY, ref);
      // Track click if on same device or local test
      const stats = getReferralStats();
      if (stats.referralCode === ref) {
        stats.totalClicks += 1;
        saveReferralStats(stats);
      }
    }
  } catch {}
}

/**
 * Triggers when a new user registers or signs up, attributing the referral
 */
export function attributeReferralOnSignup(newUserEmail: string): void {
  if (typeof window === 'undefined') return;
  try {
    const pendingRef = localStorage.getItem(PENDING_REF_KEY);
    if (!pendingRef) return;

    // Retrieve referrer's stats
    const raw = localStorage.getItem(`${REFERRAL_STORAGE_KEY}_${pendingRef}`);
    let stats: ReferralStats;
    if (raw) {
      stats = JSON.parse(raw);
    } else {
      stats = {
        referralCode: pendingRef,
        referralLink: `${window.location.origin}/?ref=${pendingRef}`,
        totalClicks: 1,
        totalSignups: 0,
        rewardTier: 'none',
        unlockedHdExports: 0,
        premiumMonthsGranted: 0,
        referralsList: []
      };
    }

    // Mask user email for privacy (e.g. j***@gmail.com)
    const [name, domain] = newUserEmail.split('@');
    const masked = `${name.slice(0, 1)}***@${domain || 'mail.com'}`;

    stats.totalSignups += 1;
    stats.referralsList.unshift({
      id: `ref-user-${Date.now()}`,
      emailMasked: masked,
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'registered'
    });

    // Compute rewards:
    // 1 friend = 1 export HD offert
    // 3 friends = 1 mois Premium offert
    // 5 friends = 3 mois Premium offerts
    if (stats.totalSignups >= 5) {
      stats.rewardTier = '3_months_premium';
      stats.premiumMonthsGranted = 3;
      stats.unlockedHdExports = Math.max(stats.unlockedHdExports, 5);
    } else if (stats.totalSignups >= 3) {
      stats.rewardTier = '1_month_premium';
      stats.premiumMonthsGranted = 1;
      stats.unlockedHdExports = Math.max(stats.unlockedHdExports, 3);
    } else if (stats.totalSignups >= 1) {
      stats.rewardTier = '1_export';
      stats.unlockedHdExports = Math.max(stats.unlockedHdExports, 1);
    }

    saveReferralStats(stats);
    localStorage.removeItem(PENDING_REF_KEY);
  } catch (e) {
    console.warn('Error attributing referral:', e);
  }
}
