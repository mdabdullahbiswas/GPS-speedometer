/* হেরা পাহাড় ও সাওর গুহার পাথরে নতুন মার্বেল-পাথরের টেক্সচার (রং + নরমাল + রাফনেস)।
   আগের cliff টেক্সচারের মতোই ট্রিপ্ল্যানার, তাই বাঁকা পাহাড়েও টেক্সচার টানে না।
   দরকার: js/assets/tex-marble.js (এই part-এর আগে লোড) এবং আপডেট করা materials.js + scene.js */
SIRAT.parts.push((function(){
  var TILE_SCALE = { hira: 1, thawr: 1 };   /* ১-এর বেশি দিলে টেক্সচারের নকশা বড় হবে, কম দিলে ছোট */
  return {
    name: 'marble-rock',
    init: function(C){
      var THREE = C.THREE, A = SIRAT.assets && SIRAT.assets.marbleRock;
      if(!C.rockSites){ if(window.console){ console.warn('[marble-rock] scene.js-এ ctx.rockSites নেই — আপডেট করা scene.js লাগবে'); } return; }
      if(!A){ if(window.console){ console.warn('[marble-rock] js/assets/tex-marble.js লোড হয়নি'); } return; }
      function tex(src){ var t = C.texLoader.load(src); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = C.small ? 2 : 8; return t; }
      /* দুর্বল ডিভাইসে নরমাল/রাফনেস বাদ — scene.js-এর অন্য পাথরের মতোই */
      var T = { d: tex(A.diff), n: C.small ? null : tex(A.nor), r: C.small ? null : tex(A.rough) };
      Object.keys(C.rockSites).forEach(function(key){
        var site = C.rockSites[key], old = site.mesh.material;
        site.mesh.material = C.cliffMat(site.opts, site.tile * (TILE_SCALE[key] || 1), site.sc, T);
        old.dispose();
      });
    }
  };
})());
