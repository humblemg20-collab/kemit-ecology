#!/usr/bin/env node
/**
 * KEMIT ECOLOGY — read-only regression contract.
 * Usage: node scripts/verify-kemit-conversion-v2.mjs
 * Tests code structure, catalog, media registry and navigation without deploying.
 * External CDN availability requires a separate live-browser/network check.
 */
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {Script} from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = name => readFileSync(resolve(root, name), "utf8");
const strip = text => text.replace(/^\s*<script>\s*/, "").replace(/\s*<\/script>\s*$/, "");
const pageNames = ["PageHome", "PageBoutique", "PageProduit", "PageProfessionnels",
  "PageSavoirFaire", "PageHistoire", "PageLivraison", "PageFAQ", "PageContact"];
const routeNames = ["home","boutique","produit","professionnels","savoir-faire",
  "histoire","livraison","faq","contact"];
const app = read("App.html");
const head = read("Header.html");
const footer = read("Footer.html");
const script = read("Script.html");
const styleFiles = ["StylesFoundation.html","StylesMotion.html","StylesExperience.html","StylesSavoirFaire.html"];
const styles = styleFiles.map(read).join("\n");
const stylesEntry = read("Styles.html");
const media = read("Media.html");
const productsModule = read("Products.html");
const js = strip(script);
const mediaJs = strip(media);
const productsJs = strip(productsModule);
const home = read("PageHome.html");
const boutique = read("PageBoutique.html");
const pro = read("PageProfessionnels.html");
const productPage = read("PageProduit.html");
const pages = pageNames.map(name => ({name, html:read(name + ".html")}));
const productMatch = productsModule.match(/window\.KEMIT_PRODUCTS = (\[[^\n]*\]);/);
const mediaMatch = media.match(/window\.KEMIT_MEDIA = (\{[\s\S]*?\});/);
assert.ok(productMatch, "catalog missing");
assert.ok(mediaMatch, "media registry missing");
const products = JSON.parse(productMatch[1]);
const registry = JSON.parse(mediaMatch[1]);

