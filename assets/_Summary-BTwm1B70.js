import{d as b,y as w,r as C,j as A,o as l,c as r,a as e,t as u,u as t,k as S,v as y,b as B,e as k,g as c,F as d,l as h,m as E,p as F,h as L,_ as N}from"./index-c6gHceKV.js";import{g as W,i as M,j,f as z,h as x,k as I,l as G}from"./tournamentUtilFunctions-4EFAir92.js";import{L as H}from"./Loadingscreen-BDfjQxlB.js";const m=_=>(F("data-v-7d0f1fcf"),_=_(),L(),_),R={class:"Summary"},K={class:"bp-title"},U={key:0,style:{"text-align":"center","margin-top":"50px","font-size":"30px",color:"var(--main-color)"}},Z=m(()=>e("h2",{style:{"margin-top":"10px"}},"Fakten",-1)),q=m(()=>e("strong",null,"Teams: ",-1)),J=m(()=>e("strong",null,"Spiele: ",-1)),Q=m(()=>e("strong",null,"Getrunkene Becher: ",-1)),X=m(()=>e("strong",null,"Höchster Sieg: ",-1)),Y={class:"sum-images"},$=["src"],ee=m(()=>e("h2",null,"Platzierungen",-1)),te={class:"sum-images"},se=["src"],ae={key:0},ne=m(()=>e("h2",null,"Most Valuable Player",-1)),le={class:"sum-images"},re=["src"],oe=b({__name:"_Summary",setup(_){const p=E();let g=w.find(n=>n.name==p.params.id),a=C();const f=async()=>{a.value=await W(p.params.id)};f();let T=setInterval(()=>{f()},1e4);A(()=>{clearInterval(T)});let D=()=>{let n=0;return x(a.value).forEach(o=>{n+=o.length}),I(a.value).forEach(o=>{n+=o.length}),n},P=()=>{let n=0;return M(a.value).forEach(s=>{n+=G(a.value,s.name,!1)}),n},O=()=>{let n=x(a.value);n=n.concat(I(a.value));let o=[].concat(...n);o=o.filter(i=>i.result),o=o.sort((i,v)=>{let V=Math.abs(i.result.team1Score-i.result.team2Score);return Math.abs(v.result.team1Score-v.result.team2Score)-V});let s=o[0];return s?s.team1.name+" "+s.result.team1Score+" - "+s.result.team2Score+" "+s.team2.name:""};return(n,o)=>(l(),r("div",R,[e("h1",K,u("Zusammenfassung "+t(p).params.id),1),S(B(H,null,null,512),[[y,!t(a)]]),t(a)&&!t(a).groupPhase.groups?(l(),r("div",U," Turnierplan wurde noch nicht erstellt ")):k("",!0),S(e("div",null,[e("div",null,[Z,e("div",null,[q,c(u(t(M)(t(a)).length),1)]),e("div",null,[J,c(u(t(D)()),1)]),e("div",null,[Q,c(u(t(P)()),1)]),e("div",null,[X,c(u(t(O)()),1)]),e("div",Y,[(l(!0),r(d,null,h(t(g).summary.facts.images,s=>(l(),r("img",{src:s,alt:""},null,8,$))),256))])]),e("div",null,[ee,(l(!0),r(d,null,h(t(j)(t(a)).slice(0,3),(s,i)=>(l(),r("div",null,[e("div",null,[e("strong",null,u(i+1+". "),1),c(u(s.name),1)])]))),256)),e("div",te,[(l(!0),r(d,null,h(t(g).summary.standings.images,s=>(l(),r("img",{src:s,alt:""},null,8,se))),256))])]),t(g).mvp?(l(),r("div",ae,[ne,(l(!0),r(d,null,h(t(z)(t(a)).slice(0,3),(s,i)=>(l(),r("div",null,[e("div",null,[e("strong",null,u(i+1+". "),1),c(u(s.name),1)])]))),256)),e("div",le,[(l(!0),r(d,null,h(t(g).summary.mvp.images,s=>(l(),r("img",{src:s,alt:""},null,8,re))),256))])])):k("",!0)],512),[[y,t(a)&&t(a).groupPhase.groups]])]))}}),de=N(oe,[["__scopeId","data-v-7d0f1fcf"]]);export{de as default};