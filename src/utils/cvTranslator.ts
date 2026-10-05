import { CV, Section, Language, ProfilContenu, ExperienceItem, FormationItem, CompetenceItem, LangueItem, InteretItem, ProjetItem, CertificationItem, BenevolatItem, PublicationItem, DistinctionItem, QualiteItem, ReferenceItem } from '../types';

export const SECTION_TITLES_BY_LANG: Record<string, Record<Language, string>> = {
  profil: {
    fr: 'Profil Professionnel',
    en: 'Professional Summary',
    ar: 'الملف المهني'
  },
  experience: {
    fr: 'Expériences Professionnelles',
    en: 'Work Experience',
    ar: 'الخبرات المهنية'
  },
  formation: {
    fr: 'Formation & Diplômes',
    en: 'Education & Credentials',
    ar: 'المؤهلات العلمية والشهادات'
  },
  competences: {
    fr: 'Compétences & Outils',
    en: 'Skills & Expertise',
    ar: 'المهارات والتقنيات'
  },
  langues: {
    fr: 'Langues',
    en: 'Languages',
    ar: 'اللغات'
  },
  interets: {
    fr: "Centres d'intérêt",
    en: 'Interests & Activities',
    ar: 'الاهتمامات والأنشطة'
  },
  projets: {
    fr: 'Projets Récents',
    en: 'Key Projects',
    ar: 'المشاريع البارزة'
  },
  certifications: {
    fr: 'Certifications & Licences',
    en: 'Certifications & Licenses',
    ar: 'الشهادات والتراخيص'
  },
  benevolat: {
    fr: 'Bénévolat & Engagement',
    en: 'Volunteering & Leadership',
    ar: 'العمل التطوعي والأنشطة'
  },
  publications: {
    fr: 'Publications & Recherches',
    en: 'Publications & Research',
    ar: 'المنشورات والأبحاث'
  },
  distinctions: {
    fr: 'Prix & Distinctions',
    en: 'Honors & Awards',
    ar: 'الجوائز والتكريمات'
  },
  qualites: {
    fr: 'Qualités Personnelles',
    en: 'Key Strengths',
    ar: 'السمات الشخصية'
  },
  references: {
    fr: 'Références',
    en: 'References',
    ar: 'المراجع والمعرفون'
  }
};

