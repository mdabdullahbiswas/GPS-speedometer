/* হুদাইবিয়া ও আরাফাতে আসল ৩ডি তাঁবু: scene.js-এর কোণ-আকৃতির সাময়িক তাঁবুগুলোর জায়গায় বসে।
   মডেল লোড না হলে পুরনো কোণ-তাঁবুই থাকে।
   দরকার: ১) GLTFLoader (index.html-এ)  ২) js/assets/model-tent.js (এই part-এর আগে লোড)
   মডেল: “Tent_Tribal_Guard_17_MB”, Mehdi Shahsavan (Sketchfab), CC-BY-4.0 */
SIRAT.parts.push((function(){
  var FRONT = 0;   /* তাঁবুর মুখ উল্টো দিকে লাগলে এখানে ৩.১৪ বা ১.৫৭ দিন (রেডিয়ান) */

  function b64buf(s){var r=atob(s),n=r.length,u=new Uint8Array(n),i;for(i=0;i<n;i++){u[i]=r.charCodeAt(i);}return u.buffer;}

  return {
    name: 'tent-camp',
    init: function(C){
      var THREE = C.THREE;
      if(!C.tentSites){ if(window.console){ console.warn('[tent-camp] scene.js-এ ctx.tentSites নেই — আপডেট করা scene.js লাগবে'); } return; }
      if(!THREE.GLTFLoader){ if(window.console){ console.warn('[tent-camp] GLTFLoader লোড হয়নি; পুরনো তাঁবুই থাকছে'); } return; }
      if(!SIRAT.assets || !SIRAT.assets.TENT){ if(window.console){ console.warn('[tent-camp] js/assets/model-tent.js লোড হয়নি'); } return; }
      new THREE.GLTFLoader().parse(b64buf(SIRAT.assets.TENT.glb), '', function(gltf){
        try{
          var model = gltf.scene, box, ctr, pivot = new THREE.Group();
          model.updateMatrixWorld(true);
          box = new THREE.Box3().setFromObject(model); ctr = box.getCenter(new THREE.Vector3());
          model.position.set(-ctr.x, -box.min.y, -ctr.z);   /* মাঝখানে বসানো, তলা মাটিতে */
          pivot.add(model);
          var k = 0;
          C.tentSites.forEach(function(site){
            site.cones.forEach(function(cone){
              var h = (cone.geometry.parameters ? cone.geometry.parameters.height : 0) * cone.scale.y;
              var tt = pivot.clone(true);
              tt.scale.setScalar(site.scale);
              tt.position.set(cone.position.x, cone.position.y - h / 2, cone.position.z);
              tt.rotation.y = cone.rotation.y + FRONT + (k++ % 3) * 0.9;   /* প্রতিটি তাঁবু আলাদা দিকে */
              site.group.add(tt);
              cone.visible = false;                      /* পুরনো কোণ-তাঁবু লুকানো */
            });
          });
        }catch(e){ if(window.console){ console.error('[tent-camp] তাঁবু বসাতে ব্যর্থ', e); } }
      }, function(e){ if(window.console){ console.error('[tent-camp] GLB পড়তে ব্যর্থ', e); } });
    }
  };
})());
