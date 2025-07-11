// Natural Language Processing utility for AI Lead Scout search
// Extracts key terms from natural language queries

// Common job titles and their variations
const JOB_TITLE_PATTERNS = {
  'software engineer': [
    'software engineer', 'software engineers', 'software developer', 'software developers', 'developer', 'developers', 'dev', 'devs', 'programmer', 'programmers', 'coder', 'coders', 'full stack', 'frontend', 'backend', 'web developer', 'web developers', 'engineer', 'engineers'
  ],
  'manager': [
    'manager', 'managers', 'management', 'lead', 'leads', 'supervisor', 'supervisors', 'team lead', 'team leads', 'project manager', 'project managers', 'product manager', 'product managers', 'engineering manager', 'engineering managers'
  ],
  'director': ['director', 'directorship', 'marketing director', 'sales director', 'technical director'],
  'ceo': ['ceo', 'chief executive', 'chief executive officer', 'executive', 'chief executive'],
  'cto': ['cto', 'chief technology', 'chief technical officer', 'chief technology officer'],
  'cfo': ['cfo', 'chief financial', 'chief financial officer'],
  'cmo': ['cmo', 'chief marketing', 'chief marketing officer'],
  'coo': ['coo', 'chief operating', 'chief operating officer'],
  'sales': ['sales', 'salesperson', 'sales rep', 'sales representative', 'account executive', 'business development'],
  'marketing': ['marketing', 'marketer', 'digital marketing', 'content marketing', 'growth marketing'],
  'designer': ['designer', 'design', 'ui designer', 'ux designer', 'graphic designer', 'product designer'],
  'product manager': ['product manager', 'product management', 'pm', 'product owner'],
  'data scientist': ['data scientist', 'data science', 'analyst', 'data analyst', 'machine learning', 'ml engineer'],
  'hr': ['hr', 'human resources', 'recruiter', 'talent', 'talent acquisition', 'people operations'],
  'consultant': ['consultant', 'consulting', 'advisor', 'strategic advisor', 'business consultant'],
  'founder': ['founder', 'co-founder', 'startup founder', 'entrepreneur', 'cofounder'],
  'owner': ['owner', 'business owner', 'entrepreneur', 'small business owner'],
  'vp': ['vp', 'vice president', 'vice-president'],
  'president': ['president', 'company president'],
  'head of': ['head of', 'head'],
  'senior': ['senior', 'sr'],
  'junior': ['junior', 'jr'],
  'lead': ['lead', 'team lead', 'technical lead'],
  'architect': ['architect', 'software architect', 'solution architect'],
  'devops': ['devops', 'devops engineer', 'site reliability'],
  'qa': ['qa', 'quality assurance', 'test engineer', 'testing'],
  'scrum master': ['scrum master', 'agile coach'],
  'business analyst': ['business analyst', 'ba', 'systems analyst'],
  'project manager': ['project manager', 'program manager', 'delivery manager']
};

