"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "team_session_id";
const VISIBLE_INTERVAL_MS = 60_000;
const HIDDEN_INTERVAL_MS = 180_000;

function safeReadStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWriteStorage(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export default function TeamPresenceClient() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    sessionIdRef.current = safeReadStorage();
  }, []);

  useEffect(() => {
    if (!pathname?.startsWith("/team") || pathname.startsWith("/team/login")) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }

    const ping = async () => {
      try {
        const res = await fetch("/api/team/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
        });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as { sessionId?: string } | null;
        if (data?.sessionId) {
          sessionIdRef.current = data.sessionId;
          safeWriteStorage(data.sessionId);
        }
      } catch {
        // ignore
      }
    };

    const startInterval = (ms: number) => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(ping, ms);
    };

    const handleVisibility = () => {
      const nextMs = document.hidden ? HIDDEN_INTERVAL_MS : VISIBLE_INTERVAL_MS;
      startInterval(nextMs);
      if (!document.hidden) {
        ping();
      }
    };

    ping();
    startInterval(document.hidden ? HIDDEN_INTERVAL_MS : VISIBLE_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname]);

  useEffect(() => {
    const endSession = () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      try {
        fetch("/api/team/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore
      }
    };

    window.addEventListener("pagehide", endSession);
    return () => {
      window.removeEventListener("pagehide", endSession);
      endSession();
    };
  }, []);

  return null;
}
