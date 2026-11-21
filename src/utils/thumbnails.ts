import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

/**
 * 記事サムネイルの解決。
 * frontmatter では従来どおり `thumbnail: /thumbnails/xxx.png` と書き、実ファイルは
 * src/assets/thumbnails/ に置く。astro:assets 経由にすることでビルド時に WebP/AVIF へ変換・リサイズされる。
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
    '../assets/thumbnails/*.{png,jpg,jpeg,webp,avif,gif}',
    { eager: true },
);

const byFileName = new Map(
    Object.entries(modules).map(([path, mod]) => [path.split('/').pop() as string, mod.default]),
);

/** `/thumbnails/xxx.png` を ImageMetadata に解決する。該当がなければ undefined（外部URLなど）。 */
export function resolveThumbnail(path?: string): ImageMetadata | undefined {
    if (!path?.startsWith('/thumbnails/')) return undefined;
    return byFileName.get(path.slice('/thumbnails/'.length));
}

/**
 * クライアント側（QuadtreeThumbnail など）で使う、指定幅に縮小した WebP の URL を返す。
 * 解決できないパスはそのまま返す。
 */
export async function thumbnailUrl(path: string | undefined, width: number): Promise<string> {
    if (!path) return '';
    const image = resolveThumbnail(path);
    if (!image) return path;
    const result = await getImage({ src: image, width: Math.min(width, image.width), format: 'webp' });
    return result.src;
}
