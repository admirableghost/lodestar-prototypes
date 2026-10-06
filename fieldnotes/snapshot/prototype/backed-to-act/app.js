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
  var QUEUE = (function () {
    var r = rng(515), a = [], i;
    for (i = 0; i < 23; i++) {
      a.push([150 + (i % 6) * 26, 846 - Math.floor(i / 6) * 22, 70 + r() * 130]);
    }
    return a;
  })();

  /* screen 3 · five events. Four sit inside the boundary; the fifth is above
     the authority line, with a dashed stem back down to it. */
  var EVENTS = [
    { x: 780,  y: 772, over: false },
    { x: 960,  y: 796, over: false },
    { x: 1140, y: 760, over: false },
    { x: 1320, y: 784, over: false },
    { x: 1430, y: 600, over: true  }
  ];

  function smooth(pts) {
    var d = "M" + pts[0][0] + " " + pts[0][1].toFixed(1), i, p, c, mx, my;
    for (i = 1; i < pts.length; i++) {
      p = pts[i - 1]; c = pts[i];
      mx = (p[0] + c[0]) / 2; my = (p[1] + c[1]) / 2;
      d += "Q" + p[0] + " " + p[1].toFixed(1) + " " + mx + " " + my.toFixed(1);
    }
    return d + "L" + pts[pts.length - 1][0] + " " + pts[pts.length - 1][1].toFixed(1);
  }

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE FIELD
       opts.queue  — the held work, screen 1
       opts.events — the day's five actions, screen 3
     ══════════════════════════════════════════════════════════════════════ */

  function renderField(opts) {
    opts = opts || {};
    var s = [];

    s.push('<defs>' +
      '<pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">' +
        '<circle cx="1.4" cy="1.4" r="1.4" fill="' + LINE + '"/></pattern>' +
      '<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + CONSOLE + '" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#171C22" stop-opacity=".9"/></linearGradient>' +
      "</defs>");

    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) +
           '" fill="' + CONSOLE + '"/>');
    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) +
           '" fill="url(#dots)" opacity=".85"/>');

    /* a few long verticals, so the field has a direction */
    for (var vx = 0; vx <= W; vx += 200) {
      s.push('<line x1="' + vx + '" y1="-400" x2="' + vx + '" y2="' + (H + 400) +
             '" stroke="' + LINE + '" stroke-width="1" opacity=".55"/>');
    }

    /* the trace */
    s.push('<path d="' + smooth(TRACE) + '" fill="none" stroke="' + LINE2 +
           '" stroke-width="1.8" opacity=".5"/>');

    /* held work, piled behind a vertical hold rule */
    if (opts.queue) {
      s.push('<line x1="120" y1="600" x2="120" y2="900" stroke="' + HOLD +
             '" stroke-width="1.6" stroke-dasharray="5 7" opacity=".42"/>');
      QUEUE.forEach(function (q) {
        s.push('<rect x="' + q[0] + '" y="' + q[1] + '" width="' + q[2].toFixed(0) +
               '" height="9" rx="2" fill="' + HOLD + '" opacity=".16"/>');
      });
    }

    /* ── THE AUTHORITY LINE ── the permission boundary, as a line that moves */
    var c = opts.events ? COVER : (authY > 790 ? HOLD : ACT);
    s.push('<line x1="-400" y1="' + authY.toFixed(1) + '" x2="' + (W + 400) + '" y2="' + authY.toFixed(1) +
           '" stroke="' + c + '" stroke-width="1.6" stroke-dasharray="16 12" opacity=".40"/>');
    s.push('<rect x="-400" y="' + authY.toFixed(1) + '" width="' + (W + 800) + '" height="' + (H + 400) +
           '" fill="' + c + '" opacity=".045"/>');

    /* the day's events: four inside the boundary, one above it */
    if (opts.events) {
      EVENTS.forEach(function (e) {
        if (e.over) {
          s.push('<circle cx="' + e.x + '" cy="' + e.y + '" r="13" fill="none" stroke="' + ESC +
                 '" stroke-width="2.4" opacity=".62"/>');
          s.push('<line x1="' + e.x + '" y1="' + (e.y + 13) + '" x2="' + e.x + '" y2="' + authY.toFixed(1) +
                 '" stroke="' + ESC + '" stroke-width="1.4" stroke-dasharray="4 6" opacity=".45"/>');
        } else {
          s.push('<rect x="' + (e.x - 6) + '" y="' + (e.y - 6) + '" width="12" height="12" rx="2" fill="' +
                 ACT + '" opacity=".55"/>');
        }
      });
    }

    /* seat the field into the bottom of the frame, below everything the
       field actually says anything with */
    s.push('<rect x="-400" y="900" width="' + (W + 800) + '" height="700" fill="url(#fade)"/>');

    svg.innerHTML = s.join("");
  }

  function tweenAuth(target, instant) {
    cancelAnimationFrame(authTimer);
    if (instant || reduced()) { authY = target; redraw(); return; }
    var from = authY, t0 = performance.now(), DUR = 620;
    (function step(now) {
      var u = Math.min(1, (now - t0) / DUR);
      var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      authY = from + (target - from) * e;
      redraw();
      if (u < 1) { authTimer = requestAnimationFrame(step); }
    })(t0);
  }

  function redraw() {
    renderField({ queue: current === 1, events: current === 3 });
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited from resilience-grid/app.js)
     ══════════════════════════════════════════════════════════════════════ */

  var CAM = {
    queue:    { x: 60,  y: 380, w: 1180, h: 600 },
    boundary: { x: 120, y: 240, w: 1360, h: 700 },
    run:      { x: 180, y: 200, w: 1340, h: 680 }
  };
  var CAM_N = {
    queue:    { x: 80,  y: 560, w: 1100, h: 420 },
    boundary: { x: 200, y: 300, w: 1200, h: 520 },
    run:      { x: 240, y: 240, w: 1200, h: 520 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  function setVB(c) {
    svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h);
    vb = c;
  }

  function viewBoxFor(view, fit) {
    var el = document.getElementById("world").getBoundingClientRect();
    var vpW = window.innerWidth, vpH = window.innerHeight;
    var scale = Math.min(vpW / view.w, (fit ? fit.h : vpH) / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2;
    var wcy = view.y + view.h / 2 + (fit ? (vpH / 2 - fit.cy) / scale : 0);
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }

  function narrowFit() {
    if (!narrow) { return null; }
    var sc = screens && screens[current - 1];
    if (!sc) { return null; }
    var gw = sc.querySelector(".gw");
    if (gw) {
      var g = gw.getBoundingClientRect();
      var top = Math.max(0, g.top), bot = Math.min(window.innerHeight, g.bottom);
      if (bot - top > 110) { return { cy: (top + bot) / 2, h: bot - top }; }
    }
    return null;
  }

  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.boundary;
    var target = viewBoxFor(cam, narrowFit());
    if (!vb || instant || reduced()) { setVB(target); return; }
    var from = vb, t0 = performance.now(), DUR = 540;
    cancelAnimationFrame(camTimer);
    (function step(now) {
      var u = Math.min(1, (now - t0) / DUR);
      var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      setVB({
        x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e
      });
      if (u < 1) { camTimer = requestAnimationFrame(step); }
    })(t0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE AUTHORITY — the one interaction in the deck
     ══════════════════════════════════════════════════════════════════════ */

  /* One polite live region for state changes that are not screen changes.
     The screen announcer (#announce) handles navigation; this handles the
     boundary moving, so the two never overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  var level = 0;

  /* Every string the boundary changes, in one place, so the copy can be
     swapped without touching the layout. */
  var AUTHORITY = [
    {
      bar:   "Autonomy · Draft only",
      grant: "Not granted. The agent drafts; a buyer commits.",
      mark:  "○",
      fig:   "$0",
      unit:  "nothing may be committed",
      week:  "No weekly ceiling, because there is no authority to ceiling.",
      badge: "Needs a buyer"
    },
    {
      bar:   "Autonomy · Act within cover",
      grant: "Granted by Dana Ruiz, head of purchasing, Calder Supply Co. Cover attached by an insurance partner, 06:12.",
      mark:  "◆",
      fig:   "$25,000",
      unit:  "per order, no person involved",
      week:  "$180,000 per week across all 22 branches. Past either number, it stops.",
      badge: "Agent acts"
    }
  ];

  var authEl   = document.getElementById("auth");
  var grantEl  = document.getElementById("grant");
  var grantTxt = document.getElementById("grant-txt");
  var limitEl  = document.getElementById("limit");
  var barState = document.getElementById("cbar-state");
  var barTxt   = document.getElementById("cbar-state-txt");

  function paintAuthority(animate) {
    var a = AUTHORITY[level];

    if (authEl) {
      authEl.dataset.level = String(level);
      Array.prototype.forEach.call(authEl.querySelectorAll("[data-set]"), function (b) {
        b.setAttribute("aria-pressed", (+b.dataset.set === level) ? "true" : "false");
      });
    }
    if (grantEl) {
      grantEl.dataset.on = level ? "1" : "0";
      grantEl.querySelector(".grant-mark").textContent = a.mark;
      grantTxt.textContent = a.grant;
    }
    if (limitEl) {
      limitEl.dataset.on = level ? "1" : "0";
      document.getElementById("limit-fig").textContent  = a.fig;
      document.getElementById("limit-unit").textContent = a.unit;
      document.getElementById("limit-2").textContent    = a.week;
    }
    Array.prototype.forEach.call(document.querySelectorAll("#perms .perm"), function (p) {
      if (p.classList.contains("perm--back")) { return; }
      p.dataset.on = level ? "1" : "0";
      p.querySelector(".perm-badge").textContent = a.badge;
    });

    /* the vendor bar carries the live state of the whole console */
    if (barState) {
      barState.dataset.on = level ? "1" : "0";
      barTxt.textContent = a.bar;
    }

    tweenAuth(AUTH_Y[level], !animate);
    refit();
  }

  function setLevel(n, announce) {
    if (n === level) { return; }
    level = n;
    paintAuthority(true);
    if (announce) {
      say(level
        ? "Authority granted. The agent may act unsupervised up to twenty-five thousand dollars per order, with mistakes covered. Single-source parts and anything over the limit still return to a buyer."
        : "Authority withdrawn. The agent may draft only; every order waits for a buyer.");
    }
  }

  if (authEl) {
    Array.prototype.forEach.call(authEl.querySelectorAll("[data-set]"), function (b) {
      b.addEventListener("click", function () { setLevel(+b.dataset.set, true); });
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim from resilience-grid/app.js.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  function anchorPlates() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".screen > [style*='grid-area']"), function (el) {
        var m = /grid-area:\s*(\d+)\s*\/\s*\d+\s*\/\s*(\d+)/.exec(el.getAttribute("style") || "");
        if (!m) { return; }
        el.style.alignSelf = (+m[2] === 9 && +m[1] > 1) ? "end" : "start";
      });
  }

  function stageBox(sc) {
    var r = sc.getBoundingClientRect(), cs = getComputedStyle(sc);
    return {
      top: r.top + parseFloat(cs.paddingTop), bottom: r.bottom - parseFloat(cs.paddingBottom),
      left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight)
    };
  }

  function spills(sc) {
    if (narrow) { return sc.scrollHeight > sc.clientHeight + 1; }

    var box = stageBox(sc), rects = [], bad = false, i, j;
    Array.prototype.forEach.call(sc.children, function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) { return; }
      if (r.top < box.top - 1 || r.bottom > box.bottom + 1 ||
          r.left < box.left - 1 || r.right > box.right + 1) { bad = true; }
      rects.push(r);
    });
    /* two opaque plates over one another is the same defect as a cut line:
       one of them is unreadable */
    for (i = 0; i < rects.length && !bad; i++) {
      for (j = i + 1; j < rects.length; j++) {
        if (rects[i].left < rects[j].right - 1 && rects[i].right > rects[j].left + 1 &&
            rects[i].top < rects[j].bottom - 1 && rects[i].bottom > rects[j].top + 1) {
          bad = true; break;
        }
      }
    }
    /* and anything inside a plate that its own box is hiding. A 1px box is
       the visually-hidden idiom and is not a defect. */
    if (!bad) {
      Array.prototype.forEach.call(sc.querySelectorAll("*"), function (el) {
        if (bad) { return; }
        if (el.clientWidth <= 1 || el.clientHeight <= 1) { return; }
        if (!el.textContent || !el.textContent.trim()) { return; }
        var cs = getComputedStyle(el);
        if (cs.overflowY !== "visible" && el.scrollHeight > el.clientHeight + 2) { bad = true; }
        if (cs.overflowX !== "visible" && el.scrollWidth > el.clientWidth + 2) { bad = true; }
      });
    }
    return bad;
  }

  function fitScreen(sc) {
    if (!sc || sc.hidden) { return; }
    sc.style.setProperty("--fit", "1");

    /* NARROW NEVER SHRINKS.
       The --fit search exists so a desktop composition stays inside a stage
       that does not scroll. A phone screen DOES scroll, so running the search
       there buys nothing and costs everything: it drove uppercase labels to
       6.4px across the whole set. Below 900px the type holds its size and the
       screen scrolls. */
    if (narrow) { return; }

    if (!spills(sc)) { return; }

    var lo = FIT_FLOOR, hi = 1, best = FIT_FLOOR, mid, i;
    for (i = 0; i < 7; i++) {
      mid = (lo + hi) / 2;
      sc.style.setProperty("--fit", mid.toFixed(4));
      if (spills(sc)) { hi = mid; } else { lo = mid; best = mid; }
    }
    sc.style.setProperty("--fit", best.toFixed(4));
    /* Reflow is not perfectly monotonic — one word rewrapping can undo a
       step — so verify, and step down if the search landed on a bad value. */
    for (i = 0; i < 8 && best > FIT_FLOOR && spills(sc); i++) {
      best = Math.max(FIT_FLOOR, best - 0.025);
      sc.style.setProperty("--fit", best.toFixed(4));
    }
  }

  var fitPending = null;
  function refit() {
    cancelAnimationFrame(fitPending);
    fitPending = requestAnimationFrame(function () {
      fitScreen(screens && screens[current - 1]);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     NAVIGATION
     ══════════════════════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the closing decision

     A workshop beat, not a settings control. It changes no limit and writes
     no state into the story: the point is that the room has just seen what
     the cover absorbed, and now has to say whether that evidence moves what
     they would let the software do. Nothing is preselected, and each answer
     opens an argument rather than confirming a setting.
     ══════════════════════════════════════════════════════════════════════ */

  var CHOICE = {
    keep:   "The boundary stays. The cover paid for exactly the kind of mistake it was bought for, and a buyer still saw the order that needed one.",
    narrow: "A tighter boundary means fewer orders placed without a person — and the covered mistake would have waited for one too.",
    expand: "A wider boundary asks the insurer to price a larger loss, not just the business to tolerate one. The limit is theirs to move, not Calder's alone."
  };

  (function () {
    var said = document.getElementById("choice-said");
    var btns = Array.prototype.slice.call(document.querySelectorAll(".choice-btn"));
    if (!said || !btns.length) { return; }

    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.choice;
        btns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        said.textContent = CHOICE[k];
        said.hidden = false;
        var status = document.getElementById("state-status");
        if (status) { status.textContent = b.textContent.trim() + ". " + CHOICE[k]; }
      });
    });
  }());


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

    /* The story's authority state. Screen 1 is the world before the grant, so
       returning to it resets the deck and the walkthrough can be run again;
       screen 3 is the world after it, so arriving there grants it if the
       viewer skipped the control. Screen 2 keeps whatever the viewer set. */
    if (n === 1 && level !== 0) { level = 0; }
    if (n === 3 && level !== 1) { level = 1; }
    paintAuthority(false);

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
