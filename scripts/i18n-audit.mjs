import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src", "lib", "i18n.ts");
const content = fs.readFileSync(filePath, "utf8");

function extractBlock(startToken, endToken) {
  const start = content.indexOf(startToken);
  const end = content.indexOf(endToken);
  if (start === -1 || end === -1 || end <= start) return "";
  return content.slice(start + startToken.length, end);
}

const arBlock = extractBlock("const ar: Dictionary = {", "const en: Dictionary = {");
const enBlock = extractBlock("const en: Dictionary = {", "export const DICTIONARY");

function extractKeys(block) {
  const keys = new Set();
  const regex = /"([^"]+)":/g;
  let match;
  while ((match = regex.exec(block))) {
    keys.add(match[1]);
  }
  return keys;
}

const arKeys = extractKeys(arBlock);
const enKeys = extractKeys(enBlock);

const missingInEn = [...arKeys].filter((key) => !enKeys.has(key)).sort();
const missingInAr = [...enKeys].filter((key) => !arKeys.has(key)).sort();

console.log(`AR keys: ${arKeys.size}`);
console.log(`EN keys: ${enKeys.size}`);
console.log(`Missing in EN: ${missingInEn.length}`);
if (missingInEn.length) console.log(missingInEn.join("\n"));
console.log(`Missing in AR: ${missingInAr.length}`);
if (missingInAr.length) console.log(missingInAr.join("\n"));
