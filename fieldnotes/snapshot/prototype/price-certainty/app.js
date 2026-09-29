/* ─────────────────────────────────────────────────────────────────────────
   Price Certainty 2036 — prototype behaviour

   EVERY FIGURE AND EVERY PERSON IN THIS FILE IS INVENTED. Rosa A., Marion K.
   and Yusuf T. are fictional households written for this prototype; nothing
   here is measured, forecast, or drawn from a real utility, retailer, insurer
   or reinsurer. What IS real is the arithmetic: prices, bills, targets,
   settlements, carrier margin and the reinsurance tower are all computed from
   the constants below, so every number on screen is consistent with every
   other one and nothing is typed in by hand. Each household's agent tape is
   authored so that its day's net × 365 lands on that household's assignable
   value, rather than being decorative.

   THE MODEL, in one paragraph. A household's covered energy is priced by a
   monthly index (¢/kWh). Its assumed expected annual cost E is that index run
   over the central year. The carrier quotes an annual net-cost target
   T = E + risk load − flexibility credit, where the credit is what the
   carrier returns out of the revenue it earns trading the home's flexibility,
   after its aggregation margin and after repaying any hardware it financed.
   The household pays its supplier as usual and settles the difference to T.
   The carrier's cash is therefore
   (flexibility revenue − hardware finance) + (T − actual bill), which is what
   screen 9 walks up the wall.

   STAGING. Every screen is a drawn ground at inset 0 with opaque paper plates
   of type on top. There is no fixed paper rectangle. Three grounds do most of
   the work: the year (twelve months on graph paper), the home (a section cut
   through the household's actual building), and the wall (the tower, as
   something a price climbs).
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

/* ── Constants ───────────────────────────────────────────────────────── */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* Covered part of the delivered rate, ¢/kWh, by month. Three versions of one
   year — scenarios, not forecasts. */
const SCENARIOS = {
  calm:    { name: 'Calm 2036',    idx: [26.4,25.8,23.2,20.9,19.4,21.1,24.6,26.9,23.8,21.2,24.4,27.1] },
  central: { name: 'Central 2036', idx: [31.2,29.8,24.1,19.6,17.2,21.4,28.9,33.6,26.2,20.8,27.4,35.1] },
  shock:   { name: 'Shock 2036',   idx: [38.0,61.0,27.0,20.0,17.5,23.0,34.0,52.0,29.0,21.0,30.0,41.0] }
};
const SCEN_ORDER = ['calm','central','shock'];

const RISK_LOAD = 0.08;     /* the price of certainty, on expected cost     */
const AGG_MARGIN = 0.25;    /* the carrier's cut of flexibility revenue     */
const EXPORT_FACTOR = 0.62; /* exported kWh credited below the import rate  */

/* ── Glyphs for the home section ─────────────────────────────────────── */

const GLYPH = {
  tank:   '<path d="M15 12h18v24a9 9 0 0 1-18 0z"/><path d="M15 12a9 5 0 0 1 18 0M15 20h18M24 41v4h-5"/>',
  socket: '<rect x="9" y="12" width="30" height="24" rx="4"/><circle cx="19" cy="24" r="2.4"/><circle cx="29" cy="24" r="2.4"/><path d="M24 36v6"/>',
  heater: '<rect x="7" y="15" width="34" height="19" rx="3"/><path d="M15 15v19M22 15v19M29 15v19M36 15v19M11 34v5M37 34v5"/>',
  battery:'<rect x="12" y="9" width="24" height="31" rx="3"/><path d="M19 5h10v4H19z"/><path d="m26 17-6 9h8l-6 9"/>',
  pump:   '<rect x="7" y="13" width="34" height="23" rx="3"/><circle cx="24" cy="24.5" r="7"/><path d="M24 17.5v14M17 24.5h14M11 36v4M37 36v4"/>',
  solar:  '<path d="M9 34 15 13h18l6 21z"/><path d="M12 24h24M21 13l-3 21M27 13l3 21M24 34v7M17 41h14"/>',
  car:    '<path d="M9 31h30M13 31l4-11h14l4 11v6H9z"/><circle cx="17" cy="37" r="3.2"/><circle cx="31" cy="37" r="3.2"/><path d="M24 12v6M21 15h6"/>'
};

/* ── The three households ────────────────────────────────────────────── */
/* Invented people, invented addresses. The spine of the prototype is Rosa,
   because the argument it ends on — that this is a cross-subsidy and the
   product is genuinely for the household that can assign almost nothing —
   only lands if you have been standing in her flat. */

const HOUSEHOLDS = {
  h1: {
    key: 'h1',
    name: 'Rosa A.', first: 'Rosa', initials: 'RA', face: 'rosa',
    place: 'Flat 3B, Kestrel House — a 1962 block',
    short: 'Rosa A. · rented flat, 1962 block',
    line: 'Rents a fourth-floor flat, works nights at a care home, paid fortnightly.',
    assets: 'Nothing structural she is allowed to change',
    kwh:  [720,660,520,400,320,300,340,380,330,400,540,690],
    stops: [
      { label: 'Nothing assigned', f: 0 },
      { label: 'Water heater and one smart socket', f: 55 }
    ],
    assetFinance: 0,
    gives: [ { from: 1, text: 'The water heater, and one socket' } ],
    limit: 'No battery, no panel, no car — two positions, and the second is worth $55 a year.',
    bounds: ['Never below 17 °C', 'Hot water ≥ 45 °C by 06:30', 'No heating while she sleeps days'],
    tape: [
      ['02:40', 'Water heated on the overnight floor', -0.22],
      ['06:05', 'Peak avoided, tank already hot',       0.31],
      ['08:20', 'Bid declined — nothing to sell',       0],
      ['11:30', 'Dehumidifier paused 40 minutes',       0.06],
      ['17:40', 'Evening peak — nothing to offer',      0],
      ['23:10', 'Tank booked for the 02:00 floor',      0]
    ],
    home: {
      top: { type: 'slab',  h: 15, label: 'Flat 4B — somebody else’s floor' },
      bot: { type: 'slab',  h: 13, label: 'Flat 2B — somebody else’s ceiling' },
      side: { w: 6, label: 'Party wall' },
      objs: [
        { g:'tank',   n:'Immersion tank', s:'hall cupboard',   x:41, y:40, at:1 },
        { g:'socket', n:'One smart socket', s:'kitchen',       x:55, y:40, at:1 },
        { g:'heater', n:'Four storage heaters', s:'hard-wired', x:69, y:40, at:-1 },
        { g:'battery',n:'No battery', s:'lease forbids fixings', x:48, y:66, at:-1, ghost:1 },
        { g:'car',    n:'No car', s:'no parking on the block', x:62, y:66, at:-1, ghost:1 }
      ]
    }
  },

  h2: {
    key: 'h2',
    name: 'Marion K.', first: 'Marion', initials: 'MK', face: 'marion',
    place: '14 Thornleigh Road — a 1931 terrace',
    short: 'Marion K. · 1931 terrace, battery on loan',
    line: 'Bought the terrace in 2009. Heat pump and battery financed by the carrier in 2033.',
    assets: '11 kWh battery, heat pump — carrier-financed',
    kwh:  [1560,1420,1080,720,470,360,420,500,430,760,1180,1500],
    stops: [
      { label: 'Nothing assigned', f: 0 },
      { label: 'Water heater only', f: 90 },
      { label: 'Battery dispatch as well', f: 780 },
      { label: 'Heat pump pre-heating as well', f: 1340 }
    ],
    assetFinance: 370,
    gives: [
      { from: 1, text: 'Water heater timing' },
      { from: 2, text: 'Battery dispatch — the battery on her wall is the carrier’s' },
      { from: 3, text: 'Heat pump pre-heating, inside a band she sets' }
    ],
    limit: 'Assign nothing and the $370 hardware finance falls due in cash.',
    bounds: ['18.5–21.5 °C, 07:00–22:30', 'Never below 17 °C', 'Hot water ≥ 45 °C by 06:30'],
    tape: [
      ['02:40', 'Battery charged on the overnight floor', -1.05],
      ['05:55', 'Hot water pre-heated before the peak',   -0.18],
      ['07:20', 'Heat pump pre-heated to 21.5 °C',        -0.42],
      ['11:30', 'Heat pump paused 22 minutes',             0.46],
      ['17:40', 'Discharged 5.1 kWh into the peak',        3.88],
      ['18:25', 'Frequency response held, 14 minutes',     0.98]
    ],
    home: {
      top: { type: 'roof',  h: 20, label: 'Slate roof, north-facing' },
      bot: { type: 'slab',  h: 11, label: '1931 footings, solid wall' },
      side: { w: 5, label: 'Next door' },
      objs: [
        { g:'tank',   n:'Hot water cylinder', s:'upstairs landing', x:41, y:40, at:1 },
        { g:'battery',n:'11 kWh battery', s:'the carrier’s',        x:55, y:40, at:2 },
        { g:'pump',   n:'Heat pump', s:'carrier-financed',          x:69, y:40, at:3 },
        { g:'solar',  n:'No solar', s:'the roof faces north',       x:48, y:66, at:-1, ghost:1 },
        { g:'car',    n:'No car', s:'nothing to charge',            x:62, y:66, at:-1, ghost:1 }
      ]
    }
  },

  h3: {
    key: 'h3',
    name: 'Yusuf T.', first: 'Yusuf', initials: 'YT', face: 'yusuf',
    place: 'Saltmarsh Lane — a 2029 deep retrofit',
    short: 'Yusuf T. · 2029 retrofit, owned outright',
    line: 'Owns the retrofit outright. Exports more than he imports from April to September.',
    assets: '7 kW solar, 20 kWh storage, bidirectional car',
    kwh:  [620,480,210,-60,-240,-320,-280,-180,-120,90,380,580],
    stops: [
      { label: 'Nothing assigned', f: 0 },
      { label: 'Water heater only', f: 110 },
      { label: 'Battery and solar dispatch as well', f: 1180 },
      { label: 'The car’s charge window as well', f: 2150 }
    ],
    assetFinance: 0,
    gives: [
      { from: 1, text: 'Water heater timing' },
      { from: 2, text: 'Battery and solar dispatch, including when to export' },
      { from: 3, text: 'The car’s charge window, and some of the charge' }
    ],
    limit: 'The target goes below zero: the carrier pays the household.',
    bounds: ['18.5–21.5 °C, 07:00–22:30', 'Car at 80% by 07:00 weekdays', 'Hot water ≥ 45 °C by 06:30'],
    tape: [
      ['02:40', 'Car charged to 60% on the floor',      -0.94],
      ['08:05', 'Exported 2.1 kWh into the morning ramp', 1.04],
      ['11:20', 'Battery charged on surplus solar',      -0.05],
      ['14:15', 'Exported 6.4 kWh at the midday cap',     1.92],
      ['17:40', 'Discharged 7.8 kWh into the peak',       3.14],
      ['18:25', 'Car discharged 4 kWh, held at 62%',      0.78]
    ],
    home: {
      top: { type: 'solar', h: 20, label: '7 kW solar, south pitch' },
      bot: { type: 'drive', h: 15, label: 'Drive — bidirectional charger' },
      side: { w: 0, label: '' },
      objs: [
        { g:'tank',   n:'Hot water cylinder', s:'plant cupboard', x:41, y:40, at:1 },
        { g:'solar',  n:'7 kW solar', s:'owned outright',         x:55, y:40, at:2 },
        { g:'battery',n:'20 kWh storage', s:'owned outright',     x:69, y:40, at:2 },
        { g:'pump',   n:'Heat pump', s:'owned outright',          x:48, y:66, at:1 },
        { g:'car',    n:'Bidirectional car', s:'discharges to the grid', x:62, y:66, at:3 }
      ]
    }
  }
};
const H_ORDER = ['h1','h2','h3'];
const SPINE = 'h1';

