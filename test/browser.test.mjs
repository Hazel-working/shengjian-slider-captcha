import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

import { chromium } from "playwright-core";

// Browser-level regression for the userscript. A mock AJ-Captcha widget runs in
// headless Chrome/Edge and the userscript is injected as a normal page script.
// playwright-core does not download browsers; this test uses the locally
// installed Chrome/Edge (override with CHROME_PATH if needed).
const USCRIPT_PATH = process.env.USCRIPT_FILE || new URL("../shengjian-slider-captcha.user.js", import.meta.url);
const SCRIPT_SOURCE = readFileSync(USCRIPT_PATH, "utf8");
const MOCK_SOURCE = readFileSync(new URL("./browser-mock.js", import.meta.url), "utf8");

const fixture = (name) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url)).toString("base64");

// Both fixtures are 310x155; the widget displays them at natural size, so the
// matched x is the drag distance in CSS pixels.
const PUZZLES = {
  a: { bg: fixture("background.png"), notch: fixture("notch.png"), distance: 118 },
  b: {
    bg: fixture("background_false_minimum.png"),
    notch: fixture("notch_false_minimum.png"),
    distance: 132,
  },
};

const PAGE_CSS = `
  html, body { margin: 0; font-family: sans-serif; background: #fff; }
  #host { padding: 20px; }
  .verifybox { position: relative; width: 320px; padding: 5px; background: #fff; }
  .verify-img-panel { position: relative; width: 310px; height: 155px; overflow: hidden; }
  .verify-img-panel img { display: block; width: 310px; height: 155px; }
  .verify-sub-block { position: absolute; top: 5px; left: 5px; width: 310px; height: 155px; pointer-events: none; }
  .verify-sub-block img { position: absolute; top: 0; left: 0; width: 47px; height: 155px; }
  .verify-bar-area { position: relative; width: 310px; height: 34px; margin-top: 10px; background: #eee; border-radius: 17px; }
  .verify-move-block { position: absolute; top: 0; left: 0; width: 40px; height: 34px; background: #fff; border: 1px solid #999; border-radius: 17px; cursor: pointer; }
  .verify-refresh { position: absolute; right: 8px; top: 8px; width: 18px; height: 18px; line-height: 18px; text-align: center; cursor: pointer; }
  .verify-tips { position: absolute; top: 0; left: 0; width: 100%; height: 34px; line-height: 34px; text-align: center; font-size: 13px; }
  .verify-tips.suc-bg { color: #070; }
  .verify-tips.err-bg { color: #b00; }
`;

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

const BROWSER = findBrowser();
const SKIP = BROWSER ? false : "Chrome/Edge not found (set CHROME_PATH to run this test)";

function buildPage(scenario) {
  return [
    "<!doctype html>",
    '<html><head><meta charset="utf-8"><style>',
    PAGE_CSS,
    "</style></head><body>",
    '<div id="host"></div>',
    '<pre id="test-result">PENDING</pre>',
    `<script>window.__SCENARIO = ${JSON.stringify(scenario)};</script>`,
    `<script>window.__PUZZLES = ${JSON.stringify(PUZZLES)};</script>`,
    `<script>${MOCK_SOURCE}</script>`,
    `<script>${SCRIPT_SOURCE}</script>`,
    "</body></html>",
  ].join("\n");
}

async function runPage(scenario) {
  const browser = await chromium.launch({
    executablePath: BROWSER,
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.setContent(buildPage(scenario), { waitUntil: "load" });
    await page.waitForFunction(() => window.__STATS && window.__STATS.done, null, {
      timeout: 30000,
    });
    const stats = await page.evaluate(() => window.__STATS);
    stats.pageErrors = pageErrors;
    return stats;
  } finally {
    await browser.close();
  }
}

function assertNoPageErrors(stats) {
  assert.deepEqual(stats.pageErrors, [], `page errors: ${stats.pageErrors.join("; ")}`);
}

function assertDragLanded(stats, expected) {
  assert.equal(stats.drags, 1, `unexpected drag count: ${stats.drags}`);
  assert.ok(
    Math.abs(stats.finalMoveX - expected) <= 2,
    `drag landed at ${stats.finalMoveX}, expected ~${expected}`,
  );
}

test("detects the puzzle and drags the correct distance", { skip: SKIP }, async (t) => {
  const stats = await runPage({ finalizeMs: 3000 });
  t.diagnostic(
    `timeline: ${JSON.stringify({
      appearedAt: stats.appearedAt,
      imagesReadyAt: stats.imagesReadyAt,
      firstDownAt: stats.firstDownAt,
      latency: stats.firstDownLatency,
      drags: stats.drags,
      success: stats.success,
    })}`,
  );
  assertNoPageErrors(stats);
  assert.equal(stats.success, true);
  assertDragLanded(stats, PUZZLES.a.distance);
  assert.match(stats.hudAtSuccess, /已通过/);
  assert.ok(
    stats.firstDownLatency !== null && stats.firstDownLatency < 500,
    `captcha-to-drag latency was ${stats.firstDownLatency}ms`,
  );
});

test("real mouse movement during the automated drag is ignored", { skip: SKIP }, async () => {
  const stats = await runPage({ interference: true, finalizeMs: 1500 });
  assertNoPageErrors(stats);
  assert.equal(stats.success, true);
  assertDragLanded(stats, PUZZLES.a.distance);
});

test("failed drag waits for the widget to swap and retries on the new puzzle", { skip: SKIP }, async () => {
  const stats = await runPage({ rejectDragsBefore: 1, autoSwapMs: 700, finalizeMs: 3500 });
  assertNoPageErrors(stats);
  assert.equal(stats.success, true);
  assert.equal(stats.drags, 2);
  assert.equal(stats.refreshClicks, 0, "the widget swapped by itself; no refresh click expected");
  assert.ok(
    Math.abs(stats.finalMoveX - PUZZLES.b.distance) <= 2,
    `second drag landed at ${stats.finalMoveX}, expected ~${PUZZLES.b.distance}`,
  );
  assert.match(stats.hudAtSuccess, /第 2 次/);
});

test("failed drag clicks refresh automatically when the puzzle does not swap", { skip: SKIP }, async () => {
  const stats = await runPage({ rejectDragsBefore: 1, autoSwapMs: 0, finalizeMs: 4500 });
  assertNoPageErrors(stats);
  assert.equal(stats.success, true);
  assert.equal(stats.drags, 2);
  assert.equal(stats.refreshClicks, 1);
  assert.ok(Math.abs(stats.finalMoveX - PUZZLES.b.distance) <= 2);
  assert.match(stats.hudAtSuccess, /第 2 次/);
});

test("stops after two failed drags and leaves room for a manual retry", { skip: SKIP }, async () => {
  const stats = await runPage({ rejectDragsBefore: 2, autoSwapMs: 0, finalizeMs: 5500 });
  assertNoPageErrors(stats);
  assert.equal(stats.success, undefined);
  assert.equal(stats.drags, 2);
  assert.equal(stats.refreshClicks, 1);
  assert.match(stats.hudFinal, /连续 2 次未通过/);
});

test("manual dragging still works after the automatic budget is exhausted", { skip: SKIP }, async () => {
  const stats = await runPage({
    rejectDragsBefore: 2,
    autoSwapMs: 0,
    finalizeMs: 5000,
    manualDragAt: 3500,
  });
  assertNoPageErrors(stats);
  assert.equal(stats.drags, 3, "two automatic drags plus one manual drag");
  assert.equal(stats.manual, 1);
  assert.equal(stats.success, true);
  assert.match(stats.hudFinal, /连续 2 次未通过/);
});
