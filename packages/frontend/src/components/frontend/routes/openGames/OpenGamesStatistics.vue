<script setup lang="ts">
import { computed, PropType, ref } from 'vue';
import { OpenGame, SortValueOpenGames } from './OpenGamesTypes';
import { getAllTimeOpenGamesStatsList } from './OpenGamesUtilFunctions';

const props = defineProps({
    openGames: {type: Object as PropType<OpenGame[]>, required: true }
});

let sortValue = ref<SortValueOpenGames>("averageWins");
let sortUp = ref(false);

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const sortedOpenGamesList = computed(() => {
    let openGamesSortedList = getAllTimeOpenGamesStatsList(props.openGames);

    // Sort the List depenging on the sortValue
    openGamesSortedList.sort((player1, player2) => {
        if(sortValue.value == "name") // sort strings
            return sortUp.value ? player1[sortValue.value].localeCompare(player2[sortValue.value]) : player2[sortValue.value].localeCompare(player1[sortValue.value])

        if(player2[sortValue.value] == player1[sortValue.value])
            return sortUp.value ? player2.placement! - player1.placement! : player1.placement! - player2.placement!;
        
        return sortUp.value ? player1[sortValue.value]! - player2[sortValue.value]! : player2[sortValue.value]! - player1[sortValue.value]!;
    });

    return openGamesSortedList;
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
</script>

<template> 
    <table class="table table-hover caption-top">
        <thead>
            <tr style="height: auto;">
                <th @click="setSortValue('placement')" :class="giveArrowClass('placement')">{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                <th @click="setSortValue('name')" :class="giveArrowClass('name')">{{'Name'}}</th>
                <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'Sieg.'}}</th>
                <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
                <th @click="setSortValue('averageWins')" :class="giveArrowClass('averageWins')">{{ windowWidth > 900 ? 'Siegwahrscheinlichkeit' : 'Siegwahr.'}}</th>
                <!-- <th v-if="windowWidth > 360" @click="setSortValue('ammountOfDrunkenCups')" :class="giveArrowClass('ammountOfDrunkenCups')">{{ windowWidth > 900 ? 'Getrunkene Becher' : 'Getru. Becher'}}</th> -->
            </tr>
        </thead>
        <tbody>
            <tr v-for="(player, index) in sortedOpenGamesList" :key="index">
                <td>{{ player.placement! + 1}}</td>
                <td>{{ player.name.replace(" ","\n") }}</td>
                <td>{{ player.ammountOfMatches }}</td>
                <td>{{ player.wins }}</td>
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
</template>

<style scoped>
.ogs-text{
    text-align: center;
    margin-bottom: 50px;
    font-size: 18px;
    color: var(--main-color);
}

table{
    text-align: center;
    margin-top: 30px;
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
    z-index: 2;
}
table td{
    background: inherit;
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
    .ogs-text{
        font-size: 16px;
        margin-bottom: 30px;
    }
    .ogs-explain{
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
    table *{
        font-size: 14px !important;
    }
    .bp-title{
        font-size: 24px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
        max-width: 100px;
    }
    .ogs-text{
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