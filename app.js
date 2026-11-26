(function(){
  var root=document.documentElement;
  var saved=null;try{saved=localStorage.getItem('ra-theme')}catch(e){}
  root.setAttribute('data-theme',saved||'dark');
  function syncThemeBtn(){var b=document.getElementById('themeBtn');if(b){var d=root.getAttribute('data-theme')==='dark';b.textContent=d?"LT":"DK";b.setAttribute('aria-label',d?'Switch to light theme':'Switch to dark theme')}}
  document.addEventListener('DOMContentLoaded',function(){
    syncThemeBtn();
    var mb=document.getElementById('menuBtn'),nav=document.getElementById('nav');
    mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o?'true':'false')});
    Array.prototype.forEach.call(nav.querySelectorAll('a'),function(a){a.addEventListener('click',function(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false')})});
    document.getElementById('themeBtn').addEventListener('click',function(){
      var n=root.getAttribute('data-theme')==='dark'?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('ra-theme',n)}catch(e){}syncThemeBtn();});
    Array.prototype.forEach.call(document.querySelectorAll('[data-print-cv]'),function(b){b.addEventListener('click',function(){window.print()})});
    // publications filter
    var items=Array.prototype.slice.call(document.querySelectorAll('ol.pubs li'));
    var groups=Array.prototype.slice.call(document.querySelectorAll('.pub-group'));
    var btns=Array.prototype.slice.call(document.querySelectorAll('.filter[data-f]'));
    var q=document.getElementById('pubSearch'), ysel=document.getElementById('pubYear'), out=document.getElementById('pubCount'), empty=document.getElementById('pubEmpty');
    var cur='all';
    function apply(){
      var term=(q.value||'').trim().toLowerCase(), y=ysel.value, n=0;
      items.forEach(function(li){
        var ok=true, f=cur;
        if(f==='lead') ok=li.dataset.lead==='1';
        else if(f==='preprint'||f==='paper'||f==='patent') ok=li.dataset.cat===f;
        else if(f==='ssrn'||f==='zenodo') ok=li.dataset.kind===f;
        if(ok&&y!=='all') ok=li.dataset.year===y;
        if(ok&&term) ok=li.textContent.toLowerCase().indexOf(term)>-1;
        li.hidden=!ok; if(ok)n++;
      });
      groups.forEach(function(g){g.hidden=!g.querySelector('li:not([hidden])')});
      out.textContent='> showing '+n+' of '+items.length+' entries';
      empty.hidden=n>0;
    }
    btns.forEach(function(b){b.addEventListener('click',function(){cur=b.dataset.f;btns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});apply();})});
    q.addEventListener('input',apply); ysel.addEventListener('change',apply); apply();
    // active nav
    var links=Array.prototype.slice.call(document.querySelectorAll('.nav a'));
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
      links.forEach(function(a){var s=document.querySelector(a.getAttribute('href'));if(s)io.observe(s)});
    }
  });
})();
