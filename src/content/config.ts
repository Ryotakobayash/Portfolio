import { defineCollection, reference, z } from 'astro:content';

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

const slidesCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.string(),
        event: z.string().optional(),
        description: z.string().optional(),
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
        // Exactly one of embedUrl (Speaker Deck) or slides (local MDX) is expected.
        embedUrl: z.string().url().optional(),
        externalUrl: z.string().url().optional(),
        slides: reference('slides').optional(),
    }),
});

export const collections = {
    posts: postsCollection,
    slides: slidesCollection,
    talks: talksCollection,
};
