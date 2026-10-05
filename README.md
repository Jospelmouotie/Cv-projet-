# 📄 MonCVPro — CV Builder & Designer Pro

Application web de création, personnalisation, gestion et traduction de CV et Lettres de Motivation avec fonctionnalités IA (Gemini) et passerelle de paiement iKeePay.

---

## 🔒 1. Architecture & Sécurité du Code

L'application respecte les meilleures pratiques de sécurité backend et d'isolation des secrets :

- **Strict Isolement Backend / Serveur** : Toutes les clés sensibles (`GEMINI_API_KEY`, `IKEEPAY_PRIVATE_KEY`, `JWT_SECRET`, `IKEEPAY_WEBHOOK_SECRET`) sont gérées exclusivement côté serveur (`server.ts`) et ne sont **jamais exposées au navigateur** ou dans le bundle client.
- **Authentification & Contrôle d'Accès (JWT)** : Toutes les routes CRUD (`/api/cvs`, `/api/letters`), les services IA (`/api/ai/*`), l'importation de documents (`/api/import/parse`) et d'administration (`/api/admin/*`) sont protégées par authentification JWT et vérification stricte du rôle administrateur (`requireAdmin`).
- **Paiements Sécurisés & Webhooks Signés** : Vérification stricte des transactions iKeePay côté serveur avec contrôle d'exactitude du montant et du forfait. Les webhooks exigent une signature/secret valide (`IKEEPAY_WEBHOOK_SECRET`).
- **Hachage des Mots de Passe & Mots de Passe de 8+ Caractères** : Les mots de passe sont hachés avec `bcryptjs` avec une contrainte minimale de 8 caractères. Les condensés de mots de passe (`motDePasseHash`) sont systématiquement filtrés et supprimés de toutes les réponses API.

---

## 🚀 2. Guide d'Exécution en Local

### Prérequis
- **Node.js** v18+ ou v20+
- **npm** ou **yarn**

### Étapes de Lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement** :
   Créez un fichier `.env` à la racine en dupliquant `.env.example` :
   ```env
   PORT=3000
   JWT_SECRET=votre_secret_jwt_securise
   ADMIN_INITIAL_EMAIL=admin@moncvpro.com
   ADMIN_INITIAL_PASSWORD=votre_mot_de_passe_admin_securise
   GEMINI_API_KEY=votre_cle_gemini_api
   IKEEPAY_PUBLIC_KEY=votre_cle_publique_ikeepay
   IKEEPAY_PRIVATE_KEY=votre_cle_privee_ikeepay
   IKEEPAY_WEBHOOK_SECRET=votre_secret_webhook_ikeepay
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cv_builder_db
   ```

3. **Lancer l'application en mode développement** :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur : **`http://localhost:3000`**

---

## 🛠️ Commandes Utiles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Démarrer le serveur Express & Vite en local |
| `npm run build` | Compiler l'application pour la production |
| `npm run start` | Démarrer l'application compilée |
| `npm run lint` | Vérifier le typage TypeScript |
| `npm run db:push` | Synchroniser le schéma Drizzle avec PostgreSQL |
| `npm run db:studio` | Démarrer l'interface graphique Drizzle Studio |
