import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const logoUrl = "https://hrtaj.com/brand/hrtaj-logo.svg";

const { error } = await client
  .from("site_settings")
  .upsert({ key: "logo_url", value: logoUrl }, { onConflict: "key" });

if (error) {
  console.error("Failed to seed logo_url", error.message);
  process.exit(1);
}

console.log("logo_url updated.");
