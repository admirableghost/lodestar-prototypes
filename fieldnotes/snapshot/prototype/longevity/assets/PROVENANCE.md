# Understanding Longevity — visual asset provenance

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


Four image files carry this prototype. Every one of them is a **generated
image standing in for invented characters. No real person is depicted.**

There is no Robert and there is no Ada. They are figures written for this
prototype, and every figure on every screen is invented. The people in these
photographs are photographic subjects, not customers, not policyholders, not
annuity buyers, and not anyone who has ever been advised by anything. Nothing
on screen may caption them as a real person, a real customer, or a real
outcome, and nothing beside them may read as advice or as a guaranteed return.
The standing line — *2036 projection · invented figures and contracts ·
guidance, not advice* — is on every screen, and the opening carries the fuller
disclosure in full.

---

## Files in this directory

| File | Size | What it is |
| --- | --- | --- |
| `cover.jpg` | 733×1100 | The edition cover: a couple in their sixties or seventies sitting together outdoors. Full-bleed ground on screen 1 and screen 8. |
| `robert.jpg` | 1500×1000 | A man at a kitchen table with papers and an open photograph album. Full-bleed ground on screen 2. |
| `ada-portrait.jpg` | 260×260 | **New.** A square crop of the woman's face, taken from the cover. |
| `robert-portrait.jpg` | 280×280 | **New.** A square crop of the man's face, taken from `robert.jpg`. |

`cover.jpg` and `robert.jpg` were already here when the portraits were cut;
their upstream sourcing is the edition's, recorded with the edition, not here.
This file records the two crops.

---

## `ada-portrait.jpg` — the survivor column gets a face

### Source

- **Cropped from**: `snapshot/images/longevity-cover.jpg` (1024×1536), the
  edition's own cover file — the same photograph as `assets/cover.jpg` here,
  which is a 733×1100 resample of it. The full-resolution edition file was
  used so the crop is cut from real pixels rather than from a downsample.
- **Crop box**: `(425, 705) → (685, 965)` in the 1024×1536 source. A 260×260
  square centred on her face (her eyes sit at roughly y 830, the midline of
  her face at roughly x 545).
- **Made with**: Pillow `Image.crop`, JPEG quality 90. No scaling, no grade,
  no retouching, no generation. The crop is a rectangle of the original file
  and nothing else.
- **Cut**: 2026-09-29.

Nothing in `snapshot/images/` was modified. The source file was opened
read-only and the crop written into this directory.

### What is in the frame

Her head and shoulders, three-quarters to camera, looking up and past the
lens, in the same late-afternoon garden light as the cover. A sliver of the
man's shoulder and shirt sits behind her at the lower left, because in the
photograph she is leaning against him; at the sizes this is displayed —
36–72 px circles — it reads as background. She is the only face in the frame.

### Why this source rather than `neighbors.jpg`

`snapshot/images/neighbors.jpg` (four adults in a front yard) was the
alternate offered. It was not needed: the cover already contains her, at the
same hour, in the same light, by the same photography, beside the same man who
appears in `robert.jpg`. Cropping her out of the cover keeps one household
looking like one household. A face lifted from a different shoot would have
introduced a second lighting and a second wardrobe into a set of three images
that currently agree with each other.

---

## `robert-portrait.jpg` — so the pair are a pair

### Source

- **Cropped from**: `assets/robert.jpg` (1500×1000), already in this
  directory and already the ground of screen 2.
- **Crop box**: `(575, 70) → (855, 350)`. A 280×280 square centred on his
  face.
- **Made with**: Pillow `Image.crop`, JPEG quality 90. No scaling, no grade,
  no retouching, no generation.
- **Cut**: 2026-09-29.

### Why it exists

The client asked for a photograph of the woman, on the general principle that
people are easier to relate to when you can see them. Her portrait is used in
three places where the two of them are named side by side — the household
list, the survivor row of the terms, and the two lifelines. A face beside her
name and a blank beside his would have made the pair asymmetric and made the
portrait look like a decoration rather than an identification. He already had
a photograph; this is the same photograph, cropped to match hers.

It is the same man as in the cover: the two source photographs are consistent,
which is why the pairing works.

---

## Where the portraits appear

| Screen | Placement | Why there |
| --- | --- | --- |
| 1 · the afternoon | Circular chips beside **Robert** and **Ada** in the household list | Where they are introduced, and where the household list first names them separately |
| 3 · the terms | Circular chip in the **What happens to Ada** row label | The row is named for her; it is the question he actually has |
| 4 · four lives | Circular chips at the head of each **lifeline** | His line ends and hers continues — the survivor years are hers, and a face makes that legible before the contract term does |

Each one is decorative to assistive technology (`aria-hidden`) except where
it replaces no text; the names beside them are the accessible label, and the
names are invented.

### Binding treatment

1. **Never captioned as a real person.** The chips appear only beside the
   invented names "Robert" and "Ada". No real name, no photographer credit and
   no photograph title is attached to them anywhere on stage.
2. **Never adjacent to a claim.** A portrait never sits beside a figure
   presented as a real or achievable return. The screens they appear on carry
   the standing guidance-not-advice line, and screen 1 carries the fuller
   disclosure.
3. **Never a customer.** No copy anywhere may describe either subject as a
   policyholder, an annuity buyer, or a person who took any of the three
   invented contracts.
