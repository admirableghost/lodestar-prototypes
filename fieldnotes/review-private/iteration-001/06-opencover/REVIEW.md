# OpenCover

| | |
|---|---|
| **Live** | https://fieldnotes-khaki-three.vercel.app/prototype/opencover/ |
| **Commit** | `b95c1fa` — b95c1fa9dd616ee1650a692c083b91a2d3e5ba03 |
| **Captured from** | the deployed build at that commit |
| **Folder** | `06-opencover` · live slug `opencover` |
| **Edition ink** | #44415C |
| **Screenshots** | 15 |

## Concept

Insurance bought by an agent against stated priorities: the policy published as readable data, a permission boundary with a price limit, and renewal replaced by continuous performance.

## Workshop role

Closes the session. Answers the question Opening asked — what happens when the customer delegates the next step too.

## Screen sequence and the thought each screen must land

**01 · Set once**
Four stated priorities and a permission boundary. The visible commitment is granting it; the default is ungranted, deliberately.

**02 · The offer as data**
Covered perils, exclusions and service commitments published so they can be read without being interpreted. Absent commitments print as explicit nulls.

**03 · After the purchase**
A missed commitment pays a remedy automatically and re-opens the market. Renewal stops being a date.

## Key interactions

**Grant this permission**
Flips the boundary from NOT GRANTED to GRANTED, and changes what screen 3 can do. The state persists across both navigation routes.

**Rank by my priorities / Rank by price**
Price-sorting puts the cheapest offer top and marks it "Fails 2 of 4" — and swaps the published document on the right, so the room sees the exclusion and the two nulls that the price sort bought.

## Factual / illustrative / hypothetical

**Factual**
- No real insurer, policy, price or AI provider is described anywhere.

**Illustrative**
- The machine-readable offer document illustrates a publishing format; the schema is invented.

**Hypothetical**
- Meridian Mutual, Candlewick Direct, Pell & Roe Assurance, Rosa, and every price, commitment and performance figure are invented.

Every screen states once, plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision appears anywhere, and
no invented figure is attached to a real company's name.

## Product-risk assessment

ASSESSED. This is AI-buyer-native rather than an AI skin on a normal insurer: the decisive evidence is that absent commitments are published as explicit nulls with their consequence, and that a failed priority defeats a cheaper price at any margin. Screen 2 stays efficient in iPad landscape — verified readable with no clipping — but it is the densest portrait screen in the set. The contrast with Opening is clear and deliberate, provided Opening is walked first.

## Known issues

- Screen 2 in portrait is the longest frame in the set — the offer document runs well below the fold and needs scrolling.
- In greyscale the "meets" and "fails" fills are nearly the same tone; the glyphs and word badges carry the distinction.
- Screen 3 has a large empty region at centre-left on a wide window.

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

**ipad-landscape** (6)
- `opencover-01-set-once-ipad-landscape.png`
- `opencover-01-permission-granted-ipad-landscape.png`
- `opencover-02-ranked-by-priorities-ipad-landscape.png`
- `opencover-02-ranked-by-price-ipad-landscape.png`
- `opencover-03-renewal-needs-you-ipad-landscape.png`
- `opencover-03-renewal-permitted-ipad-landscape.png`

**ipad-portrait** (3)
- `opencover-01-set-once-ipad-portrait.png`
- `opencover-02-ranked-by-priorities-ipad-portrait.png`
- `opencover-03-renewal-needs-you-ipad-portrait.png`

**desktop** (3)
- `opencover-01-set-once-desktop.png`
- `opencover-02-ranked-by-priorities-desktop.png`
- `opencover-03-renewal-needs-you-desktop.png`

**mobile** (3)
- `opencover-01-set-once-mobile.png`
- `opencover-02-ranked-by-priorities-mobile.png`
- `opencover-03-renewal-needs-you-mobile.png`

Contact sheet: `contact-sheet-ipad.png` (also `opencover-contact-sheet-ipad.png`)

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
