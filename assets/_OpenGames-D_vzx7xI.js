import{d as V,r as f,i as L,j as M,w as _,a as e,c as m,F as S,k as x,f as N,o as d,u as g,n as q,l as B,_ as F,B as H,m as T,p as I,q as W,t as h,e as P,b as E,s as C,v as U,x as J,h as K,T as R,y as Q}from"./index-BxpynI-P.js";import{g as X,a as Y,b as A,c as z}from"./OpenGamesUtilFunctions-WN5R6We_.js";import{M as Z}from"./Modal-Bffjwu3R.js";import{L as ee}from"./Loadingscreen-Dhu2IbmX.js";import{S as te,P as ne}from"./pagination-TG8ow4BB.js";import{s as ae,f as le}from"./index-CjGvPitj.js";import{M as se}from"./MatchElement-Dub9cex2.js";import"./tournamentMatchFunctions-ttmkJZAU.js";const ie={class:"rt-modal"},oe=["id"],de={class:"rt-modal-team"},re={id:"openGameNames"},ce=["value"],ge={class:"rt-modal-buttons"},ue=["onClick"],pe=V({__name:"ModalAddOpenGame",props:{toggleModalAddGame:{type:Function,required:!0},getOpenGames:{type:Function,required:!0}},setup(i){let a=f(1),n=f(1),r=f([]);L(async()=>{r.value=await X()});const v=i,l=async()=>{let k={_id:"placeholder",team1:{_id:"placeholder",players:[]},team2:{_id:"placeholder",players:[]},time:new Date().getTime()};for(let s=1;s<3;s++){let G=document.getElementById("addOpenGameModal-team-"+s).getElementsByClassName("rt-modal-team");for(let u=0;u<G.length;u++){let t=G[u].getElementsByClassName("rt-modal-input-player")[0].value.trim(),o=parseFloat(G[u].getElementsByClassName("rt-modal-input-number")[0].value.trim()),O={_id:"placeholder",name:t,score:o};s==1?k.team1.players.push(O):k.team2.players.push(O)}}await Y(k)&&(await v.getOpenGames(),v.toggleModalAddGame())};return(k,c)=>(d(),M(Z,null,{title:_(()=>[...c[2]||(c[2]=[N("Ergebnis eintragen",-1)])]),template:_(()=>[e("div",ie,[(d(),m(S,null,x(2,s=>e("div",{id:"addOpenGameModal-team-"+s,class:"rt-modal-container"},[(d(!0),m(S,null,x(s==1?g(a):g(n),w=>(d(),m("div",de,[e("input",{list:"openGameNames",class:"rt-modal-input-player",type:"string",placeholder:"Spielername",style:q({textAlign:s==1?"right":"left",order:s==1?1:3})},null,4),e("datalist",re,[(d(!0),m(S,null,x(g(r),G=>(d(),m("option",{value:G},null,8,ce))),256))]),c[3]||(c[3]=e("input",{class:"rt-modal-input-number",type:"number",placeholder:"0"},null,-1))]))),256)),e("div",ge,[e("div",{onClick:w=>s==1?B(a)?a.value++:a++:B(n)?n.value++:n++},"+",8,ue)])],8,oe)),64))])]),cancle:_(()=>[e("div",{onClick:c[0]||(c[0]=s=>{i.toggleModalAddGame()})},"Abbrechen")]),confirm:_(()=>[e("div",{onClick:c[1]||(c[1]=s=>l())},"Eintragen")]),_:1}))}}),he=F(pe,[["__scopeId","data-v-7c010029"]]);var me=`
    .p-toggleswitch {
        display: inline-block;
        width: dt('toggleswitch.width');
        height: dt('toggleswitch.height');
    }

    .p-toggleswitch-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border-radius: dt('toggleswitch.border.radius');
    }

    .p-toggleswitch-slider {
        cursor: pointer;
        width: 100%;
        height: 100%;
        border-width: dt('toggleswitch.border.width');
        border-style: solid;
        border-color: dt('toggleswitch.border.color');
        background: dt('toggleswitch.background');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            border-color dt('toggleswitch.transition.duration'),
            outline-color dt('toggleswitch.transition.duration'),
            box-shadow dt('toggleswitch.transition.duration');
        border-radius: dt('toggleswitch.border.radius');
        outline-color: transparent;
        box-shadow: dt('toggleswitch.shadow');
    }

    .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: dt('toggleswitch.handle.background');
        color: dt('toggleswitch.handle.color');
        width: dt('toggleswitch.handle.size');
        height: dt('toggleswitch.handle.size');
        inset-inline-start: dt('toggleswitch.gap');
        margin-block-start: calc(-1 * calc(dt('toggleswitch.handle.size') / 2));
        border-radius: dt('toggleswitch.handle.border.radius');
        transition:
            background dt('toggleswitch.transition.duration'),
            color dt('toggleswitch.transition.duration'),
            inset-inline-start dt('toggleswitch.slide.duration'),
            box-shadow dt('toggleswitch.slide.duration');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.background');
        border-color: dt('toggleswitch.checked.border.color');
    }

    .p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.background');
        color: dt('toggleswitch.handle.checked.color');
        inset-inline-start: calc(dt('toggleswitch.width') - calc(dt('toggleswitch.handle.size') + dt('toggleswitch.gap')));
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
        background: dt('toggleswitch.hover.background');
        border-color: dt('toggleswitch.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.hover.background');
        color: dt('toggleswitch.handle.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
        background: dt('toggleswitch.checked.hover.background');
        border-color: dt('toggleswitch.checked.hover.border.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.checked.hover.background');
        color: dt('toggleswitch.handle.checked.hover.color');
    }

    .p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
        box-shadow: dt('toggleswitch.focus.ring.shadow');
        outline: dt('toggleswitch.focus.ring.width') dt('toggleswitch.focus.ring.style') dt('toggleswitch.focus.ring.color');
        outline-offset: dt('toggleswitch.focus.ring.offset');
    }

    .p-toggleswitch.p-invalid > .p-toggleswitch-slider {
        border-color: dt('toggleswitch.invalid.border.color');
    }

    .p-toggleswitch.p-disabled {
        opacity: 1;
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-slider {
        background: dt('toggleswitch.disabled.background');
    }

    .p-toggleswitch.p-disabled .p-toggleswitch-handle {
        background: dt('toggleswitch.handle.disabled.background');
    }
`,we={root:{position:"relative"}},ve={root:function(a){var n=a.instance,r=a.props;return["p-toggleswitch p-component",{"p-toggleswitch-checked":n.checked,"p-disabled":r.disabled,"p-invalid":n.$invalid}]},input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},be=H.extend({name:"toggleswitch",style:me,classes:ve,inlineStyles:we}),fe={name:"BaseToggleSwitch",extends:ae,props:{trueValue:{type:null,default:!0},falseValue:{type:null,default:!1},readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},inputId:{type:String,default:null},inputClass:{type:[String,Object],default:null},inputStyle:{type:Object,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:be,provide:function(){return{$pcToggleSwitch:this,$parentInstance:this}}},D={name:"ToggleSwitch",extends:fe,inheritAttrs:!1,emits:["change","focus","blur"],methods:{getPTOptions:function(a){var n=a==="root"?this.ptmi:this.ptm;return n(a,{context:{checked:this.checked,disabled:this.disabled}})},onChange:function(a){if(!this.disabled&&!this.readonly){var n=this.checked?this.falseValue:this.trueValue;this.writeValue(n,a),this.$emit("change",a)}},onFocus:function(a){this.$emit("focus",a)},onBlur:function(a){var n,r;this.$emit("blur",a),(n=(r=this.formField).onBlur)===null||n===void 0||n.call(r,a)}},computed:{checked:function(){return this.d_value===this.trueValue},dataP:function(){return le({checked:this.checked,disabled:this.disabled,invalid:this.$invalid})}}},ke=["data-p-checked","data-p-disabled","data-p"],ye=["id","checked","tabindex","disabled","readonly","aria-checked","aria-labelledby","aria-label","aria-invalid"],Se=["data-p"],Ge=["data-p"];function Oe(i,a,n,r,v,l){return d(),m("div",T({class:i.cx("root"),style:i.sx("root")},l.getPTOptions("root"),{"data-p-checked":l.checked,"data-p-disabled":i.disabled,"data-p":l.dataP}),[e("input",T({id:i.inputId,type:"checkbox",role:"switch",class:[i.cx("input"),i.inputClass],style:i.inputStyle,checked:l.checked,tabindex:i.tabindex,disabled:i.disabled,readonly:i.readonly,"aria-checked":l.checked,"aria-labelledby":i.ariaLabelledby,"aria-label":i.ariaLabel,"aria-invalid":i.invalid||void 0,onFocus:a[0]||(a[0]=function(){return l.onFocus&&l.onFocus.apply(l,arguments)}),onBlur:a[1]||(a[1]=function(){return l.onBlur&&l.onBlur.apply(l,arguments)}),onChange:a[2]||(a[2]=function(){return l.onChange&&l.onChange.apply(l,arguments)})},l.getPTOptions("input")),null,16,ye),e("div",T({class:i.cx("slider")},l.getPTOptions("slider"),{"data-p":l.dataP}),[e("div",T({class:i.cx("handle")},l.getPTOptions("handle"),{"data-p":l.dataP}),[I(i.$slots,"handle",{checked:l.checked})],16,Ge)],16,Se)],16,ke)}D.render=Oe;const xe={style:{padding:"15px 0px","text-align":"center",color:"var(--main-color)","font-weight":"bold","font-size":"14px"}},Ce={class:"flex w-full justify-center items-center pb-[20px]"},_e={class:"mr-[20px]",style:{color:"var(--main-color)"}},Te={class:"OpenGamesStatistics swiper-container",id:"OpenGamesStatisticsSwiper"},Me={class:"swiper-wrapper"},Pe={class:"table table-hover caption-top"},$e={style:{height:"auto"}},Be={key:0,class:"ogs-explain"},Ee=V({__name:"OpenGamesStatistics",props:{openGames:{type:Object,required:!0}},setup(i){const a=i;let n=f("averageWins"),r=f(!1),v=f(!0),l=f(window.screen.width);window.addEventListener("resize",()=>{l.value=window.screen.width});const k=W(()=>{let u=a.openGames;if(v.value){let p=["Edu Schimpf","Alex Klein","Linda Jahrberg","Emely Müller","Leo Straub","Lea Ableitner","Nico Sanchez"];u=a.openGames.filter(b=>{let y=b.team1.players.some($=>p.includes($.name)),j=b.team2.players.some($=>p.includes($.name));return!y&&!j})}let t=A(u,!0),o=A(u,!1),O=[t,o];return O.forEach(p=>{p.sort((b,y)=>n.value=="name"?r.value?b[n.value].localeCompare(y[n.value]):y[n.value].localeCompare(b[n.value]):y[n.value]==b[n.value]?r.value?y.placement-b.placement:b.placement-y.placement:r.value?b[n.value]-y[n.value]:y[n.value]-b[n.value])}),O}),c=u=>{n.value==u?r.value=!r.value:r.value=!1,n.value=u},s=u=>{if(u==n.value)return r.value?"ogs-arrow ogs-arrow-up":"ogs-arrow ogs-arrow-down"},w=f([]);L(async()=>{new te("#OpenGamesStatisticsSwiper",{modules:[ne],initialSlide:0,spaceBetween:50,speed:500,pagination:{el:"#OpenGamesStatisticsSwiper-Pagination",clickable:!0,renderBullet:(t,o)=>'<span class="'+o+'">'+(t==0?"1 vs. 1":"2 vs. 2")+"</span>"}}),(await z()).forEach(t=>{t.team1.players.forEach(o=>{o.score==0&&w.value.push({...o,time:t.time})}),t.team2.players.forEach(o=>{o.score==0&&w.value.push({...o,time:t.time})})})});let G=u=>{let t=new Date(u),o=t.getHours()+":"+(t.getMinutes()<10?"0":"")+t.getMinutes();return t.toLocaleDateString("de-DE")+"  -  "+o+" Uhr"};return(u,t)=>(d(),m(S,null,[t[9]||(t[9]=e("div",{style:{padding:"15px 0px","text-align":"center",color:"var(--main-color)","font-weight":"bold","font-size":"14px"}}," Damit ein Spieler in den Statistiken erscheint, muss er gegen mindestens 4 verschiedene Teams gespielt haben ",-1)),e("div",xe,[t[7]||(t[7]=N(h("Nackte Meile Tracker:")+" ",-1)),(d(!0),m(S,null,x(w.value,o=>(d(),m("div",null,h(o.name)+" - "+h(g(G)(o.time)),1))),256))]),t[10]||(t[10]=e("div",{class:"swiper-pagination",id:"OpenGamesStatisticsSwiper-Pagination"},null,-1)),e("div",Ce,[e("div",_e,h(g(v)?"Ohne Ost-Deutschland":"Mit Ost-Deutschland"),1),P(g(D),{modelValue:g(v),"onUpdate:modelValue":t[0]||(t[0]=o=>B(v)?v.value=o:v=o),pt:{slider:{style:"background-color: var(--main-color);"}}},null,8,["modelValue"])]),e("div",Te,[e("div",Me,[(d(!0),m(S,null,x(k.value,(o,O)=>(d(),m("div",{class:"rt-table swiper-slide",key:O},[e("table",Pe,[e("thead",null,[e("tr",$e,[e("th",{onClick:t[1]||(t[1]=p=>c("placement")),class:C(s("placement"))},h(g(l)>900?"Platz":"Pl."),3),e("th",{onClick:t[2]||(t[2]=p=>c("name")),class:C(s("name"))},h("Name"),2),e("th",{onClick:t[3]||(t[3]=p=>c("wins")),class:C(s("wins"))},h(g(l)>900?"Siege":"Sieg."),3),e("th",{onClick:t[4]||(t[4]=p=>c("ammountOfMatches")),class:C(s("ammountOfMatches"))},h(g(l)>900?"Spiele":"Spi."),3),e("th",{onClick:t[5]||(t[5]=p=>c("averageHits")),class:C(s("averageHits"))},h(g(l)>900?"Trefferquote":"Trfq."),3),e("th",{onClick:t[6]||(t[6]=p=>c("averageWins")),class:C(s("averageWins"))},h(g(l)>900?"Siegwahrscheinlichkeit":"Siegwahr."),3)])]),e("tbody",null,[(d(!0),m(S,null,x(o,(p,b)=>(d(),m("tr",{key:b},[e("td",null,h(p.placement+1),1),e("td",null,h(p.name.replace(" ",`
`)),1),e("td",null,h(p.wins),1),e("td",null,h(p.ammountOfMatches),1),e("td",null,h(p.averageHits.toFixed(2)),1),e("td",null,h(p.averageWins+"%"),1)]))),128))])]),g(l)<900?(d(),m("div",Be,[...t[8]||(t[8]=[e("div",null,"*Pl. = Platz",-1),e("div",null,"*Spi. = Spiele",-1),e("div",null,"*Sieg. = Siege",-1),e("div",null,"*Trfq. = Trefferquote",-1),e("div",null,"*Siegwahr. = Siegwahrscheinlichkeit",-1)])])):E("",!0)]))),128))])])],64))}}),Ve={class:"OpenGames"},Ae={class:"tab-content",id:"OpenGamesStatisticsContainer"},Le={class:"tab-pane fade show active",id:"OpenGamesMain"},Ne={class:"og-time"},Fe={class:"tab-pane fade",id:"OpenGamesStats"},ze=V({__name:"_OpenGames",setup(i){let a=f([]),n=f(!0),r=f(!1),v=c=>{let s=new Date(c),w=s.getHours()+":"+(s.getMinutes()<10?"0":"")+s.getMinutes();return s.toLocaleDateString("de-DE")+"  -  "+w+" Uhr"};const l=async()=>{a.value=await z(),a.value=a.value.reverse(),n.value=!1};l();const k=()=>{r.value=!r.value};return(c,s)=>(d(),m("div",Ve,[s[2]||(s[2]=e("h1",{class:"bp-title"},"Offene Spiele",-1)),g(n)?(d(),M(ee,{key:0})):E("",!0),U(e("div",null,[e("div",{class:"bp-button",onClick:s[0]||(s[0]=w=>k())},"Spiel eintragen"),(d(),M(Q,{to:"body"},[P(R,{name:"fade"},{default:_(()=>[g(r)?(d(),M(he,{key:0,toggleModalAddGame:k,getOpenGames:l})):E("",!0)]),_:1})])),s[1]||(s[1]=K('<ul class="nav nav-tabs justify-content-center" data-v-8ad76393><li class="nav-item" data-v-8ad76393><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#OpenGamesMain" data-v-8ad76393>Vergangene Spiele</button></li><li class="nav-item" data-v-8ad76393><button class="nav-link" data-bs-toggle="tab" data-bs-target="#OpenGamesStats" data-v-8ad76393>Statistiken</button></li></ul>',1)),e("div",Ae,[e("div",Le,[(d(!0),m(S,null,x(g(a),w=>(d(),m("div",{key:w.time,style:{"margin-top":"10px"}},[e("div",Ne,h(g(v)(w.time)),1),P(se,{match:w},null,8,["match"])]))),128))]),e("div",Fe,[P(Ee,{openGames:g(a)},null,8,["openGames"])])])],512),[[J,!g(n)]])]))}}),Ke=F(ze,[["__scopeId","data-v-8ad76393"]]);export{Ke as default};
