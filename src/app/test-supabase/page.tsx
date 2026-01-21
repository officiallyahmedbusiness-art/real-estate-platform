"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>({ loading: true });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      setResult({
        loading: false,
        ok: !error,
        hasSession: !!data?.session,
        error: error?.message ?? null,
      });
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Supabase Test</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}
