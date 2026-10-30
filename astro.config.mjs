import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Legacy Hugo paths that must keep resolving (see README "URL compatibility").
// Static output can't enumerate dynamic redirects, so the paginated Hugo URLs are listed by hand.
const legacyRedirects = {
  '/talks/': '/event/',
  '/project/': '/projects/',
  '/certification/': '/certifications/',
  '/posts/': '/publication/',
  '/tags/homealab/': '/tags/homelab/',
  '/event/page/1/': '/event/',
  '/project/page/1/': '/projects/',
  ...Object.fromEntries([1, 2, 3].map((n) => [`/publication/page/${n}/`, '/publication/'])),
  ...Object.fromEntries([1, 2, 3].map((n) => [`/certification/page/${n}/`, '/certifications/'])),
};

// Sitemap <lastmod> for articles and talks, read from each entry's front matter date.
const SITE_URL = 'https://ettoreciarcia.com';
const lastmod = new Map();
for (const [dir, prefix] of [['blog', 'publication'], ['talks', 'event']]) {
  const base = `./src/content/${dir}`;
  for (const slug of fs.readdirSync(base)) {
    const file = `${base}/${slug}/index.md`;
    if (!fs.existsSync(file)) continue;
    const date = fs.readFileSync(file, 'utf8').match(/^date:\s*['"]?([\d-]+)/m)?.[1];
    if (date) lastmod.set(`${SITE_URL}/${prefix}/${slug}/`, new Date(date).toISOString());
  }
}
// Pages marked noindex in their <Base> must not be advertised in the sitemap either.
const NOINDEX = [/\/search\/$/, /\/tags\//, /\/404\/?$/];

export default defineConfig({
  site: 'https://ettoreciarcia.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  redirects: legacyRedirects,
  integrations: [
    sitemap({
      filter: (page) => !NOINDEX.some((re) => re.test(page)),
      serialize: (item) => (lastmod.has(item.url) ? { ...item, lastmod: lastmod.get(item.url) } : item),
    }),
  ],
  image: {
    // Some articles embed long animated GIFs that exceed sharp's default pixel budget.
    service: { entrypoint: 'astro/assets/services/sharp', config: { limitInputPixels: false } },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
