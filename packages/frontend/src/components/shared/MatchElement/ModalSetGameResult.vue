
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

        <!-- Button 2 -->
        <template #confirm>
            <div @click="setResult()">{{ checkIfMatchFinished(copiedMatch) ? 'Bearbeiten' : 'Eintragen' }}</div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import { checkIfMatchFinished, getMatchScore } from "@/util/tournamentMatchFunctions";

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    setGameResult: {type: Function as PropType<(match:Match) => void> },
    toggleModal: {type: Function, required: true },
    editName: {type: Boolean, default: false},
});

// Create a copy of the match to avoid modifying the original match object directly
let copiedMatch = ref(JSON.parse(JSON.stringify(props.match)) as Match);

const setResult = () => {
    props.setGameResult!(copiedMatch.value);
    props.toggleModal();
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
/* Remove arrows from input field */
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
