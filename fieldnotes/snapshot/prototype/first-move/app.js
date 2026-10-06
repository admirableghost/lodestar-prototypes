/* ══════════════════════════════════════════════════════════════════════════
   First Move · the opening bookend
   Two screens. No framework, no build step, no external request.

   Forked from prototype/resilience-grid/app.js, with the county ground and
   its camera removed — this prototype has no map. What is inherited is the
   part that matters: the per-screen --fit search (desktop only), the
   navigation, the two live regions, the skip button and the pin-free deck.

   WHAT THIS IS, AND IS NOT
   A clearly-labelled RECONSTRUCTION of the kind of exchange a person can
   already have with a general assistant about insurance. It is not a
   recording, it is not a transcript of any real product, and no real
   assistant, insurer, price or document is named or quoted. The screens say
   so. The brief preferred an honest current-state recording; capturing one
   would have meant putting real products and real quotes on screen, which
   the confidentiality rule and the no-invented-precision rule both forbid.

   THE BEAT
   Screen 1: the assistant already does the analysis — more of it, and more
   patiently, than a person would.
   Screen 2: it stops. The thing it cannot do is commit. A person signs.
   Then the question the last prototype in the set answers.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════
     THE GROUND — a quiet field, not a map.
     Faint ruled lines, the way a document sits under a conversation.
     ══════════════════════════════════════════════════════════════════════ */

  var svg = document.getElementById("field");
  if (svg) {
    var s = [], i;
    s.push('<rect x="-50" y="-50" width="1700" height="1100" fill="#F4F2EA"/>');
    for (i = 0; i < 26; i++) {
      s.push('<line x1="-50" y1="' + (i * 42 + 20) + '" x2="1650" y2="' + (i * 42 + 20) +
             '" stroke="#8A8A92" stroke-width="1" opacity=".10"/>');
    }
    /* a single column rule, so the field reads as a page rather than paper */
    s.push('<line x1="300" y1="-50" x2="300" y2="1050" stroke="#8A8A92" stroke-width="1" opacity=".13"/>');
    s.push('<line x1="1300" y1="-50" x2="1300" y2="1050" stroke="#8A8A92" stroke-width="1" opacity=".13"/>');
    svg.innerHTML = s.join("");
    svg.setAttribute("viewBox", "0 0 1600 1000");
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE READ — screen 1's visible action.
     The assistant works through documents one at a time. Pressing the
     control runs it; it is the only interaction in the prototype, and it
     exists to show that the analysis is the easy part.
     ══════════════════════════════════════════════════════════════════════ */

  var readRows = Array.prototype.slice.call(document.querySelectorAll("#read .tl-row"));
  var readStep = readRows.length, readTimer = null;
  var statusEl = document.getElementById("state-status");
  function say(m) { if (statusEl) { statusEl.textContent = m; } }

  function paintRead() {
    readRows.forEach(function (r, i) { r.dataset.on = i < readStep ? "1" : "0"; });
    var b = document.getElementById("read-play");
    if (b) {
      b.textContent = readTimer ? "Pause"
                    : readStep >= readRows.length ? "Run it again"
                    : readStep === 0 ? "Watch it read" : "Resume";
    }
    var done = document.getElementById("read-count");
    if (done) {
      done.textContent = readStep >= readRows.length
        ? "Four documents, every exclusion, in the time it takes to read one."
        : readStep + " of " + readRows.length + " read.";
    }
    refit();
  }
  function readStop() { clearInterval(readTimer); readTimer = null; }
  function readRun() {
    if (readTimer) { readStop(); paintRead(); say("Paused."); return; }
    if (readStep >= readRows.length) { readStep = 0; }
    readTimer = setInterval(function () {
      readStep++;
      if (readStep >= readRows.length) { readStep = readRows.length; readStop(); say("Finished reading."); }
      paintRead();
    }, 900);
    readStep++; paintRead();
  }
  var readBtn = document.getElementById("read-play");
  if (readBtn) { readBtn.addEventListener("click", readRun); }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim. Floors live in the CSS; this only shrinks
     padding and gaps once type has bottomed out, and never runs on narrow.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;
  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  function anchorPlates() {
    Array.prototype.forEach.call(
      // Only CARDS get pinned to the top or bottom of their band. The
      // executive compositions place their own hero objects, and an inline
      // align-self written here would silently beat their stylesheet.
      document.querySelectorAll(".screen > .plate[style*='grid-area']"), function (el) {
        var m = /grid-area:\s*(\d+)\s*\/\s*\d+\s*\/\s*(\d+)/.exec(el.getAttribute("style") || "");
        if (!m) { return; }
        el.style.alignSelf = (+m[2] === 9 && +m[1] > 1) ? "end" : "start";
      });
  }

  function stageBox(sc) {
    var r = sc.getBoundingClientRect(), cs = getComputedStyle(sc);
    return { top: r.top + parseFloat(cs.paddingTop), bottom: r.bottom - parseFloat(cs.paddingBottom),
             left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight) };
  }

  function spills(sc) {
    if (narrow) { return false; }
    var box = stageBox(sc), rects = [], bad = false, i, j;
    Array.prototype.forEach.call(sc.children, function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) { return; }
      if (r.top < box.top - 1 || r.bottom > box.bottom + 1 ||
          r.left < box.left - 1 || r.right > box.right + 1) { bad = true; }
      rects.push(r);
    });
    for (i = 0; i < rects.length && !bad; i++) {
      for (j = i + 1; j < rects.length; j++) {
        if (rects[i].left < rects[j].right - 1 && rects[i].right > rects[j].left + 1 &&
            rects[i].top < rects[j].bottom - 1 && rects[i].bottom > rects[j].top + 1) { bad = true; break; }
      }
    }
    return bad;
  }

  function fitScreen(sc) {
    if (!sc || sc.hidden) { return; }
    sc.style.setProperty("--fit", "1");
    if (narrow) { return; }
    if (!spills(sc)) { return; }
    var lo = FIT_FLOOR, hi = 1, best = FIT_FLOOR, mid, i;
    for (i = 0; i < 7; i++) {
      mid = (lo + hi) / 2;
      sc.style.setProperty("--fit", mid.toFixed(4));
      if (spills(sc)) { hi = mid; } else { lo = mid; best = mid; }
    }
    sc.style.setProperty("--fit", best.toFixed(4));
    for (i = 0; i < 8 && best > FIT_FLOOR && spills(sc); i++) {
      best = Math.max(FIT_FLOOR, best - 0.025);
      sc.style.setProperty("--fit", best.toFixed(4));
    }
  }

  var fitPending = null;
  function refit() {
    cancelAnimationFrame(fitPending);
    fitPending = requestAnimationFrame(function () { fitScreen(screens && screens[current - 1]); });
  }

  /* ══════════════════════════════════════════════════════════════════════
     NAVIGATION — inherited
     ══════════════════════════════════════════════════════════════════════ */

  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;

  var CTA = ["Where it stops", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();
  paintRead();

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];
    if (n !== 1) { readStop(); }
    fitScreen(sc);

    var h = sc.querySelector(".display");
    var spans = h ? h.querySelectorAll("span") : [];
    var said = h ? (spans.length
        ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ")
        : h.textContent) : sc.dataset.label;
    announce.textContent = "Screen " + n + " of " + total + ". " + said.replace(/\s+/g, " ").trim();

    if (push !== false) { try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ } }
  }

  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", function () { show(current + 1); });
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button") { return; }
    if (e.key === "ArrowRight") { show(current + 1); }
    if (e.key === "ArrowLeft") { show(current - 1); }
  });

  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[current - 1];
      var h = sc && (sc.querySelector(".display") || sc.querySelector(".eyebrow"));
      if (h) { h.focus(); h.scrollIntoView({ block: "start" }); }
    });
  }

  function fromHash() { var m = /#s\/(\d+)/.exec(location.hash); return m ? parseInt(m[1], 10) : null; }
  window.addEventListener("hashchange", function () {
    var n = fromHash(); if (n !== null && n !== current) { show(n, false); }
  });

  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      narrow = isNarrow();
      screens.forEach(function (s) {
        var h = s.hidden; if (h) { s.hidden = false; }
        fitScreen(s); if (h) { s.hidden = true; }
      });
    }, 140);
  });

  narrow = isNarrow();
  show(fromHash() || 1, false);
})();
