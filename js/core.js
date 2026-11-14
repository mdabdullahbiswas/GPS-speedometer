/* মূল পেজ-লজিক: স্ক্রলের সঙ্গে অধ্যায় বদল, প্রগ্রেস বার, ডট-নেভ, বংশধারা।
   অন্য ফাইলের জন্য যা দেয়: SIRAT.clamp, sstep, REDUCE, secs, tops, sceneF(), measure(), warSel */
(function(){
'use strict';
var SIRAT=window.SIRAT;
var REDUCE=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function clamp(x,a,b){return Math.min(b,Math.max(a,x));}
function sstep(a,b,x){x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);}

/* ---------- page UI ---------- */
var secs=[].slice.call(document.querySelectorAll('[data-scene]'));
var tops=[];
function measure(){var a=secs.map(function(s){return s.getBoundingClientRect().top+window.scrollY;});tops.length=0;[].push.apply(tops,a);}
function sceneF(){
  var y=window.scrollY+window.innerHeight*0.45,i=0,k;
  for(k=0;k<tops.length;k++){if(y>=tops[k]){i=k;}}
  var last=(i>=tops.length-1);
  var end=last?document.documentElement.scrollHeight:tops[i+1];
  var s=clamp((y-tops[i])/Math.max(1,end-tops[i]),0,1);
  var t=last?0:sstep(0.45,1,s);
  return {i:i,t:t,f:i+t};
}

var chap=document.getElementById('chap'),bar=document.getElementById('bar'),dotsEl=document.getElementById('dots');
var chain=document.getElementById('chain'),nodes=chain?[].slice.call(chain.children):[];
secs.forEach(function(s){
  var a=document.createElement('a');
  a.href='#'+s.id;a.setAttribute('data-t',s.getAttribute('data-label'));a.setAttribute('aria-label',s.getAttribute('data-label'));
  dotsEl.appendChild(a);
});
var dotLinks=[].slice.call(dotsEl.children);
var curChap=-1,ticking=false;
function onScroll(){
  var H=document.documentElement.scrollHeight-window.innerHeight;
  bar.style.setProperty('--sp',H>0?clamp(window.scrollY/H,0,1):0);
  var i=sceneF().i;
  if(i!==curChap){
    curChap=i;
    chap.classList.add('swap');
    setTimeout(function(){chap.textContent=secs[i].getAttribute('data-label');chap.classList.remove('swap');},180);
    dotLinks.forEach(function(d,k){d.classList.toggle('on',k===i);});
    try{var cs=getComputedStyle(secs[i]),rt=document.documentElement.style;rt.setProperty('--hd',cs.getPropertyValue('--gold'));rt.setProperty('--hd-hi',cs.getPropertyValue('--gold-hi'));rt.setProperty('--hd2',cs.getPropertyValue('--g2')||cs.getPropertyValue('--gold'));rt.setProperty('--hd-rgb',cs.getPropertyValue('--ac-rgb'));rt.setProperty('--hd2-rgb',cs.getPropertyValue('--ac2-rgb'));}catch(e){}
  }
  if(chain){
    var r=chain.getBoundingClientRect();
    chain.style.setProperty('--p',clamp((window.innerHeight*0.62-r.top)/r.height,0,1));
    var lim=window.innerHeight*0.64;
    nodes.forEach(function(n){var b=n.getBoundingClientRect();n.classList.toggle('on',b.top+22<lim);});
  }
  ticking=false;
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(onScroll);}}
window.addEventListener('scroll',req,{passive:true});
window.addEventListener('resize',function(){measure();req();});
measure();onScroll();
window.addEventListener('load',function(){measure();onScroll();});
SIRAT.REDUCE=REDUCE;SIRAT.clamp=clamp;SIRAT.sstep=sstep;
SIRAT.secs=secs;SIRAT.tops=tops;SIRAT.sceneF=sceneF;SIRAT.measure=measure;
SIRAT.warSel=0;   /* কোন যুদ্ধ-ট্যাব খোলা (০–৪) */
})();
