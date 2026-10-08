/* ══════════════════════════════════════════════════════════════════════════
   Home Again · the renewal moment
   No framework, no build step, no external request. Three files and photos.

   THE STORY. At policy renewal a household sees, before any loss, exactly
   how it would be cared for, and chooses whether to add it.
     1  home     the policy as it stands, and the Harbor offer at +$42
     2  plan     the arrangement assembles — home, furnished housing, Marta,
                 the build window — then the explicit choice
     3  homes    Harbor, large; two alternatives, small; one chosen
     4  review   the summary and the premium; confirm or go back
     5  done     "Home Again is added to your policy" (or the coverage
                 stays as it is)
   Behind the presenter menu only: a simulated covered loss, and the
   stakeholder economics. Neither is in the main flow.

   ONE STATE. { route, choice, model, confirmed, confirmedChoice,
   confirmedModel, played } is the only source of truth, kept in
   sessionStorage for the tab. Nothing is chosen until a choice button is
   pressed; nothing is added until #confirmBtn is pressed. Navigation, the
   step bar, deep links and the forward button never choose or confirm.

   WHAT IS INVENTED. The household, the address, Harbor, Pacific, Cypress,
   every price and window, and Marta. The footer says so on every screen.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── content ──────────────────────────────────────────────────────────── */
  var BASE = 240;
  var HOMES = {
    Harbor:  { name: "Harbor",  beds: "3 bed", sqft: "1,650 sq ft", price: "$482K", weeks: "20–24 weeks", housing: "12 months", fee: 42, photo: "photos/harbor.jpg",  w: 1600, h: 1066, alt: "A compact modern home with its windows lit at dusk, standing in for Harbor." },
    Pacific: { name: "Pacific", beds: "3 bed", sqft: "1,820 sq ft", price: "$538K", weeks: "22–26 weeks", housing: "14 months", fee: 47, photo: "photos/pacific.jpg", w: 1200, h: 800,  alt: "A single-storey modern home with cedar cladding and a wide drive, standing in for Pacific." },
    Cypress: { name: "Cypress", beds: "4 bed", sqft: "2,050 sq ft", price: "$612K", weeks: "26–30 weeks", housing: "15 months", fee: 53, photo: "photos/cypress.jpg", w: 1200, h: 801,  alt: "A large two-storey modern home with glass walls and a lawn, standing in for Cypress." }
  };
  var ORDER = ["Harbor", "Pacific", "Cypress"];
  var COORD = "Marta";
  var FURNISHED = { photo: "photos/furnished.jpg", w: 1600, h: 1066, alt: "A bright furnished open-plan living room with a sofa and a dining table, standing in for temporary housing." };
  var YOUR_HOME = { photo: "photos/your-home.jpg", w: 1600, h: 1062, alt: "A white two-storey house with blue shutters on a green lawn, standing in for the household's home." };
  var DEPENDS = "Site clearance and permits depend on the county and the site. Home Again coordinates both; the county sets the timing.";

  var ROUTES = ["home", "plan", "homes", "review", "done", "day", "business"];
  var STEPS = ["home", "plan", "homes", "review"];
  var LABELS = { home: "Your home", plan: "Your recovery plan", homes: "Choose your home", review: "Confirm coverage", done: "Confirmation", day: "A covered loss, simulated", business: "Stakeholder economics" };
  var STORE = "home-again.renewal.v1";

  /* ── state ────────────────────────────────────────────────────────────── */
  var S = fresh();
  function fresh() { return { route: "home", choice: null, model: "Harbor", confirmed: false, confirmedChoice: null, confirmedModel: null, played: false }; }
  function persist() { try { sessionStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* private mode */ } }
  function restore() {
    var v = null;
    try { v = JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (e) { v = null; }
    if (!v || typeof v !== "object") { return; }
    var n = fresh();
    if (v.choice === "homeagain" || v.choice === "standard") { n.choice = v.choice; }
    if (HOMES[v.model]) { n.model = v.model; }
    if (v.confirmed === true && (v.confirmedChoice === "homeagain" || v.confirmedChoice === "standard")) { n.confirmed = true; n.confirmedChoice = v.confirmedChoice; n.confirmedModel = HOMES[v.confirmedModel] ? v.confirmedModel : "Harbor"; }
    n.played = v.played === true;
    if (ROUTES.indexOf(v.route) >= 0) { n.route = v.route; }
    S = n;
  }

  /* ── dom ──────────────────────────────────────────────────────────────── */
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var screens = $$(".screen");
  var stepBtns = $$(".stepnav");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function money(n) { return "$" + n.toLocaleString("en-US"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function img(o, extra) { return '<img src="' + o.photo + '" width="' + o.w + '" height="' + o.h + '" alt="' + esc(o.alt) + '"' + (extra || "") + ">"; }
  function setPressed(el, on) { el.setAttribute("aria-pressed", on ? "true" : "false"); }

  var announceEl = $("announce");
  function announce(msg) { announceEl.textContent = ""; setTimeout(function () { announceEl.textContent = msg; }, 30); }
  var toastTimer;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2200); }

  /* ── routing ──────────────────────────────────────────────────────────── */
  function allowed(route) {
    if (route === "homes") { return S.choice === "homeagain"; }
    if (route === "review") { return S.choice !== null; }
    if (route === "done") { return S.confirmed; }
    if (route === "day") { return S.confirmed && S.confirmedChoice === "homeagain"; }
    return ROUTES.indexOf(route) >= 0;
  }
  var businessReturn = "home";

  function show(route, opts) {
    opts = opts || {};
    if (!allowed(route)) { route = "plan"; }
    S.route = route;
    document.body.setAttribute("data-route", route);
    screens.forEach(function (sc) { sc.hidden = sc.getAttribute("data-route") !== route; });
    var idx = STEPS.indexOf(route);
    stepBtns.forEach(function (b, i) {
      b.classList.toggle("active", i === idx);
      b.classList.toggle("done", idx >= 0 && i < idx);
      if (i === idx) { b.setAttribute("aria-current", "step"); } else { b.removeAttribute("aria-current"); }
    });
    closeMenu();
    if (route === "plan") { paintPlan(); if (S.played || opts.restored) { asmAll(true); } else { runAssemble(); } }
    if (route === "homes") { paintHomes(); }
    if (route === "review") { paintReview(); }
    if (route === "done") { paintDone(); }
    if (route === "day") { paintDay(); if (opts.restored) { dayAll(true); } else { runDay(); } }
    if (route === "business") { calcBusiness(); }
    persist();
    try { history.replaceState(null, "", "#" + route); } catch (e) { /* file:// */ }
    window.scrollTo(0, 0);
    var h = $("h-" + route);
    if (h && !opts.silent) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    if (!opts.silent) { announce(LABELS[route] + ". " + (h ? h.textContent.replace(/\s+/g, " ").trim() : "")); }
  }

  /* the forward action on screen 2 refuses until something is chosen */
  function refuse() {
    toast("Choose Add Home Again or Keep standard coverage to continue.");
    announce("Nothing is chosen yet. Choose Add Home Again or Keep standard coverage to continue.");
    try { $("chooseAgain").focus({ preventScroll: false }); } catch (e) { $("chooseAgain").focus(); }
  }
  function goStep(target) {
    if (target === "homes" && S.choice !== "homeagain") {
      show("plan");
      if (S.choice === "standard") { toast("Replacement homes are part of Home Again. Choose Add Home Again to see them."); announce("Replacement homes are part of Home Again. Choose Add Home Again to see them."); }
      else { refuse(); }
      return;
    }
    if (target === "review" && S.choice === null) { show("plan"); refuse(); return; }
    show(target);
  }
  function forward() {
    switch (S.route) {
      case "home": show("plan"); break;
      case "plan": if (S.choice === null) { refuse(); } else { show(S.choice === "homeagain" ? "homes" : "review"); } break;
      case "homes": show("review"); break;
      case "review": confirmChoice(); break;
      case "done": show("review"); break;
      default: break;
    }
  }
  function back() {
    switch (S.route) {
      case "plan": show("home"); break;
      case "homes": show("plan"); break;
      case "review": show(S.choice === "homeagain" ? "homes" : "plan"); break;
      case "done": show("review"); break;
      case "day": show("done"); break;
      case "business": show(businessReturn); break;
      default: break;
    }
  }

  /* ── screen 2 · the arrangement assembles ─────────────────────────────── */
  var slots = $$("#assemble .slot");
  var asmTimers = [];
  function asmClear() { asmTimers.forEach(clearTimeout); asmTimers = []; }
  function asmSet(n) { slots.forEach(function (s, i) { s.setAttribute("data-on", i < n ? "1" : "0"); }); }
  function asmStatus(text, done) { var el = $("asmStatus"); el.textContent = text; el.classList.toggle("is-done", !!done); }
  function runAssemble() {
    asmClear();
    if (reduced) { asmAll(false); return; }
    asmSet(0); asmStatus("Arranging…", false);
    announce("Arranging your recovery plan.");
    slots.forEach(function (s, i) {
      asmTimers.push(setTimeout(function () { asmSet(i + 1); if (i === slots.length - 1) { asmDone(false); } }, 420 + i * 780));
    });
  }
  function asmAll(quiet) { asmClear(); asmSet(slots.length); asmDone(quiet); }
  function asmDone(quiet) {
    S.played = true; persist();
    asmStatus("Arranged", true);
    if (!quiet) { announce("Arranged: Harbor as your replacement home, a furnished place nearby for up to 12 months, " + COORD + " coordinating, and a 20 to 24 week estimated build window."); }
  }

  /* ── screen 2 · the explicit choice ───────────────────────────────────── */
  function selectChoice(c) {
    S.choice = c; persist(); paintPlan();
    var h = HOMES[S.model];
    announce(c === "homeagain" ? "Add Home Again chosen. " + money(BASE + h.fee) + " a month if you confirm. Continue to see your replacement homes." : "Keep standard coverage chosen. Your premium stays " + money(BASE) + " a month. Continue to review.");
  }
  function paintPlan() {
    setPressed($("chooseAgain"), S.choice === "homeagain");
    setPressed($("chooseStandard"), S.choice === "standard");
    var h = HOMES[S.model], sum = $("choiceSummary"), next = $("planNext");
    if (S.choice === "homeagain") {
      sum.innerHTML = "<strong>Home Again, ready to add</strong><br>With " + esc(h.name) + ": " + money(BASE + h.fee) + "/month if you confirm.";
      next.innerHTML = 'See your replacement homes <span aria-hidden="true">→</span>';
    } else if (S.choice === "standard") {
      sum.innerHTML = "<strong>Standard coverage</strong><br>Your premium stays " + money(BASE) + "/month. Nothing is added.";
      next.innerHTML = 'Continue with standard coverage <span aria-hidden="true">→</span>';
    } else {
      sum.innerHTML = "<strong>No option chosen yet.</strong><br>Choose Add Home Again or Keep standard coverage.";
      next.textContent = "Choose an option to continue";
    }
    next.setAttribute("data-ready", S.choice ? "1" : "0");
  }

  /* ── screen 3 · the chosen home, large; the others, small ─────────────── */
  function selectModel(name) {
    if (!HOMES[name]) { return; }
    S.model = name; persist(); paintHomes(); paintPlan();
    announce(name + " chosen as your replacement home. " + money(BASE + HOMES[name].fee) + " a month if you confirm.");
    try { $("h-homes").focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function featureCard(h) {
    return '<article class="feature-card" aria-labelledby="featName">' +
      '<div class="feature-photo">' + img(h) + '<span class="photo-tag">Illustrative</span></div>' +
      '<div class="feature-body">' +
        '<div class="feature-head"><h2 id="featName">' + esc(h.name) + ' <em class="chosen">Chosen</em></h2><p class="feature-fee">+' + money(h.fee) + '<small>/mo on your policy</small></p></div>' +
        '<p class="feature-specs">' + esc(h.beds) + ' · ' + esc(h.sqft) + ' · built at ' + esc(h.price) + '</p>' +
        '<ul class="feature-facts"><li><b>' + esc(h.weeks) + '</b><span>estimated build window</span></li><li><b>Up to ' + esc(h.housing) + '</b><span>furnished housing nearby</span></li><li><b>' + COORD + '</b><span>coordinates through move-in</span></li></ul>' +
      '</div></article>';
  }
  function altCard(h) {
    return '<button class="alt-card" type="button" data-model="' + esc(h.name) + '">' +
      '<span class="alt-photo">' + img(h) + '</span>' +
      '<span class="alt-body"><span class="alt-name">' + esc(h.name) + '</span><span class="alt-specs">' + esc(h.beds) + ' · ' + esc(h.sqft) + ' · built at ' + esc(h.price) + '</span><span class="alt-fee">+' + money(h.fee) + '/mo · ' + esc(h.weeks) + '</span><span class="alt-cta">Choose ' + esc(h.name) + ' instead</span></span>' +
    '</button>';
  }
  function paintHomes() {
    var cur = HOMES[S.model];
    $("houseFeature").innerHTML = featureCard(cur);
    $("houseAlts").innerHTML = ORDER.filter(function (n) { return n !== S.model; }).map(function (n) { return altCard(HOMES[n]); }).join("");
    $$("#houseAlts .alt-card").forEach(function (b) { b.addEventListener("click", function () { selectModel(b.getAttribute("data-model")); }); });
    $("homesNext").innerHTML = "Continue with " + esc(cur.name) + ' <span aria-hidden="true">→</span>';
    $("h-homes").textContent = cur.name === "Harbor" ? "Harbor is ready. You can make it yours." : cur.name + " is your replacement home.";
  }

  /* ── screen 4 · review ────────────────────────────────────────────────── */
  function paintReview() {
    var again = S.choice === "homeagain", h = HOMES[S.model];
    $("reviewEyebrow").textContent = again ? "Confirm your Home Again plan" : "Confirm your coverage";
    $("h-review").textContent = again ? "Here is your Home Again plan." : "Keep the coverage you already have.";
    $("reviewLead").textContent = again ? "Make sure everything looks right before you add it to your policy." : "Your homeowners policy will stay exactly as it is.";
    if (again) {
      $("reviewDetails").innerHTML =
        '<div class="lineitem"><strong>' + esc(h.name) + ' is your replacement home.</strong><p>' + esc(h.beds) + ' · ' + esc(h.sqft) + ' · built at ' + esc(h.price) + ', checked every year so it stays true. Its design and your builder pathway are on file.</p></div>' +
        '<div class="lineitem"><strong>A furnished place nearby.</strong><p>Pet-friendly, near your neighborhood, for up to ' + esc(h.housing) + '.</p></div>' +
        '<div class="lineitem lineitem--coord"><svg class="lens" aria-hidden="true"><use href="#lens"/></svg><div><strong>' + COORD + ' coordinates your recovery through move-in.</strong><p>One person connects the insurer, the builder, the housing and the permits, and keeps you updated.</p></div></div>' +
        '<div class="lineitem"><strong>Estimated build window: ' + esc(h.weeks) + '.</strong><details class="depends"><summary>What this depends on</summary><p>' + DEPENDS + '</p></details></div>' +
        '<p class="smallprint">Priority, not a guarantee. After a major event, builder slots are allocated in enrollment order across the network.</p>';
      $("reviewVisuals").innerHTML = '<div class="review-media--pair">' +
        '<figure class="review-media">' + img(h) + '<figcaption>' + esc(h.name) + ' · ' + esc(h.beds) + ' · ' + esc(h.sqft) + ' · illustrative</figcaption></figure>' +
        '<figure class="review-media">' + img(FURNISHED) + '<figcaption>Furnished housing nearby · illustrative</figcaption></figure></div>';
      $("confirmBtn").textContent = "Add Home Again to my policy";
    } else {
      $("reviewDetails").innerHTML =
        '<div class="lineitem"><strong>Your home stays protected.</strong><p>Dwelling protection $650,000. Deductible $5,000.</p></div>' +
        '<div class="lineitem"><strong>Additional living expenses stay in your policy.</strong><p>After an eligible loss, your policy helps pay for temporary living under its terms.</p></div>' +
        '<div class="lineitem"><strong>You organize the rebuild.</strong><p>You choose and coordinate the contractors and the temporary housing yourself.</p></div>' +
        '<p class="smallprint">Home Again is not added. You can come back to it at any renewal.</p>';
      $("reviewVisuals").innerHTML = '<figure class="review-media">' + img(YOUR_HOME) + '<figcaption>Your home · illustrative</figcaption></figure>';
      $("confirmBtn").textContent = "Keep my current coverage";
    }
    $("quoteAddon").textContent = again ? "+" + money(h.fee) : "Not added";
    $("quoteTotal").innerHTML = money(BASE + (again ? h.fee : 0)) + " <span>/month</span>";
  }

  /* ── confirm: the only action that adds anything ──────────────────────── */
  function confirmChoice() {
    if (S.choice === null) { show("plan"); refuse(); return; }
    S.confirmed = true; S.confirmedChoice = S.choice; S.confirmedModel = S.model; persist();
    show("done");
  }
  function paintDone() {
    var again = S.confirmedChoice === "homeagain", h = HOMES[S.confirmedModel || "Harbor"];
    $("doneKicker").textContent = again ? "Home Again added" : "Review complete";
    $("h-done").textContent = again ? "Home Again is added to your policy." : "Your existing coverage stays in place.";
    $("doneLead").textContent = again
      ? "You chose " + h.name + " as your recovery home. Your housing preferences and the recovery pathway are on file, ready if you ever need them."
      : "Home Again is not added. Your premium remains " + money(BASE) + " a month, and you can explore Home Again at any renewal.";
    $("doneTiles").innerHTML = again
      ? '<div class="success-tile"><p class="mini">Recovery home</p><strong>' + esc(h.name) + ' · ' + esc(h.beds) + ' · ' + esc(h.sqft) + '</strong></div>' +
        '<div class="success-tile"><p class="mini">On file</p><strong>Housing preferences and your recovery pathway</strong></div>' +
        '<div class="success-tile"><p class="mini">Updated premium (illustrative)</p><strong>' + money(BASE + h.fee) + '/month</strong></div>'
      : '<div class="success-tile"><p class="mini">Recovery option</p><strong>Standard coverage</strong></div>' +
        '<div class="success-tile"><p class="mini">Dwelling protection</p><strong>$650,000</strong></div>' +
        '<div class="success-tile"><p class="mini">Premium (illustrative)</p><strong>' + money(BASE) + '/month</strong></div>';
    $("doneCoord").hidden = !again;
    $("doneReview").textContent = again ? "Review my coverage" : "Review my coverage";
  }

  /* ── presenter · the covered loss, simulated ──────────────────────────── */
  var events = $$("#timeline .event");
  var dayTimers = [];
  function dayClear() { dayTimers.forEach(clearTimeout); dayTimers = []; }
  function daySet(n) { events.forEach(function (e, i) { e.setAttribute("data-on", i < n ? "1" : "0"); }); }
  function paintDay() {
    var h = HOMES[S.confirmedModel || "Harbor"];
    $("recoveryNote").textContent = "We know this is a difficult day. Here's what's already in motion: housing near your neighborhood is being held for you, " + h.name + "'s build slot is confirmed, and I'm coordinating site access for clearance. There's nothing you need to arrange today. I'll call at 4.";
    $("eventHousing").textContent = "Furnished, pet-friendly options near your neighborhood for up to " + h.housing + ".";
    $("eventBuilder").textContent = h.name + "'s builder slot confirmed.";
    $("dayHouseImage").innerHTML = img(h) + '<figcaption>Your ' + esc(h.name) + ' replacement home · illustrative</figcaption>';
    $("dayHome").textContent = h.name; $("dayPrice").textContent = h.price; $("dayWeeks").textContent = h.weeks; $("dayHousing").textContent = "Up to " + h.housing;
  }
  function runDay() {
    dayClear();
    if (reduced) { dayAll(false); return; }
    daySet(0); var st = $("dayStatus"); st.textContent = "In motion…"; st.classList.remove("is-done");
    events.forEach(function (e, i) { dayTimers.push(setTimeout(function () { daySet(i + 1); if (i === events.length - 1) { dayDone(false); } }, 500 + i * 900)); });
  }
  function dayAll(quiet) { dayClear(); daySet(events.length); dayDone(quiet); }
  function dayDone(quiet) { var st = $("dayStatus"); st.textContent = "Four things in motion"; st.classList.add("is-done"); if (!quiet) { announce("Four things are in motion today: housing held, the builder slot confirmed, site access coordination started, and a call at four."); } }
  function showDay() {
    if (!(S.confirmed && S.confirmedChoice === "homeagain")) { toast("Add and confirm Home Again first to simulate a covered-loss recovery."); announce("Add and confirm Home Again first to simulate a covered-loss recovery."); return; }
    show("day");
  }

  /* ── presenter · stakeholder economics ────────────────────────────────── */
  function calcBusiness() {
    var val = function (id) { return Math.max(0, Number($(id).value) || 0); };
    var fees = val("bizEnrolled") * val("bizFee") * 12;
    var savings = val("bizClaims") * val("bizAvoided");
    $("bizFees").textContent = money(fees);
    $("bizSavings").textContent = money(savings);
    $("bizGross").textContent = money(fees + savings);
  }

  /* ── the presenter menu ───────────────────────────────────────────────── */
  function closeMenu() { $("moreMenu").hidden = true; $("moreBtn").setAttribute("aria-expanded", "false"); }
  function toggleMenu() { var m = $("moreMenu"); m.hidden = !m.hidden; $("moreBtn").setAttribute("aria-expanded", String(!m.hidden)); }

  function restart() {
    S = fresh();
    try { sessionStorage.removeItem(STORE); } catch (e) { /* private mode */ }
    asmClear(); dayClear(); asmSet(0); daySet(0);
    paintPlan(); paintHomes();
    show("home");
    toast("Demo restarted. Nothing is kept.");
  }

  /* ── wiring ───────────────────────────────────────────────────────────── */
  var on = function (id, fn) { var el = $(id); if (el) { el.addEventListener("click", fn); } };
  on("homeNext", function () { show("plan"); });
  on("chooseAgain", function () { selectChoice("homeagain"); });
  on("chooseStandard", function () { selectChoice("standard"); });
  on("planNext", forward);
  on("homesNext", function () { show("review"); });
  on("confirmBtn", confirmChoice);
  on("reviewBack", back);
  on("doneReview", function () { show("review"); });
  on("doneRestart", restart);
  on("dayBack", function () { show("done"); });
  on("asmReplay", runAssemble);
  on("asmAll", function () { asmAll(false); });
  on("dayReplay", runDay);
  on("dayAll", function () { dayAll(false); });
  on("moreBtn", toggleMenu);
  on("simulateBtn", showDay);
  on("businessBtn", function () { businessReturn = S.route === "business" ? "home" : S.route; show("business"); });
  on("businessBack", function () { show(businessReturn); });
  on("resetBtn", restart);
  on("skip", function () { var h = $("h-" + S.route); if (h) { h.focus(); } });
  stepBtns.forEach(function (b) { b.addEventListener("click", function () { goStep(b.getAttribute("data-go")); }); });
  ["bizEnrolled", "bizFee", "bizClaims", "bizAvoided"].forEach(function (id) { $(id).addEventListener("input", calcBusiness); });
  $("homeAddress").addEventListener("input", function () {
    var parts = this.value.split(",");
    $("addrShort").textContent = parts.length > 1 ? "· " + parts.slice(1).join(",").replace(/\s*\d{5}(-\d{4})?\s*$/, "").trim() : "";
  });
  document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".menu-trigger")) { closeMenu(); } });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button" || tag === "a" || tag === "summary" || tag === "textarea") { return; }
    if (e.key === "ArrowRight") { forward(); }
    if (e.key === "ArrowLeft") { back(); }
  });

  /* ── boot ─────────────────────────────────────────────────────────────── */
  restore();
  paintPlan(); paintHomes(); calcBusiness();
  var want = (location.hash || "").replace(/^#/, "");
  if (ROUTES.indexOf(want) < 0) { want = S.route; }
  if (want !== S.route && !allowed(want)) { toast("That step needs a choice first."); }
  show(allowed(want) ? want : "plan", { silent: true, restored: true });
})();
