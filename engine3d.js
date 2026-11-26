/* RA-01 tactical 3D engine — self-contained Canvas2D projection, no dependencies.
   Modes: RADAR GLOBE · NEURAL LATTICE · QUANTUM BLOCH · EEG WAVE 3D. Drag to orbit (inertia), Ctrl/⌘+wheel, pinch or ± to zoom. */
(function(){
  'use strict';
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement, PAL={};
  function hexrgb(h){h=(h||'').trim();if(h[0]!=='#')return '255,0,51';if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];var n=parseInt(h.slice(1),16);return ((n>>16)&255)+','+((n>>8)&255)+','+(n&255)}
  function readPal(){var cs=getComputedStyle(root);['red','cyan','green','yellow','pink','olive','ink','mute','bg'].forEach(function(k){PAL[k]=hexrgb(cs.getPropertyValue('--'+k))});PAL.light=root.getAttribute('data-theme')==='light'}
  readPal();
  new MutationObserver(readPal).observe(root,{attributes:true,attributeFilter:['data-theme']});
  function c(k,a){return 'rgba('+PAL[k]+','+a+')'}

  var NODES=[
    {id:'wind',label:'Wind Forecasting',sub:'M.Tech thesis · 14 open implementations',col:'cyan',lat:28,lon:20},
    {id:'bio',label:'Brain MRI & Genomics',sub:'Biomedical imaging · RNA-Seq · healthcare AI',col:'red',lat:-18,lon:85},
    {id:'eeg',label:'EEG Epilepsy',sub:'BEED provenance audit (SSRN)',col:'green',lat:46,lon:150},
    {id:'quantum',label:'Quantum Hybrids',sub:'VQC · tensor networks · QI-GWO',col:'pink',lat:-40,lon:-150},
    {id:'sec',label:'Scam & Threat Detection',sub:'NLP · SPAM//SCAN · cyber-threat patent',col:'yellow',lat:8,lon:-95},
    {id:'ip',label:'Patents & IP',sub:'5 Indian patents · 1 copyright registration',col:'olive',lat:-62,lon:-30}
  ];
  NODES.forEach(function(n){var la=n.lat*Math.PI/180,lo=n.lon*Math.PI/180,r=1.18;n.p=[Math.cos(la)*Math.sin(lo)*r,Math.sin(la)*r,Math.cos(la)*Math.cos(lo)*r]});
  var MODES=['globe','lattice','bloch','eeg'];
  var MODE_LABEL={globe:'RADAR GLOBE',lattice:'NEURAL LATTICE',bloch:'QUANTUM BLOCH',eeg:'EEG WAVE 3D'};

  /* ---------- showcase ---------- */
  function Showcase(cv){
    var ctx=cv.getContext('2d'),W=1,H=1,dpr=Math.min(window.devicePixelRatio||1,2);
    var VIEW={globe:[.6,.32],lattice:[.55,.28],bloch:[.6,.3],eeg:[.42,.5]},OSC={lattice:1,eeg:1};
    var st={lastDrag:-99,mode:'globe',yaw:.6,pitch:.32,vy:0,vp:0,zoom:1,tz:1,drag:false,t:0,hover:null,visible:true};
    var panel=cv.closest('.sc-panel'), tip=panel.querySelector('.sc-tip'), ro=panel.querySelector('.sc-readout');
    function size(){var r=cv.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    size();window.addEventListener('resize',size);
    var cy_,sy_,cp_,sp_,S,CX,CY;
    function prep(){cy_=Math.cos(st.yaw);sy_=Math.sin(st.yaw);cp_=Math.cos(st.pitch);sp_=Math.sin(st.pitch);S=Math.min(W,H)*(W<520?0.3:0.34)*st.zoom;CX=W*(W>760?0.6:0.5);CY=H*0.52}
    function P(x,y,z){var X=x*cy_+z*sy_, Z=-x*sy_+z*cy_; var Y=y*cp_-Z*sp_; Z=y*sp_+Z*cp_; var f=3.4/(3.4+Z); return [CX+X*S*f, CY-Y*S*f, Z, f]}
    function dA(z){return Math.max(.12,Math.min(1,.62-z*.38))}
    function poly(pts,col,a,w,closed){ctx.lineWidth=w||1;for(var i=0;i<pts.length-(closed?0:1);i++){var p=P.apply(null,pts[i]),q=P.apply(null,pts[(i+1)%pts.length]);ctx.strokeStyle=c(col,a*dA((p[2]+q[2])/2));ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke()}}
    function circle(r,axis,off,n){n=n||64;var a=[];for(var i=0;i<n;i++){var t=i/n*Math.PI*2,u=Math.cos(t)*r,v=Math.sin(t)*r;a.push(axis==='y'?[u,off,v]:axis==='x'?[off,u,v]:[u,v,off])}return a}
    function rotPts(pts,ax,ang){var c1=Math.cos(ang),s1=Math.sin(ang);return pts.map(function(p){return ax==='x'?[p[0],p[1]*c1-p[2]*s1,p[1]*s1+p[2]*c1]:[p[0]*c1-p[1]*s1,p[0]*s1+p[1]*c1,p[2]]})}
    function dot(x,y,z,r,col,a){var p=P(x,y,z);ctx.fillStyle=c(col,a*dA(p[2]));ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.1,r*p[3]),0,7);ctx.fill();return p}
    function label(x,y,z,txt,col,a){var p=P(x,y,z);ctx.fillStyle=c(col,a*dA(p[2]));ctx.font='700 11px "JetBrains Mono",monospace';ctx.fillText(txt,p[0]+6,p[1]-6)}
    /* mode: globe */
    function globe(t){
      for(var la=-60;la<=60;la+=30){var r=Math.cos(la*Math.PI/180),y=Math.sin(la*Math.PI/180);poly(circle(r,'y',y,72),la===0?'red':'olive',la===0?.8:.5,la===0?1.4:1,true)}
      for(var k=0;k<12;k++){var lo=k/12*Math.PI;var m=[];for(var i=0;i<=48;i++){var a=i/48*Math.PI*2;m.push([Math.cos(a)*Math.sin(lo),Math.sin(a),Math.cos(a)*Math.cos(lo)])}poly(m,'olive',.42,1,false)}
      var scan=Math.sin(t*.9)*.95;poly(circle(Math.sqrt(1-scan*scan),'y',scan,72),'red',.9,2,true);
      [[1.42,.5,'cyan',.6],[1.62,-.85,'yellow',-.4]].forEach(function(o,i){var ring=rotPts(rotPts(circle(o[0],'y',0,90),'x',o[1]),'z',o[3]);poly(ring,o[2],.55,1,true);var j=Math.floor(((t*(i?.06:.09))%1)*90);var s=ring[(j+90)%90];dot(s[0],s[1],s[2],4.5,o[2],1)});
      for(var q=0;q<26;q++){var la2=(q*47%140-70)*Math.PI/180,lo2=q*2.4;var px=Math.cos(la2)*Math.sin(lo2),py=Math.sin(la2),pz=Math.cos(la2)*Math.cos(lo2);var pr=1+Math.sin(t*2+q)*.5;dot(px,py,pz,1.6*pr,'red',.8)}
    }
    /* mode: neural lattice */
    var L=[5,8,9,8,4],LN=[],LE=[],pulses=[];
    (function(){var xs=[-1.5,-.75,0,.75,1.5];L.forEach(function(n,li){LN[li]=[];for(var k=0;k<n;k++){var a=k/n*Math.PI*2+li*.3,r=n>6?.95:.62;LN[li].push([xs[li],Math.cos(a)*r,Math.sin(a)*r])}});
      for(var li=0;li<L.length-1;li++)for(var i=0;i<L[li];i++)for(var j=0;j<L[li+1];j++)LE.push([li,i,j]);
      for(var p=0;p<34;p++)pulses.push({e:Math.floor(Math.random()*LE.length),u:Math.random(),s:.006+Math.random()*.01})})();
    function lattice(t){
      LE.forEach(function(e){var a=LN[e[0]][e[1]],b=LN[e[0]+1][e[2]];poly([a,b],e[0]%2?'cyan':'red',.09,1,false)});
      pulses.forEach(function(p){var e=LE[p.e],a=LN[e[0]][e[1]],b=LN[e[0]+1][e[2]];if(!RM)p.u+=p.s;if(p.u>=1){var nl=e[0]+1;if(nl>=L.length-1){nl=0}var from=nl===0?Math.floor(Math.random()*L[0]):e[2];var cand=[];LE.forEach(function(x,i){if(x[0]===nl&&x[1]===from)cand.push(i)});p.e=cand[Math.floor(Math.random()*cand.length)];p.u=0;return}
        var x=a[0]+(b[0]-a[0])*p.u,y=a[1]+(b[1]-a[1])*p.u,z=a[2]+(b[2]-a[2])*p.u;var pp=P(a[0],a[1],a[2]),q=P(x,y,z);var g=ctx.createLinearGradient(pp[0],pp[1],q[0],q[1]);g.addColorStop(0,c('yellow',0));g.addColorStop(1,c('yellow',.9));ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pp[0]+(q[0]-pp[0])*.6,pp[1]+(q[1]-pp[1])*.6);ctx.lineTo(q[0],q[1]);ctx.stroke();dot(x,y,z,2.6,'yellow',1)});
      LN.forEach(function(layer,li){layer.forEach(function(n,k){var act=.5+.5*Math.sin(t*2.2+li*1.3+k);dot(n[0],n[1],n[2],3.2+act*2.4,li===0||li===L.length-1?'cyan':'red',.55+act*.4)})});
      ['INPUT','CONV','BiLSTM','ATTN','OUT'].forEach(function(s,i){label([-1.5,-.75,0,.75,1.5][i],1.25,0,s,'mute',.9)});
    }
    /* mode: bloch */
    var trail=[];
    function bloch(t){
      for(var la=-60;la<=60;la+=30){var r=Math.cos(la*Math.PI/180);poly(circle(r,'y',Math.sin(la*Math.PI/180),72),la===0?'cyan':'olive',la===0?.75:.35,la===0?1.4:1,true)}
      for(var k=0;k<6;k++){var lo=k/6*Math.PI,m=[];for(var i=0;i<=48;i++){var a=i/48*Math.PI*2;m.push([Math.cos(a)*Math.sin(lo),Math.sin(a),Math.cos(a)*Math.cos(lo)])}poly(m,'olive',.3,1,false)}
      poly([[0,-1.3,0],[0,1.3,0]],'ink',.55,1);poly([[-1.3,0,0],[1.3,0,0]],'ink',.4,1);poly([[0,0,-1.3],[0,0,1.3]],'ink',.4,1);
      label(0,1.32,0,'|0⟩','ink',1);label(0,-1.42,0,'|1⟩','ink',1);label(1.32,0,0,'|+⟩','mute',1);label(0,0,1.32,'|+i⟩','mute',1);
      var th=1.05+.55*Math.sin(t*.55),ph=t*1.25,v=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];
      trail.push(v);if(trail.length>160)trail.shift();
      for(var i2=1;i2<trail.length;i2++)poly([trail[i2-1],trail[i2]],'pink',i2/trail.length*.9,2,false);
      poly([[0,0,0],v],'red',1,3,false);dot(v[0],v[1],v[2],6,'red',1);
      poly([[v[0],v[1],v[2]],[v[0],0,v[2]]],'mute',.6,1,false);poly([[0,0,0],[v[0],0,v[2]]],'mute',.6,1,false);
      var o=P(0,0,0);ctx.fillStyle=c('mute',.9);ctx.font='700 11px "JetBrains Mono",monospace';ctx.fillText('θ='+th.toFixed(2)+'  φ='+((ph%(2*Math.PI))).toFixed(2),o[0]+10,o[1]+18);
    }
    /* mode: eeg */
    var CH=['Fp1','Fp2','F3','F4','C3','C4','P3','P4','O1','O2'];
    function eeg(t){
      for(var g=-4;g<=4;g++){poly([[-1.7,-.75,g*.3],[1.7,-.75,g*.3]],'olive',.25,1);poly([[g*.42,-.75,-1.2],[g*.42,-.75,1.2]],'olive',.25,1)}
      CH.forEach(function(name,ci){var z=-1.2+ci*(2.4/(CH.length-1)),pts=[],N=110;
        for(var i=0;i<N;i++){var x=-1.6+i/(N-1)*3.2,ph=x*6-t*3.2;var y=.09*Math.sin(ph+ci)+.05*Math.sin(ph*2.7+ci*1.7)+.03*Math.sin(ph*7.3);var sp=Math.exp(-Math.pow(((x+1.6+t*.55+ci*.35)%3.2)-1.6,2)*90)*(ci%3===0?.34:.12);pts.push([x,y+sp,z])}
        var col=ci<2?'cyan':ci<6?'red':'yellow';
        ctx.beginPath();var p0=P.apply(null,pts[0]);ctx.moveTo(p0[0],p0[1]);for(var k=1;k<N;k++){var p=P.apply(null,pts[k]);ctx.lineTo(p[0],p[1])}var pe=P(1.6,-.75,z),ps=P(-1.6,-.75,z);ctx.lineTo(pe[0],pe[1]);ctx.lineTo(ps[0],ps[1]);ctx.closePath();ctx.fillStyle=c(col,.06*dA(p0[2]));ctx.fill();
        poly(pts,col,.95,1.6,false);label(-1.72,.05,z,name,'mute',.95)});
    }
    var DRAW={globe:globe,lattice:lattice,bloch:bloch,eeg:eeg};
    function nodes(t){
      var out=[];NODES.forEach(function(n){var p=P(n.p[0],n.p[1],n.p[2]);n.sx=p[0];n.sy=p[1];n.sz=p[2];out.push(n)});
      out.sort(function(a,b){return b.sz-a.sz});
      out.forEach(function(n){var a=dA(n.sz),hov=st.hover===n,pulse=RM?0:(((t*1.4+n.lat/90)%1)+1)%1;var r=(hov?9:6.5);
        ctx.strokeStyle=c(n.col,a*(1-pulse));ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(n.sx,n.sy,r+pulse*14,0,7);ctx.stroke();
        ctx.fillStyle=c(n.col,Math.min(1,a+.25));ctx.beginPath();ctx.moveTo(n.sx,n.sy-r);ctx.lineTo(n.sx+r,n.sy);ctx.lineTo(n.sx,n.sy+r);ctx.lineTo(n.sx-r,n.sy);ctx.closePath();ctx.fill();
        if(hov){ctx.strokeStyle=c('ink',.95);ctx.lineWidth=1.5;ctx.stroke()}
        ctx.font=(hov?'700 12px':'600 11px')+' "JetBrains Mono",monospace';ctx.fillStyle=c(hov?'ink':n.col,Math.min(1,a+.2));var lb=n.label.toUpperCase(),tw=ctx.measureText(lb).width;ctx.fillText(lb,(n.sx+r+6+tw>W-6)?n.sx-r-6-tw:n.sx+r+6,n.sy+4)});
    }
    function hit(x,y){var best=null,bd=22;NODES.forEach(function(n){var d=Math.hypot(n.sx-x,n.sy-y);if(d<bd){bd=d;best=n}});return best}
    function frame(){
      if(!st.visible){raf=0;return}
      if(!RM)st.t+=1/60;
      if(!st.drag){st.yaw+=st.vy;st.pitch+=st.vp;st.vy*=.94;st.vp*=.94;if(!RM&&Math.abs(st.vy)<.0006){if(OSC[st.mode]){if(st.t-st.lastDrag>3){var tg=VIEW[st.mode][0]+.55*Math.sin(st.t*.22);st.yaw+=(tg-st.yaw)*.02}}else st.yaw+=.0028}}else st.lastDrag=st.t;
      st.pitch=Math.max(-1.2,Math.min(1.2,st.pitch));st.zoom+=(st.tz-st.zoom)*.15;
      prep();ctx.clearRect(0,0,W,H);
      // radar backdrop
      var rr=S*1.75;ctx.strokeStyle=c('olive',.16);ctx.lineWidth=1;for(var k=1;k<=4;k++){ctx.beginPath();ctx.arc(CX,CY,rr*k/4,0,7);ctx.stroke()}
      if(st.mode==='globe'&&!RM){var sw=st.t*1.6%(Math.PI*2);ctx.fillStyle=c('red',.07);ctx.beginPath();ctx.moveTo(CX,CY);ctx.arc(CX,CY,rr,sw-.55,sw);ctx.closePath();ctx.fill()}
      DRAW[st.mode](st.t);nodes(st.t);
      if(ro)ro.textContent='MODE '+MODE_LABEL[st.mode]+' · YAW '+((st.yaw*57.3%360+360)%360).toFixed(0)+'° · PITCH '+(st.pitch*57.3).toFixed(0)+'° · ZOOM '+st.zoom.toFixed(2)+'×';
      raf=requestAnimationFrame(frame);
    }
    var raf=0;function kick(){if(!raf&&st.visible)raf=requestAnimationFrame(frame)}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){st.visible=es[0].isIntersecting;kick()}).observe(cv);
    document.addEventListener('visibilitychange',function(){st.visible=!document.hidden;kick()});
    // pointer
    var ptrs={},lx=0,ly=0,pinch0=0,z0=1,moved=0;
    cv.addEventListener('pointerdown',function(e){ptrs[e.pointerId]=[e.clientX,e.clientY];lx=e.clientX;ly=e.clientY;moved=0;st.drag=true;st.vy=st.vp=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}
      var ks=Object.keys(ptrs);if(ks.length===2){var a=ptrs[ks[0]],b=ptrs[ks[1]];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);z0=st.tz}});
    cv.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();
      if(st.drag&&ptrs[e.pointerId]){ptrs[e.pointerId]=[e.clientX,e.clientY];var ks=Object.keys(ptrs);
        if(ks.length===2){var a=ptrs[ks[0]],b=ptrs[ks[1]];var d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch0)st.tz=Math.max(.6,Math.min(2.2,z0*d/pinch0));return}
        var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);st.vy=dx*.006;st.vp=dy*.006;st.yaw+=st.vy;st.pitch+=st.vp;tip.hidden=true;return}
      var h=hit(e.clientX-r.left,e.clientY-r.top);st.hover=h;cv.style.cursor=h?'pointer':'grab';
      if(h){tip.hidden=false;var cnt=(window.RA_TOPIC_COUNTS||{})[h.id];tip.innerHTML='<b>'+h.label+'</b><span>'+h.sub+'</span><em>'+(cnt!=null?cnt+' archive entries · ':'')+'click to filter ›</em>';var tx=Math.min(h.sx+14,W-230);tip.style.transform='translate('+Math.max(4,tx)+'px,'+Math.max(4,h.sy+12)+'px)'}else tip.hidden=true});
    function up(e){var wasTap=moved<6;delete ptrs[e.pointerId];if(Object.keys(ptrs).length===0)st.drag=false;pinch0=0;
      if(wasTap&&e.type==='pointerup'){var r=cv.getBoundingClientRect(),h=hit(e.clientX-r.left,e.clientY-r.top);if(h)select(h.id)}}
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    cv.addEventListener('pointerleave',function(){if(!st.drag){st.hover=null;tip.hidden=true}});
    cv.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();st.tz=Math.max(.6,Math.min(2.2,st.tz*(e.deltaY>0?.92:1.08)))},{passive:false});
    cv.addEventListener('keydown',function(e){var k=e.key;if(k==='ArrowLeft')st.vy=-.04;else if(k==='ArrowRight')st.vy=.04;else if(k==='ArrowUp')st.vp=-.04;else if(k==='ArrowDown')st.vp=.04;else if(k==='+'||k==='=')st.tz=Math.min(2.2,st.tz*1.12);else if(k==='-')st.tz=Math.max(.6,st.tz/1.12);else return;e.preventDefault()});
    function select(id){document.dispatchEvent(new CustomEvent('ra:topic',{detail:id}))}
    function setMode(m){if(DRAW[m]){st.mode=m;st.yaw=VIEW[m][0];st.pitch=VIEW[m][1];st.vy=st.vp=0;st.lastDrag=-99;trail.length=0;Array.prototype.forEach.call(panel.querySelectorAll('[data-mode]'),function(b){b.setAttribute('aria-pressed',b.dataset.mode===m?'true':'false')});panel.setAttribute('data-active-mode',m)}}
    Array.prototype.forEach.call(panel.querySelectorAll('[data-mode]'),function(b){b.addEventListener('click',function(){setMode(b.dataset.mode)})});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-zoom]'),function(b){b.addEventListener('click',function(){var z=b.dataset.zoom;if(z==='in')st.tz=Math.min(2.2,st.tz*1.15);else if(z==='out')st.tz=Math.max(.6,st.tz/1.15);else{st.tz=1;st.yaw=VIEW[st.mode][0];st.pitch=VIEW[st.mode][1];st.vy=st.vp=0;st.lastDrag=-99}})});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-node]'),function(b){b.addEventListener('click',function(){select(b.dataset.node)});
      b.addEventListener('mouseenter',function(){st.hover=NODES.filter(function(n){return n.id===b.dataset.node})[0]});b.addEventListener('mouseleave',function(){st.hover=null})});
    kick();
    return {setMode:setMode,nextMode:function(){setMode(MODES[(MODES.indexOf(st.mode)+1)%MODES.length]);return st.mode},getMode:function(){return st.mode},modes:MODES,labels:MODE_LABEL};
  }

  /* ---------- background tactical grid + particle field ---------- */
  function Field(cv){
    var ctx=cv.getContext('2d'),W=1,H=1,dpr=Math.min(window.devicePixelRatio||1,1.5),mx=0,my=0,tx=0,ty=0,t=0,vis=true,raf=0;
    var parts=[];for(var i=0;i<70;i++)parts.push([Math.random()*2-1,Math.random()*2-1,Math.random()]);
    function size(){var r=cv.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    size();window.addEventListener('resize',size);
    if(!RM)window.addEventListener('pointermove',function(e){tx=e.clientX/window.innerWidth-.5;ty=e.clientY/window.innerHeight-.5},{passive:true});
    function frame(){if(!vis){raf=0;return}
      if(!RM)t+=1/60;mx+=(tx-mx)*.05;my+=(ty-my)*.05;ctx.clearRect(0,0,W,H);
      var hz=H*.58+my*24,vx=W*.5-mx*60;
      // floor grid
      for(var i=0;i<14;i++){var u=((i+(t*.35)%1)/14),y=hz+Math.pow(u,2.2)*(H-hz);ctx.strokeStyle=c('red',.05+u*.16);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      for(var k=-16;k<=16;k++){ctx.strokeStyle=c('olive',.14);ctx.beginPath();ctx.moveTo(vx+k*18,hz);ctx.lineTo(vx+k*W*.12,H);ctx.stroke()}
      ctx.strokeStyle=c('red',.35);ctx.beginPath();ctx.moveTo(0,hz);ctx.lineTo(W,hz);ctx.stroke();
      // particles
      parts.forEach(function(p){if(!RM){p[1]-=.0009*(1+p[2]);if(p[1]<-1)p[1]=1}var x=W/2+p[0]*W*.55+mx*(30+p[2]*70),y=H/2+p[1]*H*.55+my*(20+p[2]*50);ctx.fillStyle=c(p[2]>.66?'cyan':'red',.18+p[2]*.4);ctx.fillRect(x,y,1.2+p[2]*1.8,1.2+p[2]*1.8)});
      raf=RM?0:requestAnimationFrame(frame)}
    if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!raf)raf=requestAnimationFrame(frame)}).observe(cv);
    new MutationObserver(function(){if(!raf)raf=requestAnimationFrame(frame)}).observe(root,{attributes:true,attributeFilter:['data-theme']});
    raf=requestAnimationFrame(frame);
  }

  /* ---------- tilt + holographic sheen ---------- */
  function tilt(){
    if(RM||!window.matchMedia('(hover: hover)').matches)return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'),function(el){
      var max=parseFloat(el.getAttribute('data-tilt'))||8;el.classList.add('tilt');
      el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
        el.style.transform='perspective(900px) rotateX('+((.5-py)*max).toFixed(2)+'deg) rotateY('+((px-.5)*max).toFixed(2)+'deg) translateZ(8px)';
        el.style.setProperty('--sx',(px*100).toFixed(1)+'%');el.style.setProperty('--sy',(py*100).toFixed(1)+'%');el.style.setProperty('--ang',(px*180+py*90).toFixed(0)+'deg')});
      el.addEventListener('pointerleave',function(){el.style.transform=''})});
  }
  document.addEventListener('DOMContentLoaded',function(){
    var sc=document.getElementById('showcase');if(sc&&sc.getContext)window.RA3D=Showcase(sc);
    var f=document.getElementById('field');if(f&&f.getContext)Field(f);
    tilt();
  });
})();
