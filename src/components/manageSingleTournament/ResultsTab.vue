<script setup lang="ts">
import axios from "axios";
import {ref} from "vue"

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament'])

const clearInputs = () => {
   team1Player1Score = ref();
   team1Player2Score = ref();
   team2Player1Score = ref();
   team2Player2Score = ref();
}

let selectedMatch = ref();
let team1Player1Score = ref();
let team1Player2Score = ref();
let team2Player1Score = ref();
let team2Player2Score = ref();

let showModal = ref(false);
const toggleModal = (match?:any) => {
   clearInputs();

   if(match){
      selectedMatch.value = match;
      if(match.result){
         team1Player1Score.value = match.result.team1Player1Score;
         team1Player2Score.value = match.result.team1Player2Score;
         team2Player1Score.value = match.result.team2Player1Score;
         team2Player2Score.value = match.result.team2Player2Score;
      }
   }
      
   showModal.value = !showModal.value;
}

const setGameResult = async () => {

   let result = {
      team1Score: (team1Player1Score ? team1Player1Score.value : 0) + (team1Player2Score ? team1Player2Score.value : 0),
      team1Player1Score: team1Player1Score.value, 
      team1Player2Score: team1Player2Score.value, 

      team2Score: (team1Player2Score ? team2Player1Score.value : 0) + (team2Player2Score ? team2Player2Score.value : 0),
      team2Player1Score: team2Player1Score.value, 
      team2Player2Score: team2Player2Score.value
   }
   let matches = props.tournament.groupPhase.matches;

   // Find selectedMatch in matches and add result 
   for (let i = 0; i < matches.length; i++) {
      for (let x = 0; x < matches[i].length; x++) {
         let match = matches[i][x];
         if(match == selectedMatch.value){
            matches[i][x] = selectedMatch.value;
            matches[i][x].result = result;
         }
      }
   }

   let response = await axios.post("/setMatches", {tournamentID: props.tournament._id, matches: matches});
   console.log(response.data.message);
   if(response.data.success){
      props.getTournament();
      toggleModal();
   }     
}
</script>

<template>
   <div class="ResultsTab">
      
      <Transition name="fade">
            <Modal v-if="showModal">
                <template #title>Ergebnis eintragen</template>
                <template #template>
                     <div class="rt-modal-container">

                        <div class="rt-modal-main">
                           <div class="rt-modal-team">{{selectedMatch.team1.name}}</div>
                           <div class="rt-modal-result">{{ (team1Player1Score ?  team1Player1Score : 0) + (team1Player2Score ?  team1Player2Score : 0) }}</div>
                           <div class="rt-modal-result">{{ (team2Player1Score ?  team2Player1Score : 0) + (team2Player2Score ?  team2Player2Score : 0) }}</div>
                           <div class="rt-modal-team">{{selectedMatch.team2.name}}</div>
                        </div>

                        <div class="rt-modal-players">
                           <div>
                              <div style="display: flex; margin-bottom: 10px;">
                                 <div class="rt-modal-player" style="text-align: right;">{{ selectedMatch.team1.players[0] }}</div>
                                 <input class="rt-modal-input" type="number" min="0" max="10" v-model="team1Player1Score">
                              </div>
                              <div style="display: flex;">
                                 <div class="rt-modal-player" style="text-align: right;">{{ selectedMatch.team1.players[1] }}</div>
                                 <input class="rt-modal-input" type="number" min="0" max="10" v-model="team1Player2Score">
                              </div>
                           </div>

                           <div>
                              <div style="display: flex; margin-bottom: 10px;">
                                 <input class="rt-modal-input" type="number" min="0" max="10" v-model="team2Player1Score">
                                 <div class="rt-modal-player">{{ selectedMatch.team2.players[0] }}</div>  
                              </div>
                              <div style="display: flex;">
                                 <input class="rt-modal-input" type="number" min="0" max="10" v-model="team2Player2Score">
                                 <div class="rt-modal-player">{{ selectedMatch.team2.players[1] }}</div>
                              </div>
                           </div>
                        </div>

                     </div>
                </template>
                <template #cancle>
                    <div @click="toggleModal()">Abbrechen</div>
                </template>
                <template #confirm>
                    <div @click="setGameResult()">Eintragen</div>
                </template>
            </Modal>
        </Transition>

      <div class="rt-table" v-for="tableIndex in props.tournament?.groupPhase?.settings.fixedGroupAmmount" :key="tableIndex">
         <div>{{ "Tisch " +  tableIndex}}</div>
         <div class="rt-group">
            <div v-for="(match,matchIndex) in props.tournament?.groupPhase.matches[tableIndex-1]" :key="props.tournament?.groupPhase.matches[tableIndex-1][matchIndex]">
               <div class="rt-team" :style="{'color': match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{ match.team1.name }}</div>
               <div class="bp-button rt-button" v-if="!match.result" @click="toggleModal(match)">Eintragen</div>
               <div class="bp-button rt-button rt-result" v-else @click="toggleModal(match)">{{ match.result.team1Score + " - " + match.result.team2Score }}</div>
               <div class="rt-team" :style="{'color': match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{ match.team2.name }}</div>
            </div>
         </div>
      </div>

   </div>
</template>

<style scoped>
.rt-modal-container{
   margin-bottom: 20px;
}
.rt-modal-main{
   display: flex;
   margin-bottom: 20px;
}
.rt-modal-result{
   width: 50px;
   margin: 0px 5px;
   text-align: center;
}
.rt-modal-input{
   width: 50px;
   margin: 0px 5px;
   text-align: center;
}
.rt-modal-team{
   width: 200px;
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

.rt-table{
   border: 1px solid black;
   margin-bottom: 20px;
}
.rt-group{
   width: 100%;
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   margin-top: -22px;
}
.rt-team{
   display: inline-block;
   width: 200px;
   text-align: left;
}
.rt-team:first-child{
   text-align: right;
}
.rt-button{
   display: inline-block;
   width: 130px;
   height: 40px;
   margin: 3px 20px;
   padding: 7px 10px;
   border: none;
}
.rt-result{
   background: transparent !important;
   color: black;
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
