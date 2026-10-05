import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, ExternalLink, Monitor, CheckCircle2 } from 'lucide-react';
import { promptPwaInstall, isPwaInstalled } from '../utils/pwa';
import { Language } from '../types';

interface PWAInstallBannerProps {
  langue: Language;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ langue }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('android');
  
  const isAr = langue === 'ar';
  const isEn = langue === 'en';

  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    // Set initial tab based on device
    if (isIos) {
      setActiveTab('ios');
    } else if (isAndroid) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    if (dismissed || isPwaInstalled()) {
      setIsDismissed(true);
      return;
    }

    // Always allow banner unless already installed or dismissed
    setCanInstall(true);

    const handleCanInstall = () => {
      if (!isPwaInstalled()) {
        setCanInstall(true);
      }
    };

    window.addEventListener('pwa_can_install', handleCanInstall);
    return () => {
      window.removeEventListener('pwa_can_install', handleCanInstall);
    };
  }, [isIos, isAndroid]);

  const handleInstallClick = async () => {
    // If inside iframe, open standalone tab where native install prompt is allowed
    if (isInIframe) {
      window.open(window.location.href, '_blank');
      return;
    }

    if (isIos) {
      setShowGuideModal(true);
      return;
    }

    const success = await promptPwaInstall();
    if (success) {
      setCanInstall(false);
      setIsDismissed(true);
    } else {
      // If native prompt not supported or rejected, show the guide
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!canInstall || isDismissed) return null;

  return (
    <>
      <aside 
        aria-label="Installation de l'application MyCV Builder"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-neutral-900/95 backdrop-blur-md border border-blue-500/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                <span>
                  {isAr ? 'تطبيق MyCV Builder (PWA)' : isEn ? 'MyCV Builder App (PWA)' : 'Application Mobile MyCV Builder'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PWA
                </span>
              </h3>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
              {isInIframe
                ? 'Installez MyCV Builder sur votre écran d\'accueil pour l\'utiliser comme une application native rapide et hors-ligne !'
                : isAr
                ? 'استخدم التطبيق كأنه تطبيق هاتف أصلي مع وصول سريع وإشعارات بالجديد !'
                : isEn
                ? 'Enjoy fast native access, offline mode & instant free-feature alerts directly on your device!'
                : 'Accès ultra-rapide, mode hors-ligne et notifications directes sur votre smartphone ou PC.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {isInIframe ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir & Installer l'App</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تثبيت الآن' : isEn ? 'Install Now' : 'Installer l\'application'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Guide
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-2 py-1.5 rounded-xl text-neutral-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                {isAr ? 'لاحقاً' : isEn ? 'Later' : 'Plus tard'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive Universal PWA Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  CV
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Installation de l'Application (PWA)
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Accessible sans téléchargement depuis l'App Store
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowGuideModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'android' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iOS</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'desktop' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Mac</span>
              </button>
            </div>

            {/* Android Instructions */}
            {activeTab === 'android' && (
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Ouvrez le site dans <strong>Google Chrome</strong> ou <strong>Samsung Internet</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Appuyez sur le menu (les <strong>3 petits points</strong> en haut à droite).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</span>
                </div>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Ouvrez le site dans <strong>Safari</strong> sur votre iPhone/iPad.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Appuyez sur l'icône <strong>Partager</strong> <Share2 className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> au bas de l'écran.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Faites défiler et choisissez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> puis appuyez sur <strong>Ajouter</strong>.</span>
                </div>
              </div>
            )}

            {/* Desktop / PC Instructions */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Dans <strong>Chrome</strong> ou <strong>Edge</strong>, cliquez sur l'icône d'installation <Download className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> située à droite dans la barre d'adresse URL.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Cliquez sur <strong>« Installer »</strong> pour lancer l'application en fenêtre indépendante et l'épingler à votre barre des tâches.</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.open(window.location.href, '_blank');
                  setShowGuideModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ouvrir dans un nouvel onglet</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
