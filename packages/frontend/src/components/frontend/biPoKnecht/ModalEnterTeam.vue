<template>
    <ModalTeamEntry
        title="Teams eintragen"
        confirmLabel="Weiter"
        @confirm="handleConfirm"
        @cancel="cancel"
    />
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import ModalTeamEntry, { type TeamEntryData } from '@/components/shared/ModalTeamEntry.vue';
import router from '@/router.js';

const props = defineProps({
    setMatch: { type: Function as PropType<(match: Match) => void>, required: true }
});

const handleConfirm = (data: TeamEntryData) => {
    const match: Match = {
        _id: 'placeholder',
        team1: { _id: 'placeholder', players: [] },
        team2: { _id: 'placeholder', players: [] }
    };

    data.team1.forEach(p => {
        match.team1.players.push({ _id: 'placeholder', name: p.name, score: 0 });
    });
    if (data.team1.length === 1)
        match.team1.players.push({ _id: 'placeholder', name: data.team1[0].name, score: 0 });

    data.team2.forEach(p => {
        match.team2.players.push({ _id: 'placeholder', name: p.name, score: 0 });
    });
    if (data.team2.length === 1)
        match.team2.players.push({ _id: 'placeholder', name: data.team2[0].name, score: 0 });

    props.setMatch(match);
};

const cancel = () => {
    router.go(-1);
};
</script>
