
<template> 
    <div style="padding: 15px 0px; text-align: center; color: var(--main-color); font-weight: bold; font-size: 14px;">
        Damit ein Spieler in den Statistiken erscheint, muss er gegen mindestens 4 verschiedene Teams gespielt haben
    </div>

    <div style="padding: 15px 0px; text-align: center; color: var(--main-color); font-weight: bold; font-size: 14px;">
        {{'Nackte Meile Tracker:'}}
        <div v-for="player in playersWith0Hits">{{ player.name }} - {{ getOpenGameDate(player.time) }}</div>
    </div>

    <div class="swiper-pagination" id="OpenGamesStatisticsSwiper-Pagination"/>

    <div class="flex w-full justify-center items-center pb-[20px]">
        <div class="mr-[20px]" style="color: var(--main-color)">{{  withoutEastGermany ? "Ohne Ost-Deutschland" : "Mit Ost-Deutschland" }}</div>
        <ToggleSwitch v-model="withoutEastGermany" :pt="{slider: { style: 'background-color: var(--main-color);'}}"/>
    </div>

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
                            <th @click="setSortValue('averageHits')" :class="giveArrowClass('averageHits')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
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
                            <td>{{ player.averageHits.toFixed(2) }}</td>
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

<script setup lang="ts">
import { computed, onMounted, PropType, ref } from 'vue';
import { getAllOpenGames, getAllTimeOpenGamesStatsList } from './OpenGamesUtilFunctions';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ToggleSwitch from 'primevue/toggleswitch';

const props = defineProps({
    openGames: {type: Object as PropType<Match[]>, required: true }
});

let sortValue = ref<SortValueOpenGames>("averageWins");
let sortUp = ref(false);

let withoutEastGermany = ref(false);

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const openGamesStatistics = computed(() => {
    let filteredOpenGames = props.openGames;
    if(withoutEastGermany.value){
        let eastGermanyPlayers = ["Edu Schimpf", "Alex Klein", "Linda Jahrberg", "Emely Müller", "Leo Straub", "Lea Ableitner", "Nico Sanchez"];
        filteredOpenGames = props.openGames.filter((match) => {
            let team1HasEastGermanyPlayer = match.team1.players.some((player) => eastGermanyPlayers.includes(player.name));
            let team2HasEastGermanyPlayer = match.team2.players.some((player) => eastGermanyPlayers.includes(player.name));
            return !team1HasEastGermanyPlayer && !team2HasEastGermanyPlayer;
        });
    }

    let openGamesStatisticsOneVersusOne = getAllTimeOpenGamesStatsList(filteredOpenGames, true);
    let openGamesStatisticsTwoVersusTwo = getAllTimeOpenGamesStatsList(filteredOpenGames, false);

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

const playersWith0Hits = ref<(Player & { time: number })[]>([]);

onMounted(async () => {
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


    let openGames = await getAllOpenGames();
    openGames.forEach(match => {
        match.team1.players.forEach(player => {
            if(player.score == 0) playersWith0Hits.value.push({...player, time: match.time!});
        });
        match.team2.players.forEach(player => {
            if(player.score == 0) playersWith0Hits.value.push({...player, time: match.time!});
        });
    });
})

let getOpenGameDate = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}
</script>

<style lang="scss">
.OpenGamesStatistics{
   overflow: clip;
}

/* Top Swiper Pagination */
.OpenGames{
    .swiper-pagination, .Standings .swiper-pagination{
        position: sticky;
        padding-top: 10px;
        padding-bottom: 20px;
        display: flex;
        background-color: white;
        top: 290px;
    }
    .swiper-pagination-bullet, .Standings .swiper-pagination-bullet{
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
    .swiper-pagination-bullet-active, .Standings .swiper-pagination-bullet-active{
        color:white;
        background: var(--main-color);
    }

    table{
        text-align: center;
        margin-top: 30px;
        border-collapse: collapse;
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
        top: 350px;
        background-color: #FFF;
        color: var(--main-color);
        font-size: 20px;
        cursor: pointer;
        z-index: 2;
        border: 1px solid rgba(0, 0, 0, 0.3); 
        border-top: 0;
    }
    table td{
        background: inherit;
        border: 1px solid rgba(0, 0, 0, 0.3); 
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
}

.ogs-text{
    text-align: center;
    margin-bottom: 50px;
    font-size: 18px;
    color: var(--main-color);
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
    .OpenGames{
        .swiper-pagination{
            top: 235px;
        }
        table{
            width: 100%;
            margin-top: 0px;
        }
        table *{
            font-size: 15px;
        }
        tr{
            height: 80px;
        }
        table th{ 
            top: 295px;
            font-size: 15px;
        }
        table th:nth-of-type(1), table td:nth-of-type(1){
            max-width: 30px;
            width: 30px;
            padding-left: 4px;
            padding-right: 10px;
        }
        table th:nth-of-type(2), table td:nth-of-type(2){
            min-width: 100px;
            white-space: break-spaces;
        }
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
    .OpenGames{
        table *{
            font-size: 14px !important;
        }
        th:nth-of-type(2), td:nth-of-type(2){
            max-width: 100px;
        }
    }
    .bp-title{
        font-size: 24px;
    }
    .ogs-text{
        font-size: 15px;
    }
}
</style>