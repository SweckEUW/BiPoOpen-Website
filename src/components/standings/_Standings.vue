<script setup lang="ts">
import axios from "axios";
import { ref, onUnmounted } from "vue"
import { getAmmountOfWinsFromTeam, getAmmountOfMatchesFromPlayer, getAmmountOfHitsFromTeam, getAmmountOfEnemyHitsFromTeam, getHitDifferenceFromTeam } from "@/util/tournamentFunctions.js"

let tournament = ref();
const getTournament = async () => {
   let response = await axios.get("/tournaments")
   console.log(response.data.message);
   if(response.data.success){
      tournament.value = response.data.tournaments[0];
      sortGroups();
   }
}
getTournament();

// Sort after wins
const sortGroups = () => {
    let groupsTMP:any = [];
    tournament.value.groupPhase.groups.forEach((group:any) => {
        group.teams = group.teams.sort((team1:any, team2:any) => {
            let score1 = getAmmountOfWinsFromTeam(tournament.value, team1.name);
            let score2 = getAmmountOfWinsFromTeam(tournament.value, team2.name);
            if(score1 == score2){
                return getHitDifferenceFromTeam(tournament.value, team2) - getHitDifferenceFromTeam(tournament.value, team1);
            }else{
                return score2 - score1;
            }
            
        });
        groupsTMP.push(group);
    });
    tournament.value.groupPhase.groups = groupsTMP;
}

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
        <table class="table table-hover caption-top" v-for="(group,index) in tournament?.groupPhase?.groups" :key="index">
            <caption>{{"Gruppe "+ (index + 1)}}</caption>
            <thead>
                <tr>
                    <th>{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th>Teamname</th>
                    <th>Spieler</th>
                    <th>{{ windowWidth > 900 ? 'Siege' :'Sg.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Spiele' :'Sp.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Trefferverhältnis' :'Trfv.'}}</th>
                    <th>{{ windowWidth > 900 ? 'Trefferdifferenz' :'Trfd.'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(team,i) in group.teams" :key="team">
                    <td>{{ i+1 }}</td>
                    <td>{{team.name}}</td>
                    <td><span v-for="player in team.players" :key="player">{{windowWidth > 900 ? player : player.split(" ")[0]}}</span></td>
                    <td>{{ getAmmountOfWinsFromTeam(tournament, team.name) }}</td>
                    <td>{{ getAmmountOfMatchesFromPlayer(tournament, team.players[0]) }}</td>
                    <td>{{ getAmmountOfHitsFromTeam(tournament, team) + " : " + getAmmountOfEnemyHitsFromTeam(tournament, team) }}</td>
                    <td>{{ getHitDifferenceFromTeam(tournament, team) }}</td>
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
    display: inline-block;
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
    table td:nth-child(3) span{
        margin-bottom: 4px;
        margin-right: 0px;
    }
    table td:nth-child(6){
        width: 60px;
        max-width: 60px;
    }
    caption{
        font-size: 22px;
    }
}
</style>