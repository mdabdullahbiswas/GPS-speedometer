/* শুরু: দুর্বল ডিভাইস শনাক্ত (হালকা মোড), ৩ডি চালু করা, না পারলে বার্তা */
(function(){
'use strict';
var SIRAT=window.SIRAT;
var Q=SIRAT.Q=(function(){var o={};try{o=JSON.parse(localStorage.getItem('sirat-q')||'{}')||{};}catch(e){}var w=navigator.deviceMemory,c=navigator.hardwareConcurrency;if(o.lite===undefined){o.lite=!!((w&&w<=2)||(c&&c<=3));}return o;})();
window.__s3={tod:(Q.tod>0&&Q.tod<5)?(Q.tod|0):0,wx:(Q.wx>0&&Q.wx<3)?(Q.wx|0):0,off:!!Q.off,lite:!!Q.lite,explore:false,cy:0,cx:0,ty:0,tx:0,init:false};
var ok=false;
var why='';
try{ok=!Q.off&&SIRAT.initScene();if(!ok&&!Q.off){why=window.THREE?'WebGL চালু করা যায়নি':'Three.js লাইব্রেরি লোড হয়নি (ইন্টারনেট/CDN ব্লক)';}}catch(err){ok=false;why='৩ডি ত্রুটি: '+(err&&err.message?err.message:err);if(window.console){console.error(err);}}
if(!ok){document.documentElement.classList.add('nogl');
 if(why){var bn=document.createElement('div');bn.setAttribute('role','status');bn.style.cssText='position:fixed;z-index:40;top:64px;left:50%;transform:translateX(-50%);max-width:92vw;padding:.45rem .9rem;border-radius:10px;background:rgba(120,30,30,.92);color:#fff;font-size:.85rem;line-height:1.5;text-align:center';bn.textContent='পেছনের ৩ডি দৃশ্য বন্ধ: '+why+' (বন্ধ করতে চাপুন)';bn.onclick=function(){bn.remove();};document.body.appendChild(bn);}}
window.__s3.init=!!ok;
})();
