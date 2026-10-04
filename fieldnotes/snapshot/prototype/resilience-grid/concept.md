# Resilience Grid — concept note

Internal. For the IDEO / State Farm futures discussion, 9 October.
Sacrificial strategic prototype: built to be argued with, not shipped.

---

## 1. Thesis

**Prevention can be a market-creation strategy, not only a loss-ratio strategy.**

An insurer can help assemble the prevention infrastructure around a risk
category — sensing, verification, intervention, public agencies, utilities,
financing — so that an exposure which is becoming economically unattractive to
insure becomes insurable again.

The prototype is deliberately *not* "State Farm partners with Seneca." Seneca
is one chip on one rail of one of four layers on screen 2. The proposition is
the assembly, and the argument is about who pays for it and who learns from it.

The provocation the six screens exist to produce:

> **Should State Farm help build the prevention infrastructure that makes
> difficult risks insurable?**

And the sharper one the build arrived at, which is the closing line of screen 5:

> If every piece of this is for sale to everyone, and no insurer has ever
> secured exclusive rights to the outcome data, **what exactly is State Farm
> selling?**

---

## 2. Setting

**Alder County, 2036.** Invented. ~14,200 households in the wildland-urban
interface, one investor-owned utility, four fire districts, one ridge system
cut by one canyon (Mill Creek) with one road out.

Invented because the alternative is worse. Emberwatch replays a real event —
the January 2025 Pacific Palisades fire — and is strong for it. Attaching
invented network performance to a real fire would attribute an avoided outcome
to a system that did not exist. A named county would make a claim about a real
place's insurability. So: a county that announces itself as invented, twice on
screen, and never once carries a real company's name against an invented
figure.

---

## 3. Actors

Seven, and the whole design of screens 2 and 4 is that you can tell them apart.

| Actor | Colour | Role in the network |
|---|---|---|
| Households | the ink | Consent on their own land, small dues. The reason the others are there. |
| The investor-owned utility | violet `#5B4E7A` | **The anchor tenant.** Line sensing, de-energisation, the largest share of the money. |
| Four fire districts | ember `#9E4A14` | Dispatch authority and command. Four vetoes, no single counterparty. |
| Alder County | green `#2F5A44` | Rights of way, burn permits, the convening authority, a financing vehicle. |
| The carrier | teal `#2F5E7C` | Verification, loss history, and filed terms. A minority payer. |
| Catastrophe capital | plum `#8A3450` | A resilience spread, and the attachment-point test that disciplines it. |
| Vendors | gold `#7A5A17` | Hardware, crews, aircraft. Commodity, and the research says so loudly. |

---

## 4. Mechanism

```
SEE            satellite · camera · ground sensor · line-fault sensor
   ↓
UNDERSTAND     corroboration across independent sources → verified ignition
   ↓           → spread model → what it reaches, and when
   ↓
ACT            utility de-energises · districts dispatch · autonomous
   ↓           suppression launches · one human decides evacuation
   ↓
VERIFY         what work happened, on which parcel, to what standard, when
   ↓
MEASURE        what changed, against what counterfactual
   ↓
UPDATE         rate, renewal, next season's work  ──┐
   └──────────────────────────────────────────────┘
```

Screen 3 makes one point and only one: **the network coordinates action, it
does not merely inform a decision.** Seven machine beats in sixteen minutes,
three of them independent corroborations before anything is actioned, and then
one human row that is the most prominent object on the screen — the duty chief
decides whether 320 homes evacuate and whether aircraft drop over occupied
parcels. The network cannot make either call. It can only put both in front of
her sooner, with three sources behind them.

---

## 5. Business-model hypothesis

**Prevention is affordable because the insurer is not the only beneficiary.**
If several parties capture avoided-loss value, several parties can pay.

An indicative participant structure, **ordered, not quantified**:

| Tier | Who | Because |
|---|---|---|
| **Potential lead funders** | Utility or infrastructure owner; public agency or municipality | The largest and most legally specific avoided costs sit here — ignition liability, evacuation, recovery. Both already spend at this scale, and much of it is rate-base recoverable or publicly financed. |
| **Co-funders and beneficiaries** | Insurer and reinsurer; property owners; lenders and resilience capital | They capture avoided loss but have weaker direct liability. Pooling across carriers is also the free-rider answer and the antitrust-safer structure. |
| **In-kind and operating participants** | Fire departments; technology providers; response operators | They contribute permission, command, capacity and deployment rather than cash. |

