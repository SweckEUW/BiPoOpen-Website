<script setup lang="ts">
import Sortable from "sortablejs";
import { ref } from "vue"
import { onMounted } from "vue"
import { getMatchesGroupPhase, setMatchesGroupPhase, setGameResultGroupPhase } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import Modal from '@/components/shared/Modal.vue';
import { table } from "console";

const props = defineProps(['getTournament','tournament'])

const onDragEnd = async (evt:any) => {
   let matches = props.tournament.groupPhase.matches;

   let groupCaption = evt.srcElement.parentElement.getElementsByTagName("caption")[0].getElementsByTagName("div")[0];
   let groupIndex = groupCaption.innerText.split(" ")[1].toLowerCase().charCodeAt(0) - 97;

   let matchesInGroup = matches[groupIndex];
   let movedMatch = matchesInGroup.splice(evt.oldIndex,1);
   matchesInGroup.splice(evt.newIndex, 0, movedMatch[0]);
   
   let success:boolean = await setMatchesGroupPhase(props.tournament._id, matches);
   if(success){
      await props.getTournament();
      initSortable();
   }
}

const initSortable = () => {
   setTimeout(() => { 
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
   }, 0);
}

onMounted(() => {
   if(props.tournament.groupPhase.groups)
      initSortable();
});

const setResult = async () => {
   await setGameResultGroupPhase(props.tournament, selectedMatch.value, team1Player1Score.value, team1Player2Score.value, team2Player1Score.value, team2Player2Score.value);
   await props.getTournament();
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
               <div @click="setResult()">Eintragen</div>
            </template>
         </Modal>
      </Transition>

      <table class="table table-hover caption-top" v-for="tableIndex in tournament.groupPhase.settings.fixedGroupAmmount" :key="tableIndex" :id="'Match-Table-'+tableIndex">
         <caption>
            <div>{{ "Gruppe " + convertNumberToCharacter(tableIndex)}}</div>
            <div>{{ "Tisch " + tableIndex }}</div>
         </caption>
         <thead>
            <tr>
               <th>#</th>
               <th>Team 1</th>
               <th>vs.</th>
               <th>Team 2</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(match, matchIndex) in getMatchesGroupPhase(tournament)[tableIndex-1]" :key="match">

               <!-- Match Number -->
               <td :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{ matchIndex + 1 }}</td>

               <!-- Team 1 -->
               <td :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                  <div>{{match.team1.name}}</div>
                  <div v-for="player in match.team1.players" :key="player">{{ player }}</div>
               </td>

               <!-- Result -->
               <td v-if="!match.result" @click="toggleModal(match)">
                  <div class="bp-button rt-button">Eintragen</div>
               </td>
               <td class="rt-result" v-else @click="toggleModal(match)" :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'linear-gradient(90deg, var(--result-green), var(--result-red))' : 'linear-gradient(90deg, var(--result-red), var(--result-green))' : ''}">
                  <div>{{match.result.team1Score + " - " + match.result.team2Score}}</div>
                  <div>{{match.result.team1Player1Score + " - " + match.result.team2Player1Score}}</div>
                  <div>{{match.result.team1Player2Score + " - " + match.result.team2Player2Score}}</div>
               </td>

               <!-- Team 2 -->
               <td :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                  <div>{{match.team2.name}}</div>
                  <div v-for="player in match.team2.players" :key="player">{{ player }}</div>
               </td>
            </tr>
         </tbody>
      </table>

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
caption div:first-child{
   font-size: 28px;
   font-weight: bold;
   color: black;
}
caption div:nth-child(2){
   font-size: 20px;
   color: rgb(77, 77, 77);
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
   cursor: grab;
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
