<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID } from "@/util/tournamentUtilFunctions.js"

import Schedule from '@/components/frontend/routes/tournament/schedule/Schedule.vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';

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
</script>

<template>
   <div class="Schedule">
      
      <h1 class="bp-title">{{"Spielplan " + route.params.id }}</h1>

      <Loadingscreen v-show="!tournament"/>
      <Schedule v-show="tournament && tournament.groupPhase.groups" :tournament="tournament"/>

      <div style="text-align: center; margin-top: 50px; font-size: 30px; color: var(--main-color);" v-if="tournament && !tournament.groupPhase.groups">
         Turnierplan wurde noch nicht erstellt
      </div>
   </div>
</template>