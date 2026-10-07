export interface JobLandingPage {
  slug: string;
  metier: string;
  secteur: string;
  templateRecommandeId: string;
  templatesRecommandes?: string[];
  competencesCles: string[];
  outilsTypiques?: string[];
  amorceProfil: string;
  descriptionHero?: string;
  accroche?: string;
  metiersConnexes?: string[];
  faqs?: Array<{ question: string; reponse: string }>;
  ordreSectionsSuggere?: string[];
  imageUrl?: string;
  motsClesRecherches?: string[];
  pointsFortsRecruteurs?: string[];
  salairesIndicatifs?: {
    debutant: string;
    confirme: string;
    senior: string;
  };
  motsClesAts?: string[];
}

export const SECTEUR_LABELS: Record<string, { label: string; accent: string; fr: string; icon: string }> = {
  tech: { label: 'Technologie', accent: '#2563EB', fr: 'Technologie', icon: '💻' },
  marketing: { label: 'Marketing', accent: '#EC4899', fr: 'Marketing', icon: '📈' },
  finance: { label: 'Finance', accent: '#B45309', fr: 'Finance', icon: '📊' },
  commerce: { label: 'Commerce', accent: '#10B981', fr: 'Commerce', icon: '🛍️' },
  rh: { label: 'Ressources Humaines', accent: '#7C3AED', fr: 'RH', icon: '👥' },
  management: { label: 'Management', accent: '#0F172A', fr: 'Management', icon: '📋' },
  autre: { label: 'Autre', accent: '#475569', fr: 'Autre', icon: '✨' }
};

