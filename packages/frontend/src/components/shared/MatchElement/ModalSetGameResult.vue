
<template>
    <Modal>
        <template #title>Ergebnis eintragen</template>

        <template #template>
            <div class="w-full flex flex-col gap-[5px]">
                <div class="grid grid-cols-2 gap-[5px]">
                    <div 
                        v-for="(team, teamIndex) in [copiedMatch.team1, copiedMatch.team2]" 
                        class="flex items-center font-bold h-full"
                    >
                        <div class="flex flex-1 items-center gap-2 w-full h-full"
                            :class="teamIndex === 0 ? 'flex-row justify-end text-right' : 'flex-row-reverse justify-end text-left'">
                            
                            <div class="break-words leading-tight flex-1">
                                {{ getTeamName(team) }}
                            </div>

                            <div class="w-[50px] text-center shrink-0">
                                {{ getMatchScore(copiedMatch, teamIndex == 0) }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-[5px]">
                    <div v-for="(team, teamIndex) in [copiedMatch.team1, copiedMatch.team2]">
                        
                        <div v-for="player in team.players" class="flex flex-row gap-[5px] mb-[5px]">
                            <template v-if="teamIndex === 0">
                                <div v-if="!editName" class="text-right flex-1">{{ player.name }}</div>
                                <input v-if="editName" class="text-right flex-1" v-model="player.name">
                                <input class="!w-[50px] text-center shrink-0" type="number" v-model="player.score" placeholder="0">
                            </template>

                            <template v-else>
                                <input class="!w-[50px] text-center shrink-0" type="number" v-model="player.score" placeholder="0">
                                <div v-if="!editName" class="text-left flex-1">{{ player.name }}</div>
                                <input v-if="editName" class="text-left flex-1" v-model="player.name">
                            </template>

                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="toggleModal();">Abbrechen</div>
        </template>

        <template #delete v-if="deleteMatch">
            <div v-if="deleteMatch" @click="deleteGame()">Löschen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="setResult()">{{ checkIfMatchFinished(copiedMatch) ? 'Bearbeiten' : 'Eintragen' }}</div>
        </template>

        <template #loading v-if="loading">
            <div class="loading-overlay">
                <ProgressSpinner strokeWidth="4" />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { checkIfMatchFinished, getMatchScore } from "@/util/tournamentMatchFunctions";

const toast = useToast();

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    setGameResult: {type: Function as PropType<(match:Match) => Promise<boolean> | void> },
    deleteMatch: {type: Function as PropType<(match:Match) => Promise<boolean> | void> },
    toggleModal: {type: Function, required: true },
    editName: {type: Boolean, default: false},
});

// Create a copy of the match to avoid modifying the original match object directly
let copiedMatch = ref(JSON.parse(JSON.stringify(props.match)) as Match);
let loading = ref(false);

const setResult = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        const success = await props.setGameResult!(copiedMatch.value);
        if (success !== false) {
            props.toggleModal();
            setTimeout(() => toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Ergebnis wurde gespeichert', life: 3000 }), 400);
        } else {
            setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Ergebnis konnte nicht gespeichert werden', life: 3000 }), 400);
        }
    } catch {
        setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Ergebnis konnte nicht gespeichert werden', life: 3000 }), 400);
    } finally {
        loading.value = false;
    }
}

const deleteGame = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        const success = await props.deleteMatch!(copiedMatch.value);
        if (success !== false) {
            props.toggleModal();
            setTimeout(() => toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Spiel wurde gelöscht', life: 3000 }), 400);
        } else {
            setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Spiel konnte nicht gelöscht werden', life: 3000 }), 400);
        }
    } catch {
        setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Spiel konnte nicht gelöscht werden', life: 3000 }), 400);
    } finally {
        loading.value = false;
    }
}

let getTeamName = (team:Team) => {
    if(team.name){
        return team.name;
    }else{
        return team.players.map(p => p.name.trim()).filter(name => name.length > 0).join(' & ');
    }
}
</script>

<style scoped>
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.7);
    z-index: 10;
}

/* Remove arrows from input field */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
