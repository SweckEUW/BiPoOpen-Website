<script setup lang="ts">
import { ref } from 'vue';
import ModalAddOpenGame from '@/components/frontend/openGames/ModalAddOpenGame.vue';
import { getAllOpenGames } from "@/components/frontend/openGames/OpenGamesUtilFunctions";
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import OpenGamesStatistics from './OpenGamesStatistics.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';

let openGames:Match[] = [];
let isLoading = ref(true);
let showModalAddGame = ref(false);
let openGameNames:string[] = [];

let getOpenGameDate = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}

const getOpenGames = async () => {
    openGames = await getAllOpenGames();
    openGames = openGames!.reverse();

    // Get all names from openGames for autocomplete
    openGameNames = [
        ...new Set(
            openGames.flatMap(game =>
                [...game.team1.players, ...game.team2.players].map(p => p.name)
            )
        )
    ];

    isLoading.value = false;
}
getOpenGames();

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}
</script>

<template>
    <div class="OpenGames">
        
        <h1 class="bp-title">Offene Spiele</h1>

        <Loadingscreen v-if="isLoading"/>

        <div v-show="!isLoading">

            <!-- Add Game Button -->
            <div class="bp-button" @click="toggleModalAddGame()">Spiel eintragen</div>

            <Teleport to="body">
                <Transition name="fade">
                    <ModalAddOpenGame v-if="showModalAddGame" :toggleModalAddGame="toggleModalAddGame" :getOpenGames="getOpenGames" :openGameNames="openGameNames"/>
                </Transition>
            </Teleport>

            <!-- Tabs -->
            <ul class="nav nav-tabs justify-content-center">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" :data-bs-target="'#OpenGamesMain'">Vergangene Spiele</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" :data-bs-target="'#OpenGamesStats'">Statistiken</button>
                </li>
            </ul>

            <!-- Content -->
            <div class="tab-content" id="OpenGamesStatisticsContainer">
                <div class="tab-pane fade show active" :id="'OpenGamesMain'">
                    <div v-for="openGame in openGames" :key="openGame.time!" style="margin-top: 10px;"> <!-- TODO-Minor: Only Display some Games not all. Adjust Database download to only get the latest games -->
                        <div class="og-time">{{ getOpenGameDate(openGame.time!) }}</div>
                        <MatchElement :match="openGame"/> 
                    </div>
                </div>

                <div class="tab-pane fade" :id="'OpenGamesStats'">
                    <OpenGamesStatistics :openGames="openGames"/>
                </div>
            </div>

        </div>

    </div>
</template>

<style scoped>
.og-time{
    font-size: 20px;
    margin-bottom: 5px;
    color: var(--main-color);
}
.bp-title{
    padding-bottom: 10px;   
}
.bp-button{
    position: sticky;
    top: 155px;
    z-index: 4;
}
.nav-tabs{
    position: sticky;
    top: 218px;
    padding-top: 20px;
    background: white;
    z-index: 2;
}
.nav-link{
    border-radius: 0px;
    width: 40vw;
    padding: 15px 10px;
    color: var(--secondary-color);
    font-weight: bold;
}
.nav-item{
    flex: 1;
}
.nav-item .active{
    background-color: var(--main-color) !important;
    color: white !important;
}
.nav-item button{
    width: 100%;
}

/* MOBILE */
@media (width <= 900px){
    .bp-button{
        top: 133px;
        padding: 15px 20px;
        margin-bottom: 0px;
    }
   .nav-tabs{
        top: 186px;
        padding-top: 10px;
    }   
   .nav-link{
        font-size: 14px;
        padding: 10px 10px;
    }
}
</style>