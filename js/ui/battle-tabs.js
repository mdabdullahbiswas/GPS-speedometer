/* যুদ্ধ-ট্যাব (বদর, উহুদ, খন্দক, হুদাইবিয়া, তায়েফ): লেখা js/data/battles.js-এ */
(function(){
'use strict';
var SIRAT=window.SIRAT;
/* battle tabs */
(function(){
  var D=SIRAT.data.battles,
  btns=[].slice.call(document.querySelectorAll('.tabs button')),box=document.getElementById('winfo');
  function show(k){
    var d=D[k];SIRAT.warSel=k;
    btns.forEach(function(b,j){b.setAttribute('aria-pressed',j===k?'true':'false');});
    box.innerHTML='<h3>'+d[0]+'</h3><p><b>স্থান:</b> '+d[1]+'</p><p>'+d[2]+'</p>'+(d[4]?'<p class="small"><b>দৃশ্যের চিহ্ন:</b> '+d[4]+'</p>':'')+'<span class="src">সূত্র: '+d[3]+'</span>';
  }
  btns.forEach(function(b,j){b.addEventListener('click',function(){show(j);});});
  if(box){show(0);}
})();
})();
