/* হুদাইবিয়ার বাইআতের গাছ: ছাল-টেক্সচারের শাখা-প্রশাখা ও পাতার অ্যাটলাস থেকে বানানো গাছ।
   scene.js-এর সিলিন্ডার+গোলকের সাময়িক গাছ লুকিয়ে যায়।
   দরকার: js/assets/tex-baiat-tree.js (এই part-এর আগে লোড) এবং আপডেট করা scene.js
   টেক্সচার: “Island Tree 01” (ছাল ও পাতা) */
SIRAT.parts.push((function(){
  var HEIGHT_SCALE = 1;    /* পুরো গাছ বড়/ছোট করতে (পুরনো গাছ ছিল ~১৪ একক উঁচু; লেবেল ১৭ উচ্চতায়) */
  var LEAF_SIZE = 1.4;     /* পাতার উচ্চতা (একক) */
  var BARK_TILE = 4;       /* ছালের টেক্সচারের একটি ছবি কত একক ঢাকে */
  var root, site, THREE;

  function rng(seed){ var a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  return {
    name: 'baiat-tree',
    init: function(C){
      THREE = C.THREE;
      var A = SIRAT.assets && SIRAT.assets.baiatTree;
      site = C.treeSites && C.treeSites.hudaybiyyah;
      if(!site){ if(window.console){ console.warn('[baiat-tree] scene.js-এ ctx.treeSites নেই — আপডেট করা scene.js লাগবে'); } return; }
      if(!A){ if(window.console){ console.warn('[baiat-tree] js/assets/tex-baiat-tree.js লোড হয়নি'); } return; }
      var R = rng(20260), small = !!C.small;
      function tex(src, repeat){ var t = C.texLoader.load(src); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = small ? 2 : 8; return t; }

      var barkM = new THREE.MeshStandardMaterial({ map: tex(A.barkDiff), color: 0xd6cdc2, roughness: 1, metalness: 0 });
      if(!small){ barkM.normalMap = tex(A.barkNor); barkM.roughnessMap = tex(A.barkRough); }
      var lt = C.texLoader.load(A.leaf); lt.anisotropy = small ? 2 : 4;
      var leafM = new THREE.MeshStandardMaterial({ map: lt, color: 0xe6e8c4, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75, metalness: 0 });
      if(!small){ leafM.normalMap = C.texLoader.load(A.leafNor); }

      /* ---- ছালের শাখা: ক্রমশ সরু হওয়া নল (সব এক জিওমেট্রিতে) ---- */
      var bp = [], bu = [], bi = [], radial = small ? 6 : 8;
      function addTube(curve, r0, r1, flare){
        var tub = Math.max(6, Math.round(curve.getLength() * 1.4)), base = bp.length / 3, len = curve.getLength(), i, j;
        var Tn = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), ref = new THREE.Vector3(), p;
        var uRep = Math.max(1, Math.round(2 * Math.PI * Math.max(r0, r1) / BARK_TILE));
        for(i = 0; i <= tub; i++){
          var t = i / tub; p = curve.getPoint(t); Tn.copy(curve.getTangent(t));
          if(i === 0){ ref.set(Math.abs(Tn.y) > 0.9 ? 1 : 0, Math.abs(Tn.y) > 0.9 ? 0 : 1, 0); N.crossVectors(Tn, ref).normalize(); }
          else{ N.sub(Tn.clone().multiplyScalar(N.dot(Tn))).normalize(); }          /* সমান্তরাল ফ্রেম: মোচড় এড়ায় */
          B.crossVectors(Tn, N).normalize();
          var r = r0 + (r1 - r0) * t + (flare || 0) * Math.exp(-t * 9);
          for(j = 0; j <= radial; j++){
            var a = j / radial * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
            bp.push(p.x + (N.x * c + B.x * s) * r, p.y + (N.y * c + B.y * s) * r, p.z + (N.z * c + B.z * s) * r);
            bu.push(j / radial * uRep, t * len / BARK_TILE);
          }
        }
        for(i = 0; i < tub; i++){ for(j = 0; j < radial; j++){
          var a0 = base + i * (radial + 1) + j, b0 = a0 + radial + 1;
          bi.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1);
        } }
      }

      var V = function(x, y, z){ return new THREE.Vector3(x, y, z); };
      var trunk = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0.25, 2.2, 0.15), V(-0.15, 4.4, 0.25), V(0.25, 6.4, 0.0)]);
      addTube(trunk, 1.0, 0.5, 0.9);
      var curves = [];   /* পাতা বসানোর জন্য শাখা ও ডাল */
      var NB = 6, k, m;
      for(k = 0; k < NB; k++){
        var ang = k / NB * Math.PI * 2 + R() * 0.6, ox = Math.cos(ang), oz = Math.sin(ang), h0 = 3.4 + R() * 3.0;
        var sp = trunk.getPoint(Math.min(1, h0 / 6.4)), reach = 4.6 + R() * 2.2, rise = 2.2 + R() * 2.2;
        var br = new THREE.CatmullRomCurve3([sp.clone(), sp.clone().add(V(ox * reach * 0.35, rise * 0.45, oz * reach * 0.35)), sp.clone().add(V(ox * reach * 0.7, rise * 0.85, oz * reach * 0.7)), sp.clone().add(V(ox * reach, rise + 0.3 - R() * 0.6, oz * reach))]);
        addTube(br, 0.34, 0.1, 0); curves.push(br);
        for(m = 0; m < 2; m++){   /* প্রতি শাখায় দুটি ডাল */
          var q = br.getPoint(0.45 + m * 0.25), da = ang + (m ? 1 : -1) * (0.7 + R() * 0.5), dx = Math.cos(da), dz = Math.sin(da), dl = 2.4 + R() * 1.6;
          var tw = new THREE.CatmullRomCurve3([q.clone(), q.clone().add(V(dx * dl * 0.5, 0.9 + R() * 0.6, dz * dl * 0.5)), q.clone().add(V(dx * dl, 1.4 + R() * 1.0, dz * dl))]);
          addTube(tw, 0.14, 0.05, 0); curves.push(tw);
        }
      }
      var bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
      bg.setAttribute('uv', new THREE.Float32BufferAttribute(bu, 2));
      bg.setIndex(bi); bg.computeVertexNormals();
      var bark = new THREE.Mesh(bg, barkM);

      /* ---- পাতা: অ্যাটলাসের ৮টি পাতার যেকোনোটি, এলোমেলো দিকে বসানো কার্ড ---- */
      var lp = [], ln = [], lu = [], li = [], NL = small ? 380 : 950, rects = A.rects, dummy = new THREE.Object3D(), up = V(0, 1, 0), center = V(0, 6, 0);
      var v = new THREE.Vector3(), nrm = new THREE.Vector3(), out = new THREE.Vector3(), d = new THREE.Vector3(), l, c4, vi;
      for(l = 0; l < NL; l++){
        var cv = curves[(R() * curves.length) | 0], t2 = 0.4 + R() * 0.6, pp = cv.getPoint(t2);
        pp.add(V((R() - 0.5) * 1.5, (R() - 0.2) * 1.2, (R() - 0.5) * 1.5));
        out.copy(pp).sub(center); out.y *= 0.4; out.normalize();
        d.set(R() - 0.5, R() - 0.4, R() - 0.5).multiplyScalar(1.1).add(out).normalize();
        var rc = rects[(R() * rects.length) | 0], ru0 = rc[0], rv0 = 1 - rc[3], ru1 = rc[2], rv1 = 1 - rc[1];
        var lh = LEAF_SIZE * (0.8 + R() * 0.45), lw = lh * (rc[2] - rc[0]) / (rc[3] - rc[1]);
        dummy.position.copy(pp); dummy.quaternion.setFromUnitVectors(up, d); dummy.rotateY(R() * Math.PI * 2); dummy.updateMatrix();
        nrm.set(0, 0, 1).applyQuaternion(dummy.quaternion).multiplyScalar(0.4).add(out.clone().multiplyScalar(0.6)).normalize();
        var cs = [[-lw / 2, 0, ru0, rv0], [lw / 2, 0, ru1, rv0], [lw / 2, lh, ru1, rv1], [-lw / 2, lh, ru0, rv1]];
        vi = lp.length / 3;
        for(c4 = 0; c4 < 4; c4++){ v.set(cs[c4][0], cs[c4][1], 0).applyMatrix4(dummy.matrix); lp.push(v.x, v.y, v.z); ln.push(nrm.x, nrm.y, nrm.z); lu.push(cs[c4][2], cs[c4][3]); }
        li.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
      }
      var lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
      lg.setAttribute('normal', new THREE.Float32BufferAttribute(ln, 3));
      lg.setAttribute('uv', new THREE.Float32BufferAttribute(lu, 2));
      lg.setIndex(li);
      var leaves = new THREE.Mesh(lg, leafM);
      bark.frustumCulled = false; leaves.frustumCulled = false;

      root = new THREE.Group();
      root.add(bark); root.add(leaves);
      root.scale.setScalar((site.scale || 1) * HEIGHT_SCALE);
      root.position.set(site.x || 0, 0, site.z || 0);
      site.group.add(root);
      site.old.forEach(function(o){ o.visible = false; });
      root.userData.C = C;
    },
    update: function(F){
      if(!root || !site.group.visible || root.userData.C.REDUCE){ return; }
      root.rotation.z = Math.sin(F.t * 0.55) * 0.007;   /* হালকা বাতাসে দোলা */
      root.rotation.x = Math.sin(F.t * 0.43 + 1.3) * 0.005;
    }
  };
})());
