# Resilience Grid — verification record

What was actually tested, by whom, and what is still imperfect.
Run with Playwright/Chromium against the real built files over a local HTTP
server, plus a visual pass on rendered screenshots. Date: 4 October 2026.

---

## 1. Automated layout audit — PASS

Script: `scratchpad/qa.mjs`. For each of six screens at each of five
viewports (30 combinations), with the real stylesheet and the real script:

| Check | Method | Result |
|---|---|---|
| Content outside the stage box | every `.screen` child's rect vs the padded screen box | **0** |
| Two opaque plates overlapping | pairwise rect intersection of all screen children | **0** |
| Text clipped by its own box | `scrollHeight > clientHeight` on every non-visible-overflow element with text | **0** |
| Horizontal page scroll | `documentElement.scrollWidth > innerWidth` | **0** |
| Console / page errors | `console` + `pageerror` listeners | **0** |

Viewports: 1920×1080, 1440×900, 1280×720, 390×844, 360×640.

**Desktop never scrolls** — `--fit` stays at 1 on all three desktop sizes.

## 2. Measured narrow-viewport scroll — PASS with a noted cost

On a phone the inherited design lets `.screen` scroll once `--fit` reaches its
0.74 floor. Measured overflow beyond one screenful:

| Screen | 390×844 | 360×640 |
|---|---|---|
| 1 The problem | 0 | 1px |
| 2 The network | 9px | 63px |
| 3 The moment | 38px | 92px |
| 4 Why anyone pays | **315px** | **541px** |
| 5 The loop | 1px | 147px |
| 6 Market creation | 0 | 193px |

Everything is reachable; nothing is severed. Screen 4 is the outlier because
it carries a seven-row exchange table plus three more plates, and on a phone
`--fit` is pinned at the 0.74 floor. This is the designed fallback, not a
defect, but it is the screen to thin first if it is ever shown on a phone in
anger.

## 3. Interaction — PASS

Script: `scratchpad/interact.mjs`.

- Boot lands on screen 1.
- `ArrowRight` / `ArrowLeft` advance and retreat.
- Picker jumps to any screen and writes `#s/4` to the hash.
- Deep link `#s/5` loads screen 5 directly.
- Forward-button label changes per screen ("Find the hard part" on 4).
- Layer chips toggle: switching ACT off sets `data-on="0"` and
  `aria-pressed="false"`, and rewrites the caption to "Without a response, the
  rest of it is an expensive way to watch." Switching ACT **and** FUND off
  gives "Without a response and a payer…". "All four" restores.
- Timeline shows **8 of 8 rows at rest**; "Replay the ignition" resets to 1 and
  animates back to 8.
- **Leaving screen 3 mid-run stops the clock** — verified by navigating away
  during a run and confirming no further state change.

## 4. Accessibility — PASS

Script: `scratchpad/a11y.mjs`.

- Tab order from a clean load: skip link → picker → next. The skip link is
  first and becomes a visible 130×41 plate on focus.
- Focus ring present (2px outline) on the primary control.
- `aria-live` announcer reads position plus headline.
  **Fixed during QA:** headlines are authored as one `<span>` per line, so
  `textContent` ran them together — "Priced to the parcel.Unavailable at any
  price." The announcer now joins spans with a space.
- Heading structure: one `h1`, five `h2`, in order.
- The county SVG carries a descriptive `role="img"` / `aria-label`; decorative
  layers (`.veil`, `.pins`, `.gw`) are `aria-hidden`.
- `prefers-reduced-motion: reduce` honoured — all transitions off, camera jumps
  instead of easing, screen 3 still renders all 8 rows, no errors.

## 5. Contrast — PASS, computed not eyeballed

Every token measured against the actual paper `#FBF9F1`, and against the wash
and the 13% fills, with a WCAG relative-luminance script:

| Token | on paper | on wash | on own fill |
|---|---|---|---|
| `--edition-ink` `#36414A` | 9.90 | 8.42 | — |
| `--ink-soft` `#5C6872` | 5.42 | 4.61 | ≥4.64 |
| `--carrier` `#2F5E7C` | 6.61 | 5.63 | — |
| `--utility` `#5B4E7A` | 7.08 | 6.02 | — |
| `--fire` `#9E4A14` | 5.79 | 4.92 | 5.08 |
| `--public` `#2F5A44` | 7.47 | 6.36 | — |
| `--vendor` `#7A5A17` | 6.03 | 5.13 | — |
| `--capital` `#8A3450` | 7.41 | 6.31 | — |
| `--alarm` `#A33322` | 6.52 | 5.55 | 5.57 |