/* Pool composition and capital. Invented. */
const POOL = {
  homes: 412000,
  weights: { h1: 0.58, h2: 0.31, h3: 0.11 },
  retention: 60e6,      /* captive surplus available in one year */
  reinsurance: 220e6    /* limit, excess of the retention        */
};

const PAGE_LABELS = [
  'A steadier cost, ten years on',
  'Rosa A., Flat 3B',
  'Three households, one promise',
  'The year without it',
  'The trade',
  'The months you lose',
  'Not budget billing',
  'The bill still arrives first',
  'Where the swing lands',
  'What it legally is',
  'A subsidy with a market attached'
];
const LAST_PAGE = PAGE_LABELS.length;

/* ── Arithmetic ──────────────────────────────────────────────────────── */

const monthCost = (kwh, cents) =>
  kwh >= 0 ? (kwh * cents) / 100 : (kwh * cents * EXPORT_FACTOR) / 100;

const bills = (h, scen) => h.kwh.map((q, i) => monthCost(q, SCENARIOS[scen].idx[i]));
const sum = a => a.reduce((x, y) => x + y, 0);
const expected = h => sum(bills(h, 'central'));

function quote(h, stopIndex) {
  const stop = h.stops[Math.min(stopIndex, h.stops.length - 1)];
  const E = expected(h);
  const load = E * RISK_LOAD;
  const flexGross = stop.f;
  const aggFee = flexGross * AGG_MARGIN;
  const credit = flexGross - aggFee - h.assetFinance;
  const target = E + load - credit;
  return { E, load, flexGross, aggFee, credit, target, stop, assetFinance: h.assetFinance };
}

/* Pool-level figures at a price multiplier. */
function pool(mult) {
  let funds = 0, settle = 0, slope = 0;
  for (const k of H_ORDER) {
    const h = HOUSEHOLDS[k], w = POOL.weights[k];
    const q = quote(h, h.stops.length - 1);
    funds  += w * (q.flexGross - h.assetFinance);
    settle += w * (q.E * mult - q.target);
    slope  += w * q.E;
  }
  const N = POOL.homes;
  const fundsTotal = funds * N;
  return {
    fundsTotal,
    settleTotal: settle * N,
    slopeTotal: slope * N,
    capacity: fundsTotal + POOL.retention + POOL.reinsurance
  };
}

/* The multiplier at which a given cumulative settlement cost is reached. */
function multFor(cost) {
  const p0 = pool(1);
  return 1 + (cost - p0.settleTotal) / p0.slopeTotal;
}

/* ── Formatting and DOM ──────────────────────────────────────────────── */

const money = v => (v < 0 ? '−' : '') + '$' + Math.round(Math.abs(v)).toLocaleString('en-US');
const moneyC = v => (v < 0 ? '−' : '+') + '$' + Math.abs(v).toFixed(2);
const mil = v => (v < 0 ? '−' : '') + '$' + (Math.abs(v) / 1e6).toFixed(1) + 'm';
const pctUp = m => (m >= 1 ? '+' : '−') + Math.round(Math.abs(m - 1) * 100) + '%';

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const $ = id => document.getElementById(id);
const compact = () => window.matchMedia('(max-width: 900px)').matches;

/* A generated face standing in for an invented household — no real person is
   depicted; see assets/portraits/PROVENANCE.md. The invented name is always
   set immediately beside it, and the alt text is empty rather than describing
   a person, so a screen reader is handed the invented name and never a
   description that would read as an identity of its own. */
const faceTag = (h, size) =>
  '<img class="face face-' + size + '" src="./assets/portraits/' + h.face +
  '.jpg" alt="" width="320" height="320" decoding="async" />';

/* Face, name and address as one lockup — whose home is on screen. */
function personRow(host, h, size) {
  host.innerHTML = faceTag(h, size || 'm') +
    '<span class="who"><span class="nm">' + h.name + '</span>' +
    '<span class="pl">' + h.place + '</span></span>';
}

/* ── State ───────────────────────────────────────────────────────────── */

const state = {
  page: 1,
  household: SPINE,
  scenario: 'central',
  assign: {},
  settleMode: 'annual',
  shock: 100,
  structure: 'coupled'
};
for (const k of H_ORDER) state.assign[k] = HOUSEHOLDS[k].stops.length - 1;

const H = () => HOUSEHOLDS[state.household];
/* Rosa and Marion are women, Yusuf a man; the running copy names them, so it
   has to agree with them. */
const SHE = h => (h.key === 'h3' ? 'he' : 'she');
const HERSELF = h => (h.key === 'h3' ? 'himself' : 'herself');
const Q = () => quote(H(), state.assign[state.household]);

/* ═══ GROUND A · the year, on graph paper, edge to edge ═══════════════ */

function niceStep(range) {
  const raw = range / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
}

