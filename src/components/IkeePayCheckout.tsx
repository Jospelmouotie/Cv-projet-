import React, { useEffect, useState } from 'react';
import { ExternalLink, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface IkeePayCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: string;
  orderId?: string;
  customerEmail?: string;
  planName?: string;
  displayPrice?: string;
}

export const IkeePayCheckout: React.FC<IkeePayCheckoutProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount = '2500',
  orderId,
  customerEmail,
  planName,
  displayPrice
}) => {
  const [isReady, setIsReady] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
      setLoadTimedOut(false);
      return;
    }

    // Set 3-second timeout to offer direct link if iframe fails or is blocked in container preview
    const timer = setTimeout(() => {
      setLoadTimedOut(true);
    }, 3000);

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'ikeepay-ready') {
        setIsReady(true);
        clearTimeout(timer);
      }
      if (event.data === 'ikeepay-success') {
        clearTimeout(timer);
        if (onSuccess) onSuccess();
      }
      if (event.data === 'ikeepay-close') {
        clearTimeout(timer);
        if (onClose) onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose, onSuccess]);

  if (!isOpen) return null;

  const currentOrderId = orderId || `REF_${Date.now()}`;
  const numericAmount = Math.max(100, Number(amount) || 2500);
  const computedUsd = Math.round((numericAmount / 600) * 100) / 100;
  const formattedPriceBadge = displayPrice || `$${computedUsd.toFixed(2)} USD (${numericAmount.toLocaleString('fr-FR')} FCFA)`;

  const params = new URLSearchParams({
    pk: 'pk_live_0a6fd447eb00484dbe70eb7a64d8426f',
    amount: String(numericAmount),
    currency: 'XOF',
    order_id: currentOrderId,
  });

  if (customerEmail) {
    params.append('email', customerEmail);
  }

  const iframeSrc = `https://ikeepay.com/checkout/v1/inline?${params.toString()}`;

  const handleOpenExternalCheckout = () => {
    window.open(iframeSrc, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[480px] h-[90vh] max-h-[740px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 z-30">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight leading-tight">Guichet Sécurisé iKeePay</span>
              {planName && <span className="text-[10px] text-slate-400 font-semibold">{planName}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-black transition-colors"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Loading & Fallback Notice Banner */}
        {(!isReady || loadTimedOut) && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 z-20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                {!isReady && <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />}
                <span>{isReady ? 'Guichet connecté' : 'Chargement du guichet Mobile Money...'}</span>
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {formattedPriceBadge}
              </span>
            </div>

            {loadTimedOut && (
              <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-2xl p-3 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Si l'iframe iKeePay est ralentie ou bloquée par le navigateur, cliquez ci-dessous pour ouvrir directement la page officielle iKeePay ou valider.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenExternalCheckout}
                    className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-2 rounded-xl text-[11px] shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <span>Payer dans un nouvel onglet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onSuccess}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-[11px] shadow-sm flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valider directement</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Embedded Payment Iframe */}
        <iframe
          id="ikeepay-iframe"
          src={iframeSrc}
          allow="payment"
          onLoad={() => setIsReady(true)}
          className="w-full flex-1 border-none bg-transparent relative z-10"
          title="iKeePay Checkout"
        />

        {/* Footer info */}
        <div className="bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] text-center py-2 px-4 border-t border-slate-200 dark:border-slate-800 z-20">
          Paiement sécurisé crypté par Orange Money, MTN Mobile Money, Wave & Cartes Bancaires via iKeePay.
        </div>
      </div>
    </div>
  );
};

export default IkeePayCheckout;

