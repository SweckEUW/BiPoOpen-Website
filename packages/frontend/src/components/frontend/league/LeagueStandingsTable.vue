<template>
    <AppTable
        :value="sortedLeaguePlayers"
        :rowClass="getRowClass"
        @row-click="onRowClick"
        rank
        class="mb-[30px]"
    >

        <!-- Team -->
        <Column header="Team" :pt="{ columnTitle: { class: '!text-left' }, bodyCell: { class: '!p-1' } }">
            <template #body="slotProps">
                <div class="flex items-center justify-start">
                    <img class="w-[64px] h-[64px] object-contain mr-[20px] max-[900px]:mr-[10px] max-[450px]:w-[48px] max-[450px]:h-[48px] max-[380px]:w-[32px] max-[380px]:h-[32px]" :src="getPlayerLogo(slotProps.data.name)">
                    <div class="!text-left whitespace-pre-line">{{ slotProps.data.name.replace(' ', '\n') }}</div>
                </div>
            </template>
        </Column>

        <!-- Spiele -->
        <Column :header="labels.games" field="ammountOfMatches" />

        <!-- Siege -->
        <Column :header="labels.wins" field="wins" />

        <!-- Niederlagen -->
        <Column :header="labels.losses">
            <template #body="slotProps">
                {{ slotProps.data.ammountOfMatches - slotProps.data.wins }}
            </template>
        </Column>

        <!-- Trefferverhältnis -->
        <Column :header="labels.diff" :pt="{ headerCell: { class: '!w-[75px] !max-w-[75px]'}, bodyCell: { class: '!w-[75px] !max-w-[75px]' }}">
            <template #body="slotProps">
                <div class="leading-tight">
                    <span class="whitespace-nowrap">{{ slotProps.data.hitDifference }}</span>
                    <div>({{ slotProps.data.hitDifferenceNumber > 0 ? '+' : '' }}{{ slotProps.data.hitDifferenceNumber }})</div>
                </div>
            </template>
        </Column>
    </AppTable>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Column from 'primevue/column';
import AppTable from '@/components/shared/AppTable.vue';
import { useTableLabels } from '@/components/shared/appTable';
import { getLeagueList } from './LeagueUtilFunctions';

const props = withDefaults(defineProps<{
    leaguePlayers: LeaguePlayer[];
    leagueGames: Match[];
    highlightTopSlots?: number;
    promotionSlots?: number;
    relegationSlots?: number;
}>(), {
    highlightTopSlots: 4,
    promotionSlots: 0,
    relegationSlots: 3,
});

const emit = defineEmits<{
    (e: 'select-player', playerName: string): void;
}>();

const sortedLeaguePlayers = computed(() => getLeagueList(props.leagueGames, props.leaguePlayers));

const playerOrderByName = computed(() => {
    return sortedLeaguePlayers.value.reduce<Record<string, number>>((acc, player, index) => {
        acc[player.name] = index;
        return acc;
    }, {});
});

// Literale Klassen-Strings, damit Tailwind sie beim Scannen findet (dynamisch gebaute Werte werden nicht generiert).
const FINAL_FOUR_CLASSES = ['!bg-[#8fe4f7]', '!bg-[#aaeafa]', '!bg-[#b5ecfa]', '!bg-[#c6f2fd]'];
const PROMOTION_CLASS = '!bg-[#8ff7b0]';
const RELEGATION_CLASS = '!bg-[#e97f89]';

const getRowClass = (row: PlayerWithStats) => {
    const index = playerOrderByName.value[row.name];
    if (index === undefined) return '';

    const total = sortedLeaguePlayers.value.length;

    // Aufstiegszone: einheitliches Gruen.
    if (index < props.promotionSlots)
        return PROMOTION_CLASS;

    // Final-Four-Zone: abgestuftes Blau (nur dort, wo highlightTopSlots gesetzt ist).
    if (index < props.highlightTopSlots)
        return FINAL_FOUR_CLASSES[Math.min(index, FINAL_FOUR_CLASSES.length - 1)];

    // Abstiegszone: einheitliches Rot.
    const placesFromBottom = total - 1 - index;
    if (props.relegationSlots > 0 && placesFromBottom < props.relegationSlots)
        return RELEGATION_CLASS;

    return '';
};

const getPlayerLogo = (playerName: string) => {
    return props.leaguePlayers.find(player => player.name === playerName)?.logo;
};

const onRowClick = (event: any) => {
    emit('select-player', event.data.name);
}

const labels = useTableLabels();
</script>

