export function safeNextPath(input: unknown, fallback = "/dashboard") {
  const val = typeof input === "string" ? input : "";
  if (!val) return fallback;
  if (!val.startsWith("/")) return fallback;
  if (val.startsWith("//")) return fallback;
  return val;
}
