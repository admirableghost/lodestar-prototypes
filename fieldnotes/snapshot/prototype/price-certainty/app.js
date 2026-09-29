/* ─────────────────────────────────────────────────────────────────────────
   Price Certainty 2036 — prototype behaviour

   EVERY FIGURE IN THIS FILE IS INVENTED for the prototype. Nothing here is
   measured, forecast, or drawn from a real utility, retailer, insurer or
   reinsurer. What IS real is the arithmetic: prices, bills, targets,
   settlements, carrier margin and the reinsurance tower are all computed
   from the constants below, so every number on screen is consistent with
   every other one and nothing is typed in by hand.

   THE MODEL, in one paragraph. A household's covered energy is priced by a
   monthly index (¢/kWh). Its assumed expected annual cost E is that index
   run over the central year. The carrier quotes an annual net-cost target
   T = E + risk load − flexibility credit, where the credit is what the
   carrier returns out of the revenue it earns trading the home's
   flexibility, after its aggregation margin and after repaying any hardware
   it financed. The household pays its supplier as usual and settles the
   difference to T. The carrier's cash is therefore
   (flexibility revenue − hardware finance) + (T − actual bill), which is
   what page 8 walks up the tower.
   ───────────────────────────────────────────────────────────────────────── */

'use strict';

/* ── Constants ───────────────────────────────────────────────────────── */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* Covered part of the delivered rate, ¢/kWh, by month. Three versions of
   one year — scenarios, not forecasts. */
const SCENARIOS = {
  calm:    { name: 'Calm 2036',    idx: [26.4,25.8,23.2,20.9,19.4,21.1,24.6,26.9,23.8,21.2,24.4,27.1] },
  central: { name: 'Central 2036', idx: [31.2,29.8,24.1,19.6,17.2,21.4,28.9,33.6,26.2,20.8,27.4,35.1] },
  shock:   { name: 'Shock 2036',   idx: [38.0,61.0,27.0,20.0,17.5,23.0,34.0,52.0,29.0,21.0,30.0,41.0] }
};
const SCEN_ORDER = ['calm','central','shock'];

const RISK_LOAD = 0.08;   /* the price of certainty, on expected cost      */
const AGG_MARGIN = 0.25;  /* the carrier's cut of flexibility revenue      */
const EXPORT_FACTOR = 0.62; /* exported kWh credited below the import rate */

const HOUSEHOLDS = {
  h1: {
    key: 'h1',
    short: 'Rented room, 1962 block',
    title: 'A rented room in a 1962 block',
    blurb: 'Electric heating, a shared meter, a landlord who says no.',
    kwh:  [720,660,520,400,320,300,340,380,330,400,540,690],
    assets: 'None that can be assigned',
    stops: [
      { label: 'Nothing assigned', f: 0 },
      { label: 'Water heater and one smart socket', f: 55 }
    ],
    assetFinance: 0,
    gives: [
      { from: 1, text: 'The water heater, and one socket' }
    ],
    limit: 'No battery, no panel, no car — two positions, and the second is worth $55 a year.',
    bounds: ['Never below 17 °C', 'Hot water ≥ 45 °C by 06:30']
  },
  h2: {
    key: 'h2',
    short: '1931 terrace, battery on loan',
    title: 'A 1931 terrace with a battery on loan',
    blurb: 'Heat pump and battery, financed by the carrier.',
    kwh:  [1560,1420,1080,720,470,360,420,500,430,760,1180,1500],
    assets: '11 kWh battery, heat pump — carrier-financed',
    stops: [
      { label: 'Nothing assigned', f: 0 },
      { label: 'Water heater only', f: 90 },
      { label: 'Battery dispatch as well', f: 780 },
      { label: 'Heat pump pre-heating as well', f: 1340 }
    ],
    assetFinance: 370,
    gives: [
      { from: 1, text: 'Water heater timing' },
      { from: 2, text: 'Battery dispatch — the battery on your wall is the carrier\'s' },
      { from: 3, text: 'Heat pump pre-heating, inside a band you set' }
    ],
    limit: 'Assign nothing and the $370 hardware finance falls due in cash.',
    bounds: ['18.5–21.5 °C, 07:00–22:30', 'Never below 17 °C', 'Hot water ≥ 45 °C by 06:30']
  },
  h3: {
    key: 'h3',
    short: '2029 retrofit, owned outright',
    title: 'A 2029 retrofit, owned outright',
    blurb: 'Solar, storage and a bidirectional car, all owned outright.',
    kwh:  [620,480,210,-60,-240,-320,-280,-180,-120,90,380,580],
    assets: '7 kW solar, 20 kWh storage, bidirectional car',
    stops: [
      { label: 'Nothing assigned', f: 0 },
      { label: 'Water heater only', f: 110 },
      { label: 'Battery and solar dispatch as well', f: 1180 },
      { label: 'The car\'s charge window as well', f: 2150 }
    ],
    assetFinance: 0,
    gives: [
      { from: 1, text: 'Water heater timing' },
      { from: 2, text: 'Battery and solar dispatch, including when to export' },
      { from: 3, text: 'The car\'s charge window, and some of the charge' }
    ],
    limit: 'The target goes below zero: the carrier pays the household.',
    bounds: ['18.5–21.5 °C, 07:00–22:30', 'Car at 80% by 07:00 weekdays', 'Hot water ≥ 45 °C by 06:30']
  }
};
const H_ORDER = ['h1','h2','h3'];

