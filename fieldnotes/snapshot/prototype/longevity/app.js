/*
 * Understanding Longevity — 2036 prototype
 * Rendering and interaction. No framework, no build, no external request.
 */
(function () {
  "use strict";

  var LG = window.LG;
  var H = LG.H;
  var $ = function (id) { return document.getElementById(id); };

  function money(n) { return "£" + Math.round(n).toLocaleString("en-GB"); }
  function money0(n) { return "£" + (Math.round(n / 100) * 100).toLocaleString("en-GB"); }
  function real(nominal, age) { return nominal / Math.pow(1 + H.inflation, age - H.robertAge); }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* =================================================== page 2 — position */

  var FIGURES = [
    {
      label: "Accessible savings", amount: money(H.savings), unit: "",
      src: "Four account feeds, aggregated", when: "reconciled 06:12 today"
    },
    {
      label: "Guaranteed income now", amount: money(H.stateMonthly + H.dbMonthly), unit: " a month",
      src: "State pension forecast and one scheme statement", when: "reconciled 14 March"
    },
    {
      label: "What they spend", amount: money(H.spendMonthly), unit: " a month",
      src: "24-month median of actual outgoings", when: "rolling, updated nightly"
    },
    {
      label: "Their floor", amount: money(H.floorMonthly), unit: " a month",
      src: "Set with the household, reviewed each April", when: "last changed April 2035"
    }
  ];

  function renderFigures(showSource) {
    var g = $("figGrid");
    g.innerHTML = "";
    FIGURES.forEach(function (f) {
      var d = el("div", "fig");
      d.appendChild(el("p", "lbl", f.label));
      d.appendChild(el("p", "amt", f.amount + (f.unit ? "<small>" + f.unit + "</small>" : "")));
      if (showSource) d.appendChild(el("p", "src", "<b>" + f.src + "</b>" + f.when));
      g.appendChild(d);
    });
  }

  /* ====================================================== page 3 — terms */

  var TERM_ROWS = [
    { key: "escalation", label: "Inflation", get: function (c) { return c.escalationLabel; } },
    { key: "access",     label: "Access",    get: function (c) { return c.accessLabel; } },
    { key: "survivor",   label: "Survivor",  get: function (c) { return c.survivorLabel; } },
    { key: "backing",    label: "Behind it", get: function (c) { return c.backingLabel; } }
  ];

  var openTerm = null;   // "id:key"
  var showRate = false;

  function renderTerms() {
    var t = $("termsTable");
    t.innerHTML = "";

    var head = el("div", "terms-row terms-head");
    head.appendChild(el("div", "rowlabel", "The choice"));
    LG.CONTRACTS.forEach(function (c) {
      head.appendChild(el("div", "cell",
        '<span class="ct-letter">' + c.letter + '</span><span class="ct-name">' + c.name + "</span>"));
    });
    t.appendChild(head);

    TERM_ROWS.forEach(function (row) {
      var r = el("div", "terms-row");
      r.appendChild(el("div", "rowlabel", row.label));
      LG.CONTRACTS.forEach(function (c) {
        var id = c.id + ":" + row.key;
        var b = el("button", "cell");
        b.type = "button";
        b.setAttribute("data-ct", c.letter + " · " + c.name);
        b.setAttribute("aria-expanded", openTerm === id ? "true" : "false");
        b.innerHTML = row.get(c) + '<span class="more">' +
          (openTerm === id ? "Reading" : "What it says") + "</span>";
        b.addEventListener("click", function () {
          openTerm = openTerm === id ? null : id;
          renderTerms();
          renderTermOut();
        });
        r.appendChild(b);
      });
      t.appendChild(r);
    });

    if (showRate) {
      var rr = el("div", "terms-row rate-row");
      rr.appendChild(el("div", "rowlabel", "Income"));
      LG.CONTRACTS.forEach(function (c) {
        var cell = el("div", "cell rate-cell",
          money(c.base) + " a month, from " + c.startAge +
          '<span class="real">' + money(real(c.base, c.startAge)) + " in today's money</span>");
        cell.setAttribute("data-ct", c.letter + " · " + c.name);
        rr.appendChild(cell);
      });
      t.appendChild(rr);
    }
  }

  function renderTermOut() {
    var out = $("termOut");
    out.innerHTML = "";
    if (!openTerm) return;
    var parts = openTerm.split(":");
    var c = LG.CONTRACTS.filter(function (x) { return x.id === parts[0]; })[0];
    var row = TERM_ROWS.filter(function (x) { return x.key === parts[1]; })[0];
    var box = el("div", "term-out");
    box.appendChild(el("p", "eyebrow",
      c.letter + " · " + c.name + " &nbsp;—&nbsp; " + row.label + ", what the contract says"));
    box.appendChild(el("p", null, c.terms[parts[1]]));
    out.appendChild(box);
  }

  /* ====================================================== page 4 — lives */

  var STATE_WORD = {
    covered: "Spending met in full",
    floor: "Floor met, nothing spare",
    short: "Floor not met",
    gone: "After both deaths"
  };

  var currentLife = 0;

  function renderLifePicker() {
    var p = $("lifePicker");
    p.innerHTML = "";
    LG.LIVES.forEach(function (life, i) {
      var b = el("button", "choice",
        "<b>" + life.label + "</b><span>" + life.sub + "</span>");
      b.type = "button";
      b.setAttribute("aria-pressed", i === currentLife ? "true" : "false");
      b.addEventListener("click", function () { currentLife = i; renderLives(); });
      p.appendChild(b);
    });
  }

  function trackFor(sim) {
    var t = el("div", "track");
    sim.rows.forEach(function (r) {
      var c = el("div", "cellyr s-" + r.state);
      c.title = "Age " + r.age + " — " + STATE_WORD[r.state];
      t.appendChild(c);
    });
    return t;
  }

  function summaryFor(sim) {
    var cls, text;
    if (sim.shortYears > 0) { cls = "bad"; text = "Floor missed from " + sim.firstShort; }
    else if (sim.floorOnlyYears > 0) { cls = "warn"; text = "Floor met, " + sim.floorOnlyYears + " lean year" + (sim.floorOnlyYears > 1 ? "s" : ""); }
    else { cls = "ok"; text = "Spending met in full"; }
    return '<b class="' + cls + '">' + text + "</b>" +
      "<span>" + money0(sim.totalPaid) + " paid</span>";
  }

  function renderLives() {
    renderLifePicker();
    var life = LG.LIVES[currentLife];
    var box = $("tracks");
    box.innerHTML = "";

    LG.CONTRACTS.forEach(function (c) {
      var sim = LG.simulate(c, life);
      var r = el("div", "track-row");
      r.appendChild(el("div", "track-name",
        "<b>" + c.letter + " · " + c.name + "</b><span>" + c.escalationLabel + " · " + c.survivorLabel + "</span>"));
      r.appendChild(trackFor(sim));
      r.appendChild(el("div", "track-sum", summaryFor(sim)));
      box.appendChild(r);
    });

    var none = LG.simulate(null, life);
    var nr = el("div", "track-row");
    nr.appendChild(el("div", "track-name",
      "<b>No contract</b><span>the " + money(H.premium) + " stays accessible</span>"));
    nr.appendChild(trackFor(none));
    nr.appendChild(el("div", "track-sum", summaryFor(none)));
    box.appendChild(nr);

    $("lifeNote").textContent = life.note;
  }

  function renderLegend() {
    var l = $("legend");
    l.innerHTML = "";
    [["s-covered", STATE_WORD.covered], ["s-floor", STATE_WORD.floor],
     ["s-short", STATE_WORD.short], ["s-gone", STATE_WORD.gone]].forEach(function (p) {
      var s = el("span", null, '<i class="swatch ' + p[0] + '" aria-hidden="true"></i>' + p[1]);
      l.appendChild(s);
    });
  }

  /* ===================================================== page 5 — bridge */

  var startAge = 80;
  var stress = 0;               // index into STRESSES
  var STRESSES = [
    { label: "A long life", sub: "Robert to 96, Ada to 99", life: LG.LIVES[0] },
    { label: "Care from 84", sub: "Robert to 91, Ada to 95", life: LG.LIVES[3] }
  ];

  var BRIDGE_SHAPE = { id: "level", letter: "A", name: "Level, single life",
                       startAge: 80, base: 2425, escalation: { kind: "none" } };

  function renderStressPicker() {
    var p = $("stressPicker");
    p.innerHTML = "";
    STRESSES.forEach(function (s, i) {
      var b = el("button", "choice", "<b>" + s.label + "</b><span>" + s.sub + "</span>");
      b.type = "button";
      b.setAttribute("aria-pressed", i === stress ? "true" : "false");
      b.addEventListener("click", function () { stress = i; renderBridge(); });
      p.appendChild(b);
    });
  }

  function renderBridge() {
    renderStressPicker();
    var life = STRESSES[stress].life;
    var sim = LG.simulate(BRIDGE_SHAPE, life, { startAge: startAge });
    var income = LG.deferredBase(startAge);
    var atStart = sim.rows.filter(function (r) { return r.age === startAge; })[0];
    var potAtStart = atStart ? atStart.pot : 0;
    var accessible = H.savings - H.premium;

    $("startVal").textContent = startAge;
    $("startSlider").setAttribute("aria-valuetext", "Age " + startAge);

    var ro = $("bridgeReadouts");
    ro.innerHTML = "";
    [
      ["Bridge", (startAge - H.robertAge) + " years", "71 to " + startAge + ", savings alone"],
      ["First payment", money(income), "a month, when it starts"],
      ["In today's money", money(real(income, startAge)), "at 2.6% assumed inflation"],
      ["Savings when it lands", money0(potAtStart),
        "of " + money(accessible) + " left after the premium", potAtStart <= 0]
    ].forEach(function (r) {
      var d = el("div", "readout");
      d.appendChild(el("p", "lbl", r[0]));
      d.appendChild(el("p", "val" + (r[3] ? " warnv" : ""), r[1]));
      d.appendChild(el("p", "sub", r[2]));
      ro.appendChild(d);
    });

    var v;
    if (sim.potDry === null) {
      v = "Savings last the whole horizon in this case, and " +
        money0(accessible - potAtStart) + " of the " + money(accessible) +
        " left after the premium has already gone into the bridge by the time the first payment lands.";
    } else if (sim.potDry < startAge) {
      v = "Savings run out at " + sim.potDry + ", " + (startAge - sim.potDry) +
        " year" + (startAge - sim.potDry > 1 ? "s" : "") +
        " before the first payment arrives, so the contract cannot reach back and cover the gap that emptied them.";
    } else {
      v = "Savings run out at " + sim.potDry + " and the floor then goes unmet in " +
        sim.shortYears + " of the remaining years, because the payment arriving at " +
        startAge + " is not large enough to carry the household on its own.";
    }
    $("bridgeVerdict").textContent = v;

    drawBridgeChart(sim, life);
  }

  function drawBridgeChart(sim, life) {
    var W = 620, Ht = 258, ml = 54, mr = 14, mt = 16, mb = 30;
    var iw = W - ml - mr, ih = Ht - mt - mb;
    var a0 = H.robertAge, a1 = H.horizon;
    var lastAlive = Math.max(life.robertDeath, a0 + (life.adaDeath - H.adaAge));
    lastAlive = Math.min(lastAlive, a1);

    var pts = sim.rows.filter(function (r) { return r.age <= lastAlive; });
    var maxPot = Math.max.apply(null, pts.map(function (r) { return r.pot; }).concat([H.savings - H.premium]));
    maxPot = Math.ceil(maxPot / 50000) * 50000;

    function X(age) { return ml + (age - a0) / (a1 - a0) * iw; }
    function Y(p) { return mt + ih - (p / maxPot) * ih; }

    var d = "M " + X(a0) + " " + Y(H.savings - H.premium);
    pts.forEach(function (r) { d += " L " + X(r.age) + " " + Y(r.pot); });
    var area = d + " L " + X(pts[pts.length - 1].age) + " " + Y(0) + " L " + X(a0) + " " + Y(0) + " Z";

    var s = [];
    s.push('<svg viewBox="0 0 ' + W + " " + Ht + '" role="img" aria-label="Accessible savings from age 71, with the bridge to the first payment at ' + startAge + ' shaded.">');

    /* the bridge band */
    s.push('<rect x="' + X(a0) + '" y="' + mt + '" width="' + (X(startAge) - X(a0)) + '" height="' + ih + '" fill="#EBE5DA"/>');
    s.push('<text x="' + (X(a0) + 6) + '" y="' + (mt + 14) + '" font-family="Arial" font-size="10" font-weight="700" letter-spacing="1.3" fill="#61533D">THE BRIDGE</text>');

    /* savings area */
    s.push('<path d="' + area + '" fill="#61533D" fill-opacity="0.13"/>');
    s.push('<path d="' + d + '" fill="none" stroke="#61533D" stroke-width="2" stroke-linejoin="round"/>');

    /* baseline + axes */
    s.push('<line x1="' + ml + '" y1="' + Y(0) + '" x2="' + (W - mr) + '" y2="' + Y(0) + '" stroke="#C6BBA6"/>');
    [0, maxPot].forEach(function (p) {
      s.push('<text x="' + (ml - 8) + '" y="' + (Y(p) + 4) + '" text-anchor="end" font-family="Arial" font-size="11" fill="#61533D">' +
        (p === 0 ? "£0" : "£" + (p / 1000) + "k") + "</text>");
    });
    [71, 80, 90, 100].forEach(function (age) {
      s.push('<text x="' + X(age) + '" y="' + (Ht - 10) + '" text-anchor="middle" font-family="Arial" font-size="11" fill="#61533D">' + age + "</text>");
    });

    /* first payment marker */
    s.push('<line x1="' + X(startAge) + '" y1="' + mt + '" x2="' + X(startAge) + '" y2="' + Y(0) + '" stroke="#61533D" stroke-width="1.5" stroke-dasharray="4 3"/>');
    var lx = X(startAge) + 7, anchor = "start";
    if (lx > W - 150) { lx = X(startAge) - 7; anchor = "end"; }
    s.push('<text x="' + lx + '" y="' + (mt + 32) + '" text-anchor="' + anchor + '" font-family="Arial" font-size="11.5" font-weight="700" fill="#61533D">First payment, ' + startAge + "</text>");

    /* savings exhausted */
    if (sim.potDry !== null && sim.potDry <= lastAlive) {
      s.push('<circle cx="' + X(sim.potDry) + '" cy="' + Y(0) + '" r="4.5" fill="#B02B1B"/>');
      var dx = X(sim.potDry) + 9, da = "start";
      /* Keep it clear of the first-payment rule, which is often right beside it. */
      if (dx > W - 130 || X(startAge) - X(sim.potDry) < 96) { dx = X(sim.potDry) - 9; da = "end"; }
      s.push('<text x="' + dx + '" y="' + (Y(0) - 14) + '" text-anchor="' + da + '" font-family="Arial" font-size="11.5" font-weight="700" fill="#B02B1B">Savings out, ' + sim.potDry + "</text>");
    }

    s.push("</svg>");
    $("bridgeChart").innerHTML = s.join("");
  }

  /* ==================================================== page 6 — undoing */

  var COMMUTABLE = Math.round(H.premium * 0.4);
  var TL_MAX = 228;   // 19 years, in months

  /* A piecewise scale. Everything that can be undone happens in the first
     three years, so those three years take half the width; the tick labels
     say so, which is why the compression is not a trick. */
  function tlPos(m) {
    if (m <= 1) return m * 0.12;
    if (m <= 36) return 0.12 + (m - 1) / 35 * 0.38;
    return 0.50 + (m - 36) / (TL_MAX - 36) * 0.50;
  }
  function tlMonths(p) {
    if (p <= 0.12) return p / 0.12;
    if (p <= 0.50) return 1 + (p - 0.12) / 0.38 * 35;
    return 36 + (p - 0.50) / 0.50 * (TL_MAX - 36);
  }
  function pct(m) { return (tlPos(m) * 100).toFixed(3) + "%"; }

  var months = tlMonths(0.30);

  function monthLabel(m) {
    if (m < 0.03) return "day 0";
    if (m <= 1) return "day " + Math.round(m * 30);
    var y = Math.floor(m / 12), r = Math.round(m % 12);
    if (y === 0) return Math.round(m) + " months";
    if (r === 12) { y += 1; r = 0; }
    return "year " + y + (r ? " + " + r + (r > 1 ? " months" : " month") : "");
  }

  function renderTimeline() {
    var ticks = $("tlTicks");
    if (!ticks.childNodes.length) {
      [[0, "Day 0", "narrow-hide"], [1, "Day 30", ""], [12, "Year 1", ""],
       [36, "Year 3", ""], [120, "Year 10", "narrow-hide"], [228, "Year 19", ""]]
        .forEach(function (t) {
          var s = document.createElement("span");
          s.style.left = pct(t[0]);
          if (t[2]) s.className = t[2];
          s.textContent = t[1];
          ticks.appendChild(s);
        });

      var names = $("tlNames"), bars = $("tlBars");
      LG.CONTRACTS.forEach(function (c) {
        names.appendChild(el("div", null, c.letter + "<span>&nbsp;· " + c.name + "</span>"));
        var bar = el("div", "tl-bar");
        bar.appendChild(el("span", "seg seg-open")).style.width = pct(1);
        if (c.id === "joint") {
          var part = bar.appendChild(el("span", "seg seg-part"));
          part.style.width = (tlPos(36) - tlPos(1)) * 100 + "%";
          bar.appendChild(el("span", "seg seg-fixed")).style.width = (1 - tlPos(36)) * 100 + "%";
        } else {
          bar.appendChild(el("span", "seg seg-fixed")).style.width = (1 - tlPos(1)) * 100 + "%";
        }
        var begin = el("i", "tl-begin");
        begin.style.left = pct((c.startAge - H.robertAge) * 12);
        begin.title = "Payments begin at " + c.startAge;
        bar.appendChild(begin);
        bars.appendChild(bar);
      });

      var mark = el("i", "tl-marker");
      mark.id = "tlMarker";
      bars.appendChild(mark);

      var lg = $("undoLegend");
      [["seg-open", "Reversible in full"], ["seg-part", "Partly reversible"],
       ["seg-fixed", "Fixed"], ["tl-begin-key", "Payments begin"]].forEach(function (p) {
        lg.appendChild(el("span", null,
          '<i class="swatch ' + p[0] + '" aria-hidden="true"></i>' + p[1]));
      });
    }
    $("tlMarker").style.left = pct(months);
  }

  function renderUndo() {
    renderTimeline();
    $("timeVal").textContent = monthLabel(months);
    $("timeSlider").setAttribute("aria-valuetext", monthLabel(months) + " after the money moves");
    var age = H.robertAge + months / 12;

    var g = $("undoGrid");
    g.innerHTML = "";

    LG.CONTRACTS.forEach(function (c) {
      var status, cls, glyph, frags;

      if (months <= 1) {
        status = "Reversible"; cls = "st-open"; glyph = "↺";
        frags = ["Cancel in full — " + money(H.premium) + " returned, no charge",
                 "The thirty-day window, and the last moment any of this is free"];
      } else if (c.id === "joint" && months <= 36) {
        var chg = months <= 12 ? 0.09 : (months <= 24 ? 0.06 : 0.03);
        status = "Partly reversible"; cls = "st-part"; glyph = "◐";
        frags = ["Up to " + money(COMMUTABLE) + " back — " + Math.round(chg * 100) +
                   "% charge, " + money(COMMUTABLE * chg),
                 "The remaining " + money(H.premium - COMMUTABLE) + " is fixed, and the charge falls each year to nil at year 3"];
      } else {
        status = "Fixed"; cls = "st-fixed"; glyph = "●";
        if (age < c.startAge) {
          var extra = c.id === "joint"
            ? "Death before " + c.startAge + " still starts 60% to Ada at " + c.startAge
            : "Death before " + c.startAge + " pays nothing to anyone, and returns nothing";
          frags = ["Nothing to take back — no withdrawal, transfer or surrender, at any price", extra];
        } else {
          var after = c.id === "level"
            ? "Payments have begun and stop on death, with nothing to Ada"
            : c.id === "escalating"
              ? "Payments have begun, guaranteed to " + (c.startAge + c.guaranteeYears) + " for Ada or the estate"
              : "Payments have begun, and 60% continues to Ada for her life";
          frags = ["Nothing to take back — the capital is the insurer's", after];
        }
      }

      var card = el("div", "undo-card");
      card.appendChild(el("p", "ct", c.letter + " · " + c.name));
      card.appendChild(el("p", "status " + cls,
        '<span class="glyph" aria-hidden="true">' + glyph + "</span>" + status));
      frags.forEach(function (f) { card.appendChild(el("p", "frag", f)); });
      g.appendChild(card);
    });
  }

  /* ========================================================== navigation */

  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var current = 1;

  function go(n) {
    n = Math.max(1, Math.min(pages.length, n));
    current = n;
    pages.forEach(function (p, i) { p.hidden = (i + 1) !== n; });
    $("headCount").textContent = String(n).padStart(2, "0") + " / " + String(pages.length).padStart(2, "0");
    $("prevBtn").disabled = n === 1;
    $("nextBtn").disabled = n === pages.length;
    $("pagePicker").value = String(n);
    $("stage").scrollTop = 0;
    var h = pages[n - 1].querySelector("h1, h2");
    $("announce").textContent = "Page " + n + " of " + pages.length + ". " + (h ? h.textContent : "");
    if (location.hash !== "#" + n) history.replaceState(null, "", "#" + n);
  }

  function buildPicker() {
    var sel = $("pagePicker");
    pages.forEach(function (p, i) {
      var o = document.createElement("option");
      o.value = String(i + 1);
      o.textContent = (i + 1) + " of " + pages.length + " · " + p.dataset.title;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { go(parseInt(sel.value, 10)); });
  }

  /* =============================================================== start */

  function init() {
    buildPicker();
    renderFigures(false);
    renderTerms();
    renderLegend();
    renderLives();
    renderBridge();
    renderUndo();

    $("srcToggle").addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", on ? "true" : "false");
      this.textContent = on ? "Hide the sources" : "Show where each figure comes from";
      $("srcNote").hidden = !on;
      renderFigures(on);
    });

    $("rateToggle").addEventListener("click", function () {
      showRate = !showRate;
      this.setAttribute("aria-pressed", showRate ? "true" : "false");
      this.textContent = showRate ? "Hide the headline rate" : "Show the headline rate";
      renderTerms();
    });

    $("startSlider").addEventListener("input", function () {
      startAge = parseInt(this.value, 10);
      renderBridge();
    });

    $("timeSlider").addEventListener("input", function () {
      months = tlMonths(parseInt(this.value, 10) / 1000);
      renderUndo();
    });

    $("handToggle").addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", on ? "true" : "false");
      $("handList").hidden = !on;
    });

    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { go(parseInt(b.dataset.go, 10)); });
    });
    $("prevBtn").addEventListener("click", function () { go(current - 1); });
    $("nextBtn").addEventListener("click", function () { go(current + 1); });

    document.addEventListener("keydown", function (e) {
      if (e.target.matches("input, select, textarea")) return;
      if (e.key === "ArrowRight") { go(current + 1); }
      else if (e.key === "ArrowLeft") { go(current - 1); }
    });

    window.addEventListener("hashchange", function () {
      var n = parseInt((location.hash || "").slice(1), 10);
      if (!isNaN(n) && n !== current) go(n);
    });

    var fromHash = parseInt((location.hash || "").slice(1), 10);
    go(isNaN(fromHash) ? 1 : fromHash);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else { init(); }
})();
