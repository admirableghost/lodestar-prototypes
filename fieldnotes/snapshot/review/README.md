# Prototype Review

Deterministic review bundle for the Fieldnotes workshop prototypes.
Confidential concept work. Not for distribution or indexing.

**Current iteration:** see `CURRENT_ITERATION.txt` → `iteration-001`

## Layout

```
Prototype Review/
├── README.md                  this file
├── CURRENT_ITERATION.txt      the iteration to review now
├── index.json                 every file in the bundle, by URL
├── iteration-001/
│   ├── STATUS.md              READY_FOR_REVIEW + timestamp + commit
│   ├── BUILD_REPORT.md        what changed, what did not, issues, NDA
│   ├── READY_FOR_REVIEW.md    the review trigger — exists only when gates pass
│   ├── 01-opening/
│   │   ├── REVIEW.md
│   │   ├── contact-sheet-ipad.png
│   │   ├── ipad-landscape/    every screen AND every interaction state
│   │   ├── ipad-portrait/     every screen
│   │   ├── desktop/           every screen
│   │   └── mobile/            every screen
│   ├── 02-home-again/         …same structure
│   ├── 03-negotiated-neighborhood/
│   ├── 04-wildfire-protection/
│   ├── 05-backed-to-act/
│   ├── 06-opencover/
│   └── integrated/
│       ├── all-prototypes-contact-sheet-ipad.png
│       └── narrative-review.md
└── reviews/
    ├── iteration-001-review.md        ← the reviewer writes this
    └── iteration-001-next-prompt.md   ← and this
```

**Earlier iteration folders are immutable.** iteration-002 is a new folder; nothing
in iteration-001 is ever overwritten.

## Folder name vs live slug

One folder does not match its deployed URL, because the brief names the folder
`04-wildfire-protection` while the prototype ships at `/prototype/resilience-grid/`.
Screenshot filenames use the **live slug**, so every file traces to its URL:

| Folder | Live slug | Screenshot prefix |
|---|---|---|
| 01-opening | first-move | `first-move-…` |
| 02-home-again | home-again | `home-again-…` |
| 03-negotiated-neighborhood | negotiated | `negotiated-…` |
| **04-wildfire-protection** | **resilience-grid** | `resilience-grid-…` |
| 05-backed-to-act | backed-to-act | `backed-to-act-…` |
| 06-opencover | opencover | `opencover-…` |

## Screenshot naming

`<live-slug>-<screen NN>-<state-name>-<viewport>.png`

e.g. `home-again-01-plan-as-it-stood-ipad-landscape.png`

The first frame listed for a screen is its **resting** state; later frames for
the same number are interaction states.

## How to read this bundle

1. `CURRENT_ITERATION.txt` → the folder to review.
2. `iteration-001/READY_FOR_REVIEW.md` → confirms the gates passed.
3. `iteration-001/integrated/all-prototypes-contact-sheet-ipad.png` → the whole
   sequence in one image.
4. Each `NN-…/REVIEW.md` → concept, workshop role, screen-by-screen intent,
   what is factual vs hypothetical, known issues, screenshot filenames.
5. `iteration-001/BUILD_REPORT.md` → what changed and what is unresolved.

## A limitation of this fallback, stated plainly

Google Drive is not reachable from the session that produced this bundle, so it
is served as a static route. That makes it **readable** by another session but
not **writable**: a reviewer cannot save `reviews/iteration-001-review.md` back
here. Those two files have to be carried to the next build session by the human
in the loop. With Drive, the loop closes by itself; here it does not.
