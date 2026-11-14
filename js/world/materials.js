/* সারফেস ম্যাটেরিয়াল: বালি, কাঁকর, পাথর, কালো পাথর, ইট, খাড়া পাহাড়।
   scene.js এখানে makeMaterials() ডাকে; নতুন ম্যাটেরিয়াল লাগলে এখানে যোগ করে return-এ দিন। */
(function(){
'use strict';
SIRAT.makeMaterials=function(THREE,small,canvasTex){
  /* surface textures (procedural): sand ripples, rock cracks, kiswa weave, gold belt with script */
  var TS=small?128:256;
  function wrapTex(t,rx,ry){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=small?1:4;return t;}
  /* real sand textures (ambientCG Ground098, CC0), embedded so the page stays one file */
  var texLoader=new THREE.TextureLoader();
  function sandMap(src,rx,ry){var t=texLoader.load(src);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=small?2:8;return t;}
  var SAND_RX=37,SAND_RY=46;
  /* dry ground and gravel (ambientCG Ground105, CC0), blended over the sand by world position so it never visibly tiles */
  var gravTex=sandMap(SIRAT.assets.gravTex,1,1);
  var gravNorm=sandMap(SIRAT.assets.gravNorm,1,1);
  function gravelPatch(mat){
    mat.userData.gravel=true;
    mat.onBeforeCompile=function(sh){
      sh.uniforms.gMap={value:gravTex};sh.uniforms.gNorm={value:gravNorm};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.0)).xyz;');
      var fs=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;uniform sampler2D gMap;uniform sampler2D gNorm;\nfloat gH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat gN(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(gH(i),gH(i+vec2(1.0,0.0)),f.x),mix(gH(i+vec2(0.0,1.0)),gH(i+vec2(1.0,1.0)),f.x),f.y);}');
      fs=fs.replace('#include <map_fragment>','#include <map_fragment>\nfloat gm=smoothstep(0.5,0.68,gN(vWPos.xz*0.011)*0.6+gN(vWPos.xz*0.037)*0.4);\nvec2 gUv=vec2(vWPos.x,-vWPos.z)*0.06;\ndiffuseColor.rgb=mix(diffuseColor.rgb,texture2D(gMap,gUv).rgb,gm*0.92);');
      if(!small){fs=fs.replace('vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;','vec3 mapN = mix(texture2D( normalMap, vUv ).xyz, texture2D( gNorm, gUv ).xyz, gm*0.92) * 2.0 - 1.0;');}
      sh.fragmentShader=fs;
    };
  }
  var sandTex=sandMap(SIRAT.assets.sandTex,SAND_RX,SAND_RY);
  var sandNorm=sandMap(SIRAT.assets.sandNorm,SAND_RX,SAND_RY);
  var sandRough=small?null:sandMap(SIRAT.assets.sandRough,SAND_RX,SAND_RY);
  /* real rock textures (ambientCG Rock058, CC0) */
  var ROCK_R=5;
  var rockTex=sandMap(SIRAT.assets.rockTex,ROCK_R,ROCK_R);
  var rockNorm=small?null:sandMap(SIRAT.assets.rockNorm,ROCK_R,ROCK_R);
  var rockRough=small?null:sandMap(SIRAT.assets.rockRough,ROCK_R,ROCK_R);
  function rockExtra(o){if(rockNorm){o.normalMap=rockNorm;o.normalScale=new THREE.Vector2(1.2,1.2);}if(rockRough){o.roughnessMap=rockRough;}return o;}
  /* black volcanic rock (ambientCG Rock037, CC0) for the Madina harra */
  var blkTex=sandMap(SIRAT.assets.blkTex,2,2);
  var blkNorm=small?null:sandMap(SIRAT.assets.blkNorm,2,2);
  var blkRough=small?null:sandMap(SIRAT.assets.blkRough,2,2);
  function blkMat(col){var o={color:col,roughness:1,flatShading:true,map:blkTex};if(blkNorm){o.normalMap=blkNorm;o.normalScale=new THREE.Vector2(1.3,1.3);}if(blkRough){o.roughnessMap=blkRough;}return new THREE.MeshStandardMaterial(o);}
  /* clay (mud) brick wall: church_bricks_03 diffuse, normal and roughness maps, embedded so the page stays one file.
     UVs come from the object-space size of each face (instance scale included), so bricks keep one real size on houses of any width. */
  var brkTex=sandMap(SIRAT.assets.brkTex,1,1);
  var brkNorm=small?null:sandMap(SIRAT.assets.brkNorm,1,1);
  var brkRough=small?null:sandMap(SIRAT.assets.brkRough,1,1);
  function brickMat(col,cyl){
    var o={color:col,roughness:1,flatShading:true,map:brkTex};
    if(brkNorm){o.normalMap=brkNorm;o.normalScale=new THREE.Vector2(1.1,1.1);}
    if(brkRough){o.roughnessMap=brkRough;}
    var m=new THREE.MeshStandardMaterial(o);
    m.onBeforeCompile=function(sh){
      sh.uniforms.bTile={value:3.2};sh.uniforms.bCyl={value:cyl?new THREE.Vector2(cyl[0],cyl[1]):new THREE.Vector2(0,0)};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float bTile;uniform vec2 bCyl;')
        .replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_INSTANCING\nvec3 bSc=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));\n#else\nvec3 bSc=vec3(1.0);\n#endif\nvec3 bP=position*bSc;vec3 bN=abs(normal);\nvec2 bUv=bN.x>0.5?bP.zy:(bN.z>0.5?bP.xy:bP.xz);\nvUv=bCyl.x>0.0?uv*bCyl:bUv/bTile;');
    };
    return m;
  }
  /* steep cliff rock (cliff_side maps) for Hira and Thawr: triplanar, so the strata stay undistorted on the curved mountain */
  var clfTex=sandMap(SIRAT.assets.clfTex,1,1);
  var clfNorm=small?null:sandMap(SIRAT.assets.clfNorm,1,1);
  var clfRough=small?null:sandMap(SIRAT.assets.clfRough,1,1);
  function cliffMat(o,tile,sc){
    var m=new THREE.MeshStandardMaterial(o);
    m.onBeforeCompile=function(sh){
      sh.uniforms.cDiff={value:clfTex};sh.uniforms.cNorm={value:clfNorm};sh.uniforms.cRough={value:clfRough};
      sh.uniforms.cS={value:1/tile};sh.uniforms.cSc={value:new THREE.Vector3(sc[0],sc[1],sc[2])};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform vec3 cSc;varying vec3 vOP;varying vec3 vON;varying vec3 vT1;varying vec3 vT2;varying vec3 vT3;')
        .replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position*cSc;vON=normal;vT1=normalMatrix*vec3(1.0,0.0,0.0);vT2=normalMatrix*vec3(0.0,1.0,0.0);vT3=normalMatrix*vec3(0.0,0.0,1.0);');
      var hasN=!!clfNorm,hasR=!!clfRough;
      var fs=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D cDiff;uniform sampler2D cNorm;uniform sampler2D cRough;uniform float cS;varying vec3 vOP;varying vec3 vON;varying vec3 vT1;varying vec3 vT2;varying vec3 vT3;')
        .replace('#include <map_fragment>','#include <map_fragment>\nvec3 cN0=normalize(vON);vec3 cW=pow(abs(cN0),vec3(4.0));cW/=(cW.x+cW.y+cW.z);\ndiffuseColor.rgb*=texture2D(cDiff,vOP.zy*cS).rgb*cW.x+texture2D(cDiff,vOP.xz*cS).rgb*cW.y+texture2D(cDiff,vOP.xy*cS).rgb*cW.z;')
        .replace('#include <roughnessmap_fragment>',hasR?'float roughnessFactor=roughness*(texture2D(cRough,vOP.zy*cS).g*cW.x+texture2D(cRough,vOP.xz*cS).g*cW.y+texture2D(cRough,vOP.xy*cS).g*cW.z);':'#include <roughnessmap_fragment>');
      if(hasN){fs=fs.replace('#include <normal_fragment_maps>','vec3 cTx=texture2D(cNorm,vOP.zy*cS).xyz*2.0-1.0;vec3 cTy=texture2D(cNorm,vOP.xz*cS).xyz*2.0-1.0;vec3 cTz=texture2D(cNorm,vOP.xy*cS).xyz*2.0-1.0;\ncTx=vec3(cTx.xy+cN0.zy,abs(cTx.z)*cN0.x);cTy=vec3(cTy.xy+cN0.xz,abs(cTy.z)*cN0.y);cTz=vec3(cTz.xy+cN0.xy,abs(cTz.z)*cN0.z);\nvec3 cWn=normalize(cTx.zyx*cW.x+cTy.xzy*cW.y+cTz.xyz*cW.z);\nnormal=normalize(vT1*cWn.x+vT2*cWn.y+vT3*cWn.z);');}
      else{fs=fs.replace('#include <normal_fragment_maps>','normal=normalize(normalMatrix*cN0);');}
      sh.fragmentShader=fs;
    };
    return m;
  }
  var fabTex=wrapTex(canvasTex(128,function(g,s){g.fillStyle='#5a5a60';g.fillRect(0,0,s,s);var p;for(p=0;p<s;p+=4){g.fillStyle='rgba(255,255,255,0.10)';g.fillRect(p,0,2,s);g.fillStyle='rgba(0,0,0,0.25)';g.fillRect(0,p,s,2);}}),3,3);
  var bandC=document.createElement('canvas');bandC.width=1024;bandC.height=128;var bandTex=new THREE.CanvasTexture(bandC);bandTex.anisotropy=small?1:4;
  function drawBand(){var g=bandC.getContext('2d'),i3;g.fillStyle='#0b0a08';g.fillRect(0,0,1024,128);g.strokeStyle='#d8b26a';g.lineWidth=3;g.strokeRect(6,6,1012,116);g.lineWidth=1.5;g.strokeRect(14,14,996,100);
    g.fillStyle='#d8b26a';g.textAlign='center';g.textBaseline='middle';g.font='700 62px Amiri,"Noto Naskh Arabic","Traditional Arabic",serif';
    for(i3=0;i3<3;i3++){g.fillText('لا إله إلا الله',171+i3*341,68);}
    for(i3=0;i3<4;i3++){g.beginPath();g.arc(i3*341,64,0,0,6.2832);g.fill();}
    [341,683].forEach(function(cx){g.beginPath();g.arc(cx,64,11,0,6.2832);g.fill();g.fillStyle='#0b0a08';g.beginPath();g.arc(cx,64,5,0,6.2832);g.fill();g.fillStyle='#d8b26a';});
    bandTex.needsUpdate=true;}
  drawBand();if(document.fonts&&document.fonts.load){document.fonts.load('700 62px Amiri').then(drawBand).catch(function(){});}
  var bandMat=new THREE.MeshStandardMaterial({map:bandTex,roughness:0.45,metalness:0.55,emissive:0x6a4a14,emissiveMap:bandTex,emissiveIntensity:0.5});
  return {texLoader:texLoader,wrapTex:wrapTex,sandMap:sandMap,
    sandTex:sandTex,sandNorm:sandNorm,sandRough:sandRough,gravelPatch:gravelPatch,
    rockTex:rockTex,rockNorm:rockNorm,rockRough:rockRough,rockExtra:rockExtra,
    blkMat:blkMat,brickMat:brickMat,cliffMat:cliffMat,bandMat:bandMat,fabTex:fabTex};
};
})();
