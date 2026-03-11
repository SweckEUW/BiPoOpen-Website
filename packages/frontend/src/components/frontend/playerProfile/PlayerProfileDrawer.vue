<template>
    <Drawer v-model:visible="drawerVisible" position="bottom" class="!h-[90%] rounded-xs mobile-sheet" :blockScroll="true" :showCloseIcon="false" style="color: var(--main-color)">
        <template #header>
            <div class="w-full flex justify-center">
                <div class="flex flex-col items-center">
                    <div class="font-bold text-[24px] text-[--p-primary-color]">{{ profileData ? profileData.name : 'Spieler Profil' }}</div>
                </div>
            </div>
        </template>

        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center items-center h-[400px]">
            <ProgressSpinner strokeWidth="3" class="pp-spinner" />
        </div>

        <div v-if="!isLoading && profileData" class="px-[10px]">

            <!-- Header -->
            <div class="flex flex-col items-center mb-[30px]">
                <Avatar :label="profileData.name.charAt(0)" size="xlarge" shape="circle" class="mb-[10px]" />
                <div class="text-[32px] font-bold text-[--p-primary-color]">{{ profileData.name }}</div>
                <Tag v-if="profileData.leagueTeam" severity="info" :value="'Liga: ' + profileData.leagueTeam" rounded class="mt-[4px]" />
            </div>

            <!-- Zeitraum-Auswahl -->
            <div class="flex justify-center mb-[16px]">
                <Select v-model="trendPeriod" :options="trendPeriodOptions" optionLabel="label" optionValue="value" class="w-[220px]" />
            </div>

            <Divider />

            <PlayerProfileOverview :data="profileData" />

            <Divider />

            <PlayerProfileAnalysis :data="profileData" />

            <Divider />

            <PlayerProfileBadges :badges="profileData.badges" />

            <Divider />

            <PlayerProfilePeers
                :partners="profileData.partners"
                :rivals="profileData.rivals"
                @openPlayer="openPlayer"
            />

            <Divider />

            <PlayerProfileHistory
                :matchHistory="profileData.matchHistory"
                :playerName="profileData.name"
                :leagueTeam="profileData.leagueTeam"
            />
        </div>

        <!-- Spieler nicht gefunden -->
        <Message v-if="!isLoading && !profileData" severity="warn" :closable="false" class="mt-[40px]">
            Spieler "{{ playerName }}" wurde nicht gefunden.
        </Message>
    </Drawer>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { getPlayerProfileData } from './PlayerProfileUtilFunctions';
import PlayerProfileOverview from './PlayerProfileOverview.vue';
import PlayerProfileAnalysis from './PlayerProfileAnalysis.vue';
import PlayerProfileBadges from './PlayerProfileBadges.vue';
import PlayerProfilePeers from './PlayerProfilePeers.vue';
import PlayerProfileHistory from './PlayerProfileHistory.vue';

import Drawer from 'primevue/drawer';
import ProgressSpinner from 'primevue/progressspinner';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Select from 'primevue/select';
import Message from 'primevue/message';

const drawerVisible = defineModel<boolean>('visible', { default: false });

const props = defineProps<{
    playerName: string;
}>();

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile')!;

const isLoading = ref(true);
const profileData = ref<PlayerProfileData | null>(null);

const trendPeriodOptions = [
    { label: 'Gesamte Zeit', value: 'all' as TrendPeriod },
    { label: 'Letzter Monat', value: '1m' as TrendPeriod },
    { label: 'Letzte 3 Monate', value: '3m' as TrendPeriod },
    { label: 'Letzte 6 Monate', value: '6m' as TrendPeriod },
    { label: 'Letztes Jahr', value: '1y' as TrendPeriod },
];
const trendPeriod = ref<TrendPeriod>('all');

const openPlayer = (name: string) => {
    drawerVisible.value = false;
    setTimeout(() => openPlayerProfile(name), 350);
};

const loadProfile = async () => {
    isLoading.value = true;
    try {
        profileData.value = await getPlayerProfileData(props.playerName, trendPeriod.value);
        if (profileData.value.totalMatches === 0) profileData.value = null;
    } catch { profileData.value = null; }
    isLoading.value = false;
};

watch(() => props.playerName, () => {
    if (props.playerName) loadProfile();
});

watch(trendPeriod, () => {
    if (props.playerName) loadProfile();
});

watch(drawerVisible, (val) => {
    if (val && props.playerName) loadProfile();
});
</script>

<style scoped>
.mobile-sheet {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.pp-spinner :deep(.p-progressspinner-circle) {
    stroke: #EA5160 !important;
}
</style>
