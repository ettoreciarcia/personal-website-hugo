import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

// Keep the folder name verbatim as the entry id so URLs match the old Hugo site exactly
// (Astro's default would turn `07-homelab2.0` into `07-homelab20`).
const byFolder = (base: string) => glob({ pattern: '**/index.md', base, generateId: ({ entry }) => entry.replace(/\/index\.md$/, '') });

export const CATEGORIES = ['Cloud & Kubernetes', 'Homelab', 'Personal', 'AI'] as const;

const blog = defineCollection({
  loader: byFolder('./src/content/blog'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      summary: z.string(),
      category: z.enum(CATEGORIES),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      draft: z.boolean().default(false),
      links: z
        .object({
          code: z.url().optional(),
          slides: z.string().optional(),
          video: z.url().optional(),
        })
        .default({}),
    }).refine((post) => !post.updated || post.updated >= post.date, {
      message: 'updated must be on or after the publication date',
      path: ['updated'],
    }),
});

const talks = defineCollection({
  loader: byFolder('./src/content/talks'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      event: z.string(),
      eventUrl: z.url().optional(),
      location: z.string().optional(),
      date: z.coerce.date(),
      summary: z.string(),
      image: image().optional(),
      links: z
        .object({
          code: z.url().optional(),
          slides: z.string().optional(),
          video: z.url().optional(),
        })
        .default({}),
    }),
});

const projects = defineCollection({
  loader: byFolder('./src/content/projects'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      link: z.string().optional(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      featured: z.object({
        order: z.number().int().nonnegative(),
        challenge: z.string().min(1),
        solution: z.string().min(1),
        outcome: z.string().min(1),
      }).optional(),
    }),
});

const certifications = defineCollection({
  loader: byFolder('./src/content/certifications'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      link: z.url(),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
    }),
});

const events = defineCollection({
  loader: file('./src/data/events.yaml'),
  schema: z.object({
    id: z.string(),
    date: z.string(),
    name: z.string(),
    location: z.string(),
    role: z.enum(['Speaker', 'Attendee']),
  }),
});

export const collections = { blog, talks, projects, certifications, events };
