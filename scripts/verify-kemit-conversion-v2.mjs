#!/usr/bin/env node
/**
 * KEMIT ECOLOGY V2 — deterministic repository contract checks.
 * Run: node scripts/verify-kemit-conversion-v2.mjs
 * No network requests, deployments, credentials or paid services.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
let passed = 0;
function check(label, fn) {
  fn();
  console.log('PASS ' + label);
  passed++;
}

const app=read('App.html'), header=read('Header.html'), footer=read('Footer.html');
const home=read('PageHome.html'), boutique=read('PageBoutique.html');
const product=read('PageProduit.html'), pro=read('PageProfessionnels.html');
const contact=read('PageContact.html'), faq=read('PageFAQ.html');
const script=read('Script.html'), styles=read('Styles.html'), media=read('Media.html');
const pages=['home','boutique','produit','professionnels','savoir-faire','histoire','livraison','faq','contact'];
const names=['PageHome','PageBoutique','PageProduit','PageProfessionnels','PageSavoirFaire','PageHistoire','PageLivraison','PageFAQ','PageContact'];
const js=script.replace(/^<script>\s*/, '').replace(/<\/script>\s*$/, '');
const mediaJs=media.replace(/^<script>\s*/, '').replace(/<\/script>\s*$/, '');
const productsMatch=script.match(/window\.KEMIT_PRODUCTS = (\[[^\n]*\]);/);
const mediaMatch=media.match(/window\.KEMIT_MEDIA = (\{[\s\S]*?\});/);

