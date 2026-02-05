import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];

  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const brokenImages = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
  );

  await browser.close();

  if (errors.length || consoleErrors.length || brokenImages.length) {
    console.error("Quality smoke check failed.");
    if (errors.length) console.error("Page errors:", errors);
    if (consoleErrors.length) console.error("Console errors:", consoleErrors);
    if (brokenImages.length) console.error("Broken images:", brokenImages);
    process.exit(1);
  }

  console.log("Quality smoke check passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
