/* ৩ডি নিয়ন্ত্রণ বোতাম (ঘোরানো, আকাশ, আবহাওয়া, হালকা মোড) ও তথ্য-কার্ড */
(function(){
var SIRAT=window.SIRAT,S3=window.__s3||{},root=document.documentElement,$=function(i){return document.getElementById(i);},bE=$('cExp'),bL=$('cLite'),b3=$('c3d'),bT=$('cTime'),bW=$('cWx'),card=$('icard');
if(!bE||!card){return;}
function save(o){try{var c=JSON.parse(localStorage.getItem('sirat-q')||'{}')||{};for(var k in o){c[k]=o[k];}localStorage.setItem('sirat-q',JSON.stringify(c));}catch(e){}}
var INFO=SIRAT.data.info;   /* কার্ডের লেখা: js/data/info-cards.js */
function show(k){var d=INFO[k];if(!d){return;}card.innerHTML='<button type="button" class="x" aria-label="বন্ধ করুন">×</button><h3>'+d[0]+'</h3>'+d[1]+(d[2]?'<span class="src">সূত্র: '+d[2]+'</span>':'');card.hidden=false;card.querySelector('.x').onclick=function(){card.hidden=true;};}
function expl(on){S3.explore=on;root.classList.toggle('exp',on);bE.setAttribute('aria-pressed',on?'true':'false');bE.textContent=on?'পেজে ফিরুন':'৩ডি ঘুরিয়ে দেখুন';if(on){show('hint');}else{S3.ty=0;S3.tx=0;card.hidden=true;}}
function apply(){root.classList.toggle('gloff',!!S3.off);root.classList.toggle('nogl',!!S3.off||!S3.init);b3.setAttribute('aria-pressed',S3.off?'true':'false');bL.setAttribute('aria-pressed',S3.lite?'true':'false');if(S3.off&&S3.explore){expl(false);}}
bE.addEventListener('click',function(){expl(!S3.explore);});
bL.addEventListener('click',function(){save({lite:!S3.lite});location.reload();});
b3.addEventListener('click',function(){var off=!S3.off;save({off:off});if(!off&&!S3.init){location.reload();return;}S3.off=off;apply();});
if(!S3.init&&!S3.off){bE.hidden=true;bL.hidden=true;b3.hidden=true;bT.hidden=true;bW.hidden=true;}
var TODN=['আকাশ: স্বয়ংক্রিয়','আকাশ: ভোর','আকাশ: দিন','আকাশ: সন্ধ্যা','আকাশ: রাত'],WXN=['আবহাওয়া: পরিষ্কার','আবহাওয়া: মেঘ','আবহাওয়া: বালুঝড়'];
function skyLab(){bT.textContent=TODN[S3.tod|0];bT.setAttribute('aria-pressed',S3.tod?'true':'false');bW.textContent=WXN[S3.wx|0];bW.setAttribute('aria-pressed',S3.wx?'true':'false');}
bT.addEventListener('click',function(){S3.tod=((S3.tod|0)+1)%5;save({tod:S3.tod});skyLab();});
bW.addEventListener('click',function(){S3.wx=((S3.wx|0)+1)%3;save({wx:S3.wx});skyLab();});
skyLab();
apply();
var st=null;
var rel=0,hint=null;
function hideHint(){if(hint){hint.classList.remove('on');}}
addEventListener('pointerdown',function(e){if(e.target.closest&&e.target.closest('.ctl,.icard')){return;}if(!S3.explore&&!(e.target&&e.target.id==='stage')){return;}clearTimeout(rel);hideHint();st={x:e.clientX,y:e.clientY,t:Date.now(),mv:0,free:!S3.explore};});
addEventListener('pointermove',function(e){if(!st){return;}var dx=e.clientX-st.x,dy=e.clientY-st.y;st.mv+=Math.abs(dx)+Math.abs(dy);st.x=e.clientX;st.y=e.clientY;S3.ty=Math.max(-1.8,Math.min(1.8,S3.ty-dx*0.006));S3.tx=Math.max(-0.7,Math.min(0.7,S3.tx+dy*0.004));});
addEventListener('pointerup',function(e){if(!st){return;}var s=st;st=null;if(s.free&&!S3.explore){clearTimeout(rel);rel=setTimeout(function(){if(!st){S3.ty=0;S3.tx=0;}},2600);}if(s.mv<8&&Date.now()-s.t<500&&S3.pick){var k=S3.pick(e.clientX,e.clientY);if(k){if(k.indexOf('map:')===0){var mk=k.slice(4);show(mk);window.dispatchEvent(new CustomEvent('tlfocus',{detail:mk}));}else{show(k);}}}});
addEventListener('pointercancel',function(){var s=st;st=null;if(s&&s.free&&!S3.explore){clearTimeout(rel);rel=setTimeout(function(){S3.ty=0;S3.tx=0;},1200);}});
if(S3.init&&!S3.off){hint=document.createElement('div');hint.className='drag-hint';hint.setAttribute('aria-hidden','true');hint.textContent='লেখার পাশের ফাঁকা জায়গায় টেনে ৩ডি ঘুরিয়ে দেখুন';document.body.appendChild(hint);setTimeout(function(){hint.classList.add('on');},3500);setTimeout(hideHint,12000);}
addEventListener('keydown',function(e){if(e.key==='Escape'){if(!card.hidden){card.hidden=true;}else if(S3.explore){expl(false);}}});
})();
