/* ══════════════════════════════════════════════════════════════════════════
   Micromutual · 2036 prototype
   No framework, no build step, no external request. Three files.

   The neighbourhood is one fictional street, Tramonto Ridge: 38 parcels in
   two rows of 19 either side of the road, with a canyon at the downslope
   edge. Every figure below is invented and internally consistent; the cover
   says so once, and the page footer keeps saying it quietly.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── the invented ledger ───────────────────────────────────────────────
     Contribution  $86 / household / month  ×  38  ×  12   =  $39,216
        Works                                              =  $27,100
        Hardship allocation                                =  $ 6,100
        Aggregate-contract premium                         =  $ 3,100
        Running costs                                      =  $ 2,900
     Works breaks down as machine lease $18,600 (12 × $1,550), crew and
     arborist $6,200, survey and verification $2,300.
     Hardship holds three years' allocation, $18,300, and the carrier's
     aggregate contract sits above it with a $21,700 limit — $40,000 in all,
     which is exactly ten households at the $4,000 cap.                    */

  var WORKS_BUDGET = 27100;
  var HARDSHIP_HELD = 18300;
  var CONTRACT_LIMIT = 21700;
  var PER_EVENT_CAP = 4000;
  var MEMBER_FIRST = 750;
  var POLICY_DEDUCTIBLE = 10000;
  var HOMES = 38;
  var PER_ROW = 19;
  var GAPS = (PER_ROW - 1) * 2;          /* 36 boundary gaps */

  var money = function (n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  };

  /* ══════════════════════════════════════════════════════════════════════
     NAVIGATION
     Prev / Next, a content-labelled picker, arrow keys and a hash route —
     the reader shell's four ideas, kept.
     ══════════════════════════════════════════════════════════════════════ */

  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var total = pages.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var current = 1;

  pages.forEach(function (p, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + p.dataset.label;
    picker.appendChild(o);
  });

  var index = document.getElementById("page-index");
  pages.forEach(function (p, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.dataset.goto = String(i + 1);
    b.innerHTML = '<span class="ix-n">' + String(i + 1).padStart(2, "0") +
      "</span>" + p.dataset.label;
    li.appendChild(b);
    index.appendChild(li);
  });

  function show(n, push) {
    n = Math.min(Math.max(1, n), total);
    current = n;
    pages.forEach(function (p, i) { p.hidden = (i + 1 !== n); });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextBtn.disabled = n === total;
    var h = pages[n - 1].querySelector(".display");
    announce.textContent = "Page " + n + " of " + total + ". " +
      (h ? h.textContent.replace(/\s+/g, " ").trim() : "");
    window.scrollTo(0, 0);
    if (push !== false) {
      try { history.replaceState(null, "", "#p/" + n); } catch (e) { /* file:// */ }
    }
    if (n === 3) { drawWorks(); }
    if (n === 4) { drawConsent(); }
  }

  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", function () { show(current + 1); });
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-goto]");
    if (t) { show(parseInt(t.dataset.goto, 10)); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input") { return; }
    if (e.key === "ArrowRight") { show(current + 1); }
    if (e.key === "ArrowLeft") { show(current - 1); }
  });

  /* The cover photograph is the one asset borrowed from the publication it
     is printed in. design.md §6: every image has a designed failure state. */
  var coverImg = document.getElementById("cover-img");
  function coverFailed() { coverImg.parentNode.classList.add("failed"); }
  coverImg.addEventListener("error", coverFailed);
  /* The script runs after the <img>, so the error may already have fired. */
  if (coverImg.complete && coverImg.naturalWidth === 0) { coverFailed(); }

  /* ══════════════════════════════════════════════════════════════════════
     2 · ACCOUNTS
     ══════════════════════════════════════════════════════════════════════ */

  Array.prototype.forEach.call(document.querySelectorAll(".acct-head"), function (h) {
    h.addEventListener("click", function () {
      var open = h.getAttribute("aria-expanded") === "true";
      h.setAttribute("aria-expanded", open ? "false" : "true");
      document.getElementById(h.getAttribute("aria-controls")).hidden = open;
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     3 & 4 · THE PLAN
     One street, two orientations. Wide: the road runs across and the rows
     sit above and below it. Narrow: the same street stood on its end, so a
     parcel stays big enough to tap at 390px.
     ══════════════════════════════════════════════════════════════════════ */

  function layout() {
    var narrow = window.matchMedia("(max-width: 719px)").matches;
    var P = [], G = [], C = [], road, slope, vb, r, i, x, y;

    if (!narrow) {
      /* Lots are wider than they are deep, the way a street of 19 frontages
         actually is; the drive stub to the road is what makes a rectangle
         read as a property rather than a stripe. */
      var gap = 7, ml = 22;
      var pw = (980 - ml * 2 - (PER_ROW - 1) * gap) / PER_ROW;
      var rowY = [26, 170], ph = 80;
      vb = "0 0 980 330";
      road = { x: 0, y: 112, w: 980, h: 52, horizontal: true };
      slope = { x: 0, y: 278, w: 980, h: 46, horizontal: true };
      for (r = 0; r < 2; r++) {
        for (i = 0; i < PER_ROW; i++) {
          x = ml + i * (pw + gap);
          P.push({ x: x, y: rowY[r], w: pw, h: ph, row: r, col: i,
                   hx: x + pw / 2, hy: rowY[r] + (r === 0 ? 34 : 46) });
          if (i < PER_ROW - 1) {
            /* The gap that matters is the one between the two houses, not the
               whole boundary — structure-to-structure is what spreads. */
            G.push({ x: x + pw, y: rowY[r] + (r === 0 ? 10 : 22), w: gap, h: 48 });
          }
          if (r === 1) {
            C.push({ x: x - (i === 0 ? 0 : gap / 2), y: 254,
                     w: pw + (i === 0 || i === PER_ROW - 1 ? gap / 2 : gap), h: 22,
                     p: PER_ROW + i });
          }
        }
      }
    } else {
      var g2 = 6, mt = 16, pwn = 112;
      var phn = (880 - mt * 2 - (PER_ROW - 1) * g2) / PER_ROW;
      var colX = [10, 178];
      vb = "0 0 360 880";
      road = { x: 128, y: 0, w: 44, h: 880, horizontal: false };
      slope = { x: 318, y: 0, w: 40, h: 880, horizontal: false };
      for (r = 0; r < 2; r++) {
        for (i = 0; i < PER_ROW; i++) {
          y = mt + i * (phn + g2);
          P.push({ x: colX[r], y: y, w: pwn, h: phn, row: r, col: i,
                   hx: colX[r] + (r === 0 ? 74 : 38), hy: y + phn / 2 });
          if (i < PER_ROW - 1) {
            G.push({ x: colX[r] + (r === 0 ? 50 : 14), y: y + phn, w: 48, h: g2 });
          }
          if (r === 1) {
            C.push({ x: 294, y: y - (i === 0 ? 0 : g2 / 2), w: 22,
                     h: phn + (i === 0 || i === PER_ROW - 1 ? g2 / 2 : g2),
                     p: PER_ROW + i });
          }
        }
      }
    }
    return { P: P, G: G, C: C, road: road, slope: slope, vb: vb, narrow: narrow };
  }

  /* Both plans live in one document, so their patterns need their own ids —
     a duplicate id resolves to whichever SVG is first, which is invisible
     while its page is hidden. */
  function defs(uid) {
    return '<defs>' +
      '<pattern id="hatch-' + uid + '" width="7" height="7" ' +
      'patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<rect width="7" height="7" fill="rgba(163,51,34,.13)"/>' +
      '<line x1="0" y1="0" x2="0" y2="7" stroke="#A33322" stroke-width="2.2"/>' +
      "</pattern>" +
      '<pattern id="slope-' + uid + '" width="9" height="9" ' +
      'patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<rect width="9" height="9" fill="#DCE2CF"/>' +
      '<line x1="0" y1="0" x2="0" y2="9" stroke="#7C8C82" stroke-width="1"/>' +
      "</pattern></defs>";
  }

  /* The 36 boundary gaps, in the order renderPlan draws them: row 0 left to
     right, then row 1. A gap belongs to the two parcels beside it. */
  var G_INDEX = [];
  (function () {
    for (var r = 0; r < 2; r++) {
      for (var i = 0; i < PER_ROW - 1; i++) { G_INDEX.push({ row: r, col: i }); }
    }
  })();

  /* Renders one plan. `opts.treated(i)` says whether parcel i is enrolled;
     `opts.zone(kind, k)` returns 1 done, 0 not yet, -1 blocked by a refusal. */
  function renderPlan(host, opts) {
    var L = layout();
    var uid = opts.uid;
    var HATCH = "url(#hatch-" + uid + ")", SLOPE = "url(#slope-" + uid + ")";
    var role = opts.interactive ? 'role="group"' : 'role="img"';
    var s = ['<svg viewBox="' + L.vb + '" ' + role + ' aria-label="' + opts.alt +
      '" preserveAspectRatio="xMidYMid meet">', defs(uid)];

    /* the downslope ground beyond the lower row */
    s.push('<rect x="' + L.slope.x + '" y="' + L.slope.y + '" width="' + L.slope.w +
      '" height="' + L.slope.h + '" fill="' + SLOPE + '"/>');

    /* the road */
    s.push('<rect x="' + L.road.x + '" y="' + L.road.y + '" width="' + L.road.w +
      '" height="' + L.road.h + '" fill="#E7EBDC"/>');
    if (L.road.horizontal) {
      var my = L.road.y + L.road.h / 2;
      s.push('<line x1="0" y1="' + my + '" x2="980" y2="' + my +
        '" stroke="#7C8C82" stroke-width="1.4" stroke-dasharray="11 10"/>');
    } else {
      var mx0 = L.road.x + L.road.w / 2;
      s.push('<line x1="' + mx0 + '" y1="0" x2="' + mx0 +
        '" y2="880" stroke="#7C8C82" stroke-width="1.4" stroke-dasharray="11 10"/>');
    }

    /* the canyon-edge fuel break, butted segment to segment so a treated run
       reads as one continuous strip and a refusal reads as a hole in it */
    L.C.forEach(function (c) {
      var d = opts.zone("canyon", c.p);
      s.push('<rect x="' + c.x + '" y="' + c.y + '" width="' + c.w + '" height="' + c.h +
        '" fill="' + (d === 1 ? "rgba(47,90,68,.38)" : d === -1 ? HATCH : "none") +
        '" stroke="' + (d === 1 ? "none" : d === -1 ? "#A33322" : "#7C8C82") +
        '" stroke-width="1"' + (d === 0 ? ' stroke-dasharray="3 3"' : "") + "/>");
    });

    /* parcels */
    L.P.forEach(function (p, i) {
      var t = opts.treated(i), g = "";

      g += '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h +
        '" rx="2" fill="' + (t ? "#FBFCF5" : HATCH) +
        '" stroke="' + (t ? "#7C8C82" : "#A33322") +
        '" stroke-width="' + (t ? 1 : 1.8) + '"/>';

      /* drive stub to the road */
      if (L.narrow) {
        var dx = p.row === 0 ? p.x + p.w : p.x;
        g += '<line x1="' + dx + '" y1="' + p.hy + '" x2="' + p.hx + '" y2="' + p.hy +
          '" stroke="#C6CFBC" stroke-width="3"/>';
      } else {
        var dy = p.row === 0 ? p.y + p.h : p.y;
        g += '<line x1="' + p.hx + '" y1="' + dy + '" x2="' + p.hx + '" y2="' + p.hy +
          '" stroke="#C6CFBC" stroke-width="3"/>';
      }

      /* the five feet around the house */
      var sw = L.narrow ? 32 : 28, sh = L.narrow ? 24 : 26;
      var sd = opts.zone("strip", i);
      g += '<rect x="' + (p.hx - sw / 2) + '" y="' + (p.hy - sh / 2) + '" width="' + sw +
        '" height="' + sh + '" rx="2" fill="' +
        (sd === 1 ? "rgba(47,90,68,.24)" : "none") + '" stroke="' +
        (sd === 1 ? "#2F5A44" : sd === -1 ? "#A33322" : "#7C8C82") +
        '" stroke-width="1.1"' + (sd === 0 ? ' stroke-dasharray="3 3"' : "") + "/>";

      /* the house */
      var hw = L.narrow ? 17 : 15, hh = L.narrow ? 13 : 12;
      var hx0 = p.hx - hw / 2, hy0 = p.hy - hh / 2;
      g += '<path d="M' + hx0 + " " + (hy0 + hh) + " L" + hx0 + " " + (hy0 + hh * 0.42) +
        " L" + p.hx + " " + hy0 + " L" + (hx0 + hw) + " " + (hy0 + hh * 0.42) +
        " L" + (hx0 + hw) + " " + (hy0 + hh) + ' Z" fill="#293D31"/>';

      /* a refusal carries a glyph as well as a colour */
      if (!t) {
        var gx = L.narrow ? p.x + 16 : p.hx;
        var gy = L.narrow ? p.hy : (p.row === 0 ? p.y + 13 : p.y + p.h - 13);
        g += '<circle cx="' + gx + '" cy="' + gy + '" r="7.5" fill="#FBFCF5" ' +
          'stroke="#A33322" stroke-width="1.8"/>' +
          '<line x1="' + (gx - 3.6) + '" y1="' + gy + '" x2="' + (gx + 3.6) + '" y2="' + gy +
          '" stroke="#A33322" stroke-width="2.2" stroke-linecap="round"/>';
      }

      if (opts.interactive) {
        s.push('<g class="parcel" role="button" tabindex="0" data-parcel="' + i +
          '" aria-pressed="' + (t ? "false" : "true") + '" aria-label="Property ' +
          (i + 1) + " of 38, " + (t ? "enrolled" : "consent withheld") + '">' + g + "</g>");
      } else {
        s.push("<g>" + g + "</g>");
      }
    });

    /* boundary gaps last, so they sit above the parcel strokes */
    L.G.forEach(function (gp, k) {
      var d = opts.zone("gap", k);
      if (d === -1) {
        /* A blocked gap is drawn broken, not merely red: two stubs with the
           breach between them, so it survives greyscale and colour-blindness. */
        var along = L.narrow ? "w" : "h";
        var stub = gp[along] * 0.32;
        [0, gp[along] - stub].forEach(function (off) {
          var x = gp.x + (L.narrow ? off : 0), y = gp.y + (L.narrow ? 0 : off);
          s.push('<rect x="' + x + '" y="' + y + '" width="' +
            (L.narrow ? stub : gp.w) + '" height="' + (L.narrow ? gp.h : stub) +
            '" fill="#A33322"/>');
        });
        return;
      }
      s.push('<rect x="' + gp.x + '" y="' + gp.y + '" width="' + gp.w + '" height="' + gp.h +
        '" fill="' + (d === 1 ? "#2F5A44" : "#E7EBDC") +
        '" stroke="' + (d === 1 ? "#2F5A44" : "#7C8C82") +
        '" stroke-width="1"' + (d === 0 ? ' stroke-dasharray="2.5 2.5"' : "") + "/>");
    });

    /* the machine, parked on the road */
    if (opts.machineAt != null) {
      var mx, myy;
      if (L.road.horizontal) {
        mx = 40 + opts.machineAt * 880; myy = L.road.y + L.road.h / 2 + 4;
      } else {
        mx = L.road.x + 6; myy = 30 + opts.machineAt * 790;
      }
      s.push('<g aria-hidden="true">' +
        '<rect x="' + mx + '" y="' + myy + '" width="30" height="16" rx="3" ' +
        'fill="#5B4E7A" stroke="#FBFCF5" stroke-width="1.5"/>' +
        '<rect x="' + (mx + 6) + '" y="' + (myy - 5) + '" width="11" height="6" rx="1.5" ' +
        'fill="#5B4E7A"/>' +
        '<line x1="' + (mx + 3) + '" y1="' + (myy + 19) + '" x2="' + (mx + 27) + '" y2="' +
        (myy + 19) + '" stroke="#5B4E7A" stroke-width="3" stroke-linecap="round"/>' +
        "</g>");
    }

    s.push("</svg>");
    host.innerHTML = s.join("");
  }

  function legend(host, items) {
    host.innerHTML = items.map(function (it) {
      return '<span><i style="' + it.style + '"></i>' + it.label + "</span>";
    }).join("");
  }

  /* ── 3 · the season ────────────────────────────────────────────────── */

  var SEASON = [
    {
      when: "February", what: "Canyon edge",
      items: ["610 m fuel break", "78 machine hours", "Vendor $0"],
      spend: 3100
    },
    {
      when: "May", what: "Boundary gaps",
      items: ["22 of 36 gaps cleared", "141 machine hours", "Arborist $3,900 · four hazard limbs"],
      spend: 11650
    },
    {
      when: "August", what: "Five feet around each house",
      items: ["36 parcels renewed", "96 machine hours", "Hand crew $2,300"],
      spend: 18600
    },
    {
      when: "December", what: "The rest, and verification",
      items: ["14 gaps closed", "63 machine hours", "Survey and lidar $2,300"],
      spend: 27100
    }
  ];
  var stage = 1;

  var track = document.getElementById("season-track");
  SEASON.forEach(function (st, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "season-stop";
    b.setAttribute("aria-pressed", String(i === stage));
    b.innerHTML = '<span class="s-when">' + st.when + '</span><span class="s-what">' +
      st.what + "</span>";
    b.addEventListener("click", function () { stage = i; drawWorks(); });
    track.appendChild(b);
  });

  function drawWorks() {
    Array.prototype.forEach.call(track.children, function (b, i) {
      b.setAttribute("aria-pressed", String(i === stage));
    });

    renderPlan(document.getElementById("plan-works"), {
      alt: "Plan of 38 properties on Tramonto Ridge, showing the canyon-edge break, " +
        "the strip around each house and the 36 gaps between properties, filling in " +
        "across the year.",
      treated: function () { return true; },
      zone: function (kind, k) {
        if (kind === "canyon") { return 1; }
        if (kind === "strip") { return stage >= 2 ? 1 : 0; }
        if (kind === "gap") {
          if (stage >= 3) { return 1; }
          if (stage >= 1) { return k < 22 ? 1 : 0; }
          return 0;
        }
        return 0;
      },
      machineAt: [0.86, 0.34, 0.62, 0.12][stage],
      interactive: false,
      uid: "w"
    });

    legend(document.getElementById("legend-works"), [
      { style: "background:#2F5A44;border-color:#2F5A44", label: "Gap between two houses" },
      { style: "background:rgba(47,90,68,.24);border-color:#2F5A44", label: "Five feet around a house" },
      { style: "background:rgba(47,90,68,.38);border-color:#2F5A44", label: "Canyon-edge break" },
      { style: "background:#E7EBDC;border-style:dashed;border-color:#7C8C82", label: "Not yet done" },
      { style: "background:#5B4E7A;border-color:#5B4E7A", label: "The machine" }
    ]);

    var st = SEASON[stage];
    document.getElementById("worklog").innerHTML =
      '<p class="eyebrow">' + st.when + " 2036 · " + st.what + "</p>" +
      '<ul class="wl-items">' + st.items.map(function (x) { return "<li>" + x + "</li>"; }).join("") +
      "</ul>" +
      '<p class="ro-note">Works account, year to date: ' + money(st.spend) + " of " +
      money(WORKS_BUDGET) + ".</p>";
  }

  /* ── 4 · consent ───────────────────────────────────────────────────── */

  /* The page opens on its own headline: one property has withheld. */
  var out = { 9: true };

  function isIn(i) { return !out[i]; }
  function enrolled() {
    var n = 0;
    for (var i = 0; i < HOMES; i++) { if (isIn(i)) { n++; } }
    return n;
  }
  function gapTreated(k) {
    var g = G_INDEX[k], base = g.row * PER_ROW;
    return isIn(base + g.col) && isIn(base + g.col + 1);
  }
  function treatedGaps() {
    var n = 0;
    for (var k = 0; k < GAPS; k++) { if (gapTreated(k)) { n++; } }
    return n;
  }
  function adjacentPair() {
    for (var r = 0; r < 2; r++) {
      for (var i = 0; i < PER_ROW - 1; i++) {
        if (!isIn(r * PER_ROW + i) && !isIn(r * PER_ROW + i + 1)) { return true; }
      }
    }
    return false;
  }

  /* The designation rule, invented for this projection and stated on screen. */
  function designation() {
    var gp = treatedGaps() / GAPS, pp = enrolled() / HOMES, pair = adjacentPair();
    var openGaps = GAPS - treatedGaps();
    if (gp >= 0.90 && pp >= 0.90 && !pair) {
      return { name: "Enhanced", cls: "ro-enhanced",
        note: openGaps === 0 ? "Every test met." :
          openGaps + " gaps open, still inside the 90% tolerance." };
    }
    if (gp >= 0.75 && pp >= 0.80) {
      return { name: "Essential", cls: "ro-essential",
        note: pair ? "Two untreated properties side by side." :
          "Too many gaps left open." };
    }
    return { name: "Not designated", cls: "ro-none", note: "Below both floors." };
  }

  function drawConsent() {
    renderPlan(document.getElementById("plan-consent"), {
      alt: "The same plan, showing which properties have granted consent and which " +
        "boundary gaps are left open as a result.",
      treated: isIn,
      zone: function (kind, k) {
        if (kind === "canyon") { return isIn(k) ? 1 : -1; }
        if (kind === "strip") { return isIn(k) ? 1 : -1; }
        if (kind === "gap") { return gapTreated(k) ? 1 : -1; }
        return 0;
      },
      machineAt: null,
      interactive: true,
      uid: "c"
    });

    legend(document.getElementById("legend-consent"), [
      { style: "background:#FBFCF5;border-color:#7C8C82", label: "Enrolled" },
      { style: "background:rgba(163,51,34,.13);border-color:#A33322;border-width:1.5px",
        label: "Consent withheld" },
      { style: "background:#2F5A44;border-color:#2F5A44", label: "Gap treated" },
      { style: "background:linear-gradient(#A33322 0 32%,transparent 32% 68%,#A33322 68% 100%);" +
        "border-color:transparent", label: "Gap left open" }
    ]);

    var d = designation();
    var en = enrolled(), tg = treatedGaps();
    var each = WORKS_BUDGET / en;

    document.getElementById("consent-readout").innerHTML = [
      '<div class="ro ' + d.cls + '"><p class="eyebrow">Neighborhood designation</p>' +
      '<p class="ro-fig">' + d.name + '</p><p class="ro-note">' + d.note + "</p></div>",

      '<div class="ro"><p class="eyebrow">Boundary gaps treated</p>' +
      '<p class="ro-fig">' + tg + " / " + GAPS + '</p>' +
      '<p class="ro-note">Both owners, or neither.</p></div>',

      '<div class="ro"><p class="eyebrow">Enrolled</p>' +
      '<p class="ro-fig">' + en + " / " + HOMES + '</p>' +
      '<p class="ro-note">No compulsion, ever.</p></div>',

      '<div class="ro"><p class="eyebrow">Works cost, each</p>' +
      '<p class="ro-fig">' + money(each) + '</p>' +
      '<p class="ro-note">Same machine, fewer payers &mdash; ' +
      money(each / 12) + " a month.</p></div>",

      '<div class="ro" style="grid-column:1/-1;background:var(--edition-wash)">' +
      '<p class="eyebrow">The designation rule</p>' +
      '<p class="ro-note" style="color:var(--edition-ink)">Enhanced: 90% of gaps, 90% of ' +
      "properties, and no two untreated properties side by side. Essential: 75% of gaps " +
      "and 80% of properties. Below that, nothing.</p></div>"
    ].join("");
  }

  document.getElementById("plan-consent").addEventListener("click", function (e) {
    var g = e.target.closest("[data-parcel]");
    if (g) { toggle(parseInt(g.dataset.parcel, 10)); }
  });
  document.getElementById("plan-consent").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") { return; }
    var g = e.target.closest("[data-parcel]");
    if (g) { e.preventDefault(); toggle(parseInt(g.dataset.parcel, 10)); }
  });
  function toggle(i) {
    out[i] = !out[i];
    drawConsent();
    var again = document.querySelector('[data-parcel="' + i + '"]');
    if (again) { again.focus(); }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-consent]"), function (b) {
    b.addEventListener("click", function () {
      out = {};
      var k = b.dataset.consent;
      if (k === "one") { out[9] = true; }
      if (k === "pair") { out[9] = true; out[10] = true; }
      if (k === "eight") { [2, 6, 9, 14, 21, 25, 30, 35].forEach(function (i) { out[i] = true; }); }
      drawConsent();
    });
  });

  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      if (current === 3) { drawWorks(); }
      if (current === 4) { drawConsent(); }
    }, 160);
  });

  /* ══════════════════════════════════════════════════════════════════════
     5 · TWO KINDS OF MONEY
     Below the policy's deductible the hardship layer may pay, capped. Once
     the policy responds the layer pays nothing at all — it never funds a
     deductible.
     ══════════════════════════════════════════════════════════════════════ */

  var loss = document.getElementById("loss");
  var lossOut = document.getElementById("loss-out");
  var lossBands = document.getElementById("loss-bands");

  function drawLoss() {
    var L = parseInt(loss.value, 10);
    lossOut.textContent = money(L);

    var you, pool, rest, policy, segs, keys;
    if (L > POLICY_DEDUCTIBLE) {
      policy = L - POLICY_DEDUCTIBLE;
      you = POLICY_DEDUCTIBLE; pool = 0; rest = 0;
      segs = [
        { c: "seg-you", v: you },
        { c: "seg-rest", v: policy, carrier: true }
      ];
      keys = [
        { c: "k-you", l: "Your deductible", v: you },
        { c: "k-rest", l: "Your policy pays", v: policy, carrier: true },
        { c: "k-pool", l: "Pool", v: 0, note: "never a deductible" }
      ];
    } else {
      you = Math.min(MEMBER_FIRST, L);
      pool = Math.min(PER_EVENT_CAP, Math.max(0, L - MEMBER_FIRST));
      rest = Math.max(0, L - you - pool);
      segs = [
        { c: "seg-you", v: you },
        { c: "seg-pool", v: pool },
        { c: "seg-rest", v: rest }
      ];
      keys = [
        { c: "k-you", l: "Your first", v: you },
        { c: "k-pool", l: "Pool, up to its $4,000 cap", v: pool },
        { c: "k-rest", l: "Left with you", v: rest }
      ];
    }

    var bar = '<div class="band-bar">' + segs.map(function (s) {
      if (s.v <= 0) { return ""; }
      var style = "width:" + (s.v / L * 100) + "%";
      if (s.carrier) { style += ";background:#2F5E7C"; }
      return '<span class="band-seg ' + s.c + '" style="' + style + '"></span>';
    }).join("") + "</div>";

    var key = '<p class="band-keys">' + keys.map(function (k) {
      var sty = k.carrier ? ' style="background:#2F5E7C"' : "";
      return '<span><i class="' + k.c + '"' + sty + "></i>" + k.l + " <b>" +
        money(k.v) + "</b>" + (k.note ? " — " + k.note : "") + "</span>";
    }).join("") + "</p>";

    lossBands.innerHTML = bar + key;
  }
  loss.addEventListener("input", drawLoss);
  drawLoss();

  /* ══════════════════════════════════════════════════════════════════════
     6 · TEN AT ONCE
     ══════════════════════════════════════════════════════════════════════ */

  var claimants = document.getElementById("claimants");
  var claimOut = document.getElementById("claimants-out");
  var corrStack = document.getElementById("corr-stack");
  var corrRead = document.getElementById("corr-readout");
  var capacity = HARDSHIP_HELD + CONTRACT_LIMIT;       /* $40,000 */

  function drawCorr() {
    var n = parseInt(claimants.value, 10);
    claimOut.textContent = n + " of 38";

    var demand = n * PER_EVENT_CAP;
    var paid = Math.min(demand, capacity);
    var poolUsed = Math.min(demand, HARDSHIP_HELD);
    var contractUsed = Math.min(Math.max(demand - HARDSHIP_HELD, 0), CONTRACT_LIMIT);
    var unmet = Math.max(demand - capacity, 0);
    var each = paid / n;
    var pct = Math.round(each / PER_EVENT_CAP * 100);
    var scale = Math.max(demand, capacity);

    var seg = function (cls, v, name) {
      if (v <= 0) { return ""; }
      var w = v / scale * 100;
      var label = w > 16 ? name + " " + money(v) : w > 6 ? name : "";
      return '<span class="stack-seg ' + cls + '" style="width:' + w + '%">' +
        label + "</span>";
    };

    corrStack.innerHTML =
      '<div class="stack-bar">' +
      seg("st-pool", poolUsed, "Pool") +
      seg("st-contract", contractUsed, "Contract") +
      seg("st-gap", unmet, "Unmet") +
      "</div>" +
      '<p class="stack-caption">Asked for ' + money(demand) + " · paid " + money(paid) +
      (unmet ? " · " + money(unmet) + " never arrives" : " · " + (demand === capacity ? "the stack is exactly full" : "the stack is not yet full")) +
      ".</p>";

    corrRead.innerHTML = [
      '<div class="ro' + (pct === 100 ? " ro-enhanced" : " ro-none") +
      '"><p class="eyebrow">Each household receives</p><p class="ro-fig">' + money(each) +
      '</p><p class="ro-note">' + pct + "% of the $4,000 cap.</p></div>",

      '<div class="ro"><p class="eyebrow">Pool funds</p><p class="ro-fig">' +
      money(HARDSHIP_HELD) + '</p><p class="ro-note">Three years of members’ money.</p></div>',

      '<div class="ro"><p class="eyebrow">Carrier’s aggregate limit</p><p class="ro-fig">' +
      money(CONTRACT_LIMIT) + '</p><p class="ro-note">Attaching above the pool. Premium $3,100.</p></div>',

      '<div class="ro"><p class="eyebrow">Pro-rata factor</p><p class="ro-fig">' +
      (paid / demand).toFixed(2) +
      '</p><p class="ro-note">No assessment. Everyone paid less.</p></div>'
    ].join("");
  }
  claimants.addEventListener("input", drawCorr);
  drawCorr();

  Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"), function (b) {
    b.addEventListener("click", function () {
      var ev = b.dataset.mode === "event";
      Array.prototype.forEach.call(document.querySelectorAll("[data-mode]"), function (o) {
        var on = o === b;
        o.classList.toggle("is-on", on);
        o.setAttribute("aria-checked", String(on));
      });
      document.getElementById("corr-scattered").hidden = ev;
      document.getElementById("corr-event").hidden = !ev;
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════════════════ */

  function fromHash() {
    var m = /#p\/(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) : 1;
  }
  /* A pasted link changes the hash without reloading the document. */
  window.addEventListener("hashchange", function () {
    var n = fromHash();
    if (n !== current) { show(n, false); }
  });
  show(fromHash(), false);
})();