/* opts: values, cls, negCls, lines [{v, tag, dash}], tagX, showValues */
function groundYear(host, values, opts) {
  const o = Object.assign({ cls: 'pos', negCls: 'neg', lines: [], tagX: 56, showValues: true }, opts);
  host.innerHTML = '';
  const g = el('div', 'g-year');
  host.appendChild(g);

  const HH = host.clientHeight || 900;
  const lineVals = o.lines.map(l => l.v);
  const all = values.concat(lineVals, [0]);
  const top = Math.max(...all), bot = Math.min(...all);
  /* Headroom leaves the tallest bar's own figure room to sit above it and
     still clear the floating chrome at the top of the screen. */
  const headroom = 0.14;
  const hi = top + (top - bot) * headroom;
  const lo = bot < 0 ? bot - (top - bot) * 0.04 : 0;
  const range = (hi - lo) || 1;
  const pos = v => ((v - lo) / range) * 100;   /* % from the bottom of the screen */

  /* Price rules across the full bleed — this is the sheet, not a box. */
  const late = [];          /* drawn after the bars, so nothing paints over it */
  const step = niceStep(hi - lo);
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    const y = pos(v);
    const r = el('div', 'hrule' + (Math.abs(v) < 1e-9 ? ' axis' : ''));
    r.style.bottom = y + '%';
    g.appendChild(r);
    /* When the zero line carries a named tag, "$0" beside it is noise that
       also lands under the tag's own plate. */
    if (o.zeroTag && Math.abs(v) < 1e-9) continue;
    /* One figure per rule at each margin: whichever margin a plate happens to
       cover, the other survives the cull and the scale stays readable. */
    ['l', 'r'].forEach(side => {
      const lab = el('div', 'hlab ' + side, money(v));
      lab.style.bottom = y + '%';
      late.push([g, lab]);
    });
  }

  const plot = el('div', 'plot');
  g.appendChild(plot);

  /* Which side of the agreed target a month lands on, drawn as a field. */
  if (o.signZones && bot < 0) {
    const zu = el('div', 'zone up'); zu.style.bottom = pos(0) + '%'; zu.style.top = '0'; plot.appendChild(zu);
    const zd = el('div', 'zone dn'); zd.style.top = (100 - pos(0)) + '%'; zd.style.bottom = '0'; plot.appendChild(zd);
    const lu = el('div', 'zonelab up', o.zoneUp); lu.style.bottom = 'calc(' + pos(0) + '% + 18px)'; late.push([plot, lu]);
    const ld = el('div', 'zonelab dn', o.zoneDn); ld.style.top = 'calc(' + (100 - pos(0)) + '% + 18px)'; late.push([plot, ld]);
  }

  const n = values.length;
  /* A month label is set inside its bar, so on a narrow screen the column
     gutter closes up until the bar is wider than the word. */
  const gutter = compact() ? 0.4 : 1.2;         /* % of width between columns */
  const colW = 100 / n;
  for (let i = 1; i < n; i++) {
    const r = el('div', 'vrule');
    r.style.left = (i * colW) + '%';
    plot.appendChild(r);
  }

  /* A 16% fill is not a ground for paper type, so a label inside a soft bar
     is set in ink instead. */
  const onFill = /soft/.test(o.cls) || /soft/.test(o.negCls);
  const zeroY = pos(0);
  values.forEach((v, i) => {
    const y = pos(v);
    const bar = el('div', 'ybar ' + (v >= 0 ? o.cls : o.negCls));
    bar.style.left = (i * colW + gutter) + '%';
    bar.style.width = (colW - 2 * gutter) + '%';
    if (v >= 0) { bar.style.bottom = zeroY + '%'; bar.style.height = Math.max(y - zeroY, 0.35) + '%'; }
    else { bar.style.top = (100 - zeroY) + '%'; bar.style.height = Math.max(zeroY - y, 0.35) + '%'; }
    plot.appendChild(bar);

    const px = Math.abs(y - zeroY) / 100 * HH;
    const inside = px > 52;
    const mon = el('div', 'ymon ' + (inside ? 'inside' : 'outside') + (inside && onFill ? ' on-fill' : ''),
      inside && onFill ? '<i>' + MONTHS[i] + '</i>' : MONTHS[i]);
    mon.style.left = (i * colW) + '%';
    mon.style.width = colW + '%';
    if (v >= 0) mon.style[inside ? 'top' : 'bottom'] = inside ? (100 - y + 1.5) + '%' : (y + 1.2) + '%';
    else mon.style[inside ? 'bottom' : 'top'] = inside ? (y + 1.5) + '%' : (100 - y + 1.2) + '%';
    plot.appendChild(mon);

    if (o.showValues && !compact()) {
      const val = el('div', 'yval', money(v));
      val.style.left = (i * colW) + '%';
      val.style.width = colW + '%';
      if (v >= 0) val.style.bottom = (y + (inside ? 1.0 : 3.4)) + '%';
      else val.style.top = (100 - y + (inside ? 1.0 : 3.4)) + '%';
      plot.appendChild(val);
    }
  });

  if (bot < 0) {
    const z = el('div', 'zline'); z.style.bottom = zeroY + '%'; g.appendChild(z);
    if (o.zeroTag) {
      const t = el('div', 'ttag', o.zeroTag);
      t.style.bottom = zeroY + '%';
      t.style.left = (compact() ? 12 : o.tagX) + (compact() ? 'px' : '%');
      g.appendChild(t);
    }
  }

  o.lines.forEach(l => {
    const y = pos(l.v);
    const line = el('div', 'tline' + (l.dash ? ' dash' : ''));
    line.style.bottom = y + '%';
    g.appendChild(line);
    if (l.tag) {
      const t = el('div', 'ttag', l.tag);
      t.style.bottom = y + '%';
      t.style.left = (compact() ? 12 : o.tagX) + (compact() ? 'px' : '%');
      g.appendChild(t);
    }
  });
  late.forEach(([host_, n]) => host_.appendChild(n));
  cull(host);
}

/* A label drawn on the ground that a plate happens to cover is not quiet, it
   is invisible: hide it rather than leave dead type under an opaque surface.
   This is also what makes the contrast audit measurable — everything left
   standing is genuinely on screen. */
function cull(host) {
  requestAnimationFrame(() => {
    host.querySelectorAll('.ymon,.yval,.hlab,.ttag,.zonelab,.slablab,.partylab,.g-obj,.rlab,.watertag,.ticklab')
      .forEach(n => {
        n.style.visibility = '';
        const r = n.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const pts = [[r.left + r.width / 2, r.top + r.height / 2],
                     [r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2],
                     [r.left + 2, r.bottom - 2], [r.right - 2, r.top + 2]];
        const hidden = pts.some(([x, y]) =>
          x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight ||
          document.elementsFromPoint(x, y).some(e =>
            e !== n && e.classList && (
              e.classList.contains('plate') || e.classList.contains('chip') ||
              e.classList.contains('choice') || e.classList.contains('vplate') ||
              e.classList.contains('pc-pager') ||
              /* The chips drawn on the ground are opaque too, so a month
                 label half-buried under a zone tag is just as lost as one
                 under a plate. Each chip is exempt from itself. */
              e.classList.contains('zonelab') || e.classList.contains('ttag') ||
              e.classList.contains('watertag') || e.classList.contains('hlab'))));
        if (hidden) n.style.visibility = 'hidden';
      });
  });
}

/* ═══ GROUND B · the home, cut through, edge to edge ══════════════════ */

