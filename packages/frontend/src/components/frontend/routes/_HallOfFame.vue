<script setup lang="ts">
import { computed, ref } from "vue"
import { getTournamentWithRouterID, getPlayersWithStats } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

let tournaments = ref<Tournament[]>([]);
let sortValue = ref<SortValueHallOfFame>("wins");
let sortUp = ref(false);

// Initial load tournaments
let tournamentsToEvaluate = ["2020","2022","2023","2024"]; //2021
const getTournament = async () => {
    for (let i = 0; i < tournamentsToEvaluate.length; i++) {
        let tournament = await getTournamentWithRouterID(tournamentsToEvaluate[i]);
        if(tournament)
            tournaments.value.push(tournament);
    }   
}
getTournament();

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const sortedHallOfFameList = computed(() => {
    let players:PlayerWithStats[] = [];

    // Get players from all tournaments with stats. If the same player played in multiple tournaments, add the stats together
    tournaments.value.forEach((tournament) => {
        let playersWithStats = getPlayersWithStats(tournament);
        playersWithStats.forEach((player) => {
            let playerInList = players.find((playerTMP) => playerTMP.name == player.name);
            if(playerInList){
                playerInList.score += player.score;
                playerInList.ammountOfMatches += player.ammountOfMatches;
                playerInList.ammountOfDrunkenCups += player.ammountOfDrunkenCups;
                playerInList.averageScore += player.averageScore;
                playerInList.averageWins += player.averageWins;
                playerInList.wins += player.wins;
            }else{
                players.push(player);
            }
        });
    });

    // Calculate correct win
    players.forEach((player) => {
        let averageWins = player.ammountOfMatches == 0 ? 0 : player.wins / player.ammountOfMatches;
        player.averageWins = Math.round(averageWins * 100);
    });

    // Sort players by wins and averageWins
    players.sort((player1, player2) => {
        if(player2.wins == player1.wins)
            return player2.averageWins - player1.averageWins;
        
        return player2.wins - player1.wins;
    });

    // Set placement
    for (let i = 0; i < players.length; i++) {
        players[i].placement = i;
        let playersWithSameScore = players.filter((player) => player.averageWins == players[i].averageWins && player.wins == players[i].wins)
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    // Sort the Players depending on the sortValue
    players.sort((player1, player2) => {
        if(sortValue.value == "name") // sort strings
            return sortUp.value ? player1[sortValue.value].localeCompare(player2[sortValue.value]) : player2[sortValue.value].localeCompare(player1[sortValue.value])

        if(player2[sortValue.value] == player1[sortValue.value])
            return sortUp.value ? player2.placement! - player1.placement! : player1.placement! - player2.placement!;

        return sortUp.value ? player1[sortValue.value]! - player2[sortValue.value]! : player2[sortValue.value]! - player1[sortValue.value]!
    });

    return players;
});


const setSortValue = (value:SortValueHallOfFame) => {
    if(sortValue.value == value)
        sortUp.value = !sortUp.value;
    else
        sortUp.value = false;

    sortValue.value = value;
}

const giveArrowClass = (value:string) => {
    if(value == sortValue.value) //windowWidth.value > 900 && 
        return sortUp.value ? "mvp-arrow mvp-arrow-up" : "mvp-arrow mvp-arrow-down";
}

let winners = [
    { year: "2024", name: "Team Vogelnest", player1: "Lewin Pohlschmidt", player2: "Mattis Post"},
    { year: "2023", name: "Berufsalkoholiker", player1: "Jonas Weck", player2: "Leon Rose"},
    { year: "2022", name: "Taube Nüsschen", player1: "Patrick Pohlmann", player2: "Tim Becker"},
    { year: "2021", name: "Pong Daddys", player1: "Matthias Weck", player2: "Lennard Kaffitz"},
    { year: "2020", name: "Dynamo #DruckAmGlas", player1: "Alexander Borsig", player2: "Björn Harz"}
]
let trophyIcon = new URL(`/src/assets/icons/trophy.png`, import.meta.url).href;
</script>

<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">{{"Hall of Fame" }}</h1>

        <Loadingscreen v-show="tournaments.length != tournamentsToEvaluate.length"/>

        <div v-show="tournaments.length == tournamentsToEvaluate.length">

            <div class="hof-winners">
                <div class="hof-winner" v-for="winner in winners">
                    <div class="hof-winner-icon">
                        <img :src="trophyIcon" alt="">
                        <div>{{ winner.year }}</div>
                    </div>
                    <div class="hof-team">
                        <div class="hof-team-name">{{ winner.name }}</div>
                        <div>{{ winner.player1 }}</div>
                        <div>{{ winner.player2 }}</div>
                    </div>
                </div>
            </div>


            <div class="hof-text">Statistiken alle Spieler aus allen Turnieren sortiert nach der Anzahl der Siegen</div>

            <table class="table table-hover caption-top">
                <thead>
                    <tr style="height: auto;">
                        <th @click="setSortValue('placement')" :class="giveArrowClass('placement')">{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                        <th @click="setSortValue('name')" :class="giveArrowClass('name')">{{'Name'}}</th>
                        <!-- <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th> -->
                        <!-- <th @click="setSortValue('score')" :class="giveArrowClass('score')">{{ windowWidth > 900 ? 'Treffer insgesamt' : 'Trf.'}}</th> -->
                        <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'Sieg.'}}</th>
                        <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spie.'}}</th>
                        <th @click="setSortValue('averageWins')" :class="giveArrowClass('averageWins')">{{ windowWidth > 900 ? 'Siegwahrscheinlichkeit' : 'Siegwahr.'}}</th>
                        <!-- <th @click="setSortValue('ammountOfDrunkenCups')" :class="giveArrowClass('ammountOfDrunkenCups')">{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'}}</th> -->
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, index) in sortedHallOfFameList" :key="index">
                        <td>{{ player.placement! + 1}}</td>
                        <td>{{ player.name.replace(" ","\n") }}</td>
                        <!-- <td>{{ player.averageScore }}</td> -->
                        <!-- <td>{{ player.score }}</td> -->
                        <td>{{ player.wins }}</td>
                        <td>{{ player.ammountOfMatches }}</td>
                        <td>{{ player.averageWins + "%" }}</td>
                        <!-- <td>{{ player.ammountOfDrunkenCups }}</td> -->
                    </tr>
                </tbody>
            </table>

            <div v-if="windowWidth < 900" class="hof-explain">
                <div>*Pl. = Platz</div>
                <div>*Sieg. = Siege</div>
                <div>*Spie. = Spiele</div>
                <div>*Siegwahr. = Siegwahrscheinlichkeit</div>
            </div>

        </div>

    </div>
