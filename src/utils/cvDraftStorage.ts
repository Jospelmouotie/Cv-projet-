import { CV, Section } from '../types';
import { getPresetForTemplate } from '../data/templatePresets';

export function ensureCompleteDraftCV(inputCv: CV): CV {
  if (!inputCv) return inputCv;
  const preset = getPresetForTemplate(inputCv.templateId || 'modele-1', inputCv.langue);
  const presetSections = preset?.sections || [];

  if (!inputCv.sections || inputCv.sections.length === 0) {
    return {
      ...inputCv,
      sections: JSON.parse(JSON.stringify(presetSections))
    };
  }

  const updatedSections: Section[] = [...inputCv.sections];
  const coreTypes: Array<Section['type']> = ['profil', 'experience', 'formation', 'competences', 'projets'];

  for (const cType of coreTypes) {
    const existingIdx = updatedSections.findIndex(s => s.type === cType);
    const pSec = presetSections.find(ps => ps.type === cType);

    if (existingIdx === -1 && pSec) {
      updatedSections.push(JSON.parse(JSON.stringify(pSec)));
    } else if (existingIdx >= 0 && pSec) {
      const existing = updatedSections[existingIdx];
      const isContentEmpty = !existing.contenu ||
        (Array.isArray(existing.contenu) && existing.contenu.length === 0) ||
        (typeof existing.contenu === 'object' && Object.keys(existing.contenu).length === 0) ||
        (existing.type === 'profil' && !existing.contenu.nomComplet && !existing.contenu.resume);

      if (isContentEmpty) {
        updatedSections[existingIdx] = {
          ...existing,
          contenu: JSON.parse(JSON.stringify(pSec.contenu))
        };
      }
    }
  }

  return {
    ...inputCv,
    sections: updatedSections
  };
}

export const CV_ACTIVE_DRAFT_KEY = 'cv_builder_active_cv';
export const CV_LOCAL_LIST_KEY = 'cv_builder_local_cvs';
export const CV_DRAFT_PREFIX = 'cv_builder_draft_';
export const CV_LAST_SAVED_PREFIX = 'cv_builder_saved_at_';
export const CENTRAL_USER_PROFILE_KEY = 'cv_builder_central_profile';

export interface CentralUserProfile {
  nomComplet: string;
  titreProfessionnel: string;
  email: string;
  telephone: string;
  adresse: string;
  linkedin: string;
  siteWeb: string;
  resume: string;
  photoUrl?: string;
  updatedAt: string;
}

/**
 * Get unified central user profile (single source of truth)
 */
export function getCentralUserProfile(): CentralUserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CENTRAL_USER_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save unified central user profile and notify listeners
 */
export function saveCentralUserProfile(profile: Partial<CentralUserProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCentralUserProfile() || {
      nomComplet: '',
      titreProfessionnel: '',
      email: '',
      telephone: '',
      adresse: '',
      linkedin: '',
      siteWeb: '',
      resume: '',
      updatedAt: new Date().toISOString()
    };

    const updated: CentralUserProfile = {
      ...existing,
      ...profile,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(CENTRAL_USER_PROFILE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('central_profile_updated', { detail: updated }));
  } catch (err) {
    console.warn('Error saving central profile:', err);
  }
}

/**
 * Extracts and updates central profile from a CV instance
 */
export function syncCentralProfileFromCV(cv: CV): void {
  if (!cv || !cv.sections) return;
  const profilSection = cv.sections.find((s) => s.type === 'profil');
  const pc = profilSection?.contenu || {};

  saveCentralUserProfile({
    nomComplet: pc.nomComplet || '',
    titreProfessionnel: pc.titreProfessionnel || '',
    email: pc.email || '',
    telephone: pc.telephone || '',
    adresse: pc.adresse || '',
    linkedin: pc.linkedin || '',
    siteWeb: pc.siteWeb || '',
    resume: pc.resume || '',
    photoUrl: cv.photoUrl || pc.photo
  });
}

/**
 * Get current authenticated user ID from local storage safely
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('cv_builder_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Completely wipe all authentication tokens and cached CV drafts on logout
 * to prevent any cross-account data leakage.
 */
export function clearLocalStorageOnLogout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('cv_builder_token');
    localStorage.removeItem('token');
    localStorage.removeItem('cv_builder_user');
    localStorage.removeItem(CV_ACTIVE_DRAFT_KEY);
    localStorage.removeItem(CV_LOCAL_LIST_KEY);

    // Remove any user-specific drafts or cached metadata
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith(CV_DRAFT_PREFIX) ||
          key.startsWith(CV_LAST_SAVED_PREFIX) ||
          key.startsWith('cv_builder_local_cvs') ||
          key.startsWith('cv_builder_active_cv'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Error clearing localStorage on logout:', err);
  }
}

/**
 * Save active CV draft immediately to local storage and update local CVs list
 */
