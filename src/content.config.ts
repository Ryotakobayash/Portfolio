import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        excerpt: z.string().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().optional().default(false),
        slug: z.string().optional(),
        thumbnail: z.string().optional(),
    }),
});

const talksCollection = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/talks' }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        event: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()).default([]),
        // Opt-in publish flag. Missing/false keeps the slide URL non-public in prod —
        // safer than a draft flag whose absence accidentally exposes work in progress.
        published: z.boolean().optional().default(false),
        slug: z.string().optional(),
        // External slide service (Speaker Deck etc.) — used when the file has no MDX body.
        embedUrl: z.url().optional(),
        // Event page (connpass, peatix, etc.) — used as fallback link or for Upcoming cards.
        externalUrl: z.url().optional(),
    }),
});

export const collections = {
    posts: postsCollection,
    talks: talksCollection,
};
