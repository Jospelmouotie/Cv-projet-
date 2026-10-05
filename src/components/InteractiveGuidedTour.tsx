import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, X, LayoutDashboard, FileText, Target, Shield, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface InteractiveGuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  langue: Language;
}

export const InteractiveGuidedTour: React.FC<InteractiveGuidedTourProps> = ({ isOpen, onClose, langue }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: langue === 'en' ? 'Welcome to MonCVPro!' : 'Bienvenue sur MonCVPro !',
      subtitle: langue === 'en' ? 'Your AI-Powered Career Platform' : 'Votre plateforme carrière intelligente & professionnelle',
      icon: Sparkles,
      iconBg: 'bg-blue-600',
      description: langue === 'en' 
        ? 'Create high-impact resumes, cover letters, and LinkedIn profiles customized for job offers in minutes.'
        : 'Créez des CV percutants, des lettres de motivation sur-mesure et optimisez votre profil LinkedIn en quelques minutes.',
      highlights: [
        langue === 'en' ? '59+ High Definition Resume Templates' : '59+ Modèles de CV Haute Définition (A4)',
        langue === 'en' ? 'Instant AI Translation (French, English, Arabic)' : 'Traduction instantanée par IA (Français, Anglais, Arabe)',
        langue === 'en' ? 'Smart Job Offer Targeting & Adaptation' : 'Ciblage intelligent d\'offres d\'emploi'
      ]
    },
    {
      title: langue === 'en' ? '1. Manage Your Documents' : '1. Gérez vos documents',
      subtitle: langue === 'en' ? 'Dashboard & Drafts' : 'Tableau de bord & Brouillons',
      icon: LayoutDashboard,
      iconBg: 'bg-indigo-600',
      description: langue === 'en'
        ? 'Access all your saved resumes and cover letters anytime. Edit, duplicate, or translate them with one click.'
        : 'Retrouvez tous vos CV et lettres sauvegardés. Modifiez, dupliquez ou traduisez-les en un clic.',
      highlights: [
        langue === 'en' ? 'Filter by Original vs. Tailored CVs' : 'Filtrez vos CV originaux et adaptés',
        langue === 'en' ? 'Real-time Autosave & Cloud Backup' : 'Sauvegarde automatique sécurisée',
        langue === 'en' ? 'One-click duplication for new applications' : 'Duplication rapide pour chaque postulation'
      ]
    },
    {
      title: langue === 'en' ? '2. Creator Studio & Form Wizard' : '2. Studio de création & Formulaire',
      subtitle: langue === 'en' ? 'Dual Editing Modes' : 'Deux modes d\'édition complémentaires',
      icon: FileText,
      iconBg: 'bg-emerald-600',
      description: langue === 'en'
        ? 'Switch smoothly between Guided Form Mode (for fast structured entry) and Creator Studio (for visual styling, colors, and typography).'
        : 'Basculez librement entre le Formulaire Guidé (saisie rapide) et le Creator Studio (couleurs, polices, espacements).',
      highlights: [
        langue === 'en' ? 'Real-time Spellchecker & Grammar Fixer' : 'Correcteur d\'orthographe & grammaire IA',
        langue === 'en' ? 'Drag-and-Drop section ordering' : 'Réorganisation des sections par glisser-déposer',
        langue === 'en' ? 'Live A4 Print Preview' : 'Aperçu imprimable A4 en temps réel'
      ]
    },
    {
      title: langue === 'en' ? '3. AI Career Suite' : '3. Outils Carrière & IA',
      subtitle: langue === 'en' ? 'Tailored Job Targeting' : 'Adaptation dynamique d\'offres d\'emploi',
      icon: Target,
      iconBg: 'bg-amber-600',
      description: langue === 'en'
        ? 'Import any job description text or photo. Our AI analyzes key requirements and tailors your resume and cover letter to match.'
        : 'Collez une annonce d\'emploi ou scannez sa photo. L\'IA adapte automatiquement votre CV et rédige la lettre idéale.',
      highlights: [
        langue === 'en' ? 'AI Cover Letter Generator' : 'Générateur de Lettre de Motivation dédiée',
        langue === 'en' ? 'LinkedIn Profile Optimizer' : 'Optimiseur de Profil LinkedIn',
        langue === 'en' ? 'Automatic 3-Language Translator' : 'Traducteur de CV intégrale en 3 langues'
      ]
    },
    {
      title: langue === 'en' ? '4. High Definition Export' : '4. Export PDF Haute Définition',
      subtitle: langue === 'en' ? 'Pixel-Perfect Print Standards' : 'Rendu vectoriel haute qualité',
      icon: Shield,
      iconBg: 'bg-purple-600',
      description: langue === 'en'
        ? 'Download vector HD PDFs (300 DPI) formatted to fit exactly 1 or 2 A4 pages without awkward text cuts or distortions.'
        : 'Téléchargez des PDF vectoriels HD (300 DPI) parfaitement calibrés sur 1 ou 2 pages A4 sans coupure de texte.',
      highlights: [
        langue === 'en' ? 'Standard & HD 300 DPI Quality' : 'Qualité PDF HD 300 DPI nette et lisible',
        langue === 'en' ? 'ATS-Friendly Vector Text' : 'Texte vectoriel compatible avec les robots ATS',
        langue === 'en' ? 'Re-launch this guide anytime from Settings' : 'Relancez ce guide à tout moment dans les Paramètres'
      ]
    }
  ];

  const current = tourSteps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('cv_builder_has_seen_tour', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('cv_builder_has_seen_tour', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {langue === 'en' ? `Step ${currentStep + 1} of ${tourSteps.length}` : `Étape ${currentStep + 1} sur ${tourSteps.length}`}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={langue === 'en' ? 'Skip tour' : 'Passer le guide'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-5">
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl ${current.iconBg} text-white shadow-lg shrink-0`}>
              <StepIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {current.title}
              </h3>
              <p className="text-xs font-semibold text-blue-400 mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {current.description}
          </p>

          <div className="space-y-2 pt-1 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            {current.highlights.map((item, idx) => (
              <div key={`tour-hl-${currentStep}-${idx}`} className="flex items-center space-x-2.5 text-xs font-medium text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-200 px-3 py-2 cursor-pointer transition-colors"
          >
            {langue === 'en' ? 'Skip' : 'Passer'}
          </button>

          <div className="flex items-center space-x-1.5">
            {tourSteps.map((_, i) => (
              <div
                key={`tour-dot-${i}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-5 bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer"
          >
            <span>{currentStep === tourSteps.length - 1 ? (langue === 'en' ? 'Get Started' : 'C\'est parti !') : (langue === 'en' ? 'Next' : 'Suivant')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
