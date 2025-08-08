<script setup lang="ts">
import { computed, onMounted, PropType, ref } from 'vue';
import { getAllTimeOpenGamesStatsList } from './OpenGamesUtilFunctions';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const props = defineProps({
    openGames: {type: Object as PropType<Match[]>, required: true }
});

let sortValue = ref<SortValueOpenGames>("averageWins");
let sortUp = ref(false);

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const openGamesStatistics = computed(() => {
    let openGamesStatisticsOneVersusOne = getAllTimeOpenGamesStatsList(props.openGames, true);
    let openGamesStatisticsTwoVersusTwo = getAllTimeOpenGamesStatsList(props.openGames, false);

    let combinedList = [openGamesStatisticsOneVersusOne, openGamesStatisticsTwoVersusTwo];

    // Sort the List depenging on the sortValue
    combinedList.forEach(list => {
        list.sort((player1, player2) => {
            if(sortValue.value == "name") // sort strings
                return sortUp.value ? player1[sortValue.value].localeCompare(player2[sortValue.value]) : player2[sortValue.value].localeCompare(player1[sortValue.value])

            if(player2[sortValue.value] == player1[sortValue.value])
                return sortUp.value ? player2.placement! - player1.placement! : player1.placement! - player2.placement!;
            
            return sortUp.value ? player1[sortValue.value]! - player2[sortValue.value]! : player2[sortValue.value]! - player1[sortValue.value]!;
        });
    })

    return combinedList;
})

const setSortValue = (value:SortValueOpenGames) => {
    if(sortValue.value == value)
        sortUp.value = !sortUp.value;
    else
        sortUp.value = false;

    sortValue.value = value;
}

const giveArrowClass = (value:string) => {
    if(value == sortValue.value)
        return sortUp.value ? "ogs-arrow ogs-arrow-up" : "ogs-arrow ogs-arrow-down";
}

onMounted(() => {
    new Swiper('#OpenGamesStatisticsSwiper',{
        modules: [Pagination],
        initialSlide: 0,
        spaceBetween: 50,
        speed: 500,
        pagination: {
            el: "#OpenGamesStatisticsSwiper-Pagination",
            clickable: true,
            renderBullet: (index, className) => {
                return '<span class="' + className + '">' + (index == 0 ? "1 vs. 1" : "2 vs. 2") + '</span>';
            }
        }
    });
});
</script>

<template> 
        <div style="padding: 15px 0px; text-align: center; color: var(--main-color); font-weight: bold; font-size: 14px;">
            Damit ein Spieler in den Statistiken erscheint, muss er gegen mindestens 4 verschiedene Teams gespielt haben
        </div>

        <div class="swiper-pagination" id="OpenGamesStatisticsSwiper-Pagination"/>

        <div class="OpenGamesStatistics swiper-container" id="OpenGamesStatisticsSwiper">

            <div class="swiper-wrapper">

                <div class="rt-table swiper-slide" v-for="(openGamesStatistic ,groupIndex) in openGamesStatistics" :key="groupIndex">

                    <table class="table table-hover caption-top">
                        <thead>
                            <tr style="height: auto;">
                                <th @click="setSortValue('placement')" :class="giveArrowClass('placement')">{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                                <th @click="setSortValue('name')" :class="giveArrowClass('name')">{{'Name'}}</th>
                                <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'Sieg.'}}</th>
                                <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                                <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
                                <th @click="setSortValue('averageWins')" :class="giveArrowClass('averageWins')">{{ windowWidth > 900 ? 'Siegwahrscheinlichkeit' : 'Siegwahr.'}}</th>
                                <!-- <th v-if="windowWidth > 360" @click="setSortValue('ammountOfDrunkenCups')" :class="giveArrowClass('ammountOfDrunkenCups')">{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'}}</th> -->
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(player, index) in openGamesStatistic" :key="index">
                                <td>{{ player.placement! + 1}}</td>
                                <td>{{ player.name.replace(" ","\n") }}</td>
                                <td>{{ player.wins }}</td>
                                <td>{{ player.ammountOfMatches }}</td>
                                <td>{{ player.averageScore }}</td>
                                <td>{{ player.averageWins + "%" }}</td>
                                <!-- <td v-if="windowWidth > 360">{{ player.ammountOfDrunkenCups }}</td> -->
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="windowWidth < 900" class="ogs-explain">
                        <div>*Pl. = Platz</div>
                        <div>*Spi. = Spiele</div>
                        <div>*Sieg. = Siege</div>
                        <div>*Trfq. = Trefferquote</div>
                        <div>*Siegwahr. = Siegwahrscheinlichkeit</div>
                        <!-- <div v-if="windowWidth > 360">*Getru. Becher = Getrunkene Becher</div> -->
                    </div>

                </div>

            </div>
        </div>
</template>

<style>
.OpenGamesStatistics{
   overflow: clip;
}

/* Top Swiper Pagination */
#OpenGamesStatisticsContainer .swiper-pagination, .Standings .swiper-pagination{
   position: sticky;
   padding-top: 10px;
   padding-bottom: 20px;
   display: flex;
   background-color: white;
   top: 290px;
}
#OpenGamesStatisticsContainer .swiper-pagination-bullet, .Standings .swiper-pagination-bullet{
    padding: 5px 10px; 
    border-radius: 0;
    width: auto;
    height: auto;
    text-align: center;
    color: var(--secondary-color);
    background-color: transparent;
    opacity: 1; 
    margin: 0;
    flex: 1 1 0;
    text-align: center;
}
#OpenGamesStatisticsContainer .swiper-pagination-bullet-active, .Standings .swiper-pagination-bullet-active{
	color:white;
	background: var(--main-color);
}

