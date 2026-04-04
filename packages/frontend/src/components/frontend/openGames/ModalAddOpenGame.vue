<script setup lang="ts">
import { addOpenGame } from "./OpenGamesUtilFunctions";
import { ref, reactive } from "vue"
import Modal from '@/components/shared/Modal.vue';
import PlayerSearchAutoComplete from '@/components/shared/PlayerSearchAutoComplete.vue';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

let ammountOfPlayersTeam1 = ref(1);
let ammountOfPlayersTeam2 = ref(1);
let loading = ref(false);

// Reactive player name/score models
const playerNames = reactive<{ team1: string[]; team2: string[] }>({ team1: [''], team2: [''] });
const playerScores = reactive<{ team1: string[]; team2: string[] }>({ team1: [''], team2: [''] });



const addPlayerSlot = (team: 1 | 2) => {
    if (team === 1) {
        ammountOfPlayersTeam1.value++;
        playerNames.team1.push('');
        playerScores.team1.push('');
    } else {
        ammountOfPlayersTeam2.value++;
        playerNames.team2.push('');
        playerScores.team2.push('');
    }
};

const props = defineProps({
    toggleModalAddGame: {type: Function, required: true },
    getOpenGames: {type: Function, required: true }
});

const addGame = async () => {
    if (loading.value) return;

    let openGame:Match = {
        _id: "placeholder",
        team1: {
            _id: "placeholder",
            players: []
        },
        team2: {
            _id: "placeholder",
            players: []
        },
        time: new Date().getTime()
    }

    for (let i = 0; i < ammountOfPlayersTeam1.value; i++) {
        openGame.team1.players.push({
            _id: "placeholder",
            name: (playerNames.team1[i] || '').trim(),
            score: parseFloat(playerScores.team1[i] || '0')
        });
    }
    for (let i = 0; i < ammountOfPlayersTeam2.value; i++) {
        openGame.team2.players.push({
            _id: "placeholder",
            name: (playerNames.team2[i] || '').trim(),
            score: parseFloat(playerScores.team2[i] || '0')
        });
    }

    loading.value = true;
    try {
        let success = await addOpenGame(openGame);
        if(success){
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
}
</script>

<template>
    <Modal>
        <template #title>Ergebnis eintragen</template>

        <template #template>
            <div class="rt-modal">
                <div v-for="i in 2" :id="'addOpenGameModal-team-' + i" class="rt-modal-container">

                    <!-- TODO: Fix Added Score if more than 1 Player is in each Team -->
                    <!-- <div class="rt-modal-score" :style="{textAlign: i == 1 ? 'right' : 'left'}">{{ 0 }}</div> -->

                    <div class="rt-modal-team" v-for="(_, index) in (i == 1 ? ammountOfPlayersTeam1 : ammountOfPlayersTeam2)">
                        <PlayerSearchAutoComplete
                            :modelValue="(i == 1 ? playerNames.team1 : playerNames.team2)[index]"
                            @update:modelValue="val => (i == 1 ? playerNames.team1 : playerNames.team2)[index] = val"
                            placeholder="Spielername"
                            className="rt-modal-autocomplete"
                            :maxResults="10"
                            :style="{textAlign: i == 1 ? 'right' : 'left', order: i == 1 ? 1 : 3}"
                        />

                        <input class="rt-modal-input-number" type="number" placeholder="0"
                            :value="(i == 1 ? playerScores.team1 : playerScores.team2)[index]"
                            @input="e => (i == 1 ? playerScores.team1 : playerScores.team2)[index] = (e.target as HTMLInputElement).value">
                    </div>

                    <div class="rt-modal-buttons">
                        <div @click="addPlayerSlot(i as 1 | 2)">+</div>
                    </div>

                </div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="toggleModalAddGame();">Abbrechen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="addGame()">Eintragen</div>
        </template>

        <template #loading v-if="loading">
            <div class="loading-overlay">
                <ProgressSpinner strokeWidth="4" />
            </div>
        </template>
    </Modal>
</template>

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
.rt-modal{
    overflow: hidden;
}
.rt-modal-score{
    margin: 0px 25px;
    margin-bottom: 15px;
    font-weight: bold;
    font-size: 20px;
}
.rt-modal{
    display: flex;
    justify-content: center;
}
.rt-modal-container{
    width: 100%;
}
.rt-modal-team{
    display: flex; 
}
.rt-modal-autocomplete{
    width: 250px;
    position: relative;
}
.rt-modal-autocomplete :deep(.p-inputtext){
    width: 100%;
    height: 50px;
    padding: 0px 20px;
    font-size: 14px;
}
.rt-modal-input-number{
    text-align: center;
    margin: 0px 10px;
    width: 50px;
    height: 50px;
    order: 2;
}

.rt-modal-buttons{
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 30px;
}
.rt-modal-buttons div{
    cursor: pointer;
    background-color: var(--main-color);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: 0px 15px;
}

/* Remove arrows from input field */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}

/*MOBILE*/
@media (width <= 900px){
    .rt-modal-player, .rt-modal-team{
        white-space: break-spaces;
    }

    .rt-modal-autocomplete{
        width: 100%;
    }
    .rt-modal-autocomplete :deep(.p-inputtext){
        padding: 0px 4px;
    }
    .rt-modal-input-number{
        width: 40px;
    }
}
</style>
