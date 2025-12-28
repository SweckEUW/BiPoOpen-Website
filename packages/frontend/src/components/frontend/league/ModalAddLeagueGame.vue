<template>
    <Modal>
        <template #title>Teams auswählen</template>

        <template #template>
            <div class="alg-modal">

                <div class="w-full flex gap-[5px]">
                    <div  v-for="(player, index) in players" class="w-[50%] flex flex-col justify-center align-items-center gap-[5px]" :key="index">
                        <Select v-model="players[index]" :options="leaguePlayers" optionLabel="name" scrollHeight="300px" :placeholder="'Team ' + (index + 1)" class="w-full h-[120px]"
                            :pt="{ 
                                overlay: { style: 'width: 90%;' }, 
                                label: { style: 'display: flex; align-items: center; justify-content: center;' },
                                root: { style: '--p-select-focus-border-color: var(--main-color);' } 
                            }"
                        >
                            <template #value="slotProps">
                                <div v-if="slotProps.value" class="flex flex-col align-items-center">
                                    <img :src="slotProps.value.logo" class="w-[50px] h-[50px] object-contain" />
                                    <div class="whitespace-break-spaces text-center">{{ slotProps.value.name }}</div>
                                </div>
                                <span v-else class="w-full text-center">
                                    {{ slotProps.placeholder }}
                                </span>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <img :src="slotProps.option.logo" class="w-[50px] h-[50px] object-contain mr-2"/>
                                    <div>{{ slotProps.option.name }}</div>
                                </div>
                            </template>
                        </Select>

                        <input v-model.number="scores[index]" class="rt-modal-input-number" type="number" placeholder="0">
                    </div>                    
                </div>

                <div class="mt-[20px] mb-[20px]">
                    <div>Schiedsrichter</div>
                    <Select :options="leaguePlayers" optionLabel="name" scrollHeight="300px" :placeholder="'Schiedsrichter'" class="w-full h-[120px]"
                        :pt="{ 
                            overlay: { style: 'width: 90%;' }, 
                            label: { style: 'display: flex; align-items: center; justify-content: center;' },
                            root: { style: '--p-select-focus-border-color: var(--main-color);' } 
                        }"
                    >
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex flex-col align-items-center">
                                <img :src="slotProps.value.logo" class="w-[50px] h-[50px] object-contain" />
                                <div class="whitespace-break-spaces text-center">{{ slotProps.value.name }}</div>
                            </div>
                            <span v-else class="w-full text-center">
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex align-items-center">
                                <img :src="slotProps.option.logo" class="w-[50px] h-[50px] object-contain mr-2"/>
                                <div>{{ slotProps.option.name }}</div>
                            </div>
                        </template>
                    </Select>
                </div>
            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="toggleModalAddGame();">Abbrechen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="addGame();" :style="{ opacity: players[0] && players[1] ? 1 : 0.3, pointerEvents: players[0] && players[1] ? 'auto' : 'none' }">Eintragen</div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/shared/Modal.vue';
import Select from 'primevue/select';
import { PropType, ref } from 'vue';
import { addLeagueGame } from './LeagueUtilFunctions';

const props = defineProps({
    leaguePlayers: {type: Array as () => LeaguePlayer[], required: true },
    toggleModalAddGame: {type: Function, required: true },
    setMatch: {type: Function as PropType<(match:Match) => void>, required: true },
    getLeagueGames: {type: Function, required: true }
});

const players = ref<(LeaguePlayer | null)[]>([null, null]);
const scores = ref<[number, number]>([0, 0]);

const addGame = async () => {
    let match:Match = {
        _id: "placeholder",
        time: new Date().getTime(),
        team1: {
            _id: "placeholder",
            players: [
                {
                    _id: "placeholder",
                    name: players.value[0]?.name || "",
                    score: scores.value[0]
                }
            ]
        },
        team2: {
            _id: "placeholder",
            players: [
                {
                    _id: "placeholder",
                    name: players.value[1]?.name || "",
                    score: scores.value[1]
                }
            ]
        }
    }

    let success = await addLeagueGame(match);
    if(success){
        await props.getLeagueGames();
        props.toggleModalAddGame();
    }
}

const startBiPoKnecht = async () => {
    let match:Match = {
        _id: "placeholder",
        team1: {
            _id: "placeholder",
            players: [
                {
                    _id: "placeholder",
                    name: players.value[0]?.name || "",
                    score: 0
                },
                {
                    _id: "placeholder",
                    name: players.value[0]?.name || "",
                    score: 0
                },
            ]
        },
        team2: {
            _id: "placeholder",
            players: [
                {
                    _id: "placeholder",
                    name: players.value[1]?.name || "",
                    score: 0
                },
                {
                    _id: "placeholder",
                    name: players.value[1]?.name || "",
                    score: 0
                }
            ]
        }
    }

    props.setMatch(match);
}
</script>

<style scoped>
:deep(.mo-container){
    margin-bottom: 50px;
}

.rt-modal-input-number{
    text-align: center;
    margin: 0px 10px;
    width: 50px;
    height: 50px;
    order: 2;
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
