<template>
    <DataTable :value="playersWith0Hits" :rowClass="getRowClass" showGridlines removableSort class="pt-[30px] w-full">
        <Column field="name" header="Name" sortable bodyClass="py-2 px-4"></Column>
        
        <Column field="time" header="Datum" sortable bodyClass="py-2 px-4">
            <template #body="slotProps">
                {{ getOpenGameDate(slotProps.data.time) }}
            </template>
        </Column>
        
        <Column field="match" header="Spiel" bodyClass="py-2 px-4">
            <template #body="slotProps">
                <MatchElement :match="slotProps.data.match" :class="slotProps.data.match._id"/>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MatchElement from '@/components/shared/MatchElement/MatchElement.vue';

const props = defineProps({
    openGames: { type: Array as PropType<Match[]>, required: true }
});

// Martin Brandt
let removedMatched = ["68aa17a002608bee9cc83c3a"];

const playersWith0Hits = computed(() => {
    const players: (Player & { time: number; match: Match })[] = [];

    props.openGames.forEach(match => {
        match.team1.players.forEach(player => {
            if(player.score == 0) players.push({...player, time: match.time!, match});
        });
        match.team2.players.forEach(player => {
            if(player.score == 0) players.push({...player, time: match.time!, match});
        });
    });

    return players;
});

// calculate dates for open games
let getOpenGameDate = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}

// return css class if match id is in marked array
const getRowClass = (data: any) => {
    if(removedMatched.includes(data.match._id))
        return 'marked-row';
    return '';
};
</script>

<style scoped>
:deep(.p-datatable-tbody > tr > td) {
    padding: 2px 2px !important; 
}

/* style for marked rows */
:deep(.marked-row) {
    text-decoration: line-through;
    opacity: 0.5;
}
</style>