// Common location patterns
const LOCATION_PATTERNS = {
  'countries': [
    'sweden', 'usa', 'united states', 'america', 'canada', 'uk', 'united kingdom', 'germany', 
    'france', 'spain', 'italy', 'netherlands', 'belgium', 'switzerland', 'austria', 'denmark', 
    'norway', 'finland', 'poland', 'czech republic', 'hungary', 'romania', 'bulgaria', 'greece', 
    'portugal', 'ireland', 'australia', 'new zealand', 'japan', 'china', 'india', 'singapore', 
    'malaysia', 'thailand', 'vietnam', 'philippines', 'indonesia', 'brazil', 'mexico', 'argentina', 
    'chile', 'colombia', 'peru', 'south africa', 'nigeria', 'kenya', 'egypt', 'morocco', 'turkey', 
    'israel', 'uae', 'dubai', 'saudi arabia', 'qatar', 'kuwait', 'russia', 'ukraine', 'belarus',
    'pakistan', 'bangladesh', 'sri lanka', 'nepal', 'bhutan', 'myanmar', 'cambodia', 'laos',
    'mongolia', 'kazakhstan', 'uzbekistan', 'tajikistan', 'kyrgyzstan', 'turkmenistan',
    'azerbaijan', 'georgia', 'armenia', 'moldova', 'latvia', 'lithuania', 'estonia',
    'slovenia', 'croatia', 'serbia', 'bosnia', 'montenegro', 'macedonia', 'albania',
    'cyprus', 'malta', 'iceland', 'luxembourg', 'liechtenstein', 'monaco', 'andorra',
    'san marino', 'vatican', 'vatican city'
  ],
  'cities': [
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 
    'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus', 
    'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'washington', 'boston', 
    'el paso', 'nashville', 'detroit', 'oklahoma city', 'portland', 'las vegas', 'memphis', 
    'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 
    'atlanta', 'kansas city', 'long beach', 'colorado springs', 'raleigh', 'miami', 'virginia beach',
    'london', 'manchester', 'birmingham', 'leeds', 'liverpool', 'sheffield', 'edinburgh', 
    'glasgow', 'cardiff', 'belfast', 'bristol', 'newcastle', 'leicester', 'coventry', 'nottingham',
    'berlin', 'hamburg', 'munich', 'cologne', 'frankfurt', 'stuttgart', 'düsseldorf', 'dortmund', 
    'essen', 'leipzig', 'bremen', 'dresden', 'hanover', 'nuremberg', 'duisburg', 'bochum',
    'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 
    'bordeaux', 'lille', 'rennes', 'reims', 'saint-étienne', 'toulon', 'le havre', 'grenoble',
    'madrid', 'barcelona', 'valencia', 'seville', 'zaragoza', 'málaga', 'murcia', 'palma', 
    'las palmas', 'bilbao', 'alicante', 'córdoba', 'valladolid', 'vigo', 'gijón', 'hospitalet',
    'rome', 'milan', 'naples', 'turin', 'palermo', 'genoa', 'bologna', 'florence', 'bari', 
    'catania', 'venice', 'verona', 'messina', 'padua', 'trieste', 'taranto', 'brescia',
    'toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa', 'winnipeg', 'quebec city',
    'hamilton', 'kitchener', 'london', 'victoria', 'halifax', 'oshawa', 'windsor', 'saskatoon',
    'stockholm', 'gothenburg', 'malmö', 'uppsala', 'västerås', 'örebro', 'linköping', 'helsingborg',
    'jönköping', 'norrköping', 'lund', 'umeå', 'gävle', 'borås', 'eskilstuna', 'södertälje',
    'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'gold coast', 'newcastle', 'canberra',
    'sunshine coast', 'wollongong', 'hobart', 'geelong', 'townsville', 'cairns', 'darwin', 'toowoomba',
    'karachi', 'lahore', 'islamabad', 'faisalabad', 'rawalpindi', 'multan', 'hyderabad', 'peshawar',
    'quetta', 'sialkot', 'gujranwala', 'sargodha', 'bahawalpur', 'sukkur', 'jhang', 'sheikhupura',
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad',
    'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam',
    'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'chengdu', 'tianjin', 'chongqing', 'nanjing',
    'wuhan', 'xian', 'hangzhou', 'dalian', 'qingdao', 'shenyang', 'jinan', 'zhengzhou',
    'tokyo', 'yokohama', 'osaka', 'nagoya', 'sapporo', 'fukuoka', 'kobe', 'kyoto', 'kawasaki',
    'saitama', 'hiroshima', 'sendai', 'chiba', 'kitakyushu', 'sakai', 'niigata', 'hamamatsu'
  ],
  'regions': [
    'silicon valley', 'bay area', 'greater london', 'greater manchester', 'greater boston',
    'greater chicago', 'greater los angeles', 'greater new york', 'greater toronto',
    'greater vancouver', 'greater montreal', 'greater sydney', 'greater melbourne',
    'scandinavia', 'nordic', 'baltic', 'balkan', 'mediterranean', 'caribbean',
    'middle east', 'southeast asia', 'east asia', 'south asia', 'central asia',
    'eastern europe', 'western europe', 'northern europe', 'southern europe',
    'north america', 'south america', 'central america', 'africa', 'europe', 'asia'
  ]
};

