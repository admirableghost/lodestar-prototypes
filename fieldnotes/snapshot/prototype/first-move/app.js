/* ══════════════════════════════════════════════════════════════════════════
   First Move · the opening bookend
   Two screens. No framework, no build step, no external request.

   WHAT CHANGED, AND WHY
   The previous version told this story with four boxes on a cream page. The
   boxes were the argument, which meant the argument had to be read. This
   version makes the argument a PLACE: a dark information field with one
   directional axis running through it.

       screen 1   four quotes are read, the two clauses that matter to this
                  household are pulled out and compared, and ONE quote is
                  lifted out of the fan as the recommendation — not the
                  cheapest. The path runs on, quietly, toward the edge.
       screen 2   the same axis continues, and runs into a transaction wall

   Screen 1 is drawn into its own SVG in CSS pixels (see SCREEN 1 below);
   screen 2 keeps the fitted-camera world it always had.

   The axis is the thing the set reuses. OpenCover, the closing bookend, is
   the same axis with the wall rebuilt so the path continues through it. That
   rhyme only works if the axis is drawn, not described — so everything here
   is geometry, and the words on the glass are a headline and five labels.

   WHAT THIS IS, AND IS NOT
   A clearly-labelled RECONSTRUCTION of the kind of exchange a person can
   already have with a general assistant about insurance. It is not a
   recording and no real assistant, insurer, price or document is named. The
   scenario facts are the ones this prototype has always carried: four
   renewal quotes, a garage exclusion, a prior claim, and a cheapest option
   that came third.

   ORIENTATION
   A horizontal axis cannot survive a 390x844 phone — it would leave the
   dead band the brief rejects. So the composition has two layouts, landscape
   and portrait, chosen from the world's aspect. Same beats, same geometry
   vocabulary, axis rotated.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var worldEl = document.getElementById("world");
  var svg = document.getElementById("field");

  /* ── palette ────────────────────────────────────────────────────────────
     Deep indigo ground; the reasoning path is cool, the documents are paper
     held in that light, and the wall is the only warm thing in the world.
     Nothing here is neon: every hue is desaturated toward the ground. */
  var BG0 = "#070B16", BG1 = "#0E1530", BG2 = "#19214A";
  var AI = "#5FD8E8", AI_HI = "#C2F6FB", AI_DIM = "#2A5E73";
  var DOC = "#E7E5F3", DOC_LINE = "#8F8CB8", DOC_EDGE = "#B9B6D8";
  var AMBER = "#F3A23F", AMBER_HI = "#FFCE86", WARM = "#D9561F";

  /* ══════════════════════════════════════════════════════════════════════
     LAYOUT — the same beats in two orientations.
     Every coordinate the drawing needs comes from here, so the two layouts
     cannot drift apart.
     ══════════════════════════════════════════════════════════════════════ */

  function layout(portrait) {
    var i, docs = [];
    if (!portrait) {
      /* Four documents fanned down-right. The fan starts below the headline
         band (rows 1–3 of the 8-row stage) so the hero objects and the type
         never occupy the same ground. */
      for (i = 0; i < 4; i++) {
        docs.push({ x: 110 + i * 94, y: 430 + i * 138, w: 250, h: 235, sk: 24 });
      }
      return {
        portrait: false,
        docs: docs,
        world: { w: 1600, h: 1120 },
        subject: { x: 40, y: 60, w: 1500, h: 1020 },
        entry: { x: -40, y: 1060 },
        node: { x: 980, y: 620 },
        rec: { x: 1090, y: 440, w: 300, h: 360, sk: 30 },
        wall: { x: 1090, y: -260, w: 162, h: 1640, vertical: true },
        impact: { x: 1090, y: 620 }
      };
    }
    /* portrait: the axis runs down the page instead of across it */
    for (i = 0; i < 4; i++) {
      docs.push({ x: 92 + i * 132, y: 150 + i * 96, w: 232, h: 250, sk: 22 });
    }
    return {
      portrait: true,
      docs: docs,
      world: { w: 1040, h: 1680 },
      subject: { x: 30, y: 60, w: 980, h: 1560 },
      entry: { x: 40, y: -40 },
      /* The wall sits high enough to leave the band beyond it visible: the
         unreachable bound policy has to fit between the wall and the foot of
         the subject, and at phone scale that band is only ~280 screen px. */
      node: { x: 520, y: 880 },
      rec: { x: 300, y: 1050, w: 300, h: 330, sk: 26 },
      wall: { x: -260, y: 1000, w: 1560, h: 260, vertical: false },
      impact: { x: 520, y: 1000 }
    };
  }

  /* docs are parallelograms: a sheet seen slightly from the side, so the
     fan reads as depth rather than as four rectangles in a row */
  function docPath(d) {
    return "M" + d.x + " " + d.y +
           " L" + (d.x + d.w) + " " + (d.y - d.sk) +
           " L" + (d.x + d.w) + " " + (d.y - d.sk + d.h) +
           " L" + d.x + " " + (d.y + d.h) + " Z";
  }
  /* a point inside a doc in its own (across, down) fractions */
  function docPt(d, u, v) {
    return { x: d.x + d.w * u, y: d.y - d.sk * u + d.h * v };
  }
  function docMidRight(d) { return docPt(d, 1, 0.5); }

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING
     ══════════════════════════════════════════════════════════════════════ */

  var L = layout(false), vb = null, scale = 1;

  /* type is sized in SCREEN px and converted, so a label is the same size to
     the eye on a phone and on a 1536 desktop */
  function px(n) { return n / scale; }

  function defs() {
    return '<defs>' +
      '<radialGradient id="sky" cx="34%" cy="38%" r="86%">' +
        '<stop offset="0%" stop-color="' + BG2 + '"/>' +
        '<stop offset="52%" stop-color="' + BG1 + '"/>' +
        '<stop offset="100%" stop-color="' + BG0 + '"/>' +
      '</radialGradient>' +
      '<linearGradient id="ailine" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0%" stop-color="' + AI_DIM + '" stop-opacity=".2"/>' +
        '<stop offset="55%" stop-color="' + AI + '"/>' +
        '<stop offset="100%" stop-color="' + AI_HI + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="wallg" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0%" stop-color="' + AMBER_HI + '"/>' +
        '<stop offset="45%" stop-color="' + AMBER + '"/>' +
        '<stop offset="100%" stop-color="' + WARM + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="wallgv" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + AMBER_HI + '"/>' +
        '<stop offset="45%" stop-color="' + AMBER + '"/>' +
        '<stop offset="100%" stop-color="' + WARM + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="docg" x1="0" y1="0" x2="0.6" y2="1">' +
        '<stop offset="0%" stop-color="#FFFFFF" stop-opacity=".93"/>' +
        '<stop offset="100%" stop-color="' + DOC + '" stop-opacity=".62"/>' +
      '</linearGradient>' +
      '<filter id="glow" x="-70%" y="-70%" width="240%" height="240%">' +
        '<feGaussianBlur stdDeviation="9" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
      '<filter id="soft" x="-60%" y="-60%" width="220%" height="220%">' +
        '<feGaussianBlur stdDeviation="26"/>' +
      '</filter>' +
      '</defs>';
  }

  /* ── background: an information landscape, not a texture ────────────────
     Hundreds of faint document silhouettes receding into the ground. It is
     the "enormous amount of complexity" the agent moves through, and it is
     why the four foreground documents read as a selection from something
     much larger. Deterministic, so the field never flickers between
     renders. */
  var seed = 7;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  function field(W, H) {
    var s = [], i, n = 150;
    seed = 7;
    s.push('<rect x="' + (-W) + '" y="' + (-H) + '" width="' + (W * 3) + '" height="' + (H * 3) + '" fill="url(#sky)"/>');
    /* two slow light sweeps give the ground depth without a visible gradient */
    s.push('<ellipse cx="' + (W * 0.3) + '" cy="' + (H * 0.3) + '" rx="' + (W * 0.42) +
           '" ry="' + (H * 0.38) + '" fill="' + BG2 + '" opacity=".55" filter="url(#soft)"/>');
    s.push('<g opacity=".5">');
    for (i = 0; i < n; i++) {
      var dw = 26 + rnd() * 92;
      var d = { x: rnd() * W * 1.24 - W * 0.12, y: rnd() * H * 1.24 - H * 0.12,
                w: dw, h: dw * (1.05 + rnd() * 0.5), sk: dw * 0.1 };
      var o = 0.03 + rnd() * 0.10;
      s.push('<path d="' + docPath(d) + '" fill="' + DOC + '" opacity="' + o.toFixed(3) + '"/>');
      /* a few of them carry ruled lines, so the field reads as DOCUMENTS */
      if (rnd() > 0.74) {
        for (var k = 1; k < 4; k++) {
          var a = docPt(d, 0.14, k * 0.22 + 0.12), b2 = docPt(d, 0.5 + rnd() * 0.34, k * 0.22 + 0.12);
          s.push('<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b2.x.toFixed(1) +
                 '" y2="' + b2.y.toFixed(1) + '" stroke="' + DOC_LINE + '" stroke-width="1.4" opacity="' +
                 (o * 2.1).toFixed(3) + '"/>');
        }
      }
    }
    s.push('</g>');
    return s.join("");
  }

  /* ── one policy document, at a given state ──────────────────────────────
     state: 0 waiting · 1 being read · 2 read */
  function sheet(d, state, label, labelColor, clauseV) {
    var s = [], i;
    var live = state === 1, done = state >= 1;
    var op = state === 0 ? 0.40 : 1;

    if (live) {
      s.push('<path d="' + docPath(d) + '" fill="' + AI + '" opacity=".22" filter="url(#glow)"/>');
    }
    s.push('<path d="' + docPath(d) + '" fill="url(#docg)" opacity="' + op +
           '" stroke="' + (live ? AI_HI : DOC_EDGE) + '" stroke-width="' + (live ? 3 : 1.6) +
           '" stroke-opacity="' + (live ? 1 : 0.55) + '"/>');

    /* the wording: ruled lines, denser than anyone would read */
    s.push('<g opacity="' + (op * 0.9) + '">');
    for (i = 0; i < 13; i++) {
      var v = 0.11 + i * 0.063;
      var a = docPt(d, 0.1, v);
      var b = docPt(d, 0.1 + 0.52 + ((i * 37) % 23) / 70, v);
      s.push('<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) +
             '" y2="' + b.y.toFixed(1) + '" stroke="' + DOC_LINE + '" stroke-width="2.4" opacity=".5"/>');
    }
    s.push('</g>');

    /* the clause this document turns on, lit where it actually sits */
    if (clauseV != null && done) {
      var c0 = docPt(d, 0.08, clauseV), c1 = docPt(d, 0.78, clauseV);
      s.push('<line x1="' + c0.x.toFixed(1) + '" y1="' + c0.y.toFixed(1) + '" x2="' + c1.x.toFixed(1) +
             '" y2="' + c1.y.toFixed(1) + '" stroke="' + labelColor + '" stroke-width="' +
             px(11).toFixed(1) + '" opacity=".30" stroke-linecap="round"/>');
      s.push('<line x1="' + c0.x.toFixed(1) + '" y1="' + c0.y.toFixed(1) + '" x2="' + c1.x.toFixed(1) +
             '" y2="' + c1.y.toFixed(1) + '" stroke="' + labelColor + '" stroke-width="2.6" opacity=".95"/>');
    }
    return s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 — four quotes, the comparison that matters, one recommendation
     ══════════════════════════════════════════════════════════════════════
     Drawn into its own SVG (#scene1) that sits in the screen's flow, laid
     out in CSS PIXELS: the viewBox is the element's own box, so a 16px label
     here is 16px on the glass, on a phone as much as on a 1536 desktop. The
     world SVG behind it carries only a faint ground for this screen.

     The palette is the design study's: charcoal ground, lavender cut-paper
     quotes, a paper recommendation, cool traces and one warm hatch.

     step 0..5 — 0 unread · 1 read · 2 garage exclusion · 3 prior claim ·
                 4 ranked (cheapest third) · 5 recommended */
  var S1 = {
    ground: "#1E242B", paper: "#F3EBD7", cream: "#F3EBD7", muted: "#B4AE9C",
    doc: "#8F8CB8", rule: "#4A4870", ink: "#16150F",
    ai: "#2E6E80", aihi: "#6FC3CF", warm: "#A8502A"
  };
  var QUOTES = [
    { k: "A", garage: false, claimAt: 0.28 },
    { k: "B", garage: true,  claimAt: 0.62 },
    { k: "C", garage: true,  claimAt: 0.44, cheapest: true },
    { k: "D", garage: false, claimAt: 0.80, recommended: true }
  ];
  var sceneEl = document.getElementById("scene1");
  var headEl = document.getElementById("s1-head");
  var footEl = document.getElementById("s1-foot");

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function f1(n) { return (+n).toFixed(1); }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function ground1(W, H) {
    var s = [], i;
    seed = 11;
    s.push('<rect x="0" y="0" width="' + f1(W) + '" height="' + f1(H) + '" fill="' + S1.ground + '"/>');
    /* the information field, as texture only: faint document silhouettes */
    s.push('<g opacity=".45">');
    for (i = 0; i < 110; i++) {
      var w = (24 + rnd() * 84), h = w * (1.1 + rnd() * 0.5);
      var x = rnd() * W * 1.1 - W * 0.05, y = rnd() * H * 1.1 - H * 0.05;
      s.push('<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) +
             '" fill="' + S1.doc + '" opacity="' + (0.03 + rnd() * 0.07).toFixed(3) + '"/>');
      if (rnd() > 0.74) {
        for (var k = 1; k < 4; k++) {
          var ly = y + h * (k * 0.22 + 0.1);
          s.push('<line x1="' + f1(x + w * 0.14) + '" y1="' + f1(ly) + '" x2="' + f1(x + w * (0.5 + rnd() * 0.3)) +
                 '" y2="' + f1(ly) + '" stroke="' + S1.doc + '" stroke-width="1.2" opacity=".16"/>');
        }
      }
    }
    s.push('</g>');
    return s.join("");
  }

  function defs1() {
    return '<defs>' +
      '<filter id="s1grain" x="-2%" y="-2%" width="104%" height="104%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" result="a"/>' +
        '<feComposite in="SourceGraphic" in2="a" operator="in" result="g"/>' +
        '<feBlend in="SourceGraphic" in2="g" mode="multiply"/>' +
      '</filter>' +
      '<pattern id="s1hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
        '<line x1="0" y1="0" x2="0" y2="7" stroke="' + S1.warm + '" stroke-width="2"/>' +
      '</pattern>' +
      '</defs>';
  }

  /* ── geometry ──────────────────────────────────────────────────────────
     Landscape: fan bottom-left under the headline, comparison mid-right,
     recommendation top-right, foot bottom-right. Portrait: the same three
     beats as bands, top to bottom. Everything in CSS px. */
  function geom1(W, H, portrait) {
    var g = { W: W, H: H, portrait: portrait, rows: {} };
    var s, SW, SH, k, i;
    if (!portrait) {
      var headB = headEl ? headEl.getBoundingClientRect().bottom : H * 0.36;
      var footT = footEl ? footEl.getBoundingClientRect().top : H - 260;
      s = clamp(Math.min(W / 1180, H / 820), 0.6, 1.15);
      var fanTop = Math.max(headB + 48, H * 0.30), fanBottom = H - 56;
      SH = Math.min(262 * s, fanBottom - fanTop - 24 * s);
      SW = SH * 0.76;
      g.s = SW / 200;
      g.SW = SW; g.SH = SH;
      g.fan = [];
      var left = 56 + 12 * g.s;
      for (k = 0; k < 4; k++) {
        g.fan.push({ x: left + k * 0.5 * SW, y: fanTop + 8, a: -7.5 + k * 5 });
      }
      g.fanExit = { x: left + 2 * SW + 8, y: fanTop + 8 + SH * 0.5 };
      g.fanMid = fanTop + 8 + SH * 0.5;
      /* recommendation, top right, with room to its right for the path to run on */
      g.rec = { x: W - 56 - 64 * g.s - SW, y: 60 + 36, w: SW, h: SH };
      /* comparison rows in the band between the recommendation and the foot */
      var bandT = g.rec.y + g.rec.h + 36, bandB = footT - 30;
      var gap = clamp((bandB - bandT) / 2, 58, 92);
      var mid = (bandT + bandB) / 2;
      g.cmp = { x: left + 2.5 * SW + 24 + 60 * g.s, y1: mid - gap / 2, y2: mid + gap / 2 };
      g.edge = { y: g.rec.y + g.rec.h * 0.5 };
      g.short = 0.5 * SW < 88;
      return g;
    }
    /* portrait: bands */
    s = clamp(W / 720, 0.5, 1.2);
    SW = 200 * s; SH = 262 * s;
    g.s = s; g.SW = SW; g.SH = SH;
    var labelRoom = 48;
    var ft = labelRoom + 8;
    var fl = Math.max(12, (W - (2.5 * SW + 24)) / 2);
    g.fan = [];
    for (k = 0; k < 4; k++) {
      g.fan.push({ x: fl + k * 0.5 * SW, y: ft, a: -7.5 + k * 5 });
    }
    /* the path leaves through the bottom edge of the fan, not its side */
    g.fanExit = { x: fl + 0.9 * SW, y: ft + SH * 0.5 };
    g.fanMid = ft + SH * 0.5;
    var fanB = ft + SH + 14 * s;
    /* on a phone the row label stacks under its tokens instead of beside them */
    var stack = W < 540;
    g.cmp = { x: 20, stack: stack, y1: fanB + 56, y2: fanB + 56 + (stack ? 106 : 76) };
    var recT = g.cmp.y2 + (stack ? 72 : 44) + 48;
    g.rec = { x: W - SW - 72, y: recT, w: SW, h: SH };
    g.edge = { y: recT + SH * 0.5 };
    g.short = 0.5 * SW < 88;
    g.H = recT + SH + 16;
    return g;
  }

  /* a point on a sheet after its rotation about its own centre */
  function sheetPt(sh, SW, SH, u, v) {
    var cx = sh.x + SW / 2, cy = sh.y + SH / 2, a = sh.a * Math.PI / 180;
    var dx = sh.x + SW * u - cx, dy = sh.y + SH * v - cy;
    return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
  }

  /* one quote. opts: paper (the recommendation), title, marks */
  function quoteSheet(g, sh, q, o) {
    var SW = g.SW, SH = g.SH, s = [];
    var cx = sh.x + SW / 2, cy = sh.y + SH / 2;
    var fill = o.paper ? S1.paper : S1.doc;
    s.push('<g transform="rotate(' + sh.a + ' ' + f1(cx) + ' ' + f1(cy) + ')">');
    s.push('<rect x="' + f1(sh.x) + '" y="' + f1(sh.y) + '" width="' + f1(SW) + '" height="' + f1(SH) +
           '" fill="' + fill + '" filter="url(#s1grain)"/>');
    s.push('<rect x="' + f1(sh.x) + '" y="' + f1(sh.y) + '" width="' + f1(SW) + '" height="' + f1(SH) +
           '" fill="none" stroke="' + (o.paper ? S1.aihi : S1.ground) + '" stroke-width="' + (o.paper ? 3 : 1) +
           '" opacity="' + (o.paper ? 1 : 0.5) + '"/>');
    /* title on the exposed right strip, so the sheet in front never clips it */
    var title = g.short ? q.k : "QUOTE " + q.k;
    s.push('<text x="' + f1(sh.x + SW - 12) + '" y="' + f1(sh.y + 24) + '" text-anchor="end" font-size="15" ' +
           'font-weight="700" letter-spacing=".06em" fill="' + S1.ink + '">' + title + '</text>');
    var top = sh.y + 40, rowH = (SH - 56) / 10, i;
    for (i = 0; i < 10; i++) {
      var ly = top + i * rowH, len = SW - 32 - ((i * 37) % 23) * (SW / 100);
      s.push('<line x1="' + f1(sh.x + 16) + '" y1="' + f1(ly) + '" x2="' + f1(sh.x + 16 + len) + '" y2="' + f1(ly) +
             '" stroke="' + S1.rule + '" stroke-width="2" opacity=".5"/>');
    }
    /* garage exclusion: hatched on the two that carry it */
    if (o.garage && q.garage) {
      var gy = top + 3 * rowH;
      s.push('<rect x="' + f1(sh.x + 10) + '" y="' + f1(gy - 7) + '" width="' + f1(SW - 20) + '" height="14" fill="url(#s1hatch)"/>');
      s.push('<rect x="' + f1(sh.x + 10) + '" y="' + f1(gy - 7) + '" width="' + f1(SW - 20) + '" height="14" fill="none" stroke="' +
             S1.warm + '" stroke-width="1.5"/>');
    }
    /* prior claim: lit on every quote, the rating mark somewhere different on each */
    if (o.claim) {
      var py = top + 7 * rowH;
      s.push('<rect x="' + f1(sh.x + 10) + '" y="' + f1(py - 7) + '" width="' + f1(SW - 20) + '" height="14" fill="' + S1.ai + '"/>');
      var mx = sh.x + 16 + (SW - 32) * q.claimAt;
      s.push('<line x1="' + f1(mx) + '" y1="' + f1(py - 5) + '" x2="' + f1(mx) + '" y2="' + f1(py + 5) +
             '" stroke="' + S1.paper + '" stroke-width="2.5"/>');
    }
    s.push('</g>');
    return s.join("");
  }

  /* the slot a quote has left: a flat shade, no outline, no label */
  function vacatedSlot(g, sh) {
    var cx = sh.x + g.SW / 2, cy = sh.y + g.SH / 2;
    return '<rect x="' + f1(sh.x) + '" y="' + f1(sh.y) + '" width="' + f1(g.SW) + '" height="' + f1(g.SH) +
           '" fill="' + S1.doc + '" opacity=".14" transform="rotate(' + sh.a + ' ' + f1(cx) + ' ' + f1(cy) + ')"/>';
  }

  /* a row of the comparison: four small tokens, one per quote, then the label */
  function cmpRow(g, y, kind, title, sub) {
    var s = [], i, T = 34, gap = 7, x0 = g.cmp.x;
    for (i = 0; i < 4; i++) {
      var q = QUOTES[i], x = x0 + i * (T + gap), ty = y - T / 2;
      var on = kind === "garage" ? q.garage : true;
      s.push('<rect x="' + f1(x) + '" y="' + f1(ty) + '" width="' + T + '" height="' + T + '" rx="2" fill="' + S1.doc +
             '" opacity="' + (on ? 1 : 0.38) + '"/>');
      if (kind === "garage" && on) {
        s.push('<rect x="' + f1(x + 3) + '" y="' + f1(ty + 18) + '" width="' + (T - 6) + '" height="11" fill="url(#s1hatch)" stroke="' +
               S1.warm + '" stroke-width="1.2"/>');
      }
      if (kind === "claim") {
        s.push('<rect x="' + f1(x + 3) + '" y="' + f1(ty + 18) + '" width="' + (T - 6) + '" height="11" fill="' + S1.ai + '"/>');
        var mx = x + 5 + (T - 10) * q.claimAt;
        s.push('<line x1="' + f1(mx) + '" y1="' + f1(ty + 19) + '" x2="' + f1(mx) + '" y2="' + f1(ty + 28) +
               '" stroke="' + S1.paper + '" stroke-width="2"/>');
      }
      s.push('<text x="' + f1(x + T / 2) + '" y="' + f1(ty + 14) + '" text-anchor="middle" font-size="13.5" font-weight="700" fill="' +
             S1.ink + '" opacity="' + (on ? 1 : 0.8) + '">' + q.k + '</text>');
    }
    var lx = g.cmp.stack ? x0 : x0 + 4 * (T + gap) + 10;
    var ly = g.cmp.stack ? y + T / 2 + 20 : y - 3;
    s.push('<text x="' + f1(lx) + '" y="' + f1(ly) + '" font-size="16" font-weight="700" fill="' + S1.cream + '">' + esc(title) + '</text>');
    s.push('<text x="' + f1(lx) + '" y="' + f1(ly + 19) + '" font-size="15" fill="' + S1.muted + '">' + esc(sub) + '</text>');
    return s.join("");
  }

  function scene1(step, g) {
    var s = [], i, SW = g.SW, SH = g.SH;
    s.push(defs1());

    /* ── the one path: in from the left, through the four, out to the
       comparison, up to the recommendation, on toward the edge ─────── */
    var P = [];
    var ex = g.fanExit, c1 = { x: g.cmp.x - 14, y: g.cmp.y1 }, c2 = { x: g.cmp.x - 14, y: g.cmp.y2 };
    var rIn = { x: g.rec.x, y: g.edge.y }, rOut = { x: g.rec.x + g.rec.w, y: g.edge.y };
    if (step >= 1) {
      P.push("M-10 " + f1(g.fanMid) + " L" + f1(ex.x) + " " + f1(ex.y));
    }
    if (step >= 2) {
      if (!g.portrait) {
        /* fan exit → bottom of the column → top of the column */
        P.push(" C" + f1(ex.x + 40) + " " + f1(ex.y) + " " + f1(c2.x) + " " + f1(c2.y + 30) + " " + f1(c2.x) + " " + f1(c2.y));
        P.push(" L" + f1(c1.x) + " " + f1(c1.y));
      } else {
        /* out through the bottom of the fan → the column → down it */
        P.push(" C" + f1(ex.x - 10) + " " + f1(ex.y + 120) + " " + f1(c1.x) + " " + f1(c1.y - 70) + " " + f1(c1.x) + " " + f1(c1.y));
        P.push(" L" + f1(c2.x) + " " + f1(c2.y));
      }
    }
    if (step >= 5) {
      var from = g.portrait ? c2 : c1;
      if (!g.portrait) {
        P.push(" C" + f1(from.x) + " " + f1(from.y - 90) + " " + f1(rIn.x - 70) + " " + f1(rIn.y) + " " + f1(rIn.x) + " " + f1(rIn.y));
      } else {
        /* straight down past the row's label, then across to the recommendation */
        var drop = g.cmp.stack ? 72 : 30;
        P.push(" L" + f1(from.x) + " " + f1(from.y + drop));
        P.push(" C" + f1(from.x) + " " + f1(from.y + drop + 90) + " " + f1(rIn.x - 60) + " " + f1(rIn.y) + " " + f1(rIn.x) + " " + f1(rIn.y));
      }
      P.push(" L" + f1(rOut.x) + " " + f1(rOut.y));
    }
    if (P.length) {
      s.push('<path d="' + P.join("") + '" fill="none" stroke="' + S1.aihi + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>');
    }
    /* the quiet callback: the path keeps going, and fades before the edge */
    if (step >= 5) {
      s.push('<linearGradient id="s1fade" gradientUnits="userSpaceOnUse" x1="' + f1(rOut.x) + '" y1="0" x2="' + f1(g.W) + '" y2="0">' +
             '<stop offset="0" stop-color="' + S1.aihi + '" stop-opacity="1"/><stop offset="1" stop-color="' + S1.aihi + '" stop-opacity="0"/></linearGradient>');
      s.push('<line x1="' + f1(rOut.x) + '" y1="' + f1(rOut.y) + '" x2="' + f1(g.W + 2) + '" y2="' + f1(rOut.y) +
             '" stroke="url(#s1fade)" stroke-width="3.5"/>');
    }
    /* column nodes, where each clause joins the path */
    if (step >= 2) { s.push('<circle cx="' + f1(c1.x) + '" cy="' + f1(c1.y) + '" r="5" fill="' + S1.aihi + '"/>'); }
    if (step >= 3) { s.push('<circle cx="' + f1(c2.x) + '" cy="' + f1(c2.y) + '" r="5" fill="' + S1.aihi + '"/>'); }

    /* ── the fan, back to front. Quote D stays in its slot until it is
       recommended; then the slot is left as a flat shade. ────────────── */
    var o = { garage: step >= 2, claim: step >= 3 };
    for (i = 3; i >= 0; i--) {
      if (i === 3 && step >= 5) { s.push(vacatedSlot(g, g.fan[3])); continue; }
      s.push(quoteSheet(g, g.fan[i], QUOTES[i], o));
    }

    /* the cheapest quote, labelled on its own sheet's top edge */
    if (step >= 4) {
      var tp = sheetPt(g.fan[2], SW, SH, 0.5, 0);
      var lx0 = Math.min(tp.x - 4, g.W - 8 - 196);   /* never off the right edge */
      s.push('<line x1="' + f1(tp.x) + '" y1="' + f1(tp.y) + '" x2="' + f1(tp.x) + '" y2="' + f1(tp.y - 16) +
             '" stroke="' + S1.cream + '" stroke-width="1.6" opacity=".8"/>');
      s.push('<text x="' + f1(lx0) + '" y="' + f1(tp.y - 24) + '" font-size="16" fill="' + S1.cream +
             '"><tspan font-weight="700">CHEAPEST</tspan><tspan fill="' + S1.muted + '"> · ranked third</tspan></text>');
    }

    /* ── the comparison: the two clauses that matter to this household ── */
    if (step >= 2) { s.push(cmpRow(g, g.cmp.y1, "garage", "GARAGE EXCLUSION", "in two of the four")); }
    if (step >= 3) { s.push(cmpRow(g, g.cmp.y2, "claim", "PRIOR CLAIM", "rated differently by each")); }

    /* ── the recommendation: Quote D, out of the fan, upright, on paper ── */
    if (step >= 5) {
      var r = g.rec;
      s.push(quoteSheet(g, { x: r.x, y: r.y, a: 0 }, QUOTES[3], { paper: true, garage: true, claim: true }));
      s.push('<text x="' + f1(r.x) + '" y="' + f1(r.y - 34) + '" font-size="16" font-weight="700" letter-spacing=".06em" fill="' +
             S1.cream + '">● RECOMMENDED</text>');
      s.push('<text x="' + f1(r.x) + '" y="' + f1(r.y - 14) + '" font-size="15" fill="' + S1.muted + '">not the cheapest</text>');
    }
    return s.join("");
  }

  function paintScene1(step) {
    if (!sceneEl) { return; }
    var portrait = window.innerWidth < 900;
    var box = sceneEl.getBoundingClientRect();
    var W = Math.max(280, Math.round(portrait ? box.width : window.innerWidth));
    var H = Math.round(window.innerHeight);
    var g = geom1(W, H, portrait);
    if (portrait) {
      sceneEl.style.height = Math.round(g.H) + "px";
      H = g.H;
    } else {
      sceneEl.style.height = "";
    }
    sceneEl.setAttribute("viewBox", "0 0 " + f1(W) + " " + f1(H));
    sceneEl.setAttribute("preserveAspectRatio", portrait ? "xMinYMin meet" : "none");
    sceneEl.innerHTML = scene1(step, g);
  }

  /* ── SCREEN 2 ───────────────────────────────────────────────────────────
     The same axis, carried further, and stopped. */
  function screen2(hit) {
    var s = [], i;
    s.push(field(L.world.w, L.world.h));

    /* everything already delegated, now behind us and quiet */
    for (i = L.docs.length - 1; i >= 0; i--) {
      s.push('<g opacity=".34">' + sheet(L.docs[i], 2, null, null, null) + '</g>');
    }
    for (i = 0; i < L.docs.length; i++) {
      var m = docMidRight(L.docs[i]);
      s.push('<path d="M' + m.x + ' ' + m.y + ' Q' + ((m.x + L.node.x) / 2) + ' ' + m.y + ' ' +
             L.node.x + ' ' + L.node.y + '" fill="none" stroke="' + AI +
             '" stroke-width="' + px(1.6).toFixed(1) + '" opacity=".34"/>');
    }

    /* the path runs on, straight at the wall */
    var w = L.wall;
    var stopA = L.portrait ? { x: L.node.x, y: w.y } : { x: w.x, y: L.node.y };
    s.push('<path d="M' + L.node.x + ' ' + L.node.y + ' L' + stopA.x + ' ' + stopA.y +
           '" fill="none" stroke="' + AI + '" stroke-width="' + px(10).toFixed(1) +
           '" opacity=".3" filter="url(#glow)" stroke-linecap="round"/>');
    s.push('<path d="M' + L.node.x + ' ' + L.node.y + ' L' + stopA.x + ' ' + stopA.y +
           '" fill="none" stroke="' + AI_HI + '" stroke-width="' + px(3.4).toFixed(1) +
           '" stroke-linecap="round"/>');

    /* THE WALL — the only warm object in the world, and the full height of
       it, so there is visibly no way around */
    s.push('<rect x="' + w.x + '" y="' + w.y + '" width="' + w.w + '" height="' + w.h +
           '" fill="' + AMBER + '" opacity=".30" filter="url(#glow)"/>');
    s.push('<rect x="' + w.x + '" y="' + w.y + '" width="' + w.w + '" height="' + w.h +
           '" fill="url(#' + (w.vertical ? "wallg" : "wallgv") + ')"/>');
    /* a hot leading edge on the side the path arrives from */
    if (w.vertical) {
      s.push('<rect x="' + (w.x - px(3)) + '" y="' + w.y + '" width="' + px(6).toFixed(1) +
             '" height="' + w.h + '" fill="' + AMBER_HI + '" filter="url(#glow)"/>');
    } else {
      s.push('<rect x="' + w.x + '" y="' + (w.y - px(3)) + '" width="' + w.w +
             '" height="' + px(6).toFixed(1) + '" fill="' + AMBER_HI + '" filter="url(#glow)"/>');
    }

    /* the five things it cannot do, written on the wall itself */
    var WORDS = ["BUY", "BIND", "SIGN", "IDENTITY", "PAYMENT"];
    if (w.vertical) {
      for (i = 0; i < WORDS.length; i++) {
        var wy = L.impact.y + (i - 2) * px(118);
        s.push('<text x="' + (w.x + w.w / 2) + '" y="' + wy.toFixed(1) + '" text-anchor="middle" ' +
               'font-family="Arial,Helvetica,sans-serif" font-size="' + px(19).toFixed(1) +
               '" font-weight="700" letter-spacing="' + px(1.6).toFixed(2) + '" fill="' + BG0 + '">' +
               WORDS[i] + '</text>');
      }
    } else {
      /* portrait: two rows, so nothing has to shrink below reading size */
      var ROWS = [["BUY", "BIND", "SIGN"], ["IDENTITY", "PAYMENT"]];
      for (var r2 = 0; r2 < ROWS.length; r2++) {
        for (i = 0; i < ROWS[r2].length; i++) {
          var cx = L.impact.x + (i - (ROWS[r2].length - 1) / 2) * px(104);
          s.push('<text x="' + cx.toFixed(1) + '" y="' + (w.y + w.h * (0.42 + r2 * 0.30)).toFixed(1) +
                 '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="' +
                 px(18).toFixed(1) + '" font-weight="700" letter-spacing="' + px(1.4).toFixed(2) +
                 '" fill="' + BG0 + '">' + ROWS[r2][i] + '</text>');
        }
      }
    }

    /* the impact: the flow does not pass, it scatters back */
    if (hit) {
      var ix = L.impact.x, iy = L.impact.y;
      s.push('<circle cx="' + ix + '" cy="' + iy + '" r="' + px(30).toFixed(1) +
             '" fill="' + AMBER_HI + '" opacity=".5" filter="url(#glow)"/>');
      seed = 19;
      for (i = 0; i < 16; i++) {
        var ang = (L.portrait ? 90 : 0) + (rnd() - 0.5) * 150;
        var rad = (ang + 180) * Math.PI / 180;
        var len = px(30 + rnd() * 110);
        s.push('<line x1="' + ix + '" y1="' + iy + '" x2="' + (ix + Math.cos(rad) * len).toFixed(1) +
               '" y2="' + (iy + Math.sin(rad) * len).toFixed(1) + '" stroke="' + AI +
               '" stroke-width="' + px(1.6).toFixed(1) + '" opacity="' + (0.25 + rnd() * 0.5).toFixed(2) +
               '" stroke-linecap="round"/>');
      }
    }

    /* beyond the wall: the bound policy, drawn but unreachable */
    var bx = w.vertical ? w.x + w.w + px(64) : L.impact.x - px(90);
    var by = w.vertical ? L.node.y - px(85) : w.y + w.h + px(54);
    s.push('<g opacity=".17">');
    s.push('<path d="' + docPath({ x: bx, y: by, w: px(180), h: px(170), sk: px(16) }) +
           '" fill="none" stroke="' + DOC_EDGE + '" stroke-width="2" stroke-dasharray="' +
           px(8).toFixed(1) + ' ' + px(7).toFixed(1) + '"/>');
    s.push('<text x="' + (bx + px(90)).toFixed(1) + '" y="' + (by + px(205)).toFixed(1) +
           '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="' +
           px(13).toFixed(1) + '" letter-spacing="' + px(1.2).toFixed(2) + '" fill="' + DOC_EDGE +
           '">BOUND POLICY</text>');
    s.push('</g>');
    return s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA — fit the subject, never crop it.
     ══════════════════════════════════════════════════════════════════════ */

  /* The world bleeds 8–11% outside the viewport so the ground never shows an
     edge. The subject therefore has to be fitted to the VIEWPORT and the
     viewBox then widened to the world's box — fitting it to the world box
     would push the composition off-screen by exactly that bleed. The bottom
     chrome is reserved too, so nothing lands under the navigation. */
  function fitView() {
    var el = worldEl.getBoundingClientRect();
    var v = L.subject;
    var vpW = window.innerWidth;
    var vpH = Math.max(240, window.innerHeight - 84);
    var sc = Math.min(vpW / v.w, vpH / v.h);
    var vbW = el.width / sc, vbH = el.height / sc;
    scale = sc;
    /* the reserved chrome is at the bottom only, so the subject's centre
       moves up by half of it rather than sitting in the geometric middle */
    vb = { x: v.x + v.w / 2 - vbW / 2,
           y: v.y + v.h / 2 - vbH / 2 + (window.innerHeight - vpH) / 2 / sc,
           w: vbW, h: vbH };
    svg.setAttribute("viewBox", vb.x.toFixed(1) + " " + vb.y.toFixed(1) + " " +
                                vb.w.toFixed(1) + " " + vb.h.toFixed(1));
  }

  var hitShown = false;
  function paintWorld() {
    if (!svg || !worldEl) { return; }
    var r = worldEl.getBoundingClientRect();
    if (current === 1) {
      /* screen 1: the world is only the ground; the composition is #scene1 */
      svg.setAttribute("viewBox", "0 0 " + f1(r.width) + " " + f1(r.height));
      svg.innerHTML = ground1(r.width, r.height);
      paintScene1(readStep);
      return;
    }
    L = layout(r.width / r.height < 1.05);
    fitView();
    svg.innerHTML = defs() + screen2(hitShown);
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE READ — screen 1's one interaction. The flow itself is the control.
     ══════════════════════════════════════════════════════════════════════ */

  var readStep = 5, readTimer = null;
  var statusEl = document.getElementById("state-status");
  function say(m) { if (statusEl) { statusEl.textContent = m; } }

  var STATE = [
    "Four renewal quotes, unread.",
    "Reading all four, every clause.",
    "Garage exclusion: found in two of the four.",
    "Prior claim: rated differently by each.",
    "Ranked against her needs, not just the price. The cheapest came third.",
    "Ranked against what her household needs, not just the price."
  ];

  function paintRead() {
    var b = document.getElementById("read-play");
    if (b) { b.textContent = readTimer ? "Pause" : readStep >= 5 ? "Run it again" : "Resume"; }
    var d = document.getElementById("read-count");
    if (d) { d.textContent = STATE[Math.min(readStep, 5)]; }
    paintWorld();
  }
  function readStop() { clearInterval(readTimer); readTimer = null; }
  function readRun() {
    if (readTimer) { readStop(); paintRead(); say("Paused."); return; }
    if (readStep >= 5) { readStep = 0; }
    readTimer = setInterval(function () {
      readStep++;
      if (readStep >= 5) { readStep = 5; readStop(); say(STATE[5]); }
      paintRead();
    }, 820);
    readStep++; paintRead();
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
    relayout = setTimeout(paintWorld, 120);
  });

  /* the headline's box changes height once Bricolage arrives, and the fan
     is laid out under it, so the drawing follows the font */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { paintWorld(); });
  }

  paintRead();
  show(fromHash() || 1, false);
})();
