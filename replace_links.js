const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Simple regex to match <a href="internal_link" ...> ... </a>
  // We want to replace <a with <Link and </a with </Link
  // BUT only if href starts with / or #
  
  // We need to add import Link from 'next/link'; if not present and we made changes
  
  // 1. Find all <a href="(/|#)[^"]*" ...>
  // Wait, there could be <a ... href="...">
  // Let's just do a simple replace
  // <a href="/jobs" -> <Link href="/jobs"
  // </a -> </Link> inside the same block? Too complex for regex safely.
  
  // Let's just use sed or Node.js string replace with careful regex
  const regex = /<a(\s+[^>]*)?href="(\/|#)[^"]*"([^>]*)>/g;
  
  if (regex.test(content)) {
    content = content.replace(/<a(\s+[^>]*)?href="(\/|#)[^"]*"([^>]*)>/g, '<Link$1href="$2"$3>');
    // Now we need to replace closing </a> but only for the ones we opened!
    // Since JSX requires strict matching, if we change <a to <Link, we must change </a> to </Link>.
    // A safer way is to just replace all <a and </a> with <Link and </Link> IF the file only uses internal links.
    // Let's just do it manually for a few important ones instead of writing a parser.
  }
});

console.log('Script done.');