// Industry patterns
const INDUSTRY_PATTERNS = {
  'software': ['software', 'tech', 'technology', 'it', 'information technology', 'saas', 'startup', 'software as a service', 'cloud', 'ai', 'artificial intelligence', 'machine learning', 'ml'],
  'healthcare': ['healthcare', 'health', 'medical', 'pharmaceutical', 'biotech', 'biotechnology', 'medtech', 'health tech', 'telemedicine', 'digital health'],
  'finance': ['finance', 'financial', 'banking', 'insurance', 'fintech', 'investment', 'wealth management', 'asset management', 'private equity', 'venture capital', 'cryptocurrency', 'blockchain'],
  'retail': ['retail', 'ecommerce', 'e-commerce', 'shopping', 'consumer goods', 'fashion', 'apparel', 'beauty', 'cosmetics', 'luxury', 'furniture', 'home goods'],
  'manufacturing': ['manufacturing', 'industrial', 'production', 'factory', 'automotive', 'aerospace', 'defense', 'chemical', 'steel', 'materials', 'construction'],
  'education': ['education', 'edtech', 'learning', 'academic', 'university', 'school', 'training', 'online learning', 'e-learning', 'distance learning'],
  'real estate': ['real estate', 'property', 'construction', 'housing', 'commercial real estate', 'residential', 'property management', 'development'],
  'marketing': ['marketing', 'advertising', 'media', 'communications', 'pr', 'public relations', 'digital marketing', 'content marketing', 'social media'],
  'consulting': ['consulting', 'professional services', 'advisory', 'management consulting', 'strategy', 'business consulting'],
  'non-profit': ['non-profit', 'nonprofit', 'charity', 'ngo', 'foundation', 'social impact', 'philanthropy'],
  'energy': ['energy', 'oil', 'gas', 'renewable energy', 'solar', 'wind', 'nuclear', 'utilities', 'power'],
  'transportation': ['transportation', 'logistics', 'supply chain', 'shipping', 'freight', 'delivery', 'mobility', 'automotive'],
  'entertainment': ['entertainment', 'gaming', 'media', 'film', 'television', 'music', 'sports', 'esports'],
  'food': ['food', 'beverage', 'restaurant', 'catering', 'agriculture', 'farming', 'food tech'],
  'legal': ['legal', 'law', 'law firm', 'legal services', 'compliance', 'regulatory'],
  'government': ['government', 'public sector', 'military', 'defense', 'public service'],
  'telecommunications': ['telecommunications', 'telecom', 'wireless', 'mobile', 'internet service', 'isp']
};

// Company size patterns
const COMPANY_SIZE_PATTERNS = {
  'small': ['small', 'startup', 'small business', '1-10', '1-50', 'micro', 'tiny', 'early stage'],
  'medium': ['medium', 'mid-size', 'mid-sized', '50-200', '200-1000', 'growth stage', 'scale up'],
  'large': ['large', 'enterprise', 'big', '1000+', 'fortune 500', 'fortune 1000', 'multinational', 'corporate']
};

// Revenue patterns
const REVENUE_PATTERNS = {
  'low': ['$0-1m', '$0-1 million', 'under $1m', 'under $1 million', 'less than $1m', 'startup revenue'],
  'medium': ['$1m-10m', '$1-10 million', '$10m-50m', '$10-50 million', 'mid market'],
  'high': ['$50m-250m', '$50-250 million', '$250m-1b', '$250 million to $1 billion', 'high revenue'],
  'enterprise': ['$1b+', '$1 billion+', 'over $1b', 'over $1 billion', 'fortune 500 revenue']
};

// Technology patterns
const TECHNOLOGY_PATTERNS = {
  'programming_languages': ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript', 'react', 'angular', 'vue', 'node.js'],
  'cloud_platforms': ['aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'heroku', 'digital ocean', 'cloudflare'],
  'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle'],
  'frameworks': ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'laravel', 'express', 'fastapi'],
  'tools': ['docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'jira', 'slack', 'zoom']
};

// Funding type patterns
const FUNDING_TYPE_PATTERNS = {
  'seed': ['seed', 'seed funding', 'seed round', 'pre-seed', 'angel'],
  'series_a': ['series a', 'series a funding', 'series a round'],
  'series_b': ['series b', 'series b funding', 'series b round'],
  'series_c': ['series c', 'series c funding', 'series c round'],
  'ipo': ['ipo', 'initial public offering', 'public', 'listed'],
  'private_equity': ['private equity', 'pe', 'buyout', 'acquisition'],
  'venture_capital': ['venture capital', 'vc', 'venture funding']
};

