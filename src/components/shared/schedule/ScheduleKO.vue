<script setup lang="ts">
import { getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

import MatchElement from '@/components/shared/MatchElement.vue';

defineProps(['getTournament','tournament','isBackend'])

const getStageText = (games:number) => {
   if(games == 8)
      return "Achtelfinale"
   if(games == 4)
      return "Viertelfinale"
   if(games == 2)
      return "Halbfinale"
   if(games == 1)
      return "Finale"
}
</script>

<template>
   <div class="GameScheduleKO">
         <div v-for="(stage, stageIndex) in getMatchesKOPhase(tournament)" :key="stageIndex" class="test123">
            <div class="gsk-round">{{ getStageText(stage.length) }}</div>
            <div class="gsk-stage" :class="{'gsk-stage1': stageIndex == 0}">
               <div class="gsk-match" v-for="(match, matchIndex) in stage" :key="matchIndex">
                  <div class="gsk-match-table">{{ "Tisch " + (matchIndex + 1) }}</div>
                  <MatchElement class="gsk-matchElement" :class="{'gsk-matchElement-stage1': stageIndex == 0}" :match="match" :stageIndex="stageIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="false" :isBackend="isBackend"/>
               </div>
            </div>
         </div>
   </div>
</template>

<style scoped>
.GameScheduleKO{
   overflow-x: scroll;
   overflow-y: hidden;
   display: flex;
}
.test123{
   flex: 1;
   display: flex;
   flex-direction: column;
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
   flex: 1;
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
.gsk-matchElement{
   width: 600px; 
   height: 90px;
}
.gsk-matchElement-stage1{
   height: 115px;
}

/*MOBILE*/
@media (width <= 900px){
   .gsk-matchElement{
      width: 90vw; /* 2PX Border*/
      height: 125px;
   }
   .gsk-match{
      padding: 5px;
      margin: 5px;
      margin-top: 0px;
      margin-left: 0px;
   }
   .gsk-matchElement-stage1{
      height: 140px;
   }
   .gsk-stage1 .gsk-match:nth-child(even){
      margin-bottom: 40px;
   }
}
</style>
