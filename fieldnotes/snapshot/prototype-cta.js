/*
 * "View prototype" — links each edition that has one to its interactive
 * prototype.
 *
 * The link appears in TWO places per edition, because a reader looks in both:
 *   1. the library card on the home page, beside "View thesis" and
 *      "Explore causal map" — where someone scanning the collection looks;
 *   2. the closing page (8 of 8) of that pamphlet, beside "View the thesis"
 *      and "Join the discussion" — where someone who has read it looks.
 * The first matters most: the page-8 row sits under a "For reviewers" label
 * that reads as not-for-you, and a reader who never reaches page 8 would
 * otherwise never learn the prototype exists.
 *
 * WHY A SEPARATE SCRIPT
 *
 * fieldnotes/snapshot/ is compiled output with no source maps and a minified
 * bundle. Editing the bundle to add these links would be unreviewable and
 * would be lost the next time the site is re-captured from its source. This
 * file is the whole change instead: readable, self-contained, and deletable
 * in one line from index.html.
 *
 * WHERE THE PROTOTYPES LIVE
 *
 * Each one is a self-contained static build under `prototype/<slug>/`, served
 * from this same origin. They were Claude Artifacts once; they are not any
 * more, which is why these hrefs are site-relative. Nothing here depends on
 * an artifact link, an account, or a share setting.
 *
 * Employment is the one edition with no prototype, and so has no entry below.
 *
 * WHAT IT DOES
 *
 * The reader renders, below the paper on page 8 of 8, a `nav.reviewer-links`
 * holding "For reviewers" and two links:
 *
 *   <nav class="reviewer-links" aria-label="For reviewers">
 *     <p>For reviewers</p>
 *     <div>
 *       <a href="#<slug>/thesis">View the thesis <svg …/></a>
 *       <a href="#<slug>/review">Join the discussion <svg …/></a>
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
 * The card's links live in `nav.edition-actions` inside
 * `div.gallery-entry.gallery-<slug>`. "Explore causal map" carries no class —
 * `.edition-actions a` styles it — and is composed exactly as the page-8
 * links are: a text node, a space, then the same 16px Lucide arrow-right. So
 * the same builder serves both, and no CSS is added.
 *
 * SCOPE
 *
 * Routing is hash-based and entirely client-side, so page 8 mounts and
 * unmounts as someone pages back and forth: a MutationObserver re-applies on
 * every render, and a guard attribute keeps it to exactly one link per nav
 * however often that fires. An edition absent from PROTOTYPES is never
 * touched.
 *
 * It adds links. It reads no state, writes no storage, and touches nothing
 * the reader owns.
 */
(function () {
  "use strict";

  /* slug → the prototype's path, relative to the site root. The slug is also
     the edition's class suffix (`gallery-<slug>`, `reader-<slug>`). */
  var PROTOTYPES = {
    emberwatch: "/prototype/emberwatch/",
    micromutual: "/prototype/micromutual/",
    "agent-liability": "/prototype/agent-liability/",
    longevity: "/prototype/longevity/",
    "price-certainty": "/prototype/price-certainty/",
  };

  var LABEL = "View prototype";

  /* Marks a nav we have already added to, so repeated observer callbacks and
     re-renders never produce a second link. */
  var FLAG = "data-prototype-cta";

  /* The same icon the existing links carry: Lucide `arrow-right` at 16px,
     inlined, aria-hidden. Copied attribute for attribute from the rendered
     markup so the labels sit on one baseline with one gap. */
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

  /* `label` is the accessible name. On the shelf a link is read out of the
     context of its card, so the card's version names its edition — matching
     how "Explore Emberwatch causal map" is already written. */
  function makeLink(href, label) {
    var link = document.createElement("a");
    link.href = href;
    /* A prototype is a separate application, not a route in the reader, so it
       opens in a new tab and the reader keeps their place in the pamphlet.
       Only one of the five carries its own way back, so same-tab navigation
       would strand a reader in four of them. Neither attribute changes how
       the link looks. */
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (label) link.setAttribute("aria-label", label);
    /* A text node, a space, then the icon — exactly how the neighbouring
       links are composed, so `gap: 8px` resolves the same way for all of
       them. */
    link.appendChild(document.createTextNode(LABEL + " "));
    link.appendChild(arrowRight());
    return link;
  }

  /* Page 8 of the open pamphlet, if that edition has a prototype. */
  function addReaderLink(slug, href) {
    var reader = document.querySelector("main.reader-" + slug);
    if (!reader) return;

    var nav = reader.querySelector("nav.reviewer-links");
    if (!nav || nav.hasAttribute(FLAG)) return;

    /* The links live in the nav's own div, beside the "For reviewers" label. */
    var row = nav.querySelector("div");
    if (!row) return;

    row.appendChild(makeLink(href, null));
    nav.setAttribute(FLAG, "");
  }

  /* The edition's card on the library shelf. */
  function addCardLink(slug, href, name) {
    var nav = document.querySelector(".gallery-" + slug + " nav.edition-actions");
    if (!nav || nav.hasAttribute(FLAG)) return;

    nav.appendChild(makeLink(href, "View the " + name + " prototype"));
    nav.setAttribute(FLAG, "");
  }

  /* "agent-liability" → "Agent Liability", for the accessible label only. */
  function titleOf(slug) {
    return slug
      .split("-")
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(" ");
  }

  function apply() {
    Object.keys(PROTOTYPES).forEach(function (slug) {
      var href = PROTOTYPES[slug];
      addReaderLink(slug, href);
      addCardLink(slug, href, titleOf(slug));
    });
  }

  /* The reader is a client-side hash router: cards and pages mount and
     unmount as someone navigates, and React may replace a nav wholesale.
     Observing the subtree covers every one of those cases, including the
     first render, without polling. */
  function watch() {
    apply();
    new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch, { once: true });
  } else {
    watch();
  }
})();
