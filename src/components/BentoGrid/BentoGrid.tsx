import { ReactNode } from 'react';
import styles from './BentoGrid.module.css';

interface BentoGridProps {
    children: ReactNode;
}

/**
 * Bento Gridレイアウトコンテナ
 * CSS Gridを使用した3カラムレイアウト（レスポンシブ対応）
 */
export function BentoGrid({ children }: BentoGridProps) {
    return (
        <div className={styles.bentoGrid}>
            {children}
        </div>
    );
}
