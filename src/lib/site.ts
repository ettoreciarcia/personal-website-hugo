import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  title: 'Ettore Ciarcia',
  description: 'Kubernetes & Cloud Engineer. Notes on Kubernetes, cloud, homelab and AI.',
  url: 'https://ettoreciarcia.com',
};

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

export function readingTime(body: string | undefined): number {
  const words = (body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
