# Resilience Grid — design system

This prototype is the **sixth** thing printed on the Fieldnotes system and the
**fifth** built on the 2036 prototype pattern. It is a sibling of Micromutual,
Agent Error, Longevity and Price Certainty, and a deliberate counterpart to
Emberwatch.

Two documents govern it and are not restated here:

- `fieldnotes/design.md` — the publication's design system, measured from the
  built site. §2 (tokens, type), §3 (page anatomy), §8 (decisions worth
  inheriting), §9 (what the Emberwatch prototype added).
- `fieldnotes/snapshot/prototype/micromutual/style.css` and `app.js` — the
  reference implementation of the 2036 pattern. **This prototype forks that
  implementation.**

Everything below is either marked **[INHERITED]** — taken unchanged, recorded
so an implementer does not re-derive it — or **[NEW]** — added because this
concept needs something the five existing prototypes do not have. There are
nine new components and one new convention. Nothing else is new.

---

## 0. Why this needs its own stock at all

Emberwatch is the other wildfire prototype, and the one thing a reviewer must
understand inside thirty seconds is that this is not it. Emberwatch follows one
policyholder and one property; this follows a region and seven actors. If they
share a paper and an ink they will be mistaken for each other on the library
shelf and in a screenshot.

So: **the shared later-edition paper, a new ink.** `fieldnotes/design.md` §2
says plainly, of the split between the first two editions and the four later
ones, "If you extend this, follow the four, not the two" — so this takes
`#FBF9F1`, the stock Agent Error, Longevity and Price Certainty share, and
differentiates by ink alone, exactly as they do.

| | Emberwatch | Resilience Grid |
|---|---|---|
| Paper | `#F9F5EC` (its own warm stock) | `#FBF9F1` (the shared later stock) |
| Ink | `#42382C` warm brown | `#36414A` cool graphite |
| Reads as | hearth, timber, a house | iron, infrastructure, a system |
| Subject of the ground | one property and its parcel | one county and its ridge |

The ember hue survives, but demoted: in Emberwatch warm brown is the *ink* —
the voice of the whole document. Here `#B4551A` is one actor colour among six,
the fire districts', and the fire itself is `#A33322`. Warmth is a thing on the
page rather than the colour of the page.

---

## 1. Tokens

### 1.1 Stock and ink — **[NEW ink, INHERITED paper]**

| Token | Value | Contrast on paper | Note |
|---|---|---|---|
| `--paper` | `#FBF9F1` | — | [INHERITED] the four later editions' shared stock |
| `--edition-ink` | `#36414A` | **9.86 : 1** | [NEW] cool graphite, slight blue lean |
| `--edition-wash` | `#E6E7E7` | — | [NEW] diagram fills, wash plates |
| `--wash-2` | `#D8DBDC` | — | [NEW] second step, bar tracks |
| `--ink-soft` | `#5C6872` | **5.32 : 1** | [NEW] secondary type, labels |
| `--rule` | `#8A959C` | — | [NEW] hairlines that carry structure |
| `--hair` | `#DCDDD8` | — | [NEW] hairlines that carry nothing |
| `--body-ground` | `#E0E2DE` | — | [NEW] the colour outside the world, never seen on a sized window |

Every contrast figure above is computed against `--paper`, not against white,
because nothing in this publication sits on white.

### 1.2 Actor colours — **[NEW system, mostly INHERITED values]**

The concept has seven participants and the whole point of screens 2 and 4 is
that you can tell them apart at a glance. Five of the six colours are lifted
unchanged from Micromutual's semantic set, which was already measured against a
near-identical stock; only `--capital` is new. Reusing them is deliberate — it
is the same publication's palette doing a new job, not a new palette.

| Token | Value | Ratio on paper | Actor | Provenance |
|---|---|---|---|---|
| `--carrier` | `#2F5E7C` | 6.61 : 1 | the insurer | [INHERITED] Micromutual `--carrier` |
| `--utility` | `#5B4E7A` | 7.08 : 1 | the electric utility | [INHERITED] Micromutual `--machine` |
| `--fire` | `#9E4A14` | 5.79 : 1 | fire districts | [NEW] Emberwatch "Prepare" `#B4551A`, darkened — see below |
| `--public` | `#2F5A44` | 7.47 : 1 | county and public agencies | [INHERITED] Micromutual `--works` |
| `--vendor` | `#7A5A17` | 6.03 : 1 | sensing and suppression vendors | [INHERITED] Micromutual `--hardship` |
| `--capital` | `#8A3450` | 7.41 : 1 | resilience / catastrophe capital | [NEW] |
| households | `var(--edition-ink)` | 9.90 : 1 | residents | [NEW] the baseline actor is the ink |
| `--alarm` | `#A33322` | 6.52 : 1 | the ignition, and shortfall | [INHERITED] Micromutual `--short` |

