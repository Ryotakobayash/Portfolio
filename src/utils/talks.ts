import { getCollection, type CollectionEntry } from 'astro:content';
import { isProductionDeploy } from './env';

export type TalkEntry = CollectionEntry<'talks'>;

/** All talk entries (drafts included). Used by /talks for full timeline rendering. */
export async function getAllTalks(): Promise<TalkEntry[]> {
    return await getCollection('talks');
}

/**
 * Talks whose slide pages are accessible in the current environment.
 * 本番公開環境では `published: true` のものだけが /slides/[slug] で表示され、それ以外は 404 になる。
 * フラグがなければ非公開のまま（フェイルセーフ）。
 * 開発サーバーと Vercel の Preview Deployment ではすべて表示し、公開前のレビューに使う。
 * 判定の詳細は `isProductionDeploy()` と docs/talk-preview-review.md を参照。
 */
export async function getPublishedTalks(): Promise<TalkEntry[]> {
    const hideDrafts = isProductionDeploy();
    return await getCollection('talks', ({ data }) => {
        return hideDrafts ? data.published === true : true;
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
