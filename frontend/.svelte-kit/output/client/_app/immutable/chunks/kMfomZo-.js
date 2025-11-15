import{L as ou,_ as au,C as uu,r as vi,F as lu,d as Lt,e as hu,f as cu,h as fu,i as he,j as du,S as pu,k as mu,l as gu}from"./SB3GKwJC.js";var Ei=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Wt,lo;(function(){var s;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(v,p){function g(){}g.prototype=p.prototype,v.D=p.prototype,v.prototype=new g,v.prototype.constructor=v,v.C=function(y,T,I){for(var m=Array(arguments.length-2),Vt=2;Vt<arguments.length;Vt++)m[Vt-2]=arguments[Vt];return p.prototype[T].apply(y,m)}}function e(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(n,e),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(v,p,g){g||(g=0);var y=Array(16);if(typeof p=="string")for(var T=0;16>T;++T)y[T]=p.charCodeAt(g++)|p.charCodeAt(g++)<<8|p.charCodeAt(g++)<<16|p.charCodeAt(g++)<<24;else for(T=0;16>T;++T)y[T]=p[g++]|p[g++]<<8|p[g++]<<16|p[g++]<<24;p=v.g[0],g=v.g[1],T=v.g[2];var I=v.g[3],m=p+(I^g&(T^I))+y[0]+3614090360&4294967295;p=g+(m<<7&4294967295|m>>>25),m=I+(T^p&(g^T))+y[1]+3905402710&4294967295,I=p+(m<<12&4294967295|m>>>20),m=T+(g^I&(p^g))+y[2]+606105819&4294967295,T=I+(m<<17&4294967295|m>>>15),m=g+(p^T&(I^p))+y[3]+3250441966&4294967295,g=T+(m<<22&4294967295|m>>>10),m=p+(I^g&(T^I))+y[4]+4118548399&4294967295,p=g+(m<<7&4294967295|m>>>25),m=I+(T^p&(g^T))+y[5]+1200080426&4294967295,I=p+(m<<12&4294967295|m>>>20),m=T+(g^I&(p^g))+y[6]+2821735955&4294967295,T=I+(m<<17&4294967295|m>>>15),m=g+(p^T&(I^p))+y[7]+4249261313&4294967295,g=T+(m<<22&4294967295|m>>>10),m=p+(I^g&(T^I))+y[8]+1770035416&4294967295,p=g+(m<<7&4294967295|m>>>25),m=I+(T^p&(g^T))+y[9]+2336552879&4294967295,I=p+(m<<12&4294967295|m>>>20),m=T+(g^I&(p^g))+y[10]+4294925233&4294967295,T=I+(m<<17&4294967295|m>>>15),m=g+(p^T&(I^p))+y[11]+2304563134&4294967295,g=T+(m<<22&4294967295|m>>>10),m=p+(I^g&(T^I))+y[12]+1804603682&4294967295,p=g+(m<<7&4294967295|m>>>25),m=I+(T^p&(g^T))+y[13]+4254626195&4294967295,I=p+(m<<12&4294967295|m>>>20),m=T+(g^I&(p^g))+y[14]+2792965006&4294967295,T=I+(m<<17&4294967295|m>>>15),m=g+(p^T&(I^p))+y[15]+1236535329&4294967295,g=T+(m<<22&4294967295|m>>>10),m=p+(T^I&(g^T))+y[1]+4129170786&4294967295,p=g+(m<<5&4294967295|m>>>27),m=I+(g^T&(p^g))+y[6]+3225465664&4294967295,I=p+(m<<9&4294967295|m>>>23),m=T+(p^g&(I^p))+y[11]+643717713&4294967295,T=I+(m<<14&4294967295|m>>>18),m=g+(I^p&(T^I))+y[0]+3921069994&4294967295,g=T+(m<<20&4294967295|m>>>12),m=p+(T^I&(g^T))+y[5]+3593408605&4294967295,p=g+(m<<5&4294967295|m>>>27),m=I+(g^T&(p^g))+y[10]+38016083&4294967295,I=p+(m<<9&4294967295|m>>>23),m=T+(p^g&(I^p))+y[15]+3634488961&4294967295,T=I+(m<<14&4294967295|m>>>18),m=g+(I^p&(T^I))+y[4]+3889429448&4294967295,g=T+(m<<20&4294967295|m>>>12),m=p+(T^I&(g^T))+y[9]+568446438&4294967295,p=g+(m<<5&4294967295|m>>>27),m=I+(g^T&(p^g))+y[14]+3275163606&4294967295,I=p+(m<<9&4294967295|m>>>23),m=T+(p^g&(I^p))+y[3]+4107603335&4294967295,T=I+(m<<14&4294967295|m>>>18),m=g+(I^p&(T^I))+y[8]+1163531501&4294967295,g=T+(m<<20&4294967295|m>>>12),m=p+(T^I&(g^T))+y[13]+2850285829&4294967295,p=g+(m<<5&4294967295|m>>>27),m=I+(g^T&(p^g))+y[2]+4243563512&4294967295,I=p+(m<<9&4294967295|m>>>23),m=T+(p^g&(I^p))+y[7]+1735328473&4294967295,T=I+(m<<14&4294967295|m>>>18),m=g+(I^p&(T^I))+y[12]+2368359562&4294967295,g=T+(m<<20&4294967295|m>>>12),m=p+(g^T^I)+y[5]+4294588738&4294967295,p=g+(m<<4&4294967295|m>>>28),m=I+(p^g^T)+y[8]+2272392833&4294967295,I=p+(m<<11&4294967295|m>>>21),m=T+(I^p^g)+y[11]+1839030562&4294967295,T=I+(m<<16&4294967295|m>>>16),m=g+(T^I^p)+y[14]+4259657740&4294967295,g=T+(m<<23&4294967295|m>>>9),m=p+(g^T^I)+y[1]+2763975236&4294967295,p=g+(m<<4&4294967295|m>>>28),m=I+(p^g^T)+y[4]+1272893353&4294967295,I=p+(m<<11&4294967295|m>>>21),m=T+(I^p^g)+y[7]+4139469664&4294967295,T=I+(m<<16&4294967295|m>>>16),m=g+(T^I^p)+y[10]+3200236656&4294967295,g=T+(m<<23&4294967295|m>>>9),m=p+(g^T^I)+y[13]+681279174&4294967295,p=g+(m<<4&4294967295|m>>>28),m=I+(p^g^T)+y[0]+3936430074&4294967295,I=p+(m<<11&4294967295|m>>>21),m=T+(I^p^g)+y[3]+3572445317&4294967295,T=I+(m<<16&4294967295|m>>>16),m=g+(T^I^p)+y[6]+76029189&4294967295,g=T+(m<<23&4294967295|m>>>9),m=p+(g^T^I)+y[9]+3654602809&4294967295,p=g+(m<<4&4294967295|m>>>28),m=I+(p^g^T)+y[12]+3873151461&4294967295,I=p+(m<<11&4294967295|m>>>21),m=T+(I^p^g)+y[15]+530742520&4294967295,T=I+(m<<16&4294967295|m>>>16),m=g+(T^I^p)+y[2]+3299628645&4294967295,g=T+(m<<23&4294967295|m>>>9),m=p+(T^(g|~I))+y[0]+4096336452&4294967295,p=g+(m<<6&4294967295|m>>>26),m=I+(g^(p|~T))+y[7]+1126891415&4294967295,I=p+(m<<10&4294967295|m>>>22),m=T+(p^(I|~g))+y[14]+2878612391&4294967295,T=I+(m<<15&4294967295|m>>>17),m=g+(I^(T|~p))+y[5]+4237533241&4294967295,g=T+(m<<21&4294967295|m>>>11),m=p+(T^(g|~I))+y[12]+1700485571&4294967295,p=g+(m<<6&4294967295|m>>>26),m=I+(g^(p|~T))+y[3]+2399980690&4294967295,I=p+(m<<10&4294967295|m>>>22),m=T+(p^(I|~g))+y[10]+4293915773&4294967295,T=I+(m<<15&4294967295|m>>>17),m=g+(I^(T|~p))+y[1]+2240044497&4294967295,g=T+(m<<21&4294967295|m>>>11),m=p+(T^(g|~I))+y[8]+1873313359&4294967295,p=g+(m<<6&4294967295|m>>>26),m=I+(g^(p|~T))+y[15]+4264355552&4294967295,I=p+(m<<10&4294967295|m>>>22),m=T+(p^(I|~g))+y[6]+2734768916&4294967295,T=I+(m<<15&4294967295|m>>>17),m=g+(I^(T|~p))+y[13]+1309151649&4294967295,g=T+(m<<21&4294967295|m>>>11),m=p+(T^(g|~I))+y[4]+4149444226&4294967295,p=g+(m<<6&4294967295|m>>>26),m=I+(g^(p|~T))+y[11]+3174756917&4294967295,I=p+(m<<10&4294967295|m>>>22),m=T+(p^(I|~g))+y[2]+718787259&4294967295,T=I+(m<<15&4294967295|m>>>17),m=g+(I^(T|~p))+y[9]+3951481745&4294967295,v.g[0]=v.g[0]+p&4294967295,v.g[1]=v.g[1]+(T+(m<<21&4294967295|m>>>11))&4294967295,v.g[2]=v.g[2]+T&4294967295,v.g[3]=v.g[3]+I&4294967295}n.prototype.u=function(v,p){p===void 0&&(p=v.length);for(var g=p-this.blockSize,y=this.B,T=this.h,I=0;I<p;){if(T==0)for(;I<=g;)i(this,v,I),I+=this.blockSize;if(typeof v=="string"){for(;I<p;)if(y[T++]=v.charCodeAt(I++),T==this.blockSize){i(this,y),T=0;break}}else for(;I<p;)if(y[T++]=v[I++],T==this.blockSize){i(this,y),T=0;break}}this.h=T,this.o+=p},n.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var p=1;p<v.length-8;++p)v[p]=0;var g=8*this.o;for(p=v.length-8;p<v.length;++p)v[p]=g&255,g/=256;for(this.u(v),v=Array(16),p=g=0;4>p;++p)for(var y=0;32>y;y+=8)v[g++]=this.g[p]>>>y&255;return v};function o(v,p){var g=h;return Object.prototype.hasOwnProperty.call(g,v)?g[v]:g[v]=p(v)}function u(v,p){this.h=p;for(var g=[],y=!0,T=v.length-1;0<=T;T--){var I=v[T]|0;y&&I==p||(g[T]=I,y=!1)}this.g=g}var h={};function f(v){return-128<=v&&128>v?o(v,function(p){return new u([p|0],0>p?-1:0)}):new u([v|0],0>v?-1:0)}function d(v){if(isNaN(v)||!isFinite(v))return w;if(0>v)return k(d(-v));for(var p=[],g=1,y=0;v>=g;y++)p[y]=v/g|0,g*=4294967296;return new u(p,0)}function _(v,p){if(v.length==0)throw Error("number format error: empty string");if(p=p||10,2>p||36<p)throw Error("radix out of range: "+p);if(v.charAt(0)=="-")return k(_(v.substring(1),p));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var g=d(Math.pow(p,8)),y=w,T=0;T<v.length;T+=8){var I=Math.min(8,v.length-T),m=parseInt(v.substring(T,T+I),p);8>I?(I=d(Math.pow(p,I)),y=y.j(I).add(d(m))):(y=y.j(g),y=y.add(d(m)))}return y}var w=f(0),R=f(1),S=f(16777216);s=u.prototype,s.m=function(){if(L(this))return-k(this).m();for(var v=0,p=1,g=0;g<this.g.length;g++){var y=this.i(g);v+=(0<=y?y:4294967296+y)*p,p*=4294967296}return v},s.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(b(this))return"0";if(L(this))return"-"+k(this).toString(v);for(var p=d(Math.pow(v,6)),g=this,y="";;){var T=et(g,p).g;g=G(g,T.j(p));var I=((0<g.g.length?g.g[0]:g.h)>>>0).toString(v);if(g=T,b(g))return I+y;for(;6>I.length;)I="0"+I;y=I+y}},s.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function b(v){if(v.h!=0)return!1;for(var p=0;p<v.g.length;p++)if(v.g[p]!=0)return!1;return!0}function L(v){return v.h==-1}s.l=function(v){return v=G(this,v),L(v)?-1:b(v)?0:1};function k(v){for(var p=v.g.length,g=[],y=0;y<p;y++)g[y]=~v.g[y];return new u(g,~v.h).add(R)}s.abs=function(){return L(this)?k(this):this},s.add=function(v){for(var p=Math.max(this.g.length,v.g.length),g=[],y=0,T=0;T<=p;T++){var I=y+(this.i(T)&65535)+(v.i(T)&65535),m=(I>>>16)+(this.i(T)>>>16)+(v.i(T)>>>16);y=m>>>16,I&=65535,m&=65535,g[T]=m<<16|I}return new u(g,g[g.length-1]&-2147483648?-1:0)};function G(v,p){return v.add(k(p))}s.j=function(v){if(b(this)||b(v))return w;if(L(this))return L(v)?k(this).j(k(v)):k(k(this).j(v));if(L(v))return k(this.j(k(v)));if(0>this.l(S)&&0>v.l(S))return d(this.m()*v.m());for(var p=this.g.length+v.g.length,g=[],y=0;y<2*p;y++)g[y]=0;for(y=0;y<this.g.length;y++)for(var T=0;T<v.g.length;T++){var I=this.i(y)>>>16,m=this.i(y)&65535,Vt=v.i(T)>>>16,Ie=v.i(T)&65535;g[2*y+2*T]+=m*Ie,Q(g,2*y+2*T),g[2*y+2*T+1]+=I*Ie,Q(g,2*y+2*T+1),g[2*y+2*T+1]+=m*Vt,Q(g,2*y+2*T+1),g[2*y+2*T+2]+=I*Vt,Q(g,2*y+2*T+2)}for(y=0;y<p;y++)g[y]=g[2*y+1]<<16|g[2*y];for(y=p;y<2*p;y++)g[y]=0;return new u(g,0)};function Q(v,p){for(;(v[p]&65535)!=v[p];)v[p+1]+=v[p]>>>16,v[p]&=65535,p++}function W(v,p){this.g=v,this.h=p}function et(v,p){if(b(p))throw Error("division by zero");if(b(v))return new W(w,w);if(L(v))return p=et(k(v),p),new W(k(p.g),k(p.h));if(L(p))return p=et(v,k(p)),new W(k(p.g),p.h);if(30<v.g.length){if(L(v)||L(p))throw Error("slowDivide_ only works with positive integers.");for(var g=R,y=p;0>=y.l(v);)g=Pt(g),y=Pt(y);var T=st(g,1),I=st(y,1);for(y=st(y,2),g=st(g,2);!b(y);){var m=I.add(y);0>=m.l(v)&&(T=T.add(g),I=m),y=st(y,1),g=st(g,1)}return p=G(v,T.j(p)),new W(T,p)}for(T=w;0<=v.l(p);){for(g=Math.max(1,Math.floor(v.m()/p.m())),y=Math.ceil(Math.log(g)/Math.LN2),y=48>=y?1:Math.pow(2,y-48),I=d(g),m=I.j(p);L(m)||0<m.l(v);)g-=y,I=d(g),m=I.j(p);b(I)&&(I=R),T=T.add(I),v=G(v,m)}return new W(T,v)}s.A=function(v){return et(this,v).h},s.and=function(v){for(var p=Math.max(this.g.length,v.g.length),g=[],y=0;y<p;y++)g[y]=this.i(y)&v.i(y);return new u(g,this.h&v.h)},s.or=function(v){for(var p=Math.max(this.g.length,v.g.length),g=[],y=0;y<p;y++)g[y]=this.i(y)|v.i(y);return new u(g,this.h|v.h)},s.xor=function(v){for(var p=Math.max(this.g.length,v.g.length),g=[],y=0;y<p;y++)g[y]=this.i(y)^v.i(y);return new u(g,this.h^v.h)};function Pt(v){for(var p=v.g.length+1,g=[],y=0;y<p;y++)g[y]=v.i(y)<<1|v.i(y-1)>>>31;return new u(g,v.h)}function st(v,p){var g=p>>5;p%=32;for(var y=v.g.length-g,T=[],I=0;I<y;I++)T[I]=0<p?v.i(I+g)>>>p|v.i(I+g+1)<<32-p:v.i(I+g);return new u(T,v.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,lo=n,u.prototype.add=u.prototype.add,u.prototype.multiply=u.prototype.j,u.prototype.modulo=u.prototype.A,u.prototype.compare=u.prototype.l,u.prototype.toNumber=u.prototype.m,u.prototype.toString=u.prototype.toString,u.prototype.getBits=u.prototype.i,u.fromNumber=d,u.fromString=_,Wt=u}).apply(typeof Ei<"u"?Ei:typeof self<"u"?self:typeof window<"u"?window:{});var wn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ho,qe,co,Cn,Rr,fo,po,mo;(function(){var s,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(r,a,l){return r==Array.prototype||r==Object.prototype||(r[a]=l.value),r};function e(r){r=[typeof globalThis=="object"&&globalThis,r,typeof window=="object"&&window,typeof self=="object"&&self,typeof wn=="object"&&wn];for(var a=0;a<r.length;++a){var l=r[a];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var n=e(this);function i(r,a){if(a)t:{var l=n;r=r.split(".");for(var c=0;c<r.length-1;c++){var E=r[c];if(!(E in l))break t;l=l[E]}r=r[r.length-1],c=l[r],a=a(c),a!=c&&a!=null&&t(l,r,{configurable:!0,writable:!0,value:a})}}function o(r,a){r instanceof String&&(r+="");var l=0,c=!1,E={next:function(){if(!c&&l<r.length){var A=l++;return{value:a(A,r[A]),done:!1}}return c=!0,{done:!0,value:void 0}}};return E[Symbol.iterator]=function(){return E},E}i("Array.prototype.values",function(r){return r||function(){return o(this,function(a,l){return l})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var u=u||{},h=this||self;function f(r){var a=typeof r;return a=a!="object"?a:r?Array.isArray(r)?"array":a:"null",a=="array"||a=="object"&&typeof r.length=="number"}function d(r){var a=typeof r;return a=="object"&&r!=null||a=="function"}function _(r,a,l){return r.call.apply(r.bind,arguments)}function w(r,a,l){if(!r)throw Error();if(2<arguments.length){var c=Array.prototype.slice.call(arguments,2);return function(){var E=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(E,c),r.apply(a,E)}}return function(){return r.apply(a,arguments)}}function R(r,a,l){return R=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?_:w,R.apply(null,arguments)}function S(r,a){var l=Array.prototype.slice.call(arguments,1);return function(){var c=l.slice();return c.push.apply(c,arguments),r.apply(this,c)}}function b(r,a){function l(){}l.prototype=a.prototype,r.aa=a.prototype,r.prototype=new l,r.prototype.constructor=r,r.Qb=function(c,E,A){for(var C=Array(arguments.length-2),z=2;z<arguments.length;z++)C[z-2]=arguments[z];return a.prototype[E].apply(c,C)}}function L(r){const a=r.length;if(0<a){const l=Array(a);for(let c=0;c<a;c++)l[c]=r[c];return l}return[]}function k(r,a){for(let l=1;l<arguments.length;l++){const c=arguments[l];if(f(c)){const E=r.length||0,A=c.length||0;r.length=E+A;for(let C=0;C<A;C++)r[E+C]=c[C]}else r.push(c)}}class G{constructor(a,l){this.i=a,this.j=l,this.h=0,this.g=null}get(){let a;return 0<this.h?(this.h--,a=this.g,this.g=a.next,a.next=null):a=this.i(),a}}function Q(r){return/^[\s\xa0]*$/.test(r)}function W(){var r=h.navigator;return r&&(r=r.userAgent)?r:""}function et(r){return et[" "](r),r}et[" "]=function(){};var Pt=W().indexOf("Gecko")!=-1&&!(W().toLowerCase().indexOf("webkit")!=-1&&W().indexOf("Edge")==-1)&&!(W().indexOf("Trident")!=-1||W().indexOf("MSIE")!=-1)&&W().indexOf("Edge")==-1;function st(r,a,l){for(const c in r)a.call(l,r[c],c,r)}function v(r,a){for(const l in r)a.call(void 0,r[l],l,r)}function p(r){const a={};for(const l in r)a[l]=r[l];return a}const g="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function y(r,a){let l,c;for(let E=1;E<arguments.length;E++){c=arguments[E];for(l in c)r[l]=c[l];for(let A=0;A<g.length;A++)l=g[A],Object.prototype.hasOwnProperty.call(c,l)&&(r[l]=c[l])}}function T(r){var a=1;r=r.split(":");const l=[];for(;0<a&&r.length;)l.push(r.shift()),a--;return r.length&&l.push(r.join(":")),l}function I(r){h.setTimeout(()=>{throw r},0)}function m(){var r=Yn;let a=null;return r.g&&(a=r.g,r.g=r.g.next,r.g||(r.h=null),a.next=null),a}class Vt{constructor(){this.h=this.g=null}add(a,l){const c=Ie.get();c.set(a,l),this.h?this.h.next=c:this.g=c,this.h=c}}var Ie=new G(()=>new Ra,r=>r.reset());class Ra{constructor(){this.next=this.g=this.h=null}set(a,l){this.h=a,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let Ae,we=!1,Yn=new Vt,vs=()=>{const r=h.Promise.resolve(void 0);Ae=()=>{r.then(Pa)}};var Pa=()=>{for(var r;r=m();){try{r.h.call(r.g)}catch(l){I(l)}var a=Ie;a.j(r),100>a.h&&(a.h++,r.next=a.g,a.g=r)}we=!1};function Nt(){this.s=this.s,this.C=this.C}Nt.prototype.s=!1,Nt.prototype.ma=function(){this.s||(this.s=!0,this.N())},Nt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function lt(r,a){this.type=r,this.g=this.target=a,this.defaultPrevented=!1}lt.prototype.h=function(){this.defaultPrevented=!0};var Va=function(){if(!h.addEventListener||!Object.defineProperty)return!1;var r=!1,a=Object.defineProperty({},"passive",{get:function(){r=!0}});try{const l=()=>{};h.addEventListener("test",l,a),h.removeEventListener("test",l,a)}catch{}return r}();function Re(r,a){if(lt.call(this,r?r.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,r){var l=this.type=r.type,c=r.changedTouches&&r.changedTouches.length?r.changedTouches[0]:null;if(this.target=r.target||r.srcElement,this.g=a,a=r.relatedTarget){if(Pt){t:{try{et(a.nodeName);var E=!0;break t}catch{}E=!1}E||(a=null)}}else l=="mouseover"?a=r.fromElement:l=="mouseout"&&(a=r.toElement);this.relatedTarget=a,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=r.clientX!==void 0?r.clientX:r.pageX,this.clientY=r.clientY!==void 0?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0),this.button=r.button,this.key=r.key||"",this.ctrlKey=r.ctrlKey,this.altKey=r.altKey,this.shiftKey=r.shiftKey,this.metaKey=r.metaKey,this.pointerId=r.pointerId||0,this.pointerType=typeof r.pointerType=="string"?r.pointerType:Ca[r.pointerType]||"",this.state=r.state,this.i=r,r.defaultPrevented&&Re.aa.h.call(this)}}b(Re,lt);var Ca={2:"touch",3:"pen",4:"mouse"};Re.prototype.h=function(){Re.aa.h.call(this);var r=this.i;r.preventDefault?r.preventDefault():r.returnValue=!1};var sn="closure_listenable_"+(1e6*Math.random()|0),Sa=0;function Da(r,a,l,c,E){this.listener=r,this.proxy=null,this.src=a,this.type=l,this.capture=!!c,this.ha=E,this.key=++Sa,this.da=this.fa=!1}function on(r){r.da=!0,r.listener=null,r.proxy=null,r.src=null,r.ha=null}function an(r){this.src=r,this.g={},this.h=0}an.prototype.add=function(r,a,l,c,E){var A=r.toString();r=this.g[A],r||(r=this.g[A]=[],this.h++);var C=Jn(r,a,c,E);return-1<C?(a=r[C],l||(a.fa=!1)):(a=new Da(a,this.src,A,!!c,E),a.fa=l,r.push(a)),a};function Xn(r,a){var l=a.type;if(l in r.g){var c=r.g[l],E=Array.prototype.indexOf.call(c,a,void 0),A;(A=0<=E)&&Array.prototype.splice.call(c,E,1),A&&(on(a),r.g[l].length==0&&(delete r.g[l],r.h--))}}function Jn(r,a,l,c){for(var E=0;E<r.length;++E){var A=r[E];if(!A.da&&A.listener==a&&A.capture==!!l&&A.ha==c)return E}return-1}var Zn="closure_lm_"+(1e6*Math.random()|0),tr={};function Es(r,a,l,c,E){if(Array.isArray(a)){for(var A=0;A<a.length;A++)Es(r,a[A],l,c,E);return null}return l=ws(l),r&&r[sn]?r.K(a,l,d(c)?!!c.capture:!1,E):Na(r,a,l,!1,c,E)}function Na(r,a,l,c,E,A){if(!a)throw Error("Invalid event type");var C=d(E)?!!E.capture:!!E,z=nr(r);if(z||(r[Zn]=z=new an(r)),l=z.add(a,l,c,C,A),l.proxy)return l;if(c=ka(),l.proxy=c,c.src=r,c.listener=l,r.addEventListener)Va||(E=C),E===void 0&&(E=!1),r.addEventListener(a.toString(),c,E);else if(r.attachEvent)r.attachEvent(As(a.toString()),c);else if(r.addListener&&r.removeListener)r.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return l}function ka(){function r(l){return a.call(r.src,r.listener,l)}const a=ba;return r}function Is(r,a,l,c,E){if(Array.isArray(a))for(var A=0;A<a.length;A++)Is(r,a[A],l,c,E);else c=d(c)?!!c.capture:!!c,l=ws(l),r&&r[sn]?(r=r.i,a=String(a).toString(),a in r.g&&(A=r.g[a],l=Jn(A,l,c,E),-1<l&&(on(A[l]),Array.prototype.splice.call(A,l,1),A.length==0&&(delete r.g[a],r.h--)))):r&&(r=nr(r))&&(a=r.g[a.toString()],r=-1,a&&(r=Jn(a,l,c,E)),(l=-1<r?a[r]:null)&&er(l))}function er(r){if(typeof r!="number"&&r&&!r.da){var a=r.src;if(a&&a[sn])Xn(a.i,r);else{var l=r.type,c=r.proxy;a.removeEventListener?a.removeEventListener(l,c,r.capture):a.detachEvent?a.detachEvent(As(l),c):a.addListener&&a.removeListener&&a.removeListener(c),(l=nr(a))?(Xn(l,r),l.h==0&&(l.src=null,a[Zn]=null)):on(r)}}}function As(r){return r in tr?tr[r]:tr[r]="on"+r}function ba(r,a){if(r.da)r=!0;else{a=new Re(a,this);var l=r.listener,c=r.ha||r.src;r.fa&&er(r),r=l.call(c,a)}return r}function nr(r){return r=r[Zn],r instanceof an?r:null}var rr="__closure_events_fn_"+(1e9*Math.random()>>>0);function ws(r){return typeof r=="function"?r:(r[rr]||(r[rr]=function(a){return r.handleEvent(a)}),r[rr])}function ht(){Nt.call(this),this.i=new an(this),this.M=this,this.F=null}b(ht,Nt),ht.prototype[sn]=!0,ht.prototype.removeEventListener=function(r,a,l,c){Is(this,r,a,l,c)};function _t(r,a){var l,c=r.F;if(c)for(l=[];c;c=c.F)l.push(c);if(r=r.M,c=a.type||a,typeof a=="string")a=new lt(a,r);else if(a instanceof lt)a.target=a.target||r;else{var E=a;a=new lt(c,r),y(a,E)}if(E=!0,l)for(var A=l.length-1;0<=A;A--){var C=a.g=l[A];E=un(C,c,!0,a)&&E}if(C=a.g=r,E=un(C,c,!0,a)&&E,E=un(C,c,!1,a)&&E,l)for(A=0;A<l.length;A++)C=a.g=l[A],E=un(C,c,!1,a)&&E}ht.prototype.N=function(){if(ht.aa.N.call(this),this.i){var r=this.i,a;for(a in r.g){for(var l=r.g[a],c=0;c<l.length;c++)on(l[c]);delete r.g[a],r.h--}}this.F=null},ht.prototype.K=function(r,a,l,c){return this.i.add(String(r),a,!1,l,c)},ht.prototype.L=function(r,a,l,c){return this.i.add(String(r),a,!0,l,c)};function un(r,a,l,c){if(a=r.i.g[String(a)],!a)return!0;a=a.concat();for(var E=!0,A=0;A<a.length;++A){var C=a[A];if(C&&!C.da&&C.capture==l){var z=C.listener,it=C.ha||C.src;C.fa&&Xn(r.i,C),E=z.call(it,c)!==!1&&E}}return E&&!c.defaultPrevented}function Rs(r,a,l){if(typeof r=="function")l&&(r=R(r,l));else if(r&&typeof r.handleEvent=="function")r=R(r.handleEvent,r);else throw Error("Invalid listener argument");return 2147483647<Number(a)?-1:h.setTimeout(r,a||0)}function Ps(r){r.g=Rs(()=>{r.g=null,r.i&&(r.i=!1,Ps(r))},r.l);const a=r.h;r.h=null,r.m.apply(null,a)}class xa extends Nt{constructor(a,l){super(),this.m=a,this.l=l,this.h=null,this.i=!1,this.g=null}j(a){this.h=arguments,this.g?this.i=!0:Ps(this)}N(){super.N(),this.g&&(h.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Pe(r){Nt.call(this),this.h=r,this.g={}}b(Pe,Nt);var Vs=[];function Cs(r){st(r.g,function(a,l){this.g.hasOwnProperty(l)&&er(a)},r),r.g={}}Pe.prototype.N=function(){Pe.aa.N.call(this),Cs(this)},Pe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var sr=h.JSON.stringify,La=h.JSON.parse,Ma=class{stringify(r){return h.JSON.stringify(r,void 0)}parse(r){return h.JSON.parse(r,void 0)}};function ir(){}ir.prototype.h=null;function Ss(r){return r.h||(r.h=r.i())}function Ds(){}var Ve={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function or(){lt.call(this,"d")}b(or,lt);function ar(){lt.call(this,"c")}b(ar,lt);var zt={},Ns=null;function ln(){return Ns=Ns||new ht}zt.La="serverreachability";function ks(r){lt.call(this,zt.La,r)}b(ks,lt);function Ce(r){const a=ln();_t(a,new ks(a))}zt.STAT_EVENT="statevent";function bs(r,a){lt.call(this,zt.STAT_EVENT,r),this.stat=a}b(bs,lt);function yt(r){const a=ln();_t(a,new bs(a,r))}zt.Ma="timingevent";function xs(r,a){lt.call(this,zt.Ma,r),this.size=a}b(xs,lt);function Se(r,a){if(typeof r!="function")throw Error("Fn must not be null and must be a function");return h.setTimeout(function(){r()},a)}function De(){this.g=!0}De.prototype.xa=function(){this.g=!1};function Oa(r,a,l,c,E,A){r.info(function(){if(r.g)if(A)for(var C="",z=A.split("&"),it=0;it<z.length;it++){var B=z[it].split("=");if(1<B.length){var ct=B[0];B=B[1];var ft=ct.split("_");C=2<=ft.length&&ft[1]=="type"?C+(ct+"="+B+"&"):C+(ct+"=redacted&")}}else C=null;else C=A;return"XMLHTTP REQ ("+c+") [attempt "+E+"]: "+a+`
`+l+`
`+C})}function Fa(r,a,l,c,E,A,C){r.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+E+"]: "+a+`
`+l+`
`+A+" "+C})}function te(r,a,l,c){r.info(function(){return"XMLHTTP TEXT ("+a+"): "+qa(r,l)+(c?" "+c:"")})}function Ua(r,a){r.info(function(){return"TIMEOUT: "+a})}De.prototype.info=function(){};function qa(r,a){if(!r.g)return a;if(!a)return null;try{var l=JSON.parse(a);if(l){for(r=0;r<l.length;r++)if(Array.isArray(l[r])){var c=l[r];if(!(2>c.length)){var E=c[1];if(Array.isArray(E)&&!(1>E.length)){var A=E[0];if(A!="noop"&&A!="stop"&&A!="close")for(var C=1;C<E.length;C++)E[C]=""}}}}return sr(l)}catch{return a}}var hn={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Ls={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},ur;function cn(){}b(cn,ir),cn.prototype.g=function(){return new XMLHttpRequest},cn.prototype.i=function(){return{}},ur=new cn;function kt(r,a,l,c){this.j=r,this.i=a,this.l=l,this.R=c||1,this.U=new Pe(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ms}function Ms(){this.i=null,this.g="",this.h=!1}var Os={},lr={};function hr(r,a,l){r.L=1,r.v=mn(Ct(a)),r.m=l,r.P=!0,Fs(r,null)}function Fs(r,a){r.F=Date.now(),fn(r),r.A=Ct(r.v);var l=r.A,c=r.R;Array.isArray(c)||(c=[String(c)]),Js(l.i,"t",c),r.C=0,l=r.j.J,r.h=new Ms,r.g=gi(r.j,l?a:null,!r.m),0<r.O&&(r.M=new xa(R(r.Y,r,r.g),r.O)),a=r.U,l=r.g,c=r.ca;var E="readystatechange";Array.isArray(E)||(E&&(Vs[0]=E.toString()),E=Vs);for(var A=0;A<E.length;A++){var C=Es(l,E[A],c||a.handleEvent,!1,a.h||a);if(!C)break;a.g[C.key]=C}a=r.H?p(r.H):{},r.m?(r.u||(r.u="POST"),a["Content-Type"]="application/x-www-form-urlencoded",r.g.ea(r.A,r.u,r.m,a)):(r.u="GET",r.g.ea(r.A,r.u,null,a)),Ce(),Oa(r.i,r.u,r.A,r.l,r.R,r.m)}kt.prototype.ca=function(r){r=r.target;const a=this.M;a&&St(r)==3?a.j():this.Y(r)},kt.prototype.Y=function(r){try{if(r==this.g)t:{const ft=St(this.g);var a=this.g.Ba();const re=this.g.Z();if(!(3>ft)&&(ft!=3||this.g&&(this.h.h||this.g.oa()||ii(this.g)))){this.J||ft!=4||a==7||(a==8||0>=re?Ce(3):Ce(2)),cr(this);var l=this.g.Z();this.X=l;e:if(Us(this)){var c=ii(this.g);r="";var E=c.length,A=St(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Kt(this),Ne(this);var C="";break e}this.h.i=new h.TextDecoder}for(a=0;a<E;a++)this.h.h=!0,r+=this.h.i.decode(c[a],{stream:!(A&&a==E-1)});c.length=0,this.h.g+=r,this.C=0,C=this.h.g}else C=this.g.oa();if(this.o=l==200,Fa(this.i,this.u,this.A,this.l,this.R,ft,l),this.o){if(this.T&&!this.K){e:{if(this.g){var z,it=this.g;if((z=it.g?it.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!Q(z)){var B=z;break e}}B=null}if(l=B)te(this.i,this.l,l,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,fr(this,l);else{this.o=!1,this.s=3,yt(12),Kt(this),Ne(this);break t}}if(this.P){l=!0;let Et;for(;!this.J&&this.C<C.length;)if(Et=Ba(this,C),Et==lr){ft==4&&(this.s=4,yt(14),l=!1),te(this.i,this.l,null,"[Incomplete Response]");break}else if(Et==Os){this.s=4,yt(15),te(this.i,this.l,C,"[Invalid Chunk]"),l=!1;break}else te(this.i,this.l,Et,null),fr(this,Et);if(Us(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ft!=4||C.length!=0||this.h.h||(this.s=1,yt(16),l=!1),this.o=this.o&&l,!l)te(this.i,this.l,C,"[Invalid Chunked Response]"),Kt(this),Ne(this);else if(0<C.length&&!this.W){this.W=!0;var ct=this.j;ct.g==this&&ct.ba&&!ct.M&&(ct.j.info("Great, no buffering proxy detected. Bytes received: "+C.length),yr(ct),ct.M=!0,yt(11))}}else te(this.i,this.l,C,null),fr(this,C);ft==4&&Kt(this),this.o&&!this.J&&(ft==4?fi(this.j,this):(this.o=!1,fn(this)))}else su(this.g),l==400&&0<C.indexOf("Unknown SID")?(this.s=3,yt(12)):(this.s=0,yt(13)),Kt(this),Ne(this)}}}catch{}finally{}};function Us(r){return r.g?r.u=="GET"&&r.L!=2&&r.j.Ca:!1}function Ba(r,a){var l=r.C,c=a.indexOf(`
`,l);return c==-1?lr:(l=Number(a.substring(l,c)),isNaN(l)?Os:(c+=1,c+l>a.length?lr:(a=a.slice(c,c+l),r.C=c+l,a)))}kt.prototype.cancel=function(){this.J=!0,Kt(this)};function fn(r){r.S=Date.now()+r.I,qs(r,r.I)}function qs(r,a){if(r.B!=null)throw Error("WatchDog timer not null");r.B=Se(R(r.ba,r),a)}function cr(r){r.B&&(h.clearTimeout(r.B),r.B=null)}kt.prototype.ba=function(){this.B=null;const r=Date.now();0<=r-this.S?(Ua(this.i,this.A),this.L!=2&&(Ce(),yt(17)),Kt(this),this.s=2,Ne(this)):qs(this,this.S-r)};function Ne(r){r.j.G==0||r.J||fi(r.j,r)}function Kt(r){cr(r);var a=r.M;a&&typeof a.ma=="function"&&a.ma(),r.M=null,Cs(r.U),r.g&&(a=r.g,r.g=null,a.abort(),a.ma())}function fr(r,a){try{var l=r.j;if(l.G!=0&&(l.g==r||dr(l.h,r))){if(!r.K&&dr(l.h,r)&&l.G==3){try{var c=l.Da.g.parse(a)}catch{c=null}if(Array.isArray(c)&&c.length==3){var E=c;if(E[0]==0){t:if(!l.u){if(l.g)if(l.g.F+3e3<r.F)En(l),Tn(l);else break t;_r(l),yt(18)}}else l.za=E[1],0<l.za-l.T&&37500>E[2]&&l.F&&l.v==0&&!l.C&&(l.C=Se(R(l.Za,l),6e3));if(1>=zs(l.h)&&l.ca){try{l.ca()}catch{}l.ca=void 0}}else Gt(l,11)}else if((r.K||l.g==r)&&En(l),!Q(a))for(E=l.Da.g.parse(a),a=0;a<E.length;a++){let B=E[a];if(l.T=B[0],B=B[1],l.G==2)if(B[0]=="c"){l.K=B[1],l.ia=B[2];const ct=B[3];ct!=null&&(l.la=ct,l.j.info("VER="+l.la));const ft=B[4];ft!=null&&(l.Aa=ft,l.j.info("SVER="+l.Aa));const re=B[5];re!=null&&typeof re=="number"&&0<re&&(c=1.5*re,l.L=c,l.j.info("backChannelRequestTimeoutMs_="+c)),c=l;const Et=r.g;if(Et){const An=Et.g?Et.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(An){var A=c.h;A.g||An.indexOf("spdy")==-1&&An.indexOf("quic")==-1&&An.indexOf("h2")==-1||(A.j=A.l,A.g=new Set,A.h&&(pr(A,A.h),A.h=null))}if(c.D){const Tr=Et.g?Et.g.getResponseHeader("X-HTTP-Session-Id"):null;Tr&&(c.ya=Tr,K(c.I,c.D,Tr))}}l.G=3,l.l&&l.l.ua(),l.ba&&(l.R=Date.now()-r.F,l.j.info("Handshake RTT: "+l.R+"ms")),c=l;var C=r;if(c.qa=mi(c,c.J?c.ia:null,c.W),C.K){Ks(c.h,C);var z=C,it=c.L;it&&(z.I=it),z.B&&(cr(z),fn(z)),c.g=C}else hi(c);0<l.i.length&&vn(l)}else B[0]!="stop"&&B[0]!="close"||Gt(l,7);else l.G==3&&(B[0]=="stop"||B[0]=="close"?B[0]=="stop"?Gt(l,7):gr(l):B[0]!="noop"&&l.l&&l.l.ta(B),l.v=0)}}Ce(4)}catch{}}var ja=class{constructor(r,a){this.g=r,this.map=a}};function Bs(r){this.l=r||10,h.PerformanceNavigationTiming?(r=h.performance.getEntriesByType("navigation"),r=0<r.length&&(r[0].nextHopProtocol=="hq"||r[0].nextHopProtocol=="h2")):r=!!(h.chrome&&h.chrome.loadTimes&&h.chrome.loadTimes()&&h.chrome.loadTimes().wasFetchedViaSpdy),this.j=r?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function js(r){return r.h?!0:r.g?r.g.size>=r.j:!1}function zs(r){return r.h?1:r.g?r.g.size:0}function dr(r,a){return r.h?r.h==a:r.g?r.g.has(a):!1}function pr(r,a){r.g?r.g.add(a):r.h=a}function Ks(r,a){r.h&&r.h==a?r.h=null:r.g&&r.g.has(a)&&r.g.delete(a)}Bs.prototype.cancel=function(){if(this.i=$s(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const r of this.g.values())r.cancel();this.g.clear()}};function $s(r){if(r.h!=null)return r.i.concat(r.h.D);if(r.g!=null&&r.g.size!==0){let a=r.i;for(const l of r.g.values())a=a.concat(l.D);return a}return L(r.i)}function za(r){if(r.V&&typeof r.V=="function")return r.V();if(typeof Map<"u"&&r instanceof Map||typeof Set<"u"&&r instanceof Set)return Array.from(r.values());if(typeof r=="string")return r.split("");if(f(r)){for(var a=[],l=r.length,c=0;c<l;c++)a.push(r[c]);return a}a=[],l=0;for(c in r)a[l++]=r[c];return a}function Ka(r){if(r.na&&typeof r.na=="function")return r.na();if(!r.V||typeof r.V!="function"){if(typeof Map<"u"&&r instanceof Map)return Array.from(r.keys());if(!(typeof Set<"u"&&r instanceof Set)){if(f(r)||typeof r=="string"){var a=[];r=r.length;for(var l=0;l<r;l++)a.push(l);return a}a=[],l=0;for(const c in r)a[l++]=c;return a}}}function Gs(r,a){if(r.forEach&&typeof r.forEach=="function")r.forEach(a,void 0);else if(f(r)||typeof r=="string")Array.prototype.forEach.call(r,a,void 0);else for(var l=Ka(r),c=za(r),E=c.length,A=0;A<E;A++)a.call(void 0,c[A],l&&l[A],r)}var Qs=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function $a(r,a){if(r){r=r.split("&");for(var l=0;l<r.length;l++){var c=r[l].indexOf("="),E=null;if(0<=c){var A=r[l].substring(0,c);E=r[l].substring(c+1)}else A=r[l];a(A,E?decodeURIComponent(E.replace(/\+/g," ")):"")}}}function $t(r){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,r instanceof $t){this.h=r.h,dn(this,r.j),this.o=r.o,this.g=r.g,pn(this,r.s),this.l=r.l;var a=r.i,l=new xe;l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),Ws(this,l),this.m=r.m}else r&&(a=String(r).match(Qs))?(this.h=!1,dn(this,a[1]||"",!0),this.o=ke(a[2]||""),this.g=ke(a[3]||"",!0),pn(this,a[4]),this.l=ke(a[5]||"",!0),Ws(this,a[6]||"",!0),this.m=ke(a[7]||"")):(this.h=!1,this.i=new xe(null,this.h))}$t.prototype.toString=function(){var r=[],a=this.j;a&&r.push(be(a,Hs,!0),":");var l=this.g;return(l||a=="file")&&(r.push("//"),(a=this.o)&&r.push(be(a,Hs,!0),"@"),r.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.s,l!=null&&r.push(":",String(l))),(l=this.l)&&(this.g&&l.charAt(0)!="/"&&r.push("/"),r.push(be(l,l.charAt(0)=="/"?Wa:Qa,!0))),(l=this.i.toString())&&r.push("?",l),(l=this.m)&&r.push("#",be(l,Ya)),r.join("")};function Ct(r){return new $t(r)}function dn(r,a,l){r.j=l?ke(a,!0):a,r.j&&(r.j=r.j.replace(/:$/,""))}function pn(r,a){if(a){if(a=Number(a),isNaN(a)||0>a)throw Error("Bad port number "+a);r.s=a}else r.s=null}function Ws(r,a,l){a instanceof xe?(r.i=a,Xa(r.i,r.h)):(l||(a=be(a,Ha)),r.i=new xe(a,r.h))}function K(r,a,l){r.i.set(a,l)}function mn(r){return K(r,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),r}function ke(r,a){return r?a?decodeURI(r.replace(/%25/g,"%2525")):decodeURIComponent(r):""}function be(r,a,l){return typeof r=="string"?(r=encodeURI(r).replace(a,Ga),l&&(r=r.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),r):null}function Ga(r){return r=r.charCodeAt(0),"%"+(r>>4&15).toString(16)+(r&15).toString(16)}var Hs=/[#\/\?@]/g,Qa=/[#\?:]/g,Wa=/[#\?]/g,Ha=/[#\?@]/g,Ya=/#/g;function xe(r,a){this.h=this.g=null,this.i=r||null,this.j=!!a}function bt(r){r.g||(r.g=new Map,r.h=0,r.i&&$a(r.i,function(a,l){r.add(decodeURIComponent(a.replace(/\+/g," ")),l)}))}s=xe.prototype,s.add=function(r,a){bt(this),this.i=null,r=ee(this,r);var l=this.g.get(r);return l||this.g.set(r,l=[]),l.push(a),this.h+=1,this};function Ys(r,a){bt(r),a=ee(r,a),r.g.has(a)&&(r.i=null,r.h-=r.g.get(a).length,r.g.delete(a))}function Xs(r,a){return bt(r),a=ee(r,a),r.g.has(a)}s.forEach=function(r,a){bt(this),this.g.forEach(function(l,c){l.forEach(function(E){r.call(a,E,c,this)},this)},this)},s.na=function(){bt(this);const r=Array.from(this.g.values()),a=Array.from(this.g.keys()),l=[];for(let c=0;c<a.length;c++){const E=r[c];for(let A=0;A<E.length;A++)l.push(a[c])}return l},s.V=function(r){bt(this);let a=[];if(typeof r=="string")Xs(this,r)&&(a=a.concat(this.g.get(ee(this,r))));else{r=Array.from(this.g.values());for(let l=0;l<r.length;l++)a=a.concat(r[l])}return a},s.set=function(r,a){return bt(this),this.i=null,r=ee(this,r),Xs(this,r)&&(this.h-=this.g.get(r).length),this.g.set(r,[a]),this.h+=1,this},s.get=function(r,a){return r?(r=this.V(r),0<r.length?String(r[0]):a):a};function Js(r,a,l){Ys(r,a),0<l.length&&(r.i=null,r.g.set(ee(r,a),L(l)),r.h+=l.length)}s.toString=function(){if(this.i)return this.i;if(!this.g)return"";const r=[],a=Array.from(this.g.keys());for(var l=0;l<a.length;l++){var c=a[l];const A=encodeURIComponent(String(c)),C=this.V(c);for(c=0;c<C.length;c++){var E=A;C[c]!==""&&(E+="="+encodeURIComponent(String(C[c]))),r.push(E)}}return this.i=r.join("&")};function ee(r,a){return a=String(a),r.j&&(a=a.toLowerCase()),a}function Xa(r,a){a&&!r.j&&(bt(r),r.i=null,r.g.forEach(function(l,c){var E=c.toLowerCase();c!=E&&(Ys(this,c),Js(this,E,l))},r)),r.j=a}function Ja(r,a){const l=new De;if(h.Image){const c=new Image;c.onload=S(xt,l,"TestLoadImage: loaded",!0,a,c),c.onerror=S(xt,l,"TestLoadImage: error",!1,a,c),c.onabort=S(xt,l,"TestLoadImage: abort",!1,a,c),c.ontimeout=S(xt,l,"TestLoadImage: timeout",!1,a,c),h.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=r}else a(!1)}function Za(r,a){const l=new De,c=new AbortController,E=setTimeout(()=>{c.abort(),xt(l,"TestPingServer: timeout",!1,a)},1e4);fetch(r,{signal:c.signal}).then(A=>{clearTimeout(E),A.ok?xt(l,"TestPingServer: ok",!0,a):xt(l,"TestPingServer: server error",!1,a)}).catch(()=>{clearTimeout(E),xt(l,"TestPingServer: error",!1,a)})}function xt(r,a,l,c,E){try{E&&(E.onload=null,E.onerror=null,E.onabort=null,E.ontimeout=null),c(l)}catch{}}function tu(){this.g=new Ma}function eu(r,a,l){const c=l||"";try{Gs(r,function(E,A){let C=E;d(E)&&(C=sr(E)),a.push(c+A+"="+encodeURIComponent(C))})}catch(E){throw a.push(c+"type="+encodeURIComponent("_badmap")),E}}function gn(r){this.l=r.Ub||null,this.j=r.eb||!1}b(gn,ir),gn.prototype.g=function(){return new _n(this.l,this.j)},gn.prototype.i=function(r){return function(){return r}}({});function _n(r,a){ht.call(this),this.D=r,this.o=a,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}b(_n,ht),s=_n.prototype,s.open=function(r,a){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=r,this.A=a,this.readyState=1,Me(this)},s.send=function(r){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const a={headers:this.u,method:this.B,credentials:this.m,cache:void 0};r&&(a.body=r),(this.D||h).fetch(new Request(this.A,a)).then(this.Sa.bind(this),this.ga.bind(this))},s.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Le(this)),this.readyState=0},s.Sa=function(r){if(this.g&&(this.l=r,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=r.headers,this.readyState=2,Me(this)),this.g&&(this.readyState=3,Me(this),this.g)))if(this.responseType==="arraybuffer")r.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof h.ReadableStream<"u"&&"body"in r){if(this.j=r.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Zs(this)}else r.text().then(this.Ra.bind(this),this.ga.bind(this))};function Zs(r){r.j.read().then(r.Pa.bind(r)).catch(r.ga.bind(r))}s.Pa=function(r){if(this.g){if(this.o&&r.value)this.response.push(r.value);else if(!this.o){var a=r.value?r.value:new Uint8Array(0);(a=this.v.decode(a,{stream:!r.done}))&&(this.response=this.responseText+=a)}r.done?Le(this):Me(this),this.readyState==3&&Zs(this)}},s.Ra=function(r){this.g&&(this.response=this.responseText=r,Le(this))},s.Qa=function(r){this.g&&(this.response=r,Le(this))},s.ga=function(){this.g&&Le(this)};function Le(r){r.readyState=4,r.l=null,r.j=null,r.v=null,Me(r)}s.setRequestHeader=function(r,a){this.u.append(r,a)},s.getResponseHeader=function(r){return this.h&&this.h.get(r.toLowerCase())||""},s.getAllResponseHeaders=function(){if(!this.h)return"";const r=[],a=this.h.entries();for(var l=a.next();!l.done;)l=l.value,r.push(l[0]+": "+l[1]),l=a.next();return r.join(`\r
`)};function Me(r){r.onreadystatechange&&r.onreadystatechange.call(r)}Object.defineProperty(_n.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(r){this.m=r?"include":"same-origin"}});function ti(r){let a="";return st(r,function(l,c){a+=c,a+=":",a+=l,a+=`\r
`}),a}function mr(r,a,l){t:{for(c in l){var c=!1;break t}c=!0}c||(l=ti(l),typeof r=="string"?l!=null&&encodeURIComponent(String(l)):K(r,a,l))}function H(r){ht.call(this),this.headers=new Map,this.o=r||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}b(H,ht);var nu=/^https?$/i,ru=["POST","PUT"];s=H.prototype,s.Ha=function(r){this.J=r},s.ea=function(r,a,l,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+r);a=a?a.toUpperCase():"GET",this.D=r,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():ur.g(),this.v=this.o?Ss(this.o):Ss(ur),this.g.onreadystatechange=R(this.Ea,this);try{this.B=!0,this.g.open(a,String(r),!0),this.B=!1}catch(A){ei(this,A);return}if(r=l||"",l=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var E in c)l.set(E,c[E]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const A of c.keys())l.set(A,c.get(A));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(l.keys()).find(A=>A.toLowerCase()=="content-type"),E=h.FormData&&r instanceof h.FormData,!(0<=Array.prototype.indexOf.call(ru,a,void 0))||c||E||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[A,C]of l)this.g.setRequestHeader(A,C);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{si(this),this.u=!0,this.g.send(r),this.u=!1}catch(A){ei(this,A)}};function ei(r,a){r.h=!1,r.g&&(r.j=!0,r.g.abort(),r.j=!1),r.l=a,r.m=5,ni(r),yn(r)}function ni(r){r.A||(r.A=!0,_t(r,"complete"),_t(r,"error"))}s.abort=function(r){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=r||7,_t(this,"complete"),_t(this,"abort"),yn(this))},s.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),yn(this,!0)),H.aa.N.call(this)},s.Ea=function(){this.s||(this.B||this.u||this.j?ri(this):this.bb())},s.bb=function(){ri(this)};function ri(r){if(r.h&&typeof u<"u"&&(!r.v[1]||St(r)!=4||r.Z()!=2)){if(r.u&&St(r)==4)Rs(r.Ea,0,r);else if(_t(r,"readystatechange"),St(r)==4){r.h=!1;try{const C=r.Z();t:switch(C){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var a=!0;break t;default:a=!1}var l;if(!(l=a)){var c;if(c=C===0){var E=String(r.D).match(Qs)[1]||null;!E&&h.self&&h.self.location&&(E=h.self.location.protocol.slice(0,-1)),c=!nu.test(E?E.toLowerCase():"")}l=c}if(l)_t(r,"complete"),_t(r,"success");else{r.m=6;try{var A=2<St(r)?r.g.statusText:""}catch{A=""}r.l=A+" ["+r.Z()+"]",ni(r)}}finally{yn(r)}}}}function yn(r,a){if(r.g){si(r);const l=r.g,c=r.v[0]?()=>{}:null;r.g=null,r.v=null,a||_t(r,"ready");try{l.onreadystatechange=c}catch{}}}function si(r){r.I&&(h.clearTimeout(r.I),r.I=null)}s.isActive=function(){return!!this.g};function St(r){return r.g?r.g.readyState:0}s.Z=function(){try{return 2<St(this)?this.g.status:-1}catch{return-1}},s.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},s.Oa=function(r){if(this.g){var a=this.g.responseText;return r&&a.indexOf(r)==0&&(a=a.substring(r.length)),La(a)}};function ii(r){try{if(!r.g)return null;if("response"in r.g)return r.g.response;switch(r.H){case"":case"text":return r.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in r.g)return r.g.mozResponseArrayBuffer}return null}catch{return null}}function su(r){const a={};r=(r.g&&2<=St(r)&&r.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<r.length;c++){if(Q(r[c]))continue;var l=T(r[c]);const E=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const A=a[E]||[];a[E]=A,A.push(l)}v(a,function(c){return c.join(", ")})}s.Ba=function(){return this.m},s.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Oe(r,a,l){return l&&l.internalChannelParams&&l.internalChannelParams[r]||a}function oi(r){this.Aa=0,this.i=[],this.j=new De,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Oe("failFast",!1,r),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Oe("baseRetryDelayMs",5e3,r),this.cb=Oe("retryDelaySeedMs",1e4,r),this.Wa=Oe("forwardChannelMaxRetries",2,r),this.wa=Oe("forwardChannelRequestTimeoutMs",2e4,r),this.pa=r&&r.xmlHttpFactory||void 0,this.Xa=r&&r.Tb||void 0,this.Ca=r&&r.useFetchStreams||!1,this.L=void 0,this.J=r&&r.supportsCrossDomainXhr||!1,this.K="",this.h=new Bs(r&&r.concurrentRequestLimit),this.Da=new tu,this.P=r&&r.fastHandshake||!1,this.O=r&&r.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=r&&r.Rb||!1,r&&r.xa&&this.j.xa(),r&&r.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&r&&r.detectBufferingProxy||!1,this.ja=void 0,r&&r.longPollingTimeout&&0<r.longPollingTimeout&&(this.ja=r.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}s=oi.prototype,s.la=8,s.G=1,s.connect=function(r,a,l,c){yt(0),this.W=r,this.H=a||{},l&&c!==void 0&&(this.H.OSID=l,this.H.OAID=c),this.F=this.X,this.I=mi(this,null,this.W),vn(this)};function gr(r){if(ai(r),r.G==3){var a=r.U++,l=Ct(r.I);if(K(l,"SID",r.K),K(l,"RID",a),K(l,"TYPE","terminate"),Fe(r,l),a=new kt(r,r.j,a),a.L=2,a.v=mn(Ct(l)),l=!1,h.navigator&&h.navigator.sendBeacon)try{l=h.navigator.sendBeacon(a.v.toString(),"")}catch{}!l&&h.Image&&(new Image().src=a.v,l=!0),l||(a.g=gi(a.j,null),a.g.ea(a.v)),a.F=Date.now(),fn(a)}pi(r)}function Tn(r){r.g&&(yr(r),r.g.cancel(),r.g=null)}function ai(r){Tn(r),r.u&&(h.clearTimeout(r.u),r.u=null),En(r),r.h.cancel(),r.s&&(typeof r.s=="number"&&h.clearTimeout(r.s),r.s=null)}function vn(r){if(!js(r.h)&&!r.s){r.s=!0;var a=r.Ga;Ae||vs(),we||(Ae(),we=!0),Yn.add(a,r),r.B=0}}function iu(r,a){return zs(r.h)>=r.h.j-(r.s?1:0)?!1:r.s?(r.i=a.D.concat(r.i),!0):r.G==1||r.G==2||r.B>=(r.Va?0:r.Wa)?!1:(r.s=Se(R(r.Ga,r,a),di(r,r.B)),r.B++,!0)}s.Ga=function(r){if(this.s)if(this.s=null,this.G==1){if(!r){this.U=Math.floor(1e5*Math.random()),r=this.U++;const E=new kt(this,this.j,r);let A=this.o;if(this.S&&(A?(A=p(A),y(A,this.S)):A=this.S),this.m!==null||this.O||(E.H=A,A=null),this.P)t:{for(var a=0,l=0;l<this.i.length;l++){e:{var c=this.i[l];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break e}c=void 0}if(c===void 0)break;if(a+=c,4096<a){a=l;break t}if(a===4096||l===this.i.length-1){a=l+1;break t}}a=1e3}else a=1e3;a=li(this,E,a),l=Ct(this.I),K(l,"RID",r),K(l,"CVER",22),this.D&&K(l,"X-HTTP-Session-Id",this.D),Fe(this,l),A&&(this.O?a="headers="+encodeURIComponent(String(ti(A)))+"&"+a:this.m&&mr(l,this.m,A)),pr(this.h,E),this.Ua&&K(l,"TYPE","init"),this.P?(K(l,"$req",a),K(l,"SID","null"),E.T=!0,hr(E,l,null)):hr(E,l,a),this.G=2}}else this.G==3&&(r?ui(this,r):this.i.length==0||js(this.h)||ui(this))};function ui(r,a){var l;a?l=a.l:l=r.U++;const c=Ct(r.I);K(c,"SID",r.K),K(c,"RID",l),K(c,"AID",r.T),Fe(r,c),r.m&&r.o&&mr(c,r.m,r.o),l=new kt(r,r.j,l,r.B+1),r.m===null&&(l.H=r.o),a&&(r.i=a.D.concat(r.i)),a=li(r,l,1e3),l.I=Math.round(.5*r.wa)+Math.round(.5*r.wa*Math.random()),pr(r.h,l),hr(l,c,a)}function Fe(r,a){r.H&&st(r.H,function(l,c){K(a,c,l)}),r.l&&Gs({},function(l,c){K(a,c,l)})}function li(r,a,l){l=Math.min(r.i.length,l);var c=r.l?R(r.l.Na,r.l,r):null;t:{var E=r.i;let A=-1;for(;;){const C=["count="+l];A==-1?0<l?(A=E[0].g,C.push("ofs="+A)):A=0:C.push("ofs="+A);let z=!0;for(let it=0;it<l;it++){let B=E[it].g;const ct=E[it].map;if(B-=A,0>B)A=Math.max(0,E[it].g-100),z=!1;else try{eu(ct,C,"req"+B+"_")}catch{c&&c(ct)}}if(z){c=C.join("&");break t}}}return r=r.i.splice(0,l),a.D=r,c}function hi(r){if(!r.g&&!r.u){r.Y=1;var a=r.Fa;Ae||vs(),we||(Ae(),we=!0),Yn.add(a,r),r.v=0}}function _r(r){return r.g||r.u||3<=r.v?!1:(r.Y++,r.u=Se(R(r.Fa,r),di(r,r.v)),r.v++,!0)}s.Fa=function(){if(this.u=null,ci(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var r=2*this.R;this.j.info("BP detection timer enabled: "+r),this.A=Se(R(this.ab,this),r)}},s.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,yt(10),Tn(this),ci(this))};function yr(r){r.A!=null&&(h.clearTimeout(r.A),r.A=null)}function ci(r){r.g=new kt(r,r.j,"rpc",r.Y),r.m===null&&(r.g.H=r.o),r.g.O=0;var a=Ct(r.qa);K(a,"RID","rpc"),K(a,"SID",r.K),K(a,"AID",r.T),K(a,"CI",r.F?"0":"1"),!r.F&&r.ja&&K(a,"TO",r.ja),K(a,"TYPE","xmlhttp"),Fe(r,a),r.m&&r.o&&mr(a,r.m,r.o),r.L&&(r.g.I=r.L);var l=r.g;r=r.ia,l.L=1,l.v=mn(Ct(a)),l.m=null,l.P=!0,Fs(l,r)}s.Za=function(){this.C!=null&&(this.C=null,Tn(this),_r(this),yt(19))};function En(r){r.C!=null&&(h.clearTimeout(r.C),r.C=null)}function fi(r,a){var l=null;if(r.g==a){En(r),yr(r),r.g=null;var c=2}else if(dr(r.h,a))l=a.D,Ks(r.h,a),c=1;else return;if(r.G!=0){if(a.o)if(c==1){l=a.m?a.m.length:0,a=Date.now()-a.F;var E=r.B;c=ln(),_t(c,new xs(c,l)),vn(r)}else hi(r);else if(E=a.s,E==3||E==0&&0<a.X||!(c==1&&iu(r,a)||c==2&&_r(r)))switch(l&&0<l.length&&(a=r.h,a.i=a.i.concat(l)),E){case 1:Gt(r,5);break;case 4:Gt(r,10);break;case 3:Gt(r,6);break;default:Gt(r,2)}}}function di(r,a){let l=r.Ta+Math.floor(Math.random()*r.cb);return r.isActive()||(l*=2),l*a}function Gt(r,a){if(r.j.info("Error code "+a),a==2){var l=R(r.fb,r),c=r.Xa;const E=!c;c=new $t(c||"//www.google.com/images/cleardot.gif"),h.location&&h.location.protocol=="http"||dn(c,"https"),mn(c),E?Ja(c.toString(),l):Za(c.toString(),l)}else yt(2);r.G=0,r.l&&r.l.sa(a),pi(r),ai(r)}s.fb=function(r){r?(this.j.info("Successfully pinged google.com"),yt(2)):(this.j.info("Failed to ping google.com"),yt(1))};function pi(r){if(r.G=0,r.ka=[],r.l){const a=$s(r.h);(a.length!=0||r.i.length!=0)&&(k(r.ka,a),k(r.ka,r.i),r.h.i.length=0,L(r.i),r.i.length=0),r.l.ra()}}function mi(r,a,l){var c=l instanceof $t?Ct(l):new $t(l);if(c.g!="")a&&(c.g=a+"."+c.g),pn(c,c.s);else{var E=h.location;c=E.protocol,a=a?a+"."+E.hostname:E.hostname,E=+E.port;var A=new $t(null);c&&dn(A,c),a&&(A.g=a),E&&pn(A,E),l&&(A.l=l),c=A}return l=r.D,a=r.ya,l&&a&&K(c,l,a),K(c,"VER",r.la),Fe(r,c),c}function gi(r,a,l){if(a&&!r.J)throw Error("Can't create secondary domain capable XhrIo object.");return a=r.Ca&&!r.pa?new H(new gn({eb:l})):new H(r.pa),a.Ha(r.J),a}s.isActive=function(){return!!this.l&&this.l.isActive(this)};function _i(){}s=_i.prototype,s.ua=function(){},s.ta=function(){},s.sa=function(){},s.ra=function(){},s.isActive=function(){return!0},s.Na=function(){};function In(){}In.prototype.g=function(r,a){return new Tt(r,a)};function Tt(r,a){ht.call(this),this.g=new oi(a),this.l=r,this.h=a&&a.messageUrlParams||null,r=a&&a.messageHeaders||null,a&&a.clientProtocolHeaderRequired&&(r?r["X-Client-Protocol"]="webchannel":r={"X-Client-Protocol":"webchannel"}),this.g.o=r,r=a&&a.initMessageHeaders||null,a&&a.messageContentType&&(r?r["X-WebChannel-Content-Type"]=a.messageContentType:r={"X-WebChannel-Content-Type":a.messageContentType}),a&&a.va&&(r?r["X-WebChannel-Client-Profile"]=a.va:r={"X-WebChannel-Client-Profile":a.va}),this.g.S=r,(r=a&&a.Sb)&&!Q(r)&&(this.g.m=r),this.v=a&&a.supportsCrossDomainXhr||!1,this.u=a&&a.sendRawJson||!1,(a=a&&a.httpSessionIdParam)&&!Q(a)&&(this.g.D=a,r=this.h,r!==null&&a in r&&(r=this.h,a in r&&delete r[a])),this.j=new ne(this)}b(Tt,ht),Tt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Tt.prototype.close=function(){gr(this.g)},Tt.prototype.o=function(r){var a=this.g;if(typeof r=="string"){var l={};l.__data__=r,r=l}else this.u&&(l={},l.__data__=sr(r),r=l);a.i.push(new ja(a.Ya++,r)),a.G==3&&vn(a)},Tt.prototype.N=function(){this.g.l=null,delete this.j,gr(this.g),delete this.g,Tt.aa.N.call(this)};function yi(r){or.call(this),r.__headers__&&(this.headers=r.__headers__,this.statusCode=r.__status__,delete r.__headers__,delete r.__status__);var a=r.__sm__;if(a){t:{for(const l in a){r=l;break t}r=void 0}(this.i=r)&&(r=this.i,a=a!==null&&r in a?a[r]:void 0),this.data=a}else this.data=r}b(yi,or);function Ti(){ar.call(this),this.status=1}b(Ti,ar);function ne(r){this.g=r}b(ne,_i),ne.prototype.ua=function(){_t(this.g,"a")},ne.prototype.ta=function(r){_t(this.g,new yi(r))},ne.prototype.sa=function(r){_t(this.g,new Ti)},ne.prototype.ra=function(){_t(this.g,"b")},In.prototype.createWebChannel=In.prototype.g,Tt.prototype.send=Tt.prototype.o,Tt.prototype.open=Tt.prototype.m,Tt.prototype.close=Tt.prototype.close,mo=function(){return new In},po=function(){return ln()},fo=zt,Rr={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},hn.NO_ERROR=0,hn.TIMEOUT=8,hn.HTTP_ERROR=6,Cn=hn,Ls.COMPLETE="complete",co=Ls,Ds.EventType=Ve,Ve.OPEN="a",Ve.CLOSE="b",Ve.ERROR="c",Ve.MESSAGE="d",ht.prototype.listen=ht.prototype.K,qe=Ds,H.prototype.listenOnce=H.prototype.L,H.prototype.getLastError=H.prototype.Ka,H.prototype.getLastErrorCode=H.prototype.Ba,H.prototype.getStatus=H.prototype.Z,H.prototype.getResponseJson=H.prototype.Oa,H.prototype.getResponseText=H.prototype.oa,H.prototype.send=H.prototype.ea,H.prototype.setWithCredentials=H.prototype.Ha,ho=H}).apply(typeof wn<"u"?wn:typeof self<"u"?self:typeof window<"u"?window:{});const Ii="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}pt.UNAUTHENTICATED=new pt(null),pt.GOOGLE_CREDENTIALS=new pt("google-credentials-uid"),pt.FIRST_PARTY=new pt("first-party-uid"),pt.MOCK_USER=new pt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ye="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xt=new ou("@firebase/firestore");function Ue(){return Xt.logLevel}function N(s,...t){if(Xt.logLevel<=Lt.DEBUG){const e=t.map(zr);Xt.debug(`Firestore (${ye}): ${s}`,...e)}}function Dt(s,...t){if(Xt.logLevel<=Lt.ERROR){const e=t.map(zr);Xt.error(`Firestore (${ye}): ${s}`,...e)}}function ce(s,...t){if(Xt.logLevel<=Lt.WARN){const e=t.map(zr);Xt.warn(`Firestore (${ye}): ${s}`,...e)}}function zr(s){if(typeof s=="string")return s;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(e){return JSON.stringify(e)}(s)}catch{return s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O(s="Unexpected state"){const t=`FIRESTORE (${ye}) INTERNAL ASSERTION FAILED: `+s;throw Dt(t),new Error(t)}function Y(s,t){s||O()}function U(s,t){return s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class D extends lu{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class go{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class _u{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(pt.UNAUTHENTICATED))}shutdown(){}}class yu{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class Tu{constructor(t){this.t=t,this.currentUser=pt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){Y(this.o===void 0);let n=this.i;const i=f=>this.i!==n?(n=this.i,e(f)):Promise.resolve();let o=new Ht;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new Ht,t.enqueueRetryable(()=>i(this.currentUser))};const u=()=>{const f=o;t.enqueueRetryable(async()=>{await f.promise,await i(this.currentUser)})},h=f=>{N("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=f,this.o&&(this.auth.addAuthTokenListener(this.o),u())};this.t.onInit(f=>h(f)),setTimeout(()=>{if(!this.auth){const f=this.t.getImmediate({optional:!0});f?h(f):(N("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new Ht)}},0),u()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(n=>this.i!==t?(N("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(Y(typeof n.accessToken=="string"),new go(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return Y(t===null||typeof t=="string"),new pt(t)}}class vu{constructor(t,e,n){this.l=t,this.h=e,this.P=n,this.type="FirstParty",this.user=pt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const t=this.T();return t&&this.I.set("Authorization",t),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Eu{constructor(t,e,n){this.l=t,this.h=e,this.P=n}getToken(){return Promise.resolve(new vu(this.l,this.h,this.P))}start(t,e){t.enqueueRetryable(()=>e(pt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Iu{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Au{constructor(t){this.A=t,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(t,e){Y(this.o===void 0);const n=o=>{o.error!=null&&N("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const u=o.token!==this.R;return this.R=o.token,N("FirebaseAppCheckTokenProvider",`Received ${u?"new":"existing"} token.`),u?e(o.token):Promise.resolve()};this.o=o=>{t.enqueueRetryable(()=>n(o))};const i=o=>{N("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>i(o)),setTimeout(()=>{if(!this.appCheck){const o=this.A.getImmediate({optional:!0});o?i(o):N("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(Y(typeof e.token=="string"),this.R=e.token,new Iu(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wu(s){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(s);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let n=0;n<s;n++)e[n]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=Math.floor(256/t.length)*t.length;let n="";for(;n.length<20;){const i=wu(40);for(let o=0;o<i.length;++o)n.length<20&&i[o]<e&&(n+=t.charAt(i[o]%t.length))}return n}}function j(s,t){return s<t?-1:s>t?1:0}function fe(s,t,e){return s.length===t.length&&s.every((n,i)=>e(n,t[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new D(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new D(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<-62135596800)throw new D(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new D(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}static now(){return rt.fromMillis(Date.now())}static fromDate(t){return rt.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor(1e6*(t-1e3*e));return new rt(e,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(t){return this.seconds===t.seconds?j(this.nanoseconds,t.nanoseconds):j(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const t=this.seconds- -62135596800;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(t){this.timestamp=t}static fromTimestamp(t){return new M(t)}static min(){return new M(new rt(0,0))}static max(){return new M(new rt(253402300799,999999999))}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class We{constructor(t,e,n){e===void 0?e=0:e>t.length&&O(),n===void 0?n=t.length-e:n>t.length-e&&O(),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return We.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof We?t.forEach(n=>{e.push(n)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let i=0;i<n;i++){const o=t.get(i),u=e.get(i);if(o<u)return-1;if(o>u)return 1}return t.length<e.length?-1:t.length>e.length?1:0}}class $ extends We{construct(t,e,n){return new $(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new D(V.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(i=>i.length>0))}return new $(e)}static emptyPath(){return new $([])}}const Ru=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class gt extends We{construct(t,e,n){return new gt(t,e,n)}static isValidIdentifier(t){return Ru.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),gt.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new gt(["__name__"])}static fromServerFormat(t){const e=[];let n="",i=0;const o=()=>{if(n.length===0)throw new D(V.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let u=!1;for(;i<t.length;){const h=t[i];if(h==="\\"){if(i+1===t.length)throw new D(V.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const f=t[i+1];if(f!=="\\"&&f!=="."&&f!=="`")throw new D(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=f,i+=2}else h==="`"?(u=!u,i++):h!=="."||u?(n+=h,i++):(o(),i++)}if(o(),u)throw new D(V.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new gt(e)}static emptyPath(){return new gt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x{constructor(t){this.path=t}static fromPath(t){return new x($.fromString(t))}static fromName(t){return new x($.fromString(t).popFirst(5))}static empty(){return new x($.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&$.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return $.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new x(new $(t.slice()))}}function Pu(s,t){const e=s.toTimestamp().seconds,n=s.toTimestamp().nanoseconds+1,i=M.fromTimestamp(n===1e9?new rt(e+1,0):new rt(e,n));return new Ut(i,x.empty(),t)}function Vu(s){return new Ut(s.readTime,s.key,-1)}class Ut{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new Ut(M.min(),x.empty(),-1)}static max(){return new Ut(M.max(),x.empty(),-1)}}function Cu(s,t){let e=s.readTime.compareTo(t.readTime);return e!==0?e:(e=x.comparator(s.documentKey,t.documentKey),e!==0?e:j(s.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Su="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Du{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kr(s){if(s.code!==V.FAILED_PRECONDITION||s.message!==Su)throw s;N("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&O(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new P((n,i)=>{this.nextCallback=o=>{this.wrapSuccess(t,o).next(n,i)},this.catchCallback=o=>{this.wrapFailure(e,o).next(n,i)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof P?e:P.resolve(e)}catch(e){return P.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):P.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):P.reject(e)}static resolve(t){return new P((e,n)=>{e(t)})}static reject(t){return new P((e,n)=>{n(t)})}static waitFor(t){return new P((e,n)=>{let i=0,o=0,u=!1;t.forEach(h=>{++i,h.next(()=>{++o,u&&o===i&&e()},f=>n(f))}),u=!0,o===i&&e()})}static or(t){let e=P.resolve(!1);for(const n of t)e=e.next(i=>i?P.resolve(i):n());return e}static forEach(t,e){const n=[];return t.forEach((i,o)=>{n.push(e.call(this,i,o))}),this.waitFor(n)}static mapArray(t,e){return new P((n,i)=>{const o=t.length,u=new Array(o);let h=0;for(let f=0;f<o;f++){const d=f;e(t[d]).next(_=>{u[d]=_,++h,h===o&&n(u)},_=>i(_))}})}static doWhile(t,e){return new P((n,i)=>{const o=()=>{t()===!0?e().next(()=>{o()},i):n()};o()})}}function Nu(s){const t=s.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}function Ze(s){return s.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=n=>this.ie(n),this.se=n=>e.writeSequenceNumber(n))}ie(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.se&&this.se(t),t}}$r.oe=-1;function Fn(s){return s==null}function kn(s){return s===0&&1/s==-1/0}function ku(s){return typeof s=="number"&&Number.isInteger(s)&&!kn(s)&&s<=Number.MAX_SAFE_INTEGER&&s>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ai(s){let t=0;for(const e in s)Object.prototype.hasOwnProperty.call(s,e)&&t++;return t}function tn(s,t){for(const e in s)Object.prototype.hasOwnProperty.call(s,e)&&t(e,s[e])}function yo(s){for(const t in s)if(Object.prototype.hasOwnProperty.call(s,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J{constructor(t,e){this.comparator=t,this.root=e||ot.EMPTY}insert(t,e){return new J(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,ot.BLACK,null,null))}remove(t){return new J(this.comparator,this.root.remove(t,this.comparator).copy(null,null,ot.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(n===0)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const i=this.comparator(t,n.key);if(i===0)return e+n.left.size;i<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Rn(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Rn(this.root,t,this.comparator,!1)}getReverseIterator(){return new Rn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Rn(this.root,t,this.comparator,!0)}}class Rn{constructor(t,e,n,i){this.isReverse=i,this.nodeStack=[];let o=1;for(;!t.isEmpty();)if(o=e?n(t.key,e):1,e&&i&&(o*=-1),o<0)t=this.isReverse?t.left:t.right;else{if(o===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class ot{constructor(t,e,n,i,o){this.key=t,this.value=e,this.color=n??ot.RED,this.left=i??ot.EMPTY,this.right=o??ot.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,i,o){return new ot(t??this.key,e??this.value,n??this.color,i??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let i=this;const o=n(t,i.key);return i=o<0?i.copy(null,null,null,i.left.insert(t,e,n),null):o===0?i.copy(null,e,null,null,null):i.copy(null,null,null,null,i.right.insert(t,e,n)),i.fixUp()}removeMin(){if(this.left.isEmpty())return ot.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,i=this;if(e(t,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(t,e),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),e(t,i.key)===0){if(i.right.isEmpty())return ot.EMPTY;n=i.right.min(),i=i.copy(n.key,n.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(t,e))}return i.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,ot.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,ot.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw O();const t=this.left.check();if(t!==this.right.check())throw O();return t+(this.isRed()?0:1)}}ot.EMPTY=null,ot.RED=!0,ot.BLACK=!1;ot.EMPTY=new class{constructor(){this.size=0}get key(){throw O()}get value(){throw O()}get color(){throw O()}get left(){throw O()}get right(){throw O()}copy(t,e,n,i,o){return this}insert(t,e,n){return new ot(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(t){this.comparator=t,this.data=new J(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const i=n.getNext();if(this.comparator(i.key,t[1])>=0)return;e(i.key)}}forEachWhile(t,e){let n;for(n=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new wi(this.data.getIterator())}getIteratorFrom(t){return new wi(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(n=>{e=e.add(n)}),e}isEqual(t){if(!(t instanceof at)||this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const i=e.getNext().key,o=n.getNext().key;if(this.comparator(i,o)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new at(this.comparator);return e.data=t,e}}class wi{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(t){this.fields=t,t.sort(gt.comparator)}static empty(){return new Mt([])}unionWith(t){let e=new at(gt.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new Mt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return fe(this.fields,t.fields,(e,n)=>e.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class To extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(i){try{return atob(i)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new To("Invalid base64 string: "+o):o}}(t);return new ut(e)}static fromUint8Array(t){const e=function(i){let o="";for(let u=0;u<i.length;++u)o+=String.fromCharCode(i[u]);return o}(t);return new ut(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const n=new Uint8Array(e.length);for(let i=0;i<e.length;i++)n[i]=e.charCodeAt(i);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return j(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}ut.EMPTY_BYTE_STRING=new ut("");const bu=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qt(s){if(Y(!!s),typeof s=="string"){let t=0;const e=bu.exec(s);if(Y(!!e),e[1]){let i=e[1];i=(i+"000000000").substr(0,9),t=Number(i)}const n=new Date(s);return{seconds:Math.floor(n.getTime()/1e3),nanos:t}}return{seconds:X(s.seconds),nanos:X(s.nanos)}}function X(s){return typeof s=="number"?s:typeof s=="string"?Number(s):0}function Jt(s){return typeof s=="string"?ut.fromBase64String(s):ut.fromUint8Array(s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gr(s){var t,e;return((e=(((t=s==null?void 0:s.mapValue)===null||t===void 0?void 0:t.fields)||{}).__type__)===null||e===void 0?void 0:e.stringValue)==="server_timestamp"}function Qr(s){const t=s.mapValue.fields.__previous_value__;return Gr(t)?Qr(t):t}function He(s){const t=qt(s.mapValue.fields.__local_write_time__.timestampValue);return new rt(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xu{constructor(t,e,n,i,o,u,h,f,d){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=i,this.ssl=o,this.forceLongPolling=u,this.autoDetectLongPolling=h,this.longPollingOptions=f,this.useFetchStreams=d}}class Ye{constructor(t,e){this.projectId=t,this.database=e||"(default)"}static empty(){return new Ye("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(t){return t instanceof Ye&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pn={mapValue:{}};function Zt(s){return"nullValue"in s?0:"booleanValue"in s?1:"integerValue"in s||"doubleValue"in s?2:"timestampValue"in s?3:"stringValue"in s?5:"bytesValue"in s?6:"referenceValue"in s?7:"geoPointValue"in s?8:"arrayValue"in s?9:"mapValue"in s?Gr(s)?4:Mu(s)?9007199254740991:Lu(s)?10:11:O()}function Rt(s,t){if(s===t)return!0;const e=Zt(s);if(e!==Zt(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return s.booleanValue===t.booleanValue;case 4:return He(s).isEqual(He(t));case 3:return function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const u=qt(i.timestampValue),h=qt(o.timestampValue);return u.seconds===h.seconds&&u.nanos===h.nanos}(s,t);case 5:return s.stringValue===t.stringValue;case 6:return function(i,o){return Jt(i.bytesValue).isEqual(Jt(o.bytesValue))}(s,t);case 7:return s.referenceValue===t.referenceValue;case 8:return function(i,o){return X(i.geoPointValue.latitude)===X(o.geoPointValue.latitude)&&X(i.geoPointValue.longitude)===X(o.geoPointValue.longitude)}(s,t);case 2:return function(i,o){if("integerValue"in i&&"integerValue"in o)return X(i.integerValue)===X(o.integerValue);if("doubleValue"in i&&"doubleValue"in o){const u=X(i.doubleValue),h=X(o.doubleValue);return u===h?kn(u)===kn(h):isNaN(u)&&isNaN(h)}return!1}(s,t);case 9:return fe(s.arrayValue.values||[],t.arrayValue.values||[],Rt);case 10:case 11:return function(i,o){const u=i.mapValue.fields||{},h=o.mapValue.fields||{};if(Ai(u)!==Ai(h))return!1;for(const f in u)if(u.hasOwnProperty(f)&&(h[f]===void 0||!Rt(u[f],h[f])))return!1;return!0}(s,t);default:return O()}}function Xe(s,t){return(s.values||[]).find(e=>Rt(e,t))!==void 0}function de(s,t){if(s===t)return 0;const e=Zt(s),n=Zt(t);if(e!==n)return j(e,n);switch(e){case 0:case 9007199254740991:return 0;case 1:return j(s.booleanValue,t.booleanValue);case 2:return function(o,u){const h=X(o.integerValue||o.doubleValue),f=X(u.integerValue||u.doubleValue);return h<f?-1:h>f?1:h===f?0:isNaN(h)?isNaN(f)?0:-1:1}(s,t);case 3:return Ri(s.timestampValue,t.timestampValue);case 4:return Ri(He(s),He(t));case 5:return j(s.stringValue,t.stringValue);case 6:return function(o,u){const h=Jt(o),f=Jt(u);return h.compareTo(f)}(s.bytesValue,t.bytesValue);case 7:return function(o,u){const h=o.split("/"),f=u.split("/");for(let d=0;d<h.length&&d<f.length;d++){const _=j(h[d],f[d]);if(_!==0)return _}return j(h.length,f.length)}(s.referenceValue,t.referenceValue);case 8:return function(o,u){const h=j(X(o.latitude),X(u.latitude));return h!==0?h:j(X(o.longitude),X(u.longitude))}(s.geoPointValue,t.geoPointValue);case 9:return Pi(s.arrayValue,t.arrayValue);case 10:return function(o,u){var h,f,d,_;const w=o.fields||{},R=u.fields||{},S=(h=w.value)===null||h===void 0?void 0:h.arrayValue,b=(f=R.value)===null||f===void 0?void 0:f.arrayValue,L=j(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((_=b==null?void 0:b.values)===null||_===void 0?void 0:_.length)||0);return L!==0?L:Pi(S,b)}(s.mapValue,t.mapValue);case 11:return function(o,u){if(o===Pn.mapValue&&u===Pn.mapValue)return 0;if(o===Pn.mapValue)return 1;if(u===Pn.mapValue)return-1;const h=o.fields||{},f=Object.keys(h),d=u.fields||{},_=Object.keys(d);f.sort(),_.sort();for(let w=0;w<f.length&&w<_.length;++w){const R=j(f[w],_[w]);if(R!==0)return R;const S=de(h[f[w]],d[_[w]]);if(S!==0)return S}return j(f.length,_.length)}(s.mapValue,t.mapValue);default:throw O()}}function Ri(s,t){if(typeof s=="string"&&typeof t=="string"&&s.length===t.length)return j(s,t);const e=qt(s),n=qt(t),i=j(e.seconds,n.seconds);return i!==0?i:j(e.nanos,n.nanos)}function Pi(s,t){const e=s.values||[],n=t.values||[];for(let i=0;i<e.length&&i<n.length;++i){const o=de(e[i],n[i]);if(o)return o}return j(e.length,n.length)}function pe(s){return Pr(s)}function Pr(s){return"nullValue"in s?"null":"booleanValue"in s?""+s.booleanValue:"integerValue"in s?""+s.integerValue:"doubleValue"in s?""+s.doubleValue:"timestampValue"in s?function(e){const n=qt(e);return`time(${n.seconds},${n.nanos})`}(s.timestampValue):"stringValue"in s?s.stringValue:"bytesValue"in s?function(e){return Jt(e).toBase64()}(s.bytesValue):"referenceValue"in s?function(e){return x.fromName(e).toString()}(s.referenceValue):"geoPointValue"in s?function(e){return`geo(${e.latitude},${e.longitude})`}(s.geoPointValue):"arrayValue"in s?function(e){let n="[",i=!0;for(const o of e.values||[])i?i=!1:n+=",",n+=Pr(o);return n+"]"}(s.arrayValue):"mapValue"in s?function(e){const n=Object.keys(e.fields||{}).sort();let i="{",o=!0;for(const u of n)o?o=!1:i+=",",i+=`${u}:${Pr(e.fields[u])}`;return i+"}"}(s.mapValue):O()}function Vi(s,t){return{referenceValue:`projects/${s.projectId}/databases/${s.database}/documents/${t.path.canonicalString()}`}}function Vr(s){return!!s&&"integerValue"in s}function Wr(s){return!!s&&"arrayValue"in s}function Ci(s){return!!s&&"nullValue"in s}function Si(s){return!!s&&"doubleValue"in s&&isNaN(Number(s.doubleValue))}function vr(s){return!!s&&"mapValue"in s}function Lu(s){var t,e;return((e=(((t=s==null?void 0:s.mapValue)===null||t===void 0?void 0:t.fields)||{}).__type__)===null||e===void 0?void 0:e.stringValue)==="__vector__"}function Ke(s){if(s.geoPointValue)return{geoPointValue:Object.assign({},s.geoPointValue)};if(s.timestampValue&&typeof s.timestampValue=="object")return{timestampValue:Object.assign({},s.timestampValue)};if(s.mapValue){const t={mapValue:{fields:{}}};return tn(s.mapValue.fields,(e,n)=>t.mapValue.fields[e]=Ke(n)),t}if(s.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(s.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=Ke(s.arrayValue.values[e]);return t}return Object.assign({},s)}function Mu(s){return(((s.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(t){this.value=t}static empty(){return new At({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!vr(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=Ke(e)}setAll(t){let e=gt.emptyPath(),n={},i=[];t.forEach((u,h)=>{if(!e.isImmediateParentOf(h)){const f=this.getFieldsMap(e);this.applyChanges(f,n,i),n={},i=[],e=h.popLast()}u?n[h.lastSegment()]=Ke(u):i.push(h.lastSegment())});const o=this.getFieldsMap(e);this.applyChanges(o,n,i)}delete(t){const e=this.field(t.popLast());vr(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Rt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let i=e.mapValue.fields[t.get(n)];vr(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=i),e=i}return e.mapValue.fields}applyChanges(t,e,n){tn(e,(i,o)=>t[i]=o);for(const i of n)delete t[i]}clone(){return new At(Ke(this.value))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(t,e,n,i,o,u,h){this.key=t,this.documentType=e,this.version=n,this.readTime=i,this.createTime=o,this.data=u,this.documentState=h}static newInvalidDocument(t){return new mt(t,0,M.min(),M.min(),M.min(),At.empty(),0)}static newFoundDocument(t,e,n,i){return new mt(t,1,e,M.min(),n,i,0)}static newNoDocument(t,e){return new mt(t,2,e,M.min(),M.min(),At.empty(),0)}static newUnknownDocument(t,e){return new mt(t,3,e,M.min(),M.min(),At.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(M.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=At.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=At.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=M.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof mt&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new mt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bn{constructor(t,e){this.position=t,this.inclusive=e}}function Di(s,t,e){let n=0;for(let i=0;i<s.position.length;i++){const o=t[i],u=s.position[i];if(o.field.isKeyField()?n=x.comparator(x.fromName(u.referenceValue),e.key):n=de(u,e.data.field(o.field)),o.dir==="desc"&&(n*=-1),n!==0)break}return n}function Ni(s,t){if(s===null)return t===null;if(t===null||s.inclusive!==t.inclusive||s.position.length!==t.position.length)return!1;for(let e=0;e<s.position.length;e++)if(!Rt(s.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(t,e="asc"){this.field=t,this.dir=e}}function Ou(s,t){return s.dir===t.dir&&s.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{}class tt extends vo{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,n):new Uu(t,e,n):e==="array-contains"?new ju(t,n):e==="in"?new zu(t,n):e==="not-in"?new Ku(t,n):e==="array-contains-any"?new $u(t,n):new tt(t,e,n)}static createKeyFieldInFilter(t,e,n){return e==="in"?new qu(t,n):new Bu(t,n)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&this.matchesComparison(de(e,this.value)):e!==null&&Zt(this.value)===Zt(e)&&this.matchesComparison(de(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return O()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class It extends vo{constructor(t,e){super(),this.filters=t,this.op=e,this.ae=null}static create(t,e){return new It(t,e)}matches(t){return Eo(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Eo(s){return s.op==="and"}function Io(s){return Fu(s)&&Eo(s)}function Fu(s){for(const t of s.filters)if(t instanceof It)return!1;return!0}function Cr(s){if(s instanceof tt)return s.field.canonicalString()+s.op.toString()+pe(s.value);if(Io(s))return s.filters.map(t=>Cr(t)).join(",");{const t=s.filters.map(e=>Cr(e)).join(",");return`${s.op}(${t})`}}function Ao(s,t){return s instanceof tt?function(n,i){return i instanceof tt&&n.op===i.op&&n.field.isEqual(i.field)&&Rt(n.value,i.value)}(s,t):s instanceof It?function(n,i){return i instanceof It&&n.op===i.op&&n.filters.length===i.filters.length?n.filters.reduce((o,u,h)=>o&&Ao(u,i.filters[h]),!0):!1}(s,t):void O()}function wo(s){return s instanceof tt?function(e){return`${e.field.canonicalString()} ${e.op} ${pe(e.value)}`}(s):s instanceof It?function(e){return e.op.toString()+" {"+e.getFilters().map(wo).join(" ,")+"}"}(s):"Filter"}class Uu extends tt{constructor(t,e,n){super(t,e,n),this.key=x.fromName(n.referenceValue)}matches(t){const e=x.comparator(t.key,this.key);return this.matchesComparison(e)}}class qu extends tt{constructor(t,e){super(t,"in",e),this.keys=Ro("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Bu extends tt{constructor(t,e){super(t,"not-in",e),this.keys=Ro("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Ro(s,t){var e;return(((e=t.arrayValue)===null||e===void 0?void 0:e.values)||[]).map(n=>x.fromName(n.referenceValue))}class ju extends tt{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Wr(e)&&Xe(e.arrayValue,this.value)}}class zu extends tt{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&Xe(this.value.arrayValue,e)}}class Ku extends tt{constructor(t,e){super(t,"not-in",e)}matches(t){if(Xe(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&!Xe(this.value.arrayValue,e)}}class $u extends tt{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Wr(e)||!e.arrayValue.values)&&e.arrayValue.values.some(n=>Xe(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gu{constructor(t,e=null,n=[],i=[],o=null,u=null,h=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=i,this.limit=o,this.startAt=u,this.endAt=h,this.ue=null}}function ki(s,t=null,e=[],n=[],i=null,o=null,u=null){return new Gu(s,t,e,n,i,o,u)}function Hr(s){const t=U(s);if(t.ue===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(n=>Cr(n)).join(","),e+="|ob:",e+=t.orderBy.map(n=>function(o){return o.field.canonicalString()+o.dir}(n)).join(","),Fn(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(n=>pe(n)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(n=>pe(n)).join(",")),t.ue=e}return t.ue}function Yr(s,t){if(s.limit!==t.limit||s.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<s.orderBy.length;e++)if(!Ou(s.orderBy[e],t.orderBy[e]))return!1;if(s.filters.length!==t.filters.length)return!1;for(let e=0;e<s.filters.length;e++)if(!Ao(s.filters[e],t.filters[e]))return!1;return s.collectionGroup===t.collectionGroup&&!!s.path.isEqual(t.path)&&!!Ni(s.startAt,t.startAt)&&Ni(s.endAt,t.endAt)}function Sr(s){return x.isDocumentKey(s.path)&&s.collectionGroup===null&&s.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{constructor(t,e=null,n=[],i=[],o=null,u="F",h=null,f=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=i,this.limit=o,this.limitType=u,this.startAt=h,this.endAt=f,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function Qu(s,t,e,n,i,o,u,h){return new Te(s,t,e,n,i,o,u,h)}function Xr(s){return new Te(s)}function bi(s){return s.filters.length===0&&s.limit===null&&s.startAt==null&&s.endAt==null&&(s.explicitOrderBy.length===0||s.explicitOrderBy.length===1&&s.explicitOrderBy[0].field.isKeyField())}function Po(s){return s.collectionGroup!==null}function $e(s){const t=U(s);if(t.ce===null){t.ce=[];const e=new Set;for(const o of t.explicitOrderBy)t.ce.push(o),e.add(o.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(u){let h=new at(gt.comparator);return u.filters.forEach(f=>{f.getFlattenedFilters().forEach(d=>{d.isInequality()&&(h=h.add(d.field))})}),h})(t).forEach(o=>{e.has(o.canonicalString())||o.isKeyField()||t.ce.push(new Je(o,n))}),e.has(gt.keyField().canonicalString())||t.ce.push(new Je(gt.keyField(),n))}return t.ce}function wt(s){const t=U(s);return t.le||(t.le=Wu(t,$e(s))),t.le}function Wu(s,t){if(s.limitType==="F")return ki(s.path,s.collectionGroup,t,s.filters,s.limit,s.startAt,s.endAt);{t=t.map(i=>{const o=i.dir==="desc"?"asc":"desc";return new Je(i.field,o)});const e=s.endAt?new bn(s.endAt.position,s.endAt.inclusive):null,n=s.startAt?new bn(s.startAt.position,s.startAt.inclusive):null;return ki(s.path,s.collectionGroup,t,s.filters,s.limit,e,n)}}function Dr(s,t){const e=s.filters.concat([t]);return new Te(s.path,s.collectionGroup,s.explicitOrderBy.slice(),e,s.limit,s.limitType,s.startAt,s.endAt)}function Nr(s,t,e){return new Te(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),t,e,s.startAt,s.endAt)}function Un(s,t){return Yr(wt(s),wt(t))&&s.limitType===t.limitType}function Vo(s){return`${Hr(wt(s))}|lt:${s.limitType}`}function se(s){return`Query(target=${function(e){let n=e.path.canonicalString();return e.collectionGroup!==null&&(n+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(n+=`, filters: [${e.filters.map(i=>wo(i)).join(", ")}]`),Fn(e.limit)||(n+=", limit: "+e.limit),e.orderBy.length>0&&(n+=`, orderBy: [${e.orderBy.map(i=>function(u){return`${u.field.canonicalString()} (${u.dir})`}(i)).join(", ")}]`),e.startAt&&(n+=", startAt: ",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(i=>pe(i)).join(",")),e.endAt&&(n+=", endAt: ",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(i=>pe(i)).join(",")),`Target(${n})`}(wt(s))}; limitType=${s.limitType})`}function qn(s,t){return t.isFoundDocument()&&function(n,i){const o=i.key.path;return n.collectionGroup!==null?i.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(o):x.isDocumentKey(n.path)?n.path.isEqual(o):n.path.isImmediateParentOf(o)}(s,t)&&function(n,i){for(const o of $e(n))if(!o.field.isKeyField()&&i.data.field(o.field)===null)return!1;return!0}(s,t)&&function(n,i){for(const o of n.filters)if(!o.matches(i))return!1;return!0}(s,t)&&function(n,i){return!(n.startAt&&!function(u,h,f){const d=Di(u,h,f);return u.inclusive?d<=0:d<0}(n.startAt,$e(n),i)||n.endAt&&!function(u,h,f){const d=Di(u,h,f);return u.inclusive?d>=0:d>0}(n.endAt,$e(n),i))}(s,t)}function Hu(s){return s.collectionGroup||(s.path.length%2==1?s.path.lastSegment():s.path.get(s.path.length-2))}function Co(s){return(t,e)=>{let n=!1;for(const i of $e(s)){const o=Yu(i,t,e);if(o!==0)return o;n=n||i.field.isKeyField()}return 0}}function Yu(s,t,e){const n=s.field.isKeyField()?x.comparator(t.key,e.key):function(o,u,h){const f=u.data.field(o),d=h.data.field(o);return f!==null&&d!==null?de(f,d):O()}(s.field,t,e);switch(s.dir){case"asc":return n;case"desc":return-1*n;default:return O()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n!==void 0){for(const[i,o]of n)if(this.equalsFn(i,t))return o}}has(t){return this.get(t)!==void 0}set(t,e){const n=this.mapKeyFn(t),i=this.inner[n];if(i===void 0)return this.inner[n]=[[t,e]],void this.innerSize++;for(let o=0;o<i.length;o++)if(this.equalsFn(i[o][0],t))return void(i[o]=[t,e]);i.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n===void 0)return!1;for(let i=0;i<n.length;i++)if(this.equalsFn(n[i][0],t))return n.length===1?delete this.inner[e]:n.splice(i,1),this.innerSize--,!0;return!1}forEach(t){tn(this.inner,(e,n)=>{for(const[i,o]of n)t(i,o)})}isEmpty(){return yo(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xu=new J(x.comparator);function Bt(){return Xu}const So=new J(x.comparator);function Be(...s){let t=So;for(const e of s)t=t.insert(e.key,e);return t}function Ju(s){let t=So;return s.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function Qt(){return Ge()}function Do(){return Ge()}function Ge(){return new ve(s=>s.toString(),(s,t)=>s.isEqual(t))}const Zu=new at(x.comparator);function q(...s){let t=Zu;for(const e of s)t=t.add(e);return t}const tl=new at(j);function el(){return tl}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jr(s,t){if(s.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:kn(t)?"-0":t}}function No(s){return{integerValue:""+s}}function nl(s,t){return ku(t)?No(t):Jr(s,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bn{constructor(){this._=void 0}}function rl(s,t,e){return s instanceof kr?function(i,o){const u={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return o&&Gr(o)&&(o=Qr(o)),o&&(u.fields.__previous_value__=o),{mapValue:u}}(e,t):s instanceof xn?ko(s,t):s instanceof Ln?bo(s,t):function(i,o){const u=il(i,o),h=xi(u)+xi(i.Pe);return Vr(u)&&Vr(i.Pe)?No(h):Jr(i.serializer,h)}(s,t)}function sl(s,t,e){return s instanceof xn?ko(s,t):s instanceof Ln?bo(s,t):e}function il(s,t){return s instanceof br?function(n){return Vr(n)||function(o){return!!o&&"doubleValue"in o}(n)}(t)?t:{integerValue:0}:null}class kr extends Bn{}class xn extends Bn{constructor(t){super(),this.elements=t}}function ko(s,t){const e=xo(t);for(const n of s.elements)e.some(i=>Rt(i,n))||e.push(n);return{arrayValue:{values:e}}}class Ln extends Bn{constructor(t){super(),this.elements=t}}function bo(s,t){let e=xo(t);for(const n of s.elements)e=e.filter(i=>!Rt(i,n));return{arrayValue:{values:e}}}class br extends Bn{constructor(t,e){super(),this.serializer=t,this.Pe=e}}function xi(s){return X(s.integerValue||s.doubleValue)}function xo(s){return Wr(s)&&s.arrayValue.values?s.arrayValue.values.slice():[]}function ol(s,t){return s.field.isEqual(t.field)&&function(n,i){return n instanceof xn&&i instanceof xn||n instanceof Ln&&i instanceof Ln?fe(n.elements,i.elements,Rt):n instanceof br&&i instanceof br?Rt(n.Pe,i.Pe):n instanceof kr&&i instanceof kr}(s.transform,t.transform)}class Yt{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new Yt}static exists(t){return new Yt(void 0,t)}static updateTime(t){return new Yt(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Sn(s,t){return s.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(s.updateTime):s.exists===void 0||s.exists===t.isFoundDocument()}class Zr{}function Lo(s,t){if(!s.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return s.isNoDocument()?new ul(s.key,Yt.none()):new ts(s.key,s.data,Yt.none());{const e=s.data,n=At.empty();let i=new at(gt.comparator);for(let o of t.fields)if(!i.has(o)){let u=e.field(o);u===null&&o.length>1&&(o=o.popLast(),u=e.field(o)),u===null?n.delete(o):n.set(o,u),i=i.add(o)}return new jn(s.key,n,new Mt(i.toArray()),Yt.none())}}function al(s,t,e){s instanceof ts?function(i,o,u){const h=i.value.clone(),f=Mi(i.fieldTransforms,o,u.transformResults);h.setAll(f),o.convertToFoundDocument(u.version,h).setHasCommittedMutations()}(s,t,e):s instanceof jn?function(i,o,u){if(!Sn(i.precondition,o))return void o.convertToUnknownDocument(u.version);const h=Mi(i.fieldTransforms,o,u.transformResults),f=o.data;f.setAll(Mo(i)),f.setAll(h),o.convertToFoundDocument(u.version,f).setHasCommittedMutations()}(s,t,e):function(i,o,u){o.convertToNoDocument(u.version).setHasCommittedMutations()}(0,t,e)}function Qe(s,t,e,n){return s instanceof ts?function(o,u,h,f){if(!Sn(o.precondition,u))return h;const d=o.value.clone(),_=Oi(o.fieldTransforms,f,u);return d.setAll(_),u.convertToFoundDocument(u.version,d).setHasLocalMutations(),null}(s,t,e,n):s instanceof jn?function(o,u,h,f){if(!Sn(o.precondition,u))return h;const d=Oi(o.fieldTransforms,f,u),_=u.data;return _.setAll(Mo(o)),_.setAll(d),u.convertToFoundDocument(u.version,_).setHasLocalMutations(),h===null?null:h.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(w=>w.field))}(s,t,e,n):function(o,u,h){return Sn(o.precondition,u)?(u.convertToNoDocument(u.version).setHasLocalMutations(),null):h}(s,t,e)}function Li(s,t){return s.type===t.type&&!!s.key.isEqual(t.key)&&!!s.precondition.isEqual(t.precondition)&&!!function(n,i){return n===void 0&&i===void 0||!(!n||!i)&&fe(n,i,(o,u)=>ol(o,u))}(s.fieldTransforms,t.fieldTransforms)&&(s.type===0?s.value.isEqual(t.value):s.type!==1||s.data.isEqual(t.data)&&s.fieldMask.isEqual(t.fieldMask))}class ts extends Zr{constructor(t,e,n,i=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class jn extends Zr{constructor(t,e,n,i,o=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=i,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Mo(s){const t=new Map;return s.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const n=s.data.field(e);t.set(e,n)}}),t}function Mi(s,t,e){const n=new Map;Y(s.length===e.length);for(let i=0;i<e.length;i++){const o=s[i],u=o.transform,h=t.data.field(o.field);n.set(o.field,sl(u,h,e[i]))}return n}function Oi(s,t,e){const n=new Map;for(const i of s){const o=i.transform,u=e.data.field(i.field);n.set(i.field,rl(o,u,t))}return n}class ul extends Zr{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ll{constructor(t,e,n,i){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=i}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let i=0;i<this.mutations.length;i++){const o=this.mutations[i];o.key.isEqual(t.key)&&al(o,t,n[i])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=Qe(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=Qe(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=Do();return this.mutations.forEach(i=>{const o=t.get(i.key),u=o.overlayedDocument;let h=this.applyToLocalView(u,o.mutatedFields);h=e.has(i.key)?null:h;const f=Lo(u,h);f!==null&&n.set(i.key,f),u.isValidDocument()||u.convertToNoDocument(M.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),q())}isEqual(t){return this.batchId===t.batchId&&fe(this.mutations,t.mutations,(e,n)=>Li(e,n))&&fe(this.baseMutations,t.baseMutations,(e,n)=>Li(e,n))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hl{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cl{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Z,F;function Oo(s){if(s===void 0)return Dt("GRPC error has no .code"),V.UNKNOWN;switch(s){case Z.OK:return V.OK;case Z.CANCELLED:return V.CANCELLED;case Z.UNKNOWN:return V.UNKNOWN;case Z.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case Z.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case Z.INTERNAL:return V.INTERNAL;case Z.UNAVAILABLE:return V.UNAVAILABLE;case Z.UNAUTHENTICATED:return V.UNAUTHENTICATED;case Z.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case Z.NOT_FOUND:return V.NOT_FOUND;case Z.ALREADY_EXISTS:return V.ALREADY_EXISTS;case Z.PERMISSION_DENIED:return V.PERMISSION_DENIED;case Z.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case Z.ABORTED:return V.ABORTED;case Z.OUT_OF_RANGE:return V.OUT_OF_RANGE;case Z.UNIMPLEMENTED:return V.UNIMPLEMENTED;case Z.DATA_LOSS:return V.DATA_LOSS;default:return O()}}(F=Z||(Z={}))[F.OK=0]="OK",F[F.CANCELLED=1]="CANCELLED",F[F.UNKNOWN=2]="UNKNOWN",F[F.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",F[F.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",F[F.NOT_FOUND=5]="NOT_FOUND",F[F.ALREADY_EXISTS=6]="ALREADY_EXISTS",F[F.PERMISSION_DENIED=7]="PERMISSION_DENIED",F[F.UNAUTHENTICATED=16]="UNAUTHENTICATED",F[F.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",F[F.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",F[F.ABORTED=10]="ABORTED",F[F.OUT_OF_RANGE=11]="OUT_OF_RANGE",F[F.UNIMPLEMENTED=12]="UNIMPLEMENTED",F[F.INTERNAL=13]="INTERNAL",F[F.UNAVAILABLE=14]="UNAVAILABLE",F[F.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fl(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dl=new Wt([4294967295,4294967295],0);function Fi(s){const t=fl().encode(s),e=new lo;return e.update(t),new Uint8Array(e.digest())}function Ui(s){const t=new DataView(s.buffer),e=t.getUint32(0,!0),n=t.getUint32(4,!0),i=t.getUint32(8,!0),o=t.getUint32(12,!0);return[new Wt([e,n],0),new Wt([i,o],0)]}class es{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new je(`Invalid padding: ${e}`);if(n<0)throw new je(`Invalid hash count: ${n}`);if(t.length>0&&this.hashCount===0)throw new je(`Invalid hash count: ${n}`);if(t.length===0&&e!==0)throw new je(`Invalid padding when bitmap length is 0: ${e}`);this.Ie=8*t.length-e,this.Te=Wt.fromNumber(this.Ie)}Ee(t,e,n){let i=t.add(e.multiply(Wt.fromNumber(n)));return i.compare(dl)===1&&(i=new Wt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(t){return(this.bitmap[Math.floor(t/8)]&1<<t%8)!=0}mightContain(t){if(this.Ie===0)return!1;const e=Fi(t),[n,i]=Ui(e);for(let o=0;o<this.hashCount;o++){const u=this.Ee(n,i,o);if(!this.de(u))return!1}return!0}static create(t,e,n){const i=t%8==0?0:8-t%8,o=new Uint8Array(Math.ceil(t/8)),u=new es(o,i,e);return n.forEach(h=>u.insert(h)),u}insert(t){if(this.Ie===0)return;const e=Fi(t),[n,i]=Ui(e);for(let o=0;o<this.hashCount;o++){const u=this.Ee(n,i,o);this.Ae(u)}}Ae(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class je extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn{constructor(t,e,n,i,o){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const i=new Map;return i.set(t,en.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new zn(M.min(),i,new J(j),Bt(),q())}}class en{constructor(t,e,n,i,o){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=i,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new en(n,e,q(),q(),q())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(t,e,n,i){this.Re=t,this.removedTargetIds=e,this.key=n,this.Ve=i}}class Fo{constructor(t,e){this.targetId=t,this.me=e}}class Uo{constructor(t,e,n=ut.EMPTY_BYTE_STRING,i=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=i}}class qi{constructor(){this.fe=0,this.ge=ji(),this.pe=ut.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(t){t.approximateByteSize()>0&&(this.we=!0,this.pe=t)}ve(){let t=q(),e=q(),n=q();return this.ge.forEach((i,o)=>{switch(o){case 0:t=t.add(i);break;case 2:e=e.add(i);break;case 1:n=n.add(i);break;default:O()}}),new en(this.pe,this.ye,t,e,n)}Ce(){this.we=!1,this.ge=ji()}Fe(t,e){this.we=!0,this.ge=this.ge.insert(t,e)}Me(t){this.we=!0,this.ge=this.ge.remove(t)}xe(){this.fe+=1}Oe(){this.fe-=1,Y(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class pl{constructor(t){this.Le=t,this.Be=new Map,this.ke=Bt(),this.qe=Bi(),this.Qe=new J(j)}Ke(t){for(const e of t.Re)t.Ve&&t.Ve.isFoundDocument()?this.$e(e,t.Ve):this.Ue(e,t.key,t.Ve);for(const e of t.removedTargetIds)this.Ue(e,t.key,t.Ve)}We(t){this.forEachTarget(t,e=>{const n=this.Ge(e);switch(t.state){case 0:this.ze(e)&&n.De(t.resumeToken);break;case 1:n.Oe(),n.Se||n.Ce(),n.De(t.resumeToken);break;case 2:n.Oe(),n.Se||this.removeTarget(e);break;case 3:this.ze(e)&&(n.Ne(),n.De(t.resumeToken));break;case 4:this.ze(e)&&(this.je(e),n.De(t.resumeToken));break;default:O()}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.Be.forEach((n,i)=>{this.ze(i)&&e(i)})}He(t){const e=t.targetId,n=t.me.count,i=this.Je(e);if(i){const o=i.target;if(Sr(o))if(n===0){const u=new x(o.path);this.Ue(e,u,mt.newNoDocument(u,M.min()))}else Y(n===1);else{const u=this.Ye(e);if(u!==n){const h=this.Ze(t),f=h?this.Xe(h,t,u):1;if(f!==0){this.je(e);const d=f===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(e,d)}}}}}Ze(t){const e=t.me.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:i=0},hashCount:o=0}=e;let u,h;try{u=Jt(n).toUint8Array()}catch(f){if(f instanceof To)return ce("Decoding the base64 bloom filter in existence filter failed ("+f.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw f}try{h=new es(u,i,o)}catch(f){return ce(f instanceof je?"BloomFilter error: ":"Applying bloom filter failed: ",f),null}return h.Ie===0?null:h}Xe(t,e,n){return e.me.count===n-this.nt(t,e.targetId)?0:2}nt(t,e){const n=this.Le.getRemoteKeysForTarget(e);let i=0;return n.forEach(o=>{const u=this.Le.tt(),h=`projects/${u.projectId}/databases/${u.database}/documents/${o.path.canonicalString()}`;t.mightContain(h)||(this.Ue(e,o,null),i++)}),i}rt(t){const e=new Map;this.Be.forEach((o,u)=>{const h=this.Je(u);if(h){if(o.current&&Sr(h.target)){const f=new x(h.target.path);this.ke.get(f)!==null||this.it(u,f)||this.Ue(u,f,mt.newNoDocument(f,t))}o.be&&(e.set(u,o.ve()),o.Ce())}});let n=q();this.qe.forEach((o,u)=>{let h=!0;u.forEachWhile(f=>{const d=this.Je(f);return!d||d.purpose==="TargetPurposeLimboResolution"||(h=!1,!1)}),h&&(n=n.add(o))}),this.ke.forEach((o,u)=>u.setReadTime(t));const i=new zn(t,e,this.Qe,this.ke,n);return this.ke=Bt(),this.qe=Bi(),this.Qe=new J(j),i}$e(t,e){if(!this.ze(t))return;const n=this.it(t,e.key)?2:0;this.Ge(t).Fe(e.key,n),this.ke=this.ke.insert(e.key,e),this.qe=this.qe.insert(e.key,this.st(e.key).add(t))}Ue(t,e,n){if(!this.ze(t))return;const i=this.Ge(t);this.it(t,e)?i.Fe(e,1):i.Me(e),this.qe=this.qe.insert(e,this.st(e).delete(t)),n&&(this.ke=this.ke.insert(e,n))}removeTarget(t){this.Be.delete(t)}Ye(t){const e=this.Ge(t).ve();return this.Le.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}xe(t){this.Ge(t).xe()}Ge(t){let e=this.Be.get(t);return e||(e=new qi,this.Be.set(t,e)),e}st(t){let e=this.qe.get(t);return e||(e=new at(j),this.qe=this.qe.insert(t,e)),e}ze(t){const e=this.Je(t)!==null;return e||N("WatchChangeAggregator","Detected inactive target",t),e}Je(t){const e=this.Be.get(t);return e&&e.Se?null:this.Le.ot(t)}je(t){this.Be.set(t,new qi),this.Le.getRemoteKeysForTarget(t).forEach(e=>{this.Ue(t,e,null)})}it(t,e){return this.Le.getRemoteKeysForTarget(t).has(e)}}function Bi(){return new J(x.comparator)}function ji(){return new J(x.comparator)}const ml={asc:"ASCENDING",desc:"DESCENDING"},gl={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},_l={and:"AND",or:"OR"};class yl{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function xr(s,t){return s.useProto3Json||Fn(t)?t:{value:t}}function Lr(s,t){return s.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function qo(s,t){return s.useProto3Json?t.toBase64():t.toUint8Array()}function ae(s){return Y(!!s),M.fromTimestamp(function(e){const n=qt(e);return new rt(n.seconds,n.nanos)}(s))}function Bo(s,t){return Mr(s,t).canonicalString()}function Mr(s,t){const e=function(i){return new $(["projects",i.projectId,"databases",i.database])}(s).child("documents");return t===void 0?e:e.child(t)}function jo(s){const t=$.fromString(s);return Y(Qo(t)),t}function Er(s,t){const e=jo(t);if(e.get(1)!==s.databaseId.projectId)throw new D(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+s.databaseId.projectId);if(e.get(3)!==s.databaseId.database)throw new D(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+s.databaseId.database);return new x(Ko(e))}function zo(s,t){return Bo(s.databaseId,t)}function Tl(s){const t=jo(s);return t.length===4?$.emptyPath():Ko(t)}function zi(s){return new $(["projects",s.databaseId.projectId,"databases",s.databaseId.database]).canonicalString()}function Ko(s){return Y(s.length>4&&s.get(4)==="documents"),s.popFirst(5)}function vl(s,t){let e;if("targetChange"in t){t.targetChange;const n=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:O()}(t.targetChange.targetChangeType||"NO_CHANGE"),i=t.targetChange.targetIds||[],o=function(d,_){return d.useProto3Json?(Y(_===void 0||typeof _=="string"),ut.fromBase64String(_||"")):(Y(_===void 0||_ instanceof Buffer||_ instanceof Uint8Array),ut.fromUint8Array(_||new Uint8Array))}(s,t.targetChange.resumeToken),u=t.targetChange.cause,h=u&&function(d){const _=d.code===void 0?V.UNKNOWN:Oo(d.code);return new D(_,d.message||"")}(u);e=new Uo(n,i,o,h||null)}else if("documentChange"in t){t.documentChange;const n=t.documentChange;n.document,n.document.name,n.document.updateTime;const i=Er(s,n.document.name),o=ae(n.document.updateTime),u=n.document.createTime?ae(n.document.createTime):M.min(),h=new At({mapValue:{fields:n.document.fields}}),f=mt.newFoundDocument(i,o,u,h),d=n.targetIds||[],_=n.removedTargetIds||[];e=new Dn(d,_,f.key,f)}else if("documentDelete"in t){t.documentDelete;const n=t.documentDelete;n.document;const i=Er(s,n.document),o=n.readTime?ae(n.readTime):M.min(),u=mt.newNoDocument(i,o),h=n.removedTargetIds||[];e=new Dn([],h,u.key,u)}else if("documentRemove"in t){t.documentRemove;const n=t.documentRemove;n.document;const i=Er(s,n.document),o=n.removedTargetIds||[];e=new Dn([],o,i,null)}else{if(!("filter"in t))return O();{t.filter;const n=t.filter;n.targetId;const{count:i=0,unchangedNames:o}=n,u=new cl(i,o),h=n.targetId;e=new Fo(h,u)}}return e}function El(s,t){return{documents:[zo(s,t.path)]}}function Il(s,t){const e={structuredQuery:{}},n=t.path;let i;t.collectionGroup!==null?(i=n,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(i=n.popLast(),e.structuredQuery.from=[{collectionId:n.lastSegment()}]),e.parent=zo(s,i);const o=function(d){if(d.length!==0)return Go(It.create(d,"and"))}(t.filters);o&&(e.structuredQuery.where=o);const u=function(d){if(d.length!==0)return d.map(_=>function(R){return{field:ie(R.field),direction:Rl(R.dir)}}(_))}(t.orderBy);u&&(e.structuredQuery.orderBy=u);const h=xr(s,t.limit);return h!==null&&(e.structuredQuery.limit=h),t.startAt&&(e.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(t.endAt)),{_t:e,parent:i}}function Al(s){let t=Tl(s.parent);const e=s.structuredQuery,n=e.from?e.from.length:0;let i=null;if(n>0){Y(n===1);const _=e.from[0];_.allDescendants?i=_.collectionId:t=t.child(_.collectionId)}let o=[];e.where&&(o=function(w){const R=$o(w);return R instanceof It&&Io(R)?R.getFilters():[R]}(e.where));let u=[];e.orderBy&&(u=function(w){return w.map(R=>function(b){return new Je(oe(b.field),function(k){switch(k){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(b.direction))}(R))}(e.orderBy));let h=null;e.limit&&(h=function(w){let R;return R=typeof w=="object"?w.value:w,Fn(R)?null:R}(e.limit));let f=null;e.startAt&&(f=function(w){const R=!!w.before,S=w.values||[];return new bn(S,R)}(e.startAt));let d=null;return e.endAt&&(d=function(w){const R=!w.before,S=w.values||[];return new bn(S,R)}(e.endAt)),Qu(t,i,u,o,h,"F",f,d)}function wl(s,t){const e=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return O()}}(t.purpose);return e==null?null:{"goog-listen-tags":e}}function $o(s){return s.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const n=oe(e.unaryFilter.field);return tt.create(n,"==",{doubleValue:NaN});case"IS_NULL":const i=oe(e.unaryFilter.field);return tt.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=oe(e.unaryFilter.field);return tt.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const u=oe(e.unaryFilter.field);return tt.create(u,"!=",{nullValue:"NULL_VALUE"});default:return O()}}(s):s.fieldFilter!==void 0?function(e){return tt.create(oe(e.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return O()}}(e.fieldFilter.op),e.fieldFilter.value)}(s):s.compositeFilter!==void 0?function(e){return It.create(e.compositeFilter.filters.map(n=>$o(n)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return O()}}(e.compositeFilter.op))}(s):O()}function Rl(s){return ml[s]}function Pl(s){return gl[s]}function Vl(s){return _l[s]}function ie(s){return{fieldPath:s.canonicalString()}}function oe(s){return gt.fromServerFormat(s.fieldPath)}function Go(s){return s instanceof tt?function(e){if(e.op==="=="){if(Si(e.value))return{unaryFilter:{field:ie(e.field),op:"IS_NAN"}};if(Ci(e.value))return{unaryFilter:{field:ie(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Si(e.value))return{unaryFilter:{field:ie(e.field),op:"IS_NOT_NAN"}};if(Ci(e.value))return{unaryFilter:{field:ie(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ie(e.field),op:Pl(e.op),value:e.value}}}(s):s instanceof It?function(e){const n=e.getFilters().map(i=>Go(i));return n.length===1?n[0]:{compositeFilter:{op:Vl(e.op),filters:n}}}(s):O()}function Qo(s){return s.length>=4&&s.get(0)==="projects"&&s.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(t,e,n,i,o=M.min(),u=M.min(),h=ut.EMPTY_BYTE_STRING,f=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=i,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=u,this.resumeToken=h,this.expectedCount=f}withSequenceNumber(t){return new Ot(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new Ot(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new Ot(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new Ot(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cl{constructor(t){this.ct=t}}function Sl(s){const t=Al({parent:s.parent,structuredQuery:s.structuredQuery});return s.limitType==="LAST"?Nr(t,t.limit,"L"):t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dl{constructor(){this.un=new Nl}addToCollectionParentIndex(t,e){return this.un.add(e),P.resolve()}getCollectionParents(t,e){return P.resolve(this.un.getEntries(e))}addFieldIndex(t,e){return P.resolve()}deleteFieldIndex(t,e){return P.resolve()}deleteAllFieldIndexes(t){return P.resolve()}createTargetIndexes(t,e){return P.resolve()}getDocumentsMatchingTarget(t,e){return P.resolve(null)}getIndexType(t,e){return P.resolve(0)}getFieldIndexes(t,e){return P.resolve([])}getNextCollectionGroupToUpdate(t){return P.resolve(null)}getMinOffset(t,e){return P.resolve(Ut.min())}getMinOffsetFromCollectionGroup(t,e){return P.resolve(Ut.min())}updateCollectionGroup(t,e,n){return P.resolve()}updateIndexEntries(t,e){return P.resolve()}}class Nl{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),i=this.index[e]||new at($.comparator),o=!i.has(n);return this.index[e]=i.add(n),o}has(t){const e=t.lastSegment(),n=t.popLast(),i=this.index[e];return i&&i.has(n)}getEntries(t){return(this.index[t]||new at($.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(t){this.Ln=t}next(){return this.Ln+=2,this.Ln}static Bn(){return new me(0)}static kn(){return new me(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kl{constructor(){this.changes=new ve(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,mt.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return n!==void 0?P.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bl{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xl{constructor(t,e,n,i){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=i}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(i=>(n=i,this.remoteDocumentCache.getEntry(t,e))).next(i=>(n!==null&&Qe(n.mutation,i,Mt.empty(),rt.now()),i))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.getLocalViewOfDocuments(t,n,q()).next(()=>n))}getLocalViewOfDocuments(t,e,n=q()){const i=Qt();return this.populateOverlays(t,i,e).next(()=>this.computeViews(t,e,i,n).next(o=>{let u=Be();return o.forEach((h,f)=>{u=u.insert(h,f.overlayedDocument)}),u}))}getOverlayedDocuments(t,e){const n=Qt();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,q()))}populateOverlays(t,e,n){const i=[];return n.forEach(o=>{e.has(o)||i.push(o)}),this.documentOverlayCache.getOverlays(t,i).next(o=>{o.forEach((u,h)=>{e.set(u,h)})})}computeViews(t,e,n,i){let o=Bt();const u=Ge(),h=function(){return Ge()}();return e.forEach((f,d)=>{const _=n.get(d.key);i.has(d.key)&&(_===void 0||_.mutation instanceof jn)?o=o.insert(d.key,d):_!==void 0?(u.set(d.key,_.mutation.getFieldMask()),Qe(_.mutation,d,_.mutation.getFieldMask(),rt.now())):u.set(d.key,Mt.empty())}),this.recalculateAndSaveOverlays(t,o).next(f=>(f.forEach((d,_)=>u.set(d,_)),e.forEach((d,_)=>{var w;return h.set(d,new bl(_,(w=u.get(d))!==null&&w!==void 0?w:null))}),h))}recalculateAndSaveOverlays(t,e){const n=Ge();let i=new J((u,h)=>u-h),o=q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(u=>{for(const h of u)h.keys().forEach(f=>{const d=e.get(f);if(d===null)return;let _=n.get(f)||Mt.empty();_=h.applyToLocalView(d,_),n.set(f,_);const w=(i.get(h.batchId)||q()).add(f);i=i.insert(h.batchId,w)})}).next(()=>{const u=[],h=i.getReverseIterator();for(;h.hasNext();){const f=h.getNext(),d=f.key,_=f.value,w=Do();_.forEach(R=>{if(!o.has(R)){const S=Lo(e.get(R),n.get(R));S!==null&&w.set(R,S),o=o.add(R)}}),u.push(this.documentOverlayCache.saveOverlays(t,d,w))}return P.waitFor(u)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.recalculateAndSaveOverlays(t,n))}getDocumentsMatchingQuery(t,e,n,i){return function(u){return x.isDocumentKey(u.path)&&u.collectionGroup===null&&u.filters.length===0}(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):Po(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,i):this.getDocumentsMatchingCollectionQuery(t,e,n,i)}getNextDocuments(t,e,n,i){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,i).next(o=>{const u=i-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,i-o.size):P.resolve(Qt());let h=-1,f=o;return u.next(d=>P.forEach(d,(_,w)=>(h<w.largestBatchId&&(h=w.largestBatchId),o.get(_)?P.resolve():this.remoteDocumentCache.getEntry(t,_).next(R=>{f=f.insert(_,R)}))).next(()=>this.populateOverlays(t,d,o)).next(()=>this.computeViews(t,f,d,q())).next(_=>({batchId:h,changes:Ju(_)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new x(e)).next(n=>{let i=Be();return n.isFoundDocument()&&(i=i.insert(n.key,n)),i})}getDocumentsMatchingCollectionGroupQuery(t,e,n,i){const o=e.collectionGroup;let u=Be();return this.indexManager.getCollectionParents(t,o).next(h=>P.forEach(h,f=>{const d=function(w,R){return new Te(R,null,w.explicitOrderBy.slice(),w.filters.slice(),w.limit,w.limitType,w.startAt,w.endAt)}(e,f.child(o));return this.getDocumentsMatchingCollectionQuery(t,d,n,i).next(_=>{_.forEach((w,R)=>{u=u.insert(w,R)})})}).next(()=>u))}getDocumentsMatchingCollectionQuery(t,e,n,i){let o;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(u=>(o=u,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,o,i))).next(u=>{o.forEach((f,d)=>{const _=d.getKey();u.get(_)===null&&(u=u.insert(_,mt.newInvalidDocument(_)))});let h=Be();return u.forEach((f,d)=>{const _=o.get(f);_!==void 0&&Qe(_.mutation,d,Mt.empty(),rt.now()),qn(e,d)&&(h=h.insert(f,d))}),h})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ll{constructor(t){this.serializer=t,this.hr=new Map,this.Pr=new Map}getBundleMetadata(t,e){return P.resolve(this.hr.get(e))}saveBundleMetadata(t,e){return this.hr.set(e.id,function(i){return{id:i.id,version:i.version,createTime:ae(i.createTime)}}(e)),P.resolve()}getNamedQuery(t,e){return P.resolve(this.Pr.get(e))}saveNamedQuery(t,e){return this.Pr.set(e.name,function(i){return{name:i.name,query:Sl(i.bundledQuery),readTime:ae(i.readTime)}}(e)),P.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ml{constructor(){this.overlays=new J(x.comparator),this.Ir=new Map}getOverlay(t,e){return P.resolve(this.overlays.get(e))}getOverlays(t,e){const n=Qt();return P.forEach(e,i=>this.getOverlay(t,i).next(o=>{o!==null&&n.set(i,o)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((i,o)=>{this.ht(t,e,o)}),P.resolve()}removeOverlaysForBatchId(t,e,n){const i=this.Ir.get(n);return i!==void 0&&(i.forEach(o=>this.overlays=this.overlays.remove(o)),this.Ir.delete(n)),P.resolve()}getOverlaysForCollection(t,e,n){const i=Qt(),o=e.length+1,u=new x(e.child("")),h=this.overlays.getIteratorFrom(u);for(;h.hasNext();){const f=h.getNext().value,d=f.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===o&&f.largestBatchId>n&&i.set(f.getKey(),f)}return P.resolve(i)}getOverlaysForCollectionGroup(t,e,n,i){let o=new J((d,_)=>d-_);const u=this.overlays.getIterator();for(;u.hasNext();){const d=u.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>n){let _=o.get(d.largestBatchId);_===null&&(_=Qt(),o=o.insert(d.largestBatchId,_)),_.set(d.getKey(),d)}}const h=Qt(),f=o.getIterator();for(;f.hasNext()&&(f.getNext().value.forEach((d,_)=>h.set(d,_)),!(h.size()>=i)););return P.resolve(h)}ht(t,e,n){const i=this.overlays.get(n.key);if(i!==null){const u=this.Ir.get(i.largestBatchId).delete(n.key);this.Ir.set(i.largestBatchId,u)}this.overlays=this.overlays.insert(n.key,new hl(e,n));let o=this.Ir.get(e);o===void 0&&(o=q(),this.Ir.set(e,o)),this.Ir.set(e,o.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ol{constructor(){this.sessionToken=ut.EMPTY_BYTE_STRING}getSessionToken(t){return P.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,P.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns{constructor(){this.Tr=new at(nt.Er),this.dr=new at(nt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(t,e){const n=new nt(t,e);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(t,e){t.forEach(n=>this.addReference(n,e))}removeReference(t,e){this.Vr(new nt(t,e))}mr(t,e){t.forEach(n=>this.removeReference(n,e))}gr(t){const e=new x(new $([])),n=new nt(e,t),i=new nt(e,t+1),o=[];return this.dr.forEachInRange([n,i],u=>{this.Vr(u),o.push(u.key)}),o}pr(){this.Tr.forEach(t=>this.Vr(t))}Vr(t){this.Tr=this.Tr.delete(t),this.dr=this.dr.delete(t)}yr(t){const e=new x(new $([])),n=new nt(e,t),i=new nt(e,t+1);let o=q();return this.dr.forEachInRange([n,i],u=>{o=o.add(u.key)}),o}containsKey(t){const e=new nt(t,0),n=this.Tr.firstAfterOrEqual(e);return n!==null&&t.isEqual(n.key)}}class nt{constructor(t,e){this.key=t,this.wr=e}static Er(t,e){return x.comparator(t.key,e.key)||j(t.wr,e.wr)}static Ar(t,e){return j(t.wr,e.wr)||x.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fl{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.Sr=1,this.br=new at(nt.Er)}checkEmpty(t){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,n,i){const o=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const u=new ll(o,e,n,i);this.mutationQueue.push(u);for(const h of i)this.br=this.br.add(new nt(h.key,o)),this.indexManager.addToCollectionParentIndex(t,h.key.path.popLast());return P.resolve(u)}lookupMutationBatch(t,e){return P.resolve(this.Dr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,i=this.vr(n),o=i<0?0:i;return P.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(t){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new nt(e,0),i=new nt(e,Number.POSITIVE_INFINITY),o=[];return this.br.forEachInRange([n,i],u=>{const h=this.Dr(u.wr);o.push(h)}),P.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new at(j);return e.forEach(i=>{const o=new nt(i,0),u=new nt(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([o,u],h=>{n=n.add(h.wr)})}),P.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,i=n.length+1;let o=n;x.isDocumentKey(o)||(o=o.child(""));const u=new nt(new x(o),0);let h=new at(j);return this.br.forEachWhile(f=>{const d=f.key.path;return!!n.isPrefixOf(d)&&(d.length===i&&(h=h.add(f.wr)),!0)},u),P.resolve(this.Cr(h))}Cr(t){const e=[];return t.forEach(n=>{const i=this.Dr(n);i!==null&&e.push(i)}),e}removeMutationBatch(t,e){Y(this.Fr(e.batchId,"removed")===0),this.mutationQueue.shift();let n=this.br;return P.forEach(e.mutations,i=>{const o=new nt(i.key,e.batchId);return n=n.delete(o),this.referenceDelegate.markPotentiallyOrphaned(t,i.key)}).next(()=>{this.br=n})}On(t){}containsKey(t,e){const n=new nt(e,0),i=this.br.firstAfterOrEqual(n);return P.resolve(e.isEqual(i&&i.key))}performConsistencyCheck(t){return this.mutationQueue.length,P.resolve()}Fr(t,e){return this.vr(t)}vr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Dr(t){const e=this.vr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ul{constructor(t){this.Mr=t,this.docs=function(){return new J(x.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,i=this.docs.get(n),o=i?i.size:0,u=this.Mr(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:u}),this.size+=u-o,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return P.resolve(n?n.document.mutableCopy():mt.newInvalidDocument(e))}getEntries(t,e){let n=Bt();return e.forEach(i=>{const o=this.docs.get(i);n=n.insert(i,o?o.document.mutableCopy():mt.newInvalidDocument(i))}),P.resolve(n)}getDocumentsMatchingQuery(t,e,n,i){let o=Bt();const u=e.path,h=new x(u.child("")),f=this.docs.getIteratorFrom(h);for(;f.hasNext();){const{key:d,value:{document:_}}=f.getNext();if(!u.isPrefixOf(d.path))break;d.path.length>u.length+1||Cu(Vu(_),n)<=0||(i.has(_.key)||qn(e,_))&&(o=o.insert(_.key,_.mutableCopy()))}return P.resolve(o)}getAllFromCollectionGroup(t,e,n,i){O()}Or(t,e){return P.forEach(this.docs,n=>e(n))}newChangeBuffer(t){return new ql(this)}getSize(t){return P.resolve(this.size)}}class ql extends kl{constructor(t){super(),this.cr=t}applyChanges(t){const e=[];return this.changes.forEach((n,i)=>{i.isValidDocument()?e.push(this.cr.addEntry(t,i)):this.cr.removeEntry(n)}),P.waitFor(e)}getFromCache(t,e){return this.cr.getEntry(t,e)}getAllFromCache(t,e){return this.cr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bl{constructor(t){this.persistence=t,this.Nr=new ve(e=>Hr(e),Yr),this.lastRemoteSnapshotVersion=M.min(),this.highestTargetId=0,this.Lr=0,this.Br=new ns,this.targetCount=0,this.kr=me.Bn()}forEachTarget(t,e){return this.Nr.forEach((n,i)=>e(i)),P.resolve()}getLastRemoteSnapshotVersion(t){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return P.resolve(this.Lr)}allocateTargetId(t){return this.highestTargetId=this.kr.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.Lr&&(this.Lr=e),P.resolve()}Kn(t){this.Nr.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.kr=new me(e),this.highestTargetId=e),t.sequenceNumber>this.Lr&&(this.Lr=t.sequenceNumber)}addTargetData(t,e){return this.Kn(e),this.targetCount+=1,P.resolve()}updateTargetData(t,e){return this.Kn(e),P.resolve()}removeTargetData(t,e){return this.Nr.delete(e.target),this.Br.gr(e.targetId),this.targetCount-=1,P.resolve()}removeTargets(t,e,n){let i=0;const o=[];return this.Nr.forEach((u,h)=>{h.sequenceNumber<=e&&n.get(h.targetId)===null&&(this.Nr.delete(u),o.push(this.removeMatchingKeysForTargetId(t,h.targetId)),i++)}),P.waitFor(o).next(()=>i)}getTargetCount(t){return P.resolve(this.targetCount)}getTargetData(t,e){const n=this.Nr.get(e)||null;return P.resolve(n)}addMatchingKeys(t,e,n){return this.Br.Rr(e,n),P.resolve()}removeMatchingKeys(t,e,n){this.Br.mr(e,n);const i=this.persistence.referenceDelegate,o=[];return i&&e.forEach(u=>{o.push(i.markPotentiallyOrphaned(t,u))}),P.waitFor(o)}removeMatchingKeysForTargetId(t,e){return this.Br.gr(e),P.resolve()}getMatchingKeysForTargetId(t,e){const n=this.Br.yr(e);return P.resolve(n)}containsKey(t,e){return P.resolve(this.Br.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jl{constructor(t,e){this.qr={},this.overlays={},this.Qr=new $r(0),this.Kr=!1,this.Kr=!0,this.$r=new Ol,this.referenceDelegate=t(this),this.Ur=new Bl(this),this.indexManager=new Dl,this.remoteDocumentCache=function(i){return new Ul(i)}(n=>this.referenceDelegate.Wr(n)),this.serializer=new Cl(e),this.Gr=new Ll(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new Ml,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this.qr[t.toKey()];return n||(n=new Fl(e,this.referenceDelegate),this.qr[t.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(t,e,n){N("MemoryPersistence","Starting transaction:",t);const i=new zl(this.Qr.next());return this.referenceDelegate.zr(),n(i).next(o=>this.referenceDelegate.jr(i).next(()=>o)).toPromise().then(o=>(i.raiseOnCommittedEvent(),o))}Hr(t,e){return P.or(Object.values(this.qr).map(n=>()=>n.containsKey(t,e)))}}class zl extends Du{constructor(t){super(),this.currentSequenceNumber=t}}class rs{constructor(t){this.persistence=t,this.Jr=new ns,this.Yr=null}static Zr(t){return new rs(t)}get Xr(){if(this.Yr)return this.Yr;throw O()}addReference(t,e,n){return this.Jr.addReference(n,e),this.Xr.delete(n.toString()),P.resolve()}removeReference(t,e,n){return this.Jr.removeReference(n,e),this.Xr.add(n.toString()),P.resolve()}markPotentiallyOrphaned(t,e){return this.Xr.add(e.toString()),P.resolve()}removeTarget(t,e){this.Jr.gr(e.targetId).forEach(i=>this.Xr.add(i.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(i=>{i.forEach(o=>this.Xr.add(o.toString()))}).next(()=>n.removeTargetData(t,e))}zr(){this.Yr=new Set}jr(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.Xr,n=>{const i=x.fromPath(n);return this.ei(t,i).next(o=>{o||e.removeEntry(i,M.min())})}).next(()=>(this.Yr=null,e.apply(t)))}updateLimboDocument(t,e){return this.ei(t,e).next(n=>{n?this.Xr.delete(e.toString()):this.Xr.add(e.toString())})}Wr(t){return 0}ei(t,e){return P.or([()=>P.resolve(this.Jr.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Hr(t,e)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss{constructor(t,e,n,i){this.targetId=t,this.fromCache=e,this.$i=n,this.Ui=i}static Wi(t,e){let n=q(),i=q();for(const o of e.docChanges)switch(o.type){case 0:n=n.add(o.doc.key);break;case 1:i=i.add(o.doc.key)}return new ss(t,e.fromCache,n,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kl{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $l{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return mu()?8:Nu(gu())>0?6:4}()}initialize(t,e){this.Ji=t,this.indexManager=e,this.Gi=!0}getDocumentsMatchingQuery(t,e,n,i){const o={result:null};return this.Yi(t,e).next(u=>{o.result=u}).next(()=>{if(!o.result)return this.Zi(t,e,i,n).next(u=>{o.result=u})}).next(()=>{if(o.result)return;const u=new Kl;return this.Xi(t,e,u).next(h=>{if(o.result=h,this.zi)return this.es(t,e,u,h.size)})}).next(()=>o.result)}es(t,e,n,i){return n.documentReadCount<this.ji?(Ue()<=Lt.DEBUG&&N("QueryEngine","SDK will not create cache indexes for query:",se(e),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),P.resolve()):(Ue()<=Lt.DEBUG&&N("QueryEngine","Query:",se(e),"scans",n.documentReadCount,"local documents and returns",i,"documents as results."),n.documentReadCount>this.Hi*i?(Ue()<=Lt.DEBUG&&N("QueryEngine","The SDK decides to create cache indexes for query:",se(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,wt(e))):P.resolve())}Yi(t,e){if(bi(e))return P.resolve(null);let n=wt(e);return this.indexManager.getIndexType(t,n).next(i=>i===0?null:(e.limit!==null&&i===1&&(e=Nr(e,null,"F"),n=wt(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(o=>{const u=q(...o);return this.Ji.getDocuments(t,u).next(h=>this.indexManager.getMinOffset(t,n).next(f=>{const d=this.ts(e,h);return this.ns(e,d,u,f.readTime)?this.Yi(t,Nr(e,null,"F")):this.rs(t,d,e,f)}))})))}Zi(t,e,n,i){return bi(e)||i.isEqual(M.min())?P.resolve(null):this.Ji.getDocuments(t,n).next(o=>{const u=this.ts(e,o);return this.ns(e,u,n,i)?P.resolve(null):(Ue()<=Lt.DEBUG&&N("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),se(e)),this.rs(t,u,e,Pu(i,-1)).next(h=>h))})}ts(t,e){let n=new at(Co(t));return e.forEach((i,o)=>{qn(t,o)&&(n=n.add(o))}),n}ns(t,e,n,i){if(t.limit===null)return!1;if(n.size!==e.size)return!0;const o=t.limitType==="F"?e.last():e.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(i)>0)}Xi(t,e,n){return Ue()<=Lt.DEBUG&&N("QueryEngine","Using full collection scan to execute query:",se(e)),this.Ji.getDocumentsMatchingQuery(t,e,Ut.min(),n)}rs(t,e,n,i){return this.Ji.getDocumentsMatchingQuery(t,n,i).next(o=>(e.forEach(u=>{o=o.insert(u.key,u)}),o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gl{constructor(t,e,n,i){this.persistence=t,this.ss=e,this.serializer=i,this.os=new J(j),this._s=new ve(o=>Hr(o),Yr),this.us=new Map,this.cs=t.getRemoteDocumentCache(),this.Ur=t.getTargetCache(),this.Gr=t.getBundleCache(),this.ls(n)}ls(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new xl(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.os))}}function Ql(s,t,e,n){return new Gl(s,t,e,n)}async function Wo(s,t){const e=U(s);return await e.persistence.runTransaction("Handle user change","readonly",n=>{let i;return e.mutationQueue.getAllMutationBatches(n).next(o=>(i=o,e.ls(t),e.mutationQueue.getAllMutationBatches(n))).next(o=>{const u=[],h=[];let f=q();for(const d of i){u.push(d.batchId);for(const _ of d.mutations)f=f.add(_.key)}for(const d of o){h.push(d.batchId);for(const _ of d.mutations)f=f.add(_.key)}return e.localDocuments.getDocuments(n,f).next(d=>({hs:d,removedBatchIds:u,addedBatchIds:h}))})})}function Ho(s){const t=U(s);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.Ur.getLastRemoteSnapshotVersion(e))}function Wl(s,t){const e=U(s),n=t.snapshotVersion;let i=e.os;return e.persistence.runTransaction("Apply remote event","readwrite-primary",o=>{const u=e.cs.newChangeBuffer({trackRemovals:!0});i=e.os;const h=[];t.targetChanges.forEach((_,w)=>{const R=i.get(w);if(!R)return;h.push(e.Ur.removeMatchingKeys(o,_.removedDocuments,w).next(()=>e.Ur.addMatchingKeys(o,_.addedDocuments,w)));let S=R.withSequenceNumber(o.currentSequenceNumber);t.targetMismatches.get(w)!==null?S=S.withResumeToken(ut.EMPTY_BYTE_STRING,M.min()).withLastLimboFreeSnapshotVersion(M.min()):_.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(_.resumeToken,n)),i=i.insert(w,S),function(L,k,G){return L.resumeToken.approximateByteSize()===0||k.snapshotVersion.toMicroseconds()-L.snapshotVersion.toMicroseconds()>=3e8?!0:G.addedDocuments.size+G.modifiedDocuments.size+G.removedDocuments.size>0}(R,S,_)&&h.push(e.Ur.updateTargetData(o,S))});let f=Bt(),d=q();if(t.documentUpdates.forEach(_=>{t.resolvedLimboDocuments.has(_)&&h.push(e.persistence.referenceDelegate.updateLimboDocument(o,_))}),h.push(Hl(o,u,t.documentUpdates).next(_=>{f=_.Ps,d=_.Is})),!n.isEqual(M.min())){const _=e.Ur.getLastRemoteSnapshotVersion(o).next(w=>e.Ur.setTargetsMetadata(o,o.currentSequenceNumber,n));h.push(_)}return P.waitFor(h).next(()=>u.apply(o)).next(()=>e.localDocuments.getLocalViewOfDocuments(o,f,d)).next(()=>f)}).then(o=>(e.os=i,o))}function Hl(s,t,e){let n=q(),i=q();return e.forEach(o=>n=n.add(o)),t.getEntries(s,n).next(o=>{let u=Bt();return e.forEach((h,f)=>{const d=o.get(h);f.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(h)),f.isNoDocument()&&f.version.isEqual(M.min())?(t.removeEntry(h,f.readTime),u=u.insert(h,f)):!d.isValidDocument()||f.version.compareTo(d.version)>0||f.version.compareTo(d.version)===0&&d.hasPendingWrites?(t.addEntry(f),u=u.insert(h,f)):N("LocalStore","Ignoring outdated watch update for ",h,". Current version:",d.version," Watch version:",f.version)}),{Ps:u,Is:i}})}function Yl(s,t){const e=U(s);return e.persistence.runTransaction("Allocate target","readwrite",n=>{let i;return e.Ur.getTargetData(n,t).next(o=>o?(i=o,P.resolve(i)):e.Ur.allocateTargetId(n).next(u=>(i=new Ot(t,u,"TargetPurposeListen",n.currentSequenceNumber),e.Ur.addTargetData(n,i).next(()=>i))))}).then(n=>{const i=e.os.get(n.targetId);return(i===null||n.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(e.os=e.os.insert(n.targetId,n),e._s.set(t,n.targetId)),n})}async function Or(s,t,e){const n=U(s),i=n.os.get(t),o=e?"readwrite":"readwrite-primary";try{e||await n.persistence.runTransaction("Release target",o,u=>n.persistence.referenceDelegate.removeTarget(u,i))}catch(u){if(!Ze(u))throw u;N("LocalStore",`Failed to update sequence numbers for target ${t}: ${u}`)}n.os=n.os.remove(t),n._s.delete(i.target)}function Ki(s,t,e){const n=U(s);let i=M.min(),o=q();return n.persistence.runTransaction("Execute query","readwrite",u=>function(f,d,_){const w=U(f),R=w._s.get(_);return R!==void 0?P.resolve(w.os.get(R)):w.Ur.getTargetData(d,_)}(n,u,wt(t)).next(h=>{if(h)return i=h.lastLimboFreeSnapshotVersion,n.Ur.getMatchingKeysForTargetId(u,h.targetId).next(f=>{o=f})}).next(()=>n.ss.getDocumentsMatchingQuery(u,t,e?i:M.min(),e?o:q())).next(h=>(Xl(n,Hu(t),h),{documents:h,Ts:o})))}function Xl(s,t,e){let n=s.us.get(t)||M.min();e.forEach((i,o)=>{o.readTime.compareTo(n)>0&&(n=o.readTime)}),s.us.set(t,n)}class $i{constructor(){this.activeTargetIds=el()}fs(t){this.activeTargetIds=this.activeTargetIds.add(t)}gs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Vs(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class Jl{constructor(){this.so=new $i,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.so.fs(t),this.oo[t]||"not-current"}updateQueryState(t,e,n){this.oo[t]=e}removeLocalQueryTarget(t){this.so.gs(t)}isLocalQueryTarget(t){return this.so.activeTargetIds.has(t)}clearQueryState(t){delete this.oo[t]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(t){return this.so.activeTargetIds.has(t)}start(){return this.so=new $i,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zl{_o(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(t){this.ho.push(t)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){N("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const t of this.ho)t(0)}lo(){N("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const t of this.ho)t(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vn=null;function Ir(){return Vn===null?Vn=function(){return 268435456+Math.round(2147483648*Math.random())}():Vn++,"0x"+Vn.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const th={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eh{constructor(t){this.Io=t.Io,this.To=t.To}Eo(t){this.Ao=t}Ro(t){this.Vo=t}mo(t){this.fo=t}onMessage(t){this.po=t}close(){this.To()}send(t){this.Io(t)}yo(){this.Ao()}wo(){this.Vo()}So(t){this.fo(t)}bo(t){this.po(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dt="WebChannelConnection";class nh extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.Do=n+"://"+e.host,this.vo=`projects/${i}/databases/${o}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${o}`}get Fo(){return!1}Mo(e,n,i,o,u){const h=Ir(),f=this.xo(e,n.toUriEncodedString());N("RestConnection",`Sending RPC '${e}' ${h}:`,f,i);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,o,u),this.No(e,f,d,i).then(_=>(N("RestConnection",`Received RPC '${e}' ${h}: `,_),_),_=>{throw ce("RestConnection",`RPC '${e}' ${h} failed with error: `,_,"url: ",f,"request:",i),_})}Lo(e,n,i,o,u,h){return this.Mo(e,n,i,o,u)}Oo(e,n,i){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+ye}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((o,u)=>e[u]=o),i&&i.headers.forEach((o,u)=>e[u]=o)}xo(e,n){const i=th[e];return`${this.Do}/v1/${n}:${i}`}terminate(){}}{constructor(t){super(t),this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}No(t,e,n,i){const o=Ir();return new Promise((u,h)=>{const f=new ho;f.setWithCredentials(!0),f.listenOnce(co.COMPLETE,()=>{try{switch(f.getLastErrorCode()){case Cn.NO_ERROR:const _=f.getResponseJson();N(dt,`XHR for RPC '${t}' ${o} received:`,JSON.stringify(_)),u(_);break;case Cn.TIMEOUT:N(dt,`RPC '${t}' ${o} timed out`),h(new D(V.DEADLINE_EXCEEDED,"Request time out"));break;case Cn.HTTP_ERROR:const w=f.getStatus();if(N(dt,`RPC '${t}' ${o} failed with status:`,w,"response text:",f.getResponseText()),w>0){let R=f.getResponseJson();Array.isArray(R)&&(R=R[0]);const S=R==null?void 0:R.error;if(S&&S.status&&S.message){const b=function(k){const G=k.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(G)>=0?G:V.UNKNOWN}(S.status);h(new D(b,S.message))}else h(new D(V.UNKNOWN,"Server responded with status "+f.getStatus()))}else h(new D(V.UNAVAILABLE,"Connection failed."));break;default:O()}}finally{N(dt,`RPC '${t}' ${o} completed.`)}});const d=JSON.stringify(i);N(dt,`RPC '${t}' ${o} sending request:`,i),f.send(e,"POST",d,n,15)})}Bo(t,e,n){const i=Ir(),o=[this.Do,"/","google.firestore.v1.Firestore","/",t,"/channel"],u=mo(),h=po(),f={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(f.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(f.useFetchStreams=!0),this.Oo(f.initMessageHeaders,e,n),f.encodeInitMessageHeaders=!0;const _=o.join("");N(dt,`Creating RPC '${t}' stream ${i}: ${_}`,f);const w=u.createWebChannel(_,f);let R=!1,S=!1;const b=new eh({Io:k=>{S?N(dt,`Not sending because RPC '${t}' stream ${i} is closed:`,k):(R||(N(dt,`Opening RPC '${t}' stream ${i} transport.`),w.open(),R=!0),N(dt,`RPC '${t}' stream ${i} sending:`,k),w.send(k))},To:()=>w.close()}),L=(k,G,Q)=>{k.listen(G,W=>{try{Q(W)}catch(et){setTimeout(()=>{throw et},0)}})};return L(w,qe.EventType.OPEN,()=>{S||(N(dt,`RPC '${t}' stream ${i} transport opened.`),b.yo())}),L(w,qe.EventType.CLOSE,()=>{S||(S=!0,N(dt,`RPC '${t}' stream ${i} transport closed`),b.So())}),L(w,qe.EventType.ERROR,k=>{S||(S=!0,ce(dt,`RPC '${t}' stream ${i} transport errored:`,k),b.So(new D(V.UNAVAILABLE,"The operation could not be completed")))}),L(w,qe.EventType.MESSAGE,k=>{var G;if(!S){const Q=k.data[0];Y(!!Q);const W=Q,et=W.error||((G=W[0])===null||G===void 0?void 0:G.error);if(et){N(dt,`RPC '${t}' stream ${i} received error:`,et);const Pt=et.status;let st=function(g){const y=Z[g];if(y!==void 0)return Oo(y)}(Pt),v=et.message;st===void 0&&(st=V.INTERNAL,v="Unknown error status: "+Pt+" with message "+et.message),S=!0,b.So(new D(st,v)),w.close()}else N(dt,`RPC '${t}' stream ${i} received:`,Q),b.bo(Q)}}),L(h,fo.STAT_EVENT,k=>{k.stat===Rr.PROXY?N(dt,`RPC '${t}' stream ${i} detected buffering proxy`):k.stat===Rr.NOPROXY&&N(dt,`RPC '${t}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{b.wo()},0),b}}function Ar(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kn(s){return new yl(s,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yo{constructor(t,e,n=1e3,i=1.5,o=6e4){this.ui=t,this.timerId=e,this.ko=n,this.qo=i,this.Qo=o,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(t){this.cancel();const e=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),i=Math.max(0,e-n);i>0&&N("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),t())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rh{constructor(t,e,n,i,o,u,h,f){this.ui=t,this.Ho=n,this.Jo=i,this.connection=o,this.authCredentialsProvider=u,this.appCheckCredentialsProvider=h,this.listener=f,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Yo(t,e)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(t){this.u_(),this.stream.send(t)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(t,e){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,t!==4?this.t_.reset():e&&e.code===V.RESOURCE_EXHAUSTED?(Dt(e.toString()),Dt("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):e&&e.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.mo(e)}l_(){}auth(){this.state=1;const t=this.h_(this.Yo),e=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,i])=>{this.Yo===e&&this.P_(n,i)},n=>{t(()=>{const i=new D(V.UNKNOWN,"Fetching auth token failed: "+n.message);return this.I_(i)})})}P_(t,e){const n=this.h_(this.Yo);this.stream=this.T_(t,e),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(i=>{n(()=>this.I_(i))}),this.stream.onMessage(i=>{n(()=>++this.e_==1?this.E_(i):this.onNext(i))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(t){return N("PersistentStream",`close with error: ${t}`),this.stream=null,this.close(4,t)}h_(t){return e=>{this.ui.enqueueAndForget(()=>this.Yo===t?e():(N("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class sh extends rh{constructor(t,e,n,i,o,u){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,i,u),this.serializer=o}T_(t,e){return this.connection.Bo("Listen",t,e)}E_(t){return this.onNext(t)}onNext(t){this.t_.reset();const e=vl(this.serializer,t),n=function(o){if(!("targetChange"in o))return M.min();const u=o.targetChange;return u.targetIds&&u.targetIds.length?M.min():u.readTime?ae(u.readTime):M.min()}(t);return this.listener.d_(e,n)}A_(t){const e={};e.database=zi(this.serializer),e.addTarget=function(o,u){let h;const f=u.target;if(h=Sr(f)?{documents:El(o,f)}:{query:Il(o,f)._t},h.targetId=u.targetId,u.resumeToken.approximateByteSize()>0){h.resumeToken=qo(o,u.resumeToken);const d=xr(o,u.expectedCount);d!==null&&(h.expectedCount=d)}else if(u.snapshotVersion.compareTo(M.min())>0){h.readTime=Lr(o,u.snapshotVersion.toTimestamp());const d=xr(o,u.expectedCount);d!==null&&(h.expectedCount=d)}return h}(this.serializer,t);const n=wl(this.serializer,t);n&&(e.labels=n),this.a_(e)}R_(t){const e={};e.database=zi(this.serializer),e.removeTarget=t,this.a_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ih extends class{}{constructor(t,e,n,i){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new D(V.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(t,e,n,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,u])=>this.connection.Mo(t,Mr(e,n),i,o,u)).catch(o=>{throw o.name==="FirebaseError"?(o.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new D(V.UNKNOWN,o.toString())})}Lo(t,e,n,i,o){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([u,h])=>this.connection.Lo(t,Mr(e,n),i,u,h,o)).catch(u=>{throw u.name==="FirebaseError"?(u.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),u):new D(V.UNKNOWN,u.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class oh{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(t){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.C_("Offline")))}set(t){this.x_(),this.S_=0,t==="Online"&&(this.D_=!1),this.C_(t)}C_(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}F_(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Dt(e),this.D_=!1):N("OnlineStateTracker",e)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ah{constructor(t,e,n,i,o){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=o,this.k_._o(u=>{n.enqueueAndForget(async()=>{rn(this)&&(N("RemoteStore","Restarting streams for network reachability change."),await async function(f){const d=U(f);d.L_.add(4),await nn(d),d.q_.set("Unknown"),d.L_.delete(4),await $n(d)}(this))})}),this.q_=new oh(n,i)}}async function $n(s){if(rn(s))for(const t of s.B_)await t(!0)}async function nn(s){for(const t of s.B_)await t(!1)}function Xo(s,t){const e=U(s);e.N_.has(t.targetId)||(e.N_.set(t.targetId,t),us(e)?as(e):Ee(e).r_()&&os(e,t))}function is(s,t){const e=U(s),n=Ee(e);e.N_.delete(t),n.r_()&&Jo(e,t),e.N_.size===0&&(n.r_()?n.o_():rn(e)&&e.q_.set("Unknown"))}function os(s,t){if(s.Q_.xe(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(M.min())>0){const e=s.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}Ee(s).A_(t)}function Jo(s,t){s.Q_.xe(t),Ee(s).R_(t)}function as(s){s.Q_=new pl({getRemoteKeysForTarget:t=>s.remoteSyncer.getRemoteKeysForTarget(t),ot:t=>s.N_.get(t)||null,tt:()=>s.datastore.serializer.databaseId}),Ee(s).start(),s.q_.v_()}function us(s){return rn(s)&&!Ee(s).n_()&&s.N_.size>0}function rn(s){return U(s).L_.size===0}function Zo(s){s.Q_=void 0}async function uh(s){s.q_.set("Online")}async function lh(s){s.N_.forEach((t,e)=>{os(s,t)})}async function hh(s,t){Zo(s),us(s)?(s.q_.M_(t),as(s)):s.q_.set("Unknown")}async function ch(s,t,e){if(s.q_.set("Online"),t instanceof Uo&&t.state===2&&t.cause)try{await async function(i,o){const u=o.cause;for(const h of o.targetIds)i.N_.has(h)&&(await i.remoteSyncer.rejectListen(h,u),i.N_.delete(h),i.Q_.removeTarget(h))}(s,t)}catch(n){N("RemoteStore","Failed to remove targets %s: %s ",t.targetIds.join(","),n),await Qi(s,n)}else if(t instanceof Dn?s.Q_.Ke(t):t instanceof Fo?s.Q_.He(t):s.Q_.We(t),!e.isEqual(M.min()))try{const n=await Ho(s.localStore);e.compareTo(n)>=0&&await function(o,u){const h=o.Q_.rt(u);return h.targetChanges.forEach((f,d)=>{if(f.resumeToken.approximateByteSize()>0){const _=o.N_.get(d);_&&o.N_.set(d,_.withResumeToken(f.resumeToken,u))}}),h.targetMismatches.forEach((f,d)=>{const _=o.N_.get(f);if(!_)return;o.N_.set(f,_.withResumeToken(ut.EMPTY_BYTE_STRING,_.snapshotVersion)),Jo(o,f);const w=new Ot(_.target,f,d,_.sequenceNumber);os(o,w)}),o.remoteSyncer.applyRemoteEvent(h)}(s,e)}catch(n){N("RemoteStore","Failed to raise snapshot:",n),await Qi(s,n)}}async function Qi(s,t,e){if(!Ze(t))throw t;s.L_.add(1),await nn(s),s.q_.set("Offline"),e||(e=()=>Ho(s.localStore)),s.asyncQueue.enqueueRetryable(async()=>{N("RemoteStore","Retrying IndexedDB access"),await e(),s.L_.delete(1),await $n(s)})}async function Wi(s,t){const e=U(s);e.asyncQueue.verifyOperationInProgress(),N("RemoteStore","RemoteStore received new credentials");const n=rn(e);e.L_.add(3),await nn(e),n&&e.q_.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.L_.delete(3),await $n(e)}async function fh(s,t){const e=U(s);t?(e.L_.delete(2),await $n(e)):t||(e.L_.add(2),await nn(e),e.q_.set("Unknown"))}function Ee(s){return s.K_||(s.K_=function(e,n,i){const o=U(e);return o.w_(),new sh(n,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(s.datastore,s.asyncQueue,{Eo:uh.bind(null,s),Ro:lh.bind(null,s),mo:hh.bind(null,s),d_:ch.bind(null,s)}),s.B_.push(async t=>{t?(s.K_.s_(),us(s)?as(s):s.q_.set("Unknown")):(await s.K_.stop(),Zo(s))})),s.K_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(t,e,n,i,o){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=i,this.removalCallback=o,this.deferred=new Ht,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(u=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,i,o){const u=Date.now()+n,h=new ls(t,e,u,i,o);return h.start(n),h}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(V.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ta(s,t){if(Dt("AsyncQueue",`${t}: ${s}`),Ze(s))return new D(V.UNAVAILABLE,`${t}: ${s}`);throw s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ue{constructor(t){this.comparator=t?(e,n)=>t(e,n)||x.comparator(e.key,n.key):(e,n)=>x.comparator(e.key,n.key),this.keyedMap=Be(),this.sortedSet=new J(this.comparator)}static emptySet(t){return new ue(t.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof ue)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const i=e.getNext().key,o=n.getNext().key;if(!i.isEqual(o))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const n=new ue;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi{constructor(){this.W_=new J(x.comparator)}track(t){const e=t.doc.key,n=this.W_.get(e);n?t.type!==0&&n.type===3?this.W_=this.W_.insert(e,t):t.type===3&&n.type!==1?this.W_=this.W_.insert(e,{type:n.type,doc:t.doc}):t.type===2&&n.type===2?this.W_=this.W_.insert(e,{type:2,doc:t.doc}):t.type===2&&n.type===0?this.W_=this.W_.insert(e,{type:0,doc:t.doc}):t.type===1&&n.type===0?this.W_=this.W_.remove(e):t.type===1&&n.type===2?this.W_=this.W_.insert(e,{type:1,doc:n.doc}):t.type===0&&n.type===1?this.W_=this.W_.insert(e,{type:2,doc:t.doc}):O():this.W_=this.W_.insert(e,t)}G_(){const t=[];return this.W_.inorderTraversal((e,n)=>{t.push(n)}),t}}class ge{constructor(t,e,n,i,o,u,h,f,d){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=i,this.mutatedKeys=o,this.fromCache=u,this.syncStateChanged=h,this.excludesMetadataChanges=f,this.hasCachedResults=d}static fromInitialDocuments(t,e,n,i,o){const u=[];return e.forEach(h=>{u.push({type:0,doc:h})}),new ge(t,e,ue.emptySet(e),u,n,i,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&Un(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let i=0;i<e.length;i++)if(e[i].type!==n[i].type||!e[i].doc.isEqual(n[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dh{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(t=>t.J_())}}class ph{constructor(){this.queries=Yi(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(e,n){const i=U(e),o=i.queries;i.queries=Yi(),o.forEach((u,h)=>{for(const f of h.j_)f.onError(n)})})(this,new D(V.ABORTED,"Firestore shutting down"))}}function Yi(){return new ve(s=>Vo(s),Un)}async function ea(s,t){const e=U(s);let n=3;const i=t.query;let o=e.queries.get(i);o?!o.H_()&&t.J_()&&(n=2):(o=new dh,n=t.J_()?0:1);try{switch(n){case 0:o.z_=await e.onListen(i,!0);break;case 1:o.z_=await e.onListen(i,!1);break;case 2:await e.onFirstRemoteStoreListen(i)}}catch(u){const h=ta(u,`Initialization of query '${se(t.query)}' failed`);return void t.onError(h)}e.queries.set(i,o),o.j_.push(t),t.Z_(e.onlineState),o.z_&&t.X_(o.z_)&&hs(e)}async function na(s,t){const e=U(s),n=t.query;let i=3;const o=e.queries.get(n);if(o){const u=o.j_.indexOf(t);u>=0&&(o.j_.splice(u,1),o.j_.length===0?i=t.J_()?0:1:!o.H_()&&t.J_()&&(i=2))}switch(i){case 0:return e.queries.delete(n),e.onUnlisten(n,!0);case 1:return e.queries.delete(n),e.onUnlisten(n,!1);case 2:return e.onLastRemoteStoreUnlisten(n);default:return}}function mh(s,t){const e=U(s);let n=!1;for(const i of t){const o=i.query,u=e.queries.get(o);if(u){for(const h of u.j_)h.X_(i)&&(n=!0);u.z_=i}}n&&hs(e)}function gh(s,t,e){const n=U(s),i=n.queries.get(t);if(i)for(const o of i.j_)o.onError(e);n.queries.delete(t)}function hs(s){s.Y_.forEach(t=>{t.next()})}var Fr,Xi;(Xi=Fr||(Fr={})).ea="default",Xi.Cache="cache";class ra{constructor(t,e,n){this.query=t,this.ta=e,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=n||{}}X_(t){if(!this.options.includeMetadataChanges){const n=[];for(const i of t.docChanges)i.type!==3&&n.push(i);t=new ge(t.query,t.docs,t.oldDocs,n,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.na?this.ia(t)&&(this.ta.next(t),e=!0):this.sa(t,this.onlineState)&&(this.oa(t),e=!0),this.ra=t,e}onError(t){this.ta.error(t)}Z_(t){this.onlineState=t;let e=!1;return this.ra&&!this.na&&this.sa(this.ra,t)&&(this.oa(this.ra),e=!0),e}sa(t,e){if(!t.fromCache||!this.J_())return!0;const n=e!=="Offline";return(!this.options._a||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}ia(t){if(t.docChanges.length>0)return!0;const e=this.ra&&this.ra.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}oa(t){t=ge.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.na=!0,this.ta.next(t)}J_(){return this.options.source!==Fr.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sa{constructor(t){this.key=t}}class ia{constructor(t){this.key=t}}class _h{constructor(t,e){this.query=t,this.Ta=e,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=q(),this.mutatedKeys=q(),this.Aa=Co(t),this.Ra=new ue(this.Aa)}get Va(){return this.Ta}ma(t,e){const n=e?e.fa:new Hi,i=e?e.Ra:this.Ra;let o=e?e.mutatedKeys:this.mutatedKeys,u=i,h=!1;const f=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(t.inorderTraversal((_,w)=>{const R=i.get(_),S=qn(this.query,w)?w:null,b=!!R&&this.mutatedKeys.has(R.key),L=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let k=!1;R&&S?R.data.isEqual(S.data)?b!==L&&(n.track({type:3,doc:S}),k=!0):this.ga(R,S)||(n.track({type:2,doc:S}),k=!0,(f&&this.Aa(S,f)>0||d&&this.Aa(S,d)<0)&&(h=!0)):!R&&S?(n.track({type:0,doc:S}),k=!0):R&&!S&&(n.track({type:1,doc:R}),k=!0,(f||d)&&(h=!0)),k&&(S?(u=u.add(S),o=L?o.add(_):o.delete(_)):(u=u.delete(_),o=o.delete(_)))}),this.query.limit!==null)for(;u.size>this.query.limit;){const _=this.query.limitType==="F"?u.last():u.first();u=u.delete(_.key),o=o.delete(_.key),n.track({type:1,doc:_})}return{Ra:u,fa:n,ns:h,mutatedKeys:o}}ga(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,i){const o=this.Ra;this.Ra=t.Ra,this.mutatedKeys=t.mutatedKeys;const u=t.fa.G_();u.sort((_,w)=>function(S,b){const L=k=>{switch(k){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return O()}};return L(S)-L(b)}(_.type,w.type)||this.Aa(_.doc,w.doc)),this.pa(n),i=i!=null&&i;const h=e&&!i?this.ya():[],f=this.da.size===0&&this.current&&!i?1:0,d=f!==this.Ea;return this.Ea=f,u.length!==0||d?{snapshot:new ge(this.query,t.Ra,o,u,t.mutatedKeys,f===0,d,!1,!!n&&n.resumeToken.approximateByteSize()>0),wa:h}:{wa:h}}Z_(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Hi,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(t){return!this.Ta.has(t)&&!!this.Ra.has(t)&&!this.Ra.get(t).hasLocalMutations}pa(t){t&&(t.addedDocuments.forEach(e=>this.Ta=this.Ta.add(e)),t.modifiedDocuments.forEach(e=>{}),t.removedDocuments.forEach(e=>this.Ta=this.Ta.delete(e)),this.current=t.current)}ya(){if(!this.current)return[];const t=this.da;this.da=q(),this.Ra.forEach(n=>{this.Sa(n.key)&&(this.da=this.da.add(n.key))});const e=[];return t.forEach(n=>{this.da.has(n)||e.push(new ia(n))}),this.da.forEach(n=>{t.has(n)||e.push(new sa(n))}),e}ba(t){this.Ta=t.Ts,this.da=q();const e=this.ma(t.documents);return this.applyChanges(e,!0)}Da(){return ge.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class yh{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class Th{constructor(t){this.key=t,this.va=!1}}class vh{constructor(t,e,n,i,o,u){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=i,this.currentUser=o,this.maxConcurrentLimboResolutions=u,this.Ca={},this.Fa=new ve(h=>Vo(h),Un),this.Ma=new Map,this.xa=new Set,this.Oa=new J(x.comparator),this.Na=new Map,this.La=new ns,this.Ba={},this.ka=new Map,this.qa=me.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function Eh(s,t,e=!0){const n=ha(s);let i;const o=n.Fa.get(t);return o?(n.sharedClientState.addLocalQueryTarget(o.targetId),i=o.view.Da()):i=await oa(n,t,e,!0),i}async function Ih(s,t){const e=ha(s);await oa(e,t,!0,!1)}async function oa(s,t,e,n){const i=await Yl(s.localStore,wt(t)),o=i.targetId,u=s.sharedClientState.addLocalQueryTarget(o,e);let h;return n&&(h=await Ah(s,t,o,u==="current",i.resumeToken)),s.isPrimaryClient&&e&&Xo(s.remoteStore,i),h}async function Ah(s,t,e,n,i){s.Ka=(w,R,S)=>async function(L,k,G,Q){let W=k.view.ma(G);W.ns&&(W=await Ki(L.localStore,k.query,!1).then(({documents:v})=>k.view.ma(v,W)));const et=Q&&Q.targetChanges.get(k.targetId),Pt=Q&&Q.targetMismatches.get(k.targetId)!=null,st=k.view.applyChanges(W,L.isPrimaryClient,et,Pt);return Zi(L,k.targetId,st.wa),st.snapshot}(s,w,R,S);const o=await Ki(s.localStore,t,!0),u=new _h(t,o.Ts),h=u.ma(o.documents),f=en.createSynthesizedTargetChangeForCurrentChange(e,n&&s.onlineState!=="Offline",i),d=u.applyChanges(h,s.isPrimaryClient,f);Zi(s,e,d.wa);const _=new yh(t,e,u);return s.Fa.set(t,_),s.Ma.has(e)?s.Ma.get(e).push(t):s.Ma.set(e,[t]),d.snapshot}async function wh(s,t,e){const n=U(s),i=n.Fa.get(t),o=n.Ma.get(i.targetId);if(o.length>1)return n.Ma.set(i.targetId,o.filter(u=>!Un(u,t))),void n.Fa.delete(t);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(i.targetId),n.sharedClientState.isActiveQueryTarget(i.targetId)||await Or(n.localStore,i.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(i.targetId),e&&is(n.remoteStore,i.targetId),Ur(n,i.targetId)}).catch(Kr)):(Ur(n,i.targetId),await Or(n.localStore,i.targetId,!0))}async function Rh(s,t){const e=U(s),n=e.Fa.get(t),i=e.Ma.get(n.targetId);e.isPrimaryClient&&i.length===1&&(e.sharedClientState.removeLocalQueryTarget(n.targetId),is(e.remoteStore,n.targetId))}async function aa(s,t){const e=U(s);try{const n=await Wl(e.localStore,t);t.targetChanges.forEach((i,o)=>{const u=e.Na.get(o);u&&(Y(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?u.va=!0:i.modifiedDocuments.size>0?Y(u.va):i.removedDocuments.size>0&&(Y(u.va),u.va=!1))}),await la(e,n,t)}catch(n){await Kr(n)}}function Ji(s,t,e){const n=U(s);if(n.isPrimaryClient&&e===0||!n.isPrimaryClient&&e===1){const i=[];n.Fa.forEach((o,u)=>{const h=u.view.Z_(t);h.snapshot&&i.push(h.snapshot)}),function(u,h){const f=U(u);f.onlineState=h;let d=!1;f.queries.forEach((_,w)=>{for(const R of w.j_)R.Z_(h)&&(d=!0)}),d&&hs(f)}(n.eventManager,t),i.length&&n.Ca.d_(i),n.onlineState=t,n.isPrimaryClient&&n.sharedClientState.setOnlineState(t)}}async function Ph(s,t,e){const n=U(s);n.sharedClientState.updateQueryState(t,"rejected",e);const i=n.Na.get(t),o=i&&i.key;if(o){let u=new J(x.comparator);u=u.insert(o,mt.newNoDocument(o,M.min()));const h=q().add(o),f=new zn(M.min(),new Map,new J(j),u,h);await aa(n,f),n.Oa=n.Oa.remove(o),n.Na.delete(t),cs(n)}else await Or(n.localStore,t,!1).then(()=>Ur(n,t,e)).catch(Kr)}function Ur(s,t,e=null){s.sharedClientState.removeLocalQueryTarget(t);for(const n of s.Ma.get(t))s.Fa.delete(n),e&&s.Ca.$a(n,e);s.Ma.delete(t),s.isPrimaryClient&&s.La.gr(t).forEach(n=>{s.La.containsKey(n)||ua(s,n)})}function ua(s,t){s.xa.delete(t.path.canonicalString());const e=s.Oa.get(t);e!==null&&(is(s.remoteStore,e),s.Oa=s.Oa.remove(t),s.Na.delete(e),cs(s))}function Zi(s,t,e){for(const n of e)n instanceof sa?(s.La.addReference(n.key,t),Vh(s,n)):n instanceof ia?(N("SyncEngine","Document no longer in limbo: "+n.key),s.La.removeReference(n.key,t),s.La.containsKey(n.key)||ua(s,n.key)):O()}function Vh(s,t){const e=t.key,n=e.path.canonicalString();s.Oa.get(e)||s.xa.has(n)||(N("SyncEngine","New document in limbo: "+e),s.xa.add(n),cs(s))}function cs(s){for(;s.xa.size>0&&s.Oa.size<s.maxConcurrentLimboResolutions;){const t=s.xa.values().next().value;s.xa.delete(t);const e=new x($.fromString(t)),n=s.qa.next();s.Na.set(n,new Th(e)),s.Oa=s.Oa.insert(e,n),Xo(s.remoteStore,new Ot(wt(Xr(e.path)),n,"TargetPurposeLimboResolution",$r.oe))}}async function la(s,t,e){const n=U(s),i=[],o=[],u=[];n.Fa.isEmpty()||(n.Fa.forEach((h,f)=>{u.push(n.Ka(f,t,e).then(d=>{var _;if((d||e)&&n.isPrimaryClient){const w=d?!d.fromCache:(_=e==null?void 0:e.targetChanges.get(f.targetId))===null||_===void 0?void 0:_.current;n.sharedClientState.updateQueryState(f.targetId,w?"current":"not-current")}if(d){i.push(d);const w=ss.Wi(f.targetId,d);o.push(w)}}))}),await Promise.all(u),n.Ca.d_(i),await async function(f,d){const _=U(f);try{await _.persistence.runTransaction("notifyLocalViewChanges","readwrite",w=>P.forEach(d,R=>P.forEach(R.$i,S=>_.persistence.referenceDelegate.addReference(w,R.targetId,S)).next(()=>P.forEach(R.Ui,S=>_.persistence.referenceDelegate.removeReference(w,R.targetId,S)))))}catch(w){if(!Ze(w))throw w;N("LocalStore","Failed to update sequence numbers: "+w)}for(const w of d){const R=w.targetId;if(!w.fromCache){const S=_.os.get(R),b=S.snapshotVersion,L=S.withLastLimboFreeSnapshotVersion(b);_.os=_.os.insert(R,L)}}}(n.localStore,o))}async function Ch(s,t){const e=U(s);if(!e.currentUser.isEqual(t)){N("SyncEngine","User change. New user:",t.toKey());const n=await Wo(e.localStore,t);e.currentUser=t,function(o,u){o.ka.forEach(h=>{h.forEach(f=>{f.reject(new D(V.CANCELLED,u))})}),o.ka.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await la(e,n.hs)}}function Sh(s,t){const e=U(s),n=e.Na.get(t);if(n&&n.va)return q().add(n.key);{let i=q();const o=e.Ma.get(t);if(!o)return i;for(const u of o){const h=e.Fa.get(u);i=i.unionWith(h.view.Va)}return i}}function ha(s){const t=U(s);return t.remoteStore.remoteSyncer.applyRemoteEvent=aa.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Sh.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Ph.bind(null,t),t.Ca.d_=mh.bind(null,t.eventManager),t.Ca.$a=gh.bind(null,t.eventManager),t}class Mn{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=Kn(t.databaseInfo.databaseId),this.sharedClientState=this.Wa(t),this.persistence=this.Ga(t),await this.persistence.start(),this.localStore=this.za(t),this.gcScheduler=this.ja(t,this.localStore),this.indexBackfillerScheduler=this.Ha(t,this.localStore)}ja(t,e){return null}Ha(t,e){return null}za(t){return Ql(this.persistence,new $l,t.initialUser,this.serializer)}Ga(t){return new jl(rs.Zr,this.serializer)}Wa(t){return new Jl}async terminate(){var t,e;(t=this.gcScheduler)===null||t===void 0||t.stop(),(e=this.indexBackfillerScheduler)===null||e===void 0||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Mn.provider={build:()=>new Mn};class qr{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Ji(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=Ch.bind(null,this.syncEngine),await fh(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new ph}()}createDatastore(t){const e=Kn(t.databaseInfo.databaseId),n=function(o){return new nh(o)}(t.databaseInfo);return function(o,u,h,f){return new ih(o,u,h,f)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return function(n,i,o,u,h){return new ah(n,i,o,u,h)}(this.localStore,this.datastore,t.asyncQueue,e=>Ji(this.syncEngine,e,0),function(){return Gi.D()?new Gi:new Zl}())}createSyncEngine(t,e){return function(i,o,u,h,f,d,_){const w=new vh(i,o,u,h,f,d);return _&&(w.Qa=!0),w}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(i){const o=U(i);N("RemoteStore","RemoteStore shutting down."),o.L_.add(5),await nn(o),o.k_.shutdown(),o.q_.set("Unknown")}(this.remoteStore),(t=this.datastore)===null||t===void 0||t.terminate(),(e=this.eventManager)===null||e===void 0||e.terminate()}}qr.provider={build:()=>new qr};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ca{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ya(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ya(this.observer.error,t):Dt("Uncaught Error in snapshot listener:",t.toString()))}Za(){this.muted=!0}Ya(t,e){setTimeout(()=>{this.muted||t(e)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dh{constructor(t,e,n,i,o){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=i,this.user=pt.UNAUTHENTICATED,this.clientId=_o.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(n,async u=>{N("FirestoreClient","Received user=",u.uid),await this.authCredentialListener(u),this.user=u}),this.appCheckCredentials.start(n,u=>(N("FirestoreClient","Received new app check token=",u),this.appCheckCredentialListener(u,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Ht;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=ta(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function wr(s,t){s.asyncQueue.verifyOperationInProgress(),N("FirestoreClient","Initializing OfflineComponentProvider");const e=s.configuration;await t.initialize(e);let n=e.initialUser;s.setCredentialChangeListener(async i=>{n.isEqual(i)||(await Wo(t.localStore,i),n=i)}),t.persistence.setDatabaseDeletedListener(()=>s.terminate()),s._offlineComponents=t}async function to(s,t){s.asyncQueue.verifyOperationInProgress();const e=await Nh(s);N("FirestoreClient","Initializing OnlineComponentProvider"),await t.initialize(e,s.configuration),s.setCredentialChangeListener(n=>Wi(t.remoteStore,n)),s.setAppCheckTokenChangeListener((n,i)=>Wi(t.remoteStore,i)),s._onlineComponents=t}async function Nh(s){if(!s._offlineComponents)if(s._uninitializedComponentsProvider){N("FirestoreClient","Using user provided OfflineComponentProvider");try{await wr(s,s._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(i){return i.name==="FirebaseError"?i.code===V.FAILED_PRECONDITION||i.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(e))throw e;ce("Error using user provided cache. Falling back to memory cache: "+e),await wr(s,new Mn)}}else N("FirestoreClient","Using default OfflineComponentProvider"),await wr(s,new Mn);return s._offlineComponents}async function kh(s){return s._onlineComponents||(s._uninitializedComponentsProvider?(N("FirestoreClient","Using user provided OnlineComponentProvider"),await to(s,s._uninitializedComponentsProvider._online)):(N("FirestoreClient","Using default OnlineComponentProvider"),await to(s,new qr))),s._onlineComponents}async function Br(s){const t=await kh(s),e=t.eventManager;return e.onListen=Eh.bind(null,t.syncEngine),e.onUnlisten=wh.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=Ih.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=Rh.bind(null,t.syncEngine),e}function bh(s,t,e={}){const n=new Ht;return s.asyncQueue.enqueueAndForget(async()=>function(o,u,h,f,d){const _=new ca({next:R=>{_.Za(),u.enqueueAndForget(()=>na(o,w)),R.fromCache&&f.source==="server"?d.reject(new D(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(R)},error:R=>d.reject(R)}),w=new ra(h,_,{includeMetadataChanges:!0,_a:!0});return ea(o,w)}(await Br(s),s.asyncQueue,t,e,n)),n.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fa(s){const t={};return s.timeoutSeconds!==void 0&&(t.timeoutSeconds=s.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eo=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(s,t,e){if(!e)throw new D(V.INVALID_ARGUMENT,`Function ${s}() cannot be called with an empty ${t}.`)}function xh(s,t,e,n){if(t===!0&&n===!0)throw new D(V.INVALID_ARGUMENT,`${s} and ${e} cannot be used together.`)}function no(s){if(!x.isDocumentKey(s))throw new D(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${s} has ${s.length}.`)}function ro(s){if(x.isDocumentKey(s))throw new D(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${s} has ${s.length}.`)}function Gn(s){if(s===void 0)return"undefined";if(s===null)return"null";if(typeof s=="string")return s.length>20&&(s=`${s.substring(0,20)}...`),JSON.stringify(s);if(typeof s=="number"||typeof s=="boolean")return""+s;if(typeof s=="object"){if(s instanceof Array)return"an array";{const t=function(n){return n.constructor?n.constructor.name:null}(s);return t?`a custom ${t} object`:"an object"}}return typeof s=="function"?"a function":O()}function le(s,t){if("_delegate"in s&&(s=s._delegate),!(s instanceof t)){if(t.name===s.constructor.name)throw new D(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Gn(s);throw new D(V.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(t){var e,n;if(t.host===void 0){if(t.ssl!==void 0)throw new D(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=t.host,this.ssl=(e=t.ssl)===null||e===void 0||e;if(this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<1048576)throw new D(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}xh("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=fa((n=t.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new D(V.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new D(V.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new D(V.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(n,i){return n.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class Qn{constructor(t,e,n,i){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new so({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new D(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new so(t),t.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new _u;switch(n.type){case"firstParty":return new Eu(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new D(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const n=eo.get(e);n&&(N("ComponentProvider","Removing Datastore"),eo.delete(e),n.terminate())}(this),Promise.resolve()}}function Lh(s,t,e,n={}){var i;const o=(s=le(s,Qn))._getSettings(),u=`${t}:${e}`;if(o.host!=="firestore.googleapis.com"&&o.host!==u&&ce("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),s._setSettings(Object.assign(Object.assign({},o),{host:u,ssl:!1})),n.mockUserToken){let h,f;if(typeof n.mockUserToken=="string")h=n.mockUserToken,f=pt.MOCK_USER;else{h=du(n.mockUserToken,(i=s._app)===null||i===void 0?void 0:i.options.projectId);const d=n.mockUserToken.sub||n.mockUserToken.user_id;if(!d)throw new D(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new pt(d)}s._authCredentials=new yu(new go(h,f))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new jt(this.firestore,t,this._query)}}class vt{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ft(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new vt(this.firestore,t,this._key)}}class Ft extends jt{constructor(t,e,n){super(t,e,Xr(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new vt(this.firestore,null,new x(t))}withConverter(t){return new Ft(this.firestore,t,this._path)}}function Zh(s,t,...e){if(s=he(s),da("collection","path",t),s instanceof Qn){const n=$.fromString(t,...e);return ro(n),new Ft(s,null,n)}{if(!(s instanceof vt||s instanceof Ft))throw new D(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=s._path.child($.fromString(t,...e));return ro(n),new Ft(s.firestore,null,n)}}function tc(s,t,...e){if(s=he(s),arguments.length===1&&(t=_o.newId()),da("doc","path",t),s instanceof Qn){const n=$.fromString(t,...e);return no(n),new vt(s,null,new x(n))}{if(!(s instanceof vt||s instanceof Ft))throw new D(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=s._path.child($.fromString(t,...e));return no(n),new vt(s.firestore,s instanceof Ft?s.converter:null,new x(n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class io{constructor(t=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Yo(this,"async_queue_retry"),this.Vu=()=>{const n=Ar();n&&N("AsyncQueue","Visibility state changed to "+n.visibilityState),this.t_.jo()},this.mu=t;const e=Ar();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.fu(),this.gu(t)}enterRestrictedMode(t){if(!this.Iu){this.Iu=!0,this.Au=t||!1;const e=Ar();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.Vu)}}enqueue(t){if(this.fu(),this.Iu)return new Promise(()=>{});const e=new Ht;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Pu.push(t),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(t){if(!Ze(t))throw t;N("AsyncQueue","Operation failed with retryable error: "+t)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(t){const e=this.mu.then(()=>(this.du=!0,t().catch(n=>{this.Eu=n,this.du=!1;const i=function(u){let h=u.message||"";return u.stack&&(h=u.stack.includes(u.message)?u.stack:u.message+`
`+u.stack),h}(n);throw Dt("INTERNAL UNHANDLED ERROR: ",i),n}).then(n=>(this.du=!1,n))));return this.mu=e,e}enqueueAfterDelay(t,e,n){this.fu(),this.Ru.indexOf(t)>-1&&(e=0);const i=ls.createAndSchedule(this,t,e,n,o=>this.yu(o));return this.Tu.push(i),i}fu(){this.Eu&&O()}verifyOperationInProgress(){}async wu(){let t;do t=this.mu,await t;while(t!==this.mu)}Su(t){for(const e of this.Tu)if(e.timerId===t)return!0;return!1}bu(t){return this.wu().then(()=>{this.Tu.sort((e,n)=>e.targetTimeMs-n.targetTimeMs);for(const e of this.Tu)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.wu()})}Du(t){this.Ru.push(t)}yu(t){const e=this.Tu.indexOf(t);this.Tu.splice(e,1)}}function oo(s){return function(e,n){if(typeof e!="object"||e===null)return!1;const i=e;for(const o of n)if(o in i&&typeof i[o]=="function")return!0;return!1}(s,["next","error","complete"])}class On extends Qn{constructor(t,e,n,i){super(t,e,n,i),this.type="firestore",this._queue=new io,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new io(t),this._firestoreClient=void 0,await t}}}function ec(s,t){const e=typeof s=="object"?s:hu(),n=typeof s=="string"?s:"(default)",i=cu(e,"firestore").getImmediate({identifier:n});if(!i._initialized){const o=fu("firestore");o&&Lh(i,...o)}return i}function pa(s){if(s._terminated)throw new D(V.FAILED_PRECONDITION,"The client has already been terminated.");return s._firestoreClient||Mh(s),s._firestoreClient}function Mh(s){var t,e,n;const i=s._freezeSettings(),o=function(h,f,d,_){return new xu(h,f,d,_.host,_.ssl,_.experimentalForceLongPolling,_.experimentalAutoDetectLongPolling,fa(_.experimentalLongPollingOptions),_.useFetchStreams)}(s._databaseId,((t=s._app)===null||t===void 0?void 0:t.options.appId)||"",s._persistenceKey,i);s._componentsProvider||!((e=i.localCache)===null||e===void 0)&&e._offlineComponentProvider&&(!((n=i.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(s._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),s._firestoreClient=new Dh(s._authCredentials,s._appCheckCredentials,s._queue,o,s._componentsProvider&&function(h){const f=h==null?void 0:h._online.build();return{_offline:h==null?void 0:h._offline.build(f),_online:f}}(s._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(t){this._byteString=t}static fromBase64String(t){try{return new _e(ut.fromBase64String(t))}catch(e){throw new D(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new _e(ut.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ma{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new D(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new gt(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ga{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fs{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new D(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new D(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(t){return j(this._lat,t._lat)||j(this._long,t._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(n,i){if(n.length!==i.length)return!1;for(let o=0;o<n.length;++o)if(n[o]!==i[o])return!1;return!0}(this._values,t._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oh=/^__.*__$/;function _a(s){switch(s){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw O()}}class ps{constructor(t,e,n,i,o,u){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=i,o===void 0&&this.vu(),this.fieldTransforms=o||[],this.fieldMask=u||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(t){return new ps(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(t){var e;const n=(e=this.path)===null||e===void 0?void 0:e.child(t),i=this.Fu({path:n,xu:!1});return i.Ou(t),i}Nu(t){var e;const n=(e=this.path)===null||e===void 0?void 0:e.child(t),i=this.Fu({path:n,xu:!1});return i.vu(),i}Lu(t){return this.Fu({path:void 0,xu:!0})}Bu(t){return jr(t,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}vu(){if(this.path)for(let t=0;t<this.path.length;t++)this.Ou(this.path.get(t))}Ou(t){if(t.length===0)throw this.Bu("Document fields must not be empty");if(_a(this.Cu)&&Oh.test(t))throw this.Bu('Document fields cannot begin and end with "__"')}}class Fh{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||Kn(t)}Qu(t,e,n,i=!1){return new ps({Cu:t,methodName:e,qu:n,path:gt.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Uh(s){const t=s._freezeSettings(),e=Kn(s._databaseId);return new Fh(s._databaseId,!!t.ignoreUndefinedProperties,e)}function qh(s,t,e,n=!1){return ms(e,s.Qu(n?4:3,t))}function ms(s,t){if(ya(s=he(s)))return jh("Unsupported field value:",t,s),Bh(s,t);if(s instanceof ga)return function(n,i){if(!_a(i.Cu))throw i.Bu(`${n._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${n._methodName}() is not currently supported inside arrays`);const o=n._toFieldTransform(i);o&&i.fieldTransforms.push(o)}(s,t),null;if(s===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),s instanceof Array){if(t.settings.xu&&t.Cu!==4)throw t.Bu("Nested arrays are not supported");return function(n,i){const o=[];let u=0;for(const h of n){let f=ms(h,i.Lu(u));f==null&&(f={nullValue:"NULL_VALUE"}),o.push(f),u++}return{arrayValue:{values:o}}}(s,t)}return function(n,i){if((n=he(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return nl(i.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const o=rt.fromDate(n);return{timestampValue:Lr(i.serializer,o)}}if(n instanceof rt){const o=new rt(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:Lr(i.serializer,o)}}if(n instanceof fs)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof _e)return{bytesValue:qo(i.serializer,n._byteString)};if(n instanceof vt){const o=i.databaseId,u=n.firestore._databaseId;if(!u.isEqual(o))throw i.Bu(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:Bo(n.firestore._databaseId||i.databaseId,n._key.path)}}if(n instanceof ds)return function(u,h){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:u.toArray().map(f=>{if(typeof f!="number")throw h.Bu("VectorValues must only contain numeric values.");return Jr(h.serializer,f)})}}}}}}(n,i);throw i.Bu(`Unsupported field value: ${Gn(n)}`)}(s,t)}function Bh(s,t){const e={};return yo(s)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):tn(s,(n,i)=>{const o=ms(i,t.Mu(n));o!=null&&(e[n]=o)}),{mapValue:{fields:e}}}function ya(s){return!(typeof s!="object"||s===null||s instanceof Array||s instanceof Date||s instanceof rt||s instanceof fs||s instanceof _e||s instanceof vt||s instanceof ga||s instanceof ds)}function jh(s,t,e){if(!ya(e)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(e)){const n=Gn(e);throw n==="an object"?t.Bu(s+" a custom object"):t.Bu(s+" "+n)}}const zh=new RegExp("[~\\*/\\[\\]]");function Kh(s,t,e){if(t.search(zh)>=0)throw jr(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,s,!1,void 0,e);try{return new ma(...t.split("."))._internalPath}catch{throw jr(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,s,!1,void 0,e)}}function jr(s,t,e,n,i){const o=n&&!n.isEmpty(),u=i!==void 0;let h=`Function ${t}() called with invalid data`;e&&(h+=" (via `toFirestore()`)"),h+=". ";let f="";return(o||u)&&(f+=" (found",o&&(f+=` in field ${n}`),u&&(f+=` in document ${i}`),f+=")"),new D(V.INVALID_ARGUMENT,h+s+f)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ta{constructor(t,e,n,i,o){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=i,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new vt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new $h(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(Wn("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class $h extends Ta{data(){return super.data()}}function Wn(s,t){return typeof t=="string"?Kh(s,t):t instanceof ma?t._internalPath:t._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function va(s){if(s.limitType==="L"&&s.explicitOrderBy.length===0)throw new D(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class gs{}class Ea extends gs{}function nc(s,t,...e){let n=[];t instanceof gs&&n.push(t),n=n.concat(e),function(o){const u=o.filter(f=>f instanceof _s).length,h=o.filter(f=>f instanceof Hn).length;if(u>1||u>0&&h>0)throw new D(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const i of n)s=i._apply(s);return s}class Hn extends Ea{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new Hn(t,e,n)}_apply(t){const e=this._parse(t);return Ia(t._query,e),new jt(t.firestore,t.converter,Dr(t._query,e))}_parse(t){const e=Uh(t.firestore);return function(o,u,h,f,d,_,w){let R;if(d.isKeyField()){if(_==="array-contains"||_==="array-contains-any")throw new D(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${_}' queries on documentId().`);if(_==="in"||_==="not-in"){uo(w,_);const S=[];for(const b of w)S.push(ao(f,o,b));R={arrayValue:{values:S}}}else R=ao(f,o,w)}else _!=="in"&&_!=="not-in"&&_!=="array-contains-any"||uo(w,_),R=qh(h,u,w,_==="in"||_==="not-in");return tt.create(d,_,R)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function rc(s,t,e){const n=t,i=Wn("where",s);return Hn._create(i,n,e)}class _s extends gs{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new _s(t,e)}_parse(t){const e=this._queryConstraints.map(n=>n._parse(t)).filter(n=>n.getFilters().length>0);return e.length===1?e[0]:It.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(i,o){let u=i;const h=o.getFlattenedFilters();for(const f of h)Ia(u,f),u=Dr(u,f)}(t._query,e),new jt(t.firestore,t.converter,Dr(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class ys extends Ea{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new ys(t,e)}_apply(t){const e=function(i,o,u){if(i.startAt!==null)throw new D(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new D(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Je(o,u)}(t._query,this._field,this._direction);return new jt(t.firestore,t.converter,function(i,o){const u=i.explicitOrderBy.concat([o]);return new Te(i.path,i.collectionGroup,u,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(t._query,e))}}function sc(s,t="asc"){const e=t,n=Wn("orderBy",s);return ys._create(n,e)}function ao(s,t,e){if(typeof(e=he(e))=="string"){if(e==="")throw new D(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Po(t)&&e.indexOf("/")!==-1)throw new D(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const n=t.path.child($.fromString(e));if(!x.isDocumentKey(n))throw new D(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Vi(s,new x(n))}if(e instanceof vt)return Vi(s,e._key);throw new D(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Gn(e)}.`)}function uo(s,t){if(!Array.isArray(s)||s.length===0)throw new D(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Ia(s,t){const e=function(i,o){for(const u of i)for(const h of u.getFlattenedFilters())if(o.indexOf(h.op)>=0)return h.op;return null}(s.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new D(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new D(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}class Gh{convertValue(t,e="none"){switch(Zt(t)){case 0:return null;case 1:return t.booleanValue;case 2:return X(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(Jt(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw O()}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return tn(t,(i,o)=>{n[i]=this.convertValue(o,e)}),n}convertVectorValue(t){var e,n,i;const o=(i=(n=(e=t.fields)===null||e===void 0?void 0:e.value.arrayValue)===null||n===void 0?void 0:n.values)===null||i===void 0?void 0:i.map(u=>X(u.doubleValue));return new ds(o)}convertGeoPoint(t){return new fs(X(t.latitude),X(t.longitude))}convertArray(t,e){return(t.values||[]).map(n=>this.convertValue(n,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=Qr(t);return n==null?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(He(t));default:return null}}convertTimestamp(t){const e=qt(t);return new rt(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=$.fromString(t);Y(Qo(n));const i=new Ye(n.get(1),n.get(3)),o=new x(n.popFirst(5));return i.isEqual(e)||Dt(`Document ${o} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class Aa extends Ta{constructor(t,e,n,i,o,u){super(t,e,n,i,u),this._firestore=t,this._firestoreImpl=t,this.metadata=o}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new Nn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(Wn("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}}class Nn extends Aa{data(t={}){return super.data(t)}}class wa{constructor(t,e,n,i){this._firestore=t,this._userDataWriter=e,this._snapshot=i,this.metadata=new ze(i.hasPendingWrites,i.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new Nn(this._firestore,this._userDataWriter,n.key,n,new ze(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new D(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(i,o){if(i._snapshot.oldDocs.isEmpty()){let u=0;return i._snapshot.docChanges.map(h=>{const f=new Nn(i._firestore,i._userDataWriter,h.doc.key,h.doc,new ze(i._snapshot.mutatedKeys.has(h.doc.key),i._snapshot.fromCache),i.query.converter);return h.doc,{type:"added",doc:f,oldIndex:-1,newIndex:u++}})}{let u=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(h=>o||h.type!==3).map(h=>{const f=new Nn(i._firestore,i._userDataWriter,h.doc.key,h.doc,new ze(i._snapshot.mutatedKeys.has(h.doc.key),i._snapshot.fromCache),i.query.converter);let d=-1,_=-1;return h.type!==0&&(d=u.indexOf(h.doc.key),u=u.delete(h.doc.key)),h.type!==1&&(u=u.add(h.doc),_=u.indexOf(h.doc.key)),{type:Qh(h.type),doc:f,oldIndex:d,newIndex:_}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}}function Qh(s){switch(s){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return O()}}class Ts extends Gh{constructor(t){super(),this.firestore=t}convertBytes(t){return new _e(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new vt(this.firestore,null,e)}}function ic(s){s=le(s,jt);const t=le(s.firestore,On),e=pa(t),n=new Ts(t);return va(s._query),bh(e,s._query).then(i=>new wa(t,n,s,i))}function oc(s,...t){var e,n,i;s=he(s);let o={includeMetadataChanges:!1,source:"default"},u=0;typeof t[u]!="object"||oo(t[u])||(o=t[u],u++);const h={includeMetadataChanges:o.includeMetadataChanges,source:o.source};if(oo(t[u])){const w=t[u];t[u]=(e=w.next)===null||e===void 0?void 0:e.bind(w),t[u+1]=(n=w.error)===null||n===void 0?void 0:n.bind(w),t[u+2]=(i=w.complete)===null||i===void 0?void 0:i.bind(w)}let f,d,_;if(s instanceof vt)d=le(s.firestore,On),_=Xr(s._key.path),f={next:w=>{t[u]&&t[u](Wh(d,s,w))},error:t[u+1],complete:t[u+2]};else{const w=le(s,jt);d=le(w.firestore,On),_=w._query;const R=new Ts(d);f={next:S=>{t[u]&&t[u](new wa(d,R,w,S))},error:t[u+1],complete:t[u+2]},va(s._query)}return function(R,S,b,L){const k=new ca(L),G=new ra(S,k,b);return R.asyncQueue.enqueueAndForget(async()=>ea(await Br(R),G)),()=>{k.Za(),R.asyncQueue.enqueueAndForget(async()=>na(await Br(R),G))}}(pa(d),_,h,f)}function Wh(s,t,e){const n=e.docs.get(t._key),i=new Ts(s);return new Aa(s,i,t._key,n,new ze(e.hasPendingWrites,e.fromCache),t.converter)}(function(t,e=!0){(function(i){ye=i})(pu),au(new uu("firestore",(n,{instanceIdentifier:i,options:o})=>{const u=n.getProvider("app").getImmediate(),h=new On(new Tu(n.getProvider("auth-internal")),new Au(n.getProvider("app-check-internal")),function(d,_){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new D(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ye(d.options.projectId,_)}(u,i),u);return o=Object.assign({useFetchStreams:e},o),h._setSettings(o),h},"PUBLIC").setMultipleInstances(!0)),vi(Ii,"4.7.3",t),vi(Ii,"4.7.3","esm2017")})();export{ic as a,sc as b,Zh as c,tc as d,ec as g,oc as o,nc as q,rc as w};
