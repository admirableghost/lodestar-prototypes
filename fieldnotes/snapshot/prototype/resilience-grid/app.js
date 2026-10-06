/* ══════════════════════════════════════════════════════════════════════════
   Resilience Grid · 2036 prototype · Alder County
   No framework, no build step, no external request. Three files.

   Forked from prototype/micromutual/app.js. The navigation, the camera and
   the per-screen --fit search are that file's machinery, inherited
   deliberately — see design.md §2. What is new is the ground it draws and
   the five diagrams the concept needs.

   THE GROUND
   One invented county, drawn once in a single world space 1600 x 1000, with
   every screen a camera move over it. A ridge system, a canyon corridor, a
   transmission line crossing the saddle, four fire-district boundaries, three
   settlement clusters, and the network's own nodes.

   The settlements are drawn as CLUSTERS and never as addressable houses.
   The smallest thing this ground resolves is a cluster of dwellings.

   THE WORDS
   Every word on the terrain is SVG text at a fixed CSS px size with a paper
   halo, placed by one labeller that keeps it clear of the headline block,
   the controls, the chrome, the viewport edge and every other label. The
   copy is the locked contract (design-study/density-pass/SCREEN-COPY.md,
   WILDFIRE): the code adds no word that is not in it.

   WHAT IS INVENTED AND WHAT IS NOT
   Alder County, the Mill Creek lateral, the 14:31 fault and every time on
   screen 3 are invented, and the screens say so.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var W = 1600, H = 1000;

  var INK      = "#36414A",
      PAPER    = "#FBF9F1",
      RULE     = "#8A959C",
      CARRIER  = "#2F5E7C",
      UTILITY  = "#5B4E7A",
      FIRE     = "#9E4A14",
      PUBLIC   = "#2F5A44",
      VENDOR   = "#7A5A17",
      ALARM    = "#A33322",
      S3_HOLD  = "#A8502A";

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY — Alder County
     ══════════════════════════════════════════════════════════════════════ */

  var CREST = [[0,318],[150,292],[310,262],[470,276],[640,238],[800,252],
               [960,224],[1120,248],[1290,214],[1450,236],[1600,210]];

  /* Mill Creek canyon: a centreline with a width profile */
  var CREEK = [[986,266],[978,340],[966,420],[952,500],[940,578],[932,648]];
  var CREEK_W = [16, 26, 36, 44, 50, 54];

  var LINE = [[40,470],[200,452],[360,418],[520,372],[640,334],[800,352],
              [960,330],[1130,356],[1300,330],[1460,352],[1600,372]];
  /* the Mill Creek lateral — the spur that faults on screen 3 */
  var LATERAL = [[968,334],[984,402],[998,472],[1006,544],[1000,616]];

  var ROAD = [[60,842],[260,828],[470,836],[690,820],[900,832],[1120,818],
              [1340,830],[1560,816]];
  var MILLROAD = [[968,690],[974,748],[968,800],[972,830]];

  var DISTRICTS = [380, 762, 1142];

  var SETTLEMENTS = [
    { id: "alder", cx: 470,  cy: 762, rx: 168, ry: 70, n: 58 },
    { id: "mill",  cx: 962,  cy: 706, rx: 118, ry: 56, n: 34 },
    { id: "rim",   cx: 1344, cy: 700, rx: 132, ry: 58, n: 40 }
  ];

  /* network nodes. layer: which button on screen 2 lights them. */
  var NODES = [
    { k: "cam",  layer: "see",  x: 306,  y: 252 },
    { k: "cam",  layer: "see",  x: 700,  y: 226 },
    { k: "cam",  layer: "see",  x: 1186, y: 240 },
    { k: "gnd",  layer: "see",  x: 182,  y: 196 },
    { k: "gnd",  layer: "see",  x: 416,  y: 166 },
    { k: "gnd",  layer: "see",  x: 560,  y: 140 },
    { k: "gnd",  layer: "see",  x: 742,  y: 124 },
    { k: "gnd",  layer: "see",  x: 884,  y: 184 },
    { k: "gnd",  layer: "see",  x: 1024, y: 148 },
    { k: "gnd",  layer: "see",  x: 1226, y: 182 },
    { k: "gnd",  layer: "see",  x: 1442, y: 158 },
    { k: "line", layer: "see",  x: 360,  y: 418 },
    { k: "line", layer: "see",  x: 640,  y: 334 },
    { k: "line", layer: "see",  x: 960,  y: 330 },
    { k: "line", layer: "see",  x: 1300, y: 330 },
    { k: "stn",  layer: "act",  x: 298,  y: 868 },
    { k: "stn",  layer: "act",  x: 702,  y: 848 },
    { k: "stn",  layer: "act",  x: 1032, y: 806 },
    { k: "stn",  layer: "act",  x: 1386, y: 838 },
    { k: "pad",  layer: "act",  x: 1006, y: 772 },
    { k: "pad",  layer: "act",  x: 426,  y: 884 }
  ];
  var HUB = { x: 800, y: 520 };

  /* the ignition, on the lateral at the canyon head */
  var IGNITION = { x: 992, y: 400 };

  /* ══════════════════════════════════════════════════════════════════════
     CAMERAS
     ══════════════════════════════════════════════════════════════════════ */

  var CAM = {
    county:  { x: 40,  y: 110, w: 1520, h: 820 },
    network: { x: 90,  y: 100, w: 1420, h: 790 },
    /* screen 3 is framed for the right two thirds: the canyon, Mill Creek,
       the road out, the pad and the decision point. 1124 x 781 is the
       1180 x 820 aspect at ~1.05 px per world unit. */
    ignite:  { x: 418, y: 135, w: 1124, h: 781 },
    flows:   { x: 120, y: 180, w: 1380, h: 740 },
    payoff:  { x: 40,  y: 110, w: 1520, h: 820 }
  };
  /* narrow: the blocks stack from the top and the county shows through
     whatever is left, so every view is pulled wider */
  var CAM_N = {
    county:  { x: 120, y: 240, w: 1360, h: 700 },
    network: { x: 140, y: 150, w: 1320, h: 760 },
    ignite:  { x: 760, y: 170, w: 640,  h: 680 },
    flows:   { x: 160, y: 300, w: 1300, h: 660 },
    payoff:  { x: 120, y: 240, w: 1360, h: 700 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }
  function isPhone()  { return window.matchMedia("(max-width: 599px)").matches; }

  var svg = document.getElementById("plan");
  var worldEl = document.getElementById("world");
  var vb = null, camTimer = 0;

  function path(pts, close) {
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i - 1], c = pts[i];
      var mx = (p[0] + c[0]) / 2, my = (p[1] + c[1]) / 2;
      d += "Q" + p[0] + " " + p[1] + " " + mx + " " + my;
    }
    d += "L" + pts[pts.length - 1][0] + " " + pts[pts.length - 1][1];
    return d + (close ? "Z" : "");
  }
  function offset(pts, dy) {
    return pts.map(function (p) { return [p[0], p[1] + dy]; });
  }
  function n1(v) { return (+v).toFixed(1); }

  /* deterministic scatter, so the county redraws identically every time */
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 1103515245 + 12345) % 2147483648; return (s % 10000) / 10000; };
  }

  var DWELL = (function () {
    var out = {};
    SETTLEMENTS.forEach(function (s, si) {
      var r = rng(97 + si * 31), a = [];
      for (var i = 0; i < s.n; i++) {
        var u = r() * 2 - 1, v = r() * 2 - 1;
        if (u * u + v * v > 1) { u *= 0.72; v *= 0.72; }
        a.push([s.cx + u * s.rx, s.cy + v * s.ry, r() > 0.5 ? 1 : 0]);
      }
      out[s.id] = a;
    });
    return out;
  })();

  function crestY(x) {
    for (var i = 1; i < CREST.length; i++) {
      if (x <= CREST[i][0]) {
        var a = CREST[i - 1], b = CREST[i];
        var t = (x - a[0]) / (b[0] - a[0]);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return CREST[CREST.length - 1][1];
  }

  var TREES = (function () {
    var r = rng(4242), a = [], i, x, y, crest;
    for (i = 0; i < 230; i++) {
      x = r() * W; crest = crestY(x);
      y = r() * (crest - 40) + 18;
      a.push([x, y, 4 + r() * 5]);
    }
    for (i = 0; i < 120; i++) {
      x = r() * W; crest = crestY(x);
      y = crest + 26 + r() * 240;
      a.push([x, y, 3 + r() * 3.5]);
    }
    return a;
  })();

  function nodeGlyph(n, on) {
    var c = n.k === "line" ? UTILITY : (n.k === "stn" || n.k === "pad") ? FIRE : VENDOR;
    var o = on ? 1 : 0.16;
    var g = '<g opacity="' + o + '" style="transition:opacity .5s linear">';
    if (n.k === "cam") {
      g += '<line x1="' + n.x + '" y1="' + n.y + '" x2="' + n.x + '" y2="' + (n.y + 16) +
           '" stroke="' + c + '" stroke-width="2"/>' +
           '<path d="M' + (n.x - 8) + " " + n.y + "L" + (n.x + 8) + " " + n.y +
           "L" + n.x + " " + (n.y - 12) + 'Z" fill="' + c + '"/>';
    } else if (n.k === "gnd") {
      g += '<circle cx="' + n.x + '" cy="' + n.y + '" r="4.5" fill="' + c + '"/>';
    } else if (n.k === "line") {
      g += '<rect x="' + (n.x - 6) + '" y="' + (n.y - 6) + '" width="12" height="12" rx="1.5" fill="' + c + '"/>';
    } else if (n.k === "stn") {
      g += '<rect x="' + (n.x - 9) + '" y="' + (n.y - 9) + '" width="18" height="18" rx="3" fill="' + PAPER +
           '" stroke="' + c + '" stroke-width="2"/>' +
           '<path d="M' + n.x + " " + (n.y - 5) + "V" + (n.y + 5) + "M" + (n.x - 5) + " " + n.y + "H" + (n.x + 5) +
           '" stroke="' + c + '" stroke-width="2"/>';
    } else if (n.k === "pad") {
      g += '<circle cx="' + n.x + '" cy="' + n.y + '" r="10" fill="' + PAPER + '" stroke="' + c + '" stroke-width="2"/>' +
           '<path d="M' + (n.x - 5) + " " + (n.y + 2) + "L" + n.x + " " + (n.y - 4) + "L" + (n.x + 5) + " " + (n.y + 2) +
           '" fill="none" stroke="' + c + '" stroke-width="2"/>';
    }
    return g + "</g>";
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited from micromutual/app.js)
     ══════════════════════════════════════════════════════════════════════ */

  function setVB(c) {
    svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h);
    vb = c;
  }

  /* "this region must be visible" -> a viewBox for an SVG that is bigger
     than the viewport and uses `slice`. `fit` says which part of the
     viewport the subject has to land in (the strip under the blocks on a
     narrow stage). */
  function viewBoxFor(view, fit) {
    var el = worldEl.getBoundingClientRect();
    var vpW = window.innerWidth, vpH = window.innerHeight;
    var scale = Math.min(vpW / view.w, (fit ? fit.h : vpH) / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2;
    var wcy = view.y + view.h / 2 + (fit ? (vpH / 2 - fit.cy) / scale : 0);
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }

  function narrowFit() {
    if (!narrow) { return null; }
    var sc = screens && screens[current - 1];
    if (!sc) { return null; }
    var gw = sc.querySelector(".gw");
    if (gw) {
      var g = gw.getBoundingClientRect();
      var top = Math.max(0, g.top), bot = Math.min(window.innerHeight, g.bottom);
      if (bot - top > 110) { return { cy: (top + bot) / 2, h: bot - top }; }
    }
    var bottom = 0;
    Array.prototype.forEach.call(sc.children, function (p) {
      if (p.classList.contains("gw")) { return; }
      var r = p.getBoundingClientRect();
      if (r.height > 4 && r.top < window.innerHeight * 0.85) { bottom = Math.max(bottom, r.bottom); }
    });
    bottom = Math.max(0, Math.min(bottom + 12, window.innerHeight - 180));
    return { cy: (bottom + window.innerHeight) / 2, h: window.innerHeight - bottom };
  }

  function targetCam(name) {
    return viewBoxFor((narrow && CAM_N[name]) || CAM[name] || CAM.county, narrowFit());
  }

  function moveCamera(name, instant) {
    var target = targetCam(name);
    if (!vb || instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVB(target); return;
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
      if (u < 1) { camTimer = requestAnimationFrame(step); }
    })(t0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     LABELS — real SVG text, fixed CSS px, paper halo, never under a block

     frame(cam)  world -> screen projection at this screen's TARGET camera,
                 the rectangles a label must keep clear of, and the world
                 bounds of the viewport
     labeller    tries the authored side; if that sits under a block, off
                 the stage or on another label, mirrors it; if both fail the
                 marker stays and the words go (the screen reader still has
                 them). Labels are drawn in world units scaled by `upp`, so
                 they render at exactly SIZE px at the target camera.
     ══════════════════════════════════════════════════════════════════════ */

  var FONT = 'font-family="Bricolage, Helvetica Neue, Arial, sans-serif"';

  function frame(camName) {
    var wr = worldEl.getBoundingClientRect();
    var camT = targetCam(camName);
    var upp = (wr.width && camT.w) ? camT.w / wr.width : 1;
    var sc = screens && screens[current - 1];
    var boxes = [];
    if (sc) {
      Array.prototype.forEach.call(
        sc.querySelectorAll(".xhead > *, .wf-chips, .wf-micro, .xask, .s3-ctl"), function (p) {
          var r = p.getBoundingClientRect();
          if (r.width > 2 && r.height > 2) { boxes.push(r); }
        });
    }
    Array.prototype.forEach.call(document.querySelectorAll(".chrome button, .chrome select"), function (p) {
      boxes.push(p.getBoundingClientRect());
    });
    var toWorld = function (sx, sy) { return [camT.x + (sx - wr.left) * upp, camT.y + (sy - wr.top) * upp]; };
    var tl = toWorld(0, 0), br = toWorld(window.innerWidth, window.innerHeight);
    return {
      upp: upp, boxes: boxes, placed: [],
      size: isPhone() ? 14 : 16,
      vis: { x0: tl[0], y0: tl[1], x1: br[0], y1: br[1] },
      proj: function (wx, wy) { return [wr.left + (wx - camT.x) / upp, wr.top + (wy - camT.y) / upp]; }
    };
  }

  /* lines: [[text, "b"|"r", colour?], ...]  b = bold, r = regular */
  /* labels the labeller could not place on the last draw — for QA */
  var dropped = [];

  function labeller(s, f) {
    var px = function (n) { return n * f.upp; };
    dropped = [];
    var SZ = f.size, LH = SZ * 1.3;
    function textW(t, k) { return t.length * SZ * (k === "b" ? 0.60 : 0.54) + 4; }
    function box(wx, wy, lines, dx, dy, anc) {
      var p = f.proj(wx, wy), w = 0, h = lines.length * LH;
      lines.forEach(function (l) { w = Math.max(w, textW(l[0], l[1])); });
      var x = anc === "end" ? p[0] + dx - w : anc === "middle" ? p[0] + dx - w / 2 : p[0] + dx;
      return { left: x, right: x + w, top: p[1] + dy - 2, bottom: p[1] + dy + h + 2 };
    }
    function hits(r, b, m) {
      return r.left < b.right + m && r.right > b.left - m && r.top < b.bottom + m && r.bottom > b.top - m;
    }
    function occluded(r) {
      if (r.left < 6 || r.right > window.innerWidth - 6 || r.top < 6 || r.bottom > window.innerHeight - 6) { return true; }
      var i;
      for (i = 0; i < f.boxes.length; i++) { if (hits(r, f.boxes[i], 8)) { return true; } }
      for (i = 0; i < f.placed.length; i++) { if (hits(r, f.placed[i], 2)) { return true; } }
      return false;
    }
    function place(wx, wy, lines, dx, dy, anc) {
      var h = lines.length * LH;
      var anc2 = anc === "end" ? "start" : anc === "start" ? "end" : "middle";
      /* the authored side; mirrored; the other side vertically; then
         centred above and below the point */
      var tries = [
        [dx, dy, anc], [-dx, dy, anc2], [dx, -dy - h, anc],
        [0, -h - 16, "middle"], [0, 16, "middle"]
      ];
      for (var i = 0; i < tries.length; i++) {
        var t = tries[i], r = box(wx, wy, lines, t[0], t[1], t[2]);
        if (!occluded(r)) { return { dx: t[0], dy: t[1], anc: t[2], r: r }; }
      }
      return null;
    }
    return function (wx, wy, lines, dx, dy, anc) {
      var pl = place(wx, wy, lines, dx, dy, anc);
      if (!pl) { dropped.push(lines.map(function (l) { return l[0]; }).join(" / ")); return false; }
      f.placed.push(pl.r);
      var y = wy + px(pl.dy), x = wx + px(pl.dx);
      lines.forEach(function (l) {
        y += px(LH);
        s.push('<text class="lab" x="' + n1(x) + '" y="' + n1(y - px(LH * 0.28)) + '" text-anchor="' + pl.anc + '" ' + FONT +
               ' font-size="' + n1(px(SZ)) + '" font-weight="' + (l[1] === "b" ? 700 : 400) + '"' +
               ' paint-order="stroke" stroke="' + PAPER + '" stroke-width="' + n1(px(4.5)) + '" stroke-linejoin="round" fill="' + (l[2] || INK) + '">' +
               l[0] + '</text>');
      });
      return true;
    };
  }

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE COUNTY
       opts.layers    — { see, know, act, fund }
       opts.retreat   — screen 1: the market boundary, pulled down-valley
       opts.network   — screen 2: the standing network joined into a system
       opts.s3        — screen 3: the event (see drawS3)
       opts.flows     — screen 4: four payers converging on one business
       opts.market    — screen 5: both boundaries at once
       opts.f         — the label frame for this screen
     ══════════════════════════════════════════════════════════════════════ */

  /* the capacity boundary — a line the market draws across the county.
     It sits below the ridge and is pushed further down-valley the more the
     market retreats; the canyon is always the worst of it. */
  function capacityPath(pull) {
    var pts = [], x;
    for (x = -40; x <= W + 40; x += 40) {
      var canyon = Math.exp(-Math.pow((x - IGNITION.x) / 300, 2)) * 120;
      pts.push([x, crestY(x) + 120 + pull * (210 + canyon)]);
    }
    return pts;
  }
  function capacityY(x, pull) {
    return crestY(x) + 120 + pull * (210 + Math.exp(-Math.pow((x - IGNITION.x) / 300, 2)) * 120);
  }
  /* the three states the boundary can be in — the words are the contract's */
  var MARKET = [
    { pull: 1,    label: "Retreating",        c: ALARM  },
    { pull: 0.62, label: "Managed",           c: VENDOR },
    { pull: 0.28, label: "Potentially viable", c: PUBLIC }
  ];

  function renderCounty(opts) {
    opts = opts || {};
    var L = opts.layers || {};
    var s = [];
    var label = opts.f ? labeller(s, opts.f) : null;

    s.push('<defs>' +
      '<marker id="arrIn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0 0L10 5L0 10Z" fill="currentColor" opacity=".9"/></marker>' +
      '<marker id="arrUp" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
        '<path d="M0 0L10 5L0 10Z" fill="#2F5A44"/></marker>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#EFEDE4"/><stop offset="1" stop-color="#F7F5EC"/></linearGradient>' +
      '<radialGradient id="heat" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0" stop-color="' + ALARM + '" stop-opacity=".40"/>' +
        '<stop offset="1" stop-color="' + ALARM + '" stop-opacity="0"/></radialGradient>' +
      /* the torn edge behind every headline block (applied from CSS) and
         the hatch for a locked-out recloser */
      '<filter id="s3-rough" x="-4%" y="-6%" width="108%" height="112%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9" result="w"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      '<pattern id="s3-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
        '<line x1="0" y1="0" x2="0" y2="5" stroke="' + S3_HOLD + '" stroke-width="1.4"/></pattern>' +
      '</defs>');

    /* ── grounds: back country, slope, valley ── */
    /* the grounds run far past the world, so a portrait camera that sees
       more than the county never shows the page behind it */
    s.push('<rect x="-2000" y="-2000" width="' + (W + 4000) + '" height="' + (H + 4000) + '" fill="url(#sky)"/>');
    s.push('<path d="' + path(CREST) + "L" + W + " -2000L-2000 -2000L-2000 " + CREST[0][1] + "Z" + '" fill="#E8E7DC"/>');
    [34, 72, 116, 168, 228].forEach(function (dy, i) {
      s.push('<path d="' + path(offset(CREST, dy)) + '" fill="none" stroke="' + RULE +
             '" stroke-width="1" opacity="' + (0.30 - i * 0.045).toFixed(2) + '"/>');
    });
    s.push('<path d="' + path(CREST) + '" fill="none" stroke="' + RULE + '" stroke-width="2.2" opacity=".62"/>');
    s.push('<path d="' + path(offset(CREST, 380)) + "L" + W + " " + (H + 2000) + "L-2000 " + (H + 2000) + "L-2000 " + (CREST[0][1] + 380) + "Z" +
           '" fill="#F3F1E6"/>');

    TREES.forEach(function (t) {
      s.push('<circle cx="' + t[0].toFixed(1) + '" cy="' + t[1].toFixed(1) + '" r="' + t[2].toFixed(1) +
             '" fill="' + PUBLIC + '" opacity=".16"/>');
    });

    /* ── the canyon: a shaded drainage ── */
    var cl = CREEK.map(function (p, i) { return [p[0] - CREEK_W[i], p[1]]; });
    var cr = CREEK.map(function (p, i) { return [p[0] + CREEK_W[i], p[1]]; }).reverse();
    s.push('<path d="' + path(cl.concat(cr), true) + '" fill="#E9E6DA" opacity=".72"/>');
    s.push('<path d="' + path(cl) + '" fill="none" stroke="' + RULE + '" stroke-width="1.1" opacity=".52"/>');
    s.push('<path d="' + path(CREEK.map(function (p, i) { return [p[0] + CREEK_W[i], p[1]]; })) +
           '" fill="none" stroke="' + RULE + '" stroke-width="1.1" opacity=".52"/>');
    s.push('<path d="' + path(CREEK) + '" fill="none" stroke="' + CARRIER + '" stroke-width="1.6" opacity=".34"/>');

    DISTRICTS.forEach(function (x) {
      s.push('<line x1="' + x + '" y1="' + (crestY(x) - 10) + '" x2="' + (x + 26) + '" y2="' + H +
             '" stroke="' + FIRE + '" stroke-width="1.4" stroke-dasharray="3 9" opacity=".44"/>');
    });

    s.push('<path d="' + path(ROAD) + '" fill="none" stroke="' + PAPER + '" stroke-width="9"/>');
    s.push('<path d="' + path(ROAD) + '" fill="none" stroke="' + RULE + '" stroke-width="1.5" opacity=".7"/>');
    s.push('<path d="' + path(MILLROAD) + '" fill="none" stroke="' + PAPER + '" stroke-width="7"/>');
    s.push('<path d="' + path(MILLROAD) + '" fill="none" stroke="' + RULE + '" stroke-width="1.4" opacity=".7"/>');

    SETTLEMENTS.forEach(function (st) {
      if (opts.market) {
        s.push('<ellipse cx="' + st.cx + '" cy="' + st.cy + '" rx="' + (st.rx + 22) + '" ry="' + (st.ry + 20) +
               '" fill="' + PUBLIC + '" opacity=".09"/>');
      }
      DWELL[st.id].forEach(function (d) {
        var w = d[2] ? 9 : 7.5;
        s.push('<rect x="' + (d[0] - w / 2).toFixed(1) + '" y="' + (d[1] - w / 2).toFixed(1) +
               '" width="' + w + '" height="' + w + '" rx="1" fill="' + INK + '" opacity=".46"/>');
      });
    });

    /* ── the transmission line, the lateral, the satellite pass ── */
    s.push('<path d="' + path(LINE) + '" fill="none" stroke="' + UTILITY +
           '" stroke-width="2" opacity="' + (L.see ? ".72" : ".30") + '" style="transition:opacity .5s"/>');
    s.push('<path d="' + path(LATERAL) + '" fill="none" stroke="' + UTILITY +
           '" stroke-width="1.6" stroke-dasharray="7 5" opacity="' + (L.see ? ".66" : ".26") +
           '" style="transition:opacity .5s"/>');
    s.push('<path d="M-120 150Q' + (W / 2) + ' -70 ' + (W + 120) + ' 164" fill="none" stroke="' + VENDOR +
           '" stroke-width="1.6" stroke-dasharray="14 10" opacity="' + (L.see ? ".60" : ".10") +
           '" style="transition:opacity .5s"/>');

    /* ── network nodes ── */
    NODES.forEach(function (n) {
      s.push(nodeGlyph(n, n.layer === "see" ? !!L.see : !!L.act));
    });

    /* ══ screens 1 and 5: the market boundary ══ */
    if (opts.retreat || opts.market) {
      /* the ground the market has walked away from, shaded as risk */
      s.push('<path d="' + path(capacityPath(1), false) +
             ' L' + (W + 40) + ' -80 L-40 -80 Z" fill="' + ALARM + '" opacity=".10"/>');
      /* the two other positions the line could hold, as hairlines */
      MARKET.forEach(function (m) {
        var solid = opts.market ? m.pull === 0.28 : m.pull === 1;
        if (solid) { return; }
        s.push('<path d="' + path(capacityPath(m.pull), false) + '" fill="none" stroke="' + m.c +
               '" stroke-width="1.6" stroke-dasharray="2 7" opacity=".7"/>');
      });
      if (opts.market) {
        /* screen 5: both boundaries at once, so the movement IS the image */
        s.push('<path d="' + path(capacityPath(0.28), false) +
               ' L' + (W + 40) + ' ' + (H + 80) + ' L-40 ' + (H + 80) + ' Z" fill="' + PUBLIC + '" opacity=".07"/>');
        s.push('<path d="' + path(capacityPath(0.28), false) + '" fill="none" stroke="' + PUBLIC +
               '" stroke-width="5" opacity=".95"/>');
        for (var ax = 180; ax < W; ax += 300) {
          s.push('<line x1="' + ax + '" y1="' + n1(capacityY(ax, 1)) + '" x2="' + ax + '" y2="' + n1(capacityY(ax, 0.28) + 16) +
                 '" stroke="' + PUBLIC + '" stroke-width="3" opacity=".75" marker-end="url(#arrUp)"/>');
        }
        s.push('<path d="' + path(capacityPath(1), false) + '" fill="none" stroke="' + ALARM +
               '" stroke-width="4" stroke-dasharray="14 10" opacity=".9"/>');
      } else {
        s.push('<path d="' + path(capacityPath(1), false) + '" fill="none" stroke="' + ALARM +
               '" stroke-width="4" opacity=".9"/>');
      }
      if (label) {
        /* the three words sit on their lines at the right of the stage */
        var lx = Math.min(W - 20, opts.f.vis.x1 - 18 * opts.f.upp);
        /* a phone draws the three lines ~23px apart, so the third word
           takes the left edge instead of the right */
        var lx0 = Math.max(20, opts.f.vis.x0 + 18 * opts.f.upp);
        MARKET.forEach(function (m) {
          var on = opts.market ? m.pull === 0.28 : m.pull === 1;
          var left = isPhone() && m.pull === 0.28;
          var x = left ? lx0 : lx;
          label(x, capacityY(x, m.pull), [[m.label, on ? "b" : "r", m.c]], 0, -24, left ? "start" : "end");
        });
      }
    }

    /* ══ screen 2: the standing network, joined into a system ══ */
    if (opts.network) {
      if (L.fund) {
        NODES.forEach(function (n) {
          if (!L[n.layer]) { return; }
          s.push('<line x1="' + n.x + '" y1="' + n.y + '" x2="' + HUB.x + '" y2="' + HUB.y +
                 '" stroke="' + CARRIER + '" stroke-width="1.3" opacity=".30"/>');
        });
      }
      if (L.know) {
        s.push('<circle cx="' + HUB.x + '" cy="' + HUB.y + '" r="26" fill="' + PAPER + '" stroke="' + CARRIER + '" stroke-width="3"/>');
        s.push('<circle cx="' + HUB.x + '" cy="' + HUB.y + '" r="9" fill="' + CARRIER + '"/>');
      }
      if (label) {
        if (L.see) {
          label(1186, 240, [["Camera", "b", VENDOR]], 16, -18, "start");
          label(360, 418, [["Line sensor", "b", UTILITY]], 0, -32, "start");
        }
        if (L.act) {
          label(1032, 806, [["Station", "b", FIRE]], 18, -10, "start");
          label(1006, 772, [["Suppression pad", "b", FIRE]], 20, -8, "start");
        }
        if (L.know) {
          label(HUB.x, HUB.y, [["Operations", "b", CARRIER]], 0, 32, "middle");
        }
      }
    }

    /* ══ screen 3: the event ══ */
    if (opts.s3) { drawS3(s, opts.s3, label); }

    /* ══ screen 4: four payers converging on one operating business ══ */
    if (opts.flows) {
      /* four payers around one business. A phone has no width for two
         labels side by side, so there the payers stand in a column and
         the business sits to their right. */
      var phone = isPhone();
      var core = phone ? { x: 1150, y: 1080 } : { x: 810, y: 600 };
      var PAYERS = [
        { x: 360,  y: 400, c: UTILITY, t: "Utility",         why: "avoided outage" },
        { x: 1260, y: 400, c: PUBLIC,  t: "Public agencies", why: "regional resilience" },
        { x: 360,  y: 800, c: FIRE,    t: "Property owners", why: "a maintained perimeter" },
        { x: 1260, y: 800, c: CARRIER, t: "Insurer",         why: "verified change in risk" }
      ];
      if (phone) {
        PAYERS.forEach(function (q, i) { q.x = 300; q.y = 240 + i * 210; });
      }
      PAYERS.forEach(function (q) {
        var bend = phone ? 0 : (q.y < core.y ? 70 : -70);
        s.push('<path d="M' + q.x + ' ' + q.y + ' Q' + ((q.x + core.x) / 2) + ' ' +
               ((q.y + core.y) / 2 + bend) + ' ' + core.x + ' ' + core.y +
               '" fill="none" stroke="' + q.c + '" stroke-width="4" opacity=".62" marker-end="url(#arrIn)"/>');
        s.push('<circle cx="' + q.x + '" cy="' + q.y + '" r="17" fill="' + PAPER +
               '" stroke="' + q.c + '" stroke-width="3.4"/>');
      });
      s.push('<circle cx="' + core.x + '" cy="' + core.y + '" r="44" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="3.5"/>');
      s.push('<circle cx="' + core.x + '" cy="' + core.y + '" r="15" fill="' + INK + '"/>');
      if (label) {
        PAYERS.forEach(function (q) {
          var left = q.x < core.x;
          label(q.x, q.y, [[q.t, "b", q.c], [q.why, "r"]], left ? 28 : -28, -22, left ? "start" : "end");
        });
        label(core.x, core.y, [["Operating business", "b"]], 0, 50, "middle");
      }
    }

    svg.innerHTML = s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — the network layers
     ══════════════════════════════════════════════════════════════════════ */

  /* one polite live region for state changes that are not screen changes */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  var layerOrder = ["see", "know", "act", "fund"];
  /* all four start ON: the argument of this screen is that all four layers
     already exist. The buttons turn them OFF, which shows what the network
     is missing without one of them. */
  var layerOn = { see: true, know: true, act: true, fund: true };
  var revealAll = document.getElementById("reveal-all");

  function paintLayers() {
    layerOrder.forEach(function (k) {
      var b = document.querySelector('[data-layer="' + k + '"]');
      if (b) { b.setAttribute("aria-pressed", layerOn[k] ? "true" : "false"); }
    });
    var allOn = layerOrder.every(function (k) { return layerOn[k]; });
    if (revealAll) { revealAll.disabled = allOn; }
    if (current === 2) { drawFor(2); }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-layer]"), function (b) {
    b.addEventListener("click", function () {
      var k = b.dataset.layer;
      layerOn[k] = !layerOn[k];
      paintLayers();
      var off = layerOrder.filter(function (x) { return !layerOn[x]; });
      var names = { see: "sensing", know: "the operations hub", act: "the response", fund: "the funding that joins the pieces" };
      say(b.textContent.trim() + " layer " + (layerOn[k] ? "shown" : "switched off") + ". " +
          (off.length ? "Without " + off.map(function (x) { return names[x]; }).join(" and ") + ", the rest is an expensive way to watch."
                      : "All four layers shown."));
    });
  });

  /* "Show all four" RESTORES; it only ever turns layers on, and disables
     itself once there is nothing left to restore. */
  if (revealAll) {
    revealAll.addEventListener("click", function () {
      layerOrder.forEach(function (k) { layerOn[k] = true; });
      paintLayers();
      say("All four layers shown.");
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the moment: eight events, three stages, one human decision

     THE DATA. Every time, place and authority class on this screen comes
     from S3_EVENTS, and nothing else on the screen is allowed to restate
     it. The map draws from it; the screen reader hears it in full; the
     facilitator notes copy it. Kinds:
       obs  observed       — a sensor, a camera, a satellite
       act  bounded action — pre-authorised, narrow, already agreed
       mod  model forecast — a forecast is not a decision
       dec  human decision — consequential, and the network cannot make it
     Nothing here executes the human decision, and nothing marks the record
     as proof of avoided loss. The carrier commands nothing in this scene.

     THE STAGES. The replay plays the eight events in order, but the viewer
     is only ever asked to read ONE stage of words at a time: the stage in
     progress carries its labels; earlier stages collapse to their marks.
     The static default is the end state (stage 3, decision pending) —
     complete without pressing anything. "Show all" is the same scene with
     one grouped caption per stage.
     ══════════════════════════════════════════════════════════════════════ */

  var S3_EVENTS = [
    { n: 1, stage: 1, kind: "obs", t: "14:31", who: "Line sensor, Mill Creek lateral",
      what: ["Fault signature on the span.", "A flag, not yet a fire."],
      state: "Observed", at: [960, 330],
      lab: [["Line sensor 14:31", "b"]], dx: 22, dy: -30, anc: "start" },
    { n: 2, stage: 1, kind: "obs", t: "14:33", who: "Ridge camera, Alder Peak",
      what: ["Smoke at the same span."],
      state: "Observed", at: [1186, 240],
      lab: [["Ridge camera 14:33", "b"]], dx: 22, dy: -10, anc: "start" },
    { n: 3, stage: 1, kind: "obs", t: "14:34", who: "Thermal satellite pass",
      what: ["Heat at the same coordinates.", "Ignition treated as verified."],
      state: "Observed", at: [992, 190],
      lab: [["Satellite 14:34", "b"]], dx: 22, dy: -12, anc: "start" },
    { n: 4, stage: 2, kind: "act", t: "14:36", who: "Utility grid operations",
      what: ["Lateral de-energised. Reclosers locked out on two adjacent feeders."],
      state: "Pre-authorised, bounded action", at: [1130, 356],
      lab: [["Lateral de-energised 14:36", "b"]], dx: 22, dy: -24, anc: "start" },
    { n: 5, stage: 2, kind: "mod", t: "14:38", who: "Spread model",
      what: ["Canyon corridor run. The head turns toward the 320 homes above Mill Creek."],
      state: "Model forecast, not a decision", at: [900, 540],
      lab: [["Spread model 14:38", "b"], ["forecast", "r", FIRE]], dx: -22, dy: -14, anc: "end" },
    { n: 6, stage: 2, kind: "act", t: "14:41", who: "Fire District 3",
      what: ["Two engines to the canyon mouth. The one road out held open."],
      state: "Bounded action", at: [934, 652],
      lab: [["Engines 14:41", "b"]], dx: -22, dy: -12, anc: "end" },
    { n: 7, stage: 2, kind: "act", t: "14:43", who: "Autonomous suppression",
      what: ["Four aircraft launched from the Mill Creek pad. One operator."],
      state: "Bounded action; launched is not drop approved", at: [1006, 772],
      lab: [["Aircraft launched 14:43", "b"]], dx: 30, dy: -34, anc: "start" },
    { n: 8, stage: 3, kind: "dec", t: "14:47", who: "Duty chief, District 3",
      what: ["Holds or releases the evacuation of 320 homes.", "Signs off on the drop over occupied parcels.", "The network cannot make either call."],
      state: "Decision, human, pending", at: [1124, 566] }
  ];
  var S3_STAGES = [
    { n: 1, from: 1, to: 3, title: "Signals are corroborated",
      note: "Three sources, different physics, one span. Ignition treated as verified at 14:34.",
      cap: { lines: [["Signals corroborated", "b"]], at: [992, 400], dx: 24, dy: -8, anc: "start" } },
    { n: 2, from: 4, to: 7, title: "Bounded response is underway",
      note: "Pre-authorised and narrow: the lateral is de-energised, two engines hold the one road out, four aircraft hold. The spread run is a forecast, not a decision.",
      cap: { lines: [["Bounded response underway", "b"]], at: [968, 696], dx: -22, dy: 10, anc: "end" } },
    { n: 3, from: 8, to: 8, title: "Consequential decisions remain human",
      note: "The evacuation of 320 homes and the drop over occupied parcels wait on the duty chief. The network cannot make either call. Decision, human, pending.",
      cap: null }
  ];
  function s3StageOf(step) { return step <= 3 ? 1 : step <= 7 ? 2 : 3; }

  /* "Show all": one grouped marker per stage. The decision group shares
     the duty chief's label (see S3_PLACES). */
  var S3_GROUPS = [
    { at: [992, 190],  lines: [["Signals 14:31–14:34", "b"]],  dx: 22, dy: -12, anc: "start" },
    { at: [1130, 356], lines: [["Response 14:36–14:43", "b"]], dx: 22, dy: -24, anc: "start" }
  ];

  /* the end state's words (stage 3, the default): places and the two paths
     that wait on one person. `from` is the step they appear at. */
  var S3_PLACES = [
    { id: "mill",  from: 8, at: [842, 736],  dx: -6,  dy: -18, anc: "end",
      lines: [["Mill Creek", "b"], ["320 homes", "r"]] },
    { id: "road",  from: 8, at: [968, 800],  dx: -16, dy: -12, anc: "end",
      lines: [["Road held open", "b", PUBLIC]] },
    { id: "air",   from: 8, at: [1100, 650], dx: 18,  dy: -4,  anc: "start",
      lines: [["Aircraft holding", "b"]] },
    { id: "evac",  from: 8, at: [968, 696],  dx: -22, dy: -12, anc: "end",
      lines: [["Evacuation", "b"]] },
    { id: "drop",  from: 8, at: [972, 636],  dx: 0,   dy: -50, anc: "middle",
      lines: [["Suppression drop", "b"]] },
    { id: "chief", from: 8, at: [1124, 566], dx: 40,  dy: -34, anc: "start",
      lines: [["Duty chief", "b"], ["approval required", "r"]],
      all:   [["Decision 14:47 · pending", "b"], ["Duty chief", "b"], ["approval required", "r"]] }
  ];

  /* scene geometry, world units */
  var S3_WEDGE  = "M992 400 Q1040 476 1070 556 Q1094 616 1084 660 L1060 666 Q962 668 862 654 Q858 576 896 490 Q936 432 992 400 Z";
  var S3_AIR    = [[1006, 772], [1068, 770], [1098, 724], [1100, 650]];
  var S3_AIRHOLD = [1100, 650];
  var S3_DROP   = [972, 636];
  var S3_ENGINES = [[1032, 806], [1016, 752], [996, 700], [952, 662], [934, 652]];
  var S3_GATE   = [968, 696];
  var S3_FEEDERS = [[800, 352], [1130, 356]];

  /* o.step  events reached, 0..8 · o.mode "focus" | "all" · o.live a replay
     is running (the newest event gets a ring) · o.upp world units per px */
  function drawS3(s, o, label) {
    var step = o.step, upp = o.upp, px = function (n) { return n * upp; };
    var stage = s3StageOf(Math.max(1, step));

    /* ── the event's art, in the order it happened ── */
    if (step >= 1) {
      s.push('<path d="' + path(LATERAL) + '" fill="none" stroke="' + (step >= 4 ? S3_HOLD : ALARM) +
             '" stroke-width="2" stroke-dasharray="7 5" opacity=".85"/>');
    }
    if (step >= 2) {
      s.push('<line x1="1186" y1="240" x2="' + IGNITION.x + '" y2="' + IGNITION.y +
             '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="2 5" opacity=".55"/>');
      s.push('<circle cx="' + IGNITION.x + '" cy="' + IGNITION.y + '" r="' + (step >= 3 ? 58 : 30) + '" fill="url(#heat)"/>');
    }
    if (step >= 3) {
      s.push('<line x1="' + IGNITION.x + '" y1="60" x2="' + IGNITION.x + '" y2="' + (IGNITION.y - 18) +
             '" stroke="' + INK + '" stroke-width="1" stroke-dasharray="2 5" opacity=".55"/>');
      s.push('<g stroke="' + ALARM + '" stroke-width="2.2">');
      for (var a = 0; a < 8; a++) {
        var th = (a / 8) * Math.PI * 2;
        s.push('<line x1="' + n1(IGNITION.x + Math.cos(th) * 7) + '" y1="' + n1(IGNITION.y + Math.sin(th) * 7) +
               '" x2="' + n1(IGNITION.x + Math.cos(th) * 15) + '" y2="' + n1(IGNITION.y + Math.sin(th) * 15) + '"/>');
      }
      s.push('</g>');
      s.push('<circle cx="' + IGNITION.x + '" cy="' + IGNITION.y + '" r="5" fill="' + ALARM + '"/>');
    }
    if (step >= 4) {
      S3_FEEDERS.forEach(function (p) {
        s.push('<rect x="' + (p[0] - 9) + '" y="' + (p[1] - 9) + '" width="18" height="18" fill="' + PAPER +
               '" stroke="' + S3_HOLD + '" stroke-width="1.8"/>' +
               '<rect x="' + (p[0] - 9) + '" y="' + (p[1] - 9) + '" width="18" height="18" fill="url(#s3-hatch)"/>');
      });
    }
    if (step >= 5) {
      /* the modelled corridor: translucent, dashed edge — a forecast */
      s.push('<path d="' + S3_WEDGE + '" fill="' + FIRE + '" opacity=".18"/>');
      s.push('<path d="' + S3_WEDGE + '" fill="none" stroke="' + FIRE + '" stroke-width="1.6" stroke-dasharray="6 5" opacity=".9"/>');
    }
    if (step >= 6) {
      s.push('<path d="' + path(MILLROAD) + '" fill="none" stroke="' + PUBLIC + '" stroke-width="7" opacity=".26"/>');
      s.push('<path d="' + path(MILLROAD) + '" fill="none" stroke="' + PUBLIC + '" stroke-width="1.6"/>');
      s.push('<path d="' + path(S3_ENGINES) + '" fill="none" stroke="' + PUBLIC + '" stroke-width="2.6"/>');
      [[1016, 752], [996, 700]].forEach(function (p) {
        s.push('<rect x="' + (p[0] - 6) + '" y="' + (p[1] - 4) + '" width="12" height="8" rx="1" fill="' + PUBLIC + '"/>');
      });
      s.push('<circle cx="934" cy="652" r="4" fill="' + PUBLIC + '"/>');
    }
    if (step >= 7) {
      s.push('<path d="' + path(S3_AIR) + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>');
      [[1040, 772, -90], [1082, 752, -50], [1098, 706, -8], [1100, 664, 0]].forEach(function (p) {
        s.push('<path d="M' + (p[0] - 7) + ' ' + (p[1] + 4) + 'L' + p[0] + ' ' + (p[1] - 4) + 'L' + (p[0] + 7) + ' ' + (p[1] + 4) +
               '" fill="none" stroke="' + INK + '" stroke-width="2.2" transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"/>');
      });
    }
    if (step >= 8) {
      /* the two paths that wait on one person: dashed because pending.
         The decision is not executed here — nothing closes these. */
      var C = S3_EVENTS[7].at;
      s.push('<path d="M' + S3_AIRHOLD[0] + ' ' + S3_AIRHOLD[1] + ' Q1040 626 ' + (S3_DROP[0] + 16) + ' ' + (S3_DROP[1] + 4) +
             '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 6" opacity=".9"/>');
      s.push('<circle cx="' + S3_DROP[0] + '" cy="' + S3_DROP[1] + '" r="18" fill="' + PAPER + '" opacity=".5"/>');
      s.push('<circle cx="' + S3_DROP[0] + '" cy="' + S3_DROP[1] + '" r="18" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-dasharray="3 4"/>');
      s.push('<line x1="' + (S3_GATE[0] - 13) + '" y1="' + (S3_GATE[1] - 3) + '" x2="' + (S3_GATE[0] + 13) + '" y2="' + (S3_GATE[1] + 3) +
             '" stroke="' + INK + '" stroke-width="4"/>');
      s.push('<path d="M' + (C[0] - 14) + ' ' + (C[1] + 14) + ' Q1110 626 ' + (S3_AIRHOLD[0] + 8) + ' ' + (S3_AIRHOLD[1] - 6) +
             '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 6"/>');
      s.push('<path d="M' + (C[0] - 26) + ' ' + (C[1] + 10) + ' Q1030 606 ' + (S3_GATE[0] + 16) + ' ' + (S3_GATE[1] - 6) +
             '" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="6 6"/>');
    }

    /* ── the marks: ○ observed · ● bounded action · ◇ forecast · ■ decision ── */
    function mark(ev, emph) {
      var x = ev.at[0], y = ev.at[1], k = ev.kind, r;
      if (o.live && emph) {
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(k === "dec" ? 34 : 22)) + '" fill="none" stroke="' + INK +
               '" stroke-width="' + n1(px(1.2)) + '" opacity=".45"/>');
      }
      if (k === "obs") {
        r = px(7.5);
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(r) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(2)) + '"/>');
      } else if (k === "act") {
        r = px(7.5);
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(r) + '" fill="' + INK + '"/>');
      } else if (k === "mod") {
        r = px(7.5);
        s.push('<rect x="' + n1(x - r) + '" y="' + n1(y - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + PAPER +
               '" stroke="' + FIRE + '" stroke-width="' + n1(px(2)) + '" stroke-dasharray="' + n1(px(3)) + ' ' + n1(px(2.5)) +
               '" transform="rotate(45 ' + x + ' ' + y + ')"/>');
      } else {
        r = px(11);
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(26)) + '" fill="' + PAPER + '" opacity=".9"/>');
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(26)) + '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(1.4)) +
               '" stroke-dasharray="' + n1(px(4)) + ' ' + n1(px(5)) + '" opacity=".8"/>');
        s.push('<rect x="' + n1(x - r) + '" y="' + n1(y - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" rx="' + n1(px(2)) +
               '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(3.4)) + '"/>');
      }
    }
    S3_EVENTS.forEach(function (ev, i) {
      if (i < step) { mark(ev, i === step - 1); }
    });

    if (!label) { return; }

    /* ── the words: only the stage in progress, or the grouped captions ── */
    if (o.mode === "focus" && stage < 3) {
      S3_EVENTS.forEach(function (ev, i) {
        if (i >= step || ev.stage !== stage) { return; }
        label(ev.at[0], ev.at[1], ev.lab, ev.dx, ev.dy, ev.anc);
      });
      var st = S3_STAGES[stage - 1];
      if (st.cap && step >= st.to) {
        label(st.cap.at[0], st.cap.at[1], st.cap.lines, st.cap.dx, st.cap.dy, st.cap.anc);
      }
      return;
    }
    /* the end state: the places and the pending paths, then the groups */
    S3_PLACES.forEach(function (p) {
      if (step < p.from) { return; }
      label(p.at[0], p.at[1], (o.mode === "all" && p.all) || p.lines, p.dx, p.dy, p.anc);
    });
    if (o.mode === "all") {
      S3_GROUPS.forEach(function (g) { label(g.at[0], g.at[1], g.lines, g.dx, g.dy, g.anc); });
    }
  }

  var tlStep = S3_EVENTS.length, tlMode = "focus", tlTimer = null;
  var STEP_MS = 1200;

  function renderS3() {
    var f = frame("ignite");
    renderCounty({
      layers: { see: true, act: tlStep >= 6 },
      f: f,
      s3: { step: tlStep, mode: tlMode, live: !!tlTimer, upp: f.upp }
    });
  }

  function paintTl() {
    var btn = document.getElementById("tl-play");
    if (btn) { btn.textContent = tlTimer ? "Pause" : "Replay"; }
    var all = document.getElementById("tl-all");
    if (all) { all.disabled = (tlMode === "all" && tlStep >= S3_EVENTS.length); }
    if (current === 3) { renderS3(); }
  }

  function tlStop() { clearInterval(tlTimer); tlTimer = null; }

  function s3Announce(step) {
    var ev = S3_EVENTS[step - 1];
    if (!ev) { return; }
    var st = S3_STAGES[ev.stage - 1];
    var first = st.from === ev.n;
    say((first ? "Stage " + st.n + " of 3, " + st.title + ". " : "") +
        ev.t + ", " + ev.who + ". " + ev.what.join(" ") + " " + ev.state + ".");
  }

  /* Replay / Pause, in one control that is always labelled with the action
     it performs. Replay always starts from the first event; Pause stops
     the clock where it is. The replay is a stepped sequence, not an
     animation: under prefers-reduced-motion the steps still arrive and
     the camera does not glide. */
  function tlRun() {
    if (tlTimer) {
      tlStop(); paintTl();
      say("Replay paused at step " + tlStep + " of " + S3_EVENTS.length + ".");
      return;
    }
    tlStep = 0; tlMode = "focus";
    tlTimer = setInterval(function () {
      tlStep++;
      if (tlStep >= S3_EVENTS.length) { tlStep = S3_EVENTS.length; tlStop(); }
      paintTl();
      s3Announce(tlStep);
    }, STEP_MS);
    tlStep++;
    paintTl();
    s3Announce(tlStep);
  }

  function tlShowAll() {
    tlStop();
    tlStep = S3_EVENTS.length;
    tlMode = "all";
    paintTl();
    say("All eight steps shown, grouped into three stages. " +
        S3_STAGES.map(function (st) { return "Stage " + st.n + ", " + st.title + ": " + st.note; }).join(" "));
  }

  /* a small hook for facilitators and the QA script: jump to a stage */
  window.__rg = {
    stage: function (n) { tlStop(); tlMode = "focus"; tlStep = n === 1 ? 3 : n === 2 ? 7 : 8; paintTl(); },
    step:  function (k) { tlStop(); tlMode = "focus"; tlStep = Math.max(0, Math.min(8, k)); paintTl(); },
    showAll: tlShowAll,
    events: S3_EVENTS,
    dropped: function () { return dropped.slice(); }
  };

  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function drawFor(n) {
    if (n === 1)      { renderCounty({ layers: {}, retreat: true, f: frame("county") }); }
    else if (n === 2) { renderCounty({ layers: layerOn, network: true, f: frame("network") }); }
    else if (n === 3) { paintTl(); }
    else if (n === 4) { renderCounty({ layers: {}, flows: true, f: frame("flows") }); }
    else if (n === 5) { renderCounty({ layers: { see: true, act: true }, market: true, f: frame("payoff") }); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited from micromutual/app.js. A block is never given a
     height it then has to clip; instead the whole composition gives way.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

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
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) { return; }
      if (r.top < box.top - 1 || r.bottom > box.bottom + 1 ||
          r.left < box.left - 1 || r.right > box.right + 1) { bad = true; }
      rects.push(r);
    });
    for (i = 0; i < rects.length && !bad; i++) {
      for (j = i + 1; j < rects.length; j++) {
        if (rects[i].left < rects[j].right - 1 && rects[i].right > rects[j].left + 1 &&
            rects[i].top < rects[j].bottom - 1 && rects[i].bottom > rects[j].top + 1) {
          bad = true; break;
        }
      }
    }
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
    /* narrow never shrinks: a phone screen scrolls instead */
    if (narrow) { return; }
    if (!spills(sc)) { return; }
    var lo = FIT_FLOOR, hi = 1, best = FIT_FLOOR, mid, i;
    for (i = 0; i < 7; i++) {
      mid = (lo + hi) / 2;
      sc.style.setProperty("--fit", mid.toFixed(4));
      if (spills(sc)) { hi = mid; } else { lo = mid; best = mid; }
    }
    sc.style.setProperty("--fit", best.toFixed(4));
    for (i = 0; i < 8 && best > FIT_FLOOR && spills(sc); i++) {
      best = Math.max(FIT_FLOOR, best - 0.025);
      sc.style.setProperty("--fit", best.toFixed(4));
    }
  }

  /* the labels test themselves against the blocks, so every screen is
     drawn again once --fit and the fonts have settled the blocks' boxes;
     on a narrow stage the blocks' height decides the county's window, so
     the camera is re-aimed too (a no-op when the target is unchanged) */
  var fitPending = null;
  function refit() {
    cancelAnimationFrame(fitPending);
    fitPending = requestAnimationFrame(function () {
      fitScreen(screens && screens[current - 1]);
      drawFor(current);
      moveCamera(screens[current - 1].dataset.cam);
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

  var CTA = ["See the network", "The moment", "Follow the money", "Market creation", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  var tlPlay = document.getElementById("tl-play");
  if (tlPlay) { tlPlay.addEventListener("click", tlRun); }
  var tlAll = document.getElementById("tl-all");
  if (tlAll) { tlAll.addEventListener("click", tlShowAll); }

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    /* leaving screen 3 stops the clock */
    if (n !== 3) { tlStop(); }

    /* fit before the camera moves and the labels are placed: both read the
       settled layout of the blocks */
    fitScreen(sc);
    drawFor(n);
    moveCamera(sc.dataset.cam);
    refit();

    /* headlines are authored as one span per line; join them with a space */
    var h = sc.querySelector(".xd");
    var spans = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (spans.length
          ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ")
          : h.textContent)
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

  /* ══════════════════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════════════════ */

  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      narrow = isNarrow();
      screens.forEach(function (s) {
        var h = s.hidden;
        if (h) { s.hidden = false; }
        fitScreen(s);
        if (h) { s.hidden = true; }
      });
      drawFor(current);
      moveCamera(screens[current - 1].dataset.cam, true);
    }, 140);
  });

  /* skip button: move focus to the open screen's heading */
  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[current - 1];
      var h = sc && (sc.querySelector(".xd") || sc.querySelector(".xeyebrow"));
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

  /* the label widths are estimated, but the blocks' boxes are measured, so
     the screen is drawn once more when the webfont has arrived */
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { refit(); }); }

  narrow = isNarrow();
  paintLayers();
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);
})();
