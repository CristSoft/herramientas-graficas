/* Reloj único y determinista: la vista previa y el MOV dibujan la misma escena. */
(() => {
'use strict';
const NS='http://www.w3.org/2000/svg';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const interval=(p,a,b)=>smooth((p-a)/(b-a));
const attr=(el,key,value)=>el.setAttribute(key,String(value));
const PI=Math.PI;
const BLADE_COUNT=8;
const rectangle=(x,y,w,h)=>`M${x} ${y}h${w}v${h}h${-w}Z`;
const polygon=points=>`M${points.map(point=>point.join(' ')).join('L')}Z`;
const LOCAL_NAME='José C. Paz Sur';
const CIRCLE_VIEW_BOX='0 0 169.877 169.877';
const identitySources={
 isotipo:new URL('../lower/isotipo-iglesia.svg',document.currentScript.src),
 full:new URL('../cierre/Logo-JCP-Sur-Vertical.svg',document.currentScript.src)
};
const identityCache=new Map();
function loadIdentity(type){
 if(!identityCache.has(type)){
  const loading=fetch(identitySources[type]).then(async response=>{
   if(!response.ok)throw new Error('No se pudo cargar la marca adventista.');
   const svg=new DOMParser().parseFromString(await response.text(),'image/svg+xml').documentElement;
   const artwork=Array.from(svg.children).find(element=>element.localName==='g');
   if(!artwork||!svg.hasAttribute('viewBox'))throw new Error('No se pudo leer la marca adventista.');
   return {viewBox:svg.getAttribute('viewBox'),artwork};
  }).catch(error=>{identityCache.delete(type);throw error;});
  identityCache.set(type,loading);
 }
 return identityCache.get(type);
}
async function addLocalName(artwork,name){
 const size=399.3424;
 await document.fonts.load(size+'px NotoLocal');
 const context=document.createElement('canvas').getContext('2d');
 context.font=size+'px NotoLocal';
 const width=context.measureText(name).width;
 const text=document.createElementNS(NS,'text');
 attr(text,'x',2203.21);attr(text,'y',3195.16);attr(text,'text-anchor','middle');
 attr(text,'font-family','NotoLocal, Arial, sans-serif');
 attr(text,'font-size',width>4300?size*4300/width:size);
 text.textContent=name;
 artwork.querySelector('#nombre-local').replaceWith(text);
}
function spline(points){
 let d=`M${points[0][0]},${points[0][1]}`;
 const n=points.length;
 for(let i=0;i<n;i++){
  const a=points[(i-1+n)%n],b=points[i],c=points[(i+1)%n],e=points[(i+2)%n];
  d+=`C${b[0]+(c[0]-a[0])/6},${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6},${c[1]-(e[1]-b[1])/6} ${c[0]},${c[1]}`;
 }
 return d+'Z';
}
function blob(cx,cy,r,p,phase,stretch=1){
 if(r<.01)return 'M0 0Z';
 const pts=[]; const turn=p*PI*1.45+phase;
 for(let i=0;i<28;i++){
  const a=i/28*2*PI;
  const wave=1+.15*Math.sin(3*a+turn)+.075*Math.sin(5*a-turn*.7)+.035*Math.sin(2*a+turn*1.2);
  const x=Math.cos(a)*r*wave*stretch,y=Math.sin(a)*r*wave/stretch;
  const rot=-.42+Math.sin(p*PI*2)*.24;
  pts.push([+(cx+x*Math.cos(rot)-y*Math.sin(rot)).toFixed(2),+(cy+x*Math.sin(rot)+y*Math.cos(rot)).toFixed(2)]);
 }
 return spline(pts);
}
class TransitionScene{
 constructor(container,config={}){
  this.config={style:'liquid',format:'vertical',duration:2.8,accent:'#f7a813',base:'#17120b',identity:'circular',localName:LOCAL_NAME,...config};
  this.svg=document.createElementNS(NS,'svg');this.svg.classList.add('transition-svg');
  this.svg.setAttribute('aria-hidden','true');
  this.svg.innerHTML=`<defs>
   <filter id="cohesion" x="-200%" y="-200%" width="500%" height="500%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="7"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10"/></filter>
   <filter id="melt" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".009 .016" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>
   ${window.JCPFlame.defs}
   <clipPath id="sweep-clip"><path id="sweep-mask"/></clipPath>
   <clipPath id="iris-clip"><path id="iris-mask" clip-rule="evenodd"/></clipPath>
   <clipPath id="weave-clip"><path id="weave-mask"/></clipPath>
   <symbol id="stinger-identity" viewBox="${CIRCLE_VIEW_BOX}"><path fill-rule="evenodd" d="${window.JCPSymbolPath}"/></symbol>
  </defs>
  <g id="serious" clip-path="url(#sweep-clip)"><rect id="solid"/><g id="lines" fill="none" stroke-width="1.6" opacity=".28"><circle id="ring-one"/><circle id="ring-two"/><path id="diagonal"/></g><g id="serious-icon"><circle r="85"/><use href="#stinger-identity"/></g></g>
  <g id="fluid"><g id="amber-group" filter="url(#cohesion)"><path id="amber-blob"/>${Array.from({length:7},(_,i)=>`<ellipse id="drop-${i}"/>`).join('')}</g><g id="navy-group" filter="url(#cohesion)"><path id="navy-blob"/></g><g id="fluid-icon" filter="url(#melt)"><circle r="85"/><use href="#stinger-identity"/></g></g><g id="flame">${window.JCPFlame.markup}<g id="flame-identity"><use href="#stinger-identity"/></g></g>
  <g id="iris" clip-path="url(#iris-clip)">
   <rect id="iris-base"/>
   <g id="iris-blades">${Array.from({length:BLADE_COUNT},(_,i)=>`<path id="iris-blade-${i}" fill-opacity="${i%2 ? '.045' : '.012'}" stroke-width="2" stroke-opacity=".5"/>`).join('')}</g>
   <path id="iris-edge" fill="none" stroke-width="14"/>
  </g>
  <g id="weave" clip-path="url(#weave-clip)">
   <rect id="weave-base"/>
   <path id="weave-grid" fill="none" stroke-width="2" opacity=".26"/>
   <path id="weave-pattern" opacity=".18"/>
   <path id="weave-edges"/>
  </g>
  <g id="geometric-identity"><use href="#stinger-identity"/></g>`;
  container.replaceChildren(this.svg);
  this.el=id=>this.svg.querySelector('#'+id); this.configure(this.config);
 }
 configure(config){
  this.config={...this.config,...config};
  const c=this.config;[this.w,this.h]=c.format==='vertical'?[1080,1920]:[1920,1080];
  this.unit=Math.min(this.w,this.h);this.diag=Math.hypot(this.w,this.h);
  attr(this.svg,'viewBox',`0 0 ${this.w} ${this.h}`);
  if(c.style==='orbit'&&!this.el('orbit')){
   this.svg.querySelector('defs').insertAdjacentHTML('beforeend',window.JCPOrbit.defs);
   this.svg.insertAdjacentHTML('beforeend',window.JCPOrbit.markup);
  }
  const goo=this.el('cohesion');attr(goo,'filterUnits','userSpaceOnUse');attr(goo,'x',-60);attr(goo,'y',-60);attr(goo,'width',this.w+120);attr(goo,'height',this.h+120);
  for(const id of ['solid','iris-base','weave-base']){
   attr(this.el(id),'width',this.w);attr(this.el(id),'height',this.h);attr(this.el(id),'fill',c.base);
  }
  attr(this.el('amber-group'),'fill',c.accent);attr(this.el('navy-group'),'fill',c.base);attr(this.el('lines'),'stroke',c.accent);
  this.configureIdentity();
  attr(this.el('ring-one'),'cx',-this.w*.07);attr(this.el('ring-one'),'cy',-this.h*.2);attr(this.el('ring-one'),'r',this.unit*.64);
  attr(this.el('ring-two'),'cx',this.w*1.1);attr(this.el('ring-two'),'cy',this.h*1.1);attr(this.el('ring-two'),'r',this.unit*.72);
  attr(this.el('diagonal'),'d',`M${this.w*.92},${-this.h*.2} L${this.w*.76},${this.h*1.2}`);
  const groups={serious:'serious',liquid:'fluid',flame:'flame',iris:'iris',weave:'weave',orbit:'orbit'};
  const active=Object.hasOwn(groups,c.style)?groups[c.style]:groups.liquid;
  for(const id of Object.values(groups)){
   const group=this.el(id);
   if(group)group.style.display=id===active?'':'none';
  }
  this.el('geometric-identity').style.display=['iris','weave'].includes(c.style)?'':'none';
  window.JCPFlame.configure(this);
  if(c.style==='iris'){
   attr(this.el('iris-blades'),'fill',c.accent);attr(this.el('iris-blades'),'stroke',c.accent);
   attr(this.el('iris-edge'),'stroke',c.accent);
  }
  if(c.style==='weave')this.configureWeave();
  if(c.style==='orbit'){
   window.JCPOrbit.configure(this);
   window.JCPOrbit.setLogoViewBox(this,this.el('stinger-identity').getAttribute('viewBox'));
  }
  return this.seek(this.time??c.duration*500);
 }
 getConfig(){return {...this.config}}
 seek(ms){
  this.time=clamp(Number(ms)||0,0,this.config.duration*1000);const p=this.time/(this.config.duration*1000);
  if(p<=0||p>=1){this.svg.style.visibility='hidden';return 'empty'}this.svg.style.visibility='visible';
  switch(this.config.style){
   case 'serious': this.serious(p); break;
   case 'flame': {
    window.JCPFlame.draw(this,p);
    const markOpacity=this.centerIdentity('flame-identity',p);
    const emblem=this.el('fire-emblem');
    attr(emblem,'opacity',Number(emblem.getAttribute('opacity'))*(1-markOpacity));
    break;
   }
   case 'iris': this.iris(p); this.centerIdentity('geometric-identity',p); break;
   case 'weave': this.weave(p); this.centerIdentity('geometric-identity',p); break;
   case 'orbit': window.JCPOrbit.draw(this,p); break;
   default: this.liquid(p);
  }
  return !['flame','orbit'].includes(this.config.style)&&p>=.45&&p<=.56?'hold':p.toFixed(6);
 }
 configureIdentity(){
  const {identity,accent,base}=this.config;
  const name=String(this.config.localName??'').trim().slice(0,80)||LOCAL_NAME;
  const type=Object.hasOwn(identitySources,identity)?identity:'circular';
  const size=type==='full'?280:170;
  for(const id of ['serious-icon','fluid-icon','geometric-identity','flame-identity','orbit-identity']){
   const holder=this.el(id);
   if(!holder)continue;
   for(const mark of holder.querySelectorAll('use')){
    attr(mark,'x',-size/2);attr(mark,'y',-size/2);
    attr(mark,'width',size);attr(mark,'height',size);
    if(id!=='orbit-identity')attr(mark,'fill',accent);
   }
   const backing=holder.querySelector('circle');
   if(backing){attr(backing,'fill',base);backing.style.display=type==='circular'?'':'none';}
  }
  if(this.identityType===type&&(type!=='full'||this.identityName===name))return;
  this.identityType=type;
  this.identityName=name;
  const symbol=this.el('stinger-identity');
  if(type==='circular'){
   const path=document.createElementNS(NS,'path');
   attr(path,'fill-rule','evenodd');attr(path,'d',window.JCPSymbolPath);
   symbol.replaceChildren(path);attr(symbol,'viewBox',CIRCLE_VIEW_BOX);
   this.identityReady=Promise.resolve();
   return;
  }
  symbol.replaceChildren();
  const pending=loadIdentity(type).then(async ({viewBox,artwork})=>{
   const copy=document.importNode(artwork,true);
   copy.removeAttribute('fill');
   if(type==='full'&&name!==LOCAL_NAME)await addLocalName(copy,name);
   if(this.identityReady!==pending)return;
   attr(symbol,'viewBox',viewBox);
   symbol.replaceChildren(copy);
   if(this.el('orbit'))window.JCPOrbit.setLogoViewBox(this,viewBox);
  }).catch(error=>{
   if(this.identityReady===pending)this.identityType=null;
   throw error;
  });
  this.identityReady=pending;
 }
 centerIdentity(id,p){
  const enter=interval(p,.345,.445),exit=interval(p,.56,.67);
  const scale=this.unit*.20/85*mix(.88,1,enter);
  const mark=this.el(id);
  const opacity=enter*(1-exit);
  attr(mark,'opacity',opacity);
  attr(mark,'transform',`translate(${this.w/2} ${this.h/2}) scale(${scale})`);
  return opacity;
 }
 serious(p){
  const w=this.w,h=this.h;let left,right;
  if(p<.4){const e=interval(p,.015,.4);left=-w*.45;right=mix(-w*.2,w*1.3,e)}
  else if(p<=.6){left=-w*.45;right=w*1.3}
  else{const e=interval(p,.6,.985);left=mix(-w*.45,w*1.3,e);right=w*1.8}
  attr(this.el('sweep-mask'),'d',`M${left} 0 H${right} L${right-w*.2} ${h} H${left-w*.2}Z`);
  const a=interval(p,.26,.4)*(1-interval(p,.6,.73));
  attr(this.el('serious-icon'),'opacity',a);
  const s=this.unit*.19/85;attr(this.el('serious-icon'),'transform',`translate(${w/2} ${h/2+mix(18,0,interval(p,.25,.4))}) scale(${s})`);
 }
 iris(p){
  const close=interval(p,.035,.43),open=interval(p,.57,.965);
  const radius=this.diag*.57*(1-close+open);
  const turn=(close+open)*.63-.35;
  const points=(r,offset)=>Array.from({length:BLADE_COUNT},(_,i)=>{
   const angle=turn+offset+i*2*PI/BLADE_COUNT;
   return [this.w/2+r*Math.cos(angle),this.h/2+r*Math.sin(angle)];
  });
  const inner=points(radius,0),outer=points(this.diag,.62);
  const opening=radius>0?polygon(inner):'';
  attr(this.el('iris-mask'),'d',rectangle(0,0,this.w,this.h)+opening);
  attr(this.el('iris-edge'),'d',opening);
  for(let i=0;i<BLADE_COUNT;i++){
   const next=(i+1)%BLADE_COUNT;
   attr(this.el('iris-blade-'+i),'d',polygon([inner[i],outer[i],outer[next],inner[next]]));
  }
 }
 configureWeave(){
  const portrait=this.config.format==='vertical';
  this.weaveRows=portrait?7:4;
  this.weaveColumns=portrait?4:7;
  const cellWidth=this.w/this.weaveColumns,cellHeight=this.h/this.weaveRows;
  let pattern='',grid='';
  for(let row=0;row<this.weaveRows;row++){
   const y=row*cellHeight;
   if(row)grid+=`M0 ${y}H${this.w}`;
   for(let column=0;column<this.weaveColumns;column++){
    const x=column*cellWidth;
    if(!row&&column)grid+=`M${x} 0V${this.h}`;
    pattern+=(row+column)%2
     ?rectangle(x+cellWidth*.43,y+cellHeight*.13,cellWidth*.14,cellHeight*.74)
     :rectangle(x+cellWidth*.13,y+cellHeight*.43,cellWidth*.74,cellHeight*.14);
   }
  }
  attr(this.el('weave-grid'),'d',grid);attr(this.el('weave-grid'),'stroke',this.config.accent);
  attr(this.el('weave-pattern'),'d',pattern);attr(this.el('weave-pattern'),'fill',this.config.accent);
  attr(this.el('weave-edges'),'fill',this.config.accent);
 }
 weave(p){
  let mask='',edges='';
  if(p>=.43&&p<=.57){
   mask=rectangle(0,0,this.w,this.h);
  }else{
   const entering=p<.43;
   const count=entering?this.weaveRows:this.weaveColumns;
   const length=entering?this.w:this.h;
   const breadth=(entering?this.h:this.w)/count;
   // Alternate the direction of each strip. Rotate the movement a quarter turn on exit.
   const strip=(along,across,span)=>entering
    ?rectangle(along,across,span,breadth+1)
    :rectangle(across,along,breadth+1,span);
   for(let i=0;i<count;i++){
    const delay=Math.abs(i-(count-1)/2)*.023;
    const progress=entering?interval(p,.045+delay,.35+delay):1-interval(p,.58+delay,.92+delay);
    const span=progress*length;
    if(!span)continue;
    const forward=i%2===0;
    const from=forward?0:length-span;
    const accent=Math.min(span,this.unit*.022*Math.sin(progress*PI));
    mask+=strip(from,i*breadth,span);
    if(accent>0)edges+=strip(forward?span-accent:from,i*breadth,accent);
   }
  }
  attr(this.el('weave-mask'),'d',mask);
  attr(this.el('weave-edges'),'d',edges);
 }
 liquid(p){
  const w=this.w,h=this.h,u=this.unit,diag=this.diag;
  let rg=0,cx=w/2,cy=h/2,stretch=1;
  if(p<.2){let e=interval(p,.035,.2);rg=mix(0,u*.16,e);cx=mix(w*.24,w*.5,e);cy=mix(h*.72,h*.5,e);stretch=mix(.46,1,e)}
  else if(p<.38){const e=interval(p,.2,.38);rg=mix(u*.16,diag*1.45,e);stretch=mix(1.18,1,e)}
  else if(p<.62){rg=diag*1.45}
  else{const e=interval(p,.62,1);rg=mix(diag*1.45,0,e);cx=mix(w*.5,w*1.05,e);cy=mix(h*.5,-h*.12,e);stretch=mix(1,1.65,e)}
  attr(this.el('amber-blob'),'d',blob(cx,cy,rg,p,.4,stretch));
  let rd=p<.38?mix(0,diag*1.45,interval(p,.235,.38)):p<.62?diag*1.45:mix(diag*1.45,0,interval(p,.62,.87));
  const nd=interval(p,.62,.87);attr(this.el('navy-blob'),'d',blob(w/2+nd*w*.3,h/2-nd*h*.25,rd,p,2.1,1-.25*Math.sin(p*PI)));
  // Las gotas se unen a la masa cuando se aproxima: el filtro suaviza los cuellos.
  for(let i=0;i<7;i++){
   const a=i/7*PI*2+.3;const enter=interval(p,.075,.24),leave=interval(p,.68,.99);
   const visible=p<.5?Math.sin(enter*PI):Math.sin(leave*PI);
   const spread=u*(p<.5?.22+enter*.23:.14+leave*.6);
   const r=u*(.014+(i%3)*.007)*Math.max(0,visible);
   const el=this.el('drop-'+i);
   attr(el,'cx',w/2+Math.cos(a)*spread+(p<.5?-u*.13*(1-enter):w*.32*leave));
   attr(el,'cy',h/2+Math.sin(a)*spread+(p<.5?u*.18*(1-enter):-h*.36*leave));
   attr(el,'rx',r*(1+.35*Math.sin(p*12+i)));attr(el,'ry',r*(1.2+.3*Math.cos(p*10+i)));
  }
  let alpha,sx=1,sy=1,rot=0,x=w/2,y=h/2,r=u*.17,dist=0;
  if(p<.31){const settle=interval(p,.025,.17);alpha=interval(p,.02,.085)*(1-interval(p,.21,.3));x=mix(w*.24,w*.5,settle);y=mix(h*.72,h*.5,settle);const tension=Math.sin(interval(p,.06,.27)*PI);sx=1+.24*tension;sy=1-.16*tension;rot=mix(-24,0,settle)+Math.sin(p*18)*7*(1-settle);r*=mix(.12,1,settle);dist=38*tension}
  else if(p<.62){alpha=interval(p,.385,.445);r*=mix(.88,1,interval(p,.385,.445));}
  else{const e=interval(p,.62,.84);alpha=1-interval(p,.63,.81);sx=1-.5*e;sy=1+.9*e;rot=-25*e;x+=w*.32*e;y-=h*.28*e;r*=1-.55*e;dist=60*e}
  attr(this.el('fluid-icon'),'opacity',alpha);attr(this.svg.querySelector('feDisplacementMap'),'scale',dist);
  attr(this.el('fluid-icon'),'transform',`translate(${x} ${y}) rotate(${rot}) scale(${r/85*sx} ${r/85*sy})`);
 }
}
window.TransitionScene=TransitionScene;
})();
