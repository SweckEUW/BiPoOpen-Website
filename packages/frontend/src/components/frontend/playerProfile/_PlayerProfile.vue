<template>
    <div class="pp-page max-w-[1100px] mx-auto px-[12px] md:px-[18px] py-[16px] md:py-[24px]">
        <h1 class="bp-title">{{"Spieler Profil" }}</h1>

        <div v-if="isLoading" class="flex justify-center items-center h-[320px]">
            <ProgressSpinner strokeWidth="3" class="pp-spinner" />
        </div>

        <PlayerProfileView
            v-else-if="profileData"
            :profileData="profileData"
            :trendPeriod="trendPeriod"
            :trendPeriodOptions="trendPeriodOptions"
            layout="page"
            @update:trendPeriod="(value) => trendPeriod = value"
            @openPlayer="openPlayer"
        />

        <Message v-else severity="warn" :closable="false" class="mt-[40px]">
            Spieler "{{ playerName }}" wurde nicht gefunden.
        </Message>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PlayerProfileView from './PlayerProfileView.vue';
import { usePlayerProfileData } from './usePlayerProfileData';
import { getPlayerForLeagueTeam } from '@/components/frontend/league/LeaguePlayersData';

import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const route = useRoute();
const router = useRouter();

const playerName = computed(() => decodeURIComponent(route.params.PlayerName as string).replaceAll('-', ' '));
const normalizedPlayerName = computed(() => getPlayerForLeagueTeam(playerName.value) ?? playerName.value);
const { isLoading, profileData, trendPeriod, trendPeriodOptions } = usePlayerProfileData(normalizedPlayerName);

const openPlayer = (name: string) => {
    router.push(`/Spieler/${encodeURIComponent(name).replaceAll('%20', '-')}`);
};

watch(playerName, (name) => {
    const mappedName = getPlayerForLeagueTeam(name);
    if (mappedName) {
        const mappedSlug = encodeURIComponent(mappedName).replaceAll('%20', '-');
        const currentSlug = route.params.PlayerName as string;
        if (currentSlug !== mappedSlug) {
            router.replace(`/Spieler/${mappedSlug}`);
            return;
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}, { immediate: true });
</script>

<style scoped>
.pp-spinner :deep(.p-progressspinner-circle) {
    stroke: #EA5160 !important;
}
</style>
