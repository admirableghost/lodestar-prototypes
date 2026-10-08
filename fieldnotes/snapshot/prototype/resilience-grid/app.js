/* ══════════════════════════════════════════════════════════════════════════
   Firebreak · regional risk operations
   No framework, no build step, no external request. Three files.

   THE SEQUENCE (five screens, one takeaway each)
     1 region        Firebreak coordinates protection across the region
     2 intervention  three beats on the same map: exposure analysis, the
                     brush clearing completed before the season, one dispatch
     3 funding       utility, insurer and community fund the company
     4 homeowner     one home: FAIR Plan-only → an illustrative offer
     5 insurer       the zone from the insurer's side: excluded → considered

   THE MAP is one drawing (mapSVG) in world units 960 × 600, printed four
   times with different windows: the region, Zone 4 with its ridge, and the
   cluster close up. Every overlay is a group whose visibility is a data-
   attribute on the map's container, so the beats are CSS transitions driven
   by state, never by hand-animated numbers.

   ONE STATE { screen, detail, zone, beat, dispatched, flow, home, insurer,
   assess } is the only source of truth, kept in sessionStorage for the tab.
   Backward navigation keeps it; restart clears it. The forward action on a
   screen completes that screen's beat before it advances, so ordinary
   forward navigation reaches every payoff.

   WHAT IS INVENTED. Ridgeline Division, its zones, Canyon Ridge, every
   reading, score, count, time and figure, and the insurer. All of it is
   the reference prototype's illustrative content; the status bar says so.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── content ──────────────────────────────────────────────────────────── */
  var SCREENS = ["region", "intervention", "funding", "homeowner", "insurer"];
  var LABELS = { region: "The region", intervention: "The intervention", funding: "Funding", homeowner: "Homeowner", insurer: "Insurer" };
  var ZONES = {
    1: { risk: "moderate", label: "Moderate", sensors: 22, crews: 1, acres: "480" },
    2: { risk: "low", label: "Low", sensors: 14, crews: 0, acres: "310" },
    3: { risk: "moderate", label: "Moderate", sensors: 19, crews: 1, acres: "540" },
    4: { risk: "extreme", label: "Extreme", sensors: 31, crews: 2, acres: "720", note: "Canyon Ridge · 14 homes below the ridgeline. Red flag conditions." },
    5: { risk: "elevated", label: "Elevated", sensors: 26, crews: 1, acres: "650", note: "Adjacent to the ridgeline. Crew 6 is stationed here." },
    6: { risk: "low", label: "Low", sensors: 16, crews: 1, acres: "400" }
  };
  var SAY = {
    ready: "Zone 4, under red flag conditions. Three things, in order.",
    exposure: "Exposure: 14 homes below the ridgeline. The corridor between the ridge and the cluster is the priority.",
    clearing: "The corridor was cleared before the season. That work is done; it is why today's exposure is lower.",
    decide: "Red flag now. Reposition contracted Crew 6 to the corridor?",
    dispatched: "Crew 6 is moving to the corridor. ETA 18 minutes. Zone 4 coverage rises as it arrives.",
    finished: "Exposure analysed, corridor cleared before the season, Crew 6 at the corridor. Analysis, prevention and response, together."
  };
  var STORE = "firebreak.v1";
  var VIEWS = { region: "0 0 960 600", zone: "0 250 600 330", home: "0 296 440 280" };

  /* ── state ────────────────────────────────────────────────────────────── */
  function fresh() { return { screen: "region", detail: false, zone: "4", beat: 0, dispatched: false, flow: false, home: "before", insurer: "before", assess: 0 }; }
  var S = fresh();
  function persist() { try { sessionStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* private mode */ } }
  function restore() {
    var v = null; try { v = JSON.parse(sessionStorage.getItem(STORE) || "null"); } catch (e) { v = null; }
    if (!v || typeof v !== "object") { return; }
    var n = fresh();
    if (SCREENS.indexOf(v.screen) >= 0) { n.screen = v.screen; }
    n.detail = v.detail === true; if (ZONES[v.zone]) { n.zone = String(v.zone); }
    n.beat = Math.max(0, Math.min(3, v.beat | 0)); n.dispatched = v.dispatched === true; if (n.dispatched) { n.beat = 3; }
    n.flow = v.flow === true; n.home = v.home === "with" ? "with" : "before"; n.insurer = v.insurer === "after" ? "after" : "before";
    n.assess = Math.max(0, Math.min(4, v.assess | 0));
    S = n;
  }

  /* ── dom ──────────────────────────────────────────────────────────────── */
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var announceEl = $("announce");
  function announce(msg) { announceEl.textContent = ""; setTimeout(function () { announceEl.textContent = msg; }, 30); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ── the map ──────────────────────────────────────────────────────────── */
  var HOMES = [[104, 428], [140, 428], [176, 428], [212, 428], [248, 428], [122, 466], [158, 466], [194, 466], [230, 466], [266, 466], [104, 504], [140, 504], [176, 504], [212, 504]];
  var FOCUS = [176, 466];
  var CREWS = [[130, 460, "Crew 1"], [230, 440, "Crew 2"], [100, 160, "Crew 3"], [760, 180, "Crew 4"], [780, 520, "Crew 5"]];
  var CREW6 = [430, 470];
  var SENSORS = [[90, 70], [210, 190], [420, 90], [780, 110], [880, 200], [70, 400], [180, 520], [260, 370], [460, 520], [820, 470]];
  var CORRIDOR = "48,346 312,354 312,402 48,396";
  function tri(x, y) { return (x) + "," + (y - 10) + " " + (x + 9) + "," + (y + 8) + " " + (x - 9) + "," + (y + 8); }
  function mapSVG(view) {
    var s = '<svg viewBox="' + VIEWS[view] + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + (view === "region" ? "Ridgeline Division: six zones, a high-risk ridgeline across the middle, Canyon Ridge, a cluster of fourteen homes, below it in Zone 4, and a utility corridor crossing the eastern zones." : view === "zone" ? "Zone 4 close up: the ridgeline across the top, the corridor below it, and the Canyon Ridge cluster of fourteen homes." : "Canyon Ridge close up: fourteen homes below the cleared corridor, one of them ringed.") + '">';
    s += '<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="rgba(95,181,151,.2)"/><line x1="0" y1="0" x2="0" y2="8" stroke="#5fb597" stroke-width="2.6"/></pattern><pattern id="hatch-red" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="rgba(224,82,58,.55)" stroke-width="2"/></pattern></defs>';
    var Z = [[1, "0,0 320,0 320,300 0,300"], [2, "320,0 640,0 640,300 320,300"], [3, "640,0 960,0 960,300 640,300"], [4, "0,300 320,300 320,600 0,600"], [5, "320,300 640,300 640,600 320,600"], [6, "640,300 960,300 960,600 640,600"]];
    s += '<g class="zones">' + Z.map(function (z) { return '<polygon class="zone" data-zone="' + z[0] + '" data-risk="' + ZONES[z[0]].risk + '" points="' + z[1] + '"><title>Zone ' + z[0] + ' · ' + ZONES[z[0]].label + '</title></polygon>'; }).join("") + '</g>';
    /* the ridgeline: a high-risk band along the top of zones 4 and 5 */
    s += '<g class="ridgeg"><path class="ridge" d="M0 318 C80 290 160 340 240 312 S400 322 480 300 S600 335 640 315"/><path class="ridge-line" d="M0 318 C80 290 160 340 240 312 S400 322 480 300 S600 335 640 315"/><text class="ridge-label" x="24" y="292">Ridgeline · high risk</text></g>';
    /* the utility corridor */
    s += '<g class="utilg"><line class="util" x1="480" y1="0" x2="860" y2="600"/>' + [[536, 80], [590, 210], [645, 340], [700, 470]].map(function (t) { return '<circle class="tower" cx="' + t[0] + '" cy="' + t[1] + '" r="5"/>'; }).join("") + '</g>';
    /* the insurer's boundary on zone 4 (screen 5) */
    s += '<polygon class="excluded" points="0,300 320,300 320,600 0,600"/><text class="insurer-label excluded-label" x="24" y="562">Zone 4 · excluded</text>';
    s += '<polygon class="considered" points="0,300 320,300 320,600 0,600"/><text class="insurer-label considered-label" x="24" y="562">Zone 4 · under consideration</text>';
    /* beat 2: the cleared corridor; beat 1: the exposure drawing */
    s += '<polygon class="cleared" points="' + CORRIDOR + '"/><text class="cleared-label" x="52" y="414">Corridor cleared · completed before the season</text>';
    s += '<polygon class="exposure exposure-corridor" points="' + CORRIDOR + '"/><ellipse class="exposure exposure-ring" cx="186" cy="470" rx="128" ry="70"/><text class="exposure-label" x="52" y="338">Priority corridor</text><text class="exposure-label" x="112" y="556">Threatened cluster</text>';
    /* the cluster */
    s += '<g class="homes">' + HOMES.map(function (h) { return '<use class="home" href="#house" x="' + (h[0] - 8) + '" y="' + (h[1] - 7) + '" width="16" height="14"/>'; }).join("") + '</g>';
    s += '<text class="cluster-label" x="104" y="536">Canyon Ridge · 14 homes</text>';
    s += '<circle class="focus-ring" cx="' + FOCUS[0] + '" cy="' + FOCUS[1] + '" r="14"/><text class="focus-label" x="' + (FOCUS[0] - 18) + '" y="' + (FOCUS[1] - 20) + '">This home</text>';
    /* current conditions: the wind */
    s += '<g class="windg"><path class="wind" d="M500 350 L446 404 M446 404 L448 386 M446 404 L464 402"/><text class="wind-text" x="452" y="424">Wind 34 mph</text></g>';
    /* detection and crews */
    s += '<g class="sensors">' + SENSORS.map(function (p) { return '<circle class="sensor" cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>'; }).join("") + '</g>';
    s += '<g class="crews">' + CREWS.map(function (c) { return '<polygon class="crew crew-other" points="' + tri(c[0], c[1]) + '"><title>' + c[2] + '</title></polygon>'; }).join("");
    s += '<line class="trail" x1="' + CREW6[0] + '" y1="' + CREW6[1] + '" x2="' + (CREW6[0] - 230) + '" y2="' + (CREW6[1] - 92) + '"/>';
    s += '<g class="crew6"><polygon class="crew" points="' + tri(CREW6[0], CREW6[1]) + '"><title>Crew 6</title></polygon><text class="crew-label" x="' + (CREW6[0] + 12) + '" y="' + (CREW6[1] + 4) + '">Crew 6</text></g>';
    s += '<text class="dispatch-label" x="216" y="386">Crew 6 · contracted · ETA 18 min</text></g>';
    /* labels and the selectable outlines */
    s += '<g class="labels">' + Z.map(function (z) { var x = [30, 350, 670][(z[0] - 1) % 3], y = z[0] <= 3 ? 40 : 360; return '<text class="zone-label" x="' + x + '" y="' + y + '">Zone ' + z[0] + '</text><text class="zone-risk-label" data-risk="' + ZONES[z[0]].risk + '" x="' + x + '" y="' + (y + 18) + '">' + ZONES[z[0]].label + '</text>'; }).join("") + '</g>';
    s += '<g class="outlines">' + Z.map(function (z) { return '<polygon class="zone-outline" data-zone="' + z[0] + '" points="' + z[1] + '"/>'; }).join("") + '</g>';
    return s + '</svg>';
  }
  var MAPS = { region: $("map-region"), intervention: $("map-intervention"), homeowner: $("map-homeowner"), insurer: $("map-insurer") };
  MAPS.region.innerHTML = mapSVG("region");
  MAPS.intervention.innerHTML = mapSVG("zone");
  MAPS.homeowner.innerHTML = mapSVG("home");
  MAPS.insurer.innerHTML = mapSVG("zone");

  /* ── screen 1 · the region ────────────────────────────────────────────── */
  function selectZone(n, quiet) {
    S.zone = String(n); persist();
    $$("#map-region .zone-outline").forEach(function (o) { o.classList.toggle("selected", o.getAttribute("data-zone") === S.zone); });
    var z = ZONES[S.zone];
    $("zoneCard").innerHTML = '<span class="eyebrow">Selected zone</span><h3>Zone ' + S.zone + '</h3><span class="badge risk-' + z.risk + '">' + z.label + ' risk</span>' + (z.note ? '<p>' + esc(z.note) + '</p>' : '<p>' + z.acres + ' acres managed.</p>');
    var d = $("opsDetail").querySelector(".detail-list");
    d.innerHTML = '<div><dt>Zone ' + S.zone + ' sensors</dt><dd>' + z.sensors + '</dd></div><div><dt>Zone ' + S.zone + ' crews</dt><dd>' + z.crews + '</dd></div><div><dt>Zone ' + S.zone + ' acres</dt><dd>' + z.acres + '</dd></div><div><dt>Division sensors online</dt><dd>128</dd></div><div><dt>Division crews deployed</dt><dd>6</dd></div><div><dt>Division acres managed</dt><dd>3,100</dd></div>';
    if (!quiet) { announce("Zone " + S.zone + " selected. " + z.label + " risk."); }
  }
  $$("#map-region .zone").forEach(function (z) { z.addEventListener("click", function () { selectZone(z.getAttribute("data-zone")); }); });
  $("detailToggle").addEventListener("change", function () { S.detail = this.checked; persist(); paintRegion(); announce(S.detail ? "Sensors and crews shown." : "Sensors and crews hidden."); });
  function paintRegion() { MAPS.region.setAttribute("data-detail", S.detail ? "1" : "0"); $("detailToggle").checked = S.detail; }

  /* ── screen 2 · the beats ─────────────────────────────────────────────── */
  var beats = $$("#beats .beat");
  var timer = null, playing = false;
  function say(k) { $("say-intervention").textContent = SAY[k]; }
  function paintBeats() {
    var m = MAPS.intervention;
    m.setAttribute("data-exposure", S.beat >= 1 ? "1" : "0");
    m.setAttribute("data-cleared", S.beat >= 2 ? "1" : "0");
    m.setAttribute("data-dispatched", S.dispatched ? "1" : "0");
    beats.forEach(function (b, i) {
      var n = i + 1, st = "pending";
      if (S.dispatched) { st = "done"; } else if (S.beat > n) { st = "done"; } else if (S.beat === n) { st = "active"; } else if (n === 3 && S.beat === 3) { st = "active"; }
      if (n === 3 && !S.dispatched && S.beat >= 3) { st = "active"; }
      b.setAttribute("data-state", st);
      b.querySelector(".beat-n").textContent = st === "done" ? "✓" : String(n);
    });
    var db = $("dispatchBtn");
    db.disabled = S.dispatched; db.textContent = S.dispatched ? "Dispatched" : "Dispatch Crew 6 · ETA 18 min"; db.classList.toggle("done", S.dispatched);
    $("dispatchConfirm").hidden = !S.dispatched;
    $("meterFill").style.width = S.dispatched ? "89%" : "62%"; $("meterFill").classList.toggle("up", S.dispatched); $("meterValue").textContent = S.dispatched ? "89%" : "62%";
    var pb = $("playBtn");
    pb.textContent = playing ? "Pause" : (S.dispatched ? "Done" : (S.beat >= 3 ? "Decide" : (S.beat === 0 ? "Play" : "Resume")));
    pb.disabled = S.dispatched || (S.beat >= 3 && !playing);
    pb.setAttribute("aria-pressed", playing ? "true" : "false");
    var fwd = $("fwd-intervention");
    fwd.innerHTML = S.dispatched ? 'Who funds this? <span aria-hidden="true">→</span>' : 'Finish the intervention <span aria-hidden="true">→</span>';
    $("nextBtn").disabled = false;
  }
  function stopTimer() { clearTimeout(timer); timer = null; playing = false; }
  function runBeat(n) {
    /* beat n becomes active now; beats 1 and 2 complete on a timer, beat 3 waits for the decision */
    stopTimer();
    S.beat = n; persist();
    if (n >= 3) { say("decide"); paintBeats(); announce("Beat three, dispatch. Red flag now. Reposition contracted Crew 6 to the corridor? Press Dispatch."); try { $("dispatchBtn").focus({ preventScroll: true }); } catch (e) { /* ignore */ } return; }
    playing = true;
    say(n === 1 ? "exposure" : "clearing"); paintBeats();
    announce(n === 1 ? "Beat one, exposure analysis. Canyon Ridge, fourteen homes below the ridgeline; the corridor is the priority." : "Beat two, brush clearing. The corridor was cleared before the season.");
    timer = setTimeout(function () { runBeat(n + 1); }, reduced ? 60 : 2600);
  }
  function play() { if (S.dispatched) { return; } if (S.beat === 0) { runBeat(1); } else if (S.beat < 3) { runBeat(S.beat); } else { runBeat(3); } }
  function pause() { stopTimer(); paintBeats(); announce("Paused at beat " + S.beat + "."); }
  function dispatch() {
    if (S.dispatched) { return; }
    stopTimer(); S.beat = 3; S.dispatched = true; persist();
    say("dispatched"); paintBeats();
    announce("Crew 6 dispatched. ETA 18 minutes. Zone 4 coverage 89 percent. The intervention is complete.");
  }
  function finishIntervention(quiet) {
    stopTimer(); S.beat = 3; S.dispatched = true; persist();
    say("finished"); paintBeats();
    if (!quiet) { announce("Finished: exposure analysed, corridor cleared before the season, Crew 6 at the corridor, coverage 89 percent."); }
  }
  function replayIntervention() {
    stopTimer(); S.beat = 0; S.dispatched = false; persist();
    say("ready"); paintBeats();
    /* let the transitions reset before they run again */
    setTimeout(function () { runBeat(1); }, 80);
  }
  function enterIntervention(restored) {
    if (S.dispatched) { say("finished"); paintBeats(); return; }
    if (restored && S.beat > 0) { say(S.beat >= 3 ? "decide" : (S.beat === 2 ? "clearing" : "exposure")); paintBeats(); return; }
    if (reduced) { finishIntervention(true); return; }
    S.beat = 0; say("ready"); paintBeats();
    setTimeout(function () { if (S.screen === "intervention" && S.beat === 0 && !S.dispatched) { runBeat(1); } }, 500);
  }

  /* ── screen 3 · the flow ──────────────────────────────────────────────── */
  var flowTimers = [];
  function flowClear() { flowTimers.forEach(clearTimeout); flowTimers = []; }
  function flowSet(stage) {
    /* 0 nothing · 1–3 contributors lit and drawn · 4 Firebreak lit · 5 the operation's three outputs lit */
    var cards = $$("#partners .partner-card"), inChips = $$("#flow .flow-group--in .flow-chip"), inLines = $$("#flow .flow-lines:not(.flow-lines--out) path"), core = $("flow").querySelector(".core"), outLines = $$("#flow .flow-lines--out path"), outChips = $$("#flow .flow-group--out .flow-chip");
    $("flow").setAttribute("data-stage", String(stage));
    cards.forEach(function (c, i) { c.setAttribute("data-on", stage > i ? "1" : "0"); });
    inChips.forEach(function (c, i) { c.setAttribute("data-on", stage > i ? "1" : "0"); });
    inLines.forEach(function (p, i) { p.classList.toggle("drawn", stage > i); p.classList.toggle("undrawn", stage <= i); });
    core.setAttribute("data-on", stage >= 4 ? "1" : "0");
    outLines.forEach(function (p) { p.classList.toggle("drawn", stage >= 5); p.classList.toggle("undrawn", stage < 5); });
    outChips.forEach(function (c) { c.setAttribute("data-on", stage >= 5 ? "1" : "0"); });
    S.flow = stage >= 5; persist();
    $("fwd-funding").innerHTML = S.flow ? 'What changes for a homeowner? <span aria-hidden="true">→</span>' : 'Finish the flow <span aria-hidden="true">→</span>';
  }
  function flowPlay() {
    flowClear(); flowSet(0);
    if (reduced) { flowSet(5); return; }
    [1, 2, 3, 4, 5].forEach(function (st, i) { flowTimers.push(setTimeout(function () { flowSet(st); if (st === 5) { announce("Utility, insurer and community fund Firebreak's coordinated operation: detection, vegetation work and response."); } }, 400 + i * 700)); });
  }
  function flowFinish(quiet) { flowClear(); flowSet(5); if (!quiet) { announce("Utility, insurer and community fund Firebreak's coordinated operation: detection, vegetation work and response."); } }
  function enterFunding(restored) { if (S.flow || (restored && S.flow)) { flowSet(5); return; } flowPlay(); }

  /* ── screen 4 · the homeowner ─────────────────────────────────────────── */
  function paintHome() {
    var withFb = S.home === "with";
    $("homeToggle").setAttribute("aria-checked", withFb ? "true" : "false");
    $("labelBefore").classList.toggle("on", !withFb); $("labelWith").classList.toggle("on", withFb);
    $("outcome").setAttribute("data-state", withFb ? "with" : "before");
    MAPS.homeowner.setAttribute("data-cleared", withFb ? "1" : "0");
    $("homeCap").textContent = withFb ? "The same home after the corridor work and Firebreak's coordinated protection. Its neighbours are assessed individually." : "One home, ringed, below an uncleared corridor. FAIR Plan only.";
    $("fwd-homeowner").innerHTML = withFb ? 'See the insurer\'s view <span aria-hidden="true">→</span>' : 'Show the offer <span aria-hidden="true">→</span>';
  }
  function setHome(state) {
    S.home = state; persist(); paintHome();
    announce(state === "with" ? "With Firebreak: a participating insurer offers a homeowners policy at 4,200 dollars a year, illustrative, subject to underwriting. Risk score 34, illustrative." : "Before Firebreak: FAIR Plan only, declined in the standard market. Risk score 87, illustrative.");
  }

  /* ── screen 5 · the insurer ───────────────────────────────────────────── */
  var rows = $$("#assess .arow");
  var assessTimers = [];
  function assessClear() { assessTimers.forEach(clearTimeout); assessTimers = []; }
  function paintInsurer() {
    var after = S.insurer === "after";
    $("insurerToggle").setAttribute("aria-checked", after ? "true" : "false");
    $("labelExcluded").classList.toggle("on", !after); $("labelAfter").classList.toggle("on", after);
    $("assess").setAttribute("data-state", after ? "after" : "before");
    MAPS.insurer.setAttribute("data-insurer", after ? "after" : "before");
    MAPS.insurer.setAttribute("data-cleared", after ? "1" : "0");
    rows.forEach(function (r, i) { r.setAttribute("data-on", after && S.assess > i ? "1" : "0"); });
    var done = after && S.assess >= rows.length;
    $("fwd-insurer").hidden = done; $("endActions").hidden = !done;
    $("nextBtn").disabled = done;
  }
  function assessRun() {
    assessClear(); S.assess = 0; persist(); paintInsurer();
    if (reduced) { assessFinish(true); return; }
    rows.forEach(function (r, i) { assessTimers.push(setTimeout(function () { S.assess = i + 1; persist(); paintInsurer(); if (i === rows.length - 1) { announce("Assessment complete: mitigation verified, one dispatch on record, exposure elevated but better understood, Zone 4 open for consideration home by home."); } }, 350 + i * 800)); });
  }
  function assessFinish(quiet) { assessClear(); S.assess = rows.length; persist(); paintInsurer(); if (!quiet) { announce("Assessment complete: mitigation verified, one dispatch on record, exposure elevated but better understood, Zone 4 open for consideration home by home."); } }
  function setInsurer(state) {
    S.insurer = state; persist();
    if (state === "after") { announce("After Firebreak. Assessing Zone 4."); assessRun(); }
    else { assessClear(); S.assess = 0; persist(); paintInsurer(); announce("Before: Zone 4 excluded, exposure outside appetite."); }
  }

  /* ── navigation ───────────────────────────────────────────────────────── */
  var screens = $$(".screen");
  var dots = $("stepDots");
  SCREENS.forEach(function (id, i) { var d = document.createElement("button"); d.type = "button"; d.className = "step-dot"; d.setAttribute("aria-label", "Screen " + (i + 1) + ": " + LABELS[id]); d.addEventListener("click", function () { show(id); }); dots.appendChild(d); });
  function show(id, opts) {
    opts = opts || {};
    if (SCREENS.indexOf(id) < 0) { id = "region"; }
    stopTimer(); flowClear(); assessClear();
    S.screen = id; persist();
    document.body.setAttribute("data-screen", id);
    screens.forEach(function (sc) { sc.hidden = sc.getAttribute("data-screen") !== id; });
    var idx = SCREENS.indexOf(id);
    $$(".rail-btn").forEach(function (b) { if (b.getAttribute("data-go") === id) { b.setAttribute("aria-current", "step"); } else { b.removeAttribute("aria-current"); } });
    Array.prototype.forEach.call(dots.children, function (d, i) { if (i === idx) { d.setAttribute("aria-current", "step"); } else { d.removeAttribute("aria-current"); } });
    $("prevBtn").disabled = idx === 0;
    $("nextBtn").disabled = false;
    if (id === "region") { paintRegion(); selectZone(S.zone, true); }
    if (id === "intervention") { enterIntervention(opts.restored); }
    if (id === "funding") { enterFunding(opts.restored); }
    if (id === "homeowner") { paintHome(); }
    if (id === "insurer") { paintInsurer(); if (S.insurer === "after" && S.assess < rows.length && !opts.restored) { assessRun(); } }
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* file:// */ }
    $("main").scrollTop = 0; window.scrollTo(0, 0);
    var h = $("h-" + id);
    if (h && !opts.silent) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    if (!opts.silent) { announce("Screen " + (idx + 1) + " of 5, " + LABELS[id] + ". " + (h ? h.textContent.trim() : "")); }
  }
  /* the forward action completes the open beat first, then advances */
  function forward() {
    var idx = SCREENS.indexOf(S.screen);
    if (S.screen === "intervention" && !S.dispatched) { finishIntervention(false); return; }
    if (S.screen === "funding" && !S.flow) { flowFinish(false); return; }
    if (S.screen === "homeowner" && S.home !== "with") { setHome("with"); return; }
    if (S.screen === "insurer") { if (S.insurer !== "after") { setInsurer("after"); } else if (S.assess < rows.length) { assessFinish(false); } return; }
    if (idx < SCREENS.length - 1) { show(SCREENS[idx + 1]); }
  }
  function back() { var idx = SCREENS.indexOf(S.screen); if (idx > 0) { show(SCREENS[idx - 1]); } }
  function restart() {
    stopTimer(); flowClear(); assessClear();
    S = fresh(); try { sessionStorage.removeItem(STORE); } catch (e) { /* private mode */ }
    paintBeats(); flowSet(0); S.flow = false; paintHome(); paintInsurer(); $("detailToggle").checked = false;
    show("region"); announce("Restarted. Nothing is kept.");
  }

  /* ── wiring ───────────────────────────────────────────────────────────── */
  var on = function (id, fn) { var el = $(id); if (el) { el.addEventListener("click", fn); } };
  $$("[data-forward]").forEach(function (b) { b.addEventListener("click", forward); });
  on("nextBtn", forward); on("prevBtn", back);
  $$(".rail-btn").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-go")); }); });
  on("playBtn", function () { if (playing) { pause(); } else { play(); } });
  on("replayBtn", replayIntervention); on("finishBtn", function () { finishIntervention(false); });
  on("dispatchBtn", dispatch);
  on("flowReplay", flowPlay); on("flowFinish", function () { flowFinish(false); });
  on("homeToggle", function () { setHome(S.home === "with" ? "before" : "with"); });
  on("insurerToggle", function () { setInsurer(S.insurer === "after" ? "before" : "after"); });
  on("assessReplay", function () { S.insurer = "after"; persist(); assessRun(); announce("Replaying the assessment."); });
  on("assessFinish", function () { S.insurer = "after"; persist(); assessFinish(false); });
  on("restartBtn", restart);
  on("skip", function () { var h = $("h-" + S.screen); if (h) { h.focus(); } });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input" || tag === "button" || tag === "a" || tag === "summary" || tag === "textarea") { return; }
    if (e.key === "ArrowRight") { forward(); }
    if (e.key === "ArrowLeft") { back(); }
  });

  /* ── boot ─────────────────────────────────────────────────────────────── */
  restore();
  var want = (location.hash || "").replace(/^#/, "");
  if (SCREENS.indexOf(want) < 0) { want = S.screen; }
  paintBeats(); flowSet(S.flow ? 5 : 0); paintHome(); paintInsurer();
  show(want, { silent: true, restored: true });
  /* a deep link pasted into an open tab changes only the hash: follow it */
  window.addEventListener("hashchange", function () { var h = (location.hash || "").replace(/^#/, ""); if (SCREENS.indexOf(h) >= 0 && h !== S.screen) { show(h); } });
})();
