<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentByName } from "@/util/tournamentUtilFunctions.js"

import ScheduleGroups from '@/components/frontend/Schedule/ScheduleGroups.vue';
import ScheduleKO from '@/components/frontend/Schedule/ScheduleKO.vue';

let tournament = ref();
const getTournament = async () => {
   let tournamentName = "Weck BiPo Open 2023";
   tournament.value = await getTournamentByName(tournamentName);
}
getTournament();

let updateInterval = setInterval(() => {
   getTournament();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});
</script>

<template>
   <div class="ScheduleTab" v-if="tournament">
      <!-- Tabs -->
      <ul class="nav nav-tabs  justify-content-center" id="myTab" role="tablist">
         <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#GameScheduleGroups" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Gruppenphase</button>
         </li>
         <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#GameScheduleKO" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">K.o.Phase</button>
         </li>
      </ul>

      <!-- Content -->
      <div class="tab-content">
         <div class="tab-pane fade show active" id="GameScheduleGroups" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
            <ScheduleGroups :tournament="tournament"/>
         </div>
         <div class="tab-pane fade" id="GameScheduleKO" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <ScheduleKO :tournament="tournament"/>
         </div>
      </div>
   </div>
</template>

<style scoped>
.ScheduleTab{
   margin-top: 50px;
}
</style>
