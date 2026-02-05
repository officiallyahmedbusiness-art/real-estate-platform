"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRAND_AR_NAME } from "@/lib/brand";

export type GalleryImage = {
  id: string;
  url: string;
};

export function Gallery({
  images,
  alt,
  fallback,
}: {
  images: GalleryImage[];
  alt: string;
  fallback: string;
}) {
  const safeImages = useMemo(() => images.filter((img) => Boolean(img.url)), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const gap = 12;
    const handleScroll = () => {
      const width = track.clientWidth || 1;
      const step = width + gap;
      const nextIndex = Math.round(Math.abs(track.scrollLeft) / step);
      setActiveIndex(Math.min(safeImages.length - 1, Math.max(0, nextIndex)));
    };
    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [safeImages.length]);

  const active = safeImages[activeIndex] ?? safeImages[0];

  if (!safeImages.length) {
    return (
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--surface)]">
        <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
          {fallback}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="gallery-mobile md:hidden">
        <div ref={trackRef} className="gallery-track" aria-label={alt}>
          {safeImages.map((img) => (
            <div key={img.id} className="gallery-slide" data-slide>
              <Image
                src={img.url}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                priority={false}
              />
              <span className="media-watermark" aria-hidden="true">
                {BRAND_AR_NAME}
              </span>
            </div>
          ))}
        </div>
        <div className="gallery-dots" aria-hidden="true">
          {safeImages.map((img, idx) => (
            <button
              type="button"
              key={img.id}
              className="gallery-dot"
              data-active={idx === activeIndex}
              onClick={() => {
                const track = trackRef.current;
                if (!track) return;
                const step = track.clientWidth + 12;
                track.scrollTo({ left: idx * step, behavior: "smooth" });
                setActiveIndex(idx);
              }}
              aria-label={`Image ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="gallery-desktop hidden md:grid">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[var(--surface)]">
          {active ? (
            <Image
              src={active.url}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 80vw, 60vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              {fallback}
            </div>
          )}
          <span className="media-watermark" aria-hidden="true">
            {BRAND_AR_NAME}
          </span>
        </div>
        <div className="gallery-thumbs">
          {safeImages.map((img, idx) => (
            <button
              type="button"
              key={img.id}
              className="gallery-thumb"
              data-active={idx === activeIndex}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Thumbnail ${idx + 1}`}
            >
              <Image
                src={img.url}
                alt={alt}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
