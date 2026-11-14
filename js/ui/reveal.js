/* স্ক্রলে প্যানেল ও লেখা ধীরে ফুটে ওঠার অ্যানিমেশন */
'use strict';
(function(){
  var SIRAT=window.SIRAT,clamp=SIRAT.clamp,sstep=SIRAT.sstep,REDUCE=SIRAT.REDUCE,secs=SIRAT.secs,sceneF=SIRAT.sceneF;
  var olds=[].slice.call(document.querySelectorAll('.rv'));
  if(!('IntersectionObserver' in window)||REDUCE){olds.forEach(function(el){el.classList.add('in');});return;}
  olds.forEach(function(el){el.classList.remove('rv');});
  document.documentElement.classList.add('rv-on');
  var targets=[].slice.call(document.querySelectorAll('.panel'));
  var all=[].slice.call(document.querySelectorAll('.panel > *, .panel li, .panel dl > div, .end'));
  all.forEach(function(el){
    var tg=el.tagName;
    if(/^(UL|OL|DL|STYLE|SCRIPT|CANVAS)$/.test(tg)||el.classList.contains('ghost')){return;}
    if(el.closest('.minfo')){return;}
    if(el.parentElement&&el.parentElement.closest('[data-rv]')){return;}
    el.setAttribute('data-rv','1');targets.push(el);
  });
  targets.forEach(function(el){el.classList.add('rv');});
  var io=new IntersectionObserver(function(es){
    var vis=es.filter(function(e){return e.isIntersecting;}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top;});
    es.forEach(function(e){if(!e.isIntersecting&&e.boundingClientRect.top<0){e.target.classList.add('in');io.unobserve(e.target);}});
    vis.forEach(function(e,k){
      var el=e.target;
      el.style.setProperty('--d',(Math.min(k,8)*0.1)+'s');
      el.classList.add('in');io.unobserve(el);
      setTimeout(function(){el.style.setProperty('--d','0s');el.style.willChange='auto';},2600);
    });
  },{threshold:0,rootMargin:'0px 0px -9% 0px'});
  targets.forEach(function(el){io.observe(el);});
})();
