import{g as u}from"./tournamentUtilFunctions-BvgtZ-F1.js";import{S as i}from"./Schedule-DgX4pKav.js";import{L as p}from"./Loadingscreen-CVxXk0gt.js";import{d as m,r as d,x as _,o as a,c as s,a as h,t as f,u as t,k as l,b as o,B as g}from"./index-B_P9r_5F.js";import"./MatchElement-VUxYBxsO.js";import"./Modal-DHMPpVBp.js";import"./pagination-CEgt5EwY.js";const k={class:"Schedule"},v={class:"bp-title"},x={key:2,style:{"text-align":"center","margin-top":"50px","font-size":"30px",color:"var(--main-color)"}},N=m({__name:"_Schedule",setup(y){const n=g();let e=d();const r=async()=>{e.value=await u(n.params.id)};r();let c=setInterval(()=>{r()},1e4);return _(()=>{clearInterval(c)}),(B,S)=>(a(),s("div",k,[h("h1",v,f("Spielplan "+t(n).params.id.replaceAll("-"," ")),1),t(e)?o("",!0):(a(),l(p,{key:0})),t(e)&&t(e).groupPhase.groups?(a(),l(i,{key:1,tournament:t(e),getTournament:r,isBackend:!1},null,8,["tournament"])):o("",!0),t(e)&&!t(e).groupPhase.groups?(a(),s("div",x," Turnierplan wurde noch nicht erstellt ")):o("",!0)]))}});export{N as default};