**Why `--fire` had to move.** Emberwatch's "Prepare" amber `#B4551A` is 4.68 : 1
on this paper — it passes — but this prototype puts actor-coloured type on wash
plates and on its own 13% fill, where the same value falls to **3.98** and
**4.00**, below AA. Driven down to `#9E4A14` it measures 5.79 on paper, 4.92 on
the wash and 5.08 on `--fire-fill`, so it is legible on all three grounds a
fire-district label can land on. Emberwatch never needed this because its
postures are only ever set on paper.

Two measured constraints that follow, and bind the implementation:

- **`--rule` `#8A959C` is 2.90 : 1 and is never type.** It is hairlines,
  borders and node strokes only. Any label that looked like it wanted `--rule`
  takes `--ink-soft`.
- **`--wash-2` `#D8DBDC` carries no text.** `--ink-soft` on it is 4.10 : 1,
  which fails. It is a bar track and a gauge rail, nothing else; the ink itself
  is 7.50 on it if a figure must sit there.

Every other actor colour clears AA on `--paper`, on `--edition-wash` and on its
own fill, and `--ink-soft` clears 4.6 or better on all six fills.

Soft fills are **13% alpha of the same value**, one number per hue — the rule
§9 of `fieldnotes/design.md` states for Emberwatch, kept. Named fills:
`--carrier-fill: #E4EBEF`, `--utility-fill: #EAE8F0`, `--fire-fill: #F6E8DC`,
`--public-fill: #E6EDE7`, `--vendor-fill: #F1EBDC`, `--capital-fill: #F3E4E9`,
`--alarm-fill: #F4E4E0`.

Two rules travel with these, both [INHERITED] from §9:

1. **Colour is never the only carrier.** Every actor also has a word and a
   4px left border or a glyph. The seven-actor diagrams survive greyscale.
2. **Households are the ink, not a colour.** Making the resident one hue among
   six would say they are a participant like the others. They are the reason
   the others are there.

### 1.3 Insurability states — **[NEW]**

Three, not Emberwatch's four risk postures, and they describe a *market* rather
than a property. They reuse three values already in the set.

| State | Value | Meaning |
|---|---|---|
| Retreating | `--alarm` `#A33322` | cover thinning, carriers leaving |
| Managed | `--vendor` `#7A5A17` | prevention running, evidence not yet in |
| Potentially viable | `--public` `#2F5A44` | estimated risk reduction, subject to evidence and capacity |

Never render these three as a traffic light of equal dots. The gauge
(§3.2) is a track with a travelling marker, because the claim is about
*direction*, and the direction is the argument.

**The third state is named "Potentially viable", not "Viable", and its bar
stops at 84% of the track.** A filled rail would say the question had been
settled. It has not: prevention does not create availability on its own, and
the gauge has to carry that conditionality in its geometry as well as in its
label.

### 1.3b Two rules that override the inherited behaviour — **[NEW]**

Both were added after an independent review found real failures, and both
overrule something this prototype had inherited.

**1. No state is ever expressed by fading text.** The inherited idiom for "not
active yet" was opacity: screen 2's switched-off layers sat at `.48` and screen
3's unplayed timeline rows at `.22`. Measured, that put body copy far below AA
and made seven of eight timeline rows unreadable until someone pressed a
button. State is now carried by **border colour, ground tint, a dot's fill, and
a word in a badge** — `.layer-state` reading "Off", `.tl-kind` naming the
authority class. Type colour and opacity do not move. Any future state in this
prototype must be expressible in greyscale print, which fading never was.

**2. Below 900px the composition does not shrink; the screen scrolls.** The
inherited `--fit` binary search exists so a desktop stage that cannot scroll
still holds its content. A phone screen *does* scroll, so running the search
there bought nothing and cost everything: at 360, 390 and 430px wide it drove
uppercase labels to **6.4px** and notes to **7.7px** on all six screens.
`fitScreen()` now returns immediately when narrow, and the type takes hard
floors (§1.4b). Vertical scrolling on a phone is the correct behaviour, not a
fallback.

