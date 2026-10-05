# Build contract — every workshop prototype

Read this before writing a line. It is binding. The main thread verifies
every item independently and rejects work that misses any of them.

---

## 1. Confidentiality — zero tolerance

**The client's name must never appear in any artifact.** Not in copy, markup,
CSS, JS, comments, metadata, titles, filenames, directory names, slugs, JSON,
`aria-label`s, alt text, fixtures or docs.

The banned token is the client's two-word name. It is deliberately not
spelled out in this file, because this file lives in a public repository and
a "do not write X" list is still an instance of X. The scan pattern is:

```
/state[^a-z0-9]{0,2}farm/i
```

which catches the two words adjacent with any separator or none, in any
casing. Also banned: the initials used as a client shorthand.

Use instead: *the carrier*, *the insurer*, *an insurance partner*,
*a regional carrier*, *the incumbent insurer*.

This overrides any source draft. If a draft names the client, the draft is
wrong.

---

## 2. The product bar (Becca's)

Per screen:

- **one clear beat** — one idea, nothing else competing with it;
- **minimal copy** — a headline and at most two short sentences;
- **a visible action, choice or commitment** — something the viewer can see
  being decided, not described;
- explanation goes to voiceover, not onto the glass.

These are low-fidelity strategic prototypes that make a mechanism tangible,
walked through in a room in a couple of minutes. They are **not** end-to-end
product UX.

**If a screen needs narration to explain its basic mechanism, simplify the
screen.** Do not add a paragraph to rescue it.

Hard limits: ≤ 3 screens unless the plan says otherwise; no screen with more
than four text-bearing plates; no explanatory footnote paragraphs; no
interaction included because it was possible.

---

## 3. Inherit the system — do not redesign

Fork `snapshot/prototype/resilience-grid/` — `style.css` and `app.js` are the
reference implementation. Copy them and change the content, the ink and the
diagram; do not reinvent the scaffolding.

Inherit unchanged:

- **Sizing.** `--fs-base` and the five text roles `--t-body / --t-sub /
  --t-mid / --t-sec / --t-lab`, with their mobile floors.
- **`fitScreen()` must return early when narrow.** Phones scroll. Never
  shrink-to-fit on mobile — that defect cost a whole review cycle.
- **`.plate`** on `--paper`, radius scale 3/5/10, hairline-first elevation.
- **`.screen`** 12 cols × 8 rows, inline `grid-area`, narrow → flex column.
- **Chrome:** prev icon button, content-labelled `<select>` picker, ink-pill
  next. Arrow keys. `#s/<n>` hash with `replaceState`.
- **Accessibility:** skip *button* (never an anchor — an anchor rewrites the
  hash and throws the reader to screen 1), `#announce` and `#state-status`
  live regions, 2px focus ring, `tabindex="-1"` on every `.display`.
- Georgia display against Arial labels. No webfonts, no external requests,
  no images unless the plan says so.

Add a component only where the concept genuinely requires one, and comment
why in the CSS.

---

## 4. Never do this to state

- **No state is expressed by fading text.** Not `opacity` on a text block,
  ever. Use border, ground tint, a filled/hollow marker, and a *word* in a
  badge. Every state must survive greyscale.
- **No shrink-to-fit on mobile.** Scroll instead.
- Minimums on a phone: running copy ≥ 14px, secondary ≥ 12.5px, labels
  ≥ 11px. Nothing below 11px renders anywhere.

---

## 5. Facts

Every factual-looking claim is **sourced**, **labelled illustrative**, or
**labelled hypothetical**. No invented precision, no fabricated metrics, no
unsupported causality.

Prefer deleting a number to citing it. If the story does not need evidence,
do not put evidence on the glass.

Invented people, companies, places and figures are fine and expected — the
screen must say they are invented, once, plainly.

Never attach an invented figure to a real company's name. Never state a real
insurer's premium, withdrawal, book or pricing decision.

---

## 6. Deliverable

Exactly three shipped files in
`snapshot/prototype/<slug>/`: `index.html`, `style.css`, `app.js`.
Self-contained. No build step. No external request.

Content lives in **one data structure at the top of `app.js` or as the
sections of `index.html`** so copy can be swapped without touching layout.

Write nothing outside your own prototype directory. Run no git commands. Do
not deploy. Do not touch another prototype. The main thread integrates.

---

## 7. Self-check before you report

Run these and paste the real output in your report. Do not report "tests
pass" without evidence.

1. `node --check app.js`
2. Serve the snapshot dir and load the page; capture console errors.
3. At 1440×900 and at 360 / 390 / 430: every screen, assert computed
   `font-size` of every text element — report the **smallest rendered value**
   and where it is.
4. At the same widths: no clipping, no horizontal overflow, no overlapping
   plates, desktop does not scroll.
5. Every control: click it, confirm it does what its label says.
6. Keyboard: skip button, tab order, visible focus, arrow keys, `#s/2`.
7. Confidentiality: grep your directory for the banned strings; report the
   command and that it returned nothing.

Report honestly what is imperfect. A known flaw you name is fine; a flaw you
claim you fixed and did not is not.
