import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src", "lib", "brand.ts");
const source = fs.readFileSync(filePath, "utf8");

const hasBrandConstant = /BRAND_AR_NAME\s*=/.test(source);
const hasUnicode = /\\u0686/.test(source);
const pattern = /BRAND_AR_NAME\s*=\s*["'`][^"'`]*["'`]\s*\+\s*["'`]\\u0686["'`]/;

if (!hasBrandConstant || !hasUnicode || !pattern.test(source)) {
  console.error("BRAND_AR_NAME must include U+0686 (\\u0686).");
  process.exit(1);
}

console.log("BRAND_AR_NAME check passed.");
