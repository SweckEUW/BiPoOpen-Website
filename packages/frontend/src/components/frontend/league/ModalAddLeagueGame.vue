<template>
    <Modal>
        <template #title>Teams auswählen</template>

        <template #template>
            <div class="alg-modal">

                <div class="w-full flex gap-[5px]">
                    <Select v-for="(player, index) in players" v-model="players[index]" :options="leaguePlayers" optionLabel="name" scrollHeight="300px" :placeholder="'Team ' + (index + 1)" class="w-full h-[120px]"
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
            <div @click="startBiPoKnecht()" :style="{ opacity: players[0] && players[1] ? 1 : 0.3, pointerEvents: players[0] && players[1] ? 'auto' : 'none' }">Weiter</div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/shared/Modal.vue';
import Select from 'primevue/select';
import { PropType, ref } from 'vue';

const props = defineProps({
    leaguePlayers: {type: Array as () => LeaguePlayer[], required: true },
    toggleModalAddGame: {type: Function, required: true },
    setMatch: {type: Function as PropType<(match:Match) => void>, required: true }
});

const players = ref<(LeaguePlayer | null)[]>([null, null]);

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
</style>
