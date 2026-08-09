import React from 'react';
import { Menu, Plus, Shield } from 'lucide-react';
import { Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'gallery' | 'editor' | 'admin';
  setCurrentView: (view: 'home' | 'dashboard' | 'gallery' | 'editor' | 'admin') => void;
  langue: Language;
  onToggleSidebar: () => void;
  user: User | null;
  activeCvTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  langue,
  onToggleSidebar,
  user,
  activeCvTitle
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const getViewTitle = () => {
    switch (currentView) {
      case 'home': return 'Accueil & Présentation';
      case 'dashboard': return 'Mes CVs & Téléchargements';
      case 'gallery': return 'Catalogue des Modèles Officiels';
      case 'editor': return activeCvTitle ? `Édition: ${activeCvTitle}` : 'Créateur de CV';
      case 'admin': return 'Panneau de Gestion Admin';
      default: return 'MYCV BUILDER';
    }
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Sidebar Toggle Button & View Context Title */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-2xs"
            title="Ouvrir le menu latéral (Langue, Thème, Navigation)"
          >
            <Menu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold hidden sm:inline text-slate-700 dark:text-slate-300">Menu</span>
          </button>

          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <span>{getViewTitle()}</span>
              {currentView === 'editor' && (
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                  Aperçu Temps Réel
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
              Plateforme professionnelle de création de CV HD
            </p>
          </div>
        </div>

        {/* Right Quick Action CTA */}
        <div className="flex items-center space-x-2">
          {currentView !== 'gallery' && (
            <button
              type="button"
              onClick={() => setCurrentView('gallery')}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Créer un nouveau CV</span>
              <span className="sm:hidden">Créer</span>
            </button>
          )}

          {user?.role === 'ADMIN' && currentView !== 'admin' && (
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className="px-3 py-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200/80 dark:border-amber-800 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
