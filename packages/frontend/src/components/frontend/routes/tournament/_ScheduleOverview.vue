<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getMatchesGroupPhase, getTournamentWithRouterID } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Swiper from 'swiper';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import MatchElement from '@/components/shared/MatchElement.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref();
const getTournament = async () => {
   tournament.value = await getTournamentWithRouterID(route.params.id as string);
}
getTournament();

let updateInterval = setInterval(() => {
   getTournament();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});

const initSwiper = async () => {
   await getTournament();
   setTimeout(() => {
      new Swiper('#SwiperScheduleOverview',{
         modules: [Pagination, Navigation, Autoplay],
         spaceBetween: 100,
         speed: 2000,
         direction: 'horizontal',
         mousewheel: {
            invert: true,
         },
         loop: true,
         observer: true,
         pagination: {
            el: '#SwiperPaginationScheduleOverview',
            clickable: true,
         },
         autoplay: {
            delay: 7000,
            disableOnInteraction: false,
         },
      });
   }, 0); 
};
initSwiper();
</script>

<template>
   <div class="ResultsTab">

      <div id="SwiperScheduleOverview" class="swiper">
         <div class="swiper-wrapper">

            <div class="rt-table swiper-slide" v-for="(matchesForGroup ,groupIndex) in getMatchesGroupPhase(tournament)" :key="groupIndex">

               <!-- Caption -->
               <div class="rt-caption">
                  <div>{{ "Gruppe " + convertNumberToCharacter(groupIndex + 1)}}</div>
                  <div>{{ "Tisch " + (groupIndex + 1) }}</div>
               </div>

               <div class="rt-rows">

                  <!-- First Row -->
                  <div class="rt-row1">
                     <div>#</div>
                     <div style="color: var(--main-color)">Team 1</div>
                     <div></div>
                     <div style="color: var(--secondary-color)">Team 2</div>
                  </div>

                  <!-- Matches -->
                  <div class="rt-matches">
                     <div class="rt-match" v-for="(match, matchIndex) in matchesForGroup" :key="match">
                        <hr style="margin: 2px 0px">
                        <MatchElement :match="match" :matchIndex="matchIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="true" :isBackend="false"/>
                     </div>
                  </div>

               </div>
            </div>

         </div>

         <div id="SwiperPaginationScheduleOverview"/>
      </div>

   </div>
</template>

<style scoped>
#SwiperPaginationScheduleOverview{
   margin-top: 40px;
   text-align: center;
}
.rt-table{
   margin-top: 0 !important;
}
</style>

<!-- Copied from SchedueGroups.vue -->
<style scoped>
.rt-table{
   margin-top: 50px;
}
.rt-caption{
   margin-bottom: 10px;
}
.rt-caption div:nth-child(1){
   font-size: 28px;
   font-weight: bold;
   color: var(--main-color);
}
.rt-caption div:nth-child(2){
   font-size: 20px;
   color: var(--main-color);
   opacity: 0.7;
}
.rt-rows{
   display: flex;
   flex-direction: column;
   align-items: center;
}
.rt-row1{
   display: flex;
   width: 100%;
   text-align: center;
   font-weight: bold;
   font-size: 20px;
   margin-bottom: 5px;
}
.rt-row1 div:nth-child(1){
   width: 40px; /* same width as .mt-index from MatchElement.vue */
}
.rt-row1 div:nth-child(2){
   text-align: right;
   color: var(--main-color);
}
.rt-row1 div:nth-child(2), .rt-row1 div:nth-child(4){
   flex-grow: 1;
   font-size: 24px;
}
.rt-row1 div:nth-child(3){
   width: 110px; /* same width as .mt-result from MatchElement.vue */
}
.rt-row1 div:nth-child(4){
   text-align: left;
   color: var(--secondary-color);
}
.rt-matches{
   width: 100%;
}

/*MOBILE*/
@media (width <= 900px){
   .rt-row1{
      font-size: 16px;
   }
   .rt-row1 div:nth-child(1){
      display: none;
   }
   .rt-row1 div:nth-child(3){
      width: 60px;
   }
}
</style>