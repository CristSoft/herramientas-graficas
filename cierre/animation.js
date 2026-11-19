(() => {
  'use strict';
  const scene=document.querySelector('.brand-scene');
  const params=new URLSearchParams(location.search);
  const DEFAULTS={accent:'#f7a813',denomination:'#f7a813',local:'#f7a813',background:'#17120b'};
  const variables={accent:'--accent',denomination:'--denomination',local:'--local-color',background:'--background'};
  const sizes={landscape:[1920,1080],vertical:[1080,1920],square:[1080,1080]};
  const MOTIONS={liquid:'La barra revela las líneas de abajo hacia arriba y el símbolo se desprende con un efecto líquido.',unfold:'La barra aparece sola. El texto se despliega hacia abajo y el símbolo emerge hacia arriba.',cascade:'Las líneas entran una por una desde la izquierda; el símbolo completa la firma.',aperture:'Cada línea se abre desde el centro y el símbolo aparece con un pequeño acercamiento.',gentle:'Las tres líneas y el símbolo aparecen en secuencia, con un desplazamiento suave.'};
  let config={name:'José C. Paz Sur',colors:{...DEFAULTS},scale:1,nameScale:1,duration:8,entrance:2.2,endMode:'reverse',format:'landscape',soundEnabled:true,volume:.4,soundType:'bell',motion:'liquid'};
  const sound=window.ClosingSound.preview();
  let soundUnlocked=false;
  let animations=[],playhead=0,playing=false,frame=0,startedAt=0;
  let looping=params.get('loop')==='1';
  const $=id=>document.getElementById(id);
  const total=()=>config.duration*1000;
  const transition=()=>Math.min(config.entrance*1000,total()*(config.endMode==='reverse'?.4:.6));
  function sample(ms){const entry=transition();if(ms<=entry)return ms/entry*2200;if(config.endMode==='hold'||ms<total()-entry)return 2200;return (total()-ms)/entry*2200;}
  function applyFrame(){const value=Math.max(0,Math.min(2200,sample(playhead)));animations=scene.getAnimations({subtree:true});animations.forEach(a=>{if(a.playState!=='paused')a.pause();a.currentTime=value;});return value;}
  function controls(){
    if($('seek')){$('seek').max=total();$('seek').value=Math.round(playhead);}
    if($('time'))$('time').textContent=(playhead/1000).toFixed(2).replace('.',',')+' / '+config.duration+' s';
    if($('play')){ $('play').dataset.playing=String(playing);$('play').setAttribute('aria-label',playing?'Pausar':'Reproducir');$('play').title=playing?'Pausar':'Reproducir'; }
    if($('loop'))$('loop').setAttribute('aria-pressed',String(looping));
  }
  function seek(ms){cancelAnimationFrame(frame);sound.stop();playing=false;playhead=Math.max(0,Math.min(total(),Number(ms)||0));const value=applyFrame();controls();return value;}
  function tick(now){if(!playing)return;playhead=Math.min(total(),now-startedAt);applyFrame();if(playhead>=total()){if(looping){replay();return;}playing=false;sound.stop();}controls();if(playing)frame=requestAnimationFrame(tick);}
  function playSound(){if(soundUnlocked&&params.get('render')!=='1')void sound.play(config,playhead/1000);}
  function replay(){cancelAnimationFrame(frame);sound.stop();playhead=0;playing=true;startedAt=performance.now();applyFrame();controls();playSound();frame=requestAnimationFrame(tick);}
  function userReplay(){soundUnlocked=true;replay();}
  function fit(){
    const space = document.querySelector('.fit-space');
    if (!space) return;

    const stage = space.parentElement;
    const padding = getComputedStyle(stage);
    const availableWidth = stage.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
    const availableHeight = stage.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const [width, height] = sizes[config.format];
    const factor = Math.min(availableWidth / width, availableHeight / height, 650 / height);
    space.style.width = width * factor + 'px';
    space.style.height = height * factor + 'px';
    space.style.aspectRatio = 'auto';
    space.style.setProperty('--preview-scale', factor);
  }
  function applyName(){
    const fontSize = 399.3424369747899;
    const center = 2203.2;
    const isCustom = config.name !== 'José C. Paz Sur';
    scene.classList.toggle('custom-name', isCustom);
    scene.style.setProperty('--local-name-scale', config.nameScale);
    const text = scene.querySelector('.local-custom');
    text.textContent = config.name;
    text.setAttribute('font-size', fontSize);
    text.setAttribute('x', center);
    if (isCustom && config.name) {
      // Fit long names inside the wordmark and keep room when the whole logo grows.
      const maxWidth = Math.min(4300, 5400 / (Math.max(1, config.scale) * config.nameScale));
      const {width} = text.getBBox();
      if (width > maxWidth) text.setAttribute('font-size', fontSize * maxWidth / width);
      const fitted = text.getBBox();
      text.setAttribute('x', center - (fitted.x + fitted.width / 2 - center));
    }
    scene.setAttribute('aria-label', 'Iglesia Adventista del Séptimo Día, ' + config.name);
  }
  function setConfig(patch={}){
    const retime=['duration','entrance','endMode','soundEnabled','name','soundType','motion'].some(k=>Object.hasOwn(patch,k));
    const previousMotion=scene.dataset.motion;
    if(Object.hasOwn(MOTIONS,patch.motion))config.motion=patch.motion;
    if(Object.hasOwn(window.ClosingSound.timbres,patch.soundType))config.soundType=patch.soundType;
    scene.dataset.motion=config.motion;
    if(previousMotion!==config.motion){void scene.offsetWidth;animations=scene.getAnimations({subtree:true});animations.forEach(a=>a.pause());}
    if(typeof patch.name==='string')config.name=patch.name.slice(0,80);
    for(const k of Object.keys(DEFAULTS))if(/^#[0-9a-f]{6}$/i.test(patch.colors?.[k]||''))config.colors[k]=patch.colors[k].toLowerCase();
    if(Number.isFinite(Number(patch.scale))&&Number(patch.scale)>=.6&&Number(patch.scale)<=1.25)config.scale=Number(patch.scale);
    const nameScale = Number(patch.nameScale);
    if (nameScale >= .5 && nameScale <= 1.5) config.nameScale = nameScale;
    if(Number.isInteger(Number(patch.duration))&&Number(patch.duration)>=3&&Number(patch.duration)<=30)config.duration=Number(patch.duration);
    if(Number.isFinite(Number(patch.entrance))&&Number(patch.entrance)>=.8&&Number(patch.entrance)<=4)config.entrance=Number(patch.entrance);
    if(typeof patch.soundEnabled==='boolean')config.soundEnabled=patch.soundEnabled;
    if(typeof patch.volume==='number'&&Number.isFinite(patch.volume)&&patch.volume>=0&&patch.volume<=1)config.volume=patch.volume;
    sound.setVolume(config.volume);
    if(['reverse','hold'].includes(patch.endMode))config.endMode=patch.endMode;if(sizes[patch.format])config.format=patch.format;
    for(const k of Object.keys(DEFAULTS)){scene.style.setProperty(variables[k],config.colors[k]);document.body.style.setProperty(variables[k],config.colors[k]);const input=document.querySelector(`[data-color="${k}"]`);if(input){input.value=config.colors[k];input.parentElement.querySelector('output').textContent=config.colors[k].toUpperCase();}}
    scene.style.setProperty('--logo-scale',config.scale);const [w,h]=sizes[config.format];scene.style.width=w+'px';scene.style.height=h+'px';
    const fields={'name-input':config.name,'logo-scale':Math.round(config.scale*100),'name-scale':Math.round(config.nameScale*100),'export-duration':config.duration,'entrance-duration':config.entrance,'end-mode':config.endMode,'export-format':config.format,'sound-type':config.soundType,'motion-style':config.motion};
    for(const [id,value] of Object.entries(fields))if($(id))$(id).value=value;
    if($('scale-value'))$('scale-value').textContent=Math.round(config.scale*100)+'%';if($('dimensions'))$('dimensions').textContent=w+' × '+h;
    if ($('name-scale')) {
      const percentage = fields['name-scale'] + '%';
      $('name-scale').setAttribute('aria-valuetext', percentage);
      $('name-scale-value').textContent = percentage;
    }
    if($('sound-enabled'))$('sound-enabled').checked=config.soundEnabled;
    if($('sound-volume')){$('sound-volume').value=Math.round(config.volume*100);$('sound-volume').disabled=!config.soundEnabled;}
    if($('volume-value'))$('volume-value').textContent=Math.round(config.volume*100)+'%';
    if($('listen'))$('listen').disabled=!config.soundEnabled||config.volume===0;
    if($('note-spacing'))$('note-spacing').textContent='Do · mi · sol · do, con '+(transition()/1000*.2).toFixed(2).replace('.',',')+' s entre notas.';
    const note=document.querySelector('.preview-note');if(note)note.textContent=MOTIONS[config.motion];
    applyName();playhead=Math.min(playhead,total());startedAt=performance.now()-playhead;applyFrame();controls();fit();
    if(retime){sound.stop();if(playing)playSound();}return getConfig();
  }
  function getConfig(){return {...config,colors:{...config.colors}};}
  if(params.get('render')==='1'){document.body.classList.add('render-frame');if(params.get('alpha')==='1')document.body.classList.add('render-transparent');}
  // One clock drives the paused CSS keyframes for both preview and export.
  animations=scene.getAnimations({subtree:true});animations.forEach(a=>{a.pause();a.currentTime=0;});
  const queryConfig={};for(const key of ['name','duration','entrance','scale','nameScale','endMode','format','soundType','motion'])if(params.has(key))queryConfig[key]=params.get(key);
  if(params.has('volume'))queryConfig.volume=Number(params.get('volume'));
  if(params.has('soundEnabled'))queryConfig.soundEnabled=params.get('soundEnabled')!=='false';
  queryConfig.colors=Object.fromEntries(Object.keys(DEFAULTS).filter(k=>params.has(k)).map(k=>[k,params.get(k)]));setConfig(queryConfig);
  const ready=document.fonts.load('399px NotoLocal').then(()=>document.fonts.ready).then(()=>{applyName();return true;});
  window.closingCard=Object.freeze({setConfig,getConfig,seek,replay,ready,get duration(){return total();}});
  $('name-input')?.addEventListener('input',e=>setConfig({name:e.target.value}));$('logo-scale')?.addEventListener('input',e=>setConfig({scale:Number(e.target.value)/100}));
  $('name-scale')?.addEventListener('input',e=>setConfig({nameScale:Number(e.target.value)/100}));
  document.querySelectorAll('[data-color]').forEach(input=>input.addEventListener('input',()=>setConfig({colors:{[input.dataset.color]:input.value}})));
  $('reset-colors')?.addEventListener('click',()=>setConfig({colors:DEFAULTS}));
  window.GraphicPalettes?.mount($('palette-control'), {
    read: () => {
      const {accent,background,denomination,local} = config.colors;
      return {accent,plate:background,headline:denomination,subtitle:local};
    },
    apply: ({accent,plate,headline,subtitle}) =>
      setConfig({colors:{accent,background:plate,denomination:headline,local:subtitle}}),
    manual: document.querySelectorAll('[data-color]'),
    reset: $('reset-colors')
  });
  for(const [id,key] of [['export-duration','duration'],['entrance-duration','entrance'],['end-mode','endMode']])$(id)?.addEventListener('change',e=>{if(e.target.reportValidity()){setConfig({[key]:e.target.value});replay();}});
  $('export-format')?.addEventListener('change',e=>setConfig({format:e.target.value}));
  $('listen')?.addEventListener('click',userReplay);
  $('sound-type')?.addEventListener('change',e=>{soundUnlocked=true;setConfig({soundType:e.target.value});replay();});
  $('motion-style')?.addEventListener('change',e=>{soundUnlocked=true;setConfig({motion:e.target.value});replay();});
  $('sound-enabled')?.addEventListener('change',e=>{soundUnlocked=true;setConfig({soundEnabled:e.target.checked});});
  $('sound-volume')?.addEventListener('input',e=>setConfig({volume:Number(e.target.value)/100}));
  function play(){if(playing)return;if(playhead>=total()){replay();return;}playing=true;startedAt=performance.now()-playhead;controls();playSound();frame=requestAnimationFrame(tick);}
  $('play')?.addEventListener('click',()=>{soundUnlocked=true;if(playing)seek(playhead);else play();});
  $('stop')?.addEventListener('click',()=>seek(0));
  $('to-start')?.addEventListener('click',()=>{const wasPlaying=playing;seek(0);if(wasPlaying)play();});
  $('loop')?.addEventListener('click',()=>{looping=!looping;controls();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)seek(playhead);});
  $('seek')?.addEventListener('input',e=>seek(e.target.value));window.addEventListener('resize',fit);
  if(document.querySelector('.preview-stage'))new ResizeObserver(fit).observe(document.querySelector('.preview-stage'));
  ready.then(()=>{if(params.get('render')==='1')seek(0);else if(matchMedia('(prefers-reduced-motion: reduce)').matches)seek(total()/2);else replay();});
})();
