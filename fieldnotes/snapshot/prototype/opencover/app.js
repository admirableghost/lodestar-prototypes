/* ══════════════════════════════════════════════════════════════════════════
   OpenCover · the agent that keeps checking
   No framework, no build step, no external request. Three files.

   SIX BEATS (Becca's brief, October 2026)
     1 · Muse already checking; nothing changes; then a green find
     2 · thousands checked, filtered, rejected with reasons, three left
     3 · the offer in context, her question, four checks, HER decision
     4 · months pass, one at a time, by hand; a decision at the boundary
     5 · the claim: the clock from agreed liability, the missed promise,
         the benefit pursued
     6 · the outcome

   THE RULES THAT CANNOT BEND
   · Only #choose-switch / #choose-stay (beat 3) and #m-switch / #m-stay
     (beat 4) change the policy. Next, the picker, a reload, autoplay and
     silence never do.
   · Nothing moves a screen on its own. Autoplay only advances the steps of
     the open screen, stops at a decision and at the end, and is cancelled
     the moment the screen changes.
   · OpenCover's claim terms apply only to an OpenCover policy. On any
     other policy the claim is an explicitly loaded, labelled example.

   THE STEP MODEL
   Each beat has a step index. Markup elements say when they are visible
   with data-from / data-to (inclusive) and which decision they belong to
   with data-choice ("none", "switch", "stay"). paintSteps() applies those;
   each beat's own painter does the rest. Beat 4's step is month − 1.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ══ ONE SOURCE OF TRUTH — the policies and the year ═════════════════════
     Illustrative, fictional figures. Premiums are paid in two six-month
     installments; months 1–6 are paid and non-refundable, so a switch only
     makes sense at the month-7 payment, and is compared on the NEXT SIX
     MONTHS only. */
  var POL = {
    harbor:    { id: "harbor",    name: "Harbor Insurance", short: "Harbor",    annual: 3400, settleDays: null, remedy: null,
                 claims: "no stated settlement time" },
    opencover: { id: "opencover", name: "OpenCover",        short: "OpenCover", annual: 3270, settleDays: 5,    remedy: 50,
                 claims: "settle within 5 business days of agreed liability, or $50 per late business day" },
    wren:      { id: "wren",      name: "Wren Mutual",      short: "Wren",      annual: 2990, settleDays: 10,   remedy: null,
                 claims: "settle within 10 business days, no late-payment benefit" }
  };
  var SWITCH_AT = 7;                       /* the installment boundary */
  function half(p) { return Math.round(p.annual / 2); }   /* 3270 → 1635 · 3400 → 1700 · 2990 → 1495 */

  /* the claim on the OpenCover policy: business days counted from AGREED LIABILITY */
  var CLAIM = { promised: 5, settled: 9, perDay: 50 };
  function lateDays() { return CLAIM.settled - CLAIM.promised; }          /* 4   */

  /* the months of beat 4: what Muse found, said once, kept in the log */
  var MONTHS = [
    { kind: "none",   chip: "No change",
      log: "No better offer",
      say: "Checked the market. Nothing better that meets your needs." },
    { kind: "reject", chip: "Rejected · fails a need",
      log: "Candlewick · cheaper, drops Rosa · rejected",
      say: "Candlewick Direct, $2,980 a year. Cheaper, but it excludes drivers under 25. Rosa is 19." },
    { kind: "hold",   chip: "Not worth switching yet",
      log: "Wren · suitable · not worth it yet",
      say: "Wren Mutual, $2,990 a year, meets your needs. But months 1–6 are already paid and non-refundable, so switching now wastes money. I'll recheck before your next payment." },
    { kind: "none",   chip: "No change",
      log: "No better offer",
      say: "Nothing better. Wren is still available; it stays on my list." },
    { kind: "reject", chip: "Rejected · fails a need",
      log: "Pell & Roe · excess $900 · rejected",
      say: "Pell & Roe, $2,900 a year. Excess $900, over your $500 limit." },
    { kind: "hold",   chip: "Not worth switching yet",
      log: "Wren rechecked · wait for month 7",
      say: "Wren rechecked: same terms. Your next payment is due in month 7. Switching then wastes nothing." },
    { kind: "found",  chip: "Worth your decision",
      log: "Wren · worth your decision",
      say: "Now it's worth a decision: Wren Mutual, from your next payment." }
  ];

  /* ══ STATE ═══════════════════════════════════════════════════════════════
     choice3 · null | "switch" | "stay"   — set ONLY by the beat-3 buttons
     choice4 · null | "switch" | "stay"   — set ONLY by the beat-4 buttons
     example · the presenter loaded the OpenCover claims example on a
               policy that is not OpenCover
     claimDone · the claim has been walked to settlement at least once
     step    · the step each beat is on; beat 4 stores month − 1
     Survives a reload (sessionStorage oc6-s). Restart clears it. */
  function fresh() { return { choice3: null, choice4: null, example: false, claimDone: false, step: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } }; }
  var S = fresh();
  try {
    var raw = JSON.parse(sessionStorage.getItem("oc6-s") || "null");
    if (raw && typeof raw === "object") {
      var okC = function (v) { return v === "switch" || v === "stay" ? v : null; };
      S.choice3 = okC(raw.choice3);
      S.choice4 = S.choice3 ? okC(raw.choice4) : null;
      S.example = raw.example === true;
      S.claimDone = raw.claimDone === true;
      if (raw.step && typeof raw.step === "object") {
        [1, 2, 3, 4, 5, 6].forEach(function (b) { var v = raw.step[b]; if (typeof v === "number" && v >= 0) { S.step[b] = Math.floor(v); } });
      }
    }
    /* the earlier builds' keys; never read */
    sessionStorage.removeItem("oc-s");
  } catch (e) { /* private mode, or a stored value that is not JSON */ }
  function persist() { try { sessionStorage.setItem("oc6-s", JSON.stringify(S)); } catch (e) { /* private mode */ } }

  /* the policy on risk before the boundary, and at month m */
  function basePolicy() { return S.choice3 === "switch" ? POL.opencover : POL.harbor; }
  function policyAt(m) { return (S.choice4 === "switch" && m >= SWITCH_AT) ? POL.wren : basePolicy(); }
  function policyNow() { return S.choice4 === "switch" ? POL.wren : basePolicy(); }
  /* the claim beat runs on an OpenCover policy, or as a loaded example */
  function claimAvailable() { return policyNow().id === "opencover" || S.example; }

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function usd(n) { return "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function reduce() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  var announceEl = document.getElementById("announce"), sayTimer = null;
  function say(msg) {
    if (!announceEl) { return; }
    /* clear first, so the same sentence twice is still read twice */
    clearTimeout(sayTimer);
    announceEl.textContent = "";
    sayTimer = setTimeout(function () { announceEl.textContent = msg; }, 30);
  }

  /* ══ STEP COUNTS, GATES AND WORDS ════════════════════════════════════════ */
  function count(b) {
    if (b === 1) { return 4; }
    if (b === 2) { return 4; }
    if (b === 3) { return S.choice3 === "switch" ? 11 : S.choice3 === "stay" ? 9 : 7; }
    if (b === 4) { return S.choice3 ? MONTHS.length : 0; }
    if (b === 5) { return claimAvailable() ? 6 : 0; }
    return 0;
  }
  function stepOf(b) { var c = count(b); return c ? Math.min(S.step[b], c - 1) : 0; }

  /* a forward move off the screen is blocked while a decision is the
     customer's to make, or while the screen has nothing to show */
  function blocker(b) {
    if (b === 3 && !S.choice3) { return "Decision needed"; }
    if (b === 4 && !S.choice3) { return "Decision needed"; }
    if (b === 4 && !S.choice4) { return "Decision needed"; }
    if (b === 5 && !claimAvailable()) { return "Load the example"; }
    return "";
  }
  /* the chrome names where Next goes; the in-screen buttons carry the full calls to action */
  var NEXT_LABEL = { 1: "The search", 2: "Diligence", 3: "The months", 4: "The claim", 5: "The outcome" };

  /* what each step says, read aloud with what is shown */
  var T1 = [
    "Muse is checking on its own. Monday and Wednesday: nothing better. Your current policy remains the best fit.",
    "Friday: your renewal arrives at $3,400 a year. Still the best fit.",
    "Today: Muse is checking again.",
    "Worth your attention: OpenCover, $3,270 a year. It keeps Rosa covered and costs $130 less than your renewal."
  ];
  var T2 = [
    "Muse searches thousands of car insurance offers.",
    "It holds each one to what matters to you: no gap, Rosa covered, excess under $500. A handful pass.",
    "Cheaper isn't enough. Candlewick Direct, $3,050, excludes drivers under 25. Brightline, $3,120, starts 9 days after your renewal: a gap. Pell and Roe, $3,180, has a $900 excess.",
    "Three are worth considering: OpenCover at $3,270, the best fit; Lantern Mutual at $3,310; and your Harbor renewal at $3,400."
  ];
  var T3 = [
    "The offer in context. Your Harbor renewal is $3,400 a year. OpenCover offers $3,270: $130 less.",
    "You ask: who is OpenCover, and why do you recommend it? Muse checks OpenCover for you.",
    "Coverage and exclusions: the same cover as today. Rosa named, excess $450. Excludes business use, as now.",
    "Financial health: published accounts reviewed; capital above its required level. Illustrative.",
    "Claims denials: published record reviewed; denials below the market norm. Illustrative.",
    "Service commitment, in the contract: settle within 5 business days of agreed liability, or $50 per late business day.",
    "Muse recommends OpenCover: it meets all three of your needs and puts its claims promise in writing. It is also $130 less. Your decision: switch to OpenCover, or keep your current policy. Nothing changes until you choose."
  ];
  var T3_SWITCH = [
    "You chose OpenCover. Muse applies with your details.",
    "OpenCover confirms: covered from your renewal date.",
    "Only then is Harbor told not to renew. No gap.",
    "Done. You're with OpenCover. Muse is still checking."
  ];
  var T3_STAY = [
    "You kept Harbor. Your $3,400 renewal stays active.",
    "Monitoring stays on. Muse will bring you anything worth a look."
  ];
  var T5 = [
    "Step 1. A claim is reported. Muse files it. The clock has not started: OpenCover's promise runs from agreed liability.",
    "Step 2. OpenCover agrees liability. The 5-business-day settlement clock starts.",
    "Step 3. Five business days pass without settlement.",
    "Step 4. Business day 6, still unsettled. Muse detects the missed commitment.",
    "Step 5. Muse pursues the late-payment benefit: it asks OpenCover to apply $50 for each late business day, as the contract states.",
    "Step 6. Settled on business day 9. 4 late business days times $50 is $200, confirmed by OpenCover. No separate claim needed."
  ];
  function stepText(b, n) {
    if (b === 1) { return T1[n]; }
    if (b === 2) { return T2[n]; }
    if (b === 3) {
      if (n < 7) { return T3[n]; }
      return (S.choice3 === "switch" ? T3_SWITCH : T3_STAY)[n - 7] || "";
    }
    if (b === 4) { return monthText(n + 1); }
    if (b === 5) { return T5[n]; }
    return "";
  }

  /* ══ THE GENERIC STEP PAINTER ════════════════════════════════════════════ */
  function paintSteps(sc, step, choice, animate) {
    sc.dataset.step = String(step);
    Array.prototype.forEach.call(sc.querySelectorAll("[data-from],[data-to],[data-choice]"), function (el) {
      var f = el.hasAttribute("data-from") ? +el.dataset.from : -1;
      var t = el.hasAttribute("data-to") ? +el.dataset.to : 1e9;
      var ok = step >= f && step <= t;
      if (el.hasAttribute("data-choice")) { ok = ok && el.dataset.choice.split(" ").indexOf(choice || "none") >= 0; }
      el.hidden = !ok;
      el.classList.remove("is-new");
      if (ok && animate && f === step) { void el.offsetWidth; el.classList.add("is-new"); }
    });
  }

  /* ══ BEAT 2 · the review strip ═══════════════════════════════════════════
     One mark per offer. Step 0 the lens sweeps and every mark is read;
     step 1 most fall away (fail a need); step 2 the three cheaper ones that
     fail turn warm; step 3 only the three shortlisted stand, in blue. */
  var MARKS = 96, SHORT = [17, 49, 80], REJ = [8, 33, 64], PASS = [24, 41, 57, 72, 89];
  (function paintStream() {
    var host = document.getElementById("stream");
    if (!host) { return; }
    var s = [], i, step = 1200 / MARKS;
    for (i = 0; i < MARKS; i++) {
      var x = step * (i + 0.5), h = 20 + ((i * 7) % 5) * 6;
      var k = SHORT.indexOf(i) >= 0 ? "short" : REJ.indexOf(i) >= 0 ? "rej" : PASS.indexOf(i) >= 0 ? "pass" : "out";
      s.push('<rect class="mark" data-k="' + k + '" style="--d:' + (i / MARKS * 2.8).toFixed(2) + 's" x="' + (x - 3.5).toFixed(1) +
             '" y="' + (66 - h) + '" width="7" height="' + h + '" rx="1"/>');
    }
    host.innerHTML = s.join("");
  })();

  var TRADE = {
    opencover: "OpenCover: the lowest of the three, and its claims promise is in the contract.",
    lantern: "Lantern Mutual: $40 more than OpenCover, slower to settle claims, and no late-payment benefit.",
    harbor: "Harbor, your renewal: $130 more than OpenCover, and no stated settlement time."
  };
  Array.prototype.forEach.call(document.querySelectorAll("[data-of]"), function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll("[data-of]"), function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      var t = document.getElementById("tradeoff");
      if (t) { t.textContent = TRADE[b.dataset.of]; }
      refit();
    });
  });

  /* ══ BEAT 3 · the decision ═══════════════════════════════════════════════ */
  function paint3() {
    var st = stepOf(3);
    Array.prototype.forEach.call(document.querySelectorAll(".oc3 [data-lit-at]"), function (li) {
      var at = +li.dataset.litAt;
      li.dataset.lit = st === at ? "now" : st > at ? "1" : "0";
    });
    setText("decided-t", S.choice3 === "switch" ? "You chose to switch to OpenCover." : S.choice3 === "stay" ? "You chose to keep your current policy." : "");
  }
  function choose3(c) {
    if (S.choice3 || stepOf(3) < 6) { return; }   /* only after the diligence, only once */
    stopPlay();
    S.choice3 = c; S.choice4 = null; S.step[4] = 0; S.step[5] = 0; S.claimDone = false; S.example = false;
    persist();
    setStep(3, 7, true);
    var h = document.getElementById("decided-t"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }
  bind("choose-switch", function () { choose3("switch"); });
  bind("choose-stay", function () { choose3("stay"); });
  bind("ask", function () { stopPlay(); setStep(3, 1, true); });
  /* a presenter control: clears her decision and everything that followed it */
  bind("revisit", function () {
    stopPlay();
    S.choice3 = null; S.choice4 = null; S.step[3] = 6; S.step[4] = 0; S.step[5] = 0; S.claimDone = false; S.example = false;
    persist(); render(3, false);
    say("Decision cleared by the presenter. Your decision: switch to OpenCover, or keep your current policy.");
    var b = document.getElementById("choose-switch"); if (b) { b.focus(); }
  });

  /* ══ BEAT 4 · the months ═════════════════════════════════════════════════ */
  function monthText(m) {
    var cur = basePolicy(), mo = MONTHS[m - 1];
    if (m < SWITCH_AT) { return "Month " + m + ". " + mo.chip + ". " + mo.say; }
    var t = "Month " + m + ". Worth your decision. Next six months: " + cur.short + " " + usd(half(cur)) + ", Wren Mutual " + usd(half(POL.wren)) +
            ". You'd save " + usd(half(cur) - half(POL.wren)) + ". " + tradeText(cur);
    if (!S.choice4) { return t + " Your decision: switch to Wren Mutual, or keep " + cur.short + ". Nothing changes until you choose."; }
    return t + " " + doneLines(cur).join(" ");
  }
  function tradeText(cur) {
    return cur.id === "opencover"
      ? "It meets all three of your needs. Trade-off: Wren settles claims in 10 business days, with no late-payment benefit. OpenCover promises 5, or $50 a day."
      : "It meets all three of your needs. Its claims promise is 10 business days; Harbor states no time.";
  }
  function doneLines(cur) {
    return S.choice4 === "switch"
      ? ["You chose Wren. Applying with your details.", "Wren confirms: covered from month 7.", "Only then: " + cur.short + " ends at the payment date. No gap, no penalty.", "Done. I'm still checking."]
      : ["You kept " + cur.short + ". Nothing changes.", "I'm still checking."];
  }
  function paintYearBar(m) {
    var host = document.getElementById("yearbar");
    if (!host) { return; }
    var x0 = 6, seg = (1200 - 12) / 12, s = [], i;
    for (i = 1; i <= 12; i++) {
      var x = x0 + (i - 1) * seg, pol = policyAt(i), past = i <= m;
      var fill = past ? (pol.id === "wren" ? "rgba(47,107,69,.22)" : "url(#oc-hatch-grey)") : "rgba(47,94,124,.10)";
      var stroke = past ? (pol.id === "wren" ? "#2F6B45" : "#8C8574") : "#2F5E7C";
      s.push('<rect x="' + (x + 3).toFixed(1) + '" y="34" width="' + (seg - 6).toFixed(1) + '" height="40" rx="2" fill="' + fill +
             '" stroke="' + stroke + '" stroke-width="1.6" vector-effect="non-scaling-stroke"/>');
    }
    /* the boundary: the month-7 payment */
    var bx = x0 + (SWITCH_AT - 1) * seg;
    s.push('<line x1="' + bx.toFixed(1) + '" y1="22" x2="' + bx.toFixed(1) + '" y2="86" stroke="#8A3450" stroke-width="3" vector-effect="non-scaling-stroke"/>');
    /* Muse's signal along the top, the lens at the month being checked */
    var mx = x0 + (m - 0.5) * seg;
    s.push('<line x1="' + x0 + '" y1="14" x2="' + (1200 - x0) + '" y2="14" stroke="#8A3450" stroke-width="2" opacity=".42" vector-effect="non-scaling-stroke"/>');
    s.push('<line x1="' + mx.toFixed(1) + '" y1="14" x2="' + mx.toFixed(1) + '" y2="80" stroke="#8A3450" stroke-width="2.5" vector-effect="non-scaling-stroke"/>');
    s.push('<circle cx="' + mx.toFixed(1) + '" cy="14" r="9" fill="#262E36" stroke="#D98BA6" stroke-width="2.5" vector-effect="non-scaling-stroke"/>');
    host.innerHTML = s.join("");
  }
  function paint4(animate) {
    var on = document.getElementById("year-on"), pend = document.getElementById("year-pending");
    var held = document.getElementById("year-held");
    if (!S.choice3) {
      if (on) { on.hidden = true; } if (pend) { pend.hidden = false; }
      if (held) { held.innerHTML = '<span class="held-k">Your policy</span> · <b>Harbor Insurance</b>'; }
      return;
    }
    if (on) { on.hidden = false; } if (pend) { pend.hidden = true; }
    var m = stepOf(4) + 1, mo = MONTHS[m - 1], cur = basePolicy(), now = policyAt(m);
    if (held) { held.innerHTML = '<span class="held-k">Your policy</span> · <b>' + esc(now.name) + "</b>"; }
    paintYearBar(m);

    var log = document.getElementById("mlog");
    if (log) {
      log.innerHTML = MONTHS.slice(0, m).map(function (x, i) {
        return '<li class="mlog-i mlog-i--' + x.kind + (i === m - 1 ? " is-now" : "") + '"><span class="mlog-m">Month ' + (i + 1) + "</span>" + esc(x.log) + "</li>";
      }).join("");
    }
    var card = document.getElementById("month-card");
    if (card) {
      card.dataset.kind = mo.kind;
      card.classList.remove("is-new");
      if (animate) { void card.offsetWidth; card.classList.add("is-new"); }
    }
    setText("month-name", "Month " + m + " · checking for you");
    var chip = document.getElementById("month-chip"); if (chip) { chip.textContent = mo.chip; chip.dataset.kind = mo.kind; }
    setText("month-say", mo.say);

    var boundary = m >= SWITCH_AT;
    var cmp = document.getElementById("month-compare"), trade = document.getElementById("month-trade");
    var done = document.getElementById("month-done"), decide = document.getElementById("month-decide");
    if (cmp) { cmp.hidden = !boundary; }
    if (trade) { trade.hidden = !boundary; trade.textContent = tradeText(cur); }
    if (boundary) {
      setText("cmp-a-name", cur.short); setText("cmp-a", usd(half(cur)));
      setText("cmp-b", usd(half(POL.wren))); setText("cmp-save", usd(half(cur) - half(POL.wren)));
      setText("m-stay", "Keep " + cur.short);
    }
    if (decide) { decide.hidden = !(boundary && !S.choice4); }
    if (done) {
      done.hidden = !(boundary && S.choice4);
      done.innerHTML = (boundary && S.choice4) ? doneLines(cur).map(function (t) {
        return '<li class="astep"><span class="tick" aria-hidden="true">✓</span>' + esc(t) + "</li>";
      }).join("") : "";
    }
  }
  function choose4(c) {
    if (!S.choice3 || S.choice4 || stepOf(4) + 1 < SWITCH_AT) { return; }
    stopPlay();
    S.choice4 = c; S.step[5] = 0; S.claimDone = false; S.example = false;
    persist(); render(4, true);
    say(monthText(SWITCH_AT));
    var d = document.getElementById("month-done"); if (d) { d.setAttribute("tabindex", "-1"); d.focus({ preventScroll: true }); }
  }
  bind("m-switch", function () { choose4("switch"); });
  bind("m-stay", function () { choose4("stay"); });

  /* ══ BEAT 5 · the claim ══════════════════════════════════════════════════ */
  function paintClock(st) {
    var host = document.getElementById("clock");
    if (!host) { return; }
    var cells = [], d;
    for (d = 1; d <= CLAIM.settled; d++) {
      var cls = "cday";
      if (st >= 2 && d <= CLAIM.promised) { cls += " cday--ok"; }
      else if ((st >= 3 && st < 5 && d === CLAIM.promised + 1) || (st >= 5 && d > CLAIM.promised)) { cls += " cday--late"; }
      else { cls += " cday--future"; }
      if (st >= 5 && d === CLAIM.settled) { cls += " cday--settle"; }
      cells.push('<div class="' + cls + '"><span><i>Day </i>' + d + "</span></div>");
    }
    var lateN = st >= 5 ? lateDays() : st >= 3 ? 1 : 0;
    host.innerHTML =
      '<p class="clock-start" data-on="' + (st >= 1 ? 1 : 0) + '">' + (st >= 1 ? "Liability agreed · clock starts" : "Clock not started") + "</p>" +
      '<div class="clock-grid">' +
        '<span class="clock-l clock-l--ok" data-on="' + (st >= 2 ? 1 : 0) + '">Promise · 5 business days</span>' +
        '<span class="clock-l clock-l--late" data-on="' + (lateN ? 1 : 0) + '">' + (lateN ? "Late · " + lateN + (lateN === 1 ? " day" : " days") : "") + "</span>" +
        cells.join("") +
      "</div>";
  }
  function paint5() {
    var on = document.getElementById("claim-on"), pend = document.getElementById("claim-pending");
    var held = document.getElementById("claim-held"), tag = document.getElementById("example-tag");
    var pol = policyNow();
    if (!claimAvailable()) {
      if (on) { on.hidden = true; } if (pend) { pend.hidden = false; }
      if (held) { held.innerHTML = '<span class="held-k">Your policy</span> · <b>' + esc(pol.name) + "</b>"; }
      setText("claim-pending-l", "Your policy is with " + pol.name + ". Its claims terms: " + pol.claims + ". OpenCover's terms don't apply to it.");
      return;
    }
    if (on) { on.hidden = false; } if (pend) { pend.hidden = true; }
    var isEx = pol.id !== "opencover";
    if (held) { held.innerHTML = isEx ? '<span class="held-k">Example</span> · <b>OpenCover terms</b>' : '<span class="held-k">Your policy</span> · <b>OpenCover</b>'; }
    if (tag) { tag.hidden = !isEx; tag.textContent = isEx ? "Illustrative example, loaded by the presenter: an OpenCover policy. Your policy in this story is with " + pol.name + "." : ""; }
    var st = stepOf(5);
    paintClock(st);
    Array.prototype.forEach.call(document.querySelectorAll("#csteps .cstep"), function (li) {
      li.classList.toggle("is-now", +li.dataset.from === st);
    });
    if (st >= 5 && !S.claimDone) { S.claimDone = true; persist(); }
  }
  bind("load-example", function () {
    S.example = true; S.step[5] = 0; persist(); render(5, true);
    say("Presenter loaded the OpenCover claims example. " + T5[0]);
  });
  bind("replay-claim", function () { S.step[5] = 0; persist(); show(5); });

  /* ══ BEAT 6 · the outcome ════════════════════════════════════════════════ */
  function outcomeReady() { return S.claimDone && claimAvailable(); }
  function paint6() {
    var ok = outcomeReady();
    var on = document.getElementById("out-on"), pend = document.getElementById("out-pending");
    if (on) { on.hidden = !ok; } if (pend) { pend.hidden = ok; }
  }

  /* ══ RENDER ONE BEAT ═════════════════════════════════════════════════════ */
  function render(b, animate) {
    var sc = screens[b - 1];
    if (!sc) { return; }
    paintSteps(sc, stepOf(b), b === 3 ? S.choice3 : null, animate);
    if (b === 3) { paint3(); }
    if (b === 4) { paint4(animate); }
    if (b === 5) { paint5(); }
    if (b === 6) { paint6(); }
    if (b === current) { paintChrome(); refit(); }
  }
  function setStep(b, n, animate) {
    var c = count(b);
    if (!c) { return; }
    n = Math.max(0, Math.min(c - 1, n));
    /* the decision is a gate: no step past it until she has chosen */
    if (b === 3 && !S.choice3) { n = Math.min(n, 6); }
    var was = stepOf(b);
    S.step[b] = n; persist();
    render(b, !!animate && n === was + 1 && !reduce());
    if (b === current) { say(stepText(b, n)); }
  }

  /* ══ THE PLAYER — presenter controls for the open screen ═════════════════
     Manual by default. Play advances one step at a reading pace and stops
     at a decision, at the end, on any other control, and on leaving. */
  var play = { on: false, timer: null };
  var PACE = { 1: 4200, 2: 4200, 3: 4200, 4: 5600, 5: 4600 };
  function canStep(b) { var c = count(b); return c > 0 && stepOf(b) < c - 1 && !(b === 3 && !S.choice3 && stepOf(3) >= 6); }
  function stopPlay() { var was = play.on; play.on = false; clearTimeout(play.timer); play.timer = null; if (was) { paintChrome(); } }
  function tick() {
    clearTimeout(play.timer);
    if (!play.on) { return; }
    play.timer = setTimeout(function () {
      if (!play.on) { return; }
      if (!canStep(current)) { stopPlay(); return; }
      setStep(current, stepOf(current) + 1, true);
      if (!canStep(current)) { stopPlay(); return; }
      tick();
    }, PACE[current] || 4200);
  }
  function startPlay() {
    if (!canStep(current)) { return; }
    play.on = true; paintChrome(); tick();
    say("Playing: " + (current === 4 ? "one month" : "one step") + " every few seconds. Pause at any time.");
  }
  bind("p-play", function () { if (play.on) { stopPlay(); say("Paused."); } else { startPlay(); } });
  bind("p-prev", function () { stopPlay(); setStep(current, stepOf(current) - 1, false); });
  bind("p-next", function () { stopPlay(); if (canStep(current)) { setStep(current, stepOf(current) + 1, true); } });
  bind("p-replay", function () { stopPlay(); setStep(current, 0, false); render(current, true); });
  bind("p-all", function () { stopPlay(); setStep(current, count(current) - 1, false); });

  function paintChrome() {
    var b = current, c = count(b), st = stepOf(b);
    var has = c > 1;
    var player = document.getElementById("player");
    if (player) { player.dataset.off = has ? "0" : "1"; }
    dis("p-replay", !has || st === 0);
    dis("p-prev", !has || st === 0);
    dis("p-next", !canStep(b));
    dis("p-all", !canStep(b));
    dis("p-play", !play.on && !canStep(b));
    var pp = document.getElementById("p-play");
    if (pp) { pp.setAttribute("aria-pressed", play.on ? "true" : "false"); pp.setAttribute("aria-label", play.on ? "Pause" : "Play the steps"); }
    setText("p-play-g", play.on ? "❚❚" : "▶");
    setText("p-play-l", play.on ? "Pause" : "Play");
    setText("p-at", has ? (b === 4 ? "Month " + (st + 1) + " of " + c : "Step " + (st + 1) + " of " + c) : "");

    var nb = document.getElementById("next"), nl = document.getElementById("next-label");
    var label, off = false;
    if (canStep(b)) { label = b === 4 ? "Next month" : "Next step"; }
    else if (blocker(b)) { label = blocker(b); off = true; }
    else if (b === total) { label = ""; }
    else { label = NEXT_LABEL[b]; }
    if (nb) { nb.hidden = !label; nb.disabled = off; }
    if (nl) { nl.textContent = label; }
    var pb = document.getElementById("prev"); if (pb) { pb.disabled = b === 1; }
  }

  /* ══ NAVIGATION ══════════════════════════════════════════════════════════ */
  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var total = screens.length;
  var picker = document.getElementById("picker");
  var current = 1;

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  /* Next: the open screen's next step first; then the next screen, unless a
     decision is the customer's to make. It never decides anything. */
  function forward() {
    if (canStep(current)) { stopPlay(); setStep(current, stepOf(current) + 1, true); return; }
    if (blocker(current) || current === total) { return; }
    show(current + 1);
  }

  function show(n, push) {
    n = Math.max(1, Math.min(total, n));
    stopPlay();
    current = n;
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    picker.value = String(n);
    render(n, false);
    paintChrome();
    fitScreen(screens[n - 1]);
    var sc = screens[n - 1], h = sc.querySelector(".display");
    var extra = count(n) ? " " + stepText(n, stepOf(n)) : pendingText(n);
    say("Screen " + n + " of " + total + ". " + (h ? h.textContent.trim() : sc.dataset.label) + extra);
    if (push !== false) { try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ } }
  }
  function pendingText(n) {
    if (n === 4 && !S.choice3) { return " No decision on the OpenCover offer yet. Your current policy stays as it is. One action: back to the decision."; }
    if (n === 5 && !claimAvailable()) { return " Your policy is with " + policyNow().name + ". OpenCover's terms don't apply to it. One action: load the OpenCover claims example."; }
    if (n === 6) { return outcomeReady() ? " Claim settled. $200 late-payment benefit, confirmed by OpenCover. Muse is still checking." : " The claim hasn't been walked through yet. One action: go to the claim."; }
    return "";
  }

  /* starting over: nothing decided, every screen at its first step */
  function restart() { S = fresh(); persist(); screens.forEach(function (sc, i) { render(i + 1, false); }); show(1); }

  document.getElementById("prev").addEventListener("click", function () { show(current - 1); });
  document.getElementById("next").addEventListener("click", forward);
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto],[data-restart]") : null;
    if (!t) { return; }
    if (t.hasAttribute("data-restart")) { restart(); return; }
    var to = parseInt(t.dataset.goto, 10);
    if (to > current && blocker(current)) { return; }
    show(to);
  });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button" || tag === "a") { return; }
    if (e.key === "ArrowRight") { e.preventDefault(); forward(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
  });

  /* ══ FIT — the one-screen composition shrinks before it would scroll ═════
     Desktop and iPad only; a phone scrolls and keeps its type size. */
  var FIT_FLOOR = 0.78;
  function narrow() { return window.matchMedia("(max-width: 899px)").matches; }
  function spills(sc) { return sc.scrollHeight > sc.clientHeight + 1; }
  function fitScreen(sc) {
    if (!sc || sc.hidden) { return; }
    sc.style.setProperty("--fit", "1");
    if (narrow() || !spills(sc)) { return; }
    var lo = FIT_FLOOR, hi = 1, best = FIT_FLOOR, mid, i;
    for (i = 0; i < 7; i++) {
      mid = (lo + hi) / 2;
      sc.style.setProperty("--fit", mid.toFixed(4));
      if (spills(sc)) { hi = mid; } else { lo = mid; best = mid; }
    }
    sc.style.setProperty("--fit", best.toFixed(4));
  }
  var fitPending = null;
  function refit() {
    cancelAnimationFrame(fitPending);
    fitPending = requestAnimationFrame(function () { fitScreen(screens[current - 1]); });
  }
  var relayout;
  window.addEventListener("resize", function () { clearTimeout(relayout); relayout = setTimeout(refit, 140); });

  /* ══ SMALL HELPERS ═══════════════════════════════════════════════════════ */
  function bind(id, fn) { var el = document.getElementById(id); if (el) { el.addEventListener("click", fn); } }
  function setText(id, t) { var el = document.getElementById(id); if (el) { el.textContent = t; } }
  function dis(id, v) { var el = document.getElementById(id); if (el) { el.disabled = !!v; } }

  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var h = screens[current - 1].querySelector(".display");
      if (h) { h.focus(); h.scrollIntoView({ block: "start" }); }
    });
  }

  function fromHash() { var m = /#s\/(\d+)/.exec(location.hash); return m ? parseInt(m[1], 10) : null; }
  window.addEventListener("hashchange", function () { var n = fromHash(); if (n !== null && n !== current) { show(n, false); } });

  /* every screen painted once, so a hidden one never holds stale state */
  screens.forEach(function (sc, i) { render(i + 1, false); });
  show(fromHash() || 1, false);
})();
