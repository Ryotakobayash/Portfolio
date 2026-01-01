import '@mantine/core/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';

// カスタムテーマ設定
const theme = createTheme({
    /** ダッシュボード向けのテーマをここでカスタマイズ */
    primaryColor: 'cyan',
    defaultRadius: 'md',
});

export const metadata: Metadata = {
    title: 'Dashboard Portfolio',
    description: 'ダッシュボード型ポートフォリオサイト',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja" suppressHydrationWarning>
            <head>
                <ColorSchemeScript defaultColorScheme="dark" />
            </head>
            <body suppressHydrationWarning>
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
