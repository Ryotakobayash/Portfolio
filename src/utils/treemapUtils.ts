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

function hexToRgb(hex: string): [number, number, number] {
    const cleaned = hex.replace('#', '');
    const num = parseInt(cleaned, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * PV数に応じてタグカラーの濃度（不透明度・明度）を変調
 * - PVが多いほど鮮やかで濃く、少ないほど淡いトーンに
 */
export function adjustColorByPV(
    baseHex: string,
    pv: number,
    maxPV: number,
): string {
    const [r, g, b] = hexToRgb(baseHex);
    if (maxPV <= 0) {
        return `rgba(${r}, ${g}, ${b}, 0.75)`;
    }

    // PVの偏りを均すため対数スケールで 0.0〜1.0 に正規化
    const ratio = Math.log1p(pv) / Math.log1p(maxPV);
    // 不透明度を 0.35 (低PV) 〜 1.0 (高PV) にマッピング
    const alpha = 0.35 + ratio * 0.65;

    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/** 「ジャンルで見る」用データ — タグで階層化し、2変数（面積=文字数、色濃度=PV）で可視化 */
export function buildGenreData(
    posts: PostData[],
    pvMap: Record<string, number> = {},
): any[] {
    const groups: Record<string, PostData[]> = {};
    for (const post of posts) {
        const primaryTag = post.tags[0] || 'Other';
        if (!groups[primaryTag]) groups[primaryTag] = [];
        groups[primaryTag].push(post);
    }

    // PV の最大値を算出
    let maxPV = 0;
    for (const post of posts) {
        const shortSlug = post.slug.replace(/^\d{8}_/, '');
        const pv = pvMap[post.slug] ?? pvMap[shortSlug] ?? 0;
        if (pv > maxPV) maxPV = pv;
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

    // 子ノード（記事）— 面積は文字数、色の濃度はPV数
    for (const [tag, groupPosts] of Object.entries(groups)) {
        const baseColor = getTagColor(tag);
        for (const post of groupPosts) {
            const shortSlug = post.slug.replace(/^\d{8}_/, '');
            const pv = pvMap[post.slug] ?? pvMap[shortSlug] ?? 0;
            const itemColor = adjustColorByPV(baseColor, pv, maxPV);

            data.push({
                parent: `tag_${tag}`,
                name: post.title,
                value: post.wordCount || 100,
                color: itemColor,
                slug: post.slug,
                primaryTag: tag,
                pv: pv,
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
