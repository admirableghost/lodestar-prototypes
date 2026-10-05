# Backed to Act

**Live** · https://fieldnotes-khaki-three.vercel.app/prototype/backed-to-act/
**Commit** · `fc66e6c` (fc66e6ca5219dc1c71d4f2a50e8d4cff81e1953b)
**Captured from** · the deployed build at that commit, not from local files
**Edition ink** · #2E3A44 on a dark console #1E242B

## Concept

Insurance as the thing that raises what an AI agent is allowed to do alone — cover moves the authority line, and the provider charges for the autonomy it unlocks.

## Screen by screen — the thought each screen is meant to land

**1. The task**
The agent can do the work. It cannot spend the money. Twenty-three orders drafted, none placed.

**2. The authority**
With a policy attached, the business raises what the agent may do alone and sets the number it may not pass.

**3. The action**
Four placed, one came back. One covered mistake, one escalation — returned to the same person who granted the authority.

## Key interactions

**Draft only / Act within cover / Act without limit**
Moves the spend limit from $0 to $25,000 per order, flips four permitted actions from "needs a buyer" to "agent acts" while the fifth deliberately does not, names who granted it, and raises the authority line drawn in the ground. The third stop is disabled with the reason on its face — the boundary has a ceiling insurance does not reach.

## What is factual and what is hypothetical

**Hypothetical**
- Halden, Calder Supply Co., Dana Ruiz, the agent, all prices and all performance are invented. The insurer is never named — only "an insurance partner".

Every screen states, once and plainly, that its content is invented. No real
insurer's premium, withdrawal, book or pricing decision is stated anywhere, and
no invented figure is attached to a real company's name.

## Known issues

- Screen 3 has no interaction; its escalation states the decision rather than letting you make it. If the walkthrough feels flat at the end, that is where to add something.
- Screen 2 sits at the four-plate ceiling — the densest screen in this deck.
- The ground’s geometry is tuned to the three desktop cameras; on a phone the authority line is often out of frame.

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
- `backed-to-act-1-cannot-spend-ipad-landscape.png`
- `backed-to-act-2-draft-only-ipad-landscape.png`
- `backed-to-act-2-act-within-cover-ipad-landscape.png`
- `backed-to-act-3-four-placed-ipad-landscape.png`

**ipad-portrait** (3)
- `backed-to-act-1-cannot-spend-ipad-portrait.png`
- `backed-to-act-2-draft-only-ipad-portrait.png`
- `backed-to-act-3-four-placed-ipad-portrait.png`

**desktop** (3)
- `backed-to-act-1-cannot-spend-desktop.png`
- `backed-to-act-2-draft-only-desktop.png`
- `backed-to-act-3-four-placed-desktop.png`

**mobile** (3)
- `backed-to-act-1-cannot-spend-mobile.png`
- `backed-to-act-2-draft-only-mobile.png`
- `backed-to-act-3-four-placed-mobile.png`

**Contact sheet** · `backed-to-act-contact-sheet-ipad.png`

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
