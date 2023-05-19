<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentByName, getPlayersWithStats } from "@/util/tournamentUtilFunctions.js"

let tournament = ref();
let players = ref();
const getTournament = async () => {
   let tournamentName = "Weck BiPo Open 2023";
   tournament.value = await getTournamentByName(tournamentName);
   players.value = getPlayersWithStats(tournament.value);
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
    <div>
        <table class="table table-hover caption-top" id="mvp-table">
            <thead>
                <tr>
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>{{'Name'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' : 'Sp.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Treffer insgesamt' : 'Trf.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Treffer pro Spiel' : 'Trf. pro Sp.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Gtr. Becher'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(player, index) in players" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ player.name }}</td>
                    <td>{{ player.ammountOfMatches }}</td>
                    <td>{{ player.score }}</td>
                    <td>{{ (player.ammountOfMatches == 0 ? 0 : player.score / player.ammountOfMatches).toFixed(2) }}</td>
                    <td>{{ player.ammountOfDrunkenCups }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
table{
    text-align: center;
}
tbody tr:nth-of-type(1){
    background: rgb(155, 132, 6);
    color: white;
    font-size: 24px;
}
tbody tr:nth-of-type(2){
    background: silver;
    color: white;
    font-size: 20px;
}
tbody tr:nth-of-type(3){
    background: rgb(145, 100, 33);
    color: white;
    font-size: 16px;
}

/*MOBILE*/
@media (width <= 900px){
    table{
        width: auto;
    }
    table *{
        font-size: 15px;
    }
    table td:nth-of-type(2){
        max-width: 100px;
        width: 100px;
    }
}
</style>