import{d as f,r as I,j as g,o as t,c as a,a as e,t as l,u as s,k as i,v as p,b as T,F as m,l as _,m as b,p as S,h as k,_ as y}from"./index-c6gHceKV.js";import{g as w,i as x}from"./tournamentUtilFunctions-4EFAir92.js";import{L as B}from"./Loadingscreen-BDfjQxlB.js";const D=n=>(S("data-v-6394a497"),n=n(),k(),n),L={class:"MVP"},N={class:"bp-title"},V={class:"table table-hover caption-top"},F=D(()=>e("thead",null,[e("tr",null,[e("th",null,"Nr."),e("th",null,"Teamname"),e("th",null,"Spieler")])],-1)),R=f({__name:"_Teams",setup(n){const u=b();let o=I();const c=async()=>{o.value=await w(u.params.id)};c();let h=setInterval(()=>{c()},1e4);return g(()=>{clearInterval(h)}),(j,A)=>(t(),a("div",L,[e("h1",N,l("Teams "+s(u).params.id),1),i(T(B,null,null,512),[[p,!s(o)]]),i(e("table",V,[F,e("tbody",null,[(t(!0),a(m,null,_(s(x)(s(o)),(r,v)=>(t(),a("tr",{key:r.name},[e("td",null,l(v+1),1),e("td",null,l(r.name),1),e("td",null,[(t(!0),a(m,null,_(r.players,d=>(t(),a("div",{key:d},l(d),1))),128))])]))),128))])],512),[[p,s(o)]])]))}}),P=y(R,[["__scopeId","data-v-6394a497"]]);export{P as default};