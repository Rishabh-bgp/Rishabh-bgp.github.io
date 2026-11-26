/* Lightweight self-contained 3D: rotating neural lattice (canvas 2D projection) + tilt cards. No dependencies. */
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lattice(){
    var cv=document.getElementById('lattice'); if(!cv||!cv.getContext) return;
    var ctx=cv.getContext('2d'), W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
    // nodes: layered neural network (4 layers) + icosahedron-like shell
    var N=[],E=[],i,j;
    var layers=[5,8,8,4];
    layers.forEach(function(c,li){for(var k=0;k<c;k++){var a=k/c*Math.PI*2;var r=li===0||li===3?0.55:0.9;N.push({x:(li-1.5)*0.75,y:Math.cos(a)*r,z:Math.sin(a)*r,l:li})}});
    var off=0;layers.forEach(function(c,li){if(li<layers.length-1){var nx=off+c;for(i=0;i<c;i++)for(j=0;j<layers[li+1];j++){if((i+j)%2===0)E.push([off+i,nx+j,0])}}off+=c});
    // outer geodesic ring
    var base=N.length, R=1.9, M=24;
    for(i=0;i<M;i++){var t=i/M*Math.PI*2;N.push({x:Math.cos(t)*R,y:Math.sin(t)*R*0.35,z:Math.sin(t)*R,l:9});E.push([base+i,base+(i+1)%M,1])}
    for(i=0;i<M;i++){var t2=i/M*Math.PI*2;N.push({x:Math.cos(t2)*R*0.35,y:Math.sin(t2)*R,z:Math.cos(t2)*R*0.9,l:8});E.push([base+M+i,base+M+(i+1)%M,2])}
    for(var m=0;m<4;m++){var b0=N.length,ph=m/4*Math.PI;for(i=0;i<M;i++){var u=i/M*Math.PI*2;N.push({x:Math.cos(u)*R*Math.cos(ph),y:Math.sin(u)*R,z:Math.cos(u)*R*Math.sin(ph),l:7.5});E.push([b0+i,b0+(i+1)%M,3])}}
    var cols={0:'255,0,51',1:'0,240,255',2:'255,212,0',3:'143,163,77'};
    var mx=0,my=0,tx=0,ty=0,ang=0;
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
    window.addEventListener('resize',size);size();
    window.addEventListener('mousemove',function(e){tx=(e.clientX/window.innerWidth-.5);ty=(e.clientY/window.innerHeight-.5)});
    function frame(){
      mx+=(tx-mx)*.05;my+=(ty-my)*.05; if(!reduce) ang+=.0035;
      var ay=ang+mx*1.2, ax=0.35+my*0.8, cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
      var s=Math.min(W,H)*0.27, ox=W*0.72, oy=H*0.48;
      if(W<700){ox=W*0.5;s=Math.min(W,H)*0.3}
      var P=N.map(function(n){var x=n.x*cy+n.z*sy, z=-n.x*sy+n.z*cy, y=n.y*cx-z*sx; z=n.y*sx+z*cx; var f=3.2/(3.2+z); return {x:ox+x*s*f,y:oy+y*s*f,z:z,f:f,l:n.l}});
      ctx.clearRect(0,0,W,H);
      var rr=s*2.25;ctx.save();ctx.translate(ox,oy);ctx.strokeStyle='rgba(143,163,77,.22)';ctx.lineWidth=1;
      for(var k=1;k<=4;k++){ctx.beginPath();ctx.arc(0,0,rr*k/4,0,7);ctx.stroke()}
      ctx.beginPath();ctx.moveTo(-rr,0);ctx.lineTo(rr,0);ctx.moveTo(0,-rr);ctx.lineTo(0,rr);ctx.stroke();
      var sw=ang*6%(Math.PI*2);var g=ctx.createLinearGradient(0,0,Math.cos(sw)*rr,Math.sin(sw)*rr);
      ctx.fillStyle='rgba(255,0,51,.10)';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,rr,sw-0.5,sw);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(255,0,51,.55)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(sw)*rr,Math.sin(sw)*rr);ctx.stroke();ctx.restore();
      E.forEach(function(e){var a=P[e[0]],b=P[e[1]];var al=(e[2]===3?.55:1)*Math.max(.05,Math.min(.55,(a.f+b.f)/2-.55));ctx.strokeStyle='rgba('+cols[e[2]]+','+al+')';ctx.lineWidth=e[2]?1.1:.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()});
      P.forEach(function(p){if(p.l>7)return;var r=2.6*p.f;ctx.fillStyle=p.l===0||p.l===3?'rgba(0,240,255,'+(.4+.4*(p.f-.6))+')':'rgba(255,0,51,'+(.45+.45*(p.f-.6))+')';ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill()});
      if(!reduce||Math.abs(tx-mx)>.001) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    if(reduce) window.addEventListener('mousemove',function(){requestAnimationFrame(frame)});
  }
  function tilt(){
    if(reduce||!window.matchMedia('(hover: hover)').matches) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-tilt]'),function(el){
      var max=parseFloat(el.getAttribute('data-tilt'))||8;
      el.classList.add('tilt');
      el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
        el.style.transform='perspective(800px) rotateX('+((.5-py)*max)+'deg) rotateY('+((px-.5)*max)+'deg) translateZ(6px)';
        el.style.setProperty('--sx',(px*100)+'%');el.style.setProperty('--sy',(py*100)+'%');});
      el.addEventListener('mouseleave',function(){el.style.transform='';});
    });
  }
  document.addEventListener('DOMContentLoaded',function(){lattice();tilt();});
})();
