# KEMIT ECOLOGY — Apps Script SPA v5

Architecture calquée sur le principe Humble Labs.

## Coquille unique
- App.html

## Backend
- Code.js

## Composants globaux
- Header.html
- Footer.html
- Logo.html
- Media.html
- Styles.html
- Script.html

## Pages SPA — fragments uniquement
- PageHome.html
- PageBoutique.html
- PageProduit.html
- PageSavoirFaire.html
- PageHistoire.html
- PageLivraison.html
- PageFAQ.html
- PageContact.html

Les fichiers Page*.html NE SONT PAS des documents HTML autonomes.
Ils sont inclus dans App.html et affichés/masqués par Script.html.

## Navigation
La navigation fonctionne côté client :

#home
#boutique
#produit/biochar
#savoir-faire
#histoire
#livraison
#faq
#contact

Les routes ?page=... restent supportées pour ouvrir directement une page initiale :
/exec?page=boutique
/exec?page=produit&id=biochar

## Déploiement
1. Extraire le ZIP.
2. Ouvrir PowerShell dans le dossier.
3. `clasp push`
4. Apps Script → Deploy → Manage deployments → Edit
5. New version → Deploy
6. Recharger l’URL `/exec` avec Ctrl+F5.

## Important
Le design de la homepage validée est conservé.
Les images sont centralisées dans Media.html pour éviter leur duplication dans chaque page.
Les produits sont centralisés dans Script.html en attendant le branchement Google Sheets.


## v5.1 META FIX

Correction du crash Apps Script :
`HtmlOutput.addMetaTag("description", ...)` n'est pas autorisé.

La meta description est maintenant rendue directement dans `App.html`.
`addMetaTag("viewport", ...)` est conservé.


## v5.2 — CONTENT DEPTH

La homepage validée n'a pas été modifiée.

Pages enrichies :
- Boutique : usages, professionnels, parcours commande, stock/distribution.
- Produit : utilisateurs, précautions, conservation, commande, produits associés, FAQ.
- Savoir-faire : matière, galerie, chaîne de valorisation, trois pôles, publics concernés.
- Histoire : raison d'être, atelier, repères, galerie, vision.
- Livraison : zones, informations logistiques, confirmation avant paiement, gros volumes, FAQ.
- FAQ : 15 questions regroupées par thème.
- Contact : orientation par besoin, coordonnées, informations à fournir, accès au site.

Aucune nouvelle architecture n'a été introduite : App.html, Header.html, Footer.html,
Styles.html et Script.html restent communs à toute la SPA.


## v5.3 — REAL MEDIA

Photos réelles intégrées :
- événement professionnel → Histoire ;
- résidus de canne → Savoir-faire + Histoire ;
- charbon en foyer → Boutique + fiche Charbon écologique ;
- remise de prix / reconnaissance → Histoire ;
- briquettes en séchage → Savoir-faire + Histoire.

La homepage validée reste strictement inchangée.
Les nouvelles images sont centralisées dans Media.html.
