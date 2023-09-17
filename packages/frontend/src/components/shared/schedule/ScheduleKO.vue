<script setup lang="ts">
import { getMatchesKOPhase } from "@/util/tournamentUtilFunctions.js";

import MatchElement from '@/components/shared/MatchElement.vue';

const props = defineProps(['getTournament','tournament','isBackend'])

const getStageText = (stageIndex:number) => {
   let ammountOfStages = props.tournament.koPhase.matches.length - 1;

   if(ammountOfStages - stageIndex == 3)
      return "Achtelfinale"
   if(ammountOfStages - stageIndex == 2)
      return "Viertelfinale"
   if(ammountOfStages - stageIndex == 1)
      return "Halbfinale"
   if(ammountOfStages - stageIndex == 0)
      return "Finale"
}
</script>

<template>
   <div class="GameScheduleKO">
         <div v-for="(stage, stageIndex) in getMatchesKOPhase(tournament)" :key="stageIndex" class="gsk-stages">
            <div class="gsk-round">{{ getStageText(stageIndex) }}</div>
            <div class="gsk-stage" :class="{'gsk-stage1': stageIndex == 0, 'gsk-finale': stageIndex == tournament.koPhase.matches.length - 1}">
               <div class="gsk-match" v-for="(match, matchIndex) in stage" :key="matchIndex">
                  <div v-if="stageIndex == tournament.koPhase.matches.length - 1" class="gsk-match-name">{{ (matchIndex == 0 ? "Finale" : "Spiel um Platz 3")}}</div>
                  <div v-if="stageIndex != tournament.koPhase.matches.length - 1" class="gsk-match-table">{{ "Tisch " + (matchIndex + 1) }}</div>
                  <MatchElement class="gsk-matchElement" :match="match" :stageIndex="stageIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="false" :isBackend="isBackend"/>
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
.gsk-stages{
   flex: 1;
   display: flex;
   flex-direction: column;
}
.gsk-round{
   font-weight: bold;
   text-align: center;
   font-size: 25px;
   margin-top: 40px;
   color: var(--main-color);
}
.gsk-stage{
   display: flex;
   flex-direction: column;
   justify-content: space-around;
   flex: 1;
}
.gsk-finale{
   justify-content: center;
}
.gsk-finale .gsk-match{
   margin-top: 50px;
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
   display: inline-block;
   color: var(--main-color);
}
.gsk-match-name{
   font-size: 18px;
   font-weight: bold;
   display: inline-block;
   white-space: break-spaces;
   color: var(--main-color);
}
.gsk-matchElement{
   width: 600px; 
   height: 90px;
}
.gsk-stage1 .gsk-matchElement{
   height: 100px;
}

/*MOBILE*/
@media (width <= 900px){
   .gsk-matchElement{
      width: 90vw;
      height: 125px;
   }
   .gsk-match{
      padding: 5px;
      margin: 5px;
      margin-top: 0px;
      margin-left: 0px;
   }
   .gsk-stage1 .gsk-matchElement{
      height: 115px;
   }
   .gsk-stage1 .gsk-match:nth-child(even){
      margin-bottom: 40px;
   }
}
</style>
