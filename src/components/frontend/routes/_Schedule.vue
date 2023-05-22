<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentByName } from "@/util/tournamentUtilFunctions.js"

import Schedule from '@/components/shared/schedule/Schedule.vue';

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
   <Schedule v-if="tournament" :tournament="tournament" :getTournament="getTournament" :isBackend="false"/>
</template>

<style scoped>
</style>
