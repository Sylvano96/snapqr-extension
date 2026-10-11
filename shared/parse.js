// Interprète le contenu d'un QR code et construit sa vue (popup + modal sur la page).
globalThis.QRParse = (() => {
  function classify(raw) {
    const text = raw;
    const t = raw.trim();

    if (/^https?:\/\/\S+$/i.test(t)) {
      try {
        const u = new URL(t);
        return { type: 'url', label: 'Lien', text, href: u.href, host: u.hostname };
      } catch {}
    }
    if (/^www\.\S+\.\S+$/i.test(t)) {
      try {
        const u = new URL('https://' + t);
        return { type: 'url', label: 'Lien', text, href: u.href, host: u.hostname };
      } catch {}
    }
    if (/^WIFI:/i.test(t)) {
      const f = fieldsOf(t.slice(5));
      const fields = [['Réseau', f.S || ''], ['Sécurité', f.T || 'Aucune']];
      if (f.P) fields.push(['Mot de passe', f.P]);
      if (/^true$/i.test(f.H || '')) fields.push(['Masqué', 'Oui']);
      return {
        type: 'wifi', label: 'Wi-Fi', text, fields,
        copyExtra: f.P ? { label: 'Copier le mot de passe', value: f.P } : null
      };
    }
    if (/^mailto:/i.test(t)) {
      const addr = decodeSafe(t.slice(7).split('?')[0]);
      return { type: 'email', label: 'E-mail', text, href: t, host: addr };
    }
    if (/^MATMSG:/i.test(t)) {
      const f = fieldsOf(t.slice(7));
      const href = 'mailto:' + encodeURI(f.TO || '') +
        '?subject=' + encodeURIComponent(f.SUB || '') + '&body=' + encodeURIComponent(f.BODY || '');
      return {
        type: 'email', label: 'E-mail', text, href, host: f.TO || '',
        fields: [['Objet', f.SUB || ''], ['Message', f.BODY || '']].filter(r => r[1])
      };
    }
    if (/^tel:/i.test(t)) {
      return { type: 'tel', label: 'Téléphone', text, href: t, host: t.slice(4) };
    }
    if (/^(smsto|sms):/i.test(t)) {
      const [, num = '', msg = ''] = t.match(/^(?:smsto|sms):([^:?]*)[:?]?(?:body=)?(.*)$/is) || [];
      return {
        type: 'sms', label: 'SMS', text, href: 'sms:' + num,
        fields: [['Numéro', num], ['Message', decodeSafe(msg)]].filter(r => r[1])
      };
    }
    if (/^BEGIN:VCARD/i.test(t)) {
      const get = key => (t.match(new RegExp('^' + key + '[^:\\n]*:(.*)$', 'im')) || [])[1]?.trim() || '';
      const fields = [['Nom', get('FN') || get('N').replace(/;/g, ' ').trim()],
        ['Téléphone', get('TEL')], ['E-mail', get('EMAIL')], ['Organisation', get('ORG')],
        ['Site', get('URL')]].filter(r => r[1]);
      return { type: 'contact', label: 'Contact', text, fields };
    }
    if (/^geo:/i.test(t)) {
      const [lat, lng] = t.slice(4).split(/[,;?]/);
      if (isFinite(lat) && isFinite(lng)) {
        return {
          type: 'geo', label: 'Position', text, host: `${lat}, ${lng}`,
          href: `https://www.google.com/maps?q=${encodeURIComponent(lat + ',' + lng)}`
        };
      }
    }
    return { type: 'text', label: 'Texte', text };
  }

  // Champs « K:valeur; » avec échappements \; \, \: \\ (formats WIFI, MATMSG).
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

  // Le contenu est toujours inséré via textContent : jamais d'HTML venant du QR.
  function buildView(info) {
    const wrap = el('div', 'qr-view');
    wrap.append(el('span', 'qr-badge qr-badge-' + info.type, info.label));
    if (info.host) wrap.append(el('div', 'qr-host', info.host));
    if (info.type === 'url' && info.href.startsWith('http:')) {
      wrap.append(el('div', 'qr-warn', 'Lien non sécurisé (http). Vérifie le domaine avant de l\'ouvrir.'));
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