let count = 0;
function check(name, fn) {
  fn();
  console.log("PASS " + name);
  count += 1;
}
check("All Apps Script includes are present", () => {
  for (const match of app.matchAll(/include\("([^"]+)"\)/g)) {
    assert.ok(existsSync(resolve(root,match[1]+".html")),match[1]+".html missing");
  }
  for (const name of pageNames) assert.ok(app.includes('include("'+name+'")'), name);
  assert.ok(app.indexOf('include("Media")') < app.indexOf('include("Products")'));
  assert.ok(app.indexOf('include("Products")') < app.indexOf('include("Script")'));
  for(const name of styleFiles) {
    assert.ok(stylesEntry.includes('include("'+name.replace(".html","")+'")'),name);
  }
});
check("JavaScript syntax parses", () => {
  new Script(js,{filename:"Script.html"});
  new Script(mediaJs,{filename:"Media.html"});
  new Script(productsJs,{filename:"Products.html"});
});
check("All SPA routes are unique and linked", () => {
  const found = pages.map(p => {
    const m = p.html.match(/data-page="([^"]+)"/);
    assert.ok(m,p.name);
    return m[1];
  });
  assert.equal(new Set(found).size,pageNames.length);
  assert.deepEqual(new Set(found),new Set(routeNames));
  for(const html of [head,footer,...pages.map(p=>p.html)]) {
    for(const [,route] of html.matchAll(/data-route="([^"]+)"/g)) {
      assert.ok(routeNames.includes(route),"unknown route: "+route);
    }
  }
  assert.ok(js.includes("function updateRouteMeta("),"route SEO missing");
  assert.ok(js.includes('meta[name="description"]'),"description update missing");
});
check("Catalogue unique, with explicit FCFA prices and no hidden products", () => {
  assert.equal(new Set(products.map(p=>p.id)).size,products.length);
  assert.equal(products.length,5);
  assert.ok(!products.some(p=>p.id==="anti-poison"),"withdrawn product still in source");
  assert.ok(!js.includes("usd * 600"),"runtime USD conversion must not return");
  assert.ok(!js.includes("KEMIT_PRODUCTS = window.KEMIT_PRODUCTS.filter"));
  assert.ok(!js.includes("window.KEMIT_PRODUCTS = ["),"catalog duplicated in runtime code");
  for(const p of products) {
    assert.ok(p.name && p.category && p.formats?.length,p.id);
    for(const format of p.formats) assert.match(format.price,/^[\d\s\u00a0\u202f]+ FCFA$/,"price "+p.id);
  }
});
check("All used media keys are registered with populated URLs", () => {
  const used = [];
  for(const p of pages) {
    for(const [,key] of p.html.matchAll(/data-media="([^"]+)"/g)) used.push(p.name+":"+key);
    for(const [,key] of p.html.matchAll(/data-video-media="([^"]+)"/g)) used.push(p.name+":"+key);
  }
  for(const p of products) {
    used.push("catalog:"+p.media);
    if(p.sceneMedia) used.push("catalog:"+p.sceneMedia);
  }
  for(const item of used) {
    const key=item.slice(item.indexOf(":")+1);
    assert.ok(registry[key],item+" unresolved");
    assert.match(registry[key],/^https:\/\//,item+" URL invalid");
  }
});
check("Every GitHub-backed media URL is immutable and files exist", () => {
  const prefix1="https://cdn.jsdelivr.net/gh/humblemg20-collab/kemit-ecology@";
  const prefix2="https://raw.githubusercontent.com/humblemg20-collab/kemit-ecology/";
  for(const [key,url] of Object.entries(registry)){
    if(!url) continue;
    let m;
    if(url.startsWith(prefix1)){
      m=url.slice(prefix1.length).match(/^([0-9a-f]{40})\/(assets\/.+)$/);
    } else if(url.startsWith(prefix2)){
      m=url.slice(prefix2.length).match(/^([0-9a-f]{40})\/(assets\/.+)$/);
    } else continue;
    assert.ok(m,"unpinned URL: "+key);
    assert.ok(existsSync(resolve(root,m[2])),"missing asset: "+m[2]);
  }
});
check("Media hydration has failure fallbacks; videos use central registry", () => {
  assert.ok(js.includes("function hydrateImages(root)"));
  assert.ok(js.includes('img.addEventListener("error"'));
  assert.ok(js.includes("function hydrateVideos(root)"));
  assert.ok(js.includes("hydrateVideos();"));
  assert.ok(styles.includes(".kemit-photo-fallback"));
  assert.ok(read("PageSavoirFaire.html").includes('data-video-media="terrain-video-01"'));
  assert.ok(read("PageSavoirFaire.html").includes('data-video-media="terrain-video-02"'));
  assert.ok(!read("PageSavoirFaire.html").includes('<video src="http'));
});
check("IntersectionObserver motion is replayable and not globally bypassed", () => {
  assert.ok(js.includes("IntersectionObserver"));
  assert.ok(js.includes("resetInactivePageMotion(activePage)"));
  assert.ok(js.includes("revealViewportItems"));
  assert.ok(!/setTimeout\([\s\S]*?querySelectorAll\("\.motion-ready \.reveal-item"\)/.test(js));
});
check("Both sales journeys validate fields and do not promise a sale", () => {
  for(const field of ["company","product","quantity","unit","frequency","destination","notes"]) {
    assert.ok(pro.includes('name="'+field+'"'),"missing field "+field);
  }
  assert.ok(js.includes("form.reportValidity()"));
  assert.ok(js.includes("Number.isFinite(quantity)"));
  assert.ok(js.includes("Number.isSafeInteger(qty)"));
  assert.ok(js.includes("kemit_b2b_quote_click"));
  assert.ok(js.includes("kemit_retail_order_click"));
  assert.ok(js.includes("WHATSAPP_BASE + WHATSAPP"),"WhatsApp URL path missing");
  assert.ok(productPage.includes("data-product-image-fallback"));
  assert.ok(pro.includes("Aucune commande n'est confirmée automatiquement"));
});
check("Accessible mobile menu and intentional image loading", () => {
  assert.ok(head.includes('aria-expanded="false"'));
  assert.ok(head.includes('aria-controls="kemit-main-nav"'));
  assert.ok(js.includes('setAttribute("aria-expanded"'));
  assert.ok(home.includes('fetchpriority="high"'));
  assert.ok(boutique.includes('fetchpriority="high"'));
  assert.ok(productPage.includes('fetchpriority="high"'));
});
check("Only active page media are hydrated; lead visual is preloaded early", () => {
  assert.equal((app.match(/include\("Media"\)/g) || []).length, 1);
  assert.ok(app.indexOf('include("Media")') < app.indexOf('</head>'));
  assert.ok(app.includes('rel="preconnect" href="https://cdn.jsdelivr.net"'));
  assert.ok(app.includes('link.rel = "preload"'));
  assert.ok(app.includes('link.as = "image"'));
  assert.ok(js.includes('root || active || document'),"media hydration should scope to active route");
  assert.ok(js.includes('hydrateImages();\n    hydrateVideos();\n    window.scrollTo'),"media hydration must run after route activation");
  assert.ok(!js.includes('siteInitialized = true;\n    hydrateImages();'),"inactive pages must not hydrate on boot");
  assert.ok(styles.includes('.home-cinematic-hero .hero-photo.reveal-item'));
});

check("Savoir-faire is a complete, linked and responsive editorial experience", () => {
  const craft = read("PageSavoirFaire.html");
  const craftStyle = read("StylesSavoirFaire.html");
  assert.ok(app.includes('include("Styles")'));
  assert.ok(stylesEntry.includes('include("StylesSavoirFaire")'),"Savoir-faire CSS not included");
  assert.match(craft,/class="app-page savoir-faire-page sf-page" data-page="savoir-faire"/);
  for (let n=1;n<=5;n++) {
    const key=String(n).padStart(2,"0");
    assert.ok(craft.includes('id="sf-step-'+key+'"'),"missing step "+key);
    assert.ok(craft.includes('id="sf-step-title-'+key+'"'),"missing title "+key);
  }
  const ids=new Set([...craft.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  const jumps=[...craft.matchAll(/data-sf-scroll="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(jumps.length,7,"five steps and two in-page controls expected");
  for(const id of jumps) assert.ok(ids.has(id),"unknown scroll target "+id);
  assert.ok(js.includes('e.target.closest("[data-sf-scroll]")'),"scroll controls missing");
  assert.ok(js.includes('video.dataset.posterMedia'),"video poster support missing");
  assert.equal((craft.match(/data-video-media="/g)||[]).length,2);
  assert.equal((craft.match(/data-poster-media="/g)||[]).length,2);
  assert.ok(craftStyle.includes(".sf-page .sf-step-layout"));
  assert.ok(craftStyle.includes(".sf-page .sf-process-index-wrap"));
  assert.ok(craftStyle.includes("@media(max-width:760px)"));
  assert.ok(craftStyle.includes("prefers-reduced-motion:reduce"));
  assert.ok(js.includes(".sf-image-frame, .sf-hero-media"),"image fallback missing");
  assert.ok(!js.includes("img.naturalWidth === 0"),"lazy-loaded images should not be treated as failed prematurely");
});
check("Reduced motion and keyboard focus remain supported", () => {
  assert.ok(styles.includes("prefers-reduced-motion"));
  assert.ok(styles.includes(":focus-visible"));
});
console.log("KEMIT_CONTRACT=PASS checks="+count);
console.log("KEMIT_DEPLOYMENT=MANUAL");
