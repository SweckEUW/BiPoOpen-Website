<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID, getTopTeams, getMVPList, getMatchesGroupPhase, getMatchesKOPhase, getAllTeams} from "@/util/tournamentUtilFunctions.js"
import { getAmmountOfDrunkenCupsFromteam } from "@/util/tournamentStatsFunctions";
import tournaments from '@/assets/tournaments.json';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournamentData = tournaments.find((tournament:any) => tournament.year == route.params.id)!;

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

let getAmmountOfMatches = () => {
    let ammountOfMatches = 0;

    getMatchesGroupPhase(tournament.value).forEach((matches:any) => {
        ammountOfMatches += matches.length
    });
    getMatchesKOPhase(tournament.value).forEach((matches:any) => {
        ammountOfMatches += matches.length
    });

    return ammountOfMatches;
};

let getAmmountOfDrunkenCups = () => {
    let ammountOfDrunkenCups = 0;

    let teams = getAllTeams(tournament.value);
    teams.forEach((team:any) => {
        ammountOfDrunkenCups += getAmmountOfDrunkenCupsFromteam(tournament.value, team.name, false);
    });

    return ammountOfDrunkenCups;
};

let getHighestWin = () => {
    let matches = getMatchesGroupPhase(tournament.value);
    matches = matches.concat(getMatchesKOPhase(tournament.value));
    let allMatches:any = [].concat(...matches);
    allMatches = allMatches.filter((match:any) => match.result);

    allMatches = allMatches.sort((match1:any, match2:any) => {
        let diff1 = Math.abs(match1.result.team1Score - match1.result.team2Score);
        let diff2 = Math.abs(match2.result.team1Score - match2.result.team2Score);
        return diff2 - diff1;
    });

    let highestWin = allMatches[0];
    if(highestWin)
        return highestWin.team1.name + " " + highestWin.result.team1Score + " - " + highestWin.result.team2Score + " " + highestWin.team2.name
    
    return ""
}
</script>

<template>
    <div class="Summary">
        
        <h1 class="bp-title">{{"Zusammenfassung " + route.params.id }}</h1>

        <Loadingscreen v-show="!tournament"/>

        <div style="text-align: center; margin-top: 50px; font-size: 30px; color: var(--main-color);" v-if="tournament && !tournament.groupPhase.groups">
            Turnierplan wurde noch nicht erstellt
        </div>

        <div v-show="tournament && tournament.groupPhase.groups">
            
            <!-- Facts -->
            <div>
                <h2 style="margin-top: 10px;">Fakten</h2>

                <div><strong>Teams: </strong>{{getAllTeams(tournament).length }}</div>
                <div><strong>Spiele: </strong>{{getAmmountOfMatches() }}</div>
                <div><strong>Getrunkene Becher: </strong>{{getAmmountOfDrunkenCups() }}</div>
                <div><strong>Höchster Sieg: </strong>{{getHighestWin()}}</div>
                <!-- <div>{{ "Höste Treffer Differenz" }}</div> -->
                <!-- <div>{{ "Spieler am meisten Becher getrunken" }}</div> -->
                <!-- <div>{{ "Spieler mit den meisten gesamten Treffern" }}</div> -->
                <!-- <div>{{ "Anzahl an Verlängerungen" }}</div> -->

                <div class="sum-images">
                    <img v-for="image in tournamentData.summary.facts.images" :src="image" alt="">
                </div>
            </div>

            <!-- Platzierung -->
            <div>
                <h2>Platzierungen</h2>

                <div v-for="(team, i) in getTopTeams(tournament).slice(0,3)">
                    <div><strong>{{ i + 1 + ". "}}</strong>{{ team.name }}</div>
                </div>

                <div class="sum-images">
                    <img v-for="image in tournamentData.summary.standings.images" :src="image" alt="">
                </div>
            </div>
            

            <!-- MVP -->
            <div v-if="tournamentData.mvp">
                <h2>Most Valuable Player</h2>

                <div v-for="(player, i) in getMVPList(tournament).slice(0,3)">
                    <div><strong>{{ i + 1 + ". "}}</strong>{{ player.name }}</div>
                </div>

                <div class="sum-images">
                    <img v-for="image in tournamentData.summary.mvp.images" :src="image" alt="">
                </div>
            </div>
            

        </div>
    </div>
</template>

<style scoped>
.Summary{
    text-align: center;
    font-size: 18px;
}
h2{
    font-size: 28px;
    margin-top: 40px;
    color: var(--secondary-color);
}
.sum-images{
    width: 100%;
    text-align: center;
}
.sum-images img{
    width: 20%;
    height: 400px;
    margin: 10px;
    object-fit: cover;
}


/*MOBILE*/
@media (width <= 900px){
    
    .sum-images img{
        display: block;
        width: 80%;
        height: 200px;
        margin: auto;
        margin-bottom: 5px;
    }
}
</style>