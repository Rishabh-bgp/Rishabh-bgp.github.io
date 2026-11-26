/* RA-01 soundtrack — primary music is the YouTube track "Soviet Union edit, but its fits the beat perfectly (full version)"
   by Fix_37 (youtu.be/UKrA8hv8dvE), played through the official YouTube IFrame Player API. It never autoplays: sound starts only
   on an explicit tap of the HUD button, which calls player.playVideo() inside the click handler (iOS/Android unlock).
   Quiet Web Audio UI blips play only while the soundtrack is on. If YouTube is blocked, the HUD offers an "open on YouTube" link. */
(function(){
  'use strict';
  var VID='UKrA8hv8dvE',TITLE='SOVIET UNION EDIT',FULL='Soviet Union edit, but its fits the beat perfectly (full version) — Fix_37',URL='https://www.youtube.com/watch?v='+VID;
  var AC=window.AudioContext||window.webkitAudioContext;
  var ctx=null,master,music,sfxBus,verb,verbIn,dly,dlyIn,noise,vol=.6,sfxOn=true;
  var player=null,ready=false,apiReq=false,state='off',want=false,resumeOnShow=false,wd=0,tw=0;
  try{var sv=JSON.parse(localStorage.getItem('ra-audio')||'{}');if(sv.v!=null)vol=Math.max(0,Math.min(1,sv.v));if(sv.s===false)sfxOn=false}catch(_){}
  function save(){try{localStorage.setItem('ra-audio',JSON.stringify({v:vol,s:sfxOn}))}catch(_){}}
  function init(){if(ctx)return true;if(!AC)return false;
    try{ctx=new AC()}catch(_){ctx=null;return false}
    var comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
    master=ctx.createGain();master.gain.value=vol*.62;master.connect(comp);comp.connect(ctx.destination);
    music=ctx.createGain();music.gain.value=1;music.connect(master);
    sfxBus=ctx.createGain();sfxBus.gain.value=.22;sfxBus.connect(comp);
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
  function sfx(name){if(!ctx||state!=='playing'||!sfxOn)return;var t=ctx.currentTime+.01;
    if(name==='click'||name==='switch'){synth(t,name==='switch'?440:1320,.04,.18,{wave:'square',cut:2400,sus:.2,rel:.03,dest:sfxBus});if(name==='switch')synth(t+.06,660,.05,.14,{wave:'square',cut:2600,sus:.2,rel:.03})}
    else if(name==='lock'){[1568,2093].forEach(function(f,i){var o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.0001,t+i*.09);g.gain.linearRampToValueAtTime(.08,t+i*.09+.005);g.gain.exponentialRampToValueAtTime(.0001,t+i*.09+.08);o.connect(g);g.connect(sfxBus);o.start(t+i*.09);o.stop(t+i*.09+.1)})}
    else if(name==='ping')ping(t,.5,sfxBus);
    else if(name==='whoosh'){var f=nz(t,.35,1.2,'bandpass',300,1.5,0,sfxBus);f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(3200,t+.6);f.frequency.exponentialRampToValueAtTime(400,t+1.2)}
    else if(name==='servo'){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(90,t);o.frequency.linearRampToValueAtTime(140,t+.5);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.06,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.7);o.connect(g);g.connect(sfxBus);o.start(t);o.stop(t+.75)}
    else if(name==='bolt'){nz(t,.5,.05,'highpass',2500,1,0,sfxBus);nz(t+.18,.6,.06,'bandpass',3200,2,0,sfxBus)}}
  // ---- YouTube IFrame Player ----
  function dock(){var d=document.getElementById('ytDock');if(!d){d=document.createElement('div');d.id='ytDock';d.className='yt-dock no-print';d.setAttribute('aria-hidden','true');
    var h=document.createElement('div');h.id='ytPlayer';d.appendChild(h);document.body.appendChild(d)}return d}
  function loadAPI(){if(apiReq)return;apiReq=true;dock();
    var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(prev)try{prev()}catch(_){}create()};
    if(window.YT&&window.YT.Player){create();return}
    var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;s.onerror=function(){fail('api')};document.head.appendChild(s)}
  function create(){if(player)return;try{
    player=new YT.Player('ytPlayer',{width:200,height:200,videoId:VID,host:'https://www.youtube.com',
      playerVars:{enablejsapi:1,playsinline:1,loop:1,playlist:VID,controls:0,disablekb:1,fs:0,rel:0,iv_load_policy:3,modestbranding:1,origin:location.origin},
      events:{onReady:function(){ready=true;try{player.setVolume(Math.round(vol*100))}catch(_){}if(want){try{player.playVideo()}catch(_){}}else setState('off')},
        onStateChange:function(e){var s=e.data;if(s===1){want=false;clearTimeout(wd);setState('playing')}else if(s===3){if(state!=='playing')setState('loading')}
          else if(s===2){if(state!=='error')setState(want?'loading':'off')}else if(s===0){try{player.seekTo(0,true);player.playVideo()}catch(_){}}},
        onError:function(){fail('embed')}}})}catch(_){fail('api')}}
  function fail(){want=false;clearTimeout(wd);setState('error')}
  function play(){if(state==='error'){window.open(URL,'_blank','noopener');return false}
    want=true;if(AC&&init()&&ctx.state==='suspended')ctx.resume();
    if(ready&&player){try{player.setVolume(Math.round(vol*100));player.playVideo()}catch(_){}}else loadAPI();
    if(state!=='playing')setState('loading');clearTimeout(wd);clearTimeout(tw);
    // strict mobile browsers may refuse the first programmatic start: ask for one more tap instead of failing
    tw=setTimeout(function(){if(want&&state==='loading'&&ready){var ps=-1;try{ps=player.getPlayerState()}catch(_){}if(ps!==1&&ps!==3)setState('tap')}},5000);
    wd=setTimeout(function(){if(state==='loading')fail('timeout')},20000);return true}
  function pause(){want=false;resumeOnShow=false;clearTimeout(wd);if(player&&ready){try{player.pauseVideo()}catch(_){}}if(state!=='error')setState('off')}
  function isPlaying(){return state==='playing'}
  function setVolume(v){vol=Math.max(0,Math.min(1,v));save();if(player&&ready){try{player.setVolume(Math.round(vol*100))}catch(_){}}if(ctx)master.gain.value=vol*.62;ui()}
  // ---- HUD controller ----
  var bp,bt,vr,lb;
  var LBL={off:'AUDIO: OFF',loading:'LOADING…',tap:'TAP TO PLAY',playing:'PLAYING',error:'YT BLOCKED ↗'};
  function setState(s){state=s;ui()}
  function ui(){var on=state==='playing';if(bp){bp.setAttribute('aria-pressed',on?'true':'false');bp.classList.toggle('on',on);bp.classList.toggle('busy',state==='loading'||state==='tap');bp.classList.toggle('err',state==='error');
      if(lb)lb.textContent=LBL[state];bp.title=state==='error'?'YouTube could not load here — open the track on YouTube':on?'Pause soundtrack':'Play soundtrack: '+FULL}
    if(vr&&+vr.value!==Math.round(vol*100))vr.value=Math.round(vol*100);
    document.documentElement.classList.toggle('audio-on',on);document.dispatchEvent(new CustomEvent('ra:audio',{detail:{playing:on,state:state,track:TITLE,volume:vol}}))}
  function bind(){bp=document.getElementById('auPlay');bt=document.getElementById('auTrk');vr=document.getElementById('auVol');lb=bp&&bp.querySelector('.au-lbl');
    if(bt){bt.textContent=TITLE+' ↗';bt.title=FULL+' (opens YouTube)'}
    if(bp)bp.addEventListener('click',function(){if(state==='playing'||(state==='loading'&&want&&ready))pause();else play()});
    if(vr)vr.addEventListener('input',function(){setVolume(vr.value/100)});
    document.addEventListener('visibilitychange',function(){if(document.hidden){if(state==='playing'||want){var w=state==='playing';pause();resumeOnShow=w}}
      else if(resumeOnShow){resumeOnShow=false;play()}});
    // warm the API after the page settles so the first tap can call playVideo() synchronously
    var warm=function(){if(!apiReq)loadAPI()};if(document.readyState==='complete')setTimeout(warm,1200);else window.addEventListener('load',function(){setTimeout(warm,1200)});
    ui()}
  window.RAAudio={play:play,pause:pause,toggle:function(){state==='playing'||want?pause():play();return want||state==='playing'},isPlaying:isPlaying,state:function(){return state},
    next:function(){return TITLE},setTrack:function(){return true},getTrack:function(){return TITLE},tracks:[TITLE],url:URL,setVolume:setVolume,getVolume:function(){return vol},
    sfx:function(n){try{sfx(n)}catch(_){}},setSfx:function(b){sfxOn=!!b;save()},supported:true,player:function(){return player}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
