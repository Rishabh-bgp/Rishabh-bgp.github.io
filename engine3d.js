/* RA-01 tactical 3D engine — self-contained Canvas2D projection, no dependencies.
   Research modes: RADAR GLOBE · NEURAL LATTICE · QUANTUM BLOCH · EEG WAVE 3D.
   Fleet & arsenal (shaded 3D meshes): MIG-21 / SU-27 INTERCEPTOR · T-72 / T-34 ARMOR · TYPHOON / AKULA SUB · AK-47 ARSENAL. Drag to orbit (inertia), Ctrl/⌘+wheel, pinch or ± to zoom. */
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
  var MODES=['globe','lattice','bloch','eeg','jet','tank','sub','ak'];
  var MODE_LABEL={globe:'RADAR GLOBE',lattice:'NEURAL LATTICE',bloch:'QUANTUM BLOCH',eeg:'EEG WAVE 3D',jet:'MIG-21 / SU-27 INTERCEPTOR',tank:'T-72 / T-34 ARMOR',sub:'TYPHOON / AKULA SUB',ak:'AK-47 ARSENAL'};

  /* ---------- showcase ---------- */
  function Showcase(cv){
    var ctx=cv.getContext('2d'),W=1,H=1,dpr=Math.min(window.devicePixelRatio||1,2);
    var VIEW={globe:[.6,.32],lattice:[.55,.28],bloch:[.6,.3],eeg:[.42,.5],jet:[.75,-.34],tank:[.72,-.36],sub:[.78,-.26],ak:[.3,-.14]},OSC={lattice:1,eeg:1,ak:1};
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
    /* ================= FLEET & ARSENAL — shaded 3D mesh kit (painter's algorithm, Newell normals) ================= */
    var PI=Math.PI;
    function rx(p,a){var c1=Math.cos(a),s1=Math.sin(a);return [p[0],p[1]*c1-p[2]*s1,p[1]*s1+p[2]*c1]}
    function ry(p,a){var c1=Math.cos(a),s1=Math.sin(a);return [p[0]*c1+p[2]*s1,p[1],-p[0]*s1+p[2]*c1]}
    function rz(p,a){var c1=Math.cos(a),s1=Math.sin(a);return [p[0]*c1-p[1]*s1,p[0]*s1+p[1]*c1,p[2]]}
    function M(){return {v:[],f:[]}}
    function addV(m,p){m.v.push(p);return m.v.length-1}
    function lathe(m,prof,seg,axis,o,k,mat){o=o||[0,0,0];k=k||[1,1];var rings=[];
      prof.forEach(function(pr){var ring=[];for(var i=0;i<seg;i++){var th=i/seg*PI*2,u=Math.cos(th)*pr[1]*k[0],w=Math.sin(th)*pr[1]*k[1];
        var p=axis==='x'?[pr[0],u,w]:axis==='y'?[u,pr[0],w]:[u,w,pr[0]];ring.push(addV(m,[p[0]+o[0],p[1]+o[1],p[2]+o[2]]))}rings.push(ring)});
      for(var r=0;r<rings.length-1;r++)for(var i=0;i<seg;i++){var j=(i+1)%seg;m.f.push({i:[rings[r][i],rings[r][j],rings[r+1][j],rings[r+1][i]],m:typeof mat==='function'?mat(r):mat})}
      return m}
    function extrude(m,pts,plane,d0,d1,mat,xf){var a=[],b=[];
      pts.forEach(function(q){var p0=plane==='xy'?[q[0],q[1],d0]:[q[0],d0,q[1]],p1=plane==='xy'?[q[0],q[1],d1]:[q[0],d1,q[1]];if(xf){p0=xf(p0);p1=xf(p1)}a.push(addV(m,p0));b.push(addV(m,p1))});
      var n=pts.length;m.f.push({i:a.slice(),m:mat});m.f.push({i:b.slice().reverse(),m:mat});
      for(var i=0;i<n;i++){var j=(i+1)%n;m.f.push({i:[a[i],a[j],b[j],b[i]],m:mat})}return m}
    function boxR(m,c,s,mat,az,ay){var hx=s[0]/2,hy=s[1]/2;return extrude(m,[[-hx,-hy],[hx,-hy],[hx,hy],[-hx,hy]],'xy',-s[2]/2,s[2]/2,mat,function(p){var q=p;if(az)q=rz(q,az);if(ay)q=ry(q,ay);return [q[0]+c[0],q[1]+c[1],q[2]+c[2]]})}
    function starPts(r){var a=[];for(var i=0;i<10;i++){var t=-PI/2+i*PI/5,rr=i%2?r*.42:r;a.push([Math.cos(t)*rr,-Math.sin(t)*rr])}return a}
    // flat star; map(u,v)->3D point; n = outward normal (model space) for back-face culling
    function star(m,r,map,n,mat){m.f.push({i:starPts(r).map(function(q){return addV(m,map(q[0],q[1]))}),m:mat||'accent',n:n})}
    function V(p){var x=p[0],y=p[1],z=p[2];var X=x*cy_+z*sy_, Z=-x*sy_+z*cy_; var Y=y*cp_-Z*sp_; Z=y*sp_+Z*cp_; return [X,Y,Z]}
    function PV(v){var f=3.4/(3.4+v[2]);return [CX+v[0]*S*f, CY-v[1]*S*f, v[2], f]}
    function PW(p){return PV(V(p))}
    var LG=(function(){var l=[-.38,.78,-.5],n=Math.hypot(l[0],l[1],l[2]);return [l[0]/n,l[1]/n,l[2]/n]})();
    function rgbOf(k){var p=PAL[k].split(',');return [+p[0],+p[1],+p[2]]}
    function matRGB(mm){var L=PAL.light;switch(mm){
      case 'hull':return L?[96,112,48]:[124,142,70];case 'hull2':return L?[74,86,38]:[92,106,52];case 'dark':return L?[60,62,58]:[52,54,50];
      case 'metal':return L?[120,126,130]:[132,138,142];case 'gun':return L?[78,82,86]:[88,92,96];case 'glass':var g=rgbOf('cyan');return [g[0]*.8,g[1]*.8,g[2]*.8];
      case 'accent':return rgbOf('red');case 'era':return L?[124,52,44]:[122,48,40];case 'glow':return rgbOf('yellow');case 'wood':return [156,88,40];case 'brass':return [210,164,72];default:return [128,128,128]}}
    function drawParts(parts){var faces=[];
      parts.forEach(function(pt){var T=pt.T,m=pt.m,vv=new Array(m.v.length);for(var i=0;i<m.v.length;i++)vv[i]=V(T(m.v[i]));
        m.f.forEach(function(f){var n=f.i.length,cx=0,cy=0,cz=0,k;for(k=0;k<n;k++){var q=vv[f.i[k]];cx+=q[0];cy+=q[1];cz+=q[2]}cx/=n;cy/=n;cz/=n;
          if(f.n){var o=m.v[f.i[0]],a0=V(T(o)),a1=V(T([o[0]+f.n[0],o[1]+f.n[1],o[2]+f.n[2]]));if((a1[0]-a0[0])*cx+(a1[1]-a0[1])*cy+(a1[2]-a0[2])*(cz+3.4)>0)return}
          faces.push({q:f.i.map(function(ix){return vv[ix]}),z:cz+(f.n?-.004:0),m:f.m,a:pt.a==null?1:pt.a})})});
      faces.sort(function(a,b){return b.z-a.z});
      var light=PAL.light;ctx.lineJoin='round';
      for(var fi=0;fi<faces.length;fi++){var F=faces[fi],q=F.q,n=q.length,nx=0,ny=0,nz=0;
        for(var k=0;k<n;k++){var a=q[k],b=q[(k+1)%n];nx+=(a[1]-b[1])*(a[2]+b[2]);ny+=(a[2]-b[2])*(a[0]+b[0]);nz+=(a[0]-b[0])*(a[1]+b[1])}
        var len=Math.hypot(nx,ny,nz);if(len<1e-9)continue;
        var lam=Math.abs(nx*LG[0]+ny*LG[1]+nz*LG[2])/len,col=matRGB(F.m),glow=F.m==='glow'||F.m==='accent';
        var s=glow?1:(.3+.85*lam),fog=Math.max(.55,Math.min(1,.9-F.z*.12));s*=fog;
        ctx.beginPath();var p0=PV(q[0]);ctx.moveTo(p0[0],p0[1]);for(k=1;k<n;k++){var pp=PV(q[k]);ctx.lineTo(pp[0],pp[1])}ctx.closePath();
        ctx.fillStyle='rgba('+Math.min(255,col[0]*s|0)+','+Math.min(255,col[1]*s|0)+','+Math.min(255,col[2]*s|0)+','+F.a+')';ctx.fill();
        if(light)ctx.strokeStyle='rgba('+(col[0]*.45|0)+','+(col[1]*.45|0)+','+(col[2]*.45|0)+','+(.5*F.a)+')';
        else ctx.strokeStyle='rgba('+Math.min(255,col[0]*1.6|0)+','+Math.min(255,col[1]*1.6|0)+','+Math.min(255,col[2]*1.6|0)+','+(.32*F.a)+')';
        ctx.lineWidth=.7;ctx.stroke()}
    }
    function W3(p,col,a,w){/* polyline in world space */ctx.lineWidth=w||1;ctx.strokeStyle=c(col,a);ctx.beginPath();for(var i=0;i<p.length;i++){var q=PW(p[i]);if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1])}ctx.stroke()}
    function vscale(){return W<520?.6:W<820?.74:.84}
    function ease(u){return u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2}

    /* ---------- MiG-21 / Su-27 interceptor ---------- */
    var JET=(function(){var body=M(),flame=M();
      lathe(body,[[1.98,0],[1.86,.035],[1.74,.07],[1.62,.095]],14,'x',[0,.02,0],[1,1],'dark');
      lathe(body,[[1.62,.095],[1.35,.13],[1.0,.16],[.6,.18],[.1,.19],[-.5,.18],[-1.0,.15],[-1.3,.12]],14,'x',[0,.02,0],[.95,1.05],'hull');
      lathe(body,[[1.2,0],[1.1,.05],[.9,.085],[.65,.08],[.45,0]],12,'x',[0,.17,0],[.9,.75],'glass');
      [-1,1].forEach(function(s){
        lathe(body,[[.55,0],[.5,.09],[.25,.125],[-1.25,.125],[-1.5,.112]],12,'x',[0,-.07,.2*s],[1,1],'hull');
        lathe(body,[[-1.5,.112],[-1.64,.1],[-1.64,.072],[-1.55,.06]],12,'x',[0,-.07,.2*s],[1,1],'metal');
        boxR(body,[.38,-.17,.2*s],[.3,.1,.2],'dark');
        extrude(body,[[.95,.14*s],[.45,.3*s],[-.62,1.12*s],[-.86,1.12*s],[-.95,.18*s]],'xz',-.018,.018,'hull');
        extrude(body,[[-1.15,.28*s],[-1.5,.78*s],[-1.68,.78*s],[-1.62,.28*s]],'xz',-.085,-.055,'hull');
        var a=.22*s,cant=function(p){var q=rx([p[0],p[1],0],a);return [q[0],q[1]+.08,q[2]+p[2]+.24*s]};
        extrude(body,[[-.7,.12],[-1.2,.74],[-1.4,.74],[-1.46,.12]],'xy',-.012,.012,'hull',cant);
        var fn=[0,-Math.sin(a)*s,Math.cos(a)*s];
        star(body,.1,function(u,v){var q=cant([-1.2+u,.42+v,0]);return [q[0]+fn[0]*.02,q[1]+fn[1]*.02,q[2]+fn[2]*.02]},fn);
        star(body,.09,function(u,v){return [-.5+v,.03,.78*s+u]},[0,1,0]);
        star(body,.09,function(u,v){return [-.5+v,-.03,.78*s+u]},[0,-1,0]);
        lathe(body,[[.24,0],[.18,.025],[-.5,.025],[-.56,0]],8,'x',[0,-.07,.74*s],[1,1],'metal');
        lathe(body,[[.31,0],[.24,.018],[.2,.026]],8,'x',[0,-.07,.74*s],[1,1],'accent');
        lathe(flame,[[-1.62,.075],[-1.85,.06],[-2.3,0]],10,'x',[0,-.07,.2*s],[1,1],'glow');
      });
      return {body:body,flame:flame,hs:[
        {k:'N001 RADAR',d:'Pulse-Doppler radome · look-down/shoot-down search',p:[1.9,.02,0]},
        {k:'COCKPIT',d:'Bubble canopy · K-36 zero-zero ejection seat',p:[.85,.27,0]},
        {k:'SWEPT WING',d:'Blended swept wing + LERX · +9 g airframe',p:[-.45,.03,.95]},
        {k:'AL-31F AFTERBURNER',d:'Twin afterburning turbofans · Mach 2.35 dash',p:[-1.64,-.07,.2]},
        {k:'TWIN FINS',d:'Canted twin vertical stabilisers · red-star roundels',p:[-1.25,.66,.34]},
        {k:'R-73 MISSILE',d:'Wingtip-rail short-range air-to-air missile',p:[-.1,-.07,.74]}]}})();
    var jetTrail=[];
    function jetG(t){var J=VS.jet,sc=vscale(),roll=.42*Math.sin(t*.7)+J.roll,pit=.07*Math.sin(t*.5),hv=.06*Math.sin(t*1.1);
      return function(p){var q=[p[0]*sc,p[1]*sc,p[2]*sc];q=rx(q,roll);q=rz(q,pit);q[1]+=hv;return q}}
    function jet(t){var J=VS.jet;
      if(J.r0!=null){var u=(t-J.r0)/1.5;if(u>=1){J.roll=0;J.r0=null}else J.roll=2*PI*ease(u)}
      var G=jetG(t),sc=vscale();
      for(var i=0;i<22;i++){var z=((i*37)%23)/23*3.4-1.7,y=((i*53)%19)/19*2.2-1.1,x=2.6-((t*2.2+i*.61)%5.2);W3([[x,y,z],[x+.38,y,z]],'cyan',.18,1)}
      if(!RM){[[-.74,0,1.12],[-.74,0,-1.12],[-1.64,-.07,.2],[-1.64,-.07,-.2]].forEach(function(p,i){jetTrail.push({p:G(p),l:1,w:i<2?1:2.2})})}
      for(i=jetTrail.length-1;i>=0;i--){var e=jetTrail[i];e.p[0]-=.05;e.l-=.022;if(e.l<=0){jetTrail.splice(i,1);continue}var q=PW(e.p);ctx.fillStyle=c(e.w>2?'yellow':'ink',e.l*(e.w>2?.35:.22));ctx.fillRect(q[0]-e.w/2,q[1]-e.w/2,e.w,e.w)}
      var fk=.75+.35*Math.random(),FT=function(p){var e=-1.62;return G([e+(p[0]-e)*fk,p[1],p[2]])};
      drawParts([{m:JET.body,T:G},{m:JET.flame,T:FT,a:PAL.light?.55:.7}]);
      [-1,1].forEach(function(s){[.06,.09].forEach(function(r,j){var ring=[];for(var k=0;k<=20;k++){var a=k/20*PI*2;ring.push(G([-1.65-j*.05,-.07+Math.cos(a)*r,.2*s+Math.sin(a)*r]))}W3(ring,j?'red':'yellow',.55+.35*Math.random(),1.4)})});
      return G}

    /* ---------- T-72 / T-34 main battle tank ---------- */
    var TANK=(function(){var hull=M(),tur=M(),gun=M(),tp=[];
      for(var i=0;i<=8;i++){var a=-PI/2+i*PI/8;tp.push([1.0+Math.cos(a)*.19,-.24+Math.sin(a)*.19])}
      for(i=0;i<=8;i++){a=PI/2+i*PI/8;tp.push([-1.0+Math.cos(a)*.19,-.24+Math.sin(a)*.19])}
      extrude(hull,[[-1.12,.1],[.62,.1],[1.18,-.08],[1.08,-.2],[-1.05,-.2],[-1.14,-.02]],'xy',-.48,.48,'hull');
      [-1,1].forEach(function(s){
        boxR(hull,[0,.115,.6*s],[2.3,.03,.24],'hull2');
        extrude(hull,tp,'xy',.5*s,.7*s,'dark');
        for(var w=0;w<6;w++)lathe(hull,[[.72*s,0],[.72*s,.13],[.66*s,.13]],12,'z',[-.8+w*.32,-.27,0],[1,1],'metal');
        lathe(hull,[[.74*s,0],[.74*s,.045]],8,'z',[-.8,-.27,0],[1,1],'gun');
        lathe(hull,[[.72*s,0],[.72*s,.15],[.66*s,.15]],10,'z',[-1.0,-.22,0],[1,1],'gun');
        lathe(hull,[[.72*s,0],[.72*s,.13],[.66*s,.13]],10,'z',[1.0,-.22,0],[1,1],'gun');
        lathe(hull,[[.1*s,0],[.1*s,.09],[.46*s,.09],[.46*s,0]],10,'z',[-1.2,.03,0],[1,1],'hull2');
        star(tur,.075,function(u,v){return [-.18+u,.24+v,.5*s]},[0,0,s]);
      });
      lathe(hull,[[-.46,0],[-.46,.05],[.46,.05],[.46,0]],10,'z',[-1.08,.16,0],[1,1],'wood');
      var gd=[.952,-.306],gn=[.306,.952];
      [.12,.3,.46].forEach(function(L){[-.36,-.18,0,.18,.36].forEach(function(z){boxR(hull,[.62+gd[0]*L+gn[0]*.025,.1+gd[1]*L+gn[1]*.025,z],[.15,.04,.14],'era',-.31)})});
      lathe(tur,[[0,.56],[.1,.55],[.2,.47],[.27,.34],[.31,.16],[.32,0]],16,'y',[-.12,.1,0],[1.08,.95],'hull');
      [-.78,-.5,.5,.78].forEach(function(a){boxR(tur,[-.12+Math.cos(a)*.6,.2,-Math.sin(a)*.53],[.06,.11,.14],'era',0,a)});
      lathe(tur,[[0,.1],[.06,.095],[.09,0]],10,'y',[-.3,.41,.2],[1,1],'metal');
      boxR(tur,[-.1,.52,.2],[.34,.025,.025],'gun');
      [-1,1].forEach(function(s){for(var k=0;k<3;k++)lathe(tur,[[.06,0],[.06,.022],[-.08,.022]],6,'x',[.1+k*.03,.28+k*.035,.42*s],[1,1],'gun')});
      lathe(gun,[[.16,0],[.2,.1],[.36,.1],[.4,.06]],10,'x',[0,.32,0],[1,1.3],'hull2');
      lathe(gun,[[.4,.05],[1.05,.045],[1.08,.07],[1.32,.07],[1.35,.045],[2.05,.04],[2.08,.05],[2.12,0]],10,'x',[0,.32,0],[1,1],'gun');
      var per=[],tot=0;for(i=0;i<tp.length;i++){var A=tp[i],B=tp[(i+1)%tp.length],l=Math.hypot(B[0]-A[0],B[1]-A[1]);per.push([A,B,tot,l]);tot+=l}
      return {hull:hull,tur:tur,gun:gun,per:per,tot:tot,tgt:[2.9,.3,-1.95],hs:[
        {k:'2A46M 125 MM GUN',d:'Smoothbore main gun · fume extractor · autoloader',p:[2.1,.32,0],part:'gun'},
        {k:'CAST TURRET',d:'Cast-steel turret with Kontakt-1 ERA bricks',p:[-.12,.44,0],part:'tur'},
        {k:'SLOPED GLACIS',d:'Laminate armour upper glacis · reactive tiles',p:[.92,.04,0]},
        {k:'RUNNING GEAR',d:'Six road wheels per side · 60 km/h on road',p:[-.32,-.27,.73]},
        {k:'V-46 DIESEL',d:'V-12 multi-fuel diesel · 780 hp · rear deck',p:[-.85,.12,0]}]}})();
    function trackPt(u){var T=TANK,d=((u%1)+1)%1*T.tot;for(var i=0;i<T.per.length;i++){var s=T.per[i];if(d<=s[2]+s[3]){var f=(d-s[2])/s[3];return [s[0][0]+(s[1][0]-s[0][0])*f,s[0][1]+(s[1][1]-s[0][1])*f]}}return T.per[0][0]}
    function tank(t){var K=VS.tank,sc=vscale(),bob=.008*Math.sin(t*9),rock=.012*Math.sin(t*1.3);
      var G=function(p){var q=[p[0]*sc,p[1]*sc,p[2]*sc];q=rz(q,rock);q[1]+=bob-.05;return q};
      var bt=Math.atan2(-TANK.tgt[2],TANK.tgt[0]);
      if(t>K.manualUntil)K.aim=.95*Math.sin(t*.32)+.1;
      K.tur+=(K.aim-K.tur)*.045;var elev=.04+.03*Math.sin(t*.7);
      var TC=[-.12,0,0],TT=function(p){var q=ry([p[0]-TC[0],p[1],p[2]],K.tur);return G([q[0]+TC[0],q[1],q[2]])};
      var GT=function(p){var q=rz([p[0]-.3,p[1]-.32,p[2]],elev);return TT([q[0]+.3,q[1]+.32,q[2]])};
      K.T={tur:TT,gun:GT};
      var gy=-.47*sc,off=(t*.9)%.4;for(var gx=-2.8;gx<=2.8;gx+=.4){var x=gx-off;W3([[x,gy,-1.8],[x,gy,1.8]],'olive',.22,1)}
      for(var gz=-1.8;gz<=1.8;gz+=.45)W3([[-2.8,gy,gz],[2.8,gy,gz]],'olive',.16,1);
      var sh=[];for(var k=0;k<=24;k++){var a=k/24*PI*2;sh.push(PW([Math.cos(a)*1.35*sc,gy,Math.sin(a)*.8*sc]))}ctx.fillStyle=c('ink',PAL.light?.08:.05);ctx.beginPath();sh.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.fill();
      drawParts([{m:TANK.hull,T:G},{m:TANK.tur,T:TT},{m:TANK.gun,T:GT}]);
      [-1,1].forEach(function(s){var nv=V(G([0,0,s])),n0=V(G([0,0,0]));if((nv[2]-n0[2])>0)return;
        for(var i=0;i<46;i++){var p=trackPt(i/46-t*.11);var a=PW(G([p[0],p[1],.5*s])),b=PW(G([p[0],p[1],.7*s]));ctx.strokeStyle=c('mute',.55);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}});
      var tg=G(TANK.tgt),tp=PW(tg),locked=Math.abs(K.tur-bt)<.07,mz=PW(GT([2.12,.32,0]));
      if(locked&&!K.locked&&window.RAAudio)window.RAAudio.sfx('lock');K.locked=locked;
      var rr=locked?16:24+4*Math.sin(t*4),col=locked?'red':'cyan';ctx.strokeStyle=c(col,.95);ctx.lineWidth=1.6;
      for(var q=0;q<4;q++){var an=q*PI/2+(locked?0:t*.8);ctx.save();ctx.translate(tp[0],tp[1]);ctx.rotate(an);ctx.beginPath();ctx.moveTo(rr,-rr+7);ctx.lineTo(rr,-rr);ctx.lineTo(rr-7,-rr);ctx.stroke();ctx.restore()}
      ctx.fillStyle=c(col,.95);ctx.beginPath();ctx.moveTo(tp[0],tp[1]-4);ctx.lineTo(tp[0]+4,tp[1]);ctx.lineTo(tp[0],tp[1]+4);ctx.lineTo(tp[0]-4,tp[1]);ctx.fill();
      ctx.font='700 10.5px "JetBrains Mono",monospace';var lt=locked?'TARGET LOCKED':'CONTACT · BRG '+((bt*57.3+360)%360).toFixed(0)+'°',tw=ctx.measureText(lt).width;ctx.fillText(lt,tp[0]+tw+30>W?tp[0]-tw-28:tp[0]+28,tp[1]+4);
      if(locked){ctx.setLineDash([5,5]);ctx.strokeStyle=c('red',.7);ctx.beginPath();ctx.moveTo(mz[0],mz[1]);ctx.lineTo(tp[0],tp[1]);ctx.stroke();ctx.setLineDash([])}
      return G}

    /* ---------- Typhoon / Akula strategic submarine ---------- */
    var SUB=(function(){var hull=M(),inner=M(),sail=M(),fins=M(),pL=M(),pR=M();
      lathe(hull,[[2.0,0],[1.96,.13],[1.86,.24],[1.68,.33],[1.4,.385],[.9,.4],[-.5,.4],[-1.0,.37],[-1.4,.29],[-1.72,.2],[-1.92,.12],[-1.98,0]],18,'x',[0,0,0],[.82,1.35],function(r){return r<2?'dark':'hull'});
      [-1,1].forEach(function(s){lathe(inner,[[1.3,0],[1.2,.17],[.9,.23],[-1.0,.23],[-1.25,.16],[-1.35,0]],12,'x',[0,-.02,.24*s],[1,1],'glass')});
      extrude(sail,[[.95,.3],[.86,.6],[.6,.7],[.18,.7],[.02,.6],[-.05,.3]],'xy',-.1,.1,'hull');
      boxR(sail,[.52,.78,0],[.025,.18,.025],'metal');boxR(sail,[.36,.76,0],[.03,.14,.03],'metal');boxR(sail,[.24,.75,0],[.02,.12,.02],'metal');
      for(var i=0;i<5;i++)[-1,1].forEach(function(s){var x=1.06+i*.12,z=.12*s;hull.f.push({i:[addV(hull,[x-.04,.335,z-.04]),addV(hull,[x+.04,.335,z-.04]),addV(hull,[x+.04,.335,z+.04]),addV(hull,[x-.04,.335,z+.04])],m:'era',n:[0,1,0]})});
      [-1,1].forEach(function(s){
        extrude(fins,[[1.42,.5*s],[1.3,.84*s],[1.12,.84*s],[1.1,.5*s]],'xz',-.012,.012,'hull2');
        extrude(fins,[[-1.4,.25*s],[-1.68,.7*s],[-1.88,.7*s],[-1.86,.25*s]],'xz',-.012,.012,'hull2');
        lathe(fins,[[-1.86,.15],[-2.06,.15],[-2.06,.125],[-1.86,.125],[-1.86,.15]],14,'x',[0,-.02,.26*s],[1,1],'metal');
        star(sail,.08,function(u,v){return [.45+u,.5+v,.102*s]},[0,0,s]);
        var P=s<0?pL:pR;lathe(P,[[-1.9,0],[-1.93,.025],[-2.0,.02],[-2.02,0]],8,'x',[0,-.02,.26*s],[1,1],'gun');
        for(var b=0;b<7;b++){var th=b/7*PI*2,pts=[[.025,th-.12],[.12,th-.3],[.12,th+.18],[.025,th+.12]];P.f.push({i:pts.map(function(q,j){return addV(P,[-1.96+(j<2?-.015:.015),-.02+Math.cos(q[1])*q[0],.26*s+Math.sin(q[1])*q[0]])}),m:'metal'})}
      });
      extrude(fins,[[-1.4,.2],[-1.7,.6],[-1.9,.6],[-1.88,.2]],'xy',-.012,.012,'hull2');
      extrude(fins,[[-1.5,-.2],[-1.72,-.46],[-1.88,-.46],[-1.88,-.2]],'xy',-.012,.012,'hull2');
      return {hull:hull,inner:inner,sail:sail,fins:fins,pL:pL,pR:pR,contact:[3.1,.1,1.5],hs:[
        {k:'REINFORCED SAIL',d:'Ice-breaking sail · periscopes & masts',p:[.45,.72,0]},
        {k:'BOW SONAR',d:'Skat-class active/passive sonar array',p:[1.98,0,0]},
        {k:'MISSILE TUBES',d:'20 SLBM tubes forward of the sail',p:[1.3,.34,0]},
        {k:'DOUBLE HULL',d:'Twin pressure hulls inside a light outer hull',p:[-.4,.0,.42]},
        {k:'TWIN PROPULSORS',d:'Two shrouded 7-blade screws · twin reactors',p:[-1.96,-.02,.26]}]}})();
    var bubbles=[];
    function sub(t){var B=VS.sub,sc=vscale(),pit=.04*Math.sin(t*.4),rl=.03*Math.sin(t*.55),hv=.04*Math.sin(t*.8);
      var G=function(p){var q=[p[0]*sc,p[1]*sc,p[2]*sc];q=rx(q,rl);q=rz(q,pit);q[1]+=hv;return q};
      for(var gz=-1.6;gz<=1.6;gz+=.4){var s=[];for(var gx=-2.8;gx<=2.8;gx+=.2)s.push([gx,1.08+.035*Math.sin(gx*2.4+t*1.6+gz),gz]);W3(s,'cyan',.16,1)}
      for(gz=-1.6;gz<=1.6;gz+=.4)W3([[-2.8,-1.0,gz],[2.8,-1.0,gz]],'olive',.18,1);for(gx=-2.8;gx<=2.8;gx+=.4)W3([[gx,-1.0,-1.6],[gx,-1.0,1.6]],'olive',.12,1);
      if(!RM&&t-B.last>3.2){B.pings.push({t0:t,big:false});B.last=t}
      var bow=G([2.0,0,0]),hit=false;
      for(var i=B.pings.length-1;i>=0;i--){var P=B.pings[i],age=t-P.t0,R=age*(P.big?1.9:1.35),al=Math.max(0,1-age/(P.big?3:2.4));if(al<=0){B.pings.splice(i,1);continue}
        var ring=[],ring2=[];for(var k=0;k<=48;k++){var a=k/48*PI*2;ring.push([bow[0]+Math.cos(a)*R,bow[1],bow[2]+Math.sin(a)*R]);ring2.push([bow[0]+R*.55,bow[1]+Math.cos(a)*R*.7,bow[2]+Math.sin(a)*R*.7])}
        W3(ring,'cyan',al*.18,5);W3(ring,'cyan',al*.85,1.6);W3(ring2,'cyan',al*.5,1.2);
        var dc=Math.hypot(SUB.contact[0]-bow[0],SUB.contact[2]-bow[2]);if(Math.abs(R-dc)<.25)B.hitT=t}
      var pr=t*7;drawParts([{m:SUB.inner,T:G,a:.55},{m:SUB.hull,T:G,a:PAL.light?.7:.62},{m:SUB.sail,T:G},{m:SUB.fins,T:G},
        {m:SUB.pL,T:function(p){var q=rx([p[0],p[1]+.02,p[2]+.26],pr);return G([q[0],q[1]-.02,q[2]-.26])}},
        {m:SUB.pR,T:function(p){var q=rx([p[0],p[1]+.02,p[2]-.26],-pr);return G([q[0],q[1]-.02,q[2]+.26])}}]);
      if(!RM&&Math.random()<.5)[-1,1].forEach(function(s){bubbles.push({p:G([-2.06,-.02+(Math.random()-.5)*.1,.26*s+(Math.random()-.5)*.1]),l:1})});
      for(i=bubbles.length-1;i>=0;i--){var e=bubbles[i];e.p[0]-=.012;e.p[1]+=.006;e.l-=.012;if(e.l<=0){bubbles.splice(i,1);continue}var q=PW(e.p);ctx.strokeStyle=c('cyan',e.l*.5);ctx.lineWidth=1;ctx.beginPath();ctx.arc(q[0],q[1],1.5+2*(1-e.l),0,7);ctx.stroke()}
      var cp=PW(SUB.contact),lit=B.hitT!=null&&t-B.hitT<1.6,ca=lit?1-(t-B.hitT)/1.6:0;
      ctx.fillStyle=c('red',.35+ca*.65);ctx.beginPath();ctx.arc(cp[0],cp[1],3+ca*3,0,7);ctx.fill();
      if(lit){ctx.strokeStyle=c('red',ca);ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(cp[0],cp[1],8+(1-ca)*14,0,7);ctx.stroke()}
      ctx.font='700 10.5px "JetBrains Mono",monospace';ctx.fillStyle=c(lit?'red':'mute',lit?.95:.7);var lt=lit?'SONAR CONTACT · 3.4 KM':'PASSIVE TRACK',tw=ctx.measureText(lt).width;ctx.fillText(lt,cp[0]+tw+14>W?cp[0]-tw-12:cp[0]+12,cp[1]+4);
      return G}

    /* ---------- AK-47 assault rifle ---------- */
    var AK=(function(){var gun=M(),bolt=M(),mag=[];
      extrude(gun,[[-.55,.12],[.6,.12],[.62,.06],[.6,-.04],[.15,-.08],[-.55,-.08]],'xy',-.065,.065,'metal');
      lathe(gun,[[-.5,0],[-.5,.062],[.55,.062],[.58,0]],12,'x',[0,.12,0],[.55,1],'metal');
      boxR(gun,[.67,.15,0],[.12,.06,.05],'gun');boxR(gun,[1.12,.13,0],[.07,.09,.055],'gun');
      lathe(gun,[[.6,.032],[1.62,.028],[1.62,.038],[1.76,.038],[1.79,0]],10,'x',[0,.05,0],[1,1],'gun');
      lathe(gun,[[.7,0],[.7,.045],[1.0,.045],[1.0,.025],[1.16,.025],[1.16,0]],10,'x',[0,.135,0],[.85,1],function(r){return r<2?'wood':'gun'});
      extrude(gun,[[.62,.08],[1.02,.08],[1.04,.04],[1.0,-.035],[.64,-.045]],'xy',-.06,.06,'wood');
      extrude(gun,[[1.5,.07],[1.58,.07],[1.57,.2],[1.53,.2]],'xy',-.018,.018,'gun');
      extrude(gun,[[-.32,-.06],[-.16,-.06],[-.22,-.42],[-.38,-.4]],'xy',-.05,.05,'wood');
      boxR(gun,[-.02,-.17,0],[.25,.018,.03],'gun',.35);boxR(gun,[.1,-.11,0],[.02,.08,.03],'gun');boxR(gun,[-.05,-.12,0],[.018,.08,.02],'gun',.3);
      for(var s=0;s<=8;s++){var u=s/8;mag.push([.2+.3*u*u,-.08-.62*u])}
      extrude(gun,mag.map(function(q){return [q[0]-.075,q[1]]}).concat(mag.slice().reverse().map(function(q,i){return [q[0]+.1+.02*(1-i/8),q[1]]})),'xy',-.045,.045,'gun');
      extrude(gun,[[-.55,.1],[-1.36,.02],[-1.42,-.02],[-1.42,-.3],[-1.34,-.3],[-.55,-.07]],'xy',-.055,.055,'wood');
      extrude(gun,[[-1.42,.02],[-1.47,.02],[-1.47,-.31],[-1.42,-.31]],'xy',-.06,.06,'gun');
      extrude(gun,[[-.1,.06],[.35,.06],[.35,.03],[-.1,.04]],'xy',.066,.074,'gun');
      [-1,1].forEach(function(s){star(gun,.075,function(u,v){return [-1.0+u,-.1+v,.058*s]},[0,0,s])});
      boxR(bolt,[.38,.07,.095],[.07,.035,.05],'metal');
      return {gun:gun,bolt:bolt,hs:[
        {k:'MUZZLE',d:'7.62×39 mm · ~715 m/s muzzle velocity',p:[1.78,.05,0]},
        {k:'GAS SYSTEM',d:'Long-stroke gas piston · ~600 rounds/min cyclic',p:[1.1,.14,0]},
        {k:'CURVED MAGAZINE',d:'30-round steel box magazine',p:[.42,-.62,0]},
        {k:'RECEIVER',d:'Kalashnikov 1947 design · charging handle right side',p:[.38,.07,.1],part:'bolt'},
        {k:'WOODEN STOCK',d:'Hardwood stock & furniture · ~350 m effective range',p:[-1.0,-.1,.06]}]}})();
    var casings=[];
    function ak(t){var A=VS.ak,sc=vscale()*1.05,tl=.12*Math.sin(t*.5),hv=.03*Math.sin(t*.9);
      var G=function(p){var q=[(p[0]-.15)*sc,p[1]*sc+.08,p[2]*sc];q=rx(q,tl);q[1]+=hv;return q};
      var bo=0;if(A.b0!=null){var u=(t-A.b0)/.55;if(u>=1)A.b0=null;else bo=.2*Math.sin(PI*Math.min(1,u*1.3))}
      var BT=function(p){return G([p[0]-bo,p[1],p[2]])};A.T={bolt:BT};
      var gy=-.62,sh=[];for(var k=0;k<=24;k++){var a=k/24*PI*2;sh.push(PW([Math.cos(a)*1.6*sc,gy,Math.sin(a)*.35*sc]))}ctx.fillStyle=c('ink',PAL.light?.08:.05);ctx.beginPath();sh.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.fill();
      for(var gx=-2.4;gx<=2.4;gx+=.4)W3([[gx,gy,-1.2],[gx,gy,1.2]],'olive',.14,1);
      drawParts([{m:AK.gun,T:G},{m:AK.bolt,T:BT}]);
      for(var i=casings.length-1;i>=0;i--){var e=casings[i];e.v[1]-=.006;e.p[0]+=e.v[0];e.p[1]+=e.v[1];e.p[2]+=e.v[2];e.l-=.012;if(e.l<=0||e.p[1]<gy){casings.splice(i,1);continue}
        var a1=PW(e.p),a2=PW([e.p[0]+.05*Math.cos(e.l*20),e.p[1]+.02,e.p[2]+.05*Math.sin(e.l*20)]);ctx.strokeStyle='rgba(210,164,72,'+Math.min(1,e.l*1.5)+')';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a1[0],a1[1]);ctx.lineTo(a2[0],a2[1]);ctx.stroke()}
      return G}

    var VS={jet:{roll:0,r0:null},tank:{tur:0,aim:0,manualUntil:-1,locked:false},sub:{pings:[],last:-9,hitT:null},ak:{b0:null}};
    var VEH={jet:{draw:jet,def:JET,act:'Barrel Roll'},tank:{draw:tank,def:TANK,act:'Rotate Turret'},sub:{draw:sub,def:SUB,act:'Sonar Ping'},ak:{draw:ak,def:AK,act:'Chamber Round'}};
    function vAction(){var m=st.mode,t=st.t,au=window.RAAudio;
      if(m==='jet'){if(VS.jet.r0==null)VS.jet.r0=t;if(au)au.sfx('whoosh')}
      else if(m==='tank'){VS.tank.manualUntil=t+6;VS.tank.aim=VS.tank.tur+PI/4;if(VS.tank.aim>1.4)VS.tank.aim-=2.4;if(au)au.sfx('servo')}
      else if(m==='sub'){VS.sub.pings.push({t0:t,big:true});if(au)au.sfx('ping')}
      else if(m==='ak'){if(VS.ak.b0==null){VS.ak.b0=t;var g=lastG||function(p){return p};casings.push({p:g([.3,.13,.07]),v:[.006,.03,.022],l:1})}if(au)au.sfx('bolt')}
      kick()}
    var lastG=null,HS=[],lock=null;
    function telemetry(t){var m=st.mode,hd=((st.yaw*57.3%360+360)%360).toFixed(0),L=[];
      if(m==='jet')L=['HDG '+hd+'°','ALT '+(11200+520*Math.sin(t*.3)).toFixed(0)+' M','MACH '+(1.9+.28*Math.sin(t*.4)).toFixed(2),'BANK '+((.42*Math.sin(t*.7)+VS.jet.roll)*57.3%360).toFixed(0)+'°'];
      else if(m==='tank')L=['HDG '+hd+'°','SPD '+(54+5*Math.sin(t*.5)).toFixed(0)+' KM/H','TURRET '+((VS.tank.tur*57.3+360)%360).toFixed(0)+'°','ARMOR ERA · '+(VS.tank.locked?'LOCKED':'SEARCH')];
      else if(m==='sub')L=['HDG '+hd+'°','DEPTH '+(380+14*Math.sin(t*.25)).toFixed(0)+' M','SPD '+(24+2*Math.sin(t*.3)).toFixed(1)+' KN','SONAR '+(VS.sub.hitT!=null&&t-VS.sub.hitT<1.6?'CONTACT':'ACTIVE')];
      else if(m==='ak')L=['CAL 7.62×39 MM','RATE 600 RPM','V0 715 M/S','MAG 30 RDS'];
      return L}
    function drawTele(L){var x=12,y=H-14-L.length*15;ctx.font='700 10.5px "JetBrains Mono",monospace';var w=0;L.forEach(function(s){w=Math.max(w,ctx.measureText(s).width)});
      ctx.fillStyle=PAL.light?'rgba(255,250,240,.78)':'rgba(10,10,10,.6)';ctx.fillRect(x-6,y-12,w+14,L.length*15+8);ctx.strokeStyle=c('red',.6);ctx.lineWidth=1;ctx.strokeRect(x-6,y-12,w+14,L.length*15+8);
      L.forEach(function(s,i){ctx.fillStyle=c(i?'ink':'red',.95);ctx.fillText(s,x,y+i*15)})}
    function hotspots(t,G){var d=VEH[st.mode].def,T0=VEH[st.mode];HS=[];var parts=(st.mode==='tank'?VS.tank.T:st.mode==='ak'?VS.ak.T:null)||{};
      d.hs.forEach(function(h){var T=h.part&&parts[h.part]?parts[h.part]:G,p=PW(T(h.p));h.sx=p[0];h.sy=p[1];HS.push({h:h,sx:p[0],sy:p[1],sz:p[2]})});
      HS.forEach(function(o){var hov=st.hover===o.h,lk=lock&&lock.h===o.h&&t-lock.t<3,r=hov||lk?7:5,pulse=RM?0:(t*1.2+o.sx*.01)%1;
        ctx.strokeStyle=c(lk?'red':'yellow',.9*(1-pulse));ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(o.sx,o.sy,r+pulse*10,0,7);ctx.stroke();
        ctx.fillStyle=c(lk?'red':'yellow',.95);ctx.beginPath();ctx.moveTo(o.sx,o.sy-r);ctx.lineTo(o.sx+r,o.sy);ctx.lineTo(o.sx,o.sy+r);ctx.lineTo(o.sx-r,o.sy);ctx.closePath();ctx.fill();
        if(lk){var rr=14+4*Math.sin(t*6);ctx.strokeStyle=c('red',.95);for(var q=0;q<4;q++){ctx.save();ctx.translate(o.sx,o.sy);ctx.rotate(q*PI/2);ctx.beginPath();ctx.moveTo(rr,-rr+6);ctx.lineTo(rr,-rr);ctx.lineTo(rr-6,-rr);ctx.stroke();ctx.restore()}}
        if(hov||lk||W>700){ctx.font=(hov||lk?'700 11.5px':'600 10px')+' "JetBrains Mono",monospace';ctx.fillStyle=c(hov||lk?'ink':'yellow',hov||lk?1:.8);var tw=ctx.measureText(o.h.k).width;ctx.fillText(o.h.k,(o.sx+r+6+tw>W-6)?o.sx-r-6-tw:o.sx+r+6,o.sy-r-2)}})}
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
    function hit(x,y){if(VEH[st.mode]){var hb=null,hd=20;HS.forEach(function(o){var d=Math.hypot(o.sx-x,o.sy-y);if(d<hd){hd=d;hb=o.h}});return hb}var best=null,bd=22;NODES.forEach(function(n){var d=Math.hypot(n.sx-x,n.sy-y);if(d<bd){bd=d;best=n}});return best}
    function frame(){
      if(!st.visible){raf=0;return}
      if(!RM)st.t+=1/60;
      if(!st.drag){st.yaw+=st.vy;st.pitch+=st.vp;st.vy*=.94;st.vp*=.94;if(!RM&&Math.abs(st.vy)<.0006){if(OSC[st.mode]){if(st.t-st.lastDrag>3){var tg=VIEW[st.mode][0]+.55*Math.sin(st.t*.22);st.yaw+=(tg-st.yaw)*.02}}else st.yaw+=.0028}}else st.lastDrag=st.t;
      st.pitch=Math.max(-1.2,Math.min(1.2,st.pitch));st.zoom+=(st.tz-st.zoom)*.15;
      prep();ctx.clearRect(0,0,W,H);
      // radar backdrop
      var rr=S*1.75;ctx.strokeStyle=c('olive',.16);ctx.lineWidth=1;for(var k=1;k<=4;k++){ctx.beginPath();ctx.arc(CX,CY,rr*k/4,0,7);ctx.stroke()}
      if(st.mode==='globe'&&!RM){var sw=st.t*1.6%(Math.PI*2);ctx.fillStyle=c('red',.07);ctx.beginPath();ctx.moveTo(CX,CY);ctx.arc(CX,CY,rr,sw-.55,sw);ctx.closePath();ctx.fill()}
      var tele=null;if(VEH[st.mode]){lastG=VEH[st.mode].draw(st.t);hotspots(st.t,lastG);tele=telemetry(st.t);drawTele(tele)}else{DRAW[st.mode](st.t);nodes(st.t)}
      if(ro)ro.textContent='MODE '+MODE_LABEL[st.mode]+(tele?' · '+tele.join(' · '):'')+' · YAW '+((st.yaw*57.3%360+360)%360).toFixed(0)+'° · PITCH '+(st.pitch*57.3).toFixed(0)+'° · ZOOM '+st.zoom.toFixed(2)+'×';
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
      if(h){showTip(h)}else tip.hidden=true});
    function showTip(h){tip.hidden=false;if(h.k){tip.innerHTML='<b>'+h.k+'</b><span>'+h.d+'</span><em>click to lock target ›</em>'}else{var cnt=(window.RA_TOPIC_COUNTS||{})[h.id];tip.innerHTML='<b>'+h.label+'</b><span>'+h.sub+'</span><em>'+(cnt!=null?cnt+' archive entries · ':'')+'click to filter ›</em>'}var tx=Math.min(h.sx+14,W-230);tip.style.transform='translate('+Math.max(4,tx)+'px,'+Math.max(4,Math.min(H-90,h.sy+12))+'px)'}
    function up(e){var wasTap=moved<6;delete ptrs[e.pointerId];if(Object.keys(ptrs).length===0)st.drag=false;pinch0=0;
      if(wasTap&&e.type==='pointerup'){var r=cv.getBoundingClientRect(),h=hit(e.clientX-r.left,e.clientY-r.top);if(h){if(h.k){lock={h:h,t:st.t};st.hover=h;showTip(h);if(window.RAAudio)window.RAAudio.sfx('lock')}else select(h.id)}}}
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    cv.addEventListener('pointerleave',function(){if(!st.drag){st.hover=null;tip.hidden=true}});
    cv.addEventListener('wheel',function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();st.tz=Math.max(.6,Math.min(2.2,st.tz*(e.deltaY>0?.92:1.08)))},{passive:false});
    cv.addEventListener('keydown',function(e){var k=e.key;if(k==='ArrowLeft')st.vy=-.04;else if(k==='ArrowRight')st.vy=.04;else if(k==='ArrowUp')st.vp=-.04;else if(k==='ArrowDown')st.vp=.04;else if(k==='+'||k==='=')st.tz=Math.min(2.2,st.tz*1.12);else if(k==='-')st.tz=Math.max(.6,st.tz/1.12);else if((k==='Enter'||k===' ')&&VEH[st.mode])vAction();else return;e.preventDefault()});
    function select(id){document.dispatchEvent(new CustomEvent('ra:topic',{detail:id}))}
    function setMode(m,quiet){if(DRAW[m]||VEH[m]){var ch=m!==st.mode;st.mode=m;st.yaw=VIEW[m][0];st.pitch=VIEW[m][1];st.vy=st.vp=0;st.lastDrag=-99;trail.length=0;jetTrail.length=0;bubbles.length=0;casings.length=0;lock=null;st.hover=null;tip.hidden=true;HS=[];
      Array.prototype.forEach.call(document.querySelectorAll('[data-mode],[data-unit]'),function(b){b.setAttribute('aria-pressed',(b.dataset.mode||b.dataset.unit)===m?'true':'false')});panel.setAttribute('data-active-mode',m);panel.setAttribute('data-kind',VEH[m]?'fleet':'research');
      if(actBtn){actBtn.hidden=!VEH[m];if(VEH[m])actBtn.textContent='▶ '+VEH[m].act}if(ch&&!quiet&&window.RAAudio)window.RAAudio.sfx('switch');kick()}}
    var actBtn=panel.querySelector('[data-act]');if(actBtn)actBtn.addEventListener('click',vAction);
    Array.prototype.forEach.call(panel.querySelectorAll('[data-mode]'),function(b){b.addEventListener('click',function(){setMode(b.dataset.mode)})});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-zoom]'),function(b){b.addEventListener('click',function(){var z=b.dataset.zoom;if(z==='in')st.tz=Math.min(2.2,st.tz*1.15);else if(z==='out')st.tz=Math.max(.6,st.tz/1.15);else{st.tz=1;st.yaw=VIEW[st.mode][0];st.pitch=VIEW[st.mode][1];st.vy=st.vp=0;st.lastDrag=-99}})});
    Array.prototype.forEach.call(panel.querySelectorAll('[data-node]'),function(b){b.addEventListener('click',function(){select(b.dataset.node)});
      b.addEventListener('mouseenter',function(){st.hover=NODES.filter(function(n){return n.id===b.dataset.node})[0]});b.addEventListener('mouseleave',function(){st.hover=null})});
    kick();
    return {setMode:setMode,nextMode:function(){setMode(MODES[(MODES.indexOf(st.mode)+1)%MODES.length]);return st.mode},getMode:function(){return st.mode},action:function(){if(VEH[st.mode])vAction()},view:function(y,p,z){st.yaw=y;st.pitch=p;st.tz=st.zoom=z||1;st.vy=st.vp=0;st.lastDrag=st.t;kick()},modes:MODES,labels:MODE_LABEL,fleet:['jet','tank','sub','ak']};
  }

  /* ---------- background tactical grid + particle field ---------- */
  var PI2=Math.PI/2,JETP=[[26,0],[16,-2.5],[4,-4],[-4,-5],[-8,-14],[-13,-14],[-12,-4],[-20,-3.5],[-24,-10],[-28,-10],[-26,0],[-22,2.5],[-8,3.5],[-12,7],[-7,7],[2,3.5],[16,2.5]],
      TANKH=[[-27,-5],[20,-5],[28,-9],[24,-12],[-24,-12],[-28,-9]],TANKT=[[-10,-12],[-8,-18],[4,-20],[10,-17],[12,-12]];
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


  /* ---------- fleet patrol band: interceptor in the sky, armour on the horizon, submarine sonar contact ---------- */
  function Patrol(cv){
    var ctx=cv.getContext('2d'),W=1,H=1,dpr=Math.min(window.devicePixelRatio||1,2),t=0,vis=true,raf=0;
    function size(){var r=cv.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    size();window.addEventListener('resize',function(){size();if(RM)frame()});
    function frame(){if(!vis){raf=0;return}if(!RM)t+=1/60;ctx.clearRect(0,0,W,H);var hz=H*.56;
      for(var i=0;i<7;i++){var u=((i+(t*.5)%1)/7),y=hz+Math.pow(u,1.8)*(H-hz);ctx.strokeStyle=c('olive',.08+u*.22);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      for(var k=-24;k<=24;k++){ctx.strokeStyle=c('olive',.16);ctx.beginPath();ctx.moveTo(W/2+k*14,hz);ctx.lineTo(W/2+k*W*.06,H);ctx.stroke()}
      ctx.strokeStyle=c('red',.45);ctx.beginPath();ctx.moveTo(0,hz);ctx.lineTo(W,hz);ctx.stroke();
      for(var m=0;m<=10;m++){var x=m/10*W;ctx.fillStyle=c('mute',.5);ctx.fillRect(x,hz-3,1,6)}
      // ambient fleet patrol: interceptor in the sky, armour on the horizon, submarine sonar contact on the plain
      var A=PAL.light?.55:.5;ctx.lineJoin='round';
      function blip(x,y,txt,col){ctx.fillStyle=c(col,Math.min(1,A*2.2));ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+4,y);ctx.lineTo(x,y+4);ctx.lineTo(x-4,y);ctx.fill();ctx.font='700 9.5px "JetBrains Mono",monospace';ctx.fillText(txt,x+8,y+3)}
      function path(pts){ctx.beginPath();pts.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath()}
      var sc0=W<600?.72:.95;
      (function(){var u=(t/30+.66)%1,x=-80+u*(W+160),y=hz*.42+Math.sin(t*.6)*4;
        var g=ctx.createLinearGradient(x-240*sc0,0,x-30*sc0,0);g.addColorStop(0,c('ink',0));g.addColorStop(1,c('ink',A*.7));ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-240*sc0,y+1);ctx.lineTo(x-28*sc0,y);ctx.stroke();
        ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.6)*.05);ctx.scale(sc0,sc0);ctx.strokeStyle=c('ink',A*1.4);ctx.fillStyle=c('olive',A*.9);ctx.lineWidth=1;
        path(JETP);ctx.fill();ctx.stroke();ctx.fillStyle=c('red',A*2);ctx.beginPath();ctx.arc(-19,-6,2,0,7);ctx.fill();ctx.restore();blip(x+30*sc0,y-6,'SU-27 · M1.9 · FL360','red')})();
      (function(){var u=(t/48+.25)%1,x=W+80-u*(W+160),y=hz-1;ctx.save();ctx.translate(x,y);ctx.scale(-sc0,sc0);ctx.strokeStyle=c('ink',A*1.4);ctx.fillStyle=c('olive',A);ctx.lineWidth=1;
        path(TANKH);ctx.fill();ctx.stroke();path(TANKT);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(10,-15);ctx.lineTo(40,-16.5);ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(-24,-5);ctx.lineTo(24,-5);ctx.arc(24,-2.5,2.5,-PI2,PI2);ctx.lineTo(-24,0);ctx.arc(-24,-2.5,2.5,PI2,-PI2);ctx.stroke();ctx.restore();blip(x-10,y-34*sc0,'T-72 · 60 KM/H','yellow')})();
      (function(){var u=(t/62+.1)%1,x=-80+u*(W+160),y=hz+(H-hz)*.55,r=((t%3.2)/3.2);ctx.strokeStyle=c('cyan',A*1.6*(1-r));ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x+22,y,8+r*60,3+r*20,0,0,7);ctx.stroke();
        ctx.save();ctx.translate(x,y);ctx.scale(sc0,sc0);ctx.strokeStyle=c('cyan',A*1.6);ctx.fillStyle=c('cyan',A*.35);ctx.beginPath();ctx.ellipse(0,0,30,6.5,0,0,7);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(4,0,6,2.5,0,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(-38,-5);ctx.moveTo(-30,0);ctx.lineTo(-38,5);ctx.stroke();ctx.restore();blip(x-6,y-16*sc0,'TYPHOON · −380 M','cyan')})();
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
    Array.prototype.forEach.call(document.querySelectorAll('[data-unit]'),function(b){b.addEventListener('click',function(){if(!window.RA3D)return;window.RA3D.setMode(b.dataset.unit);var th=document.getElementById('theatre');if(th){var r=th.getBoundingClientRect();if(r.top<56||r.bottom>window.innerHeight)th.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'})}})});
    var f=document.getElementById('field');if(f&&f.getContext)Field(f);
    var pb=document.getElementById('patrol');if(pb&&pb.getContext)Patrol(pb);
    tilt();
  });
})();
