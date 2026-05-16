import { getCollection, type CollectionEntry } from 'astro:content';

export type TalkEntry = CollectionEntry<'talks'>;

/** All talk entries (drafts included). Used by /talks for full timeline rendering. */
export async function getAllTalks(): Promise<TalkEntry[]> {
    return await getCollection('talks');
}

/**
 * Talks whose slide pages are accessible in the current environment.
 * In production, draft entries are hidden from /slides/[slug] (they 404).
 * In dev, everything is previewable.
 */
export async function getPublishedTalks(): Promise<TalkEntry[]> {
    return await getCollection('talks', ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true;
    });
}

/** The URL slug for a talk: explicit `slug` frontmatter wins, otherwise filename id. */
export function talkSlug(entry: TalkEntry): string {
    // Astro consumes `slug` from frontmatter as `entry.slug` (the auto-route slug),
    // which is why `entry.data.slug` is undefined when only frontmatter sets it.
    const explicit = entry.data.slug || (entry as { slug?: string }).slug;
    return explicit || entry.id.replace(/\.mdx?$/, '');
}

/**
 * True when the entry contains MDX slide content.
 * Convention: .mdx files carry slide bodies; .md files are frontmatter-only
 * stubs (upcoming events or external-only entries).
 */
export function hasSlideBody(entry: TalkEntry): boolean {
    return entry.id.endsWith('.mdx');
}
