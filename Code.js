const SITE_NAME = "KEMIT ECOLOGY";

function doGet(e) {
  const template = HtmlService.createTemplateFromFile("App");

  const page = (e && e.parameter && e.parameter.page) || "home";
  const productId = (e && e.parameter && e.parameter.id) || "";

  template.initialRoute = productId
    ? "produit/" + productId
    : page;

  template.initialDescription =
    "KEMIT ECOLOGY transforme et valorise la biomasse à travers des produits, de la formation et de l’accompagnement.";

  return template
    .evaluate()
    .setTitle(SITE_NAME)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService
    .createTemplateFromFile(filename)
    .evaluate()
    .getContent();
}
