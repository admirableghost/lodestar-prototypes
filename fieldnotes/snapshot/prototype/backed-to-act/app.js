/* ══════════════════════════════════════════════════════════════════════════
   Backed to Act · an agent operations console
   No framework, no build step, no external request. Three files.

   The navigation, the camera, the hash router, the live regions and the
   skip-to-heading behaviour are inherited from prototype/resilience-grid.
   What is this prototype's own is the ground it draws and ONE table —
   LAYOUT — that says which side of the line each document sits on. Every
   screen's desk is derived from it, so there is one source of truth for
   what the agent may do.

   WHAT IS INVENTED
   All of it. The company, the agent, every purchase order, every figure,
   the limit and the cover itself are invented, and screen 1 says so. No
   real AI provider, customer or insurer is described.
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
     ══════════════════════════════════════════════════════════════════════ */
  var LAYOUT = {
    none:    { may: ["compare", "draft", "recommend"], ask: ["place", "newsup"] },
    bounded: { may: ["compare", "draft", "recommend", "place"], ask: ["newsup"] }
  };

  /* A desk reads the order's side from LAYOUT: "may" puts the line past the
     order, "ask" leaves the order on the approval side. The paper never
     moves; the line does. */
  function setDesk(id, mode, proposed) {
    var desk = document.getElementById(id);
    if (!desk) { return; }
    var plan = LAYOUT[mode] || LAYOUT.none;
    desk.dataset.place = plan.may.indexOf("place") !== -1 ? "may" : "ask";
    desk.dataset.proposed = proposed ? "1" : "0";
  }

  /* one polite live region for state changes that are not screen changes */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  /* ── SCREEN 1 · before any authority ───────────────────────────────── */
  setDesk("desk1", "none");

  /* ── SCREEN 2 · the customer authorises ────────────────────────────── */
  var lv0 = document.getElementById("lv0"), lv1 = document.getElementById("lv1");
  function setCover(on) {
    setDesk("desk2", on ? "bounded" : "none");
    if (lv0) { lv0.setAttribute("aria-pressed", String(!on)); }
    if (lv1) { lv1.setAttribute("aria-pressed", String(on)); }
    say(on ? "Act within cover. The line moves past the purchase order and its covered-mistakes slip: the agent may place the order, and wrong part, wrong quantity and duplicate order are covered. The new supplier over the limit stays on your side of the line and always needs a person."
           : "Draft only. The purchase order waits on your side of the line. The prepared work — suppliers compared, order drafted — sits on the agent's side.");
  }
  if (lv0) { lv0.addEventListener("click", function () { setCover(false); }); }
  if (lv1) { lv1.addEventListener("click", function () { setCover(true); }); }
  setCover(false);

  /* ── SCREEN 3 · the next decision ───────────────────────────────────
     A forward preference. It never edits the day that already happened:
     the three placed orders, the paid slip and the sheet that came back
     stay exactly where they are. An expansion is PROPOSED, not granted —
     granting it would need an approval and a protection review. */
  var decSaid = document.getElementById("dec-said");
  var desk3 = document.getElementById("desk3");
  var DEC = {
    keep:   { mode: "bounded", prop: false,
      t: "Keep. The line stays where the customer set it. Placing orders stays with the agent; a new supplier over the limit still comes to a person." },
    narrow: { mode: "none", prop: false,
      t: "Narrow. The line moves back: placing orders returns to a person. The three orders already placed are unchanged — this is about what happens next." },
    expand: { mode: "bounded", prop: true,
      t: "Expand. Proposed expansion. Approval and protection review required. The new supplier over the limit stays with a person until both are given." }
  };
  function decide(k) {
    var d = k ? DEC[k] : null;
    Array.prototype.forEach.call(document.querySelectorAll(".dec [data-choice]"), function (o) {
      o.setAttribute("aria-pressed", String(o.dataset.choice === k));
    });
    setDesk("desk3", d ? d.mode : "bounded", d ? d.prop : false);
    if (desk3) { desk3.dataset.decided = k || ""; }
    if (decSaid) { decSaid.hidden = !(d && d.prop); }
    if (d) { say(d.t); }
  }
  decide(null);
  Array.prototype.forEach.call(document.querySelectorAll(".dec [data-choice]"), function (b) {
    b.addEventListener("click", function () { decide(b.dataset.choice); });
  });

  /* ══ NAVIGATION (inherited) ═════════════════════════════════════════ */
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

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];
    nextBtn.classList.toggle("cta--quiet", n === total);
    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    /* Screen 1 is the world before the grant: returning to it resets the
       deck so the walkthrough can be run again. Screen 2 keeps whatever the
       viewer set; screen 3 opens undecided. */
    if (n === 1) { setCover(false); decide(null); }

    moveCamera(sc.dataset.cam);

    var h = sc.querySelector(".xd");
    var spans = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (spans.length ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ") : h.textContent)
      : sc.dataset.label;
    announce.textContent = "Screen " + n + " of " + total + ". " + said.replace(/\s+/g, " ").trim();

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
})();
