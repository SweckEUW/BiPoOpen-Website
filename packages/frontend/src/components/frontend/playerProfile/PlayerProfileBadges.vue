<template>
    <div v-if="grouped.length > 0">
        <div class="pp-section-title">Errungenschaften</div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-[10px] mb-[10px]">
            <Card v-for="badge in grouped" :key="badge.id" class="text-center">
                <template #content>
                    <span class="material-icons text-[--p-primary-color]" style="font-size: 2rem">{{ badge.icon }}</span>
                    <div class="text-[14px] font-bold mt-[4px]">{{ badge.label }}</div>
                    <div class="text-[11px] text-[--p-text-muted-color]">{{ badge.description }}</div>
                    <div v-if="badge.date" class="text-[10px] text-[--p-text-muted-color] mt-[2px]">{{ badge.date }}</div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';

const props = defineProps<{
    badges: PlayerBadge[];
}>();

// Für Meilenstein-Gruppen (matches, wins, hits, streak, winrate) nur den höchsten Badge zeigen
const grouped = computed((): PlayerBadge[] => {
    let groups: Record<string, PlayerBadge[]> = {};
    let ungrouped: PlayerBadge[] = [];

    props.badges.forEach(b => {
        let prefix = b.id.replace(/-[^-]+$/, '');
        if (['matches', 'wins', 'hits', 'streak', 'winrate'].includes(prefix)) {
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(b);
        } else {
            ungrouped.push(b);
        }
    });

    let result: PlayerBadge[] = [];
    for (let key of Object.keys(groups)) {
        result.push(groups[key][groups[key].length - 1]);
    }
    result.push(...ungrouped);
    return result;
});
</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}
</style>