### 1.4 Type — **[INHERITED]**

Unchanged from Micromutual's scale, which is `fieldnotes/design.md` §2's type
at prototype sizes. No webfonts, no external request.

```
--serif: Georgia, "Times New Roman", serif;
--sans:  Arial, Helvetica, sans-serif;

--fs-base: clamp(13px, 1.1vh + 0.3vw, 15px);   /* the one unit, height-led */
--fit: 1;                                       /* app.js lowers per screen */
--dsp:    clamp(22px, 1.35vw + 1.55vh, 38px);
--dsp-xl: clamp(25px, 1.80vw + 2.10vh, 50px);
--figsz:  clamp(20px, 1.20vw + 1.40vh, 34px);
--rowsz:  clamp(14px, 0.75vw + 0.85vh, 21px);
```

| Class | Set as |
|---|---|
| `.display` | `400 calc(var(--dsp) * var(--fit))/1.08` serif, `-.028em` |
| `.display--xl` | `--dsp-xl`, `-.032em`, `span { display: block }` |
| `.eyebrow` | `600 calc(var(--fs) * .667)/1.4` sans, `+.14em`, uppercase, `--ink-soft` |
| `.body` | `var(--fs)/1.5` sans, `max-width: 58ch` |
| `.note` | `calc(var(--fs) * .8)/1.42` sans, `--ink-soft` |
| `.fig` | `400 calc(var(--figsz) * var(--fit))/1` serif, `-.025em` |
| `.rows dt/dd` | eyebrow-set term, `var(--fs)/1.4` value, `13ch 1fr` grid |

### 1.4b The five text roles and their mobile floors — **[NEW]**

Every `font-size` in `style.css` resolves through one of five variables, so a
floor can be applied in one place rather than in forty rules.

| Role | Desktop | Mobile floor | Used by |
|---|---|---|---|
| `--t-body` | `var(--fs)` | **14px** | running copy, `.rows dd` |
| `--t-sub` | `--fs × .93` | **13.5px** | stat lines |
| `--t-mid` | `--fs × .867` | **13px** | names, timeline actions |
| `--t-sec` | `--fs × .8` | **12.5px** | notes, asides, chips, table cells |
| `--t-lab` | `--fs × .667` | **11px** | uppercase labels, eyebrows |

Badges (`.layer-state`, `.tl-kind`, `.agr-n`) and map pins carry their own
`max(…)` floors of 10–11px. `--fs-base` itself starts at **14px** on narrow
rather than 13px: a phone is not a short desktop.

Measured after the change: nothing on any of the six screens renders below
**11px** at 360, 390 or 430px wide, and nothing carrying a sentence below
**12.5px**. Before it, the smallest rendered label was 6.0px.

**The figure split is [INHERITED] from §9 and matters here:** a hero figure is
Georgia with the face's old-style numerals; anything in a column stays Arial
with `font-variant-numeric: tabular-nums`. Screen 4's exchange table is a
column, so it is Arial throughout.

Headlines are **authored as arrays of lines**, `fieldnotes/design.md` §2's rule,
one `<span>` per line inside `.display--xl`. No headline on any screen is
allowed to wrap on its own.

### 1.5 Radius, elevation, focus — **[INHERITED]**

`--r-s: 3px; --r-m: 6px; --r-l: 10px` — §9's halved scale.
`--plate-shadow: 0 0 0 1px rgba(54,65,74,.11), 0 14px 34px -20px rgba(54,65,74,.55)`
— a hairline first, then a very soft shadow, the ink's own hue.
Focus is one rule for everything interactive: `2px solid var(--edition-ink)` at
`outline-offset: 2px`.

---

## 2. Layout — **[INHERITED]**

Forked from Micromutual without structural change. Stated because it is the
contract an implementer has to hold to.

**The ground is the page.** There is no sheet. A fixed `.world` holds one SVG of
Alder County, inset `-8% -11%` so the region is cropped by the viewport rather
than framed by it; `preserveAspectRatio="xMidYMid slice"`. Over it, `.veil` is a
per-screen radial wash; `.pins` are opaque label plates projected from world
coordinates; `.deck` is pointer-transparent so the ground stays reachable.

**Every word sits on an opaque plate.** No type is ever on the ground, on a
gradient, or on the veil. This is the single rule that keeps a full-bleed
drawing readable, and it is why contrast is measured against `--paper` only.

