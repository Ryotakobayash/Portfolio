export interface PostData {
    slug: string;
    title: string;
    tags: string[];
    wordCount: number;
    date: string;
}

/** タグ→色のパレット — レトロフューチャー設計システム準拠 */
const TAG_COLORS: Record<string, string> = {
    // 日本語タグ
    'デザイン': '#7B5E52', // テラコッタ茶
    'デザインシステム': '#5C7F71', // プライマリグリーン
    'ガジェット': '#4A7A8A', // スレートティール
    '参加ログ': '#A03030', // アクセントレッド (旧イベント・EventReport)
    'ハッカソン': '#C07050', // アクセントオレンジ
    '大学生活': '#7A5C8A', // ダスティパープル
    '学習法': '#5C7F71', // プライマリグリーン
    '就活': '#C99040', // アクセントアンバー
    'PC環境': '#4A7A8A', // スレートティール
    // 英語タグ
    'Hugo': '#8A6A3A', // ウォームブラウン
    'HTML/CSS': '#4A7A8A', // スレートティール
    'Figma': '#7A5C8A', // ダスティパープル
    'NUTMEG': '#5C7F71', // プライマリグリーン
    // 汎用フォールバック
    'Design': '#7B5E52',
    'Tech': '#4A7A8A',
    'Blog': '#8A6A3A',
};

const DIVERSE_COLORS = [
    '#5C7F71', '#A03030', '#4A7A8A', '#C07050', '#7A5C8A', '#C99040',
    '#7B5E52', '#8A6A3A', '#445566', '#6A8A5C', '#8A4A5C', '#5C6A8A',
    '#A08030', '#307080', '#704060', '#508050', '#806040', '#606080',
    '#808050', '#705070', '#507080', '#8A5A4A', '#4A8A6A', '#6A4A8A'
];

function hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

export function getTagColor(tag: string): string {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
    for (const [key, color] of Object.entries(TAG_COLORS)) {
        if (tag.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return DIVERSE_COLORS[hashCode(tag) % DIVERSE_COLORS.length];
}

/** 「ジャンルで見る」用データ — タグで階層化し、categoricalパレットで色分け */
export function buildGenreData(
    posts: PostData[],
): any[] {
    const groups: Record<string, PostData[]> = {};
    for (const post of posts) {
        const primaryTag = post.tags[0] || 'Other';
        if (!groups[primaryTag]) groups[primaryTag] = [];
        groups[primaryTag].push(post);
    }

    const data: any[] = [];

    // 親ノード（タグ）— グループの色を設定
    for (const tag of Object.keys(groups)) {
        data.push({
            id: `tag_${tag}`,
            name: tag,
            color: getTagColor(tag),
        });
    }

    // 子ノード（記事）— 面積は文字数、色は親から継承
    for (const [tag, groupPosts] of Object.entries(groups)) {
        for (const post of groupPosts) {
            data.push({
                parent: `tag_${tag}`,
                name: post.title,
                value: post.wordCount || 100,
                color: getTagColor(tag),
                slug: post.slug,
                primaryTag: tag,
            });
        }
    }

    return data;
}



/** 使用されているタグ一覧を取得 */
export function getUsedTags(posts: PostData[]): string[] {
    const tags = new Set<string>();
    for (const post of posts) {
        if (post.tags[0]) tags.add(post.tags[0]);
    }
    return Array.from(tags).sort();
}