// Common names (for name extraction)
const COMMON_NAMES = [
  'john', 'jane', 'mike', 'sarah', 'david', 'emma', 'james', 'olivia', 'robert', 'ava',
  'michael', 'isabella', 'william', 'sophia', 'richard', 'charlotte', 'joseph', 'mia',
  'thomas', 'amelia', 'christopher', 'harper', 'charles', 'evelyn', 'daniel', 'abigail',
  'matthew', 'emily', 'anthony', 'elizabeth', 'mark', 'sofia', 'donald', 'madison',
  'steven', 'avery', 'paul', 'ella', 'andrew', 'scarlett', 'joshua', 'grace', 'kenneth',
  'chloe', 'kevin', 'victoria', 'brian', 'riley', 'george', 'aria', 'edward', 'lily',
  'ronald', 'aubrey', 'timothy', 'zoey', 'jason', 'penelope', 'jeffrey', 'layla', 'ryan',
  'nora', 'jacob', 'lily', 'gary', 'eleanor', 'nicholas', 'hannah', 'eric', 'luna',
  'jonathan', 'savannah', 'stephen', 'brooklyn', 'larry', 'leah', 'justin', 'zoe',
  'scott', 'stella', 'brandon', 'hazel', 'benjamin', 'ellie', 'samuel', 'paisley',
  'frank', 'audrey', 'gregory', 'skylar', 'raymond', 'violet', 'alexander', 'claire',
  'patrick', 'bella', 'jack', 'aurora', 'dennis', 'lucy', 'jerry', 'angela', 'tyler',
  'anna', 'aaron', 'caroline', 'jose', 'sadie', 'adam', 'aaliyah', 'nathan', 'kaylee',
  'henry', 'jessica', 'douglas', 'hailey', 'zachary', 'jasmine', 'peter', 'nevaeh',
  'kyle', 'valentina', 'walter', 'isla', 'ethan', 'natalie', 'noah', 'adriana',
  'jeremy', 'brianna', 'harold', 'caroline', 'sean', 'maya', 'austin', 'khloe',
  'carlos', 'alexis', 'terry', 'alice', 'gerald', 'luna', 'keith', 'athena',
  'roger', 'iris', 'lawrence', 'trinity', 'albert', 'genesis', 'ronnie', 'serenity'
];

// Common company names (for company extraction)
const COMMON_COMPANIES = [
  'google', 'microsoft', 'apple', 'amazon', 'facebook', 'meta', 'netflix', 'tesla',
  'uber', 'lyft', 'airbnb', 'spotify', 'twitter', 'linkedin', 'salesforce', 'oracle',
  'ibm', 'intel', 'cisco', 'adobe', 'paypal', 'stripe', 'square', 'zoom', 'slack',
  'dropbox', 'box', 'atlassian', 'shopify', 'squarespace', 'wix', 'wordpress',
  'github', 'gitlab', 'docker', 'kubernetes', 'mongodb', 'redis', 'elastic',
  'datadog', 'splunk', 'palantir', 'snowflake', 'databricks', 'openai', 'anthropic',
  'nvidia', 'amd', 'qualcomm', 'broadcom', 'marvell', 'micron', 'western digital',
  'dell', 'hp', 'lenovo', 'asus', 'acer', 'samsung', 'lg', 'sony', 'panasonic',
  'philips', 'siemens', 'bosch', 'ge', 'honeywell', 'emerson', 'rockwell',
  'abb', 'schneider electric', 'eaton', 'legrand', 'hubbell', 'thomas & betts'
];

/**
 * Parse natural language query and extract search parameters
 * @param {string} query - Natural language query like "I want to get all software engineers in Sweden"
 * @returns {object} - Extracted search parameters
 */