```
.screen            12 cols × 8 rows, gap calc(--fs-base * .93),
                   padding var(--gutter) var(--gutter) var(--chrome-h),
                   align-items: start
.plate             --paper, --r-l, --plate-shadow,
                   padding calc(--fs * 1.07) calc(--fs * 1.20),
                   flex column, height = what it holds
.plate--wash       --edition-wash ground
.gw                the ground window: display:none on desktop,
                   flex:1 on narrow — the hole the county shows through
```

Plates are placed with inline `grid-area`. A plate whose area ends at row 9
anchors `end`; everything else anchors `start` (`anchorPlates()`).

**A plate is never given a height it then has to clip.** Where a screen's
contents would leave the stage, `--fit` scales the whole composition down —
type, padding, gaps together — by binary search between `1` and a floor of
`0.74`, verified by `spills()`, which fails a screen if anything leaves the
stage box, overlaps another plate, or is cut by its own overflow. This machinery
is [INHERITED] verbatim and must not be weakened: it is what the "stop cutting
text off the screen" pass bought.

### Narrow (≤899px) — **[INHERITED]**

`.screen` becomes a scrolling flex column; every `grid-area` is dropped; plates
take the height they need and `.gw` takes the remainder; the camera aims at
`.gw` rather than the viewport centre. `--gutter: 13px`, `--chrome-h: 68px`,
`--grid-gap: 10px`. Two-column groups collapse to two, then to one below 340px.

**Departure from Micromutual:** it rotates its world a quarter-turn on a phone,
because a street is linear and belongs running down the screen. A county is not
linear. This prototype keeps the world in landscape at every width and changes
only the camera rectangles (`CAM_N`). One fewer transform, and the ridge still
reads.

### Chrome — **[INHERITED]**

Floating plates in the bottom-right gutter, no bar: `.iconbtn` 46px previous,
`.picker` select, `.cta` ink pill next. **The primary action is the ink, not an
accent** (§9). Content-labelled picker options — `"3 of 6 · The moment"` —
which `fieldnotes/design.md` §5 calls the best navigational idea in the build.
Arrow keys advance and retreat. `#s/<n>` in the hash, `replaceState` only.
`aria-live="polite"` announces screen position plus headline.

---

## 3. New components

Nine. Each exists because one screen's argument cannot be made without it, and
each is drawn for that argument — not generalised. This follows
`fieldnotes/design.md` §4's standing rule: **"These are illustrations, not
components — do not try to generalise them into a chart library."**

### 3.1 `.ground` — the region — **[NEW drawing, inherited technique]**

Micromutual's ground is 38 parcels on one street. This is a county: a ridge
system with contour bands, a canyon corridor, four fire-district boundaries, a
transmission line crossing the ridge, three settlement clusters drawn as
**clusters of dwellings, never as addressable individual homes**, and the
network's own nodes.

That choice is the concept, in the drawing. The moment you can click one house,
you are in Emberwatch. Settlements are massed; the smallest thing the ground
will resolve is a cluster.

Node glyphs, each a distinct shape so the layer reads without colour:

| Node | Glyph | Colour |
|---|---|---|
| Camera tower | triangle on a mast | `--vendor` |
| Ground sensor | small filled circle | `--vendor` |
| Line sensor | square on the transmission line | `--utility` |
| Fire station | cross in a rounded square | `--fire` |
| Drone base | chevron in a circle | `--fire` |
| Satellite pass | dashed arc across the top band | `--vendor` |
| Ignition | starburst | `--alarm` |

Nodes fade in by layer as screen 2 advances, and the ignition node is the only
one that animates.

### 3.2 `.gauge` — regional insurability — **[NEW]**

A horizontal track, `--wash-2`, three labelled stops (Retreating / Managed /
Viable), and one travelling marker. The marker carries the state's colour, its
word, and a glyph. Below it, one line of what moved it.

Appears on screen 1 (parked at Retreating) and screen 6 (travelling). It is the
same object in both places, which is the point: screen 6's payoff is literally
screen 1's instrument moving.

Never a dial, never a percentage. It says *direction*, not *score*.

### 3.3 `.layers` — the network stack — **[NEW]**

Four stacked rails: SEE / UNDERSTAND / ACT / FUND & COORDINATE. Each rail is a
row with a 4px left border in its dominant actor colour, an eyebrow label, one
line of what the layer does, and a wrapped set of `.cap` chips naming real
capability categories. Rails reveal in sequence and light their nodes on the
ground as they do.

