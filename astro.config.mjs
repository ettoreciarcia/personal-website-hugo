import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

export default defineConfig({
  site: 'https://ettoreciarcia.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  redirects: legacyRedirects,
  integrations: [sitemap()],
  image: {
    // Some articles embed long animated GIFs that exceed sharp's default pixel budget.
    service: { entrypoint: 'astro/assets/services/sharp', config: { limitInputPixels: false } },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
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
