"use client";

import { useEffect, useState } from "react";

type LogoProps = {
  name: string;
  className?: string;
  imageClassName?: string;
};

const LOGO_SOURCES = [
  "/brand/hrtaj-logo.png",
  "/brand/hrtaj-logo.jpg",
  "/brand/hrtaj-logo.jpeg",
  "/brand/hrtaj-logo.svg",
];

const FALLBACK_SRC = "/brand/hrtaj-logo.svg";

export function Logo({ name, className = "", imageClassName = "" }: LogoProps) {
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState(FALLBACK_SRC);

  useEffect(() => {
    let active = true;
    const probe = async () => {
      for (const candidate of LOGO_SOURCES) {
        const ok = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = candidate;
        });
        if (!active) return;
        if (ok) {
          setSrc(candidate);
          setFailed(false);
          return;
        }
      }
      if (active) setFailed(true);
    };
    probe();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`flex items-center gap-4 md:gap-5 ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={name}
          className={`h-12 w-auto max-w-[160px] shrink-0 object-contain md:h-14 md:max-w-[200px] ${imageClassName}`}
          onError={() => setFailed(true)}
          loading="eager"
        />
      ) : null}
      <span className="text-xl font-semibold leading-tight md:text-2xl">{name}</span>
    </div>
  );
}
