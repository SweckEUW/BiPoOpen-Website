<script setup lang="ts">
import { getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

import MatchElement from '@/components/shared/MatchElement.vue';

defineProps(['tournament'])
</script>

<template>
   <div class="ScheduleKO">

      <div class="gsk-matches">
         <div v-for="(stage,i) in getMatchesKOPhase(tournament)" :key="i">
            <div class="gsk-round">{{ "Runde " + (i + 1) }}</div>
            <div class="gsk-stage">
               <div class="gsk-match" v-for="(match,x) in stage" :key="x">
                  <div class="gsk-match-table">{{ "Tisch " + (x + 1) }}</div>
                  <MatchElement :match="match" :index="i" :isBackend="false"/>
               </div>
            </div>
         </div>
      </div>

   </div>
</template>

<style scoped>
.gsk-matches{
   display: flex;
   flex-direction: row;
   overflow-x: scroll;
   overflow-y: hidden;
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
   margin-bottom: 5px;
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
