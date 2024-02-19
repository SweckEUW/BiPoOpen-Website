<script setup lang="ts">
import { onMounted } from "vue"
import { getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";
import MatchElement from '@/components/shared/MatchElement.vue';
import Swiper, { Pagination } from 'swiper';
import 'swiper/swiper-bundle.min.css';

const props = defineProps(['getTournament','tournament','isBackend'])

const getStageText = (stageIndex:number) => {
   let ammountOfStages = props.tournament.koPhase.matches.length - 1;

   if(ammountOfStages - stageIndex == 3)
      return "Achtelfinale"
   if(ammountOfStages - stageIndex == 2)
      return "Viertelfinale"
   if(ammountOfStages - stageIndex == 1)
      return "Halbfinale"
   if(ammountOfStages - stageIndex == 0)
      return "Finale"
}

onMounted(() => {
   let swiper = new Swiper('#GameScheduleKOSwiper',{
      modules: [Pagination],
      initialSlide: 0,
      spaceBetween: 50,
      speed: 500,
      pagination: {
         el: "#GameScheduleKOSwiper-Pagination",
         clickable: true,
         renderBullet: (index, className) => {
            return '<span class="' + className + '">' + getStageText(index) + '</span>';
         }
      }
   });

   swiper.on('slideChange',() => {
      let element = document.getElementsByClassName("gsk-stage")[swiper.activeIndex] as HTMLDivElement;
      let root = document.getElementById("GameScheduleKOSwiper") as HTMLDivElement;
      root.style.height = element.clientHeight + "px";
   });
});
</script>

<template>

   <div class="swiper-pagination" id="GameScheduleKOSwiper-Pagination"/>

   <div class="GameScheduleKO swiper-container" id="GameScheduleKOSwiper">

         <div class="swiper-wrapper">

            <div v-for="(stage, stageIndex) in getMatchesKOPhase(tournament)" :key="stageIndex" class="gsk-stages swiper-slide">
               <div class="gsk-stage" :class="{'gsk-stage1': stageIndex == 0, 'gsk-finale': stageIndex == tournament.koPhase.matches.length - 1}">
                  <div class="gsk-match" v-for="(match, matchIndex) in stage" :key="matchIndex">
                     <div v-if="stageIndex == tournament.koPhase.matches.length - 1" class="gsk-match-name">{{ (matchIndex == 0 ? "Finale" : "Spiel um Platz 3")}}</div>
                     <div v-if="stageIndex != tournament.koPhase.matches.length - 1" class="gsk-match-table">{{ "Tisch " + (matchIndex + 1) }}</div>
                     <MatchElement class="gsk-matchElement" :match="match" :stageIndex="stageIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="false" :isBackend="isBackend"/>
                  </div>
               </div>
            </div>

         </div>

   </div>
</template>

<style>
.GameScheduleKO{
   overflow: hidden;
}

/* Top Swiper Pagination */
.Schedule .swiper-pagination{
   position: sticky !important;
   top: 180px !important;
   padding-top: 10px !important;
   padding-bottom: 20px !important;
   display: flex !important;
   background-color: white !important;
}
.Schedule .swiper-pagination-bullet {
	padding: 5px 10px !important; 
	border-radius: 0 !important;
	width: auto !important;
   height: auto !important;
	text-align: center !important;
	color: var(--secondary-color) !important;
   background-color: transparent !important;
   opacity: 1 !important; 
   margin: 0 !important;
   flex: 1 1 0 !important;
   text-align: center !important;
}
.Schedule .swiper-pagination-bullet-active {
	color:white !important;
	background: var(--main-color) !important;
}


.gsk-stage{
   min-height: 100%;
}
.gsk-finale{
   justify-content: center;
}
.gsk-match{
   border: 1px solid black;
   padding: 10px;
   margin: 20px;
   margin-left: 0px;
   margin-bottom: 10px;
}
.gsk-match-table{
   margin-bottom: 5px;
   display: inline-block;
   color: var(--main-color);
}
.gsk-match-name{
   font-size: 18px;
   font-weight: bold;
   display: inline-block;
   white-space: break-spaces;
   color: var(--main-color);
}
.gsk-matchElement{
   width: 600px; 
   height: 115px !important;
}

/*MOBILE*/
@media (width <= 900px){
   .gsk-matchElement{
      width: 90vw;
      height: 125px;
   }
   .gsk-match{
      padding: 5px;
      margin: 5px;
      margin-top: 0px;
      margin-left: 0px;
   }
}
</style>
