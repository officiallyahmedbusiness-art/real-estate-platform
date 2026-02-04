import fs from "node:fs";
import path from "node:path";

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const fieldHelpPath = path.join(process.cwd(), "src", "lib", "fieldHelp.ts");
const fieldHelpSource = fs.readFileSync(fieldHelpPath, "utf8");
const listMatch = fieldHelpSource.match(/const FIELD_HELP_KEYS\s*=\s*\[([\s\S]*?)\];/);
if (!listMatch) {
  console.error("FIELD_HELP_KEYS not found in src/lib/fieldHelp.ts");
  process.exit(1);
}

const keyMatches = [...listMatch[1].matchAll(/\"([^\"]+)\"/g)];
const knownKeys = new Set(keyMatches.map((m) => m[1]));

const files = collectFiles(path.join(process.cwd(), "src"));
const usedKeys = new Set();
const missingKeys = [];
const rawInputs = [];

const helpKeyRegex = /helpKey\s*=\s*["']([^"']+)["']/g;
const rawInputRegex = /<(Input|Select|Textarea)\\b[^>]*>/g;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");

  helpKeyRegex.lastIndex = 0;
  let match;
  while ((match = helpKeyRegex.exec(content))) {
    const key = match[1];
    usedKeys.add(key);
    if (!knownKeys.has(key)) {
      missingKeys.push({ file, key });
    }
  }

  rawInputRegex.lastIndex = 0;
  while ((match = rawInputRegex.exec(content))) {
    const tag = match[0];
    if (tag.includes("data-no-help") || tag.includes('type=\"hidden\"')) continue;
    rawInputs.push({ file, tag });
  }
}

if (missingKeys.length > 0) {
  console.error("Missing help registry entries for helpKey:");
  missingKeys.forEach(({ file, key }) => {
    console.error(`- ${path.relative(process.cwd(), file)}: ${key}`);
  });
  process.exit(1);
}

if (rawInputs.length > 0) {
  console.error("Raw Input/Select/Textarea usage without helpKey (add Field* or data-no-help):");
  rawInputs.forEach(({ file, tag }) => {
    console.error(`- ${path.relative(process.cwd(), file)}: ${tag}`);
  });
  process.exit(1);
}

const unused = [...knownKeys].filter((key) => !usedKeys.has(key));
if (unused.length > 0) {
  console.warn(`Warning: ${unused.length} help keys are unused.`);
}

console.log("Field help registry check passed.");
