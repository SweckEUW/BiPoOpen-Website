<template>
    <div :class="layout === 'page' ? 'px-[2px] md:px-[8px]' : 'px-[10px]'">
        <div class="flex flex-col items-center" :class="layout === 'page' ? 'mb-[24px] md:mb-[30px]' : 'mb-[30px]'">
            <Avatar :label="profileData.name.charAt(0)" size="xlarge" shape="circle" class="mb-[10px]" />
            <div
                class="font-bold text-[--p-primary-color]"
                :class="layout === 'page' ? 'text-[30px] md:text-[36px] text-center' : 'text-[32px]'"
            >
                {{ profileData.name }}
            </div>
            <Tag v-if="profileData.leagueTeam" severity="info" :value="'Liga: ' + profileData.leagueTeam" rounded class="mt-[4px]" />
            <div v-if="firstGameDate" class="text-[13px] text-[--p-text-muted-color] mt-[6px]">Erstes Spiel: {{ firstGameDate }}</div>
        </div>

        <div class="flex justify-center mb-[16px]">
            <Select
                :modelValue="trendPeriod"
                @update:modelValue="value => $emit('update:trendPeriod', value as TrendPeriod)"
                :options="trendPeriodOptions"
                optionLabel="label"
                optionValue="value"
                class="w-[220px]"
            />
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
            @openPlayer="(name) => $emit('openPlayer', name)"
        />

        <Divider />

        <PlayerProfileHistory
            :matchHistory="profileData.matchHistory"
            :playerName="profileData.name"
            :leagueTeam="profileData.leagueTeam"
        />
    </div>
</template>

<script setup lang="ts">
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import Select from 'primevue/select';

import PlayerProfileOverview from './PlayerProfileOverview.vue';
import PlayerProfileAnalysis from './PlayerProfileAnalysis.vue';
import PlayerProfileBadges from './PlayerProfileBadges.vue';
import PlayerProfilePeers from './PlayerProfilePeers.vue';
import PlayerProfileHistory from './PlayerProfileHistory.vue';

defineProps<{
    profileData: PlayerProfileData;
    trendPeriod: TrendPeriod;
    trendPeriodOptions: { label: string; value: TrendPeriod }[];
    firstGameDate: string | null;
    layout: 'drawer' | 'page';
}>();

defineEmits<{
    (e: 'update:trendPeriod', value: TrendPeriod): void;
    (e: 'openPlayer', name: string): void;
}>();
</script>