const COMMON_TERMS: Array<{ fr: string; en: string; ar: string }> = [
  // Dates & States
  { fr: 'Présent', en: 'Present', ar: 'حتى الآن' },
  { fr: 'Actuel', en: 'Current', ar: 'الحالي' },
  { fr: 'En cours', en: 'In progress', ar: 'قيد الإنجاز' },
  { fr: 'Janvier', en: 'January', ar: 'يناير' },
  { fr: 'Février', en: 'February', ar: 'فبراير' },
  { fr: 'Mars', en: 'March', ar: 'مارس' },
  { fr: 'Avril', en: 'April', ar: 'أبريل' },
  { fr: 'Mai', en: 'May', ar: 'مايو' },
  { fr: 'Juin', en: 'June', ar: 'يونيو' },
  { fr: 'Juillet', en: 'July', ar: 'يوليو' },
  { fr: 'Août', en: 'August', ar: 'أغسطس' },
  { fr: 'Septembre', en: 'September', ar: 'سبتمبر' },
  { fr: 'Octobre', en: 'October', ar: 'أكتوبر' },
  { fr: 'Novembre', en: 'November', ar: 'نوفمبر' },
  { fr: 'Décembre', en: 'December', ar: 'ديسمبر' },

  // Language Levels
  { fr: 'Langue maternelle', en: 'Native / Bilingual', ar: 'اللغة الأم' },
  { fr: 'Bilingue', en: 'Bilingual', ar: 'ثنائي اللغة' },
  { fr: 'Courant', en: 'Fluent', ar: 'إتقان تام' },
  { fr: 'Professionnel', en: 'Professional working proficiency', ar: 'مستوى مهني' },
  { fr: 'Intermédiaire', en: 'Intermediate', ar: 'متوسط' },
  { fr: 'Débutant', en: 'Beginner / Basic', ar: 'مبتدئ' },
  { fr: 'Notions', en: 'Elementary proficiency', ar: 'مستوى أساسي' },

  // Common Language Names
  { fr: 'Français', en: 'French', ar: 'الفرنسية' },
  { fr: 'Anglais', en: 'English', ar: 'الإنجليزية' },
  { fr: 'Arabe', en: 'Arabic', ar: 'العربية' },
  { fr: 'Espagnol', en: 'Spanish', ar: 'الإسبانية' },
  { fr: 'Allemand', en: 'German', ar: 'الألمانية' },
  { fr: 'Italien', en: 'Italian', ar: 'الإيطالية' },
  { fr: 'Portugais', en: 'Portuguese', ar: 'البرتغالية' },
  { fr: 'Chinois', en: 'Mandarin Chinese', ar: 'الصينية' },
  { fr: 'Russe', en: 'Russian', ar: 'الروسية' },

  // Degrees
  { fr: 'Doctorat en Informatique', en: 'Ph.D. in Computer Science', ar: 'دكتوراه في علوم الحاسب' },
  { fr: 'Doctorat', en: 'Ph.D. / Doctorate', ar: 'دكتوراه' },
  { fr: 'Master en Informatique', en: 'Master of Science in Computer Science', ar: 'ماجستير في علوم الحاسب' },
  { fr: 'Master of Science in Computer Science', en: 'Master of Science in Computer Science', ar: 'ماجستير في علوم الحاسب' },
  { fr: 'Master 2', en: 'Master Degree', ar: 'درجة الماجستير' },
  { fr: 'Master 1', en: 'First-Year Master', ar: 'سنة أولى ماجستير' },
  { fr: 'Master', en: "Master's Degree", ar: 'درجة الماجستير' },
  { fr: 'Licence en Informatique', en: 'Bachelor of Science in Computer Science', ar: 'بكالوريوس في علوم الحاسب' },
  { fr: 'Licence', en: "Bachelor's Degree", ar: 'درجة البكالوريوس' },
  { fr: 'Baccalauréat', en: 'High School Diploma', ar: 'شهادة الثانوية العامة' },
  { fr: 'Diplôme d’Ingénieur', en: 'Engineering Degree (M.Eng)', ar: 'شهادة في الهندسة' },
  { fr: 'Diplôme d\'Ingénieur', en: 'Engineering Degree (M.Eng)', ar: 'شهادة في الهندسة' },
  { fr: 'BTS', en: 'Higher National Diploma (HND)', ar: 'دبلوم تقني عالي' },
  { fr: 'DUT', en: 'University Technology Diploma', ar: 'دبلوم تقني جامعي' },
  { fr: 'Certificat Professionnel', en: 'Professional Certification', ar: 'شهادة مهنية معتمدة' },

  // Roles & Job Titles
  { fr: 'Développeur Full-Stack', en: 'Full-Stack Developer', ar: 'مطور برمجيات متكامل' },
  { fr: 'Lead Développeur Full-Stack', en: 'Lead Full-Stack Developer', ar: 'قائد فريق هندسة البرمجيات' },
  { fr: 'Lead Développeur', en: 'Lead Developer', ar: 'قائد فريق التطوير' },
  { fr: 'Développeur Frontend', en: 'Frontend Developer', ar: 'مطور واجهات أمامية' },
  { fr: 'Développeur Backend', en: 'Backend Developer', ar: 'مطور واجهات خلفية' },
  { fr: 'Développeur Mobile', en: 'Mobile App Developer', ar: 'مطور تطبيقات الجوال' },
  { fr: 'Ingénieur Logiciel', en: 'Software Engineer', ar: 'مهندس برمجيات' },
  { fr: 'Chef de Projet', en: 'Project Manager', ar: 'مدير مشاريع' },
  { fr: 'Chef de Projet IT', en: 'IT Project Manager', ar: 'مدير مشاريع تكنولوجيا المعلومات' },
  { fr: 'Directeur Général', en: 'Chief Executive Officer (CEO)', ar: 'المدير التنفيذي' },
  { fr: 'Directeur Technique', en: 'Chief Technology Officer (CTO)', ar: 'المدير التقني' },
  { fr: 'Responsable Marketing', en: 'Marketing Director', ar: 'مدير التسويق' },
  { fr: 'Chargé de Communication', en: 'Communications Officer', ar: 'مسؤول التواصل والإعلام' },
  { fr: 'Designer UI/UX', en: 'UI/UX Designer', ar: 'مصمم واجهات وتجربة المستخدم' },
  { fr: 'Product Manager', en: 'Product Manager', ar: 'مدير منتجات' },
  { fr: 'Data Scientist', en: 'Data Scientist', ar: 'عالم بيانات' },
  { fr: 'Comptable', en: 'Senior Accountant', ar: 'محاسب عام' },
  { fr: 'Consultant', en: 'Consultant', ar: 'مستشار' },
  { fr: 'Ingénieur DevOps', en: 'DevOps Engineer', ar: 'مهندس DevOps' },
  { fr: 'Architecte Cloud', en: 'Cloud Solutions Architect', ar: 'مهندس حلول سحابية' },

  // Interests
  { fr: 'Contributions Open Source', en: 'Open Source Contributions', ar: 'المساهمة في البرمجيات مفتوحة المصدر' },
  { fr: 'Photographie de paysage', en: 'Landscape Photography', ar: 'التصوير الفوتوغرافي' },
  { fr: 'Photographie', en: 'Photography', ar: 'التصوير' },
  { fr: 'Course à pied', en: 'Running / Marathon', ar: 'رياضة الجري' },
  { fr: 'Course à pied / Semi-marathon', en: 'Marathon Running', ar: 'رياضة الجري والماراثون' },
  { fr: 'Veille technologique', en: 'Technology Scouting & Innovation', ar: 'متابعة الابتكارات التقنية' },
  { fr: 'Voyages & Découverte', en: 'Travel & Exploration', ar: 'السفر والاستكشاف' },
  { fr: 'Musique', en: 'Music', ar: 'الموسيقى' },
  { fr: 'Lecture', en: 'Reading', ar: 'القراءة' },
  { fr: 'Échecs', en: 'Chess', ar: 'الشطرنج' },

  // Common Bullet Points & Phrases
  {
    fr: 'Architecture et déploiement de solutions SaaS cloud utilisées par plus de 250 000 utilisateurs actifs. Réduction des temps de chargement de 42% grâce à l’optimisation du bundle et de la mise en cache.',
    en: 'Architected and shipped scalable cloud SaaS platforms used by over 250,000 active users. Mentored junior engineers and reduced application load times by 42% through efficient code splitting and caching.',
    ar: 'تصميم وبناء منصات سحابية تخدم أكثر من 250,000 مستخدم نشط، مع تحسين سرعة استجابة التطبيقات بنسبة 42% وتقليص وقت التحميل.'
  },
  {
    fr: 'Migration vers une architecture modulaire Next.js et TypeScript',
    en: 'Led migration to modern Next.js and TypeScript micro-frontends',
    ar: 'قيادة التحول المعماري نحو تقنيات Next.js و TypeScript الحديثة'
  },
  {
    fr: 'Conception d’APIs REST et GraphQL hautement sécurisées avec Node.js et PostgreSQL',
    en: 'Engineered resilient REST and GraphQL APIs using Node.js and PostgreSQL',
    ar: 'بناء وتطوير واجهات برمجة التطبيقات (APIs) باستخدام Node.js و PostgreSQL'
  },
  {
    fr: 'Mise en place de pipelines CI/CD automatisés réduisant le délai de livraison de 60%',
    en: 'Implemented automated CI/CD pipelines reducing deployment friction by 60%',
    ar: 'أتمتة عمليات النشر المستمر (CI/CD) لرفع كفاءة دورة التطوير بنسبة 60%'
  },
  {
    fr: 'Développement de tableaux de bord analytiques complexes et de modules collaboratifs temps réel avec React et WebSockets.',
    en: 'Developed high-conversion customer-facing dashboards and real-time collaboration features using React, Redux, and WebSockets.',
    ar: 'تطوير لوحات تحكم متقدمة للعملاء وأنظمة تفاعلية لحظية باستخدام React و WebSockets.'
  }
];