/* Pool composition and capital. Invented. */
const POOL = {
  homes: 412000,
  weights: { h1: 0.58, h2: 0.31, h3: 0.11 },
  retention: 60e6,            /* captive surplus available in one year    */
  reinsurance: 220e6          /* limit, excess of the retention           */
};

/* The agent's day. A projected loop, not a recording. */
const TAPE = [
  ['02:40', 'Battery charged on the overnight floor', -0.31],
  ['05:55', 'Hot water pre-heated before the peak', -0.18],
  ['07:20', 'Peak bid declined, car held at 62%', 0],
  ['08:05', 'Exported 2.1 kWh into the morning ramp', 1.04],
  ['11:30', 'Heat pump paused 22 minutes', 0.46],
  ['14:15', 'Charged 3.8 kWh on surplus solar', -0.05],
  ['17:40', 'Discharged 5.1 kWh into the evening peak', 3.88],
  ['18:25', 'Frequency response held, 14 minutes', 0.71],
  ['21:10', 'Car charged to 80% overnight', -0.44],
  ['23:50', 'Bid accepted for tomorrow evening', 1.16]
];

const PAGE_LABELS = [
  'A steadier cost, ten years on',
  'What the agent does all day',
  'Three households, one promise',
  'The year without it',
  'The trade',
  'The months you lose',
  'Not budget billing',
  'Where the swing lands',
  'The bill still arrives first',
  'What it legally is',
  'Or just buy a battery',
  'What would have to be true'
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
  return { E, load, flexGross, aggFee, credit, target, stop,
           assetFinance: h.assetFinance };
}

/* Carrier cash for one home in a year whose prices are `mult` × central. */
const carrierCash = (h, q, mult) => q.flexGross - h.assetFinance + q.target - q.E * mult;

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
  const settleTotal = settle * N;
  const capacity = fundsTotal + POOL.retention + POOL.reinsurance;
  return { fundsTotal, settleTotal, slopeTotal: slope * N, capacity };
}

/* The multiplier at which a given cumulative settlement cost is reached. */
function multFor(cost) {
  const p0 = pool(1);
  return 1 + (cost - p0.settleTotal) / p0.slopeTotal;
}

/* ── Formatting ──────────────────────────────────────────────────────── */

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

/* ── State ───────────────────────────────────────────────────────────── */

const state = {
  page: 1,
  household: 'h2',
  scenario: 'central',
  assign: {},            /* per household, slider position */
  settleMode: 'annual',
  shock: 100,
  structure: 'coupled'
};
for (const k of H_ORDER) state.assign[k] = HOUSEHOLDS[k].stops.length - 1;

const H = () => HOUSEHOLDS[state.household];
const Q = () => quote(H(), state.assign[state.household]);

/* ── Chart primitive: HTML/CSS bars, so type never scales ────────────── */

/* series: [{ values, cls }] drawn as one bar per month (first series wins
   the column). A signed chart puts the zero line where it belongs. */
function drawBars(host, values, opts = {}) {
  const o = Object.assign({ cls: 'pos', negCls: 'neg', labels: MONTHS, lines: [] }, opts);
  host.innerHTML = '';
  const hasNeg = values.some(v => v < 0) || o.lines.some(l => l.v < 0);
  host.classList.toggle('signed', hasNeg);

  const all = values.concat(o.lines.map(l => l.v), [0]);
  const top = Math.max(...all), bot = Math.min(...all);
  const span = (top - bot) || 1;
  const pad = 0.08 * span;
  const hi = top + pad, lo = Math.min(bot - (hasNeg ? pad : 0), 0);
  const range = hi - lo;
  const pos = v => ((v - lo) / range) * 100;     /* % from the bottom */

  values.forEach((v, i) => {
    const col = el('div', 'col');
    const bar = el('div', 'bar ' + (v >= 0 ? o.cls : o.negCls));
    const z = pos(0), p = pos(v);
    if (v >= 0) { bar.style.bottom = z + '%'; bar.style.height = Math.max(p - z, 0.6) + '%'; }
    else { bar.style.top = (100 - z) + '%'; bar.style.height = Math.max(z - p, 0.6) + '%'; }
    col.appendChild(bar);
    const lab = el('span', 'mlabel', o.labels[i] || '');
    col.appendChild(lab);
    host.appendChild(col);
  });

  if (hasNeg) {
    const z = el('div', 'zero');
    z.style.bottom = pos(0) + '%';
    host.appendChild(z);
  }
  o.lines.forEach(l => {
    const line = el('div', 'target');
    line.style.bottom = pos(l.v) + '%';
    host.appendChild(line);
    if (l.tag) {
      const t = el('div', 'target-tag', l.tag);
      t.style.bottom = pos(l.v) + '%';
      host.appendChild(t);
    }
  });
}

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

