<script setup lang="ts">
import { ref, onUnmounted, toRaw } from "vue"
import { getTournamentWithRouterID, getGroupsWithStats, getTeamsKOPhaseWithStats } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

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

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});
</script>

<template>
    <div class="Standings">

        <h1 class="bp-title">{{"Platzierungen " + route.params.id }}</h1>

        <Loadingscreen v-show="!tournament"/>

        <div style="text-align: center; margin-top: 50px; font-size: 30px; color: var(--main-color);" v-if="tournament && !tournament.groupPhase.groups">
            Turnierplan wurde noch nicht erstellt
        </div>

        <div v-show="tournament && tournament.groupPhase.groups">
            <!-- Tabs -->
            <ul class="nav nav-tabs  justify-content-center" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#GameScheduleGroups" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Gruppenphase</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#GameScheduleKO" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">K.o.Phase</button>
                </li>
            </ul>

            <!-- Content -->
            <div class="tab-content">

                <!-- Groups -->
                <div class="tab-pane fade show active" id="GameScheduleGroups" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
                    <table class="table table-hover caption-top" v-for="(group,index) in getGroupsWithStats(toRaw(tournament))" :key="index">
                        <caption>{{"Gruppe " + convertNumberToCharacter(index+1)}}</caption>
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
                            <tr v-for="(team,i) in group.teams" :key="team">
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

                <!-- KO Phase -->
                <div class="tab-pane fade" id="GameScheduleKO" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                    <table v-if="tournament" class="table table-hover caption-top">
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
                            <tr v-for="team in getTeamsKOPhaseWithStats(tournament)" :key="team">
                                <td>{{ team.placement + 1 }}</td>
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
            </div>
            
        </div>
    </div>
</template>

<style scoped>
/* Navbar */
.nav-tabs{
   position: sticky;
   top: 160px;
   background: white;
   z-index: 2;
   margin-bottom: 40px;
}
.nav-link{
   border-radius: 0px;
   width: 40vw;
   padding: 15px 10px;
   color: var(--secondary-color);
   font-weight: bold;
}
.nav-item .active{
   background-color: var(--main-color) !important;
   color: white !important;
}
/* Groups Table */
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
#GameScheduleKO tbody tr:nth-of-type(3){
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
    #GameScheduleKO tbody tr:nth-of-type(1){
        font-size: 22px;
    }
    #GameScheduleKO tbody tr:nth-of-type(2){
        font-size: 20px;
    }
    #GameScheduleKO tbody tr:nth-of-type(3){
        font-size: 18px;
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