# Household portraits — provenance

> **Correction (2026-09-29).** An earlier revision of this file described the
> source as a photograph of real people. That was wrong. Every file in
> `snapshot/images/` is exactly 1024 x 1536 or 1536 x 1024 — gpt-image's
> portrait and landscape output sizes — with no EXIF, no camera model, no
> creator field, and no photographer, URL or licence recorded anywhere in this
> repository; the Fieldnotes site they came from was originally built in
> ChatGPT. The client confirmed the images were generated. **No real person is
> depicted, and there is no photographer or licence to credit.** Wording below
> that says "photograph" or "photographed" should be read as "generated
> image"; the crop boxes, subjects and placements are unaffected.


Three faces stand in for the three invented households of the Price Certainty
prototype: **Rosa A.**, **Marion K.** and **Yusuf T.**

**These are generated images standing in for invented characters. No real
person is depicted.**
None of them is Rosa, Marion or Yusuf; there is no Rosa, Marion or Yusuf. No
crop here may ever be captioned or implied to be a real person, a real
customer, a real policyholder, or a participant of any utility, retailer,
insurer or reinsurer. On stage each face appears only beside an invented name
from `app.js`, on screens that already carry the prototype's framing line
("Rosa, Marion and Yusuf are invented households…"), and the chooser screen
carries the stand-in disclosure in visible copy.

## Source

- **File**: `snapshot/images/neighbors.jpg`, 1536 × 1024, SHA-256
  `b998cf11734075471ce1b30f7713fda0a26a476e1ea6aa1f7e92950ee54bd5bc`
- **Read-only**: nothing in `snapshot/images/` was modified. The source was
  copied to a scratch directory, cropped there, and the crops copied here.
- **What it shows**: four adults planting and watering a front-yard bed on a
  suburban street in warm late-day light. Four faces: a woman with braided
  hair kneeling at the left, a grey-haired, grey-bearded man in a denim shirt
  centre-left, a woman in a straw sun hat with a watering can centre-right,
  and a man in a red plaid shirt at the right.

## The crops

Cut with `sips --cropOffset <top> <left> -c <h> <w>`. Square, no rotation, no
resampling, no colour grade, no retouching — each file is an unaltered
rectangle of the source's pixels.

| File | Household | Crop from source (x, y, w, h) | Subject in the frame |
|---|---|---|---|
| `rosa.jpg` | Rosa A. | 315, 278, 320 × 320 | the woman with braided hair, kneeling, left of frame |
| `marion.jpg` | Marion K. | 800, 25, 320 × 320 | the woman in the straw sun hat, centre-right |
| `yusuf.jpg` | Yusuf T. | 1125, 195, 320 × 320 | the man in the red plaid shirt, right of frame |

The fourth subject — the grey-bearded man in denim — is not used. Each crop is
centred on its subject's face; the neighbouring subject's shoulder enters the
edge of `rosa.jpg`, which the circular mask in `app.css` drops.

## Why portraits, and why not the prototype's other photographs

The client asked for photographs of the people so a viewer can relate to them.
Three abstract households were previously carried by initials and a drawn
cut-through of each home.

`price-certainty-cover.jpg` (a single-family house at dusk with landscape
lighting) and `price-certainty-story.jpg` (a couple at a granite kitchen
island beneath a smart thermostat) were considered and rejected for Rosa. Both
depict a comfortable owner-occupied household that *can* install assets, which
is the exact opposite of a woman renting a fourth-floor flat in a 1962 block
with hard-wired storage heaters and a landlord who has twice refused a heat
pump. Either behind Rosa would quietly contradict the distributional argument
the prototype exists to make. A face carries the person without smuggling in a
wealth signal.

## Where they are used

- `render3()` — the household chooser, beside each name, with the visible
  stand-in disclosure under the chooser's lead paragraph.
- `render2()` and `render5()` — the per-household plates, as a small lockup
  naming whose home is on screen.
- `render9()` — the break-even rows, so the three names carry faces there too.
- `render11()` — the closing verdict columns.

All are `alt=""`: the invented name sits immediately beside every one of them,
and an alt text describing the photographed person would attach a real
identity to an invented one.
