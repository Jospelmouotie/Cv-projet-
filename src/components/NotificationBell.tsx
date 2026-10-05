import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Sparkles, 
  Gift, 
  Layout, 
  Smartphone, 
  Zap, 
  Info, 
  ExternalLink,
  X
} from 'lucide-react';
import { AppNotification, NotificationType, Language } from '../types';
import { AppView } from './Sidebar';

interface NotificationBellProps {
  langue: Language;
  onNavigate?: (view: AppView) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ langue, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'FREE'>('ALL');
  const [toastNotification, setToastNotification] = useState<AppNotification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAr = langue === 'ar';
  const isEn = langue === 'en';

  const fetchNotifications = async (showToastOnNew = false) => {
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        const newNotifs: AppNotification[] = data.notifications || [];
        const newUnread = data.unreadCount || 0;

        // If a brand new notification arrived (e.g. free element), trigger toast popup
        if (showToastOnNew && newNotifs.length > 0 && notifications.length > 0) {
          const latest = newNotifs[0];
          if (!notifications.some(n => n.id === latest.id)) {
            setToastNotification(latest);
          }
        }

        setNotifications(newNotifs);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling every 30 seconds
    const interval = setInterval(() => fetchNotifications(true), 30000);

    // Listen to custom event when app matrix or settings trigger instant notification
    const handleMatrixUpdate = () => {
      fetchNotifications(true);
    };
    window.addEventListener('admin_paid_matrix_updated', handleMatrixUpdate);
    window.addEventListener('app_settings_updated', handleMatrixUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('admin_paid_matrix_updated', handleMatrixUpdate);
      window.removeEventListener('app_settings_updated', handleMatrixUpdate);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.lien && onNavigate) {
      onNavigate(notif.lien as AppView);
      setIsOpen(false);
      setToastNotification(null);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'FEATURE_FREE':
        return <Gift className="w-4 h-4 text-emerald-400" />;
      case 'NOUVEAUTE_IA':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'MODELES_HD':
        return <Layout className="w-4 h-4 text-blue-400" />;
      case 'PWA_DISPO':
        return <Smartphone className="w-4 h-4 text-amber-400" />;
      case 'PROMO':
        return <Zap className="w-4 h-4 text-rose-400" />;
      case 'SYSTEM':
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'FREE') return n.type === 'FEATURE_FREE';
    return true;
  });

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return isAr ? 'الآن' : isEn ? 'Just now' : 'À l\'instant';
      if (diffMins < 60) return isAr ? `منذ ${diffMins} د` : isEn ? `${diffMins}m ago` : `Il y a ${diffMins} min`;
      if (diffHours < 24) return isAr ? `منذ ${diffHours} س` : isEn ? `${diffHours}h ago` : `Il y a ${diffHours}h`;
      return isAr ? `منذ ${diffDays} يوم` : isEn ? `${diffDays}d ago` : `Il y a ${diffDays}j`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          setToastNotification(null);
        }}
        title="Centre de notifications"
        className="relative w-8 h-8 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
      >
        <Bell className="w-4 h-4 text-neutral-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-neutral-950 font-black text-[9px] flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Real-time Toast Banner (when a free element or notification arrives) */}
      {toastNotification && !isOpen && (
        <aside 
          aria-label="Notification récente"
          className="fixed bottom-20 right-4 max-w-sm z-50 bg-neutral-900 border-2 border-emerald-500 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-6 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              {getIcon(toastNotification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-400">
                  {toastNotification.badge || 'NOUVELLE ALERTE'}
                </span>
                <button
                  type="button"
                  onClick={() => setToastNotification(null)}
                  className="text-neutral-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5 leading-snug truncate">
                {toastNotification.titre}
              </h4>
              <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
                {toastNotification.message}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNotificationClick(toastNotification)}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Voir l'offre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markAsRead(toastNotification.id);
                    setToastNotification(null);
                  }}
                  className="text-[11px] text-neutral-400 hover:text-white px-2 py-1"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Notifications Popover Menu */}
      {isOpen && (
        <div className="absolute right-[-3.5rem] xs:right-[-1.5rem] sm:right-0 top-full mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white leading-none">
                  {isAr ? 'مركز الإشعارات' : isEn ? 'Notifications' : 'Centre de Notifications'}
                </h3>
                <span className="text-[10px] text-neutral-400">
                  {unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes les alertes lues'}
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 hover:bg-neutral-800 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3 h-3 text-emerald-400" />
                <span>Tout marquer lu</span>
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="px-3 py-1.5 bg-neutral-950 border-b border-neutral-800/80 flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeFilter === 'UNREAD'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('FREE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeFilter === 'FREE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              🎁 Gratuités
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-800/60 custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-neutral-500 space-y-1">
                <Bell className="w-8 h-8 mx-auto opacity-30 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-400">Aucune notification</p>
                <p className="text-[11px] text-neutral-600">Vous êtes à jour avec toutes les actualités.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-neutral-800/60 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    !notif.isRead ? 'bg-neutral-800/25' : ''
                  }`}
                >
                  {/* Unread dot indicator */}
                  {!notif.isRead && (
                    <span className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}

                  {/* Icon Box */}
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                        {notif.badge || notif.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-medium">
                        {formatTime(notif.dateCreation)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                      {notif.titre}
                    </h4>

                    <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed line-clamp-3">
                      {notif.message}
                    </p>

                    {notif.lien && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300">
                        <span>Accéder directement</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer status */}
          <div className="p-2.5 bg-neutral-950/80 border-t border-neutral-800 text-center text-[10px] text-neutral-500">
            {isAr ? 'الإشعارات تُرسل وتُحدث تلقائياً' : 'Notifications & alertes mails en direct'}
          </div>
        </div>
      )}
    </div>
  );
};
