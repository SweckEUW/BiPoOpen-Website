<template>
    <AppTable
        :value="group.teams"
        :rowClass="getRowClass"
        @row-click="onRowClick"
        rank
        class="mb-[30px]"
    >

        <!-- Teamname -->
        <Column header="Team" :pt="{ headerCell: { class: '!text-left' }, columnTitle: { class: '!text-left' }, bodyCell: { class: '!text-left' } }">
            <template #body="slotProps">
                <div class="flex items-center justify-start">
                    <Avatar class="min-w-[65px] min-h-[65px] max-[600px]:min-w-[50px] max-[600px]:min-h-[50px] max-[400px]:min-w-[40px] max-[400px]:min-h-[40px] mr-[10px] max-[400px]:mr-[6px]" :name="slotProps.data.name" :avatarImage="slotProps.data.logo" :shape="'square'"/>
                    <div class="!text-left whitespace-pre-line leading-tight" :class="getNameSizeClass(slotProps.data.name)">{{ slotProps.data.name }}</div>
                </div>
            </template>
        </Column>

        <!-- Spieler -->
        <Column v-if="!isMobile" header="Spieler">
            <template #body="slotProps">
                <span v-for="player in slotProps.data.players" :key="player._id" class="block">{{ player.name }}</span>
            </template>
        </Column>

        <!-- Siege -->
        <Column :header="labels.wins" field="wins" :pt="{ headerCell: { class: '!px-[4px]' }}"/>

        <!-- Spiele -->
        <Column :header="labels.games" field="ammountOfMatches" :pt="{ headerCell: { class: '!px-[4px]' } }"/>

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

    <StandingsGroupTeamDrawer v-model:visible="drawerVisible" :selected-team="selectedTeam" :tournament="tournament"/>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue"
import Column from 'primevue/column';
import Avatar from '@/components/shared/Avatar.vue';
import AppTable from '@/components/shared/AppTable.vue';
import { PODIUM_ROW_CLASSES, useIsMobile, useTableLabels } from '@/components/shared/appTable';
import StandingsGroupTeamDrawer from '@/components/frontend/tournament/StandingsGroupTeamDrawer.vue';

const props = defineProps({
   tournament: {type: Object as PropType<Tournament>, required: true },
   group: {type: Object as PropType<GroupWithStats>, required: true },
})

const drawerVisible = ref(false);
const selectedTeam = ref<TeamWithStats>();

const onRowClick = (event: { data: TeamWithStats }) => {
    selectedTeam.value = event.data;
    drawerVisible.value = true;
};

const getRowClass = (row: TeamWithStats) => {
    const index = props.group.teams.indexOf(row);

    return index < 2 ? PODIUM_ROW_CLASSES[index] : '';
};

const getNameSizeClass = (name: string) => {
    const length = name?.length ?? 0;

    if (length > 40) return 'text-[11px] max-[900px]:text-[10px]';
    if (length > 28) return 'text-[13px] max-[900px]:text-[12px]';
    if (length > 20) return 'text-[15px] max-[900px]:text-[13px]';

    return '';
};

const isMobile = useIsMobile();
const labels = useTableLabels();
</script>
