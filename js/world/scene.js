/* ৩ডি দৃশ্য: রেন্ডারার, আকাশ, ভূখণ্ড, কাবা, হেরা, হিজরতের পথ, মদিনা, যুদ্ধক্ষেত্র, আরাফাত, মানচিত্র, আবহাওয়া ও frame() লুপ।
   ভারী ডেটা (টেক্সচার/মডেল) js/assets/-এ, ম্যাটেরিয়াল materials.js-এ, কীফ্রেম keyframes.js-এ।
   নতুন ৩ডি ফাইল যোগ করতে এই ফাইল ছুঁতে হবে না — README.md দেখুন (SIRAT.parts হুক নিচে frame()-এর আগে চলে)। */
(function(){
'use strict';
var SIRAT=window.SIRAT,clamp=SIRAT.clamp,sstep=SIRAT.sstep,REDUCE=SIRAT.REDUCE,secs=SIRAT.secs,tops=SIRAT.tops,sceneF=SIRAT.sceneF,
    noise=SIRAT.noise,heightAt=SIRAT.heightAt;
function initScene(){
  var Q=SIRAT.Q,PARTS=SIRAT.parts;
  var S3=window.__s3;
  if(!window.THREE){return false;}
  var canvas=document.getElementById('stage'),renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:!Q.lite,powerPreference:Q.lite?'low-power':'high-performance'});}catch(e){return false;}
  var small=Math.min(window.innerWidth,window.innerHeight)<700||!!Q.lite;
  renderer.setPixelRatio(Q.lite?1:Math.min(window.devicePixelRatio||1,small?1.5:2));
  renderer.setSize(window.innerWidth,window.innerHeight,false);

  var scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x101a30,0.004);
  var camera=new THREE.PerspectiveCamera(52,window.innerWidth/window.innerHeight,0.5,3200);

  /* textures */
  function canvasTex(size,draw){var c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);return new THREE.CanvasTexture(c);}
  var dotTex=canvasTex(64,function(g,s){var r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(0.35,'rgba(255,255,255,0.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s);});
  var moonTex=canvasTex(256,function(g,s){
    g.save();g.beginPath();g.arc(s/2,s/2,s*0.46,0,Math.PI*2);g.clip();
    var r=g.createRadialGradient(s*0.42,s*0.4,s*0.05,s/2,s/2,s*0.5);r.addColorStop(0,'#fffdf2');r.addColorStop(1,'#cdd5ea');g.fillStyle=r;g.fillRect(0,0,s,s);
    for(var i=0;i<26;i++){g.globalAlpha=0.07+Math.random()*0.08;g.fillStyle='#7f8bad';g.beginPath();g.arc(s*(0.2+Math.random()*0.6),s*(0.2+Math.random()*0.6),s*(0.02+Math.random()*0.07),0,Math.PI*2);g.fill();}
    g.restore();
  });

  /* sky dome, stars, moon, sun (all follow the camera) */
  var sky=new THREE.Group();scene.add(sky);
  var skyMat=new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{uZen:{value:new THREE.Color(0x03050d)},uHor:{value:new THREE.Color(0x101a30)},uGlow:{value:new THREE.Color(0xff9a55)},uSunDir:{value:new THREE.Vector3(0.5,0.05,-0.85)},uSun:{value:0}},
    vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 uZen;uniform vec3 uHor;uniform vec3 uGlow;uniform vec3 uSunDir;uniform float uSun;varying vec3 vP;'+
      'void main(){vec3 d=normalize(vP);float h=clamp(d.y,0.0,1.0);float t=pow(h,0.55);vec3 col=mix(uHor,uZen,t);'+
      'float s=max(dot(d,normalize(uSunDir)),0.0);col+=uGlow*(pow(s,6.0)*0.4+pow(s,48.0)*0.9)*uSun;'+
      'if(d.y<0.0){col=uHor;}gl_FragColor=vec4(col,1.0);}'
  });
  var skyMesh=new THREE.Mesh(new THREE.SphereGeometry(1500,32,16),skyMat);skyMesh.renderOrder=-10;skyMesh.frustumCulled=false;sky.add(skyMesh);

  var NS=small?3500:6500,sp=new Float32Array(NS*3),sz=new Float32Array(NS),ph=new Float32Array(NS),scl=new Float32Array(NS*3);
  var band=new THREE.Vector3(0.35,0.75,-0.55).normalize(),v=new THREE.Vector3(),i,u,a,r,w,br;
  for(i=0;i<NS;i++){
    u=Math.random()*2-1;a=Math.random()*Math.PI*2;r=Math.sqrt(1-u*u);
    v.set(r*Math.cos(a),Math.abs(u),r*Math.sin(a));
    var inBand=i<NS*0.4;
    if(inBand){v.addScaledVector(band,-v.dot(band)*0.9);}
    v.normalize();if(v.y<0.02){v.y=Math.abs(v.y)+0.02;v.normalize();}
    sp[i*3]=v.x*1400;sp[i*3+1]=v.y*1400;sp[i*3+2]=v.z*1400;
    sz[i]=inBand?0.8+Math.random()*1.2:0.9+Math.pow(Math.random(),3)*3.2;
    ph[i]=Math.random();
    w=Math.random();br=0.5+Math.random()*0.5;
    if(w<0.2){scl[i*3]=1*br;scl[i*3+1]=0.88*br;scl[i*3+2]=0.72*br;}
    else if(w<0.5){scl[i*3]=0.8*br;scl[i*3+1]=0.88*br;scl[i*3+2]=1*br;}
    else{scl[i*3]=br;scl[i*3+1]=br;scl[i*3+2]=br;}
  }
  var sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('aSize',new THREE.BufferAttribute(sz,1));
  sg.setAttribute('aPhase',new THREE.BufferAttribute(ph,1));sg.setAttribute('aColor',new THREE.BufferAttribute(scl,3));
  var starMat=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,fog:false,
    uniforms:{uTime:{value:0},uPx:{value:renderer.getPixelRatio()},uAlpha:{value:1}},
    vertexShader:'attribute float aSize;attribute float aPhase;attribute vec3 aColor;uniform float uTime;uniform float uPx;varying vec3 vC;varying float vT;'+
      'void main(){vC=aColor;vT=0.65+0.35*sin(uTime*(0.6+aPhase)+aPhase*40.0);vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*uPx*1.6*(0.8+0.4*vT);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float uAlpha;varying vec3 vC;varying float vT;'+
      'void main(){float d=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.0,d);a*=a;gl_FragColor=vec4(vC,a*vT*uAlpha);}'
  });
  var stars=new THREE.Points(sg,starMat);stars.frustumCulled=false;sky.add(stars);

  function glowSprite(map,color,size,opacity,fog){
    var m=new THREE.SpriteMaterial({map:map,color:color,transparent:true,opacity:opacity,blending:THREE.AdditiveBlending,depthWrite:false,fog:!!fog});
    var s=new THREE.Sprite(m);s.scale.set(size,size,1);return s;
  }
  var moonDir=new THREE.Vector3(0.28,0.19,-0.94).normalize();
  var moonDisk=new THREE.Sprite(new THREE.SpriteMaterial({map:moonTex,transparent:true,depthWrite:false,fog:false}));
  moonDisk.scale.set(110,110,1);moonDisk.position.copy(moonDir).multiplyScalar(1300);sky.add(moonDisk);
  var moonGlow=glowSprite(dotTex,0x9fb4ff,520,0.5,false);moonGlow.position.copy(moonDir).multiplyScalar(1299);sky.add(moonGlow);
  var sunDir=new THREE.Vector3(0.52,0.05,-0.85).normalize();
  var sunDisk=glowSprite(dotTex,0xfff0c8,170,1,false);sky.add(sunDisk);
  var sunGlow=glowSprite(dotTex,0xffb26a,760,0.7,false);sky.add(sunGlow);


  /* ---------- surface materials (js/world/materials.js) ---------- */
  var M=SIRAT.makeMaterials(THREE,small,canvasTex);
  var texLoader=M.texLoader,sandTex=M.sandTex,sandNorm=M.sandNorm,sandRough=M.sandRough,gravelPatch=M.gravelPatch,
      rockTex=M.rockTex,rockNorm=M.rockNorm,rockRough=M.rockRough,rockExtra=M.rockExtra,blkMat=M.blkMat,brickMat=M.brickMat,cliffMat=M.cliffMat;

  /* terrain */
  var SX=small?120:200,SZ=small?150:250;
  var tg=new THREE.PlaneGeometry(900,1100,SX,SZ);tg.rotateX(-Math.PI/2);tg.translate(0,0,-380);
  var tp=tg.attributes.position,tc=new Float32Array(tp.count*3);
  var cLow=new THREE.Color(0x5b4a34),cHigh=new THREE.Color(0xb39666),tmp=new THREE.Color();
  for(i=0;i<tp.count;i++){
    var x=tp.getX(i),z=tp.getZ(i),h=heightAt(x,z);
    tp.setY(i,h);
    tmp.copy(cLow).lerp(cHigh,clamp(h/14,0,1)*0.9+noise(x*0.07,z*0.07)*0.15);
    tc[i*3]=tmp.r;tc[i*3+1]=tmp.g;tc[i*3+2]=tmp.b;
  }
  tg.setAttribute('color',new THREE.BufferAttribute(tc,3));tg.computeVertexNormals();
  var tm0={vertexColors:true,roughness:1,metalness:0,map:sandTex,normalMap:sandNorm,normalScale:new THREE.Vector2(1.1,1.1)};if(sandRough){tm0.roughnessMap=sandRough;}var terrainMat=new THREE.MeshStandardMaterial(tm0);gravelPatch(terrainMat);scene.add(new THREE.Mesh(tg,terrainMat));
  /* safety net: if the gravel shader ever fails to compile, fall back to plain sand */
  setTimeout(function(){try{var ps=renderer.info.programs||[],bad=false,k;for(k=0;k<ps.length;k++){if(ps[k].diagnostics&&ps[k].diagnostics.runnable===false){bad=true;}}if(bad&&terrainMat.userData.gravel){terrainMat.userData.gravel=false;terrainMat.onBeforeCompile=function(){};terrainMat.needsUpdate=true;}}catch(e){}},4000);

  /* lights */
  var hemi=new THREE.HemisphereLight(0x2b3a66,0x2a2118,0.4);scene.add(hemi);
  var key=new THREE.DirectionalLight(0x86a0e0,0.95);scene.add(key);
  var kaabaLight=new THREE.PointLight(0xffcf8a,1.4,110);kaabaLight.position.set(0,26,-60);scene.add(kaabaLight);
  var madLight=new THREE.PointLight(0x34d399,0,170);madLight.position.set(80,34,-320);scene.add(madLight);

  /* Kaaba and the circling ring of pilgrims */
  var kaaba=new THREE.Group();kaaba.position.set(0,0,-60);kaaba.scale.setScalar(1.4);scene.add(kaaba);
  var goldMat=new THREE.MeshStandardMaterial({color:0xd8b26a,roughness:0.3,metalness:0.85,emissive:0x3a2a08,emissiveIntensity:0.6});
  /* Kaaba model: "Holy Kaaba - Mecca - Low Poly" by haidarzafermoayad (https://sketchfab.com/3d-models/holy-kaaba-mecca-low-poly-08ea4704d00c40419094487e9646648d), CC BY 4.0. Rescaled, Black Stone frame moved to the door-side corner, textures recompressed; geometry embedded below so the page stays one file. */
  var KD=SIRAT.assets.KD;
  (function(){
    var bin=atob(KD.blob),len=bin.length,u8=new Uint8Array(len),q,T={};for(q=0;q<len;q++){u8[q]=bin.charCodeAt(q);}
    var buf=u8.buffer;
    function kt(id){if(!T[id]){var t=texLoader.load('data:image/jpeg;base64,'+KD.tex[id]);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.flipY=false;t.anisotropy=small?2:8;T[id]=t;}return T[id];}
    KD.meta.forEach(function(m){
      var g=new THREE.BufferGeometry(),n8=new Int8Array(buf,m.nm,m.n*4),nr=new Float32Array(m.n*3),k;
      for(k=0;k<m.n;k++){nr[k*3]=n8[k*4]/127;nr[k*3+1]=n8[k*4+1]/127;nr[k*3+2]=n8[k*4+2]/127;}
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(buf,m.p,m.n*3),3));
      g.setAttribute('normal',new THREE.BufferAttribute(nr,3));
      g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(buf,m.uv,m.n*2),2));
      g.setIndex(new THREE.BufferAttribute(new Uint16Array(buf,m.i,m.ni),1));
      var mt;
      if(m.tex===null){
        mt=(m.name==='Material.008')?new THREE.MeshStandardMaterial({color:new THREE.Color(m.col[0],m.col[1],m.col[2]),roughness:0.35,metalness:0.7,emissive:0x2a1c04,emissiveIntensity:0.5,side:THREE.DoubleSide})
          :new THREE.MeshStandardMaterial({color:0x17171b,roughness:0.55,metalness:0.05,emissive:0x060608,emissiveIntensity:0.6,side:THREE.DoubleSide});
      }else if(m.tex===7){
        mt=new THREE.MeshStandardMaterial({map:kt(7),roughness:0.4,metalness:0,emissive:0x211e18,emissiveIntensity:0.6,side:THREE.DoubleSide});
      }else if(m.tex===1){
        mt=new THREE.MeshStandardMaterial({map:kt(1),roughness:0.85,metalness:0,emissive:0x0e0e10,emissiveIntensity:0.6,side:THREE.DoubleSide});
      }else{
        mt=new THREE.MeshStandardMaterial({map:kt(m.tex),roughness:0.55,metalness:0.1,emissive:0x6a4a14,emissiveMap:kt(m.tex),emissiveIntensity:0.55,side:THREE.DoubleSide});
      }
      kaaba.add(new THREE.Mesh(g,mt));
    });
  })();
  var ringGeo=new THREE.RingGeometry(20,50,96);ringGeo.rotateX(-Math.PI/2);
  var mataf=new THREE.Mesh(ringGeo,new THREE.MeshStandardMaterial({color:0xcfc8b8,roughness:0.9,emissive:0x2a2618,emissiveIntensity:0.45}));
  mataf.position.set(0,0.08,-60);scene.add(mataf);
  var kGlow=glowSprite(dotTex,0xffd9a0,90,0.35,true);kGlow.position.set(0,10,-60);scene.add(kGlow);
  var tawaf=new THREE.Group();tawaf.position.set(0,0,-60);scene.add(tawaf);
  var NT=small?350:650,tpos=new Float32Array(NT*3);
  for(i=0;i<NT;i++){var ang=Math.random()*Math.PI*2,rad=22+Math.pow(Math.random(),0.8)*24;tpos[i*3]=Math.cos(ang)*rad;tpos[i*3+1]=0.5+Math.random()*1.1;tpos[i*3+2]=Math.sin(ang)*rad;}
  var tgm=new THREE.BufferGeometry();tgm.setAttribute('position',new THREE.BufferAttribute(tpos,3));
  tawaf.add(new THREE.Points(tgm,new THREE.PointsMaterial({map:dotTex,size:1.4,color:0xfff1c9,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending})));

  /* Mountain of Light (Hira) with a beam */
  var mg=new THREE.IcosahedronGeometry(1,5),mp=mg.attributes.position,mcol=new Float32Array(mp.count*3);
  var rockLo=new THREE.Color(0x8c7d70),rockHi=new THREE.Color(0xd9c9b6);
  for(i=0;i<mp.count;i++){
    var px=mp.getX(i),py=mp.getY(i),pz=mp.getZ(i);
    var n=noise(px*2.3+5,pz*2.3+py*2.0)*0.5+noise(px*6+1,pz*6+py*4)*0.28+noise(px*13,pz*13+py*9)*0.12;
    var rr=1+(n-0.45)*0.6;px*=rr;py*=rr;pz*=rr;
    var taper=1-0.62*clamp(py,0,1);
    px*=62*taper;pz*=54*taper;py=py>0?py*74:py*10;
    mp.setXYZ(i,px,py,pz);
    tmp.copy(rockLo).lerp(rockHi,clamp(py/74,0,1)*0.8+n*0.25);
    mcol[i*3]=tmp.r;mcol[i*3+1]=tmp.g;mcol[i*3+2]=tmp.b;
  }
  mg.setAttribute('color',new THREE.BufferAttribute(mcol,3));mg.computeVertexNormals();
  var mount=new THREE.Mesh(mg,cliffMat({vertexColors:true,roughness:1},26,[1,1,1]));
  mount.position.set(-110,-1,-165);scene.add(mount);
  var beamMat=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    uniforms:{uTime:{value:0},uInt:{value:0},uCol:{value:new THREE.Color(0xffe2a0)}},
    vertexShader:'varying vec2 vUv;varying vec3 vN;varying vec3 vV;void main(){vUv=uv;vN=normalMatrix*normal;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=mv.xyz;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float uTime;uniform float uInt;uniform vec3 uCol;varying vec2 vUv;varying vec3 vN;varying vec3 vV;'+
      'void main(){float fade=pow(1.0-vUv.y,1.4);float f=abs(dot(normalize(vN),normalize(-vV)));float sh=0.78+0.22*sin(vUv.x*40.0+uTime*1.4+vUv.y*6.0);'+
      'float al=fade*pow(f,1.4)*uInt*sh*0.85;gl_FragColor=vec4(uCol,al);}'
  });
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(10,3,300,40,1,true),beamMat);beam.position.set(-110,226,-165);beam.frustumCulled=false;scene.add(beam);
  var halo=glowSprite(dotTex,0xffe2a0,110,0,true);halo.position.set(-110,78,-165);scene.add(halo);
  var NE=small?90:170,ep=new Float32Array(NE*3),ea=new Float32Array(NE),ev=new Float32Array(NE),er=new Float32Array(NE);
  for(i=0;i<NE;i++){ea[i]=Math.random()*Math.PI*2;ev[i]=10+Math.random()*22;er[i]=Math.random();ep[i*3+1]=Math.random()*240;}
  var egeo=new THREE.BufferGeometry();egeo.setAttribute('position',new THREE.BufferAttribute(ep,3));
  var emat=new THREE.PointsMaterial({map:dotTex,size:2.2,color:0xffe2a0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  var embers=new THREE.Points(egeo,emat);embers.position.set(-110,76,-165);embers.frustumCulled=false;scene.add(embers);

  /* Hijrah path of light */
  var curve=new THREE.CatmullRomCurve3([[0,-112],[-14,-135],[-6,-165],[14,-198],[30,-228],[44,-252]].map(function(p){return new THREE.Vector3(p[0],0,p[1]);}));
  var NP=900,pts=curve.getPoints(NP),pp=new Float32Array((NP+1)*3),pt=new Float32Array(NP+1);
  for(i=0;i<=NP;i++){pp[i*3]=pts[i].x;pp[i*3+1]=heightAt(pts[i].x,pts[i].z)+0.45;pp[i*3+2]=pts[i].z;pt[i]=i/NP;}
  var pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));pg.setAttribute('aT',new THREE.BufferAttribute(pt,1));
  var pathMat=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{uTime:{value:0},uReveal:{value:0},uPx:{value:renderer.getPixelRatio()}},
    vertexShader:'attribute float aT;uniform float uTime;uniform float uReveal;uniform float uPx;varying float vA;'+
      'void main(){float vis=1.0-smoothstep(uReveal-0.04,uReveal,aT);float p=0.55+0.45*sin(aT*90.0-uTime*2.5);vA=vis*(0.35+0.65*p);'+
      'vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp((2.0+3.0*p)*uPx*(240.0/-mv.z),1.5*uPx,16.0*uPx);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.0,d);gl_FragColor=vec4(1.0,0.84,0.5,a*vA);}'
  });
  var pathPts=new THREE.Points(pg,pathMat);pathPts.frustumCulled=false;scene.add(pathPts);

  /* Masjid al-Nabawi, simplified */
  var mos=new THREE.Group();mos.position.set(62,0,-335);mos.scale.setScalar(1.6);scene.add(mos);
  var stone=new THREE.MeshStandardMaterial({color:0xd8cfbb,roughness:0.85,metalness:0,emissive:0x2a2418,emissiveIntensity:0.5});
  var gold2=new THREE.MeshStandardMaterial({color:0xd8b26a,roughness:0.3,metalness:0.85,emissive:0x3a2a08,emissiveIntensity:0.6});
  var domeMat=new THREE.MeshStandardMaterial({color:0x1b9a6c,roughness:0.38,metalness:0.25,emissive:0x0a4a34,emissiveIntensity:0.6});
  function add(g,m,x,y,z){var o=new THREE.Mesh(g,m);o.position.set(x,y,z);mos.add(o);return o;}
  add(new THREE.BoxGeometry(60,9,34),stone,0,4.5,0);
  var cg=new THREE.PlaneGeometry(110,32);cg.rotateX(-Math.PI/2);
  add(cg,new THREE.MeshStandardMaterial({color:0xcfc6b2,roughness:0.9,emissive:0x1c1a12,emissiveIntensity:0.5}),0,0.06,25);
  [-31,31].forEach(function(sx){[-16,16].forEach(function(sz2){
    add(new THREE.CylinderGeometry(1.3,1.7,40,20),stone,sx,20,sz2);
    add(new THREE.CylinderGeometry(2.4,2.4,0.9,20),stone,sx,31,sz2);
    add(new THREE.CylinderGeometry(1.1,1.3,8,20),stone,sx,35.5,sz2);
    add(new THREE.ConeGeometry(1.5,4.5,20),gold2,sx,41.8,sz2);
    add(new THREE.SphereGeometry(0.5,12,8),gold2,sx,44.5,sz2);
  });});
  add(new THREE.CylinderGeometry(5.4,6,4.2,40),stone,12,11.1,0);
  var dome=add(new THREE.SphereGeometry(6,48,24,0,Math.PI*2,0,Math.PI/2),domeMat,12,13.2,0);dome.scale.set(1,1.1,1);
  add(new THREE.CylinderGeometry(0.18,0.18,3,10),gold2,12,21.2,0);
  add(new THREE.SphereGeometry(0.55,12,8),gold2,12,23,0);
  [-26,-20,-14,-8,-2].forEach(function(sx){[-8.5,8.5].forEach(function(sz2){add(new THREE.SphereGeometry(2.6,24,12,0,Math.PI*2,0,Math.PI/2),stone,sx,9,sz2);});});
  var madGlow=glowSprite(dotTex,0x34d399,100,0.15,true);madGlow.position.set(81,22,-335);scene.add(madGlow);
  var mosK=mos.children.map(function(c){return {m:c,s:c.scale.clone(),p:c.position.clone()};});

  /* Isra and Miraj: a ribbon of light rising into the night, and seven faint rings */
  var mirG=new THREE.Group();scene.add(mirG);
  var mc=new THREE.CatmullRomCurve3([[0,8,-60],[-16,70,-110],[-34,170,-190],[-18,300,-290],[36,470,-370]].map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);}));
  var NM=700,mpts=mc.getPoints(NM),mpp=new Float32Array((NM+1)*3),mpt=new Float32Array(NM+1);
  for(i=0;i<=NM;i++){mpp[i*3]=mpts[i].x;mpp[i*3+1]=mpts[i].y;mpp[i*3+2]=mpts[i].z;mpt[i]=i/NM;}
  var mpg=new THREE.BufferGeometry();mpg.setAttribute('position',new THREE.BufferAttribute(mpp,3));mpg.setAttribute('aT',new THREE.BufferAttribute(mpt,1));
  var mirMat=pathMat.clone(),mirPts=new THREE.Points(mpg,mirMat);mirPts.frustumCulled=false;mirG.add(mirPts);
  var ringMats=[],ri;
  for(ri=0;ri<7;ri++){
    var rm=new THREE.MeshBasicMaterial({color:0xcfd9ff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
    var rg=new THREE.RingGeometry(120+ri*18,121.2+ri*18,96);rg.rotateX(-Math.PI/2);
    var rmesh=new THREE.Mesh(rg,rm);rmesh.position.set(-30,110+ri*55,-210);mirG.add(rmesh);ringMats.push(rm);
  }
  mirG.visible=false;

  /* battlefield stage: four small scenes, one shown at a time */
  var warG=new THREE.Group();warG.position.set(130,0,-440);scene.add(warG);
  var wm=function(c){return new THREE.MeshStandardMaterial({color:c,roughness:1,flatShading:true});},wRock=wm(0x7b6e5e),wDark=wm(0x2b241d),wEarth=wm(0x8a7455),W=[];
  function crowd(cx,cz,r,n,col,sz){var p=new Float32Array(n*3),q,aa,rr,g=new THREE.BufferGeometry();for(q=0;q<n;q++){aa=Math.random()*6.283;rr=Math.sqrt(Math.random())*r;p[q*3]=cx+Math.cos(aa)*rr;p[q*3+1]=0.6;p[q*3+2]=cz+Math.sin(aa)*rr;}g.setAttribute('position',new THREE.BufferAttribute(p,3));return new THREE.Points(g,new THREE.PointsMaterial({map:dotTex,size:sz,color:col,transparent:true,opacity:0.95,depthWrite:false}));}
  function wmesh(g,m,x,y,z,sx,sy,sz2){var o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx||1,sy||1,sz2||1);return o;}
  for(i=0;i<5;i++){W.push(new THREE.Group());warG.add(W[i]);}
  /* position helpers: flat tinted disc under a side, and a text label */
  function wdisc(x,z,r,col,op){var m=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,0.5,z);return m;}
  function wlab(g,txt,x,y,z,s){var l=mkLab(txt),w=s||17;l.scale.set(w,w/4,1);l.position.set(x,y,z);g.add(l);}
  var wMus=0x2fae83,wQur=0xb4553a;
  /* Badr (simplified): wells between two low ridges; Muslims at the near wells, Quraysh beyond a low sand rise; about 1:3 */
  [[-12,-6],[-4,8],[10,-2]].forEach(function(p){W[0].add(wmesh(new THREE.CylinderGeometry(2.2,2.2,0.6,16),wDark,p[0],0.3,p[1]));});
  W[0].add(wmesh(new THREE.IcosahedronGeometry(1,1),wRock,-34,0,-22,14,5,10));W[0].add(wmesh(new THREE.IcosahedronGeometry(1,1),wRock,36,0,-26,16,6,10));
  W[0].add(wmesh(new THREE.IcosahedronGeometry(1,1),wEarth,8,0,-12,16,2.6,5));
  W[0].add(wdisc(-14,16,11,wMus,0.24));W[0].add(wdisc(6,-26,16,wQur,0.22));
  W[0].add(crowd(-14,16,8,62,0xf6f1e4,1.0));W[0].add(crowd(6,-26,13,190,0x3a3028,1.0));
  wlab(W[0],'মুসলিম বাহিনী',-14,9,16);wlab(W[0],'কুরাইশ বাহিনী',6,9,-26);wlab(W[0],'বদরের কূপ',3,5.5,4);wlab(W[0],'বালির টিলা',8,5,-12,13);
  /* Uhud (simplified): mountain at the Muslims' back, archers on the small hill at their flank, Quraysh on the plain in front; about 1:4 */
  W[1].add(wmesh(new THREE.IcosahedronGeometry(1,2),wRock,0,-4,-30,48,36,26));W[1].add(wmesh(new THREE.IcosahedronGeometry(1,1),wRock,-24,-1,6,8,7,8));
  W[1].add(wdisc(2,4,11,wMus,0.24));W[1].add(wdisc(-2,24,16,wQur,0.22));
  W[1].add(crowd(2,4,9,38,0xf6f1e4,1.0));W[1].add(crowd(-2,24,14,160,0x3a3028,1.0));
  var arch=crowd(-24,6,2,14,0x6ee7b7,1.4);arch.position.y=6;W[1].add(arch);
  wlab(W[1],'উহুদ পাহাড়',0,40,-30,20);wlab(W[1],'মুসলিম বাহিনী',2,11,4);wlab(W[1],'কুরাইশ বাহিনী',-2,11,24);wlab(W[1],'তীরন্দাজদের টিলা',-24,13,6,20);
  /* Khandaq: trench with banks, defenders on one side */
  var trN=wmesh(new THREE.BoxGeometry(80,0.3,5),wDark,0,0.1,0),bkA=wmesh(new THREE.BoxGeometry(80,1.3,3),wEarth,0,0.65,4.5),bkB=wmesh(new THREE.BoxGeometry(80,1.3,3),wEarth,0,0.65,-4.5);W[2].add(trN,bkA,bkB);
  W[2].add(crowd(0,16,14,90,0xf6f1e4,1.0));W[2].add(crowd(0,-20,16,130,0x3a3028,1.0));
  W[2].add(wdisc(0,16,14,wMus,0.2));W[2].add(wdisc(0,-20,16,wQur,0.2));W[2].add(wmesh(new THREE.IcosahedronGeometry(1,1),wRock,-30,0,32,9,8,8));
  wlab(W[2],'পরিখা',0,5,0,14);wlab(W[2],'মুসলিম শিবির',0,9,18);wlab(W[2],'কুরাইশ ও মিত্র জোট',0,9,-22,20);wlab(W[2],'সালআ পাহাড়',-30,12,32,15);
  /* Khandaq: rows of workers walk slowly along the dug stretch carrying earth; diggers bob at the two digging fronts.
     The visible stretch (uL) follows the trench as it is dug, so the work grows with the scroll. */
  var kMat=null;
  (function(){
    var nR=small?22:34,nD=small?8:12,tot=nR*2+nD*2,P=new Float32Array(tot*3),K=new Float32Array(tot),A=new Float32Array(tot),D=new Float32Array(tot),q=0,r,j;
    function put(x,y,z,kind,a,d){P[q*3]=x;P[q*3+1]=y;P[q*3+2]=z;K[q]=kind;A[q]=a;D[q]=d;q++;}
    for(r=0;r<2;r++){for(j=0;j<nR;j++){put(0,0.7,(r?9.4:7.4)+(Math.random()-0.5)*0.5,0,(j+Math.random()*0.35)/nR,r?-1:1);}}
    for(r=0;r<2;r++){for(j=0;j<nD;j++){put(0,0.65,(Math.random()-0.5)*2.6,1,Math.random(),r?-1:1);}}
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aK',new THREE.BufferAttribute(K,1));
    g.setAttribute('aA',new THREE.BufferAttribute(A,1));g.setAttribute('aD',new THREE.BufferAttribute(D,1));
    kMat=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,
      uniforms:{uT:{value:0},uL:{value:0},uPx:{value:renderer.getPixelRatio()}},
      vertexShader:'attribute float aK;attribute float aA;attribute float aD;uniform float uT;uniform float uL;uniform float uPx;varying float vA;'+
        'void main(){float x;float a=1.0;float y=position.y;'+
        'if(aK<0.5){float f=fract(aA+uT*0.0125*aD);x=(f*2.0-1.0)*40.0;a=1.0-smoothstep(uL-4.0,uL,abs(x));y+=0.12*abs(sin(uT*3.0+aA*40.0));}'+
        'else{x=aD*(uL-aA*7.0);a=smoothstep(2.0,6.0,uL);y+=0.35*abs(sin(uT*2.4+aA*30.0));}'+
        'vA=a;vec4 mv=modelViewMatrix*vec4(x,y,position.z,1.0);gl_PointSize=clamp(1.6*uPx*(240.0/-mv.z),1.5*uPx,10.0*uPx);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-0.5);float al=smoothstep(0.5,0.1,d);gl_FragColor=vec4(0.96,0.95,0.89,al*vA*0.95);}'
    });
    var kp=new THREE.Points(g,kMat);kp.frustumCulled=false;W[2].add(kp);
  })();
  /* Hudaybiyyah: lone tree, pilgrims in white, a few tents */
  W[3].add(wmesh(new THREE.CylinderGeometry(0.7,1,9,8),wm(0x4a3626),0,4.5,0));W[3].add(wmesh(new THREE.SphereGeometry(5,12,8),wm(0x3f6b3a),0,10,0,1,0.8,1));
  W[3].add(crowd(0,0,17,130,0xf6f1e4,1.0));
  [[-26,6],[-20,-18],[24,-12],[28,10]].forEach(function(p){var t=wmesh(new THREE.ConeGeometry(2.5,2.2,4),wDark,p[0],1.1,p[1]);t.rotation.y=0.78;W[3].add(t);});
  wlab(W[3],'বাইআতের গাছ',0,17,0,18);wlab(W[3],'ইহরামে সাহাবিগণ',0,5,14,18);
  /* Taif (simplified): walled town on a hill, Thaqif crowd outside, vineyard shelter on the left, Qarn al-Tha'alib mound on the right */
  W[4].add(wmesh(new THREE.IcosahedronGeometry(1,2),wRock,0,-3,-38,40,22,16));
  var tHouse=brickMat(0xd9cfc4);var tBrk=brickMat(0xd9cfc4,[28,1]);tBrk.side=THREE.DoubleSide;var tw=new THREE.Mesh(new THREE.CylinderGeometry(14,14,3.2,28,1,true),tBrk);tw.position.set(0,1.6,-14);W[4].add(tw);
  [[-5,-18],[3,-20],[7,-12],[-7,-10],[0,-14]].forEach(function(q){W[4].add(wmesh(new THREE.BoxGeometry(4,2.6,4),tHouse,q[0],1.3,q[1]));});
  W[4].add(wdisc(-4,6,9,wQur,0.2));W[4].add(crowd(-4,6,7,50,0x3a3028,1.0));
  var vy=wm(0x3f6b3a);[[-30,10],[-26,16],[-34,18],[-24,6]].forEach(function(q){W[4].add(wmesh(new THREE.SphereGeometry(3,10,8),vy,q[0],3,q[1],1,0.9,1));});
  W[4].add(wmesh(new THREE.IcosahedronGeometry(1,1),wRock,34,0,-8,7,8,7));
  wlab(W[4],'তায়েফ শহর',0,9,-14);wlab(W[4],'সাকিফ গোত্র',-4,6,8,15);wlab(W[4],'আঙুরবাগান',-29,9,12,15);wlab(W[4],'কারনুস সাআলিব',34,12,-8,20);
  warG.visible=false;

  /* Fath Makkah: ring of small stone stubs around the Kaaba that topple as the page scrolls */
  var fathG=new THREE.Group();scene.add(fathG);
  var idolMat=new THREE.MeshStandardMaterial({color:0x2a2622,roughness:1,flatShading:true}),idols=[];
  for(i=0;i<36;i++){var ia=i/36*Math.PI*2,ir=36+(i%3)*3.5,io=new THREE.Mesh(new THREE.BoxGeometry(1.2,3+(i%4)*0.5,1.2),idolMat);io.position.set(Math.cos(ia)*ir,1.7,-60+Math.sin(ia)*ir);io.userData={dir:ia+Math.PI/2,dl:(i%9)/9*0.5};fathG.add(io);idols.push(io);}
  var fGlow=glowSprite(dotTex,0xfff1c9,140,0,true);fGlow.position.set(0,12,-60);fathG.add(fGlow);
  /* dust puffs where each stone falls (stateless: driven only by scroll progress, so it also plays in reverse) */
  var fDust=null,fRings=[];
  (function(){
    var per=small?5:8,cnt=idols.length*per,P=new Float32Array(cnt*3),V=new Float32Array(cnt*3),D=new Float32Array(cnt),S=new Float32Array(cnt),a,b,m,io,ud,oa,sp,sv;
    for(a=0;a<idols.length;a++){
      io=idols[a];ud=io.userData;oa=Math.atan2(io.position.z+60,io.position.x);
      for(b=0;b<per;b++){
        m=a*per+b;sp=oa+(Math.random()-0.5)*1.4;sv=1.5+Math.random()*3.5;
        P[m*3]=io.position.x+(Math.random()-0.5)*1.2;P[m*3+1]=0.4+Math.random()*0.6;P[m*3+2]=io.position.z+(Math.random()-0.5)*1.2;
        V[m*3]=Math.cos(sp)*sv+Math.cos(ud.dir)*1.2;V[m*3+1]=1.2+Math.random()*2.6;V[m*3+2]=Math.sin(sp)*sv+Math.sin(ud.dir)*1.2;
        D[m]=ud.dl;S[m]=Math.random();
      }
    }
    var g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('aV',new THREE.BufferAttribute(V,3));
    g.setAttribute('aD',new THREE.BufferAttribute(D,1));g.setAttribute('aS',new THREE.BufferAttribute(S,1));
    var mat=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,
      uniforms:{uFp:{value:0},uPx:{value:renderer.getPixelRatio()}},
      vertexShader:'attribute vec3 aV;attribute float aD;attribute float aS;uniform float uFp;uniform float uPx;varying float vA;'+
        'void main(){float st=0.3+aD*0.3;float u=clamp((uFp-st)/0.4,0.0,1.0);float e=1.0-(1.0-u)*(1.0-u);'+
        'vec3 p=position+vec3(aV.x*e,aV.y*e,aV.z*e);vA=smoothstep(0.0,0.12,u)*(1.0-u)*0.55*(0.6+0.4*aS);'+
        'vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp((1.5+4.5*u)*(0.7+0.6*aS)*uPx*(240.0/-mv.z),0.0,36.0*uPx);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'varying float vA;void main(){float d=length(gl_PointCoord-0.5);float al=smoothstep(0.5,0.05,d);gl_FragColor=vec4(0.80,0.70,0.52,al*vA);}'
    });
    fDust=new THREE.Points(g,mat);fDust.frustumCulled=false;fathG.add(fDust);
    /* two slow rings of light that spread out from the Kaaba as the stones fall */
    var rg=new THREE.RingGeometry(0.94,1,96);rg.rotateX(-Math.PI/2);
    for(a=0;a<2;a++){
      var rm=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({color:0xffe2a0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,side:THREE.DoubleSide}));
      rm.position.set(0,0.2,-60);fathG.add(rm);fRings.push(rm);
    }
  })();
  fathG.visible=false;

  /* Arafat: low rocky hill, hair tent, crowd of pilgrims in white */
  var arafatG=new THREE.Group();scene.add(arafatG);
  var hg=new THREE.IcosahedronGeometry(1,4),hp=hg.attributes.position,hc=new Float32Array(hp.count*3),hLo=new THREE.Color(0x5f564b),hHi=new THREE.Color(0xa09584);
  for(i=0;i<hp.count;i++){
    var qx=hp.getX(i),qy=hp.getY(i),qz=hp.getZ(i),nn=noise(qx*3+2,qz*3+qy*2)*0.55+noise(qx*9,qz*9+qy*6)*0.3,q=1+(nn-0.4)*0.5;
    qx*=q*30;qz*=q*22;qy=qy>0?qy*q*15:qy*3;hp.setXYZ(i,qx,qy,qz);
    tmp.copy(hLo).lerp(hHi,clamp(qy/15,0,1)*0.8+nn*0.2);hc[i*3]=tmp.r;hc[i*3+1]=tmp.g;hc[i*3+2]=tmp.b;
  }
  hg.setAttribute('color',new THREE.BufferAttribute(hc,3));hg.computeVertexNormals();
  var hill=new THREE.Mesh(hg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));hill.position.set(-100,-0.5,-580);arafatG.add(hill);
  var tent=new THREE.Mesh(new THREE.ConeGeometry(4.2,3.4,4),new THREE.MeshStandardMaterial({color:0x3b2e22,roughness:1,flatShading:true}));tent.rotation.y=Math.PI/4;tent.position.set(-12,1.7,-500);arafatG.add(tent);
  var NA=small?1600:3200,apos=new Float32Array(NA*3),ax,az,ar0;
  /* per-pilgrim data: offset from the hill, how far toward the hill's foot they settle, how strongly they are drawn, sway phase, cached ground height */
  var HX=-100,HZ=-580,aE=new Float32Array(NA),aDX=new Float32Array(NA),aDZ=new Float32Array(NA),aET=new Float32Array(NA),aK=new Float32Array(NA),aP=new Float32Array(NA),aY=new Float32Array(NA),afr=0,adx,adz;
  for(i=0;i<NA;i++){ar0=Math.sqrt(Math.random());a=Math.random()*Math.PI*2;ax=-62+Math.cos(a)*ar0*70;az=-515+Math.sin(a)*ar0*52;apos[i*3]=ax;apos[i*3+1]=heightAt(ax,az)+0.55;apos[i*3+2]=az;
    adx=ax-HX;adz=az-HZ;aDX[i]=adx;aDZ[i]=adz;aE[i]=Math.max(0.001,Math.sqrt((adx/30)*(adx/30)+(adz/22)*(adz/22)));
    aET[i]=1.45+Math.random()*0.95;aK[i]=0.35+Math.random()*0.5;aP[i]=Math.random()*6.283;aY[i]=apos[i*3+1];}
  /* as the section is scrolled, the crowd is slowly drawn toward the foot of the hill (g: 0..1); a slow tide and small individual sway ride on top */
  function stepArafat(t,n,fr,g){
    var arr=ageo.attributes.position.array,k,e0,et,amt,sc2,ph,sw=REDUCE?0:1,tt=REDUCE?0:t;
    for(k=0;k<n;k++){
      e0=aE[k];et=aET[k];ph=aP[k];
      amt=Math.min(1,g*aK[k]*(1+0.18*Math.sin(tt*0.11+ph)));
      sc2=e0>et?(e0-(e0-et)*amt)/e0:1;
      arr[k*3]=HX+aDX[k]*sc2+sw*Math.sin(tt*0.35+ph)*0.9;
      arr[k*3+2]=HZ+aDZ[k]*sc2+sw*Math.cos(tt*0.29+ph*1.3)*0.7;
      arr[k*3+1]=aY[k]+sw*0.1*Math.sin(tt*1.2+ph*2);
    }
    /* keep feet on the ground: refresh 1/16 of the heights each frame */
    for(k=fr&15;k<n;k+=16){aY[k]=heightAt(arr[k*3],arr[k*3+2])+0.55;}
    ageo.attributes.position.needsUpdate=true;
  }
  var ageo=new THREE.BufferGeometry();ageo.setAttribute('position',new THREE.BufferAttribute(apos,3));
  var arPts=new THREE.Points(ageo,new THREE.PointsMaterial({map:dotTex,size:1.9,color:0xfff1c9,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending}));arPts.frustumCulled=false;arafatG.add(arPts);
  var aGlow=glowSprite(dotTex,0xffe2a0,150,0,true);aGlow.position.set(-62,14,-515);arafatG.add(aGlow);
  arafatG.visible=false;

  /* drifting sand near the viewer */
  var dustGroup=new THREE.Group();scene.add(dustGroup);
  var ND=small?380:700,dpos=new Float32Array(ND*3),dsp=new Float32Array(ND),dph=new Float32Array(ND);
  for(i=0;i<ND;i++){dpos[i*3]=(Math.random()-0.5)*90;dpos[i*3+1]=0.3+Math.random()*16;dpos[i*3+2]=-70+Math.random()*90;dsp[i]=1.5+Math.random()*3.5;dph[i]=Math.random()*6.28;}
  var dgeo=new THREE.BufferGeometry();dgeo.setAttribute('position',new THREE.BufferAttribute(dpos,3));
  var dust=new THREE.Points(dgeo,new THREE.PointsMaterial({map:dotTex,size:0.55,color:0xf3dcae,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));
  dust.frustumCulled=false;dustGroup.add(dust);
  var dbase=new Float32Array(ND);for(i=0;i<ND;i++){dbase[i]=dpos[i*3+1];}

  /* Arabian peninsula map for the timeline */
  var TLI=secs.indexOf(document.getElementById('somoyrekha')),MK=22,MY=200,CZ=-300;
  var arabG=new THREE.Group();arabG.visible=false;scene.add(arabG);
  var sea=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshBasicMaterial({color:0x0a1c36,fog:false}));sea.rotation.x=-Math.PI/2;sea.position.set(0,MY-0.2,CZ-100);arabG.add(sea);
  function land(coast,extra,col){var sh=new THREE.Shape(),all=coast.concat(extra);all.forEach(function(p,i){var x=(p[0]-39)*MK,y=(p[1]-24)*MK;if(i){sh.lineTo(x,y);}else{sh.moveTo(x,y);}});
    var m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:col,fog:false}));m.rotation.x=-Math.PI/2;m.position.set(0,MY,CZ);arabG.add(m);
    var pp=coast.map(function(p){return new THREE.Vector3((p[0]-39)*MK,MY+0.3,CZ-(p[1]-24)*MK);});
    arabG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pp),new THREE.LineBasicMaterial({color:0xd8b26a,transparent:true,opacity:0.6,fog:false})));}
  land([[34.9,29.5],[35.8,27.5],[37.0,25.8],[38.1,24.1],[39.2,21.6],[40.9,19.3],[42.6,16.9],[43.3,13.3],[45,12.8]],[[45,29.5]],0x3a3324);
  land([[32.6,29.9],[33.8,27.2],[35.5,24.0],[37.2,21.0],[37.4,18.2],[39.4,15.6],[41.0,14.0],[42.7,12.5],[45,11.0]],[[45,9],[33,9],[33,29.9]],0x2b3a2e);
  function mkLab(txt){var c=document.createElement('canvas');c.width=512;c.height=128;var x=c.getContext('2d'),tx=new THREE.CanvasTexture(c);
    function dr(){x.clearRect(0,0,512,128);x.font='600 54px "Noto Serif Bengali",serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='rgba(7,11,20,.95)';x.strokeText(txt,256,64);x.fillStyle='#f1d796';x.fillText(txt,256,64);tx.needsUpdate=true;}
    dr();if(document.fonts&&document.fonts.load){document.fonts.load('600 54px "Noto Serif Bengali"',txt).then(dr,function(){});}
    var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,fog:false}));sp.scale.set(24,6,1);return sp;}
  function mkDot(col,sz){return new THREE.Sprite(new THREE.SpriteMaterial({map:dotTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));}
  var PL={makka:[39.83,21.42,'মক্কা',-14,6],taif:[40.42,21.27,'তায়েফ',15,7],madina:[39.61,24.47,'মদিনা',0,-7],badr:[38.77,23.75,'বদর',-13,5],khaybar:[39.29,25.70,'খায়বার',0,-7],tabuk:[36.57,28.38,'তাবুক',0,-7],habasha:[38.72,14.13,'আবিসিনিয়া',0,-7]};
  for(var pn in PL){(function(o){o.w=new THREE.Vector3((o[0]-39)*MK,MY+0.6,CZ-(o[1]-24)*MK);
    o.halo=mkDot(0xffd9a0);o.halo.position.copy(o.w);o.hs=20;arabG.add(o.halo);
    o.core=mkDot(0xfff2cc);o.core.position.copy(o.w);o.core.scale.setScalar(5);arabG.add(o.core);
    o.lab=mkLab(o[2]);o.lab.position.set(o.w.x+o[3],MY+3,o.w.z+o[4]);arabG.add(o.lab);o.a=0.4;})(PL[pn]);}
  var routeL=new THREE.Line(new THREE.BufferGeometry().setFromPoints([PL.makka.w,PL.madina.w]),new THREE.LineBasicMaterial({color:0xf1d796,transparent:true,opacity:0.25,fog:false}));arabG.add(routeL);
  var fKey='overview',FA={hijra:['makka','madina']},fPos=new THREE.Vector3(0,MY+380,-120),fLook=new THREE.Vector3(0,MY,-215),fT=new THREE.Vector3(),fL=new THREE.Vector3();
  window.addEventListener('tlfocus',function(e){fKey=e.detail||'overview';});
  function fcam(key){if(key==='overview'){fT.set(0,MY+380,-120);fL.set(0,MY,-215);return;}
    if(key==='hijra'){var a=PL.makka.w,b=PL.madina.w,mx=(a.x+b.x)/2,mz=(a.z+b.z)/2;fT.set(mx,MY+135,mz+92);fL.set(mx,MY,mz-2);return;}
    var w=(PL[key]||PL.makka).w;fT.set(w.x,MY+82,w.z+60);fL.set(w.x,MY,w.z-3);}

  /* palm groves (Madina oasis) and rock fields (black harra near Madina, stony valley near Makka); instanced, so cheap */
  wRock.map=rockTex;if(rockNorm){wRock.normalMap=rockNorm;wRock.normalScale=new THREE.Vector2(1.2,1.2);}if(rockRough){wRock.roughnessMap=rockRough;}wRock.needsUpdate=true;
  var pgS=11;function pgR(){pgS=(pgS*16807)%2147483647;return pgS/2147483647;}
  var pgD=new THREE.Object3D(),pgC=[[-8,-300],[-24,-345],[118,-296],[104,-392],[38,-408],[150,-340]],pgN=small?5:12,pgT=pgC.length*pgN,pgI=0;
  /* date palm model: "Realistic Palm Tree Free" by Next Spring (https://sketchfab.com/3d-models/realistic-palm-tree-free-39052ea764c945858449e699318efa53), CC BY 4.0. Rescaled, geometry quantised and textures recompressed so the page stays one file. */
  var PALM=SIRAT.assets.PALM;
  var palmBuf=(function(s){var r=atob(s),n=r.length,u=new Uint8Array(n),i;for(i=0;i<n;i++){u[i]=r.charCodeAt(i);}return u.buffer;})(PALM.bin);
  function palmGeo(d){
    var g=new THREE.BufferGeometry(),n=d.n,P=new Int16Array(palmBuf,d.p,n*3),N=new Int8Array(palmBuf,d.nm,n*3),U=new Uint16Array(palmBuf,d.uv,n*2),pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2),k,j;
    for(k=0;k<n;k++){for(j=0;j<3;j++){pos[k*3+j]=P[k*3+j]/32767*d.h[j]+d.c[j];nor[k*3+j]=N[k*3+j]/127;}uv[k*2]=U[k*2]/65535*d.uvs;uv[k*2+1]=U[k*2+1]/65535*d.uvs;}
    g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    g.setIndex(new THREE.BufferAttribute(new Uint16Array(palmBuf,d.i,d.ni),1));return g;
  }
  function palmTex(b64,png){var t=texLoader.load('data:image/'+(png?'png':'jpeg')+';base64,'+b64);t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=small?2:4;return t;}
  var palmMats=[
    new THREE.MeshStandardMaterial({map:palmTex(SIRAT.assets.palmTex0,false),roughness:0.9,side:THREE.DoubleSide}),
    new THREE.MeshStandardMaterial({map:palmTex(SIRAT.assets.palmTex1,true),color:0xd2ecb0,roughness:0.8,alphaTest:0.33,side:THREE.DoubleSide}),
    new THREE.MeshStandardMaterial({map:palmTex(SIRAT.assets.palmTex2,true),roughness:0.8,alphaTest:0.32,side:THREE.DoubleSide})];
  var pgMesh=PALM.meta.map(function(d,k){var m=new THREE.InstancedMesh(palmGeo(d),palmMats[d.mat],pgT);m.frustumCulled=false;return m;});
  pgC.forEach(function(c){for(var q=0;q<pgN;q++){var a=pgR()*6.283,r=Math.sqrt(pgR())*24,x=c[0]+Math.cos(a)*r,z=c[1]+Math.sin(a)*r,y=heightAt(x,z),s=0.65+pgR()*0.5,k;pgD.position.set(x,y-0.15,z);pgD.rotation.set((pgR()-0.5)*0.1,pgR()*6,(pgR()-0.5)*0.1);pgD.scale.set(s,s,s);pgD.updateMatrix();for(k=0;k<pgMesh.length;k++){pgMesh[k].setMatrixAt(pgI,pgD.matrix);}pgI++;}});
  pgMesh.forEach(function(m){scene.add(m);});
  /* wind: trunks and crowns lean and sway in the vertex shader (instanced, so still cheap); strength follows the weather */
  var swU={t:{value:0},a:{value:0.3}};
  function swayMat(m,k,base){m.onBeforeCompile=function(sh){sh.uniforms.uWT=swU.t;sh.uniforms.uWA=swU.a;sh.vertexShader='uniform float uWT;uniform float uWA;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat swp=instanceMatrix[3].x*0.07+instanceMatrix[3].z*0.05;\n#else\nfloat swp=0.0;\n#endif\nfloat swh='+(base>0?base.toFixed(1)+'+position.y*0.2':'max(position.y+3.5,0.0)')+';\ntransformed.x+=sin(uWT*1.7+swp)*uWA*swh*'+k+';\ntransformed.z+=cos(uWT*1.3+swp)*uWA*swh*'+(k*0.6)+';');};m.needsUpdate=true;}
  function palmSway(m,fl){m.onBeforeCompile=function(sh){sh.uniforms.uWT=swU.t;sh.uniforms.uWA=swU.a;sh.vertexShader='uniform float uWT;uniform float uWA;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat swp=instanceMatrix[3].x*0.07+instanceMatrix[3].z*0.05;\n#else\nfloat swp=0.0;\n#endif\nfloat swh=max(position.y,0.0);\ntransformed.x+=sin(uWT*1.7+swp)*uWA*swh*0.045;\ntransformed.z+=cos(uWT*1.3+swp)*uWA*swh*0.027;'+(fl?'\ntransformed.y+=sin(uWT*3.1+swp+position.x*0.9)*uWA*0.05*length(position.xz);':''));};m.needsUpdate=true;}
  palmSway(palmMats[0],false);palmSway(palmMats[1],true);palmSway(palmMats[2],true);
  function pgRocks(cx,cz,r0,r1,n,col,s0,s1,blk){var m=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),blk?blkMat(col):new THREE.MeshStandardMaterial(rockExtra({color:col,roughness:1,flatShading:true,map:rockTex})),n);for(var q=0;q<n;q++){var a=pgR()*6.283,r=r0+Math.sqrt(pgR())*(r1-r0),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,s=s0+pgR()*(s1-s0);pgD.position.set(x,heightAt(x,z)+s*0.25,z);pgD.rotation.set(pgR()*3,pgR()*6,pgR()*3);pgD.scale.set(s,s*(0.45+pgR()*0.35),s*(0.8+pgR()*0.5));pgD.updateMatrix();m.setMatrixAt(q,pgD.matrix);}m.frustumCulled=false;scene.add(m);}
  pgRocks(62,-335,75,240,small?260:620,0x6e6a66,0.5,2.6,true);
  pgRocks(0,-60,62,190,small?140:320,0x6a5a49,0.5,2.2);

  /* Makka layout around the Kaaba (schematic, distances compressed): Zamzam, Safa, Marwa with the walkway, early mud-brick houses */
  var mkLabs=[];
  function mkTag(txt,x,y,z){var s=mkLab(txt);s.scale.set(16,4,1);s.position.set(x,y,z);scene.add(s);mkLabs.push(s);return s;}
  var zzG=new THREE.Group();zzG.position.set(21,heightAt(21,-47),-47);scene.add(zzG);
  var zzR=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.7,1,16,1,true),new THREE.MeshStandardMaterial({color:0x9a8a73,roughness:1,flatShading:true,side:THREE.DoubleSide}));zzR.position.y=0.5;zzG.add(zzR);
  var zzW=new THREE.Mesh(new THREE.CircleGeometry(2.3,16),new THREE.MeshBasicMaterial({color:0x12363f}));zzW.rotation.x=-Math.PI/2;zzW.position.y=0.8;zzG.add(zzW);
  var tZz=mkTag('জমজম',21,5,-47);
  function mound(x,z,sx,sz){var m=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial(rockExtra({color:0x7b6e5e,roughness:1,flatShading:true,map:rockTex})));m.scale.set(sx,2.6,sz);m.position.set(x,heightAt(x,z)+0.6,z);m.rotation.y=pgR()*3;scene.add(m);}
  mound(54,-26,6,5);mound(56,-100,6.5,5);
  var maW=new THREE.Mesh(new THREE.PlaneGeometry(5,62),new THREE.MeshStandardMaterial({color:0x4d4339,roughness:1}));maW.rotation.x=-Math.PI/2;maW.position.set(54,heightAt(54,-63)+0.3,-63);scene.add(maW);
  var tSf=mkTag('সাফা',54,6,-26),tMr=mkTag('মারওয়া',56,6,-100);
  var hsN=small?26:56,hsI=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),brickMat(0xffffff),hsN),hsC=new THREE.Color(),hsK=0,hsT=0;
  while(hsK<hsN&&hsT<4000){hsT++;var ha=pgR()*6.283,hr=52+pgR()*24,hx=Math.cos(ha)*hr,hz=-60+Math.sin(ha)*hr;if(!(hz<-66||hx>34)){continue;}if(hx>38&&hx<68&&hz>-110&&hz<-20){continue;}
    var hw=4+pgR()*3,hd=4+pgR()*3,hh=2.6+pgR()*1.4;pgD.position.set(hx,heightAt(hx,hz)+hh/2,hz);pgD.rotation.set(0,pgR()*3,0);pgD.scale.set(hw,hh,hd);pgD.updateMatrix();hsI.setMatrixAt(hsK,pgD.matrix);hsC.setHSL(0.06+pgR()*0.03,0.18,0.66+pgR()*0.22);hsI.setColorAt(hsK,hsC);hsK++;}
  hsI.count=hsK;hsI.frustumCulled=false;scene.add(hsI);

  /* new scenes: qibla, Thawr cave, Hijri moon, Black Stone and cloth */
  function secP(n){return clamp((window.scrollY+window.innerHeight*0.45-tops[n])/Math.max(1,(tops[n+1]||tops[n]+1000)-tops[n]),0,1);}
  function lbar(len,w,col){var mA=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),mB=mA.clone(),g=new THREE.Group(),a=new THREE.PlaneGeometry(w,len),b=new THREE.PlaneGeometry(len,12);a.rotateX(-Math.PI/2);a.translate(0,0,-len/2);b.translate(len/2,6,0);b.rotateY(Math.PI/2);g.add(new THREE.Mesh(a,mA),new THREE.Mesh(b,mB));g.o=function(v){mA.opacity=v;mB.opacity=v*0.28;};return g;}
  var qG=new THREE.Group();qG.position.set(62,1.6,-335);qG.visible=false;scene.add(qG);
  var qJ=lbar(230,6,0xffd9a0),qK=lbar(230,6,0x7be0bd);qJ.rotation.y=Math.atan2(0.52,0.85);qK.rotation.y=Math.atan2(0.22,-0.975);qG.add(qJ,qK);
  var qL1=mkLab('বাইতুল মাকদিস'),qL2=mkLab('কাবা');qL1.scale.set(64,16,1);qL2.scale.set(40,10,1);qL1.position.set(-16,16,-462);qL2.position.set(29,16,-189);qL1.visible=qL2.visible=false;scene.add(qL1,qL2);
  var cvG=new THREE.Group();cvG.position.set(-20,heightAt(-20,-200),-200);cvG.rotation.y=0.5;cvG.visible=false;scene.add(cvG);
  var cvM=new THREE.Mesh(new THREE.IcosahedronGeometry(1,4),cliffMat({color:0xcdbfae,roughness:1},9,[14,10,13]));cvM.scale.set(14,10,13);cvG.add(cvM);
  var cvO=new THREE.Mesh(new THREE.CircleGeometry(3.6,20),new THREE.MeshBasicMaterial({color:0x030303}));cvO.scale.set(1,1.25,1);cvO.position.set(0,3.6,12.7);cvG.add(cvO);
  var cvGl=glowSprite(dotTex,0xffb26a,16,0.5,true);cvGl.position.set(0,3.4,12.9);cvG.add(cvGl);
  var mnG=new THREE.Group();mnG.position.set(100,30,-352);mnG.visible=false;scene.add(mnG);
  var mnMat=new THREE.ShaderMaterial({uniforms:{uP:{value:0}},vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform float uP;varying vec3 vN;void main(){float a=6.2832*uP;vec3 l=vec3(sin(a),0.0,-cos(a));float d=max(dot(normalize(vN),l),0.0);float lit=smoothstep(0.0,0.12,d);vec3 c=mix(vec3(0.05,0.07,0.13),vec3(1.0,0.96,0.82)*(0.55+0.45*d),lit);gl_FragColor=vec4(c,1.0);}'});
  mnG.add(new THREE.Mesh(new THREE.SphereGeometry(7,40,24),mnMat));mnG.add(glowSprite(dotTex,0xbfd0ff,46,0.3,false));
  var mnL=['মুহাররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শাবান','রমজান','শাওয়াল','যিলকদ','যিলহজ'].map(function(n){var s=mkLab(n);s.scale.set(30,7.5,1);s.position.set(0,-12,0);s.visible=false;mnG.add(s);return s;});
  var hjG=new THREE.Group();hjG.visible=false;scene.add(hjG);
  var cloth=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshStandardMaterial({color:0xe9dfc6,roughness:1,side:THREE.DoubleSide,transparent:true}));cloth.rotation.x=-Math.PI/2;cloth.position.set(9,0.2,-38);hjG.add(cloth);
  var hSt=new THREE.Mesh(new THREE.SphereGeometry(0.9,16,12),new THREE.MeshStandardMaterial({color:0x14100d,roughness:0.6,emissive:0x1a120a,emissiveIntensity:0.5}));hSt.scale.set(1.2,0.9,0.6);hjG.add(hSt);
  var hRing=new THREE.Mesh(new THREE.TorusGeometry(1.15,0.18,8,24),new THREE.MeshStandardMaterial({color:0xcfd3d8,roughness:0.3,metalness:0.9}));hRing.position.set(6.6,2.3,-52.2);hRing.rotation.y=Math.PI/4;hRing.visible=false;hjG.add(hRing);
  /* timeline diorama on the map: small Kaaba, cloth and Black Stone, played when the rebuilding event is open */
  var dioG=new THREE.Group(),dK=new THREE.Mesh(new THREE.BoxGeometry(7,9,7.6),new THREE.MeshStandardMaterial({color:0x1b1916,roughness:0.8}));dK.position.y=4.5;dioG.add(dK);
  var dBd=new THREE.Mesh(new THREE.BoxGeometry(7.1,0.8,7.7),goldMat);dBd.position.y=7.4;dioG.add(dBd);
  var dCl=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:0xe9dfc6,roughness:1,side:THREE.DoubleSide,transparent:true}));dCl.rotation.x=-Math.PI/2;dCl.position.set(8,0.15,7);dioG.add(dCl);
  var dSt=new THREE.Mesh(new THREE.SphereGeometry(0.75,14,10),new THREE.MeshStandardMaterial({color:0x14100d,roughness:0.6,emissive:0x2a1c0c,emissiveIntensity:0.8}));dSt.scale.set(1.2,0.9,0.6);dioG.add(dSt);
  var dRg=new THREE.Mesh(new THREE.TorusGeometry(1,0.16,8,20),new THREE.MeshStandardMaterial({color:0xcfd3d8,roughness:0.3,metalness:0.9}));dRg.position.set(3.55,2.4,3.85);dRg.rotation.y=Math.PI/4;dioG.add(dRg);
  dioG.position.set(PL.makka.w.x-3,MY+0.4,PL.makka.w.z-16);dioG.visible=false;scene.add(dioG);var kLi=null,ka=0;
  /* Hijrah route on the map: Thawr cave, Umm Ma'bad's tent, Quba light up in turn while a dot travels */
  var hjR=new THREE.Group();arabG.add(hjR);
  function geoPt(lon,lat){return new THREE.Vector3((lon-39)*MK,MY+0.8,CZ-(lat-24)*MK);}
  var hjPts=[geoPt(39.83,21.42),geoPt(39.84,21.26),geoPt(39.45,21.62),geoPt(39.30,22.20),geoPt(39.05,23.00),geoPt(39.35,23.85),geoPt(39.62,24.33),geoPt(39.61,24.47)];
  var hjCv=new THREE.CatmullRomCurve3(hjPts),hjGeo=new THREE.BufferGeometry().setFromPoints(hjCv.getPoints(120)),hjLine=new THREE.Line(hjGeo,new THREE.LineBasicMaterial({color:0xf1d796,transparent:true,opacity:0.9,fog:false}));hjLine.frustumCulled=false;hjR.add(hjLine);
  var hjW=[[0.12,39.84,21.26,'সাওর গুহা',8,11],[0.5,39.30,22.20,'উম্মে মাবাদের তাঁবু',-20,0],[0.86,39.62,24.33,'কুবা',14,5]].map(function(r){var d={t:r[0],p:geoPt(r[1],r[2]),o:[r[4],r[5]],halo:mkDot(0xffd9a0),core:mkDot(0xfff2cc),lab:mkLab(r[3]),a:0};d.halo.position.copy(d.p);d.core.position.copy(d.p);d.core.scale.setScalar(3.5);hjR.add(d.halo,d.core,d.lab);return d;});
  var hjMv=mkDot(0xfff6d8);hjMv.scale.setScalar(9);hjR.add(hjMv);hjR.visible=false;var hv=0;
  /* the travelling dot: eases out of Makkah, rests at Thawr cave, rides on past Umm Ma'bad, rests at Quba, then on to Madina.
     pairs are [time 0..1, distance along the route]; two equal distances in a row are a rest */
  var HJ=[[0,0],[0.09,0.12],[0.23,0.12],[0.793,0.86],[0.893,0.86],[1,1]];
  function hijraK(v){var k,x,y,u;if(v<=0){return 0;}for(k=1;k<HJ.length;k++){if(v<=HJ[k][0]){x=HJ[k-1];y=HJ[k];u=(v-x[0])/(y[0]-x[0]);return x[1]+(y[1]-x[1])*sstep(0,1,u);}}return 1;}
  function hijraRest(v){return sstep(0.09,0.12,v)*(1-sstep(0.2,0.23,v))+sstep(0.793,0.82,v)*(1-sstep(0.87,0.893,v));}
  /* caravan trade routes: Makka-Syria (via Badr and Tabuk) and Makka-Yemen (via Taif); schematic */
  var trG=new THREE.Group();arabG.add(trG);
  function trRoute(pts,col,labs){var cv=new THREE.CatmullRomCurve3(pts.map(function(p){return geoPt(p[0],p[1]);})),ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(90)),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.3,fog:false}));ln.frustumCulled=false;trG.add(ln);
    var n=36,arr=new Float32Array(n*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arr,3));var pt=new THREE.Points(g,new THREE.PointsMaterial({map:dotTex,color:col,size:1.8,transparent:true,opacity:0.4,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));pt.frustumCulled=false;trG.add(pt);
    var L2=labs.map(function(l){var s=mkLab(l[0]);s.userData.b=geoPt(l[1],l[2]);s.userData.o=l[3];trG.add(s);return s;});return {cv:cv,ln:ln,pt:pt,arr:arr,n:n,labs:L2,a:0.3};}
  var trSy=trRoute([[39.83,21.42],[39.3,22.2],[38.9,23.0],[38.77,23.75],[38.3,24.8],[37.93,26.6],[36.57,28.38],[36.0,30.0]],0xffc870,[['শামের (সিরিয়ার) পথ',36.1,29.6,[18,0]]]);
  var trYe=trRoute([[39.83,21.42],[40.42,21.27],[41.6,20.0],[42.9,18.6],[44.13,17.49],[44.2,15.35]],0x7be0bd,[['ইয়েমেনের পথ',44.2,15.35,[-22,6]]]);

  /* caravans: small camel silhouettes walk along the two trade routes (the dotted trail stays as the dust of the caravan) */
  var camelTex=canvasTex(256,function(g,s){g.translate(0,36);g.fillStyle='#fff';
    g.beginPath();g.ellipse(112,92,58,26,0,0,6.283);g.fill();
    g.beginPath();g.ellipse(106,62,22,22,0,0,6.283);g.fill();
    g.beginPath();g.moveTo(150,80);g.quadraticCurveTo(178,70,184,40);g.lineTo(200,44);g.quadraticCurveTo(196,84,160,106);g.closePath();g.fill();
    g.beginPath();g.ellipse(206,38,20,10,-0.25,0,6.283);g.fill();
    [[66,104],[84,108],[132,108],[150,104]].forEach(function(l){g.fillRect(l[0]-4,l[1],9,50);});
    g.fillRect(50,80,7,30);});
  function mkCamels(R,col){R.camels=[];for(var q=0;q<5;q++){var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:camelTex,color:col,transparent:true,depthWrite:false,fog:false,opacity:0}));sp.scale.set(8,8,1);sp.frustumCulled=false;trG.add(sp);R.camels.push(sp);}}
  mkCamels(trSy,0xffd08a);mkCamels(trYe,0x9be8cb);

  /* weather: soft clouds drift around the viewer; a sandstorm thickens fog and dust; the palms sway harder */
  var wc=0,ws=0,cc=new THREE.Color(),stormCol=new THREE.Color();
  var cloudTex=canvasTex(256,function(g,s){var q,x,y,rad,r;for(q=0;q<9;q++){x=50+((q*53)%160);y=96+((q*37)%60);rad=40+((q*29)%34);r=g.createRadialGradient(x,y,0,x,y,rad);r.addColorStop(0,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s);}});
  var cloudG=new THREE.Group(),clouds=[],cq,cN=small?7:13;scene.add(cloudG);
  for(cq=0;cq<cN;cq++){var cs=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,opacity:0}));cs.scale.set(380+pgR()*160,190+pgR()*70,1);cs.frustumCulled=false;cs.visible=false;cloudG.add(cs);clouds.push({s:cs,ang:pgR()*6.283,r:620+pgR()*480,y:150+pgR()*150,sp:0.6+pgR()*0.8,d:pgR()});}

  /* Madina oasis: green patches under the palm groves and a few stone wells, for green against the dark rock */
  var oaMat=new THREE.MeshStandardMaterial({color:0x2f6b3a,roughness:1,transparent:true,opacity:0.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  pgC.forEach(function(c){var d=new THREE.Mesh(new THREE.CircleGeometry(26,28),oaMat);d.rotation.x=-Math.PI/2;d.position.set(c[0],heightAt(c[0],c[1])+0.35,c[1]);scene.add(d);});
  var wlMat=new THREE.MeshStandardMaterial({color:0x8a7b66,roughness:1,flatShading:true,side:THREE.DoubleSide}),wlWood=new THREE.MeshStandardMaterial({color:0x5a4330,roughness:1,flatShading:true});
  [[-6,-318],[96,-306],[46,-396]].forEach(function(c){var y0=heightAt(c[0],c[1]),g=new THREE.Group(),ring=new THREE.Mesh(new THREE.CylinderGeometry(1.7,1.8,1.1,14,1,true),wlMat),wt=new THREE.Mesh(new THREE.CircleGeometry(1.6,14),new THREE.MeshBasicMaterial({color:0x12363f})),q,post;
    ring.position.y=0.55;wt.rotation.x=-Math.PI/2;wt.position.y=0.7;g.add(ring,wt);
    for(q=0;q<2;q++){post=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,3.6,6),wlWood);post.position.set(q?1.5:-1.5,1.8,0);post.rotation.z=q?0.18:-0.18;g.add(post);}
    var bar=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,3.4,6),wlWood);bar.rotation.z=Math.PI/2;bar.position.y=3.5;g.add(bar);
    g.position.set(c[0],y0,c[1]);scene.add(g);});
  mkTag('কূপ',-6,7,-318);mkTag('কূপ',96,7,-306);mkTag('খেজুরবাগান',-8,16,-300);mkTag('খেজুরবাগান',118,16,-296);

  /* scroll keyframes: js/world/keyframes.js */
  var KF=SIRAT.keyframes,K=KF.K,TOD=KF.TOD,P=KF.P;

  var cZ=new THREE.Color(),cZ2=new THREE.Color(),cH=new THREE.Color(),cH2=new THREE.Color(),cK=new THREE.Color(),cK2=new THREE.Color(),white=new THREE.Color(0xffffff),cG=new THREE.Color();
  var tgtPos=new THREE.Vector3(),tgtLook=new THREE.Vector3(),curPos=new THREE.Vector3(),curLook=new THREE.Vector3(),lightDir=new THREE.Vector3();
  var moonL=new THREE.Vector3(-0.35,0.6,0.55),sunL=new THREE.Vector3(0.65,0.4,0.55);
  var mouse={x:0,y:0,tx:0,ty:0},side=0,first=true,last=performance.now()*0.001;
  window.addEventListener('pointermove',function(e){mouse.tx=(e.clientX/window.innerWidth-0.5)*2;mouse.ty=(e.clientY/window.innerHeight-0.5)*2;},{passive:true});

  function resize(){
    var w=window.innerWidth,h=window.innerHeight;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=(w/h<0.8)?68:52;camera.updateProjectionMatrix();
  }
  window.addEventListener('resize',resize);resize();

  function frame(now){
    requestAnimationFrame(frame);
    if(S3.off){return;}if(Q.lite){if(now-(S3.lr||0)<32){return;}S3.lr=now;}
    var t=now*0.001,dt=Math.min(0.06,Math.max(0.001,t-last));last=t;
    var tf=sceneF().f;arabG.visible=TLI>=0&&Math.abs(tf-TLI)<1.4;
    if(arabG.visible){fcam(fKey);var fk=REDUCE?1:1-Math.exp(-dt*2.2);fPos.lerp(fT,fk);fLook.lerp(fL,fk);P[TLI].p=[fPos.x,fPos.y,fPos.z];P[TLI].l=[fLook.x,fLook.y,fLook.z];
      var act=FA[fKey]||[fKey];
      for(var pk in PL){var o=PL[pk],on=act.indexOf(pk)>=0;o.a+=((on?1:0.4)-o.a)*Math.min(1,dt*4);var pu=on&&!REDUCE?1+0.25*Math.sin(t*3.2):1;
        o.halo.material.opacity=0.85*o.a;o.core.material.opacity=o.a;o.halo.scale.setScalar(o.hs*pu*(0.8+0.4*o.a)*(1+0.35*(o.a>0.7?1:0)));o.core.scale.setScalar(5*(0.9+0.5*o.a));o.lab.material.opacity=0.5+0.5*o.a;var kd=Math.max(1,camera.position.distanceTo(o.w)*0.0068);o.lab.scale.set(24*kd,6*kd,1);o.lab.position.set(o.w.x+o[3]*kd,MY+3,o.w.z+o[4]*kd);}
      routeL.material.opacity+=((fKey==='hijra'?0.9:0.25)-routeL.material.opacity)*Math.min(1,dt*4);}
    var sc=sceneF(),ia=sc.i,tt=sc.t,ib=Math.min(ia+1,K.length-1),a=K[ia],b=K[ib],pa=P[ia],pb=P[ib];
    var ov=S3.tod>0?TOD[S3.tod]:null;
    function L(k){if(ov&&k!=='beam'&&k!=='side'&&k!=='mad'){return ov[k];}return a[k]+(b[k]-a[k])*tt;}

    /* camera path */
    tgtPos.set(pa.p[0]+(pb.p[0]-pa.p[0])*tt,pa.p[1]+(pb.p[1]-pa.p[1])*tt,pa.p[2]+(pb.p[2]-pa.p[2])*tt);
    tgtLook.set(pa.l[0]+(pb.l[0]-pa.l[0])*tt,pa.l[1]+(pb.l[1]-pa.l[1])*tt,pa.l[2]+(pb.l[2]-pa.l[2])*tt);
    if(first||REDUCE){curPos.copy(tgtPos);curLook.copy(tgtLook);first=false;}
    else{var k=1-Math.exp(-dt*5.5);curPos.lerp(tgtPos,k);curLook.lerp(tgtLook,k);}
    mouse.x+=(mouse.tx-mouse.x)*0.05;mouse.y+=(mouse.ty-mouse.y)*0.05;
    camera.position.copy(curPos);
    if(!REDUCE){camera.position.x+=mouse.x*2.0;camera.position.y+=-mouse.y*0.9+Math.sin(t*0.7)*0.08;}
    S3.cy+=(S3.ty-S3.cy)*0.12;S3.cx+=(S3.tx-S3.cx)*0.12;
    if(Math.abs(S3.cy)+Math.abs(S3.cx)>0.002){var vx=camera.position.x-curLook.x,vy=camera.position.y-curLook.y,vz=camera.position.z-curLook.z,cs=Math.cos(S3.cy),sn=Math.sin(S3.cy),nx=vx*cs+vz*sn;vz=-vx*sn+vz*cs;vx=nx;var rh=Math.hypot(vx,vz)||1,ln=Math.hypot(rh,vy),el=clamp(Math.atan2(vy,rh)+S3.cx,0.1,1.45);vy=Math.sin(el)*ln;var rr=Math.cos(el)*ln;vx*=rr/rh;vz*=rr/rh;camera.position.set(curLook.x+vx,curLook.y+vy,curLook.z+vz);}
    var minY=heightAt(camera.position.x,camera.position.z)+2.4;
    if(camera.position.y<minY){camera.position.y=minY;}
    camera.lookAt(curLook);
    var wide=window.innerWidth>=900;
    side+=((wide?L('side'):0)-side)*Math.min(1,dt*4);
    camera.setViewOffset(window.innerWidth,window.innerHeight,side*window.innerWidth*0.14,0,window.innerWidth,window.innerHeight);

    /* sky and atmosphere */
    if(ov){cZ.setHex(ov.zen);cH.setHex(ov.hor);}else{cZ.setHex(a.zen).lerp(cZ2.setHex(b.zen),tt);cH.setHex(a.hor).lerp(cH2.setHex(b.hor),tt);}
    var wxT=S3.wx|0,wk=REDUCE?1:Math.min(1,dt*1.2);wc+=((wxT===1?1:(wxT===2?0.7:0))-wc)*wk;ws+=((wxT===2?1:0)-ws)*wk;
    stormCol.setHex(0xb08f5e).multiplyScalar(0.22+0.78*clamp(L('sun')+0.08,0,1));
    if(ws>0.001){cH.lerp(stormCol,0.8*ws);cZ.lerp(stormCol,0.6*ws);}
    swU.t.value=REDUCE?0:t;swU.a.value=REDUCE?0:0.3+0.5*wc+1.6*ws;
    var sunAmt=L('sun');
    sunDir.set(0.52,L('sunY'),-0.85).normalize();
    skyMat.uniforms.uZen.value.copy(cZ);skyMat.uniforms.uHor.value.copy(cH);
    skyMat.uniforms.uSunDir.value.copy(sunDir);skyMat.uniforms.uSun.value=sunAmt;
    skyMat.uniforms.uGlow.value.setHex(0xff9a55).lerp(cG.setHex(0xffe3b0),clamp(L('sunY')*2.2,0,1));
    scene.fog.color.copy(cH);scene.fog.density=L('fog')+0.011*ws+0.0006*wc;
    sky.position.copy(camera.position);
    stars.rotation.y=sc.f*0.08+t*0.003;
    starMat.uniforms.uTime.value=t;starMat.uniforms.uAlpha.value=L('stars')*(1-0.9*ws)*(1-0.45*wc);
    var mvis=(1-0.9*ws)*(1-0.4*wc);moonDisk.material.opacity=clamp(L('moon'),0,1)*mvis;moonGlow.material.opacity=0.5*clamp(L('moon'),0,1)*mvis;
    sunDisk.position.copy(sunDir).multiplyScalar(1300);sunGlow.position.copy(sunDir).multiplyScalar(1299);
    sunDisk.material.opacity=sunAmt*(1-0.7*ws);sunGlow.material.opacity=0.7*sunAmt*(1-0.5*ws);
    cloudG.position.copy(camera.position);cc.setHex(0x56608a).lerp(white,clamp(sunAmt*0.9+0.08,0,1)).lerp(stormCol,0.7*ws);
    clouds.forEach(function(c){if(!REDUCE){c.ang+=dt*0.003*c.sp*(1+3*ws);}c.s.position.set(Math.cos(c.ang)*c.r,c.y,Math.sin(c.ang)*c.r);c.s.material.color.copy(cc);c.s.material.opacity=(0.18+0.5*c.d)*wc;c.s.visible=wc>0.01;});

    /* lights */
    hemi.color.copy(cH).lerp(white,0.3);hemi.intensity=L('amb');
    if(ov){cK.setHex(ov.keyCol);}else{cK.setHex(a.keyCol).lerp(cK2.setHex(b.keyCol),tt);}key.color.copy(cK);key.intensity=L('key')*(1-0.35*ws);
    lightDir.lerpVectors(moonL,sunL,clamp(sunAmt,0,1)).normalize();key.position.copy(lightDir).multiplyScalar(300);
    kaabaLight.intensity=1.4*(1-0.8*clamp(sunAmt,0,1));kGlow.material.opacity=0.35*(1-0.7*clamp(sunAmt,0,1));
    var mad=L('mad');madLight.intensity=mad*1.8;domeMat.emissiveIntensity=0.5+mad*0.6;madGlow.material.opacity=0.12+mad*0.3;

    /* Hira beam and Hijrah path */
    var bi=L('beam');beamMat.uniforms.uInt.value=bi;beamMat.uniforms.uTime.value=t;halo.material.opacity=0.5*bi;emat.opacity=0.9*bi;
    pathMat.uniforms.uTime.value=t;pathMat.uniforms.uReveal.value=sstep(6.0,7.9,sc.f);
    mirMat.uniforms.uTime.value=t;mirMat.uniforms.uReveal.value=sstep(5.6,6.7,sc.f);
    var mw=clamp(1-Math.abs(sc.f-6),0,1);mirG.visible=mw>0.01;ringMats.forEach(function(m){m.opacity=0.16*mw;});

    var aw=clamp(1-Math.abs(sc.f-11),0,1);arafatG.visible=aw>0.01;var arW=1-sstep(0.18,0.36,L('sunY'));arPts.material.color.setRGB(1,0.945-0.125*arW,0.788-0.22*arW);aGlow.material.opacity=0.32*aw*(1+0.4*arW);
    warG.visible=clamp(1-Math.abs(sc.f-9),0,1)>0.01;W.forEach(function(g,k){g.visible=(k===SIRAT.warSel);});
    var fw=clamp(1-Math.abs(sc.f-10),0,1),fp=clamp(sc.f-10,0,1);fathG.visible=fw>0.01;var fl=fw*sstep(0.3,1,fp),fb=REDUCE?1:0.93+0.07*Math.sin(t*0.9);fGlow.material.opacity=(0.1+0.3*fw*sstep(0.25,0.9,fp))*fb;kaabaLight.intensity+=1.1*fl*fb;kGlow.material.opacity+=0.22*fl*fb;if(fDust){fDust.material.uniforms.uFp.value=fp;fRings.forEach(function(rm,k){var wv=k?sstep(0.4,1,fp):sstep(0.15,0.95,fp),R=18+36*wv;rm.scale.set(R,1,R);rm.material.opacity=fw*0.32*Math.sin(Math.PI*wv);});}
    idols.forEach(function(o){var q=sstep(0.1+o.userData.dl*0.4,0.55+o.userData.dl*0.4,fp);o.rotation.z=q*1.45*Math.cos(o.userData.dir);o.rotation.x=q*1.45*Math.sin(o.userData.dir);o.position.y=1.7-q*0.9;});

    /* new scenes: per-frame updates */
    var nf=sc.f;
    var dg=SIRAT.warSel===2?sstep(0.1,0.8,secP(9)):1;trN.scale.set(Math.max(0.001,dg),1,Math.max(0.2,dg));bkA.scale.set(Math.max(0.001,dg),Math.max(0.05,dg),1);bkB.scale.copy(bkA.scale);if(kMat){kMat.uniforms.uL.value=40*dg;kMat.uniforms.uT.value=REDUCE?0:t;}
    var mg2=sstep(7.6,8.45,nf),h0=sstep(0,0.45,mg2);
    mosK.forEach(function(e,k){var q;if(k===0){var hs=0.5+0.5*h0;e.m.scale.set(e.s.x*(0.4+0.6*h0),e.s.y*hs,e.s.z*(0.4+0.6*h0));e.m.position.y=e.p.y*hs;return;}
      q=k===1?sstep(0.15,0.55,mg2):k<22?sstep(0.5,0.85,mg2):k<26?sstep(0.8,1,mg2):sstep(0.6,0.9,mg2);q=Math.max(q,0.001);e.m.scale.set(e.s.x*q,e.s.y*q,e.s.z*q);if(k>1){e.m.position.y=e.p.y*q;}});
    var qv=sstep(7.4,7.9,nf)*(1-sstep(9.0,9.4,nf)),qp=sstep(8.5,8.95,nf);
    qG.visible=qL1.visible=qL2.visible=qv>0.01;qJ.o(0.9*(1-qp)*qv);qK.o((0.18+0.82*qp)*qv*(0.88+0.12*Math.sin(t*3)));qL1.material.opacity=(1-qp)*qv;qL2.material.opacity=(0.3+0.7*qp)*qv;
    var cvv=sstep(6.4,6.9,nf)*(1-sstep(7.5,7.9,nf));cvG.visible=cvv>0.01;cvGl.material.opacity=0.55*cvv*(0.85+0.15*Math.sin(t*2.4));
    mnG.visible=nf>19.6&&nf<21.4;
    if(mnG.visible){var gp=secP(20),mi=Math.min(11,Math.floor(gp*12));mnMat.uniforms.uP.value=Math.min(1,gp*12-mi)*0.97;mnL.forEach(function(s,k){s.visible=k===mi;});}
    var hp=sstep(0.2,0.8,secP(4)),hco=1-sstep(0.85,1,hp);hjG.visible=nf>3.55;
    hSt.position.set(9+(6.6-9)*hp,0.9+1.4*hp+Math.sin(hp*Math.PI)*3,-38+(-52.2+38)*hp);cloth.material.opacity=hco;cloth.visible=hco>0.01;hRing.visible=hp>0.9;
    var nA=Math.floor(NA*(0.15+0.85*sstep(0.1,0.85,secP(11))));ageo.setDrawRange(0,nA);if(arafatG.visible){stepArafat(t,nA,afr++,sstep(0.15,0.95,secP(11)));}arPts.material.opacity=0.8+0.15*Math.sin(t*2);
    if(!kLi){var kh=document.getElementById('tlh15');kLi=kh?kh.closest('.tl-i'):null;}
    var kOn=!!(kLi&&kLi.classList.contains('open')&&arabG.visible);ka=REDUCE?(kOn?1:0):(kOn?Math.min(1,ka+dt/5):Math.max(0,ka-dt/1.2));
    dioG.visible=ka>0.01;
    mkLabs.forEach(function(s){var dd=camera.position.distanceTo(s.position),o5=clamp((190-dd)/60,0,1);s.material.opacity=o5;s.visible=o5>0.02;});
    if(dioG.visible){var dp=sstep(0,0.12,ka),dm=sstep(0.2,0.8,ka);dioG.scale.setScalar(0.4+0.6*dp);dSt.position.set(8+(3.6-8)*dm,0.9+1.5*dm+Math.sin(dm*Math.PI)*3.5,7+(3.9-7)*dm);dCl.material.opacity=1-sstep(0.85,1,ka);dRg.visible=dm>0.95;}
    var hOn=fKey==='hijra'&&arabG.visible;hv=REDUCE?(hOn?1:0):(hOn?Math.min(1,hv+dt/15):Math.max(0,hv-dt/1.2));
    hjR.visible=hv>0.005;
    if(hjR.visible){var hk=hijraK(hv),hrs=REDUCE?0:hijraRest(hv);hjGeo.setDrawRange(0,Math.max(2,Math.floor(121*hk)));hjMv.position.copy(hjCv.getPoint(hk));hjMv.material.opacity=hk<1?0.95:0;hjMv.scale.setScalar(8+2*Math.sin(t*6)*(1-hrs)+4*hrs*(0.5+0.5*Math.sin(t*2.2)));
      var kd2=Math.max(1,camera.position.distanceTo(hjPts[3])*0.0068);
      hjW.forEach(function(d){var on=hk>=d.t-0.001;d.a+=((on?1:0.18)-d.a)*Math.min(1,dt*5);var pu2=on?1+0.25*Math.sin(t*3.2):1;d.halo.material.opacity=0.85*d.a;d.core.material.opacity=d.a;d.halo.scale.setScalar(12*pu2);d.lab.material.opacity=0.2+0.8*d.a;d.lab.scale.set(24*kd2,6*kd2,1);d.lab.position.set(d.p.x+d.o[0]*kd2,MY+3,d.p.z+d.o[1]*kd2);});}
    if(arabG.visible){var rsy=(fKey==='badr'||fKey==='tabuk')?1:0,rye=(fKey==='taif'||fKey==='makka')?1:0;
      [[trSy,rsy],[trYe,rye]].forEach(function(r){var R=r[0],o3=(t*0.05)%1,k3,p3;R.a+=((0.3+0.7*r[1])-R.a)*Math.min(1,dt*4);R.ln.material.opacity=0.2+0.5*R.a;R.pt.material.opacity=0.35+0.6*R.a;
        for(k3=0;k3<R.n;k3++){p3=R.cv.getPoint((k3/R.n+o3)%1);R.arr[k3*3]=p3.x;R.arr[k3*3+1]=p3.y;R.arr[k3*3+2]=p3.z;}R.pt.geometry.attributes.position.needsUpdate=true;
        R.camels.forEach(function(c,q){var u=((REDUCE?0.1:t*0.012)+q*0.03)%1,cp=R.cv.getPoint(u),dr=R.cv.getTangent(u).x<0?-1:1;c.position.set(cp.x,cp.y+2.6+(REDUCE?0:Math.abs(Math.sin(t*3+q*1.7))*0.3),cp.z);c.scale.set(8*dr,8,1);c.material.opacity=0.25+0.7*R.a;});
        R.labs.forEach(function(s){var b=s.userData.b,o4=s.userData.o,kd3=Math.max(1,camera.position.distanceTo(b)*0.0068);s.material.opacity=0.3+0.7*R.a;s.scale.set(34*kd3,8.5*kd3,1);s.position.set(b.x+o4[0]*kd3,MY+3,b.z+o4[1]*kd3);});});}

    /* ambient motion */
    if(!REDUCE){
      tawaf.rotation.y-=dt*0.06;
      var ar=dgeo.attributes.position.array,j;
      for(j=0;j<ND;j++){
        ar[j*3]+=dsp[j]*dt*(1+7*ws);if(ar[j*3]>45){ar[j*3]-=90;}
        ar[j*3+1]=dbase[j]+Math.sin(t*0.6+dph[j])*0.5;
      }
      dgeo.attributes.position.needsUpdate=true;
      if(bi>0.01){
        var er2=egeo.attributes.position.array,yy,rad2;
        for(j=0;j<NE;j++){
          yy=er2[j*3+1]+ev[j]*dt;if(yy>250){yy=0;}
          rad2=(3+(yy/300)*7)*er[j];
          er2[j*3]=Math.cos(ea[j])*rad2;er2[j*3+1]=yy;er2[j*3+2]=Math.sin(ea[j])*rad2;
        }
        egeo.attributes.position.needsUpdate=true;
      }
    }
    dustGroup.position.copy(camera.position);dust.material.size=0.55+0.9*ws;dust.material.opacity=0.5+0.4*ws;
    /* নতুন ৩ডি part-গুলোর প্রতি-ফ্রেম আপডেট (js/parts/) */
    if(PARTS.length){var fi={t:t,dt:dt,sc:sc,f:sc.f,camera:camera};PARTS.forEach(function(p){if(p.update&&!p.dead){try{p.update(fi);}catch(e){p.dead=true;if(window.console){console.error('[SIRAT part "'+p.name+'"] update ব্যর্থ, বন্ধ করা হলো',e);}}}});}
    renderer.render(scene,camera);
  }
  var rc=new THREE.Raycaster(),pv=new THREE.Vector2(),PK=[[kaaba,'kaaba'],[mos,'mosque'],[mount,'hera'],[zzG,'zamzam'],[tZz,'zamzam'],[maW,'safa'],[tSf,'safa'],[tMr,'safa']];
  function vis(o){while(o){if(!o.visible){return false;}o=o.parent;}return true;}
  S3.pick=function(cx,cy){if(hjR.visible){var hb=null,hdd=40,hq=new THREE.Vector3(),hkk=['thawr','ummabad','quba'];hjW.forEach(function(d,ix){hq.copy(d.p).project(camera);var hsx=(hq.x+1)/2*window.innerWidth,hsy=(1-hq.y)/2*window.innerHeight,hd2=Math.hypot(hsx-cx,hsy-cy);if(hq.z<1&&hd2<hdd){hdd=hd2;hb=hkk[ix];}});if(hb){return hb;}}if(arabG.visible){var bk=null,bdd=44,pp=new THREE.Vector3(),mk;for(mk in PL){pp.copy(PL[mk].w).project(camera);var sx=(pp.x+1)/2*window.innerWidth,sy=(1-pp.y)/2*window.innerHeight,dd=Math.hypot(sx-cx,sy-cy);if(pp.z<1&&dd<bdd){bdd=dd;bk=mk;}}if(bk){return 'map:'+bk;}}pv.set(cx/window.innerWidth*2-1,-(cy/window.innerHeight)*2+1);rc.setFromCamera(pv,camera);var best=null,bd=1e9;PK.forEach(function(p){if(!vis(p[0])){return;}var h=rc.intersectObject(p[0],true)[0];if(h&&h.distance<bd){bd=h.distance;best=p[1];}});return best;};

  /* ---------- নতুন ৩ডি part-এর জন্য প্লাগইন হুক ----------
     js/parts/ থেকে SIRAT.parts.push({name,init(ctx),update(frame)}) করা ফাইলগুলো এখানে চালু হয়।
     ctx-এ দৃশ্যের দরকারি সব জিনিস আছে; আলাদা করে scene.js বদলানোর দরকার নেই। */
  var ctx={THREE:THREE,scene:scene,camera:camera,renderer:renderer,small:small,Q:Q,S3:S3,
    REDUCE:REDUCE,clamp:clamp,sstep:sstep,noise:noise,heightAt:heightAt,
    secs:secs,sceneF:sceneF,secP:secP,
    secIndex:function(id){return secs.indexOf(document.getElementById(id));},
    /* অধ্যায় id-র কাছাকাছি থাকলে ১, দূরে গেলে ০ (f না দিলে এখনকার স্ক্রল ধরে) */
    chapterWeight:function(id,f){var i=secs.indexOf(document.getElementById(id));if(i<0){return 0;}return clamp(1-Math.abs((f==null?sceneF().f:f)-i),0,1);},
    glowSprite:glowSprite,mkLab:mkLab,mkDot:mkDot,dotTex:dotTex,canvasTex:canvasTex,texLoader:texLoader,
    materials:M,goldMat:goldMat,brickMat:brickMat,cliffMat:cliffMat,blkMat:blkMat,rockExtra:rockExtra,
    hemi:hemi,key:key,
    pickables:PK,                 /* [[object3D,'infoKey'],...] — ট্যাপে কার্ড খোলে; কার্ডের লেখা SIRAT.data.info[infoKey] */
    info:SIRAT.data.info,
    /* .glb/.gltf লোড: three-এর GLTFLoader স্ক্রিপ্ট আগে index.html-এ যোগ করা থাকতে হবে (README.md) */
    loadGLB:function(url,done,fail){
      if(!THREE.GLTFLoader){if(window.console){console.warn('GLTFLoader লোড হয়নি — README.md-এর "GLB মডেল" অংশ দেখুন');}if(fail){fail(new Error('no GLTFLoader'));}return;}
      new THREE.GLTFLoader().load(url,function(g){done(g.scene,g);},undefined,function(e){if(window.console){console.error('GLB লোড ব্যর্থ: '+url,e);}if(fail){fail(e);}});
    }};
  SIRAT.ctx=ctx;
  PARTS.forEach(function(p){
    try{if(p.init){p.init(ctx);}}
    catch(e){p.dead=true;if(window.console){console.error('[SIRAT part "'+p.name+'"] init ব্যর্থ, বাদ দেওয়া হলো',e);}}
  });

  requestAnimationFrame(frame);
  return true;
}
SIRAT.initScene=initScene;
})();
