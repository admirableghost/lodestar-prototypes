/* ══════════════════════════════════════════════════════════════════════════
   Backed to Act · acting inside an assistant's workspace
   No framework, no build step, no external request. Three files.

   The navigation, the camera, the hash router, the live regions and the
   skip-to-heading behaviour are inherited from prototype/resilience-grid.
   What is this prototype's own is the ground it draws, ONE table — LAYOUT —
   that says where the line stands for each level of authority, ONE
   collection — ORDERS — the four orders of the approved day that every
   count, total and row on screens 1, 4 and 5 is derived from, and ONE
   state object — S — that every screen renders from.

   STATE   S = { mode, choice }   kept in sessionStorage
     S.mode     "none" | "bounded" — set ONLY by #authorise ("bounded") and
                #draft-only ("none") on screen 3. Default "none". Moving
                forward never authorises; a deep link to screen 4 without
                a decision shows the draft-only day. Restart (Next from the
                last screen) clears it.
     S.choice   screen 5: keep | narrow | expand | null. Future authority
                only; nothing on screen 4 reads it.
   There is no simulation control.

   WHAT IS INVENTED
   All of it. Halden, Calder Supply Co., the agent, every order, the limit,
   the cover and the arrangement are invented. No real AI provider, customer
   or insurer is described, and no premium, share or limit is modelled.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var W = 1600, H = 1000;
  var CONSOLE = "#1E242B", LINE = "#3C4650", LINE2 = "#5A6773";

  var svg = document.getElementById("field");
  var vb = null, camTimer = 0;

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* deterministic, so the field draws identically every time */
  function rng(seed) {
    var s = seed;
    return function () { s = (s * 1103515245 + 12345) % 2147483648; return (s % 10000) / 10000; };
  }

  /* the activity trace — the agent's work, as one quiet line */
  var TRACE = (function () {
    var r = rng(8311), pts = [], x;
    for (x = -120; x <= W + 120; x += 64) {
      pts.push([x, 742 + Math.sin(x / 190) * 52 + (r() - 0.5) * 48]);
    }
    return pts;
  })();

  function smooth(pts) {
    var d = "M" + pts[0][0] + " " + pts[0][1].toFixed(1), i, p, c, mx, my;
    for (i = 1; i < pts.length; i++) {
      p = pts[i - 1]; c = pts[i];
      mx = (p[0] + c[0]) / 2; my = (p[1] + c[1]) / 2;
      d += "Q" + p[0] + " " + p[1].toFixed(1) + " " + mx + " " + my.toFixed(1);
    }
    return d + "L" + pts[pts.length - 1][0] + " " + pts[pts.length - 1][1].toFixed(1);
  }

  /* ── THE GROUND · drawn once ─────────────────────────────────────────── */
  function renderField() {
    var s = [];
    s.push('<defs>' +
      '<pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">' +
        '<circle cx="1.4" cy="1.4" r="1.4" fill="' + LINE + '"/></pattern>' +
      '<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + CONSOLE + '" stop-opacity="0"/>' +
        '<stop offset="1" stop-color="#171C22" stop-opacity=".9"/></linearGradient>' +
      "</defs>");
    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="' + CONSOLE + '"/>');
    s.push('<rect x="-400" y="-400" width="' + (W + 800) + '" height="' + (H + 800) + '" fill="url(#dots)" opacity=".85"/>');
    for (var vx = 0; vx <= W; vx += 200) {
      s.push('<line x1="' + vx + '" y1="-400" x2="' + vx + '" y2="' + (H + 400) + '" stroke="' + LINE + '" stroke-width="1" opacity=".55"/>');
    }
    s.push('<path d="' + smooth(TRACE) + '" fill="none" stroke="' + LINE2 + '" stroke-width="1.8" opacity=".5"/>');
    s.push('<rect x="-400" y="900" width="' + (W + 800) + '" height="700" fill="url(#fade)"/>');
    svg.innerHTML = s.join("");
  }
  renderField();

  /* ── CAMERA (inherited) ──────────────────────────────────────────────── */
  var CAM = {
    queue:    { x: 60,  y: 380, w: 1180, h: 600 },
    boundary: { x: 120, y: 240, w: 1360, h: 700 },
    run:      { x: 180, y: 200, w: 1340, h: 680 }
  };
  var CAM_N = {
    queue:    { x: 80,  y: 560, w: 1100, h: 420 },
    boundary: { x: 200, y: 300, w: 1200, h: 520 },
    run:      { x: 240, y: 240, w: 1200, h: 520 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }

  function setVB(c) {
    svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h);
    vb = c;
  }
  function viewBoxFor(view) {
    var el = document.getElementById("world").getBoundingClientRect();
    var scale = Math.min(window.innerWidth / view.w, window.innerHeight / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2, wcy = view.y + view.h / 2;
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }
  function moveCamera(name, instant) {
    var cam = (narrow && CAM_N[name]) || CAM[name] || CAM.boundary;
    var target = viewBoxFor(cam);
    if (!vb || instant || reduced()) { setVB(target); return; }
    var from = vb, t0 = performance.now(), DUR = 540;
    cancelAnimationFrame(camTimer);
    (function step(now) {
      var u = Math.min(1, (now - t0) / DUR);
      var e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      setVB({
        x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e
      });
      if (u < 1) { camTimer = requestAnimationFrame(step); }
    })(t0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     PERMISSION AS POSITION — ONE TABLE, TWO LEVELS

     Two ideas kept deliberately separate:
       PERMISSION — what the customer lets the agent do.
       COVER      — the named mistakes the policy pays for inside that.
     Authorising an action does not insure it, and buying cover authorises
     nothing on its own. "place" (placing the order) is the one action that
     changes side; "newsup" (a new supplier, over the limit) never does.
     ══════════════════════════════════════════════════════════════════════ */
  var LAYOUT = {
    none:    { may: ["compare", "draft", "recommend"],          ask: ["place", "newsup"] },
    bounded: { may: ["compare", "draft", "recommend", "place"], ask: ["newsup"] }
  };
  var LEVELS = ["none", "bounded"];   /* in order of authority */

  function stepDown(level) {
    var i = LEVELS.indexOf(level);
    return LEVELS[Math.max(0, i - 1)];
  }

  /* ══════════════════════════════════════════════════════════════════════
     THE ORDERS — ONE COLLECTION, THE APPROVED DAY

     The four orders the agent drafted on the request. Screen 1 lists them
     as drafts; screen 4 reads what became of each under the authority set
     on screen 3; screen 5 sums the day. Nothing about them is written
     anywhere else: every count and every total is derived here.
       supplier  "approved" — a stocked part from an approved supplier
                 "single"   — a single source, not an approved supplier
       remedy    the one covered mistake, attached to the order it remedied
                 (its 6,240 USD restocking and freight stays in the notes)
     ══════════════════════════════════════════════════════════════════════ */
  var LIMIT = 25000;   /* USD per order — the figure on the authorisation card */
  var ORDERS = [
    { id: "PO-4471", item: "Copper fittings",      branch: "Branch 7",   amount: 8420,  supplier: "approved" },
    { id: "PO-4472", item: "Condenser fan motors", branch: "3 branches", amount: 14960, supplier: "approved" },
    { id: "PO-4473", item: "Valve bodies",         branch: "Branch 2",   amount: 9750,  supplier: "approved",
      remedy: { kind: "covered mistake", what: "wrong valve body", done: "restocking paid" } },
    { id: "PO-4475", item: "Control boards",       branch: null,         amount: 31500, supplier: "single",
      why: "single source, over the limit" }
  ];

  /* What placing this order asks of the authority: "place" for a stocked
     part from an approved supplier within the limit; "newsup" — always a
     person — for a new or single source, or anything over the limit. */
  function action(o) {
    return (o.supplier !== "approved" || o.amount > LIMIT) ? "newsup" : "place";
  }

  /* placed    the agent placed it inside its authority
     returned  the agent acted that day but this one was outside; it came
               back for approval
     waiting   the agent only drafts; the order waits for approval */
  function evaluate(o, mode) {
    var plan = LAYOUT[mode] || LAYOUT.none;
    if (plan.may.indexOf(action(o)) >= 0) { return "placed"; }
    return plan.may.indexOf("place") >= 0 ? "returned" : "waiting";
  }

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  var WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  function word(n, lower) { var w = WORDS[n] || String(n); return lower ? w.toLowerCase() : w; }
  function sum(list) { return list.reduce(function (a, o) { return a + o.amount; }, 0); }
  function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  /* the day under a mode, grouped by outcome — the one read every screen shares */
  function day(mode) {
    var d = { placed: [], returned: [], waiting: [] };
    ORDERS.forEach(function (o) { d[evaluate(o, mode)].push(o); });
    d.remedied = d.placed.filter(function (o) { return !!o.remedy; });
    d.awaiting = d.returned.concat(d.waiting);
    return d;
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ── THE ONE STATE, kept across reloads in sessionStorage ─────────────
     S.mode is written by #authorise / #draft-only and by restart, nowhere
     else. "decided" records that one of the two buttons has been pressed,
     so the ● survives a reload but is never shown on a fresh visit. */
  var KEY_MODE = "bta-mode", KEY_CHOICE = "bta-choice";
  var S = { screen: 1, mode: "none", decided: false, choice: null };

  function load() {
    var m = null, c = null;
    try { m = sessionStorage.getItem(KEY_MODE); c = sessionStorage.getItem(KEY_CHOICE); } catch (e) { /* storage off */ }
    S.decided = m === "bounded" || m === "none";
    S.mode = m === "bounded" ? "bounded" : "none";
    S.choice = (c === "keep" || c === "narrow" || c === "expand") ? c : null;
  }
  function save() {
    try {
      if (S.decided) { sessionStorage.setItem(KEY_MODE, S.mode); } else { sessionStorage.removeItem(KEY_MODE); }
      if (S.choice) { sessionStorage.setItem(KEY_CHOICE, S.choice); } else { sessionStorage.removeItem(KEY_CHOICE); }
    } catch (e) { /* storage off: the state still lives for this page */ }
  }

  /* A band reads the line's position from LAYOUT: the level whose "may"
     list matches is written to data-level, and the CSS puts the line there.
     The paper never moves; the line does. */
  function setBand(id, level, opts) {
    var band = document.getElementById(id);
    if (!band) { return; }
    opts = opts || {};
    var plan = LAYOUT[level] || LAYOUT.none;
    band.dataset.level = LAYOUT[level] ? level : "none";
    band.dataset.may = plan.may.join(" ");
    if (opts.prop) { band.dataset.prop = opts.prop; } else { delete band.dataset.prop; }
    if (opts.ghost) { band.dataset.ghost = opts.ghost; } else { delete band.dataset.ghost; }
  }

  /* one polite live region for state changes that are not screen changes */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  function headline(h, a, b) {
    var sp = h ? h.querySelectorAll("span") : [];
    if (sp.length === 2) { sp[0].textContent = a; sp[1].textContent = b; }
  }

  /* ── SCREEN 1 · the drafted work ────────────────────────────────────
     Every order is a draft here, whatever the authority: the reply and
     the rows are the collection, counted and summed. Rendered once. */
  var s1Reply = document.getElementById("s1-reply");
  var s1Rows = document.getElementById("s1-rows");
  function renderS1() {
    if (s1Reply) {
      s1Reply.textContent = word(ORDERS.length) + " orders drafted · " + fmt(sum(ORDERS)) + " USD. Placing them needs your authorisation.";
    }
    if (s1Rows) {
      s1Rows.innerHTML = ORDERS.map(function (o) {
        return '<li data-order="' + esc(o.id) + '"><span class="what">' + esc(o.item) + '</span><span class="amt">' + fmt(o.amount) + ' USD</span></li>';
      }).join("");
    }
  }

  /* ── SCREEN 3 · the customer authorises ──────────────────────────────
     The card carries data-decided ("" | "bounded" | "none") so the CSS can
     keep Authorise as the primary control until Keep draft-only is the
     pressed one. Nothing here sets S.mode. */
  var btnAuth = document.getElementById("authorise");
  var btnDraft = document.getElementById("draft-only");
  var authCard = document.getElementById("auth-card");
  function renderS3() {
    var on = S.mode === "bounded";
    setBand("band3", S.mode, { ghost: (on && S.decided) ? "none" : null });
    if (btnAuth)  { btnAuth.setAttribute("aria-pressed",  String(S.decided && on)); }
    if (btnDraft) { btnDraft.setAttribute("aria-pressed", String(S.decided && !on)); }
    if (authCard) { authCard.dataset.decided = S.decided ? S.mode : ""; }
  }
  function setMode(on) {
    S.mode = on ? "bounded" : "none";
    S.decided = true;
    save();
    renderS3(); renderS4(); renderS5();
    say(on ? "Authorised within these limits. The agent may place orders for stocked parts from approved suppliers, up to " + fmt(LIMIT) + " USD per order and 180,000 weekly. A new supplier or anything over the limit always comes to you."
           : "Draft only. The agent drafts; placing any order waits for your approval.");
  }
  if (btnAuth)  { btnAuth.addEventListener("click",  function () { setMode(true); }); }
  if (btnDraft) { btnDraft.addEventListener("click", function () { setMode(false); }); }

  /* ── SCREEN 4 · the day that follows ────────────────────────────────
     Derived from ORDERS under S.mode and nothing else. Authorised: the
     covered mistake is the hero — the cover's slip, its own paper between
     the placed rows and the returned row, tied to the order it remedied
     by data-order; the placed rows and the returned row are quiet
     evidence (the unit lives on the totals line); one totals line. Draft
     only shows the day as it really would be: nothing placed, every order
     waiting, one way back to the decision. */
  var s4h = document.getElementById("s4-h");
  var dayAuth = document.getElementById("day-auth");
  var dayDraft = document.getElementById("day-draft");
  var dayRows = document.getElementById("day-rows");
  var daySlip = document.getElementById("day-slip");
  var dayAsk = document.getElementById("day-ask");
  var daySum = document.getElementById("day-sum");
  var dayWait = document.getElementById("day-wait");
  var toAuth = document.getElementById("to-authorise");

  function doneRow(o, st) {
    var ok = st === "placed";
    var h = '<li class="done-row ' + (ok ? "done-row--ok" : "done-row--ask") + '" data-order="' + esc(o.id) + '">' +
      '<span class="st">' + (ok ? "Placed" : "Returned") + '</span>' +
      '<span class="what">' + esc(lc(o.item)) + '</span>' +
      '<span class="amt">' + fmt(o.amount) + '</span>';
    if (!ok && o.why) { h += '<span class="why">' + esc(o.why) + '</span>'; }
    return h + "</li>";
  }

  /* the slip: kind, what, done — and the check mark */
  function slipHTML(o) {
    return '<b>' + esc(o.remedy.kind) + ':</b> ' + esc(o.remedy.what) + ', ' + esc(o.remedy.done) +
      '<svg class="tick tick--slip" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5L20 7" fill="none" stroke="#2E7D5B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* the reveal: 400ms slide/scale when screen 4 opens on the authorised
     day; restarted on every open; instant under reduced motion (the CSS
     cancels the animation). Nothing but the class is touched. */
  function revealSlip() {
    if (!daySlip || daySlip.hidden) { return; }
    daySlip.classList.remove("slip--in");
    void daySlip.offsetWidth;
    daySlip.classList.add("slip--in");
  }

  function renderS4() {
    var real = S.mode === "bounded";
    var d = day(S.mode);
    if (dayAuth)  { dayAuth.hidden = !real; }
    if (dayDraft) { dayDraft.hidden = real; }
    if (real) {
      /* the headline carries the benefit: the placed orders went out
         without a buyer. The slip says the mistake was covered; the
         Returned row says the exception came back. No separate line. */
      headline(s4h, word(d.placed.length) + " orders placed without a buyer.", word(d.returned.length) + " needed you.");
      if (dayRows) { dayRows.innerHTML = d.placed.map(function (o) { return doneRow(o, "placed"); }).join(""); }
      if (daySlip) {
        var r = d.remedied[0];
        daySlip.hidden = !r;
        if (r) { daySlip.innerHTML = slipHTML(r); daySlip.dataset.order = r.id; } else { delete daySlip.dataset.order; }
      }
      if (dayAsk)  { dayAsk.innerHTML = d.returned.map(function (o) { return doneRow(o, "returned"); }).join(""); dayAsk.hidden = !d.returned.length; }
      if (daySum)  { daySum.innerHTML = 'Placed <b>' + fmt(sum(d.placed)) + ' USD</b> · awaiting your approval <b>' + fmt(sum(d.awaiting)) + ' USD</b>'; }
    } else {
      headline(s4h, "Nothing placed.", "Everything waits for you.");
      if (dayWait) {
        dayWait.setAttribute("data-orders", d.waiting.map(function (o) { return o.id; }).join(" "));
        dayWait.innerHTML = '<span class="st">' + word(d.waiting.length) + ' orders drafted</span>' +
          '<span class="amt">' + fmt(sum(d.waiting)) + ' USD</span><span class="why">awaiting your approval</span>';
      }
    }
  }
  if (toAuth) { toAuth.addEventListener("click", function () { show(3); }); }

  /* ── SCREEN 5 · the next boundary ────────────────────────────────────
     A forward preference, relative to the authority set on screen 3. It
     never edits the day that already happened. An expansion is PROPOSED,
     not granted — granting it would need an approval and a protection
     review — so it is drawn hatched and never reaches the exception. */
  var decSaid = document.getElementById("dec-said");
  var ctx = document.getElementById("s5-ctx");
  var DEC = {
    keep:   { step: 0,  prop: false,
      t: { bounded: "Keep. The line stays where you set it: placing orders stays with the agent; a new supplier over the limit still comes to you.",
           none:    "Keep. The line stays where you set it: the agent drafts; placing orders stays with you." } },
    narrow: { step: -1, prop: false,
      t: { bounded: "Narrow. The line moves back: placing orders returns to you. Today's orders are unchanged — this is about what happens next.",
           none:    "Narrow. Already draft only: there is nothing further to withdraw. Today's results stand." } },
    expand: { step: 0,  prop: true,
      t: { bounded: "Expand. Proposed expansion, hatched: not in force. Approval and protection review required. The new supplier over the limit stays with you.",
           none:    "Expand. Proposed expansion, hatched: placing orders within cover. Not in force. Approval and protection review required." } }
  };
  function renderS5() {
    var base = S.mode, d = S.choice ? DEC[S.choice] : null;
    var level = base, opts = {};
    if (d && d.step < 0) { level = stepDown(base); if (level !== base) { opts.ghost = base; } }
    if (d && d.prop)     { opts.prop = base === "bounded" ? "sliver" : "bounded"; }
    setBand("band5", level, opts);
    var band = document.getElementById("band5");
    if (band) { band.dataset.decided = S.choice || ""; }
    Array.prototype.forEach.call(document.querySelectorAll(".acts--dec [data-choice]"), function (o) {
      o.setAttribute("aria-pressed", String(o.dataset.choice === S.choice));
    });
    if (decSaid) { decSaid.hidden = !(d && d.prop); }
    if (ctx) {
      var d = day(base);
      ctx.textContent = base === "bounded"
        ? "Today: " + word(d.placed.length, true) + " placed, " + word(d.remedied.length, true) + " covered mistake, " + word(d.returned.length, true) + " returned."
        : "Today: nothing placed. " + word(d.waiting.length) + " orders waited.";
    }
  }
  function decide(k) {
    S.choice = DEC[k] ? k : null;
    save();
    renderS5();
    if (S.choice) { say(DEC[S.choice].t[S.mode]); }
  }
  Array.prototype.forEach.call(document.querySelectorAll(".acts--dec [data-choice]"), function (b) {
    b.addEventListener("click", function () { decide(b.dataset.choice); });
  });

  /* restart: the world before the grant. Called only from the last
     screen's Next ("Back to the start"), never by ordinary navigation. */
  function reset() {
    S.mode = "none"; S.decided = false; S.choice = null;
    save();
    renderS3(); renderS4(); renderS5();
  }

  load();
  renderS1(); renderS3(); renderS4(); renderS5();

  /* ══ NAVIGATION (inherited) ═════════════════════════════════════════ */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var announce = document.getElementById("announce");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var nextLabel = document.getElementById("next-label");
  var current = 1;

  var CTA = ["The arrangement", "Authorise", "See it act", "What next", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n; S.screen = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];
    nextBtn.classList.toggle("cta--quiet", n === total);
    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    /* every screen renders from S as it stands — moving never authorises */
    renderS3(); renderS4(); renderS5();
    if (n === 4) { revealSlip(); }

    moveCamera(sc.dataset.cam);

    var h = sc.querySelector(".xd");
    var spans = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (spans.length ? Array.prototype.map.call(spans, function (x) { return x.textContent.trim(); }).join(" ") : h.textContent)
      : sc.dataset.label;
    var extra = "";
    if (n === 3 && S.decided) { extra = S.mode === "bounded" ? " Chosen: authorised within these limits." : " Chosen: draft only."; }
    if (n === 4) { extra = S.mode === "bounded" ? " Authority: within the limits you set." : " Authority: draft only."; }
    if (n === 5) { extra = S.mode === "bounded" ? " Today's authority: within the limits you set." : " Today's authority: draft only."; }
    announce.textContent = "Screen " + n + " of " + total + ". " + said.replace(/\s+/g, " ").trim() + extra;

    /* focus must never be left inside a hidden screen */
    var ae = document.activeElement;
    if (ae && ae.closest && ae.closest(".screen") && ae.closest(".screen") !== sc && h) { h.focus(); }

    if (push !== false) {
      try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ }
    }
  }

  /* forward from the last screen is the restart */
  function forward() {
    if (current === total) { reset(); }
    show(current + 1);
  }

  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", forward);
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button") { return; }
    if (e.key === "ArrowRight") { forward(); }
    if (e.key === "ArrowLeft") { show(current - 1); }
  });

  /* ══ BOOT ═══════════════════════════════════════════════════════════ */
  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
      narrow = isNarrow();
      moveCamera(screens[current - 1].dataset.cam, true);
    }, 140);
  });

  /* skip button: focus the open screen's heading without touching the hash */
  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[current - 1];
      var h = sc && sc.querySelector(".xd");
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

  narrow = isNarrow();
  show(fromHash() || 1, false);
  moveCamera(screens[current - 1].dataset.cam, true);

  /* read-only view of the state and the collection, for QA scripts */
  window.BTA = {
    state: function () { return { screen: S.screen, mode: S.mode, decided: S.decided, choice: S.choice }; },
    orders: function () { return JSON.parse(JSON.stringify(ORDERS)); },
    evaluate: function (id, mode) { var o = ORDERS.filter(function (x) { return x.id === id; })[0]; return o ? evaluate(o, mode) : null; }
  };
})();
