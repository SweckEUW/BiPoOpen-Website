<script setup lang="ts">
import { onMounted, PropType } from "vue"
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { convertNumberToCharacter } from "@/util/util"; 
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const props = defineProps({
   getTournament: {type: Function, required: true },
   tournament: {type: Object as PropType<Tournament>, required: true },
   isBackend: {type: Boolean, required: true },
});

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
   new Swiper('#GameScheduleKOSwiper',{
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

   // TODO-Minor: enlarged MatchElement gets cut off because height is set as fixed
   // swiper.on('slideChange', () => {
   //    let element = document.getElementsByClassName("gsk-stage")[swiper.activeIndex] as HTMLDivElement;
   //    let root = document.getElementById("GameScheduleKOSwiper") as HTMLDivElement;
   //    root.style.height = element.offsetHeight + "px";
   // });
});

const setGameResult = () => {
   // let result:MatchResult = {
   //    team1Score: (team1Player1Score.value ? team1Player1Score.value : 0) + (team1Player2Score.value ? team1Player2Score.value : 0),
   //    team1Player1Score: team1Player1Score.value!, 
   //    team1Player2Score: team1Player2Score.value!, 

   //    team2Score: (team2Player1Score.value ? team2Player1Score.value : 0) + (team2Player2Score.value ? team2Player2Score.value : 0),
   //    team2Player1Score: team2Player1Score.value!, 
   //    team2Player2Score: team2Player2Score.value!
   // }

   // if(!props.tournament.settings.trackPlayerShots){
   //    result = {
   //       team1Score: team1Score.value!,
   //       team2Score: team2Score.value!
   //    }
   // }

   // await setGameResultKOPhase(props.tournament, props.match._id, result);
   // await props.getTournament();
}
</script>

<template>

   <div class="swiper-pagination" id="GameScheduleKOSwiper-Pagination"/>

   <div class="GameScheduleKO swiper-container" id="GameScheduleKOSwiper">

         <div class="swiper-wrapper">

            <div v-for="(stage, stageIndex) in tournament.koPhase.matches" :key="stageIndex" class="gsk-stages swiper-slide">
               <div class="gsk-stage" :class="{'gsk-stage1': stageIndex == 0, 'gsk-finale': stageIndex == tournament.koPhase.matches.length - 1}">
                  <div class="gsk-match" v-for="(match, matchIndex) in stage" :key="matchIndex">
                     <div v-if="stageIndex == tournament.koPhase.matches.length - 1" class="gsk-match-name">{{ (matchIndex == 0 ? "Finale" : "Spiel um Platz 3")}}</div>
                     <div v-if="stageIndex != tournament.koPhase.matches.length - 1" class="gsk-match-table">{{ "Tisch " + convertNumberToCharacter(matchIndex + 1) }}</div>
                     <MatchElement :match="match" :key="match._id" :isGroupPhase="false" :isBackend="isBackend" :setGameResult="setGameResult"/>
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
.swiper-wrapper{
   overflow: visible;
}

/* Top Swiper Pagination */
.Schedule .swiper-pagination{
   width: 100%;
   min-height: 100%;
   position: sticky;
   padding-top: 10px;
   top: 280px;
   padding-bottom: 20px;
   display: flex;
   background-color: white;
}
.Schedule .swiper-pagination-bullet {
	padding: 5px 10px; 
	border-radius: 0;
	width: auto;
   height: auto;
	text-align: center;
	color: var(--secondary-color);
   background-color: transparent;
   opacity: 1; 
   margin: 0;
   flex: 1 1 0;
   text-align: center;
}
.Schedule .swiper-pagination-bullet-active {
	color:white;
	background: var(--main-color);
}

.gsk-finale{
   justify-content: center;
}
.gsk-match-table{
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

/*MOBILE*/
@media (width <= 900px){
   .Schedule .swiper-pagination{
      top: 230px;
   }
   .Schedule .swiper-pagination-bullet {
      font-size: 15px;
   }
}

/*MOBILE S*/
@media (width <= 360px){
   .Schedule .swiper-pagination-bullet {
      font-size: 12px;
   }
}
</style>
