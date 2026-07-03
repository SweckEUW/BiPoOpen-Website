<template>
    <DataTable
        :value="group.teams"
        :rowClass="getRowClass"
        :pt="{
            tableContainer: {
                class: '!overflow-visible'
            }
        }"
        stripedRows
        class="w-full max-[900px]:text-[14px] max-[360px]:text-[13px] mb-[30px]"
    >

        <!-- Platzierung -->
        <Column :header="windowWidth > 900 ? 'Platz' : 'Pl.'" :pt="{ headerCell: { class: '!px-1 !w-[35px] !max-w-[35px]' }, bodyCell: { class: '!p-1 !w-[35px] !max-w-[35px]' } }">
            <template #body="slotProps">
                {{ slotProps.index + 1 }}
            </template>
        </Column>

        <!-- Teamname -->
        <Column header="Team" :pt="{ headerCell: { class: '!text-left' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
            <template #body="slotProps">
                <div class="flex items-center justify-start">
                    <PlayerProfileAvatar class="min-w-[65px] min-h-[65px] max-[600px]:min-w-[50px] max-[600px]:min-h-[50px] max-[400px]:min-w-[40px] max-[400px]:min-h-[40px] mr-[10px] max-[400px]:mr-[6px]" :name="slotProps.data.name" :avatarImage="slotProps.data.logo" :shape="'square'"/>
                    <div class="!text-left whitespace-pre-line leading-tight" :class="getNameSizeClass(slotProps.data.name)">{{ slotProps.data.name }}</div>
                </div>
            </template>
        </Column>

        <!-- Spieler -->
        <Column v-if="windowWidth > 900" header="Spieler">
            <template #body="slotProps">
                <span v-for="player in slotProps.data.players" :key="player._id" class="block">{{ player.name }}</span>
            </template>
        </Column>

        <!-- Siege -->
        <Column :header="windowWidth > 900 ? 'Siege' : 'Sieg.'" field="wins" :pt="{ headerCell: { class: '!px-[4px]' }}"/>

        <!-- Spiele -->
        <Column :header="windowWidth > 900 ? 'Spiele' : 'Spie.'" field="ammountOfMatches" :pt="{ headerCell: { class: '!px-[4px]' } }"/>

        <!-- Trefferverhältnis -->
        <Column :header="windowWidth > 900 ? 'Trefferverhältnis' : 'Trfv.'" :pt="{ headerCell: { class: '!w-[75px] !max-w-[75px]'}, bodyCell: { class: '!w-[75px] !max-w-[75px]' }}">
            <template #body="slotProps">
                <div class="leading-tight">
                    <span class="whitespace-nowrap">{{ slotProps.data.hitDifference }}</span>
                    <div>({{ slotProps.data.hitDifferenceNumber > 0 ? '+' : '' }}{{ slotProps.data.hitDifferenceNumber }})</div>
                </div>
            </template>
        </Column>

    </DataTable>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, PropType, ref } from "vue"
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import PlayerProfileAvatar from '@/components/frontend/playerProfile/PlayerProfileAvatar.vue';

const props = defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true },
   group: {type: Object as PropType<GroupWithStats>, required: true },
})

const getRowClass = (row: TeamWithStats) => {
    const index = props.group.teams.indexOf(row);

    if (index === 0) return '!bg-[var(--secondary-color-weak)]';
    if (index === 1) return '!bg-[#e6faff]';

    return '';
};

const getNameSizeClass = (name: string) => {
    const length = name?.length ?? 0;

    if (length > 40) return 'text-[11px] max-[900px]:text-[10px]';
    if (length > 28) return 'text-[13px] max-[900px]:text-[12px]';
    if (length > 20) return 'text-[15px] max-[900px]:text-[13px]';

    return '';
};

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
