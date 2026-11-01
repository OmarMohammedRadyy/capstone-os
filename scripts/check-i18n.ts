import { ar } from "../src/i18n/dictionaries/ar";
import { en } from "../src/i18n/dictionaries/en";

function getKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getKeys(val, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const arKeys = new Set(getKeys(ar));

const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));

console.log(`[i18n] Total English keys: ${enKeys.size}`);
console.log(`[i18n] Total Arabic keys: ${arKeys.size}`);

if (missingInAr.length > 0) {
  console.error(`[i18n] ERROR: ${missingInAr.length} keys missing in Arabic dictionary:`, missingInAr);
}

if (missingInEn.length > 0) {
  console.error(`[i18n] ERROR: ${missingInEn.length} keys missing in English dictionary:`, missingInEn);
}

if (missingInAr.length > 0 || missingInEn.length > 0) {
  process.exit(1);
}

console.log("[i18n] All i18n dictionaries are synchronized with 100% key parity.");

