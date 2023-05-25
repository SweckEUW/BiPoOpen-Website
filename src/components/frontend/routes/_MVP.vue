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
                <tr style="height: auto;">
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>{{'Name'}}</th>
                    <th>{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Treffer insgesamt' : 'Trf.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(player, index) in players" :key="index">
                    <td>{{ player.placement + 1}}</td>
                    <td>{{ player.name }}</td>
                    <td>{{ player.averageScore }}</td>
                    <td>{{ player.score }}</td>
                    <td>{{ player.ammountOfMatches }}</td>
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
table th{ 
    position: sticky;
    top: 100px;
    background-color: #FFF;
}

/*MOBILE*/
@media (width <= 900px){
    table{
        width: auto;
    }
    table *{
        font-size: 15px;
    }
    tr{
        height: 80px;
    }
    tr *{
        vertical-align: middle;
    }
    table th{ 
        top: 60px;
    }
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 2px;
        padding-right: 10px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        max-width: 100px;
        width: 100px;
    }
}
</style>