/* ভূখণ্ডের উচ্চতা: noise(), heightAt(x,z)। SITES = সমতল করা জায়গা [x,z,ভেতরের ব্যাসার্ধ,বাইরের ব্যাসার্ধ]। */
window.SIRAT=window.SIRAT||{};
(function(){
'use strict';
var sstep=SIRAT.sstep;
function hash(x,y){var s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);}
function noise(x,y){
  var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
  var u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  var a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);
  return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
}
function baseH(x,z){
  var wx=x+noise(x*0.01,z*0.01)*40,wz=z+noise(x*0.01+9,z*0.01+3)*40;
  var h=0,amp=1,f=0.012,o,n;
  for(o=0;o<4;o++){n=1-Math.abs(noise(wx*f+o*7.3,wz*f*1.6+o*3.1)*2-1);h+=n*n*amp;amp*=0.5;f*=2.1;}
  return h*9;
}
var SITES=[[0,45,14,60],[0,-60,55,110],[-110,-165,50,100],[62,-335,90,150],[-70,-520,70,130],[130,-440,80,140]];
function heightAt(x,z){
  var m=1,k,s;
  for(k=0;k<SITES.length;k++){s=SITES[k];m*=sstep(s[2],s[3],Math.hypot(x-s[0],z-s[1]));}
  return baseH(x,z)*m;
}
SIRAT.noise=noise;SIRAT.heightAt=heightAt;SIRAT.SITES=SITES;
})();
