// スクリーンリーダーの読み上げ内容をプレビューするためのユーティリティ
// ブラウザの本物のアクセシビリティツリーは JS から読めないため、
// DOM を読み上げ順に走査し、主要な要素の「役割」と「読み上げられる名前」を近似的に取り出す。

export type SrTone = 'normal' | 'muted' | 'warn';

export interface SrLine {
  depth: number;
  role: string;
  text: string;
  tone: SrTone;
}

const HEADING_RE = /^H([1-6])$/;
const CODE_PREVIEW_LENGTH = 80;

// display:none / visibility:hidden / aria-hidden / hidden 属性のものは読み上げられない
function isHiddenFromAT(el: Element): boolean {
  if (el.closest('[aria-hidden="true"], [hidden]')) return true;
  const style = getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden';
}

// 読み上げ対象のテキストだけを連結する（非表示の子要素は除く）
function visibleText(el: Element): string {
  let text = '';
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? '';
    } else if (node instanceof Element && !isHiddenFromAT(node)) {
      if (node.tagName === 'IMG') {
        const alt = node.getAttribute('alt');
        if (alt) text += alt;
      } else {
        text += node.getAttribute('aria-label') ?? visibleText(node);
      }
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

// 役割を持たない純粋なインライン要素（span・strong・code など）か
const ROLE_TAGS = new Set(['A', 'BUTTON', 'IMG', 'SVG', 'CANVAS', 'INPUT', 'SELECT', 'TEXTAREA']);
function isPlainInline(el: Element): boolean {
  if (ROLE_TAGS.has(el.tagName.toUpperCase()) || el.hasAttribute('role')) return false;
  if (el.querySelector('a, button, img, svg, canvas, input, select, textarea')) return false;
  return getComputedStyle(el).display.startsWith('inline');
}

function accessibleName(el: Element): string {
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((target): target is HTMLElement => !!target)
      .map((target) => visibleText(target))
      .join(' ');
    if (text) return text;
  }
  return el.getAttribute('aria-label')?.trim() || visibleText(el);
}

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function describeForScreenReader(root: Element): SrLine[] {
  const lines: SrLine[] = [];
  const push = (depth: number, role: string, text: string, tone: SrTone = 'normal') => {
    lines.push({ depth, role, text, tone });
  };

  // インライン要素の連続（span など）は、読み上げでも一続きになるので1行にまとめる
  function walk(el: Element, depth: number) {
    let inline = '';
    const flush = () => {
      const text = inline.replace(/\s+/g, ' ').trim();
      if (text) push(depth, 'テキスト', text);
      inline = '';
    };
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        inline += node.textContent ?? '';
        continue;
      }
      if (!(node instanceof Element) || isHiddenFromAT(node)) continue;
      if (isPlainInline(node)) {
        inline += visibleText(node);
        continue;
      }
      flush();
      visit(node, depth);
    }
    flush();
  }

  function visit(el: Element, depth: number) {
    // SVG 要素は tagName が小文字で返るためそろえる
    const tag = el.tagName.toUpperCase();
    const heading = HEADING_RE.exec(tag);

    if (heading) {
      push(depth, `見出し${heading[1]}`, accessibleName(el));
      return;
    }

    switch (tag) {
      case 'IMG': {
        const alt = el.getAttribute('alt');
        if (alt === null) push(depth, '画像', '代替テキストがありません', 'warn');
        else if (alt === '') push(depth, '画像', '装飾として読み飛ばされます', 'muted');
        else push(depth, '画像', alt);
        return;
      }
      case 'SVG':
      case 'CANVAS': {
        const name = el.getAttribute('aria-label');
        if (name) push(depth, '画像', name);
        return;
      }
      case 'P':
        push(depth, '段落', visibleText(el));
        return;
      case 'A':
        push(depth, 'リンク', accessibleName(el));
        return;
      case 'BUTTON':
        push(depth, 'ボタン', accessibleName(el));
        return;
      case 'UL':
      case 'OL': {
        const items = Array.from(el.children).filter((li) => li.tagName === 'LI' && !isHiddenFromAT(li));
        push(depth, 'リスト', `${items.length}項目`, 'muted');
        for (const item of items) visitListItem(item, depth + 1);
        return;
      }
      case 'DL': {
        push(depth, '説明リスト', '', 'muted');
        for (const child of el.querySelectorAll('dt, dd')) {
          if (isHiddenFromAT(child)) continue;
          const role = child.tagName === 'DT' ? '用語' : '説明';
          // 中にリストなどのブロックを含む場合は、構造を保ったまま字下げして続ける
          if (child.querySelector('ul, ol, p, figure, table')) {
            push(depth + 1, role, '', 'muted');
            walk(child, depth + 2);
          } else {
            push(depth + 1, role, visibleText(child));
          }
        }
        return;
      }
      case 'FIGURE': {
        const caption = el.querySelector(':scope > figcaption');
        push(depth, '図', caption ? visibleText(caption) : '', caption ? 'normal' : 'muted');
        for (const child of el.children) {
          if (child !== caption && !isHiddenFromAT(child)) visit(child, depth + 1);
        }
        return;
      }
      case 'BLOCKQUOTE':
        push(depth, '引用', '', 'muted');
        walk(el, depth + 1);
        return;
      case 'TABLE': {
        const rows = el.querySelectorAll('tr').length;
        const cols = el.querySelector('tr')?.children.length ?? 0;
        push(depth, '表', `${rows}行 × ${cols}列`);
        return;
      }
      case 'PRE':
        push(depth, 'コード', truncate(visibleText(el), CODE_PREVIEW_LENGTH));
        return;
      default:
        walk(el, depth);
    }
  }

  // 箇条書きの項目: 直下のテキストは1行にまとめ、入れ子のリストは字下げして続ける
  function visitListItem(li: Element, depth: number) {
    const nested = Array.from(li.children).filter((c) => (c.tagName === 'UL' || c.tagName === 'OL') && !isHiddenFromAT(c));
    let text = '';
    for (const node of li.childNodes) {
      if (node instanceof Element && nested.includes(node)) continue;
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? '';
      else if (node instanceof Element && !isHiddenFromAT(node)) text += visibleText(node);
    }
    push(depth, '項目', text.replace(/\s+/g, ' ').trim());
    for (const list of nested) visit(list, depth + 1);
  }

  walk(root, 0);
  return lines.filter((line) => line.text || line.tone === 'muted');
}

