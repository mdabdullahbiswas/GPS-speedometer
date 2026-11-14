/* বদরের কূপ (৩টি) ও জমজমের কূপে পাথর-গাঁথা দেয়াল: রং + নরমাল + রাফনেস টেক্সচারসহ।
   বদরের কূপে কাঠের কপিকল-খুঁটি, দড়ি ও বালতিও আছে। scene.js-এর সাধারণ চোঙ-কূপ লুকিয়ে যায়।
   দরকার: js/assets/tex-wellstone.js (এই part-এর আগে লোড) */
SIRAT.parts.push((function(){
  /* rO/rI = বাইরের/ভেতরের ব্যাসার্ধ, h = দেয়ালের উচ্চতা, water = নতুন পানির তল দরকার কিনা (জমজমে আগের তলটাই থাকে) */
  var SPEC = {
    badr:   { rO: 2.2, rI: 1.7,  h: 1.0, water: 0.45, beam: true  },
    zamzam: { rO: 2.7, rI: 2.15, h: 1.1, water: 0,    beam: false }
  };
  var TILE = 6;   /* টেক্সচারের একটি পূর্ণ ছবি কত একক জায়গা ঢাকে — পাথর বড়/ছোট করতে বদলান */

  function scaleUV(g, su, sv){ var uv = g.attributes.uv, i; for(i = 0; i < uv.count; i++){ uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); } uv.needsUpdate = true; }

  return {
    name: 'stone-wells',
    init: function(C){
      var THREE = C.THREE, A = SIRAT.assets && SIRAT.assets.wellStone;
      if(!C.wellSites){ if(window.console){ console.warn('[stone-wells] scene.js-এ ctx.wellSites নেই — আপডেট করা scene.js লাগবে'); } return; }
      if(!A){ if(window.console){ console.warn('[stone-wells] js/assets/tex-wellstone.js লোড হয়নি'); } return; }
      var aniso = C.small ? 2 : 8;
      function tex(src){ var t = C.texLoader.load(src); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; return t; }
      var map = tex(A.diff), nor = tex(A.nor), rgh = tex(A.rough);
      function stone(side, col){ return new THREE.MeshStandardMaterial({ map: map, normalMap: nor, roughnessMap: rgh, roughness: 1, metalness: 0, color: col, side: side }); }
      var outerM = stone(THREE.FrontSide, 0xd2c8bc), innerM = stone(THREE.BackSide, 0x7a726a), topM = stone(THREE.DoubleSide, 0xe0d6ca);
      var woodM = new THREE.MeshStandardMaterial({ color: 0x4a3626, roughness: 1, flatShading: true });
      var ropeM = new THREE.MeshStandardMaterial({ color: 0x8a7455, roughness: 1 });
      var waterM = new THREE.MeshBasicMaterial({ color: 0x12363f });
      var SEG = C.small ? 28 : 44;

      function makeWell(sp, wood){
        var g = new THREE.Group(), cO = Math.max(1, Math.round(2 * Math.PI * sp.rO / TILE)), cI = Math.max(1, Math.round(2 * Math.PI * sp.rI / TILE)), v = sp.h / TILE;
        var og = new THREE.CylinderGeometry(sp.rO, sp.rO * 1.04, sp.h, SEG, 1, true); scaleUV(og, cO, v);
        var om = new THREE.Mesh(og, outerM); om.position.y = sp.h / 2; g.add(om);
        var ig = new THREE.CylinderGeometry(sp.rI, sp.rI, sp.h, SEG, 1, true); scaleUV(ig, cI, v);
        var im = new THREE.Mesh(ig, innerM); im.position.y = sp.h / 2; g.add(im);
        var tg = new THREE.RingGeometry(sp.rI - 0.01, sp.rO + 0.01, SEG, 1); tg.rotateX(-Math.PI / 2); scaleUV(tg, 2 * sp.rO / TILE, 2 * sp.rO / TILE);
        var tm = new THREE.Mesh(tg, topM); tm.position.y = sp.h + 0.01; g.add(tm);
        if(sp.water){ var wm = new THREE.Mesh(new THREE.CircleGeometry(sp.rI - 0.04, SEG), waterM); wm.rotation.x = -Math.PI / 2; wm.position.y = sp.water; g.add(wm); }
        if(sp.beam){   /* কাঠের দুই খুঁটি, আড়কাঠ, দড়ি ও বালতি */
          var px = sp.rO + 0.25, ph = 1.9, pst, beam, rope, bucket;
          [-px, px].forEach(function(x){ pst = new THREE.Mesh(new THREE.BoxGeometry(0.2, ph, 0.2), woodM); pst.position.set(x, ph / 2, 0); g.add(pst); });
          beam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2 * px + 0.5, 8), woodM); beam.rotation.z = Math.PI / 2; beam.position.y = ph; g.add(beam);
          rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 5), ropeM); rope.position.y = ph - 0.4; g.add(rope);
          bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.34, 10), woodM); bucket.position.y = ph - 0.97; g.add(bucket);
        }
        return g;
      }

      Object.keys(SPEC).forEach(function(key){
        var site = C.wellSites[key], sp = SPEC[key];
        if(!site){ return; }
        site.old.forEach(function(o){
          var w = makeWell(sp, sp.beam);
          w.position.set(o.position.x, key === 'zamzam' ? 0 : o.position.y - 0.3, o.position.z);   /* বদরে পুরনো চোঙের তলা = মাটি */
          w.rotation.y = (o.position.x * 1.7 + o.position.z) % 3.14;                                 /* প্রতিটি কূপের কাঠামো আলাদা দিকে */
          site.group.add(w);
          o.visible = false;
        });
      });
    }
  };
})());
