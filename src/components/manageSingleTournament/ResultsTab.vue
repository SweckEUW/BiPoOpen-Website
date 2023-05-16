<script setup lang="ts">
import axios from "axios";
import {ref} from "vue"

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament'])

const clearInputs = () => {
   team1Score = ref();
   team2Score = ref();
}

let selectedMatch = ref();
let team1Score = ref();
let team2Score = ref();

let showModal = ref(false);
const toggleModal = (match?:any) => {
   clearInputs();

   if(match){
      selectedMatch.value = match;
      if(match.result){
         team1Score.value = match.result.team1;
         team2Score.value = match.result.team2;
      }
   }
      
   showModal.value = !showModal.value;
}

const setGameResult = async () => {

   let result = {team1: team1Score.value, team2: team2Score.value};
   console.log(result);
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
                        <div class="rt-modal-team">{{selectedMatch.team1.name}}</div>
                        <input class="rt-modal-input" type="number" min="0" max="10" v-model="team1Score">
                        <input class="rt-modal-input" type="number" min="0" max="10" v-model="team2Score">
                        <div class="rt-modal-team">{{selectedMatch.team2.name}}</div>
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
               <div class="rt-team" :style="{'color': match.result ? match.result.team1 > match.result.team2 ? 'green' : 'red' : ''}">{{ match.team1.name }}</div>
               <div class="rt-button" v-if="!match.result" @click="toggleModal(match)">Eintragen</div>
               <div class="rt-result" v-else @click="toggleModal(match)">{{ match.result.team1 + " - " + match.result.team2 }}</div>
               <div class="rt-team" :style="{'color': match.result ? match.result.team2 > match.result.team1 ? 'green' : 'red' : ''}">{{ match.team2.name }}</div>
            </div>
         </div>
      </div>

   </div>
</template>

<style scoped>
.rt-modal-container{
   display: flex;
   margin-bottom: 20px;
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
   padding: 5px 20px;
   background: purple;
   cursor: pointer;
   color: white;
   text-align: center;
   margin-bottom: 50px;
   width: 130px;
   margin: 3px 20px;
}
.rt-button:hover, .rt-result:hover{
   background: rgb(80, 0, 80);
}
.rt-result{
   display: inline-block;
   margin-bottom: 50px;
   margin: 3px 20px;
   width: 130px;
   border: 1px solid black;
   border-radius: 4px;
   background: purple;
   color: white;
   text-align: center;
   padding: 5px 20px;
   cursor: pointer;
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
