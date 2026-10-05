# Home Again

| | |
|---|---|
| **Live** | https://fieldnotes-khaki-three.vercel.app/prototype/home-again/ |
| **Commit** | `98bbf80` — 98bbf80c56ce294f427665dc7ec07279dfea14c9 |
| **Captured from** | the deployed build at that commit |
| **Folder** | `02-home-again` · live slug `home-again` |
| **Edition ink** | #5A4632 |
| **Screenshots** | 16 |

## Concept

A rebuild arranged before the loss: what is committed in advance, what stays conditional, and why a bigger cheque cannot substitute for a builder.

## Workshop role

Second. Moves the argument from money to recovery — what a policy could commit to while nothing is wrong.

## Screen sequence and the thought each screen must land

**01 · Before the loss**
The replacement plan, the builder and the recovery lead were all arranged while nothing was wrong.

**02 · What is promised**
The commitment and the conditions sit side by side, in cards of equal weight. The conditions are not a footnote.

**03 · The first days**
Five beats after the loss. Only the third is a claim.

## Key interactions

**As it stood / To current code / Code plus hardening**
Rewrites the fourth plan line and redraws the house — hardening adds sheathing, screened vents and a cleared edge.

**Show a regional event**
Fills every builder slot. Exactly one commitment degrades to "Falls back"; the other three are untouched. This is the argument that money does not shorten a queue.

**Replay from the start / Show all steps**
Drives the timeline and the ground through slab → scaffold → frame.

## Factual / illustrative / hypothetical

**Factual**
- No sum of money appears anywhere in the prototype — deliberately, so the argument cannot be read as a payout comparison.

**Illustrative**
- The eight-slot builder meter is an illustration of finite regional capacity, not a modelled figure.

**Hypothetical**
- Household, region, builder, recovery lead and every quantity are invented.

Every screen states once, plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision appears anywhere, and
no invented figure is attached to a real company's name.

## Product-risk assessment

It does show a route home rather than faster claims: the closing line is about being home, and step 4 is a builder slot being released, not a payment clearing. The capacity meter is the piece to watch — assessed as illustrative and labelled, not removed.

## Known issues

- The eight-slot capacity meter is the one countable invented quantity in the deck. It is marked hypothetical and carries no number in copy, but the scarcity argument depends on it and it is the closest thing here to invented precision.
- Map pins hide on a phone wherever a plate would cover them, so the mobile ground is unlabelled in some states.
- Roughly the lower third of screens 1 and 2 at desktop is open paper — an elevation drawing is blank below its ground line.

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

**ipad-landscape** (7)
- `home-again-01-plan-code-plus-hardening-ipad-landscape.png`
- `home-again-01-plan-as-it-stood-ipad-landscape.png`
- `home-again-01-plan-to-current-code-ipad-landscape.png`
- `home-again-02-promise-and-conditions-ipad-landscape.png`
- `home-again-02-regional-event-ipad-landscape.png`
- `home-again-03-first-days-ipad-landscape.png`
- `home-again-03-replay-part-way-ipad-landscape.png`

**ipad-portrait** (3)
- `home-again-01-plan-code-plus-hardening-ipad-portrait.png`
- `home-again-02-promise-and-conditions-ipad-portrait.png`
- `home-again-03-first-days-ipad-portrait.png`

**desktop** (3)
- `home-again-01-plan-code-plus-hardening-desktop.png`
- `home-again-02-promise-and-conditions-desktop.png`
- `home-again-03-first-days-desktop.png`

**mobile** (3)
- `home-again-01-plan-code-plus-hardening-mobile.png`
- `home-again-02-promise-and-conditions-mobile.png`
- `home-again-03-first-days-mobile.png`

Contact sheet: `contact-sheet-ipad.png` (also `home-again-contact-sheet-ipad.png`)

## NDA scan

```
patterns  /state[^a-z0-9]{0,3}farm/i
          — the client's two-word name: the words adjacent, with any separator
            or none, in any casing. The spellings are deliberately NOT listed
            here. This file is served publicly, and an enumeration of forbidden
            spellings is still an instance of the thing it forbids.
          — plus the initials when used as a client shorthand
scope     page copy · HTML · CSS · JS · comments · metadata · page title · URL slug
          filenames · folder names · aria-labels · this document · PNG metadata
          rendered text of every captured state
result    0 matches
```

Copy uses *the carrier*, *the insurer*, *an insurance partner*. Where an insurer
needed a name, an invented one is used.
