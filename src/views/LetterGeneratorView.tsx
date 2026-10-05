import React, { useState, useEffect, useRef } from 'react';
import { CV, Language, SavedLetter, LettreMotivationResult, SubscriptionTier } from '../types';
import { 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Printer, 
  Copy, 
  RefreshCw, 
  Building, 
  Briefcase, 
  Download, 
  Eye, 
  ChevronDown,
  FileType,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { LetterPreviewModal } from '../components/LetterPreviewModal';
import { 
  exportLetterToPDF, 
  exportLetterToWord, 
  exportLetterToPlainText, 
  printLetterDocument 
} from '../utils/pdfExport';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { ClearableInput } from '../components/ClearableInput';

interface LetterGeneratorViewProps {
  cvs: CV[];
  activeCV: CV | null;
  langue: Language;
  initialLetter?: SavedLetter | null;
  letterToEdit?: SavedLetter | null;
  userTier?: SubscriptionTier;
  onSaveLetter?: (letter: SavedLetter) => Promise<void> | void;
  onLetterSaved?: () => void;
  onBackToLetters?: () => void;
  onGoToLettersDashboard?: () => void;
  onGoToDashboard?: () => void;
  onOpenUpgrade?: () => void;
  onOpenPayment?: () => void;
}

export const LetterGeneratorView: React.FC<LetterGeneratorViewProps> = ({
  cvs,
  activeCV,
  langue,
  initialLetter,
  letterToEdit,
  userTier = 'freemium',
  onSaveLetter,
  onLetterSaved,
  onBackToLetters,
  onGoToLettersDashboard,
  onGoToDashboard,
  onOpenUpgrade,
  onOpenPayment
}) => {
  const currentLetterSource = initialLetter || letterToEdit || null;

  // Source CV selection
  const [selectedCVId, setSelectedCVId] = useState<string>(
    currentLetterSource?.cvId || activeCV?.id || (cvs.length > 0 ? cvs[0].id : '')
  );
  const selectedCV = cvs.find(c => c.id === selectedCVId) || activeCV || cvs[0] || null;

  const profilSection = selectedCV?.sections?.find(s => s.type === 'profil');
  const profilContent = profilSection?.contenu || {};

  // Form parameters
  const [entreprise, setEntreprise] = useState(currentLetterSource?.entreprise || '');
  const [poste, setPoste] = useState(currentLetterSource?.poste || profilContent.titreProfessionnel || '');
  const [destinataire, setDestinataire] = useState(currentLetterSource?.destinataire || 'Direction des Ressources Humaines');
  const [ton, setTon] = useState('professionnel');
  const [pointsCles, setPointsCles] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Letter editable fields
  const [letterId, setLetterId] = useState<string>(currentLetterSource?.id || `lettre-${Date.now()}`);
  const [titreLettre, setTitreLettre] = useState<string>(
    currentLetterSource?.titre || `Lettre de motivation - ${entreprise || 'Candidature'}`
  );
  const [villeDate, setVilleDate] = useState<string>(
    currentLetterSource?.villeDate || `Fait le ${new Date().toLocaleDateString('fr-FR')}`
  );
  const [police, setPolice] = useState<string>(currentLetterSource?.police || 'Inter');
  const [taillePolice, setTaillePolice] = useState<number>(currentLetterSource?.taillePolice || 11);
  const [couleurAccent, setCouleurAccent] = useState<string>(currentLetterSource?.couleurAccent || '#111827');

  // Sender details
  const [expediteurNom, setExpediteurNom] = useState(currentLetterSource?.expediteur?.nomComplet || profilContent.nomComplet || 'Mon Nom');
  const [expediteurTitre, setExpediteurTitre] = useState(currentLetterSource?.expediteur?.titreProfessionnel || profilContent.titreProfessionnel || '');
  const [expediteurEmail, setExpediteurEmail] = useState(currentLetterSource?.expediteur?.email || profilContent.email || '');
  const [expediteurTel, setExpediteurTel] = useState(currentLetterSource?.expediteur?.telephone || profilContent.telephone || '');
  const [expediteurAdresse, setExpediteurAdresse] = useState(currentLetterSource?.expediteur?.adresse || profilContent.adresse || '');

  // Body content
  const [objet, setObjet] = useState(currentLetterSource?.objet || `Candidature au poste de ${poste || 'Professionnel'}`);
  const [formuleEntree, setFormuleEntree] = useState(currentLetterSource?.formulePolitesseEntree || 'Madame, Monsieur,');
  const [accroche, setAccroche] = useState(currentLetterSource?.paragrapheAccroche || '');
  const [valeurAjoutee, setValeurAjoutee] = useState(currentLetterSource?.paragrapheValeurAjoutee || '');
  const [adequation, setAdequation] = useState(currentLetterSource?.paragrapheAdequationEntreprise || '');
  const [conclusion, setConclusion] = useState(currentLetterSource?.paragrapheConclusion || '');
  const [formuleSortie, setFormuleSortie] = useState(currentLetterSource?.formulePolitesseSortie || 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.');
  const [signature, setSignature] = useState(currentLetterSource?.signature || expediteurNom);

  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(Boolean(currentLetterSource));
  const [optimizingParagraph, setOptimizingParagraph] = useState<string | null>(null);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getCurrentLetterObject = (): SavedLetter => {
    const fullText = `${formuleEntree}\n\n${accroche}\n\n${valeurAjoutee}\n\n${adequation}\n\n${conclusion}\n\n${formuleSortie}`;
    return {
      id: letterId,
      utilisateurId: selectedCV?.utilisateurId || 'user-default',
      cvId: selectedCV?.id || 'cv-default',
      titre: titreLettre,
      poste,
      entreprise,
      destinataire,
      villeDate,
      expediteur: {
        nomComplet: expediteurNom,
        titreProfessionnel: expediteurTitre,
        email: expediteurEmail,
        telephone: expediteurTel,
        adresse: expediteurAdresse,
        ville: expediteurAdresse
      },
      objet,
      formulePolitesseEntree: formuleEntree,
      paragrapheAccroche: accroche,
      paragrapheValeurAjoutee: valeurAjoutee,
      paragrapheAdequationEntreprise: adequation,
      paragrapheConclusion: conclusion,
      formulePolitesseSortie: formuleSortie,
      signature: signature || expediteurNom,
      texteComplet: fullText,
      langue,
      couleurAccent,
      police,
      taillePolice,
      dateCreation: currentLetterSource?.dateCreation || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const letterObj = getCurrentLetterObject();
      if (typeof onSaveLetter === 'function') {
        await onSaveLetter(letterObj);
      } else {
        const stored = localStorage.getItem('cv_builder_letters');
        const list: SavedLetter[] = stored ? JSON.parse(stored) : [];
        const existingIdx = list.findIndex(l => l.id === letterObj.id);
        if (existingIdx >= 0) {
          list[existingIdx] = letterObj;
        } else {
          list.unshift(letterObj);
        }
        localStorage.setItem('cv_builder_letters', JSON.stringify(list));
      }
      setIsSaved(true);
      showToast('Lettre de motivation enregistrée.');
      if (typeof onLetterSaved === 'function') onLetterSaved();
    } catch (err: any) {
      console.error('Error saving letter:', err);
      showToast('Erreur lors de l\'enregistrement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateFullLetter = async () => {
    if (!selectedCV) {
      showToast('Veuillez sélectionner un CV source.');
      return;
    }
    if (!poste.trim()) {
      showToast('Veuillez préciser l\'intitulé du poste ciblé.');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/lettre-motivation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cv: selectedCV,
          poste,
          entreprise,
          ton,
          pointsCles,
          destinataire,
          langue
        })
      });

      if (res.ok) {
        const data: LettreMotivationResult = await res.json();
        if (data.objet) setObjet(data.objet);
        if (data.formulePolitesseEntree) setFormuleEntree(data.formulePolitesseEntree);
        if (data.paragrapheAccroche) setAccroche(data.paragrapheAccroche);
        if (data.paragrapheValeurAjoutee) setValeurAjoutee(data.paragrapheValeurAjoutee);
        if (data.paragrapheAdequationEntreprise) setAdequation(data.paragrapheAdequationEntreprise);
        if (data.paragrapheConclusion) setConclusion(data.paragrapheConclusion);
        if (data.formulePolitesseSortie) setFormuleSortie(data.formulePolitesseSortie);
        showToast('Lettre rédigée avec succès.');
        setIsSaved(false);
      } else {
        // Fallback local structured letter generator
        generateLocalFallbackLetter();
      }
    } catch (err) {
      console.warn('Network call failed, using high-quality local letter generator:', err);
      generateLocalFallbackLetter();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLocalFallbackLetter = () => {
    const experiences = selectedCV?.sections?.find(s => s.type === 'experience')?.contenu || [];
    const skills = selectedCV?.sections?.find(s => s.type === 'competences')?.contenu || [];
    const topExp = experiences[0] || {};
    const topSkillsList = skills.slice(0, 3).map((s: any) => s.nom).filter(Boolean).join(', ');

    setObjet(`Candidature au poste de ${poste}${entreprise ? ` - ${entreprise}` : ''}`);
    setFormuleEntree('Madame, Monsieur,');
    setAccroche(`Vivement intéressé(e) par les perspectives de développement offertes par ${entreprise || 'votre organisation'}, je vous présente ma candidature au poste de ${poste}. Fort(e) d'une solide expérience professionnelle, je souhaite mettre mes compétences au service de vos objectifs.`);
    setValeurAjoutee(`Dans le cadre de mon parcours${topExp.poste ? ` en tant que ${topExp.poste}` : ''}${topExp.entreprise ? ` chez ${topExp.entreprise}` : ''}, j'ai développé une solide expertise en gestion de projets et atteinte de résultats concrets.${topSkillsList ? ` Mes compétences clés incluent notamment : ${topSkillsList}.` : ''}`);
    setAdequation(`Votre dynamique et l'exigence de qualité portée par ${entreprise || 'votre équipe'} correspondent parfaitement à ma conception du métier. Je suis convaincu(e) que ma rigueur et mon autonomie me permettront d'être immédiatement opérationnel(le) et contributeur.`);
    setConclusion(`Je me tiens à votre entière disposition pour convenir d'un entretien au cours duquel je pourrai vous exposer plus en détail mes motivations et perspectives de collaboration.`);
    setFormuleSortie('Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.');
    showToast('Lettre personnalisée structurée.');
    setIsSaved(false);
  };

  const handleOptimizeParagraph = async (
    paragraphKey: 'accroche' | 'valeurAjoutee' | 'adequation' | 'conclusion',
    currentText: string,
    instruction: string
  ) => {
    setOptimizingParagraph(paragraphKey);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/reformuler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          texte: currentText,
          instruction: `${instruction}. Contexte du poste : ${poste} chez ${entreprise || 'l\'entreprise'}.`,
          langue
        })
      });

      if (res.ok) {
        const data = await res.json();
        const optimized = data.texteReformule || data.reformulation;
        if (optimized) {
          if (paragraphKey === 'accroche') setAccroche(optimized);
          if (paragraphKey === 'valeurAjoutee') setValeurAjoutee(optimized);
          if (paragraphKey === 'adequation') setAdequation(optimized);
          if (paragraphKey === 'conclusion') setConclusion(optimized);
          setIsSaved(false);
          showToast('Paragraphe optimisé.');
        }
      } else {
        showToast('Service temporairement indisponible.');
      }
    } catch (err) {
      showToast('Impossible de contacter le service d\'optimisation.');
    } finally {
      setOptimizingParagraph(null);
    }
  };

  const handleCopy = () => {
    const letter = getCurrentLetterObject();
    navigator.clipboard.writeText(letter.texteComplet);
    showToast('Texte de la lettre copié.');
  };

  const handleExportPDF = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const letterObj = getCurrentLetterObject();
      const res = await exportLetterToPDF(letterObj, titreLettre || 'Lettre_de_Motivation');
      if (res.success) {
        showToast('Lettre exportée en PDF.');
      } else {
        showToast(res.message || 'Erreur export PDF');
      }
    } catch (err: any) {
      showToast(`Erreur export PDF : ${err?.message || 'Erreur'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const letterObj = getCurrentLetterObject();
      const res = await exportLetterToWord(letterObj, titreLettre || 'Lettre_de_Motivation');
      if (res.success) {
        showToast('Fichier Word exporté.');
      } else {
        showToast(res.message || 'Erreur export Word');
      }
    } catch (err: any) {
      showToast(`Erreur export Word : ${err?.message || 'Erreur'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPlainText = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const letterObj = getCurrentLetterObject();
      const res = await exportLetterToPlainText(letterObj, titreLettre || 'Lettre_de_Motivation');
      if (res.success) {
        showToast('Fichier Texte (.txt) exporté.');
      } else {
        showToast(res.message || 'Erreur export texte');
      }
    } catch (err: any) {
      showToast(`Erreur export texte : ${err?.message || 'Erreur'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    const letterObj = getCurrentLetterObject();
    printLetterDocument(letterObj);
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
              if (onBackToLetters) onBackToLetters();
              else if (onGoToLettersDashboard) onGoToLettersDashboard();
              else if (onGoToDashboard) onGoToDashboard();
            }}
            className="text-[15px] text-black font-medium flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>Retour</span>
          </button>
          <div className="h-4 w-px bg-black/10 hidden sm:block shrink-0" />
          <h1 className="font-serif text-[17px] text-black font-semibold tracking-tight truncate">
            Lettre de motivation
          </h1>
        </div>

        {/* Right: Auto-save status, Export Dropdown, Primary Save Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Auto-save status */}
          <span className="text-[12px] text-neutral-400 font-medium hidden md:inline">
            {isSaved ? 'Enregistré' : 'Non enregistré'}
          </span>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="h-12 px-4 bg-transparent border-[1.5px] border-black text-black font-semibold text-xs rounded-[8px] hover:bg-black/5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-black/10 rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-1.5 z-40 space-y-1">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-black hover:bg-[#F0F0F0] rounded-[4px] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Document PDF (.pdf)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-black hover:bg-[#F0F0F0] rounded-[4px] flex items-center gap-2 cursor-pointer"
                >
                  <FileType className="w-3.5 h-3.5" />
                  <span>Document Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPlainText}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-black hover:bg-[#F0F0F0] rounded-[4px] flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Texte brut (.txt)</span>
                </button>
                <div className="border-t border-black/[0.08] my-1" />
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-black hover:bg-[#F0F0F0] rounded-[4px] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Save Button */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN TWO-COLUMN BODY (Form on left 60%, Sticky A4 preview on right 40%) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN: FORM CONTENT (60%, Max 680px) */}
          <div className="w-full lg:w-[60%] lg:max-w-[680px] space-y-8">
            
            {/* 1. Header Information Group */}
            <div className="space-y-6">
              <div>
                <label className="text-[13px] font-semibold text-black mb-1.5 block">
                  Titre de la lettre
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                </label>
                <ClearableInput
                  value={titreLettre}
                  onChange={(e) => { setTitreLettre(e.target.value); setIsSaved(false); }}
                  placeholder="Ex : Lettre de motivation - Commercial B2B"
                  className="h-12 px-4 text-sm bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-black mb-1.5 block">
                    Poste visé
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                  </label>
                  <ClearableInput
                    value={poste}
                    onChange={(e) => { setPoste(e.target.value); setIsSaved(false); }}
                    placeholder="Ex : Chef de Projet Digital"
                    className="h-12 px-4 text-sm bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-black mb-1.5 block">
                    Entreprise ciblée
                    <span className="text-[12px] text-[#6B6B6B] font-normal ml-1.5">(optionnel)</span>
                  </label>
                  <ClearableInput
                    value={entreprise}
                    onChange={(e) => { setEntreprise(e.target.value); setIsSaved(false); }}
                    placeholder="Ex : Groupe Dupont"
                    className="h-12 px-4 text-sm bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-black mb-1.5 block">
                    Destinataire
                    <span className="text-[12px] text-[#6B6B6B] font-normal ml-1.5">(optionnel)</span>
                  </label>
                  <ClearableInput
                    value={destinataire}
                    onChange={(e) => { setDestinataire(e.target.value); setIsSaved(false); }}
                    placeholder="Direction des Ressources Humaines"
                    className="h-12 px-4 text-sm bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-black mb-1.5 block">
                    Lieu & Date
                    <span className="text-[12px] text-[#6B6B6B] font-normal ml-1.5">(optionnel)</span>
                  </label>
                  <ClearableInput
                    value={villeDate}
                    onChange={(e) => { setVilleDate(e.target.value); setIsSaved(false); }}
                    placeholder="Fait à Paris, le 28/09/2026"
                    className="h-12 px-4 text-sm bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
              </div>
            </div>

            {/* AI Generation Trigger */}
            <div className="p-5 border border-black/15 rounded-[8px] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-black">
                  Génération guidée par intelligence artificielle
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  CV : {selectedCV?.titre || 'Standard'}
                </span>
              </div>
              <p className="text-[12.5px] text-[#6B6B6B]">
                Rédigez automatiquement une lettre complète et convaincante à partir de votre CV et du poste renseigné.
              </p>
              <button
                type="button"
                disabled={isGenerating || !poste.trim()}
                onClick={handleGenerateFullLetter}
                className="w-full h-11 bg-black text-white font-semibold text-xs rounded-[8px] hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Rédaction en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Rédiger la lettre complète</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Coordonnées de l'expéditeur */}
            <div className="space-y-4 pt-4 border-t border-black/[0.08]">
              <div>
                <label className="text-[13px] font-semibold text-black mb-1.5 block">
                  Expéditeur (vos coordonnées)
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Nom & Prénom</label>
                  <ClearableInput
                    value={expediteurNom}
                    onChange={(e) => { setExpediteurNom(e.target.value); setIsSaved(false); }}
                    className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Titre professionnel</label>
                  <ClearableInput
                    value={expediteurTitre}
                    onChange={(e) => { setExpediteurTitre(e.target.value); setIsSaved(false); }}
                    className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Email</label>
                  <ClearableInput
                    value={expediteurEmail}
                    onChange={(e) => { setExpediteurEmail(e.target.value); setIsSaved(false); }}
                    className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Téléphone</label>
                  <ClearableInput
                    value={expediteurTel}
                    onChange={(e) => { setExpediteurTel(e.target.value); setIsSaved(false); }}
                    className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
              </div>
            </div>

            {/* 3. Corps de la lettre (Paragraphe par paragraphe) */}
            <div className="space-y-6 pt-4 border-t border-black/[0.08]">
              <div>
                <label className="text-[13px] font-semibold text-black mb-1.5 block">
                  Corps de la lettre
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1.5 align-middle" />
                </label>
              </div>

              {/* Objet */}
              <div>
                <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Objet de la candidature</label>
                <ClearableInput
                  value={objet}
                  onChange={(e) => { setObjet(e.target.value); setIsSaved(false); }}
                  className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                />
              </div>

              {/* Formule d'entrée */}
              <div>
                <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Formule d'appel</label>
                <ClearableInput
                  value={formuleEntree}
                  onChange={(e) => { setFormuleEntree(e.target.value); setIsSaved(false); }}
                  className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                />
              </div>

              {/* Paragraphe 1 : Accroche */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-neutral-600">Paragraphe 1 : Accroche & Intérêt</label>
                  <button
                    type="button"
                    disabled={optimizingParagraph === 'accroche' || !accroche.trim()}
                    onClick={() => handleOptimizeParagraph('accroche', accroche, 'Rendre l\'accroche plus directe et percutante')}
                    className="text-[11px] font-semibold text-black underline cursor-pointer disabled:opacity-40"
                  >
                    {optimizingParagraph === 'accroche' ? 'Optimisation...' : 'Optimiser'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={accroche}
                  onChange={(e) => { setAccroche(e.target.value); setIsSaved(false); }}
                  placeholder="Expliquez pourquoi ce poste et cette entreprise vous intéressent..."
                  className="w-full p-3 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black leading-relaxed"
                />
              </div>

              {/* Paragraphe 2 : Valeur ajoutée */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-neutral-600">Paragraphe 2 : Expérience & Réalisations</label>
                  <button
                    type="button"
                    disabled={optimizingParagraph === 'valeurAjoutee' || !valeurAjoutee.trim()}
                    onClick={() => handleOptimizeParagraph('valeurAjoutee', valeurAjoutee, 'Valoriser les réalisations et résultats quantifiables')}
                    className="text-[11px] font-semibold text-black underline cursor-pointer disabled:opacity-40"
                  >
                    {optimizingParagraph === 'valeurAjoutee' ? 'Optimisation...' : 'Optimiser'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={valeurAjoutee}
                  onChange={(e) => { setValeurAjoutee(e.target.value); setIsSaved(false); }}
                  placeholder="Détaillez vos atouts majeurs et compétences démontrées..."
                  className="w-full p-3 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black leading-relaxed"
                />
              </div>

              {/* Paragraphe 3 : Adéquation entreprise */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-neutral-600">Paragraphe 3 : Adéquation avec l'Entreprise</label>
                  <button
                    type="button"
                    disabled={optimizingParagraph === 'adequation' || !adequation.trim()}
                    onClick={() => handleOptimizeParagraph('adequation', adequation, 'Renforcer l\'alignement avec la vision et les besoins de l\'entreprise')}
                    className="text-[11px] font-semibold text-black underline cursor-pointer disabled:opacity-40"
                  >
                    {optimizingParagraph === 'adequation' ? 'Optimisation...' : 'Optimiser'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={adequation}
                  onChange={(e) => { setAdequation(e.target.value); setIsSaved(false); }}
                  placeholder="Expliquez ce qui vous rassemble et comment vous collaborerez..."
                  className="w-full p-3 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black leading-relaxed"
                />
              </div>

              {/* Paragraphe 4 : Conclusion */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-neutral-600">Paragraphe 4 : Demande d'entretien</label>
                  <button
                    type="button"
                    disabled={optimizingParagraph === 'conclusion' || !conclusion.trim()}
                    onClick={() => handleOptimizeParagraph('conclusion', conclusion, 'Proposer un échange avec assurance et courtoisie')}
                    className="text-[11px] font-semibold text-black underline cursor-pointer disabled:opacity-40"
                  >
                    {optimizingParagraph === 'conclusion' ? 'Optimisation...' : 'Optimiser'}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={conclusion}
                  onChange={(e) => { setConclusion(e.target.value); setIsSaved(false); }}
                  placeholder="Proposition d'entretien..."
                  className="w-full p-3 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black leading-relaxed"
                />
              </div>

              {/* Formule de sortie & Signature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Formule de politesse</label>
                  <ClearableInput
                    value={formuleSortie}
                    onChange={(e) => { setFormuleSortie(e.target.value); setIsSaved(false); }}
                    className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-neutral-600 mb-1 block">Signature</label>
                  <ClearableInput
                    value={signature}
                    onChange={(e) => { setSignature(e.target.value); setIsSaved(false); }}
                    className="h-11 px-4 text-xs bg-white border-[1.5px] border-black/15 rounded-[8px] focus:border-black focus:border-2 focus:ring-0 focus:outline-none text-black"
                  />
                </div>
              </div>
            </div>

            {/* 4. Action button at bottom */}
            <div className="pt-4 border-t border-black/[0.08] flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleCopy}
                className="h-12 px-7 bg-transparent border-[1.5px] border-black text-black font-semibold text-[15px] rounded-[8px] hover:bg-black/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copier le texte</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="h-12 px-7 bg-black text-white font-semibold text-[15px] rounded-[8px] hover:bg-[#1A1A1A] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer la lettre</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY LIVE A4 LETTER PREVIEW (40%, #F5F5F5, Straight corners) */}
          <div className="hidden lg:flex w-full lg:w-[40%] sticky top-24 self-start bg-[#F5F5F5] p-6 rounded-none min-h-[calc(100vh-120px)] flex-col items-center justify-start border border-black/[0.06]">
            <div className="w-full max-w-[420px] flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-[12px] font-semibold text-neutral-600">
                <span>Aperçu de la lettre</span>
                <span className="text-[11px] font-mono text-neutral-400">Format A4 • Rendu direct</span>
              </div>

              {/* The Live Rendered Letter Sheet with straight corners (rounded-none) */}
              <div 
                id="letter-a4-sheet"
                className="w-full bg-white text-black p-8 shadow-[0_12px_32px_rgba(0,0,0,0.12)] rounded-none space-y-6 text-xs transition-opacity duration-150 border border-black/[0.04]"
                style={{
                  fontFamily: police,
                  fontSize: `${taillePolice}pt`,
                  lineHeight: 1.6
                }}
              >
                {/* Header Accent Bar */}
                <div 
                  className="h-1 w-12 bg-black rounded-none"
                  style={{ backgroundColor: couleurAccent }}
                />

                {/* Sender & Recipient */}
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-black/[0.08] text-[11px]">
                  <div>
                    <p className="font-bold text-[12px] text-black">{expediteurNom}</p>
                    {expediteurTitre && <p className="text-neutral-600">{expediteurTitre}</p>}
                    {expediteurEmail && <p className="text-neutral-500">{expediteurEmail}</p>}
                    {expediteurTel && <p className="text-neutral-500">{expediteurTel}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[12px] text-black">{entreprise || 'Entreprise'}</p>
                    <p className="text-neutral-600">{destinataire || 'Direction des Ressources Humaines'}</p>
                    <p className="text-neutral-400 pt-1">{villeDate}</p>
                  </div>
                </div>

                {/* Objet */}
                <div className="py-1">
                  <p className="font-bold text-xs">
                    <span className="text-neutral-500 uppercase tracking-wider text-[10px] mr-1.5">Objet :</span>
                    {objet}
                  </p>
                </div>

                {/* Body Paragraphs */}
                <div className="space-y-3.5 text-neutral-800 text-justify text-[11.5px] leading-relaxed">
                  <p className="font-semibold text-black">{formuleEntree}</p>
                  {accroche && <p>{accroche}</p>}
                  {valeurAjoutee && <p>{valeurAjoutee}</p>}
                  {adequation && <p>{adequation}</p>}
                  {conclusion && <p>{conclusion}</p>}
                  <p className="pt-1 font-medium">{formuleSortie}</p>
                </div>

                {/* Signature */}
                <div className="pt-4 flex flex-col items-end">
                  <p className="font-bold text-black text-xs">{signature || expediteurNom}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MOBILE FLOATING PREVIEW BUTTON (<768px) */}
      <button
        type="button"
        onClick={() => setIsMobilePreviewOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 bg-black text-white px-4 py-3 rounded-[8px] shadow-2xl flex items-center gap-2 text-xs font-semibold cursor-pointer"
      >
        <Eye className="w-4 h-4" />
        <span>Aperçu Lettre</span>
      </button>

      {/* MOBILE PREVIEW MODAL */}
      {isMobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="bg-[#F5F5F5] w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-[8px] shadow-2xl">
            <div className="p-3 bg-white border-b border-black/[0.08] flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Aperçu de la lettre</span>
              <button
                type="button"
                onClick={() => setIsMobilePreviewOpen(false)}
                className="p-1 text-black hover:opacity-70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div 
                className="bg-white p-6 shadow-md rounded-none text-xs space-y-4"
                style={{ fontFamily: police, fontSize: `${taillePolice}pt`, lineHeight: 1.6 }}
              >
                <div className="h-1 w-12 bg-black" style={{ backgroundColor: couleurAccent }} />
                <div className="flex justify-between items-start gap-3 pb-3 border-b border-black/[0.08] text-[11px]">
                  <div>
                    <p className="font-bold text-black">{expediteurNom}</p>
                    {expediteurTitre && <p className="text-neutral-600">{expediteurTitre}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">{entreprise || 'Entreprise'}</p>
                    <p className="text-neutral-400">{villeDate}</p>
                  </div>
                </div>
                <p className="font-bold text-xs"><span className="text-neutral-500 mr-1">Objet:</span>{objet}</p>
                <div className="space-y-2 text-neutral-800 text-[11px] leading-relaxed">
                  <p className="font-semibold">{formuleEntree}</p>
                  {accroche && <p>{accroche}</p>}
                  {valeurAjoutee && <p>{valeurAjoutee}</p>}
                  {adequation && <p>{adequation}</p>}
                  {conclusion && <p>{conclusion}</p>}
                  <p className="pt-1">{formuleSortie}</p>
                </div>
                <div className="text-right pt-2">
                  <p className="font-bold text-black">{signature || expediteurNom}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL SCREEN MODAL PREVIEW */}
      <LetterPreviewModal
        letter={getCurrentLetterObject()}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onPrint={() => handlePrint()}
      />
    </div>
  );
};
