import Highcharts from 'highcharts';
import HighchartsReactImport from 'highcharts-react-official';
import type { HighchartsReactRefObject } from 'highcharts-react-official';

/**
 * accessibility モジュールの読み込み完了を表す Promise。
 * 描画の途中でモジュールが後から組み込まれると、再描画のたびに動く networkgraph などで
 * 「Cannot read properties of undefined (reading 'enabled')」が起きるため、
 * 再描画が続くグラフはこれを待ってから描画する。
 */
export const highchartsAccessibilityReady: Promise<void> =
    typeof window === 'undefined'
        ? Promise.resolve()
        : import('highcharts/modules/accessibility')
              .then((mod) => {
                  const init = (mod as any).default || mod;
                  if (typeof init === 'function') init(Highcharts);
              })
              .catch(() => {});

// highcharts-react-official は UMD バンドルのため、dev の SSR(Node の CJS interop)では
// default import がモジュール全体({ HighchartsReact, default })に化けて
// "Element type is invalid" で island が丸ごと落ちる。
// 環境差を吸収してコンポーネント本体を取り出した上で re-export する。
export const HighchartsReact = ((HighchartsReactImport as any).default ??
    HighchartsReactImport) as typeof HighchartsReactImport;

export type { HighchartsReactRefObject };
