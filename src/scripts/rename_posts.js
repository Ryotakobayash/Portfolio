import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'src/content/posts');
const files = fs.readdirSync(postsDir);

for (const file of files) {
  if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const parsed = matter(content);
  const oldSlug = file.replace(/\.mdx?$/, '');
  
  // If slug is already set, skip? No, we might want to ensure it's set.
  if (!parsed.data.slug) {
    parsed.data.slug = oldSlug;
  }

  // Generate new filename: YYYYMMDD_Title.md
  // Date might be like "2026-03-08" or "2026-01-XX". Let's get it from frontmatter.
  const rawDate = parsed.data.date;
  let dateStr = "";
  if (rawDate) {
    if (rawDate instanceof Date) {
      // pad month and date
      const yyyy = rawDate.getFullYear();
      const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
      const dd = String(rawDate.getDate()).padStart(2, '0');
      dateStr = `${yyyy}${mm}${dd}`;
    } else {
      dateStr = String(rawDate).replace(/[-/]/g, '').slice(0, 8);
    }
  } else {
    // extract from oldSlug if it starts with date
    const match = oldSlug.match(/^(\d{8})_/);
    if (match) dateStr = match[1];
    else dateStr = "99999999";
  }

  let title = parsed.data.title || "Untitled";
  // Sanitize title for filename
  title = title.replace(/[\/\?:*"<>|]/g, '-').replace(/\s+/g, '_');
  
  const ext = path.extname(file);
  const newFilename = `${dateStr}_${title}${ext}`;
  
  const newContent = matter.stringify(parsed.content, parsed.data);
  
  // Only rename if it's different
  if (file !== newFilename) {
    console.log(`Renaming ${file} -> ${newFilename}`);
    const newFilePath = path.join(postsDir, newFilename);
    fs.writeFileSync(filePath, newContent, 'utf-8'); // Update content first
    fs.renameSync(filePath, newFilePath);
  } else {
    // Just update content
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}
console.log('Done renaming files and adding slugs.');
