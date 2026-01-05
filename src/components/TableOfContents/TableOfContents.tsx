'use client';

import { TocItem } from '@/lib/markdown';
import { Paper, Title, Anchor, Stack } from '@mantine/core';
import styles from './TableOfContents.module.css';

interface TableOfContentsProps {
    toc: TocItem[];
}

/**
 * 目次コンポーネント
 * 記事の見出しから自動生成されたTOCを表示
 */
export function TableOfContents({ toc }: TableOfContentsProps) {
    if (toc.length === 0) {
        return null;
    }

    return (
        <Paper p="md" withBorder className={styles.toc}>
            <Title order={4} mb="sm">
                目次
            </Title>
            <Stack gap="xs">
                {toc.map((item) => (
                    <Anchor
                        key={item.id}
                        href={`#${item.id}`}
                        className={styles.tocLink}
                        style={{
                            paddingLeft: `${(item.level - 2) * 1}rem`,
                        }}
                    >
                        {item.text}
                    </Anchor>
                ))}
            </Stack>
        </Paper>
    );
}
