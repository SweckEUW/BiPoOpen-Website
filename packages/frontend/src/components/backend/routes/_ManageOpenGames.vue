<script setup lang="ts">
import { ref } from 'vue';
import ModalAddOpenGame from '@/components/frontend/openGames/ModalAddOpenGame.vue';
import { getAllOpenGames } from "@/openGamesFunctions/OpenGamesUtilFunctions";
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { Match } from "@/types";
import { updateOpenGame } from "@/openGamesFunctions/OpenGamesUtilFunctions";

let openGames = ref<Match[]|undefined>();
let showModalAddGame = ref(false);

const getOpenGames = async () => {
    let openGamesWrongOrder = await getAllOpenGames();
    openGames.value = openGamesWrongOrder!.reverse();
}
getOpenGames();

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}

const setGameResult = async (match:Match) => {
    await updateOpenGame(match);
    await getOpenGames();
}
</script>

<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">Open Games Backend</h1>

        <Loadingscreen v-show="!openGames"/>

        <div v-if="openGames">
            <Teleport to="body">
                <Transition name="fade">
                    <ModalAddOpenGame v-if="showModalAddGame" :toggleModalAddGame="toggleModalAddGame" :getOpenGames="getOpenGames"/>
                </Transition>
            </Teleport>

            <MatchElement v-for="openGame in openGames" :match="openGame" :isBackend="true" :setGameResult="setGameResult"/> <!-- TODO-Minor: Only Display some Games not all. Adjust Database download to only get the latest games -->
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