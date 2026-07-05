<template>
    <Drawer v-model:visible="drawerVisible" position="bottom" class="!h-[90%] rounded-t-xl mobile-sheet" :blockScroll="true" :showCloseIcon="false" style="color: var(--main-color)">
        <template #header>
            <div class="w-full flex justify-content-center" v-if="selectedTeam">
                <div class="flex flex-column align-items-center">
                    <div class="font-bold text-[20px] text-center">{{ selectedTeam.name }}</div>
                    <Image v-if="selectedTeam.logo" class="h-[120px] my-[8px]" :src="selectedTeam.logo" preview
                        :pt="{
                            toolbar: { style: 'display: none' },
                            previewMask: { style: 'background: transparent; opacity: 0' },
                            mask: { style: 'background-color: rgba(0, 0, 0, 0.9) !important' }
                        }"
                    />
                    <div class="flex flex-column align-items-center">
                        <span v-for="player in selectedTeam.players" :key="player._id" class="text-[16px]">{{ player.name }}</span>
                    </div>
                </div>
            </div>
        </template>

        <div v-if="selectedTeam">
            <div class="lg-sticky-round-block">
                <div class="font-bold text-[24px] lg-sticky-round">Spiele</div>
            </div>

            <div v-if="teamMatches.length === 0" class="mt-[10px]">Keine Spiele vorhanden</div>

            <div v-for="match in teamMatches" :key="match._id" style="margin-top: 10px;">
                <div class="sg-match-meta" v-if="match.time">
                    <div>{{ getGameTime(match.time) }}</div>
                </div>
                <MatchElement :match="match" :displayTeamLogo="true"/>
            </div>
        </div>
    </Drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Image from 'primevue/image';
import Drawer from 'primevue/drawer';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';

const drawerVisible = defineModel<boolean>('visible', { default: false });

const props = defineProps<{
    selectedTeam?: TeamWithStats;
    tournament: Tournament;
}>();

const teamMatches = computed(() => {
    if (!props.selectedTeam) return [] as Match[];

    const teamName = props.selectedTeam.name;

    return props.tournament.groupPhase.matches
        .flat()
        .filter((match) => match.team1?.name === teamName || match.team2?.name === teamName)
        .sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
});

const getGameTime = (dateNumber: number) => {
    const date = new Date(dateNumber);
    const time = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString('de-DE') + '  -  ' + time + ' Uhr';
};
</script>

<style scoped>
.sg-match-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.lg-sticky-round-block {
    position: sticky;
    top: 0;
    z-index: 7;
    background: #fff;
    min-height: 52px;
    display: flex;
    align-items: flex-end;
    padding: 8px 0;
}

.lg-sticky-round-block::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 10px;
    background: #fff;
}

.mobile-sheet {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

@media (width <= 900px) {
    .lg-sticky-round-block {
        min-height: 44px;
        padding: 6px 0;
    }
}
</style>
