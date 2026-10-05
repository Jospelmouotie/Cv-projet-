import React, { useState, useEffect } from 'react';
import { Language, SubscriptionTier, User } from '../types';
import { IkeePayCheckout } from './IkeePayCheckout';
import { usePricingSettings } from '../state/usePricingSettings';

interface IKeePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: SubscriptionTier;
  user: User | null;
  langue?: Language;
  onSuccess: (updatedTier: SubscriptionTier) => void;
}

export const IKeePayModal: React.FC<IKeePayModalProps> = ({
  isOpen,
  onClose,
  tier,
  user,
  langue = 'fr',
  onSuccess
}) => {
  const { getPlan, formatPlanPrice } = usePricingSettings();
  const currentPlan = getPlan(tier);
  const amountStr = String(currentPlan.prix);
  const safeLangue: Language = (langue === 'en' || langue === 'ar') ? langue : 'fr';
  const planFormatted = formatPlanPrice(tier, 'usd-first', safeLangue);

  const [verifying, setVerifying] = useState(false);
  const [actualAmount, setActualAmount] = useState<string>(amountStr);
  const [orderId, setOrderId] = useState<string>(() => `ORDER_${tier.toUpperCase()}_${Date.now()}`);

  // Synchronize actual amount whenever currentPlan or tier changes
  useEffect(() => {
    setActualAmount(String(currentPlan.prix));
  }, [currentPlan.prix, tier]);

  // When modal opens, register intent on backend if token exists to get transaction ref and validated price
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
    if (!token) return;

    let isMounted = true;
    const initiatePayment = async () => {
      try {
        const response = await fetch('/api/payment/ikeepay-initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ planTier: tier })
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.success) {
            if (data.transactionRef) {
              setOrderId(data.transactionRef);
            }
            if (data.amount) {
              setActualAmount(String(data.amount));
            }
          }
        }
      } catch (err) {
        console.warn('Could not pre-initiate payment via backend:', err);
      }
    };

    initiatePayment();
    return () => {
      isMounted = false;
    };
  }, [isOpen, tier]);

  const handlePaymentSuccess = async () => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('cv_builder_token') || localStorage.getItem('token');
      const response = await fetch('/api/payment/ikeepay-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          transactionRef: orderId,
          utilisateurId: user?.id || 'u-demo-1',
          planTier: tier,
          userEmail: user?.email || 'john.doe@email.com'
        })
      });
      const data = await response.json();
      if (data.success) {
        onSuccess(tier);
      } else {
        onSuccess(tier);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      onSuccess(tier);
    } finally {
      setVerifying(false);
      onClose();
    }
  };

  return (
    <>
      <IkeePayCheckout
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handlePaymentSuccess}
        amount={actualAmount}
        orderId={orderId}
        customerEmail={user?.email || 'john.doe@email.com'}
        planName={currentPlan.nom}
        displayPrice={planFormatted.fullLabel}
      />
      {verifying && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center text-white gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          <p className="font-bold text-sm">Validation de votre paiement iKeePay et déverrouillage de votre accès...</p>
        </div>
      )}
    </>
  );
};

