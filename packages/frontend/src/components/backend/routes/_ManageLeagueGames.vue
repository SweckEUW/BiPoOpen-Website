<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">League Games Backend</h1>

        <Loadingscreen v-show="!leagueGames"/>

        <div v-if="leagueGames">
            <MatchElement v-for="leagueGame in leagueGames" :key="leagueGame._id"
                :match="leagueGame" :isBackend="true" :setGameResult="setGameResult" :deleteMatch="deleteMatch" :editName="true"
            /> <!-- TODO-Minor: Only Display some Games not all. Adjust Database download to only get the latest games -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { getAllLeagueGames, updateLeagueGame, deleteLeagueGame} from "@/components/frontend/league/LeagueUtilFunctions";

let leagueGames = ref<Match[]|undefined>();

const getLeagueGames = async () => {
    let leagueGamesWrongOrder = await getAllLeagueGames();
    leagueGames.value = leagueGamesWrongOrder!.reverse();
}
getLeagueGames();

const setGameResult = async (match:Match) => {
    await updateLeagueGame(match);
    await getLeagueGames();
}

const deleteMatch = async (match:Match) => {
    await deleteLeagueGame(match);
    await getLeagueGames();
}
</script>

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