<template>
    <div class="HallofFame">
        
        <h1 class="bp-title">League Games Backend</h1>

        <Loadingscreen v-show="!leagueGames"/>

        <div v-if="leagueGames">
            <div class="ml-filters">
                <Select v-model="selectedSeason" :options="seasonOptions" optionLabel="label" optionValue="value" class="w-[50%]" />
                <Select v-model="selectedLeague" :options="leagueOptions" optionLabel="label" optionValue="value" class="w-[50%]" />
            </div>

            <div v-if="!filteredLeagueGames.length" class="ml-empty">Keine Spiele in dieser Liga.</div>

            <MatchElement v-for="leagueGame in filteredLeagueGames" :key="leagueGame._id"
                :match="leagueGame" :isBackend="true" :setGameResult="setGameResult" :deleteMatch="deleteMatch" :editName="true"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Select from 'primevue/select';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import { filterLeagueGames, getAllLeagueGames, updateLeagueGame, deleteLeagueGame} from "@/components/frontend/league/LeagueUtilFunctions";
import { CURRENT_SEASON_SLUG, LEAGUE_SEASONS, getSeason } from "@/components/frontend/league/LeagueSeasonsData";

let leagueGames = ref<Match[]|undefined>();

// Filter, damit die Liste ueber mehrere Saisons hinweg bedienbar bleibt.
const selectedSeason = ref(CURRENT_SEASON_SLUG);
const selectedLeague = ref(getSeason(CURRENT_SEASON_SLUG)?.divisions[0].league ?? 1);

const seasonOptions = LEAGUE_SEASONS.map(season => ({ label: `Saison ${season.label}`, value: season.slug }));

const leagueOptions = computed(() =>
    (getSeason(selectedSeason.value)?.divisions ?? []).map(division => ({ label: division.label, value: division.league }))
);

// Beim Saisonwechsel auf eine Liga springen, die es in dieser Saison auch gibt.
watch(selectedSeason, () => {
    if (!leagueOptions.value.some(option => option.value === selectedLeague.value))
        selectedLeague.value = leagueOptions.value[0]?.value ?? 1;
});

const filteredLeagueGames = computed(() =>
    filterLeagueGames(leagueGames.value ?? [], selectedSeason.value, selectedLeague.value)
);

const getLeagueGames = async () => {
    let leagueGamesWrongOrder = await getAllLeagueGames();
    leagueGames.value = leagueGamesWrongOrder!.reverse();
}
getLeagueGames();

const setGameResult = async (match:Match) => {
    let success = await updateLeagueGame(match);
    await getLeagueGames();
    return success;
}

const deleteMatch = async (match:Match) => {
    let success = await deleteLeagueGame(match);
    await getLeagueGames();
    return success;
}
</script>

<style scoped>
.ml-filters{
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}
.ml-empty{
    text-align: center;
    color: var(--main-color);
    opacity: 0.8;
    padding: 30px 20px;
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