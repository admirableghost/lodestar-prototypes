# Resilience Grid — how this is built

Speculative prototype for the IDEO / State Farm futures discussion.
A regional wildfire protection network in 2036, told from the region rather
than from one house.

---

## Where it lives

```
fieldnotes/snapshot/prototype/resilience-grid/
  index.html        the six screens, as markup
  style.css         tokens, layout, nine new components
  app.js            the county drawing, the camera, the engine
  design.md         the implementation contract — read before changing anything
  concept.md        thesis, actors, business model, open questions
  research-notes.md the evidence contract — nothing on screen outranks this
  README.md         this file
```

Served at `/prototype/resilience-grid/` on the Fieldnotes origin.
It is a **standalone route**. It is deliberately *not* wired into
`snapshot/prototype-cta.js`, which maps the six pamphlet editions to their
prototypes — Resilience Grid has no pamphlet, and hanging it off the Emberwatch
edition would attach it to the one concept it must not be mistaken for. Share
the direct link.

## How to run it

Three static files, no build step, no dependencies, no external request.

```bash
cd fieldnotes/snapshot
python3 -m http.server 8000
# then open http://127.0.0.1:8000/prototype/resilience-grid/
```

`file://` mostly works too; only `history.replaceState` is unavailable there,
and it is wrapped in a `try`.

Deploying the whole site (from the repo root, and **only** this way — a git
push publishes nothing):

```bash
npx vercel deploy --prod --yes
```

## Where the content lives

All of it is in `index.html`. There is no data file and no CMS, matching the
four sibling 2036 prototypes. Three things are in `app.js` instead, because
script has to agree with them:

- `CTA[]` — the forward-button label per screen.
- `PIN_SETS{}` — the map labels per screen, in world coordinates.
- The county itself — `CREST`, `CREEK`, `LINE`, `LATERAL`, `ROAD`,
  `SETTLEMENTS`, `NODES`, `IGNITION`, and the `CAM` / `CAM_N` rectangles.

To add a screen: add a `<section class="screen" data-screen data-label
data-cam data-veil>`, place its plates with inline `grid-area` on the 12 × 8
grid, add a `CTA` entry and, if it needs them, a `PIN_SETS` entry. The picker,
the keyboard nav, the announcer and the auto-fit pick it up with no other
change.

## What is inherited

Forked from `prototype/micromutual/`, which is the reference implementation of
the 2036 pattern. Taken unchanged:

- **The ground-is-the-page layout.** A fixed `.world` SVG inset past all four
  edges, an opaque `.plate` for every word, a pointer-transparent `.deck`, a
  per-screen `.veil`, and `.pins` projected from world coordinates.
- **The one-unit sizing system.** `--fs-base` clamped against viewport height,
  every length a multiple of it, and a per-screen `--fit` that app.js lowers by
  binary search until nothing leaves the stage. `spills()` and `fitScreen()`
  are verbatim. Do not weaken them.
- **The chrome.** Floating prev / content-labelled picker / ink-pill next, with
  arrow keys, `#s/<n>` deep links and an `aria-live` announcer.
- **The narrow behaviour.** `.screen` becomes a scrolling flex column, grid
  areas drop, `.gw` becomes the window the county shows through.
- From the publication (`fieldnotes/design.md`): the shared later-edition paper
  `#FBF9F1`, Georgia-against-Arial with no webfonts, authored headline line
  breaks, the content-labelled picker.
- From Emberwatch (`design.md` §9): the ink pill as primary action, the focus
  ring, the halved radius scale, hairline-first elevation, the 13%-alpha fill
  rule, and colour-never-alone.

Five of the seven actor colours are Micromutual's own semantic values doing a
new job.

## What is new

A new ink — `#36414A`, cool graphite — so it cannot be confused with
Emberwatch's warm brown. One new colour, `--capital`. `--fire` is Emberwatch's
amber driven down until it clears AA on the wash as well as the paper.

Nine components, each drawn for one argument on one screen:

| Class | Screen | What it is |
|---|---|---|
| the county drawing | all | ridge, canyon, line, districts, clusters, nodes |
| `.gauge` | 1, 6 | regional insurability as a direction, not a score |
| `.layers` / `.cap` | 2 | the four-rail network stack |
| `.tl` | 3 | the event timeline, with corroboration and human rows |
| `.xchg` / `.share` | 4 | the value exchange and who actually pays |
| `.opb` | 4 | own / partner / buy |
| `.loop` | 5 | the five-stage operating loop |
| `.counter` | 5 | the documented prevention failure |
| `.fork` | 6 | without / with the network |
| `.sig` / `.aside` | 1, 4, 5, 6 | the evidence marker |

Plus **one new convention**: evidence versus scenario, marked by form rather
than by a seventh colour. A `◆`, named actors, a year, a wash ground and a left
bracket mean it actually happened. Everything else is Alder County, 2036, and
takes conditional verbs. See `design.md` §4.

## What must not change without re-reading the docs

- **No number goes on screen unless it is in `research-notes.md` §1–§2, or is
  an Alder County figure labelled illustrative on its own plate.**
- **No invented figure may carry a real company's name.**
- **The ground must never resolve an individual dwelling.** Settlements are
  masses. The moment one house is clickable this becomes Emberwatch.
- **The Baloise counter-example stays on screen 5**, next to Verify and
  Measure. A prototype arguing prevention creates insurability has to carry the
  case where funded prevention could not be shown to work.
