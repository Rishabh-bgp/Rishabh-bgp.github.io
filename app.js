/* RA-01 academic CV — UI: theme, nav HUD, reveal, count-up, publications engine, citations, command palette, terminal, flip cards */
(function(){
  'use strict';
  var root=document.documentElement;root.classList.add('js');
  var saved=null;try{saved=localStorage.getItem('ra-theme')}catch(e){}
  root.setAttribute('data-theme',saved||'dark');
  var $=function(s,el){return (el||document).querySelector(s)}, $$=function(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s))};
  var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ORCID='0009-0004-7595-9440';

  function toast(msg){var t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},2200)}
  function copy(text,msg){function ok(){toast(msg)}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(ok,fallback)}else fallback();
    function fallback(){var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);ok()}}
  function setTheme(n){root.setAttribute('data-theme',n);try{localStorage.setItem('ra-theme',n)}catch(e){}var b=$('#themeBtn');if(b){b.textContent=n==='dark'?'LT':'DK';b.setAttribute('aria-label',n==='dark'?'Switch to light theme':'Switch to dark theme')}}
  function toggleTheme(){var n=root.getAttribute('data-theme')==='dark'?'light':'dark';setTheme(n);toast('> theme: '+n);return n}
  function go(id){var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}

  document.addEventListener('DOMContentLoaded',function(){
    setTheme(root.getAttribute('data-theme'));
    $('#themeBtn').addEventListener('click',toggleTheme);
    $$('[data-print-cv]').forEach(function(b){b.addEventListener('click',function(){window.print()})});
    $$('[data-copy-orcid]').forEach(function(b){b.addEventListener('click',function(){copy('https://orcid.org/'+ORCID,'ORCID iD copied')})});
    var mb=$('#menuBtn'),nav=$('#nav');
    mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o?'true':'false')});
    $$('a',nav).forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false')})});

    /* HUD: scroll progress + scroll-spy */
    var bar=$('#progress'),links=$$('.nav a'),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))}).filter(Boolean);
    function onScroll(){var h=document.documentElement.scrollHeight-window.innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,window.scrollY/h):0)+')';
      var cur=null;secs.forEach(function(s){if(s.getBoundingClientRect().top<window.innerHeight*.35)cur=s.id});
      links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+cur)});var sl=$('#hudSection');if(sl)sl.textContent=cur?cur.toUpperCase():'TOP'}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();

    /* reveal + count-up */
    function countUp(el){var to=+el.dataset.count,t0=null;if(RM){el.textContent=to;return}
      function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/1100),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e);if(p<1)requestAnimationFrame(step)}el.textContent='0';requestAnimationFrame(step)}
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');$$('[data-count]',e.target).forEach(function(n){if(!n._done){n._done=1;countUp(n)}});io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.05});
      $$('.reveal').forEach(function(el){io.observe(el)});
    } else $$('.reveal').forEach(function(el){el.classList.add('in')});

    /* flip cards */
    $$('.flip').forEach(function(card){var btns=$$('[data-flip]',card);function f(){var on=card.classList.toggle('flipped');card.setAttribute('aria-pressed',on?'true':'false');$('.face.front',card).setAttribute('aria-hidden',on?'true':'false');$('.face.back',card).setAttribute('aria-hidden',on?'false':'true')}
      btns.forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();f()})});
      card.addEventListener('click',function(e){if(e.target.closest('a,button'))return;f()});
      card.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target===card){e.preventDefault();f()}})});

    /* ---------- publications engine ---------- */
    var PUBS=JSON.parse($('#pubdata').textContent);
    var items=$$('ol.pubs li'),groups=$$('.pub-group');
    var S={cat:'all',lead:false,year:'all',topic:null,q:''};
    var TOPIC_LABEL={wind:'Wind Forecasting',bio:'Brain MRI & Genomics',eeg:'EEG Epilepsy',quantum:'Quantum Hybrids',sec:'Scam & Threat Detection',ip:'Patents & IP','u:jet':'Wind & Quantum Forecasting','u:tank':'Scam, Threat & Control Defense','u:sub':'Deep Signal & Biomedical AI','u:ak':'Patents, IP & Agentic Stack'};
    var UNITSET={'u:jet':['wind','quantum'],'u:tank':['sec','ctrl','rai'],'u:sub':['bio','eeg'],'u:ak':['ip']};
    function hasT(p,t){var s=UNITSET[t];if(!s)return p.topics.indexOf(t)>-1;for(var j=0;j<s.length;j++)if(p.topics.indexOf(s[j])>-1)return true;return false}
    var q=$('#pubSearch'),ysel=$('#pubYear'),out=$('#pubCount'),empty=$('#pubEmpty'),leadT=$('#leadToggle'),chip=$('#topicChip');
    function match(i,ignore){var p=PUBS[i],ok=true;
      if(ignore!=='cat'&&S.cat!=='all')ok=(S.cat==='ssrn'||S.cat==='zenodo')?p.kind===S.cat:p.cat===S.cat;
      if(ok&&ignore!=='lead'&&S.lead)ok=p.lead;
      if(ok&&ignore!=='year'&&S.year!=='all')ok=String(p.year)===S.year;
      if(ok&&S.topic)ok=hasT(p,S.topic);
      if(ok&&S.q)ok=items[i]._txt.indexOf(S.q)>-1;return ok}
    items.forEach(function(li){li._txt=li.textContent.toLowerCase()});
    function apply(){
      var n=0;items.forEach(function(li,i){var ok=match(i);li.hidden=!ok;if(ok)n++});
      groups.forEach(function(g){g.hidden=!g.querySelector('li:not([hidden])')});
      out.textContent='> showing '+n+' of '+items.length+' entries'+(S.topic?' · topic: '+TOPIC_LABEL[S.topic]:'');
      empty.hidden=n>0;
      $$('.filter[data-f]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.f===S.cat?'true':'false')});
      leadT.setAttribute('aria-pressed',S.lead?'true':'false');ysel.value=S.year;
      chip.hidden=!S.topic;if(S.topic)$('b',chip).textContent=TOPIC_LABEL[S.topic];
      // analytics (cross-filter counts)
      $$('.an-bar[data-year]').forEach(function(b){var y=b.dataset.year,c=0;PUBS.forEach(function(p,i){if(String(p.year)===y&&match(i,'year'))c++});b.style.setProperty('--v',c/Math.max(1,+b.dataset.max));$('.an-n',b).textContent=c;b.classList.toggle('on',S.year===y)});
      $$('.an-seg[data-cat]').forEach(function(b){var k=b.dataset.cat,c=0;PUBS.forEach(function(p,i){if(p.cat===k&&match(i,'cat'))c++});$('.an-n',b).textContent=c;b.style.flexGrow=Math.max(c,.0001);b.classList.toggle('on',S.cat===k)});
      $$('.an-seg[data-lead]').forEach(function(b){var want=b.dataset.lead==='1',c=0;PUBS.forEach(function(p,i){if(!!p.lead===want&&match(i,'lead'))c++});$('.an-n',b).textContent=c;b.style.flexGrow=Math.max(c,.0001);b.classList.toggle('on',S.lead&&want)});
      $$('.an-topic').forEach(function(b){var k=b.dataset.topic,c=0;PUBS.forEach(function(p,i){if(p.topics.indexOf(k)>-1)c++});$('.an-n',b).textContent=c;b.classList.toggle('on',S.topic===k)});
    }
    window.RA_TOPIC_COUNTS={};PUBS.forEach(function(p){p.topics.forEach(function(t){window.RA_TOPIC_COUNTS[t]=(window.RA_TOPIC_COUNTS[t]||0)+1})});
    $$('.filter[data-f]').forEach(function(b){b.addEventListener('click',function(){S.cat=b.dataset.f;apply()})});
    leadT.addEventListener('click',function(){S.lead=!S.lead;apply()});
    q.addEventListener('input',function(){S.q=q.value.trim().toLowerCase();apply()});
    ysel.addEventListener('change',function(){S.year=ysel.value;apply()});
    $('#topicClear').addEventListener('click',function(){S.topic=null;apply()});
    $('#pubReset').addEventListener('click',function(){S={cat:'all',lead:false,year:'all',topic:null,q:''};q.value='';apply()});
    $$('.an-bar[data-year]').forEach(function(b){b.addEventListener('click',function(){S.year=S.year===b.dataset.year?'all':b.dataset.year;apply()})});
    $$('.an-seg[data-cat]').forEach(function(b){b.addEventListener('click',function(){S.cat=S.cat===b.dataset.cat?'all':b.dataset.cat;apply()})});
    $$('.an-seg[data-lead]').forEach(function(b){b.addEventListener('click',function(){S.lead=b.dataset.lead==='1'?!S.lead:false;apply()})});
    $$('.an-topic').forEach(function(b){b.addEventListener('click',function(){S.topic=S.topic===b.dataset.topic?null:b.dataset.topic;apply()})});
    function setTopic(id){S={cat:'all',lead:false,year:'all',topic:id,q:''};q.value='';apply();go('publications');toast('> filter: '+TOPIC_LABEL[id])}
    document.addEventListener('ra:topic',function(e){setTopic(e.detail)});
    window.RA_UNIT_COUNTS={};Object.keys(UNITSET).forEach(function(u){window.RA_UNIT_COUNTS[u]=PUBS.filter(function(p){return hasT(p,u)}).length});
    document.addEventListener('ra:cv',function(e){var f=e.detail||{};
      if(f.t){setTopic(f.t);return}
      if(f.go){go(f.go);toast('> jump: '+(f.l||f.go));return}
      S={cat:'all',lead:!!f.lead,year:'all',topic:null,q:(f.q||'').toLowerCase()};q.value=f.q||'';apply();go('publications');toast('> filter: '+(f.l||f.q||'lead-author'))});
    $$('[data-topic-link]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();setTopic(a.dataset.topicLink)})});
    apply();

    /* citations */
    function esc(s){return String(s).replace(/[{}\\]/g,'')}
    function bibtex(p,i){var first=(p.authors[0]||'anon').split(' ').pop().toLowerCase().replace(/[^a-z]/g,'');var w=p.title.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ').filter(function(x){return x.length>3})[0]||'work';
      var key=first+p.year+w+(i+1),f=[];f.push('  title     = {'+esc(p.title)+'}');f.push('  author    = {'+p.authors.map(esc).join(' and ')+'}');f.push('  year      = {'+p.year+'}');
      if(p.bibtype==='article')f.push('  journal   = {'+esc(p.venue)+'}');
      else if(p.bibtype==='inproceedings')f.push('  booktitle = {'+esc(p.venue)+'}');
      else if(p.bibtype==='incollection')f.push('  booktitle = {'+esc(p.venue)+'}');
      else if(p.bibtype==='book')f.push('  publisher = {'+esc(p.venue)+'}');
      else if(p.cat==='preprint'){f.push('  howpublished = {'+esc(p.venue)+' preprint}');f.push('  note      = {Preprint}')}
      else if(p.cat==='patent')f.push('  note      = {'+esc(p.venue)+'}');
      if(p.doi){f.push('  doi       = {'+p.doi+'}');f.push('  url       = {https://doi.org/'+p.doi+'}')}
      return '@'+p.bibtype+'{'+key+',\n'+f.join(',\n')+'\n}'}
    function cite(p){var a=p.authors.join(', ');return a+' ('+p.year+'). '+p.title+'. '+p.venue+'.'+(p.doi?' https://doi.org/'+p.doi:'')}
    $$('[data-bib]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.bib;copy(bibtex(PUBS[i],i),'BibTeX copied')})});
    $$('[data-cite]').forEach(function(b){b.addEventListener('click',function(){copy(cite(PUBS[+b.dataset.cite]),'Citation copied')})});

    /* ---------- terminal ---------- */
    var term=$('#termOut'),tin=$('#termIn'),hist=[],hi=0;
    var STATS=JSON.parse($('#statdata').textContent);
    function line(html,cls){var d=document.createElement('div');d.className='tline '+(cls||'');d.innerHTML=html;term.appendChild(d);term.scrollTop=term.scrollHeight}
    var CMDS={
      help:function(){return 'commands: <b>whoami</b> · <b>stats --all</b> · <b>ls patents</b> · <b>ls preprints</b> · <b>stack --ai</b> · <b>education</b> · <b>contact</b> · <b>mode [globe|lattice|bloch|eeg|jet|tank|sub|ak]</b> · <b>fleet</b> · <b>action</b> · <b>audio [on|off|next|track &lt;name&gt;|vol 0-100]</b> · <b>theme</b> · <b>goto &lt;section&gt;</b> · <b>clear</b>'},
      whoami:function(){return '<b>Rishabh Aryan</b> — AI/ML Researcher &amp; R&amp;D Engineer<br>M.Tech (Artificial Intelligence and Data Science), Dept. of CSE, Indian Institute of Information Technology, Bhagalpur<br>focus: leakage-aware benchmarks · honest evaluation · reproducible research code<br>objective: faculty role in CSE / AI &amp; Data Science'},
      'stats --all':function(){return 'research outputs ...... <b>'+STATS.total+'</b><br>lead/first-author ..... <b>'+STATS.lead+'</b><br>papers/chapters/books . <b>'+STATS.paper+'</b><br>preprints ............. <b>'+STATS.preprint+'</b> (SSRN 2 · Zenodo 2)<br>patents &amp; copyright .. <b>'+STATS.patent+'</b><br>thesis implementations  <b>14</b><br>by year ............... '+STATS.years},
      'ls patents':function(){return PUBS.filter(function(p){return p.cat==='patent'}).map(function(p){return '<span class=g>▸</span> '+p.venue+' — '+p.title}).join('<br>')},
      'ls preprints':function(){return PUBS.filter(function(p){return p.cat==='preprint'}).map(function(p){return '<span class=g>▸</span> ['+p.venue+'] '+p.title+(p.doi?' · <a href="https://doi.org/'+p.doi+'" target="_blank" rel="noopener">doi:'+p.doi+'</a>':'')}).join('<br>')},
      'stack --ai':function(){return 'agentic coding stack (personal ratings):<br>Codex ★★★★★ · Claude Code ★★★★★ · Cursor ★★★★★ · Devin ★★★★★ · Google Antigravity ★★★★★<br>ml: PyTorch · scikit-learn · XGBoost · LightGBM · PennyLane · SHAP · LIME · fairlearn · FastAPI · Docker · n8n'},
      education:function(){return 'M.Tech AI &amp; DS · IIIT Bhagalpur · 2025–2027 · CGPA 7.86 (prov.)<br>M.Des UX · DIT University · 2023–2025 · CGPA 8.92<br>B.Tech CSE · MATS University · 2019–2023 · CGPA 8.05<br>Diploma CSE · Himalayan Garhwal University · 2017–2020 · 75.08%<br>Class 10 · 2017 · 93%, Distinction'},
      contact:function(){return 'email ... <a href="mailto:rishabharyan887@gmail.com">rishabharyan887@gmail.com</a><br>email2 .. <a href="mailto:rishabharyan080@gmail.com">rishabharyan080@gmail.com</a><br>orcid ... <a href="https://orcid.org/'+ORCID+'" target="_blank" rel="noopener">'+ORCID+'</a><br>github .. <a href="https://github.com/Rishabh-bgp" target="_blank" rel="noopener">github.com/Rishabh-bgp</a><br>linkedin <a href="https://www.linkedin.com/in/rishabh-aryan-52bb07287" target="_blank" rel="noopener">rishabh-aryan-52bb07287</a><br>whatsapp <a href="https://wa.me/919709621495" target="_blank" rel="noopener noreferrer">+91 97096 21495</a>'},
      theme:function(){return 'theme → '+toggleTheme()},
      fleet:function(){return 'fleet &amp; arsenal (interactive 3D, shaded meshes):<br><span class=g>▸</span> <b>jet</b> · MiG-21 / Su-27 interceptor · action: barrel roll<br><span class=g>▸</span> <b>tank</b> · T-72 / T-34 armour · action: rotate turret, target lock<br><span class=g>▸</span> <b>sub</b> · Typhoon / Akula submarine · action: sonar ping<br><span class=g>▸</span> <b>ak</b> · AK-47 · action: chamber round<br>usage: <b>mode jet</b> then <b>action</b>'},
      action:function(){if(window.RA3D&&window.RA3D.fleet.indexOf(window.RA3D.getMode())>-1){window.RA3D.action();return 'executing → '+window.RA3D.labels[window.RA3D.getMode()]}return 'no unit deployed — try <b>mode tank</b>'},
      clear:function(){term.innerHTML='';return null}
    };
    function run(raw){var cmd=raw.trim().replace(/\s+/g,' ');if(!cmd)return;hist.push(cmd);hi=hist.length;line('<span class=p>ra-01@cv:~$</span> '+cmd.replace(/</g,'&lt;'),'cmd');
      var low=cmd.toLowerCase(),r;
      if(CMDS[low])r=CMDS[low]();
      else if(/^mode\b/.test(low)){var m=low.split(' ')[1];m=({mig:'jet','mig-21':'jet','su-27':'jet',su27:'jet',interceptor:'jet','t-72':'tank',t72:'tank','t-34':'tank',armor:'tank',armour:'tank',typhoon:'sub',akula:'sub',submarine:'sub','ak-47':'ak',ak47:'ak',rifle:'ak'})[m]||m;if(window.RA3D&&window.RA3D.modes.indexOf(m)>-1){window.RA3D.setMode(m);r='3d mode → '+window.RA3D.labels[m]}else if(window.RA3D){r='3d mode → '+window.RA3D.labels[window.RA3D.nextMode()]}else r='3d engine offline'}
      else if(/^(goto|cd|open) /.test(low)){var id=low.split(' ')[1];if(document.getElementById(id)){go(id);r='navigating → #'+id}else r='unknown section. try: dossier, education, interests, research, flagship, publications, experience, conferences, skills'}
      else if(low==='ls'||low==='ls -a')r='dossier/ education/ interests/ research/ flagship/ publications/ experience/ conferences/ skills/ arsenal/';
      else if(/^(audio|music)\b/.test(low)){var A=window.RAAudio,arg=low.split(' ').slice(1);if(!A)r='audio unavailable';
        else if(!arg.length)r='soundtrack: '+(A.isPlaying()?'<b>PLAYING</b>':'OFF')+' · track '+A.getTrack()+' (YouTube · Fix_37) · vol '+Math.round(A.getVolume()*100)+'%';
        else if(arg[0]==='on'||arg[0]==='play'){A.play();r='♪ soundtrack loading → '+A.getTrack()}
        else if(arg[0]==='off'||arg[0]==='stop'||arg[0]==='pause'){A.pause();r='♪ soundtrack OFF'}
        else if(arg[0]==='yt'||arg[0]==='open'||arg[0]==='youtube'){window.open(A.url,'_blank','noopener');r='♪ opening on YouTube → '+A.getTrack()}
        else if((arg[0]==='vol'||arg[0]==='volume')&&!isNaN(+arg[1])){A.setVolume(+arg[1]/100);r='♪ volume → '+Math.round(A.getVolume()*100)+'%'}
        else r='usage: audio [on|off|yt|vol 0-100]'}
      else if(low==='sudo hire')r='<span class=g>ACCESS GRANTED.</span> Dossier forwarded — see <b>contact</b>.';
      else r='command not found: '+cmd.replace(/</g,'&lt;')+' — type <b>help</b>';
      if(r!=null)line(r)}
    $$('[data-cmd]').forEach(function(b){b.addEventListener('click',function(){run(b.dataset.cmd);tin.focus({preventScroll:true})})});
    $('#termForm').addEventListener('submit',function(e){e.preventDefault();run(tin.value);tin.value=''});
    tin.addEventListener('keydown',function(e){if(e.key==='ArrowUp'&&hi>0){hi--;tin.value=hist[hi];e.preventDefault()}else if(e.key==='ArrowDown'){hi=Math.min(hist.length,hi+1);tin.value=hist[hi]||'';e.preventDefault()}});
    line('RA-01 tactical console online. type <b>help</b> or tap a command chip.','sys');
    window.RA_TERM={run:run};

    /* ---------- command palette ---------- */
    var pal=$('#palette'),pin=$('#palIn'),plist=$('#palList'),sel=0,shown=[];
    var ENTRIES=[];
    $$('[data-pal-section]').forEach(function(s){ENTRIES.push({g:'Section',t:s.getAttribute('data-pal-section'),k:'section',run:function(){go(s.id)}})});
    ENTRIES.push({g:'Action',t:'Toggle light / dark theme',k:'theme',run:toggleTheme});
    ENTRIES.push({g:'Action',t:'Print / Save academic CV (PDF)',k:'print pdf',run:function(){setTimeout(function(){window.print()},60)}});
    ENTRIES.push({g:'Action',t:'Copy ORCID iD ('+ORCID+')',k:'orcid copy',run:function(){copy('https://orcid.org/'+ORCID,'ORCID iD copied')}});
    function openExt(u){var w=window.open(u,'_blank','noopener,noreferrer');if(w)w.opener=null}
    ENTRIES.push({g:'Contact',t:'WhatsApp (+91 97096 21495)',k:'whatsapp contact phone message chat',run:function(){openExt('https://wa.me/919709621495')}});
    ENTRIES.push({g:'Contact',t:'Email (rishabharyan887@gmail.com)',k:'email mail contact',run:function(){location.href='mailto:rishabharyan887@gmail.com'}});
    ENTRIES.push({g:'Contact',t:'Email (rishabharyan080@gmail.com)',k:'email mail contact alt alternate second',run:function(){location.href='mailto:rishabharyan080@gmail.com'}});
    ENTRIES.push({g:'Action',t:'Copy email addresses',k:'copy email mail contact',run:function(){copy('rishabharyan887@gmail.com, rishabharyan080@gmail.com','Email addresses copied')}});
    ENTRIES.push({g:'Action',t:'Copy WhatsApp number (+91 97096 21495)',k:'copy whatsapp phone number',run:function(){copy('+91 97096 21495','WhatsApp number copied')}});
    ENTRIES.push({g:'Contact',t:'LinkedIn profile',k:'linkedin contact',run:function(){openExt('https://www.linkedin.com/in/rishabh-aryan-52bb07287')}});
    ENTRIES.push({g:'Contact',t:'GitHub profile',k:'github code contact',run:function(){openExt('https://github.com/Rishabh-bgp')}});
    ENTRIES.push({g:'Action',t:'Switch 3D mode (next)',k:'3d mode globe lattice bloch eeg',run:function(){if(window.RA3D){var m=window.RA3D.nextMode();toast('> 3D mode: '+window.RA3D.labels[m]);go('top')}}});
    [['jet','3D: MiG-21 / Su-27 interceptor','jet fighter mig su27 aircraft plane fleet'],['tank','3D: T-72 / T-34 main battle tank','tank armor armour t72 t34 fleet'],['sub','3D: Typhoon / Akula submarine','submarine sub typhoon akula sonar fleet'],['ak','3D: AK-47 arsenal','ak47 ak-47 rifle arsenal kalashnikov']].forEach(function(u){ENTRIES.push({g:'Fleet',t:u[1],k:u[2]+' 3d mode',run:function(){if(window.RA3D){window.RA3D.setMode(u[0]);go('theatre')}}})});
    ENTRIES.push({g:'Audio',t:'Play / pause soundtrack',k:'audio music sound soundtrack play pause toggle',run:function(){if(window.RAAudio){var on=window.RAAudio.toggle();toast('♪ soundtrack '+(on?'LOADING → '+window.RAAudio.getTrack():'OFF'))}}});
    ENTRIES.push({g:'Audio',t:'Open soundtrack on YouTube',k:'audio music youtube soviet union edit open',run:function(){if(window.RAAudio)window.open(window.RAAudio.url,'_blank','noopener')}});
    ENTRIES.push({g:'Action',t:'Open tactical terminal',k:'terminal console shell',run:function(){go('console');setTimeout(function(){tin.focus({preventScroll:true})},400)}});
    ENTRIES.push({g:'Action',t:'Show lead-author works only',k:'lead first author filter',run:function(){S={cat:'all',lead:true,year:'all',topic:null,q:''};q.value='';apply();go('publications')}});
    $$('[data-pal-degree]').forEach(function(d){ENTRIES.push({g:'Degree',t:d.getAttribute('data-pal-degree'),k:'education degree',run:function(){go('education');d.classList.add('flash');setTimeout(function(){d.classList.remove('flash')},1600)}})});
    PUBS.forEach(function(p,i){ENTRIES.push({g:p.cat==='patent'?'Patent / IP':p.cat==='preprint'?'Preprint':'Publication',t:p.title,k:p.venue+' '+p.year+' '+p.authors.join(' '),run:function(){S={cat:'all',lead:false,year:'all',topic:null,q:''};q.value='';apply();var li=items[i];li.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});li.classList.add('flash');setTimeout(function(){li.classList.remove('flash')},1800)}})});
    function score(e,qq){if(!qq)return e.g==='Section'?3:e.g==='Action'?2:0;var t=e.t.toLowerCase(),s=(t+' '+e.k+' '+e.g).toLowerCase();
      if(t.indexOf(qq)===0)return 100;var ix=t.indexOf(qq);if(ix>-1)return 80-Math.min(30,ix/4);if(s.indexOf(qq)>-1)return 55+(e.g==='Action'||e.g==='Section'?10:0);
      var ws=qq.split(' ').filter(Boolean);if(ws.length>1&&ws.every(function(w){return s.indexOf(w)>-1}))return 45+(e.g==='Action'||e.g==='Section'?10:0);
      var j=0,gap=0,last=-1;for(var i=0;i<t.length&&j<qq.length;i++){if(t[i]===qq[j]){if(last>-1)gap+=i-last-1;last=i;j++}}return (j===qq.length&&gap<=qq.length*2)?Math.max(1,30-gap):-1}
    function render(){var qq=pin.value.trim().toLowerCase();shown=ENTRIES.map(function(e){return [score(e,qq),e]}).filter(function(x){return x[0]>=0&&(qq||x[0]>0)}).sort(function(a,b){return b[0]-a[0]}).slice(0,40).map(function(x){return x[1]});
      sel=Math.min(sel,Math.max(0,shown.length-1));
      plist.innerHTML=shown.length?shown.map(function(e,i){return '<li role="option" id="po'+i+'" aria-selected="'+(i===sel)+'" data-i="'+i+'"><span class="pg">'+e.g+'</span><span class="pt">'+e.t.replace(/</g,'&lt;')+'</span></li>'}).join(''):'<li class="none">no match</li>';
      pin.setAttribute('aria-activedescendant','po'+sel);var a=$('[aria-selected="true"]',plist);if(a)a.scrollIntoView({block:'nearest'})}
    function openPal(){pal.hidden=false;document.body.classList.add('pal-open');pin.value='';sel=0;render();setTimeout(function(){pin.focus()},10)}
    function closePal(){pal.hidden=true;document.body.classList.remove('pal-open')}
    function exec(i){var e=shown[i];if(!e)return;closePal();e.run()}
    window.RA_PALETTE={open:openPal,close:closePal};
    $$('[data-palette]').forEach(function(b){b.addEventListener('click',openPal)});
    pal.addEventListener('click',function(e){if(e.target===pal)closePal();var li=e.target.closest('li[data-i]');if(li)exec(+li.dataset.i)});
    pin.addEventListener('input',function(){sel=0;render()});
    pin.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){sel=Math.min(shown.length-1,sel+1);render();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);render();e.preventDefault()}else if(e.key==='Enter'){exec(sel);e.preventDefault()}else if(e.key==='Escape'){closePal()}});
    document.addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();pal.hidden?openPal():closePal()}else if(e.key==='Escape'&&!pal.hidden)closePal()});
    var kb=$('#palKey');if(kb&&/Mac|iPhone|iPad/.test(navigator.platform||''))kb.textContent='⌘K';
  });
  window.addEventListener('beforeprint',function(){$$('.flip.flipped').forEach(function(c){c.classList.remove('flipped')})});
})();