**Caught and fixed during the design pass:** `--fire` started as Emberwatch's
"Prepare" amber `#B4551A`, which is 4.68 on paper but **3.98 on the wash** and
**4.00 on its own fill** — below AA, and this prototype puts actor-coloured
type on both. Driven down to `#9E4A14`, which clears everywhere.

Two measured constraints are recorded in `design.md` and honoured in the CSS:
`--rule` (2.90) is never type, and `--wash-2` (4.10 against ink-soft) carries
no text.

## 6. Evidence audit — PASS

Every figure and every organisation name on screen, extracted by grep and
checked against `research-notes.md`:

- **Verified figures:** $44M, $600M, 0.35%, 39%, 84%, $100, 500,000, 22 of the
  top 25, forty-three companies, twelve countries, seventeen deals,
  2018–2023/October 2024 (Baloise). All in §1–§2.
- **Invented figures:** 14,200 / 2 of 11 / 1 in 3 / 320 homes / all 14:xx
  times / all six payer shares. Each sits on a plate carrying "illustrative"
  or "invented", and screens 1 and 6 both carry the standing disclosure.
- **Organisations named:** Pano AI, Technosylva, Seneca, Hannover Re,
  OroraTech, BurnBot, Swiss Re, Fathom, Baloise, ETH Zurich, Liberty Mutual,
  Tokio Marine, American Family, Mercury, Chubb, Travelers, Aviva Canada,
  Tahoe Donner, NCIUA, Aspen Fire Protection District, Resources for the
  Future. All appear in §1–§2.
- **No invented figure carries a real company's name.**
- **No Seneca performance claim** anywhere — Seneca appears once, as one chip
  on one rail.
- **State Farm is never named on screen.** The carrier is "the carrier". Naming
  a real insurer inside an invented county is precisely what §6 forbids; the
  attribution lives in `concept.md`, which is internal.

## 7. Non-regression — PASS

`git status --porcelain` shows exactly one entry:
`?? fieldnotes/snapshot/prototype/resilience-grid/`

`git diff HEAD` against `emberwatch/`, `micromutual/`, `agent-liability/`,
`longevity/`, `price-certainty/`, `prototype-cta.js` and `fieldnotes/design.md`
returns empty. **No existing prototype, shared script or shared document was
touched.** The new prototype is additive and its only shared dependency is
`../../favicon.svg`, which it reads and does not modify.

---

## What is still imperfect

1. **Screen 4 on a small phone is a 540px scroll.** Reachable, legible, at the
   `--fit` floor. It is the densest screen in the deck and the first to thin.
2. **The loop ring's arrowheads are slightly uneven** at small sizes — the arcs
   are drawn with a fixed angular pad rather than a per-radius one. Visible
   only if you look for it; invisible at phone width because the ring is
   replaced by the vertical chain.
3. **Network node glyphs in the "off" state** (16% opacity) can read as faint
   artefacts on screens 1 and 6, where the ACT layer is not lit. Minor, and
   arguably correct — the infrastructure exists but is not in play.
4. **No automated contrast assertion on rendered pixels.** The ratios in §5 are
   computed from the tokens, and every word sits on a known opaque plate by
   design, so composited contrast equals token contrast. But I did not
   screenshot-sample glyph runs to prove it, which is the only way to be
   certain on a page with a drawn ground underneath.
5. **Not wired into the library page.** Deliberate — see README — but it means
   the prototype is only reachable by direct link.
6. **The strongest counter-argument is not on screen.** The best *measured*
   prevention evidence in the whole backing pack is FORTIFIED construction
   standards, not sensing or suppression. A sceptic can say the network buys
   expensively what a roof upgrade already buys. `concept.md` §9 records this;
   a later pass should put it on screen 5 beside Baloise.
7. **Tested in Chromium only.** No Safari or Firefox pass.
