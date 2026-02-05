import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

type RouteIssue = {
  route: string;
  issues: string[];
  consoleErrors: string[];
  consoleWarnings: string[];
  requestFailures: string[];
  status?: number;
  overflowDesktop?: Array<{ tag: string; cls: string; left: number; right: number; width: number }>;
  overflowMobile?: Array<{ tag: string; cls: string; left: number; right: number; width: number }>;
};

const artifactsDir = path.join(process.cwd(), "artifacts");
const screenshotsDir = path.join(artifactsDir, "screenshots");
const auditReport: RouteIssue[] = [];

function sanitizeFileName(input: string) {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

async function getRoutesFromSitemap(baseURL: string, request: any) {
  const response = await request.get("/sitemap.xml");
  if (!response.ok()) return [];
  const xml = await response.text();
  const matches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)) as RegExpMatchArray[];
  const urls = matches.map((match) => match[1]);
  return urls
    .filter((url) => url.startsWith(baseURL))
    .map((url) => url.replace(baseURL, ""));
}

test.describe("Site audit crawl", () => {
  test("crawl all routes and capture issues", async ({ page, request }, testInfo) => {
    test.setTimeout(15 * 60_000);
    fs.mkdirSync(screenshotsDir, { recursive: true });

    const baseURL = (testInfo.project.use.baseURL as string) || "http://localhost:3001";
    let routes = await getRoutesFromSitemap(baseURL, request);
    if (routes.length === 0) {
      routes = ["/", "/about", "/listings", "/careers", "/partners"];
    }

    for (const route of routes) {
      const routePath = route || "/";
      const issues: string[] = [];
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];
      const requestFailures: string[] = [];
      let status: number | undefined;

      page.removeAllListeners();
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
        if (msg.type() === "warning") consoleWarnings.push(msg.text());
      });
      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });
      page.on("requestfailed", (req) => {
        const failure = req.failure()?.errorText ?? "";
        if (failure.includes("net::ERR_ABORTED") && req.url().includes("_rsc")) return;
        requestFailures.push(`${req.method()} ${req.url()} :: ${failure}`);
      });
      page.on("response", (res) => {
        const resUrl = res.url();
        if (res.status() >= 400 && resUrl.startsWith(baseURL)) {
          requestFailures.push(`${res.status()} ${resUrl}`);
        }
      });

      await page.setViewportSize({ width: 1280, height: 720 });
      const response = await page.goto(routePath, { waitUntil: "networkidle" });
      status = response?.status();
      if (status && status >= 400) {
        issues.push(`HTTP ${status}`);
      }

      const bodyText = await page.evaluate(() => document.body.innerText || "");
      if (/\?{2,}/.test(bodyText)) issues.push("Found repeated '?' in text");
      if (bodyText.includes("�")) issues.push("Found replacement character");
      if (bodyText.includes("هارتج")) issues.push("Found incorrect brand spelling");

      const hasTitle = await page.title();
      if (!hasTitle) issues.push("Missing <title>");
      const hasDescription = await page
        .locator('meta[name="description"]')
        .first()
        .getAttribute("content");
      if (!hasDescription) issues.push("Missing meta description");

      const hasOverflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > window.innerWidth + 1;
      });
      let overflowDesktop: RouteIssue["overflowDesktop"];
      if (hasOverflow) {
        issues.push("Horizontal overflow detected");
        overflowDesktop = await page.evaluate(() => {
          const vw = window.innerWidth;
          const offenders: Array<{ tag: string; cls: string; left: number; right: number; width: number }> = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > vw + 1 || rect.left < -1) {
              offenders.push({
                tag: el.tagName,
                cls: (el as HTMLElement).className ?? "",
                left: rect.left,
                right: rect.right,
                width: rect.width,
              });
            }
          });
          return offenders.slice(0, 8);
        });
      }

      const desktopShot = path.join(
        screenshotsDir,
        `${sanitizeFileName(routePath || "home")}-desktop.png`
      );
      await page.screenshot({ path: desktopShot, fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(routePath, { waitUntil: "networkidle" });
      const mobileOverflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > window.innerWidth + 1;
      });
      let overflowMobile: RouteIssue["overflowMobile"];
      if (mobileOverflow) {
        issues.push("Mobile horizontal overflow detected");
        overflowMobile = await page.evaluate(() => {
          const vw = window.innerWidth;
          const offenders: Array<{ tag: string; cls: string; left: number; right: number; width: number }> = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > vw + 1 || rect.left < -1) {
              offenders.push({
                tag: el.tagName,
                cls: (el as HTMLElement).className ?? "",
                left: rect.left,
                right: rect.right,
                width: rect.width,
              });
            }
          });
          return offenders.slice(0, 8);
        });
      }
      const mobileShot = path.join(
        screenshotsDir,
        `${sanitizeFileName(routePath || "home")}-mobile.png`
      );
      await page.screenshot({ path: mobileShot, fullPage: true });

      const routeReport = {
        route: routePath,
        issues,
        consoleErrors,
        consoleWarnings,
        requestFailures,
        status,
        overflowDesktop,
        overflowMobile,
      };
      auditReport.push(routeReport);
    }

    fs.mkdirSync(artifactsDir, { recursive: true });
    fs.writeFileSync(
      path.join(artifactsDir, "audit-report.json"),
      JSON.stringify(auditReport, null, 2),
      "utf8"
    );

    const failing = auditReport.filter((item) => item.issues.length > 0);
    expect(failing, JSON.stringify(failing, null, 2)).toHaveLength(0);
  });
});