`.cap` is a small chip, not a card: `--edition-wash` ground, `--r-s`,
`calc(--fs * .8)` Arial, with an optional `.cap-co` span for the one named
company per rail set in `--ink-soft`. Chips are categories; company names are
annotations on categories. **At most one company name per rail** — a wall of
logos is the vendor directory this prototype is specifically not.

### 3.3b `.agr` — the operating agreement — **[NEW]**

Five numbered clauses on screen 4, and the one place the prototype says
concretely what the parties sign: a consortium commissions, parties fund what
they already carry, providers deliver under protocols, an **independent**
evaluator measures, and — clause 5, set in `--carrier` — participating carriers
commit **in advance to reconsider** specified capacity and underwriting
decisions when evidence thresholds are met.

Clause 5 carries the carrier colour and the only coloured numeral because it is
the commercial proposition. It says *reconsider*, never *cover*; a design that
let that clause read as a guarantee would misrepresent the concept.

### 3.4 `.tl` — the event timeline — **[NEW]**

A three-column grid: time (`tabular-nums`, Arial, right-aligned), actor dot and
name, action. One row per beat, seven beats. A continuous hairline runs down
behind the dots so the column reads as a sequence.

**Every row carries a `.tl-kind` badge naming its authority class** —
Detection, Corroboration, Model, Bounded protocol action, or the human row.
This is the design answer to "AI confirmed it, therefore everything executed":
the badges make visible that evidence and authority are different things, and
that only narrow, pre-authorised actions happen without a person.

Two further modifiers do the real work:

- `.tl-row--corrob` — a row that *confirms* an earlier signal rather than
  adding a new one, marked by a doubled dot. Three independent corroborations
  before the network acts is the honesty of the scenario; the design has to
  show them as a different kind of event from an action.
- `.tl-row--human` — the human decision point. Full-width `--carrier-fill`
  band, a `◆` marker, and the decision stated as a question with who answers
  it. There is exactly one per timeline and it is the most prominent row.

Rows advance on a play control and on `.cta`; the ignition node on the ground
grows with them.

### 3.5 `.xchg` — the value exchange — **[NEW]**

The business model table, and probably the most important new object here. One
row per participant: a colour-bordered name cell, an **avoids** cell, a
**contributes** cell. Arial throughout with `tabular-nums`, because it is a
column.

Its header carries the standing hedge — `One possible model` — set as an
`.eyebrow` in `--ink-soft`, not as fine print. On narrow it becomes stacked
cards with `avoids` and `contributes` as labelled rows, never a horizontally
scrolling table.

The contribution cell takes a `.kind` chip — money / permission / consent /
underwriting / structure / capacity — so the reader can see at a glance that
most participants are not contributing money.

**`.tier`, alongside it, replaced a stacked percentage bar.** The first version
put six exact funding shares on screen (45% / 20% / 15% / 10% / 5% / 5%). The
numbers were marked illustrative and were still wrong to show: they implied a
split nobody has modelled, and false precision is more damaging to a strategic
provocation than vagueness. `.tier` is three ordered groups — potential lead
funders, co-funders and beneficiaries, in-kind and operating participants —
each a colour-bordered rail. **The ordering carries the whole argument** (the
parties with the largest direct liability have the strongest reason to fund,
and the insurer is not among them) without inventing a number.

### 3.6 `.loop` — the operating loop — **[NEW]**

Five stages — Observe, Intervene, Verify, Measure, Update — as a ring, not a
line, because the claim is that it compounds. Drawn in SVG: five nodes on a
circle, arrowed arcs between, the return arc from Update to Observe drawn
heavier than the rest.

**Verify and Measure are emphasised and the other three are not.** They get the
ink, a filled node and a one-line caption; Observe, Intervene and Update are
`--ink-soft` with hollow nodes. The whole visual argument of screen 5 is that
the hard and valuable steps are the two nobody builds, and the hierarchy has to
say so before the copy does.

On narrow the ring becomes a vertical chain with the return arrow folded to the
left margin.

### 3.7 `.counter` — the counter-example plate — **[NEW]**

A plate in `--alarm-fill` with a `--alarm` left border, holding one documented
prevention failure and what it implies. One per prototype; it sits on screen 5
beside the loop.

This is a **new category of plate for this publication** and worth naming as
such: the five existing prototypes each carry a `trust` page of boundary
statements, but none of them puts a dated case where the mechanism did not work
next to the mechanism. A prototype arguing that prevention creates insurability
has to carry the case where funded prevention could not be shown to work, or it
is advertising.

