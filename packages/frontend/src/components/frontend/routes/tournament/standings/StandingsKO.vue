<script setup lang="ts">
import { ref } from "vue"
import { getTeamsKOPhaseWithStats, checkIfTournamentFinished } from "@/util/tournamentUtilFunctions.js";

defineProps(['tournament']);

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});
</script>

<template>
    <div class="GameStandingsKO">

        <div style="text-align: center; margin-top: 50px; font-size: 30px; color: var(--main-color);" v-if="tournament && !checkIfTournamentFinished(tournament)">
            Turnier ist noch nicht zuende gespielt
        </div>

        <table v-if="tournament && checkIfTournamentFinished(tournament)" class="table table-hover caption-top">
            <thead>
                <tr>
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>Teamname</th>
                    <th>Spieler</th>
                    <th>{{ windowWidth > 900 ? 'Siege' :'Sieg.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' :'Spie.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Trefferverhältnis' :'Trfv.'}}</th>
                    <th v-if="windowWidth > 360">{{ windowWidth > 900 ? 'Trefferdifferenz' :'Trfd.'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="team in getTeamsKOPhaseWithStats(tournament)" :key="team">
                    <td>{{ team.placement + 1 }}</td>
                    <td>{{team.name}}</td>
                    <td><span v-for="player in team.players" :key="player">{{windowWidth > 900 ? player : player.split(" ")[0]}}</span></td>
                    <td>{{ team.wins }}</td>
                    <td>{{ team.games }}</td>
                    <td>{{ team.score }}</td>
                    <td v-if="windowWidth > 360">{{ team.scoreDifference }}</td>
                </tr>
            </tbody>
        </table>

        <div v-if="windowWidth < 900" class="hof-explain">
            <div>*Pl. = Platz</div>
            <div>*Sieg. = Siege</div>
            <div>*Spie. = Spiele</div>
            <div>*Trfv. = Trefferverhältnis</div>
            <div v-if="windowWidth > 360">*Trfd. = Trefferdifferenz</div>
        </div>

    </div>
</template>

<style scoped>
table{
   text-align: center;
   margin-top: 20px;
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
    position: sticky;
    top: 185px;
    padding-top: 15px;
    background-color: white;
}
tbody tr:nth-of-type(1){
    background: var(--secondary-color-weak);
}
tbody tr:nth-of-type(2){
    background: #e6faff;
}
tbody tr:nth-of-type(3){
    background: #f4fdff;
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
    .nav-tabs{
      top: 130px;
    }

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
    tbody tr:nth-of-type(1){
        font-size: 22px;
    }
    tbody tr:nth-of-type(2){
        font-size: 20px;
    }
    tbody tr:nth-of-type(3){
        font-size: 18px;
    }
    .hof-explain{
        margin-top: 15px;
        font-size: 11px;
        color: var(--main-color);
    }
}

/*MOBILE S*/
@media (width <= 360px){
    table *{
        font-size: 13px;
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