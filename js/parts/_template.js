/* ===== নতুন ৩ডি part-এর ফাঁকা কাঠামো =====
   ব্যবহার: কপি করে নাম বদলান (যেমন js/parts/uhud-hill.js), তারপর index.html-এ
   boot.js-এর আগে <script src="js/parts/uhud-hill.js"></script> যোগ করুন।

   init(C)    — একবার চলে, দৃশ্য তৈরি হওয়ার পর। এখানে বস্তু বানিয়ে C.scene.add(...) করুন।
   update(F)  — প্রতি ফ্রেমে চলে। F.t = সেকেন্ড, F.dt = ফ্রেমের ব্যবধান, F.f = অধ্যায়-অবস্থান (দশমিকসহ)।
   কোনো part ভুল করলে শুধু সেটিই বন্ধ হয়, বাকি দৃশ্য চলতে থাকে (কনসোলে বার্তা আসে)। */
SIRAT.parts.push((function(){
  var C, root;
  return {
    name: 'my-part',                     // কনসোলের বার্তায় এই নাম দেখা যাবে
    init: function(ctx){
      C = ctx;
      var THREE = C.THREE;
      root = new THREE.Group();
      root.visible = false;              // অধ্যায়ের কাছে গেলে update() দেখাবে
      C.scene.add(root);
      // ... এখানে mesh/বস্তু বানিয়ে root.add(...) করুন
    },
    update: function(F){
      var w = C.chapterWeight('madina', F.f);   // 'madina' = সেকশনের id; কাছে গেলে ১, দূরে ০
      root.visible = w > 0.01;
      if(!root.visible){ return; }
      // ... এখানে অ্যানিমেশন
    }
  };
})());
