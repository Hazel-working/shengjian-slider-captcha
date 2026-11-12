import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright-core";

// Rasterizes icon.svg and writes the 64x64 PNG into the userscript's @icon as a
// base64 data URI. Uses the locally installed Chrome/Edge via playwright-core
// (no browser download). Pass --preview to also render dark/light previews.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SVG = readFileSync(join(ROOT, "icon.svg"), "utf8");
const USCRIPT = join(ROOT, "shengjian-slider-captcha.user.js");

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

const BROWSER = CANDIDATES.find((candidate) => existsSync(candidate));
if (!BROWSER) throw new Error("Chrome/Edge not found (set CHROME_PATH)");

const browser = await chromium.launch({
  executablePath: BROWSER,
  headless: true,
  args: ["--no-sandbox"],
});

try {
  const render = async (size) => {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<!doctype html><html><head><style>
        html, body { margin: 0; width: ${size}px; height: ${size}px; background: transparent; overflow: hidden; }
        svg { display: block; width: 100%; height: 100%; }
      </style></head><body>${SVG}</body></html>`,
    );
    const buffer = await page.screenshot({ omitBackground: true });
    await page.close();
    return buffer;
  };

  const png64 = await render(64);
  const png32 = await render(32);
  const base64 = png64.toString("base64");

  if (process.argv.includes("--preview")) {
    for (const [name, background] of [
      ["dark", "#18181b"],
      ["light", "#ffffff"],
    ]) {
      const page = await browser.newPage({ viewport: { width: 128, height: 128 } });
      await page.setContent(
        `<!doctype html><html><body style="margin:0;width:128px;height:128px;background:${background};display:flex;align-items:center;justify-content:center">
          <img src="data:image/png;base64,${base64}" width="64" height="64">
        </body></html>`,
      );
      await page.screenshot({ path: join(ROOT, `.icon-preview-${name}.png`) });
      await page.close();
    }
  }

  const iconLine = `// @icon         data:image/png;base64,${base64}`;
  const source = readFileSync(USCRIPT, "utf8");
  const updated = source.replace(/^\/\/ @icon .*$/m, () => iconLine);
  if (updated === source) throw new Error("@icon line not found in userscript");
  writeFileSync(USCRIPT, updated, "utf8");

  console.log(`64x64: ${png64.length} bytes, 32x32: ${png32.length} bytes`);
  console.log(`updated @icon in ${USCRIPT}`);
} finally {
  await browser.close();
}
