# Resilience Grid — verification record

> ## Pass 3 — 5 October 2026, after independent adversarial review
>
> **The previous QA in this file was wrong in a way worth recording.** It
> reported "CLEAN" across six screens and five viewports because it tested
> clipping, overlap, horizontal scroll and console errors — and never tested
> **rendered font size**. An independent reviewer found important text at
> 6–10px on mobile. They were right. Re-measuring found the smallest rendered
> label at **6.0px** and notes at **7.7px**, on every screen, at 360, 390 and
> 430px wide.
>
> Root cause: the inherited `--fit` binary search was running on narrow
> viewports. It exists so a non-scrolling desktop stage holds its content; a
> phone screen scrolls, so the search bought nothing and shrank everything to
> its 0.74 floor. `fitScreen()` now returns immediately when narrow, type
> takes hard per-role floors, and phones scroll.
>
> **Measured after the fix, at 360 / 390 / 430px, all six screens:**
> `--fit = 1` everywhere; smallest rendered text **11px** (uppercase labels and
> badges); notes and table cells **12.5px**; running copy **14px**+. Nothing
> renders below 11px anywhere.
>
> The lesson for the next pass: a layout audit that does not assert on
> computed `font-size` is not a readability audit.

> **Revision pass, 5 October 2026.** A surgical evidence-discipline revision
> touched screens 1, 2, 4, 5 and 6 — no new screens, no visual redesign, no
> change to the narrative architecture. Two components were removed (`.share`
> percentage bar, `.opb` own/partner/buy) and one added (`.tier`). Every suite
> below was re-run against the revised files and is reported post-revision.
> Confirmed zero dangling references to the removed components in both
> `index.html` and `style.css`.
>
> What changed, in one line each: screen 1 no longer claims cover is
> unavailable at any price; screen 2 no longer implies these parties have
> never interacted; screen 4 no longer shows invented funding percentages and
> no longer frames the carrier's role as ownership; screen 5 no longer says
> "prove the loss that did not occur" and now carries the
> hardening-versus-network challenge; screen 6's end state is "Potentially
> viable" with an explicit four-condition chain.

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
| 1 The problem | 1px | 0 |
| 2 The network | 54px | 108px |
| 3 The moment | 38px | 92px |
| 4 Why anyone pays | **377px** | **592px** |
| 5 The loop | 40px | 279px |
| 6 Market creation | 32px | 258px |

Screen 5 grew by roughly 130px at 360px wide because the revision added the
hardening-versus-network challenge to it. That is a deliberate trade: the
question is the single most useful objection in the deck.

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

## Pass 3 — what was verified, with evidence

**Rendered type** (`scratchpad/typeaudit.mjs`, 360/390/430 × 6 screens).
Before: `eyebrow 6.4px · gauge-stop 6.0px · note 7.7px · cap 7.7px · tl-time
7.7px`, `--fit` pinned at 0.74. After: `--fit = 1`, minimum 11px, notes
12.5px, body 14px+. Badge floors added at 11px for `.layer-state`, `.tl-kind`
and `.agr-n`. The 9px `text` the audit reports on screen 5 is inside
`#loop-svg`, confirmed `display: none` and `checkVisibility() === false` on
narrow — it is never rendered.

**No text fading, measured not assumed** (`scratchpad/states.mjs`). With two
layers switched off: layer `opacity: 1`, `.layer-what` colour
`rgb(54, 65, 74)` — full ink — and the "Off" badge `display: inline-block`.
Mid-replay, an unreached timeline row: `opacity: 1`, text colour full ink.
State is carried by border, ground tint, dot fill and a word.

**Interaction, each reproduced before and after:**

| Bug | Before | After |
|---|---|---|
| "All four" | Toggled — pressing it with all layers on switched them all **off** | Only ever restores. Label flips to "All four shown" and the button disables when there is nothing to restore |
| Replay labels | One button reading "Pause" while stopped, "Replay" while running | `Replay from the start → Pause → Resume → Pause`, plus a separate "Show all steps" that disables when all 8 are shown |
| Mobile Next name | `display:none` on the label left the accessible name as "→" | Label visually hidden but kept in the tree: accessible name is "See the network →" at 390px, confirmed |
| Skip link | `href="#deck"` rewrote the hash, the router read "no screen", user landed on **screen 1** | A button. From screen 5 it keeps hash `#s/5`, stays on screen 5, and moves focus to that screen's heading. Verified from a clean load at desktop and phone, starting on screens 1 and 5 |
| Unrecognised hash | `fromHash()` defaulted to 1, so any stray hash navigated away | Returns `null`; the handler ignores it |
| Map labels | Hidden only when *entirely* off-screen, so pins hung half off the edge | Hidden unless **wholly** inside the viewport |

**Assistive-tech state** — a second `aria-live="polite"` region (`#state-status`)
announces layer and replay changes, separate from the navigation announcer so
the two cannot overwrite each other. Verified: "See layer switched off.",
"Replay paused at step 1 of 8.", "All four layers shown."

**Layout** (`scratchpad/mobile.mjs` at 360/390/430, `qa.mjs` at five widths):
no clipping, no horizontal scroll, no console or page errors. Desktop
(1920/1440/1280) still never scrolls, `--fit = 1`.

**Visual** — read actual screenshots, not just assertions: all six screens at
1440×900, and all six at 390×844 captured at two to three scroll positions
each (`scratchpad/m/`), plus the layers-off and replay-paused states.

**Non-regression** — `git status` shows only this directory; `git diff` against
`emberwatch/`, `micromutual/`, `agent-liability/`, `longevity/`,
`price-certainty/`, `prototype-cta.js`, the shared `fieldnotes/design.md` and
the library `index.html` is empty.

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
6. **Tested in Chromium only.** No Safari or Firefox pass. `max()` in
   `font` shorthand and `checkVisibility()` are both well supported, but I
   have not confirmed them on WebKit.
7. **Mobile screens are now long.** With type at a readable size and no
   shrink-to-fit, screen 4 runs about 1,600px of scroll at 360×640 and screen
   3 about 960px. That is the correct trade — readable and scrollable beats
   complete and 6px — but screen 4 is two and a half screenfuls on a small
   phone and would benefit from being split or thinned if mobile becomes a
   primary viewing mode.
8. **The agreement is hypothetical and says so, but it is the one place the
   prototype invents institutional detail.** Clause 5's "commit in advance to
   reconsider" is the load-bearing idea and has no precedent in the evidence
   base — the NCIUA bond is the nearest thing and it is a different mechanism
   in a different peril.
7. **The FORTIFIED figures are the one place the revision added numbers.**
   55–74% fewer claims and 15–40% lower severity are verified in
   `research-notes.md` §2, but they come from a peer-reviewed study of a
   *different peril* (Hurricane Sally). The screen says "the best-measured
   prevention evidence anyone has is structural" rather than implying it
   transfers to wildfire. Worth a second read before Monday.
8. **"2 of 11 carriers still quoting new business freely"** is still an
   invented figure, and "freely" is doing real work in that sentence. It sits
   on a plate stamped invented, but a reader skimming could take it as a count
   of carriers in a real market.
