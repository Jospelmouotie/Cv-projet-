# 📘 Manuel de Déploiement et d'Administration - MonCVPro SaaS

Ce guide officiel décrit la procédure étape par étape pour configurer, sécuriser, interconnecter les services tiers (API Google Gemini, Passerelle iKeePay), migrer la base de données PostgreSQL et déployer l'application **MonCVPro** en local et en production.

---

## 📋 Table des Matières
1. [Architecture & Spécifications Techniques](#1-architecture--spécifications-techniques)
2. [Prérequis Système](#2-prérequis-système)
3. [Installation & Configuration de PostgreSQL](#3-installation--configuration-de-postgresql)
4. [Configuration des Variables d'Environnement (.env)](#4-configuration-des-variables-denvironnement-env)
5. [💳 Procédure de Facturation & Activation de l'API Google Gemini](#5--procédure-de-facturation--activation-de-lapi-google-gemini)
6. [💰 Configuration de la Passerelle de Paiement iKeePay](#6--configuration-de-la-passerelle-de-paiement-ikeepay)
7. [🚀 Lancement de l'Application en Local](#7--lancement-de-lapplication-en-local)
8. [🌐 Déploiement en Production (PM2 / Nginx / Docker)](#8--déploiement-en-production-pm2--nginx--docker)
9. [🔐 Administration & Maintenance du SaaS](#9--administration--maintenance-du-saas)
10. [🏷️ Filigranes de Protection & Mention Footer des PDF Exportés](#10-️-filigranes-de-protection--mention-footer-des-pdf-exportés)
11. [💾 Procédures de Sauvegarde, Restauration & Migration](#11--procédures-de-sauvegarde-restauration--migration)
12. [🛠️ Guide de Dépannage & Résolution d'Erreurs Fréquentes](#12-️-guide-de-dépannage--résolution-derreurs-fréquentes)

---

## 1. Architecture & Spécifications Techniques

- **Frontend** : React 19, Vite, TailwindCSS v4, Lucide React, Framer Motion.
- **Backend** : Node.js, Express.js (TypeScript avec `tsx` & `esbuild`).
- **Base de données** : PostgreSQL (avec Drizzle ORM). Inclus un moteur de secours SQLite / JSON en cas de bascule hors-ligne.
- **Intelligence Artificielle** : Google Gemini API (`@google/genai` avec fallback automatique sur les modèles `gemini-3.8-flash` & `gemini-3.1-flash-lite`).
- **Paiements** : Passerelle iKeePay (Mobile Money : Orange Money, MTN MoMo, Wave, Moov + Cartes Visa / Mastercard).
- **Mails Transactionnels** : Nodemailer (SMTP SSL / TLS).

---

## 2. Prérequis Système

### Environnement de Développement / Serveur :
- **Node.js** : Version `v18.x` ou `v20.x` (LTS) recommandée.
- **PostgreSQL** : Version `14.x`, `15.x` ou `16.x` installée et en cours d'exécution.
- **NPM** (ou Bun) : v9+ inclus avec Node.js.
- **Git** : Pour le contrôle de version.

---

## 3. Installation & Configuration de PostgreSQL

### Étape 3.1 : Démarrage du Service PostgreSQL
S'assurer que PostgreSQL est démarré sur votre machine (Port par défaut : `5432`).

- **Sous Windows** : Ouvrir les *Services Windows* (`services.msc`) et s'assurer que le service `postgresql-x64-XX` est sur *En cours d'exécution*.
- **Sous Linux (Ubuntu/Debian)** :
  ```bash
  sudo systemctl status postgresql
  sudo systemctl start postgresql
  ```

### Étape 3.2 : Création de la Base de Données `cv_builder_db`
Ouvrir l'invite de commande ou le terminal `psql` (ou pgAdmin) :

```sql
-- Connexion à psql en tant qu'utilisateur postgres
psql -U postgres

-- Création du rôle et mot de passe (si ce n'est pas déjà fait)
ALTER USER postgres WITH PASSWORD 'postgres';

-- Création de la base de données dédiée
CREATE DATABASE cv_builder_db OWNER postgres;

-- Vérification de l'existence de la base
\l
```

### Étape 3.3 : Génération et Migration du Schéma de Base de Données
L'application utilise **Drizzle ORM**. Pour créer et synchroniser automatiquement toutes les tables (`users`, `documents`, `cvs`, `cover_letters`, `payments`, `subscriptions`, `app_settings`, `password_resets`) dans PostgreSQL :

```bash
# Dans le dossier racine du projet cv-builder :
npm run db:push
```

---

## 4. Configuration des Variables d'Environnement (.env)

Créez un fichier `.env` à la racine du projet (copiez `.env.example`) et renseignez les valeurs :

```env
# =============================================================
# 1. DATABASE CONFIGURATION (POSTGRESQL)
# =============================================================
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cv_builder_db

# Ou via variables individuelles :
SQL_HOST=localhost
SQL_PORT=5432
SQL_DB_NAME=cv_builder_db
SQL_USER=postgres
SQL_PASSWORD=postgres

# =============================================================
# 2. SECURITY & AUTHENTICATION
# =============================================================
# Générer une clé secrète aléatoire de 64 caractères pour signer les JWT
JWT_SECRET=votre_cle_secrete_jwt_ultra_securisee_64_caracteres

# URL publique de l'application
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# =============================================================
# 3. GOOGLE GEMINI AI API KEY
# =============================================================
GEMINI_API_KEY=AIzaSy_VOTRE_CLE_API_GEMINI_RECUPEREE

# =============================================================
# 4. IKEEPAY PAYMENT GATEWAY
# =============================================================
IKEEPAY_PUBLIC_KEY=ik_pub_votre_cle_publique
IKEEPAY_PRIVATE_KEY=ik_priv_votre_cle_privee
IKEEPAY_WEBHOOK_SECRET=ik_whsec_votre_secret_webhook

# =============================================================
# 5. INITIAL ADMIN ACCOUNT BOOTSTRAP
# =============================================================
ADMIN_INITIAL_EMAIL=admin@moncvpro.com
ADMIN_INITIAL_PASSWORD=AdminPasswordSecured123!

# =============================================================
# 6. SMTP EMAIL DISPATCH (OPTIONNEL MAIS RECOMMANDÉ)
# =============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=contact@moncvpro.com
SMTP_PASS=votre_mot_de_passe_application_google
SMTP_SECURE=true
```

---

## 5. 💳 Procédure de Facturation & Activation de l'API Google Gemini

Pour alimenter les fonctionnalités intelligentes (analyse d'offres d'emploi, reformulation d'expériences, traduction multilingue de CV, génération de lettres de motivation), l'application utilise l'API **Google Gemini**.

Voici la procédure complète pour configurer le compte de facturation et générer la clé API officielle.

### Étape 5.1 : Création / Connexion au Compte Google Cloud & AI Studio
1. Rendez-vous sur **[Google AI Studio](https://aistudio.google.com/)** ou **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Connectez-vous avec votre compte Google professionnel ou d'entreprise.

### Étape 5.2 : Configuration du Compte de Facturation (*Billing Account*)
Bien que Google offre un quota d'essai gratuit généreux pour Gemini, un compte de facturation actif est recommandé pour éviter toute interruption de service en production :

1. Accédez à la section **Facturation (Billing)** sur Google Cloud Console : `https://console.cloud.google.com/billing`.
2. Cliquez sur **Créer un compte de facturation**.
3. Renseignez votre pays, type de compte (Entreprise ou Particulier) et vos coordonnées fiscales.
4. Mode de Paiement : Ajoutez une carte bancaire valide (Visa, Mastercard, American Express).
5. Validez le compte (une empreinte temporaire de 1 USD peut être effectuée pour valider la carte).

### Étape 5.3 : Activation de l'API Gemini (*Generative Language API*)
1. Allez dans le sélecteur de projets en haut de la console et cliquez sur **Nouveau Projet**.
2. Nommez le projet (ex : `moncvpro-saas-production`).
3. Dans la barre de recherche supérieure, tapez **Generative Language API** (ou **Gemini API**).
4. Cliquez sur **Activer** (*Enable*).

### Étape 5.4 : Génération de la Clé API (`GEMINI_API_KEY`)
1. Allez sur Google AI Studio : `https://aistudio.google.com/app/apikey`.
2. Cliquez sur le bouton **Get API Key** puis **Create API Key**.
3. Sélectionnez le projet Google Cloud créé à l'étape 5.3 (`moncvpro-saas-production`).
4. Copiez la clé API générée (au format `AIzaSy...`).
5. **Collez cette clé dans votre fichier `.env`** :
   ```env
   GEMINI_API_KEY=AIzaSy_VOTRE_CLE_API_RECOPIEE
   ```

### Étape 5.5 : Sécurisation & Contrôle des Coûts (Budgets et Quotas)
Pour éviter tout risque de dépense imprévue :
1. Sur Google Cloud Console, allez dans **Facturation > Budgets et alertes**.
2. Cliquez sur **Créer un budget** (ex: `Budget Mensuel Gemini - 20 USD`).
3. Définissez les seuils d'alerte par e-mail (50%, 80%, 100%).
4. (Optionnel) Dans **API et services > Quotas**, vous pouvez fixer un plafond maximal de requêtes par minute (RPM) pour bloquer automatiquement l'usage au-delà du quota désiré.

---

## 6. 💰 Configuration de la Passerelle de Paiement iKeePay

Le SaaS accepte les paiements par Mobile Money et Cartes via **iKeePay**.

### Étape 6.1 : Création du Compte Marchand iKeePay
1. Rendez-vous sur le portail iKeePay ([https://ikeepay.com](https://ikeepay.com)) et créez un compte Marchand.
2. Soumettez les pièces de validation KYC de votre structure.

### Étape 6.2 : Récupération des Clés API
Dans votre tableau de bord Marchand iKeePay > **Paramètres API** :
- Copiez la **Clé Publique** (`IKEEPAY_PUBLIC_KEY`).
- Copiez la **Clé Privée / Clé Secrète** (`IKEEPAY_PRIVATE_KEY`).
- Copiez le **Secret de Webhook** (`IKEEPAY_WEBHOOK_SECRET`).

### Étape 6.3 : Configuration du Webhook iKeePay
Dans l'onglet **Webhooks** de votre compte iKeePay, ajoutez l'URL de votre serveur :
- **URL du Webhook** : `https://votre-domaine.com/api/payment/ikeepay-webhook`
- **Événements à cocher** : `payment.success`, `checkout.completed`.

---

## 7. 🚀 Lancement de l'Application en Local

### 1. Installation des dépendances
```bash
npm install
```

### 2. Synchronization du Schéma PostgreSQL
```bash
npm run db:push
```

### 3. Démarrage du Serveur de Développement Local
```bash
npm run dev
```

L'application est maintenant accessible sur :
👉 **`http://localhost:3000`**

- Un compte Administrateur par défaut est automatiquement créé lors du premier lancement si configuré dans le `.env` :
  - E-mail : `admin@moncvpro.com`
  - Mot de passe : la valeur de `ADMIN_INITIAL_PASSWORD`.

---

## 8. 🌐 Déploiement en Production (PM2 / Nginx / Docker)

### Option A : Déploiement Standard sur Serveur VPS / Cloud (Ubuntu/Debian)

#### 1. Compilation du Projet
```bash
npm run build
```
Cette commande génère :
- Le bundle Frontend dans le dossier `dist/`.
- Le serveur Node.js optimisé CJS dans `dist/server.cjs`.

#### 2. Démarrage du Service avec PM2
```bash
npm install -g pm2
pm2 start dist/server.cjs --name "moncvpro-saas"
pm2 save
pm2 startup
```

#### 3. Configuration de Nginx en Reverse-Proxy
Créez le fichier de configuration Nginx `/etc/nginx/sites-available/moncvpro` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 25M;
    }
}
```

Activez le site et ajoutez un certificat SSL HTTPS gratuit Certbot / Let's Encrypt :
```bash
sudo ln -s /etc/nginx/sites-available/moncvpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 9. 🔐 Administration & Maintenance du SaaS

### Accès au Panneau d'Administration
Connectez-vous avec les identifiants Administrateur et ouvrez le panneau d'administration via la barre de navigation ou l'URL `/admin`.

Depuis le Panneau Admin, vous pouvez :
1. **Activer / Désactiver le Système de Paiement** (si désactivé, l'ensemble du site devient 100% gratuit).
2. **Modifier les Tarifs & Durées des Packs** (Découverte, Classique, Premium VIP).
3. **Débloquer Manuellement des Abonnements** pour des utilisateurs.
4. **Envoyer des Notifications Globales par E-mail & Push In-App**.
5. **Valider ou Rejeter des Paiements en Attente**.

---

## 10. 🏷️ Filigranes de Protection & Mention Footer des PDF Exportés

### 10.1 Filigrane Anti-Capture d'Écran sur l'Aperçu Web
- Un filigrane protecteur en grille diagonale (`MONCVPRO — APERÇU PROTÉGÉ • NE PAS CAPTURER` avec icône de cadenas) est automatiquement superposé sur l'aperçu dynamique du CV lorsque le statut du document est non payé (`statutPaiement !== 'PAYE'`) et que l'utilisateur ne possède pas de forfait actif.
- Ce filigrane prévient le vol par capture d'écran de l'aperçu du CV par des utilisateurs non autorisés.

### 10.2 Retrait Automatique du Filigrane lors de l'Exportation
- Lors de l'exportation d'un modèle gratuit ou payé débloqué, le filigrane web `.watermark-overlay` est **systématiquement exclu du moteur de rendu DOM / Canvas** par le script de capture [pdfExport.ts](file:///c:/Users/FBI-STORE/Downloads/cv-builder/src/utils/pdfExport.ts).
- Les documents PDF, PNG ou Word téléchargés par l'utilisateur sont ainsi 100% vierges de tout filigrane diagonal de capture.

### 10.3 Mention de Bas de Page ("Fait avec MyCVBuilder")
- Conformément aux exigences du SaaS, une signature vectorielle propre et professionnelle est automatiquement apposée en bas de chaque page de tout document PDF exporté :
  ```text
  Fait avec MyCVBuilder
  ```
- Cette mention est ajoutée de façon vectorielle nette (hauteur 7.5pt, couleur ardoise discrète), centrée à 1.5mm du bas de la page A4, garantissant ainsi l'attribution officielle sans déformer le contenu du CV.

---

## 11. 💾 Procédures de Sauvegarde, Restauration & Migration

### 11.1 Sauvegarde Automatisée de la Base PostgreSQL
Pour créer une copie de sauvegarde complète de la base de données :

```bash
# Export au format SQL compresse
pg_dump -U postgres -h localhost -d cv_builder_db -F c -b -v -f ./backups/cv_builder_backup_$(date +%Y%m%d).dump
```

### 11.2 Restauration de la Base de Données
```bash
pg_restore -U postgres -h localhost -d cv_builder_db -v ./backups/cv_builder_backup_20261002.dump
```

### 11.3 Restauration des Données de Modèles & Presets
Si des données de modèles prédéfinis ou de données exemple doivent être réinitialisées :
```bash
node restore_all_data.cjs
```

---

## 12. 🛠️ Guide de Dépannage & Resolution d'Erreurs Fréquentes

| Problème / Symptôme | Cause Probable | Solution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:5432` | Le service PostgreSQL n'est pas démarré sur le serveur. | Exécuter `sudo systemctl start postgresql` ou démarrer le service Windows `postgresql-x64-XX`. |
| `Error: JWT_SECRET environment variable is missing` | La variable `JWT_SECRET` n'est pas configurée dans le fichier `.env`. | Générer une chaîne aléatoire de 64 caractères dans `.env` (`JWT_SECRET=...`). |
| `HTTP 429 Too Many Requests` sur l'API Gemini | Dépassement du quota de requêtes par minute de la clé Google Gemini. | Vérifier la facturation Google Cloud et ajuster les limites dans Google AI Studio. |
| Signature Webhook iKeePay Invalide | Le secret de webhook dans `.env` ne correspond pas à celui d'iKeePay. | Recopier `IKEEPAY_WEBHOOK_SECRET` depuis le portail marchand iKeePay. |
| Le filigrane apparaît sur les exports PDF | Élément DOM non masqué lors du clone Canvas. | Vérifier que la classe `watermark-overlay` ou l'attribut `data-watermark="true"` est présent sur l'élément. |

