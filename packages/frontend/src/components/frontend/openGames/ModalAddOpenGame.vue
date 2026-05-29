<template>
    <ModalTeamEntry
        title="Ergebnis eintragen"
        confirmLabel="Eintragen"
        :showScore="true"
        :loading="loading"
        @confirm="handleConfirm"
        @cancel="props.toggleModalAddGame()"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ModalTeamEntry, { type TeamEntryData } from '@/components/shared/ModalTeamEntry.vue';
import { addOpenGame } from './OpenGamesUtilFunctions';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);

const props = defineProps({
    toggleModalAddGame: { type: Function, required: true },
    getOpenGames: { type: Function, required: true }
});

const handleConfirm = async (data: TeamEntryData) => {
    if (loading.value) return;

    const openGame: Match = {
        _id: 'placeholder',
        team1: { _id: 'placeholder', players: [] },
        team2: { _id: 'placeholder', players: [] },
        time: new Date().getTime()
    };

    data.team1.forEach(p => {
        openGame.team1.players.push({ _id: 'placeholder', name: p.name, score: p.score });
    });
    data.team2.forEach(p => {
        openGame.team2.players.push({ _id: 'placeholder', name: p.name, score: p.score });
    });

    loading.value = true;
    try {
        const success = await addOpenGame(openGame);
        if (success) {
            await props.getOpenGames();
            props.toggleModalAddGame();
            setTimeout(() => toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Spiel wurde erstellt', life: 3000 }), 400);
        } else {
            setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Spiel konnte nicht erstellt werden', life: 3000 }), 400);
        }
    } catch {
        setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Spiel konnte nicht erstellt werden', life: 3000 }), 400);
    } finally {
        loading.value = false;
    }
};
</script>
