/* ══════════════════════════════════════════════════════════════════════════
   Backed to Act · an agent operations console
   No framework, no build step, no external request. Three files.

   Forked from prototype/resilience-grid/app.js. The navigation, the camera,
   the per-screen --fit search, the hash router, the live regions and the
   skip-to-heading behaviour are that file's machinery, inherited verbatim.
   What is new is the ground it draws and the authority control.

   THE GROUND
   Not a map. A console field drawn once in a world 1600 x 1000: a dot grid,
   a few long verticals, one trace of the agent's work running left to right,
   and ONE HORIZONTAL AUTHORITY LINE. That line is the permission boundary,
   and it physically rises when the boundary is moved on screen 2. On screen 3
   four events sit below it and one sits above it — the one that goes back to
   a person. Nothing on the field is readable and nothing needs to be; every
   word on the page is on an opaque plate.

   WHAT IS INVENTED
   All of it. Halden, Calder Supply Co., the agent, Dana Ruiz, every purchase
   order, every figure, the spend limit and the cover itself are invented, and
   the screens say so. No real AI provider, customer or insurer is described,
   and no real company's name carries any figure here.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var W = 1600, H = 1000;

  var CONSOLE = "#1E242B",
      PANEL   = "#262E36",
      LINE    = "#3C4650",
      LINE2   = "#5A6773",
      PAPER   = "#FBF9F1",
      ACT     = "#74C79A",
      HOLD    = "#E2A75C",
      ESC     = "#F3977A",
      COVER   = "#8FBEE4";

  /* The two resting heights of the authority line, in world units. Chosen so
     that under every one of the three cameras the line lands in OPEN FIELD
     between the plates rather than behind one, and so the rise between them
     is large enough to read as a movement. */
  var AUTH_Y = [880, 694];

  var svg = document.getElementById("field");
  var vb = null, camTimer = 0, authTimer = 0;
  var authY = AUTH_Y[0];

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Deterministic, so the field redraws identically every time rather than
     shimmering between frames of the authority tween. */
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 1103515245 + 12345) % 2147483648; return (s % 10000) / 10000; };
  }

  /* the activity trace — the agent's work, as one quiet line */
  var TRACE = (function () {
    var r = rng(8311), pts = [], x;
    for (x = -120; x <= W + 120; x += 64) {
      pts.push([x, 742 + Math.sin(x / 190) * 52 + (r() - 0.5) * 48]);
    }
    return pts;
  })();

  /* the queue, screen 1: work piling up behind the line it cannot cross */


  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;

  var CTA = ["Grant the authority", "See it act", "Start again"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];
    // On the last screen the decision is the primary action, so the forward
    // control steps back to a quiet treatment rather than pulling the eye.
    nextBtn.classList.toggle("cta--quiet", n === total);

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    /* Returning to screen 1 resets the walkthrough: the line drops back and
       the deck can be run again. Screens 2 and 3 keep what the room set. */
    if (n === 1) { setCover(false); }

    fitScreen(sc);
    redraw();
    moveCamera(sc.dataset.cam);

    /* Headlines are authored as one span per line, so textContent would run
       the lines together. Join the spans with a space instead. */
    var h = sc.querySelector(".display");
    var spans = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (spans.length
          ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ")
          : h.textContent)
      : sc.dataset.label;
    announce.textContent = "Screen " + n + " of " + total + ". " +
      said.replace(/\s+/g, " ").trim();

    if (push !== false) {
      try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ }
    }
  }

  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", function () { show(current + 1); });
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (t) { show(parseInt(t.dataset.goto, 10)); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button") { return; }
    if (e.key === "ArrowRight") { show(current + 1); }
    if (e.key === "ArrowLeft") { show(current - 1); }
  });

  /* ══════════════════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════════════════ */

  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      narrow = isNarrow();
      /* The window is the stage. Every screen is re-fitted to the new one,
         not just the visible one, so a resize can never leave a hidden screen
         holding a scale that was right for a different window. */
      screens.forEach(function (s) {
        var h = s.hidden;
        if (h) { s.hidden = false; }
        fitScreen(s);
        if (h) { s.hidden = true; }
      });
      moveCamera(screens[current - 1].dataset.cam, true);
    }, 140);
  });

  /* Skip button: move focus to the open screen's heading, without touching
     the hash. Every .display carries tabindex="-1" so it can receive focus. */
  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[current - 1];
      var h = sc && (sc.querySelector(".display") || sc.querySelector(".eyebrow"));
      if (h) { h.focus(); h.scrollIntoView({ block: "start" }); }
    });
  }

  function fromHash() {
    var m = /#s\/(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) : null;
  }
  window.addEventListener("hashchange", function () {
    /* An unrecognised hash means something else on the page used one — it is
       not a request to go to screen 1. */
    var n = fromHash();
    if (n !== null && n !== current) { show(n, false); }
  });

  narrow = isNarrow();
  authY = AUTH_Y[0];
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);
})();
