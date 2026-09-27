# KEMIT ECOLOGY — Apps Script SPA v5.5 REAL PHOTO LIBRARY

## Objectif
Cette version remplace les répétitions visuelles par une vraie médiathèque KEMIT ECOLOGY issue du lot de 51 photos fourni.

## Photos du lot intégrées
- Photo 33 → hero Accueil / équipe de production
- Photo 8 → atelier
- Photo 16 → production manuelle
- Photo 40 → formation
- Photo 36 → accompagnement terrain
- Photo 50 → équipe / Histoire
- Photo 6 → séchage / Savoir-faire
- Photo 18 → biomasse
- Photo 31 → équipe en production
- Photo 29 → logistique / Livraison
- Photo 1 → Biochar (produit)
- Photo 32 → stock Biochar (fiche produit)

Les petites photos du lot sont rééchantillonnées proprement et affichées dans des cadres contrôlés plutôt qu'étirées sur toute la largeur.

## Architecture
- `Code.js`
- `App.html`
- `Header.html`
- `Footer.html`
- `Logo.html`
- `Media.html`
- `Styles.html`
- `Script.html`
- `PageHome.html`
- `PageBoutique.html`
- `PageProduit.html`
- `PageSavoirFaire.html`
- `PageHistoire.html`
- `PageLivraison.html`
- `PageFAQ.html`
- `PageContact.html`
- `appsscript.json`
- `.clasp.json`

## Routes SPA
- `#home`
- `#boutique`
- `#produit/biochar`
- `#savoir-faire`
- `#histoire`
- `#livraison`
- `#faq`
- `#contact`

## Déploiement
Dans le dossier extrait :

```powershell
clasp push
```

Puis dans Apps Script :
Deploy → Manage deployments → Edit → New version → Deploy.

Ne pas utiliser `clasp create` : le projet est déjà lié au Script ID KEMIT ECOLOGY.

## Note produit
Les descriptions sensibles, notamment celles du charbon actif naturel, restent volontairement prudentes. Le site ne transforme pas des indications d'étiquette non vérifiées en conseils médicaux.