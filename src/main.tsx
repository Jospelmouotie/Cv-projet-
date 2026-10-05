import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { registerServiceWorker, initPwaInstallListener } from './utils/pwa';
import { captureReferralFromUrl } from './utils/referralSystem';
import { initErrorMonitoring } from './utils/errorMonitoring';

// Initialize error monitoring and capture incoming referral link
initErrorMonitoring();
captureReferralFromUrl();

// Register PWA Service Worker & install listener
registerServiceWorker();
initPwaInstallListener();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
