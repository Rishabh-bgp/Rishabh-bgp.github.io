/* RA-01 procedural soundtrack — Web Audio API only: no audio files, no CDN, original compositions.
   Tracks: RED MARCH (heavy tactical march) · SONAR DEPTH (submarine dark ambient) · AIRSPACE (afterburner darksynth).
   Starts OFF; sound begins only after an explicit click (browser autoplay policy). */
(function(){
  'use strict';
  var AC=window.AudioContext||window.webkitAudioContext;
  var TRACKS=[{id:'march',name:'RED MARCH',bpm:112},{id:'sonar',name:'SONAR DEPTH',bpm:60},{id:'air',name:'AIRSPACE',bpm:128}];
  var ctx=null,master,music,sfxBus,verb,verbIn,dly,dlyIn,noise,playing=false,ti=0,vol=.6,timer=0,nextT=0,step=0,bar=0;
  try{var sv=JSON.parse(localStorage.getItem('ra-audio')||'{}');if(sv.v!=null)vol=Math.max(0,Math.min(1,sv.v));if(sv.t!=null&&TRACKS[sv.t])ti=sv.t}catch(_){}
  function save(){try{localStorage.setItem('ra-audio',JSON.stringify({v:vol,t:ti}))}catch(_){}}
  function mtof(m){return 440*Math.pow(2,(m-69)/12)}
  function init(){if(ctx)return true;if(!AC)return false;
    try{ctx=new AC()}catch(_){ctx=null;return false}
    var comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
    master=ctx.createGain();master.gain.value=0;master.connect(comp);comp.connect(ctx.destination);
    music=ctx.createGain();music.gain.value=1;music.connect(master);
    sfxBus=ctx.createGain();sfxBus.gain.value=.55;sfxBus.connect(comp);
    // procedural reverb (decaying noise impulse)
    var len=Math.floor(ctx.sampleRate*2.6),ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(var ch=0;ch<2;ch++){var d=ir.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    verb=ctx.createConvolver();verb.buffer=ir;verbIn=ctx.createGain();verbIn.gain.value=.3;verbIn.connect(verb);verb.connect(music);
    // dotted-eighth feedback delay with damping
    dlyIn=ctx.createGain();dlyIn.gain.value=.5;dly=ctx.createDelay(2);var fb=ctx.createGain(),damp=ctx.createBiquadFilter();fb.gain.value=.34;damp.type='lowpass';damp.frequency.value=2400;
    dlyIn.connect(dly);dly.connect(damp);damp.connect(fb);fb.connect(dly);damp.connect(music);
    var nl=ctx.sampleRate*1.5;noise=ctx.createBuffer(1,nl,ctx.sampleRate);var nd=noise.getChannelData(0);for(i=0;i<nl;i++)nd[i]=Math.random()*2-1;
    return true}
  function env(g,t,a,peak,dec,sus,rel,dur){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(sus*peak,t+a,dec);g.gain.setTargetAtTime(0.0001,t+dur,rel)}
  function out(node,dest,wet,dl){node.connect(dest||music);if(wet){var w=ctx.createGain();w.gain.value=wet;node.connect(w);w.connect(verbIn)}if(dl){var x=ctx.createGain();x.gain.value=dl;node.connect(x);x.connect(dlyIn)}}
  function kick(t,a){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.0001,t+.42);o.connect(g);out(g);o.start(t);o.stop(t+.45)}
  function nz(t,a,dur,type,f,q,wet,dest){var s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;fl.type=type;fl.frequency.value=f;fl.Q.value=q||.7;g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);out(g,dest,wet);s.start(t,Math.random()*.8);s.stop(t+dur+.05);return fl}
  function snare(t,a){nz(t,a,.2,'bandpass',1900,.8,.18);var o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(150,t+.08);g.gain.setValueAtTime(a*.7,t);g.gain.exponentialRampToValueAtTime(.0001,t+.12);o.connect(g);out(g);o.start(t);o.stop(t+.14)}
  function hat(t,a,open){nz(t,a,open?.22:.045,'highpass',7600,.6,.05)}
  function synth(t,f,dur,a,o){o=o||{};var g=ctx.createGain(),fl=ctx.createBiquadFilter();fl.type='lowpass';fl.Q.value=o.q||1.2;
    var c0=o.cut||1200,c1=o.peak||c0*2.4;fl.frequency.setValueAtTime(c0,t);fl.frequency.linearRampToValueAtTime(c1,t+(o.fa||.03));fl.frequency.setTargetAtTime(c0,t+(o.fa||.03),o.fd||.15);
    (o.det||[0]).forEach(function(dt){var v=ctx.createOscillator();v.type=o.wave||'sawtooth';v.frequency.value=f;v.detune.value=dt;if(o.vib){var l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.2;lg.gain.value=o.vib;l.connect(lg);lg.connect(v.detune);l.start(t+.12);l.stop(t+dur+1)}v.connect(fl);v.start(t);v.stop(t+dur+(o.rel||.12)*6)});
    env(g,t,o.att||.01,a,o.dec||.12,o.sus==null?.6:o.sus,o.rel||.12,dur);fl.connect(g);out(g,null,o.wet,o.dl)}
  function ping(t,a,dest){[1180,2360].forEach(function(f,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.985,t+1.4);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(a*(i?.18:1),t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+1.7);o.connect(g);
    if(dest){g.connect(dest)}else out(g,null,.7,.6);o.start(t);o.stop(t+1.8)})}
  // ---- RED MARCH: D minor, 112 bpm, 8-bar loop i–i–VI–III–iv–i–V–V ----
  var MARCH_CH=[[50,[62,65,69]],[50,[62,65,69]],[46,[62,65,70]],[41,[60,65,69]],[43,[62,67,70]],[50,[62,65,69]],[45,[61,64,69]],[45,[61,64,67]]];
  var MARCH_MEL=[[[0,62,4],[4,65,2],[6,69,2],[8,74,6],[14,72,2]],[[0,70,4],[4,69,4],[8,65,6],[14,67,2]],[[0,65,4],[4,70,4],[8,74,4],[12,72,4]],[[0,72,6],[6,69,2],[8,65,8]],
    [[0,67,4],[4,70,2],[6,74,2],[8,79,6],[14,77,2]],[[0,77,4],[4,74,4],[8,69,8]],[[0,73,4],[4,76,4],[8,79,4],[12,76,4]],[[0,73,12],[12,69,4]]];
  function march(s,t,sp){var b=bar%8,ch=MARCH_CH[b],root=ch[0],loop=Math.floor(bar/8)%2;
    if(s===0||s===8)kick(t,.9);if(b%2===1&&s===14)kick(t,.6);
    if(s===4||s===12)snare(t,.55);if(s===2||s===10)snare(t,.12);if(b%2===1&&s>=13)snare(t,.1+.06*(s-13));
    if(s%2===0)hat(t,.06);
    if(s%2===0){var bn=(s===4||s===12)?root+7:(s===8?root+12:root);synth(t,mtof(bn-12),sp*1.6,.34,{cut:180,peak:900,fd:.08,sus:.5,det:[-6,6]})}
    if(s===0||s===8)ch[1].forEach(function(n){synth(t,mtof(n),sp*(s===0?5:6),.07,{cut:500,peak:2600,fa:.05,fd:.25,att:.03,sus:.55,rel:.18,det:[-8,8],wet:.35})});
    if(s===6)ch[1].forEach(function(n){synth(t,mtof(n),sp*1.4,.05,{cut:600,peak:2400,att:.01,sus:.3,det:[-7,7],wet:.2})});
    MARCH_MEL[b].forEach(function(m){if(m[0]===s)synth(t,mtof(m[1]+(loop?12:0)),sp*m[2]*.92,loop?.06:.08,{cut:800,peak:3400,fa:.04,fd:.2,att:.025,sus:.7,rel:.12,det:[-5,5],vib:loop?10:6,wet:.3,dl:.12})});
    if(loop&&s%2===1){var ar=ch[1][(s>>1)%3]+12;synth(t,mtof(ar),sp*.5,.025,{wave:'square',cut:1800,peak:3000,sus:.2,dl:.2})}}
  // ---- SONAR DEPTH: A minor, 60 bpm, 4-bar loop i–VI–iv–V ----
  var SON_CH=[[33,[57,60,64]],[29,[57,60,65]],[26,[57,62,65]],[28,[56,59,64]]],PENTA=[69,72,74,76,79,81];
  function sonar(s,t,sp){var b=bar%4,ch=SON_CH[b];
    if(s===0){var o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();o.type='sine';o2.type='triangle';o.frequency.value=mtof(ch[0]);o2.frequency.value=mtof(ch[0]+12);
      l.frequency.value=.25;lg.gain.value=.05;l.connect(lg);lg.connect(g.gain);env(g,t,1.2,.26,1,.85,.9,sp*16);o.connect(g);o2.connect(g);out(g);[o,o2,l].forEach(function(x){x.start(t);x.stop(t+sp*16+4)});
      ch[1].forEach(function(n,i){synth(t,mtof(n),sp*15,.03,{cut:300,peak:1100+i*200,fa:2.2,fd:1.8,att:1.6,dec:1.5,sus:.8,rel:1.2,det:[-9,9],wet:.6,q:3})})}
    if(s===0&&b%2===0)ping(t+.05,.2);
    if((s===0||s===3)&&b!==3)kick(t,s?.22:.35);
    if((s===6||s===10||s===13)&&Math.random()<.4)synth(t,mtof(PENTA[(Math.random()*PENTA.length)|0]),sp*2,.02,{wave:'sine',cut:3000,att:.02,sus:.4,rel:.6,wet:.8,dl:.5});
    if(b===3&&s===8){var f=nz(t,.05,2.2,'bandpass',300,6,.5);f.frequency.setValueAtTime(260,t);f.frequency.linearRampToValueAtTime(90,t+2)}}
  // ---- AIRSPACE: E minor, 128 bpm, 4-bar loop i–VI–iv–V, filter sweep over 8 bars ----
  var AIR_CH=[[40,[64,67,71]],[36,[64,67,72]],[45,[64,69,72]],[47,[63,66,71]]];
  function air(s,t,sp){var b=bar%4,ch=AIR_CH[b],sw=.5+.5*Math.sin((bar%8+s/16)/8*Math.PI*2-Math.PI/2);
    if(s%4===0)kick(t,.95);if(s===4||s===12){snare(t,.32);nz(t,.18,.15,'bandpass',1200,1.2,.15)}
    if(s%4===2)hat(t,.1,true);else hat(t,.035);
    if(s%4!==0)synth(t,mtof(ch[0]-12+(s%4===3?12:0)),sp*.85,.24,{cut:220+400*sw,peak:900+1400*sw,fd:.06,sus:.3,det:[-5,5]});
    var ar=ch[1][(s+(s>>2))%3]+12*(s%8>4?1:0);synth(t,mtof(ar),sp*.7,.045,{wave:s%2?'square':'sawtooth',cut:400+5200*sw,peak:600+6000*sw,q:6*sw+1,fd:.05,sus:.25,dl:.22,wet:.15});
    if(s===0&&b===0)ch[1].forEach(function(n){synth(t,mtof(n+12),sp*15,.03,{cut:800,peak:2600,att:.4,sus:.7,rel:.6,det:[-12,12],wet:.4})});
    if(bar%4===3&&s===0){var f=nz(t,.09,sp*16,'bandpass',400,3,.3);f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(7000,t+sp*16)}}
  var VOICE={march:march,sonar:sonar,air:air};
  function sched(){if(!ctx||!playing)return;var tr=TRACKS[ti],sp=60/tr.bpm/4;
    while(nextT<ctx.currentTime+.14){try{VOICE[tr.id](step,nextT,sp)}catch(_){}
      nextT+=sp;step++;if(step>=16){step=0;bar++}}}
  function start(){if(!init())return false;if(ctx.state==='suspended')ctx.resume();playing=true;step=0;bar=0;nextT=ctx.currentTime+.08;
    master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(vol*.62,ctx.currentTime,.25);clearInterval(timer);timer=setInterval(sched,25);sched();ui();return true}
  function stop(){playing=false;clearInterval(timer);if(ctx){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0.0001,ctx.currentTime,.12)}ui()}
  function setTrack(x){var i=typeof x==='number'?x:TRACKS.map(function(t){return t.id}).indexOf(String(x).toLowerCase());if(i<0){var q=String(x).toLowerCase();TRACKS.forEach(function(t,j){if(t.name.toLowerCase().indexOf(q)>-1)i=j})}if(i<0||!TRACKS[i])return false;
    ti=i;save();if(playing&&ctx){music.gain.setTargetAtTime(0.0001,ctx.currentTime,.05);setTimeout(function(){if(!ctx)return;step=0;bar=0;nextT=ctx.currentTime+.06;music.gain.setTargetAtTime(1,ctx.currentTime,.08)},160)}ui();return true}
  function setVolume(v){vol=Math.max(0,Math.min(1,v));save();if(ctx&&playing)master.gain.setTargetAtTime(vol*.62,ctx.currentTime,.05);ui()}
  // ---- SFX (only while the soundtrack is on) ----
  function sfx(name){if(!ctx||!playing)return;var t=ctx.currentTime+.01;
    if(name==='click'||name==='switch'){synth(t,name==='switch'?440:1320,.04,.18,{wave:'square',cut:2400,sus:.2,rel:.03,dest:sfxBus});if(name==='switch')synth(t+.06,660,.05,.14,{wave:'square',cut:2600,sus:.2,rel:.03})}
    else if(name==='lock'){[1568,2093].forEach(function(f,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.0001,t+i*.09);g.gain.linearRampToValueAtTime(.08,t+i*.09+.005);g.gain.exponentialRampToValueAtTime(.0001,t+i*.09+.08);o.connect(g);g.connect(sfxBus);o.start(t+i*.09);o.stop(t+i*.09+.1)})}
    else if(name==='ping')ping(t,.5,sfxBus);
    else if(name==='whoosh'){var f=nz(t,.35,1.2,'bandpass',300,1.5,0,sfxBus);f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(3200,t+.6);f.frequency.exponentialRampToValueAtTime(400,t+1.2)}
    else if(name==='servo'){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(90,t);o.frequency.linearRampToValueAtTime(140,t+.5);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.7);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+.75)}
    else if(name==='bolt'){nz(t,.5,.05,'highpass',2500,1,0,sfxBus);nz(t+.18,.6,.06,'bandpass',3200,2,0,sfxBus)}}
  // ---- HUD controller ----
  var bp,bt,vr,lb;
  function ui(){var on=playing;if(bp){bp.setAttribute('aria-pressed',on?'true':'false');bp.classList.toggle('on',on);if(lb)lb.textContent=on?'PLAYING':'AUDIO: OFF';bp.title=on?'Pause soundtrack':'Play procedural soundtrack (original, generated live)'}
    if(bt)bt.textContent=TRACKS[ti].name+' ▸';if(vr&&+vr.value!==Math.round(vol*100))vr.value=Math.round(vol*100);
    document.documentElement.classList.toggle('audio-on',on);document.dispatchEvent(new CustomEvent('ra:audio',{detail:{playing:on,track:TRACKS[ti].name,volume:vol}}))}
  function bind(){bp=document.getElementById('auPlay');bt=document.getElementById('auTrk');vr=document.getElementById('auVol');lb=bp&&bp.querySelector('.au-lbl');
    if(!AC){var g=document.querySelector('.au');if(g)g.hidden=true;return}
    if(bp)bp.addEventListener('click',function(){playing?stop():start()});
    if(bt)bt.addEventListener('click',function(){setTrack((ti+1)%TRACKS.length);if(!playing)start()});
    if(vr)vr.addEventListener('input',function(){setVolume(vr.value/100)});
    document.addEventListener('visibilitychange',function(){if(!ctx)return;if(document.hidden){if(playing)ctx.suspend()}else if(playing){ctx.resume().then(function(){nextT=Math.max(nextT,ctx.currentTime+.05)})}});
    ui()}
  window.RAAudio={play:start,pause:stop,toggle:function(){playing?stop():start();return playing},isPlaying:function(){return playing},next:function(){setTrack((ti+1)%TRACKS.length);return TRACKS[ti].name},
    setTrack:setTrack,getTrack:function(){return TRACKS[ti].name},tracks:TRACKS.map(function(t){return t.name}),setVolume:setVolume,getVolume:function(){return vol},sfx:function(n){try{sfx(n)}catch(_){}},supported:!!AC};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
