(() => {
  'use strict';

  // Transparent layers rendered from the native Blender scene, at 24 fps.
  const WIDTH = 900;
  const HEIGHT = 196;
  const COLUMNS = 8;
  const RIBBON_FRAMES = 45;
  const FRONT_TILE = 15;
  const REAR_START = 319;
  const REAR_END = 780;
  const REAR_TIP = 70;
  const WHITE = {tile:45, x:117, y:40, width:759, height:96, left:18, tip:76, min:265};
  const GOLD = {tile:46, x:168, y:117, width:538, height:67, left:18, tip:68, min:211};
  const TEXT_X = 249;
  const HEADLINE_LIMIT = 551;
  const DETAIL_LIMIT = 385;
  const DEFAULT_RIBBON_COLOR = '#7444ac';
  const atlasURL = new URL('hymn-3d.webp', document.currentScript.src);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const ribbonMidtone = luminance(116, 68, 172);
  function smooth(frame, start, finish) {
    const fraction = clamp((frame - start) / (finish - start), 0, 1);
    return fraction * fraction * (3 - 2 * fraction);
  }

  function recolorRibbon(pixels, color) {
    for (let i = 0; i < pixels.length; i += 4) {
      const blueOverGreen = pixels[i + 2] - pixels[i + 1];
      if (pixels[i + 3] === 0 || blueOverGreen <= 5) continue;
      // Isolate the purple material, feathering where it meets the gold and near-neutral reflections.
      const amount = smooth(blueOverGreen, 5, 32);
      const light = luminance(pixels[i], pixels[i + 1], pixels[i + 2]);
      for (let channel = 0; channel < 3; channel++) {
        const midtone = color[channel];
        const shaded = light < ribbonMidtone
          ? midtone * light / ribbonMidtone
          : midtone + (255 - midtone) * (light - ribbonMidtone) / (255 - ribbonMidtone);
        pixels[i + channel] += (shaded - pixels[i + channel]) * amount;
      }
    }
  }

  function create(graphic, copy) {
    const art = document.createElement('div');
    art.className = 'hymn3d-art';
    art.hidden = true;
    art.setAttribute('aria-hidden', 'true');
    const {viewBox, markup} = window.LowerSymbols.crown;
    art.innerHTML = `<canvas width="900" height="196"></canvas><svg class="hymn3d-symbol" viewBox="${viewBox}">${markup}</svg><img class="hymn3d-logo-image" alt="" hidden>`;
    const canvas = art.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const mark = art.querySelector('.hymn3d-symbol');
    const replacement = art.querySelector('.hymn3d-logo-image');
    graphic.insertBefore(art, copy);

    const heading = copy.querySelector('.headline');
    const details = [...copy.querySelectorAll('.subtitle, .third-line')];
    let atlas, loading;
    let currentFrame = 1;
    let whiteWidth = WHITE.min;
    let goldWidth = GOLD.min;
    let ribbonColor = DEFAULT_RIBBON_COLOR;
    let ribbonRGB;
    const recoloredFrames = new Map();

    function ready() {
      if (!loading) {
        const image = new Image();
        image.src = atlasURL.href;
        loading = image.decode().then(() => {
          atlas = image;
          if (!art.hidden) draw();
        }).catch(() => {
          loading = null;
          throw new Error('No se pudo cargar la cinta 3D. Recargá la página para volver a intentarlo.');
        });
      }
      return loading;
    }

    function setRibbonColor(color) {
      if (ribbonColor === color) return;
      ribbonColor = color;
      ribbonRGB = color === DEFAULT_RIBBON_COLOR ? null : color.slice(1).match(/../g).map(value => parseInt(value, 16));
      recoloredFrames.clear();
    }
    function recoloredFrame(index, x, y) {
      if (recoloredFrames.has(index)) return recoloredFrames.get(index);
      const frame = document.createElement('canvas');
      frame.width = WIDTH;
      frame.height = HEIGHT;
      const frameContext = frame.getContext('2d', {willReadFrequently:true});
      frameContext.drawImage(atlas, x, y, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
      const image = frameContext.getImageData(0, 0, WIDTH, HEIGHT);
      recolorRibbon(image.data, ribbonRGB);
      frameContext.putImageData(image, 0, 0);
      recoloredFrames.set(index, frame);
      return frame;
    }
    function tile(index, x, y, w, h, dx, dy, dw, dh) {
      const sourceX = (index % COLUMNS) * WIDTH;
      const sourceY = Math.floor(index / COLUMNS) * HEIGHT;
      if (ribbonRGB && index < RIBBON_FRAMES) {
        ctx.drawImage(recoloredFrame(index, sourceX, sourceY), x, y, w, h, dx, dy, dw, dh);
      } else {
        ctx.drawImage(atlas, sourceX + x, sourceY + y, w, h, dx, dy, dw, dh);
      }
    }
    function ribbon(index) {
      tile(index,0,0,WIDTH,HEIGHT,0,0,WIDTH,HEIGHT);
    }
    function baseRibbon(index) {
      const edge = Math.min(REAR_END, Math.max(WHITE.x + whiteWidth, GOLD.x + goldWidth) + 28);
      if (edge === REAR_END) {
        ribbon(index);
        return;
      }
      // Short titles leave the curved rear end near the plates. Keep the folded front at its original size.
      const tipStart = REAR_END - REAR_TIP;
      tile(index,0,0,REAR_START,HEIGHT,0,0,REAR_START,HEIGHT);
      tile(index,REAR_START,0,tipStart - REAR_START,HEIGHT,REAR_START,0,edge - REAR_START - REAR_TIP,HEIGHT);
      tile(index,tipStart,0,WIDTH - tipStart,HEIGHT,edge - REAR_TIP,0,WIDTH - tipStart,HEIGHT);
    }
    function plate(skin, width, amount) {
      if (amount <= 0) return;
      const visibleWidth = Math.round(width * amount);
      if (visibleWidth <= skin.left + skin.tip) {
        tile(skin.tile,skin.x,skin.y,skin.width,skin.height,skin.x,skin.y,visibleWidth,skin.height);
        return;
      }
      const body = skin.width - skin.left - skin.tip;
      const stretched = visibleWidth - skin.left - skin.tip;
      tile(skin.tile,skin.x,skin.y,skin.left,skin.height,skin.x,skin.y,skin.left,skin.height);
      tile(skin.tile,skin.x + skin.left,skin.y,body,skin.height,
        skin.x + skin.left,skin.y,stretched,skin.height);
      tile(skin.tile,skin.x + skin.width - skin.tip,skin.y,skin.tip,skin.height,
        skin.x + visibleWidth - skin.tip,skin.y,skin.tip,skin.height);
    }
    function visibleText(node) {
      return node.hidden ? 0 : node.querySelector('span').scrollWidth;
    }
    function resize() {
      whiteWidth = clamp(TEXT_X + visibleText(heading) + 68 - WHITE.x, WHITE.min, WHITE.width);
      const detailWidth = Math.max(...details.map(visibleText));
      goldWidth = clamp(TEXT_X + detailWidth + 61 - GOLD.x, GOLD.min, GOLD.width);
      if (atlas && !art.hidden) draw();
    }
    function draw() {
      ctx.clearRect(0,0,WIDTH,HEIGHT);
      const frame = currentFrame;
      if (!atlas) {
        for (const element of [heading, ...details, mark, replacement]) element.style.opacity = '0';
        return;
      }
      const upper = smooth(frame,34,54);
      const lower = smooth(frame,37,59);
      const titleOpacity = smooth(frame,46,56);
      const detailOpacity = smooth(frame,48,59);
      heading.style.opacity = String(titleOpacity);
      heading.style.clipPath = `inset(0 ${clamp(100 * (1 - (WHITE.x + whiteWidth * upper - TEXT_X - 56) / Math.max(1, visibleText(heading))), 0, 100)}% 0 0)`;
      details.forEach(line => {
        line.style.opacity = String(detailOpacity);
        line.style.clipPath = `inset(0 ${clamp(100 * (1 - (GOLD.x + goldWidth * lower - TEXT_X - 49) / Math.max(1, visibleText(line))), 0, 100)}% 0 0)`;
      });
      const logoOpacity = String(smooth(frame,10,19));
      mark.style.opacity = logoOpacity;
      replacement.style.opacity = logoOpacity;
      baseRibbon(clamp(Math.floor(frame) - 1, 0, RIBBON_FRAMES - 1));
      plate(WHITE,whiteWidth,upper);
      plate(GOLD,goldWidth,lower);
      // The front lip of the same Blender render sits in front of the two plates.
      if (upper > 0 || lower > 0) ribbon(FRONT_TILE);
    }
    function paint(time) {
      currentFrame = 1 + 59 * clamp(time / 2200, 0, 1);
      draw();
    }
    function show(visible) {
      art.hidden = !visible;
      const note = document.querySelector('#hymn3d-warning');
      if (note) note.hidden = true;
      if (visible) {
        void ready().catch(error => {
          if (!art.hidden) {
            graphic.setAttribute('aria-label', error.message);
            if (note) { note.hidden = false; note.textContent = error.message; }
          }
        });
      }
    }
    return {show, ready, resize, paint, setRibbonColor};
  }
  window.Hymn3D = Object.freeze({create, HEADLINE_LIMIT, DETAIL_LIMIT, DEFAULT_RIBBON_COLOR});
})();
