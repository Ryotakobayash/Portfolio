import { useState } from 'react';

interface Props {
    title: string;
    url: string;
}

/**
 * 記事シェアボタン コンポーネント
 * X (Twitter), はてなブックマーク, URLコピー
 */
export default function ShareButtons({ title, url }: Props) {
    const [copied, setCopied] = useState(false);

    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);

    const shareLinks = [
        {
            label: 'X',
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            icon: '𝕏',
            color: '#000000',
        },
        {
            label: 'はてブ',
            href: `https://b.hatena.ne.jp/add?mode=confirm&url=${encodedUrl}&title=${encodedTitle}`,
            icon: 'B!',
            color: '#00A4DE',
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // フォールバック
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '16px 0',
            borderTop: '1px solid var(--color-border)',
        }}>
            <span style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--color-text-muted)', marginRight: '4px',
            }}>
                Share:
            </span>

            {shareLinks.map((link) => (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${link.label}でシェア`}
                    style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'background-color 150ms ease, transform 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = link.color;
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                        e.currentTarget.style.color = 'var(--color-text)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {link.icon}
                </a>
            ))}

            {/* URLコピーボタン */}
            <button
                onClick={handleCopy}
                title="URLをコピー"
                style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                    backgroundColor: copied ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                    color: copied ? '#fff' : 'var(--color-text)',
                    border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 700,
                    transition: 'all 150ms ease',
                }}
            >
                {copied ? '✓' : '🔗'}
            </button>

            {/* コピー完了トースト */}
            {copied && (
                <span style={{
                    fontSize: '0.75rem', color: 'var(--color-accent)',
                    fontWeight: 500, animation: 'fadeIn 200ms ease',
                }}>
                    コピーしました！
                </span>
            )}
        </div>
    );
}
