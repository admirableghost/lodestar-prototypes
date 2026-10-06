/* ══════════════════════════════════════════════════════════════════════════
   Negotiated Neighborhood · Thorn Lane
   No framework, no build step, no external request. Three files.

   Forked from prototype/resilience-grid/app.js for the navigation, the
   per-screen --fit search, the camera and the pin projection; the GROUND
   borrows prototype/micromutual/app.js's street technique — parcels laid out
   from one column pitch, a house glyph per parcel, a frontage strip per
   parcel, and a deterministic garden scatter so the street looks like a
   street and not like noise. Neither file's content, cast or story is reused.

   Micromutual's quarter-turn on a phone is NOT inherited, and that is a
   decision rather than an omission. Its street is deep — two rows of long
   lots and a canyon, about 900 world units from back fence to back fence —
   so standing it on its end is the only way to see a lot at all. This street
   is deliberately shallow, 424 units from edge to edge, because the count is
   the subject and a shallow band lets the camera hold many parcels at once.
   Rotated, it became a 180px ribbon down the middle of a 390px phone. Flat,
   the same band shows seventeen parcels across the full width. So the phone
   gets the same landscape world, framed tighter.

   THE GROUND
   One invented street: sixty parcels in two rows of thirty either side of one
   road, cut into a slope, with open ground behind both rows. Drawn once in a
   single world space 1600 x 1000, and each screen is a camera move over it.

   The smallest object this ground resolves is ONE HOUSEHOLD, and the viewer
   can count them. That is the concept in the drawing: the contract on screen
   2 turns on how many of these sixty rectangles are filled, so a rectangle
   has to be a thing you can point at. A ground whose smallest object were a
   neighbourhood would be the regional prototype, which this is not.

   STATE IS NEVER CARRIED BY FADING. A committed parcel differs from an
   uncommitted one by ground tint, by a solid rather than a broken boundary,
   by a filled rather than a hollow marker, and by its frontage strip being
   filled in. All four survive greyscale.

   WHAT IS INVENTED
   All of it. Thorn Lane, its sixty households, no. 31, the threshold of 48,
   the twelve-year charge on the property bill, the eleven months, the
   placement fee and every party to the agreement are invented, and screen 1
   says so. No real insurer, place, product or price appears anywhere.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── the one data structure the copy depends on ──────────────────────── */
  var HOMES = 60;          /* parcels on Thorn Lane            */
  var PER_ROW = 30;        /* thirty either side of the road   */
  var NEED = 48;           /* the threshold — the product      */
  var START = 41;          /* where the street stands on entry */
  var ROSA = 15;           /* no. 31 — upper row, mid-street   */

  var INK   = "#3C5648",
      PAPER = "#FBF9F1",
      RULE  = "#8A959C";

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY
     A shallow street band, deliberately: two rows and a road have to fit in
     whatever height the plates leave, and a deep lot would force the camera
     so far out that a parcel stopped being countable.
     ══════════════════════════════════════════════════════════════════════ */

  var W = 1600;
  var ML = 28, GP = 5;
  var PW = (W - ML * 2 - (PER_ROW - 1) * GP) / PER_ROW;   /* 46.63 */
  var PH = 158;
  var ROW_Y = [252, 486];
  var ROAD_Y = 420, ROAD_H = 56, ROAD_MID = ROAD_Y + ROAD_H / 2;   /* 448 */

  function colOf(i) { return i % PER_ROW; }
  function rowOf(i) { return i < PER_ROW ? 0 : 1; }
  function px(i) { return ML + colOf(i) * (PW + GP); }
  function py(i) { return ROW_Y[rowOf(i)]; }
  function hcx(i) { return px(i) + PW / 2; }
  /* the house sits toward the road, as a house on a shallow lot does */
  function hcy(i) { return rowOf(i) === 0 ? ROW_Y[0] + PH - 54 : ROW_Y[1] + 54; }
  var HW = 28, HH = 22;

  /* the five metres cleared to the boundary, read as a frontage strip. It
     stops short of the neighbour's, so thirty of them in a row do not merge
     into one band and a gap in the run stays visible. */
  function stripRect(i) {
    return { x: px(i) + 3, w: PW - 6, h: 18,
             y: rowOf(i) === 0 ? ROW_Y[0] + PH - 22 : ROW_Y[1] + 4 };
  }
  /* the commitment marker, at the back of the lot away from the road */
  function markY(i) { return rowOf(i) === 0 ? ROW_Y[0] + 24 : ROW_Y[1] + PH - 24; }

  /* ── cameras ──────────────────────────────────────────────────────────
     A camera is the world region that must be VISIBLE, not a raw viewBox.
     app.js turns it into one at draw time against the screen's own ground
     window, so the framing stays honest at any window size. */
  var CAM = {
    street: { x: 0, y: 120, w: 1600, h: 760 },
    commit: { x: 0, y: 120, w: 1600, h: 760 },
    signed: { x: 0, y: 100, w: 1600, h: 800 }
  };
  /* A phone gets the same landscape world, framed tighter: both rows and the
     road still, but a run of the street rather than all sixty, because the
     window under the stacked plates is short. */
  var CAM_N = {
    street: { x: 60, y: 150, w: 1480, h: 700 },
    commit: { x: 60, y: 150, w: 1480, h: 700 },
    signed: { x: 60, y: 140, w: 1480, h: 720 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  var svg = document.getElementById("plan");

  /* ══════════════════════════════════════════════════════════════════════
     WHO COMMITS, AND IN WHAT ORDER
     Not a shuffle. Commitment on a street spreads from a few households to
     the ones beside them, so the order grows outward from five starters and
     the holdouts end up scattered along the run — which is what makes the
     frontage strip visibly knit together as the count rises, and what makes
     the last few signatures look hard to get.
     ══════════════════════════════════════════════════════════════════════ */
  var ORDER = (function () {
    var seeds = [ROSA, 4, 22, 38, 52], taken = {}, out = [], front = [], guard = 0;
    seeds.forEach(function (s) { if (!taken[s]) { taken[s] = 1; out.push(s); front.push(s); } });
    while (out.length < HOMES && guard++ < 400) {
      var next = [];
      front.forEach(function (i) {
        [i - 1, i + 1, i - PER_ROW, i + PER_ROW].forEach(function (j) {
          if (j < 0 || j >= HOMES || taken[j]) { return; }
          /* a row does not wrap into the other one at its ends */
          if (j === i - 1 && colOf(i) === 0) { return; }
          if (j === i + 1 && colOf(i) === PER_ROW - 1) { return; }
          taken[j] = 1; out.push(j); next.push(j);
        });
      });
      if (!next.length) {
        for (var k = 0; k < HOMES; k++) {
          if (!taken[k]) { taken[k] = 1; out.push(k); next.push(k); break; }
        }
      }
      front = next;
    }
    return out;
  })();
  var RANK = (function () { var r = []; ORDER.forEach(function (i, n) { r[i] = n; }); return r; })();

  var committed = START;
  function isIn(i) { return RANK[i] < committed; }

  /* ── deterministic planting, so the street looks like a street and not
        like noise, and redraws identically every time ─────────────────── */
  var GARDEN = (function () {
    var out = [];
    for (var i = 0; i < HOMES; i++) {
      var seed = (i + 7) * 40503 % 65536, pts = [];
      for (var n = 0; n < 4; n++) {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        var fx = (seed % 1000) / 1000;
        seed = (seed * 1103515245 + 12345) % 2147483648;
        var fy = (seed % 1000) / 1000;
        seed = (seed * 1103515245 + 12345) % 2147483648;
        pts.push({ fx: fx, fy: fy, r: 3.4 + (seed % 1000) / 1000 * 3.6 });
      }
      out.push(pts);
    }
    return out;
  })();

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE STREET
       opts.mode   — "quote" (screen 1: nobody has committed yet)
                     "commit" (screens 2 and 3: every parcel shows its state)
       opts.done(i)  — this household has already done the work, on its own
       opts.ring(i)  — ring this parcel
       opts.alt      — the accessible description
     ══════════════════════════════════════════════════════════════════════ */

  function renderStreet(opts) {
    opts = opts || {};
    var s = [];

    /* ── the ground: a parchment plan, not a map tile ───────────────── */
    s.push('<defs>' +
      '<linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#F6F2E6"/><stop offset="1" stop-color="#EBE6D6"/></linearGradient>' +
      '<linearGradient id="gjoin" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1F7A63" stop-opacity=".22"/>' +
        '<stop offset="1" stop-color="#1F7A63" stop-opacity=".07"/></linearGradient>' +
      '<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">' +
        '<feGaussianBlur stdDeviation="10" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>');
    s.push('<rect x="-400" y="-400" width="2400" height="1800" fill="url(#gsky)"/>');

    /* plot rhythm, very faint — residential texture, never a grid UI */
    for (var gx = -200; gx < 1900; gx += 64) {
      s.push('<line x1="' + gx + '" y1="-200" x2="' + gx + '" y2="1200" stroke="#D9D2BE" stroke-width="1" opacity=".5"/>');
    }

    /* ── the street itself ──────────────────────────────────────────── */
    s.push('<rect x="-400" y="' + ST_Y + '" width="2400" height="' + ST_H + '" fill="#E2DCC8"/>');
    s.push('<line x1="-400" y1="' + (ST_Y + ST_H / 2) + '" x2="2000" y2="' + (ST_Y + ST_H / 2) +
           '" stroke="#C9C0A6" stroke-width="2" stroke-dasharray="26 20"/>');

    var joinedTo = opts.allJoined ? BLOCKS.length : blocksJoined();
    var crossed  = opts.allJoined || committed >= NEED;

    /* ── the collective boundary: the threshold EVENT ───────────────── */
    if (crossed) {
      s.push('<rect x="64" y="128" width="1472" height="744" rx="30" fill="none" ' +
             'stroke="#C08A2E" stroke-width="5" filter="url(#glow)" opacity=".92"/>');
      s.push('<rect x="64" y="128" width="1472" height="744" rx="30" fill="#C08A2E" opacity=".05"/>');
      /* the blocks are now one thing, so they are tied together */
      for (var t = 0; t < BLOCKS.length - 1; t++) {
        var a = BLOCKS[t], bq = BLOCKS[t + 1];
        s.push('<line x1="' + (a.x + a.w / 2) + '" y1="' + (a.y + a.h / 2) +
               '" x2="' + (bq.x + bq.w / 2) + '" y2="' + (bq.y + bq.h / 2) +
               '" stroke="#1F7A63" stroke-width="2.5" opacity=".5" stroke-dasharray="10 8"/>');
      }
    }

    /* ── the blocks ─────────────────────────────────────────────────── */
    BLOCKS.forEach(function (b, bi) {
      var full = bi < joinedTo;
      var part = (bi === joinedTo) ? blockPartial() : (full ? 1 : 0);
      var lit  = full || part > 0;

      s.push('<rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h +
             '" rx="14" fill="' + (lit ? "url(#gjoin)" : "#E4E0CE") + '" ' +
             'stroke="' + (full ? "#1F7A63" : lit ? "#4E9B85" : "#C4BCA4") + '" ' +
             'stroke-width="' + (full ? 3 : 1.6) + '"' + (full ? '' : ' stroke-dasharray="9 7"') + '/>');

      /* the houses: enough to read as a neighbourhood, not as a count */
      b.homes.forEach(function (h, hi) {
        var on = full || hi / b.homes.length < part;
        var prepared = opts.mode === "alone" && bi === 0 && hi === 2;
        var fill = prepared ? "#1F7A63" : on ? "#4E9B85" : "#CFC8B2";
        s.push('<g opacity="' + (on || prepared ? 1 : .85) + '">');
        s.push('<path d="M' + h.x + ' ' + (h.y + 9) + 'L' + (h.x + 13) + ' ' + h.y +
               'L' + (h.x + 26) + ' ' + (h.y + 9) + 'Z" fill="' + fill + '"/>');
        s.push('<rect x="' + (h.x + 3) + '" y="' + (h.y + 9) + '" width="20" height="15" fill="' + fill + '"/>');
        s.push('</g>');
        if (prepared) {
          s.push('<circle cx="' + (h.x + 13) + '" cy="' + (h.y + 12) + '" r="30" fill="none" ' +
                 'stroke="#1F7A63" stroke-width="2.5" opacity=".75"/>');
          s.push('<circle cx="' + (h.x + 13) + '" cy="' + (h.y + 12) + '" r="46" fill="none" ' +
                 'stroke="#1F7A63" stroke-width="1.4" opacity=".4"/>');
        }
      });
    });

    /* ── screen 3: the parties that make the agreement hold ─────────── */
    if (opts.mode === "signed") {
      PARTIES.forEach(function (q) {
        s.push('<line x1="800" y1="500" x2="' + q.x + '" y2="' + q.y +
               '" stroke="' + q.c + '" stroke-width="2.5" opacity=".55"/>');
        s.push('<circle cx="' + q.x + '" cy="' + q.y + '" r="13" fill="' + q.c + '"/>');
      });
    }

    svg.innerHTML = s.join("");
  }

  /* six blocks of ten, because a street you can read beats sixty parcels you
     have to count. The household number stays authoritative in the copy and
     in the state; the blocks are how the eye follows it. */
  var ST_Y = 470, ST_H = 60;
  var BLOCKS = (function () {
    var out = [], x, i, j;
    for (i = 0; i < 6; i++) {
      var top = i < 3;
      x = 150 + (i % 3) * 440;
      var y = top ? 190 : 580;
      var b = { x: x, y: y, w: 380, h: 240, homes: [] };
      for (j = 0; j < 10; j++) {
        b.homes.push({ x: b.x + 36 + (j % 5) * 62, y: b.y + 58 + Math.floor(j / 5) * 92 });
      }
      out.push(b);
    }
    return out;
  }());
  var PARTIES = [
    { x: 250,  y: 150, c: "#2F5E7C" }, { x: 1350, y: 150, c: "#8A3450" },
    { x: 250,  y: 850, c: "#7A5A17" }, { x: 1350, y: 850, c: "#5B4E7A" }
  ];
  function blocksJoined() { return Math.floor(committed / 10); }
  function blockPartial() { return (committed % 10) / 10; }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited from resilience-grid / micromutual)
     ══════════════════════════════════════════════════════════════════════ */

  var vb = null, camTimer = 0;
  function setVB(c) { svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h); vb = c; }

  /* Turn "this region must be visible" into a viewBox for an SVG bigger than
     the viewport that uses `slice`. Both axes resolve to one scale, so slice
     crops the ground and never the subject.

     `fit` is the screen's ground window: the band of the viewport the copy
     has left clear. It is both a height budget and an aim point, on every
     width. A county tolerates being centred behind plates; sixty parcels
     the viewer is meant to COUNT do not, so the street is sized to the band
     and placed in it. Width is still the viewport's, because a street wants
     to run off both edges. */
  function viewBoxFor(view, fit) {
    var el = document.getElementById("world").getBoundingClientRect();
    var vpW = window.innerWidth, vpH = window.innerHeight;
    var hLimit = fit ? fit.h : vpH;
    var scale = Math.min(vpW / view.w, hLimit / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2 + (fit ? (vpW / 2 - fit.cx) / scale : 0);
    var wcy = view.y + view.h / 2 + (fit ? (vpH / 2 - fit.cy) / scale : 0);
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }

  function groundFit() {
    var sc = screens && screens[current - 1];
    if (!sc) { return null; }
    var gw = sc.querySelector(".gw");
    if (gw) {
      var g = gw.getBoundingClientRect();
      var top = Math.max(0, g.top), bot = Math.min(window.innerHeight, g.bottom);
      if (g.width > 60 && bot - top > 100) {
        return { cx: g.left + g.width / 2, cy: (top + bot) / 2, h: bot - top };
      }
    }
    if (!narrow) { return null; }
    var bottom = 0;
    Array.prototype.forEach.call(sc.children, function (p) {
      if (p.classList.contains("gw")) { return; }
      var r = p.getBoundingClientRect();
      if (r.height > 4 && r.top < window.innerHeight * 0.85) { bottom = Math.max(bottom, r.bottom); }
    });
    bottom = Math.max(0, Math.min(bottom + 12, window.innerHeight - 170));
    return { cx: window.innerWidth / 2, cy: (bottom + window.innerHeight) / 2,
             h: window.innerHeight - bottom };
  }

  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.street;
    var target = viewBoxFor(cam, groundFit());
    if (!vb || instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVB(target); placePins(); return;
    }
    var from = vb, t0 = performance.now(), DUR = 540;
    cancelAnimationFrame(camTimer);
    (function step(now) {
      var u = Math.min(1, (now - t0) / DUR);
      var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      setVB({
        x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e
      });
      placePins();
      if (u < 1) { camTimer = requestAnimationFrame(step); }
    })(t0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     PINS — opaque label plates projected onto the ground
     ══════════════════════════════════════════════════════════════════════ */

  var pinHost = document.getElementById("pins");

  function pinAt(cls, label, i, dy) {
    return { cls: cls, label: label, wx: hcx(i), wy: hcy(i), dy: dy };
  }
  function pinSet(n) {
    if (n === 1) {
      return [pinAt("ink", "No. 31 · work done", ROSA, -116),
              pinAt("grey", "Same quote, all 60", 4, -116)];
    }
    /* Screen 2 carries no pin. The count is already the largest thing on
       the screen and a label repeating it under the street is noise. */
    if (n === 2) { return []; }
    return [pinAt("broker", "Thorn Lane, signed", PER_ROW + 7, 118)];
  }

  function buildPins(n) {
    pinHost.innerHTML = "";
    pinSet(n).forEach(function (p) {
      var el = document.createElement("span");
      el.className = "pin pin--" + p.cls;
      el.textContent = p.label;
      el.dataset.wx = p.wx; el.dataset.wy = p.wy; el.dataset.dy = p.dy || 0;
      pinHost.appendChild(el);
    });
    placePins();
  }

  /* A pin is hidden when it would land under a plate, under the chrome, off
     the edge, or under another pin — an opaque label half under an opaque
     plate is the defect, not the fix. */
  function placePins() {
    var g = svg.querySelector("g");
    if (!g || !g.getScreenCTM) { return; }
    var m;
    try { m = g.getScreenCTM(); } catch (e) { return; }
    if (!m) { return; }

    var sc = screens && screens[current - 1];
    var blockers = sc ? Array.prototype.map.call(
      sc.querySelectorAll(".plate"), function (p) { return p.getBoundingClientRect(); }) : [];
    blockers = blockers.concat(Array.prototype.map.call(
      document.querySelectorAll(".chrome button, .chrome select"),
      function (p) { return p.getBoundingClientRect(); }));

    var placed = [];
    Array.prototype.forEach.call(pinHost.children, function (el) {
      var x = +el.dataset.wx, y = +el.dataset.wy;
      var cx = m.a * x + m.c * y + m.e, cy = m.b * x + m.d * y + m.f;
      cy += +el.dataset.dy;
      el.style.left = cx + "px";
      el.style.top = cy + "px";
      el.style.display = "block";
      var r = el.getBoundingClientRect();
      var onScreen = r.left > 6 && r.right < window.innerWidth - 6 &&
                     r.top > 6 && r.bottom < window.innerHeight - 6;
      var hits = function (q) {
        return r.left < q.right + 5 && r.right > q.left - 5 &&
               r.top < q.bottom + 5 && r.bottom > q.top - 5;
      };
      var clear = onScreen && !blockers.some(hits) && !placed.some(hits);
      el.style.display = clear ? "block" : "none";
      if (clear) { placed.push(r); }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — the threshold, and the offer that turns on it
     ══════════════════════════════════════════════════════════════════════ */

  /* One polite live region for state changes that are not screen changes.
     The screen announcer (#announce) handles navigation; this handles
     everything else, so the two never overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  var range = document.getElementById("thr-range");
  var countEl = document.getElementById("thr-count");
  var offerEl = document.getElementById("offer");
  var offerState = document.getElementById("offer-state");
  var offerLine = document.getElementById("offer-line");
  var offerGlyph = offerEl ? offerEl.querySelector(".offer-glyph") : null;
  var signN = document.getElementById("sign-n");

  var WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven",
               "eight", "nine", "ten", "eleven", "twelve"];
  function few(n) { return n <= 12 ? WORDS[n] : String(n); }

  var lastOpen = null;

  function paintOffer(announceChange) {
    var open = committed >= NEED;

    if (countEl) { countEl.textContent = String(committed); }
    if (range && +range.value !== committed) { range.value = String(committed); }
    /* the track fills behind the thumb, so the distance still to travel is
       visible without reading the number */
    if (range) { range.style.setProperty("--p", (committed / HOMES * 100).toFixed(2) + "%"); }

    if (offerEl) { offerEl.dataset.state = open ? "open" : "closed"; }
    if (offerGlyph) { offerGlyph.textContent = open ? "●" : "○"; }
    if (offerState) { offerState.textContent = open ? "Available" : "Not available"; }
    if (offerLine) {
      var short = NEED - committed;
      offerLine.textContent = open
        ? "The carrier writes the street as one risk, at one price, for three years."
        : short === 1
          ? "One more household and the carrier writes the street as one risk."
          : few(short).charAt(0).toUpperCase() + few(short).slice(1) +
            " more households and the carrier writes the street as one risk.";
    }
    /* screen 3 is the same deal, so it reads the same count — and never
       shows a number below the one that binds it */
    if (signN) { signN.textContent = Math.max(committed, NEED) + " of 60"; }

    if (current === 2) {
      renderStreet({ mode: "commit", alt: altFor(2) });
    }
    refit();

    if (announceChange) {
      if (open !== lastOpen) {
        say(open
          ? "Threshold met at " + committed + " of 60. The offer is available."
          : "Below the threshold at " + committed + " of 60. The offer is not available.");
      } else {
        say(open
          ? committed + " of 60 committed. The threshold of 48 is met and the offer stands."
          : committed + " of 60 committed, " + (NEED - committed) + " short of 48.");
      }
    }
    lastOpen = open;
  }

  if (range) {
    range.addEventListener("input", function () {
      committed = parseInt(range.value, 10) || 0;
      paintOffer(true);
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function altFor(n) {
    if (n === 1) {
      return "Plan of Thorn Lane: sixty parcels in two rows of thirty either side of one road, " +
        "with open ground behind both rows. Every lot is drawn with a broken boundary and an " +
        "untreated frontage except number 31, which is ringed, filled, and carries a completed " +
        "marker. Its quote is the street's quote.";
    }
    if (n === 2) {
      return "The same street with " + committed + " of the sixty parcels committed: each one " +
        "filled, with a solid boundary, a treated frontage strip and a filled marker. The " +
        "remaining " + (HOMES - committed) + " are hatched, broken-edged and carry a hollow " +
        "marker.";
    }
    return "A close run of Thorn Lane with the agreement in force: committed parcels filled, " +
      "their frontage strips treated and joined along the road, and the parcels still out " +
      "showing as gaps in the run.";
  }

  function drawFor(n) {
    /* screen 1 is one prepared household in an uncoordinated street;
       screen 2 is the street filling; screen 3 is the street as one thing
       with the four parties that make the agreement hold. */
    if (n === 1)      { renderStreet({ mode: "alone" }); }
    else if (n === 2) { renderStreet({ mode: "commit" }); }
    else              { renderStreet({ mode: "signed", allJoined: true }); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim from resilience-grid / micromutual.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  function anchorPlates() {
    Array.prototype.forEach.call(
      // Only CARDS get pinned to the top or bottom of their band. The
      // executive compositions place their own hero objects, and an inline
      // align-self written here would silently beat their stylesheet.
      document.querySelectorAll(".screen > .plate[style*='grid-area']"), function (el) {
        if (el.classList.contains("gw")) { return; }
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
      /* the ground window is an empty aiming cell, not content */
      if (el.classList.contains("gw")) { return; }
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
       6.4px and notes to 7.7px in the prototype this is forked from. Below
       900px the type holds its size and the screen scrolls. */
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
      placePins();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     NAVIGATION
     ══════════════════════════════════════════════════════════════════════ */

  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;

  var CTA = ["See the offer", "Read the agreement", "Back to the street"];

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

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    drawFor(n);
    /* fit before the camera moves: the camera aims at the ground window,
       so it needs the settled layout */
    fitScreen(sc);
    moveCamera(sc.dataset.cam);
    buildPins(n);

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

  /* Arrow keys move the deck — except inside the threshold slider, where the
     arrow keys belong to the control and move the count by one household. */
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
      var was = narrow;
      narrow = isNarrow();
      /* The window is the stage. Every screen is re-fitted to the new one,
         not just the visible one, so a resize can never leave a hidden
         screen holding a scale that was right for a different window. */
      screens.forEach(function (s) {
        var h = s.hidden;
        if (h) { s.hidden = false; }
        fitScreen(s);
        if (h) { s.hidden = true; }
      });
      if (was !== narrow) { drawFor(current); }
      moveCamera(screens[current - 1].dataset.cam, true);
      placePins();
    }, 140);
  });

  /* Skip link: move focus to the open screen's heading, without touching the
     hash. Every .display carries tabindex="-1" so it can receive focus. */
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
  paintOffer(false);
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);
})();
