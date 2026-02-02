<template>
    <DataTable :value="playersWith0Hits" showGridlines removableSort class="pt-[30px] w-full">
        <Column field="name" header="Name" sortable></Column>
        <Column field="time" header="Datum" sortable>
            <template #body="slotProps">
                {{ getOpenGameDate(slotProps.data.time) }}
            </template>
        </Column>
        <Column field="match" header="Spiel">
            <template #body="slotProps">
                <MatchElement :match="slotProps.data.match"/>
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
    openGames: {type: Array as PropType<Match[]>, required: true }
});

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

let getOpenGameDate = (dateNumber:number) => {
    let date = new Date(dateNumber);
    let time = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    return date.toLocaleDateString("de-DE") + "  -  " + time + " Uhr";
}
</script>

<style scoped>

</style>