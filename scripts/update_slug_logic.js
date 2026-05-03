import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/pages/og/[slug].png.ts',
  'src/pages/tags/[tag].astro',
  'src/pages/posts/[slug].astro',
  'src/pages/index.astro',
  'src/pages/posts/index.astro',
  'src/pages/me.astro',
  'src/pages/api/pv/ranking.ts',
  'src/pages/api/pv/treemap.ts'
];

for (const relPath of filesToUpdate) {
  const filePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Regex to match anything like <var>.id.replace(/\.mdx?$/, '')
  // and replace with (<var>.data.slug || <var>.id.replace(/\.mdx?$/, ''))
  content = content.replace(/(\w+)\.id\.replace\(\/\\\.mdx\?\$\/,\s*''\)/g, "($1.data.slug || $1.id.replace(/\\.mdx?$/, ''))");

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${relPath}`);
}
