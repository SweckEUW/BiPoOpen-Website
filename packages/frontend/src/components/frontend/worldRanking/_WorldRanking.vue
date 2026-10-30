<template>
    <div class="WorldRanking">

        <!-- lazy: nur der aktive Reiter wird gerendert -->
        <Tabs v-model:value="activeTab" lazy>
            <!-- Reiter kleben unter dem App-Header -->
            <div ref="stickyBar" class="wr-sticky-bar" :style="{ top: stickyBarTop }">
                <TabList class="wr-tablist">
                    <Tab value="elo">Weltrangliste</Tab>
                    <Tab value="saison">Saisonwertung</Tab>
                </TabList>
            </div>

            <Loadingscreen v-if="isLoading"/>
            <div v-else-if="hasError || !data" class="wr-error">Die Rangliste konnte nicht geladen werden.</div>

            <TabPanels v-else :pt="{ root: { style: { '--p-tabs-tabpanel-padding': '0' } } }">
                <TabPanel value="elo">
                    <EloRanking :data="data" :now="now"/>
                </TabPanel>

                <TabPanel value="saison">
                    <SeasonRanking :data="data" :now="now"/>
                </TabPanel>
            </TabPanels>
        </Tabs>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Loadingscreen from '@/components/shared/Loadingscreen.vue';
import { useStickyBar } from '@/components/shared/useStickyStack';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import EloRanking from './EloRanking.vue';
import SeasonRanking from './SeasonRanking.vue';
import { useWorldRankingData } from './useWorldRankingData';

const { now, data, isLoading, hasError } = useWorldRankingData();

// Reiter per Link vorwaehlbar, z.B. /Weltrangliste?tab=saison
const TABS = ['elo', 'saison'];
const requestedTab = useRoute().query.tab as string | undefined;
const activeTab = ref(requestedTab && TABS.includes(requestedTab) ? requestedTab : 'elo');

const stickyBar = ref<HTMLElement | null>(null);
const stickyBarTop = useStickyBar(stickyBar);
</script>

<style scoped>
.WorldRanking {
    max-width: 720px;
    margin: 0 auto;
    color: #1d1f23;
}

/* ── Reiter als Segment-Schalter ── */
.wr-sticky-bar {
    position: sticky;
    z-index: 4;
    padding: 10px 0 4px;
    background: white;
}
:deep(.wr-tablist .p-tablist-content) {
    padding: 4px;
    border-radius: 12px;
    background: #f0f1f3;
}
:deep(.wr-tablist .p-tablist-tab-list) {
    border: none;
    background: transparent;
}
:deep(.wr-tablist .p-tablist-active-bar) {
    display: none;
}
:deep(.wr-tablist .p-tab) {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    border: none;
    border-radius: 9px;
    background: transparent;
    color: #6b717b;
    font-size: 14px;
    font-weight: 600;
}
:deep(.wr-tablist .p-tab-active) {
    background: white;
    color: #1d1f23;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.wr-error {
    padding: 30px 14px;
    text-align: center;
    font-size: 14px;
    color: #6b717b;
}
</style>
