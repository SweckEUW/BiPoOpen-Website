<script setup lang="ts">
import {ref} from "vue"
import { setGameResultKOPhase, getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament'])

const setResult = async () => {
   await setGameResultKOPhase(props.tournament, selectedMatch.value, team1Player1Score.value, team1Player2Score.value, team2Player1Score.value, team2Player2Score.value);
   toggleModal();
}

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
</script>

<template>
   <div class="GameScheduleKO">

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
               <div @click="setResult()">Eintragen</div>
            </template>
         </Modal>
      </Transition>

      <div class="gsk-matches">
         <div v-for="(stage,i) in getMatchesKOPhase(props.tournament)" :key="i">
            <div class="gsk-round">{{ "Runde " + (i + 1) }}</div>
            <div class="gsk-stage">
               <div class="gsk-match" v-for="(match,x) in stage" :key="x">

                  <div class="gsk-match-table">{{ "Tisch " + (x + 1) }}</div>

                  <div class="gsk-match-container">
                     <div class="gsk-match-team" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                        <div v-if="!match.team1" style="margin-top: 25px;">{{ match.placeHolderTeam1 }}</div>
                        <div v-else>
                           <div>{{match.team1.name}}</div>
                           <div v-for="player in match.team1.players" :key="player">{{ player }}</div>
                        </div>
                     </div>
                     <div v-if="!match.result && match.team1 && match.team2" @click="toggleModal(match)">
                        <div class="bp-button gsk-button">Eintragen</div>
                     </div>
                     <div v-else-if="!match.result" style="margin-top: 25px; padding: 20px;" >vs.</div>
                     <div class="gsk-result" v-else @click="toggleModal(match)" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'linear-gradient(90deg, var(--result-green), var(--result-red))' : 'linear-gradient(90deg, var(--result-red), var(--result-green))' : ''}">
                        <div>{{match.result.team1Score + " - " + match.result.team2Score}}</div>
                        <div>{{match.result.team1Player1Score + " - " + match.result.team2Player1Score}}</div>
                        <div>{{match.result.team1Player2Score + " - " + match.result.team2Player2Score}}</div>
                     </div>
                     <div class="gsk-match-team" :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                        <div v-if="!match.team2" style="margin-top: 25px;">{{ match.placeHolderTeam2 }}</div>
                        <div v-else>
                           <div>{{match.team2.name}}</div>
                           <div v-for="player in match.team2.players" :key="player">{{ player }}</div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </div>

   </div>
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


.gsk-matches{
   display: flex;
   flex-direction: row;
}
.gsk-round{
   font-weight: bold;
   text-align: center;
   font-size: 25px;
   margin-top: 20px;
}
.gsk-stage{
   display: flex;
   flex-direction: column;
   justify-content: space-around;
   position: relative;
   height: 100%;
}
.gsk-match{
   border: 1px solid black;
   padding: 10px;
   margin: 20px;
   margin-left: 0px;
   margin-bottom: 10px;
}
.gsk-match-table{
   margin-bottom: 10px;
}
.gsk-match-container{
   display: flex;
}

.gsk-match-team{
   width: 240px;
   padding: 20px 10px;
}
.gsk-match-team:nth-child(1){
   text-align: right;
}
.gsk-match-team div:nth-child(2), .gsk-match-team div:nth-child(3), .gsk-result div{
   font-size: 14px;
   font-style: italic;
   color: rgb(87, 87, 87);
}
.gsk-match-team div:nth-child(1), .gsk-result div:nth-child(1){
   height: 25px;
   font-size: 18px;
   font-weight: bold;
   color: rgb(56, 56, 56);
   font-style: normal;
   margin-bottom: 5px;
}
.gsk-result{
   text-align: center;
   width: 100px;
   padding: 10px 10px;
   padding-top: 20px;
   font-size: 18px;
}
.gsk-button{
   width: 100px;
   font-size: 16px;
   padding: 20px 10px;
   margin: 30px 10px;
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
