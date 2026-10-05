# Workshop prototype programme — plan

Six experiences, one argument. Main thread owns narrative, design system,
integration, quality bar, confidentiality and verification.

---

## 0. Blocking finding, recorded first

**The four named source drafts do not exist on this machine.**

Searched: the whole `IDEO/` tree, `~/Downloads`, `~/Desktop`, `~/Documents`,
`~/Library/Mobile Documents`, plus every `.html` modified since 2026-09-25.

| Named in brief | Found |
|---|---|
| `Home Again.html` | no |
| `The Negotiated Neighborhood.html` | no |
| `OpenCover-prototype.html` | no |
| `protected-purchasing-prototype.html` | no |
| current Resilience Grid prototype | **yes** — `snapshot/prototype/resilience-grid/` |
| prototype library | **yes** — `snapshot/index.html` (compiled) |
| latest design.md | **yes** — `fieldnotes/design.md` + `docs/resilience-grid/design.md` |

**Consequence.** Lanes B, C, E and F are built from the specification in the
brief itself — which gives goal, beats, and what must be visible for each —
not from the drafts. The concept and story may therefore diverge from the
drafts in wording and detail. Everything is structured so reconciliation is
cheap: content lives in one `SCREENS` array per prototype, so swapping in the
draft's language is an edit to data, not to layout.

**This is the single thing most needing human review.**

---

## 1. The spine

Each prototype is evidence for one step of the workshop argument.

```
A  OPENING        the customer is already becoming a different kind of buyer
B  HOME AGAIN     protection takes on the recovery work, not just the payout
C  NEGOTIATED     a group secures an arrangement no household could get alone
D  RESILIENCE GRID a business gets paid to change the risk
E  BACKED TO ACT  protection is what lets software be given authority
F  OPENCOVER      insurance designed from the outset for AI buyers
```

A and F are bookends: A asks "what happens when the customer delegates the
next step too?", F answers it.

B, C, D are an escalating ladder of *who the counterparty is*: one household,
a street, a region.

---

## 2. Per prototype

### A — Opening (`/prototype/first-move/`)
- **Purpose:** establish that AI already mediates insurance shopping.
- **Thesis:** the customer can already delegate the analysis; not yet the act.
- **Takeaway:** "AI can compare more than it can commit."
- **Screens:** 2. (1) a reconstruction of an AI shopping exchange; (2) the
  handoff where a human must take over, and the closing question.
- **Visible action:** the point where the assistant stops and a person signs.
- **Reuse:** plate/chrome system wholesale. No map ground — this one is a
  device-like surface, so it uses the `plate` system on a plain stock.
- **Factual status:** reconstruction, labelled. No real product named, no
  real quotes, no real prices.
- **Priority:** 7 of 8. Lowest — can remain a two-screen reconstruction.

### B — Home Again (`/prototype/home-again/`)
- **Purpose:** protection as delivery of an outcome, not a payment.
- **Thesis:** the claim is complete when you are home, not when you are paid.
- **Takeaway:** "They bought a rebuild, not a cheque."
- **Screens:** 3 — before loss / the commitment / activation.
- **One thought each:** (1) what was arranged in advance; (2) what the
  carrier is actually committing to, and what stays conditional; (3) what
  happens in the first days after a covered loss.
- **Visible:** replacement plan, secured builder capacity, temporary living,
  conditions, a named recovery lead.
- **Reuse:** plates, chrome, nav, type. New: a commitment card with
  conditions; a three-beat timeline.
- **Factual status:** wholly hypothetical, invented household, labelled.
- **Priority:** 2.

### C — Negotiated Neighborhood (`/prototype/negotiated/`)
- **Purpose:** collective bargaining creates an offer individuals cannot buy.
- **Thesis:** the threshold, not the premium, is the product.
- **Takeaway:** "Sixty households together are a different risk from sixty
  households separately."
- **Screens:** 3 — problem / conditional collective offer / agreement.
- **Visible:** participation threshold with live count, the improvements
  required, who finances them, what coverage is conditional on, verification.
- **Must differ from D:** C is *one street negotiating a policy*. D is *a
  region selling risk reduction as a service to many buyers*. C's output is an
  insurance contract; D's output is a business with revenue from non-insurers.
  Enforced by: different ground (street plan vs regional map), different
  counterparty, different artifact at the end.
