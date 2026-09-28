/*
 * "View prototype" — an Emberwatch-only third link on the closing page.
 *
 * WHY A SEPARATE SCRIPT
 *
 * fieldnotes/snapshot/ is compiled output with no source maps and a minified
 * bundle. Editing the bundle to add one link would be unreviewable and would
 * be lost the next time the site is re-captured from its source. This file is
 * the whole change instead: readable, self-contained, and deletable in one
 * line from index.html.
 *
 * WHAT IT DOES
 *
 * The reader renders, below the paper on page 8 of 8 and nowhere else, a
 * `nav.reviewer-links` holding "For reviewers" and two links:
 *
 *   <nav class="reviewer-links" aria-label="For reviewers">
 *     <p>For reviewers</p>
 *     <div>
 *       <a href="#emberwatch/thesis">View the thesis <svg …/></a>
 *       <a href="#emberwatch/review">Join the discussion <svg …/></a>
 *     </div>
 *   </nav>
 *
 * The links carry no classes of their own — `.reviewer-links a` styles them
 * (inline-flex, 8px gap, 14px, min-height 44px, and a focus-visible outline).
 * So a third `<a>` appended to that same `div`, with the same 16px Lucide
 * arrow-right after its label, is visually and behaviourally identical to the
 * two beside it, with no CSS added anywhere. The wrapper already sets
 * `flex-wrap: wrap`, so the third link wraps cleanly on a narrow stage.
 *
 * SCOPE
 *
 * The nav only exists inside `main.reader-<edition>`, and this script requires
 * that main to be `.reader-emberwatch`. The other five editions render the
 * same nav on their own page 8 and never get the link. Routing is hash-based
 * and entirely client-side, so the nav appears and disappears as the reader
 * navigates: a MutationObserver re-applies on every render, and the guard
 * attribute keeps it to exactly one link per nav however often that fires.
 *
 * It adds a link. It reads no state, writes no storage, and touches nothing
 * the reader owns.
 */
(function () {
  "use strict";

  /* The restyled Emberwatch prototype, published as its own Claude Artifact.
     Separate from the earlier dark-themed build, which remains its own
     deliverable at its own URL. */
  var PROTOTYPE_URL = "https://claude.ai/artifact/S1prjo4F42vG5bU6HKhNvb";
  var LABEL = "View prototype";

  /* Marks a nav we have already added to, so repeated observer callbacks and
     re-renders never produce a second link. */
  var FLAG = "data-prototype-cta";

  /* The same icon the two existing links carry: Lucide `arrow-right` at 16px,
     inlined, aria-hidden. Copied attribute for attribute from the rendered
     markup so the three labels sit on one baseline with one gap. */
  function arrowRight() {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("xmlns", NS);
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("class", "lucide lucide-arrow-right");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    ["M5 12h14", "m12 5 7 7-7 7"].forEach(function (d) {
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function addLink() {
    var reader = document.querySelector("main.reader-emberwatch");
    if (!reader) return;

    var nav = reader.querySelector("nav.reviewer-links");
    if (!nav || nav.hasAttribute(FLAG)) return;

    /* The links live in the nav's own div, beside the "For reviewers" label. */
    var row = nav.querySelector("div");
    if (!row) return;

    var link = document.createElement("a");
    link.href = PROTOTYPE_URL;
    /* The two neighbours are in-page hash routes; this one leaves the site,
       so it opens in a new tab and the reader keeps their place in the
       pamphlet. Neither attribute changes how the link looks. */
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    /* A text node, a space, then the icon — exactly how the other two are
       composed, so `gap: 8px` resolves the same way for all three. */
    link.appendChild(document.createTextNode(LABEL + " "));
    link.appendChild(arrowRight());

    row.appendChild(link);
    nav.setAttribute(FLAG, "");
  }

  /* The reader is a client-side hash router: page 8 mounts and unmounts as
     someone pages back and forth, and React may replace the nav wholesale.
     Observing the subtree covers every one of those cases, including the
     first render, without polling. */
  function watch() {
    addLink();
    new MutationObserver(addLink).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch, { once: true });
  } else {
    watch();
  }
})();
