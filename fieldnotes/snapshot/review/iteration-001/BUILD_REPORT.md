# BUILD_REPORT — iteration-001

**Completed** 2026-10-05 19:49:45 UTC
**Commit** `98bbf80c56ce294f427665dc7ec07279dfea14c9`
**Live root** https://fieldnotes-khaki-three.vercel.app

## What this iteration was for

Access, reviewability, iPad confidence and a structured async review contract.
Not concept work. No prototype was redesigned and no concept was rebuilt.

## What changed

**Prototype source — three fixes, all iPad device-fitness, all found by validation**

1. **Bottom gesture-strip collision.** `prev` / `picker` / `next` ended ~11px
   from the bottom edge at every iPad viewport on all six prototypes — inside
   the home-indicator strip, under the one control a facilitator taps on every
   screen. The chrome now clears it by the larger of a 12px floor and the real
   `safe-area-inset-bottom`, and everything reserving room for the chrome grows
   with it. This is the only change that touches all six.
2. **Threshold label collision (Negotiated Neighborhood).** Growing the range
   input to a 44px touch target dropped the thumb onto the "48 needed" track
   label — unreadable at exactly the moment the viewer drags to the threshold.
   The label now clears the taller input. Self-inflicted by the previous
   iteration's touch-target fix.
3. **Tablet inheriting phone chrome (OpenCover).** One lane scoped its phone
   rule as `.chrome .cta span:first-child`, which outranked the integration
   block, so OpenCover alone still rendered Next as a bare arrow on iPad
   portrait. Fixed by matching specificity, without editing that lane's CSS.

**Review pipeline — new**

- Deterministic folder contract under `Prototype Review/iteration-001/`.
- Per-viewport subfolders; `<slug>-<NN>-<state>-<viewport>.png` naming.
- 93 screenshots from the deployed build across four viewport classes.
- Six `REVIEW.md`, six contact sheets, one integrated sheet, `narrative-review.md`.
- Control files: `CURRENT_ITERATION.txt`, `STATUS.md`, `READY_FOR_REVIEW.md`.
- `index.json` listing every artifact by absolute URL.

**Harness — two real defects in my own tooling**

- The capture harness navigated by hash only. That is a *same-document*
  navigation, so `networkidle` resolved instantly and the first click raced the
  screen switch — which produced a frame named `renewal-permitted` that
  actually showed "needs you". Fixed by forcing a reload, and then by making
  every labelled state **assert against the DOM before the file is written**.
  14 assertions now gate the capture. A mislabelled screenshot is worse than a
  missing one.
- The gesture-area check walked ancestors for `position: fixed`. The whole deck
  is fixed, so it flagged everything, including content merely below a scrolling
  fold. It now scrolls each screen to its end before measuring.

## What did NOT change

- No concept, narrative or visual system was altered.
- No screen was added or removed from any prototype.
- The four product risks under review — Wildfire Protection length, Backed to
  Act screen 3, Home Again capacity meter, OpenCover phone length — were
  **assessed and documented, not edited**. See `integrated/narrative-review.md`.
- No git history was rewritten. No force-push.

## Viewport matrix

| Class | Exact CSS px | Role | Result |
|---|---|---|---|
| iPad landscape | 1180 × 820 | canonical review surface | pass |
| iPad landscape + browser chrome | 1180 × 740 | primary, worst-case height | pass |
| iPad portrait | 820 × 1180 | primary | pass — scrolls |
| Desktop | 1920 × 1080, 1440 × 900, 1280 × 720 | secondary | pass |
| Mobile | 430 × 932, 390 × 844, 360 × 740 | secondary / edge | pass — scrolls |

Two independent harnesses, both against the **deployed** build:

- **Core** — computed font-size, contrast against the composited rendered
  background, touch-target size, clipping, overlap, horizontal overflow,
  console errors.
- **iPad-specific** — hover dependency, accidental phone chrome, bottom
  gesture-strip collisions, narrative reading order.

Results: smallest rendered text **11px** everywhere; lowest contrast **4.57:1**;
no touch target under 44 × 44; no shrink-to-fit on narrow; no hover-only
affordance; no gesture-strip collision; zero console errors.

## Issues found and fixed this iteration

| Issue | Severity | Status |
|---|---|---|
| Chrome controls inside the iPad home-indicator strip, all six | high on primary device | fixed |
| Threshold label obscured by the slider thumb at the key beat | high | fixed |
| OpenCover kept phone chrome on iPad portrait | medium | fixed |
| Capture harness mislabelled an interaction state | high (artifact integrity) | fixed + 14 assertions added |
| Gesture check false-positived on scrolling content | low (tooling) | fixed |

