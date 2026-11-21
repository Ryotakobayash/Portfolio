import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * YYYY-MM-DD 形式の日付文字列。
 * 形式の揺れ（2026/03/01 など）や、存在しない日付（2026-02-30 など）をビルド時にエラーにする。
 */
const isoDate = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で指定してください（例: 2026-03-01）')
    .refine((value) => {
        const [y, m, d] = value.split('-').map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
    }, '存在しない日付です');

const postsCollection = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
    schema: z.object({
        title: z.string(),
        date: isoDate,
        updatedDate: isoDate.optional(),
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
        date: isoDate,
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
