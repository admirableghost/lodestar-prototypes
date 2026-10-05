# Opening — The First Move

| | |
|---|---|
| **Live** | https://fieldnotes-khaki-three.vercel.app/prototype/first-move/ |
| **Commit** | `b95c1fa` — b95c1fa9dd616ee1650a692c083b91a2d3e5ba03 |
| **Captured from** | the deployed build at that commit |
| **Folder** | `01-opening` · live slug `first-move` |
| **Edition ink** | #4A4A52 |
| **Screenshots** | 9 |

## Concept

An assistant that can read every policy in the market, and the one thing it still cannot do.

## Workshop role

Opens the session. Establishes the present tense — what already happens today — before anything speculative is shown.

## Screen sequence and the thought each screen must land

**01 · Reading**
She already delegates the reading. Something compares everything, in seconds, without getting tired.

**02 · It cannot sign**
Reading is solved; committing is not. Closes on the question the rest of the morning answers: what happens when the customer delegates the next step too?

## Key interactions

**Run it again**
Replays the reading pass, so the room sees the speed rather than being told about it.

## Factual / illustrative / hypothetical

**Factual**
- Nothing on screen is presented as a real market fact.

**Illustrative**
- The comparison pass is an illustration of capability that exists today, not a measured benchmark.

**Hypothetical**
- The person, her quotes and the garage-flood question are invented.

Every screen states once, plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision appears anywhere, and
no invented figure is attached to a real company's name.

## Product-risk assessment

Reads as current-state AI shopping, and the handoff is explicit rather than implied. The closing question is a direct setup for OpenCover — the bookend only works if this is walked first.

## Known issues

- Two screens only. It is a framing device, not a mechanism — deliberately the shortest thing in the set.
- Screen 2 has no control. Its beat is the absence of an action, which is the point, but it makes the closing frame static.

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

**ipad-landscape** (3)
- `first-move-01-reading-ipad-landscape.png`
- `first-move-01-reading-run-ipad-landscape.png`
- `first-move-02-cannot-sign-ipad-landscape.png`

**ipad-portrait** (2)
- `first-move-01-reading-ipad-portrait.png`
- `first-move-02-cannot-sign-ipad-portrait.png`

**desktop** (2)
- `first-move-01-reading-desktop.png`
- `first-move-02-cannot-sign-desktop.png`

**mobile** (2)
- `first-move-01-reading-mobile.png`
- `first-move-02-cannot-sign-mobile.png`

Contact sheet: `contact-sheet-ipad.png` (also `first-move-contact-sheet-ipad.png`)

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