function groundHome(host, h, stopIdx, mini) {
  host.innerHTML = '';
  const g = el('div', 'g-home');
  host.appendChild(g);
  const R = h.home;

  /* Above */
  if (R.top.type === 'slab') {
    const s = el('div', 'slab top'); s.style.height = R.top.h + '%'; g.appendChild(s);
  } else {
    const r = el('div', 'roof' + (R.top.type === 'solar' ? ' solar' : ''));
    r.style.height = R.top.h + '%';
    r.style.clipPath = 'polygon(0 100%, 20% 0, 80% 0, 100% 100%)';
    g.appendChild(r);
    const rl = el('div', 'roofline'); rl.style.top = R.top.h + '%'; g.appendChild(rl);
  }
  /* Below */
  const b = el('div', 'slab bot'); b.style.height = R.bot.h + '%'; g.appendChild(b);
  /* Sides */
  if (R.side.w) {
    ['l','r'].forEach(side => {
      const p = el('div', 'party ' + side);
      p.style.width = R.side.w + '%';
      p.style.top = R.top.h + '%';
      p.style.bottom = R.bot.h + '%';
      g.appendChild(p);
      if (!mini) {
        const lab = el('div', 'partylab', R.side.label);
        lab.style[side === 'l' ? 'left' : 'right'] = 'calc(' + (R.side.w / 2) + '% - 7px)';
        lab.style.top = '76%';
        g.appendChild(lab);
      }
    });
  }
  /* Interior */
  const inn = el('div', 'interior');
  inn.style.top = R.top.h + '%';
  inn.style.bottom = R.bot.h + '%';
  inn.style.left = R.side.w + '%';
  inn.style.right = R.side.w + '%';
  g.appendChild(inn);

  /* Structural labels, set centred so they clear the corner chrome. */
  if (!mini) {
    const t = el('div', 'slablab', R.top.label);
    t.style.left = '50%'; t.style.top = '14px'; t.style.transform = 'translateX(-50%)';
    g.appendChild(t);
    const bl = el('div', 'slablab', R.bot.label);
    bl.style.left = '50%'; bl.style.bottom = '16px'; bl.style.transform = 'translateX(-50%)';
    g.appendChild(bl);
  }

  /* Objects */
  const narrow = compact();
  /* Narrow, the home is read through a gap between stacked plates, so only
     three objects are drawn and they are placed into that gap below. */
  const objs = narrow
    ? (mini ? R.objs.filter(o => o.at > 0) : R.objs).slice(0, 3)
    : R.objs;
  objs.forEach((ob, i) => {
    const assigned = ob.at > 0 && stopIdx >= ob.at;
    const o = el('div', 'g-obj' + (mini ? ' mini' : '') +
      (assigned ? ' assigned' : '') + (ob.ghost ? ' ghost' : '') + (ob.at < 0 && !ob.ghost ? ' locked' : ''));
    if (mini && narrow) {
      o.style.left = [22, 50, 78][i] + '%'; o.style.top = '80%';
    } else if (mini) {
      const mx = [26, 50, 74, 36, 64][i], my = [56, 56, 56, 78, 78][i];
      o.style.left = mx + '%'; o.style.top = my + '%';
    } else if (narrow) {
      o.style.left = [20, 50, 80][i] + '%'; o.style.top = '70%';
    } else {
      o.style.left = ob.x + '%'; o.style.top = ob.y + '%';
    }
    const gl = el('div', 'glyph');
    gl.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true">' + GLYPH[ob.g] + '</svg>';
    o.appendChild(gl);
    const chip = el('div', 'chip-lab');
    chip.appendChild(el('span', 'n', ob.n));
    if (!mini) chip.appendChild(el('span', 's', assigned ? 'assigned to the carrier' : ob.s));
    o.appendChild(chip);
    g.appendChild(o);
  });
  if (narrow && !mini) {
    /* The gap is wherever the stacked plates leave the ground showing: find
       the spacer that holds it open and sit the row in the middle of it. */
    requestAnimationFrame(() => {
      const sc = host.closest('.screen');
      const sp = sc && sc.querySelector('.layer > .spacer');
      let yPct = 70;
      if (sp) {
        const r = sp.getBoundingClientRect();
        if (r.height > 60) yPct = ((r.top + r.height / 2) / window.innerHeight) * 100;
      }
      g.querySelectorAll('.g-obj').forEach(n => { n.style.top = yPct + '%'; });
      cull(host);
    });
  } else {
    cull(host);
  }
}

/* ═══ GROUND C · the wall the price climbs ════════════════════════════ */

function groundWall(host, mult) {
  host.innerHTML = '';
  const g = el('div', 'g-wall');
  host.appendChild(g);
  const p = pool(mult);
  const cost = Math.max(p.settleTotal, 0);
  const HH = host.clientHeight || 900;

  const rungs = [
    { n: 'Flexibility revenue, net of hardware finance', cap: p.fundsTotal,
      note: 'Earned every year by trading 412,000 homes — spent before any capital is touched' },
    { n: 'Captive surplus, the retention', cap: POOL.retention,
      note: 'The programme’s own money, and the first thing a rating agency looks at' },
    { n: 'Reinsurance, ' + mil(POOL.reinsurance) + ' excess of ' + mil(POOL.retention), cap: POOL.reinsurance,
      note: 'One annual aggregate limit across the whole book, not per home' }
  ];

  const totalCap = rungs.reduce((a, r) => a + r.cap, 0);
  const TOWER_SHARE = 84;                       /* % of the screen the tower takes */
  let remaining = cost, floorPct = 0, waterPct = null;

  rungs.forEach(r => {
    const share = (r.cap / totalCap) * TOWER_SHARE;
    const used = Math.min(remaining, r.cap);
    remaining -= used;
    const box = el('div', 'rung' + (used >= r.cap - 1 ? ' full' : ''));
    box.style.flex = '0 0 ' + share + '%';
    const fl = el('div', 'flood');
    fl.style.height = ((used / r.cap) * 100).toFixed(2) + '%';
    box.appendChild(fl);
    const lab = el('div', 'rlab');
    lab.appendChild(el('span', 'ln', r.n));
    lab.appendChild(el('span', 'lv num', mil(used) + ' of ' + mil(r.cap)));
    if (share / 100 * HH > 118) lab.appendChild(el('span', 'note', r.note));
    box.appendChild(lab);
    g.appendChild(box);
    if (waterPct === null && used < r.cap) waterPct = floorPct + (used / r.cap) * share;
    floorPct += share;
  });

  const overRung = el('div', 'rung over' + (remaining > 0 ? ' full' : ''));
  overRung.style.flex = '0 0 ' + (100 - TOWER_SHARE) + '%';
  const ol = el('div', 'rlab');
  ol.appendChild(el('span', 'ln', 'Above the tower'));
  ol.appendChild(el('span', 'lv num', remaining > 0 ? mil(remaining) + ' unfunded' : 'nothing'));
  ol.appendChild(el('span', 'note', remaining > 0
    ? 'The warranty pays pro rata, so the homes that needed it most receive part of the promise'
    : 'The promise is payable in full at this price level'));
  overRung.appendChild(ol);
  g.appendChild(overRung);
  if (waterPct === null) waterPct = TOWER_SHARE;

  /* Capital is linear in height across the whole tower, so the tower carries
     one scale in its own gutter — outside the flood, which is a fill and
     therefore never a ground for type. */
  g.appendChild(el('div', 'wallaxis'));
  const tickStep = 50e6;
  for (let v = tickStep; v <= totalCap; v += tickStep) {
    const y = (v / totalCap) * TOWER_SHARE;
    const t = el('div', 'tick'); t.style.bottom = y + '%'; g.appendChild(t);
    const lb = el('div', 'ticklab', '$' + Math.round(v / 1e6) + 'm'); lb.style.bottom = y + '%'; g.appendChild(lb);
  }

  const w = el('div', 'waterline'); w.style.bottom = waterPct + '%'; g.appendChild(w);
  const tag = el('div', 'watertag', mil(cost) + ' settlement cost · ' + pctUp(mult));
  tag.style.bottom = waterPct + '%';
  g.appendChild(tag);
  cull(host);
  return { cost, remaining, capacity: p.capacity };
}

/* ── Shared small components ─────────────────────────────────────────── */

function figure(k, v, n, mark) {
  const f = el('div', 'fig' + (mark ? ' mark-' + mark : ''));
  f.appendChild(el('span', 'k', k));
  f.appendChild(el('span', 'v num' + (String(v).length > 8 ? ' sm' : ''), v));
  if (n) f.appendChild(el('span', 'n', n));
  return f;
}

function segButtons(host, items, current, onPick) {
  host.innerHTML = '';
  items.forEach(it => {
    const b = el('button', 'seg', it.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(it.value === current));
    b.addEventListener('click', () => onPick(it.value));
    host.appendChild(b);
  });
}

/* ═══ Screen 1 · the cover ════════════════════════════════════════════ */

function render1() {
  const h = HOUSEHOLDS[SPINE], q = quote(h, h.stops.length - 1);
  groundYear($('g1'), bills(h, 'central'), {
    lines: [{ v: q.target / 12, tag: 'one agreed number' }], tagX: 40
  });
  $('s1Cap').textContent =
    'Rosa’s twelve months of a market, and the one line she is sold.';
}

/* ═══ Screen 2 · the household we follow ══════════════════════════════ */

let tapeTimer = null, tapeAt = 0;

function render2() {
  const h = HOUSEHOLDS[SPINE];
  groundHome($('g2'), h, -1, false);
  personRow($('s2Person'), h, 'm');

  const bl = $('s2Bounds');
  bl.innerHTML = '';
  h.bounds.forEach(t => {
    const li = el('li');
    li.appendChild(el('span', 'mk', '·'));
    li.appendChild(el('span', null, t));
    bl.appendChild(li);
  });
  paintTape();

  const net = sum(h.tape.map(r => r[2]));
  $('s2Cap').innerHTML = 'A projected day. It nets <b>' + moneyC(net) +
    '</b> — the ' + money(h.stops[h.stops.length - 1].f) + ' a year, in full.';
}

