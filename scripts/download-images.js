#!/usr/bin/env node

/**
 * 画像ダウンロード・最適化スクリプト
 * 
 * 機能:
 * 1. content/posts/*.md から外部画像URLを抽出
 * 2. 画像をダウンロードして public/images/posts/ に保存
 * 3. Markdownファイル内の画像パスを更新
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const POSTS_DIR = path.join(process.cwd(), 'content/posts');
const IMAGES_DIR = path.join(process.cwd(), 'public/images/posts');

// 外部画像URLのパターン
const IMAGE_URL_PATTERN = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;

/**
 * ディレクトリを作成（存在しない場合）
 */
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
}

/**
 * URLから画像をダウンロード（リダイレクト対応）
 */
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        const request = (currentUrl) => {
            const currentProtocol = currentUrl.startsWith('https') ? https : http;

            currentProtocol.get(currentUrl, (response) => {
                // リダイレクトの場合は新しいURLで再試行
                if (response.statusCode === 301 || response.statusCode === 302) {
                    const redirectUrl = response.headers.location;
                    if (!redirectUrl) {
                        reject(new Error('Redirect without location header'));
                        return;
                    }

                    // 相対URLの場合は絶対URLに変換
                    const absoluteUrl = redirectUrl.startsWith('http')
                        ? redirectUrl
                        : new URL(redirectUrl, currentUrl).href;

                    console.log(`   🔄 Redirecting to: ${absoluteUrl}`);
                    request(absoluteUrl);
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                    return;
                }

                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                fs.unlink(filepath, () => { }); // 失敗時はファイル削除
                reject(err);
            });
        };

        request(url);
    });
}

/**
 * URLからファイル名を生成
 */
function generateFilename(url, index) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || '.jpg';
    const basename = path.basename(pathname, ext);

    // ファイル名をサニタイズ
    const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, '_');

    return `${sanitized}_${index}${ext}`;
}

/**
 * 記事ごとに画像を処理
 */
async function processPost(filename) {
    const filepath = path.join(POSTS_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');

    const slug = path.basename(filename, '.md');
    const postImageDir = path.join(IMAGES_DIR, slug);

    ensureDir(postImageDir);

    let updatedContent = content;
    let imageIndex = 0;
    const matches = [...content.matchAll(IMAGE_URL_PATTERN)];

    if (matches.length === 0) {
        console.log(`⏭️  ${filename}: No external images found`);
        return;
    }

    console.log(`\n📄 Processing: ${filename}`);
    console.log(`   Found ${matches.length} external images`);

    for (const match of matches) {
        const [fullMatch, alt, url] = match;

        // 既にローカルパスの場合はスキップ
        if (!url.startsWith('http')) {
            continue;
        }

        imageIndex++;
        const filename = generateFilename(url, imageIndex);
        const localPath = path.join(postImageDir, filename);
        const relativePath = `/images/posts/${slug}/${filename}`;

        try {
            console.log(`   ⬇️  Downloading: ${url}`);
            await downloadImage(url, localPath);
            console.log(`   ✅ Saved: ${relativePath}`);

            // Markdown内のURLを更新
            const newImageTag = `![${alt}](${relativePath})`;
            updatedContent = updatedContent.replace(fullMatch, newImageTag);

        } catch (error) {
            console.error(`   ❌ Failed to download ${url}:`, error.message);
        }

        // レート制限対策: 少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 更新されたMarkdownを保存
    if (updatedContent !== content) {
        fs.writeFileSync(filepath, updatedContent, 'utf-8');
        console.log(`   💾 Updated markdown file`);
    }
}

/**
 * メイン処理
 */
async function main() {
    console.log('🚀 Starting image download script...\n');

    ensureDir(IMAGES_DIR);

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

    console.log(`Found ${files.length} markdown files\n`);

    for (const file of files) {
        try {
            await processPost(file);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    }

    console.log('\n✨ Done!');
}

main().catch(console.error);
