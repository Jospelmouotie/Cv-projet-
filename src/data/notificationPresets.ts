import { NotificationType } from '../types';

export interface NotificationPreset {
  id: string;
  titre: string;
  message: string;
  type: NotificationType;
  cible: 'TOUS' | 'freemium' | 'decouverte' | 'classique' | 'premium';
  lien?: string;
  badge?: string;
}

export const NOTIFICATION_PRESETS: NotificationPreset[] = [
  {
    id: 'new-template-pack',
    titre: 'Nouveaux modèles de CV disponibles',
    message: 'Découvrez 10 nouveaux modèles premium pour moderniser votre candidature et mieux refléter votre profil.',
    type: 'MODELES_HD',
    cible: 'TOUS',
    lien: '/gallery',
    badge: 'Nouveautés'
  },
  {
    id: 'free-upgrade',
    titre: 'Accès gratuit à la galerie complète',
    message: 'Profitez d’une sélection spéciale de modèles gratuits pour lancer votre CV sans attendre.',
    type: 'FEATURE_FREE',
    cible: 'freemium',
    lien: '/gallery',
    badge: 'Gratuit'
  },
  {
    id: 'ai-launch',
    titre: 'L’IA pour personnaliser vos CV est arrivée',
    message: 'Adaptez instantanément votre CV à une offre, mettez en avant les bons mots-clés et gagnez en pertinence.',
    type: 'NOUVEAUTE_IA',
    cible: 'classique',
    lien: '/tools/job-targeting',
    badge: 'IA'
  },
  {
    id: 'clean-pwa',
    titre: 'L’application est maintenant installable',
    message: 'Installez MonCVGratuit sur votre bureau pour créer vos CV plus rapidement et sans distraction.',
    type: 'PWA_DISPO',
    cible: 'TOUS',
    lien: '/dashboard',
    badge: 'PWA'
  }
];
