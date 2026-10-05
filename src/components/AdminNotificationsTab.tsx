import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Mail, 
  Users, 
  Sparkles, 
  Gift, 
  Layout, 
  Smartphone, 
  Zap, 
  Info, 
  CheckCircle2, 
  Trash2, 
  RefreshCw,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AppNotification, NotificationType, Language } from '../types';
import { NOTIFICATION_PRESETS, NotificationPreset } from '../data/notificationPresets';

interface AdminNotificationsTabProps {
  langue: Language;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({ langue }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('FEATURE_FREE');
  const [cible, setCible] = useState<'TOUS' | 'freemium' | 'decouverte' | 'classique' | 'premium'>('TOUS');
  const [lien, setLien] = useState('gallery');
  const [badge, setBadge] = useState('100% GRATUIT');
  const [envoyeParEmail, setEnvoyeParEmail] = useState(true);
  const [previewTab, setPreviewTab] = useState<'CARD' | 'EMAIL'>('CARD');

  const fetchAdminNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotalUsersCount(data.totalUsersCount || 0);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !message.trim()) {
      alert('Veuillez renseigner au minimum un titre et un message.');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titre,
          message,
          type,
          cible,
          lien,
          badge,
          envoyeParEmail
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessToast(`Notification envoyée avec succès à ${data.recipientsCount} utilisateur(s) ! (${data.emailsSentCount} e-mails délivrés)`);
        setTimeout(() => setSuccessToast(null), 5000);
        // Clear form
        setTitre('');
        setMessage('');
        fetchAdminNotifications();
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur lors de l\'envoi.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion au serveur.');
    } finally {
      setSending(false);
    }
  };

  const handleSendPresetInstant = async (preset: NotificationPreset) => {
    if (!window.confirm(`Confirmez-vous l'envoi immédiat de la notification "${preset.titre}" à tous les utilisateurs par notification et e-mail ?`)) {
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          titre: preset.titre,
          message: preset.message,
          type: preset.type,
          cible: preset.cible,
          lien: preset.lien,
          badge: preset.badge,
          envoyeParEmail: true
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessToast(`Template "${preset.titre}" envoyé à ${data.recipientsCount} utilisateurs !`);
        setTimeout(() => setSuccessToast(null), 5000);
        fetchAdminNotifications();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleLoadPresetToEditor = (preset: NotificationPreset) => {
    setTitre(preset.titre);
    setMessage(preset.message);
    setType(preset.type);
    setCible(preset.cible);
    setLien(preset.lien || 'gallery');
    setBadge(preset.badge);
    setEnvoyeParEmail(true);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Supprimer cette notification de l\'historique ?')) return;
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Alert / Stats */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-neutral-900 border border-blue-800/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Centre de Diffusion : Notifications & Mails Utilisateurs
            </h2>
          </div>
          <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
            Diffusez des alertes en temps réel à l'ensemble de votre base ({totalUsersCount} utilisateur(s) inscrits). Les notifications apparaissent immédiatement dans l'application et sont transmises par e-mail. Les passages d'éléments payants en gratuit sont également déclenchés automatiquement.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminNotifications}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-2 border border-neutral-700/60 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-bold animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SECTION 1: PRESET NOTIFICATIONS (1-CLICK SEND) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Modèles de Notifications Prédéfinis (Envoi Rapide en 1 Clic)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">
            {NOTIFICATION_PRESETS.length} modèles prêts à l'emploi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NOTIFICATION_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4.5 flex flex-col justify-between space-y-3 transition-all hover:shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {preset.badge}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    {preset.tagline}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mt-2 leading-snug">
                  {preset.titre}
                </h4>

                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-3 leading-relaxed">
                  {preset.message}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendPresetInstant(preset)}
                  disabled={sending}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Envoyer immédiatement à tous les utilisateurs"
                >
                  <Send className="w-3 h-3" />
                  <span>Envoyer à tous</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadPresetToEditor(preset)}
                  className="py-1.5 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  title="Charger dans l'éditeur pour personnaliser"
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CUSTOM NOTIFICATION COMPOSER & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Composer */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Mail className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Rédiger une Notification & E-mail Personnalisé
            </h3>
          </div>

          <form onSubmit={handleSendCustom} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Titre de l'Alerte / Objet de l'E-mail *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: 🎉 Élément Payant Débloqué 100% GRATUIT !"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Corps du Message (In-App & E-mail) *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez le message que tous les utilisateurs liront dans leur boîte mail et centre de notifications..."
                rows={4}
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl p-3.5 text-xs text-white placeholder:text-neutral-600 focus:outline-hidden transition-colors leading-relaxed"
              />
            </div>

            {/* Grid selectors: Type, Cible, Badge, Lien */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  Type d'Alerte
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="FEATURE_FREE">🎁 Gratuité Débloquée (Feature Free)</option>
                  <option value="NOUVEAUTE_IA">✨ Nouveauté IA</option>
                  <option value="MODELES_HD">📄 Nouveaux Modèles HD</option>
                  <option value="PWA_DISPO">📱 Application Mobile (PWA)</option>
                  <option value="PROMO">🔥 Promotion Forfaits</option>
                  <option value="SYSTEM">🚀 Annonce Système</option>
                </select>
              </div>

              {/* Segment Cible */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  Audience Cible
                </label>
                <select
                  value={cible}
                  onChange={(e) => setCible(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="TOUS">Tous les utilisateurs ({totalUsersCount})</option>
                  <option value="freemium">Utilisateurs Freemium uniquement</option>
                  <option value="decouverte">Pack Découverte</option>
                  <option value="classique">Pack Classique</option>
                  <option value="premium">Pack Premium VIP</option>
                </select>
              </div>

              {/* Badge Text */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  Texte du Badge
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ex: 100% GRATUIT, IA PRO..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              {/* Action Link Target View */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                  Bouton de Redirection
                </label>
                <select
                  value={lien}
                  onChange={(e) => setLien(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                >
                  <option value="gallery">Galerie des Modèles de CV</option>
                  <option value="job-targeting">Outil Ciblage d'Offre (IA)</option>
                  <option value="letter-generator">Générateur de Lettre (IA)</option>
                  <option value="translate-cv">Traducteur de CV</option>
                  <option value="linkedin">Optimiseur LinkedIn</option>
                  <option value="pricing">Tarifs & Abonnements</option>
                  <option value="dashboard">Mes CV Enregistrés</option>
                  <option value="home">Page d'Accueil</option>
                </select>
              </div>
            </div>

            {/* Email Broadcast Toggle */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Envoyer une copie par e-mail
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    Délivre le message aux boîtes de réception de la cible ({totalUsersCount} e-mails)
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={envoyeParEmail}
                onChange={(e) => setEnvoyeParEmail(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending || !titre || !message}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Envoyer à tous les utilisateurs</span>
            </button>
          </form>
        </div>

        {/* Right: Live Card & Email Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-neutral-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Aperçu en Temps Réel
              </h4>
            </div>

            <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
              <button
                type="button"
                onClick={() => setPreviewTab('CARD')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  previewTab === 'CARD' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                }`}
              >
                In-App Card
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('EMAIL')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  previewTab === 'EMAIL' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                }`}
              >
                E-mail
              </button>
            </div>
          </div>

          {previewTab === 'CARD' ? (
            /* In-App Notification Card Preview */
            <div className="bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                Aperçu de la carte dans le centre de notifications :
              </div>
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {badge || 'ALERTE'}
                    </span>
                    <span className="text-[10px] text-neutral-500">À l'instant</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                    {titre || 'Titre de votre notification'}
                  </h4>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    {message || 'Le corps de votre message apparaîtra ici avec tout le texte et les détails pour l\'utilisateur...'}
                  </p>
                  <div className="mt-2 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                    <span>Voir sur l'application ({lien})</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Email Template Preview */
            <div className="bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                Aperçu du rendu e-mail HTML :
              </div>
              <div className="bg-white text-neutral-900 rounded-xl overflow-hidden shadow-xl text-xs">
                <div className="bg-neutral-950 p-4 text-center border-b border-neutral-800">
                  <span className="font-black text-white text-sm tracking-tight">MYCV BUILDER</span>
                </div>
                <div className="p-5 space-y-3">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                    {badge || 'INFORMATION'}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-950 leading-tight">
                    {titre || 'Titre de l\'email utilisateur'}
                  </h4>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {message || 'Contenu complet de votre e-mail délivré directement aux utilisateurs...'}
                  </p>
                  <div className="pt-2 text-center">
                    <span className="inline-block px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs">
                      Ouvrir MyCV Builder
                    </span>
                  </div>
                </div>
                <div className="bg-neutral-100 p-3 text-center text-[10px] text-neutral-500 border-t border-neutral-200">
                  MyCV Builder • Notification envoyée à l'ensemble des membres
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: SENT NOTIFICATIONS HISTORY */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-300" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Historique des Diffusions ({notifications.length})
            </h3>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-xs">
            Aucune diffusion enregistrée pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Titre & Message</th>
                  <th className="pb-3">Cible</th>
                  <th className="pb-3">E-mails</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 text-neutral-400 text-[11px] whitespace-nowrap">
                      {new Date(notif.dateCreation).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {notif.type}
                      </span>
                    </td>
                    <td className="py-3 max-w-xs">
                      <div className="font-bold text-white truncate">{notif.titre}</div>
                      <div className="text-neutral-400 text-[11px] truncate mt-0.5">{notif.message}</div>
                    </td>
                    <td className="py-3 text-neutral-300 uppercase font-semibold text-[10px]">
                      {notif.cible}
                    </td>
                    <td className="py-3">
                      {notif.envoyeParEmail ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                          <Mail className="w-3 h-3" />
                          <span>{notif.nombreEmailsEnvoyes || totalUsersCount}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500">In-App seul</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                        title="Supprimer la diffusion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
