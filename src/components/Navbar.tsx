import React from 'react';
import { FileText, Grid, LayoutDashboard, Shield, Globe, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Language, User } from '../types';
import { getTranslation } from '../i18n/translations';

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'gallery' | 'editor' | 'admin';
  setCurrentView: (view: 'home' | 'dashboard' | 'gallery' | 'editor' | 'admin') => void;
  langue: Language;
  setLangue: (lang: Language) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  onLogout: () => void;
  onQuickLoginDemo: () => void;
  onQuickLoginAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  langue,
  setLangue,
  isDarkMode,
  toggleDarkMode,
  user,
  onLogout,
  onQuickLoginDemo,
  onQuickLoginAdmin
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform border border-blue-400/30">
            CVB
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              MYCV BUILDER
              <span className="text-xs bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                PRO
              </span>
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">50 Modèles & Export PDF HD</p>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'dashboard' 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('navDashboard')}</span>
          </button>

          <button
            onClick={() => setCurrentView('gallery')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'gallery' 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{t('navTemplates')}</span>
          </button>

          <button
            onClick={() => setCurrentView('admin')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              currentView === 'admin' 
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' 
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{t('navAdmin')}</span>
          </button>
        </nav>

        {/* Right Actions & i18n */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            title={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Language Switcher FR / EN */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setLangue('fr')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                langue === 'fr' 
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => setLangue('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                langue === 'en' 
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          {/* User Status / Quick Login */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.nom}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{user.email}</span>
              </div>
              {user.role === 'ADMIN' && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  ADMIN
                </span>
              )}
              <button
                onClick={onLogout}
                title={t('logout')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onQuickLoginAdmin}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs flex items-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Connexion Admin</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

