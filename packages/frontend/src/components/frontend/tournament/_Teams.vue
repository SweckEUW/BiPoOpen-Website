<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID, getAllTeams } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref<Tournament|undefined>();
const getTournament = async () => {
    tournament.value = await getTournamentWithRouterID(route.params.TournamentName as string);
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
    <div class="MVP">
        
        <h1 class="bp-title">{{"Teams " + route.params.TournamentName }}</h1>

        <Loadingscreen v-show="!tournament"/>

        <table v-show="tournament" class="table table-hover caption-top">
         <thead>
            <tr>
                <th>Nr.</th>
                <th>Teamname</th>
                <th>Spieler</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(team, i) in getAllTeams(tournament)" :key="team.name">
                <td>{{ i+1 }}</td>
               <td>{{ team.name }}</td>
               <td>
                  <div v-for="player in team.players" :key="player">{{ player }}</div>
               </td>
            </tr>
         </tbody>
      </table>
        
    </div>
</template>

<style scoped>
table{
    text-align: center;
}
table *{
    vertical-align: middle;
}
tbody tr{
    font-size: 18px;
}
table th{ 
    position: sticky;
    top: 165px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
}
table td{
    background: inherit;
}

th:nth-of-type(1), td:nth-of-type(1){
    font-weight: 500;
}

th:nth-of-type(2), td:nth-of-type(2){
    font-weight: 500;
}

/*MOBILE*/
@media (width <= 900px){
    table{
        width: 100%;
    }
    table *{
        font-size: 15px;
    }
    tr{
        height: 80px;
    }
    table th{ 
        top: 138px;
        font-size: 15px;
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