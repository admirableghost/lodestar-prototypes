# Opening — The First Move

**Live** · https://fieldnotes-khaki-three.vercel.app/prototype/first-move/
**Commit** · `fc66e6c` (fc66e6ca5219dc1c71d4f2a50e8d4cff81e1953b)
**Captured from** · the deployed build at that commit, not from local files
**Edition ink** · #4A4A52

## Concept

An opening beat: an assistant that can read every policy in the market, and the one thing it still cannot do.

## Screen by screen — the thought each screen is meant to land

**1. Reading**
A person stopped reading policies herself. Something else reads them — fast, completely, and without getting tired.

**2. It cannot sign**
Reading is solved. Deciding and committing is not. The question the rest of the morning answers: what happens when the customer delegates the next step too?

## Key interactions

**Run it again**
Replays the reading pass so the room sees the speed rather than being told about it.

## What is factual and what is hypothetical

**Hypothetical**
- The person, the quotes and the garage-flood question are invented.

Every screen states, once and plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision is stated anywhere, and
no invented figure is attached to a real company's name.

## Known issues

- Two screens only — this is a framing device, not a mechanism. It is the shortest thing in the set by design.
- Screen 2 is static; its beat is the absence of an action, which is the point but makes it the least interactive frame in the deck.

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

**ipad-landscape** (3)
- `first-move-1-reading-ipad-landscape.png`
- `first-move-1-reading-run-ipad-landscape.png`
- `first-move-2-cannot-sign-ipad-landscape.png`

**ipad-portrait** (2)
- `first-move-1-reading-ipad-portrait.png`
- `first-move-2-cannot-sign-ipad-portrait.png`

**desktop** (2)
- `first-move-1-reading-desktop.png`
- `first-move-2-cannot-sign-desktop.png`

**mobile** (2)
- `first-move-1-reading-mobile.png`
- `first-move-2-cannot-sign-mobile.png`

**Contact sheet** · `first-move-contact-sheet-ipad.png`

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
