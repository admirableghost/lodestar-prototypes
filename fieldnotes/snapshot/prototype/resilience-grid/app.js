/* ══════════════════════════════════════════════════════════════════════════
   Resilience Grid · 2036 prototype · Alder County
   No framework, no build step, no external request. Three files.

   THE GROUND
   One invented county in a world space 1600 x 1000 (crest across the top,
   Mill Creek canyon at x≈950–990, Alder left / Mill Creek centre / Rim
   right, the valley road across the front), drawn as an elevated oblique
   scene: terrain and light, vegetation, buildings and streets, one power
   corridor. The scene is generated once per resize for the live stage and
   shared by all five screens (#rg-terrain, #rg-vegetation, #rg-buildings,
   #rg-infra). Each screen's information layer is a separate group drawn
   with the same projection P(wx, wy) from the same world anchors:
   #rg-availability (1, 5), #rg-business (2), #rg-incident (3; faint on 4),
   #rg-evidence (4), #rg-labels. The camera is fixed; screens 3 and 4 zoom
   the whole scene 1.4x on the canyon by viewBox, so every layer stays
   registered.

   THE WORDS
   Every word on the terrain is SVG text on a paper tab, placed by one
   labeller that keeps it clear of the headline block, the controls, the
   chrome, the stage edge and every other label (availability labels also
   keep clear of the roofs). The copy is the locked contract: the code adds
   no word that is not in it.

   THE SEQUENCE
     1 The problem      availability retreats: Earlier / Now
     2 The business     four parts on the terrain, one hub, three
                        relationship types drawn three ways
     3 The moment       eight events, one human call
     4 The evidence     three columns over the subdued county
     5 Market creation  the current limit and one conditional limit

   WHAT IS INVENTED AND WHAT IS NOT
   Alder County, the Mill Creek lateral, the 14:31 fault and every time on
   screen 3 are invented; that provenance lives in the facilitator notes,
   not on the screens. Nothing on screen 4 is a result.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var INK      = "#36414A",
      PAPER    = "#F3EBD7",
      RULE     = "#8A959C",
      CARRIER  = "#2F5E7C",
      UTILITY  = "#5B4E7A",
      FIRE     = "#9E4A14",
      PUBLIC   = "#2F5A44",
      VENDOR   = "#7A5A17",
      ALARM    = "#A33322",
      S3_HOLD  = "#A8502A",
      SAGE     = "#5F7458";

  /* the scene's materials: one light from the upper left */
  var C = { sky: '#E6E0D0', skyLo: '#EFEADC', haze: '#9FA99C', far: '#5E7064', ridge: '#28372E', ridgeLit: '#3A4D40', forest: '#1F2C25', forestLit: '#34493B',
    slope: '#CDB996', slopeLit: '#DCCBA8', slopeSh: '#B49F79', scrub: '#8C9A7A', valley: '#DBD1B6', valleyLit: '#E5DCC4', road: '#F1EBDC', roadEdge: '#6E6A60',
    wall: '#F3EDDE', wallSh: '#B9B2A1', roof: '#2A2E2C', roofLit: '#4A5250', shadow: 'rgba(40,36,30,.28)', creek: '#6E8A99', ink: '#16150F', paper: '#F3EBD7',
    avail: '#2F4E7C', availEdge: '#223A66', label: '#1D2F55' };

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY — Alder County (world 1600 x 1000)
     ══════════════════════════════════════════════════════════════════════ */

  var CREST = [[0,318],[150,292],[310,262],[470,276],[640,238],[800,252],
               [960,224],[1120,248],[1290,214],[1450,236],[1600,210]];
  /* the crest, with the saddle the canyon cuts at x≈968 */
  function crestY(x0) {
    var x = Math.max(0, Math.min(1600, x0));
    var saddle = 70 * Math.exp(-Math.pow((x - 968) / 110, 2));
    for (var i = 0; i < CREST.length - 1; i++) {
      var a = CREST[i], b = CREST[i + 1];
      if (x >= a[0] && x <= b[0]) { return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]) + saddle; }
    }
    return 260;
  }

  /* Mill Creek canyon centreline */
  var CREEK = [[986,266],[978,340],[966,420],[952,500],[940,578],[932,648],[940,700]];

  /* the transmission line over the saddle, and the Mill Creek lateral —
     the spur that faults on screen 3 */
  var LINE = [[40,470],[200,452],[360,418],[520,372],[640,334],[800,352],
              [960,330],[1130,356],[1300,330],[1460,352],[1600,372]];
  var LATERAL = [[968,334],[984,402],[998,472],[1006,544],[1000,616]];

  var ROAD = [[-60,842],[260,828],[470,836],[690,820],[900,832],[1120,818],[1340,830],[1660,816]];
  /* the Mill Creek spur — the one road out, held open on screen 3 */
  var MILLROAD = [[968,690],[974,748],[968,800],[972,830]];

  var DISTRICTS = [380, 762, 1142];

  var SETTLEMENTS = [
    { id: "Alder",      cx: 470,  cy: 762, rx: 168, ry: 70, n: 30 },
    { id: "Mill Creek", cx: 962,  cy: 706, rx: 108, ry: 54, n: 18 },
    { id: "Rim",        cx: 1344, cy: 700, rx: 124, ry: 56, n: 22 }
  ];

  /* the service's nodes. layer: "see" is detection, "act" is response. */
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
  var ALL_ON = { see: true, know: true, act: true, fund: true };
  var HUB = { x: 800, y: 520 };

  /* the ignition, on the lateral at the canyon head */
  var IGNITION = { x: 992, y: 400 };

  /* screen 2: the managed vegetation corridor — a band on the slope below
     the ridge, from above Alder to above the Rim, cut through the canyon
     head. World x range and the two offsets from the crest. */
  var CORRIDOR = { x0: 560, x1: 1480, top: 46, bottom: 118 };
  function corridorPts() {
    var top = [], bot = [], x;
    for (x = CORRIDOR.x0; x <= CORRIDOR.x1; x += 40) {
      top.push([x, crestY(x) + CORRIDOR.top]);
      bot.push([x, crestY(x) + CORRIDOR.bottom]);
    }
    return top.concat(bot.reverse());
  }

  /* ══ insurance availability: one field, one precise edge, withdrawing
     down-valley. The current edge cuts through the upslope homes; the
     earlier edge sat at the foot of the slope. Screen 5 adds one
     conditional edge between them. Schematic, not actuarial. ══ */
  function edgeY(x) { return 716 + 14 * Math.sin(x / 170) + Math.exp(-Math.pow((x - 960) / 260, 2)) * 34 - 6 * Math.cos(x / 410); }
  function prevY(x) { return 646 + 8 * Math.sin(x / 210 + 1) + Math.exp(-Math.pow((x - 960) / 300, 2)) * 18; }
  function condY(x) { return (edgeY(x) + prevY(x)) / 2 - 6; }

  /* ══════════════════════════════════════════════════════════════════════
     THE STAGE AND THE SCENE
     One SVG, moved into the open screen. The physical scene is generated
     for the stage's size: design units W x H (= stage px / k; k shrinks
     the artwork on a narrow stage so the houses keep their proportions),
     a piecewise camera BK (iPad and SHORT variants), P(wx, wy) world ->
     design units. SC holds the live scene.
     ══════════════════════════════════════════════════════════════════════ */

  var stage = document.getElementById("stage");
  var svg = document.getElementById("plan");
  var G = {};
  var SC = null;

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }
  function isPhone()  { return window.matchMedia("(max-width: 599px)").matches; }
  function reduced()  { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function n1(v) { return (+v).toFixed(1); }
  var FONT = 'font-family="Bricolage, Helvetica Neue, Arial, sans-serif"';

  function makeScene(Wp, Hp) {
    var k = narrow ? Math.max(0.3, Math.min(1, Wp / 1180)) : 1;
    var W = Wp / k, H = Hp / k;
    var SHORT = W / H >= 1.8;
    var BK = SHORT ? [[210, .34], [560, .50], [640, .57], [860, .90], [1000, .99]] : [[210, .30], [560, .47], [640, .55], [860, .905], [1000, .99]];
    var sy = function (wy) {
      var y = Math.min(1000, wy);
      if (y < 210) { return H * (BK[0][1] - (210 - y) * (BK[1][1] - BK[0][1]) / (BK[1][0] - BK[0][0])); }
      for (var i = 0; i < BK.length - 1; i++) { var y0 = BK[i][0], f0 = BK[i][1], y1 = BK[i + 1][0], f1 = BK[i + 1][1]; if (y <= y1) { return H * (f0 + (f1 - f0) * (y - y0) / (y1 - y0)); } }
      return H * BK[3][1];
    };
    var sx = function (wx, wy) { var t = Math.max(0, Math.min(1, (wy - 210) / 790)); var spread = 0.86 + 0.18 * t; return W / 2 + (wx - 800) / 1600 * W * spread; };
    var P = function (wx, wy) { return [sx(wx, wy), sy(wy)]; };
    var path = function (pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(''); };
    var smooth = function (pts) { var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; d += 'C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; };
    var rev = function (pts) { return pts.slice().reverse().map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L'); };
    /* deterministic noise: the county is drawn identically every time */
    var seed = 7; var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    var L = { terrain: [], vegetation: [], buildings: [], infra: [] };
    var houses = []; /* footprints in design units, for the labeller */
    var i, x, y, p, pts, k2;

    /* ═══ TERRAIN & LIGHT ═══ */
    L.terrain.push('<rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>');
    /* far ridge, hazy: a second range behind the crest */
    pts = []; for (x = 620; x <= 2000; x += 80) { pts.push([sx(x, 210), sy(210) - 6 - 18 * Math.sin((x - 620) / 300) - 6 * Math.cos(x / 110)]); } pts[0][1] = sy(214);
    L.terrain.push('<path d="' + smooth(pts) + 'L' + (W + 10) + ' ' + sy(600) + 'L' + pts[0][0].toFixed(1) + ' ' + sy(600) + 'Z" fill="' + C.far + '" opacity=".4"/>');
    /* main ridge: a forested crest with a lit south-west face and a shaded face */
    pts = []; for (x = -400; x <= 2000; x += 40) { pts.push(P(x, crestY(x))); }
    var body = smooth(pts) + 'L' + (W + 10) + ' ' + sy(560) + 'L-10 ' + sy(560) + 'Z';
    L.terrain.push('<clipPath id="ridgeClip"><path d="' + body + '"/></clipPath><path d="' + body + '" fill="' + C.ridge + '"/>');
    for (i = 0; i < 4; i++) { var x0 = -40 + i * 440 + rnd() * 80; if (Math.abs(x0 + 120 - 968) < 200) { continue; } var a = P(x0, crestY(x0) + 30), b = P(x0 + 260, crestY(x0 + 260) + 40), c2 = P(x0 + 170, 540), d = P(x0 - 70, 540); L.terrain.push('<path d="' + path([a, b, c2, d]) + 'Z" fill="' + C.ridgeLit + '" opacity=".4"/>'); }
    [[330, 430, 120, 40], [1290, 470, 140, 44], [620, 500, 90, 30]].forEach(function (cl) { var cx = cl[0], cy = cl[1], rx = cl[2], ry = cl[3]; var q = []; for (var a = 0; a < Math.PI * 2; a += Math.PI / 6) { q.push(P(cx + Math.cos(a) * rx * (0.85 + rnd() * .3), cy + Math.sin(a) * ry * (0.85 + rnd() * .3))); } L.terrain.push('<path d="' + smooth(q.concat([q[0]])) + 'Z" fill="#6E7E62" opacity=".85"/>'); });
    L.terrain.push('<rect x="0" y="' + sy(215).toFixed(1) + '" width="' + W + '" height="' + (sy(560) - sy(215)).toFixed(1) + '" fill="url(#ridgeShade)" clip-path="url(#ridgeClip)"/>');
    /* foothill slope: the earth band between forest and valley, with lit and shaded facets */
    { var top = [], bot = []; for (x = -400; x <= 2000; x += 40) { top.push(P(x, crestY(x) + 250)); bot.push(P(x, 640 + 10 * Math.sin(x / 150))); }
      L.terrain.push('<path d="' + smooth(top) + 'L' + rev(bot) + 'Z" fill="' + C.slope + '"/>');
      for (i = 0; i < 7; i++) { var x1 = -40 + i * 250 + rnd() * 50; var a1 = P(x1, crestY(x1) + 250), b1 = P(x1 + 110, crestY(x1 + 110) + 240), c1 = P(x1 + 160, 640), d1 = P(x1 - 20, 640); L.terrain.push('<path d="' + path([a1, b1, c1, d1]) + 'Z" fill="' + C.slopeLit + '" opacity=".5"/>'); var e = P(x1 + 110, crestY(x1 + 110) + 240), f = P(x1 + 190, crestY(x1 + 190) + 250), g2 = P(x1 + 250, 640), h = P(x1 + 160, 640); L.terrain.push('<path d="' + path([e, f, g2, h]) + 'Z" fill="' + C.slopeSh + '" opacity=".38"/>'); }
      for (k2 = 1; k2 <= 3; k2++) { var q2 = []; for (x = -400; x <= 2000; x += 40) { q2.push(P(x, crestY(x) + 250 + k2 * 95 + 6 * Math.sin(x / 120 + k2))); } L.terrain.push('<path d="' + smooth(q2) + '" fill="none" stroke="' + C.ink + '" stroke-width=".8" opacity=".14"/>'); }
    }
    /* the canyon: a V cut from the ridge into the valley at Mill Creek — shaded west wall, lit east lip, creek at the bottom */
    { var VY = [[968, 300], [966, 380], [960, 460], [952, 540], [944, 620], [940, 690]], WD = [12, 28, 50, 80, 118, 160];
      var left = VY.map(function (v, j) { return P(v[0] - WD[j], v[1]); }), right = VY.map(function (v, j) { return P(v[0] + WD[j] * 1.08, v[1]); });
      var flankW = VY.map(function (v, j) { return P(v[0] - WD[j] - 90 - j * 16, v[1]); }), flankE = VY.map(function (v, j) { return P(v[0] + WD[j] * 1.08 + 80 + j * 14, v[1]); });
      L.terrain.push('<path d="' + smooth(flankW) + 'L' + rev(left) + 'Z" fill="url(#flankW)"/>');
      L.terrain.push('<path d="' + smooth(right) + 'L' + rev(flankE) + 'Z" fill="url(#flankE)"/>');
      L.terrain.push('<path d="' + smooth(left) + 'L' + rev(right) + 'Z" fill="url(#floor)"/>');
      L.terrain.push('<path d="' + smooth(left) + '" fill="none" stroke="#2E2A22" stroke-width="1.4" opacity=".5"/>');
      L.terrain.push('<path d="' + smooth(left) + 'L' + rev(right) + 'Z" fill="url(#floorSh)"/>');
      var m1 = P(940 + 230, 740), m2 = P(940 - 230, 740);
      L.terrain.push('<path d="' + smooth([P(940 - 200, 700), P(940 - 90, 676), P(940, 668), P(940 + 90, 676), P(940 + 200, 700)]) + 'L' + m1[0].toFixed(1) + ' ' + m1[1].toFixed(1) + 'L' + m2[0].toFixed(1) + ' ' + m2[1].toFixed(1) + 'Z" fill="' + C.slopeLit + '" opacity=".55"/>');
      L.terrain.push('<path d="' + smooth(VY.map(function (v, j) { return P(v[0] - 8 + (j % 2 ? 9 : -7), v[1]); })) + '" fill="none" stroke="' + C.creek + '" stroke-width="1" opacity=".4"/>');
    }
    /* valley floor: warm stone, lit toward the camera, with fields */
    { var vt = []; for (x = -400; x <= 2000; x += 40) { vt.push(P(x, 640 + 10 * Math.sin(x / 150))); } L.terrain.push('<path d="' + smooth(vt) + 'L' + (W + 10) + ' ' + (H + 10) + 'L-10 ' + (H + 10) + 'Z" fill="url(#valley)"/>');
      var parcel = function (px, py, pw, ph, fill, op) { L.terrain.push('<path d="' + path([P(px, py), P(px + pw, py), P(px + pw + 10, py + ph), P(px + 10, py + ph)]) + 'Z" fill="' + fill + '" opacity="' + op + '"/>'); };
      [[120, 870, 150, 50, '#C9BA93', .55], [290, 890, 120, 55, '#D2C49E', .5], [690, 860, 170, 50, '#C4B58E', .55], [860, 900, 130, 50, '#CEBF98', .5], [1130, 870, 180, 50, '#C7B891', .55], [1480, 880, 160, 55, '#D1C39D', .5]].forEach(function (a) { parcel.apply(null, a); });
      [[120, 870, 150], [690, 860, 170], [1130, 870, 180], [1480, 880, 160]].forEach(function (a) { for (var kk = 1; kk < 5; kk++) { L.terrain.push('<path d="' + path([P(a[0] + kk * a[2] / 5, a[1]), P(a[0] + 10 + kk * a[2] / 5, a[1] + 50)]) + '" stroke="' + C.ink + '" stroke-width=".7" opacity=".14"/>'); } }); }

    /* ═══ VEGETATION ═══ */
    var tree = function (tx, ty, s, dark, lit) { dark = dark || C.forest; lit = lit || C.forestLit; return '<g transform="translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ') scale(' + s.toFixed(2) + ')"><path d="M-7 0L0 -22L7 0Z" fill="' + dark + '"/><path d="M-5 -8L0 -22L2 -8Z" fill="' + lit + '" opacity=".9"/><path d="M-9 8L0 -12L9 8Z" fill="' + dark + '"/><path d="M-6 -2L0 -12L3 -2Z" fill="' + lit + '" opacity=".7"/><rect x="-1" y="8" width="2" height="4" fill="' + C.roof + '"/></g>'; };
    for (x = -300; x <= 1900; x += 34) { if (Math.abs(x - 968) < 130) { continue; } y = crestY(x) + 6 + rnd() * 20; p = P(x, y); L.vegetation.push(tree(p[0], p[1], 0.8 + rnd() * .3, '#1B261F', '#2F4336')); }
    [[120, 360, 9], [520, 330, 10], [760, 400, 7], [1140, 350, 9], [1480, 380, 10], [1560, 500, 6], [60, 520, 6]].forEach(function (m) { if (Math.abs(m[0] - 968) < 230) { return; } for (var j = 0; j < m[2]; j++) { var tx = m[0] + (rnd() - .5) * 150, ty = m[1] + (rnd() - .5) * 70; var tp = P(tx, ty); L.vegetation.push(tree(tp[0], tp[1], 0.85 + rnd() * .4)); } });
    for (x = -40; x <= 1640; x += 74) { if (Math.abs(x - 965) < 240) { continue; } if (rnd() < .3) { continue; } y = crestY(x) + 215 + rnd() * 50; p = P(x, y); L.vegetation.push(tree(p[0], p[1], 1 + rnd() * .4)); }
    [-1, 1].forEach(function (sgn) { for (var j = 0; j < 5; j++) { var ty = 320 + j * 50; var off = (20 + j * 30) * sgn + sgn * 40; var tp = P(968 + off + (rnd() - .5) * 20, ty); L.vegetation.push(tree(tp[0], tp[1], 0.8 + rnd() * .3)); } });
    var oak = function (ox, oy, s) { return '<g transform="translate(' + ox.toFixed(1) + ' ' + oy.toFixed(1) + ') scale(' + s.toFixed(2) + ')"><ellipse cx="6" cy="5" rx="13" ry="7" fill="' + C.shadow + '"/><circle cx="0" cy="-6" r="10" fill="#5F7458"/><circle cx="-4" cy="-9" r="7" fill="#78906A"/><rect x="-1.2" y="2" width="2.4" height="6" fill="' + C.roof + '"/></g>'; };
    for (i = 0; i < 16; i++) { x = rnd() * 1600; y = 560 + rnd() * 70; if (Math.abs(x - 960) < 200) { continue; } p = P(x, y); L.vegetation.push('<ellipse cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" rx="' + (10 + rnd() * 14).toFixed(1) + '" ry="' + (4 + rnd() * 5).toFixed(1) + '" fill="' + C.scrub + '" opacity=".7"/>'); }

    /* ═══ BUILDINGS & ROADS ═══ */
    { var rp = ROAD.map(function (r) { return P(r[0], r[1]); }); L.buildings.push('<path d="' + smooth(rp) + '" fill="none" stroke="' + C.roadEdge + '" stroke-width="11" opacity=".45"/><path d="' + smooth(rp) + '" fill="none" stroke="' + C.road + '" stroke-width="8"/><path d="' + smooth(rp) + '" fill="none" stroke="' + C.roadEdge + '" stroke-width=".8" stroke-dasharray="10 12" opacity=".5"/>');
      var spur = [[962, 700], [966, 760], [962, 800], [966, 830]].map(function (r) { return P(r[0], r[1]); }); L.buildings.push('<path d="' + smooth(spur) + '" fill="none" stroke="' + C.road + '" stroke-width="3.5"/>'); }
    /* a house: 2.5D block lit from the upper left — lit gable face, shaded side, dark roof plane, cast shadow */
    var house = function (hx, hy, s) { var w = 16, d = 9, h = 9, r = 7; return '<g transform="translate(' + hx.toFixed(1) + ' ' + hy.toFixed(1) + ') scale(' + s.toFixed(2) + ')">' +
      '<path d="M0 ' + h + 'L' + w + ' ' + h + 'L' + (w + d + 4) + ' ' + (h + 6) + 'L' + (d + 4) + ' ' + (h + 6) + 'Z" fill="' + C.shadow + '"/>' +
      '<path d="M' + w + ' 0L' + (w + d) + ' ' + (-d * .5) + 'L' + (w + d) + ' ' + (h - d * .5) + 'L' + w + ' ' + h + 'Z" fill="' + C.wallSh + '"/>' +
      '<path d="M0 0L' + w + ' 0L' + w + ' ' + h + 'L0 ' + h + 'Z" fill="' + C.wall + '"/>' +
      '<path d="M0 0L' + (w / 2) + ' ' + (-r) + 'L' + w + ' 0Z" fill="' + C.wall + '"/>' +
      '<path d="M' + (w / 2) + ' ' + (-r) + 'L' + (w / 2 + d) + ' ' + (-r - d * .5) + 'L' + (w + d) + ' ' + (-d * .5) + 'L' + w + ' 0Z" fill="' + C.roofLit + '"/>' +
      '<path d="M0 0L' + (w / 2) + ' ' + (-r) + 'L' + (w / 2 + d) + ' ' + (-r - d * .5) + 'L' + d + ' ' + (-d * .5) + 'Z" fill="' + C.roof + '"/>' +
      '<rect x="' + (w * .62) + '" y="' + (h * .35) + '" width="2.6" height="3.2" fill="' + C.roof + '" opacity=".7"/></g>'; };
    SETTLEMENTS.forEach(function (s) {
      var lanes = [s.cy - s.ry * .45, s.cy + s.ry * .45];
      lanes.forEach(function (ly) { L.buildings.push('<path d="' + smooth([P(s.cx - s.rx, ly + 4), P(s.cx - s.rx * .4, ly - 3), P(s.cx + s.rx * .3, ly + 2), P(s.cx + s.rx, ly - 4)]) + '" fill="none" stroke="' + C.road + '" stroke-width="3" opacity=".95"/>'); });
      L.buildings.push('<path d="' + path([P(s.cx + s.rx * .15, lanes[0]), P(s.cx + s.rx * .2, lanes[1])]) + '" stroke="' + C.road + '" stroke-width="2.4" opacity=".9"/>');
      var hs = []; var per = Math.round(s.n / 4);
      lanes.forEach(function (ly) { [-1, 1].forEach(function (side) { for (var j = 0; j < per; j++) { var t = (j + 0.5 + (side > 0 ? 0.35 : 0)) / per; var wx = s.cx - s.rx * .95 + t * s.rx * 1.9 + (rnd() - .5) * 10; var wy = ly + side * (s.ry * .22) + (rnd() - .5) * 6; if (rnd() < .12) { continue; } hs.push([wx, wy]); } }); });
      hs.sort(function (a, b) { return a[1] - b[1]; });
      hs.forEach(function (hw) { var hp = P(hw[0], hw[1]); var sc = 1.0 + (hw[1] - 640) / 260 * 0.7; var hx = hp[0] - 8 * sc, hy = hp[1] - 6 * sc; L.buildings.push(house(hx, hy, sc)); houses.push([hx, hy - 11.5 * sc, 29 * sc, 26.5 * sc]); });
      for (var j = 0; j < 4; j++) { var op = P(s.cx + (rnd() - .5) * s.rx * 1.6, s.cy + (rnd() - .5) * s.ry * 1.4); L.vegetation.push(oak(op[0], op[1], 0.9 + rnd() * .5)); }
    });

    /* ═══ INFRASTRUCTURE: one power corridor across the slope; the
       transmission line, lateral and the service's nodes are lit only on
       the screens that use them (CSS by data-screen) ═══ */
    { var cp = []; for (x = -400; x <= 2000; x += 160) { cp.push(P(x, crestY(x) + 330 + 8 * Math.sin(x / 90))); } L.infra.push('<path d="' + path(cp) + '" fill="none" stroke="' + C.ink + '" stroke-width=".9" opacity=".3"/>'); cp.forEach(function (q) { L.infra.push('<path d="M' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + 'v-9M' + (q[0] - 3).toFixed(1) + ' ' + (q[1] - 8).toFixed(1) + 'h6" stroke="' + C.ink + '" stroke-width=".9" opacity=".5" fill="none"/>'); }); }
    L.infra.push('<g class="rg-util">' +
      '<path d="' + smooth(LINE.map(function (q) { return P(q[0], q[1]); })) + '" fill="none" stroke="' + UTILITY + '" stroke-width="1.8" opacity=".7"/>' +
      '<path d="' + smooth(LATERAL.map(function (q) { return P(q[0], q[1]); })) + '" fill="none" stroke="' + UTILITY + '" stroke-width="1.4" stroke-dasharray="6 4" opacity=".65"/>' +
      '</g>');
    L.infra.push('<g class="rg-nodes">' + NODES.map(function (n) { return nodeGlyph(n, P); }).join('') + '</g>');

    return { W: W, H: H, k: k, SHORT: SHORT, P: P, sx: sx, sy: sy, path: path, smooth: smooth, L: L, houses: houses };
  }

  function nodeGlyph(n, P) {
    var c = n.k === "line" ? UTILITY : (n.k === "stn" || n.k === "pad") ? FIRE : VENDOR;
    /* a sensor beyond the crest is hidden by it in this view: it is drawn
       at the crest, where the ridge would show it */
    var wy = n.y < crestY(n.x) ? crestY(n.x) + 8 : n.y;
    var p = P(n.x, wy), x = n1(p[0]), y = +p[1].toFixed(1);
    var g = '<g class="rg-node rg-node--' + n.layer + '">';
    if (n.k === "cam") {
      g += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 12) + '" stroke="' + c + '" stroke-width="2"/>' +
           '<path d="M' + n1(p[0] - 6) + " " + y + "L" + n1(p[0] + 6) + " " + y + "L" + x + " " + (y - 9) + 'Z" fill="' + c + '"/>';
    } else if (n.k === "gnd") {
      g += '<circle cx="' + x + '" cy="' + y + '" r="3.2" fill="' + c + '"/>';
    } else if (n.k === "line") {
      g += '<rect x="' + n1(p[0] - 5) + '" y="' + (y - 5) + '" width="10" height="10" rx="1.5" fill="' + c + '"/>';
    } else if (n.k === "stn") {
      g += '<rect x="' + n1(p[0] - 8) + '" y="' + (y - 8) + '" width="16" height="16" rx="3" fill="' + PAPER + '" stroke="' + c + '" stroke-width="2"/>' +
           '<path d="M' + x + " " + (y - 4.5) + "V" + (y + 4.5) + "M" + n1(p[0] - 4.5) + " " + y + "H" + n1(p[0] + 4.5) + '" stroke="' + c + '" stroke-width="2"/>';
    } else if (n.k === "pad") {
      g += '<circle cx="' + x + '" cy="' + y + '" r="9" fill="' + PAPER + '" stroke="' + c + '" stroke-width="2"/>' +
           '<path d="M' + n1(p[0] - 4.5) + " " + (y + 2) + "L" + x + " " + (y - 3.5) + "L" + n1(p[0] + 4.5) + " " + (y + 2) + '" fill="none" stroke="' + c + '" stroke-width="2"/>';
    }
    return g + "</g>";
  }

  var DEFS = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.sky + '"/><stop offset="1" stop-color="' + C.skyLo + '"/></linearGradient>' +
    '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2D22"/><stop offset=".3" stop-color="#5E563F"/><stop offset=".7" stop-color="#8E8161"/><stop offset="1" stop-color="#AE9D78"/></linearGradient>' +
    '<linearGradient id="floorSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1E1C14" stop-opacity=".55"/><stop offset=".55" stop-color="#1E1C14" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="flankW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#28372E"/><stop offset="1" stop-color="#3B3A2C"/></linearGradient>' +
    '<linearGradient id="flankE" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A3A47C"/><stop offset="1" stop-color="#5E6E52"/></linearGradient>' +
    '<linearGradient id="ridgeShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FA99C" stop-opacity=".28"/><stop offset=".45" stop-color="#9FA99C" stop-opacity="0"/><stop offset="1" stop-color="#121A15" stop-opacity=".22"/></linearGradient>' +
    '<linearGradient id="valley" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.valley + '"/><stop offset="1" stop-color="' + C.valleyLit + '"/></linearGradient>' +
    /* screen 2's three arrowheads: filled (services bought), hollow (a proposed stake), small filled (evidence going out) */
    '<marker id="arrSolid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker>' +
    '<marker id="arrHollow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M1 1L11 6L1 11Z" fill="' + PAPER + '" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></marker>' +
    '<marker id="arrDot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker>' +
    '<radialGradient id="heat" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="' + ALARM + '" stop-opacity=".45"/><stop offset="1" stop-color="' + ALARM + '" stop-opacity="0"/></radialGradient>' +
    /* the torn edge behind every headline block (applied from CSS) and the hatch for a locked-out recloser */
    '<filter id="s3-rough" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<pattern id="s3-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="' + S3_HOLD + '" stroke-width="1.4"/></pattern>' +
    '<pattern id="veg-hatch" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><line x1="0" y1="0" x2="0" y2="11" stroke="' + C.paper + '" stroke-width="1.2" opacity=".5"/></pattern>' +
    '</defs>';

  var LAYERS = ["rg-terrain", "rg-availability", "rg-vegetation", "rg-buildings", "rg-infra", "rg-veil", "rg-business", "rg-incident", "rg-evidence", "rg-labels"];
  var INFO = ["rg-availability", "rg-business", "rg-incident", "rg-evidence", "rg-labels"];
  svg.innerHTML = DEFS + LAYERS.map(function (id) { return '<g id="' + id + '"></g>'; }).join("");
  LAYERS.forEach(function (id) { G[id] = document.getElementById(id); });

  /* the stage's pixel size: the viewport on a wide stage; on a narrow one
     the width of the flow and a height that keeps the scene's proportions */
  function stagePx() {
    if (!narrow) { return [window.innerWidth, window.innerHeight]; }
    var w = stage.clientWidth || window.innerWidth;
    return [w, Math.round(w * (isPhone() ? 1.2 : 0.85))];
  }
  var builtFor = "";
  function buildScene(force) {
    var px = stagePx();
    stage.style.height = narrow ? px[1] + "px" : "";
    var key = px[0] + "x" + px[1] + (narrow ? "n" : "");
    if (!force && key === builtFor) { return false; }
    builtFor = key;
    SC = makeScene(px[0], px[1]);
    G["rg-terrain"].innerHTML = SC.L.terrain.join("");
    G["rg-vegetation"].innerHTML = SC.L.vegetation.join("");
    G["rg-buildings"].innerHTML = SC.L.buildings.join("");
    G["rg-infra"].innerHTML = SC.L.infra.join("");
    G["rg-veil"].innerHTML = '<rect x="-10" y="-10" width="' + (SC.W + 20) + '" height="' + (SC.H + 20) + '" fill="' + C.paper + '"/>';
    return true;
  }

  /* ══ CAMERA: the fixed projection; screens 3 and 4 zoom the whole scene
     on the canyon by viewBox (<= 1.6x); reduced motion lands instantly ══ */
  var ZOOM = { 3: { z: 1.4, at: [1000, 620] }, 4: { z: 1.4, at: [1000, 620] } };
  var vb = null, camTimer = 0;
  function targetVB(n) {
    var zm = ZOOM[n];
    if (!zm || !SC) { return { x: 0, y: 0, w: SC ? SC.W : 1, h: SC ? SC.H : 1 }; }
    var c = SC.P(zm.at[0], zm.at[1]), w = SC.W / zm.z, h = SC.H / zm.z;
    return { x: Math.max(0, Math.min(SC.W - w, c[0] - w / 2)), y: Math.max(0, Math.min(SC.H - h, c[1] - h / 2)), w: w, h: h };
  }
  function setVB(c) {
    svg.setAttribute("viewBox", n1(c.x) + " " + n1(c.y) + " " + n1(c.w) + " " + n1(c.h));
    vb = c;
  }
  function moveCamera(n, instant) {
    var target = targetVB(n);
    cancelAnimationFrame(camTimer);
    if (!vb || instant || reduced() || (vb.x === target.x && vb.y === target.y && vb.w === target.w)) { setVB(target); return; }
    var from = vb, t0 = performance.now(), DUR = 540;
    (function step(now) {
      var u = Math.min(1, (now - t0) / DUR);
      var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      setVB({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e,
              w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
      if (u < 1) { camTimer = requestAnimationFrame(step); }
    })(t0);
  }

  /* ═══════════════════════════ PART 2 FOLLOWS ═══════════════════════════ */

  /* ══════════════════════════════════════════════════════════════════════
     LABELS — real SVG text on a paper tab, fixed CSS px, never under a
     block, never off the stage, never on another label; availability
     labels also keep clear of the roofs.

     frame(n)   the projection for screen n's TARGET camera: world ->
                screen px (proj) and screen px -> design units (toU), the
                rectangles a label must keep clear of, the house footprints
     labeller   tries the authored side; if that sits under a block, off the
                stage or on another label, mirrors it, then tries above and
                below; if every try fails the marker stays and the words go
                (the screen reader still has them: `dropped` lists them)
     ══════════════════════════════════════════════════════════════════════ */

  function frame(n) {
    var sr = stage.getBoundingClientRect();
    var vbT = targetVB(n);
    var s = sr.width / vbT.w, upp = 1 / s;
    var sc = screens[n - 1];
    var boxes = [];
    Array.prototype.forEach.call(sc.querySelectorAll(".xhead > *, .compare, .xask, .s3-ctl, .ev, .ev-line"), function (p) {
      var r = p.getBoundingClientRect();
      if (r.width > 2 && r.height > 2) { boxes.push(r); }
    });
    Array.prototype.forEach.call(document.querySelectorAll(".chrome button, .chrome select"), function (p) { boxes.push(p.getBoundingClientRect()); });
    var toS = function (ux, uy) { return [sr.left + (ux - vbT.x) * s, sr.top + (uy - vbT.y) * s]; };
    var solids = SC.houses.map(function (h) { var a = toS(h[0], h[1]); return { left: a[0], top: a[1], right: a[0] + h[2] * s, bottom: a[1] + h[3] * s }; });
    return {
      upp: upp, s: s, vb: vbT, sr: sr, boxes: boxes, solids: solids, placed: [], avoidSolids: false,
      size: isPhone() ? 13 : narrow ? 15 : 16,
      bounds: { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom },
      proj: function (wx, wy) { var u = SC.P(wx, wy); return toS(u[0], u[1]); },
      toU: function (x, y) { return [vbT.x + (x - sr.left) * upp, vbT.y + (y - sr.top) * upp]; }
    };
  }

  /* labels the labeller could not place on the last draw — for QA */
  var dropped = [];

  /* lines: [[text, "b"|"r", colour?], ...]  b = bold, r = regular */
  function labeller(out, f) {
    dropped = [];
    var SZ = f.size, LH = SZ * 1.3, PAD = 7;
    function textW(t, k) { return t.length * SZ * (k === "b" ? 0.55 : 0.51) + 2; }
    function box(wx, wy, lines, dx, dy, anc) {
      var p = f.proj(wx, wy), w = 0, h = lines.length * LH;
      lines.forEach(function (l) { w = Math.max(w, textW(l[0], l[1])); });
      var x = anc === "end" ? p[0] + dx - w : anc === "middle" ? p[0] + dx - w / 2 : p[0] + dx;
      return { left: x - PAD, right: x + w + PAD, top: p[1] + dy - 3, bottom: p[1] + dy + h + 3, x: x, w: w };
    }
    function hits(r, b, m) {
      return r.left < b.right + m && r.right > b.left - m && r.top < b.bottom + m && r.bottom > b.top - m;
    }
    function occluded(r, roofs) {
      var B = f.bounds, i;
      if (r.left < B.left + 4 || r.right > B.right - 4 || r.top < B.top + 4 || r.bottom > B.bottom - 4) { return true; }
      for (i = 0; i < f.boxes.length; i++) { if (hits(r, f.boxes[i], 8)) { return true; } }
      for (i = 0; i < f.placed.length; i++) { if (hits(r, f.placed[i], 2)) { return true; } }
      if (roofs) { for (i = 0; i < f.solids.length; i++) { if (hits(r, f.solids[i], 1)) { return true; } } }
      return false;
    }
    /* avoidSolids: keep clear of the roofs; strictSolids: or drop the
       label (availability); otherwise a second pass may sit on a roof */
    function place(wx, wy, lines, dx, dy, anc) {
      var h = lines.length * LH;
      var anc2 = anc === "end" ? "start" : anc === "start" ? "end" : "middle";
      var tries = [
        [dx, dy, anc], [-dx, dy, anc2], [dx, -dy - h, anc],
        [0, -h - 16, "middle"], [0, 16, "middle"],
        [dx, dy - 30, anc], [dx, dy + 30, anc], [-dx, dy - 30, anc2], [-dx, dy + 30, anc2],
        [0, -h - 44, "middle"], [0, 44, "middle"],
        [0, -h - 60, "middle"], [0, 60, "middle"]
      ];
      var B = f.bounds, passes = f.avoidSolids ? (f.strictSolids ? [true] : [true, false]) : [false];
      for (var k = 0; k < passes.length; k++) {
        for (var i = 0; i < tries.length; i++) {
          var t = tries[i], r = box(wx, wy, lines, t[0], t[1], t[2]);
          /* a label may hug the stage edge, never leave it */
          var shift = r.left < B.left + 10 ? B.left + 10 - r.left : r.right > B.right - 10 ? B.right - 10 - r.right : 0;
          if (shift) { r.left += shift; r.right += shift; r.x += shift; }
          if (!occluded(r, passes[k])) { return { anc: t[2], r: r }; }
        }
      }
      return null;
    }
    return function (wx, wy, lines, dx, dy, anc) {
      var pl = place(wx, wy, lines, dx, dy, anc);
      if (!pl) { dropped.push(lines.map(function (l) { return l[0]; }).join(" / ")); return false; }
      var r = pl.r, upp = f.upp;
      f.placed.push(r);
      var u0 = f.toU(r.left, r.top);
      out.push('<g class="lab">');
      out.push('<rect x="' + n1(u0[0]) + '" y="' + n1(u0[1]) + '" width="' + n1((r.right - r.left) * upp) + '" height="' + n1((r.bottom - r.top) * upp) +
               '" rx="' + n1(2 * upp) + '" fill="' + PAPER + '" opacity=".84"/>');
      var tx = pl.anc === "end" ? r.x + r.w : pl.anc === "middle" ? r.x + r.w / 2 : r.x;
      lines.forEach(function (l, i) {
        var u = f.toU(tx, r.top + 3 + LH * (i + 1) - LH * 0.3);
        out.push('<text x="' + n1(u[0]) + '" y="' + n1(u[1]) + '" text-anchor="' + pl.anc + '" ' + FONT +
                 ' font-size="' + n1(SZ * upp) + '" font-weight="' + (l[1] === "b" ? 700 : 400) + '" fill="' + (l[2] || INK) + '">' + l[0] + '</text>');
      });
      out.push('</g>');
      return true;
    };
  }

  /* world -> design-unit path helpers */
  function U(wx, wy) { var p = SC.P(wx, wy); return n1(p[0]) + " " + n1(p[1]); }
  function wpath(pts, close) { return SC.smooth(pts.map(function (q) { return SC.P(q[0], q[1]); })) + (close ? "Z" : ""); }
  function Qc(a, c, b) { return "M" + U(a[0], a[1]) + " Q" + U(c[0], c[1]) + " " + U(b[0], b[1]); }
  function clearInfo() { INFO.forEach(function (id) { G[id].innerHTML = ""; }); }

  /* one polite live region for state changes that are not screen changes */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 — availability: two states. S is screen 1's only state;
     nothing else reads or writes it. Only the availability group and its
     labels change between the two.
     ══════════════════════════════════════════════════════════════════════ */

  var S = { availability: "now" };
  var SAID = {
    earlier: "Earlier availability limit: the offer area reached the foot of the slope.",
    now: "Now: the current availability limit runs through the three communities. The band between the two limits is where availability has retreated."
  };
  function setAvailability(state, quiet) {
    S.availability = state;
    if (screens[0]) { screens[0].dataset.state = state; }
    Array.prototype.forEach.call(document.querySelectorAll(".compare button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.set === state));
    });
    if (!quiet) { say(SAID[state]); }
  }

  function availPaths() {
    var edge = [], prev = [], cond = [], x;
    for (x = -400; x <= 2000; x += 40) { edge.push(SC.P(x, edgeY(x))); prev.push(SC.P(x, prevY(x))); cond.push(SC.P(x, condY(x))); }
    return { edge: edge, prev: prev, cond: cond };
  }
  function area(pts) { return SC.smooth(pts) + 'L' + (SC.W + 10) + ' ' + (SC.H + 10) + 'L-10 ' + (SC.H + 10) + 'Z'; }

  function drawS1(f) {
    var A = [], T = [], q = availPaths();
    A.push('<g class="avail-state" data-state="earlier">' +
      '<path d="' + area(q.prev) + '" fill="' + C.avail + '" opacity=".11"/>' +
      '<path d="' + SC.smooth(q.prev) + '" fill="none" stroke="' + C.paper + '" stroke-width="6" opacity=".5"/>' +
      '<path d="' + SC.smooth(q.prev) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="2.2"/></g>');
    A.push('<g class="avail-state" data-state="now">' +
      '<path d="' + area(q.edge) + '" fill="' + C.avail + '" opacity=".11"/>' +
      '<path d="' + SC.smooth(q.prev) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="1.1" stroke-dasharray="3 7" stroke-linecap="round" opacity=".55"/>' +
      '<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.paper + '" stroke-width="6" opacity=".5"/>' +
      '<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="2.2"/></g>');
    G["rg-availability"].innerHTML = A.join("");

    var label = labeller(T, f), LH = f.size * 1.3;
    /* a narrow stage breaks the long tabs so they fit the band */
    var phone = isPhone();
    var EARLIER = phone ? [["Earlier", "b", C.label], ["availability limit", "b", C.label]] : [["Earlier availability limit", "b", C.label]];
    var CURRENT = phone ? [["Current", "b", C.label], ["availability limit", "b", C.label]] : [["Current availability limit", "b", C.label]];
    var RETREAT = narrow ? [["Where availability", "b", C.label], ["has retreated", "b", C.label]] : [["Where availability has retreated", "b", C.label]];
    SETTLEMENTS.forEach(function (s) { label(s.cx, s.cy + s.ry + 30, [[s.id, "b"]], 0, -LH / 2 - 4, "middle"); });
    var base = f.placed.slice();
    f.avoidSolids = true; f.strictSolids = true;
    T.push('<g class="avail-state" data-state="earlier">');
    label(130, prevY(130), EARLIER, 0, -LH * EARLIER.length - 14, "middle");
    T.push('</g>');
    f.placed = base.slice();
    T.push('<g class="avail-state" data-state="now">');
    label(130, prevY(130), EARLIER, 0, -LH * EARLIER.length - 14, "middle");
    label(130, edgeY(130), CURRENT, 0, 12, "middle");
    /* the retreat annotation: between Alder and Mill Creek, in the band */
    var rx = narrow ? 670 : 620;
    label(rx, (edgeY(rx) + prevY(rx)) / 2, RETREAT, 0, -LH * RETREAT.length / 2, "middle");
    T.push('</g>');
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══ screen 5: the current limit, and ONE conditional limit upslope ══ */
  var SAGE_INK = "#3E5640";
  function drawS5(f) {
    var A = [], T = [], q = availPaths();
    A.push('<path d="' + area(q.edge) + '" fill="' + C.avail + '" opacity=".11"/>');
    A.push('<path d="' + SC.smooth(q.cond) + '" fill="none" stroke="' + C.paper + '" stroke-width="5" opacity=".45"/>' +
           '<path d="' + SC.smooth(q.cond) + '" fill="none" stroke="' + SAGE + '" stroke-width="2.4" stroke-dasharray="9 7" stroke-linecap="round"/>');
    A.push('<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.paper + '" stroke-width="6" opacity=".5"/>' +
           '<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="2.2"/>');
    G["rg-availability"].innerHTML = A.join("");
    var label = labeller(T, f), LH = f.size * 1.3;
    var CURRENT = isPhone() ? [["Current", "b", C.label], ["availability limit", "b", C.label]] : [["Current availability limit", "b", C.label]];
    var COULD = narrow ? [["Could change with", "b", SAGE_INK], ["evidence and capital", "b", SAGE_INK]] : [["Could change with evidence and capital", "b", SAGE_INK]];
    f.avoidSolids = true; f.strictSolids = true;
    label(130, edgeY(130), CURRENT, 0, 12, "middle");
    label(620, condY(620), COULD, 0, -LH * COULD.length - 12, "middle");
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — an operating business. Four parts of the operation on the
     terrain (the managed corridor, the ridge camera, the Mill Creek pad,
     the station the contracted crews work from), joined by hairlines to
     one hub, "The operation". THREE relationship types meet the hub, each
     drawn as a different kind of line so they tell apart without colour:
       build or fund   a DASHED stake coming IN, hollow arrowhead, from a
                       dashed-outlined node — the whole link is proposed
       buy services    PAIRED SOLID rails coming IN, filled arrowhead
       use evidence    a DOTTED arrow going OUT of the hub to the insurer
     Every link ends at the hub's rim, so the arrowhead is seen. No
     shares, amounts or returns: nothing here has a size.
     ══════════════════════════════════════════════════════════════════════ */

  function drawS2(f) {
    var s = [], T = [], px = function (n) { return n * f.upp; };
    /* the hub and nodes in px: smaller on a phone's short stage */
    var HUB_PX = isPhone() ? 26 : 40, NODE_PX = isPhone() ? 11 : 16;
    var CORE_R = px(HUB_PX), LINK_R = px(NODE_PX);
    var PARTS = [
      { at: [1000, crestY(1000) + CORRIDOR.bottom], lines: [["Vegetation management", "b"]], dx: 0, dy: 10, anc: "middle" },
      { at: [1186, 240], lines: [["Detection", "b"]], dx: 16, dy: -22, anc: "start" },
      { at: [1006, 772], lines: [["Equipment", "b"]], dx: 16, dy: -10, anc: "start" },
      { at: [1032, 806], lines: [["Response crews", "b"], ["contracted", "r"]], dx: 16, dy: 2, anc: "start" }
    ];
    var LINKS = [
      { k: "fund", dir: "in",  x: 400,  y: 440, c: VENDOR,  bend: 40,  ldy: -74,
        lines: [["Build or fund", "b", VENDOR], ["insurer, utility, community", "r"], ["proposed", "b", VENDOR]] },
      { k: "buy",  dir: "in",  x: 250,  y: 640, c: PUBLIC,  bend: -40, ldy: -6,
        lines: [["Buy defined services", "b", PUBLIC], ["utility, communities, owners", "r"]] },
      { k: "use",  dir: "out", x: 1300, y: 520, c: CARRIER, bend: 0,   ldy: -22,
        lines: [["Use evidence", "b", CARRIER], ["insurer, for underwriting", "r"]] }
    ];

    /* the corridor: a thinned, lighter band in the forest below the ridge */
    var cd = wpath(corridorPts(), true);
    s.push('<path d="' + cd + '" fill="' + C.paper + '" opacity=".26"/><path d="' + cd + '" fill="url(#veg-hatch)"/>' +
           '<path d="' + cd + '" fill="none" stroke="' + C.paper + '" stroke-width="' + n1(px(1.6)) + '" opacity=".9"/>');

    var cp = SC.P(HUB.x, HUB.y);
    PARTS.forEach(function (pt) {
      var a = SC.P(pt.at[0], pt.at[1]);
      s.push('<line x1="' + n1(cp[0]) + '" y1="' + n1(cp[1]) + '" x2="' + n1(a[0]) + '" y2="' + n1(a[1]) +
             '" stroke="' + INK + '" stroke-width="' + n1(px(1.3)) + '" stroke-dasharray="' + n1(px(2)) + ' ' + n1(px(5)) + '" opacity=".6"/>');
      s.push('<circle cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" r="' + n1(px(5)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(2)) + '"/>');
    });

    /* a quadratic from a to b, bent by `bend`, trimmed so it starts and
       ends on the rims of the two circles rather than at their centres */
    function linkPath(a, ra, b, rb, bend) {
      var cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2 + bend;
      var trim = function (p, r, toward) {
        var dx = toward[0] - p[0], dy = toward[1] - p[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
        return [p[0] + dx / d * r, p[1] + dy / d * r];
      };
      var p0 = trim(a, ra, [cx, cy]), p1 = trim(b, rb, [cx, cy]);
      return "M" + n1(p0[0]) + " " + n1(p0[1]) + " Q" + n1(cx) + " " + n1(cy) + " " + n1(p1[0]) + " " + n1(p1[1]);
    }
    LINKS.forEach(function (q) {
      var qp = SC.P(q.x, q.y);
      var d = q.dir === "out"
        ? linkPath(cp, CORE_R + px(3), qp, LINK_R + px(4), px(q.bend))
        : linkPath(qp, LINK_R + px(2), cp, CORE_R + px(4), px(q.bend));
      var cx = n1(qp[0]), cy = n1(qp[1]);
      if (q.k === "fund") {
        s.push('<path d="' + d + '" fill="none" stroke="' + q.c + '" stroke-width="' + n1(px(3.4)) + '" stroke-dasharray="' + n1(px(11)) + ' ' + n1(px(8)) + '" opacity=".85" color="' + q.c + '" marker-end="url(#arrHollow)"/>');
        s.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(LINK_R) + '" fill="' + PAPER + '" stroke="' + q.c + '" stroke-width="' + n1(px(3)) + '" stroke-dasharray="' + n1(px(6)) + ' ' + n1(px(4.5)) + '"/>');
      } else if (q.k === "buy") {
        s.push('<path d="' + d + '" fill="none" stroke="' + q.c + '" stroke-width="' + n1(px(6.5)) + '" opacity=".88" color="' + q.c + '" marker-end="url(#arrSolid)"/>');
        s.push('<path d="' + d + '" fill="none" stroke="' + PAPER + '" stroke-width="' + n1(px(2)) + '"/>');
        s.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(LINK_R) + '" fill="' + PAPER + '" stroke="' + q.c + '" stroke-width="' + n1(px(3.4)) + '"/>');
      } else {
        s.push('<path d="' + d + '" fill="none" stroke="' + q.c + '" stroke-width="' + n1(px(3.2)) + '" stroke-linecap="round" stroke-dasharray="0.1 ' + n1(px(8)) + '" opacity=".92" color="' + q.c + '" marker-end="url(#arrDot)"/>');
        s.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(LINK_R) + '" fill="' + PAPER + '" stroke="' + q.c + '" stroke-width="' + n1(px(2)) + '"/>');
        s.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + n1(LINK_R - px(7)) + '" fill="none" stroke="' + q.c + '" stroke-width="' + n1(px(2)) + '"/>');
      }
    });
    s.push('<circle cx="' + n1(cp[0]) + '" cy="' + n1(cp[1]) + '" r="' + n1(CORE_R) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(3.4)) + '"/>');
    s.push('<circle cx="' + n1(cp[0]) + '" cy="' + n1(cp[1]) + '" r="' + n1(px(14)) + '" fill="' + INK + '"/>');
    G["rg-business"].innerHTML = s.join("");

    /* the hub and the three nodes are places no label may cover */
    var hp = f.proj(HUB.x, HUB.y), hr = HUB_PX - 4;
    f.placed.push({ left: hp[0] - hr, right: hp[0] + hr, top: hp[1] - hr, bottom: hp[1] + hr });
    LINKS.forEach(function (q) { var p = f.proj(q.x, q.y), nr = NODE_PX - 6; f.placed.push({ left: p[0] - nr, right: p[0] + nr, top: p[1] - nr, bottom: p[1] + nr }); });
    f.avoidSolids = true;
    var label = labeller(T, f);
    /* the hub's word sits under its rim; on a phone, where the links
       crowd the hub, it sits to the hub's left and the outbound link's
       words are placed first */
    if (isPhone()) { label(HUB.x, HUB.y, [["The operation", "b"]], -(HUB_PX + 8), -f.size * 0.65 - 3, "end"); }
    else { label(HUB.x, HUB.y, [["The operation", "b"]], 0, HUB_PX + 8, "middle"); }
    PARTS.forEach(function (pt) { label(pt.at[0], pt.at[1], pt.lines, pt.dx, pt.dy, pt.anc); });
    (isPhone() ? [LINKS[2], LINKS[0], LINKS[1]] : LINKS).forEach(function (q) {
      var left = q.x < HUB.x;
      label(q.x, q.y, q.lines, left ? 26 : -26, q.ldy, left ? "start" : "end");
    });
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the moment: eight events, three stages, one human decision

     THE DATA. Every time, place and authority class on this screen comes
     from S3_EVENTS, and nothing else on the screen is allowed to restate
     it. Kinds: obs observed · act bounded, pre-authorised action · mod
     model forecast (not a decision) · dec human decision (the network
     cannot make it). Nothing here executes the human decision, and nothing
     marks the record as proof of avoided loss.

     THE STAGES. The replay plays the eight events in order, but the viewer
     is only ever asked to read ONE stage of words at a time. The static
     default is the end state (stage 3, decision pending). "Show all" is the
     same scene with one grouped caption per stage.

     THE GRAMMAR. Incident marks are warm and alarm-coloured, the spread
     footprint dashed, the response routes solid warm lines — distinct from
     the cool availability field, which this screen does not draw.
     ══════════════════════════════════════════════════════════════════════ */

  var S3_EVENTS = [
    { n: 1, stage: 1, kind: "obs", t: "14:31", who: "Line sensor, Mill Creek lateral",
      what: ["Fault signature on the span.", "A flag, not yet a fire."],
      state: "Observed", at: [960, 330],
      lab: [["Line sensor 14:31", "b"]], dx: -22, dy: -30, anc: "end" },
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
      cap: { lines: [["Bounded response underway", "b"]], at: [968, 696], dx: -22, dy: -48, anc: "end" } },
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
      lines: [["Road held open", "b", FIRE]] },
    { id: "air",   from: 8, at: [1100, 650], dx: 18,  dy: -4,  anc: "start",
      lines: [["Aircraft holding", "b"]] },
    { id: "evac",  from: 8, at: [968, 696],  dx: -22, dy: -48, anc: "end",
      lines: [["Evacuation", "b"]] },
    { id: "drop",  from: 8, at: [972, 636],  dx: 0,   dy: -50, anc: "middle",
      lines: [["Suppression drop", "b"]] },
    { id: "chief", from: 8, at: [1124, 566], dx: 40,  dy: -34, anc: "start",
      lines: [["Duty chief", "b"], ["approval required", "r"]],
      all:   [["Decision 14:47 · pending", "b"], ["Duty chief", "b"], ["approval required", "r"]] }
  ];

  /* scene geometry, world units */
  var S3_WEDGE   = [[992,400],[1040,476],[1070,556],[1084,660],[1060,666],[962,668],[862,654],[858,576],[896,490],[936,432]];
  var S3_AIR     = [[1006, 772], [1068, 770], [1098, 724], [1100, 650]];
  var S3_AIRHOLD = [1100, 650];
  var S3_DROP    = [972, 636];
  var S3_ENGINES = [[1032, 806], [1016, 752], [996, 700], [952, 662], [934, 652]];
  var S3_GATE    = [968, 696];
  var S3_FEEDERS = [[800, 352], [1130, 356]];

  /* o.step  events reached, 0..8 · o.mode "focus" | "all" · o.live a replay
     is running (the newest event gets a ring) · o.upp design units per px */
  function drawS3(s, o, label) {
    var step = o.step, px = function (n) { return n * o.upp; };
    var stg = s3StageOf(Math.max(1, step));
    var ig = SC.P(IGNITION.x, IGNITION.y), a, p;

    if (step >= 1) {
      s.push('<path d="' + wpath(LATERAL) + '" fill="none" stroke="' + (step >= 4 ? S3_HOLD : ALARM) +
             '" stroke-width="' + n1(px(2.2)) + '" stroke-dasharray="' + n1(px(7)) + ' ' + n1(px(5)) + '" opacity=".9"/>');
    }
    if (step >= 2) {
      p = SC.P(1186, 240);
      s.push('<line x1="' + n1(p[0]) + '" y1="' + n1(p[1]) + '" x2="' + n1(ig[0]) + '" y2="' + n1(ig[1]) +
             '" stroke="' + INK + '" stroke-width="' + n1(px(1)) + '" stroke-dasharray="' + n1(px(2)) + ' ' + n1(px(5)) + '" opacity=".6"/>');
      s.push('<circle cx="' + n1(ig[0]) + '" cy="' + n1(ig[1]) + '" r="' + n1(px(step >= 3 ? 46 : 26)) + '" fill="url(#heat)"/>');
    }
    if (step >= 3) {
      p = SC.P(IGNITION.x, 120);
      s.push('<line x1="' + n1(p[0]) + '" y1="' + n1(p[1]) + '" x2="' + n1(ig[0]) + '" y2="' + n1(ig[1] - px(16)) +
             '" stroke="' + INK + '" stroke-width="' + n1(px(1)) + '" stroke-dasharray="' + n1(px(2)) + ' ' + n1(px(5)) + '" opacity=".6"/>');
      s.push('<g stroke="' + ALARM + '" stroke-width="' + n1(px(2.2)) + '">');
      for (a = 0; a < 8; a++) {
        var th = (a / 8) * Math.PI * 2;
        s.push('<line x1="' + n1(ig[0] + Math.cos(th) * px(7)) + '" y1="' + n1(ig[1] + Math.sin(th) * px(7)) +
               '" x2="' + n1(ig[0] + Math.cos(th) * px(15)) + '" y2="' + n1(ig[1] + Math.sin(th) * px(15)) + '"/>');
      }
      s.push('</g>');
      s.push('<circle cx="' + n1(ig[0]) + '" cy="' + n1(ig[1]) + '" r="' + n1(px(5)) + '" fill="' + ALARM + '"/>');
    }
    if (step >= 4) {
      S3_FEEDERS.forEach(function (q) {
        var f = SC.P(q[0], q[1]), r = px(9);
        s.push('<rect x="' + n1(f[0] - r) + '" y="' + n1(f[1] - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + PAPER +
               '" stroke="' + S3_HOLD + '" stroke-width="' + n1(px(1.8)) + '"/>' +
               '<rect x="' + n1(f[0] - r) + '" y="' + n1(f[1] - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="url(#s3-hatch)"/>');
      });
    }
    if (step >= 5) {
      /* the modelled corridor: translucent, dashed edge — a forecast */
      var wd = wpath(S3_WEDGE, true);
      s.push('<path d="' + wd + '" fill="' + C.paper + '" opacity=".28"/>');
      s.push('<path d="' + wd + '" fill="' + FIRE + '" opacity=".26"/>');
      s.push('<path d="' + wd + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(1.8)) + '" stroke-dasharray="' + n1(px(6)) + ' ' + n1(px(5)) + '" opacity=".95"/>');
    }
    if (step >= 6) {
      s.push('<path d="' + wpath(MILLROAD) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(8)) + '" opacity=".28"/>');
      s.push('<path d="' + wpath(MILLROAD) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(2)) + '"/>');
      s.push('<path d="' + wpath(S3_ENGINES) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(2.6)) + '"/>');
      [[1016, 752], [996, 700]].forEach(function (q) {
        var e = SC.P(q[0], q[1]);
        s.push('<rect x="' + n1(e[0] - px(6)) + '" y="' + n1(e[1] - px(4)) + '" width="' + n1(px(12)) + '" height="' + n1(px(8)) + '" rx="' + n1(px(1)) + '" fill="' + FIRE + '"/>');
      });
      p = SC.P(934, 652);
      s.push('<circle cx="' + n1(p[0]) + '" cy="' + n1(p[1]) + '" r="' + n1(px(4)) + '" fill="' + FIRE + '"/>');
    }
    if (step >= 7) {
      s.push('<path d="' + wpath(S3_AIR) + '" fill="none" stroke="' + S3_HOLD + '" stroke-width="' + n1(px(1.8)) + '"/>');
      [[1040, 772, -90], [1082, 752, -50], [1098, 706, -8], [1100, 664, 0]].forEach(function (q) {
        var c = SC.P(q[0], q[1]);
        s.push('<path d="M-7 4L0 -4L7 4" fill="none" stroke="' + S3_HOLD + '" stroke-width="2.2" transform="translate(' + n1(c[0]) + ' ' + n1(c[1]) + ') rotate(' + q[2] + ') scale(' + n1(o.upp) + ')"/>');
      });
    }
    if (step >= 8) {
      /* the two paths that wait on one person: dashed because pending.
         The decision is not executed here — nothing closes these. */
      var Cc = S3_EVENTS[7].at, dp = SC.P(S3_DROP[0], S3_DROP[1]), gp = SC.P(S3_GATE[0], S3_GATE[1]);
      var dash = '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(2)) + '" stroke-dasharray="' + n1(px(6)) + ' ' + n1(px(6)) + '"';
      s.push('<path d="' + Qc(S3_AIRHOLD, [1040, 626], [S3_DROP[0] + 16, S3_DROP[1] + 4]) + dash + ' opacity=".9"/>');
      s.push('<circle cx="' + n1(dp[0]) + '" cy="' + n1(dp[1]) + '" r="' + n1(px(18)) + '" fill="' + PAPER + '" opacity=".5"/>');
      s.push('<circle cx="' + n1(dp[0]) + '" cy="' + n1(dp[1]) + '" r="' + n1(px(18)) + '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(1.8)) + '" stroke-dasharray="' + n1(px(3)) + ' ' + n1(px(4)) + '"/>');
      s.push('<line x1="' + n1(gp[0] - px(13)) + '" y1="' + n1(gp[1] - px(3)) + '" x2="' + n1(gp[0] + px(13)) + '" y2="' + n1(gp[1] + px(3)) +
             '" stroke="' + INK + '" stroke-width="' + n1(px(4)) + '"/>');
      s.push('<path d="' + Qc([Cc[0] - 14, Cc[1] + 14], [1110, 626], [S3_AIRHOLD[0] + 8, S3_AIRHOLD[1] - 6]) + dash + '/>');
      s.push('<path d="' + Qc([Cc[0] - 26, Cc[1] + 10], [1030, 606], [S3_GATE[0] + 16, S3_GATE[1] - 6]) + dash + '/>');
    }

    /* ── the marks: ○ observed · ● bounded action · ◇ forecast · ■ decision ── */
    function mark(ev, emph) {
      var m = SC.P(ev.at[0], ev.at[1]), x = n1(m[0]), y = n1(m[1]), k = ev.kind, r;
      if (o.live && emph) {
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(k === "dec" ? 34 : 22)) + '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(1.2)) + '" opacity=".45"/>');
      }
      if (k === "obs") {
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(7.5)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(2)) + '"/>');
      } else if (k === "act") {
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(7.5)) + '" fill="' + INK + '"/>');
      } else if (k === "mod") {
        r = px(7.5);
        s.push('<rect x="' + n1(m[0] - r) + '" y="' + n1(m[1] - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + PAPER +
               '" stroke="' + FIRE + '" stroke-width="' + n1(px(2)) + '" stroke-dasharray="' + n1(px(3)) + ' ' + n1(px(2.5)) + '" transform="rotate(45 ' + x + ' ' + y + ')"/>');
      } else {
        r = px(11);
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(26)) + '" fill="' + PAPER + '" opacity=".9"/>');
        s.push('<circle cx="' + x + '" cy="' + y + '" r="' + n1(px(26)) + '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(1.4)) + '" stroke-dasharray="' + n1(px(4)) + ' ' + n1(px(5)) + '" opacity=".8"/>');
        s.push('<rect x="' + n1(m[0] - r) + '" y="' + n1(m[1] - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" rx="' + n1(px(2)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(3.4)) + '"/>');
      }
    }
    S3_EVENTS.forEach(function (ev, i) { if (i < step) { mark(ev, i === step - 1); } });

    if (!label) { return; }

    /* ── the words: only the stage in progress, or the grouped captions ── */
    if (o.mode === "focus" && stg < 3) {
      S3_EVENTS.forEach(function (ev, i) {
        if (i >= step || ev.stage !== stg) { return; }
        label(ev.at[0], ev.at[1], ev.lab, ev.dx, ev.dy, ev.anc);
      });
      var st = S3_STAGES[stg - 1];
      if (st.cap && step >= st.to) { label(st.cap.at[0], st.cap.at[1], st.cap.lines, st.cap.dx, st.cap.dy, st.cap.anc); }
      return;
    }
    S3_PLACES.forEach(function (q) {
      if (step < q.from) { return; }
      label(q.at[0], q.at[1], (o.mode === "all" && q.all) || q.lines, q.dx, q.dy, q.anc);
    });
    if (o.mode === "all") {
      S3_GROUPS.forEach(function (g) { label(g.at[0], g.at[1], g.lines, g.dx, g.dy, g.anc); });
    }
  }

  var tlStep = S3_EVENTS.length, tlMode = "focus", tlTimer = null;
  var STEP_MS = 1200;

  function renderS3() {
    var f = frame(3), s = [], T = [];
    clearInfo();
    f.avoidSolids = true;
    drawS3(s, { step: tlStep, mode: tlMode, live: !!tlTimer, upp: f.upp }, labeller(T, f));
    G["rg-incident"].innerHTML = s.join("");
    G["rg-labels"].innerHTML = T.join("");
    svg.dataset.act = tlStep >= 6 ? "1" : "0";
  }

  /* screen 4: the record, faint and wordless, under the columns */
  function drawS4(f) {
    var s = [];
    drawS3(s, { step: S3_EVENTS.length, mode: "focus", live: false, upp: f.upp }, null);
    G["rg-incident"].innerHTML = '<g opacity=".45">' + s.join("") + '</g>';
  }

  function paintTl() {
    var btn = document.getElementById("tl-play");
    if (btn) { btn.textContent = tlTimer ? "Pause" : "Replay"; }
    var all = document.getElementById("tl-all");
    if (all) { all.disabled = (tlMode === "all" && tlStep >= S3_EVENTS.length); }
    if (current === 3 && SC) { renderS3(); }
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
     animation: under prefers-reduced-motion the steps still arrive. */
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

  /* restart from the last screen: availability back to now, the replay to
     its default end state */
  function resetStates() {
    setAvailability("now", true);
    tlStop(); tlStep = S3_EVENTS.length; tlMode = "focus";
  }

  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function drawFor(n) {
    if (!SC) { return; }
    svg.dataset.screen = String(n);
    clearInfo();
    if (n === 1)      { drawS1(frame(1)); }
    else if (n === 2) { drawS2(frame(2)); }
    else if (n === 3) { paintTl(); }
    else if (n === 4) { drawS4(frame(4)); }
    else if (n === 5) { drawS5(frame(5)); }
  }

  /* a small hook for facilitators and the QA script */
  window.__rg = {
    stage: function (n) { tlStop(); tlMode = "focus"; tlStep = n === 1 ? 3 : n === 2 ? 7 : 8; paintTl(); },
    step:  function (k) { tlStop(); tlMode = "focus"; tlStep = Math.max(0, Math.min(8, k)); paintTl(); },
    showAll: tlShowAll,
    set: function (st) { setAvailability(st); },
    events: S3_EVENTS,
    dropped: function () { return dropped.slice(); },
    scene: function () { return SC; },
    vb: function () { return vb; }
  };

  /* screen 4's "Recorded" is read from S3_EVENTS, so the column can never
     disagree with the moment */
  (function () {
    var el = document.getElementById("ev-recorded");
    if (!el || !S3_EVENTS.length) { return; }
    el.textContent = S3_EVENTS.length + " events, " + S3_EVENTS[0].t + "–" + S3_EVENTS[S3_EVENTS.length - 1].t;
  })();

  /* ══════════════════════════════════════════════════════════════════════
     FIT — a block is never given a height it then has to clip; instead
     the whole composition gives way. The stage (.gw) is not a block.
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
      if (el.classList.contains("gw")) { return; }
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
        if (el.closest(".gw")) { return; }
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
     drawn again once --fit and the fonts have settled the blocks' boxes */
  var fitPending = null;
  function refit() {
    cancelAnimationFrame(fitPending);
    fitPending = requestAnimationFrame(function () {
      fitScreen(screens[current - 1]);
      buildScene();
      drawFor(current);
      moveCamera(current);
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

  var CTA = ["See the business", "The moment", "The evidence", "Market creation", "Back to the start"];

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
  Array.prototype.forEach.call(document.querySelectorAll(".compare button"), function (b) {
    b.addEventListener("click", function () { setAvailability(b.dataset.set); });
  });

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    /* the one stage moves into the open screen */
    var host = sc.querySelector(".gw");
    if (host && stage.parentNode !== host) { host.appendChild(stage); }
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    /* leaving screen 3 stops the clock */
    if (n !== 3) { tlStop(); }

    /* fit before the labels are placed: both read the settled layout */
    buildScene();
    fitScreen(sc);
    drawFor(n);
    moveCamera(n);
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
  nextBtn.addEventListener("click", function () {
    if (current === total) { resetStates(); }
    show(current + 1);
  });
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
      stage.style.height = "";
      screens.forEach(function (s) {
        var h = s.hidden;
        if (h) { s.hidden = false; }
        fitScreen(s);
        if (h) { s.hidden = true; }
      });
      buildScene(true);
      drawFor(current);
      moveCamera(current, true);
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
  setAvailability("now", true);
  show(fromHash() || 1, false);
  moveCamera(current, true);
})();
