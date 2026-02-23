interface Props {
    /** Number of columns in the dot grid */
    cols?: number;
    /** Number of rows in the dot grid */
    rows?: number;
    /** Size of each dot in px */
    dotSize?: number;
    /** Gap between dots in px */
    gap?: number;
    /** Opacity 0-1 */
    opacity?: number;
    /** Extra inline styles for the wrapper */
    style?: React.CSSProperties;
    /** Extra className for the wrapper */
    className?: string;
}

/**
 * DotGrid — punch-card style dot grid decoration
 *
 * Renders an SVG grid of tiny squares to evoke
 * 1960s punch-card / technical drawing aesthetics.
 * Uses currentColor so it inherits the parent text color.
 */
export default function DotGrid({
    cols = 24,
    rows = 6,
    dotSize = 2,
    gap = 8,
    opacity = 0.18,
    style,
    className,
}: Props) {
    const width = cols * (dotSize + gap) - gap;
    const height = rows * (dotSize + gap) - gap;

    return (
        <svg
            aria-hidden="true"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={{ display: 'block', opacity, ...style }}
        >
            {Array.from({ length: rows }, (_, row) =>
                Array.from({ length: cols }, (_, col) => (
                    <rect
                        key={`${row}-${col}`}
                        x={col * (dotSize + gap)}
                        y={row * (dotSize + gap)}
                        width={dotSize}
                        height={dotSize}
                        fill="currentColor"
                    />
                ))
            )}
        </svg>
    );
}
