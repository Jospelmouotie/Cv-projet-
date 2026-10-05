import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Lazy initialization of nodemailer transporter using Gmail SMTP credentials
let transporterInstance: nodemailer.Transporter | null = null;

export function getEmailTransporter(): nodemailer.Transporter | null {
  if (transporterInstance) {
    return transporterInstance;
  }

  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpSecure = process.env.SMTP_SECURE !== 'false';

  if (!smtpUser || !smtpPass) {
    console.warn('[EMAIL SERVICE] SMTP_USER ou SMTP_PASS manquant. Les e-mails seront loggés mais non expédiés.');
    return null;
  }

  try {
    transporterInstance = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log(`[EMAIL SERVICE] Transporteur SMTP initialisé avec succès pour ${smtpUser} (${smtpHost}:${smtpPort})`);
  } catch (err) {
    console.error('[EMAIL SERVICE] Erreur lors de la création du transporteur SMTP:', err);
    return null;
  }

  return transporterInstance;
}

/**
 * Standard email template wrapper with sleek modern branding
 */
export function buildHtmlEmailTemplate({
  title,
  preheader,
  badge,
  badgeColor = '#2563eb',
  contentHtml,
  actionText,
  actionUrl,
  footerNote
}: {
  title: string;
  preheader?: string;
  badge?: string;
  badgeColor?: string;
  contentHtml: string;
  actionText?: string;
  actionUrl?: string;
  footerNote?: string;
}): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0f172a; padding: 30px 10px; }
    .main-table { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #3b82f6; }
    .logo-badge { display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; font-weight: 900; font-size: 16px; padding: 8px 16px; border-radius: 10px; letter-spacing: 0.5px; }
    .header-title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 16px 0 0 0; }
    .body-content { padding: 36px 32px; color: #334155; font-size: 15px; line-height: 1.65; }
    .badge-pill { display: inline-block; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}30; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
    .btn-action { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 30px; border-radius: 10px; margin-top: 24px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); text-align: center; }
    .footer { background-color: #f8fafc; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="header">
          <div class="logo-badge">MYCV BUILDER</div>
          <h1 class="header-title">${title}</h1>
        </td>
      </tr>
      <tr>
        <td class="body-content">
          ${badge ? `<div class="badge-pill">${badge}</div>` : ''}
          ${contentHtml}
          ${actionText && actionUrl ? `
            <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
              <a href="${actionUrl}" class="btn-action" target="_blank">${actionText} &rarr;</a>
            </div>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 8px 0;"><strong>MyCV Builder</strong> &bull; Plateforme Professionnelle de Création de CV & IA</p>
          <p style="margin: 0;">${footerNote || 'Vous recevez cet e-mail suite à votre inscription ou vos activités sur MyCV Builder.'}</p>
          <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 11px;">&copy; ${currentYear} MyCV Builder. Tous droits réservés.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send an email safely with fallback logging
 */
export async function sendEmailSafe(options: EmailOptions): Promise<boolean> {
  const transporter = getEmailTransporter();
  const smtpUser = process.env.SMTP_USER || '';
  const from = process.env.SMTP_FROM || `"MyCV Builder" <${smtpUser}>`;

  if (!transporter) {
    console.log(`[EMAIL DISPATCH SIMULATED] Vers: ${Array.isArray(options.to) ? options.to.join(', ') : options.to} | Sujet: "${options.subject}"`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    });

    console.log(`[EMAIL DISPATCH SUCCESS] E-mail envoyé à ${options.to} (ID: ${info.messageId})`);
    return true;
  } catch (err: any) {
    console.error(`[EMAIL DISPATCH ERROR] Échec de l'envoi à ${options.to}:`, err?.message || err);
    return false;
  }
}

/**
 * 1. Welcome Email sent upon user registration
 */
export async function sendWelcomeEmail(userEmail: string, userName: string, appUrl: string = 'https://mycvbuilder.com'): Promise<boolean> {
  const title = 'Bienvenue sur MyCV Builder !';
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Bonjour ${userName || 'Cher Candidat'},</h2>
    <p>Nous sommes ravis de vous compter parmi les créateurs de <strong>MyCV Builder</strong> ! Votre compte a été créé avec succès.</p>
    <p>Vous avez désormais accès à nos outils d'élite pour décrocher vos futurs entretiens :</p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>59+ Modèles de CV Professionnels</strong> adaptés à tous les secteurs.</li>
      <li><strong>Creator Studio Avancé</strong> avec personnalisation typographique, couleurs et formes.</li>
      <li><strong>Suite IA Intelligente</strong> : Ciblage d'offres d'emploi, Lettres de motivation et Profil LinkedIn optimisé.</li>
      <li><strong>Export PDF Haute Définition</strong> prêt pour les recruteurs et les systèmes ATS.</li>
    </ul>
    <p>Commencez dès aujourd'hui à créer votre premier CV remarquable en quelques minutes.</p>
  `;

  const html = buildHtmlEmailTemplate({
    title,
    badge: 'Nouveau Compte',
    badgeColor: '#10b981',
    contentHtml,
    actionText: 'Créer mon premier CV',
    actionUrl: `${appUrl}/#gallery`
  });

  return sendEmailSafe({
    to: userEmail,
    subject: '🎉 Bienvenue sur MyCV Builder - Créez votre CV d\'impact !',
    html
  });
}

/**
 * 2. Subscription Activation / Payment Validated Email
 */