function paintTape() {
  const h = HOUSEHOLDS[SPINE], T = h.tape;
  const host = $('s2Tape');
  host.innerHTML = '';
  for (let i = 0; i < T.length; i++) {
    const row = T[(tapeAt + i) % T.length];
    const li = el('li', i === 0 ? 'fresh' : '');
    li.appendChild(el('span', 't', row[0]));
    li.appendChild(el('span', 'a', row[1]));
    li.appendChild(el('span', 'm ' + (row[2] > 0 ? 'in' : row[2] < 0 ? 'out' : 'nil'),
      row[2] === 0 ? '—' : moneyC(row[2])));
    host.appendChild(li);
  }
}

function tapeRunning(on) {
  const btn = $('tapeToggle');
  if (tapeTimer) { clearInterval(tapeTimer); tapeTimer = null; }
  if (on) {
    tapeTimer = setInterval(() => {
      tapeAt = (tapeAt + 1) % HOUSEHOLDS[SPINE].tape.length;
      if (state.page === 2) paintTape();
    }, 3200);
  }
  btn.textContent = on ? 'Pause' : 'Resume';
  btn.setAttribute('aria-pressed', String(!on));
}

/* ═══ Screen 3 · three households, three homes ════════════════════════ */

function render3() {
  const host = $('s3Cols');
  host.innerHTML = '';
  H_ORDER.forEach(k => {
    const h = HOUSEHOLDS[k];
    const q = quote(h, h.stops.length - 1);
    const lo = sum(bills(h, 'calm')), hi = sum(bills(h, 'shock'));

    const col = el('div', 'ccol');
    /* The drawn cut-through is the column's ground on a wide screen. On a
       phone the choice card fills its column edge to edge, so the drawing
       would be rendered only to be covered: the portrait carries the
       identity there instead. */
    if (!compact()) {
      const ground = el('div');
      ground.style.cssText = 'position:absolute;inset:0';
      col.appendChild(ground);
      groundHome(ground, h, h.stops.length - 1, true);
    }

    const b = el('button', 'choice');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(k === state.household));
    b.appendChild(el('p', 'eyebrow', h.assets));
    b.appendChild(el('div', 'choice-head',
      faceTag(h, 'm') + '<div><h3>' + h.name + '</h3>' +
      '<p class="place">' + h.place + '</p></div>'));
    b.appendChild(el('p', 'line', h.line));
    const dl = el('dl');
    [['Cost range', money(lo) + ' – ' + money(hi)],
     ['Assignable', money(q.flexGross) + ' a year'],
     ['Target', q.target >= 0 ? money(q.target) : money(Math.abs(q.target)) + ' to them']
    ].forEach(([a, c]) => { dl.appendChild(el('dt', null, a)); dl.appendChild(el('dd', null, c)); });
    b.appendChild(dl);
    if (k === SPINE) b.appendChild(el('span', 'spine', 'The one we follow'));
    const ch = el('span', 'chosen');
    ch.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Chosen';
    b.appendChild(ch);
    b.addEventListener('click', () => { state.household = k; render(); });
    col.appendChild(b);
    host.appendChild(col);
  });
}

/* ═══ Screen 4 · the counterfactual ═══════════════════════════════════ */

function render4() {
  const h = H();
  segButtons($('scenarioSet4'),
    SCEN_ORDER.map(s => ({ label: SCENARIOS[s].name, value: s })),
    state.scenario, v => { state.scenario = v; render(); });

  groundYear($('g4'), bills(h, state.scenario), { tagX: 40 });

  const totals = SCEN_ORDER.map(s => ({ s, v: sum(bills(h, s)) }));
  const row = $('s4Totals');
  row.innerHTML = '';
  totals.forEach(t => row.appendChild(figure(
    SCENARIOS[t.s].name, money(t.v),
    t.s === state.scenario ? 'the year on screen' : '',
    t.s === state.scenario ? 'market' : null)));

  $('s4Cap').textContent = 'Calm to shock is ' + money(totals[2].v - totals[0].v) +
    ' apart for identical energy, and ' + h.first + ' finds out which year it was as it goes along.';
}

/* ═══ Screen 5 · the trade ════════════════════════════════════════════ */

function render5() {
  const h = H();
  const slider = $('assignSlider');
  slider.max = String(h.stops.length - 1);
  slider.value = String(Math.min(state.assign[h.key], h.stops.length - 1));
  const stopIdx = Number(slider.value);
  const q = Q();

  groundHome($('g5'), h, stopIdx, false);
  personRow($('s5Person'), h, 's');

  $('assignLabel').innerHTML =
    '<strong>' + q.stop.label + '</strong> · earns ' + money(q.flexGross) + ' a year';

  $('s5Target').textContent = q.target >= 0 ? money(q.target) : money(Math.abs(q.target)) + ' to you';
  $('s5Versus').textContent = q.target >= 0
    ? (q.target > q.E
        ? money(q.target - q.E) + ' above the ' + money(q.E) + ' assumed expected cost.'
        : money(q.E - q.target) + ' below the ' + money(q.E) + ' assumed expected cost.')
    : 'Flexibility worth more than the certainty costs, so the carrier pays.';

  const led = $('s5Ledger');
  led.innerHTML = '';
  const rows = [
    ['Assumed expected cost<span class="why">Central 2036 index</span>', money(q.E), ''],
    ['Risk load, 8%', '+ ' + money(q.load), 'charge'],
    ['Flexibility revenue', money(q.flexGross), ''],
    ['Aggregation margin, 25%<span class="why">The carrier’s cut</span>', '− ' + money(q.aggFee), 'charge']
  ];
  if (h.assetFinance) rows.push(['Hardware finance', '− ' + money(h.assetFinance), 'charge']);
  rows.push(['Returned to the household', (q.credit >= 0 ? '− ' : '+ ') + money(Math.abs(q.credit)), q.credit >= 0 ? 'credit' : 'charge']);
  rows.push(['Annual net cost target', q.target >= 0 ? money(q.target) : '−' + money(Math.abs(q.target)), 'total']);
  rows.forEach(([a, b, cls]) => {
    const r = el('div', 'row ' + cls);
    r.appendChild(el('div', null, a));
    r.appendChild(el('div', 'num', b));
    led.appendChild(r);
  });

  const gl = $('s5Gives');
  gl.innerHTML = '';
  const always = ['The upside in a calm year', 'A year, or settle at market', 'Half-hourly meter, appliance by appliance'];
  const items = always.map(t => ({ text: t, on: true }))
    .concat(h.gives.map(g => ({ text: g.text, on: stopIdx >= g.from })));
  items.forEach(it => {
    const li = el('li', it.on ? 'on' : 'off');
    li.appendChild(el('span', 'mk', it.on ? '×' : '·'));
    li.appendChild(el('span', null, it.text));
    gl.appendChild(li);
  });
  const li = el('li', 'off');
  li.appendChild(el('span', 'mk', '·'));
  li.appendChild(el('span', null, '<b>' + h.limit + '</b>'));
  gl.appendChild(li);
}

/* ═══ Screen 6 · the months you lose ══════════════════════════════════ */

function render6() {
  const h = H(), q = Q();
  segButtons($('scenarioSet6'),
    SCEN_ORDER.map(s => ({ label: SCENARIOS[s].name, value: s })),
    state.scenario, v => { state.scenario = v; render(); });

  $('s6Lead').textContent = 'Every month settles against the flat annual target, so a mild month is one ' +
    h.first + ' hands money back for certainty she did not end up needing.'
      .replace(' she ', ' ' + SHE(h) + ' ');

  const b = bills(h, state.scenario);
  const mt = q.target / 12;
  const diff = b.map(v => v - mt);           /* > 0 → the carrier refunds */

  /* Above the target is drawn in the gain hue, below it in the market hue —
     and both directions also carry a sign and a word in the legend, so the
     chart survives greyscale and a colour-blind reader. */
  groundYear($('g6'), diff, {
    cls: 'softgain', negCls: 'soft', showValues: false, tagX: 40,
    signZones: true, zeroTag: 'the agreed target',
    zoneUp: 'above target · the carrier refunds',
    zoneDn: 'below target · the household pays in'
  });

  const leg = $('s6Legend');
  leg.innerHTML = '';
  [['+ above target — the carrier refunds the difference', 'var(--gain)'],
   ['− below target — the household pays the difference in', 'var(--market)']
  ].forEach(([t, c]) => {
    const s = el('span');
    const i = el('i'); i.style.background = c; s.appendChild(i);
    s.appendChild(el('span', null, t));
    leg.appendChild(s);
  });

  const billTotal = sum(b);
  const settlement = q.target - billTotal;   /* < 0 → the carrier pays */
  const won = diff.filter(d => d > 0).length;
  const row = $('s6Totals');
  row.innerHTML = '';
  row.appendChild(figure('Supplier bills', money(billTotal), 'paid month by month', 'market'));
  row.appendChild(figure('Annual net cost', q.target >= 0 ? money(q.target) : '−' + money(Math.abs(q.target)), 'agreed in advance', 'ink'));
  row.appendChild(figure('Settlement', (settlement >= 0 ? 'pays ' : 'receives ') + money(Math.abs(settlement)),
    won + ' of 12 months in their favour', settlement >= 0 ? 'market' : 'gain'));

  let verdict;
  if (settlement >= 0) {
    verdict = h.first + ' hands back ' + money(settlement) + ' for protection ' + SHE(h) +
      ' did not need, and that is the product working as sold rather than failing.';
  } else if (won === 12) {
    verdict = 'Every month clears a target below zero, so this home is paid all year — which is why screen 11 tells it to walk away.';
  } else {
    verdict = h.first + ' is ' + money(Math.abs(settlement)) + ' better off, and the ' +
      (12 - won) + ' months still paid in are the ones to forget.';
  }
  $('s6Cap').textContent = verdict;
}

