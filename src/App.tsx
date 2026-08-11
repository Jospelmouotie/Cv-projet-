import React, { useState, useEffect } from 'react';
import { User, CV, Language, CVTemplate, Section } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ImportModal } from './components/ImportModal';
import { PaymentModal } from './components/PaymentModal';
import { SplashScreen } from './components/SplashScreen';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { GalleryView } from './views/GalleryView';
import { EditorView } from './views/EditorView';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [langue, setLangue] = useState<Language>('fr');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'gallery' | 'editor' | 'admin'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cv_builder_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
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
  
  const [user, setUser] = useState<User | null>({
    id: 'u-admin',
    nom: 'Administrateur Jospel',
    email: 'mouotiejospel@gmail.com',
    role: 'ADMIN',
    langue: 'fr',
    createdAt: new Date().toISOString()
  });

  const [cvs, setCvs] = useState<CV[]>([]);
  const [activeCV, setActiveCV] = useState<CV | null>(null);
  const [editorInitialMode, setEditorInitialMode] = useState<'visual' | 'form'>('visual');
  const [paymentModalCV, setPaymentModalCV] = useState<CV | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Fetch CVs on mount or user change
  const fetchUserCVs = async () => {
    try {
      const userId = user?.id || 'u-demo-1';
      const res = await fetch(`/api/cv?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCvs(data.cvs || []);
      }
    } catch (err) {
      console.error('Error fetching CVs:', err);
    }
  };

  useEffect(() => {
    fetchUserCVs();
  }, [user]);

  // Create new CV from Template
  const handleCreateFromTemplate = async (template: CVTemplate, targetMode: 'visual' | 'form' = 'visual') => {
    try {
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilisateurId: user?.id || 'u-demo-1',
          titre: `Mon CV ${template.name}`,
          templateId: template.id,
          langue,
          couleurAccent: template.defaultAccent,
          police: template.defaultFont,
          isBlank: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchUserCVs();
        setActiveCV(data.cv);
        setEditorInitialMode(targetMode);
        setCurrentView('editor');
      }
    } catch (err) {
      console.error('Error creating CV:', err);
    }
  };

  // Create Blank CV from Scratch
  const handleCreateBlankCV = async () => {
    try {
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilisateurId: user?.id || 'u-demo-1',
          titre: 'Nouveau CV Vierge',
          templateId: 'moderne-1',
          langue,
          couleurAccent: '#2563EB',
          police: 'Inter',
          isBlank: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchUserCVs();
        setActiveCV(data.cv);
        setCurrentView('editor');
      }
    } catch (err) {
      console.error('Error creating blank CV:', err);
    }
  };

  // Create CV from Imported Sections
  const handleImportComplete = async (sections: Section[], defaultTitle: string) => {
    try {
      const res = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilisateurId: user?.id || 'u-demo-1',
          titre: defaultTitle,
          templateId: 'moderne-1',
          langue,
          couleurAccent: '#2563EB',
          police: 'Inter',
          sections
        })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchUserCVs();
        setActiveCV(data.cv);
        setCurrentView('editor');
      }
    } catch (err) {
      console.error('Error importing CV:', err);
    }
  };

  // Save CV update
  const handleSaveCV = async (updatedCV: CV) => {
    try {
      const res = await fetch(`/api/cv/${updatedCV.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCV)
      });

      if (res.ok) {
        const data = await res.json();
        setActiveCV(data.cv);
        fetchUserCVs();
      }
    } catch (err) {
      console.error('Error saving CV:', err);
    }
  };

  // Duplicate CV
  const handleDuplicateCV = async (cvId: string) => {
    try {
      const res = await fetch(`/api/cv/${cvId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.cv) {
          setCvs(prev => [data.cv, ...prev]);
        }
        await fetchUserCVs();
      }
    } catch (err) {
      console.error('Error duplicating CV:', err);
    }
  };

  // Rename CV
  const handleRenameCV = async (cvId: string, newTitle: string) => {
    if (newTitle && newTitle.trim()) {
      try {
        setCvs(prev => prev.map(c => c.id === cvId ? { ...c, titre: newTitle.trim() } : c));
        await fetch(`/api/cv/${cvId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titre: newTitle.trim() })
        });
        await fetchUserCVs();
      } catch (err) {
        console.error('Error renaming CV:', err);
      }
    }
  };

  // Delete CV
  const handleDeleteCV = async (cvId: string) => {
    try {
      setCvs(prev => prev.filter(c => c.id !== cvId));
      await fetch(`/api/cv/${cvId}`, { method: 'DELETE' });
      await fetchUserCVs();
    } catch (err) {
      console.error('Error deleting CV:', err);
    }
  };

  // Submit Mobile Money Payment
  const handleSubmitPayment = async (data: {
    cvId: string;
    numeroReception: string;
    numeroExpediteur: string;
    referenceTransaction: string;
  }) => {
    const res = await fetch('/api/paiement/soumettre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        utilisateurId: user?.id || 'u-demo-1'
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Erreur lors de la soumission');
    }

    const resData = await res.json();
    fetchUserCVs();
    if (activeCV && activeCV.id === data.cvId) {
      setActiveCV(resData.cv);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      {/* Central Navigation & Control Sidebar Drawer */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        langue={langue}
        setLangue={setLangue}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        user={user}
        onLogout={() => setUser(null)}
        onQuickLoginDemo={() => {
          setUser({
            id: 'u-demo-1',
            nom: 'Jean Dupont (Candidat)',
            email: 'jean.dupont@example.com',
            role: 'CANDIDAT',
            langue: 'fr',
            createdAt: new Date().toISOString()
          });
          setCurrentView('dashboard');
        }}
        onQuickLoginAdmin={() => {
          setUser({
            id: 'u-admin',
            nom: 'Administrateur Jospel',
            email: 'mouotiejospel@gmail.com',
            role: 'ADMIN',
            langue: 'fr',
            createdAt: new Date().toISOString()
          });
          setCurrentView('admin');
        }}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        hasActiveCv={!!activeCV}
      />

      {/* Header Bar with Toggle */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        langue={langue}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        user={user}
        activeCvTitle={activeCV?.titre}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <LandingView
            langue={langue}
            onStartCreate={handleCreateBlankCV}
            onBrowseTemplates={() => setCurrentView('gallery')}
            onImportClick={() => setShowImportModal(true)}
            onCreateBlankCV={handleCreateBlankCV}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            cvs={cvs}
            langue={langue}
            onCreateNew={() => setCurrentView('gallery')}
            onCreateBlankCV={handleCreateBlankCV}
            onImportClick={() => setShowImportModal(true)}
            onEditCV={(cv) => {
              setActiveCV(cv);
              setCurrentView('editor');
            }}
            onDuplicateCV={handleDuplicateCV}
            onRenameCV={handleRenameCV}
            onDeleteCV={handleDeleteCV}
            onPayOrExport={(cv) => {
              if (!user) {
                setShowAuthModal(true);
                return;
              }
              if (cv.statutPaiement === 'PAYE') {
                setActiveCV(cv);
                setCurrentView('editor');
              } else {
                setPaymentModalCV(cv);
              }
            }}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryView
            langue={langue}
            onSelectTemplate={handleCreateFromTemplate}
            onCreateBlankCV={handleCreateBlankCV}
          />
        )}

        {currentView === 'editor' && activeCV && (
          <EditorView
            cv={activeCV}
            user={user}
            langue={langue}
            initialMode={editorInitialMode}
            onBack={() => setCurrentView('dashboard')}
            onSaveCV={handleSaveCV}
            onOpenPayment={(cv) => setPaymentModalCV(cv)}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            langue={langue}
            onRefresh={fetchUserCVs}
          />
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          langue={langue}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setCurrentView('dashboard');
          }}
        />
      )}

      {showImportModal && (
        <ImportModal
          langue={langue}
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {paymentModalCV && (
        <PaymentModal
          cv={paymentModalCV}
          langue={langue}
          onClose={() => setPaymentModalCV(null)}
          onSubmitPayment={handleSubmitPayment}
        />
      )}

    </div>
  );
}
