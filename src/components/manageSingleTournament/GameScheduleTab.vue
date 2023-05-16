<script setup lang="ts">
import axios from "axios";
import Sortable from "sortablejs";

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
   }, 500);
}
initSortable();

const generateMatches = async () => {
   await props.getTournament();

   // Generate Matches
   let matches:any = [];
   let groups = props.tournament.groupPhase.groups;

   for (let i = 0; i < groups.length; i++) {
      let matchesForGroup = [];
      let teams = groups[i].teams;

      for (let x = 0; x < teams.length; x++){
         for (let y = x+1; y < teams.length; y++) {
            let match = {team1: teams[y], team2: teams[x]};
            matchesForGroup.push(match);
         }
      }

      if(teams.length == 3){
         let length = matchesForGroup.length;
         for (let x = 0; x < length; x++)
            matchesForGroup.push(matchesForGroup[x]);
      }

      matches.push(shuffleArray(matchesForGroup));
   }

   // Set Groups in Database
   setMatches(matches);
}

const setMatches = async (matches:any) => {
   let response = await axios.post("/setMatches", {tournamentID: props.tournament._id, matches: matches})
   console.log(response.data.message);
   if(response.data.success){
      props.getTournament();
   }     
}

const shuffleArray = (array:any) => {
   for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
   }

   return array;
}
</script>

<template>
   <div class="GameScheduleTab">

      <div class="gst-button" @click="generateMatches()">Matches Generieren</div>

      <table class="table table-hover caption-top" v-for="tableIndex in props.tournament?.groupPhase?.settings.fixedGroupAmmount" :key="tableIndex" :id="'Match-Table-' + tableIndex">
         <caption>{{ "Tisch " +  tableIndex}}</caption>
         <thead>
            <tr>
               <th>#</th>
               <th>Team 1</th>
               <th></th>
               <th>Team 2</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(match,matchIndex) in props.tournament?.groupPhase.matches[tableIndex-1]" :key="props.tournament?.groupPhase.matches[tableIndex-1][matchIndex]">
               <td scope="row">{{matchIndex+1}}</td>
               <td :style="{'color' : match.result ? match.result.team1 > match.result.team2 ? 'green' : 'red' : ''}">{{match.team1.name}}</td>
               <td v-if="!match.result">{{"vs"}}</td>
               <td v-else>{{match.result.team1 + " - " + match.result.team2}}</td>
               <td :style="{'color' : match.result ? match.result.team2 > match.result.team1 ? 'green' : 'red' : ''}">{{match.team2.name}}</td>
            </tr>
         </tbody>
      </table>

   </div>
</template>

<style scoped>
.gst-button{
   padding: 20px;
   background: purple;
   cursor: pointer;
   color: white;
   text-align: center;
   margin-bottom: 50px;
}
.gst-button:hover{
   background: rgb(80, 0, 80);
}

table {
   table-layout: fixed;
   word-wrap: break-word;
}
th:first-of-type{
   width: 100px;
}
</style>
