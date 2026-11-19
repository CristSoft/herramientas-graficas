(() => {
'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const styleButtons = all('[data-style]');
const styleNames = new Map(styleButtons.map(button => [button.dataset.style, button.querySelector('strong').textContent]));
styleNames.set('flame', 'Flama viva');
const identitySelect = $('#identity-choice');
const identityStatus = $('#identity-status');
const nameInput = $('#local-name');
const defaults={style:'liquid',format:'vertical',duration:2.8,accent:'#f7a813',base:'#17120b',identity:'circular',localName:nameInput.value};
const styleColors = style => style === 'orbit' ? window.JCPOrbit.colors : defaults;
let config={...defaults};try{const saved=JSON.parse(localStorage.getItem('jcp-transitions-v3'));if(saved&&styleNames.has(saved.style)&&['vertical','horizontal'].includes(saved.format)&&saved.duration>=1.2&&saved.duration<=6&&/^#[0-9a-f]{6}$/i.test(saved.accent)&&/^#[0-9a-f]{6}$/i.test(saved.base))config={...defaults,...saved}}catch{}
if (!Array.from(identitySelect.options).some(option => option.value === config.identity)) config.identity = defaults.identity;
config.localName = typeof config.localName === 'string' ? config.localName.slice(0,80) : defaults.localName;
// Actualiza el valor de identidad anterior sin descartar colores personalizados.
if(config.base.toLowerCase()==='#15232c')config.base=defaults.base;
const scene=new TransitionScene($('#scene'),config);window.transitionEngine=scene;
const stage = $('#stage');
const playButton = $('#play');
const loopButton = $('#loop');
let position = 0, playing = false, looping = false, raf = 0, startedAt = 0;
const seconds=(n,d=2)=>n.toFixed(d).replace('.',',');
function draw(){scene.seek(position*config.duration*1000);stage.classList.toggle('next',position>=.5);$('#scrub').value=Math.round(position*1000);$('#clock').textContent=`${seconds(position*config.duration)} / ${seconds(config.duration)} s`;}
function updatePlayButton() {
  const label = playing ? 'Pausar' : 'Reproducir';
  playButton.dataset.playing = String(playing);
  playButton.setAttribute('aria-label', label);
  playButton.title = label;
}
function pause() {
  playing = false;
  cancelAnimationFrame(raf);
  updatePlayButton();
}
function seek(nextPosition) {
  pause();
  position = nextPosition;
  draw();
}
function tick(now) {
  if (!playing) return;
  const progress = Math.max(0, now - startedAt) / (config.duration * 1000);
  if (progress >= 1 && !looping) {
    seek(1);
    return;
  }
  position = progress % 1;
  draw();
  raf = requestAnimationFrame(tick);
}
function play() {
  if (position >= 1) {
    position = 0;
    draw();
  }
  startedAt = performance.now() - position * config.duration * 1000;
  playing = true;
  updatePlayButton();
  raf = requestAnimationFrame(tick);
}
function apply(){
 pause();scene.configure(config);stage.classList.toggle('vertical',config.format==='vertical');stage.classList.toggle('horizontal',config.format==='horizontal');
 styleButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===config.style)));all('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===config.format)));
 for(const key of ['accent','base']){$('#'+key).value=config[key];$('#'+key+'-value').textContent=config[key].toUpperCase()}
 $('#duration').value=config.duration;$('#duration-value').textContent=seconds(config.duration,1)+' s';$('#dimensions').textContent=config.format==='vertical'?'1080 × 1920 px':'1920 × 1080 px';
 $('#preview-title').textContent=styleNames.get(config.style);
 identitySelect.value = config.identity;
 nameInput.value = config.localName;
 $('#local-name-setting').hidden = config.identity !== 'full';
 identityStatus.hidden = true;
 const pending = scene.identityReady;
 pending.catch(() => {
  if (scene.identityReady !== pending) return;
  identityStatus.textContent = 'No se pudo cargar el logotipo. Volvé a seleccionarlo para reintentar.';
  identityStatus.hidden = false;
 });
 $('#cut-note').textContent=`Cambio de escena: ${seconds(config.duration/2)} s · fotograma ${Math.round(config.duration*30/2)} a 30 fps`;
 try{localStorage.setItem('jcp-transitions-v3',JSON.stringify(config))}catch{}draw();
}
playButton.addEventListener('click', () => { if (playing) pause(); else play(); });
$('#to-start').addEventListener('click', () => {
  const wasPlaying = playing;
  seek(0);
  if (wasPlaying) play();
});
$('#stop').addEventListener('click', () => seek(0));
loopButton.addEventListener('click', () => {
  looping = !looping;
  loopButton.setAttribute('aria-pressed', String(looping));
});
$('#go-cut').addEventListener('click', () => seek(.5));
$('#scrub').addEventListener('input', e => seek(Number(e.target.value) / 1000));
styleButtons.forEach(button => button.addEventListener('click', () => {
  const previous = styleColors(config.style);
  const next = styleColors(button.dataset.style);
  for (const key of ['accent', 'base']) {
    if (config[key].toLowerCase() === previous[key]) config[key] = next[key];
  }
  config.style = button.dataset.style;
  position = .5;
  apply();
}));
all('[data-format]').forEach(b=>b.addEventListener('click',()=>{config.format=b.dataset.format;apply()}));
identitySelect.addEventListener('change', () => { config.identity = identitySelect.value; position = .5; apply(); });
nameInput.addEventListener('input', () => { config.localName = nameInput.value; apply(); });
for(const key of ['accent','base'])$('#'+key).addEventListener('input',e=>{config[key]=e.target.value;apply()});
$('#reset-colors').addEventListener('click',()=>{
  const {accent,base}=styleColors(config.style);
  Object.assign(config,{accent,base});
  apply();
});
$('#duration').addEventListener('input',e=>{config.duration=Number(e.target.value);apply()});
const backgroundSelect = $('#preview-bg');
function updatePreviewBackground() {
  stage.classList.toggle('checker', backgroundSelect.value === 'checker');
}
backgroundSelect.addEventListener('change', updatePreviewBackground);
updatePreviewBackground();
window.GraphicPalettes?.mount($('#palette-control'), {
  read: () => ({accent:config.accent,plate:config.base}),
  apply: ({accent,plate}) => {config.accent=accent;config.base=plate;apply();},
  manual: [$('#accent'),$('#base')],
  reset: $('#reset-colors')
});
let exportController, downloadURL;
$('#render').addEventListener('click',async()=>{
 const feedback=$('#render-feedback'),status=$('#render-status'),progress=$('#render-progress'),link=$('#download'),button=$('#render');
 feedback.hidden=false;feedback.classList.remove('error');link.hidden=true;progress.value=0;button.disabled=true;button.textContent='Generando…';
 if(downloadURL)URL.revokeObjectURL(downloadURL);exportController=new AbortController();
 try{const result=await BrowserExporter.render('stingers',{...config,colors:{background:config.base},container:'mov'},(value,message)=>{progress.value=value;status.textContent=message},exportController.signal);downloadURL=URL.createObjectURL(result.blob);link.href=downloadURL;link.download=result.filename;link.textContent='Descargar MOV transparente';link.hidden=false;status.textContent='Listo · cambio de escena a '+seconds(config.duration/2)+' s';}
 catch(e){feedback.classList.add('error');status.textContent=e.message||'No se pudo generar el video.'}finally{button.disabled=false;button.textContent='Renderizar MOV'}
});

apply();
if(location.protocol!=='file:'){try{const id=sessionStorage.getItem('jcp-render-job');if(id){$('#render').disabled=true;follow(id).catch(e=>{$('#render-feedback').classList.add('error');$('#render-status').textContent=e.message}).finally(()=>{$('#render').disabled=false})}}catch{}}
})();
