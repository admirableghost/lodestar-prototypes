/* ══════════════════════════════════════════════════════════════════════════
   OpenCover · insurance written to be read by the customer's machine
   No framework, no build step, no external request. Three files.

   Forked from prototype/resilience-grid/app.js. The navigation, the camera,
   the per-screen --fit search and the pin projection are that file's
   machinery, inherited verbatim. What is new is the ground it draws and the
   three objects this concept needs: the stated record, the offer document,
   the performance ledger.

   THE GROUND
   This prototype has no territory. Its subject is published terms, so the
   ground is a REGISTER: a ruled sheet in one world space 1600 x 1000,
   carrying three records — what the person stated, the three offers read as
   data, the performance ledger — with arrows from the first to the second to
   the third, and a heavier arrow returning from the ledger to the offers.
   That return arrow is the whole strategic claim drawn once: the market
   re-opens on a missed commitment, not on a renewal date.

   WHAT IS INVENTED
   All of it. Meridian Mutual, Candlewick Direct and Pell & Roe Assurance are
   invented insurers; every premium, excess, exclusion, commitment, remedy and
   performance check below is invented; the household and its stated
   priorities are invented. Screen 1 says so, plainly, on the glass. No real
   insurer, policy, price or assistant is described anywhere in these files,
   and no invented figure is attached to any real company.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════
     CONTENT — one structure per object, all of it here, so copy can be
     swapped without touching layout.
     ══════════════════════════════════════════════════════════════════════ */

  /* The four things the household stated. Order is the priority order. */
  var PRIORITIES = [
    { id: "lapse",  name: "Never lapse",
      k: "continuity.no_lapse = required",
      said: "Cover must never have a gap, including at renewal." },
    { id: "excess", name: "Cap the excess",
      k: "excess.max_usd = 500",
      said: "No excess above 500 USD on any claim." },
    { id: "driver", name: "Keep the named driver",
      k: "named_driver.keep = \"rosa\"",
      said: "Rosa stays a covered driver. She is nineteen." },
    { id: "settle", name: "Speed over price",
      k: "settlement.commitment > premium.lowest",
      said: "A published settlement time beats a lower premium." }
  ];

  /* The permission boundary, in the one number the assistant has to test. */
  var DELTA = 200;            /* USD a year above the cheapest offer */

  var OFFERS = [
    {
      id: "meridian", name: "Meridian Mutual",
      ref: "offer/meridian-mutual/v9",
      meta: "motor · 12 months · published",
      premium: 1340, price: "1,340.00 USD / yr",
      why: "",
      scores: {
        lapse:  { ok: true, v: "guaranteed" },
        excess: { ok: true, v: "450 USD" },
        driver: { ok: true, v: "no age condition" },
        settle: { ok: true, v: "5 days, with a remedy" }
      },
      doc: [
        { h: "terms", rows: [
          { k: "product",                      v: "motor · 12 months" },
          { k: "annual_premium",               v: "1,340.00 USD" },
          { k: "excess.standard",              v: "450.00 USD" },
          { k: "excess.windscreen",            v: "0.00 USD" },
          { k: "continuity.no_lapse",          v: "true, guaranteed at renewal" }
        ] },
        { h: "covered perils", rows: [
          { k: "third_party_liability",        v: "unlimited" },
          { k: "fire_and_theft",               v: "included" },
          { k: "named_driver.all_listed",      v: "included, no age condition" },
          { k: "driving_abroad",               v: "30 days a year" }
        ] },
        { h: "not covered", cls: "out", rows: [
          { k: "track_use",                    v: "excluded", out: true },
          { k: "commercial_hire",              v: "excluded", out: true },
          { k: "personal_effects",             v: "excluded above 400.00 USD", out: true }
        ] },
        { h: "service commitments", cls: "com", rows: [
          { k: "first_response.days",  v: "1 working day",
            rem: "remedy 25.00 USD credit" },
          { k: "settlement.days",      v: "5 working days from agreed liability",
            rem: "remedy 50.00 USD per day late, paid without a claim" },
          { k: "renewal_notice.days",  v: "30, with the new price published" },
          { k: "performance.published", v: "monthly, machine-readable" }
        ] }
      ]
    },
    {
      id: "candlewick", name: "Candlewick Direct",
      ref: "offer/candlewick-direct/v4",
      meta: "motor · 12 months · published",
      premium: 1185, price: "1,185.00 USD / yr",
      why: "the named driver would be uninsured",
      scores: {
        lapse:  { ok: true,  v: "guaranteed" },
        excess: { ok: true,  v: "500 USD" },
        driver: { ok: false, v: "under 25 excluded" },
        settle: { ok: false, v: "none published" }
      },
      doc: [
        { h: "terms", rows: [
          { k: "product",                      v: "motor · 12 months" },
          { k: "annual_premium",               v: "1,185.00 USD" },
          { k: "excess.standard",              v: "500.00 USD" },
          { k: "continuity.no_lapse",          v: "true, guaranteed at renewal" }
        ] },
        { h: "covered perils", rows: [
          { k: "third_party_liability",        v: "unlimited" },
          { k: "fire_and_theft",               v: "included" },
          { k: "windscreen",                   v: "included, 0.00 USD excess" }
        ] },
        { h: "not covered", cls: "out", rows: [
          { k: "named_driver.under_25",        v: "excluded — Rosa is nineteen", out: true },
          { k: "driving_abroad",               v: "excluded", out: true },
          { k: "courtesy_car",                 v: "excluded", out: true }
        ] },
        { h: "service commitments", cls: "com", rows: [
          { k: "first_response.days",        v: "1 working day" },
          { k: "first_response.remedy",      nul: true, v: "nothing is owed if it is missed" },
          { k: "settlement.days",            nul: true, v: "no settlement time is published" },
          { k: "renewal_notice.days",        v: "21, price published on request" }
        ] }
      ]
    },
    {
      id: "pell", name: "Pell & Roe Assurance",
      ref: "offer/pell-and-roe/v2",
      meta: "motor · 12 months · published",
      premium: 1420, price: "1,420.00 USD / yr",
      why: "the excess would be 900 USD, twice the stated cap",
      scores: {
        lapse:  { ok: true,  v: "guaranteed" },
        excess: { ok: false, v: "900 USD" },
        driver: { ok: true,  v: "covered" },
        settle: { ok: true,  v: "10 days, with a remedy" }
      },
      doc: [
        { h: "terms", rows: [
          { k: "product",                      v: "motor · 12 months" },
          { k: "annual_premium",               v: "1,420.00 USD" },
          { k: "excess.standard",              v: "900.00 USD" },
          { k: "continuity.no_lapse",          v: "true, guaranteed at renewal" }
        ] },
        { h: "covered perils", rows: [
          { k: "third_party_liability",        v: "unlimited" },
          { k: "fire_and_theft",               v: "included" },
          { k: "named_driver.all_listed",      v: "included, no age condition" },
          { k: "windscreen",                   v: "included, 75.00 USD excess" }
        ] },
        { h: "not covered", cls: "out", rows: [
          { k: "theft.unattended",             v: "excluded", out: true },
          { k: "modifications",                v: "excluded if undeclared", out: true },
          { k: "driving_abroad",               v: "excluded", out: true }
        ] },
        { h: "service commitments", cls: "com", rows: [
          { k: "first_response.days",   v: "2 working days" },
          { k: "settlement.days",       v: "10 working days from agreed liability",
            rem: "remedy 20.00 USD per day late" },
          { k: "renewal_notice.days",   v: "30, with the new price published" }
        ] }
      ]
    }
  ];

  /* Eleven months of the bought policy, checked against what it promised. */
  var LEDGER = [
    { name: "First response within 1 working day",
      k: "first_response.days = 1 · remedy = 25.00 USD credit",
      checks: [1, 1, 1], tag: "Met", cls: "met",
      said: "Three claims notified. Three responses inside the day." },
    { name: "Settlement within 5 working days of agreed liability",
      k: "settlement.days = 5 · remedy = 50.00 USD per day late",
      checks: [1, 1, 0], tag: "Missed once", cls: "miss",
      said: "Nine working days on the third claim. Remedy applied automatically: 200.00 USD, with no claim made for it." },
    { name: "Renewal price published 30 days ahead",
      k: "renewal_notice.days = 30 · performance.published = monthly",
      checks: [1], tag: "Met", cls: "met",
      said: "Published, machine-readable, on day thirty-four." }
  ];

  /* ══════════════════════════════════════════════════════════════════════
     STATE — two switches, both of them visible on the glass, and both of
     them load-bearing on a later screen. The permission granted on screen 1
     decides whether screen 2 can buy and whether screen 3 can switch.
     ══════════════════════════════════════════════════════════════════════ */

  var granted = false;
  var rankMode = "priorities";   /* or "price" */

  function ranked() {
    var a = OFFERS.slice();
    if (rankMode === "price") {
      a.sort(function (x, y) { return x.premium - y.premium; });
    } else {
      /* fails first, then price — a compliant offer always outranks a
         cheaper non-compliant one, which is the entire argument */
      a.sort(function (x, y) {
        var fx = fails(x).length, fy = fails(y).length;
        return fx !== fy ? fx - fy : x.premium - y.premium;
      });
    }
    return a;
  }
  function fails(o) {
    return PRIORITIES.filter(function (p) { return !o.scores[p.id].ok; });
  }
  function cheapest() {
    return OFFERS.reduce(function (a, b) { return a.premium <= b.premium ? a : b; });
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE GROUND — a register sheet, 1600 x 1000
     ══════════════════════════════════════════════════════════════════════ */

  var W = 1600, H = 1000;

  var INK     = "#44415C",
      PAPER   = "#FBF9F1",
      RULE    = "#8A959C",
      HAIR    = "#DCDDD8",
      CARRIER = "#2F5E7C",
      UTILITY = "#5B4E7A",
      PUBLIC  = "#2F5A44",
      ALARM   = "#A33322";

  /* The three records, in world coordinates. Deliberately SMALL against the
     sheet: at the camera distances below they render around 120–210px wide,
     which is the size at which a card of ruled rows reads as a document on
     a page. Drawn any larger, the rows read as a loading skeleton. */
  var PRINCIPAL = { x: 150, y: 196, w: 300, h: 290 };
  var CARDS = [
    { id: "candlewick", x: 696,  y: 420, w: 170, h: 316 },
    { id: "meridian",   x: 886,  y: 420, w: 170, h: 316 },
    { id: "pell",       x: 1076, y: 420, w: 170, h: 316 }
  ];
  var LED = { x: 520, y: 806, w: 880, h: 150 };

  var svg = document.getElementById("plan");

  function rect(x, y, w, h, fill, stroke, sw, rx) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="' + (rx == null ? 4 : rx) + '" fill="' + fill + '"' +
           (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 1) + '"' : "") + "/>";
  }
  function bar(x, y, w, h, fill, op) {
    return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(2, w).toFixed(1) +
           '" height="' + h + '" rx="1" fill="' + fill + '" opacity="' + (op == null ? 1 : op) + '"/>';
  }
  function cross(x, y, r, c) {
    return '<g stroke="' + c + '" stroke-width="2" stroke-linecap="round">' +
           '<line x1="' + (x - r) + '" y1="' + (y - r) + '" x2="' + (x + r) + '" y2="' + (y + r) + '"/>' +
           '<line x1="' + (x + r) + '" y1="' + (y - r) + '" x2="' + (x - r) + '" y2="' + (y + r) + '"/></g>';
  }
  function tick(x, y, r, c) {
    return '<path d="M' + (x - r) + " " + y + "L" + (x - r * 0.2) + " " + (y + r * 0.8) +
           "L" + (x + r) + " " + (y - r * 0.8) + '" fill="none" stroke="' + c +
           '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  /* A record card: a sheet with a head bar and a run of key/value rows.
     rows: { t: "row" | "out" | "ok" | "h", len: 0..1 } */
  function card(c, rows, opt) {
    opt = opt || {};
    var s = [], inner = c.w - 26, i, y, r;
    s.push(rect(c.x, c.y, c.w, c.h, PAPER, opt.sel ? INK : RULE,
                opt.sel ? 2.6 : 1, 5));
    /* the head rule and the identifier bar */
    s.push(bar(c.x + 13, c.y + 16, inner * 0.62, 6, INK, opt.sel ? 1 : 0.68));
    s.push('<line x1="' + (c.x + 13) + '" y1="' + (c.y + 32) + '" x2="' + (c.x + c.w - 13) +
           '" y2="' + (c.y + 32) + '" stroke="' + (opt.sel ? INK : RULE) + '" stroke-width="1.4"/>');

    /* Every row carries a hairline under it. That one line is what makes a
       card of grey bars read as a RULED DOCUMENT rather than as a loading
       skeleton — it is the same move .kv makes in the CSS. */
    var rh = (c.h - 46) / rows.length;
    for (i = 0; i < rows.length; i++) {
      r = rows[i];
      y = c.y + 44 + i * rh;
      if (r.t === "h") {
        s.push(bar(c.x + 12, y - 1, inner * 0.34, 3, RULE, 0.8));
        s.push('<line x1="' + (c.x + 12) + '" y1="' + (y + 7) + '" x2="' + (c.x + c.w - 12) +
               '" y2="' + (y + 7) + '" stroke="' + RULE + '" stroke-width="1" opacity=".55"/>');
        continue;
      }
      var col = r.t === "out" ? ALARM : r.t === "ok" ? PUBLIC : INK;
      var op  = r.t === "row" ? 0.42 : 0.82;
      if (r.t === "out") { s.push(cross(c.x + 17, y + 2, 3.6, ALARM)); }
      else if (r.t === "ok") { s.push(tick(c.x + 17, y + 2, 3.6, PUBLIC)); }
      else { s.push(bar(c.x + 12, y, inner * 0.28, 3, RULE, 0.55)); }
      s.push(bar(c.x + 12 + inner * 0.38, y, inner * 0.58 * (r.len || 0.7), 3, col, op));
      s.push('<line x1="' + (c.x + 12) + '" y1="' + (y + rh * 0.52) + '" x2="' + (c.x + c.w - 12) +
             '" y2="' + (y + rh * 0.52) + '" stroke="' + HAIR + '" stroke-width="1"/>');
    }
    return s.join("");
  }

  /* The shape of each record, as rows. Not a legend — a silhouette: the
     person's record is four stated lines and three permitted actions; each
     offer card shows where its crosses fall. */
  var PRINCIPAL_ROWS = [
    { t: "h" },
    { t: "row", len: 0.92 }, { t: "row", len: 0.6 },
    { t: "row", len: 0.78 }, { t: "row", len: 0.5 },
    { t: "h" },
    { t: "ok", len: 0.82 }, { t: "ok", len: 0.6 }, { t: "ok", len: 0.92 },
    { t: "row", len: 0.44 }
  ];
  var CARD_ROWS = {
    candlewick: [{ t: "h" }, { t: "row", len: 0.82 }, { t: "row", len: 0.56 },
                 { t: "row", len: 0.7 },
                 { t: "h" }, { t: "ok", len: 0.74 }, { t: "ok", len: 0.5 },
                 { t: "out", len: 0.88 }, { t: "out", len: 0.62 }, { t: "out", len: 0.46 },
                 { t: "h" }, { t: "row", len: 0.42 }],
    meridian:   [{ t: "h" }, { t: "row", len: 0.8 }, { t: "row", len: 0.6 },
                 { t: "row", len: 0.66 },
                 { t: "h" }, { t: "ok", len: 0.86 }, { t: "ok", len: 0.7 },
                 { t: "ok", len: 0.54 }, { t: "out", len: 0.48 },
                 { t: "h" }, { t: "ok", len: 0.9 }, { t: "ok", len: 0.76 }],
    pell:       [{ t: "h" }, { t: "row", len: 0.76 }, { t: "row", len: 0.66 },
                 { t: "row", len: 0.58 },
                 { t: "h" }, { t: "ok", len: 0.82 }, { t: "ok", len: 0.62 },
                 { t: "out", len: 0.54 }, { t: "out", len: 0.44 },
                 { t: "h" }, { t: "ok", len: 0.72 }, { t: "row", len: 0.5 }]
  };

  function ledgerStrip() {
    var s = [], i, j, y, x;
    s.push(rect(LED.x, LED.y, LED.w, LED.h, PAPER, RULE, 1, 5));
    s.push(bar(LED.x + 16, LED.y + 16, 190, 5, INK, 0.72));
    s.push('<line x1="' + (LED.x + 16) + '" y1="' + (LED.y + 32) + '" x2="' + (LED.x + LED.w - 16) +
           '" y2="' + (LED.y + 32) + '" stroke="' + RULE + '" stroke-width="1.2"/>');
    var runs = [[1, 1, 1, 1, 1, 1], [1, 1, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1]];
    for (i = 0; i < 3; i++) {
      y = LED.y + 60 + i * 34;
      s.push(bar(LED.x + 16, y - 2, 200, 4, RULE, 0.55));
      for (j = 0; j < runs[i].length; j++) {
        x = LED.x + 250 + j * 46;
        if (runs[i][j]) {
          s.push(rect(x, y - 9, 18, 18, PUBLIC, PUBLIC, 1.4, 3));
        } else {
          s.push(rect(x, y - 9, 18, 18, PAPER, ALARM, 2.4, 3));
          s.push(cross(x + 9, y, 4, ALARM));
        }
      }
      s.push('<line x1="' + (LED.x + 16) + '" y1="' + (y + 17) + '" x2="' + (LED.x + LED.w - 16) +
             '" y2="' + (y + 17) + '" stroke="' + HAIR + '" stroke-width="1"/>');
    }
    return s.join("");
  }

  function renderWorld(opts) {
    opts = opts || {};
    var s = [], i;

    s.push('<defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#EFEEE6"/><stop offset="1" stop-color="#F7F5EC"/></linearGradient>' +
      '<marker id="arr" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="5" markerHeight="5" orient="auto">' +
        '<path d="M0 0L8 4L0 8Z" fill="' + RULE + '"/></marker>' +
      '<marker id="ari" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="5.4" markerHeight="5.4" orient="auto">' +
        '<path d="M0 0L8 4L0 8Z" fill="' + INK + '"/></marker>' +
      "</defs>");

    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="url(#sky)"/>');

    /* ── the ruled field. The sheet is the page: it runs past every edge,
       so the three records read as entries in something larger. ── */
    for (i = -200; i <= H + 200; i += 36) {
      s.push('<line x1="-400" y1="' + i + '" x2="' + (W + 400) + '" y2="' + i +
             '" stroke="' + RULE + '" stroke-width="1" opacity=".085"/>');
    }
    for (i = -180; i <= W + 200; i += 220) {
      s.push('<line x1="' + i + '" y1="-400" x2="' + i + '" y2="' + (H + 400) +
             '" stroke="' + RULE + '" stroke-width="1" opacity=".055"/>');
    }

    /* ── the flows between the records ── */
    s.push('<path d="M456 336Q580 352 688 450" fill="none" stroke="' + RULE +
           '" stroke-width="1.8" marker-end="url(#arr)"/>');
    s.push('<path d="M966 744Q962 776 952 800" fill="none" stroke="' + RULE +
           '" stroke-width="1.8" marker-end="url(#arr)"/>');
    /* the return. Heavier, in the ink, because it is the argument: the
       market re-opens on a missed commitment rather than on a date. */
    s.push('<path d="M1402 874Q1534 812 1498 710Q1460 604 1258 584" fill="none" stroke="' + INK +
           '" stroke-width="2.6" marker-end="url(#ari)"/>');

    /* ── the records ── */
    s.push(card(PRINCIPAL, PRINCIPAL_ROWS, { sel: opts.focus === 1 }));
    CARDS.forEach(function (c) {
      s.push(card(c, CARD_ROWS[c.id], { sel: opts.sel === c.id }));
    });
    s.push(ledgerStrip());

    svg.innerHTML = s.join("");
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited from resilience-grid/app.js)
     ══════════════════════════════════════════════════════════════════════ */

  var vb = null, camTimer = 0;

  /* The sheet is read at roughly 0.72 : 1 on a 1440 x 900 window, so all
     three records stay on the page and the camera only PANS between them.
     A tighter camera blew one card up to half the viewport, at which size
     its ruled rows stopped reading as a document. */
  var CAM = {
    set:    { x: -360, y: -225, w: 2000, h: 1250 },   /* centred (640, 400) */
    offers: { x:  -20, y:  -55, w: 2000, h: 1250 },   /* centred (980, 570) */
    after:  { x:  -40, y:  175, w: 2000, h: 1250 }    /* centred (960, 800) */
  };
  /* On a phone the plates stack from the top and the register shows through
     whatever is left, so every view is pulled in to one record. */
  var CAM_N = {
    set:    { x: -135, y:  50, w: 900, h: 560 },
    offers: { x:  561, y: 310, w: 820, h: 520 },
    after:  { x:  460, y: 660, w: 1000, h: 420 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  function setVB(c) {
    svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h);
    vb = c;
  }

  /* Turn "this region must be visible" into a viewBox for an SVG that is
     bigger than the viewport and uses `slice`. Both axes resolve to the same
     scale, so slice crops the sheet and never the subject. `fit` says which
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
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.set;
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

  function pinSet(n) {
    if (n === 1) {
      return [{ cls: "utility", label: "Stated by the person", wx: 300, wy: 196, dy: -24 },
              { cls: "grey",    label: "Granted once",         wx: 300, wy: 486, dy: 24 }];
    }
    if (n === 2) {
      var sel = ranked()[0];
      var c = CARDS.filter(function (q) { return q.id === sel.id; })[0] || CARDS[1];
      return [{ cls: "grey", label: "Three offers, as data", wx: 966, wy: 420, dy: -24 },
              { cls: "ink",  label: "Top ranked",            wx: c.x + c.w / 2, wy: c.y + c.h, dy: 24 }];
    }
    return [{ cls: "grey",  label: "Performance, recorded", wx: 700,  wy: 806, dy: -24 },
            { cls: "alarm", label: "One missed",            wx: 1120, wy: 896, dy: 0 },
            { cls: "ink",   label: "Re-opened",             wx: 1506, wy: 752, dy: 0 }];
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
      /* A pin must be WHOLLY inside the viewport. */
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

  /* One polite live region for state changes that are not screen changes.
     The screen announcer (#announce) handles navigation; this handles
     everything else, so the two never overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 — the stated record and the grant
     ══════════════════════════════════════════════════════════════════════ */

  function paintPriorities() {
    var host = document.getElementById("prios");
    if (!host) { return; }
    host.innerHTML = PRIORITIES.map(function (p, i) {
      return '<div class="rec rec--set">' +
        '<p class="rec-top"><span class="rec-name">' + esc(p.name) + "</span>" +
        '<span class="rec-n">priority ' + (i + 1) + "</span></p>" +
        '<p class="rec-k">' + esc(p.k) + "</p>" +
        '<p class="rec-said">' + esc(p.said) + "</p></div>";
    }).join("");
  }

  var grantBtn = document.getElementById("grant");
  var grantBox = document.getElementById("grant-box");

  function paintGrant() {
    if (grantBox) { grantBox.dataset.on = granted ? "1" : "0"; }
    var tag = document.getElementById("grant-tag");
    var said = document.getElementById("grant-said");
    if (tag) {
      tag.textContent = granted ? "Granted" : "Not granted";
      tag.className = "tag " + (granted ? "tag--ok" : "tag--hold");
    }
    if (said) {
      said.textContent = granted
        ? "The assistant may buy and switch inside this boundary, and is told every time it does."
        : "The assistant may compare. It may not buy.";
    }
    /* The control is always labelled with what pressing it will do. */
    if (grantBtn) { grantBtn.textContent = granted ? "Revoke this permission" : "Grant this permission"; }
  }

  if (grantBtn) {
    grantBtn.addEventListener("click", function () {
      granted = !granted;
      paintGrant(); paintOffers(); paintBranch();
      say(granted
        ? "Permission granted. The assistant may buy and switch inside the boundary."
        : "Permission revoked. The assistant may compare but not buy.");
      refit();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 — the comparison, and the offer rendered as data
     ══════════════════════════════════════════════════════════════════════ */

  function docHTML(o) {
    var s = ['<p class="doc-head"><span class="doc-id">' + esc(o.ref) +
             '</span><span class="doc-meta">' + esc(o.meta) + "</span></p>"];
    o.doc.forEach(function (sec) {
      s.push('<div class="doc-sec"><p class="doc-h' +
             (sec.cls ? " doc-h--" + sec.cls : "") + '">' + esc(sec.h) + "</p><dl class=\"dl\">");
      sec.rows.forEach(function (r) {
        var cls = r.out ? " kv--out" : r.nul ? " kv--null" : "";
        var dd = (r.nul ? '<span class="nul">null</span>' : "") + esc(r.v) +
                 (r.rem ? '<span class="kv-rem">' + esc(r.rem) + "</span>" : "");
        s.push('<div class="kv' + cls + '"><dt>' + esc(r.k) + "</dt><dd>" + dd + "</dd></div>");
      });
      s.push("</dl></div>");
    });
    return s.join("");
  }

  function paintOffers() {
    var order = ranked(), top = order[0], low = cheapest();
    var cmp = document.getElementById("cmp");
    var doc = document.getElementById("doc");
    var rankName = document.getElementById("rank-name");
    var verdict = document.getElementById("verdict");

    if (rankName) { rankName.textContent = rankMode === "price" ? "price" : "stated priorities"; }
    document.getElementById("rank-prio").setAttribute("aria-pressed", rankMode === "priorities" ? "true" : "false");
    document.getElementById("rank-price").setAttribute("aria-pressed", rankMode === "price" ? "true" : "false");

    if (cmp) {
      cmp.innerHTML = order.map(function (o, i) {
        var f = fails(o);
        var tags = (i === 0 ? '<span class="tag tag--sel">Top ranked</span>' : "") +
          (f.length
            ? '<span class="tag tag--bad">Fails ' + f.length + " of 4</span>"
            : '<span class="tag tag--ok">Meets all four</span>');
        var marks = PRIORITIES.map(function (p) {
          var sc = o.scores[p.id];
          return '<span class="mark mark--' + (sc.ok ? "ok" : "bad") + '">' +
            '<span class="mark-g" aria-hidden="true">' + (sc.ok ? "✓" : "×") + "</span>" +
            "<span>" + esc(p.name) + "</span>" +
            '<span class="mark-v">' + esc(sc.v) + "</span></span>";
        }).join("");
        /* top-ranked AND failing is the price-sort state, and it has to look
           wrong, not selected */
        var cls = i === 0 ? (f.length ? "rec--miss" : "rec--sel") : (f.length ? "rec--out" : "");
        return '<div class="rec ' + cls + '">' +
          '<p class="rec-top"><span class="rec-name">' + esc(o.name) + "</span>" + tags +
          '<span class="rec-n">' + esc(o.price) + "</span></p>" +
          '<div class="marks">' + marks + "</div></div>";
      }).join("");
    }

    if (doc) { doc.innerHTML = docHTML(top); }

    if (verdict) {
      var gap = top.premium - low.premium;
      if (fails(top).length) {
        verdict.className = "verdict verdict--bad";
        verdict.innerHTML = "Ranked by price alone the assistant buys " + esc(top.name) +
          " and <span class=\"strong\">" + esc(top.why) + "</span>. " +
          "A failed priority is outside the permission at any price difference, so it does not act.";
      } else if (granted) {
        verdict.className = "verdict";
        verdict.innerHTML = "<span class=\"strong\">Buying " + esc(top.name) + ".</span> " +
          gap.toFixed(0) + ".00 USD above the cheapest offer, inside the " + DELTA +
          " USD limit you set. Bought without asking; you are told that it happened.";
      } else {
        verdict.className = "verdict verdict--bad";
        verdict.innerHTML = esc(top.name) + " is the choice on your priorities. " +
          "<span class=\"strong\">The assistant cannot buy it:</span> the permission has not been granted.";
      }
    }

    if (current === 2) {
      renderWorld({ focus: 2, sel: top.id });
      buildPins(2);
    }
    refit();
  }

  function setRank(mode, spoken) {
    rankMode = mode;
    paintOffers();
    say(spoken);
  }
  document.getElementById("rank-prio").addEventListener("click", function () {
    setRank("priorities", "Ranked by the four stated priorities. Meridian Mutual is top ranked.");
  });
  document.getElementById("rank-price").addEventListener("click", function () {
    setRank("price", "Ranked by price. Candlewick Direct is top ranked and fails two priorities.");
  });

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 — the performance ledger and the branch
     ══════════════════════════════════════════════════════════════════════ */

  function paintLedger() {
    var host = document.getElementById("led");
    if (!host) { return; }
    host.innerHTML = LEDGER.map(function (c) {
      var chks = c.checks.map(function (v) {
        return '<span class="chk' + (v ? "" : " chk--miss") + '" aria-hidden="true">' +
               (v ? "✓" : "×") + "</span>";
      }).join("");
      return '<div class="rec rec--' + c.cls + '">' +
        '<p class="rec-top"><span class="rec-name">' + esc(c.name) + "</span>" +
        '<span class="tag tag--' + (c.cls === "miss" ? "bad" : "ok") + '">' + esc(c.tag) + "</span></p>" +
        '<p class="rec-k">' + esc(c.k) + "</p>" +
        '<div class="chks">' + chks + '<span class="chks-l">' +
        c.checks.filter(function (v) { return v; }).length + " of " + c.checks.length +
        " met</span></div>" +
        '<p class="rec-said">' + esc(c.said) + "</p></div>";
    }).join("");
  }

  function paintBranch() {
    var tag = document.getElementById("branch-tag");
    var said = document.getElementById("branch-said");
    var go = document.getElementById("branch-go");
    if (!tag || !said || !go) { return; }
    if (granted) {
      tag.textContent = "Permitted";
      tag.className = "tag tag--ok";
      said.textContent = "The missed commitment re-opens the market. The assistant is re-tendering now and may switch without asking — inside the same four priorities and the same " +
        DELTA + " USD limit.";
      go.hidden = true;
    } else {
      tag.textContent = "Needs you";
      tag.className = "tag tag--hold";
      said.textContent = "The missed commitment re-opens the market. The assistant has a compliant alternative and cannot take it: the permission has not been granted.";
      go.hidden = false;
    }
    refit();
  }

  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function drawFor(n) {
    if (n === 2) { renderWorld({ focus: 2, sel: ranked()[0].id }); }
    else { renderWorld({ focus: n }); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim from resilience-grid/app.js.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  function anchorPlates() {
    Array.prototype.forEach.call(
      document.querySelectorAll(".screen > [style*='grid-area']"), function (el) {
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
       6.4px across every screen at 360, 390 and 430px wide. Below 900px the
       type holds its size and the screen scrolls. */
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

  var CTA = ["See the offer as data", "See what happens after", "Back to what the person sets"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();
  paintPriorities();
  paintGrant();
  paintLedger();
  paintBranch();
  paintOffers();

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

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
