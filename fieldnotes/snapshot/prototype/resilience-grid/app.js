/* ══════════════════════════════════════════════════════════════════════════
   Resilience Grid · 2036 prototype · Alder County
   No framework, no build step, no external request. Three files.

   Forked from prototype/micromutual/app.js. The navigation, the camera, the
   per-screen --fit search and the pin projection are that file's machinery,
   inherited deliberately — see design.md §2. What is new is the ground it
   draws and the five diagrams the concept needs.

   THE GROUND
   One invented county, drawn once in a single world space 1600 x 1000, with
   every screen a camera move over it. A ridge system, a canyon corridor, a
   transmission line crossing the saddle, four fire-district boundaries, three
   settlement clusters, and the network's own nodes.

   The settlements are drawn as CLUSTERS and never as addressable houses.
   That is the concept in the drawing: the moment you can click one house you
   are in Emberwatch, which is the other wildfire prototype and the one this
   must not be mistaken for. The smallest thing this ground resolves is a
   cluster of dwellings.

   Unlike Micromutual, the world is NOT rotated on a phone. A street is linear
   and belongs running down a narrow screen; a county is not. Narrow gets its
   own camera rectangles (CAM_N) and the same landscape world.

   WHAT IS INVENTED AND WHAT IS NOT
   Alder County, its 14,200 interface households, its two remaining quoting
   carriers, the Mill Creek lateral, the 14:31 fault and every time on screen 3
   are invented, and the screens say so. The companies and the deals named on
   screens 2, 4, 5 and 6 are real, dated and sourced in research-notes.md
   §1-§2. Nothing on screen mixes the two: an invented figure never carries a
   real company's name, and a real precedent always carries its year.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var W = 1600, H = 1000;

  var INK      = "#36414A",
      PAPER    = "#FBF9F1",
      RULE     = "#8A959C",
      HAIR     = "#DCDDD8",
      CARRIER  = "#2F5E7C",
      UTILITY  = "#5B4E7A",
      FIRE     = "#9E4A14",
      PUBLIC   = "#2F5A44",
      VENDOR   = "#7A5A17",
      ALARM    = "#A33322";

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY — Alder County
     The ridge runs across the upper third; the slope falls south into the
     interface valley, cut by one canyon. Everything below is invented.
     ══════════════════════════════════════════════════════════════════════ */

  /* the ridge crest, as a wavy path across the world */
  var CREST = [[0,318],[150,292],[310,262],[470,276],[640,238],[800,252],
               [960,224],[1120,248],[1290,214],[1450,236],[1600,210]];

  /* Mill Creek canyon: a drainage falling from the crest to the valley.
     Drawn as a centreline with a width profile rather than two hand-placed
     edges — the first version was two independent paths closed into a
     polygon and it read as a grey slab, not as a cut in the slope. */
  var CREEK = [[986,266],[978,340],[966,420],[952,500],[940,578],[932,648]];
  var CREEK_W = [16, 26, 36, 44, 50, 54];   /* half-width at each station */

  /* the transmission line: in at the west, over the saddle, out at the east */
  var LINE = [[40,470],[200,452],[360,418],[520,372],[640,334],[800,352],
              [960,330],[1130,356],[1300,330],[1460,352],[1600,372]];
  /* the Mill Creek lateral — the spur that faults on screen 3 */
  var LATERAL = [[968,334],[984,402],[998,472],[1006,544],[1000,616]];

  /* the valley road, and the one road out of Mill Creek */
  var ROAD = [[60,842],[260,828],[470,836],[690,820],[900,832],[1120,818],
              [1340,830],[1560,816]];
  var MILLROAD = [[968,690],[974,748],[968,800],[972,830]];

  /* four fire-district boundaries */
  var DISTRICTS = [380, 762, 1142];

  /* settlement clusters — massed dwellings, never addressable */
  var SETTLEMENTS = [
    { id: "alder", name: "Alder Flat",  cx: 470,  cy: 762, rx: 168, ry: 70, n: 58 },
    { id: "mill",  name: "Mill Creek",  cx: 962,  cy: 706, rx: 118, ry: 56, n: 34 },
    { id: "rim",   name: "East Rim",    cx: 1344, cy: 700, rx: 132, ry: 58, n: 40 }
  ];

  /* network nodes. layer: which rail on screen 2 lights them. */
  var NODES = [
    /* SEE — ridge cameras */
    { k: "cam",  layer: "see",  x: 306,  y: 252, label: "Camera" },
    { k: "cam",  layer: "see",  x: 700,  y: 226, label: "Camera" },
    { k: "cam",  layer: "see",  x: 1186, y: 240, label: "Camera" },
    /* SEE — forest gas sensors */
    { k: "gnd",  layer: "see",  x: 182,  y: 196 },
    { k: "gnd",  layer: "see",  x: 416,  y: 166 },
    { k: "gnd",  layer: "see",  x: 560,  y: 140 },
    { k: "gnd",  layer: "see",  x: 742,  y: 124 },
    { k: "gnd",  layer: "see",  x: 884,  y: 184 },
    { k: "gnd",  layer: "see",  x: 1024, y: 148 },
    { k: "gnd",  layer: "see",  x: 1226, y: 182 },
    { k: "gnd",  layer: "see",  x: 1442, y: 158 },
    /* SEE — line sensors, on the transmission line and the lateral */
    { k: "line", layer: "see",  x: 360,  y: 418, label: "Line sensor" },
    { k: "line", layer: "see",  x: 640,  y: 334 },
    { k: "line", layer: "see",  x: 960,  y: 330, label: "Mill Creek lateral" },
    { k: "line", layer: "see",  x: 1300, y: 330 },
    /* ACT — fire stations */
    { k: "stn",  layer: "act",  x: 298,  y: 868, label: "District 1" },
    { k: "stn",  layer: "act",  x: 702,  y: 848, label: "District 2" },
    { k: "stn",  layer: "act",  x: 1032, y: 806, label: "District 3" },
    { k: "stn",  layer: "act",  x: 1386, y: 838, label: "District 4" },
    /* ACT — autonomous suppression pads */
    { k: "pad",  layer: "act",  x: 1006, y: 772, label: "Mill Creek pad" },
    { k: "pad",  layer: "act",  x: 426,  y: 884 }
  ];

  /* the ignition, on the lateral at the canyon head */
  var IGNITION = { x: 992, y: 400 };

  /* ══════════════════════════════════════════════════════════════════════
     CAMERAS
     ══════════════════════════════════════════════════════════════════════ */

  var CAM = {
    county:  { x: 40,  y: 110, w: 1520, h: 820 },
    network: { x: 90,  y: 100, w: 1420, h: 790 },
    ignite:  { x: 620, y: 240, w: 900,  h: 620 },
    flows:   { x: 120, y: 180, w: 1380, h: 740 },
    payoff:  { x: 40,  y: 110, w: 1520, h: 820 }
  };
  /* On a phone the plates stack from the top and the county shows through
     whatever is left, so every view is pulled wider. */
  var CAM_N = {
    county:  { x: 120, y: 240, w: 1360, h: 700 },
    network: { x: 140, y: 150, w: 1320, h: 760 },
    ignite:  { x: 640, y: 260, w: 860,  h: 580 },
    flows:   { x: 160, y: 300, w: 1300, h: 660 },
    payoff:  { x: 120, y: 240, w: 1360, h: 700 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  var svg = document.getElementById("plan");
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

  /* Deterministic scatter, so the county looks like a county and not like
     noise, and redraws identically every time. */
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 1103515245 + 12345) % 2147483648; return (s % 10000) / 10000; };
  }

  var DWELL = (function () {
    var out = {};
    SETTLEMENTS.forEach(function (s, si) {
      var r = rng(97 + si * 31), a = [];
      for (var i = 0; i < s.n; i++) {
        /* rejection-sample inside the ellipse so clusters have soft edges */
        var u = r() * 2 - 1, v = r() * 2 - 1;
        if (u * u + v * v > 1) { u *= 0.72; v *= 0.72; }
        a.push([s.cx + u * s.rx, s.cy + v * s.ry, r() > 0.5 ? 1 : 0]);
      }
      out[s.id] = a;
    });
    return out;
  })();

  var TREES = (function () {
    var r = rng(4242), a = [], i, x, y, crest;
    for (i = 0; i < 230; i++) {
      x = r() * W;
      crest = crestY(x);
      y = r() * (crest - 40) + 18;
      a.push([x, y, 4 + r() * 5]);
    }
    /* a thinner scatter on the slope between crest and valley */
    for (i = 0; i < 120; i++) {
      x = r() * W;
      crest = crestY(x);
      y = crest + 26 + r() * 240;
      a.push([x, y, 3 + r() * 3.5]);
    }
    return a;
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

  function nodeGlyph(n, on) {
    var c = n.k === "line" ? UTILITY : (n.k === "stn" || n.k === "pad") ? FIRE : VENDOR;
    var o = on ? 1 : 0.16;
    var g = '<g opacity="' + o + '" style="transition:opacity .5s linear">';
    if (n.k === "cam") {
      /* triangle on a mast */
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
     DRAWING THE COUNTY
       opts.layers    — { see:bool, know:bool, act:bool, fund:bool }
       opts.ignition  — 0..1, how far the event has run, or null
       opts.spread    — show the modelled spread cone
       opts.response  — show engines and aircraft moving
       opts.protected — shade the interface as covered
     ══════════════════════════════════════════════════════════════════════ */

  function renderCounty(opts) {
    opts = opts || {};
    var L = opts.layers || {};
    var s = [];

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
      '<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + ALARM + '" stop-opacity=".22"/>' +
        '<stop offset="1" stop-color="' + ALARM + '" stop-opacity=".04"/></linearGradient>' +
      '</defs>');

    /* ── grounds: back country, slope, valley ── */
    s.push('<rect x="-200" y="-200" width="' + (W + 400) + '" height="' + (H + 400) + '" fill="url(#sky)"/>');

    /* the back country above the crest */
    s.push('<path d="' + path(CREST) + "L" + W + " -200L-200 -200Z" + '" fill="#E8E7DC"/>');

    /* contour bands below the crest, each a little lighter */
    [34, 72, 116, 168, 228].forEach(function (dy, i) {
      s.push('<path d="' + path(offset(CREST, dy)) + '" fill="none" stroke="' + RULE +
             '" stroke-width="1" opacity="' + (0.30 - i * 0.045).toFixed(2) + '"/>');
    });
    /* the crest itself */
    s.push('<path d="' + path(CREST) + '" fill="none" stroke="' + RULE + '" stroke-width="2.2" opacity=".62"/>');

    /* the valley floor */
    s.push('<path d="' + path(offset(CREST, 380)) + "L" + W + " " + (H + 200) + "L-200 " + (H + 200) + "Z" +
           '" fill="#F3F1E6"/>');

    /* ── trees ── */
    TREES.forEach(function (t) {
      s.push('<circle cx="' + t[0].toFixed(1) + '" cy="' + t[1].toFixed(1) + '" r="' + t[2].toFixed(1) +
             '" fill="' + PUBLIC + '" opacity=".16"/>');
    });

    /* ── the canyon: a shaded drainage, not a slab ── */
    var cl = CREEK.map(function (p, i) { return [p[0] - CREEK_W[i], p[1]]; });
    var cr = CREEK.map(function (p, i) { return [p[0] + CREEK_W[i], p[1]]; }).reverse();
    s.push('<path d="' + path(cl.concat(cr), true) + '" fill="#E9E6DA" opacity=".72"/>');
    /* the two shoulders carry the stroke, so the mouth stays open */
    s.push('<path d="' + path(cl) + '" fill="none" stroke="' + RULE + '" stroke-width="1.1" opacity=".52"/>');
    s.push('<path d="' + path(CREEK.map(function (p, i) { return [p[0] + CREEK_W[i], p[1]]; })) +
           '" fill="none" stroke="' + RULE + '" stroke-width="1.1" opacity=".52"/>');
    /* the creek itself */
    s.push('<path d="' + path(CREEK) + '" fill="none" stroke="' + CARRIER +
           '" stroke-width="1.6" opacity=".34"/>');

    /* ── fire-district boundaries ── */
    DISTRICTS.forEach(function (x) {
      s.push('<line x1="' + x + '" y1="' + (crestY(x) - 10) + '" x2="' + (x + 26) + '" y2="' + H +
             '" stroke="' + FIRE + '" stroke-width="1.4" stroke-dasharray="3 9" opacity=".44"/>');
    });

    /* ── the valley road ── */
    s.push('<path d="' + path(ROAD) + '" fill="none" stroke="' + PAPER + '" stroke-width="9"/>');
    s.push('<path d="' + path(ROAD) + '" fill="none" stroke="' + RULE + '" stroke-width="1.5" opacity=".7"/>');
    /* the one road out of Mill Creek */
    s.push('<path d="' + path(MILLROAD) + '" fill="none" stroke="' + PAPER + '" stroke-width="7"/>');
    s.push('<path d="' + path(MILLROAD) + '" fill="none" stroke="' + RULE + '" stroke-width="1.4" opacity=".7"/>');

    /* ── settlement clusters ── */
    SETTLEMENTS.forEach(function (st) {
      if (opts.protected) {
        s.push('<ellipse cx="' + st.cx + '" cy="' + st.cy + '" rx="' + (st.rx + 22) + '" ry="' + (st.ry + 20) +
               '" fill="' + PUBLIC + '" opacity=".09"/>');
      }
      DWELL[st.id].forEach(function (d) {
        var w = d[2] ? 9 : 7.5;
        s.push('<rect x="' + (d[0] - w / 2).toFixed(1) + '" y="' + (d[1] - w / 2).toFixed(1) +
               '" width="' + w + '" height="' + w + '" rx="1" fill="' + INK + '" opacity=".46"/>');
      });
    });

    /* ── the transmission line and the lateral ── */
    s.push('<path d="' + path(LINE) + '" fill="none" stroke="' + UTILITY +
           '" stroke-width="2" opacity="' + (L.see ? ".72" : ".30") + '" style="transition:opacity .5s"/>');
    s.push('<path d="' + path(LATERAL) + '" fill="none" stroke="' + UTILITY +
           '" stroke-width="1.6" stroke-dasharray="7 5" opacity="' + (L.see ? ".66" : ".26") +
           '" style="transition:opacity .5s"/>');

    /* ── satellite pass, dashed across the top band ── */
    s.push('<path d="M-120 150Q' + (W / 2) + ' -70 ' + (W + 120) + ' 164" fill="none" stroke="' + VENDOR +
           '" stroke-width="1.6" stroke-dasharray="14 10" opacity="' + (L.see ? ".60" : ".10") +
           '" style="transition:opacity .5s"/>');

    /* ── the modelled spread cone ── */
    if (opts.spread) {
      s.push('<path d="M' + IGNITION.x + " " + IGNITION.y +
             "L" + (IGNITION.x - 150) + " 700L" + (IGNITION.x + 130) + ' 700Z" fill="url(#cone)"/>');
    }

    /* ── response: engines to the canyon mouth, aircraft off the pad ── */
    if (opts.response) {
      s.push('<path d="M1032 806L1000 740L978 672" fill="none" stroke="' + FIRE +
             '" stroke-width="2.4" stroke-dasharray="9 6"/>');
      [[-34, -8], [-12, -16], [10, -14], [32, -6]].forEach(function (d) {
        var ax = 1006 + d[0] * 2.4, ay = 772 + d[1] * 4 - 150;
        s.push('<path d="M' + (ax - 7) + " " + (ay + 3) + "L" + ax + " " + (ay - 5) + "L" + (ax + 7) + " " + (ay + 3) +
               '" fill="none" stroke="' + FIRE + '" stroke-width="2.4"/>');
      });
    }

    /* ── network nodes ── */
    NODES.forEach(function (n) {
      s.push(nodeGlyph(n, n.layer === "see" ? !!L.see : !!L.act));
    });

    /* ── the ignition ── */
    if (opts.ignition != null) {
      var p = opts.ignition, r = 26 + p * 54;
      s.push('<circle cx="' + IGNITION.x + '" cy="' + IGNITION.y + '" r="' + r.toFixed(1) + '" fill="url(#heat)"/>');
      s.push('<g stroke="' + ALARM + '" stroke-width="2.4">');
      for (var a = 0; a < 8; a++) {
        var th = (a / 8) * Math.PI * 2, r0 = 6, r1 = 15;
        s.push('<line x1="' + (IGNITION.x + Math.cos(th) * r0).toFixed(1) +
               '" y1="' + (IGNITION.y + Math.sin(th) * r0).toFixed(1) +
               '" x2="' + (IGNITION.x + Math.cos(th) * r1).toFixed(1) +
               '" y2="' + (IGNITION.y + Math.sin(th) * r1).toFixed(1) + '"/>');
      }
      s.push("</g>");
      s.push('<circle cx="' + IGNITION.x + '" cy="' + IGNITION.y + '" r="5.5" fill="' + ALARM + '"/>');
    }

    /* ══════════════════════════════════════════════════════════════════
       SPATIAL STORYTELLING — the five beats, carried by the region

       Everything below used to live in a panel: a status bar, a layer list,
       an event log, a payer table and a pair of outcome cards. Each is now
       a thing that happens ON the terrain, because a viewer should see what
       changed without reading what changed.
       ══════════════════════════════════════════════════════════════════ */

    /* the capacity boundary — a line the market draws across the county */
    function capacityPath(pull) {
      var pts = [], x;
      for (x = -40; x <= W + 40; x += 40) {
        var ridge = crestY(x);
        /* capacity sits BELOW the ridge and is pushed further down-valley the
           more the market retreats; the canyon is always the worst of it */
        var canyon = Math.exp(-Math.pow((x - IGNITION.x) / 300, 2)) * 120;
        pts.push([x, ridge + 120 + pull * (210 + canyon)]);
      }
      return pts;
    }

    if (opts.retreat || opts.market) {
      var pull = opts.market ? 1 : (opts.retreatPull == null ? 1 : opts.retreatPull);

      /* the ground the market has walked away from, shaded as risk */
      s.push('<path d="' + path(capacityPath(pull), false) +
             ' L' + (W + 40) + ' -80 L-40 -80 Z" fill="' + ALARM + '" opacity=".10"/>');

      if (opts.market) {
        /* screen 5: both boundaries at once, so the movement IS the image */
        s.push('<path d="' + path(capacityPath(0.34), false) + '" fill="none" stroke="' + PUBLIC +
               '" stroke-width="5" opacity=".95"/>');
        s.push('<path d="' + path(capacityPath(0.34), false) +
               ' L' + (W + 40) + ' ' + (H + 80) + ' L-40 ' + (H + 80) + ' Z" fill="' + PUBLIC + '" opacity=".07"/>');
        for (var ax = 180; ax < W; ax += 300) {
          var y0 = crestY(ax) + 120 + 1 * (210 + Math.exp(-Math.pow((ax - IGNITION.x) / 300, 2)) * 120);
          var y1 = crestY(ax) + 120 + 0.34 * (210 + Math.exp(-Math.pow((ax - IGNITION.x) / 300, 2)) * 120);
          s.push('<line x1="' + ax + '" y1="' + y0 + '" x2="' + ax + '" y2="' + (y1 + 16) +
                 '" stroke="' + PUBLIC + '" stroke-width="3" opacity=".75" marker-end="url(#arrUp)"/>');
        }
      }
      s.push('<path d="' + path(capacityPath(pull), false) + '" fill="none" stroke="' + ALARM +
             '" stroke-width="4" stroke-dasharray="' + (opts.market ? "14 10" : "0") + '" opacity=".9"/>');
    }

    /* the standing network: assets that already exist, joined into a system */
    if (opts.network) {
      var hub = { x: 800, y: 520 };
      NODES.forEach(function (n) {
        if (!L[n.layer]) { return; }
        s.push('<line x1="' + n.x + '" y1="' + n.y + '" x2="' + hub.x + '" y2="' + hub.y +
               '" stroke="' + CARRIER + '" stroke-width="1.3" opacity=".30"/>');
      });
      s.push('<circle cx="' + hub.x + '" cy="' + hub.y + '" r="26" fill="' + PAPER +
             '" stroke="' + CARRIER + '" stroke-width="3"/>');
      s.push('<circle cx="' + hub.x + '" cy="' + hub.y + '" r="9" fill="' + CARRIER + '"/>');
    }

    /* the event, as five places rather than five rows */
    if (opts.event != null) {
      /* The five moments, anchored where they happen. Times and kinds are the
         scenario's own — 14:31 line sensor, 14:33 ridge camera, 14:38 spread
         model, 14:43 autonomous suppression, 14:47 the duty chief — so the
         map now carries what the strip used to have to explain. */
      /* Label offsets are in SCREEN px from the node centre (see `px()`
         below), and are per-beat rather than uniform. Beat 1 sits under the
         headline's scrim at the ignite camera, so it is pushed clear of the
         scrim's box rather than left to fade into its tail; beat 3 reads to
         the left because it is the westmost node and a right-hand label
         crossed the path running to beat 4. */
      var BEATS = [
        { n: 1, x: IGNITION.x,       y: IGNITION.y,       t: "Detect",      ts: "14:31", c: ALARM,   lx:  40, ly: -12, anc: "start" },
        { n: 2, x: IGNITION.x + 168, y: IGNITION.y + 36,  t: "Corroborate", ts: "14:33", c: ALARM,   lx:  26, ly: -12, anc: "start" },
        { n: 3, x: 742,              y: 486,              t: "Decide",      ts: "14:38", c: CARRIER, lx: -26, ly: -12, anc: "end"   },
        { n: 4, x: IGNITION.x - 36,  y: IGNITION.y + 196, t: "Intervene",   ts: "14:43", c: FIRE,    lx:  26, ly: -12, anc: "start" },
        { n: 5, x: IGNITION.x + 150, y: IGNITION.y + 250, t: "Verify",      ts: "14:47", c: PUBLIC,  lx:  26, ly: -12, anc: "start" }
      ];
      /* ── sizes in SCREEN px, not world units ──────────────────────────
         The ignite camera runs about 0.63 world units per CSS px on iPad,
         but the narrow camera pulls back to the whole county at ~2.9. A
         fixed 13-unit label therefore rendered ~21px on iPad and ~4px on a
         phone, where the sequence became unreadable. Everything below is
         expressed as a target CSS px size and converted through `upp`.

         On narrow the five beats also compress to ~40px apart on screen, so
         no word label can sit beside them without colliding. There the map
         carries ORDER (numbered nodes and the path) and the strip below
         carries the NAMES — which is what the strip is still for.

         The factor comes from this screen's TARGET camera, not the live
         viewBox: the camera animates, so a mid-transition `vb` would size
         the labels for whichever screen we were leaving. */
      var wEl = document.getElementById("world");
      var wpx = wEl ? wEl.getBoundingClientRect().width : 0;
      var camT = viewBoxFor((narrow && CAM_N.ignite) || CAM.ignite, narrowFit());
      var upp = (wpx && camT && camT.w) ? (camT.w / wpx) : 0.63;
      var px  = function (n) { return n * upp; };
      var showLabels = !narrow;

      BEATS.forEach(function (b, i) {
        if (i > opts.event) { return; }
        var running = !!opts.replaying;
        var live = running && (i === opts.event);
        var dim  = !running ? 1 : (live ? 1 : .4);
        if (i > 0) {
          var a = BEATS[i - 1];
          s.push('<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
                 '" stroke="' + b.c + '" stroke-width="' + px(1.7).toFixed(2) +
                 '" opacity="' + (running ? (live ? .85 : .25) : .6) +
                 '" stroke-dasharray="' + px(6.5).toFixed(1) + ' ' + px(5).toFixed(1) + '"/>');
        }
        if (live) {
          s.push('<circle cx="' + b.x + '" cy="' + b.y + '" r="' + px(31).toFixed(1) +
                 '" fill="none" stroke="' + b.c + '" stroke-width="' + px(1.4).toFixed(2) +
                 '" opacity=".4"/>');
        }
        /* a numbered node: the order is readable without the strip. The glyph
           sits INSIDE its circle — at 19 units it filled the node edge to
           edge and read as a blob at the ignite camera's scale. */
        var r = px(live ? 19 : 16);
        s.push('<circle cx="' + b.x + '" cy="' + b.y + '" r="' + r.toFixed(1) +
               '" fill="' + PAPER + '" stroke="' + b.c + '" stroke-width="' +
               px(live ? 2.6 : 1.8).toFixed(2) + '" opacity="' + dim + '"/>');
        s.push('<text x="' + b.x + '" y="' + (b.y + px(live ? 8 : 7)).toFixed(1) +
               '" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="' +
               px(live ? 23 : 20).toFixed(1) + '" font-weight="700" fill="' + b.c +
               '" opacity="' + dim + '">' + b.n + '</text>');
        if (!showLabels) { return; }
        /* Level 3, not Level 2. These were 24 units — ~38 CSS px on iPad, in
           competition with a ~55px headline. At 20px they annotate the
           terrain instead of shouting over it. The paper halo (paint-order:
           stroke) is what lets them sit directly on ridge, risk-shading or
           the headline scrim without a plate behind them. */
        s.push('<text x="' + (b.x + px(b.lx)).toFixed(1) + '" y="' + (b.y + px(b.ly)).toFixed(1) +
               '" text-anchor="' + b.anc +
               '" font-family="Arial,Helvetica,sans-serif" font-size="' + px(20).toFixed(1) +
               '" font-weight="700" letter-spacing="' + px(1.5).toFixed(2) +
               '" paint-order="stroke" stroke="' + PAPER + '" stroke-width="' + px(3.6).toFixed(2) +
               '" stroke-linejoin="round" fill="' + b.c + '" opacity="' + dim + '">' +
               b.t.toUpperCase() + '</text>');
        s.push('<text x="' + (b.x + px(b.lx)).toFixed(1) + '" y="' + (b.y + px(b.ly + 19)).toFixed(1) +
               '" text-anchor="' + b.anc +
               '" font-family="Arial,Helvetica,sans-serif" font-size="' + px(14).toFixed(1) +
               '" font-weight="600" paint-order="stroke" stroke="' + PAPER + '" stroke-width="' +
               px(3).toFixed(2) + '" stroke-linejoin="round" fill="' + INK +
               '" opacity="' + (dim * .85) + '">' + b.ts + '</text>');
      });
    }

    /* who pays: four streams converging on the operating business */
    if (opts.flows) {
      var core = { x: 800, y: 560 };
      var PAYERS = [
        { x: 330,  y: 372, c: UTILITY, t: "Utility", why: "avoids outage and its own exposure" },
        { x: 1290, y: 372, c: PUBLIC, t: "Public agencies", why: "regional resilience" },
        { x: 330,  y: 790, c: FIRE, t: "Property owners", why: "a maintained perimeter" },
        { x: 1290, y: 790, c: CARRIER, t: "Insurer", why: "verified change in risk" }
      ];
      PAYERS.forEach(function (q) {
        s.push('<path d="M' + q.x + ' ' + q.y + ' Q' + ((q.x + core.x) / 2) + ' ' +
               ((q.y + core.y) / 2 + (q.y < core.y ? 70 : -70)) + ' ' + core.x + ' ' + core.y +
               '" fill="none" stroke="' + q.c + '" stroke-width="4" opacity=".62" marker-end="url(#arrIn)"/>');
        s.push('<circle cx="' + q.x + '" cy="' + q.y + '" r="17" fill="' + PAPER +
               '" stroke="' + q.c + '" stroke-width="3.4"/>');
        var lx = q.x < core.x ? q.x + 30 : q.x - 30;
        var anc = q.x < core.x ? "start" : "end";
        s.push('<text x="' + lx + '" y="' + (q.y - 2) + '" text-anchor="' + anc +
               '" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="700" ' +
               'letter-spacing="2.2" fill="' + q.c + '">' + q.t.toUpperCase() + '</text>');
        s.push('<text x="' + lx + '" y="' + (q.y + 30) + '" text-anchor="' + anc +
               '" font-family="Arial,Helvetica,sans-serif" font-size="23" fill="' + INK +
               '" opacity=".82">' + q.why + '</text>');
      });
      s.push('<circle cx="' + core.x + '" cy="' + core.y + '" r="44" fill="' + PAPER +
             '" stroke="' + INK + '" stroke-width="3.5"/>');
      s.push('<circle cx="' + core.x + '" cy="' + core.y + '" r="15" fill="' + INK + '"/>');
      s.push('<text x="' + core.x + '" y="' + (core.y + 76) + '" text-anchor="middle" ' +
             'font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="700" ' +
             'letter-spacing="2.4" fill="' + INK + '">THE OPERATING NETWORK</text>');
      /* one evidence path, verified outcomes toward an underwriting decision */
      s.push('<path d="M' + (core.x + 44) + ' ' + core.y + ' Q1160 ' + (core.y - 150) +
             ' 1290 ' + (790 - 26) + '" fill="none" stroke="' + CARRIER +
             '" stroke-width="2.4" stroke-dasharray="11 8" opacity=".85" marker-end="url(#arrIn)"/>');
    }

    svg.innerHTML = s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited from micromutual/app.js)
     ══════════════════════════════════════════════════════════════════════ */

  function setVB(c) {
    svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h);
    vb = c;
  }

  /* Turn "this region must be visible" into a viewBox for an SVG that is
     bigger than the viewport and uses `slice`. Both axes resolve to the same
     scale, so slice crops the county and never the subject. `fit` says which
     part of the viewport the subject has to land in — on a phone the plates
     stack down from the top, so the subject belongs in the strip underneath
     them rather than dead centre. */
  function viewBoxFor(view, fit) {
    var el = document.getElementById("world").getBoundingClientRect();
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

  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.county;
    var target = viewBoxFor(cam, narrowFit());
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

  var PIN_SETS = {
    1: [{ cls: "grey",    label: "Alder Flat",   wx: 470,  wy: 762, dy: -62 },
        { cls: "grey",    label: "Mill Creek",   wx: 962,  wy: 706, dy: -52 },
        { cls: "grey",    label: "East Rim",     wx: 1344, wy: 700, dy: -52 },
        { cls: "ink",     label: "The interface", wx: 700, wy: 900, dy: 0 }],
    2: [{ cls: "vendor",  label: "Ridge cameras", wx: 700, wy: 226, dy: -34 },
        { cls: "utility", label: "Line sensors",  wx: 360, wy: 418, dy: -30 },
        { cls: "fire",    label: "Suppression pad", wx: 1006, wy: 772, dy: 34 }],
    3: [{ cls: "alarm",   label: "Ignition",      wx: 992, wy: 400, dy: -46 },
        { cls: "utility", label: "Mill Creek lateral", wx: 960, wy: 330, dy: -34 },
        { cls: "fire",    label: "District 3",    wx: 1032, wy: 806, dy: 34 },
        { cls: "ink",     label: "320 homes",     wx: 962, wy: 706, dy: 30 }],
    4: [{ cls: "utility", label: "Utility",       wx: 360, wy: 418, dy: -30 },
        { cls: "fire",    label: "Four districts", wx: 702, wy: 848, dy: 32 },
        { cls: "ink",     label: "14,200 households", wx: 470, wy: 762, dy: -62 }],
    5: [{ cls: "alarm",   label: "What happened", wx: 992, wy: 400, dy: -46 },
        { cls: "grey",    label: "What changed",  wx: 962, wy: 706, dy: 30 }],
    6: [{ cls: "grey",    label: "Alder County",  wx: 470,  wy: 762, dy: -62 },
        { cls: "grey",    label: "Mill Creek",    wx: 962,  wy: 706, dy: -52 },
        { cls: "grey",    label: "East Rim",      wx: 1344, wy: 700, dy: -52 }]
  };

  function buildPins(n) {
    pinHost.innerHTML = "";
    (PIN_SETS[n] || []).forEach(function (p) {
      var el = document.createElement("span");
      el.className = "pin pin--" + p.cls;
      el.textContent = p.label;
      el.dataset.wx = p.wx; el.dataset.wy = p.wy; el.dataset.dy = p.dy || 0;
      pinHost.appendChild(el);
    });
    placePins();
  }

  /* A pin is hidden when it would land under a plate or the chrome — an
     opaque label half-under an opaque plate is the defect, not the fix. */
  function placePins() {
    if (!vb) { return; }
    var el = document.getElementById("world").getBoundingClientRect();
    var sx = el.width / vb.w, sy = el.height / vb.h;
    var sc = screens && screens[current - 1];
    var boxes = sc ? Array.prototype.map.call(
      sc.querySelectorAll(".plate"), function (p) { return p.getBoundingClientRect(); }) : [];
    boxes = boxes.concat(Array.prototype.map.call(
      document.querySelectorAll(".chrome button, .chrome select"),
      function (p) { return p.getBoundingClientRect(); }));

    Array.prototype.forEach.call(pinHost.children, function (p) {
      var x = el.left + (+p.dataset.wx - vb.x) * sx;
      var y = el.top + (+p.dataset.wy - vb.y) * sy + (+p.dataset.dy);
      p.style.left = x + "px";
      p.style.top = y + "px";
      var r = p.getBoundingClientRect();
      /* A pin must be WHOLLY inside the viewport. Testing only for "not
         entirely off-screen" left labels hanging half off the left edge on
         a phone, which is a clipped label, not a placed one. */
      var hit = r.left < 4 || r.right > window.innerWidth - 4 ||
                r.top < 4 || r.bottom > window.innerHeight - 4;
      for (var i = 0; i < boxes.length && !hit; i++) {
        var b = boxes[i];
        if (r.left < b.right + 6 && r.right > b.left - 6 &&
            r.top < b.bottom + 6 && r.bottom > b.top - 6) { hit = true; }
      }
      p.style.visibility = hit ? "hidden" : "visible";
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — the network layers
     ══════════════════════════════════════════════════════════════════════ */

  /* One polite live region for state changes that are not screen changes —
     a layer switched off, the replay started or paused. The screen
     announcer (#announce) handles navigation; this handles everything else,
     so the two never overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  var layerOrder = ["see", "know", "act", "fund"];
  /* All four start ON, for the same reason the timeline starts revealed: a
     panel of four dimmed rails reads as broken, and the argument of this
     screen is that all four layers already exist. The chips turn them OFF,
     which is the more interesting interaction anyway — it shows what the
     network is missing without one of them. */
  var layerOn = { see: true, know: true, act: true, fund: true };

  function paintLayers() {
    layerOrder.forEach(function (k) {
      var el = document.querySelector('.layer--' + k);
      if (el) { el.dataset.on = layerOn[k] ? "1" : "0"; }
      var b = document.querySelector('[data-layer="' + k + '"]');
      if (b) { b.setAttribute("aria-pressed", layerOn[k] ? "true" : "false"); }
    });
    var allOn = layerOrder.every(function (k) { return layerOn[k]; });
    var offNames = { see: "sensing", know: "a forecast", act: "a response", fund: "a payer" };
    var off = layerOrder.filter(function (k) { return !layerOn[k]; });
    if (revealAll) {
      revealAll.disabled = allOn;
      revealAll.textContent = allOn ? "All four shown" : "Show all four";
    }
    var cnt = document.getElementById("layer-count");
    if (cnt) {
      cnt.textContent = allOn
        ? "The technology already exists. What is missing is a standing agreement for who acts, who pays, and what evidence changes an insurance decision."
        : "Without " + off.map(function (k) { return offNames[k]; }).join(" and ") +
          ", the rest of it is an expensive way to watch.";
    }
    if (current === 2) { renderCounty({ layers: layerOn }); }
    refit();
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-layer]"), function (b) {
    b.addEventListener("click", function () {
      var k = b.dataset.layer;
      layerOn[k] = !layerOn[k];
      paintLayers();
      say(b.textContent.trim() + " layer " + (layerOn[k] ? "shown" : "switched off") + ".");
    });
  });

  /* "Show all four" RESTORES. It used to toggle — pressing it with every
     layer already on switched them all off, which is the opposite of what
     the label promises. It now only ever turns layers on, and disables
     itself once there is nothing left to restore. */
  var revealAll = document.getElementById("reveal-all");
  if (revealAll) {
    revealAll.addEventListener("click", function () {
      layerOrder.forEach(function (k) { layerOn[k] = true; });
      paintLayers();
      say("All four layers shown.");
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the timeline
     ══════════════════════════════════════════════════════════════════════ */

  var tlRows = [];
  var tlStep = 0, tlTimer = null;

  function paintTl() {
    /* the event is five PLACES on the terrain; the rows only annotate it */
    tlRows.forEach(function (r, i) { r.dataset.on = i < tlStep ? "1" : "0"; });
    /* The control says exactly what pressing it will do. It used to read
       "Pause" while stopped and "Replay" while running. */
    var btn = document.getElementById("tl-play");
    if (btn) {
      btn.textContent = tlTimer ? "Pause"
                      : tlStep >= tlRows.length ? "Replay from the start"
                      : tlStep === 0 ? "Play the ignition"
                      : "Resume";
    }
    var all = document.getElementById("tl-all");
    if (all) {
      all.disabled = !tlTimer && tlStep >= tlRows.length;
    }
    if (current === 3) {
      /* The five spatial moments ride the SAME step model the strip uses, so
         the map and the trace can never disagree. At rest all five are shown;
         during replay the active one is emphasised and the rest recede. */
      /* Unless a replay is actually running, the whole sequence is on the map
         — the static frame has to be understandable on its own. */
      var last = Math.max(1, tlRows.length - 1);
      var beat = tlTimer
               ? Math.max(0, Math.min(4, Math.floor((tlStep - 1) * 5 / last)))
               : 4;
      renderCounty({
        layers: { see: true, act: tlStep >= 6 },
        ignition: tlStep === 0 ? 0.45 : Math.min(1, (tlStep - 1) / 7),
        spread: tlStep >= 5,
        response: tlStep >= 6,
        event: beat,
        replaying: !!tlTimer
      });
    }
    refit();
  }

  function tlStop() { clearInterval(tlTimer); tlTimer = null; }

  /* Play / Pause / Resume / Replay, in one control that is always labelled
     with the action it performs. */
  function tlRun() {
    if (tlTimer) {
      tlStop(); paintTl();
      say("Replay paused at step " + tlStep + " of " + tlRows.length + ".");
      return;
    }
    var restarting = tlStep >= tlRows.length;
    if (restarting) { tlStep = 0; }
    tlTimer = setInterval(function () {
      tlStep++;
      if (tlStep >= tlRows.length) {
        tlStep = tlRows.length; tlStop();
        say("Replay complete. All " + tlRows.length + " steps shown.");
      }
      paintTl();
    }, 1150);
    tlStep++;
    paintTl();
    say(restarting ? "Replaying the ignition from the start." : "Replay resumed.");
  }

  function tlShowAll() {
    tlStop();
    tlStep = tlRows.length;
    paintTl();
    say("All " + tlRows.length + " steps shown.");
  }


  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  /* Each screen now asks the REGION for its beat, rather than asking a panel
     to describe one. The layer map is still what screen 2 toggles. */
  function drawFor(n) {
    if (n === 1)      { renderCounty({ layers: {}, retreat: true }); }
    else if (n === 2) { renderCounty({ layers: layerOn, network: true }); }
    else if (n === 3) { paintTl(); }
    else if (n === 4) { renderCounty({ layers: { see: true, act: true }, flows: true }); }
    else if (n === 5) { renderCounty({ layers: { see: true, act: true }, protected: true, market: true }); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim from micromutual/app.js.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this: it is what the "stop cutting
     text off the screen" pass bought.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  function anchorPlates() {
    Array.prototype.forEach.call(
      // Only CARDS get pinned to the top or bottom of their band. The
      // executive compositions place their own hero objects, and an inline
      // align-self written here would silently beat their stylesheet.
      document.querySelectorAll(".screen > .plate[style*='grid-area']"), function (el) {
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
       there bought nothing and cost everything: it drove uppercase labels to
       6.4px and notes to 7.7px across all six screens at 360, 390 and 430px
       wide. Below 900px the type holds its size and the screen scrolls. */
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

  var CTA = ["See the network", "Watch an ignition", "Follow the money",
             "See what it creates", "Back to the problem"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();
  tlRows = Array.prototype.slice.call(document.querySelectorAll("#tl .tl-row"));
  /* The timeline starts FULLY REVEALED. An unplayed stepper at 22% opacity
     reads as a disabled panel, and a reviewer who never presses the button
     would see the most important screen in the deck greyed out. The replay
     is an enhancement on a legible default, not a gate in front of one. */
  tlStep = tlRows.length;
  var tlPlay = document.getElementById("tl-play");
  if (tlPlay) { tlPlay.addEventListener("click", tlRun); }
  var tlAll = document.getElementById("tl-all");
  if (tlAll) { tlAll.addEventListener("click", tlShowAll); }
  paintLayers();

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    /* leaving screen 3 stops the clock, so it is not still running behind
       a screen that does not show it */
    if (n !== 3) { tlStop(); }

    drawFor(n);
    /* fit before the camera moves: on a phone the camera aims at whatever
       height the plates have left over, so it needs the settled layout */
    fitScreen(sc);
    moveCamera(sc.dataset.cam);
    buildPins(n);

    /* Headlines are authored as one span per line, so textContent would run
       the lines together — "Priced to the parcel.Unavailable at any price."
       Join the spans with a space instead. */
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
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);
})();
