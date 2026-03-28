<template>
    <div v-if="bracketRounds.length" class="tb-bracket">
        <template v-for="(round, rIndex) in bracketRounds" :key="rIndex">
            <div class="tb-round" :class="{'tb-round--connected': rIndex > 0}">
                <div class="tb-round-title">{{ round.name }}</div>
                <div class="tb-matches">
                    <!-- Non-final rounds: group into pairs for connector lines -->
                    <template v-if="rIndex < bracketRounds.length - 1">
                        <div v-for="(pair, pIndex) in getMatchPairs(round.matches)" :key="pIndex" class="tb-pair">
                            <div v-for="(match, mIndex) in pair" :key="mIndex" class="tb-slot">
                                <div class="tb-match">
                                    <MatchElement :match="match" :hideAvatars="true" />
                                </div>
                            </div>
                        </div>
                    </template>
                    <!-- Final round: standalone -->
                    <template v-else>
                        <div v-for="(match, mIndex) in round.matches" :key="mIndex" class="tb-match">
                            <MatchElement :match="match" :hideAvatars="true" />
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';

const props = defineProps({
    tournament: { type: Object as PropType<Tournament>, required: true },
});

const getStageText = (stageIndex: number) => {
    const total = props.tournament.koPhase.matches.length - 1;
    if (total - stageIndex === 3) return 'Achtelfinale';
    if (total - stageIndex === 2) return 'Viertelfinale';
    if (total - stageIndex === 1) return 'Halbfinale';
    if (total - stageIndex === 0) return 'Finale';
    return `Runde ${stageIndex + 1}`;
};

const getMatchPairs = (matches: Match[]) => {
    const pairs: Match[][] = [];
    for (let i = 0; i < matches.length; i += 2) {
        pairs.push(matches.slice(i, i + 2));
    }
    return pairs;
};

const bracketRounds = computed(() => {
    const ko = props.tournament.koPhase;
    if (!ko.matches.length) return [];
    return ko.matches.map((round, i) => ({
        name: getStageText(i),
        matches: i === ko.matches.length - 1 ? [round[0]] : round
    }));
});
</script>

<style scoped>
.tb-bracket {
    display: flex;
    overflow-x: auto;
    padding: 8px 0;
}

/* ── Round column ── */
.tb-round {
    display: flex;
    flex-direction: column;
    min-width: 180px;
    flex: 1;
    flex-shrink: 0;
    margin-right: 30px;
}
.tb-round:last-child {
    margin-right: 0;
}
.tb-round-title {
    font-size: 13px;
    color: var(--main-color);
    text-align: center;
    margin-bottom: 8px;
    font-weight: bold;
}
.tb-matches {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
}

/* ── Match card ── */
.tb-match {
    position: relative;
    width: 100%;
}

/* Incoming horizontal line from previous round */
.tb-round--connected .tb-match::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -15px;
    width: 15px;
    height: 2px;
    background: #ccc;
    z-index: 1;
}

/* ── Pair (two matches feeding into one) ── */
.tb-pair {
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* ── Slot (match wrapper inside a pair) ── */
.tb-slot {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    padding: 4px 0;
}

/* Horizontal line from match right to the vertical connector */
.tb-slot::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -15px;
    width: 15px;
    height: 2px;
    background: #ccc;
}

/* Vertical connector: top slot → down to pair center */
.tb-slot:first-child:not(:only-child)::before {
    content: '';
    position: absolute;
    top: 50%;
    bottom: 0;
    right: -15px;
    width: 2px;
    background: #ccc;
}

/* Vertical connector: bottom slot → up to pair center */
.tb-slot:last-child:not(:only-child)::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 50%;
    right: -15px;
    width: 2px;
    background: #ccc;
}

/* ── MatchElement overrides ── */
.tb-match :deep(.Match) {
    margin-bottom: 0;
    padding: 5px 8px;
    border-color: #e0e0e0;
}
.tb-match :deep(.mt-team) {
    font-size: 13px;
    min-height: 26px;
}
.tb-match :deep(.mt-team-score) {
    padding: 3px 5px;
    width: 28px;
    font-size: 12px;
}
.tb-match :deep(.mt-vs) {
    font-size: 11px;
}
.tb-match :deep(.mt-team-player-name) {
    font-size: 8px;
}

/* ═══════ MOBILE ═══════ */
@media (width <= 900px) {
    .tb-round {
        min-width: 140px;
        margin-right: 24px;
    }
    .tb-round:last-child {
        margin-right: 0;
    }
    .tb-slot::after {
        right: -12px;
        width: 12px;
    }
    .tb-slot:first-child:not(:only-child)::before,
    .tb-slot:last-child:not(:only-child)::before {
        right: -12px;
    }
    .tb-round--connected .tb-match::before {
        left: -12px;
        width: 12px;
    }
    .tb-match :deep(.Match) {
        padding: 4px 6px;
    }
    .tb-match :deep(.mt-team) {
        font-size: 11px;
    }
}
</style>
