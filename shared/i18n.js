// Translated string from _locales/<lang>/messages.json (falls back to the key).
globalThis.t = (key, subs) => {
  try {
    return chrome.i18n.getMessage(key, subs) || key;
  } catch {
    return key;
  }
};
