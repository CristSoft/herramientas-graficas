(() => {
  'use strict';
  const ENTRANCE_DURATION = 2200;
  const DEFAULT_DURATION = 6000;
  const TIMING_KEYS = ['duration', 'entrance', 'exit'];
  const currentStyle = style => style === 'hymn' ? 'hymn3d' : style;
  const graphic = document.querySelector('.lower-third');
  const title = graphic.querySelector('.headline span');
  const subtitle = graphic.querySelector('.subtitle span');
  const third = graphic.querySelector('.third-line span');
  const copy = graphic.querySelector('.copy');
  const thirdInput = document.querySelector('#third-input');
  const radiusInput = document.querySelector('#corner-radius');
  const radiusValue = document.querySelector('#radius-value');
  const visibilityInputs = {title:document.querySelector('#show-title'),subtitle:document.querySelector('#show-subtitle'),third:document.querySelector('#show-third')};
  let visible = {title:true,subtitle:true,third:true};
  let cornerRadius = 28;
  const titleInput = document.querySelector('#title-input');
  const subtitleInput = document.querySelector('#subtitle-input');
  const seek = document.querySelector('#seek');
  const time = document.querySelector('#time');
  const playButton = document.querySelector('#play');
  const loopButton = document.querySelector('#loop');
  const timingInputs = {
    duration: document.querySelector('#export-duration'),
    entrance: document.querySelector('#entrance-duration'),
    exit: document.querySelector('#exit-duration')
  };
  const holdOutput = document.querySelector('#hold-duration');
  const timingError = document.querySelector('#timing-error');
  const params = new URLSearchParams(location.search);
  const initialVariant = currentStyle(params.get('variant')) || 'original';
  const DEFAULT_COLORS = Object.freeze({accent:'#f7a813',plate:'#17120b',headline:'#ffffff',subtitle:'#f7a813'});
  const styleDefaults = {
    original: DEFAULT_COLORS,
    trail: {accent:'#d9ae50',plate:'#17120b',headline:'#fff0b3',subtitle:'#e9cc84'},
    diagonal: {...DEFAULT_COLORS,subtitle:'#17120b'},
    broadcast: {...DEFAULT_COLORS,plate:'#102545',subtitle:'#ffffff'},
    communion: {accent:'#d39b4e',plate:'#281e18',headline:'#fff9ef',subtitle:'#f6dfbb'},
    live: {accent:'#16bffa',plate:'#071d30',headline:'#f5faff',subtitle:'#e8f7ff'},
    hymn3d: {accent:'#efb739',plate:window.Hymn3D.DEFAULT_RIBBON_COLOR,headline:'#321147',subtitle:'#371449'}
  };
  const DEFAULT_EXAMPLE = ['Pr. Juan Giménez', 'Lic. en Teología'];
  const examples = {
    communion: ['SANTA CENA', 'Reflexión y participación'],
    live: ['EN VIVO', 'Comenzamos en instantes'],
    hymn3d: ['A CRISTO CORONAD', 'Himno especial']
  };
  let variant = 'original';
  const colorVariables = {accent:'--amber',plate:'--ink',headline:'--headline',subtitle:'--subtitle'};
  const colorParams = {accent:'accent',plate:'plate',headline:'headline',subtitle:'subtitleColor'};
  let logoAccent = false;
  let colors = {...DEFAULT_COLORS};
  let colorOverrides = {};
  let frame = 0;
  let looping = new URLSearchParams(location.search).get('loop') === '1';
  let timingOverrides = {};
  let timing = resolveTiming(timingOverrides);
  let playhead = 0;
  let playing = false;
  let startedAt = 0;
  function fitText(span, baseSize, maxWidth = {communion:583, broadcast:540}[variant] ?? 646) {
    span.style.fontSize = baseSize + 'px';
    if (span.scrollWidth > maxWidth) span.style.fontSize = (baseSize * maxWidth / span.scrollWidth) + 'px';
  }
  function updateText() {
    const lines = {title,subtitle,third};
    for (const [key,span] of Object.entries(lines)) {
      span.parentElement.hidden = !visible[key] || !span.textContent.trim();
      if (visibilityInputs[key]) visibilityInputs[key].checked = visible[key];
    }
    const count = Object.values(lines).filter(span=>!span.parentElement.hidden).length;
    copy.dataset.count = String(count);
    if (variant === 'hymn3d') {
      const {HEADLINE_LIMIT, DETAIL_LIMIT} = window.Hymn3D;
      const hasExtraLine = !subtitle.parentElement.hidden && !third.parentElement.hidden;
      fitText(title, 54, HEADLINE_LIMIT);
      fitText(subtitle, hasExtraLine ? 22 : 32, DETAIL_LIMIT);
      fitText(third, hasExtraLine ? 22 : 32, DETAIL_LIMIT);
    } else if (variant === 'live') {
      const detailSize = !subtitle.parentElement.hidden && !third.parentElement.hidden ? 20 : 31;
      for (const span of [title, subtitle, third]) {
        const width = span.parentElement.clientWidth;
        if (width > 2) fitText(span, span === title ? 64 : detailSize, width - 2);
      }
    } else if (variant === 'communion') {
      fitText(title, count === 3 ? 40 : 53);
      fitText(subtitle, count === 3 ? 21 : 30);
      fitText(third, count === 3 ? 21 : 30);
    } else {
      fitText(title, variant==='broadcast' ? (count===3?36:43) : variant==='diagonal' ? (count===3?40:48) : variant==='trail' ? (count===1?78:count===2?54:46) : count===3 ? 52 : 64);
      const detailSize = variant==='broadcast' ? (count===3?22:28) : variant==='diagonal' ? (count===3?23:30) : variant==='trail' ? (count===1?54:count===2?30:26) : count===3 ? 32 : 40;
      fitText(subtitle, detailSize);
      fitText(third, detailSize);
    }
    graphic.setAttribute('aria-label', Object.values(lines).filter(span=>!span.parentElement.hidden).map(span=>span.textContent).join('. '));
    window.LowerVariant.resize();

  }
  function setOptions(options = {}) {
    const next = currentStyle(options.variant);
    if (Object.hasOwn(styleDefaults, next)) {
      const changed = variant !== next;
      variant = next;
      window.LowerVariant.setStyle(variant);
      if (changed) applyColors();
      const shapeSetting = document.querySelector('.shape-settings'); if (shapeSetting) shapeSetting.hidden = !['original','trail'].includes(variant);
      const plateLabel = document.querySelector('#color-plate-label');
      if (plateLabel) plateLabel.textContent = variant === 'hymn3d' ? 'Color de la cinta' : 'Placa';
      const selector = document.querySelector('#lower-variant'); if (selector) selector.value = variant;
    }
    if (options.visible && typeof options.visible === 'object') {
      for (const key of Object.keys(visible)) if (typeof options.visible[key] === 'boolean') visible[key] = options.visible[key];
    }
    if (Number.isInteger(options.cornerRadius) && options.cornerRadius >= 0 && options.cornerRadius <= 98) cornerRadius = options.cornerRadius;
    graphic.style.setProperty('--corner-radius',cornerRadius+'px');
    window.LowerVariant.setRadius(cornerRadius);
    if (radiusInput) radiusInput.value=String(cornerRadius);
    if (radiusValue) radiusValue.textContent=cornerRadius+' px';
    if (options.logoSize !== undefined) window.LowerLogo.setSize(options.logoSize);
    updateText(); applyFrame();
  }
  function setColors(patch = {}) {
    if (typeof patch.logoAccent === 'boolean') logoAccent = patch.logoAccent;
    for (const key of Object.keys(DEFAULT_COLORS)) {
      if (typeof patch[key] === 'string' && /^#[0-9a-f]{6}$/i.test(patch[key])) colorOverrides[key] = patch[key].toLowerCase();
    }
    applyColors();
  }
  function applyColors() {
    colors = {...styleDefaults[variant], ...colorOverrides};
    const brightness = hex => {
      const rgb = hex.slice(1).match(/../g).map(value => parseInt(value,16)/255);
      return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
    };
    for (const key of Object.keys(colors)) {
      let ink = colors[key];
      // Cinta 3D puts the text over white and gold Blender layers.
      const limit = key === 'headline' ? .40 : key === 'subtitle' ? .32 : null;
      if (logoAccent && variant === 'hymn3d' && limit !== null && brightness(ink) > limit)
        ink = brightness(colors.plate) <= limit ? colors.plate : '#17120b';
      graphic.style.setProperty(colorVariables[key], ink);
      const input = document.querySelector(`[data-color="${key}"]`);
      if (input) {
        input.value = colors[key];
        input.parentElement.querySelector('output').textContent = colors[key].toUpperCase();
      }
    }
    window.LowerVariant.setColors(colors, logoAccent);
    setLogoColor();
    updateText();
  }
  function setLogoColor() {
    window.LowerLogo.setColor(!logoAccent && ['broadcast','live'].includes(variant) ? colors.headline : colors.accent, logoAccent);
  }
  function fitPreview() {
    const space = document.querySelector('.fit-space');
    if (space) space.style.setProperty('--preview-scale', space.clientWidth / 900);
  }
  function resolveTiming(overrides) {
    const duration = overrides.duration ?? DEFAULT_DURATION;
    const shortEntrance = Math.round(duration * .4 / 100) * 100;
    const defaultTransition = Math.min(ENTRANCE_DURATION, shortEntrance);
    if ((overrides.entrance ?? 100) + (overrides.exit ?? 100) > duration) return null;
    const entrance = overrides.entrance ?? Math.min(defaultTransition, duration - (overrides.exit ?? defaultTransition));
    const exit = overrides.exit ?? Math.min(defaultTransition, duration - entrance);
    return {duration, entrance, exit};
  }
  function applyFrame() {
    const {duration, entrance, exit} = timing;
    const exiting = playhead > duration - exit;
    const progress = exiting ? (duration - playhead) / exit : Math.min(1, playhead / entrance);
    const value = progress * ENTRANCE_DURATION;
    // Hiding an editor recreates its CSS animations when it becomes visible.
    const animations = graphic.getAnimations({subtree: true});
    animations.forEach(a => { if (a.playState !== 'paused') a.pause(); a.currentTime = value; });
    window.LowerVariant.paint(value, playhead);
    return value;
  }
  const secondsLabel = ms => String(ms / 1000).replace('.', ',');
  function drawControls() {
    if (seek) { seek.max = String(timing.duration); seek.value = String(Math.round(playhead)); }
    if (time) time.textContent = (playhead / 1000).toFixed(2).replace('.', ',') + ' / ' + secondsLabel(timing.duration) + ' s';
    if (playButton) {
      playButton.dataset.playing = String(playing);
      playButton.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
      playButton.title = playing ? 'Pausar' : 'Reproducir';
    }
    if (loopButton) loopButton.setAttribute('aria-pressed', String(looping));
  }
  function tick(now) {
    if (!playing) return;
    playhead = Math.min(timing.duration, Math.max(0, now - startedAt));
    applyFrame();
    if (playhead >= timing.duration) {
      if (looping) { replay(); return; }
      playing = false;
    }
    drawControls();
    if (playing) frame = requestAnimationFrame(tick);
  }
  function showTimingError(message = '') {
    if (timingError) {
      timingError.textContent = message;
      timingError.hidden = !message;
    }
  }
  function updateTiming(next) {
    timing = next;
    playhead = Math.min(playhead, timing.duration);
    startedAt = performance.now() - playhead;
    for (const key of TIMING_KEYS) {
      const input = timingInputs[key];
      if (input) input.value = String(timing[key] / 1000);
    }
    if (holdOutput) holdOutput.textContent = secondsLabel(timing.duration - timing.entrance - timing.exit) + ' s';
    showTimingError();
    drawControls();
  }
  function setTiming(patch) {
    const overrides = {...timingOverrides};
    for (const key of TIMING_KEYS) {
      if (patch[key] === undefined) continue;
      const tenths = Number(patch[key]) * 10;
      const min = key === 'duration' ? 30 : 1;
      const max = key === 'duration' ? 300 : 299;
      if (!Number.isInteger(tenths) || tenths < min || tenths > max) return false;
      overrides[key] = tenths * 100;
    }
    // Keep the current total across style changes once the user adjusts any time.
    overrides.duration ??= timing.duration;
    const next = resolveTiming(overrides);
    if (!next) return false;
    timingOverrides = overrides;
    updateTiming(next);
    applyFrame();
    return true;
  }
  function commitTiming(focusInvalid = false) {
    const patch = {};
    for (const key of TIMING_KEYS) {
      const input = timingInputs[key];
      if (!input) continue;
      if (!input.validity.valid) {
        showTimingError(input.validationMessage);
        if (focusInvalid) input.reportValidity();
        return false;
      }
      if (input.valueAsNumber !== timing[key] / 1000) patch[key] = input.valueAsNumber;
    }
    if (Object.keys(patch).length) {
      if (!setTiming(patch)) {
        showTimingError('La suma de la entrada y la salida debe caber en la duración total.');
        if (focusInvalid) timingInputs[Object.keys(patch)[0]]?.focus();
        return false;
      }
      replay();
    }
    showTimingError();
    return true;
  }
  function setTime(ms) {
    cancelAnimationFrame(frame);
    playing = false;
    playhead = Math.min(timing.duration, Math.max(0, Number(ms) || 0));
    const value = applyFrame();
    drawControls();
    return value;
  }
  function replay() {
    cancelAnimationFrame(frame);
    graphic.classList.remove('is-playing');
    void graphic.offsetWidth;
    graphic.classList.add('is-playing');
    playhead = 0; playing = true; startedAt = performance.now();
    applyFrame();
    drawControls(); frame = requestAnimationFrame(tick);
  }
  const initialExample = examples[initialVariant] ?? DEFAULT_EXAMPLE;
  title.textContent = params.get('title') ?? initialExample[0];
  subtitle.textContent = params.get('subtitle') ?? initialExample[1];
  if (params.has('third')) third.textContent = params.get('third');
  const queryVisible = {};
  for (const [key,param] of Object.entries({title:'showTitle',subtitle:'showSubtitle',third:'showThird'})) if (params.has(param)) queryVisible[key] = params.get(param) !== '0';
  setOptions({variant:initialVariant,visible:queryVisible,cornerRadius:params.has('radius') ? Number(params.get('radius')) : 28,logoSize:Number(params.get('logoSize'))});
  updateTiming(timing);
  const queryTiming = Object.fromEntries(TIMING_KEYS.filter(key => params.has(key)).map(key => [key, params.get(key)]));
  if (Object.keys(queryTiming).length) setTiming(queryTiming);
  setColors(Object.fromEntries(Object.keys(DEFAULT_COLORS).filter(k=>params.has(colorParams[k])).map(k=>[k,params.get(colorParams[k])])));
  if (params.get('render') === '1') {
    document.body.classList.add('render-frame');
    if (params.get('alpha') === '1') document.body.classList.add('render-transparent');
    const bg = params.get('background');
    if (/^#[0-9a-f]{6}$/i.test(bg || '')) document.body.style.setProperty('--export-background',bg);
  }
  if (titleInput) titleInput.value = title.textContent;
  if (subtitleInput) subtitleInput.value = subtitle.textContent;
  if (thirdInput) thirdInput.value = third.textContent;
  thirdInput?.addEventListener('input',()=>{third.textContent=thirdInput.value;updateText();});
  for (const [key,input] of Object.entries(visibilityInputs)) input?.addEventListener('change',()=>setOptions({visible:{[key]:input.checked}}));
  radiusInput?.addEventListener('input',()=>setOptions({cornerRadius:Number(radiusInput.value)}));
  document.querySelector('#lower-variant')?.addEventListener('change', e => {
    setOptions({variant:e.target.value});
    window.LowerLogo.refreshDefault();
    replay();
  });
  titleInput?.addEventListener('input', () => { title.textContent = titleInput.value; updateText(); });
  subtitleInput?.addEventListener('input', () => { subtitle.textContent = subtitleInput.value; updateText(); });
  const colorInputs = document.querySelectorAll('[data-color]');
  colorInputs.forEach(input => input.addEventListener('input', () => setColors({[input.dataset.color]:input.value})));
  const resetColors = document.querySelector('#reset-colors');
  resetColors?.addEventListener('click', () => {
    colorOverrides = {};
    logoAccent = false;
    applyColors();
  });
  window.GraphicPalettes?.mount(document.querySelector('#palette-control'), {
    read: () => ({...colors}),
    apply: palette => setColors({...palette,logoAccent:true}),
    manual: colorInputs,
    reset: resetColors
  });
  for (const input of Object.values(timingInputs)) input?.addEventListener('change', () => commitTiming());
  function play() {
    if (playing) return;
    if (playhead >= timing.duration) { replay(); return; }
    playing = true; startedAt = performance.now() - playhead;
    drawControls(); frame = requestAnimationFrame(tick);
  }
  playButton?.addEventListener('click', () => { if (playing) setTime(playhead); else play(); });
  document.querySelector('#stop')?.addEventListener('click', () => setTime(0));
  document.querySelector('#to-start')?.addEventListener('click', () => {
    const wasPlaying = playing;
    setTime(0);
    if (wasPlaying) play();
  });
  loopButton?.addEventListener('click', () => { looping = !looping; drawControls(); });
  seek?.addEventListener('input', () => setTime(seek.value));
  const space = document.querySelector('.fit-space');
  if (space) new ResizeObserver(fitPreview).observe(space);
  window.addEventListener('resize', fitPreview);
  window.LowerLogo.refreshDefault();
  document.fonts?.ready.then(updateText);
  updateText(); fitPreview(); replay();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) setTime((timing.entrance + timing.duration - timing.exit) / 2);
  // Small public API for replaying the transparent source or sampling a frame.
  window.lowerThird = Object.freeze({ replay, seek: setTime, setDuration:seconds => setTiming({duration:seconds}), setTiming, commitTiming, setColors, setOptions, setLogo:logo => logo ? window.LowerLogo.set(logo) : window.LowerLogo.choose('default'), getConfig:()=>({title:title.textContent,subtitle:subtitle.textContent,third:third.textContent,visible:{...visible},cornerRadius,variant,logo:window.LowerLogo.get(),logoSize:window.LowerLogo.getSize(),duration:timing.duration/1000,entrance:timing.entrance/1000,exit:timing.exit/1000,colors:{...colors,logoAccent}}), get duration(){return timing.duration;}, setText(heading, detail, extra = '') {
    title.textContent = String(heading); subtitle.textContent = String(detail); third.textContent = String(extra);
    if (titleInput) titleInput.value = title.textContent;
    if (subtitleInput) subtitleInput.value = subtitle.textContent;
    if (thirdInput) thirdInput.value = third.textContent;
    updateText();
  }});
})();
