export function safeNextPath(input: unknown, fallback = "/dashboard") {
  const val = typeof input === "string" ? input : "";
  if (!val) return fallback;
  if (!val.startsWith("/")) return fallback;
  if (val.startsWith("//")) return fallback;
  return val;
}

export function getPublicBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "";
  if (!raw) return "";
  const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
  return normalized.replace(/^http:\/\//i, "https://").replace(/\/$/, "");
}
