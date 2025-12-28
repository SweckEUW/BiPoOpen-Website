
<template>
    <table class="table table-hover caption-top">
        <thead>
            <tr style="height: auto;">
                <th colspan="2" @click="setSortValue('placement')" :class="giveArrowClass('placement')" class="text-left!">Team</th>
                <th @click="setSortValue('ammountOfMatches')" :class="giveArrowClass('ammountOfMatches')">{{ windowWidth > 900 ? 'Spiele' : 'Spi.'}}</th>
                <th @click="setSortValue('wins')" :class="giveArrowClass('wins')">{{ windowWidth > 900 ? 'Siege' : 'S'}}</th>
                <th @click="setSortValue('looses')" :class="giveArrowClass('looses')">{{ windowWidth > 900 ? 'Niederlagen' : 'N'}}</th>
                <th>{{ windowWidth > 900 ? 'Trefferverhältnis' :'Trfv.'}}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(player, index) in sortedLeaguePlayers" :key="index">
                <td>{{ player.placement! + 1}}</td>
                <td>
                    <div class="lg-team">
                        <Image class="lg-logo" :src="props.leaguePlayers.find(lp => lp.name === player.name)?.logo" preview 
                            :pt="{ 
                                toolbar: { style: 'display: none' },
                                previewMask: { style: 'background: transparent; opacity: 0' },
                                mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                            }"
                        />
                        <div>{{ player.name.replace(" ","\n") }}</div>
                    </div>
                </td>
                <td>{{ player.ammountOfMatches }}</td>
                <td>{{ player.wins }}</td>
                <td>{{ player.ammountOfMatches - player.wins }}</td>
                <td>{{ player.hitDifference }}</td>
            </tr>
        </tbody>
    </table>

    <div v-if="windowWidth < 900" class="lg-explain">
        <div>*Pl. = Platz</div>
        <div>*Spi. = Spiele</div>
        <div>*S = Siege</div>
        <div>*Trf. = Treffer</div>
        <div>*Trfq. = Trefferquote</div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { getLeagueList } from "./LeagueUtilFunctions";
import Image from "primevue/image";

const props = defineProps({
    leaguePlayers: {type: Array as () => LeaguePlayer[], required: true },
    leagueGames: {type: Array as () => Match[], required: true }
});

let sortValue = ref<SortValueLeague>("wins");
let sortUp = ref(false);

const sortedLeaguePlayers = computed(() => {
    let leaguePlayersList = getLeagueList(props.leagueGames, props.leaguePlayers);

    // Sort the MVP List depenging on the sortValue
    leaguePlayersList.sort((player1, player2) => {
        if(sortValue.value == "name") // sort strings
            return sortUp.value ? player1[sortValue.value].localeCompare(player2[sortValue.value]) : player2[sortValue.value].localeCompare(player1[sortValue.value])

        if(player2[sortValue.value] == player1[sortValue.value])
            return sortUp.value ? player2.placement! - player1.placement! : player1.placement! - player2.placement!;
        
        return sortUp.value ? player1[sortValue.value]! - player2[sortValue.value]! : player2[sortValue.value]! - player1[sortValue.value]!;
    });

    return leaguePlayersList;
})

let windowWidth = ref(window.screen.width);
window.addEventListener("resize", () => {
    windowWidth.value = window.screen.width;
});

const setSortValue = (value:SortValueLeague) => {
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
    top: 260px;
    background-color: #FFF;
    color: var(--main-color);
    font-size: 20px;
    cursor: pointer;
    z-index: 2;
}
table td{
    background: inherit;
}

.lg-team{
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.lg-logo{
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-right: 20px;
}
.lg-team div{
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
    .lg-explain{
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
    .table>:not(caption)>*>* {
        padding: 10px 4px;
    }
    tr{
        height: 80px;
    }
    table th{ 
        top: 190px;
        font-size: 15px;
    }
    th:nth-of-type(1), td:nth-of-type(1){
        max-width: 30px;
        width: 30px;
        padding-left: 4px;
        padding-right: 0px;
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
    .lg-logo{
        margin-right: 10px;
        width: 80px;
        height: 80px;
    }
}

/*MOBILE S*/
@media (width <= 376px){
    table *{
        font-size: 14px !important;
    }
    .lg-team{
        font-size: 14px;
    }
    .lg-logo{
        width: 40px;
        height: 40px;
    }
}
</style>