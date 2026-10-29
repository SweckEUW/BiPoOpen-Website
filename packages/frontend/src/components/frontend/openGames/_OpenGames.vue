<template>
    <div class="OpenGames">

        <h1 class="bp-title">Offene Spiele</h1>

        <Tabs v-model:value="activeTab">
            <!-- Reiter kleben unter dem App-Header -->
            <div ref="stickyBar" class="og-sticky-bar" :style="{ top: stickyBarTop }">
                <TabList v-show="!isLoading" class="og-tablist">
                    <Tab value="stats">Statistiken</Tab>
                    <Tab value="games">Spiele</Tab>
                    <Tab value="nackteMeilen">Nackte Meilen</Tab>
                </TabList>
            </div>

            <Loadingscreen v-if="isLoading"/>

            <!-- Add Game Button -->
            <FloatingActionButton label="Spiel eintragen" :visible="!isLoading" @click="toggleModalAddGame()"/>

            <GameEntryDrawer
                v-model:visible="showModalAddGame"
                subtitle="Offenes Spiel"
                allowExtraPlayers
                :save="saveOpenGame"
            />

            <TabPanels v-show="!isLoading" :pt="{ root: { style: { '--p-tabs-tabpanel-padding': '0' } } }">
                <TabPanel value="stats">
                    <OpenGamesStatistics :openGames="openGames"/>
                </TabPanel>

                <TabPanel value="games">
                    <div v-for="match in openGames" :key="match.time!" style="margin-top: 10px;"> <!-- TODO-Minor: Only Display some Games not all. Adjust Database download to only get the latest games -->
                        <MatchElement :match="match" showDate/>
                    </div>
                </TabPanel>

                <TabPanel value="nackteMeilen">
                    <NackteMeilenTracker :openGames="openGames"/>
                </TabPanel>
            </TabPanels>
        </Tabs>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { addOpenGame, getAllOpenGames } from "@/components/frontend/openGames/OpenGamesUtilFunctions";
import GameEntryDrawer from '@/components/shared/GameEntry/GameEntryDrawer.vue';
import { sidesToNewMatch, type GameEntrySide } from '@/components/shared/GameEntry/gameEntry';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue';
import OpenGamesStatistics from './OpenGamesStatistics.vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';
import NackteMeilenTracker from './NackteMeilenTracker.vue';
import { useStickyBar } from '@/components/shared/useStickyStack';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

let openGames = ref<Match[]>([]);
let isLoading = ref(true);
let showModalAddGame = ref(false);
// Reiter per Link vorwaehlbar, z.B. /Offene-Spiele?tab=nackteMeilen (Home-Slider)
const TABS = ['stats', 'games', 'nackteMeilen'];
const requestedTab = useRoute().query.tab as string | undefined;
let activeTab = ref(requestedTab && TABS.includes(requestedTab) ? requestedTab : 'stats');

const stickyBar = ref<HTMLElement | null>(null);
const stickyBarTop = useStickyBar(stickyBar);


const getOpenGames = async () => {
    openGames.value = await getAllOpenGames();
    openGames.value = openGames.value.reverse();
    isLoading.value = false;
}
getOpenGames();

const toggleModalAddGame = () => {
    showModalAddGame.value = !showModalAddGame.value;
}

const saveOpenGame = async (sides: GameEntrySide[]) => {
    const success = await addOpenGame(sidesToNewMatch(sides));
    if (success) await getOpenGames();
    return success;
}
</script>

<style scoped>
.og-sticky-bar{
    position: sticky;
    z-index: 4;
    background: white;
}
:deep(.og-tablist){
    padding-top: 4px;
}

/* MOBILE */
@media (width <= 900px){
    :deep(.og-tablist){
        padding-top: 4px;
    }
    :deep(.og-tablist .p-tab){
        font-size: 15px;
    }
}
</style>
