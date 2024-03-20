<script setup lang="ts">
import { ref, onUnmounted } from "vue"
import { getTournamentWithRouterID, getMVPList } from "@/util/tournamentUtilFunctions.js"

import Loadingscreen from '@/components/shared/Loadingscreen.vue';

import { useRoute } from "vue-router";
const route = useRoute()

let tournament = ref();
let sortValue = ref("averageScore");
let sortUp = ref(false);

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
    if(value == sortValue.value)
        return sortUp.value ? "mvp-arrow mvp-arrow-up" : "mvp-arrow mvp-arrow-down";
}
</script>

<template>
    <div class="MVP">
        
        <h1 class="bp-title">{{"Most Valuable Player " + route.params.id }}</h1>

        <Loadingscreen v-show="!tournament"/>

        <div style="text-align: center; margin-top: 50px; font-size: 30px; color: var(--main-color);" v-if="tournament && !tournament.groupPhase.groups">
            Turnierplan wurde noch nicht erstellt
        </div>

        <div v-show="tournament && tournament.groupPhase.groups">

            <div class="mvp-text">Statistiken aller Spieler aus dem Turnier sortiert nach der durchschnittlichen Trefferquote pro Spiel</div>

            <table class="table table-hover caption-top">
                <thead>
                    <tr style="height: auto;">
                        <th @click="setSortValue('placement')" :class="giveArrowClass('placement')">{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                        <th @click="setSortValue('name')" :class="giveArrowClass('name')">{{'Name'}}</th>
                        <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
                        <th @click="setSortValue('score')" :class="giveArrowClass('score')">{{ windowWidth > 900 ? 'Treffer' : 'Trf.'}}</th>
                        <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                        <th v-if="windowWidth > 360" @click="setSortValue('ammountOfDrunkenCups')" :class="giveArrowClass('ammountOfDrunkenCups')">{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, index) in sortPlayersList(getMVPList(tournament))" :key="index">
                        <td>{{ player.placement + 1}}</td>
                        <td>{{ player.name.replace(" ","\n") }}</td>
                        <td>{{ player.averageScore }}</td>
                        <td>{{ player.score }}</td>
                        <td>{{ player.ammountOfMatches }}</td>
                        <td v-if="windowWidth > 360">{{ player.ammountOfDrunkenCups }}</td>
                    </tr>
                </tbody>
            </table>

            <div v-if="windowWidth < 900" class="mvp-explain">
                <div>*Pl. = Platz</div>
                <div>*Trfq. = Trefferquote</div>
                <div>*Trf. = Treffer</div>
                <div>*Spi. = Spiele</div>
                <div v-if="windowWidth > 360">*Getru. Becher = Getrunkene Becher</div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.mvp-text{
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
    .mvp-text{
        font-size: 16px;
        margin-bottom: 30px;
    }
    .mvp-explain{
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
        top: 140px;
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
    table *{
        font-size: 14px !important;
    }
    .bp-title{
        font-size: 24px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        max-width: 100px;
    }
    .mvp-text{
        font-size: 15px;
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