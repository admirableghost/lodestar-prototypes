/* ══════════════════════════════════════════════════════════════════════════
   First Move · the opening bookend
   Four screens. No framework, no build step, no external request.

   THE ARGUMENT AS A PLACE
   A charcoal information field with one directional axis running through it.

       screen 1   her request, as the message she sent, beside four renewal
                  quotes fanned on the field. The path starts into the fan.
                  Nothing has come out yet.
       screen 2   the same fan, read: the two clauses that matter to this
                  household are lit across the four and pulled out onto the
                  path. No table, no score — the differences, named.
       screen 3   from the two clauses the path climbs to ONE quote, lifted
                  out of the fan as the recommendation — not the cheapest.
                  The path runs on, quietly, toward the edge. A replay
                  control runs the read again from the unread fan.
       screen 4   the same path, carried on from the recommendation, meets
                  a wall. The purchase beyond it is the customer's.

   Each screen is drawn into its own SVG in CSS PIXELS: the viewBox is the
   element's own box, so a 16px label here is 16px on the glass, on a phone as
   much as on a 1536 desktop. The world SVG behind them carries only the
   ground. All words on the glass are the ones in the copy contract
   (design-study/story-expansion/SCREEN-COPY.md · FIRST MOVE); everything else
   is geometry. Screen-reader text (aria-labels, the live region) stays
   detailed.

   WHAT THIS IS, AND IS NOT
   A RECONSTRUCTION of the kind of exchange a person can already have with
   a general assistant about insurance. It is not a recording and no real
   assistant, insurer, price or document is named. Provenance is kept in
   the facilitator notes, not written on the glass; the one place a real
   recording could appear is the hidden evidence slot on screen 1.

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
     cool traces, one warm family (the hatch on 2 and 3, the wall on 4). */
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
  function chromeTop(H) { return chromeEl ? chromeEl.getBoundingClientRect().top : H - 96; }

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
     scene because all four SVGs live in the same document. */
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

  /* the clause mark, excerpted onto the path */
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
     so the type is one voice across the four screens. `stack` drops the
     tail onto a second line, for a phone. */
  function label(x, y, lead, tail, o) {
    o = o || {};
    var size = o.size || 16;
    var t = '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + size + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") +
            ' fill="' + S.cream + '"><tspan font-weight="700">' + esc(lead) + '</tspan>';
    if (tail && o.stack) {
      t += '<tspan x="' + f1(x) + '" dy="1.3em" fill="' + S.muted + '">' + esc(tail) + '</tspan>';
    } else if (tail) {
      t += '<tspan fill="' + S.muted + '"> · ' + esc(tail) + '</tspan>';
    }
    return t + '</text>';
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE FAN — screens 1, 2 and 3 share one composition
     ══════════════════════════════════════════════════════════════════════
     mode 1   her message beside the fan; the path starts into it
     mode 2   the two clauses lit across the fan and named on the path
     mode 3   the recommendation lifted out; replayable, step 0..5 —
              0 unread · 1 read · 2 garage exclusion · 3 prior claim ·
              4 ranked (cheapest third) · 5 recommended

     Landscape: fan bottom-left under the headline, the two clauses on the
     path mid-right, recommendation top-right. The fan and the clause band
     sit in the SAME place on all three screens, so moving between them
     reads as the same sheets changing state, not as a new picture.
     Portrait: the same beats as bands, top to bottom. CSS px. */
  function geomFan(W, H, portrait, headEl, mode) {
    var g = { W: W, H: H, portrait: portrait, mode: mode };
    var s, SW, SH, k, left;
    if (!portrait) {
      var headB = headEl ? headEl.getBoundingClientRect().bottom : H * 0.36;
      var chromeT = chromeTop(H);
      s = clamp(Math.min(W / 1180, H / 820), 0.6, 1.15);
      var fanTop = Math.max(headB + 44, H * 0.30), fanBottom = H - 48;
      SH = Math.min(262 * s, fanBottom - fanTop - 24 * s);
      SW = SH * 0.76;
      g.SW = SW; g.SH = SH; g.s = s;
      g.fan = [];
      left = 56 + 12 * s;
      /* the exposed strip of each sheet holds "Quote X" at 16px: never narrower than 84px */
      var step = Math.max(0.5 * SW, 84);
      for (k = 0; k < 4; k++) { g.fan.push({ x: left + k * step, y: fanTop + 8, a: -7.5 + k * 5 }); }
      g.fanBox = { x: left, y: fanTop + 8, w: 3 * step + SW, h: SH };   /* the fan's footprint: the evidence slot on screen 1 */
      g.fanExit = { x: left + 3 * step + SW + 4, y: fanTop + 8 + SH * 0.5 };
      g.fanMid = fanTop + 8 + SH * 0.5;
      g.fanCentre = left + 1.5 * step + SW / 2;
      /* recommendation, top right, with room to its right for the path to run on */
      g.rec = { x: W - 56 - 64 * s - SW, y: 60 + 36, w: SW, h: SH };
      /* the two clauses, on the path, just below the fan's mid-height so
         they stay with the sheets they were taken from on any stage, kept
         clear of the recommendation above and the foot below. Computed on
         every mode so the band does not move between screens 2 and 3. */
      var bandT = g.rec.y + g.rec.h + 36, bandB = chromeT - 110;
      var y1 = Math.max(g.fanMid + 60, bandT);
      var gap = clamp(bandB - y1, 56, 84);
      g.cmp = { x: g.fanExit.x + 56 * s, y1: y1, y2: y1 + gap };
      g.edge = { y: g.rec.y + g.rec.h * 0.5 };
      /* screen 1: her message, beside the fan at its height */
      g.msg = { x: g.fanExit.x + 56 * s, cy: g.fanMid };
      /* screen 3: the reason, under the lifted sheet */
      g.reason = { x: g.rec.x, y: g.rec.y + g.rec.h + 18, w: Math.max(230, W - 56 - g.rec.x) };
      return g;
    }
    /* portrait: bands. On a tablet the recommendation sits beside the two
       clauses so the whole composition fits one screen; on a phone it
       drops below them and the screen scrolls. */
    /* a tablet held upright has the width for a larger fan than a phone */
    s = clamp(W / 720, 0.5, 1.2);
    SW = 200 * s; SH = 262 * s;
    g.SW = SW; g.SH = SH; g.s = s;
    var side = W >= 600;
    g.side = side;
    g.stack = W < 600;   /* a phone stacks the label tails */
    var ft = mode === 3 ? 48 : 16;   /* room above the fan for the cheapest label */
    var pstep = Math.max(0.5 * SW, 84);
    var fanW = 3 * pstep + SW;
    var fl = Math.max(12, (W - fanW) / 2);
    g.fan = [];
    for (k = 0; k < 4; k++) { g.fan.push({ x: fl + k * pstep, y: ft, a: -7.5 + k * 5 }); }
    /* the path leaves through the bottom edge of the fan, not its side */
    g.fanExit = { x: fl + 0.9 * SW, y: ft + SH * 0.5 };
    g.fanMid = ft + SH * 0.5;
    g.fanCentre = fl + 1.5 * pstep + SW / 2;
    var fanB = ft + SH + 14 * s;
    if (mode === 1) { g.H = fanB + 10; return g; }
    var recT;
    if (mode === 2) {
      /* the two named clauses, as a band under the fan */
      var rowGap = g.stack ? 64 : 48;
      g.cmp = { x: 24, y1: fanB + 44, y2: fanB + 44 + rowGap };
      g.H = g.cmp.y2 + (g.stack ? 48 : 36);
      return g;
    }
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

  function fanScene(step, g, p) {
    var s = [], i, SW = g.SW, SH = g.SH, mode = g.mode;
    s.push(defs(p));
    var o = { garage: step >= 2, claim: step >= 3, title: true };
    var rowH = (SH - 56) / 10;

    /* ── mode 1: the path starts into the fan and stops there ──────────── */
    if (mode === 1) {
      s.push('<path d="M-10 ' + f1(g.fanMid) + ' L' + f1(g.fanCentre) + ' ' + f1(g.fanMid) +
             '" fill="none" stroke="' + S.aihi + '" stroke-width="3.5" stroke-linecap="round"/>');
      for (i = 3; i >= 0; i--) { s.push(quoteSheet(p, SW, SH, g.fan[i], QUOTES[i], o)); }
      return s.join("");
    }

    /* ── the one path: in from the left, through the four, out to the two
       clauses, (mode 3) up to the recommendation, on toward the edge ─── */
    var P = [];
    var ex = g.fanExit, c1 = { x: g.cmp.x, y: g.cmp.y1 }, c2 = { x: g.cmp.x, y: g.cmp.y2 };
    var rIn = g.rec ? { x: g.rec.x, y: g.edge.y } : null, rOut = g.rec ? { x: g.rec.x + g.rec.w, y: g.edge.y } : null;
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
    if (mode === 3 && step >= 5) {
      var from = g.portrait ? c2 : c1;
      if (!g.portrait) {
        P.push(" C" + f1(from.x) + " " + f1(from.y - 90) + " " + f1(rIn.x - 70) + " " + f1(rIn.y) + " " + f1(rIn.x) + " " + f1(rIn.y));
      } else if (g.side) {
        /* tablet: the recommendation is beside the clauses, so the path
           dips under the second mark and runs across to it */
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
    if (mode === 3 && step >= 5) {
      s.push('<linearGradient id="' + p + 'fade" gradientUnits="userSpaceOnUse" x1="' + f1(rOut.x) + '" y1="0" x2="' + f1(g.W) + '" y2="0">' +
             '<stop offset="0" stop-color="' + S.aihi + '" stop-opacity="1"/><stop offset="1" stop-color="' + S.aihi + '" stop-opacity="0"/></linearGradient>');
      s.push('<line x1="' + f1(rOut.x) + '" y1="' + f1(rOut.y) + '" x2="' + f1(g.W + 2) + '" y2="' + f1(rOut.y) +
             '" stroke="url(#' + p + 'fade)" stroke-width="3.5"/>');
    }

    /* ── the fan, back to front. Quote D stays in its slot until it is
       recommended; then it is simply gone from the fan — no shade, no
       outline, nothing that could be read as a fifth sheet. ──────────── */
    for (i = 3; i >= 0; i--) {
      if (i === 3 && mode === 3 && step >= 5) { continue; }
      s.push(quoteSheet(p, SW, SH, g.fan[i], QUOTES[i], o));
    }

    /* ── the two clauses that matter, excerpted onto the path. In landscape
       a hairline tethers each to the mark it was taken from on Quote C.
       Screen 2 names them; screen 3 shows them as marks only. ─────────── */
    var lo = { size: 18, stack: g.stack };
    if (step >= 2) {
      s.push('<circle cx="' + f1(c1.x) + '" cy="' + f1(c1.y) + '" r="5" fill="' + S.aihi + '"/>');
      if (!g.portrait) {
        var m1 = sheetPt(g.fan[2], SW, SH, 0.95, (40 + 3 * rowH) / SH);
        s.push('<line x1="' + f1(m1.x) + '" y1="' + f1(m1.y) + '" x2="' + f1(c1.x) + '" y2="' + f1(c1.y) +
               '" stroke="' + S.muted + '" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>');
      }
      s.push(clauseChip(p, c1.x + 14, c1.y, "garage"));
      if (mode === 2) { s.push(label(c1.x + 14 + 34 + 12, c1.y + 6, "Garage exclusion", "in two of the four", lo)); }
    }
    if (step >= 3) {
      s.push('<circle cx="' + f1(c2.x) + '" cy="' + f1(c2.y) + '" r="5" fill="' + S.aihi + '"/>');
      if (!g.portrait) {
        var m2 = sheetPt(g.fan[2], SW, SH, 0.95, (40 + 7 * rowH) / SH);
        s.push('<line x1="' + f1(m2.x) + '" y1="' + f1(m2.y) + '" x2="' + f1(c2.x) + '" y2="' + f1(c2.y) +
               '" stroke="' + S.muted + '" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>');
      }
      s.push(clauseChip(p, c2.x + 14, c2.y, "claim"));
      if (mode === 2) { s.push(label(c2.x + 14 + 34 + 12, c2.y + 6, "Prior claim", "rated differently by each", lo)); }
    }
    if (mode !== 3) { return s.join(""); }

    /* the cheapest quote, labelled on its own sheet's top edge */
    if (step >= 4) {
      var tp = sheetPt(g.fan[2], SW, SH, 0.5, 0);
      var lx0 = Math.min(tp.x - 4, g.W - 12 - 230);   /* never off the right edge */
      s.push('<line x1="' + f1(tp.x) + '" y1="' + f1(tp.y) + '" x2="' + f1(tp.x) + '" y2="' + f1(tp.y - 16) +
             '" stroke="' + S.cream + '" stroke-width="1.6" opacity=".8"/>');
      s.push(label(lx0, tp.y - 24, "Cheapest", "ranked third", { size: 18 }));
    }

    /* ── the recommendation: Quote D, out of the fan, upright, on paper ── */
    if (step >= 5) {
      var r = g.rec;
      s.push(quoteSheet(p, SW, SH, { x: r.x, y: r.y, a: 0 }, QUOTES[3], { paper: true, garage: true, claim: true, title: true }));
      var rx = g.portrait ? Math.max(12, r.x + r.w - 290) : Math.min(r.x, g.W - 12 - 290);
      s.push(label(rx, r.y - 18, "Recommended", "not the cheapest", { size: 18 }));
    }
    return s.join("");
  }

  /* lay one fan screen out: size its SVG, draw it, and place the HTML
     objects that belong to the drawing (her message, the reason) */
  function paintFan(el, headEl, mode, step) {
    if (!el) { return; }
    var portrait = isPortrait();
    var box = el.getBoundingClientRect();
    var W = Math.max(280, Math.round(portrait ? box.width : window.innerWidth));
    var H = Math.round(window.innerHeight);
    var g = geomFan(W, H, portrait, headEl, mode);
    if (portrait) { el.style.height = Math.round(g.H) + "px"; H = g.H; }
    else { el.style.height = ""; }
    el.setAttribute("viewBox", "0 0 " + f1(W) + " " + f1(H));
    el.setAttribute("preserveAspectRatio", portrait ? "xMinYMin meet" : "none");
    el.innerHTML = fanScene(step, g, "s" + mode);

    if (mode === 1 && msgEl) {
      if (portrait) { msgEl.style.left = msgEl.style.top = ""; }
      else {
        msgEl.style.left = f1(g.msg.x) + "px";
        msgEl.style.top = f1(Math.max(g.msg.cy - msgEl.offsetHeight / 2, 24)) + "px";
      }
    }
    /* the recording, if one has loaded, takes the fan's footprint; her
       message is already placed beside that footprint (g.msg) */
    if (mode === 1 && evidenceEl && !evidenceEl.hidden) {
      if (portrait) { evidenceEl.style.left = evidenceEl.style.top = evidenceEl.style.width = ""; }
      else {
        evidenceEl.style.left = f1(g.fanBox.x) + "px";
        evidenceEl.style.top = f1(g.fanBox.y) + "px";
        evidenceEl.style.width = f1(g.fanBox.w) + "px";
      }
    }
    if (mode === 3 && reasonEl) {
      reasonEl.classList.toggle("is-off", step < 5);
      if (portrait) { reasonEl.style.left = reasonEl.style.top = reasonEl.style.width = ""; }
      else {
        reasonEl.style.left = f1(g.reason.x) + "px";
        reasonEl.style.top = f1(g.reason.y) + "px";
        reasonEl.style.width = f1(g.reason.w) + "px";
      }
    }
  }

  var scene1El = document.getElementById("scene1"), head1El = document.getElementById("s1-head");
  var scene2El = document.getElementById("scene2"), head2El = document.getElementById("s2-head");
  var scene3El = document.getElementById("scene3"), head3El = document.getElementById("s3-head");
  var msgEl = document.getElementById("s1-msg");
  var reasonEl = document.getElementById("s3-reason");

  /* ── EVIDENCE INTEGRATION POINT (see the comment on #fm-evidence in
     index.html). The figure is born hidden and stays hidden unless the
     browser can actually read recording/first-move.webm: only the video's
     own `loadedmetadata` unhides it. A missing file never throws here —
     the browser reports the 404 on the <source> and fires `error` on it,
     which is left alone. When it does load, the drawn fan gives way
     (CSS: .fm-s1.has-evidence .fm-scene) and paintFan lays the figure out
     in the fan's footprint with her message beside it. ─────────────── */
  var evidenceEl = document.getElementById("fm-evidence");
  var evidenceVideo = document.getElementById("fm-evidence-video");
  var screen1El = document.querySelector(".fm-s1");
  function showEvidence() {
    if (!evidenceEl || !evidenceEl.hidden) { return; }
    evidenceEl.hidden = false;
    if (screen1El) { screen1El.classList.add("has-evidence"); }
    paintWorld();
  }
  if (evidenceEl && evidenceVideo && window.fetch) {
    evidenceVideo.addEventListener("loadedmetadata", showEvidence);
    /* recording/manifest.json ships with the page and names the reviewed
       file when one exists ({"file": "first-move.webm"}); while it is empty
       nothing is requested, so an absent recording logs no 404. */
    fetch("recording/manifest.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (m) {
        if (!m || typeof m.file !== "string" || !/^[\w.-]+\.(webm|mp4)$/.test(m.file)) { return; }
        evidenceVideo.src = "recording/" + m.file;
        if (evidenceVideo.readyState >= 1) { showEvidence(); }
      })
      .catch(function () { /* no manifest, no recording */ });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 4 — the same path, carried on, and handed over
     ══════════════════════════════════════════════════════════════════════
     Landscape: the recommendation left-middle (the other three faded behind
     it), the path runs right to a compact paper slip — "Handoff to you",
     carrying the five transaction words in two rows — and the bound policy
     sits beyond it as a dashed outline, not reached. Portrait: the same
     beats top to bottom. The slip is artwork, not a control. */
  var scene4El = document.getElementById("scene4");
  var head4El = document.getElementById("s4-head");
  var ask4El = document.getElementById("s4-ask");
  var ROWS4 = [["Buy", "Bind", "Sign"], ["Identity", "Payment"]];

  function geomWall(W, H, portrait) {
    var g = { W: W, H: H, portrait: portrait };
    var s, SW, SH;
    if (!portrait) {
      var headB = head4El ? head4El.getBoundingClientRect().bottom : H * 0.32;
      var askT = ask4El ? ask4El.getBoundingClientRect().top : H - 220;
      s = clamp(Math.min(W / 1180, H / 820), 0.6, 1.15);
      var bandT = headB + 20, bandB = askT - 20;
      SH = Math.min(262 * s, bandB - bandT); SW = SH * 0.76;
      g.SW = SW; g.SH = SH;
      g.mid = (bandT + bandB) / 2;
      g.sheet = { x: 56 + 14 * s + 3 * 18 * s, y: g.mid - SH / 2, a: 0 };
      g.behind = [];
      for (var k = 0; k < 3; k++) { g.behind.push({ x: g.sheet.x - (3 - k) * 18 * s, y: g.sheet.y + (3 - k) * 6 * s, a: -6 + k * 2 }); }
      /* the slip and the policy form one horizontal group on the right */
      g.policy = { w: 150 * s, h: 170 * s };
      g.slip = { w: clamp(232 * s, 212, 252), h: clamp(150 * s, 138, 164) };
      var gap = 48 * s;
      var groupW = g.slip.w + gap + g.policy.w;
      var right = W - 56 - 16 * s;
      g.slip.x = right - groupW; g.slip.y = g.mid - g.slip.h / 2;
      g.policy.x = g.slip.x + g.slip.w + gap; g.policy.y = g.mid - g.policy.h / 2 - 12;
      g.end = { x: g.slip.x, y: g.mid };
      return g;
    }
    s = clamp(W / 720, 0.5, 1.0);
    SW = 200 * s; SH = 262 * s;
    g.SW = SW; g.SH = SH;
    g.sheet = { x: (W - SW) / 2 + 24 * s, y: 12 + 3 * 6 * s, a: 0 };
    g.behind = [];
    for (var j = 0; j < 3; j++) { g.behind.push({ x: g.sheet.x - (3 - j) * 16 * s, y: g.sheet.y - (3 - j) * 6 * s, a: -6 + j * 2 }); }
    var sheetB = g.sheet.y + SH;
    g.mid = g.sheet.x + SW / 2;
    g.slip = { w: Math.min(252, W - 48), h: 150 };
    g.slip.x = W / 2 - g.slip.w / 2; g.slip.y = sheetB + 64;
    g.end = { x: g.mid, y: g.slip.y };
    g.policy = { w: 150 * s, h: 170 * s };
    g.policy.x = W / 2 - g.policy.w / 2;
    g.policy.y = g.slip.y + g.slip.h + 44;
    g.H = g.policy.y + g.policy.h + 40;
    return g;
  }

  /* the handoff slip: warm paper, dark ink, one fine rule, a soft shadow */
  function handoffSlip(p, sl) {
    var s = [], x = sl.x, y = sl.y, w = sl.w, h = sl.h;
    s.push('<rect x="' + f1(x + 6) + '" y="' + f1(y + 8) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="#000" opacity=".28"/>');
    s.push('<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + S.paper + '" filter="url(#' + p + 'grain)"/>');
    s.push('<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="none" stroke="' + S.ink + '" stroke-width="1.5" opacity=".55"/>');
    s.push('<text x="' + f1(x + 18) + '" y="' + f1(y + 34) + '" font-size="18" font-weight="700" fill="' + S.ink + '">Handoff to you</text>');
    s.push('<line x1="' + f1(x + 18) + '" y1="' + f1(y + 48) + '" x2="' + f1(x + w - 18) + '" y2="' + f1(y + 48) + '" stroke="' + S.ink + '" stroke-width="1" opacity=".45"/>');
    var rowY = [y + 84, y + 122];
    for (var r = 0; r < 2; r++) {
      var t = ROWS4[r].join('<tspan fill="' + S.ink + '" opacity=".4"> · </tspan>');
      s.push('<text x="' + f1(x + 18) + '" y="' + f1(rowY[r]) + '" font-size="17" font-weight="700" letter-spacing=".02em" fill="' + S.ink + '">' + t + '</text>');
    }
    return s.join("");
  }

  function wallScene(hit, g) {
    var s = [], i, p = "s4", SW = g.SW, SH = g.SH;
    s.push(defs(p));

    /* the three not chosen, behind and quiet; then the recommendation */
    for (i = 0; i < g.behind.length; i++) {
      s.push(quoteSheet(p, SW, SH, g.behind[i], QUOTES[i], { opacity: 0.22 + i * 0.06 }));
    }
    s.push(quoteSheet(p, SW, SH, g.sheet, QUOTES[3], { paper: true, garage: true, claim: true }));

    /* one clean path from the recommendation to the slip's leading edge */
    var from = g.portrait ? { x: g.mid, y: g.sheet.y + SH } : { x: g.sheet.x + SW, y: g.mid };
    s.push('<line x1="' + f1(from.x) + '" y1="' + f1(from.y) + '" x2="' + f1(g.end.x) + '" y2="' + f1(g.end.y) +
           '" stroke="' + S.aihi + '" stroke-width="3.5" stroke-linecap="round"/>');

    /* the handoff, with the path's endpoint on its edge */
    s.push(handoffSlip(p, g.slip));
    if (hit) {
      s.push('<circle cx="' + f1(g.end.x) + '" cy="' + f1(g.end.y) + '" r="9" fill="' + S.aihi + '" opacity=".3"/>');
    }
    s.push('<circle cx="' + f1(g.end.x) + '" cy="' + f1(g.end.y) + '" r="5" fill="' + S.aihi + '"/>');

    /* beyond the handoff: the bound policy, drawn but not reached */
    var b = g.policy;
    s.push('<rect x="' + f1(b.x) + '" y="' + f1(b.y) + '" width="' + f1(b.w) + '" height="' + f1(b.h) +
           '" fill="none" stroke="' + S.muted + '" stroke-width="2" stroke-dasharray="8 7" opacity=".8"/>');
    for (i = 0; i < 6; i++) {
      var ly = b.y + 26 + i * ((b.h - 40) / 6), len = b.w - 32 - ((i * 37) % 23) * (b.w / 100);
      s.push('<line x1="' + f1(b.x + 16) + '" y1="' + f1(ly) + '" x2="' + f1(b.x + 16 + len) + '" y2="' + f1(ly) +
             '" stroke="' + S.muted + '" stroke-width="2" opacity=".35"/>');
    }
    s.push(label(b.x + b.w / 2, b.y + b.h + 26, "Bound policy", null, { anchor: "middle" }));
    return s.join("");
  }

  var hitShown = false;
  function paintWall() {
    if (!scene4El) { return; }
    var portrait = isPortrait();
    var box = scene4El.getBoundingClientRect();
    var W = Math.max(280, Math.round(portrait ? box.width : window.innerWidth));
    var H = Math.round(window.innerHeight);
    var g = geomWall(W, H, portrait);
    if (portrait) { scene4El.style.height = Math.round(g.H) + "px"; H = g.H; }
    else { scene4El.style.height = ""; }
    scene4El.setAttribute("viewBox", "0 0 " + f1(W) + " " + f1(H));
    scene4El.setAttribute("preserveAspectRatio", portrait ? "xMinYMin meet" : "none");
    scene4El.innerHTML = wallScene(hitShown, g);
  }

  function paintWorld() {
    paintGround();
    if (current === 1) { paintFan(scene1El, head1El, 1, 1); }
    else if (current === 2) { paintFan(scene2El, head2El, 2, 3); }
    else if (current === 3) { paintFan(scene3El, head3El, 3, readStep); }
    else { paintWall(); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE READ — screen 3's one interaction. The flow itself is the control.
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
    "Recommended: Quote D, not the cheapest. Covers the garage. Prior claim rated."
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
     ══════════════════════════════════════════════════════════════════════
     Hashes are #s/1..#s/4. The two-screen build's #s/1 is still screen 1;
     its #s/2 (the handoff) is now #s/4 — #s/2 is a real screen here, so
     the old address cannot be redirected and is documented instead. */

  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;

  var CTA = ["See the differences", "See the recommendation", "The handoff", "Back to the start"];

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
    /* leaving the recommendation mid-replay: it is complete when you return */
    if (n !== 3) { readStop(); readStep = 5; }

    /* the wall lands a beat after the screen does, so the stop is an event */
    hitShown = false;
    paintRead();
    if (n === 4 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTimeout(function () { if (current === 4) { hitShown = true; paintWorld(); } }, 480);
    } else if (n === 4) {
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

  show(fromHash() || 1, false);
})();
