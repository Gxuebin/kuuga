(function(e){function t(t){for(var n,o,s=t[0],l=t[1],p=t[2],u=0,f=[];u<s.length;u++)o=s[u],i[o]&&f.push(i[o][0]),i[o]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(e[n]=l[n]);c&&c(t);while(f.length)f.shift()();return a.push.apply(a,p||[]),r()}function r(){for(var e,t=0;t<a.length;t++){for(var r=a[t],n=!0,s=1;s<r.length;s++){var l=r[s];0!==i[l]&&(n=!1)}n&&(a.splice(t--,1),e=o(o.s=r[0]))}return e}var n={},i={app:0},a=[];function o(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=e,o.c=n,o.d=function(e,t,r){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(r,n,function(t){return e[t]}.bind(null,n));return r},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="./";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],l=s.push.bind(s);s.push=t,s=s.slice();for(var p=0;p<s.length;p++)t(s[p]);var c=l;a.push([0,"chunk-vendors"]),r()})({0:function(e,t,r){e.exports=r("56d7")},"56d7":function(e,t,r){"use strict";r.r(t);r("cadf"),r("551c"),r("f751"),r("097d");var n=r("2b0e"),i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("div",{staticClass:"list"},[e._l(e.appList,function(t,i){return n("div",{key:i,staticClass:"list-item",class:{active:e.activeIndex===i},on:{click:function(t){return e.activeApp(i)},mouseenter:function(t){return e.activeApp(i,!1)}}},[n("el-tooltip",{attrs:{content:t.name,placement:"right",effect:"light"}},[n("img",{attrs:{src:[t.previewUrl?t.previewUrl:r("a367")],alt:""}})])],1)}),n("div",{staticClass:"list-item create",on:{mouseenter:function(t){return e.activeApp("",!1)}}},[n("el-tooltip",{attrs:{content:"Create new",placement:"right",effect:"light"}},[n("i",{staticClass:"el-icon-plus"})])],1)],2),n("div",{staticClass:"content"},[n("img",{staticClass:"logo",attrs:{src:r("dbaa")}}),n("el-form",{attrs:{model:e.form,"label-width":"55px","label-position":"left"}},[n("el-form-item",{attrs:{label:"URL",required:!0}},[n("el-input",{model:{value:e.form.url,callback:function(t){e.$set(e.form,"url",t)},expression:"form.url"}})],1),n("el-form-item",{attrs:{label:"NAME",required:!0}},[n("el-input",{model:{value:e.form.name,callback:function(t){e.$set(e.form,"name",t)},expression:"form.name"}})],1),n("el-form-item",[e.form.previewUrl?e._e():n("label",{staticClass:"uploader",on:{dragover:function(e){e.preventDefault()},drop:function(t){return t.stopPropagation(),t.preventDefault(),e.onDrop(t)}}},[e._v("\n          Drop a PNG or click here to set an icon\n          "),n("input",{attrs:{type:"file"},on:{change:e.onChange}})]),e.form.previewUrl?n("div",{staticClass:"preview"},[n("img",{attrs:{src:e.form.previewUrl,alt:""}}),n("div",{staticClass:"delete",on:{click:e.deleteAppIcon}},[n("i",{staticClass:"el-icon-delete"})])]):e._e()]),n("el-form-item",[n("div",{staticClass:"btnbox"},[""!==e.activeIndex?n("el-button",{attrs:{type:"danger",size:"small"},on:{click:e.deleteApp}},[e._v("Delete")]):e._e(),""!==e.activeIndex?n("el-button",{attrs:{type:"primary",size:"small"},on:{click:e.updateApp}},[e._v("Update")]):e._e(),""===e.activeIndex?n("el-button",{attrs:{type:"success",size:"small",disabled:!e.allowcreate},on:{click:e.createApp}},[e._v("Create")]):e._e()],1)])],1),n("span",{staticClass:"version"},[e._v(e._s(e.currentVersion))])],1)])},a=[],o=r("f499"),s=r.n(o),l=(r("7f7f"),window.require("electron")),p=l.ipcRenderer,c={data:function(){return{form:{url:"",name:"",previewUrl:"",iconPath:""},currentVersion:"",activeIndex:"",appList:[]}},computed:{allowcreate:function(){return!!this.form.url&&!!this.form.name}},mounted:function(){var e=this,t=localStorage.getItem("appList")||"[]";this.appList=JSON.parse(t),p.send("get-version"),p.on("get-version-result",function(t,r){e.currentVersion="v."+r})},methods:{onDrop:function(e){var t=e.dataTransfer.files.path;this.checkType(e.dataTransfer.files[0]),this.setAppIcon(t)},onChange:function(e){var t=e.target.files[0].path;this.checkType(e.target.files[0]),this.setAppIcon(t)},checkType:function(e){if("image/png"!==e.type)return this.$message({message:'TypeError! Only type "image/png" was allowed!',type:"error"}),!1;var t=new FileReader,r=this;t.onload=function(e){r.form.previewUrl=e.target.result},t.readAsDataURL(e)},setAppIcon:function(e){this.form.iconPath=e},deleteAppIcon:function(){this.form.previewUrl="",this.form.iconPath=""},createApp:function(){p.send("createApp",this.form),this.appList.push(this.form),localStorage.setItem("appList",s()(this.appList)),this.reset()},activeApp:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.activeIndex=e,""!==e?this.form=this.appList[e]:this.reset(),t&&p.send("createApp",this.form)},deleteApp:function(){p.send("deleteApp",this.appList[this.activeIndex].name),this.appList.splice(this.activeIndex,1),localStorage.setItem("appList",s()(this.appList)),this.reset()},updateApp:function(){this.appList[this.activeIndex]=this.form,localStorage.setItem("appList",s()(this.appList))},reset:function(){this.form={name:"",url:"",previewUrl:"",iconPath:""},this.activeIndex=""}}},u=c,f=(r("8b1e"),r("2877")),d=Object(f["a"])(u,i,a,!1,null,"696c597a",null),m=d.exports,h=(r("6423"),r("5c96")),v=r.n(h);r("0fae");n["default"].use(v.a),n["default"].config.productionTip=!1,new n["default"]({render:function(e){return e(m)}}).$mount("#app")},6423:function(e,t,r){},"8b1e":function(e,t,r){"use strict";var n=r("ee59"),i=r.n(n);i.a},a367:function(e,t,r){e.exports=r.p+"img/kuuga.png"},dbaa:function(e,t,r){e.exports=r.p+"img/kuuga-white.png"},ee59:function(e,t,r){}});
//# sourceMappingURL=app.js.map