/* RA-01 extras: Mission Map (base intel), Teaching Dossier (expandable courses) and two mini-games
   (DEFCON // RADAR INTERCEPT and T-72 ARTILLERY // ML DIAGNOSTIC RANGE). Vanilla JS, no dependencies. */
(function(){
  'use strict';
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sfx(n){try{if(window.RAAudio)window.RAAudio.sfx(n)}catch(_){}}
  function goTo(id){var el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});try{history.replaceState(null,'','#'+id)}catch(_){}}

  /* ================= MISSION MAP ================= */
  function initMap(){var map=$('#missionMap');if(!map)return;
    var pins=$$('.mm-base',map),arcs=$$('.mm-arc',map),cards=$$('.bi[data-intel]'),chips=$$('.mm-chip');
    function sel(id,quiet){pins.forEach(function(p){var on=p.dataset.base===id;p.classList.toggle('on',on);p.setAttribute('aria-pressed',on?'true':'false')});
      arcs.forEach(function(a){a.classList.toggle('on',a.dataset.base===id)});
      chips.forEach(function(c){c.setAttribute('aria-pressed',c.dataset.base===id?'true':'false')});
      cards.forEach(function(c){c.hidden=c.dataset.intel!==id});
      var ro=$('#mmReadout');if(ro){var p=pins.filter(function(x){return x.dataset.base===id})[0];if(p)ro.textContent='> LOCK '+p.dataset.name+' · '+p.dataset.coord}
      if(!quiet)sfx('lock')}
    pins.forEach(function(p){p.addEventListener('click',function(){sel(p.dataset.base)});p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel(p.dataset.base)}})});
    chips.forEach(function(c){c.addEventListener('click',function(){sel(c.dataset.base)})});
    $$('[data-jump]').forEach(function(b){b.addEventListener('click',function(){goTo(b.dataset.jump)})});
    sel('iiit',true);
    window.RAMap={select:sel}}

  /* ================= TEACHING DOSSIER ================= */
  function initTeaching(){$$('.tc-card').forEach(function(card){var b=$('.tc-head',card),body=$('.tc-body',card);if(!b||!body)return;
      b.addEventListener('click',function(){var open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',open?'true':'false');body.hidden=!open;card.classList.toggle('open',open);sfx('click')})});
    var all=$('#tcAll');if(all)all.addEventListener('click',function(){var cards=$$('.tc-card'),anyClosed=cards.some(function(c){return !c.classList.contains('open')});
      cards.forEach(function(c){var b=$('.tc-head',c),body=$('.tc-body',c);b.setAttribute('aria-expanded',anyClosed?'true':'false');body.hidden=!anyClosed;c.classList.toggle('open',anyClosed)});
      all.textContent=anyClosed?'COLLAPSE ALL −':'EXPAND ALL +'})}

  /* ================= MINI-GAMES ================= */
  var COL={bg:'#040805',grid:'rgba(61,255,122,.16)',green:'#3dff7a',red:'#ff3b3b',cyan:'#36e2ff',yellow:'#ffd400',ink:'#e8f5e8',mute:'rgba(232,245,232,.6)'};
  var HOST_R=['KYC PHISH','BANK LOOKALIKE','DATA LEAKAGE','SCAM SMS','SPOOF URL'],FRIEND_R=['SCADA TELEMETRY','BEED EEG','BRAIN MRI','ORCID SYNC'];
  var HOST_T=['OVERFITTING','DATA LEAKAGE','CLASS IMBALANCE','BIAS DRIFT','SCAM PAYLOAD','GRADIENT VANISH'],FRIEND_T=['CLEAN SPLIT','REPRODUCIBLE RUN'];
  var ROUND=45;
  var G={mode:'radar',run:false,paused:false,over:false,t:0,score:0,combo:0,best:0,integ:100,fired:0,hits:0,items:[],shells:[],parts:[],flash:null,spawnT:0,ang:-Math.PI/2,keys:{},cool:0,recoil:0,fx:0};
  var modal,cv,ctx,W=600,H=400,DPR=1,raf=0,last=0,stats={},deb,pauseBtn;
  function hsKey(){return 'ra-hs-'+G.mode}
  function getBest(){try{return +localStorage.getItem(hsKey())||0}catch(_){return 0}}
  function setBest(v){try{localStorage.setItem(hsKey(),String(v))}catch(_){}}
  function pick(a){return a[(Math.random()*a.length)|0]}
  function build(){if(modal)return;
    modal=document.createElement('div');modal.className='gm no-print';modal.id='gameModal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Tactical mini-games');
    modal.innerHTML='<div class="gm-box hud"><div class="gm-top"><div class="gm-tabs" role="tablist"><button type="button" role="tab" data-g="radar">▶ RADAR INTERCEPT</button><button type="button" role="tab" data-g="tank">▶ T-72 RANGE</button></div>'+
      '<button type="button" class="gm-x" aria-label="Close game">✕</button></div>'+
      '<div class="gm-title"><b id="gmTitle"></b><span id="gmSub"></span></div>'+
      '<div class="gm-stats"><span><i>SCORE</i><b data-s="score">0</b></span><span><i data-l="a">INTEGRITY</i><b data-s="a">100%</b></span><span><i data-l="b">COMBO</i><b data-s="b">x1</b></span><span><i>TIME</i><b data-s="time">45</b></span><span><i>BEST</i><b data-s="best">0</b></span></div>'+
      '<div class="gm-stage"><canvas id="gmCanvas" tabindex="0" aria-label="Game field"></canvas><div class="gm-deb" hidden></div></div>'+
      '<div class="gm-ctl"><span class="gm-help" id="gmHelp"></span><span class="gm-btns"><button type="button" data-c="pause">❚❚ PAUSE</button><button type="button" data-c="restart">↻ RESTART</button></span></div></div>';
    document.body.appendChild(modal);
    cv=$('#gmCanvas',modal);ctx=cv.getContext('2d');deb=$('.gm-deb',modal);pauseBtn=$('[data-c="pause"]',modal);
    $$('[data-s]',modal).forEach(function(e){stats[e.dataset.s]=e});
    $$('[data-g]',modal).forEach(function(b){b.addEventListener('click',function(){start(b.dataset.g)})});
    $('.gm-x',modal).addEventListener('click',close);
    modal.addEventListener('click',function(e){if(e.target===modal)close()});
    pauseBtn.addEventListener('click',togglePause);$('[data-c="restart"]',modal).addEventListener('click',function(){start(G.mode)});
    cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onMove);
    document.addEventListener('keydown',onKey);document.addEventListener('keyup',function(e){G.keys[e.key]=false});
    window.addEventListener('resize',function(){if(!modal.hidden)size()});
    document.addEventListener('visibilitychange',function(){if(document.hidden&&G.run&&!G.paused)togglePause()})}
  function size(){var stg=$('.gm-stage',modal),w=stg.clientWidth,h=Math.max(260,Math.min(520,window.innerHeight-250));DPR=Math.min(2,window.devicePixelRatio||1);
    W=w;H=h;cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);cv.style.height=h+'px';ctx.setTransform(DPR,0,0,DPR,0,0)}
  function open(mode){build();modal.hidden=false;document.documentElement.classList.add('gm-open');size();start(mode==='tank'?'tank':'radar');setTimeout(function(){try{cv.focus({preventScroll:true})}catch(_){}},30)}
  function close(){if(!modal)return;modal.hidden=true;G.run=false;cancelAnimationFrame(raf);raf=0;document.documentElement.classList.remove('gm-open')}
  function start(mode){G.mode=mode;G.run=true;G.paused=false;G.over=false;G.t=0;G.score=0;G.combo=0;G.integ=100;G.fired=0;G.hits=0;G.items=[];G.shells=[];G.parts=[];G.flash=null;G.spawnT=.4;G.ang=-Math.PI/2;G.cool=0;G.recoil=0;G.best=getBest();
    deb.hidden=true;pauseBtn.textContent='❚❚ PAUSE';
    $$('[data-g]',modal).forEach(function(b){var on=b.dataset.g===mode;b.setAttribute('aria-selected',on?'true':'false');b.classList.toggle('on',on)});
    $('#gmTitle').textContent=mode==='radar'?'DEFCON // RADAR INTERCEPT':'T-72 ARTILLERY // ML DIAGNOSTIC RANGE';
    $('#gmSub').textContent=mode==='radar'?'Tap RED hostiles (scam & leakage threats) before they hit the core · let CYAN friendlies through':'Aim with pointer / ← →, fire with click, tap or SPACE · hit RED ML failure drones, spare CYAN';
    $('#gmHelp').textContent=mode==='radar'?'+100 per intercept × combo · friendly reaching core +50 · shooting a friendly costs integrity':'+100 per hit × combo · hitting a friendly −150 · 45-second round';
    $('[data-l="a"]',modal).textContent=mode==='radar'?'INTEGRITY':'ACCURACY';$('[data-l="b"]',modal).textContent=mode==='radar'?'COMBO':'SHELLS';
    last=performance.now();if(!raf)raf=requestAnimationFrame(loop);hud()}
  function togglePause(){if(!G.run||G.over)return;G.paused=!G.paused;pauseBtn.textContent=G.paused?'▶ RESUME':'❚❚ PAUSE';last=performance.now()}
  function mult(){return Math.min(5,1+Math.floor(G.combo/3))}
  function hud(){stats.score.textContent=G.score;stats.time.textContent=Math.max(0,Math.ceil(ROUND-G.t));stats.best.textContent=Math.max(G.best,G.score);
    if(G.mode==='radar'){stats.a.textContent=Math.max(0,G.integ)+'%';stats.b.textContent='x'+mult()+' · '+G.combo}
    else{stats.a.textContent=(G.fired?Math.round(100*G.hits/G.fired):0)+'%';stats.b.textContent=G.fired+' · x'+mult()}}
  function burst(x,y,col,n){for(var i=0;i<(n||16);i++){var a=Math.random()*6.283,s=40+Math.random()*160;G.parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c:col})}}
  function pos(e){var r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
  function onDown(e){if(!G.run||G.over||G.paused)return;e.preventDefault();var p=pos(e),touch=e.pointerType==='touch';
    if(G.mode==='radar'){var best=null,bd=touch?36:28;G.items.forEach(function(b){var d=Math.hypot(b.x-p[0],b.y-p[1]);if(d<bd){bd=d;best=b}});
      if(best){best.dead=true;if(best.host){G.combo++;G.score+=100*mult();burst(best.x,best.y,COL.red,18);G.flash={x:best.x,y:best.y,t:0,c:COL.yellow,txt:'INTERCEPT +'+100*mult()};sfx('hit')}
        else{G.integ-=20;G.combo=0;burst(best.x,best.y,COL.cyan,10);G.flash={x:best.x,y:best.y,t:0,c:COL.cyan,txt:'FRIENDLY FIRE −20%'};sfx('bad')}}}
    else{aimAt(p);fire()}hud()}
  function onMove(e){if(G.mode==='tank'&&G.run&&!G.paused)aimAt(pos(e))}
  function aimAt(p){var tx=W/2,ty=H-34,a=Math.atan2(p[1]-ty,p[0]-tx);G.ang=Math.max(-Math.PI+.12,Math.min(-.12,a))}
  function fire(){if(G.cool>0||!G.run||G.over||G.paused)return;G.cool=.3;G.recoil=1;G.fired++;var tx=W/2,ty=H-34,L=40;
    G.shells.push({x:tx+Math.cos(G.ang)*L,y:ty+Math.sin(G.ang)*L,vx:Math.cos(G.ang)*640,vy:Math.sin(G.ang)*640,tr:[]});G.fx=1;sfx('boom')}
  function onKey(e){if(!modal||modal.hidden)return;
    if(e.key==='Escape'){close();return}
    if(e.key==='p'||e.key==='P'){togglePause();return}
    if(G.mode==='tank'&&(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key===' '||e.code==='Space')){e.preventDefault();G.keys[e.key]=true;if(e.key===' '||e.code==='Space')fire()}}
  function spawn(){var lvl=G.t/ROUND;
    if(G.mode==='radar'){var R=Math.min(W,H)/2-12,a=Math.random()*6.283,host=Math.random()>.3;
      G.items.push({a:a,r:R,v:R/(7.5-3.5*lvl+Math.random()*1.5),host:host,lbl:host?pick(HOST_R):pick(FRIEND_R),x:0,y:0,ph:Math.random()*6});G.spawnT=1.15-.55*lvl+Math.random()*.35}
    else{var host2=Math.random()>.22,dir=Math.random()<.5?1:-1,y=50+Math.random()*(H*.58-50);
      G.items.push({x:dir>0?-40:W+40,y0:y,y:y,vx:dir*(70+Math.random()*80+90*lvl),host:host2,lbl:host2?pick(HOST_T):pick(FRIEND_T),ph:Math.random()*6});G.spawnT=1.0-.45*lvl+Math.random()*.4}}
  function step(dt){G.t+=dt;G.spawnT-=dt;if(G.spawnT<=0)spawn();
    var cx=W/2,cy=H/2,core=22;
    if(G.mode==='radar'){G.items.forEach(function(b){b.r-=b.v*dt;b.x=cx+Math.cos(b.a)*b.r;b.y=cy+Math.sin(b.a)*b.r;
        if(!b.dead&&b.r<core){b.dead=true;if(b.host){G.integ-=12;G.combo=0;G.flash={x:cx,y:cy,t:0,c:COL.red,txt:'CORE HIT −12%'};burst(cx,cy,COL.red,12);sfx('bad')}else{G.score+=50;G.flash={x:cx,y:cy,t:0,c:COL.cyan,txt:'SAFE +50'};sfx('blip')}}})}
    else{if(G.keys.ArrowLeft)G.ang=Math.max(-Math.PI+.12,G.ang-2.2*dt);if(G.keys.ArrowRight)G.ang=Math.min(-.12,G.ang+2.2*dt);
      G.cool-=dt;G.recoil=Math.max(0,G.recoil-dt*5);G.fx=Math.max(0,G.fx-dt*8);
      G.items.forEach(function(d){d.x+=d.vx*dt;d.y=d.y0+8*Math.sin(G.t*2.4+d.ph);if(d.x<-60||d.x>W+60){d.dead=true;if(d.host)G.combo=0}});
      G.shells.forEach(function(s){s.tr.push([s.x,s.y]);if(s.tr.length>7)s.tr.shift();s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.x<-20||s.x>W+20||s.y<-20)s.dead=true;
        G.items.forEach(function(d){if(!d.dead&&!s.dead&&Math.hypot(d.x-s.x,d.y-s.y)<22){d.dead=true;s.dead=true;
          if(d.host){G.hits++;G.combo++;G.score+=100*mult();burst(d.x,d.y,COL.red,22);burst(d.x,d.y,COL.yellow,10);G.flash={x:d.x,y:d.y,t:0,c:COL.yellow,txt:'HIT +'+100*mult()};sfx('hit')}
          else{G.combo=0;G.score=Math.max(0,G.score-150);burst(d.x,d.y,COL.cyan,12);G.flash={x:d.x,y:d.y,t:0,c:COL.cyan,txt:'FRIENDLY −150'};sfx('bad')}}})});
      G.shells=G.shells.filter(function(s){return !s.dead})}
    G.items=G.items.filter(function(b){return !b.dead});
    G.parts.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.l-=dt*1.6});G.parts=G.parts.filter(function(p){return p.l>0});
    if(G.flash){G.flash.t+=dt;if(G.flash.t>.9)G.flash=null}
    if(G.t>=ROUND||G.integ<=0)end();hud()}
  function rank(s){return s<1000?'RECRUIT':s<2500?'SERGEANT':s<4500?'CAPTAIN':s<7000?'COLONEL':'MARSHAL'}
  function end(){G.over=true;G.run=false;var nb=G.score>G.best;if(nb){setBest(G.score);G.best=G.score}var radar=G.mode==='radar',fail=radar&&G.integ<=0;
    deb.innerHTML='<div class="gm-card"><span class="gm-k">'+(radar?'TACTICAL DEBRIEF':'MISSION DEBRIEF')+'</span><h3>'+(fail?'CORE BREACHED — ':'MISSION COMPLETE — ')+(radar?'OPERATOR':'RANGE OFFICER')+' RANK: '+rank(G.score)+'</h3>'+
      '<ul><li><i>SCORE</i><b>'+G.score+'</b></li>'+(radar?'<li><i>INTEGRITY</i><b>'+Math.max(0,G.integ)+'%</b></li>':'<li><i>ACCURACY</i><b>'+(G.fired?Math.round(100*G.hits/G.fired):0)+'%</b></li><li><i>SHELLS FIRED</i><b>'+G.fired+'</b></li>')+'<li><i>HIGH SCORE</i><b>'+G.best+(nb?' · NEW':'')+'</b></li></ul>'+
      '<p>'+(radar?'Every red blip is a threat class from SPAM//SCAN and the BEED leakage audit; cyan blips are clean research telemetry.':'Every red drone is an ML failure mode my reproducible, leakage-aware pipelines are built to catch.')+'</p>'+
      '<button type="button" class="gm-again">↻ PLAY AGAIN</button></div>';deb.hidden=false;$('.gm-again',deb).addEventListener('click',function(){start(G.mode)});sfx(fail?'bad':'lock')}
  function loop(now){raf=0;if(!modal||modal.hidden)return;var dt=Math.min(.05,(now-last)/1000);last=now;if(G.run&&!G.paused&&!G.over)step(dt);draw();raf=requestAnimationFrame(loop)}
  function txt(s,x,y,col,f,al){ctx.font=f||'700 10px "JetBrains Mono",monospace';ctx.fillStyle=col;ctx.globalAlpha=al==null?1:al;ctx.fillText(s,x,y);ctx.globalAlpha=1}
  function draw(){ctx.fillStyle=COL.bg;ctx.fillRect(0,0,W,H);
    if(G.mode==='radar')drawRadar();else drawTank();
    G.parts.forEach(function(p){ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.c;ctx.fillRect(p.x-1.5,p.y-1.5,3,3)});ctx.globalAlpha=1;
    if(G.flash){var f=G.flash;ctx.strokeStyle=f.c;ctx.globalAlpha=1-f.t/.9;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,10+f.t*40,0,6.283);ctx.stroke();ctx.globalAlpha=1;var tw=(ctx.font='700 12px "JetBrains Mono",monospace',ctx.measureText(f.txt).width);txt(f.txt,Math.max(4,Math.min(W-tw-4,f.x-tw/2)),f.y-18-f.t*20,f.c,'700 12px "JetBrains Mono",monospace',1-f.t/.9)}
    if(G.paused){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);txt('PAUSED',W/2-30,H/2,COL.yellow,'700 16px "JetBrains Mono",monospace')}}
  function drawRadar(){var cx=W/2,cy=H/2,R=Math.min(W,H)/2-12;ctx.strokeStyle=COL.grid;ctx.lineWidth=1;
    for(var i=1;i<=4;i++){ctx.beginPath();ctx.arc(cx,cy,R*i/4,0,6.283);ctx.stroke()}
    ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
    var sa=(G.t*1.8)%6.283;for(var k=0;k<24;k++){ctx.fillStyle='rgba(61,255,122,'+(0.16*(1-k/24))+')';ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,sa-(k+1)*.03,sa-k*.03);ctx.closePath();ctx.fill()}
    ctx.strokeStyle=COL.green;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sa)*R,cy+Math.sin(sa)*R);ctx.stroke();
    ctx.fillStyle='rgba(61,255,122,.18)';ctx.beginPath();ctx.arc(cx,cy,22,0,6.283);ctx.fill();ctx.strokeStyle=COL.green;ctx.beginPath();ctx.arc(cx,cy,22,0,6.283);ctx.stroke();txt('CORE',cx-13,cy+4,COL.green);
    G.items.forEach(function(b){var col=b.host?COL.red:COL.cyan,pul=2*Math.sin(G.t*8+b.ph);ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10;ctx.beginPath();
      if(b.host){ctx.moveTo(b.x,b.y-7-pul*.3);ctx.lineTo(b.x+7,b.y);ctx.lineTo(b.x,b.y+7);ctx.lineTo(b.x-7,b.y)}else ctx.arc(b.x,b.y,6,0,6.283);ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle=col;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(b.x,b.y,11+pul,0,6.283);ctx.stroke();ctx.globalAlpha=1;
      ctx.font='700 9.5px "JetBrains Mono",monospace';var tw=ctx.measureText(b.lbl).width,lx=b.x+12+tw>W-4?b.x-12-tw:b.x+12;txt(b.lbl,lx,b.y-8,col)});
    txt('DEFCON '+(G.integ>70?3:G.integ>40?2:1),10,18,G.integ>40?COL.green:COL.red,'700 11px "JetBrains Mono",monospace')}
  function drawTank(){ctx.strokeStyle=COL.grid;ctx.lineWidth=1;for(var x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(var y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    ctx.fillStyle='rgba(143,163,77,.18)';ctx.fillRect(0,H-22,W,22);
    G.items.forEach(function(d){var col=d.host?COL.red:COL.cyan;ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=10;
      ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(0,-8);ctx.lineTo(14,0);ctx.lineTo(0,8);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
      ctx.strokeStyle=col;ctx.lineWidth=1.5;var sp=(G.t*30)%2?1:0;[-1,1].forEach(function(s){ctx.beginPath();ctx.moveTo(s*14,0);ctx.lineTo(s*20,-6);ctx.stroke();ctx.beginPath();ctx.moveTo(s*14,-9-sp);ctx.lineTo(s*26,-9+sp);ctx.stroke()});ctx.restore();
      ctx.font='700 9.5px "JetBrains Mono",monospace';var tw=ctx.measureText(d.lbl).width;txt(d.lbl,Math.max(2,Math.min(W-tw-2,d.x-tw/2)),d.y-16,col)});
    G.shells.forEach(function(s){ctx.strokeStyle=COL.yellow;ctx.lineWidth=2.5;ctx.shadowColor=COL.yellow;ctx.shadowBlur=8;ctx.beginPath();s.tr.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.lineTo(s.x,s.y);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,2.5,0,6.283);ctx.fill()});
    var tx=W/2,ty=H-34,rc=G.recoil*6;ctx.save();ctx.translate(tx,ty);
    ctx.fillStyle='#3c3e3a';ctx.fillRect(-46,8,92,14);ctx.fillStyle='#2a2b28';for(var w=-40;w<=40;w+=13){ctx.beginPath();ctx.arc(w,15,5,0,6.283);ctx.fill()}
    ctx.fillStyle='#7c8e46';ctx.beginPath();ctx.moveTo(-50,8);ctx.lineTo(50,8);ctx.lineTo(42,-6);ctx.lineTo(-44,-6);ctx.closePath();ctx.fill();
    ctx.save();ctx.rotate(G.ang);ctx.fillStyle='#5c6a34';ctx.fillRect(10-rc,-3,40,6);ctx.fillStyle='#3a3c38';ctx.fillRect(44-rc,-4,8,8);
    if(G.fx>0){ctx.fillStyle='rgba(255,212,0,'+G.fx+')';ctx.beginPath();ctx.moveTo(52-rc,0);ctx.lineTo(70-rc+G.fx*10,-9);ctx.lineTo(64-rc+G.fx*14,0);ctx.lineTo(70-rc+G.fx*10,9);ctx.closePath();ctx.fill()}ctx.restore();
    ctx.fillStyle='#6b7c3c';ctx.beginPath();ctx.ellipse(0,-6,22,13,0,Math.PI,0);ctx.fill();ctx.fillStyle=COL.red;ctx.beginPath();for(var k=0;k<10;k++){var a=-Math.PI/2+k*Math.PI/5,r=k%2?2.2:5;ctx.lineTo(Math.cos(a)*r,-10+Math.sin(a)*r)}ctx.closePath();ctx.fill();
    ctx.restore();txt('T-72 · 125 MM',10,H-28,COL.green);
    ctx.setLineDash([4,6]);ctx.strokeStyle='rgba(255,212,0,.35)';ctx.beginPath();ctx.moveTo(tx+Math.cos(G.ang)*55,ty+Math.sin(G.ang)*55);ctx.lineTo(tx+Math.cos(G.ang)*260,ty+Math.sin(G.ang)*260);ctx.stroke();ctx.setLineDash([])}
  window.RAGames={open:open,close:close,state:function(){return {mode:G.mode,run:G.run,over:G.over,paused:G.paused,t:G.t,score:G.score,integ:G.integ,combo:G.combo,fired:G.fired,hits:G.hits,best:G.best,n:G.items.length}},
    targets:function(){var r=cv?cv.getBoundingClientRect():{left:0,top:0};return G.items.map(function(b){return {x:b.x+r.left,y:b.y+r.top,host:b.host,lbl:b.lbl}})},
    _endNow:function(){G.t=ROUND}};
  function bindLaunchers(){$$('[data-game]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();open(b.dataset.game)})})}
  function init(){initMap();initTeaching();bindLaunchers()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
