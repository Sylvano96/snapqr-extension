importScripts('lib/jsQR.js', 'shared/decode.js');

const CONTENT_FILES = ['shared/parse.js', 'content/overlay.js'];
const MENU_ID = 'snapqr-scan';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Scanner un QR code sur cette page',
    contexts: ['page', 'image', 'link', 'selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) startRegionScan(tab?.id);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'scan-region') startRegionScan(tab?.id);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'start-scan') {
    startRegionScan(msg.tabId).then(sendResponse);
    return true;
  }
  if (msg?.type === 'capture-region') {
    captureAndDecode(sender.tab, msg.rect, msg.viewport).then(sendResponse);
    return true;
  }
});

// Injecte le calque de sélection dans l'onglet (autorisé par activeTab).
async function startRegionScan(tabId) {
  if (tabId == null) return { ok: false, error: 'Aucun onglet actif.' };
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: "Cette page est protégée par le navigateur (pages chrome://, Chrome Web Store, visionneuse PDF…). Utilise l'import d'image à la place."
    };
  }
}

// Capture l'onglet visible, découpe la zone sélectionnée et la décode.
async function captureAndDecode(tab, rect, viewport) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const blob = await (await fetch(dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);

    // La capture est en pixels physiques : on convertit depuis les pixels CSS.
    const scale = bitmap.width / viewport.width;
    const sx = clamp(Math.floor(rect.x * scale), 0, bitmap.width - 1);
    const sy = clamp(Math.floor(rect.y * scale), 0, bitmap.height - 1);
    const sw = clamp(Math.ceil(rect.width * scale), 1, bitmap.width - sx);
    const sh = clamp(Math.ceil(rect.height * scale), 1, bitmap.height - sy);

    const text = QRDecode.region(bitmap, sx, sy, sw, sh);
    bitmap.close();
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: 'Capture impossible : ' + (e?.message || e) };
  }
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