/* ═══ Screen 7 · not budget billing ═══════════════════════════════════ */

function render7() {
  const h = H(), q = Q();
  segButtons($('scenarioSet7'),
    SCEN_ORDER.map(s => ({ label: SCENARIOS[s].name, value: s })),
    state.scenario, v => { state.scenario = v; render(); });

  const b = bills(h, state.scenario);
  const variable = sum(b);
  const levelMonthly = q.E / 12;             /* last year's usage and price */
  const trueUp = variable - q.E;
  const certMonthly = q.target / 12;

  const rows = [
    { host: 's7a', name: 'Variable tariff', tot: variable, sub: 'what the market charged, month by month',
      series: b, cls: 'var(--market)' },
    { host: 's7b', name: 'Budget billing', tot: variable, sub: 'twelve level payments, then a true-up that passes the whole rise through',
      series: new Array(12).fill(levelMonthly).concat([trueUp]), cls: 'var(--smooth)', trueUp: true },
    { host: 's7c', name: 'Price Certainty', tot: q.target, sub: 'one agreed annual net cost, settled both ways',
      series: new Array(12).fill(certMonthly), cls: 'var(--ink)' }
  ];

  const peak = Math.max(...b.map(Math.abs), levelMonthly, Math.abs(trueUp), Math.abs(certMonthly));
  rows.forEach(r => {
    const host = $(r.host);
    host.innerHTML = '';
    const who = el('div', 'who');
    who.appendChild(el('p', 'eyebrow', r.name));
    who.appendChild(el('div', 'tot', r.tot >= 0 ? money(r.tot) : '−' + money(Math.abs(r.tot))));
    who.appendChild(el('div', 'sub', r.sub));
    host.appendChild(who);
    const mini = el('div', 'mini');
    r.series.forEach((v, i) => {
      const bar = el('i');
      bar.style.height = Math.max((Math.abs(v) / peak) * 100, 1.5) + '%';
      if (r.trueUp && i === 12) { bar.className = 'trueup'; bar.style.background = 'var(--market)'; }
      else bar.style.background = r.cls;
      mini.appendChild(bar);
    });
    host.appendChild(mini);
  });

  const gap = variable - q.target;
  $('s7Cap').textContent =
    'Budget billing and the variable tariff come to exactly the same ' + money(variable) +
    ' because smoothing moves the timing and nothing else, while the agreed target lands ' +
    money(Math.abs(gap)) + (gap >= 0 ? ' below both.' : ' above both — the year the household pays for certainty.');
}

/* ═══ Screen 8 · the bill still arrives first ═════════════════════════ */

function render8() {
  const h = H(), q = Q();
  segButtons($('settleSet'), [
    { label: 'Annual settlement — the 2026 draft', value: 'annual' },
    { label: 'Continuous settlement — the 2036 build', value: 'weekly' }
  ], state.settleMode, v => { state.settleMode = v; render(); });

  const b = bills(h, 'shock');
  const mt = q.target / 12;
  const worst = Math.max(...b);

  /* The cash-timing argument belongs to the spine household; switching away
     from Rosa must not transfer a claim that is only true of her. */
  const floatClause = h.key === SPINE
    ? ', and ' + SHE(h) + ' is the household least able to float it. '
    : ' — and the household least able to float it is Rosa. ';
  $('s8Lead').innerHTML = 'A <span class="inl">' + money(worst) + '</span> February against a <span class="inl">' +
    money(mt) + '</span> monthly target has to be found before any settlement reaches ' + h.first +
    floatClause +
    'Continuous settlement is what 2036 fixes: the carrier settles weekly, so the float never outgrows a few days.';

  let float_;
  if (state.settleMode === 'annual') {
    let run = 0;
    float_ = b.map(v => { run += v - mt; return Math.max(run, 0); });
  } else {
    float_ = b.map(v => Math.max(v - mt, 0) * (7 / 30));
  }
  groundYear($('g8'), float_, { cls: 'soft', tagX: 40 });

  const fig = $('s8Figures');
  fig.innerHTML = '';
  fig.appendChild(figure('Worst single month', money(worst), 'a shock-year February', 'market'));
  fig.appendChild(figure('Peak float', money(Math.max(...float_)),
    state.settleMode === 'annual' ? 'money ' + SHE(h) + ' must find ' + HERSELF(h) : 'never more than a few days', 'market'));
  fig.appendChild(figure('Monthly target', money(mt), 'what ' + SHE(h) + ' agreed to pay', 'ink'));

  const fl = $('s8Fail');
  fl.innerHTML = '';
  ['Issuer fails mid-year — an unsecured claim on a captive, not a deposit',
   h.first + ' moves — the term settles to date, hardware balance due',
   'Taxes, network charges and usage above the agreed quantity were never inside',
   'A winter ' + SHE(h) + ' cannot flex in earns the carrier nothing'
  ].forEach(t => {
    const li = el('li', 'on');
    li.appendChild(el('span', 'mk', '×'));
    li.appendChild(el('span', null, t));
    fl.appendChild(li);
  });
}

/* ═══ Screen 9 · where the swing lands ════════════════════════════════ */

function render9() {
  const slider = $('shockSlider');
  slider.value = String(state.shock);
  const mult = state.shock / 100;
  $('shockLabel').innerHTML = '<strong>' + pctUp(mult) + '</strong> against the central year';

  const r = groundWall($('g9'), mult);
  const payable = r.remaining > 0 ? r.capacity / r.cost : 1;

  const fig = $('s9Figures');
  fig.innerHTML = '';
  fig.appendChild(figure('Prices vs central', pctUp(mult), 'across the whole book, a full year', 'market'));
  fig.appendChild(figure('Net settlement cost', mil(r.cost), 'two-way, all 412,000 homes', 'market'));
  fig.appendChild(figure('Promise payable', Math.round(payable * 100) + '%',
    r.remaining > 0 ? 'pro rata — the failure mode, named' : 'in full', payable < 1 ? 'market' : 'gain'));

  const be = $('s9Breakevens');
  be.innerHTML = '';
  H_ORDER.forEach(k => {
    const h = HOUSEHOLDS[k], q = quote(h, h.stops.length - 1);
    const m = (q.flexGross - h.assetFinance + q.target) / q.E;
    const row = el('div', 'be' + (mult >= m ? ' hit' : ''));
    row.appendChild(el('span', 'who', faceTag(h, 'xs') + '<span>' + h.name +
      ' <em>· ' + Math.round(POOL.weights[k] * 100) + '% of the book</em></span>'));
    row.appendChild(el('b', 'num', pctUp(m)));
    be.appendChild(row);
  });
  const mBook = multFor(pool(1).fundsTotal);
  const rowB = el('div', 'be' + (mult >= mBook ? ' hit' : ''));
  rowB.appendChild(el('span', 'who', '<b>The book as a whole</b>'));
  rowB.appendChild(el('b', 'num', pctUp(mBook)));
  be.appendChild(rowB);
}

/* ═══ Screen 10 · the wrapper ═════════════════════════════════════════ */

