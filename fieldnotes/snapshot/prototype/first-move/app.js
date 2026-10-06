/* ══════════════════════════════════════════════════════════════════════════
   First Move · the opening bookend
   Two screens. No framework, no build step, no external request.

   WHAT CHANGED, AND WHY
   The previous version told this story with four boxes on a cream page. The
   boxes were the argument, which meant the argument had to be read. This
   version makes the argument a PLACE: a dark information field with one
   directional axis running through it.

       screen 1   four policy documents enter the axis, are read, compared
                  and ranked, and the traces converge into ONE recommendation
       screen 2   the same axis continues, and runs into a transaction wall

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
  var VIOLET = "#A78BFA", TEAL = "#3FD3B4";
  var AMBER = "#F3A23F", AMBER_HI = "#FFCE86", WARM = "#D9561F";
  var TXT = "#F3F5FC", TXT_SOFT = "#A9B3D1";

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

  /* A clause label lives INSIDE its document, not beside it.
     Beside it, a label straddled the boundary between a white sheet and the
     dark ground, so no single ink could carry it — the sub-line disappeared
     against the paper. On the sheet, dark ink reads throughout, and it is
     also where the clause actually is. */
  function docLabel(d, v, text, sub, ink) {
    var p = docPt(d, 0.1, v);
    var s = [];
    s.push('<text x="' + p.x.toFixed(1) + '" y="' + (p.y - px(12)).toFixed(1) +
           '" font-family="Arial,Helvetica,sans-serif" font-size="' + px(14).toFixed(1) +
           '" font-weight="700" letter-spacing="' + px(1.1).toFixed(2) + '" fill="' + ink + '">' +
           text + '</text>');
    if (sub) {
      s.push('<text x="' + p.x.toFixed(1) + '" y="' + (p.y + px(19)).toFixed(1) +
             '" font-family="Arial,Helvetica,sans-serif" font-size="' + px(12).toFixed(1) +
             '" fill="#424B6E">' + sub + '</text>');
    }
    return s.join("");
  }

  /* a line of type on the dark ground, above or below an object */
  function groundLabel(x, y, text, size, color, weight) {
    return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" ' +
           'font-family="Arial,Helvetica,sans-serif" font-size="' + px(size).toFixed(1) +
           '" font-weight="' + (weight || 400) + '" letter-spacing="' + px(size * 0.11).toFixed(2) +
           '" fill="' + color + '">' + text + '</text>';
  }

  /* ── SCREEN 1 ───────────────────────────────────────────────────────────
     step 0..5 — 0 nothing read, 1..4 reading that document, 5 recommended */
  function screen1(step) {
    var s = [], i;
    s.push(field(L.world.w, L.world.h));

    /* `c` lights the clause on the sheet, `ink` sets the label — the same
       hue driven dark enough to carry type on white paper */
    var CL = [
      { v: 0.42, c: VIOLET, ink: "#6D28D9", t: "GARAGE EXCLUSION", sub: "in two of the four" },
      { v: 0.58, c: TEAL,   ink: "#0E7A66", t: "PRIOR CLAIM",      sub: "rated differently by each" },
      null, null
    ];

    /* the reasoning path: one continuous sweep through every document */
    var pts = [L.entry];
    for (i = 0; i < L.docs.length; i++) { pts.push(docPt(L.docs[i], 0.46, 0.5)); }
    pts.push(L.node);

    var shown = Math.min(step, 4);
    if (shown > 0) {
      var dpath = "M" + pts[0].x + " " + pts[0].y;
      for (i = 1; i <= shown; i++) {
        var p0 = pts[i - 1], p1 = pts[i];
        dpath += " Q" + ((p0.x + p1.x) / 2 + (L.portrait ? 90 : 10)) + " " +
                 ((p0.y + p1.y) / 2 - (L.portrait ? 10 : 80)) + " " + p1.x + " " + p1.y;
      }
      s.push('<path d="' + dpath + '" fill="none" stroke="' + AI + '" stroke-width="' + px(9).toFixed(1) +
             '" opacity=".28" filter="url(#glow)" stroke-linecap="round"/>');
      s.push('<path d="' + dpath + '" fill="none" stroke="url(#ailine)" stroke-width="' + px(3).toFixed(1) +
             '" stroke-linecap="round"/>');
    }

    /* documents, back to front, so the fan overlaps correctly */
    for (i = L.docs.length - 1; i >= 0; i--) {
      var st = step === 0 ? 0 : (step === i + 1 ? 1 : (step > i + 1 ? 2 : 0));
      s.push(sheet(L.docs[i], st, null, CL[i] ? CL[i].c : null, CL[i] ? CL[i].v : null));
    }

    /* the two clause facts, written on the sheet the clause belongs to */
    for (i = 0; i < 2; i++) {
      if (step > i + 1) {
        s.push(docLabel(L.docs[i], CL[i].v, CL[i].t, CL[i].sub, CL[i].ink));
      }
    }

    /* the cheapest quote — on a document that is NOT the one recommended */
    if (step >= 4) {
      s.push(docLabel(L.docs[3], 0.14, "CHEAPEST", "ranked third", "#3C4466"));
    }

    /* convergence: every document's trace folds into one node */
    if (step >= 5) {
      for (i = 0; i < L.docs.length; i++) {
        var m = docMidRight(L.docs[i]);
        s.push('<path d="M' + m.x + ' ' + m.y + ' Q' + ((m.x + L.node.x) / 2) + ' ' + m.y + ' ' +
               L.node.x + ' ' + L.node.y + '" fill="none" stroke="' + AI +
               '" stroke-width="' + px(1.6).toFixed(1) + '" opacity=".5"/>');
      }
      s.push('<circle cx="' + L.node.x + '" cy="' + L.node.y + '" r="' + px(13).toFixed(1) +
             '" fill="' + AI_HI + '" filter="url(#glow)"/>');

      /* the one recommendation, upright and lit */
      var r = L.rec;
      s.push('<path d="' + docPath(r) + '" fill="' + AI + '" opacity=".20" filter="url(#glow)"/>');
      s.push('<path d="' + docPath(r) + '" fill="url(#docg)" stroke="' + AI_HI + '" stroke-width="3.4"/>');
      for (i = 0; i < 11; i++) {
        var rv = 0.12 + i * 0.07;
        var ra = docPt(r, 0.1, rv), rb = docPt(r, 0.1 + 0.6 + ((i * 29) % 17) / 60, rv);
        s.push('<line x1="' + ra.x.toFixed(1) + '" y1="' + ra.y.toFixed(1) + '" x2="' + rb.x.toFixed(1) +
               '" y2="' + rb.y.toFixed(1) + '" stroke="' + DOC_LINE + '" stroke-width="2.4" opacity=".55"/>');
      }
      /* Both lines sit ABOVE the sheet on the dark ground. "not the cheapest"
         was below it, where the foot's scrim swallowed it — and it is the
         payoff of the whole screen, so it cannot be the dimmest thing on it. */
      var rt = docPt(r, 0.5, -0.03);
      s.push(groundLabel(rt.x, rt.y - px(20), "RECOMMENDED", 17, AI_HI, 700));
      s.push(groundLabel(rt.x, rt.y, "not the cheapest", 13.5, TXT_SOFT, 400));
    }
    return s.join("");
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
    L = layout(r.width / r.height < 1.05);
    fitView();
    svg.innerHTML = defs() + (current === 1 ? screen1(readStep) : screen2(hitShown));
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE READ — screen 1's one interaction. The flow itself is the control.
     ══════════════════════════════════════════════════════════════════════ */

  var readStep = 5, readTimer = null;
  var statusEl = document.getElementById("state-status");
  function say(m) { if (statusEl) { statusEl.textContent = m; } }

  var STATE = [
    "Four renewal wordings, unread.",
    "Reading the first wording.",
    "Comparing the garage exclusion.",
    "Weighing the prior claim.",
    "Ranking all four. The cheapest came third.",
    "Four documents, every exclusion, in the time it takes to read one."
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

  paintRead();
  show(fromHash() || 1, false);
})();
