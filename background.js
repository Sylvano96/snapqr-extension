importScripts('shared/i18n.js', 'lib/jsQR.js', 'shared/decode.js');

const CONTENT_FILES = ['shared/i18n.js', 'shared/parse.js', 'content/overlay.js'];
const MENU_ID = 'snapqr-scan';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: t('menuScan'),
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

// Injects the selection overlay into the tab (allowed by activeTab).
async function startRegionScan(tabId) {
  if (tabId == null) return { ok: false, error: t('errNoTab') };
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: CONTENT_FILES });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: t('errProtected') };
  }
}

// Captures the visible tab, crops the selected area and decodes it.
async function captureAndDecode(tab, rect, viewport) {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    const blob = await (await fetch(dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);

    // The capture is in device pixels: convert from CSS pixels.
    const scale = bitmap.width / viewport.width;
    const sx = clamp(Math.floor(rect.x * scale), 0, bitmap.width - 1);
    const sy = clamp(Math.floor(rect.y * scale), 0, bitmap.height - 1);
    const sw = clamp(Math.ceil(rect.width * scale), 1, bitmap.width - sx);
    const sh = clamp(Math.ceil(rect.height * scale), 1, bitmap.height - sy);

    const text = QRDecode.region(bitmap, sx, sy, sw, sh);
    bitmap.close();
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: t('errCapture', String(e?.message || e)) };
  }
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
