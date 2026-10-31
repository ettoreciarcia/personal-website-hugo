import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  title: 'Ettore Ciarcia',
  description: 'Kubernetes & Cloud Engineer. Notes on Kubernetes, cloud, homelab and AI.',
  url: 'https://ettoreciarcia.com',
};

/** schema.org Person for the site owner; referenced by id from other JSON-LD blocks. */
export const PERSON_ID = `${SITE.url}/#person`;
export function personLd(p: {
  name: string;
  role: string;
  organization: { name: string; url: string };
  profiles: { url: string }[];
  interests: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: p.name,
    url: SITE.url,
    image: `${SITE.url}/og-default.png`,
    jobTitle: p.role,
    worksFor: { '@type': 'Organization', name: p.organization.name, url: p.organization.url },
    sameAs: p.profiles.map((x) => x.url).filter((u) => u.startsWith('http')),
    knowsAbout: ['Kubernetes', 'Cloud Native', 'CNCF', 'Infrastructure as Code', 'Terraform', 'Linux', ...p.interests],
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: new URL(it.path, SITE.url).href })),
  };
}

export const NAV = [
  { label: 'Writing', href: '/publication/' },
  { label: 'Talks', href: '/event/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Certifications', href: '/certifications/' },
  { label: 'Experience', href: '/experience/' },
];

/** Same slug rules Hugo used for taxonomy URLs, so /tags/<x>/ keeps resolving. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-z0-9\-/]/g, '');
}

export function formatDate(d: Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(d);
}

export function formatMonthYear(d: Date) {
  return formatDate(d, { year: 'numeric', month: 'long' });
}

const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort(byDateDesc);
}

/** Shared tags first, then category, then publication date. Never suggest unrelated posts. */
export function relatedPosts(post: CollectionEntry<'blog'>, posts: CollectionEntry<'blog'>[]) {
  const tags = new Set(post.data.tags.map(slugify));
  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      post: candidate,
      sharedTags: [...new Set(candidate.data.tags.map(slugify))].filter((tag) => tags.has(tag)).length,
      sameCategory: Number(candidate.data.category === post.data.category),
    }))
    .filter((candidate) => candidate.sharedTags > 0 || candidate.sameCategory > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags || b.sameCategory - a.sameCategory || byDateDesc(a.post, b.post) || a.post.id.localeCompare(b.post.id))
    .slice(0, 3)
    .map((candidate) => candidate.post);
}

export async function getTalks() {
  return (await getCollection('talks')).sort(byDateDesc);
}

export async function getProjects() {
  return (await getCollection('projects')).sort(byDateDesc);
}

export async function getCertifications() {
  return (await getCollection('certifications')).sort(byDateDesc);
}

export type Tagged = CollectionEntry<'blog'> | CollectionEntry<'projects'> | CollectionEntry<'certifications'>;

/** All tags across the tagged collections with their entries, keyed by slug. */
export async function getTagIndex() {
  const entries: Tagged[] = [...(await getPosts()), ...(await getProjects()), ...(await getCertifications())];
  const index = new Map<string, { name: string; entries: Tagged[] }>();
  for (const e of entries) {
    for (const tag of e.data.tags) {
      const slug = slugify(tag);
      const bucket = index.get(slug) ?? { name: tag, entries: [] };
      bucket.entries.push(e);
      index.set(slug, bucket);
    }
  }
  for (const b of index.values()) b.entries.sort(byDateDesc);
  return index;
}

export function entryHref(e: Tagged): string {
  switch (e.collection) {
    case 'blog':
      return `/publication/${e.id}/`;
    case 'projects':
      return `/project/${e.id}/`;
    case 'certifications':
      return `/certification/${e.id}/`;
  }
}

/** Extracts id and start second from youtu.be / youtube.com URLs; undefined for anything else. */
export function parseYouTube(url: string | undefined): { id: string; start: number } | undefined {
  if (!url) return undefined;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return undefined;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') id = u.pathname.slice(1);
  else if (host === 'youtube.com') id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|live|shorts)\/([^/]+)/)?.[1] ?? null;
  if (!id || !/^[\w-]{11}$/.test(id)) return undefined;
  const t = u.searchParams.get('t') ?? u.searchParams.get('start') ?? '0';
  const start = /^\d+$/.test(t)
    ? Number(t)
    : [...t.matchAll(/(\d+)([hms])/g)].reduce((s, [, n, unit]) => s + Number(n) * ({ h: 3600, m: 60, s: 1 } as const)[unit as 'h' | 'm' | 's'], 0);
  return { id, start };
}

export function readingTime(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
