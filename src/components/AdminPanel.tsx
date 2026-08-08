import React, { useState, useEffect } from 'react';
import { Payment, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Shield, CheckCircle2, XCircle, Search, RefreshCw, Smartphone, Clock, Check, X } from 'lucide-react';

interface AdminPanelProps {
  langue: Language;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ langue, onRefresh }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'EN_ATTENTE' | 'ALL'>('EN_ATTENTE');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionNote, setRejectionNote] = useState<{ id: string; note: string } | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/paiements');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleValidate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/paiement/${id}/valider`, { method: 'POST' });
      if (res.ok) {
        fetchPayments();
        onRefresh();
      }
    } catch (err) {
      console.error('Error validating payment:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/paiement/${id}/rejeter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteAdmin: rejectionNote?.note || 'Invalide' })
      });
      if (res.ok) {
        setRejectionNote(null);
        fetchPayments();
        onRefresh();
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filterStatus === 'ALL' || p.statut === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.referenceTransaction.toLowerCase().includes(query) ||
      p.numeroExpediteur.toLowerCase().includes(query) ||
      (p.userEmail && p.userEmail.toLowerCase().includes(query)) ||
      (p.userName && p.userName.toLowerCase().includes(query));
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('adminTitle')}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Validez manuellement les déclarations de paiement Mobile Money (658606103 / 653998494)
            </p>
          </div>
        </div>

        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser la liste</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Status Filter */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('EN_ATTENTE')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              filterStatus === 'EN_ATTENTE'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>En attente ({payments.filter(p => p.statut === 'EN_ATTENTE').length})</span>
          </button>
          
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Tous l'historique ({payments.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchRefUser')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:border-blue-500 outline-hidden"
          />
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">{t('loading')}</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-2">
            <Smartphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p>{t('noPaymentsFound')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Utilisateur & CV</th>
                  <th className="px-4 py-3">Réf. SMS</th>
                  <th className="px-4 py-3">Expéditeur → Destinataire</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    
                    <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{p.userName || 'Utilisateur'}</p>
                      <p className="text-[11px] text-slate-400">{p.userEmail}</p>
                      <span className="inline-block mt-0.5 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 font-medium px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {p.cvTitle || 'CV'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded px-2">
                      {p.referenceTransaction}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-slate-800 dark:text-slate-200">De : <span className="font-mono">{p.numeroExpediteur}</span></p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Vers : <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{p.numeroReception}</span></p>
                    </td>

                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      500 FCFA
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.statut === 'VALIDE' && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Validé
                        </span>
                      )}
                      {p.statut === 'EN_ATTENTE' && (
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                          En attente
                        </span>
                      )}
                      {p.statut === 'REJETE' && (
                        <span className="bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 border border-red-200 dark:border-red-800">
                          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                          Rejeté
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {p.statut === 'EN_ATTENTE' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleValidate(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Valider (500 FCFA)</span>
                          </button>

                          <button
                            onClick={() => setRejectionNote({ id: p.id, note: '' })}
                            className="bg-red-100 dark:bg-red-950/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-red-200 dark:border-red-800 cursor-pointer"
                          >
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Terminé</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectionNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Raison du rejet du paiement</h3>
            <textarea
              rows={3}
              placeholder="Ex : Référence introuvable, montant incorrect..."
              value={rejectionNote.note}
              onChange={(e) => setRejectionNote({ ...rejectionNote, note: e.target.value })}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-hidden focus:border-red-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectionNote(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleReject(rejectionNote.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs cursor-pointer"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
