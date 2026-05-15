<template>
    <div class="flex flex-wrap justify-center items-stretch gap-[6px] mb-[6px] w-full">
        <Card
            v-for="badge in grouped"
            :key="badge.id"
            class="text-center cursor-pointer"
            :class="[
                'pp-badge-card-compact w-[150px]',
                { 'pp-badge-rainbow': badge.special === 'rainbow' }
            ]"
            @click="openBadgeDetail(badge)"
        >
            <template #content>
                <span
                    class="material-icons text-[--p-primary-color]"
                    :class="[
                        { 'pp-badge-rainbow-icon': badge.special === 'rainbow' },
                        'pp-badge-icon-compact'
                    ]"
                >{{ badge.icon }}</span>
                <div class="text-[12px] font-bold mt-[2px]">{{ badge.label }}</div>
                <div class="text-[10px] text-[--p-text-muted-color] leading-[1.2]">{{ badge.description }}</div>
                <div v-if="badge.date" class="text-[9px] text-[--p-text-muted-color] mt-[1px]">{{ badge.date }}</div>
            </template>
        </Card>
    </div>

    <Dialog
        v-model:visible="dialogVisible"
        modal
        dismissableMask
        :header="undefined"
        :style="{ width: '340px' }"
        :pt="{ header: { style: 'display:none' } }"
    >
        <div v-if="selectedBadge" class="flex flex-col items-center gap-2 pt-4 pb-2">
            <!-- Badge-Anzeige -->
            <div
                class="pp-detail-badge-wrap"
                :class="{ 'pp-badge-rainbow': selectedBadge.special === 'rainbow' }"
            >
                <div class="pp-detail-badge-inner">
                    <span
                        class="material-icons text-[--p-primary-color] text-[2rem]"
                        :class="{ 'pp-badge-rainbow-icon': selectedBadge.special === 'rainbow' }"
                    >{{ selectedBadge.icon }}</span>
                </div>
            </div>
            <div class="font-bold text-[16px] mt-1">{{ selectedBadge.label }}</div>
            <div class="text-[12px] text-[--p-text-muted-color] text-center">{{ selectedBadge.description }}</div>
            <div v-if="selectedBadge.date" class="text-[11px] text-[--p-text-muted-color]">{{ "Erhalten am: " + selectedBadge.date }}</div>

            <Divider class="my-2 w-full" />

            <!-- Besitzer -->
            <div v-if="holdersLoading" class="flex justify-center py-3">
                <ProgressSpinner style="width: 28px; height: 28px" />
            </div>
            <div v-else class="text-center text-[13px] w-full">
                <div class="font-semibold mb-1">
                    {{ otherHolders.length }}
                    {{ otherHolders.length === 1 ? 'anderer Spieler hat' : 'andere Spieler haben' }}
                    dieses Abzeichen
                </div>
                <div v-if="otherHolders.length <= 5 && otherHolders.length > 0" class="text-[--p-text-muted-color] text-[12px]">
                    {{ otherHolders.join(', ') }}
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import ProgressSpinner from 'primevue/progressspinner';
import { getBadgeHolders } from '@/components/frontend/playerProfile/PlayerProfileUtilFunctions';

const props = withDefaults(defineProps<{
    badges: PlayerBadge[];
    playerName?: string;
}>(), {});

const dialogVisible = ref(false);
const selectedBadge = ref<PlayerBadge | null>(null);
const holderNames = ref<string[]>([]);
const holdersLoading = ref(false);

const otherHolders = computed(() =>
    props.playerName
        ? holderNames.value.filter(n => n !== props.playerName)
        : holderNames.value
);

const openBadgeDetail = async (badge: PlayerBadge) => {
    selectedBadge.value = badge;
    holderNames.value = [];
    holdersLoading.value = true;
    dialogVisible.value = true;
    holderNames.value = await getBadgeHolders(badge.id);
    holdersLoading.value = false;
};

const getDefaultPriority = (badge: PlayerBadge): number => {
    if (badge.id.startsWith('tournament-win-')) return 900;
    if (badge.id.startsWith('streak-')) return 700;
    if (badge.id.startsWith('loss-streak-')) return 650;
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

// Für Meilenstein-Gruppen (matches, wins, hits, streak, loss-streak, winrate) nur den höchsten Badge zeigen
const grouped = computed((): PlayerBadge[] => {
    let groups: Record<string, PlayerBadge[]> = {};
    let ungrouped: PlayerBadge[] = [];

    props.badges.forEach(b => {
        let prefix = b.id.replace(/-[^-]+$/, '');
        if (['matches', 'wins', 'hits', 'streak', 'loss-streak', 'winrate'].includes(prefix)) {
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

.pp-badge-card-compact :deep(.p-card-body) {
    padding: 0.45rem;
}

.pp-badge-icon-compact {
    font-size: 1.1rem;
    line-height: 1;
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

/* Detail-Badge im Dialog */
.pp-detail-badge-wrap {
    width: 64px;
    height: 64px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--p-content-border-color);
}

.pp-detail-badge-wrap.pp-badge-rainbow {
    overflow: hidden;
}

.pp-detail-badge-wrap.pp-badge-rainbow::before {
    inset: -60%;
}

.pp-detail-badge-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
</style>
