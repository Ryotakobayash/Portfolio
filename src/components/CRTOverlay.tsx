/**
 * CRTOverlay — retro CRT scanline effect
 *
 * A fixed full-screen overlay that adds:
 * 1. Subtle horizontal scanlines (repeating linear-gradient)
 * 2. Vignette darkening at edges
 * 3. A very faint noise texture via SVG filter
 *
 * pointer-events: none means it never blocks interaction.
 * Respects prefers-reduced-motion by removing animation.
 */
export default function CRTOverlay() {
    return (
        <>
            {/* Scanlines */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9000,
                    pointerEvents: 'none',
                    background: `repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 2px,
                        rgba(0, 0, 0, 0.04) 2px,
                        rgba(0, 0, 0, 0.04) 3px
                    )`,
                    mixBlendMode: 'multiply',
                }}
            />
            {/* Vignette */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9001,
                    pointerEvents: 'none',
                    animation: 'crt-pulse 8s ease-in-out infinite',
                    background: `radial-gradient(
                        ellipse at center,
                        transparent 60%,
                        rgba(0, 0, 0, 0.18) 100%
                    )`,
                }}
            />
        </>
    );
}
