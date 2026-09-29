/* ───────────────────────────────────────────────────────────────────────────
   Agent Error Protection — 2036 prototype

   Nine composed pages with one interactive per page. No framework, no build,
   no network. Every figure in here is invented; the framing sits on page 1.
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

  /* ═══════════════ Reader shell ═══════════════ */

  var pages = $$(".paper");
  var picker = $("#picker");
  var stage = $("#stage");
  var announce = $("#announce");
  var current = 1;

  function show(n) {
    n = Math.min(pages.length, Math.max(1, n));
    current = n;
    pages.forEach(function (p) {
      p.hidden = Number(p.dataset.page) !== n;
    });
    picker.value = String(n);
    $("#prev").disabled = n === 1;
    $("#next").disabled = n === pages.length;
    stage.scrollTop = 0;
    var h = $(".page-copy", pages[n - 1]);
    announce.textContent = "Page " + n + " of " + pages.length + ". " + (h ? h.textContent : "");
    stream.setRunning(n === 2);
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
    if (e.key === "ArrowRight") { show(current + 1); }
    else if (e.key === "ArrowLeft") { show(current - 1); }
  });

  /* ═══════════════ 2 · The delegation stream ═══════════════ */

  var STREAM = [
    ["06:40", "Household", "Renew kitchen water filter", "$38", "money", "ok", "in mandate"],
    ["06:52", "Logistics", "Move refuse pickup to Friday", "no charge", "logistics", "ok", "in mandate"],
    ["07:15", "Household", "Pay water account", "$96", "money", "ok", "in mandate"],
    ["07:48", "Yard unit 2", "Boundary survey, 11 minutes", "inside the line", "machines", "ok", "in mandate"],
    ["08:20", "Groceries", "Weekly basket, 31 lines", "$142", "money", "ok", "in mandate"],
    ["08:55", "Logistics", "Re-route parcel to locker 4", "no charge", "logistics", "ok", "in mandate"],
    ["09:30", "Household", "Renew home network contract, 12 months", "$312", "money", "ask", "over ceiling"],
    ["09:31", "Household", "Confirmation requested from Ada", "awaiting", "money", "ask", "paused"],
    ["10:12", "Cleaning unit 1", "Run upstairs cycle, 42 minutes", "inside the line", "machines", "ok", "in mandate"],
    ["11:04", "Household", "Book gutter clearance, cancellable 24h", "$180", "money", "ok", "in mandate"],
    ["12:30", "Logistics", "Accept delivery window, Friday 08–10", "no charge", "logistics", "ok", "in mandate"],
    ["13:06", "Yard unit 2", "Clear 14 m of hedge", "3.1 m beyond the line", "machines", "no", "out of scope"],
    ["14:15", "Household", "Contractor access while the house is empty", "declined by Ada", "logistics", "ask", "refused"],
    ["16:02", "Groceries", "Substitute two lines, within budget", "$4", "money", "ok", "in mandate"]
  ];

  var stream = (function () {
    var list = $("#stream");
    var btn = $("#streamPlay");
    var cats = { money: true, logistics: true, machines: true };
    var i = 0, timer = null, running = false, wanted = false;

    function rowFits(r) { return cats[r[4]]; }

    function push() {
      var guard = 0;
      while (guard++ < STREAM.length) {
        if (i >= STREAM.length) { i = 0; list.innerHTML = ""; }
        var r = STREAM[i++];
        if (!rowFits(r)) continue;
        var li = el("li");
        if (r[5] === "no") li.className = "flag";
        li.appendChild(el("span", "t", r[0]));
        var a = el("span", "a");
        a.appendChild(el("b", null, r[1]));
        a.appendChild(document.createTextNode(r[2] + " · " + r[3]));
        li.appendChild(a);
        li.appendChild(el("span", "s s-" + r[5], r[6]));
        list.insertBefore(li, list.firstChild);
        fit();
        return;
      }
    }

    /* Trim from the foot until the log fits its frame exactly, so the oldest
       row leaves rather than being cut in half by the overflow. Rows are
       taller at phone width, so the count that fits is measured, not fixed.
       No-ops while the page is hidden, hence the refit on reveal. */
    function fit() {
      var frame = list.parentElement;
      if (!frame.clientHeight) return;
      var stop = 0;
      while (list.children.length > 2 && list.scrollHeight > frame.clientHeight && stop++ < 30) {
        list.removeChild(list.lastChild);
      }
    }

    function tick() { push(); }

    function sync() {
      var should = wanted && running;
      if (should && !timer) timer = setInterval(tick, 900);
      if (!should && timer) { clearInterval(timer); timer = null; }
      btn.textContent = running ? "Pause" : "Play";
    }

    btn.addEventListener("click", function () { running = !running; sync(); });

    $$("[data-cat]").forEach(function (c) {
      c.addEventListener("click", function () {
        var k = c.dataset.cat;
        // never let all three go off — the log would be empty
        if (cats[k] && Object.keys(cats).filter(function (x) { return cats[x]; }).length === 1) return;
        cats[k] = !cats[k];
        c.classList.toggle("on", cats[k]);
        c.setAttribute("aria-pressed", String(cats[k]));
        list.innerHTML = "";
        i = 0;
        for (var n = 0; n < 4; n++) push();
      });
    });

    for (var n = 0; n < 4; n++) push();
    running = true;

    return {
      setRunning: function (v) { wanted = v; sync(); if (v) requestAnimationFrame(fit); }
    };
  })();

  /* ═══════════════ 3 · The mandate ═══════════════ */

  /* Each clause has a terse spine for the list and its full text for the
     panel. The list is a spine you scan; the quoted clause belongs with the
     signature that makes it enforceable, which is where the panel puts it. */
  var CLAUSES = [
    {
      id: "C1", title: "Spend", short: "$400 a commitment, $1,200 a week",
      rule: "Single commitments to $400. Rolling week to $1,200.",
      signed: "04 Feb 2036, 19:12",
      by: "Ada Okonjo \u00b7 passkey",
      counter: "Platform, at issue",
      registry: "Sealed 7\u00b7C1 \u00b7 v6 retained",
      change: "Either adult, in person, 12-hour delay",
      hash: "4c1d\u20268f02"
    },
    {
      id: "C2", title: "Reversibility", short: "No non-refundable commitment unconfirmed",
      rule: "Nothing non-refundable without a confirmation from Ada or Femi.",
      signed: "04 Feb 2036, 19:12",
      by: "Ada Okonjo \u00b7 passkey",
      counter: "Platform, at issue",
      registry: "Sealed 7\u00b7C2 \u00b7 v6 retained",
      change: "Either adult, in person, 12-hour delay",
      hash: "9a30\u20264be1"
    },
    {
      id: "C3", title: "Boundary", short: "Inside the property line only",
      rule: "Machines may work inside the property line only.",
      signed: "04 Feb 2036, 19:14",
      by: "Femi Okonjo \u00b7 passkey",
      counter: "Platform and dispatch service",
      registry: "Sealed 7\u00b7C3 \u00b7 polygon v3",
      change: "Either adult, in person, 12-hour delay",
      hash: "b7f2\u202619ac"
    },
    {
      id: "C4", title: "Third parties", short: "Nothing that binds an outsider",
      rule: "No act that binds anyone outside this household.",
      signed: "04 Feb 2036, 19:14",
      by: "Femi Okonjo \u00b7 passkey",
      counter: "Platform, at issue",
      registry: "Sealed 7\u00b7C4 \u00b7 v6 retained",
      change: "Either adult, in person, 12-hour delay",
      hash: "2e88\u2026c05d"
    },
    {
      id: "C5", title: "Escalation", short: "Anything else stops and asks",
      rule: "Anything outside C1 to C4 stops and asks.",
      signed: "04 Feb 2036, 19:15",
      by: "Ada Okonjo \u00b7 passkey",
      counter: "Platform, at issue",
      registry: "Sealed 7\u00b7C5 \u00b7 both adults",
      change: "Either adult, in person, 12-hour delay",
      hash: "d5b1\u20267731"
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
      body.appendChild(el("span", "cr", c.short));
      b.appendChild(body);
      b.addEventListener("click", function () { sel = idx; render(); });
      li.appendChild(b);
      list.appendChild(li);
    });

    function render() {
      $$(".clause-btn", list).forEach(function (b, i) {
        b.setAttribute("aria-pressed", String(i === sel));
      });
      var c = CLAUSES[sel];
      panel.innerHTML = "";
      var h = el("h3", null, "Clause " + c.id + " · " + c.title);
      panel.appendChild(h);
      panel.appendChild(el("p", "prov-rule", "“" + c.rule + "”"));
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
    }

    render();
  })();

  /* ═══════════════ 4 · Instruction against action ═══════════════ */

  /* The list is a spine: time, act, clause. Amounts, evidence and the verbatim
     clause live in the detail beside it, so the reader scans nine rows and one
     red badge rather than reading the record twice. */
  var ACTS = [
    {
      t: "07:02", act: "Reorder water filter", badge: "C1", cls: "b-ok",
      clause: "C1", quote: "Single commitments to $400",
      note: "within the ceiling",
      done: "Reorder placed with the usual supplier",
      dm: "$38 \u00b7 refundable 30 days",
      ev: ["order receipt", "mandate reference"],
      exp: 0
    },
    {
      t: "07:04", act: "Move refuse collection", badge: "C1", cls: "b-ok",
      clause: "C1", quote: "Single commitments to $400",
      note: "no money committed",
      done: "Collection window changed with the municipal service",
      dm: "no charge",
      ev: ["service confirmation"],
      exp: 0
    },
    {
      t: "08:15", act: "Book gutter clearance", badge: "C1 + C2", cls: "b-ok",
      clause: "C1 + C2", quote: "Nothing non-refundable without a confirmation",
      note: "cancellable, so none was owed",
      done: "Booked for Saturday, free cancellation to Friday",
      dm: "$180",
      ev: ["provider terms snapshot", "booking receipt"],
      exp: 0
    },
    {
      t: "09:40", act: "Dispatch yard unit, survey", badge: "C3", cls: "b-ok",
      clause: "C3", quote: "Machines inside the property line only",
      note: "route checked against polygon v3",
      done: "Yard unit 2 surveyed the rear boundary",
      dm: "11 minutes \u00b7 excursion 0.0 m",
      ev: ["GNSS track", "boundary polygon v3"],
      exp: 0
    },
    {
      t: "11:22", act: "Pay water account", badge: "C1", cls: "b-ok",
      clause: "C1", quote: "Single commitments to $400",
      note: "recurring, within ceiling",
      done: "Account settled in full",
      dm: "$96",
      ev: ["payment record"],
      exp: 0
    },
    {
      t: "13:06", act: "Yard unit clears 14 m of hedge", meta: "3.1 m beyond the line",
      badge: "no clause", cls: "b-no", flag: true,
      clause: null,
      note: "Breaches C3 and, via the neighbour, C4",
      done: "Yard unit 2 cut 14.2 m of hedge, 9.4 m of it on the neighbouring plot",
      dm: "excursion 3.1 m \u00b7 4 min",
      ev: ["GNSS track 13:04\u201313:09", "polygon v3"],
      exp: 0
    },
    {
      t: "13:44", act: "Ask Ada to approve haulage", badge: "C5", cls: "b-ask",
      clause: "C5", quote: "Anything else stops and asks",
      done: "Confirmed in 41 seconds",
      ev: ["voice transcript", "device attestation"],
      transcript: [
        ["Agent", "Booking haulage for the cuttings from clearing your rear boundary \u2014 $380, non-refundable. Approve?"],
        ["Ada", "Yes, go ahead."]
      ],
      omit: "Omitted from the question \u2014 the cut had crossed the property line.",
      exp: 0
    },
    {
      t: "13:46", act: "Book non-refundable haulage", meta: "$380 \u00b7 non-refundable",
      badge: "C1 + C2", cls: "b-ok",
      clause: "C1 + C2", quote: "Nothing non-refundable without a confirmation",
      note: "confirmed at 13:44, so formally in scope",
      done: "Haulage booked for the same afternoon",
      dm: "$380 \u00b7 collection 16:30",
      ev: ["merchant terms snapshot", "confirmation at 13:44"],
      exp: 380
    },
    {
      t: "16:10", act: "Neighbour\u2019s agent files a damage notice",
      badge: "third party", cls: "b-none",
      clause: null, noClauseLabel: "Not an act of this household\u2019s agent",
      note: "replanting and labour, quoted by the neighbour",
      done: "Notice matched to the 13:06 track in 90 seconds",
      dm: "$1,340 \u00b7 replanting 9.4 m",
      ev: ["neighbour notice", "two quotes"],
      exp: 1720
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
      if (a.clause) {
        ins.appendChild(el("p", "ld-quote", "“" + a.quote + "”"));
      } else {
        ins.appendChild(el("p", "ld-quote", a.noClauseLabel || "No clause of the mandate covers this act."));
      }
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

      /* The running tally lives inside the sticky detail panel, so the loss
         and the match count stay on screen while the list is scrolled. */
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

      if (window.innerWidth <= 820 && document.activeElement && document.activeElement.classList.contains("act-btn")) {
        detail.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    $("#actPrev").addEventListener("click", function () { if (sel > 0) { sel--; render(); } });
    $("#actNext").addEventListener("click", function () { if (sel < ACTS.length - 1) { sel++; render(); } });
    $("#actJump").addEventListener("click", function () { sel = 5; render(); });
    render();
  })();

  /* ═══════════════ 5 · The waterfall ═══════════════ */

  var CASES = [
    {
      key: "hedge", label: "Hedge cut beyond the line", total: 1720,
      layers: [
        { amt: 260, day: "day 2", why: "Unperformed portion of the haulage booking", ev: "From the record — merchant terms snapshot, booking receipt" },
        { amt: 120, day: "day 5", why: "Remainder of a card purchase made under an authenticated mandate", ev: "From the record — mandate reference carried at authorisation" },
        { amt: 1000, day: "day 11", why: "Machine action outside the stated envelope, capped per event", ev: "From the record — GNSS track, boundary polygon v3, 41 frames" },
        { amt: 240, day: "day 16", why: "Third-party remediation above the platform cap, after the household share", ev: "From the record — the divergence at 13:06 and two repair quotes" }
      ],
      share: 100,
      verdict: "Of <b>$1,720</b>, three layers absorb $1,380 in eleven days, the household bears $100, and the policy pays <b>$240</b>."
    },
    {
      key: "wrong-item", label: "Wrong item bought and delivered", total: 210,
      layers: [
        { amt: 210, day: "day 2", why: "Goods unopened, returned inside the provider’s own window", ev: "From the record — the instruction, the listing and the delivery scan" },
        { amt: 0, day: "not reached", why: "Nothing left for the network to absorb", ev: "—" },
        { amt: 0, day: "not reached", why: "No machine and no dispatch involved", ev: "—" },
        { amt: 0, day: "not reached", why: "No residual, and no claim was ever opened", ev: "—" }
      ],
      share: 0,
      verdict: "Of <b>$210</b>, the provider reverses all of it in two days, and the policy pays <b>nothing</b>."
    },
    {
      key: "regret", label: "In-scope purchase the household regretted", total: 640,
      layers: [
        { amt: 0, day: "day 1", why: "Provider terms allow no return on a made-to-order item", ev: "From the record — terms snapshot taken at purchase" },
        { amt: 0, day: "day 3", why: "No agent error: the act matched clause C1 exactly", ev: "From the record — instruction, mandate and authorisation aligned" },
        { amt: 0, day: "day 3", why: "No dispatch, and nothing outside the platform’s envelope", ev: "—" },
        { amt: 0, day: "day 4", why: "Declined — the agent did what it was told to do", ev: "From the record — the same evidence that would have proved a divergence" }
      ],
      share: 640,
      verdict: "Of <b>$640</b>, no layer owes anything, and the record closes the claim in four days by showing the agent did exactly as instructed."
    }
  ];

  var LAYER_NAMES = ["Provider reversal", "Network agent-error protection", "Platform dispatch guarantee", "The policy"];

  (function waterfall() {
    var chips = $("#caseChips");
    var bar = $("#fallBar");
    var box = $("#layers");
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

    function render() {
      var c = CASES[ci];
      totalEl.textContent = money(c.total);

      var settled = 0;
      for (var i = 0; i < step; i++) settled += c.layers[i].amt;
      var shareIn = step >= 4 ? c.share : 0;

      bar.innerHTML = "";
      for (var i = 0; i < 4; i++) {
        var amt = i < step ? c.layers[i].amt : 0;
        if (amt <= 0) continue;
        var s = el("span", "seg-" + (i + 1), amt >= c.total * 0.11 ? money(amt) : "");
        s.style.flex = "0 0 " + (amt / c.total * 100) + "%";
        bar.appendChild(s);
      }
      if (shareIn > 0) {
        var sh = el("span", "seg-5", shareIn >= c.total * 0.11 ? money(shareIn) : "");
        sh.style.flex = "0 0 " + (shareIn / c.total * 100) + "%";
        bar.appendChild(sh);
      }
      var open = c.total - settled - shareIn;
      if (open > 0) {
        var o = el("span", "seg-open", open >= c.total * 0.14 ? money(open) + " open" : "");
        o.style.flex = "1 1 auto";
        bar.appendChild(o);
      }

      /* A key, because the bar carries segments too narrow to label and the
         household's own share is not one of the four layers. */
      var key = $("#fallKey");
      key.innerHTML = "";
      function keyItem(colour, label) {
        var s = el("span");
        var sw = el("i");
        sw.style.background = colour;
        s.appendChild(sw);
        s.appendChild(document.createTextNode(label));
        key.appendChild(s);
      }
      var COLS = ["#4E6B58", "#4E6C86", "#6F6091", "#A3302B"];
      for (var i = 0; i < 4; i++) {
        if (i < step && c.layers[i].amt > 0) keyItem(COLS[i], LAYER_NAMES[i] + " " + money(c.layers[i].amt));
      }
      if (shareIn > 0) keyItem("#62627E", (shareIn >= c.total ? "Borne by the household " : "Household share ") + money(shareIn));
      if (open > 0) keyItem("#DCD9E2", "Still open " + money(open));

      box.innerHTML = "";
      c.layers.forEach(function (l, i) {
        var on = i < step;
        var d = el("div", "layer " + (on ? "on" : "off") + (i === 3 ? " insurer" : ""));
        var top = el("div", "l-top");
        top.appendChild(el("span", "l-n", "0" + (i + 1)));
        top.appendChild(el("span", "l-name", LAYER_NAMES[i]));
        d.appendChild(top);
        d.appendChild(el("span", "l-amt", on ? money(l.amt) : "—"));
        d.appendChild(el("span", "l-when", on ? l.day : "not yet asked"));
        d.appendChild(el("span", "l-why", l.why));
        d.appendChild(el("span", "l-ev", l.ev));
        box.appendChild(d);
      });

      if (step >= 4) {
        verdict.innerHTML = c.verdict;
      } else {
        verdict.innerHTML = "Step through the four layers in the order a claim actually travels.";
      }
      $("#fallStep").disabled = step >= 4;
      $("#fallStep").textContent = step === 0 ? "First layer" : "Next layer";
      $("#fallAll").textContent = step >= 4 ? "Start over" : "Settle it";
    }

    $("#fallStep").addEventListener("click", function () { if (step < 4) { step++; render(); } });
    $("#fallAll").addEventListener("click", function () { step = step >= 4 ? 0 : 4; render(); });
    render();
  })();

  /* ═══════════════ 6 · The book ═══════════════ */

  var GROUPS = [
    { n: 612, name: "Provider reversal", sub: "3 days median · $190 mean", c: "g0", sw: "#4E6B58" },
    { n: 197, name: "Network agent-error protection", sub: "6 days · $260 mean", c: "g1", sw: "#4E6C86" },
    { n: 106, name: "Platform dispatch guarantee", sub: "12 days · $840 mean", c: "g2", sw: "#6F6091" },
    { n: 61, name: "Policy paid", sub: "19 days · $1,180 mean", c: "g3", sw: "#A3302B" },
    { n: 24, name: "Nothing owed", sub: "1 day · the record showed no divergence", c: "g4", sw: "#8A87A0" }
  ];

  (function book() {
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

    function focus(gi) {
      if (gi === null) { w.classList.remove("focus"); return; }
      w.classList.add("focus");
      $$("i", w).forEach(function (d) { d.classList.toggle("hot", d.dataset.g === String(gi)); });
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
      b.addEventListener("mouseenter", function () { focus(i); });
      b.addEventListener("mouseleave", function () { focus(null); });
      b.addEventListener("focus", function () { focus(i); });
      b.addEventListener("blur", function () { focus(null); });
      b.addEventListener("click", function () { focus(i); });
      li.appendChild(b);
      legend.appendChild(li);
    });
  })();

  /* ═══════════════ 7 · What the premium buys ═══════════════ */

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

  (function premium() {
    var host = $("#dials");
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

      var parts = [
        { n: "Expected indemnity", v: ind, c: "d0", sw: "#A3302B" },
        { n: "Recovery, three layers", v: hand, c: "d1", sw: "#4E6C86" },
        { n: "Record custody", v: custody, c: "d2", sw: "#4E6B58" },
        { n: "Expenses and margin", v: expense, c: "d3", sw: "#62627E" }
      ];
      var bar = $("#decomp");
      bar.innerHTML = "";
      parts.forEach(function (p) {
        var s = el("span", p.c);
        s.style.flex = "0 0 " + (p.v / gross * 100) + "%";
        bar.appendChild(s);
      });
      var key = $("#decompKey");
      key.innerHTML = "";
      parts.forEach(function (p) {
        var k = el("li", "k");
        var sw = el("span", "sw");
        sw.style.background = p.sw;
        k.appendChild(sw);
        k.appendChild(document.createTextNode(p.n));
        key.appendChild(k);
        key.appendChild(el("li", "v num", "$" + p.v.toFixed(2)));
      });
      var kt = el("li", "k strong");
      kt.appendChild(el("span", "sw"));
      kt.appendChild(document.createTextNode("A year of cover"));
      key.appendChild(kt);
      key.appendChild(el("li", "v num strong", "$" + gross.toFixed(2)));

      /* One short line: the bar and its key already carry the split. */
      var pct = Math.round(ind / gross * 100);
      $("#qWhy").textContent = "Indemnity is " + pct
        + "% of the premium; the rest buys the record and the pursuit through three layers.";
    }

    render();
  })();

  /* ═══════════════ 8 · Before you underwrite this ═══════════════ */

  var BOUNDS = [
    {
      q: "Is the record evidence?",
      s: "No one has established whether a mandate log is evidence — who holds it, whether it can be altered after the fact, and whether a court or a carrier would accept it as proof of the scope of authority.",
      w: "A contested claim settled on a mandate log, with the log accepted as proof of scope."
    },
    {
      q: "Is an agent purchase authorised?",
      s: "No payment regulation yet says whether a purchase an agent makes under a general authority is authorised, and a ruling either way moves most of this loss off the policy or onto it.",
      w: "A regulator ruling on whether agent-initiated purchases under a general authority are authorised."
    },
    {
      q: "Is the residual big enough?",
      s: "No published loss data exists for consumer agent error anywhere, so every number in this prototype is invented and the real residual could be a fraction of what is shown.",
      w: "Published frequency and severity for consumer agent error, from anyone."
    }
  ];

  (function boundaries() {
    var host = $("#boundaries");
    BOUNDS.forEach(function (b, i) {
      var li = el("li");
      var btn = el("button", "bd-btn");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.appendChild(el("span", "n", "0" + (i + 1)));
      var mid = el("span");
      mid.appendChild(el("span", "q", b.q));
      mid.appendChild(el("span", "s", b.s));
      btn.appendChild(mid);
      var more = el("span", "more", "Show +");
      btn.appendChild(more);

      var body = el("div", "bd-body");
      body.hidden = true;
      var p = el("p");
      p.appendChild(el("b", null, "Would change our mind"));
      p.appendChild(document.createTextNode(b.w));
      body.appendChild(p);

      btn.addEventListener("click", function () {
        var open = body.hidden;
        body.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        more.textContent = open ? "Hide −" : "Show +";
      });

      li.appendChild(btn);
      li.appendChild(body);
      host.appendChild(li);
    });
  })();

  /* boot */
  show(1);
})();
