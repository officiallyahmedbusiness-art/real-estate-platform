"use client";

import { useEffect, useMemo, useState } from "react";

type ActiveDurationProps = {
  start: string;
  end?: string | null;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function ActiveDuration({ start, end }: ActiveDurationProps) {
  const startMs = useMemo(() => new Date(start).getTime(), [start]);
  const endMs = useMemo(() => (end ? new Date(end).getTime() : null), [end]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endMs) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [endMs]);

  const effectiveEnd = endMs ?? now;
  return <span>{formatDuration(effectiveEnd - startMs)}</span>;
}

