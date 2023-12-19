<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getGroups, getTournamentWithRouterID, getGroupsWithStats } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref();
let groups = ref();
const getTournament = async () => {
    // @ts-ignore 
   tournament.value = await getTournamentWithRouterID(route.params.id);
   groups.value = getGroupsWithStats(tournament.value);
}
getTournament();

let updateInterval = setInterval(() => {
   getTournament();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});
</script>

<template>
    <div class="Standings">

        <h1 class="bp-title">{{"Platzierungen " + route.params.id }}</h1>

        <Loadingscreen v-show="!tournament || !groups"/>

        <div style="text-align: center; margin-top: 50px; font-size: 30px; color: var(--main-color);" v-if="tournament && !tournament.groupPhase.groups">
            Turnierplan wurde noch nicht erstellt
        </div>

        <table v-show="tournament && groups" class="table table-hover caption-top" v-for="index in getGroups(tournament).length" :key="index">
            <caption>{{"Gruppe " + convertNumberToCharacter(index)}}</caption>
            <thead>
                <tr>
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>Teamname</th>
                    <th>Spieler</th>
                    <th>{{ windowWidth > 900 ? 'Siege' :'Sieg.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' :'Spie.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Trefferverhältnis' :'Trfv.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Trefferdifferenz' :'Trfd.'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(team,i) in groups[index-1].teams" :key="team">
                    <td>{{ i+1 }}</td>
                    <td>{{team.name}}</td>
                    <td><span v-for="player in team.players" :key="player">{{windowWidth > 900 ? player : player.split(" ")[0]}}</span></td>
                    <td>{{ team.wins }}</td>
                    <td>{{ team.games }}</td>
                    <td>{{ team.score }}</td>
                    <td>{{ team.scoreDifference }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
table{
   text-align: center;
   margin-bottom: 20px;
}
table *{
    vertical-align: middle;
}
caption{
   font-size: 28px;
   font-weight: bold;
   color: var(--main-color);
}
table td{
    height: 60px;
}
table th{
    color: var(--main-color);
}
tbody tr:nth-of-type(1){
    background: var(--secondary-color-weak);
}
tbody tr:nth-of-type(2){
    background: #e6faff;
}

table td{
   background-color: inherit;
}
table td:nth-child(3) span{
    display: block;
}
table td:nth-child(2){
    width: 250px;
    max-width: 250px;
}

/*MOBILE*/
@media (width <= 900px){
    table *{
        font-size: 14px;
    }
    table td:nth-child(2){
        width: 120px;
        max-width: 120px;
    }
    table td:nth-child(3), table th:nth-child(3){
        display: none;
    }
    table td:nth-child(3) span{
        margin-bottom: 4px;
        margin-right: 0px;
    }
    table td:nth-child(6){
        width: 60px;
        min-width: 60px;
    }
    caption{
        font-size: 22px;
    }
}

/* Table Border */
table {
    border-collapse: collapse;
}
table td {
    border: 1px solid rgba(0, 0, 0, 0.3); 
}
table th{
    border: 1px solid rgba(0, 0, 0, 0.3); 
    border-top: 0;
}
table th:first-child{
    border-left: 0;
}
table th:last-child{
    border-right: 0;
}
table tr td:first-child {
    border-left: 0;
}
table tr:last-child td {
    border-bottom: 0;
}
table tr td:last-child {
    border-right: 0;
}
</style>