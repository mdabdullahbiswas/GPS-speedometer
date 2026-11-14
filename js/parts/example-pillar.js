/* উদাহরণ part: মদিনা অধ্যায়ের কাছে একটি ঘূর্ণায়মান সোনালি স্তম্ভ, ট্যাপ করলে তথ্য-কার্ড খোলে।
   চালু করতে index.html-এ এই লাইনের কমেন্ট সরান:  <script src="js/parts/example-pillar.js"></script> */
SIRAT.parts.push((function(){
  var C, mesh;
  return {
    name: 'example-pillar',
    init: function(ctx){
      C = ctx;
      var THREE = C.THREE, x = 40, z = -300;
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8, 24), C.goldMat);
      mesh.position.set(x, C.heightAt(x, z) + 4, z);   // ভূখণ্ডের উপরে বসানো
      mesh.visible = false;
      C.scene.add(mesh);
      // ট্যাপযোগ্য করা: কার্ডের লেখা [শিরোনাম, HTML, সূত্র]
      C.info.examplePillar = ['উদাহরণ স্তম্ভ', '<p>এটি একটি পরীক্ষামূলক ৩ডি বস্তু।</p>', 'উদাহরণ'];
      C.pickables.push([mesh, 'examplePillar']);
    },
    update: function(F){
      mesh.visible = C.chapterWeight('madina', F.f) > 0.01;
      if(mesh.visible && !C.REDUCE){ mesh.rotation.y = F.t * 0.6; }
    }
  };
})());
