/* পরিবেশের সুর (ওয়েব অডিও): বাতাস, ঝিঁঝিঁ, কাফেলা, যুদ্ধধ্বনি ইত্যাদি — বোতাম চাপলে চালু */
'use strict';
(function(){
  var SIRAT=window.SIRAT,clamp=SIRAT.clamp,sstep=SIRAT.sstep,REDUCE=SIRAT.REDUCE,secs=SIRAT.secs,sceneF=SIRAT.sceneF;
  var btn=document.getElementById('wind'),bar=document.getElementById('windbar'),AC=window.AudioContext||window.webkitAudioContext;
  if(!btn||!bar||!AC){return;}
  bar.hidden=false;
  var ac=null,master=null,on=false,timer=0,sched=0,cur='',L={},EVL=[],NB={},W={},rvIn=null,rvWet=null,MASTER=0.62;
  var KEYS=['w','n','c','k','m','b','a','d','f'];
  var MIX=SIRAT.data.audioMix;   /* অধ্যায়ভিত্তিক মিশ্রণ: js/data/audio-mix.js */
  var DEF={w:.5,r:.3};
  var NAME={w:'মরুর হাওয়া',n:'রাতের নীরবতা',c:'ঝিঁঝিঁ',k:'মানুষের গুঞ্জন',m:'কাফেলার ঘণ্টা ও খুর',b:'দূরের যুদ্ধধ্বনি',a:'পাখির ডাক',d:'গুহার ফোঁটা',f:'আগুনের ফড়ফড়'};
  var SEND={w:.18,n:.3,c:.15,k:.3,m:.3,b:.5,a:.35,d:1,f:.12};
  /* the listener's own settings: overall volume and which layers may play at all (remembered in this browser) */
  var KEY='seerat-ambience-v3',vol=1,LON={};
  KEYS.forEach(function(k){LON[k]=true;});
  try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv){if(typeof sv.v==='number'){vol=clamp(sv.v,0,1);}KEYS.forEach(function(k){if(sv.l&&sv.l[k]===false){LON[k]=false;}});}}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({v:vol,l:LON}));}catch(e){}}
  function lvl(){return MASTER*Math.pow(vol,1.4);}
  function rnd(a,b){return a+Math.random()*(b-a);}
  function mkNoise(kind,sec){
    var n=(ac.sampleRate*sec)|0,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0),i,w,l=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(i=0;i<n;i++){w=Math.random()*2-1;
      if(kind==='brown'){l=(l+0.02*w)/1.02;d[i]=l*3.5;}
      else if(kind==='pink'){b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.969*b2+w*0.153852;b3=0.8665*b3+w*0.3104856;b4=0.55*b4+w*0.5329522;b5=-0.7616*b5-w*0.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926;}
      else{d[i]=w*0.5;}
    }
    return b;
  }
  function nsrc(kind){var s=ac.createBufferSource();s.buffer=NB[kind];s.loop=true;s.start(0,Math.random()*3);return s;}
  function lfo(freq,amt,target){var o=ac.createOscillator(),g=ac.createGain();o.frequency.value=freq;g.gain.value=amt;o.connect(g);g.connect(target);o.start();return o;}
  function pan(p){if(ac.createStereoPanner){var n=ac.createStereoPanner();n.pan.value=p;return n;}return ac.createGain();}
  function filt(type,f,q){var b=ac.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b;}
  function layerGain(k){var g=ac.createGain();g.gain.value=0;g.connect(master);var s=ac.createGain();s.gain.value=SEND[k]||0.2;g.connect(s);s.connect(rvIn);return g;}
  /* one-shot building blocks */
  function noiseHit(t,dur,type,f,q,amp,dest){
    var s=ac.createBufferSource();s.buffer=NB.white;var fl=filt(type,f,q),g=ac.createGain();
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+0.004);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*2,dur+0.05);
  }
  function toneSweep(t,f1,f2,dur,amp,dest,type,att){
    var o=ac.createOscillator(),g=ac.createGain(),a=att||0.006;o.type=type||'sine';
    o.frequency.setValueAtTime(f1,t);if(f2){o.frequency.exponentialRampToValueAtTime(f2,t+dur);}
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+0.05);
  }
  function bellHit(t,f,amp,dest){
    var P=[[1,1,0.9],[2.41,0.55,0.5],[3.93,0.3,0.28],[5.4,0.14,0.16]],i;
    for(i=0;i<P.length;i++){toneSweep(t,f*P[i][0],0,P[i][2],amp*P[i][1],dest,'sine',0.002);}
    noiseHit(t,0.025,'bandpass',f*3,2,amp*0.5,dest);
  }
  function hoofHit(t,amp,dest){noiseHit(t,0.12,'lowpass',420,0.7,amp,dest);toneSweep(t,95,55,0.15,amp*0.9,dest,'sine',0.004);}
  function drumHit(t,amp,dest){toneSweep(t,120,48,0.45,amp,dest,'sine',0.004);noiseHit(t,0.09,'lowpass',260,0.7,amp*0.55,dest);}
  function clash(t,dest){
    var f=rnd(1900,3600);
    noiseHit(t,0.06,'bandpass',rnd(3000,6500),2.5,0.32,dest);
    toneSweep(t,f,0,0.42,0.07,dest,'sine',0.001);toneSweep(t,f*2.76,0,0.25,0.04,dest,'sine',0.001);
  }
  function trill(t,f,dest){
    var n=(rnd(4,9))|0,per=rnd(0.032,0.046),o=ac.createOscillator(),g=ac.createGain(),i,s;
    o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);
    for(i=0;i<n;i++){s=t+i*per;g.gain.linearRampToValueAtTime(0.18,s+0.006);g.gain.linearRampToValueAtTime(0,s+per*0.8);}
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+n*per+0.05);
  }
  function cooNote(t,f,dur,dest){
    var o=ac.createOscillator(),g=ac.createGain(),v=ac.createOscillator(),vg=ac.createGain(),lp=filt('lowpass',900,0.5);
    o.type='sine';o.frequency.setValueAtTime(f*1.08,t);o.frequency.exponentialRampToValueAtTime(f,t+0.08);
    v.frequency.value=26;vg.gain.value=f*0.03;v.connect(vg);vg.connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.26,t+0.07);g.gain.linearRampToValueAtTime(0.16,t+dur*0.7);g.gain.linearRampToValueAtTime(0,t+dur);
    o.connect(lp);lp.connect(g);g.connect(dest);o.start(t);v.start(t);o.stop(t+dur+0.05);v.stop(t+dur+0.05);
  }
  var VOW=[[730,1090],[270,2290],[300,870],[530,1840],[570,840],[660,1720]];
  function mkVoice(){
    var f0=rnd(92,235),o=ac.createOscillator(),vb=ac.createOscillator(),vg=ac.createGain();
    o.type='sawtooth';o.frequency.value=f0;vb.frequency.value=rnd(4.5,6.5);vg.gain.value=f0*0.014;vb.connect(vg);vg.connect(o.frequency);vb.start();
    var b1=filt('bandpass',600,6),b2=filt('bandpass',1500,8),g2=ac.createGain(),env=ac.createGain(),pn=pan(rnd(-0.9,0.9));
    g2.gain.value=0.55;env.gain.value=0;
    o.connect(b1);o.connect(b2);b1.connect(env);b2.connect(g2);g2.connect(env);env.connect(pn);pn.connect(L.k);o.start();
    return {o:o,f0:f0,b1:b1,b2:b2,env:env};
  }
  function syl(v,t){
    var vw=VOW[(Math.random()*VOW.length)|0],d=rnd(0.09,0.26),a=rnd(0.4,0.85);
    v.b1.frequency.setTargetAtTime(vw[0]*rnd(0.92,1.08),t,0.03);v.b2.frequency.setTargetAtTime(vw[1]*rnd(0.92,1.08),t,0.03);
    v.o.frequency.setTargetAtTime(v.f0*rnd(0.9,1.12),t,0.05);
    v.env.gain.setTargetAtTime(a,t,0.025);v.env.gain.setTargetAtTime(0,t+d,0.05);
    return d+(Math.random()<0.2?rnd(0.6,2.2):rnd(0.03,0.22));
  }
  function addEv(k,first,fn){EVL.push({k:k,t:ac.currentTime+first,fn:fn});}
  function build(){
    ac=new AC();
    master=ac.createGain();master.gain.value=0;
    var lim=ac.createDynamicsCompressor();lim.threshold.value=-12;lim.knee.value=10;lim.ratio.value=8;lim.attack.value=0.005;lim.release.value=0.25;
    master.connect(lim);lim.connect(ac.destination);
    NB.white=mkNoise('white',3);NB.pink=mkNoise('pink',6);NB.brown=mkNoise('brown',6);
    /* room / cave echo: generated impulse response */
    var cv=ac.createConvolver(),n=(ac.sampleRate*2.6)|0,ir=ac.createBuffer(2,n,ac.sampleRate),c,i,d;
    for(c=0;c<2;c++){d=ir.getChannelData(c);for(i=0;i<n;i++){d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.8);}}
    cv.buffer=ir;rvIn=ac.createGain();rvWet=ac.createGain();rvWet.gain.value=0.3;
    rvIn.connect(cv);cv.connect(filt('lowpass',3800,0.5));
    var rl=filt('lowpass',3800,0.5);cv.disconnect();cv.connect(rl);rl.connect(rvWet);rvWet.connect(master);
    KEYS.forEach(function(k){L[k]=layerGain(k);});
    /* wind: low rumble + gusting body + sand hiss + faint whistle; gusts are random, not a regular wave */
    W.f1=filt('bandpass',520,0.7);W.g1=ac.createGain();W.g1.gain.value=0.5;
    var s1=nsrc('pink');s1.connect(W.f1);W.f1.connect(W.g1);W.g1.connect(L.w);
    var s2=nsrc('brown'),lp2=filt('lowpass',180,0.5),g2=ac.createGain();g2.gain.value=0.8;s2.connect(lp2);lp2.connect(g2);g2.connect(L.w);
    var s3=nsrc('white'),f3=filt('bandpass',2400,0.9);W.g2=ac.createGain();W.g2.gain.value=0.04;s3.connect(f3);f3.connect(W.g2);W.g2.connect(L.w);
    var s4=nsrc('pink');W.f3=filt('bandpass',900,18);W.g3=ac.createGain();W.g3.gain.value=0.004;s4.connect(W.f3);W.f3.connect(W.g3);W.g3.connect(L.w);
    addEv('w',0,function(t){
      var g=Math.random()<0.35?rnd(0.8,1):rnd(0.25,0.6);
      W.g1.gain.setTargetAtTime(g*0.95,t,rnd(1.2,2.2));W.f1.frequency.setTargetAtTime(280+g*540,t,1.5);
      W.g2.gain.setTargetAtTime(g*g*0.4,t,1.2);W.f3.frequency.setTargetAtTime(rnd(650,1200),t,0.8);W.g3.gain.setTargetAtTime(g>0.75?rnd(0.03,0.09):0.004,t,0.9);
      return rnd(2.2,5);
    });
    /* night: soft low air, faint shimmer, an owl now and then */
    var nb=nsrc('brown'),nl=filt('lowpass',260,0.4),ng=ac.createGain();ng.gain.value=0.5;lfo(0.05,0.15,ng.gain);nb.connect(nl);nl.connect(ng);ng.connect(L.n);
    var nh=nsrc('white'),nf=filt('bandpass',7000,0.4),nhg=ac.createGain();nhg.gain.value=0.012;nh.connect(nf);nf.connect(nhg);nhg.connect(L.n);
    addEv('n',rnd(3,8),function(t){
      var pn=pan(rnd(-0.7,0.7));pn.connect(L.n);var f=rnd(300,360);
      toneSweep(t,f,f*0.9,0.42,0.22,pn,'sine',0.06);toneSweep(t+0.55,f*0.97,f*0.85,0.6,0.2,pn,'sine',0.06);
      return rnd(14,30);
    });
    /* crickets */
    [[4300,1.0],[4650,1.5],[5050,2.1],[3900,2.8]].forEach(function(x){
      var pn=pan(rnd(-0.9,0.9));pn.connect(L.c);
      addEv('c',rnd(0,1.2),function(t){trill(t,x[0]*rnd(0.99,1.01),pn);return x[1]*rnd(0.7,1.4);});
    });
    /* crowd: many voiceless-word "mumble" voices (glottal source through vowel formants), no words */
    var bed=nsrc('pink'),bl=filt('lowpass',700,0.5),bg=ac.createGain();bg.gain.value=0.05;bed.connect(bl);bl.connect(bg);bg.connect(L.k);
    var q;for(q=0;q<9;q++){(function(){var v=mkVoice();addEv('k',rnd(0,1.5),function(t){return syl(v,t);});})();}
    /* caravan: camel bells and soft footfalls on sand */
    var bi=0,st=0;
    addEv('m',0.3,function(t){var f=(bi++%2)?rnd(520,600):rnd(700,790);bellHit(t,f,0.07,L.m);if(Math.random()<0.45){bellHit(t+rnd(0.22,0.34),f*0.78,0.05,L.m);}return rnd(0.7,1.3);});
    addEv('m',0.1,function(t){hoofHit(t,(st++%2)?0.32:0.45,L.m);return 0.64*rnd(0.94,1.07);});
    /* distant battle: war drum, sword clashes, galloping hooves */
    addEv('b',1,function(t){var n=Math.random()<0.5?3:2,i;for(i=0;i<n;i++){drumHit(t+i*0.5,0.5,L.b);}return rnd(3.5,7);});
    addEv('b',0.5,function(t){clash(t,L.b);if(Math.random()<0.4){clash(t+rnd(0.12,0.25),L.b);clash(t+rnd(0.3,0.5),L.b);}return rnd(0.7,2.2);});
    addEv('b',4,function(t){var r=(rnd(7,13))|0,i;for(i=0;i<r;i++){hoofHit(t+i*0.4,0.3,L.b);hoofHit(t+i*0.4+0.11,0.22,L.b);hoofHit(t+i*0.4+0.2,0.26,L.b);}return rnd(10,16);});
    /* birds: chirp phrases, two-note whistles, dove coos */
    addEv('a',1,function(t){
      var pn=pan(rnd(-0.8,0.8)),r=Math.random(),f,i,n;pn.connect(L.a);
      if(r<0.45){n=(rnd(2,5))|0;f=rnd(3000,4600);for(i=0;i<n;i++){toneSweep(t+i*rnd(0.1,0.16),f*rnd(0.95,1.05),f*rnd(1.25,1.5),0.07,0.24,pn,'sine',0.008);}}
      else if(r<0.75){f=rnd(2200,3000);toneSweep(t,f,f*0.82,0.28,0.22,pn,'sine',0.02);toneSweep(t+0.34,f*0.9,f*1.1,0.22,0.2,pn,'sine',0.02);}
      else{f=rnd(380,470);cooNote(t,f,0.28,pn);cooNote(t+0.38,f*0.93,0.22,pn);cooNote(t+0.7,f*0.93,0.5,pn);}
      return rnd(1.2,5.5);
    });
    /* cave water drops (strong echo) */
    addEv('d',0.5,function(t){var f=rnd(700,1000);toneSweep(t,f,f*2,0.14,0.45,L.d,'sine',0.002);if(Math.random()<0.25){toneSweep(t+rnd(0.25,0.5),f*1.1,f*2.2,0.12,0.3,L.d,'sine',0.002);}return rnd(1.4,4);});
    /* fire: warm bed + random crackles */
    var fb=nsrc('brown'),fl=filt('lowpass',900,0.5),fg=ac.createGain();fg.gain.value=0.16;lfo(0.7,0.05,fg.gain);fb.connect(fl);fl.connect(fg);fg.connect(L.f);
    addEv('f',0,function(t){noiseHit(t,rnd(0.012,0.04),'bandpass',rnd(1400,4200),1.2,rnd(0.12,0.55),L.f);return Math.max(0.01,-Math.log(Math.random())*0.11);});
  }
  function tick(){
    if(!ac||!on||!vol){return;}
    var m=MIX[cur]||DEF,now=ac.currentTime,lim=now+1.0;
    EVL.forEach(function(e){
      if(!(m[e.k]>0.02)||!LON[e.k]){if(e.t<now){e.t=now+0.3;}return;}
      var n=0,dt;
      while(e.t<lim&&n++<60){dt=e.fn(Math.max(e.t,now));e.t+=dt;}
    });
  }
  function names(m){var a=[];KEYS.forEach(function(k){if(m[k]>=0.25&&LON[k]){a.push(NAME[k]);}});return a.slice(0,3).join(' · ');}
  function apply(force){
    if(!ac){return;}
    var i=sceneF().i,id=secs[i]?secs[i].id:'';
    if(!force&&id===cur){return;}
    cur=id;
    var m=MIX[id]||DEF,t=ac.currentTime,txt=names(m);
    /* crossfade over ~1.5 s; the on/off master stays separate */
    KEYS.forEach(function(k){L[k].gain.setTargetAtTime(on&&LON[k]?(m[k]||0):0,t,0.7);});
    rvWet.gain.setTargetAtTime((m.r==null?0.3:m.r)*0.9,t,0.8);
    document.getElementById('windMood').textContent=txt;
    btn.title=btn.getAttribute('aria-pressed')==='true'&&txt?('এখন: '+txt):'';
  }
  function set(v){
    on=v;btn.setAttribute('aria-pressed',v?'true':'false');
    document.getElementById('windIc').textContent=v?'🔊':'🔇';
    document.getElementById('windTx').textContent=v?'পরিবেশের সুর: চালু':'পরিবেশের সুর: বন্ধ';
    if(!v){document.getElementById('windMood').textContent='';btn.title='';}
  }
  var pend=0;
  window.addEventListener('scroll',function(){
    if(!on||pend){return;}
    pend=setTimeout(function(){pend=0;apply(false);},180);
  },{passive:true});
  btn.addEventListener('click',function(){
    try{
      if(!ac){build();}
      clearTimeout(timer);
      if(!on){
        ac.resume();set(true);apply(true);
        master.gain.setTargetAtTime(lvl(),ac.currentTime,0.8);
        clearInterval(sched);sched=setInterval(tick,250);tick();
      }else{
        master.gain.setTargetAtTime(0,ac.currentTime,0.4);
        clearInterval(sched);set(false);
        timer=setTimeout(function(){if(!on){ac.suspend();}},1800);
      }
    }catch(e){bar.hidden=true;}
  });

  /* settings panel: volume slider and one switch per layer */
  var setBtn=document.getElementById('windSet'),panel=document.getElementById('windPanel'),volEl=document.getElementById('windVol'),volOut=document.getElementById('windVolOut'),lyBtns=[].slice.call(document.querySelectorAll('#windLayers button'));
  function bn(x){return String(x).replace(/\d/g,function(d){return '০১২৩৪৫৬৭৮৯'.charAt(+d);});}
  function showVol(){var p=Math.round(vol*100);volEl.value=p;volOut.textContent=bn(p)+'%';volEl.setAttribute('aria-valuetext',bn(p)+' শতাংশ');}
  function closePanel(){panel.hidden=true;setBtn.setAttribute('aria-expanded','false');}
  lyBtns.forEach(function(b){
    var k=b.getAttribute('data-l');b.setAttribute('aria-pressed',LON[k]?'true':'false');
    b.addEventListener('click',function(){LON[k]=!LON[k];b.setAttribute('aria-pressed',LON[k]?'true':'false');save();apply(true);if(on){tick();}});
  });
  volEl.addEventListener('input',function(){vol=clamp(volEl.value/100,0,1);showVol();if(ac&&on){master.gain.setTargetAtTime(lvl(),ac.currentTime,0.05);}});
  volEl.addEventListener('change',save);
  setBtn.addEventListener('click',function(){var opening=panel.hidden;panel.hidden=!opening;setBtn.setAttribute('aria-expanded',opening?'true':'false');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){closePanel();setBtn.focus();}});
  document.addEventListener('pointerdown',function(e){if(!panel.hidden&&!bar.contains(e.target)){closePanel();}});
  showVol();
  document.addEventListener('visibilitychange',function(){
    if(!ac||!on){return;}
    if(document.hidden){ac.suspend();clearInterval(sched);}
    else{ac.resume().then(function(){EVL.forEach(function(c){c.t=Math.max(c.t,ac.currentTime);});});clearInterval(sched);sched=setInterval(tick,250);}
  });
})();