const STRUCTURES = {
  settlement: {
    name: 'Settlement only',
    chain: [
      ['Household', 'not an eligible contract participant'],
      ['Managing general agent', 'licensed producer'],
      ['Warranty issuer', 'captive, holds the promise'],
      ['Reinsurance panel', 'annual aggregate limit'],
      ['Supplier', 'outside the structure entirely']
    ],
    grid: [
      ['Legal theory', 'A parametric warranty on a published price index, paid without a claim', false],
      ['US obstacle', 'Cash-settled, bilateral, off-exchange, household counterparty — the barred shape', true],
      ['UK and EU', 'A retail contract for difference: authorisation and appropriateness testing', true],
      ['Untested', 'Whether a warranty wrapper survives the swap analysis', true]
    ]
  },
  coupled: {
    name: 'Supply-coupled',
    chain: [
      ['Household', 'buys certainty, assigns flexibility'],
      ['Managing general agent', 'producer and dispatch operator'],
      ['Licensed supply affiliate', 'delivers what it dispatches'],
      ['Warranty issuer', 'captive, holds the promise'],
      ['Reinsurance panel', 'annual aggregate limit']
    ],
    grid: [
      ['Legal theory', 'The warranty attaches to supply: the carrier delivers the energy it dispatches', false],
      ['Why that matters', 'Delivery, personal consumption, merchant, service area — what a carve-out turns on', false],
      ['Household gives up', 'Part of the keep-your-supplier premise — those kilowatt-hours are the carrier’s', true],
      ['Untested', 'No regulator has ruled on a settlement riding on a partial delivery leg', true]
    ]
  }
};