**No split is known or validated, and the prototype says so.** An earlier
version put six exact percentages on screen marked "illustrative"; they were
removed, because a labelled number still reads as knowledge. The ordering is
the claim: the parties carrying the largest direct liability have the
strongest reason to fund the infrastructure, **and an insurer need not be
among them.**

What makes it tangible on screen 4: *a regional agreement commissions delivery
and independent verification; carriers define what evidence could support
coverage capacity and terms.*

### The reframe the build arrived at

The utility's existing spend dwarfs anything an insurer would contribute —
5,000-mile undergrounding programmes, 650-camera fleets, hundreds of weather
stations, all with regulatory cost recovery behind them. So:

- **State Farm cannot be the funder of this network, and should stop trying.**
- **Money is the one thing the utility does not need from a carrier.** What it
  is short of is independent justification: defensible third-party evidence
  that an operational action was warranted. A utility cannot credibly produce
  that about itself.
- **Therefore the trade is evidence for access, not cash for data.** The
  carrier pays a minority share in cash and the rest in underwriting
  commitment — filed terms that improve on verified prevention. That is a
  currency only a carrier holds.

### The carrier's role, stated as verbs

Deliberately **not** an ownership thesis. The prototype's earlier framing —
"own the measurement" — was wrong twice over: it implied an exclusivity no
insurer in the record has ever secured, and verification performed by the
beneficiary is not verification.

- **Build:** little or nothing. The hardware is commodity and purchasable by
  anyone.
- **Partner:** grid action, dispatch and command, permits, capital structure,
  response capacity, fuel-reduction delivery.
- **Verify:** independently — by a party that is neither the payer nor the
  beneficiary. The carrier defines what evidence would matter; it does not
  grade its own homework.
- **Consume:** verified outcomes, as one input to risk estimates.
- **Underwrite:** translate that evidence into capacity and terms, where it
  holds up.

The hypothesis, framed as a hypothesis: **State Farm could become the carrier
that translates independently verified prevention outcomes into underwriting
capacity and terms**, and the potentially compounding asset is the operating
history connecting intervention → outcome → underwriting. Not proven, and a
mandate like Colorado's could make the translation step table stakes rather
than an advantage.

---

## 6. Why this is not Emberwatch

A reviewer should see this inside thirty seconds, and the differences are
structural rather than cosmetic.

| | Emberwatch | Resilience Grid |
|---|---|---|
| Unit | one policyholder, one property | one region, seven actors |
| Ground | a real place, real fire data, a tile basemap | an invented county, drawn, no tiles |
| State | four risk postures for a property | three insurability states for a market |
| Question | what is this household's risk right now | who pays to change the risk, and who learns from it |
| Protagonist | Jeff | nobody — the protagonist is the arrangement |
| Smallest thing on the map | one parcel | one settlement cluster |
| Ink | warm brown `#42382C` | cool graphite `#36414A` |
| Form | a 17-step replay of one event | six screens on one mechanism |
| What it argues | prevention protects a customer | prevention creates a market |

The most load-bearing of these is the fifth. **The ground deliberately will not
resolve an individual house.** The moment you can click one dwelling the
concept collapses back into household-centric risk management, so settlements
are drawn as masses and the smallest addressable object is a cluster.

---

## 7. Source-derived facts versus speculative assumptions

Full evidence in `research-notes.md`. The screens mark the two apart by form,
not by colour: an evidence line carries a `◆`, names its actors, and ends in a
year; everything without one is Alder County, 2036.

**On screen as fact — all verified in the backing pack:**

- 43 companies across twelve countries build these layers.
- Liberty Mutual and Tokio Marine backed Pano AI's $44M Series B (2025);
  American Family and Mercury backed BurnBot (2024, 2026).
- Chubb, Travelers and Aviva Canada send crews to defend insured homes.
- Tahoe Donner: premium cut 39%, deductible cut 84%, on *verified* fuel
  reduction (2025).
- Aspen Fire Protection District buys from Seneca, Pano AI and OroraTech at
  once, on foundation and donor money (2026).
