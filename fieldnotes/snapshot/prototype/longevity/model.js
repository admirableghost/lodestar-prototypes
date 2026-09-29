/*
 * Understanding Longevity — 2036 prototype
 * The household model.
 *
 * EVERYTHING IN THIS FILE IS INVENTED. There is no real household, no real
 * insurer and no real contract here. The numbers are chosen to be internally
 * consistent and plausible for 2036, and they are computed rather than typed
 * so that the four lives on page 4 and the bridge on page 5 agree with each
 * other. They are a projection, not a forecast, and not a quotation.
 *
 * Loaded as a plain script (defines window.LG) and also requireable from node
 * so the arithmetic can be checked outside the browser.
 */
(function (root) {
  "use strict";

  /* ---------------------------------------------------------------------
     Household — Robert (71) and Ada (68), 2036.
     --------------------------------------------------------------------- */

  var H = {
    robertAge: 71,
    adaAge: 68,
    horizon: 100,             // last age modelled for Robert's cohort year

    inflation: 0.026,         // assumed, constant
    growth: 0.032,            // nominal return on accessible savings

    savings: 520000,          // accessible, today
    premium: 150000,          // the same money into whichever contract

    spendMonthly: 4100,       // measured from actual spending, both alive
    floorMonthly: 3000,       // the part of the month that is not optional
    survivorSpendFactor: 0.68,

    stateMonthly: 1850,       // both state pensions, rises with the index
    stateSurvivorMonthly: 980,// Ada's own, after Robert
    dbMonthly: 420,           // small level scheme pension, stops on death

    // 2036 care shape: household machines carry the long middle cheaply;
    // the acute end is still people, and still expensive.
    careAssistedMonthly: 900,
    careAcuteMonthly: 5400,
    careAcuteYears: 2
  };

  /* ---------------------------------------------------------------------
     The three contracts. Generic shapes, not products; no provider named.
     --------------------------------------------------------------------- */

  var CONTRACTS = [
    {
      id: "level",
      letter: "A",
      name: "Level, from 80",
      startAge: 80,
      base: 2425,             // £/month, nominal, at start
      escalationLabel: "None",
      escalation: { kind: "none" },
      accessLabel: "None after 30 days",
      survivorLabel: "Nothing to her",
      backingLabel: "One insurer",
      terms: {
        escalation: "£2,425 a month for life. The figure at 95 is the figure at 80, and on the assumed 2.6% inflation it buys what £1,310 buys today.",
        access: "Cancellable in full for thirty days. After that no withdrawal, transfer or surrender is permitted, at any price.",
        survivor: "Payments stop on his death. Nothing to Ada, nothing to the estate, and nothing at all if he dies before 80.",
        backing: "One insurer's balance sheet, with the statutory compensation scheme behind it up to the scheme's own limits.",
        income: "£2,425 a month from his eightieth birthday — the highest first payment of the three."
      }
    },
    {
      id: "escalating",
      letter: "B",
      name: "Escalating 3%, from 82",
      startAge: 82,
      base: 2200,
      escalationLabel: "+3% a year, compound",
      escalation: { kind: "fixed", rate: 0.03 },
      accessLabel: "None after 30 days",
      survivorLabel: "10 years guaranteed",
      backingLabel: "One insurer",
      guaranteeYears: 10,
      terms: {
        escalation: "Payments rise 3% a year for life whatever prices actually do, which on the assumed 2.6% inflation gains slowly in real terms.",
        access: "Cancellable in full for thirty days. After that no withdrawal, transfer or surrender is permitted, at any price.",
        survivor: "If he dies after payments start, the rest of ten years continues to Ada. If he dies before 82, nothing is ever paid.",
        backing: "One insurer's balance sheet, with the statutory compensation scheme behind it up to the scheme's own limits.",
        income: "£2,200 a month from his eighty-second birthday, reaching about £3,230 by 95."
      }
    },
    {
      id: "joint",
      letter: "C",
      name: "Joint, index-linked, from 78",
      startAge: 78,
      base: 1225,
      escalationLabel: "Published index, capped 5%",
      escalation: { kind: "index", cap: 0.05, floor: 0 },
      accessLabel: "Up to 40% back, years 1–3",
      survivorLabel: "60% to Ada, for her life",
      backingLabel: "One insurer",
      survivorShare: 0.6,
      commutation: [
        { untilYear: 1, charge: 0.09 },
        { untilYear: 2, charge: 0.06 },
        { untilYear: 3, charge: 0.03 }
      ],
      terms: {
        escalation: "Payments track a published price index each year, capped at 5% and never falling, so the real value holds while inflation stays under the cap.",
        access: "Cancellable in full for thirty days, and up to 40% of the premium may be taken back in the first three years against a 9%, 6% then 3% charge.",
        survivor: "60% of the payment continues to Ada for the rest of her life, and it continues even if he dies before payments begin.",
        backing: "One insurer's balance sheet, with the statutory compensation scheme behind it up to the scheme's own limits.",
        income: "£1,225 a month from his seventy-eighth birthday — the lowest first payment by a wide margin."
      }
    }
  ];

  /* ---------------------------------------------------------------------
     Four lives. Chosen, not predicted.
     --------------------------------------------------------------------- */

  var LIVES = [
    {
      id: "long",
      label: "A long life",
      sub: "Robert to 96, Ada to 99",
      robertDeath: 96, adaDeath: 99, careFrom: null,
      note: "The case every rate table is built for, and the only one of the four where the biggest first payment also carries them furthest."
    },
    {
      id: "short",
      label: "A short life",
      sub: "Robert to 79, Ada to 94",
      robertDeath: 79, adaDeath: 94, careFrom: null,
      note: "He dies before either deferred contract pays a penny. Only the one that started earliest, and continues to Ada, returns anything."
    },
    {
      id: "survivor",
      label: "Ada outlives him",
      sub: "Robert to 83, Ada to 97",
      robertDeath: 83, adaDeath: 97, careFrom: null,
      note: "Ada lives fourteen years past him, ordinary for a couple three years apart, and the survivor column decides all of it."
    },
    {
      id: "care",
      label: "Care from 84",
      sub: "Robert to 91, Ada to 95",
      robertDeath: 91, adaDeath: 95, careFrom: 84,
      note: "Machines make frailty's long middle cheap by 2036. The acute end is still people: a ledge, then a wall."
    }
  ];

  /* ---------------------------------------------------------------------
     Contract income, nominal £/month, at a given age of Robert's cohort.
     --------------------------------------------------------------------- */

  function contractMonthly(c, age, inflation) {
    if (age < c.startAge) return 0;
    var n = age - c.startAge;
    if (c.escalation.kind === "none") return c.base;
    if (c.escalation.kind === "fixed") return c.base * Math.pow(1 + c.escalation.rate, n);
    var r = Math.min(Math.max(inflation, c.escalation.floor), c.escalation.cap);
    return c.base * Math.pow(1 + r, n);
  }

  /* What the household actually receives from the contract in a given year,
     given who is alive. */
  function contractReceived(c, age, robertAlive, adaAlive, robertDeath) {
    if (age < c.startAge) return 0;
    var full = contractMonthly(c, age, H.inflation);
    if (robertAlive) return full;
    if (!adaAlive) return 0;

    if (c.id === "level") return 0;
    if (c.id === "escalating") {
      // Nothing ever, if he died before payments began.
      if (robertDeath < c.startAge) return 0;
      var end = c.startAge + c.guaranteeYears;
      return age < end ? full : 0;
    }
    // joint: 60% for Ada's life, whether or not he reached the start date
    return full * c.survivorShare;
  }

  /* ---------------------------------------------------------------------
     The simulation. One row per year of Robert's cohort, 71 → 100.
     --------------------------------------------------------------------- */

  function simulate(contract, life, opts) {
    opts = opts || {};
    var startAge = opts.startAge != null ? opts.startAge : null;
    var c = contract;
    if (startAge != null && c) {
      c = Object.assign({}, contract, { startAge: startAge, base: deferredBase(startAge) });
    }

    var pot = H.savings - (c ? H.premium : 0);
    var rows = [];
    var potDry = null;

    for (var age = H.robertAge; age <= H.horizon; age++) {
      var k = age - H.robertAge;
      var infl = Math.pow(1 + H.inflation, k);
      var robertAlive = age <= life.robertDeath;
      var adaAge = H.adaAge + k;
      var adaAlive = adaAge <= life.adaDeath;

      if (!robertAlive && !adaAlive) {
        rows.push({ age: age, state: "gone", pot: Math.max(pot, 0) });
        continue;
      }

      /* Spending */
      var base = robertAlive ? H.spendMonthly : H.spendMonthly * H.survivorSpendFactor;
      var floorBase = robertAlive ? H.floorMonthly : H.floorMonthly * H.survivorSpendFactor;
      var care = 0;
      if (life.careFrom != null && robertAlive && age >= life.careFrom) {
        var acuteFrom = life.robertDeath - H.careAcuteYears + 1;
        care = age >= acuteFrom ? H.careAcuteMonthly : H.careAssistedMonthly;
      }
      var spend = (base + care) * 12 * infl;
      var floor = (floorBase + care) * 12 * infl;

      /* Guaranteed income */
      var state = (robertAlive ? H.stateMonthly : H.stateSurvivorMonthly) * 12 * infl;
      var db = robertAlive ? H.dbMonthly * 12 : 0;
      var ann = c ? contractReceived(c, age, robertAlive, adaAlive, life.robertDeath) * 12 : 0;
      var income = state + db + ann;

      /* Drawdown */
      var st, short = 0;
      var need = spend - income;
      if (need <= 0) {
        pot += -need;
        st = "covered";
      } else if (pot >= need) {
        pot -= need;
        st = "covered";
      } else {
        var floorNeed = floor - income;
        if (floorNeed <= 0) {
          st = "floor";
          pot = Math.max(pot, 0);
        } else if (pot >= floorNeed) {
          pot -= floorNeed;
          st = "floor";
        } else {
          short = floorNeed - Math.max(pot, 0);
          pot = 0;
          st = "short";
        }

      }
      if (potDry === null && pot <= 1 && need > 0) potDry = age;
      pot = Math.max(pot, 0) * (1 + H.growth);

      rows.push({
        age: age, state: st, pot: pot, income: income, spend: spend,
        floor: floor, annuity: ann, short: short, care: care * 12 * infl,
        robertAlive: robertAlive, adaAlive: adaAlive
      });
    }

    var shortYears = rows.filter(function (r) { return r.state === "short"; });
    var floorYears = rows.filter(function (r) { return r.state === "floor"; });
    var paid = rows.reduce(function (s, r) { return s + (r.annuity || 0); }, 0);

    return {
      rows: rows,
      potDry: potDry,
      shortYears: shortYears.length,
      firstShort: shortYears.length ? shortYears[0].age : null,
      floorOnlyYears: floorYears.length,
      totalPaid: paid,
      holds: shortYears.length === 0
    };
  }

  /* Payout on the £150,000 premium for a single-life level contract starting
     at `age`. Anchored on contract A's £2,425 at 80; mortality credits
     compound at roughly 14% per year of deferral at these ages. Invented,
     monotonic, and the only place the deferral curve is defined. */
  function deferredBase(age) {
    return Math.round(2425 * Math.pow(1.14, age - 80) / 10) * 10;
  }

  var LG = {
    H: H,
    CONTRACTS: CONTRACTS,
    LIVES: LIVES,
    simulate: simulate,
    contractMonthly: contractMonthly,
    deferredBase: deferredBase
  };

  root.LG = LG;
  if (typeof module !== "undefined" && module.exports) module.exports = LG;
})(typeof window !== "undefined" ? window : globalThis);
