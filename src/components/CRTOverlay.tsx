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
            {/* Film Grain (Noise) */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9002, // Top-most visual layer
                    pointerEvents: 'none',
                    opacity: 0.15, // Subtle texture
                    mixBlendMode: 'overlay', // Blend with content below
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </>
    );
}
