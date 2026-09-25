import externalData from '../data/external-posts.json';

export type ExternalService = 'zenn' | 'note' | 'hatena';

export interface ExternalPost {
    service: ExternalService;
    title: string;
    url: string;
    date: string; // YYYY-MM-DD
}

/**
 * RSSの pubDate 文字列を YYYY-MM-DD (JST) に変換
 */
function parsePubDateToYMD(pubDateStr: string): string {
    const d = new Date(pubDateStr);
    if (Number.isNaN(d.getTime())) return '';
    // 日本時間 (JST = UTC+9) で YYYY-MM-DD を生成
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(0, 10);
}

/**
 * note の RSS 2.0 XML から記事一覧を抽出
 */
function parseNoteRss(xmlText: string): ExternalPost[] {
    const items: ExternalPost[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xmlText)) !== null) {
        const itemXml = match[1];

        // title の抽出（CDATA または通常テキスト）
        const titleMatch = /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/.exec(itemXml);
        // link の抽出
        const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemXml);
        // pubDate の抽出
        const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemXml);

        const title = (titleMatch ? (titleMatch[1] || titleMatch[2]) : '').trim();
        const url = (linkMatch ? linkMatch[1] : '').trim();
        const pubDate = (pubDateMatch ? pubDateMatch[1] : '').trim();

        if (url && title) {
            const date = parsePubDateToYMD(pubDate);
            items.push({
                service: 'note',
                title,
                url,
                date: date || 'Past Article',
            });
        }
    }

    return items;
}

/**
 * note アカウントの RSS から公開記事をフェッチ
 */
export async function fetchNotePosts(): Promise<ExternalPost[]> {
    const NOTE_RSS_URL = 'https://note.com/tender_hyssop572/rss';

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(NOTE_RSS_URL, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Ryota-Personal-Site-FeedFetcher/1.0',
            },
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            console.warn(`[fetchNotePosts] RSS取得失敗 HTTP ${res.status}`);
            return [];
        }

        const xmlText = await res.text();
        return parseNoteRss(xmlText);
    } catch (err) {
        console.warn('[fetchNotePosts] note RSS取得中にエラーが発生しました（フォールバックします）:', err);
        return [];
    }
}

/**
 * 静的JSONデータと note RSS データを統合し、重複排除した全外部記事を取得
 */
export async function getAllExternalPosts(): Promise<ExternalPost[]> {
    const notePosts = await fetchNotePosts();
    const staticPosts = (externalData.posts || []) as ExternalPost[];

    const seenUrls = new Set<string>();
    const merged: ExternalPost[] = [];

    // 1. 最新の RSS 取得記事を追加（正確な日付を持つ最新 note）
    for (const post of notePosts) {
        if (!seenUrls.has(post.url)) {
            seenUrls.add(post.url);
            merged.push(post);
        }
    }

    // 2. 静的JSON の記事（Zenn や RSS 件数上限外の過去 note）を追加
    for (const post of staticPosts) {
        if (!seenUrls.has(post.url)) {
            seenUrls.add(post.url);
            merged.push(post);
        }
    }

    // 日付降順ソート
    merged.sort((a, b) => b.date.localeCompare(a.date));
    return merged;
}
