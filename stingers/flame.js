/* Flama viva: curvas oficiales, cintas de fuego y retirada de la base. */
(() => {
'use strict';
const PI=Math.PI,TAU=2*PI;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const phase=(p,a,b)=>ease((p-a)/(b-a));
const set=(el,key,value)=>el.setAttribute(key,String(value));
const f=n=>Number(n.toFixed(2));
function smoothPath(points){
 if(points.length<3)return 'M0 0Z';
 let d=`M${points[0].map(f).join(',')}`;const n=points.length;
 for(let i=0;i<n;i++){
  const a=points[(i-1+n)%n],b=points[i],c=points[(i+1)%n],e=points[(i+2)%n];
  d+=`C${f(b[0]+(c[0]-a[0])/6)},${f(b[1]+(c[1]-a[1])/6)} ${f(c[0]-(e[0]-b[0])/6)},${f(c[1]-(e[1]-b[1])/6)} ${c.map(f).join(',')}`;
 }
 return d+'Z';
}
function curtain(w,h,top,bottom,p,offset=0){
 const points=[],pad=w*.2,amp=Math.min(w,h)*.065;
 for(let i=0;i<=28;i++){
  const x=-pad+(w+2*pad)*i/28;
  const ripple=amp*(Math.sin(x/w*TAU*1.8-p*19)+.38*Math.sin(x/w*TAU*4+p*23));
  points.push([x,top+ripple-offset]);
 }
 for(let i=28;i>=0;i--){
  const x=-pad+(w+2*pad)*i/28;
  const ripple=amp*(Math.sin(x/w*TAU*1.4+p*21)+.32*Math.cos(x/w*TAU*3.8-p*27));
  points.push([x,bottom+ripple+offset]);
 }
 return smoothPath(points);
}
// Una cinta afilada que gira alrededor de una columna ascendente.
function fireRibbon({cx,base,rise,spread,width,turn,seed,extinction}){
 const center=[],left=[],right=[],count=52;
 for(let i=0;i<=count;i++){
  const s=i/count,a=s*TAU*(.69+seed*.025)-turn+seed*1.9;
  const orbit=Math.sin(PI*s)**.75;
  const x=cx+spread*orbit*Math.sin(a)+spread*.17*s*s;
  const y=base-rise*s+spread*.37*orbit*Math.cos(a);
  center.push([x,y]);
 }
 for(let i=0;i<=count;i++){
  const s=i/count,a=center[Math.max(0,i-1)],b=center[Math.min(count,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
  // Se retira primero el combustible de la raíz; la parte alta conserva volumen.
  const root=Math.pow(s,.24+extinction*3.6);
  const tip=Math.pow(Math.max(0,1-s),.58);
  const puff=1+extinction*.95*Math.exp(-Math.pow((s-.7)/.23,2));
  const thickness=width*root*tip*puff*(.87+.13*Math.sin(s*15-turn));
  const nx=-dy/len*thickness,ny=dx/len*thickness;
  left.push([center[i][0]+nx,center[i][1]+ny]);right.push([center[i][0]-nx,center[i][1]-ny]);
 }
 return smoothPath([...left,...right.reverse()]);
}
window.JCPFlame={
 defs:`<filter id="fire-heat" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".006 .014" numOctaves="2" seed="11" result="heat"/><feDisplacementMap in="SourceGraphic" in2="heat" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter><symbol id="official-flame" viewBox="44 12 82 116">${window.JCPFlamePaths.map(d=>`<path d="${d}"/>`).join('')}</symbol>`,
 markup:`<g id="fire-curtains"><path id="fire-amber-sheet"/><path id="fire-dark-sheet"/></g><g id="fire-vortex">${Array.from({length:6},(_,i)=>`<path id="fire-ribbon-${i}"/>`).join('')}</g><g id="fire-emblem" filter="url(#fire-heat)"><use href="#official-flame" x="-41" y="-58" width="82" height="116"/></g><g id="fire-sparks">${Array.from({length:10},(_,i)=>`<path id="fire-spark-${i}"/>`).join('')}</g>`,
 configure(scene){
  const c=scene.config;
  set(scene.el('fire-amber-sheet'),'fill',c.accent);set(scene.el('fire-dark-sheet'),'fill',c.base);
  for(const id of ['fire-vortex','fire-emblem','fire-sparks'])set(scene.el(id),'fill',c.accent);
 },
 draw(scene,p){
  const w=scene.w,h=scene.h,u=scene.unit;
  const birth=phase(p,.015,.25),lift=phase(p,.58,.96);
  const top=lerp(h*1.35,-h*.45,phase(p,.13,.405));
  const bottom=lerp(h*1.35,-h*.65,phase(p,.58,.965));
  set(scene.el('fire-amber-sheet'),'d',curtain(w,h,top,bottom,p,u*.075));
  set(scene.el('fire-dark-sheet'),'d',curtain(w,h,top,bottom,p+.03));
  set(scene.el('fire-curtains'),'opacity',phase(p,.105,.145)*(1-phase(p,.94,.99)));
  // Tras retirar la base, la raíz sube y se pinza mientras el remolino respira arriba.
  const base=lerp(h+u*.12,-h*.37,lift);
  const rise=lerp(u*.08,h*.86,birth)*(1-.32*lift);
  const spread=u*(.18+.11*birth)*(1-.52*lift);
  const fade=phase(p,.015,.08)*(1-phase(p,.84,.995));
  const quietCenter=phase(p,.32,.43)*(1-phase(p,.57,.7));
  for(let i=0;i<6;i++){
   const side=i<3?-1:1,k=i%3;
   const path=fireRibbon({cx:w*.5+side*u*.075,base:base+k*u*.018,rise:rise*(i<3?1:.77),spread:spread*(i<3?1:.76),width:u*(.073-k*.013)*(1-.3*lift),turn:p*TAU*2.25+k*.14,seed:k*.19+(i<3?0:1.3),extinction:lift});
   set(scene.el('fire-ribbon-'+i),'d',path);
   set(scene.el('fire-ribbon-'+i),'opacity',fade*(i<3?.94:.62)*(1-quietCenter*.76));
  }
  // La flama oficial reaparece dentro del fuego, aún con oscilación y calor.
  const central=phase(p,.21,.38);
  const opacity=phase(p,.035,.12)*(1-phase(p,.76,.94));
  const cx=w*.5+u*.022*Math.sin(p*26)*(1-.5*central)+u*.1*lift;
  const cy=lerp(h+u*.02,h*.49,birth)-h*.93*lift;
  const height=u*lerp(.08,.59,birth)*(1+.5*lift)*(1-.28*phase(p,.82,.97));
  const sx=height/116*(1+.045*Math.sin(p*53))*(1-.46*lift);
  const sy=height/116*(1+.055*Math.sin(p*43+1))*(1+.38*lift);
  const rotation=6*Math.sin(p*21)*(1-central*.55)+lift*17;
  set(scene.el('fire-emblem'),'transform',`translate(${f(cx)} ${f(cy)}) rotate(${f(rotation)}) scale(${sx} ${sy})`);
  set(scene.el('fire-emblem'),'opacity',opacity);
  set(scene.el('fire-heat').querySelector('feDisplacementMap'),'scale',3+5*Math.sin(p*PI)**2+lift*9);
  // Puntas de fuego desprendidas: pequeñas, afiladas y ascendentes.
  for(let i=0;i<10;i++){
   const release=.09+i*.025,age=clamp((p-release)/(.45+(i%3)*.055));
   const late=phase(p,.7,.99),a=i*2.399+p*5;
   const x=w*.5+Math.sin(a)*u*(.12+age*.27)*(1-late*.3)+late*u*.08;
   const y=h-u*.03-age*h*1.22-late*h*.7;
   const radius=u*(.007+(i%3)*.003)*Math.sin(age*PI)*(1-phase(p,.91,1));
   const el=scene.el('fire-spark-'+i);
   set(el,'d',`M0 ${-radius*2.8} C${radius*.3} ${-radius*.35} ${radius*1.4} 0 0 ${radius} C${-radius*1.5} ${radius*.5} ${-radius*.3} ${-radius*.5} 0 ${-radius*2.8}Z`);
   set(el,'transform',`translate(${f(x)} ${f(y)}) rotate(${20*Math.sin(a)})`);
   set(el,'opacity',Math.sin(age*PI)*.85);
  }
 }
};
})();
