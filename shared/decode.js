// Décodage QR partagé entre le service worker et le popup (nécessite jsQR).
globalThis.QRDecode = (() => {
  function decodeAt(source, sx, sy, sw, sh, scale, padRatio) {
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    // Marge blanche : un QR recadré trop serré perd sa « quiet zone ».
    const pad = Math.round(Math.max(w, h) * padRatio);
    const W = w + pad * 2;
    const H = h + pad * 2;

    const canvas = new OffscreenCanvas(W, H);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = scale < 1;
    ctx.drawImage(source, sx, sy, sw, sh, pad, pad, w, h);

    const { data } = ctx.getImageData(0, 0, W, H);
    const code = jsQR(data, W, H, { inversionAttempts: 'attemptBoth' });
    return code && code.data ? code.data : null;
  }

  function region(source, sx = 0, sy = 0, sw = source.width, sh = source.height) {
    const longest = Math.max(sw, sh);
    const scales = [];
    if (longest < 300) scales.push(Math.min(4, 600 / longest));
    if (longest > 1600) scales.push(1600 / longest);
    scales.push(1);

    for (const scale of scales) {
      for (const pad of [0.08, 0]) {
        const text = decodeAt(source, sx, sy, sw, sh, scale, pad);
        if (text !== null) return text;
      }
    }
    return null;
  }

  return { region };
})();
