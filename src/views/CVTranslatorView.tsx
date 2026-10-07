import React, { useState, useEffect } from 'react';
import { CV, Language, SubscriptionTier, SavedLetter } from '../types';
import { Languages, Sparkles, Download, Check, RefreshCw, ArrowLeft, FileText, Lock, Mail } from 'lucide-react';
import { exportCVToPDF } from '../utils/pdfExport';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { CVPreview } from '../components/CVPreview';
import { translateCV } from '../utils/cvTranslator';

interface CVTranslatorViewProps {
  cvList: CV[];
  activeCv?: CV | null;
  activeCV?: CV | null;
  langue: Language;
  userTier: SubscriptionTier;
  onSaveCv: (cv: CV) => void;
  onOpenCvInEditor?: (cv: CV) => void;
  onOpenUpgradeModal: (tier?: SubscriptionTier) => void;
  onBackToDashboard: () => void;
}

export const CVTranslatorView: React.FC<CVTranslatorViewProps> = ({
  cvList,
  activeCv,
  activeCV,
  langue,
  userTier,
  onSaveCv,
  onOpenCvInEditor,
  onOpenUpgradeModal,
  onBackToDashboard
}) => {
  const isAr = langue === 'ar';
  const isEn = langue === 'en';
  const currentActiveCv = activeCv || activeCV || null;
  
  const [docType, setDocType] = useState<'cv' | 'letter'>('cv');
  const [selectedCvId, setSelectedCvId] = useState<string>(currentActiveCv?.id || cvList[0]?.id || '');
  
  const [lettersList, setLettersList] = useState<SavedLetter[]>([]);
  const [selectedLetterId, setSelectedLetterId] = useState<string>('');
  
  const [targetLang, setTargetLang] = useState<'fr' | 'en' | 'ar'>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [translatedCv, setTranslatedCv] = useState<CV | null>(null);
  const [translatedLetter, setTranslatedLetter] = useState<SavedLetter | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedCv = cvList.find(c => c.id === selectedCvId) || currentActiveCv || cvList[0];
  const selectedLetter = lettersList.find(l => l.id === selectedLetterId) || lettersList[0];

  useEffect(() => {
    let timer: any;
    if (isTranslating) {
      setProgressPercent(10);
      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 30) return prev + 12;
          if (prev < 75) return prev + 7;
          if (prev < 92) return prev + 2;
          return prev;
        });
      }, 350);
    } else {
      setProgressPercent(0);
    }
    return () => clearInterval(timer);
  }, [isTranslating]);

  useEffect(() => {
    const fetchLetters = async () => {
      let loaded: SavedLetter[] = [];
      try {
        const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
        const res = await fetch('/api/lettres', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          loaded = Array.isArray(data) ? data : (data?.letters || []);
        }
      } catch (err) {
        console.warn('Could not load letters for translation from server:', err);
      }

      if (loaded.length === 0) {
        try {
          const local = JSON.parse(localStorage.getItem('cv_builder_letters') || '[]');
          if (Array.isArray(local) && local.length > 0) {
            loaded = local;
          }
        } catch (_) {}
      }

      setLettersList(loaded);
      if (loaded.length > 0) setSelectedLetterId(loaded[0].id);
    };
    fetchLetters();
  }, []);

  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('cv_builder_user') : null;
  let effectiveTier = userTier;
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === 'ADMIN' || parsed.subscriptionTier === 'premium') effectiveTier = 'premium';
    } catch (_) {}
  }
  const isLocked = isPaymentActive() && effectiveTier === 'freemium';

  const handleTranslate = async () => {
    if (isLocked) {
      onOpenUpgradeModal('classique');
      return;
    }

    if (docType === 'cv') {
      if (!selectedCv) {
        alert(isAr ? 'يرجى تحديد سيرة ذاتية للترجمة.' : isEn ? 'Please select a resume to translate.' : 'Veuillez sélectionner un CV à traduire.');
        return;
      }

      setIsTranslating(true);
      setStatusMessage(isAr ? 'جاري ترجمة السيرة الذاتية...' : isEn ? 'Translating CV...' : 'Traduction automatique du CV en cours...');

      try {
        const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
        let finalTranslatedCv: CV | null = null;

        try {
          const res = await fetch('/api/ai/translate-cv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              cv: selectedCv,
              targetLang
            })
          });

          const data = await res.json();
          if (res.ok && data.success && data.translatedCv) {
            finalTranslatedCv = translateCV({
              ...data.translatedCv,
              id: `cv-translated-${Date.now()}`,
              titre: `${selectedCv.titre || 'CV'} (${targetLang.toUpperCase()})`,
              langue: targetLang
            }, targetLang);
          }
        } catch (apiErr) {
          console.warn('Backend translation failed, falling back to local engine:', apiErr);
        }

        // If backend did not succeed or returned untranslated content, apply local translation engine
        if (!finalTranslatedCv) {
          finalTranslatedCv = translateCV({
            ...selectedCv,
            id: `cv-translated-${Date.now()}`,
            titre: `${selectedCv.titre || 'CV'} (${targetLang.toUpperCase()})`,
            langue: targetLang
          }, targetLang);
        }

        setTranslatedCv(finalTranslatedCv);
        setStatusMessage(isAr ? 'تمت الترجمة بنجاح!' : isEn ? 'CV translated successfully!' : 'Traduction du CV terminée avec succès !');
      } catch (err: any) {
        console.error('Translation error:', err);
        setStatusMessage(err.message || (isAr ? 'حدث خطأ أثناء الترجمة.' : isEn ? 'Translation failed.' : 'Erreur lors de la traduction du CV.'));
      } finally {
        setIsTranslating(false);
      }
    } else {
      if (!selectedLetter) {
        alert(isAr ? 'يرجى تحديد رسالة تحفيزية للترجمة.' : isEn ? 'Please select a cover letter to translate.' : 'Veuillez sélectionner une lettre à traduire.');
        return;
      }

      setIsTranslating(true);
      setStatusMessage(isAr ? 'جاري ترجمة رسالة التحفيز...' : isEn ? 'Translating cover letter...' : 'Traduction de la lettre en cours...');

      try {
        const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
        const res = await fetch('/api/ai/translate-letter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            letter: selectedLetter,
            targetLang
          })
        });

        const data = await res.json();
        if (res.ok && data.success && data.translatedLetter) {
          setTranslatedLetter(data.translatedLetter);
          setStatusMessage(isAr ? 'تمت ترجمة الرسالة بنجاح!' : isEn ? 'Cover letter translated successfully!' : 'Traduction de la lettre terminée avec succès !');
        } else {
          throw new Error(data.error || 'Erreur de traduction de la lettre');
        }
      } catch (err: any) {
        console.error('Letter translation error:', err);
        setStatusMessage(err.message || (isAr ? 'حدث خطأ أثناء ترجمة الرسالة.' : isEn ? 'Letter translation failed.' : 'Erreur lors de la traduction de la lettre.'));
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleSaveAndExport = async () => {
    if (docType === 'cv' && translatedCv) {
      onSaveCv(translatedCv);
      setDownloading(true);
      try {
        await exportCVToPDF('cv-preview-container', `${translatedCv.titre || 'CV_Traduit'}.pdf`, false, translatedCv);
      } catch (e) {
        console.error(e);
      } finally {
        setDownloading(false);
      }
    } else if (translatedLetter) {
      navigator.clipboard.writeText(translatedLetter.texteComplet || `${translatedLetter.formulePolitesseEntree}\n\n${translatedLetter.paragrapheAccroche}\n\n${translatedLetter.paragrapheValeurAjoutee}\n\n${translatedLetter.paragrapheAdequationEntreprise}\n\n${translatedLetter.paragrapheConclusion}\n\n${translatedLetter.formulePolitesseSortie}`);
      alert(isAr ? 'تم نسخ الرسالة المترجمة إلى الحافظة!' : isEn ? 'Translated letter copied to clipboard!' : 'Lettre traduite copiée dans le presse-papier !');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-black dark:text-white p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-black/8 dark:border-white/10">
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 bg-white dark:bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white rounded-lg font-semibold text-xs border border-black/15 dark:border-white/15 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isAr ? 'العودة إلى لوحة التحكم' : isEn ? 'Back to Dashboard' : 'Retour au Tableau de bord'}</span>
          </button>

          {isPaymentActive() && (
            <div className="px-3 py-1 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span>{isAr ? 'ميزة كلاسيك / بريميوم' : isEn ? 'Classique & Premium Feature' : 'Inclus Forfait Classique & Premium'}</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-[#121212] p-6 sm:p-8 rounded-lg border border-black/8 dark:border-white/10 shadow-xs relative space-y-4">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-full text-xs font-semibold border border-black/10 dark:border-white/10">
              <Languages className="w-4 h-4" />
              <span>{isAr ? 'ترجمة فورية بـ 3 لغات' : isEn ? 'Instant Tri-Language Translator' : 'Traducteur Instantané Tri-Langue'}</span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl text-black dark:text-white leading-tight">
              {isAr ? 'ترجمة السيرة الذاتية ورسالة التحفيز' : isEn ? 'Translate your CV & Cover Letter' : 'Traduisez votre CV & Lettre de Motivation'}
            </h1>
            
            <p className="text-black/60 dark:text-white/60 text-xs sm:text-sm leading-relaxed font-light">
              {isAr
                ? 'استهدف فرص العمل الدولية من خلال ترجمة سيرتك الذاتية ورسالة التحفيز بدقة عالية وبشكل فوري.'
                : isEn
                ? 'Adapt your application for the international market. AI preserves your layout while accurately translating skills, experiences, and letters.'
                : 'Adaptez votre candidature pour le marché international. L\'IA conserve votre mise en page originale tout en traduisant fidèlement vos compétences, expériences et lettres.'}
            </p>

            {/* Document Type Selector Tabs */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocType('cv')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                  docType === 'cv'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-black/70 dark:text-white/70 border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isAr ? 'السيرة الذاتية (CV)' : isEn ? 'Resume / CV' : 'Savoir-Faire / CV'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDocType('letter')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                  docType === 'letter'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-black/70 dark:text-white/70 border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>{isAr ? 'رسالة تحفيزية' : isEn ? 'Cover Letter' : 'Lettre de Motivation'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Translation Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1: Select Document */}
          <div className="p-6 bg-white dark:bg-[#121212] border border-black/8 dark:border-white/10 rounded-lg space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-black dark:text-white font-semibold text-xs uppercase tracking-wider">
              <span className="w-6 h-6 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold">1</span>
              <span>{isAr ? '1. اختر المستند' : isEn ? '1. Select Document' : '1. Choisir le document'}</span>
            </div>

            {docType === 'cv' ? (
              cvList.length === 0 ? (
                <p className="text-xs text-black/50 dark:text-white/50 italic">
                  {isAr ? 'لا توجد سير ذاتية متاحة. أنشئ سيرة ذاتية أولاً.' : isEn ? 'No CVs found. Create one first.' : 'Aucun CV trouvé. Veuillez d\'abord créer un CV.'}
                </p>
              ) : (
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-neutral-800 border-[1.5px] border-black/15 dark:border-white/15 rounded-lg text-xs font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                >
                  {cvList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titre || 'CV sans titre'} ({c.langue || 'fr'})
                    </option>
                  ))}
                </select>
              )
            ) : (
              lettersList.length === 0 ? (
                <p className="text-xs text-black/50 dark:text-white/50 italic">
                  {isAr ? 'لا توجد رسائل تحفيزية متاحة.' : isEn ? 'No cover letters found.' : 'Aucune lettre de motivation trouvée.'}
                </p>
              ) : (
                <select
                  value={selectedLetterId}
                  onChange={(e) => setSelectedLetterId(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-neutral-800 border-[1.5px] border-black/15 dark:border-white/15 rounded-lg text-xs font-medium text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                >
                  {lettersList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.titre || l.objet || 'Lettre sans titre'}
                    </option>
                  ))}
                </select>
              )
            )}

            {docType === 'cv' && selectedCv && (
              <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/8 dark:border-white/10 text-xs space-y-1">
                <p className="font-semibold text-black dark:text-white">{selectedCv.titre}</p>
                <p className="text-black/50 dark:text-white/50 text-[11px] truncate font-light">{selectedCv.nomComplet || selectedCv.prenom}</p>
                <div className="flex items-center justify-between text-[10px] text-black/40 dark:text-white/40 pt-1">
                  <span>Modèle: {selectedCv.templateId}</span>
                  <span className="uppercase font-semibold text-black dark:text-white">{selectedCv.langue || 'FR'}</span>
                </div>
              </div>
            )}

            {docType === 'letter' && selectedLetter && (
              <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/8 dark:border-white/10 text-xs space-y-1">
                <p className="font-semibold text-black dark:text-white">{selectedLetter.titre || selectedLetter.objet}</p>
                <p className="text-black/50 dark:text-white/50 text-[11px] truncate font-light">{selectedLetter.destinataire || selectedLetter.entreprise}</p>
              </div>
            )}
          </div>

          {/* Step 2: Target Language */}
          <div className="p-6 bg-white dark:bg-[#121212] border border-black/8 dark:border-white/10 rounded-lg space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-black dark:text-white font-semibold text-xs uppercase tracking-wider">
              <span className="w-6 h-6 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold">2</span>
              <span>{isAr ? 'اختر اللغة الهدف' : isEn ? '2. Select Target Language' : '2. Choisir la langue cible'}</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setTargetLang('fr')}
                className={`w-full p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  targetLang === 'fr'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-black dark:text-white border-black/15 dark:border-white/15 hover:border-black'
                }`}
              >
                <span>Français (FR)</span>
                {targetLang === 'fr' && <Check className="w-4 h-4 text-white dark:text-black" />}
              </button>

              <button
                type="button"
                onClick={() => setTargetLang('en')}
                className={`w-full p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  targetLang === 'en'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-black dark:text-white border-black/15 dark:border-white/15 hover:border-black'
                }`}
              >
                <span>English / Anglais (EN)</span>
                {targetLang === 'en' && <Check className="w-4 h-4 text-white dark:text-black" />}
              </button>

              <button
                type="button"
                onClick={() => setTargetLang('ar')}
                className={`w-full p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  targetLang === 'ar'
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-black dark:text-white border-black/15 dark:border-white/15 hover:border-black'
                }`}
              >
                <span>العربية / Arabe (AR)</span>
                {targetLang === 'ar' && <Check className="w-4 h-4 text-white dark:text-black" />}
              </button>
            </div>
          </div>

          {/* Step 3: Trigger Translation */}
          <div className="p-6 bg-white dark:bg-[#121212] border border-black/8 dark:border-white/10 rounded-lg space-y-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-black dark:text-white font-semibold text-xs uppercase tracking-wider mb-2">
                <span className="w-6 h-6 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-bold">3</span>
                <span>{isAr ? 'إطلاق الترجمة' : isEn ? '3. Translate Now' : '3. Lancer la traduction'}</span>
              </div>
              <p className="text-xs text-black/50 dark:text-white/50 font-light">
                {isAr
                  ? 'سيتم توليد نسخة كاملة ومترجمة مع الحفاظ على القالب والتصميم الأصلي.'
                  : isEn
                  ? 'AI will generate a newly translated version preserving full structure and formatting.'
                  : 'L\'IA génèrera une nouvelle version dans la langue sélectionnée.'}
              </p>
            </div>

            {isLocked ? (
              <button
                type="button"
                onClick={() => onOpenUpgradeModal('classique')}
                className="w-full p-3.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-lg shadow-xs border border-black dark:border-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>{isAr ? 'ترقية لـ Classique للترجمة' : isEn ? 'Upgrade to Classique to translate' : 'Passer à Classique pour traduire'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isTranslating || (docType === 'cv' ? !selectedCv : !selectedLetter)}
                onClick={handleTranslate}
                className="w-full p-3.5 bg-black hover:bg-black/85 dark:bg-white dark:hover:bg-white/85 text-white dark:text-black font-semibold text-xs rounded-lg shadow-xs border border-black dark:border-white flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isTranslating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-black" />
                ) : (
                  <Sparkles className="w-4 h-4 text-white dark:text-black" />
                )}
                <span>{isTranslating ? (isAr ? 'جاري الترجمة...' : isEn ? 'Translating...' : 'Traduction en cours...') : (isAr ? 'ترجمة المستند الآن' : isEn ? 'Translate Document' : 'Traduire mon document')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Section */}
        {isTranslating && (
          <div className="p-6 bg-white dark:bg-[#121212] border border-black/15 dark:border-white/15 rounded-lg space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-black dark:text-white">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-black dark:text-white" />
                {progressPercent < 30
                  ? (isAr ? '1. تحضير وتنظيف بيانات المستند...' : isEn ? '1. Preparing document structure...' : '1. Préparation du document...')
                  : progressPercent < 75
                  ? (isAr ? '2. ترجمة ذكية دقيقة عبر الذكاء الاصطناعي...' : isEn ? '2. AI Multilingual Translation...' : '2. Traduction intelligente par l\'IA...')
                  : (isAr ? '3. إعادة هيكلة وتطبيق القالب الأصلي...' : isEn ? '3. Rebuilding template structure...' : '3. Reconstitution du formatage & structure...')}
              </span>
              <span className="font-mono text-black dark:text-white font-bold text-sm">{progressPercent}%</span>
            </div>
            <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 p-0.5 border border-black/10 dark:border-white/10 overflow-hidden">
              <div
                className="bg-black dark:bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-black/50 dark:text-white/50 text-center pt-1 font-light">
              {isAr ? 'يرجى الانتظار بضع ثوانٍ بينما يقوم المترجم الذكي بمعالجة النص.' : isEn ? 'Please hold on a moment while AI processes your document.' : 'Veuillez patienter quelques instants pendant que l\'IA traduit votre document.'}
            </p>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && !isTranslating && (
          <div className="p-4 bg-white dark:bg-[#121212] border border-black/15 dark:border-white/15 rounded-lg text-xs text-black dark:text-white flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-black dark:text-white shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Translated Result Output - CV */}
        {docType === 'cv' && translatedCv && (
          <div className="bg-white dark:bg-[#121212] border border-black/15 dark:border-white/15 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/8 dark:border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-black text-white dark:bg-white dark:text-black">
                    {isAr ? 'تمت الترجمة بنجاح' : isEn ? 'Translation Complete' : 'Traduction Réussie'}
                  </span>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    • Modèle: {translatedCv.templateId}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-black dark:text-white mt-1">
                  {translatedCv.titre}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={downloading}
                  onClick={handleSaveAndExport}
                  className="px-5 py-2.5 bg-black hover:bg-black/85 dark:bg-white dark:hover:bg-white/85 text-white dark:text-black rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {downloading
                      ? (isAr ? 'جاري التصدير...' : isEn ? 'Generating PDF...' : 'Génération PDF HD...')
                      : (isAr ? 'تصدير PDF HD المترجم' : isEn ? 'Download Translated PDF (HD)' : 'Télécharger le PDF Traduit (HD)')}
                  </span>
                </button>

                {onOpenCvInEditor && (
                  <button
                    type="button"
                    onClick={() => onOpenCvInEditor(translatedCv)}
                    className="px-4 py-2.5 bg-white dark:bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white border border-black/15 dark:border-white/15 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'تعديل في المحرر' : isEn ? 'Edit in Studio' : 'Ouvrir dans l\'Éditeur'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Rendered Canvas */}
            <div className="bg-[#f7f7f7] dark:bg-black/40 p-4 sm:p-6 rounded-lg border border-black/8 dark:border-white/10 overflow-x-auto flex justify-center">
              <div className="w-full max-w-[850px] shadow-sm">
                <CVPreview
                  cv={translatedCv}
                  id="cv-preview-container"
                  interactivePreview={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Translated Result Output - Letter */}
        {docType === 'letter' && translatedLetter && (
          <div className="bg-white dark:bg-[#121212] border border-black/15 dark:border-white/15 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/8 dark:border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-black text-white dark:bg-white dark:text-black">
                  {isAr ? 'تمت ترجمة الرسالة' : isEn ? 'Letter Translation Complete' : 'Traduction de Lettre Réussie'}
                </span>
                <h3 className="font-serif text-xl text-black dark:text-white mt-1">
                  {translatedLetter.titre || translatedLetter.objet}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAndExport}
                  className="px-5 py-2.5 bg-black hover:bg-black/85 dark:bg-white dark:hover:bg-white/85 text-white dark:text-black rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'نسخ النص المترجم' : isEn ? 'Copy Translated Text' : 'Copier le texte traduit'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/8 dark:border-white/10 space-y-4 text-xs leading-relaxed text-black dark:text-white font-light">
              <p className="font-semibold">{translatedLetter.formulePolitesseEntree}</p>
              <p>{translatedLetter.paragrapheAccroche}</p>
              <p>{translatedLetter.paragrapheValeurAjoutee}</p>
              <p>{translatedLetter.paragrapheAdequationEntreprise}</p>
              <p>{translatedLetter.paragrapheConclusion}</p>
              <p className="font-semibold">{translatedLetter.formulePolitesseSortie}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
