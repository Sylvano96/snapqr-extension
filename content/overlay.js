// Injected on demand: select an area of the page, then show the result dialog.
(() => {
  const HOST_ID = 'snapqr-ext-host';
  document.getElementById(HOST_ID)?.remove();

  const CSS = `
    :host { all: initial; }
    :host {
      --bg: #ffffff; --fg: #0f172a; --muted: #64748b; --line: #e2e8f0; --soft: #f1f5f9;
      --accent: #4f46e5; --accent-fg: #ffffff; --warn: #b45309; --warn-bg: #fef3c7;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        --bg: #1e293b; --fg: #f1f5f9; --muted: #94a3b8; --line: #334155; --soft: #0f172a;
        --accent: #818cf8; --accent-fg: #0f172a; --warn: #fcd34d; --warn-bg: #422006;
      }
    }
    * { box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    .layer { position: fixed; inset: 0; cursor: crosshair; background: rgba(15,23,42,.45); user-select: none; touch-action: none; }
    .layer.dragging { background: transparent; }
    .sel { position: fixed; display: none; border: 2px solid #a5b4fc; border-radius: 4px;
      box-shadow: 0 0 0 100vmax rgba(15,23,42,.45); pointer-events: none; }
    .size { position: absolute; right: -2px; top: calc(100% + 6px); background: #4f46e5; color: #fff;
      font-size: 11px; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
    .hint { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); max-width: calc(100vw - 32px);
      background: #0f172a; color: #f8fafc; padding: 10px 16px; border-radius: 999px; font-size: 13px;
      text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,.3); pointer-events: none; transition: opacity .15s; }
    .dragging .hint { opacity: 0; }
    kbd { font: 600 11px/1 system-ui, sans-serif; background: #334155; border-radius: 4px; padding: 3px 6px; }
    .backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.5); display: flex;
      align-items: center; justify-content: center; padding: 16px; animation: fade .15s ease-out; }
    .modal { width: min(440px, 100%); max-height: calc(100vh - 32px); display: flex; flex-direction: column;
      background: var(--bg); color: var(--fg); border-radius: 14px; overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,.35); animation: pop .18s ease-out; }
    .head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--line); }
    .head h2 { margin: 0; flex: 1; font-size: 15px; font-weight: 600; }
    .brand { font-size: 12px; font-weight: 800; letter-spacing: -.01em; color: var(--muted); }
    .brand span { color: var(--accent); }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }
    .dot.fail { background: #ef4444; }
    .x { border: 0; background: transparent; color: var(--muted); font-size: 22px; line-height: 1;
      cursor: pointer; padding: 2px 6px; border-radius: 6px; }
    .x:hover { background: var(--soft); }
    .body { padding: 16px; overflow: auto; font-size: 14px; line-height: 1.45; }
    .body p { margin: 0; color: var(--muted); }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 16px; }
    .btn { flex: 1 1 auto; border: 1px solid var(--line); background: var(--bg); color: var(--fg);
      font-size: 13px; font-weight: 600; padding: 9px 14px; border-radius: 8px; cursor: pointer; }
    .btn:hover { background: var(--soft); }
    .btn.primary { background: var(--accent); color: var(--accent-fg); border-color: transparent; }
    .btn.primary:hover { filter: brightness(1.08); }
    .btn:focus-visible, .x:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .qr-view { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
    .qr-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
      padding: 3px 8px; border-radius: 999px; background: var(--soft); color: var(--accent); }
    .qr-host { font-size: 17px; font-weight: 600; word-break: break-all; }
    .qr-warn { font-size: 12px; color: var(--warn); background: var(--warn-bg); padding: 6px 10px; border-radius: 6px; }
    .qr-fields { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0; width: 100%; }
    .qr-fields dt { color: var(--muted); }
    .qr-fields dd { margin: 0; font-weight: 600; word-break: break-all; }
    .qr-text { width: 100%; max-height: 180px; overflow: auto; white-space: pre-wrap; word-break: break-all;
      font: 12.5px/1.5 ui-monospace, Consolas, monospace; background: var(--soft); padding: 10px 12px; border-radius: 8px; }
    @keyframes fade { from { opacity: 0; } }
    @keyframes pop { from { opacity: 0; transform: translateY(8px) scale(.98); } }
  `;

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;display:block;';
  const root = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = CSS;
  const stage = document.createElement('div');
  root.append(style, stage);
  document.documentElement.append(host);

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      destroy();
    }
  }
  window.addEventListener('keydown', onKey, true);

  function destroy() {
    window.removeEventListener('keydown', onKey, true);
    host.remove();
  }

  function startSelect() {
    stage.replaceChildren();
    const layer = el('div', 'layer');
    const sel = el('div', 'sel');
    const size = el('span', 'size');
    sel.append(size);
    const hint = el('div', 'hint');
    hint.append(t('hintBefore'), el('kbd', null, t('keyEsc')), t('hintAfter'));
    layer.append(sel, hint);
    stage.append(layer);

    let start = null;
    const rectFrom = e => ({
      x: Math.min(start.x, e.clientX),
      y: Math.min(start.y, e.clientY),
      width: Math.abs(e.clientX - start.x),
      height: Math.abs(e.clientY - start.y)
    });

    layer.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      start = { x: e.clientX, y: e.clientY };
      layer.setPointerCapture(e.pointerId);
    });
    layer.addEventListener('pointermove', e => {
      if (!start) return;
      const r = rectFrom(e);
      if (r.width < 4 && r.height < 4) return;
      layer.classList.add('dragging');
      Object.assign(sel.style, {
        display: 'block', left: r.x + 'px', top: r.y + 'px', width: r.width + 'px', height: r.height + 'px'
      });
      size.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
    });
    layer.addEventListener('pointerup', e => {
      if (!start) return;
      let r = rectFrom(e);
      start = null;
      if (r.width < 8 || r.height < 8) r = { x: 0, y: 0, width: innerWidth, height: innerHeight };
      capture(r);
    });
    // Scrolling stays possible as long as no box is being drawn.
    layer.addEventListener('wheel', e => { if (start) e.preventDefault(); }, { passive: false });
    layer.addEventListener('contextmenu', e => { e.preventDefault(); destroy(); });
  }

  async function capture(rect) {
    // Hide the overlay so it doesn't appear in the capture.
    stage.replaceChildren();
    host.style.visibility = 'hidden';
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 40))));

    let res;
    try {
      res = await chrome.runtime.sendMessage({
        type: 'capture-region',
        rect,
        viewport: { width: innerWidth, height: innerHeight }
      });
    } catch {
      res = { ok: false, error: t('errReloaded') };
    }
    host.style.visibility = '';
    showResult(res);
  }

  function showResult(res) {
    stage.replaceChildren();
    const backdrop = el('div', 'backdrop');
    backdrop.addEventListener('pointerdown', e => { if (e.target === backdrop) destroy(); });
    const modal = el('div', 'modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const head = el('div', 'head');
    const dot = el('span', 'dot');
    const title = el('h2');
    const close = el('button', 'x', '×');
    close.setAttribute('aria-label', t('close'));
    close.addEventListener('click', destroy);
    const brand = el('span', 'brand', 'Snap');
    brand.append(el('span', null, 'Qr'));
    head.append(dot, title, brand, close);

    const body = el('div', 'body');
    const actions = el('div', 'actions');
    const button = (label, onClick, primary) => {
      const b = el('button', 'btn' + (primary ? ' primary' : ''), label);
      b.addEventListener('click', () => onClick(b));
      actions.append(b);
      return b;
    };

    if (!res?.ok || res.text == null) {
      dot.classList.add('fail');
      title.textContent = res?.ok ? t('noQrTitle') : t('errorTitle');
      body.append(el('p', null, res?.ok ? t('noQrHelp') : res?.error || t('errUnknown')));
      button(t('retry'), startSelect, true);
      button(t('close'), destroy);
    } else {
      const info = QRParse.classify(res.text);
      title.textContent = t('qrDetected');
      body.append(QRParse.buildView(info));
      if (info.href) {
        button(info.type === 'url' ? t('openLink') : t('open'), () => {
          window.open(info.href, '_blank', 'noopener,noreferrer');
        }, true);
      }
      if (info.copyExtra) {
        button(info.copyExtra.label, b => copy(info.copyExtra.value, b));
      }
      button(t('copy'), b => copy(info.text, b), !info.href);
      button(t('newScan'), startSelect);
    }

    modal.append(head, body, actions);
    backdrop.append(modal);
    stage.append(backdrop);
    actions.querySelector('button')?.focus();
  }

  async function copy(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.append(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const label = btn.textContent;
    btn.textContent = t('copied');
    setTimeout(() => { btn.textContent = label; }, 1400);
  }

  startSelect();
})();
