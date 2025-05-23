<script setup lang="ts">
import { ref, onMounted, PropType } from "vue"
import { setGameResultGroupPhase, setGameResultKOPhase } from "@/util/tournamentUtilFunctions.js";

import Modal from '@/components/shared/Modal.vue';

const props = defineProps({
    getTournament: {type: Function, required: true },
    tournament: {type: Object as PropType<Tournament>, required: true },
    isGroupPhase: {type: Boolean, required: true },
    toggleModal: {type: Function, required: true },
    match: {type: Object as PropType<MatchDecoded>, required: true },
});

const setResultGroupPhase = async () => {
    let result:MatchResult = {
        team1Score: (team1Player1Score.value ? team1Player1Score.value : 0) + (team1Player2Score.value ? team1Player2Score.value : 0),
        team1Player1Score: team1Player1Score.value!, 
        team1Player2Score: team1Player2Score.value!, 
    
        team2Score: (team2Player1Score.value ? team2Player1Score.value : 0) + (team2Player2Score.value ? team2Player2Score.value : 0),
        team2Player1Score: team2Player1Score.value!, 
        team2Player2Score: team2Player2Score.value!
    }

    if(!props.tournament.settings.trackPlayerShots){
        result = {
            team1Score: team1Score.value!,
            team2Score: team2Score.value!
        }
    }

    await setGameResultGroupPhase(props.tournament, props.match._id, result);
    await props.getTournament();
    props.toggleModal();
}

const setResultKOPhase = async () => {
    let result:MatchResult = {
       team1Score: (team1Player1Score.value ? team1Player1Score.value : 0) + (team1Player2Score.value ? team1Player2Score.value : 0),
       team1Player1Score: team1Player1Score.value!, 
       team1Player2Score: team1Player2Score.value!, 
 
       team2Score: (team2Player1Score.value ? team2Player1Score.value : 0) + (team2Player2Score.value ? team2Player2Score.value : 0),
       team2Player1Score: team2Player1Score.value!, 
       team2Player2Score: team2Player2Score.value!
    }

    if(!props.tournament.settings.trackPlayerShots){
        result = {
            team1Score: team1Score.value!,
            team2Score: team2Score.value!
        }
    }

    await setGameResultKOPhase(props.tournament, props.match._id, result);
    await props.getTournament();
    props.toggleModal();
}

let team1Score = ref<number>();
let team1Player1Score = ref<number>();
let team1Player2Score = ref<number>();

let team2Score = ref<number>();
let team2Player1Score = ref<number>();
let team2Player2Score = ref<number>();

onMounted(() => {
    if(props.match.result){
        team1Score.value =  props.match.result.team1Score;
        team1Player1Score.value = props.match.result.team1Player1Score;
        team1Player2Score.value = props.match.result.team1Player2Score;

        team2Score.value =  props.match.result.team2Score;
        team2Player1Score.value = props.match.result.team2Player1Score;
        team2Player2Score.value = props.match.result.team2Player2Score;
   }
})

const clearInputs = () => {
    team1Score = ref<number>();
    team1Player1Score = ref<number>();
    team1Player2Score = ref<number>();

    team2Score = ref<number>();
    team2Player1Score = ref<number>();
    team2Player2Score = ref<number>();
}
</script>

<template>
    <Modal>
        <template #title>Ergebnis eintragen</template>
        <template #template>
            <div class="rt-modal-container">

                <div class="rt-modal-main" v-if="tournament.settings.trackPlayerShots">
                    <div class="rt-modal-team">{{ match.team1.name }}</div>
                    <div class="rt-modal-result">{{ (team1Player1Score ?  team1Player1Score : 0) + (team1Player2Score ?  team1Player2Score : 0) }}</div>
                    <div class="rt-modal-result">{{ (team2Player1Score ?  team2Player1Score : 0) + (team2Player2Score ?  team2Player2Score : 0) }}</div>
                    <div class="rt-modal-team">{{ match.team2.name }}</div>
                </div>

                <div class="rt-modal-main" v-else>
                    <div class="rt-modal-team">{{ match.team1.name }}</div>
                    <input class="rt-modal-input" type="number" min="0" max="10" v-model="team1Score" placeholder="0">
                    <input class="rt-modal-input" type="number" min="0" max="10" v-model="team2Score" placeholder="0">
                    <div class="rt-modal-team">{{ match.team2.name }}</div>
                </div>

                <div class="rt-modal-players" v-if="tournament.settings.trackPlayerShots">
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
            <div @click="isGroupPhase ? setResultGroupPhase(): setResultKOPhase();">{{ match.result ? 'Bearbeiten' : 'Eintragen' }}</div>
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

/*MOBILE*/
@media (width <= 900px){
    .rt-modal-player, .rt-modal-team{
        white-space: break-spaces;
    }
}
</style>
