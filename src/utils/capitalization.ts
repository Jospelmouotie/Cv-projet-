// Utility to clean and auto-correct capitalization for proper nouns, companies, cities, projects, and text blocks

const PROPER_NOUNS_MAP: Record<string, string> = {
  // Companies & Brands
  google: 'Google',
  microsoft: 'Microsoft',
  amazon: 'Amazon',
  apple: 'Apple',
  facebook: 'Facebook',
  meta: 'Meta',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  gitlab: 'GitLab',
  twitter: 'Twitter',
  uber: 'Uber',
  airbnb: 'Airbnb',
  netflix: 'Netflix',
  spotify: 'Spotify',
  stripe: 'Stripe',
  oracle: 'Oracle',
  ibm: 'IBM',
  salesforce: 'Salesforce',
  adobe: 'Adobe',
  cisco: 'Cisco',
  intel: 'Intel',
  sap: 'SAP',
  samsung: 'Samsung',
  orange: 'Orange',
  mtn: 'MTN',
  moov: 'Moov',
  airtel: 'Airtel',
  totalenergies: 'TotalEnergies',
  total: 'Total',
  renault: 'Renault',
  peugeot: 'Peugeot',
  airbus: 'Airbus',
  bnp: 'BNP Paribas',
  societegenerale: 'Société Générale',
  capgemini: 'Capgemini',
  atos: 'Atos',
  soprasteria: 'Sopra Steria',
  wave: 'Wave',
  
  // Tech Stack & Languages
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  react: 'React.js',
  'react.js': 'React.js',
  reactjs: 'React.js',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  vue: 'Vue.js',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  node: 'Node.js',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  express: 'Express.js',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud Platform',
  sql: 'SQL',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  git: 'Git',
  graphql: 'GraphQL',
  rest: 'REST API',
  html: 'HTML5',
  css: 'CSS3',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  bootstrap: 'Bootstrap',
  figma: 'Figma',
  photoshop: 'Photoshop',
  jira: 'Jira',
  confluence: 'Confluence',
  
  // Cities
  paris: 'Paris',
  lyon: 'Lyon',
  marseille: 'Marseille',
  bordeaux: 'Bordeaux',
  toulouse: 'Toulouse',
  nantes: 'Nantes',
  lille: 'Lille',
  douala: 'Douala',
  yaounde: 'Yaoundé',
  abidjan: 'Abidjan',
  dakar: 'Dakar',
  casablanca: 'Casablanca',
  tunis: 'Tunis',
  alger: 'Alger',
  kinshasa: 'Kinshasa',
  brazzaville: 'Brazzaville',
  libreville: 'Libreville',
  lomé: 'Lomé',
  cotonou: 'Cotonou',
  bamako: 'Bamako',
  niamey: 'Niamey',
  ouagadougou: 'Ouagadougou',
  montreal: 'Montréal',
  quebec: 'Québec',
  brussels: 'Bruxelles',
  bruxelles: 'Bruxelles',
  geneve: 'Genève',
  geneva: 'Genève',
  london: 'Londres',
  londres: 'Londres',
  newyork: 'New York',
  'new york': 'New York'
};

/**
 * Capitalizes proper names, titles, companies, cities, and sentence starts automatically.
 * Supports strings, arrays, and complex objects safely.
 */
export function autoFixCapitalization<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    const strInput = input as string;
    if (!strInput.trim()) return input as unknown as T;
    
    // Don't modify hex codes, URLs, emails, dates or long IDs
    if (
      strInput.startsWith('#') ||
      strInput.startsWith('http://') ||
      strInput.startsWith('https://') ||
      strInput.includes('@') ||
      /^[0-9a-fA-F-]{8,}$/.test(strInput)
    ) {
      return input as unknown as T;
    }

    let cleaned = strInput;

    // Replace known brand/city/tech terms case-insensitively
    Object.keys(PROPER_NOUNS_MAP).forEach((key) => {
      const target = PROPER_NOUNS_MAP[key];
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      cleaned = cleaned.replace(regex, target);
    });

    // Capitalize sentence starts (after . ! ? or newline)
    cleaned = cleaned.replace(/(?:^|[.!?]\s+|\n+)([a-zà-ÿ])/g, (match) => {
      return match.toUpperCase();
    });

    return cleaned as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => autoFixCapitalization(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const result: any = {};
    const skipKeys = [
      'id', 'type', 'icon', 'url', 'email', 'phone', 'telephone',
      'couleurAccent', 'couleurAccentSecondaire', 'couleurTitreSection',
      'primaryColor', 'secondaryColor', 'headingColor', 'backgroundColor',
      'misAJourLe', 'creeLe', 'createdAt', 'updatedAt'
    ];

    for (const key of Object.keys(input as any)) {
      const val = (input as any)[key];
      if (skipKeys.includes(key)) {
        result[key] = val;
      } else {
        result[key] = autoFixCapitalization(val);
      }
    }
    return result as T;
  }

  return input;
}

/**
 * Formats a proper name or title (e.g., "jean dupont" -> "Jean Dupont").
 */
export function formatProperName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return '';
      const lower = word.toLowerCase();
      if (PROPER_NOUNS_MAP[lower]) return PROPER_NOUNS_MAP[lower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
