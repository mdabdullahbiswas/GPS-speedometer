/* কাফেলার আসল ৩ডি উট: শামের পথ ও ইয়েমেনের পথে হাঁটা-অ্যানিমেশনসহ উট চলে।
   আগের কাগজের মতো সমতল উট-ছবি (sprite) বন্ধ হয়ে যায়; মডেল লোড না হলে পুরনো ছবিই থাকে।
   দরকার: ১) three-এর GLTFLoader (index.html-এ)  ২) js/assets/model-camel.js (এই part-এর আগে লোড)
   মডেল: “Camel”, eb78 (Sketchfab), CC-BY-4.0 */
SIRAT.parts.push((function(){
  var C, THREE, host, routes = [], ready = false;
  var WALK = 'Armature|WalkCycle';
  var STRIDE = 3.0;       /* এক ধাপ-চক্রে উট মডেলের কত একক এগোয় (পা পিছলানো ঠিক করতে এটি বদলানো যায়) */
  var MODEL_LEN = 2.2;    /* মডেলের মাথা থেকে লেজ পর্যন্ত দৈর্ঘ্য (মডেল-একক) */
  var TINT = [0xffe6c2, 0xcdf2e3];   /* শামের পথ: উষ্ণ বালি-রং, ইয়েমেনের পথ: সামান্য সবুজাভ */

  function b64buf(s){var r=atob(s),n=r.length,u=new Uint8Array(n),i;for(i=0;i<n;i++){u[i]=r.charCodeAt(i);}return u.buffer;}

  /* স্কিনড মডেলের আলাদা কপি (three-এর SkeletonUtils.clone-এর সমতুল্য, আলাদা লাইব্রেরি লাগে না) */
  function cloneSkinned(src){
    var clone = src.clone(true), s2c = new Map();
    (function walk(a, b){ s2c.set(a, b); for(var i = 0; i < a.children.length; i++){ walk(a.children[i], b.children[i]); } })(src, clone);
    var pairs = [];
    src.traverse(function(n){ if(n.isSkinnedMesh){ pairs.push(n); } });
    pairs.forEach(function(sm){
      var cm = s2c.get(sm), sk = sm.skeleton;
      var bones = sk.bones.map(function(b){ return s2c.get(b); });
      cm.skeleton = new THREE.Skeleton(bones, sk.boneInverses);
      cm.bind(cm.skeleton, sm.bindMatrix);
    });
    return clone;
  }

  function build(gltf){
    var model = gltf.scene, clip = null, i, r, q;
    for(i = 0; i < gltf.animations.length; i++){ if(gltf.animations[i].name === WALK){ clip = gltf.animations[i]; } }
    if(!clip){ clip = gltf.animations[gltf.animations.length - 1]; }
    var baseMats = [];
    model.traverse(function(n){
      if(n.isMesh){ n.frustumCulled = false; if(baseMats.indexOf(n.material) < 0){ baseMats.push(n.material); } }
    });
    var count = C.Q && C.Q.lite ? 3 : 5;
    C.caravan.routes.forEach(function(R, ri){
      var len = R.cv.getLength(), spacing = 0.03 * len;
      var target = Math.max(2, Math.min(7, spacing * 0.7)), sc = target / MODEL_LEN;
      /* এই পথের জন্য নিজস্ব রঙের মাত্রা (ম্যাটেরিয়াল কপি) */
      var mats = baseMats.map(function(m){
        var c = m.clone();
        c.fog = false;                              /* মানচিত্রের বাকি বস্তুর মতো কুয়াশামুক্ত */
        if(c.map){ c.emissiveMap = c.map; c.emissive = new THREE.Color(0xffffff); c.emissiveIntensity = 0.35; }
        c.userData.base = c.color.clone().multiply(new THREE.Color(TINT[ri % TINT.length]));
        return c;
      });
      var rt = { R: R, mats: mats, items: [], sc: sc, len: len };
      for(q = 0; q < count; q++){
        var m3 = cloneSkinned(model), holder = new THREE.Group();
        m3.traverse(function(n){ if(n.isMesh){ var bi = baseMats.indexOf(n.material); if(bi >= 0){ n.material = mats[bi]; } } });
        holder.add(m3); holder.scale.setScalar(sc); holder.frustumCulled = false;
        var mixer = new THREE.AnimationMixer(m3), act = mixer.clipAction(clip);
        act.play(); mixer.setTime(q * 0.37);
        host.add(holder);
        rt.items.push({ g: holder, mixer: mixer, act: act, clip: clip, q: q, yaw: 0 });
      }
      /* আগের সমতল উট-ছবি লুকানো */
      (R.camels || []).forEach(function(sp){ sp.visible = false; });
      routes.push(rt);
    });
    ready = true;
  }

  return {
    name: 'camel-caravan',
    init: function(ctx){
      C = ctx; THREE = C.THREE;
      if(!C.caravan){ if(window.console){ console.warn('[camel-caravan] scene.js-এ ctx.caravan নেই — আপডেট করা scene.js লাগবে'); } return; }
      if(!THREE.GLTFLoader){ if(window.console){ console.warn('[camel-caravan] GLTFLoader লোড হয়নি — index.html-এ যোগ করুন; আপাতত পুরনো উট-ছবি থাকছে'); } return; }
      if(!SIRAT.assets || !SIRAT.assets.CAMEL){ if(window.console){ console.warn('[camel-caravan] js/assets/model-camel.js লোড হয়নি'); } return; }
      host = new THREE.Group();
      C.caravan.group.add(host);
      new THREE.GLTFLoader().parse(b64buf(SIRAT.assets.CAMEL.glb), '', function(gltf){
        try{ build(gltf); }catch(e){ if(window.console){ console.error('[camel-caravan] মডেল সাজাতে ব্যর্থ', e); } }
      }, function(e){ if(window.console){ console.error('[camel-caravan] GLB পড়তে ব্যর্থ', e); } });
    },
    update: function(F){
      if(!ready || !C.caravan.arab.visible){ return; }
      var t = F.t, dt = F.dt, REDUCE = C.REDUCE;
      routes.forEach(function(rt){
        var R = rt.R, dim = 0.55 + 0.45 * R.a;       /* যে পথ সক্রিয় সেটি উজ্জ্বল */
        rt.mats.forEach(function(m){ m.color.copy(m.userData.base).multiplyScalar(dim); if(m.emissive){ m.emissiveIntensity = 0.2 + 0.3 * R.a; } });
        var speed = REDUCE ? 0 : 0.012 * rt.len;     /* scene.js-এর সমতল উটের গতির সমান */
        var ts = speed > 0 ? Math.max(0.4, Math.min(2, speed / (STRIDE * rt.sc))) : 0;
        rt.items.forEach(function(it){
          var u = ((REDUCE ? 0.1 : t * 0.012) + it.q * 0.03) % 1, p = R.cv.getPoint(u), tg = R.cv.getTangent(u);
          it.g.position.set(p.x, p.y + 0.5, p.z);
          /* মডেলের মুখ −Z দিকে; চলার দিকে ঘোরানো (ধীরে, কাঁপুনি এড়াতে) */
          var want = Math.atan2(-tg.x, -tg.z), d = want - it.yaw;
          d = Math.atan2(Math.sin(d), Math.cos(d));
          it.yaw += REDUCE ? d : d * Math.min(1, dt * 6);
          it.g.rotation.y = it.yaw;
          if(ts > 0){ it.mixer.update(dt * ts); }
        });
      });
    }
  };
})());
