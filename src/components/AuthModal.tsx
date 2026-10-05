import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { getTranslation } from '../i18n/translations';
import {
  LogIn,
  UserPlus,
  X,
  AlertTriangle,
  Mail,
  Lock,
  User as UserIcon,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { AppLogo } from './AppLogo';

interface AuthModalProps {
  langue: Language;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
  initialResetToken?: string;
}

// Safe JSON parser to protect against HTML 404/500 responses
async function parseJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (text.includes('<!doctype') || text.includes('<html') || text.includes('<!DOCTYPE')) {
      throw new Error(
        res.status === 404
          ? 'Service d\'authentification introuvable (404).'
          : `Le serveur est en cours de redémarrage (${res.status}). Veuillez patienter un instant et réessayer.`
      );
    }
    throw new Error(res.ok ? 'Réponse inattendue du serveur.' : `Erreur serveur (${res.status}). Veuillez réessayer dans un instant.`);
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({
  langue,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialResetToken = ''
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [resetToken, setResetToken] = useState(initialResetToken);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // If token is provided in URL or props, automatically switch to reset mode
  useEffect(() => {
    if (initialResetToken) {
      setResetToken(initialResetToken);
      setMode('reset');
    }
  }, [initialResetToken]);

  // Google Sign-In with Firebase Auth & PostgreSQL sync
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const userResult = result.user;
      const idToken = await userResult.getIdToken();

      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: userResult.uid,
          email: userResult.email,
          displayName: userResult.displayName || nom || userResult.email?.split('@')[0],
          photoUrl: userResult.photoURL,
          langue
        })
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de synchronisation avec la base PostgreSQL');
      }

      if (data.token) {
        localStorage.setItem('cv_builder_token', data.token);
        localStorage.setItem('token', data.token);
      } else if (idToken) {
        localStorage.setItem('cv_builder_token', idToken);
      }
      if (data.user) {
        localStorage.setItem('cv_builder_user', JSON.stringify(data.user));
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      const firebaseCode = err?.code;
      if (firebaseCode === 'auth/popup-blocked' || firebaseCode === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleAuthProvider);
          return;
        } catch (redirectErr: any) {
          console.error('Google Redirect Error:', redirectErr);
          setErrorMessage('Le popup Google a été bloqué par le navigateur. Veuillez autoriser les pop-ups ou réessayer à partir d’une action directe.');
          return;
        }
      }
      console.error('Google Sign-In Error:', err);
      setErrorMessage(err.message || 'Erreur lors de la connexion Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Submit handler for all modes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setDevResetUrl(null);

    // MODE: FORGOT PASSWORD
    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMessage('Veuillez entrer une adresse e-mail.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        });
        const data = await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(data.error || 'Impossible d\'envoyer le lien de réinitialisation.');
        }

        setSuccessMessage(data.message || 'Si cette adresse e-mail existe, un lien de réinitialisation sécurisé vous a été envoyé.');
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // MODE: RESET PASSWORD
    if (mode === 'reset') {
      if (!resetToken.trim()) {
        setErrorMessage('Jeton de réinitialisation manquant ou invalide.');
        setLoading(false);
        return;
      }
      if (motDePasse.length < 8) {
        setErrorMessage('Le nouveau mot de passe doit comporter au moins 8 caractères.');
        setLoading(false);
        return;
      }
      if (motDePasse !== confirmerMotDePasse) {
        setErrorMessage('Les deux mots de passe ne correspondent pas.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken.trim(),
            newPassword: motDePasse
          })
        });
        const data = await parseJsonResponse(res);

        if (!res.ok) {
          throw new Error(data.error || 'Impossible de réinitialiser le mot de passe.');
        }

        setSuccessMessage(data.message || 'Mot de passe réinitialisé avec succès !');
        setMotDePasse('');
        setConfirmerMotDePasse('');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('Vous pouvez désormais vous connecter avec votre nouveau mot de passe.');
        }, 2000);
      } catch (err: any) {
        setErrorMessage(err.message || 'Erreur lors de la réinitialisation.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // MODE: REGISTER
    if (mode === 'register' && motDePasse.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      setLoading(false);
      return;
    }

    // MODE: LOGIN / REGISTER
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    let currentGuestId: string | undefined;
    try {
      const u = localStorage.getItem('cv_builder_user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.id && (parsed.id.startsWith('u-gst-') || parsed.id.startsWith('guest_') || parsed.id.startsWith('anon_'))) {
          currentGuestId = parsed.id;
        }
      }
    } catch (_) {}

    const body = mode === 'register'
      ? { nom, email, motDePasse, langue, guestUserId: currentGuestId }
      : { email, motDePasse };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(data.error || 'Erreur d\'authentification');
      }

      if (data.token) {
        localStorage.setItem('cv_builder_token', data.token);
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('cv_builder_user', JSON.stringify(data.user));
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.20),_transparent_35%),_rgba(15,23,42,0.82)] backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white/95 dark:bg-neutral-950/95 border border-neutral-200 dark:border-neutral-800 rounded-[28px] max-w-md w-full overflow-hidden shadow-[0_26px_80px_rgba(15,23,42,0.35)] relative">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur-sm">
              <AppLogo size="md" animated />
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                {mode === 'login' && t('login')}
                {mode === 'register' && t('register')}
                {mode === 'forgot' && 'Mot de passe oublié'}
                {mode === 'reset' && 'Nouveau mot de passe'}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {mode === 'forgot'
                  ? 'Récupération sécurisée du compte'
                  : mode === 'reset'
                  ? 'Définissez votre nouveau mot de passe'
                  : 'MonCVPro Cloud SQL & Auth'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs rounded-2xl border border-red-200 dark:border-red-800 flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Dev Quick-Test Link */}
          {devResetUrl && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Mode Test / Prévisualisation
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Vous pouvez tester directement le formulaire de réinitialisation sans attendre la réception de l'e-mail :
              </p>
              <button
                type="button"
                onClick={() => {
                  const url = new URL(devResetUrl);
                  const token = url.searchParams.get('reset_token') || '';
                  setResetToken(token);
                  setMode('reset');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tester la réinitialisation maintenant
              </button>
            </div>
          )}

          {/* Quick Google Sign In (only on login/register) */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-2xl text-neutral-900 dark:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
                </svg>
                <span>{googleLoading ? 'Connexion en cours...' : 'Continuer avec Google'}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">ou par email</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Nom complet</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean Dupont"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 rounded-2xl outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Ex: jean.dupont@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 rounded-2xl outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                  />
                </div>
                {mode === 'forgot' && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-normal">
                    Nous vous enverrons un lien à usage unique valable 1 heure pour réinitialiser votre mot de passe en toute sécurité.
                  </p>
                )}
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 rounded-2xl outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 8 caractères"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 rounded-2xl outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      aria-label={showResetPassword ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
                    >
                      {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Retapez le mot de passe"
                      value={confirmerMotDePasse}
                      onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 rounded-2xl outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      aria-label={showResetConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    >
                      {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {mode === 'login' && <LogIn className="w-4 h-4" />}
              {mode === 'register' && <UserPlus className="w-4 h-4" />}
              {mode === 'forgot' && <Mail className="w-4 h-4" />}
              {mode === 'reset' && <KeyRound className="w-4 h-4" />}
              <span>
                {loading
                  ? t('loading')
                  : mode === 'login'
                  ? t('login')
                  : mode === 'register'
                  ? t('register')
                  : mode === 'forgot'
                  ? 'Envoyer le lien de réinitialisation'
                  : 'Mettre à jour le mot de passe'}
              </span>
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="text-center pt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {mode === 'login' && (
              <p>
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-neutral-900 dark:text-white font-extrabold hover:underline cursor-pointer ml-1"
                >
                  Créer un compte
                </button>
              </p>
            )}

            {mode === 'register' && (
              <p>
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-neutral-900 dark:text-white font-extrabold hover:underline cursor-pointer ml-1"
                >
                  Se connecter
                </button>
              </p>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 text-neutral-900 dark:text-white font-extrabold hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

