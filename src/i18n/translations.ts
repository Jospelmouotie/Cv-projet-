import { Language } from '../types';

export const translations = {
  fr: {
    // Nav & Header
    appTitle: 'CV Builder',
    navHome: 'Accueil',
    navDashboard: 'Mes CVs',
    navTemplates: 'Galerie de Modèles',
    navAdmin: 'Administration',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    demoAccount: 'Compte Démo',
    adminAccount: 'Compte Admin',

    // Hero & Landing
    heroTitle: 'Créez votre CV professionnel en quelques minutes',
    heroSubtitle: 'Choisissez parmi nos 50 modèles modernes façon Canva, personnalisez en direct, glissez-déposez vos sections et exportez votre CV en PDF.',
    ctaCreateCV: 'Créer mon CV maintenant',
    ctaBrowseTemplates: 'Explorer les 50 modèles',
    ctaImportCV: 'Importer un CV existant (PDF/DOCX)',
    feature1Title: '50 Modèles Pro',
    feature1Desc: 'Moderne, classique, créatif, minimaliste ou exécutif.',
    feature2Title: 'Glisser-Déposer & Photo',
    feature2Desc: 'Réorganisez vos sections librement et cadrez votre photo.',
    feature3Title: 'Export PDF Rapide',
    feature3Desc: 'Paiement simple 500 FCFA Mobile Money et export immédiat.',

    // Dashboard
    myResumes: 'Mes CVs créés',
    createNewCV: 'Créer un nouveau CV',
    importCVBtn: 'Importer un CV (PDF/DOCX)',
    searchPlaceholder: 'Rechercher un CV par titre...',
    filterAll: 'Tous les CVs',
    filterPaid: 'Payés (Prêts à l\'export)',
    filterPending: 'En attente de paiement',
    noCVsFound: 'Aucun CV trouvé',
    noCVsSubtitle: 'Créez votre premier CV à partir de nos 50 modèles professionnels ou importez un document.',
    statusPaid: 'Payé',
    statusPending: 'En attente de validation',
    statusUnpaid: 'Non payé',
    lastUpdated: 'Modifié le',
    actionEdit: 'Modifier dans l\'éditeur',
    actionDuplicate: 'Dupliquer',
    actionRename: 'Renommer',
    actionDelete: 'Supprimer',
    actionPayExport: 'Payer / Exporter (500 FCFA)',
    actionDownloadPDF: 'Télécharger le PDF',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce CV ?',
    cvRenamed: 'CV renommé avec succès !',
    cvDuplicated: 'CV dupliqué avec succès !',

    // Template Gallery
    galleryTitle: 'Bibliothèque de Modèles de CV',
    gallerySubtitle: 'Sélectionnez un modèle pour commencer la rédaction. Vous pourrez changer de modèle à tout moment sans perdre votre texte.',
    catAll: 'Tous (50)',
    catModerne: 'Moderne',
    catClassique: 'Classique',
    catCreatif: 'Créatif',
    catMinimaliste: 'Minimaliste',
    catExecutif: 'Exécutif & Académique',
    useThisTemplate: 'Utiliser ce modèle',

    // Import CV
    importModalTitle: 'Importer un CV existant',
    importModalDesc: 'Déposez votre CV au format PDF ou DOCX. Notre système va extraire le texte et préremplir automatiquement votre éditeur.',
    dropzoneText: 'Glissez votre fichier PDF ou DOCX ici, ou cliquez pour parcourir',
    dropzoneHint: 'Formats acceptés : .pdf, .docx (Max 10 Mo)',
    importing: 'Extraction et analyse du texte en cours...',
    importSuccess: 'CV importé avec succès ! Les sections ont été préremplies.',
    importUnsortedNotice: 'Certaines informations ont été placées dans "Import brut à trier" pour vous permettre de les réorganiser facilement.',

    // CV Editor
    editorTitle: 'Éditeur de CV',
    autoSaveSaved: 'Enregistré',
    autoSaveSaving: 'Enregistrement...',
    manualSave: 'Enregistrer',
    backToDashboard: 'Retour au tableau de bord',
    changeTemplate: 'Changer de modèle',
    customizeStyle: 'Style & Couleurs',
    tabContent: 'Contenu & Sections',
    tabPreview: 'Aperçu du CV',
    
    // Style Panel
    accentColor: 'Couleur d\'accentuation',
    fontFamily: 'Police de caractères',
    applyStyle: 'Appliquer au CV',

    // Sections & Fields
    addSection: 'Ajouter une section personnalisée',
    sectionTitle: 'Titre de la section',
    sectionNamePlaceholder: 'Ex: Projets, Certifications, Bénévolat...',
    hideSection: 'Masquer',
    showSection: 'Afficher',
    deleteSection: 'Supprimer la section',
    dragToReorder: 'Glisser pour réordonner',

    // Profil
    sectionProfil: 'Profil & Coordonnées',
    fullName: 'Nom complet',
    jobTitle: 'Titre professionnel',
    email: 'Adresse e-mail',
    phone: 'Téléphone',
    address: 'Ville, Pays',
    website: 'Site Web / Portfolio',
    linkedin: 'Lien LinkedIn',
    summary: 'Résumé professionnel / Bio',
    profilePhoto: 'Photo de profil',
    changePhoto: 'Changer la photo',
    cropZoomPhoto: 'Ajuster & Recadrer',
    removePhoto: 'Supprimer la photo',

    // Experience
    sectionExperience: 'Expériences professionnelles',
    addExperience: 'Ajouter une expérience',
    position: 'Poste / Intitulé',
    company: 'Entreprise / Organisation',
    city: 'Ville',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    currentJob: 'J\'occupe actuellement ce poste',
    jobDescription: 'Description des missions & réalisations',

    // Education
    sectionEducation: 'Formations & Diplômes',
    addEducation: 'Ajouter une formation',
    degree: 'Diplôme / Domaine d\'études',
    school: 'Établissement / Université',

    // Skills
    sectionSkills: 'Compétences',
    addSkill: 'Ajouter une compétence',
    skillName: 'Nom de la compétence',
    skillLevel: 'Niveau de maîtrise (1 à 5)',

    // Languages
    sectionLanguages: 'Langues maîtrisées',
    addLanguage: 'Ajouter une langue',
    languageName: 'Langue',
    languageProficiency: 'Niveau de maîtrise',

    // Spellcheck
    spellcheckTitle: 'Correcteur orthographique',
    spellingErrorsFound: 'mot(s) nécessitant attention',
    noSpellingErrors: 'Aucune faute détectée',
    spellSuggestion: 'Suggestions :',

    // Payment & Export
    exportPDF: 'Exporter en PDF',
    paymentModalTitle: 'Paiement de la création de CV',
    paymentPrice: 'Montant : 500 FCFA',
    paymentNotice: 'Pour débloquer l\'export PDF haute définition de votre CV, veuillez effectuer un transfert Mobile Money de 500 FCFA vers l\'un des deux numéros officiels ci-dessous :',
    numOrange: '658606103 (Mobile Money 1)',
    numMTN: '653998494 (Mobile Money 2)',
    paymentInstructions: '1. Effectuez l\'envoi de 500 FCFA depuis votre téléphone.\n2. Notez le numéro de référence reçu par SMS.\n3. Renseignez le formulaire ci-dessous pour validation instantanée.',
    recipientNumber: 'Numéro vers lequel vous avez envoyé l\'argent',
    selectRecipient: 'Choisir le numéro destinataire',
    senderNumber: 'Votre numéro de téléphone d\'envoi',
    transactionRef: 'Référence / Code de transaction SMS',
    submitPayment: 'Déclarer mon paiement (500 FCFA)',
    submittingPayment: 'Enregistrement du paiement...',
    paymentSubmittedSuccess: 'Paiement soumis avec succès ! L\'administrateur va valider votre transaction dans les plus brefs délais.',
    paymentPendingNotice: 'Votre paiement est actuellement en attente de validation par l\'administrateur. L\'export PDF se débloquera automatiquement dès validation.',

    // Admin Panel
    adminTitle: 'Panneau d\'Administration - Validations Mobile Money',
    pendingPaymentsTab: 'Paiements en attente',
    allPaymentsTab: 'Historique des paiements',
    searchRefUser: 'Rechercher par référence, email ou numéro...',
    noPaymentsFound: 'Aucun paiement trouvé',
    tableDate: 'Date',
    tableUser: 'Utilisateur',
    tableCV: 'CV',
    tableAmount: 'Montant',
    tableRecipient: 'Destinataire',
    tableSender: 'Expéditeur',
    tableRef: 'Réf. Transaction',
    tableStatus: 'Statut',
    tableActions: 'Actions',
    btnValidate: 'Valider (Débloquer PDF)',
    btnReject: 'Rejeter',
    rejectNotePrompt: 'Raison du rejet (optionnel) :',
    paymentValidatedMsg: 'Paiement validé avec succès ! L\'export PDF est débloqué pour l\'utilisateur.',
    paymentRejectedMsg: 'Paiement rejeté.',

    // General
    cancel: 'Annuler',
    save: 'Enregistrer',
    close: 'Fermer',
    confirm: 'Confirmer',
    loading: 'Chargement en cours...'
  },
  en: {
    // Nav & Header
    appTitle: 'CV Builder',
    navHome: 'Home',
    navDashboard: 'My Resumes',
    navTemplates: 'Template Gallery',
    navAdmin: 'Administration',
    login: 'Log In',
    register: 'Sign Up',
    logout: 'Log Out',
    demoAccount: 'Demo Account',
    adminAccount: 'Admin Account',

    // Hero & Landing
    heroTitle: 'Create your professional CV in minutes',
    heroSubtitle: 'Choose from 50 Canva-style modern templates, edit live, drag and drop sections, and export your resume as a clean PDF.',
    ctaCreateCV: 'Create My CV Now',
    ctaBrowseTemplates: 'Explore 50 Templates',
    ctaImportCV: 'Import Existing CV (PDF/DOCX)',
    feature1Title: '50 Pro Templates',
    feature1Desc: 'Modern, classic, creative, minimalist, or executive.',
    feature2Title: 'Drag & Drop & Photo',
    feature2Desc: 'Reorder sections freely and crop your profile photo.',
    feature3Title: 'Fast PDF Export',
    feature3Desc: 'Simple 500 FCFA Mobile Money payment and instant download.',

    // Dashboard
    myResumes: 'My Created Resumes',
    createNewCV: 'Create New Resume',
    importCVBtn: 'Import Resume (PDF/DOCX)',
    searchPlaceholder: 'Search resume by title...',
    filterAll: 'All Resumes',
    filterPaid: 'Paid (Ready for export)',
    filterPending: 'Pending payment',
    noCVsFound: 'No resumes found',
    noCVsSubtitle: 'Create your first resume using our 50 professional templates or import a document.',
    statusPaid: 'Paid',
    statusPending: 'Awaiting Validation',
    statusUnpaid: 'Unpaid',
    lastUpdated: 'Updated on',
    actionEdit: 'Edit in Builder',
    actionDuplicate: 'Duplicate',
    actionRename: 'Rename',
    actionDelete: 'Delete',
    actionPayExport: 'Pay / Export (500 FCFA)',
    actionDownloadPDF: 'Download PDF',
    confirmDelete: 'Are you sure you want to delete this resume?',
    cvRenamed: 'Resume renamed successfully!',
    cvDuplicated: 'Resume duplicated successfully!',

    // Template Gallery
    galleryTitle: 'Resume Template Library',
    gallerySubtitle: 'Select a template to begin. You can switch templates anytime without losing your content.',
    catAll: 'All (50)',
    catModerne: 'Modern',
    catClassique: 'Classic',
    catCreatif: 'Creative',
    catMinimaliste: 'Minimalist',
    catExecutif: 'Executive & Academic',
    useThisTemplate: 'Use This Template',

    // Import CV
    importModalTitle: 'Import Existing Resume',
    importModalDesc: 'Upload your resume in PDF or DOCX format. Our system will extract the text and pre-fill your builder automatically.',
    dropzoneText: 'Drag your PDF or DOCX file here, or click to browse',
    dropzoneHint: 'Accepted formats: .pdf, .docx (Max 10 MB)',
    importing: 'Extracting and parsing text...',
    importSuccess: 'Resume imported successfully! Sections have been pre-filled.',
    importUnsortedNotice: 'Some items were placed in "Raw Import to Sort" for easy reordering.',

    // CV Editor
    editorTitle: 'CV Builder',
    autoSaveSaved: 'Saved',
    autoSaveSaving: 'Saving...',
    manualSave: 'Save',
    backToDashboard: 'Back to Dashboard',
    changeTemplate: 'Change Template',
    customizeStyle: 'Style & Colors',
    tabContent: 'Content & Sections',
    tabPreview: 'CV Preview',

    // Style Panel
    accentColor: 'Accent Color',
    fontFamily: 'Font Family',
    applyStyle: 'Apply to CV',

    // Sections & Fields
    addSection: 'Add Custom Section',
    sectionTitle: 'Section Title',
    sectionNamePlaceholder: 'E.g. Projects, Certifications, Volunteering...',
    hideSection: 'Hide',
    showSection: 'Show',
    deleteSection: 'Delete Section',
    dragToReorder: 'Drag to reorder',

    // Profil
    sectionProfil: 'Profile & Contact Details',
    fullName: 'Full Name',
    jobTitle: 'Professional Title',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'City, Country',
    website: 'Website / Portfolio',
    linkedin: 'LinkedIn Profile',
    summary: 'Professional Summary / Bio',
    profilePhoto: 'Profile Photo',
    changePhoto: 'Change Photo',
    cropZoomPhoto: 'Crop & Zoom',
    removePhoto: 'Remove Photo',

    // Experience
    sectionExperience: 'Work Experience',
    addExperience: 'Add Experience',
    position: 'Job Title',
    company: 'Company / Organization',
    city: 'City',
    startDate: 'Start Date',
    endDate: 'End Date',
    currentJob: 'I currently work here',
    jobDescription: 'Description of responsibilities & achievements',

    // Education
    sectionEducation: 'Education & Degrees',
    addEducation: 'Add Education',
    degree: 'Degree / Field of Study',
    school: 'Institution / University',

    // Skills
    sectionSkills: 'Skills',
    addSkill: 'Add Skill',
    skillName: 'Skill Name',
    skillLevel: 'Proficiency Level (1 to 5)',

    // Languages
    sectionLanguages: 'Languages',
    addLanguage: 'Add Language',
    languageName: 'Language',
    languageProficiency: 'Proficiency Level',

    // Spellcheck
    spellcheckTitle: 'Spell Checker',
    spellingErrorsFound: 'word(s) need attention',
    noSpellingErrors: 'No spelling errors detected',
    spellSuggestion: 'Suggestions:',

    // Payment & Export
    exportPDF: 'Export as PDF',
    paymentModalTitle: 'CV Creation Payment',
    paymentPrice: 'Amount: 500 FCFA',
    paymentNotice: 'To unlock high-definition PDF export of your resume, please send a Mobile Money payment of 500 FCFA to one of our two official numbers below:',
    numOrange: '658606103 (Mobile Money 1)',
    numMTN: '653998494 (Mobile Money 2)',
    paymentInstructions: '1. Send 500 FCFA from your phone.\n2. Note the transaction reference code received via SMS.\n3. Fill in the form below for fast validation.',
    recipientNumber: 'Number you sent money to',
    selectRecipient: 'Select recipient number',
    senderNumber: 'Your sender phone number',
    transactionRef: 'SMS Transaction Reference Code',
    submitPayment: 'Submit Payment Declaration (500 FCFA)',
    submittingPayment: 'Submitting payment...',
    paymentSubmittedSuccess: 'Payment submitted successfully! An admin will validate your transaction shortly.',
    paymentPendingNotice: 'Your payment is currently pending admin validation. PDF export will unlock automatically upon approval.',

    // Admin Panel
    adminTitle: 'Admin Dashboard - Mobile Money Validations',
    pendingPaymentsTab: 'Pending Payments',
    allPaymentsTab: 'Payment History',
    searchRefUser: 'Search by reference, email or phone...',
    noPaymentsFound: 'No payments found',
    tableDate: 'Date',
    tableUser: 'User',
    tableCV: 'CV',
    tableAmount: 'Amount',
    tableRecipient: 'Recipient',
    tableSender: 'Sender',
    tableRef: 'Transaction Ref',
    tableStatus: 'Status',
    tableActions: 'Actions',
    btnValidate: 'Validate (Unlock PDF)',
    btnReject: 'Reject',
    rejectNotePrompt: 'Reason for rejection (optional):',
    paymentValidatedMsg: 'Payment validated successfully! PDF export unlocked for user.',
    paymentRejectedMsg: 'Payment rejected.',

    // General
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...'
  }
};

export function getTranslation(lang: Language, key: keyof typeof translations['fr']): string {
  return translations[lang]?.[key] || translations['fr'][key] || key;
}
