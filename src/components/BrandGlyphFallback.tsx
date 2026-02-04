"use client";

import { useEffect } from "react";
import { BRAND_AR_NAME, BRAND_AR_NAME_FALLBACK } from "@/lib/brand";

const FONT_STACK =
  '"Noto Sans Arabic","Cairo","Tajawal","Noto Naskh Arabic","Amiri",system-ui,sans-serif';

function supportsGlyph(glyph: string) {
  if (typeof document === "undefined") return true;
  if (document.fonts?.check) {
    return document.fonts.check(`16px ${FONT_STACK}`, glyph);
  }
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return true;
  context.font = `32px ${FONT_STACK}`;
  const widthWithFont = context.measureText(glyph).width;
  context.font = "32px monospace";
  const widthWithMono = context.measureText(glyph).width;
  return widthWithFont !== widthWithMono;
}

function replaceBrandText(root: Node, from: string, to: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue?.includes(from) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }
  nodes.forEach((node) => {
    node.nodeValue = node.nodeValue?.split(from).join(to) ?? null;
  });
}

export function BrandGlyphFallback() {
  const glyph = BRAND_AR_NAME.slice(-1);

  useEffect(() => {
    const applyFallback = () => {
      if (supportsGlyph(glyph)) return;
      if (!document.body) return;
      document.documentElement.setAttribute("data-brand-ar-fallback", "1");
      replaceBrandText(document.body, BRAND_AR_NAME, BRAND_AR_NAME_FALLBACK);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(applyFallback).catch(applyFallback);
    } else {
      setTimeout(applyFallback, 0);
    }
  }, [glyph]);

  return null;
}
