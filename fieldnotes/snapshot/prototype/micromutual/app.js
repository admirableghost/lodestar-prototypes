/* ══════════════════════════════════════════════════════════════════════════
   Micromutual · 2036 prototype · Tramonto Ridge
   No framework, no build step, no external request. Three files.

   THE GROUND
   One fictional street: 38 parcels in two rows of 19 either side of the road,
   with a canyon along the downslope edge. It is drawn once, in a single world
   space 1600 x 1000, and every screen is a camera move over it. On a narrow
   viewport the whole world is rotated a quarter turn so the street runs down
   the phone; the house and refusal glyphs are counter-rotated so they stay
   upright.

   THE CAST — four neighbours, and the point of the whole thing
     A  Alma R.    · no. 24 · lower row, parcel 28 · the one we follow
     B  Bo K.      · no. 22 · lower row, parcel 27 · Alma likes him
     C  Camille H. · no. 26 · lower row, parcel 29 · Alma cannot stand her
     D  Desmond I. · no. 25 · upper row, parcel 12 · Alma has never met him
   One friendship, one grudge, one pair of strangers — and the machine's
   route crosses all four parcels regardless, because the coordination runs
   through their agents and not through them. The refusal is deliberately
   kept OUTSIDE the quartet, so that "the agents get along" can never be read
   as "consent can be assumed":
     E  Gerald S.  · no. 34 · lower row, parcel 33 · withholds, and is never
                                                     overridden
   Every one of them is invented, and the first screen says so.

   THE LEDGER — every figure below is invented and internally consistent.
     Contribution  $86 / household / month  x  38  x  12   =  $39,216
        Works                                              =  $27,100
        Hardship allocation                                =  $ 6,100
        Aggregate-contract premium                         =  $ 3,100
        Running costs                                      =  $ 2,900
     Works breaks down as machine lease $18,600 (12 x $1,550), crew and
     arborist $6,200, survey and verification $2,300.
     Hardship holds three years' allocation, $18,300, and the carrier's
     aggregate contract sits above it with a $21,700 limit — $40,000 in all,
     which is exactly ten households at the $4,000 cap.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var WORKS_BUDGET = 27100;
  var HARDSHIP_HELD = 18300;
  var CONTRACT_LIMIT = 21700;
  var PER_EVENT_CAP = 4000;
  var MEMBER_FIRST = 750;
  var POLICY_DEDUCTIBLE = 10000;
  var HOMES = 38;
  var PER_ROW = 19;
  var GAPS = (PER_ROW - 1) * 2;            /* 36 boundary gaps */

  var A = 28, B = 27, C = 29, D = 12;      /* the quartet */
  var QUAD = [A, B, C, D];
  var GERALD = 33;                          /* the refusal, outside the quartet */

  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY
     ══════════════════════════════════════════════════════════════════════ */

  var W = 1600, H = 1000;
  var ML = 30, GP = 8;
  var PW = (W - ML * 2 - (PER_ROW - 1) * GP) / PER_ROW;   /* 73.47 */
  var ROW_Y = [120, 510], PH = 250;
  var ROAD_Y = 395, ROAD_H = 90;
  var ROAD_MID = ROAD_Y + ROAD_H / 2;       /* 440 */
  var EDGE_Y = 766, EDGE_H = 60;            /* the canyon-edge fuel break */
  var CANYON_Y = 826;

  function colOf(i) { return i % PER_ROW; }
  function rowOf(i) { return i < PER_ROW ? 0 : 1; }
  function px(i) { return ML + colOf(i) * (PW + GP); }
  function py(i) { return ROW_Y[rowOf(i)]; }
  function hcx(i) { return px(i) + PW / 2; }
  /* the house sits toward the road, as a house on a deep lot does */
  function hcy(i) { return rowOf(i) === 0 ? ROW_Y[0] + PH - 88 : ROW_Y[1] + 88; }
  var HW = 48, HH = 36;                     /* the house */
  /* The treated strip must stop short of the neighbour's, or 19 of them in a
     row merge into one band and the per-parcel reading is lost. */
  var SW = 68, SH = 58;

  /* A gap belongs to the two parcels beside it: 0..17 upper row, 18..35 lower. */
  function gapParcel(k) { return (k < 18 ? 0 : PER_ROW) + (k % 18); }
  function gapRect(k) {
    var i = gapParcel(k);
    return { x: px(i) + PW - 2, y: hcy(i) - 23, w: GP + 4, h: 46 };
  }
  function stripRect(i) { return { x: hcx(i) - SW / 2, y: hcy(i) - SH / 2, w: SW, h: SH }; }
  function edgeRect(c) {
    var i = PER_ROW + c;
    return { x: px(i) - (c === 0 ? 0 : GP / 2), y: EDGE_Y,
             w: PW + (c === 0 || c === PER_ROW - 1 ? GP / 2 : GP), h: EDGE_H };
  }
  /* Alma's shed, out the back toward the canyon */
  var SHED = { x: hcx(A) - 17, y: ROW_Y[1] + 172, w: 34, h: 26 };

  /* Cameras are the world region that must be VISIBLE IN THE VIEWPORT, not a
     raw viewBox. The ground element is deliberately larger than the viewport,
     so the viewBox is derived from these at draw time — which keeps the
     framing honest at any window size and in either orientation. */
  var CAM = {
    /* framed so the canyon-edge break clears the bottom control strip */
    street: { x: 90,  y: 102, w: 1420, h: 887 },
    wide:   { x: 40,  y: 60,  w: 1520, h: 950 },
    /* screen 2 keeps its plates in the left column, so the quartet is
       framed off-centre, into the clear window on the right */
    quad:   { x: 228, y: 240, w: 913,  h: 571 },
    block:  { x: 560, y: 330, w: 640,  h: 400 },
    parcel: { x: 601, y: 434, w: 664,  h: 415 }
  };

  /* A phone sees the street stood on its end, and closer in: the same world,
     a tighter frame, because a quarter of the viewport width is gutter. */
  var CAM_N = {
    /* rotated, the street's whole depth maps to the phone's width, so the
       frame runs along the street instead of trying to show all 38 at once */
    street: { x: 560, y: 95,  w: 480,  h: 810 },
    wide:   { x: 560, y: 95,  w: 480,  h: 810 },
    quad:   { x: 640, y: 250, w: 485,  h: 470 },
    block:  { x: 655, y: 415, w: 300,  h: 335 },
    parcel: { x: 690, y: 475, w: 245,  h: 295 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  /* Rotated space is 1000 wide x 1600 tall: world (x,y) -> (y, 1600 - x). */
  function toView(c) {
    if (!narrow) { return c; }
    return { x: c.y, y: W - (c.x + c.w), w: c.h, h: c.w };
  }
  function rotAttr() { return narrow ? ' transform="translate(0,' + W + ') rotate(-90)"' : ""; }
  function upright(cx, cy, inner) {
    return narrow ? '<g transform="rotate(90 ' + cx + " " + cy + ')">' + inner + "</g>" : inner;
  }

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE STREET
     opts.enrolled(i)   — is parcel i enrolled
     opts.zone(kind, k) —  1 done, 0 not yet, -1 blocked by a refusal
     opts.machineAt     — 0..1 along the road, or null
     opts.trace         — 0..1 of the road the machine has worked, or null
     opts.route         — draw the spine-and-spurs pass across the quartet
     opts.social        — draw the friendship, the grudge and the strangers
     opts.ring(i)       — 'you' | 'cast' | null
     opts.claiming(i)   — marks a household claiming this year
     opts.shed          — 'intact' | 'down' | null
     opts.interactive   — parcels become buttons
     ══════════════════════════════════════════════════════════════════════ */

  var INK = "#293D31", WORKS = "#2F5A44", SHORT = "#A33322",
      RULE = "#7C8C82", MACHINE = "#5B4E7A", PAPER = "#FBFCF5";

  var svg = document.getElementById("plan");

  /* The planting in each back garden. Deterministic from the parcel index, so
     the street looks like a street and not like noise, and it redraws
     identically every time. This is the fuel the shared machine exists for,
     which is why the treated strip around each house reads as a clearing in
     it rather than as an abstract rectangle. */
  var GARDEN = (function () {
    var cache = [];
    for (var i = 0; i < HOMES; i++) {
      var pts = [], seed = (i + 11) * 40503 % 65536;
      function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return (seed % 1000) / 1000; }
      for (var n = 0; n < 9; n++) {
        pts.push({ fx: rnd(), fy: rnd(), r: 4.6 + rnd() * 4.4 });
      }
      cache.push(pts);
    }
    return cache;
  })();

  function garden(i) {
    var X = px(i), Y = py(i), CX = hcx(i), CY = hcy(i), s = "";
    /* the back garden runs from behind the house to the rear boundary */
    var top = rowOf(i) === 0 ? Y + 8 : CY + SH / 2 + 6;
    var bot = rowOf(i) === 0 ? CY - SH / 2 - 6 : Y + PH - 8;
    GARDEN[i].forEach(function (p) {
      var cx = X + 8 + p.fx * (PW - 16), cy = top + p.fy * (bot - top);
      s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + p.r.toFixed(1) +
        '" fill="#C3D0B7"/>';
    });
    return s;
  }

  function renderPlan(opts) {
    var s = [], i, k, c;

    s.push('<defs>' +
      '<pattern id="hatch-no" width="7" height="7" patternTransform="rotate(45)" ' +
      'patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#F4E4E0"/>' +
      '<line x1="0" y1="0" x2="0" y2="7" stroke="' + SHORT + '" stroke-width="2.2"/></pattern>' +
      '<pattern id="hatch-canyon" width="11" height="11" patternTransform="rotate(45)" ' +
      'patternUnits="userSpaceOnUse"><rect width="11" height="11" fill="#C6D0B8"/>' +
      '<line x1="0" y1="0" x2="0" y2="11" stroke="#8B9A8C" stroke-width="1.3"/></pattern>' +
      "</defs>");

    s.push("<g" + rotAttr() + ">");

    /* the open ground the street is cut into — excluded from the fill metric,
       because a flat backdrop is not content */
    s.push('<rect data-bg="1" x="-400" y="-400" width="2400" height="1800" fill="#E4E9D8"/>');

    /* the canyon */
    s.push('<rect x="-400" y="' + CANYON_Y + '" width="2400" height="' + (1400 - CANYON_Y) +
      '" fill="url(#hatch-canyon)"/>');
    s.push('<path d="M-400 ' + CANYON_Y + " L2000 " + CANYON_Y + '" stroke="' + RULE + '" stroke-width="2.5"/>');
    [936, 972, 1008].forEach(function (y, n) {
      var d = "M-400 " + y;
      for (var x = -400; x <= 2000; x += 120) {
        d += " Q" + (x + 60) + " " + (y + (n % 2 ? 11 : -11)) + " " + (x + 120) + " " + y;
      }
      s.push('<path d="' + d + '" fill="none" stroke="#9BA893" stroke-width="1.2"/>');
    });

    /* the road */
    s.push('<rect x="-400" y="' + ROAD_Y + '" width="2400" height="' + ROAD_H + '" fill="#D6DDC8"/>');
    [ROAD_Y, ROAD_Y + ROAD_H].forEach(function (y) {
      s.push('<line x1="-400" y1="' + y + '" x2="2000" y2="' + y + '" stroke="#A9B4A0" stroke-width="1.6"/>');
    });
    s.push('<line x1="-400" y1="' + ROAD_MID + '" x2="2000" y2="' + ROAD_MID +
      '" stroke="#8B9A8C" stroke-width="2" stroke-dasharray="20 18"/>');

    /* what the machine has already run this season */
    if (opts.trace != null && opts.trace > 0) {
      s.push('<line x1="30" y1="' + (ROAD_MID + 18) + '" x2="' + (30 + opts.trace * 1540) +
        '" y2="' + (ROAD_MID + 18) + '" stroke="' + MACHINE +
        '" stroke-width="4" stroke-dasharray="14 9" stroke-linecap="round" opacity=".8"/>');
    }

    /* the canyon-edge fuel break, butted segment to segment so a treated run
       reads as one strip and a refusal reads as a hole in it */
    for (c = 0; c < PER_ROW; c++) {
      var er = edgeRect(c), ed = opts.zone("canyon", PER_ROW + c);
      s.push('<rect x="' + er.x + '" y="' + er.y + '" width="' + er.w + '" height="' + er.h +
        '" fill="' + (ed === 1 ? "rgba(47,90,68,.34)" : ed === -1 ? "url(#hatch-no)" : "none") +
        '" stroke="' + (ed === 1 ? WORKS : ed === -1 ? SHORT : "#8B9A8C") +
        '" stroke-width="1.4"' + (ed === 0 ? ' stroke-dasharray="5 5"' : "") + "/>");
    }

    /* parcels */
    for (i = 0; i < HOMES; i++) {
      var inn = opts.enrolled(i), g = "";
      var X = px(i), Y = py(i), CX = hcx(i), CY = hcy(i);

      g += '<rect x="' + X + '" y="' + Y + '" width="' + PW + '" height="' + PH +
        '" rx="3" fill="' + (inn ? "#F5F7EE" : "url(#hatch-no)") +
        '" stroke="' + (inn ? "#A9B4A0" : SHORT) + '" stroke-width="' + (inn ? 1.4 : 2.6) + '"/>';

      /* what is actually growing out the back — the fuel the machine is for */
      g += garden(i);

      /* the driveway to the road */
      var dy = rowOf(i) === 0 ? Y + PH : Y;
      g += '<rect x="' + (CX - 8) + '" y="' + Math.min(dy, CY) + '" width="16" height="' +
        (Math.abs(dy - CY) - 12) + '" fill="#DDE4D2"/>';

      /* the five feet around the house */
      var sr = stripRect(i), sd = opts.zone("strip", i);
      g += '<rect x="' + sr.x + '" y="' + sr.y + '" width="' + sr.w + '" height="' + sr.h +
        '" rx="3" fill="' + (sd === 1 ? "rgba(47,90,68,.20)" : "none") +
        '" stroke="' + (sd === 1 ? WORKS : sd === -1 ? SHORT : "#8B9A8C") +
        '" stroke-width="1.6"' + (sd === 0 ? ' stroke-dasharray="6 5"' : "") + "/>";

      /* the house */
      var x0 = CX - HW / 2, y0 = CY - HH / 2;
      g += upright(CX, CY,
        '<path d="M' + x0 + " " + (y0 + HH) + " L" + x0 + " " + (y0 + HH * 0.42) +
        " L" + CX + " " + y0 + " L" + (x0 + HW) + " " + (y0 + HH * 0.42) +
        " L" + (x0 + HW) + " " + (y0 + HH) + ' Z" fill="' + INK + '"/>');

      /* a refusal carries a glyph as well as a colour */
      if (!inn) {
        var gy = rowOf(i) === 0 ? Y + 26 : Y + PH - 26;
        g += upright(CX, gy,
          '<circle cx="' + CX + '" cy="' + gy + '" r="15" fill="' + PAPER + '" stroke="' + SHORT + '" stroke-width="3"/>' +
          '<line x1="' + (CX - 7) + '" y1="' + gy + '" x2="' + (CX + 7) + '" y2="' + gy +
          '" stroke="' + SHORT + '" stroke-width="4" stroke-linecap="round"/>');
      }

      /* a household claiming this year */
      if (opts.claiming && opts.claiming(i)) {
        g += '<circle cx="' + CX + '" cy="' + (CY + 34) + '" r="9" fill="#7A5A17" stroke="' + PAPER +
          '" stroke-width="2.5"/>';
      }

      /* Alma's shed. The limb that came down on it crosses three parcels, so
         it is drawn after the loop — inside this group, the next parcel's
         own rectangle would paint straight over it. */
      if (i === A && opts.shed) {
        g += '<rect x="' + SHED.x + '" y="' + SHED.y + '" width="' + SHED.w + '" height="' + SHED.h +
          '" rx="2" fill="' + (opts.shed === "down" ? "#F4E4E0" : "#E7EBDC") +
          '" stroke="' + (opts.shed === "down" ? SHORT : RULE) + '" stroke-width="2"/>';
      }

      /* the ring that marks a household we are following */
      var ring = opts.ring ? opts.ring(i) : null;
      if (ring) {
        var o = ring === "you" ? 6 : 4, sw = ring === "you" ? 2.6 : 2;
        g += '<rect x="' + (X - o) + '" y="' + (Y - o) + '" width="' + (PW + o * 2) + '" height="' +
          (PH + o * 2) + '" rx="6" fill="none" stroke="' + PAPER + '" stroke-width="' + (sw + 3.4) + '"/>' +
          '<rect x="' + (X - o) + '" y="' + (Y - o) + '" width="' + (PW + o * 2) + '" height="' +
          (PH + o * 2) + '" rx="6" fill="none" stroke="' + INK + '" stroke-width="' + sw +
          (ring === "cast" ? '" stroke-dasharray="14 8' : "") + '"/>';
      }

      if (opts.interactive) {
        s.push('<g class="parcel" role="button" tabindex="0" data-parcel="' + i +
          '" aria-pressed="' + (inn ? "false" : "true") + '" aria-label="' + parcelName(i) + ", " +
          (inn ? "enrolled" : "consent withheld") + '">' + g + "</g>");
      } else {
        s.push("<g>" + g + "</g>");
      }
    }

    /* the live oak across Bo's, Alma's and Camille's parcels, and the shed
       it flattened — above every parcel, because it spans three of them */
    if (opts.shed === "down") {
      s.push('<path d="M' + (px(B) + 10) + " " + (ROW_Y[1] + 218) + " Q" + hcx(A) + " " +
        (ROW_Y[1] + 178) + " " + (px(C) + PW - 10) + " " + (ROW_Y[1] + 224) +
        '" fill="none" stroke="#6B5A3A" stroke-width="8" stroke-linecap="round"/>');
      s.push('<line x1="' + SHED.x + '" y1="' + SHED.y + '" x2="' + (SHED.x + SHED.w) + '" y2="' +
        (SHED.y + SHED.h) + '" stroke="' + SHORT + '" stroke-width="2.6"/>' +
        '<line x1="' + (SHED.x + SHED.w) + '" y1="' + SHED.y + '" x2="' + SHED.x + '" y2="' +
        (SHED.y + SHED.h) + '" stroke="' + SHORT + '" stroke-width="2.6"/>');
    }

    /* boundary gaps, above the parcel strokes */
    for (k = 0; k < GAPS; k++) {
      var gr = gapRect(k), gd = opts.zone("gap", k);
      if (gd === -1) {
        /* A blocked gap is drawn broken, not merely red: two stubs with the
           breach between them, so it survives greyscale and colour-blindness. */
        var stub = gr.h * 0.3;
        [0, gr.h - stub].forEach(function (off) {
          s.push('<rect x="' + gr.x + '" y="' + (gr.y + off) + '" width="' + gr.w + '" height="' +
            stub + '" rx="1" fill="' + SHORT + '"/>');
        });
        continue;
      }
      s.push('<rect x="' + gr.x + '" y="' + gr.y + '" width="' + gr.w + '" height="' + gr.h +
        '" rx="1" fill="' + (gd === 1 ? WORKS : "#EDF0E4") + '" stroke="' + (gd === 1 ? WORKS : "#8B9A8C") +
        '" stroke-width="1.2"' + (gd === 0 ? ' stroke-dasharray="4 4"' : "") + "/>");
    }

    /* ── the social graph ────────────────────────────────────────────────
       One friendship, one grudge, one pair of strangers. Drawn under the
       route on purpose: the layer that works runs straight over the top of
       how these four feel about each other. */
    if (opts.social) {
      var yBack = hcy(A) + SH / 2 + 34;     /* the band behind the three houses */

      /* Alma likes Bo — one unbroken line across the boundary they share */
      s.push('<path d="M' + (hcx(B) + 10) + " " + (hcy(B) + SH / 2 + 4) + " Q" +
        ((hcx(A) + hcx(B)) / 2) + " " + (yBack + 30) + " " + (hcx(A) - 10) + " " +
        (hcy(A) + SH / 2 + 4) + '" fill="none" stroke="' + WORKS +
        '" stroke-width="6" stroke-linecap="round"/>');

      /* Alma cannot stand Camille — a jagged line across the boundary they
         also share, and the machine treats it exactly the same */
      var zx0 = hcx(A) + 14, zx1 = hcx(C) - 14, zy = yBack + 14, zd = "M" + zx0 + " " + zy, zn = 6;
      for (var z = 1; z <= zn; z++) {
        zd += " L" + (zx0 + (zx1 - zx0) * (z / zn)).toFixed(1) + " " + (zy + (z % 2 ? 18 : -18));
      }
      s.push('<path d="' + zd + '" fill="none" stroke="' + SHORT +
        '" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>');

      /* Alma has never met Desmond — the line that would join them stops
         short at both ends, and the road runs through the gap */
      var a0 = { x: hcx(A), y: hcy(A) - SH / 2 - 10 }, d0 = { x: hcx(D), y: hcy(D) + SH / 2 + 10 };
      var vx = d0.x - a0.x, vy = d0.y - a0.y;
      s.push('<line x1="' + a0.x + '" y1="' + a0.y + '" x2="' + (a0.x + vx * 0.27).toFixed(1) +
        '" y2="' + (a0.y + vy * 0.27).toFixed(1) + '" stroke="' + RULE +
        '" stroke-width="5" stroke-dasharray="10 10" stroke-linecap="round"/>');
      s.push('<line x1="' + d0.x + '" y1="' + d0.y + '" x2="' + (d0.x - vx * 0.27).toFixed(1) +
        '" y2="' + (d0.y - vy * 0.27).toFixed(1) + '" stroke="' + RULE +
        '" stroke-width="5" stroke-dasharray="10 10" stroke-linecap="round"/>');
      s.push('<circle cx="' + (a0.x + vx * 0.5).toFixed(1) + '" cy="' + (a0.y + vy * 0.5).toFixed(1) +
        '" r="13" fill="' + PAPER + '" stroke="' + RULE + '" stroke-width="3" stroke-dasharray="5 5"/>');
    }

    /* ── the coordination layer ──────────────────────────────────────────
       A spine along the road and a spur into each of the four parcels: one
       pass, scheduled agent to agent. It does not care about any of the
       above. */
    if (opts.route) {
      var spine = [hcx(B), hcx(A), hcx(C), hcx(D)];
      var lo = Math.min.apply(null, spine) - 74, hi = Math.max.apply(null, spine) + 74;
      s.push('<line x1="' + lo + '" y1="' + (ROAD_MID - 16) + '" x2="' + hi + '" y2="' +
        (ROAD_MID - 16) + '" stroke="' + MACHINE + '" stroke-width="6" stroke-linecap="round"/>');
      QUAD.forEach(function (i) {
        var sx = hcx(i) - 22;               /* beside the driveway, not on it */
        var into = rowOf(i) === 0 ? hcy(i) + SH / 2 + 4 : hcy(i) - SH / 2 - 4;
        s.push('<line x1="' + sx + '" y1="' + (ROAD_MID - 16) + '" x2="' + sx + '" y2="' + into +
          '" stroke="' + MACHINE + '" stroke-width="6" stroke-linecap="round"/>');
        s.push('<circle cx="' + sx + '" cy="' + into + '" r="11" fill="' + MACHINE + '" stroke="' +
          PAPER + '" stroke-width="3"/>');
      });
    }

    /* the machine, on the road */
    if (opts.machineAt != null) {
      var mx = 40 + opts.machineAt * 1480, my = ROAD_MID - 12;
      s.push(upright(mx + 26, my + 12, "<g>" +
        '<rect x="' + mx + '" y="' + my + '" width="52" height="26" rx="4" fill="' + MACHINE +
        '" stroke="' + PAPER + '" stroke-width="2.5"/>' +
        '<rect x="' + (mx + 11) + '" y="' + (my - 10) + '" width="19" height="11" rx="2" fill="' + MACHINE + '"/>' +
        '<line x1="' + (mx + 5) + '" y1="' + (my + 32) + '" x2="' + (mx + 47) + '" y2="' + (my + 32) +
        '" stroke="' + MACHINE + '" stroke-width="5" stroke-linecap="round"/>' + "</g>"));
    }

    s.push("</g>");
    svg.innerHTML = s.join("");
    svg.setAttribute("role", opts.interactive ? "group" : "img");
    if (opts.alt) { svg.setAttribute("aria-label", opts.alt); }
  }

  function parcelName(i) {
    if (i === A) { return "Alma, number 24"; }
    if (i === B) { return "Bo, number 22"; }
    if (i === C) { return "Camille, number 26"; }
    if (i === D) { return "Desmond, number 25"; }
    if (i === GERALD) { return "Gerald, number 34"; }
    return "Property " + (i + 1) + " of 38";
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA
     ══════════════════════════════════════════════════════════════════════ */

  var vb = null, camTimer = null;
  function setVB(c) { svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h); vb = c; }

  /* Turn "this region must be visible" into a viewBox for an SVG that is
     bigger than the viewport and uses `slice`. Both axes resolve to the same
     scale, so slice crops the ground and never the subject. `fit` says which
     part of the viewport the subject has to land in — on a phone the plates
     stack down from the top, so the subject belongs in the strip underneath
     them rather than dead centre. */
  function viewBoxFor(view, fit) {
    var el = document.getElementById("world").getBoundingClientRect();
    var vpW = window.innerWidth, vpH = window.innerHeight;
    var scale = Math.min(vpW / view.w, (fit ? fit.h : vpH) / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    /* the world point that must sit at the viewport centre */
    var wcx = view.x + view.w / 2;
    var wcy = view.y + view.h / 2 + (fit ? (vpH / 2 - fit.cy) / scale : 0);
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }

  /* On a phone the screen scrolls and the plates run from the top edge down.
     Whatever is left below the last one is the window onto the street. */
  function narrowFit() {
    if (!narrow) { return null; }
    var sc = screens && screens[current - 1];
    if (!sc) { return null; }
    /* where a screen declares its own window onto the street, use it */
    var gw = sc.querySelector(".gw");
    if (gw) {
      var g = gw.getBoundingClientRect();
      var top = Math.max(0, g.top), bot = Math.min(window.innerHeight, g.bottom);
      if (bot - top > 120) { return { cy: (top + bot) / 2, h: bot - top }; }
    }
    var bottom = 0;
    Array.prototype.forEach.call(sc.children, function (p) {
      if (p.classList.contains("gw")) { return; }
      var r = p.getBoundingClientRect();
      if (r.height > 4 && r.top < window.innerHeight * 0.85) { bottom = Math.max(bottom, r.bottom); }
    });
    bottom = Math.max(0, Math.min(bottom + 12, window.innerHeight - 190));
    return { cy: (bottom + window.innerHeight) / 2, h: window.innerHeight - bottom };
  }

  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.street;
    var target = viewBoxFor(toView(cam), narrowFit());
    if (!vb || instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVB(target); placePins(); return;
    }
    var from = vb, t0 = performance.now(), DUR = 520;
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

  /* ── pins: opaque plates, projected onto the ground ─────────────────── */

  var pinHost = document.getElementById("pins");
  function pin(cls, label, i, dy, dx) {
    return { cls: cls, label: label, wx: hcx(i), wy: hcy(i), dy: dy, dx: dx || 0 };
  }
  var ALMA_PIN = pin("pin--you", "Alma · 24", A, -50);
  var PIN_SETS = {
    1:  [ALMA_PIN],
    3:  [ALMA_PIN],
    2:  [pin("pin--you", "Alma · 24", A, -104),
         pin("pin--cast", "Bo · 22", B, -54),
         pin("pin--red",  "Camille · 26", C, -54),
         pin("pin--grey", "Desmond · 25", D, 60)],
    4:  [pin("pin--you", "Alma · 24", A, -54),
         pin("pin--cast", "Bo · 22", B, -98),
         pin("pin--red",  "Camille · 26", C, -98),
         pin("pin--grey", "Desmond · 25", D, 62)],
    5:  [ALMA_PIN, pin("pin--red", "Gerald · 34", GERALD, 58)],
    6:  [pin("pin--you", "Alma · 24", A, -56),
         { cls: "pin--red", label: "The shed", wx: SHED.x + SHED.w / 2, wy: SHED.y + SHED.h / 2, dy: 42 }],
    7:  [ALMA_PIN],
    9:  [ALMA_PIN],
    11: [ALMA_PIN]
  };

  function buildPins(n) {
    pinHost.innerHTML = "";
    (PIN_SETS[n] || []).forEach(function (p) {
      var el = document.createElement("span");
      el.className = "pin " + p.cls;
      el.textContent = p.label;
      el.dataset.wx = p.wx; el.dataset.wy = p.wy; el.dataset.dy = p.dy; el.dataset.dx = p.dx || 0;
      pinHost.appendChild(el);
    });
    placePins();
  }

  function placePins() {
    var g = svg.querySelector("g");
    if (!g || !g.getScreenCTM) { return; }
    var m;
    try { m = g.getScreenCTM(); } catch (e) { return; }
    if (!m) { return; }
    /* Plates sit above the pins, so a pin that lands under one would be read
       half-covered — and measured against the wrong background. Hide those. */
    var sc = screens && screens[current - 1];
    var blockers = sc ? Array.prototype.map.call(
      sc.querySelectorAll(".plate, .tile, .chipbtn"), function (p) { return p.getBoundingClientRect(); }
    ) : [];
    blockers = blockers.concat(Array.prototype.map.call(
      document.querySelectorAll(".chrome button, .chrome select"), function (p) { return p.getBoundingClientRect(); }));

    /* and a pin covered by another pin is just as unreadable */
    var placed = [];
    Array.prototype.forEach.call(pinHost.children, function (el) {
      var x = +el.dataset.wx, y = +el.dataset.wy;
      var cx = m.a * x + m.c * y + m.e, cy = m.b * x + m.d * y + m.f;
      /* dy means "away from the house, across the street", so on a phone —
         where the street is stood on its end — it becomes a sideways nudge. */
      if (narrow) { cx += +el.dataset.dy; cy += (+el.dataset.dx || 0); }
      else        { cy += +el.dataset.dy; cx += (+el.dataset.dx || 0); }
      el.style.left = cx + "px";
      el.style.top = cy + "px";
      el.style.display = "block";
      var r = el.getBoundingClientRect();
      var onScreen = r.left > 6 && r.right < window.innerWidth - 6 &&
                     r.top > 6 && r.bottom < window.innerHeight - 6;
      var hits = function (q) {
        return r.left < q.right + 4 && r.right > q.left - 4 &&
               r.top < q.bottom + 4 && r.bottom > q.top - 4;
      };
      var clear = onScreen && !blockers.some(hits) && !placed.some(hits);
      el.style.display = clear ? "block" : "none";
      if (clear) { placed.push(r); }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     PLAN STATE PER SCREEN
     ══════════════════════════════════════════════════════════════════════ */

  /* Gerald has withheld from the start; screen 5 lets you change that, for
     him or for anybody else. Nothing anywhere overrides it. */
  var out = {}; out[GERALD] = true;

  function isIn(i) { return !out[i]; }
  function enrolledCount() { var n = 0; for (var i = 0; i < HOMES; i++) { if (isIn(i)) { n++; } } return n; }
  function gapTreated(k) { var i = gapParcel(k); return isIn(i) && isIn(i + 1); }
  function treatedGaps() { var n = 0; for (var k = 0; k < GAPS; k++) { if (gapTreated(k)) { n++; } } return n; }
  function adjacentPair() {
    for (var r = 0; r < 2; r++) {
      for (var i = 0; i < PER_ROW - 1; i++) {
        if (!isIn(r * PER_ROW + i) && !isIn(r * PER_ROW + i + 1)) { return true; }
      }
    }
    return false;
  }

  /* who claims, and in what order — Alma first, because she is the one we
     are following; the rest is a fixed scatter, not a random one */
  var CLAIM_ORDER = (function () {
    var tail = [], i;
    for (i = 0; i < HOMES; i++) { if (i !== A) { tail.push(i); } }
    var res = [], seed = 7;
    while (tail.length) { seed = (seed * 1103515245 + 12345) % 2147483648; res.push(tail.splice(seed % tail.length, 1)[0]); }
    return [A].concat(res);
  })();
  var claimingN = 10;

  function standingZone(kind, k) {
    if (kind === "canyon") { return isIn(k) ? 1 : -1; }
    if (kind === "strip") { return isIn(k) ? 1 : -1; }
    if (kind === "gap") { return gapTreated(k) ? 1 : -1; }
    return 0;
  }
  function ringYouOnly(i) { return i === A ? "you" : null; }
  function ringQuad(i) { return i === A ? "you" : (i === B || i === C || i === D) ? "cast" : null; }

  function drawFor(n) {
    if (n === 4) { drawWorks(); return; }
    if (n === 5) { drawConsent(); return; }

    var claimSet = null;
    if (n === 7) {
      claimSet = {};
      CLAIM_ORDER.slice(0, claimingN).forEach(function (i) { claimSet[i] = true; });
    }
    renderPlan({
      alt: n === 2
        ? "The same plan with four neighbours marked: Bo at 22, Alma at 24 and Camille at 26 " +
          "along the canyon side, and Desmond at 19 across the road. A solid line joins Alma " +
          "and Bo, a jagged one runs between Alma and Camille, and the line toward Desmond " +
          "stops short at both ends. Over all of it, the machine's route runs from the road " +
          "into all four parcels."
        : "Plan of Tramonto Ridge: 38 properties in two rows of nineteen either side of the " +
          "road, the treated strip around each house, the gaps between houses, and the " +
          "canyon-edge break along the downslope edge. Alma's parcel is ringed; Gerald's, " +
          "further along, is hatched as a refusal.",
      enrolled: isIn,
      zone: standingZone,
      machineAt: null,
      trace: null,
      route: n === 2,
      social: n === 2,
      ring: n === 2 ? ringQuad : ringYouOnly,
      shed: n === 6 ? "down" : "intact",
      claiming: claimSet ? function (i) { return !!claimSet[i]; } : null,
      interactive: false
    });
  }

  /* the legend for the social graph, drawn from the same strokes as the plan */
  function sw(stroke, extra) {
    return '<svg width="28" height="14" aria-hidden="true" focusable="false">' +
      '<line x1="2" y1="7" x2="26" y2="7" stroke="' + stroke + '" stroke-width="4" ' +
      'stroke-linecap="round"' + (extra || "") + "/></svg>";
  }
  document.getElementById("graph-legend").innerHTML =
    '<p class="eyebrow">How they feel, and what happens anyway</p>' +
    '<p class="legend">' +
    "<span>" + sw(WORKS) + "Likes</span>" +
    "<span>" + '<svg width="28" height="14" aria-hidden="true" focusable="false">' +
      '<path d="M2 7 L8 2 L14 12 L20 2 L26 7" fill="none" stroke="' + SHORT +
      '" stroke-width="3" stroke-linejoin="round"/></svg>' + "Cannot stand</span>" +
    "<span>" + sw(RULE, ' stroke-dasharray="5 6"') + "Never met</span>" +
    "<span>" + sw(MACHINE) + "The machine's route</span>" +
    "</p>";

  /* ══════════════════════════════════════════════════════════════════════
     4 · ONE PASS — the machine's year
     ══════════════════════════════════════════════════════════════════════ */

  var SEASON = [
    { when: "February", what: "Canyon edge",
      items: ["610 m fuel break", "78 machine hours"], spend: 3100, at: 0.86, trace: 0.22 },
    { when: "May", what: "Boundary gaps",
      items: ["22 of 36 gaps cleared", "141 machine hours"], spend: 11650, at: 0.34, trace: 0.55 },
    { when: "August", what: "Five feet around each house",
      items: ["36 parcels renewed", "96 machine hours"], spend: 18600, at: 0.62, trace: 0.8 },
    { when: "December", what: "The rest, and verification",
      items: ["14 gaps closed", "63 machine hours"], spend: 27100, at: 0.12, trace: 1 }
  ];
  var stage = 1;

  var season = document.getElementById("season");
  SEASON.forEach(function (st, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chipbtn";
    b.setAttribute("aria-pressed", String(i === stage));
    b.innerHTML = '<span class="s-when">' + st.when + '</span><span class="s-what">' + st.what + "</span>";
    b.addEventListener("click", function () { stage = i; drawWorks(); });
    season.appendChild(b);
  });

  function drawWorks() {
    Array.prototype.forEach.call(season.children, function (b, i) {
      b.setAttribute("aria-pressed", String(i === stage));
    });
    var st = SEASON[stage];

    renderPlan({
      alt: "The same plan through the working year: the canyon-edge break, the strip around " +
        "each house and the 36 gaps between houses filling in, with the machine on the road " +
        "and its route running into all four of the marked parcels.",
      enrolled: isIn,
      /* The season fills in, but a refusal is never filled in over: consent
         outranks the schedule on every screen, not just the consent one. */
      zone: function (kind, k) {
        if (kind === "canyon") { return isIn(k) ? 1 : -1; }
        if (kind === "strip") { return !isIn(k) ? -1 : (stage >= 2 ? 1 : 0); }
        if (kind === "gap") {
          if (!gapTreated(k)) { return -1; }
          return stage >= 3 ? 1 : (stage >= 1 ? (k < 22 ? 1 : 0) : 0);
        }
        return 0;
      },
      machineAt: st.at,
      trace: st.trace,
      route: true,
      social: false,
      ring: ringQuad,
      shed: "intact",
      claiming: null,
      interactive: false
    });

    document.getElementById("worklog").innerHTML =
      '<p class="eyebrow">' + st.when + " 2036 · " + st.what + "</p>" +
      '<p class="figrow">' + st.items.map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</p>" +
      '<p class="tile-note">Works account, year to date: ' + money(st.spend) + " of " +
      money(WORKS_BUDGET) + ".</p>";

    refit();
  }

  /* ══════════════════════════════════════════════════════════════════════
     5 · THE REFUSAL
     ══════════════════════════════════════════════════════════════════════ */

  /* The designation rule, invented for this projection and stated on screen. */
  function designation() {
    var gp = treatedGaps() / GAPS, pp = enrolledCount() / HOMES, pair = adjacentPair();
    var open = GAPS - treatedGaps();
    if (gp >= 0.90 && pp >= 0.90 && !pair) {
      return { name: "Enhanced", cls: "tile--enhanced",
        note: open === 0 ? "Every test met." : open + " gaps open, inside the 90% tolerance." };
    }
    if (gp >= 0.75 && pp >= 0.80) {
      return { name: "Essential", cls: "tile--essential",
        note: pair ? "Two refusals side by side." : "Too many gaps left open." };
    }
    return { name: "Not designated", cls: "tile--none", note: "Below both floors." };
  }

  function drawConsent() {
    renderPlan({
      alt: "The same plan showing which properties have granted consent and which boundary " +
        "gaps are left open as a result. Gerald's, at number 30, is withheld.",
      enrolled: isIn,
      zone: standingZone,
      machineAt: null,
      trace: null,
      route: false,
      social: false,
      ring: ringYouOnly,
      shed: "intact",
      claiming: null,
      interactive: true
    });

    var d = designation(), en = enrolledCount(), tg = treatedGaps();

    document.getElementById("consent-readout").innerHTML = [
      '<div class="tile ' + d.cls + '"><p class="eyebrow">Neighborhood designation</p>' +
      '<p class="tile-fig">' + d.name + '</p><p class="tile-note">' + d.note + "</p></div>",

      '<div class="tile"><p class="eyebrow">Boundary gaps treated</p>' +
      '<p class="tile-fig">' + tg + " / " + GAPS + '</p>' +
      '<p class="tile-note">Both owners, or neither.</p></div>',

      '<div class="tile"><p class="eyebrow">Enrolled</p>' +
      '<p class="tile-fig">' + en + " / " + HOMES + '</p>' +
      '<p class="tile-note">No compulsion, ever.</p></div>',

      '<div class="tile"><p class="eyebrow">Works cost, each</p>' +
      '<p class="tile-fig">' + money(WORKS_BUDGET / en) + '</p>' +
      '<p class="tile-note">Same machine, fewer payers.</p></div>',

      '<div class="tile tile--rule"><p class="eyebrow">The rule</p>' +
      '<p class="tile-note">Enhanced needs 90% of gaps, 90% of properties, and no two ' +
      "refusals side by side.</p></div>"
    ].join("");

    refit();
  }

  svg.addEventListener("click", function (e) {
    var g = e.target.closest ? e.target.closest("[data-parcel]") : null;
    if (g) { toggleParcel(parseInt(g.dataset.parcel, 10)); }
  });
  svg.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") { return; }
    var g = e.target.closest ? e.target.closest("[data-parcel]") : null;
    if (g) { e.preventDefault(); toggleParcel(parseInt(g.dataset.parcel, 10)); }
  });
  function toggleParcel(i) {
    out[i] = !out[i];
    drawConsent();
    var again = svg.querySelector('[data-parcel="' + i + '"]');
    if (again) { again.focus(); }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-consent]"), function (b) {
    b.addEventListener("click", function () {
      out = {};
      var k = b.dataset.consent;
      if (k === "one") { out[GERALD] = true; }
      if (k === "pair") { out[GERALD] = true; out[GERALD + 1] = true; }
      if (k === "eight") { [2, 6, 11, 16, 22, GERALD, 30, 37].forEach(function (i) { out[i] = true; }); }
      drawConsent();
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     6 · ALMA'S SHED
     Below the policy's deductible the hardship layer may pay, capped. Once
     the policy responds the layer pays nothing at all — it never funds a
     deductible.
     ══════════════════════════════════════════════════════════════════════ */

  var loss = document.getElementById("loss");
  var lossOut = document.getElementById("loss-out");
  var lossBands = document.getElementById("loss-bands");

  function drawLoss() {
    var L = parseInt(loss.value, 10);
    lossOut.textContent = money(L);

    var you, pool, rest, policy, segs, keys;
    if (L > POLICY_DEDUCTIBLE) {
      policy = L - POLICY_DEDUCTIBLE;
      you = POLICY_DEDUCTIBLE;
      segs = [{ c: "seg-you", v: you }, { c: "seg-rest", v: policy, carrier: true }];
      keys = [
        { c: "k-you", l: "Alma's deductible", v: you },
        { c: "k-rest", l: "Her policy pays", v: policy, carrier: true },
        { c: "k-pool", l: "Pool", v: 0, note: "never a deductible" }
      ];
    } else {
      you = Math.min(MEMBER_FIRST, L);
      pool = Math.min(PER_EVENT_CAP, Math.max(0, L - MEMBER_FIRST));
      rest = Math.max(0, L - you - pool);
      segs = [{ c: "seg-you", v: you }, { c: "seg-pool", v: pool }, { c: "seg-rest", v: rest }];
      keys = [
        { c: "k-you", l: "Alma's first", v: you },
        { c: "k-pool", l: "Pool, to its $4,000 cap", v: pool },
        { c: "k-rest", l: "Left with Alma", v: rest }
      ];
    }

    lossBands.innerHTML =
      '<div class="band-bar">' + segs.map(function (x) {
        if (x.v <= 0) { return ""; }
        var style = "width:" + (x.v / L * 100) + "%";
        if (x.carrier) { style += ";background:#2F5E7C"; }
        return '<span class="band-seg ' + x.c + '" style="' + style + '"></span>';
      }).join("") + "</div>" +
      '<p class="band-keys">' + keys.map(function (x) {
        var sty = x.carrier ? ' style="background:#2F5E7C"' : "";
        return '<span><i class="' + x.c + '"' + sty + "></i>" + x.l + " <b>" + money(x.v) + "</b>" +
          (x.note ? " — " + x.note : "") + "</span>";
      }).join("") + "</p>";

    refit();
  }
  loss.addEventListener("input", drawLoss);
  drawLoss();

  /* ══════════════════════════════════════════════════════════════════════
     7 · TEN AT ONCE
     ══════════════════════════════════════════════════════════════════════ */

  var claimants = document.getElementById("claimants");
  var claimOut = document.getElementById("claimants-out");
  var corrStack = document.getElementById("corr-stack");
  var corrRead = document.getElementById("corr-readout");
  var CAPACITY = HARDSHIP_HELD + CONTRACT_LIMIT;       /* $40,000 */

  function drawCorr(redrawPlan) {
    var n = parseInt(claimants.value, 10);
    claimingN = n;
    claimOut.textContent = n + " of 38";

    var demand = n * PER_EVENT_CAP;
    var paid = Math.min(demand, CAPACITY);
    var poolUsed = Math.min(demand, HARDSHIP_HELD);
    var contractUsed = Math.min(Math.max(demand - HARDSHIP_HELD, 0), CONTRACT_LIMIT);
    var unmet = Math.max(demand - CAPACITY, 0);
    var each = paid / n;
    var pct = Math.round(each / PER_EVENT_CAP * 100);
    var scale = Math.max(demand, CAPACITY);

    function seg(cls, v, name) {
      if (v <= 0) { return ""; }
      var w = v / scale * 100;
      return '<span class="stack-seg ' + cls + '" style="width:' + w + '%">' +
        (w > 16 ? name + " " + money(v) : w > 6 ? name : "") + "</span>";
    }

    corrStack.innerHTML =
      '<div class="stack-bar">' + seg("st-pool", poolUsed, "Pool") +
      seg("st-contract", contractUsed, "Contract") + seg("st-gap", unmet, "Unmet") + "</div>" +
      '<p class="stack-caption">Asked for ' + money(demand) + " · paid " + money(paid) +
      (unmet ? " · " + money(unmet) + " never arrives" :
        " · " + (demand === CAPACITY ? "the stack is exactly full" : "the stack is not yet full")) + ".</p>";

    corrRead.innerHTML = [
      '<div class="tile' + (pct === 100 ? " tile--enhanced" : " tile--none") +
      '"><p class="eyebrow">Alma receives</p><p class="tile-fig">' + money(each) +
      '</p><p class="tile-note">' + pct + "% of the $4,000 cap.</p></div>",

      '<div class="tile"><p class="eyebrow">Pool funds</p><p class="tile-fig">' + money(HARDSHIP_HELD) +
      '</p><p class="tile-note">Three years of members’ money.</p></div>',

      '<div class="tile"><p class="eyebrow">Carrier’s aggregate limit</p><p class="tile-fig">' +
      money(CONTRACT_LIMIT) + '</p><p class="tile-note">Attaching above the pool.</p></div>',

      '<div class="tile"><p class="eyebrow">Pro-rata factor</p><p class="tile-fig">' +
      (paid / demand).toFixed(2) + '</p><p class="tile-note">No assessment. Everyone paid less.</p></div>',

      '<div class="tile tile--rule"><p class="eyebrow">Why it stops there</p>' +
      '<p class="tile-note">A wildfire is not ten households, which is why the layer is silent ' +
      "on declared events.</p></div>"
    ].join("");

    if (redrawPlan !== false && current === 7) { drawFor(7); }
    refit();
  }
  claimants.addEventListener("input", function () { drawCorr(true); });
  drawCorr(false);

  Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"), function (b) {
    b.addEventListener("click", function () {
      var ev = b.dataset.mode === "event";
      Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"), function (o) {
        var on = o === b;
        o.classList.toggle("is-on", on);
        o.setAttribute("aria-checked", String(on));
      });
      document.getElementById("corr-scattered").hidden = ev;
      document.getElementById("corr-event").hidden = !ev;
      corrRead.hidden = ev;
      refit();
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     ACCOUNTS
     ══════════════════════════════════════════════════════════════════════ */

  var acctHeads = Array.prototype.slice.call(document.querySelectorAll(".acct-head"));
  function setAcct(h, open) {
    h.setAttribute("aria-expanded", open ? "true" : "false");
    document.getElementById(h.getAttribute("aria-controls")).hidden = !open;
  }
  acctHeads.forEach(function (h) {
    h.addEventListener("click", function () {
      var open = h.getAttribute("aria-expanded") === "true";
      setAcct(h, !open);
      /* On a phone the four accounts are one at a time. Four open at once is
         more than a 360px-tall-ish stack can hold, and the alternative — the
         last one pushed off the bottom, or nine-pixel type — is worse than
         closing the one you were not reading. On a desktop there is room for
         all four, so they stay independent. */
      if (!open && narrow) {
        acctHeads.forEach(function (o) { if (o !== h) { setAcct(o, false); } });
      }
      refit();
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     FITTING A SCREEN TO THE STAGE

     A plate is sized by what it holds, not by the cell it was placed in.
     Anything anchored to the last row hangs from the bottom; everything else
     sits at the top of its cell, and the street fills the rest.

     What used to be here capped each plate at the height of its grid cell
     (`maxHeight = "100%"`) and let `overflow` deal with the remainder. On a
     short window that quietly sliced the first and last line off a
     vertically-centred plate — the eyebrow off the top, the last word off the
     bottom — with no way to scroll to either. A plate may no longer be given
     a height it has to hide the rest of, so instead the COMPOSITION gives
     way: `--fit` scales the whole screen's type and spacing until everything
     it holds is inside the stage. It is 1 on any window with room, and the
     type scale itself already moves with viewport height, so it is rarely
     asked for much.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  function anchorPlates() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".screen > [style*='grid-area']"), function (el) {
        if (el.classList.contains("plate--fill") || el.classList.contains("tiles")) { return; }
        var m = /grid-area:\s*(\d+)\s*\/\s*\d+\s*\/\s*(\d+)/.exec(el.getAttribute("style") || "");
        if (!m) { return; }
        el.style.alignSelf = (+m[2] === 9 && +m[1] > 1) ? "end" : "start";
      });
  }
  anchorPlates();

  /* the rectangle a screen's contents may occupy */
  function stageBox(sc) {
    var r = sc.getBoundingClientRect(), cs = getComputedStyle(sc);
    return {
      top: r.top + parseFloat(cs.paddingTop), bottom: r.bottom - parseFloat(cs.paddingBottom),
      left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight)
    };
  }

  /* True when anything on this screen is outside the stage, cut by a box it
     cannot be scrolled inside, or sitting on top of a neighbour. */
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
       the visually-hidden idiom — text meant only for a screen reader — and
       is not a defect; neither is a decorative bar with no words in it. */
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

  /* Anything that rewrites a screen's contents has to re-fit it. */
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

  var CTA = ["Meet the neighbours", "Follow the money", "See the machine", "One who says no",
             "The August storm", "When ten claim", "The carrier's side", "What Alma was told",
             "Still unsolved", "The larger idea", "Back to the street"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  var index = document.getElementById("index");
  screens.forEach(function (sc, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.dataset.goto = String(i + 1);
    b.innerHTML = '<span class="ix-n">' + String(i + 1).padStart(2, "0") + "</span>" + sc.dataset.label;
    li.appendChild(b);
    index.appendChild(li);
  });

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
    /* fit before the camera moves: on a phone the camera aims at whatever
       height the plates have left over, so it needs the settled layout */
    fitScreen(sc);
    moveCamera(sc.dataset.cam);
    buildPins(n);

    var h = sc.querySelector(".display");
    announce.textContent = "Screen " + n + " of " + total + ". " +
      (h ? h.textContent.replace(/\s+/g, " ").trim() : sc.dataset.label);

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
    if (tag === "select" || tag === "input" || (e.target.closest && e.target.closest("[data-parcel]"))) { return; }
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

  function fromHash() {
    var m = /#s\/(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) : 1;
  }
  window.addEventListener("hashchange", function () {
    var n = fromHash();
    if (n !== current) { show(n, false); }
  });

  narrow = isNarrow();
  show(fromHash(), false);
  moveCamera(screens[current - 1].dataset.cam, true);
})();
