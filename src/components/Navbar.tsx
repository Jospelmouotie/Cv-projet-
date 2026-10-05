import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Plus
} from 'lucide-react';
import { Language, User } from '../types';
import { getTranslation } from '../i18n/translations';
import { AppView } from './Sidebar';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { NotificationBell } from './NotificationBell';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  langue: Language;
  setLangue?: (lang: Language) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onToggleSidebar: () => void;
  user: User | null;
  activeCvTitle?: string;
  onOpenUpgradeModal?: () => void;
  onOpenAuth?: () => void;
  onOpenProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  langue,
  setLangue,
  isDarkMode,
  toggleDarkMode,
  onToggleSidebar,
  user,
  activeCvTitle,
  onOpenUpgradeModal,
  onOpenAuth,
  onOpenProfileModal
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);
  const [careerDropdownOpen, setCareerDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCareerDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userTier = (user?.role === 'ADMIN' || user?.subscriptionTier === 'premium') ? 'premium' : (user?.subscriptionTier || 'freemium');
  const userInitial = user ? (user.nom || user.email || 'U').charAt(0).toUpperCase() : '';

  const careerTools = [
    {
      id: 'job-targeting' as AppView,
      label: langue === 'en' ? 'Job Offer Targeting' : langue === 'ar' ? 'تخصيص لعرض عمل' : 'Cibler une Offre',
      desc: langue === 'en' ? 'Tailor CV to job offer' : 'Adapter le CV à une annonce',
      badge: 'IA'
    },
    {
      id: 'letter-generator' as AppView,
      label: langue === 'en' ? 'Cover Letter Generator' : langue === 'ar' ? 'مولد الخطابات' : 'Générateur de Lettre',
      desc: langue === 'en' ? 'AI Cover Letter' : 'Rédiger une lettre personnalisée',
      badge: 'IA'
    },
    {
      id: 'letters' as AppView,
      label: langue === 'en' ? 'My Saved Letters' : langue === 'ar' ? 'خطاباتي' : 'Mes Lettres',
      desc: langue === 'en' ? 'Dashboard of letters' : 'Consulter mes lettres enregistrées'
    },
    {
      id: 'translate-cv' as AppView,
      label: langue === 'en' ? 'Translator' : langue === 'ar' ? 'المترجم' : 'Traducteur',
      desc: langue === 'en' ? 'Translate into 30+ languages' : 'Traduire en un clic',
      badge: 'IA'
    },
    {
      id: 'linkedin' as AppView,
      label: langue === 'en' ? 'LinkedIn Optimizer' : langue === 'ar' ? 'تحسين لينكد إن' : 'Optimiseur LinkedIn',
      desc: langue === 'en' ? 'Generate LinkedIn profile' : 'Booster la visibilité recruteur',
      badge: 'IA'
    }
  ];

  const isCareerActive = [
    'job-targeting', 
    'letter-generator', 
    'letters', 
    'translate-cv', 
    'linkedin'
  ].includes(currentView);

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30 transition-colors">
      <div className="w-full px-2.5 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        
        {/* Left Section: Logo & Mobile Trigger & Desktop Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 shrink-0 min-w-0">
          {/* Mobile Menu Button (ONLY visible on small screens < md) */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Ouvrir le menu mobile"
            aria-label="Ouvrir le menu mobile"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Brand Logo & Name */}
          <div 
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0 group"
          >
            <AppLogo size="sm" animated />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-white text-sm tracking-tight group-hover:text-blue-400 transition-colors">
                  MonCV
                </span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider leading-none">
                  PRO
                </span>
              </div>
              {isPaymentActive() && (
                <span className="text-[8px] sm:text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-tight mt-1">
                  {userTier.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation Navbar Links (NO ICONS, ONLY TEXT) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 ml-2">
            {/* Accueil */}
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>Accueil</span>
            </button>

            {/* Mes CV */}
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>Mes CV</span>
            </button>

            {/* Modèles */}
            <button
              type="button"
              onClick={() => setCurrentView('gallery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'gallery'
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <span>Modèles</span>
            </button>

            {/* CV par Métier */}
            <Link
              to="/cv-metiers"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 transition-all flex items-center gap-1.5"
            >
              <span>Par Métier</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[10px]">36</span>
            </Link>

            {/* Outils Carrière Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCareerDropdownOpen(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isCareerActive
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <span>Outils Carrière</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${careerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu (NO ICONS) */}
              {careerDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 p-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                    Outils & Assistants Carrière
                  </div>

                  <Link
                    to="/cv-metiers"
                    onClick={() => setCareerDropdownOpen(false)}
                    className="w-full p-2.5 rounded-xl text-left transition-all cursor-pointer hover:bg-neutral-800/60 text-neutral-300 hover:text-white flex items-center justify-between block"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold leading-tight">Modèles par Métier</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-500 text-white shrink-0">36 Métiers</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">CV spécialisés avec carrousels de 5 modèles</p>
                    </div>
                  </Link>

                  {careerTools.map((tool) => {
                    const isActive = currentView === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setCurrentView(tool.id);
                          setCareerDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-neutral-800 text-white font-bold'
                            : 'hover:bg-neutral-800/60 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold leading-tight truncate">{tool.label}</span>
                          {tool.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-black shrink-0">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">{tool.desc}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section: Language, Theme, Notification Bell, New CV, Admin "A", Profile/Auth Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Selector Dropdown */}
          {setLangue && (
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(prev => !prev)}
                title="Changer de langue"
                className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                <span className="uppercase font-black text-[11px]">{langue}</span>
                <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {[
                    { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
                    { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
                    { code: 'ar' as Language, label: 'العربية', flag: '🇸🇦' }
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLangue(item.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        langue === item.code
                          ? 'bg-neutral-800 text-white font-black'
                          : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{item.flag}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle Button (Dark / Light) - Hidden on small screens, in sidebar */}
          {toggleDarkMode && (
            <button
              type="button"
              onClick={toggleDarkMode}
              title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
              className="hidden md:flex w-8 h-8 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          )}

          {/* Real-time Notifications Bell - Always visible in Navbar */}
          <NotificationBell langue={langue} onNavigate={setCurrentView} />

          {/* Nouveau CV Button - Hidden on small screens, accessible in sidebar */}
          {currentView !== 'gallery' && (
            <button
              type="button"
              onClick={() => setCurrentView('gallery')}
              title="Créer un nouveau CV"
              className="hidden md:flex px-3 py-1.5 border border-white text-white hover:bg-white hover:text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau CV</span>
            </button>
          )}

          {/* Admin Indicator: Just the letter "A" - Hidden on small screens, in sidebar */}
          {user?.role === 'ADMIN' && currentView !== 'admin' && (
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              title="Panneau Administrateur"
              className="hidden md:flex w-8 h-8 rounded-xl border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-black items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
            >
              A
            </button>
          )}

          {/* User Initial Avatar Button / Connexion - Hidden on small screens, in sidebar */}
          {user ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              title="Voir mon profil et paramètres"
              className="hidden md:flex w-8 h-8 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-black items-center justify-center transition-all shadow-xs cursor-pointer border border-white shrink-0"
            >
              {userInitial}
            </button>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden md:flex px-3 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
              >
                <span>Connexion</span>
              </button>
            )
          )}
        </div>

      </div>
    </header>
  );
};
