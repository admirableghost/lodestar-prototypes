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
      /* the same facts as numbers, so screen 3 can show the arithmetic
         rather than restate it: promised and observed are working days
         counted from AGREED LIABILITY; the remedy is per day late */
      key: "settlement.days", promised: 5, observed: 9, perDay: 50,
      onClaim: "the third claim",
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

  /* ══════════════════════════════════════════════════════════════════════
     ONE SOURCE OF TRUTH

     Every screen reads this table. Eligibility is a HARD filter drawn from
     the customer's own standing instructions, so an offer that breaks one is
     never bought however cheap it is — which is the whole argument. The
     preference then only decides WHICH TERM is shown and why the eligible
     offer won; it never overrides eligibility.

     Nothing is scored. Where an offer publishes no commitment, that absence
     is shown as an absence and never treated as a zero or a promise.
     ══════════════════════════════════════════════════════════════════════ */

  var OC = [
    { id: "meridian", name: "Meridian Mutual", price: "1,340.00", num: 1340,
      excess: "450.00 USD", excessNum: 450, driver: "Every named driver, no age condition",
      settle: "5 working days, remedy 50.00 USD per day late", settlePublished: true, settleDays: 5,
      /* exclusions that reach HER household: the count "fewest exclusions" ranks on */
      hits: 0,
      /* the one term each preference turns on, three words or fewer. This is
         what the glass shows; the long forms above stay for the notes. */
      term: { price: "1,340 USD", excl: "No age condition", settle: "5 working days" },
      eligible: true, bar: null, verdict: "Chosen",
      why: { price:  "the lowest price she can actually buy",
             excl:   "no exclusion that reaches her household",
             settle: "the only published settlement time with a remedy behind it" } },
    { id: "candlewick", name: "Candlewick Direct", price: "1,185.00", num: 1185,
      excess: "500.00 USD", excessNum: 500, driver: "Drivers under 25 excluded",
      settle: "No settlement time published", settlePublished: false, settleDays: null,
      hits: 1,
      term: { price: "1,185 USD", excl: "Under 25 excluded", settle: "None published" },
      eligible: false, bar: "Rosa is nineteen, so this excludes a driver she told the agent to keep.",
      barShort: "excludes drivers under 25 — Rosa is nineteen", verdict: "Excludes Rosa" },
    { id: "pell", name: "Pell & Roe", longName: "Pell & Roe Assurance", price: "1,420.00", num: 1420,
      excess: "900.00 USD", excessNum: 900, driver: "Every named driver",
      settle: "10 working days", settlePublished: true, settleDays: 10,
      hits: 0,
      term: { price: "1,420 USD", excl: "No age condition", settle: "10 working days" },
      eligible: false, bar: "The excess is 900 USD, twice the 500 she capped.",
      barShort: "excess 900 USD, twice her 500 cap", verdict: "Excess 900" }
  ];

  /* How each preference ORDERS the three. Ordering is presentation; it never
     touches eligibility, so the bought offer is the same in every order. */
  var RANK = {
    price:  function (a, b) { return a.num - b.num; },
    excl:   function (a, b) { return (a.hits - b.hits) || (a.num - b.num); },
    settle: function (a, b) {
      var da = a.settleDays == null ? Infinity : a.settleDays,
          db = b.settleDays == null ? Infinity : b.settleDays;
      return (da - db) || (a.num - b.num);
    }
  };
  var PREF_SAID = { price: "price", excl: "fewest exclusions", settle: "fastest settlement" };

  /* The preference chosen on screen 2 is the one screen 3 reads, and it
     survives a reload. A browser that refuses storage simply starts on price. */
  var pref = "price";
  try { if (RANK[sessionStorage.getItem("oc-pref")]) { pref = sessionStorage.getItem("oc-pref"); } } catch (e) { /* private mode */ }

  function bought() {
    /* the cheapest ELIGIBLE offer; eligibility is never traded away */
    return OC.filter(function (o) { return o.eligible; })
             .reduce(function (a, b) { return a.num <= b.num ? a : b; });
  }

  /* ── screen 1: the offer object, from the same row screens 2 and 3 use ──
     Five terms and nothing else: the insurer, the price, the excess, who is
     covered, the settlement promise. The full published document (perils,
     exclusions, the other commitments, the remedy figure) stays in OFFERS. */
  function paintOffer() {
    var host = document.getElementById("offer");
    if (!host) { return; }
    var o = bought();
    host.innerHTML =
      '<svg class="offer-sheet" viewBox="0 0 320 22" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
        '<rect x="0" y="4" width="92" height="4" rx="2" fill="#16150F" opacity=".55"/>' +
        '<rect x="104" y="4" width="150" height="4" rx="2" fill="#16150F" opacity=".22"/>' +
        '<rect x="0" y="15" width="60" height="4" rx="2" fill="#16150F" opacity=".22"/>' +
        '<rect x="104" y="15" width="200" height="4" rx="2" fill="#16150F" opacity=".22"/>' +
      "</svg>" +
      '<p class="offer-co">' + esc(o.name) + "</p>" +
      '<p class="offer-price"><span class="offer-n">' + grp(o.num) + '</span><span class="offer-u">USD a year</span></p>' +
      '<ul class="offer-terms">' +
        "<li>Excess " + o.excessNum + " USD</li>" +
        "<li>Named drivers covered</li>" +
        '<li class="is-promise">Settlement ' + o.settleDays + " working days</li>" +
      "</ul>";
  }

  /* ── screen 2: three offers, ONE term each, and a verdict word ───────── */
  function paintCompare() {
    var host = document.getElementById("cmp");
    if (!host) { return; }
    var win = bought();
    host.innerHTML = OC.slice().sort(RANK[pref]).map(function (o) {
      var unp = (pref === "settle" && !o.settlePublished);
      return '<div class="of" data-win="' + (o === win ? "1" : "0") +
             '" data-ok="' + (o.eligible ? "1" : "0") + '">' +
             '<p class="of-co">' + esc(o.name) + "</p>" +
             '<p class="of-v' + (unp ? " of-v--none" : "") + '">' + esc(o.term[pref]) + "</p>" +
             '<p class="of-t' + (o.eligible ? "" : " of-t--no") + '">' +
               '<span class="sr-only">' + (o === win ? "Bought: " : (o.eligible ? "Eligible" : "Cannot be bought: ")) + "</span>" +
               esc(o === win ? o.verdict : (o.eligible ? "" : o.verdict)) +
               (o.eligible ? "" : '<span class="sr-only"> — ' + esc(o.bar) + "</span>") +
             "</p>" +
             "</div>";
    }).join("");

    Array.prototype.forEach.call(document.querySelectorAll("[data-pref]"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.pref === pref));
    });
    paintPerformance();
    say("Ranked on " + PREF_SAID[pref] + ". The agent buys " + win.name + ".");
  }

  /* ── screen 3 reads the SAME table, for whichever offer was bought ───
     ONE calculation: promised (counted from agreed liability) → observed →
     the remedy, which is a published term and applied on the miss with no
     separate claim. Painted from three places in the model and nowhere
     else: the offer bought() returns, that offer's own published settlement
     row in OFFERS, and the one missed entry in LEDGER. The arithmetic is
     done here, in code, from those numbers. */
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  function paintPerformance() {
    var o = bought();
    var full = OFFERS.filter(function (x) { return x.id === o.id; })[0] || null;
    var miss = LEDGER.filter(function (l) { return l.cls === "miss" && l.key; })[0] || null;

    /* the published row the commitment is lifted from */
    var row = null;
    if (full && miss) {
      full.doc.forEach(function (sec) {
        sec.rows.forEach(function (r) { if (r.k === miss.key) { row = r; } });
      });
    }
    var live = !!(row && o.settlePublished);

    var id = document.getElementById("oc3-id");
    if (id) {
      id.innerHTML = '<span class="sr-only">Holding </span><b>' + esc(o.name) + "</b>";
    }

    var promised = miss ? miss.promised : null,
        observed = miss ? miss.observed : null,
        perDay   = miss ? miss.perDay   : null,
        late     = (promised != null && observed != null) ? Math.max(0, observed - promised) : null,
        remedy   = (late != null && perDay != null) ? late * perDay : null;

    var calc = document.getElementById("oc3-calc");
    if (calc && live && miss && remedy != null) {
      /* the clock, as cells: the promised days in ledger blue, the late days
         hatched in plum. No numbers in the cells; the figures sit under them. */
      var cells = [], i, n = observed;
      for (i = 1; i <= n; i++) {
        var lateCell = i > promised, x = (i - 1) * 100 + 6;
        cells.push('<rect x="' + x + '" y="14" width="88" height="72" rx="3" fill="' +
          (lateCell ? "url(#oc3-hatch)" : "rgba(47,94,124,.16)") + '" stroke="' +
          (lateCell ? "#8A3450" : "#2F5E7C") + '" stroke-width="' + (lateCell ? 2.4 : 2) +
          '" vector-effect="non-scaling-stroke"/>');
      }
      var strip =
        '<svg class="calc-strip" viewBox="0 0 ' + (n * 100) + ' 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
          '<line x1="2" y1="2" x2="2" y2="98" stroke="#16150F" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
          '<path d="M6 8 V2 H' + (promised * 100 - 6) + ' V8" fill="none" stroke="#2F5E7C" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
          '<path d="M' + (promised * 100 + 6) + ' 8 V2 H' + (n * 100 - 6) + ' V8" fill="none" stroke="#8A3450" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
          cells.join("") +
        "</svg>";
      var arrow =
        '<svg class="calc-link" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
          '<path d="M4 24 H36" fill="none" stroke="#8A3450" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M30 14 L42 24 L30 34" fill="none" stroke="#8A3450" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg>";
      calc.innerHTML =
        '<div class="calc-days" style="--n:' + n + ';--p:' + promised + '">' + strip + "</div>" +
        '<div class="calc-step calc-step--p">' +
          '<p class="calc-n">' + promised + "</p>" +
          '<p class="calc-w">working days promised</p>' +
          '<p class="calc-s">from agreed liability</p>' +
        "</div>" +
        arrow +
        '<div class="calc-step calc-step--o">' +
          '<p class="calc-n">' + observed + "</p>" +
          '<p class="calc-w">observed</p>' +
          '<p class="calc-s">' + late + " late × " + perDay + " USD</p>" +
        "</div>" +
        arrow +
        '<div class="calc-step calc-step--r">' +
          '<p class="calc-n"><span class="calc-big">' + grp(remedy) + '</span><span class="calc-u">USD</span></p>' +
          '<p class="calc-w">applied automatically, no claim</p>' +
        "</div>";
    } else if (calc) {
      /* no published settlement time means nothing to check and nothing
         owed. Unreachable with the current model, where bought() is the one
         offer with a published commitment; kept so the screen never lies. */
      calc.innerHTML = '<div class="calc-step calc-step--o"><p class="calc-w">No settlement time published.</p></div>';
    }

    /* honest ending: a breach re-opens the agent's permission to shop, not
       the customer's instructions. Whether any other offer clears them is
       computed from the same table screen 2 reads. */
    var foot = document.getElementById("oc3-foot");
    if (foot) {
      var others = OC.filter(function (x) { return x !== o; });
      var clears = others.filter(function (x) { return x.eligible; });
      foot.innerHTML = '<p class="oc3-end">' +
        (clears.length
          ? "Eligible replacement: " + esc(clears[0].name) + "."
          : "No eligible replacement. Existing cover retained.") +
        "</p>";
    }
    reserveNav();
  }

  /* the navigation corner stays clear of the foot: measure the chrome once
     per layout rather than guessing its width */
  function reserveNav() {
    var bar = document.querySelector(".chrome-r");
    if (!bar) { return; }
    var w = Math.ceil(bar.getBoundingClientRect().width + 28) + "px";
    Array.prototype.forEach.call(document.querySelectorAll(".screen.oc"), function (sc) {
      sc.style.setProperty("--oc3-nav", w);
    });
  }
  window.addEventListener("resize", reserveNav);

  Array.prototype.forEach.call(document.querySelectorAll("[data-pref]"), function (b) {
    b.addEventListener("click", function () {
      pref = b.dataset.pref;
      try { sessionStorage.setItem("oc-pref", pref); } catch (e) { /* private mode */ }
      paintCompare();
      refit();
    });
  });
  paintOffer();
  paintCompare();

  /* Restored: the world palette and its frame sat inside the state block the
     recomposition replaced, and renderWorld below is still its consumer. */
  var W = 1600, H = 1000;

  var INK     = "#44415C",
      PAPER   = "#FBF9F1",
      RULE    = "#8A959C",
      HAIR    = "#DCDDD8",
      CARRIER = "#2F5E7C",
      UTILITY = "#5B4E7A",
      PUBLIC  = "#2F5A44",
      ALARM   = "#A33322";

  /* Restored with the palette: the world's three record geometries. */
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
    /* the return. Heavier, in the ink, because it is the argument: the
       market re-opens on a missed commitment rather than on a date. */

    /* The drawn documents and the ledger belonged to the old composition and
       collided with the fields that replaced them. The structured offer is
       now the content, so the ground is the ruled sheet it sits on and
       nothing more. */

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

  function pinSet() { return []; }

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
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function drawFor(n) {
    renderWorld({ focus: n });
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim from resilience-grid/app.js.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this.
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

  var CTA = ["Let the agent choose", "See it hold the promise", "Back to what the person sets"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();

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
    /* the chrome's width changes with the picker's and the CTA's labels, so
       screen 3's foot measures it on every screen change */
    reserveNav();
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