/* ── Page 1: the cover plate ─────────────────────────────────────────── */

function renderCover() {
  const host = document.getElementById('coverPlate');
  host.innerHTML = '';
  const h = HOUSEHOLDS.h2, q = quote(h, h.stops.length - 1);
  const b = bills(h, 'central');
  const top = Math.max(...b) * 1.18;

  const wrap = el('div', 'cp-inner');   /* bars sit above the caption strip */
  b.forEach((v, i) => {
    const bar = el('div', 'cp-bar');
    bar.style.left = (6 + i * 7.5) + '%';
    bar.style.height = ((v / top) * 88) + '%';
    wrap.appendChild(bar);
  });
  const line = el('div', 'cp-line');
  line.style.bottom = ((q.target / 12 / top) * 88) + '%';
  wrap.appendChild(line);
  const tag = el('div', 'cp-tag', 'one agreed number');
  tag.style.bottom = ((q.target / 12 / top) * 88) + '%';
  wrap.appendChild(tag);
  host.appendChild(wrap);
  host.appendChild(el('p', 'cp-cap', 'Twelve months of a market, and the line a household is sold'));
}

/* ── Page 2: bounds + agent tape ─────────────────────────────────────── */

let tapeTimer = null, tapeAt = 0;

function renderP2() {
  const bl = document.getElementById('bounds');
  bl.innerHTML = '';
  ['18.5–21.5 °C, 07:00–22:30',
   'Never below 17 °C, whatever the price',
   'Car at 80% by 07:00 on weekdays'].forEach(t => {
    const li = el('li');
    li.appendChild(el('span', 'mk', '·'));
    li.appendChild(el('span', null, t));
    bl.appendChild(li);
  });
  paintTape();
}

function paintTape() {
  const host = document.getElementById('tape');
  host.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const row = TAPE[(tapeAt + i) % TAPE.length];
    const li = el('li', i === 0 ? 'fresh' : '');
    li.appendChild(el('span', 't', row[0]));
    li.appendChild(el('span', 'a', row[1]));
    const m = el('span', 'm ' + (row[2] > 0 ? 'in' : row[2] < 0 ? 'out' : ''),
      row[2] === 0 ? '—' : moneyC(row[2]));
    li.appendChild(m);
    host.appendChild(li);
  }
}

function tapeRunning(on) {
  const btn = document.getElementById('tapeToggle');
  if (tapeTimer) { clearInterval(tapeTimer); tapeTimer = null; }
  if (on) {
    tapeTimer = setInterval(() => {
      tapeAt = (tapeAt + 1) % TAPE.length;
      if (state.page === 2) paintTape();
    }, 2600);
  }
  btn.textContent = on ? 'Pause the tape' : 'Resume the tape';
  btn.setAttribute('aria-pressed', String(!on));
}

/* ── Page 3: household choice ────────────────────────────────────────── */

function renderP3() {
  const host = document.getElementById('choiceGrid');
  host.innerHTML = '';
  H_ORDER.forEach(k => {
    const h = HOUSEHOLDS[k];
    const q = quote(h, h.stops.length - 1);
    const lo = sum(bills(h, 'calm')), hi = sum(bills(h, 'shock'));
    const b = el('button', 'choice');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(k === state.household));
    b.appendChild(el('p', 'eyebrow', h.assets));
    b.appendChild(el('h3', null, h.title));
    b.appendChild(el('p', null, h.blurb));
    const dl = el('dl');
    [['Covered energy', Math.round(Math.abs(sum(h.kwh))).toLocaleString('en-US') + (sum(h.kwh) < 0 ? ' kWh net export' : ' kWh net')],
     ['Cost range', money(lo) + ' – ' + money(hi)],
     ['Assignable value', money(q.flexGross) + ' a year']
    ].forEach(([a, c]) => { dl.appendChild(el('dt', null, a)); dl.appendChild(el('dd', null, c)); });
    b.appendChild(dl);
    const ch = el('span', 'chosen');
    ch.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> Chosen';
    b.appendChild(ch);
    b.addEventListener('click', () => { state.household = k; render(); });
    host.appendChild(b);
  });
}

/* ── Page 4: the counterfactual ──────────────────────────────────────── */

