<script setup lang="ts">
import { PropType, ref } from "vue"
import Modal from '@/components/shared/Modal.vue';
import { checkIfMatchFinished, getMatchScore } from "@/util/tournamentMatchFunctions";

const props = defineProps({
    match: {type: Object as PropType<Match>, required: true },
    setGameResult: {type: Function as PropType<(match:Match) => void> },
    toggleModal: {type: Function, required: true },
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

<template>
    <Modal>
        <template #title>Ergebnis eintragen</template>

        <template #template>
            <div class="rt-modal-container">
                
                <div v-for="(team, teamIndex) in [copiedMatch.team1, copiedMatch.team2]" class="rt-modal-main">

                    <!-- Header - Team Name + Team Score -->
                    <div class="rt-modal-team">
                        <div class="rt-modal-team-name" :style="{ textAlign: teamIndex === 0 ? 'right' : 'left' }">{{ getTeamName(team) }}</div>
                        <div class="rt-modal-team-score" :style="{ order: teamIndex === 0 ? 0 : -1 }">{{ getMatchScore(copiedMatch, teamIndex == 0) }}</div>
                    </div>

                    <!-- Players - Player Name + Player Score -->
                    <div v-for="player in team.players" class="rt-modal-player">
                        <div :style="{ textAlign: teamIndex === 0 ? 'right' : 'left' }">{{ player.name }}</div>
                        <input type="number" v-model="player.score" placeholder="0" :style="{ order: teamIndex === 0 ? 0 : -1 }"> 
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

<style scoped>
.rt-modal-container{
   display: flex;
   justify-content: center;
}
.rt-modal-main{
    width: 50%;
}
.rt-modal-team{
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
    margin: 20px 0;
}
.rt-modal-team-name{
    flex: 1;
    white-space: nowrap;
}
.rt-modal-team div{
    font-size: 20px;
}
.rt-modal-team-score{
    width: 50px;
    text-align: center;
    margin: 0 10px;
}
.rt-modal-player{
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}
.rt-modal-player div{
    flex: 1;
}
.rt-modal-player input, .rt-modal-team input{
   width: 50px;
   margin: 0px 10px;
   text-align: center;
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