</template>

<style scoped>
/* HoF Winners */
.hof-winners{
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.hof-winner{
    position: relative;
    display: flex;
    align-items: center;
    margin: 0px 40px 30px 40px;
    width: 20%;
}
.hof-winner::after {
  content: '';
  position: absolute;
  bottom: -20px;
  width: 100%;
  border-bottom: 1px solid var(--main-color);
  opacity: 0.5;
}
.hof-winner:nth-child(even){
    flex-direction: row-reverse;
}
.hof-winner-icon{
    position: relative;
    margin-right: 20px;
}
.hof-winner-icon img{
    width: 80px;
}
.hof-winner-icon div{
    position: absolute;
    bottom: 5px;
    left: 22px;
    font-weight: bold;
    color: white;
}
.hof-team{
    flex: 1;
    text-align: center;
}
.hof-team-name{
    font-weight: bold;
    font-size: 18px;
}


.hof-text{
    text-align: center;
    margin-top: 50px;
    margin-bottom: 50px;
    font-size: 18px;
    color: var(--main-color);
}

table{
    text-align: center;
}
table *{
    vertical-align: middle;
}
tbody tr{
    font-size: 18px;
}
tbody tr:nth-of-type(1){
    background: var(--secondary-color-weak);
    font-size: 22px;
}
tbody tr:nth-of-type(2){
    background: #e6faff;
}
tbody tr:nth-of-type(3){
    background: #f4fdff;
}
table th{ 
    position: sticky;
    top: 165px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
    cursor: pointer;
}
table td{
    background: inherit;
}
.mvp-arrow-down::after, .mvp-arrow-up::after{
    content: ' ';
    position: relative;
    left: 10px;
    border: 8px solid transparent;
}
.mvp-arrow-down::after{
    top: 18px;
    border-top-color: var(--main-color);
}
.mvp-arrow-up::after{
    bottom: 18px;
    border-bottom-color: var(--main-color);
}

/*MOBILE*/
@media (width <= 900px){
    .hof-winner{
        width: 85%;
    }
    .hof-text{
        font-size: 16px;
        margin-bottom: 30px;
    }
    .hof-explain{
        font-size: 11px;
        color: var(--main-color);
    }
    table *{
        font-size: 15px;
    }
    tr{
        height: 80px;
    }
    table th{ 
        top: 140px;
        font-size: 15px;
        padding-top: 10px;
        padding-bottom: 15px;
    }
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 2px;
        padding-right: 10px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        min-width: 100px;
        white-space: break-spaces;
    }

    .mvp-arrow-down::after, .mvp-arrow-up::after{
        left: 5px;
        border-width: 6px;
    }
    .mvp-arrow-down::after{
        top: 15px;
    }
    .mvp-arrow-up::after{
        bottom: 15px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    .bp-title{
        font-size: 24px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        max-width: 70px;
        min-width: 70px;
    }
    table th{
        font-size: 13px;
    }
    table td{
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
