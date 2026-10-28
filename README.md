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

## Conversion V2 — deux parcours commerciaux

**Statut : branche de développement, aucun déploiement public autorisé.**

Priorité KEMIT ECOLOGY : vente de produits à deux publics.

- Particuliers : `#home` → `#boutique` → `#produit/<id>` → demande de commande WhatsApp (produit, format, quantité, destination).
- Professionnels : `#home` ou fiche produit → `#professionnels` → formulaire qualifié (entreprise, produit, volume, unité, fréquence, destination) → demande de devis WhatsApp.
- Pages de réassurance conservées : `#savoir-faire`, `#histoire`, `#livraison`, `#faq`, `#contact`.

L'appel à WhatsApp **n'est pas un paiement ni une vente confirmée**. Le stock, le montant final et les modalités de livraison sont confirmés par KEMIT.

### Source de vérité produit

Le catalogue `window.KEMIT_PRODUCTS` de `Script.html` reste la source unique pour les produits, catégories, formats, tarifs indicatifs et sélection professionnelle. Ne pas entretenir de second catalogue dans `PageProfessionnels.html`.

### Photographies

`Media.html` contient des liens vers des photos authentiques approuvées, mais certaines références sont encore vides. Le frontend affiche une indication de visuel à confirmer lorsque la photo n'existe pas ; **ne pas mapper une photographie à un mauvais produit**. Réintégrer les photos produit réelles uniquement après vérification.

### Galerie boutique : 7 photos reçues

Les 9 liens transmis par KEMIT ont été dédupliqués en **7 images distinctes**, puis ajoutés dans `Media.html` sous les clés `kemit-gallery-01` à `kemit-gallery-07`. Elles sont affichées dans `PageBoutique.html` à l'emplacement `#kemit-photo-gallery`.

- Les URL d'origine ont été conservées, sans réhébergement non demandé.
- La galerie gère le chargement différé, les erreurs réseau et les images indisponibles.
- Aucun nom de produit n'est attribué à une image tant que son contenu n'est pas vérifié visuellement.
- Le registre `docs/kemit-photo-candidates.json` décrit la provenance et l'état des 7 visuels.
- Les six fiches produits conservent une indication neutre lorsque leur photo spécifique n'est pas encore vérifiée.

**Contrôle prépublication** : vérifier que le serveur Brevo autorise l'affichage depuis Apps Script et que les 7 photographies s'ouvrent sur desktop/mobile. Une URL ajoutée au code ne constitue pas une preuve de disponibilité réseau.

### Vérification locale

Depuis la racine du dépôt :

```bash
node scripts/verify-kemit-conversion-v2.mjs
```

Le script vérifie les routes, l'intégration Apps Script, la syntaxe des modules JavaScript, la validité de l'inventaire, les CTA, les validations de commande et les photos utilisées sur la page d'accueil. Il signale également les références média non résolues dans les pages secondaires. Il n'effectue aucune requête externe ni aucun déploiement.

**Validation visuelle restant nécessaire** : tester le rendu mobile/desktop et les messages WhatsApp dans un environnement Apps Script de test, sans lancer de paiement et sans supposer qu'un clic équivaut à une vente.

### Déploiement

Rien ne doit être poussé ou déployé automatiquement sur le projet Apps Script public. Vérifier le diff et les tests, approuver la branche puis effectuer un déploiement contrôlé avec retour arrière possible.
