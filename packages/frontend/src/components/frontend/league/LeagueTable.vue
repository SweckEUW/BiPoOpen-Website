
<template>

    <LeaguePlayerOverviewDrawer
        v-model:visible="leaguePlayerOverviewVisible"
        :selectedPlayer="selectedLeaguePlayer"
        :leaguePlayers="leaguePlayers"
        :leagueGames="games"
    />

    <Tabs v-model:value="activeTableTab" class="pt-[10px]">
        <TabList class="league-table-sticky-tablist pb-[10px] text-[12px]">
            <Tab value="overall">Aktuelle Tabelle</Tab>
            <Tab value="rueckrunde">Rückrunde</Tab>
            <Tab value="hinrunde">Hinrunde</Tab>
        </TabList>

        <TabPanels class="!pt-[0px]">
            <TabPanel value="overall">
                <LeagueStandingsTable
                    :leaguePlayers="props.leaguePlayers"
                    :leagueGames="games"
                    :highlightTopSlots="props.highlightTopSlots"
                    :promotionSlots="props.promotionSlots"
                    :relegationSlots="props.relegationSlots"
                    @select-player="openPlayerOverview"
                />
            </TabPanel>

            <TabPanel value="rueckrunde">
                <LeagueStandingsTable
                    :leaguePlayers="props.leaguePlayers"
                    :leagueGames="leagueGamesByRound.rueckrunde"
                    :highlightTopSlots="props.highlightTopSlots"
                    :promotionSlots="props.promotionSlots"
                    :relegationSlots="props.relegationSlots"
                    @select-player="openPlayerOverview"
                />
            </TabPanel>

            <TabPanel value="hinrunde">
                <LeagueStandingsTable
                    :leaguePlayers="props.leaguePlayers"
                    :leagueGames="leagueGamesByRound.hinrunde"
                    :highlightTopSlots="props.highlightTopSlots"
                    :promotionSlots="props.promotionSlots"
                    :relegationSlots="props.relegationSlots"
                    @select-player="openPlayerOverview"
                />
            </TabPanel>

        </TabPanels>
    </Tabs>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { splitLeagueGamesByRound } from './LeagueUtilFunctions';
import LeaguePlayerOverviewDrawer from './LeaguePlayerOverviewDrawer.vue';
import LeagueStandingsTable from './LeagueStandingsTable.vue';

const props = defineProps({
    leaguePlayers: { type: Array as () => LeaguePlayer[], required: true },
    leagueGames: { type: Array as () => Match[], required: true },
    regularSeasonGameCount: { type: Number, required: true },
    highlightTopSlots: { type: Number, default: 4 },
    promotionSlots: { type: Number, default: 0 },
    relegationSlots: { type: Number, default: 3 }
});

const activeTableTab = ref('overall');
const leaguePlayerOverviewVisible = ref(false);
const selectedLeaguePlayer = ref<LeaguePlayer | undefined>(undefined);

// Nur die Hauptrunde zaehlt fuer die Tabelle, die Final-Four-Spiele kommen danach.
let games = computed(() => props.leagueGames.toReversed().toSpliced(props.regularSeasonGameCount));
const leagueGamesByRound = computed(() => splitLeagueGamesByRound(games.value));

const openPlayerOverview = (playerName: string) => {
    const selectedPlayer = props.leaguePlayers.find(player => player.name === playerName);
    if (!selectedPlayer)
        return;

    selectedLeaguePlayer.value = selectedPlayer;
    leaguePlayerOverviewVisible.value = true;
}
</script>

<style scoped>
:deep(.league-table-sticky-tablist) {
    position: sticky;
    top: calc(205px + var(--league-sticky-extra, 0px));
    z-index: 3;
}

@media (max-width: 900px) {
    :deep(.league-table-sticky-tablist) {
        top: calc(125px + var(--league-sticky-extra, 0px));
    }
}
</style>