function renderP4() {
  const h = H();
  segButtons(document.getElementById('scenarioSet4'),
    SCEN_ORDER.map(s => ({ label: SCENARIOS[s].name, value: s })),
    state.scenario, v => { state.scenario = v; render(); });

  document.getElementById('p4ScenarioName').textContent = SCENARIOS[state.scenario].name;
  drawBars(document.getElementById('p4Chart'), bills(h, state.scenario), { cls: 'pos', negCls: 'neg' });

  const totals = SCEN_ORDER.map(s => ({ s, v: sum(bills(h, s)) }));
  const row = document.getElementById('p4Totals');
  row.innerHTML = '';
  totals.forEach(t => row.appendChild(figure(
    SCENARIOS[t.s].name, money(t.v),
    t.s === state.scenario ? 'the year on screen' : '',
    t.s === state.scenario ? 'market' : null)));

  const spread = totals[2].v - totals[0].v;
  document.getElementById('p4Caption').textContent =
    'Between the calm year and the shock year this home\'s supplier bills differ by ' +
    money(spread) + ' for identical energy, and it finds out which year it was in as the year goes along.';
}

/* ── Page 5: the trade ───────────────────────────────────────────────── */

function renderP5() {
  const h = H();
  const slider = document.getElementById('assignSlider');
  slider.max = String(h.stops.length - 1);
  slider.value = String(Math.min(state.assign[h.key], h.stops.length - 1));
  const q = Q();

  document.getElementById('assignLabel').innerHTML =
    '<strong>' + q.stop.label + '</strong> &middot; earns ' + money(q.flexGross) + ' a year';

  const tgt = document.getElementById('p5Target');
  tgt.textContent = q.target >= 0 ? money(q.target) : money(Math.abs(q.target)) + ' to you';
  document.getElementById('p5Versus').textContent = q.target >= 0
    ? (q.target > q.E
        ? money(q.target - q.E) + ' above the ' + money(q.E) + ' assumed expected cost — what the certainty costs.'
        : money(q.E - q.target) + ' below the ' + money(q.E) + ' assumed expected cost — flexibility more than pays for it.')
    : 'Flexibility worth more than the certainty costs, so the carrier pays and still keeps a margin.';

  const led = document.getElementById('p5Ledger');
  led.innerHTML = '';
  const rows = [
    ['Assumed expected cost<span class="why">Central 2036 index</span>', money(q.E), ''],
    ['Risk load, 8%', '+ ' + money(q.load), 'charge'],
    ['Flexibility revenue', money(q.flexGross), ''],
    ['Less the carrier\'s aggregation margin, 25%<span class="why">Its cut for bidding 412,000 homes as one</span>', '− ' + money(q.aggFee), 'charge']
  ];
  if (h.assetFinance) rows.push(['Less hardware finance', '− ' + money(h.assetFinance), 'charge']);
  rows.push(['Returned to the household', (q.credit >= 0 ? '− ' : '+ ') + money(Math.abs(q.credit)), q.credit >= 0 ? 'credit' : 'charge']);
  rows.push(['Annual net cost target', q.target >= 0 ? money(q.target) : '−' + money(Math.abs(q.target)), 'total']);
  rows.forEach(([a, b, cls]) => {
    const r = el('div', 'row ' + cls);
    r.appendChild(el('div', null, a));      /* holds a block .why, so not a span */
    r.appendChild(el('div', 'num', b));
    led.appendChild(r);
  });

  const gl = document.getElementById('p5Gives');
  gl.innerHTML = '';
  const always = [
    'The upside in a calm year',
    'A year — leaving early settles at market',
    'Half-hourly meter and appliance-level telemetry'
  ];
  const stopIdx = Number(slider.value);
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

/* ── Page 6: the months you lose ─────────────────────────────────────── */

function renderP6() {
  const h = H(), q = Q();
  segButtons(document.getElementById('scenarioSet6'),
    SCEN_ORDER.map(s => ({ label: SCENARIOS[s].name, value: s })),
    state.scenario, v => { state.scenario = v; render(); });
  document.getElementById('p6ScenarioName').textContent = SCENARIOS[state.scenario].name;

  const b = bills(h, state.scenario);
  const mt = q.target / 12;
  const diff = b.map(v => v - mt);           /* > 0 → carrier refunds you  */
  /* Above the target is drawn in the gain hue, below it in the market hue —
     and both directions also carry a sign and a word in the legend, so the
     chart survives greyscale and a colour-blind reader. */
  drawBars(document.getElementById('p6Chart'), diff, { cls: 'softgain', negCls: 'soft' });

  const leg = document.getElementById('p6Legend');
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
  const settlement = q.target - billTotal;   /* < 0 → carrier pays you    */
  const won = diff.filter(d => d > 0).length;
  const row = document.getElementById('p6Totals');
  row.innerHTML = '';
  row.appendChild(figure('Supplier bills', money(billTotal), 'paid month by month', 'market'));
  row.appendChild(figure('Annual net cost', q.target >= 0 ? money(q.target) : '−' + money(Math.abs(q.target)), 'agreed in advance', 'ink'));
  row.appendChild(figure('Settlement', (settlement >= 0 ? 'you pay ' : 'you receive ') + money(Math.abs(settlement)),
    won + ' of 12 months in your favour', settlement >= 0 ? 'market' : 'gain'));

  let verdict;
  if (settlement >= 0) {
    verdict = 'In this year the home hands back ' + money(settlement) +
      ' for protection it did not need, and that is the product working as sold rather than failing.';
  } else if (won === 12) {
    verdict = 'Every month clears a target that sits below zero, so this home is paid all year — ' +
      'which is what a household with more flexibility than exposure looks like, and why page 11 tells it to walk away.';
  } else {
    verdict = 'In this year the home is ' + money(Math.abs(settlement)) +
      ' better off, and the ' + (12 - won) + ' months it still paid in are the ones it would rather forget.';
  }
  document.getElementById('p6Caption').textContent = verdict;
}

/* ── Page 7: not budget billing ──────────────────────────────────────── */

function renderP7() {
  const h = H(), q = Q();
  segButtons(document.getElementById('scenarioSet7'),
    SCEN_ORDER.map(s => ({ label: SCENARIOS[s].name, value: s })),
    state.scenario, v => { state.scenario = v; render(); });

  const b = bills(h, state.scenario);
  const variable = sum(b);
  const levelMonthly = q.E / 12;             /* last year's usage and price */
  const trueUp = variable - q.E;
  const certMonthly = q.target / 12;

  const rows = [
    { name: 'Variable tariff', tot: variable, sub: 'what the market charged, month by month',
      series: b, cls: 'var(--market)', mark: 'market' },
    { name: 'Budget billing', tot: variable, sub: 'twelve level payments, then a true-up that passes the whole rise through',
      series: new Array(12).fill(levelMonthly).concat([trueUp]), cls: 'var(--smooth)', mark: 'smooth', trueUp: true },
    { name: 'Price Certainty', tot: q.target, sub: 'one agreed annual net cost, settled both ways',
      series: new Array(12).fill(certMonthly), cls: 'var(--ink)', mark: 'ink' }
  ];

  const host = document.getElementById('p7Triptych');
  host.innerHTML = '';
  const peak = Math.max(...b, levelMonthly, Math.abs(trueUp), Math.abs(certMonthly));
  rows.forEach(r => {
    const t = el('div', 'trip');
    const who = el('div', 'who');
    who.appendChild(el('p', 'eyebrow', r.name));
    who.appendChild(el('div', 'tot num', r.tot >= 0 ? money(r.tot) : '−' + money(Math.abs(r.tot))));
    who.appendChild(el('div', 'sub', r.sub));
    t.appendChild(who);
    const mini = el('div', 'mini');
    r.series.forEach((v, i) => {
      const i2 = el('i');
      i2.style.height = Math.max((Math.abs(v) / peak) * 100, 2) + '%';
      if (r.trueUp && i === 12) { i2.className = 'trueup'; i2.style.background = 'var(--market)'; }
      else { i2.style.background = r.cls; }
      mini.appendChild(i2);
    });
    t.appendChild(mini);
    host.appendChild(t);
  });

  const gap = variable - q.target;
  document.getElementById('p7Caption').textContent =
    'Budget billing and the variable tariff come to exactly the same ' + money(variable) +
    ' because smoothing moves the timing and nothing else, while the agreed target lands ' +
    money(Math.abs(gap)) + (gap >= 0 ? ' below both.' : ' above both, which is the year the household pays for the certainty.');
}

/* ── Page 8: where the swing lands ───────────────────────────────────── */

function renderP8() {
  const slider = document.getElementById('shockSlider');
  slider.value = String(state.shock);
  const mult = state.shock / 100;
  const p = pool(mult);
  const cost = p.settleTotal;

  const layers = [
    { n: 'Flexibility revenue, net of hardware finance', cap: p.fundsTotal,
      note: 'Earned every year by trading 412,000 homes — spent before any capital is touched' },
    { n: 'Captive surplus, the retention', cap: POOL.retention,
      note: 'The programme\'s own money, and the first thing a rating agency looks at' },
    { n: 'Reinsurance, ' + mil(POOL.reinsurance) + ' excess of ' + mil(POOL.retention), cap: POOL.reinsurance,
      note: 'One annual aggregate limit across the whole book, not per home' }
  ];

  const host = document.getElementById('p8Tower');
  host.innerHTML = '';
  let remaining = Math.max(cost, 0);
  layers.forEach(L => {
    const used = Math.min(remaining, L.cap);
    remaining -= used;
    const box = el('div', 'layer' + (used >= L.cap - 1 ? ' exhausted' : ''));
    const lh = el('div', 'lh');
    lh.appendChild(el('span', 'ln', L.n));
    lh.appendChild(el('span', 'lv num', mil(used) + ' of ' + mil(L.cap)));
    box.appendChild(lh);
    const m = el('div', 'meter');
    const fill = el('i');
    fill.style.width = ((used / L.cap) * 100).toFixed(1) + '%';
    m.appendChild(fill);
    box.appendChild(m);
    box.appendChild(el('p', 'note', L.note));
    host.appendChild(box);
  });
  const over = el('div', 'layer' + (remaining > 0 ? ' exhausted' : ''));
  const lh = el('div', 'lh');
  lh.appendChild(el('span', 'ln', 'Above the tower'));
  lh.appendChild(el('span', 'lv num', remaining > 0 ? mil(remaining) + ' unfunded' : 'nothing'));
  over.appendChild(lh);
  over.appendChild(el('p', 'note', remaining > 0
    ? 'The warranty pays pro rata, so the households that needed it most receive part of the promise'
    : 'The promise is payable in full at this price level'));
  host.appendChild(over);

  const payable = remaining > 0 ? p.capacity / cost : 1;
  document.getElementById('p8State').textContent =
    remaining > 0 ? 'Tower exhausted' : 'Within capacity';

  const fig = document.getElementById('p8Figures');
  fig.innerHTML = '';
  fig.appendChild(figure('Prices vs central', pctUp(mult), 'across the whole book, for a full year', 'market'));
  fig.appendChild(figure('Net settlement cost', mil(cost), 'two-way, all 412,000 homes', 'market'));
  fig.appendChild(figure('Promise payable', Math.round(payable * 100) + '%',
    remaining > 0 ? 'pro rata — the failure mode, named' : 'in full', payable < 1 ? 'market' : 'gain'));

  const be = document.getElementById('p8Breakevens');
  be.innerHTML = '';
  H_ORDER.forEach(k => {
    const h = HOUSEHOLDS[k], q = quote(h, h.stops.length - 1);
    const m = (q.flexGross - h.assetFinance + q.target) / q.E;
    const row = el('div', 'be' + (mult >= m ? ' hit' : ''));
    row.appendChild(el('span', 'who', h.short + ' <em>&middot; ' + Math.round(POOL.weights[k] * 100) + '% of the book</em>'));
    row.appendChild(el('b', 'num', pctUp(m)));
    be.appendChild(row);
  });
  const mBook = multFor(pool(1).fundsTotal);
  const rowB = el('div', 'be' + (mult >= mBook ? ' hit' : ''));
  rowB.appendChild(el('span', 'who', '<b>The book as a whole</b>'));
  rowB.appendChild(el('b', 'num', pctUp(mBook)));
  be.appendChild(rowB);
}

/* ── Page 9: cash, not just price ────────────────────────────────────── */

function renderP9() {
  const h = H(), q = Q();
  segButtons(document.getElementById('settleSet'), [
    { label: 'Annual settlement — the 2026 draft', value: 'annual' },
    { label: 'Continuous settlement — the 2036 build', value: 'weekly' }
  ], state.settleMode, v => { state.settleMode = v; render(); });

  const b = bills(h, 'shock');
  const mt = q.target / 12;
  const worst = Math.max(...b);
  document.getElementById('p9Worst').textContent = money(worst);
  document.getElementById('p9Monthly').textContent = money(mt);

  let float_;
  if (state.settleMode === 'annual') {
    let run = 0;
    float_ = b.map(v => { run += v - mt; return Math.max(run, 0); });
  } else {
    float_ = b.map(v => Math.max(v - mt, 0) * (7 / 30));
  }
  drawBars(document.getElementById('p9Chart'), float_, { cls: 'soft' });
  document.getElementById('p9Mode').textContent = 'Shock 2036 · ' +
    (state.settleMode === 'annual' ? 'settled once, after the year ends' : 'settled weekly against the meter');

  const fig = document.getElementById('p9Figures');
  fig.innerHTML = '';
  fig.appendChild(figure('Worst single month', money(worst), 'a shock-year February, before any settlement', 'market'));
  fig.appendChild(figure('Peak float', money(Math.max(...float_)),
    state.settleMode === 'annual' ? 'money the household must find itself' : 'never more than a few days of it', 'market'));
  fig.appendChild(figure('Monthly target', money(mt), 'what it agreed to pay', 'ink'));

  const fl = document.getElementById('p9Fail');
  fl.innerHTML = '';
  ['Issuer fails mid-year — an unsecured claim on a captive, not a deposit',
   'The household moves — the term settles to date, hardware balance due',
   'Taxes, network charges and usage above the agreed quantity were never inside',
   'A winter it cannot flex in earns the carrier nothing — next year\'s target says so'
  ].forEach(t => {
    const li = el('li', 'on');
    li.appendChild(el('span', 'mk', '×'));
    li.appendChild(el('span', null, t));
    fl.appendChild(li);
  });
}

/* ── Page 10: the wrapper ────────────────────────────────────────────── */

const STRUCTURES = {
  settlement: {
    name: 'Settlement only — the 2026 draft',
    chain: [
      ['Household', 'not an eligible contract participant'],
      ['Managing general agent', 'licensed producer, distributes and administers'],
      ['Warranty issuer', 'captive, holds the promise'],
      ['Reinsurance panel', 'annual aggregate limit'],
      ['Supplier', 'entirely outside the structure — the household keeps its tariff']
    ],
    grid: [
      ['Legal theory', 'A parametric warranty on a published price index, paid without a claim', false],
      ['US obstacle', 'Cash-settled, bilateral, off-exchange, household counterparty — the barred shape', true],
      ['UK and EU', 'A retail contract for difference: authorisation and appropriateness testing', true],
      ['Household keeps', 'Its supplier, its tariff, its thermostat', false],
      ['Untested', 'Whether a warranty wrapper survives the swap analysis', true]
    ]
  },
  coupled: {
    name: 'Supply-coupled — the 2036 build',
    chain: [
      ['Household', 'buys certainty and assigns flexibility'],
      ['Managing general agent', 'licensed producer, also the dispatch operator'],
      ['Licensed supply affiliate', 'delivers the kilowatt-hours it dispatches, in the service area'],
      ['Warranty issuer', 'captive, holds the promise'],
      ['Reinsurance panel', 'annual aggregate limit']
    ],
    grid: [
      ['Legal theory', 'The warranty attaches to supply: the carrier delivers the energy it dispatches', false],
      ['Why that matters', 'Delivery, personal consumption, merchant, service area — the four elements a carve-out turns on', false],
      ['Regulators', 'A utility commission for supply, an insurance department for the warranty', false],
      ['Household gives up', 'Part of the keep-your-supplier premise — those kilowatt-hours are the carrier\'s', true],
      ['Untested', 'No regulator has ruled on a settlement riding on a partial delivery leg', true]
    ]
  }
};

function renderP10() {
  segButtons(document.getElementById('structureSet'),
    [{ label: 'Settlement only', value: 'settlement' },
     { label: 'Supply-coupled', value: 'coupled' }],
    state.structure, v => { state.structure = v; render(); });

  const s = STRUCTURES[state.structure];
  document.getElementById('p10Name').textContent = s.name;

  const chain = document.getElementById('p10Chain');
  chain.innerHTML = '';
  s.chain.forEach((c, i) => {
    const n = el('div', 'node');
    n.appendChild(el('span', 'r', c[0]));
    n.appendChild(el('span', null, c[1]));
    chain.appendChild(n);
    if (i < s.chain.length - 1) {
      chain.appendChild(el('div', 'arr',
        '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>'));
    }
  });

  const grid = document.getElementById('p10Grid');
  grid.innerHTML = '';
  s.grid.forEach(([k, v, warn]) => {
    const d = el('div', warn ? 'warn' : '');
    d.appendChild(el('dt', null, k));
    d.appendChild(el('dd', null, v));
    grid.appendChild(d);
  });
}

/* ── Page 11: the comparator ─────────────────────────────────────────── */

const VERDICTS = {
  h1: { who: 'financial', tag: 'Only the financial route exists',
        lines: ['No roof, no wall, no landlord consent, no capital',
                'The one home the product is genuinely for — and the one whose cover is thinnest'] },
  h2: { who: 'hardware', tag: 'Hardware wins, financed',
        lines: ['The carrier buys the battery and recovers it from what it earns',
                'The financial promise is what makes the hardware financeable, not the reverse'] },
  h3: { who: 'neither', tag: 'It should not buy this',
        lines: ['Already has the assets, already earns the revenue',
                'It stays in for the tail, and its aggregation margin funds everyone else'] }
};

function renderP11() {
  const host = document.getElementById('p11Verdicts');
  host.innerHTML = '';
  H_ORDER.forEach(k => {
    const h = HOUSEHOLDS[k], v = VERDICTS[k];
    const q = quote(h, h.stops.length - 1);
    const card = el('div', 'verdict' + (k === state.household ? ' sel' : ''));
    card.appendChild(el('span', 'who-wins ' + v.who, v.tag));
    card.appendChild(el('h3', null, h.title));
    v.lines.forEach((t, i) => card.appendChild(el('p', i === v.lines.length - 1 ? 'why' : '', t)));
    const dl = el('p', 'why num');
    dl.innerHTML = (q.target >= 0 ? 'Target ' + money(q.target) : 'Paid ' + money(Math.abs(q.target))) +
      ' &middot; expected ' + money(q.E);
    card.appendChild(dl);
    host.appendChild(card);
  });
}

/* ── Page 12: the closing arithmetic ─────────────────────────────────── */

function renderP12() {
  const p = pool(1);
  const mBook = multFor(p.fundsTotal);
  const mGone = multFor(p.capacity);
  const fig = document.getElementById('p12Figures');
  fig.innerHTML = '';
  fig.appendChild(figure('Homes in the pool', POOL.homes.toLocaleString('en-US'), 'invented for this prototype', 'ink'));
  fig.appendChild(figure('With nothing to assign', Math.round(POOL.weights.h1 * 100) + '%', 'the book\'s loss-making majority', 'market'));
  fig.appendChild(figure('Flexibility revenue', mil(p.fundsTotal), 'a year, net of hardware finance', 'gain'));
  fig.appendChild(figure('Settlement cost', mil(p.settleTotal), 'at the central year', 'market'));
  fig.appendChild(figure('Margin gone at', pctUp(mBook), 'prices above the central year', 'market'));
  fig.appendChild(figure('Tower gone at', pctUp(mGone), 'and the promise goes pro rata', 'market'));

  const c = document.getElementById('p12Conditions');
  c.innerHTML = '';
  ['A regulator accepts the delivery leg — untested anywhere',
   'A tower deep enough for a real crisis — ' + pctUp(mGone) + ' ends this one',
   'Asset-rich homes stay in a pool that underpays them'
  ].forEach(t => c.appendChild(el('li', null, t)));
}

/* ── Render / navigation ─────────────────────────────────────────────── */

const RENDERERS = { 1: renderCover, 2: renderP2, 3: renderP3, 4: renderP4, 5: renderP5,
  6: renderP6, 7: renderP7, 8: renderP8, 9: renderP9, 10: renderP10, 11: renderP11, 12: renderP12 };

function render() {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('is-current', Number(p.dataset.page) === state.page);
  });
  const fn = RENDERERS[state.page];
  if (fn) fn();

  const pad = n => String(n).padStart(2, '0');
  document.getElementById('position').textContent = pad(state.page) + ' / ' + pad(LAST_PAGE);
  document.getElementById('prev').disabled = state.page === 1;
  document.getElementById('next').disabled = state.page === LAST_PAGE;
  document.getElementById('picker').value = String(state.page);
  document.getElementById('householdChip').hidden = state.page < 3;
  const stage = document.getElementById('stage');
  const h = document.getElementById('hint');
  h.hidden = stage.scrollHeight - stage.clientHeight < 56 || stage.scrollTop > 16;
  document.getElementById('householdSelect').value = state.household;
  document.getElementById('live').textContent =
    'Page ' + state.page + ' of ' + LAST_PAGE + '. ' + PAGE_LABELS[state.page - 1] + '.';
}

