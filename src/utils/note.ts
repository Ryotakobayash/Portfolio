/**
 * note (https://note.com) の RSS フィードを取得してパースするユーティリティ。
 * 外部ライブラリを増やさないため、RSS 2.0 の <item> を軽量な正規表現で抽出する。
 */

const NOTE_USERNAME = 'tender_hyssop572';
const NOTE_RSS_URL = `https://note.com/${NOTE_USERNAME}/rss`;

export interface NotePost {
    service: 'note';
    title: string;
    url: string;
    /** YYYY-MM-DD */
    date: string;
}

/** CDATA / 基本的な HTML エンティティを取り除く */
function decode(raw: string): string {
    return raw
        .replace(/^<!\[CDATA\[/, '')
        .replace(/\]\]>$/, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .trim();
}

function pickTag(block: string, tag: string): string | null {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
    return m ? decode(m[1]) : null;
}

/** RFC822 の pubDate を YYYY-MM-DD へ。パース不能なら null。 */
function toISODate(pubDate: string | null): string | null {
    if (!pubDate) return null;
    const t = Date.parse(pubDate);
    if (Number.isNaN(t)) return null;
    return new Date(t).toISOString().slice(0, 10);
}

/**
 * note RSS を取得してパースする。取得・パース失敗時は空配列を返す（呼び出し側でフォールバック）。
 */
export async function fetchNotePosts(): Promise<NotePost[]> {
    const res = await fetch(NOTE_RSS_URL, {
        headers: { 'User-Agent': 'Portfolio-App' },
        // note 側の一時的な遅延で SSR が固まらないよう保険をかける
        signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
        throw new Error(`note RSS request failed: ${res.status}`);
    }

    const xml = await res.text();
    const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

    const posts: NotePost[] = [];
    for (const item of items) {
        const title = pickTag(item, 'title');
        const url = pickTag(item, 'link');
        const date = toISODate(pickTag(item, 'pubDate'));
        if (title && url && date) {
            posts.push({ service: 'note', title, url, date });
        }
    }
    return posts;
}
