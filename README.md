# KEMIT ECOLOGY — Site Apps Script

## Architecture actuelle (10 novembre 2026)

Application monopage (SPA) en français, avec routes par hash, catalogue produits, parcours particuliers et professionnels, médias externes et animations KEMIT. Le dépôt GitHub est la source du code ; le site public est rendu et déployé séparément par Google Apps Script.

### Fichiers principaux

- `Code.js` : point d'entrée Apps Script `doGet`, rendu du template et inclusion HTML.
- `App.html` : squelette HTML et ordre de chargement.
- `Styles.html` : orchestration des trois modules CSS, **sans modifier leur ordre**.
- `StylesFoundation.html` : styles de base ; `StylesMotion.html` : animations et compositions ; `StylesExperience.html` : pages, commerce et savoir-faire.
- `Media.html` : registre **unique** des URL d'images et de vidéos, avec clés `data-media` / `data-video-media`.
- `Products.html` : **source unique des cinq produits publiés**, prix explicites en FCFA.
- `Script.html` : navigation, catalogue, interactions, formulaire professionnel, motion et chargement des médias.
- `Page*.html` : fragments de pages, sans shell HTML distinct.
- `assets/kemit/` : originaux images/vidéos conservés dans GitHub pour distribution externe.

`assets/**` est exclu de `clasp push` : Apps Script ne sert pas ces fichiers depuis son projet. Les pages chargent les URL publiques de `Media.html`.

### Pages

`#home`, `#boutique`, `#produit/<id>`, `#professionnels`, `#savoir-faire`, `#histoire`, `#livraison`, `#faq`, `#contact`.

Un appel `/exec?page=boutique` ou `/exec?page=produit&id=biochar` choisit une route initiale. La navigation interne utilise ensuite les fragments `#...`. Les titres et descriptions sont mis à jour côté client pour chaque page ; **cela ne remplace pas un véritable rendu SEO multi-URL**.

### Images et vidéos

1. Téléverser la ressource dans `assets/kemit/` (ou choisir un hébergeur d'images approuvé).
2. Contrôler l'URL directe dans un navigateur hors GitHub.
3. Modifier **uniquement** l'entrée correspondante dans `Media.html`.
4. Pour les ressources GitHub, utiliser la **révision de commit immuable** dans l'URL CDN (`@<commit-sha>` ou `/<commit-sha>/`), et la changer à chaque mise à jour du fichier.
5. Mettre `data-media="cle"` sur `<img>`, `data-video-media="cle"` sur `<video>`.
6. Garder `loading="lazy"` pour les photos hors premier écran ; `loading="eager" fetchpriority="high"` pour les visuels héros.
7. Le moteur affiche un repli si une image échoue réellement à charger ; les vidéos sont chargées sans prélecture de données (`preload="none"`).

**Important :** une entrée du registre ne prouve pas que l'hébergeur répond correctement. Tester une image CDN, une Brevo et une vidéo dans le site `/exec`, sur desktop et mobile. Ne pas substituer une photo produit à un produit qu'elle ne représente pas.

### Données et conversion

Les **prix sont directement inscrits en FCFA dans `Products.html`**. Ils ont été fixés lors de la migration à la valeur précédemment visible (ancienne conversion technique 600 FCFA/USD, sans calcul runtime). Toute mise à jour de prix doit être validée commercialement avant publication.

La référence « anti-poison » ne figure plus dans les produits publiés. Les informations sensibles sur le charbon actif restent prudentes. Une demande WhatsApp **n'est ni un paiement ni une commande confirmée**.

### Motion et accessibilité

Les animations s'appuient sur `IntersectionObserver`, se rejouent après navigation SPA et respectent `prefers-reduced-motion`. Le mécanisme de secours ne révèle que les éléments **actuellement visibles à l'écran**, jamais toute la page après un délai fixe.

Les contrôles clavier et le menu mobile utilisent les attributs ARIA correspondants. Tester en réduisant les animations dans les préférences du système.

### Vérification locale

Installer Node.js puis lancer depuis la racine du projet :

```bash
node scripts/verify-kemit-conversion-v2.mjs
```

Ce test vérifie les includes, la syntaxe des scripts, les routes, les clés médias, les fichiers GitHub présents, le catalogue, le motion, les parcours WhatsApp et l'accessibilité de base. **Ce test ne fait pas de requêtes HTTP et ne remplace pas un test du site déployé.**

### Déploiement manuel

Dans le dossier local du projet déjà relié à l'ID Apps Script :

```powershell
git pull origin main
node scripts/verify-kemit-conversion-v2.mjs
clasp push
```

Puis : Apps Script → **Deploy → Manage deployments → Edit → New version → Deploy**. `clasp push` seul ne met pas à jour l'URL publique `/exec`.

Après déploiement : actualisation forcée ; vérifier Accueil → Boutique → Produit → Professionnels → Savoir-faire (photos et vidéos) → Histoire → Livraison → FAQ → Contact → retour Accueil ; vérifier les messages WhatsApp, le menu mobile et le déclenchement des animations au scroll.

**Ne pas exécuter `clasp create`** : le projet est déjà connecté via `.clasp.json`.

### Limites et travaux d'optimisation

Les originaux PNG dépassent parfois 2–3 Mo. Pour améliorer significativement le temps de chargement, préparer des variantes WebP/AVIF adaptées aux dimensions d'affichage puis changer les URLs du registre, avec validation visuelle. Les deux MP4 doivent idéalement être encodés en H.264 ou format largement compatible et optimisés avant une campagne à fort trafic.

La disponibilité des CDN, les métriques Lighthouse, le rendu mobile et la compatibilité du déploiement Apps Script doivent être vérifiés sur l'URL **réelle**, pas supposés à partir des seuls fichiers du dépôt.
