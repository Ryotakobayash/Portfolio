/**
 * OrbitalBackground
 * Abstract concentric orbit rings inspired by 1960s space illustration.
 * Rendered as a fixed SVG layer behind all content.
 */
export default function OrbitalBackground() {
    return (
        <svg
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: '50%',
                right: '-10vw',
                transform: 'translateY(-50%)',
                width: '70vw',
                maxWidth: '800px',
                height: 'auto',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.055,
            }}
            viewBox="0 0 800 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Planet body (static) */}
            <circle cx="400" cy="400" r="80" stroke="currentColor" strokeWidth="1.5" />

            {/* Saturn-like ring (ellipse, tilted, static) */}
            <ellipse cx="400" cy="400" rx="160" ry="40" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />

            {/* Group 1: Inner orbits (rotates clockwise) */}
            <g style={{ transformOrigin: '400px 400px', animation: 'spin-slow 120s linear infinite' }}>
                {/* Orbit 1 */}
                <circle cx="400" cy="400" r="160" stroke="currentColor" strokeWidth="0.75" />
                {/* Satellite dot on orbit 1 */}
                <circle cx="560" cy="400" r="6" fill="currentColor" />

                {/* Orbit 2 */}
                <circle cx="400" cy="400" r="240" stroke="currentColor" strokeWidth="0.5" />
                {/* Satellite dot on orbit 2 */}
                <circle cx="400" cy="160" r="4" fill="currentColor" />
            </g>

            {/* Group 2: Outer orbits (rotates counter-clockwise) */}
            <g style={{ transformOrigin: '400px 400px', animation: 'spin-slow-reverse 180s linear infinite' }}>
                {/* Orbit 3 — dashed */}
                <circle cx="400" cy="400" r="320" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 8" />
                {/* Dot on orbit 3 */}
                <circle cx="80" cy="400" r="3" fill="currentColor" opacity="0.6" />

                {/* Orbit 4 */}
                <circle cx="400" cy="400" r="380" stroke="currentColor" strokeWidth="0.35" />
            </g>

            {/* Crosshair tick marks (compass-rose style, static) */}
            <line x1="400" y1="16" x2="400" y2="36" stroke="currentColor" strokeWidth="1" />
            <line x1="400" y1="764" x2="400" y2="784" stroke="currentColor" strokeWidth="1" />
            <line x1="16" y1="400" x2="36" y2="400" stroke="currentColor" strokeWidth="1" />
            <line x1="764" y1="400" x2="784" y2="400" stroke="currentColor" strokeWidth="1" />

        </svg>
    );
}
