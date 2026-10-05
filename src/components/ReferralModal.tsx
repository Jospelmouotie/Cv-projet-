import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  Sparkles,
  Download,
  Crown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getReferralStats, ReferralStats } from '../utils/referralSystem';
import { Language } from '../types';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
  langue?: Language;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  userId,
  langue = 'fr'
}) => {
  const [stats, setStats] = useState<ReferralStats>(() => getReferralStats(userId));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(getReferralStats(userId));
      setCopied(false);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    "Crée ton CV professionnel gratuitement en quelques minutes avec l'IA et exporte-le en haute définition : "
  );
  const shareUrl = encodeURIComponent(stats.referralLink);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}${shareUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Créer ton CV gratuitement")}&body=${shareText}${shareUrl}`;

  const rewards = [
    {
      target: 1,
      title: '1 ami inscrit',
      reward: '1 Export PDF HD offert',
      icon: Download,
      unlocked: stats.totalSignups >= 1,
      badge: 'Export sans filigrane'
    },
    {
      target: 3,
      title: '3 amis inscrits',
      reward: '1 Mois Premium offert',
      icon: Crown,
      unlocked: stats.totalSignups >= 3,
      badge: 'Accès IA complet'
    },
    {
      target: 5,
      title: '5 amis inscrits',
      reward: '3 Mois Premium offerts',
      icon: Sparkles,
      unlocked: stats.totalSignups >= 5,
      badge: 'Pack Carrière VIP'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleUp">
        {/* Modal Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-black uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Programme de Parrainage</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Invitez des amis, gagnez du Premium</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-sm">
            Partagez votre lien exclusif. Chaque ami qui s&apos;inscrit débloque immédiatement des récompenses pro pour vous.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Referral Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Votre lien unique de parrainage :</label>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={stats.referralLink}
                className="w-full bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 outline-none px-2 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
            >
              <span>WhatsApp</span>
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
            >
              <span>LinkedIn</span>
            </a>
            <a
              href={emailUrl}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <span>Email</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalClicks}</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Clics sur le lien</div>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-700">
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.totalSignups}</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Amis inscrits</div>
            </div>
            <div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                {stats.premiumMonthsGranted > 0 ? `${stats.premiumMonthsGranted} mois` : stats.unlockedHdExports > 0 ? `${stats.unlockedHdExports} HD` : '0'}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Gains débloqués</div>
            </div>
          </div>

          {/* Reward Milestones */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Paliers de récompenses</h3>
            <div className="space-y-2">
              {rewards.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.target}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                      r.unlocked
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          r.unlocked
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{r.reward}</span>
                          <span className="text-[10px] font-normal text-slate-500">({r.title})</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{r.badge}</div>
                      </div>
                    </div>
                    <div>
                      {r.unlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Débloqué
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {stats.totalSignups} / {r.target}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
