<script setup lang="ts">
import { ref, onMounted } from "vue"
import { setGameResultGroupPhase, setGameResultKOPhase } from "@/util/tournamentUtilFunctions.js";

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament',"toggleModal","match","isGroupPhase"])

const setResultGroupPhase = async () => {
    await setGameResultGroupPhase(props.tournament, props.match._id, team1Player1Score.value, team1Player2Score.value, team2Player1Score.value, team2Player2Score.value);
    await props.getTournament();
    props.toggleModal();
}

const setResultKOPhase = async () => {
    await setGameResultKOPhase(props.tournament, props.match._id, team1Player1Score.value, team1Player2Score.value, team2Player1Score.value, team2Player2Score.value);
    await props.getTournament();
    props.toggleModal();
}

const clearInputs = () => {
    team1Player1Score = ref();
    team1Player2Score = ref();
    team2Player1Score = ref();
    team2Player2Score = ref();
}

let team1Player1Score = ref();
let team1Player2Score = ref();
let team2Player1Score = ref();
let team2Player2Score = ref();

onMounted(() => {
    if(props.match && props.match.result){
        team1Player1Score.value = props.match.result.team1Player1Score;
        team1Player2Score.value = props.match.result.team1Player2Score;
        team2Player1Score.value = props.match.result.team2Player1Score;
        team2Player2Score.value = props.match.result.team2Player2Score;
   }
});
</script>

<template>
    <Modal>
        <template #title>Ergebnis eintragen</template>
        <template #template>
            <div class="rt-modal-container">

                <div class="rt-modal-main">
                    <div class="rt-modal-team">{{ match.team1.name }}</div>
                    <div class="rt-modal-result">{{ (team1Player1Score ?  team1Player1Score : 0) + (team1Player2Score ?  team1Player2Score : 0) }}</div>
                    <div class="rt-modal-result">{{ (team2Player1Score ?  team2Player1Score : 0) + (team2Player2Score ?  team2Player2Score : 0) }}</div>
                    <div class="rt-modal-team">{{ match.team2.name }}</div>
                </div>

                <div class="rt-modal-players">
                    <div>
                        <div style="display: flex; margin-bottom: 10px;">
                            <div class="rt-modal-player" style="text-align: right;">{{ match.team1.players[0] }}</div>
                            <input class="rt-modal-input" type="number" min="0" max="10" v-model="team1Player1Score" placeholder="0">
                        </div>
                        <div style="display: flex;">
                            <div class="rt-modal-player" style="text-align: right;">{{ match.team1.players[1] }}</div>
                            <input class="rt-modal-input" type="number" min="0" max="10" v-model="team1Player2Score" placeholder="0">
                        </div>
                    </div>

                    <div>
                        <div style="display: flex; margin-bottom: 10px;">
                            <input class="rt-modal-input" type="number" min="0" max="10" v-model="team2Player1Score" placeholder="0">
                            <div class="rt-modal-player">{{ match.team2.players[0] }}</div>  
                        </div>
                        <div style="display: flex;">
                            <input class="rt-modal-input" type="number" min="0" max="10" v-model="team2Player2Score" placeholder="0">
                            <div class="rt-modal-player">{{ match.team2.players[1] }}</div>
                        </div>
                    </div>
                </div>

            </div>
        </template>

        <!-- Button 1 -->
        <template #cancle>
            <div @click="clearInputs(); toggleModal();">Abbrechen</div>
        </template>

        <!-- Button 2 -->
        <template #confirm>
            <div @click="isGroupPhase ? setResultGroupPhase(): setResultKOPhase();">Eintragen</div>
        </template>
    </Modal>
</template>

<style scoped>
.rt-modal-container{
   margin-bottom: 20px;
   white-space: nowrap;
}
.rt-modal-main{
   display: flex;
   margin-bottom: 20px;
   font-weight: bold;
}
.rt-modal-result{
   width: 50px;
   margin: 0px 10px;
   text-align: center;
}
.rt-modal-input{
   width: 50px;
   margin: 0px 10px;
   text-align: center;
}
.rt-modal-team{
   width: 280px;
   font-size: 20px;
}
.rt-modal-team:first-child{
   text-align: right;
}
.rt-modal-players{
   display: flex;
   justify-content: center;
}
.rt-modal-player{
   width: 200px;
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
