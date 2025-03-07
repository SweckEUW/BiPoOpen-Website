<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID } from "@/util/tournamentUtilFunctions.js"

import Schedule from '@/components/frontend/tournament/schedule/Schedule.vue';
import MVP from '@/components/frontend/tournament/_MVP.vue';
import Photos from '@/components/frontend/tournament/photos/_Photos.vue';
import Overview from '@/components/frontend/tournament/_Overview.vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref<Tournament|undefined>();
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

const getTournamentPhotos = () => {
   if(tournament.value!.name == "Weck BiPo Open 2024")
      return {
			driveImageIDs: "2024/driveImageIDs.json",
			poster: "2024/poster.jpg",
         text: `Ein großes Dankeschön an Patrik Finger, der am Weck BiPo Open 2023 über 1500 Fotos geschossen hat. 
               <br>
               Folgt ihm gerne auf Instagram 
               <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger</a>
            `
		}
   
   if(tournament.value!.name == "Weck BiPo Open 2023")
      return {
			driveImageIDs: "2023/driveImageIDs.json",
			poster: "2023/poster.jpg",
         text: `Ein großes Dankeschön an Patrik Finger, der am Weck BiPo Open 2024 wieder als Fotograf tätig war. 
               <br>
               Folgt ihm gerne auf Instagram 
               <a href="https://www.instagram.com/fingerontrigger" target="_blank">@fingerontrigger</a>  
            `
		}

   if(tournament.value!.name == "Weck BiPo Open 2022")
      return {
            driveImageIDs: "2022/driveImageIDs.json",
            poster: "2022/poster.jpg"
         }

   if(tournament.value!.name == "Weck BiPo Open 2021")
      return {
            driveImageIDs: "2021/driveImageIDs.json",
            poster: "2021/poster.jpg"
         }

   if(tournament.value!.name == "Weck BiPo Open 2020")
      return {
            driveImageIDs: "2020/driveImageIDs.json",
            poster: "2020/poster.jpg"
         }
   
}
</script>

<template>
    <div class="Tournament">

        <Loadingscreen v-if="!tournament"/>

        <div v-if="tournament && tournament.groupPhase.groups">

            <h1 class="bp-title">{{ tournament.name }}</h1>

            <!-- Tabs -->
            <ul class="nav nav-tabs justify-content-center">
               <!-- <li class="nav-item">
                  <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="'#GameOverview' + tournament._id">Übersicht</button>
               </li> -->
               <li class="nav-item">
                  <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="'#GameSchedule' + tournament._id">Spielplan</button>
               </li>
               <li class="nav-item" v-if="tournament.settings.trackPlayerShots">
                  <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#GameMVP' + tournament._id">MVP</button>
               </li>
               <li class="nav-item" v-if="getTournamentPhotos()">
                  <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#GameFotos' + tournament._id">Fotos</button>
               </li>
            </ul>

            <!-- Content -->
            <div class="tab-content" id="GameScheduleContainer">
               <!-- <div class="tab-pane fade show active" :id="'GameOverview' + tournament._id">
                  <Overview/>
               </div> -->
               <div class="tab-pane fade show active" :id="'GameSchedule' + tournament._id">
                  <Schedule :tournament="tournament" :getTournament="getTournament" :isBackend="false"/>
               </div>
               <div class="tab-pane fade" :id="'GameMVP' + tournament._id" v-if="tournament.settings.trackPlayerShots">
                  <MVP :tournament="tournament"/>
               </div>
               <div class="tab-pane fade" :id="'GameFotos' + tournament._id" v-if="getTournamentPhotos()">
                  <Photos :tournamentPhotos="getTournamentPhotos()"/>
               </div>
         </div>
        </div>
    </div>
</template>

<style scoped>
.nav-tabs{
   position: sticky;
   top: 160px;
   background: white;
   z-index: 2;
}
.nav-link{
   border-radius: 0px;
   width: 40vw;
   padding: 15px 10px;
   color: var(--secondary-color);
   font-weight: bold;
}
.nav-item{
   flex: 1;
}
.nav-item .active{
   background-color: var(--main-color) !important;
   color: white !important;
}
.nav-item button{
   width: 100%;
}
/* MOBILE */
@media (width <= 900px){
   .nav-tabs{
      top: 130px;
      padding-bottom: 20px;
   }
   .nav-link{
      font-size: 14px;
      padding: 10px 10px;
   }
}
</style>