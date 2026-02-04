"use client";

import { useEffect } from "react";

export function HeaderScroll() {
  useEffect(() => {
    const update = () => {
      const compact = window.scrollY > 24;
      document.documentElement.setAttribute("data-header-compact", compact ? "1" : "0");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  return null;
}