export function saveActiveCVDraft(cv: CV, explicitUserId?: string | null): void {
  if (typeof window === 'undefined' || !cv || !cv.id) return;

  try {
    const currentUid = explicitUserId !== undefined ? explicitUserId : getCurrentUserId();
    const updatedCV: CV = {
      ...cv,
      userId: cv.userId || currentUid || undefined,
      updatedAt: new Date().toISOString()
    };

    const serialized = JSON.stringify(updatedCV);
    const nowIso = new Date().toISOString();

    // 1. Save active draft
    localStorage.setItem(CV_ACTIVE_DRAFT_KEY, serialized);
    if (currentUid) {
      localStorage.setItem(`${CV_ACTIVE_DRAFT_KEY}_${currentUid}`, serialized);
    }

    // Automatically sync central profile so Letter and LinkedIn stay aligned
    syncCentralProfileFromCV(updatedCV);

    // 2. Save by specific ID
    localStorage.setItem(`${CV_DRAFT_PREFIX}${cv.id}`, serialized);
    localStorage.setItem(`${CV_LAST_SAVED_PREFIX}${cv.id}`, nowIso);

    // 3. Upsert into local CVs collection
    const currentList = getLocalCVs(currentUid);
    const existingIndex = currentList.findIndex((c) => c.id === cv.id);
    let newList: CV[];

    if (existingIndex >= 0) {
      newList = [...currentList];
      newList[existingIndex] = updatedCV;
    } else {
      newList = [updatedCV, ...currentList];
    }

    localStorage.setItem(CV_LOCAL_LIST_KEY, JSON.stringify(newList));
    if (currentUid) {
      localStorage.setItem(`${CV_LOCAL_LIST_KEY}_${currentUid}`, JSON.stringify(newList));
    }

    // 4. Dispatch event for real-time reactivity
    window.dispatchEvent(
      new CustomEvent('cv_draft_saved', {
        detail: { cvId: cv.id, timestamp: nowIso }
      })
    );
  } catch (err) {
    console.warn('Error saving CV draft to localStorage:', err);
  }
}

/**
 * Get active CV draft from local storage with user isolation
 */
