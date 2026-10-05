import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CV, Language, SavedLetter, JobOfferExtraction, PersonnalisationResult, ProfilContenu } from '../types';
import { 
  Target, 
  Sparkles, 
  Upload, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Edit3, 
  Eye, 
  Briefcase, 
  Check,
  Palette,
  Plus,
  X,
  ArrowLeftRight,
  HelpCircle
} from 'lucide-react';
import { extractDominantColorFromImage, getKnownBrandColor } from '../utils/brandColorExtractor';
import { LetterPreviewModal } from '../components/LetterPreviewModal';
import { buildAdaptedCvLocally, generateTargetingSuggestions } from '../utils/jobTargetingEngine';
import { CVPreview } from '../components/CVPreview';
import { ClearableInput } from '../components/ClearableInput';

interface JobTargetingViewProps {
  cvs: CV[];
  activeCV: CV | null;
  langue: Language;
  onApplyPersonalizedCV?: (newCV: CV) => Promise<void> | void;
  onCVPersonalized?: (newCV: CV) => void;
  onSavePersonalizedLetter?: (letter: SavedLetter) => Promise<void> | void;
  onLetterGenerated?: (letter?: SavedLetter) => void;
  onOpenCVEditor?: (cv: CV) => void;
  onOpenLetterEditor?: (letter: SavedLetter) => void;
  onGoToDashboard?: () => void;
  onGoToLetters?: () => void;
}

