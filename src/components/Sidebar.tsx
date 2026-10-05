import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Language, SubscriptionTier } from '../types';
import { getTranslation } from '../i18n/translations';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { CV_TEMPLATES } from '../data/templates';
import { AppLogo } from './AppLogo';
import { 
  ChevronDown, 
  ChevronUp, 
  X,
  Globe,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';

export type AppView = 
  | 'home' 
  | 'dashboard' 
  | 'gallery' 
  | 'editor' 
  | 'job-targeting' 
  | 'letter-generator' 
  | 'letters' 
  | 'linkedin' 
  | 'translate-cv' 
  | 'admin';

interface SidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  langue: Language;
  setLangue: (lang: Language) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  onLogout: () => void;
  onQuickLoginDemo: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  hasActiveCv: boolean;
  onOpenEditorChoice?: () => void;
  onCreateBlankCV?: () => void;
  onOpenLetterGenerator?: () => void;
  onOpenLinkedInGenerator?: () => void;
  onOpenJobTargeting?: () => void;
  onOpenTranslator?: () => void;
  onOpenExportPDF?: () => void;
  onOpenModifiedCVs?: () => void;
  onOpenLettersDashboard?: () => void;
  onOpenUpgradeModal?: (tier?: SubscriptionTier) => void;
  onOpenAuth?: () => void;
  onOpenProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  langue,
  setLangue,
  isDarkMode,
  toggleDarkMode,
  user,
  onQuickLoginDemo,
  isOpen,
  setIsOpen,
  onCreateBlankCV,
  onOpenLetterGenerator,
  onOpenLinkedInGenerator,
  onOpenJobTargeting,
  onOpenTranslator,
  onOpenUpgradeModal,
  onOpenAuth,
  onOpenProfileModal
}) => {
  const [careerToolsOpen, setCareerToolsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const handleTemplatesClick = () => {
    setIsModelLoading(true);
    handleNav('gallery');
    setTimeout(() => {
      setIsModelLoading(false);
    }, 500);
  };

  const userTier: SubscriptionTier = (user?.role === 'ADMIN' || user?.subscriptionTier === 'premium') ? 'premium' : (user?.subscriptionTier || 'freemium');
  const isPro = userTier === 'classique' || userTier === 'premium';

  const labels = {
    home: langue === 'en' ? 'Home' : langue === 'ar' ? 'الرئيسية' : 'Accueil',
    myCVs: langue === 'en' ? 'My CVs' : langue === 'ar' ? 'سيري الذاتية' : 'Mes CV',
    myLetters: langue === 'en' ? 'My Cover Letters' : langue === 'ar' ? 'خطابات التقديم' : 'Mes Lettres',
    letterGenerator: langue === 'en' ? 'Cover Letter Generator' : langue === 'ar' ? 'مولد الخطابات' : 'Générateur de Lettre',
    createCV: langue === 'en' ? 'Create New CV' : langue === 'ar' ? 'إنشاء سيرة ذاتية' : 'Créer un CV',
    myDocuments: langue === 'en' ? 'My Documents' : langue === 'ar' ? 'مستنداتي' : 'Mes documents',
    create: langue === 'en' ? 'Create' : langue === 'ar' ? 'إنشاء' : 'Créer',
    careerTools: langue === 'en' ? 'Career Tools' : langue === 'ar' ? 'أدوات التوظيف' : 'Outils carrière',
    templates: langue === 'en' ? 'Templates' : langue === 'ar' ? 'النماذج' : 'Modèles',
    settings: langue === 'en' ? 'Settings' : langue === 'ar' ? 'الإعدادات' : 'Paramètres',
    jobTargeting: langue === 'en' ? 'Job Offer Targeting' : langue === 'ar' ? 'تخصيص لعرض عمل' : 'Cibler une offre',
    cvTranslator: langue === 'en' ? 'Translator' : langue === 'ar' ? 'المترجم' : 'Traducteur',
    linkedIn: langue === 'en' ? 'LinkedIn Optimizer' : langue === 'ar' ? 'تحسين لينكد إن' : 'Générateur LinkedIn',
    darkMode: langue === 'en' ? 'Dark Mode' : langue === 'ar' ? 'الوضع الداكن' : 'Mode sombre',
    lightMode: langue === 'en' ? 'Light Mode' : langue === 'ar' ? 'الوضع الفاتح' : 'Mode clair',
    demoProfile: langue === 'en' ? 'Demo Account' : langue === 'ar' ? 'حساب تجريبي' : 'Compte Démo',
    adminPanel: langue === 'en' ? 'Admin Panel' : langue === 'ar' ? 'لوحة التحكم' : 'Administration',
    upgrade: langue === 'en' ? 'Upgrade to Pro' : langue === 'ar' ? 'الترقية إلى برو' : 'Passer au Pro',
    faq: langue === 'en' ? 'FAQ & Help' : langue === 'ar' ? 'الأسئلة الشائعة والمساعدة' : 'Foire Aux Questions (FAQ)'
  };

  const handleNav = (view: AppView) => {
    setCurrentView(view);
    setIsOpen(false);
  };

  const userInitial = user ? (user.nom || user.email || 'U').charAt(0).toUpperCase() : '';

  return (
    <>
      {/* Backdrop (Mobile only) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity md:hidden"
        />
      )}

      {/* Sidebar Drawer (Mobile only) */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 bg-neutral-950 border-r border-neutral-800 transition-transform duration-300 flex flex-col justify-between shadow-2xl w-72 max-w-[85vw] md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        dir={langue === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
            <div 
              onClick={() => handleNav('home')}
              className="flex items-center space-x-3 cursor-pointer select-none group"
            >
              <AppLogo size="sm" animated />
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">MonCV</span>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider leading-none">PRO</span>
                </div>
                {isPaymentActive() && (
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1">{userTier}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Menu (NO ICONS, ONLY TEXT) */}
          <nav className="p-4 space-y-1.5">
            {/* 1. Accueil */}
            <button
              onClick={() => handleNav('home')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span>{labels.home}</span>
            </button>

            {/* 2. Mes CV */}
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span>{labels.myCVs}</span>
            </button>

            {/* 3. Mes Lettres */}
            <button
              onClick={() => handleNav('letters')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'letters'
                  ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span>{labels.myLetters}</span>
            </button>

            {/* 4. Modèles */}
            <button
              onClick={handleTemplatesClick}
              disabled={isModelLoading}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${
                currentView === 'gallery'
                  ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{labels.templates}</span>
              </div>
              {isModelLoading ? (
                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                  <span className="text-[11px]">Chargement...</span>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 font-mono">
                  {CV_TEMPLATES.length}
                </span>
              )}
            </button>

            {/* 5. Créer un CV */}
            <button
              onClick={() => {
                if (onCreateBlankCV) onCreateBlankCV();
                else handleNav('gallery');
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              <span>{labels.createCV}</span>
            </button>

            {/* 6. Générateur de Lettre */}
            <button
              onClick={() => {
                if (onOpenLetterGenerator) onOpenLetterGenerator();
                else handleNav('letter-generator');
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'letter-generator'
                  ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span>{labels.letterGenerator}</span>
            </button>

            {/* FAQ Menu Item */}
            <button
              onClick={() => {
                handleNav('home');
                setTimeout(() => {
                  const faqEl = document.getElementById('faq-section');
                  if (faqEl) faqEl.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              <span>Foire aux Questions (FAQ)</span>
            </button>

            {/* 4. Outils carrière (Collapsible) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setCareerToolsOpen(!careerToolsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  ['job-targeting', 'translate-cv', 'linkedin'].includes(currentView)
                    ? 'bg-neutral-900 text-white font-bold border border-neutral-800'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <span>{labels.careerTools}</span>
                {careerToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {careerToolsOpen && (
                <div className="pl-4 pr-2 py-1 space-y-0.5 border-l border-neutral-800 my-1">
                  {/* Modèles par Métier - Placé dans Outils Carrière */}
                  <Link
                    to="/cv-metiers"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center justify-between"
                  >
                    <span>{langue === 'en' ? 'Templates by Job' : langue === 'ar' ? 'نماذج حسب المهنة' : 'Modèles par Métier'}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px]">36</span>
                  </Link>
                  <button
                    onClick={() => {
                      if (onOpenJobTargeting) onOpenJobTargeting();
                      else handleNav('job-targeting');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentView === 'job-targeting'
                        ? 'text-white bg-neutral-900 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <span>{labels.jobTargeting}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenTranslator) onOpenTranslator();
                      else handleNav('translate-cv');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentView === 'translate-cv'
                        ? 'text-white bg-neutral-900 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <span>{labels.cvTranslator}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenLinkedInGenerator) onOpenLinkedInGenerator();
                      else handleNav('linkedin');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentView === 'linkedin'
                        ? 'text-white bg-neutral-900 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <span>{labels.linkedIn}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 5. Paramètres (Collapsible) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  settingsOpen || currentView === 'admin'
                    ? 'bg-neutral-900 text-white border border-neutral-800'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <span>{labels.settings}</span>
                {settingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {settingsOpen && (
                <div className="pl-4 pr-2 py-1 space-y-0.5 border-l border-neutral-800 my-1">
                  {/* Mode sombre / clair */}
                  <button
                    onClick={toggleDarkMode}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    <span>{isDarkMode ? labels.lightMode : labels.darkMode}</span>
                  </button>

                  {/* Passer au Pro */}
                  {isPaymentActive() && !isPro && onOpenUpgradeModal && (
                    <button
                      onClick={() => {
                        onOpenUpgradeModal('classique');
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-neutral-900 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all hover:bg-neutral-800 cursor-pointer"
                    >
                      <span>{labels.upgrade}</span>
                    </button>
                  )}

                  {/* Panneau Admin */}
                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleNav('admin')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        currentView === 'admin'
                          ? 'text-white bg-neutral-900 font-bold'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <span>{labels.adminPanel}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Theme & Language Quick Preferences (Always Visible in Sidebar) */}
            <div className="pt-3 border-t border-neutral-800 space-y-3 mt-3">
              {/* Mode Sombre / Clair */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {langue === 'en' ? 'Theme' : langue === 'ar' ? 'المظهر' : 'Thème'}
                </span>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-200 transition-all cursor-pointer shadow-xs"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{labels.lightMode}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{labels.darkMode}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sélection de Langue */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {langue === 'en' ? 'Language' : langue === 'ar' ? 'اللغة' : 'Langue'}
                </span>
                <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                  {[
                    { code: 'fr' as Language, label: 'FR' },
                    { code: 'en' as Language, label: 'EN' },
                    { code: 'ar' as Language, label: 'AR' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLangue && setLangue(item.code)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase transition-all cursor-pointer ${
                        langue === item.code
                          ? 'bg-white text-black shadow-xs font-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer - User Section (Opens Profile Modal, NO Logout button here) */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950">
          {user ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenProfileModal) onOpenProfileModal();
              }}
              className="w-full flex items-center space-x-3 p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800/80 transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-white text-black font-black text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.nom || 'Utilisateur'}</p>
                <p className="text-[10px] text-neutral-400 truncate">Voir mon profil</p>
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-neutral-400">Connectez-vous pour sauvegarder vos CVs.</p>
              {onOpenAuth && (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                >
                  <span>Se connecter</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
