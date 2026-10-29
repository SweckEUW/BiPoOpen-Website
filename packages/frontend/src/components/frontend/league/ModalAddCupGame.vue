<template>
    <Modal>
        <template #title>Pokalspiel eintragen</template>

        <template #template>
            <div class="acg-modal">

                <Select v-model="selectedPairing" :options="openPairings" scrollHeight="300px" placeholder="Paarung auswählen" class="w-full mb-[20px]"
                    :pt="{
                        overlay: { style: 'width: 90%;' },
                        root: { style: '--p-select-focus-border-color: var(--main-color);' }
                    }"
                >
                    <template #value="slotProps">
                        <span v-if="slotProps.value">{{ slotProps.value.team1 }} – {{ slotProps.value.team2 }}</span>
                        <span v-else>{{ slotProps.placeholder }}</span>
                    </template>
                    <template #option="slotProps">
                        <div class="acg-option">
                            <Avatar :name="slotProps.option.team1" :avatarImage="getLeagueTeamLogo(slotProps.option.team1, leagueCup.season)" shape="square" class="acg-option-avatar" />
                            <span>{{ slotProps.option.team1 }}</span>
                            <span class="acg-option-vs">vs.</span>
                            <Avatar :name="slotProps.option.team2" :avatarImage="getLeagueTeamLogo(slotProps.option.team2, leagueCup.season)" shape="square" class="acg-option-avatar" />
                            <span>{{ slotProps.option.team2 }}</span>
                        </div>
                    </template>
                </Select>

                <div v-if="selectedPairing" class="w-full flex gap-[5px] mb-[20px]">
                    <div v-for="(teamName, index) in [selectedPairing.team1, selectedPairing.team2]" :key="teamName" class="w-[50%] flex flex-col justify-center align-items-center gap-[5px]">
                        <Avatar :name="teamName" :avatarImage="getLeagueTeamLogo(teamName, leagueCup.season)" shape="square" class="acg-team-avatar" />
                        <div class="whitespace-break-spaces text-center mb-[10px]">{{ teamName }}</div>
                        <input v-model.number="scores[index]" class="rt-modal-input-number" type="number" placeholder="0">
                    </div>
                </div>

                <div v-if="isDraw" class="text-center text-[var(--secondary-color)] mb-[10px]">
                    Im Pokal gibt es kein Unentschieden.
                </div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="toggleModal();">Abbrechen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="addGame();" :style="{ opacity: canAddGame ? 1 : 0.3, pointerEvents: canAddGame ? 'auto' : 'none' }">Eintragen</div>
        </template>

        <template #loading v-if="loading">
            <div class="loading-overlay">
                <ProgressSpinner strokeWidth="4" />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/shared/Modal.vue';
import Avatar from '@/components/shared/Avatar.vue';
import Select from 'primevue/select';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { computed, PropType, ref } from 'vue';
import { addLeagueGame } from './LeagueUtilFunctions';
import { getLeagueTeamLogo } from './LeaguePlayersData';
import { getCupRoundGames, getPairingResult } from './LeagueCupUtilFunctions';

const toast = useToast();

const props = defineProps({
    leagueCup: { type: Object as PropType<LeagueCup>, required: true },
    roundIndex: { type: Number, required: true },
    cupGames: { type: Array as () => Match[], required: true },
    toggleModal: { type: Function, required: true },
    getLeagueGames: { type: Function, required: true },
});

const round = computed(() => props.leagueCup.rounds[props.roundIndex]);

// Nur Paarungen, die noch keinen Sieger haben (im Finale also bis eine Seite 2 Siege hat).
const openPairings = computed(() => {
    const roundGames = getCupRoundGames(props.cupGames, props.roundIndex);
    return round.value.pairings.filter(pairing => !getPairingResult(pairing, roundGames, round.value.bestOf).winner);
});

const selectedPairing = ref<LeagueCupPairing | null>(openPairings.value.length === 1 ? openPairings.value[0] : null);
const scores = ref<[number, number]>([0, 0]);
const loading = ref(false);

const isDraw = computed(() => !!selectedPairing.value && (scores.value[0] || 0) === (scores.value[1] || 0) && !!(scores.value[0] || scores.value[1]));

const canAddGame = computed(() => !!selectedPairing.value && (scores.value[0] || 0) !== (scores.value[1] || 0));

const addGame = async () => {
    if (loading.value || !canAddGame.value || !selectedPairing.value) return;

    const match: Match = {
        _id: "placeholder",
        time: new Date().getTime(),
        season: props.leagueCup.season,
        cupId: props.leagueCup._id,
        cupRound: props.roundIndex,
        team1: {
            _id: "placeholder",
            players: [{ _id: "placeholder", name: selectedPairing.value.team1, score: scores.value[0] || 0 }]
        },
        team2: {
            _id: "placeholder",
            players: [{ _id: "placeholder", name: selectedPairing.value.team2, score: scores.value[1] || 0 }]
        }
    };

    loading.value = true;
    try {
        const success = await addLeagueGame(match);
        if (success) {
            await props.getLeagueGames();
            props.toggleModal();
            setTimeout(() => toast.add({ severity: 'success', summary: 'Erfolg', detail: 'Pokalspiel wurde eingetragen', life: 3000 }), 400);
        } else {
            setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Pokalspiel konnte nicht eingetragen werden', life: 3000 }), 400);
        }
    } catch {
        setTimeout(() => toast.add({ severity: 'error', summary: 'Fehler', detail: 'Pokalspiel konnte nicht eingetragen werden', life: 3000 }), 400);
    } finally {
        loading.value = false;
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

:deep(.mo-container){
    margin-bottom: 50px;
}

.acg-option{
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}
.acg-option-vs{
    color: gray;
    font-style: italic;
    font-size: 12px;
    margin: 0 4px;
}
.acg-option-avatar{
    width: 30px;
    height: 30px;
    min-width: 30px;
}
.acg-team-avatar{
    width: 50px;
    height: 50px;
}

.rt-modal-input-number{
    text-align: center;
    margin: 0px 10px;
    width: 50px;
    height: 50px;
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
