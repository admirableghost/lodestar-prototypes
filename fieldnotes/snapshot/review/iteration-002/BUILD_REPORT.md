# BUILD_REPORT — iteration-002

**Completed** 2026-10-06 11:11:26 UTC
**Prototype-source commit** `2e698dfe933a5cd35cac44581c56630f27a5a3a1`
**Live root** https://fieldnotes-khaki-three.vercel.app

## Scope

Three targeted changes, specified by the reviewer. No concept rebuilt, no
family redesign. Everything else was verified unchanged rather than assumed.

## What changed

### 1 · Wildfire Protection — six screens to five

The loop screen ("The drone is the easy part. Learning what works is the
business.") is removed. Its load-bearing sentence is folded into the
business-model screen as a **note**, not a third body line, so no remaining
screen is denser:

> What is done, and what follows, becomes the evidence record. If risk cannot
> be shown to change, underwriting has no reason to change.

The causal spine is intact and now runs without a detour:

1. priced precisely / increasingly unavailable
2. the standing network and agreement
3. live coordination during the event
4. the business model and who pays
5. the market stays open / underwriting outcome

Navigation renumbered, picker rebuilt to five, final screen eyebrow 05 → 04,
the forward-label list shortened, the per-screen draw remapped. The `drawLoop`
painter, the `loop` camera and 1,869 bytes of loop CSS were removed with it.
No replacement screen was added.

**What was traded:** the five-stage verify/evaluate diagram is gone, so the
evidence argument is now asserted rather than shown. The facilitator carries
what the picture used to.

### 2 · Home Again — no counted capacity on screen 1

The eight-cell builder meter and its legend are removed. Eight cells assert a
regional capacity nobody could know. The mechanism is preserved qualitatively:

- a reservation stamp, **Reserved against this plan**, with a filled marker
- one line: builders who can work to this standard are scarce in the region,
  and most households have no one held in advance

No second number was introduced. The rebuild-standard choice, the named
recovery lead and screens 2–3 are untouched; the orphaned legend CSS was
removed.

### 3 · Backed to Act — the deck ends on a decision

Screen 3 now closes with a question rather than a statement:

> After seeing this outcome, what should happen to the autonomy boundary?

Three answers — Keep it, Narrow it, Expand it — **with nothing preselected**,
so the screen opens on an unanswered question and the facilitator takes the
hands. Each answer returns one sentence that opens an argument; none confirms a
setting, moves a limit or introduces a number. No fourth screen. The old
takeaway line is demoted to the premise above the question, the forward control
is relabelled "Start again", and it is given a quiet treatment on the last
screen so it stops competing with the decision.

## What did NOT change

Verified on the deployed build, not assumed:

- Opening / The First Move, Negotiated Neighborhood, OpenCover — untouched.
- Home Again screens 2–3 — untouched; the regional-event interaction still
  flips condition 3 and degrades exactly one commitment.
- Backed to Act screens 1–2 — untouched; the authority stop still moves the
  limit, the badges, the grant line and the drawn authority line.
- iPad-first responsive behaviour, the gesture clearance and the tablet chrome
  fix from iteration-001.
- **iteration-001 is unmodified.**

## QA — against the deployed build

| Class | Exact CSS px | Result |
|---|---|---|
| iPad landscape | 1180 × 820 | pass |
| iPad landscape + browser chrome | 1180 × 740 | pass |
| iPad portrait | 820 × 1180 | pass — scrolls |
| Desktop | 1920 × 1080, 1440 × 900, 1280 × 720 | pass |
| Mobile | 430 × 932, 390 × 844, 360 × 740 | pass — scrolls |

- Smallest rendered text **11px**; lowest contrast **4.57:1**.
- No touch target below 44 × 44. The three new choice buttons are 44px minimum.
- No hover dependency, no gesture-strip collision, no horizontal scroll.
- Zero console or page errors across all six.
- All six decks walk forward through every screen and wrap to 1.
- 30 interaction assertions on the changed screens, all passing, including that
  each answer selects alone, opens an argument, and introduces no number.

Screenshots were captured only after the viewports passed, and **every labelled
interaction state is asserted against the DOM before its file is written**.

## Issues found

| Issue | Severity | Status |
|---|---|---|
| Capture manifest overwritten by the second run | medium (artifact integrity) | rebuilt from disk |
| Alphabetical ordering put an answered frame before the resting one | medium | explicit resting list |
| iPad harness still had this deck at six screens | low (tooling) | corrected to five |
| `CURRENT_ITERATION.txt` not updated by the generator | low | corrected |

## Unresolved — carried, none blocking

| Issue | Where | Severity |
|---|---|---|
| Screen 2 still uses an eight-cell capacity meter | 02 Home Again | product decision |
| Escalation-row timestamp sits ~7px from the order text, against 33–36px above; measured, not overlapping | 05 Backed to Act | cosmetic, pre-existing |
| Still the longest prototype in the set | 04 Wildfire Protection | accepted |
| Screen 2 is the longest portrait frame | 06 OpenCover | cosmetic |

The Home Again screen-2 meter is the notable one. This iteration was scoped to
screen 1, and removing it would gut that screen's interaction, so it was left
deliberately. It is the last counted capacity in the deck.

## NDA scan

**PASS.** Zero matches across repository contents, filenames, directory names,
tracked content, deployed pages and assets, page titles, URL slugs, review
documents, screenshot filenames, PNG metadata and the rendered text of every
captured state. Prohibited spellings are deliberately not reproduced in this
report.

## Git history

Unchanged from iteration-001 and **not a public leak**: the one commit carrying
the client name in its message body has never been pushed, and the pushed
history contains zero matches. 23 local commits remain unpushed, that one
among them, so a push would publish it. No history was rewritten and nothing
was pushed. Remediation still awaits approval — see iteration-001's report.

## Source scope touched

- `fieldnotes/snapshot/prototype/resilience-grid/{index.html,app.js,style.css}`
- `fieldnotes/snapshot/prototype/home-again/{index.html,style.css}`
- `fieldnotes/snapshot/prototype/backed-to-act/{index.html,app.js,style.css}`
- `fieldnotes/snapshot/review/**` — iteration-002 added; iteration-001 untouched.

Google Drive was not used for any part of this iteration.
