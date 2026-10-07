import { CVTemplate, FontOption } from '../types';

export const FONT_OPTIONS: FontOption[] = [
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', fontCss: 'font-family: Inter, sans-serif;' },
  { id: 'playfair', name: 'Playfair Display', family: '"Playfair Display", serif', fontCss: 'font-family: "Playfair Display", serif;' },
  { id: 'lora', name: 'Lora', family: '"Lora", serif', fontCss: 'font-family: "Lora", serif;' },
  { id: 'roboto', name: 'Roboto', family: '"Roboto", sans-serif', fontCss: 'font-family: "Roboto", sans-serif;' },
  { id: 'montserrat', name: 'Montserrat', family: '"Montserrat", sans-serif', fontCss: 'font-family: "Montserrat", sans-serif;' },
  { id: 'merriweather', name: 'Merriweather', family: '"Merriweather", serif', fontCss: 'font-family: "Merriweather", serif;' },
  { id: 'poppins', name: 'Poppins', family: '"Poppins", sans-serif', fontCss: 'font-family: "Poppins", sans-serif;' },
  { id: 'source-sans', name: 'Source Sans', family: '"Source Sans 3", sans-serif', fontCss: 'font-family: "Source Sans 3", sans-serif;' }
];

export const ACCENT_COLORS = [
  '#0F172A', '#2563EB', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#DC2626', '#EF4444', '#EC4899', '#14B8A6',
  '#F97316', '#84CC16', '#8B5CF6', '#475569', '#1D4ED8', '#0F766E', '#8B5E3C', '#7C2D12', '#3B82F6', '#E11D48'
];

