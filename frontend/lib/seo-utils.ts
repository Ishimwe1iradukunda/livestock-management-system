// SEO and URL optimization utilities

export interface URLStructure {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  breadcrumbs: Array<{ label: string; href: string }>;
}

// Optimized URL structure for the application
export const urlStructure: Record<string, URLStructure> = {
  '/': {
    path: '/',
    title: 'Farm Dashboard',
    description: 'Comprehensive livestock farm management dashboard',
    keywords: ['farm dashboard', 'livestock management', 'agricultural software'],
    breadcrumbs: [{ label: 'Dashboard', href: '/' }]
  },
  '/animals': {
    path: '/animals',
    title: 'Livestock Management',
    description: 'Manage your farm animals and livestock inventory',
    keywords: ['livestock management', 'animal tracking', 'cattle management', 'farm animals'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Animals', href: '/animals' }
    ]
  },
  '/animals/add': {
    path: '/animals/add',
    title: 'Add New Animal',
    description: 'Register a new animal in your livestock inventory',
    keywords: ['add animal', 'register livestock', 'new animal record'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Animals', href: '/animals' },
      { label: 'Add Animal', href: '/animals/add' }
    ]
  },
  '/health': {
    path: '/health',
    title: 'Animal Health Records',
    description: 'Track veterinary records, vaccinations, and animal health management',
    keywords: ['animal health', 'veterinary records', 'vaccination tracking', 'livestock medicine'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Health Records', href: '/health' }
    ]
  },
  '/feeds': {
    path: '/feeds',
    title: 'Feed Management System',
    description: 'Manage livestock nutrition, feed inventory, and feeding schedules',
    keywords: ['livestock nutrition', 'feed management', 'animal feeding', 'feed inventory'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Feed Management', href: '/feeds' }
    ]
  },
  '/production': {
    path: '/production',
    title: 'Production Tracking',
    description: 'Monitor farm productivity and livestock output records',
    keywords: ['farm production', 'livestock output', 'production tracking', 'farm productivity'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Production', href: '/production' }
    ]
  },
  '/financial': {
    path: '/financial',
    title: 'Farm Financial Management',
    description: 'Track farm expenses, revenue, and financial performance',
    keywords: ['farm finances', 'agricultural accounting', 'farm expenses', 'livestock profitability'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Financial Records', href: '/financial' }
    ]
  },
  '/monitoring': {
    path: '/monitoring',
    title: 'System Monitoring & Analytics',
    description: 'Monitor system performance and analyze farm operations',
    keywords: ['farm analytics', 'system monitoring', 'performance tracking', 'operational insights'],
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'System Monitoring', href: '/monitoring' }
    ]
  }
};

// Generate semantic URLs for better SEO
export function generateSemanticURL(baseUrl: string, params: Record<string, string | number>): string {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  
  return url.pathname + url.search;
}

// Generate anchor text variations for internal links
export function generateAnchorText(targetPage: string, context: 'navigation' | 'content' | 'cta' = 'content'): string {
  const variations = {
    animals: {
      navigation: 'Animals',
      content: 'livestock management',
      cta: 'Manage Your Animals'
    },
    health: {
      navigation: 'Health',
      content: 'health records',
      cta: 'Track Animal Health'
    },
    feeds: {
      navigation: 'Feeds',
      content: 'feed management',
      cta: 'Manage Feed Inventory'
    },
    production: {
      navigation: 'Production',
      content: 'production tracking',
      cta: 'Monitor Production'
    },
    financial: {
      navigation: 'Financial',
      content: 'financial records',
      cta: 'View Financial Data'
    },
    monitoring: {
      navigation: 'Monitoring',
      content: 'system monitoring',
      cta: 'View Analytics'
    }
  };

  return variations[targetPage as keyof typeof variations]?.[context] || targetPage;
}

// Link attributes for SEO optimization
export interface LinkAttributes {
  rel?: string;
  title?: string;
  'aria-label'?: string;
  'data-analytics'?: string;
}

export function generateLinkAttributes(
  targetPage: string, 
  linkText: string, 
  context: string = ''
): LinkAttributes {
  const attributes: LinkAttributes = {
    title: `Navigate to ${linkText}${context ? ` - ${context}` : ''}`,
    'aria-label': `Go to ${linkText} page`,
    'data-analytics': `internal-link-${targetPage}`
  };

  // Add rel attributes for specific cases
  if (targetPage.includes('external')) {
    attributes.rel = 'noopener noreferrer';
  }

  return attributes;
}

// Site structure for XML sitemap generation
export const siteStructure = {
  pages: Object.values(urlStructure),
  lastModified: new Date().toISOString(),
  changeFrequency: 'weekly' as const,
  priority: {
    '/': 1.0,
    '/animals': 0.9,
    '/health': 0.8,
    '/feeds': 0.8,
    '/production': 0.8,
    '/financial': 0.8,
    '/monitoring': 0.7
  }
};

// Internal linking best practices
export const linkingBestPractices = {
  // Maximum number of internal links per page
  maxLinksPerPage: 100,
  
  // Recommended anchor text length
  anchorTextLength: { min: 2, max: 60 },
  
  // Link distribution recommendations
  linkDistribution: {
    navigation: 0.3,  // 30% navigation links
    contextual: 0.5,  // 50% contextual content links
    footer: 0.2       // 20% footer/utility links
  },
  
  // Priority pages that should receive more internal links
  priorityPages: [
    '/animals',
    '/health',
    '/feeds',
    '/production',
    '/financial'
  ],
  
  // Pages that need more internal links based on current structure
  pagesNeedingMoreLinks: [
    '/monitoring',
    '/users'
  ]
};