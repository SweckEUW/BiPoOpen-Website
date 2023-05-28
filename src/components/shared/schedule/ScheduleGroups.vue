<script setup lang="ts">
import Sortable from "sortablejs";
import { onMounted, watch } from "vue"
import { getMatchesGroupPhase, setMatchesGroupPhase, getTeamFromID } from "@/util/tournamentUtilFunctions.js";
import { convertNumberToCharacter } from "@/util/util.js"; 

import MatchElement from '@/components/shared/MatchElement.vue';

const props = defineProps(['getTournament','tournament','isBackend'])

const onDragEnd = async (evt:any) => {
   let groupCaption = evt.srcElement.parentElement.parentElement.parentElement.getElementsByClassName("rt-caption")[0].getElementsByTagName("div")[0].innerText;
   let groupIndex = groupCaption.split(" ")[1].toLowerCase().charCodeAt(0) - 97;

   let matches = props.tournament.groupPhase.matches;
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
      for (let i = 0; i < groupAmmount; i++){
         let matchesForGroupDOM:any = document.getElementById("Match-Table-"+i)?.getElementsByClassName("rt-matches")[0];
         new Sortable(matchesForGroupDOM, {
            animation: 150,
            group: "_" + i ,
            onEnd: onDragEnd,
         });
      }
   }, 0);
}

watch(() => props.tournament, () => {
   if(props.tournament.groupPhase.groups && props.isBackend)
      initSortable();
});

onMounted(() => {
   if(props.tournament && props.tournament.groupPhase.groups && props.isBackend)
      initSortable();
});
</script>

<template>
   <div class="ResultsTab">

      <div class="rt-table" v-for="(matchesForGroup ,groupIndex) in getMatchesGroupPhase(tournament)" :key="groupIndex" :id="'Match-Table-'+groupIndex">

         <!-- Caption -->
         <div class="rt-caption">
            <div>{{ "Gruppe " + convertNumberToCharacter(groupIndex + 1)}}</div>
            <div>{{ "Tisch " + (groupIndex + 1) }}</div>
         </div>

         <div class="rt-rows">

            <!-- First Row -->
            <div class="rt-row1">
               <div>#</div>
               <div>Team 1</div>
               <div>vs.</div>
               <div>Team 2</div>
            </div>

            <!-- Matches -->
            <div class="rt-matches">
               <div class="rt-match" v-for="(match, matchIndex) in matchesForGroup" :key="match">
                  <hr style="margin: 2px 0px">
                  <MatchElement :match="match" :matchIndex="matchIndex" :getTournament="getTournament" :tournament="tournament" :isGroupPhase="true" :isBackend="isBackend"/>
               </div>
            </div>

         </div>
      </div>
   </div>
</template>

<style scoped>
.rt-table{
   margin-top: 50px;
}
.rt-caption{
   margin-bottom: 10px;
}
.rt-caption div:nth-child(1){
   font-size: 28px;
   font-weight: bold;
   color: black;
}
.rt-caption div:nth-child(2){
   font-size: 20px;
   color: rgb(77, 77, 77);
}
.rt-rows{
   display: flex;
   flex-direction: column;
   align-items: center;
}
.rt-row1{
   display: flex;
   width: 100%;
   text-align: center;
   font-weight: bold;
   font-size: 20px;
   margin-bottom: 5px;
}
.rt-row1 div:nth-child(1){
   width: 40px; /* same width as .mt-index from MatchElement.vue */
}
.rt-row1 div:nth-child(2){
   text-align: right;
}
.rt-row1 div:nth-child(2), .rt-row1 div:nth-child(4){
   flex-grow: 1;
}
.rt-row1 div:nth-child(3){
   width: 110px; /* same width as .mt-result from MatchElement.vue */
}
.rt-row1 div:nth-child(4){
   text-align: left;
}
.rt-matches{
   width: 100%;
}

/*MOBILE*/
@media (width <= 900px){
   .rt-row1{
      font-size: 16px;
   }
   .rt-row1 div:nth-child(1){
      display: none;
   }
}
</style>
