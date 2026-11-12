// ==UserScript==
// @name         圣鉴 ERP 登录滑块自动通过
// @name:en      Shengjian ERP Login Slider Auto Solver
// @namespace    https://github.com/Hazel-working/shengjian-slider-captcha
// @version      1.2.4
// @description  自动识别并拖动登录页的滑块拼图验证码（AJ-Captcha blockPuzzle），失败自动重试。仅在开发服、测试服、正式服的登录页生效。
// @author       Hazel-working
// @match        https://erp.shengj.cn/*
// @match        https://test-pc.guandaojia.cn/*
// @match        https://gdj.shengj.cn/*
// @run-at       document-idle
// @noframes
// @icon         data:image/png;base64,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
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const IS_BROWSER =
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof document.createElement === "function";

  const CONFIG = {
    enabled: true,
    // 服务端连续第 5 次验证失败会锁账号。脚本最多消耗 2 次，留 1 次手动重试。
    maxAttempts: 2,
    // 拖完之后要给服务端留足回包时间，等它把弹窗关掉。
    successWindowMs: 10000,
    // 拖错后组件约 1s 后自动换题；超过这个时间还没换就自动点刷新按钮。
    refreshClickDelayMs: 2000,
    puzzleSwapTimeoutMs: 10000,
    // 兜底轮询；正常情况下由 MutationObserver 在 DOM 变化时立即触发 tick。
    pollIntervalMs: 500,
    mutationThrottleMs: 30,
    // 换题后连续这段时间签名不变、且两张图都已解码才开始匹配。
    puzzleSettleMs: 60,
    readyPollIntervalMs: 60,
    verdictPollIntervalMs: 60,
    dragSteps: 16,
    // 合成拖拽节奏：按下和快照各让出一帧，步进间隔 4–10ms。
    dragPressDelayMs: 16,
    dragStepMinMs: 4,
    dragStepMaxMs: 10,
    dragSnapDelayMs: 24,
    // mouseup 后继续拦截真实输入的时长（不再阻塞结果等待）。
    inputGuardTailMs: 80,
    // 识别失败但还没拖拽（不消耗服务端失败次数）时，等一会儿自动重试。
    retryDelayMs: 1500,
    maxClientRetries: 5,
    // 掩码 SQDIFF 归一化得分的上限。实测正确匹配约 0.10，0.30 留有余量。
    maxAcceptableSqdiff: 0.3,
    // 命中最后一列本身就可疑：缺口很少正好贴着右边界。
    pinnedScoreCeiling: 0.08,
    minCcorrNormed: 0.95,
    minCcoeffNormed: 0.85,
    minNotchPayloadLength: 200,
    hudTimeoutMs: 4000,
    hudErrorTimeoutMs: 8000,
  };

  const SELECTORS = {
    box: ".verifybox, .verify-container, .verify-box",
    background: ".verify-img-panel img",
    notch: ".verify-sub-block img",
    handle: ".verify-move-block",
    barArea: ".verify-bar-area",
    refresh: ".verify-refresh",
  };

  const PREFIX = "[滑块助手]";

  function log(...args) {
    console.log(PREFIX, ...args);
  }

  function warn(...args) {
    console.warn(PREFIX, ...args);
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ------------------------------------------------------------------ *
   * DOM helpers
   * ------------------------------------------------------------------ */

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  function pickVisible(selector) {
    for (const el of document.querySelectorAll(selector)) {
      if (isVisible(el)) return el;
    }
    return null;
  }

  function captchaBox() {
    return pickVisible(SELECTORS.box);
  }

  function captchaVisible() {
    return isVisible(pickVisible(SELECTORS.handle)) && captchaBox() !== null;
  }

  function imageDecoded(img) {
    return Boolean(img.complete && img.naturalWidth > 0);
  }

  function captchaReady() {
    if (!captchaVisible()) return false;
    const bg = pickVisible(SELECTORS.background);
    const notch = pickVisible(SELECTORS.notch);
    if (!bg || !notch) return false;
    if (!imageDecoded(bg) || !imageDecoded(notch)) return false;
    return Boolean(backgroundSource(bg)) && notchPayload(notch).length >= CONFIG.minNotchPayloadLength;
  }

  function backgroundSource(img) {
    const src = img.getAttribute("src") || "";
    if (!src.startsWith("data:image") || !src.includes(",")) return null;
    const payload = src.slice(src.indexOf(",") + 1);
    return payload.length > 0 ? src : null;
  }

  function notchPayload(img) {
    const src = img.getAttribute("src") || "";
    if (!src.startsWith("data:image") || !src.includes(",")) return "";
    return src.slice(src.indexOf(",") + 1);
  }

  function captchaVerdict() {
    if (pickVisible(".verify-tips.suc-bg")) return "success";
    if (pickVisible(".verify-tips.err-bg")) return "error";
    return null;
  }

  /* ------------------------------------------------------------------ *
   * Image decoding
   * ------------------------------------------------------------------ */

  function readPixels(img) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (!width || !height) throw new Error("图块尚未加载完成");

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("无法创建 canvas 2d 上下文");
    ctx.drawImage(img, 0, 0);

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, width, height);
    } catch (error) {
      throw new Error("图块像素不可读（可能被跨域保护）");
    }
    return { width, height, channels: 4, data: imageData.data };
  }

  /* ------------------------------------------------------------------ *
   * Masked template matching
   *
   * Port of the OpenCV solver: cv2.matchTemplate(background, notch, TM_SQDIFF,
   * mask=alpha), normalized by 255^2 * maskPixels. Cross-checks use masked
   * TM_CCORR_NORMED and TM_CCOEFF_NORMED, whose per-channel means are what
   * OpenCV's masked implementation uses.
   * ------------------------------------------------------------------ */

  function buildMask(notch) {
    const { width, height, channels, data } = notch;
    const dx = new Int32Array(width * height);
    const dy = new Int32Array(width * height);
    const tr = new Float64Array(width * height);
    const tg = new Float64Array(width * height);
    const tb = new Float64Array(width * height);
    let count = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        if (channels === 4 && data[i + 3] === 0) continue;
        dx[count] = x;
        dy[count] = y;
        tr[count] = data[i];
        tg[count] = data[i + 1];
        tb[count] = data[i + 2];
        count++;
      }
    }

    if (count === 0) throw new Error("滑块缺口图 alpha 掩码为空");
    if (count >= width * height) throw new Error("滑块缺口图 alpha 掩码覆盖整块，掩码将失去意义");
    return { count, dx, dy, tr, tg, tb };
  }

  function maskedSqDiff(background, mask, cols, rows) {
    const { width: bw, channels: bc, data: bd } = background;
    const { count, dx, dy, tr, tg, tb } = mask;
    const result = new Float64Array(cols * rows);
    let best = Infinity;
    let bestX = 0;
    let bestY = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        for (let k = 0; k < count; k++) {
          const i = ((y + dy[k]) * bw + (x + dx[k])) * bc;
          const dr = bd[i] - tr[k];
          const dg = bd[i + 1] - tg[k];
          const db = bd[i + 2] - tb[k];
          sum += dr * dr + dg * dg + db * db;
        }
        const offset = y * cols + x;
        result[offset] = sum;
        if (sum < best) {
          best = sum;
          bestX = x;
          bestY = y;
        }
      }
    }

    return { result, best, bestX, bestY };
  }

  function maskedCorrelation(background, mask, cols, rows, mode) {
    const { width: bw, channels: bc, data: bd } = background;
    const { count, dx, dy, tr, tg, tb } = mask;
    const channels = [tr, tg, tb];

    const templateSum = [0, 0, 0];
    const templateSqSum = [0, 0, 0];
    let templateDotSq = 0;
    for (let k = 0; k < count; k++) {
      for (let c = 0; c < 3; c++) {
        templateSum[c] += channels[c][k];
        templateSqSum[c] += channels[c][k] * channels[c][k];
      }
      templateDotSq += tr[k] * tr[k] + tg[k] * tg[k] + tb[k] * tb[k];
    }

    const result = new Float64Array(cols * rows);
    let best = -Infinity;
    let bestX = 0;
    let bestY = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let dot = 0;
        let imageDotSq = 0;
        const imageSum = [0, 0, 0];
        const imageSqSum = [0, 0, 0];
        const channelDot = [0, 0, 0];

        for (let k = 0; k < count; k++) {
          const i = ((y + dy[k]) * bw + (x + dx[k])) * bc;
          for (let c = 0; c < 3; c++) {
            const value = bd[i + c];
            imageSum[c] += value;
            imageSqSum[c] += value * value;
            channelDot[c] += value * channels[c][k];
          }
        }
        dot = channelDot[0] + channelDot[1] + channelDot[2];
        imageDotSq = imageSqSum[0] + imageSqSum[1] + imageSqSum[2];

        let score = 0;
        if (mode === "ccorr") {
          const denominator = Math.sqrt(imageDotSq * templateDotSq);
          score = denominator === 0 ? 0 : dot / denominator;
        } else {
          // OpenCV's masked CCOEFF subtracts a per-channel mean over the masked
          // pixels only; this reproduces its scores exactly.
          let covariance = 0;
          let imageVariance = 0;
          let templateVariance = 0;
          for (let c = 0; c < 3; c++) {
            const meanT = templateSum[c] / count;
            const meanI = imageSum[c] / count;
            covariance += channelDot[c] - count * meanT * meanI;
            templateVariance += templateSqSum[c] - count * meanT * meanT;
            imageVariance += imageSqSum[c] - count * meanI * meanI;
          }
          const denominator = Math.sqrt(templateVariance * imageVariance);
          score = denominator === 0 ? 0 : covariance / denominator;
        }

        const offset = y * cols + x;
        result[offset] = score;
        if (score > best) {
          best = score;
          bestX = x;
          bestY = y;
        }
      }
    }

    return { result, best, bestX, bestY };
  }

  function rejectImplausible(distance, normalized, columns) {
    if (normalized > CONFIG.maxAcceptableSqdiff) {
      throw new Error(
        `滑块匹配失效：归一化得分 ${normalized.toFixed(4)} 超过阈值 ${CONFIG.maxAcceptableSqdiff}（x=${distance}）`,
      );
    }
    if (distance >= columns - 1 && normalized > CONFIG.pinnedScoreCeiling) {
      throw new Error(
        `滑块匹配失效：结果贴住右边界 x=${distance}/${columns - 1}（归一化得分 ${normalized.toFixed(4)}）`,
      );
    }
  }

  function measurePuzzle(background, notch) {
    const { width: bw, height: bh } = background;
    const { width: nw, height: nh } = notch;
    if (nw > bw || nh > bh) {
      throw new Error(`滑块图块尺寸异常：背景 ${bw}x${bh} 缺口 ${nw}x${nh}`);
    }

    const mask = buildMask(notch);
    const cols = bw - nw + 1;
    const rows = bh - nh + 1;
    const primary = maskedSqDiff(background, mask, cols, rows);
    const denominator = 255 * 255 * mask.count;
    const normalized = primary.best / denominator;

    try {
      rejectImplausible(primary.bestX, normalized, cols);
    } catch (originalError) {
      const fallback = crossCheck(background, mask, cols, rows);
      if (fallback === null) throw originalError;

      const fallbackNormalized = primary.result[fallback] / denominator;
      try {
        rejectImplausible(fallback, fallbackNormalized, cols);
      } catch (error) {
        throw originalError;
      }
      log(`SQDIFF 结果 x=${primary.bestX} 被守卫拒绝，交叉验证一致指向 x=${fallback}`);
      return { distance: fallback, normalized: fallbackNormalized, crossChecked: true, columns: cols };
    }

    return { distance: primary.bestX, normalized, crossChecked: false, columns: cols };
  }

  function crossCheck(background, mask, cols, rows) {
    const positions = [];
    for (const [mode, minimum] of [
      ["ccorr", CONFIG.minCcorrNormed],
      ["ccoeff", CONFIG.minCcoeffNormed],
    ]) {
      const { result, best, bestX } = maskedCorrelation(background, mask, cols, rows, mode);
      if (!(minimum <= best && best <= 1 + 1e-6)) return null;

      let ties = 0;
      for (let i = 0; i < result.length; i++) {
        if (result[i] === best) ties++;
      }
      if (ties !== 1) return null;
      positions.push(bestX);
    }
    return positions[0] === positions[1] ? positions[0] : null;
  }

  /* ------------------------------------------------------------------ *
   * Drag
   * ------------------------------------------------------------------ */

  function toCssDistance(matchX, backgroundImg) {
    const rect = backgroundImg.getBoundingClientRect();
    const natural = backgroundImg.naturalWidth || rect.width;
    if (!natural || !rect.width) throw new Error("无法读取背景图尺寸");
    // The widget reports 310 * moveX / displayedWidth to the server, so the
    // drag has to be expressed in the image's own pixel space scaled to CSS.
    return (matchX * rect.width) / natural;
  }

  // AJ-Captcha binds mousedown on the handle and mousemove/mouseup on window.
  // A real mouse moving at the same time joins the very same stream, overwrites
  // moveX and can even end the drag early. While the script is dragging, every
  // real input event is swallowed in the capture phase; the synthetic events it
  // dispatches carry a marker so they pass through untouched.
  const syntheticEvents = new WeakSet();
  const guardedEventTypes = [
    "mousedown",
    "mousemove",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerup",
    "pointercancel",
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "click",
  ];
  let inputGuardActive = false;

  function swallowForeignInput(event) {
    if (syntheticEvents.has(event)) return;
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  function installInputGuard() {
    if (inputGuardActive) return;
    inputGuardActive = true;
    for (const type of guardedEventTypes) {
      window.addEventListener(type, swallowForeignInput, { capture: true, passive: false });
    }
  }

  function removeInputGuard() {
    if (!inputGuardActive) return;
    inputGuardActive = false;
    for (const type of guardedEventTypes) {
      window.removeEventListener(type, swallowForeignInput, { capture: true });
    }
  }

  function dispatchMouse(target, type, init) {
    const event = new MouseEvent(type, init);
    syntheticEvents.add(event);
    target.dispatchEvent(event);
  }

  async function dragBy(distance) {
    const handle = pickVisible(SELECTORS.handle);
    if (!handle) throw new Error("未找到可见的滑块把手");

    const rect = handle.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endX = startX + distance;
    const view = document.defaultView || window;
    const base = { bubbles: true, cancelable: true, view, clientY: startY, button: 0 };
    const move = (clientX) =>
      dispatchMouse(document, "mousemove", { ...base, clientX, buttons: 1 });

    installInputGuard();
    let guardReleased = false;
    try {
      // dispatching on document reaches the window listeners through bubbling.
      dispatchMouse(handle, "mousedown", { ...base, clientX: startX, buttons: 1 });
      await sleep(CONFIG.dragPressDelayMs);

      const steps = Math.max(1, CONFIG.dragSteps);
      for (let index = 1; index <= steps; index++) {
        const progress = index / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        move(startX + distance * eased);
        await sleep(
          CONFIG.dragStepMinMs + Math.random() * (CONFIG.dragStepMaxMs - CONFIG.dragStepMinMs),
        );
      }

      // Snap to the exact target so easing rounding never costs accuracy.
      move(endX);
      await sleep(CONFIG.dragSnapDelayMs);
      dispatchMouse(document, "mouseup", { ...base, clientX: endX, buttons: 0 });
      // Keep swallowing real input briefly after mouseup, but let the verdict
      // wait start immediately instead of blocking on this tail.
      guardReleased = true;
      setTimeout(removeInputGuard, CONFIG.inputGuardTailMs);
    } finally {
      if (!guardReleased) removeInputGuard();
    }
  }

  /* ------------------------------------------------------------------ *
   * Solve loop
   *
   * 每次拖拽都会消耗一次服务端失败次数（连续第 5 次失败锁账号），所以一个验证
   * 码会话里最多拖 CONFIG.maxAttempts 次。已经拖过的题不会重复拖，要等组件换
   * 新题才继续；还没拖拽就失败的识别错误不消耗服务端次数，退避后自动重试。
   * ------------------------------------------------------------------ */

  function signatureOf(img) {
    const src = img ? backgroundSource(img) : null;
    if (!src) return null;
    let hash = 0x811c9dc5;
    for (let i = 0; i < src.length; i++) {
      hash ^= src.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `${hash.toString(16)}:${src.length}`;
  }

  function puzzleSignature() {
    const background = signatureOf(pickVisible(SELECTORS.background));
    const notch = signatureOf(pickVisible(SELECTORS.notch));
    if (!background || !notch) return null;
    return `${background}|${notch}`;
  }

  async function waitFor(condition, timeoutMs, intervalMs = CONFIG.verdictPollIntervalMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (condition()) return true;
      await sleep(intervalMs);
    }
    return condition();
  }

  async function waitUntilReady(timeoutMs) {
    const ready = await waitFor(captchaReady, timeoutMs, CONFIG.readyPollIntervalMs);
    if (!ready) throw new Error("滑块图片在超时时间内仍未就绪");
  }

  function clickRefreshButton() {
    const button = pickVisible(SELECTORS.refresh);
    if (!button) return false;
    const view = document.defaultView || window;
    dispatchMouse(button, "click", { bubbles: true, cancelable: true, view });
    return true;
  }

  async function attempt() {
    await waitUntilReady(CONFIG.successWindowMs);

    const backgroundImg = pickVisible(SELECTORS.background);
    const notchImg = pickVisible(SELECTORS.notch);
    if (!backgroundImg || !notchImg) throw new Error("滑块图块在读取前消失");

    const signature = puzzleSignature();
    const background = readPixels(backgroundImg);
    const { distance, crossChecked } = measurePuzzle(background, readPixels(notchImg));
    const dragDistance = toCssDistance(distance, backgroundImg);
    lastDistance = distance;

    // 识别耗时里组件可能已经换题，此时拖拽的偏移量是错的；本轮不拖拽。
    if (!signature || puzzleSignature() !== signature) {
      throw new Error("背景图在识别过程中被替换，本轮不拖拽");
    }

    triedPuzzles.add(signature);
    sessionAttempts++;
    consecutiveErrors = 0;
    awaitingSwapSince = 0;
    refreshRequested = false;

    log(
      `第 ${sessionAttempts} 次尝试：匹配距离 ${distance}px` +
        `${crossChecked ? "（交叉验证）" : ""}，拖拽 ${dragDistance.toFixed(1)}px`,
    );
    showStatus(`识别距离 ${distance}px，正在拖拽…`);

    await dragBy(dragDistance);

    // The widget renders a tips element for both verdicts, so a clear answer
    // does not have to sit out the whole round-trip window. A changed puzzle
    // (the widget swaps it about a second after a wrong drag) is a failure too,
    // which lets the retry start right away instead of waiting out the window.
    let outcome = null;
    await waitFor(() => {
      if (!captchaVisible()) {
        outcome = "closed";
        return true;
      }
      const verdict = captchaVerdict();
      if (verdict !== null) {
        outcome = verdict;
        return true;
      }
      if (signature !== null && puzzleSignature() !== signature) {
        outcome = "swapped";
        return true;
      }
      return false;
    }, CONFIG.successWindowMs, CONFIG.verdictPollIntervalMs);

    if (outcome === "success" || outcome === "closed") {
      armed = false;
      log(`通过：距离 ${distance}px，第 ${sessionAttempts} 次`);
      showStatus(`已通过（${distance}px，第 ${sessionAttempts} 次）`, "ok");
      if (outcome === "closed") resetSession();
      return;
    }

    // The widget normally swaps the puzzle itself about a second after a wrong
    // drag; clicking refresh mid-swap can capture a half-loaded image. Give it
    // a grace period first, then tick() clicks the refresh button as a fallback.
    awaitingSwapSince = Date.now();
    log(`第 ${sessionAttempts} 次拖拽未通过，等待换题后继续`);
  }

  /* ------------------------------------------------------------------ *
   * Status HUD
   * ------------------------------------------------------------------ */

  let hudElement = null;
  let hudTimer = null;

  function showStatus(message, tone = "info", timeoutMs = CONFIG.hudTimeoutMs) {
    if (!IS_BROWSER) return;
    if (!hudElement || !hudElement.isConnected) {
      hudElement = document.createElement("div");
      hudElement.id = "shengjian-slider-captcha-hud";
      Object.assign(hudElement.style, {
        position: "fixed",
        right: "16px",
        bottom: "16px",
        zIndex: "2147483647",
        maxWidth: "320px",
        padding: "10px 14px",
        borderRadius: "8px",
        font: "13px/1.5 -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif",
        color: "#fff",
        background: "rgba(24, 24, 27, 0.92)",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
        pointerEvents: "none",
        transition: "opacity 0.2s ease",
        opacity: "1",
      });
      document.body.appendChild(hudElement);
    }

    const colors = {
      info: "rgba(24, 24, 27, 0.92)",
      ok: "rgba(22, 101, 52, 0.95)",
      error: "rgba(153, 27, 27, 0.95)",
    };
    hudElement.style.background = colors[tone] || colors.info;
    hudElement.textContent = `滑块助手：${message}`;
    hudElement.style.opacity = "1";

    clearTimeout(hudTimer);
    const element = hudElement;
    hudTimer = setTimeout(() => {
      element.style.opacity = "0";
      setTimeout(() => {
        if (hudElement === element) hudElement = null;
        element.remove();
      }, 250);
    }, timeoutMs);
  }

  /* ------------------------------------------------------------------ *
   * Watcher
   * ------------------------------------------------------------------ */

  // 一个“验证码会话”= 滑块弹窗出现到消失。会话内的拖拽次数总预算固定，
  // 弹窗一消失就全部清零，下次登录重新开始。
  let running = false;
  let armed = true;
  let sessionAttempts = 0;
  let consecutiveErrors = 0;
  let triedPuzzles = new Set();
  let awaitingSwapSince = 0;
  let refreshRequested = false;
  let nextAttemptAt = 0;
  let stableSignature = null;
  let stableSince = 0;
  let lastDistance = null;
  let tickTimer = null;
  let tickDueAt = 0;
  let lastTickAt = 0;
  // Keep a strong reference: a MutationObserver only referenced by its own
  // closure can be garbage collected and silently stop firing.
  let captchaObserver = null;

  // 所有触发源（MutationObserver、换题稳定定时、退避到期、兜底轮询）都走这里，
  // 30ms 合并一次；更早的定时会覆盖更晚的，避免换题后还傻等旧定时器。
  function scheduleTick(delay = 0) {
    const throttleWait = lastTickAt + CONFIG.mutationThrottleMs - Date.now();
    const wait = Math.max(delay, throttleWait, 0);
    const dueAt = Date.now() + wait;
    if (tickTimer !== null) {
      if (dueAt >= tickDueAt) return;
      clearTimeout(tickTimer);
    }
    tickDueAt = dueAt;
    tickTimer = setTimeout(() => {
      tickTimer = null;
      tickDueAt = 0;
      lastTickAt = Date.now();
      tick();
    }, wait);
  }

  function isCaptchaSubtree(node) {
    if (!node || node.nodeType !== 1) return false;
    if (typeof node.matches === "function" && node.matches(SELECTORS.box)) return true;
    return typeof node.querySelector === "function" && node.querySelector(SELECTORS.box) !== null;
  }

  function mutationTouchesCaptcha(record) {
    if (hudElement && record.target && hudElement.contains(record.target)) return false;
    if (record.type === "attributes") {
      const target = record.target;
      if (!target || target.nodeType !== 1) return false;
      return typeof target.closest === "function" && target.closest(SELECTORS.box) !== null;
    }
    for (const node of record.addedNodes) {
      if (isCaptchaSubtree(node)) return true;
    }
    for (const node of record.removedNodes) {
      if (isCaptchaSubtree(node)) return true;
    }
    return false;
  }

  function observeCaptcha() {
    if (typeof MutationObserver !== "function" || !document.documentElement) return;
    captchaObserver = new MutationObserver((records) => {
      for (const record of records) {
        if (mutationTouchesCaptcha(record)) {
          scheduleTick(CONFIG.mutationThrottleMs);
          return;
        }
      }
    });
    captchaObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "class", "style"],
    });
  }

  function resetSession() {
    armed = true;
    sessionAttempts = 0;
    consecutiveErrors = 0;
    triedPuzzles = new Set();
    awaitingSwapSince = 0;
    refreshRequested = false;
    nextAttemptAt = 0;
    stableSignature = null;
    stableSince = 0;
    lastDistance = null;
  }

  function stop(message) {
    armed = false;
    nextAttemptAt = 0;
    warn(message);
    showStatus(`自动通过失败：${message}`, "error", CONFIG.hudErrorTimeoutMs);
  }

  function handleFailure(error) {
    const message = error && error.message ? error.message : String(error);
    warn(message);

    if (!CONFIG.enabled) return;
    if (!captchaVisible()) {
      resetSession();
      return;
    }
    if (sessionAttempts >= CONFIG.maxAttempts) {
      stop(`滑块验证连续 ${CONFIG.maxAttempts} 次未通过（最后距离 ${lastDistance}px）`);
      return;
    }

    // 走到这里说明还没拖过当前这道题：组件可能只是图还没画好、或刚换题，
    // 这类失败没有消耗服务端次数，退避后自动重试。
    consecutiveErrors++;
    if (consecutiveErrors > CONFIG.maxClientRetries) {
      stop(`连续 ${consecutiveErrors} 次识别失败：${message}`);
      return;
    }

    nextAttemptAt = Date.now() + CONFIG.retryDelayMs;
    showStatus(
      `识别失败，${(CONFIG.retryDelayMs / 1000).toFixed(1)}s 后自动重试 ` +
        `(${consecutiveErrors}/${CONFIG.maxClientRetries})：${message}`,
      "error",
      CONFIG.retryDelayMs + 1000,
    );
  }

  async function tick() {
    if (running || !CONFIG.enabled) return;

    if (!captchaVisible()) {
      resetSession();
      return;
    }
    if (!armed) return;

    if (Date.now() < nextAttemptAt) {
      scheduleTick(nextAttemptAt - Date.now() + 10);
      return;
    }
    if (!captchaReady()) {
      scheduleTick(CONFIG.readyPollIntervalMs);
      return;
    }

    if (sessionAttempts >= CONFIG.maxAttempts) {
      stop(`滑块验证连续 ${CONFIG.maxAttempts} 次未通过（最后距离 ${lastDistance}px）`);
      return;
    }

    const signature = puzzleSignature();
    if (signature === null) {
      stableSignature = null;
      scheduleTick(CONFIG.readyPollIntervalMs);
      return;
    }

    // 背景图和缺口图都换好、并持续稳定一小段时间后才动手，避免抓到半程的图。
    if (signature !== stableSignature) {
      stableSignature = signature;
      stableSince = Date.now();
      scheduleTick(CONFIG.puzzleSettleMs + 10);
      return;
    }
    if (Date.now() - stableSince < CONFIG.puzzleSettleMs) {
      scheduleTick(CONFIG.puzzleSettleMs - (Date.now() - stableSince) + 10);
      return;
    }

    if (triedPuzzles.has(signature)) {
      if (!awaitingSwapSince) awaitingSwapSince = Date.now();

      // 组件通常会自己换题；等不到就直接点它的刷新按钮拉新题，全自动重试。
      if (!refreshRequested) {
        const clickAt = awaitingSwapSince + CONFIG.refreshClickDelayMs;
        if (Date.now() < clickAt) {
          scheduleTick(clickAt - Date.now() + 10);
        } else {
          refreshRequested = true;
          const clicked = clickRefreshButton();
          log(clicked ? "组件未自动换题，已自动点击刷新" : "组件未自动换题，且未找到刷新按钮");
          if (clicked) {
            awaitingSwapSince = Date.now();
            showStatus("组件没有自动换题，已自动刷新，等待新题…", "info", CONFIG.hudTimeoutMs);
          }
        }
      }

      const swapTimeoutAt = awaitingSwapSince + CONFIG.puzzleSwapTimeoutMs;
      if (Date.now() >= swapTimeoutAt) {
        stop(
          `滑块第 ${sessionAttempts} 次拖拽未通过，且 ${CONFIG.puzzleSwapTimeoutMs / 1000}s 内没有换新题；` +
            `重复拖拽同一道题只会再消耗一次失败次数，因此停止（最后距离 ${lastDistance}px）`,
        );
        return;
      }
      scheduleTick(swapTimeoutAt - Date.now() + 10);
      return;
    }

    running = true;
    try {
      await attempt();
    } catch (error) {
      handleFailure(error);
    } finally {
      running = false;
      scheduleTick(0);
    }
  }

  function setEnabled(value) {
    CONFIG.enabled = Boolean(value);
    if (typeof GM_setValue === "function") GM_setValue("enabled", CONFIG.enabled);
    if (CONFIG.enabled) {
      resetSession();
      scheduleTick(0);
    }
    showStatus(CONFIG.enabled ? "自动通过已开启" : "自动通过已关闭", CONFIG.enabled ? "ok" : "info", 2000);
  }

  function bootstrap() {
    if (typeof GM_getValue === "function") {
      const stored = GM_getValue("enabled", true);
      CONFIG.enabled = stored !== false;
    }
    if (typeof GM_registerMenuCommand === "function") {
      GM_registerMenuCommand("自动通过滑块：开 / 关", () => setEnabled(!CONFIG.enabled));
    }
    log("已加载 v1.2.4");
    observeCaptcha();
    scheduleTick(0);
    setInterval(tick, CONFIG.pollIntervalMs);
  }

  /* ------------------------------------------------------------------ *
   * Exports (used by the offline test suite)
   * ------------------------------------------------------------------ */

  const api = {
    CONFIG,
    SELECTORS,
    measurePuzzle,
    buildMask,
    maskedSqDiff,
    maskedCorrelation,
    toCssDistance,
    readPixels,
  };
  globalThis.__SHENGJIAN_SLIDER_CAPTCHA__ = api;

  if (IS_BROWSER) bootstrap();
})();
