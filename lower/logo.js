(() => {
  'use strict';
  const graphic = document.querySelector('.lower-third');
  const official = graphic.querySelector('.emblem');
  const originalImage = document.createElement('img');
  originalImage.className = 'emblem custom-logo animated'; originalImage.alt = ''; originalImage.hidden = true;
  official.after(originalImage);
  const trailImage = graphic.querySelector('.trail-logo-image');
  const note = graphic.querySelector('.trail-default');
  const broadcastImage = graphic.querySelector('.broadcast-logo-image');
  const diagonalImage = graphic.querySelector('.diagonal-logo-image');
  const communionImage = graphic.querySelector('.communion-logo-image');
  const communionSymbol = graphic.querySelector('.communion-symbol');
  const liveImage = graphic.querySelector('.live-logo-image');
  const hymn3dImage = graphic.querySelector('.hymn3d-logo-image');
  const hymn3dSymbol = graphic.querySelector('.hymn3d-symbol');
  const bridge = graphic.querySelector('.liquid-bridge');
  const defaultLogos = [official, note, communionSymbol, hymn3dSymbol];
  const replacements = [originalImage, trailImage, broadcastImage, diagonalImage, communionImage, liveImage, hymn3dImage];
  const symbols = window.LowerSymbols;
  const defaultNames = {trail:symbols.music.name, communion:'Copa y pan', hymn3d:symbols.crown.name};
  const choice = document.querySelector('#logo-choice');
  const input = document.querySelector('#logo-upload');
  const message = document.querySelector('#logo-status');
  const reset = document.querySelector('#reset-logo');
  const sizeInput = document.querySelector('#logo-size');
  const sizeOutput = document.querySelector('#logo-size-value');
  let size = 100;
  let paletteTint = false;
  let current = null, source = null, accent = '#f7a813', ticket = 0, revision = 0, loadRevision = 0;
  function symbolImage(key) {
    const {viewBox, markup} = symbols[key];
    const [, , width, height] = viewBox.split(' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" color="${accent}">${paletteTint ? markup.replace(/#fff8f1/gi, accent) : markup}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function paint() {
    revision++;
    let data = current?.data;
    if (current?.kind === 'builtin') {
      data = symbolImage(current.symbol);
    } else if (current?.kind === 'svg') {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
      const context = canvas.getContext('2d');
      context.drawImage(source, 0, 0, 512, 512);
      context.globalCompositeOperation = 'source-in';
      context.fillStyle = accent; context.fillRect(0, 0, 512, 512);
      data = canvas.toDataURL('image/png');
    }
    for (const img of replacements) {
      if (data) img.src = data;
      else img.removeAttribute('src');
      img.hidden = !data;
    }
    for (const logo of defaultLogos) logo.toggleAttribute('hidden', !!current);
    bridge.toggleAttribute('hidden', current?.kind === 'none');
  }
  function setSize(value) {
    if (!Number.isInteger(value) || value < 40 || value > 120) return;
    size = value;
    graphic.style.setProperty('--logo-scale', String(size / 100));
    if (sizeInput) {
      sizeInput.value = String(size);
      sizeInput.setAttribute('aria-valuetext', `${size} %`);
    }
    if (sizeOutput) sizeOutput.textContent = `${size} %`;
  }
  function setColor(color, tint = false) {
    if (!/^#[0-9a-f]{6}$/i.test(color) || (accent === color && tint === paletteTint)) return;
    accent = color;
    paletteTint = tint;
    if (current?.kind === 'svg' || current?.kind === 'builtin') paint();
  }
  async function set(logo) {
    const symbol = logo?.kind === 'music' ? 'crown' : logo?.kind === 'builtin' && logo.symbol;
    const builtin = Object.hasOwn(symbols, symbol);
    const noLogo = logo?.kind === 'none';
    if (logo != null && !builtin && !noLogo && (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(logo.data || '') || logo.data.length > 4 * 1024 * 1024)) throw new Error('El logo no es una imagen válida.');
    const generation = ++loadRevision;
    const next = noLogo ? {kind:'none', name:'Ninguno'}
      : builtin ? {kind:'builtin', symbol, name:symbols[symbol].name}
      : logo ? {data:logo.data,name:String(logo.name || 'Logo personalizado').slice(0,180),kind:logo.kind === 'svg' ? 'svg' : 'png'} : null;
    let image = null;
    if (next?.data) {
      image = new Image(); image.src = next.data;
      await image.decode();
    }
    if (generation !== loadRevision) return;
    current = next; source = image; paint();
    if (message) {
      message.textContent = next?.name ?? defaultNames[graphic.dataset.variant] ?? 'Logo predeterminado';
      message.classList.remove('error');
    }
    if (reset) reset.disabled = !next;
    if (sizeInput) sizeInput.disabled = noLogo;
    while (current && current.kind !== 'none') {
      const painted = revision;
      try { await Promise.all(replacements.map(img => img.decode())); }
      catch (error) { if (painted === revision) throw error; }
      if (painted === revision) break;
    }
  }
  async function normalize(file) {
    if (!file || file.size > 5 * 1024 * 1024) throw new Error('Elegí un logo SVG o PNG de hasta 5 MB.');
    const png = /\.png$/i.test(file.name), svg = /\.svg$/i.test(file.name);
    if (!png && !svg) throw new Error('El archivo debe ser SVG o PNG.');
    let blob;
    if (svg) {
      const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml');
      if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('El SVG no es válido.');
      if (doc.querySelector('script,foreignObject,iframe,object,embed')) throw new Error('Usá un SVG que contenga solamente el dibujo del logo.');
      for (const e of doc.querySelectorAll('*')) {
        for (const a of [...e.attributes]) {
          if (/^on/i.test(a.name) || ((a.localName === 'href' || a.name === 'src') && a.value && !a.value.startsWith('#'))) throw new Error('El SVG debe tener sus elementos incluidos en el archivo.');
          if ([...a.value.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)].some(m=>!m[2].trim().startsWith('#'))) throw new Error('El SVG tiene recursos externos. Usá una versión sin enlaces.');
        }
      }
      const styles = [...doc.querySelectorAll('style')].map(e=>e.textContent).join('');
      if (/@import/i.test(styles) || [...styles.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)].some(m=>!m[2].trim().startsWith('#'))) throw new Error('El SVG tiene recursos externos.');
      if (!doc.documentElement.hasAttribute('viewBox')) {
        const w = parseFloat(doc.documentElement.getAttribute('width')),h = parseFloat(doc.documentElement.getAttribute('height'));
        if (w > 0 && h > 0) doc.documentElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }
      doc.documentElement.setAttribute('width','512'); doc.documentElement.setAttribute('height','512');
      blob = new Blob([new XMLSerializer().serializeToString(doc)], {type:'image/svg+xml'});
    } else {
      const bytes = new Uint8Array(await file.slice(0,24).arrayBuffer());
      if (bytes.length < 24 || ![137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)) throw new Error('El archivo no es un PNG válido.');
      const header = new DataView(bytes.buffer);
      if (header.getUint32(16) > 8192 || header.getUint32(20) > 8192 || header.getUint32(16)*header.getUint32(20) > 32*1024*1024) throw new Error('El logo es demasiado grande. Usá una imagen de hasta 8192 píxeles por lado.');
      blob = file;
    }
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image(); img.src = url;
      try { await img.decode(); } catch { throw new Error('No se pudo leer el logo. Probá con otro SVG o PNG.'); }
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
      const factor = Math.min(512/img.naturalWidth,512/img.naturalHeight);
      const w = img.naturalWidth*factor,h = img.naturalHeight*factor;
      canvas.getContext('2d').drawImage(img,(512-w)/2,(512-h)/2,w,h);
      return {data:canvas.toDataURL('image/png'),name:file.name,kind:svg ? 'svg' : 'png'};
    } finally { URL.revokeObjectURL(url); }
  }
  input?.addEventListener('change', async () => {
    const file = input.files[0]; if (!file) return;
    const generation = ++ticket;
    loadRevision++;
    const previousChoice = choice?.value;
    if (choice) choice.value = 'custom';
    message.textContent = 'Preparando logo…';
    try { const logo = await normalize(file); if (ticket === generation) await set(logo); }
    catch (error) { if (ticket === generation) { if (choice) choice.value = previousChoice; message.textContent = error.message; message.classList.add('error'); } }
    finally { input.value = ''; }
  });
  async function choose(value) {
    const generation = ++ticket;
    loadRevision++;
    if (choice) choice.value = value;
    const useIsotipo = value === 'isotipo' || (value === 'default' && ['broadcast', 'live'].includes(graphic.dataset.variant));
    const asset = useIsotipo ? ['isotipo-iglesia.svg', 'Isotipo de la iglesia'] :
      value === 'circular' ? ['simbolo-circular-oficial.svg', 'Símbolo circular'] : null;
    try {
      if (value === 'none') { await set({kind:'none'}); return; }
      if (Object.hasOwn(symbols, value)) { await set({kind:'builtin', symbol:value}); return; }
      if (!asset) { await set(null); return; }
      if (message) message.textContent = 'Preparando logo…';
      const [filename, label] = asset;
      const response = await fetch(new URL(filename, document.baseURI));
      if (!response.ok) throw new Error('No se pudo cargar el logo.');
      const logo = await normalize(new File([await response.blob()], filename, {type:'image/svg+xml'}));
      if (generation === ticket) await set({...logo, name:label});
    } catch (error) {
      if (generation === ticket && message) {
        message.textContent = error.message;
        message.classList.add('error');
      }
    }
  }
  function refreshDefault() {
    if (!choice || choice.value === 'default') void choose('default');
  }
  choice?.addEventListener('change', () => { void choose(choice.value); });
  reset?.addEventListener('click', () => { void choose('default'); });
  sizeInput?.addEventListener('input', () => setSize(sizeInput.valueAsNumber));
  window.LowerLogo = Object.freeze({set,setColor,setSize,getSize:()=>size,choose,refreshDefault,get:()=>current ? {...current} : null});
})();
