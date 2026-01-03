import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

/** 記事ディレクトリのパス */
const postsDirectory = path.join(process.cwd(), 'content/posts');

/** 記事のメタデータ型 */
export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt?: string;
    tags: string[];
}

/** 記事の完全データ型 */
export interface Post extends PostMeta {
    contentHtml: string;
}

/** タグと件数の型 */
export interface TagCount {
    tag: string;
    count: number;
}

/**
 * 全記事のメタデータを取得（日付降順）
 */
export async function getAllPosts(): Promise<PostMeta[]> {
    // ディレクトリが存在しない場合は空配列を返す
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
        .map((fileName) => {
            const slug = fileName.replace(/\.(md|mdx)$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);

            // タグを配列として取得（未定義の場合は空配列）
            const tags = Array.isArray(data.tags) ? data.tags : [];

            return {
                slug,
                title: data.title || slug,
                date: data.date || '',
                excerpt: data.excerpt || '',
                tags,
            } as PostMeta;
        });

    // 日付降順でソート
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });
}

/**
 * スラッグから単一記事を取得
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const mdPath = path.join(postsDirectory, `${slug}.md`);
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`);

    let fullPath = '';
    if (fs.existsSync(mdPath)) {
        fullPath = mdPath;
    } else if (fs.existsSync(mdxPath)) {
        fullPath = mdxPath;
    } else {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Markdown→HTML変換（GFMサポート：テーブル、打ち消し線など）
    const processedContent = await remark().use(gfm).use(html).process(content);
    const contentHtml = processedContent.toString();

    // タグを配列として取得
    const tags = Array.isArray(data.tags) ? data.tags : [];

    return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        excerpt: data.excerpt || '',
        tags,
        contentHtml,
    };
}

/**
 * 記事数を取得（ダッシュボード用）
 */
export function getPostCount(): number {
    if (!fs.existsSync(postsDirectory)) {
        return 0;
    }

    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.filter(
        (fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx')
    ).length;
}

/**
 * 全タグと各タグの記事数を取得
 */
export async function getAllTags(): Promise<TagCount[]> {
    const posts = await getAllPosts();
    const tagMap = new Map<string, number>();

    posts.forEach((post) => {
        post.tags.forEach((tag) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
    });

    // タグ名でソート
    return Array.from(tagMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * 指定タグを持つ記事を取得
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
    const posts = await getAllPosts();
    return posts.filter((post) => post.tags.includes(tag));
}