export function getActiveCVDraft(targetUserId?: string | null): CV | null {
  if (typeof window === 'undefined') return null;

  try {
    const effectiveUid = targetUserId !== undefined ? targetUserId : getCurrentUserId();

    // If a user ID is given, check scoped key first
    if (effectiveUid) {
      const scopedRaw = localStorage.getItem(`${CV_ACTIVE_DRAFT_KEY}_${effectiveUid}`);
      if (scopedRaw) {
        return ensureCompleteDraftCV(JSON.parse(scopedRaw) as CV);
      }
    }

    const raw = localStorage.getItem(CV_ACTIVE_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as CV;

    // Security & isolation check: do not return another user's draft
    if (draft.userId && effectiveUid && draft.userId !== effectiveUid) {
      return null;
    }

    return ensureCompleteDraftCV(draft);
  } catch (err) {
    console.warn('Error reading active CV draft:', err);
    return null;
  }
}

/**
 * Get all locally cached CVs isolated to the target user
 */
export function getLocalCVs(targetUserId?: string | null): CV[] {
  if (typeof window === 'undefined') return [];

  try {
    const effectiveUid = targetUserId !== undefined ? targetUserId : getCurrentUserId();

    let raw = effectiveUid ? localStorage.getItem(`${CV_LOCAL_LIST_KEY}_${effectiveUid}`) : null;
    if (!raw) {
      raw = localStorage.getItem(CV_LOCAL_LIST_KEY);
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter strictly to prevent cross-account contamination
    return parsed
      .filter((c: CV) => {
        if (!c || !c.id) return false;
        if (effectiveUid) {
          // If an authenticated user is logged in, exclude CVs explicitly owned by another user
          return !c.userId || c.userId === effectiveUid;
        } else {
          // If guest mode, exclude CVs tagged with real registered user IDs
          return !c.userId || c.userId.startsWith('u-gst-') || c.userId.startsWith('guest_');
        }
      })
      .map((c: CV) => ensureCompleteDraftCV(c));
  } catch (err) {
    console.warn('Error reading local CVs:', err);
    return [];
  }
}

/**
 * Save array of CVs locally with user scoping
 */
export function saveLocalCVs(cvs: CV[], targetUserId?: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    const effectiveUid = targetUserId !== undefined ? targetUserId : getCurrentUserId();
    localStorage.setItem(CV_LOCAL_LIST_KEY, JSON.stringify(cvs));
    if (effectiveUid) {
      localStorage.setItem(`${CV_LOCAL_LIST_KEY}_${effectiveUid}`, JSON.stringify(cvs));
    }
  } catch (err) {
    console.warn('Error saving local CVs:', err);
  }
}

/**
 * Get draft CV by specific ID with ownership validation
 */
export function getDraftCVById(id: string, targetUserId?: string | null): CV | null {
  if (typeof window === 'undefined' || !id) return null;

  try {
    const effectiveUid = targetUserId !== undefined ? targetUserId : getCurrentUserId();

    // Check specific draft key
    const rawDraft = localStorage.getItem(`${CV_DRAFT_PREFIX}${id}`);
    if (rawDraft) {
      const parsed = JSON.parse(rawDraft) as CV;
      if (!parsed.userId || !effectiveUid || parsed.userId === effectiveUid) {
        return ensureCompleteDraftCV(parsed);
      }
    }

    // Check active draft
    const active = getActiveCVDraft(effectiveUid);
    if (active && active.id === id) {
      return ensureCompleteDraftCV(active);
    }

    // Check local list
    const list = getLocalCVs(effectiveUid);
    const found = list.find((c) => c.id === id);
    if (found) return ensureCompleteDraftCV(found);

    return null;
  } catch (err) {
    console.warn(`Error getting draft for CV ${id}:`, err);
    return null;
  }
}

/**
 * Delete a local CV and its draft
 */
export function deleteLocalCV(id: string, targetUserId?: string | null): void {
  if (typeof window === 'undefined' || !id) return;

  try {
    const effectiveUid = targetUserId !== undefined ? targetUserId : getCurrentUserId();

    localStorage.removeItem(`${CV_DRAFT_PREFIX}${id}`);
    localStorage.removeItem(`${CV_LAST_SAVED_PREFIX}${id}`);

    const active = getActiveCVDraft(effectiveUid);
    if (active && active.id === id) {
      localStorage.removeItem(CV_ACTIVE_DRAFT_KEY);
      if (effectiveUid) {
        localStorage.removeItem(`${CV_ACTIVE_DRAFT_KEY}_${effectiveUid}`);
      }
    }

    const currentList = getLocalCVs(effectiveUid);
    const updated = currentList.filter((c) => c.id !== id);
    saveLocalCVs(updated, effectiveUid);
  } catch (err) {
    console.warn(`Error deleting local CV ${id}:`, err);
  }
}

/**
 * Get human readable or ISO timestamp of last auto-save
 */
export function getLastSavedTime(id: string): string | null {
  if (typeof window === 'undefined' || !id) return null;
  return localStorage.getItem(`${CV_LAST_SAVED_PREFIX}${id}`);
}

/**
 * Format timestamp into friendly string
 */
export function formatSavedTimeAgo(isoString: string | null | undefined, locale: 'fr' | 'en' | 'ar' = 'fr'): string {
  if (!isoString) {
    return locale === 'en' ? 'Saved' : locale === 'ar' ? 'تم الحفظ' : 'Enregistré';
  }

  try {
    const date = new Date(isoString);
    const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

    if (diffSeconds < 5) {
      return locale === 'en' ? 'Saved just now' : locale === 'ar' ? 'تم الحفظ للتو' : 'Enregistré à l\'instant';
    }
    if (diffSeconds < 60) {
      return locale === 'en' ? `Saved ${diffSeconds}s ago` : locale === 'ar' ? `حُفظ منذ ${diffSeconds} ث` : `Enregistré il y a ${diffSeconds}s`;
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return locale === 'en' ? `Saved ${diffMinutes}m ago` : locale === 'ar' ? `حُفظ منذ ${diffMinutes} د` : `Enregistré il y a ${diffMinutes} min`;
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return locale === 'en' ? `Saved today at ${hours}:${minutes}` : `Enregistré aujourd'hui à ${hours}h${minutes}`;
  } catch {
    return locale === 'en' ? 'Saved' : 'Enregistré';
  }
}

/**
 * Merge local and server CVs with strict user ownership protection
 */
export function mergeServerAndLocalCVs(serverCvs: CV[], currentUserId?: string | null): CV[] {
  const effectiveUid = currentUserId !== undefined ? currentUserId : getCurrentUserId();
  const localCvs = getLocalCVs(effectiveUid);
  const mergedMap = new Map<string, CV>();

  // Add server CVs first (source of truth)
  for (const sCv of serverCvs) {
    if (sCv && sCv.id) {
      mergedMap.set(sCv.id, sCv);
    }
  }

  // Overlay local CVs ONLY if they belong to the current user or are untagged
  for (const lCv of localCvs) {
    if (!lCv || !lCv.id) continue;
    // Security check: Never merge a CV from another user
    if (lCv.userId && effectiveUid && lCv.userId !== effectiveUid) {
      continue;
    }

    const existing = mergedMap.get(lCv.id);
    if (!existing) {
      mergedMap.set(lCv.id, { ...lCv, userId: effectiveUid || lCv.userId });
    } else {
      const serverUpdated = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const localUpdated = lCv.updatedAt ? new Date(lCv.updatedAt).getTime() : 0;
      if (localUpdated > serverUpdated) {
        mergedMap.set(lCv.id, { ...existing, ...lCv, userId: effectiveUid || existing.userId });
      }
    }
  }

  const result = Array.from(mergedMap.values());
  // Sort most recently updated first
  result.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return result;
}
