import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp } from 'lucide-react';
import InternalLink, { useContextualLinks } from './InternalLinkHelper';

interface RelatedLinksProps {
  currentPage: string;
  className?: string;
  title?: string;
  maxLinks?: number;
}

export default function RelatedLinks({ 
  currentPage, 
  className, 
  title = "Related Sections",
  maxLinks = 4 
}: RelatedLinksProps) {
  const { getRelatedLinks } = useContextualLinks(currentPage);
  const relatedLinks = getRelatedLinks().slice(0, maxLinks);

  if (relatedLinks.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Explore related features and data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedLinks.map((link, index) => (
            <div key={link.to} className="group">
              <InternalLink 
                to={link.to}
                variant="default"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors no-underline hover:no-underline"
                title={link.context}
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.text}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {link.context}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </InternalLink>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick action links component for dashboard
export function QuickActionLinks() {
  const quickActions = [
    {
      to: '/animals',
      title: 'Add New Animal',
      description: 'Register a new animal in your livestock inventory',
      icon: '🐄'
    },
    {
      to: '/health',
      title: 'Record Health Event',
      description: 'Log vaccinations, treatments, or health checkups',
      icon: '🏥'
    },
    {
      to: '/feeds',
      title: 'Manage Feed Inventory',
      description: 'Update feed stocks and purchase records',
      icon: '🌾'
    },
    {
      to: '/production',
      title: 'Log Production',
      description: 'Record milk, eggs, or other farm output',
      icon: '📊'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((action) => (
        <InternalLink
          key={action.to}
          to={action.to}
          variant="default"
          className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors no-underline hover:no-underline group"
          title={action.description}
        >
          <div className="text-2xl mb-2">{action.icon}</div>
          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
            {action.title}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {action.description}
          </div>
        </InternalLink>
      ))}
    </div>
  );
}