const singleColumnTemplates: Array<Omit<CVTemplate, 'id' | 'layoutFamily' | 'name' | 'category' | 'description' | 'layoutType' | 'defaultAccent' | 'defaultSecondaryAccent' | 'defaultFont'>> & { id: string; name: string; category: CVTemplate['category']; description: CVTemplate['description']; layoutType: string; defaultAccent: string; defaultSecondaryAccent: string; defaultFont: string; }[] = [
  { id: 'sc-01-editorial', name: 'Editorial Minimal', category: 'professionnel', description: { fr: 'Modèle élégant, discret et très lisible.', en: 'Clean and elegant resume for modern professionals.', ar: 'نمط أنيق ومريح للقراءة.' }, layoutType: 'single-column-editorial', defaultAccent: '#0F172A', defaultSecondaryAccent: '#475569', defaultFont: 'inter' },
  { id: 'sc-02-luxe-gold', name: 'Luxe Gold', category: 'executif', description: { fr: 'CV premium avec accents dorés pour les postes de direction.', en: 'Executive look with gold accents and strong hierarchy.', ar: 'تصميم تنفيذي ذهبي للتقديم إلى مناصب القيادة.' }, layoutType: 'single-column-luxe', defaultAccent: '#B68D40', defaultSecondaryAccent: '#E2C88E', defaultFont: 'playfair' },
  { id: 'sc-03-emerald', name: 'Emerald Flow', category: 'moderne', description: { fr: 'Mise en page moderne aux tons verts.', en: 'Fresh modern resume with emerald tones.', ar: 'نمط حديث بألوان خضراء منعشة.' }, layoutType: 'single-column-emerald', defaultAccent: '#0F766E', defaultSecondaryAccent: '#34D399', defaultFont: 'poppins' },
  { id: 'sc-04-academic', name: 'Academic Serif', category: 'academique', description: { fr: 'Parfait pour les profils universitaires et chercheurs.', en: 'A classic academic layout for research and teaching profiles.', ar: 'نمط أكاديمي كلاسيكي للباحثين والمعلمين.' }, layoutType: 'single-column-academic', defaultAccent: '#1E293B', defaultSecondaryAccent: '#64748B', defaultFont: 'merriweather' },
  { id: 'sc-05-coral', name: 'Coral Pulse', category: 'creatif', description: { fr: 'Plus dynamique et visuel pour les profils créatifs.', en: 'Bold creative layout with warm coral tones.', ar: 'تصميم إبداعي دافئ مع لمسات برتقالية.' }, layoutType: 'single-column-coral', defaultAccent: '#F97316', defaultSecondaryAccent: '#FDBA74', defaultFont: 'montserrat' },
  { id: 'sc-06-tech', name: 'Tech Mono', category: 'technique', description: { fr: 'Design technique inspiré du coding et des dashboards.', en: 'Technical template inspired by code editors and dashboards.', ar: 'تصميم تقني مستوحى من واجهات البرمجة.' }, layoutType: 'single-column-tech', defaultAccent: '#0F172A', defaultSecondaryAccent: '#22C55E', defaultFont: 'source-sans' },
  { id: 'sc-07-noir', name: 'Noir Executive', category: 'executif', description: { fr: 'CV premium en noir, minimaliste et impactant.', en: 'Dark executive resume with outstanding contrast.', ar: 'تنسيق تنفيذي داكن يعطي حضورًا قويًا.' }, layoutType: 'single-column-noir', defaultAccent: '#111827', defaultSecondaryAccent: '#94A3B8', defaultFont: 'inter' },
  { id: 'sc-08-nordic', name: 'Nordic Pure', category: 'minimaliste', description: { fr: 'Calme, net et professionnel pour les candidatures sérieuses.', en: 'Minimal and serene template for methodical professionals.', ar: 'نمط هادئ وواضح للمحترفين المنظمين.' }, layoutType: 'single-column-nordic', defaultAccent: '#334155', defaultSecondaryAccent: '#CBD5E1', defaultFont: 'roboto' },
  { id: 'sc-09-indigo', name: 'Indigo Banner', category: 'professionnel', description: { fr: 'Mise en page structurée avec bandeau accentué.', en: 'Structured resume with a strong banner identity.', ar: 'تصميم منظم مع شريط لوني بارز.' }, layoutType: 'single-column-indigo', defaultAccent: '#4338CA', defaultSecondaryAccent: '#A5B4FC', defaultFont: 'poppins' },
  { id: 'sc-10-ocean', name: 'Ocean Wave', category: 'moderne', description: { fr: 'Ambiance marine douce et professionnelle.', en: 'Soft ocean palette for calm, modern profiles.', ar: 'ألوان بحرية هادئة ومتناسقة.' }, layoutType: 'single-column-ocean', defaultAccent: '#0369A1', defaultSecondaryAccent: '#67E8F9', defaultFont: 'inter' },
  { id: 'sc-11-bento', name: 'Bento Grid', category: 'technique', description: { fr: 'Structure en blocs pour un maximum de clarté.', en: 'Grid-based layout for a clean, precise presentation.', ar: 'هيكل شبكي يبرز الوضوح والروتين.' }, layoutType: 'single-column-bento', defaultAccent: '#0EA5E9', defaultSecondaryAccent: '#7DD3FC', defaultFont: 'source-sans' },
  { id: 'sc-12-arch', name: 'Arch Header', category: 'professionnel', description: { fr: 'En-tête arrondi et design architectural.', en: 'Rounded editorial look with an architectural header.', ar: 'رأس مميز بتصميم معماري أنيق.' }, layoutType: 'single-column-arch', defaultAccent: '#1F2937', defaultSecondaryAccent: '#60A5FA', defaultFont: 'lora' },
  { id: 'sc-13-editorial-serif', name: 'Editorial Serif', category: 'classique', description: { fr: 'Style éditorial plus classique avec serif.', en: 'Classic serif layout for a formal impression.', ar: 'تصميم كلاسكي بنمط تحريرية رسمي.' }, layoutType: 'single-column-editorial-serif', defaultAccent: '#374151', defaultSecondaryAccent: '#D6D3D1', defaultFont: 'merriweather' },
  { id: 'sc-14-compact-ats', name: 'ATS Compact', category: 'professionnel', description: { fr: 'Parfait pour les candidatures ATS et très lisibles.', en: 'ATS-friendly and highly readable compact layout.', ar: 'نمط مناسب لأنظمة ATS وسهل القراءة.' }, layoutType: 'single-column-ats', defaultAccent: '#1D4ED8', defaultSecondaryAccent: '#93C5FD', defaultFont: 'roboto' },
  { id: 'sc-15-metro', name: 'Metro Pills', category: 'moderne', description: { fr: 'Mise en page visuelle et électrisante.', en: 'Visual and dynamic layout with pill elements.', ar: 'تصميم مرئي ديناميكي مع عناصر مستديرة.' }, layoutType: 'single-column-metro', defaultAccent: '#0F766E', defaultSecondaryAccent: '#A7F3D0', defaultFont: 'poppins' },
  { id: 'sc-16-burgundy', name: 'Burgundy Line', category: 'executif', description: { fr: 'Tonalités profondes et contenues.', en: 'Refined and striking burgundy-led design.', ar: 'تدرجات عميقة وراقية في اللون البورغندي.' }, layoutType: 'single-column-burgundy', defaultAccent: '#7F1D1D', defaultSecondaryAccent: '#FCA5A5', defaultFont: 'lora' },
  { id: 'sc-17-cyan', name: 'Cyan Minimal', category: 'minimaliste', description: { fr: 'Minimaliste, lumineux et facile à scanner.', en: 'Very light and airy template with cyan details.', ar: 'نمط خفيف ومشرق مع لمسات سماوية.' }, layoutType: 'single-column-cyan', defaultAccent: '#0891B2', defaultSecondaryAccent: '#A5F3FC', defaultFont: 'inter' },
  { id: 'sc-18-gold-ring', name: 'Gold Ring', category: 'luxury', description: { fr: 'Un CV premium avec un cadre métallique très élégant.', en: 'Luxury styling with elegant metallic framing.', ar: 'تصميم فاخر بإطار ذهبي أنيق.' }, layoutType: 'single-column-gold-ring', defaultAccent: '#B45309', defaultSecondaryAccent: '#FDE68A', defaultFont: 'playfair' },
  { id: 'sc-19-sylvie', name: 'Sylvie Wave', category: 'creative', description: { fr: 'Style narratif avec forme organique et superbe lisibilité.', en: 'Organic wave layout for creative professionals.', ar: 'أسلوب إبداعي مع أشكال مائية ناعمة.' }, layoutType: 'single-column-sylvie', defaultAccent: '#7C3AED', defaultSecondaryAccent: '#C4B5FD', defaultFont: 'poppins' },
  { id: 'sc-20-baxter', name: 'Baxter Diagonal', category: 'professionnel', description: { fr: 'Hauteur visuelle et traits structurants.', en: 'Diagonal rhythm and a strong visual structure.', ar: 'هيكل بصري متوازن مع خطوط مائلة.' }, layoutType: 'single-column-baxter', defaultAccent: '#312E81', defaultSecondaryAccent: '#FBBF24', defaultFont: 'montserrat' },
  { id: 'sc-21-glass', name: 'Glass Panel', category: 'moderne', description: { fr: 'Effet verre et sobriété premium.', en: 'Glassmorphism-inspired resume with premium feel.', ar: 'تصميم زجاجي أنيق ومميز.' }, layoutType: 'single-column-glass', defaultAccent: '#1D4ED8', defaultSecondaryAccent: '#BFDBFE', defaultFont: 'inter' },
  { id: 'sc-22-sage', name: 'Sage Precision', category: 'minimaliste', description: { fr: 'Palette douce et propre pour un style minimaliste.', en: 'Soft sage color palette with a neat layout.', ar: 'ألوان زيتونية هادئة مع تصميم منظم.' }, layoutType: 'single-column-sage', defaultAccent: '#4D7C0F', defaultSecondaryAccent: '#A3E635', defaultFont: 'source-sans' },
  { id: 'sc-23-royal', name: 'Royal Blue', category: 'executif', description: { fr: 'Confiance et présence pour les profils hiérarchiques.', en: 'High-trust royal blue resume for leadership profiles.', ar: 'تصميم موثوق بألوان زرقاء ملكية.' }, layoutType: 'single-column-royal', defaultAccent: '#1E3A8A', defaultSecondaryAccent: '#93C5FD', defaultFont: 'montserrat' },
  { id: 'sc-24-sunset', name: 'Sunset Ribbon', category: 'creatif', description: { fr: 'Ambiance chaude et mémorable.', en: 'Warm and memorable creative resume style.', ar: 'أسلوب دافئ لا يُنسى.' }, layoutType: 'single-column-sunset', defaultAccent: '#F97316', defaultSecondaryAccent: '#FDE68A', defaultFont: 'lora' },
  { id: 'sc-25-garden', name: 'Garden Soft', category: 'moderne', description: { fr: 'Clarté, douceur et naturel dans un format efficace.', en: 'Natural and polished modern template with soft tones.', ar: 'تصميم عصري هادئ مع لمسات طبيعية.' }, layoutType: 'single-column-garden', defaultAccent: '#15803D', defaultSecondaryAccent: '#86EFAC', defaultFont: 'inter' },
  { id: 'sc-26-midnight', name: 'Midnight Heist', category: 'professionnel', description: { fr: 'Design noir profond pour un impact fort en ligne.', en: 'Deep midnight styling for high-contrast presentation.', ar: 'تصميم داكن قوي يبرز حضورك.' }, layoutType: 'single-column-midnight', defaultAccent: '#111827', defaultSecondaryAccent: '#38BDF8', defaultFont: 'roboto' },
  { id: 'sc-27-ivory', name: 'Ivory Edge', category: 'classique', description: { fr: 'CV classe et délicat sur fond neutre.', en: 'Polished ivory template with subtle structure.', ar: 'تصميم كلاسكي أبيض دافئ ودقيق.' }, layoutType: 'single-column-ivory', defaultAccent: '#4B5563', defaultSecondaryAccent: '#D1D5DB', defaultFont: 'merriweather' },
  { id: 'sc-28-fresh', name: 'Fresh Slate', category: 'professionnel', description: { fr: 'Très lisible et moderne pour tous types de postes.', en: 'Readable, contemporary and adaptable to multiple sectors.', ar: 'نمط عصري سهل القراءة ومناسب للوظائف المتنوعة.' }, layoutType: 'single-column-fresh', defaultAccent: '#334155', defaultSecondaryAccent: '#94A3B8', defaultFont: 'source-sans' },
  { id: 'sc-29-pastel', name: 'Pastel Studio', category: 'creatif', description: { fr: 'Couleurs douces et structure harmonieuse.', en: 'Pastel accents with comfortable spacing and balance.', ar: 'ألوان ناعمة مع تنسيق متوازن.' }, layoutType: 'single-column-pastel', defaultAccent: '#A21CAF', defaultSecondaryAccent: '#F9A8D4', defaultFont: 'poppins' },
  { id: 'sc-30-trust', name: 'Trust Ledger', category: 'executif', description: { fr: 'Style sérieux, structuré pour les fonctions de responsabilité.', en: 'Responsible and structured with highly trustworthy tone.', ar: 'أسلوب جاد ومنظم للمسؤوليات الكبرى.' }, layoutType: 'single-column-trust', defaultAccent: '#0F172A', defaultSecondaryAccent: '#A78BFA', defaultFont: 'inter' },
  { id: 'sc-31-sunlit', name: 'Sunlit Grid', category: 'professionnel', description: { fr: 'Luminosité douce et structure claire.', en: 'Bright and tidy structure with gentle warmth.', ar: 'إضاءة ناعمة وبنية واضحة.' }, layoutType: 'single-column-sunlit', defaultAccent: '#F59E0B', defaultSecondaryAccent: '#FDE68A', defaultFont: 'inter' },
  { id: 'sc-32-atelier-slate', name: 'Atelier Slate', category: 'moderne', description: { fr: 'Matérialité légère avec un rendu premium.', en: 'Clean premium material feel with refined balance.', ar: 'مظهر فاخر مع توازن أنيق.' }, layoutType: 'single-column-atelier-slate', defaultAccent: '#475569', defaultSecondaryAccent: '#E2E8F0', defaultFont: 'source-sans' },
  { id: 'sc-33-verdant', name: 'Verdant Flow', category: 'minimaliste', description: { fr: 'Palette verte très naturelle et apaisante.', en: 'A calm green aesthetic with excellent readability.', ar: 'ألوان خضراء هادئة وسهلة القراءة.' }, layoutType: 'single-column-verdant', defaultAccent: '#15803D', defaultSecondaryAccent: '#A7F3D0', defaultFont: 'roboto' },
  { id: 'sc-34-pixel-work', name: 'Pixel Work', category: 'technique', description: { fr: 'Design technique orienté données et précision.', en: 'Data-driven technical layout with strong precision.', ar: 'تصميم تقني دقيق وموجه للبيانات.' }, layoutType: 'single-column-pixel-work', defaultAccent: '#1D4ED8', defaultSecondaryAccent: '#93C5FD', defaultFont: 'source-sans' },
  { id: 'sc-35-lotus', name: 'Lotus Card', category: 'creatif', description: { fr: 'Un profil créatif entre douceur et présence.', en: 'Refined creative layout with soft visual motion.', ar: 'نمط إبداعي دقيق مع حركة بصرية ناعمة.' }, layoutType: 'single-column-lotus', defaultAccent: '#BE185D', defaultSecondaryAccent: '#FBCFE8', defaultFont: 'poppins' }
];

