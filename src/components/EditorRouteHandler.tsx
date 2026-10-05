import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CV, Language, User, Section } from '../types';
import { EditorView } from '../views/EditorView';
import { getDraftCVById, getActiveCVDraft, saveActiveCVDraft } from '../utils/cvDraftStorage';
import { getPresetForTemplate } from '../data/templatePresets';
import { Loader2, AlertCircle } from 'lucide-react';

function ensureCompleteCV(inputCv: CV): CV {
  const preset = getPresetForTemplate(inputCv.templateId || 'modele-1', inputCv.langue);
  const presetSections = preset.sections || [];

  if (!inputCv.sections || inputCv.sections.length === 0) {
    return {
      ...inputCv,
      sections: JSON.parse(JSON.stringify(presetSections))
    };
  }

  const updatedSections: Section[] = [...inputCv.sections];

  // Verify and fill each core section if empty or missing
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

interface EditorRouteHandlerProps {
  activeCV: CV | null;
  setActiveCV: (cv: CV | null) => void;
  cvs: CV[];
  user: User | null;
  langue: Language;
  initialMode: 'visual' | 'form';
  onSaveCV: (cv: CV) => Promise<void>;
  onOpenPayment: (cv: CV) => void;
  onOpenAuth: () => void;
}

export const EditorRouteHandler: React.FC<EditorRouteHandlerProps> = ({
  activeCV,
  setActiveCV,
  cvs,
  user,
  langue,
  initialMode,
  onSaveCV,
  onOpenPayment,
  onOpenAuth
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolvedCV, setResolvedCV] = useState<CV | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function resolveCV() {
      setIsLoading(true);
      setLoadError(null);

      // 1. If activeCV is already in memory and matches the route ID
      if (activeCV && activeCV.id === id) {
        if (isMounted) {
          const complete = ensureCompleteCV(activeCV);
          setResolvedCV(complete);
          if (complete !== activeCV) {
            setActiveCV(complete);
            saveActiveCVDraft(complete);
          }
          setIsLoading(false);
        }
        return;
      }

      // 2. Look in local CVs list prop
      if (id) {
        const foundInCvs = cvs.find(c => c.id === id);
        if (foundInCvs) {
          if (isMounted) {
            const complete = ensureCompleteCV(foundInCvs);
            setResolvedCV(complete);
            setActiveCV(complete);
            saveActiveCVDraft(complete);
            setIsLoading(false);
          }
          return;
        }

        // 3. Look in local storage draft by ID
        const localDraft = getDraftCVById(id);
        if (localDraft) {
          if (isMounted) {
            const complete = ensureCompleteCV(localDraft);
            setResolvedCV(complete);
            setActiveCV(complete);
            saveActiveCVDraft(complete);
            setIsLoading(false);
          }
          return;
        }

        // 4. Check active draft if id matches or if no id
        const activeDraft = getActiveCVDraft();
        if (activeDraft && activeDraft.id === id) {
          if (isMounted) {
            const complete = ensureCompleteCV(activeDraft);
            setResolvedCV(complete);
            setActiveCV(complete);
            saveActiveCVDraft(complete);
            setIsLoading(false);
          }
          return;
        }

        // 5. Try fetching from server API if user has a token
        const token = localStorage.getItem('cv_builder_token');
        try {
          const res = await fetch(`/api/cv/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          if (res.ok) {
            const data = await res.json();
            if (data.cv && isMounted) {
              const complete = ensureCompleteCV(data.cv);
              setResolvedCV(complete);
              setActiveCV(complete);
              saveActiveCVDraft(complete);
              setIsLoading(false);
              return;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch CV from server:', fetchErr);
        }
      }

      // 6. Fallback if no specific ID matched, check if there is an active draft
      const fallbackDraft = getActiveCVDraft() || (cvs.length > 0 ? cvs[0] : null);
      if (fallbackDraft && isMounted) {
        const complete = ensureCompleteCV(fallbackDraft);
        setResolvedCV(complete);
        setActiveCV(complete);
        saveActiveCVDraft(complete);
        setIsLoading(false);
        return;
      }

      if (isMounted) {
        setIsLoading(false);
        setLoadError(
          langue === 'en'
            ? 'CV not found or has been moved.'
            : langue === 'ar'
            ? 'لم يتم العثور على السيرة الذاتية.'
            : 'CV introuvable ou déplacé.'
        );
      }
    }

    resolveCV();

    return () => {
      isMounted = false;
    };
  }, [id, activeCV?.id, cvs.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          {langue === 'en' ? 'Restoring your CV session...' : langue === 'ar' ? 'جاري استعادة السيرة الذاتية...' : 'Restauration de votre session de travail...'}
        </p>
      </div>
    );
  }

  if (loadError || !resolvedCV) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">
          {loadError || (langue === 'en' ? 'CV not found' : 'CV introuvable')}
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          {langue === 'en'
            ? 'Return to your dashboard to choose or create a new CV.'
            : 'Retournez au tableau de bord pour sélectionner un CV existant ou en créer un nouveau.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm"
        >
          {langue === 'en' ? 'Go to Dashboard' : 'Retour au Tableau de Bord'}
        </button>
      </div>
    );
  }

  return (
    <EditorView
      cv={resolvedCV}
      user={user}
      langue={langue}
      initialMode={initialMode}
      onBack={() => navigate('/dashboard')}
      onSaveCV={onSaveCV}
      onOpenPayment={onOpenPayment}
      onOpenAuth={onOpenAuth}
    />
  );
};
