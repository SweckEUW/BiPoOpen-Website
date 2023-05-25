<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getGroups, getTournamentByName, getGroupsWithStats } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

let tournament = ref();
let groups = ref();
const getTournament = async () => {
   let tournamentName = "Weck BiPo Open 2023";
   tournament.value = await getTournamentByName(tournamentName);
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
    <div v-if="tournament">
        <table class="table table-hover caption-top" v-for="index in getGroups(tournament).length" :key="index">
            <caption>{{"Gruppe " + convertNumberToCharacter(index)}}</caption>
            <thead>
                <tr>
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>Teamname</th>
                    <th>Spieler</th>
                    <th>{{ windowWidth > 900 ? 'Siege' :'Sg.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' :'Spi.'}}</th>
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
   margin-bottom: 30px;
}
caption{
   font-size: 28px;
   font-weight: bold;
   color: black;
}
tbody tr:nth-of-type(1){
    background: rgb(155, 132, 6);
    color: white;
}
tbody tr:nth-of-type(2){
    background: silver;
    color: white;
}
table td:nth-child(3) span{
    margin-right: 15px; 
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
</style>