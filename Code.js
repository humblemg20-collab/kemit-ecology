const SITE_NAME = "KEMIT ECOLOGY";

function doGet(e) {
  const template = HtmlService.createTemplateFromFile("App");

  const page = (e && e.parameter && e.parameter.page) || "home";
  const productId = (e && e.parameter && e.parameter.id) || "";

  template.initialRoute = productId
    ? "produit/" + productId
    : page;

  const bridge = (e && e.parameter && e.parameter.kemitBridge) || "";
  template.bridgeToken = /^[a-f0-9]{32}$/.test(bridge) ? bridge : "";

  template.initialDescription =
    "KEMIT ECOLOGY transforme et valorise la biomasse à travers des produits, de la formation et de l’accompagnement.";

  return template
    .evaluate()
    .setTitle(SITE_NAME)
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService
    .createTemplateFromFile(filename)
    .evaluate()
    .getContent();
}

function logKemitActivity(activity) {
  const data = activity || {};
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = props.getProperty("KEMIT_ACTIVITY_SHEET_ID");
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create("KEMIT ECOLOGY — Activités visiteurs");
    spreadsheetId = spreadsheet.getId();
    props.setProperty("KEMIT_ACTIVITY_SHEET_ID", spreadsheetId);
  }

  const sheet = spreadsheet.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "Événement", "Visiteur", "Session", "Page", "Produit", "Bouton", "Source"]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    String(data.event || "unknown").slice(0, 120),
    String(data.visitor_id || "").slice(0, 120),
    String(data.session_id || "").slice(0, 120),
    String(data.page || "").slice(0, 120),
    String(data.product_id || "").slice(0, 120),
    String(data.button || "").slice(0, 160),
    String(data.source || "").slice(0, 300)
  ]);

  return {ok: true};
}
