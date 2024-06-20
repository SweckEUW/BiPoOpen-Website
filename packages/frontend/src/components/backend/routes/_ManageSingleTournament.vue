<script setup lang="ts">
import { ref } from "vue"
import { useRoute } from "vue-router";
import { getTournamentByName } from "@/util/tournamentUtilFunctions.js"

import TeamsTab from '@/components/backend/manageSingleTournament/TeamsTab.vue';
import ScheduleSettings from '@/components/backend/manageSingleTournament/ScheduleSettings.vue';
import GroupsTab from '@/components/backend/manageSingleTournament/groups/GroupsTab.vue';
import Schedule from '@/components/frontend/routes/tournament/schedule/Schedule.vue';

let tournament = ref();

const route = useRoute();
const getTournament = async () => {
   let tournamentName = (route.params.id as string).replaceAll("-"," ");
   tournament.value = await getTournamentByName(tournamentName);
}
getTournament();
</script>

<template>
   <div class="ManageTournament" v-if="tournament">
      <h1 class="mt-title">{{ 'Turnier: ' + tournament.name}}</h1>

      <!-- Tabs -->
      <ul class="nav nav-tabs" id="myTab" role="tablist">
         <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Teams</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Gruppen</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="result-tab" data-bs-toggle="tab" data-bs-target="#result-tab-pane" type="button" role="tab" aria-controls="result-tab-pane" aria-selected="false">Spielplan</button>
         </li>
      </ul>

      <!-- Content -->
      <div class="tab-content">
         <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
            <TeamsTab :getTournament="getTournament" :tournament="tournament"/>
         </div>
         <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <GroupsTab :getTournament="getTournament" :tournament="tournament"/>
         </div>
         <div class="tab-pane fade" id="result-tab-pane" role="tabpanel" aria-labelledby="result-tab" tabindex="0">
            <ScheduleSettings :getTournament="getTournament" :tournament="tournament"/>
            <Schedule :getTournament="getTournament" :tournament="tournament" :isBackend="true"/>
         </div>
      </div>

   </div>
</template>

<style>
.ManageTournament .nav-tabs{
   top: 140px !important;
   position: sticky;
   z-index: 2;
   background-color: white;
}
.ManageTournament .Schedule .nav-tabs{
   top: 185px !important;
}
.ManageTournament .Schedule .swiper-pagination{
   top: 245px !important;
}
.mt-title{
   top: 90px !important;
   position: sticky;
   z-index: 2;
   background-color: white;
   margin-bottom: 0;
   padding-bottom: 10px;
}
.ManageTournament button{
   font-size: 20px;
}

/* MOBILE */
@media (width <= 900px){
   .mt-title{
      font-size: 20px;
      top: 78px !important;
   }
   .ManageTournament .nav-tabs{
      top: 110px !important;
   }
   .ManageTournament .Schedule .nav-tabs{
      top: 155px !important;
   }
   .ManageTournament .Schedule .swiper-pagination{
      top: 195px !important;
   }
}
</style>
