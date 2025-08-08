<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import ModalAddOpenGame from '@/components/frontend/openGames/ModalAddOpenGame.vue';
import { getAllOpenGames } from "@/components/frontend/openGames/OpenGamesUtilFunctions";
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import OpenGamesStatistics from './OpenGamesStatistics.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
let openGames = ref<Match[]|undefined>();
let showModalAddGame = ref(false);

const getOpenGames = async () => {
    openGames.value = await getAllOpenGames();
    openGames.value = openGames.value!.reverse()
}
getOpenGames();

let updateInterval = setInterval(() => {
    getOpenGames();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}
</script>

<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">{{"Offene Spiele"}}</h1>

        <Loadingscreen v-show="!openGames"/>

        <div v-if="openGames">

            <!-- Add Game Button -->
            <div class="bp-button" @click="toggleModalAddGame()">Spiel eintragen</div>

            <Teleport to="body">
                <Transition name="fade">
                    <ModalAddOpenGame v-if="showModalAddGame" :toggleModalAddGame="toggleModalAddGame" :getOpenGames="getOpenGames"/>
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
                    <!-- TODO-Minor: Only Display some Games not all. Adjust Database download to only get the latest games -->
                    <MatchElement v-for="openGame in openGames" :match="openGame"/>
                </div>

                <div class="tab-pane fade" :id="'OpenGamesStats'">
                    <OpenGamesStatistics :openGames="openGames"/>
                </div>
            </div>

        </div>

    </div>
</template>

<style scoped>
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
        top: 130px;
        padding: 15px 20px;
        margin-bottom: 30px;
    }
   .nav-tabs{
        top: 180px;
    }   
   .nav-link{
        font-size: 14px;
        padding: 10px 10px;
    }
}
</style>