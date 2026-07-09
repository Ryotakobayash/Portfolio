import { useEffect, useRef, useState } from 'react';

interface QuadtreeThumbnailProps {
    src: string;
    alt?: string;
    viewTransitionName?: string;
    animateOnLoad?: boolean;
    /**
     * true の場合、この要素はサムネイル本体ではなく SSR 済み <img> の上に被せる
     * 演出専用のオーバーレイとして振る舞う。
     * - 自前の実画像 <img> とローディングプレースホルダーを描画しない（SSR img と二重表示になるため）
     * - ルート要素は絶対配置で親（SSR img と同じ箱）いっぱいに広がる
     */
    ssrImageOverlay?: boolean;
}

interface QuadNode {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    variance: number;
    depth: number;
    children?: [QuadNode, QuadNode, QuadNode, QuadNode];
}

export default function QuadtreeThumbnail({
    src,
    alt = '',
    viewTransitionName,
    animateOnLoad = true,
    ssrImageOverlay = false,
}: QuadtreeThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [animationDone, setAnimationDone] = useState(!animateOnLoad);
    const [showRealImage, setShowRealImage] = useState(!animateOnLoad);

    // SSR時は何もしない
    useEffect(() => {
        if (!animateOnLoad) {
            setImageLoaded(true);
            return;
        }

        const img = new Image();
        let cancelAnimation: (() => void) | undefined;
        img.src = src;
        img.onload = () => {
            setImageLoaded(true);
            cancelAnimation = runQuadtreeAnimation(img);
        };
        img.onerror = () => {
            // エラー時はアニメーションをスキップして実画像を表示する設定にする
            setAnimationDone(true);
            setShowRealImage(true);
        };

        return () => {
            // クリーンアップ処理(View Transitions での離脱時に rAF を取り残さない)
            img.onload = null;
            img.onerror = null;
            cancelAnimation?.();
        };
    }, [src, animateOnLoad]);

    const runQuadtreeAnimation = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 計算高速化のため、低解像度でピクセル解析を行う
        const analyzeWidth = 128;
        const analyzeHeight = Math.round((img.height / img.width) * analyzeWidth);

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = analyzeWidth;
        offscreenCanvas.height = analyzeHeight;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) return;

        // 画像を描画してピクセルデータを取得
        offscreenCtx.drawImage(img, 0, 0, analyzeWidth, analyzeHeight);
        const imgData = offscreenCtx.getImageData(0, 0, analyzeWidth, analyzeHeight);
        const data = imgData.data;

        // Canvasのサイズを物理ピクセルに合わせて設定
        const rect = containerRef.current?.getBoundingClientRect();
        const displayWidth = rect?.width || 800;
        const displayHeight = Math.round((img.height / img.width) * displayWidth);

        canvas.width = displayWidth;
        canvas.height = displayHeight;

        // 平均色と分散の計算
        const getAreaStats = (x: number, y: number, w: number, h: number) => {
            let sumR = 0, sumG = 0, sumB = 0;
            let count = 0;

            for (let cy = y; cy < y + h; cy++) {
                for (let cx = x; cx < x + w; cx++) {
                    const idx = (cy * analyzeWidth + cx) * 4;
                    if (idx < data.length) {
                        sumR += data[idx];
                        sumG += data[idx + 1];
                        sumB += data[idx + 2];
                        count++;
                    }
                }
            }

            const r = count > 0 ? sumR / count : 0;
            const g = count > 0 ? sumG / count : 0;
            const b = count > 0 ? sumB / count : 0;

            let varR = 0, varG = 0, varB = 0;
            for (let cy = y; cy < y + h; cy++) {
                for (let cx = x; cx < x + w; cx++) {
                    const idx = (cy * analyzeWidth + cx) * 4;
                    if (idx < data.length) {
                        varR += Math.pow(data[idx] - r, 2);
                        varG += Math.pow(data[idx + 1] - g, 2);
                        varB += Math.pow(data[idx + 2] - b, 2);
                    }
                }
            }

            const variance = count > 0 ? (varR + varG + varB) / count : 0;
            return {
                color: `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
                variance,
            };
        };

        // 再帰的な四分木構築
        const buildQuadtree = (x: number, y: number, w: number, h: number, depth: number): QuadNode => {
            const stats = getAreaStats(x, y, w, h);
            const node: QuadNode = {
                x,
                y,
                w,
                h,
                color: stats.color,
                variance: stats.variance,
                depth,
            };

            const maxDepth = 6;
            const minSize = 2;
            const threshold = 150; // 色の変化度のしきい値

            if (depth < maxDepth && w > minSize && h > minSize && stats.variance > threshold) {
                const halfW = Math.ceil(w / 2);
                const halfH = Math.ceil(h / 2);

                node.children = [
                    buildQuadtree(x, y, halfW, halfH, depth + 1), // 左上
                    buildQuadtree(x + halfW, y, w - halfW, halfH, depth + 1), // 右上
                    buildQuadtree(x, y + halfH, halfW, h - halfH, depth + 1), // 左下
                    buildQuadtree(x + halfW, y + halfH, w - halfW, h - halfH, depth + 1), // 右下
                ];
            }

            return node;
        };

        const rootNode = buildQuadtree(0, 0, analyzeWidth, analyzeHeight, 0);

        // 描画スケール
        const scaleX = displayWidth / analyzeWidth;
        const scaleY = displayHeight / analyzeHeight;

        // 特定の深度制限で四分木を描画する関数
        const drawQuadtree = (node: QuadNode, maxDepthLimit: number) => {
            if (node.children && node.depth < maxDepthLimit) {
                node.children.forEach(child => drawQuadtree(child, maxDepthLimit));
            } else {
                ctx.fillStyle = node.color;
                // 表示スケールに合わせて矩形を描画
                ctx.fillRect(
                    node.x * scaleX,
                    node.y * scaleY,
                    node.w * scaleX + 0.5, // 隙間を防ぐために少し大きめに描画
                    node.h * scaleY + 0.5
                );
            }
        };

        let currentDepthLimit = 0;
        const maxDrawDepth = 6;
        let lastTime = 0;
        const interval = 120; // 深度が進む間隔 (ms)
        let rAFId: number;

        const animate = (timestamp: number) => {
            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;

            if (elapsed > interval) {
                currentDepthLimit++;
                lastTime = timestamp;
            }

            ctx.clearRect(0, 0, displayWidth, displayHeight);
            drawQuadtree(rootNode, currentDepthLimit);

            if (currentDepthLimit < maxDrawDepth) {
                rAFId = requestAnimationFrame(animate);
            } else {
                // アニメーション完了後のフェード遷移
                setAnimationDone(true);
                // 実画像へのフェードイン開始
                setTimeout(() => {
                    setShowRealImage(true);
                }, 100);
            }
        };

        rAFId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rAFId);
        };
    };

    return (
        <div
            ref={containerRef}
            style={
                ssrImageOverlay
                    ? {
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        viewTransitionName: viewTransitionName,
                    } as React.CSSProperties
                    : {
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16 / 9',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        viewTransitionName: viewTransitionName,
                    } as React.CSSProperties
            }
        >
            {/* 四分木アニメーション用の Canvas */}
            {animateOnLoad && !showRealImage && (
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: animationDone ? 0 : 1,
                        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 2,
                    }}
                />
            )}

            {/* 実画像 (ロード完了後 & アニメーション完了後にフェードイン)
                ssrImageOverlay 時は SSR 済み <img> が既に下に表示されているため描画しない */}
            {!ssrImageOverlay && src && (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: showRealImage ? 1 : 0,
                        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 1,
                    }}
                />
            )}

            {/* プレースホルダー（画像ロード前）— ssrImageOverlay 時は SSR img が既に見えているため不要 */}
            {!ssrImageOverlay && !imageLoaded && (
                <div
                    style={{
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.1em',
                    }}
                >
                    LOADING DIGITAL ASSET...
                </div>
            )}
        </div>
    );
}