export function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== 'string') {
    return {
      person_titles: [],
      locations: [],
      industries: [],
      employees: [],
      revenues: [],
      technologies: [],
      funding_types: [],
      names: [],
      companies: [],
      lookalike_domains: [],
      raw_query: query || ''
    };
  }

  const lowerQuery = query.toLowerCase();
  const extractedParams = {
    person_titles: [],
    locations: [],
    industries: [],
    employees: [],
    revenues: [],
    technologies: [],
    funding_types: [],
    names: [],
    companies: [],
    lookalike_domains: [],
    raw_query: query
  };

  // Helper to match all patterns with word boundaries
  function matchPatterns(patterns) {
    const found = [];
    // Normalize the query: remove punctuation, extra spaces, lowercase
    const normalizedQuery = lowerQuery.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').toLowerCase();
    for (const pattern of patterns) {
      // Normalize the pattern: remove punctuation, extra spaces, lowercase
      const normalizedPattern = pattern.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').toLowerCase();
      // Match singular and plural forms
      const regex = new RegExp(`\\b${normalizedPattern}s?\\b`, 'gi');
      if (regex.test(normalizedQuery)) {
        found.push(pattern);
        // Debug log for matched pattern
        console.log(`Matched pattern: '${pattern}' in query: '${normalizedQuery}'`);
      }
    }
    return found;
  }

  // Extract job titles
  for (const [title, patterns] of Object.entries(JOB_TITLE_PATTERNS)) {
    if (matchPatterns(patterns).length > 0) extractedParams.person_titles.push(title);
  }

  // Extract locations
  for (const category of Object.values(LOCATION_PATTERNS)) {
    extractedParams.locations.push(...matchPatterns(category));
  }

  // Extract industries
  for (const [industry, patterns] of Object.entries(INDUSTRY_PATTERNS)) {
    if (matchPatterns(patterns).length > 0) extractedParams.industries.push(industry);
  }

  // Extract company size
  for (const [size, patterns] of Object.entries(COMPANY_SIZE_PATTERNS)) {
    if (matchPatterns(patterns).length > 0) {
      if (size === 'small') {
        extractedParams.employees.push('1-10', '11-50');
      } else if (size === 'medium') {
        extractedParams.employees.push('51-200', '201-1000');
      } else if (size === 'large') {
        extractedParams.employees.push('1001-5000', '5001-10000', '10000+');
      }
    }
  }

  // Extract revenue
  for (const [revenue, patterns] of Object.entries(REVENUE_PATTERNS)) {
    if (matchPatterns(patterns).length > 0) {
      if (revenue === 'low') {
        extractedParams.revenues.push('$0-1M');
      } else if (revenue === 'medium') {
        extractedParams.revenues.push('$1M-10M', '$10M-50M');
      } else if (revenue === 'high') {
        extractedParams.revenues.push('$50M-250M', '$250M-1B');
      } else if (revenue === 'enterprise') {
        extractedParams.revenues.push('$1B+');
      }
    }
  }

  // Extract explicit number/range patterns (e.g. 100+, 10-50, $1M, $10M+)
  const numberRangeRegex = /(\d{1,3}(?:,\d{3})*)(\+|\-| to |–)?(\d{1,3}(?:,\d{3})*)?\s*(employees|people|staff|team|person|companies|company|revenue|usd|\$|m|million|b|billion)?/gi;
  let match;
  while ((match = numberRangeRegex.exec(lowerQuery)) !== null) {
    if (match[4] && match[4].includes('revenue')) {
      // Revenue
      if (match[2] && match[2].includes('+')) {
        extractedParams.revenues.push(`$${match[1]}+`);
      } else if (match[3]) {
        extractedParams.revenues.push(`$${match[1]}-$${match[3]}`);
      } else {
        extractedParams.revenues.push(`$${match[1]}`);
      }
    } else if (match[4] && (match[4].includes('employee') || match[4].includes('person') || match[4].includes('staff') || match[4].includes('team'))) {
      // Employees
      if (match[2] && match[2].includes('+')) {
        extractedParams.employees.push(`${match[1]}+`);
      } else if (match[3]) {
        extractedParams.employees.push(`${match[1]}-${match[3]}`);
      } else {
        extractedParams.employees.push(`${match[1]}`);
      }
    }
  }

  // Extract technologies
  for (const [category, patterns] of Object.entries(TECHNOLOGY_PATTERNS)) {
    extractedParams.technologies.push(...matchPatterns(patterns));
  }

  // Extract funding types
  for (const [funding, patterns] of Object.entries(FUNDING_TYPE_PATTERNS)) {
    if (matchPatterns(patterns).length > 0) extractedParams.funding_types.push(funding);
  }

  // Extract names (look for common names)
  for (const name of COMMON_NAMES) {
    const regex = new RegExp(`\\b${name}\\b`, 'i');
    if (regex.test(lowerQuery)) extractedParams.names.push(name);
  }

  // Extract company names
  for (const company of COMMON_COMPANIES) {
    const regex = new RegExp(`\\b${company}\\b`, 'i');
    if (regex.test(lowerQuery)) extractedParams.companies.push(company);
  }

  // Look for domain patterns (lookalike domains)
  const domainRegex = /(?:domain|website|site|platform)\s+(?:like|similar to|such as)\s+([a-zA-Z0-9.-]+)/gi;
  const domainMatches = [...lowerQuery.matchAll(domainRegex)];
  if (domainMatches.length > 0) {
    extractedParams.lookalike_domains = domainMatches.map(match => match[1]);
  }

  // Remove duplicates
  extractedParams.person_titles = [...new Set(extractedParams.person_titles)];
  extractedParams.locations = [...new Set(extractedParams.locations)];
  extractedParams.industries = [...new Set(extractedParams.industries)];
  extractedParams.employees = [...new Set(extractedParams.employees)];
  extractedParams.revenues = [...new Set(extractedParams.revenues)];
  extractedParams.technologies = [...new Set(extractedParams.technologies)];
  extractedParams.funding_types = [...new Set(extractedParams.funding_types)];
  extractedParams.names = [...new Set(extractedParams.names)];
  extractedParams.companies = [...new Set(extractedParams.companies)];
  extractedParams.lookalike_domains = [...new Set(extractedParams.lookalike_domains)];

  console.log('NLP Parser - Extracted parameters:', extractedParams);
  
  return extractedParams;
}

