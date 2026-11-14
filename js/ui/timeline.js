/* সময়রেখা (accordion + মানচিত্রে ফোকাস ইভেন্ট) */
(function(){var tl=document.getElementById('tl');if(!tl)return;document.documentElement.classList.add('tl-js');
var R=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,it=[].slice.call(tl.querySelectorAll('.tl-i')),dirty=0,tm,tk=0;
function so(li,o){li.classList.toggle('open',o);li.querySelector('.tl-h').setAttribute('aria-expanded',o?'true':'false');dirty=1}
function fill(){var l=null;it.forEach(function(x){if(x.classList.contains('open'))l=x});var h=0;if(l){h=l.querySelector('.tl-node').getBoundingClientRect().top-tl.getBoundingClientRect().top+6}tl.style.setProperty('--fill',Math.max(0,h)+'px')}
function settle(){fill();clearTimeout(tm);tm=setTimeout(function(){fill();if(dirty){dirty=0;window.dispatchEvent(new Event('resize'))}},750)}
var cur='';function foc(l){if(l&&l!==cur){cur=l;window.dispatchEvent(new CustomEvent('tlfocus',{detail:l}))}}
function near(){var sr=tl.getBoundingClientRect();if(sr.bottom<0||sr.top>innerHeight)return;var best=null,bd=1e9;it.forEach(function(li){if(!li.classList.contains('open'))return;var d=Math.abs(li.querySelector('.tl-h').getBoundingClientRect().top-innerHeight*.45);if(d<bd){bd=d;best=li}});if(best)foc(best.dataset.loc)}
function chk(){tk=0;var ln=innerHeight*.74;it.forEach(function(li){if(li.classList.contains('open')||li._m)return;var r=li.querySelector('.tl-h').getBoundingClientRect();if(r.top<ln&&r.bottom>0)so(li,true)});near();settle()}
it.forEach(function(li){li.querySelector('.tl-h').addEventListener('click',function(){var wo=li.classList.contains('open');li._m=1;so(li,!wo);if(!wo)foc(li.dataset.loc);settle()})});
tl.addEventListener('transitionend',fill);
var hb=document.getElementById('tlHl');hb.addEventListener('click',function(){var on=hb.getAttribute('aria-pressed')!=='true';hb.setAttribute('aria-pressed',on?'true':'false');tl.classList.toggle('hl',on);if(on){it.forEach(function(li){if(li.classList.contains('dis')&&li.getBoundingClientRect().bottom>0)so(li,true)})}settle()});
addEventListener('scroll',function(){if(!tk){tk=1;requestAnimationFrame(chk)}},{passive:true});
addEventListener('load',chk);
if(R){it.forEach(function(li){so(li,true)});dirty=0}
chk();
})();
