/* দুর্গ-কিট: তায়েফ ও খায়বারের পাথরের দেয়াল, টাওয়ার, ফটক ও ঘর বানানোর সহায়ক।
   তিন সেট টেক্সচার (js/assets/tex-fort.js): rub = এবড়োখেবড়ো পাথর (দেয়াল), pla = পলেস্তারা (ঘর), tri = ব্লক-পাথর + কার্নিশ (টাওয়ার, ফটক)।
   এটি নিজে কোনো part নয়; taif-walled-town.js ও khaybar-forts.js এটি ডাকে: var K=SIRAT.fortKit(ctx);
   সব জ্যামিতি এক জায়গায় জমিয়ে (Builder) ম্যাটেরিয়াল-পিছু একটি করে Mesh বানানো হয়, তাই ড্র-কল কম। */
(function(){
'use strict';
var SIRAT=window.SIRAT;

/* এক টাইল = কত একক (টেক্সচারের এক পুরো ছবি দৃশ্যে কতটা জায়গা নেয়) */
var TILE={rub:8,pla:6,tri:8,cor:8};
/* trim শিটে (v ওপরে বাড়ে): ব্লকের তিন সারির অংশ ও কার্নিশের অংশ। দুই প্রান্তই মর্টারের রেখা, তাই একটার ওপর একটা সাজালে জোড় বোঝা যায় না */
var VLO=0.248,VHI=0.624,CV0=0.74,CV1=1.0;
/* ব্লকের ওপরের (মাথার) তলের জন্য একটি সমতল পাথরের টুকরো */
var TOPUV=[[0.20,0.40],[0.34,0.40],[0.34,0.48],[0.20,0.48]];
/* বাক্সের পাঁচ তল: [bl,br,tr,tl] কোণ, বাইরে থেকে দেখলে ঘড়ির উল্টো দিকে */
var FACES=[
  [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],
  [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],
  [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
  [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],
  [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]
];
function frac(x){return x-Math.floor(x);}
function lerp3(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function hyp(a,b){var x=b[0]-a[0],z=b[2]-a[2];return Math.sqrt(x*x+z*z);}

SIRAT.fortKit=function(ctx){
  if(SIRAT._fortKit){return SIRAT._fortKit;}
  var THREE=ctx.THREE,small=ctx.small,A=SIRAT.assets&&SIRAT.assets.fort;
  if(!A){throw new Error('SIRAT.assets.fort নেই: index.html-এ js/assets/tex-fort.js যোগ করুন');}
  var L=ctx.texLoader;
  function tex(src){var t=L.load(src);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=small?2:6;return t;}
  function tset(d,n,r){return {d:tex(A[d]),n:small?null:tex(A[n]),r:small?null:tex(A[r])};}
  var S={rub:tset('wallD','wallN','wallR'),pla:tset('plD','plN','plR'),tri:tset('trD','trN','trR')};
  /* রাতে ঘন অন্ধকারে না ডোবে বলে রঙের ছবি দিয়েই সামান্য আলো (কাবা ও অন্য মডেলের মতো) */
  function mat(key,tint){
    var s=S[key],o={map:s.d,color:tint==null?0xffffff:tint,roughness:1,metalness:0,emissive:0x4a4034,emissiveMap:s.d,emissiveIntensity:0.4};
    if(s.n){o.normalMap=s.n;o.normalScale=new THREE.Vector2(1,1);}
    if(s.r){o.roughnessMap=s.r;}
    return new THREE.MeshStandardMaterial(o);
  }
  var mats={rub:mat('rub',0xf2e6d2),pla:mat('pla',0xfff3e0),tri:mat('tri',0xf8ecd6),
    dark:new THREE.MeshBasicMaterial({color:0x14110e}),
    wood:new THREE.MeshStandardMaterial({color:0x4a3626,roughness:1,flatShading:true})};

  /* ---------- জ্যামিতি জমানোর থলি ---------- */
  function GB(){this.P=[];this.N=[];this.U=[];this.I=[];this.n=0;}
  /* a,b,c,d বাইরে থেকে দেখলে ঘড়ির উল্টো দিকে। hint দিলে উল্টো হলে নিজেই ঘুরিয়ে নেয়। ত্রিভুজ চাইলে c ও d একই দিন */
  GB.prototype.quad=function(a,b,c,d,ua,ub,uc,ud,hint){
    var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2],
        nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.sqrt(nx*nx+ny*ny+nz*nz),t,k;
    if(l<1e-9){return;}
    nx/=l;ny/=l;nz/=l;
    if(hint&&nx*hint[0]+ny*hint[1]+nz*hint[2]<0){t=b;b=d;d=t;t=ub;ub=ud;ud=t;nx=-nx;ny=-ny;nz=-nz;}
    var V=[a,b,c,d],U=[ua,ub,uc,ud],base=this.n;
    for(k=0;k<4;k++){this.P.push(V[k][0],V[k][1],V[k][2]);this.N.push(nx,ny,nz);this.U.push(U[k][0],U[k][1]);}
    this.I.push(base,base+1,base+2,base,base+2,base+3);this.n+=4;
  };
  GB.prototype.geo=function(){
    if(!this.n){return null;}
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(this.P),3));
    g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(this.N),3));
    g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(this.U),2));
    g.setIndex(new THREE.BufferAttribute(this.n>65000?new Uint32Array(this.I):new Uint16Array(this.I),1));
    return g;
  };

  /* ঘূর্ণন: স্থানীয় (lx,lz) → জগতের [x,z]। স্থানীয় x-অক্ষ ry কোণে ঘোরে */
  function loc(cx,cz,ry,lx,lz){var c=Math.cos(ry),s=Math.sin(ry);return [cx+lx*c+lz*s,cz-lx*s+lz*c];}
  /* (ax,az)→(bx,bz) রেখার বাইরের দিকের একক ভেক্টর, যেদিকে (px,pz) নেই */
  function outward(ax,az,bx,bz,px,pz){
    var dx=bx-ax,dz=bz-az,l=Math.sqrt(dx*dx+dz*dz)||1,nx=dz/l,nz=-dx/l,mx=(ax+bx)/2-px,mz=(az+bz)/2-pz;
    if(nx*mx+nz*mz<0){nx=-nx;nz=-nz;}return [nx,nz];
  }

  function Builder(){this.g={rub:new GB(),pla:new GB(),tri:new GB(),dark:new GB(),wood:new GB()};}

  /* kind: rub | pla | tri (ব্লক, ব্যান্ড করা) | cor (কার্নিশ) | dark | wood.  y0 = তলার উচ্চতা, ry = Y-অক্ষে ঘূর্ণন */
  Builder.prototype.box=function(kind,cx,y0,cz,w,h,d,ry,seed){
    ry=ry||0;
    var g=this.g[kind==='cor'?'tri':kind],T=TILE[kind]||8,c=Math.cos(ry),s=Math.sin(ry),uo=frac(cx*0.37+cz*0.61+(seed||0)),
        textured=(kind==='rub'||kind==='pla'||kind==='tri'||kind==='cor'),f,k,F,p,du,ya,yb,ta,tb,bandH,pa0,pa1,pb0,pb1,va,vb;
    function pt(q){var lx=q[0]*w/2,lz=q[2]*d/2;return [cx+lx*c+lz*s,y0+(q[1]>0?h:0),cz-lx*s+lz*c];}
    for(f=0;f<5;f++){
      F=FACES[f];p=[pt(F[0]),pt(F[1]),pt(F[2]),pt(F[3])];
      if(f===4){
        if(!textured){g.quad(p[0],p[1],p[2],p[3],[0,0],[0,0],[0,0],[0,0]);}
        else if(kind==='tri'||kind==='cor'){g.quad(p[0],p[1],p[2],p[3],TOPUV[0],TOPUV[1],TOPUV[2],TOPUV[3]);}
        else{g.quad(p[0],p[1],p[2],p[3],[p[0][0]/T,p[0][2]/T],[p[1][0]/T,p[1][2]/T],[p[2][0]/T,p[2][2]/T],[p[3][0]/T,p[3][2]/T]);}
        continue;
      }
      if(!textured){g.quad(p[0],p[1],p[2],p[3],[0,0],[0,0],[0,0],[0,0]);continue;}
      du=hyp(p[0],p[1])/T;
      if(kind==='tri'){
        bandH=(VHI-VLO)*T;
        for(k=0;;k++){
          ya=k*bandH;if(ya>=h-1e-4){break;}
          yb=Math.min(h,ya+bandH);ta=ya/h;tb=yb/h;
          pa0=lerp3(p[0],p[3],ta);pa1=lerp3(p[1],p[2],ta);pb0=lerp3(p[0],p[3],tb);pb1=lerp3(p[1],p[2],tb);
          va=VLO;vb=VLO+(VHI-VLO)*(yb-ya)/bandH;
          g.quad(pa0,pa1,pb1,pb0,[uo,va],[uo+du,va],[uo+du,vb],[uo,vb]);
        }
      }else if(kind==='cor'){
        g.quad(p[0],p[1],p[2],p[3],[uo,CV0],[uo+du,CV0],[uo+du,CV1],[uo,CV1]);
      }else{
        g.quad(p[0],p[1],p[2],p[3],[uo,0],[uo+du,0],[uo+du,h/T],[uo,h/T]);
      }
    }
  };

  /* দেয়ালের একটি খণ্ড (a→b), ভিত y0, উচ্চতা h, পুরুত্ব t; দুই মাথায় ext করে বাড়ানো */
  Builder.prototype.wall=function(ax,az,bx,bz,y0,h,t,ext){
    var dx=bx-ax,dz=bz-az,len=Math.sqrt(dx*dx+dz*dz),e=ext==null?0.4:ext;
    if(len<0.05){return;}
    this.box('rub',(ax+bx)/2,y0,(az+bz)/2,len+2*e,h,t,Math.atan2(-dz,dx));
  };
  /* দেয়ালের বাইরের ধারে কাঙ্গুরা (merlon)। (px,pz) = দুর্গের কেন্দ্র, বাইরের দিক ঠিক করতে */
  Builder.prototype.crenel=function(ax,az,bx,bz,yTop,t,px,pz){
    var dx=bx-ax,dz=bz-az,len=Math.sqrt(dx*dx+dz*dz),n=Math.max(1,Math.floor(len/1.7)),o=outward(ax,az,bx,bz,px,pz),ry=Math.atan2(-dz,dx),k,u,cx,cz;
    for(k=0;k<n;k++){
      u=(k+0.5)/n;cx=ax+dx*u+o[0]*(t/2-0.3);cz=az+dz*u+o[1]*(t/2-0.3);
      this.box('rub',cx,yTop,cz,0.95,1.0,0.6,ry,k*0.13);
    }
  };
  /* চৌকো টাওয়ার: ব্লক-পাথরের দেহ, কার্নিশ, মাথায় কাঙ্গুরা ও তীরের ফোকর */
  Builder.prototype.tower=function(cx,cz,w,d,y0,h,ry){
    ry=ry||0;
    var ww=w+0.6,dd=d+0.6,top=y0+h+0.9,nx=Math.max(2,Math.round(ww/1.5)),nz=Math.max(2,Math.round(dd/1.5)),k,q,y=y0+h*0.58,sgn;
    this.box('tri',cx,y0,cz,w,h,d,ry);
    this.box('cor',cx,y0+h,cz,ww,0.9,dd,ry);
    for(k=0;k<nx;k++){
      for(sgn=-1;sgn<=1;sgn+=2){q=loc(cx,cz,ry,-ww/2+0.45+(ww-0.9)*k/(nx-1),sgn*(dd/2-0.3));this.box('rub',q[0],top,q[1],0.9,0.9,0.6,ry,k*0.1);}
    }
    for(k=1;k<nz-1;k++){
      for(sgn=-1;sgn<=1;sgn+=2){q=loc(cx,cz,ry,sgn*(ww/2-0.3),-dd/2+0.45+(dd-0.9)*k/(nz-1));this.box('rub',q[0],top,q[1],0.6,0.9,0.9,ry,k*0.1);}
    }
    for(sgn=-1;sgn<=1;sgn+=2){
      q=loc(cx,cz,ry,0,sgn*(d/2+0.04));this.box('dark',q[0],y,q[1],0.28,1.1,0.14,ry);
      q=loc(cx,cz,ry,sgn*(w/2+0.04),0);this.box('dark',q[0],y,q[1],0.14,1.1,0.28,ry);
    }
  };
  /* পলেস্তারার সমতল-ছাদের ঘর: দরজা, ছাদের কিনারা */
  Builder.prototype.house=function(cx,cz,w,d,h,ry,y0){
    ry=ry||0;y0=y0||0;
    var q;
    this.box('pla',cx,y0,cz,w,h,d,ry);
    this.box('pla',cx,y0+h,cz,w+0.3,0.22,d+0.3,ry,0.3);
    q=loc(cx,cz,ry,-w*0.12,d/2+0.05);this.box('dark',q[0],y0,q[1],0.8,1.5,0.14,ry);
    q=loc(cx,cz,ry,w*0.3,d/2+0.04);this.box('dark',q[0],y0+1.3,q[1],0.4,0.5,0.12,ry);
    /* ছাদের কিনারার নিচু দেয়াল */
    q=loc(cx,cz,ry,0,d/2+0.05);this.box('pla',q[0],y0+h+0.22,q[1],w+0.3,0.32,0.2,ry,0.5);
    q=loc(cx,cz,ry,0,-d/2-0.05);this.box('pla',q[0],y0+h+0.22,q[1],w+0.3,0.32,0.2,ry,0.6);
    q=loc(cx,cz,ry,w/2+0.05,0);this.box('pla',q[0],y0+h+0.22,q[1],0.2,0.32,d+0.3,ry,0.7);
    q=loc(cx,cz,ry,-w/2-0.05,0);this.box('pla',q[0],y0+h+0.22,q[1],0.2,0.32,d+0.3,ry,0.8);
  };
  /* ঢালু পথ (ফটকের সামনে): (gx,gz) কেন্দ্র, (ux,uz) পাশের একক দিক, (nx,nz) বাইরের একক দিক;
     near দূরত্বে উচ্চতা yTop, len দূরত্ব পরে মাটি (y=0.03) */
  Builder.prototype.ramp=function(gx,gz,ux,uz,nx,nz,halfW,near,len,yTop){
    var g=this.g.rub,T=TILE.rub,p0=[gx+nx*near-ux*halfW,yTop,gz+nz*near-uz*halfW],p1=[gx+nx*near+ux*halfW,yTop,gz+nz*near+uz*halfW],
        p2=[gx+nx*(near+len)+ux*halfW,0.03,gz+nz*(near+len)+uz*halfW],p3=[gx+nx*(near+len)-ux*halfW,0.03,gz+nz*(near+len)-uz*halfW],
        sl=Math.sqrt(len*len+yTop*yTop)/T,wd=2*halfW/T,b0=[p0[0],0,p0[2]],b1=[p1[0],0,p1[2]];
    g.quad(p0,p1,p2,p3,[0,0],[wd,0],[wd,sl],[0,sl],[0,1,0]);
    /* দুই পাশের ত্রিভুজাকার দেয়াল */
    g.quad(b0,p3,p0,p0,[0,0],[sl,0],[0,yTop/T],[0,yTop/T],[-ux,0,-uz]);
    g.quad(b1,p2,p1,p1,[0,0],[sl,0],[0,yTop/T],[0,yTop/T],[ux,0,uz]);
  };
  /* আয়তাকার দুর্গ-প্রাচীর (স্থানীয় +z দিকে ফটক): চার কোণে টাওয়ার, ফটকের দুই পাশে স্তম্ভ */
  Builder.prototype.enclosure=function(cx,cz,w,d,ry,y0,o){
    o=o||{};
    var wh=o.wallH||3.2,t=o.t||1.1,tw=o.towerW||2.4,th=o.towerH||5,gw=o.gate==null?2.2:o.gate,self=this,
        C=[loc(cx,cz,ry,-w/2,-d/2),loc(cx,cz,ry,w/2,-d/2),loc(cx,cz,ry,w/2,d/2),loc(cx,cz,ry,-w/2,d/2)],
        gl=loc(cx,cz,ry,-gw/2,d/2),gr=loc(cx,cz,ry,gw/2,d/2),k,a,b,segs;
    segs=[[C[0],C[1]],[C[1],C[2]],[C[3],C[0]],[C[2],gr],[gl,C[3]]];
    if(!gw){segs=[[C[0],C[1]],[C[1],C[2]],[C[2],C[3]],[C[3],C[0]]];}
    segs.forEach(function(s){self.wall(s[0][0],s[0][1],s[1][0],s[1][1],y0,wh,t,0.3);self.crenel(s[0][0],s[0][1],s[1][0],s[1][1],y0+wh,t,cx,cz);});
    for(k=0;k<4;k++){this.tower(C[k][0],C[k][1],tw,tw,y0,th,ry);}
    if(gw){
      this.box('tri',gl[0],y0,gl[1],0.9,wh+0.9,1.5,ry);
      this.box('tri',gr[0],y0,gr[1],0.9,wh+0.9,1.5,ry);
      a=loc(cx,cz,ry,0,d/2);this.box('tri',a[0],y0+wh-0.2,a[1],gw+0.9,1.1,1.5,ry);
    }
  };
  /* জমানো জ্যামিতি থেকে Mesh বানিয়ে group-এ বসায় */
  Builder.prototype.add=function(group){
    var k,g,m,out=[];
    for(k in this.g){g=this.g[k].geo();if(!g){continue;}m=new THREE.Mesh(g,mats[k]);group.add(m);out.push(m);}
    return out;
  };

  /* বহুভুজ (x,z জোড়ার তালিকা) থেকে উঁচু চত্বর/মালভূমি: y0 থেকে y0+h; পাথরের টেক্সচার */
  function terrace(pts,y0,h,tint){
    var sh=new THREE.Shape(),k,g,uv,m,mt=mat('rub',tint==null?0x9a8a76:tint);
    pts.forEach(function(p,i){if(i){sh.lineTo(p[0],-p[1]);}else{sh.moveTo(p[0],-p[1]);}});
    g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,steps:1});
    g.rotateX(-Math.PI/2);g.translate(0,y0,0);
    uv=g.attributes.uv;for(k=0;k<uv.count;k++){uv.setXY(k,uv.getX(k)/TILE.rub,uv.getY(k)/TILE.rub);}
    m=new THREE.Mesh(g,mt);return m;
  }

  var kit={Builder:Builder,mats:mats,mat:mat,terrace:terrace,loc:loc,outward:outward,TILE:TILE};
  SIRAT._fortKit=kit;
  return kit;
};
})();