- **Reuse:** micromutual's street-plan ground is the right metaphor and is
  already built — fork its geometry, not its content.
- **Priority:** 4.

### D — Resilience Grid (existing, align only)
- **Purpose:** a business gets paid to change the risk.
- **Gap to close:** revenue currently reads as insurer-avoided-loss. Must show
  utilities / public actors / communities purchasing *defined value*.
- **Do not rebuild.** Screen 4 is where the change lands.
- **Priority:** 6.

### E — Backed to Act (`/prototype/backed-to-act/`)
- **Purpose:** protection raises the authority a business will delegate.
- **Thesis:** the cover is what makes the permission grantable.
- **Takeaway:** "They let it act because a mistake is covered."
- **Screens:** 3 — task / authority / action.
- **Visible:** permitted actions, spend limit, what a covered mistake is,
  what stays the customer's responsibility, the consequential exception that
  returns to a human.
- **Hard constraint:** must read as an **AI provider's console**, not an
  insurance app. Insurance appears as a backing condition inside someone
  else's product.
- **Reuse:** plate system and chrome only. This is the one prototype allowed
  a different stock, because it is depicting another company's software —
  the same licence §9 gave Emberwatch's "one dark island".
- **Priority:** 3.

### F — OpenCover (`/prototype/opencover/`)
- **Purpose:** what an insurer must publish to be chosen repeatedly by an AI.
- **Thesis:** machine-readable terms and verifiable service, not a chatbot.
- **Takeaway:** "The buyer reads the policy. The buyer is not a person."
- **Screens:** 3 — human priorities and permissions / machine-readable offer
  compared / permitted purchase and ongoing machine-readable service.
- **Visible:** priorities set by a human, an offer as structured data with
  explicit exclusions and service commitments, a comparison the AI performs,
  the permission boundary on purchase or switch.
- **Reuse:** plate system. Needs one genuinely new component: a readable
  rendering of a structured offer document.
- **Priority:** 5.

---

## 3. Shared system — inherit, do not redesign

Source of truth: `fieldnotes/design.md` (publication) and
`docs/resilience-grid/design.md` (the 2036 prototype pattern).

Every new prototype forks `snapshot/prototype/resilience-grid/` for:
`--fs-base` sizing with the five text roles and their mobile floors; the
`.plate` system; `.screen` 12×8 grid with inline `grid-area`; narrow → flex
column + scroll, **never shrink-to-fit**; chrome (prev / content-labelled
picker / ink-pill next); arrow keys; `#s/<n>` hash; two `aria-live` regions;
the skip button; focus ring; radius scale; hairline-first elevation.

**Per-prototype stock** — same paper `#FBF9F1`, different ink, so the set
reads as one publication and the six are distinguishable:

| Prototype | Ink | Reads as |
|---|---|---|
| first-move | `#4A4A52` graphite-neutral | a screen |
| home-again | `#5A4632` warm timber | rebuilding |
| negotiated | `#3C5648` green | a street |
| resilience-grid | `#36414A` cool graphite | infrastructure |
| backed-to-act | `#2E3A44` + dark console surface | another company's software |
| opencover | `#44415C` violet-slate | machine terms |

All inks verified ≥ 7:1 on paper before use.

---

## 4. Routing and integration

- Each prototype: `snapshot/prototype/<slug>/{index.html,style.css,app.js}`.
- New: `snapshot/workshop/index.html` — a contact sheet of the six in running
  order, the single URL to share. The compiled library cannot host them
  (it is bound to the six pamphlet editions), so this is the integration
  surface for Milestone 7.
- No change to `prototype-cta.js` or the compiled library.

## 5. Validation (main thread, every prototype)

1. Confidentiality scan — repo-wide, all variants, plus deployed HTML/JS/meta.
2. Rendered-type audit at 360/390/430 — assert computed `font-size`, not CSS.
3. Contrast of every text element against its **rendered** background, in
   every state: normal, selected, unselected, inactive, overlay, tinted.
4. Layout: no clipping, no horizontal overflow, no overlap, desktop no-scroll.
5. Interaction: every control does what its label says; no dead controls.
6. Keyboard: skip link, tab order, visible focus, arrow keys, deep links.
7. Console clean.
8. Siblings untouched — `git diff` must be empty for them.
9. Becca bar: one beat per screen, visible action, no explanatory paragraph.
10. Fact bar: sourced, or labelled illustrative, or labelled hypothetical.
