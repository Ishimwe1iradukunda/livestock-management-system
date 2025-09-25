import { Helmet } from 'react-helmet-async';

interface SEOMetadataProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
  ogType?: string;
  noindex?: boolean;
}

export default function SEOMetadata({
  title,
  description,
  canonical,
  keywords = [],
  ogType = 'website',
  noindex = false
}: SEOMetadataProps) {
  const fullTitle = `${title} | LivestockMS - Farm Management System`;
  const currentUrl = window.location.href;
  const canonicalUrl = canonical || currentUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      {/* Structured Data for Farm Management */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "LivestockMS",
          "applicationCategory": "Farm Management Software",
          "description": "Comprehensive livestock management system for tracking animals, health records, feed management, and farm productivity",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}
      </script>
    </Helmet>
  );
}

// Page-specific SEO configurations
export const seoConfigs = {
  dashboard: {
    title: "Farm Dashboard",
    description: "Overview of your livestock farm operations, including animal counts, health status, production metrics, and financial summary.",
    keywords: ["farm dashboard", "livestock overview", "farm management", "agricultural analytics"]
  },
  animals: {
    title: "Animal Management",
    description: "Manage your livestock inventory with detailed animal records, tracking, and performance monitoring for cattle, sheep, goats, and more.",
    keywords: ["livestock management", "animal tracking", "cattle records", "farm animals", "livestock inventory"]
  },
  health: {
    title: "Health Records",
    description: "Track animal health with comprehensive veterinary records, vaccination schedules, treatments, and medical history management.",
    keywords: ["animal health", "veterinary records", "vaccination tracking", "livestock medicine", "animal healthcare"]
  },
  feeds: {
    title: "Feed Management",
    description: "Manage livestock nutrition with feed inventory tracking, nutritional analysis, feeding schedules, and cost optimization.",
    keywords: ["livestock nutrition", "feed management", "animal feeding", "feed inventory", "nutritional tracking"]
  },
  production: {
    title: "Production Tracking",
    description: "Monitor farm productivity with detailed production records for milk, eggs, meat, and other livestock outputs.",
    keywords: ["farm production", "livestock output", "milk production", "egg tracking", "farm productivity"]
  },
  financial: {
    title: "Financial Management",
    description: "Track farm finances with comprehensive expense and revenue management, profitability analysis, and financial reporting.",
    keywords: ["farm finances", "agricultural accounting", "livestock expenses", "farm profitability", "financial tracking"]
  },
  monitoring: {
    title: "System Monitoring",
    description: "Monitor system performance, track key metrics, and analyze farm operations with advanced analytics and reporting tools.",
    keywords: ["farm analytics", "system monitoring", "performance tracking", "operational insights", "farm metrics"]
  }
};