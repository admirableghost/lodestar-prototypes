# Negotiated Neighborhood

**Live** · https://fieldnotes-khaki-three.vercel.app/prototype/negotiated/
**Commit** · `fc66e6c` (fc66e6ca5219dc1c71d4f2a50e8d4cff81e1953b)
**Captured from** · the deployed build at that commit, not from local files
**Edition ink** · #3C5648

## Concept

Sixty households on one street negotiating a single insurance contract: a participation threshold, financed improvements, conditional cover and independent verification.

## Screen by screen — the thought each screen is meant to land

**1. Acting alone**
One household did the work. The street set the price. Her result and her neighbours’ are identical: no offer.

**2. The conditional offer**
The offer exists and is conditional on the street. The threshold is the product.

**3. The agreement**
What all five parties actually signed. The product was never the premium — it was the forty-eighth signature.

## Key interactions

**Participation slider, 0–60**
Drag it and the street fills parcel by parcel. At 48 the offer flips from Not available to Available, and back below it. The threshold is marked on the track.

## What is factual and what is hypothetical

**Hypothetical**
- Thorn Lane, its sixty households, the carrier, the fund, the surveyor, the broker and every figure are invented.

**Grounded in something real**
- The hardening measures named (Class A roof, ember-resistant vents, five metres cleared to the boundary) are real, standard wildfire-mitigation requirements.

Every screen states, once and plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision is stated anywhere, and
no invented figure is attached to a real company's name.

## Known issues

- Commitment order gets tidy at high counts — by 52 the remaining holdouts sit as one block at the far end of the street.
- Screen 3’s household count clamps at 48 if the viewer advances with the slider below the threshold. Not false, but the clamp is silent.
- The mid-right of a wide window is bare hillside on screen 2 — the least-composed region in the deck.

## Viewports tested

Tested against the **deployed** build before these screenshots were taken. The
harness asserts computed font-size, contrast against the composited rendered
background, touch-target size, clipping, overlap, horizontal overflow and
console errors — a layout audit that does not assert on computed font-size is
not a readability audit.

| Class | Size | Result |
|---|---|---|
| **iPad landscape (primary)** | 1180 × 820 | pass |
| **iPad landscape, browser chrome** | 1180 × 740 | pass |
| **iPad portrait (primary)** | 820 × 1180 | pass — scrolls, as permitted |
| Desktop | 1920 × 1080, 1440 × 900, 1280 × 720 | pass |
| Mobile | 430 × 932, 390 × 844, 360 × 740 | pass — scrolls |

- Smallest rendered text anywhere: **11px** (uppercase eyebrow label).
- No text renders below 11px at any viewport. Running copy is ≥ 13px desktop, ≥ 14px phone.
- No touch target below 44 × 44px.
- Shrink-to-fit never engages on a narrow screen; narrow screens scroll instead.
- No state is carried by faded text.

## Screenshots

**ipad-landscape** (4)
- `negotiated-1-acting-alone-ipad-landscape.png`
- `negotiated-2-below-threshold-ipad-landscape.png`
- `negotiated-2-threshold-met-ipad-landscape.png`
- `negotiated-3-the-agreement-ipad-landscape.png`

**ipad-portrait** (3)
- `negotiated-1-acting-alone-ipad-portrait.png`
- `negotiated-2-below-threshold-ipad-portrait.png`
- `negotiated-3-the-agreement-ipad-portrait.png`

**desktop** (3)
- `negotiated-1-acting-alone-desktop.png`
- `negotiated-2-below-threshold-desktop.png`
- `negotiated-3-the-agreement-desktop.png`

**mobile** (3)
- `negotiated-1-acting-alone-mobile.png`
- `negotiated-2-below-threshold-mobile.png`
- `negotiated-3-the-agreement-mobile.png`

**Contact sheet** · `negotiated-contact-sheet-ipad.png`

## Confidentiality scan

Scanned: page copy, HTML, CSS, JS, comments, metadata, page title, filenames,
directory names, URL slug, accessibility labels, this document, the screenshot
filenames above and the rendered pixels of every screenshot.

```
pattern  /state[^a-z0-9]{0,2}farm/i   and the initials used as a client shorthand
result   0 matches
```

The client is never named. Copy uses *the carrier*, *the insurer*, *an
insurance partner*. Where an insurer needed a name, an invented one is used.
