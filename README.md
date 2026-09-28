# Fieldnotes — Insurance Concepts

Six pamphlets exploring speculative insurance products, captured from the
ChatGPT-hosted deployment at
`https://fieldnotes-insurance-concepts.prashanthv-aiesec.chatgpt.site/`
on 29 September 2026.

The hosting account ran out of credits, so this repository exists to keep the
work alive and editable outside that platform.

## What is in here

| Path | What it is |
|---|---|
| `snapshot/` | A byte-faithful mirror of the deployed site. Runs offline. |
| `content/` | Every pamphlet's text, extracted page by page, as Markdown and JSON. |
| `serve.sh` | Serves `snapshot/` on <http://localhost:8765>. |

## Run it

```sh
./serve.sh          # then open http://localhost:8765
```

Any static server works — `python3 -m http.server`, `npx serve snapshot`,
GitHub Pages pointed at `snapshot/`. The site is entirely client-side: all six
editions are one HTML page with hash routing (`#micromutual`, `#emberwatch`,
`#employment`, `#agent-liability`, `#longevity`, `#price-certainty`), so it
needs no server logic and no build step.

Verified after capture: all six editions render, page navigation works, and the
page makes no failing requests.

## What was recoverable, and what was not

The deployment is **compiled output**, not source. It is a Vite/RSC ("vinext")
React build, and **no source maps were published** — `.js.map` returns 404 for
every chunk. So the original component source cannot be recovered from it.

What that leaves:

- **Fully recovered.** Every word of every pamphlet, all thirteen images, the
  stylesheets, and a working site. The build minified identifiers but left all
  content strings intact, and `content/` captures them in authored order.
- **Not recovered.** The React/TSX components, the build configuration, and
  whatever authoring tooling produced them. `snapshot/_next/static/chunks/*.js`
  is minified; it runs, but it is not practical to edit.

### So how do you change something?

- **Copy edits** can be made against `content/` and then reapplied — but the
  snapshot's bundle would have to be patched by hand, which is tolerable for a
  word and unpleasant for a paragraph.
- **Anything structural** is better served by rebuilding the reader from
  `content/` as a small, plain project. The content is the asset; the shell
  around it is a few hundred lines of layout. That rebuild has not been done
  here — this commit is the capture.

## A note on wording drift

The six persona reviews conducted on 26 September quote wording that has since
changed. For example, Micromutual page 6 was quoted then as *"Imagine a $5,000
fence repair. Assume the pool includes this storm damage and the existing policy
makes no payment in this example."* and reads in this capture as *"Imagine a
$5,000 storm-damaged fence repair that your policy doesn't cover, but your pool
includes."* Treat `content/` as of 29 September, not as of the review.

## Capture method

```
snapshot/   curl of / and every asset it references, plus the thirteen
            /images/* files referenced from the JS bundle rather than the HTML.
            Cloudflare's injected bot-challenge <script> was removed; nothing
            else was altered.
content/    Headless Chromium walked each edition's page picker (8 pages plus
            the Discussion panel, 54 entries in all) and captured the rendered
            text in document order, with each page's type classes and images.
```

## Provenance and status

These are **concept pamphlets for discussion**. Every edition carries its own
disclaimer — not an insurance offer, not financial advice, fictional households
and figures. Nothing here is a product, and nothing here should be presented as
one.
