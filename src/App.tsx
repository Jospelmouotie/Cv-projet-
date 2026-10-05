import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { User, CV, Language, CVTemplate, Section, SavedLetter, SubscriptionTier } from './types';
import { switchTemplateSafely } from './state/cvActions';
import { getPresetForTemplate, getCleanPresetForTemplate } from './data/templatePresets';
import { CV_TEMPLATES } from './data/templates';
import { translateCV } from './utils/cvTranslator';
import { Navbar } from './components/Navbar';
import { Sidebar, AppView } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ImportModal } from './components/ImportModal';
import { PaymentModal } from './components/PaymentModal';
import { UpgradePromptModal } from './components/UpgradePromptModal';
import { IKeePayModal } from './components/IKeePayModal';
import { SplashScreen } from './components/SplashScreen';
import { EditorChoiceModal } from './components/EditorChoiceModal';
import { EditorTransitionLoader } from './components/EditorTransitionLoader';
import { CVPickerModal } from './components/CVPickerModal';
import { DeviceAdviceModal } from './components/DeviceAdviceModal';
import { InteractiveGuidedTour } from './components/InteractiveGuidedTour';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { GalleryView } from './views/GalleryView';
import { EditorView } from './views/EditorView';
import { JobTargetingView } from './views/JobTargetingView';
import { LetterGeneratorView } from './views/LetterGeneratorView';
import { LettersDashboardView } from './views/LettersDashboardView';
import { LinkedInGeneratorView } from './views/LinkedInGeneratorView';
import { CVTranslatorView } from './views/CVTranslatorView';
import { JobLandingView, JobLandingRouteWrapper } from './views/JobLandingView';
import { JobCatalogView } from './views/JobCatalogView';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { isPaymentActive } from './utils/adminPaidMatrix';
import { EditorRouteHandler } from './components/EditorRouteHandler';
import { applyJobContext } from './utils/jobContext';
import { getJobLandingPageBySlug } from './data/jobLandingPages';
import { trackJobCvCreated } from './utils/jobAnalytics';
import {
  getActiveCVDraft,
  getLocalCVs,
  saveActiveCVDraft,
  saveLocalCVs,
  mergeServerAndLocalCVs,
  deleteLocalCV,
  clearLocalStorageOnLogout
} from './utils/cvDraftStorage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSplash, setShowSplash] = useState(false);
  const [langue, setLangue] = useState<Language>('fr');
  const [dashboardTypeFilter, setDashboardTypeFilter] = useState<'ALL' | 'ORIGINAL' | 'MODIFIED'>('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  const getCurrentViewFromPath = (): AppView => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/gallery') return 'gallery';
    if (path.startsWith('/editor')) return 'editor';
    if (path === '/letters') return 'letters';
    if (path === '/letters/generator') return 'letter-generator';
    if (path === '/tools/job-targeting') return 'job-targeting';
    if (path === '/tools/linkedin') return 'linkedin';
    if (path === '/tools/translate-cv') return 'translate-cv';
    if (path === '/admin') return 'admin';
    return 'home';
  };

  const currentView = getCurrentViewFromPath();

  const handleNavigateView = (view: AppView) => {
    switch (view) {
      case 'home': navigate('/'); break;
      case 'dashboard': navigate('/dashboard'); break;
      case 'gallery': navigate('/gallery'); break;
      case 'editor':
        if (activeCV) navigate(`/editor/${activeCV.id}`);
        else navigate('/editor');
        break;
      case 'letters': navigate('/letters'); break;
      case 'letter-generator': navigate('/letters/generator'); break;
      case 'job-targeting': navigate('/tools/job-targeting'); break;
      case 'linkedin': navigate('/tools/linkedin'); break;
      case 'translate-cv': navigate('/tools/translate-cv'); break;
      case 'admin': navigate('/admin'); break;
      default: navigate('/'); break;
    }
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cv_builder_theme');
      if (saved) return saved === 'dark';
      return true; // Mode sombre par défaut
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('cv_builder_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cv_builder_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cv_builder_user');
      if (savedUser) {
        try { return JSON.parse(savedUser); } catch (_) {}
      }
    }
    return null;
  });

  useEffect(() => {
    const initDatabaseSession = async () => {
      const token = localStorage.getItem('cv_builder_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('cv_builder_user', JSON.stringify(data.user));
              return;
            }
          }
        } catch (_) {}
      }

      // Aucun compte démo/guest automatique : si aucun jeton valide, l'utilisateur reste visiteur non connecté
      setUser(null);
    };

    initDatabaseSession();
  }, []);

  const [cvs, setCvs] = useState<CV[]>(() => getLocalCVs());
  const [lettersCount, setLettersCount] = useState<number>(0);
  const [activeCV, setActiveCV] = useState<CV | null>(() => getActiveCVDraft());
  const [editingLetter, setEditingLetter] = useState<SavedLetter | null>(null);
  const [editorInitialMode, setEditorInitialMode] = useState<'visual' | 'form'>('form');
  const [paymentModalCV, setPaymentModalCV] = useState<CV | null>(null);

  const handleSetLanguage = (newLang: Language) => {
    setLangue(newLang);
    if (activeCV) {
      const translated = translateCV(activeCV, newLang);
      setActiveCV(translated);
      saveActiveCVDraft(translated);
      setCvs(prev => prev.map(c => c.id === translated.id ? translated : c));
    }
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [resetTokenFromUrl, setResetTokenFromUrl] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditorChoiceModal, setShowEditorChoiceModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showIKeePayModal, setShowIKeePayModal] = useState(false);
  const [selectedPaymentTier, setSelectedPaymentTier] = useState<SubscriptionTier>('decouverte');
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const [showCVPicker, setShowCVPicker] = useState(false);
  const [pendingCareerAction, setPendingCareerAction] = useState<'lettre' | 'linkedin' | 'offre' | 'export' | null>(null);
  const [showDeviceAdviceModal, setShowDeviceAdviceModal] = useState(false);

  const currentUserTier: SubscriptionTier = (user?.role === 'ADMIN' || user?.subscriptionTier === 'premium') ? 'premium' : (user?.subscriptionTier || 'freemium');

  const fetchUserCVs = async (targetUser?: User | null) => {
    const currentUser = targetUser !== undefined ? targetUser : user;
    const token = localStorage.getItem('cv_builder_token');
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/cv', { headers });
      if (res.ok) {
        const data = await res.json();
        const serverCvs: CV[] = data.cvs || [];
        const merged = mergeServerAndLocalCVs(serverCvs, currentUser?.id);
        setCvs(merged);
        saveLocalCVs(merged, currentUser?.id);

        if (merged.length > 0) {
          // If activeCV belongs to a different user, re-select
          if (!activeCV || (currentUser && activeCV.userId && activeCV.userId !== currentUser.id)) {
            const draft = getActiveCVDraft(currentUser?.id) || merged[0];
            setActiveCV(draft);
          }
        } else if (currentUser) {
          // New user with no CVs yet: create their personal starter CV
          const initialPreset = getPresetForTemplate('modele-1', langue || 'fr');
          const newCvPayload: CV = {
            ...initialPreset,
            id: `cv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            titre: 'Mon CV Professionnel',
            templateId: 'modele-1',
            langue: langue || 'fr',
            utilisateurId: currentUser.id,
            userId: currentUser.id,
            statutPaiement: 'PAYE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setCvs([newCvPayload]);
          setActiveCV(newCvPayload);
          saveActiveCVDraft(newCvPayload, currentUser.id);

          if (token) {
            fetch('/api/cv', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(newCvPayload)
            }).catch(e => console.warn('Auto-save starter CV warning:', e));
          }
        }
      } else {
        const local = getLocalCVs(currentUser?.id);
        if (local.length > 0) setCvs(local);
      }
    } catch (err) {
      console.warn('Network error fetching CVs, using local cache:', err);
      const local = getLocalCVs(currentUser?.id);
      if (local.length > 0) setCvs(local);
    }
  };

  const fetchLettersCount = async () => {
    try {
      const token = localStorage.getItem('cv_builder_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/lettres', { headers });
      if (res.ok) {
        const data = await res.json();
        setLettersCount(data.letters ? data.letters.length : 0);
      }
    } catch (err) {
      console.warn('Network error fetching letters count:', err);
    }
  };

  useEffect(() => {
    fetchUserCVs();
    fetchLettersCount();
  }, [user]);

  // Check URL parameters on mount for reset_token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('reset_token') || params.get('resetToken');
      if (token) {
        setResetTokenFromUrl(token);
        setAuthModalInitialMode('reset');
        setShowAuthModal(true);
      }
    }
  }, []);

  const handleOpenExportPicker = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setPendingCareerAction('export');
    setShowCVPicker(true);
  };

  const handleSelectCVForExport = (selectedCV: CV) => {
    setShowCVPicker(false);
    setActiveCV(selectedCV);
    setLoadingMessage(
      langue === 'en' ? 'Preparing your CV...' :
      langue === 'ar' ? 'جاري تحضير السيرة...' :
      'Préparation du CV...'
    );
    setIsEditorLoading(true);
    navigate(`/editor/${selectedCV.id}`);
    setTimeout(() => setIsEditorLoading(false), 400);
    setPendingCareerAction(null);
  };

  const handleNavigateToEditor = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      setShowDeviceAdviceModal(true);
    } else {
      setShowEditorChoiceModal(true);
    }
  };

  const handleCreateFromTemplate = async (
    template: CVTemplate,
    targetMode: 'visual' | 'form' = 'form',
    jobSlug?: string
  ) => {
    try {
      setLoadingMessage(
        langue === 'en' ? `Loading "${template.name}"...` :
        langue === 'ar' ? `جاري تحميل "${template.name}"...` :
        `Chargement "${template.name}"...`
      );
      setIsEditorLoading(true);

      const samplePreset = getPresetForTemplate(template.id, langue);
      const chosenAccent = template.defaultAccent || samplePreset.couleurAccent || '#2563EB';
      const chosenSecondary = template.defaultSecondaryAccent || samplePreset.couleurAccentSecondaire || '#60A5FA';
      const chosenFond = samplePreset.couleurFond || '#FFFFFF';
      const chosenSidebarBg = samplePreset.couleurFondSidebar || (template.layoutFamily === 'single-column' ? '#FFFFFF' : '#F8FAFC');
      const chosenText = samplePreset.couleurTexte || '#1E293B';
      const chosenSidebarText = samplePreset.couleurTexteSidebar || '#1E293B';
      const chosenTitle = samplePreset.couleurTitreSection || chosenAccent;
      const chosenSidebarTitle = samplePreset.couleurTitreSectionSidebar || chosenAccent;

      const token = localStorage.getItem('cv_builder_token');
      let createdCV: CV | null = null;

      if (token) {
        try {
          const res = await fetch('/api/cv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              titre: `Mon CV ${template.name}`,
              templateId: template.id,
              langue,
              couleurAccent: chosenAccent,
              couleurAccentSecondaire: chosenSecondary,
              couleurFond: chosenFond,
              couleurFondSidebar: chosenSidebarBg,
              couleurTexte: chosenText,
              couleurTexteSidebar: chosenSidebarText,
              couleurTitreSection: chosenTitle,
              couleurTitreSectionSidebar: chosenSidebarTitle,
              couleurFondProfil: samplePreset.couleurFondProfil,
              couleurTexteProfil: samplePreset.couleurTexteProfil,
              police: template.defaultFont || samplePreset.police || 'Inter',
              isBlank: false,
              sections: JSON.parse(JSON.stringify(samplePreset.sections))
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.cv) {
              createdCV = {
                ...samplePreset,
                ...data.cv,
                sections: (data.cv.sections && data.cv.sections.length > 0)
                  ? data.cv.sections
                  : JSON.parse(JSON.stringify(samplePreset.sections))
              };
            }
          }
        } catch (fetchErr) {
          console.warn('API error creating CV:', fetchErr);
        }
      }

      if (!createdCV) {
        // Fallback seamless local creation with 100% full realistic content
        createdCV = {
          ...samplePreset,
          id: `cv-${Date.now()}`,
          utilisateurId: user?.id || 'demo-user',
          titre: `Mon CV ${template.name}`,
          templateId: template.id,
          langue,
          couleurAccent: chosenAccent,
          couleurAccentSecondaire: chosenSecondary,
          couleurFond: chosenFond,
          couleurFondSidebar: chosenSidebarBg,
          couleurTexte: chosenText,
          couleurTexteSidebar: chosenSidebarText,
          couleurTitreSection: chosenTitle,
          couleurTitreSectionSidebar: chosenSidebarTitle,
          police: template.defaultFont || samplePreset.police || 'Inter',
          afficherPhoto: true,
          statutPaiement: 'NON_PAYE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sections: JSON.parse(JSON.stringify(samplePreset.sections))
        };
        setCvs(prev => [createdCV!, ...prev]);
      }

      // Apply programmatic SEO job context if created from a job landing page
      if (jobSlug && createdCV) {
        createdCV = applyJobContext(createdCV, jobSlug);
        const job = getJobLandingPageBySlug(jobSlug);
        if (job) {
          trackJobCvCreated(job.slug, job.metier);
        }
      }

      saveActiveCVDraft(createdCV);
      setActiveCV(createdCV);
      setEditorInitialMode(targetMode || 'form');
      navigate(`/editor/${createdCV.id}`);
      if (token) fetchUserCVs();
    } catch (err) {
      console.warn('Error creating CV:', err);
    } finally {
      setTimeout(() => setIsEditorLoading(false), 400);
    }
  };

  const handleCreateCVWithJob = async (jobSlug: string, templateIdOverride?: string) => {
    const job = getJobLandingPageBySlug(jobSlug);
    const templateId = templateIdOverride || job?.templateRecommandeId || 'modele-1';
    const template = CV_TEMPLATES.find(t => t.id === templateId) || CV_TEMPLATES[0];
    await handleCreateFromTemplate(template, 'form', jobSlug);
  };

  const handleCreateAdminModelBuilder = () => {
    const createdCV: CV = {
      id: `cv-admin-model-${Date.now()}`,
      utilisateurId: user?.id || 'admin-builder',
      userId: user?.id || 'admin-builder',
      titre: 'Nouveau modèle admin',
      templateId: 'modele-1',
      langue,
      couleurAccent: '#0F172A',
      couleurAccentSecondaire: '#E2E8F0',
      couleurFond: '#FFFFFF',
      couleurFondSidebar: '#F8FAFC',
      couleurTexte: '#111827',
      couleurTexteSidebar: '#111827',
      couleurTitreSection: '#111827',
      couleurTitreSectionSidebar: '#111827',
      police: 'Inter',
      nombreColonnes: 1,
      positionSidebar: 'gauche',
      largeurColonneGauche: 30,
      afficherPhoto: false,
      statutPaiement: 'NON_PAYE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBlank: true,
      sections: [],
      profil: {},
      photoUrl: '',
      styleEnTete: 'clean',
      styleEnTeteSection: 'underline',
      ...( { asAdminTemplateBuilder: true } as any )
    };

    saveActiveCVDraft(createdCV);
    setCvs(prev => [createdCV, ...prev]);
    setActiveCV(createdCV);
    setEditorInitialMode('form');
    navigate(`/editor/${createdCV.id}`);
  };

  const handleCreateBlankCV = async () => {
    try {
      setLoadingMessage(
        langue === 'en' ? 'Creating blank canvas...' :
        langue === 'ar' ? 'إنشاء صفحة فارغة...' :
        'Création de la page vierge...'
      );
      setIsEditorLoading(true);

      const token = localStorage.getItem('cv_builder_token');
      let createdCV: CV | null = null;

      if (token) {
        try {
          const res = await fetch('/api/cv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              titre: 'Nouveau CV Vierge',
              templateId: 'modele-1',
              langue,
              couleurAccent: '#000000',
              police: 'Inter',
              isBlank: true
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.cv) {
              createdCV = data.cv;
            }
          }
        } catch (fetchErr) {
          console.warn('API error creating blank CV:', fetchErr);
        }
      }

      if (!createdCV) {
        createdCV = {
          id: `cv-${Date.now()}`,
          utilisateurId: user?.id || 'demo-user',
          titre: 'Nouveau CV Vierge',
          templateId: 'modele-1',
          langue,
          couleurAccent: '#000000',
          couleurAccentSecondaire: '#000000',
          couleurFond: '#FFFFFF',
          couleurFondSidebar: '#FFFFFF',
          couleurTexte: '#000000',
          couleurTexteSidebar: '#000000',
          couleurTitreSection: '#000000',
          couleurTitreSectionSidebar: '#000000',
          police: 'Inter',
          nombreColonnes: 1,
          positionSidebar: 'gauche',
          largeurColonneGauche: 30,
          afficherPhoto: false,
          statutPaiement: 'NON_PAYE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isBlank: true,
          sections: [],
          profil: {},
          photoUrl: '',
          styleEnTete: 'clean',
          styleEnTeteSection: 'underline'
        };
        setCvs(prev => [createdCV!, ...prev]);
      }

      saveActiveCVDraft(createdCV);
      setActiveCV(createdCV);
      setEditorInitialMode('form');
      navigate(`/editor/${createdCV.id}`);
      if (token) fetchUserCVs();
    } catch (err) {
      console.warn('Error creating blank CV:', err);
    } finally {
      setTimeout(() => setIsEditorLoading(false), 400);
    }
  };

  const handleImportComplete = async (sections: Section[], defaultTitle: string) => {
    try {
      const token = localStorage.getItem('cv_builder_token');
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titre: defaultTitle,
          templateId: 'modele-1',
          langue,
          couleurAccent: '#000000',
          police: 'Inter',
          sections
        })
      });

      if (res.ok) {
        const data = await res.json();
        saveActiveCVDraft(data.cv);
        setActiveCV(data.cv);
        navigate(`/editor/${data.cv.id}`);
        fetchUserCVs();
      }
    } catch (err) {
      console.warn('Network error importing CV:', err);
    }
  };

  const handleApplyTemplateToActiveCV = async (template: CVTemplate) => {
    if (!activeCV) return;
    const remapped = switchTemplateSafely(activeCV, template);
    saveActiveCVDraft(remapped);
    setActiveCV(remapped);
    await handleSaveCV(remapped);
    navigate(`/editor/${remapped.id}`);
  };

  const handleSaveCV = async (updatedCV: CV) => {
    saveActiveCVDraft(updatedCV);
    setActiveCV(updatedCV);
    setCvs(prev => {
      const updated = prev.map(c => c.id === updatedCV.id ? updatedCV : c);
      if (!updated.some(c => c.id === updatedCV.id)) {
        return [updatedCV, ...updated];
      }
      return updated;
    });

    try {
      const token = localStorage.getItem('cv_builder_token');
      if (token) {
        let res = await fetch(`/api/cv/${updatedCV.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedCV)
        });

        // If CV is new (e.g. newly created targeted CV), fallback to POST
        if (res.status === 404) {
          res = await fetch('/api/cv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updatedCV)
          });
        }

        if (res.ok) {
          const data = await res.json();
          if (data.cv) {
            const finalCV = { ...updatedCV, ...data.cv };
            setActiveCV(finalCV);
            saveActiveCVDraft(finalCV);
            setCvs(prev => {
              const updated = prev.map(c => (c.id === updatedCV.id || c.id === finalCV.id) ? finalCV : c);
              if (!updated.some(c => c.id === finalCV.id)) {
                return [finalCV, ...updated];
              }
              return updated;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Network error saving CV to server (saved locally):', err);
    }
  };

  const handleDuplicateCV = async (cvId: string) => {
    try {
      const token = localStorage.getItem('cv_builder_token');
      const res = await fetch(`/api/cv/${cvId}/duplicate`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cv) {
          saveActiveCVDraft(data.cv);
          setCvs(prev => [data.cv, ...prev]);
        }
        fetchUserCVs();
      }
    } catch (err) {
      console.warn('Network error duplicating CV:', err);
    }
  };

  const handleRenameCV = async (cvId: string, newTitle: string) => {
    if (newTitle && newTitle.trim()) {
      const trimmed = newTitle.trim();
      setCvs(prev => prev.map(c => {
        if (c.id === cvId) {
          const updated = { ...c, titre: trimmed, titreCV: trimmed };
          saveActiveCVDraft(updated);
          return updated;
        }
        return c;
      }));
      if (activeCV && activeCV.id === cvId) {
        const updated = { ...activeCV, titre: trimmed, titreCV: trimmed };
        setActiveCV(updated);
        saveActiveCVDraft(updated);
      }
      try {
        const token = localStorage.getItem('cv_builder_token');
        if (token) {
          await fetch(`/api/cv/${cvId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ titre: trimmed })
          });
        }
      } catch (err) {
        console.warn('Network error renaming CV:', err);
      }
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    deleteLocalCV(cvId);
    setCvs(prev => prev.filter(c => c.id !== cvId));
    if (activeCV && activeCV.id === cvId) {
      const remaining = cvs.filter(c => c.id !== cvId);
      setActiveCV(remaining.length > 0 ? remaining[0] : null);
    }
    try {
      const token = localStorage.getItem('cv_builder_token');
      if (token) {
        await fetch(`/api/cv/${cvId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn('Network error deleting CV:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans flex flex-col transition-colors duration-200">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <InteractiveGuidedTour
        isOpen={showGuidedTour}
        onClose={() => setShowGuidedTour(false)}
        langue={langue}
      />

      <Sidebar
        currentView={currentView}
        setCurrentView={handleNavigateView}
        langue={langue}
        setLangue={handleSetLanguage}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
        onLogout={() => {
          localStorage.removeItem('cv_builder_token');
          localStorage.removeItem('cv_builder_user');
          setUser(null);
          navigate('/');
        }}
        onQuickLoginDemo={async () => {
          try {
            const res = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nom: 'Jean Dupont', email: `demo-${Date.now()}@exemple.com`, motDePasse: 'demo123456', langue: 'fr' })
            });
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem('cv_builder_token', data.token);
              localStorage.setItem('cv_builder_user', JSON.stringify(data.user));
              setUser(data.user);
            }
          } catch (e) {}
          navigate('/dashboard');
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        hasActiveCv={!!activeCV}
        onOpenEditorChoice={handleNavigateToEditor}
        onCreateBlankCV={handleCreateBlankCV}
        onOpenLetterGenerator={() => { setEditingLetter(null); navigate('/letters/generator'); }}
        onOpenLinkedInGenerator={() => navigate('/tools/linkedin')}
        onOpenJobTargeting={() => navigate('/tools/job-targeting')}
        onOpenTranslator={() => navigate('/tools/translate-cv')}
        onOpenExportPDF={handleOpenExportPicker}
        onOpenModifiedCVs={() => { setDashboardTypeFilter('MODIFIED'); navigate('/dashboard'); }}
        onOpenLettersDashboard={() => navigate('/letters')}
        onOpenUpgradeModal={(tier) => {
          if (!isPaymentActive()) return;
          if (tier) setSelectedPaymentTier(tier);
          setShowUpgradeModal(true);
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      <Navbar
        currentView={currentView}
        setCurrentView={handleNavigateView}
        langue={langue}
        setLangue={handleSetLanguage}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        user={user}
        activeCvTitle={activeCV?.titre}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      <main className="flex-1 bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={
            <LandingView
              langue={langue}
              onStartCreate={handleCreateBlankCV}
              onBrowseTemplates={() => navigate('/gallery')}
              onImportClick={() => setShowImportModal(true)}
              onCreateBlankCV={handleCreateBlankCV}
              onOpenLetterGenerator={() => { setEditingLetter(null); navigate('/letters/generator'); }}
              onOpenLinkedInGenerator={() => navigate('/tools/linkedin')}
              onOpenJobTargeting={() => navigate('/tools/job-targeting')}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
              onSelectTemplate={(templateId) => {
                const found = CV_TEMPLATES.find(t => t.id === templateId);
                if (found) {
                  handleCreateFromTemplate(found, 'form');
                } else {
                  navigate('/gallery');
                }
              }}
            />
          } />

          <Route path="/dashboard" element={
            <DashboardView
              cvs={cvs}
              langue={langue}
              lettersCount={lettersCount}
              initialTypeFilter={dashboardTypeFilter}
              onCreateNew={() => navigate('/gallery')}
              onCreateBlankCV={handleCreateBlankCV}
              onImportClick={() => setShowImportModal(true)}
              onEditCV={(cv) => {
                setActiveCV(cv);
                navigate(`/editor/${cv.id}`);
              }}
              onDuplicateCV={handleDuplicateCV}
              onRenameCV={handleRenameCV}
              onDeleteCV={handleDeleteCV}
              onPayOrExport={(cv) => {
                if (!user) { setShowAuthModal(true); return; }
                setActiveCV(cv);
                navigate(`/editor/${cv.id}`);
              }}
              onGoToTranslator={(cv) => {
                setActiveCV(cv);
                navigate('/tools/translate-cv');
              }}
              onGoToLetters={() => navigate('/letters')}
              onGoToJobTargeting={() => navigate('/tools/job-targeting')}
              onGoToLetterGenerator={() => { setEditingLetter(null); navigate('/letters/generator'); }}
              onGoToLinkedIn={() => navigate('/tools/linkedin')}
            />
          } />

          <Route path="/letters" element={
            <LettersDashboardView
              cvs={cvs}
              langue={langue}
              onEditLetter={(letter) => {
                setEditingLetter(letter);
                navigate('/letters/generator');
              }}
              onCreateNewLetter={() => { setEditingLetter(null); navigate('/letters/generator'); }}
              onGoToJobTargeting={() => navigate('/tools/job-targeting')}
              onGoToDashboard={() => navigate('/dashboard')}
            />
          } />

          <Route path="/letters/generator" element={
            <LetterGeneratorView
              cvs={cvs}
              activeCV={activeCV}
              langue={langue}
              letterToEdit={editingLetter}
              initialLetter={editingLetter}
              userTier={currentUserTier}
              onLetterSaved={fetchLettersCount}
              onSaveLetter={async () => {
                fetchLettersCount();
              }}
              onGoToDashboard={() => navigate('/dashboard')}
              onGoToLettersDashboard={() => { fetchLettersCount(); navigate('/letters'); }}
              onBackToLetters={() => { fetchLettersCount(); navigate('/letters'); }}
              onOpenUpgrade={() => setShowUpgradeModal(true)}
              onOpenPayment={() => {
                setSelectedPaymentTier('classique');
                setShowIKeePayModal(true);
              }}
            />
          } />

          <Route path="/tools/job-targeting" element={
            <JobTargetingView
              cvs={cvs}
              activeCV={activeCV}
              langue={langue}
              onApplyPersonalizedCV={async (newCv) => {
                await handleSaveCV(newCv);
                fetchUserCVs();
                setActiveCV(newCv);
              }}
              onSavePersonalizedLetter={async (newLetter) => {
                try {
                  const token = localStorage.getItem('cv_builder_token');
                  await fetch('/api/lettres', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(newLetter)
                  });
                  fetchLettersCount();
                } catch (err) {
                  console.warn('Error saving letter from job targeting:', err);
                }
              }}
              onOpenCVEditor={(cv) => {
                setActiveCV(cv);
                navigate(`/editor/${cv.id}`);
              }}
              onOpenLetterEditor={(letter) => {
                setEditingLetter(letter);
                navigate('/letters/generator');
              }}
              onCVPersonalized={(newCv) => {
                fetchUserCVs();
                setActiveCV(newCv);
                navigate(`/editor/${newCv.id}`);
              }}
              onLetterGenerated={() => { fetchLettersCount(); navigate('/letters'); }}
              onGoToDashboard={() => navigate('/dashboard')}
              onGoToLetters={() => { fetchLettersCount(); navigate('/letters'); }}
            />
          } />

          <Route path="/tools/linkedin" element={
            <LinkedInGeneratorView
              cvs={cvs}
              activeCV={activeCV}
              langue={langue}
              onGoToDashboard={() => navigate('/dashboard')}
            />
          } />

          <Route path="/tools/translate-cv" element={
            <CVTranslatorView
              cvList={cvs}
              activeCv={activeCV}
              activeCV={activeCV}
              langue={langue}
              userTier={currentUserTier}
              onSaveCv={(newCv) => {
                handleSaveCV(newCv);
                fetchUserCVs();
              }}
              onOpenCvInEditor={(cv) => {
                setActiveCV(cv);
                navigate('/editor');
              }}
              onOpenUpgradeModal={(tier) => {
                if (tier) setSelectedPaymentTier(tier);
                setShowUpgradeModal(true);
              }}
              onBackToDashboard={() => navigate('/dashboard')}
            />
          } />

          <Route path="/gallery" element={
            <GalleryView
              langue={langue}
              userTier={currentUserTier}
              onSelectTemplate={handleCreateFromTemplate}
              onCreateBlankCV={handleCreateBlankCV}
              activeCV={activeCV}
              onApplyToActiveCV={handleApplyTemplateToActiveCV}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
            />
          } />

          <Route path="/editor" element={
            (() => {
              const targetId = activeCV?.id || getActiveCVDraft()?.id || (cvs.length > 0 ? cvs[0].id : null);
              return targetId ? <Navigate to={`/editor/${targetId}`} replace /> : <Navigate to="/gallery" replace />;
            })()
          } />

          <Route path="/editor/:id" element={
            <EditorRouteHandler
              activeCV={activeCV}
              setActiveCV={setActiveCV}
              cvs={cvs}
              user={user}
              langue={langue}
              initialMode={editorInitialMode}
              onSaveCV={handleSaveCV}
              onOpenPayment={(_cv) => setShowUpgradeModal(true)}
              onOpenAuth={() => setShowAuthModal(true)}
            />
          } />

          <Route path="/admin" element={
            user?.role === 'ADMIN' ? (
              <AdminPanel
                langue={langue}
                onRefresh={fetchUserCVs}
                onCreateAdminModel={handleCreateAdminModelBuilder}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Programmatic SEO: Modèles de CV par Métier */}
          <Route path="/cv-metiers" element={
            <JobCatalogView
              langue={langue}
              userTier={currentUserTier}
              onCreateCVWithJob={handleCreateCVWithJob}
            />
          } />

          <Route path="/modeles-cv-par-metier" element={<Navigate to="/cv-metiers" replace />} />

          <Route path="/cv-:jobSlug" element={
            <JobLandingRouteWrapper
              langue={langue}
              userTier={currentUserTier}
              onCreateCVWithJob={handleCreateCVWithJob}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
            />
          } />

          {/* Dynamic route matching /cv-comptable or job slug directly */}
          <Route path="/:jobSlug" element={
            <JobLandingRouteWrapper
              langue={langue}
              userTier={currentUserTier}
              onCreateCVWithJob={handleCreateCVWithJob}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
            />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          langue={langue}
          initialMode={authModalInitialMode}
          initialResetToken={resetTokenFromUrl}
          onClose={() => {
            setShowAuthModal(false);
            setAuthModalInitialMode('login');
            setResetTokenFromUrl('');
            if (typeof window !== 'undefined' && (window.location.search.includes('reset_token') || window.location.search.includes('resetToken'))) {
              const url = new URL(window.location.href);
              url.searchParams.delete('reset_token');
              url.searchParams.delete('resetToken');
              url.searchParams.delete('email');
              window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            }
          }}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setShowAuthModal(false);
            setAuthModalInitialMode('login');
            setResetTokenFromUrl('');
            if (typeof window !== 'undefined' && (window.location.search.includes('reset_token') || window.location.search.includes('resetToken'))) {
              const url = new URL(window.location.href);
              url.searchParams.delete('reset_token');
              url.searchParams.delete('resetToken');
              url.searchParams.delete('email');
              window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
            }
            if (window.location.pathname === '/') {
              navigate('/dashboard');
            }
          }}
        />
      )}

      {showProfileModal && user && (
        <ProfileModal
          user={user}
          langue={langue}
          onClose={() => setShowProfileModal(false)}
          onLogout={() => {
            clearLocalStorageOnLogout();
            setUser(null);
            setCvs([]);
            setActiveCV(null);
            setShowProfileModal(false);
            navigate('/');
          }}
          onSelectLanguage={handleSetLanguage}
          onUserUpdated={(updatedUser) => {
            setUser(updatedUser);
          }}
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        />
      )}

      {showImportModal && (
        <ImportModal
          langue={langue}
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {showUpgradeModal && isPaymentActive() && (
        <UpgradePromptModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          langue={langue}
          currentTier={currentUserTier}
          onSelectPlan={(tier) => {
            setShowUpgradeModal(false);
            if (tier !== 'freemium') {
              setSelectedPaymentTier(tier);
              setShowIKeePayModal(true);
            }
          }}
        />
      )}

      {showIKeePayModal && (
        <IKeePayModal
          isOpen={showIKeePayModal}
          onClose={() => setShowIKeePayModal(false)}
          tier={selectedPaymentTier}
          user={user}
          langue={langue}
          onSuccess={(newTier) => {
            const updatedUser = {
              ...(user || { id: 'u-demo-1', nom: 'Candidat', email: 'candidat@exemple.com', langue }),
              subscriptionTier: newTier,
              subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
            setUser(updatedUser);
            localStorage.setItem('cv_builder_user', JSON.stringify(updatedUser));
            setShowIKeePayModal(false);
          }}
        />
      )}

      {showEditorChoiceModal && (
        <EditorChoiceModal
          langue={langue}
          onClose={() => setShowEditorChoiceModal(false)}
          onSelectTemplate={(template) => handleCreateFromTemplate(template, 'form')}
          onCreateBlankCV={handleCreateBlankCV}
          activeCV={activeCV}
          onContinueActiveCV={() => {
            setLoadingMessage(
              langue === 'en' ? 'Loading editor...' :
              langue === 'ar' ? 'جاري فتح المحرر...' :
              'Chargement de l\'éditeur...'
            );
            setIsEditorLoading(true);
            setEditorInitialMode('form');
            if (activeCV) navigate(`/editor/${activeCV.id}`);
            else navigate('/dashboard');
            setTimeout(() => setIsEditorLoading(false), 400);
          }}
        />
      )}

      {showDeviceAdviceModal && (
        <DeviceAdviceModal
          isOpen={showDeviceAdviceModal}
          onClose={() => setShowDeviceAdviceModal(false)}
          onContinue={() => setShowEditorChoiceModal(true)}
          langue={langue}
        />
      )}

      {showCVPicker && (
        <CVPickerModal
          isOpen={showCVPicker}
          onClose={() => {
            setShowCVPicker(false);
            setPendingCareerAction(null);
          }}
          cvs={cvs}
          langue={langue}
          actionType={pendingCareerAction || 'export'}
          onSelectCV={handleSelectCVForExport}
          onCreateNewCV={() => {
            setShowCVPicker(false);
            setShowEditorChoiceModal(true);
          }}
        />
      )}

      {isEditorLoading && (
        <EditorTransitionLoader
          langue={langue}
          message={loadingMessage}
        />
      )}

      {/* PWA Mobile & Desktop Install Prompt */}
      <PWAInstallBanner langue={langue} />
    </div>
  );
}