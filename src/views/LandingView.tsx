import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import cvWallBg from '../assets/images/cv_wall_background_1788524505171.jpg';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { usePricingSettings } from '../state/usePricingSettings';
import { isPaymentActive } from '../utils/adminPaidMatrix';
import { LandingTemplateCarousel } from '../components/LandingTemplateCarousel';
import { AppLogo } from '../components/AppLogo';
import { LegalModal } from '../components/LegalModal';
import { JOB_LANDING_PAGES, SECTEUR_LABELS } from '../data/jobLandingPages';
import { 
  Upload, 
  Linkedin, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  FileText, 
  ShieldCheck, 
  Award, 
  ArrowRight,
  ChevronDown,
  Quote,
  Star,
  Zap,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface LandingViewProps {
  langue: Language;
  onStartCreate: () => void;
  onBrowseTemplates: () => void;
  onImportClick: () => void;
  onCreateBlankCV?: () => void;
  onOpenLetterGenerator?: () => void;
  onOpenLinkedInGenerator?: () => void;
  onOpenJobTargeting?: () => void;
  onOpenUpgradeModal?: () => void;
  onSelectTemplate?: (templateId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  langue,
  onStartCreate,
  onBrowseTemplates,
  onImportClick,
  onCreateBlankCV,
  onOpenLetterGenerator,
  onOpenLinkedInGenerator,
  onOpenJobTargeting,
  onOpenUpgradeModal,
  onSelectTemplate
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(langue, key);
  const { formatPlanPrice } = usePricingSettings();

  const isAr = langue === 'ar';
  const isEn = langue === 'en';

  const [legalModalTab, setLegalModalTab] = useState<'cgu' | 'cgv' | 'privacy' | 'mentions' | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showAllJobCards, setShowAllJobCards] = useState(false);

  const classiquePrice = formatPlanPrice('classique', 'usd-first', langue);
  const premiumPrice = formatPlanPrice('premium', 'usd-first', langue);
  const visibleJobCards = showAllJobCards ? JOB_LANDING_PAGES : JOB_LANDING_PAGES.slice(0, 6);

  // Dynamic Content according to language with human, inspiring editorial tone
  const content = {
    heroBadge: isEn 
      ? 'Crafted with recruiters for real careers' 
      : isAr 
      ? 'مصمم بالتعاون مع مسؤولي التوظيف' 
      : 'Conçu avec des recruteurs pour faire la différence',
    
    heroTitleStart: isEn ? 'The resume that makes people want to ' : isAr ? 'السيرة الذاتية التي تجعلهم يريدون ' : 'Le CV qui donne envie de ',
    heroTitleHighlight: isEn ? 'meet you.' : isAr ? 'مقابلتك.' : 'vous rencontrer.',
    
    heroSub: isEn 
      ? 'Structure your experience with clarity, import your existing documents in one click, and stand out with precision formatting designed for humans and ATS.'
      : isAr
      ? 'نسق خبراتك بوضوح وأناقة، استورد مستنداتك بنقرة واحدة، وتميز بطلب عمل متقن وجاهز لجميع أنظمة التوظيف.'
      : 'Structurez vos expériences avec clarté, importez votre ancien document en un instant et présentez un parcours valorisant, taillé sur mesure pour capter l’attention des recruteurs.',

    ctaPrimary: isEn ? 'Create my CV' : isAr ? 'ابدأ إنشاء سيرتي' : 'Créer mon CV maintenant',
    ctaSecondary: isEn ? 'Browse 70 Templates' : isAr ? 'استعراض 70 نموذجًا' : 'Explorer les 70 modèles',
    ctaImport: isEn ? 'Import an existing CV' : isAr ? 'استيراد سيرة ذاتية جاهزة' : 'Importer mon CV existant (PDF/Word)',

    trustStats: [
      { value: '70', label: isEn ? 'Curated styles' : isAr ? 'نموذج منسق' : 'Styles soignés' },
      { value: '100%', label: isEn ? 'ATS Compatible' : isAr ? 'متوافق مع ATS' : 'Compatible ATS' },
      { value: '300 DPI', label: isEn ? 'Vector PDF export' : isAr ? 'تصدير عالي الدقة' : 'Export PDF vectoriel' },
      { value: '15 000+', label: isEn ? 'Resumes created' : isAr ? 'سيرة تم إعدادها' : 'Candidatures créées' },
    ],

    pillarsTitle: isEn ? 'Everything you need to step forward with confidence' : isAr ? 'كل ما تحتاجه للتقديم بثقة تامة' : 'Tout ce qu’il faut pour postuler avec sérénité',
    pillarsSub: isEn 
      ? 'No bloated buzzwords, just thoughtful tools to turn your real background into an interview-winning application.'
      : isAr
      ? 'أدوات عملية ومصممة بعناية لتحويل خبراتك الفعلية إلى فرصة عمل حقيقية.'
      : 'Des outils pensés pour les candidats : mise en page au millimètre, aide à la rédaction et adaptation naturelle à chaque opportunité.',

    pillars: [
      {
        icon: FileText,
        title: isEn ? 'Typographic & Visual Balance' : isAr ? 'تنسيق بصري وطباعي متوازن' : 'Mise en page millimétrée',
        desc: isEn 
          ? 'Clear spacing, calibrated fonts, and smart page breaks that ensure your CV looks immaculate on 1 or 2 pages.'
          : isAr
          ? 'مسافات مدروسة وخطوط واضحة وتوزيع ذكي للصفحات يضمن خلو سيرتك من أي فراغ غير مرغوب فيه.'
          : 'Gestion intelligente des marges, espacements équilibrés et finitions soignées pour un rendu A4 impeccable sur 1 ou 2 pages.',
        tag: isEn ? 'Design' : isAr ? 'تصميم' : 'Rendu A4'
      },
      {
        icon: Upload,
        title: isEn ? 'Instant Import & Restructure' : isAr ? 'استيراد فوري وإعادة تنظيم' : 'Import intelligent sans ressaisie',
        desc: isEn 
          ? 'Upload your PDF or Word resume. Our engine extracts your experiences and education directly into your chosen design.'
          : isAr
          ? 'ارفع سيرتك بصيغة PDF أو Word لنقل الخبرات والشهادات مباشرة إلى التصميم الجديد.'
          : 'Chargez votre ancien CV en PDF ou Word : vos informations sont extraites et replacées proprement dans le modèle de votre choix.',
        tag: isEn ? 'Time-saver' : isAr ? 'توفير الوقت' : 'Gain de temps'
      },
      {
        icon: Target,
        title: isEn ? 'Offer Alignment Assistant' : isAr ? 'مطابقة متطلبات الإعلان' : 'Mise en valeur ciblée',
        desc: isEn 
          ? 'Paste a job posting or upload a screenshot to highlight matching achievements and keywords recruiters look for.'
          : isAr
          ? 'ألصق نص الإعلان أو صورة المتطلبات لإبراز النقاط الأهم التي يبحث عنها مسؤول التوظيف.'
          : 'Collez une offre ou une capture d’écran d’annonce : valorisez immédiatement les compétences et réalisations attendues pour le poste.',
        tag: isEn ? 'Targeting' : isAr ? 'استهداف' : 'Pertinence'
      },
      {
        icon: Mail,
        title: isEn ? 'Matching Cover Letters' : isAr ? 'خطابات تقديم متناسقة' : 'Lettres & Profil LinkedIn',
        desc: isEn 
          ? 'Generate coherent, genuine cover letters and a strong LinkedIn summary aligned with your voice and goals.'
          : isAr
          ? 'صياغة خطابات تقديم مهنية وملخص لينكد إن جذاب يعبر عن شخصيتك وطموحاتك.'
          : 'Créez une lettre de motivation fluide et cohérente avec votre CV, ainsi qu’une accroche percutante pour votre profil LinkedIn.',
        tag: isEn ? 'Complete Suite' : isAr ? 'باقة شاملة' : 'Dossier complet'
      }
    ],

    journeyTitle: isEn ? 'How your next career step takes shape' : isAr ? 'كيف تبدأ خطوتك المهنية القادمة' : 'Comment votre démarche prend forme',
    journeySub: isEn 
      ? 'A natural, step-by-step path from your current notes to an interview-ready document.'
      : isAr
      ? 'مسار سلس ومرتب ينقلك خطوة بخطوة نحو ملف ترشح مقنع وجاهز للمقابلات.'
      : 'Un cheminement simple et rassurant, de vos premières notes jusqu’au document final remis au recruteur.',

    journeySteps: [
      {
        step: '01',
        title: isEn ? 'Choose the atmosphere' : isAr ? 'اختر الأسلوب الملائم' : 'Choisissez le ton juste',
        desc: isEn 
          ? 'Select a template that honors your industry: executive, creative, technical, medical, or classic academia.'
          : isAr
          ? 'اختر القالب الأنسب لمجالك: تنفيذي، إبداعي، تقني، طبي أو أكاديمي كلاسيكي.'
          : 'Explorez nos modèles conçus pour chaque secteur : finance, tech, santé, juridique, artisanat ou enseignement.'
      },
      {
        step: '02',
        title: isEn ? 'Tell your story' : isAr ? 'سجل مسارك بسهولة' : 'Racontez votre parcours',
        desc: isEn 
          ? 'Import an old resume or follow our clean guided fields. Adjust sections, skills, and highlights with total freedom.'
          : isAr
          ? 'استورد ملفك السابق أو اتبع الحقول الإرشادية مع حرية كاملة في تنظيم الأقسام والمهارات.'
          : 'Importez votre document existant ou remplissez vos étapes pas à pas. Réorganisez l’ordre des sections par simple glisser-déposer.'
      },
      {
        step: '03',
        title: isEn ? 'Refine details' : isAr ? 'دقق التفاصيل والمظهر' : 'Soignez les détails',
        desc: isEn 
          ? 'Fine-tune fonts, footer badges, line heights, and margins with real-time feedback that never breaks layout.'
          : isAr
          ? 'اضبط الخطوط وهوامش التذييل ومسافات الأسطر مع معاينة فورية ومريحة للعين.'
          : 'Personnalisez les polices, les coordonnées de bas de page et les nuances de couleur avec un aperçu fidèle en direct.'
      },
      {
        step: '04',
        title: isEn ? 'Apply with confidence' : isAr ? 'قدّم بثقة تامة' : 'Postulez l’esprit tranquille',
        desc: isEn 
          ? 'Download clean, sharp PDF files ready for online job boards, emails, and interview printouts.'
          : isAr
          ? 'حمّل ملف PDF أنيق ونقي وجاهز للإرسال الفوري عبر البريد أو الطباعة الورقية للمقابلة.'
          : 'Téléchargez votre PDF haute définition, lisible par les robots de recrutement et agréable à lire pour les recruteurs.'
      }
    ],

    testimonialsTitle: isEn ? 'Loved by candidates moving their careers forward' : isAr ? 'تجارب حقيقية لمرشحين حققوا أهدافهم' : 'Des retours concrets de candidats',
    testimonialsSub: isEn 
      ? 'Real feedback from professionals who updated their resume and secured interviews.'
      : isAr
      ? 'آراء مرشحين حدثوا ملفاتهم وحصلوا على مقابلات عمل فعلية.'
      : 'Ce que disent celles et ceux qui ont refait leur CV et décroché leurs entretiens grâce à la plateforme.',

    testimonials: [
      {
        name: 'Camille R.',
        role: isEn ? 'Marketing & Brand Manager' : isAr ? 'مديرة تسويق وهوية بصرية' : 'Responsable Marketing & Marque',
        location: 'Lyon, France',
        comment: isEn 
          ? 'The PDF export is literally pixel-perfect. Spacings remain intact and my two-page layout looks like it was designed by a human agency.'
          : isAr
          ? 'التصدير إلى PDF دقيق للغاية. المسافات بين الأقسام لم تتداخل وظهرت السيرة المكونة من صفحتين كأنها من استوديو تصميم محترف.'
          : 'L’export PDF est millimétré. Les marges de pied de page et les deux pages tombent pile, sans coupure disgracieuse. J’ai eu 3 retours d’entretiens en 10 jours.',
        rating: 5
      },
      {
        name: 'David N.',
        role: isEn ? 'Senior Software Engineer' : isAr ? 'مهندس برمجيات أول' : 'Ingénieur Logiciel Senior',
        location: 'Abidjan, Côte d’Ivoire',
        comment: isEn 
          ? 'Importing my old Word document took 30 seconds. I then tailored my experience to the European tech firm I targeted. The payment via Mobile Money was seamless.'
          : isAr
          ? 'استوردت ملفي القديم في ثوانٍ، وكيّفت المهارات مع متطلبات الشركة. تم تفعيل الحساب فوراً عبر الدفع بالهاتف.'
          : 'J’ai importé mon ancien CV Word en quelques secondes, puis ajusté les points clés pour une entreprise internationale. Le paiement Mobile Money était instantané.',
        rating: 5
      },
      {
        name: 'Élodie V.',
        role: isEn ? 'Executive Assistant' : isAr ? 'مساعدة تنفيذية' : 'Assistante de Direction',
        location: 'Bruxelles, Belgique',
        comment: isEn 
          ? 'Clean, reassuring and pleasant to use. The cover letter assistant helped me unblock writer’s block without sounding robotic.'
          : isAr
          ? 'واجهة مريحة ومطمئنة. ساعدني مساعد الخطابات في التعبير عن خبراتي بكلمات طبيعية دون أي طابع آلي مكرر.'
          : 'Une interface sobre, humaine et fluide. L’aide à la rédaction de lettre m’a débloquée sans jamais sonner comme du texte artificiel.',
        rating: 5
      }
    ],

    pricingTag: isEn ? 'TRANSPARENT PRICING' : isAr ? 'اشتراكات واضحة وبسيطة' : 'TARIFS CLAIRS & ACCESSIBLES',
    pricingTitle: isEn ? 'Choose what fits your current search' : isAr ? 'اختر الباقة الأنسب لبحثك الحالي' : 'Des formules adaptées à votre recherche',
    pricingSub: isEn 
      ? 'All plans last 1 month (30 days). Clear prices in USD ($) and local FCFA. Secure payments via Mobile Money and Credit Cards.' 
      : isAr 
      ? 'جميع الاشتراكات صالحة لمدة 30 يوماً. أسعار معلنة وواضحة مع دعم كامل للدفع عبر الهاتف والبطاقات.' 
      : 'Chaque forfait est valable 1 mois complet (30 jours). Tarifs transparents affichés en USD ($) et FCFA. Paiements sécurisés via Mobile Money & Carte bancaire.',

    freemiumBadge: isEn ? 'Free Discovery' : isAr ? 'خطة استكشاف مجانية' : 'Offre Découverte',
    freemiumDesc: isEn ? 'Perfect for building a simple initial resume and getting familiar with the editor.' : isAr ? 'مثالية لإنشاء سيرة أولية وتجربة المحرر.' : 'Idéal pour composer un premier CV propre et tester la souplesse de l’éditeur.',
    freemiumBtn: isEn ? 'Start for Free' : isAr ? 'ابدأ مجاناً' : 'Commencer gratuitement',
    freemiumFeatures: isEn ? [
      'Access to core free templates',
      'Dynamic canvas editor with drag & drop',
      'Guided entry for experience & education',
      'Standard PDF Export'
    ] : isAr ? [
      'الوصول إلى النماذج الأساسية',
      'محرر تفاعلي مباشر بالسحب والإفلات',
      'إدخال منظم للخبرات والتعليم',
      'تصدير بصيغة PDF القياسية'
    ] : [
      'Accès aux modèles de base gratuits',
      'Éditeur dynamique avec glisser-déposer',
      'Saisie guidée des expériences & formations',
      'Export PDF standard'
    ],

    classiqueBadge: isEn ? 'Complete Studio • 1 Month' : isAr ? 'استوديو كامل • شهر واحد' : 'Studio Complet • 1 Mois',
    classiqueTitle: isEn ? 'Classique Pack' : isAr ? 'الباقة الكلاسيكية' : 'Pack Classique',
    classiquePop: isEn ? '★ MOST POPULAR' : isAr ? '★ الأكثر اختياراً' : '★ LE PLUS CHOISI',
    classiqueDesc: isEn ? 'Full access to all 70 professional templates, custom columns, typography, and clean 300 DPI exports.' : isAr ? 'وصول شامل لجميع النماذج الـ 70 مع تخصيص الأعمدة والخطوط وتصدير 300 DPI بدون علامة مائية.' : 'Accès illimité aux 70 modèles professionnels, polices sur mesure, footer personnalisable et export PDF Haute Définition 300 DPI.',
    classiqueBtn: (price: string) => isEn ? `Choose Classique (${price})` : isAr ? `اختيار باقة كلاسيك (${price})` : `Choisir le Pack Classique (${price})`,
    classiqueFeatures: isEn ? [
      'Access to ALL 70 HD Templates',
      'Full Creator Studio: multi-column, fonts, layers & decorations',
      'Cover Letter Assistant',
      'LinkedIn Profile Optimizer',
      'Ultra HD 300 DPI PDF without watermark',
      'Full 1 month access (30 days)'
    ] : isAr ? [
      'وصول لجميع النماذج الـ 70 بدقة عالية',
      'استوديو تصميم كامل: أعمدة، خطوط، ترويسات وزخارف',
      'مساعد كتابة خطابات التقديم المخصصة',
      'مُحسّن ملخص وعنوان لينكد إن',
      'تصدير Ultra HD 300 DPI بدون أي علامة مائية',
      'اشتراك كامل لمدة 30 يوماً'
    ] : [
      'Accès complet à TOUS les 70 Modèles HD',
      'Creator Studio complet : colonnes, polices, calques & décors',
      'Assistant de Lettre de Motivation ciblée',
      'Optimiseur de profil LinkedIn',
      'Export PDF Ultra HD 300 DPI net sans filigrane',
      'Abonnement complet 1 mois (30 jours)'
    ],

    premiumBadge: isEn ? 'VIP Guidance • 1 Month' : isAr ? 'الباقة الشاملة VIP' : 'Suite VIP • 1 Mois',
    premiumTitle: isEn ? 'Premium VIP Pack' : isAr ? 'باقة بريميوم VIP' : 'Pack Premium VIP',
    premiumDesc: isEn ? 'For candidates actively targeting multiple high-stake positions with tailored materials for each offer.' : isAr ? 'للمرشحين الذين يستهدفون عروض عمل متعددة ويرغبون في ملاءمة كل طلب بدقة.' : 'Pour les candidatures stratégiques : adaptation illimitée selon chaque annonce, lettres multiples et accompagnement sur mesure.',
    premiumBtn: (price: string) => isEn ? `Activate VIP Pack (${price})` : isAr ? `تفعيل باقة VIP (${price})` : `Activer le Pack VIP (${price})`,
    premiumFeatures: isEn ? [
      'Everything in Classique Pack included',
      'Unlimited Job Offer Targeting (photo or text extraction)',
      'Unlimited generation of tailored cover letters',
      'Priority high-speed multi-format rendering',
      'Full VIP priority support for 30 days'
    ] : isAr ? [
      'كل ميزات الباقة الكلاسيكية مشمولة',
      'استهداف غير محدود لعروض العمل (من صورة أو نص الإعلان)',
      'توليد غير محدود لخطابات التقديم الخاصة بكل شركة',
      'معالجة وتصدير فائق السرعة',
      'دعم أولوي كامل لمدة 30 يوماً'
    ] : [
      'Tout ce qui est inclus dans le Pack Classique',
      'Adaptation ciblée illimitée selon l’annonce (photo ou texte)',
      'Génération illimitée de lettres et profils personnalisés',
      'Export haute vitesse multi-formats',
      'Accompagnement et support prioritaire (30 jours)'
    ],

    faqTag: isEn ? 'Questions & Answers' : isAr ? 'أسئلة متكررة وإجابات' : 'Questions & Réponses',
    faqTitle: isEn ? 'Everything you need to know' : isAr ? 'كل ما تود معرفته' : 'Foire aux questions',
    faqSub: isEn 
      ? 'Clear, straightforward answers about our templates, formatting, PDF export, and payment methods.'
      : isAr
      ? 'إجابات مباشرة وشفافة حول النماذج، والتنسيق، وتصدير PDF وطرق الدفع المتاحة.'
      : 'Des explications claires et transparentes pour préparer votre candidature en toute sérénité.',

    faqs: isEn ? [
      { 
        q: 'How does the PDF export guarantee clean formatting across multiple pages?', 
        a: 'Our layout engine calculates container dimensions with pixel precision. When a section overflows page 1, its text flows naturally to page 2 without leaving large artificial blank spaces, and the last line stays aligned 5px above your footer.' 
      },
      { 
        q: 'How do Mobile Money and card payments work?', 
        a: 'You can pay securely via Orange Money, MTN MoMo, Moov, Wave, or Visa/Mastercard. Your subscription is activated instantly upon payment confirmation.' 
      },
      { 
        q: 'Can I import an existing resume in PDF or Word format?', 
        a: 'Yes. Our smart parser scans your existing file, extracts contact info, work experiences, education, and skills, and maps them cleanly into any of our 70 design templates.' 
      },
      { 
        q: 'Are the exported CVs compatible with ATS recruitment software?', 
        a: 'Yes, 100%. All generated PDFs preserve pure selectable text and standard heading hierarchies so applicant tracking systems can parse your experiences effortlessly.' 
      },
      { 
        q: 'Can I customize colors, headers, and footer contact bars?', 
        a: 'Absolutely. In the Creator Studio, you can choose from multiple header layouts, toggle contact badges, customize accent colors, and select exactly which details appear in your footer.' 
      },
      { 
        q: 'Are my personal details protected and private?', 
        a: 'Your data is strictly isolated and stored securely in our database. We never sell or share your personal information with third parties.' 
      }
    ] : isAr ? [
      { 
        q: 'كيف يضمن تصدير PDF مظهراً متناسقاً عبر عدة صفحات؟', 
        a: 'يحسب نظام العرض أبعاد المحتوى بدقة عالية. عند امتداد سيرة ذاتية إلى صفحة ثانية، يتدفق النص بانسيابية دون ترك فراغات فارغة، مع الحفاظ على مسافة 5 بكسل بدقة فوق شريط التذييل.' 
      },
      { 
        q: 'كيف يتم الدفع عبر الهاتف والبطاقات المصرفية؟', 
        a: 'يمكنك الدفع بأمان وسهولة عبر Orange Money و MTN MoMo و Wave والبطاقات البنكية، ويتم تفعيل الحساب لحظياً بمجرد إتمام العملية.' 
      },
      { 
        q: 'هل يمكنني استيراد سيرتي الذاتية السابقة بصيغة PDF أو Word؟', 
        a: 'نعم. يحلل المستورد الذكي ملفك الحالي ويستخرج البيانات والخبرات والشهادات تلقائياً وينقلها إلى القالب المختار.' 
      },
      { 
        q: 'هل المستندات متوافقة مع أنظمة التوظيف الآلية ATS؟', 
        a: 'نعم تماماً. يتم تصدير ملفات PDF بنصوص قابلة للقراءة والنسخ مع هيكل واضح يسهل على برامج الفرز الآلي قراءته وفهرسته.' 
      },
      { 
        q: 'هل يمكنني تخصيص الألوان والترويسة وشريط الاتصال السفلي؟', 
        a: 'بالتأكيد. يمكنك تعديل الألوان الأساسية، واختيار نمط الترويسة، وتحديد بيانات الاتصال الظاهرة في أسفل الصفحة.' 
      },
      { 
        q: 'هل معلوماتي الشخصية وسيري الذاتية آمنة ومحمية؟', 
        a: 'بياناتك محفوظة في قاعدة بيانات مشفرة مع عزل تام لكل مستخدم، ولا تتم مشاركة معلوماتك مع أي جهات خارجية.' 
      }
    ] : [
      { 
        q: 'Comment l’export PDF garantit-il une mise en page nette sur plusieurs pages ?', 
        a: 'Notre moteur de rendu calcule précisément la hauteur disponible. Si une section déborde de la première page, le texte s’insère naturellement jusqu’à 5 px au-dessus du footer, et seul l’excédent passe en page 2 sans laisser de grand vide artificiel.' 
      },
      { 
        q: 'Comment s’effectue le règlement par Mobile Money et carte bancaire ?', 
        a: 'Le paiement est sécurisé et compatible avec Orange Money, MTN MoMo, Moov Money, Wave ainsi que les cartes Visa et Mastercard. Votre accès est débloqué immédiatement après confirmation de la transaction.' 
      },
      { 
        q: 'Puis-je importer mon ancien CV au format PDF ou Word (.docx) ?', 
        a: 'Oui. Le module d’importation analyse votre document pour en extraire vos coordonnées, expériences, diplômes et compétences, puis les intègre harmonieusement dans le modèle choisi.' 
      },
      { 
        q: 'Les CVs sont-ils compatibles avec les logiciels de recrutement (ATS) ?', 
        a: 'Oui, à 100%. Les fichiers PDF générés conservent un texte sélectionnable et une hiérarchie claire de titres pour garantir une lecture fluide par les systèmes de tri des candidatures.' 
      },
      { 
        q: 'Puis-je personnaliser le bandeau de contact et les couleurs ?', 
        a: 'Tout à fait. Dans le Creator Studio, vous choisissez parmi plusieurs styles d’en-tête, réglez la palette de couleurs, personnalisez les polices et décidez des coordonnées affichées dans le pied de page.' 
      },
      { 
        q: 'Mes données personnelles et mes documents sont-ils protégés ?', 
        a: 'Vos informations sont hébergées de manière confidentielle et sécurisée avec un cloisonnement strict par utilisateur. Nous ne commercialisons aucune donnée personnelle.' 
      }
    ],

    footerDesc: isEn 
      ? 'An intuitive, human-centered studio to design polished resumes, targeted cover letters, and advance your career with confidence.' 
      : isAr 
      ? 'منصة مهنية متكاملة لإعداد سير ذاتية راقية وخطابات تقديم مخصصة تفتح أمامك آفاق التوظيف بثقة.' 
      : 'La plateforme pensée pour les candidats : concevez des CVs remarquables, personnalisez chaque démarche et faites avancer votre parcours professionnel avec confiance.',
    footerCol1Title: isEn ? 'Craft & Tools' : isAr ? 'الأدوات والميزات' : 'Outils de création',
    footerCol2Title: isEn ? 'Resources' : isAr ? 'الموارد والمعرض' : 'Ressources & Modèles',
    footerCol3Title: isEn ? 'Safety & Payments' : isAr ? 'الأمان والمدفوعات' : 'Paiements & Sécurité',
    footerSecurity: isEn ? 'Secure Mobile Money and Card checkout with 256-bit encryption.' : isAr ? 'دفع آمن بالهاتف والبطاقات المصرفية مع تشفير كامل للبيانات.' : 'Paiements sécurisés via Mobile Money & Carte bancaire avec chiffrement renforcé.',
    footerCopy: isEn ? `© ${new Date().getFullYear()} MonCVPro. All rights reserved.` : isAr ? `© ${new Date().getFullYear()} MonCVPro. جميع الحقوق محفوظة.` : `© ${new Date().getFullYear()} MonCVPro. Tous droits réservés.`,
    footerTerms: isEn ? 'Terms of Service' : isAr ? 'شروط الاستخدام' : 'Conditions Générales d’Utilisation',
    footerCgv: isEn ? 'Terms of Sale' : isAr ? 'شروط البيع' : 'Conditions Générales de Vente',
    footerPrivacy: isEn ? 'Privacy Policy' : isAr ? 'سياسة الخصوصية' : 'Politique de Confidentialité',
    footerMentions: isEn ? 'Legal Notice' : isAr ? 'إشعار قانوني' : 'Mentions Légales'
  };

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#0B0F17] text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* HERO SECTION: Warm, glowing, executive glassmorphic design */}
      <section className="relative overflow-hidden pt-12 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-[#0B0F17]">
        
        {/* Glowing background ambient lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-500/10 rounded-full filter blur-[90px] pointer-events-none select-none z-0" />

        {/* CV Wall background image clearly visible */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <img 
            src={cvWallBg} 
            alt="Mur de Modèles de CV" 
            className="w-full h-full object-cover filter brightness-[0.98] contrast-[1.06] opacity-75 dark:opacity-30"
            referrerPolicy="no-referrer"
          />
          {/* Luminous, translucent overlay: keeps CV wall vibrant and visible while ensuring sharp text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-[#FAF9F6] dark:from-[#0B0F17]/85 dark:via-[#0B0F17]/75 dark:to-[#0B0F17]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Reassuring Glowing Human Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-sm backdrop-blur-md hover:scale-105 transition-transform cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <AppLogo size="xs" animated />
            <span>{content.heroBadge}</span>
          </div>

          {/* Editorial Headline */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {content.heroTitleStart}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent underline decoration-blue-300 dark:decoration-blue-800/80 decoration-wavy decoration-2 underline-offset-8">
                {content.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              {content.heroSub}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <button
              type="button"
              onClick={onCreateBlankCV || onStartCreate}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] group"
            >
              <span>{content.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onBrowseTemplates}
              className="w-full sm:w-auto px-7 py-4 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm rounded-2xl border border-slate-300/80 dark:border-slate-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md backdrop-blur-md active:scale-[0.98]"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{content.ctaSecondary}</span>
            </button>

            <button
              type="button"
              onClick={onImportClick}
              className="w-full sm:w-auto px-6 py-4 bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-2xl border border-slate-300/40 dark:border-slate-700/40 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>{content.ctaImport}</span>
            </button>
          </div>

          {/* Social Proof & Concrete Figures Cards */}
          <div className="pt-10 border-t border-slate-200/70 dark:border-slate-800/70 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {content.trustStats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xs backdrop-blur-xs text-center hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CAROUSEL SHOWCASE: 70 TEMPLATES */}
      <section className="py-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E131F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isEn ? 'CURATED COLLECTION' : isAr ? 'مجموعة منتقاة' : 'GALERIE DE MODÈLES'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              {isEn ? 'Find the design that matches your ambition' : isAr ? 'اختر التصميم الذي يمثل طموحك' : 'Trouvez le design qui valorise votre profil'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onBrowseTemplates}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>{isEn ? 'View all 70 designs' : isAr ? 'مشاهدة كافة النماذج' : 'Voir les 70 modèles'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <LandingTemplateCarousel
          langue={langue}
          onSelectTemplate={(id) => {
            if (onSelectTemplate) {
              onSelectTemplate(id);
            } else {
              onBrowseTemplates();
            }
          }}
          onBrowseAllTemplates={onBrowseTemplates}
        />
      </section>

      {/* MODÈLES DE CV PAR MÉTIER (CARDS WITH PRELOADED IMAGES & OVERLAID TEXT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-200/80 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isEn ? 'SPECIALIZED BY PROFESSION' : isAr ? 'سير ذاتية متخصصة حسب المهنة' : 'MODÈLES PAR MÉTIER'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {isEn ? 'CV Templates Designed for Your Industry' : isAr ? 'نماذج مصممة خصيصاً لمجال عملك' : 'Des CV Prêts à l’Emploi par Profession'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {isEn 
                ? 'Each job has specific expectations: key competencies, recruiter tips, and optimized architectures.' 
                : isAr 
                ? 'كل مهنة لها معاييرها الخاصة: مهارات مفتاحية، نصائح توظيف، وتنسيق ملائم.' 
                : 'Chaque métier a ses exigences : compétences indispensables, conseils de recruteurs et mise en page optimisée.'}
            </p>
          </div>

          <Link
            to="/cv-metiers"
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:underline flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <span>{isEn ? 'Browse 36 professions' : isAr ? 'استكشف كافة المهن (36)' : 'Voir les 36 métiers'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleJobCards.map((job) => {
            const secInfo = SECTEUR_LABELS[job.secteur] || SECTEUR_LABELS.autre;
            return (
              <div
                key={job.slug}
                className="relative min-h-[320px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/80 dark:border-neutral-800 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Background Image of the job */}
                <img
                  src={job.imageUrl || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'}
                  alt={`Profession ${job.metier}`}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark gradient overlay for perfect readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/35" />

                {/* Content written on top of the image */}
                <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 text-slate-200 backdrop-blur-md border border-white/10 shadow-xs">
                        <span>{secInfo.icon}</span>
                        <span>{secInfo.fr}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white group-hover:text-blue-300 transition-colors drop-shadow-sm leading-snug">
                      CV {job.metier}
                    </h3>

                    <p className="text-xs text-slate-200 mt-2 line-clamp-2 leading-relaxed font-normal drop-shadow-xs">
                      {job.accroche}
                    </p>

                    {/* Top skills pills */}
                    <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap gap-1.5">
                      {job.competencesCles.slice(0, 3).map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/15 text-white backdrop-blur-sm text-[11px] font-medium truncate max-w-[200px] border border-white/10"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
                    <Link
                      to={`/${job.slug}`}
                      className="w-full py-2.5 px-4 text-center rounded-xl bg-white text-black text-xs font-black hover:bg-neutral-100 transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Consulter ce modèle de CV</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!showAllJobCards && JOB_LANDING_PAGES.length > 6 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllJobCards(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>{isEn ? 'Voir plus' : isAr ? 'عرض المزيد' : 'Voir plus'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {showAllJobCards && JOB_LANDING_PAGES.length > 6 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllJobCards(false)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>{isEn ? 'Afficher moins' : isAr ? 'إظهار أقل' : 'Afficher moins'}</span>
            </button>
          </div>
        )}
      </section>

      {/* FOUR PILLARS OF CRAFT & QUALITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? 'DESIGN & PRECISION' : isAr ? 'دقة التصميم' : 'EXIGENCE & MÉTHODE'}
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
            {content.pillarsTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
            {content.pillarsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.pillars.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NARRATIVE STEPS / THE JOURNEY */}
      <section className="bg-white dark:bg-[#0E131F] py-16 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isEn ? 'SIMPLE STEPS' : isAr ? 'خطوات ميسرة' : 'PARCOURS GUIDÉ'}
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {content.journeyTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {content.journeySub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.journeySteps.map((step, idx) => (
              <div 
                key={idx}
                className="relative bg-[#FAF9F6] dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    Étape {step.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHENTIC TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isEn ? 'TESTIMONIALS' : isAr ? 'شهادات المرشحين' : 'TÉMOIGNAGES'}
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {content.testimonialsTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {content.testimonialsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.testimonials.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic font-normal">
                  « {item.comment} »
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{item.role}</div>
                </div>
                <div className="text-[10px] text-slate-400">{item.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION: Clean, human cards for both light and dark modes */}
      {isPaymentActive() && (
        <section className="bg-white dark:bg-[#0E131F] py-16 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {content.pricingTag}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {content.pricingTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {content.pricingSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              
              {/* FORFAIT GRATUIT */}
              <div className="bg-[#FAF9F6] dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {content.freemiumBadge}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Freemium</h3>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">$0 USD</span>
                      <span className="text-xs text-slate-500 font-medium">(0 FCFA)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-normal leading-relaxed">
                      {content.freemiumDesc}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {content.freemiumFeatures.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onStartCreate}
                  className="mt-8 w-full py-3 px-4 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {content.freemiumBtn}
                </button>
              </div>

              {/* FORFAIT CLASSIQUE (1 MOIS) - Highlighted */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl p-7 border-2 border-blue-600 shadow-lg relative flex flex-col justify-between md:-translate-y-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  {content.classiquePop}
                </div>

                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {content.classiqueBadge}
                    </span>
                    <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                      {content.classiqueTitle}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                        {classiquePrice.primary}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        ({classiquePrice.secondary})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
                      {content.classiqueDesc}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    {content.classiqueFeatures.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenUpgradeModal || onBrowseTemplates}
                  className="mt-8 w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  {content.classiqueBtn(classiquePrice.primary)}
                </button>
              </div>

              {/* FORFAIT PREMIUM VIP (1 MOIS) */}
              <div className="bg-[#FAF9F6] dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {content.premiumBadge}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {content.premiumTitle}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">
                        {premiumPrice.primary}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        ({premiumPrice.secondary})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-normal leading-relaxed">
                      {content.premiumDesc}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    {content.premiumFeatures.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenUpgradeModal || onBrowseTemplates}
                  className="mt-8 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {content.premiumBtn(premiumPrice.primary)}
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* SECTION: FOIRE AUX QUESTIONS (FAQ) */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {content.faqTag}
          </span>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {content.faqTitle}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {content.faqSub}
          </p>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={`landing-faq-${idx}`} 
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION BANNER: Clean and motivating */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isEn ? 'Ready to present your best self?' : isAr ? 'هل أنت مستعد لتقديم أفضل ما لديك؟' : 'Prêt à valoriser vos compétences ?'}
            </h3>
            <p className="text-sm text-blue-100 max-w-xl font-normal leading-relaxed">
              {isEn 
                ? 'Join thousands of job seekers and professionals who landed interviews with our studio.'
                : isAr
                ? 'انضم إلى آلاف المرشحين الذين جهزوا ملفاتهم وحصلوا على فرص عمل مناسبة.'
                : 'Rejoignez les milliers de candidats qui ont transformé leur démarche avec nos modèles soignés.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateBlankCV || onStartCreate}
            className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
          >
            {isEn ? 'Start building now' : isAr ? 'ابدأ الآن' : 'Créer mon CV maintenant'}
          </button>
        </div>
      </section>

      {/* FOOTER: Dignified, accessible, clean typography */}
      <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" />
                <span className="font-bold text-base text-white tracking-tight">MonCVPro</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {content.footerDesc}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
                {content.footerCol1Title}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-normal">
                <li><button type="button" onClick={onStartCreate} className="hover:text-white transition-colors cursor-pointer">{isEn ? 'Resume Studio' : isAr ? 'استوديو السيرة' : 'Créateur de CV'}</button></li>
                <li><button type="button" onClick={onOpenLetterGenerator || onStartCreate} className="hover:text-white transition-colors cursor-pointer">{isEn ? 'Cover Letter Assistant' : isAr ? 'خطاب التقديم' : 'Lettre de Motivation'}</button></li>
                <li><button type="button" onClick={onOpenJobTargeting || onStartCreate} className="hover:text-white transition-colors cursor-pointer">{isEn ? 'Target an Offer' : isAr ? 'استهداف عرض عمل' : 'Cibler une offre'}</button></li>
                <li><button type="button" onClick={onOpenLinkedInGenerator || onStartCreate} className="hover:text-white transition-colors cursor-pointer">{isEn ? 'LinkedIn Optimizer' : isAr ? 'تحسين لينكد إن' : 'Optimiseur LinkedIn'}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
                {content.footerCol2Title}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-normal">
                <li><a href="#faq-section" className="hover:text-white transition-colors">{isEn ? 'FAQ' : isAr ? 'الأسئلة الشائعة' : 'Foire Aux Questions'}</a></li>
                <li><button type="button" onClick={onBrowseTemplates} className="hover:text-white transition-colors cursor-pointer">{isEn ? '70 Professional Models' : isAr ? '70 نموذجا احترافيا' : '70 Modèles de CV'}</button></li>
                <li><button type="button" onClick={onImportClick} className="hover:text-white transition-colors cursor-pointer">{isEn ? 'Import PDF / Word' : isAr ? 'استيراد PDF/Word' : 'Importation PDF / Word'}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5">
                {content.footerCol3Title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3 font-normal">
                {content.footerSecurity}
              </p>
              <div className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/80 text-[11px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEn ? '256-bit SSL Protected' : isAr ? 'حماية مشفرة 256-bit' : 'Paiements & Données chiffrés SSL'}</span>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>{content.footerCopy}</p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setLegalModalTab('cgu')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                {content.footerTerms}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModalTab('cgv')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                {content.footerCgv}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModalTab('privacy')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                {content.footerPrivacy}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModalTab('mentions')}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                {content.footerMentions}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal (CGU, CGV, Privacy & Mentions) */}
      <LegalModal
        isOpen={legalModalTab !== null}
        onClose={() => setLegalModalTab(null)}
        initialTab={legalModalTab || 'cgu'}
        langue={langue}
      />
    </div>
  );
};
