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
}, 1000);

onUnmounted(() => {
    clearInterval(updateInterval);
});
</script>

<template>
    <div>
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
               <td :style="{'background' : match.result ? match.result.team1 > match.result.team2 ? 'green' : 'red' : ''}">{{match.team1.name}}</td>
               <td v-if="!match.result">{{"vs"}}</td>
               <td v-else>{{match.result.team1 + " - " + match.result.team2}}</td>
               <td :style="{'background' : match.result ? match.result.team2 > match.result.team1 ? 'green' : 'red' : ''}">{{match.team2.name}}</td>
            </tr>
         </tbody>
      </table>
    </div>
</template>

<style scoped>
</style>