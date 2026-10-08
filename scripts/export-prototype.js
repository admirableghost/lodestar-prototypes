#!/usr/bin/env node
/*
 * Export one prototype as a single self-contained HTML file.
 *
 *   node scripts/export-prototype.js <slug> "<Title>"
 *
 * Reads fieldnotes/snapshot/prototype/<slug>/index.html and inlines its
 * stylesheet, script, photographs, fonts and favicon as data URIs, so the
 * file opens from disk with no server and makes no request. Site-relative
 * links that would dangle from disk (the way back to the workshop) are
 * rewritten to the live origin. Output: exports/<Title>.html.
 */
"use strict";
const fs = require("fs"), path = require("path");
const [slug, title] = process.argv.slice(2);
if (!slug || !title) { console.error("usage: export-prototype.js <slug> \"<Title>\""); process.exit(2); }
const ROOT = path.resolve(__dirname, "..");
const SNAP = path.join(ROOT, "fieldnotes", "snapshot");
const DIR = path.join(SNAP, "prototype", slug);
const LIVE = "https://fieldnotes-khaki-three.vercel.app";
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2" };
const dataUri = (file) => { const ext = path.extname(file).toLowerCase(); const mime = MIME[ext]; if (!mime) throw new Error("no mime for " + file); return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`; };
const isLocal = (u) => u && !/^(data:|https?:|\/\/|#|%23)/.test(u);

let html = fs.readFileSync(path.join(DIR, "index.html"), "utf8");
const inlined = [];
/* Every photograph is embedded exactly once, in one map, and every reference
   (markup or script) points at the map: a photo used on three screens costs
   one data URI, not three. The bootstrap assigns the map to each <img>. */
const PHOTOS = {};
const photoKey = (u) => { const f = path.resolve(DIR, u); if (!fs.existsSync(f) || !/\.(jpe?g|png|webp)$/i.test(f)) return null; const k = path.relative(DIR, f).split(path.sep).join("/"); if (!PHOTOS[k]) { PHOTOS[k] = dataUri(f); inlined.push(k); } return k; };

// stylesheet, with its url() references (fonts, grain) inlined directly
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => {
  let css = fs.readFileSync(path.join(DIR, href), "utf8");
  css = css.replace(/url\((['"]?)([^'")]+)\1\)/g, (mm, q, u) => { if (!isLocal(u) || u.startsWith("data:")) return mm; const f = path.join(DIR, path.dirname(href), u); inlined.push(path.relative(DIR, f)); return `url("${dataUri(f)}")`; });
  inlined.push(href);
  return `<style>\n${css}\n</style>`;
});
// script: photo string literals become map lookups
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  let js = fs.readFileSync(path.join(DIR, src), "utf8");
  js = js.replace(/"((?:photos|assets|images)\/[^"]+\.(?:jpe?g|png|webp))"/g, (mm, u) => { const k = photoKey(u); return k ? `window.__PHOTOS[${JSON.stringify(k)}]` : mm; });
  js = js.replace(/<\/script/gi, "<\\/script");
  inlined.push(src);
  return `<script>\n${js}\n</script>`;
});
// markup: <img src> becomes a data-photo key; the favicon is inlined directly
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
html = html.replace(/<img\b[^>]*>/g, (tag) => tag.replace(/\ssrc="([^"]+)"/, (m, u) => { const k = isLocal(u) ? photoKey(u) : null; return k ? ` src="${BLANK}" data-photo="${k}"` : m; }));
html = html.replace(/(<link\b[^>]*?\shref=")([^"]+)(")/g, (m, a, u, b) => { if (!isLocal(u)) return m; const f = path.resolve(DIR, u); if (!fs.existsSync(f) || !MIME[path.extname(f).toLowerCase()]) return m; inlined.push(path.relative(DIR, f)); return a + dataUri(f) + b; });
// the photo map and its bootstrap go in before the first script
const boot = `<script>\nwindow.__PHOTOS = ${JSON.stringify(PHOTOS)};\n(function(){function fill(){var m=window.__PHOTOS,i,els=document.querySelectorAll("img[data-photo]");for(i=0;i<els.length;i++){if(m[els[i].getAttribute("data-photo")]){els[i].src=m[els[i].getAttribute("data-photo")];}}}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",fill);}else{fill();}})();\n</script>\n`;
html = html.replace(/<script>\n/, boot + "<script>\n");
// the way back to the workshop, and any other site-relative anchor
html = html.replace(/(<a\b[^>]*?\shref=")([^"]+)(")/g, (m, a, u, b) => {
  if (!isLocal(u)) return m;
  const abs = "/" + path.posix.normalize(path.posix.join("prototype", slug, u)).replace(/^\/+/, "");
  return a + LIVE + abs + b;
});
const today = new Date().toISOString().slice(0, 10);
html = `<!-- Exported ${today} from ${LIVE}/prototype/${slug}/ as a single self-contained file. -->\n` + html;
fs.mkdirSync(path.join(ROOT, "exports"), { recursive: true });
const out = path.join(ROOT, "exports", `${title}.html`);
fs.writeFileSync(out, html);
const left = (html.match(/<(?:img|link|script|a)\b[^>]*\s(?:src|href)="(?!data:|https?:|#)[^"]*"/g) || []);
console.log(`wrote ${path.relative(ROOT, out)} · ${(fs.statSync(out).size / 1024).toFixed(0)} KB · inlined ${[...new Set(inlined)].length} files · remaining relative refs: ${left.length ? left.join(", ") : "none"}`);