function render10() {
  segButtons($('structureSet'),
    [{ label: 'Settlement only', value: 'settlement' },
     { label: 'Supply-coupled', value: 'coupled' }],
    state.structure, v => { state.structure = v; render(); });

  const s = STRUCTURES[state.structure];
  const chain = $('s10Chain');
  chain.innerHTML = '';
  s.chain.forEach((c, i) => {
    const n = el('div', 'node');
    n.appendChild(el('span', 'step', String(i + 1)));
    const body = el('div', 'body');
    body.appendChild(el('span', 'r', c[0]));
    body.appendChild(el('span', null, c[1]));
    n.appendChild(body);
    chain.appendChild(n);
    if (i < s.chain.length - 1) {
      chain.appendChild(el('div', 'arr',
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'));
    }
  });

  const grid = $('s10Grid');
  grid.innerHTML = '';
  s.grid.forEach(([k, v, warn]) => {
    const d = el('div', warn ? 'warn' : '');
    d.appendChild(el('dt', null, k));
    d.appendChild(el('dd', null, v));
    grid.appendChild(d);
  });
}

/* ═══ Screen 11 · the closing ═════════════════════════════════════════ */

const VERDICTS = {
  h1: { who: 'financial', tag: 'Only the financial route exists',
        line: 'No roof, no wall, no consent, no capital. The thinnest cover, for the one household this is really for.' },
  h2: { who: 'hardware', tag: 'Hardware wins, financed',
        line: 'The promise is what makes the battery financeable, not the reverse.' },
  h3: { who: 'neither', tag: 'It should not buy this',
        line: 'Already has the assets. Stays in for the tail, and its margin funds everyone else.' }
};

function render11() {
  const host = $('s11Cols');
  host.innerHTML = '';
  H_ORDER.forEach(k => {
    const h = HOUSEHOLDS[k], v = VERDICTS[k];
    const q = quote(h, h.stops.length - 1);
    const col = el('div', 'vcol' + (k === state.household ? ' sel' : ''));
    if (!compact()) {
      const ground = el('div');
      ground.style.cssText = 'position:absolute;inset:0';
      col.appendChild(ground);
      groundHome(ground, h, h.stops.length - 1, true);
    }
    const pl = el('div', 'vplate');
    pl.appendChild(el('span', 'who-wins ' + v.who, v.tag));
    pl.appendChild(el('div', 'choice-head',
      faceTag(h, 'm') + '<div><h3>' + h.name + '</h3></div>'));
    pl.appendChild(el('p', 'why', v.line));
    pl.appendChild(el('p', 'tnum',
      (q.target >= 0 ? 'Target ' + money(q.target) : 'Paid ' + money(Math.abs(q.target))) +
      ' · expected ' + money(q.E)));
    col.appendChild(pl);
    host.appendChild(col);
  });

  const p = pool(1);
  const mBook = multFor(p.fundsTotal);
  const mGone = multFor(p.capacity);
  const fig = $('s11Figures');
  fig.innerHTML = '';
  fig.appendChild(figure('Homes in the pool', POOL.homes.toLocaleString('en-US'), 'invented', 'ink'));
  fig.appendChild(figure('Like Rosa', Math.round(POOL.weights.h1 * 100) + '%', 'loss-making majority', 'market'));
  fig.appendChild(figure('Flexibility revenue', mil(p.fundsTotal), 'a year, net', 'gain'));
  fig.appendChild(figure('Settlement cost', mil(p.settleTotal), 'central year', 'market'));
  fig.appendChild(figure('Margin gone at', pctUp(mBook), 'above central', 'market'));
  fig.appendChild(figure('Tower gone at', pctUp(mGone), 'then pro rata', 'market'));

  const c = $('s11Conditions');
  c.innerHTML = '';
  ['A regulator accepts the delivery leg',
   'A tower deeper than ' + pctUp(mGone) + ', which ends this one',
   'Asset-rich homes stay in a pool that underpays them'
  ].forEach(t => c.appendChild(el('li', null, t)));
}

/* ═══ Phone · the screen turns instead of scrolling ═══════════════════ */
/* The shell does not scroll — html and body are overflow:hidden so a
   full-bleed ground can stay full-bleed — so on a 390 px phone anything
   that did not fit was sliced off the bottom edge without a sound. An
   inner scroller is not a fix either: a line below the fold is still a
   line the reader has not been shown.

   So a narrow screen is divided into parts that each fit the viewport
   whole, turned by a control that says how many parts there are. This
   measures the real layout rather than guessing at breakpoints, so it
   holds at any phone size and survives the copy changing.               */

const pcPart = {};                    /* screen number → the part on show */

const pcHost  = s => s.querySelector('.bands') || s.querySelector('.layer');
const pcDrawn = s => s.querySelector('.ground > .g-year, .ground > .g-home, .ground > .g-wall');

/* Boxes meant to hold a slice of a screen rather than all of it: a plate or
   a band prints just as well around two of its children as around six.
   Anything else is broken open only when it is too tall to fit. */
const PC_SPLIT = '.plate, .band, .band-split';

function pcAtoms(host, budget) {
  const out = [];
  const walk = node => {
    const kids = [...node.children].filter(k =>
      !k.classList.contains('spacer') && !k.classList.contains('pc-pager'));
    const tall = node.getBoundingClientRect().height > budget;
    if (!kids.length || (node !== host && !node.matches(PC_SPLIT) && !tall)) { out.push(node); return; }
    kids.forEach(walk);
  };
  walk(host);
  return out;
}

/* A label with nothing under it is not a part: an eyebrow or a heading is
   glued to whatever follows it. */
function pcUnits(atoms, useGroups) {
  const units = [];
  let cur = [];
  atoms.forEach((a, i) => {
    cur.push(a);
    if (!(a.matches('.eyebrow, h2, h3, .person-row') && i < atoms.length - 1)) { units.push(cur); cur = []; }
  });
  if (cur.length) units.push(cur);
  if (!useGroups) return units;
  /* Some blocks are only an argument together — the three arrangements on
     screen 7 are a comparison, and a comparison split over two parts is
     not one. data-pc-group holds them on the same part while they fit. */
  const grp = u => {
    const g = u[0].closest('[data-pc-group]');
    return g ? g.dataset.pcGroup : null;
  };
  const merged = [];
  units.forEach(u => {
    const g = grp(u);
    const last = merged[merged.length - 1];
    if (g && last && grp(last) === g) last.push(...u); else merged.push(u);
  });
  return merged;
}

function pcClear(screen) {
  screen.querySelectorAll('[data-pc-part],[data-pc-box],[data-pc-first]').forEach(n => {
    n.style.display = '';
    delete n.dataset.pcPart;
    delete n.dataset.pcBox;
    delete n.dataset.pcFirst;
  });
}

/* Fill each part until the next unit would overflow the viewport, then
   start another. Measured, not estimated. */
function pcPack(screen, host, budget, drawn, useGroups) {
  pcClear(screen);
  const units = pcUnits(pcAtoms(host, budget), useGroups);
  const flat = units.flat();
  flat.forEach(a => { a.style.display = 'none'; });
  const over = () => host.scrollHeight > host.clientHeight + 1;

  /* On a screen staged over a drawing, the opening part carries the
     eyebrow and the headline and the ground keeps the rest of the sheet —
     which is the only way a phone sees the picture at all. */
  let brk = -1;
  if (drawn) {
    brk = units.findIndex(u => u.some(a => a.matches('h2')));
    if (brk < 0) brk = 0;
  }

  let part = 1, open = [];
  units.forEach((u, ui) => {
    u.forEach(a => { a.style.display = ''; });
    if (open.length && over()) {
      u.forEach(a => { a.style.display = 'none'; });
      open.forEach(a => { a.dataset.pcPart = part; a.style.display = 'none'; });
      part++; open = [];
      u.forEach(a => { a.style.display = ''; });
    }
    open.push(...u);
    if (ui === brk) {
      open.forEach(a => { a.dataset.pcPart = part; a.style.display = 'none'; });
      part++; open = [];
    }
  });
  open.forEach(a => { a.dataset.pcPart = part; });
  return open.length ? part : Math.max(part - 1, 1);
}

function pcApply(screen, host, n) {
  const atoms = [...screen.querySelectorAll('[data-pc-part]')];
  atoms.forEach(a => { a.style.display = (Number(a.dataset.pcPart) === n ? '' : 'none'); });
  /* A box whose whole contents belong to another part would otherwise
     print as an empty rule of paper. */
  const boxes = new Set();
  atoms.forEach(a => { for (let p = a.parentElement; p && p !== host; p = p.parentElement) boxes.add(p); });
  boxes.forEach(b => {
    b.dataset.pcBox = '1';
    b.style.display = atoms.some(a => Number(a.dataset.pcPart) === n && b.contains(a)) ? '' : 'none';
  });
  /* Whatever now opens a box loses the rule it used to be separated by. */
  atoms.forEach(a => { delete a.dataset.pcFirst; });
  new Set(atoms.filter(a => Number(a.dataset.pcPart) === n).map(a => a.parentElement))
    .forEach(p => {
      const first = [...p.children].find(k => atoms.includes(k) && Number(k.dataset.pcPart) === n);
      if (first) first.dataset.pcFirst = '1';
    });
}

function pcWorst(screen, host, parts) {
  let worst = 0;
  for (let i = 1; i <= parts; i++) {
    pcApply(screen, host, i);
    worst = Math.max(worst, host.scrollHeight - host.clientHeight);
  }
  return worst;
}

const PC_L = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
const PC_R = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function pcPager(screen) {
  const p = el('div', 'pc-pager');
  p.setAttribute('role', 'group');
  p.setAttribute('aria-label', 'Parts of this screen');
  p.innerHTML =
    '<button class="pc-turn pc-back" type="button">' + PC_L + 'Back</button>' +
    '<p class="pc-count"></p>' +
    '<button class="pc-turn pc-more" type="button">More' + PC_R + '</button>';
  p.querySelector('.pc-back').addEventListener('click', () =>
    pcShow(screen, (pcPart[Number(screen.dataset.screen)] || 1) - 1));
  p.querySelector('.pc-more').addEventListener('click', () =>
    pcShow(screen, (pcPart[Number(screen.dataset.screen)] || 1) + 1));
  screen.appendChild(p);
  return p;
}

/* Ground labels are hidden where a plate covers them, so every time the
   plates move the ground has to be judged again. */
function recull(screen) {
  screen.querySelectorAll('.ground').forEach(g => { if (g.firstElementChild) cull(g); });
}

function pcShow(screen, n) {
  const host = pcHost(screen);
  const atoms = [...screen.querySelectorAll('[data-pc-part]')];
  if (!host || !atoms.length) { recull(screen); return; }
  const parts = atoms.reduce((m, a) => Math.max(m, Number(a.dataset.pcPart)), 1);
  n = Math.min(Math.max(n, 1), parts);
  pcPart[Number(screen.dataset.screen)] = n;
  pcApply(screen, host, n);
  const pager = screen.querySelector('.pc-pager');
  if (pager) {
    pager.querySelector('.pc-count').textContent = 'Part ' + n + ' of ' + parts;
    pager.querySelector('.pc-back').disabled = n === 1;
    pager.querySelector('.pc-more').disabled = n === parts;
  }
  $('live').textContent = 'Screen ' + state.page + ' of ' + LAST_PAGE + ', part ' + n +
    ' of ' + parts + '. ' + PAGE_LABELS[state.page - 1] + '.';
  recull(screen);
}

function pcPaginate(screen) {
  pcClear(screen);
  const old = screen.querySelector('.pc-pager');
  if (old) old.remove();
  screen.classList.remove('pc-paged');
  if (!compact()) return;

  const host = pcHost(screen);
  if (!host) return;
  const drawn = !!pcDrawn(screen);
  if (!drawn && host.scrollHeight <= host.clientHeight + 1) return;

  screen.classList.add('pc-paged');
  const pager = pcPager(screen);

  /* Coarse parts first — whole plates and bands, which read best. Only if
     one of them still will not fit is the content broken open further. */
  let parts = 1;
  for (const [f, g] of [[0.95, true], [0.95, false], [0.62, false], [0.42, false], [0.28, false]]) {
    parts = pcPack(screen, host, host.clientHeight * f, drawn, g);
    if (pcWorst(screen, host, parts) <= 1) break;
  }

  if (parts < 2) { pcClear(screen); pager.remove(); screen.classList.remove('pc-paged'); }
}

function pcRefresh() {
  const cur = document.querySelector('.screen.is-current');
  if (!cur) return;
  const focus = document.activeElement;
  const held = focus && cur.contains(focus) ? focus : null;
  let keep = pcPart[state.page] || 1;
  pcPaginate(cur);
  /* A slider that moved itself onto another part would vanish under the
     reader's thumb. The control being used decides which part is shown. */
  if (held) {
    const a = held.closest('[data-pc-part]');
    if (a) keep = Number(a.dataset.pcPart);
  }
  pcShow(cur, keep);
  if (held && document.activeElement !== held) held.focus({ preventScroll: true });
}

/* ── Render / navigation ─────────────────────────────────────────────── */

const RENDERERS = { 1: render1, 2: render2, 3: render3, 4: render4, 5: render5, 6: render6,
  7: render7, 8: render8, 9: render9, 10: render10, 11: render11 };

function render() {
  document.querySelectorAll('.screen').forEach(p => {
    p.classList.toggle('is-current', Number(p.dataset.screen) === state.page);
  });
  const fn = RENDERERS[state.page];
  if (fn) fn();

  const pad = n => String(n).padStart(2, '0');
  $('position').textContent = pad(state.page) + ' / ' + pad(LAST_PAGE);
  $('prev').disabled = state.page === 1;
  $('next').disabled = state.page === LAST_PAGE;
  $('picker').value = String(state.page);
  $('householdChip').hidden = state.page < 3;
  $('householdSelect').value = state.household;
  $('live').textContent = 'Screen ' + state.page + ' of ' + LAST_PAGE + '. ' + PAGE_LABELS[state.page - 1] + '.';
  pcRefresh();
}

function goto(n, fromHash) {
  state.page = Math.min(Math.max(n, 1), LAST_PAGE);
  if (!fromHash) location.hash = 'page/' + state.page;
  document.querySelectorAll('.layer').forEach(l => { l.scrollTop = 0; });
  pcPart[state.page] = 1;
  render();
}

function fromHash() {
  const m = /^#page\/(\d+)$/.exec(location.hash);
  if (m) goto(Number(m[1]), true);
}

function boot() {
  const picker = $('picker');
  PAGE_LABELS.forEach((label, i) => {
    const o = document.createElement('option');
    o.value = String(i + 1);
    o.textContent = (i + 1) + ' of ' + LAST_PAGE + ' · ' + label;
    picker.appendChild(o);
  });
  picker.addEventListener('change', e => goto(Number(e.target.value)));

  const hs = $('householdSelect');
  H_ORDER.forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = HOUSEHOLDS[k].short;
    hs.appendChild(o);
  });
  hs.addEventListener('change', e => { state.household = e.target.value; render(); });

  $('prev').addEventListener('click', () => goto(state.page - 1));
  $('next').addEventListener('click', () => goto(state.page + 1));
  document.querySelectorAll('[data-goto]').forEach(b =>
    b.addEventListener('click', () => goto(Number(b.dataset.goto))));

  $('assignSlider').addEventListener('input', e => {
    state.assign[state.household] = Number(e.target.value);
    render5();
    pcRefresh();
  });
  $('shockSlider').addEventListener('input', e => {
    state.shock = Number(e.target.value);
    render9();
    pcRefresh();
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('tapeToggle').addEventListener('click', () => tapeRunning(!tapeTimer));
  tapeRunning(!reduced);

  window.addEventListener('keydown', e => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') { goto(state.page + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { goto(state.page - 1); e.preventDefault(); }
  });
  window.addEventListener('hashchange', fromHash);

  let rz = null;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(render, 120); });

  if (/^#page\/\d+$/.test(location.hash)) fromHash(); else render();
}

boot();
