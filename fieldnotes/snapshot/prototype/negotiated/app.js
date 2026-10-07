/* ══════════════════════════════════════════════════════════════════════════
   Negotiated Neighborhood · Thorn Lane
   No framework, no build step, no external request. Three files and a font.

   Forked from prototype/resilience-grid/app.js for the navigation, the
   per-screen --fit search, the camera and the pin projection. The GROUND is
   the design study's (design-study/remaining-five/03-negotiated): one shallow
   cut-paper oblique of the street, carried into the browser rather than
   redrawn — same geometry, same commitment order, same state language.

   THE GROUND
   One invented street: sixty parcels in two rows of thirty either side of
   one road, in three blocks of ten a side, cut into a slope with open ground
   behind. Drawn once, full-bleed, and each screen is a camera move over it.

   The smallest object this ground resolves is ONE HOUSEHOLD, and the viewer
   can count them. The contract on screen 3 turns on how many of these sixty
   houses are filled, so a house has to be a thing you can point at.

   STATE IS NEVER CARRIED BY FADING, and colour means participation state
   only. A committed house is solid green with a solid edge and a filled
   frontage strip; a house not joined is paper-hollow with a dashed edge and
   no strip. Both survive greyscale. The one amber in the frame is the
   collective boundary, and it exists only at or above the threshold. The
   one ochre is the surveyor's mark, and it exists only while verification
   is illustrated.

   THE STATE OBJECT — one source of truth,
   S = { screen, joined, committed, verified }, kept in sessionStorage so a
   reload keeps the street where it was (CONTRACT-IMPL.md).
   · joined starts false and is set ONLY by #join on screen 2: Maggie
     (no. 31) authorises her agent to ASSEMBLE the proposal. It is never
     acceptance of terms — no contribution, price or acceptance mechanism
     exists in any source, so there is no acceptance flag because there is
     nothing to accept yet. Joining moves committed from 41 (the others) to
     42 (the others plus no. 31) and draws her signature dash on the sheet.
   · committed starts at 41 and is otherwise moved ONLY by #invite on
     screen 3: one round of acceptances per press, 42 → 45 → 48. At 48 the
     button reads "Street assembled" and a further press does nothing.
     Unjoined there is no agent to send, so the button is inert and the
     count stays at 41. It is never moved by navigation in either
     direction, and a user who stops short leaves the street below the
     threshold on every later screen.
   · verified starts false and is flipped ONLY by the surveyor control on
     screen 4.
   · "Back to the start" from screen 5 is the one action that resets all
     three (and clears the stored state).
   · screen 5 is derived: ready = committed ≥ 48 && verified. "Ready" is
     the payoff that returns to Maggie — together, the offer she could not
     get alone (alone · no offer → together · conditional offer secured) —
     with the terms and her acceptance still pending. Nothing on the screen
     says covered, active, in force, signed or begun. Pressing Next never
     produces "ready"; only the two facts do.
   · the amber boundary draws itself in on the press that reaches 48 on
     screen 3, after the last home of that round fills (a short
     stroke-draw; instant under reduced motion) and is static on every
     later render.
   · DISCOVERABILITY: the customer action is the primary control on its
     screen. The chrome's Next is a quiet paper button on screen 2 until
     #join is pressed, on screen 3 until the count reaches 48, and on
     screen 4 until #verify-toggle is pressed (paint() toggles
     .cta--quiet); it never performs any of them.

   THE SHARED AGENT GRAMMAR (CONTRACT-IMPL.md § A), drawn here:
   · HUMAN — her paper is the terms sheet on screen 2; her signature dash
     is drawn on it when she authorises (style.css, .sig).
   · AGENT — the thread is a plum line (2px, 42%) that begins at her
     paper: on screen 2 the tether from the signed sheet to her home turns
     plum and ends in the lens mark; from screen 3 the thread runs in the
     street's own SVG from no. 31 to the kerb and then, round by round,
     along the road and up to every lot her agent reaches, the lens mark
     at its head. On a press the new segments draw in sequence and each
     home fills the moment the thread reaches its gate (thread(), below;
     instant under reduced motion). Later renders draw it static.
   · PROVIDER — the carrier's conditions on screen 4, a ledger-blue record
     with a seal (style.css, .step--carrier).

   DEEP LINKS — five screens, #s/1 … #s/5. The three-screen build's links
   map as: old #s/1 → 1 (unchanged), old #s/2 (the threshold) → #s/3, old
   #s/3 (the agreement) → #s/5. A bare number cannot tell an old link from a
   new one, so this is documented, not remapped.

   WHAT IS INVENTED
   All of it. Thorn Lane, its sixty households, no. 31, the threshold of 48,
   the fund, the surveyor, the broker and every party to the agreement are
   invented, and screen 1 says so. No real insurer, place, product or price
   appears anywhere.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── the one data structure the copy depends on ──────────────────────── */
  var HOMES = 60;          /* parcels on Thorn Lane            */
  var PER_ROW = 30;        /* thirty either side of the road   */
  var NEED = 48;           /* the threshold — the product      */
  var START = 41;          /* where the street stands on entry */
  var ROSA = 15;           /* no. 31 — upper row, mid-street   */
  var ROUND = 3;           /* households accepting per press   */
  /* the counts the deck can stand at: 41 unjoined; 42, 45, 48 joined */
  var STOPS = [START + 1, START + 1 + ROUND, NEED];

  /* ── THE STATE ───────────────────────────────────────────────────────── */
  var S = { screen: 1, joined: false, committed: START, verified: false, accepted: false, confirmed: false };
  /* DEVELOPMENT-ONLY · the covered ending, reached only with ?dev=covered
     in the URL. The commercial terms it shows are proposed and unapproved
     (DECISIONS-REQUIRED § 2). Without the flag S.accepted is never set and
     the approved conditional-offer ending is the only ending. */
  var DEV = (function () { try { return new URLSearchParams(location.search).get("dev") === "covered"; } catch (e) { return false; } })();
  /* covered: the street is ready AND Maggie has accepted the carrier's terms */
  /* covered only once the carrier has confirmed — her acceptance alone
     covers nothing; the other households' acceptances and the carrier's
     confirmation are the events that set `confirmed` */
  function covered() { return DEV && ready() && S.accepted === true && S.confirmed === true; }
  /* while the acceptance round runs, paint() leaves the log's reveal to its timers */
  var accBusy = false;
  /* the street is READY — participation reached and verified — and holds
     a conditional offer Maggie could not get alone, the terms and her
     acceptance still pending. Not "covered": there are no terms yet. */
  function ready() { return S.committed >= NEED && S.verified; }

  /* kept across reloads in sessionStorage; only values the deck can reach
     are read back, anything else is the entry state */
  var KEY = "nn-state";
  function load() {
    var raw = null, o;
    try { raw = sessionStorage.getItem(KEY); } catch (e) { /* storage off */ }
    if (!raw) { return; }
    try { o = JSON.parse(raw); } catch (e) { return; }
    if (!o || typeof o !== "object") { return; }
    S.joined = o.joined === true;
    S.committed = S.joined && STOPS.indexOf(o.committed) !== -1 ? o.committed : START;
    S.verified = o.verified === true;
    S.accepted = DEV && o.accepted === true;
    S.confirmed = S.accepted && o.confirmed === true;
    /* a street that was assembled before the reload has already had its
       boundary drawn; it must not draw itself again on screen 3 */
    bndShown = S.committed >= NEED;
  }
  function save() {
    try {
      if (!S.joined && !S.verified && !S.accepted) { sessionStorage.removeItem(KEY); }
      else { sessionStorage.setItem(KEY, JSON.stringify({ joined: S.joined, committed: S.committed, verified: S.verified, accepted: DEV && S.accepted, confirmed: DEV && S.confirmed })); }
    } catch (e) { /* storage off: the state still lives for this page */ }
  }
  /* is household i in the committed set? The order grows out from no. 31
     (rank 0), so when she has not joined the committed set is the next
     `committed` households in the order, skipping her. */
  function inSet(i, C) {
    if (S.joined) { return RANK[i] < C; }
    return i !== ROSA && RANK[i] <= C;
  }

  /* ── palette (the study's) ───────────────────────────────────────────── */
  var P = "#F3EBD7", INK = "#16150F", MU = "#5A554A",
      G = "#2F5A44", G2 = "#24473A", F = "#8C9A84", F2 = "#6F7F68",
      A = "#C98D1C", GROUND = "#E8DDC2", TAR = "#DACCA8", KERB = "#CFC2A0",
      SURVEY = "#7A5A17",
      PLUM = "#8A3450",    /* the agent's thread and lens (§ A)          */
      RISK = "#A8502A";    /* screen 1's risk shading — a wash, never type */

  /* ══════════════════════════════════════════════════════════════════════
     WORLD GEOMETRY — one shallow oblique
     x runs along the street, D away from the viewer, z up. The study's
     1180 x 820 frame is the world's reference; the paper, slope and road
     extend far past it so the viewport crops the ground and never finds
     its edge.
     ══════════════════════════════════════════════════════════════════════ */
  var KX = 0.16, KY = 0.5, YB = 582;             /* near edge of the lower lots */
  function X(x, D) { return x + KX * D; }
  function Y(D, z) { return YB - KY * D - (z || 0); }
  function pt(x, D, z) { return X(x, D).toFixed(1) + "," + Y(D, z).toFixed(1); }

  var PITCH = 32, BW = 10 * PITCH, GAP = 34, X0 = 56;   /* blocks: 56–376 · 410–730 · 764–1084 */
  function bx(b) { return X0 + b * (BW + GAP); }
  function colOf(i) { return i % PER_ROW; }
  function hx(i) { var col = colOf(i); return bx(Math.floor(col / 10)) + (col % 10) * PITCH; }
  var ROAD = [120, 220];                                  /* D of the road */
  var LOT = { lo: [0, 120], up: [224, 344] };             /* D of the lots either side */
  var HW = 22, HD = 22, HH = 21, HR = 10;                 /* house: width, depth, wall, ridge */
  var HD0 = { up: 246, lo: 20 };                          /* both rows face the road */
  var FAR = -1400, NEAR = 2600;                           /* how far the ground runs */

  /* the collective boundary is SEGMENTED: one amber run under each
     unbroken stretch of participating lots in a row (bridging a block gap
     when both sides are in), never one outline round the whole street — a
     home that has not joined sits visibly outside it even mid-street. */
  function bndRuns(isIn) {
    var runs = [], row, i, first = -1;
    function close(r, a, b) {
      var L = r ? LOT.up : LOT.lo, x0 = hx(a) - 3, x1 = hx(b) + PITCH + 3;
      var pts = [[x0, L[0] - 6], [x1, L[0] - 6], [x1, L[1] + 6], [x0, L[1] + 6]], len = 0, k, p, q, dx, dy;
      for (k = 0; k < 4; k++) { p = pts[k]; q = pts[(k + 1) % 4]; dx = X(q[0], q[1]) - X(p[0], p[1]); dy = Y(q[1]) - Y(p[1]); len += Math.sqrt(dx * dx + dy * dy); }
      runs.push({ pts: pts, len: Math.ceil(len) + 8 });
    }
    for (row = 0; row < 2; row++) {
      first = -1;
      for (i = row * PER_ROW; i < (row + 1) * PER_ROW; i++) {
        if (isIn(i)) { if (first < 0) { first = i; } }
        else if (first >= 0) { close(row === 0, first, i - 1); first = -1; }
      }
      if (first >= 0) { close(row === 0, first, (row + 1) * PER_ROW - 1); }
    }
    return runs;
  }
  /* was the boundary on the drawing at the last render? The draw-in runs
     only on the render that first shows it — screen 3, the press reaching
     48 — never again on a repaint or a screen change while it stays. */
  var bndShown = false;
  function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ── the agent's thread, in street coordinates ────────────────────────
     It begins at no. 31 (where her signed paper is tied) and runs to the
     kerb; then, for every household her agent has reached (commitment
     ranks 42 and up), along the road's centre line to that lot and up to
     its gate. Segments are drawn once each — the run continues from the
     spur's foot, never back over it — so the line is one continuous
     thread at one weight. */
  var ROAD_C = (ROAD[0] + ROAD[1]) / 2;
  function gateD(i) { return i < PER_ROW ? ROAD[1] - 2 : ROAD[0] + 2; }  /* the lot's gate: on the kerb, clear of the frontage strip */
  function midx(i) { return hx(i) + PITCH / 2; }
  /* the segments the thread has at count C, each tagged with the rank of
     the household it reaches (−1 for the kerb segment) */
  function threadSegs(C) {
    var segs = [], x0 = midx(ROSA), rank, i, xi;
    segs.push({ rank: -1, a: [x0, HD0.up - 2], b: [x0, ROAD_C] });
    for (rank = START + 1; rank < C; rank++) {
      i = ORDER[rank]; xi = midx(i);
      segs.push({ rank: rank, a: [x0, ROAD_C], b: [xi, ROAD_C] });
      segs.push({ rank: rank, a: [xi, ROAD_C], b: [xi, gateD(i)], gate: i });
      x0 = xi;
    }
    return segs;
  }
  function segLen(s) {
    var dx = X(s.b[0], s.b[1]) - X(s.a[0], s.a[1]), dy = Y(s.b[1]) - Y(s.a[1]);
    return Math.sqrt(dx * dx + dy * dy);
  }
  var SPEED = 640;        /* drawing units per second along the thread */
  var SEG_MIN = 0.12;     /* seconds: the shortest a segment takes      */

  /* the round a press has just started: homes with rank in [from, to)
     arrive one by one as the thread reaches them. Consumed by the next
     renderStreet() and never kept, so every later render is static. */
  var round = null;
  /* the timing of the round the last render animated: when each rank's
     home filled and when the thread stopped — read by the invite press to
     tick the count and reveal the agent's log in step with the street */
  var lastRound = { total: 0, arrive: {} };

  /* where a household's pin aims: the ridge of its house */
  function hcx(i) { var up = i < PER_ROW; return X(hx(i) + PITCH / 2, (up ? HD0.up : HD0.lo) + HD / 2); }
  function hcy(i) { var up = i < PER_ROW; return Y((up ? HD0.up : HD0.lo) + HD / 2, HH + HR); }
  /* the ring drawn round no. 31: centre and radius, in world units */
  var RING_R = 26;
  function ringc(i) { var d0 = i < PER_ROW ? HD0.up : HD0.lo; return { x: X(hx(i) + PITCH / 2, d0), y: Y(d0, 10) }; }

  /* ── cameras ──────────────────────────────────────────────────────────
     A camera is the world region that must be VISIBLE, not a raw viewBox.
     viewBoxFor() turns it into one at draw time against the screen's own
     ground window, so the framing stays honest at any window size. */
  var CAM = {
    street: { x: 0, y: 282, w: 1180, h: 334 },
    /* screen 2: close on no. 31 and the run of houses either side of it,
       both rows and the road still in frame, so the agreement is seen
       attached to one home among others */
    deal:   { x: 420, y: 404, w: 420, h: 180 },
    commit: { x: 0, y: 282, w: 1180, h: 334 },
    ready:  { x: -70, y: 282, w: 1320, h: 360 }
  };
  /* A phone gets the same landscape world, framed tighter: both rows and
     the road still, but a run of the street rather than all sixty, because
     the window under the stacked copy is short. A tablet in portrait is
     wide enough to hold the whole street and keeps the full camera. */
  var CAM_N = {
    street: { x: 330, y: 282, w: 560, h: 334 },
    deal:   { x: 500, y: 404, w: 260, h: 180 },
    commit: { x: 330, y: 282, w: 560, h: 334 },
    ready:  { x: 330, y: 282, w: 560, h: 360 }
  };

  var narrow = false;
  function isNarrow() { return window.matchMedia("(max-width: 899px)").matches; }
  function isPhone() { return window.matchMedia("(max-width: 599px)").matches; }

  var svg = document.getElementById("plan");

  /* ══════════════════════════════════════════════════════════════════════
     WHO COMMITS, AND IN WHAT ORDER
     Not a shuffle. Commitment on a street spreads from a few households to
     the ones beside them, so the order grows outward from five starters and
     the holdouts end up at the ends of the runs — which is what makes the
     frontage strip visibly knit together as the count rises, and what makes
     the last few signatures look hard to get. The study uses this order.
     ══════════════════════════════════════════════════════════════════════ */
  var ORDER = (function () {
    var seeds = [ROSA, 4, 22, 38, 52], taken = {}, out = [], front = [], guard = 0;
    seeds.forEach(function (s) { if (!taken[s]) { taken[s] = 1; out.push(s); front.push(s); } });
    while (out.length < HOMES && guard++ < 400) {
      var next = [];
      front.forEach(function (i) {
        [i - 1, i + 1, i - PER_ROW, i + PER_ROW].forEach(function (j) {
          if (j < 0 || j >= HOMES || taken[j]) { return; }
          /* a row does not wrap into the other one at its ends */
          if (j === i - 1 && colOf(i) === 0) { return; }
          if (j === i + 1 && colOf(i) === PER_ROW - 1) { return; }
          taken[j] = 1; out.push(j); next.push(j);
        });
      });
      if (!next.length) {
        for (var k = 0; k < HOMES; k++) {
          if (!taken[k]) { taken[k] = 1; out.push(k); next.push(k); break; }
        }
      }
      front = next;
    }
    return out;
  })();
  var RANK = (function () { var r = []; ORDER.forEach(function (i, n) { r[i] = n; }); return r; })();

  /* ── deterministic planting, so the street looks like a street ─────── */
  var TREES = [[48, 302, 13, 0], [150, 308, 11, 1], [262, 298, 13, 0], [392, 306, 10, 1], [462, 310, 12, 0], [600, 300, 13, 1],
               [708, 308, 11, 0], [748, 296, 9, 1], [830, 304, 13, 0], [952, 310, 11, 1], [1060, 300, 13, 0],
               [-80, 306, 12, 1], [-210, 298, 13, 0], [-340, 310, 10, 1], [1190, 304, 12, 0], [1320, 298, 13, 1], [1450, 308, 10, 0]];
  var SHRUBS = [[393, 58, 7], [392, 92, 5], [747, 66, 8], [748, 100, 5], [32, 70, 7], [1108, 76, 7], [-60, 60, 6], [1180, 96, 6]];

  /* ══════════════════════════════════════════════════════════════════════
     DRAWING THE STREET
       opts.mode     — "alone"  (screen 1: nobody has committed; no. 31 did
                                  the work on its own and is ringed)
                       "commit" (screens 2–5: every house shows its state
                                  from S — the others, and no. 31 only once
                                  joined; the boundary draws at ≥ 48)
       opts.ring     — commit mode: ring no. 31 (screen 2, where the terms
                       sheet is tied to her roof)
       opts.verified — commit mode only: the surveyor's ochre mark on every
                       committed lot, once the surveyor control is pressed
       opts.alt      — the accessible description
     ══════════════════════════════════════════════════════════════════════ */

  function poly(pts, fill, o) {
    o = o || {};
    return '<polygon points="' + pts.map(function (p) { return pt(p[0], p[1], p[2]); }).join(" ") +
      '" fill="' + fill + '"' + (o.st ? ' stroke="' + o.st + '" stroke-width="' + (o.sw || 1.4) + '" stroke-linejoin="round"' : "") +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.filter ? ' filter="' + o.filter + '"' : "") + (o.attr ? " " + o.attr : "") + "/>";
  }
  function line(x1, y1, x2, y2, c, w, o) {
    o = o || {};
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) +
      '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"' +
      (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.op != null ? ' opacity="' + o.op + '"' : "") +
      (o.attr ? " " + o.attr : "") + "/>";
  }

  function house(i, on, ringed) {
    var up = i < PER_ROW, x = hx(i) + (PITCH - HW) / 2, d0 = up ? HD0.up : HD0.lo, d1 = d0 + HD;
    var fillF = on ? G : P, fillS = on ? G2 : P, fillRL = on ? F : P, fillRR = on ? F2 : P;
    var st = on ? G2 : MU, dash = on ? null : "3 2.5", sw = on ? 1 : 1.5, s = [];
    s.push('<g data-house="' + (on ? "in" : "out") + '"' + (i === ROSA ? ' data-lot="31"' : '') + '>');
    /* left roof slope, right roof slope, right wall, near face (gable) */
    s.push(poly([[x, d0, HH], [x, d1, HH], [x + HW / 2, d1, HH + HR], [x + HW / 2, d0, HH + HR]], fillRL, { st: st, dash: dash, sw: sw }));
    s.push(poly([[x + HW / 2, d0, HH + HR], [x + HW / 2, d1, HH + HR], [x + HW, d1, HH], [x + HW, d0, HH]], fillRR, { st: st, dash: dash, sw: sw }));
    s.push(poly([[x + HW, d0, 0], [x + HW, d1, 0], [x + HW, d1, HH], [x + HW, d0, HH]], fillS, { st: st, dash: dash, sw: sw }));
    s.push(poly([[x, d0, 0], [x + HW, d0, 0], [x + HW, d0, HH], [x + HW / 2, d0, HH + HR], [x, d0, HH]], fillF, { st: st, dash: dash, sw: sw }));
    if (on && up) { /* a door toward the road, so the upper row reads as fronts */
      s.push(poly([[x + 8, d0, 0], [x + 14, d0, 0], [x + 14, d0, 9], [x + 8, d0, 9]], P, { op: .85 }));
    }
    s.push('</g>');
    if (ringed) {
      var c = ringc(i);
      s.push('<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) +
             '" r="' + RING_R + '" fill="none" stroke="' + INK + '" stroke-width="1.6"/>');
    }
    return s.join("");
  }

  /* the surveyor's mark: one ochre check at the ridge of a committed house,
     drawn only while verification is ILLUSTRATED. It is the one ochre on
     the ground and it means "a surveyor is shown to have passed this lot" —
     never "this lot is covered". */
  function tick(i) {
    var cx = hcx(i), cy = hcy(i) - 7;
    return '<g data-tick="1"><circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5.2" fill="' + SURVEY + '" stroke="' + P + '" stroke-width="1.3"/>' +
      '<path d="M' + (cx - 2.6).toFixed(1) + ' ' + (cy + 0.2).toFixed(1) + ' l1.9 1.9 l3.4 -3.8" fill="none" stroke="' + P + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }

  /* the lens mark: circle and handle, in the agent's plum, the circle
     filled with the paper so the thread ends at the mark rather than
     running through it. At the head of the thread. */
  function lens(x, y, o) {
    o = o || {};
    return '<g data-lens="1"' + (o.pulse ? ' data-pulse="1"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + (o.style ? ' style="' + o.style + '"' : "") +
      ' transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' +
      '<circle cx="0" cy="0" r="7.5" fill="' + P + '" stroke="' + PLUM + '" stroke-width="2.4"/>' +
      '<line x1="5.4" y1="5.4" x2="11.5" y2="11.5" stroke="' + PLUM + '" stroke-width="3" stroke-linecap="round"/></g>';
  }

  /* the thread on the ground. Static for every segment the agent had
     already drawn; the segments of the round just pressed draw in, in
     order, each at the thread's one speed, and the home at each spur's
     end fills when the thread gets there (arrivals, by rank). The lens
     sits at the head and, in a round, appears when the thread stops.
     Returns { svg, arrive: {rank: seconds}, total: seconds }. */
  function thread(C, rnd) {
    var segs = threadSegs(C), s = [], arrive = {}, t = 0, anim = rnd && !reducedMotion(), head = null, i, g, L, dur;
    for (i = 0; i < segs.length; i++) {
      g = segs[i]; L = segLen(g); head = g.b;
      var moving = anim && g.rank >= rnd.from;
      if (moving) {
        dur = Math.max(SEG_MIN, L / SPEED);
        s.push(line(X(g.a[0], g.a[1]), Y(g.a[1]), X(g.b[0], g.b[1]), Y(g.b[1]), PLUM, 2,
          { op: .42, attr: 'data-thread="1" stroke-dasharray="' + L.toFixed(1) + '" stroke-dashoffset="' + L.toFixed(1) +
            '" style="animation-duration:' + dur.toFixed(2) + 's;animation-delay:' + t.toFixed(2) + 's"' }));
        t += dur;
        if (g.gate != null) { arrive[g.rank] = t; }
      } else {
        s.push(line(X(g.a[0], g.a[1]), Y(g.a[1]), X(g.b[0], g.b[1]), Y(g.b[1]), PLUM, 2, { op: .42 }));
      }
      /* where the thread touched a lot: a small plum point at the gate */
      if (g.gate != null && i < segs.length - 1) {
        s.push('<circle cx="' + X(g.b[0], g.b[1]).toFixed(1) + '" cy="' + Y(g.b[1]).toFixed(1) + '" r="2.6" fill="' + PLUM + '" opacity=".55"' +
          (moving ? ' class="arrive" style="animation-delay:' + t.toFixed(2) + 's"' : "") + '/>');
      }
    }
    /* the lens reads (pulses) while the agent is still working the street */
    var lo = { pulse: S.screen === 3 && C < NEED };
    if (anim) { lo.cls = "arrive"; lo.style = "animation-delay:" + t.toFixed(2) + "s"; }
    var lensSvg = head ? lens(X(head[0], head[1]), Y(head[1]), lo) : "";
    return { svg: s.join(""), lens: lensSvg, arrive: arrive, total: t };
  }

  /* the frontage strip: the cleared metres at the road edge of a committed
     lot. Below the threshold every strip stops short of its neighbour. At
     the threshold the committed strips meet, and bridge the block gaps,
     into continuous runs — broken only where a lot is still out. */
  function strips(up, isIn, crossed, delayOf) {
    var s = [], D0 = up ? LOT.up[0] : LOT.lo[1] - 12, D1 = D0 + 12, base = up ? 0 : PER_ROW;
    for (var i = base; i < base + PER_ROW; i++) {
      if (!isIn(i)) { continue; }
      var col = colOf(i), x0 = hx(i), x1 = x0 + PITCH, inset = crossed ? 0 : 5;
      if (crossed && col % 10 === 9 && col < PER_ROW - 1 && isIn(i + 1)) { x1 += GAP; }
      var at = delayOf ? delayOf(i) : null;
      var p = poly([[x0 + inset, D0], [x1 - inset, D0], [x1 - inset, D1], [x0 + inset, D1]], G);
      /* a strip arriving in this round fills with its house */
      s.push(at == null ? p : '<g class="arrive" style="animation-delay:' + at.toFixed(2) + 's">' + p + '</g>');
    }
    return s.join("");
  }

  function tree(x, D, r, dark) {
    return line(X(x, D), Y(D), X(x, D), Y(D) - r * 1.1, INK, 2, { op: .55 }) +
      '<circle cx="' + X(x, D).toFixed(1) + '" cy="' + (Y(D) - r * 1.35).toFixed(1) + '" r="' + r + '" fill="' + (dark ? F2 : F) + '"/>';
  }
  function shrub(x, D, r) {
    return '<ellipse cx="' + X(x, D).toFixed(1) + '" cy="' + Y(D).toFixed(1) + '" rx="' + r + '" ry="' + (r * .62).toFixed(1) + '" fill="' + F2 + '" opacity=".8"/>';
  }

  /* the slope behind the street: a low, planted horizon, deterministic */
  function horizonPts(y0) {
    var out = [], x;
    for (x = FAR; x <= NEAR; x += 60) {
      out.push(x + " " + (y0 + 9 * Math.sin(x / 95) + 5 * Math.sin(x / 41 + 1.3)).toFixed(1));
    }
    return out;
  }
  function horizon(y0) { return "M" + horizonPts(y0).join(" L"); }
  /* the planted band just below the horizon: the top edge forward, the
     lower edge back */
  function slopeBand() {
    return "M" + horizonPts(304).join(" L") + " L" + horizonPts(332).reverse().join(" L") + " Z";
  }

  function renderStreet(opts) {
    opts = opts || {};
    var mode = opts.mode || "commit";
    var alone = mode === "alone";
    var C = alone ? 0 : S.committed;
    var crossed = !alone && C >= NEED;
    var verified = !alone && !!opts.verified;
    var ringed = alone || !!opts.ring;
    function isIn(i) { return !alone && inSet(i, C); }
    var s = [], i;
    /* the round just pressed, if any — consumed here, once */
    var rnd = (opts.thread && round) ? round : null; round = null;
    /* the thread: on screens 3–5, once her agent exists (joined) */
    var thr = (opts.thread && S.joined) ? thread(C, rnd) : null;
    var arriveAt = thr ? thr.arrive : {};
    var roundEnd = thr ? thr.total : 0;
    if (rnd) { lastRound = { total: roundEnd, arrive: arriveAt }; }
    function arriving(i) { return rnd && S.joined && RANK[i] >= rnd.from && RANK[i] < rnd.to && !reducedMotion(); }

    s.push('<defs>' +
      '<filter id="grain" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in" result="g"/><feBlend in="SourceGraphic" in2="g" mode="multiply"/></filter>' +
      '<filter id="rough" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="9" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
      /* screen 1's risk: a warm wash from the slope down across the whole
         street, and a diagonal hatch so it survives greyscale */
      '<linearGradient id="riskg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + RISK + '" stop-opacity=".30"/><stop offset=".55" stop-color="' + RISK + '" stop-opacity=".16"/><stop offset="1" stop-color="' + RISK + '" stop-opacity=".07"/></linearGradient>' +
      '<pattern id="riskh" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><line x1="0" y1="0" x2="0" y2="9" stroke="' + RISK + '" stroke-width="1.1" opacity=".22"/></pattern>' +
      '</defs>');
    /* every mark sits in one untransformed group, so the pin projection can
       read a single CTM */
    s.push('<g>');

    /* paper, the one ground plane, the slope, the road — all past every edge */
    s.push('<rect x="' + FAR + '" y="-1400" width="' + (NEAR - FAR) + '" height="3200" fill="' + P + '"/>');
    var hz = horizon(304);
    s.push('<path d="' + hz + ' L' + NEAR + ' 606 L' + FAR + ' 606 Z" fill="' + GROUND + '"/>');
    s.push('<path d="' + hz + '" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".28"/>');
    s.push('<path d="' + slopeBand() + '" fill="' + F + '" opacity=".3"/>');
    s.push(poly([[FAR, ROAD[0]], [NEAR, ROAD[0]], [NEAR, ROAD[1]], [FAR, ROAD[1]]], TAR, { filter: "url(#grain)" }));
    s.push(line(X(FAR, 170), Y(170), X(NEAR, 170), Y(170), P, 2, { dash: "22 16", op: .9 }));
    s.push(line(X(FAR, ROAD[1]), Y(ROAD[1]), X(NEAR, ROAD[1]), Y(ROAD[1]), KERB, 1.6));
    s.push(line(X(FAR, ROAD[0]), Y(ROAD[0]), X(NEAR, ROAD[0]), Y(ROAD[0]), KERB, 1.6));

    /* six blocks of ten: ground plates */
    s.push('<g filter="url(#grain)">');
    for (var b = 0; b < 3; b++) {
      var x0 = bx(b) - 3, x1 = bx(b) + BW + 3;
      s.push(poly([[x0, LOT.up[0]], [x1, LOT.up[0]], [x1, LOT.up[1]], [x0, LOT.up[1]]], F, { op: .42 }));
      s.push(poly([[x0, LOT.lo[0]], [x1, LOT.lo[0]], [x1, LOT.lo[1]], [x0, LOT.lo[1]]], F, { op: .42 }));
    }
    s.push('</g>');
    /* a faint lot line between every pair of neighbours, so a lot is a lot */
    for (i = 0; i < HOMES; i++) {
      var col = colOf(i); if (col % 10 === 0) { continue; }
      var up = i < PER_ROW, lx = hx(i), L = up ? LOT.up : LOT.lo;
      s.push(line(X(lx, L[0]), Y(L[0]), X(lx, L[1]), Y(L[1]), INK, 1, { op: .14 }));
    }

    /* ── screen 1: the risk is collective ──
       One shading from the slope behind the upper row down across both
       rows, the road and the block gaps — over the lot lines, not within
       them. No edge: it is weather, not a boundary. */
    if (alone) {
      var RK = [[X0 - 60, LOT.up[1] + 30], [bx(2) + BW + 60, LOT.up[1] + 30], [bx(2) + BW + 60, LOT.lo[0] - 30], [X0 - 60, LOT.lo[0] - 30]];
      s.push(poly(RK, "url(#riskg)", { attr: 'data-risk="1"' }));
      s.push(poly(RK, "url(#riskh)", { attr: 'data-risk="1"' }));
    }

    /* ── the agent's thread, under the houses: it reaches each gate and
       the house is drawn over its end ── */
    if (thr) { s.push(thr.svg); }

    /* ── the collective boundary: the threshold EVENT, the only amber ──
       The first time it appears — screen 3, the press reaching 48 — the
       edge draws itself in after the round's last home has filled: a
       short stroke-draw from a full-perimeter dash (style.css, @keyframes
       bnd-draw). Under reduced motion it is simply there. Any later render
       at or above 48 draws it static. */
    if (crossed) {
      var draw = !bndShown && S.screen === 3 && !reducedMotion();
      var wait = draw && roundEnd ? ' style="animation-delay:' + (roundEnd + 0.15).toFixed(2) + 's"' : "";
      var BC = covered() ? "#2F5E7C" : A;   /* amber while an offer; the carrier's blue once covered */
      bndRuns(isIn).forEach(function (r) {
        s.push(poly(r.pts, BC, { op: covered() ? .14 : .09, attr: 'data-boundary="fill"' + (draw ? ' data-draw="1"' + wait : "") }));
        s.push(poly(r.pts, "none", { st: BC, sw: 3.5, attr: 'data-boundary="edge"' +
          (draw ? ' data-draw="1" stroke-dasharray="' + r.len + '" stroke-dashoffset="' + r.len + '"' + wait : "") }));
      });
    }
    bndShown = crossed;

    /* a house that is arriving in this round: drawn hollow, with its
       solid self fading in over it the moment the thread reaches its gate */
    function houseAt(i, on, ring) {
      if (on && arriving(i)) {
        var at = arriveAt[RANK[i]] || 0;
        return house(i, false, ring) + '<g class="arrive" style="animation-delay:' + at.toFixed(2) + 's">' + house(i, true, false) + '</g>';
      }
      return house(i, on, ring);
    }

    /* planting behind the upper row (far), the upper row, strips, then the
       near row and its garden */
    function stripDelay(i) { return arriving(i) ? (arriveAt[RANK[i]] || 0) : null; }
    TREES.forEach(function (t) { s.push(tree(t[0], t[1], t[2], t[3])); });
    s.push(strips(true, isIn, crossed, stripDelay));
    for (i = 0; i < PER_ROW; i++) {
      s.push(houseAt(i, alone ? i === ROSA : isIn(i), ringed && i === ROSA));
      if (verified && isIn(i)) { s.push(tick(i)); }
    }
    s.push(strips(false, isIn, crossed, stripDelay));
    SHRUBS.forEach(function (t) { s.push(shrub(t[0], t[1], t[2])); });
    for (i = PER_ROW; i < HOMES; i++) {
      s.push(houseAt(i, isIn(i), false));
      if (verified && isIn(i)) { s.push(tick(i)); }
    }

    /* the lens at the head of the thread, over everything */
    if (thr) { s.push(thr.lens); }

    s.push('</g>');
    svg.innerHTML = s.join("");
    if (opts.alt) { svg.setAttribute("aria-label", opts.alt); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     CAMERA  (inherited from resilience-grid / micromutual)
     ══════════════════════════════════════════════════════════════════════ */

  var vb = null, camTimer = 0;
  function setVB(c) { svg.setAttribute("viewBox", c.x + " " + c.y + " " + c.w + " " + c.h); vb = c; }

  /* Turn "this region must be visible" into a viewBox for an SVG bigger than
     the viewport that uses `slice`. Both axes resolve to one scale, so slice
     crops the ground and never the subject.

     `fit` is the screen's ground window: the band of the viewport the copy
     has left clear. It is both a height budget and an aim point, on every
     width. Sixty houses the viewer is meant to COUNT have to land in the
     clear band, not half under the copy. Width is still the viewport's,
     because a street wants to run off both edges. */
  function viewBoxFor(view, fit) {
    var el = document.getElementById("world").getBoundingClientRect();
    var vpW = window.innerWidth, vpH = window.innerHeight;
    var hLimit = fit ? fit.h : vpH;
    var scale = Math.min(vpW / view.w, hLimit / view.h);
    var vbW = el.width / scale, vbH = el.height / scale;
    var wcx = view.x + view.w / 2 + (fit ? (vpW / 2 - fit.cx) / scale : 0);
    var wcy = view.y + view.h / 2 + (fit ? (vpH / 2 - fit.cy) / scale : 0);
    return { x: wcx - vbW / 2, y: wcy - vbH / 2, w: vbW, h: vbH };
  }

  function groundFit() {
    var sc = screens && screens[S.screen - 1];
    if (!sc) { return null; }
    var gw = sc.querySelector(".gw");
    if (gw) {
      var g = gw.getBoundingClientRect();
      var top = Math.max(0, g.top), bot = Math.min(window.innerHeight, g.bottom);
      if (g.width > 60 && bot - top > 100) {
        return { cx: g.left + g.width / 2, cy: (top + bot) / 2, h: bot - top };
      }
    }
    if (!narrow) { return null; }
    var bottom = 0;
    Array.prototype.forEach.call(sc.children, function (p) {
      if (p.classList.contains("gw")) { return; }
      var r = p.getBoundingClientRect();
      if (r.height > 4 && r.top < window.innerHeight * 0.85) { bottom = Math.max(bottom, r.bottom); }
    });
    bottom = Math.max(0, Math.min(bottom + 12, window.innerHeight - 170));
    return { cx: window.innerWidth / 2, cy: (bottom + window.innerHeight) / 2,
             h: window.innerHeight - bottom };
  }

  function moveCamera(name, instant) {
    var cam = (isPhone() && CAM_N[name]) || CAM[name] || CAM.street;
    var target = viewBoxFor(cam, groundFit());
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
  var tetherEl = document.getElementById("tether");

  function pinAt(cls, label, i, dy) {
    return { cls: cls, label: label, wx: hcx(i), wy: hcy(i), dy: dy };
  }
  function pinSet(n) {
    /* Screen 1 carries one artwork label: Maggie's home, no. 31. Screen 5,
       once the street is ready, returns to her — "Maggie's home" on no. 31,
       in screen 1's own ink label — and labels one house that has not
       joined: the next in the commitment order, which is where a run of
       committed frontage breaks. At sixty there is no such house and no
       second label. */
    if (n === 1) { return [pinAt("ink", "Maggie's home · No. 31", ROSA, -44)]; }
    if (n === 5 && ready()) {
      var pins = [pinAt("ink", "Maggie's home", ROSA, -44)];
      if (S.committed < HOMES) {
        /* the first house outside the set, in the commitment order. When
           she never authorised, that house is no. 31 herself: her label
           keeps the roof and this one sits on the road in front of her
           house (stacking it above would put it under the headline block
           on a phone, where placePins() rightly hides it). */
        var out = S.joined ? ORDER[S.committed] : ROSA;
        pins.push(pinAt("out", "outside the arrangement", out, out === ROSA ? 62 : -44));
      }
      return pins;
    }
    return [];
  }

  function buildPins(n) {
    Array.prototype.slice.call(pinHost.querySelectorAll(".pin")).forEach(function (el) { pinHost.removeChild(el); });
    pinSet(n).forEach(function (p) {
      var el = document.createElement("span");
      el.className = "pin pin--" + p.cls;
      el.textContent = p.label;
      el.dataset.wx = p.wx; el.dataset.wy = p.wy; el.dataset.dy = p.dy || 0;
      pinHost.appendChild(el);
    });
    placePins();
  }

  /* screen-space projection of a world point through the drawing's CTM */
  function project(m, x, y) { return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }; }

  /* The tether: the line that ties the agreement object on screen 2 to the
     ring round no. 31. From the ring's edge to the nearest point on the
     card's edge; hidden when the house is off-screen or under the card.
     Before she signs it is an ink tie. Once signed it is the start of her
     agent's thread — plum, from her paper, ending in the lens mark at her
     home (§ A: the thread begins at the human's paper). */
  function placeTether(m) {
    if (!tetherEl) { return; }
    var card = S.screen === 2 ? document.getElementById("deal-card") : null;
    if (!card || card.offsetParent === null) { tetherEl.innerHTML = ""; return; }
    var r = card.getBoundingClientRect();
    var c = ringc(ROSA), p0 = project(m, c.x, c.y);
    var scale = Math.sqrt(m.a * m.a + m.b * m.b);
    var rad = RING_R * scale;
    /* nearest point on the card's rectangle to the ring centre */
    var qx = Math.max(r.left, Math.min(r.right, p0.x)), qy = Math.max(r.top, Math.min(r.bottom, p0.y));
    var dx = qx - p0.x, dy = qy - p0.y, len = Math.sqrt(dx * dx + dy * dy);
    var onScreen = p0.x > 4 && p0.x < window.innerWidth - 4 && p0.y > 4 && p0.y < window.innerHeight - 4;
    if (!onScreen || len < rad + 12) { tetherEl.innerHTML = ""; return; }
    var ux = dx / len, uy = dy / len;
    var ax = p0.x + ux * rad, ay = p0.y + uy * rad;
    tetherEl.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    var seg = ' x1="' + ax.toFixed(1) + '" y1="' + ay.toFixed(1) + '" x2="' + qx.toFixed(1) + '" y2="' + qy.toFixed(1) + '"';
    if (S.joined) {
      tetherEl.innerHTML =
        '<line' + seg + ' stroke="' + P + '" stroke-width="6" stroke-linecap="round"/>' +
        '<line' + seg + ' stroke="' + PLUM + '" stroke-width="2" stroke-linecap="round" opacity=".42"/>' +
        lens(ax, ay, null);
      return;
    }
    tetherEl.innerHTML =
      '<line' + seg + ' stroke="' + P + '" stroke-width="5" stroke-linecap="round"/>' +
      '<line' + seg + ' stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="' + ax.toFixed(1) + '" cy="' + ay.toFixed(1) + '" r="4" fill="' + INK + '" stroke="' + P + '" stroke-width="1.5"/>';
  }

  /* A pin is hidden when it would land under a plate, under the chrome, off
     the edge, or under another pin — an opaque label half under an opaque
     plate is the defect, not the fix. */
  function placePins() {
    var g = svg.querySelector("g");
    if (!g || !g.getScreenCTM) { return; }
    var m;
    try { m = g.getScreenCTM(); } catch (e) { return; }
    if (!m) { return; }

    placeTether(m);

    var sc = screens && screens[S.screen - 1];
    var blockers = sc ? Array.prototype.filter.call(sc.children, function (p) { return !p.classList.contains("gw"); })
      .map(function (p) { return p.getBoundingClientRect(); }) : [];
    blockers = blockers.concat(Array.prototype.map.call(
      document.querySelectorAll(".chrome button, .chrome select"),
      function (p) { return p.getBoundingClientRect(); }));

    var placed = [];
    Array.prototype.forEach.call(pinHost.querySelectorAll(".pin"), function (el) {
      var p = project(m, +el.dataset.wx, +el.dataset.wy);
      var cx = p.x, cy = p.y + (+el.dataset.dy);
      el.style.left = cx + "px";
      el.style.top = cy + "px";
      el.style.display = "block";
      var r = el.getBoundingClientRect();
      var onScreen = r.left > 6 && r.right < window.innerWidth - 6 &&
                     r.top > 6 && r.bottom < window.innerHeight - 6;
      var hits = function (q) {
        return r.left < q.right + 5 && r.right > q.left - 5 &&
               r.top < q.bottom + 5 && r.bottom > q.top - 5;
      };
      var clear = onScreen && !blockers.some(hits) && !placed.some(hits);
      el.style.display = clear ? "block" : "none";
      if (clear) { placed.push(r); }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     PAINT — every state-dependent word and mark, from S, in one place
     ══════════════════════════════════════════════════════════════════════ */

  /* One polite live region for state changes that are not screen changes.
     The screen announcer (#announce) handles navigation; this handles
     everything else, so the two never overwrite each other mid-sentence. */
  var statusEl = document.getElementById("state-status");
  function say(msg) { if (statusEl) { statusEl.textContent = msg; } }

  var joinBtn = document.getElementById("join");
  var joinedEl = document.getElementById("joined");
  var joinedN = document.getElementById("joined-n");
  var inviteBtn = document.getElementById("invite");
  var ctlEl = document.getElementById("ctl");
  var countEl = document.getElementById("thr-count");
  var offerEl = document.getElementById("offer");
  var offerText = document.getElementById("offer-text");
  var condN = document.getElementById("cond-n");
  var stepPart = document.getElementById("step-part");
  var stepImpr = document.getElementById("step-impr");
  var stepVer = document.getElementById("step-ver");
  var verState = document.getElementById("ver-state");
  var verBtn = document.getElementById("verify-toggle");
  var arrHead = document.getElementById("arr-head");
  var arrLine = document.getElementById("arr-line");
  var arrStatus = document.getElementById("arr-status");
  var arrN = document.getElementById("arr-n");
  var nextBtnEl = document.getElementById("next");

  var WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven",
               "eight", "nine", "ten", "eleven", "twelve"];
  function few(n) { return n <= 12 ? WORDS[n] : String(n); }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }

  /* Screen 3's ONE state line, verbatim from the copy contract. Below the
     threshold: "Not yet. {k} more households needed." with k = 48 − count,
     as a word up to twelve and a number above; k = 1 takes the singular. */
  function conditionLine(open) {
    if (open) { return "Participation reached. Improvements and verification still required."; }
    var short = NEED - S.committed;
    return "Not yet. " + cap(few(short)) + " more household" + (short === 1 ? "" : "s") + " needed.";
  }

  /* Screen 5's words, derived. The pending line names what is missing. */
  function missing() {
    var out = [];
    if (S.committed < NEED) { out.push("Participation below 48"); }
    if (!S.verified) { out.push("Verification pending"); }
    return out;
  }

  /* one block span per line, with a space between so textContent — what a
     screen reader and the gate both read — keeps the words apart */
  function spans(lines) {
    return lines.map(function (t) { return "<span>" + t + "</span>"; }).join(" ");
  }

  /* Screen 5's READY line: the contrast, as two tabs joined by an arrow.
     "Alone · no offer" wears screen 1's state — muted, the hollow dashed
     mark of a pending step — and "Together · conditional offer secured"
     the green and the solid met mark of screen 4's chips. The arrow is
     artwork; the spaces around it keep the words apart in textContent.
     Nothing here says covered, active, in force, signed or begun. */
  var MARK = '<svg class="xtab-mark" viewBox="0 0 22 22" aria-hidden="true" focusable="false">' +
             '<circle cx="11" cy="11" r="9"/><path d="M6.5 11.5 L9.8 14.6 L15.6 8.2"/></svg>';
  function tabs() {
    return '<span class="xtab xtab--alone">' + MARK + '<span class="xtab-t">Alone · no offer</span></span> ' +
           '<span class="xtab-arrow" aria-hidden="true">→</span> ' +
           '<span class="xtab xtab--together">' + MARK + '<span class="xtab-t">' + (covered() ? "Together · covered" : "Together · conditional offer secured") + '</span></span>';
  }

  /* #invite's two states: a round remains, or the street is assembled.
     Unjoined there is no agent to send, so the button is inert too. */
  /* her agent's work for the round that brought the street to its count:
     nothing before the first press; then the three lines of that round */
  var logEl = document.getElementById("agent-log");
  function logLines() {
    if (!S.joined || S.committed <= START + 1) { return []; }
    return ["Proposal sent to the next households", "Their agents respond",
            S.committed >= NEED ? "Three confirmed · threshold reached" : "Three confirmed · " + S.committed + " of 60"];
  }

  function inviteState() {
    if (!S.joined) { return "none"; }
    return S.committed >= NEED ? "done" : "ready";
  }

  function paint() {
    var open = S.committed >= NEED;
    var busy = !!(ctlEl && ctlEl.dataset.busy === "1");

    /* screen 2 — the one action, or its result (with the live count) */
    if (joinBtn) { joinBtn.hidden = S.joined; }
    if (joinedEl) { joinedEl.hidden = !S.joined; }
    if (joinedN) { joinedN.textContent = String(S.committed); }

    /* screen 3 — the count, the agent's one line, the invite button */
    if (countEl) { countEl.textContent = String(S.committed); }
    if (ctlEl && !busy) { ctlEl.dataset.state = open ? "open" : "closed"; }
    if (ctlEl) { ctlEl.dataset.agent = S.joined ? "on" : "off"; }
    if (offerEl && !busy) { offerEl.dataset.state = open ? "open" : "closed"; }
    if (offerText && !busy) { offerText.textContent = conditionLine(open); }
    if (logEl) { logEl.innerHTML = logLines().map(function (t) { return '<li data-on="1">' + t + "</li>"; }).join(""); }
    if (inviteBtn) {
      var st = inviteState();
      if (!busy) { inviteBtn.textContent = st === "done" ? "Street assembled" : "Invite the street"; }
      /* not `disabled` and not aria-disabled: the button stays readable
         and pressable in every state, and the press is simply answered
         (below) when there is nothing to invite */
      inviteBtn.dataset.state = st;
    }

    /* screen 4 — the count is the street's, never clamped to 48 */
    if (condN) { condN.textContent = String(S.committed); }
    if (stepPart) { stepPart.dataset.state = open ? "met" : "pending"; }
    if (stepImpr) { stepImpr.dataset.state = S.verified ? "met" : "pending"; }
    if (stepVer) { stepVer.dataset.state = S.verified ? "met" : "pending"; }
    if (verState) { verState.textContent = S.verified ? "Verified" : "Pending"; }
    if (verBtn) { verBtn.setAttribute("aria-pressed", S.verified ? "true" : "false"); }

    /* screen 5 — derived. Ready: the payoff returns to Maggie. The line is
       the contrast, two tabs joined by an arrow: Alone (screen 1's state —
       muted, the hollow dashed mark) → Together (green, the met mark): a
       conditional offer secured. The three status chips name what is
       settled (participation, the live count; verification) and what is
       not (the terms and her acceptance — pending). */
    if (arrHead && arrLine) {
      if (ready()) {
        arrHead.innerHTML = covered() ? spans(["Together, the cover", "Maggie couldn't get alone."]) : spans(["Together, the offer", "Maggie couldn't get alone."]);
        arrLine.innerHTML = tabs();
      } else {
        arrHead.innerHTML = spans(["Still pending."]);
        arrLine.innerHTML = spans(missing());
      }
      if (arrStatus) { arrStatus.hidden = !ready(); }
      if (arrN) { arrN.textContent = String(S.committed); }
      screens[4].dataset.state = covered() ? "covered" : ready() ? "ready" : "pending";
      /* development scenario: the carrier's terms and her acceptance */
      var terms = document.getElementById("terms"), accBtn = document.getElementById("accept"), accLog = document.getElementById("acc-log");
      var tStep = document.getElementById("arr-terms"), tName = document.getElementById("arr-terms-name"), tVal = document.getElementById("arr-terms-val");
      if (terms) { terms.hidden = !(DEV && ready()); }
      if (accBtn) { accBtn.hidden = !DEV || !ready() || !!S.accepted; }
      if (accLog) { accLog.hidden = !S.accepted; if (S.accepted && !accBusy) { Array.prototype.forEach.call(accLog.children, function (li) { li.dataset.on = "1"; }); } }
      if (tStep) { tStep.dataset.state = covered() ? "met" : "pending"; }
      if (tName) { tName.textContent = covered() ? "Terms" : "Terms and acceptance"; }
      if (tVal) { tVal.textContent = covered() ? "accepted · 48 of 48" : "pending"; }
    }

    /* chrome — Next steps aside while the screen's own action is still to
       be taken: quiet paper on screen 2 until joined, on screen 3 until
       the street reaches 48, on screen 4 until verified. Its label and
       behaviour never change; only its weight. */
    if (nextBtnEl) {
      nextBtnEl.classList.toggle("cta--quiet",
        (S.screen === 2 && !S.joined) || (S.screen === 3 && !open) || (S.screen === 4 && !S.verified));
    }
  }

  /* repaint the words, then whatever the open screen draws from them */
  function repaint() {
    paint();
    save();
    if (S.screen >= 2) { drawFor(S.screen); buildPins(S.screen); }
    refit();
  }

  /* #join — Maggie authorises her agent to assemble the proposal. The only
     thing that sets `joined`; it counts no. 31 in and draws her signature.
     It accepts nothing: her share is set before she accepts, and
     acceptance is not modelled because nothing exists to accept. */
  if (joinBtn) {
    joinBtn.addEventListener("click", function () {
      if (S.joined) { return; }
      S.joined = true;
      S.committed = START + 1;
      repaint();
      say("Joined the proposal. " + S.committed + " of 60. No. 31 is now counted in; no terms accepted yet.");
    });
  }

  /* #invite — her agent carries the proposal to the next households. One
     round per press: three more agents accept, the thread reaches each
     lot and the home fills; the count can only stand at 42, 45 or 48. At
     48 the street is assembled and the press does nothing. Unjoined, the
     button is inert: there is no agent to send. */
  var roundTimers = [];
  if (inviteBtn) {
    inviteBtn.addEventListener("click", function () {
      var st = inviteState();
      if (st === "done") { say("The street is assembled: " + S.committed + " of 60. Nothing more to invite."); return; }
      if (st === "none") { say("Her agent has no authority yet. Authorise it on the deal, screen 2."); return; }
      var from = S.committed, to = Math.min(NEED, S.committed + ROUND);
      S.committed = to;
      round = { from: from, to: to };
      repaint();
      /* the work, in step with the street: the count ticks up as each home
         fills, the log's lines land as the thread sends, is answered, and
         confirms — instant under reduced motion */
      roundTimers.forEach(clearTimeout); roundTimers = [];
      if (!reducedMotion() && lastRound.total > 0) {
        var items = logEl ? Array.prototype.slice.call(logEl.children) : [];
        items.forEach(function (li) { li.dataset.on = "0"; });
        if (countEl) { countEl.textContent = String(from); }
        var r, at;
        for (r = from; r < to; r++) {
          at = lastRound.arrive[r] || 0;
          (function (n, at) { roundTimers.push(setTimeout(function () { if (countEl) { countEl.textContent = String(n); } }, Math.round(at * 1000))); })(r + 1, at);
        }
        var mid = (lastRound.arrive[from] || lastRound.total / 2) * 1000;
        [[60, 0], [Math.max(300, mid - 200), 1], [lastRound.total * 1000 + 120, 2]].forEach(function (it) {
          roundTimers.push(setTimeout(function () { if (items[it[1]]) { items[it[1]].dataset.on = "1"; } }, Math.round(it[0])));
        });
        /* while the round runs the state line and the button wait for it:
           the words change only when the count has arrived */
        if (ctlEl) { ctlEl.dataset.busy = "1"; }
        roundTimers.push(setTimeout(function () { if (ctlEl) { delete ctlEl.dataset.busy; } paint(); }, Math.round(lastRound.total * 1000 + 140)));
      }
      var open = S.committed >= NEED;
      say(open
        ? "Street assembled: " + S.committed + " of 60. Participation reached; improvements and verification still required."
        : S.committed + " of 60 joined. " + (NEED - S.committed) + " more households needed.");
    });
  }

  /* #accept — Maggie accepts the carrier's terms (development scenario).
     The only writer of S.accepted. Her acceptance is recorded at once; the
     other households' agents accept and the carrier confirms as timed
     events, and the street's runs turn the carrier's blue on the last. */
  var accTimers = [];
  var acceptBtn = document.getElementById("accept");
  if (acceptBtn) {
    acceptBtn.addEventListener("click", function () {
      if (!DEV || !ready() || S.accepted) { return; }
      S.accepted = true;
      accTimers.forEach(clearTimeout); accTimers = [];
      var log = document.getElementById("acc-log");
      if (!reducedMotion() && log) {
        accBusy = true;
        Array.prototype.forEach.call(log.children, function (li) { li.dataset.on = "0"; });
        repaint();   /* her acceptance: button gone, log shown, nothing covered yet */
        [[80, 0], [900, 1], [1900, 2]].forEach(function (it) {
          accTimers.push(setTimeout(function () { var li = log.children[it[1]]; if (li) { li.dataset.on = "1"; } if (it[1] === 2) { S.confirmed = true; accBusy = false; repaint(); } }, it[0]));
        });
      } else { S.confirmed = true; repaint(); }
      say("Accepted. The other 47 participating households accept; the carrier confirms coverage for the 48 participating homes. Homes that did not join are not covered.");
    });
  }

  if (verBtn) {
    verBtn.addEventListener("click", function () {
      S.verified = !S.verified;
      repaint();
      say(S.verified
        ? "Surveyor verification recorded: verified. Improvements and verification met."
        : "Surveyor verification withdrawn. Verification pending.");
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     PER-SCREEN DRAW
     ══════════════════════════════════════════════════════════════════════ */

  function altFor(n) {
    var c = S.committed, hollow = HOMES - c, reached = c - (START + 1);
    var streetState = "The street with " + c + " of the sixty houses joined: each solid green with a " +
      "cleared frontage strip at the road. The remaining " + hollow + " are hollow with dashed edges and no strip. " +
      (S.joined
        ? "A thin plum thread, her agent's, runs from number 31 to the road" +
          (reached > 0 ? " and along it to the " + reached + " households her agent has reached, ending in a lens mark. " : ", ending in a lens mark at the kerb. ")
        : "") +
      (c >= NEED
        ? "An amber boundary encloses the whole street, hollow houses included. "
        : "There is no boundary around the street. ") +
      (S.verified ? "Every joined house carries a small ochre check: the surveyor's mark. " : "");
    if (n === 1) {
      return "Thorn Lane drawn in a shallow oblique: sixty houses in two rows of thirty either " +
        "side of one road, in three blocks a side, with a planted slope behind. A warm hatched " +
        "shading runs from the slope down across every lot, the road and the gaps between blocks, " +
        "ignoring the lot lines: the risk is the street's. Every house is hollow with a dashed " +
        "edge except number 31, Maggie's home, which is solid and ringed and labelled " +
        "“Maggie's home, No. 31”. She has protected her own home and still could not get an offer.";
    }
    if (n === 2) {
      return "Close on number 31, Maggie's home, ringed, and the houses either side of it. " +
        (S.joined
          ? "Number 31 is solid: she has joined, and the count is " + c + " of sixty. A plum thread runs from " +
            "the signed terms sheet to a lens mark at the ring: her agent's thread begins at her paper."
          : "Number 31 is hollow with a dashed edge: she has not joined; " + c + " others are solid. " +
            "A line ties the ring to the terms sheet above it.");
    }
    if (n === 3) { return streetState; }
    if (n === 4) { return streetState + "Three condition steps sit along the foot of the scene."; }
    return streetState + (ready()
      ? "Together, the street holds a conditional offer Maggie could not get alone; the terms and her " +
        "acceptance are pending. Number 31 is labelled “Maggie's home”" +
        (c < HOMES ? "; one house that has not joined is labelled “outside the arrangement”." : ".")
      : "The street is still pending.");
  }

  function drawFor(n) {
    if (n === 1)      { renderStreet({ mode: "alone", alt: altFor(n) }); }
    else if (n === 2) { renderStreet({ mode: "commit", ring: true, alt: altFor(n) }); }
    else              { renderStreet({ mode: "commit", verified: S.verified, thread: true, alt: altFor(n) }); }
  }

  /* ══════════════════════════════════════════════════════════════════════
     FIT — inherited verbatim from resilience-grid / micromutual.
     A plate is never given a height it then has to clip; instead the whole
     composition gives way. Do not weaken this.
     ══════════════════════════════════════════════════════════════════════ */

  var FIT_FLOOR = 0.74;

  function anchorPlates() {
    Array.prototype.forEach.call(
      // Only CARDS get pinned to the top or bottom of their band. The
      // executive compositions place their own hero objects, and an inline
      // align-self written here would silently beat their stylesheet.
      document.querySelectorAll(".screen > .plate[style*='grid-area'], .screen > .steps[style*='grid-area']"), function (el) {
        if (el.classList.contains("gw")) { return; }
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
      /* the ground window is an empty aiming cell, not content */
      if (el.classList.contains("gw")) { return; }
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
       there buys nothing and costs everything. Below 900px the type holds its
       size and the screen scrolls. */
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
      fitScreen(screens && screens[S.screen - 1]);
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

  var CTA = ["Know the deal", "Assemble the street", "Verify the conditions", "Is the street ready?", "Back to the start"];

  screens.forEach(function (sc, i) {
    var o = document.createElement("option");
    o.value = String(i + 1);
    o.textContent = (i + 1) + " of " + total + " · " + sc.dataset.label;
    picker.appendChild(o);
  });

  anchorPlates();

  function show(n, push) {
    n = Math.max(1, Math.min(total, n));
    S.screen = n;
    var sc = screens[n - 1];
    screens.forEach(function (s, i) { s.hidden = (i + 1 !== n); s.scrollTop = 0; });
    /* a control on the screen that just closed must not keep the focus —
       a hidden button would otherwise swallow the arrow keys */
    var ae = document.activeElement, host = ae && ae.closest ? ae.closest(".screen") : null;
    if (host && host.hidden && ae.blur) { ae.blur(); }
    picker.value = String(n);
    prevBtn.disabled = n === 1;
    nextLabel.textContent = CTA[n - 1];

    document.getElementById("veil").dataset.veil = sc.dataset.veil || "";

    paint();
    drawFor(n);
    /* fit before the camera moves: the camera aims at the ground window,
       so it needs the settled layout */
    fitScreen(sc);
    moveCamera(sc.dataset.cam);
    buildPins(n);

    /* Headlines are authored as one span per line, so textContent would run
       the lines together. Join the spans with a space instead. */
    var h = sc.querySelector(".display");
    var sp = h ? h.querySelectorAll("span") : [];
    var said = h
      ? (sp.length
          ? Array.prototype.map.call(sp, function (x) { return x.textContent.trim(); }).join(" ")
          : h.textContent)
      : sc.dataset.label;
    if (n === 3) {
      said += " Proposal participants " + S.committed + " of 60, 48 needed. " + conditionLine(S.committed >= NEED) +
        (S.joined ? "" : " Her agent has no authority yet: authorise it on the deal.");
    }
    if (n === 5) {
      said += " " + (ready()
        ? "Alone, no offer; together, a conditional offer secured. Participation " + S.committed +
          " of 60; verification complete; terms and acceptance pending."
        : missing().join(". ") + ".");
    }
    announce.textContent = "Screen " + n + " of " + total + ". " +
      said.replace(/\s+/g, " ").trim();

    if (push !== false) {
      try { history.replaceState(null, "", "#s/" + n); } catch (e) { /* file:// */ }
    }
  }

  /* "Back to the start" — the ONE reset in the deck. The authorisation, the
     count and the verification all return to their entry values and the
     stored state is cleared. Going back with the arrow, the picker or a
     hash never resets anything. */
  function restart() {
    S.joined = false;
    S.committed = START;
    S.verified = false;
    round = null;
    save();
    show(1);
    say("Back to the start. Not joined; 41 of 60 joined; verification pending.");
  }
  function next() {
    if (S.screen === total) { restart(); } else { show(S.screen + 1); }
  }
  function prev() {
    if (S.screen > 1) { show(S.screen - 1); }
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  picker.addEventListener("change", function () { show(parseInt(picker.value, 10)); });

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (t) { show(parseInt(t.dataset.goto, 10)); }
  });

  /* Arrow keys move the deck — except inside the picker, where the arrow
     keys belong to the control. A focused button (Next, after a tap) has
     no use for left and right, so they still move the deck. */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "select" || tag === "input") { return; }
    if (e.key === "ArrowRight") { next(); }
    if (e.key === "ArrowLeft") { prev(); }
  });

  /* ══════════════════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════════════════ */

  var relayout;
  window.addEventListener("resize", function () {
    clearTimeout(relayout);
    relayout = setTimeout(function () {
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
      moveCamera(screens[S.screen - 1].dataset.cam, true);
      placePins();
    }, 140);
  });
  /* a narrow screen scrolls; the tether's card end moves with it */
  screens.forEach(function (s) { s.addEventListener("scroll", function () { placePins(); }, { passive: true }); });

  /* Skip link: move focus to the open screen's heading, without touching the
     hash. Every .display carries tabindex="-1" so it can receive focus. */
  var skip = document.getElementById("skip");
  if (skip) {
    skip.addEventListener("click", function () {
      var sc = screens[S.screen - 1];
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
    if (n !== null && n !== S.screen) { show(n, false); }
  });

  narrow = isNarrow();
  load();
  paint();
  show(fromHash() || 1, false);
  moveCamera(screens[S.screen - 1].dataset.cam, true);
  /* the font arrives after first layout; the headline backing is the text's
     own box so it follows, but the fit and the camera need the settled lines */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      fitScreen(screens[S.screen - 1]);
      moveCamera(screens[S.screen - 1].dataset.cam, true);
    });
  }
})();
