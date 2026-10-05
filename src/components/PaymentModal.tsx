import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CV, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Smartphone, Clock, AlertTriangle, ShieldCheck, X, ArrowRight, Copy, Check, PhoneCall } from 'lucide-react';

interface PaymentModalProps {
  cv: CV;
  langue: Language;
  onClose: () => void;
  onSubmitPayment: (data: {
    cvId: string;
    numeroReception: string;
    numeroExpediteur: string;
    referenceTransaction: string;
  }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  cv,
  langue,
  onClose,
  onSubmitPayment
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);

  const ORANGE_USSD_CODE = '*126*1*1*1*653998494*500#';
  const [numeroReception, setNumeroReception] = useState<string>('653998494');
  const [numeroExpediteur, setNumeroExpediteur] = useState<string>('');
  const [referenceTransaction, setReferenceTransaction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ORANGE_USSD_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroExpediteur || !referenceTransaction) {
      setErrorMessage('Veuillez remplir tous les champs du formulaire');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSubmitPayment({
        cvId: cv.id,
        numeroReception,
        numeroExpediteur,
        referenceTransaction
      });

      // Launch celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la déclaration');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-8 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-orange-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t('paymentModalTitle')}</h2>
              <p className="text-orange-100 text-xs">Paiement unique via Mobile Money pour l'export PDF illimité</p>
            </div>
          </div>

          <div className="mt-4 bg-white/10 rounded-xl p-3 flex items-center justify-between backdrop-blur-xs">
            <span className="text-xs font-medium text-orange-100">Tarif fixe par CV :</span>
            <span className="text-2xl font-black tracking-tight">500 FCFA</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* Pending State Notice */}
          {cv.statutPaiement === 'EN_ATTENTE_VALIDATION' ? (
            <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center space-y-3">
              <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 mx-auto animate-pulse" />
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">Paiement en cours de vérification</h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {t('paymentPendingNotice')}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-amber-600 text-white font-bold py-2.5 rounded-xl hover:bg-amber-700 transition-colors text-sm cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Highlighted Orange Money USSD Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-4 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                    Payer via Orange Money
                  </span>
                  <span className="text-xs font-mono font-bold">500 FCFA</span>
                </div>

                <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between gap-2 border border-white/20">
                  <code className="text-base sm:text-lg font-black font-mono tracking-wider text-amber-200">
                    {ORANGE_USSD_CODE}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-white text-orange-700 font-bold text-xs rounded-lg hover:bg-orange-50 transition-colors shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-orange-100 flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" />
                  Composez ce code sur votre téléphone Orange pour valider le transfert de 500 FCFA.
                </p>
              </div>

              {/* Destination Numbers */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Choisissez le numéro de réception :
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label 
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-2 ${
                      numeroReception === '653998494'
                        ? 'border-orange-600 bg-orange-50/60 dark:bg-orange-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="numeroReception"
                      value="653998494"
                      checked={numeroReception === '653998494'}
                      onChange={(e) => setNumeroReception(e.target.value)}
                      className="accent-orange-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">653998494</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Orange Money / MTN</p>
                    </div>
                  </label>

                  <label 
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-2 ${
                      numeroReception === '658606103'
                        ? 'border-orange-600 bg-orange-50/60 dark:bg-orange-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="numeroReception"
                      value="658606103"
                      checked={numeroReception === '658606103'}
                      onChange={(e) => setNumeroReception(e.target.value)}
                      className="accent-orange-600"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">658606103</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Mobile Money (MTN/Orange)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Declaration */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl border border-red-200 dark:border-red-800 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('senderNumber')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 690001122"
                    value={numeroExpediteur}
                    onChange={(e) => setNumeroExpediteur(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code de transaction reçu
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: OM202608061234 ou MT982341"
                    value={referenceTransaction}
                    onChange={(e) => setReferenceTransaction(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-orange-500 outline-hidden transition-all font-mono"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Saisissez l'ID ou la référence SMS reçue après la composition du code USSD.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-3 px-4 rounded-xl hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>{t('submittingPayment')}</span>
                    ) : (
                      <>
                        <span>Soumettre le code & Valider le CV</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
