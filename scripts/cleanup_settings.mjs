import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ENV_FILES = [".env.local", "services/hrtaj_api/.env"];

function loadEnvFile(path) {
  const env = {};
  if (!fs.existsSync(path)) return env;
  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function loadEnv() {
  const merged = { ...process.env };
  for (const file of ENV_FILES) {
    Object.assign(merged, loadEnvFile(file));
  }
  return merged;
}

function hasGarbage(value) {
  return /\?{3,}/.test(value) || value.includes("�");
}

function shouldNullify(key, value) {
  if (!value) return false;
  if (hasGarbage(value)) return true;

  const normalized = value.toLowerCase();
  if (
    /nasr city/i.test(value) ||
    /abbas/i.test(value) ||
    /10\s*am/i.test(value) ||
    /10\s*minutes/i.test(value) ||
    /trust & contact/i.test(value)
  ) {
    return true;
  }

  if (
    key === "office_address" &&
    /\u0645\u062F\u064A\u0646\u0629\s*\u0646\u0635\u0631|\u0639\u0628\u0627\u0633\s*\u0627\u0644\u0639\u0642\u0627\u062F/.test(
      value
    )
  ) {
    return true;
  }
  if (key === "working_hours" && /(10|\u0661\u0660)\s*\u0635|(?:9|\u0669)\s*\u0645/.test(value)) {
    return true;
  }
  if (key === "response_sla" && /(10|\u0661\u0660)\s*\u062F\u0642\u0627\u0626\u0642?/.test(value)) {
    return true;
  }

  const exactMatches = new Set([
    "https://www.facebook.com/share/1C1fQLJD2W/",
    "https://www.instagram.com/hrtaj.co",
    "https://www.linkedin.com/in/hrtaj-real-estate-519564307",
    "https://www.tiktok.com/@hrtajrealestate?_r=1&_t=ZS-93ZFLAWsstD",
    "hrtaj4realestate@gmail.com",
    "hrtajrealestate@gmail.com",
    "+201020614022",
    "https://wa.me/201020614022",
  ]);

  if (exactMatches.has(value.trim())) return true;

  return false;
}

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / ANON KEY in env.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const keys = [
    "office_address",
    "working_hours",
    "response_sla",
    "facebook_url",
    "instagram_url",
    "linkedin_url",
    "tiktok_url",
    "youtube_url",
    "whatsapp_number",
    "whatsapp_link",
    "public_email",
    "contact_email",
  ];

  const { data, error } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", keys);

  if (error) {
    console.error("Failed to fetch site_settings:", error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  const flagged = rows.filter((row) => shouldNullify(row.key, row.value ?? ""));

  console.log("Before cleanup (targets only):");
  if (flagged.length === 0) {
    console.log("- none");
  } else {
    for (const row of flagged) {
      console.log(`- ${row.key}: ${row.value}`);
    }
  }

  const dryRun = process.argv.includes("--dry-run");
  if (!dryRun && flagged.length > 0) {
    for (const row of flagged) {
      const { error: delError } = await supabase
        .from("site_settings")
        .delete()
        .eq("key", row.key)
        .eq("value", row.value);
      if (delError) {
        console.error(`Failed to delete ${row.key}:`, delError.message);
        process.exit(1);
      }
    }
  }

  const { data: afterData, error: afterError } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", keys);

  if (afterError) {
    console.error("Failed to fetch site_settings after cleanup:", afterError.message);
    process.exit(1);
  }

  const afterRows = afterData ?? [];
  console.log("After cleanup (targets only):");
  if (flagged.length === 0) {
    console.log("- none");
  } else {
    for (const row of flagged) {
      const still = afterRows.find((item) => item.key === row.key);
      console.log(`- ${row.key}: ${still?.value ?? "(deleted)"}`);
    }
  }
}

main();
