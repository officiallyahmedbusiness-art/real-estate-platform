import { test, expect } from "@playwright/test";
import { buildWhatsAppMessagePlain, buildWhatsAppMessageEncoded } from "../src/lib/whatsapp/message";

const locale = "ar" as const;

test("whatsapp template replaces variables", () => {
  const message = buildWhatsAppMessagePlain(
    {
      brand: "هارتچ",
      listing_url: "https://hrtaj.com/listing/123",
      listing_title: "شقة مميزة",
    },
    "استفسار {brand}\n{listing_title}\n{listing_url}",
    locale
  );
  expect(message).toContain("هارتچ");
  expect(message).toContain("شقة مميزة");
  expect(message).toContain("https://hrtaj.com/listing/123");
});

test("whatsapp fallback message when template empty", () => {
  const message = buildWhatsAppMessagePlain(
    { listing_url: "https://hrtaj.com/listing/123" },
    "",
    locale
  );
  expect(message).toContain("https://hrtaj.com/listing/123");
});

test("whatsapp message encoding keeps newlines", () => {
  const encoded = buildWhatsAppMessageEncoded(
    { listing_url: "https://hrtaj.com/listing/123" },
    "استفسار سريع\n{listing_url}",
    locale
  );
  expect(encoded).toContain("%0A");
});
