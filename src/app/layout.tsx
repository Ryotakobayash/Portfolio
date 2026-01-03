import '@mantine/core/styles.css';
import './globals.css';

import type { Metadata } from 'next';
import Script from 'next/script';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { Analytics } from '@vercel/analytics/next';

// Google Tag Manager ID
const GTM_ID = 'GTM-WG6RHC88';

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
                {/* Google Tag Manager */}
                <Script
                    id="gtm-script"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
                    }}
                />
            </head>
            <body suppressHydrationWarning>
                {/* Google Tag Manager (noscript) */}
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    {children}
                </MantineProvider>
                <Analytics />
            </body>
        </html>
    );
}
