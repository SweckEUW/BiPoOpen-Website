<script setup lang="ts">
import { ref, toRaw, onMounted } from "vue"
import { getGroupsWithStats } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 
import Swiper, { Pagination } from 'swiper';
import 'swiper/swiper-bundle.min.css';

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
        </div>
    </div>

    <div v-if="windowWidth < 900" class="hof-explain">
        <div>*Pl. = Platz</div>
        <div>*Sieg. = Siege</div>
        <div>*Spie. = Spiele</div>
        <div>*Trfv. = Trefferverhältnis</div>
        <div>*Trfd. = Trefferdifferenz</div>
    </div>
</template>

<style>
.GameStandingsGroups{
    overflow: hidden;
}

/* Top Swiper Pagination */
.swiper-pagination{
   position: sticky !important;
   top: 180px !important;
   padding-top: 10px !important;
   padding-bottom: 20px !important;
   display: flex !important;
   background-color: white !important;
}
.swiper-pagination-bullet {
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
.swiper-pagination-bullet-active {
	color:white !important;
	background: var(--main-color) !important;
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
    color: var(--main-color) !important;
}
tbody tr:nth-of-type(1) *{
    background: var(--secondary-color-weak) !important;
}
tbody tr:nth-of-type(2) *{
    background: #e6faff !important;
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
    .hof-explain{
        margin-top: 15px;
        font-size: 11px;
        color: var(--main-color);
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