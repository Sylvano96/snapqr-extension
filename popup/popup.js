const $ = sel => document.querySelector(sel);

qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

// ---------- Translations ----------
document.documentElement.lang = chrome.i18n.getUILanguage();
for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
for (const node of document.querySelectorAll('[data-i18n-placeholder]')) node.placeholder = t(node.dataset.i18nPlaceholder);
for (const node of document.querySelectorAll('[data-i18n-aria]')) node.setAttribute('aria-label', t(node.dataset.i18nAria));

// ---------- Tabs ----------
function showTab(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.setAttribute('aria-selected', String(tab.dataset.tab === name));
  }
  $('#tab-scan').hidden = name !== 'scan';
  $('#tab-generate').hidden = name !== 'generate';
  try { localStorage.setItem('tab', name); } catch {}
  if (name === 'generate') $('#gen-text').focus();
}
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
}
let savedTab = 'scan';
try { savedTab = localStorage.getItem('tab') || 'scan'; } catch {}
showTab(savedTab);

chrome.commands.getAll(cmds => {
  const cmd = cmds.find(c => c.name === 'scan-region');
  $('#shortcut').textContent = cmd?.shortcut || t('shortcutNone');
});

function flash(btn, text) {
  const label = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = label; }, 1400);
}

async function copyText(text, btn) {
  await navigator.clipboard.writeText(text);
  flash(btn, t('copied'));
}

// ---------- Scan: page area ----------
$('#btn-region').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const res = await chrome.runtime.sendMessage({ type: 'start-scan', tabId: tab?.id });
  if (res?.ok) window.close();
  else showScanError(res?.error || t('errStartScan'));
});

// ---------- Scan: image import ----------
const drop = $('#drop');
const fileInput = $('#file');

drop.addEventListener('click', () => fileInput.click());
drop.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});
fileInput.addEventListener('change', () => {
  handleFile(fileInput.files[0]);
  fileInput.value = '';
});
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => {
  e.preventDefault();
  drop.classList.remove('over');
  handleFile(e.dataTransfer.files[0]);
});
document.addEventListener('paste', e => {
  const item = [...e.clipboardData.items].find(i => i.kind === 'file' && i.type.startsWith('image/'));
  if (!item) return;
  e.preventDefault();
  showTab('scan');
  handleFile(item.getAsFile());
});

async function handleFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) return showScanError(t('errNotImage'));
  try {
    const bitmap = await createImageBitmap(file);
    const text = QRDecode.region(bitmap);
    bitmap.close();
    if (text == null) showScanError(t('errNoQrImage'));
    else showScanResult(text);
  } catch {
    showScanError(t('errReadImage'));
  }
}

function showScanError(message) {
  $('#scan-result').hidden = true;
  const err = $('#scan-error');
  err.textContent = message;
  err.hidden = false;
}

function showScanResult(text) {
  $('#scan-error').hidden = true;
  const info = QRParse.classify(text);
  const box = $('#scan-result');
  const actions = document.createElement('div');
  actions.className = 'row';

  const button = (label, onClick, primary) => {
    const b = document.createElement('button');
    b.className = 'btn' + (primary ? ' primary' : '');
    b.textContent = label;
    b.addEventListener('click', () => onClick(b));
    actions.append(b);
  };
  if (info.href) {
    button(info.type === 'url' ? t('openLink') : t('open'), () => chrome.tabs.create({ url: info.href }), true);
  }
  if (info.copyExtra) button(info.copyExtra.label, b => copyText(info.copyExtra.value, b));
  button(t('copy'), b => copyText(info.text, b), !info.href);

  box.replaceChildren(QRParse.buildView(info), actions);
  box.hidden = false;
}

// ---------- Generate ----------
const genText = $('#gen-text');
const canvas = $('#gen-canvas');

function renderQR() {
  const text = genText.value;
  const err = $('#gen-error');
  err.hidden = true;
  const ok = text.length > 0;

  if (ok) {
    try {
      const qr = qrcode(0, $('#gen-ec').value);
      qr.addData(text, 'Byte');
      qr.make();
      drawQR(qr);
    } catch {
      err.textContent = t('genTooLong');
      err.hidden = false;
    }
  }
  const shown = ok && err.hidden;
  canvas.hidden = !shown;
  $('#gen-empty').hidden = ok;
  $('#gen-download').disabled = !shown;
  $('#gen-copy').disabled = !shown;
}

function drawQR(qr) {
  const count = qr.getModuleCount();
  const quiet = 4;
  const cell = Math.max(4, Math.floor(1024 / (count + quiet * 2)));
  const size = (count + quiet * 2) * cell;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = $('#gen-bg').value;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = $('#gen-fg').value;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
    }
  }
}

for (const id of ['#gen-text', '#gen-ec', '#gen-fg', '#gen-bg']) {
  $(id).addEventListener('input', renderQR);
}

$('#gen-download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'qrcode.png';
  a.click();
});

$('#gen-copy').addEventListener('click', e => {
  const btn = e.currentTarget;
  canvas.toBlob(async blob => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      flash(btn, t('copied'));
    } catch {
      flash(btn, t('copyFailed'));
    }
  });
});

// Prefill with the current tab's address.
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!genText.value && tab?.url && /^https?:/.test(tab.url)) genText.value = tab.url;
  renderQR();
});
