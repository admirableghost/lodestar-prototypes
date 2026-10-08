/* Backed to Act 2.0 — insurance for autonomous AI actions.
   One fictional trip. The customer decides how much to delegate; if she buys
   the $1 protection it attaches BEFORE Muse books; Muse books the wrong
   dates; the hotel declines a refund; the insurer verifies a covered,
   unrecovered loss and pays it; Muse rebooks inside the same authorisation.
   Everything derives from S; nothing happy is hardcoded past its conditions. */
(function () {
  "use strict";
  var KEY = "bta2";
  var HOTEL = { name: "Casa Ferrer", night: 200, nights: 2, total: 400, ok: "20–22 November", wrong: "27–29 November" };
  var PREMIUM = 1, LIMIT = 400, DEDUCT = 0;
  var S = { screen: 1, choice: null, beat: 0, paid: null, fixed: false };
  function test() { try { return sessionStorage.getItem("bta-test") || ""; } catch (e) { return ""; } }
  function load() { try { var o = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (o && typeof o === "object") {
    S.choice = ["self", "book", "protect"].indexOf(o.choice) >= 0 ? o.choice : null;
    S.beat = (S.choice && o.beat >= 0 && o.beat <= 5) ? Math.round(o.beat) : 0;
    S.paid = (S.choice === "protect" && typeof o.paid === "number") ? o.paid : null;
    S.fixed = o.fixed === true; } } catch (e) {} }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ choice: S.choice, beat: S.beat, paid: S.paid, fixed: S.fixed })); } catch (e) {} }
  function reset() { S = { screen: 1, choice: null, beat: 0, paid: null, fixed: false }; try { sessionStorage.removeItem(KEY); } catch (e) {} }
  load();

  /* ── the scenario, derived ─────────────────────────────────────────── */
  function booked() { return S.choice === "book" || S.choice === "protect"; }          /* Muse booked at all */
  function protectedB() { return S.choice === "protect"; }                             /* protection in force before booking */
  function wrongDates() { return booked() && test() !== "correct"; }                   /* the mistake happened */
  function datesChanged() { return test() === "dates-changed"; }                       /* she changed dates after authorising: not an AI error */
  function refund() { return test() === "refund-full" ? 400 : test() === "refund-partial" ? 150 : 0; }   /* what the hotel gave back */
  function unrecovered() { return wrongDates() ? Math.max(0, HOTEL.total - refund()) : 0; }
  function coveredError() { return protectedB() && wrongDates() && !datesChanged(); }
  function verified() { return coveredError() && unrecovered() > 0 && test() !== "verify-fails"; }
  function payable() { return verified() ? Math.min(LIMIT, unrecovered()) - DEDUCT : 0; }
  function roomAvailable() { return test() !== "no-room"; }
  function BEATS() {
    if (!booked()) { return []; }
    if (!wrongDates()) { return ["Booked · " + HOTEL.ok + " · $400, nonrefundable", "Checked against your authorisation · matches", "No claim"]; }
    var b = ["Booked · " + HOTEL.wrong + " · $400, nonrefundable", "Wrong dates · authorised " + HOTEL.ok.replace(" November", "")];
    b.push(refund() === 400 ? "Hotel · refunded $400" : refund() ? "Hotel · refunded $" + refund() + " only" : "Hotel · refund declined");
    if (!protectedB()) { b.push("No protection · $" + unrecovered() + " is your loss"); return b; }
    if (datesChanged()) { b.push("Insurer · dates changed after authorising, not a covered error"); return b; }
    if (unrecovered() === 0) { b.push("Insurer · nothing unrecovered, no claim"); return b; }
    b.push(verified() ? "Insurer · covered error verified, $" + unrecovered() + " unrecovered" : "Insurer · not verified, no payout");
    if (verified()) { b.push("+$" + payable() + " · to your bank"); }
    return b;
  }

  /* ── dom ───────────────────────────────────────────────────────────── */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen")), total = screens.length, current = 1;
  var prevBtn = document.getElementById("prev"), nextBtn = document.getElementById("next"), nextLabel = document.getElementById("next-label"), picker = document.getElementById("picker");
  var announce = document.getElementById("announce"), statusEl = document.getElementById("state-status");
  function say(m) { if (statusEl) { statusEl.textContent = m; } }
  var CTA = ["The options", "Decide", "What happens", "Back on track", "Back to the start"];
  screens.forEach(function (s, i) { var o = document.createElement("option"); o.value = String(i + 1); o.textContent = (i + 1) + " of " + total + " · " + s.dataset.label; picker.appendChild(o); });

  /* screen 3: the choice */
  var choiceBtns = Array.prototype.slice.call(document.querySelectorAll("[data-choice]"));
  choiceBtns.forEach(function (b) { b.addEventListener("click", function () {
    var c = b.dataset.choice;
    if (S.choice === c) { return; }
    /* a different choice is a new day: the earlier day's record is cleared with it, never rewritten in place */
    S.choice = c; S.beat = 0; S.paid = null; S.fixed = false; save(); paint();
    say(c === "self" ? "You'll book it yourself. Muse books nothing." : c === "book" ? "Book for me, $400. No protection." : "Book with protection, $401: $400 for the hotel, $1 for cover against covered AI booking mistakes. Protection attaches before Muse books.");
  }); });
  var whyBtn = document.getElementById("cover-why"), coverEl = document.getElementById("cover");
  if (whyBtn) { whyBtn.addEventListener("click", function () { var open = coverEl.hidden; coverEl.hidden = !open; whyBtn.setAttribute("aria-expanded", open ? "true" : "false"); whyBtn.textContent = open ? "Hide" : "What's covered?"; }); }

  /* screen 4: the facilitator steps the day; the payout is written once, by beat five, and only when payable */
  var stepBtn = document.getElementById("day-step"), replayBtn = document.getElementById("day-replay");
  function applyBeat(n) {
    var beats = BEATS(); S.beat = Math.max(0, Math.min(beats.length, n));
    if (S.beat === beats.length && verified() && S.paid === null) { S.paid = payable(); }
    save(); paint();
  }
  if (stepBtn) { stepBtn.addEventListener("click", function () { applyBeat(S.beat + 1); say(BEATS()[S.beat - 1] || ""); if (S.beat === 2) { var hh = document.getElementById("s4-h"); if (hh) { announce.textContent = hh.textContent; } } }); }
  if (replayBtn) { replayBtn.addEventListener("click", function () { S.beat = 0; save(); paint(); say("Showing the day again. Nothing is booked, claimed or credited twice."); }); }

  function paint() {
    choiceBtns.forEach(function (b) { b.setAttribute("aria-pressed", S.choice === b.dataset.choice ? "true" : "false"); });
    var cn = document.getElementById("choice-note");
    if (cn) { cn.hidden = !S.choice; cn.textContent = S.choice === "protect" ? "Protection attached before booking." : S.choice === "book" ? "No protection. Muse books now." : "Muse books nothing."; }
    /* screen 4 */
    var h4 = document.getElementById("s4-h"), s4 = document.getElementById("s4-say"), ol = document.getElementById("beats"), pay = document.getElementById("payout"), ctl = document.getElementById("day-ctl");
    var beats = BEATS(), done = S.beat >= beats.length;
    if (h4) { h4.innerHTML = !booked() ? "<span>Nothing booked</span><span>by Muse.</span>" : S.beat < 2 ? "<span>Muse books</span><span>the hotel.</span>" : !wrongDates() ? "<span>Muse booked it</span><span>correctly.</span>" : "<span>Muse booked</span><span>the wrong dates.</span>"; }
    if (s4) { s4.textContent = !booked() ? "You chose to book it yourself. I'll keep the recommendation ready." : S.beat < 2 ? "Booking the Casa Ferrer." : !wrongDates() ? "Checked the confirmation against your authorisation. It matches." : !protectedB() ? "My mistake, and no protection. I'm asking the hotel for a refund." : datesChanged() ? "The dates changed after you authorised me. That isn't a covered error." : "My mistake. Your $1 protection covers it. I'm putting it right."; }
    if (ol) { ol.innerHTML = beats.map(function (t, i) { return '<li data-on="' + (S.beat > i ? "1" : "0") + '" data-k="' + (/^\+/.test(t) ? "pay" : /declined|your loss|not verified|not a covered/.test(t) ? "warn" : /Wrong dates/.test(t) ? "err" : "") + '">' + t + "</li>"; }).join(""); }
    if (pay) { pay.hidden = !(done && S.paid !== null && S.paid > 0); var pa = document.getElementById("pay-amt"); if (pa) { pa.textContent = "+$" + (S.paid || 0); } }
    if (ctl) { ctl.hidden = !booked(); }
    if (stepBtn) { stepBtn.disabled = done; }
    /* screen 5 */
    var h5 = document.getElementById("s5-h"), s5 = document.getElementById("s5-say"), slip = document.getElementById("s5-slip"), led = document.getElementById("ledger"), ask = document.getElementById("s5-ask");
    var fixed = booked() && wrongDates() && done && roomAvailable();
    S.fixed = fixed;
    var rows = [];
    if (!booked()) {
      if (h5) { h5.innerHTML = "<span>You booked it</span><span>yourself.</span>"; }
      if (s5) { s5.textContent = "The recommendation stands. Muse charged nothing."; }
    } else if (!wrongDates()) {
      if (h5) { h5.innerHTML = "<span>Booked right,</span><span>first time.</span>"; }
      if (s5) { s5.textContent = "Casa Ferrer, 20–22 November, confirmed. Nothing to fix."; }
      rows = [["Booking", "−$400"], protectedB() ? ["Protection", "−$1"] : null, ["Net", protectedB() ? "$401" : "$400"]];
    } else if (!done) {
      if (h5) { h5.innerHTML = "<span>Not yet</span><span>resolved.</span>"; }
      if (s5) { s5.textContent = "The day on the previous screen hasn't finished."; }
    } else if (!roomAvailable()) {
      if (h5) { h5.innerHTML = "<span>Still looking.</span>"; }
      if (s5) { s5.textContent = "The correct dates aren't available at Casa Ferrer. I'm holding your authorisation and searching the other two."; }
      rows = [["Wrong booking", "−$400"], protectedB() ? ["Protection", "−$1"] : null, S.paid ? ["Reimbursed", "+$" + S.paid] : null];
    } else {
      var net = 400 + (protectedB() ? 1 : 0) + 400 - (S.paid || 0) - refund();
      if (h5) { h5.innerHTML = protectedB() && S.paid ? "<span>$1 protected</span><span>a $400 decision.</span>" : "<span>A $400 mistake,</span><span>uncovered.</span>"; }
      if (s5) { s5.textContent = "Rebooked Casa Ferrer, 20–22 November, inside your authorisation. Nothing for you to chase."; }
      if (slip) { slip.hidden = false; slip.innerHTML = "Casa Ferrer · 20–22 November · <b>confirmed</b> · $400"; }
      rows = [["Wrong booking", "−$400"], protectedB() ? ["Protection", "−$1"] : null, refund() ? ["Hotel refund", "+$" + refund()] : null, S.paid ? ["Reimbursed", "+$" + S.paid] : null, ["Correct booking", "−$400"], ["Net", "$" + net]];
    }
    if (slip && !fixed) { slip.hidden = true; }
    if (led) { rows = rows.filter(Boolean); led.hidden = !rows.length; led.innerHTML = rows.map(function (r) { return "<div" + (r[0] === "Net" ? ' class="net"' : "") + "><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join(""); }
    if (ask) { ask.hidden = !(fixed && protectedB() && S.paid); }
    save();
  }

  /* ── navigation ───────────────────────────────────────────────────── */
  function show(n, push) {
    n = ((n - 1 + total) % total) + 1; current = n; S.screen = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n); prevBtn.disabled = n === 1; nextLabel.textContent = CTA[n - 1];
    nextBtn.classList.toggle("cta--quiet", n === 3 && !S.choice || n === total);
    var v = document.getElementById("veil"); if (v) { v.dataset.veil = sc.dataset.veil || ""; }
    paint();
    var h = sc.querySelector(".xd"); var said = h ? Array.prototype.map.call(h.querySelectorAll("span"), function (x) { return x.textContent.trim(); }).join(" ") : sc.dataset.label;
    announce.textContent = "Screen " + n + " of " + total + ". " + said;
    var ae = document.activeElement; if (ae && ae.closest && ae.closest(".screen") && ae.closest(".screen") !== sc && h) { h.focus(); }
    if (push !== false) { try { history.replaceState(null, "", "#s/" + n); } catch (e) {} }
  }
  function forward() { if (current === total) { reset(); show(1); say("Journey reset."); return; } show(current + 1); }
  nextBtn.addEventListener("click", forward);
  prevBtn.addEventListener("click", function () { show(current - 1); });
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });
  document.getElementById("skip").addEventListener("click", function () { var h = screens[current - 1].querySelector(".xd"); if (h) { h.focus(); } });
  function fromHash() { var m = /#s\/([1-5])/.exec(location.hash); return m ? parseInt(m[1], 10) : null; }
  window.addEventListener("hashchange", function () { var n = fromHash(); if (n && n !== current) { show(n, false); } });
  show(fromHash() || 1, false);
})();
