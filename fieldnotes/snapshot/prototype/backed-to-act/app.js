/* ══════════════════════════════════════════════════════════════════════════
   Backed to Act · an agent operations console
   No framework, no build step, no external request. Three files.

   The navigation, the camera, the hash router, the live regions and the
   skip-to-heading behaviour are inherited from prototype/resilience-grid.
   What is this prototype's own is the ground it draws, ONE table — LAYOUT —
   that says which side of the line each document sits on, and ONE state
   object — S — that every screen renders from.

   STATE
     S.mode       "none" | "bounded"  — set ONLY by the two buttons on
                  screen 3. Navigating forward never authorises anything.
     S.simulated  screen 4, draft only: the authorised day shown as a
                  simulation. It never writes S.mode.
     S.choice     screen 5: keep | narrow | expand | null. Future authority
                  only; nothing on screen 4 reads it.

   WHAT IS INVENTED
   All of it. The company, the agent, every purchase order, the limit, the
   cover and the arrangement are invented, and screen 1 says so. No real AI
   provider, customer or insurer is described, and no premium, share or
   limit is modelled.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var W = 1600, H = 1000;
  var CONSOLE = "#1E242B", LINE = "#3C4650", LINE2 = "#5A6773";

  var svg = document.getElementById("field");
  var vb = null, camTimer = 0;

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* deterministic, so the field draws identically every time */
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

  function smooth(pts) {
    var d = "M" + pts[0][0] + " " + pts[0][1].toFixed(1), i, p, c, mx, my;
    for (i = 1; i < pts.length; i++) {
      p = pts[i - 1]; c = pts[i];
      mx = (p[0] + c[0]) / 2; my = (p[1] + c[1]) / 2;
      d += "Q" + p[0] + " " + p[1].toFixed(1) + " " + mx + " " + my.toFixed(1);
    }
    return d + "L" + pts[pts.length - 1][0] + " " + pts[pts.length - 1][1].toFixed(1);
  }

  /* ── THE GROUND · drawn once ─────────────────────────────────────────── */
  function renderField() {
    var s = [];
    s.push('<defs>' +
      '<pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">' +
        '<circle cx="1.4" cy="1.4" r="1.4" fill="' + LINE + '"/></pattern>' +
      '<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + CONSOLE + '" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#171C22" stop-opacity=".9"/></linearGradient>' +
      "</defs>");
    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="' + CONSOLE + '"/>');
    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="url(#dots)" opacity=".85"/>');
    for (var vx = 0; vx <= W; vx += 200) {
      s.push('<line x1="' + vx + '" y1="-400" x2="' + vx + '" y2="' + (H + 400) + '" stroke="' + LINE + '" stroke-width="1" opacity=".55"/>');
    }
    s.push('<path d="' + smooth(TRACE) + '" fill="none" stroke="' + LINE2 + '" stroke-width="1.8" opacity=".5"/>');
    s.push('<rect x="-400" y="900" width="' + (W + 800) + '" height="700" fill="url(#fade)"/>');
    svg.innerHTML = s.join("");
  }
  renderField();

  /* ── CAMERA (inherited) ──────────────────────────────────────────────── */
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
  function viewBoxFor(view) {
    var el = document.getElementById("world").getBoundingClientRect();
    var scale = Math.min(window.innerWidth / view.w, window.innerHeight / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2, wcy = view.y + view.h / 2;
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }
  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.boundary;
    var target = viewBoxFor(cam);
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
     PERMISSION AS POSITION — ONE TABLE

     Two ideas kept deliberately separate:
       PERMISSION — what the customer lets the agent do.
       COVER      — the named mistakes the policy pays for inside that.
     Authorising an action does not insure it, and buying cover authorises
     nothing on its own. "place" (placing the order) is the one action that
     changes side; "newsup" (a new supplier, over the limit) never does.

     "compare" exists only as the step below draft-only, so that Narrow on
     screen 5 still means something when the customer never authorised:
     the agent would only compare, and drafting returns to a person.
     ══════════════════════════════════════════════════════════════════════ */
  var LAYOUT = {
    compare: { may: ["compare"],                                ask: ["draft", "recommend", "place", "newsup"] },
    none:    { may: ["compare", "draft", "recommend"],          ask: ["place", "newsup"] },
    bounded: { may: ["compare", "draft", "recommend", "place"], ask: ["newsup"] }
  };
  var LEVELS = ["compare", "none", "bounded"];   /* in order of authority */

  function stepDown(level) {
    var i = LEVELS.indexOf(level);
    return LEVELS[Math.max(0, i - 1)];
  }

  /* THE ONE STATE. S.mode is written by #lv0/#lv1 and by restart, nowhere
     else. Everything on screens 3–5 is rendered from it. */
  var S = { screen: 1, mode: "none", simulated: false, choice: null };

  /* A desk reads the line's position from LAYOUT: the level whose "may"
     list matches is written to data-level, and the CSS puts the line there.
     The paper never moves; the line does. */
  function setDesk(id, level, opts) {
    var desk = document.getElementById(id);
    if (!desk) { return; }
    opts = opts || {};
    var plan = LAYOUT[level] || LAYOUT.none;
    desk.dataset.level = LAYOUT[level] ? level : "none";
    desk.dataset.may = plan.may.join(" ");
    if (opts.prop) { desk.dataset.prop = opts.prop; } else { delete desk.dataset.prop; }
    if (opts.ghost) { desk.dataset.ghost = opts.ghost; } else { delete desk.dataset.ghost; }
  }

  /* one polite live region for state changes that are not screen changes */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  /* ── SCREEN 1 · before any authority ───────────────────────────────── */
  setDesk("desk1", "none");

  /* ── SCREEN 3 · the customer authorises ────────────────────────────── */
  var lv0 = document.getElementById("lv0"), lv1 = document.getElementById("lv1");
  function renderS3() {
    var on = S.mode === "bounded";
    setDesk("desk3", S.mode, { ghost: on ? "none" : null });
    if (lv0) { lv0.setAttribute("aria-pressed", String(!on)); }
    if (lv1) { lv1.setAttribute("aria-pressed", String(on)); }
  }
  function setCover(on, quiet) {
    S.mode = on ? "bounded" : "none";
    S.simulated = false;              /* a new authority decision clears any simulation */
    renderS3(); renderS4(); renderS5();
    if (!quiet) {
      say(on ? "Act within cover. The line moves past the purchase order: the agent may place the order. The new supplier over the limit stays on your side of the line and always needs a person."
             : "Draft only. The purchase order waits on your side of the line. The prepared work sits on the agent's side.");
    }
  }
  if (lv0) { lv0.addEventListener("click", function () { setCover(false); }); }
  if (lv1) { lv1.addEventListener("click", function () { setCover(true); }); }

  /* ── SCREEN 4 · the day that follows ────────────────────────────────
     Derived from S.mode. Draft only shows the day as it would really be —
     nothing placed — and offers one simulation of the authorised day. The
     simulation never writes S.mode: the customer's choice stands. */
  var s4h = document.getElementById("s4-h");
  var simBtn = document.getElementById("simulate-day");
  var simAside = document.getElementById("sim-aside");
  var ordCap = document.getElementById("ord-cap");
  var excCap = document.getElementById("exc-cap");

  function headline(h, a, b) {
    var sp = h ? h.querySelectorAll("span") : [];
    if (sp.length === 2) { sp[0].textContent = a; sp[1].textContent = b; }
  }
  function renderS4() {
    var real = S.mode === "bounded";
    var shown = real || S.simulated;        /* what the desk shows */
    setDesk("desk4", shown ? "bounded" : "none");
    var desk = document.getElementById("desk4");
    if (desk) { desk.dataset.sim = (shown && !real) ? "1" : "0"; }
    if (shown) {
      headline(s4h, "Three orders placed.", "One needed you.");
      if (ordCap) { ordCap.textContent = "3 orders placed"; ordCap.className = ""; }
      if (excCap) { excCap.innerHTML = "<b>1 sent for approval</b><span>new supplier</span>"; }
    } else {
      headline(s4h, "Nothing placed.", "Everything waits for you.");
      if (ordCap) { ordCap.textContent = "3 orders waiting"; ordCap.className = "mark"; ordCap.setAttribute("data-kind", "ask"); }
      if (excCap) { excCap.innerHTML = '<em class="mark" data-kind="hard">1 needs a person</em>'; }
    }
    if (ordCap && shown) { ordCap.removeAttribute("data-kind"); }
    if (simAside) { simAside.hidden = real; }
    if (simBtn) { simBtn.setAttribute("aria-pressed", String(!real && S.simulated)); }
  }
  if (simBtn) {
    simBtn.addEventListener("click", function () {
      if (S.mode === "bounded") { return; }
      S.simulated = !S.simulated;         /* S.mode untouched */
      renderS4();
      say(S.simulated
        ? "Simulation. Your authority is still Draft only. Shown as if you had chosen Act within cover: three orders placed, one covered mistake with restocking paid, one new supplier sent for approval."
        : "Simulation off. Draft only: nothing placed. Three orders waiting, one needs a person.");
    });
  }

  /* ── SCREEN 5 · the next boundary ────────────────────────────────────
     A forward preference, relative to the authority set on screen 3. It
     never edits the day that already happened. An expansion is PROPOSED,
     not granted — granting it would need an approval and a protection
     review — so it is drawn hatched and never reaches the exception. */
  var decSaid = document.getElementById("dec-said");
  var DEC = {
    keep:   { step: 0,  prop: false,
      t: { bounded: "Keep. The line stays where you set it: placing orders stays with the agent; a new supplier over the limit still comes to a person.",
           none:    "Keep. The line stays where you set it: the agent prepares; placing orders stays with a person." } },
    narrow: { step: -1, prop: false,
      t: { bounded: "Narrow. The line moves back: placing orders returns to a person. Today's three orders are unchanged — this is about what happens next.",
           none:    "Narrow. The line moves back: the agent would only compare; drafting returns to a person. Today's results stand." } },
    expand: { step: 0,  prop: true,
      t: { bounded: "Expand. Proposed expansion, hatched: not in force. Approval and protection review required. The new supplier over the limit stays with a person.",
           none:    "Expand. Proposed expansion, hatched: placing orders within cover. Not in force. Approval and protection review required." } }
  };
  function renderS5() {
    var base = S.mode, d = S.choice ? DEC[S.choice] : null;
    var level = base, opts = {};
    if (d && d.step < 0) { level = stepDown(base); opts.ghost = base; }
    if (d && d.prop)     { opts.prop = base === "bounded" ? "sliver" : "bounded"; }
    setDesk("desk5", level, opts);
    var desk = document.getElementById("desk5");
    if (desk) { desk.dataset.decided = S.choice || ""; }
    Array.prototype.forEach.call(document.querySelectorAll(".dec [data-choice]"), function (o) {
      o.setAttribute("aria-pressed", String(o.dataset.choice === S.choice));
    });
    if (decSaid) { decSaid.hidden = !(d && d.prop); }
  }
  function decide(k) {
    S.choice = DEC[k] ? k : null;
    renderS5();
    if (S.choice) { say(DEC[S.choice].t[S.mode]); }
  }
  Array.prototype.forEach.call(document.querySelectorAll(".dec [data-choice]"), function (b) {
    b.addEventListener("click", function () { decide(b.dataset.choice); });
  });

  /* restart: the world before the grant */
  function reset() {
    S.mode = "none"; S.simulated = false; S.choice = null;
    renderS3(); renderS4(); renderS5();
  }
  reset();

  /* ══ NAVIGATION (inherited) ═════════════════════════════════════════ */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;

  var CTA = ["The arrangement", "Authorise", "See it act", "What next", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n; S.screen = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];
    nextBtn.classList.toggle("cta--quiet", n === total);
    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    /* Screen 1 is the world before the grant: arriving on it resets the
       deck so the walkthrough can be run again. Every other screen renders
       from S as it stands — moving forward never authorises. */
    if (n === 1) { reset(); } else { renderS3(); renderS4(); renderS5(); }

    moveCamera(sc.dataset.cam);

    var h = sc.querySelector(".xd");
    var spans = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (spans.length ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ") : h.textContent)
      : sc.dataset.label;
    var extra = "";
    if (n === 4) { extra = S.mode === "bounded" ? " Authority: act within cover." : " Authority: draft only."; }
    if (n === 5) { extra = S.mode === "bounded" ? " Today's line: act within cover." : " Today's line: draft only."; }
    announce.textContent = "Screen " + n + " of " + total + ". " + said.replace(/\s+/g, " ").trim() + extra;

    /* focus must never be left inside a hidden screen */
    var ae = document.activeElement;
    if (ae && ae.closest && ae.closest(".screen") && ae.closest(".screen") !== sc && h) { h.focus(); }

    if (push !== false) {
      try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ }
    }
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

  /* ══ BOOT ═══════════════════════════════════════════════════════════ */
  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      narrow = isNarrow();
      moveCamera(screens[current - 1].dataset.cam, true);
    }, 140);
  });

  /* skip button: focus the open screen's heading without touching the hash */
  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[current - 1];
      var h = sc && sc.querySelector(".xd");
      if (h) { h.focus(); h.scrollIntoView({ block: "start" }); }
    });
  }

  function fromHash() {
    var m = /#s\/(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) : null;
  }
  window.addEventListener("hashchange", function () {
    var n = fromHash();
    if (n !== null && n !== current) { show(n, false); }
  });

  narrow = isNarrow();
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);

  /* read-only view of the state, for QA scripts */
  window.BTA = { state: function () { return { screen: S.screen, mode: S.mode, simulated: S.simulated, choice: S.choice }; } };
})();
