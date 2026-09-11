<template>
    <div class="League">
        
        <h1 class="bp-title !pb-[7px] !mb-[0px]">BiPo League</h1>
        <h2 class="!text-[var(--main-color)] !text-[20px] !pt-[0px] !mt-[0px] !pb-[0px] opacity-80">Saison 2025/26</h2>

        <div class="lg-logo">
            <Image :src="BipoLeagueLogo" preview 
                :pt="{ 
                    toolbar: { style: 'display: none' },
                    previewMask: { style: 'background: transparent; opacity: 0' },
                    mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                }"
            />
        </div>

        <Loadingscreen v-if="isLoading"/>

        <div v-if="!isLoading">
            <Tabs v-model:value="activeTab" class="pt-[20px] max-[900px]:pt-[10px]">
                <TabList class="w-full">
                    <Tab value="table" class="flex-1 justify-center">Tabelle</Tab>
                    <Tab value="games" class="flex-1 justify-center">Spiele</Tab>
                    <Tab value="finalfour" class="flex-1 justify-center">Final 4</Tab>
                </TabList>
                <TabPanels :pt="{ root: { style: { '--p-tabs-tabpanel-padding': '0.75rem 0' } } }">
                    <TabPanel value="table">
                        <LeagueTable :leaguePlayers="leaguePlayers" :leagueGames="leagueGames" />
                    </TabPanel>

                    <TabPanel value="games">
                        <div class="bp-button" @click="toggleModalAddGame()">Spiel eintragen</div>

                        <Teleport to="body">
                            <Transition name="fade">
                                <ModalAddLeagueGame v-if="showModalAddGame" :toggleModalAddGame="toggleModalAddGame" :setMatch="setMatch" :leaguePlayers="leaguePlayers" :getLeagueGames="getLeagueGames"/>
                            </Transition>
                        </Teleport>

                        <div v-for="match in leagueGames" :key="match.time!" style="margin-top: 10px;">
                            <div style="color: var(--main-color)">{{ getGameTime(match.time!) }}</div>
                            <MatchElement :match="match" :avatarShape="'square'"/> 
                        </div>
                    </TabPanel>

                    <TabPanel value="finalfour">
                        <LeagueFinalFour :leaguePlayers="leaguePlayers" :leagueGames="leagueGames" />
                    </TabPanel>
                </TabPanels>
            </Tabs>

        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import LeagueTable from './LeagueTable.vue';
import LeagueFinalFour from './LeagueFinalFour.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import ModalAddLeagueGame from './ModalAddLeagueGame.vue';
import { getAllLeagueGames } from './LeagueUtilFunctions';
import { LEAGUE_PLAYERS } from './LeaguePlayersData';
import Image from "primevue/image";
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
// import BiPoKnecht from '@/components/frontend/biPoKnecht/BiPoKnecht.vue';
const BipoLeagueLogo = new URL(`/src/assets/league/BiPo-League-Logo.webp`, import.meta.url).href;

let showModalAddGame = ref(false);
let isLoading = ref(true);
let leagueGames = ref<Match[]>([]);
let match = ref<Match>();
let activeTab = ref('table');

let leaguePlayers: LeaguePlayer[] = LEAGUE_PLAYERS;

let setMatch = (newMatch: Match) => {
    match.value = newMatch;
    showModalAddGame.value = false;
}

const getLeagueGames = async () => {
    leagueGames.value = await getAllLeagueGames();
    leagueGames.value = leagueGames.value.reverse();
    isLoading.value = false;
}
getLeagueGames();

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}

let getGameTime = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}
</script>

<style scoped>
.lg-logo{
    width: 100%;
    display: flex;
    justify-content: center;
}
.lg-logo span{
    width: 70px;
    height: auto;
    margin-bottom: 20px;
}
:deep(.lg-logo img){
    object-fit: contain !important;
}

h2{
    font-size: 24px;
    width: 100%;
    text-align: center;
    color: var(--secondary-color);
    margin-top: 20px;
}
ul{
    padding: 0;
}

/* Make Avatars Bigger */
:deep(.p-avatar){
    width: 50px;
    height: 50px;
}
</style>