/* ══════════════════════════════════════════════════════════════════════════
   Negotiated Neighborhood · Thorn Lane
   No framework, no build step, no external request. Three files and a font.

   Forked from prototype/resilience-grid/app.js for the navigation, the
   per-screen --fit search, the camera and the pin projection. The GROUND is
   the design study's (design-study/remaining-five/03-negotiated): one shallow
   cut-paper oblique of the street, carried into the browser rather than
   redrawn — same geometry, same commitment order, same state language.

   THE GROUND
   One invented street: sixty parcels in two rows of thirty either side of
   one road, in three blocks of ten a side, cut into a slope with open ground
   behind. Drawn once, full-bleed, and each screen is a camera move over it.

   The smallest object this ground resolves is ONE HOUSEHOLD, and the viewer
   can count them. The contract on screen 3 turns on how many of these sixty
   houses are filled, so a house has to be a thing you can point at.

   STATE IS NEVER CARRIED BY FADING, and colour means participation state
   only. A committed house is solid green with a solid edge and a filled
   frontage strip; a house not joined is paper-hollow with a dashed edge and
   no strip. Both survive greyscale. The one amber in the frame is the
   collective boundary, and it exists only at or above the threshold. The
   one ochre is the surveyor's mark, and it exists only while verification
   is illustrated.

   THE STATE OBJECT — one source of truth, S = { screen, committed, verified }
   · committed starts at 41 and is moved ONLY by the slider on screen 3. It
     is never reset by navigation in either direction.
   · verified starts false and is flipped ONLY by the toggle on screen 4.
   · "Back to the start" from screen 5 is the one action that resets both.
   · screen 5 is derived: begin = committed ≥ 48 && verified. Pressing Next
     never produces "begin"; only the two facts do.

   DEEP LINKS — five screens, #s/1 … #s/5. The three-screen build's links
   map as: old #s/1 → 1 (unchanged), old #s/2 (the threshold) → #s/3, old
   #s/3 (the agreement) → #s/5. A bare number cannot tell an old link from a
   new one, so this is documented, not remapped.

   WHAT IS INVENTED
   All of it. Thorn Lane, its sixty households, no. 31, the threshold of 48,
   the fund, the surveyor, the broker and every party to the agreement are
   invented, and screen 1 says so. No real insurer, place, product or price
   appears anywhere.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── the one data structure the copy depends on ──────────────────────── */
  var HOMES = 60;          /* parcels on Thorn Lane            */
  var PER_ROW = 30;        /* thirty either side of the road   */
  var NEED = 48;           /* the threshold — the product      */
  var START = 41;          /* where the street stands on entry */
  var ROSA = 15;           /* no. 31 — upper row, mid-street   */

  /* ── THE STATE ───────────────────────────────────────────────────────── */
  var S = { screen: 1, committed: START, verified: false };
  function begin() { return S.committed >= NEED && S.verified; }

  /* ── palette (the study's) ───────────────────────────────────────────── */
  var P = "#F3EBD7", INK = "#16150F", MU = "#5A554A",
      G = "#2F5A44", G2 = "#24473A", F = "#8C9A84", F2 = "#6F7F68",
      A = "#C98D1C", GROUND = "#E8DDC2", TAR = "#DACCA8", KERB = "#CFC2A0",
      SURVEY = "#7A5A17";

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY — one shallow oblique
     x runs along the street, D away from the viewer, z up. The study's
     1180 x 820 frame is the world's reference; the paper, slope and road
     extend far past it so the viewport crops the ground and never finds
     its edge.
     ══════════════════════════════════════════════════════════════════════ */
  var KX = 0.16, KY = 0.5, YB = 582;             /* near edge of the lower lots */
  function X(x, D) { return x + KX * D; }
  function Y(D, z) { return YB - KY * D - (z || 0); }
  function pt(x, D, z) { return X(x, D).toFixed(1) + "," + Y(D, z).toFixed(1); }

  var PITCH = 32, BW = 10 * PITCH, GAP = 34, X0 = 56;   /* blocks: 56–376 · 410–730 · 764–1084 */
  function bx(b) { return X0 + b * (BW + GAP); }
  function colOf(i) { return i % PER_ROW; }
  function hx(i) { var col = colOf(i); return bx(Math.floor(col / 10)) + (col % 10) * PITCH; }
  var ROAD = [120, 220];                                  /* D of the road */
  var LOT = { lo: [0, 120], up: [224, 344] };             /* D of the lots either side */
  var HW = 22, HD = 22, HH = 21, HR = 10;                 /* house: width, depth, wall, ridge */
  var HD0 = { up: 246, lo: 20 };                          /* both rows face the road */
  var FAR = -1400, NEAR = 2600;                           /* how far the ground runs */

  /* the collective boundary, in street coordinates */
  var BND = [[X0 - 20, -16], [bx(2) + BW + 14, -16], [bx(2) + BW + 14, 376], [X0 - 20, 376]];

  /* where a household's pin aims: the ridge of its house */
  function hcx(i) { var up = i < PER_ROW; return X(hx(i) + PITCH / 2, (up ? HD0.up : HD0.lo) + HD / 2); }
  function hcy(i) { var up = i < PER_ROW; return Y((up ? HD0.up : HD0.lo) + HD / 2, HH + HR); }
  /* the ring drawn round no. 31: centre and radius, in world units */
  var RING_R = 26;
  function ringc(i) { var d0 = i < PER_ROW ? HD0.up : HD0.lo; return { x: X(hx(i) + PITCH / 2, d0), y: Y(d0, 10) }; }

  /* ── cameras ──────────────────────────────────────────────────────────
     A camera is the world region that must be VISIBLE, not a raw viewBox.
     viewBoxFor() turns it into one at draw time against the screen's own
     ground window, so the framing stays honest at any window size. */
  var CAM = {
    street: { x: 0, y: 282, w: 1180, h: 334 },
    /* screen 2: close on no. 31 and the run of houses either side of it,
       both rows and the road still in frame, so the agreement is seen
       attached to one home among others */
    deal:   { x: 420, y: 404, w: 420, h: 180 },
    commit: { x: 0, y: 282, w: 1180, h: 334 },
    signed: { x: -70, y: 282, w: 1320, h: 360 }
  };
  /* A phone gets the same landscape world, framed tighter: both rows and
     the road still, but a run of the street rather than all sixty, because
     the window under the stacked copy is short. A tablet in portrait is
     wide enough to hold the whole street and keeps the full camera. */
  var CAM_N = {
    street: { x: 330, y: 282, w: 560, h: 334 },
    deal:   { x: 500, y: 404, w: 260, h: 180 },
    commit: { x: 330, y: 282, w: 560, h: 334 },
    signed: { x: 330, y: 282, w: 560, h: 360 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }
  function isPhone() { return window.matchMedia("(max-width: 599px)").matches; }

  var svg = document.getElementById("plan");

  /* ══════════════════════════════════════════════════════════════════════
     WHO COMMITS, AND IN WHAT ORDER
     Not a shuffle. Commitment on a street spreads from a few households to
     the ones beside them, so the order grows outward from five starters and
     the holdouts end up at the ends of the runs — which is what makes the
     frontage strip visibly knit together as the count rises, and what makes
     the last few signatures look hard to get. The study uses this order.
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

  /* ── deterministic planting, so the street looks like a street ─────── */
  var TREES = [[48, 302, 13, 0], [150, 308, 11, 1], [262, 298, 13, 0], [392, 306, 10, 1], [462, 310, 12, 0], [600, 300, 13, 1],
               [708, 308, 11, 0], [748, 296, 9, 1], [830, 304, 13, 0], [952, 310, 11, 1], [1060, 300, 13, 0],
               [-80, 306, 12, 1], [-210, 298, 13, 0], [-340, 310, 10, 1], [1190, 304, 12, 0], [1320, 298, 13, 1], [1450, 308, 10, 0]];
  var SHRUBS = [[393, 58, 7], [392, 92, 5], [747, 66, 8], [748, 100, 5], [32, 70, 7], [1108, 76, 7], [-60, 60, 6], [1180, 96, 6]];

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE STREET
       opts.mode     — "alone"  (screens 1 and 2: nobody has committed;
                                  no. 31 did the work on its own and is ringed)
                       "commit" (screens 3, 4, 5: every house shows its
                                  state; the boundary draws at ≥ 48)
       opts.verified — commit mode only: the surveyor's ochre mark on every
                       committed lot, while verification is illustrated
       opts.alt      — the accessible description
     ══════════════════════════════════════════════════════════════════════ */

  function poly(pts, fill, o) {
    o = o || {};
    return '<polygon points="' + pts.map(function (p) { return pt(p[0], p[1], p[2]); }).join(" ") +
      '" fill="' + fill + '"' + (o.st ? ' stroke="' + o.st + '" stroke-width="' + (o.sw || 1.4) + '" stroke-linejoin="round"' : "") +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.filter ? ' filter="' + o.filter + '"' : "") + (o.attr ? " " + o.attr : "") + "/>";
  }
  function line(x1, y1, x2, y2, c, w, o) {
    o = o || {};
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
      '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") + "/>";
  }

  function house(i, on, ringed) {
    var up = i < PER_ROW, x = hx(i) + (PITCH - HW) / 2, d0 = up ? HD0.up : HD0.lo, d1 = d0 + HD;
    var fillF = on ? G : P, fillS = on ? G2 : P, fillRL = on ? F : P, fillRR = on ? F2 : P;
    var st = on ? G2 : MU, dash = on ? null : "3 2.5", sw = on ? 1 : 1.5, s = [];
    s.push('<g data-house="' + (on ? "in" : "out") + '">');
    /* left roof slope, right roof slope, right wall, near face (gable) */
    s.push(poly([[x, d0, HH], [x, d1, HH], [x + HW / 2, d1, HH + HR], [x + HW / 2, d0, HH + HR]], fillRL, { st: st, dash: dash, sw: sw }));
    s.push(poly([[x + HW / 2, d0, HH + HR], [x + HW / 2, d1, HH + HR], [x + HW, d1, HH], [x + HW, d0, HH]], fillRR, { st: st, dash: dash, sw: sw }));
    s.push(poly([[x + HW, d0, 0], [x + HW, d1, 0], [x + HW, d1, HH], [x + HW, d0, HH]], fillS, { st: st, dash: dash, sw: sw }));
    s.push(poly([[x, d0, 0], [x + HW, d0, 0], [x + HW, d0, HH], [x + HW / 2, d0, HH + HR], [x, d0, HH]], fillF, { st: st, dash: dash, sw: sw }));
    if (on && up) { /* a door toward the road, so the upper row reads as fronts */
      s.push(poly([[x + 8, d0, 0], [x + 14, d0, 0], [x + 14, d0, 9], [x + 8, d0, 9]], P, { op: .85 }));
    }
    s.push('</g>');
    if (ringed) {
      var c = ringc(i);
      s.push('<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) +
             '" r="' + RING_R + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>');
    }
    return s.join("");
  }

  /* the surveyor's mark: one ochre check at the ridge of a committed house,
     drawn only while verification is ILLUSTRATED. It is the one ochre on
     the ground and it means "a surveyor is shown to have passed this lot" —
     never "this lot is covered". */
  function tick(i) {
    var cx = hcx(i), cy = hcy(i) - 7;
    return '<g data-tick="1"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5.2" fill="' + SURVEY + '" stroke="' + P + '" stroke-width="1.3"/>' +
      '<path d="M' + (cx - 2.6).toFixed(1) + ' ' + (cy + 0.2).toFixed(1) + ' l1.9 1.9 l3.4 -3.8" fill="none" stroke="' + P + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }

  /* the frontage strip: the cleared metres at the road edge of a committed
     lot. Below the threshold every strip stops short of its neighbour. At
     the threshold the committed strips meet, and bridge the block gaps,
     into continuous runs — broken only where a lot is still out. */
  function strips(up, isIn, crossed) {
    var s = [], D0 = up ? LOT.up[0] : LOT.lo[1] - 12, D1 = D0 + 12, base = up ? 0 : PER_ROW;
    for (var i = base; i < base + PER_ROW; i++) {
      if (!isIn(i)) { continue; }
      var col = colOf(i), x0 = hx(i), x1 = x0 + PITCH, inset = crossed ? 0 : 5;
      if (crossed && col % 10 === 9 && col < PER_ROW - 1 && isIn(i + 1)) { x1 += GAP; }
      s.push(poly([[x0 + inset, D0], [x1 - inset, D0], [x1 - inset, D1], [x0 + inset, D1]], G));
    }
    return s.join("");
  }

  function tree(x, D, r, dark) {
    return line(X(x, D), Y(D), X(x, D), Y(D) - r * 1.1, INK, 2, { op: .55 }) +
      '<circle cx="' + X(x, D).toFixed(1) + '" cy="' + (Y(D) - r * 1.35).toFixed(1) + '" r="' + r + '" fill="' + (dark ? F2 : F) + '"/>';
  }
  function shrub(x, D, r) {
    return '<ellipse cx="' + X(x, D).toFixed(1) + '" cy="' + Y(D).toFixed(1) + '" rx="' + r + '" ry="' + (r * .62).toFixed(1) + '" fill="' + F2 + '" opacity=".8"/>';
  }

  /* the slope behind the street: a low, planted horizon, deterministic */
  function horizonPts(y0) {
    var out = [], x;
    for (x = FAR; x <= NEAR; x += 60) {
      out.push(x + " " + (y0 + 9 * Math.sin(x / 95) + 5 * Math.sin(x / 41 + 1.3)).toFixed(1));
    }
    return out;
  }
  function horizon(y0) { return "M" + horizonPts(y0).join(" L"); }
  /* the planted band just below the horizon: the top edge forward, the
     lower edge back */
  function slopeBand() {
    return "M" + horizonPts(304).join(" L") + " L" + horizonPts(332).reverse().join(" L") + " Z";
  }

  function renderStreet(opts) {
    opts = opts || {};
    var mode = opts.mode || "commit";
    var alone = mode === "alone";
    var C = alone ? 0 : S.committed;
    var crossed = !alone && C >= NEED;
    var verified = !alone && !!opts.verified;
    function isIn(i) { return RANK[i] < C; }
    var s = [], i;

    s.push('<defs>' +
      '<filter id="grain" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in" result="g"/><feBlend in="SourceGraphic" in2="g" mode="multiply"/></filter>' +
      '<filter id="rough" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '</defs>');
    /* every mark sits in one untransformed group, so the pin projection can
       read a single CTM */
    s.push('<g>');

    /* paper, the one ground plane, the slope, the road — all past every edge */
    s.push('<rect x="' + FAR + '" y="-1400" width="' + (NEAR - FAR) + '" height="3200" fill="' + P + '"/>');
    var hz = horizon(304);
    s.push('<path d="' + hz + ' L' + NEAR + ' 606 L' + FAR + ' 606 Z" fill="' + GROUND + '"/>');
    s.push('<path d="' + hz + '" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".28"/>');
    s.push('<path d="' + slopeBand() + '" fill="' + F + '" opacity=".3"/>');
    s.push(poly([[FAR, ROAD[0]], [NEAR, ROAD[0]], [NEAR, ROAD[1]], [FAR, ROAD[1]]], TAR, { filter: "url(#grain)" }));
    s.push(line(X(FAR, 170), Y(170), X(NEAR, 170), Y(170), P, 2, { dash: "22 16", op: .9 }));
    s.push(line(X(FAR, ROAD[1]), Y(ROAD[1]), X(NEAR, ROAD[1]), Y(ROAD[1]), KERB, 1.6));
    s.push(line(X(FAR, ROAD[0]), Y(ROAD[0]), X(NEAR, ROAD[0]), Y(ROAD[0]), KERB, 1.6));

    /* six blocks of ten: ground plates */
    s.push('<g filter="url(#grain)">');
    for (var b = 0; b < 3; b++) {
      var x0 = bx(b) - 3, x1 = bx(b) + BW + 3;
      s.push(poly([[x0, LOT.up[0]], [x1, LOT.up[0]], [x1, LOT.up[1]], [x0, LOT.up[1]]], F, { op: .42 }));
      s.push(poly([[x0, LOT.lo[0]], [x1, LOT.lo[0]], [x1, LOT.lo[1]], [x0, LOT.lo[1]]], F, { op: .42 }));
    }
    s.push('</g>');
    /* a faint lot line between every pair of neighbours, so a lot is a lot */
    for (i = 0; i < HOMES; i++) {
      var col = colOf(i); if (col % 10 === 0) { continue; }
      var up = i < PER_ROW, lx = hx(i), L = up ? LOT.up : LOT.lo;
      s.push(line(X(lx, L[0]), Y(L[0]), X(lx, L[1]), Y(L[1]), INK, 1, { op: .14 }));
    }

    /* ── the collective boundary: the threshold EVENT, the only amber ── */
    if (crossed) {
      s.push(poly(BND, A, { op: .07, attr: 'data-boundary="fill"' }));
      s.push(poly(BND, "none", { st: A, sw: 4, attr: 'data-boundary="edge"' }));
    }

    /* planting behind the upper row (far), the upper row, strips, then the
       near row and its garden */
    TREES.forEach(function (t) { s.push(tree(t[0], t[1], t[2], t[3])); });
    s.push(strips(true, isIn, crossed));
    for (i = 0; i < PER_ROW; i++) {
      s.push(house(i, alone ? i === ROSA : isIn(i), alone && i === ROSA));
      if (verified && isIn(i)) { s.push(tick(i)); }
    }
    s.push(strips(false, isIn, crossed));
    SHRUBS.forEach(function (t) { s.push(shrub(t[0], t[1], t[2])); });
    for (i = PER_ROW; i < HOMES; i++) {
      s.push(house(i, isIn(i), false));
      if (verified && isIn(i)) { s.push(tick(i)); }
    }

    s.push('</g>');
    svg.innerHTML = s.join("");
    if (opts.alt) { svg.setAttribute("aria-label", opts.alt); }
  }

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
     width. Sixty houses the viewer is meant to COUNT have to land in the
     clear band, not half under the copy. Width is still the viewport's,
     because a street wants to run off both edges. */
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
    var sc = screens && screens[S.screen - 1];
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
    var cam = (isPhone() && CAM_N[name]) || CAM[name] || CAM.street;
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
  var tetherEl = document.getElementById("tether");

  function pinAt(cls, label, i, dy) {
    return { cls: cls, label: label, wx: hcx(i), wy: hcy(i), dy: dy };
  }
  function pinSet(n) {
    /* Screen 1 carries one artwork label: no. 31. Screen 5, once the
       arrangement can begin, labels one house that has not joined — the
       next in the commitment order, which is where a run of committed
       frontage breaks. At sixty there is no such house and no label. */
    if (n === 1) { return [pinAt("ink", "No. 31 · prepared", ROSA, -44)]; }
    if (n === 5 && begin() && S.committed < HOMES) {
      return [pinAt("out", "outside the arrangement", ORDER[S.committed], -44)];
    }
    return [];
  }

  function buildPins(n) {
    Array.prototype.slice.call(pinHost.querySelectorAll(".pin")).forEach(function (el) { pinHost.removeChild(el); });
    pinSet(n).forEach(function (p) {
      var el = document.createElement("span");
      el.className = "pin pin--" + p.cls;
      el.textContent = p.label;
      el.dataset.wx = p.wx; el.dataset.wy = p.wy; el.dataset.dy = p.dy || 0;
      pinHost.appendChild(el);
    });
    placePins();
  }

  /* screen-space projection of a world point through the drawing's CTM */
  function project(m, x, y) { return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }; }

  /* The tether: the line that ties the agreement object on screen 2 to the
     ring round no. 31. From the ring's edge to the nearest point on the
     card's edge; hidden when the house is off-screen or under the card. */
  function placeTether(m) {
    if (!tetherEl) { return; }
    var card = S.screen === 2 ? document.getElementById("deal-card") : null;
    if (!card || card.offsetParent === null) { tetherEl.innerHTML = ""; return; }
    var r = card.getBoundingClientRect();
    var c = ringc(ROSA), p0 = project(m, c.x, c.y);
    var scale = Math.sqrt(m.a * m.a + m.b * m.b);
    var rad = RING_R * scale;
    /* nearest point on the card's rectangle to the ring centre */
    var qx = Math.max(r.left, Math.min(r.right, p0.x)), qy = Math.max(r.top, Math.min(r.bottom, p0.y));
    var dx = qx - p0.x, dy = qy - p0.y, len = Math.sqrt(dx * dx + dy * dy);
    var onScreen = p0.x > 4 && p0.x < window.innerWidth - 4 && p0.y > 4 && p0.y < window.innerHeight - 4;
    if (!onScreen || len < rad + 12) { tetherEl.innerHTML = ""; return; }
    var ux = dx / len, uy = dy / len;
    var ax = p0.x + ux * rad, ay = p0.y + uy * rad;
    tetherEl.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    tetherEl.innerHTML =
      '<line x1="' + ax.toFixed(1) + '" y1="' + ay.toFixed(1) + '" x2="' + qx.toFixed(1) + '" y2="' + qy.toFixed(1) + '" stroke="' + P + '" stroke-width="5" stroke-linecap="round"/>' +
      '<line x1="' + ax.toFixed(1) + '" y1="' + ay.toFixed(1) + '" x2="' + qx.toFixed(1) + '" y2="' + qy.toFixed(1) + '" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="4" fill="' + INK + '" stroke="' + P + '" stroke-width="1.5"/>';
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

    placeTether(m);

    var sc = screens && screens[S.screen - 1];
    var blockers = sc ? Array.prototype.filter.call(sc.children, function (p) { return !p.classList.contains("gw"); })
      .map(function (p) { return p.getBoundingClientRect(); }) : [];
    blockers = blockers.concat(Array.prototype.map.call(
      document.querySelectorAll(".chrome button, .chrome select"),
      function (p) { return p.getBoundingClientRect(); }));

    var placed = [];
    Array.prototype.forEach.call(pinHost.querySelectorAll(".pin"), function (el) {
      var p = project(m, +el.dataset.wx, +el.dataset.wy);
      var cx = p.x, cy = p.y + (+el.dataset.dy);
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
     PAINT — every state-dependent word and mark, from S, in one place
     ══════════════════════════════════════════════════════════════════════ */

  /* One polite live region for state changes that are not screen changes.
     The screen announcer (#announce) handles navigation; this handles
     everything else, so the two never overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  var range = document.getElementById("thr-range");
  var ctlEl = document.getElementById("ctl");
  var countEl = document.getElementById("thr-count");
  var offerEl = document.getElementById("offer");
  var offerText = document.getElementById("offer-text");
  var condN = document.getElementById("cond-n");
  var stepPart = document.getElementById("step-part");
  var stepImpr = document.getElementById("step-impr");
  var stepVer = document.getElementById("step-ver");
  var verState = document.getElementById("ver-state");
  var verBtn = document.getElementById("verify-toggle");
  var arrHead = document.getElementById("arr-head");
  var arrLine = document.getElementById("arr-line");

  var WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven",
               "eight", "nine", "ten", "eleven", "twelve"];
  function few(n) { return n <= 12 ? WORDS[n] : String(n); }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

  /* Screen 3's ONE state line, verbatim from the copy contract. Below the
     threshold: "Not yet. {k} more households needed." with k = 48 − count,
     as a word up to twelve and a number above; k = 1 takes the singular. */
  function conditionLine(open) {
    if (open) { return "Participation reached. Improvements and verification still required."; }
    var short = NEED - S.committed;
    return "Not yet. " + cap(few(short)) + " more household" + (short === 1 ? "" : "s") + " needed.";
  }

  /* Screen 5's words, derived. The pending line names what is missing. */
  function missing() {
    var out = [];
    if (S.committed < NEED) { out.push("Participation below 48"); }
    if (!S.verified) { out.push("Verification not illustrated"); }
    return out;
  }

  /* one block span per line, with a space between so textContent — what a
     screen reader and the gate both read — keeps the words apart */
  function spans(lines) {
    return lines.map(function (t) { return "<span>" + t + "</span>"; }).join(" ");
  }

  function paint() {
    var open = S.committed >= NEED;

    /* screen 3 */
    if (countEl) { countEl.textContent = String(S.committed); }
    if (range && +range.value !== S.committed) { range.value = String(S.committed); }
    /* the track fills behind the thumb, so the distance still to travel is
       visible without reading the number */
    if (range) { range.style.setProperty("--p", (S.committed / HOMES * 100).toFixed(2) + "%"); }
    if (ctlEl) { ctlEl.dataset.state = open ? "open" : "closed"; }
    if (offerEl) { offerEl.dataset.state = open ? "open" : "closed"; }
    if (offerText) { offerText.textContent = conditionLine(open); }

    /* screen 4 — the count is the slider's, never clamped to 48 */
    if (condN) { condN.textContent = String(S.committed); }
    if (stepPart) { stepPart.dataset.state = open ? "met" : "pending"; }
    if (stepImpr) { stepImpr.dataset.state = S.verified ? "met" : "pending"; }
    if (stepVer) { stepVer.dataset.state = S.verified ? "met" : "pending"; }
    if (verState) { verState.textContent = S.verified ? "Illustrated as verified" : "Pending"; }
    if (verBtn) { verBtn.setAttribute("aria-pressed", S.verified ? "true" : "false"); }

    /* screen 5 — derived */
    if (arrHead && arrLine) {
      if (begin()) {
        arrHead.innerHTML = spans(["The arrangement", "can begin."]);
        arrLine.innerHTML = spans(["Conditional terms in force while 48 stay in and checks continue."]);
      } else {
        arrHead.innerHTML = spans(["Still pending."]);
        arrLine.innerHTML = spans(missing());
      }
      screens[4].dataset.state = begin() ? "begin" : "pending";
    }
  }

  /* repaint the words, then whatever the open screen draws from them */
  function repaint() {
    paint();
    if (S.screen >= 3) { drawFor(S.screen); buildPins(S.screen); }
    refit();
  }

  var lastOpen = null;
  if (range) {
    range.addEventListener("input", function () {
      S.committed = parseInt(range.value, 10) || 0;
      var open = S.committed >= NEED;
      repaint();
      if (open !== lastOpen) {
        say(open
          ? "Threshold met at " + S.committed + " of 60. Participation reached; improvements and verification still required."
          : "Below the threshold at " + S.committed + " of 60. " + (NEED - S.committed) + " more needed.");
      } else {
        say(open
          ? S.committed + " of 60 committed. The threshold of 48 is met."
          : S.committed + " of 60 committed, " + (NEED - S.committed) + " short of 48.");
      }
      lastOpen = open;
    });
  }

  if (verBtn) {
    verBtn.addEventListener("click", function () {
      S.verified = !S.verified;
      repaint();
      say(S.verified
        ? "Verified completion illustrated. Simulated for discussion; not evidence of work done."
        : "Illustration removed. Verification pending.");
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function altFor(n) {
    var c = S.committed, hollow = HOMES - c;
    var streetState = "The street with " + c + " of the sixty houses committed: each solid green with a " +
      "cleared frontage strip at the road. The remaining " + hollow + " are hollow with dashed edges and no strip. " +
      (c >= NEED
        ? "An amber boundary encloses the whole street, hollow houses included. "
        : "There is no boundary around the street. ") +
      (S.verified ? "Every committed house carries a small ochre check: the surveyor's mark, illustrated, not evidence. " : "");
    if (n === 1) {
      return "Thorn Lane drawn in a shallow oblique: sixty houses in two rows of thirty either " +
        "side of one road, in three blocks a side, with a planted slope behind. Every house is " +
        "hollow with a dashed edge except number 31, which is solid and ringed: the one prepared " +
        "home, labelled “No. 31, prepared”. It has hardened its own lot and still has no offer, " +
        "because the street around it sets the price.";
    }
    if (n === 2) {
      return "Close on number 31 and the houses either side of it: still the only solid house, " +
        "ringed, every neighbour hollow. A line ties the ring to the agreement sheet above it.";
    }
    if (n === 3) { return streetState; }
    if (n === 4) { return streetState + "Three condition steps sit along the foot of the scene."; }
    return streetState + (begin()
      ? "The arrangement can begin; one house that has not joined is labelled “outside the arrangement”."
      : "The arrangement is still pending.");
  }

  function drawFor(n) {
    if (n <= 2) { renderStreet({ mode: "alone", alt: altFor(n) }); }
    else        { renderStreet({ mode: "commit", verified: S.verified, alt: altFor(n) }); }
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
      document.querySelectorAll(".screen > .plate[style*='grid-area'], .screen > .steps[style*='grid-area']"), function (el) {
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
       there buys nothing and costs everything. Below 900px the type holds its
       size and the screen scrolls. */
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
      fitScreen(screens && screens[S.screen - 1]);
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

  var CTA = ["Know the deal", "Assemble the street", "Verify the conditions", "Can it begin?", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();

  function show(n, push) {
    n = Math.max(1, Math.min(total, n));
    S.screen = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    /* a control on the screen that just closed must not keep the focus —
       a hidden button would otherwise swallow the arrow keys */
    var ae = document.activeElement, host = ae && ae.closest ? ae.closest(".screen") : null;
    if (host && host.hidden && ae.blur) { ae.blur(); }
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    paint();
    drawFor(n);
    /* fit before the camera moves: the camera aims at the ground window,
       so it needs the settled layout */
    fitScreen(sc);
    moveCamera(sc.dataset.cam);
    buildPins(n);

    /* Headlines are authored as one span per line, so textContent would run
       the lines together. Join the spans with a space instead. */
    var h = sc.querySelector(".display");
    var sp = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (sp.length
          ? Array.prototype.map.call(sp, function (x) { return x.textContent.trim(); }).join(" ")
          : h.textContent)
      : sc.dataset.label;
    if (n === 5) {
      said += " " + (begin()
        ? "Conditional terms in force while 48 stay in and checks continue."
        : missing().join(". ") + ".");
    }
    announce.textContent = "Screen " + n + " of " + total + ". " +
      said.replace(/\s+/g, " ").trim();

    if (push !== false) {
      try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ }
    }
  }

  /* "Back to the start" — the ONE reset in the deck. The slider's count and
     the verification illustration both return to their entry values. Going
     back with the arrow, the picker or a hash never resets anything. */
  function restart() {
    S.committed = START;
    S.verified = false;
    lastOpen = null;
    show(1);
    say("Back to the start. 41 of 60 committed; verification not illustrated.");
  }
  function next() {
    if (S.screen === total) { restart(); } else { show(S.screen + 1); }
  }
  function prev() {
    if (S.screen > 1) { show(S.screen - 1); }
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (t) { show(parseInt(t.dataset.goto, 10)); }
  });

  /* Arrow keys move the deck — except inside the threshold slider and the
     picker, where the arrow keys belong to the control. A focused button
     (Next, after a tap) has no use for left and right, so they still move
     the deck. */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input") { return; }
    if (e.key === "ArrowRight") { next(); }
    if (e.key === "ArrowLeft") { prev(); }
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
         not just the visible one, so a resize can never leave a hidden
         screen holding a scale that was right for a different window. */
      screens.forEach(function (s) {
        var h = s.hidden;
        if (h) { s.hidden = false; }
        fitScreen(s);
        if (h) { s.hidden = true; }
      });
      moveCamera(screens[S.screen - 1].dataset.cam, true);
      placePins();
    }, 140);
  });
  /* a narrow screen scrolls; the tether's card end moves with it */
  screens.forEach(function (s) { s.addEventListener("scroll", function () { placePins(); }, { passive: true }); });

  /* Skip link: move focus to the open screen's heading, without touching the
     hash. Every .display carries tabindex="-1" so it can receive focus. */
  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[S.screen - 1];
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
    if (n !== null && n !== S.screen) { show(n, false); }
  });

  narrow = isNarrow();
  paint();
  show(fromHash() || 1, false);
  moveCamera(screens[S.screen - 1].dataset.cam, true);
  /* the font arrives after first layout; the headline backing is the text's
     own box so it follows, but the fit and the camera need the settled lines */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      fitScreen(screens[S.screen - 1]);
      moveCamera(screens[S.screen - 1].dataset.cam, true);
    });
  }
})();
