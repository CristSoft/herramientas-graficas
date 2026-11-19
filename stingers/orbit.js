/* Curved foil, light and the opaque cut all use the stinger's normalized clock. */
(() => {
  'use strict';

  const colors = {accent:'#e6b151',base:'#0b1c34'};
  const ribbons = [
    {points:[[-.23,.80],[-.03,.22],[.28,.05],[.89,-.19]], width:.115, metal:'steel', depth:.69},
    {points:[[-.16,1.20],[-.08,.67],[.035,.14],[.62,-.13]], width:.160, metal:'gold', depth:.95},
    {points:[[-.28,.44],[.01,.08],[.28,.035],[.67,-.13]], width:.100, metal:'gold', depth:.97},
    {points:[[-.16,.88],[-.03,.39],[.031,.23],[.43,-.08]], width:.024, metal:'blue', depth:.72},
    {points:[[-.23,.80],[-.03,.22],[.28,.05],[.89,-.19]], width:.100, metal:'steel', depth:.68, mirror:true},
    {points:[[-.16,1.20],[-.08,.67],[.035,.14],[.62,-.13]], width:.146, metal:'gold', depth:.95, mirror:true},
    {points:[[-.28,.44],[.01,.08],[.28,.035],[.67,-.13]], width:.106, metal:'gold', depth:.96, mirror:true},
    {points:[[-.16,.88],[-.03,.39],[.031,.23],[.43,-.08]], width:.024, metal:'blue', depth:.72, mirror:true}
  ];
  const railCount = 2;
  const bandCount = ribbons.length + railCount;
  const dustCount = 24;
  const ringCount = 3;
  const stages = Array.from({length:bandCount}, (_, index) => 'orbit-band-' + index);

  const mix = (a,b,t) => a+(b-a)*t;
  const limit = n => Math.min(1, Math.max(0,n));
  const ease = (p,from,to) => {
    const t = limit((p-from)/(to-from));
    return t*t*(3-2*t);
  };
  const attr = (element, name, value) => element.setAttribute(name, String(value));
  const round = value => +value.toFixed(2);
  const pair = ([x,y]) => round(x)+' '+round(y);
  const triplet = value => value.slice(1).match(/../g).map(channel => parseInt(channel,16));
  function tint(value, other, weight) {
    const end = triplet(other);
    return '#'+triplet(value).map((channel,index) =>
      Math.round(mix(channel,end[index],weight)).toString(16).padStart(2,'0')
    ).join('');
  }

  function gradient(id, coordinates, offsets) {
    return '<linearGradient id="orbit-'+id+'" '+coordinates+'>'+
      offsets.map(offset => '<stop offset="'+offset+'"/>').join('')+
      '</linearGradient>';
  }
  const defs = [
    '<clipPath id="orbit-cover"><path id="orbit-cover-left"/><path id="orbit-cover-right"/></clipPath>',
    ...stages.map(id => '<clipPath id="'+id+'-clip"><path id="'+id+'-mask"/></clipPath>'),
    '<radialGradient id="orbit-field-glow" cx=".49" cy=".47" r=".70"><stop offset="0"/><stop offset=".48"/><stop offset=".8"/><stop offset="1"/></radialGradient>',
    '<radialGradient id="orbit-soft-light" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8d3" stop-opacity=".96"/><stop offset=".16" stop-color="#fff0bd" stop-opacity=".55"/><stop offset=".45" stop-color="#efb755" stop-opacity=".18"/><stop offset="1" stop-color="#efb755" stop-opacity="0"/></radialGradient>',
    '<radialGradient id="orbit-specular" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe8" stop-opacity=".91"/><stop offset=".2" stop-color="#fff0b6" stop-opacity=".52"/><stop offset=".54" stop-color="#fff4bf" stop-opacity=".16"/><stop offset="1" stop-color="#fff4bf" stop-opacity="0"/></radialGradient>',
    gradient('gold','x1="0" y1="1" x2="1" y2="0"',[0,.12,.31,.47,.53,.68,.84,1]),
    gradient('steel','x1=".12" y1="1" x2=".84" y2="0"',[0,.2,.43,.54,.72,.87,1]),
    gradient('blue','x1="0" y1=".9" x2="1" y2=".1"',[0,.36,.62,.81,1]),
    gradient('edge','x1="0" y1="1" x2="1" y2="0"',[0,.22,.46,.59,.79,1]),
    gradient('brand','gradientUnits="userSpaceOnUse"',[0,.18,.32,.51,.61,.71,.88,1]),
    '<radialGradient id="orbit-backlight"><stop offset="0" stop-color="#6097e4" stop-opacity=".22"/><stop offset=".6" stop-color="#527fc2" stop-opacity=".08"/><stop offset="1" stop-color="#355f99" stop-opacity="0"/></radialGradient>'
  ].join('');

  function bandMarkup(id) {
    return [
      '<g id="'+id+'">',
      '<path id="'+id+'-shadow" fill="#020509" opacity=".52"/>',
      '<path id="'+id+'-face"/>',
      '<path id="'+id+'-bevel" fill="url(#orbit-edge)" opacity=".62"/>',
      '<path id="'+id+'-rim" fill="none" stroke="url(#orbit-edge)" stroke-width="2"/>',
      '<path id="'+id+'-seam" fill="none" stroke="#fff5cb" stroke-width="1.1" opacity=".35"/>',
      '<g clip-path="url(#'+id+'-clip)"><ellipse id="'+id+'-shine" fill="url(#orbit-specular)"/></g>',
      '</g>'
    ].join('');
  }
  function flareMarkup(id) {
    return '<g id="'+id+'" fill="#fff6cf">'+
      '<ellipse rx="96" ry="72" fill="url(#orbit-soft-light)"/>'+
      '<ellipse rx="122" ry="5" fill="url(#orbit-specular)" opacity=".85"/>'+
      '<ellipse rx="5" ry="52" fill="url(#orbit-specular)" opacity=".73"/>'+
      '<circle r="2.3" fill="#fffdec"/></g>';
  }
  const markup = [
    '<g id="orbit">',
    '<g clip-path="url(#orbit-cover)">',
    '<rect id="orbit-solid"/><rect id="orbit-glow" fill="url(#orbit-field-glow)"/>',
    '<ellipse id="orbit-halo" fill="url(#orbit-backlight)"/>',
    ...Array.from({length:ringCount}, (_,i) =>
      '<ellipse id="orbit-ring-'+i+'" fill="none" stroke-width="1.5"/>'+
      '<ellipse id="orbit-ring-light-'+i+'" fill="none" stroke-width="2" stroke-linecap="round"/>'
    ),
    '<g id="orbit-dust" fill="#ffe0a1">'+
      Array.from({length:dustCount}, (_,i) => '<circle id="orbit-dust-'+i+'"/>').join('')+'</g>',
    ...stages.slice(0,ribbons.length).map(bandMarkup),
    flareMarkup('orbit-flare-left'),flareMarkup('orbit-flare-right'),
    '<g id="orbit-identity">',
    '<use href="#stinger-identity" fill="#020710" opacity=".85" transform="translate(0 3.6)"/>',
    '<use href="#stinger-identity" fill="#fff0c6" opacity=".8" transform="translate(-.8 -.8)"/>',
    '<use href="#stinger-identity" fill="url(#orbit-brand)"/></g>',
    '</g>',
    ...stages.slice(ribbons.length).map(bandMarkup),
    '</g>'
  ].join('');

  function palette(scene) {
    const {accent,base} = scene.config;
    const colorStops = {
      'field-glow':[tint(base,'#4978b5',.32), tint(base,'#2d5790',.24), base, tint(base,'#020610',.67)],
      gold:[tint(accent,'#100b0c',.87),tint(accent,'#201208',.68),tint(accent,'#392316',.26),
        tint(accent,'#fff1c9',.60),tint(accent,'#3a250e',.39),accent,
        tint(accent,'#fff8e0',.74),tint(accent,'#30201c',.72)],
      steel:[tint(base,'#090e17',.52),tint(base,'#4c6d96',.59),'#627f9f','#d1dbe0','#4d6481','#aabdc9','#172942'],
      blue:['#081321','#264773','#72b7f2','#234672','#081828'],
      edge:[tint(accent,'#16151a',.72),tint(accent,'#fff0c1',.64),
        tint(accent,'#372621',.41),'#fff9db',tint(accent,'#fff6d2',.40),tint(accent,'#181623',.64)],
      brand:[tint(accent,'#fff6d0',.57),accent,'#fff0bf',tint(accent,'#855222',.28),
        '#fff5df','#d0b889','#fff9eb',tint(accent,'#fff1ca',.37)]
    };
    Object.entries(colorStops).forEach(([id,list]) => {
      scene.el('orbit-'+id).querySelectorAll('stop').forEach((stop,i) => attr(stop,'stop-color',list[i]));
    });
    attr(scene.el('orbit-solid'),'fill',base);
  }

  function pointOnCurve(points, t) {
    const [a,b,c,d] = points;
    const u = 1-t;
    const coords = [0,1].map(axis => u*u*u*a[axis]+3*u*u*t*b[axis]+3*u*t*t*c[axis]+t*t*t*d[axis]);
    const [dx,dy] = [0,1].map(axis =>
      u*u*(b[axis]-a[axis])+2*u*t*(c[axis]-b[axis])+t*t*(d[axis]-c[axis])
    );
    return {coords,angle:Math.atan2(dy,dx)};
  }
  function section(points,width,t) {
    const {coords,angle} = pointOnCurve(points,t);
    const thickness = width*(.64+.32*Math.sin(Math.PI*t)+.08*Math.cos(2*Math.PI*t+.6));
    return along => [coords[0]-Math.sin(angle)*thickness*along,coords[1]+Math.cos(angle)*thickness*along];
  }
  function pathAlong(samples, edge) {
    return 'M'+samples.map(sample=>pair(sample(edge))).join('L');
  }
  function bandBetween(samples, low, high) {
    return pathAlong(samples,low)+'L'+samples.slice().reverse().map(sample=>pair(sample(high))).join('L')+'Z';
  }
  function drawBand(scene, index, points, width, metal) {
    const id = stages[index];
    const samples = Array.from({length:37},(_,n) => section(points,width,n/36));
    const face = bandBetween(samples,-.5,.5);
    attr(scene.el(id+'-face'),'d',face);
    attr(scene.el(id+'-face'),'fill','url(#orbit-'+metal+')');
    attr(scene.el(id+'-mask'),'d',face);
    attr(scene.el(id+'-shadow'),'d',bandBetween(samples,-.42,.72));
    attr(scene.el(id+'-shadow'),'transform','translate(3 6)');
    attr(scene.el(id+'-bevel'),'d',bandBetween(samples,.29,.5));
    attr(scene.el(id+'-rim'),'d',pathAlong(samples,-.49));
    attr(scene.el(id+'-seam'),'d',pathAlong(samples,.35));
  }
  function moveLight(scene,index,points,t,width,opacity) {
    const id = stages[index];
    const {coords:[x,y],angle} = pointOnCurve(points,limit(t));
    const light=scene.el(id+'-shine');
    attr(light,'rx',width*1.8);
    attr(light,'ry',width*.46);
    attr(light,'transform','translate('+pair([x,y])+') rotate('+round(angle*180/Math.PI)+')');
    attr(light,'opacity',opacity);
    return [x,y,angle];
  }

  function configure(scene) {
    const {w,h,unit} = scene;
    palette(scene);
    for (const id of ['orbit-solid','orbit-glow']) {
      attr(scene.el(id),'width',w);
      attr(scene.el(id),'height',h);
    }
    const halo = scene.el('orbit-halo');
    attr(halo,'cx',w*.5);attr(halo,'cy',h*.50);
    attr(halo,'rx',w*.36);attr(halo,'ry',h*.42);
    scene.orbitPoints = ribbons.map((ribbon,index) => {
      const points = ribbon.points.map(([x,y]) => ribbon.mirror?[(1-x)*w,(1-y)*h]:[x*w,y*h]);
      drawBand(scene,index,points,ribbon.width*unit,ribbon.metal);
      return points;
    });
    for (let i=0;i<ringCount;i++) {
      const rx = w*(.25+i*.079), ry = h*(.33+i*.095);
      for (const prefix of ['orbit-ring-','orbit-ring-light-']) {
        const ring = scene.el(prefix+i);
        attr(ring,'cx',w*.5);attr(ring,'cy',h*.5);
        attr(ring,'rx',rx);attr(ring,'ry',ry);
        attr(ring,'transform','rotate('+(w>h?-24:-14)+' '+w*.5+' '+h*.5+')');
        attr(ring,'stroke',i===1?'#dbac67':'#70a9dd');
      }
      attr(scene.el('orbit-ring-'+i),'opacity',.15+i*.014);
      attr(scene.el('orbit-ring-light-'+i),'stroke-dasharray',(unit*(.10+i*.034))+' '+(w+h)*3);
    }
  }

  function setLogoViewBox(scene, viewBox) {
    const [x,y,w,h] = viewBox.split(/\s+/).map(Number);
    const brand=scene.el('orbit-brand');
    attr(brand,'x1',x+w*.43);attr(brand,'x2',x+w*.57);
    attr(brand,'y1',y);attr(brand,'y2',y+h);
  }

  function curtain(scene, progress, right) {
    const {w,h} = scene;
    const x=mix(-.62,.92,progress);
    const left = [[x+.37,-.28],[x+.12,.02],[x-.36,.72],[x-.18,1.28]];
    const points=left.map(([px,py]) => right?[(1-px)*w,(1-py)*h]:[px*w,py*h]);
    const boundary=pair(points[0])+'C'+points.slice(1).map(pair).join(' ');
    const side=right?w*2:-w;
    return {points, shape:'M'+boundary+'L'+pair([side,points[3][1]])+'L'+pair([side,points[0][1]])+'Z'};
  }
  function draw(scene,p) {
    const {w,h,unit} = scene;
    const coverLeft=ease(p,.026,.425)*(1-ease(p,.585,.973));
    const coverRight=ease(p,.06,.44)*(1-ease(p,.55,.948));
    const left=curtain(scene,coverLeft,false), right=curtain(scene,coverRight,true);
    attr(scene.el('orbit-cover-left'),'d',left.shape);
    attr(scene.el('orbit-cover-right'),'d',right.shape);
    for (const [side,front,amount] of [[0,left,coverLeft],[1,right,coverRight]]) {
      const index=ribbons.length+side;
      const width=unit*(side?.092:.121);
      drawBand(scene,index,front.points,width,side?'steel':'gold');
      moveLight(scene,index,front.points,.26+.48*ease(p,.08,.85),width,.87);
      attr(scene.el(stages[index]),'opacity',ease(amount,0,.06)*(1-ease(amount,.92,1)));
    }

    const arrival=ease(p,.14,.47), departure=ease(p,.54,.9);
    for (const [index,ribbon] of ribbons.entries()) {
      const side=ribbon.mirror?1:-1;
      const drift=(1-arrival)*unit*.24-departure*unit*.20;
      attr(scene.el(stages[index]),'transform','translate('+pair([side*drift,side*drift*.44])+')');
      attr(scene.el(stages[index]),'opacity',ribbon.depth);
      const flash=index===2?mix(.27,.59,ease(p,.12,.89))
        :index===5?mix(.52,.73,ease(p,.15,.93))
        :(.18+(index%4)*.13+p*(index%2?.61:.42))%1;
      const [x,y,angle]=moveLight(scene,index,scene.orbitPoints[index],flash,ribbon.width*unit,.79);
      if(index===2||index===5){
        const flare=scene.el(index===2?'orbit-flare-left':'orbit-flare-right');
        const flicker=.61+.22*Math.sin(p*31+index)+.12*Math.cos(p*57);
        attr(flare,'transform','translate('+pair([x+side*drift,y+side*drift*.44])+') rotate('+round(angle*180/Math.PI)+') scale('+(.55+.27*flicker)+')');
        attr(flare,'opacity',flicker*ease(p,.13,.31)*(1-ease(p,.64,.89)));
      }
    }
    for(let i=0;i<ringCount;i++){
      const highlight=scene.el('orbit-ring-light-'+i);
      attr(highlight,'stroke-dashoffset',-(w+h)*(p*.61+i*.227));
      attr(highlight,'opacity',.34+.16*Math.sin(p*17+i));
    }
    for(let i=0;i<dustCount;i++){
      const spark=scene.el('orbit-dust-'+i);
      const angle=i*2.399+(.5-p)*.33;
      const distance=.72+(i%6)*.09;
      attr(spark,'cx',w*.5+w*.34*Math.cos(angle)*distance);
      attr(spark,'cy',h*.5+h*.36*Math.sin(angle)*distance);
      attr(spark,'r',.8+(i%5)*.53);
      attr(spark,'opacity',.12+.59*Math.sin(i*4.14+p*12+i%3)**4);
    }

    const appear=ease(p,.355,.455), disappear=ease(p,.595,.72);
    const brand=scene.el('orbit-identity');
    const scale=unit*.225/85*mix(.89,1,appear)*mix(1,1.04,disappear);
    attr(brand,'opacity',appear*(1-disappear));
    attr(brand,'transform','translate('+pair([w*.5,h*.49+unit*.021*(1-appear)])+') scale('+scale+')');
  }

  window.JCPOrbit = {colors,defs,markup,configure,setLogoViewBox,draw};
})();
