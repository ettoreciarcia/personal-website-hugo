import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, SITE } from '../lib/site';

// Served at /index.xml, the same path Hugo used, so existing feed subscriptions keep working.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.date,
      link: `/publication/${p.id}/`,
      categories: [p.data.category, ...p.data.tags],
    })),
  });
}
