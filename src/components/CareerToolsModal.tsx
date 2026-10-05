import React, { useState, useRef } from 'react';
import {
  FileText,
  Linkedin,
  Target,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  X,
  Send,
  Sliders,
  Check,
  MapPin
} from 'lucide-react';
import { CV, Language, LettreMotivationResult, LinkedInProfileResult, OffreEmploiAnalyse, OffreAdaptationResult } from '../types';
import { getTranslation } from '../i18n/translations';

interface CareerToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CV;
  langue: Language;
  onApplyPersonalizedCV: (updatedCV: CV) => void;
  initialTab?: 'lettre' | 'linkedin' | 'offre';
}

export const CareerToolsModal: React.FC<CareerToolsModalProps> = ({
  isOpen,
  onClose,
  cv,
  langue,
  onApplyPersonalizedCV,
  initialTab = 'lettre'
}) => {
  const [activeTab, setActiveTab] = useState<'lettre' | 'linkedin' | 'offre'>(initialTab);

  // Cover Letter state
  const [entreprise, setEntreprise] = useState('');
  const [poste, setPoste] = useState('');
  const [ton, setTon] = useState('professionnel');
  const [isGeneratingLettre, setIsGeneratingLettre] = useState(false);
  const [lettreResult, setLettreResult] = useState<LettreMotivationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // LinkedIn state
  const [isGeneratingLinkedIn, setIsGeneratingLinkedIn] = useState(false);
  const [linkedInResult, setLinkedInResult] = useState<LinkedInProfileResult | null>(null);

  // Job Offer state
  const [offreMode, setOffreMode] = useState<'image' | 'texte'>('image');
  const [texteOffre, setTexteOffre] = useState('');
  const [offreImageBase64, setOffreImageBase64] = useState<string | null>(null);
  const [isAnalyzingOffre, setIsAnalyzingOffre] = useState(false);
  const [analyseResult, setAnalyseResult] = useState<OffreEmploiAnalyse | null>(null);
  const [reponsesQuestions, setReponsesQuestions] = useState<Record<string, string>>({});
  const [isAdaptingCV, setIsAdaptingCV] = useState(false);
  const [adaptationResult, setAdaptationResult] = useState<OffreAdaptationResult | null>(null);
  const [adaptationStep, setAdaptationStep] = useState<'upload' | 'questions' | 'result'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Generate Cover Letter
  const handleGenerateLettre = async () => {
    setIsGeneratingLettre(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/lettre-motivation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ cv, langue, entreprise, poste, ton })
      });
      const data = await res.json();
      setLettreResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLettre(false);
    }
  };

  // Generate LinkedIn Profile
  const handleGenerateLinkedIn = async () => {
    setIsGeneratingLinkedIn(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/linkedin-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ cv, langue })
      });
      const data = await res.json();
      setLinkedInResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLinkedIn(false);
    }
  };

  // Handle Image Upload for Job Offer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOffreImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Analyze Job Offer to retrieve dynamic questions
  const handleAnalyzeJobOffer = async () => {
    if (!offreImageBase64 && !texteOffre.trim()) return;

    setIsAnalyzingOffre(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/analyse-offre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cv,
          langue,
          texteOffre: offreMode === 'texte' ? texteOffre : undefined,
          imageBase64: offreMode === 'image' ? offreImageBase64 : undefined
        })
      });
      const data: OffreEmploiAnalyse = await res.json();
      setAnalyseResult(data);
      setReponsesQuestions({});
      setAdaptationStep('questions');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingOffre(false);
    }
  };

  // Submit User answers to adapt CV and generate matching cover letter
  const handleAdaptCVAndLetter = async () => {
    if (!analyseResult) return;

    setIsAdaptingCV(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/ai/adapter-candidature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cv,
          offreAnalyse: analyseResult,
          reponsesQuestions,
          langue
        })
      });
      const data: OffreAdaptationResult = await res.json();
      setAdaptationResult(data);
      setAdaptationStep('result');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdaptingCV(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {langue === 'en' ? 'AI Career & Application Studio' : langue === 'ar' ? 'استوديو التوظيف والذكاء الاصطناعي' : 'Studio Recrutement & Candidature IA'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {langue === 'en' ? 'Analyze CV, generate cover letter, LinkedIn profile & customize for job offers' : langue === 'ar' ? 'تحليل السيرة، إنشاء رسالة تحفيزية، لينكد إن والتخصيص حسب العرض' : 'Génération de lettre, profil LinkedIn et ciblage sur-mesure d\'offre d\'emploi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lettre')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'lettre'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{langue === 'en' ? 'Cover Letter' : langue === 'ar' ? 'رسالة تحفيزية' : 'Lettre de Motivation'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'linkedin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Linkedin className="w-4 h-4 text-blue-600" />
            <span>{langue === 'en' ? 'LinkedIn Profile' : langue === 'ar' ? 'ملف LinkedIn' : 'Profil LinkedIn Optimisé'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offre')}
            className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'offre'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-600" />
            <span>{langue === 'en' ? 'Target Job Offer (Photo / Text)' : langue === 'ar' ? 'استهداف عرض عمل (صورة / نص)' : 'Cibler Offre d\'Emploi (Photo/Texte)'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: LETTRE DE MOTIVATION */}
          {activeTab === 'lettre' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {langue === 'en' ? 'Target Company (optional)' : langue === 'ar' ? 'الشركة المستهدفة' : 'Entreprise ciblée (optionnel)'}
                  </label>
                  <input
                    type="text"
                    value={entreprise}
                    onChange={(e) => setEntreprise(e.target.value)}
                    placeholder="Ex: Google, Société Générale, Startup..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {langue === 'en' ? 'Target Position (optional)' : langue === 'ar' ? 'المنصب المستهدف' : 'Intitulé du poste ciblé'}
                  </label>
                  <input
                    type="text"
                    value={poste}
                    onChange={(e) => setPoste(e.target.value)}
                    placeholder="Ex: Chef de Projet, Développeur..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {langue === 'en' ? 'Writing Tone' : langue === 'ar' ? 'أسلوب الصياغة' : 'Ton de rédaction'}
                  </label>
                  <select
                    value={ton}
                    onChange={(e) => setTon(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professionnel">Professionnel & Révélateur</option>
                    <option value="dynamique">Dynamique & Audacieux</option>
                    <option value="sobre">Sobre & Institutionnel</option>
                    <option value="creatif">Créatif & Innovant</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateLettre}
                  disabled={isGeneratingLettre}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingLettre ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{langue === 'en' ? 'Analyzing CV & Drafting...' : langue === 'ar' ? 'جاري التحليل والصياغة...' : 'Analyse du CV & Rédaction en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{langue === 'en' ? 'Generate Cover Letter with AI' : langue === 'ar' ? 'إنشاء الرسالة بالذكاء الاصطناعي' : 'Générer la Lettre de Motivation'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cover Letter Output */}
              {lettreResult && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                        {lettreResult.objet}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {lettreResult.destinataire} • {lettreResult.entreprise}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(lettreResult.texteComplet, 'lettre')}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    >
                      {copiedField === 'lettre' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier tout le texte</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-200 space-y-3 font-sans leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {lettreResult.texteComplet}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LINKEDIN PROFILE */}
          {activeTab === 'linkedin' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                <Linkedin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-blue-950 dark:text-blue-200">
                    {langue === 'en' ? 'Optimize your LinkedIn Presence' : langue === 'ar' ? 'تحسين ظهورك على لينكد إن' : 'Optimisez votre visibilité et votre Personal Branding'}
                  </h3>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                    {langue === 'en'
                      ? 'AI converts your CV into an impactful LinkedIn headline, strategic About summary, and search-optimized keywords based on your real experience.'
                      : 'L\'IA convertit votre CV en un titre LinkedIn accrocheur, un résumé "À propos" percutant et des mots-clés stratégiques pour remonter dans les recherches de recruteurs.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateLinkedIn}
                  disabled={isGeneratingLinkedIn}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingLinkedIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{langue === 'en' ? 'Generating LinkedIn Strategy...' : 'Génération en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{langue === 'en' ? 'Generate LinkedIn Profile' : 'Générer le Profil LinkedIn'}</span>
                    </>
                  )}
                </button>
              </div>

              {linkedInResult && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Headline */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {langue === 'en' ? 'LinkedIn Headline (Titre)' : 'Titre du Profil (Headline)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(linkedInResult.titreProfessionnel, 'headline')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {copiedField === 'headline' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'headline' ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      {linkedInResult.titreProfessionnel}
                    </p>
                  </div>

                  {/* Summary / About */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {langue === 'en' ? 'About Section (Résumé)' : 'Section À Propos (Bio)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(linkedInResult.resumeAPropos, 'about')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {copiedField === 'about' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'about' ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                      {linkedInResult.resumeAPropos}
                    </div>
                  </div>

                  {/* Keywords */}
                  {linkedInResult.motsClesStrategiques?.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                        {langue === 'en' ? 'Strategic SEO Keywords' : 'Mots-Clés Référencement & Recruteurs'}
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {linkedInResult.motsClesStrategiques.map((kw, i) => (
                          <span
                            key={`kw-${kw}-${i}`}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TARGET JOB OFFER (PHOTO / TEXT) */}
          {activeTab === 'offre' && (
            <div className="space-y-6">

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-black border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className={`px-3 py-1 rounded-full ${adaptationStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                  1. Importer l'offre
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className={`px-3 py-1 rounded-full ${adaptationStep === 'questions' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                  2. Questions ciblées sur-mesure
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className={`px-3 py-1 rounded-full ${adaptationStep === 'result' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                  3. CV & Lettre alignés
                </span>
              </div>

              {/* STEP 1: UPLOAD */}
              {adaptationStep === 'upload' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Format de l'offre d'emploi :
                    </span>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setOffreMode('image')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          offreMode === 'image' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Photo / Capture d'écran</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOffreMode('texte')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          offreMode === 'texte' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Coller le Texte</span>
                      </button>
                    </div>
                  </div>

                  {offreMode === 'image' ? (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {offreImageBase64 ? (
                        <div className="relative group border-2 border-blue-500 rounded-2xl overflow-hidden max-h-72 flex items-center justify-center bg-slate-950">
                          <img src={offreImageBase64} alt="Offre" className="max-h-72 object-contain" />
                          <button
                            type="button"
                            onClick={() => setOffreImageBase64(null)}
                            className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer transition-colors"
                        >
                          <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-2xl text-blue-600">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                              Cliquez pour importer la photo ou capture de l'offre d'emploi
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Formats supportés : PNG, JPG, JPEG, WebP
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        rows={6}
                        value={texteOffre}
                        onChange={(e) => setTexteOffre(e.target.value)}
                        placeholder="Collez ici le descriptif intégral de l'offre d'emploi (intitulé, missions, profil recherché, compétences clés requis)..."
                        className="w-full p-4 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAnalyzeJobOffer}
                      disabled={isAnalyzingOffre || (!offreImageBase64 && !texteOffre.trim())}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAnalyzingOffre ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyse de l'annonce et création des questions ciblées...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Analyser l'Offre & Poser les Questions Clés</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DYNAMIC QUESTIONS SPECIFIC TO THE JOB OFFER */}
              {adaptationStep === 'questions' && analyseResult && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Offre Détectée : {analyseResult.titrePoste} {analyseResult.entreprise ? `chez ${analyseResult.entreprise}` : ''}
                      </span>
                      {analyseResult.lieu && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{analyseResult.lieu}</span>
                        </span>
                      )}
                    </div>

                    {analyseResult.competencesClesRequises?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {analyseResult.competencesClesRequises.map((comp, idx) => (
                          <span key={`comp-req-${comp}-${idx}`} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            <span>{comp}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Questions Notice */}
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
                      <strong>Questions générées sur-mesure pour cette offre spécifique :</strong> Répondez avec vos véritables réalisations. L'IA utilisera vos réponses exactes pour valoriser votre CV et rédiger votre lettre <em>sans jamais rien inventer de fictif</em>.
                    </p>
                  </div>

                  {/* List of Custom Questions */}
                  <div className="space-y-4">
                    {(() => {
                      const allQuestions = (analyseResult.questionsPersonnalisees && analyseResult.questionsPersonnalisees.length > 0)
                        ? analyseResult.questionsPersonnalisees
                        : [
                            ...(analyseResult.questionsCompetences || []),
                            ...(analyseResult.questionsExperiences || []),
                            ...(analyseResult.questionsPrecision || [])
                          ];
                      
                      if (allQuestions.length === 0) {
                        return (
                          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                            Prêt pour l'adaptation du profil et des compétences selon les exigences de l'offre.
                          </div>
                        );
                      }

                      return allQuestions.map((q, idx) => (
                        <div key={q.id || `custom-q-${idx}`} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                              {q.question}
                            </span>
                          </div>
                          {q.description && (
                            <p className="text-[11px] text-slate-500 pl-7">
                              {q.description}
                            </p>
                          )}
                          <div className="pl-7 pt-1">
                            <textarea
                              rows={2}
                              value={reponsesQuestions[q.id] || ''}
                              onChange={(e) => setReponsesQuestions(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Votre réponse authentique (ex: oui, j'ai piloté ce type de projet chez X avec +20% de résultat...)"
                              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setAdaptationStep('upload')}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      ← Changer d'offre
                    </button>

                    <button
                      type="button"
                      onClick={handleAdaptCVAndLetter}
                      disabled={isAdaptingCV}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAdaptingCV ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Personnalisation du CV & de la Lettre...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Personnaliser mon CV & Générer ma Lettre</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: RESULT & APPLY */}
              {adaptationStep === 'result' && adaptationResult && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        Candidature adaptée avec succès !
                      </span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Taux de correspondance estimé avec l'offre : <strong>{adaptationResult.tauxCorrespondanceEstime}%</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const targetCV = adaptationResult.cvPersonnalise || adaptationResult.cvModifie || (adaptationResult as any).adaptedCv;
                        if (targetCV && typeof onApplyPersonalizedCV === 'function') {
                          onApplyPersonalizedCV(targetCV);
                        }
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Appliquer ce CV dans l'Éditeur</span>
                    </button>
                  </div>

                  {/* Summary of modifications */}
                  {adaptationResult.modificationsApportees?.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                        Optimisations stratégiques appliquées (sans rien inventer de fictif) :
                      </span>
                      <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-5">
                        {adaptationResult.modificationsApportees.map((mod, i) => (
                          <li key={`mod-${i}`}>{mod}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Matching Cover Letter */}
                  {adaptationResult.lettreMotivation && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Lettre de motivation générée pour cette annonce :
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(adaptationResult.lettreMotivation.texteComplet, 'matched-letter')}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {copiedField === 'matched-letter' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'matched-letter' ? 'Copiée !' : 'Copier la lettre'}</span>
                        </button>
                      </div>
                      <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                        {adaptationResult.lettreMotivation.texteComplet}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