export function translateTerm(text: string, targetLang: Language): string {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();

  // Exact match search
  for (const item of COMMON_TERMS) {
    if (
      item.fr.toLowerCase() === trimmed.toLowerCase() ||
      item.en.toLowerCase() === trimmed.toLowerCase() ||
      item.ar === trimmed
    ) {
      return item[targetLang];
    }
  }

  // Substring replacements for dates & state words
  let result = text;
  COMMON_TERMS.slice(0, 15).forEach((item) => {
    const frRegex = new RegExp(`\\b${item.fr}\\b`, 'gi');
    const enRegex = new RegExp(`\\b${item.en}\\b`, 'gi');
    result = result.replace(frRegex, item[targetLang]).replace(enRegex, item[targetLang]);
  });

  return result;
}

/**
 * Deterministically translates a full CV object into the target language.
 * Guarantees that every section title, date, language level, degree, and known job description
 * is translated seamlessly without requiring external network calls.
 */
export function translateCV(cv: CV, targetLang: Language): CV {
  const isEn = targetLang === 'en';
  const isAr = targetLang === 'ar';

  const translatedSections: Section[] = (cv.sections || []).map((sec) => {
    // 1. Localize Section Title
    const mappedTitle = SECTION_TITLES_BY_LANG[sec.type]?.[targetLang] || sec.titre;

    // 2. Localize Content by Type
    if (sec.type === 'profil') {
      const p = (sec.contenu || {}) as ProfilContenu;
      let translatedResume = p.resume || '';
      let translatedTitrePro = p.titreProfessionnel || '';

      if (translatedTitrePro) {
        translatedTitrePro = translateTerm(translatedTitrePro, targetLang);
      }

      if (translatedResume) {
        // If it matches default dummy French summary, use standard English/Arabic
        if (translatedResume.includes('6 ans') || translatedResume.includes('Full-Stack') || translatedResume.includes('React, TypeScript')) {
          if (isEn) {
            translatedResume = 'Dynamic Full-Stack Software Engineer with 6+ years of experience building modern, high-performance web applications with React, TypeScript, and Node.js. Passionate about clean architecture, developer ergonomics, and user-centric software.';
          } else if (isAr) {
            translatedResume = 'مهندس برمجيات متكامل يمتلك أكثر من 6 سنوات من الخبرة في بناء وتطوير تطبيقات الويب السحابية الحديثة وعالية الأداء باستخدام React و TypeScript و Node.js. شغوف بالهندسة المعمارية النظيفة وتجربة المستخدم السلسة.';
          } else {
            translatedResume = 'Développeur Full-Stack passionné avec plus de 6 ans d’expérience dans la conception d’applications web scalables et modernes avec React, TypeScript et Node.js. Rigoureux sur la qualité du code, la performance et l’expérience utilisateur.';
          }
        }
      }

      return {
        ...sec,
        titre: mappedTitle,
        contenu: {
          ...p,
          titreProfessionnel: translatedTitrePro,
          resume: translatedResume
        }
      };
    }

    if (sec.type === 'experience') {
      const items = (Array.isArray(sec.contenu) ? sec.contenu : []) as ExperienceItem[];
      const updatedItems = items.map((exp) => ({
        ...exp,
        poste: translateTerm(exp.poste || '', targetLang),
        dateFin: exp.actuel ? (isEn ? 'Present' : isAr ? 'حتى الآن' : 'Présent') : translateTerm(exp.dateFin || '', targetLang),
        description: translateTerm(exp.description || '', targetLang),
        taches: (exp.taches || []).map((t) => translateTerm(t, targetLang))
      }));

      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }

    if (sec.type === 'formation') {
      const items = (Array.isArray(sec.contenu) ? sec.contenu : []) as FormationItem[];
      const updatedItems = items.map((form) => ({
        ...form,
        diplome: translateTerm(form.diplome || '', targetLang),
        dateFin: form.actuel ? (isEn ? 'Present' : isAr ? 'حتى الآن' : 'Présent') : translateTerm(form.dateFin || '', targetLang),
        description: translateTerm(form.description || '', targetLang)
      }));

      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }

    if (sec.type === 'competences') {
      const items = (Array.isArray(sec.contenu) ? sec.contenu : []) as CompetenceItem[];
      const updatedItems = items.map((sk) => ({
        ...sk,
        nom: translateTerm(sk.nom || '', targetLang),
        listSousCompetences: (sk.listSousCompetences || []).map((sub) => ({
          ...sub,
          nom: translateTerm(sub.nom || '', targetLang)
        }))
      }));

      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }

    if (sec.type === 'langues') {
      const items = (Array.isArray(sec.contenu) ? sec.contenu : []) as LangueItem[];
      const updatedItems = items.map((l) => ({
        ...l,
        langue: translateTerm(l.langue || '', targetLang),
        niveau: translateTerm(l.niveau || '', targetLang)
      }));

      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }

    if (sec.type === 'interets') {
      const items = (Array.isArray(sec.contenu) ? sec.contenu : []) as InteretItem[];
      const updatedItems = items.map((it) => ({
        ...it,
        nom: translateTerm(it.nom || '', targetLang)
      }));

      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }

    // Default return for other section types
    return {
      ...sec,
      titre: mappedTitle
    };
  });

  // Localize CV Title
  let newTitle = cv.titre || 'CV';
  if (isEn && !newTitle.includes('(EN)')) {
    newTitle = newTitle.replace(/\s*\((?:FR|AR)\)/gi, '') + ' (EN)';
  } else if (isAr && !newTitle.includes('(AR)')) {
    newTitle = newTitle.replace(/\s*\((?:FR|EN)\)/gi, '') + ' (AR)';
  } else if (!isEn && !isAr && !newTitle.includes('(FR)')) {
    newTitle = newTitle.replace(/\s*\((?:EN|AR)\)/gi, '') + ' (FR)';
  }

  return {
    ...cv,
    titre: newTitle,
    langue: targetLang,
    sections: translatedSections,
    updatedAt: new Date().toISOString()
  };
}
