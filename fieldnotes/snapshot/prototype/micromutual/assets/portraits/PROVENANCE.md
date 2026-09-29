# Neighbour portrait provenance — Micromutual · Tramonto Ridge

Four square portraits, cropped from one generated image in this repository,
stand in for four invented neighbours. **The source is AI-generated: no real
person is depicted in it, and there is no photographer or licence to credit.**
None of them may ever be captioned, labelled or implied to be a real person, a
real policyholder, a real member of any pool, or a customer of any insurer. On
stage each one appears only beside an invented name from `index.html` (Alma R.,
Bo K., Camille H., Desmond I.), and the prototype's existing disclosure —
"Invented households, invented figures. No real insurer operates this." —
stays on screen 1 and in the closing note on screen 11.

---

## Source image

- **File**: `../../../../images/neighbors.jpg` (1536 × 1024), already in this
  repository. Not modified, not moved, not re-saved. Read only.
- **What it shows**: four adults gardening together in a front yard on a
  suburban street in late afternoon light — a woman with braided hair kneeling
  at the left, a grey-haired bearded man in a denim shirt beside her, a woman
  in a straw sun hat with a watering can behind them, and a man in a red plaid
  shirt at the right. None of them exists.
- **Origin**: generated, not photographed. Every file in `snapshot/images/` is
  exactly 1024 × 1536 or 1536 × 1024 — gpt-image's portrait and landscape
  output sizes — and carries no EXIF, no camera model, no creator field, and
  no photographer, URL or licence anywhere in this repository. The Fieldnotes
  site these images came from was originally built in ChatGPT. The client
  confirmed on 2026-09-29 that the images were generated.
- **Why this is the stronger position**: a generated face cannot be mistaken
  for a real policyholder and no one's likeness is being used, so the
  disclosure is simpler and the earlier "photographed stand-ins" wording — which
  asserted a real person was depicted — has been removed as inaccurate.

## What was cropped

Square crops taken with Pillow from the unmodified source, each centred on one
face, then resampled to 320 × 320 (Lanczos, JPEG q84). No grading, retouching,
compositing or generation — a straight crop and resize.

| File | Crop box in the source (x, y, w, h) | Subject as photographed | Used for |
|---|---|---|---|
| `alma.jpg`    | 347, 331, 232, 232 | woman with braided hair, kneeling, left of frame | **Alma R.**, no. 24 — the invented household the story follows |
| `bo.jpg`      | 570, 249, 236, 236 | grey-haired, grey-bearded man in a denim shirt    | **Bo K.**, no. 22 — the neighbour Alma likes |
| `camille.jpg` | 856,  54, 240, 240 | woman in a straw sun hat                          | **Camille H.**, no. 26 — the neighbour Alma cannot stand |
| `desmond.jpg` | 1182, 233, 242, 242 | man in a red plaid shirt, right of frame         | **Desmond I.**, no. 25 — the neighbour Alma has never met |

## Rules that bind this use

1. **The whole frame is never used.** The source shows four neighbours
   gardening happily together — the sentimental picture of neighbourliness
   that this prototype exists to argue against. Its argument is that Alma
   cannot stand Camille, has never met Desmond, and the shared work happens
   anyway, through their agents. A group shot captioned "the four" would
   contradict the thing on the screen beside it. Only individual crops are
   used, and they are never shown adjacent in a way that reassembles the
   original grouping or implies these four know each other.
2. **No portrait is ever a stand-in for Gerald S.**, the fifth neighbour, who
   withholds consent. He is deliberately outside the quartet and has no face in
   this photograph; his card carries a monogram and the refusal glyph instead.
   Pressing one of the four into service for him would be a lie about the
   source and would soften the one character the argument needs hard.
3. **No real name, no real caption.** The photograph's own subjects are not
   named here, because they are not known here. Nothing on stage attaches a
   real identity to an invented one.
4. **Decorative in the accessibility tree.** Each portrait is marked
   `aria-hidden` with an empty `alt`; the invented name beside it is the
   accessible content. A screen reader is told who the character is, never
   that a real face is present.
5. **Cropped, not modified at source.** `snapshot/images/neighbors.jpg` is
   untouched; every derivative lives in this directory.
