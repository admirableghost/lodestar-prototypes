# Fieldnotes — design system

Written by reading the built site, not a spec. Every value below was measured
from the running pages at <https://fieldnotes-khaki-three.vercel.app> or read
out of the shipped CSS and bundle. Where the original source would have said
something this cannot, that is marked.

The purpose is to let someone rebuild or extend the reader without the original
React source, which was not recoverable (no source maps shipped).

---

## 1. The governing idea

Every screen is **a printed pamphlet on a table**. Not a web page with print
styling — a fixed-size paper object, always 490 × 650 px, sitting in a larger
stage, with a paper grain, a spine and a printed footer. Browser chrome lives
outside the paper and never on it.

Three consequences run through everything:

- **The page never reflows.** Content is composed to the page, not laid out by
  it. There is no fluid grid inside the paper.
- **Navigation is turning a page,** not scrolling a document. Previous / Next /
  a page picker, plus arrow keys.
- **Each edition is its own printing,** with its own paper stock and ink. The
  shell is shared; the paper is not.

---

## 2. Tokens

### Application shell

Tailwind v4 base plus a small semantic layer. These govern the reader chrome
around the paper, not the paper itself.

| Token | Value |
|---|---|
| `--background` | `#F6F7F9` |
| `--foreground` | `#1C252B` |
| `--primary` | `#294A42` |
| `--primary-foreground` | `#FFFFFF` |
| `--border` | `#D9DEDF` |
| `--ring` | `#29584C` |
| `--muted` / `--muted-foreground` | `#E9EDEE` / `#626C71` |
| `--accent` / `--accent-foreground` | `#EDF0EF` / `#22382F` |
| `--radius` | `0.65rem` |

### Edition palettes

Each edition is a paper stock and an ink. Measured from `article.paper`:

| Edition | Paper | Ink | `--edition-ink` | `--edition-wash` |
|---|---|---|---|---|
| micromutual | `#FBFCF5` | `#293D31` | — | — |
| emberwatch | `#F9F5EC` | `#42382C` | — | — |
| employment | `#FBF9F1` | `#455764` | `#455764` | `#E4E9EB` |
| agent-liability | `#FBF9F1` | `#50506B` | `#50506B` | `#E9E7EC` |
| longevity | `#FBF9F1` | `#61533D` | `#61533D` | `#EBE5DA` |
| price-certainty | `#FBF9F1` | `#3D605D` | `#3D605D` | `#E0E9E5` |

Two things to notice. The four later editions share one paper (`#FBF9F1`) and
differentiate by ink alone, while the first two have their own stock — the
system tightened as it went. And only those four expose `--edition-ink` /
`--edition-wash` as variables; micromutual and emberwatch hard-code their
colours into bespoke page layouts. **If you extend this, follow the four, not
the two.**

Every ink is a desaturated near-neutral with a hue lean: green for
micromutual, warm brown for emberwatch and longevity, slate for employment,
violet-grey for agent-liability, teal for price-certainty. None is saturated.
The wash is the same hue at roughly 90% lightness, used for diagram fills.

### Cover treatment

Each cover is a photograph with a downward gradient to the paper colour, the
headline sitting in the faded top. Per-edition crop and fade, from the bundle:

| Edition | Crop | Fade stops |
|---|---|---|
| micromutual | `50% 100%` | `#f4f6e9` → transparent at 72% → `#172b2180` |
| emberwatch | `50% 100%` | `#f9f5ec` → transparent at 70% → `#30251970` |
| employment | `50% 0%` | `#fbf9f1` → transparent at 51% → `#16242d65` |
| agent-liability | `48% 12%` | `#fbf9f1` → transparent at 70%* → `#24233480` |
| longevity | `50% 0%` | `#fbf9f1` → transparent → `#30271970` |
| price-certainty | `50% 75%` | `#fbf9f1` → transparent → `#17332f80` |

The cover headline is stored as **an array of lines**, not a string — the break
points are authored, not computed. `["Safer homes.", "Stronger",
"neighborhoods.", "Together."]`. Preserve that if you rebuild; it is the
difference between a designed cover and a wrapped one.

\* approximate; read from the gradient string.

### Type

Two families, no webfonts. The system loads none, so this renders identically
offline and costs nothing.

