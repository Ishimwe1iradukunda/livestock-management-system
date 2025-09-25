import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InternalLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'button' | 'nav';
  external?: boolean;
  title?: string;
  rel?: string;
}

// SEO-optimized anchor text variations for different contexts
export const anchorTextVariations = {
  animals: [
    'livestock inventory',
    'animal management',
    'farm animals',
    'cattle records',
    'animal database',
    'livestock tracking'
  ],
  health: [
    'health records',
    'veterinary records',
    'animal health tracking',
    'medical history',
    'vaccination records',
    'health management'
  ],
  feeds: [
    'feed management',
    'livestock nutrition',
    'feed inventory',
    'animal feeding',
    'nutritional tracking',
    'feed supplies'
  ],
  production: [
    'production records',
    'livestock output',
    'farm productivity',
    'production tracking',
    'yield management',
    'output monitoring'
  ],
  financial: [
    'financial records',
    'farm finances',
    'expense tracking',
    'revenue management',
    'financial planning',
    'cost analysis'
  ],
  monitoring: [
    'system monitoring',
    'performance tracking',
    'farm analytics',
    'operational insights',
    'data monitoring',
    'system health'
  ]
};

export default function InternalLink({ 
  to, 
  children, 
  className, 
  variant = 'default',
  external = false,
  title,
  rel,
  ...props 
}: InternalLinkProps) {
  const baseClasses = {
    default: 'text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors',
    subtle: 'text-muted-foreground hover:text-foreground transition-colors',
    button: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4',
    nav: 'text-foreground/60 hover:text-foreground transition-colors'
  };

  const linkProps = {
    className: cn(baseClasses[variant], className),
    title: title || `Navigate to ${children}`,
    rel: rel || (external ? 'noopener noreferrer' : undefined),
    ...props
  };

  if (external) {
    return (
      <a href={to} target="_blank" {...linkProps}>
        {children}
        <ExternalLink className="ml-1 h-3 w-3 inline" />
      </a>
    );
  }

  return (
    <Link to={to} {...linkProps}>
      {children}
    </Link>
  );
}

// Hook for generating contextual internal links
export function useContextualLinks(currentPage: string) {
  const getRelatedLinks = () => {
    switch (currentPage) {
      case 'animals':
        return [
          { to: '/health', text: 'health records', context: 'Track medical history for your animals' },
          { to: '/feeds', text: 'feeding management', context: 'Manage nutrition and feeding schedules' },
          { to: '/production', text: 'production tracking', context: 'Monitor output and productivity' },
          { to: '/financial', text: 'cost analysis', context: 'Track expenses and profitability per animal' }
        ];
      case 'health':
        return [
          { to: '/animals', text: 'animal profiles', context: 'View complete animal information' },
          { to: '/financial', text: 'veterinary expenses', context: 'Track health-related costs' },
          { to: '/monitoring', text: 'health analytics', context: 'Monitor health trends and patterns' }
        ];
      case 'feeds':
        return [
          { to: '/animals', text: 'livestock inventory', context: 'Assign feeds to specific animals' },
          { to: '/financial', text: 'feed costs', context: 'Track feeding expenses and budgets' },
          { to: '/production', text: 'feed efficiency', context: 'Analyze feed conversion rates' }
        ];
      case 'production':
        return [
          { to: '/animals', text: 'producing animals', context: 'View animals contributing to production' },
          { to: '/financial', text: 'revenue tracking', context: 'Monitor income from production' },
          { to: '/feeds', text: 'nutrition optimization', context: 'Optimize feeding for better production' }
        ];
      case 'financial':
        return [
          { to: '/animals', text: 'animal profitability', context: 'Analyze ROI per animal' },
          { to: '/production', text: 'revenue sources', context: 'Track income from various outputs' },
          { to: '/health', text: 'medical expenses', context: 'Monitor veterinary and health costs' },
          { to: '/feeds', text: 'feeding costs', context: 'Track nutrition and feed expenses' }
        ];
      default:
        return [
          { to: '/animals', text: 'livestock management', context: 'Manage your farm animals' },
          { to: '/health', text: 'health monitoring', context: 'Track animal health and medical records' },
          { to: '/production', text: 'production tracking', context: 'Monitor farm output and productivity' },
          { to: '/financial', text: 'financial overview', context: 'Track expenses and revenue' }
        ];
    }
  };

  return { getRelatedLinks };
}