// スライド切り替え時に通知する名前。見出しがなければ画像の alt、それもなければ空
export function slideLabel(slide: Element | undefined): string {
  if (!slide) return '';
  const heading = slide.querySelector('h1, h2, h3');
  if (heading) {
    const text = visibleText(heading);
    if (text) return text;
  }
  const img = slide.querySelector('img[alt]:not([alt=""])');
  return img?.getAttribute('alt') ?? '';
}

export function renderSrPreview(target: HTMLElement, announce: string, lines: SrLine[]) {
  const list = document.createElement('ol');
  list.className = 'sr-preview-list';

  const addRow = (role: string, text: string, tone: SrTone, depth: number) => {
    const li = document.createElement('li');
    li.className = 'sr-preview-row';
    li.dataset.tone = tone;
    li.style.setProperty('--depth', String(depth));
    const roleEl = document.createElement('span');
    roleEl.className = 'sr-preview-role';
    roleEl.textContent = role;
    const textEl = document.createElement('span');
    textEl.className = 'sr-preview-text';
    textEl.textContent = text;
    li.append(roleEl, textEl);
    list.append(li);
  };

  addRow('切り替え時', announce, 'muted', 0);
  if (lines.length === 0) addRow('—', '読み上げる内容がありません', 'warn', 0);
  for (const line of lines) addRow(line.role, line.text, line.tone, line.depth);

  target.replaceChildren(list);
}
