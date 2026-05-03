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

const DEFAULT_COLOR = '#6B6050'; // muted border tone

export function getTagColor(tag: string): string {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
    for (const [key, color] of Object.entries(TAG_COLORS)) {
        if (tag.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return DEFAULT_COLOR;
}

/** タグでグルーピングするデータ */
export function buildTagGroupData(
    posts: PostData[],
    pvMap: Record<string, number>,
    mode: 'genre' | 'pv',
): any[] {
    const groups: Record<string, PostData[]> = {};
    for (const post of posts) {
        const primaryTag = post.tags[0] || 'Other';
        if (!groups[primaryTag]) groups[primaryTag] = [];
        groups[primaryTag].push(post);
    }

    const data: any[] = [];

    // 親ノード（タグ）
    for (const tag of Object.keys(groups)) {
        data.push({
            id: `tag_${tag}`,
            name: tag,
        });
    }

    // 子ノード（記事）
    for (const [tag, groupPosts] of Object.entries(groups)) {
        for (const post of groupPosts) {
            const pv = pvMap[post.slug] || 1;
            const sizeValue = post.wordCount || 100; // 面積は常に文字数
            
            const point: any = {
                parent: `tag_${tag}`,
                name: post.title,
                value: sizeValue,
                slug: post.slug,
                primaryTag: tag,
            };

            if (mode === 'pv') {
                point.colorValue = pv; // PV数（sequential palette）
            } else {
                point.color = getTagColor(tag); // ジャンル（categorical palette）
            }

            data.push(point);
        }
    }

    return data;
}

/** 時系列グルーピングのデータ */
export function buildTimelineData(
    posts: PostData[],
    pvMap: Record<string, number>,
): any[] {
    // 年月でグルーピングし、parent-child 構造にする
    const groups: Record<string, PostData[]> = {};
    for (const post of posts) {
        const ym = post.date.slice(0, 7); // "2024-06"
        if (!groups[ym]) groups[ym] = [];
        groups[ym].push(post);
    }

    const data: any[] = [];

    // 親ノード（年月）
    for (const ym of Object.keys(groups).sort()) {
        data.push({
            id: ym,
            name: ym,
        });
    }

    // 子ノード（記事）
    for (const [ym, groupPosts] of Object.entries(groups)) {
        for (const post of groupPosts) {
            const primaryTag = post.tags[0] || 'Other';
            const pv = pvMap[post.slug] || 1;
            data.push({
                name: post.title,
                parent: ym,
                value: pv,
                colorValue: pv,
                slug: post.slug,
                primaryTag,
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