- NCIUA's $600M cat bond returns a 0.35% resilience spread for FORTIFIED roofs
  if losses stay low; Hannover Re fronted it; a second bond repeats it.
- 22 of the top 25 US property insurers offer a wildfire mitigation discount;
  it averages ~$100 a year, about a tenth of the annualised cost of the work;
  three insurers dropped wildfire from rating rather than pay it.
- Baloise funded hail cloud-seeding with ETH Zurich 2018–2023 and ended it:
  the effect "has not been demonstrably measurable."
- Swiss Re bought Fathom outright rather than partner for its flood models.
- Across 17 insurer prevention deals on record, **none** gives the insurer
  exclusive rights to the data.

**On screen as speculation, hedged, inside the 2036 frame:**

- That coordinated cross-actor automatic response works at regional scale.
  *No integrated product exists; the pack found the pieces and no assembly.*
- That measured loss reduction would be real. *Every quantified prevention
  number available is modelled (RMS, Guy Carpenter) or from another peril
  (FORTIFIED in Hurricane Sally).*
- That cover could stay available as a result. Screens 5 and 6 use conditional
  verbs throughout; that is accuracy, not softening.
- The whole payer split on screen 4, marked "one possible model" and
  "illustrative shares".
- Every Alder County figure, on plates stamped invented.

**Never claimed anywhere:** a Seneca performance figure (the pack records
unresolved conflicts on its own payload and found no confirmed delivery or
real-fire use); any State Farm premium, withdrawal, book size or ZIP-code
decision; any named utility's liability figure; a response-time capability.

---

## 8. Open questions the prototype deliberately leaves

These are the client's to answer, and the prototype is built to make them
unavoidable rather than to resolve them.

1. **Would State Farm accept being a minority payer and a non-owner of the
   hardware in exchange for owning the measurement?** This is a posture
   decision about what business State Farm is in.
2. **Would State Farm demand exclusive or co-owned intervention-outcome data,
   and walk if a vendor refuses?** No insurer in the record has done this, and
   it is the highest-leverage choice in the concept.
3. **There is a real contradiction at the centre and the prototype displays it
   rather than engineering it away:** the moat requires exclusive outcome data,
   while the antitrust defence requires open, non-discriminatory network
   access. Both cannot be maximised.
4. **What liability is State Farm willing to assume for having acted?** Pricing
   risk and intervening in risk are different legal postures. The evidence base
   offers no statutory shelter, and this has no good answer without one.
5. **Why does the utility need a carrier at all?** It owns the poles, the
   sensors, the vegetation data, the operational authority and a rate base.
   There are at least two rival integrators visible in the evidence — the
   utility itself, and the broker (Aon embeds a prevention feed across *all*
   its Latin American forestry policies; the one verified community-mitigation
   policy, Tahoe Donner, was assembled by WTW, not a large admitted carrier).
6. **How much geographic concentration is acceptable in exchange for a
   protected region?** The Honeycomb note warns a concentrated book can draw
   reinsurer scrutiny after one bad season, and node one has no diversification
   answer.
7. **If it works, who gets the benefit** — policyholders, shareholders, or the
   public that financed a fifth of it?

---

## 9. Known weaknesses, stated plainly

- **The attribution problem is unresolved and is the deepest issue.** Screen 5
  says so. The honest fallback is to measure the observable chain — detection
  latency, time to verified ignition, containment acreage, structures within a
  radius — rather than to claim prevented catastrophes, and to attribute by
  threshold the way the NCIUA bond does rather than by narrative. The prototype
  shows the problem; it does not solve it.
- **The utility-needs-a-carrier argument is inference, not evidence.** Nothing
  in the pack shows a utility choosing an insurer as its verification partner.
- **The strongest *measured* prevention evidence in the entire pack is
  construction standards, not sensing or suppression** — FORTIFIED in Hurricane
  Sally, 55–74% fewer claims and 15–40% lower severity. A sceptic can fairly
  say the network is an expensive way to buy what a roof upgrade already buys.
  **This is now on screen 5**, as the question to answer first: *what
  incremental protection does the network provide beyond proven property
  hardening and fuel management?* The prototype poses it and does not answer
  it, which is the honest position.
- **Six screens is a lot of argument for a low-fidelity provocation.** Screen 4
  is the densest and is the one to cut first if the room needs it shorter.
