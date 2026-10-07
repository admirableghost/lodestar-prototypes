/* ══════════════════════════════════════════════════════════════════════════
   Home Again · the Rennick household · Calder Reach
   Five screens. No framework, no build step, no external request.

   Built out from the approved opening frame (design-study frame 02) and its
   browser proof: the same scene vocabulary — a solid cut-paper home, its
   replacement plan as amber construction linework on the same footprint, one
   ground plane, one path — carried through five compositions.
   Copy and state: design-study/brief-align/CONTRACT-IMPL.md § F.

     1  choose your way home       three ways home, drawn; the chosen one
                                   stands behind the home today as its plan
     2  three commitments, made now  temporary living · the chosen plan with
                                   the named builder · Marta coordinates
     3  the loss                   the home as an outline; the three hold
     4  the arrangement activates  the approved recovery composition; the
                                   regional-event branch keeps the queue
     5  home again                 the chosen house, lived in; three honoured

   ONE STATE. { screen, home, agreed, event } is the only source of truth,
   persisted in sessionStorage. Every drawing and label is a function of it:
   the house chosen on screen 1 is the plan on 2, the site on 4 and the home
   on 5; a regional event shown on 4 is still the context on 5. Next never
   agrees to anything: only #agree does, and restart clears all of it.

   THREE WAYS HOME, drawn differently (never told apart by copy alone):
     a  like-for-like                the same house, same footprint
     b  faster and smaller           a low, narrow, panel-built house
     c  hardened to a higher standard  the footprint, with a seamed roof,
                                     ember ticks, screened vents, masonry
                                     base and a cleared edge

   CALLOUTS. Labels that belong to things in the drawing are authored once as
   data. In landscape they are drawn into the scene as SVG text beside the
   thing they name. In portrait the drawing is small and the labels would
   fight each other, so the same data reflows into an HTML legend under the
   scene — the label text never shrinks, and nothing is hidden.

   WHAT IS INVENTED. All of it: the household, the town, the builder, the
   recovery lead. No real insurer, provider, price, count or date appears.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var svg = document.getElementById("scene");
  var root = document.documentElement;
  var body = document.body;

  var PAPER = "#F3EBD7", INK = "#16150F", AMBER = "#C98D1C", SUN = "#E7A525",
      SAGE = "#8C9A84", SAGE2 = "#6F7F68", GROUND = "#E3D7BA", PATH = "#EDE2C6",
      GARAGE = "#3A372F", MUTED = "#5A554A", BLOCK = "#6B675E", WARN = "#A8502A",
      LIT = "#F2CF7A", SLAB = "#CFC4A6";

  var HOMES = ["a", "b", "c"];
  var HOME_NAME = { a: "Like-for-like", b: "Faster and smaller", c: "Hardened to a higher standard" };
  var HOME_LINE = { a: "The same house on the same footprint",
                    b: "A smaller, panel-built house, sooner",
                    c: "The footprint, with a seamed roof, ember-resistant edges, screened vents and a cleared edge" };
  var BUILDER = "Ardren &amp; Sons";
  var STATE_WORD = { agreed: "Agreed", reserved: "Reserved", begun: "Begun", holds: "Holds", honoured: "Honoured",
                     constrained: "Constrained", falls: "Queued" };

  /* ── state, persisted ────────────────────────────────────────────────── */
  var KEY = "ha-state";
  var S = { screen: 1, home: "a", agreed: false, event: false };
  function load() {
    try {
      var o = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (o && typeof o === "object") {
        if (HOMES.indexOf(o.home) >= 0) { S.home = o.home; }
        S.agreed = o.agreed === true; S.event = o.event === true;
      }
    } catch (e) { /* storage unavailable: the state lives for the page */ }
  }
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify({ home: S.home, agreed: S.agreed, event: S.event })); } catch (e) { /* ignore */ }
  }
  function clear() { try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } }

  var scale = 1, portrait = false, legend = [];
  function px(n) { return n / scale; }
  function n1(v) { return (Math.round(v * 10) / 10).toString(); }

  /* ── primitives ──────────────────────────────────────────────────────── */
  function text(x, y, str, size, o) {
    o = o || {};
    return '<text x="' + n1(x) + '" y="' + n1(y) + '" font-size="' + n1(px(size)) +
           '" font-family="Bricolage,Helvetica,Arial,sans-serif" font-weight="' + (o.w || 400) +
           '" text-anchor="' + (o.anc || "start") + '" fill="' + (o.fill || INK) +
           (o.ls ? '" letter-spacing="' + n1(px(o.ls)) : "") +
           (o.op != null ? '" opacity="' + o.op : "") + '">' + str + '</text>';
  }
  function line(x1, y1, x2, y2, stroke, w, o) {
    o = o || {};
    return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) +
           '" stroke="' + stroke + '" stroke-width="' + n1(w) +
           (o.dash ? '" stroke-dasharray="' + o.dash : "") +
           (o.op != null ? '" opacity="' + o.op : "") + '" stroke-linecap="round"/>';
  }
  function rect(x, y, w, h, fill, o) {
    o = o || {};
    return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) +
           '" fill="' + fill + '"' + (o.stroke ? ' stroke="' + o.stroke + '" stroke-width="' + (o.sw || 2) + '"' : "") +
           (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") +
           (o.op != null ? ' opacity="' + o.op + '"' : "") + (o.rx ? ' rx="' + o.rx + '"' : "") +
           (o.filter ? ' filter="' + o.filter + '"' : "") + "/>";
  }
  function leader(x1, y1, x2, y2, c, dash) { return line(x1, y1, x2, y2, c || INK, 1.6, { op: .7, dash: dash }); }

  /* a state word drawn as a mark + text, never colour alone */
  function mark(x, y, kind, anc) {
    var s = [], w = px(9), c = kind === "constrained" || kind === "falls" ? WARN : INK;
    var mx = anc === "end" ? x - px(6) - w : x;
    if (kind === "reserved") { s.push('<circle cx="' + n1(mx + w / 2) + '" cy="' + n1(y - px(4)) + '" r="' + n1(w / 2 - px(1)) + '" fill="none" stroke="' + c + '" stroke-width="' + n1(px(2)) + '"/>'); }
    else if (kind === "constrained" || kind === "falls") { s.push(rect(mx, y - px(8.5), w, w, "url(#warnhatch)", { stroke: c, sw: px(1.6) })); }
    else { s.push('<circle cx="' + n1(mx + w / 2) + '" cy="' + n1(y - px(4)) + '" r="' + n1(w / 2) + '" fill="' + c + '"/>'); }
    var tx = anc === "end" ? mx - px(6) : mx + w + px(6);
    s.push(text(tx, y, STATE_WORD[kind].toUpperCase(), 11.5, { w: 700, ls: 1.1, anc: anc || "start", fill: c }));
    return s.join("");
  }

  /* A callout: { x, y, anc, title, state, note:[...], lead:[x1,y1,x2,y2,colour,dash] }.
     Landscape draws it; portrait collects it for the legend. */
  function callout(c) {
    if (portrait) { legend.push(c); return ""; }
    var s = [], y = c.y;
    if (c.lead) { s.push(leader.apply(null, c.lead)); }
    if (c.eyebrow) { s.push(text(c.x, y, c.eyebrow, 11.5, { w: 700, ls: 1.2, fill: c.ebFill || AMBER, anc: c.anc })); y += px(22); }
    if (c.title) { s.push(text(c.x, y, c.title, 14, { w: 700, anc: c.anc })); y += px(22); }
    if (c.state) { s.push(mark(c.x, y, c.state, c.anc)); y += px(20); }
    (c.note || []).forEach(function (n) { s.push(text(c.x, y, n, 12.5, { fill: MUTED, anc: c.anc })); y += px(17); });
    return s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE PROPERTY — one geometry per way home, drawn solid or as a plan
     ══════════════════════════════════════════════════════════════════════ */
  /* hardening features on the footprint of a/c: ember ticks on the roof
     edge, screened vents, and — on the ground only — the cleared edge */
  function features(asPlan, edge) {
    var s = [], i, t, x, y, col = asPlan ? AMBER : PAPER;
    s.push('<path d="M470 452 L665 338 L860 452" fill="none" stroke="' + col + '" stroke-width="' + (asPlan ? 1.6 : 1.4) +
           '" opacity="' + (asPlan ? ".9" : ".55") + '"' + (asPlan ? ' stroke-dasharray="6 5"' : "") + '/>');
    for (i = 1; i <= 6; i++) {
      t = i / 7;
      x = 450 + 215 * t; y = 448 - 126 * t; s.push(line(x, y, x + 5.4, y + 7.2, col, 2, { op: asPlan ? 1 : .85 }));
      x = 665 + 215 * t; y = 322 + 126 * t; s.push(line(x, y, x - 5.4, y + 7.2, col, 2, { op: asPlan ? 1 : .85 }));
    }
    [600, 820].forEach(function (vx) {
      s.push(rect(vx, 566, 26, 16, asPlan ? "none" : INK, { stroke: col, sw: 2 }));
      s.push(line(vx + 8.5, 566, vx + 8.5, 582, col, 1.3)); s.push(line(vx + 17, 566, vx + 17, 582, col, 1.3));
    });
    if (edge !== false) { s.push('<path d="M400 640 Q665 668 1030 640" fill="none" stroke="' + (asPlan ? AMBER : SAGE2) + '" stroke-width="2.6" stroke-dasharray="11 9" opacity=".85"/>'); }
    return s.join("");
  }
  /* the hardened house's own marks: roof seams and a masonry base band */
  function hardening(asPlan) {
    var s = [], col = asPlan ? AMBER : PAPER;
    [[665, 346, 556, 448], [665, 346, 774, 448], [665, 392, 614, 448], [665, 392, 716, 448]].forEach(function (p) {
      s.push(line(p[0], p[1], p[2], p[3], col, 1.6, { op: asPlan ? .9 : .5 }));
    });
    s.push(rect(470, 582, 390, 18, asPlan ? "none" : BLOCK, { stroke: col, sw: asPlan ? 1.6 : 0, op: asPlan ? .9 : 1 }));
    if (!asPlan) { s.push(line(470, 591, 860, 591, PAPER, 1, { op: .35 })); }
    return s.join("");
  }

  function home(o) {
    o = o || {}; var s = [], h = o.home || S.home, win = o.lit ? LIT : PAPER;
    s.push('<g data-home="' + h + '" transform="translate(' + (o.tx || 0) + ',' + (o.ty || 0) + ')' + (o.k && o.k !== 1 ? ' scale(' + o.k + ')' : "") + '" opacity="' + (o.op == null ? 1 : o.op) + '">');
    if (o.tree !== false) {
      s.push(rect(392, 520, 16, 84, INK));
      s.push('<circle cx="400" cy="470" r="86" fill="' + SAGE2 + '"/><circle cx="372" cy="492" r="62" fill="' + SAGE + '"/><circle cx="434" cy="455" r="58" fill="' + SAGE + '"/>');
    }
    if (h === "b") {
      /* faster and smaller: low pitch, narrow, no garage; panel seams */
      s.push(rect(560, 480, 240, 120, INK));
      s.push('<polygon points="536,480 680,404 824,480" fill="' + INK + '"/>');
      s.push('<polyline points="536,480 680,404 824,480" fill="none" stroke="' + PAPER + '" stroke-width="3" opacity=".55"/>');
      s.push(line(640, 480, 640, 600, PAPER, 1.4, { op: .35 }) + line(720, 480, 720, 600, PAPER, 1.4, { op: .35 }));
      s.push(rect(596, 530, 34, 70, o.lit ? LIT : PAPER)); s.push('<circle cx="622" cy="566" r="2.2" fill="' + INK + '"/>');
      s.push(rect(690, 520, 60, 48, win)); s.push(line(720, 520, 720, 568, INK, 3) + line(690, 544, 750, 544, INK, 3));
      s.push('<path d="M560 600 L800 600 L830 626 L530 626 Z" fill="' + INK + '" opacity=".12"/>');
    } else {
      s.push(rect(470, 448, 390, 152, INK));
      s.push('<polygon points="450,448 665,322 880,448" fill="' + INK + '"/>');
      s.push('<polyline points="450,448 665,322 880,448" fill="none" stroke="' + PAPER + '" stroke-width="3" opacity=".55"/>');
      s.push(rect(770, 352, 30, 70, INK)); s.push(rect(766, 348, 38, 8, INK));
      s.push(rect(478, 492, 130, 8, PAPER, { op: .9 })); s.push(rect(490, 500, 7, 100, PAPER, { op: .9 })); s.push(rect(596, 500, 7, 100, PAPER, { op: .9 }));
      s.push(rect(525, 516, 40, 84, o.lit ? LIT : PAPER)); s.push(rect(525, 506, 40, 7, PAPER));
      s.push('<circle cx="556" cy="560" r="2.4" fill="' + INK + '"/>');
      s.push(rect(640, 500, 60, 56, win)); s.push(rect(740, 500, 60, 56, win));
      s.push(line(670, 500, 670, 556, INK, 3) + line(640, 528, 700, 528, INK, 3) + line(770, 500, 770, 556, INK, 3) + line(740, 528, 800, 528, INK, 3));
      s.push(rect(860, 500, 130, 100, GARAGE));
      s.push(line(876, 528, 974, 528, PAPER, 2, { op: .5 }) + line(876, 552, 974, 552, PAPER, 2, { op: .5 }) + line(876, 576, 974, 576, PAPER, 2, { op: .5 }));
      s.push('<path d="M470 600 L1000 600 L1040 626 L430 626 Z" fill="' + INK + '" opacity=".12"/>');
      if (h === "c") { s.push(hardening(false)); s.push(features(false, o.edge)); }
    }
    s.push("</g>");
    return s.join("");
  }

  function plan(o) {
    o = o || {}; var s = [], h = o.home || S.home;
    s.push('<g data-home="' + h + '" transform="translate(' + (o.tx || 0) + ',' + (o.ty || 0) + ')' + (o.k && o.k !== 1 ? ' scale(' + o.k + ')' : "") +
           '" fill="none" stroke="' + AMBER + '" stroke-width="3" stroke-linejoin="round" opacity="' + (o.op == null ? 1 : o.op) + '">');
    if (h === "b") {
      s.push('<polygon points="536,480 680,404 824,480" fill="url(#hatch)" stroke="none"/><polygon points="536,480 680,404 824,480"/>');
      s.push(rect(560, 480, 240, 120, "none", { stroke: AMBER, sw: 3 }));
      s.push(line(680, 404, 680, 600, AMBER, 2, { dash: "3 7" }) + line(640, 480, 640, 600, AMBER, 1.6, { op: .8 }) + line(720, 480, 720, 600, AMBER, 1.6, { op: .8 }));
      if (o.ticks !== false) { s.push(line(846, 480, 846, 600, AMBER, 2) + line(838, 480, 854, 480, AMBER, 2) + line(838, 600, 854, 600, AMBER, 2)); }
      if (o.openings) { s.push(rect(596, 530, 34, 70, "none", { stroke: AMBER, sw: 2 }) + rect(690, 520, 60, 48, "none", { stroke: AMBER, sw: 2 })); }
    } else {
      s.push('<polygon points="450,448 665,322 880,448" fill="url(#hatch)" stroke="none"/><polygon points="450,448 665,322 880,448"/>');
      s.push(rect(470, 448, 390, 152, "none", { stroke: AMBER, sw: 3 }) + rect(860, 500, 130, 100, "none", { stroke: AMBER, sw: 3 }) + rect(770, 352, 30, 70, "none", { stroke: AMBER, sw: 3 }));
      s.push(line(665, 322, 665, 600, AMBER, 2, { dash: "3 7" }) + line(470, 520, 860, 520, AMBER, 2, { op: .8 }));
      if (o.ticks !== false) { s.push(line(1012, 448, 1012, 600, AMBER, 2) + line(1004, 448, 1020, 448, AMBER, 2) + line(1004, 600, 1020, 600, AMBER, 2)); }
      if (o.openings) {
        s.push(rect(525, 516, 40, 84, "none", { stroke: AMBER, sw: 2 }) + rect(640, 500, 60, 56, "none", { stroke: AMBER, sw: 2 }) +
               rect(740, 500, 60, 56, "none", { stroke: AMBER, sw: 2 }) + rect(478, 492, 130, 8, "none", { stroke: AMBER, sw: 2 }));
      }
      if (h === "c") { s.push(hardening(true)); s.push(features(true, o.edge)); }
    }
    s.push("</g>");
    return s.join("");
  }

  /* the home today, as an outline: what the loss leaves of it */
  function outline(o) {
    o = o || {}; var s = [];
    s.push('<g transform="translate(' + (o.tx || 0) + ',' + (o.ty || 0) + ')' + (o.k && o.k !== 1 ? ' scale(' + o.k + ')' : "") +
           '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" opacity=".7">');
    s.push('<polygon points="450,448 665,322 880,448"/>' + rect(470, 448, 390, 152, "none", { stroke: INK, sw: 2.4 }) +
           rect(860, 500, 130, 100, "none", { stroke: INK, sw: 2.4 }) + rect(770, 352, 30, 70, "none", { stroke: INK, sw: 2.4 }));
    s.push("</g>");
    return s.join("");
  }

  /* the footprint's extent and the door's position, per way home */
  var EXTENT = { a: [453, 995], b: [540, 820], c: [453, 995] };
  var DOOR_TX = { a: 70, b: 125, c: 70 };

  function figure(x, y, o) {
    o = o || {}; var s = [], k = o.k || 1, c = o.fill || INK;
    s.push('<g transform="translate(' + x + ',' + y + ') scale(' + k + ')" opacity="' + (o.op == null ? 1 : o.op) + '">');
    s.push('<circle cx="0" cy="-66" r="10" fill="' + c + '"/><path d="M-13 -52 L13 -52 L17 -6 L9 -6 L9 0 L-9 0 L-9 -6 L-17 -6 Z" fill="' + c + '"/>');
    if (o.case_) { s.push(rect(18, -22, 14, 20, c, { rx: 2 })); }
    if (o.board) { s.push(rect(-32, -40, 14, 18, PAPER, { stroke: c, sw: 2 })); }
    s.push("</g>");
    return s.join("");
  }
  function smallHome(x, y, o) {
    o = o || {}; var s = [], k = o.k || 0.46, c = o.fill || INK;
    s.push('<g transform="translate(' + x + ',' + y + ') scale(' + k + ')">');
    s.push(rect(0, 100, 240, 120, c) + '<polygon points="-14,100 120,22 254,100" fill="' + c + '"/>' + rect(100, 150, 40, 70, PAPER));
    s.push(rect(32, 130, 44, 40, o.lit ? LIT : PAPER) + rect(164, 130, 44, 40, o.lit ? LIT : PAPER));
    s.push("</g>");
    return s.join("");
  }
  function timber(x, y, o) {
    o = o || {}; var s = [], c = o.off ? MUTED : INK;
    s.push('<g opacity="' + (o.off ? .5 : 1) + '">');
    [[0, 36, 220, 22], [14, 12, 192, 22], [28, -12, 164, 22]].forEach(function (b) {
      s.push(rect(x + b[0], y + b[1], b[2], b[3], PATH, { stroke: c, sw: 2 }));
      s.push(line(x + b[0] + b[2] * .25, y + b[1], x + b[0] + b[2] * .25, y + b[1] + b[3], c, 1.4, { op: .8 }));
      s.push(line(x + b[0] + b[2] * .75, y + b[1], x + b[0] + b[2] * .75, y + b[1] + b[3], c, 1.4, { op: .8 }));
    });
    s.push("</g>");
    return s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE FIVE SCENES
     ══════════════════════════════════════════════════════════════════════ */
  function defs() {
    return '<defs>' +
      '<filter id="grain" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in" result="g"/><feBlend in="SourceGraphic" in2="g" mode="multiply"/></filter>' +
      '<filter id="rough" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<filter id="speckle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .09  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .18 0" result="s"/><feBlend in="SourceGraphic" in2="s" mode="multiply"/></filter>' +
      '<pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="' + AMBER + '" stroke-width="1.2" opacity=".55"/></pattern>' +
      '<pattern id="warnhatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="' + WARN + '" stroke-width="2"/></pattern>' +
      '<radialGradient id="warm" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="' + SUN + '" stop-opacity=".34"/><stop offset="1" stop-color="' + SUN + '" stop-opacity="0"/></radialGradient>' +
      '</defs>';
  }
  function sky(o) {
    o = o || {}; var s = ['<g filter="url(#speckle)">'];
    s.push(rect(-900, -600, 3000, 2100, PAPER));
    s.push('<polygon points="620,-600 1900,-600 1900,330 740,230" fill="' + SAGE + '" opacity=".20"/><polygon points="300,-600 700,-600 520,250" fill="' + BLOCK + '" opacity=".14"/>');
    if (o.dusk) { s.push('<polygon points="-900,-600 1900,-600 1900,420 -900,520" fill="' + BLOCK + '" opacity=".16"/>'); }
    if (o.sun !== false) {
      var sx = o.sunX || 1120, sy = o.sunY || 100, sr = o.sunR || 162;
      if (o.warm) { s.push('<ellipse cx="' + sx + '" cy="' + (sy + 80) + '" rx="' + (sr * 3.2) + '" ry="' + (sr * 1.6) + '" fill="url(#warm)"/>'); }
      s.push('<circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="' + SUN + '" opacity=".92" filter="url(#grain)"/>');
      s.push('<polygon points="880,-600 1900,-600 1040,300" fill="' + BLOCK + '" opacity=".12"/>');
    }
    if (o.ground !== false) {
      s.push('<path d="M-900 640 Q590 548 2100 640 L2100 1500 L-900 1500 Z" fill="' + GROUND + '"/>');
      if (o.warm) { s.push('<path d="M-900 640 Q590 548 2100 640 L2100 1500 L-900 1500 Z" fill="' + SUN + '" opacity=".10"/>'); }
      s.push('<path d="M-900 640 Q590 548 2100 640" fill="none" stroke="' + INK + '" stroke-width="1.4" opacity=".35"/>');
    }
    s.push("</g>");
    return s.join("");
  }
  function path(tx) { tx = tx || 0; return '<path d="M' + (545 + tx) + ' 600 Q' + (520 + tx) + ' 690 300 820 L440 820 Q' + (560 + tx) + ' 690 ' + (585 + tx) + ' 600 Z" fill="' + PATH + '"/>'; }
  function block(x, y, w, h) { return '<g class="block-wide" filter="url(#rough)">' + rect(x, y, w, h, BLOCK, { rx: 3, filter: "url(#grain)" }) + "</g>"; }
  function footprint(x1, x2, y) { return line(x1, y, x2, y, AMBER, 2.4, { dash: "12 9" }); }

  /* ── 1 · the approved frame: the home today, the chosen plan behind it ── */
  function scene1() {
    var s = [sky()];
    s.push(plan({ tx: 100, ty: -180, edge: false }));   /* the plan floats behind the home; its cleared edge is a ground feature */
    s.push(footprint(484, 1070, 626)); s.push(path(70)); s.push(home({ tx: 70, home: "a" }));
    /* the smaller plan ends short of the annotation, so its lead runs out
       along the clear sky above the roof before dropping to the words */
    if (S.home === "b") { s.push(line(950, 420, 1090, 420, AMBER, 2)); }
    s.push('<line id="lead-plan" x1="1090" y1="420" x2="1090" y2="446" stroke="' + AMBER + '" stroke-width="2"/>');
    s.push('<text id="anno-plan-1" class="anno" x="1128" y="468" text-anchor="end" font-size="' + n1(px(15)) + '">Your way home,</text>');
    s.push('<text id="anno-plan-2" class="anno" x="1128" y="488" text-anchor="end" font-size="' + n1(px(15)) + '">chosen now</text>');
    s.push(leader(1095, 632, 1095, 652)); s.push(text(1128, 670, "Your home today", 15, { anc: "end" }));
    s.push(block(56, 82, 600, 304));   /* wide enough for the three lines at the type floor (0.94) when the frame scales to 0.90 */
    return s.join("");
  }

  /* ── 2 and 3 · the three commitments around the house ───────────────────
     The house is reduced and set top-centre: on 2 it is the chosen plan, on
     3 it is the home today as an outline. Three commitment groups stand on
     the ground beneath it, each in its own column with its own illustration,
     label and state, each tied back to the house by a light dashed leader. */
  function commitments(centre, state, notes) {
    var s = [], e = EXTENT[S.home];
    s.push(footprint(427 + e[0] * .58, 427 + e[1] * .58, 420));
    s.push(centre);
    s.push(leader(760, 422, 236, 520, AMBER, "5 6"));
    s.push(leader(846, 422, 586, 492, AMBER, "5 6"));
    s.push(leader(934, 422, 936, 480, AMBER, "5 6"));
    /* temporary living · the chosen plan with the named builder · Marta */
    s.push(smallHome(140, 480, { k: .5, lit: false }));
    s.push(callout({ x: 58, y: 620, title: "Temporary living", state: state, note: notes ? ["From the first night."] : [] }));
    s.push(figure(586, 598, { board: true, k: 1.2 }));
    s.push(callout({ x: 430, y: 620, title: "Marta coordinates", state: state, note: notes ? ["Named now, not at the loss."] : [] }));
    s.push(timber(830, 540));
    s.push(callout({ x: 800, y: 620, title: "The chosen plan", state: state, note: [HOME_NAME[S.home] + " · " + BUILDER] }));
    return s.join("");
  }
  function scene2() {
    var s = [sky({ sunX: 1120, sunY: 90, sunR: 130 })];
    s.push(commitments(plan({ tx: 427, ty: 70, k: .58, openings: true, ticks: false, edge: false }), S.agreed ? "agreed" : null, true));
    s.push(block(56, 82, 520, 196));
    return s.join("");
  }
  function scene3() {
    var s = [sky({ sun: false, dusk: true })];
    var slab = EXTENT.a;
    s.push(rect(427 + slab[0] * .58 + 8, 416, (slab[1] - slab[0]) * .58 - 16, 8, SLAB, { stroke: INK, sw: 1.2 }));
    s.push(commitments(outline({ tx: 427, ty: 70, k: .58 }), "holds", false));
    /* the family, before what is left of the house: an adult and a child,
       hand in hand, facing it */
    s.push(figure(462, 414, { k: .8 }));
    s.push('<line x1="472" y1="392" x2="492" y2="400" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
    s.push(figure(498, 414, { k: .52 }));
    s.push(block(56, 82, 400, 150));
    return s.join("");
  }

  /* ── 4 · the arrangement activates ───────────────────────────────────────
     The page-wide scene carries only the dusk paper; the recovery scene is
     its own bounded SVG inside the screen's flow layout (see paintScene4),
     so its labels can live in wrapping HTML areas beside the artwork. */
  function scene4() { return sky({ sun: false, dusk: true, ground: false }); }

  function paintScene4() {
    var box = document.getElementById("scene4-box"), s4 = document.getElementById("scene4");
    if (!box || !s4) { return; }
    var ev = S.event, s = [];
    s.push('<defs><pattern id="hatch4" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="' + AMBER + '" stroke-width="1.2" opacity=".55"/></pattern>' +
           '<pattern id="warnhatch4" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="' + WARN + '" stroke-width="2"/></pattern></defs>');
    /* ground */
    s.push(rect(-400, 300, 2000, 400, GROUND) + line(-400, 300, 1600, 300, INK, 1.2, { op: .35 }));
    /* in a regional event the neighbouring lots are lost too — secondary context, no captions */
    if (ev) {
      [[20], [1050]].forEach(function (p) {
        s.push(rect(p[0], 250, 110, 50, "none", { stroke: WARN, sw: 2, dash: "8 6" }));
        s.push(line(p[0] + 18, 300, p[0] + 34, 272, WARN, 2, { op: .8 }) + line(p[0] + 78, 300, p[0] + 92, 276, WARN, 2, { op: .8 }));
      });
    }
    /* the two coordination paths, from the lead to each arrangement; the
       right-hand path arrives at the slab's near edge, never into the caption */
    var L = "M560 304 Q430 352 318 304", R = "M620 304 Q740 346 826 288";
    s.push('<path d="' + L + '" fill="none" stroke="' + PATH + '" stroke-width="26" stroke-linecap="round"/>');
    s.push('<path d="' + R + '" fill="none" stroke="' + PATH + '" stroke-width="26" stroke-linecap="round"' + (ev ? ' opacity=".55"' : "") + '/>');
    s.push('<path d="' + L + '" fill="none" stroke="' + AMBER + '" stroke-width="2" stroke-dasharray="6 6"/>');
    s.push('<path d="' + R + '" fill="none" stroke="' + AMBER + '" stroke-width="2" stroke-dasharray="6 6"' + (ev ? ' opacity=".45"' : "") + '/>');
    s.push('<polygon points="318,296 304,304 318,312" fill="' + AMBER + '"/>');
    if (!ev) { s.push('<polygon points="824,278 840,290 822,298" fill="' + AMBER + '"/>'); }
    /* the temporary home, lit */
    s.push('<g id="s4-subj-temp">' + smallHome(185, 196, { k: .48, lit: true }) + "</g>");
    /* the recovery lead */
    s.push('<g id="s4-subj-marta">' + figure(590, 302, { board: true, k: 1.15 }) + "</g>");
    /* the rebuild site: a cleared slab with the chosen plan standing on it as the instruction */
    s.push('<g id="s4-subj-site">');
    s.push(rect(830, 292, 262, 14, SLAB, { stroke: INK, sw: 1.6 }));
    [850, 905, 975, 1040].forEach(function (x, i) { s.push(line(x, 292, x + 18, 274 - (i % 2) * 8, INK, 1.8, { op: .5 })); });
    s.push(plan({ tx: 597, ty: 40, k: .42, ticks: false, edge: false, openings: true }).split("url(#hatch)").join("url(#hatch4)"));
    s.push("</g>");
    if (ev) {
      /* the barred path: the reserved start waits in the queue before it */
      s.push(rect(728, 312, 11, 40, "url(#warnhatch4)", { stroke: WARN, sw: 1.6 }));
      s.push('<g transform="translate(610,330) scale(.55)">' + timber(0, 0, { off: true }) + "</g>");
    } else {
      s.push('<g transform="translate(1092,262) scale(.55)">' + timber(0, 0) + "</g>");
    }
    s4.innerHTML = s.join("");
    /* labels and states, from the one state */
    var det = document.getElementById("s4-site-detail"), st = document.getElementById("s4-site-state"), cap = document.getElementById("s4-cap");
    if (det) { det.textContent = HOME_NAME[S.home] + " · Ardren & Sons"; }
    if (st) { st.dataset.kind = ev ? "queued" : "released"; st.textContent = ev ? "Reserved start queued" : "Reserved start released"; }
    if (cap) { cap.dataset.kind = ev ? "constrained" : "available"; cap.textContent = ev ? "Constrained" : "Available"; }
    /* the bounded scene frames the artwork band only (design y 140–430), so
       it never carries an empty sky above the subjects */
    if (!portrait) {
      var wrap = box.parentNode, h = wrap.clientHeight, w = wrap.clientWidth;
      var bw = Math.min(w, h * 1180 / 290), bh = bw * 290 / 1180;
      box.style.width = bw + "px"; box.style.height = bh + "px";
      s4.setAttribute("viewBox", "0 140 1180 290");
    } else {
      box.style.width = "100%"; box.style.height = (window.innerWidth * 290 / 820) + "px";
      s4.setAttribute("viewBox", "180 140 820 290");
      legend = Array.prototype.map.call(document.querySelectorAll(".s4-label"), function (p) {
        var em = p.querySelector("em"), sp = p.querySelector("span");
        /* the legend carries the label's own state wording, never a remapped one */
        return { title: p.querySelector("b").textContent, note: sp ? [sp.textContent] : [],
                 state: em ? em.dataset.kind : null, stateText: em ? em.textContent : null };
      });
    }
  }

  /* ── 5 · the chosen plan resolved into the home ──────────────────────── */
  function scene5() {
    var s = [sky({ sunX: 1010, sunY: 420, sunR: 170, warm: true })];
    s.push('<g opacity=".22">' + plan({ tx: 70, ticks: false }) + "</g>");
    s.push(path(DOOR_TX[S.home])); s.push(home({ tx: 70, lit: true }));
    /* the family on the path, nearly at the door: an adult with the case
       and a child, hand in hand */
    s.push(figure(664, 712, { case_: true, k: .95 }));
    s.push('<line x1="676" y1="684" x2="700" y2="694" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>');
    s.push(figure(708, 712, { k: .62 }));
    s.push(block(56, 82, 430, 150));
    return s.join("");
  }
  var SCENES = [scene1, scene2, scene3, scene4, scene5];

  /* the three ways home, drawn small inside their buttons */
  function paintOptions() {
    Array.prototype.forEach.call(document.querySelectorAll(".options [data-home]"), function (b) {
      var art = b.querySelector(".opt-art"); if (!art || art.firstChild) { return; }
      var h = b.dataset.home, k = scale; scale = 1;
      /* the thumbnail's ink and paper are variables, so a pressed button can
         swap them and the house stays legible on the dark ground */
      var art1 = home({ home: h, tree: false }).split(INK).join("var(--art-ink)").split(GARAGE).join("var(--art-ink)").split(PAPER).join("var(--art-paper)");
      art.innerHTML = '<svg viewBox="430 300 640 380" aria-hidden="true" focusable="false">' + art1 + "</svg>";
      scale = k;
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA — landscape fits the 1180×820 frame; portrait frames the
     property per screen and the page stacks and scrolls.
     ══════════════════════════════════════════════════════════════════════ */
  var REGION = {
    1: [{ x: 440, y: 40, w: 740, h: 720 }, { x: 330, y: 40, w: 850, h: 720 }],
    2: [{ x: 60, y: 230, w: 1120, h: 400 }, { x: 60, y: 220, w: 1120, h: 420 }],
    3: [{ x: 60, y: 230, w: 1120, h: 400 }, { x: 60, y: 220, w: 1120, h: 420 }],
    4: [{ x: 300, y: 230, w: 900, h: 560 }, { x: 240, y: 210, w: 960, h: 600 }],
    5: [{ x: 380, y: 240, w: 780, h: 560 }, { x: 300, y: 220, w: 860, h: 600 }]
  };
  function layout() {
    var W = window.innerWidth, H = window.innerHeight;
    portrait = W < 900 || W / H < 1.05;
    body.classList.toggle("portrait", portrait);
    if (!portrait) {
      var s = Math.min(W / 1180, H / 820), ox = (W - 1180 * s) / 2, oy = (H - 820 * s) / 2;
      scale = s;
      svg.setAttribute("viewBox", n1(-ox / s) + " " + n1(-oy / s) + " " + n1(W / s) + " " + n1(H / s));
      svg.style.height = "";
      root.style.setProperty("--s", s.toFixed(4)); root.style.setProperty("--sf", Math.max(s, 0.94).toFixed(4));
      root.style.setProperty("--ox", ox.toFixed(1) + "px"); root.style.setProperty("--oy", oy.toFixed(1) + "px");
    } else {
      var r = REGION[S.screen][W < 600 ? 0 : 1];
      svg.setAttribute("viewBox", r.x + " " + r.y + " " + r.w + " " + r.h);
      svg.style.height = (W * r.h / r.w).toFixed(1) + "px";
      scale = W / r.w;
    }
  }
  function annoPlan() {
    var p1 = document.getElementById("anno-plan-1"), p2 = document.getElementById("anno-plan-2"), ld = document.getElementById("lead-plan");
    if (!p1 || !portrait) { return; }
    var u = px(14), cx = 765;
    p2.setAttribute("x", cx); p2.setAttribute("y", n1(142 - u * 1.4)); p2.setAttribute("text-anchor", "middle");
    p1.setAttribute("x", cx); p1.setAttribute("y", n1(142 - u * 2.65)); p1.setAttribute("text-anchor", "middle");
    ld.setAttribute("x1", cx); ld.setAttribute("y1", 142); ld.setAttribute("x2", cx); ld.setAttribute("y2", n1(142 - u));
  }
  /* the legend: the same callouts, as readable HTML, under the scene */
  function paintLegend() {
    var ul = document.querySelector('.screen[data-screen="' + S.screen + '"] .legend');
    if (!ul) { return; }
    ul.innerHTML = "";
    ul.hidden = !portrait || !legend.length;
    legend.forEach(function (c) {
      var li = document.createElement("li");
      var h = "";
      if (c.eyebrow) { h += '<span class="lg-eb">' + c.eyebrow + "</span>"; }
      if (c.title) { h += '<span class="lg-t">' + c.title + "</span>"; }
      if (c.state) { h += '<span class="lg-s lg-s--' + c.state + '">' + (c.stateText || STATE_WORD[c.state]) + "</span>"; }
      (c.note || []).forEach(function (n) { h += '<span class="lg-n">' + n + "</span>"; });
      li.innerHTML = h; ul.appendChild(li);
    });
  }
  function draw() {
    layout(); legend = [];
    svg.innerHTML = defs() + SCENES[S.screen - 1]();
    if (S.screen === 4) { paintScene4(); }
    annoPlan(); paintLegend();
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREENS, CONTROLS, NAVIGATION
     ══════════════════════════════════════════════════════════════════════ */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var NEXT = ["Three commitments", "The loss", "The arrangement", "Home again", "Start again"];
  var prevBtn = document.getElementById("prev"), nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label"), picker = document.getElementById("picker");
  var announce = document.getElementById("announce"), status = document.getElementById("state-status");
  function say(m) { if (status) { status.textContent = m; } }
  var homeBtns = Array.prototype.slice.call(document.querySelectorAll(".options [data-home]"));
  var homeWord = Array.prototype.slice.call(document.querySelectorAll("[data-home-name]"));
  var agreeBtn = document.getElementById("agree"), sig = document.getElementById("sig");
  var evBtn = document.getElementById("event-toggle");
  var branch = Array.prototype.slice.call(document.querySelectorAll("[data-branch]"));

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1); o.textContent = (i + 1) + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  function paintControls() {
    body.setAttribute("data-home", S.home);
    homeBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.home === S.home ? "true" : "false"); });
    homeWord.forEach(function (e) { e.textContent = HOME_NAME[S.home]; });
    if (agreeBtn) { agreeBtn.setAttribute("aria-pressed", S.agreed ? "true" : "false"); agreeBtn.textContent = S.agreed ? "Agreed" : "Agree to the three commitments"; }
    if (sig) { if (S.agreed) { sig.removeAttribute("hidden"); } else { sig.setAttribute("hidden", ""); } }   /* an <svg> has no .hidden property */
    if (evBtn) { evBtn.setAttribute("aria-pressed", S.event ? "true" : "false"); }
    branch.forEach(function (e) { e.hidden = (e.dataset.branch === "event") !== S.event; });
  }
  homeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      S.home = b.dataset.home; save(); paintControls(); draw();
      say(HOME_NAME[S.home] + " chosen. " + HOME_LINE[S.home] + ". It carries through every later screen.");
    });
  });
  if (agreeBtn) {
    agreeBtn.addEventListener("click", function () {
      if (S.agreed) { return; }
      S.agreed = true; save(); paintControls(); draw();
      say("Agreed. Temporary living from the first night, " + HOME_NAME[S.home] + " with Ardren and Sons, and Marta coordinates.");
    });
  }
  if (evBtn) {
    evBtn.addEventListener("click", function () {
      S.event = !S.event; save(); paintControls(); draw();
      say(S.event ? "Regional event shown. Capacity constrained; the reserved start is queued, and extra payment does not buy priority. Temporary living, Marta and your plan continue."
                  : "Normal conditions restored. Capacity available; the reserved start released.");
    });
  }
  function reset() { S.home = "a"; S.agreed = false; S.event = false; clear(); paintControls(); show(1); say("Journey reset. Nothing chosen or agreed; normal conditions."); }
  var restart = document.getElementById("restart");
  if (restart) { restart.addEventListener("click", reset); }

  function show(n, push) {
    n = Math.max(1, Math.min(total, n));
    S.screen = n;
    screens.forEach(function (sc, i) { sc.hidden = (i + 1 !== n); });
    body.setAttribute("data-screen", String(n));
    prevBtn.disabled = n === 1; nextLabel.textContent = NEXT[n - 1]; picker.value = String(n);
    paintControls(); draw(); window.scrollTo(0, 0);
    var h = screens[n - 1].querySelector("h1, h2");
    announce.textContent = "Screen " + n + " of " + total + ". " + (h ? h.textContent.replace(/\s+/g, " ").trim() : "");
    if (push !== false) { try { history.replaceState(null, "", "#b/" + n); } catch (e) { /* file:// */ } }
  }
  prevBtn.addEventListener("click", function () { show(S.screen - 1); });
  nextBtn.addEventListener("click", function () { if (S.screen === total) { reset(); return; } show(S.screen + 1); });
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button" || tag === "a") { return; }
    if (e.key === "ArrowRight" && S.screen < total) { show(S.screen + 1); }
    if (e.key === "ArrowLeft") { show(S.screen - 1); }
  });
  /* #b/1..5 now; the old three-screen #s/1..3 map to the beat with the same
     idea — 1 before the loss → 1, 2 what is promised → 2, 3 the first days → 4 */
  function fromHash() {
    var m = /#b\/(\d)/.exec(location.hash); if (m) { return +m[1]; }
    var o = /#s\/(\d)/.exec(location.hash); if (o) { return { 1: 1, 2: 2, 3: 4 }[+o[1]] || 1; }
    return null;
  }
  window.addEventListener("hashchange", function () { var n = fromHash(); if (n !== null && n !== S.screen) { show(n, false); } });
  var pending; window.addEventListener("resize", function () { clearTimeout(pending); pending = setTimeout(draw, 90); });
  var skip = document.getElementById("skip");
  if (skip) { skip.addEventListener("click", function () { var h = screens[S.screen - 1].querySelector("h1, h2"); if (h) { h.focus(); } }); }

  load(); paintOptions();
  show(fromHash() || 1, false);
})();
