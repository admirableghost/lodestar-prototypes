# Backed to Act

| | |
|---|---|
| **Live** | https://fieldnotes-khaki-three.vercel.app/prototype/backed-to-act/ |
| **Commit** | `b95c1fa` — b95c1fa9dd616ee1650a692c083b91a2d3e5ba03 |
| **Captured from** | the deployed build at that commit |
| **Folder** | `05-backed-to-act` · live slug `backed-to-act` |
| **Edition ink** | #2E3A44 on a dark console #1E242B |
| **Screenshots** | 13 |

## Concept

Insurance as the thing that raises what an AI agent may do alone — cover moves the authority line, and the provider charges for the autonomy it unlocks.

## Workshop role

Fifth. Turns the lens from households to AI agents: insurance as an enabler of delegation.

## Screen sequence and the thought each screen must land

**01 · The task**
The agent can do the work. It cannot spend the money. Twenty-three orders drafted, none placed.

**02 · The authority**
With a policy attached, the business raises what the agent may do alone and sets the number it may not pass.

**03 · The action**
Four placed, one came back. One covered mistake, one escalation — returned to the person who granted the authority.

## Key interactions

**Draft only / Act within cover / Act without limit**
Moves the spend limit from $0 to $25,000 per order, flips four permitted actions from "needs a buyer" to "agent acts" while the fifth deliberately does not, names who granted it, and raises the authority line drawn in the ground. The third stop is disabled with its reason on its face — the boundary has a ceiling insurance does not reach.

## Factual / illustrative / hypothetical

**Factual**
- The insurer is never named, only ever "an insurance partner".

**Illustrative**
- The covered-versus-retained split illustrates a plausible boundary; the wordings are invented.

**Hypothetical**
- Halden, Calder Supply Co., Dana Ruiz, the agent, all prices and all performance are invented.

Every screen states once, plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision appears anywhere, and
no invented figure is attached to a real company's name.

## Product-risk assessment

ASSESSED, NOT CHANGED. Protection visibly changes delegation — the limit, four badges, the grant line and the drawn authority line all move together, which is the strongest single interaction in the set. It reads as native to an AI-provider product: vendor console, tenant workspace, agent id, and insurance never gets a plate of its own. Screen 3 ending without a decision is the highest-value optional addition in the whole set, but the deck is not broken without it: screen 2 carries the mechanism and screen 3 is its payoff.

## Known issues

- Screen 3 has no control — the only interaction in the deck is screen 2’s authority stop.
- Screen 2 sits at the four-plate ceiling; it is the densest screen in this deck.
- The ground geometry is tuned to the desktop cameras; on a phone the authority line is often out of frame.

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

**ipad-landscape** (4)
- `backed-to-act-01-cannot-spend-ipad-landscape.png`
- `backed-to-act-02-draft-only-ipad-landscape.png`
- `backed-to-act-02-act-within-cover-ipad-landscape.png`
- `backed-to-act-03-four-placed-ipad-landscape.png`

**ipad-portrait** (3)
- `backed-to-act-01-cannot-spend-ipad-portrait.png`
- `backed-to-act-02-draft-only-ipad-portrait.png`
- `backed-to-act-03-four-placed-ipad-portrait.png`

**desktop** (3)
- `backed-to-act-01-cannot-spend-desktop.png`
- `backed-to-act-02-draft-only-desktop.png`
- `backed-to-act-03-four-placed-desktop.png`

**mobile** (3)
- `backed-to-act-01-cannot-spend-mobile.png`
- `backed-to-act-02-draft-only-mobile.png`
- `backed-to-act-03-four-placed-mobile.png`

Contact sheet: `contact-sheet-ipad.png` (also `backed-to-act-contact-sheet-ipad.png`)

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