.ogs-text{
    text-align: center;
    margin-bottom: 50px;
    font-size: 18px;
    color: var(--main-color);
}

#OpenGamesStatisticsContainer table{
    text-align: center;
    margin-top: 30px;
    border-collapse: collapse;
}
#OpenGamesStatisticsContainer table *{
    vertical-align: middle;
}
#OpenGamesStatisticsContainer tbody tr{
    font-size: 18px;
}
#OpenGamesStatisticsContainer tbody tr:nth-of-type(1){
    background: var(--secondary-color-weak);
    font-size: 22px;
}
#OpenGamesStatisticsContainer tbody tr:nth-of-type(2){
    background: #e6faff;
}
#OpenGamesStatisticsContainer tbody tr:nth-of-type(3){
    background: #f4fdff;
}
#OpenGamesStatisticsContainer table th{ 
    position: sticky;
    top: 350px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
    cursor: pointer;
    z-index: 2;
    border: 1px solid rgba(0, 0, 0, 0.3); 
    border-top: 0;
}
#OpenGamesStatisticsContainer table td{
    background: inherit;
    border: 1px solid rgba(0, 0, 0, 0.3); 
}
#OpenGamesStatisticsContainer table th:first-child{
    border-left: 0;
}
#OpenGamesStatisticsContainer table th:last-child{
    border-right: 0;
}
#OpenGamesStatisticsContainer table tr td:first-child {
    border-left: 0;
}
#OpenGamesStatisticsContainer table tr:last-child td {
    border-bottom: 0;
}
#OpenGamesStatisticsContainer table tr td:last-child {
    border-right: 0;
}


.ogs-arrow-down::after, .ogs-arrow-up::after{
    content: ' ';
    position: relative;
    left: 10px;
    border: 8px solid transparent;
}
.ogs-arrow-down::after{
    top: 18px;
    border-top-color: var(--main-color);
}
.ogs-arrow-up::after{
    bottom: 18px;
    border-bottom-color: var(--main-color);
}

/*MOBILE*/
@media (width <= 900px){
    #OpenGamesStatisticsContainer .swiper-pagination{
      top: 235px;
    }
    .ogs-text{
        font-size: 16px;
        margin-bottom: 30px;
    }
    .ogs-explain{
        font-size: 14px;
        color: var(--main-color);
        margin-bottom: 30px;
    }
    #OpenGamesStatisticsContainer table{
        width: 100%;
        margin-top: 0px;
    }
    #OpenGamesStatisticsContainer table *{
        font-size: 15px;
    }
    #OpenGamesStatisticsContainer tr{
        height: 80px;
    }
    #OpenGamesStatisticsContainer table th{ 
        top: 295px;
        font-size: 15px;
    }
    #OpenGamesStatisticsContainer th:nth-of-type(1), #OpenGamesStatisticsContainer td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 4px;
        padding-right: 10px;
    }
    #OpenGamesStatisticsContainer th:nth-of-type(2), #OpenGamesStatisticsContainer td:nth-of-type(2){
        min-width: 100px;
        white-space: break-spaces;
    }
    .ogs-arrow-down::after, .ogs-arrow-up::after{
        left: 5px;
        border-width: 6px;
    }
    .ogs-arrow-down::after{
        top: 15px;
    }
    .ogs-arrow-up::after{
        bottom: 15px;
    }
}

/*MOBILE S*/
@media (width <= 360px){
    #OpenGamesStatisticsContainer table *{
        font-size: 14px !important;
    }
    .bp-title{
        font-size: 24px;
    }
    #OpenGamesStatisticsContainer th:nth-of-type(2), #OpenGamesStatisticsContainer td:nth-of-type(2){
        max-width: 100px;
    }
    .ogs-text{
        font-size: 15px;
    }
}
</style>