// Utility to manage Service Worker registration and PWA installation prompts
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // In development mode or inside iframe previews, unregister service workers and clear caches
    if (import.meta.env.DEV || window.self !== window.top) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      }).catch(() => {});
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        }).catch(() => {});
      }
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
}

// Global hook for beforeinstallprompt event
let deferredPrompt: any = null;

export function initPwaInstallListener(callback?: (canInstall: boolean) => void) {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (callback) callback(true);
    window.dispatchEvent(new CustomEvent('pwa_can_install', { detail: true }));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (callback) callback(false);
    window.dispatchEvent(new CustomEvent('pwa_installed'));
    console.log('[PWA] MyCV Builder has been successfully installed');
  });
}

export async function promptPwaInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa_can_install', { detail: false }));
  return outcome === 'accepted';
}

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
