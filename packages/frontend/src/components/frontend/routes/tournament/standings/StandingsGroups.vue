<script setup lang="ts">
import { ref, toRaw, onMounted } from "vue"
import { getGroupsWithStats } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

defineProps(['tournament']);

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

onMounted(() => {
   new Swiper('#GameStandingsGroupsSwiper',{
      modules: [Pagination],
      initialSlide: 0,
      spaceBetween: 50,
      speed: 500,
      pagination: {
         el: "#GameStandingsGroupsSwiper-Pagination",
         clickable: true,
         renderBullet: (index, className) => {
            return '<span class="' + className + '">' + convertNumberToCharacter(index+1) + '</span>';
         }
      }
   });
});
</script>

<template>
    <div class="swiper-pagination" id="GameStandingsGroupsSwiper-Pagination"/>

    <div class="GameStandingsGroups swiper-container" id="GameStandingsGroupsSwiper">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="(group,index) in getGroupsWithStats(toRaw(tournament))" :key="index">
                <table class="table table-hover caption-top">
                    <caption>{{"Gruppe " + convertNumberToCharacter(index+1)}}</caption>
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
                        <tr v-for="(team,i) in group.teams" :key="team">
                            <td>{{ i+1 }}</td>
                            <td>{{team.name}}</td>
                            <td><span v-for="player in team.players" :key="player">{{windowWidth > 900 ? player : player.split(" ")[0]}}</span></td>
                            <td>{{ team.wins }}</td>
                            <td>{{ team.games }}</td>
                            <td>{{ team.score }}</td>
                            <td v-if="windowWidth > 360">{{ team.scoreDifference }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div v-if="windowWidth < 900" class="hof-explain">
        <div>*Pl. = Platz</div>
        <div>*Sieg. = Siege</div>
        <div>*Spie. = Spiele</div>
        <div>*Trfv. = Trefferverhältnis</div>
        <div v-if="windowWidth > 360">*Trfd. = Trefferdifferenz</div>
    </div>
</template>

<style>
.GameStandingsGroups{
    overflow: hidden;
}

/* Top Swiper Pagination */
.Standings .swiper-pagination{
   position: sticky !important;
   top: 180px !important;
   padding-top: 10px !important;
   padding-bottom: 20px !important;
   display: flex !important;
   background-color: white !important;
}
.Standings .swiper-pagination-bullet {
	padding: 5px 10px !important; 
	border-radius: 0 !important;
	width: auto !important;
    height: auto !important;
	text-align: center !important;
	color: var(--secondary-color) !important;
    background-color: transparent !important;
    opacity: 1 !important; 
    margin: 0 !important;
    flex: 1 1 0 !important;
    text-align: center !important;
}
.Standings .swiper-pagination-bullet-active {
	color:white !important;
	background: var(--main-color) !important;
}

/* Groups Table */
.GameStandingsGroups table{
    text-align: center;
    margin-bottom: 20px;
}
.GameStandingsGroups table *{
    vertical-align: middle;
}
.GameStandingsGroups caption{
    font-size: 28px;
    font-weight: bold;
    color: var(--main-color);
}
.GameStandingsGroups table td{
    height: 60px;
}
.GameStandingsGroups table th{
    color: var(--main-color) !important;
}
.GameStandingsGroups tbody tr:nth-of-type(1) td{
    background: var(--secondary-color-weak);
}
.GameStandingsGroups tbody tr:nth-of-type(2) td{
    background: #e6faff;
}

.GameStandingsGroups table td{
   background-color: inherit;
}
.GameStandingsGroups table td:nth-child(3) span{
    display: block;
}
.GameStandingsGroups table td:nth-child(2){
    width: 250px;
    max-width: 250px;
}

/*MOBILE*/
@media (width <= 900px){
    .GameStandingsGroups table *{
        font-size: 14px;
    }
    .GameStandingsGroups table td:nth-child(2){
        width: 120px;
        max-width: 120px;
    }
    .GameStandingsGroups table td:nth-child(3), .GameStandingsGroups table th:nth-child(3){
        display: none;
    }
    .GameStandingsGroups table td:nth-child(3) span{
        margin-bottom: 4px;
        margin-right: 0px;
    }
    .GameStandingsGroups table td:nth-child(6){
        width: 60px;
        min-width: 60px;
    }
    .GameStandingsGroups caption{
        font-size: 22px;
    }
    .hof-explain{
        margin-top: 15px;
        font-size: 11px;
        color: var(--main-color);
    }
}


/*MOBILE S*/
@media (width <= 360px){
    .GameStandingsGroups table *{
        font-size: 13px;
    }
}

/* Table Border */
.GameStandingsGroups table {
    border-collapse: collapse;
}
.GameStandingsGroups table td {
    border: 1px solid rgba(0, 0, 0, 0.3); 
}
.GameStandingsGroups table th{
    border: 1px solid rgba(0, 0, 0, 0.3); 
    border-top: 0;
}
.GameStandingsGroups table th:first-child{
    border-left: 0;
}
.GameStandingsGroups table th:last-child{
    border-right: 0;
}
.GameStandingsGroups table tr td:first-child {
    border-left: 0;
}
.GameStandingsGroups table tr:last-child td {
    border-bottom: 0;
}
.GameStandingsGroups table tr td:last-child {
    border-right: 0;
}
</style>