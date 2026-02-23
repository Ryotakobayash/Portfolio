import { useState } from 'react';

interface Props {
    title: string;
    url: string;
}

export default function ShareButtons({ title, url }: Props) {
    const [copied, setCopied] = useState(false);

    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);

    const shareLinks = [
        {
            label: 'X / Twitter',
            shortLabel: 'X',
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        },
        {
            label: 'Hatena Bookmark',
            shortLabel: 'はてブ',
            href: `https://b.hatena.ne.jp/add?mode=confirm&url=${encodedUrl}&title=${encodedTitle}`,
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const btnStyle: React.CSSProperties = {
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 12px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'transparent',
        color: 'var(--color-text-muted)',
        fontSize: '0.65rem', fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        textDecoration: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        transition: 'border-color 120ms ease, color 120ms ease',
        lineHeight: '1.8',
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '16px 0',
            borderTop: '1px solid var(--color-border)',
        }}>
            <span style={{
                fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: 'var(--color-text-muted)',
                marginRight: '4px',
            }}>
                Share
            </span>

            {shareLinks.map((link) => (
                <a
                    key={link.shortLabel}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    style={btnStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                >
                    {link.shortLabel}
                </a>
            ))}

            <button
                onClick={handleCopy}
                title="Copy URL"
                style={{
                    ...btnStyle,
                    borderColor: copied ? 'var(--color-primary)' : 'var(--color-border)',
                    color: copied ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
                onMouseEnter={(e) => {
                    if (!copied) {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!copied) {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                    }
                }}
            >
                {copied ? 'Copied ✓' : 'Copy URL'}
            </button>
        </div>
    );
}
