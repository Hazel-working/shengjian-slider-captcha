import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { decodePng } from "./png.mjs";

// The userscript is a plain IIFE; evaluating it in Node skips its browser
// bootstrap and publishes the pure matcher on globalThis for these tests.
const scriptUrl = new URL("../shengjian-slider-captcha.user.js", import.meta.url);
new Function(readFileSync(scriptUrl, "utf8"))();
const api = globalThis.__SHENGJIAN_SLIDER_CAPTCHA__;

const fixture = (name) => decodePng(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));

// Verified against the live page: the handle starts flush with the left edge of
// the 310px background, so the matched x is the distance to drag.
const EXPECTED_DISTANCE = 118;

// A multi-hole puzzle where masked SQDIFF lands on the right edge (x=263,
// 0.1320) while CCORR/CCOEFF agree on the real hole (x=132, 0.9744/0.9029).
const FALSE_MINIMUM_DISTANCE = 132;

test("masked SQDIFF finds the verified gap", () => {
  const result = api.measurePuzzle(fixture("background.png"), fixture("notch.png"));

  assert.equal(result.distance, EXPECTED_DISTANCE);
  assert.equal(result.crossChecked, false);
  assert.ok(result.normalized <= 0.3);
});

test("a false minimum at the right edge is rejected and recovered by cross-checks", () => {
  const result = api.measurePuzzle(
    fixture("background_false_minimum.png"),
    fixture("notch_false_minimum.png"),
  );

  assert.equal(result.distance, FALSE_MINIMUM_DISTANCE);
  assert.equal(result.crossChecked, true);
});

test("masked correlations reproduce OpenCV scores", () => {
  const background = fixture("background_false_minimum.png");
  const notch = fixture("notch_false_minimum.png");
  const mask = api.buildMask(notch);
  const cols = background.width - notch.width + 1;
  const rows = background.height - notch.height + 1;

  const ccorr = api.maskedCorrelation(background, mask, cols, rows, "ccorr");
  const ccoeff = api.maskedCorrelation(background, mask, cols, rows, "ccoeff");

  assert.equal(ccorr.bestX, FALSE_MINIMUM_DISTANCE);
  assert.equal(ccoeff.bestX, FALSE_MINIMUM_DISTANCE);
  assert.ok(Math.abs(ccorr.best - 0.9744) < 0.0001, `ccorr=${ccorr.best}`);
  assert.ok(Math.abs(ccoeff.best - 0.9029) < 0.0001, `ccoeff=${ccoeff.best}`);
});

test("constant tiles are rejected instead of producing a bogus distance", () => {
  const notch = fixture("notch_false_minimum.png");
  const background = {
    width: notch.width + 263,
    height: notch.height,
    channels: 3,
    data: new Uint8Array((notch.width + 263) * notch.height * 3),
  };
  const flatNotch = {
    ...notch,
    data: Uint8Array.from(notch.data),
  };
  for (let i = 0; i < flatNotch.data.length; i += 4) {
    flatNotch.data[i] = 255;
    flatNotch.data[i + 1] = 255;
    flatNotch.data[i + 2] = 255;
  }

  assert.throws(() => api.measurePuzzle(background, flatNotch), /超过阈值/);
});

test("drag distance is scaled from image pixels to displayed CSS pixels", () => {
  const scaled = api.toCssDistance(118, {
    naturalWidth: 310,
    getBoundingClientRect: () => ({ width: 155 }),
  });

  assert.equal(scaled, 59);
});
