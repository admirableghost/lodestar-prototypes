/* ══════════════════════════════════════════════════════════════════════════
   OpenCover · the buyer never stops working
   No framework, no build step, no external request. Three files.

   Built to design-study/brief-align/CONTRACT-IMPL.md § A (the shared agent
   grammar) and § B (OpenCover: copy, controls, state, visuals), with
   EXPERIENCE-STORYBOARD.md § 01 for intent.

   THE GRAMMAR, IN CODE
   HER paper is warm; her words are first person; her authority is the
   signature dash drawn on #rules-accept. MUSE is the dark plate, the lens
   at the head of a plum thread, speaking in short bubbles. The PROVIDER is
   a ledger-blue record with ruled fields and a seal when it confirms.

   THE ONE RULE THAT CANNOT BEND
   The purchase happens ONLY on screen 3, as Muse's own sequenced steps,
   when permitted(): Meridian eligible AND 155 ≤ delta AND signed. No
   human control buys. Next never consents. Screens 4 and 5 read only the
   snapshot, which a later edit of the allowance never changes.

   The navigation, the camera, the per-screen --fit search and the pin
   projection below the PAINT section are inherited from the earlier build.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════
     ONE SOURCE OF TRUTH — the three shortlisted offers. Eligibility is a
     hard filter drawn from her rules; nothing is scored.
     ══════════════════════════════════════════════════════════════════════ */
  var OC = [
    { id: "meridian", name: "Meridian Mutual", num: 1340, excessNum: 450,
      settleDays: 5, remedyPerDay: 50, eligible: true, bar: null },
    { id: "candlewick", name: "Candlewick Direct", num: 1185, excessNum: 500,
      settleDays: null, remedyPerDay: null, eligible: false,
      bar: "excludes drivers under 25 — Rosa is nineteen" },
    { id: "pell", name: "Pell & Roe", num: 1420, excessNum: 900,
      settleDays: 10, remedyPerDay: 20, eligible: false,
      bar: "excess 900 USD, above her 500 cap" }
  ];

  /* the one claim of the year, checked against what the policy promised:
     promised and observed are working days counted from AGREED LIABILITY */
  var LEDGER = { key: "settlement.days", observed: 9 };

  /* ══════════════════════════════════════════════════════════════════════
     STATE  S = { delta: 200|100, signed, purchase: null|snapshot, month, claim }
       delta    · her switching allowance, set on screen 1; editable after
                  signing; a later edit never touches the snapshot.
       signed   · set by #rules-accept only.
       purchase · null until Muse buys on screen 3; then a SNAPSHOT of the
                  offer — name and terms COPIED at that moment.
       month    · the month screen 4 shows (1–12; 0 = not yet shown).
       claim    · null until #claim on screen 5; then { agreed, settled }.
     All of it survives a reload (sessionStorage oc-s as JSON). Restarting
     from screen 5 clears it. The only writer of S.purchase is buy().
     ══════════════════════════════════════════════════════════════════════ */
  var S = { delta: 200, signed: false, purchase: null, month: 0, claim: null };

  function snapshotOf(raw) {
    if (!raw || typeof raw !== "object") { return null; }
    var ok = typeof raw.id === "string" && typeof raw.name === "string" && raw.name &&
             typeof raw.premium === "number" && typeof raw.excess === "number" &&
             typeof raw.settleDays === "number" && typeof raw.remedyPerDay === "number" &&
             typeof raw.within === "number";
    return ok ? { id: raw.id, name: raw.name, premium: raw.premium, excess: raw.excess,
                  settleDays: raw.settleDays, remedyPerDay: raw.remedyPerDay, within: raw.within }
              : null;
  }
  try {
    var raw = JSON.parse(sessionStorage.getItem("oc-s") || "null");
    if (raw && typeof raw === "object") {
      S.delta = raw.delta === 100 ? 100 : 200;
      S.signed = raw.signed === true;
      S.purchase = snapshotOf(raw.purchase);
      S.month = (raw.month >= 1 && raw.month <= 12) ? Math.round(raw.month) : 0;
      S.claim = (raw.claim && typeof raw.claim === "object" && raw.claim.agreed === true)
                ? { agreed: true, settled: LEDGER.observed } : null;
    }
    /* the earlier builds' keys; never read */
    sessionStorage.removeItem("oc-pref"); sessionStorage.removeItem("oc-purchase"); sessionStorage.removeItem("oc-bought");
  } catch (e) { /* private mode, or a stored value that is not JSON */ }

  function persist() {
    try { sessionStorage.setItem("oc-s", JSON.stringify(S)); } catch (e) { /* private mode */ }
  }

  function recommended() {
    return OC.filter(function (o) { return o.eligible; })
             .reduce(function (a, b) { return a.num <= b.num ? a : b; });
  }
  function cheapest() { return OC.reduce(function (a, b) { return a.num <= b.num ? a : b; }); }
  function gap() { return recommended().num - cheapest().num; }   /* 1340 − 1185 = 155 */
  function bought() { return S.purchase; }

  /* the one test Muse runs before it buys: the eligible offer sits inside
     her allowance, and she has signed */
  function permitted() {
    var o = recommended();
    return !!o && o.eligible && gap() <= S.delta && S.signed === true;
  }

  /* the ONE writer of S.purchase: called by paintAct on screen 3 entry,
     only when permitted() and nothing is bought yet */
  function buy() {
    if (S.purchase || !permitted()) { return false; }
    var o = recommended();
    S.purchase = { id: o.id, name: o.name, premium: o.num, excess: o.excessNum,
                   settleDays: o.settleDays, remedyPerDay: o.remedyPerDay, within: S.delta };
    persist();
    return true;
  }

  function reduce() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function grp(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  /* one timer list per sequence, so a repaint never races an older run */
  var timers = { offer: [], act: [], claim: [] };
  function clearSeq(k) { timers[k].forEach(clearTimeout); timers[k] = []; }
  function seq(k, fns, gapMs, animate) {
    clearSeq(k);
    if (!animate || reduce()) { fns.forEach(function (f) { f(); }); return; }
    fns.forEach(function (f, i) { timers[k].push(setTimeout(f, 120 + i * gapMs)); });
  }

  /* the ONE way back to her rules: a single #to-rules button, moved into
     whichever pending slot the open screen needs, labelled for that state */
  var toRules = (function () {
    var tpl = document.getElementById("to-rules-tpl");
    return tpl ? tpl.content.firstElementChild.cloneNode(true) : null;
  })();
  function placeToRules(slotId, label) {
    if (!toRules) { return; }
    var slot = slotId ? document.getElementById(slotId) : null;
    if (!slot) { if (toRules.parentNode) { toRules.parentNode.removeChild(toRules); } return; }
    toRules.textContent = label;
    if (toRules.parentNode !== slot) { slot.appendChild(toRules); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 1 · her rules — the allowance control, the signature
     ══════════════════════════════════════════════════════════════════════ */
  function paintRules() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-delta]"), function (b) {
      b.setAttribute("aria-pressed", String(parseInt(b.dataset.delta, 10) === S.delta));
    });
    var acc = document.getElementById("rules-accept"), signed = document.getElementById("signed");
    if (acc) { acc.hidden = S.signed; }
    if (signed) { signed.hidden = !S.signed; }
    var note = document.getElementById("delta-note");
    if (note) { note.hidden = !bought(); }
    var corner = document.getElementById("paper-corner");
    if (corner) { corner.dataset.signed = S.signed ? "1" : "0"; }
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-delta]"), function (b) {
    b.addEventListener("click", function () {
      S.delta = parseInt(b.dataset.delta, 10) === 100 ? 100 : 200;
      persist(); paintRules(); paintAct(false); refit();
      say("Switch up to " + S.delta + " USD above the cheapest." + (bought() ? " Applies to the next purchase." : ""));
    });
  });
  var acceptBtn = document.getElementById("rules-accept");
  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      S.signed = true; persist();
      var sig = document.querySelector("#signed .sig");
      if (sig) { sig.classList.remove("is-drawn"); }
      paintRules(); paintAct(false);
      /* the dash draws on the paper (instant under reduced motion) */
      if (sig) { requestAnimationFrame(function () { sig.classList.add("is-drawn"); }); }
      var s = document.getElementById("signed"); if (s) { s.focus && s.setAttribute("tabindex", "-1"); }
      refit();
      say("Signed. Muse holds to her rules: never lapse; Rosa, nineteen, stays covered; excess under 500 USD; switch up to " + S.delta + " USD above the cheapest.");
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 2 · the offer — the lens reads the record field by field
     ══════════════════════════════════════════════════════════════════════ */
  var FIELDS = ["excess", "rosa", "settle", "remedy"];
  function litField(f) {
    Array.prototype.forEach.call(document.querySelectorAll("#record .field"), function (li) {
      li.dataset.lit = (li.dataset.field === f) ? "1" : (li.dataset.lit === "1" || li.dataset.read === "1") ? "0" : "0";
      if (li.dataset.field === f) { li.dataset.read = "1"; }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#checks .check"), function (li) {
      li.dataset.hot = (li.dataset.field === f) ? "1" : "0";
    });
    var lens = document.getElementById("record-lens"), rec = document.getElementById("record");
    var li = rec ? rec.querySelector('.field[data-field="' + f + '"]') : null;
    if (lens && li && rec) {
      var r = li.getBoundingClientRect(), b = rec.getBoundingClientRect();
      lens.style.top = (r.top - b.top + r.height / 2) + "px";
      lens.dataset.on = "1";
    }
  }
  function paintOffer(animate) {
    var checks = Array.prototype.slice.call(document.querySelectorAll("#checks .check"));
    checks.forEach(function (c) { c.dataset.shown = "0"; c.dataset.hot = "0"; });
    Array.prototype.forEach.call(document.querySelectorAll("#record .field"), function (li) { li.dataset.lit = "0"; li.dataset.read = "0"; });
    var lens = document.getElementById("record-lens"); if (lens) { lens.dataset.on = "0"; }
    seq("offer", FIELDS.map(function (f) {
      return function () {
        litField(f);
        var c = document.querySelector('#checks .check[data-field="' + f + '"]');
        if (c) { c.dataset.shown = "1"; }
      };
    }), 520, animate);
  }
  Array.prototype.forEach.call(document.querySelectorAll("#record .field-b"), function (b) {
    b.addEventListener("click", function () {
      clearSeq("offer");
      var f = b.parentNode.dataset.field;
      Array.prototype.forEach.call(document.querySelectorAll("#checks .check"), function (c) { c.dataset.shown = "1"; });
      litField(f);
      say("Muse reads: " + b.textContent.trim());
    });
  });

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 3 · Muse acts — the stream, the three cards, the purchase steps
     ══════════════════════════════════════════════════════════════════════ */
  function paintStream() {
    var host = document.getElementById("stream");
    if (!host) { return; }
    var s = [], i, n = 56, W = 1200;
    /* hundreds of thin lines from the top edge converging on three landings */
    var landings = [W * 0.167, W * 0.5, W * 0.833];
    for (i = 0; i < n; i++) {
      var x0 = 8 + (W - 16) * (i / (n - 1));
      var tgt = landings[i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2];
      var mid = x0 + (tgt - x0) * 0.5;
      var w = (i % 7 === 0) ? 1.6 : 0.9, op = (i % 5 === 0) ? 0.55 : 0.28;
      s.push('<path d="M' + x0.toFixed(1) + ' 0 C ' + x0.toFixed(1) + ' 40, ' + mid.toFixed(1) + ' 50, ' + tgt.toFixed(1) + ' 88" fill="none" stroke="#8A3450" stroke-width="' + w + '" opacity="' + op + '" vector-effect="non-scaling-stroke"/>');
    }
    host.innerHTML = s.join("");
  }

  function actStatusText() {
    var p = bought();
    if (!p) { return ""; }
    return (S.delta !== p.within ? "Already bought · " : "Bought · ") + p.name;
  }

  /* screen 3's state, on entry (animate) or on a repaint (not):
       bought      — steps shown done, status from the snapshot
       permitted   — Muse buys NOW: snapshot first, then the steps in sequence
       blocked 100 — Muse stops; the decision returns to her
       unsigned    — no authority; back to her rules */
  function paintAct(animate) {
    var steps = Array.prototype.slice.call(document.querySelectorAll("#act-steps .astep"));
    var list = document.getElementById("act-steps");
    var status = document.getElementById("act-status"), statusT = document.getElementById("act-status-t");
    var hold = document.getElementById("act-hold");
    var seal = document.getElementById("of-seal");
    var act = document.getElementById("act");
    clearSeq("act");

    var fresh = false;
    if (!bought() && permitted() && animate) { fresh = buy(); }
    var p = bought();

    if (p) {
      if (hold) { hold.hidden = true; hold.textContent = ""; }
      placeToRules(null);
      if (list) { list.hidden = false; }
      if (act) { act.dataset.state = "bought"; }
      var reveal = steps.map(function (li, i) {
        return function () {
          li.dataset.on = "1";
          if (i === 1) {
            if (statusT) { statusT.textContent = actStatusText(); }
            if (status) { status.hidden = false; }
            if (seal) { seal.dataset.on = "1"; }
          }
        };
      });
      if (fresh) {
        steps.forEach(function (li) { li.dataset.on = "0"; });
        if (status) { status.hidden = true; }
        if (seal) { seal.dataset.on = "0"; }
        seq("act", reveal, 650, true);
        say("Muse acts. Within your allowance, 155 above the cheapest. Bought: " + p.name + " confirms. Old policy ends after confirmation.");
      } else {
        reveal.forEach(function (f) { f(); });
        if (statusT) { statusT.textContent = actStatusText(); }
      }
      return;
    }

    /* no purchase: steps and seal are off; the decision returns to her */
    steps.forEach(function (li) { li.dataset.on = "0"; });
    if (list) { list.hidden = true; }
    if (status) { status.hidden = true; }
    if (seal) { seal.dataset.on = "0"; }
    if (hold) { hold.hidden = false; }
    if (!S.signed) {
      if (act) { act.dataset.state = "unsigned"; }
      if (hold) { hold.textContent = "No authority yet."; }
      placeToRules("act-slot", "Back to her rules");
    } else {
      if (act) { act.dataset.state = "blocked"; }
      if (hold) { hold.textContent = gap() + " above the cheapest — over your " + S.delta + " USD allowance. Your call."; }
      placeToRules("act-slot", "Revise the allowance");
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 4 · the year — reads the snapshot; the month control
     ══════════════════════════════════════════════════════════════════════ */
  function shownMonth() { return S.month >= 1 ? S.month : 1; }
  function paintYearBar() {
    var host = document.getElementById("yearbar");
    if (!host) { return; }
    var m = shownMonth(), W = 1200, H = 150, x0 = 10, x1 = W - 10, bw = x1 - x0, seg = bw / 12;
    var s = [], i;
    /* the thread runs along the bar; the check sits on it at the shown month */
    s.push('<line x1="' + x0 + '" y1="40" x2="' + x1 + '" y2="40" stroke="#8A3450" stroke-width="2" opacity=".42" vector-effect="non-scaling-stroke"/>');
    /* the bar: months passed in grey hatch, prepaid value remaining in ledger blue */
    for (i = 0; i < 12; i++) {
      var x = x0 + i * seg, spent = i < m;
      s.push('<rect x="' + (x + 2).toFixed(1) + '" y="58" width="' + (seg - 4).toFixed(1) + '" height="34" rx="2" fill="' +
             (spent ? "url(#oc-hatch-grey)" : "rgba(47,94,124,.18)") + '" stroke="' + (spent ? "#8C8574" : "#2F5E7C") +
             '" stroke-width="' + (spent ? 1.2 : 2) + '" vector-effect="non-scaling-stroke"/>');
    }
    /* the marker: the lens' centre on the thread at the shown month */
    var mx = x0 + (m - 0.5) * seg;
    s.push('<line x1="' + mx.toFixed(1) + '" y1="22" x2="' + mx.toFixed(1) + '" y2="100" stroke="#8A3450" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>');
    s.push('<circle cx="' + mx.toFixed(1) + '" cy="40" r="9" fill="#262E36" stroke="#8A3450" stroke-width="2.5" vector-effect="non-scaling-stroke"/>');
    /* the leaving steps, prepared and grey: three nodes on a dashed path
       under the bar — confirm new, cancel old, requirements — never taken */
    var py = 126;
    s.push('<line x1="' + x0 + '" y1="' + py + '" x2="' + x1 + '" y2="' + py + '" stroke="#8C8574" stroke-width="1.6" stroke-dasharray="6 7" opacity=".7" vector-effect="non-scaling-stroke"/>');
    [0.25, 0.5, 0.75].forEach(function (u) {
      s.push('<circle cx="' + (x0 + bw * u).toFixed(1) + '" cy="' + py + '" r="7" fill="#FBF6EA" stroke="#8C8574" stroke-width="1.6" vector-effect="non-scaling-stroke"/>');
    });
    host.innerHTML = s.join("");
    host.setAttribute("viewBox", "0 0 " + W + " " + H);
  }
  function paintYear() {
    var p = bought();
    var held = document.getElementById("year-held");
    var boughtBox = document.getElementById("year-bought"), pending = document.getElementById("year-pending");
    if (!p) {
      if (held) { held.hidden = true; held.textContent = ""; }
      if (boughtBox) { boughtBox.hidden = true; }
      if (pending) { pending.hidden = false; }
      placeToRules("year-slot", "Back to her rules");
      return;
    }
    if (pending) { pending.hidden = true; }
    if (boughtBox) { boughtBox.hidden = false; }
    if (held) { held.hidden = false; held.innerHTML = '<span class="held-k">Bought</span><span class="held-sep" aria-hidden="true"> · </span><b>' + esc(p.name) + "</b>"; }
    var m = shownMonth();
    var r = document.getElementById("year"); if (r) { r.value = String(m); r.setAttribute("aria-valuenow", String(m)); r.setAttribute("aria-valuetext", "Month " + m + " of 12"); }
    var mEl = document.getElementById("year-m"); if (mEl) { mEl.textContent = String(m); }
    var left = document.getElementById("year-left"); if (left) { left.textContent = String(12 - m); }
    paintYearBar();
    /* the check re-runs: the ticks land again for the shown month */
    var ul = document.getElementById("ychecks");
    if (ul) { ul.classList.remove("is-run"); void ul.offsetWidth; ul.classList.add("is-run"); }
  }
  var yearRange = document.getElementById("year");
  if (yearRange) {
    var onYear = function () {
      var v = parseInt(yearRange.value, 10);
      S.month = (v >= 1 && v <= 12) ? v : 1;
      persist(); paintYear();
      say("Month " + S.month + ". Eligible alternatives, none. Prepaid value remaining, " + (12 - S.month) + " months. Switching requirements prepared. Continuity: replacement first, then cancel. Stay.");
    };
    yearRange.addEventListener("input", onYear);
    yearRange.addEventListener("change", onYear);
  }

  /* ══════════════════════════════════════════════════════════════════════
     SCREEN 5 · the claim — reads the snapshot; the clock on the thread
     ══════════════════════════════════════════════════════════════════════ */
  function paintClock(p, after) {
    var host = document.getElementById("clock");
    if (!host) { return; }
    var promised = p.settleDays, n = after ? LEDGER.observed : promised, i, cells = [];
    for (i = 1; i <= n; i++) {
      var lateCell = i > promised, x = (i - 1) * 100 + 6;
      cells.push('<rect x="' + x + '" y="14" width="88" height="72" rx="3" fill="' +
        (lateCell ? "url(#oc3-hatch)" : "rgba(47,94,124,.16)") + '" stroke="' +
        (lateCell ? "#8A3450" : "#2F5E7C") + '" stroke-width="' + (lateCell ? 2.4 : 2) +
        '" vector-effect="non-scaling-stroke"/>');
    }
    host.innerHTML =
      '<svg class="calc-strip" viewBox="0 0 ' + (n * 100) + ' 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
        '<line x1="2" y1="2" x2="2" y2="98" stroke="#16150F" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
        '<path d="M6 8 V2 H' + (promised * 100 - 6) + ' V8" fill="none" stroke="#2F5E7C" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
        (after ? '<path d="M' + (promised * 100 + 6) + ' 8 V2 H' + (n * 100 - 6) + ' V8" fill="none" stroke="#8A3450" stroke-width="2" vector-effect="non-scaling-stroke"/>' : "") +
        cells.join("") +
      "</svg>";
    host.style.setProperty("--cells", String(n));
  }
  function paintClaim(animate) {
    var p = bought();
    var head = document.getElementById("oc5-headline");
    var held = document.getElementById("claim-held");
    var boughtBox = document.getElementById("claim-bought"), pending = document.getElementById("claim-pending");
    var promise = document.getElementById("promise");
    var btn = document.getElementById("claim"), enforce = document.getElementById("enforce"), slip = document.getElementById("slip");
    var steps = Array.prototype.slice.call(document.querySelectorAll("#claim-steps .astep"));
    clearSeq("claim");
    if (!p) {
      if (head) { head.textContent = "Nothing bought yet."; }
      if (held) { held.hidden = true; held.textContent = ""; }
      if (boughtBox) { boughtBox.hidden = true; }
      if (pending) { pending.hidden = false; }
      placeToRules("claim-slot", "Back to her rules");
      return;
    }
    if (pending) { pending.hidden = true; }
    if (boughtBox) { boughtBox.hidden = false; }
    if (held) { held.hidden = false; held.innerHTML = '<span class="held-k">Bought</span><span class="held-sep" aria-hidden="true"> · </span><b>' + esc(p.name) + "</b>"; }
    if (!S.claim) {
      if (head) { head.textContent = "A promise her agent can enforce."; }
      if (promise) {
        promise.hidden = false;
        promise.innerHTML = "Settlement " + p.settleDays + " working days from agreed liability<span class=\"promise-sep\" aria-hidden=\"true\"> · </span>Remedy " + p.remedyPerDay + " USD a day late";
      }
      paintClock(p, false);
      if (btn) { btn.hidden = false; }
      if (enforce) { enforce.hidden = true; }
      if (slip) { slip.hidden = true; }
      steps.forEach(function (li) { li.dataset.on = "0"; });
      return;
    }
    /* after the claim: the steps, then the headline, then her slip */
    if (promise) { promise.hidden = true; }
    if (btn) { btn.hidden = true; }
    if (enforce) { enforce.hidden = false; }
    var late = Math.max(0, S.claim.settled - p.settleDays), remedy = late * p.remedyPerDay;
    var last = steps[4];
    if (last) {
      last.innerHTML = '<span class="astep-a" aria-hidden="true">→</span>' + late + " late × " + p.remedyPerDay + " USD = " + grp(remedy) + " USD remedy applied under the policy";
    }
    var fns = steps.map(function (li, i) {
      return function () {
        li.dataset.on = "1";
        if (i === 3) { paintClock(p, true); }
        if (i === 4) {
          if (head) { head.textContent = "Settled on day nine. The remedy applied."; }
          if (slip) { slip.hidden = false; }
          refit();
        }
      };
    });
    if (animate) {
      steps.forEach(function (li) { li.dataset.on = "0"; });
      if (slip) { slip.hidden = true; }
      if (head) { head.textContent = "A promise her agent can enforce."; }
      paintClock(p, false);
      seq("claim", fns, 600, true);
    } else {
      paintClock(p, true);
      fns.forEach(function (f) { f(); });
    }
  }
  var claimBtn = document.getElementById("claim");
  if (claimBtn) {
    claimBtn.addEventListener("click", function () {
      if (!bought() || S.claim) { return; }
      S.claim = { agreed: true, settled: LEDGER.observed };
      persist();
      paintClaim(true);
      var e = document.getElementById("enforce"); if (e) { e.setAttribute("tabindex", "-1"); e.focus(); }
      say("Claim reported. Liability agreed, clock starts. 5 working days promised. Settled on day nine. 4 late times 50 USD, 200 USD remedy applied under the policy. No separate claim needed.");
    });
  }

  /* starting over: nothing signed, nothing bought — the state the first
     screen describes. Called when the deck wraps from screen 5 to screen 1. */
  function restart() {
    S = { delta: 200, signed: false, purchase: null, month: 0, claim: null };
    persist();
    var sig = document.querySelector("#signed .sig"); if (sig) { sig.classList.remove("is-drawn"); }
    paintAll(false);
  }

  function paintAll(animate) {
    paintRules();
    paintOffer(animate);
    paintAct(animate);
    paintYear();
    paintClaim(animate);
  }

  /* on entry to a screen, its sequence runs (screen 3 may buy) */
  function enter(n) {
    if (n === 1) { paintRules(); }
    if (n === 2) { paintOffer(true); }
    if (n === 3) { paintAct(true); }
    if (n === 4) { paintYear(); }
    if (n === 5) { paintClaim(false); }
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

  paintStream();
  paintAll(false);

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

  /* Next labels, per CONTRACT-IMPL.md § B. Next only moves between screens:
     it never consents, signs, buys or claims. */
  var CTA = ["The offer", "The agent acts", "The year", "The claim", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();

  /* going FORWARD off the last screen (Next, or the right arrow) is the
     restart: nothing signed, nothing bought, the allowance back to 200. The
     picker, a deep link, the back arrow and a reload never reset — they
     restore whatever the session holds, or show the pending state. */
  function forward() {
    if (current === total) { restart(); }
    show(current + 1);
  }

  function show(n, push) {
    n = ((n - 1 + total) % total) + 1;
    current = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";
    /* the screen's own sequence runs on entry; screen 3 may buy here */
    enter(n);

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
    /* the state a screen depends on is announced with it */
    var extra = "", p = bought();
    if (n === 1) {
      extra = S.signed ? " Signed. Switch up to " + S.delta + " USD above the cheapest." + (p ? " Applies to the next purchase." : "")
                       : " Muse proposes four rules; the allowance is " + S.delta + " USD. One action: accept and sign.";
    }
    if (n === 2) { extra = " Muse reads Meridian Mutual: Rosa covered, excess 450, settlement 5 working days from agreed liability, remedy 50 USD a day late."; }
    if (n === 3) {
      extra = p ? " " + actStatusText() + ". Within your allowance, 155 above the cheapest. Old policy ends after confirmation."
                : (!S.signed ? " No authority yet. One action: back to her rules."
                             : " 155 above the cheapest, over your " + S.delta + " USD allowance. Your call. One action: revise the allowance.");
    }
    if (n === 4) { extra = p ? " Bought: " + p.name + ". Month " + shownMonth() + ". Eligible alternatives, none. Stay." : " Nothing to watch, no policy was bought. One action: back to her rules."; }
    if (n === 5) { extra = p ? (S.claim ? " Bought: " + p.name + ". The remedy applied under the policy; no separate claim needed." : " Bought: " + p.name + ". One action: report a claim.") : " No policy to claim on. One action: back to her rules."; }
    announce.textContent = "Screen " + n + " of " + total + ". " + said.replace(/\s+/g, " ").trim() + extra;

    if (push !== false) {
      try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ }
    }
  }

  prevBtn.addEventListener("click", function () { show(current - 1); });
  nextBtn.addEventListener("click", forward);
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (t) { show(parseInt(t.dataset.goto, 10)); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button") { return; }
    if (e.key === "ArrowRight") { forward(); }
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
