/* অ্যাক্সেসিবিলিটি: লেখার আকার, লাইনের ফাঁক, উচ্চ কনট্রাস্ট ইত্যাদি */
(function(){
var root=document.documentElement,KEY='sirat-a11y',btn=document.getElementById('a11yBtn'),p=document.getElementById('a11yP');
if(!btn||!p){return;}
var S={fs:100,lh:0,font:0,hc:0,ul:0,rm:0},STEPS=[90,100,115,130,150,175,200];
try{var o=JSON.parse(localStorage.getItem(KEY)||'{}')||{};for(var k in S){if(o[k]!==undefined){S[k]=o[k];}}}catch(e){}
if(STEPS.indexOf(S.fs)<0){S.fs=100;}
var bn=function(n){return String(n).replace(/\d/g,function(d){return '০১২৩৪৫৬৭৮৯'[d];});};
function apply(){
  root.style.setProperty('--a-fs',S.fs/100);
  ['lh','font','hc','ul','rm'].forEach(function(k){root.classList.toggle('a-'+k,!!S[k]);var b=p.querySelector('[data-k="'+k+'"]');b.setAttribute('aria-pressed',S[k]?'true':'false');b.textContent=S[k]?'চালু':'বন্ধ';});
  document.getElementById('a11yFsV').textContent=bn(S.fs)+'%';
  document.getElementById('a11yMinus').disabled=S.fs<=STEPS[0];
  document.getElementById('a11yPlus').disabled=S.fs>=STEPS[STEPS.length-1];
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
  window.dispatchEvent(new Event('resize'));
}
function openP(o){p.hidden=!o;btn.setAttribute('aria-expanded',o?'true':'false');if(o){p.querySelector('button').focus();}}
btn.addEventListener('click',function(){openP(p.hidden);});
document.getElementById('a11yMinus').addEventListener('click',function(){var i=STEPS.indexOf(S.fs);if(i>0){S.fs=STEPS[i-1];apply();}});
document.getElementById('a11yPlus').addEventListener('click',function(){var i=STEPS.indexOf(S.fs);if(i<STEPS.length-1){S.fs=STEPS[i+1];apply();}});
p.querySelectorAll('[data-k]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.k;S[k]=S[k]?0:1;apply();});});
document.getElementById('a11yReset').addEventListener('click',function(){S={fs:100,lh:0,font:0,hc:0,ul:0,rm:0};apply();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!p.hidden){e.stopPropagation();openP(false);btn.focus();}},true);
document.addEventListener('pointerdown',function(e){if(!p.hidden&&!e.target.closest('#a11yP,#a11yBtn')){openP(false);}});
apply();
})();
