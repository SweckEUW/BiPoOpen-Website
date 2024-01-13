<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID, getTeamFromID } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref();
let firstPlace = ref();
let secondPlace = ref();
let thirdPlace = ref();
const getTournament = async () => {
    tournament.value = await getTournamentWithRouterID(route.params.id as string);
    firstPlace.value = getMatchWinner(tournament.value.koPhase.matches.at(-1)[0]);
    secondPlace.value = getMatchLooser(tournament.value.koPhase.matches.at(-1)[0]);
    thirdPlace.value = getMatchWinner(tournament.value.koPhase.matches.at(-1)[1]);
}
getTournament();

let updateInterval = setInterval(() => {
   getTournament();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});

const getMatchWinner = (match:any) => {
    let team = match.result.team1Score > match.result.team2Score ? match.team1ID : match.team2ID;
    team = getTeamFromID(tournament.value, team);
    return team;
}
const getMatchLooser = (match:any) => {
    let team = match.result.team1Score < match.result.team2Score ? match.team1ID : match.team2ID;
    team = getTeamFromID(tournament.value, team);
    return team;
}
</script>

<template>
    <div class="Summary">
        
        <h1 class="bp-title">{{"Zusammenfassung " + route.params.id }}</h1>

        <Loadingscreen v-show="!tournament"/>

        <div  v-if="tournament">
            
            <!-- Platzierung -->
            <div>
                <div>
                    {{ "1. Platz: " + firstPlace.name }}
                </div>

                <div>
                    {{ "2. Platz: " + secondPlace.name }}
                </div>

                <div>
                    {{ "3. Platz: " + thirdPlace.name }}
                </div>
            </div>

            <!-- MVP -->
            <div v-if="tournament">
                
            </div>

        </div>
    </div>
</template>

<style scoped>

</style>