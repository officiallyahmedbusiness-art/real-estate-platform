import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src", "lib", "brand.ts");
const source = fs.readFileSync(filePath, "utf8");

const hasUnicode = /\\u0686/.test(source);
const brandArPattern = /BRAND\s*=\s*{[\s\S]*?ar:\s*["'`][^"'`]*\\u0686[^"'`]*["'`][\s\S]*?}/;
const brandArNamePattern = /BRAND_AR_NAME\s*=\s*[^;]*\\u0686/;

if (!hasUnicode || (!brandArPattern.test(source) && !brandArNamePattern.test(source))) {
  console.error("Arabic brand must include U+0686 (\\u0686).");
  process.exit(1);
}

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(ts|tsx|js|mjs|json|md|css|svg)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const forbidden = "هارتج";
const files = collectFiles(path.join(process.cwd(), "src")).concat(
  collectFiles(path.join(process.cwd(), "public"))
);
const offenders = files.filter((file) => fs.readFileSync(file, "utf8").includes(forbidden));
if (offenders.length > 0) {
  console.error(`Forbidden Arabic brand spelling found (${forbidden}) in:`);
  offenders.forEach((file) => console.error(`- ${path.relative(process.cwd(), file)}`));
  process.exit(1);
}

console.log("BRAND_AR_NAME check passed.");