### 3.8 `.fork` — without / with — **[NEW]**

Two columns of four or five short steps, each step a row with a chevron. Left
column `--alarm` accented and descending; right column `--public` accented and
level. A vertical hairline between them.

Step text is one short phrase. The hedged verbs live in the column headers and
the closing line, not repeated in every step.

### 3.9 `.sig` — signals already here — **[NEW]**

The evidence plate. A list, each item: a `◆` marker, the actors in `.strong`,
one line of what they did, and a year. `--edition-wash` ground, hairline
bracket on the left.

It is small on purpose and appears once, on screen 6.

---

## 4. One new convention: evidence versus scenario

The five existing prototypes are wholly speculative, so they never needed to
distinguish a real precedent from an invented one. This prototype makes both
kinds of claim on the same screens, and the distinction is the difference
between a provocation and a misrepresentation.

Emberwatch's answer was four provenance classes — observed / derived / modelled
/ illustrative — carried as colour and word (§9). That is too fine a grain for
six screens of strategy. **This prototype reduces it to two, and marks the
difference by form rather than by a seventh colour:**

| | Evidence | Scenario |
|---|---|---|
| What it is | something that actually happened, dated, with actors named | Alder County, 2036 |
| Marker | `◆` glyph before the line | none |
| Ground | `--edition-wash`, left hairline bracket | `--paper` |
| Type | `.note` size, actors in `.strong` | normal `.body` |
| Year | always present, at the end of the line | never |
| Verbs | past tense, indicative — *backed*, *cut*, *stopped* | conditional — *could*, *might*, *would* |
| Where | `.sig` on screen 6; `.aside` inline, max one per screen | everywhere else |

Two consequences the implementation must honour:

- **No number appears on screen unless it is in `research-notes.md` §1–§2, or
  is an Alder County figure explicitly labelled illustrative.** Illustrative
  regional figures carry the word on the same plate, not in a footer.
- **Hedged verbs in the scenario are not optional softening.** Screen 6's
  payoff column says cover *could* stay available. The research found no
  insurer doing any of this; the conditional is the accurate tense.

And the standing disclosure, in Micromutual's voice, on screens 1 and 6:
*"Invented region, invented figures. No real insurer operates this."*

---

## 5. What this prototype deliberately does not inherit from Emberwatch

Named so nobody reaches for them. Each is sound in Emberwatch and wrong here,
and each is wrong for the same reason: it encodes one customer, one policy, one
property.

| Emberwatch pattern | Why it is not reused |
|---|---|
| The four risk postures (Normal / Watch / Prepare / Act) | They describe one property's state. This concept's state is a *market's*, and it has three values, not four. |
| The property card and the risk portrait with its `.orbit-input` signal ring | A ring of signals converging on one address is the household-centric picture in a single image. Here signals converge on a region and fan out to seven actors. |
| The tile base map with its OpenTopoMap grade and captured stills | A real georeferenced basemap of a real place would make an invented county look like a claim about somewhere. The ground here is a drawn region, which is honest about being invented, and needs no tile requests. |
| The customer's phone — the "one dark island" | A lock screen is the household's view. This prototype has no single customer to notify; its equivalent beat is the human decision row in `.tl`, which is an operator's call, not a resident's alert. |
| The 17-step replay | A replay follows one event to its end. Six screens follow a mechanism. |
| Georeferenced real-fire data (Pacific Palisades, Jan 2025) | Emberwatch's replay is a real event and is strong for it. Attaching invented network performance to a real fire would attribute an outcome to a system that did not exist. |

What **is** taken from Emberwatch: the ink-pill primary action, the focus ring,
the halved radius scale, the hairline-first elevation, the figure split, the
13%-alpha fill rule, the colour-plus-word-plus-glyph rule, and §9's general
posture that a running prototype is still a printed thing.

---

## 6. Cost

| | |
|---|---|
| Files | 3 shipped (`index.html`, `style.css`, `app.js`) + 3 docs |
| Webfonts | none |
| Images | none — the ground is drawn SVG |
| External requests | none |
| Icon library | none; seven node glyphs drawn inline |
| Dark theme | none, by the §9 rule — a printed thing paints its own ground |

No image weight, which is the one budget line `fieldnotes/design.md` §7 says
matters, and no tile requests, which is the dependency §9 records as
Emberwatch's most awkward.
