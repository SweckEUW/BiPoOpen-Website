<template>
    <HeroSlideLayout
        :kicker="`BiPo Open ${year}`"
        :title="`${getTeamDisplayName(champion.team)} holt den Titel`"
        :subtitle="champion.team.players.map(player => player.name).join(' & ')"
        ctaLabel="Fotos ansehen"
        :ctaTo="`/${year}/Fotos`"
    >
        <div v-if="runnersUp.length" class="sb-chips">
            <span v-for="entry in runnersUp" :key="entry.place" class="sb-chip">
                <b>{{ entry.place }}.</b> {{ getTeamDisplayName(entry.team) }}
            </span>
        </div>
    </HeroSlideLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getTeamDisplayName, type PodiumEntry } from '@/util/tournamentFunctions';
import HeroSlideLayout from './HeroSlideLayout.vue';

const props = defineProps<{
    year: string;
    // Mindestens der Sieger ist gesetzt
    podium: PodiumEntry[];
}>();

const champion = computed(() => props.podium[0]);
const runnersUp = computed(() => props.podium.slice(1));
</script>

<style scoped>
.sb-chips{
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
.sb-chip{
    padding: 6px 12px;
    background: var(--hs-glass);
    border: 1px solid var(--hs-glass-border);
    border-radius: 999px;
    backdrop-filter: blur(6px);
    font-size: 13px;
}
</style>
