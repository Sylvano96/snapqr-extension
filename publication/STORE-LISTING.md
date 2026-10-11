# SnapQr — Store listing kit

Everything needed to publish SnapQr on **Microsoft Edge Add-ons** (and the Chrome Web Store, which uses the same assets).

## Files

| File | Where it goes in Partner Center |
|---|---|
| `snapqr-<version>.zip` | **Packages** (generated, not committed to Git) |
| `logo-300.png` | **Store listings → Extension logo** (300×300) |
| `capture-1-selection.png` … `capture-4-generate.png` | **Store listings → Screenshots**, English listing (1280×800) |
| `capture-*-fr.png` | Screenshots for the French listing |
| `promo-small-440x280.png` (+ `-fr`) | **Small promotional tile** (optional) |
| `promo-large-1400x560.png` (+ `-fr`) | **Large promotional tile** (optional) |

## Build the package

From the project root, zip only the extension files (never the `publication/` folder), with `manifest.json` at the root of the archive:

```
tar -a -cf publication/snapqr-<version>.zip manifest.json background.js _locales content popup shared lib icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png
```

---

## Partner Center settings

- **Availability**: Public, all markets.
- **Properties**: category *Productivity*. No personal information collected, so no privacy policy URL is required.
- **Privacy → Data usage**: tick nothing. Tick the three certifications.
- **Remote code**: No.
- **Testers need credentials?** No.

### Single purpose

```
SnapQr only reads and creates QR codes: the user draws a box around a QR code shown on the web page (or imports an image) to display its content, and can generate a QR code from text or from the page address.
```

### Permission justifications

**activeTab**
```
After an explicit user action (toolbar icon, keyboard shortcut or context menu), the extension captures the visible tab with chrome.tabs.captureVisibleTab to read the QR code in the selected area. Access is limited to the active tab, only at that moment, and the capture is processed locally and then discarded.
```

**scripting**
```
Used to inject into the active tab, at the user's request, the selection overlay (the box drawn around the QR code) and the dialog showing the result. No script is injected automatically or into other pages.
```

**contextMenus**
```
Adds a "Scan a QR code on this page" entry to the right-click menu, to start a scan without opening the popup.
```

---

## Listing — English

### Description

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
• Available in English and French, with automatic light and dark theme.

PRIVACY
Everything is processed locally in your browser. No image, link or data is ever sent over the internet. SnapQr only accesses a page when you start it yourself.
```

### Search terms (max 7 terms, 21 words)

```
qr code
qr scanner
qr reader
qr generator
scan qr code
read qr from screen
qr code screenshot
```

## Listing — French

### Description

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
• Disponible en français et en anglais, avec thème clair et sombre automatique.

RESPECT DE LA VIE PRIVÉE
Tout est traité localement dans ton navigateur. Aucune image, aucun lien et aucune donnée n'est envoyé sur Internet. SnapQr n'accède à une page que lorsque tu le lances toi-même.
```

### Search terms

```
qr code
scanner qr
lecteur qr
générateur qr
lire qr code
scanner qr écran
capture qr code
```

---

## Notes for certification

```
How to test:
1. Open any web page that displays a QR code (e.g. search "qr code" in Bing Images).
2. Click the SnapQr toolbar icon, then "Select an area of the page" (or press Alt+Shift+S, or right-click > "Scan a QR code on this page").
3. Draw a box around the QR code: a dialog shows the decoded content.
4. In the popup, the "Generate" tab creates a QR code from the current URL or any text.

Permissions:
- activeTab: capture the visible tab (chrome.tabs.captureVisibleTab) only after a user action, to read the selected QR code.
- scripting: inject the selection overlay and the result dialog into the current page.
- contextMenus: adds the "scan a QR code" entry to the right-click menu.

No remote code, no network requests, no data collection. Bundled libraries: jsQR 1.4.0 (Apache-2.0) and qrcode-generator 1.4.4 (MIT), unmodified.
```

---

## Publishing an update

1. Bump `"version"` in `manifest.json`.
2. Rebuild the zip (see above).
3. Partner Center → **Update** → replace the package → **Publish**, with the certification notes again.

## Privacy policy (only if a store asks for one)

```
SnapQr Privacy Policy

SnapQr does not collect, store or transmit any personal data.

- Screenshots and images are only used to read the QR code. They are processed locally in the browser and discarded immediately.
- No QR code content, history or usage statistics is ever sent over the internet.
- The extension only accesses a page when the user starts it (toolbar button, keyboard shortcut or context menu).
- No data is shared with third parties.

Contact: <your email address>
```
