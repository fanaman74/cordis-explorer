import { useEffect } from 'react';

export const SITE_URL = 'https://cordis-explorer.eu';
export const SITE_NAME = 'CORDIS Explorer';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_DESCRIPTION =
  'Explore 50,000+ EU-funded research projects from Horizon Europe, H2020 and FP7. Search CORDIS data, discover partner organisations, find grants, and visualise research networks — powered by AI.';

type JsonLd = Record<string, unknown>;

export interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  image?: string;
  ogType?: 'website' | 'article' | 'profile';
  keywords?: string;
  jsonLd?: JsonLd | JsonLd[];
}

interface HeadState {
  title?: string;
  description?: string;
  canonical?: string;
  noindex: boolean;
  image?: string;
  ogType: 'website' | 'article' | 'profile';
  keywords?: string;
  jsonLd: JsonLd[];
}

function emptyHead(): HeadState {
  return {
    noindex: false,
    ogType: 'website',
    jsonLd: [],
  };
}

// Module-level collector. renderToString is synchronous and Node.js is
// single-threaded, so a per-render reset is safe.
const store = { head: emptyHead() };

export function resetHead(): void {
  store.head = emptyHead();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toAbsolute(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function applyProps(h: HeadState, props: SeoProps): void {
  h.title = props.title;
  if (props.description !== undefined) h.description = props.description;
  if (props.canonical !== undefined) h.canonical = toAbsolute(props.canonical);
  if (props.noindex !== undefined) h.noindex = props.noindex;
  h.image = toAbsolute(props.image) ?? DEFAULT_IMAGE;
  if (props.ogType !== undefined) h.ogType = props.ogType;
  if (props.keywords !== undefined) h.keywords = props.keywords;
  if (props.jsonLd !== undefined) {
    const items = Array.isArray(props.jsonLd) ? props.jsonLd : [props.jsonLd];
    h.jsonLd.push(...items);
  }
}

export function renderHead(): string {
  const h = store.head;
  const parts: string[] = [];
  const title = h.title ? escapeHtml(h.title) : escapeHtml(SITE_NAME);
  const description = escapeHtml(h.description ?? DEFAULT_DESCRIPTION);
  const canonical = h.canonical ? escapeHtml(h.canonical) : `${SITE_URL}/`;
  const image = escapeHtml(h.image ?? DEFAULT_IMAGE);
  const ogType = escapeHtml(h.ogType);

  parts.push(`<title data-seo-managed>${title}</title>`);
  parts.push(`<meta data-seo-managed name="description" content="${description}"/>`);
  if (h.keywords) {
    parts.push(`<meta data-seo-managed name="keywords" content="${escapeHtml(h.keywords)}"/>`);
  }
  parts.push(`<link data-seo-managed rel="canonical" href="${canonical}"/>`);
  parts.push(
    `<meta data-seo-managed name="robots" content="${h.noindex ? 'noindex, nofollow' : 'index, follow'}"/>`,
  );
  parts.push(`<meta data-seo-managed name="author" content="${escapeHtml(SITE_NAME)}"/>`);

  // Open Graph
  parts.push(`<meta data-seo-managed property="og:type" content="${ogType}"/>`);
  parts.push(`<meta data-seo-managed property="og:url" content="${canonical}"/>`);
  parts.push(`<meta data-seo-managed property="og:title" content="${title}"/>`);
  parts.push(`<meta data-seo-managed property="og:description" content="${description}"/>`);
  parts.push(`<meta data-seo-managed property="og:image" content="${image}"/>`);
  parts.push(`<meta data-seo-managed property="og:image:width" content="1200"/>`);
  parts.push(`<meta data-seo-managed property="og:image:height" content="630"/>`);
  parts.push(`<meta data-seo-managed property="og:site_name" content="${escapeHtml(SITE_NAME)}"/>`);
  parts.push(`<meta data-seo-managed property="og:locale" content="en_GB"/>`);

  // Twitter / X
  parts.push(`<meta data-seo-managed name="twitter:card" content="summary_large_image"/>`);
  parts.push(`<meta data-seo-managed name="twitter:title" content="${title}"/>`);
  parts.push(`<meta data-seo-managed name="twitter:description" content="${description}"/>`);
  parts.push(`<meta data-seo-managed name="twitter:image" content="${image}"/>`);

  // Always include a site-level Organization + WebSite graph
  const baseGraph = buildBaseGraph();
  const jsonLd = [baseGraph, ...h.jsonLd];
  for (const item of jsonLd) {
    const json = JSON.stringify(item).replace(/</g, '\\u003c');
    parts.push(`<script data-seo-managed type="application/ld+json">${json}</script>`);
  }

  return parts.join('\n    ');
}

function buildBaseGraph(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description:
          'Search and explore EU-funded research projects from Horizon Europe, H2020 and FP7',
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description:
          'AI-powered platform for discovering EU-funded research projects and partners',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon.svg`,
        },
      },
    ],
  };
}

const isServer = typeof window === 'undefined';

export function Seo(props: SeoProps): null {
  if (isServer) {
    applyProps(store.head, props);
  }

  const depKey = JSON.stringify({
    t: props.title,
    d: props.description,
    c: props.canonical,
    n: props.noindex,
    i: props.image,
    o: props.ogType,
    k: props.keywords,
    j: props.jsonLd,
  });

  useEffect(() => {
    if (isServer) return;
    applyToDocument(props);
  }, [depKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

function applyToDocument(props: SeoProps): void {
  // Remove anything we previously managed (incl. SSR-injected tags) and
  // re-insert a fresh set for the current page.
  document.querySelectorAll('[data-seo-managed]').forEach(el => el.remove());

  const head = document.head;
  const title = props.title;
  const description = props.description ?? DEFAULT_DESCRIPTION;
  const canonical = toAbsolute(props.canonical) ?? `${SITE_URL}/`;
  const image = toAbsolute(props.image) ?? DEFAULT_IMAGE;
  const ogType = props.ogType ?? 'website';

  document.title = title;

  const add = (
    tag: 'meta' | 'link' | 'script' | 'title',
    attrs: Record<string, string>,
    content?: string,
  ) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute('data-seo-managed', '');
    if (content !== undefined) el.textContent = content;
    head.appendChild(el);
  };

  add('meta', { name: 'description', content: description });
  if (props.keywords) add('meta', { name: 'keywords', content: props.keywords });
  add('link', { rel: 'canonical', href: canonical });
  add('meta', { name: 'robots', content: props.noindex ? 'noindex, nofollow' : 'index, follow' });
  add('meta', { name: 'author', content: SITE_NAME });

  add('meta', { property: 'og:type', content: ogType });
  add('meta', { property: 'og:url', content: canonical });
  add('meta', { property: 'og:title', content: title });
  add('meta', { property: 'og:description', content: description });
  add('meta', { property: 'og:image', content: image });
  add('meta', { property: 'og:image:width', content: '1200' });
  add('meta', { property: 'og:image:height', content: '630' });
  add('meta', { property: 'og:site_name', content: SITE_NAME });
  add('meta', { property: 'og:locale', content: 'en_GB' });

  add('meta', { name: 'twitter:card', content: 'summary_large_image' });
  add('meta', { name: 'twitter:title', content: title });
  add('meta', { name: 'twitter:description', content: description });
  add('meta', { name: 'twitter:image', content: image });

  const jsonLdItems = [
    buildBaseGraph(),
    ...(Array.isArray(props.jsonLd) ? props.jsonLd : props.jsonLd ? [props.jsonLd] : []),
  ];
  for (const item of jsonLdItems) {
    add('script', { type: 'application/ld+json' }, JSON.stringify(item));
  }
}

/** Convenience helper for BreadcrumbList schema. */
export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: toAbsolute(c.path),
    })),
  };
}
