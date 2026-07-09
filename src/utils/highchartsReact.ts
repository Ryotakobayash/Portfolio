import HighchartsReactImport from 'highcharts-react-official';
import type { HighchartsReactRefObject } from 'highcharts-react-official';

// highcharts-react-official は UMD バンドルのため、dev の SSR(Node の CJS interop)では
// default import がモジュール全体({ HighchartsReact, default })に化けて
// "Element type is invalid" で island が丸ごと落ちる。
// 環境差を吸収してコンポーネント本体を取り出した上で re-export する。
export const HighchartsReact = ((HighchartsReactImport as any).default ??
    HighchartsReactImport) as typeof HighchartsReactImport;

export type { HighchartsReactRefObject };
