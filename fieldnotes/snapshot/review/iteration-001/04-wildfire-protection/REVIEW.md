# Wildfire Protection

| | |
|---|---|
| **Live** | https://fieldnotes-khaki-three.vercel.app/prototype/resilience-grid/ |
| **Commit** | `b95c1fa` — b95c1fa9dd616ee1650a692c083b91a2d3e5ba03 |
| **Captured from** | the deployed build at that commit |
| **Folder** | `04-wildfire-protection` · live slug `resilience-grid` |
| **Edition ink** | #2B3A42 |
| **Screenshots** | 26 |

## Concept

Prevention as market creation: a coordinated detection-to-suppression network whose product is not the hardware but a market that might stay open.

## Workshop role

Fourth and longest. The business-model centrepiece of the session.

## Screen sequence and the thought each screen must land

**01 · Priced precisely, increasingly unavailable**
Risk can be priced to the parcel and still withdraw from the market. Precision is not availability.

**02 · The network**
The technology already exists. What is missing is a standing agreement for who acts, who pays, and what evidence changes an insurance decision.

**03 · The moment**
Detection is not the product. Coordination is.

**04 · Paid to change the risk**
Four customers buying defined services. The insurer is one customer of four, not the funder of the other three.

**05 · Learning what works**
The drone is the easy part. Building the evidence record that says which interventions changed outcomes is the business.

**06 · A market that stays open**
If prevention is infrastructure that keeps difficult risks insurable, what is it worth?

## Key interactions

**Four layer chips + Show all four**
Switch a layer off and the ground loses that capability. Coordination is shown by subtraction.

**Replay from the start / Show all steps**
Runs the ignition timeline against the network.

## Factual / illustrative / hypothetical

**Factual**
- Pano AI and Seneca are named as real, existing capability categories. No figure, claim or partnership is attached to either.

**Illustrative**
- The layer model (see / understand / act / fund) is an illustrative decomposition, not an industry taxonomy.

**Hypothetical**
- Alder County, the carrier, the fund, the service prices and every figure on the glass are invented.

Every screen states once, plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision appears anywhere, and
no invented figure is attached to a real company's name.

## Product-risk assessment

ASSESSED, NOT CHANGED. At six screens this is roughly double the per-prototype budget for a 60–120s walkthrough; expect 150–200s cold. The causal spine is 1 → 2 → 4 → 6 (unavailability → the missing agreement → who pays for what → what it is worth). Screens 3 and 5 are elaboration: 3 makes coordination tangible, 5 carries the evidence/moat argument. If one screen must go, 3 is the removable one, because screen 2 already asserts coordination — but that removes the only concrete demonstration in the deck, so it is a product call, not a QA fix. The business model is the clearest in the set (screen 4 states the four customers explicitly).

## Known issues

- Six screens — twice the length of anything else in the set, and the main length risk for the room.
- Screen 5 is the densest frame in the whole set and the one most likely to need voiceover.

## Viewports tested

Tested against the **deployed** build before any screenshot was taken. The
harness asserts computed font-size, contrast against the composited rendered
background, touch-target size, clipping, overlap, horizontal overflow, console
errors, hover dependency, tablet chrome, bottom gesture-strip collisions and
narrative reading order.

| Class | Exact CSS px | Role | Result |
|---|---|---|---|
| iPad landscape | 1180 × 820 | **canonical review surface** | pass |
| iPad landscape, browser chrome | 1180 × 740 | primary, worst-case height | pass |
| iPad portrait | 820 × 1180 | primary | pass — scrolls, permitted |
| Desktop | 1440 × 900 | secondary | pass |
| Desktop | 1920 × 1080, 1280 × 720 | secondary | pass |
| Mobile | 390 × 844 | secondary | pass — scrolls |
| Mobile edge | 360 × 740, 430 × 932 | edge | pass — scrolls |

- Smallest rendered text anywhere: **11px** (uppercase eyebrow label); nothing below it at any viewport.
- No touch target below 44 × 44 CSS px.
- No shrink-to-fit on a narrow screen — narrow screens scroll.
- No state carried by faded text.
- No hover-only affordance.

## Screenshots

**ipad-landscape** (8)
- `resilience-grid-01-priced-unavailable-ipad-landscape.png`
- `resilience-grid-02-four-layers-ipad-landscape.png`
- `resilience-grid-02-see-only-ipad-landscape.png`
- `resilience-grid-03-the-moment-ipad-landscape.png`
- `resilience-grid-03-replay-part-way-ipad-landscape.png`
- `resilience-grid-04-paid-to-change-risk-ipad-landscape.png`
- `resilience-grid-05-learning-what-works-ipad-landscape.png`
- `resilience-grid-06-market-stays-open-ipad-landscape.png`

**ipad-portrait** (6)
- `resilience-grid-01-priced-unavailable-ipad-portrait.png`
- `resilience-grid-02-four-layers-ipad-portrait.png`
- `resilience-grid-03-the-moment-ipad-portrait.png`
- `resilience-grid-04-paid-to-change-risk-ipad-portrait.png`
- `resilience-grid-05-learning-what-works-ipad-portrait.png`
- `resilience-grid-06-market-stays-open-ipad-portrait.png`

**desktop** (6)
- `resilience-grid-01-priced-unavailable-desktop.png`
- `resilience-grid-02-four-layers-desktop.png`
- `resilience-grid-03-the-moment-desktop.png`
- `resilience-grid-04-paid-to-change-risk-desktop.png`
- `resilience-grid-05-learning-what-works-desktop.png`
- `resilience-grid-06-market-stays-open-desktop.png`

**mobile** (6)
- `resilience-grid-01-priced-unavailable-mobile.png`
- `resilience-grid-02-four-layers-mobile.png`
- `resilience-grid-03-the-moment-mobile.png`
- `resilience-grid-04-paid-to-change-risk-mobile.png`
- `resilience-grid-05-learning-what-works-mobile.png`
- `resilience-grid-06-market-stays-open-mobile.png`

Contact sheet: `contact-sheet-ipad.png` (also `resilience-grid-contact-sheet-ipad.png`)

## NDA scan

```
patterns  /state[^a-z0-9]{0,3}farm/i        (State Farm, StateFarm, statefarm, state-farm, state_farm, state.farm)
          initials used as a client shorthand
scope     page copy · HTML · CSS · JS · comments · metadata · page title · URL slug
          filenames · folder names · aria-labels · this document · PNG metadata
          rendered text of every captured state
result    0 matches
```

Copy uses *the carrier*, *the insurer*, *an insurance partner*. Where an insurer
needed a name, an invented one is used.