check('Apps Script includes every existing and new page',()=>{
  for(const name of names)assert.ok(app.includes('include("'+name+'")'),name);
});
check('All declared page sections are routable and distinct',()=>{
  for(const id of pages)assert.ok(script.includes('"'+id+'"'), id);
  for(const name of names) {
    const html=read(name+'.html');
    const match=html.match(/data-page="([^"]+)"/);
    assert.ok(match,name);
    assert.ok(pages.includes(match[1]), name);
  }
  for(const html of [header,footer,home,boutique,product,pro,contact,faq]){
    for(const [,route] of html.matchAll(/data-route="([^"]+)"/g)) {
      assert.ok(pages.includes(route), 'unknown route '+route);
    }
  }
});
check('Javascript syntax is valid in both HTML script modules',()=>{
  new Script(js,{filename:'Script.html'});
  new Script(mediaJs,{filename:'Media.html'});
});
check('Homepage exposes two separate commercial journeys',()=>{
  assert.ok(home.includes('data-route="boutique"'));
  assert.ok(home.includes('data-route="professionnels"'));
  assert.equal((home.match(/<!-- [1-6]\./g)||[]).length,6);
  assert.ok(header.includes('data-route="professionnels"'));
});
check('B2B request form uses the actual catalogue and checks required fields',()=>{
  for(const field of ['company','product','quantity','unit','frequency','destination','notes']){
    assert.ok(pro.includes('name="'+field+'"'),'missing '+field);
  }
  assert.ok(pro.includes('data-b2b-form'));
  assert.ok(js.includes('populateProfessionalProducts()'));
  assert.ok(js.includes('window.KEMIT_PRODUCTS.forEach(product =>'));
  assert.ok(js.includes('form.reportValidity()'));
  assert.ok(js.includes('Number.isFinite(quantity)'));
  assert.ok(js.includes('trackKemitIntent("kemit_b2b_quote_click"'));
});
check('Retail ordering checks quantity and destination',()=>{
  assert.ok(product.includes('data-order-qty required'));
  assert.ok(product.includes('data-order-destination required'));
  assert.ok(js.includes('qtyField?.reportValidity()'));
  assert.ok(js.includes('destField?.reportValidity()'));
  assert.ok(js.includes('Number.isSafeInteger(qty)'));
  assert.ok(js.includes('trackKemitIntent("kemit_retail_order_click"'));
});
check('Product fallback is explicit when approved photos are unavailable',()=>{
  assert.ok(product.includes('data-product-image-fallback'));
  assert.ok(js.includes('product-media-placeholder'));
  assert.ok(js.includes('kemit-photo-fallback'));
  assert.ok(styles.includes('.kemit-photo-fallback'));
});
check('Commercial catalogue is unique and mapped to all B2B selections',()=>{
  assert.ok(productsMatch,'product list is missing');
  const products=JSON.parse(productsMatch[1]);
  assert.ok(products.length>=5,'expected catalog records');
  assert.equal(new Set(products.map(p=>p.id)).size,products.length,'duplicate product ids');
  for(const p of products){
    assert.ok(p.name && p.category && p.formats?.length>0,'incomplete product '+p.id);
  }
  assert.ok(js.includes('select.value = currentProduct.id'),'B2B product preselection missing');
});
check('Homepage uses only defined non-empty approved photo references',()=>{
  assert.ok(mediaMatch,'media registry missing');
  const registry=JSON.parse(mediaMatch[1]);
  const keys=[...home.matchAll(/data-media="([^"]+)"/g)].map(m=>m[1]);
  for(const key of keys)assert.ok(registry[key], 'unresolved homepage asset: '+key);
});
check('All seven user-supplied photos are registered and rendered once in Boutique',()=>{
  const registry=JSON.parse(mediaMatch[1]);
  const provided=JSON.parse(read('docs/kemit-photo-candidates.json'));
  assert.equal(provided.unique_images,7);
  assert.equal(provided.submitted_links,9);
  assert.equal(provided.candidates.length,7);
  assert.equal(new Set(provided.candidates.map(x=>x.source_url)).size,7);
  const imgKeys=[...boutique.matchAll(/<img[^>]*data-media="(kemit-gallery-\d+)"/g)].map(m=>m[1]);
  assert.equal(imgKeys.length,7);
  assert.equal(new Set(imgKeys).size,7);
  for(const entry of provided.candidates){
    assert.ok(imgKeys.includes(entry.gallery_key),'missing photo '+entry.gallery_key);
    assert.equal(registry[entry.gallery_key],entry.source_url,'URL mismatch '+entry.gallery_key);
    assert.equal(entry.product_id,null,'unverified product linkage '+entry.gallery_key);
    assert.equal(entry.status,'INTEGRATED_GENERAL_GALLERY');
  }
  assert.ok(js.includes('has-loaded'),'gallery load-state missing');
  assert.ok(js.includes('img.addEventListener("error"'),'gallery load failure missing');
  assert.ok(styles.includes('.kemit-gallery-grid'),'gallery responsive styles missing');
  assert.ok(styles.includes('.kemit-gallery-card.has-loaded'),'gallery image transition missing');
});

check('B2B and retail both avoid pretending a sale is confirmed',()=>{
  assert.ok(pro.includes("Aucune commande n'est confirmée automatiquement"));
  assert.ok(product.includes('avant tout règlement'));
  assert.ok(js.includes('https://wa.me/'));
  assert.ok(contact.includes('data-route="professionnels"'));
});

const registry=JSON.parse(mediaMatch[1]);
const missingAssets = [];
for(const name of names){
  for(const [,key] of read(name+'.html').matchAll(/data-media="([^"]+)"/g)){
    if(!registry[key]) missingAssets.push(name+':'+key);
  }
}
console.log('KEMIT_CONVERSION_V2_CONTRACT=PASS checks='+passed);
const products=JSON.parse(productsMatch[1]);
const missingProductImages=products.filter(p=>!registry[p.media]).map(p=>p.id+':'+p.media);
console.log('KEMIT_UNRESOLVED_PAGE_PHOTOS='+[...new Set(missingAssets)].join(','));
console.log('KEMIT_UNRESOLVED_PRODUCT_PHOTOS='+missingProductImages.join(','));
console.log('KEMIT_DEPLOYMENT=NOT_AUTHORIZED');
