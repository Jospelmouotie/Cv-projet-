#!/usr/bin/env tsx
import 'dotenv/config';
import readline from 'readline';
import bcrypt from 'bcryptjs';
import { dbAdapter } from '../src/db/dbAdapter.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('\n=== Création d\'un compte administrateur ===\n');

  try {
    const email = await question('Email de l\'administrateur : ');
    const nom = await question('Nom complet de l\'administrateur : ');
    const password = await question('Mot de passe (min 8 caractères) : ');
    const confirmPassword = await question('Confirmer le mot de passe : ');

    // Validation
    if (!email || !email.includes('@')) {
      console.error('❌ Email invalide.');
      rl.close();
      process.exit(1);
    }

    if (!nom || nom.trim().length < 2) {
      console.error('❌ Nom invalide (min 2 caractères).');
      rl.close();
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('❌ Le mot de passe doit contenir au moins 8 caractères.');
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Les mots de passe ne correspondent pas.');
      rl.close();
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await dbAdapter.findUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      console.error('❌ Un compte avec cet email existe déjà.');
      rl.close();
      process.exit(1);
    }

    // Créer l'administrateur
    const passwordHash = bcrypt.hashSync(password, 12);
    const newAdmin = await dbAdapter.createUser({
      nom: nom.trim(),
      email: email.toLowerCase().trim(),
      motDePasseHash: passwordHash,
      role: 'ADMIN',
      subscriptionTier: 'premium',
      subscriptionExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(), // 10 ans
      langue: 'fr'
    });

    console.log('\n✅ Administrateur créé avec succès !');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Nom: ${newAdmin.nom}`);
    console.log(`   Rôle: ${newAdmin.role}`);
    console.log(`   Abonnement: ${newAdmin.subscriptionTier}\n`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    rl.close();
    process.exit(1);
  }

  rl.close();
  process.exit(0);
}

createAdmin();
