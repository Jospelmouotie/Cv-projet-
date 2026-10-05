import React, { useState } from 'react';
import { X, Check, Lock, Globe, User as UserIcon, LogOut, Key, Shield, Sparkles } from 'lucide-react';
import { Language, User } from '../types';
import { isPaymentActive } from '../utils/adminPaidMatrix';

interface ProfileModalProps {
  user: User;
  langue: Language;
  onClose: () => void;
  onLogout: () => void;
  onSelectLanguage: (lang: Language) => void;
  onUserUpdated: (updatedUser: User) => void;
  onOpenUpgradeModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  langue,
  onClose,
  onLogout,
  onSelectLanguage,
  onUserUpdated,
  onOpenUpgradeModal
}) => {
  const [nom, setNom] = useState(user.nom || '');
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [msgInfo, setMsgInfo] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const initial = (user.nom || user.email || 'U').charAt(0).toUpperCase();

  const parseJsonResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(res.ok ? 'Réponse inattendue du serveur.' : `Erreur serveur (${res.status}). Veuillez réessayer dans un instant.`);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingName(true);
    setMsgInfo(null);

    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nom, langue })
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du nom.');
      }

      onUserUpdated(data.user);
      localStorage.setItem('cv_builder_user', JSON.stringify(data.user));
      setMsgInfo({ text: 'Informations du profil enregistrées avec succès !', type: 'success' });
    } catch (err: any) {
      setMsgInfo({ text: err.message || 'Erreur réseau.', type: 'error' });
    } finally {
      setLoadingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nouveauMotDePasse !== confirmMotDePasse) {
      setMsgInfo({ text: 'Les deux nouveaux mots de passe ne correspondent pas.', type: 'error' });
      return;
    }
    if (nouveauMotDePasse.length < 8) {
      setMsgInfo({ text: 'Le mot de passe doit comporter au moins 8 caractères.', type: 'error' });
      return;
    }

    setLoadingPass(true);
    setMsgInfo(null);

    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ancienMotDePasse, nouveauMotDePasse })
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du changement de mot de passe.');
      }

      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmMotDePasse('');
      setMsgInfo({ text: 'Mot de passe modifié avec succès !', type: 'success' });
    } catch (err: any) {
      setMsgInfo({ text: err.message || 'Erreur réseau.', type: 'error' });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir={langue === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white text-neutral-950 font-black text-lg flex items-center justify-center shadow-md shrink-0">
              {initial}
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white leading-snug">
                Mon Profil & Paramètres
              </h2>
              <p className="text-xs text-neutral-400">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {msgInfo && (
            <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
              msgInfo.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/50 border-red-500/40 text-red-300'
            }`}>
              <span>{msgInfo.text}</span>
              <button type="button" onClick={() => setMsgInfo(null)} className="opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 1. Mon Nom / Nom d'utilisateur */}
          <form onSubmit={handleSaveName} className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider text-white">
                Identité & Nom d'Utilisateur
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                Nom complet / Pseudonyme
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold text-xs outline-hidden focus:border-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                Adresse E-mail
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 bg-neutral-950/50 border border-neutral-800/60 rounded-xl text-neutral-500 font-medium text-xs cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loadingName}
              className="w-full py-2 px-4 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 transition-all cursor-pointer shadow-xs text-xs"
            >
              {loadingName ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>

          {/* 2. Langue de l'Application */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <span className="font-black text-xs uppercase tracking-wider text-white block">
              Langue de l'Application
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectLanguage('fr');
                  setMsgInfo({ text: 'Langue définie sur Français', type: 'success' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  langue === 'fr'
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                Français (FR)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectLanguage('en');
                  setMsgInfo({ text: 'Language set to English', type: 'success' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  langue === 'en'
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                English (EN)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectLanguage('ar');
                  setMsgInfo({ text: 'تم تغيير اللغة إلى العربية', type: 'success' });
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  langue === 'ar'
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                العربية (AR)
              </button>
            </div>
          </div>

          {/* 3. Changement de Mot de Passe */}
          <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <span className="font-black text-xs uppercase tracking-wider text-white block">
              Sécurité & Mot de Passe
            </span>

            <div>
              <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                Ancien mot de passe
              </label>
              <input
                type="password"
                value={ancienMotDePasse}
                onChange={(e) => setAncienMotDePasse(e.target.value)}
                placeholder="Mot de passe actuel"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold text-xs outline-hidden focus:border-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={nouveauMotDePasse}
                  onChange={(e) => setNouveauMotDePasse(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold text-xs outline-hidden focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={confirmMotDePasse}
                  onChange={(e) => setConfirmMotDePasse(e.target.value)}
                  placeholder="Confirmer"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-semibold text-xs outline-hidden focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingPass || !nouveauMotDePasse}
              className="w-full py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold transition-all cursor-pointer text-xs border border-neutral-700 disabled:opacity-50"
            >
              {loadingPass ? 'Modification...' : 'Changer mon mot de passe'}
            </button>
          </form>

          {/* 4. Statut de l'Abonnement (si paiement actif) */}
          {isPaymentActive() && (
            <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-white">
                  Abonnement Actuel
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-black">
                  {user.role === 'ADMIN' ? 'PREMIUM (ADMIN)' : (user.subscriptionTier || 'FREEMIUM').toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {user.role === 'ADMIN' 
                  ? 'Vous bénéficiez d\'un accès complet et illimité à toutes les fonctionnalités de la plateforme.'
                  : `Vous bénéficiez de l'accès aux fonctionnalités ${user.subscriptionTier || 'freemium'}.`}
              </p>
              {onOpenUpgradeModal && user.role !== 'ADMIN' && user.subscriptionTier !== 'premium' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgradeModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all cursor-pointer mt-1"
                >
                  Passer au Forfait Pro / Premium
                </button>
              )}
            </div>
          )}

          {/* 5. Bouton Déconnexion */}
          <div className="pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-red-950/40 border border-red-800/80 hover:bg-red-900/60 text-red-200 hover:text-white font-black text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>Se déconnecter de l'application</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
