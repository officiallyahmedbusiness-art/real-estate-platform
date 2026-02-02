import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "out",
  ".turbo",
]);

const patterns = [
  { name: "cursor-text", regex: /cursor-text/g },
  { name: "cursor: text", regex: /cursor\s*:\s*text/g },
  { name: "caret-color", regex: /caret-color/g },
  { name: "contenteditable", regex: /contenteditable/gi },
  { name: "[contenteditable", regex: /\[contenteditable/gi },
  { name: ".prose", regex: /\.prose\b/g },
  { name: "select-none", regex: /select-none/g },
  { name: "user-select", regex: /user-select/g },
];

const results = patterns.map((pattern) => ({
  ...pattern,
  count: 0,
  hits: [],
}));

function shouldIgnore(dirName) {
  return IGNORE_DIRS.has(dirName);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (shouldIgnore(entry.name)) continue;
      walk(path.join(dir, entry.name));
      continue;
    }

    const filePath = path.join(dir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    if (![".ts", ".tsx", ".js", ".jsx", ".css", ".md"].includes(ext)) continue;

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      results.forEach((pattern) => {
        pattern.regex.lastIndex = 0;
        const matches = line.match(pattern.regex);
        if (!matches) return;
        pattern.count += matches.length;
        if (pattern.hits.length < 20) {
          pattern.hits.push({
            file: path.relative(ROOT, filePath),
            line: index + 1,
            text: line.trim().slice(0, 240),
          });
        }
      });
    });
  }
}

walk(ROOT);

console.log(`Scan root: ${ROOT}`);
results.forEach((pattern) => {
  console.log(`\n[${pattern.name}] count: ${pattern.count}`);
  if (pattern.hits.length === 0) return;
  pattern.hits.forEach((hit) => {
    console.log(` - ${hit.file}:${hit.line} ${hit.text}`);
  });
});
