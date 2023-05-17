<script setup lang="ts">
import axios from "axios";
import {ref} from "vue"
import Sortable from "sortablejs";
import {onMounted} from "vue"

import Modal from '@/components/shared/Modal.vue';

const props = defineProps(['getTournament','tournament'])

const onDragEnd = async (evt:any) => {
   let tmp = props.tournament.groupPhase.matches;
   let matches = tmp;
   let groupIndex = parseInt(evt.srcElement.parentElement.getElementsByTagName("caption")[0].innerText.split(" ")[1]) - 1;
   let matchesInGroup = matches[groupIndex];
   let movedMatch = matchesInGroup.splice(evt.oldIndex,1);
   matchesInGroup.splice(evt.newIndex, 0, movedMatch[0]);

   setMatches(matches);
}

const initSortable = () => {
   let groupAmmount:number = props.tournament.groupPhase.settings.fixedGroupAmmount;
   for (let i = 1; i < groupAmmount+1; i++){
      let groupDOM:any = document.getElementById("Match-Table-"+i);
      let tbody:any = groupDOM?.getElementsByTagName("tbody")[0];
      new Sortable(tbody, {
         animation: 150,
         group: "_" + i ,
         onEnd: onDragEnd,
      });
   }
}

onMounted(() => {
   setTimeout(() => { initSortable() }, 0);
});

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

   await setMatches(matches);
   toggleModal();  
}

const setMatches = async (matches:any) => {
   let response = await axios.post("/setMatches", {tournamentID: props.tournament._id, matches: matches})
   console.log(response.data.message);
   if(response.data.success){
      props.getTournament();
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

      <table class="table table-hover caption-top" v-for="tableIndex in tournament?.groupPhase?.settings.fixedGroupAmmount" :key="tableIndex" :id="'Match-Table-'+tableIndex">
         <caption>{{ "Tisch " +  tableIndex}}</caption>
         <thead>
            <tr>
               <th>#</th>
               <th>Team 1</th>
               <th>vs.</th>
               <th>Team 2</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(match,matchIndex) in tournament?.groupPhase.matches[tableIndex-1]" :key="tournament?.groupPhase.matches[tableIndex-1][matchIndex]">
               <td>{{ matchIndex + 1 }}</td>
               <td :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                  <div>{{match.team1.name}}</div>
                  <div v-for="player in match.team1.players">{{ player }}</div>
               </td>
               <td v-if="!match.result" @click="toggleModal(match)">
                  <div class="bp-button rt-button">Eintragen</div>
               </td>
               <td class="rt-result" v-else @click="toggleModal(match)">
                  <div>{{match.result.team1Score + " - " + match.result.team2Score}}</div>
                  <div>{{match.result.team1Player1Score + " - " + match.result.team2Player1Score}}</div>
                  <div>{{match.result.team1Player2Score + " - " + match.result.team2Player2Score}}</div>
               </td>
               <td :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                  <div>{{match.team2.name}}</div>
                  <div v-for="player in match.team2.players">{{ player }}</div>
               </td>
            </tr>
         </tbody>
      </table>

      <!-- <div class="rt-table" v-for="tableIndex in props.tournament?.groupPhase?.settings.fixedGroupAmmount" :key="tableIndex">
         <div>{{ "Tisch " +  tableIndex}}</div>
         <div class="rt-group">
            <div v-for="(match,matchIndex) in props.tournament?.groupPhase.matches[tableIndex-1]" :key="props.tournament?.groupPhase.matches[tableIndex-1][matchIndex]">
               <div class="rt-team" :style="{'color': match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{ match.team1.name }}</div>
               <div class="bp-button rt-button" v-if="!match.result" @click="toggleModal(match)">Eintragen</div>
               <div class="bp-button rt-button rt-result" v-else @click="toggleModal(match)">{{ match.result.team1Score + " - " + match.result.team2Score }}</div>
               <div class="rt-team" :style="{'color': match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{ match.team2.name }}</div>
            </div>
         </div>
      </div> -->

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


table{
   margin-top: 30px;
   text-align: center;
}
caption{
   font-size: 28px;
   font-weight: bold;
   color: black;
}
table th{
   font-size: 20px;
   font-weight: bold;
}
table th:nth-child(2){
   text-align: right;
}
table th:nth-child(4){
   text-align: left;
}

table td{
   width: 400px;
   max-width: 400px;
}
table td:nth-child(1){
   width: 20px;
   max-width: 20px;
}
table td:nth-child(2){
   text-align: right;
}
table td:nth-child(2) div, table td:nth-child(4) div, .rt-result{
   height: 20px;
   font-size: 14px;
   font-style: italic;
   color: rgb(87, 87, 87);
}
table td:nth-child(2) div:first-child, table td:nth-child(4) div:first-child, .rt-result div:first-child{
   height: 25px;
   font-size: 18px;
   font-weight: bold;
   color: rgb(56, 56, 56);
   font-style: normal;
   margin-bottom: 5px;
}
table td:nth-child(3){
   width: 100px;
   max-width: 100px;
   min-width: 100px;
   text-align: center;
   vertical-align: middle;
}
table td:nth-child(4){
   text-align: left;
}
.rt-button{
   margin-bottom: 0px;
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
