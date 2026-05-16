import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.string(),
        excerpt: z.string().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().optional().default(false),
        slug: z.string().optional(),
    }),
});

const talksCollection = defineCollection({
    type: 'content',
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
        embedUrl: z.string().url().optional(),
        // Event page (connpass, peatix, etc.) — used as fallback link or for Upcoming cards.
        externalUrl: z.string().url().optional(),
    }),
});

export const collections = {
    posts: postsCollection,
    talks: talksCollection,
};
