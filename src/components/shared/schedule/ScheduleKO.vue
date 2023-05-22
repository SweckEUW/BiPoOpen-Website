<script setup lang="ts">
import { getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

import MatchElement from '@/components/shared/MatchElement.vue';

defineProps(['getTournament','tournament','isBackend'])
</script>

<template>
   <div class="GameScheduleKO">
      <div class="gsk-matches">
         <div v-for="(stage, stageIndex) in getMatchesKOPhase(tournament)" :key="stageIndex">
            <div class="gsk-round">{{ "Runde " + (stageIndex + 1) }}</div>
            <div class="gsk-stage">
               <div class="gsk-match" v-for="(match, matchIndex) in stage" :key="matchIndex">
                  <div class="gsk-match-table">{{ "Tisch " + (matchIndex + 1) }}</div>
                  <MatchElement style="width: 600px; height: 115px;" :match="match" :stageIndex="stageIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="false" :isBackend="isBackend"/>
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
</style>
