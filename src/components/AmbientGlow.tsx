/**
 * AmbientGlow
 * Plan A: Adds large, heavily blurred color orbs to the deep background
 * to create a rich, warm "ambient glow" effect behind all content.
 */
export default function AmbientGlow() {
    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: -1, // Deepest background layer
            }}
        >
            {/* Primary color glow (Top Left) */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-10%',
                width: '60vw',
                height: '60vw',
                minWidth: '500px',
                minHeight: '500px',
                background: 'var(--color-primary)',
                opacity: 0.12,
                filter: 'blur(120px)',
                borderRadius: '50%',
                animation: 'drift 20s ease-in-out infinite alternate',
            }} />

            {/* Accent color glow (Bottom Right) */}
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '70vw',
                height: '70vw',
                minWidth: '600px',
                minHeight: '600px',
                background: 'var(--color-accent-3)', // Warm orange
                opacity: 0.08,
                filter: 'blur(150px)',
                borderRadius: '50%',
                animation: 'drift-reverse 25s ease-in-out infinite alternate',
            }} />
        </div>
    );
}
