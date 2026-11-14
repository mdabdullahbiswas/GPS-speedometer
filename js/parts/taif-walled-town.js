/* তায়েফের প্রাচীরঘেরা শহর (battle-tabs-এর "তায়েফ" দৃশ্য, scene.js-এর W[4])।
   আগের সরল চোঙ-দেয়াল ও বাক্স-ঘরের জায়গায় বসে: উঁচু পাথুরে চত্বরের ওপর এবড়োখেবড়ো পাথরের প্রাচীর, কাঙ্গুরা,
   ব্লক-পাথরের টাওয়ার, দুই টাওয়ারের মাঝে ফটক (খোলা কপাট, ঢালু পথ) এবং ভেতরে পলেস্তারার ঘর।
   নকশা কল্পিত, ঐতিহাসিক মাপ বা ঠিক অবস্থানের চিত্র নয়। scene.js থেকে ctx.taifSite আসে; না থাকলে আগের দৃশ্যই থাকে। */
(function(){
'use strict';
var SIRAT=window.SIRAT;
SIRAT.parts.push({name:'taif-walled-town',
  init:function(ctx){
    var site=ctx.taifSite;
    if(!site){if(window.console){console.warn('[taif-walled-town] ctx.taifSite নেই: scene.js-এ হুক বসানো হয়নি');}return;}
    var THREE=ctx.THREE,K=SIRAT.fortKit(ctx),B=new K.Builder(),grp=new THREE.Group(),Y=1.5,WH=4.0,WT=1.6,
        cx0=0,cz0=-14,
        /* প্রাচীরের কোণ (স্থানীয় x,z); ৬ ও ৭ নম্বর কোণের মাঝের টানটিতে ফটক, মুখ দর্শকের (জনতার) দিকে */
        P=[[-13,-26],[-4,-29],[7,-28],[14,-21],[15,-11],[11,-2],[2,0],[-8,-1],[-14,-8],[-15,-18]],N=P.length,GI=6,i,a,b;

    /* উঁচু চত্বর: ফটকের দিক ছাড়া বাকিটা একটু বাইরে ছড়ানো */
    var tp=P.map(function(p,k){var f=(k===6||k===7)?1.1:1.2;return [cx0+(p[0]-cx0)*f,cz0+(p[1]-cz0)*f];});
    grp.add(K.terrace(tp,0,Y,0x8f806d));

    /* ফটকের মাপ */
    var A6=P[6],A7=P[(GI+1)%N],gx=(A6[0]+A7[0])/2,gz=(A6[1]+A7[1])/2,ux=A7[0]-A6[0],uz=A7[1]-A6[1],ul=Math.sqrt(ux*ux+uz*uz),o,nx,nz,rg;
    ux/=ul;uz/=ul;o=K.outward(A6[0],A6[1],A7[0],A7[1],cx0,cz0);nx=o[0];nz=o[1];rg=Math.atan2(-uz,ux);

    /* প্রাচীর ও কাঙ্গুরা */
    for(i=0;i<N;i++){
      a=P[i];b=P[(i+1)%N];
      if(i===GI){
        B.wall(a[0],a[1],gx-ux*4.5,gz-uz*4.5,Y,WH,WT,0.4);B.crenel(a[0],a[1],gx-ux*4.5,gz-uz*4.5,Y+WH,WT,cx0,cz0);
        B.wall(gx+ux*4.5,gz+uz*4.5,b[0],b[1],Y,WH,WT,0.4);B.crenel(gx+ux*4.5,gz+uz*4.5,b[0],b[1],Y+WH,WT,cx0,cz0);
      }else{
        B.wall(a[0],a[1],b[0],b[1],Y,WH,WT,0.4);B.crenel(a[0],a[1],b[0],b[1],Y+WH,WT,cx0,cz0);
      }
    }
    /* কোণের টাওয়ার (ফটকের দুই কোণে স্তম্ভ) */
    for(i=0;i<N;i++){
      if(i===GI||i===(GI+1)%N){B.box('rub',P[i][0],Y,P[i][1],2.0,WH+0.6,2.0,0);continue;}
      B.tower(P[i][0],P[i][1],3.4,3.4,Y,(i%2?5.4:6.2),0);
    }
    /* ফটকের দুই টাওয়ার, মাঝে লিন্টেল */
    B.tower(gx-ux*3.1,gz-uz*3.1,3.2,3.6,Y,6.8,rg);
    B.tower(gx+ux*3.1,gz+uz*3.1,3.2,3.6,Y,6.8,rg);
    B.box('tri',gx,Y+3.0,gz,3.4,1.5,3.0,rg);
    B.box('cor',gx,Y+4.5,gz,3.4,0.5,3.2,rg);
    [-0.9,0.9].forEach(function(s){var q=K.loc(gx,gz,rg,s,1.2);B.box('rub',q[0],Y+5.0,q[1],0.95,0.9,0.6,rg);});
    /* খোলা কপাট দুটি */
    [-1,1].forEach(function(s){
      B.box('wood',gx+ux*s*1.45+nx*2.6,Y,gz+uz*s*1.45+nz*2.6,0.14,2.7,1.6,rg);
    });
    B.ramp(gx,gz,ux,uz,nx,nz,1.9,1.9,5.5,Y);

    /* ভেতরের ঘর: [x,z,প্রস্থ,গভীরতা,উচ্চতা,ঘূর্ণন]; ফটক থেকে ভেতরের পথ (x -5..-1) ফাঁকা রাখা */
    [[-9,-22,3.6,3.2,2.8,0.1],[-3,-24,4.2,3.4,3.4,-0.05],[4,-24,3.4,3.0,2.6,0.2],[10,-17,3.2,3.6,3.0,0],
     [8,-9,3.6,3.2,2.6,0.15],[-10,-14,3.4,3.8,3.0,0],[-8,-7,3.2,3.0,2.4,-0.1],[2,-17,4.8,3.6,3.8,0.05],
     [-3,-14,3.2,3.2,2.6,0.2],[5,-4,3.0,2.6,2.4,0]].forEach(function(h){B.house(h[0],h[1],h[2],h[3],h[4],h[5],Y);});

    B.add(grp);
    site.group.add(grp);
    /* আগের সরল চোঙ-দেয়াল ও বাক্স-ঘর লুকানো */
    site.old.forEach(function(m){m.visible=false;});
  }
});
})();
