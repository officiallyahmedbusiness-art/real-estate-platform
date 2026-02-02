"use client";

import { useEffect, useRef, useState } from "react";

type CursorInfo = {
  target: string;
  cursor: string;
  rule: string;
};

function formatTarget(el: Element) {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const classes =
    el.classList.length > 0 ? `.${Array.from(el.classList).slice(0, 3).join(".")}` : "";
  return `${tag}${id}${classes}`;
}

function findCursorRule(el: Element) {
  if (el instanceof HTMLElement && el.style.cursor) {
    return `inline style: ${el.style.cursor}`;
  }
  let match = "";

  const scanRules = (rules: CSSRuleList, source: string) => {
    for (const rule of Array.from(rules)) {
      const anyRule = rule as CSSRule;
      if ("cssRules" in (anyRule as CSSMediaRule | CSSSupportsRule)) {
        scanRules((anyRule as CSSMediaRule | CSSSupportsRule).cssRules, source);
        continue;
      }
      if (anyRule.type !== CSSRule.STYLE_RULE) continue;
      const styleRule = anyRule as CSSStyleRule;
      const cursor = styleRule.style?.cursor;
      if (!cursor) continue;
      try {
        if (el.matches(styleRule.selectorText)) {
          match = `${styleRule.selectorText} @ ${source}`;
        }
      } catch {
        // Ignore invalid selectors.
      }
    }
  };

  for (const sheet of Array.from(document.styleSheets)) {
    const source = sheet.href ?? "inline";
    try {
      if (!sheet.cssRules) continue;
      scanRules(sheet.cssRules, source);
    } catch {
      // Cross-origin stylesheet; ignore.
    }
  }

  return match || "user-agent/default";
}

export function DebugCursorInspector() {
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return process.env.NODE_ENV === "development" && params.get("debug") === "1";
  });
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const lastRef = useRef<CursorInfo>({
    target: "",
    cursor: "",
    rule: "",
  });

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (!overlayRef.current) return;
      const target = event.target as Element | null;
      if (!target) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cursor = window.getComputedStyle(target).cursor;
        const rule = findCursorRule(target);
        const next: CursorInfo = {
          target: formatTarget(target),
          cursor,
          rule,
        };
        const prev = lastRef.current;
        if (
          prev.target !== next.target ||
          prev.cursor !== next.cursor ||
          prev.rule !== next.rule
        ) {
          lastRef.current = next;
          overlayRef.current!.textContent = `target: ${next.target}\ncursor: ${next.cursor}\nrule: ${next.rule}`;
        }
      });
    };

    document.addEventListener("mousemove", onMove, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed bottom-4 left-4 z-[9999] whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text)] shadow-[var(--shadow)]"
    />
  );
}
