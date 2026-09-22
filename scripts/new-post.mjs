#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const postsDir = path.join(projectRoot, 'src', 'content', 'posts');

// ヘルプ表示
function showHelp() {
    console.log(`
📝 ブログ記事新規作成スクリプト

使用方法:
  pnpm new:post [タイトル] [オプション]

オプション:
  --title, -t    記事タイトル
  --slug, -s     画像フォルダ・ファイル名用の英語スラッグ（英数字・ハイフン）
  --tags         タグ（カンマ区切り、例: "Astro,TypeScript"）
  --date, -d     日付（YYYY-MM-DD形式、デフォルトは本日）
  --help, -h     このヘルプを表示

実行例:
  pnpm new:post
  pnpm new:post "新しい技術についての調査メモ"
  pnpm new:post "Webフォントの勉強会" --slug "webfont-study" --tags "Web,Font"
`);
}

// JSTの日付文字列を取得 (YYYY-MM-DD & YYYYMMDD)
function getDateStrings(targetDate = new Date()) {
    const jstOffset = 9 * 60; // UTC+9
    const utc = targetDate.getTime() + targetDate.getTimezoneOffset() * 60000;
    const jstDate = new Date(utc + jstOffset * 60000);

    const yyyy = jstDate.getFullYear();
    const mm = String(jstDate.getMonth() + 1).padStart(2, '0');
    const dd = String(jstDate.getDate()).padStart(2, '0');

    return {
        formatted: `${yyyy}-${mm}-${dd}`,
        compact: `${yyyy}${mm}${dd}`,
    };
}

// スラッグのサニタイズ（英数字、ハイフン、アンダースコアのみ残す）
function sanitizeSlug(input) {
    if (!input) return '';
    return input
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '');
}

// 対話的プロンプト
async function promptInput(query, defaultValue = '') {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        const displayQuery = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
        rl.question(displayQuery, (answer) => {
            rl.close();
            resolve(answer.trim() || defaultValue);
        });
    });
}

// 引数のパース
function parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
        title: '',
        slug: '',
        tags: [],
        date: '',
        help: false,
    };

    let positionalTitle = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--help' || arg === '-h') {
            parsed.help = true;
            return parsed;
        } else if (arg === '--title' || arg === '-t') {
            parsed.title = args[++i] || '';
        } else if (arg === '--slug' || arg === '-s') {
            parsed.slug = args[++i] || '';
        } else if (arg === '--tags') {
            const rawTags = args[++i] || '';
            parsed.tags = rawTags.split(',').map((t) => t.trim()).filter(Boolean);
        } else if (arg === '--date' || arg === '-d') {
            parsed.date = args[++i] || '';
        } else if (!arg.startsWith('-')) {
            positionalTitle.push(arg);
        }
    }

    if (!parsed.title && positionalTitle.length > 0) {
        parsed.title = positionalTitle.join(' ');
    }

    return parsed;
}

async function main() {
    const args = parseArgs();

    if (args.help) {
        showHelp();
        process.exit(0);
    }

    let title = args.title;
    let slug = args.slug;
    let tags = args.tags;
    let dateStr = args.date;

    const isInteractive = !title;

    if (isInteractive) {
        console.log('\n🚀 新しいブログ記事の作成\n');
        while (!title) {
            title = await promptInput('? 記事タイトル (必須)');
            if (!title) console.log('⚠️  タイトルは必須です。もう一度入力してください。');
        }

        const autoSlugCandidate = sanitizeSlug(title);
        slug = await promptInput('? 画像フォルダ・識別用スラッグ (英数字推奨、省略可)', autoSlugCandidate);

        const tagsInput = await promptInput('? タグ (カンマ区切り、例: Tech, Astro)', 'Tech');
        tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // 日付の確定
    let dates;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dates = {
            formatted: dateStr,
            compact: dateStr.replace(/-/g, ''),
        };
    } else {
        dates = getDateStrings();
    }

    // スラッグとフォルダ・ファイル名の確定
    const cleanSlug = sanitizeSlug(slug);
    const hasCleanSlug = cleanSlug.length > 0;

    // ファイル名ルール: YYYYMMDD_<タイトルまたはスラッグ>.md
    // 既存リポジトリの傾向: 日本語タイトルの記事は `YYYYMMDD_日本語タイトル.md`、英数字記事は `YYYYMMDD_slug.md`
    const fileBaseName = title.replace(/[\\/:*?"<>|]/g, '').trim();
    const fileName = `${dates.compact}_${fileBaseName}.md`;
    const targetFilePath = path.join(postsDir, fileName);

    // 画像フォルダ名ルール: YYYYMMDD_<slug>
    const imageDirName = `${dates.compact}_${hasCleanSlug ? cleanSlug : (sanitizeSlug(title) || 'assets')}`;
    const targetImageDirPath = path.join(postsDir, imageDirName);

    // 重複チェック
    if (fs.existsSync(targetFilePath)) {
        console.error(`\n❌ エラー: 同名ファイルが既に存在します:\n   ${targetFilePath}\n`);
        process.exit(1);
    }

    // 記事本文テンプレート生成
    const tagsYaml = (tags.length > 0 ? tags : ['Tech'])
        .map((tag) => `  - ${tag}`)
        .join('\n');

    const contentTemplate = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${dates.formatted}"
excerpt: ""
tags:
${tagsYaml}
draft: true
---

<!--
【画像保管・執筆ガイド】
1. 画像の保存場所:
   - この記事専用の画像フォルダ: ./${imageDirName}/
   - 画像ファイルをこのフォルダに配置してください。

2. Markdownでの画像記法（CustomImageコンポーネント連動）:
   ![スクリーンリーダー用代替テキスト](./${imageDirName}/sample.png "画面に表示される図表タイトル")
   - "タイトル" を記述すると、自動的に「図N: タイトル」という連番キャプションが付与されます。
   - "タイトル" を省略した場合は、[ALT] テキストがキャプションとして表示されます。
   - 縦長画像は max-height: 60vh で自動調整されます。

3. 記事の公開:
   - 執筆中は \`draft: true\` のままにしておきます。
   - 完成して本番公開する際に \`draft: false\` に変更（または削除）してください。
-->

ここから本文を記述します...
`;

    // ファイル書き込み
    if (!fs.existsSync(postsDir)) {
        fs.mkdirSync(postsDir, { recursive: true });
    }
    fs.writeFileSync(targetFilePath, contentTemplate, 'utf-8');

    // 画像フォルダ作成（.gitkeep配置）
    if (!fs.existsSync(targetImageDirPath)) {
        fs.mkdirSync(targetImageDirPath, { recursive: true });
        fs.writeFileSync(
            path.join(targetImageDirPath, '.gitkeep'),
            '# This directory holds images for the blog post.\n',
            'utf-8'
        );
    }

    console.log('\n✨ 記事の雛形を作成しました！\n');
    console.log(`📄 記事ファイル:   src/content/posts/${fileName}`);
    console.log(`🖼️  画像フォルダ:   src/content/posts/${imageDirName}/`);
    console.log('\n💡 ヒント:');
    console.log(`   画像は \`./${imageDirName}/\` 配下に保存し、以下のように参照します:`);
    console.log(`   ![説明文](./${imageDirName}/xxx.png "図表タイトル")\n`);
}

main().catch((err) => {
    console.error('予期せぬエラーが発生しました:', err);
    process.exit(1);
});