const twoColumnTemplates: Array<Omit<CVTemplate, 'id' | 'layoutFamily' | 'name' | 'category' | 'description' | 'layoutType' | 'defaultAccent' | 'defaultSecondaryAccent' | 'defaultFont'>> & { id: string; name: string; category: CVTemplate['category']; description: CVTemplate['description']; layoutType: string; defaultAccent: string; defaultSecondaryAccent: string; defaultFont: string; }[] = [
  { id: 'tc-01-corporate', name: 'Corporate Split', category: 'professionnel', description: { fr: 'Version 2 colonnes idéale pour un profil solide et complet.', en: 'Classic split layout for comprehensive profiles.', ar: 'تنسيق ثنائي الأعمدة مناسب للملفات الكاملة.' }, layoutType: 'two-column-corporate', defaultAccent: '#1D4ED8', defaultSecondaryAccent: '#93C5FD', defaultFont: 'inter' },
  { id: 'tc-02-slate', name: 'Slate Profile', category: 'moderne', description: { fr: 'Sidebar de qualité et lisibilité maximale.', en: 'Strong sidebar presence with a modern tone.', ar: 'شريط جانبي قوي مع رؤية ممتازة.' }, layoutType: 'two-column-slate', defaultAccent: '#334155', defaultSecondaryAccent: '#E2E8F0', defaultFont: 'source-sans' },
  { id: 'tc-03-amber', name: 'Amber Executive', category: 'executif', description: { fr: 'Un style très professionnel, inspiré du corporate premium.', en: 'Premium executive split with warm accents.', ar: 'تنسيق تنفيذي فاخر مع لمسات دافئة.' }, layoutType: 'two-column-amber', defaultAccent: '#B45309', defaultSecondaryAccent: '#FCD34D', defaultFont: 'lora' },
  { id: 'tc-04-azure', name: 'Azure Deck', category: 'technique', description: { fr: 'Parfait pour les profils techniques et analytiques.', en: 'Analytical and technical layout with a blue identity.', ar: 'تنسيق تقني وتحليلي بزرق واضح.' }, layoutType: 'two-column-azure', defaultAccent: '#0EA5E9', defaultSecondaryAccent: '#BAE6FD', defaultFont: 'roboto' },
  { id: 'tc-05-forest', name: 'Forest Signal', category: 'minimaliste', description: { fr: 'Palette verte et structurée pour les profils de gestion.', en: 'Balanced green theme for managed and reliable profiles.', ar: 'ألوان خضراء متوازنة ومناسبة للملفات الإدارية.' }, layoutType: 'two-column-forest', defaultAccent: '#166534', defaultSecondaryAccent: '#86EFAC', defaultFont: 'inter' },
  { id: 'tc-06-ruby', name: 'Ruby Frame', category: 'creatif', description: { fr: 'Mise en page expressive avec accents rouges.', en: 'Creative and expressive split with ruby tones.', ar: 'تنسيق إبداعي مع لمسات حمراء قوية.' }, layoutType: 'two-column-ruby', defaultAccent: '#BE123C', defaultSecondaryAccent: '#FBCFE8', defaultFont: 'poppins' },
  { id: 'tc-07-graphite', name: 'Graphite Edge', category: 'professionnel', description: { fr: 'Classe et discret pour les postes de responsabilité.', en: 'Professional and understated design for senior roles.', ar: 'تصميم هادئ واحترافي للمسؤوليات العليا.' }, layoutType: 'two-column-graphite', defaultAccent: '#374151', defaultSecondaryAccent: '#D1D5DB', defaultFont: 'inter' },
  { id: 'tc-08-rose', name: 'Rose Atelier', category: 'creatif', description: { fr: 'Style créatif léger avec charme et personnalité.', en: 'Warm and feminine layout with light modern personality.', ar: 'تصميم أنثوي وجذاب مع تفاصيل بيضاء دافئة.' }, layoutType: 'two-column-rose', defaultAccent: '#C026D3', defaultSecondaryAccent: '#F5D0FE', defaultFont: 'montserrat' },
  { id: 'tc-09-sky', name: 'Sky Matrix', category: 'technique', description: { fr: 'Très lisible et orienté compétences.', en: 'Skill-focused matrix with a clear professional rhythm.', ar: 'هيكل مهاراتي سريع ومباشر.' }, layoutType: 'two-column-sky', defaultAccent: '#0284C7', defaultSecondaryAccent: '#BAE6FD', defaultFont: 'roboto' },
  { id: 'tc-10-maison', name: 'Maison Classic', category: 'classique', description: { fr: 'Un rendu classique et rassurant.', en: 'Classic comfort for formal, stable profiles.', ar: 'تصميم كلاسيكي مريح وموثوق.' }, layoutType: 'two-column-maison', defaultAccent: '#B45309', defaultSecondaryAccent: '#FDE68A', defaultFont: 'lora' },
  { id: 'tc-11-onyx', name: 'Onyx Contrast', category: 'executif', description: { fr: 'Un design très fort pour les profils de direction.', en: 'High contrast black design for leadership roles.', ar: 'تصميم أسود قوي للقيادة.' }, layoutType: 'two-column-onyx', defaultAccent: '#111827', defaultSecondaryAccent: '#9CA3AF', defaultFont: 'inter' },
  { id: 'tc-12-cobalt', name: 'Cobalt Link', category: 'professionnel', description: { fr: 'Mise en page particulièrement lisible pour les réseaux.', en: 'Readable and practical for business and network-oriented roles.', ar: 'تصميم عملي وسهل القراءة للمسؤوليات المهنية.' }, layoutType: 'two-column-cobalt', defaultAccent: '#1D4ED8', defaultSecondaryAccent: '#BFDBFE', defaultFont: 'poppins' },
  { id: 'tc-13-sage', name: 'Sage Matrix', category: 'professionnel', description: { fr: 'Palette douce et structure nette pour les profils bien organisés.', en: 'Soft sage for well-structured and balanced profiles.', ar: 'ألوان خصبة مع تنظيم واضح.' }, layoutType: 'two-column-sage-matrix', defaultAccent: '#4D7C0F', defaultSecondaryAccent: '#BEF264', defaultFont: 'source-sans' },
  { id: 'tc-14-ivory-grid', name: 'Ivory Grid', category: 'classique', description: { fr: 'Approche claire et élégante sur fond neutre.', en: 'Classic neutral grid with a polished finish.', ar: 'تصميم كلاسيكي محايد مع لمسة نهائية أنيقة.' }, layoutType: 'two-column-ivory-grid', defaultAccent: '#475569', defaultSecondaryAccent: '#E2E8F0', defaultFont: 'merriweather' },
  { id: 'tc-15-lunar', name: 'Lunar Form', category: 'creatif', description: { fr: 'Modèle créatif avec personnalité affirmée.', en: 'Creative structure with a luminous personality.', ar: 'تصميم إبداعي يلعب على الإضاءة والألوان.' }, layoutType: 'two-column-lunar', defaultAccent: '#7C3AED', defaultSecondaryAccent: '#DDD6FE', defaultFont: 'montserrat' },
  { id: 'tc-16-mint', name: 'Mint Signal', category: 'moderne', description: { fr: 'Tonalités fraîches et ponctuées de dynamisme.', en: 'Fresh mint profile with smooth modern rhythm.', ar: 'ألوان منعشة مع إيقاع عصري سلس.' }, layoutType: 'two-column-mint', defaultAccent: '#10B981', defaultSecondaryAccent: '#A7F3D0', defaultFont: 'inter' },
  { id: 'tc-17-sand', name: 'Sand Confidence', category: 'executif', description: { fr: 'Ambiance de confiance et de stabilité.', en: 'Warm reassuring tone for leadership and consultants.', ar: 'أسلوب واثق ودافئ للمستشارين والقيادة.' }, layoutType: 'two-column-sand', defaultAccent: '#A16207', defaultSecondaryAccent: '#FDE68A', defaultFont: 'lora' },
  { id: 'tc-18-terracotta', name: 'Terracotta System', category: 'professionnel', description: { fr: 'Profil chaud, structuré et très visible.', en: 'Warm terracotta profile with high readability.', ar: 'تصميم دافئ وسهل القراءة.' }, layoutType: 'two-column-terracotta', defaultAccent: '#C2410C', defaultSecondaryAccent: '#FDBA74', defaultFont: 'roboto' },
  { id: 'tc-19-ice', name: 'Ice Horizon', category: 'moderne', description: { fr: 'Palette claire et très aérienne.', en: 'Airy resume with cool lights and open space.', ar: 'تصميم ناعم ومشرق مع مساحات واسعة.' }, layoutType: 'two-column-ice', defaultAccent: '#0284C7', defaultSecondaryAccent: '#E0F2FE', defaultFont: 'source-sans' },
  { id: 'tc-20-bandeau', name: 'Bandeau Accent', category: 'professionnel', description: { fr: 'Cadre de contenu avec accent fort sur l’en-tête.', en: 'Strong header accent for a decisive identity.', ar: 'رأس بارز مع هوية واضحة.' }, layoutType: 'two-column-bandeau', defaultAccent: '#7C2D12', defaultSecondaryAccent: '#FDBA74', defaultFont: 'poppins' },
  { id: 'tc-21-aqua', name: 'Aqua Pulse', category: 'technique', description: { fr: 'Courbes et structuration pour mettre en valeur les compétences.', en: 'Skill-driven layout with fluid aqua accents.', ar: 'تنسيق تقني مع ألوان مائية ناعمة.' }, layoutType: 'two-column-aqua', defaultAccent: '#0EA5A4', defaultSecondaryAccent: '#99F6E4', defaultFont: 'inter' },
  { id: 'tc-22-dune', name: 'Dune Classic', category: 'classique', description: { fr: 'Modèle classique, équilibré et rassurant.', en: 'Balanced classic resume with natural warmth.', ar: 'تصميم كلاسيكي متوازن ودافئ.' }, layoutType: 'two-column-dune', defaultAccent: '#A16207', defaultSecondaryAccent: '#FDE68A', defaultFont: 'merriweather' },
  { id: 'tc-23-lilac', name: 'Lilac Block', category: 'creative', description: { fr: 'Mise en page douce et originale.', en: 'Original and soft layout with lilac personality.', ar: 'تصميم لطيف ومميز بالألوان البنفسجية.' }, layoutType: 'two-column-lilac', defaultAccent: '#7C3AED', defaultSecondaryAccent: '#DDD6FE', defaultFont: 'montserrat' },
  { id: 'tc-24-signal', name: 'Signal Grid', category: 'moderne', description: { fr: 'Blocs solides pour le storytelling professionnel.', en: 'Modern grid with decisive blocks and excellent readability.', ar: 'شبكة حديثة مع كتل واضحة وسهلة القراءة.' }, layoutType: 'two-column-signal', defaultAccent: '#2563EB', defaultSecondaryAccent: '#BFDBFE', defaultFont: 'inter' },
  { id: 'tc-25-petal', name: 'Petal Canvas', category: 'creatif', description: { fr: 'Calme, original et très esthétique.', en: 'Fresh creative canvas with a soft visual rhythm.', ar: 'قماش إبداعي ناعم وجذاب.' }, layoutType: 'two-column-petal', defaultAccent: '#EC4899', defaultSecondaryAccent: '#FBCFE8', defaultFont: 'poppins' },
  { id: 'tc-26-atelier', name: 'Atelier Noir', category: 'professionnel', description: { fr: 'Style chic et intelligent pour les profils premium.', en: 'Premium black-and-white styling for contemporary profiles.', ar: 'أسلوب فاخر باللون الأسود والأبيض.' }, layoutType: 'two-column-atelier', defaultAccent: '#111827', defaultSecondaryAccent: '#E5E7EB', defaultFont: 'lora' },
  { id: 'tc-27-ripple', name: 'Ripple Commerce', category: 'commercial', description: { fr: 'Idéal pour les profils orientés ventes et commerce.', en: 'Effective for sales, commerce and customer-facing roles.', ar: 'مناسب للمسؤوليات التجارية والتسويقية.' }, layoutType: 'two-column-ripple', defaultAccent: '#F59E0B', defaultSecondaryAccent: '#FDE68A', defaultFont: 'roboto' },
  { id: 'tc-28-spring', name: 'Spring Edge', category: 'moderne', description: { fr: 'Palette vivante, claire et équilibrée.', en: 'Fresh and vibrant modern styling with positive energy.', ar: 'ألوان منعشة وطاقة إيجابية.' }, layoutType: 'two-column-spring', defaultAccent: '#10B981', defaultSecondaryAccent: '#BBF7D0', defaultFont: 'inter' },
  { id: 'tc-29-studio', name: 'Studio Board', category: 'professionnel', description: { fr: 'Très utile pour les profils polyvalents.', en: 'Versatile studio template for multi-role profiles.', ar: 'تصميم متعدد الاستخدامات للملفات المتنوعة.' }, layoutType: 'two-column-studio', defaultAccent: '#0F172A', defaultSecondaryAccent: '#A5B4FC', defaultFont: 'montserrat' },
  { id: 'tc-30-nova', name: 'Nova Split', category: 'executif', description: { fr: 'La version 2 colonnes la plus premium et résolue.', en: 'High-end split version for decisive and senior profiles.', ar: 'نسخة ثنائية الأعمدة فاخرة ومتماسكة.' }, layoutType: 'two-column-nova', defaultAccent: '#312E81', defaultSecondaryAccent: '#C4B5FD', defaultFont: 'playfair' },
  { id: 'tc-31-cascade', name: 'Cascade Studio', category: 'professionnel', description: { fr: 'Structure bâtie sur des blocs de contenu très lisibles.', en: 'Balanced content blocks for a polished business profile.', ar: 'هيكل متوازن مع كتل محتوى واضحة.' }, layoutType: 'two-column-cascade', defaultAccent: '#1D4ED8', defaultSecondaryAccent: '#BFDBFE', defaultFont: 'inter' },
  { id: 'tc-32-orbit', name: 'Orbit Co', category: 'technique', description: { fr: 'Un design moderne inspiré des dashboards métier.', en: 'Dashboard-inspired format for modern technical roles.', ar: 'تنسيق حديث مستوحى من لوحات التحكم.' }, layoutType: 'two-column-orbit', defaultAccent: '#0EA5E9', defaultSecondaryAccent: '#A5F3FC', defaultFont: 'roboto' },
  { id: 'tc-33-bordeaux', name: 'Bordeaux Tension', category: 'executif', description: { fr: 'Une présence plus affirmée pour les profils seniors.', en: 'Strong premium tone for senior and leadership backgrounds.', ar: 'هوية قوية للمسؤوليات الراقية.' }, layoutType: 'two-column-bordeaux', defaultAccent: '#7F1D1D', defaultSecondaryAccent: '#FCA5A5', defaultFont: 'playfair' },
  { id: 'tc-34-voyage', name: 'Voyage Minimal', category: 'moderne', description: { fr: 'Minimaliste, ouvert et très lisible.', en: 'Open and airy minimalist layout for modern hiring.', ar: 'تنسيق مفتوح وهادئ للوظائف الحديثة.' }, layoutType: 'two-column-voyage', defaultAccent: '#334155', defaultSecondaryAccent: '#CBD5E1', defaultFont: 'lora' },
  { id: 'tc-35-solar', name: 'Solar Frame', category: 'creatif', description: { fr: 'Énergie chaude et design visuel impactant.', en: 'Warm energy and memorable visual framing.', ar: 'ألوان دافئة وتصميم بصري واضح.' }, layoutType: 'two-column-solar', defaultAccent: '#EA580C', defaultSecondaryAccent: '#FDBA74', defaultFont: 'montserrat' }
];

