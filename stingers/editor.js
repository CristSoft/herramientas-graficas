(() => {
'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const defaults={style:'liquid',format:'vertical',duration:2.8,accent:'#f7a813',base:'#17120b'};
let config={...defaults};try{const saved=JSON.parse(localStorage.getItem('jcp-transitions-v3'));if(saved&&['serious','liquid','flame'].includes(saved.style)&&['vertical','horizontal'].includes(saved.format)&&saved.duration>=1.2&&saved.duration<=6&&/^#[0-9a-f]{6}$/i.test(saved.accent)&&/^#[0-9a-f]{6}$/i.test(saved.base))config={...defaults,...saved}}catch{}
// Actualiza el valor de identidad anterior sin descartar colores personalizados.
if(config.base.toLowerCase()==='#15232c')config.base=defaults.base;
const scene=new TransitionScene($('#scene'),config);window.transitionEngine=scene;
let position=.5,playing=false,raf=0,startTime=0,startPosition=0;
const seconds=(n,d=2)=>n.toFixed(d).replace('.',',');
function draw(){scene.seek(position*config.duration*1000);$('#stage').classList.toggle('next',position>=.5);$('#scrub').value=Math.round(position*1000);$('#clock').textContent=`${seconds(position*config.duration)} / ${seconds(config.duration)} s`;}
function pause(){playing=false;cancelAnimationFrame(raf);$('#play').textContent='▶ Reproducir';}
function tick(now){if(!playing)return;position=Math.min(1,startPosition+(now-startTime)/(config.duration*1000));draw();if(position>=1){pause();return}raf=requestAnimationFrame(tick)}
function play(){if(playing){pause();return}if(position>=.999||position===.5)position=0;startPosition=position;startTime=performance.now();playing=true;$('#play').textContent='Ⅱ Pausar';raf=requestAnimationFrame(tick)}
function apply(){
 pause();scene.configure(config);$('#stage').style.setProperty('--preview-base',config.base);$('#stage').classList.toggle('vertical',config.format==='vertical');$('#stage').classList.toggle('horizontal',config.format==='horizontal');
 all('[data-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===config.style)));all('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===config.format)));
 for(const key of ['accent','base']){$('#'+key).value=config[key];$('#'+key+'-value').textContent=config[key].toUpperCase()}
 $('#duration').value=config.duration;$('#duration-value').textContent=seconds(config.duration,1)+' s';$('#dimensions').textContent=config.format==='vertical'?'1080 × 1920 px':'1920 × 1080 px';$('#preview-title').textContent={liquid:'Líquida · Redes',serious:'Barrido · Vivo',flame:'Flama viva'}[config.style];$('#identity-hint').textContent=config.style==='flame'?'La flama oficial, con movimiento de fuego vivo.':'Símbolo circular oficial, sin texto.';
 $('#cut-note').textContent=`Cambio de escena: ${seconds(config.duration/2)} s · fotograma ${Math.round(config.duration*30/2)} a 30 fps`;
 try{localStorage.setItem('jcp-transitions-v3',JSON.stringify(config))}catch{}draw();
}
$('#play').addEventListener('click',play);$('#restart').addEventListener('click',()=>{pause();position=0;draw()});$('#go-cut').addEventListener('click',()=>{pause();position=.5;draw()});$('#scrub').addEventListener('input',e=>{pause();position=Number(e.target.value)/1000;draw()});
all('[data-style]').forEach(b=>b.addEventListener('click',()=>{config.style=b.dataset.style;position=.5;apply()}));all('[data-format]').forEach(b=>b.addEventListener('click',()=>{config.format=b.dataset.format;apply()}));
for(const key of ['accent','base'])$('#'+key).addEventListener('input',e=>{config[key]=e.target.value;apply()});$('#reset-colors').addEventListener('click',()=>{config.accent=defaults.accent;config.base=defaults.base;apply()});$('#duration').addEventListener('input',e=>{config.duration=Number(e.target.value);apply()});$('#preview-bg').addEventListener('change',e=>{const stage=$('#stage');stage.classList.toggle('checker',e.target.value==='checker');stage.classList.toggle('brand-background',e.target.value==='brand')});
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