| Role | Family | Size | Line height | Other |
|---|---|---|---|---|
| Page headline (`h2`) | Georgia, Times New Roman, serif | 35px | 37.8px (1.08) | weight 400, tracking −1.05 to −1.2px |
| Eyebrow (`.eyebrow`) | Arial, Helvetica, sans-serif | 9px | — | weight 600, tracking +1.26px, uppercase |
| Subhead (`h3`) | Arial | 13–15px | 1.25–1.5 | weight 500–600 |
| Body (`.body-copy`) | Arial | 15px | 22.5px (1.5) | |
| Footer (`.paper-footer`) | Arial | 12px | 18px (1.5) | |
| Brand mark (`.paper-brand`) | Arial | 12px | — | tracking −0.3px |

The pairing is the whole typographic idea: **a tight, negatively-tracked
Georgia headline against a small, widely-tracked Arial eyebrow**. The headline
is the only serif and the only large thing on the page. Everything else is
quiet 15px Arial.

Note the headline's line-height is below 1.1 — headlines are set as blocks, and
the authored line breaks matter.

---

## 3. Page anatomy

Every one of the 48 content pages shares one skeleton. These classes appear on
all 48:

```
article.paper.<edition>.<layout>
  .paper-grain          grain overlay, opacity 0.07
  .spine                the bound edge
  .paper-content
    .paper-brand > .brand-mark    edition wordmark, top of page
    .eyebrow                      "05 / A fence repair"
    h2.page-copy                  the headline
    .body-copy                    one short paragraph, sometimes two
    <the layout's own visual>
  .paper-footer                   the disclaimer, always present
```

The invariants are worth stating plainly, because they are what makes the set
feel like one publication:

- **Every page carries a footer disclaimer.** 48 of 48. It is not optional
  decoration; it is how the work stays honest about being a concept.
- **Every page has exactly one headline and one eyebrow.** The eyebrow numbers
  the page within its edition (`01 /`, `02 /` …).
- **The grain and the spine are on every page,** including covers.
- **Body copy is short.** One or two sentences before a visual takes over.

---

## 4. Layout types

48 content pages across six editions resolve into a small set of layouts, plus
per-page bespoke diagrams. Counts are across all six editions.

### Structural layouts (shared)

| Layout | Count | What it is |
|---|---|---|
| `cover` | 6 | Photo, gradient fade, authored multi-line headline |
| `photo` | 5 | Full-bleed photograph introducing the protagonist |
| `editorial` | 16 | Headline + body + a diagram; the workhorse |
| `trust` | 5 | The "before you commit" page — three boundary statements |
| `closing` | 6 | Wordmark, "A concept for tomorrow", final disclaimer |
| `art-edition` | 32 | Modifier marking the four later editions' shared art system |

Every edition runs the same arc: **cover → photo → three or four editorial
pages → trust → closing**, then a Discussion panel outside the pamphlet. That
arc is the product. It is why six unrelated insurance ideas read as one series.

### Bespoke diagram layouts

The first two editions name their diagrams after the subject; the four later
ones use an `art-*` convention. Same idea, tidier naming.

| Edition | Diagram layouts |
|---|---|
| micromutual | `layers`, `shared-project`, `number`, `claims` |
| emberwatch | `prepare`, `risk-portrait`, `drone`, `sprinklers`, `care-call`, `escape` |
| employment | `art-plan`, `art-steps`, `art-consent`, `art-support-paths` |
| agent-liability | `art-instruction`, `art-mismatch`, `art-response`, `art-permission-fork` |
| longevity | `art-horizon`, `art-timing`, `art-month` |
| price-certainty | `art-settlement`, `art-scope`, `art-cash-flow` (×2) |

Each is used once or twice. **These are illustrations, not components** — they
are drawn for one argument on one page. Do not try to generalise them into a
chart library; the value is that each says one thing exactly.

### Recurring sub-components

Measured by frequency inside `article.paper`:

