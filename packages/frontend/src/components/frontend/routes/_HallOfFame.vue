<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID, getPlayersWithStats } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';


let tournaments:any = ref([]);
let sortValue = ref("wins");
let sortUp = ref(false);

let tournamentsToEvaluate = ["2020","2021","2022","2023"];
const getTournament = async () => {
    let tournamentsArray:any = [];
    for (let i = 0; i < tournamentsToEvaluate.length; i++) {
        let tournament = await getTournamentWithRouterID(tournamentsToEvaluate[i]);
        tournamentsArray.push(tournament);
    }
    tournaments.value = tournamentsArray;
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

const getPlayers = () => {
    let players:any = [];

    tournaments.value.forEach((tournament:any) => {
        let playersWithStats = getPlayersWithStats(tournament);
        playersWithStats.forEach((player:any) => {
            let playerInList = players.find((playerTMP:any) => playerTMP.name == player.name);
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
    players.forEach((player:any) => {
        let averageWins:any = player.ammountOfMatches == 0 ? 0 : player.wins / player.ammountOfMatches;
        averageWins *= 100;
        averageWins = averageWins.toFixed(0);
        player.averageWins = averageWins;
    });

    // Sort after average ein, win
    players.sort((player1:any, player2:any) => {
        if(player2.wins == player1.wins)
            return player2.averageWins - player1.averageWins;
        
        return player2.wins - player1.wins;
    });

    // Set placement
    for (let i = 0; i < players.length; i++) {
        players[i].placement = i;
        let playersWithSameScore = players.filter((player:any) => player.averageWins == players[i].averageWins && player.wins == players[i].wins)
        if(playersWithSameScore.length > 1){
            playersWithSameScore.forEach((playerWithSameScore:any) => {
                playerWithSameScore.placement = playersWithSameScore[0].placement;
            });
        }
    }

    return players;
}

const sortPlayersList = (players:any[]) => {
    players.sort((player1:any, player2:any) => {
        if(sortValue.value == "name") // sort strings
            return sortUp.value ? player1[sortValue.value].localeCompare(player2[sortValue.value]) : player2[sortValue.value].localeCompare(player1[sortValue.value])

        if(player2[sortValue.value] == player1[sortValue.value])
            return sortUp.value ? player2.placement - player1.placement : player1.placement - player2.placement;
        return sortUp.value ? player1[sortValue.value] - player2[sortValue.value] : player2[sortValue.value] - player1[sortValue.value]
    });

    return players;
}

const setSortValue = (value:string) => {
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
</script>

<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">{{"Hall of Fame" }}</h1>

        <Loadingscreen v-show="tournaments.length != tournamentsToEvaluate.length"/>

        <div v-show="tournaments.length == tournamentsToEvaluate.length">

            <div class="hof-text">Eine Liste aller Spieler aus allen Turnieren sortiert nach der Anzahl der Siegen</div>

            <table class="table table-hover caption-top">
                <thead>
                    <tr style="height: auto;">
                        <th @click="setSortValue('placement')" :class="giveArrowClass('placement')">{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                        <th @click="setSortValue('name')" :class="giveArrowClass('name')">{{'Name'}}</th>
                        <!-- <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th> -->
                        <!-- <th @click="setSortValue('score')" :class="giveArrowClass('score')">{{ windowWidth > 900 ? 'Treffer insgesamt' : 'Trf.'}}</th> -->
                        <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                        <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'Sieg.'}}</th>
                        <th @click="setSortValue('averageWins')" :class="giveArrowClass('averageWins')">{{ windowWidth > 900 ? 'Siegwahrscheinlichkeit' : 'Siegwahr.'}}</th>
                        <!-- <th @click="setSortValue('ammountOfDrunkenCups')" :class="giveArrowClass('ammountOfDrunkenCups')">{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'}}</th> -->
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, index) in sortPlayersList(getPlayers())" :key="index">
                        <td>{{ player.placement + 1}}</td>
                        <td>{{ player.name.replace(" ","\n") }}</td>
                        <!-- <td>{{ player.averageScore }}</td> -->
                        <!-- <td>{{ player.score }}</td> -->
                        <td>{{ player.ammountOfMatches }}</td>
                        <td>{{ player.wins }}</td>
                        <td>{{ player.averageWins + "%" }}</td>
                        <!-- <td>{{ player.ammountOfDrunkenCups }}</td> -->
                    </tr>
                </tbody>
            </table>

            <div v-if="windowWidth < 900" class="hof-explain">
                <div>*Pl. = Platz</div>
                <div>*Spi. = Spiele</div>
                <div>*Siegwahr. = Siegwahrscheinlichkeit</div>
            </div>

        </div>

    </div>
</template>

<style scoped>
.hof-text{
    text-align: center;
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
    .hof-text{
        font-size: 16px;
    }
    .hof-explain{
        font-size: 14px;
        color: var(--main-color);
        margin-bottom: 30px;
    }
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
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 2px;
        padding-right: 10px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        max-width: 100px;
        width: 100px;
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