## Unresolved issues

Carried, not fixed — none blocks review.

| Issue | Where | Severity |
|---|---|---|
| Six screens, ~150–200s cold | 04 Wildfire Protection | product decision |
| Screen 3 ends without a decision | 05 Backed to Act | product decision |
| Eight-slot capacity meter is a countable invented quantity | 02 Home Again | product decision |
| Screen 2 is the longest portrait frame in the set | 06 OpenCover | cosmetic |
| Holdouts bunch into one block above ~52 of 60 | 03 Negotiated | cosmetic |
| Map pins hide on phones under plates | 02, 04 | cosmetic |
| Large bare regions at desktop width | 02, 05, 06 | cosmetic |

## NDA scan

```
patterns  /state[^a-z0-9]{0,3}farm/i
          — the client's two-word name: the words adjacent, with any separator
            or none, in any casing. The spellings are deliberately NOT listed
            here. This file is served publicly, and an enumeration of forbidden
            spellings is still an instance of the thing it forbids.
          — plus the initials when used as a client shorthand
```

| Scope | Result |
|---|---|
| Repository file contents | 0 |
| Repository filenames and directory names | 0 |
| Tracked content at HEAD | 0 |
| Deployed pages + their CSS/JS + metadata | 0 |
| Deployed page titles and URLs | 0 |
| Review bundle: folder names, filenames, REVIEW.md, index.json | 0 |
| PNG embedded metadata (97 files, chunk-parsed) | 0 chunks present |
| Rendered text of every captured state | 0 across ~49k characters |
| **Pushed git history (ancestors of origin/main)** | **0** |

Zero leaks in every artifact.

## NDA BLOCKER — git history

**Not a leak today. It becomes one on the next push.**

| | |
|---|---|
| Commit | `86edbccffef97cf5e12e88bb07487565fddc403b` |
| Where | message **body**; no file, page or artifact contains the name |
| Public? | **No.** GitHub API returns 422 "No commit found for SHA" |
| Pushed history | `origin/main` tip `d692117` (2026-09-29) — **0 matches** |
| Local unpushed | **15 commits**, including the offending one |
| Repo visibility | public (`admirableghost/lodestar-prototypes`) |

A correction to the previous iteration's report: it stated this commit was in
public history. It is not — that report did not check whether the commit had
been pushed. It never has been.

**Nothing has been rewritten and nothing has been pushed.**

### Safest remediation, in order of preference

1. **Reword the message before the first push.** Because the commit is
   unpushed, this is an ordinary local rebase — no force-push, nothing public
   to break, no collaborator to disrupt. Rewrite the message of that one commit,
   then push normally. This is the recommended option and it is close to
   risk-free.
2. **Squash the unpushed range** into commits with clean messages. Simpler, but
   it discards the granular history of 15 commits.
3. **Leave it and never push this branch** — push a fresh branch built from the
   current tree instead. Keeps history intact locally, publishes nothing.
4. **Do nothing.** Acceptable only while nobody pushes. The risk is that the
   next push is routine and unthinking.

Any of these needs explicit approval. **No destructive action has been taken.**

### Unpushed commits

```
98bbf80 iteration-001: deterministic review bundle and three iPad fixes
b95c1fa Clear the iPad home-indicator strip under the chrome bar
1707e63 Link the review bundle from the workshop index
81692c3 Publish the review bundle as a route beside the prototypes
fc66e6c Make the tablet label restore win where a lane scoped its phone rule
82cf278 Fix two iPad defects the screenshot pass exposed
0f9398f Make the six workshop prototypes iPad-first
bdfc294 Add five workshop prototypes and the set index
b25d2f0 De-identify the client and make the whole site unindexable
5aa9ff7 Screen 5: learning what works, not showing it worked
86edbcc One thought per screen: cut visible text by 63 percent
04219a9 Make Resilience Grid readable, defensible and commercially concrete
5123c66 Hold Resilience Grid to what the evidence actually supports
46deaef Ignore .env* so the Vercel OIDC token cannot be committed
3ce11a0 Add Resilience Grid, a region-scale wildfire prevention network
```

## Source / repo scope touched

- `fieldnotes/snapshot/prototype/*/style.css` — six files, three fixes above.
- `fieldnotes/snapshot/review/**` — the review bundle, new.
- `fieldnotes/snapshot/workshop/index.html` — one link to the bundle.
- `fieldnotes/snapshot/robots.txt` — one carve-out, documented in README.
- No `index.html` or `app.js` of any prototype was modified this iteration.
