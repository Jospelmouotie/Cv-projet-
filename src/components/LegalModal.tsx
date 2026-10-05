import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Scale, Building2 } from 'lucide-react';
import { Language } from '../types';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'cgu' | 'cgv' | 'privacy' | 'mentions';
  langue?: Language;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'cgu',
  langue = 'fr'
}) => {
  const [activeTab, setActiveTab] = useState<'cgu' | 'cgv' | 'privacy' | 'mentions'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Informations Légales & Conformité</h2>
              <p className="text-xs text-slate-500">Transparence, sécurité et conformité RGPD</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cgu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'cgu'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CGU</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cgv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'cgv'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>CGV & Paiement</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confidentialité (RGPD)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mentions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'mentions'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Mentions Légales</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[60vh]">
          {activeTab === 'cgu' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Conditions Générales d&apos;Utilisation (CGU)</h3>
              <p className="text-[11px] text-slate-500">Dernière mise à jour : 2026</p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Objet du Service</h4>
              <p>
                La plateforme MonCVGratuit permet aux utilisateurs de créer, modifier, mettre en page et exporter des curriculum vitae (CV), lettres de motivation et profils professionnels à l&apos;aide d&apos;outils graphiques et d&apos;intelligence artificielle.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Propriété Intellectuelle</h4>
              <p>
                L&apos;utilisateur conserve la pleine et entière propriété de toutes les informations personnelles, textes, photographies et parcours professionnels qu&apos;il renseigne. Les gabarits graphiques, modèles de mise en page, codes sources et algorithmes restent la propriété exclusive de l&apos;éditeur.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Engagements de l&apos;Utilisateur</h4>
              <p>
                L&apos;utilisateur s&apos;engage à fournir des informations véridiques et à ne pas utiliser la plateforme à des fins frauduleuses, usurpatrices ou contraires aux lois en vigueur.
              </p>
            </div>
          )}

          {activeTab === 'cgv' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Conditions Générales de Vente (CGV)</h3>
              <p className="text-[11px] text-slate-500">Dernière mise à jour : 2026</p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Tarifs et Formules</h4>
              <p>
                Le service propose une formule gratuite (Freemium) avec fonctionnalités essentielles, ainsi que des formules payantes (Pass Classique et Abonnement Premium) offrant des fonctionnalités avancées (modèles premium, ciblage d&apos;offres IA, export illimité sans filigrane).
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Modalités de Paiement et Sécurité IKEEPAY</h4>
              <p>
                Les transactions sont sécurisées par notre prestataire agréé IKEEPAY. Les communications de paiement sont chiffrées selon les normes SSL/TLS les plus strictes. Les webhooks de confirmation sont certifiés par signature cryptographique en temps constant.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Droit de Rétractation</h4>
              <p>
                Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contenus numériques fournis sur support immatériel dont l&apos;exécution a commencé avec l&apos;accord exprès du consommateur.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Politique de Confidentialité (Conformité RGPD)</h3>
              <p className="text-[11px] text-slate-500">Dernière mise à jour : 2026</p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Données Collectées</h4>
              <p>
                Nous collectons uniquement les données strictement nécessaires à l&apos;édition de vos candidatures : nom, prénom, coordonnées (email, téléphone, adresse), photographies fournies volontairement, et détails de vos expériences professionnelles et formations.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Non-Revente des Données</h4>
              <p>
                Vos données personnelles et de candidature ne sont JAMAIS vendues, louées ni transmises à des tiers ou des recruteurs sans votre accord préalable explicite.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Vos Droits (Accès, Rectification, Suppression)</h4>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez à tout moment d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression intégrale de votre compte et de l&apos;ensemble de vos documents enregistrés.
              </p>
            </div>
          )}

          {activeTab === 'mentions' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Mentions Légales</h3>
              <p className="text-[11px] text-slate-500">Dernière mise à jour : 2026</p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Éditeur de la plateforme</h4>
              <p>
                MonCVGratuit SAS — Plateforme d&apos;édition de candidatures professionnelles.<br />
                Siège social : Paris, France.<br />
                Contact : support@moncvgratuit.com
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Hébergement</h4>
              <p>
                Infrastructure Cloud sécurisée haute disponibilité avec sauvegardes redondantes et chiffrement SSL 256 bits au repos et en transit.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
