// Minimal AJ-Captcha VerifySlide mock for the headless browser test.
// It follows the same contract as the real widget: mousedown on the handle,
// mousemove/mouseup on window, a refresh button, and a tips element.
(function () {
  "use strict";

  const scenario = window.__SCENARIO || {};
  const puzzles = window.__PUZZLES;
  const order = ["a", "b"];
  const rejectBefore = scenario.rejectDragsBefore || 0;

  const stats = {
    drags: 0,
    downCount: 0,
    refreshClicks: 0,
    swaps: 0,
    manual: 0,
    finalMoveX: null,
    lastExpected: null,
    firstDownLatency: null,
    hudAtSuccess: "",
  };
  window.__STATS = stats;

  let currentIndex = 0;
  let expected = 0;
  let dragActive = false;
  let startX = 0;
  let firstDownAt = 0;
  const host = document.getElementById("host");
  let handle;
  let bgImg;
  let notchImg;
  let tips;

  function applyPuzzle() {
    const key = order[currentIndex];
    expected = puzzles[key].distance;
    bgImg.src = "data:image/png;base64," + puzzles[key].bg;
    notchImg.src = "data:image/png;base64," + puzzles[key].notch;
    notchImg.style.left = puzzles[key].distance + "px";
    tips.className = "verify-tips";
    tips.textContent = "";
  }

  function swapPuzzle() {
    currentIndex = (currentIndex + 1) % order.length;
    stats.swaps++;
    applyPuzzle();
  }

  function readHud() {
    const hud = document.getElementById("shengjian-slider-captcha-hud");
    return hud ? hud.textContent : "";
  }

  function check(moveX) {
    const accepted = stats.drags > rejectBefore && Math.abs(moveX - expected) <= 2;
    if (accepted) {
      stats.success = true;
      tips.className = "verify-tips suc-bg";
      tips.textContent = "验证成功";
      setTimeout(() => {
        stats.hudAtSuccess = readHud();
      }, 350);
      return;
    }

    tips.className = "verify-tips err-bg";
    tips.textContent = "验证失败";
    if (scenario.autoSwapMs > 0) {
      setTimeout(swapPuzzle, scenario.autoSwapMs);
    }
  }

  function onDown(event) {
    if (!firstDownAt) {
      firstDownAt = performance.now();
      stats.firstDownAt = firstDownAt;
      stats.firstDownLatency = firstDownAt - (window.__appearedAt || firstDownAt);
    }
    dragActive = true;
    startX = event.clientX;
    stats.downCount++;

    // Simulate a real user moving the mouse during the automated drag. The
    // userscript must swallow these events in the capture phase.
    if (scenario.interference && stats.downCount === 1) {
      const y = event.clientY;
      setTimeout(() => {
        document.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            clientX: startX - 200,
            clientY: y,
            button: 0,
            buttons: 1,
          }),
        );
        document.dispatchEvent(
          new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            clientX: startX - 200,
            clientY: y,
            button: 0,
            buttons: 0,
          }),
        );
      }, 10);
    }
  }

  function onMove(event) {
    if (!dragActive) return;
    handle.style.transform = "translateX(" + (event.clientX - startX) + "px)";
  }

  function onUp(event) {
    if (!dragActive) return;
    dragActive = false;
    const moveX = event.clientX - startX;
    stats.drags++;
    stats.finalMoveX = moveX;
    stats.lastExpected = expected;
    check(moveX);
  }

  function build() {
    window.__appearedAt = performance.now();
    stats.appearedAt = window.__appearedAt;
    host.innerHTML =
      '<div class="verifybox">' +
      '  <div class="verify-img-panel"><img id="bg" alt=""></div>' +
      '  <div class="verify-sub-block"><img id="notch" alt=""></div>' +
      '  <div class="verify-bar-area">' +
      '    <div class="verify-move-block" id="handle"></div>' +
      '    <i class="verify-refresh" id="refresh">&#8635;</i>' +
      '    <div class="verify-tips" id="tips"></div>' +
      "  </div>" +
      "</div>";

    handle = document.getElementById("handle");
    bgImg = document.getElementById("bg");
    notchImg = document.getElementById("notch");
    tips = document.getElementById("tips");
    const refresh = document.getElementById("refresh");

    applyPuzzle();
    const readyPoll = setInterval(function () {
      if (
        bgImg.complete &&
        bgImg.naturalWidth > 0 &&
        notchImg.complete &&
        notchImg.naturalWidth > 0
      ) {
        stats.imagesReadyAt = performance.now();
        clearInterval(readyPoll);
      }
    }, 5);
    handle.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    refresh.addEventListener("click", function () {
      stats.refreshClicks++;
      swapPuzzle();
    });

    // Simulates the user dragging the slider by hand after the script stopped.
    if (scenario.manualDragAt) {
      setTimeout(function () {
        if (dragActive) return;
        const rect = handle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const init = { bubbles: true, cancelable: true, view: window, clientY: y, button: 0 };
        handle.dispatchEvent(new MouseEvent("mousedown", { ...init, clientX: x, buttons: 1 }));
        document.dispatchEvent(
          new MouseEvent("mousemove", { ...init, clientX: x + expected, buttons: 1 }),
        );
        document.dispatchEvent(
          new MouseEvent("mouseup", { ...init, clientX: x + expected, buttons: 0 }),
        );
        stats.manual++;
      }, scenario.manualDragAt);
    }
  }

  setTimeout(build, scenario.appearDelayMs || 80);

  setTimeout(function () {
    stats.hudFinal = readHud();
    stats.done = true;
    document.getElementById("test-result").textContent = JSON.stringify(stats);
    document.querySelectorAll("script").forEach(function (el) {
      el.remove();
    });
    host.innerHTML = "";
  }, scenario.finalizeMs || 5000);
})();
