import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string; // "/dashboard" or full URL
}

export default function SEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }

    if (canonical) {
      const href = canonical.startsWith('http')
        ? canonical
        : `${window.location.origin}${canonical}`;

      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    }
  }, [title, description, canonical]);

  return null;
}
