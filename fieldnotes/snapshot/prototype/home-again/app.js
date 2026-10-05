/* ══════════════════════════════════════════════════════════════════════════
   Home Again · the Rennick household · Calder Reach
   No framework, no build step, no external request. Three files.

   Forked from prototype/resilience-grid/app.js. The camera, the pin
   projection, the per-screen --fit search, the navigation and the boot are
   that file's machinery, inherited deliberately and changed only where the
   concept required it.

   THE GROUND
   Resilience Grid draws a county. This draws ONE HOUSE AND ITS LOT, in the
   same technique: a single world, 1800 x 1000, in schematic elevation, with
   each screen a camera move over it.

     screen 1  the intact house, close
     screen 2  pulled back far enough that the neighbours are in frame —
               which is the whole reason capacity is finite
     screen 3  the same house as a frame inside scaffolding, with the
               materials stacked on the ground beside it

   It is a ground, not an illustration: no texture, no shading, no detail
   below the level of "a window", and nothing in it is clickable.

   WHAT IS INVENTED
   All of it. The Rennick household, Calder Reach, Ardren & Sons, Marta Ives,
   the eight builder slots and the day-by-day sequence on screen 3 are
   invented, and screen 1 says so. No real insurer, product, builder or price
   is described anywhere, and no statistic is cited.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var W = 1800, H = 1000, GROUND = 790;

  var INK      = "#5A4632",
      PAPER    = "#FBF9F1",
      RULE     = "#8A959C",
      FIRE     = "#9E4A14",
      PUBLIC   = "#2F5A44",
      ALARM    = "#A33322";

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY — one lot
     ══════════════════════════════════════════════════════════════════════ */

  var HOUSE = { l: 620, r: 980, t: 566, apexX: 800, apexY: 415,
                eaveL: 588, eaveR: 1012, eaveY: 572 };
  var GARAGE = { l: 1080, r: 1290, t: 652, apexX: 1185, apexY: 598,
                 eaveL: 1056, eaveR: 1314, eaveY: 658 };
  var NEIGHBOURS = [
    { cx: 180,  w: 250, h: 150 },
    { cx: 1612, w: 240, h: 145 }
  ];
  var LOT_EDGES = [372, 1356];
  var TREES = [[300, 92], [205, 58], [1430, 78]];

  /* ══════════════════════════════════════════════════════════════════════
     CAMERAS — one per screen
     ══════════════════════════════════════════════════════════════════════ */

  /* A camera is "this rectangle of the world must be visible". Where on the
     glass it lands is not decided here — it is decided by the ground window
     (see aimWindow), which is the hole the plates leave. */
  var CAM = {
    house:   { x: 545, y: 395, w: 520,  h: 435 },
    lot:     { x: 30,  y: 400, w: 1740, h: 430 },
    rebuild: { x: 540, y: 430, w: 800,  h: 500 }
  };
  /* On a phone the window is a wide horizontal strip rather than a block,
     so each view is pulled wider and shallower. */
  var CAM_N = {
    house:   { x: 500, y: 400, w: 620,  h: 420 },
    lot:     { x: 20,  y: 420, w: 1760, h: 400 },
    rebuild: { x: 500, y: 450, w: 880,  h: 480 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  var svg = document.getElementById("plan");
  var vb = null, camTimer = 0;

  function n2(v) { return (Math.round(v * 10) / 10).toString(); }

  function rect(x, y, w, h, fill, stroke, sw, dash) {
    return '<rect x="' + n2(x) + '" y="' + n2(y) + '" width="' + n2(w) + '" height="' + n2(h) +
           '" fill="' + (fill || "none") + '"' +
           (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 1) + '"' : "") +
           (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>";
  }
  function line(x1, y1, x2, y2, stroke, sw, dash, op) {
    return '<line x1="' + n2(x1) + '" y1="' + n2(y1) + '" x2="' + n2(x2) + '" y2="' + n2(y2) +
           '" stroke="' + stroke + '" stroke-width="' + (sw || 1) + '"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : "") +
           (op != null ? ' opacity="' + op + '"' : "") + ' stroke-linecap="round"/>';
  }

  /* a tree: a trunk and three masses. The lot has four of them and they are
     the only organic thing in the drawing. */
  function tree(cx, r) {
    var s = [];
    s.push(rect(cx - r * 0.06 - 3, GROUND - r * 0.95, r * 0.12 + 6, r * 0.95, PUBLIC));
    s.push('<g fill="' + PUBLIC + '" opacity=".17">');
    s.push('<circle cx="' + n2(cx) + '" cy="' + n2(GROUND - r * 1.38) + '" r="' + n2(r * 0.80) + '"/>');
    s.push('<circle cx="' + n2(cx - r * 0.54) + '" cy="' + n2(GROUND - r * 1.00) + '" r="' + n2(r * 0.56) + '"/>');
    s.push('<circle cx="' + n2(cx + r * 0.56) + '" cy="' + n2(GROUND - r * 1.06) + '" r="' + n2(r * 0.52) + '"/>');
    s.push("</g>");
    return s.join("");
  }

  /* a neighbouring house: the same glyph as the subject, two thirds the
     size and without its detail. In a regional event it loses its roof. */
  function neighbour(nb, lost) {
    var l = nb.cx - nb.w / 2, r = nb.cx + nb.w / 2, t = GROUND - nb.h, s = [];
    if (lost) {
      s.push(rect(l, t + 26, nb.w, nb.h - 26, PAPER, ALARM, 2, "9 7"));
      for (var i = 0; i < 5; i++) {
        var x = l + 18 + i * ((nb.w - 36) / 4);
        s.push(line(x, GROUND, x + 22, GROUND - 34 - (i % 2) * 16, ALARM, 2, null, 0.8));
      }
      s.push(line(l - 14, GROUND, r + 14, GROUND, ALARM, 2.4, null, 0.75));
      return s.join("");
    }
    s.push(rect(l, t, nb.w, nb.h, PAPER, INK, 2));
    s.push('<path d="M' + n2(l - 18) + " " + n2(t + 6) + "L" + n2(nb.cx) + " " + n2(t - nb.w * 0.34) +
           "L" + n2(r + 18) + " " + n2(t + 6) + "L" + n2(r + 18) + " " + n2(t + 20) +
           "L" + n2(nb.cx) + " " + n2(t - nb.w * 0.34 + 14) + "L" + n2(l - 18) + " " + n2(t + 20) +
           'Z" fill="' + INK + '" opacity=".72"/>');
    s.push(rect(l + 0.18 * nb.w, t + 0.3 * nb.h, nb.w * 0.2, nb.h * 0.26, PAPER, INK, 2));
    s.push(rect(nb.cx + 0.14 * nb.w, GROUND - nb.h * 0.52, nb.w * 0.16, nb.h * 0.52, PAPER, INK, 2));
    return s.join("");
  }

  function window_(x, y, w, h) {
    return rect(x, y, w, h, PAPER, INK, 2) +
           line(x + w / 2, y, x + w / 2, y + h, INK, 1.4) +
           line(x, y + h / 2, x + w, y + h / 2, INK, 1.4);
  }

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE LOT
       o.phase       — "intact" | "rebuild"
       o.standard    — 0 as it stood · 1 to current code · 2 code plus hardening
       o.neighbours  — draw the lots either side
       o.lost        — a regional event: the neighbours are gone too
       o.progress    — rebuild progress, 0..1 (cleared / scaffold / framed)
     ══════════════════════════════════════════════════════════════════════ */

  function renderLot(o) {
    o = o || {};
    var s = [], i, t, x, y;

    s.push('<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#EFEDE4"/><stop offset="1" stop-color="#F7F5EC"/></linearGradient>' +
      '</defs>');

    /* ── sky, hills, ground ── */
    s.push(rect(-400, -400, W + 800, H + 800, "url(#sky)"));
    s.push('<path d="M-400 716Q200 646 560 702Q900 746 1240 674Q1540 618 2200 690L2200 ' + (GROUND + 2) +
           'L-400 ' + (GROUND + 2) + 'Z" fill="#ECEAE0"/>');
    s.push(rect(-400, GROUND, W + 800, 500, "#F3F1E6"));
    s.push(line(-400, GROUND, W + 400, GROUND, RULE, 1.8, null, 0.5));

    /* ── the neighbours, behind the lot boundary ── */
    if (o.neighbours) {
      NEIGHBOURS.forEach(function (nb) { s.push(neighbour(nb, !!o.lost)); });
      LOT_EDGES.forEach(function (ex) {
        s.push(line(ex, 686, ex, 872, RULE, 1.6, "8 10", 0.65));
      });
    }

    /* ── trees ── */
    TREES.forEach(function (tr) { s.push(tree(tr[0], tr[1])); });

    /* ── the deck, to the west of the house ── */
    if (o.phase === "intact") {
      s.push(rect(452, 736, 160, 14, PAPER, INK, 2));
      [458, 528, 598].forEach(function (px) { s.push(rect(px, 750, 8, GROUND - 750, INK)); });
      s.push(line(452, 698, 612, 698, INK, 3));
      [462, 502, 542, 582, 606].forEach(function (px) { s.push(line(px, 698, px, 736, INK, 2.2)); });
    } else {
      s.push(rect(452, 762, 160, 10, "#E9E6DA", RULE, 1.4, "7 6"));
    }

    /* ── the detached garage ── */
    if (o.phase === "intact") {
      s.push(rect(GARAGE.l, GARAGE.t, GARAGE.r - GARAGE.l, GROUND - GARAGE.t, PAPER, INK, 2));
      s.push('<path d="M' + GARAGE.eaveL + " " + GARAGE.eaveY + "L" + GARAGE.apexX + " " + GARAGE.apexY +
             "L" + GARAGE.eaveR + " " + GARAGE.eaveY + "L" + GARAGE.eaveR + " " + (GARAGE.eaveY + 14) +
             "L" + GARAGE.apexX + " " + (GARAGE.apexY + 14) + "L" + GARAGE.eaveL + " " + (GARAGE.eaveY + 14) +
             'Z" fill="' + INK + '"/>');
      s.push(rect(1108, 692, 154, GROUND - 692, PAPER, INK, 2));
      [716, 740, 764].forEach(function (gy) { s.push(line(1108, gy, 1262, gy, INK, 1.4)); });
    } else {
      s.push(rect(GARAGE.l, 762, GARAGE.r - GARAGE.l, 10, "#E9E6DA", RULE, 1.4, "7 6"));
    }

    /* ── the house ── */
    if (o.phase === "intact") {
      /* chimney first, so the roof buries its base */
      s.push(rect(886, 432, 34, 72, PAPER, INK, 2));
      s.push(rect(878, 424, 50, 13, INK));
      /* gable, body, roof */
      s.push('<path d="M' + HOUSE.eaveL + " " + HOUSE.eaveY + "L" + HOUSE.apexX + " " + HOUSE.apexY +
             "L" + HOUSE.eaveR + " " + HOUSE.eaveY + 'Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>');
      s.push(rect(HOUSE.l, HOUSE.t, HOUSE.r - HOUSE.l, GROUND - HOUSE.t, PAPER, INK, 2));
      s.push('<path d="M' + HOUSE.eaveL + " " + HOUSE.eaveY + "L" + HOUSE.apexX + " " + HOUSE.apexY +
             "L" + HOUSE.eaveR + " " + HOUSE.eaveY + "L" + HOUSE.eaveR + " " + (HOUSE.eaveY + 15) +
             "L" + HOUSE.apexX + " " + (HOUSE.apexY + 15) + "L" + HOUSE.eaveL + " " + (HOUSE.eaveY + 15) +
             'Z" fill="' + INK + '"/>');
      s.push(window_(660, 620, 64, 78));
      s.push(window_(886, 620, 64, 78));
      s.push(window_(772, 468, 56, 58));
      /* porch, door, steps */
      s.push(rect(738, 646, 142, 12, INK));
      s.push(rect(744, 658, 8, GROUND - 658, INK));
      s.push(rect(868, 658, 8, GROUND - 658, INK));
      s.push(rect(780, 672, 58, GROUND - 672, PAPER, INK, 2));
      s.push('<circle cx="828" cy="738" r="3.4" fill="' + INK + '"/>');
      s.push(rect(766, GROUND, 86, 11, PAPER, INK, 1.6));
      s.push(rect(754, GROUND + 11, 110, 11, PAPER, INK, 1.6));

      /* ── what the chosen rebuild standard looks like on the house ──
         The household's choice is not only a list item: at "code plus
         hardening" the drawing itself gains sheathing, screened vents and
         a cleared edge. */
      if (o.standard >= 1) {
        s.push('<path d="M598 580L800 430L1002 580" fill="none" stroke="' + RULE + '" stroke-width="1.4"/>');
      }
      if (o.standard >= 2) {
        for (i = 1; i <= 6; i++) {
          t = i / 7;
          x = HOUSE.eaveL + (HOUSE.apexX - HOUSE.eaveL) * t;
          y = HOUSE.eaveY + (HOUSE.apexY - HOUSE.eaveY) * t;
          s.push(line(x, y, x + 5.4, y + 7.2, PAPER, 2, null, 0.85));
          x = HOUSE.apexX + (HOUSE.eaveR - HOUSE.apexX) * t;
          y = HOUSE.apexY + (HOUSE.eaveY - HOUSE.apexY) * t;
          s.push(line(x, y, x - 5.4, y + 7.2, PAPER, 2, null, 0.85));
        }
        [634, 940].forEach(function (vx) {
          s.push(rect(vx, 580, 26, 16, PAPER, FIRE, 2));
          s.push(line(vx + 8.5, 580, vx + 8.5, 596, FIRE, 1.4));
          s.push(line(vx + 17, 580, vx + 17, 596, FIRE, 1.4));
        });
        s.push('<path d="M428 848Q800 896 1184 848" fill="none" stroke="' + PUBLIC +
               '" stroke-width="2.6" stroke-dasharray="11 9" opacity=".8"/>');
      }
    } else {
      /* ── the rebuild ──────────────────────────────────────────────────
         Three states, driven by the timeline on screen 3: a cleared slab,
         then scaffold, then the frame and the materials. */
      var p = o.progress == null ? 1 : o.progress;

      s.push(rect(610, 778, 380, 22, "#E9E6DA", RULE, 1.6));
      if (p < 0.34) {
        s.push(rect(HOUSE.l, HOUSE.t, HOUSE.r - HOUSE.l, GROUND - HOUSE.t, "none", RULE, 1.6, "10 9"));
      }

      if (p >= 0.55) {
        /* the frame */
        s.push(rect(HOUSE.l, HOUSE.t, HOUSE.r - HOUSE.l, GROUND - HOUSE.t, PAPER, INK, 2));
        for (x = HOUSE.l + 40; x < HOUSE.r; x += 40) {
          s.push(line(x, HOUSE.t, x, GROUND, INK, 1.4, null, 0.5));
        }
        s.push(line(HOUSE.l, 678, HOUSE.r, 678, INK, 2));
        s.push('<path d="M' + HOUSE.eaveL + " " + HOUSE.eaveY + "L" + HOUSE.apexX + " " + HOUSE.apexY +
               "L" + HOUSE.eaveR + " " + HOUSE.eaveY + 'Z" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>');
        s.push(line(658, 520, 942, 520, INK, 2));
        s.push(line(HOUSE.apexX, HOUSE.apexY, HOUSE.apexX, HOUSE.eaveY, INK, 2));
      }

      if (p >= 0.34) {
        /* the scaffold */
        var STD = [566, 706, 894, 1034], LIFT = [700, 604, 508];
        s.push('<g opacity=".72">');
        STD.forEach(function (sx) {
          s.push(line(sx, 800, sx, 466, INK, 2.6));
          s.push(rect(sx - 11, 800, 22, 8, INK));
        });
        LIFT.forEach(function (ly) { s.push(line(566, ly, 1034, ly, INK, 2.2)); });
        s.push(line(566, 700, 706, 604, INK, 1.6));
        s.push(line(894, 700, 706, 604, INK, 1.6));
        s.push(line(894, 604, 1034, 508, INK, 1.6));
        s.push(line(566, 466, 1034, 466, INK, 2.2));
        s.push("</g>");
      }

      if (p >= 0.85) {
        /* the materials, stacked on the ground where the driveway meets it */
        [[1040, 886, 264, 34], [1056, 852, 232, 34], [1072, 818, 200, 32]].forEach(function (b) {
          s.push(rect(b[0], b[1], b[2], b[3], "#F6E8DC", FIRE, 1.8));
          s.push(line(b[0], b[1] + b[3] / 2, b[0] + b[2], b[1] + b[3] / 2, FIRE, 1.2, null, 0.7));
          s.push(line(b[0] + b[2] * 0.25, b[1], b[0] + b[2] * 0.25, b[1] + b[3], FIRE, 1.6, null, 0.8));
          s.push(line(b[0] + b[2] * 0.75, b[1], b[0] + b[2] * 0.75, b[1] + b[3], FIRE, 1.6, null, 0.8));
        });
        s.push(line(998, 922, 1026, 810, FIRE, 2.4));
        s.push(line(1010, 922, 1038, 810, FIRE, 2.4));
      }
    }

    /* ── the walk up to the door ── */
    s.push('<path d="M796 ' + GROUND + 'L862 ' + GROUND + 'L922 1000L716 1000Z" fill="' + PAPER +
           '" stroke="' + RULE + '" stroke-width="1.4" opacity=".9"/>');

    svg.innerHTML = s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited)
     ══════════════════════════════════════════════════════════════════════ */

  function setVB(c) {
    svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h);
    vb = c;
  }

  /* Turn "this region must be visible" into a viewBox for an SVG that is
     bigger than the viewport and uses `slice`. Both axes resolve to the same
     scale, so slice crops the lot and never the subject. `fit` is the box on
     the glass the subject has to land in.

     GENERALISED FROM THE REFERENCE. Resilience-grid offsets the camera on
     the vertical axis only, and only on a phone, because a county that is
     half behind a plate is still a county. One house is not: if the subject
     lands under a plate there is nothing on the ground to look at. So `fit`
     now carries cx and w as well, and the desktop path uses it too. Passing
     { cx: vpW/2, w: vpW } reproduces the inherited behaviour exactly. */
  function viewBoxFor(view, fit) {
    var el = document.getElementById("world").getBoundingClientRect();
    var vpW = window.innerWidth, vpH = window.innerHeight;
    var fw = fit ? fit.w : vpW, fh = fit ? fit.h : vpH;
    var scale = Math.min(fw / view.w, fh / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2 + (fit ? (vpW / 2 - fit.cx) / scale : 0);
    var wcy = view.y + view.h / 2 + (fit ? (vpH / 2 - fit.cy) / scale : 0);
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }

  /* The hole the plates leave, measured rather than assumed. Each screen
     declares it as a .gw with its own grid area (desktop) or as the flex
     child that takes the leftover height (phone). */
  function aimWindow() {
    var sc = screens && screens[current - 1];
    if (!sc) { return null; }
    var gw = sc.querySelector(".gw");
    if (gw) {
      var g = gw.getBoundingClientRect();
      var top = Math.max(0, g.top), bot = Math.min(window.innerHeight, g.bottom);
      var lef = Math.max(0, g.left), rig = Math.min(window.innerWidth, g.right);
      if (bot - top > 90 && rig - lef > 90) {
        return { cx: (lef + rig) / 2, cy: (top + bot) / 2, w: rig - lef, h: bot - top };
      }
    }
    if (!narrow) { return null; }
    /* phone fallback: aim below whatever the plates have claimed */
    var bottom = 0;
    Array.prototype.forEach.call(sc.children, function (p) {
      if (p.classList.contains("gw")) { return; }
      var r = p.getBoundingClientRect();
      if (r.height > 4 && r.top < window.innerHeight * 0.85) { bottom = Math.max(bottom, r.bottom); }
    });
    bottom = Math.max(0, Math.min(bottom + 12, window.innerHeight - 180));
    return { cx: window.innerWidth / 2, w: window.innerWidth,
             cy: (bottom + window.innerHeight) / 2, h: window.innerHeight - bottom };
  }

  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.house;
    var target = viewBoxFor(cam, aimWindow());
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

  function pinSet(n) {
    if (n === 1) {
      var a = [{ cls: "ink",  label: "This house, as surveyed", wx: 800,  wy: 415, dy: -40 },
               { cls: "grey", label: "Detached garage",         wx: 1185, wy: 598, dy: -34 }];
      if (standard >= 2) {
        a.push({ cls: "fire",   label: "Screened vents", wx: 647,  wy: 588, dy: 0 });
        a.push({ cls: "public", label: "Cleared edge",   wx: 800,  wy: 884, dy: 0 });
      }
      return a;
    }
    if (n === 2) {
      return [{ cls: "ink",  label: "This household", wx: 800, wy: 415, dy: -40 },
              { cls: eventOn ? "alarm" : "grey",
                label: eventOn ? "Also lost" : "Also insured", wx: 180, wy: 640, dy: -42 },
              { cls: eventOn ? "alarm" : "grey",
                label: eventOn ? "Also waiting" : "Neighbouring lots", wx: 1612, wy: 645, dy: -42 }];
    }
    return [{ cls: "fire", label: "Reserved builder on site", wx: 800,  wy: 415, dy: -46 },
            { cls: "grey", label: "Materials released",       wx: 1172, wy: 818, dy: -30 }];
  }

  function buildPins(n) {
    pinHost.innerHTML = "";
    pinSet(n).forEach(function (p) {
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

  /* One polite live region for state changes that are not screen changes —
     a rebuild standard chosen, the regional event shown, the replay started.
     The screen announcer (#announce) handles navigation, so the two never
     overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 — the household chooses a rebuild standard
     This is the visible commitment: the thing that was decided in advance,
     decided on the glass. It rewrites one line of the plan and changes the
     house in the drawing.
     ══════════════════════════════════════════════════════════════════════ */

  var standard = 2;
  var stdBtns = Array.prototype.slice.call(document.querySelectorAll("[data-std]"));
  var specStd = document.getElementById("spec-std");

  function paintStd() {
    stdBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", +b.dataset.std === standard ? "true" : "false");
    });
    if (specStd) { specStd.innerHTML = specStd.dataset["std" + standard] || ""; }
    if (current === 1) { renderLot({ phase: "intact", standard: standard }); buildPins(1); }
    refit();
  }

  stdBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      standard = +b.dataset.std;
      paintStd();
      say("Rebuild standard set to " + b.textContent.trim() + ". " +
          (specStd ? specStd.textContent.trim() : ""));
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — the one condition that money cannot satisfy
     The toggle is the honesty of the screen: it shows what the commitment
     becomes when the region claims at once. Three of the four promises are
     unaffected. The fourth — the builder — is the one that was scarce, and
     a larger settlement does not restore it.
     ══════════════════════════════════════════════════════════════════════ */

  var eventOn = false;
  var evBtn   = document.getElementById("event-toggle");
  var condCap = document.getElementById("cond-cap");
  var capSlots = document.getElementById("cap-slots");
  var capNormal = document.getElementById("cap-cap-normal");
  var capEvent  = document.getElementById("cap-cap-event");
  var fallRows = Array.prototype.slice.call(document.querySelectorAll(".cm-row[data-falls]"));

  var SLOTS_NORMAL = ["mine", "held", "held", "held", "open", "open", "open", "open"];
  var SLOTS_EVENT  = ["queued", "held", "held", "held", "held", "held", "held", "held"];

  function paintEvent() {
    if (condCap) {
      condCap.dataset.met = eventOn ? "0" : "1";
      var cs = condCap.querySelector(".cond-state");
      if (cs) { cs.textContent = eventOn ? "Not met" : "Met"; }
    }
    fallRows.forEach(function (r) {
      r.dataset.state = eventOn ? "falls" : "held";
      var st = r.querySelector(".cm-state");
      if (st) { st.textContent = eventOn ? "Falls back" : "Committed"; }
    });
    if (capSlots) {
      var set = eventOn ? SLOTS_EVENT : SLOTS_NORMAL;
      Array.prototype.forEach.call(capSlots.children, function (el, i) {
        el.dataset.slot = set[i] || "open";
      });
      capSlots.setAttribute("aria-label", eventOn
        ? "Eight builder slots: every one claimed. This household's slot is honoured but queued."
        : "Eight builder slots: one held for this household, three held for other households, four open.");
    }
    if (capNormal) { capNormal.hidden = eventOn; }
    if (capEvent)  { capEvent.hidden = !eventOn; }
    if (evBtn) {
      evBtn.setAttribute("aria-pressed", eventOn ? "true" : "false");
      evBtn.textContent = eventOn ? "Return to normal conditions" : "Show a regional event";
    }
    if (current === 2) {
      renderLot({ phase: "intact", standard: standard, neighbours: true, lost: eventOn });
      buildPins(2);
    }
    refit();
  }

  if (evBtn) {
    evBtn.addEventListener("click", function () {
      eventOn = !eventOn;
      paintEvent();
      say(eventOn
        ? "Regional event shown. Three commitments unchanged; the reserved builder falls back to the queue."
        : "Normal conditions restored. All four commitments held.");
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the first days, as five beats
     Not a claims workflow. Five rows and a replay, and the ground behind
     them moves from a cleared slab to scaffold to a frame.
     ══════════════════════════════════════════════════════════════════════ */

  var tlRows = [];
  var tlStep = 0, tlTimer = null;

  function paintTl() {
    tlRows.forEach(function (r, i) { r.dataset.on = i < tlStep ? "1" : "0"; });
    /* The control says exactly what pressing it will do. */
    var btn = document.getElementById("tl-play");
    if (btn) {
      btn.textContent = tlTimer ? "Pause"
                      : tlStep >= tlRows.length ? "Replay from the start"
                      : tlStep === 0 ? "Play the first days"
                      : "Resume";
    }
    var all = document.getElementById("tl-all");
    if (all) { all.disabled = !tlTimer && tlStep >= tlRows.length; }
    if (current === 3) {
      renderLot({
        phase: "rebuild", standard: standard,
        progress: tlStep >= 5 ? 1 : tlStep >= 4 ? 0.6 : 0.2
      });
      buildPins(3);
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
    }, 1250);
    tlStep++;
    paintTl();
    say(restarting ? "Replaying the first days from the start." : "Replay resumed.");
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

  function drawFor(n) {
    if (n === 1) { renderLot({ phase: "intact", standard: standard }); }
    else if (n === 2) { renderLot({ phase: "intact", standard: standard, neighbours: true, lost: eventOn }); }
    else { paintTl(); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  /* The ground window is excluded: it must stretch to its whole grid area,
     because that area IS the measurement the camera aims at. */
  function anchorPlates() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".screen > [style*='grid-area']:not(.gw)"), function (el) {
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
       6.4px and notes to 7.7px. Below 900px the type holds its size and the
       screen scrolls. */
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

  var CTA = ["What is promised", "The first days", "Back to the beginning"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();
  tlRows = Array.prototype.slice.call(document.querySelectorAll("#tl .tl-row"));
  /* The sequence starts FULLY REVEALED. An unplayed stepper reads as a
     disabled panel, and a reviewer who never presses the button would see
     the last screen greyed out. The replay is an enhancement on a legible
     default, not a gate in front of one. */
  tlStep = tlRows.length;
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

    /* leaving screen 3 stops the clock, so it is not still running behind a
       screen that does not show it */
    if (n !== 3) { tlStop(); }

    drawFor(n);
    /* fit before the camera moves: on a phone the camera aims at whatever
       height the plates have left over, so it needs the settled layout */
    fitScreen(sc);
    moveCamera(sc.dataset.cam);
    buildPins(n);

    /* Headlines are authored as one span per line, so textContent would run
       the lines together. Join the spans with a space instead. */
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

  /* Skip button: move focus to the open screen's heading, without touching
     the hash. Every .display carries tabindex="-1" so it can receive focus. */
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
  paintStd();
  paintEvent();
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);
})();
