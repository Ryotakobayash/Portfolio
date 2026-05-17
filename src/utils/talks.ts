import { getCollection, type CollectionEntry } from 'astro:content';

export type TalkEntry = CollectionEntry<'talks'>;

/** All talk entries (drafts included). Used by /talks for full timeline rendering. */
export async function getAllTalks(): Promise<TalkEntry[]> {
    return await getCollection('talks');
}

/**
 * Talks whose slide pages are accessible in the current environment.
 * In production, only entries with `published: true` are reachable at /slides/[slug];
 * everything else 404s. Failsafe: missing the flag keeps the slide non-public.
 * In dev, everything is previewable so drafts can be checked locally.
 */
export async function getPublishedTalks(): Promise<TalkEntry[]> {
    return await getCollection('talks', ({ data }) => {
        return import.meta.env.PROD ? data.published === true : true;
    });
}

/** The URL slug for a talk: explicit `slug` frontmatter wins, otherwise the entry id (filename without extension). */
export function talkSlug(entry: TalkEntry): string {
    return entry.data.slug || entry.id;
}

/**
 * True when the entry contains MDX slide content.
 * Convention: .mdx files carry slide bodies; .md files are frontmatter-only
 * stubs (upcoming events or external-only entries).
 */
export function hasSlideBody(entry: TalkEntry): boolean {
    return entry.filePath?.endsWith('.mdx') ?? false;
}
