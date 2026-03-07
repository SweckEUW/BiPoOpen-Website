<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">Open Games Backend</h1>

        <Loadingscreen v-show="!openGames"/>

        <div v-if="openGames">
            <div v-for="openGame in openGames" :key="openGame._id">
                <div class="og-time">{{ getGameTime(openGame.time!) }}</div>
                <MatchElement
                    :match="openGame" :isBackend="true" :setGameResult="setGameResult" :deleteMatch="deleteMatch" :editName="true"
                /> <!-- TODO-Minor: Only Display some Games not all. Adjust Database download to only get the latest games -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { getAllOpenGames, updateOpenGame, deleteOpenGame } from "@/components/frontend/openGames/OpenGamesUtilFunctions";

let openGames = ref<Match[]|undefined>();

const getOpenGames = async () => {
    let openGamesWrongOrder = await getAllOpenGames();
    openGames.value = openGamesWrongOrder!.reverse();
}
getOpenGames();


const setGameResult = async (match:Match) => {
    await updateOpenGame(match);
    await getOpenGames();
}

const deleteMatch = async (match:Match) => {
    await deleteOpenGame(match);
    await getOpenGames();
}

let getGameTime = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}
</script>

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