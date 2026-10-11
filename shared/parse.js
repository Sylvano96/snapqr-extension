// Interprets the content of a QR code and builds its view (popup + on-page dialog).
globalThis.QRParse = (() => {
  function classify(raw) {
    const text = raw;
    const s = raw.trim();

    if (/^https?:\/\/\S+$/i.test(s)) {
      try {
        const u = new URL(s);
        return { type: 'url', label: t('typeUrl'), text, href: u.href, host: u.hostname };
      } catch {}
    }
    if (/^www\.\S+\.\S+$/i.test(s)) {
      try {
        const u = new URL('https://' + s);
        return { type: 'url', label: t('typeUrl'), text, href: u.href, host: u.hostname };
      } catch {}
    }
    if (/^WIFI:/i.test(s)) {
      const f = fieldsOf(s.slice(5));
      const fields = [[t('fNetwork'), f.S || ''], [t('fSecurity'), f.T || t('fNone')]];
      if (f.P) fields.push([t('fPassword'), f.P]);
      if (/^true$/i.test(f.H || '')) fields.push([t('fHidden'), t('fYes')]);
      return {
        type: 'wifi', label: t('typeWifi'), text, fields,
        copyExtra: f.P ? { label: t('copyPassword'), value: f.P } : null
      };
    }
    if (/^mailto:/i.test(s)) {
      const addr = decodeSafe(s.slice(7).split('?')[0]);
      return { type: 'email', label: t('typeEmail'), text, href: s, host: addr };
    }
    if (/^MATMSG:/i.test(s)) {
      const f = fieldsOf(s.slice(7));
      const href = 'mailto:' + encodeURI(f.TO || '') +
        '?subject=' + encodeURIComponent(f.SUB || '') + '&body=' + encodeURIComponent(f.BODY || '');
      return {
        type: 'email', label: t('typeEmail'), text, href, host: f.TO || '',
        fields: [[t('fSubject'), f.SUB || ''], [t('fMessage'), f.BODY || '']].filter(r => r[1])
      };
    }
    if (/^tel:/i.test(s)) {
      return { type: 'tel', label: t('typeTel'), text, href: s, host: s.slice(4) };
    }
    if (/^(smsto|sms):/i.test(s)) {
      const [, num = '', msg = ''] = s.match(/^(?:smsto|sms):([^:?]*)[:?]?(?:body=)?(.*)$/is) || [];
      return {
        type: 'sms', label: t('typeSms'), text, href: 'sms:' + num,
        fields: [[t('fNumber'), num], [t('fMessage'), decodeSafe(msg)]].filter(r => r[1])
      };
    }
    if (/^BEGIN:VCARD/i.test(s)) {
      const get = key => (s.match(new RegExp('^' + key + '[^:\\n]*:(.*)$', 'im')) || [])[1]?.trim() || '';
      const fields = [[t('fName'), get('FN') || get('N').replace(/;/g, ' ').trim()],
        [t('typeTel'), get('TEL')], [t('typeEmail'), get('EMAIL')], [t('fOrg'), get('ORG')],
        [t('fWebsite'), get('URL')]].filter(r => r[1]);
      return { type: 'contact', label: t('typeContact'), text, fields };
    }
    if (/^geo:/i.test(s)) {
      const [lat, lng] = s.slice(4).split(/[,;?]/);
      if (isFinite(lat) && isFinite(lng)) {
        return {
          type: 'geo', label: t('typeGeo'), text, host: `${lat}, ${lng}`,
          href: `https://www.google.com/maps?q=${encodeURIComponent(lat + ',' + lng)}`
        };
      }
    }
    return { type: 'text', label: t('typeText'), text };
  }

  // "K:value;" fields with \; \, \: \\ escapes (WIFI and MATMSG formats).
  function fieldsOf(s) {
    const out = {};
    const re = /([A-Z]+):((?:\\.|[^;\\])*);?/gi;
    let m;
    while ((m = re.exec(s)) && m[0]) out[m[1].toUpperCase()] = m[2].replace(/\\(.)/g, '$1');
    return out;
  }

  function decodeSafe(s) {
    try { return decodeURIComponent(s); } catch { return s; }
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // Content is always inserted via textContent: never HTML coming from the QR code.
  function buildView(info) {
    const wrap = el('div', 'qr-view');
    wrap.append(el('span', 'qr-badge qr-badge-' + info.type, info.label));
    if (info.host) wrap.append(el('div', 'qr-host', info.host));
    if (info.type === 'url' && info.href.startsWith('http:')) {
      wrap.append(el('div', 'qr-warn', t('warnHttp')));
    }
    if (info.fields?.length) {
      const dl = el('dl', 'qr-fields');
      for (const [k, v] of info.fields) dl.append(el('dt', null, k), el('dd', null, v));
      wrap.append(dl);
    }
    wrap.append(el('div', 'qr-text', info.text));
    return wrap;
  }

  return { classify, buildView };
})();
