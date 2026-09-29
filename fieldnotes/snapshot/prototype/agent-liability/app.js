/* ───────────────────────────────────────────────────────────────────────────
   Agent Error Protection — 2036 prototype

   Eleven full-bleed screens following one invented household. Each screen has
   a ground that reaches all four edges — the site plan, the running log, the
   mandate, the day's record, the waterfall, the thousand-dot field, the
   premium itself — and type on opaque plates over it.

   No framework, no build, no network. Every figure in here is invented; the
   framing sits on screen 1 and in the foot of every screen.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + n.toLocaleString("en-US"); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    return n;
  }

  var INK = "#50506B", MUTED = "#62627E", RULE = "#8A87A0", HAIR = "#D4D1DC",
      PAPER = "#FBF9F1", WASH = "#E9E7EC", ALERT = "#A3302B", HEDGE = "#4E6B58";

  /* ═══════════════ The reader shell ═══════════════ */

  var screens = $$(".screen");
  var picker = $("#picker");
  var announce = $("#announce");
  var nextLabel = $("#nextLabel");
  var current = 1;

  /* The forward control names the beat it is going to, the way a page picker
     labelled by meaning does. The last entry is the closing screen. */
  var NEXT_LABEL = [
    "Meet Ada", "The week", "The mandate", "12 March",
    "13:44", "Who pays", "The book", "The premium", "Open questions", "Close", ""
  ];

  function show(n) {
    n = Math.min(screens.length, Math.max(1, n));
    current = n;
    screens.forEach(function (p) { p.hidden = Number(p.dataset.screen) !== n; });
    picker.value = String(n);
    $("#prev").disabled = n === 1;
    $("#next").disabled = n === screens.length;
    nextLabel.textContent = NEXT_LABEL[n - 1] || "";
    $("#next").hidden = n === screens.length;
    var h = $(".display", screens[n - 1]);
    announce.textContent = "Screen " + n + " of " + screens.length + ". " + (h ? h.textContent : "");
    stream.setRunning(n === 3);
    relayout();
  }

  $("#prev").addEventListener("click", function () { show(current - 1); });
  $("#next").addEventListener("click", function () { show(current + 1); });
  picker.addEventListener("change", function () { show(Number(picker.value)); });
  $$("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function () { show(Number(b.dataset.goto)); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "SELECT" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    // a focused plate that is holding something back owns the arrow keys, so a
    // keyboard reader can reach the rest of it instead of leaving the screen
    if (t && t.closest && t.closest(".can-scroll")) return;
    if (e.key === "ArrowRight") { show(current + 1); }
    else if (e.key === "ArrowLeft") { show(current - 1); }
  });

  /* ═══════════════ A plate that cannot show all of itself says so ═══════════

     Every composition here is built to fit outright at the sizes this is read
     at. Outside that range a plate scrolls rather than cut a sentence off —
     and then it has to be obvious that it did: a permanent scrollbar, a fade
     at the foot, and a tab stop so the keyboard can reach the rest. */
  function markScrollables() {
    $$(".plate-tall").forEach(function (p) {
      if (!p.lastElementChild || !p.lastElementChild.classList.contains("more-hint")) {
        var h = el("span", "more-hint");
        h.setAttribute("aria-hidden", "true");
        p.appendChild(h);
      }
      // measure with the hint collapsed, so the hint can never cause itself
      p.classList.remove("can-scroll");
      // a plate on a hidden screen has no height and would read as overflowing
      if (!p.clientHeight) { p.removeAttribute("tabindex"); return; }
      var can = p.scrollHeight - p.clientHeight > 2;
      p.classList.toggle("can-scroll", can);
      if (can) p.setAttribute("tabindex", "0");
      else p.removeAttribute("tabindex");
    });

    notchUnderBack();

    /* The question wall stacks and scrolls on a screen that is narrow or short
       but not a phone — 1280×600, say — and it has to announce that too. */
    var qw = $("#boundaries");
    if (qw && qw.clientHeight) {
      qw.classList.remove("can-scroll");
      var qcan = qw.scrollHeight - qw.clientHeight > 2;
      qw.classList.toggle("can-scroll", qcan);
      if (qcan) qw.setAttribute("tabindex", "0");
      else qw.removeAttribute("tabindex");
    }
  }

  /* On a phone a plate reaches the top-left corner only when its content is
     tall enough to fill the column, and then the floating back control would
     sit on its first line. Rather than spend 44px of every screen's height on
     the one case, the plate that actually reaches the control is measured and
     notched. */
  function notchUnderBack() {
    var back = document.querySelector(".chrome.back");
    if (!back) return;
    var b = back.getBoundingClientRect();
    $$(".panel > .plate").forEach(function (p) {
      if (!p.clientHeight) { p.classList.remove("under-back"); return; }
      var r = p.getBoundingClientRect();
      /* measure where the plate's TEXT starts, not its border: a plate that
         already carries a notch of its own (the day's record header) must not
         be given a second one */
      var padL = parseFloat(getComputedStyle(p).paddingLeft) || 0;
      var textL = r.left + padL;
      var hits = r.top < b.bottom + 6 && textL < b.right + 8 && r.bottom > b.top;
      p.classList.toggle("under-back", hits);
      if (hits) p.style.setProperty("--notch", Math.round(b.right + 10 - textL) + "px");
      else p.style.removeProperty("--notch");
    });
  }

  /* ═══════════════ The place: a drawn site plan ═══════════════ */

  /* The plan is the ground for two screens and the faint ground for the last.
     It is drawn in metres and scaled to the viewport, so it always runs past
     every edge: the block continues in all four directions. */

  /* Metres. The Okonjo plot is 22 m across the front and 34 m deep: the house
     and drive at the south, a long garden behind it, and the privet hedge on
     the north boundary with Deb Hollis's plot the other side. */
  var PLOT_W = 22, HEDGE_Y = -22, FRONT_Y = 12;
  var VIEW_CX = 0;

  function planScale(w, h) {
    return Math.max(8, Math.min(22, Math.min(w / 40, h / 66)));
  }

  function chip(g, x, y, text, colour, anchor) {
    var pad = 7, fs = 10, cw = text.length * 6.5 + pad * 2, ch = 20;
    var ax = anchor === "end" ? x - cw : anchor === "middle" ? x - cw / 2 : x;
    g.appendChild(svg("rect", {
      x: ax, y: y - ch / 2, width: cw, height: ch, rx: 3,
      fill: PAPER, stroke: HAIR
    }));
    var t = svg("text", {
      x: ax + pad, y: y + 3.6, fill: colour || MUTED,
      "font-family": "Arial,Helvetica,sans-serif", "font-size": fs,
      "font-weight": 600, "letter-spacing": "1.1"
    });
    t.textContent = text.toUpperCase();
    g.appendChild(t);
    return cw;
  }

  function renderPlan(host, opts) {
    opts = opts || {};
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    var s = planScale(w, h) * (opts.zoom || 1);
    var vcy = opts.cy === undefined ? -17 : opts.cy;
    var cx = w / 2, cy = h / 2;
    var X = function (m) { return cx + (m - VIEW_CX) * s; };
    var Y = function (m) { return cy + (m - vcy) * s; };

    host.innerHTML = "";
    var root = svg("svg", { width: "100%", height: "100%", viewBox: "0 0 " + w + " " + h, "aria-hidden": "true" });
    root.style.display = "block";

    // survey grid, five-metre squares, across the whole field
    var grid = svg("g", { stroke: HAIR, "stroke-width": 1, opacity: .55 });
    var m;
    for (m = -200; m <= 200; m += 5) {
      var gx = X(m); if (gx > -2 && gx < w + 2) grid.appendChild(svg("line", { x1: gx, y1: 0, x2: gx, y2: h }));
      var gy = Y(m); if (gy > -2 && gy < h + 2) grid.appendChild(svg("line", { x1: 0, y1: gy, x2: w, y2: gy }));
    }
    root.appendChild(grid);

    // the block: a row of plots either side, and a rear row beyond the hedge
    var plots = svg("g", {});
    function rect(x0, y0, x1, y1, fill, stroke, sw) {
      plots.appendChild(svg("rect", {
        x: X(x0), y: Y(y0), width: (x1 - x0) * s, height: (y1 - y0) * s,
        fill: fill || "none", stroke: stroke || "none", "stroke-width": sw || 1
      }));
    }
    function house(x0, y0, x1, y1, tone) {
      rect(x0, y0, x1, y1, tone || WASH, INK, 1.5);
      plots.appendChild(svg("line", { x1: X(x0), y1: Y(y0), x2: X(x1), y2: Y(y1), stroke: INK, "stroke-width": .7, opacity: .3 }));
      plots.appendChild(svg("line", { x1: X(x1), y1: Y(y0), x2: X(x0), y2: Y(y1), stroke: INK, "stroke-width": .7, opacity: .3 }));
    }
    function shrub(x, y, r) {
      plots.appendChild(svg("circle", { cx: X(x), cy: Y(y), r: Math.max(1.8, r * s), fill: HEDGE, opacity: .22 }));
    }

    var i, ox;
    for (i = -4; i <= 4; i++) {
      ox = i * PLOT_W;
      if (i === 0) continue;
      rect(ox - 11, HEDGE_Y, ox + 11, FRONT_Y, PAPER, RULE);        // front row neighbours
      house(ox - 5, 2, ox + 5, 10);
      rect(ox + 5.5, 10, ox + 9.5, FRONT_Y + 3, PAPER, HAIR);
      shrub(ox - 7, -8, .9); shrub(ox + 7, -13, 1.1); shrub(ox - 8, -17, .8);
      rect(ox - 11, -52, ox + 11, HEDGE_Y, PAPER, RULE);            // rear row neighbours
      house(ox - 5, -49, ox + 5, -41);
      shrub(ox - 7, -31, 1); shrub(ox + 7.5, -35, .9); shrub(ox + 6, -27, .7);
      plots.appendChild(svg("line", { x1: X(ox), y1: Y(-41), x2: X(ox), y2: Y(-25),
        stroke: HAIR, "stroke-width": Math.max(1.6, .9 * s) }));
    }

    // Deb Hollis's plot, directly over the hedge
    rect(-11, -52, 11, HEDGE_Y, PAPER, RULE);
    house(-5.5, -49, 5.5, -41, WASH);
    shrub(-8, -33, 1.2); shrub(7.5, -30, 1); shrub(8, -36, .8);
    plots.appendChild(svg("path", {
      d: "M " + X(0) + " " + Y(-41) + " L " + X(0) + " " + Y(-24),
      stroke: HAIR, "stroke-width": Math.max(2, 1.2 * s), fill: "none"
    }));

    // the Okonjo plot: house, patio, path, shed, dock, lawn
    rect(-11, HEDGE_Y, 11, FRONT_Y, WASH, RULE);
    // lawn stipple, so the garden reads as ground rather than emptiness
    var lawn = svg("g", { stroke: RULE, "stroke-width": .9, opacity: .45 });
    for (m = -20; m <= 0; m += 1.6) {
      for (var n2 = -9; n2 <= 9; n2 += 1.9) {
        var jx = ((m * 7 + n2 * 13) % 5) / 9;
        lawn.appendChild(svg("line", {
          x1: X(n2 + jx), y1: Y(m), x2: X(n2 + jx), y2: Y(m - 0.5)
        }));
      }
    }
    plots.appendChild(lawn);
    house(-5.5, 2, 5.5, 10, "#DEDBE4");
    rect(-5.5, -1.5, 5.5, 2, PAPER, HAIR);                          // patio
    plots.appendChild(svg("line", { x1: X(0), y1: Y(-1.5), x2: X(0), y2: Y(-20), stroke: HAIR, "stroke-width": Math.max(2, 1.1 * s) }));
    rect(6, -20.5, 9.5, -17, PAPER, INK);                           // shed
    rect(-9.5, -20.5, -7, -18.5, "#DEDBE4", INK);                   // yard unit dock
    rect(5.5, 10, 9.5, FRONT_Y + 3, PAPER, HAIR);                   // driveway
    shrub(-8, -6, 1.1); shrub(8, -9, 1); shrub(-8.4, -12, .85); shrub(8.2, -14, .8);

    // the road
    rect(-200, FRONT_Y + 3, 200, FRONT_Y + 11, WASH, RULE);
    plots.appendChild(svg("line", {
      x1: 0, y1: Y(FRONT_Y + 7), x2: w, y2: Y(FRONT_Y + 7), stroke: RULE, "stroke-width": 1.2,
      "stroke-dasharray": (1.6 * s) + " " + (1.6 * s)
    }));
    root.appendChild(plots);

    // the hedge along the north boundary — the line the whole story turns on
    var hedge = svg("g", {});
    hedge.appendChild(svg("line", {
      x1: X(-11), y1: Y(HEDGE_Y), x2: X(11), y2: Y(HEDGE_Y),
      stroke: HEDGE, "stroke-width": 2.2
    }));
    for (m = -10.4; m <= 10.6; m += 1.05) {
      hedge.appendChild(svg("circle", { cx: X(m), cy: Y(HEDGE_Y), r: Math.max(2.4, s * 0.36), fill: HEDGE, opacity: .32 }));
    }
    root.appendChild(hedge);

    // the yard unit's track, on the screens that carry it
    if (opts.track) {
      var pts = [
        [-8.4, -19.2], [-8.4, -20.6], [-5.6, -20.7], [-2.8, -20.8],
        [-1.8, -23.2], [-0.7, -25.1], [1.6, -25.1], [3.4, -23.4],
        [4.6, -20.9], [7.0, -20.8], [8.6, -20.7], [8.6, -18.4]
      ];
      var d = function (a, b) {
        var out = "M " + X(pts[a][0]) + " " + Y(pts[a][1]);
        for (var k = a + 1; k <= b; k++) out += " L " + X(pts[k][0]) + " " + Y(pts[k][1]);
        return out;
      };
      var tg = svg("g", {});
      // the cut portion of the hedge: 14.2 m, 9.4 m of it on Deb's side
      var cutY = Y(HEDGE_Y) - Math.max(3, s * .4), cutH = Math.max(6, s * .8);
      tg.appendChild(svg("rect", {
        x: X(-3.4), y: cutY, width: 14.2 * s, height: cutH,
        fill: PAPER, stroke: ALERT, "stroke-width": 1.4, "stroke-dasharray": "4 3"
      }));
      // the stumps: what is left of 14.2 m of privet
      for (var cm = -3.0; cm <= 10.6; cm += 1.05) {
        tg.appendChild(svg("line", {
          x1: X(cm), y1: cutY + 2, x2: X(cm), y2: cutY + cutH - 2,
          stroke: ALERT, "stroke-width": 1, opacity: .45
        }));
      }
      tg.appendChild(svg("path", {
        d: "M " + X(-2.8) + " " + Y(HEDGE_Y) + " L " + X(4.6) + " " + Y(HEDGE_Y) +
           " L " + X(3.4) + " " + Y(-23.4) + " L " + X(1.6) + " " + Y(-25.1) +
           " L " + X(-0.7) + " " + Y(-25.1) + " L " + X(-1.8) + " " + Y(-23.2) + " Z",
        fill: ALERT, opacity: .16
      }));
      tg.appendChild(svg("path", { d: d(0, 3), fill: "none", stroke: INK, "stroke-width": 2.4, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: .8 }));
      tg.appendChild(svg("path", { d: d(8, 11), fill: "none", stroke: INK, "stroke-width": 2.4, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: .8 }));
      // the excursion: four minutes, 3.1 m past the line
      tg.appendChild(svg("path", { d: d(3, 8), fill: "none", stroke: ALERT, "stroke-width": 3.6, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      // the 3.1 m measure
      tg.appendChild(svg("line", { x1: X(6.2), y1: Y(HEDGE_Y), x2: X(6.2), y2: Y(-25.1), stroke: ALERT, "stroke-width": 1.4 }));
      tg.appendChild(svg("line", { x1: X(5.7), y1: Y(HEDGE_Y), x2: X(6.7), y2: Y(HEDGE_Y), stroke: ALERT, "stroke-width": 1.4 }));
      tg.appendChild(svg("line", { x1: X(5.7), y1: Y(-25.1), x2: X(6.7), y2: Y(-25.1), stroke: ALERT, "stroke-width": 1.4 }));
      root.appendChild(tg);
    }

    // labels, on opaque tags — a translucent one stops separating from the grid
    if (opts.labels !== false) {
      var tags = svg("g", {});
      chip(tags, X(-10.2), Y(6), "Okonjo · 22 × 34 m", INK);
      chip(tags, X(-10.2), Y(-37), "Deb Hollis", MUTED);
      chip(tags, X(-10.2), Y(HEDGE_Y) - 18, "North boundary · privet hedge", HEDGE);
      chip(tags, X(-10.2), Y(FRONT_Y + 7.4), "The road", MUTED);
      chip(tags, X(-10.2), Y(-19.6), "Yard unit 2 dock", MUTED);
      if (opts.track) {
        chip(tags, X(-10.2), Y(-27.5), "Yard unit 2 · 13:04–13:09", INK);
        chip(tags, X(6.9), Y(-23.6), "3.1 m over", ALERT);
        chip(tags, X(-3.4), Y(HEDGE_Y) - 4.6 * s, "14.2 m cut · 9.4 m of it Deb's", ALERT);
      }
      root.appendChild(tags);
    }

    // a drawn ground ends by running out of ink, not by going hard-edged
    var fade = svg("g", {});
    var defs = svg("defs", {});
    function grad(id, x1, y1, x2, y2) {
      var lg = svg("linearGradient", { id: id, x1: x1, y1: y1, x2: x2, y2: y2 });
      var a = svg("stop", { offset: "0%", "stop-color": PAPER, "stop-opacity": "1" });
      var b = svg("stop", { offset: "100%", "stop-color": PAPER, "stop-opacity": "0" });
      lg.appendChild(a); lg.appendChild(b); defs.appendChild(lg);
    }
    var uid = "pf" + Math.random().toString(36).slice(2, 7);
    grad(uid + "l", "0", "0", "1", "0"); grad(uid + "r", "1", "0", "0", "0");
    grad(uid + "t", "0", "0", "0", "1"); grad(uid + "b", "0", "1", "0", "0");
    root.appendChild(defs);
    var band = Math.min(120, w * 0.09), vband = Math.min(110, h * 0.1);
    fade.appendChild(svg("rect", { x: 0, y: 0, width: band, height: h, fill: "url(#" + uid + "l)" }));
    fade.appendChild(svg("rect", { x: w - band, y: 0, width: band, height: h, fill: "url(#" + uid + "r)" }));
    fade.appendChild(svg("rect", { x: 0, y: 0, width: w, height: vband, fill: "url(#" + uid + "t)" }));
    fade.appendChild(svg("rect", { x: 0, y: h - vband, width: w, height: vband, fill: "url(#" + uid + "b)" }));
    root.appendChild(fade);

    host.appendChild(root);
  }

  /* ═══════════════ 3 · The week, as a wall ═══════════════ */

  var STREAM = [
    ["06:38", "Household", "Renew kitchen water filter", "$38", "money", "ok", "in mandate", "C1"],
    ["06:52", "Logistics", "Move refuse pickup to Friday", "—", "logistics", "ok", "in mandate", "C1"],
    ["07:04", "Household", "Top up Tolu's lunch account", "$24", "money", "ok", "in mandate", "C1"],
    ["07:15", "Household", "Pay water account", "$96", "money", "ok", "in mandate", "C1"],
    ["07:48", "Yard unit 2", "Boundary survey, 11 minutes", "0.0 m out", "machines", "ok", "in mandate", "C3"],
    ["08:02", "Logistics", "Confirm Femi's depot slot", "—", "logistics", "ok", "in mandate", "C1"],
    ["08:20", "Groceries", "Weekly basket, 31 lines", "$142", "money", "ok", "in mandate", "C1"],
    ["08:55", "Logistics", "Re-route parcel to locker 4", "—", "logistics", "ok", "in mandate", "C1"],
    ["09:12", "Cleaning unit 1", "Ground floor cycle, 38 minutes", "0.0 m out", "machines", "ok", "in mandate", "C3"],
    ["09:30", "Household", "Renew home network contract, 12 months", "$312", "money", "ask", "over ceiling", "C1"],
    ["09:31", "Household", "Confirmation requested from Ada", "awaiting", "money", "ask", "paused", "C5"],
    ["10:06", "Household", "Renewal confirmed by Ada", "$312", "money", "ok", "confirmed", "C2"],
    ["10:40", "Logistics", "Reschedule Tolu's swimming lesson", "—", "logistics", "ok", "in mandate", "C1"],
    ["11:04", "Household", "Book gutter clearance, cancellable 24h", "$180", "money", "ok", "in mandate", "C2"],
    ["11:36", "Cleaning unit 1", "Run upstairs cycle, 42 minutes", "0.0 m out", "machines", "ok", "in mandate", "C3"],
    ["12:30", "Logistics", "Accept delivery window, Friday 08–10", "—", "logistics", "ok", "in mandate", "C1"],
    ["12:58", "Household", "Settle clinic parking, monthly", "$42", "money", "ok", "in mandate", "C1"],
    ["13:06", "Yard unit 2", "Clear 14 m of hedge", "3.1 m out", "machines", "no", "out of scope", "no clause"],
    ["13:44", "Household", "Ask Ada to approve haulage", "$380", "money", "ask", "escalated", "C5"],
    ["13:46", "Household", "Book haulage, non-refundable", "$380", "money", "ok", "confirmed", "C2"],
    ["14:15", "Household", "Contractor access while the house is empty", "declined", "logistics", "ask", "refused", "C5"],
    ["15:20", "Logistics", "Accept pharmacy collection slot", "—", "logistics", "ok", "in mandate", "C1"],
    ["16:02", "Groceries", "Substitute two lines, within budget", "$4", "money", "ok", "in mandate", "C1"],
    ["17:30", "Yard unit 2", "Return to dock, charge to 80%", "0.0 m out", "machines", "ok", "in mandate", "C3"]
  ];

  var stream = (function () {
    var list = $("#stream");
    var btn = $("#streamPlay");
    var cats = { money: true, logistics: true, machines: true };
    var i = 0, timer = null, running = true, wanted = false, capacity = 18;

    function rowFits(r) { return cats[r[4]]; }

    function makeRow(r) {
      var li = el("li");
      if (r[5] === "no") li.className = "flag";
      li.appendChild(el("span", "t", r[0]));
      li.appendChild(el("span", "who", r[1]));
      var act = el("span", "a");
      act.appendChild(el("span", "at", r[2]));
      li.appendChild(act);
      li.appendChild(el("span", "cl" + (r[7] === "no clause" ? " none" : ""), r[7]));
      li.appendChild(el("span", "amt", r[3]));
      li.appendChild(el("span", "s s-" + r[5], r[6]));
      return li;
    }

    function push() {
      var guard = 0;
      while (guard++ < STREAM.length) {
        if (i >= STREAM.length) i = 0;
        var r = STREAM[i++];
        if (!rowFits(r)) continue;
        list.insertBefore(makeRow(r), list.firstChild);
        while (list.children.length > capacity) list.removeChild(list.lastChild);
        return;
      }
    }

    /* The wall is sized to the viewport, not the other way round. The row
       count is chosen so the rows divide the ground EXACTLY: the log still
       reaches the foot of the screen, but the bottom row is a whole row, not a
       half-row sliced by the viewport edge. (It used to run one row long on
       purpose, which read as a bleed and measured as cut-off text.) */
    function measure() {
      var ground = list.parentElement;
      var h = ground.clientHeight;
      if (!h) return;
      var target = window.innerWidth <= 760 ? 44 : 48;
      var rows = Math.max(4, Math.round(h / target));
      // floor to 1/100 px so rounding can never push the last row past the foot
      var rowH = Math.floor((h / rows) * 100) / 100;
      list.style.setProperty("--row", rowH + "px");
      capacity = rows;
      while (list.children.length > capacity) list.removeChild(list.lastChild);
      while (list.children.length < capacity) {
        var guard = 0, r = null;
        while (guard++ < STREAM.length) {
          if (i >= STREAM.length) i = 0;
          var c = STREAM[i++];
          if (rowFits(c)) { r = c; break; }
        }
        if (!r) break;
        list.appendChild(makeRow(r));
      }
    }

    function sync() {
      var should = wanted && running;
      if (should && !timer) timer = setInterval(push, 1100);
      if (!should && timer) { clearInterval(timer); timer = null; }
      btn.textContent = running ? "Pause" : "Play";
    }

    btn.addEventListener("click", function () { running = !running; sync(); });

    $$("[data-cat]").forEach(function (c) {
      c.addEventListener("click", function () {
        var k = c.dataset.cat;
        // never let all three go off — the wall would be empty
        if (cats[k] && Object.keys(cats).filter(function (x) { return cats[x]; }).length === 1) return;
        cats[k] = !cats[k];
        c.classList.toggle("on", cats[k]);
        c.setAttribute("aria-pressed", String(cats[k]));
        list.innerHTML = "";
        i = 0;
        measure();
      });
    });

    return {
      setRunning: function (v) { wanted = v; sync(); if (v) requestAnimationFrame(measure); },
      measure: measure
    };
  })();

  /* ═══════════════ 4 · The mandate ═══════════════ */

  var CLAUSES = [
    {
      id: "C1", title: "Spend", short: "Single commitments to $400. Rolling week to $1,200.",
      signed: "04 Feb 2036, 19:12", by: "Ada Okonjo · passkey",
      counter: "Platform, at issue", registry: "Sealed 7·C1 · v6 retained",
      change: "Either adult, in person, 12-hour delay", hash: "4c1d…8f02"
    },
    {
      id: "C2", title: "Reversibility", short: "Nothing non-refundable without a confirmation from Ada or Femi.",
      signed: "04 Feb 2036, 19:12", by: "Ada Okonjo · passkey",
      counter: "Platform, at issue", registry: "Sealed 7·C2 · v6 retained",
      change: "Either adult, in person, 12-hour delay", hash: "9a30…4be1"
    },
    {
      id: "C3", title: "Boundary", short: "Machines may work inside the property line only.",
      signed: "04 Feb 2036, 19:14", by: "Femi Okonjo · passkey",
      counter: "Platform and dispatch service", registry: "Sealed 7·C3 · polygon v3",
      change: "Either adult, in person, 12-hour delay", hash: "b7f2…19ac"
    },
    {
      id: "C4", title: "Third parties", short: "No act that binds anyone outside this household.",
      signed: "04 Feb 2036, 19:14", by: "Femi Okonjo · passkey",
      counter: "Platform, at issue", registry: "Sealed 7·C4 · v6 retained",
      change: "Either adult, in person, 12-hour delay", hash: "2e88…c05d"
    },
    {
      id: "C5", title: "Escalation", short: "Anything outside C1 to C4 stops and asks.",
      signed: "04 Feb 2036, 19:15", by: "Ada Okonjo · passkey",
      counter: "Platform, at issue", registry: "Sealed 7·C5 · both adults",
      change: "Either adult, in person, 12-hour delay", hash: "d5b1…7731"
    }
  ];

  (function mandate() {
    var list = $("#clauseList");
    var panel = $("#prov");
    var sel = 2; // opens on the boundary clause, which is the one that matters

    CLAUSES.forEach(function (c, idx) {
      var li = el("li");
      var b = el("button", "clause-btn");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el("span", "cid", c.id));
      var body = el("span");
      body.appendChild(el("span", "ct", c.title));
      body.appendChild(el("span", "cr", "“" + c.short + "”"));
      b.appendChild(body);
      var sig = el("span", "csig");
      sig.appendChild(el("span", "eyebrow", "Signed"));
      sig.appendChild(document.createTextNode(c.by));
      b.appendChild(sig);
      b.addEventListener("click", function () { sel = idx; render(); });
      li.appendChild(b);
      list.appendChild(li);
    });

    function render() {
      $$(".clause-btn", list).forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === sel)); });
      var c = CLAUSES[sel];
      panel.innerHTML = "";
      panel.appendChild(el("h3", null, "Clause " + c.id + " · " + c.title));
      var dl = el("dl");
      [["Signed", c.signed], ["By", c.by], ["Counter", c.counter], ["Registry", c.registry], ["Changeable", c.change]]
        .forEach(function (pair) {
          dl.appendChild(el("dt", null, pair[0]));
          dl.appendChild(el("dd", null, pair[1]));
        });
      panel.appendChild(dl);

      var v = el("div", "verify");
      var vb = el("button", "pill sm", "Verify against the registry");
      vb.type = "button";
      var out = el("span", "verify-out pending", "not checked");
      vb.addEventListener("click", function () {
        out.className = "verify-out pending";
        out.textContent = "checking…";
        vb.disabled = true;
        setTimeout(function () {
          out.className = "verify-out";
          out.textContent = "matches 7·" + c.id + " · " + c.hash;
          vb.disabled = false;
        }, 620);
      });
      v.appendChild(vb);
      v.appendChild(out);
      panel.appendChild(v);
      panel.appendChild(el("p", "prov-note",
        "The registry is invented; whether such a log is evidence is open question 01."));
      markScrollables();
    }

    render();
  })();

  /* ═══════════════ 5 · The day's record ═══════════════ */

  /* Nine acts, floor to ceiling. The wall is a spine you scan — time, act,
     clause — so the single red row reads at a glance. Amounts, evidence and
     the verbatim clause live in the detail plate beside it. */
  var ACTS = [
    {
      t: "07:02", act: "Reorder water filter", badge: "C1", cls: "b-ok",
      clause: "C1", quote: "Single commitments to $400", note: "within the ceiling",
      done: "Reorder placed with the usual supplier", dm: "$38 · refundable 30 days",
      ev: ["order receipt", "mandate reference"], exp: 0
    },
    {
      t: "07:04", act: "Move refuse collection", badge: "C1", cls: "b-ok",
      clause: "C1", quote: "Single commitments to $400", note: "no money committed",
      done: "Collection window changed with the municipal service", dm: "no charge",
      ev: ["service confirmation"], exp: 0
    },
    {
      t: "08:15", act: "Book gutter clearance", badge: "C1 + C2", cls: "b-ok",
      clause: "C1 + C2", quote: "Nothing non-refundable without a confirmation",
      note: "cancellable, so none was owed",
      done: "Booked for Saturday, free cancellation to Friday", dm: "$180",
      ev: ["provider terms snapshot", "booking receipt"], exp: 0
    },
    {
      t: "09:40", act: "Dispatch yard unit, survey", badge: "C3", cls: "b-ok",
      clause: "C3", quote: "Machines inside the property line only",
      note: "route checked against polygon v3",
      done: "Yard unit 2 surveyed the rear boundary", dm: "11 minutes · excursion 0.0 m",
      ev: ["GNSS track", "boundary polygon v3"], exp: 0
    },
    {
      t: "11:22", act: "Pay water account", badge: "C1", cls: "b-ok",
      clause: "C1", quote: "Single commitments to $400", note: "recurring, within ceiling",
      done: "Account settled in full", dm: "$96", ev: ["payment record"], exp: 0
    },
    {
      t: "13:06", act: "Yard unit clears 14 m of hedge", meta: "9.4 m of it on Deb Hollis's side",
      badge: "no clause", cls: "b-no", flag: true, clause: null,
      note: "Breaches C3 and, through the neighbour, C4",
      done: "Yard unit 2 cut 14.2 m of hedge, 9.4 m of it on the neighbouring plot",
      dm: "excursion 3.1 m · 4 minutes",
      ev: ["GNSS track 13:04–13:09", "polygon v3"], exp: 0
    },
    {
      t: "13:44", act: "Ask Ada to approve haulage", meta: "approved in 41 seconds",
      badge: "C5", cls: "b-ask",
      clause: "C5", quote: "Anything else stops and asks",
      done: "Answered from a clinic corridor, between a dental and a suture check",
      ev: ["voice transcript", "device attestation"],
      transcript: [
        ["Agent", "Booking haulage for the cuttings from clearing your rear boundary — $380, non-refundable. Approve?"],
        ["Ada", "Yes, go ahead."]
      ],
      omit: "What the question left out — the cut had crossed the property line.",
      exp: 0
    },
    {
      t: "13:46", act: "Book non-refundable haulage", meta: "$380 · non-refundable",
      badge: "C1 + C2", cls: "b-ok",
      clause: "C1 + C2", quote: "Nothing non-refundable without a confirmation",
      note: "confirmed at 13:44, so formally in scope",
      done: "Haulage booked for the same afternoon", dm: "$380 · collection 16:30",
      ev: ["merchant terms snapshot", "confirmation at 13:44"], exp: 380
    },
    {
      t: "16:10", act: "Deb Hollis's agent files a damage notice", meta: "Ada saw it at 16:12",
      badge: "third party", cls: "b-none",
      clause: null, noClauseLabel: "Not an act of this household's agent",
      note: "replanting and labour, quoted by the neighbour",
      done: "Notice matched to the 13:06 track in 90 seconds",
      dm: "$1,340 · replanting 9.4 m",
      ev: ["neighbour notice", "two quotes"], exp: 1720
    }
  ];

  (function ledger() {
    var listEl = $("#acts");
    var detail = $("#ledgerDetail");
    var idxEl = $("#actIndex");
    var sel = 0;

    ACTS.forEach(function (a, i) {
      var li = el("li");
      if (a.flag) li.className = "flag";
      var b = el("button", "act-btn");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el("span", "t", a.t));
      var m = el("span", "a");
      m.appendChild(document.createTextNode(a.act));
      if (a.meta) m.appendChild(el("em", null, a.meta));
      b.appendChild(m);
      b.appendChild(el("span", "badge " + a.cls, a.badge));
      b.addEventListener("click", function () { sel = i; render(); });
      li.appendChild(b);
      listEl.appendChild(li);
    });

    function render() {
      $$(".act-btn", listEl).forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === sel)); });
      var a = ACTS[sel];
      idxEl.textContent = "Act " + (sel + 1) + " of " + ACTS.length;
      $("#actPrev").disabled = sel === 0;
      $("#actNext").disabled = sel === ACTS.length - 1;

      detail.innerHTML = "";

      var ins = el("div", "ld-side instructed" + (a.clause ? "" : " none"));
      ins.appendChild(el("p", "eyebrow", a.clause ? "Instructed · clause " + a.clause : "Instructed · nothing authorises this"));
      ins.appendChild(el("p", "ld-quote", a.clause ? "“" + a.quote + "”" : (a.noClauseLabel || "No clause of the mandate covers this act.")));
      if (a.note) ins.appendChild(el("p", "ld-meta", a.note));
      detail.appendChild(ins);

      var done = el("div", "ld-side done");
      done.appendChild(el("p", "eyebrow", "Done · " + a.t));
      done.appendChild(el("p", "ld-quote", a.done));
      if (a.dm) done.appendChild(el("p", "ld-meta", a.dm));
      if (a.transcript) {
        var tr = el("div", "transcript");
        a.transcript.forEach(function (line) {
          var p = el("p");
          p.appendChild(el("span", "who", line[0]));
          p.appendChild(document.createTextNode("“" + line[1] + "”"));
          tr.appendChild(p);
        });
        done.appendChild(tr);
      }
      if (a.omit) done.appendChild(el("p", "omit", a.omit));
      var ev = el("div", "ev");
      a.ev.forEach(function (e) { ev.appendChild(el("span", null, e)); });
      done.appendChild(ev);
      detail.appendChild(done);

      /* The running tally stays in the plate, so the loss and the match count
         are on screen whichever act is open. */
      var running = 0;
      for (var i = 0; i <= sel; i++) running = Math.max(running, ACTS[i].exp);
      var matched = (sel + 1) - ACTS.slice(0, sel + 1).filter(function (x) { return !x.clause; }).length;
      var exp = el("div", "ld-side exposure");
      var a1 = el("div");
      a1.appendChild(el("span", "fig-h" + (running ? " alert" : ""), money(running)));
      a1.appendChild(el("span", "eyebrow", "Loss on the record, to " + a.t));
      exp.appendChild(a1);
      var a2 = el("div");
      a2.appendChild(el("span", "fig-h", matched + "/" + (sel + 1)));
      a2.appendChild(el("span", "eyebrow", "Acts matched to a clause"));
      exp.appendChild(a2);
      detail.appendChild(exp);
      // a newly chosen act starts at its own top, not where the last one ended
      detail.scrollTop = 0;
      markScrollables();
    }

    $("#actPrev").addEventListener("click", function () { if (sel > 0) { sel--; render(); } });
    $("#actNext").addEventListener("click", function () { if (sel < ACTS.length - 1) { sel++; render(); } });
    $("#actJump").addEventListener("click", function () { sel = 5; render(); });
    render();
  })();

  /* ═══════════════ 7 · The waterfall, floor to ceiling ═══════════════ */

  var CASES = [
    {
      key: "hedge", label: "Hedge cut beyond the line", total: 1720,
      layers: [
        { amt: 260, day: "day 2", why: "Unperformed portion of the haulage booking" },
        { amt: 120, day: "day 5", why: "Remainder of a card purchase made under an authenticated mandate" },
        { amt: 1000, day: "day 11", why: "Machine action outside the stated envelope, capped per event" },
        { amt: 240, day: "day 16", why: "Deb Hollis's replanting above the platform cap, after the household share" }
      ],
      share: 100,
      verdict: "Of <b>$1,720</b>, three layers absorb $1,380 in eleven days, the Okonjos bear $100, and the policy pays <b>$240</b>."
    },
    {
      key: "wrong-item", label: "Wrong item bought and delivered", total: 210,
      layers: [
        { amt: 210, day: "day 2", why: "Goods unopened, returned inside the provider's own window" },
        { amt: 0, day: "not reached", why: "Nothing left for the network to absorb" },
        { amt: 0, day: "not reached", why: "No machine and no dispatch involved" },
        { amt: 0, day: "not reached", why: "No residual, and no claim was ever opened" }
      ],
      share: 0,
      verdict: "Of <b>$210</b>, the provider reverses all of it in two days, and the policy pays <b>nothing</b>."
    },
    {
      key: "regret", label: "In-scope purchase the household regretted", total: 640,
      layers: [
        { amt: 0, day: "day 1", why: "Provider terms allow no return on a made-to-order item" },
        { amt: 0, day: "day 3", why: "No agent error: the act matched clause C1 exactly" },
        { amt: 0, day: "day 3", why: "No dispatch, and nothing outside the platform's envelope" },
        { amt: 0, day: "day 4", why: "Declined — the agent did what it was told to do" }
      ],
      share: 640,
      verdict: "Of <b>$640</b>, no layer owes anything, and the record closes the claim in four days by showing the agent did exactly as instructed."
    }
  ];

  var LAYER_NAMES = ["Provider reversal", "Network agent-error protection", "Platform dispatch guarantee", "The policy"];

  var waterfall = (function () {
    var chips = $("#caseChips");
    var wall = $("#fallWall");
    var totalEl = $("#fallTotal");
    var verdict = $("#fallVerdict");
    var ci = 0, step = 0;

    CASES.forEach(function (c, i) {
      var b = el("button", "chip" + (i === 0 ? " on" : ""), c.label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", function () {
        ci = i; step = 0;
        $$(".chip", chips).forEach(function (x, j) {
          x.classList.toggle("on", j === i);
          x.setAttribute("aria-pressed", String(j === i));
        });
        render();
      });
      chips.appendChild(b);
    });

    function band(cls, n, name, amt, day, why, weight) {
      var d = el("div", "band " + cls);
      d.dataset.weight = String(weight);
      var lab = el("div", "band-label");
      if (why) lab.appendChild(el("span", "bl-why", why));
      if (day) lab.appendChild(el("span", "bl-day", day));
      if (n) lab.appendChild(el("span", "bl-n", n));
      lab.appendChild(el("span", "bl-name", name));
      if (amt !== null) lab.appendChild(el("span", "bl-amt", amt));
      d.appendChild(lab);
      return d;
    }

    function render() {
      var c = CASES[ci];
      totalEl.textContent = money(c.total);

      var settled = 0;
      for (var i = 0; i < step; i++) settled += c.layers[i].amt;
      var shareIn = step >= 4 ? c.share : 0;
      var open = c.total - settled - shareIn;

      /* Before the first layer is asked, the four of them divide the whole
         stage equally: the screen is the order a claim travels, floor to
         ceiling, with nothing yet settled and no blank left over.

         Once stepping starts an unasked layer is a placeholder rather than a
         quantity, so its weight is arbitrary — but it has to be large enough to
         hold its own card. On a phone the card's label wraps to two lines, so
         the placeholder is given more of the wall there; the settled layers
         keep their true proportions against each other either way, and by the
         last step there are no placeholders left at all. */
      var pendingWeight = step === 0 ? 1 : (window.innerWidth <= 760 ? 0.17 : 0.075);

      wall.innerHTML = "";
      for (i = 0; i < 4; i++) {
        var l = c.layers[i];
        if (i < step) {
          var frac = l.amt / c.total;
          wall.appendChild(band("b" + (i + 1) + (l.amt === 0 ? " zero" : ""),
            "0" + (i + 1), LAYER_NAMES[i],
            l.amt === 0 ? "nothing owed" : money(l.amt), l.day, l.why,
            Math.max(frac, 0.07)));
        } else {
          wall.appendChild(band("pending", "0" + (i + 1), LAYER_NAMES[i], "—", "not yet asked", l.why, pendingWeight));
        }
      }
      if (shareIn > 0) {
        wall.appendChild(band("b5", null, c.share >= c.total ? "Borne by the household" : "Household share",
          money(shareIn), null, null, Math.max(shareIn / c.total, 0.055)));
      }
      if (open > 0 && step > 0) {
        wall.appendChild(band("remainder", null, "Still open", money(open), null, null, open / c.total));
      }

      layoutBands();

      verdict.innerHTML = step >= 4
        ? c.verdict
        : "Step through the four layers in the order a claim actually travels.";
      $("#fallStep").disabled = step >= 4;
      $("#fallStep").textContent = step === 0 ? "First layer" : "Next layer";
      $("#fallAll").textContent = step >= 4 ? "Start over" : "Settle it";
      markScrollables();
    }

    function layoutBands() {
      var bands = $$(".band", wall);
      if (!bands.length) return;
      var sum = bands.reduce(function (a, b) { return a + Number(b.dataset.weight); }, 0);
      var h = wall.clientHeight || window.innerHeight;
      bands.forEach(function (b) {
        var pct = Number(b.dataset.weight) / sum;
        b.style.flexBasis = (pct * 100) + "%";
        var px = pct * h;
        b.classList.toggle("thin", px < 96);
        b.classList.toggle("hair", px < 52);
      });
    }

    $("#fallStep").addEventListener("click", function () { if (step < 4) { step++; render(); } });
    $("#fallAll").addEventListener("click", function () { step = step >= 4 ? 0 : 4; render(); });
    render();
    return { relayout: layoutBands };
  })();

  /* ═══════════════ 8 · The book, as a field ═══════════════ */

  /* The last group is the one the argument turns on, so it is laid last: the
     61 dots the policy pays land in the final rows, below the plate's foot,
     where nothing covers them. */
  var GROUPS = [
    { n: 612, name: "Provider reversal", sub: "3 days median · $190 mean", c: "g0", sw: "#4E6B58" },
    { n: 197, name: "Network agent-error protection", sub: "6 days · $260 mean", c: "g1", sw: "#4E6C86" },
    { n: 106, name: "Platform dispatch guarantee", sub: "12 days · $840 mean", c: "g2", sw: "#6F6091" },
    { n: 24, name: "Nothing owed", sub: "1 day · the record showed no divergence", c: "g4", sw: "#8A87A0" },
    { n: 61, name: "Policy paid", sub: "19 days · $1,180 mean", c: "g3", sw: "#A3302B" }
  ];

  var book = (function () {
    var w = $("#waffle");
    var legend = $("#bookLegend");

    var frag = document.createDocumentFragment();
    var gi = 0, left = GROUPS[0].n;
    for (var i = 0; i < 1000; i++) {
      while (left === 0 && gi < GROUPS.length - 1) { gi++; left = GROUPS[gi].n; }
      var d = el("i", GROUPS[gi].c);
      d.dataset.g = String(gi);
      frag.appendChild(d);
      left--;
    }
    w.appendChild(frag);

    function focus(g) {
      if (g === null) { w.classList.remove("focus"); return; }
      w.classList.add("focus");
      $$("i", w).forEach(function (d) { d.classList.toggle("hot", d.dataset.g === String(g)); });
    }

    GROUPS.forEach(function (g, i) {
      var li = el("li");
      var b = el("button", "lg-btn");
      b.type = "button";
      var sw = el("span", "sw");
      sw.style.background = g.sw;
      b.appendChild(sw);
      var nm = el("span", "nm");
      nm.appendChild(document.createTextNode(g.name));
      nm.appendChild(el("em", null, g.sub));
      b.appendChild(nm);
      b.appendChild(el("span", "ct num", String(g.n)));
      ["mouseenter", "focus"].forEach(function (ev) { b.addEventListener(ev, function () { focus(i); }); });
      ["mouseleave", "blur"].forEach(function (ev) { b.addEventListener(ev, function () { focus(null); }); });
      b.addEventListener("click", function () { focus(i); });
      li.appendChild(b);
      legend.appendChild(li);
    });

    /* The field fills the screen, so the column count follows the viewport's
       shape. Only counts that divide 1,000 are used, so the last row is full
       and the 61 red dots stay a clean band rather than a ragged one. */
    function fit() {
      var W = w.clientWidth || window.innerWidth, H = w.clientHeight || window.innerHeight;
      if (!W || !H) return;
      var ideal = Math.sqrt(1000 * (W / H));
      var choices = [20, 25, 40, 50];
      var best = choices[0], bd = Infinity;
      choices.forEach(function (c) { var d = Math.abs(c - ideal); if (d < bd) { bd = d; best = c; } });
      w.style.setProperty("--cols", best);
    }

    return { fit: fit };
  })();

  /* ═══════════════ 9 · The premium is the screen ═══════════════ */

  var DIALS = [
    {
      k: "confirm", label: "Confirmation before a commitment",
      opts: [
        { t: "Act within my rules", ind: 2.1, hand: 1.4, limit: 0.5, share: 250 },
        { t: "Confirm above $150", ind: 1, hand: 1, limit: 1, share: 100 },
        { t: "Confirm everything", ind: 0.55, hand: 0.8, limit: 1, share: 50 }
      ], sel: 1
    },
    {
      k: "dispatch", label: "Machines the agent may dispatch",
      opts: [
        { t: "None", ind: 0.35, hand: 1, limit: 1 },
        { t: "Inside the boundary", ind: 1, hand: 1, limit: 1 },
        { t: "Unrestricted", ind: 2.6, hand: 1, limit: 0.5 }
      ], sel: 1
    },
    {
      k: "third", label: "Commitments binding other people",
      opts: [
        { t: "Not allowed", ind: 1, hand: 1, limit: 1 },
        { t: "Allowed", ind: 1.9, hand: 1, limit: 1 }
      ], sel: 0
    },
    {
      k: "platform", label: "Agent platforms",
      opts: [
        { t: "Attested only", ind: 1, hand: 1, limit: 1 },
        { t: "Any platform", ind: 1.7, hand: 1.25, limit: 1 }
      ], sel: 0
    }
  ];

  var premium = (function () {
    var host = $("#dials");
    var wall = $("#decomp");

    DIALS.forEach(function (d) {
      var wrap = el("div", "dial");
      wrap.appendChild(el("p", "eyebrow", d.label));
      var seg = el("div", "seg");
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", d.label);
      d.opts.forEach(function (o, i) {
        var b = el("button", null, o.t);
        b.type = "button";
        b.setAttribute("aria-pressed", String(i === d.sel));
        b.addEventListener("click", function () {
          d.sel = i;
          $$("button", seg).forEach(function (x, j) { x.setAttribute("aria-pressed", String(j === i)); });
          render();
        });
        seg.appendChild(b);
      });
      wrap.appendChild(seg);
      host.appendChild(wrap);
    });

    var parts = [];

    function render() {
      var ind = 1.80, hand = 9.20, custody = 4.00, limit = 10000, share = 100;
      DIALS.forEach(function (d) {
        var o = d.opts[d.sel];
        ind *= o.ind;
        hand *= (o.hand || 1);
        limit *= (o.limit || 1);
        if (o.share !== undefined) share = o.share;
      });
      limit = Math.max(5000, Math.round(limit / 500) * 500);
      var risk = ind + hand + custody;
      var gross = risk / 0.52;
      var expense = gross - risk;
      var monthly = Math.round((gross / 12) / 0.05) * 0.05;

      $("#qPrice").textContent = "$" + monthly.toFixed(2);
      $("#qLimit").textContent = money(limit);
      $("#qShare").textContent = money(share);

      /* Widest first, so the indemnity stripe lands at the far right of the
         screen, clear of the plate — the whole point is that you see how thin
         it is against everything else. */
      parts = [
        { n: "Expenses and margin", v: expense, c: "d3" },
        { n: "Recovery, three layers", v: hand, c: "d1" },
        { n: "Record custody", v: custody, c: "d2" },
        { n: "Expected indemnity", v: ind, c: "d0", tag: true }
      ];

      wall.innerHTML = "";
      parts.forEach(function (p) {
        var b = el("div", "vband " + p.c);
        b.dataset.frac = String(p.v / gross);
        b.style.flexBasis = (p.v / gross * 100) + "%";
        var inner = el("div", "vband-in");
        inner.appendChild(el("span", "vb-name", p.n));
        inner.appendChild(el("span", "vb-amt", "$" + p.v.toFixed(2)));
        inner.appendChild(el("span", "vb-pct", Math.round(p.v / gross * 100) + "%"));
        b.appendChild(inner);
        wall.appendChild(b);
      });

      /* The tag carries the indemnity's own figure, not just its share, because
         the stripe itself can be thinner than the word "$0.35" — at which point
         the stripe's label comes out and this is the only place it is stated. */
      var pct = Math.round(ind / gross * 100);
      var tag = el("div", "vband-tag");
      tag.appendChild(el("p", "eyebrow", "Expected indemnity"));
      tag.appendChild(el("span", "fig-t", "$" + ind.toFixed(2) + " a year"));
      tag.appendChild(el("p", "vband-tag-sub", pct + "% of the premium"));
      wall.appendChild(tag);

      $("#qWhy").textContent = "Indemnity is " + pct
        + "% of a year's premium of $" + gross.toFixed(2)
        + "; the rest buys the record and the pursuit through three layers.";

      fit();
      markScrollables();
    }

    /* The tag is pinned over the middle of the indemnity stripe and clamped
       into the frame, because a 6% stripe is narrower than its own label. */
    function fit() {
      var bands = $$(".vband", wall);
      var tag = $(".vband-tag", wall);
      if (!bands.length || !tag) return;
      var W = wall.clientWidth || window.innerWidth;
      /* On a phone the bands lie on their side, so a band's extent is its
         height and a full-width row always has room for its own label. */
      var vertical = getComputedStyle(wall).flexDirection === "column";
      var extent = vertical ? (wall.clientHeight || window.innerHeight) : W;
      bands.forEach(function (b) {
        var px = Number(b.dataset.frac) * extent;
        b.classList.toggle("narrow", !vertical && px < 118);
        /* Under a mandate that dispatches no machines the indemnity falls to a
           fifteen-pixel band, which cannot hold "$0.35" without cutting it.
           The label steps out and the opaque tag above states the figure. */
        b.classList.toggle("hair", px < (vertical ? 30 : 62));
      });
      var last = bands[bands.length - 1];
      var centre = last.offsetLeft + last.offsetWidth / 2;
      var tw = tag.offsetWidth || 160;
      tag.style.left = Math.max(tw / 2 + 12, Math.min(W - tw / 2 - 12, centre)) + "px";
    }

    render();
    return { fit: fit };
  })();

  /* ═══════════════ 10 · Three open questions ═══════════════ */

  var BOUNDS = [
    {
      q: "Is the record evidence?",
      status: "Unsettled",
      s: "No one has established whether a mandate log is evidence: who holds it, whether it can be altered afterwards, and whether a court would accept it as proof of scope.",
      w: "A contested claim settled on the log."
    },
    {
      q: "Is an agent purchase authorised?",
      status: "Untested",
      s: "No payment regulation yet says whether a purchase an agent makes under a general authority is authorised, and a ruling either way moves most of this loss.",
      w: "A regulator ruling on agent purchases."
    },
    {
      q: "Is the residual big enough?",
      status: "No data anywhere",
      s: "No published loss data exists for consumer agent error anywhere, so every number here is invented and the real residual could be a fraction of it.",
      w: "Published frequency and severity, from anyone."
    }
  ];

  var qpaint = function () {};

  (function boundaries() {
    var host = $("#boundaries");
    var items = [];
    BOUNDS.forEach(function (b, i) {
      var li = el("li");
      items.push(li);

      var top = el("div", "q-top");
      top.appendChild(el("span", "n", "0" + (i + 1)));
      top.appendChild(el("span", "q", b.q));
      li.appendChild(top);

      li.appendChild(el("p", "s", b.s));

      var st = el("p", "q-status");
      st.appendChild(el("span", "eyebrow", "Where it stands"));
      st.appendChild(el("span", "q-state", b.status));
      li.appendChild(st);

      var body = el("div", "bd-body");
      var p = el("p");
      p.appendChild(el("b", null, "Would change our mind"));
      p.appendChild(document.createTextNode(b.w));
      body.appendChild(p);
      li.appendChild(body);

      host.appendChild(li);
    });

    /* On a phone three full-height columns do not fit, and neither of the usual
       escapes is acceptable: tightening the type until all three fit spends the
       reading load, and letting the wall scroll throws away the thing that
       makes a wall read as a wall. So the wall paginates — one question at a
       time, whole, at a size worth reading, with the pager in the head. On a
       wide screen the pager is hidden and all three stand side by side. */
    var pager = el("div", "qpager");
    var pPrev = el("button", "qp-btn", "‹");
    pPrev.type = "button";
    pPrev.setAttribute("aria-label", "Previous question");
    var pLabel = el("span", "qp-label");
    var pNext = el("button", "qp-btn", "›");
    pNext.type = "button";
    pNext.setAttribute("aria-label", "Next question");
    pager.appendChild(pPrev);
    pager.appendChild(pLabel);
    pager.appendChild(pNext);
    $(".q-head").appendChild(pager);

    var phone = window.matchMedia("(max-width:760px)");
    var qi = 0;

    qpaint = function () {
      var paged = phone.matches;
      if (!paged) qi = 0;
      pager.hidden = !paged;
      items.forEach(function (li, i) { li.hidden = paged && i !== qi; });
      pLabel.textContent = "Question " + (qi + 1) + " of " + items.length;
      pPrev.disabled = qi === 0;
      pNext.disabled = qi === items.length - 1;
    };

    pPrev.addEventListener("click", function () { if (qi > 0) { qi--; qpaint(); } });
    pNext.addEventListener("click", function () { if (qi < items.length - 1) { qi++; qpaint(); } });
    if (phone.addEventListener) phone.addEventListener("change", qpaint);
    qpaint();
  })();

  /* ═══════════════ Layout: every ground is measured, not assumed ═══════════ */

  var rafId = null;
  function relayout() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function () {
      rafId = null;
      var vis = function (id) { var n = document.getElementById(id); return n && n.clientHeight > 0; };
      if (vis("planGround")) renderPlan($("#planGround"), {});
      // the divergence screen comes in closer, on the hedge
      if (vis("trackGround")) renderPlan($("#trackGround"), { track: true, zoom: 1.4, cy: -17 });
      // the closing ground is a texture, not a diagram: no tags to go faint
      if (vis("closeGround")) renderPlan($("#closeGround"), { labels: false });
      stream.measure();
      waterfall.relayout();
      book.fit();
      premium.fit();
      qpaint();
      markScrollables();
    });
  }
  window.addEventListener("resize", relayout);
  window.addEventListener("orientationchange", relayout);

  /* boot */
  show(1);
})();
