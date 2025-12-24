
<template>
    <h1 class="bp-title">BiPo League</h1>
    <div class="lg-logo">
        <img src="@/assets/league/BiPo-League-Logo.png" alt="BiPo League Logo">
    </div>

    <div class="MVP">
        <table class="table table-hover caption-top">
            <thead>
                <tr style="height: auto;">
                    <th @click="setSortValue('placement')" :class="giveArrowClass('placement')">{{ windowWidth > 900 ? 'Platz' :'Pl.'}}</th>
                    <th @click="setSortValue('name')" :class="giveArrowClass('name')">{{'Team'}}</th>
                    <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                    <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'S'}}</th>
                    <th @click="setSortValue('score')" :class="giveArrowClass('score')">{{ windowWidth > 900 ? 'Treffer' : 'Trf.'}}</th>
                    <th @click="setSortValue('averageScore')" :class="giveArrowClass('averageScore')">{{ windowWidth > 900 ? 'Trefferquote' : 'Trfq.'}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(player, index) in players" :key="index">
                    <td>{{ player.placement! + 1}}</td>
                    <td>
                        <div class="mvp-name">
                            <img :src="player.logo" alt="">
                            <div>{{ player.name.replace(" ","\n") }}</div>
                        </div>
                    </td>
                    <td>{{ player.ammountOfMatches }}</td>
                    <td>{{ player.wins }}</td>
                    <td>{{ player.score }}</td>
                    <td>{{ player.averageScore }}</td>
                </tr>
            </tbody>
        </table>

        <div v-if="windowWidth < 900" class="mvp-explain">
            <div>*Pl. = Platz</div>
            <div>*Spi. = Spiele</div>
            <div>*S = Siege</div>
            <div>*Trf. = Treffer</div>
            <div>*Trfq. = Trefferquote</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

let sortValue = ref<SortValueMVP>("averageScore");
let sortUp = ref(false);

let players = [
    { placement: 0, name: "Hangover Heroes", logo: new URL(`/src/assets/league/teams/Hangover-Heroes.png`, import.meta.url), averageScore: 0, score: 0, ammountOfMatches: 0, wins: 0},
    { placement: 0, name: "Hopfenstreife", logo: new URL(`/src/assets/league/teams/Hopfenstreife.png`, import.meta.url),  averageScore: 0, score: 0, ammountOfMatches: 0, wins: 0},
    { placement: 0, name: "Insane", logo: new URL(`/src/assets/league/teams/Insane.png`, import.meta.url), averageScore: 0, score: 0, ammountOfMatches: 0, wins: 0},
    { placement: 0, name: "Lokomotive Wiedenbrück", logo: new URL(`/src/assets/league/teams/Lokomotive-Wiedenbrueck.png`, import.meta.url), averageScore: 0, score: 0, ammountOfMatches: 0, wins: 0},
]

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const setSortValue = (value:SortValueMVP) => {
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

<style scoped>
.lg-logo{
    width: 100%;
    display: flex;
    justify-content: center;
}
.lg-logo img{
    width: 100px;
    height: auto;
    margin-bottom: 20px;
}

table{
    text-align: center;
    padding-top: 20px;
}
table *{
    vertical-align: middle;
    border: none;
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
    top: 150px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
    cursor: pointer;
    z-index: 2;
}
table td{
    background: inherit;
}

.mvp-name{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 30px;
}
.mvp-name img{
    width: 100px;
    height: 100px;
    object-fit: contain;
    margin-right: 20px;
}
.mvp-name div{
    text-align: left;
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
        top: 130px;
        font-size: 15px;
    }
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 4px;
        padding-right: 10px;
    }
    th:nth-of-type(2), td:nth-of-type(2){
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
    .mvp-name{
        padding-left: 10px;
    }
    .mvp-name img{
        margin-right: 10px;
        width: 60px;
        height: 60px;
    }
}

/*MOBILE S*/
@media (width <= 376px){
    table *{
        font-size: 14px !important;
    }
    .mvp-text{
        font-size: 15px;
    }
    .mvp-name{
        font-size: 14px;
    }
    .mvp-name img{
        width: 40px;
        height: 40px;
    }
}
</style>