const templates = [
  ...singleColumnTemplates.map((template) => ({ ...template, layoutFamily: 'single-column' as const })),
  ...twoColumnTemplates.map((template) => ({ ...template, layoutFamily: 'two-column-left' as const }))
];

const headerStyles = [
  'banner', 'clean', 'card', 'arch', 'modern-split', 'minimal', 'luxury-gold', 'ocean-wave',
  'diagonal-split', 'organic-arch', 'sidebar-top', 'tech-arches', 'arc-contour', 'sylvie-wave',
  'baxter-diagonal', 'two-tone-split', 'two-tone-stripe', 'wave-bottom', 'wave-top', 'wave-double',
  'curved-wave-badge', 'simple-minimal'
] as const;

const sectionHeaderStyles = [
  'underline', 'pill', 'banner', 'left-border', 'boxed', 'stars', 'double-line', 'arch-block', 'badge-header', 'badge-line', 'icon-inline', 'minimal'
] as const;

const skillsDisplayModes = [
  'badges', 'grid', 'progress', 'tags', 'tech-cards', 'cards-modern', 'pill-bars', 'matrix-cards', 'compact-chips',
  'minimal-cards', 'executive-tags', 'categorized-pills', 'stepped-levels', 'grid-3', 'stripped-table', 'dots'
] as const;

