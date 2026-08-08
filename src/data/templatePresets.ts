import { Section, Language } from '../types';

export interface CVTemplatePreset {
  titre: string;
  couleurAccent: string;
  police: string;
  photoUrl: string;
  sections: Section[];
}

export const TEMPLATE_PRESETS: Record<string, CVTemplatePreset> = {
  // ==================== MODEL 1: INTÉRIMAIRE PRO / VERT CANARD (Photo 1) ====================
  'modele-1': {
    titre: 'CV Intérimaire Pro — Vert Canard',
    couleurAccent: '#006666',
    police: 'Inter',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m1',
        type: 'profil',
        titre: 'MON PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'PRÉNOM NOM',
          titreProfessionnel: 'POSTE OCCUPÉ/RECHERCHÉ',
          email: 'prenom.nom@gmail.com',
          telephone: '+33 6 66 66 66 66',
          adresse: 'Ville, Pays',
          linkedin: 'url.linkedin',
          resume: 'Écrivez une description de votre profil et de vos principales compétences afin que le recruteur en sache plus sur vous. Valorisez vos points forts et votre motivation.'
        }
      },
      {
        id: 'sec-exp-m1',
        type: 'experience',
        titre: 'EXPÉRIENCES PROFESSIONNELLES',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Poste occupé',
            entreprise: 'NOM DE L\'ENTREPRISE',
            ville: 'Ville, Pays',
            dateDebut: '00/0000',
            dateFin: '00/0000',
            actuel: false,
            description: '• Gestion quotidienne des activités et réalisation des objectifs clés de l\'entreprise.\n• Coordination de projets en équipe et optimisation des procédures de travail.\n• Analyse des performances et rédaction de comptes-rendus réguliers.'
          },
          {
            id: 'exp-2',
            poste: 'Poste occupé',
            entreprise: 'NOM DE L\'ENTREPRISE',
            ville: 'Ville, Pays',
            dateDebut: '00/0000',
            dateFin: '00/0000',
            actuel: false,
            description: '• Accueil et orientation de la clientèle avec professionnalisme et rigueur.\n• Traitement rapide des demandes et résolution des incidents opérationnels.'
          }
        ]
      },
      {
        id: 'sec-edu-m1',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'DIPLÔME OU ÉTUDES',
            etablissement: 'Université ou école',
            ville: 'Ville, Pays',
            dateDebut: '00/0000',
            dateFin: '00/0000'
          },
          {
            id: 'edu-2',
            diplome: 'DIPLÔME OU ÉTUDES',
            etablissement: 'Université ou école',
            ville: 'Ville, Pays',
            dateDebut: '00/0000',
            dateFin: '00/0000'
          }
        ]
      },
      {
        id: 'sec-sk-m1',
        type: 'competences',
        titre: 'LOGICIELS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Excel', niveau: 5 },
          { id: 's-2', nom: 'PowerPoint', niveau: 4 },
          { id: 's-3', nom: 'Word', niveau: 5 },
          { id: 's-4', nom: 'Photoshop', niveau: 3 }
        ]
      },
      {
        id: 'sec-lang-m1',
        type: 'langues',
        titre: 'LANGUES',
        ordre: 5,
        visible: true,
        contenu: [
          { id: 'l-1', langue: 'Français', niveau: 'Langue maternelle' },
          { id: 'l-2', langue: 'Anglais', niveau: 'Niveau avancé' },
          { id: 'l-3', langue: 'Allemand', niveau: 'Niveau avancé' }
        ]
      }
    ]
  },

  // ==================== MODEL 2: AÏSSATOU MDALÉ / PHOTOGRAPHE (Photo 2) ====================
  'modele-2': {
    titre: 'CV Aïssatou Mdalé — Photographe',
    couleurAccent: '#381A3C',
    police: 'Playfair Display',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m2',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Aïssatou Mdalé',
          titreProfessionnel: 'Photographe',
          email: 'aissatou@mdale.site.com',
          telephone: '02 61 91 89 76',
          adresse: '94 rue Lauriston, 75016 Paris',
          siteWeb: 'www.photographe.site.com',
          resume: 'Photographe passionnée spécialisée dans le portrait, la photographie événementielle et de voyage avec 8 ans d\'expérience.'
        }
      },
      {
        id: 'sec-exp-m2',
        type: 'experience',
        titre: 'Parcours professionnel',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Photographe indépendante',
            entreprise: 'Paris',
            dateDebut: '2030',
            dateFin: '2035',
            actuel: false,
            description: '• Création de portraits pour particuliers et entreprises.\n• Photographie de mariages et événements spéciaux.\n• Réalisation de séances photos en studio et en extérieur.'
          },
          {
            id: 'exp-2',
            poste: 'Photographe de voyage',
            entreprise: 'Agence Passeport | Rennes',
            dateDebut: '2025',
            dateFin: '2030',
            actuel: false,
            description: '• Photographie de paysages et sites locaux.\n• Création de contenus visuels promotionnels.'
          },
          {
            id: 'exp-3',
            poste: 'Photographe de presse',
            entreprise: 'Journal local | Armentières',
            dateDebut: '2023',
            dateFin: '2025',
            actuel: false,
            description: '• Couverture photographique et sujets d\'actualité.\n• Livraison rapide d\'images pour les services de presse.'
          }
        ]
      },
      {
        id: 'sec-edu-m2',
        type: 'formation',
        titre: 'Formations',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Diplôme de photographie',
            etablissement: 'École du Visuel | Paris',
            dateDebut: '2023',
            dateFin: '2023'
          },
          {
            id: 'edu-2',
            diplome: 'Cours avancés de photographie',
            etablissement: 'Lycée Central | Paris',
            dateDebut: '2021',
            dateFin: '2021'
          }
        ]
      },
      {
        id: 'sec-sk-m2',
        type: 'competences',
        titre: 'Compétences',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Techniques d\'éclairage', niveau: 5 },
          { id: 's-2', nom: 'Post-production et montage', niveau: 5 },
          { id: 's-3', nom: 'Respect des délais', niveau: 4 },
          { id: 's-4', nom: 'Conception artistique', niveau: 5 },
          { id: 's-5', nom: 'Maîtrise avancée du matériel', niveau: 5 }
        ]
      },
      {
        id: 'sec-hob-m2',
        type: 'personnalisee',
        titre: 'Centres d\'intérêt',
        ordre: 5,
        visible: true,
        contenu: {
          typeLayout: 'liste',
          texteLibre: 'Cinéma\nVoyage\nNature\nSport'
        }
      }
    ]
  },

  // ==================== MODEL 3: BRIAN R. BAXTER (Photo 3) ====================
  'modele-3': {
    titre: 'CV Brian R. Baxter — Web Designer',
    couleurAccent: '#00B4D8',
    police: 'Outfit',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m3',
        type: 'profil',
        titre: 'ABOUT ME & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'BRIAN R. BAXTER',
          titreProfessionnel: 'GRAPHIC & WEB DESIGNER',
          email: 'yourinfo@email.com',
          telephone: '+1-718-310-5580',
          adresse: '760 Prudence Street Lincoln Park, MI 48146',
          siteWeb: 'www.yourwebsite.com',
          resume: 'Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type.'
        }
      },
      {
        id: 'sec-exp-m3',
        type: 'experience',
        titre: 'JOB EXPERIENCE',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'SENIOR WEB DESIGNER',
            entreprise: 'Creative Agency / Chicago',
            dateDebut: '2020',
            dateFin: 'Present',
            actuel: true,
            description: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type.'
          },
          {
            id: 'exp-2',
            poste: 'GRAPHIC DESIGNER',
            entreprise: 'Creative Market / Chicago',
            dateDebut: '2015',
            dateFin: '2020',
            actuel: false,
            description: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type.'
          },
          {
            id: 'exp-3',
            poste: 'MARKETING MANAGER',
            entreprise: 'Manufacturing Agency / NJ',
            dateDebut: '2013',
            dateFin: '2015',
            actuel: false,
            description: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type.'
          }
        ]
      },
      {
        id: 'sec-edu-m3',
        type: 'formation',
        titre: 'EDUCATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'MASTER DEGREE GRADUATE',
            etablissement: 'STANFORD UNIVERSITY',
            dateDebut: '2011',
            dateFin: '2013'
          },
          {
            id: 'edu-2',
            diplome: 'BACHELOR DEGREE GRADUATE',
            etablissement: 'UNIVERSITY OF CHICAGO',
            dateDebut: '2007',
            dateFin: '2010'
          }
        ]
      },
      {
        id: 'sec-sk-m3',
        type: 'competences',
        titre: 'SKILLS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Adobe Photoshop', niveau: 5 },
          { id: 's-2', nom: 'Adobe Illustrator', niveau: 4 },
          { id: 's-3', nom: 'Microsoft Word', niveau: 4 },
          { id: 's-4', nom: 'Microsoft Powerpoint', niveau: 5 },
          { id: 's-5', nom: 'HTML-5 / CSS-3', niveau: 4 }
        ]
      },
      {
        id: 'sec-ref-m3',
        type: 'personnalisee',
        titre: 'REFERENCES',
        ordre: 5,
        visible: true,
        contenu: {
          typeLayout: 'liste',
          texteLibre: 'DARWIN B. MAGANA\n2813 Shebe Lane Mancos, CO\nTel: +1-970-533-3393 | Email: yourinfo@email.com\n\nROBERT J. BELVIN\n2119 Fairfax Drive Newark, NJ\nTel: +1-908-987-5103 | Email: yourinfo@email.com'
        }
      }
    ]
  },

  // ==================== MODEL 4: INFIRMIÈRE (Photo 4) ====================
  'modele-4': {
    titre: 'CV Infirmière — Écusson Violet',
    couleurAccent: '#522166',
    police: 'Inter',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m4',
        type: 'profil',
        titre: 'PRÉNOM NOM',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'PRÉNOM NOM',
          titreProfessionnel: 'INFIRMIÈRE',
          email: 'COURRIEL@EXEMPLEDECV.INFO',
          telephone: 'TÉLÉPHONE',
          adresse: 'VILLE, PROVINCE, CODE POSTAL',
          resume: 'Infirmière diplômée d\'État rigoureuse avec une solide expérience en soins de santé généraux et accompagnement médical des patients.'
        }
      },
      {
        id: 'sec-edu-m4',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Examen de l\'ordre des infirmiers et infirmières du Québec',
            etablissement: 'Ordre Professionnel',
            dateDebut: '2012',
            dateFin: '2012'
          },
          {
            id: 'edu-2',
            diplome: 'DEC Techniques Soins infirmiers',
            etablissement: 'Collège Jean-Lesage',
            dateDebut: '2009',
            dateFin: '2012'
          },
          {
            id: 'edu-3',
            diplome: 'DES Diplôme études secondaires',
            etablissement: 'École Secondaire',
            dateDebut: '2009',
            dateFin: '2009'
          }
        ]
      },
      {
        id: 'sec-exp-m4',
        type: 'experience',
        titre: 'EXPÉRIENCES PROFESSIONNELLES',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Remplacement congé maternité',
            entreprise: 'Hôpital Marie-de-l\'Incarnation',
            dateDebut: '2012',
            dateFin: '2013',
            actuel: false,
            description: 'Fonctions :\n• Déterminer des plans de santé et assurer leur réalisation pour le traitement des patients.'
          },
          {
            id: 'exp-2',
            poste: 'Sauveteur Croix-Rouge - Emploi d\'été',
            entreprise: 'Ville de Rigaud',
            dateDebut: '2008',
            dateFin: '2012',
            actuel: false,
            description: 'Fonctions :\n• Donner des cours de natation à des enfants de 6 mois à 12 ans.\n• Prévenir des noyades en assurant la surveillance de la piscine lors des périodes d\'ouverture.'
          }
        ]
      },
      {
        id: 'sec-supp-m4',
        type: 'personnalisee',
        titre: 'INFORMATIONS SUPPLÉMENTAIRES',
        ordre: 4,
        visible: true,
        contenu: {
          typeLayout: 'liste',
          texteLibre: '• Bilingue (anglais-français)\n• Connaissances informatiques étendues (Suite Office - Internet - Courriel)\n• Permis de conduire\n• Membre du club de patin artistique\n\nRÉFÉRENCES SUR DEMANDE'
        }
      }
    ]
  },

  // ==================== MODEL 5: JOSEPH CARLIER (Photo 5) ====================
  'modele-5': {
    titre: 'CV Joseph Carlier — Réceptionniste',
    couleurAccent: '#3B8B88',
    police: 'Lato',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m5',
        type: 'profil',
        titre: 'PRÉSENTATION & CONTACTS',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Joseph Carlier',
          titreProfessionnel: 'Réceptionniste',
          email: 'joseph@carlier.site.com',
          telephone: '06.39.98.45.32',
          adresse: 'Brest, France',
          resume: 'Le renard brun rapide a sauté par-dessus le chien paresseux dans une mare scintillante d\'eau de pluie qui s\'était accumulée depuis le dernier gel. De douces grappes de feuilles tombent sans plan sur le sol.'
        }
      },
      {
        id: 'sec-exp-m5',
        type: 'experience',
        titre: 'Expériences',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Réceptionniste',
            entreprise: 'Hôtel des Cigales',
            dateDebut: '2025',
            dateFin: '2028',
            actuel: false
          },
          {
            id: 'exp-2',
            poste: 'Agent d\'accueil',
            entreprise: 'Thalasso L\'Otarie',
            dateDebut: '2022',
            dateFin: '2025',
            actuel: false
          },
          {
            id: 'exp-3',
            poste: 'Hôte et réception',
            entreprise: 'La Brise Resort',
            dateDebut: '2021',
            dateFin: '2022',
            actuel: false
          }
        ]
      },
      {
        id: 'sec-edu-m5',
        type: 'formation',
        titre: 'Éducation',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Baccalauréat Hôtellerie',
            etablissement: 'Brest, France',
            dateDebut: '2019',
            dateFin: '2019'
          },
          {
            id: 'edu-2',
            diplome: 'BTS Hôtellerie et restauration',
            etablissement: 'Meucon, France',
            dateDebut: '2021',
            dateFin: '2021'
          },
          {
            id: 'edu-3',
            diplome: 'Formation en gestion hôtelière',
            etablissement: 'Paris, France',
            dateDebut: '2022',
            dateFin: '2022'
          }
        ]
      },
      {
        id: 'sec-sk-m5',
        type: 'competences',
        titre: 'Compétences',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Accueil et réception', niveau: 5 },
          { id: 's-2', nom: 'Management', niveau: 4 },
          { id: 's-3', nom: 'Communication', niveau: 5 },
          { id: 's-4', nom: 'Adaptabilité', niveau: 5 },
          { id: 's-5', nom: 'Gestion administrative', niveau: 4 },
          { id: 's-6', nom: 'Respect des normes d\'hygiène', niveau: 5 }
        ]
      },
      {
        id: 'sec-lang-m5',
        type: 'langues',
        titre: 'Langues',
        ordre: 5,
        visible: true,
        contenu: [
          { id: 'l-1', langue: 'Anglais', niveau: 'niveau C2' },
          { id: 'l-2', langue: 'Espagnol', niveau: 'niveau B1' },
          { id: 'l-3', langue: 'Français', niveau: 'native' }
        ]
      }
    ]
  },

  // ==================== MODEL 6: INTÉRIMAIRE BLEU ROI (Photo 2) ====================
  'modele-6': {
    titre: 'CV Intérimaire Bleu Roi — Assistant Admin',
    couleurAccent: '#1D3557',
    police: 'Inter',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m6',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'PRÉNOM NOM',
          titreProfessionnel: 'INTÉRIMAIRE',
          email: 'prenom.nom@gmail.com',
          telephone: '+33 6 66 66 66 66',
          adresse: 'Ville, Pays',
          linkedin: 'linkedin.com/in/prenom-nom',
          resume: 'Je suis un professionnel polyvalent et organisé avec une solide expérience en tant qu\'assistant administratif. J\'ai démontré ma capacité à gérer efficacement les tâches administratives, à communiquer avec les clients et à résoudre les problèmes de manière proactive.'
        }
      },
      {
        id: 'sec-exp-m6',
        type: 'experience',
        titre: 'EXPÉRIENCES PROFESSIONNELLES',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Assistant Administratif',
            entreprise: 'Entreprise ABC',
            ville: 'Ville, Pays',
            dateDebut: '20XX',
            dateFin: '20XX',
            actuel: false,
            description: '• Gestion de l\'agenda du directeur général, organisation de réunions et programmation des déplacements.\n• Préparation de rapports et de présentations en utilisant Microsoft Office.\n• Traitement des appels téléphoniques et de la correspondance.'
          },
          {
            id: 'exp-2',
            poste: 'Assistant Administratif',
            entreprise: 'Entreprise XYZ',
            ville: 'Ville, Pays',
            dateDebut: '20XX',
            dateFin: '20XX',
            actuel: false,
            description: '• Saisie de données et mise à jour de bases de données clients.\n• Collaboration avec l\'équipe pour assurer le bon fonctionnement des opérations administratives.'
          }
        ]
      },
      {
        id: 'sec-edu-m6',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Bachelor en Gestion Administrative',
            etablissement: 'Établissement Supérieur',
            ville: 'Ville, Pays',
            dateDebut: '20XX',
            dateFin: '20XX',
            description: 'Cours pertinents: Gestion de projet, Communication d\'entreprise.'
          },
          {
            id: 'edu-2',
            diplome: 'Baccalauréat Économique',
            etablissement: 'Lycée Central',
            ville: 'Ville, Pays',
            dateDebut: '20XX',
            dateFin: '20XX'
          }
        ]
      },
      {
        id: 'sec-sk-m6',
        type: 'competences',
        titre: 'COMPÉTENCES',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Microsoft Office', niveau: 5 },
          { id: 's-2', nom: 'Trello & Notion', niveau: 4 },
          { id: 's-3', nom: 'Organisation', niveau: 5 },
          { id: 's-4', nom: 'Gestion du temps', niveau: 4 }
        ]
      },
      {
        id: 'sec-lang-m6',
        type: 'langues',
        titre: 'LANGUES',
        ordre: 5,
        visible: true,
        contenu: [
          { id: 'l-1', langue: 'Français', niveau: 'Maternelle' },
          { id: 'l-2', langue: 'Anglais', niveau: 'Avancé' },
          { id: 'l-3', langue: 'Espagnol', niveau: 'Intermédiaire' }
        ]
      },
      {
        id: 'sec-hob-m6',
        type: 'personnalisee',
        titre: 'CENTRES D\'INTÉRÊT',
        ordre: 6,
        visible: true,
        contenu: {
          typeLayout: 'liste',
          texteLibre: '• Randonnée en montagne\n• Cuisine française\n• Musique classique'
        }
      }
    ]
  },

  // ==================== MODEL 7: CÉLIA NAUDIN (Photo 3) ====================
  'modele-7': {
    titre: 'CV Célia Naudin — Beige Arch & Étoiles',
    couleurAccent: '#D8C3A5',
    police: 'Playfair Display',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m7',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Célia Naudin',
          titreProfessionnel: 'Chargée de communication',
          email: 'hello@reallygreatsite.com',
          telephone: '123-456-7890',
          adresse: '123 Anywhere St., Any City',
          resume: 'Chargée de communication créative et passionnée par le développement de stratégies de marque engageantes, la création de contenu et le community management.'
        }
      },
      {
        id: 'sec-exp-m7',
        type: 'experience',
        titre: 'Expériences',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Chargée de communication',
            entreprise: 'Groupe Frame',
            dateDebut: '2021',
            dateFin: '2026',
            actuel: false,
            description: '• Gestion de la stratégie de communication globale.\n• Développement et animation des réseaux sociaux.\n• Production de contenus éditoriaux et organisation d\'événements.'
          },
          {
            id: 'exp-2',
            poste: 'Assistante communication en alternance',
            entreprise: 'Bancollect',
            dateDebut: '2019',
            dateFin: '2020',
            actuel: false,
            description: '• Création et publication de contenus visuels et rédactionnels.\n• Participation à des projets de marketing digital et veille sectorielle.'
          }
        ]
      },
      {
        id: 'sec-edu-m7',
        type: 'formation',
        titre: 'Formations',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Master Communication en alternance',
            etablissement: 'École Amédé Autran',
            dateDebut: '2017',
            dateFin: '2020'
          },
          {
            id: 'edu-2',
            diplome: 'Licence Marketing Digital',
            etablissement: 'Université de Lyon',
            dateDebut: '2014',
            dateFin: '2017'
          }
        ]
      },
      {
        id: 'sec-sk-m7',
        type: 'competences',
        titre: 'Compétences',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Réseaux sociaux', niveau: 5 },
          { id: 's-2', nom: 'Graphisme', niveau: 4 },
          { id: 's-3', nom: 'Référencement SEO', niveau: 4 },
          { id: 's-4', nom: 'Montage Vidéo', niveau: 4 }
        ]
      },
      {
        id: 'sec-lang-m7',
        type: 'langues',
        titre: 'Langues',
        ordre: 5,
        visible: true,
        contenu: [
          { id: 'l-1', langue: 'Français', niveau: 'Langue maternelle' },
          { id: 'l-2', langue: 'Anglais', niveau: 'Courant' },
          { id: 'l-3', langue: 'Espagnol', niveau: 'Intermédiaire' }
        ]
      },
      {
        id: 'sec-hob-m7',
        type: 'personnalisee',
        titre: 'Loisirs',
        ordre: 6,
        visible: true,
        contenu: {
          typeLayout: 'liste',
          texteLibre: '• Mode\n• Photographie\n• Voyage'
        }
      }
    ]
  },

  // ==================== MODEL 8: MICHAEL JOHNSON (Photo 4) ====================
  'modele-8': {
    titre: 'CV Michael Johnson — Top Manager Hexagone',
    couleurAccent: '#1B2A4A',
    police: 'Outfit',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m8',
        type: 'profil',
        titre: 'ABOUT ME & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'MICHAEL JOHNSON',
          titreProfessionnel: 'Top Manager',
          email: 'michael.johnson@email.com',
          telephone: '(555) 010-0900',
          adresse: '123 Anywhere Street, City',
          resume: 'When you are writing plain text resumes, it\'s important to follow a few formatting guidelines and to fill your resume with targeted keywords. You will find more details about text resume format below.'
        }
      },
      {
        id: 'sec-exp-m8',
        type: 'experience',
        titre: 'EXPERIENCE',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Administrative Assistant',
            entreprise: 'ABC Company, City, State',
            dateDebut: '2016',
            dateFin: '2020',
            actuel: false,
            description: '• Use a combination of terms and nouns to describe tasks.\n• Don\'t forget to include a variety of targeted keywords.'
          },
          {
            id: 'exp-2',
            poste: 'Administrative Assistant',
            entreprise: 'ABC Company, City, State',
            dateDebut: '2009',
            dateFin: '2016',
            actuel: false,
            description: '• Managed daily operations and administrative staff.'
          },
          {
            id: 'exp-3',
            poste: 'Administrative Assistant',
            entreprise: 'ABC Company, City, State',
            dateDebut: '2004',
            dateFin: '2009',
            actuel: false,
            description: '• Handled client relationships and executive calendar.'
          }
        ]
      },
      {
        id: 'sec-edu-m8',
        type: 'formation',
        titre: 'EDUCATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Administrative Assistant Certificate',
            etablissement: 'Any College, City, State',
            dateDebut: '2002',
            dateFin: '2004'
          },
          {
            id: 'edu-2',
            diplome: 'Master of Business Administration',
            etablissement: 'State University',
            dateDebut: '2000',
            dateFin: '2002'
          }
        ]
      },
      {
        id: 'sec-sk-m8',
        type: 'competences',
        titre: 'PERSONAL SKILLS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Master of Business Administration', niveau: 5 },
          { id: 's-2', nom: 'Communication Strategy', niveau: 5 },
          { id: 's-3', nom: 'Team Leadership', niveau: 4 }
        ]
      }
    ]
  },

  // ==================== MODEL 9: BABACAR NDIAYE / SLATE EXECUTIVE ====================
  'modele-9': {
    titre: 'CV Babacar Ndiaye — Exécutif Ardoise',
    couleurAccent: '#2D3748',
    police: 'Roboto',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m9',
        type: 'profil',
        titre: 'PROFIL & COORDONNÉES',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Babacar Ndiaye',
          titreProfessionnel: 'Directeur d\'Exploitation',
          email: 'babacar.ndiaye@entreprise.sn',
          telephone: '+221 77 654 32 10',
          adresse: 'Dakar, Sénégal',
          linkedin: 'linkedin.com/in/babacar-ndiaye',
          resume: 'Cadre dirigeant fort de 12 ans d\'expérience dans le pilotage des opérations logistiques et la transformation digitale des processus d\'entreprise.'
        }
      },
      {
        id: 'sec-exp-m9',
        type: 'experience',
        titre: 'PARCOURS PROFESSIONNEL',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Directeur des Opérations',
            entreprise: 'Sénégal Logistics Group',
            dateDebut: '2021',
            dateFin: 'Présent',
            actuel: true,
            description: '• Supervision d\'une équipe de 45 collaborateurs et gestion d\'un budget annuel de 500M FCFA.\n• Optimisation de la chaîne d\'approvisionnement réduisant les délais de livraison de 25%.'
          },
          {
            id: 'exp-2',
            poste: 'Responsable Logistique',
            entreprise: 'Sipres SA, Dakar',
            dateDebut: '2016',
            dateFin: '2021',
            actuel: false,
            description: '• Implémentation du logiciel ERP SAP pour le suivi des stocks en temps réel.'
          }
        ]
      },
      {
        id: 'sec-edu-m9',
        type: 'formation',
        titre: 'FORMATION ACADÉMIQUE',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Master en Supply Chain Management',
            etablissement: 'BEM Dakar',
            dateDebut: '2014',
            dateFin: '2016'
          },
          {
            id: 'edu-2',
            diplome: 'Licence en Gestion des Entreprises',
            etablissement: 'Université Cheikh Anta Diop',
            dateDebut: '2011',
            dateFin: '2014'
          }
        ]
      },
      {
        id: 'sec-sk-m9',
        type: 'competences',
        titre: 'COMPÉTENCES CLÉS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Gestion de budget & P&L', niveau: 5 },
          { id: 's-2', nom: 'SAP & ERP Logistique', niveau: 5 },
          { id: 's-3', nom: 'Management d\'équipe', niveau: 5 },
          { id: 's-4', nom: 'Négociation fournisseurs', niveau: 4 }
        ]
      }
    ]
  },

  // ==================== MODEL 10: NOEL TAYLOR / STUDIO MINIMALISTE ====================
  'modele-10': {
    titre: 'CV Noel Taylor — Studio Minimaliste Noir',
    couleurAccent: '#1A202C',
    police: 'Poppins',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m10',
        type: 'profil',
        titre: 'PROFIL',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Noel Taylor',
          titreProfessionnel: 'Directeur Artistique & UX Lead',
          email: 'noel@taylorstudio.design',
          telephone: '+33 7 89 01 23 45',
          adresse: 'Bordeaux, France',
          siteWeb: 'www.taylorstudio.design',
          resume: 'Designer passionné par la création d\'expériences numériques minimalistes, épurées et axées sur l\'utilisateur final.'
        }
      },
      {
        id: 'sec-exp-m10',
        type: 'experience',
        titre: 'Expériences',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Lead UX/UI Designer',
            entreprise: 'Studio Minimal, Paris',
            dateDebut: '2022',
            dateFin: 'Présent',
            actuel: true,
            description: '• Conception de systèmes de design complets pour applications mobiles et web.\n• Animation d\'ateliers de co-conception avec les clients grands comptes.'
          },
          {
            id: 'exp-2',
            poste: 'Senior Graphic Designer',
            entreprise: 'Agence Pixel, Bordeaux',
            dateDebut: '2018',
            dateFin: '2022',
            actuel: false,
            description: '• Direction artistique de campagnes de communication digitale.'
          }
        ]
      },
      {
        id: 'sec-edu-m10',
        type: 'formation',
        titre: 'Formations',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Master Design Interactif & Direction Artistique',
            etablissement: 'ECV Digital',
            dateDebut: '2016',
            dateFin: '2018'
          }
        ]
      },
      {
        id: 'sec-sk-m10',
        type: 'competences',
        titre: 'Compétences',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Figma & Design Systems', niveau: 5 },
          { id: 's-2', nom: 'Prototypage & Micro-interactions', niveau: 5 },
          { id: 's-3', nom: 'Direction Artistique', niveau: 5 }
        ]
      }
    ]
  },

  // ==================== MODEL 11: BORDEAUX ROYAL & CADRE DORÉ ====================
  'modele-11': {
    titre: 'CV Bordeaux Royal & Liseré Doré',
    couleurAccent: '#800020',
    police: 'Georgia',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m11',
        type: 'profil',
        titre: 'PROFIL & COORDONNÉES',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Alexandre De La Tour',
          titreProfessionnel: 'Directeur Général & Stratège',
          email: 'alexandre.delatour@cabinet.fr',
          telephone: '+33 1 42 68 55 00',
          adresse: '8 Place Vendôme, 75001 Paris',
          linkedin: 'linkedin.com/in/alexandre-delatour',
          resume: 'Executive expérimenté cumulant plus de 15 années de direction d\'entreprises et de conseil en stratégie de croissance internationale. Expert en gouvernance et fusions-acquisitions.'
        }
      },
      {
        id: 'sec-exp-m11',
        type: 'experience',
        titre: 'EXPÉRIENCES DE DIRECTION',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Directeur Général Groupe',
            entreprise: 'Cabinet De La Tour & Associés',
            dateDebut: '2019',
            dateFin: 'Présent',
            actuel: true,
            description: '• Pilotage de la stratégie globale et gestion d\'un chiffre d\'affaires de 45 millions d\'euros.\n• Expansion sur 4 nouveaux marchés européens avec une croissance annuelle de 18%.'
          },
          {
            id: 'exp-2',
            poste: 'Vice-Président Stratégie',
            entreprise: 'Banque d\'Investissement Royale',
            dateDebut: '2012',
            dateFin: '2019',
            actuel: false,
            description: '• Direction des équipes de fusions-acquisitions et structuration de levées de fonds majeures.'
          }
        ]
      },
      {
        id: 'sec-edu-m11',
        type: 'formation',
        titre: 'HAUTES ÉTUDES',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Executive MBA',
            etablissement: 'INSEAD Fontainebleau',
            dateDebut: '2010',
            dateFin: '2011'
          },
          {
            id: 'edu-2',
            diplome: 'Master Finance & Stratégie',
            etablissement: 'Sciences Po Paris',
            dateDebut: '2005',
            dateFin: '2009'
          }
        ]
      },
      {
        id: 'sec-sk-m11',
        type: 'competences',
        titre: 'COMPÉTENCES DE GOUVERNANCE',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Gouvernance & Conseil d\'Administration', niveau: 5 },
          { id: 's-2', nom: 'Fusions & Acquisitions (M&A)', niveau: 5 },
          { id: 's-3', nom: 'Gestion de crise & Leadership', niveau: 5 }
        ]
      }
    ]
  },

  // ==================== MODEL 12: VERT ÉMERAUDE TECH & CONSULTING ====================
  'modele-12': {
    titre: 'CV Vert Émeraude — Tech & Consulting',
    couleurAccent: '#064E3B',
    police: 'Arial',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m12',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Karelle Mbida',
          titreProfessionnel: 'Consultante Senior Data & IA',
          email: 'karelle.mbida@data-consulting.cm',
          telephone: '+237 677 88 99 00',
          adresse: 'Yaoundé, Cameroun',
          linkedin: 'linkedin.com/in/karelle-mbida',
          resume: 'Experte en science des données et intelligence artificielle appliquée. Passionnée par la transformation des données brutes en leviers de décision stratégique.'
        }
      },
      {
        id: 'sec-exp-m12',
        type: 'experience',
        titre: 'EXPÉRIENCES TECH',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Consultante Data Science Senior',
            entreprise: 'Africa Analytics Lab',
            dateDebut: '2022',
            dateFin: 'Présent',
            actuel: true,
            description: '• Déploiement de modèles prédictifs pour le secteur bancaire et télécoms.\n• Optimisation d\'algorithmes d\'apprentissage automatique pour la détection de fraudes.'
          },
          {
            id: 'exp-2',
            poste: 'Ingénieure Data & BI',
            entreprise: 'MTN Cameroun',
            dateDebut: '2018',
            dateFin: '2022',
            actuel: false,
            description: '• Conception de pipelines ETL sécurisés et de dashboards décisionnels sur Power BI.'
          }
        ]
      },
      {
        id: 'sec-edu-m12',
        type: 'formation',
        titre: 'DIPLÔMES INGÉNIEUR',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Diplôme d\'Ingénieur en Big Data & IA',
            etablissement: 'École Nationale Supérieure Polytechnique',
            dateDebut: '2013',
            dateFin: '2018'
          }
        ]
      },
      {
        id: 'sec-sk-m12',
        type: 'competences',
        titre: 'LOGICIELS & OUTILS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Python (Pandas, Scikit-learn, PyTorch)', niveau: 5 },
          { id: 's-2', nom: 'SQL / PostgreSQL / Snowflake', niveau: 5 },
          { id: 's-3', nom: 'Power BI & Tableau', niveau: 4 }
        ]
      }
    ]
  },

  // ==================== MODEL 13: TERRACOTTA GÉOMÉTRIE ====================
  'modele-13': {
    titre: 'CV Terracotta — Marketing & Design',
    couleurAccent: '#C2410C',
    police: 'Montserrat',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m13',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Nadia Diallo',
          titreProfessionnel: 'Brand Manager & Brand Designer',
          email: 'nadia.diallo@brandstudio.com',
          telephone: '+221 78 123 45 67',
          adresse: 'Dakar, Sénégal',
          resume: 'Créative inspirée spécialisée dans le branding holistique, l\'identité de marque et les stratégies d\'engagement visuel.'
        }
      },
      {
        id: 'sec-exp-m13',
        type: 'experience',
        titre: 'EXPÉRIENCES BRANDING',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Brand Manager Senior',
            entreprise: 'Teranga Creative Agency',
            dateDebut: '2021',
            dateFin: 'Présent',
            actuel: true,
            description: '• Refonte complète de l\'image de marque de 12 grandes entreprises ouest-africaines.\n• Supervision de campagnes 360° sur réseaux sociaux et affichage urbain.'
          }
        ]
      },
      {
        id: 'sec-edu-m13',
        type: 'formation',
        titre: 'FORMATIONS ARTISTIQUES',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Master Direction Artistique',
            etablissement: 'Institut Supérieur des Arts de Dakar',
            dateDebut: '2016',
            dateFin: '2020'
          }
        ]
      },
      {
        id: 'sec-sk-m13',
        type: 'competences',
        titre: 'EXPERTISES',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Identité Visuelle & Branding', niveau: 5 },
          { id: 's-2', nom: 'Adobe Creative Suite', niveau: 5 },
          { id: 's-3', nom: 'Content Strategy', niveau: 4 }
        ]
      }
    ]
  },

  // ==================== MODEL 14: BLEU MARINE & LIGNES DORÉES ====================
  'modele-14': {
    titre: 'CV Bleu Marine & Or — Avocat & Finance',
    couleurAccent: '#0F172A',
    police: 'Times New Roman',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m14',
        type: 'profil',
        titre: 'COORDONNÉES ET PRÉSENTATION',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Maître Charles Koffi',
          titreProfessionnel: 'Avocat d\'Affaires / Juriste Senior',
          email: 'charles.koffi@cabinet-koffi.ci',
          telephone: '+225 07 08 09 10 11',
          adresse: 'Abidjan, Côte d\'Ivoire',
          resume: 'Avocat au Barreau spécialisé en droit des affaires de l\'OHADA, droit fiscal d\'entreprise et contentieux commercial complexe.'
        }
      },
      {
        id: 'sec-exp-m14',
        type: 'experience',
        titre: 'EXPÉRIENCE EN CABINET ET ENTREPRISE',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Avocat Associé - Droit des Affaires',
            entreprise: 'Cabinet Koffi & Associés',
            dateDebut: '2017',
            dateFin: 'Présent',
            actuel: true,
            description: '• Conseil juridique auprès de groupes industriels majeurs en Afrique de l\'Ouest.\n• Rédaction de contrats d\'affaires internationaux et négociation d\'accords commerciaux.'
          }
        ]
      },
      {
        id: 'sec-edu-m14',
        type: 'formation',
        titre: 'TITRES UNIVERSI TAIRES',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'CAPA & Master 2 Droit des Affaires OHADA',
            etablissement: 'Université Felix Houphouët-Boigny',
            dateDebut: '2010',
            dateFin: '2016'
          }
        ]
      },
      {
        id: 'sec-sk-m14',
        type: 'competences',
        titre: 'DOMAINES D\'EXPERTISE JURIDIQUE',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Droit commercial & des sociétés OHADA', niveau: 5 },
          { id: 's-2', nom: 'Contentieux & Arbitrage international', niveau: 5 },
          { id: 's-3', nom: 'Audit fiscal d\'entreprise', niveau: 4 }
        ]
      }
    ]
  },

  // ==================== MODEL 15: VERT OLIVE NATURE ====================
  'modele-15': {
    titre: 'CV Vert Olive Nature — Ingénierie & Dev',
    couleurAccent: '#3F6212',
    police: 'Calibri',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m15',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Serge Tchakounté',
          titreProfessionnel: 'Ingénieur DevOps & Cloud Architect',
          email: 'serge.tchakounte@cloudnet.io',
          telephone: '+237 699 00 11 22',
          adresse: 'Douala, Cameroun',
          resume: 'Ingénieur système et Cloud chevronné, spécialisé dans la mise en place d\'infrastructures résilientes, la conteneurisation Docker/Kubernetes et l\'automatisation CI/CD.'
        }
      },
      {
        id: 'sec-exp-m15',
        type: 'experience',
        titre: 'PARCOURS DÉVELOPPEMENT & CLOUD',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Lead DevOps & Cloud Engineer',
            entreprise: 'Fintech Cameroun SA',
            dateDebut: '2020',
            dateFin: 'Présent',
            actuel: true,
            description: '• Architecture de microservices hautement disponibles sur AWS et Google Cloud Platform.\n• Automatisation des déploiements avec Terraform et Ansible réduisant les pannes de 40%.'
          }
        ]
      },
      {
        id: 'sec-edu-m15',
        type: 'formation',
        titre: 'FORMATION ACADÉMIQUE',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Master en Réseaux, Télécoms & Cloud',
            etablissement: 'IAI Cameroun',
            dateDebut: '2015',
            dateFin: '2020'
          }
        ]
      },
      {
        id: 'sec-sk-m15',
        type: 'competences',
        titre: 'COMPÉTENCES TECHNIQUES',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Docker, Kubernetes, Helm', niveau: 5 },
          { id: 's-2', nom: 'AWS, GCP, Cloud Security', niveau: 5 },
          { id: 's-3', nom: 'Terraform, CI/CD GitHub Actions', niveau: 5 }
        ]
      }
    ]
  },

  // ==================== MODEL 16: CHARLES SARTRÉ (VERT CANARD) ====================
  'modele-16': {
    titre: 'CV Charles Sartré — Commercial Senior',
    couleurAccent: '#237A62',
    police: 'Arial',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m16',
        type: 'profil',
        titre: 'Informations Personnelles',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Charles Sartré',
          titreProfessionnel: 'Responsable commercial senior',
          email: 'charles.sartre@gmail.com',
          telephone: '+33 7 54 84 21 21',
          adresse: '75 000 Paris',
          linkedin: 'linkedin.com/in/charlessartrezety',
          resume: 'Responsable commercial B2B avec dix ans d\'expérience dans la gestion de comptes clients et d\'équipes commerciales dans les domaines de la haute technologie. Apte à gérer de vastes équipes de commerciaux tout en appliquant mon savoir-faire en stratégie de marché et d\'acquisition.'
        }
      },
      {
        id: 'sec-exp-m16',
        type: 'experience',
        titre: 'Expérience Professionnelle',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Responsable commercial B2B',
            entreprise: 'Cellnex Telecom, Paris',
            dateDebut: '01/2012',
            dateFin: '05/2020',
            actuel: false,
            description: '• Développer le portefeuille commercial (B2B) et fidéliser la clientèle.\n• Gérer les grands comptes essentiels.\n• Superviser une équipe de 20 commerciaux sédentaires et nomades.\n• Préparer et négocier les appels d\'offres.\n\nRésultats majeurs :\n• Augmentation du chiffre d\'affaires annuel de 25% en moyenne sur les 5 dernières années.'
          },
          {
            id: 'exp-2',
            poste: 'Commercial B2B',
            entreprise: 'Dell EMC France, Paris',
            dateDebut: '06/2009',
            dateFin: '12/2011',
            actuel: false,
            description: '• Effectuer la prospection dans la France entière.\n• Générer de nouveaux leads par démarchage.\n• Convenir et négocier les contrats.'
          }
        ]
      },
      {
        id: 'sec-edu-m16',
        type: 'formation',
        titre: 'Formation',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Licence professionnelle commerce',
            etablissement: 'Akor Alternance, Paris',
            dateDebut: '09/2008',
            dateFin: '06/2009'
          },
          {
            id: 'edu-2',
            diplome: 'BTS NRC (Négociation Relation Client)',
            etablissement: 'Akor Alternance, Paris',
            dateDebut: '09/2006',
            dateFin: '06/2008'
          }
        ]
      },
      {
        id: 'sec-sk-m16',
        type: 'competences',
        titre: 'Compétences',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Gestion d\'équipe commerciale', niveau: 5, categorie: 'Management' },
          { id: 's-2', nom: 'Stratégie commerciale & marché', niveau: 5, categorie: 'Vente B2B' },
          { id: 's-3', nom: 'Négociation & Force de proposition', niveau: 5, categorie: 'Vente B2B' },
          { id: 's-4', nom: 'Microsoft CRM & Salesforce', niveau: 4, categorie: 'Informatique' }
        ]
      }
    ]
  },

  // ==================== MODEL 17: THOMAS DURANT (NAVY ARCH) ====================
  'modele-17': {
    titre: 'CV Thomas Durant — Contrôleur de Gestion',
    couleurAccent: '#0A192F',
    police: 'Montserrat',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m17',
        type: 'profil',
        titre: 'CONTACT & PROFIL',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Thomas DURANT',
          titreProfessionnel: 'CONTRÔLEUR DE GESTION',
          email: 'thomas.durant@mail.com',
          telephone: '+33 6 66 66 66 66',
          adresse: 'Paris, France',
          linkedin: 'linkedin.com/in/mon-profil',
          resume: 'Expert en pilotage de la performance avec 8 ans d\'expérience. Spécialiste de l\'optimisation des coûts et des processus budgétaires, j\'agis en véritable Business Partner pour transformer la donnée financière en leviers de croissance.'
        }
      },
      {
        id: 'sec-exp-m17',
        type: 'experience',
        titre: 'EXPÉRIENCES PROFESSIONNELLES',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'CONTRÔLEUR DE GESTION SENIOR',
            entreprise: 'Groupe Saint-Gobain (Siège - La Défense)',
            dateDebut: '01/201X',
            dateFin: 'En cours',
            actuel: true,
            description: '• Périmètre : Supervision de la Business Unit "Solutions Haute Performance" (CA de 210M€).\n• Réalisation phare : Pilotage de la convergence des indicateurs financiers suite à l\'acquisition d\'une filiale européenne.\n• Reporting : Élaboration des tableaux de bord mensuels pour le Comité de Direction sous SAP S/4HANA.'
          },
          {
            id: 'exp-2',
            poste: 'CONTRÔLEUR DE GESTION JUNIOR',
            entreprise: 'Groupe Carrefour (Siège France)',
            dateDebut: '09/201X',
            dateFin: '12/201X',
            actuel: false,
            description: '• Gestion opérationnelle : Analyse de la rentabilité de 45 hypermarchés de la région Île-de-France.\n• Budget : Co-animation des navettes budgétaires avec les directeurs de magasins.'
          }
        ]
      },
      {
        id: 'sec-edu-m17',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'MASTER 2 - CONTRÔLE DE GESTION',
            etablissement: 'Université Paris-Dauphine',
            dateDebut: '201X',
            dateFin: '201X'
          }
        ]
      },
      {
        id: 'sec-sk-m17',
        type: 'competences',
        titre: 'COMPÉTENCES & LOGICIELS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Pilotage Financier & Investissements', niveau: 5, categorie: 'Finance' },
          { id: 's-2', nom: 'SAP S/4HANA & Power BI', niveau: 5, categorie: 'Logiciels' },
          { id: 's-3', nom: 'Excel Avancé & Tableau Software', niveau: 5, categorie: 'Logiciels' }
        ]
      }
    ]
  },

  // ==================== MODEL 18: SLATE & GOLD BANNERS ====================
  'modele-18': {
    titre: 'CV Ardoise & Bannières Dorées',
    couleurAccent: '#3A4750',
    police: 'Inter',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m18',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Prénom Nom',
          titreProfessionnel: 'Poste Occupé ou Recherché',
          email: 'nom.prenom@gmail.com',
          telephone: '06 06 06 06 06',
          adresse: 'Ville, Pays',
          resume: 'Professionnel rigoureux et méthodique disposant d\'une expérience significative dans la gestion stratégique, l\'organisation d\'équipes pluridisciplinaires et la conduite de projets d\'envergure.'
        }
      },
      {
        id: 'sec-exp-m18',
        type: 'experience',
        titre: 'EXPÉRIENCE PROFESSIONNELLE',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Poste occupé',
            entreprise: 'Nom de l\'Entreprise | Ville',
            dateDebut: '20XX',
            dateFin: '20XX',
            actuel: false,
            description: '• Gestion opérationnelle quotidienne des activités et encadrement des équipes.\n• Suivi des objectifs et mise en place d\'outils d\'amélioration continue de la qualité.'
          },
          {
            id: 'exp-2',
            poste: 'Poste occupé',
            entreprise: 'Nom de l\'Entreprise | Ville',
            dateDebut: '20XX',
            dateFin: '20XX',
            actuel: false,
            description: '• Coordination des projets clients et élaboration des rapports d\'activité stratégiques.'
          }
        ]
      },
      {
        id: 'sec-edu-m18',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Diplôme obtenu',
            etablissement: 'Université, lycée ou école',
            dateDebut: '20XX',
            dateFin: '20XX'
          }
        ]
      },
      {
        id: 'sec-sk-m18',
        type: 'competences',
        titre: 'COMPÉTENCES',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Google Drive & Outils Collaboratifs', niveau: 5, categorie: 'Bureautique' },
          { id: 's-2', nom: 'Travail en équipe & Leadership', niveau: 5, categorie: 'Soft Skills' },
          { id: 's-3', nom: 'Gestion de crise & SEO', niveau: 4, categorie: 'Spécialité' }
        ]
      }
    ]
  },

  // ==================== MODEL 19: BLEU ROI INTÉRIMAIRE ====================
  'modele-19': {
    titre: 'CV Bleu Roi Intérimaire Pro',
    couleurAccent: '#1E3A8A',
    police: 'Roboto',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m19',
        type: 'profil',
        titre: 'PROFIL & CONTACT',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'PRÉNOM NOM',
          titreProfessionnel: 'INTÉRIMAIRE / ASSISTANT',
          email: 'prenom.nom@gmail.com',
          telephone: '+33 6 66 66 66 66',
          adresse: 'Paris, France',
          linkedin: 'linkedin.com/in/prenom.nom',
          resume: 'Je suis un professionnel polyvalent et organisé avec une solide expérience en tant qu\'assistant administratif. J\'ai démontré ma capacité à gérer efficacement les tâches quotidiennes, communiquer avec les clients et résoudre les problèmes.'
        }
      },
      {
        id: 'sec-exp-m19',
        type: 'experience',
        titre: 'EXPÉRIENCES PROFESSIONNELLES',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Assistant Administratif',
            entreprise: 'Entreprise ABC',
            dateDebut: '20XX',
            dateFin: '20XX',
            actuel: false,
            description: '• Gestion de l\'agenda du directeur général, organisation de réunions et programmation des déplacements.\n• Préparation de rapports et de présentations en utilisant Microsoft Office.'
          },
          {
            id: 'exp-2',
            poste: 'Assistant Administratif',
            entreprise: 'Entreprise XYZ',
            dateDebut: '20XX',
            dateFin: '20XX',
            actuel: false,
            description: '• Traitement des appels téléphoniques et de la correspondance.\n• Saisie de données et mise à jour de bases de données clients.'
          }
        ]
      },
      {
        id: 'sec-edu-m19',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'Bachelor en Gestion Administrative',
            etablissement: 'Établissement Supérieur',
            dateDebut: '20XX',
            dateFin: '20XX'
          }
        ]
      },
      {
        id: 'sec-sk-m19',
        type: 'competences',
        titre: 'COMPÉTENCES & OUTILS',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Microsoft Office & Trello', niveau: 5, categorie: 'Logiciels' },
          { id: 's-2', nom: 'Organisation & Time Management', niveau: 5, categorie: 'Savoir-être' },
          { id: 's-3', nom: 'Français (Maternelle), Anglais (Courant)', niveau: 4, categorie: 'Langues' }
        ]
      }
    ]
  },

  // ==================== MODEL 20: MICHEL MARTIN (COURBES VERTES) ====================
  'modele-20': {
    titre: 'CV Michel Martin — Courbes Vertes',
    couleurAccent: '#65A30D',
    police: 'Trebuchet MS',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sections: [
      {
        id: 'sec-p-m20',
        type: 'profil',
        titre: 'Coordonnées & Titre',
        ordre: 1,
        visible: true,
        contenu: {
          nomComplet: 'Michel MARTIN',
          titreProfessionnel: 'Chef de projet internet / multimédia',
          email: 'michel.martin@primocv.com',
          telephone: '01 00 00 00 00 / 06 00 00 00 00',
          adresse: '320 avenue de la Liberté apt 7B, 75000 Paris',
          siteWeb: 'www.monsite.com',
          resume: 'Chef de projet multimédia passionné par le webdesign, le développement interactif et la création graphique 3D.'
        }
      },
      {
        id: 'sec-exp-m20',
        type: 'experience',
        titre: 'PRINCIPALES EXPÉRIENCES PROFESSIONNELLES',
        ordre: 2,
        visible: true,
        contenu: [
          {
            id: 'exp-1',
            poste: 'Chef de projet',
            entreprise: 'Agence Combo',
            dateDebut: 'août 2009',
            dateFin: 'juillet 2011',
            actuel: false,
            description: '• Gestion de Projet | Réalisation de CD-ROM multimédias et plaquettes institutionnelles.'
          },
          {
            id: 'exp-2',
            poste: 'Infographiste',
            entreprise: 'Groupe Danone',
            dateDebut: 'décembre 2003',
            dateFin: 'mai 2009',
            actuel: false,
            description: '• Réalisation de la campagne de promotion internet et supports PLV.'
          }
        ]
      },
      {
        id: 'sec-edu-m20',
        type: 'formation',
        titre: 'FORMATION',
        ordre: 3,
        visible: true,
        contenu: [
          {
            id: 'edu-1',
            diplome: 'École des beaux arts de Dijon',
            etablissement: 'Dijon',
            dateDebut: '1999',
            dateFin: '2000'
          }
        ]
      },
      {
        id: 'sec-sk-m20',
        type: 'competences',
        titre: 'DOMAINES DE COMPÉTENCES',
        ordre: 4,
        visible: true,
        contenu: [
          { id: 's-1', nom: 'Création 3D (Concept, artwork, modélisation)', niveau: 5, categorie: '3D & Motion' },
          { id: 's-2', nom: 'Web Design (XHTML/CSS, Dreamweaver)', niveau: 5, categorie: 'Web' },
          { id: 's-3', nom: 'Graphisme (Illustrator, Photoshop, Quark)', niveau: 5, categorie: 'Design' },
          { id: 's-4', nom: 'Vidéos (Première, After Effects, 3ds Max)', niveau: 4, categorie: 'Vidéo' }
        ]
      }
    ]
  }
};

export function getPresetForTemplate(templateId: string, langue: Language = 'fr'): CVTemplatePreset {
  if (TEMPLATE_PRESETS[templateId]) {
    return TEMPLATE_PRESETS[templateId];
  }
  return TEMPLATE_PRESETS['modele-1'];
}
