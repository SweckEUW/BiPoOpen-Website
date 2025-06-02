<script setup lang="ts">
import { ref, onUnmounted, PropType } from "vue"
import { getTournamentWithRouterID, getAllTeams } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true }
});
</script>

<template>
    <div class="Teams">
        <table class="table table-hover caption-top">
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
                    <div v-for="player in team.players" :key="player" style="white-space: nowrap;">{{ player }}</div>
                </td>
            </tr>
         </tbody>
      </table>
        
    </div>
</template>

<style scoped>
table{
    text-align: center;
    padding-top: 20px;
}
table *{
    vertical-align: middle;
}
tbody tr{
    font-size: 18px;
}
table th{ 
    position: sticky;
    top: 215px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
    cursor: pointer;
    z-index: 2;
}
table td{
    background: inherit;
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
        top: 190px;
        font-size: 15px;
    }
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 4px;
        padding-right: 10px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        min-width: 100px;
        white-space: break-spaces;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    table *{
        font-size: 14px !important;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        max-width: 100px;
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