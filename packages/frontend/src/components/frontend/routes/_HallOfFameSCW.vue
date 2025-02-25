<script setup lang="ts">
import { computed, ref } from "vue"
import { getTournamentWithRouterID, getPlayersWithStats } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

let tournaments = ref<Tournament[]>([]);
let sortValue = ref<SortValueHallOfFame>("averageWins");
let sortUp = ref(false);

// Initial load tournaments
let tournamentsToEvaluate = ["SCW 3 Batenhorst 2023","SCW 3 Ostern 2024", "SCW 3 Batenhorst 2024"];
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
                playerInList.ammountOfMatchesWithTrackedShots += player.ammountOfMatchesWithTrackedShots;
                playerInList.ammountOfDrunkenCups += player.ammountOfDrunkenCups;
                playerInList.wins += player.wins;
            }else{
                players.push(player);
            }
        });
    });

    // Remove players with specific names
    let playersToRemove = ["David Jones", "Marian", "Jan"];
    players = players.filter((player) => !playersToRemove.includes(player.name));

    // Calculate correct average numbers
    players.forEach((player) => {
        // Calculate correct win
        let averageWins = player.wins / player.ammountOfMatches;
        player.averageWins = Math.round(averageWins * 100);

        // Calculate correct averageScore
        player.averageScore = player.score / player.ammountOfMatchesWithTrackedShots;
        player.averageScore = Math.round(player.averageScore * 100) / 100; // Round average Score
        if(player.score == 0){
            // @ts-ignore
            player.averageScore = "/"; // @ts-ignore
            player.score = "/";
        }
    });

    // Sort players by wins and averageWins
    players.sort((player1, player2) => {
        if(player2.averageWins == player1.averageWins)
            return player2.wins - player1.wins;
        
        return player2.averageWins - player1.averageWins;
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
    { year: "Batenhorst 2024", name: "Lederlappen", player1: "Nick Brinkrolf", player2: "Fitim Shehi"},
    { year: "Ostern 2024", name: "Holzbein Kiel", player1: "Leonhard Sürbrock", player2: "Jonas Weck"},
    { year: "Batenhorst 2023", name: "", player1: "Jens Ossenbrink", player2: "Simon Weck"},
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
                        <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
                        <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'Sieg.'}}</th>
                        <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spie.'}}</th>
                        <th @click="setSortValue('averageWins')" :class="giveArrowClass('averageWins')">{{ windowWidth > 900 ? 'Siegwahrscheinlichkeit' : 'Sieg. (%)'}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, index) in sortedHallOfFameList" :key="index">
                        <td>{{ player.placement! + 1}}</td>
                        <td>{{ player.name.replace(" ","\n") }}</td>
                        <td>{{ player.averageScore }}</td>
                        <td>{{ player.wins }}</td>
                        <td>{{ player.ammountOfMatches }}</td>
                        <td>{{ player.averageWins + "%" }}</td>
                    </tr>
                </tbody>
            </table>

            <div v-if="windowWidth < 900" class="hof-explain">
                <div>*Pl. = Platz</div>
                <div>*Trfq. = Trefferquote</div>
                <div>*Sieg. = Siege</div>
                <div>*Spie. = Spiele</div>
                <div>*Sieg. (%) = Siegwahrscheinlichkeit in %</div>
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
    width: 110px;
}
.hof-winner-icon div{
    position: absolute;
    bottom: 9px;
    left: 20px;
    width: 70px;
    height: 30px;
    font-weight: bold;
    color: white;
    font-size: 11px;
    line-height: 11px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
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
        max-width: 80px;
        white-space: break-spaces;
    }
    th:nth-of-type(6), td:nth-of-type(6){
        max-width: 50px;
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
