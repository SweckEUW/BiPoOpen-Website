<script setup lang="ts">
import axios from "axios";
import { ref, onUnmounted } from "vue"

let tournament = ref();
const getTournament = async () => {
   let response = await axios.get("/tournaments")
   console.log(response.data.message);
   if(response.data.success){
      tournament.value = response.data.tournaments[0];
   }
}
getTournament();

let updateInterval = setInterval(() => {
   getTournament();
}, 10000);

onUnmounted(() => {
   clearInterval(updateInterval);
});
</script>

<template>
    <div class="Schedule">

      <table class="table table-hover caption-top" v-for="tableIndex in tournament?.groupPhase?.settings.fixedGroupAmmount" :key="tableIndex">
         <caption>{{ "Tisch " +  tableIndex}}</caption>
         <thead>
            <tr>
               <th>Team 1</th>
               <th></th>
               <th>Team 2</th>
            </tr>
         </thead>
         <tbody>
            <tr v-for="(match,matchIndex) in tournament?.groupPhase.matches[tableIndex-1]" :key="tournament?.groupPhase.matches[tableIndex-1][matchIndex]">
               <td :style="{'background' : match.result ? match.result.team1Score > match.result.team2Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{match.team1.name}}</td>
               <td v-if="!match.result">{{"vs"}}</td>
               <td v-else>{{match.result.team1Score + " - " + match.result.team2Score}}</td>
               <td :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">{{match.team2.name}}</td>
            </tr>
         </tbody>
      </table>
   </div>
</template>

<style scoped>
table{
   margin-bottom: 30px;
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
table th:nth-child(1){
   text-align: right;
}
table th:nth-child(3){
   text-align: left;
}

table td{
   width: 400px;
}
table td:nth-child(1){
   text-align: right;
}
table td:nth-child(2){
   width: 60px;
   text-align: center;
}
table td:nth-child(3){
   text-align: left;
}

/*MOBILE*/
@media (width <= 900px){
   table *{
      font-size: 14px;
      width: auto;
   }
   table td:nth-child(2){
      width: 150px;
   }
   caption{
      font-size: 22px;
   }
}
</style>