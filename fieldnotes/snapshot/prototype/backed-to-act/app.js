/* Backed to Act 2.0 — insurance for autonomous AI actions.
   A fictional announcement establishes the partnership: Muse distributes
   protection and shares the risk; Kestrel Mutual underwrites specified
   errors and pays eligible losses. Then one application. The customer
   decides how much to delegate; if the agency buys the $15 protection it attaches
   BEFORE Muse books; Muse books the wrong dates; the venue declines a
   refund; the insurer verifies a covered, unrecovered loss and pays it;
   Muse rebooks inside the same authorisation. Everything derives from S;
   nothing happy is hardcoded past its conditions. */
(function () {
  "use strict";
  var KEY = "bta2";
  var HOTEL = { name: "Sala Ferrer", total: 4000, ok: "21–22 November", wrong: "27–28 November" };
  var INSURER = "Kestrel Mutual";
  var PREMIUM = 15, LIMIT = 4000, DEDUCT = 0;
  function usd(n) { return "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  var WHO = { muse: "Muse", hotel: "Venue", insurer: INSURER, none: "" };
  var S = { screen: 1, intro: "article", choice: null, beat: 0, paid: null };
  function test() { try { return sessionStorage.getItem("bta-test") || ""; } catch (e) { return ""; } }
  function load() { try { var o = JSON.parse(sessionStorage.getItem(KEY) || "null"); if (o && typeof o === "object") {
    S.intro = o.intro === "muse" ? "muse" : "article";
    S.choice = ["self", "book", "protect"].indexOf(o.choice) >= 0 ? o.choice : null;
    S.beat = (S.choice && o.beat >= 0 && o.beat <= 5) ? Math.round(o.beat) : 0;
    S.paid = (S.choice === "protect" && typeof o.paid === "number") ? o.paid : null; } } catch (e) {} }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ intro: S.intro, choice: S.choice, beat: S.beat, paid: S.paid })); } catch (e) {} }
  function reset() { S = { screen: 1, intro: "article", choice: null, beat: 0, paid: null }; try { sessionStorage.removeItem(KEY); } catch (e) {} }
  load();

  /* ── the scenario, derived ─────────────────────────────────────────── */
  function booked() { return S.choice === "book" || S.choice === "protect"; }          /* Muse booked at all */
  function protectedB() { return S.choice === "protect"; }                             /* protection in force before booking */
  function wrongDates() { return booked() && test() !== "correct"; }                   /* the mistake happened */
  function datesChanged() { return test() === "dates-changed"; }                       /* she changed dates after authorising: not an AI error */
  function refund() { return test() === "refund-full" ? 4000 : test() === "refund-partial" ? 1500 : 0; }   /* what the venue gave back */
  function unrecovered() { return wrongDates() ? Math.max(0, HOTEL.total - refund()) : 0; }
  function coveredError() { return protectedB() && wrongDates() && !datesChanged(); }
  function verified() { return coveredError() && unrecovered() > 0 && test() !== "verify-fails"; }
  function payable() { return verified() ? Math.min(LIMIT, unrecovered()) - DEDUCT : 0; }
  function roomAvailable() { return test() !== "no-room"; }
  /* each step names who acts: Muse detects and coordinates, the venue answers, the insurer verifies and pays */
  function BEATS() {
    if (!booked()) { return []; }
    if (!wrongDates()) { return [B("muse", "booked " + HOTEL.ok + ", " + usd(HOTEL.total) + ", nonrefundable"), B("muse", "checked against your authorisation, matches"), B("none", "No claim")]; }
    var b = [B("muse", "booked " + HOTEL.wrong + ", " + usd(HOTEL.total) + ", nonrefundable", "err"), B("muse", "wrong dates, authorised " + HOTEL.ok.replace(" November", ""), "err")];
    b.push(refund() === HOTEL.total ? B("hotel", "refunded " + usd(refund())) : refund() ? B("hotel", "refunded " + usd(refund()) + " only", "warn") : B("hotel", "refund declined", "warn"));
    if (!protectedB()) { b.push(B("none", "No protection · " + usd(unrecovered()) + " is your loss", "warn")); return b; }
    if (datesChanged()) { b.push(B("insurer", "dates changed after authorising, not covered", "warn")); return b; }
    if (unrecovered() === 0) { b.push(B("insurer", "nothing unrecovered, no claim")); return b; }
    b.push(verified() ? B("insurer", "verified against your instructions, " + usd(unrecovered()) + " unrecovered") : B("insurer", "not verified, no payout", "warn"));
    if (verified()) { b.push(B("insurer", "claim approved, +" + usd(payable()) + " to your bank", "pay")); }
    return b;
  }
  function B(who, t, k) { return { who: who, t: t, k: k || "", text: (WHO[who] ? WHO[who] + " · " : "") + t }; }

  /* ── dom ───────────────────────────────────────────────────────────── */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen")), total = screens.length, current = 1;
  var prevBtn = document.getElementById("prev"), nextBtn = document.getElementById("next"), nextLabel = document.getElementById("next-label"), picker = document.getElementById("picker");
  var announce = document.getElementById("announce"), statusEl = document.getElementById("state-status");
  function say(m) { if (statusEl) { statusEl.textContent = m; } }
  var CTA = ["The options", "Decide", "What happens", "Back on track", "Back to the start"];
  screens.forEach(function (s, i) { var o = document.createElement("option"); o.value = String(i + 1); o.textContent = (i + 1) + " of " + total + " · " + s.dataset.label; picker.appendChild(o); });
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* screen 1: the announcement, then Muse at work on the same screen */
  var introBack = document.getElementById("intro-back");
  if (introBack) { introBack.addEventListener("click", function () { S.intro = "article"; save(); paint(); var nh = document.getElementById("news-h"); if (nh) { nh.focus(); } say("The announcement."); }); }

  /* screen 3: the choice */
  var choiceBtns = Array.prototype.slice.call(document.querySelectorAll("[data-choice]"));
  choiceBtns.forEach(function (b) { b.addEventListener("click", function () {
    var c = b.dataset.choice;
    if (S.choice === c) { return; }
    /* a different choice is a new day: the earlier day's record is cleared with it, never rewritten in place */
    S.choice = c; S.beat = 0; S.paid = null; save(); paint();
    say(c === "self" ? "You'll book it yourself. Muse books nothing." : c === "book" ? "Book for me, " + usd(HOTEL.total) + ". No protection." : "Book with protection, " + usd(HOTEL.total + PREMIUM) + ": " + usd(HOTEL.total) + " for the venue, " + usd(PREMIUM) + " for cover against covered AI booking errors, backed by " + INSURER + ". Protection attaches before Muse books.");
  }); });
  var whyBtn = document.getElementById("cover-why"), coverEl = document.getElementById("cover");
  if (whyBtn) { whyBtn.addEventListener("click", function () { var open = coverEl.hidden; coverEl.hidden = !open; whyBtn.setAttribute("aria-expanded", open ? "true" : "false"); whyBtn.textContent = open ? "×" : "What's covered?"; if (open) { whyBtn.setAttribute("aria-label", "Hide what's covered"); } else { whyBtn.removeAttribute("aria-label"); } }); }

  /* screen 4: the day. The payout is written once, by the last step, and only when payable. */
  var stepBtn = document.getElementById("day-step"), replayBtn = document.getElementById("day-replay"), pauseBtn = document.getElementById("day-pause");
  function applyBeat(n) {
    var beats = BEATS(); S.beat = Math.max(0, Math.min(beats.length, n));
    if (S.beat === beats.length && verified() && S.paid === null) { S.paid = payable(); }
    save(); paint();
    say(beats[S.beat - 1] ? beats[S.beat - 1].text : "");
    if (S.beat === 2) { var hh = document.getElementById("s4-h"); if (hh) { announce.textContent = hh.textContent; } }
  }
  /* the day plays itself, one step a second, while screen 4 is open and the day is unfinished;
     a manual step takes over, Pause holds, Replay restarts; reduced motion never autoplays */
  var playT = null;
  function reduced() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function playing() { return playT !== null; }
  function playStop() { if (playT !== null) { clearInterval(playT); playT = null; } paintPlay(); }
  function playStart() {
    if (playing() || reduced() || !booked() || S.beat >= BEATS().length) { paintPlay(); return; }
    playT = setInterval(function () { if (current !== 4 || S.beat >= BEATS().length) { playStop(); return; } applyBeat(S.beat + 1); if (S.beat >= BEATS().length) { playStop(); } }, 1000);
    paintPlay();
  }
  function paintPlay() { if (!pauseBtn) { return; } var done = S.beat >= BEATS().length; pauseBtn.hidden = !booked() || done || reduced(); pauseBtn.textContent = playing() ? "Pause" : "Resume"; pauseBtn.setAttribute("aria-pressed", playing() ? "false" : "true"); }
  if (stepBtn) { stepBtn.addEventListener("click", function () { playStop(); applyBeat(S.beat + 1); }); }
  if (pauseBtn) { pauseBtn.addEventListener("click", function () { if (playing()) { playStop(); say("Paused."); } else { playStart(); say("Playing."); } }); }
  if (replayBtn) { replayBtn.addEventListener("click", function () { playStop(); S.beat = 0; save(); paint(); say("Showing the day again. Nothing is booked, claimed or credited twice."); playStart(); }); }

  function paint() {
    /* screen 1 */
    var s1 = screens[0], news = document.getElementById("news"), top1 = document.getElementById("s1-top"), ws1 = document.getElementById("s1-ws");
    var article = S.intro === "article";
    if (s1) { s1.dataset.intro = S.intro; }
    if (news) { news.hidden = !article; } if (top1) { top1.hidden = article; } if (ws1) { ws1.hidden = article; }
    nextLabel.textContent = current === 1 ? (article ? "See what this makes possible" : CTA[0]) : CTA[current - 1];
    /* screen 3 */
    choiceBtns.forEach(function (b) { b.setAttribute("aria-pressed", S.choice === b.dataset.choice ? "true" : "false"); });
    var cn = document.getElementById("choice-note");
    if (cn) { cn.hidden = !S.choice; cn.textContent = S.choice === "protect" ? "Protection attached before booking." : S.choice === "book" ? "No protection. Muse books now." : "Muse books nothing."; }
    /* screen 4 */
    var h4 = document.getElementById("s4-h"), s4 = document.getElementById("s4-say"), ol = document.getElementById("beats"), ctl = document.getElementById("day-ctl");
    var beats = BEATS(), done = S.beat >= beats.length;
    if (h4) { h4.innerHTML = !booked() ? "<span>Nothing booked</span><span>by Muse.</span>" : S.beat < 2 ? "<span>Muse books</span><span>the venue.</span>" : !wrongDates() ? "<span>Muse booked it</span><span>correctly.</span>" : "<span>Muse booked</span><span>the wrong dates.</span>"; }
    if (s4) { s4.textContent = !booked() ? "You chose to book it yourself. I'll keep the recommendation ready." : S.beat < 2 ? "Booking Sala Ferrer for the workshop." : !wrongDates() ? "Checked the confirmation against your authorisation. It matches." : !protectedB() ? "My mistake, and no protection. I'm asking the venue for a refund." : datesChanged() ? "The dates changed after you authorised me. That isn't a covered error." : S.beat < 4 ? "My mistake. I'm asking the venue first, then your protection." : verified() ? INSURER + " is settling it. I'm rebooking the right dates." : "My mistake. I'm asking the venue first, then your protection."; }
    if (ol) { ol.innerHTML = beats.map(function (b, i) {
      var on = S.beat > i ? "1" : "0";
      if (b.k === "pay") { return '<li data-on="' + on + '" data-k="pay" data-who="insurer"><div class="payout"><p class="pay-h">' + esc(INSURER) + ' · claim approved</p><p class="pay-a"><b>+' + usd(S.paid === null ? payable() : S.paid) + '</b><span>to your bank</span></p></div></li>'; }
      return '<li data-on="' + on + '" data-k="' + b.k + '" data-who="' + b.who + '">' + (WHO[b.who] ? '<b class="who">' + esc(WHO[b.who]) + '</b> · ' : '') + esc(b.t) + '</li>'; }).join(""); }
    if (ctl) { ctl.hidden = !booked(); }
    if (stepBtn) { stepBtn.disabled = done; }
    /* screen 5 */
    var h5 = document.getElementById("s5-h"), s5 = document.getElementById("s5-say"), slip = document.getElementById("s5-slip"), led = document.getElementById("ledger"), ask = document.getElementById("s5-ask");
    var fixed = booked() && wrongDates() && done && roomAvailable();
    var rows = [];
    if (!booked()) {
      if (h5) { h5.innerHTML = "<span>You booked it</span><span>yourself.</span>"; }
      if (s5) { s5.textContent = "The recommendation stands. Muse charged nothing."; }
    } else if (!wrongDates()) {
      if (h5) { h5.innerHTML = "<span>Booked right,</span><span>first time.</span>"; }
      if (s5) { s5.textContent = "Sala Ferrer, 21–22 November, confirmed. Nothing to fix."; }
      rows = [["Booking", "−" + usd(HOTEL.total)], protectedB() ? ["Protection", "−" + usd(PREMIUM)] : null, ["Net", usd(HOTEL.total + (protectedB() ? PREMIUM : 0))]];
    } else if (!done) {
      if (h5) { h5.innerHTML = "<span>Not yet</span><span>resolved.</span>"; }
      if (s5) { s5.textContent = "The day on the previous screen hasn't finished."; }
    } else if (!roomAvailable()) {
      if (h5) { h5.innerHTML = "<span>Still looking.</span>"; }
      if (s5) { s5.textContent = "The correct dates aren't available at Sala Ferrer. I'm holding your authorisation and searching the other two."; }
      rows = [["Wrong booking", "−" + usd(HOTEL.total)], protectedB() ? ["Protection", "−" + usd(PREMIUM)] : null, S.paid ? ["Reimbursed by " + INSURER, "+" + usd(S.paid)] : null];
    } else {
      var net = HOTEL.total + (protectedB() ? PREMIUM : 0) + HOTEL.total - (S.paid || 0) - refund();
      if (h5) { h5.innerHTML = protectedB() && S.paid ? "<span>$15 protected</span><span>a $4,000 decision.</span>" : "<span>A $4,000 mistake,</span><span>uncovered.</span>"; }
      if (s5) { s5.textContent = "Rebooked Sala Ferrer, 21–22 November. The workshop goes ahead."; }
      if (slip) { slip.hidden = false; slip.innerHTML = "Sala Ferrer · 21–22 November · <b>confirmed</b> · " + usd(HOTEL.total); }
      rows = [["Wrong booking", "−" + usd(HOTEL.total)], protectedB() ? ["Protection", "−" + usd(PREMIUM)] : null, refund() ? ["Venue refund", "+" + usd(refund())] : null, S.paid ? ["Reimbursed by " + INSURER, "+" + usd(S.paid)] : null, ["Correct booking", "−" + usd(HOTEL.total)], ["Net", usd(net)]];
    }
    if (slip && !fixed) { slip.hidden = true; }
    if (led) { rows = rows.filter(Boolean); led.hidden = !rows.length; led.innerHTML = rows.map(function (r) { return "<div" + (r[0] === "Net" ? ' class="net"' : "") + "><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join(""); }
    if (ask) { ask.hidden = !(fixed && protectedB() && S.paid); }
    save(); paintPlay();
  }

  /* ── navigation ───────────────────────────────────────────────────── */
  function headingOf(sc) { return (sc.dataset.screen === "1" && S.intro === "article") ? document.getElementById("news-h") : sc.querySelector(".xd"); }
  function show(n, push) {
    n = ((n - 1 + total) % total) + 1; current = n; S.screen = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n); prevBtn.disabled = n === 1;
    nextBtn.classList.toggle("cta--quiet", n === 3 && !S.choice || n === total);
    var v = document.getElementById("veil"); if (v) { v.dataset.veil = sc.dataset.veil || ""; }
    paint();
    if (n === 4) { playStart(); } else { playStop(); }
    var h = headingOf(sc); var said = h ? (h.classList.contains("xd") ? Array.prototype.map.call(h.querySelectorAll("span"), function (x) { return x.textContent.trim(); }).join(" ") : h.textContent.trim()) : sc.dataset.label;
    announce.textContent = "Screen " + n + " of " + total + ". " + said;
    var ae = document.activeElement; if (ae && ae.closest && ae.closest(".screen") && ae.closest(".screen") !== sc && h) { h.focus(); }
    if (push !== false) { try { history.replaceState(null, "", "#s/" + n); } catch (e) {} }
  }
  function forward() {
    if (current === 1 && S.intro === "article") { S.intro = "muse"; save(); paint(); var h = screens[0].querySelector(".xd"); announce.textContent = h ? Array.prototype.map.call(h.querySelectorAll("span"), function (x) { return x.textContent.trim(); }).join(" ") : ""; if (h) { h.focus(); } return; }
    if (current === total) { reset(); show(1); say("Journey reset."); return; }
    show(current + 1);
  }
  nextBtn.addEventListener("click", forward);
  prevBtn.addEventListener("click", function () { show(current - 1); });
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });
  document.getElementById("skip").addEventListener("click", function () { var h = headingOf(screens[current - 1]); if (h) { h.focus(); } });
  function fromHash() { var m = /#s\/([1-5])/.exec(location.hash); return m ? parseInt(m[1], 10) : null; }
  window.addEventListener("hashchange", function () { var n = fromHash(); if (n && n !== current) { show(n, false); } });
  show(fromHash() || 1, false);
})();