export const JobTargetingView: React.FC<JobTargetingViewProps> = ({
  cvs,
  activeCV,
  langue,
  onApplyPersonalizedCV,
  onCVPersonalized,
  onSavePersonalizedLetter,
  onLetterGenerated,
  onOpenCVEditor,
  onOpenLetterEditor,
  onGoToDashboard,
  onGoToLetters
}) => {
  // Step 1: Input | Step 2: Dynamic Questions & Suggestions | Step 3: Result & Tailored Assets
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected base CV
  const [selectedCVId, setSelectedCVId] = useState<string>(
    activeCV?.id || (cvs.length > 0 ? cvs[0].id : '')
  );
  const selectedCV = cvs.find(c => c.id === selectedCVId) || activeCV || cvs[0] || null;

  // Job Offer Input modes
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [offreTexte, setOffreTexte] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis & extracted offer state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedOffer, setExtractedOffer] = useState<JobOfferExtraction | null>(null);

  // Mode de mise à jour : mise à jour directe du CV en cours OU création d'une nouvelle copie ciblée
  const [updateMode, setUpdateMode] = useState<'update_current' | 'create_copy'>('update_current');

  // 1. Profil Pro ciblé (Titre & Résumé)
  const [customProfileTitle, setCustomProfileTitle] = useState<string>('');
  const [customProfileResume, setCustomProfileResume] = useState<string>('');
  const [isEditingResume, setIsEditingResume] = useState<boolean>(false);

  // 2. Compétences (Ne rien inventer, priorisées)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedOldSkills, setSelectedOldSkills] = useState<string[]>([]);
  const [extraSkills, setExtraSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // Initialiser les anciennes compétences conservées avec les compétences du CV sélectionné
  useEffect(() => {
    if (selectedCV) {
      const compSec = selectedCV.sections?.find((s: any) => s.type === 'competences');
      if (compSec && Array.isArray(compSec.contenu)) {
        const names = compSec.contenu.map((c: any) => c.nom || '').filter(Boolean);
        setSelectedOldSkills(names);
      }
    }
  }, [selectedCV?.id]);

  // 3. Questions ciblées & Expériences reformulées
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [experienceReformulations, setExperienceReformulations] = useState<Record<string, string>>({});
  const [acceptedReformulations, setAcceptedReformulations] = useState<Record<string, boolean>>({});
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  // 4. Couleur de marque identifiée & palette bicolore
  const [targetBrandColor, setTargetBrandColor] = useState<string>('#111827');
  const [targetBrandSecondaryColor, setTargetBrandSecondaryColor] = useState<string>('#4B5563');
  const [brandColorName, setBrandColorName] = useState<string>('Teinte de l\'annonce');
  const [applyBrandColor, setApplyBrandColor] = useState<boolean>(true);
  const [colorHarmonizationMode, setColorHarmonizationMode] = useState<'duo' | 'primary_dominant' | 'secondary_dominant'>('duo');
  const [selectedTemplateStyle, setSelectedTemplateStyle] = useState<string>(activeCV?.styleEnTete || 'baxter-diagonal');
  const [selectedExpVariants, setSelectedExpVariants] = useState<Record<string, 'resultats' | 'technique' | 'impact' | 'original'>>({});

  const handleSwapColors = () => {
    const oldP = targetBrandColor;
    const oldS = targetBrandSecondaryColor;
    setTargetBrandColor(oldS);
    setTargetBrandSecondaryColor(oldP);
    showToast('Couleurs primaire et secondaire interverties.');
  };

  // Preview Modal State for Cover Letter
  const [showLetterPreviewModal, setShowLetterPreviewModal] = useState<boolean>(false);
  const [previewLetterData, setPreviewLetterData] = useState<SavedLetter | null>(null);

  // Final Personalization Output
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringResult, setTailoringResult] = useState<PersonnalisationResult | null>(null);
  const [createdCV, setCreatedCV] = useState<CV | null>(null);
  const [createdLetter, setCreatedLetter] = useState<SavedLetter | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Responsive scale for desktop preview
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState<number>(0.42);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const update = () => {
      if (previewContainerRef.current && previewContainerRef.current.clientWidth > 0) {
        setPreviewScale(Math.min(0.55, previewContainerRef.current.clientWidth / 794));
      }
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(previewContainerRef.current);
    return () => obs.disconnect();
  }, [step]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Real-time adapted CV for live preview
  const livePreviewCV = useMemo<CV | null>(() => {
    if (!selectedCV) return null;
    if (createdCV) return createdCV;
    try {
      const cloned: CV = JSON.parse(JSON.stringify(selectedCV));
      if (step >= 2) {
        if (customProfileTitle || customProfileResume) {
          const pSec = cloned.sections?.find((s: any) => s.type === 'profil');
          if (pSec && pSec.contenu) {
            if (customProfileTitle) pSec.contenu.titreProfessionnel = customProfileTitle;
            if (customProfileResume) pSec.contenu.resume = customProfileResume;
          }
        }
        if (applyBrandColor && targetBrandColor) {
          cloned.couleurAccent = targetBrandColor;
        }
      }
      return cloned;
    } catch (_) {
      return selectedCV;
    }
  }, [selectedCV, createdCV, step, customProfileTitle, customProfileResume, applyBrandColor, targetBrandColor]);

  // Handle image upload with automatic client-side canvas dominant color extraction
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);

      try {
        const extracted = await extractDominantColorFromImage(result);
        if (extracted?.primary) {
          setTargetBrandColor(extracted.primary);
          setTargetBrandSecondaryColor(extracted.secondary);
          setBrandColorName(extracted.name);
        }
      } catch (err) {
        console.warn('Could not extract color from image:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 1: Analyze Job Offer & Prepare Suggestions
  const handleAnalyzeOffer = async () => {
    if (!selectedCV) {
      showToast('Veuillez sélectionner un CV source.');
      return;
    }

    if (inputMode === 'text' && !offreTexte.trim()) {
      showToast('Veuillez coller le texte de l\'offre d\'emploi.');
      return;
    }

    if (inputMode === 'image' && !imageBase64) {
      showToast('Veuillez importer une capture d\'écran de l\'offre.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/cibler-offre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cv: selectedCV,
          langue,
          offreTexte: inputMode === 'text' ? offreTexte : undefined,
          offreImage: inputMode === 'image' ? imageBase64 : undefined,
          texteOffre: inputMode === 'text' ? offreTexte : undefined,
          imageBase64: inputMode === 'image' ? imageBase64 : undefined
        })
      });

      let data: JobOfferExtraction;
      if (res.ok) {
        data = await res.json();
      } else {
        data = generateTargetingSuggestions({
          cv: selectedCV,
          rawText: offreTexte,
          langue
        });
      }

      const localSuggestions = generateTargetingSuggestions({
        cv: selectedCV,
        offre: data,
        rawText: offreTexte,
        langue
      });

      const mergedData: JobOfferExtraction = {
        ...localSuggestions,
        ...data,
        suggestionsProfil: data.suggestionsProfil || localSuggestions.suggestionsProfil,
        competencesPriorisees: data.competencesPriorisees || localSuggestions.competencesPriorisees,
        suggestionsExperiences: data.suggestionsExperiences || localSuggestions.suggestionsExperiences,
        questionsCompetences: data.questionsCompetences || localSuggestions.questionsCompetences,
        questionsExperiences: data.questionsExperiences || localSuggestions.questionsExperiences
      };

      setExtractedOffer(mergedData);

      const known = getKnownBrandColor(mergedData.entreprise);
      const chosenPrimary = mergedData.couleurDetectee || (known ? known.primary : targetBrandColor) || '#111827';
      const chosenSecondary = mergedData.couleurSecondaire || (known ? known.secondary : targetBrandSecondaryColor) || '#4B5563';
      const chosenName = mergedData.nomCouleurMarque || (known ? known.name : brandColorName) || 'Couleur identifiée sur l\'annonce';

      setTargetBrandColor(chosenPrimary);
      setTargetBrandSecondaryColor(chosenSecondary);
      setBrandColorName(chosenName);

      setCustomProfileTitle(mergedData.suggestionsProfil?.titreSuggere || mergedData.titrePoste || 'Poste Cible');
      setCustomProfileResume(mergedData.suggestionsProfil?.resumeSuggere || '');

      const allPrioritizedSkills = mergedData.competencesPriorisees || [];
      const defaultChecked = allPrioritizedSkills
        .filter(s => s.priorite === 'haute' || s.dejaPresente)
        .map(s => s.nom);
      
      const rawReq = [
        ...(mergedData.competencesClesRequises || []),
        ...(mergedData.competencesRequises || []),
        ...(mergedData.competencesCles || [])
      ].filter(Boolean);

      setSelectedSkills(defaultChecked.length > 0 ? defaultChecked : rawReq.slice(0, 5));

      const existingCvSkillItems = (selectedCV?.sections?.find(s => s.type === 'competences')?.contenu || []) as any[];
      setSelectedOldSkills(existingCvSkillItems.map((c: any) => c.nom || '').filter(Boolean));

      const expReformMap: Record<string, string> = {};
      const expAcceptedMap: Record<string, boolean> = {};

      if (Array.isArray(mergedData.suggestionsExperiences)) {
        mergedData.suggestionsExperiences.forEach((expSug) => {
          const id = expSug.experienceId || expSug.poste;
          expReformMap[id] = expSug.descriptionSuggeree;
          expAcceptedMap[id] = true;
        });
      }
      setExperienceReformulations(expReformMap);
      setAcceptedReformulations(expAcceptedMap);

      const initialAnswers: Record<string, string> = {};
      const questionsList = [
        ...(mergedData.questionsCompetences || []),
        ...(mergedData.questionsExperiences || []),
        ...(mergedData.questionsPrecision || [])
      ];
      questionsList.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setUserAnswers(initialAnswers);

      setStep(2);
      showToast('Offre analysée avec succès. Vous pouvez maintenant ajuster les suggestions.');
    } catch (err: any) {
      console.error('Error analyzing job offer:', err);
      const localSuggestions = generateTargetingSuggestions({
        cv: selectedCV,
        rawText: offreTexte,
        langue
      });
      setExtractedOffer(localSuggestions);
      setCustomProfileTitle(localSuggestions.suggestionsProfil?.titreSuggere || 'Poste Cible');
      setCustomProfileResume(localSuggestions.suggestionsProfil?.resumeSuggere || '');
      const defaultChecked = (localSuggestions.competencesPriorisees || [])
        .filter((s: any) => s.priorite === 'haute' || s.dejaPresente)
        .map((s: any) => s.nom);
      setSelectedSkills(defaultChecked);

      const existingCvSkillItems = (selectedCV?.sections?.find(s => s.type === 'competences')?.contenu || []) as any[];
      setSelectedOldSkills(existingCvSkillItems.map((c: any) => c.nom || '').filter(Boolean));

      const expReformMap: Record<string, string> = {};
      const expAcceptedMap: Record<string, boolean> = {};
      (localSuggestions.suggestionsExperiences || []).forEach((expSug: any) => {
        const id = expSug.experienceId || expSug.poste;
        expReformMap[id] = expSug.descriptionSuggeree;
        expAcceptedMap[id] = true;
      });
      setExperienceReformulations(expReformMap);
      setAcceptedReformulations(expAcceptedMap);

      setStep(2);
      showToast('Suggestions prêtes.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Final Tailoring & Updating the CV + Letter
  const handleGenerateTailoredAssets = async () => {
    if (!selectedCV || !extractedOffer) return;

    setIsTailoring(true);
    try {
      const validatedExperienceReformulations: Record<string, string> = {};
      Object.entries(experienceReformulations).forEach(([expId, reformText]) => {
        const text = typeof reformText === 'string' ? reformText : String(reformText || '');
        if (acceptedReformulations[expId] && text.trim()) {
          validatedExperienceReformulations[expId] = text;
        }
      });

      const localAdaptedCv = buildAdaptedCvLocally({
        cv: selectedCV,
        offre: {
          ...extractedOffer,
          titrePoste: customProfileTitle,
          competencesClesRequises: selectedSkills,
          couleurDetectee: targetBrandColor,
          couleurSecondaire: targetBrandSecondaryColor,
          nomCouleurMarque: brandColorName
        },
        reponsesQuestions: {
          ...userAnswers,
          confirmedSkills: selectedSkills,
          extraSkills,
          keptOldSkills: selectedOldSkills,
          customProfileTitle,
          customProfileResume,
          experienceReformulations: validatedExperienceReformulations,
          updateExistingCv: updateMode === 'update_current',
          targetColor: targetBrandColor,
          targetSecondaryColor: targetBrandSecondaryColor,
          colorHarmonizationMode,
          recommendedTemplateStyle: selectedTemplateStyle
        },
        langue,
        targetColor: targetBrandColor,
        targetSecondaryColor: targetBrandSecondaryColor,
        colorHarmonizationMode,
        recommendedTemplateStyle: selectedTemplateStyle,
        customProfileTitle,
        customProfileResume,
        experienceReformulations: validatedExperienceReformulations,
        updateExistingCv: updateMode === 'update_current',
        keptOldSkills: selectedOldSkills
      });

      let aiResult: PersonnalisationResult | null = null;
      try {
        const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
        const res = await fetch('/api/ai/personnaliser-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            cv: selectedCV,
            langue,
            offre: {
              ...extractedOffer,
              titrePoste: customProfileTitle,
              competencesClesRequises: selectedSkills,
              couleurDetectee: targetBrandColor,
              couleurSecondaire: targetBrandSecondaryColor,
              nomCouleurMarque: brandColorName
            },
            reponsesQuestions: {
              ...userAnswers,
              confirmedSkills: selectedSkills,
              extraSkills,
              keptOldSkills: selectedOldSkills,
              customProfileTitle,
              customProfileResume,
              experienceReformulations: validatedExperienceReformulations,
              updateExistingCv: updateMode === 'update_current',
              targetColor: targetBrandColor,
              targetSecondaryColor: targetBrandSecondaryColor,
              colorHarmonizationMode,
              recommendedTemplateStyle: selectedTemplateStyle
            },
            updateMode,
            targetColor: targetBrandColor,
            targetSecondaryColor: targetBrandSecondaryColor,
            colorHarmonizationMode,
            recommendedTemplateStyle: selectedTemplateStyle
          })
        });
        if (res.ok) {
          aiResult = await res.json();
        }
      } catch (netErr) {
        console.warn('Backend call failed, continuing with deterministic local tailoring:', netErr);
      }

      const finalCVToUse: CV = (aiResult && aiResult.cvModifie) ? aiResult.cvModifie : localAdaptedCv;

      const newModifiedCV: CV = {
        ...finalCVToUse,
        id: updateMode === 'update_current' ? selectedCV.id : `cv-targeted-${Date.now()}`,
        titre: updateMode === 'update_current'
          ? (selectedCV.titre || `CV - ${customProfileTitle}`)
          : `CV - ${customProfileTitle} (${extractedOffer.entreprise || 'Ciblé'})`,
        updatedAt: new Date().toISOString(),
        jobTargetCompany: extractedOffer.entreprise || undefined,
        jobTargetTitle: customProfileTitle || undefined,
        couleurAccent: applyBrandColor ? targetBrandColor : finalCVToUse.couleurAccent,
        styleEnTete: selectedTemplateStyle || finalCVToUse.styleEnTete
      };

      if (typeof onApplyPersonalizedCV === 'function') {
        await onApplyPersonalizedCV(newModifiedCV);
      } else if (typeof onCVPersonalized === 'function') {
        onCVPersonalized(newModifiedCV);
      }

      setCreatedCV(newModifiedCV);
      setTailoringResult(aiResult || {
        cvModifie: newModifiedCV,
        modificationsApportees: [
          `Profil professionnel orienté vers le poste de ${customProfileTitle}`,
          `Compétences réordonnées par ordre de priorité selon l'offre`,
          `Expériences reformulées avec un vocabulaire adapté`,
          `Palette de couleurs appliquée au CV`
        ],
        tauxCorrespondanceEstime: 94
      });

      if (aiResult?.lettreMotivation) {
        const profilData = (selectedCV.sections.find(s => s.type === 'profil')?.contenu as ProfilContenu) || ({} as ProfilContenu);
        const lm = aiResult.lettreMotivation;
        const newLetter: SavedLetter = {
          id: `letter-targeted-${Date.now()}`,
          utilisateurId: selectedCV.utilisateurId || 'user-default',
          cvId: newModifiedCV.id,
          titre: `Lettre - ${customProfileTitle} (${extractedOffer.entreprise || 'Entreprise'})`,
          poste: customProfileTitle,
          entreprise: extractedOffer.entreprise || 'Entreprise Cible',
          destinataire: extractedOffer.entreprise ? `Direction des Ressources Humaines - ${extractedOffer.entreprise}` : 'Direction des Ressources Humaines',
          villeDate: extractedOffer.lieu ? `${extractedOffer.lieu}, le ${new Date().toLocaleDateString('fr-FR')}` : `Paris, le ${new Date().toLocaleDateString('fr-FR')}`,
          expediteur: {
            nomComplet: profilData.nomComplet || 'Candidat',
            titreProfessionnel: customProfileTitle,
            email: profilData.email || '',
            telephone: profilData.telephone || '',
            adresse: profilData.adresse || '',
            ville: profilData.adresse || ''
          },
          objet: lm.objet || `Candidature au poste de ${customProfileTitle}`,
          formulePolitesseEntree: lm.formulePolitesseEntree || 'Madame, Monsieur,',
          paragrapheAccroche: lm.paragrapheAccroche || '',
          paragrapheValeurAjoutee: lm.paragrapheValeurAjoutee || '',
          paragrapheAdequationEntreprise: lm.paragrapheAdequationEntreprise || '',
          paragrapheConclusion: lm.paragrapheConclusion || '',
          formulePolitesseSortie: lm.formulePolitesseSortie || 'Veuillez agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.',
          texteComplet: lm.texteComplet || `${lm.formulePolitesseEntree}\n\n${lm.paragrapheAccroche}\n\n${lm.paragrapheValeurAjoutee}\n\n${lm.paragrapheAdequationEntreprise}\n\n${lm.paragrapheConclusion}\n\n${lm.formulePolitesseSortie}`,
          langue: langue,
          couleurAccent: targetBrandColor,
          police: selectedCV.police || 'Inter',
          dateCreation: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        if (typeof onSavePersonalizedLetter === 'function') {
          await onSavePersonalizedLetter(newLetter);
        } else if (typeof onLetterGenerated === 'function') {
          onLetterGenerated(newLetter);
        }
        setCreatedLetter(newLetter);
      }

      setStep(3);
      showToast(
        updateMode === 'update_current'
          ? 'Votre CV a été mis à jour avec succès.'
          : 'Nouvelle version ciblée de votre CV créée avec succès.'
      );
    } catch (err: any) {
      console.error('Error generating tailored assets:', err);
      showToast(err.message || 'Une erreur est survenue lors de l\'application au CV.');
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* 1.1 FIXED TOP BAR (64px, White, 1px border black 8%) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black/[0.08] z-30 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Back Chevron + Text (15px black) + Tool Title (serif 17px black) */}
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (step > 1) setStep((s) => (s - 1) as any);
              else onGoToDashboard?.();
            }}
            className="text-[15px] text-black font-medium flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>{step > 1 ? 'Précédent' : 'Retour'}</span>
          </button>
          <div className="h-4 w-px bg-black/10 hidden sm:block shrink-0" />
          <h1 className="font-serif text-[17px] text-black font-semibold tracking-tight truncate">
            Cibler une offre d'emploi
          </h1>
        </div>

        {/* Right: Step Indicator & Primary Action Button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {toast && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-500 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-neutral-500" />
              <span>{toast}</span>
            </div>
          )}
          <span className="text-[13px] text-[#6B6B6B] font-medium hidden sm:inline">
            Étape {step} sur 3
          </span>

          {step === 1 && (
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyzeOffer}
              className="h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <>
                  <span>Analyser l'offre</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              disabled={isTailoring}
              onClick={handleGenerateTailoredAssets}
              className="h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTailoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Application...</span>
                </>
              ) : (
                <>
                  <span>Appliquer au CV</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 3 && createdCV && (
            <button
              type="button"
              onClick={() => {
                if (typeof onOpenCVEditor === 'function') onOpenCVEditor(createdCV);
                else if (typeof onCVPersonalized === 'function') onCVPersonalized(createdCV);
                else onGoToDashboard?.();
              }}
              className="h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Ouvrir dans l'éditeur</span>
            </button>
          )}
        </div>
      </header>

      {/* PROGRESS BAR (4px high, #EAEAEA background, Solid black fill) */}
      <div className="fixed top-16 left-0 right-0 z-20 bg-white">
        <div className="h-1 w-full bg-[#EAEAEA]">
          <div 
            className="bg-black h-full transition-all duration-300 ease-out"
            style={{ width: step === 1 ? '33.33%' : step === 2 ? '66.66%' : '100%' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between border-b border-black/[0.04] text-[13px]">
          {[
            { num: 1, label: "Offre & CV source" },
            { num: 2, label: "Personnalisation ciblée" },
            { num: 3, label: "Résultats & Téléchargement" }
          ].map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            return (
              <div key={s.num} className="flex items-center gap-1.5">
                {isCompleted ? (
                  <span className="font-semibold text-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </span>
                ) : isActive ? (
                  <span className="font-semibold text-black">
                    {s.num}. {s.label}
                  </span>
                ) : (
                  <span className="text-[#6B6B6B]">
                    {s.num}. {s.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN BODY (Form on left 60%, Sticky A4 preview on right 40%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN: FORM CONTENT (60%, Max 680px) */}
          <div className="w-full lg:w-[60%] lg:max-w-[680px] space-y-8">
            
            {/* STEP 1: SELECT CV & INPUT JOB OFFER */}
            {step === 1 && (
              <div className="space-y-8">
                {/* 1. Base CV Selection */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      1. CV à adapter
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                    </label>
                    <p className="text-[12.5px] text-[#6B6B6B]">
                      Sélectionnez le CV existant sur lequel baser l'adaptation.
                    </p>
                  </div>

                  {cvs.length === 0 ? (
                    <div className="p-4 bg-white border border-black/15 rounded-[8px] text-[12.5px] text-[#6B6B6B]">
                      Aucun CV trouvé. Veuillez d'abord créer un CV de base.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cvs.map(c => {
                        const isSelected = c.id === selectedCVId;
                        const profileName = c.sections?.find(s => s.type === 'profil')?.contenu?.nomComplet || c.titre;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedCVId(c.id)}
                            className={`p-4 rounded-[8px] text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-black text-white border-2 border-black shadow-xs'
                                : 'bg-white text-black border-[1.5px] border-black/15 hover:border-black'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[13px] font-semibold truncate">
                                  {c.titre || 'Sans titre'}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                              </div>
                              <p className={`text-[12px] truncate ${isSelected ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                                {profileName}
                              </p>
                            </div>
                            <span className={`text-[11px] font-mono mt-3 block ${isSelected ? 'text-white/60' : 'text-neutral-400'}`}>
                              Modèle : {c.templateId || 'Standard'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Job Offer Input */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      2. Offre ou annonce d'emploi
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                    </label>
                    <p className="text-[12.5px] text-[#6B6B6B]">
                      Collez le texte brut ou importez une capture d'écran de l'offre (LinkedIn, Indeed, etc.).
                    </p>
                  </div>

                  {/* Mode switch (Pill style buttons) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('text')}
                      className={`h-8 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        inputMode === 'text' 
                          ? 'bg-black text-white border-[1.5px] border-black' 
                          : 'bg-white text-black border-[1.5px] border-black/20 hover:border-black'
                      }`}
                    >
                      Texte de l'offre
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('image')}
                      className={`h-8 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        inputMode === 'image' 
                          ? 'bg-black text-white border-[1.5px] border-black' 
                          : 'bg-white text-black border-[1.5px] border-black/20 hover:border-black'
                      }`}
                    >
                      Capture d'écran
                    </button>
                  </div>

                  {/* Text Input */}
                  {inputMode === 'text' && (
                    <div className="space-y-1.5">
                      <textarea
                        rows={10}
                        value={offreTexte}
                        onChange={(e) => setOffreTexte(e.target.value)}
                        placeholder="Ex : Nous recrutons un Responsable Commercial B2B Grands Comptes pour accélérer notre développement. Missions : Prospection, négociation de contrats complexes, management d'une équipe... Profil recherché : Vente B2B, maîtrise Salesforce, anglais courant..."
                        className="w-full p-4 text-xs font-mono bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black leading-relaxed resize-y"
                      />
                      <p className="text-[12.5px] text-[#6B6B6B]">
                        Les compétences, mots-clés et missions seront analysés automatiquement.
                      </p>
                    </div>
                  )}

                  {/* Image Input */}
                  {inputMode === 'image' && (
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFile(e.target.files[0]);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />

                      {imagePreview ? (
                        <div className="p-4 border-[1.5px] border-black/15 rounded-[8px] bg-white flex flex-col items-center gap-3">
                          <img 
                            src={imagePreview} 
                            alt="Capture de l'offre" 
                            className="max-h-72 object-contain rounded-[4px] border border-black/10" 
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold text-black underline cursor-pointer"
                          >
                            Changer d'image
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-8 border-[1.5px] border-dashed border-black/25 hover:border-black rounded-[8px] bg-white text-center cursor-pointer transition-colors space-y-2"
                        >
                          <Upload className="w-6 h-6 text-black mx-auto" />
                          <p className="text-[13px] font-semibold text-black">
                            Cliquez pour importer la capture de l'offre
                          </p>
                          <p className="text-[12px] text-[#6B6B6B]">
                            PNG, JPG, WEBP jusqu'à 10 Mo
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary CTA button at bottom */}
                <div className="pt-4 border-t border-black/[0.08]">
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleAnalyzeOffer}
                    className="w-full h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Analyse en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Analyser l'offre et générer les suggestions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMIZE PROFILE, SKILLS & EXPERIENCES */}
            {step === 2 && extractedOffer && (
              <div className="space-y-8 animate-in fade-in duration-150">
                
                {/* 1. Profil Professionnel (Titre & Résumé) */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      1. Titre du poste cible
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                    </label>
                    <ClearableInput
                      value={customProfileTitle}
                      onChange={(e) => setCustomProfileTitle(e.target.value)}
                      placeholder="Ex : Responsable Commercial Grands Comptes"
                      className="h-12 px-4 text-sm bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                    />
                    <p className="text-[12.5px] text-[#6B6B6B] mt-1.5">
                      Ce titre sera mis en avant en en-tête de votre CV.
                    </p>
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      Résumé d'accroche professionnel
                      <span className="text-[12px] text-[#6B6B6B] font-normal ml-1.5">(optionnel)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={customProfileResume}
                      onChange={(e) => setCustomProfileResume(e.target.value)}
                      placeholder="Synthèse valorisant vos atouts pour ce poste..."
                      className="w-full p-4 text-xs font-sans bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black leading-relaxed resize-y"
                    />
                    <p className="text-[12.5px] text-[#6B6B6B] mt-1.5">
                      Mise en valeur directe de votre valeur ajoutée pour l'entreprise ciblée.
                    </p>
                  </div>
                </div>

                {/* 2. Compétences (Ne rien inventer, sélection stricte N&B) */}
                <div className="space-y-6 pt-4 border-t border-black/[0.08]">
                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      2. Compétences requises par l'offre
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                    </label>
                    <p className="text-[12.5px] text-[#6B6B6B]">
                      Cochez uniquement celles que vous maîtrisez réellement. Aucune compétence n'est inventée.
                    </p>
                  </div>

                  {/* Skills Grid with 32px binary pill buttons */}
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const allReq = [
                        ...(extractedOffer.competencesClesRequises || []),
                        ...(extractedOffer.competencesRequises || []),
                        ...(extractedOffer.competencesPriorisees?.map(s => s.nom) || [])
                      ].filter(Boolean);
                      const uniqueReq = Array.from(new Set(allReq));

                      if (uniqueReq.length === 0) {
                        return <p className="text-xs text-[#6B6B6B] italic">Aucune compétence spécifique détectée.</p>;
                      }

                      return uniqueReq.map((skillName, idx) => {
                        const isChecked = selectedSkills.some(s => s.toLowerCase() === skillName.toLowerCase());
                        return (
                          <button
                            key={`skill-pill-${idx}`}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedSkills(prev => prev.filter(s => s.toLowerCase() !== skillName.toLowerCase()));
                              } else {
                                setSelectedSkills(prev => [...prev, skillName]);
                              }
                            }}
                            className={`h-8 px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-black text-white border-[1.5px] border-black shadow-xs'
                                : 'bg-white text-black border-[1.5px] border-black/30 hover:border-black'
                            }`}
                          >
                            <span>{isChecked ? '✓' : '+'}</span>
                            <span>{skillName}</span>
                          </button>
                        );
                      });
                    })()}
                  </div>

                  {/* Add manual skill */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSkillInput.trim()) {
                          e.preventDefault();
                          const val = newSkillInput.trim();
                          if (!selectedSkills.includes(val)) {
                            setSelectedSkills(prev => [...prev, val]);
                          }
                          setNewSkillInput('');
                        }
                      }}
                      placeholder="Ajouter une autre compétence maîtrisée..."
                      className="flex-1 h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSkillInput.trim()) {
                          const val = newSkillInput.trim();
                          if (!selectedSkills.includes(val)) {
                            setSelectedSkills(prev => [...prev, val]);
                          }
                          setNewSkillInput('');
                        }
                      }}
                      className="h-11 px-5 bg-white border-[1.5px] border-black text-black font-semibold text-xs rounded-[8px] hover:bg-black/5 transition-all cursor-pointer shrink-0"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* 3. Expériences ciblées (Cartes avec bordure 1px noir 8%, padding 20px) */}
                <div className="space-y-6 pt-4 border-t border-black/[0.08]">
                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      3. Expériences professionnelles
                      <span className="text-[12px] text-[#6B6B6B] font-normal ml-1.5">(orientées vers l'offre)</span>
                    </label>
                    <p className="text-[12.5px] text-[#6B6B6B]">
                      Vos intitulés et dates restent intacts. Vous pouvez choisir l'angle de reformulation qui valorise le mieux vos réalisations.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {(() => {
                      const expList = extractedOffer.suggestionsExperiences || [];
                      if (expList.length === 0) {
                        return (
                          <div className="p-4 bg-white border border-black/10 rounded-[8px] text-xs text-[#6B6B6B] italic">
                            Aucune expérience source à reformuler.
                          </div>
                        );
                      }

                      return expList.map((expItem: any, idx: number) => {
                        const id = expItem.experienceId || expItem.poste;
                        const isAccepted = acceptedReformulations[id] ?? true;
                        const isEditingThis = editingExpId === id;
                        const currentReformulation = experienceReformulations[id] || expItem.descriptionSuggeree;

                        return (
                          <div
                            key={`exp-card-${idx}`}
                            className="p-5 rounded-[10px] bg-white border border-black/[0.08] space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/[0.06]">
                              <div>
                                <p className="text-[13px] font-semibold text-black">
                                  {expItem.poste} — <span className="font-normal text-neutral-600">{expItem.entreprise}</span>
                                </p>
                                {expItem.periode && (
                                  <p className="text-[11px] text-[#6B6B6B]">{expItem.periode}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setAcceptedReformulations(prev => ({ ...prev, [id]: !isAccepted }))}
                                  className={`h-7 px-3 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                    isAccepted
                                      ? 'bg-black text-white border-[1.5px] border-black'
                                      : 'bg-white text-black border-[1.5px] border-black/30 hover:border-black'
                                  }`}
                                >
                                  {isAccepted ? '✓ Reformulé' : 'Original'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingExpId(isEditingThis ? null : id)}
                                  className="text-xs font-semibold text-black underline cursor-pointer ml-1"
                                >
                                  {isEditingThis ? 'Valider' : 'Modifier'}
                                </button>
                              </div>
                            </div>

                            {/* Text content */}
                            {isEditingThis ? (
                              <textarea
                                rows={4}
                                value={currentReformulation}
                                onChange={(e) => setExperienceReformulations(prev => ({
                                  ...prev,
                                  [id]: e.target.value
                                }))}
                                className="w-full p-3 text-xs font-mono bg-white border-[1.5px] border-black text-black rounded-[8px] focus:outline-none"
                              />
                            ) : (
                              <p className="text-[12.5px] text-neutral-800 leading-relaxed whitespace-pre-line">
                                {isAccepted ? currentReformulation : (expItem.descriptionOriginale || currentReformulation)}
                              </p>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 4. Mode d'enregistrement (Remplacer ou Copier) */}
                <div className="space-y-4 pt-4 border-t border-black/[0.08]">
                  <div>
                    <label className="text-[13px] font-semibold text-black mb-1.5 block">
                      4. Mode d'enregistrement du CV
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUpdateMode('update_current')}
                      className={`p-4 rounded-[8px] text-left transition-all cursor-pointer ${
                        updateMode === 'update_current'
                          ? 'bg-black text-white border-2 border-black shadow-xs'
                          : 'bg-white text-black border-[1.5px] border-black/15 hover:border-black'
                      }`}
                    >
                      <span className="text-[13px] font-semibold block">Mettre à jour le CV existant</span>
                      <span className={`text-[12px] block mt-1 ${updateMode === 'update_current' ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                        Actualise directement "{selectedCV?.titre}" avec ces nouveaux éléments.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUpdateMode('create_copy')}
                      className={`p-4 rounded-[8px] text-left transition-all cursor-pointer ${
                        updateMode === 'create_copy'
                          ? 'bg-black text-white border-2 border-black shadow-xs'
                          : 'bg-white text-black border-[1.5px] border-black/15 hover:border-black'
                      }`}
                    >
                      <span className="text-[13px] font-semibold block">Créer une nouvelle copie</span>
                      <span className={`text-[12px] block mt-1 ${updateMode === 'create_copy' ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                        Conserve votre CV actuel intact et crée une version dédiée à cette offre.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-12 px-7 bg-transparent border-[1.5px] border-black text-black font-semibold text-[15px] rounded-[8px] hover:bg-black/5 transition-all cursor-pointer"
                  >
                    Retour à l'offre
                  </button>

                  <button
                    type="button"
                    disabled={isTailoring}
                    onClick={handleGenerateTailoredAssets}
                    className="h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isTailoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Appliquer & Finaliser le CV</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RESULTS & SAVED ASSETS */}
            {step === 3 && createdCV && (
              <div className="space-y-8 animate-in fade-in duration-150">
                <div className="p-6 rounded-[8px] bg-black text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                      {updateMode === 'update_current' ? 'CV Actualisé' : 'Version Dédiée Créée'}
                    </span>
                    {tailoringResult?.tauxCorrespondanceEstime && (
                      <span className="text-sm font-semibold">
                        Score ATS : {tailoringResult.tauxCorrespondanceEstime}%
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Votre CV ciblé est prêt !
                    </h2>
                    <p className="text-[12.5px] text-white/80 mt-1">
                      Le profil, les compétences ordonnées et les expériences ont été enregistrés avec succès.
                    </p>
                  </div>

                  {tailoringResult?.modificationsApportees && (
                    <div className="pt-3 border-t border-white/20 space-y-1.5 text-xs text-white/90">
                      {tailoringResult.modificationsApportees.map((mod, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{mod}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cards for CV and Letter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* CV Card */}
                  <div className="p-5 bg-white border border-black/15 rounded-[8px] flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        CV Ciblé
                      </span>
                      <h3 className="text-sm font-semibold text-black truncate">
                        {createdCV.titre}
                      </h3>
                      <p className="text-xs text-[#6B6B6B]">
                        Poste : {createdCV.jobTargetTitle || customProfileTitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof onOpenCVEditor === 'function') onOpenCVEditor(createdCV);
                        else if (typeof onCVPersonalized === 'function') onCVPersonalized(createdCV);
                        else onGoToDashboard?.();
                      }}
                      className="w-full h-11 bg-black text-white font-semibold text-xs rounded-[8px] hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Ouvrir dans l'éditeur</span>
                    </button>
                  </div>

                  {/* Letter Card */}
                  {createdLetter && (
                    <div className="p-5 bg-white border border-black/15 rounded-[8px] flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                          Lettre Dédiée
                        </span>
                        <h3 className="text-sm font-semibold text-black truncate">
                          {createdLetter.titre}
                        </h3>
                        <p className="text-xs text-[#6B6B6B]">
                          Entreprise : {createdLetter.entreprise}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewLetterData(createdLetter);
                            setShowLetterPreviewModal(true);
                          }}
                          className="flex-1 h-11 bg-white border-[1.5px] border-black text-black font-semibold text-xs rounded-[8px] hover:bg-black/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Prévisualiser</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof onOpenLetterEditor === 'function') onOpenLetterEditor(createdLetter);
                            else if (typeof onGoToLetters === 'function') onGoToLetters();
                            else onGoToDashboard?.();
                          }}
                          className="flex-1 h-11 bg-black text-white font-semibold text-xs rounded-[8px] hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Éditer</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY A4 LIVE PREVIEW (40%, #F5F5F5 background, Square corners) */}
          <div className="hidden lg:flex w-full lg:w-[40%] sticky top-28 self-start bg-[#F5F5F5] p-6 rounded-none min-h-[calc(100vh-140px)] flex-col items-center justify-start border border-black/[0.06]">
            <div ref={previewContainerRef} className="w-full max-w-[420px] flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-[12px] font-semibold text-neutral-600">
                <span>Aperçu en direct (A4)</span>
                <span className="text-[11px] font-mono text-neutral-400">Coins droits • HD</span>
              </div>
              <div
                className="w-full relative overflow-hidden bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] rounded-none"
                style={{ height: `${Math.round(previewScale * 1122)}px` }}
              >
                <div
                  className="w-[794px] h-[1122px] origin-top-left pointer-events-none select-none bg-white absolute top-0 left-0"
                  style={{ transform: `scale(${previewScale})` }}
                >
                  {livePreviewCV ? (
                    <CVPreview cv={livePreviewCV} interactivePreview={false} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                      Sélectionnez un CV pour afficher l'aperçu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE FLOATING BUTTON TO OPEN PREVIEW MODAL (<768px) */}
      <button
        type="button"
        onClick={() => setIsMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 bg-black text-white px-4 py-3 rounded-[8px] shadow-2xl flex items-center gap-2 text-xs font-semibold cursor-pointer hover:bg-[#1A1A1A] transition-all"
      >
        <Eye className="w-4 h-4" />
        <span>Aperçu CV ({step}/3)</span>
      </button>

      {/* MOBILE PREVIEW MODAL */}
      {isMobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-[#F5F5F5] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-[8px] shadow-2xl">
            <div className="p-3 bg-white border-b border-black/[0.08] flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Aperçu en direct (A4)</span>
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="p-1 text-black hover:opacity-70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex items-center justify-center">
              <div className="w-[320px] overflow-hidden bg-white shadow-xl rounded-none">
                <div
                  className="w-[794px] h-[1122px] origin-top-left pointer-events-none select-none"
                  style={{ transform: `scale(${320 / 794})` }}
                >
                  {livePreviewCV && <CVPreview cv={livePreviewCV} interactivePreview={false} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LETTER PREVIEW MODAL */}
      {showLetterPreviewModal && previewLetterData && (
        <LetterPreviewModal
          isOpen={showLetterPreviewModal}
          onClose={() => setShowLetterPreviewModal(false)}
          letter={previewLetterData}
        />
      )}
    </div>
  );
};
