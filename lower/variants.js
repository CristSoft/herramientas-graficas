(() => {
  'use strict';
  const graphic = document.querySelector('.lower-third');
  const copy = graphic.querySelector('.copy');
  const layer = document.createElement('div');
  layer.className = 'trail-art'; layer.setAttribute('aria-hidden', 'true'); layer.hidden = true;
  layer.innerHTML = `<svg class="trail-panel" width="900" height="196" viewBox="0 0 900 196">
    <defs>
      <linearGradient id="trail-background"><stop data-ink stop-color="#17120b" stop-opacity=".94"/><stop offset=".8" data-ink stop-color="#17120b" stop-opacity=".82"/><stop offset="1" data-ink stop-color="#17120b" stop-opacity="0"/></linearGradient>
      <linearGradient id="trail-gold" gradientUnits="userSpaceOnUse" x1="95" y1="0" x2="900" y2="0"><stop data-gold stop-color="#d9ae50"/><stop offset=".32" stop-color="#fff2bb"/><stop offset=".75" data-gold stop-color="#d9ae50"/><stop offset="1" data-gold stop-color="#d9ae50" stop-opacity="0"/></linearGradient>
      <radialGradient id="trail-spark"><stop stop-color="#fffbe8"/><stop offset=".18" stop-color="#fff0aa" stop-opacity=".9"/><stop offset="1" data-gold stop-color="#d9ae50" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="95" y="28" width="805" height="142" fill="url(#trail-background)"/>
    <path d="M95 28H891M95 170H891" fill="none" stroke="url(#trail-gold)" stroke-width="1.8"/>
    <path d="M190 151H511M535 151H871" fill="none" stroke="url(#trail-gold)" stroke-width="1.2"/>
    <path d="M523 144L529 151L523 158L517 151Z" fill="#fff0af"/>
    <path d="M140 133C190 129 197 97 255 96M141 121C183 119 206 83 258 84M143 145C193 139 207 111 258 109" fill="none" stroke="url(#trail-gold)" stroke-width="1.2"/>
    <ellipse cx="808" cy="28" rx="48" ry="5" fill="url(#trail-spark)"/>
    <ellipse cx="728" cy="170" rx="36" ry="4" fill="url(#trail-spark)"/>
  </svg>
  <div class="trail-circle">
    <svg width="174" height="196" viewBox="0 0 174 196">
      <defs><radialGradient id="trail-disc"><stop stop-color="#332419"/><stop offset="1" data-ink stop-color="#17120b"/></radialGradient><linearGradient id="trail-ring" x1="0" y1="0" x2="1" y2="1"><stop data-gold stop-color="#d9ae50"/><stop offset=".45" stop-color="#fff2bb"/><stop offset="1" data-gold stop-color="#d9ae50"/></linearGradient><radialGradient id="trail-note-glow"><stop data-gold stop-color="#d9ae50" stop-opacity=".25"/><stop offset="1" data-gold stop-color="#d9ae50" stop-opacity="0"/></radialGradient></defs>
      <circle cx="87" cy="98" r="79" fill="url(#trail-disc)" stroke="url(#trail-ring)" stroke-width="2.4"/>
      <circle cx="87" cy="98" r="73" fill="none" stroke="url(#trail-ring)" stroke-width=".9"/>
      <circle cx="87" cy="98" r="68" fill="url(#trail-note-glow)"/>
      <g class="trail-default" color="#fff0b3">${window.LowerSymbols.music.markup}</g>
    </svg>
    <img class="trail-logo-image" alt="" hidden>
  </div>`;
  graphic.insertBefore(layer, copy);
  const diagonal = document.createElement('div');
  diagonal.className = 'diagonal-art'; diagonal.setAttribute('aria-hidden', 'true'); diagonal.hidden = true;
  diagonal.innerHTML = `<svg width="900" height="196" viewBox="0 0 900 196" aria-hidden="true">
    <defs>
      <radialGradient id="diagonal-shine"><stop stop-color="#fff" stop-opacity=".82"/><stop offset=".22" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <clipPath id="diagonal-line-clip"><path d="M60 108 H865 L861 114 H58 Z"/></clipPath>
    </defs>
    <path class="diagonal-accent" d="M0 174 L55 22 H91 L36 174 Z"/>
    <path class="diagonal-main" d="M91 22 H900 L865 108 H60 Z"/>
    <path class="diagonal-line" d="M60 108 H865 L861 114 H58 Z"/>
    <g clip-path="url(#diagonal-line-clip)"><ellipse class="diagonal-shine" cx="60" cy="111" rx="95" ry="14" fill="url(#diagonal-shine)"/></g>
    <path class="diagonal-sub" d="M58 114 H861 L839 174 H36 Z"/>
  </svg>`;
  graphic.insertBefore(diagonal, copy);
  const broadcast = document.createElement('div');
  broadcast.className = 'broadcast-art'; broadcast.hidden = true; broadcast.setAttribute('aria-hidden','true');
  const broadcastPanel = 'M99 12 H223 Q244 12 236 33 L185 159 Q177 180 157 180 H45 Q20 180 30 157 L76 35 Q84 12 99 12 Z';
  const broadcastBottom = 'M157 180 H650 C733 180 745 149 830 149 H848';
  const edgeLight = (name, path, rx, ry) => `
    <defs><mask id="broadcast-${name}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="196">
      <ellipse class="broadcast-${name}-light" rx="${rx}" ry="${ry}" fill="url(#broadcast-light-fade)"/>
    </mask></defs>
    <g mask="url(#broadcast-${name}-mask)" fill="none" stroke-linecap="round">
      <path class="broadcast-light-halo" d="${path}" stroke-width="9" opacity=".32" filter="url(#broadcast-light-blur)"/>
      <path d="${path}" stroke="#fff" stroke-width="1.6" opacity=".85"/>
    </g>`;
  broadcast.innerHTML = `<svg width="900" height="196" viewBox="0 0 900 196">
    <defs>
      <radialGradient id="broadcast-light-fade">
        <stop stop-color="#fff"/><stop offset=".36" stop-color="#fff" stop-opacity=".68"/>
        <stop offset=".72" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <filter id="broadcast-light-blur" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="196">
        <feGaussianBlur stdDeviation="2.8"/>
      </filter>
      <clipPath id="broadcast-bands-clip"><rect x="0" y="0" width="0" height="196"/></clipPath>
      <clipPath id="broadcast-plate-clip"><rect x="0" y="0" width="0" height="196"/></clipPath>
    </defs>
    <g clip-path="url(#broadcast-bands-clip)">
      <path class="broadcast-base" d="${broadcastBottom} Q857 149 862 141 L888 95 H125 L95 180 Z"/>
      <path class="broadcast-back" d="M10 52 H870 L841 104 H0 Z"/>
    </g>
    <path class="broadcast-plate" clip-path="url(#broadcast-plate-clip)" d="M240 38 H846 Q854 38 849 48 L803 116 H196 Z"/>
    <path class="broadcast-accent" d="M222 22 H257 Q265 22 260 31 L196 139 H180 Z"/>
    <g clip-path="url(#broadcast-bands-clip)">
      <path class="broadcast-line" d="${broadcastBottom}" fill="none" stroke-width="1.4" stroke-opacity=".48"/>
      ${edgeLight('bottom', broadcastBottom, 112, 34)}
    </g>
    <path class="broadcast-panel" d="${broadcastPanel}"/>
    <path class="broadcast-border" d="${broadcastPanel}" fill="none" stroke-width="2.5"/>
    ${edgeLight('border', broadcastPanel, 58, 58)}
  </svg><img class="broadcast-logo-image" alt="" hidden>`;
  graphic.insertBefore(broadcast, copy);
  const interview = {
    bandsClip: broadcast.querySelector('#broadcast-bands-clip rect'),
    plateClip: broadcast.querySelector('#broadcast-plate-clip rect'),
    panel: broadcast.querySelector('.broadcast-panel'),
    border: broadcast.querySelector('.broadcast-border'),
    accent: broadcast.querySelector('.broadcast-accent'),
    logo: broadcast.querySelector('.broadcast-logo-image'),
    bottom: broadcast.querySelector('.broadcast-line'),
    borderLight: broadcast.querySelector('.broadcast-border-light'),
    bottomLight: broadcast.querySelector('.broadcast-bottom-light')
  };
  const details = copy.querySelectorAll('.subtitle, .third-line');
  const communion = document.createElement('div');
  communion.className = 'communion-art';
  communion.hidden = true;
  communion.setAttribute('aria-hidden', 'true');
  const communionSilhouette = 'M0 36 H900 L856 115 Q831 159 785 159 H0 Z';
  const communionEdge = 'M0 159 H785 Q831 159 856 115 L900 36';
  communion.innerHTML = `<svg width="900" height="196" viewBox="0 0 900 196">
    <defs>
      <clipPath id="communion-shape"><path d="${communionSilhouette}"/></clipPath>
      <clipPath id="communion-reveal"><path d="M0 170 H900 V196 H0 Z"/></clipPath>
      <linearGradient id="communion-plate" x2="0" y2="1">
        <stop data-communion-plate stop-opacity=".92"/><stop offset="1" data-communion-plate stop-opacity=".78"/>
      </linearGradient>
      <linearGradient id="communion-metal" x1="0" y1="0" x2=".8" y2="1">
        <stop stop-color="#fff1cf"/><stop offset=".34" data-communion-accent/>
        <stop offset=".56" stop-color="#ffe4ad"/><stop offset="1" data-communion-accent/>
      </linearGradient>
      <radialGradient id="communion-reflection">
        <stop stop-color="#fff5db"/><stop offset=".28" data-communion-accent stop-opacity=".8"/>
        <stop offset="1" data-communion-accent stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g clip-path="url(#communion-reveal)">
      <path d="${communionSilhouette}" fill="url(#communion-plate)"/>
      <g clip-path="url(#communion-shape)" fill="url(#communion-metal)">
        <path d="M0 159 C235 149 425 191 644 141 C738 120 817 87 900 52 V159 Z" opacity=".19"/>
        <path d="M0 159 C230 154 440 181 623 156 C751 138 806 132 900 36 V159 Z" opacity=".13"/>
      </g>
      <path data-communion-edge d="M0 36 H900" fill="none" stroke-width="1.2" opacity=".74"/>
      <path data-communion-edge d="${communionEdge}" fill="none" stroke-width="2"/>
      <ellipse class="communion-glint" cy="159" rx="100" ry="10" fill="url(#communion-reflection)"/>
      <path data-communion-edge d="M198 58 V137" stroke-width="1.5"/>
    </g>
    <g transform="translate(64 57)"><g class="communion-symbol" fill="none" stroke="url(#communion-metal)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
      <ellipse pathLength="1" cx="29" cy="7" rx="25" ry="5"/>
      <path pathLength="1" d="M4 7 C4 24 10 38 23 42 Q30 45 36 42 C49 37 54 24 54 7 M26 43 Q21 49 26 53 C26 64 23 72 12 76 Q29 80 45 76 C35 72 32 64 32 53 Q38 49 32 43"/>
      <path pathLength="1" d="M55 78 C47 78 43 73 46 66 C52 52 65 47 74 50 Q81 45 89 51 C101 49 116 62 115 71 Q115 78 107 78 Z M65 51 Q73 54 77 63 M82 49 Q90 54 93 61"/>
    </g></g>
  </svg><img class="communion-logo-image" alt="" hidden>`;
  graphic.insertBefore(communion, copy);
  const communionReveal = communion.querySelector('#communion-reveal path');
  const communionStrokes = communion.querySelector('.communion-symbol').children;
  const communionGlint = communion.querySelector('.communion-glint');
  const live = document.createElement('div');
  live.className = 'live-art';
  live.hidden = true;
  live.setAttribute('aria-hidden', 'true');
  const liveBaseEdge = 507;
  const liveShellPath = edge => `M87 35 H${edge} Q${edge + 17} 35 ${edge + 27} 46 L${edge + 50} 67 Q${edge + 59} 75 ${edge + 74} 75 H873 Q896 75 887 93 L861 133 Q855 143 842 143 H740 Q729 143 721 156 L713 166 Q706 174 691 174 H33 Q9 174 18 151 L65 53 Q73 35 87 35 Z`;
  const liveTrimPath = edge => `M150 122 H734 L713 156 Q708 165 691 165 H34 M201 58 V106 M${edge + 45} 67 Q${edge + 56} 80 ${edge + 75} 80 H789`;
  const liveShell = liveShellPath(liveBaseEdge);
  live.innerHTML = `<svg width="900" height="196" viewBox="0 0 900 196">
    <defs>
      <clipPath id="live-open"><rect x="16" y="105" width="0" height="0"/></clipPath>
      <linearGradient id="live-blue" x1="0" y1="0" x2=".86" y2="1">
        <stop data-live-plate/><stop offset="1" data-live-accent stop-opacity=".43"/>
      </linearGradient>
      <linearGradient id="live-edge">
        <stop data-live-accent/><stop offset=".42" data-live-accent stop-opacity=".34"/>
        <stop offset="1" data-live-accent stop-opacity=".84"/>
      </linearGradient>
      <filter id="live-halo" filterUnits="userSpaceOnUse" x="0" y="0" width="900" height="196">
        <feGaussianBlur stdDeviation="4"/>
      </filter>
    </defs>
    <g clip-path="url(#live-open)">
      <path data-live-shell d="${liveShell}" fill="none" stroke="url(#live-edge)" stroke-width="7" opacity=".65" filter="url(#live-halo)"/>
      <path data-live-shell data-live-body d="${liveShell}"/>
      <path d="M87 35 H191 L131 165 H33 Q15 165 21 150 L66 54 Q74 35 87 35 Z" fill="url(#live-blue)"/>
      <path d="M150 122 H734 L713 156 Q708 165 691 165 H130 Z" fill="url(#live-blue)"/>
      <path data-live-trim d="${liveTrimPath(liveBaseEdge)}" fill="none" stroke="url(#live-edge)" stroke-width="1.8"/>
      <path data-live-shell d="${liveShell}" fill="none" stroke="url(#live-edge)" stroke-width="2.4"/>
      <g data-live-ink>
        <path class="live-mark" d="M808 86 H818 L809 102 H798 Z"/>
        <path class="live-mark" d="M826 86 H836 L827 102 H816 Z"/>
        <path class="live-mark" d="M844 86 H854 L845 102 H834 Z"/>
      </g>
    </g>
    <circle class="live-pulse" cx="104" cy="103" r="22" fill="none" stroke="url(#live-edge)" stroke-width="2"/>
  </svg><img class="live-logo-image" alt="" hidden>`;
  graphic.insertBefore(live, copy);
  const liveOpening = live.querySelector('#live-open rect');
  const liveShellPaths = live.querySelectorAll('[data-live-shell]');
  const liveTrim = live.querySelector('[data-live-trim]');
  const livePulse = live.querySelector('.live-pulse');
  const liveLogo = live.querySelector('.live-logo-image');
  const liveMarks = live.querySelectorAll('.live-mark');
  const hymn3d = window.Hymn3D.create(graphic, copy);
  const heading = copy.querySelector('.headline');
  const diagonalLogo = document.createElement('img');
  diagonalLogo.className = 'diagonal-logo-image'; diagonalLogo.alt = ''; diagonalLogo.hidden = true;
  diagonal.appendChild(diagonalLogo);
  const panel = layer.querySelector('.trail-panel');
  const circle = layer.querySelector('.trail-circle');
  function setStyle(variant) {
    const trail = variant === 'trail';
    for (const element of [copy, heading, ...details]) {
      element.style.opacity = '';
      element.style.clipPath = '';
      element.style.transform = '';
    }
    copy.style.maskImage = '';
    copy.style.maskRepeat = '';
    graphic.dataset.variant = variant;
    layer.hidden = !trail;
    diagonal.hidden = variant !== 'diagonal';
    broadcast.hidden = variant !== 'broadcast';
    communion.hidden = variant !== 'communion';
    live.hidden = variant !== 'live';
    hymn3d.show(variant === 'hymn3d');
  }
  function setColors(colors, usePalette = false) {
    hymn3d.setRibbonColor(colors.plate);
    layer.querySelectorAll('[data-gold]').forEach(e => e.setAttribute('stop-color', colors.accent));
    layer.querySelectorAll('[data-ink]').forEach(e => e.setAttribute('stop-color', colors.plate));
    diagonal.querySelector('.diagonal-accent').setAttribute('fill', colors.accent);
    diagonal.querySelector('.diagonal-line').setAttribute('fill', colors.accent);
    diagonal.querySelector('.diagonal-main').setAttribute('fill', colors.plate);
    diagonal.querySelector('.diagonal-sub').setAttribute('fill', usePalette ? colors.plate : colors.headline);
    for (const [selector,color] of Object.entries({'.broadcast-base':colors.plate,'.broadcast-back':colors.plate,'.broadcast-panel':colors.plate,'.broadcast-plate':colors.headline,'.broadcast-accent':colors.accent,'.broadcast-border':colors.accent,'.broadcast-line':colors.accent})) {
      const item = broadcast.querySelector(selector); item.setAttribute((selector === '.broadcast-border' || selector === '.broadcast-line') ? 'stroke' : 'fill',color);
    }
    broadcast.querySelectorAll('.broadcast-light-halo').forEach(path => path.setAttribute('stroke',colors.accent));
    communion.querySelectorAll('[data-communion-plate]').forEach(stop => stop.setAttribute('stop-color', colors.plate));
    communion.querySelectorAll('[data-communion-accent]').forEach(stop => stop.setAttribute('stop-color', colors.accent));
    communion.querySelectorAll('[data-communion-edge]').forEach(path => path.setAttribute('stroke', colors.accent));
    live.querySelectorAll('[data-live-accent]').forEach(stop => stop.setAttribute('stop-color', colors.accent));
    live.querySelectorAll('[data-live-plate]').forEach(stop => stop.setAttribute('stop-color', colors.plate));
    live.querySelector('[data-live-body]').setAttribute('fill', colors.plate);
    live.querySelector('[data-live-ink]').setAttribute('fill', colors.accent);
  }
  function setRadius(radius) { panel.querySelector('rect').setAttribute('rx',String(radius)); }
  function progress(time, start, end) {
    const t = Math.max(0, Math.min(1, (time - start) / (end - start)));
    return t * t * (3 - 2 * t);
  }
  function paint(time, elapsed) {
    if (graphic.dataset.variant === 'hymn3d') {
      hymn3d.paint(time);
      return;
    }
    if (graphic.dataset.variant === 'live') {
      const signal = progress(time, 45, 630);
      livePulse.setAttribute('r', String(22 + 44 * signal));
      livePulse.style.opacity = String(.84 * Math.sin(Math.PI * signal));
      const width = 900 * progress(time, 330, 1160);
      const height = 192 * progress(time, 205, 850);
      liveOpening.setAttribute('x', String(Math.max(0, 103 - width / 2)));
      liveOpening.setAttribute('y', String(104 - height / 2));
      liveOpening.setAttribute('width', String(width));
      liveOpening.setAttribute('height', String(height));
      const logo = progress(time, 95, 580);
      liveLogo.style.opacity = String(logo);
      liveLogo.style.transform = `scale(${.88 + .12 * logo})`;
      const title = progress(time, 675, 1300);
      copy.style.opacity = String(title);
      copy.style.clipPath = `inset(0 ${(1 - title) * 100}% 0 0)`;
      const detail = progress(time, 1030, 1570);
      details.forEach(line => { line.style.opacity = String(detail); });
      liveMarks.forEach((mark, index) => {
        const start = 1120 + index * 180;
        const lit = progress(time, start, start + 320);
        const flicker = .9 + .1 * Math.cos(elapsed * 2 * Math.PI / 1900 - index * .72);
        mark.style.opacity = String(lit * flicker);
      });
      return;
    }
    if (graphic.dataset.variant === 'communion') {
      const reveal = progress(time, 490, 1510);
      const top = 170 - 144 * reveal;
      const fold = 31 * Math.sin(Math.PI * reveal);
      communionReveal.setAttribute('d', `M0 ${top} C290 ${top - fold} 610 ${top + fold} 900 ${top} V196 H0 Z`);
      [ [80, 440], [175, 750], [365, 870] ].forEach(([start, end], index) => {
        const trace = progress(time, start, end);
        const stroke = communionStrokes[index];
        stroke.style.opacity = String(progress(time, start, start + 90));
        stroke.style.strokeDasharray = trace === 1 ? 'none' : `${trace} 1`;
      });
      communion.style.setProperty('--communion-emblem-opacity', String(progress(time, 160, 800)));
      const text = progress(time, 1020, 1870);
      copy.style.opacity = String(text);
      copy.style.transform = `translateY(${12 * (1 - text)}px)`;
      const reflection = (1 - Math.cos(elapsed * Math.PI / 2500)) / 2;
      communionGlint.setAttribute('cx', String(40 + 720 * reflection));
      communionGlint.setAttribute('opacity', String(.72 * progress(time, 1510, 1980)));
      return;
    }
    if (graphic.dataset.variant === 'broadcast') {
      const {border, bottom} = interview;
      const borderLength = border.getTotalLength();
      const trace = progress(time, 0, 650);
      border.style.opacity = String(progress(time, 0, 120));
      border.style.strokeDasharray = trace === 1 ? 'none' : `${trace * borderLength} ${borderLength}`;
      interview.panel.style.opacity = String(progress(time, 220, 660));
      const logo = progress(time, 430, 870);
      interview.logo.style.opacity = String(logo);
      interview.logo.style.transform = `translateY(${(1 - logo) * 10}px) scale(${.93 + .07 * logo})`;
      interview.accent.style.opacity = String(progress(time, 700, 1040));
      interview.bandsClip.setAttribute('width', String(900 * progress(time, 740, 1500)));
      interview.plateClip.setAttribute('width', String(900 * progress(time, 980, 1700)));
      const title = progress(time, 1380, 1900);
      copy.style.opacity = String(title);
      copy.style.transform = `translateY(${(1 - title) * 12}px)`;
      const detail = progress(time, 1550, 2070);
      details.forEach(line => { line.style.opacity = String(detail); });
      const phase = (1-Math.cos(elapsed*2*Math.PI/4000))/2;
      const borderPoint = border.getPointAtLength((elapsed % 6000) / 6000 * borderLength);
      const bottomPoint = bottom.getPointAtLength(phase * bottom.getTotalLength());
      const shine = progress(time, 1720, 2150);
      for (const [light, point] of [[interview.borderLight, borderPoint], [interview.bottomLight, bottomPoint]]) {
        light.setAttribute('cx', String(point.x));
        light.setAttribute('cy', String(point.y));
        light.setAttribute('opacity', String(shine));
      }
      return;
    }
    if (graphic.dataset.variant === 'diagonal') {
      const p = Math.max(0, Math.min(1, time / 1500));
      const shinePosition = (1 - Math.cos(elapsed * 2 * Math.PI / 4000)) / 2;
      diagonal.querySelector('.diagonal-shine').setAttribute('cx', String(60 + shinePosition * 805));
      const eased = 1 - Math.pow(1 - p, 3);
      // El borde de revelado sigue la inclinación de los extremos de la placa.
      const edge = eased * 108;
      diagonal.style.clipPath = `polygon(0 0, ${edge}% 0, ${edge - 8}% 100%, 0 100%)`;
      const textProgress = Math.max(0, Math.min(1, (p - .25) / .5));
      copy.style.opacity = String(textProgress);
      copy.style.transform = `translateX(${(1 - textProgress) * -24}px)`;
      return;
    }
    if (graphic.dataset.variant !== 'trail') return;
    const p = Math.max(0, Math.min(1, time / 2200));
    const eased = 1 - Math.pow(1 - p, 3);
    const left = 8 + (1 - eased) * 806;
    const edge = left + 87;
    const opacity = Math.min(1, p * 12);
    circle.style.transform = `translateX(${left}px)`;
    circle.style.opacity = String(opacity);
    panel.style.maskImage = `linear-gradient(90deg,transparent ${edge - 35}px,#000 ${edge + 55}px)`;
    panel.style.maskRepeat = 'no-repeat'; panel.style.opacity = String(opacity);
    const localEdge = edge - 205;
    const settle = Math.max(0,Math.min(1,(p-.6)/.4));
    const tail = 240 * (1 - settle*settle*(3-2*settle));
    copy.style.maskImage = `linear-gradient(90deg,transparent ${localEdge - 20}px,#000 ${localEdge + tail}px)`;
    copy.style.maskRepeat = 'no-repeat'; copy.style.opacity = String(opacity);
  }
  function resize() {
    if (graphic.dataset.variant === 'hymn3d') hymn3d.resize();
    if (graphic.dataset.variant === 'live') {
      const titleWidth = heading.firstElementChild.scrollWidth;
      const edge = Math.max(liveBaseEdge, copy.offsetLeft + titleWidth + 18);
      const shell = liveShellPath(edge);
      liveShellPaths.forEach(path => path.setAttribute('d', shell));
      liveTrim.setAttribute('d', liveTrimPath(edge));
    }
  }
  window.LowerVariant = Object.freeze({
    setStyle,setColors,setRadius,paint,resize,
    ready: () => graphic.dataset.variant === 'hymn3d' ? hymn3d.ready() : undefined
  });
})();
