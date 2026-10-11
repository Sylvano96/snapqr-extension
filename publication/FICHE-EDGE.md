# Publier SnapQr sur Microsoft Edge Add-ons

## Fichiers de ce dossier

| Fichier | Où l'utiliser dans Partner Center |
|---|---|
| `snapqr-1.0.0.zip` | **Packages** : le paquet de l'extension |
| `logo-300.png` | **Store listings → Extension Store logo** (300×300) |
| `capture-1-selection.png` à `capture-4-generer.png` | **Store listings → Screenshots** (1280×800) |
| `promo-petite-440x280.png` | **Small promotional tile** (facultatif) |
| `promo-grande-1400x560.png` | **Large promotional tile** (facultatif) |

---

## Étape 1 : créer le compte (gratuit)

1. Va sur https://partner.microsoft.com/dashboard/microsoftedge/overview
2. Connecte-toi avec un compte Microsoft (Outlook, Hotmail…).
3. Inscris-toi au **programme Microsoft Edge**, en type de compte **Individuel**.
4. Remplis ton nom et ton adresse, puis valide l'e-mail de vérification.

## Étape 2 : créer l'extension

1. **Create new extension**
2. **Packages** : envoie `snapqr-1.0.0.zip`. Microsoft lit le nom, la version et les permissions directement dans le manifest.

## Étape 3 : Availability (disponibilité)

- **Visibility** : **Public**
- **Markets** : tous les marchés (par défaut)

## Étape 4 : Properties (propriétés)

- **Category** : Productivity
- **Privacy policy requirements** : réponds **Non** à « Does your extension access, collect or transmit personal information? ». SnapQr ne collecte rien, donc aucune URL de politique n'est obligatoire. Un texte prêt à l'emploi est fourni plus bas au cas où on te la demanderait.
- **Website URL / Support contact** : ton adresse e-mail, ou une page GitHub si tu en crées une.
- **Mature content** : Non

## Étape 5 : Store listings (fiche)

Ajoute la langue **Français**. Tu peux aussi ajouter **English** pour toucher plus de monde.

### Description en français (à copier)

```
SnapQr lit les QR codes affichés sur n'importe quelle page web, sans téléchargement ni téléphone.

Tu vois un QR code sur un réseau social, dans un article ou sur une affiche en ligne ? Clique sur SnapQr (ou appuie sur Alt+Maj+S), encadre le QR code à la souris, et son contenu s'affiche immédiatement dans une fenêtre, sur la page même.

FONCTIONNALITÉS
• Scan d'une zone de la page : encadre le QR code, c'est tout. Un simple clic scanne toute la partie visible.
• Import d'image : glisse un fichier, choisis-le ou colle une capture avec Ctrl+V.
• Reconnaissance du contenu : lien, réseau Wi-Fi (avec copie du mot de passe), e-mail, téléphone, SMS, carte de contact, position GPS ou texte.
• Sécurité : le domaine du lien est affiché en grand avant toute ouverture, avec un avertissement pour les liens non sécurisés (http).
• Générateur de QR codes : à partir de la page en cours ou de n'importe quel texte, avec choix des couleurs et du niveau de correction. Export en PNG ou copie en un clic.
• Accès rapide : bouton de la barre d'outils, raccourci clavier Alt+Maj+S ou clic droit.
• Thème clair et sombre automatique.

RESPECT DE LA VIE PRIVÉE
Tout est traité localement dans ton navigateur. Aucune image, aucun lien et aucune donnée n'est envoyé sur Internet. SnapQr n'accède à une page que lorsque tu le lances toi-même.
```

### Description en anglais (facultatif, à copier)

```
SnapQr reads QR codes shown on any web page — no download, no phone needed.

See a QR code on social media, in an article or on an online poster? Click SnapQr (or press Alt+Shift+S), draw a box around the code, and its content appears instantly in a dialog right on the page.

FEATURES
• Scan a page region: just draw a box around the QR code. A single click scans the whole visible page.
• Image import: drop a file, pick one, or paste a screenshot with Ctrl+V.
• Smart content detection: link, Wi-Fi network (with password copy), email, phone, SMS, contact card, GPS location or plain text.
• Safety first: the link's domain is shown prominently before opening, with a warning for insecure (http) links.
• QR code generator: from the current page or any text, with custom colors and error-correction level. Export as PNG or copy in one click.
• Quick access: toolbar button, Alt+Shift+S keyboard shortcut or right-click menu.
• Automatic light and dark theme.

PRIVACY
Everything is processed locally in your browser. No image, link or data is ever sent over the internet. SnapQr only accesses a page when you start it yourself.
```

### Search terms (7 maximum)

```
qr code
scanner qr
lecteur qr
générateur qr
qr reader
qr scanner
qr generator
```

## Étape 6 : Notes for certification (notes pour les testeurs de Microsoft)

```
How to test:
1. Open any web page that displays a QR code (e.g. search "qr code" in Bing Images).
2. Click the SnapQr toolbar icon, then "Sélectionner une zone de la page" (or press Alt+Shift+S, or right-click > "Scanner un QR code sur cette page").
3. Draw a box around the QR code: a dialog shows the decoded content.
4. In the popup, the "Générer" tab creates a QR code from the current URL or any text.

Permissions:
- activeTab: capture the visible tab (chrome.tabs.captureVisibleTab) only after a user action, to read the selected QR code.
- scripting: inject the selection overlay and the result dialog into the current page.
- contextMenus: adds the "scan a QR code" entry to the right-click menu.

No remote code, no network requests, no data collection. Bundled libraries: jsQR 1.4.0 (Apache-2.0) and qrcode-generator 1.4.4 (MIT), unmodified.
```

## Étape 7 : soumettre

Clique sur **Publish**. La certification prend en général **jusqu'à 7 jours ouvrés**. Tu reçois un e-mail une fois l'extension acceptée ou si une correction est demandée.

---

## Mises à jour futures

1. Augmente `"version"` dans `manifest.json` (par ex. `1.0.1`).
2. Refais le zip (même contenu, sans le dossier `publication/`).
3. Dans Partner Center : **Packages → Replace**, puis **Publish**.

---

## Politique de confidentialité (au cas où elle serait demandée)

À publier sur une page en ligne (par exemple un fichier sur GitHub) et à indiquer par son URL :

```
Politique de confidentialité de SnapQr

SnapQr ne collecte, ne stocke et ne transmet aucune donnée personnelle.

- Les captures d'écran et les images servent uniquement à lire le QR code. Elles sont traitées localement dans le navigateur, puis immédiatement oubliées.
- Aucun contenu de QR code, aucun historique et aucune statistique d'utilisation n'est envoyé sur Internet.
- L'extension n'accède à une page que lorsque l'utilisateur la lance lui-même (bouton, raccourci clavier ou clic droit).
- Aucune donnée n'est partagée avec des tiers.

Contact : <ton adresse e-mail>
```
