const SITE_NAME = "KEMIT ECOLOGY";
const ACTIVE_KEMIT_CAMPAIGN_SHEET_ID = "1kkixhEPmiMjm-FQ4fslneqwrMaUtKmyEY_h9IWx4ELQ";

function getKemitActivitySpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = ACTIVE_KEMIT_CAMPAIGN_SHEET_ID || props.getProperty("KEMIT_ACTIVE_SHEET_ID");
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);

  const spreadsheet = SpreadsheetApp.create("KEMIT ECOLOGY — Activités visiteurs");
  props.setProperty("KEMIT_ACTIVE_SHEET_ID", spreadsheet.getId());
  return spreadsheet;
}

function startNewKemitCampaign() {
  const props = PropertiesService.getScriptProperties();
  const oldId = props.getProperty("KEMIT_ACTIVE_SHEET_ID") || props.getProperty("KEMIT_ACTIVITY_SHEET_ID") || "";
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Africa/Douala", "yyyy-MM-dd");
  const spreadsheet = SpreadsheetApp.create("KEMIT ECOLOGY — Campagne à partir du " + stamp);
  props.setProperty("KEMIT_ACTIVE_SHEET_ID", spreadsheet.getId());
  getKemitSheet_(spreadsheet, "Activités", ["Date", "Événement", "Visiteur", "Session", "Page", "Produit", "Bouton", "Source"]);
  getKemitSheet_(spreadsheet, "Prospects", [
    "Date", "Type", "Nom", "Téléphone", "E-mail", "Entreprise", "Pays", "Ville", "Quartier",
    "Produit / service", "Format", "Quantité", "Unité", "Fréquence", "Budget", "Notes", "Source",
    "Statut", "Responsable", "Prochaine action", "Date de relance", "Visiteur", "Session"
  ]);
  return {ok: true, spreadsheetId: spreadsheet.getId(), url: spreadsheet.getUrl(), oldId};
}

function getKemitSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

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
  const spreadsheet = getKemitActivitySpreadsheet_();
  const sheet = getKemitSheet_(spreadsheet, "Activités", ["Date", "Événement", "Visiteur", "Session", "Page", "Produit", "Bouton", "Source"]);

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

function logKemitLead(lead) {
  const data = lead || {};
  const spreadsheet = getKemitActivitySpreadsheet_();
  const sheet = getKemitSheet_(spreadsheet, "Prospects", [
    "Date", "Type", "Nom", "Téléphone", "E-mail", "Entreprise", "Pays", "Ville", "Quartier",
    "Produit / service", "Format", "Quantité", "Unité", "Fréquence", "Budget", "Notes", "Source",
    "Statut", "Responsable", "Prochaine action", "Date de relance", "Visiteur", "Session"
  ]);

  const clean = value => String(value == null ? "" : value).slice(0, 1000);
  sheet.appendRow([
    new Date(),
    clean(data.type || "demande"),
    clean(data.name),
    clean(data.phone),
    clean(data.email),
    clean(data.company),
    clean(data.country),
    clean(data.city),
    clean(data.neighborhood),
    clean(data.product),
    clean(data.format),
    clean(data.quantity),
    clean(data.unit),
    clean(data.frequency),
    clean(data.budget),
    clean(data.notes),
    clean(data.source || "direct"),
    "Nouveau",
    "À désigner",
    "Contacter le prospect",
    "",
    clean(data.visitor_id),
    clean(data.session_id)
  ]);

  return {ok: true};
}
