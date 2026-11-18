/* The browser and video renderer share these samples and cue times. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ClosingSound=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const RATE=48000;
  const TIMBRES=Object.freeze({
    bell:{label:'Campana original',length:1.35,attack:1000,level:.32,partials:[[1,1,1],[2,.23,.65],[2.76,.12,.35],[4.07,.055,.22]]},
    crystal:{label:'Cristal',length:1.8,attack:650,level:.28,partials:[[1,.9,1.5],[2,.32,1],[3,.15,.7],[4.2,.06,.35]]},
    mallet:{label:'Metalófono',length:1,attack:1600,level:.32,partials:[[1,1,.8],[2.76,.28,.35],[5.4,.12,.18]]},
    marimba:{label:'Marimba',length:.65,attack:1800,level:.4,partials:[[1,1,.55],[4,.17,.15],[10,.035,.07]]},
    piano:{label:'Piano suave',length:1.5,attack:900,level:.27,partials:[[1,1,1.3],[2,.35,.9],[3,.17,.6],[4,.08,.4],[5,.04,.25]]},
    soft:{label:'Tono cálido',length:1.15,attack:110,level:.38,partials:[[1,1,1],[2,.09,.8],[3,.025,.5]]}
  });
  const CUES=[
    {note:'Do5',frequency:523.2511306,progress:.16},
    {note:'Mi5',frequency:659.2551138,progress:.36},
    {note:'Sol5',frequency:783.990872,progress:.56},
    {note:'Do6',frequency:1046.5022612,progress:.76}
  ];
  function events(config){
    const entry=Math.min(config.entrance,config.duration*(config.endMode==='reverse'?.4:.6));
    const labels=config.motion==='liquid'||!config.motion?['Nombre local','del Séptimo Día','Iglesia Adventista','Símbolo']:['Iglesia Adventista','del Séptimo Día','Nombre local','Símbolo'];
    return CUES.map((cue,i)=>({...cue,label:labels[i],time:cue.progress*entry}));
  }
  function samples(config,rate=RATE){
    const data=new Float32Array(Math.ceil(config.duration*rate));
    if(config.soundEnabled===false)return data;
    const volume=typeof config.volume==='number'?Math.max(0,Math.min(1,config.volume)):.4;
    const timbre=TIMBRES[config.soundType]||TIMBRES.bell;
    for(const event of events(config)){
      const start=Math.round(event.time*rate),length=Math.min(Math.ceil(timbre.length*rate),data.length-start);
      for(let i=0;i<length;i++){
        const t=i/rate,attack=1-Math.exp(-t*timbre.attack),tail=Math.min(1,(length-i)/(rate*.035));
        let sample=0;
        for(const [ratio,amplitude,decay] of timbre.partials)sample+=amplitude*Math.sin(2*Math.PI*event.frequency*ratio*t)*Math.exp(-6*t/decay);
        data[start+i]+=sample*attack*tail*timbre.level*volume;
      }
    }
    return data;
  }
  function wav(config){
    const data=samples(config),bytes=new Uint8Array(44+data.length*2),view=new DataView(bytes.buffer);
    const ascii=(at,text)=>{for(let i=0;i<text.length;i++)view.setUint8(at+i,text.charCodeAt(i));};
    ascii(0,'RIFF');view.setUint32(4,bytes.length-8,true);ascii(8,'WAVE');ascii(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,RATE,true);view.setUint32(28,RATE*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);ascii(36,'data');view.setUint32(40,data.length*2,true);
    for(let i=0;i<data.length;i++)view.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,data[i]))*32767),true);
    return bytes;
  }
  function preview(){
    let context,source,gain,buffer,key='',generation=0;
    function stop(){generation++;if(source){try{source.stop();}catch{}source=null;}}
    function setVolume(volume){if(gain&&context)gain.gain.setTargetAtTime(volume,context.currentTime,.015);}
    async function play(config,offset){
      stop();if(!config.soundEnabled||config.volume===0||offset>=config.duration)return;
      const ticket=generation;
      const Audio=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);if(!Audio)return;
      try{
        context=context||new Audio({sampleRate:RATE});
        await context.resume();if(ticket!==generation)return;
        const nextKey=JSON.stringify([config.duration,config.entrance,config.endMode,config.soundType]);
        if(key!==nextKey||!buffer){const data=samples({...config,volume:1},context.sampleRate);buffer=context.createBuffer(1,data.length,context.sampleRate);buffer.copyToChannel(data,0);key=nextKey;}
        gain=gain||context.createGain();gain.disconnect();gain.connect(context.destination);gain.gain.value=config.volume;
        source=context.createBufferSource();source.buffer=buffer;source.connect(gain);source.start(context.currentTime,offset);
      }catch{ /* The next Play gesture can unlock audio if the browser deferred it. */ }
    }
    return {play,stop,setVolume};
  }
  return Object.freeze({events,samples,wav,preview,timbres:TIMBRES,sampleRate:RATE});
});
