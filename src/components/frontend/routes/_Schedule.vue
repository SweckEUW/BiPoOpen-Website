<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentByName } from "@/util/tournamentUtilFunctions.js"

import Schedule from '@/components/shared/schedule/Schedule.vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';

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
   <div class="Schedule">
      <Loadingscreen v-show="!tournament"/>
      <Schedule v-show="tournament" :tournament="tournament" :getTournament="getTournament" :isBackend="false"/>
   </div>
</template>

<style scoped>
</style>
