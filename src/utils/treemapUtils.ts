export interface PostData {
    slug: string;
    title: string;
    tags: string[];
    wordCount: number;
    date: string;
}

/** タグでグルーピングし、アクセス数でcolorValueを設定するデータ */
export function buildTagGroupData(
    posts: PostData[],
    pvMap: Record<string, number>,
    mode: 'pv' | 'wordCount',
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
            const sizeValue = mode === 'pv' ? pv : (post.wordCount || 100);
            
            data.push({
                parent: `tag_${tag}`,
                name: post.title,
                value: sizeValue,
                colorValue: pv, // 常にPVで色付け（アクセス数ハイコントラスト用）
                slug: post.slug,
                primaryTag: tag,
            });
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
