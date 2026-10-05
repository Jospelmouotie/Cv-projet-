import React, { useState } from 'react';
import { CV, Language, LinkedInOptimizationResult } from '../types';
import { 
  Linkedin, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  FileText, 
  RefreshCw, 
  ArrowLeft, 
  Tag, 
  Check
} from 'lucide-react';

interface LinkedInGeneratorViewProps {
  cvs: CV[];
  activeCV: CV | null;
  langue: Language;
  onGoToDashboard: () => void;
}

export const LinkedInGeneratorView: React.FC<LinkedInGeneratorViewProps> = ({
  cvs,
  activeCV,
  langue,
  onGoToDashboard
}) => {
  const [selectedCVId, setSelectedCVId] = useState<string>(
    activeCV?.id || (cvs.length > 0 ? cvs[0].id : '')
  );
  const selectedCV = cvs.find(c => c.id === selectedCVId) || activeCV || cvs[0] || null;

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LinkedInOptimizationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copié dans le presse-papier !');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateLinkedIn = async () => {
    if (!selectedCV) {
      showToast('Veuillez sélectionner un CV source.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cv: selectedCV,
          langue
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la génération du profil LinkedIn');
      }

      const data: LinkedInOptimizationResult = await res.json();
      setResult(data);
      showToast('Profil LinkedIn optimisé généré avec succès !');
    } catch (err: any) {
      console.error('Error generating LinkedIn profile:', err);
      showToast(err.message || 'Une erreur est survenue lors de la génération.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-white/10 dark:border-black/10">
          <CheckCircle2 className="w-4 h-4 text-white dark:text-black" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Action Bar (Clean Black & White) */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-black/8 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="p-2 rounded-lg bg-white hover:bg-black/5 dark:bg-transparent dark:hover:bg-white/5 text-black dark:text-white transition-all cursor-pointer border border-black/15 dark:border-white/15"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-black text-white dark:bg-white dark:text-black">
              <Linkedin className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl text-black dark:text-white">
              Générateur LinkedIn
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToDashboard}
          className="px-3.5 py-2 bg-white hover:bg-black/5 dark:bg-transparent dark:hover:bg-white/5 text-black dark:text-white border border-black/15 dark:border-white/15 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tableau de bord</span>
        </button>
      </div>

      {/* Selector & Generator Action Card */}
      <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-lg border border-black/8 dark:border-white/10 shadow-xs space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-black dark:text-white" />
            <span>Sélectionnez le CV source</span>
          </label>
          <select
            value={selectedCVId}
            onChange={(e) => setSelectedCVId(e.target.value)}
            className="w-full h-12 px-3.5 text-xs bg-white dark:bg-neutral-800 border-[1.5px] border-black/15 dark:border-white/15 text-black dark:text-white rounded-lg focus:border-black dark:focus:border-white outline-none font-medium"
          >
            {cvs.map(c => (
              <option key={c.id} value={c.id}>
                {c.titre} {c.isModified ? '(Modifié / Adapté)' : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleGenerateLinkedIn}
          disabled={isLoading}
          className="w-full h-12 bg-black hover:bg-black/85 dark:bg-white dark:hover:bg-white/85 text-white dark:text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow-xs"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Génération du profil LinkedIn en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Générer Titre, Bio & Expériences LinkedIn</span>
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-150">
          
          {/* 1. Headline / Titre Professionnel */}
          <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-lg border border-black/8 dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                  Titre du Profil (Headline)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(result.titreProfil, 'headline')}
                className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded bg-white hover:bg-black/5 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/15 dark:border-white/15 transition-all"
              >
                {copiedKey === 'headline' ? (
                  <span className="text-black dark:text-white font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Copié !
                  </span>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-black dark:text-white p-3.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/8 dark:border-white/10">
              {result.titreProfil}
            </p>
          </div>

          {/* 2. About / Résumé Bio */}
          <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-lg border border-black/8 dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                  Section "Infos" (Bio / Résumé)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(result.resumeBio, 'about')}
                className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded bg-white hover:bg-black/5 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-black/15 dark:border-white/15 transition-all"
              >
                {copiedKey === 'about' ? (
                  <span className="text-black dark:text-white font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Copié !
                  </span>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 sm:p-5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/8 dark:border-white/10 text-xs sm:text-sm text-black dark:text-white whitespace-pre-wrap leading-relaxed font-light">
              {result.resumeBio}
            </div>
          </div>

          {/* 3. Experiences Bullet Points */}
          {result.experiencesLinkedIn && result.experiencesLinkedIn.length > 0 && (
            <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-lg border border-black/8 dark:border-white/10 shadow-xs space-y-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                  Expériences Clés Reformulées
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {result.experiencesLinkedIn.map((exp, idx) => (
                  <div key={`li-exp-${idx}`} className="p-3.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/8 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-xs text-black dark:text-white">{exp.titrePoste}</p>
                      <button
                        type="button"
                        onClick={() => handleCopy(exp.pointsCles.join('\n'), `exp-${idx}`)}
                        className="text-[11px] font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `exp-${idx}` ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <ul className="space-y-1 text-xs text-black/70 dark:text-white/70 list-disc list-inside font-light">
                      {exp.pointsCles.map((pt, pIdx) => (
                        <li key={`li-pt-${idx}-${pIdx}`} className="leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SEO Keywords Badges */}
          {result.motsClesRecommandes && result.motsClesRecommandes.length > 0 && (
            <div className="bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-lg border border-black/8 dark:border-white/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-black dark:text-white" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-black dark:text-white bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                    Mots-clés Recommandés
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(result.motsClesRecommandes.join(', '), 'keywords')}
                  className="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                >
                  Tout copier
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.motsClesRecommandes.map((mot, idx) => (
                  <span
                    key={`li-kw-${mot}-${idx}`}
                    onClick={() => handleCopy(mot, `kw-${idx}`)}
                    className="px-2.5 py-1 text-xs font-medium bg-black/[0.03] dark:bg-white/[0.05] text-black dark:text-white border border-black/15 dark:border-white/15 rounded-lg cursor-pointer hover:bg-black/10 dark:hover:bg-white/15 transition-all"
                    title="Cliquez pour copier"
                  >
                    #{mot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Visibility Advice */}
          {result.conseilsVisibilite && result.conseilsVisibilite.length > 0 && (
            <div className="p-4 sm:p-5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/8 dark:border-white/10 space-y-2 text-xs text-black dark:text-white">
              <h4 className="font-semibold uppercase tracking-wider flex items-center gap-2 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Conseils pour maximiser la visibilité</span>
              </h4>
              <ul className="space-y-1 list-disc list-inside text-black/70 dark:text-white/70 font-light">
                {result.conseilsVisibilite.map((c, idx) => (
                  <li key={`li-adv-${idx}`}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
