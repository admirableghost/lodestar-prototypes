# OpenCover

**Live** · https://fieldnotes-khaki-three.vercel.app/prototype/opencover/
**Commit** · `fc66e6c` (fc66e6ca5219dc1c71d4f2a50e8d4cff81e1953b)
**Captured from** · the deployed build at that commit, not from local files
**Edition ink** · #44415C

## Concept

Insurance bought by an agent against stated priorities: the policy published as readable data, a permission boundary with a price limit, and renewal replaced by continuous performance.

## Screen by screen — the thought each screen is meant to land

**1. Set once**
Four stated priorities and a permission boundary. The visible commitment is granting it — the default is ungranted, deliberately.

**2. The offer as data**
Covered perils, exclusions and service commitments published so they can be read without being interpreted. Absent commitments print as explicit nulls.

**3. After the purchase**
A missed commitment pays a remedy automatically and re-opens the market. Renewal stops being a date.

## Key interactions

**Grant this permission**
Flips the boundary from NOT GRANTED to GRANTED and changes what screen 3 can do.

**Rank by my priorities / Rank by price**
Price-sorting puts the cheapest offer top and marks it "Fails 2 of 4" — and swaps the published document on the right, so the room sees the exclusion and the two nulls the price sort bought.

## What is factual and what is hypothetical

**Hypothetical**
- Meridian Mutual, Candlewick Direct, Pell & Roe Assurance, Rosa, and every price, commitment and performance figure are invented. No real insurer or AI provider is described.

Every screen states, once and plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision is stated anywhere, and
no invented figure is attached to a real company's name.

## Known issues

- Screen 2 on a phone is roughly 2.5 screenfuls of scroll — legible and unclipped, but the least walkthroughable frame on a handset. The document is the point, so it was not truncated.
- In greyscale the "meets" and "fails" fills are nearly the same tone; the ✓/× glyphs and word badges carry the distinction.
- Screen 3 has a large empty region at centre-left on a wide window.

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

**ipad-landscape** (5)
- `opencover-1-set-once-ipad-landscape.png`
- `opencover-1-permission-granted-ipad-landscape.png`
- `opencover-2-ranked-by-priorities-ipad-landscape.png`
- `opencover-2-ranked-by-price-ipad-landscape.png`
- `opencover-3-renewal-reopened-ipad-landscape.png`

**ipad-portrait** (3)
- `opencover-1-set-once-ipad-portrait.png`
- `opencover-2-ranked-by-priorities-ipad-portrait.png`
- `opencover-3-renewal-reopened-ipad-portrait.png`

**desktop** (3)
- `opencover-1-set-once-desktop.png`
- `opencover-2-ranked-by-priorities-desktop.png`
- `opencover-3-renewal-reopened-desktop.png`

**mobile** (3)
- `opencover-1-set-once-mobile.png`
- `opencover-2-ranked-by-priorities-mobile.png`
- `opencover-3-renewal-reopened-mobile.png`

**Contact sheet** · `opencover-contact-sheet-ipad.png`

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
