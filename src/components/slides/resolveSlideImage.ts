// スライド用画像の解決
// src/assets/talks/ 配下の画像はパス文字列で指定しても import 済みの ImageMetadata に変換し、
// astro:assets による最適化を効かせる。それ以外（public 配下・外部 URL）は文字列のまま返す。
const talkImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/talks/**/*.{png,jpg,jpeg,webp,gif,avif,svg}',
  { eager: true },
);

const ASSET_DIR = 'assets/talks/';

export function resolveSlideImage(src: string | ImageMetadata): string | ImageMetadata {
  if (typeof src !== 'string') return src;

  // "../../assets/talks/xxx/yyy.png" や "/src/assets/talks/..." を glob のキー形式にそろえる
  const index = src.indexOf(ASSET_DIR);
  if (index === -1) return src;

  const key = `/src/${src.slice(index)}`;
  const image = talkImages[key];
  if (!image) {
    throw new Error(`スライド画像が見つかりません: ${src}（${key}）`);
  }
  return image.default;
}
