'use client';

import Link from 'next/link';
import { AppShell, Group, Title, ActionIcon, useMantineColorScheme, Container } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';

interface DashboardShellProps {
    children: ReactNode;
}

/**
 * ダッシュボード用AppShellレイアウト
 * - ヘッダー: ロゴ（TOPへリンク）、カラースキーム切り替え
 * - メイン: Bento Gridコンテンツ
 */
export function DashboardShell({ children }: DashboardShellProps) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [mounted, setMounted] = useState(false);

    // クライアント側でのみマウント状態を更新
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = colorScheme === 'dark';

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Container size="xl" h="100%">
                    <Group h="100%" justify="space-between">
                        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Title order={3} style={{ cursor: 'pointer' }}>📊 Dashboard Portfolio</Title>
                        </Link>
                        {/* mountedを待ってからカラースキーム依存のUIをレンダリング */}
                        {mounted && (
                            <ActionIcon
                                variant="outline"
                                color={isDark ? 'yellow' : 'blue'}
                                onClick={() => toggleColorScheme()}
                                title="カラースキーム切り替え"
                                size="lg"
                            >
                                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
                            </ActionIcon>
                        )}
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                <Container size="xl">
                    {children}
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}
