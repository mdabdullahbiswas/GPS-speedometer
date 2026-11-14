/* ২ডি ইন্টারঅ্যাকটিভ মানচিত্র: লেখা js/data/map-places.js-এ */
(function(){
'use strict';
var SIRAT=window.SIRAT;
/* interactive map */
(function(){
  var D=SIRAT.data.mapPlaces;
  var pts=[].slice.call(document.querySelectorAll('.mapbox .pt')),box=document.getElementById('minfo');
  function pick(g){
    var d=D[g.getAttribute('data-k')];if(!d||!box){return;}
    pts.forEach(function(p){var on=p===g;p.classList.toggle('on',on);p.setAttribute('aria-pressed',on?'true':'false');});
    box.innerHTML='<h3>'+d[0]+'</h3>'+d[1]+'<span class="src">সূত্র: '+d[2]+'</span>';
  }
  pts.forEach(function(g){
    g.addEventListener('click',function(){pick(g);});
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(g);}});
  });
})();
})();
