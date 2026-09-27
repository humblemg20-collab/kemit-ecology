/**
 * =========================================================
 * KEMIT ECOLOGY
 * Backend Google Apps Script
 * SPA frontend
 * =========================================================
 */

const KEMIT_ECOLOGY = Object.freeze({

  brandName: "KEMIT ECOLOGY",

  pages: Object.freeze({
    home: "PageHome",
    boutique: "PageBoutique",
    produit: "PageProduit",
    "savoir-faire": "PageSavoirFaire",
    histoire: "PageHistoire",
    livraison: "PageLivraison",
    faq: "PageFAQ",
    contact: "PageContact"
  }),

  titles: Object.freeze({
    home: "KEMIT ECOLOGY — Nous produisons l’énergie de demain aujourd’hui",
    boutique: "Boutique — KEMIT ECOLOGY",
    produit: "Produit — KEMIT ECOLOGY",
    "savoir-faire": "Notre savoir-faire — KEMIT ECOLOGY",
    histoire: "Notre histoire — KEMIT ECOLOGY",
    livraison: "Livraison — KEMIT ECOLOGY",
    faq: "FAQ — KEMIT ECOLOGY",
    contact: "Contact — KEMIT ECOLOGY"
  }),

  descriptions: Object.freeze({
    home: "KEMIT ECOLOGY valorise des biomasses locales et des déchets organiques en solutions pour l’énergie, l’agriculture et différents usages techniques.",
    boutique: "Découvrez les produits KEMIT ECOLOGY, leurs formats et les prix communiqués.",
    produit: "Consultez les informations d’un produit KEMIT ECOLOGY et préparez votre demande de commande.",
    "savoir-faire": "Découvrez la chaîne de valorisation de biomasse et les trois pôles d’activité de KEMIT ECOLOGY.",
    histoire: "Découvrez l’ancrage camerounais et le positionnement de KEMIT ECOLOGY.",
    livraison: "Découvrez le parcours de commande et de livraison KEMIT ECOLOGY.",
    faq: "Réponses essentielles sur les produits, commandes et livraisons KEMIT ECOLOGY.",
    contact: "Contactez KEMIT ECOLOGY pour une commande, une formation ou un accompagnement."
  })

});


function doGet(e) {

  const requestedPage =
    e && e.parameter
      ? e.parameter.page
      : "";


  const page =
    normaliserPage_(
      requestedPage
    );


  const productId =
    e && e.parameter && e.parameter.id
      ? String(e.parameter.id)
      : "";


  const template =
    HtmlService.createTemplateFromFile(
      "App"
    );


  template.initialPage =
    page;


  template.initialProductId =
    productId;


  template.initialDescription =
    KEMIT_ECOLOGY.descriptions[page];


  template.whatsappPrimary =
    "237678420995";


  template.whatsappInternational =
    "16462344921";


  template.contactEmail =
    "kemit.ecology@yahoo.com";


  template.currentYear =
    new Date().getFullYear();


  return template
    .evaluate()

    .setTitle(
      KEMIT_ECOLOGY.titles[page]
    )

    .addMetaTag(
      "viewport",
      "width=device-width, initial-scale=1"
    )

    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );

}


function include(filename, data) {

  const template =
    HtmlService.createTemplateFromFile(
      filename
    );


  Object.keys(
    data || {}
  ).forEach(
    function(key) {

      template[key] =
        data[key];

    }
  );


  return template
    .evaluate()
    .getContent();

}


function normaliserPage_(page) {

  page =
    String(
      page || ""
    )
    .trim()
    .toLowerCase();


  return Object.prototype.hasOwnProperty.call(
    KEMIT_ECOLOGY.pages,
    page
  )
    ? page
    : "home";

}
