#!/usr/bin/env node
/**
 * Claude Code の PostToolUse フック
 *
 * Claude が src/content/posts/ または src/content/talks/ の md / mdx を編集・作成したら、
 * そのファイルに textlint（AI 的な言い回しの検出）をかけ、指摘を Claude に返す。
 * 指摘があっても編集は止めない。言い換えるかどうかは proofread-ja スキルの手順で判断する。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const TARGET = /\/src\/content\/(posts|talks)\/[^/]+\.mdx?$/;

function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

const input = readInput();
const filePath = input.tool_response?.filePath ?? input.tool_input?.file_path;
if (!filePath || !TARGET.test(filePath) || !existsSync(filePath)) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const textlint = path.join(root, 'node_modules/.bin/textlint');
if (!existsSync(textlint)) process.exit(0);

let results;
try {
  const out = execFileSync(textlint, ['--format', 'json', filePath], { cwd: root, encoding: 'utf8' });
  results = JSON.parse(out);
} catch (error) {
  // 指摘があると textlint は終了コード 1 で終わるが、標準出力に結果が入っている
  try {
    results = JSON.parse(error.stdout ?? '');
  } catch {
    process.exit(0);
  }
}

const messages = results.flatMap((r) => r.messages);
if (messages.length === 0) process.exit(0);

const relative = path.relative(root, filePath);
const lines = messages.map((m) => `- ${m.line}:${m.column} ${m.message}`);
const context = [
  `textlint（AI 的な言い回しの検出）で ${relative} に ${messages.length} 件の指摘があります。`,
  'proofread-ja スキルの手順に従い、今回 Claude が書いた・書き換えた箇所の指摘だけを言い換えてください。ユーザーが書いた既存の文章は勝手に直さず、件数だけ伝えてください。',
  ...lines,
].join('\n');

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context } }),
);
