import{g as u}from"./tournamentUtilFunctions-Cipius7h.js";import{S as i}from"./Schedule-DC1fVaIm.js";import{L as p}from"./Loadingscreen-DK7jHSdu.js";import{d as m,r as d,v as _,o as a,c as s,a as h,t as f,u as t,k as l,b as o,A as g}from"./index-DirBr2-m.js";import"./MatchElement-CI3yWCqh.js";import"./Modal-DXGmOVWN.js";import"./pagination-CEgt5EwY.js";const k={class:"Schedule"},v={class:"bp-title"},y={key:2,style:{"text-align":"center","margin-top":"50px","font-size":"30px",color:"var(--main-color)"}},L=m({__name:"_Schedule",setup(S){const n=g();let e=d();const r=async()=>{e.value=await u(n.params.id)};r();let c=setInterval(()=>{r()},1e4);return _(()=>{clearInterval(c)}),(x,B)=>(a(),s("div",k,[h("h1",v,f("Spielplan "+t(n).params.id.replaceAll("-"," ")),1),t(e)?o("",!0):(a(),l(p,{key:0})),t(e)&&t(e).groupPhase.groups?(a(),l(i,{key:1,tournament:t(e),getTournament:r,isBackend:!1},null,8,["tournament"])):o("",!0),t(e)&&!t(e).groupPhase.groups?(a(),s("div",y," Turnierplan wurde noch nicht erstellt ")):o("",!0)]))}});export{L as default};