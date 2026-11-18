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
  this.config={style:'liquid',format:'vertical',duration:2.8,accent:'#f7a813',base:'#17120b',...config};
  this.svg=document.createElementNS(NS,'svg');this.svg.classList.add('transition-svg');
  this.svg.setAttribute('aria-hidden','true');
  this.svg.innerHTML=`<defs>
   <filter id="cohesion" x="-200%" y="-200%" width="500%" height="500%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="7"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10"/></filter>
   <filter id="melt" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".009 .016" numOctaves="2" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>
   ${window.JCPFlame.defs}
   <clipPath id="sweep-clip"><path id="sweep-mask"/></clipPath>
   <symbol id="official-symbol" viewBox="0 0 169.877 169.877"><path fill-rule="evenodd" d="${window.JCPSymbolPath}"/></symbol>
  </defs>
  <g id="serious" clip-path="url(#sweep-clip)"><rect id="solid"/><g id="lines" fill="none" stroke-width="1.6" opacity=".28"><circle id="ring-one"/><circle id="ring-two"/><path id="diagonal"/></g><g id="serious-icon"><circle r="85"/><use href="#official-symbol" x="-85" y="-85" width="170" height="170"/></g></g>
  <g id="fluid"><g id="amber-group" filter="url(#cohesion)"><path id="amber-blob"/>${Array.from({length:7},(_,i)=>`<ellipse id="drop-${i}"/>`).join('')}</g><g id="navy-group" filter="url(#cohesion)"><path id="navy-blob"/></g><g id="fluid-icon" filter="url(#melt)"><circle r="85"/><use href="#official-symbol" x="-85" y="-85" width="170" height="170"/></g></g><g id="flame">${window.JCPFlame.markup}</g>`;
  container.replaceChildren(this.svg);
  this.el=id=>this.svg.querySelector('#'+id); this.configure(this.config);
 }
 configure(config){
  this.config={...this.config,...config};
  const c=this.config;[this.w,this.h]=c.format==='vertical'?[1080,1920]:[1920,1080];
  this.unit=Math.min(this.w,this.h);this.diag=Math.hypot(this.w,this.h);
  attr(this.svg,'viewBox',`0 0 ${this.w} ${this.h}`);
  const goo=this.el('cohesion');attr(goo,'filterUnits','userSpaceOnUse');attr(goo,'x',-60);attr(goo,'y',-60);attr(goo,'width',this.w+120);attr(goo,'height',this.h+120);
  attr(this.el('solid'),'width',this.w);attr(this.el('solid'),'height',this.h);attr(this.el('solid'),'fill',c.base);
  attr(this.el('amber-group'),'fill',c.accent);attr(this.el('navy-group'),'fill',c.base);attr(this.el('lines'),'stroke',c.accent);
  for(const id of ['serious-icon','fluid-icon']){attr(this.el(id).querySelector('circle'),'fill',c.base);attr(this.el(id).querySelector('use'),'fill',c.accent)}
  attr(this.el('ring-one'),'cx',-this.w*.07);attr(this.el('ring-one'),'cy',-this.h*.2);attr(this.el('ring-one'),'r',this.unit*.64);
  attr(this.el('ring-two'),'cx',this.w*1.1);attr(this.el('ring-two'),'cy',this.h*1.1);attr(this.el('ring-two'),'r',this.unit*.72);
  attr(this.el('diagonal'),'d',`M${this.w*.92},${-this.h*.2} L${this.w*.76},${this.h*1.2}`);
  this.el('serious').style.display=c.style==='serious'?'':'none';this.el('fluid').style.display=c.style==='liquid'?'':'none';this.el('flame').style.display=c.style==='flame'?'':'none';window.JCPFlame.configure(this);
  return this.seek(this.time??c.duration*500);
 }
 getConfig(){return {...this.config}}
 seek(ms){
  this.time=clamp(Number(ms)||0,0,this.config.duration*1000);const p=this.time/(this.config.duration*1000);
  if(p<=0||p>=1){this.svg.style.visibility='hidden';return 'empty'}this.svg.style.visibility='visible';
  if(this.config.style==='serious')this.serious(p);else if(this.config.style==='flame')window.JCPFlame.draw(this,p);else this.liquid(p);
  return this.config.style!=='flame'&&p>=.45&&p<=.56?'hold':p.toFixed(6);
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
