# Portrait provenance — Agent Error Protection

Three faces appear in this prototype: Ada Okonjo, Femi Okonjo and Deb Hollis.

**All three are crops of AI-generated images. No real person is depicted.**
There is no Ada, no Femi, no Deb, no Okonjo household, no hedge and no claim.
There is also no photographer, no subject and no licence to credit, because
nobody was photographed.

On screen the statement is kept simple and made once where the faces appear:
screen 2 says "An invented household, and generated images: no real person is
shown here, and nobody here is a policyholder", the phone's version of that
screen says the same thing beside its three faces, and screen 6 says "Ada and
Deb are invented and both images are generated; no real person is shown". Every
`alt` attribute repeats it in its own words ("Generated portrait representing
Deb Hollis, the invented neighbour."), so the claim survives with images off, in
a screen reader, and in a screenshot of a single plate. The foot of every screen
also carries "2036 projection · invented household, invented figures".

## How the generated origin was established

Recorded because it corrects an earlier, wronger note in this same file, which
described these as photographs of real people standing in for the characters —
a rule carried over by analogy from `prototype/emberwatch/assets/hero/PROVENANCE.md`,
where it is correct: Emberwatch's hero images really are a Pexels portrait and
an Unsplash-licensed house, with photographer, ID and licence all documented.

That analogy does not hold here, and it failed in the direction that matters: it
asserted a real person was depicted when none is. The evidence:

- every file in `snapshot/images/` is exactly 1024×1536 or 1536×1024 — the exact
  portrait and landscape output sizes of gpt-image;
- no EXIF, no camera model, no creator field on any of them;
- no photographer, source URL or licence recorded anywhere in the repository;
- the original Fieldnotes site was built in ChatGPT.

Put to the client, who **confirmed the images were generated**.

## Sources

Both source files were opened, cropped and resampled into this folder. Neither
was modified: `snapshot/images/` is untouched.

### `agent-liability-cover.jpg` — the edition's own cover

- **File**: `../../../images/agent-liability-cover.jpg` (1024×1536 JPEG, 386,618 bytes, SHA-256 begins `efc485c59dc012ef`)
- **What it shows**: a generated scene of a man, a woman and a child at a
  kitchen table in warm daylight, over a laptop and a paper map.
- **Also used unaltered** as `../cover.jpg`: the full-bleed ground of screen 1
  and the household band (`.photo-window`) on screen 2.

### `neighbors.jpg` — four adults gardening in a front yard

- **File**: `../../../images/neighbors.jpg` (1536×1024 JPEG, 685,334 bytes, SHA-256 begins `b998cf1173407547`)
- **What it shows**: a generated scene of four adults planting a front-yard bed
  in low evening sun — a woman with braided hair (left), a grey-bearded man in
  denim (centre-left), a woman in a straw sun hat (centre-right), a man in red
  plaid (right).

## The crops

Cut as squares, resampled to 300×300 with Pillow's Lanczos filter, saved as
progressive JPEG at quality 86. No grade, no retouching, no compositing: the
crop is the only edit. Each is displayed as a circle in CSS (`.face`), so the
source square is never seen whole.

| File | Source | Crop box (left, top, right, bottom) | Represents |
|---|---|---|---|
| `ada.jpg` | cover | 405, 548 → 635, 778 (230 px) | **Ada Okonjo**, 41, veterinary nurse, holds the mandate |
| `femi.jpg` | cover | 212, 545 → 447, 780 (235 px) | **Femi Okonjo**, 44, the other adult signatory |
| `deb.jpg` | neighbors | 352, 338 → 588, 574 (236 px) | **Deb Hollis**, the neighbour on the far side of the hedge |

- **`ada.jpg`** is the woman at the centre of the cover, leaning on the man's
  shoulder. The crop starts at x = 405 specifically so his face falls outside
  the frame: only a little of his hair and shoulder survives at the left edge,
  and most of that is cut away again by the circular mask.
- **`femi.jpg`** is the man on the left of the cover.
- **`deb.jpg`** is the woman with braided hair at the left of the neighbours
  image. Chosen over the other three adults because she reads as a next-door
  neighbour rather than a passer-by, her face is clearly lit and unobscured (the
  woman in the straw hat is partly in the brim's shadow), and she is
  unmistakably a different person from the Okonjo crops — which matters, because
  the whole screen turns on whose side of the line the hedge stood on.

**The child on the cover was deliberately not cropped.** Tolu is seven. A
seven-year-old does not need a portrait for this argument to work, generated or
not. Tolu exists here as a name in a list, which is enough.

## Where they appear

| Screen | Face | Placement |
|---|---|---|
| 2 · The household | Ada (54 px) | beside her name in the identity lockup |
| 2 · The household | Ada + Femi (28 px) | on the "Living here" row |
| 2 · The household | Deb (28 px) | on the "North boundary" row, where the hedge and her side of the line are named |
| 2 · on a phone | all three (34 px) | in the narrative plate, since the card beside the site plan is dropped at that width |
| 6 · The question at 13:44 | Deb (30 px) | inside the 13:06 beat, where 9.4 m of the cut is said to stand on her side |
| 6 · The question at 13:44 | Ada (40 px) | on her own line of the transcript |

The agent in the transcript on screen 6 has no face, and should not get one.
That contrast is the screen: a person answered, in forty-one seconds, and the
thing that asked her was not a person.