const photoFrameStyles = [
  'ronde', 'carree', 'arrondie', 'hexagone', 'arche', 'galet', 'cameo', 'losange', 'carree-doree', 'passe-partout'
] as const;

const timelineStyles = ['none', 'line-dots', 'accent-pills', 'left-bar'] as const;

const waveStyles = ['wave-smooth', 'wave-double', 'diagonal', 'arch-dome', 'hex-grid', 'minimal-stripes', 'blob', 'curved'] as const;

const footerStyles = [
  'banner-solid', 'cards-grid', 'minimal-inline', 'pill-floating', 'modern-split', 'dark-tech', 'classic-divider', 'executive-signature', 'soft-pills', 'architect-metric'
] as const;

const decorativeWaveTemplateIds = new Set(
  templates.slice(0, 10).map((template) => template.id)
);

export const canUseDecorativeWave = (templateId?: string) => (
  Boolean(templateId) && decorativeWaveTemplateIds.has(templateId as string)
);

const getDesignVariant = (index: number, layoutFamily: string) => {
  const isSingleColumn = layoutFamily === 'single-column';
  const base = index % headerStyles.length;
  const photoIndex = index % photoFrameStyles.length;
  const timelineIndex = index % timelineStyles.length;
  const footerIndex = index % footerStyles.length;
  const sectionIndex = (index * 2 + 1) % sectionHeaderStyles.length;
  const skillIndex = (index * 3 + (isSingleColumn ? 1 : 5)) % skillsDisplayModes.length;

  return {
    headerStyle: headerStyles[base],
    sectionHeaderStyle: sectionHeaderStyles[sectionIndex],
    skillsDisplayMode: skillsDisplayModes[skillIndex],
    photoPosition: isSingleColumn ? (index % 3 === 0 ? 'in-sidebar' : 'in-header') : 'in-sidebar',
    photoFrameStyle: photoFrameStyles[photoIndex],
    timelineStyle: timelineStyles[timelineIndex],
    typeVague: index < 10 ? waveStyles[index % waveStyles.length] : undefined,
    footerStyle: footerStyles[footerIndex],
    footerBackgroundColor: ['#0F172A', '#E2E8F0', '#F8FAFC', '#111827'][index % 4],
    footerTextColor: index % 2 === 0 ? '#FFFFFF' : '#0F172A',
    sidebarBackgroundColor: layoutFamily === 'single-column' ? '#FFFFFF' : '#F8FAFC'
  };
};