function goto(n, fromHash) {
  state.page = Math.min(Math.max(n, 1), LAST_PAGE);
  if (!fromHash) location.hash = 'page/' + state.page;
  document.getElementById('stage').scrollTop = 0;
  render();
}

function fromHash() {
  const m = /^#page\/(\d+)$/.exec(location.hash);
  if (m) goto(Number(m[1]), true);
}

function boot() {
  /* design.md §3: the footer disclaimer is an invariant of the page, not of
     the chrome, so every page gets its own. */
  document.querySelectorAll('.page').forEach(p => {
    p.appendChild(el('footer', 'paper-footer',
      'Price Certainty &middot; a projection of 2036 &middot; every figure on this page is invented for the prototype'));
  });

  const picker = document.getElementById('picker');
  PAGE_LABELS.forEach((label, i) => {
    const o = document.createElement('option');
    o.value = String(i + 1);
    o.textContent = (i + 1) + ' of ' + LAST_PAGE + ' · ' + label;
    picker.appendChild(o);
  });
  picker.addEventListener('change', e => goto(Number(e.target.value)));

  const hs = document.getElementById('householdSelect');
  H_ORDER.forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = HOUSEHOLDS[k].short;
    hs.appendChild(o);
  });
  hs.addEventListener('change', e => { state.household = e.target.value; render(); });

  document.getElementById('prev').addEventListener('click', () => goto(state.page - 1));
  document.getElementById('next').addEventListener('click', () => goto(state.page + 1));
  document.querySelectorAll('[data-goto]').forEach(b =>
    b.addEventListener('click', () => goto(Number(b.dataset.goto))));

  document.getElementById('assignSlider').addEventListener('input', e => {
    state.assign[state.household] = Number(e.target.value);
    renderP5();
  });
  document.getElementById('shockSlider').addEventListener('input', e => {
    state.shock = Number(e.target.value);
    document.getElementById('shockLabel').innerHTML =
      '<strong>' + pctUp(state.shock / 100) + '</strong> against the central year';
    renderP8();
  });
  document.getElementById('shockLabel').innerHTML =
    '<strong>' + pctUp(1) + '</strong> against the central year';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('tapeToggle').addEventListener('click', () => tapeRunning(!tapeTimer));
  tapeRunning(!reduced);

  window.addEventListener('keydown', e => {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') { goto(state.page + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { goto(state.page - 1); e.preventDefault(); }
  });
  window.addEventListener('hashchange', fromHash);
  document.getElementById('stage').addEventListener('scroll', () => {
    const st = document.getElementById('stage');
    document.getElementById('hint').hidden =
      st.scrollHeight - st.clientHeight < 56 || st.scrollTop > 16;
  }, { passive: true });
  window.addEventListener('resize', render);

  if (/^#page\/\d+$/.test(location.hash)) fromHash(); else render();
}

boot();
