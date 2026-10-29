<template>
    <!-- Paarungsauswahl fuer den GameEntryDrawer (#top-Slot) -->
    <div class="CupPairingSelect">
        <div class="cp-label">Paarung</div>
        <Select
            v-model="selectedPairing"
            :options="openPairings"
            scrollHeight="320px"
            placeholder="Paarung wählen"
            class="cp-select"
            :pt="{ root: { style: '--p-select-focus-border-color: #1F2328;' } }"
        >
            <template #value="slotProps">
                <div class="cp-value">
                    <span class="cp-value-text" :class="{ 'cp-placeholder': !slotProps.value }">
                        {{ slotProps.value ? `${slotProps.value.team1} vs. ${slotProps.value.team2}` : slotProps.placeholder }}
                    </span>
                    <span class="cp-count">{{ openPairings.length }} offen</span>
                </div>
            </template>
            <template #option="slotProps">
                <div class="cp-option">
                    <Avatar :name="slotProps.option.team1" :avatarImage="getLeagueTeamLogo(slotProps.option.team1, leagueCup.season)" shape="square" class="cp-avatar" />
                    <span>{{ slotProps.option.team1 }}</span>
                    <span class="cp-vs">vs.</span>
                    <Avatar :name="slotProps.option.team2" :avatarImage="getLeagueTeamLogo(slotProps.option.team2, leagueCup.season)" shape="square" class="cp-avatar" />
                    <span>{{ slotProps.option.team2 }}</span>
                </div>
            </template>
        </Select>
    </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import Select from 'primevue/select';
import Avatar from '@/components/shared/Avatar.vue';
import { getLeagueTeamLogo } from '../LeaguePlayersData';
import { getCupRoundGames, getPairingResult } from './LeagueCupUtilFunctions';

const props = defineProps({
    leagueCup: { type: Object as PropType<LeagueCup>, required: true },
    roundIndex: { type: Number, required: true },
    cupGames: { type: Array as () => Match[], required: true },
});

const emit = defineEmits<{ select: [teams: { name: string; logo?: string }[]] }>();

const round = computed(() => props.leagueCup.rounds[props.roundIndex]);

// Nur Paarungen ohne Sieger (im Best-of-3 also bis eine Seite 2 Siege hat).
const openPairings = computed(() => {
    const roundGames = getCupRoundGames(props.cupGames, props.roundIndex);
    return round.value?.pairings.filter(pairing => !getPairingResult(pairing, roundGames, round.value.bestOf).winner) ?? [];
});

// Gibt es nur eine offene Paarung, ist sie direkt gewaehlt.
const selectedPairing = ref<LeagueCupPairing | null>(openPairings.value.length === 1 ? openPairings.value[0] : null);

watch(selectedPairing, (pairing) => {
    if (!pairing) return;
    emit('select', [pairing.team1, pairing.team2].map(name => ({ name, logo: getLeagueTeamLogo(name, props.leagueCup.season) })));
}, { immediate: true });
</script>

<style scoped>
.cp-label{
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #555B63;
}
.cp-select{
    width: 100%;
    height: 48px;
    align-items: center;
    border-radius: 10px;
}
.cp-value{
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}
.cp-value-text{
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 600;
    color: #1F2328;
}
.cp-placeholder{
    color: #9AA0A8;
    font-weight: 500;
}
.cp-count{
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 999px;
    background: #F1F2F4;
    color: #555B63;
    font-size: 12px;
    font-weight: 600;
}
.cp-option{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}
.cp-vs{
    margin: 0 4px;
    color: gray;
    font-size: 12px;
    font-style: italic;
}
.cp-avatar{
    width: 28px !important;
    height: 28px !important;
    min-width: 28px;
}
</style>
