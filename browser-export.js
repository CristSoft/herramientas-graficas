/* Video generation runs entirely in this browser. No render API is used. */
(() => {
  'use strict';
  const BASE = new URL('.', document.currentScript.src);
  const FPS = 30;
  const PAINT = ('display visibility position top right bottom left width height box-sizing margin-top margin-right margin-bottom margin-left padding-top padding-right padding-bottom padding-left overflow overflow-x overflow-y opacity scale transform transform-box transform-origin clip-path border-radius border-top border-right border-bottom border-left box-shadow background-color background-image background-size background-position background-repeat object-fit object-position color font-family font-size font-weight font-style font-variant line-height letter-spacing white-space text-align vertical-align fill fill-rule fill-opacity stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset mask mask-image mask-position mask-size mask-repeat filter d z-index isolation grid-template-columns grid-template-rows grid-row-start grid-row-end flex-direction justify-content align-items align-self flex-grow flex-shrink flex-basis row-gap column-gap').split(' ');
  let wrapperPromise;

  function checkAbort(signal) {
    if (signal?.aborted) throw new DOMException('Exportación cancelada.', 'AbortError');
  }
  function loadWrapper() {
    if (!wrapperPromise) wrapperPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL('vendor/ffmpeg/ffmpeg.js', BASE).href;
      script.onload = resolve;
      script.onerror = () => { wrapperPromise = null; script.remove(); reject(new Error('No se pudo cargar el conversor. Revisá la conexión y volvé a intentarlo.')); };
      document.head.append(script);
    });
    return wrapperPromise;
  }
  async function openSource(kind, config, signal) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Preparación del video';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;left:-20000px;top:0;width:1080px;height:1080px;border:0;pointer-events:none;';
    const query = new URLSearchParams({render:'1',alpha:config.container !== 'mp4' ? '1' : '0',duration:String(config.duration),background:config.background || config.colors.background});
    iframe.src = new URL(`${kind}/overlay.html?${query}`, BASE).href;
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => finish(new Error('La animación tardó demasiado en cargar.')), 30000);
        const abort = () => finish(new DOMException('Exportación cancelada.', 'AbortError'));
        const finish = error => { clearTimeout(timer); signal?.removeEventListener('abort', abort); error ? reject(error) : resolve(); };
        iframe.onload = () => finish();
        iframe.onerror = () => finish(new Error('No se pudo preparar la animación.'));
        signal?.addEventListener('abort', abort, {once:true});
        document.body.append(iframe);
      });
      checkAbort(signal);
      const win = iframe.contentWindow;
      const api = kind === 'lower' ? win.lowerThird : kind === 'stingers' ? win.transitionEngine : win.closingCard;
      if (!api) throw new Error('No se pudo iniciar la animación. Recargá la página e intentá otra vez.');
      if (kind === 'lower') {
        api.setText(config.title, config.subtitle, config.third);
        api.setOptions({visible:config.visible,cornerRadius:config.cornerRadius,variant:config.variant,logoSize:config.logoSize});
        api.setColors(config.colors);
        await api.setLogo(config.logo);
        await win.LowerVariant.ready();
        if (!api.setTiming(config)) throw new Error('Revisá los tiempos de entrada, salida y duración total.');
      } else if (kind === 'stingers') {
        api.configure(config);
      } else {
        await api.ready;
        api.setConfig(config);
      }
      await win.document.fonts.ready;
      api.seek(0);
      let fontCSS = '';
      if (kind === 'cierre') {
        const response = await fetch(new URL('cierre/NotoSans-Regular.ttf', BASE), {signal});
        if (!response.ok) throw new Error('No se pudo cargar la tipografía del cierre.');
        // Fonts in the SVG must be embedded so the canvas stays independent of external files.
        const bytes = await response.arrayBuffer();
        const fontURL = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(new Blob([bytes], {type:'font/ttf'})); });
        fontCSS = `@font-face{font-family:NotoLocal;src:url('${fontURL}') format('truetype');font-weight:400;}`;
      }
      return {iframe,win,api,fontCSS,background:config.container !== 'mp4' ? null : config.background || config.colors.background,root:win.document.querySelector(kind === 'lower' ? '.lower-third' : kind === 'stingers' ? '.transition-svg' : '.brand-scene'),width:kind === 'lower' ? 900 : kind === 'stingers' && config.format === 'horizontal' ? 1920 : 1080,height:kind === 'lower' ? 196 : kind === 'stingers' && config.format === 'vertical' ? 1920 : 1080};
    } catch (error) { iframe.remove(); throw error; }
  }
  function serializeFrame(source) {
    const clone = source.root.cloneNode(true);
    const originals = [source.root, ...source.root.querySelectorAll('*')];
    const copies = [clone, ...clone.querySelectorAll('*')];
    originals.forEach((element, index) => {
      // Definitions inherit their paint from <use>; freezing that paint here would black out masks.
      if (element.closest('defs')) return;
      const computed = source.win.getComputedStyle(element);
      const css = PAINT.map(property => {
        let value = computed.getPropertyValue(property);
        if (!value) return '';
        // Fragment references must point into this image, rather than to the source page.
        value = value.replace(/url\(["']?[^)"']*#([^)'"\s]+)["']?\)/g, 'url(#$1)');
        return `${property}:${value};`;
      }).join('');
      let copy = copies[index];
      if (element.localName === 'canvas' && !element.closest('[hidden]')) {
        // A cloned canvas carries its dimensions but loses its painted pixels.
        const bitmap = copy.ownerDocument.createElement('img');
        bitmap.src = element.toDataURL('image/png');
        bitmap.width = element.width;
        bitmap.height = element.height;
        copy.replaceWith(bitmap);
        copy = bitmap;
      }
      copy.setAttribute('style', css);
      copy.removeAttribute('class');
    });
    clone.style.position = 'relative';
    clone.style.left = '0'; clone.style.top = '0'; clone.style.transform = 'none';
    clone.style.width = source.width + 'px'; clone.style.height = source.height + 'px';
    const xml = new XMLSerializer().serializeToString(clone);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${source.width}" height="${source.height}" viewBox="0 0 ${source.width} ${source.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${source.fontCSS}</style>${xml}</div></foreignObject></svg>`;
  }
  async function capture(source, canvas) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serializeFrame(source));
    await img.decode();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (source.background) { ctx.fillStyle = source.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('No se pudo generar un fotograma.');
    return new Uint8Array(await blob.arrayBuffer());
  }
  function dimensions(kind, format) {
    if (kind === 'lower') return format === 'vertical' ? [1080,1920] : [900,196];
    if (kind === 'stingers') return format === 'vertical' ? [1080,1920] : [1920,1080];
    return {landscape:[1920,1080],vertical:[1080,1920],square:[1080,1080]}[format];
  }
  async function render(kind, config, report = () => {}, signal) {
    const owner = window.top;
    if (owner.__jcpBrowserRendering) throw new Error('Ya hay un video preparándose. Esperá a que termine o cancelalo.');
    owner.__jcpBrowserRendering = true;
    let engine, source;
    const log = [];
    const abort = () => engine?.terminate();
    signal?.addEventListener('abort', abort, {once:true});
    const started = performance.now();
    try {
      checkAbort(signal);
      if (config.container === 'png') {
        report(10, 'Preparando la imagen del zócalo…');
        source = await openSource(kind, config, signal);
        if (kind === 'lower') {
          const {duration, entrance, exit} = source.api.getConfig();
          source.api.seek((duration + entrance - exit) * 500);
        } else source.api.seek(config.duration * 500);
        const frame = document.createElement('canvas'); frame.width = source.width; frame.height = source.height;
        const bytes = await capture(source, frame);
        checkAbort(signal);
        const [width,height] = dimensions(kind,config.format);
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const image = await createImageBitmap(new Blob([bytes], {type:'image/png'}));
        const [x,y] = kind === 'lower' && config.format === 'vertical' ? [54,1430] : [(width-frame.width)/2,(height-frame.height)/2];
        canvas.getContext('2d').drawImage(image,x,y); image.close();
        const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
        checkAbort(signal);
        if (!blob) throw new Error('No se pudo generar la imagen.');
        report(100, `PNG listo · ${width} × ${height} · Transparente · Zócalo completo.`);
        const names = {trail:'estela-dorada', diagonal:'franjas-diagonales-clasico', broadcast:'franjas-logo', communion:'recipiente-llenado', live:'moderno', hymn3d:'cinta-3d'};
        const styleName = names[config.variant] ?? 'original';
        return {blob,filename:`zocalo-${styleName}-${width}x${height}.png`,seconds:(performance.now()-started)/1000,inputBytes:bytes.length};
      }
      if (!window.WebAssembly || !window.Worker) throw new Error('Este navegador no permite generar el video. Probá con Chrome o Edge actualizado.');
      report(1, 'Cargando el conversor en tu navegador… La primera vez descarga unos 32 MB.');
      await loadWrapper(); checkAbort(signal);
      engine = new window.FFmpegWASM.FFmpeg();
      engine.on('log', ({message}) => { log.push(message); if (log.length > 20) log.shift(); });
      engine.on('progress', ({progress}) => report(65 + Math.round(Math.min(1,Math.max(0,progress)) * 33), 'Convirtiendo el video en tu navegador…'));
      await engine.load({coreURL:new URL('vendor/core/ffmpeg-core.js', BASE).href,wasmURL:new URL('vendor/core/ffmpeg-core.wasm', BASE).href});
      checkAbort(signal);
      source = await openSource(kind, config, signal);
      const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
      const count = Math.round(config.duration * FPS);
      let lastTime, png, inputBytes = 0;
      for (let i = 0; i < count; i++) {
        checkAbort(signal);
        const time = source.api.seek(i / (count - 1) * config.duration * 1000);
        if (time !== lastTime) { png = await capture(source, canvas); lastTime = time; }
        inputBytes += png.length;
        if (inputBytes > 180 * 1024 * 1024) throw new Error('El video necesita demasiada memoria. Probá con una duración más corta.');
        // The worker transfers (and detaches) its input buffer. Keep our cached frame intact.
        await engine.writeFile(`frame-${String(i).padStart(4,'0')}.png`, png.slice());
        report(5 + Math.round((i + 1) / count * 60), `Preparando fotogramas en tu navegador… ${i + 1} de ${count}`);
      }
      source.iframe.remove(); source = null;
      checkAbort(signal);
      const alpha = config.container === 'mov';
      const [width,height] = dimensions(kind, config.format);
      const background = config.background || config.colors.background;
      const pad = kind === 'lower' && config.format === 'vertical' ? [54,1430] : [(width-canvas.width)/2,(height-canvas.height)/2];
      const filter = `pad=${width}:${height}:${pad[0]}:${pad[1]}:color=${alpha ? 'black@0' : '0x' + background.slice(1)},format=${alpha ? 'yuva444p10le' : 'yuv420p'}`;
      const audio = kind === 'cierre' && config.soundEnabled && config.volume > 0;
      if (audio) await engine.writeFile('sound.wav', window.ClosingSound.wav(config));
      const output = 'video.' + config.container;
      const args = ['-framerate',String(FPS),'-i','frame-%04d.png',...(audio ? ['-i','sound.wav'] : []),'-vf',filter,'-t',String(config.duration),...(audio ? ['-map','0:v:0','-map','1:a:0','-c:a',alpha?'pcm_s16le':'aac'] : ['-an']),...(alpha ? ['-c:v','prores_ks','-profile:v','4','-alpha_bits','16','-pix_fmt','yuva444p10le','-vendor','apl0','-threads','1'] : ['-c:v','libx264','-preset','ultrafast','-crf','18','-pix_fmt','yuv420p']),'-movflags','+faststart',output];
      report(65, 'Convirtiendo el video en tu navegador…');
      const code = await engine.exec(args);
      checkAbort(signal);
      if (code !== 0) { console.error('Conversión del navegador:', log.join('\n')); throw new Error('No se pudo convertir el video. Probá con una duración más corta o recargá la página.'); }
      const data = await engine.readFile(output);
      if (!data.length) throw new Error('El video quedó vacío. Volvé a intentarlo.');
      const blob = new Blob([data], {type:alpha?'video/quicktime':'video/mp4'});
      const filename = `animacion-${kind === 'lower' ? 'lower-third' : kind === 'stingers' ? 'stinger' : 'cierre'}-${width}x${height}${alpha?'-transparente':''}.${config.container}`;
      report(100, `${config.container.toUpperCase()} listo · ${width} × ${height} · ${config.duration} s · 30 fps${alpha?' · Transparente':''} · Generado en tu navegador.`);
      return {blob,filename,seconds:(performance.now()-started)/1000,inputBytes};
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Exportación cancelada.', 'AbortError');
      throw error;
    } finally {
      source?.iframe.remove(); engine?.terminate();
      signal?.removeEventListener('abort', abort);
      owner.__jcpBrowserRendering = false;
    }
  }
  window.BrowserExporter = Object.freeze({render});
})();
