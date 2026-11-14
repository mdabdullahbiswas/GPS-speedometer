/* স্ক্রল-কীফ্রেম: K = প্রতি অধ্যায়ের আকাশ/আলো, TOD = আকাশের সময়-বোতাম, P = প্রতি অধ্যায়ের ক্যামেরা {p: অবস্থান, l: লক্ষ্য}। অধ্যায়ের ক্রম index.html-এর data-scene সেকশনের ক্রমের সমান। */
window.SIRAT=window.SIRAT||{};
SIRAT.keyframes=(function(){
  function mk(o){var d={zen:0,hor:0,fog:0.004,stars:1,moon:1,sun:0,sunY:0.02,amb:0.4,key:0.9,keyCol:0x86a0e0,beam:0,mad:0,side:0};for(var k in o){d[k]=o[k];}return d;}
  var K=[
    mk({zen:0x03050d,hor:0x111b36,side:-1}),
    mk({zen:0x03050d,hor:0x14223f,side:-1}),
    mk({zen:0x010208,hor:0x0b132a,fog:0.0046,stars:1.35,moon:0.7,side:1}),
    mk({zen:0x070b1c,hor:0x232c52,fog:0.004,side:-1}),
    mk({zen:0x1a1c40,hor:0xb26f45,fog:0.0034,stars:0.35,moon:0.35,sun:0.5,sunY:0.03,amb:0.5,key:1.0,keyCol:0xffb978,side:1}),
    mk({zen:0x02030a,hor:0x0b1530,fog:0.0044,stars:1.25,moon:0.8,beam:1,side:-1}),
    mk({zen:0x010208,hor:0x0a1226,fog:0.0042,stars:1.6,moon:0.5,side:1}),
    mk({zen:0x08122a,hor:0x215062,fog:0.004,stars:0.9,moon:0.5,beam:0.15,mad:0.1,keyCol:0x9ab8e0,side:1}),
    mk({zen:0x2b3b6e,hor:0xeaa56a,fog:0.0032,stars:0.18,moon:0,sun:1,sunY:0.08,amb:0.62,key:1.15,keyCol:0xffc58a,mad:0.8,side:-1}),
    mk({zen:0x3e6aa6,hor:0xe9c895,fog:0.0036,stars:0,moon:0,sun:1,sunY:0.3,amb:0.72,key:1.2,keyCol:0xffdca8,mad:0.3,side:1}),
    mk({zen:0x3a68a8,hor:0xf2cf9a,fog:0.0034,stars:0,moon:0,sun:1,sunY:0.18,amb:0.7,key:1.2,keyCol:0xffd9a0,mad:0.1,side:-1}),
    mk({zen:0x4a7fc0,hor:0xf0d8a8,fog:0.0034,stars:0,moon:0,sun:1,sunY:0.36,amb:0.72,key:1.25,keyCol:0xffdca0,mad:0.15,side:1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.25,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:-1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.25,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:-1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.25,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.22,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:-1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.22,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.22,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:-1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.22,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:1}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.3,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:0}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.22,amb:0.7,key:1.25,keyCol:0xffe0b0,mad:1,side:-1}),
    mk({zen:0x4f8cc8,hor:0xdbe8ee,fog:0.0028,stars:0,moon:0,sun:1,sunY:0.5,amb:0.75,key:1.3,keyCol:0xfff0d8,mad:1,side:1})
  ];
  /* manual sky override (button): index 1 dawn, 2 day, 3 dusk, 4 night; 0 follows the chapter */
  var TOD=[null,
    mk({zen:0x2b3b6e,hor:0xeaa56a,fog:0.0032,stars:0.18,moon:0,sun:1,sunY:0.08,amb:0.62,key:1.15,keyCol:0xffc58a}),
    mk({zen:0x3d6ca8,hor:0xf3d49c,fog:0.003,stars:0,moon:0,sun:1,sunY:0.25,amb:0.7,key:1.25,keyCol:0xffe0b0}),
    mk({zen:0x1a1c40,hor:0xb26f45,fog:0.0034,stars:0.35,moon:0.35,sun:0.5,sunY:0.03,amb:0.5,key:1.0,keyCol:0xffb978}),
    mk({zen:0x010208,hor:0x0b132a,fog:0.0046,stars:1.35,moon:0.7})];

  var P=[
    {p:[0,3.2,48],l:[-6,12,-120]},
    {p:[-4,3.4,40],l:[6,16,-120]},
    {p:[0,2.8,34],l:[0,70,-40]},
    {p:[30,6.5,-18],l:[0,5.5,-60]},
    {p:[-26,5,-30],l:[0,6,-60]},
    {p:[-42,10,-100],l:[-110,42,-165]},
    {p:[0,3.4,-18],l:[-6,95,-200]},
    {p:[-34,6,-150],l:[22,4,-235]},
    {p:[30,10,-262],l:[72,16,-335]},
    {p:[152,16,-358],l:[130,4,-445]},
    {p:[-26,8,-6],l:[0,6,-60]},
    {p:[-18,19,-430],l:[-68,4,-530]},
    {p:[112,26,-270],l:[70,16,-335]},
    {p:[60,13,-295],l:[67,13,-335]},
    {p:[40,12,-290],l:[68,14,-335]},
    {p:[98,14,-300],l:[66,12,-335]},
    {p:[70,12,-300],l:[68,14,-335]},
    {p:[56,13,-292],l:[67,13,-335]},
    {p:[84,12,-298],l:[68,13,-335]},
    {p:[20,30,-20],l:[0,6,-200]},
    {p:[62,13,-296],l:[67,13,-335]},
    {p:[66,62,-215],l:[68,4,-335]}
  ];
  return {mk:mk,K:K,TOD:TOD,P:P};
})();
