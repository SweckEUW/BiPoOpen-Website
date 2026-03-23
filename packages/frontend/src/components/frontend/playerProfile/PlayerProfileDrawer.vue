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

        <PlayerProfileView
            v-else-if="profileData"
            :profileData="profileData"
            :trendPeriod="trendPeriod"
            :trendPeriodOptions="trendPeriodOptions"
            layout="drawer"
            @update:trendPeriod="(value) => trendPeriod = value"
            @openPlayer="openPlayer"
        />

        <!-- Spieler nicht gefunden -->
        <Message v-if="!isLoading && !profileData" severity="warn" :closable="false" class="mt-[40px]">
            Spieler "{{ playerName }}" wurde nicht gefunden.
        </Message>
    </Drawer>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import PlayerProfileView from './PlayerProfileView.vue';
import { usePlayerProfileData } from './usePlayerProfileData';

import Drawer from 'primevue/drawer';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const drawerVisible = defineModel<boolean>('visible', { default: false });

const props = defineProps<{
    playerName: string;
}>();

const openPlayerProfile = inject<(name: string) => void>('openPlayerProfile')!;

const playerName = computed(() => props.playerName);
const shouldLoad = computed(() => drawerVisible.value);
const { isLoading, profileData, trendPeriod, trendPeriodOptions } = usePlayerProfileData(playerName, shouldLoad);

const openPlayer = (name: string) => {
    drawerVisible.value = false;
    setTimeout(() => openPlayerProfile(name), 350);
};
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
