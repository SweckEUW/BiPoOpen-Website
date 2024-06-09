<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getMatchesGroupPhase, getTournamentWithRouterID } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Swiper from 'swiper';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';

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
               </div>

               <!-- Matches -->
               <div class="rt-matches">
                  <MatchElement v-for="(match, matchIndex) in matchesForGroup" :key="match._id" :match="match" :matchIndex="matchIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="true" :isBackend="false"/>
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
.rt-caption{
   margin-bottom: 10px;
   font-size: 42px;
   font-weight: bold;
   text-align: center;
   color: var(--main-color);
}
</style>