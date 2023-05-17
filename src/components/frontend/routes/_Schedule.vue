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

// let updateInterval = setInterval(() => {
//    getTournament();
// }, 10000);

// onUnmounted(() => {
//    clearInterval(updateInterval);
// });
</script>

<template>
    <div class="Schedule">

      <table class="table table-hover caption-top" v-for="tableIndex in tournament?.groupPhase?.settings.fixedGroupAmmount" :key="tableIndex">
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
                  <div>{{ match.team1.name }}</div>
                  <div v-for="player in match.team1.players">{{ player }}</div>
               </td>
               <td v-if="!match.result">vs.</td>
               <td v-else class="sc-result">
                  <div>{{ match.result.team1Score + " - " + match.result.team2Score }}</div>
                  <div>{{ match.result.team1Player1Score + " - " + match.result.team2Player1Score }}</div>
                  <div>{{ match.result.team1Player2Score + " - " + match.result.team2Player2Score }}</div>
               </td>
               <td :style="{'background' : match.result ? match.result.team2Score > match.result.team1Score ? 'var(--result-green)' : 'var(--result-red)' : ''}">
                  <div>{{ match.team2.name }}</div>
                  <div v-for="player in match.team2.players">{{ player }}</div>
               </td>
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
table th:nth-child(2){
   text-align: right;
}
table th:nth-child(4){
   text-align: left;
}

table td:nth-child(1){
   max-width: 20px;
   width: 20px;
}
table td:nth-child(2){
   text-align: right;
}
table td:nth-child(2) div, table td:nth-child(4) div, .sc-result{
   font-size: 14px;
   font-style: italic;
   color: rgb(66, 66, 66);
   white-space: nowrap;
}
table td:nth-child(2) div:first-child, table td:nth-child(4) div:first-child, .sc-result div:first-child{
   font-size: 18px;
   font-weight: bold;
   color: rgb(56, 56, 56);
   font-style: normal;
   margin-bottom: 5px;
   white-space: normal;
}
table td:nth-child(3){
   width: 100px;
   text-align: center;
   vertical-align: middle;
}

table td:nth-child(4){
   text-align: left;
}
/*MOBILE*/
@media (width <= 900px){
   table *{
      width: auto;
   }
   caption{
      font-size: 22px;
   }
   table td:nth-child(1), table th:nth-child(1){
      display: none;
   }
   table td:nth-child(2) div:first-child, table td:nth-child(4) div:first-child, .sc-result div:first-child{
      height: 50px;
   }
   table td:nth-child(2) div:first-child, table td:nth-child(4) div:first-child, .sc-result div:first-child{
      font-size: 16px;
   }
   table td:nth-child(2), table td:nth-child(4){
      max-width: 0px; /* Workarround */
   }
   table td:nth-child(3){
      width: 70px;
   }
}
</style>