import fs from 'fs';
import path from 'path';
import { getAllPosts } from '../src/lib/markdown';

const SITE_URL = 'https://portfolio-eight-rust-11.vercel.app';
const SITE_TITLE = 'Dashboard Portfolio';
const SITE_DESCRIPTION = 'ryota5884のポートフォリオサイト';

async function generateRSSFeed() {
    const posts = await getAllPosts();

    const rssItems = posts
        .map((post) => {
            const url = `${SITE_URL}/posts/${post.slug}`;
            const pubDate = new Date(post.date).toUTCString();

            return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join('\n      ')}
    </item>`;
        })
        .join('\n');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;

    const outputPath = path.join(process.cwd(), 'public', 'rss.xml');
    fs.writeFileSync(outputPath, rssFeed, 'utf-8');
    console.log(`✓ RSS feed generated: ${outputPath}`);
}

generateRSSFeed().catch(console.error);
