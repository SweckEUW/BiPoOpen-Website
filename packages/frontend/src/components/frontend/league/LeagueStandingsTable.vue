<template>
    <DataTable
        :value="sortedLeaguePlayers"
        :rowClass="getRowClass"
        @row-click="onRowClick"
        :pt="{
            tableContainer: {
                class: '!overflow-visible'
            }
        }"
        stripedRows
        class="w-full league-standings-table text-[14px]"
    >

        <!-- Platzierung -->
        <Column header="Pl." :pt="{ headerCell: { class: 'league-standings-sticky-header !px-1 !w-[25px] !max-w-[25px]' }, bodyCell: { class: '!p-1 !w-[25px] !max-w-[25px]' } }">
            <template #body="slotProps">
                {{ (slotProps.data.placement ?? slotProps.index) + 1 }}
            </template>
        </Column>

        <!-- Team -->
        <Column header="Team" :pt="{ headerCell: { class: 'league-standings-sticky-header ' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!p-1' } }">
            <template #body="slotProps">
                <div class="flex items-center justify-start">
                    <img class="w-[64px] h-[64px] object-contain mr-[20px] max-[900px]:mr-[10px] max-[450px]:w-[48px] max-[450px]:h-[48px] max-[380px]:w-[32px] max-[380px]:h-[32px]" :src="getPlayerLogo(slotProps.data.name)">
                    <div class="!text-left whitespace-pre-line">{{ slotProps.data.name.replace(' ', '\n') }}</div>
                </div>
            </template>
        </Column>

        <!-- Spiele -->
        <Column :header="windowWidth > 900 ? 'Spiele' : 'Spi.'" field="ammountOfMatches" :pt="{ headerCell: { class: 'league-standings-sticky-header' } }" />

        <!-- Siege -->
        <Column :header="windowWidth > 900 ? 'Siege' : 'S'" field="wins" :pt="{ headerCell: { class: 'league-standings-sticky-header' } }" />

        <!-- Niederlagen -->
        <Column :header="windowWidth > 900 ? 'Niederlagen' : 'N'" :pt="{ headerCell: { class: 'league-standings-sticky-header' } }">
            <template #body="slotProps">
                {{ slotProps.data.ammountOfMatches - slotProps.data.wins }}
            </template>
        </Column>

        <!-- Trefferverhältnis -->
        <Column :header="windowWidth > 900 ? 'Trefferverhältnis' : 'Trfv.'" :pt="{ headerCell: { class: 'league-standings-sticky-header !w-[75px] !max-w-[75px]'}, bodyCell: { class: '!w-[75px] !max-w-[75px]' }}">
            <template #body="slotProps">
                <div class="leading-tight">
                    <span class="whitespace-nowrap">{{ slotProps.data.hitDifference }}</span>
                    <div>({{ slotProps.data.hitDifferenceNumber > 0 ? '+' : '' }}{{ slotProps.data.hitDifferenceNumber }})</div>
                </div>
            </template>
        </Column>
    </DataTable>

    <div v-if="windowWidth < 900" class="text-[14px] text-[var(--main-color)] mb-[30px]">
        <div>*Pl. = Platz</div>
        <div>*Spi. = Spiele</div>
        <div>*S = Siege</div>
        <div>*N = Niederlagen</div>
        <div>*Trfv. = Trefferverhältnis</div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
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

const windowWidth = ref(window.screen.width);

const updateWindowWidth = () => {
    windowWidth.value = window.screen.width;
};

onMounted(() => {
    window.addEventListener('resize', updateWindowWidth);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style scoped>
:deep(.league-standings-sticky-header) {
    position: sticky;
    top: calc(260px + var(--league-sticky-extra, 0px));
    z-index: 2;
}

:deep(.league-standings-table .p-datatable-thead > tr > th) {
    border-width: 0;
    text-align: center;
}

:deep(.league-standings-table .p-datatable-tbody > tr > td) {
    border-width: 0;
    text-align: center;
    vertical-align: middle;
}

@media (max-width: 900px) {
    :deep(.league-standings-sticky-header) {
        top: calc(185px + var(--league-sticky-extra, 0px));
    }

}
</style>
