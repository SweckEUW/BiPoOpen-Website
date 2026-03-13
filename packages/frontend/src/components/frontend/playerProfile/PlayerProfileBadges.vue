<template>
    <div v-if="grouped.length > 0">
        <div class="pp-section-title">Errungenschaften</div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-[10px] mb-[10px]">
            <Card
                v-for="badge in grouped"
                :key="badge.id"
                class="text-center"
                :class="{ 'pp-badge-rainbow': badge.special === 'rainbow' }"
            >
                <template #content>
                    <span class="material-icons text-[--p-primary-color]" :class="{ 'pp-badge-rainbow-icon': badge.special === 'rainbow' }" style="font-size: 2rem">{{ badge.icon }}</span>
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

const getDefaultPriority = (badge: PlayerBadge): number => {
    if (badge.id.startsWith('tournament-win-')) return 900;
    if (badge.id.startsWith('streak-')) return 700;
    if (badge.id.startsWith('winrate-')) return 600;
    if (badge.id.startsWith('wins-')) return 500;
    if (badge.id.startsWith('matches-')) return 400;
    if (badge.id.startsWith('hits-')) return 300;
    return 100;
};

const getBadgePriority = (badge: PlayerBadge): number => badge.priority ?? getDefaultPriority(badge);

const getBadgeDateScore = (badge: PlayerBadge): number => {
    if (!badge.date) return 0;
    let [day, month, year] = badge.date.split('.').map(Number);
    if (!day || !month || !year) return 0;
    return new Date(year, month - 1, day).getTime();
};

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
    return result.sort((a, b) => {
        let priorityDiff = getBadgePriority(b) - getBadgePriority(a);
        if (priorityDiff !== 0) return priorityDiff;
        return getBadgeDateScore(b) - getBadgeDateScore(a);
    });
});
</script>

<style scoped>
.pp-section-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--p-primary-color);
    margin-bottom: 12px;
}

.pp-badge-rainbow {
    position: relative;
    overflow: hidden;
}

.pp-badge-rainbow :deep(.p-card-body) {
    position: relative;
    z-index: 1;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(2px);
}

.pp-badge-rainbow::before {
    content: '';
    position: absolute;
    inset: -45%;
    background: conic-gradient(
        #ff3b3b,
        #ff8c00,
        #ffd700,
        #4cd964,
        #34c3ff,
        #5d5fef,
        #b84cff,
        #ff3b3b
    );
    animation: pp-rainbow-rotate 4s linear infinite;
    opacity: 0.9;
}

.pp-badge-rainbow-icon {
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
}

@keyframes pp-rainbow-rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