export async function sendSubscriptionConfirmationEmail({
  userEmail,
  userName,
  planName,
  planTier,
  amount,
  currency = 'FCFA',
  durationDays,
  expiresAt,
  appUrl = 'https://mycvbuilder.com'
}: {
  userEmail: string;
  userName: string;
  planName: string;
  planTier: string;
  amount: number;
  currency?: string;
  durationDays: number;
  expiresAt: string;
  appUrl?: string;
}): Promise<boolean> {
  const formattedExpiry = new Date(expiresAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const title = `Abonnement ${planName.toUpperCase()} Activé !`;
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Félicitations ${userName || ''} !</h2>
    <p>Votre paiement a été validé avec succès. Votre forfait <strong>${planName}</strong> est désormais actif sur votre compte.</p>
    
    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Détails de l'abonnement :</strong></p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7;">
        <li>Forfait : <strong>${planName}</strong> (${planTier})</li>
        <li>Montant : <strong>${amount} ${currency}</strong></li>
        <li>Durée d'accès : <strong>${durationDays} jours</strong></li>
        <li>Date d'expiration : <strong>${formattedExpiry}</strong></li>
      </ul>
    </div>

    <p>Toutes les fonctionnalités associées à votre formule (modèles Premium, IA Gemini avancée, exports illimités) sont immédiatement déverrouillées.</p>
  `;

  const html = buildHtmlEmailTemplate({
    title,
    badge: 'Paiement Confirmé',
    badgeColor: '#2563eb',
    contentHtml,
    actionText: 'Accéder à mon Espace',
    actionUrl: `${appUrl}/#gallery`
  });

  return sendEmailSafe({
    to: userEmail,
    subject: `✅ Confirmation de votre abonnement ${planName} - MyCV Builder`,
    html
  });
}

/**
 * 3. Free Feature Unlock / Global Free Announcement Email
 */
export async function sendFeatureUnlockedEmail({
  userEmail,
  userName,
  featureTitle,
  featureMessage,
  actionLink = 'gallery',
  badge = '100% GRATUIT',
  appUrl = 'https://mycvbuilder.com'
}: {
  userEmail: string;
  userName: string;
  featureTitle: string;
  featureMessage: string;
  actionLink?: string;
  badge?: string;
  appUrl?: string;
}): Promise<boolean> {
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Bonjour ${userName || ''},</h2>
    <p>${featureMessage}</p>
    <p>Profitez-en dès maintenant pour mettre à jour votre CV avec les derniers designs et fonctionnalités débloqués !</p>
  `;

  const html = buildHtmlEmailTemplate({
    title: featureTitle,
    badge,
    badgeColor: '#10b981',
    contentHtml,
    actionText: 'Découvrir les nouveautés',
    actionUrl: `${appUrl}/#${actionLink}`
  });

  return sendEmailSafe({
    to: userEmail,
    subject: `${featureTitle} - MyCV Builder`,
    html
  });
}

/**
 * 4. Admin Alert for new payment or manual proof submission
 */
export async function sendAdminPaymentAlert({
  adminEmail = process.env.ADMIN_INITIAL_EMAIL || process.env.SMTP_USER || '',
  userName,
  userEmail,
  planTier,
  amount,
  currency = 'FCFA',
  reference,
  appUrl = 'https://mycvbuilder.com'
}: {
  adminEmail?: string;
  userName: string;
  userEmail: string;
  planTier: string;
  amount: number;
  currency?: string;
  reference: string;
  appUrl?: string;
}): Promise<boolean> {
  const title = 'Nouveau Paiement Reçu / Preuve Déposée';
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Alerte Administrateur</h2>
    <p>Un utilisateur a initié un paiement ou déposé une preuve de transaction :</p>
    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7;">
        <li>Client : <strong>${userName}</strong> (${userEmail})</li>
        <li>Formule demandée : <strong>${planTier.toUpperCase()}</strong></li>
        <li>Montant : <strong>${amount} ${currency}</strong></li>
        <li>Référence : <code>${reference}</code></li>
      </ul>
    </div>
    <p>Connectez-vous au panneau d'administration pour vérifier et valider la transaction si nécessaire.</p>
  `;

  const html = buildHtmlEmailTemplate({
    title,
    badge: 'Notification Admin',
    badgeColor: '#f59e0b',
    contentHtml,
    actionText: 'Ouvrir le Panneau Admin',
    actionUrl: `${appUrl}/#admin`
  });

  return sendEmailSafe({
    to: adminEmail,
    subject: `🔔 [Admin] Nouveau paiement : ${userName} (${planTier})`,
    html
  });
}

/**
 * 5. Password Reset Email
 */
export async function sendPasswordResetEmail({
  userEmail,
  userName,
  resetUrl
}: {
  userEmail: string;
  userName: string;
  resetUrl: string;
}): Promise<boolean> {
  const title = 'Réinitialisation de votre mot de passe';
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Bonjour ${userName || 'Cher Utilisateur'},</h2>
    <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte MyCV Builder associé à l'adresse e-mail : <strong>${userEmail}</strong>.</p>
    <p>Pour choisir un nouveau mot de passe sécurisé, veuillez cliquer sur le bouton ci-dessous :</p>
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
      <p style="margin: 0;">⏰ <strong>Attention :</strong> Ce lien est à usage unique et expirera dans <strong>1 heure</strong> pour des raisons de sécurité.</p>
    </div>
    <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.</p>
  `;

  const html = buildHtmlEmailTemplate({
    title,
    badge: 'Sécurité Compte',
    badgeColor: '#ef4444',
    contentHtml,
    actionText: 'Réinitialiser mon mot de passe',
    actionUrl: resetUrl,
    footerNote: 'Ce lien de sécurité est strictement personnel. Ne le partagez avec personne.'
  });

  return sendEmailSafe({
    to: userEmail,
    subject: '🔐 Réinitialisation de votre mot de passe - MyCV Builder',
    html
  });
}
