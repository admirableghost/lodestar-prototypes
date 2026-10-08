/* ══════════════════════════════════════════════════════════════════════════
   Resilience Grid · 2036 prototype · Alder County
   No framework, no build step, no external request. Three files.

   THE GROUND
   One invented county in a world space 1600 x 1000 (crest across the top,
   Mill Creek canyon at x≈950–990, Alder left / Mill Creek centre / Rim
   right, the valley road across the front), drawn as an elevated oblique
   scene: terrain and light, vegetation, buildings and streets, one power
   corridor. The scene is generated once per resize for the live stage and
   shared by all six screens (#rg-terrain, #rg-vegetation, #rg-buildings,
   #rg-infra). Each screen's information layer is a separate group drawn
   with the same projection P(wx, wy) from the same world anchors:
   #rg-availability (1, 5), #rg-business (2, 4, 6), #rg-incident (3), #rg-labels.
   The camera is fixed; screen 3 zooms the whole scene 1.4x on the canyon by viewBox, so every layer stays
   registered.

   THE WORDS
   Every word on the terrain is SVG text on a paper tab, placed by one
   labeller that keeps it clear of the headline block, the controls, the
   chrome, the stage edge and every other label (availability labels also
   keep clear of the roofs). The copy is the locked contract: the code adds
   no word that is not in it.

   THE SEQUENCE (six frames, one beat each)
     1 The problem      one home loses its cover; Muse finds no offer
     2 The proposition  the prevention company; the community commissions it
     3 The moment       detect, coordinate, act; contained at the corridor
     4 The evidence     three seasons of verified record
     5 The offer        cover returns, conditional; accept or decline
     6 The venture      three paying customers; the investor's two roles

   STATE. What the household and the community did, where the incident
   stands, the season reached and the decision persist in sessionStorage;
   restart from screen 6 clears them.

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
    { k: "stn",  layer: "act",  x: 1032, y: 806, incident: true },
    { k: "stn",  layer: "act",  x: 1386, y: 838 },
    { k: "pad",  layer: "act",  x: 1006, y: 772, incident: true },
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
    /* `incident`: the station and pad screen 3's response works from */
    var g = '<g class="rg-node rg-node--' + n.layer + (n.incident ? ' rg-node--incident' : '') + '">';
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
    /* screen 2's arrowhead: the three payer marks converge on the operation */
    '<marker id="arrSolid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker>' +
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
  var ZOOM = { 3: { z: 1.4, at: [1000, 620] } };
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
    Array.prototype.forEach.call(sc.querySelectorAll(".xhead > *, .plate, .s3-ctl, .ev, .xlede--take"), function (p) {
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
     STATE — what the household and the community did, where the incident
     stands, the season reached, the decision. Restart clears it.
     ══════════════════════════════════════════════════════════════════════ */
  var STORE = "rg-state";
  var S = { asked: false, commissioned: false, step: 0, season: 1, decision: null };
  function isDefault() { return !S.asked && !S.commissioned && S.step === 0 && S.season === 1 && !S.decision; }
  function persist() { try { if (isDefault()) { sessionStorage.removeItem(STORE); } else { sessionStorage.setItem(STORE, JSON.stringify(S)); } } catch (e) { /* private mode */ } }
  function restore() {
    var v = null;
    try { v = JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (e) { v = null; }
    if (!v || typeof v !== "object") { return; }
    S.asked = v.asked === true; S.commissioned = v.commissioned === true;
    S.step = Math.max(0, Math.min(3, v.step | 0));
    S.season = Math.max(1, Math.min(3, (v.season | 0) || 1));
    S.decision = (v.decision === "accept" || v.decision === "decline") ? v.decision : null;
  }
  function resetStates() {
    tlStop();
    S = { asked: false, commissioned: false, step: 0, season: 1, decision: null };
    try { sessionStorage.removeItem(STORE); } catch (e) { /* private mode */ }
  }

  /* the one household the story follows: no. 12, on the upper lane of Mill Creek */
  var HOME = { x: 990, y: 722 };
  var CURRENT_LABEL = function () { return isPhone() ? [["Current", "b", C.label], ["availability limit", "b", C.label]] : [["Current availability limit", "b", C.label]]; };

  function availPaths() {
    var edge = [], prev = [], cond = [], x;
    for (x = -400; x <= 2000; x += 40) { edge.push(SC.P(x, edgeY(x))); prev.push(SC.P(x, prevY(x))); cond.push(SC.P(x, condY(x))); }
    return { edge: edge, prev: prev, cond: cond };
  }
  function area(pts) { return SC.smooth(pts) + 'L' + (SC.W + 10) + ' ' + (SC.H + 10) + 'L-10 ' + (SC.H + 10) + 'Z'; }
  function homeRing(out, px, col) {
    var h = SC.P(HOME.x, HOME.y);
    out.push('<circle cx="' + n1(h[0]) + '" cy="' + n1(h[1] - px(4)) + '" r="' + n1(px(17)) + '" fill="none" stroke="' + C.paper + '" stroke-width="' + n1(px(5)) + '" opacity=".85"/>' +
             '<circle cx="' + n1(h[0]) + '" cy="' + n1(h[1] - px(4)) + '" r="' + n1(px(17)) + '" fill="none" stroke="' + col + '" stroke-width="' + n1(px(2.4)) + '"/>');
  }
  function settlementLabels(label, LH, which) {
    SETTLEMENTS.forEach(function (s) { if (which && which.indexOf(s.id) < 0) { return; } label(s.cx, s.cy + s.ry + 30, [[s.id, "b"]], 0, -LH / 2 - 4, "middle"); });
  }

  /* ══ screen 1: the field as it is now, and the one home outside it ══ */
  function drawS1(f) {
    var A = [], T = [], q = availPaths(), px = function (n) { return n * f.upp; };
    A.push('<path d="' + area(q.edge) + '" fill="' + C.avail + '" opacity=".11"/>');
    A.push('<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.paper + '" stroke-width="6" opacity=".5"/>' +
           '<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="2.2"/>');
    homeRing(A, px, ALARM);
    G["rg-availability"].innerHTML = A.join("");
    var label = labeller(T, f), LH = f.size * 1.3;
    settlementLabels(label, LH, ["Mill Creek"]);
    f.avoidSolids = true; f.strictSolids = true;
    label(HOME.x, HOME.y, [["No. 12", "b", ALARM]], 24, -LH / 2 - 6, "start");
    label(130, edgeY(130), CURRENT_LABEL(), 0, 12, "middle");
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══ screen 2: the corridor and the contracted parts, named as things ══ */
  var PARTS = [
    { at: [1000, crestY(1000) + CORRIDOR.bottom], lines: [["Vegetation corridor", "b"], ["maintained", "r"]], dx: 0, dy: 10, anc: "middle" },
    { at: [1186, 240], lines: [["Detection", "b"], ["contracted", "r"]], dx: 16, dy: -22, anc: "start", ph: { dx: 16, dy: -40, anc: "start" } },
    { at: [1006, 772], lines: [["Aircraft", "b"], ["contracted", "r"]], dx: 16, dy: -10, anc: "start" },
    { at: [1032, 806], lines: [["Crews", "b"], ["contracted", "r"]], dx: 16, dy: 2, anc: "start" }
  ];
  function corridorDraw(s, px, strong) {
    var cd = wpath(corridorPts(), true);
    s.push('<path d="' + cd + '" fill="' + C.paper + '" opacity="' + (strong ? ".3" : ".2") + '"/><path d="' + cd + '" fill="url(#veg-hatch)"/>' +
           '<path d="' + cd + '" fill="none" stroke="' + C.paper + '" stroke-width="' + n1(px(1.6)) + '" opacity=".9"/>');
  }
  function partRings(s, px) {
    PARTS.forEach(function (pt) {
      var a = SC.P(pt.at[0], pt.at[1]);
      s.push('<circle cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" r="' + n1(px(11)) + '" fill="' + PAPER + '" opacity=".75"/>' +
             '<circle cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" r="' + n1(px(8)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(2.6)) + '"/>' +
             '<circle cx="' + n1(a[0]) + '" cy="' + n1(a[1]) + '" r="' + n1(px(3.2)) + '" fill="' + INK + '"/>');
    });
  }
  function drawS2(f) {
    var s = [], T = [], px = function (n) { return n * f.upp; };
    corridorDraw(s, px, true);
    partRings(s, px);
    G["rg-business"].innerHTML = s.join("");
    f.avoidSolids = true;
    var label = labeller(T, f);
    PARTS.forEach(function (pt) { var at = (isPhone() && pt.ph) || pt; label(pt.at[0], pt.at[1], pt.lines, at.dx, at.dy, at.anc); });
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the moment, three beats: detect · coordinate · act. The
     prepared corridor across the canyon mouth is where the fire stops.
     The authority that approves the drop and the road closure is the
     district's; Resilience Grid coordinates, it does not authorise.
     ══════════════════════════════════════════════════════════════════════ */
  var S3_WEDGE   = [[992,400],[1040,476],[1070,556],[1084,660],[1060,666],[962,668],[862,654],[858,576],[896,490],[936,432]];
  var S3_HELD    = [[992,400],[1040,476],[1062,548],[1050,572],[990,580],[930,574],[880,560],[896,490],[936,432]];   /* the footprint, stopped at the break */
  var BREAK      = [[840,598],[900,580],[960,572],[1020,576],[1090,590],[1140,610]];  /* the prepared corridor across the canyon mouth */
  var S3_AIR     = [[1006, 772], [1068, 770], [1098, 724], [1100, 650]];
  var S3_ENGINES = [[1032, 806], [1016, 752], [996, 700], [960, 640], [930, 600]];
  var S3_STEPS = [
    { title: "Detect",     note: "Resilience Grid's contracted sensors flag the ignition at the canyon head and model its likely path toward Mill Creek. A forecast, not a decision." },
    { title: "Coordinate", note: "Resilience Grid coordinates the utility, which de-energises its line, and the contracted aircraft, which launch and hold. Fire District 3 approves the drop and the road closure." },
    { title: "Act",        note: "Crews work the prepared corridor above the homes while the evacuation route stays open. The fire reaches the corridor and stops. No homes reached." }
  ];
  var S3_LABELS = [
    { step: -1, from: 1, at: [842, 736], dx: -6, dy: -18, anc: "end", lines: [["Mill Creek", "b"], ["320 homes", "r"]] },
    { step: 0, from: 1, at: [992, 400],  dx: 26, dy: -14, anc: "start", lines: [["Ignition detected 15:02", "b"], ["likely path · Mill Creek", "r"]] },
    { step: 1, from: 2, at: [800, 520],  dx: -18, dy: -22, anc: "end", ph: { dx: -10, dy: -48, anc: "end" }, lines: [["Resilience Grid", "b"], ["coordinating", "r"]] },
    { step: 1, from: 2, at: [1130, 356], dx: 22, dy: -30, anc: "start", lines: [["Utility · line de-energised", "b", UTILITY]] },
    { step: 1, from: 2, at: [1100, 650], dx: 18, dy: -12, anc: "start", ph: { dx: 18, dy: -40, anc: "start" }, lines: [["Aircraft · launched, holding", "b"]] },
    { step: 1, from: 2, at: [1032, 806], dx: 18, dy: -4, anc: "start", lines: [["Fire District 3", "b", FIRE], ["approves drop and road closure", "r", FIRE]], phone: [["Fire District 3", "b", FIRE], ["approves drop,", "r", FIRE], ["road closure", "r", FIRE]] },
    { step: 2, from: 3, at: [930, 600],  dx: -20, dy: -24, anc: "end", ph: { dx: -14, dy: -50, anc: "end" }, lines: [["Crews at the", "b", FIRE], ["prepared corridor", "b", FIRE]] },
    { step: 2, from: 3, at: [968, 800],  dx: -16, dy: -20, anc: "end", lines: [["Evacuation route open", "b", FIRE]] },
    { step: 2, from: 3, at: [1060, 548], dx: 22, dy: -10, anc: "start", lines: [["Contained 15:41", "b"], ["no homes reached", "r"]] }
  ];
  function roadHold(s, px) {
    s.push('<path d="' + wpath(MILLROAD) + '" fill="none" stroke="' + C.paper + '" stroke-width="' + n1(px(12)) + '" opacity=".7"/>');
    s.push('<path d="' + wpath(MILLROAD) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(8)) + '" opacity=".28"/>');
    s.push('<path d="' + wpath(MILLROAD) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(2.4)) + '"/>');
  }
  /* o.step beats reached 0..3 · o.live a replay is running */
  function drawS3(s, o, label) {
    var step = o.step, px = function (n) { return n * o.upp; };
    var ig = SC.P(IGNITION.x, IGNITION.y), p, a;
    var cur = Math.max(0, step - 1);
    var FAINT = '<g opacity=".4">', END = '</g>';
    /* the prepared corridor across the canyon mouth: there from the first beat, the hero of the third */
    var bk = SC.smooth(BREAK.map(function (q) { return SC.P(q[0], q[1]); }));
    s.push('<path d="' + bk + '" fill="none" stroke="' + C.paper + '" stroke-width="' + n1(px(step >= 3 ? 16 : 11)) + '" opacity="' + (step >= 3 ? ".8" : ".45") + '"/>' +
           '<path d="' + bk + '" fill="none" stroke="' + SAGE + '" stroke-width="' + n1(px(step >= 3 ? 7 : 5)) + '" opacity="' + (step >= 3 ? ".95" : ".6") + '" stroke-dasharray="' + n1(px(10)) + ' ' + n1(px(5)) + '"/>');
    if (step >= 1) {
      /* the threatened community and its one road out, at stake from the first beat */
      var mc = SC.P(962, 712); mc[1] += px(4);
      s.push('<ellipse cx="' + n1(mc[0]) + '" cy="' + n1(mc[1]) + '" rx="' + n1(px(132)) + '" ry="' + n1(px(88)) + '" fill="' + ALARM + '" opacity="' + (step >= 3 ? ".04" : ".09") + '"/>' +
             '<ellipse cx="' + n1(mc[0]) + '" cy="' + n1(mc[1]) + '" rx="' + n1(px(132)) + '" ry="' + n1(px(88)) + '" fill="none" stroke="' + ALARM + '" stroke-width="' + n1(px(1.4)) + '" stroke-dasharray="' + n1(px(4)) + ' ' + n1(px(5)) + '" opacity="' + (step >= 3 ? ".25" : ".7") + '"/>');
      if (step < 3) { s.push('<path d="' + wpath(MILLROAD) + '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(2.2)) + '" opacity=".32" stroke-dasharray="' + n1(px(5)) + ' ' + n1(px(5)) + '"/>'); }
      /* the likely path: a dashed forecast, until the fire is held */
      var wd = wpath(step >= 3 ? S3_HELD : S3_WEDGE, true);
      s.push('<path d="' + wd + '" fill="' + C.paper + '" opacity=".28"/>');
      s.push('<path d="' + wd + '" fill="' + (step >= 3 ? ALARM : FIRE) + '" opacity="' + (step >= 3 ? ".3" : ".22") + '"/>');
      s.push('<path d="' + wd + '" fill="none" stroke="' + (step >= 3 ? ALARM : FIRE) + '" stroke-width="' + n1(px(1.8)) + '"' + (step >= 3 ? '' : ' stroke-dasharray="' + n1(px(6)) + ' ' + n1(px(5)) + '"') + ' opacity=".95"/>');
      /* the ignition */
      s.push('<circle cx="' + n1(ig[0]) + '" cy="' + n1(ig[1]) + '" r="' + n1(px(40)) + '" fill="url(#heat)"/>');
      s.push('<g stroke="' + ALARM + '" stroke-width="' + n1(px(2.2)) + '">');
      for (a = 0; a < 8; a++) { var th = (a / 8) * Math.PI * 2; s.push('<line x1="' + n1(ig[0] + Math.cos(th) * px(7)) + '" y1="' + n1(ig[1] + Math.sin(th) * px(7)) + '" x2="' + n1(ig[0] + Math.cos(th) * px(15)) + '" y2="' + n1(ig[1] + Math.sin(th) * px(15)) + '"/>'); }
      s.push('</g><circle cx="' + n1(ig[0]) + '" cy="' + n1(ig[1]) + '" r="' + n1(px(5)) + '" fill="' + ALARM + '"/>');
      p = SC.P(1186, 240);
      s.push('<line x1="' + n1(p[0]) + '" y1="' + n1(p[1]) + '" x2="' + n1(ig[0]) + '" y2="' + n1(ig[1]) + '" stroke="' + INK + '" stroke-width="' + n1(px(1)) + '" stroke-dasharray="' + n1(px(2)) + ' ' + n1(px(5)) + '" opacity="' + (cur === 0 ? ".6" : ".25") + '"/>');
    }
    if (step >= 2) {
      if (cur > 1) { s.push(FAINT); }
      /* the utility's line, de-energised; the aircraft's path and hold; the hub coordinating; the district's approval */
      s.push('<path d="' + wpath(LATERAL) + '" fill="none" stroke="' + S3_HOLD + '" stroke-width="' + n1(px(2.2)) + '" stroke-dasharray="' + n1(px(7)) + ' ' + n1(px(5)) + '" opacity=".9"/>');
      var fq = SC.P(1130, 356), r = px(9);
      s.push('<rect x="' + n1(fq[0] - r) + '" y="' + n1(fq[1] - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="' + PAPER + '" stroke="' + S3_HOLD + '" stroke-width="' + n1(px(1.8)) + '"/><rect x="' + n1(fq[0] - r) + '" y="' + n1(fq[1] - r) + '" width="' + n1(r * 2) + '" height="' + n1(r * 2) + '" fill="url(#s3-hatch)"/>');
      s.push('<path d="' + wpath(S3_AIR) + '" fill="none" stroke="' + S3_HOLD + '" stroke-width="' + n1(px(1.8)) + '"/>');
      [[1040, 772, -90], [1082, 752, -50], [1098, 706, -8], [1100, 664, 0]].forEach(function (q) { var c = SC.P(q[0], q[1]); s.push('<path d="M-7 4L0 -4L7 4" fill="none" stroke="' + S3_HOLD + '" stroke-width="2.2" transform="translate(' + n1(c[0]) + ' ' + n1(c[1]) + ') rotate(' + q[2] + ') scale(' + n1(o.upp) + ')"/>'); });
      var hb = SC.P(800, 520);
      s.push('<circle cx="' + n1(hb[0]) + '" cy="' + n1(hb[1]) + '" r="' + n1(px(14)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(2.6)) + '"/><circle cx="' + n1(hb[0]) + '" cy="' + n1(hb[1]) + '" r="' + n1(px(5)) + '" fill="' + INK + '"/>');
      [[1130, 356], [1100, 650], [1032, 806]].forEach(function (q) { s.push('<path d="' + Qc([800, 520], [(800 + q[0]) / 2, Math.min(520, q[1]) - 40], q) + '" fill="none" stroke="' + INK + '" stroke-width="' + n1(px(1.1)) + '" stroke-dasharray="' + n1(px(3)) + ' ' + n1(px(4)) + '" opacity=".55"/>'); });
      var ap = SC.P(1032, 806), ar = px(12);
      s.push('<circle cx="' + n1(ap[0]) + '" cy="' + n1(ap[1]) + '" r="' + n1(ar) + '" fill="' + PAPER + '" stroke="' + FIRE + '" stroke-width="' + n1(px(2.4)) + '"/><path d="M' + n1(ap[0] - px(5)) + ' ' + n1(ap[1]) + 'L' + n1(ap[0] - px(1)) + ' ' + n1(ap[1] + px(4)) + 'L' + n1(ap[0] + px(6)) + ' ' + n1(ap[1] - px(4)) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(2.4)) + '" stroke-linecap="round"/>');
      if (cur > 1) { s.push(END); }
    }
    if (step >= 3) {
      roadHold(s, px);
      s.push('<path d="' + wpath(S3_ENGINES) + '" fill="none" stroke="' + FIRE + '" stroke-width="' + n1(px(2.6)) + '"/>');
      [[1016, 752], [996, 700], [960, 640]].forEach(function (q) { var e = SC.P(q[0], q[1]); s.push('<rect x="' + n1(e[0] - px(6)) + '" y="' + n1(e[1] - px(4)) + '" width="' + n1(px(12)) + '" height="' + n1(px(8)) + '" rx="' + n1(px(1)) + '" fill="' + FIRE + '"/>'); });
      /* the fire's edge, stopped on the corridor: a solid line along the break */
      s.push('<path d="' + bk + '" fill="none" stroke="' + ALARM + '" stroke-width="' + n1(px(2.4)) + '" opacity=".9"/>');
    }
    if (!label) { return; }
    S3_LABELS.forEach(function (q) {
      if (step < q.from) { return; }
      if (q.step >= 0 && q.step !== cur) { return; }
      var lines = (isPhone() && q.phone) || q.lines, at = (isPhone() && q.ph) || q;
      label(q.at[0], q.at[1], lines, at.dx, at.dy, at.anc);
    });
  }
  var tlTimer = null, STEP_MS = 1700, detail = false;
  function renderS3() {
    var f = frame(3), s = [], T = [];
    clearInfo();
    f.avoidSolids = true;
    drawS3(s, { step: S.step, live: !!tlTimer, upp: f.upp }, detail ? null : labeller(T, f));
    G["rg-incident"].innerHTML = s.join("");
    G["rg-labels"].innerHTML = T.join("");
    svg.dataset.act = S.step >= 3 ? "1" : "0";
    svg.dataset.see = S.step === 1 ? "1" : "0";
  }
  function paintTl() {
    var btn = document.getElementById("tl-play"), nx = document.getElementById("tl-step"), all = document.getElementById("tl-all"), now = document.getElementById("tl-now"), take = document.getElementById("take-3");
    if (btn) { btn.textContent = tlTimer ? "Pause" : "Replay"; btn.setAttribute("aria-pressed", tlTimer ? "true" : "false"); }
    if (nx) { nx.disabled = S.step >= 3; }
    if (all) { all.disabled = S.step >= 3; }
    if (now) { now.innerHTML = S.step === 0 ? "<b>Ready</b> · press Next step" : "<b>" + S.step + " of 3</b> · " + S3_STEPS[S.step - 1].title; }
    if (take) { take.hidden = S.step < 3 || detail; }
    var mb = document.getElementById("more-3"), mp = document.getElementById("more-panel");
    if (mb) { mb.setAttribute("aria-expanded", detail ? "true" : "false"); mb.textContent = detail ? "Close detail" : "Operational detail"; }
    if (mp) { mp.hidden = !detail; }
    if (current === 3 && SC) { renderS3(); }
    paintCta();
    persist();
  }
  function tlStop() { clearInterval(tlTimer); tlTimer = null; }
  function tlNext() {
    tlStop();
    if (S.step >= 3) { return; }
    S.step += 1; paintTl();
    say("Step " + S.step + " of 3, " + S3_STEPS[S.step - 1].title + ". " + S3_STEPS[S.step - 1].note);
  }
  function tlRun() {
    if (tlTimer) { tlStop(); paintTl(); say("Paused at step " + S.step + " of 3."); return; }
    S.step = 0; paintTl();
    tlNext();
    tlTimer = setInterval(function () { if (S.step >= 3) { tlStop(); paintTl(); return; } tlNext(); if (S.step >= 3) { tlStop(); paintTl(); } }, STEP_MS);
    paintTl();
  }
  function tlFinish() { tlStop(); S.step = 3; paintTl(); say("The incident, complete. " + S3_STEPS.map(function (st, i) { return "Step " + (i + 1) + ", " + st.title + ": " + st.note; }).join(" ")); }

  /* ══ screen 4: three seasons of record over the subdued county ══ */
  var SEASONS = [
    { prev: "44 km corridor maintained", resp: "Mill Creek fire held at the corridor", exp: "Assessment pending" },
    { prev: "44 km corridor · 2 fuel breaks", resp: "Mill Creek fire held · 2 more · 1 late", exp: "Assessment pending" },
    { prev: "44 km corridor · 2 fuel breaks · 61 homes hardened", resp: "Mill Creek fire held · 3 more · 1 late", exp: "Loss modelled −28% · risk remains above Rim" }
  ];
  function paintSeason() {
    var k = S.season, sn = SEASONS[k - 1];
    var set = function (id, t) { var e = document.getElementById(id); if (e) { e.textContent = t; } };
    var now = document.getElementById("season-now"); if (now) { now.innerHTML = "<b>Season " + k + "</b>"; }
    set("ev-prev", sn.prev); set("ev-resp", sn.resp); set("ev-exp", sn.exp);
    var col = document.getElementById("ev-exp-col"); if (col) { col.classList.toggle("ev-col--open", k < 3); }
    var ver = document.getElementById("ev-ver"); if (ver) { ver.hidden = k < 3; }
    var nx = document.getElementById("season-next");
    if (nx) { nx.disabled = k >= 3; }
    if (current === 4 && SC) { drawFor(4); }
    paintCta(); persist();
  }
  function seasonNext() { if (S.season >= 3) { return; } S.season += 1; paintSeason(); say("Season " + S.season + ". Prevention: " + SEASONS[S.season - 1].prev + ". Response: " + SEASONS[S.season - 1].resp + ". Exposure: " + SEASONS[S.season - 1].exp + "." + (S.season === 3 ? " Verified by an independent review; Kestrel Mutual uses it in a new underwriting assessment." : "")); }
  function seasonAll() { S.season = 3; paintSeason(); say("All three seasons. " + SEASONS[2].prev + ". " + SEASONS[2].resp + ". " + SEASONS[2].exp + ". Verified by an independent review; Kestrel Mutual uses it in a new underwriting assessment."); }
  function drawS4(f) {
    var s = [], T = [], px = function (n) { return n * f.upp; };
    corridorDraw(s, px, S.season >= 1);
    if (S.season >= 2) {
      /* two fuel breaks: the canyon-mouth break and one above Rim */
      [BREAK, [[1240, 600], [1300, 584], [1360, 578], [1420, 586], [1470, 602]]].forEach(function (b) { var d = SC.smooth(b.map(function (q) { return SC.P(q[0], q[1]); })); s.push('<path d="' + d + '" fill="none" stroke="' + C.paper + '" stroke-width="' + n1(px(10)) + '" opacity=".5"/><path d="' + d + '" fill="none" stroke="' + SAGE + '" stroke-width="' + n1(px(4.5)) + '" stroke-dasharray="' + n1(px(10)) + ' ' + n1(px(5)) + '" opacity=".85"/>'); });
    }
    if (S.season >= 3) {
      /* what remains: the wind-driven exposure above Rim, hatched, not hidden */
      var zone = [[1250, 340], [1480, 330], [1560, 420], [1500, 520], [1300, 530], [1240, 440]];
      var zd = wpath(zone, true);
      s.push('<path d="' + zd + '" fill="url(#s3-hatch)" opacity=".55"/><path d="' + zd + '" fill="none" stroke="' + S3_HOLD + '" stroke-width="' + n1(px(1.6)) + '" stroke-dasharray="' + n1(px(5)) + ' ' + n1(px(4)) + '"/>');
    }
    var mc = SC.P(962, 712); mc[1] += px(4);
    s.push('<ellipse cx="' + n1(mc[0]) + '" cy="' + n1(mc[1]) + '" rx="' + n1(px(132)) + '" ry="' + n1(px(88)) + '" fill="none" stroke="' + SAGE + '" stroke-width="' + n1(px(1.6)) + '" opacity=".7"/>');
    G["rg-business"].innerHTML = s.join("");
    var label = labeller(T, f), LH = f.size * 1.3;
    f.avoidSolids = true;
    settlementLabels(label, LH, ["Mill Creek"]);
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══ screen 5: the field after — an offer area above the current limit, no. 12 inside it ══ */
  function drawS5(f) {
    var A = [], T = [], q = availPaths(), px = function (n) { return n * f.upp; };
    A.push('<path d="' + area(q.cond) + '" fill="' + C.avail + '" opacity=".11"/>');
    A.push('<path d="' + SC.smooth(q.edge) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="1.1" stroke-dasharray="3 7" stroke-linecap="round" opacity=".55"/>');
    A.push('<path d="' + SC.smooth(q.cond) + '" fill="none" stroke="' + C.paper + '" stroke-width="6" opacity=".5"/><path d="' + SC.smooth(q.cond) + '" fill="none" stroke="' + C.availEdge + '" stroke-width="2.2"/>');
    homeRing(A, px, S.decision === "accept" ? CARRIER : S.decision === "decline" ? INK : C.availEdge);
    G["rg-availability"].innerHTML = A.join("");
    var label = labeller(T, f), LH = f.size * 1.3;
    settlementLabels(label, LH, ["Mill Creek"]);
    f.avoidSolids = true; f.strictSolids = true;
    label(HOME.x, HOME.y, [["No. 12", "b", C.label]], 24, -LH / 2 - 6, "start");
    label(130, condY(130), isPhone() ? [["Offer area", "b", C.label], ["service active", "r", C.label]] : [["Offer area · service active", "b", C.label]], 0, 12, "middle");
    G["rg-labels"].innerHTML = T.join("");
  }
  function paintOffer() {
    var acc = document.getElementById("accept"), dec = document.getElementById("decline"), done = document.getElementById("decided");
    if (acc) { acc.setAttribute("aria-pressed", S.decision === "accept" ? "true" : "false"); }
    if (dec) { dec.setAttribute("aria-pressed", S.decision === "decline" ? "true" : "false"); }
    if (done) { done.hidden = !S.decision; done.textContent = S.decision === "accept" ? "Accepted · cover from 1 July 2037, service active" : S.decision === "decline" ? "Declined · no cover; offer open 30 days" : ""; }
    if (current === 5 && SC) { drawFor(5); }
    persist();
  }

  /* ══ screen 6: the hub and three paying customers; the investor's line, distinct ══ */
  var PAYERS = [
    { x: 330, y: 400, c: PUBLIC,  bend: 34,  lines: [["Municipality", "b", PUBLIC], ["readiness, response coordination", "r", PUBLIC]], phone: [["Municipality", "b", PUBLIC], ["readiness, coordination", "r", PUBLIC]] },
    { x: 230, y: 560, c: VENDOR,  bend: 0,   lines: [["Residents", "b", VENDOR], ["local prevention, protection", "r", VENDOR]] },
    { x: 330, y: 690, c: CARRIER, bend: -34, lines: [["Insurers", "b", CARRIER], ["verified risk services", "r", CARRIER]] }
  ];
  function drawS6(f) {
    var s = [], T = [], px = function (n) { return n * f.upp; };
    var HUB_PX = isPhone() ? 24 : 36, NODE_PX = isPhone() ? 10 : 13, CORE_R = px(HUB_PX), MARK_R = px(NODE_PX), LH = f.size * 1.3;
    corridorDraw(s, px, true);
    var mc = SC.P(962, 712); mc[1] += px(4);
    s.push('<ellipse cx="' + n1(mc[0]) + '" cy="' + n1(mc[1]) + '" rx="' + n1(px(132)) + '" ry="' + n1(px(88)) + '" fill="' + SAGE + '" opacity=".12"/><ellipse cx="' + n1(mc[0]) + '" cy="' + n1(mc[1]) + '" rx="' + n1(px(132)) + '" ry="' + n1(px(88)) + '" fill="none" stroke="' + SAGE + '" stroke-width="' + n1(px(1.6)) + '" opacity=".8"/>');
    function linkPath(a, ra, b, rb, bend) {
      var cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2 + bend;
      var trim = function (p, r, toward) { var dx = toward[0] - p[0], dy = toward[1] - p[1], d = Math.sqrt(dx * dx + dy * dy) || 1; return [p[0] + dx / d * r, p[1] + dy / d * r]; };
      var p0 = trim(a, ra, [cx, cy]), p1 = trim(b, rb, [cx, cy]);
      return "M" + n1(p0[0]) + " " + n1(p0[1]) + " Q" + n1(cx) + " " + n1(cy) + " " + n1(p1[0]) + " " + n1(p1[1]);
    }
    var cp = SC.P(HUB.x, HUB.y);
    PAYERS.forEach(function (q) {
      var qp = SC.P(q.x, q.y), d = linkPath(qp, MARK_R + px(2), cp, CORE_R + px(4), px(q.bend));
      s.push('<path d="' + d + '" fill="none" stroke="' + PAPER + '" stroke-width="' + n1(px(6)) + '" opacity=".55"/>');
      s.push('<path d="' + d + '" fill="none" stroke="' + q.c + '" stroke-width="' + n1(px(2.2)) + '" opacity=".8" color="' + q.c + '" marker-end="url(#arrSolid)"/>');
      s.push('<circle cx="' + n1(qp[0]) + '" cy="' + n1(qp[1]) + '" r="' + n1(MARK_R) + '" fill="' + PAPER + '" stroke="' + q.c + '" stroke-width="' + n1(px(3)) + '"/><circle cx="' + n1(qp[0]) + '" cy="' + n1(qp[1]) + '" r="' + n1(px(4)) + '" fill="' + q.c + '"/>');
    });
    /* the investor's line: dashed, once, from the insurer's mark to the hub's rim — not a service payment */
    var ip = SC.P(PAYERS[2].x, PAYERS[2].y);
    var di = linkPath(ip, MARK_R + px(2), cp, CORE_R + px(4), px(-70));
    s.push('<path d="' + di + '" fill="none" stroke="' + PAPER + '" stroke-width="' + n1(px(6)) + '" opacity=".5"/><path d="' + di + '" fill="none" stroke="' + CARRIER + '" stroke-width="' + n1(px(1.6)) + '" stroke-dasharray="' + n1(px(4)) + ' ' + n1(px(5)) + '" opacity=".8"/>');
    s.push('<circle cx="' + n1(cp[0]) + '" cy="' + n1(cp[1]) + '" r="' + n1(CORE_R) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + n1(px(3.4)) + '"/><circle cx="' + n1(cp[0]) + '" cy="' + n1(cp[1]) + '" r="' + n1(px(12)) + '" fill="' + INK + '"/>');
    G["rg-business"].innerHTML = s.join("");
    var hp = f.proj(HUB.x, HUB.y), hr = HUB_PX - 4;
    f.placed.push({ left: hp[0] - hr, right: hp[0] + hr, top: hp[1] - hr, bottom: hp[1] + hr });
    PAYERS.forEach(function (q) { var p = f.proj(q.x, q.y), nr = NODE_PX - 4; f.placed.push({ left: p[0] - nr, right: p[0] + nr, top: p[1] - nr, bottom: p[1] + nr }); });
    f.avoidSolids = true;
    var label = labeller(T, f);
    label(HUB.x, HUB.y, [["Resilience Grid", "b"], ["annual contracts fund next season's work", "r"]], 0, HUB_PX + 8, "middle");
    PAYERS.forEach(function (q) { label(q.x, q.y, (isPhone() && q.phone) || q.lines, -(NODE_PX + 10), -LH, "end"); });
    label(560, 640, [["Investment · once", "r", CARRIER]], 0, -LH / 2, "middle");
    settlementLabels(label, LH, ["Mill Creek"]);
    G["rg-labels"].innerHTML = T.join("");
  }

  /* ══ per-screen draw and the HTML state ══ */
  function drawFor(n) {
    if (!SC) { return; }
    svg.dataset.screen = String(n);
    clearInfo();
    if (n === 1) { drawS1(frame(1)); }
    else if (n === 2) { drawS2(frame(2)); }
    else if (n === 3) { renderS3(); }
    else if (n === 4) { drawS4(frame(4)); }
    else if (n === 5) { drawS5(frame(5)); }
    else if (n === 6) { drawS6(frame(6)); }
  }
  function paintS1() {
    var ask = document.getElementById("ask"), note = document.getElementById("cust-note-1"), m = document.getElementById("muse-1"), take = document.getElementById("take-1");
    if (ask) { ask.hidden = S.asked; } if (note) { note.hidden = S.asked; }
    if (m) { m.hidden = !S.asked; } if (take) { take.hidden = !S.asked; }
  }
  function paintS2() {
    var b = document.getElementById("commission"), note = document.getElementById("cust-note-2"), d = document.getElementById("commissioned");
    if (b) { b.hidden = S.commissioned; } if (note) { note.hidden = S.commissioned; } if (d) { d.hidden = !S.commissioned; }
  }
  function askMuse() { if (S.asked) { return; } S.asked = true; paintS1(); paintCta(); persist(); say("Muse searched nine insurers. No standard-market offer for Mill Creek. Better shopping can't fix a place too risky to insure."); }
  function commission() { if (S.commissioned) { return; } S.commissioned = true; paintS2(); paintCta(); persist(); say("Commissioned: Alder County signs a three-year contract with Resilience Grid. It contracts existing providers and coordinates their work."); }
  function decide(d) { S.decision = d; paintOffer(); say(d === "accept" ? "Accepted. Cover from 1 July 2037, while the prevention service stays active." : "Declined. No cover; the offer stands for thirty days."); }

  /* the chrome's Next completes the open beat before it advances: the ask,
     the commission, the incident, the seasons. Screen 5's decision stays the
     household's; Next never accepts or declines. */
  function pending(n) {
    if (n === 1 && !S.asked) { return "Ask Muse"; }
    if (n === 2 && !S.commissioned) { return "Commission the service"; }
    if (n === 3 && S.step < 3) { return "Finish the incident"; }
    if (n === 4 && S.season < 3) { return "Next season"; }
    return null;
  }
  var CTA = ["The proposition", "The moment", "The evidence", "The offer", "The venture", "Back to workshop"];
  function paintCta() { if (nextLabel) { nextLabel.textContent = pending(current) || CTA[current - 1]; } }
  function forward() {
    var p = pending(current);
    if (p) {
      if (current === 1) { askMuse(); }
      else if (current === 2) { commission(); }
      else if (current === 3) { tlFinish(); }
      else if (current === 4) { seasonAll(); }
      return;
    }
    if (current === total) { resetStates(); location.href = "../../workshop/"; return; }
    show(current + 1);
  }

  window.__rg = { S: function () { return S; }, step: function (e) { tlStop(); S.step = Math.max(0, Math.min(3, e | 0)); paintTl(); }, season: function (k) { S.season = Math.max(1, Math.min(3, k | 0)); paintSeason(); }, dropped: function () { return dropped.slice(); }, scene: function () { return SC; }, vb: function () { return vb; } };

  /* ══ FIT ══ */
  var FIT_FLOOR = 0.74;
  function stageBox(sc) { var r = sc.getBoundingClientRect(), cs = getComputedStyle(sc); return { top: r.top + parseFloat(cs.paddingTop), bottom: r.bottom - parseFloat(cs.paddingBottom), left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight) }; }
  function spills(sc) {
    if (narrow) { return sc.scrollHeight > sc.clientHeight + 1; }
    var box = stageBox(sc), rects = [], bad = false, i, j;
    Array.prototype.forEach.call(sc.children, function (el) {
      if (el.classList.contains("gw") || el.hidden) { return; }
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) { return; }
      if (r.top < box.top - 1 || r.bottom > box.bottom + 1 || r.left < box.left - 1 || r.right > box.right + 1) { bad = true; }
      rects.push(r);
    });
    for (i = 0; i < rects.length && !bad; i++) { for (j = i + 1; j < rects.length; j++) { if (rects[i].left < rects[j].right - 1 && rects[i].right > rects[j].left + 1 && rects[i].top < rects[j].bottom - 1 && rects[i].bottom > rects[j].top + 1) { bad = true; break; } } }
    if (!bad) {
      Array.prototype.forEach.call(sc.querySelectorAll("*"), function (el) {
        if (bad) { return; }
        if (el.closest(".gw") || el.closest("details")) { return; }
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
    for (i = 0; i < 7; i++) { mid = (lo + hi) / 2; sc.style.setProperty("--fit", mid.toFixed(4)); if (spills(sc)) { hi = mid; } else { lo = mid; best = mid; } }
    sc.style.setProperty("--fit", best.toFixed(4));
    for (i = 0; i < 8 && best > FIT_FLOOR && spills(sc); i++) { best = Math.max(FIT_FLOOR, best - 0.025); sc.style.setProperty("--fit", best.toFixed(4)); }
  }
  var fitPending = null;
  function refit() { cancelAnimationFrame(fitPending); fitPending = requestAnimationFrame(function () { fitScreen(screens[current - 1]); buildScene(); drawFor(current); moveCamera(current); }); }

  /* ══ NAVIGATION ══ */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;
  screens.forEach(function (sc, i) { var o = document.createElement("option"); o.value = String(i + 1); o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label; picker.appendChild(o); });

  var on = function (id, fn) { var el = document.getElementById(id); if (el) { el.addEventListener("click", fn); } };
  on("ask", askMuse); on("commission", commission);
  on("tl-step", tlNext); on("tl-play", tlRun); on("tl-all", tlFinish);
  on("more-3", function () { detail = !detail; paintTl(); say(detail ? "Operational detail open; the map's labels stand down while it is read." : "Operational detail closed."); });
  on("season-next", seasonNext);
  on("accept", function () { decide("accept"); }); on("decline", function () { decide("decline"); });
  on("restart", function () { resetStates(); show(1); say("Back to the start. Nothing is kept."); });

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    var host = sc.querySelector(".gw");
    if (host && stage.parentNode !== host) { host.appendChild(stage); }
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    if (n !== 3) { tlStop(); detail = false; }
    paintS1(); paintS2(); paintSeason(); paintOffer(); paintTl(); paintCta();
    buildScene();
    fitScreen(sc);
    drawFor(n);
    moveCamera(n);
    refit();
    var h = sc.querySelector(".xd"), spans = h ? h.querySelectorAll("span") : [];
    var said = h ? (spans.length ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ") : h.textContent) : sc.dataset.label;
    announce.textContent = "Screen " + n + " of " + total + ". " + said.replace(/\s+/g, " ").trim();
    if (push !== false) { try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ } }
  }
  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", forward);
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button" || tag === "a" || tag === "summary") { return; }
    if (e.key === "ArrowRight") { forward(); }
    if (e.key === "ArrowLeft") { show(current - 1); }
  });

  /* ══ BOOT ══ */
  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      narrow = isNarrow(); stage.style.height = "";
      screens.forEach(function (s) { var h = s.hidden; if (h) { s.hidden = false; } fitScreen(s); if (h) { s.hidden = true; } });
      buildScene(true); drawFor(current); moveCamera(current, true);
    }, 140);
  });
  var skip = document.getElementById("skip");
  if (skip) { skip.addEventListener("click", function () { var sc = screens[current - 1]; var h = sc && (sc.querySelector(".xd") || sc.querySelector(".xeyebrow")); if (h) { h.focus(); h.scrollIntoView({ block: "start" }); } }); }
  function fromHash() { var m = /#s\/(\d+)/.exec(location.hash); return m ? parseInt(m[1], 10) : null; }
  window.addEventListener("hashchange", function () { var n = fromHash(); if (n !== null && n !== current) { show(n, false); } });
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { refit(); }); }

  narrow = isNarrow();
  restore();
  show(fromHash() || 1, false);
  moveCamera(current, true);
})();
