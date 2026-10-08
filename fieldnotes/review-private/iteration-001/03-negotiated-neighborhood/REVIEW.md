# Negotiated Neighborhood

| | |
|---|---|
| **Live** | https://fieldnotes-khaki-three.vercel.app/prototype/negotiated/ |
| **Commit** | `b95c1fa` — b95c1fa9dd616ee1650a692c083b91a2d3e5ba03 |
| **Captured from** | the deployed build at that commit |
| **Folder** | `03-negotiated-neighborhood` · live slug `negotiated` |
| **Edition ink** | #3C5648 |
| **Screenshots** | 14 |

## Concept

Sixty households on one street negotiating a single insurance contract: a participation threshold, financed improvements, conditional cover and independent verification.

## Workshop role

Third. The first prototype in which one household cannot act alone — introduces collective action before the network argument.

## Screen sequence and the thought each screen must land

**01 · Acting alone**
One household did the work. The street set the price. Her result and her neighbours’ are the same: no offer.

**02 · The conditional offer**
The offer exists and is conditional on the street. The threshold is the product.

**03 · The agreement**
What all five parties signed. The product was never the premium — it was the forty-eighth signature.

## Key interactions

**Participation slider, 0–60**
Drag and the street fills parcel by parcel. At 48 the offer flips from Not available to Available, and back below it. The threshold is marked on the track so the viewer can see what they are dragging toward.

## Factual / illustrative / hypothetical

**Factual**
- The hardening measures named — Class A roof, ember-resistant vents, five metres cleared to the boundary — are real, standard wildfire-mitigation requirements.

**Illustrative**
- The financing route (a resilience fund repaid on the property bill, the charge staying with the house) illustrates an existing mechanism type; the terms are invented.

**Hypothetical**
- Thorn Lane, its sixty households, the carrier, the fund, the surveyor, the broker and every figure are invented.

Every screen states once, plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision appears anywhere, and
no invented figure is attached to a real company's name.

## Product-risk assessment

The slider is now a 44px drag target with the threshold marked on the track and the state flip verified in both directions — intuitive on a held iPad. It is clearly distinct from Wildfire Protection: the smallest object here is one household and you can count all sixty, against a region there.

## Known issues

- Commitment order gets tidy at high counts — by 52 of 60 the remaining holdouts sit as one block at the far end of the street.
- Screen 3’s household count clamps at 48 if the viewer advances with the slider below the threshold. Not false, but the clamp is silent.
- The mid-right of a wide window is bare ground on screen 2 — the least-composed region in the deck.

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

**ipad-landscape** (5)
- `negotiated-01-acting-alone-ipad-landscape.png`
- `negotiated-02-below-threshold-ipad-landscape.png`
- `negotiated-02-threshold-met-ipad-landscape.png`
- `negotiated-02-every-household-ipad-landscape.png`
- `negotiated-03-the-agreement-ipad-landscape.png`

**ipad-portrait** (3)
- `negotiated-01-acting-alone-ipad-portrait.png`
- `negotiated-02-below-threshold-ipad-portrait.png`
- `negotiated-03-the-agreement-ipad-portrait.png`

**desktop** (3)
- `negotiated-01-acting-alone-desktop.png`
- `negotiated-02-below-threshold-desktop.png`
- `negotiated-03-the-agreement-desktop.png`

**mobile** (3)
- `negotiated-01-acting-alone-mobile.png`
- `negotiated-02-below-threshold-mobile.png`
- `negotiated-03-the-agreement-mobile.png`

Contact sheet: `contact-sheet-ipad.png` (also `negotiated-contact-sheet-ipad.png`)

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