const BUILT_IN_TEMPLATES: CVTemplate[] = templates.map((template, index) => {
  const design = getDesignVariant(index, template.layoutFamily);

  return {
    id: template.id,
    name: `N° ${String(index + 1).padStart(2, '0')} — ${template.name}`,
    category: template.category,
    description: template.description,
    layoutType: template.layoutType,
    layoutFamily: template.layoutFamily,
    defaultAccent: template.defaultAccent,
    defaultSecondaryAccent: template.defaultSecondaryAccent,
    defaultFont: template.defaultFont,
    supportsSecondaryAccent: true,
    badgeText: template.layoutFamily === 'single-column' ? '1 colonne' : '2 colonnes',
    previewImage: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80`,
    preview: template.layoutFamily === 'single-column' ? 'single' : 'double',
    themeConfig: {
      headerStyle: design.headerStyle,
      sectionHeaderStyle: design.sectionHeaderStyle,
      skillsDisplayMode: design.skillsDisplayMode,
      sidebarBackgroundColor: design.sidebarBackgroundColor,
      photoPosition: design.photoPosition,
      photoFrameStyle: design.photoFrameStyle,
      timelineStyle: design.timelineStyle,
      typeVague: design.typeVague,
      footerStyle: design.footerStyle,
      footerBackgroundColor: design.footerBackgroundColor,
      footerTextColor: design.footerTextColor,
      backgroundPattern: ['grid', 'waves', 'dots', 'stripes'][index % 4]
    }
  };
});

export const CUSTOM_MODEL_STORAGE_KEY = 'admin_custom_templates';

export function readAdminCustomTemplates(): CVTemplate[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(CUSTOM_MODEL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => ({
      id: item.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: item.name || 'Modèle personnalisé',
      category: item.category || 'professionnel',
      description: item.description || { fr: 'Modèle personnalisé créé par l\'admin.', en: 'Admin-created custom template.' },
      layoutType: item.layoutType || 'single-column-custom',
      layoutFamily: item.layoutFamily || 'single-column',
      defaultAccent: item.defaultAccent || '#0F172A',
      defaultSecondaryAccent: item.defaultSecondaryAccent || '#E2E8F0',
      defaultFont: item.defaultFont || 'inter',
      badgeText: 'Admin',
      previewImage: item.previewImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      preview: item.preview || 'single',
      requiredTier: 'freemium',
      themeConfig: {
        headerStyle: item.themeConfig?.headerStyle || 'clean',
        sectionHeaderStyle: item.themeConfig?.sectionHeaderStyle || 'underline',
        skillsDisplayMode: item.themeConfig?.skillsDisplayMode || 'badges',
        sidebarBackgroundColor: item.themeConfig?.sidebarBackgroundColor || '#F8FAFC',
        photoPosition: item.themeConfig?.photoPosition || 'in-header',
        photoFrameStyle: item.themeConfig?.photoFrameStyle || 'ronde',
        timelineStyle: item.themeConfig?.timelineStyle || 'none',
        typeVague: undefined,
        footerStyle: item.themeConfig?.footerStyle || 'minimal-inline',
        footerBackgroundColor: item.themeConfig?.footerBackgroundColor || '#0F172A',
        footerTextColor: item.themeConfig?.footerTextColor || '#FFFFFF',
        backgroundPattern: item.themeConfig?.backgroundPattern || 'dots'
      }
    }));
  } catch {
    return [];
  }
}

// Fetch admin templates from backend API and sync to localStorage
export async function fetchAdminTemplatesFromBackend(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('cv_builder_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/admin/templates', { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.templates)) {
        localStorage.setItem(CUSTOM_MODEL_STORAGE_KEY, JSON.stringify(data.templates));
        // Reload the page to refresh templates
        window.location.reload();
      }
    }
  } catch (e) {
    console.warn('Failed to fetch admin templates from backend:', e);
  }
}

export function syncAdminCustomTemplates(customTemplates: CVTemplate[]): CVTemplate[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_MODEL_STORAGE_KEY, JSON.stringify(customTemplates));
  }

  CV_TEMPLATES.length = 0;
  CV_TEMPLATES.push(...BUILT_IN_TEMPLATES, ...customTemplates);
  return [...CV_TEMPLATES];
}

export const CV_TEMPLATES: CVTemplate[] = [...BUILT_IN_TEMPLATES, ...readAdminCustomTemplates()];