/**
 * Check if a query contains natural language patterns
 * @param {string} query - The search query
 * @returns {boolean} - True if query appears to be natural language
 */
export function isNaturalLanguageQuery(query) {
  if (!query || typeof query !== 'string') return false;
  
  const lowerQuery = query.toLowerCase();
  
  // Check for natural language indicators
  const naturalLanguageIndicators = [
    'i want', 'i need', 'find me', 'get me', 'show me', 'search for',
    'looking for', 'find all', 'get all', 'show all', 'search all',
    'people who', 'companies that', 'businesses in', 'professionals in',
    'leads who', 'contacts in', 'executives at', 'managers in',
    'directors of', 'founders in', 'owners of', 'employees at'
  ];
  
  return naturalLanguageIndicators.some(indicator => lowerQuery.includes(indicator));
}

/**
 * Clean and format the extracted query for better search results
 * @param {string} originalQuery - Original user query
 * @param {object} extractedParams - Extracted parameters
 * @returns {string} - Cleaned query string
 */
export function formatSearchQuery(originalQuery, extractedParams) {
  if (!originalQuery) return '';
  
  // If we extracted specific parameters, create a focused query
  if (extractedParams.person_titles.length > 0 || 
      extractedParams.locations.length > 0 || 
      extractedParams.industries.length > 0 ||
      extractedParams.companies.length > 0) {
    
    const parts = [];
    
    if (extractedParams.person_titles.length > 0) {
      parts.push(extractedParams.person_titles.join(' '));
    }
    
    if (extractedParams.industries.length > 0) {
      parts.push(extractedParams.industries.join(' '));
    }
    
    if (extractedParams.companies.length > 0) {
      parts.push(`at ${extractedParams.companies.join(', ')}`);
    }
    
    if (extractedParams.locations.length > 0) {
      parts.push(`in ${extractedParams.locations.join(', ')}`);
    }
    
    return parts.join(' ');
  }
  
  // Otherwise, return the original query cleaned up
  return originalQuery.replace(/^(i want|i need|find me|get me|show me|search for|looking for|find all|get all|show all|search all)\s+/i, '');
}

// Add a utility to summarize main keywords for display
export function summarizeMainKeywords(extractedParams) {
  // Prioritize: job titles, industries, companies, locations, technologies, funding, employees, revenues
  const summary = [];
  if (extractedParams.person_titles?.length) summary.push(`Job Titles: ${extractedParams.person_titles.join(', ')}`);
  if (extractedParams.industries?.length) summary.push(`Industries: ${extractedParams.industries.join(', ')}`);
  if (extractedParams.companies?.length) summary.push(`Companies: ${extractedParams.companies.join(', ')}`);
  if (extractedParams.locations?.length) summary.push(`Locations: ${extractedParams.locations.join(', ')}`);
  if (extractedParams.technologies?.length) summary.push(`Technologies: ${extractedParams.technologies.join(', ')}`);
  if (extractedParams.funding_types?.length) summary.push(`Funding: ${extractedParams.funding_types.join(', ')}`);
  if (extractedParams.employees?.length) summary.push(`Company Size: ${extractedParams.employees.join(', ')}`);
  if (extractedParams.revenues?.length) summary.push(`Revenue: ${extractedParams.revenues.join(', ')}`);
  if (extractedParams.names?.length) summary.push(`Names: ${extractedParams.names.join(', ')}`);
  if (extractedParams.lookalike_domains?.length) summary.push(`Lookalike Domains: ${extractedParams.lookalike_domains.join(', ')}`);
  return summary;
} 