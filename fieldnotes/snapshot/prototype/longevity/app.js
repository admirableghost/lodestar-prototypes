/*
 * Understanding Longevity — 2036 prototype
 * Rendering and interaction. No framework, no build, no external request.
 *
 * Every number on every screen comes out of model.js. Nothing is typed
 * twice, so the screens agree with each other because one simulation drives
 * them rather than because someone copied a figure across.
 */
(function () {
  "use strict";

  var LG = window.LG;
  var H = LG.H;
  var $ = function (id) { return document.getElementById(id); };
  var narrow = function () { return window.matchMedia("(max-width: 860px)").matches; };

  function money(n) { return "£" + Math.round(n).toLocaleString("en-GB"); }
  function money0(n) { return "£" + (Math.round(n / 100) * 100).toLocaleString("en-GB"); }
  function real(nominal, age) { return nominal / Math.pow(1 + H.inflation, age - H.robertAge); }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* The one horizontal scale every diagram on screens 4 and 6 shares. */
  var A0 = H.robertAge, A1 = H.horizon, SPAN = A1 - A0 + 1;
  function agePct(age) { return Math.max(0, Math.min(1, (age - A0) / SPAN)) * 100; }

  /* =================================================== screen 2 — position */

  var FIGURES = [
    { label: "Accessible savings", amount: money(H.savings), unit: "",
      src: "Four account feeds, aggregated", when: "reconciled 06:12 today" },
    { label: "Guaranteed income now", amount: money(H.stateMonthly + H.dbMonthly), unit: " a month",
      src: "State pension forecast and one scheme statement", when: "reconciled 14 March" },
    { label: "What their month costs", amount: money(H.spendMonthly), unit: " a month",
      src: "24-month median of actual outgoings", when: "rolling, updated nightly" },
    { label: "Their floor", amount: money(H.floorMonthly), unit: " a month",
      src: "Set with Robert and Ada, reviewed each April", when: "last changed April 2035" }
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

  /* ====================================================== screen 3 — terms */

  var TERM_ROWS = [
    { key: "escalation", label: "What inflation does", sub: "", short: "Inflation",
      get: function (c) { return c.escalationLabel; } },
    { key: "access", label: "What access is left", sub: "", short: "Access",
      get: function (c) { return c.accessLabel; } },
    { key: "survivor", label: "What happens to Ada", sub: "", short: "Ada",
      get: function (c) { return c.survivorLabel; } },
    { key: "backing", label: "Who is behind it", sub: "", short: "Behind it",
      get: function (c) { return c.backingLabel; } }
  ];

  var openTerm = null;   // "id:key"
  var showRate = false;
  /* Phone only: which contract's block is open. Stacking all three in full
     ran 413px past the bottom of a 390x844 window, and nothing on screen
     said the rest was down there. */
  var openContract = LG.CONTRACTS[0].id;

  /* A portrait identifies; it never captions. The names beside these are
     invented and the subjects are stand-ins — see assets/PROVENANCE.md. */
  function faceEl(who) {
    var i = el("i", "face face-" + who);
    i.setAttribute("aria-hidden", "true");
    return i;
  }

  function corner() {
    var c = el("div", "terms-cell terms-corner");
    c.appendChild(el("p", "eyebrow", "02 &middot; The terms"));
    var h = el("h2", "head tight", "The rate is the last row.");
    h.id = "h-3";
    c.appendChild(h);
    c.appendChild(el("p", "body-copy", "Open a cell to read it."));
    var b = el("button", "ghost", showRate ? "Hide the headline rate" : "Show the headline rate");
    b.type = "button";
    b.id = "rateToggle";
    b.style.marginTop = "12px";
    b.style.alignSelf = "flex-start";
    b.setAttribute("aria-pressed", showRate ? "true" : "false");
    b.addEventListener("click", function () {
      showRate = !showRate;
      if (showRate) { openTerm = null; renderTermOut(); }
      renderTerms();
    });
    c.appendChild(b);
    return c;
  }

  function headCell(c) {
    var d = el("div", "terms-cell terms-head");
    d.appendChild(el("span", "ct-letter", c.letter));
    d.appendChild(el("span", "ct-name", c.name));
    return d;
  }

  /* On a phone the head is the control: one contract open at a time, all
     three names always on screen, nothing below the fold. */
  function headButton(c) {
    var b = el("div", "terms-cell terms-head");
    var t = el("button", "head-hit");
    t.type = "button";
    t.appendChild(el("span", "ct-letter", c.letter));
    t.appendChild(el("span", "ct-name", c.name));
    t.appendChild(el("span", "ct-mark"));
    t.setAttribute("aria-expanded", openContract === c.id ? "true" : "false");
    t.addEventListener("click", function () {
      openContract = openContract === c.id ? null : c.id;
      openTerm = null;
      showRate = false;
      renderTerms();
      renderTermOut();
    });
    b.appendChild(t);
    return b;
  }

  function termButton(c, row) {
    var id = c.id + ":" + row.key;
    var b = el("button", "terms-cell");
    /* The row name is a real element rather than a ::before, so the row
       that is named for Ada can carry her face. Hidden on wide screens,
       where the row name lives in the label column instead. */
    var lab = el("span", "cell-row");
    if (row.key === "survivor") lab.appendChild(faceEl("ada"));
    lab.appendChild(el("span", "cell-row-t", row.short));
    b.appendChild(lab);
    b.appendChild(el("span", "cell-val", row.get(c)));
    b.type = "button";
    b.setAttribute("aria-expanded", openTerm === id ? "true" : "false");
    b.addEventListener("click", function () {
      openTerm = openTerm === id ? null : id;
      /* The rate is the last row, and it arrives on its own: reading a
         contract's wording and reading its price are two different readings
         of the same grid, and showing both at once buries each. */
      if (openTerm) showRate = false;
      renderTerms();
      renderTermOut();
    });
    return b;
  }

  function rateCell(c) {
    var d = el("div", "terms-cell rate-cell",
      "<b>" + money(c.base) + "</b> a month from " + c.startAge +
      '<span class="real">' + money(real(c.base, c.startAge)) + " today</span>");
    return d;
  }

  function renderTerms() {
    var t = $("termsTable");
    t.innerHTML = "";
    t.style.gridTemplateRows = narrow() ? ""
      : "auto repeat(" + (TERM_ROWS.length + (showRate ? 1 : 0)) + ", minmax(0, 1fr))";

    if (narrow()) {
      /* One block per contract; the terms stay the architecture of the
         block. Only the open one shows its rows, and the headline rate,
         when it is asked for, replaces them across all three — the same
         either/or the wide layout makes by hiding the rate while a cell is
         being read. Everything stays inside the window. */
      t.appendChild(corner());
      LG.CONTRACTS.forEach(function (c) {
        var g = el("div", "terms-group" + (openContract === c.id ? " is-open" : ""));
        g.appendChild(headButton(c));
        if (showRate) {
          var r = rateCell(c);
          r.classList.add("terms-row-rate");
          g.appendChild(r);
        } else if (openContract === c.id) {
          TERM_ROWS.forEach(function (row) {
            g.appendChild(termButton(c, row));
            /* The reading opens where the finger is, not 400px below it. */
            if (openTerm === c.id + ":" + row.key) g.appendChild(termOutBox(c, row));
          });
        }
        t.appendChild(g);
      });
      return;
    }

    t.appendChild(corner());
    LG.CONTRACTS.forEach(function (c) { t.appendChild(headCell(c)); });

    TERM_ROWS.forEach(function (row) {
      var lab = el("div", "terms-cell terms-label");
      /* The survivor row is the question Robert actually has, so the row it
         is named for is the one that carries her face. */
      if (row.key === "survivor") {
        lab.classList.add("terms-label-face");
        lab.appendChild(faceEl("ada"));
      }
      lab.appendChild(el("p", "rl", row.label));
      if (row.sub) lab.appendChild(el("p", "rs", row.sub));
      t.appendChild(lab);
      LG.CONTRACTS.forEach(function (c) { t.appendChild(termButton(c, row)); });
    });

    if (showRate) {
      var lab = el("div", "terms-cell terms-label terms-row-rate");
      lab.appendChild(el("p", "rl", "Income"));
      t.appendChild(lab);
      LG.CONTRACTS.forEach(function (c) {
        var r = rateCell(c);
        r.classList.add("terms-row-rate");
        t.appendChild(r);
      });
    }
  }

  function termOutBox(c, row) {
    var box = el("div", "term-out plate");
    var eb = el("p", "eyebrow", c.letter + " &middot; " + row.label);
    if (row.key === "survivor") {
      box.classList.add("term-out-face");
      box.appendChild(faceEl("ada"));
    }
    box.appendChild(eb);
    box.appendChild(el("p", null, c.terms[row.key]));
    return box;
  }

  function renderTermOut() {
    var out = $("termOut");
    out.innerHTML = "";
    /* On a phone the reading is rendered inline, inside the open block. */
    if (!openTerm || narrow()) return;
    var parts = openTerm.split(":");
    var c = LG.CONTRACTS.filter(function (x) { return x.id === parts[0]; })[0];
    var row = TERM_ROWS.filter(function (x) { return x.key === parts[1]; })[0];
    out.appendChild(termOutBox(c, row));
  }

  /* ====================================================== screen 4 — lives */

  var STATE_WORD = {
    covered: "Spending met",
    floor: "Floor only",
    short: "Floor missed",
    gone: "Both gone"
  };

  var currentLife = 0;

  function renderLifePicker() {
    var p = $("lifePicker");
    p.innerHTML = "";
    LG.LIVES.forEach(function (life, i) {
      var b = el("button", "choice", "<b>" + life.label + "</b>");
      b.type = "button";
      b.setAttribute("aria-pressed", i === currentLife ? "true" : "false");
      b.addEventListener("click", function () { currentLife = i; renderLives(); });
      p.appendChild(b);
    });
  }

  /* Robert's and Ada's own lifelines, drawn on the tracks' own scale so the
     survivor years are a shape before they are a contract term. */
  function renderSpans(life) {
    var s = $("spans");
    s.innerHTML = "";
    var adaEndRobertAge = A0 + (life.adaDeath - H.adaAge);
    [["Robert", life.robertDeath, life.robertDeath, "", "robert"],
     ["Ada", adaEndRobertAge, life.adaDeath, "ada", "ada"]].forEach(function (r) {
      var row = el("div", "span-row");
      row.appendChild(el("i", "span-track"));
      var f = el("i", "span-fill" + (r[3] ? " " + r[3] : ""));
      f.style.width = agePct(r[1] + 1) + "%";
      row.appendChild(f);

      /* Ada's years without him are a different material on her own line. */
      if (r[3] === "ada" && adaEndRobertAge > life.robertDeath) {
        var a0 = agePct(life.robertDeath + 1), a1 = agePct(adaEndRobertAge + 1);
        var al = el("i", "span-fill ada alone");
        al.style.left = a0 + "%";
        al.style.width = (a1 - a0) + "%";
        row.appendChild(al);
        /* The label only goes in when the band is wide enough in pixels to
           hold it clear of the age at the end of her line. */
        if ((a1 - a0) / 100 * (s.clientWidth || 1000) >= 150) {
          var t = el("span", "span-alone", "Ada alone");
          t.style.left = a0 + "%";
          t.style.width = (a1 - a0) + "%";
          row.appendChild(t);
        }
      }

      /* Each lifeline begins with the face it belongs to, so that when his
         line stops and hers carries on it is two people, not two bars. */
      var face = faceEl(r[4]);
      face.className += " span-face";
      row.appendChild(face);
      var lab = el("span", "span-lab", r[0]);
      row.appendChild(lab);
      var end = el("span", "span-end", '<span class="de-word">dies at </span>' + r[2]);
      end.style.width = agePct(r[1] + 1) + "%";
      row.appendChild(end);
      s.appendChild(row);
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
    else if (sim.floorOnlyYears > 0) { cls = "warn"; text = sim.floorOnlyYears + " lean year" + (sim.floorOnlyYears > 1 ? "s" : ""); }
    else { cls = "ok"; text = "Holds throughout"; }
    return '<b class="' + cls + '">' + text + "</b><span>" + money0(sim.totalPaid) + " paid</span>";
  }

  function renderLives() {
    renderLifePicker();
    var life = LG.LIVES[currentLife];
    renderSpans(life);

    var box = $("tracks");
    box.innerHTML = "";
    var sims = [];

    LG.CONTRACTS.forEach(function (c) {
      var sim = LG.simulate(c, life);
      sims.push(sim);
      var r = el("div", "track-row");
      r.appendChild(trackFor(sim));
      r.appendChild(el("div", "track-name", c.letter + '<span class="tn-full"> &middot; ' + c.name + "</span>"));
      r.appendChild(el("div", "track-sum", summaryFor(sim)));
      box.appendChild(r);
    });

    var none = LG.simulate(null, life);
    sims.push(none);
    var nr = el("div", "track-row");
    nr.appendChild(trackFor(none));
    nr.appendChild(el("div", "track-name", "No contract"));
    nr.appendChild(el("div", "track-sum", summaryFor(none)));
    box.appendChild(nr);

    /* The moment Robert dies, ruled across every contract at once. */
    var rule = el("i", "death-rule");
    rule.style.left = agePct(life.robertDeath + 1) + "%";
    box.appendChild(rule);
    var ax = $("trackAxis");
    ax.innerHTML = "";
    [71, 80, 90, 100].forEach(function (age) {
      var sp = el("span", null, String(age));
      sp.style.left = agePct(age + 0.5) + "%";
      ax.appendChild(sp);
    });

    $("lifeNote").textContent = life.note;

    /* Computed, not asserted: the care life is the one where nothing holds. */
    var v = $("lifeVerdict");
    var allFail = sims.every(function (s) { return s.shortYears > 0; });
    if (allFail) {
      v.hidden = false;
      v.innerHTML = "";
      v.appendChild(el("p", "lbl", "Every row breaks"));
      v.appendChild(el("p", null,
        "All three miss the floor, and so does keeping the " + money(H.premium) + "."));
    } else {
      v.hidden = true;
    }
  }

  function renderLegend() {
    var l = $("legend");
    l.innerHTML = "";
    [["s-covered", STATE_WORD.covered], ["s-floor", STATE_WORD.floor],
     ["s-short", STATE_WORD.short], ["s-gone", STATE_WORD.gone]].forEach(function (p) {
      l.appendChild(el("span", null, '<i class="swatch ' + p[0] + '" aria-hidden="true"></i>' + p[1]));
    });
  }

  /* ===================================================== screen 5 — bridge */

  var startAge = 80;
  var stress = 0;
  var STRESSES = [
    { label: "A long life", sub: "Robert to 96", life: LG.LIVES[0] },
    { label: "Care from 84", sub: "Robert to 91", life: LG.LIVES[3] }
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
      ["The bridge", (startAge - H.robertAge) + " years", "71 to " + startAge + ", savings alone"],
      ["First payment", money(income), money(real(income, startAge)) + " in today's money"],
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
      v = money0(accessible - potAtStart) + " of the " + money(accessible) +
        " left after the premium has gone into the bridge before the first payment lands.";
    } else if (sim.potDry < startAge) {
      v = "Savings run out at " + sim.potDry + ", " + (startAge - sim.potDry) +
        " year" + (startAge - sim.potDry > 1 ? "s" : "") +
        " before the first payment arrives, and the contract cannot reach back to cover the gap that emptied them.";
    } else {
      v = "Savings run out at " + sim.potDry + " and the floor then goes unmet in " +
        sim.shortYears + " of the remaining years, because the payment arriving at " +
        startAge + " cannot carry them alone.";
    }
    $("bridgeVerdict").textContent = v;

    drawBridgeChart(sim, life);
  }

  /* The savings curve is the ground of this screen, drawn to the element's
     own pixel size so it reaches all four edges rather than sitting in a card. */
  function drawBridgeChart(sim, life) {
    var host = $("bridgeChart");
    var W = host.clientWidth || 1440, Ht = host.clientHeight || 900;
    /* On a phone the chart is a band at the top of a scrolling scene, so it
       keeps less room below it and its band label clears the back control. */
    var phone = W < 700;
    /* The phone band is short, so the headroom above the plot is what keeps
       the two chart labels clear of the fixed controls in the corners. */
    var top = Math.round(Ht * (phone ? 0.38 : 0.30)), bottom = Ht - (phone ? 42 : 104);
    var ih = Math.max(60, bottom - top);

    var lastAlive = Math.min(Math.max(life.robertDeath, A0 + (life.adaDeath - H.adaAge)), A1);
    var pts = sim.rows.filter(function (r) { return r.age <= lastAlive; });
    if (!pts.length) return;
    var maxPot = Math.max.apply(null, pts.map(function (r) { return r.pot; }).concat([H.savings - H.premium]));
    maxPot = Math.ceil(maxPot / 50000) * 50000;

    function X(age) { return (age - A0) / (A1 - A0) * W; }
    function Y(p) { return top + ih - (p / maxPot) * ih; }

    var d = "M " + X(A0) + " " + Y(H.savings - H.premium);
    pts.forEach(function (r) { d += " L " + X(r.age).toFixed(1) + " " + Y(r.pot).toFixed(1); });
    var area = d + " L " + X(pts[pts.length - 1].age).toFixed(1) + " " + Y(0) +
      " L " + X(A0) + " " + Y(0) + " Z";

    /* Every label on this chart carries a paper halo, because the curve and
       the shaded bridge move underneath it as the slider moves. */
    var HALO = ' paint-order="stroke fill" stroke="#FBF9F1" stroke-width="3.5" stroke-linejoin="round"';
    var s = [];
    s.push('<svg viewBox="0 0 ' + W + " " + Ht + '" width="' + W + '" height="' + Ht +
      '" role="img" aria-label="Accessible savings from age 71 to ' + lastAlive +
      ', with the years before the first payment at ' + startAge + ' shaded as the bridge.">');

    /* the bridge band, running off the top and the bottom of the screen */
    s.push('<rect x="0" y="0" width="' + X(startAge).toFixed(1) + '" height="' + Ht + '" fill="#E3DBCB"/>');
    s.push('<text x="' + (X(startAge) / 2).toFixed(1) + '" y="' + (phone ? top - 12 : 46) + '" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" letter-spacing="2.4" fill="#61533D"' + HALO + '>THE BRIDGE</text>');

    /* savings */
    s.push('<path d="' + area + '" fill="#61533D" fill-opacity="0.13"/>');
    s.push('<path d="' + d + '" fill="none" stroke="#61533D" stroke-width="2.5" stroke-linejoin="round"/>');

    /* baseline and scale */
    s.push('<line x1="0" y1="' + Y(0) + '" x2="' + W + '" y2="' + Y(0) + '" stroke="#C6BBA6"/>');
    s.push('<text x="14" y="' + (Y(maxPot) + 12) + '" font-family="Arial" font-size="11" fill="#61533D"' + HALO + '>£' + (maxPot / 1000) + "k</text>");
    [71, 80, 90, 100].forEach(function (age) {
      s.push('<text x="' + (X(age) + (age === 71 ? 8 : age === 100 ? -8 : 0)).toFixed(1) +
        '" y="' + (Y(0) + 22) + '" text-anchor="' + (age === 71 ? "start" : age === 100 ? "end" : "middle") +
        '" font-family="Arial" font-size="12" fill="#61533D"' + HALO + '>' + age + "</text>");
    });

    /* first payment */
    s.push('<line x1="' + X(startAge).toFixed(1) + '" y1="0" x2="' + X(startAge).toFixed(1) +
      '" y2="' + Y(0) + '" stroke="#61533D" stroke-width="1.5" stroke-dasharray="5 4"/>');
    var lx = X(startAge) + 10, anchor = "start";
    if (lx > W - 200) { lx = X(startAge) - 10; anchor = "end"; }
    s.push('<text x="' + lx.toFixed(1) + '" y="' + (top - 12) +
      '" text-anchor="' + anchor + '" font-family="Arial" font-size="12.5" font-weight="700" fill="#61533D"' + HALO + '>First payment, ' + startAge + "</text>");

    /* savings exhausted */
    if (sim.potDry !== null && sim.potDry <= lastAlive) {
      s.push('<circle cx="' + X(sim.potDry).toFixed(1) + '" cy="' + Y(0) + '" r="5" fill="#B02B1B"/>');
      var dx = X(sim.potDry) + 10, da = "start";
      if (dx > W - 160 || X(startAge) - X(sim.potDry) < 140) { dx = X(sim.potDry) - 10; da = "end"; }
      s.push('<text x="' + dx.toFixed(1) + '" y="' + (Y(0) - 16) + '" text-anchor="' + da +
        '" font-family="Arial" font-size="12.5" font-weight="700" fill="#B02B1B"' + HALO + '>Savings out, ' + sim.potDry + "</text>");
    }

    s.push("</svg>");
    host.innerHTML = s.join("");
  }

  /* ==================================================== screen 6 — undoing */

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

  function undoState(c) {
    var age = H.robertAge + months / 12;
    if (months <= 1) {
      return { status: "Reversible", cls: "st-open", glyph: "↺",
        a: "Cancel in full — " + money(H.premium) + " back, no charge",
        b: "The last moment any of this is free" };
    }
    if (c.id === "joint" && months <= 36) {
      var chg = months <= 12 ? 0.09 : (months <= 24 ? 0.06 : 0.03);
      return { status: "Partly reversible", cls: "st-part", glyph: "◐",
        a: "Up to " + money(COMMUTABLE) + " back — " + Math.round(chg * 100) + "% charge, " + money(COMMUTABLE * chg),
        b: "The other " + money(H.premium - COMMUTABLE) + " is fixed" };
    }
    if (age < c.startAge) {
      return { status: "Fixed", cls: "st-fixed", glyph: "●",
        a: "Nothing to take back, at any price",
        b: c.id === "joint"
          ? "His death before " + c.startAge + " still starts 60% to Ada"
          : "His death before " + c.startAge + " pays nothing to anyone" };
    }
    return { status: "Fixed", cls: "st-fixed", glyph: "●",
      a: "Nothing to take back — the capital is the insurer's",
      b: c.id === "level" ? "Stops on his death, nothing to Ada"
        : c.id === "escalating" ? "Guaranteed to " + (c.startAge + c.guaranteeYears) + " for Ada"
        : "60% continues to Ada for her life" };
  }

  function buildTimeline() {
    var bars = $("tlBars");
    bars.innerHTML = "";
    LG.CONTRACTS.forEach(function (c) {
      var row = el("div", "tl-row");

      var bar = el("div", "tl-bar");
      bar.appendChild(el("span", "seg seg-open")).style.width = pct(1);
      if (c.id === "joint") {
        var part = bar.appendChild(el("span", "seg seg-part"));
        part.style.width = (tlPos(36) - tlPos(1)) * 100 + "%";
        bar.appendChild(el("span", "seg seg-fixed")).style.width = (1 - tlPos(36)) * 100 + "%";
      } else {
        bar.appendChild(el("span", "seg seg-fixed")).style.width = (1 - tlPos(1)) * 100 + "%";
      }
      row.appendChild(bar);

      var begin = el("i", "tl-begin");
      begin.style.left = pct((c.startAge - H.robertAge) * 12);
      begin.title = "Payments begin at " + c.startAge;
      row.appendChild(begin);
      var bl = el("span", "tl-begin-lab", "Begins at " + c.startAge);
      bl.style.left = "calc(" + pct((c.startAge - H.robertAge) * 12) + " + 8px)";
      row.appendChild(bl);

      var face = el("div", "tl-face");
      face.appendChild(el("div", "tl-ct", c.letter + " &middot; " + c.name));
      var st = el("div", "tl-state");
      st.id = "tlState-" + c.id;
      face.appendChild(st);
      row.appendChild(face);

      bars.appendChild(row);
    });

    var mark = el("i", "tl-marker");
    mark.id = "tlMarker";
    bars.appendChild(mark);

    var ticks = $("tlTicks");
    ticks.innerHTML = "";
    [[0, "Day 0", "narrow-hide"], [1, "Day 30", ""], [12, "Year 1", ""],
     [36, "Year 3", ""], [120, "Year 10", ""], [228, "Year 19", ""]]
      .forEach(function (t) {
        var s = el("span", t[2] || null, t[1]);
        s.style.left = pct(t[0]);
        ticks.appendChild(s);
      });

    var lg = $("undoLegend");
    lg.innerHTML = "";
    [["seg-open", "Reversible in full"], ["seg-part", "Partly reversible"],
     ["seg-fixed", "Fixed"], ["tl-begin-key", "Payments begin"]].forEach(function (p) {
      lg.appendChild(el("span", null, '<i class="swatch ' + p[0] + '" aria-hidden="true"></i>' + p[1]));
    });
  }

  function renderUndo() {
    if (!$("tlMarker")) buildTimeline();
    $("tlMarker").style.left = pct(months);
    $("timeVal").textContent = monthLabel(months);
    $("timeSlider").setAttribute("aria-valuetext", monthLabel(months) + " after the money moves");

    LG.CONTRACTS.forEach(function (c) {
      var s = undoState(c);
      var box = $("tlState-" + c.id);
      box.innerHTML = "";
      box.appendChild(el("p", "status " + s.cls,
        '<span class="glyph" aria-hidden="true">' + s.glyph + "</span>" + s.status));
      box.appendChild(el("p", "frag", s.a));
      box.appendChild(el("p", "frag", s.b));
    });
  }

  /* ========================================================== navigation */

  var pages = Array.prototype.slice.call(document.querySelectorAll(".scene"));
  var current = 1;

  function go(n) {
    n = Math.max(1, Math.min(pages.length, n));
    current = n;
    pages.forEach(function (p, i) { p.hidden = (i + 1) !== n; });
    document.body.setAttribute("data-screen", String(n));
    $("headCount").textContent = String(n).padStart(2, "0") + " / " + String(pages.length).padStart(2, "0");
    $("prevBtn").disabled = n === 1;
    $("nextLabel").textContent = pages[n - 1].dataset.cta;
    $("pagePicker").value = String(n);
    pages[n - 1].scrollTop = 0;
    var h = pages[n - 1].querySelector("h1, h2");
    $("announce").textContent = "Screen " + n + " of " + pages.length + ". " + (h ? h.textContent : "");
    if (location.hash !== "#" + n) history.replaceState(null, "", "#" + n);
    if (n === 5) drawBridgeChart(LG.simulate(BRIDGE_SHAPE, STRESSES[stress].life, { startAge: startAge }),
                                 STRESSES[stress].life);
  }

  function buildPicker() {
    var sel = $("pagePicker");
    pages.forEach(function (p, i) {
      var o = document.createElement("option");
      o.value = String(i + 1);
      o.textContent = (i + 1) + " · " + p.dataset.title;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { go(parseInt(sel.value, 10)); });
  }

  /* =============================================================== start */

  function init() {
    buildPicker();
    renderFigures(false);
    renderTerms();
    renderTermOut();
    renderLegend();
    renderLives();
    renderBridge();
    renderUndo();

    $("srcToggle").addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", on ? "true" : "false");
      this.textContent = on ? "Hide the sources" : "Where each figure comes from";
      /* Four provenance lines are 200px of type. On a phone the screen's
         job changes from meeting him to reading where the figures came
         from, so the plates rise over more of the photograph rather than
         pushing the last source line out of the window. */
      document.getElementById("page-2").classList.toggle("srcs-on", on);
      renderFigures(on);
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
      this.textContent = on ? "Handed over" : "Hand over to an adviser";
      $("handWord").textContent = on
        ? "The file has gone to a regulated adviser, and nothing on these screens was a recommendation."
        : "Robert presses this and a regulated human receives the whole file, not a lead.";
    });

    $("prevBtn").addEventListener("click", function () { go(current - 1); });
    $("nextBtn").addEventListener("click", function () {
      go(current === pages.length ? 1 : current + 1);
    });

    document.addEventListener("keydown", function (e) {
      if (e.target.matches("input, select, textarea")) return;
      if (e.key === "ArrowRight") { go(current + 1); }
      else if (e.key === "ArrowLeft") { go(current - 1); }
    });

    window.addEventListener("hashchange", function () {
      var n = parseInt((location.hash || "").slice(1), 10);
      if (!isNaN(n) && n !== current) go(n);
    });

    var wasNarrow = narrow();
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        if (narrow() !== wasNarrow) { wasNarrow = narrow(); renderTerms(); renderTermOut(); }
        renderBridge();
      }, 120);
    });

    var fromHash = parseInt((location.hash || "").slice(1), 10);
    go(isNaN(fromHash) ? 1 : fromHash);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else { init(); }
})();
