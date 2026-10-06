/* ══════════════════════════════════════════════════════════════════════════
   First Move · the opening bookend
   Two screens. No framework, no build step, no external request.

   THE ARGUMENT AS A PLACE
   A charcoal information field with one directional axis running through it.

       screen 1   four quotes are read, the two clauses that matter to this
                  household are pulled out onto the path, and ONE quote is
                  lifted out of the fan as the recommendation — not the
                  cheapest. The path runs on, quietly, toward the edge.
       screen 2   the same path, carried on from the recommendation, meets
                  a wall. The purchase beyond it is the customer's.

   Both screens are drawn into their own SVG in CSS PIXELS: the viewBox is the
   element's own box, so a 16px label here is 16px on the glass, on a phone as
   much as on a 1536 desktop. The world SVG behind them carries only the
   ground. All words on the glass are the ones in the copy contract
   (design-study/density-pass/SCREEN-COPY.md · FIRST MOVE); everything else is
   geometry. Screen-reader text (aria-labels, the live region) stays detailed.

   WHAT THIS IS, AND IS NOT
   A clearly-labelled RECONSTRUCTION of the kind of exchange a person can
   already have with a general assistant about insurance. It is not a
   recording and no real assistant, insurer, price or document is named.

   ORIENTATION
   A horizontal axis cannot survive a 390x844 phone, so each composition has
   two layouts, landscape and portrait, chosen from the viewport width. Same
   beats, same geometry vocabulary, axis rotated.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var worldEl = document.getElementById("world");
  var svg = document.getElementById("field");
  var chromeEl = document.querySelector(".chrome");

  /* ── palette: the design study's ───────────────────────────────────────
     charcoal ground, cut-paper lavender quotes, a paper recommendation,
     cool traces, one warm family (the hatch on screen 1, the wall on 2). */
  var S = {
    ground: "#1E242B", paper: "#F3EBD7", cream: "#F3EBD7", muted: "#B4AE9C",
    doc: "#8F8CB8", rule: "#4A4870", ink: "#16150F",
    ai: "#2E6E80", aihi: "#6FC3CF", warm: "#A8502A", warmhi: "#E39A5C"
  };
  var QUOTES = [
    { k: "A", garage: false, claimAt: 0.28 },
    { k: "B", garage: true,  claimAt: 0.62 },
    { k: "C", garage: true,  claimAt: 0.44, cheapest: true },
    { k: "D", garage: false, claimAt: 0.80, recommended: true }
  ];

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function f1(n) { return (+n).toFixed(1); }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function isPortrait() { return window.innerWidth < 900; }

  /* deterministic noise, so the field never flickers between renders */
  var seed = 7;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  /* ══════════════════════════════════════════════════════════════════════
     THE GROUND — the information field, as texture only
     ══════════════════════════════════════════════════════════════════════ */
  function ground(W, H) {
    var s = [], i;
    seed = 11;
    s.push('<rect x="0" y="0" width="' + f1(W) + '" height="' + f1(H) + '" fill="' + S.ground + '"/>');
    s.push('<g opacity=".45">');
    for (i = 0; i < 110; i++) {
      var w = (24 + rnd() * 84), h = w * (1.1 + rnd() * 0.5);
      var x = rnd() * W * 1.1 - W * 0.05, y = rnd() * H * 1.1 - H * 0.05;
      s.push('<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) +
             '" fill="' + S.doc + '" opacity="' + (0.03 + rnd() * 0.07).toFixed(3) + '"/>');
      if (rnd() > 0.74) {
        for (var k = 1; k < 4; k++) {
          var ly = y + h * (k * 0.22 + 0.1);
          s.push('<line x1="' + f1(x + w * 0.14) + '" y1="' + f1(ly) + '" x2="' + f1(x + w * (0.5 + rnd() * 0.3)) +
                 '" y2="' + f1(ly) + '" stroke="' + S.doc + '" stroke-width="1.2" opacity=".16"/>');
        }
      }
    }
    s.push('</g>');
    return s.join("");
  }

  function paintGround() {
    if (!svg || !worldEl) { return; }
    var r = worldEl.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + f1(r.width) + " " + f1(r.height));
    svg.innerHTML = ground(r.width, r.height);
  }

  /* shared defs: paper grain and the one warm hatch. Ids are prefixed per
     scene because both SVGs live in the same document. */
  function defs(p) {
    return '<defs>' +
      '<filter id="' + p + 'grain" x="-2%" y="-2%" width="104%" height="104%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" result="a"/>' +
        '<feComposite in="SourceGraphic" in2="a" operator="in" result="g"/>' +
        '<feBlend in="SourceGraphic" in2="g" mode="multiply"/>' +
      '</filter>' +
      '<pattern id="' + p + 'hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
        '<line x1="0" y1="0" x2="0" y2="7" stroke="' + S.warm + '" stroke-width="2"/>' +
      '</pattern>' +
      '</defs>';
  }

  /* a point on a sheet after its rotation about its own centre */
  function sheetPt(sh, SW, SH, u, v) {
    var cx = sh.x + SW / 2, cy = sh.y + SH / 2, a = sh.a * Math.PI / 180;
    var dx = sh.x + SW * u - cx, dy = sh.y + SH * v - cy;
    return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
  }

  /* ── one quote. opts: paper (the recommendation), title, marks ─────────
     The wording is abstract ruled lines: no text inside a sheet except its
     title, and the title only when `title` is set. */
  function quoteSheet(p, SW, SH, sh, q, o) {
    var s = [];
    var cx = sh.x + SW / 2, cy = sh.y + SH / 2;
    var fill = o.paper ? S.paper : S.doc;
    s.push('<g transform="rotate(' + sh.a + ' ' + f1(cx) + ' ' + f1(cy) + ')"' + (o.opacity != null ? ' opacity="' + o.opacity + '"' : "") + '>');
    s.push('<rect x="' + f1(sh.x) + '" y="' + f1(sh.y) + '" width="' + f1(SW) + '" height="' + f1(SH) +
           '" fill="' + fill + '" filter="url(#' + p + 'grain)"/>');
    s.push('<rect x="' + f1(sh.x) + '" y="' + f1(sh.y) + '" width="' + f1(SW) + '" height="' + f1(SH) +
           '" fill="none" stroke="' + (o.paper ? S.aihi : S.ground) + '" stroke-width="' + (o.paper ? 3 : 1) +
           '" opacity="' + (o.paper ? 1 : 0.5) + '"/>');
    /* title on the exposed right strip, so the sheet in front never clips it */
    if (o.title) {
      s.push('<text x="' + f1(sh.x + SW - 12) + '" y="' + f1(sh.y + 25) + '" text-anchor="end" font-size="16" ' +
             'font-weight="700" fill="' + S.ink + '">Quote ' + q.k + '</text>');
    }
    var top = sh.y + 40, rowH = (SH - 56) / 10, i;
    for (i = 0; i < 10; i++) {
      var ly = top + i * rowH, len = SW - 32 - ((i * 37) % 23) * (SW / 100);
      s.push('<line x1="' + f1(sh.x + 16) + '" y1="' + f1(ly) + '" x2="' + f1(sh.x + 16 + len) + '" y2="' + f1(ly) +
             '" stroke="' + S.rule + '" stroke-width="2" opacity=".5"/>');
    }
    /* garage exclusion: hatched on the two that carry it */
    if (o.garage && q.garage) {
      var gy = top + 3 * rowH;
      s.push('<rect x="' + f1(sh.x + 10) + '" y="' + f1(gy - 7) + '" width="' + f1(SW - 20) + '" height="14" fill="url(#' + p + 'hatch)"/>');
      s.push('<rect x="' + f1(sh.x + 10) + '" y="' + f1(gy - 7) + '" width="' + f1(SW - 20) + '" height="14" fill="none" stroke="' +
             S.warm + '" stroke-width="1.5"/>');
    }
    /* prior claim: lit on every quote, the rating mark somewhere different on each */
    if (o.claim) {
      var py = top + 7 * rowH;
      s.push('<rect x="' + f1(sh.x + 10) + '" y="' + f1(py - 7) + '" width="' + f1(SW - 20) + '" height="14" fill="' + S.ai + '"/>');
      var mx = sh.x + 16 + (SW - 32) * q.claimAt;
      s.push('<line x1="' + f1(mx) + '" y1="' + f1(py - 5) + '" x2="' + f1(mx) + '" y2="' + f1(py + 5) +
             '" stroke="' + S.paper + '" stroke-width="2.5"/>');
    }
    s.push('</g>');
    return s.join("");
  }

  /* the slot a quote has left: a flat shade, no outline, no label */
  function vacatedSlot(SW, SH, sh) {
    var cx = sh.x + SW / 2, cy = sh.y + SH / 2;
    return '<rect x="' + f1(sh.x) + '" y="' + f1(sh.y) + '" width="' + f1(SW) + '" height="' + f1(SH) +
           '" fill="' + S.doc + '" opacity=".14" transform="rotate(' + sh.a + ' ' + f1(cx) + ' ' + f1(cy) + ')"/>';
  }

  /* the clause mark, excerpted onto the path beside its label */
  function clauseChip(p, x, y, kind) {
    var w = 34, h = 14, s = [];
    if (kind === "garage") {
      s.push('<rect x="' + f1(x) + '" y="' + f1(y - h / 2) + '" width="' + w + '" height="' + h + '" fill="' + S.doc + '"/>');
      s.push('<rect x="' + f1(x) + '" y="' + f1(y - h / 2) + '" width="' + w + '" height="' + h + '" fill="url(#' + p + 'hatch)" stroke="' + S.warm + '" stroke-width="1.5"/>');
    } else {
      s.push('<rect x="' + f1(x) + '" y="' + f1(y - h / 2) + '" width="' + w + '" height="' + h + '" fill="' + S.ai + '"/>');
      s.push('<line x1="' + f1(x + 14) + '" y1="' + f1(y - 5) + '" x2="' + f1(x + 14) + '" y2="' + f1(y + 5) + '" stroke="' + S.paper + '" stroke-width="2.5"/>');
    }
    return s.join("");
  }

  /* a two-part label: bold lead, muted tail. Used for every artwork label
     so the type is one voice across both screens. */
  function label(x, y, lead, tail, anchor) {
    return '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="16"' + (anchor ? ' text-anchor="' + anchor + '"' : "") +
           ' fill="' + S.cream + '"><tspan font-weight="700">' + esc(lead) + '</tspan>' +
           (tail ? '<tspan fill="' + S.muted + '"> · ' + esc(tail) + '</tspan>' : "") + '</text>';
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 — four quotes, the comparison that matters, one recommendation
     ══════════════════════════════════════════════════════════════════════
     step 0..5 — 0 unread · 1 read · 2 garage exclusion · 3 prior claim ·
                 4 ranked (cheapest third) · 5 recommended */
  var scene1El = document.getElementById("scene1");
  var head1El = document.getElementById("s1-head");
  var foot1El = document.getElementById("s1-foot");

  /* Landscape: fan bottom-left under the headline, the two clauses on the
     path mid-right, recommendation top-right, foot bottom-right.
     Portrait: the same three beats as bands, top to bottom. CSS px. */
  function geom1(W, H, portrait) {
    var g = { W: W, H: H, portrait: portrait };
    var s, SW, SH, k, left;
    if (!portrait) {
      var headB = head1El ? head1El.getBoundingClientRect().bottom : H * 0.36;
      var footT = foot1El ? foot1El.getBoundingClientRect().top : H - 200;
      s = clamp(Math.min(W / 1180, H / 820), 0.6, 1.15);
      var fanTop = Math.max(headB + 44, H * 0.30), fanBottom = H - 48;
      SH = Math.min(262 * s, fanBottom - fanTop - 24 * s);
      SW = SH * 0.76;
      g.SW = SW; g.SH = SH;
      g.fan = [];
      left = 56 + 12 * s;
      /* the exposed strip of each sheet holds "Quote X" at 16px: never narrower than 84px */
      var step = Math.max(0.5 * SW, 84);
      for (k = 0; k < 4; k++) { g.fan.push({ x: left + k * step, y: fanTop + 8, a: -7.5 + k * 5 }); }
      g.fanExit = { x: left + 3 * step + SW + 4, y: fanTop + 8 + SH * 0.5 };
      g.fanMid = fanTop + 8 + SH * 0.5;
      /* recommendation, top right, with room to its right for the path to run on */
      g.rec = { x: W - 56 - 64 * s - SW, y: 60 + 36, w: SW, h: SH };
      /* the two clauses, on the path, in the band between the recommendation and the foot */
      var bandT = g.rec.y + g.rec.h + 36, bandB = footT - 24;
      var gap = clamp((bandB - bandT) / 2, 56, 84);
      var mid = (bandT + bandB) / 2;
      g.cmp = { x: g.fanExit.x + 56 * s, y1: mid - gap / 2, y2: mid + gap / 2 };
      g.edge = { y: g.rec.y + g.rec.h * 0.5 };
      return g;
    }
    /* portrait: bands. On a tablet the recommendation sits beside the two
       clauses so the whole composition fits one screen; on a phone it
       drops below them and the screen scrolls. */
    s = clamp(W / 720, 0.5, 1.0);
    SW = 200 * s; SH = 262 * s;
    g.SW = SW; g.SH = SH;
    var side = W >= 600;
    var ft = 48;   /* room above the fan for the cheapest label */
    var pstep = Math.max(0.5 * SW, 84);
    var fanW = 3 * pstep + SW;
    var fl = Math.max(12, (W - fanW) / 2);
    g.fan = [];
    for (k = 0; k < 4; k++) { g.fan.push({ x: fl + k * pstep, y: ft, a: -7.5 + k * 5 }); }
    /* the path leaves through the bottom edge of the fan, not its side */
    g.fanExit = { x: fl + 0.9 * SW, y: ft + SH * 0.5 };
    g.fanMid = ft + SH * 0.5;
    var fanB = ft + SH + 14 * s;
    var recT;
    g.side = side;
    if (side) {
      recT = fanB + 44;
      g.cmp = { x: 24, y1: recT + SH * 0.5 - 24, y2: recT + SH * 0.5 + 24 };
    } else {
      g.cmp = { x: 24, y1: fanB + 40, y2: fanB + 40 + 44 };
      recT = g.cmp.y2 + 26 + 44;
    }
    g.rec = { x: W - SW - 56, y: recT, w: SW, h: SH };
    g.edge = { y: recT + SH * 0.5 };
    g.H = recT + SH + 10;
    return g;
  }

  function scene1(step, g) {
    var s = [], i, SW = g.SW, SH = g.SH, p = "s1";
    s.push(defs(p));

    /* ── the one path: in from the left, through the four, out to the two
       clauses, up to the recommendation, on toward the edge ─────────── */
    var P = [];
    var ex = g.fanExit, c1 = { x: g.cmp.x, y: g.cmp.y1 }, c2 = { x: g.cmp.x, y: g.cmp.y2 };
    var rIn = { x: g.rec.x, y: g.edge.y }, rOut = { x: g.rec.x + g.rec.w, y: g.edge.y };
    if (step >= 1) {
      P.push("M-10 " + f1(g.fanMid) + " L" + f1(ex.x) + " " + f1(ex.y));
    }
    if (step >= 2) {
      if (!g.portrait) {
        P.push(" C" + f1(ex.x + 40) + " " + f1(ex.y) + " " + f1(c2.x) + " " + f1(c2.y + 30) + " " + f1(c2.x) + " " + f1(c2.y));
        P.push(" L" + f1(c1.x) + " " + f1(c1.y));
      } else {
        P.push(" C" + f1(ex.x - 10) + " " + f1(ex.y + 120) + " " + f1(c1.x) + " " + f1(c1.y - 70) + " " + f1(c1.x) + " " + f1(c1.y));
        P.push(" L" + f1(c2.x) + " " + f1(c2.y));
      }
    }
    if (step >= 5) {
      var from = g.portrait ? c2 : c1;
      if (!g.portrait) {
        P.push(" C" + f1(from.x) + " " + f1(from.y - 90) + " " + f1(rIn.x - 70) + " " + f1(rIn.y) + " " + f1(rIn.x) + " " + f1(rIn.y));
      } else if (g.side) {
        /* tablet: the recommendation is beside the clauses, so the path
           dips under the second label and runs across to it */
        P.push(" L" + f1(from.x) + " " + f1(from.y + 36));
        P.push(" C" + f1(from.x) + " " + f1(from.y + 70) + " " + f1(rIn.x - 70) + " " + f1(rIn.y + 50) + " " + f1(rIn.x) + " " + f1(rIn.y));
      } else {
        P.push(" L" + f1(from.x) + " " + f1(from.y + 30));
        P.push(" C" + f1(from.x) + " " + f1(from.y + 120) + " " + f1(rIn.x - 60) + " " + f1(rIn.y) + " " + f1(rIn.x) + " " + f1(rIn.y));
      }
      P.push(" L" + f1(rOut.x) + " " + f1(rOut.y));
    }
    if (P.length) {
      s.push('<path d="' + P.join("") + '" fill="none" stroke="' + S.aihi + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>');
    }
    /* the quiet callback: the path keeps going, and fades before the edge */
    if (step >= 5) {
      s.push('<linearGradient id="s1fade" gradientUnits="userSpaceOnUse" x1="' + f1(rOut.x) + '" y1="0" x2="' + f1(g.W) + '" y2="0">' +
             '<stop offset="0" stop-color="' + S.aihi + '" stop-opacity="1"/><stop offset="1" stop-color="' + S.aihi + '" stop-opacity="0"/></linearGradient>');
      s.push('<line x1="' + f1(rOut.x) + '" y1="' + f1(rOut.y) + '" x2="' + f1(g.W + 2) + '" y2="' + f1(rOut.y) +
             '" stroke="url(#s1fade)" stroke-width="3.5"/>');
    }

    /* ── the fan, back to front. Quote D stays in its slot until it is
       recommended; then the slot is left as a flat shade. ────────────── */
    var o = { garage: step >= 2, claim: step >= 3, title: true };
    for (i = 3; i >= 0; i--) {
      if (i === 3 && step >= 5) { s.push(vacatedSlot(SW, SH, g.fan[3])); continue; }
      s.push(quoteSheet(p, SW, SH, g.fan[i], QUOTES[i], o));
    }

    /* ── the two clauses that matter, excerpted onto the path. In landscape
       a hairline tethers each to the mark it was taken from on Quote C. ── */
    var rowH = (SH - 56) / 10;
    if (step >= 2) {
      s.push('<circle cx="' + f1(c1.x) + '" cy="' + f1(c1.y) + '" r="5" fill="' + S.aihi + '"/>');
      if (!g.portrait) {
        var m1 = sheetPt(g.fan[2], SW, SH, 0.95, (40 + 3 * rowH) / SH);
        s.push('<line x1="' + f1(m1.x) + '" y1="' + f1(m1.y) + '" x2="' + f1(c1.x) + '" y2="' + f1(c1.y) +
               '" stroke="' + S.muted + '" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>');
      }
      s.push(clauseChip(p, c1.x + 14, c1.y, "garage"));
      s.push(label(c1.x + 14 + 34 + 10, c1.y + 6, "Garage exclusion", null));
    }
    if (step >= 3) {
      s.push('<circle cx="' + f1(c2.x) + '" cy="' + f1(c2.y) + '" r="5" fill="' + S.aihi + '"/>');
      if (!g.portrait) {
        var m2 = sheetPt(g.fan[2], SW, SH, 0.95, (40 + 7 * rowH) / SH);
        s.push('<line x1="' + f1(m2.x) + '" y1="' + f1(m2.y) + '" x2="' + f1(c2.x) + '" y2="' + f1(c2.y) +
               '" stroke="' + S.muted + '" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>');
      }
      s.push(clauseChip(p, c2.x + 14, c2.y, "claim"));
      s.push(label(c2.x + 14 + 34 + 10, c2.y + 6, "Prior claim", null));
    }

    /* the cheapest quote, labelled on its own sheet's top edge */
    if (step >= 4) {
      var tp = sheetPt(g.fan[2], SW, SH, 0.5, 0);
      var lx0 = Math.min(tp.x - 4, g.W - 12 - 200);   /* never off the right edge */
      s.push('<line x1="' + f1(tp.x) + '" y1="' + f1(tp.y) + '" x2="' + f1(tp.x) + '" y2="' + f1(tp.y - 16) +
             '" stroke="' + S.cream + '" stroke-width="1.6" opacity=".8"/>');
      s.push(label(lx0, tp.y - 24, "Cheapest", "ranked third"));
    }

    /* ── the recommendation: Quote D, out of the fan, upright, on paper ── */
    if (step >= 5) {
      var r = g.rec;
      s.push(quoteSheet(p, SW, SH, { x: r.x, y: r.y, a: 0 }, QUOTES[3], { paper: true, garage: true, claim: true, title: true }));
      var rx = g.portrait ? Math.max(12, r.x + r.w - 250) : Math.min(r.x, g.W - 12 - 250);
      s.push(label(rx, r.y - 18, "Recommended", "not the cheapest"));
    }
    return s.join("");
  }

  function paintScene1(step) {
    if (!scene1El) { return; }
    var portrait = isPortrait();
    var box = scene1El.getBoundingClientRect();
    var W = Math.max(280, Math.round(portrait ? box.width : window.innerWidth));
    var H = Math.round(window.innerHeight);
    var g = geom1(W, H, portrait);
    if (portrait) { scene1El.style.height = Math.round(g.H) + "px"; H = g.H; }
    else { scene1El.style.height = ""; }
    scene1El.setAttribute("viewBox", "0 0 " + f1(W) + " " + f1(H));
    scene1El.setAttribute("preserveAspectRatio", portrait ? "xMinYMin meet" : "none");
    scene1El.innerHTML = scene1(step, g);
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — the same path, carried on, and stopped
     ══════════════════════════════════════════════════════════════════════
     Landscape: the recommendation left-middle (the other three faded behind
     it), the path runs right into a vertical wall that stands between the
     headline and the chrome, and the bound policy sits beyond it as an
     outline. Portrait: the same beats top to bottom, the wall horizontal. */
  var scene2El = document.getElementById("scene2");
  var head2El = document.getElementById("s2-head");
  var ask2El = document.getElementById("s2-ask");
  var WORDS = ["Buy", "Bind", "Sign", "Identity", "Payment"];

  function geom2(W, H, portrait) {
    var g = { W: W, H: H, portrait: portrait };
    var s, SW, SH;
    if (!portrait) {
      var headB = head2El ? head2El.getBoundingClientRect().bottom : H * 0.32;
      var askT = ask2El ? ask2El.getBoundingClientRect().top : H - 220;
      var chromeT = chromeEl ? chromeEl.getBoundingClientRect().top : H - 96;
      s = clamp(Math.min(W / 1180, H / 820), 0.6, 1.15);
      var bandT = headB + 20, bandB = askT - 20;
      SH = Math.min(262 * s, bandB - bandT); SW = SH * 0.76;
      g.SW = SW; g.SH = SH;
      g.mid = (bandT + bandB) / 2;
      /* the recommendation, with the other three receding behind it */
      g.sheet = { x: 56 + 14 * s + 3 * 18 * s, y: g.mid - SH / 2, a: 0 };
      g.behind = [];
      for (var k = 0; k < 3; k++) { g.behind.push({ x: g.sheet.x - (3 - k) * 18 * s, y: g.sheet.y + (3 - k) * 6 * s, a: -6 + k * 2 }); }
      /* the wall and what lies beyond it */
      g.policy = { w: 150 * s, h: 170 * s };
      var ww = clamp(112 * s, 104, 124);   /* "Identity" at 18px bold needs ~92px */
      g.wall = { x: W - 56 - (g.policy.w + 64 * s) - ww, w: ww, y: -20, h: chromeT - 12 + 20 };
      g.impact = { x: g.wall.x, y: g.mid };
      g.policy.x = g.wall.x + ww + 56 * s;
      g.policy.y = g.mid - g.policy.h / 2 - 12;
      /* five words, stacked about the path's height, kept inside the wall */
      var wallB = g.wall.y + g.wall.h;
      var sp = Math.min(104 * s, (g.mid - 44) / 2, (wallB - 36 - g.mid) / 2);
      g.words = [];
      for (k = 0; k < 5; k++) { g.words.push({ x: g.wall.x + ww / 2, y: g.mid + (k - 2) * sp + 6 }); }
      return g;
    }
    s = clamp(W / 720, 0.5, 1.0);
    SW = 200 * s; SH = 262 * s;
    g.SW = SW; g.SH = SH;
    g.sheet = { x: (W - SW) / 2 + 24 * s, y: 12 + 3 * 6 * s, a: 0 };
    g.behind = [];
    for (var j = 0; j < 3; j++) { g.behind.push({ x: g.sheet.x - (3 - j) * 16 * s, y: g.sheet.y - (3 - j) * 6 * s, a: -6 + j * 2 }); }
    var sheetB = g.sheet.y + SH;
    g.wall = { x: -20, w: W + 40, y: sheetB + 72, h: 124 };
    g.mid = g.sheet.x + SW / 2;
    g.impact = { x: g.mid, y: g.wall.y };
    var ROWS = [["Buy", "Bind", "Sign"], ["Identity", "Payment"]];
    g.words = [];
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < ROWS[r].length; c++) {
        g.words.push({ x: W / 2 + (c - (ROWS[r].length - 1) / 2) * 112, y: g.wall.y + 46 + r * 44, t: ROWS[r][c] });
      }
    }
    g.policy = { w: 150 * s, h: 170 * s };
    g.policy.x = W / 2 - g.policy.w / 2;
    g.policy.y = g.wall.y + g.wall.h + 36;
    g.H = g.policy.y + g.policy.h + 40;
    return g;
  }

  function scene2(hit, g) {
    var s = [], i, p = "s2", SW = g.SW, SH = g.SH, w = g.wall;
    s.push(defs(p));

    /* the three not chosen, behind and quiet; then the recommendation */
    for (i = 0; i < g.behind.length; i++) {
      s.push(quoteSheet(p, SW, SH, g.behind[i], QUOTES[i], { opacity: 0.22 + i * 0.06 }));
    }
    s.push(quoteSheet(p, SW, SH, g.sheet, QUOTES[3], { paper: true, garage: true, claim: true }));

    /* the path runs on, straight at the wall */
    var from = g.portrait ? { x: g.mid, y: g.sheet.y + SH } : { x: g.sheet.x + SW, y: g.mid };
    s.push('<line x1="' + f1(from.x) + '" y1="' + f1(from.y) + '" x2="' + f1(g.impact.x) + '" y2="' + f1(g.impact.y) +
           '" stroke="' + S.aihi + '" stroke-width="3.5" stroke-linecap="round"/>');

    /* THE WALL — solid, and the only warm object on this screen */
    s.push('<rect x="' + f1(w.x) + '" y="' + f1(w.y) + '" width="' + f1(w.w) + '" height="' + f1(w.h) + '" fill="' + S.warm + '"/>');
    /* a lit leading edge on the side the path arrives from */
    if (!g.portrait) {
      s.push('<rect x="' + f1(w.x - 2) + '" y="' + f1(w.y) + '" width="4" height="' + f1(w.h) + '" fill="' + S.warmhi + '"/>');
    } else {
      s.push('<rect x="' + f1(w.x) + '" y="' + f1(w.y - 2) + '" width="' + f1(w.w) + '" height="4" fill="' + S.warmhi + '"/>');
    }
    /* the five things written on the wall itself */
    for (i = 0; i < g.words.length; i++) {
      var wd = g.words[i], t = wd.t || WORDS[i];
      s.push('<text x="' + f1(wd.x) + '" y="' + f1(wd.y) + '" text-anchor="middle" font-size="18" font-weight="700" letter-spacing=".04em" fill="' +
             S.cream + '">' + t + '</text>');
    }

    /* the impact: the flow does not pass, it scatters back */
    if (hit) {
      var ix = g.impact.x, iy = g.impact.y;
      s.push('<circle cx="' + f1(ix) + '" cy="' + f1(iy) + '" r="16" fill="' + S.aihi + '" opacity=".35"/>');
      s.push('<circle cx="' + f1(ix) + '" cy="' + f1(iy) + '" r="6" fill="' + S.aihi + '"/>');
      seed = 19;
      for (i = 0; i < 16; i++) {
        var ang = (g.portrait ? 90 : 0) + (rnd() - 0.5) * 150;
        var rad = (ang + 180) * Math.PI / 180;
        var len = 24 + rnd() * 90;
        s.push('<line x1="' + f1(ix) + '" y1="' + f1(iy) + '" x2="' + f1(ix + Math.cos(rad) * len) +
               '" y2="' + f1(iy + Math.sin(rad) * len) + '" stroke="' + S.aihi +
               '" stroke-width="1.6" opacity="' + (0.25 + rnd() * 0.5).toFixed(2) + '" stroke-linecap="round"/>');
      }
    }

    /* beyond the wall: the bound policy, drawn but not reached */
    var b = g.policy;
    s.push('<rect x="' + f1(b.x) + '" y="' + f1(b.y) + '" width="' + f1(b.w) + '" height="' + f1(b.h) +
           '" fill="none" stroke="' + S.muted + '" stroke-width="2" stroke-dasharray="8 7" opacity=".8"/>');
    for (i = 0; i < 6; i++) {
      var ly = b.y + 26 + i * ((b.h - 40) / 6), len = b.w - 32 - ((i * 37) % 23) * (b.w / 100);
      s.push('<line x1="' + f1(b.x + 16) + '" y1="' + f1(ly) + '" x2="' + f1(b.x + 16 + len) + '" y2="' + f1(ly) +
             '" stroke="' + S.muted + '" stroke-width="2" opacity=".35"/>');
    }
    s.push(label(b.x + b.w / 2, b.y + b.h + 26, "Bound policy", null, "middle"));
    return s.join("");
  }

  var hitShown = false;
  function paintScene2() {
    if (!scene2El) { return; }
    var portrait = isPortrait();
    var box = scene2El.getBoundingClientRect();
    var W = Math.max(280, Math.round(portrait ? box.width : window.innerWidth));
    var H = Math.round(window.innerHeight);
    var g = geom2(W, H, portrait);
    if (portrait) { scene2El.style.height = Math.round(g.H) + "px"; H = g.H; }
    else { scene2El.style.height = ""; }
    scene2El.setAttribute("viewBox", "0 0 " + f1(W) + " " + f1(H));
    scene2El.setAttribute("preserveAspectRatio", portrait ? "xMinYMin meet" : "none");
    scene2El.innerHTML = scene2(hitShown, g);
  }

  function paintWorld() {
    paintGround();
    if (current === 1) { paintScene1(readStep); } else { paintScene2(); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE READ — screen 1's one interaction. The flow itself is the control.
     The state line is spoken to assistive tech only; on the glass, the
     drawing is the state.
     ══════════════════════════════════════════════════════════════════════ */

  var readStep = 5, readTimer = null;
  var statusEl = document.getElementById("state-status");
  function say(m) { if (statusEl) { statusEl.textContent = m; } }

  var STATE = [
    "Four renewal quotes, unread.",
    "Reading all four, every clause.",
    "Garage exclusion: found in two of the four, Quote B and Quote C.",
    "Prior claim: rated differently by each of the four.",
    "Ranked against her needs, not just the price. The cheapest, Quote C, came third.",
    "Recommended: Quote D, not the cheapest. Ranked against what her household needs, not just the price."
  ];

  function paintRead() {
    var b = document.getElementById("read-play");
    if (b) { b.textContent = readTimer ? "Pause" : readStep >= 5 ? "Run it again" : "Resume"; }
    paintWorld();
  }
  function readStop() { clearInterval(readTimer); readTimer = null; }
  function readRun() {
    if (readTimer) { readStop(); paintRead(); say("Paused. " + STATE[Math.min(readStep, 5)]); return; }
    if (readStep >= 5) { readStep = 0; }
    readTimer = setInterval(function () {
      readStep++;
      if (readStep >= 5) { readStep = 5; readStop(); }
      say(STATE[readStep]);
      paintRead();
    }, 820);
    readStep++; say(STATE[readStep]); paintRead();
  }
  var readBtn = document.getElementById("read-play");
  if (readBtn) { readBtn.addEventListener("click", readRun); }

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

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];
    if (n !== 1) { readStop(); }

    /* the wall lands a beat after the screen does, so the stop is an event */
    hitShown = false;
    paintWorld();
    if (n === 2 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(function () { if (current === 2) { hitShown = true; paintWorld(); } }, 480);
    } else if (n === 2) {
      hitShown = true; paintWorld();
    }

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
    var tag2 = (e.target.tagName || "").toLowerCase();
    if (tag2 === "select" || tag2 === "input" || tag2 === "button") { return; }
    if (e.key === "ArrowRight") { show(current + 1); }
    if (e.key === "ArrowLeft") { show(current - 1); }
  });

  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[current - 1];
      var h = sc && sc.querySelector(".display");
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
    relayout = setTimeout(paintWorld, 120);
  });

  /* the headline's box changes height once Bricolage arrives, and the
     drawing is laid out under it, so the drawing follows the font */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { paintWorld(); });
  }

  paintRead();
  show(fromHash() || 1, false);
})();
