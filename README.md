# নবীজির সীরাত — প্রকল্পের কাঠামো

আগের একটি ৩.৮ MB `nobijir-sirat.html` এখন ছোট ছোট ফাইলে ভাগ করা। ব্রাউজারে ডাবল-ক্লিক করে `index.html` খুললেই চলে (কোনো বিল্ড/npm দরকার নেই)।

```
index.html              পেজের লেখা (HTML) ও কোন ফাইল কোন ক্রমে লোড হবে তার তালিকা
css/                    01-base … 06-effects (ক্রম গুরুত্বপূর্ণ), 07-a11y
js/
  namespace.js          সবার আগে: window.SIRAT তৈরি (assets, data, parts)
  data/                 শুধু লেখা/কনফিগ: battles, map-places, audio-mix, info-cards
  assets/               ভারী বেস৬৪ ডেটা: tex-*.js (টেক্সচার), model-kaaba.js, model-palm.js
  core.js               স্ক্রল → অধ্যায় বদল, প্রগ্রেস বার, ডট-নেভ
  ui/                   battle-tabs, map (২ডি), reveal, timeline, controls (৩ডি বোতাম ও কার্ড)
  audio.js              পরিবেশের সুর
  world/                terrain.js, materials.js, keyframes.js, scene.js (৩ডি জগৎ ও frame লুপ)
  parts/                ← নতুন ৩ডি ফাইল এখানে (নিচে দেখুন)
  boot.js               ৩ডি চালু করে (parts-এর পরে লোড হয়)
models/                 .glb/.gltf ফাইল রাখার জায়গা
```

## নতুন ৩ডি ফাইল যোগ করার ধাপ

1. `js/parts/_template.js` কপি করে নাম দিন, যেমন `js/parts/uhud-hill.js`।
2. `init(C)`-এ বস্তু বানিয়ে `C.scene.add(...)` করুন। `update(F)`-এ অ্যানিমেশন ও দৃশ্যমানতা।
3. `index.html`-এ `boot.js`-এর ঠিক আগের মন্তব্য-করা জায়গায় লাইনটি যোগ করুন:
   `<script src="js/parts/uhud-hill.js"></script>`

`scene.js` ছুঁতে হয় না। কোনো part ভুল করলে শুধু সেটি বন্ধ হয়, কনসোলে নাম সহ বার্তা আসে। কাজের উদাহরণ: `js/parts/example-pillar.js`।

### `C` (init-এ পাওয়া জিনিস)
| নাম | কাজ |
|---|---|
| `THREE, scene, camera, renderer` | মূল three.js বস্তু |
| `heightAt(x,z)`, `noise(x,y)` | ভূখণ্ডের উচ্চতা; বস্তু মাটিতে বসাতে |
| `chapterWeight(id, F.f)` | সেকশন `id`-র কাছে গেলে ১, দূরে ০ — দৃশ্যমানতার জন্য |
| `secIndex(id)`, `sceneF()`, `secP(n)` | অধ্যায়ের ক্রম ও স্ক্রল-অগ্রগতি |
| `glowSprite, mkLab, mkDot, dotTex, canvasTex, texLoader` | আলো/লেখা-লেবেল/টেক্সচার সহায়ক |
| `materials, goldMat, brickMat, cliffMat, blkMat, rockExtra` | তৈরি ম্যাটেরিয়াল |
| `pickables` | `[[object3D,'কী'],…]` যোগ করলে ট্যাপে কার্ড খোলে |
| `info` | কার্ডের লেখা: `C.info.কী = [শিরোনাম, HTML, সূত্র]` |
| `small, Q, REDUCE, S3` | হালকা/মোবাইল মোড, ব্যবহারকারীর সেটিং |
| `loadGLB(url, cb)` | `.glb` লোড (নিচে) |

`update(F)`-এ: `F.t` সেকেন্ড, `F.dt` ফ্রেমের ব্যবধান, `F.f` অধ্যায়-অবস্থান (যেমন `7.4` = ৮ম অধ্যায়ের ৪০% পথ), `F.camera`।

### নতুন অধ্যায়ের জন্য আকাশ/ক্যামেরা
`index.html`-এ নতুন `<section data-scene …>` যোগ করলে `js/world/keyframes.js`-এর `K` (আকাশ/আলো) ও `P` (ক্যামেরা) অ্যারেতে **একই ক্রমে** একটি করে সারি যোগ করতে হবে। `js/data/audio-mix.js`-এ সেকশনের `id` ধরে সুরের মিশ্রণও দেওয়া যায়।

### .glb মডেল
- `models/` ফোল্ডারে ফাইল রাখুন, `index.html`-এ `GLTFLoader.js`-এর মন্তব্য-করা লাইনটি চালু করুন, তারপর part-এ `C.loadGLB('models/x.glb', function(obj){ C.scene.add(obj); })`।
- `.glb` লোড `file://` থেকে কাজ করে না (ব্রাউজারের নিয়ম)। স্থানীয়ভাবে `python3 -m http.server` চালান, অথবা Vercel-এ হোস্ট করুন।
- ইন্টারনেট ছাড়াও চালাতে চাইলে মডেলটি বেস৬৪ করে `js/assets/` ফাইলে রাখুন (কাবার মডেল যেভাবে আছে)।

## সীমা
`js/world/scene.js` এখনো একটি বড় ফাইল (~৭০০ লাইন): আকাশ, কাবা, হেরা, মদিনা, যুদ্ধক্ষেত্র, আরাফাত ইত্যাদির বিদ্যমান দৃশ্য একই closure-এর ভেতর পরস্পর জড়িত। ভারী ডেটা, ম্যাটেরিয়াল, কীফ্রেম ও ভূখণ্ড বের করা হয়েছে এবং নতুন সবকিছু `parts/`-এ যায়। ভবিষ্যতে একেকটি পুরনো দৃশ্য (যেমন আরাফাত) চাইলে ধীরে ধীরে `parts/`-এ সরানো যাবে।
