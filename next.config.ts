import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Ensure NEXT_PUBLIC_* envs are inlined into client bundles */
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  reactCompiler: true,
};

export default nextConfig;
