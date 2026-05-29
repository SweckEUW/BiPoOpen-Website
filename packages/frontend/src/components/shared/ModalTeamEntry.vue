<template>
    <Modal>
        <template #title>{{ title }}</template>

        <template #template>
            <div class="flex justify-center overflow-hidden gap-[5px]">
                <div v-for="team in 2" :key="team" class="w-full">
                    <div
                        v-for="(_, index) in (team == 1 ? ammountOfPlayersTeam1 : ammountOfPlayersTeam2)"
                        :key="index"
                        class="flex"
                    >
                        <PlayerSearchAutoComplete
                            :modelValue="(team == 1 ? playerNames.team1 : playerNames.team2)[index]"
                            @update:modelValue="val => (team == 1 ? playerNames.team1 : playerNames.team2)[index] = val"
                            placeholder="Spielername"
                            className="team-modal-autocomplete"
                            :maxResults="10"
                            :style="{ textAlign: team == 1 ? 'right' : 'left', order: team == 1 ? 1 : 3 }"
                        />

                        <input v-if="showScore"
                            class="text-center order-2 !w-[50px]"
                            :class="{'!ml-[5px]': team == 1, '!mr-[5px]': team == 2}"
                            type="number"
                            placeholder="0"
                            :value="(team == 1 ? playerScores.team1 : playerScores.team2)[index]"
                            @input="e => (team == 1 ? playerScores.team1 : playerScores.team2)[index] = (e.target as HTMLInputElement).value"
                        />
                    </div>

                    <div class="flex justify-center mt-3 mb-7">
                        <div
                            class="cursor-pointer bg-[var(--main-color)] text-white flex justify-center items-center w-[50px] h-[50px] rounded-full mx-[15px]"
                            @click="addPlayerSlot(team as 1 | 2)"
                        >+</div>
                    </div>
                </div>
            </div>
        </template>

        <template #cancle>
            <div @click="$emit('cancel')">{{ cancelLabel }}</div>
        </template>

        <template #confirm>
            <div @click="handleConfirm">{{ confirmLabel }}</div>
        </template>

        <template #loading v-if="loading">
            <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white/70 z-10">
                <ProgressSpinner strokeWidth="4" />
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import Modal from '@/components/shared/Modal.vue';
import PlayerSearchAutoComplete from '@/components/shared/PlayerSearchAutoComplete.vue';
import ProgressSpinner from 'primevue/progressspinner';

export interface TeamEntryData {
    team1: { name: string; score: number }[];
    team2: { name: string; score: number }[];
}

const props = defineProps({
    title: { type: String, default: 'Teams eintragen' },
    confirmLabel: { type: String, default: 'Weiter' },
    cancelLabel: { type: String, default: 'Abbrechen' },
    showScore: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
});

const emit = defineEmits<{
    confirm: [data: TeamEntryData];
    cancel: [];
}>();

const ammountOfPlayersTeam1 = ref(1);
const ammountOfPlayersTeam2 = ref(1);

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

const handleConfirm = () => {
    const data: TeamEntryData = {
        team1: playerNames.team1.map((name, i) => ({
            name: name.trim(),
            score: parseFloat(playerScores.team1[i] || '0')
        })),
        team2: playerNames.team2.map((name, i) => ({
            name: name.trim(),
            score: parseFloat(playerScores.team2[i] || '0')
        }))
    };
    emit('confirm', data);
};
</script>

<style scoped>
.team-modal-autocomplete {
    width: 250px;
    position: relative;
}
.team-modal-autocomplete :deep(.p-inputtext) {
    width: 100%;
    height: 50px;
    padding: 0px 20px;
    font-size: 14px;
}

/* Remove number input arrows */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type=number] {
    -moz-appearance: textfield;
    appearance: textfield;
}

@media (width <= 900px) {
    .team-modal-autocomplete {
        width: 100%;
        padding: 0px 4px;
    }
}
</style>