const jobEntries: Array<Omit<JobLandingPage, 'faqs' | 'metiersConnexes' | 'ordreSectionsSuggere'> & {
  faqs?: Array<{ question: string; reponse: string }>;
  metiersConnexes?: string[];
  ordreSectionsSuggere?: string[];
}> = [
  {
    slug: 'cv-developpeur-fullstack',
    metier: 'Développeur Fullstack',
    secteur: 'tech',
    templateRecommandeId: 'tc-04-azure',
    templatesRecommandes: ['tc-04-azure', 'tc-09-sky', 'sc-06-tech', 'sc-11-bento', 'tc-21-aqua'],
    competencesCles: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'API REST', 'SQL'],
    outilsTypiques: ['React', 'Node.js', 'PostgreSQL', 'GitHub', 'Docker'],
    amorceProfil: 'Développeur fullstack orienté produit, capable de concevoir des interfaces fluides et des services fiables pour des projets à forte valeur ajoutée.',
    descriptionHero: 'Créez un CV de développeur fullstack clair, technique et conforme aux attentes des recruteurs tech.',
    accroche: 'Concevez un CV qui met en avant vos compétences techniques et votre capacité à livrer des produits fiables.',
    metiersConnexes: ['cv-developpeur-backend', 'cv-developpeur-front-end', 'cv-data-analyst'],
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['fullstack', 'javascript', 'react', 'api', 'node', 'backend'],
    pointsFortsRecruteurs: ['Expérience produit et API', 'Capacité à livrer en autonomie', 'Stack moderne et claire'],
    salairesIndicatifs: { debutant: '32k€', confirme: '45k€', senior: '60k€+' },
    motsClesAts: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'API REST'],
    faqs: [
      { question: 'Quel modèle choisir pour un poste de développeur ?', reponse: 'Un modèle 2 colonnes technique est souvent le plus lisible pour présenter les compétences, projets et stack techniques.' },
      { question: 'Dois-je mettre mes projets en avant ?', reponse: 'Oui, les projets sont un point fort pour les profils tech. Mettez en avant les briques clés, impact business et technologies utilisées.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'projets', 'competences', 'formation']
  },
  {
    slug: 'cv-data-analyst',
    metier: 'Data Analyst',
    secteur: 'tech',
    templateRecommandeId: 'tc-09-sky',
    templatesRecommandes: ['tc-09-sky', 'tc-24-signal', 'sc-17-cyan', 'sc-14-compact-ats', 'tc-05-forest'],
    competencesCles: ['Power BI', 'SQL', 'Excel', 'Analyse de données', 'KPIs', 'Tableau'],
    outilsTypiques: ['Power BI', 'Excel', 'SQL', 'Python', 'Tableau'],
    amorceProfil: 'Data analyst orienté insights et performance, capable de transformer les données en recommandations actionnables et d’accompagner les décisions.',
    descriptionHero: 'Présentez vos compétences analytics et votre impact sur les performances business avec un CV structuré et lisible.',
    accroche: 'Mettez vos KPI, analyses et recommandations au cœur de votre candidature.',
    metiersConnexes: ['cv-product-manager', 'cv-gestionnaire-de-projet'],
    imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['data analyst', 'power bi', 'sql', 'kpi', 'tableau', 'bi'],
    pointsFortsRecruteurs: ['Analyse décisionnelle', 'Impact sur la performance', 'Qualité de reporting'],
    salairesIndicatifs: { debutant: '30k€', confirme: '42k€', senior: '55k€+' },
    motsClesAts: ['Power BI', 'SQL', 'Excel', 'KPIs', 'Tableau', 'Analyse de données'],
    faqs: [
      { question: 'Faut-il mettre les outils en évidence ?', reponse: 'Oui, surtout les outils de data : Excel, SQL, Power BI, Tableau, Python. Ils sont souvent décisifs pour les recruteurs.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-developpeur-backend',
    metier: 'Développeur Backend',
    secteur: 'tech',
    templateRecommandeId: 'sc-06-tech',
    templatesRecommandes: ['sc-06-tech', 'tc-21-aqua', 'tc-09-sky', 'tc-04-azure', 'tc-32-orbit'],
    competencesCles: ['API', 'Java', 'Python', 'Architecture', 'Base de données', 'Microservices'],
    outilsTypiques: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    amorceProfil: 'Développeur backend structuré, orienté fiabilité, sécurité et gestion des données pour des services à forte exigence opérationnelle.',
    descriptionHero: 'Mettez en valeur vos compétences backend, vos API et votre capacité à concevoir des systèmes fiables et évolutifs.',
    accroche: 'Un profil sérieux et technique pour montrer votre maîtrise des systèmes et des données.',
    metiersConnexes: ['cv-developpeur-fullstack', 'cv-devops'],
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['backend', 'api', 'java', 'python', 'microservices', 'architecture'],
    pointsFortsRecruteurs: ['Systèmes fiables', 'API robustes', 'Connaissance bases de données'],
    salairesIndicatifs: { debutant: '33k€', confirme: '47k€', senior: '62k€+' },
    motsClesAts: ['API', 'Java', 'Python', 'Microservices', 'SQL', 'Architecture'],
    faqs: [
      { question: 'Que mettre en avant sur un CV backend ?', reponse: 'Mettez l’accent sur les APIs, la qualité de code, la performance, la sécurité et les systèmes de données.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'projets', 'competences', 'formation']
  },
  {
    slug: 'cv-developpeur-front-end',
    metier: 'Développeur Front-end',
    secteur: 'tech',
    templateRecommandeId: 'sc-11-bento',
    templatesRecommandes: ['sc-11-bento', 'tc-24-signal', 'sc-05-coral', 'tc-04-azure', 'sc-15-metro'],
    competencesCles: ['HTML', 'CSS', 'JavaScript', 'UX', 'Accessibilité', 'Performance'],
    outilsTypiques: ['Vue', 'React', 'Figma', 'Webpack', 'Storybook'],
    amorceProfil: 'Développeur front-end créatif et orienté qualité d’expérience, capable de transformer des designs en interfaces fluide et performantes.',
    descriptionHero: 'Présentez vos interfaces, votre sens du détail et votre capacité à livrer des expériences digitales fluides.',
    accroche: 'Vos compétences UI, performance et expérience utilisateur doivent être visibles immédiatement.',
    metiersConnexes: ['cv-developpeur-fullstack', 'cv-ux-designer'],
    imageUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['frontend', 'react', 'javascript', 'html', 'css', 'accessibilite'],
    pointsFortsRecruteurs: ['UI performante', 'Expérience utilisateur', 'Code maintenable'],
    salairesIndicatifs: { debutant: '31k€', confirme: '44k€', senior: '58k€+' },
    motsClesAts: ['HTML', 'CSS', 'JavaScript', 'React', 'UX', 'Performance'],
    faqs: [
      { question: 'Le design compte-t-il autant que le code ?', reponse: 'Oui, les recruteurs recherchent des profils capables d’allier qualité fonctionnelle, esthétique et performance.' }
    ],
    ordreSectionsSuggere: ['profil', 'projets', 'experience', 'competences', 'formation']
  },
  {
    slug: 'cv-data-scientist',
    metier: 'Data Scientist',
    secteur: 'tech',
    templateRecommandeId: 'tc-32-orbit',
    templatesRecommandes: ['tc-32-orbit', 'tc-09-sky', 'sc-34-pixel-work', 'tc-31-cascade', 'sc-17-cyan'],
    competencesCles: ['Python', 'Machine Learning', 'Modélisation', 'Statistiques', 'Visualisation', 'Scikit-learn'],
    outilsTypiques: ['Python', 'SQL', 'TensorFlow', 'Power BI', 'Jupyter'],
    amorceProfil: 'Data scientist mêlant analyse statistique, modélisation et communication business pour synthétiser des recommandations utiles.',
    descriptionHero: 'Valorisez votre sens de la donnée, la qualité de vos modèles et votre capacité à transformer des données complexes en décisions.',
    accroche: 'Un CV qui associe preuve analytique, impact business et clarté de communication.',
    metiersConnexes: ['cv-data-analyst', 'cv-product-manager'],
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['machine learning', 'python', 'ml', 'data science', 'statistiques', 'ai'],
    pointsFortsRecruteurs: ['Modélisation', 'Visualisation', 'Décision business'],
    salairesIndicatifs: { debutant: '38k€', confirme: '52k€', senior: '70k€+' },
    motsClesAts: ['Python', 'Machine Learning', 'Modélisation', 'Statistiques', 'SQL', 'Data'],
    faqs: [
      { question: 'Faut-il insister sur les projets ?', reponse: 'Oui, surtout si vous avez construit des modèles, des dashboards ou des expérimentations concrètes.' }
    ],
    ordreSectionsSuggere: ['profil', 'projets', 'experience', 'competences', 'formation']
  },
  {
    slug: 'cv-product-manager',
    metier: 'Product Manager',
    secteur: 'tech',
    templateRecommandeId: 'tc-31-cascade',
    templatesRecommandes: ['tc-31-cascade', 'tc-01-corporate', 'sc-21-glass', 'tc-24-signal', 'sc-35-lotus'],
    competencesCles: ['Roadmap', 'Priorisation', 'UX', 'Analyse produit', 'KPI', 'Stratégie'],
    outilsTypiques: ['Jira', 'Notion', 'Figma', 'Mixpanel', 'Google Analytics'],
    amorceProfil: 'Product manager orienté valeur client et performance business, capable de piloter la stratégie produit et d’aligner les équipes.',
    descriptionHero: 'Mettez en avant votre vision produit, votre sens des priorités et votre impact sur la croissance ou l’expérience client.',
    accroche: 'Un CV qui montre que vous savez aligner stratégie, produit et résultats.',
    metiersConnexes: ['cv-chef-de-projet', 'cv-data-analyst'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['product manager', 'roadmap', 'kpi', 'ux', 'strategie', 'priorisation'],
    pointsFortsRecruteurs: ['Vision produit', 'Priorisation', 'Alignement équipes'],
    salairesIndicatifs: { debutant: '40k€', confirme: '55k€', senior: '75k€+' },
    motsClesAts: ['Roadmap', 'KPI', 'UX', 'Priorisation', 'Stratégie', 'Produit'],
    faqs: [
      { question: 'Le produit doit-il figurer en premier ?', reponse: 'Oui, un product manager doit montrer sa capacité à structurer la stratégie, la feuille de route et les résultats d’impact.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-ux-designer',
    metier: 'UX Designer',
    secteur: 'marketing',
    templateRecommandeId: 'sc-05-coral',
    templatesRecommandes: ['sc-05-coral', 'tc-25-petal', 'tc-08-rose', 'sc-19-sylvie', 'sc-29-pastel'],
    competencesCles: ['UX Research', 'Wireframing', 'Design system', 'Figma', 'Prototypage', 'Tests utilisateurs'],
    outilsTypiques: ['Figma', 'Notion', 'Maze', 'Adobe XD', 'Miro'],
    amorceProfil: 'UX designer créatif et centré utilisateur, capable d’identifier des besoins, prototyper des parcours et améliorer l’expérience digitale.',
    descriptionHero: 'Présentez votre sens du design, vos projets utilisateur et votre capacité à concevoir des expériences inspirantes.',
    accroche: 'Mettez en avant vos recherches, prototypes et impact utilisateur.',
    metiersConnexes: ['cv-ui-designer', 'cv-product-manager'],
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['ux design', 'figma', 'prototypage', 'wireframe', 'tests utilisateurs', 'design system'],
    pointsFortsRecruteurs: ['Centricité client', 'Prototypage', 'Expérience utilisateur'],
    salairesIndicatifs: { debutant: '32k€', confirme: '45k€', senior: '60k€+' },
    motsClesAts: ['UX Research', 'Figma', 'Wireframing', 'Prototypage', 'Design System', 'Tests utilisateurs'],
    faqs: [
      { question: 'Le portfolio est-il indispensable ?', reponse: 'Oui, il renforce votre candidature. Sur le CV, ajoutez toutefois quelques projets et résultats concrets.' }
    ],
    ordreSectionsSuggere: ['profil', 'projets', 'experience', 'competences', 'formation']
  },
  {
    slug: 'cv-growth-marketer',
    metier: 'Growth Marketer',
    secteur: 'marketing',
    templateRecommandeId: 'tc-23-lilac',
    templatesRecommandes: ['tc-23-lilac', 'tc-27-ripple', 'tc-16-mint', 'sc-29-pastel', 'sc-03-emerald'],
    competencesCles: ['Acquisition', 'SEO', 'Performance marketing', 'A/B testing', 'Analytics', 'CRM'],
    outilsTypiques: ['Google Ads', 'HubSpot', 'GA4', 'Looker Studio', 'Mailchimp'],
    amorceProfil: 'Growth marketer orienté résultats, capable d’optimiser l’acquisition et la conversion à travers des campagnes mesurables et testées.',
    descriptionHero: 'Présentez votre expertise acquisition, optimisation et analyse d’impact marketing avec un CV orienté résultats.',
    accroche: 'Mettez en avant vos campagnes, vos KPIs et vos gains d’efficacité.',
    metiersConnexes: ['cv-seo-specialist', 'cv-community-manager'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['growth marketing', 'seo', 'acquisition', 'ab testing', 'analytics', 'crm'],
    pointsFortsRecruteurs: ['Acquisition', 'Optimisation', 'Mesure de performance'],
    salairesIndicatifs: { debutant: '30k€', confirme: '42k€', senior: '58k€+' },
    motsClesAts: ['Growth Marketing', 'SEO', 'A/B Testing', 'Analytics', 'CRM', 'Acquisition'],
    faqs: [
      { question: 'Doit-on montrer des résultats chiffrés ?', reponse: 'Oui, les recruteurs valorisent les gains de conversion, d’acquisition ou d’efficacité obtenus sur les campagnes.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-community-manager',
    metier: 'Community Manager',
    secteur: 'marketing',
    templateRecommandeId: 'sc-24-sunset',
    templatesRecommandes: ['sc-24-sunset', 'tc-23-lilac', 'tc-28-spring', 'sc-21-glass', 'sc-05-coral'],
    competencesCles: ['Community management', 'Réseaux sociaux', 'Stratégie éditoriale', 'Engagement', 'Branding', 'Analyse'],
    outilsTypiques: ['Instagram', 'LinkedIn', 'Hootsuite', 'Canva', 'Meta Business Suite'],
    amorceProfil: 'Community manager créatif et orienté audiences, capable de structurer des contenus, fédérer une communauté et renforcer la présence digitale.',
    descriptionHero: 'Mettez en valeur votre sens du storytelling, de la relation communautaire et de l’engagement des audiences.',
    accroche: 'Un CV qui combine créativité, stratégie et performance d’engagement.',
    metiersConnexes: ['cv-content-manager', 'cv-growth-marketer'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['community manager', 'réseaux sociaux', 'branding', 'engagement', 'social media', 'content'],
    pointsFortsRecruteurs: ['Relation audience', 'Contenus', 'Évolution de marque'],
    salairesIndicatifs: { debutant: '28k€', confirme: '38k€', senior: '50k€+' },
    motsClesAts: ['Community Management', 'Réseaux Sociaux', 'Branding', 'Engagement', 'Social Media', 'Content'],
    faqs: [
      { question: 'Peut-on valoriser les résultats sur les réseaux ?', reponse: 'Oui, les chiffres de portée, engagement, conversion et fidélisation peuvent faire la différence.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-seo-specialist',
    metier: 'SEO Specialist',
    secteur: 'marketing',
    templateRecommandeId: 'tc-16-mint',
    templatesRecommandes: ['tc-16-mint', 'tc-24-signal', 'sc-15-metro', 'sc-17-cyan', 'tc-23-lilac'],
    competencesCles: ['SEO on-page', 'SEO off-page', 'Google Search Console', 'Analytics', 'Contenus', 'Mots-clés'],
    outilsTypiques: ['Search Console', 'Screaming Frog', 'Ahrefs', 'Semrush', 'Google Analytics'],
    amorceProfil: 'SEO specialist capable d’améliorer la visibilité d’un site, de structurer la stratégie éditoriale et de mesurer l’impact organique sur le trafic.',
    descriptionHero: 'Mettez en avant les résultats SEO, la qualité de vos audits et votre capacité à améliorer la visibilité naturelle.',
    accroche: 'Une candidature claire et orientée performance organique et trafic qualifié.',
    metiersConnexes: ['cv-content-manager', 'cv-growth-marketer'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['seo', 'search console', 'référencement', 'mots clés', 'analytics', 'semrush'],
    pointsFortsRecruteurs: ['Vision SEO', 'Performance', 'Analyse de trafic'],
    salairesIndicatifs: { debutant: '29k€', confirme: '41k€', senior: '55k€+' },
    motsClesAts: ['SEO', 'Google Search Console', 'Analytics', 'Mots-clés', 'Référencement', 'Contenus'],
    faqs: [
      { question: 'Le SEO est-il visible sur un CV ?', reponse: 'Oui, si vous montrez des gains de trafic, positionnement ou visibilité organique sur des projets concrets.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-content-manager',
    metier: 'Content Manager',
    secteur: 'marketing',
    templateRecommandeId: 'tc-28-spring',
    templatesRecommandes: ['tc-28-spring', 'sc-24-sunset', 'tc-23-lilac', 'tc-27-ripple', 'sc-03-emerald'],
    competencesCles: ['Stratégie éditoriale', 'SEO', 'Rédaction', 'Brand content', 'Planning', 'Analyse de performance'],
    outilsTypiques: ['Canva', 'WordPress', 'Google Docs', 'Semrush', 'Hootsuite'],
    amorceProfil: 'Content manager bilingue et orienté storytelling, capable d’élaborer une stratégie éditoriale cohérente et pertinente.',
    descriptionHero: 'Mettez en avant votre capacité à produire du contenu utile, cohérent et performant pour l’audience et la marque.',
    accroche: 'Un CV qui démontre vos compétences de rédaction, de planification et d’impact éditorial.',
    metiersConnexes: ['cv-community-manager', 'cv-seo-specialist'],
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['content manager', 'rédaction', 'seo', 'editorial', 'storytelling', 'wordpress'],
    pointsFortsRecruteurs: ['Rédaction', 'Stratégie éditoriale', 'Brand content'],
    salairesIndicatifs: { debutant: '28k€', confirme: '39k€', senior: '52k€+' },
    motsClesAts: ['Rédaction', 'SEO', 'Content Strategy', 'WordPress', 'Branding', 'Editorial'],
    faqs: [
      { question: 'Doit-on valoriser la création de contenus ?', reponse: 'Oui, surtout en montrant la cohérence éditoriale, la qualité de publication et l’impact sur la notoriété ou les conversions.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-chef-de-projet',
    metier: 'Chef de projet',
    secteur: 'management',
    templateRecommandeId: 'tc-01-corporate',
    templatesRecommandes: ['tc-01-corporate', 'sc-20-baxter', 'tc-11-onyx', 'sc-08-nordic', 'tc-13-sage'],
    competencesCles: ['Pilotage de projet', 'Gestion des risques', 'Planification', 'Parties prenantes', 'Reporting', 'Agilité'],
    outilsTypiques: ['Jira', 'Notion', 'Excel', 'PowerPoint', 'Slack'],
    amorceProfil: 'Chef de projet expérimenté, capable de piloter des transformations, organiser les équipes et garantir la réussite des programmes dans des environnements exigeants.',
    descriptionHero: 'Valorisez votre capacité à piloter des projets complexes et à créer de la valeur pour les organisations.',
    accroche: 'Mettez en avant vos résultats, votre leadership et votre pilotage stratégique.',
    metiersConnexes: ['cv-product-manager', 'cv-gestionnaire-de-projet'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['chef de projet', 'pilotage', 'planification', 'agile', 'reporting', 'risques'],
    pointsFortsRecruteurs: ['Pilotage', 'Gestion risques', 'Résultats business'],
    salairesIndicatifs: { debutant: '35k€', confirme: '50k€', senior: '68k€+' },
    motsClesAts: ['Pilotage de projet', 'Planning', 'Gestion des risques', 'Agilité', 'Reporting', 'Parties prenantes'],
    faqs: [
      { question: 'Quel format privilégier ?', reponse: 'Un modèle 2 colonnes convient bien pour présenter expérience, compétences et accompagnement de transformation.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-manager-de-projet',
    metier: 'Manager de projet',
    secteur: 'management',
    templateRecommandeId: 'tc-31-cascade',
    templatesRecommandes: ['tc-31-cascade', 'sc-20-baxter', 'tc-01-corporate', 'sc-12-arch', 'tc-11-onyx'],
    competencesCles: ['Gestion de portefeuille', 'Animation d’équipe', 'Budget', 'Changement', 'Pilotage', 'KPI'],
    outilsTypiques: ['Asana', 'Microsoft Project', 'Power BI', 'Excel', 'Teams'],
    amorceProfil: 'Manager de projet orienté efficacité opérationnelle, capable de piloter plusieurs initiatives simultanées et d’aligner les équipes sur des objectifs concrets.',
    descriptionHero: 'Présentez votre capacité à animer des équipes et à conduire des projets structurés vers des résultats mesurables.',
    accroche: 'Un CV qui montre votre leadership, votre méthodologie et votre impact sur les performances.',
    metiersConnexes: ['cv-chef-de-projet', 'cv-product-manager'],
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['manager de projet', 'pilotage', 'budget', 'animation', 'kpi', 'portfolio'],
    pointsFortsRecruteurs: ['Orchestration', 'Performance', 'Leadership'],
    salairesIndicatifs: { debutant: '37k€', confirme: '52k€', senior: '70k€+' },
    motsClesAts: ['Manager de projet', 'Pilotage', 'Budget', 'KPI', 'Animation d’équipe', 'Portfolio'],
    faqs: [
      { question: 'Comment présenter les résultats ?', reponse: 'Mettez votre capacité à tenir les délais, maîtriser les budgets et impulser des transformations sur les projets menés.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-directeur-commercial',
    metier: 'Directeur Commercial',
    secteur: 'management',
    templateRecommandeId: 'tc-11-onyx',
    templatesRecommandes: ['tc-11-onyx', 'tc-18-terracotta', 'tc-30-nova', 'sc-23-royal', 'tc-17-sand'],
    competencesCles: ['Stratégie commerciale', 'Ventes', 'Management', 'Négociation', 'P&L', 'Business développement'],
    outilsTypiques: ['CRM', 'Excel', 'Power BI', 'Salesforce', 'Teams'],
    amorceProfil: 'Directeur commercial expérimenté, capable de piloter des équipes de vente, orienter les performances et développer les opportunités de croissance.',
    descriptionHero: 'Mettez en avant votre capacité à développer le chiffre d’affaires, piloter des équipes et structurer une croissance durable.',
    accroche: 'Un CV qui valorise votre vision commerciale, votre leadership et vos résultats.',
    metiersConnexes: ['cv-sales-manager', 'cv-manager-ecommerce'],
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['directeur commercial', 'business development', 'vente', 'management', 'p&l', 'négociation'],
    pointsFortsRecruteurs: ['Ventes', 'Leadership', 'Croissance'],
    salairesIndicatifs: { debutant: '45k€', confirme: '65k€', senior: '90k€+' },
    motsClesAts: ['Ventes', 'Négociation', 'Business Development', 'P&L', 'Management', 'Croissance'],
    faqs: [
      { question: 'Que doit-on mettre en avant ?', reponse: 'Mettez l’impact sur le chiffre d’affaires, la performance d’équipe et les marchés développés.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-chef-de-service',
    metier: 'Chef de service',
    secteur: 'management',
    templateRecommandeId: 'tc-13-sage',
    templatesRecommandes: ['tc-13-sage', 'sc-08-nordic', 'tc-05-forest', 'tc-18-terracotta', 'tc-01-corporate'],
    competencesCles: ['Management d’équipe', 'Performance', 'Process', 'Qualité', 'Planning', 'Pilotage'],
    outilsTypiques: ['Excel', 'Power BI', 'Teams', 'Notion', 'Jira'],
    amorceProfil: 'Chef de service orienté performance opérationnelle, capable de structurer les équipes, sécuriser les processus et accompagner la qualité de service.',
    descriptionHero: 'Présentez votre capacité à piloter des services, améliorer les performances et renforcer la qualité de livraison.',
    accroche: 'Un CV rassurant, structuré et orienté résultats opérationnels.',
    metiersConnexes: ['cv-manager-rh', 'cv-chef-de-projet'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['chef de service', 'management', 'qualite', 'process', 'pilotage', 'performance'],
    pointsFortsRecruteurs: ['Gestion opérationnelle', 'Qualité', 'Résultats d’équipe'],
    salairesIndicatifs: { debutant: '40k€', confirme: '55k€', senior: '72k€+' },
    motsClesAts: ['Management', 'Performance', 'Qualité', 'Process', 'Pilotage', 'Équipe'],
    faqs: [
      { question: 'Comment démontrer le leadership ?', reponse: 'Mettez en avant votre impact sur la qualité de service, le pilotage d’équipe et les résultats opérationnels.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-responsable-logistique',
    metier: 'Responsable Logistique',
    secteur: 'management',
    templateRecommandeId: 'tc-35-solar',
    templatesRecommandes: ['tc-35-solar', 'tc-18-terracotta', 'tc-31-cascade', 'sc-33-verdant', 'sc-08-nordic'],
    competencesCles: ['Logistique', 'Supply chain', 'Gestion des stocks', 'Planification', 'Optimisation', 'KPI'],
    outilsTypiques: ['SAP', 'Excel', 'WMS', 'Power BI', 'ERP'],
    amorceProfil: 'Responsable logistique orienté efficacité et performance, capable d’optimiser les flux, sécuriser les stocks et piloter les livraisons.',
    descriptionHero: 'Mettez en avant vos compétences en supply chain, pilotage des flux et optimisation de la performance logistique.',
    accroche: 'Un CV qui montre votre capacité à sécuriser la chaîne logistique et à améliorer le service client.',
    metiersConnexes: ['cv-logisticien', 'cv-coordinateur-administratif'],
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['logistique', 'supply chain', 'stock', 'transport', 'erp', 'inventaire'],
    pointsFortsRecruteurs: ['Flux', 'Stock', 'Performance'],
    salairesIndicatifs: { debutant: '32k€', confirme: '46k€', senior: '60k€+' },
    motsClesAts: ['Logistique', 'Supply Chain', 'Stocks', 'ERP', 'KPI', 'Flux'],
    faqs: [
      { question: 'Que mettre en avant ?', reponse: 'Les résultats sur la réduction des coûts, la performance des livraisons et l’optimisation des flux sont particulièrement valorisés.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-coordinateur-administratif',
    metier: 'Coordinateur Administratif',
    secteur: 'management',
    templateRecommandeId: 'sc-32-atelier-slate',
    templatesRecommandes: ['sc-32-atelier-slate', 'tc-34-voyage', 'sc-12-arch', 'tc-29-studio', 'sc-22-sage'],
    competencesCles: ['Organisation', 'Administration', 'Support', 'Gestion documentaire', 'Priorisation', 'Communication'],
    outilsTypiques: ['Excel', 'Word', 'Outlook', 'Google Workspace', 'Notion'],
    amorceProfil: 'Coordinateur administratif rigoureux, capable d’organiser les tâches, sécuriser les informations et soutenir les équipes sur des missions variées.',
    descriptionHero: 'Valorisez votre capacité à organiser les activités, sécuriser les processus et accompagner les équipes au quotidien.',
    accroche: 'Un CV propre, structuré et orienté fiabilité administrative.',
    metiersConnexes: ['cv-assistant-rh', 'cv-assistant-achats'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['coordinateur administratif', 'organisation', 'gestion documentaire', 'support', 'administration', 'priorisation'],
    pointsFortsRecruteurs: ['Organisation', 'Fiabilité', 'Support'],
    salairesIndicatifs: { debutant: '26k€', confirme: '34k€', senior: '45k€+' },
    motsClesAts: ['Organisation', 'Administration', 'Support', 'Excel', 'Gestion documentaire', 'Priorisation'],
    faqs: [
      { question: 'Que doit-on montrer ?', reponse: 'Mettez les missions de coordination, la gestion documentaire, le suivi des délais et votre capacité à soutenir plusieurs équipes.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-comptable',
    metier: 'Comptable',
    secteur: 'finance',
    templateRecommandeId: 'tc-22-dune',
    templatesRecommandes: ['tc-22-dune', 'sc-27-ivory', 'tc-10-maison', 'tc-14-ivory-grid', 'tc-17-sand'],
    competencesCles: ['Comptabilité générale', 'Fiscalité', 'Reporting', 'Contrôle de gestion', 'SAS', 'Réglementation'],
    outilsTypiques: ['Excel', 'Sage', 'SAP', 'Power BI', 'QuickBooks'],
    amorceProfil: 'Comptable rigoureux et orienté précision, capable de piloter la comptabilité, sécuriser les processus et produire des reporting fiables.',
    descriptionHero: 'Mettez en avant votre rigueur comptable, la fiabilité de vos contrôles et votre connaissance des exigences réglementaires.',
    accroche: 'Un CV comptable lisible et très sérieux pour rassurer sur votre méthode et votre fiabilité.',
    metiersConnexes: ['cv-auditeur-financier', 'cv-charge-de-comptabilite'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['comptable', 'comptabilite', 'fiscalite', 'reporting', 'sas', 'reglementation'],
    pointsFortsRecruteurs: ['Rigueur', 'Contrôle', 'Fiabilité'],
    salairesIndicatifs: { debutant: '28k€', confirme: '38k€', senior: '52k€+' },
    motsClesAts: ['Comptabilité', 'Fiscalité', 'Reporting', 'SAS', 'Réglementation', 'Excel'],
    faqs: [
      { question: 'Doit-on mettre la fiscalité en avant ?', reponse: 'Oui, surtout si vous visez des postes avec responsabilité comptable, fiscalité ou contrôle de gestion.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-auditeur-financier',
    metier: 'Auditeur Financier',
    secteur: 'finance',
    templateRecommandeId: 'sc-27-ivory',
    templatesRecommandes: ['sc-27-ivory', 'tc-22-dune', 'tc-14-ivory-grid', 'sc-16-burgundy', 'tc-17-sand'],
    competencesCles: ['Audit interne', 'Contrôle', 'Risque', 'Réglementation', 'Analyse financière', 'Reporting'],
    outilsTypiques: ['Excel', 'Power BI', 'SAP', 'Tableau', 'ACL'],
    amorceProfil: 'Auditeur financier méthodique, capable de contrôler la conformité, mesurer les risques et formuler des recommandations fiables.',
    descriptionHero: 'Valorisez votre sens du contrôle, votre analyse de risques et votre capacité à rendre des recommandations robustes.',
    accroche: 'Un CV de rigueur et de méthode pour des postes exigeants en contrôle et conformité.',
    metiersConnexes: ['cv-comptable', 'cv-analyste-financier'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['audit financier', 'controle', 'risque', 'reglementation', 'analyse financière', 'compliance'],
    pointsFortsRecruteurs: ['Contrôle', 'Risque', 'Méthodologie'],
    salairesIndicatifs: { debutant: '35k€', confirme: '49k€', senior: '65k€+' },
    motsClesAts: ['Audit', 'Contrôle', 'Risque', 'Réglementation', 'Analyse financière', 'Reporting'],
    faqs: [
      { question: 'Quels points doivent figurer ?', reponse: 'Les missions d’audit, la connaissance réglementaire, les contrôles et la qualité des recommandations sont déterminants.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-charge-de-comptabilite',
    metier: 'Chargé de comptabilité',
    secteur: 'finance',
    templateRecommandeId: 'tc-17-sand',
    templatesRecommandes: ['tc-17-sand', 'tc-22-dune', 'sc-27-ivory', 'tc-14-ivory-grid', 'sc-16-burgundy'],
    competencesCles: ['Saisie comptable', 'Clôture', 'Bilan', 'TVA', 'Ecritures', 'Régularisation'],
    outilsTypiques: ['Sage', 'Excel', 'ADP', 'QuickBooks', 'SAP'],
    amorceProfil: 'Chargé de comptabilité autonome, capable de sécuriser les flux comptables, assurer la tenue du grand livre et soutenir la clôture financière.',
    descriptionHero: 'Mettez en avant votre maîtrise de la comptabilité, de la clôture et des obligations fiscales.',
    accroche: 'Un CV apte à rassurer sur votre rigueur, votre autonomie et votre savoir-faire comptable.',
    metiersConnexes: ['cv-comptable', 'cv-assistant-comptable'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['charge de comptabilite', 'saisie', 'cloture', 'bilan', 'tva', 'ecritures'],
    pointsFortsRecruteurs: ['Tenue comptable', 'Régularisation', 'Clôture'],
    salairesIndicatifs: { debutant: '29k€', confirme: '38k€', senior: '51k€+' },
    motsClesAts: ['Comptabilité', 'Clôture', 'TVA', 'Écritures', 'Bilan', 'Excel'],
    faqs: [
      { question: 'Doit-on mettre le niveau de réglementation ?', reponse: 'Oui, les compétences sur la TVA, la clôture et les obligations comptables sont mises en avant par les recruteurs.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-analyste-financier',
    metier: 'Analyste Financier',
    secteur: 'finance',
    templateRecommandeId: 'tc-24-signal',
    templatesRecommandes: ['tc-24-signal', 'tc-09-sky', 'tc-32-orbit', 'sc-17-cyan', 'sc-34-pixel-work'],
    competencesCles: ['Analyse financière', 'Budget', 'Modélisation', 'Reporting', 'Prévisions', 'Valorisation'],
    outilsTypiques: ['Excel', 'Power BI', 'Tableau', 'SAP', 'Python'],
    amorceProfil: 'Analyste financier orienté décision et performance, capable d’analyser les données, anticiper les écarts et proposer des recommandations utiles.',
    descriptionHero: 'Valuez votre capacité à éclairer les décisions d’investissement, les budgets et les performances de l’entreprise.',
    accroche: 'Un CV qui associe rigueur financière, modélisation et synthèse décisionnelle.',
    metiersConnexes: ['cv-auditeur-financier', 'cv-comptable'],
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['analyste financier', 'budget', 'prévision', 'modélisation', 'reporting', 'valuation'],
    pointsFortsRecruteurs: ['Analyse', 'Prévision', 'Décision financière'],
    salairesIndicatifs: { debutant: '34k€', confirme: '47k€', senior: '62k€+' },
    motsClesAts: ['Analyse financière', 'Budget', 'Reporting', 'Modélisation', 'Power BI', 'Excel'],
    faqs: [
      { question: 'Que doit-on mettre en avant ?', reponse: 'Les analyses de performance, les prévisions, les budgets et les recommandations sont particulièrement clés.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-chef-de-paie',
    metier: 'Chef de Paie',
    secteur: 'finance',
    templateRecommandeId: 'sc-30-trust',
    templatesRecommandes: ['sc-30-trust', 'tc-22-dune', 'sc-32-atelier-slate', 'sc-27-ivory', 'sc-08-nordic'],
    competencesCles: ['Paie', 'Réglement du travail', 'Cotisations', 'Vérification', 'Droit social', 'Reporting'],
    outilsTypiques: ['ADP', 'Sage Paie', 'Excel', 'Payfit', 'Mosaic'],
    amorceProfil: 'Chef de paie garant de la conformité sociale et des traitements, capable d’assurer la régularité, la qualité et la sécurité du processus de paie.',
    descriptionHero: 'Mettez en valeur votre maîtrise de la paie, des règles sociales et du pilotage de la conformité.',
    accroche: 'Un CV orienté qualité, conformité et gestion d’un processus sensible.',
    metiersConnexes: ['cv-comptable', 'cv-assistant-rh'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['paie', 'droit social', 'cotisations', 'salaire', 'payfit', 'compliance'],
    pointsFortsRecruteurs: ['Conformité', 'Sécurité', 'Rigueur'],
    salairesIndicatifs: { debutant: '31k€', confirme: '43k€', senior: '58k€+' },
    motsClesAts: ['Paie', 'Droit du travail', 'Cotisations', 'Réglement', 'Excel', 'Conformité'],
    faqs: [
      { question: 'La précision comptable est-elle essentielle ?', reponse: 'Oui, la paie est un domaine très sensible : la conformité, la régularité et la précision sont des critères incontournables.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-assistant-comptable',
    metier: 'Assistant Comptable',
    secteur: 'finance',
    templateRecommandeId: 'tc-34-voyage',
    templatesRecommandes: ['tc-34-voyage', 'tc-22-dune', 'sc-27-ivory', 'sc-32-atelier-slate', 'tc-17-sand'],
    competencesCles: ['Saisie comptable', 'Supports', 'TVA', 'Classement', 'Ecritures', 'Suivi comptable'],
    outilsTypiques: ['Sage', 'Excel', 'QuickBooks', 'Office', 'ERP'],
    amorceProfil: 'Assistant comptable rigoureux, capable de soutenir les missions comptables, sécuriser les écritures et assurer le suivi administratif.',
    descriptionHero: 'Mettez en avant votre rigueur administrative, votre autonomie et votre capacité à soutenir les processus comptables.',
    accroche: 'Un CV clair, sérieux et orienté méthode comptable et organisation.',
    metiersConnexes: ['cv-charge-de-comptabilite', 'cv-coordinateur-administratif'],
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['assistant comptable', 'saisie', 'TVA', 'ecritures', 'factures', 'support comptable'],
    pointsFortsRecruteurs: ['Rigueur', 'Organisation', 'Autonomie'],
    salairesIndicatifs: { debutant: '25k€', confirme: '32k€', senior: '42k€+' },
    motsClesAts: ['Comptabilité', 'TVA', 'Saisie', 'Factures', 'Excel', 'Régularisation'],
    faqs: [
      { question: 'Quel point mettre en avant ?', reponse: 'Mettez votre capacité à gérer les écritures, le classement, la TVA et le suivi administratif avec précision.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-conseiller-commercial',
    metier: 'Conseiller Commercial',
    secteur: 'commerce',
    templateRecommandeId: 'tc-27-ripple',
    templatesRecommandes: ['tc-27-ripple', 'tc-12-cobalt', 'sc-13-editorial-serif', 'tc-30-nova', 'tc-16-mint'],
    competencesCles: ['Prospection', 'Relation client', 'Vente', 'Négociation', 'Service client', 'Objectifs de vente'],
    outilsTypiques: ['CRM', 'Excel', 'LinkedIn', 'Outlook', 'e-commerce'],
    amorceProfil: 'Conseiller commercial orienté satisfaction client et performance commerciale, capable de convertir des prospects dans un cadre exigeant.',
    descriptionHero: 'Mettez en avant votre sens du contact, votre capacité à vendre et votre aptitude à fidéliser les clients.',
    accroche: 'Un CV orienté résultats commerciaux, relation client et négociation.',
    metiersConnexes: ['cv-sales-manager', 'cv-charge-clientele'],
    imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['conseiller commercial', 'vente', 'négociation', 'client', 'prospection', 'service client'],
    pointsFortsRecruteurs: ['Vente', 'Relation client', 'Négociation'],
    salairesIndicatifs: { debutant: '27k€', confirme: '36k€', senior: '50k€+' },
    motsClesAts: ['Vente', 'Prospection', 'Relation Client', 'Négociation', 'CRM', 'Service client'],
    faqs: [
      { question: 'Doit-on mettre les chiffres de vente ?', reponse: 'Oui, tout résultat sur le chiffre, les quotas ou le nombre de clients acquis est très valorisant.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-sales-manager',
    metier: 'Sales Manager',
    secteur: 'commerce',
    templateRecommandeId: 'tc-30-nova',
    templatesRecommandes: ['tc-30-nova', 'tc-11-onyx', 'tc-18-terracotta', 'tc-27-ripple', 'tc-03-amber'],
    competencesCles: ['Gestion équipe commerciale', 'Objetifs', 'Négociation', 'Business development', 'CRM', 'Performance'],
    outilsTypiques: ['Salesforce', 'HubSpot', 'Excel', 'Zoom', 'Power BI'],
    amorceProfil: 'Sales manager orienté croissance, capable de piloter une équipe commerciale, améliorer la performance et développer les opportunités.',
    descriptionHero: 'Présentez votre leadership commercial, les résultats obtenus et votre capacité à convertir la stratégie en chiffre.',
    accroche: 'Un CV de vente orienté performance, équipe et croissance.',
    metiersConnexes: ['cv-conseiller-commercial', 'cv-directeur-commercial'],
    imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['sales manager', 'vente', 'business development', 'crm', 'négociation', 'performance'],
    pointsFortsRecruteurs: ['Leadership', 'Résultats', 'Croissance'],
    salairesIndicatifs: { debutant: '38k€', confirme: '52k€', senior: '70k€+' },
    motsClesAts: ['Sales Manager', 'Ventes', 'Négociation', 'CRM', 'Performance', 'Leadership'],
    faqs: [
      { question: 'Que doit-on montrer ?', reponse: 'Les chiffres de croissance, les objectifs atteints et la gestion d’équipe sont des éléments décisifs.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-manager-ecommerce',
    metier: 'Manager E-commerce',
    secteur: 'commerce',
    templateRecommandeId: 'sc-35-lotus',
    templatesRecommandes: ['sc-35-lotus', 'tc-27-ripple', 'sc-24-sunset', 'tc-28-spring', 'sc-17-cyan'],
    competencesCles: ['E-commerce', 'SEO', 'Marketing digital', 'Analytics', 'Conversion', 'Logistique de vente'],
    outilsTypiques: ['Shopify', 'Magento', 'Google Analytics', 'Klaviyo', 'Meta Ads'],
    amorceProfil: 'Manager e-commerce orienté croissance digital, capable d’optimiser les performances de vente en ligne et d’améliorer la conversion.',
    descriptionHero: 'Mettez en avant votre maîtrise du commerce digital, de l’acquisition et de la conversion sur les canaux e-commerce.',
    accroche: 'Votre CV doit montrer la performance commerciale digitale, l’optimisation et l’expérience client.',
    metiersConnexes: ['cv-conseiller-commercial', 'cv-growth-marketer'],
    imageUrl: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['ecommerce', 'shopify', 'marketing digital', 'analytics', 'conversion', 'boutique en ligne'],
    pointsFortsRecruteurs: ['Performance', 'Conversion', 'Commerce digital'],
    salairesIndicatifs: { debutant: '32k€', confirme: '46k€', senior: '63k€+' },
    motsClesAts: ['E-commerce', 'Analytics', 'SEO', 'Conversion', 'Marketing Digital', 'Shopify'],
    faqs: [
      { question: 'Les chiffres de conversion sont-ils essentiels ?', reponse: 'Oui, les recruteurs recherchent des profils qui mesurent les performances et optimisent sans cesse l’expérience d’achat.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-logisticien',
    metier: 'Logisticien',
    secteur: 'commerce',
    templateRecommandeId: 'tc-35-solar',
    templatesRecommandes: ['tc-35-solar', 'tc-18-terracotta', 'sc-33-verdant', 'sc-08-nordic', 'tc-31-cascade'],
    competencesCles: ['Stock', 'Planning', 'Expédition', 'Transport', 'Suivi de commandes', 'Optimisation'],
    outilsTypiques: ['ERP', 'WMS', 'Excel', 'SAP', 'TMS'],
    amorceProfil: 'Logisticien rigoureux, capable d’assurer le bon déroulement des flux de marchandises et de maintenir un niveau de service élevé.',
    descriptionHero: 'Mettez en avant votre capacité à organiser les flux, sécuriser les livraisons et optimiser le service logistique.',
    accroche: 'Un CV orienté précision, organisation et performance opérationnelle.',
    metiersConnexes: ['cv-responsable-logistique', 'cv-assistant-achats'],
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['logisticien', 'stock', 'expédition', 'transport', 'flux', 'commande'],
    pointsFortsRecruteurs: ['Organisation', 'Flux', 'Performance'],
    salairesIndicatifs: { debutant: '26k€', confirme: '35k€', senior: '48k€+' },
    motsClesAts: ['Logistique', 'Stocks', 'Expédition', 'Transport', 'ERP', 'Commandes'],
    faqs: [
      { question: 'Le suivi des livraisons compte-t-il ?', reponse: 'Oui, la capacité à optimiser les flux, respecter les délais et sécuriser les livraisons est très recherchée.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-assistant-achats',
    metier: 'Assistant Achats',
    secteur: 'commerce',
    templateRecommandeId: 'tc-34-voyage',
    templatesRecommandes: ['tc-34-voyage', 'sc-32-atelier-slate', 'tc-29-studio', 'sc-22-sage', 'sc-08-nordic'],
    competencesCles: ['Achats', 'Suppliers', 'Budget', 'Commande', 'Suivi fournisseur', 'Négociation'],
    outilsTypiques: ['SAP', 'Excel', 'Procurement', 'Outlook', 'ERP'],
    amorceProfil: 'Assistant achats orienté suivi et négociation, capable de gérer les achats, les fournisseurs et le bon fonctionnement des commandes.',
    descriptionHero: 'Présentez votre capacité à organiser les achats, négocier avec les fournisseurs et sécuriser les flux d’approvisionnement.',
    accroche: 'Un CV qui met en avant précision, négociation et pilotage de l’approvisionnement.',
    metiersConnexes: ['cv-logisticien', 'cv-coordinateur-administratif'],
    imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['assistant achats', 'fournisseur', 'budget', 'commande', 'négociation', 'achats'],
    pointsFortsRecruteurs: ['Négociation', 'Suivi', 'Organisation'],
    salairesIndicatifs: { debutant: '25k€', confirme: '33k€', senior: '42k€+' },
    motsClesAts: ['Achats', 'Fournisseurs', 'Commandes', 'Budget', 'Négociation', 'ERP'],
    faqs: [
      { question: 'Que valoriser ?', reponse: 'Les compétences sur les fournisseurs, le suivi des commandes et la gestion des budgets sont souvent décisives.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-charge-clientele',
    metier: 'Chargé de clientèle',
    secteur: 'commerce',
    templateRecommandeId: 'tc-29-studio',
    templatesRecommandes: ['tc-29-studio', 'sc-05-coral', 'tc-27-ripple', 'sc-21-glass', 'tc-12-cobalt'],
    competencesCles: ['Relation client', 'Service client', 'Résolution', 'Satisfaction', 'Trafic', 'Évaluation'],
    outilsTypiques: ['CRM', 'Outlook', 'Téléphonie', 'Teams', 'Excel'],
    amorceProfil: 'Chargé de clientèle orienté satisfaction et fidélisation, capable de gérer les demandes, résoudre rapidement les problématiques et proposer une expérience de qualité.',
    descriptionHero: 'Mettez en évidence votre capacité à écouter, conseiller et fidéliser les clients dans un environnement exigeant.',
    accroche: 'Un CV qui valorise le relationnel, la qualité de service et la satisfaction client.',
    metiersConnexes: ['cv-conseiller-commercial', 'cv-assistant-achats'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['charge de clientèle', 'service client', 'satisfaction', 'relation client', 'gestion de dossiers', 'fidélisation'],
    pointsFortsRecruteurs: ['Service client', 'Fidélisation', 'Relation'],
    salairesIndicatifs: { debutant: '24k€', confirme: '31k€', senior: '40k€+' },
    motsClesAts: ['Service client', 'Relation client', 'Satisfaction', 'CRM', 'Fidélisation', 'Résolution'],
    faqs: [
      { question: 'Que mettre en avant ?', reponse: 'Les chiffres sur fidélisation, satisfaction client et gestion de dossiers sont particulièrement pertinents.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-rh',
    metier: 'Chargé de recrutement',
    secteur: 'rh',
    templateRecommandeId: 'sc-03-emerald',
    templatesRecommandes: ['sc-03-emerald', 'tc-05-forest', 'tc-20-bandeau', 'tc-24-signal', 'sc-25-garden'],
    competencesCles: ['Recrutement', 'Relation candidat', 'Évaluation', 'Employer branding', 'Sourcing', 'Gestion du temps'],
    outilsTypiques: ['LinkedIn Recruiter', 'ATS', 'Excel', 'Slack', 'Google Workspace'],
    amorceProfil: 'Chargé de recrutement orienté performance et expérience candidat, habitué à structurer des process et améliorer la qualité des embauches.',
    descriptionHero: 'Présentez votre sens des relations humaines, votre rigueur de process et votre impact sur l’attractivité de l’entreprise.',
    accroche: 'Mettez en évidence votre capacité à recruter, convaincre et structurer le talent.',
    metiersConnexes: ['cv-manager-rh', 'cv-assistant-rh'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['recrutement', 'sourcing', 'relation candidat', 'ats', 'employer branding', 'rh'],
    pointsFortsRecruteurs: ['Process', 'Relation candidat', 'Embauches'],
    salairesIndicatifs: { debutant: '29k€', confirme: '41k€', senior: '56k€+' },
    motsClesAts: ['Recrutement', 'Sourcing', 'Employer Branding', 'ATS', 'Relation candidat', 'KPI'],
    faqs: [
      { question: 'Quelles compétences doivent figurer en premier ?', reponse: 'Sourcing, relation candidat, gestion des process, employer branding et suivi de KPI de recrutement.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-manager-rh',
    metier: 'Manager RH',
    secteur: 'rh',
    templateRecommandeId: 'tc-05-forest',
    templatesRecommandes: ['tc-05-forest', 'tc-20-bandeau', 'sc-03-emerald', 'sc-25-garden', 'sc-08-nordic'],
    competencesCles: ['Management RH', 'Politique sociale', 'Formation', 'Performance', 'Communication', 'Rémunération'],
    outilsTypiques: ['HRIS', 'Excel', 'Power BI', 'Slack', 'Google Workspace'],
    amorceProfil: 'Manager RH stratégique, capable de piloter le développement des talents, l’organisation et les projets RH au service de la performance.',
    descriptionHero: 'Mettez en avant votre capacité à structurer les ressources humaines et orienter le développement de l’entreprise.',
    accroche: 'Un CV qui montre votre vision RH, votre leadership et vos résultats sur les talents.',
    metiersConnexes: ['cv-rh', 'cv-formateur'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['manager rh', 'management RH', 'formation', 'politique sociale', 'talents', 'performance'],
    pointsFortsRecruteurs: ['Leadership', 'Talents', 'Stratégie RH'],
    salairesIndicatifs: { debutant: '39k€', confirme: '55k€', senior: '75k€+' },
    motsClesAts: ['Management RH', 'Formation', 'Talent', 'Performance', 'Politique sociale', 'Communication'],
    faqs: [
      { question: 'Que doit-on mettre en avant ?', reponse: 'Les projets RH, l’impact sur les performances et la qualité du management des talents sont prioritaires.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-assistant-rh',
    metier: 'Assistant RH',
    secteur: 'rh',
    templateRecommandeId: 'sc-25-garden',
    templatesRecommandes: ['sc-25-garden', 'tc-20-bandeau', 'sc-03-emerald', 'tc-13-sage', 'sc-22-sage'],
    competencesCles: ['Administration RH', 'Dossiers salariés', 'Entretiens', 'Documentations', 'Absences', 'Réglementation'],
    outilsTypiques: ['ADP', 'Excel', 'Google Workspace', 'HRIS', 'Outlook'],
    amorceProfil: 'Assistant RH méthodique, capable d’organiser le suivi administratif des salariés et de soutenir les équipes sur les missions RH.',
    descriptionHero: 'Valorisez votre rigueur administrative et votre capacité à sécuriser le fonctionnement RH de l’entreprise.',
    accroche: 'Un CV clair, organisé et orienté fiabilité dans la gestion des ressources humaines.',
    metiersConnexes: ['cv-rh', 'cv-coordinateur-administratif'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['assistant rh', 'administration rh', 'dossiers salariés', 'absences', 'rh', 'réglementation'],
    pointsFortsRecruteurs: ['Organisation', 'Conformité', 'Support RH'],
    salairesIndicatifs: { debutant: '25k€', confirme: '32k€', senior: '42k€+' },
    motsClesAts: ['Administration RH', 'Dossiers salariés', 'Absences', 'Réglementation', 'Excel', 'HRIS'],
    faqs: [
      { question: 'Comment présenter le profil ?', reponse: 'Mettez votre organisation, votre rigueur administrative et votre capacité à accompagner les équipes RH.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-formateur',
    metier: 'Formateur',
    secteur: 'rh',
    templateRecommandeId: 'tc-20-bandeau',
    templatesRecommandes: ['tc-20-bandeau', 'sc-25-garden', 'sc-06-tech', 'tc-13-sage', 'tc-05-forest'],
    competencesCles: ['Animation', 'Pédagogie', 'Conception de modules', 'Évaluation', 'Sens du relationnel', 'Formation'],
    outilsTypiques: ['PowerPoint', 'Canva', 'Moodle', 'Teams', 'Google Workspace'],
    amorceProfil: 'Formateur dynamique et pédagogue, capable d’animer des sessions, structurer des contenus de formation et accompagner les apprenants.',
    descriptionHero: 'Mettez en avant votre pédagogie, votre capacité à transmettre et à structurer des contenus de qualité.',
    accroche: 'Un CV qui valorise le relationnel, la pédagogie et les résultats de formation.',
    metiersConnexes: ['cv-manager-rh', 'cv-content-manager'],
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['formateur', 'pédagogie', 'formation', 'animation', 'atelier', 'enseignement'],
    pointsFortsRecruteurs: ['Pédagogie', 'Animation', 'Transmission'],
    salairesIndicatifs: { debutant: '28k€', confirme: '39k€', senior: '52k€+' },
    motsClesAts: ['Formation', 'Pédagogie', 'Animation', 'Évaluation', 'Modules', 'Communication'],
    faqs: [
      { question: 'Faut-il montrer les formations animées ?', reponse: 'Oui, les chiffres de participants, le type de public et les sujets animés sont très valorisants.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'certifications']
  },
  {
    slug: 'cv-consultant-it',
    metier: 'Consultant IT',
    secteur: 'tech',
    templateRecommandeId: 'tc-32-orbit',
    templatesRecommandes: ['tc-32-orbit', 'tc-21-aqua', 'sc-06-tech', 'tc-04-azure', 'tc-31-cascade'],
    competencesCles: ['Conseil IT', 'Transformation digitale', 'Architecture', 'Analyse fonctionnelle', 'Gestion de projet', 'Satisfaction client'],
    outilsTypiques: ['Jira', 'Power BI', 'Excel', 'Teams', 'Notion'],
    amorceProfil: 'Consultant IT orienté conseil et transformation, capable d’identifier des besoins, proposer des solutions adaptées et accompagner les projets de manière concrète.',
    descriptionHero: 'Mettez en avant votre capacité à conseiller, structurer des projets et faire évoluer les systèmes d’information.',
    accroche: 'Un CV qui valorise le conseil, la stratégie et la transformation digitale.',
    metiersConnexes: ['cv-product-manager', 'cv-chef-de-projet'],
    imageUrl: 'https://images.unsplash.com/photo-1516321165241-4aa89a48be28?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['consultant it', 'transformation digitale', 'architecture', 'conseil', 'système d’information', 'projet'],
    pointsFortsRecruteurs: ['Conseil', 'Transformation', 'Pilotage de projets'],
    salairesIndicatifs: { debutant: '35k€', confirme: '50k€', senior: '70k€+' },
    motsClesAts: ['Conseil IT', 'Transformation digitale', 'Architecture', 'Projets', 'Satisfaction client', 'Analyse fonctionnelle'],
    faqs: [
      { question: 'Que doit-on mettre en avant ?', reponse: 'Les missions de conseil, la transformation digitale, les gains d’efficacité et le pilotage de projets sont très importants.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'projets', 'formation']
  },
  {
    slug: 'cv-gestionnaire-de-vente',
    metier: 'Gestionnaire de Vente',
    secteur: 'commerce',
    templateRecommandeId: 'tc-30-nova',
    templatesRecommandes: ['tc-30-nova', 'tc-27-ripple', 'tc-18-terracotta', 'tc-12-cobalt', 'tc-29-studio'],
    competencesCles: ['Suivi commercial', 'Objectifs', 'CRM', 'Négociation', 'Performance', 'Reporting'],
    outilsTypiques: ['Salesforce', 'Excel', 'SAP', 'Outlook', 'Power BI'],
    amorceProfil: 'Gestionnaire de vente orienté suivi et performance commerciale, capable d’optimiser les résultats, piloter les objectifs et assurer un bon suivi des clients.',
    descriptionHero: 'Présentez votre maîtrise du suivi commercial, des objectifs et des performances de vente avec un profil orienté résultats.',
    accroche: 'Un CV qui place le chiffre, le suivi et la performance commerciale au centre du message.',
    metiersConnexes: ['cv-conseiller-commercial', 'cv-sales-manager'],
    imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['gestionnaire de vente', 'suivi commercial', 'crm', 'objectifs', 'négociation', 'performance'],
    pointsFortsRecruteurs: ['Suivi commercial', 'Objectifs', 'Reporting'],
    salairesIndicatifs: { debutant: '30k€', confirme: '42k€', senior: '58k€+' },
    motsClesAts: ['Suivi commercial', 'CRM', 'Négociation', 'Objectifs', 'Reporting', 'Performance'],
    faqs: [
      { question: 'Les objectifs commerciaux doivent-ils figurer ?', reponse: 'Oui, surtout les résultats sur les ventes, les objectifs et le suivi de portefeuille.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  },
  {
    slug: 'cv-analyste-rh',
    metier: 'Analyste RH',
    secteur: 'rh',
    templateRecommandeId: 'tc-05-forest',
    templatesRecommandes: ['tc-05-forest', 'sc-25-garden', 'tc-20-bandeau', 'sc-03-emerald', 'tc-13-sage'],
    competencesCles: ['Analyse RH', 'KPI', 'Talent', 'Formation', 'Rémunération', 'Politique sociale'],
    outilsTypiques: ['HRIS', 'Excel', 'Power BI', 'Google Workspace', 'Teams'],
    amorceProfil: 'Analyste RH orienté données et stratégie, capable d’évaluer les performances, suivre les indicateurs RH et accompagner les décisions autour des talents.',
    descriptionHero: 'Mettez en avant votre capacité à mesurer les performances RH, structurer les données et contribuer à la stratégie de ressources humaines.',
    accroche: 'Un CV orienté donnée, performance et soutien à la décision RH.',
    metiersConnexes: ['cv-manager-rh', 'cv-assistant-rh'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    motsClesRecherches: ['analyste rh', 'kpi rh', 'talent', 'formation', 'rémunération', 'politique sociale'],
    pointsFortsRecruteurs: ['Analyse', 'KPI', 'Pilotage des talents'],
    salairesIndicatifs: { debutant: '33k€', confirme: '47k€', senior: '62k€+' },
    motsClesAts: ['Analyse RH', 'KPI', 'Talents', 'Formation', 'Politique sociale', 'Performance'],
    faqs: [
      { question: 'Que mettre en avant ?', reponse: 'Les indicateurs RH, les projets de développement et votre capacité à soutenir les décisions de gestion des talents sont déterminants.' }
    ],
    ordreSectionsSuggere: ['profil', 'experience', 'competences', 'formation', 'projets']
  }
];

export const JOB_LANDING_PAGES: JobLandingPage[] = jobEntries.map((job) => ({
  ...job,
  imageUrl: job.imageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
  motsClesRecherches: job.motsClesRecherches || job.competencesCles,
  pointsFortsRecruteurs: job.pointsFortsRecruteurs || ['Qualité', 'Impact', 'Adaptabilité'],
  motsClesAts: job.motsClesAts || job.competencesCles.slice(0, 6),
  salairesIndicatifs: job.salairesIndicatifs || { debutant: '30k€', confirme: '40k€', senior: '55k€+' }
}));

export function getJobLandingPageBySlug(slug: string): JobLandingPage | undefined {
  const normalized = slug.toLowerCase();
  const cleaned = normalized.startsWith('cv-') ? normalized : `cv-${normalized}`;
  return JOB_LANDING_PAGES.find((job) => job.slug === cleaned || job.slug === normalized || job.slug === `cv-${normalized.replace(/^cv-/, '')}`);
}
