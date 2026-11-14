/* খায়বারের দুর্গ-বসতি (টাইমলাইনের মানচিত্র)।
   "খায়বার অভিযান" ঘটনাটি খুললে মানচিত্রে খায়বারের বিন্দুর পাশে ছোট একটি ত্রিমাত্রিক ডায়োরামা ফুটে ওঠে:
   কালো আগ্নেয় পাথরের মালভূমি, টিলার ওপর একটি দুর্গ, মালভূমিতে আরও কয়েকটি দুর্গ ও টাওয়ার-ঘর, পলেস্তারার ঘরবাড়ি ও খেজুরবাগান।
   নকশা কল্পিত; কোন দুর্গ কোথায় ছিল তার হুবহু চিত্র নয় (পেজের লেখাতেও কেবল "দুর্গগুলো" বলা আছে)।
   scene.js থেকে ctx.mapGeo (মানচিত্রের স্থানাঙ্ক) ও ctx.palm (খেজুর গাছের মডেল) আসে; না থাকলে কিছুই যোগ হয় না। */
(function(){
'use strict';
var SIRAT=window.SIRAT,focus='overview',ka=0,grp=null,G=null,S0=0.65;
window.addEventListener('tlfocus',function(e){focus=(e&&e.detail)||'overview';});

SIRAT.parts.push({name:'khaybar-forts',
  init:function(ctx){
    G=ctx.mapGeo;
    if(!G||!G.PL||!G.PL.khaybar||!G.arab){if(window.console){console.warn('[khaybar-forts] ctx.mapGeo নেই: scene.js-এ হুক বসানো হয়নি');}G=null;return;}
    var THREE=ctx.THREE,K=SIRAT.fortKit(ctx),B=new K.Builder(),noise=ctx.noise,w=G.PL.khaybar.w,i,Y=1.0;
    grp=new THREE.Group();

    /* কালো পাথুরে মালভূমি */
    grp.add(K.terrace([[-24,-12],[-9,-16],[8,-16],[22,-10],[25,4],[18,15],[0,17],[-17,14],[-25,3]],0,Y,0x4e463e));

    /* টিলা (বসানো অবস্থানেই গড়া): চূড়া সমতল করা, তার ওপর দুর্গ */
    var hx=-9,hz=-4,hy=0.4,hg=new THREE.IcosahedronGeometry(1,4),hp=hg.attributes.position,qx,qy,qz,nn,q;
    for(i=0;i<hp.count;i++){
      qx=hp.getX(i);qy=hp.getY(i);qz=hp.getZ(i);
      nn=noise(qx*3+7,qz*3+qy*2)*0.55+noise(qx*9,qz*9+qy*6)*0.3;q=1+(nn-0.4)*0.45;
      hp.setXYZ(i,qx*q*9,qy>0?Math.min(qy*q*7.5,6.2):qy*2,qz*q*8);
    }
    hg.computeVertexNormals();
    var hill=new THREE.Mesh(hg,ctx.cliffMat({color:0x6e655b,roughness:1},12,[1,1,1]));hill.position.set(hx,hy,hz);grp.add(hill);
    var ht=hy+6.2;
    B.enclosure(hx,hz,5.4,4.4,0.3,ht,{wallH:2.2,t:0.9,towerW:1.7,towerH:3.4,gate:1.4});
    B.tower(hx-0.4,hz-0.6,2.2,2.2,ht,4.4,0.3);

    /* মালভূমির দুর্গ: ফটকসহ বড় প্রাচীর, ভেতরে কেন্দ্রীয় টাওয়ার ও দুটি ঘর */
    B.enclosure(11,1,11,8,-0.1,Y,{wallH:3.2,t:1.2,towerW:2.6,towerH:5.2,gate:2.2});
    B.tower(12.5,-0.8,3.2,3.2,Y,6.6,-0.1);
    B.house(8.4,2.4,2.4,2.2,2.2,-0.1,Y);B.house(14.2,3.0,2.2,2.0,2.0,-0.1,Y);
    /* আরও দুটি ছোট দুর্গ-ঘেরা টাওয়ার-ঘর */
    B.enclosure(-17,8,6,5,0.2,Y,{wallH:2.6,t:1.0,towerW:1.9,towerH:4.2,gate:1.6});
    B.tower(-17.3,7.4,2.4,2.4,Y,5.2,0.2);
    B.enclosure(4,-11,5,4.2,-0.2,Y,{wallH:2.4,t:1.0,towerW:1.8,towerH:3.8,gate:1.4});
    B.tower(4.2,-11.5,2.6,2.6,Y,5.4,-0.2);
    /* বসতির ঘর */
    [[-3,9.5,3.2,2.8,2.4,0.1],[0.5,12,3.6,3.0,2.8,-0.1],[4,9.2,3.0,2.6,2.2,0.2],[-6.5,12.5,3.2,2.8,2.6,0],
     [18,10.5,3.0,2.6,2.4,0.3],[21,5,2.8,2.6,2.2,0],[-20,-3,3.0,2.8,2.4,0.1]].forEach(function(h){B.house(h[0],h[1],h[2],h[3],h[4],h[5],Y);});

    B.add(grp);

    /* খেজুরবাগান: scene.js-এর আসল খেজুর-মডেল, গাছ-পিছু আলাদা উচ্চতা ও ঘূর্ণন */
    var P=ctx.palm;
    if(P&&P.meta&&P.mats){
      var top=-1e9,bot=1e9,pos=[[-3,7],[1.5,6.2],[-6,9.5],[4,13],[-9,12],[16,9],[20,0],[-21,3],[-19,-5],[22,-3],[9,-10],[-1,-9],[14,-6]],
          D=new THREE.Object3D(),seed=7;
      function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
      P.meta.forEach(function(d){if(d.c&&d.h){top=Math.max(top,d.c[1]+d.h[1]);bot=Math.min(bot,d.c[1]-d.h[1]);}});
      var H=(top>bot)?(top-bot):10,meshes=P.meta.map(function(d){var m=new THREE.InstancedMesh(P.geo(d),P.mats[d.mat],pos.length);m.frustumCulled=false;grp.add(m);return m;});
      pos.forEach(function(p,k){
        var s=6.5/H*(0.85+rnd()*0.3),j;
        D.position.set(p[0],Y-0.1-(bot<1e8?Math.min(bot,0)*s:0),p[1]);D.rotation.set(0,rnd()*6,0);D.scale.set(s,s,s);D.updateMatrix();
        for(j=0;j<meshes.length;j++){meshes[j].setMatrixAt(k,D.matrix);}
      });
    }

    /* মানচিত্রে খায়বারের বিন্দুর ডান পাশে বসে; ঘটনা না খুললে লুকানো */
    grp.position.set(w.x+16,G.MY+0.5,w.z-4);grp.scale.setScalar(S0*0.4);grp.visible=false;
    G.arab.add(grp);
  },
  update:function(fi){
    if(!grp){return;}
    var on=(focus==='khaybar')&&G.arab.visible,dt=fi.dt;
    ka=SIRAT.REDUCE?(on?1:0):(on?Math.min(1,ka+dt/1.4):Math.max(0,ka-dt/0.8));
    grp.visible=ka>0.01;
    if(grp.visible){
      var e=SIRAT.sstep(0,1,ka);
      grp.scale.setScalar(S0*(0.4+0.6*e));
    }
  }
});
})();