| Class | Uses | Role |
|---|---|---|
| `.page-item` + `.item-number` | 23 | Numbered step or option in a list |
| `.story-visual` | 15 | The diagram container |
| `.page-items` | 8 | Wrapper for a step list |
| `.photo-visual` / `.page-image` | 7 / 6 | Photographic figure |
| `.cash-amount` / `.cash-stage` / `.cash-time` | 6 / 4 / 4 | Money figures in settlement diagrams |
| `.orbit-input` | 5 | Signal ring around a centre (emberwatch's risk portrait) |
| `.step-index` | 3 | Ordinal marker |
| `.allocation-mark` | 3 | Split/share marker |
| `.timing-track`, `.waiting-track`, `.paid-track`, `.resource-lane` | 2 each | Timeline bars |

Icons are **Lucide**, inlined as SVG (49 instances). No icon font, no runtime
fetch. Named uses include `house`, `eye`, `scale`, `lock-keyhole`, `flame`,
`trees`, `shield-check`, `messages-square`, `pause`, `arrow-right`,
`arrow-down`.

Elements actually used across all pages: `div` 401, `span` 231, `p` 160, `h2`
48, `footer` 48, `h3` 47, `figure` 17, `strong` 17, `img` 13, `table` cells 12,
`li` 6. **Tables are rare and lists are rarer** — nearly everything is a
composed diagram, not a list.

---

## 5. The reader shell

```
header.reader-header
  button.text-button          "Library"  — back to the collection
  .reader-edition-title       "Micromutual / Edition 01"
  .reader-header-actions
    a.reviewer-shortcut       "For reviewers" → #<edition>/review
    button.icon-button        close
.reading-stage                1178 × 1037 at 1280px wide
  .reader-document > .book > .base-page > article.paper
footer.reader-footer
  p.reading-hint              "Scroll for the full page ↓"
  nav.reader-navigation
    button.icon-button        previous
    label.page-picker > select
       "1 of 8 · The promise" … "8 of 8 · The larger idea", "Discussion"
    button.icon-button        next
  p.sr-only                   "Page 1 of 8. <headline>"
```

Two details worth keeping:

- **The page picker's option labels are content**, not indices: "3 of 8 · Policy
  + pool". A reader can jump by meaning. This is the single best navigational
  idea in the build.
- **The `sr-only` line announces page position and headline together.** Screen
  reader users get the same orientation sighted readers get from the picker.

### Library (home)

Six `.gallery-entry` cards, each `.cover-card > .cover-book > .gallery-cover`
carrying `.gallery-cover-photo`, `.gallery-cover-identity`, `.book-tag`,
`.theme-tag` and an `.open-pill`. The cards reuse `.brand-mark`, `.paper-grain`
and `.spine` from the paper — **the shelf is made of the same material as the
pamphlets**, which is why the transition into an edition reads as picking one up.

### Routing

Hash-based, entirely client-side: `#<edition>`, `#<edition>/page/<n>`,
`#<edition>/review`. No server routes exist — every path 404s on the origin.
This is why the site is trivially hostable as static files, and why it needs no
rewrite rules on Vercel.

---

## 6. Motion and interaction

- Transitions use Tailwind's defaults: `0.15s cubic-bezier(.4,0,.2,1)`, with
  `--ease-out` and `--ease-in-out` available.
- Page turns are driven by Previous / Next, the picker, and **arrow keys**
  (verified: ArrowRight advances).
- Images use `loading="eager"` and `unoptimized` with an explicit `onError`
  fallback that renders an "Image unavailable" placeholder with an icon. **Every
  image has a designed failure state** — worth preserving, given three covers
  are 2–3 MB.

---

## 7. What this costs

| | |
|---|---|
| Paper size | 490 × 650 px, fixed |
| Webfonts | none |
| Icon library | Lucide, inlined |
| CSS | 188 KB (Tailwind v4) + 1 KB page styles |
| JS | 545 KB across five chunks |
| Images | 13 files, 11 MB — three PNGs are 2–3 MB each |

The images dominate. If a rebuild wants a budget, that is the only line that
matters: converting the three PNGs to WebP or AVIF would cut the payload by
roughly two thirds with no visible change.

---

## 8. Rebuilding from this

If the reader is rebuilt from `content/`, these are the decisions worth
inheriting rather than re-litigating:

1. **Fixed-size paper.** Do not make it responsive. Scale the whole page down on
   small screens instead.
2. **The eight-page arc** — cover, photo, editorial ×3–4, trust, closing.
3. **Footer disclaimer on every page**, non-negotiable.
4. **Georgia headline against Arial eyebrow**, at the measured sizes.
5. **`--edition-ink` / `--edition-wash` per edition** over one shared paper.
6. **Content-labelled page picker.**
7. **Authored line breaks on covers.**

And these are worth reconsidering:

- Micromutual and emberwatch not using the edition-variable system. Bring them
  into it.
- 188 KB of Tailwind for a site that uses a handful of utilities.
- The image weights above.
- The `_next/` directory name, which is a Next.js artifact this site no longer
  needs, and which trips Jekyll on GitHub Pages (handled here with `.nojekyll`).

---

## 9. What is not in here

This describes the **built** artefact. It cannot tell you the component
boundaries the original author drew, their prop shapes, their naming intent, or
which choices were deliberate versus inherited from a template. Class names
suggest the seams but do not prove them. Anything above stated as measurement
is measured; anything stated as judgement is marked as such.
