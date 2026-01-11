import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/components/Layout';
import { Container, Group, Badge } from '@mantine/core';
import { IconArrowLeft, IconCalendar, IconClock } from '@tabler/icons-react';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/markdown';
import { CodeCopyButton } from '@/components/CodeCopyButton';
import { ImageZoom } from '@/components/ImageZoom';
import styles from './prose.module.css';

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * 静的パラメータ生成（SSG用）
 */
export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

/**
 * メタデータ生成（SEO用）
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Not Found | Dashboard Portfolio',
        };
    }

    return {
        title: `${post.title} | Dashboard Portfolio`,
        description: post.excerpt || `${post.title}の記事ページ`,
    };
}

/**
 * 記事詳細ページ
 * MarkdownをHTMLに変換して表示
 */
export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // 関連記事を取得
    const relatedPosts = await getRelatedPosts(slug, post.tags, 3);

    return (
        <DashboardShell>
            <Container size="md" py="xl">
                {/* 戻るリンク */}
                <Group mb="lg">
                    <Link href="/posts" className={styles.backLink}>
                        <Group gap="xs">
                            <IconArrowLeft size={16} />
                            記事一覧に戻る
                        </Group>
                    </Link>
                </Group>

                {/* 記事ヘッダー */}
                <header className={styles.articleHeader}>
                    <h1 className={styles.articleTitle}>{post.title}</h1>
                    <div className={styles.articleMeta}>
                        <IconCalendar size={16} />
                        <span>{post.date}</span>
                        <span className={styles.metaSeparator}>•</span>
                        <IconClock size={16} />
                        <span>{post.readingTimeMinutes}分で読めます</span>
                    </div>
                    {post.tags.length > 0 && (
                        <Group gap="xs" mt="sm">
                            {post.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/tags/${encodeURIComponent(tag)}`}
                                >
                                    <Badge
                                        size="sm"
                                        variant="light"
                                        color="cyan"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {tag}
                                    </Badge>
                                </Link>
                            ))}
                        </Group>
                    )}
                </header>

                {/* 目次 */}
                {post.toc.length > 0 && (
                    <nav className={styles.tableOfContents}>
                        <h2 className={styles.tocTitle}>目次</h2>
                        <ul className={styles.tocList}>
                            {post.toc.map((item) => (
                                <li
                                    key={item.id}
                                    className={styles.tocItem}
                                    style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
                                >
                                    <a href={`#${item.id}`} className={styles.tocLink}>
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                {/* 記事本文 */}
                <article
                    className={styles.prose}
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />

                {/* コードブロックコピーボタン */}
                <CodeCopyButton />

                {/* 画像ズーム機能 */}
                <ImageZoom />

                {/* 関連記事 */}
                {relatedPosts.length > 0 && (
                    <section className={styles.relatedPosts}>
                        <h2 className={styles.relatedTitle}>関連記事</h2>
                        <div className={styles.relatedGrid}>
                            {relatedPosts.map((related) => (
                                <Link
                                    key={related.slug}
                                    href={`/posts/${related.slug}`}
                                    className={styles.relatedCard}
                                >
                                    <span className={styles.relatedDate}>{related.date}</span>
                                    <span className={styles.relatedName}>{related.title}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </Container>
        </DashboardShell>
    );
}

